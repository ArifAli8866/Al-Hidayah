# 🌙 Al-Hidayah — Ramadan Companion Web Application

**Database Lab Project**
- **Authors:** Arif Ali `24P-0736` | Arslan Tariq `24P-0610`
- **Stack:** HTML · CSS · JavaScript · Python Flask · PostgreSQL
- **APIs:** AlAdhan · Al-Quran Cloud · Anthropic Claude (Zakat AI)

---

## 📁 Project Structure

```
alhidayah/
├── templates/
│   └── index.html          ← Main HTML (all pages SPA)
├── static/
│   ├── css/
│   │   └── style.css       ← All styles (dark/light theme)
│   └── js/
│       └── app.js          ← All JavaScript logic
├── backend/
│   └── app.py              ← Flask REST API
├── database/
│   └── schema.sql          ← PostgreSQL schema
├── requirements.txt
└── README.md
```

---

## 🗄️ Database Setup (PostgreSQL)

```bash
# 1. Install PostgreSQL
sudo apt install postgresql

# 2. Login and run schema
psql -U postgres -f database/schema.sql

# 3. Verify tables
psql -U postgres -d alhidayah_db -c "\dt"
```

**Tables Created:**
| Table | Purpose |
|-------|---------|
| `users` | Registered users with location, theme, settings |
| `prayer_logs` | Daily prayer tracking per user |
| `quran_progress` | Surah + last ayah bookmark per user |
| `fasting_log` | 30-day fasting history |
| `zakat_records` | All Zakat/Ushr/Fitrana calculations |
| `dua_favorites` | User bookmarked duas |
| `chatbot_sessions` | AI chat sessions |
| `chatbot_messages` | Full AI conversation history |
| `notification_schedule` | Per-prayer notification settings |
| `user_sessions` | JWT auth sessions |
| `recipe_bookmarks` | Saved recipes |

**Views:**
- `v_prayer_stats` — prayer completion rates per user
- `v_quran_stats` — Quran reading summary
- `v_fasting_stats` — fasting overview

---

## 🐍 Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "DB_NAME=alhidayah_db
DB_USER=postgres
DB_PASS=your_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_secret_key_here
ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env

# Run Flask server
cd backend
python app.py
```

Server starts at: `http://localhost:5000`

---

## 🌐 REST API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (with location) |
| POST | `/api/auth/login` | Login, get JWT token |
| GET  | `/api/auth/me` | Get current user profile |

### Prayer
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/prayer/times` | Prayer times for user's location |
| POST | `/api/prayer/log` | Mark a prayer as prayed |
| GET  | `/api/prayer/log` | Get prayer history |
| GET  | `/api/prayer/stats` | Prayer completion stats |

### Qur'an
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/quran/progress` | Get all surah progress |
| POST | `/api/quran/progress` | Update last read ayah |
| GET  | `/api/quran/surah/<n>` | Fetch surah from Al-Quran Cloud |

### Zakat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/zakat/save` | Save a calculation |
| GET  | `/api/zakat/history` | User's calculation history |

### Chatbot (Mufti AI)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chatbot/message` | Send message, get AI response |

### Notifications & Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/notifications` | Get notification preferences |
| PUT  | `/api/notifications` | Update notification preferences |
| PUT  | `/api/user/settings` | Update theme, city, etc. |

---

## ✨ Features

### 🏠 Home
- Live countdown to Sehri/Iftar
- Animated Islamic hero with stars
- Quick navigation to all features

### 🕌 Prayer Times
- Location-based times via **AlAdhan API**
- Sehri (Fajr) and Iftar (Maghrib) prominently displayed
- Mark each prayer individually ✅
- 30-day Ramadan tracker — synced to DB
- Browser notifications 10 min before each prayer

### 📖 Qur'an
- 20+ Surahs with Arabic text + English translation
- **Audio recitation** via Islamic.Network CDN
- Reciter selector (Alafasy, Sudais, Husary, Minshawi)
- **Reading bookmark** — saves exactly which Ayah you stopped at
- Resumes from same Ayah next visit
- 30-Juz progress tracker

### 🤲 Duas
- 10+ authentic Duas with Arabic, transliteration, translation
- Categories: Sehri, Iftar, Morning, Evening, Forgiveness, Taraweeh
- Copy to clipboard button

### ⚖️ Zakat & Ushr
- 4 calculators: Wealth, Gold/Silver, Ushr (Agricultural), Fitrana
- All calculations saved to PostgreSQL
- **Mufti AI chatbot** powered by Claude (Anthropic)
- AI has context of user's profile and past calculations

### 🍽️ Recipes
- 14 Sehri & Iftar recipes with categories
- Dark gradient food images

### ▶️ Videos
- 12 Islamic video cards organized by category
- Lecture, Qur'an, Duas, Taraweeh

### 🌓 Dark / Light Mode
- Teal/Jade dark theme and light theme
- Preference saved to localStorage and DB

---

## 🎓 Database Lab Concepts Demonstrated

1. **Normalization** — 11 tables, proper foreign keys
2. **Triggers** — auto-create notification rows on user signup, auto-update timestamps
3. **Views** — computed stats views (`v_prayer_stats`, `v_quran_stats`)
4. **Functions** — PL/pgSQL helper functions
5. **Indexes** — on frequently queried columns
6. **Transactions** — UPSERT patterns for prayer/quran logs
7. **Constraints** — CHECK, UNIQUE, NOT NULL throughout
8. **UUID primary keys** — for users and sessions
9. **JSONB-ready** — extendable for future schema

---

## 🧪 Demo Login
```
Email:    demo@alhidayah.app
Password: demo1234
```

---

## 📸 Color Theme

Deep Teal (`#0D7377`) + Jade (`#1A6B4A`) + Warm Cream backgrounds.
Inspired by classic Islamic geometric tile patterns.

---

*Ramadan Mubarak! 🌙*
