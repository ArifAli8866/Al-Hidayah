# ============================================================
#  AL-HIDAYAH — Flask Backend API
#  Ramadan Companion Web Application
#  Authors: Arif Ali (24P-0736) | Arslan Tariq (24P-0610)
# ============================================================

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import psycopg2
import psycopg2.extras
import bcrypt
import jwt
import os
import uuid
import requests
from datetime import datetime, timedelta
from functools import wraps
import anthropic  # pip install anthropic

app = Flask(__name__, static_folder='../static', template_folder='../templates')
CORS(app, supports_credentials=True)

# ─── CONFIG ────────────────────────────────────────────
DB_CONFIG = {
    "dbname":   os.getenv("DB_NAME",   "alhidayah_db"),
    "user":     os.getenv("DB_USER",   "postgres"),
    "password": os.getenv("DB_PASS",   "your_password"),
    "host":     os.getenv("DB_HOST",   "localhost"),
    "port":     os.getenv("DB_PORT",   "5432"),
}
JWT_SECRET  = os.getenv("JWT_SECRET",  "alhidayah_secret_2025")
JWT_EXPIRY  = int(os.getenv("JWT_EXPIRY", 86400))   # 1 day
CLAUDE_KEY  = os.getenv("ANTHROPIC_API_KEY", "")    # your Claude key

client_ai = anthropic.Anthropic(api_key=CLAUDE_KEY) if CLAUDE_KEY else None

# ─── DB HELPERS ───────────────────────────────────────
def get_db():
    return psycopg2.connect(**DB_CONFIG, cursor_factory=psycopg2.extras.RealDictCursor)

def db_query(sql, params=(), fetchone=False, fetchall=False, commit=False):
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(sql, params)
        result = None
        if fetchone:  result = cur.fetchone()
        if fetchall:  result = cur.fetchall()
        if commit:    conn.commit()
        return result
    finally:
        cur.close(); conn.close()

# ─── AUTH DECORATOR ────────────────────────────────────
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization','').replace('Bearer ','')
        if not token:
            return jsonify({"error":"No token"}), 401
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({"error":"Token expired"}), 401
        except Exception:
            return jsonify({"error":"Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated

def make_token(user_id):
    return jwt.encode({
        "user_id": str(user_id),
        "exp": datetime.utcnow() + timedelta(seconds=JWT_EXPIRY)
    }, JWT_SECRET, algorithm='HS256')

# ─── SERVE FRONTEND ────────────────────────────────────
@app.route('/')
def index():
    return send_from_directory('../templates', 'index.html')

@app.route('/login')
def login_page():
    return send_from_directory('../templates', 'login.html')

# ═══════════════════════════════════════════════════════
# AUTH ROUTES
# ═══════════════════════════════════════════════════════

@app.route('/api/auth/register', methods=['POST'])
def register():
    d = request.json
    required = ['full_name','email','password','city','latitude','longitude','timezone']
    if not all(d.get(k) for k in required):
        return jsonify({"error":"All fields required"}), 400

    # Check duplicate
    existing = db_query("SELECT id FROM users WHERE email=%s", (d['email'],), fetchone=True)
    if existing:
        return jsonify({"error":"Email already registered"}), 409

    pw_hash = bcrypt.hashpw(d['password'].encode(), bcrypt.gensalt()).decode()
    user_id = str(uuid.uuid4())

    db_query("""
        INSERT INTO users (id, full_name, email, password_hash, city, country,
                           latitude, longitude, timezone, calc_method)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (user_id, d['full_name'], d['email'], pw_hash,
          d['city'], d.get('country','Pakistan'),
          d['latitude'], d['longitude'], d['timezone'],
          d.get('calc_method', 1)), commit=True)

    token = make_token(user_id)
    user = db_query("SELECT id,full_name,email,city,latitude,longitude,timezone,theme FROM users WHERE id=%s",
                    (user_id,), fetchone=True)
    return jsonify({"token": token, "user": dict(user)}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    d = request.json
    user = db_query("SELECT * FROM users WHERE email=%s", (d.get('email',''),), fetchone=True)
    if not user or not bcrypt.checkpw(d.get('password','').encode(), user['password_hash'].encode()):
        return jsonify({"error":"Invalid credentials"}), 401

    db_query("UPDATE users SET last_login=NOW() WHERE id=%s", (user['id'],), commit=True)
    token = make_token(user['id'])
    safe_user = {k: user[k] for k in ['id','full_name','email','city','latitude','longitude','timezone','theme','notification_prayer','notification_sehri','notification_iftar']}
    return jsonify({"token": token, "user": safe_user})


@app.route('/api/auth/me', methods=['GET'])
@require_auth
def get_me():
    user = db_query("SELECT id,full_name,email,city,latitude,longitude,timezone,theme,calc_method FROM users WHERE id=%s",
                    (request.user_id,), fetchone=True)
    return jsonify(dict(user))

# ═══════════════════════════════════════════════════════
# PRAYER ROUTES
# ═══════════════════════════════════════════════════════

@app.route('/api/prayer/times', methods=['GET'])
@require_auth
def get_prayer_times():
    user = db_query("SELECT city, latitude, longitude, calc_method FROM users WHERE id=%s",
                    (request.user_id,), fetchone=True)
    date = request.args.get('date', datetime.now().strftime('%d-%m-%Y'))

    # Call AlAdhan API
    try:
        resp = requests.get(
            f"https://api.aladhan.com/v1/timings/{date}",
            params={
                "latitude":  user['latitude'],
                "longitude": user['longitude'],
                "method":    user['calc_method']
            }, timeout=10
        )
        data = resp.json()
        if data.get('code') == 200:
            timings = data['data']['timings']
            hijri   = data['data']['date']['hijri']
            return jsonify({
                "timings": timings,
                "hijri":   hijri,
                "city":    user['city']
            })
    except Exception as e:
        pass

    # Fallback
    return jsonify({
        "timings": {"Fajr":"05:02","Sunrise":"06:22","Dhuhr":"12:23","Asr":"15:52","Maghrib":"18:25","Isha":"19:49"},
        "hijri":   {"day":"14","month":{"en":"Ramadan"},"year":"1446"},
        "city":    user['city']
    })


@app.route('/api/prayer/log', methods=['POST'])
@require_auth
def log_prayer():
    d = request.json
    db_query("""
        INSERT INTO prayer_logs (user_id, prayer_name, prayer_date, prayed, prayed_at, is_qaza, notes)
        VALUES (%s,%s,%s,%s,NOW(),%s,%s)
        ON CONFLICT (user_id, prayer_name, prayer_date)
        DO UPDATE SET prayed=EXCLUDED.prayed, prayed_at=EXCLUDED.prayed_at,
                      is_qaza=EXCLUDED.is_qaza, notes=EXCLUDED.notes
    """, (request.user_id, d['prayer_name'], d['prayer_date'],
          d.get('prayed', True), d.get('is_qaza', False), d.get('notes','')), commit=True)
    return jsonify({"success": True})


@app.route('/api/prayer/log', methods=['GET'])
@require_auth
def get_prayer_log():
    month = request.args.get('month', datetime.now().strftime('%Y-%m'))
    logs = db_query("""
        SELECT prayer_name, prayer_date, prayed, prayed_at, is_qaza
        FROM prayer_logs
        WHERE user_id=%s AND TO_CHAR(prayer_date,'YYYY-MM')=%s
        ORDER BY prayer_date, prayer_name
    """, (request.user_id, month), fetchall=True)
    return jsonify([dict(l) for l in logs])


@app.route('/api/prayer/stats', methods=['GET'])
@require_auth
def prayer_stats():
    stats = db_query(
        "SELECT total_prayed, total_scheduled, completion_pct, qaza_count FROM v_prayer_stats WHERE user_id=%s",
        (request.user_id,), fetchone=True
    )
    return jsonify(dict(stats) if stats else {"total_prayed":0,"total_scheduled":0,"completion_pct":0,"qaza_count":0})

# ═══════════════════════════════════════════════════════
# FASTING ROUTES
# ═══════════════════════════════════════════════════════

@app.route('/api/fasting/log', methods=['POST'])
@require_auth
def log_fasting():
    d = request.json
    db_query("""
        INSERT INTO fasting_log (user_id, fast_date, ramadan_day, fasted, sehri_eaten, iftar_time, notes)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT (user_id, fast_date)
        DO UPDATE SET fasted=EXCLUDED.fasted, sehri_eaten=EXCLUDED.sehri_eaten,
                      notes=EXCLUDED.notes
    """, (request.user_id, d['fast_date'], d.get('ramadan_day',1),
          d.get('fasted',True), d.get('sehri_eaten',True),
          d.get('iftar_time'), d.get('notes','')), commit=True)
    return jsonify({"success": True})


@app.route('/api/fasting/log', methods=['GET'])
@require_auth
def get_fasting_log():
    logs = db_query("""
        SELECT fast_date, ramadan_day, fasted, sehri_eaten, notes
        FROM fasting_log WHERE user_id=%s ORDER BY fast_date
    """, (request.user_id,), fetchall=True)
    return jsonify([dict(l) for l in logs])

# ═══════════════════════════════════════════════════════
# QURAN ROUTES
# ═══════════════════════════════════════════════════════

@app.route('/api/quran/progress', methods=['GET'])
@require_auth
def get_quran_progress():
    rows = db_query("""
        SELECT surah_number, last_ayah, is_completed, last_read_at, read_count
        FROM quran_progress WHERE user_id=%s ORDER BY surah_number
    """, (request.user_id,), fetchall=True)
    return jsonify([dict(r) for r in rows])


@app.route('/api/quran/progress', methods=['POST'])
@require_auth
def update_quran_progress():
    d = request.json
    db_query("""
        INSERT INTO quran_progress (user_id, surah_number, last_ayah, total_ayahs, is_completed, last_read_at)
        VALUES (%s,%s,%s,%s,%s,NOW())
        ON CONFLICT (user_id, surah_number)
        DO UPDATE SET last_ayah=EXCLUDED.last_ayah,
                      is_completed=EXCLUDED.is_completed,
                      last_read_at=NOW(),
                      read_count=quran_progress.read_count+1
    """, (request.user_id, d['surah_number'], d['last_ayah'],
          d.get('total_ayahs'), d.get('is_completed', False)), commit=True)
    return jsonify({"success": True})


@app.route('/api/quran/surah/<int:surah_num>', methods=['GET'])
@require_auth
def get_surah(surah_num):
    """Fetch from Al-Quran Cloud API"""
    try:
        resp = requests.get(
            f"https://api.alquran.cloud/v1/surah/{surah_num}/editions/quran-uthmani,en.asad",
            timeout=10
        )
        data = resp.json()
        if data.get('code') == 200:
            return jsonify(data['data'])
    except Exception:
        pass
    return jsonify({"error": "Could not fetch surah"}), 503

# ═══════════════════════════════════════════════════════
# ZAKAT ROUTES
# ═══════════════════════════════════════════════════════

@app.route('/api/zakat/save', methods=['POST'])
@require_auth
def save_zakat():
    d = request.json
    db_query("""
        INSERT INTO zakat_records
            (user_id, calc_type, cash_amount, investments, business_goods,
             receivables, debts, gold_grams, silver_grams, gold_price_per_gram,
             silver_price_per_gram, produce_kg, irrigation_type, price_per_kg,
             family_members, food_type, currency, total_assets, net_zakatable,
             zakat_amount, nisab_met, notes)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        request.user_id, d.get('calc_type','wealth'),
        d.get('cash',0), d.get('investments',0), d.get('business_goods',0),
        d.get('receivables',0), d.get('debts',0),
        d.get('gold_grams',0), d.get('silver_grams',0),
        d.get('gold_price',0), d.get('silver_price',0),
        d.get('produce_kg',0), d.get('irrigation_type'),
        d.get('price_per_kg',0), d.get('family_members',1),
        d.get('food_type'), d.get('currency','PKR'),
        d.get('total_assets',0), d.get('net_zakatable',0),
        d.get('zakat_amount',0), d.get('nisab_met',False),
        d.get('notes','')
    ), commit=True)
    return jsonify({"success": True})


@app.route('/api/zakat/history', methods=['GET'])
@require_auth
def zakat_history():
    rows = db_query("""
        SELECT calc_type, zakat_amount, currency, nisab_met, calculated_at
        FROM zakat_records WHERE user_id=%s ORDER BY calculated_at DESC LIMIT 20
    """, (request.user_id,), fetchall=True)
    return jsonify([dict(r) for r in rows])

# ═══════════════════════════════════════════════════════
# ZAKAT CHATBOT (Claude AI)
# ═══════════════════════════════════════════════════════

@app.route('/api/chatbot/message', methods=['POST'])
@require_auth
def chatbot_message():
    d = request.json
    user_message = d.get('message','')
    session_id   = d.get('session_id')

    # Get user profile for context
    user = db_query(
        "SELECT full_name, city FROM users WHERE id=%s", (request.user_id,), fetchone=True
    )
    zakat_history = db_query("""
        SELECT calc_type, total_assets, zakat_amount, currency, calculated_at
        FROM zakat_records WHERE user_id=%s ORDER BY calculated_at DESC LIMIT 3
    """, (request.user_id,), fetchall=True)

    history_text = ""
    if zakat_history:
        history_text = "\n".join([
            f"- {r['calc_type']}: {r['currency']} {r['zakat_amount']} (on assets {r['total_assets']})"
            for r in zakat_history
        ])

    system_prompt = f"""You are Mufti AI, an Islamic finance expert embedded in Al-Hidayah, a Ramadan Companion app.
You specialize in Zakat, Ushr, Fitrana, and Islamic charitable giving according to Hanafi fiqh (used in Pakistan).

User Profile:
- Name: {user['full_name'] if user else 'User'}
- City: {user['city'] if user else 'Pakistan'}
- Recent Zakat Calculations: {history_text or 'None yet'}

Your role:
1. Answer questions about Zakat calculations, Nisab, and Islamic finance
2. Help the user understand their obligation based on their asset details
3. Reference their previous calculations when relevant
4. Be concise, friendly, and Islamic in tone
5. Always end responses with relevant Quranic references or Hadith when appropriate
6. Use PKR as default currency for Pakistani users
7. Current Nisab: ~PKR 1,920,000 (gold) or ~PKR 215,000 (silver)

Important rules:
- Never give fatwas beyond your scope — recommend consulting a local scholar for complex cases
- Keep responses under 200 words unless the question is complex
- Use bullet points for clarity"""

    # Get previous messages in session
    messages = []
    if session_id:
        prev = db_query("""
            SELECT role, content FROM chatbot_messages cm
            JOIN chatbot_sessions cs ON cs.session_id = cm.session_id
            WHERE cs.session_id=%s ORDER BY cm.sent_at
        """, (session_id,), fetchall=True)
        messages = [{"role": r['role'], "content": r['content']} for r in (prev or [])]

    messages.append({"role": "user", "content": user_message})

    # Call Claude
    try:
        if client_ai:
            response = client_ai.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=512,
                system=system_prompt,
                messages=messages
            )
            reply = response.content[0].text
        else:
            reply = "🔑 Please configure ANTHROPIC_API_KEY in your .env file to enable the AI assistant. For now: Zakat is 2.5% on net assets exceeding Nisab (~₨1.92M for gold standard)."
    except Exception as e:
        reply = f"AI service temporarily unavailable. Basic rule: Zakat = 2.5% × net_assets if net_assets ≥ Nisab. Error: {str(e)[:100]}"

    # Save to DB
    if not session_id:
        session_id = str(uuid.uuid4())
        db_query("INSERT INTO chatbot_sessions (user_id, session_id) VALUES (%s,%s)",
                 (request.user_id, session_id), commit=True)

    db_query("INSERT INTO chatbot_messages (session_id, role, content) VALUES (%s,'user',%s)",
             (session_id, user_message), commit=True)
    db_query("INSERT INTO chatbot_messages (session_id, role, content) VALUES (%s,'assistant',%s)",
             (session_id, reply), commit=True)
    db_query("UPDATE chatbot_sessions SET last_message_at=NOW() WHERE session_id=%s",
             (session_id,), commit=True)

    return jsonify({"reply": reply, "session_id": session_id})

# ═══════════════════════════════════════════════════════
# NOTIFICATION ROUTES
# ═══════════════════════════════════════════════════════

@app.route('/api/notifications', methods=['GET'])
@require_auth
def get_notifications():
    rows = db_query("""
        SELECT prayer_name, enabled, minutes_before
        FROM notification_schedule WHERE user_id=%s ORDER BY prayer_name
    """, (request.user_id,), fetchall=True)
    return jsonify([dict(r) for r in rows])


@app.route('/api/notifications', methods=['PUT'])
@require_auth
def update_notifications():
    items = request.json  # list of {prayer_name, enabled, minutes_before}
    for item in items:
        db_query("""
            UPDATE notification_schedule
            SET enabled=%s, minutes_before=%s
            WHERE user_id=%s AND prayer_name=%s
        """, (item['enabled'], item.get('minutes_before',10),
              request.user_id, item['prayer_name']), commit=True)
    return jsonify({"success": True})

# ═══════════════════════════════════════════════════════
# USER SETTINGS
# ═══════════════════════════════════════════════════════

@app.route('/api/user/settings', methods=['PUT'])
@require_auth
def update_settings():
    d = request.json
    db_query("""
        UPDATE users SET theme=%s, city=%s, latitude=%s, longitude=%s,
                         timezone=%s, calc_method=%s, language=%s
        WHERE id=%s
    """, (d.get('theme','dark'), d.get('city'), d.get('latitude'),
          d.get('longitude'), d.get('timezone'), d.get('calc_method',1),
          d.get('language','en'), request.user_id), commit=True)
    return jsonify({"success": True})


@app.route('/api/dua/favorite', methods=['POST'])
@require_auth
def toggle_dua_favorite():
    d = request.json
    existing = db_query("SELECT id FROM dua_favorites WHERE user_id=%s AND dua_key=%s",
                        (request.user_id, d['dua_key']), fetchone=True)
    if existing:
        db_query("DELETE FROM dua_favorites WHERE user_id=%s AND dua_key=%s",
                 (request.user_id, d['dua_key']), commit=True)
        return jsonify({"favorited": False})
    else:
        db_query("INSERT INTO dua_favorites (user_id, dua_key, dua_title) VALUES (%s,%s,%s)",
                 (request.user_id, d['dua_key'], d.get('title','')), commit=True)
        return jsonify({"favorited": True})


@app.route('/api/recipe/bookmark', methods=['POST'])
@require_auth
def toggle_recipe_bookmark():
    d = request.json
    existing = db_query("SELECT id FROM recipe_bookmarks WHERE user_id=%s AND recipe_name=%s",
                        (request.user_id, d['recipe_name']), fetchone=True)
    if existing:
        db_query("DELETE FROM recipe_bookmarks WHERE user_id=%s AND recipe_name=%s",
                 (request.user_id, d['recipe_name']), commit=True)
        return jsonify({"bookmarked": False})
    else:
        db_query("INSERT INTO recipe_bookmarks (user_id, recipe_name, recipe_category) VALUES (%s,%s,%s)",
                 (request.user_id, d['recipe_name'], d.get('category','')), commit=True)
        return jsonify({"bookmarked": True})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
