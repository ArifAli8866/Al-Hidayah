# ============================================================
#  AL-HIDAYAH — Flask Backend (Vercel Compatible)
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

app = Flask(__name__, static_folder='.', template_folder='.')
CORS(app, supports_credentials=True)

# ─── CONFIG ─────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "")
JWT_SECRET   = os.getenv("JWT_SECRET",   "alhidayah2025")
JWT_EXPIRY   = 86400
CLAUDE_KEY   = os.getenv("ANTHROPIC_API_KEY", "")

# ─── DB HELPERS ─────────────────────────────────────────────
def get_db():
    return psycopg2.connect(DATABASE_URL,
                            cursor_factory=psycopg2.extras.RealDictCursor)

def db_query(sql, params=(), fetchone=False, fetchall=False, commit=False):
    conn = get_db()
    cur  = conn.cursor()
    try:
        cur.execute(sql, params)
        result = None
        if fetchone:  result = cur.fetchone()
        if fetchall:  result = cur.fetchall()
        if commit:    conn.commit()
        return result
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

# ─── AUTH DECORATOR ─────────────────────────────────────────
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

# ─── SERVE FRONTEND ─────────────────────────────────────────
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/style.css')
def serve_css():
    return send_from_directory('.', 'style.css')

@app.route('/app.js')
def serve_js():
    return send_from_directory('.', 'app.js')

# ─── AUTH ROUTES ────────────────────────────────────────────
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        d = request.json
        if not d:
            return jsonify({"error":"No data"}), 400

        required = ['full_name','email','password','city']
        if not all(d.get(k) for k in required):
            return jsonify({"error":"All fields required"}), 400

        existing = db_query(
            "SELECT id FROM users WHERE email=%s",
            (d['email'],), fetchone=True
        )
        if existing:
            return jsonify({"error":"Email already registered"}), 409

        pw_hash  = bcrypt.hashpw(d['password'].encode(), bcrypt.gensalt()).decode()
        user_id  = str(uuid.uuid4())

        db_query("""
            INSERT INTO users
              (id, full_name, email, password_hash, city, country,
               latitude, longitude, timezone, calc_method)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            user_id,
            d['full_name'], d['email'], pw_hash,
            d['city'], d.get('country','Pakistan'),
            d.get('latitude', 24.86), d.get('longitude', 67.01),
            d.get('timezone','Asia/Karachi'),
            d.get('calc_method', 1)
        ), commit=True)

        token = make_token(user_id)
        user  = db_query(
            "SELECT id,full_name,email,city,latitude,longitude,timezone,theme FROM users WHERE id=%s",
            (user_id,), fetchone=True
        )
        return jsonify({"token": token, "user": dict(user)}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        d    = request.json or {}
        user = db_query(
            "SELECT * FROM users WHERE email=%s",
            (d.get('email',''),), fetchone=True
        )
        if not user or not bcrypt.checkpw(
            d.get('password','').encode(),
            user['password_hash'].encode()
        ):
            return jsonify({"error":"Invalid credentials"}), 401

        db_query(
            "UPDATE users SET last_login=NOW() WHERE id=%s",
            (user['id'],), commit=True
        )
        token = make_token(user['id'])
        safe  = {k: user[k] for k in [
            'id','full_name','email','city',
            'latitude','longitude','timezone','theme'
        ]}
        return jsonify({"token": token, "user": safe})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/auth/me', methods=['GET'])
@require_auth
def get_me():
    try:
        user = db_query(
            "SELECT id,full_name,email,city,latitude,longitude,timezone,theme,calc_method FROM users WHERE id=%s",
            (request.user_id,), fetchone=True
        )
        return jsonify(dict(user))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── PRAYER ROUTES ──────────────────────────────────────────
@app.route('/api/prayer/times', methods=['GET'])
@require_auth
def get_prayer_times():
    try:
        user = db_query(
            "SELECT city, latitude, longitude, calc_method FROM users WHERE id=%s",
            (request.user_id,), fetchone=True
        )
        date = request.args.get('date', datetime.now().strftime('%d-%m-%Y'))

        resp = requests.get(
            f"https://api.aladhan.com/v1/timings/{date}",
            params={
                "latitude":  user['latitude'],
                "longitude": user['longitude'],
                "method":    user['calc_method']
            }, timeout=8
        )
        data = resp.json()
        if data.get('code') == 200:
            return jsonify({
                "timings": data['data']['timings'],
                "hijri":   data['data']['date']['hijri'],
                "city":    user['city']
            })
    except Exception:
        pass

    return jsonify({
        "timings": {
            "Fajr":"05:02","Sunrise":"06:20",
            "Dhuhr":"12:23","Asr":"15:52",
            "Maghrib":"18:25","Isha":"19:49"
        },
        "hijri": {"day":"14","month":{"en":"Ramadan"},"year":"1446"},
        "city":  "Default"
    })


@app.route('/api/prayer/log', methods=['POST'])
@require_auth
def log_prayer():
    try:
        d = request.json
        db_query("""
            INSERT INTO prayer_logs
              (user_id, prayer_name, prayer_date, prayed, prayed_at, is_qaza, notes)
            VALUES (%s,%s,%s,%s,NOW(),%s,%s)
            ON CONFLICT (user_id, prayer_name, prayer_date)
            DO UPDATE SET prayed=EXCLUDED.prayed,
                          prayed_at=EXCLUDED.prayed_at,
                          is_qaza=EXCLUDED.is_qaza
        """, (
            request.user_id,
            d['prayer_name'], d['prayer_date'],
            d.get('prayed', True),
            d.get('is_qaza', False),
            d.get('notes','')
        ), commit=True)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/prayer/log', methods=['GET'])
@require_auth
def get_prayer_log():
    try:
        month = request.args.get('month', datetime.now().strftime('%Y-%m'))
        logs  = db_query("""
            SELECT prayer_name, prayer_date, prayed, prayed_at, is_qaza
            FROM prayer_logs
            WHERE user_id=%s AND TO_CHAR(prayer_date,'YYYY-MM')=%s
            ORDER BY prayer_date, prayer_name
        """, (request.user_id, month), fetchall=True)
        return jsonify([dict(l) for l in (logs or [])])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── QURAN ROUTES ───────────────────────────────────────────
@app.route('/api/quran/progress', methods=['GET'])
@require_auth
def get_quran_progress():
    try:
        rows = db_query("""
            SELECT surah_number, last_ayah, is_completed, last_read_at
            FROM quran_progress WHERE user_id=%s ORDER BY surah_number
        """, (request.user_id,), fetchall=True)
        return jsonify([dict(r) for r in (rows or [])])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/quran/progress', methods=['POST'])
@require_auth
def update_quran_progress():
    try:
        d = request.json
        db_query("""
            INSERT INTO quran_progress
              (user_id, surah_number, last_ayah, total_ayahs, is_completed, last_read_at)
            VALUES (%s,%s,%s,%s,%s,NOW())
            ON CONFLICT (user_id, surah_number)
            DO UPDATE SET last_ayah=EXCLUDED.last_ayah,
                          is_completed=EXCLUDED.is_completed,
                          last_read_at=NOW(),
                          read_count=quran_progress.read_count+1
        """, (
            request.user_id,
            d['surah_number'], d['last_ayah'],
            d.get('total_ayahs'), d.get('is_completed', False)
        ), commit=True)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/quran/surah/<int:surah_num>', methods=['GET'])
@require_auth
def get_surah(surah_num):
    try:
        resp = requests.get(
            f"https://api.alquran.cloud/v1/surah/{surah_num}/editions/quran-uthmani,en.asad",
            timeout=8
        )
        data = resp.json()
        if data.get('code') == 200:
            return jsonify(data['data'])
    except Exception:
        pass
    return jsonify({"error": "Could not fetch surah"}), 503

# ─── ZAKAT ROUTES ───────────────────────────────────────────
@app.route('/api/zakat/save', methods=['POST'])
@require_auth
def save_zakat():
    try:
        d = request.json
        db_query("""
            INSERT INTO zakat_records
              (user_id, calc_type, cash_amount, investments, business_goods,
               receivables, debts, gold_grams, silver_grams,
               gold_price_per_gram, silver_price_per_gram,
               produce_kg, irrigation_type, price_per_kg,
               family_members, food_type, currency,
               total_assets, net_zakatable, zakat_amount, nisab_met, notes)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            request.user_id, d.get('calc_type','wealth'),
            d.get('cash',0), d.get('investments',0),
            d.get('business_goods',0), d.get('receivables',0),
            d.get('debts',0), d.get('gold_grams',0),
            d.get('silver_grams',0), d.get('gold_price',0),
            d.get('silver_price',0), d.get('produce_kg',0),
            d.get('irrigation_type'), d.get('price_per_kg',0),
            d.get('family_members',1), d.get('food_type'),
            d.get('currency','PKR'), d.get('total_assets',0),
            d.get('net_zakatable',0), d.get('zakat_amount',0),
            d.get('nisab_met',False), d.get('notes','')
        ), commit=True)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/zakat/history', methods=['GET'])
@require_auth
def zakat_history():
    try:
        rows = db_query("""
            SELECT calc_type, zakat_amount, currency, nisab_met, calculated_at
            FROM zakat_records
            WHERE user_id=%s
            ORDER BY calculated_at DESC LIMIT 20
        """, (request.user_id,), fetchall=True)
        return jsonify([dict(r) for r in (rows or [])])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ─── CHATBOT ────────────────────────────────────────────────
@app.route('/api/chatbot/message', methods=['POST'])
@require_auth
def chatbot_message():
    try:
        d            = request.json or {}
        user_message = d.get('message','')
        session_id   = d.get('session_id')

        user = db_query(
            "SELECT full_name, city FROM users WHERE id=%s",
            (request.user_id,), fetchone=True
        )

        system_prompt = f"""You are Mufti AI, an Islamic finance expert in Al-Hidayah Ramadan app.
You specialize in Zakat, Ushr, Fitrana according to Hanafi fiqh (Pakistan).
User: {user['full_name'] if user else 'User'} from {user['city'] if user else 'Pakistan'}.
Current Nisab: ~PKR 1,920,000 (gold) or ~PKR 215,000 (silver). Rate: 2.5%.
Be concise, friendly, and end with a Quranic reference when relevant.
Keep responses under 150 words."""

        reply = "I'm sorry, the AI service is currently unavailable. Basic rule: Zakat = 2.5% on net assets above Nisab (~₨1.92M gold standard)."

        if CLAUDE_KEY and CLAUDE_KEY != "none":
            try:
                import anthropic
                client = anthropic.Anthropic(api_key=CLAUDE_KEY)
                response = client.messages.create(
                    model="claude-haiku-4-5-20251001",
                    max_tokens=300,
                    system=system_prompt,
                    messages=[{"role":"user","content":user_message}]
                )
                reply = response.content[0].text
            except Exception as ai_err:
                reply = f"AI unavailable. Basic answer: Zakat is 2.5% on zakatable assets above Nisab. Details: {str(ai_err)[:80]}"

        # Save session
        if not session_id:
            session_id = str(uuid.uuid4())
            try:
                db_query(
                    "INSERT INTO chatbot_sessions (user_id, session_id) VALUES (%s,%s)",
                    (request.user_id, session_id), commit=True
                )
            except Exception:
                pass

        try:
            db_query(
                "INSERT INTO chatbot_messages (session_id, role, content) VALUES (%s,'user',%s)",
                (session_id, user_message), commit=True
            )
            db_query(
                "INSERT INTO chatbot_messages (session_id, role, content) VALUES (%s,'assistant',%s)",
                (session_id, reply), commit=True
            )
        except Exception:
            pass

        return jsonify({"reply": reply, "session_id": session_id})

    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}", "session_id": None}), 200


# ─── NOTIFICATIONS ───────────────────────────────────────────
@app.route('/api/notifications', methods=['GET'])
@require_auth
def get_notifications():
    try:
        rows = db_query("""
            SELECT prayer_name, enabled, minutes_before
            FROM notification_schedule WHERE user_id=%s
        """, (request.user_id,), fetchall=True)
        return jsonify([dict(r) for r in (rows or [])])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/notifications', methods=['PUT'])
@require_auth
def update_notifications():
    try:
        items = request.json or []
        for item in items:
            db_query("""
                UPDATE notification_schedule
                SET enabled=%s, minutes_before=%s
                WHERE user_id=%s AND prayer_name=%s
            """, (
                item['enabled'], item.get('minutes_before',10),
                request.user_id, item['prayer_name']
            ), commit=True)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/user/settings', methods=['PUT'])
@require_auth
def update_settings():
    try:
        d = request.json or {}
        db_query("""
            UPDATE users SET theme=%s, city=%s,
              latitude=%s, longitude=%s,
              timezone=%s, calc_method=%s
            WHERE id=%s
        """, (
            d.get('theme','dark'), d.get('city','Karachi'),
            d.get('latitude', 24.86), d.get('longitude', 67.01),
            d.get('timezone','Asia/Karachi'),
            d.get('calc_method',1),
            request.user_id
        ), commit=True)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── HEALTH CHECK ────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "app": "Al-Hidayah"})


# ─── ERROR HANDLERS ──────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return send_from_directory('.', 'index.html')

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": str(e)}), 500
