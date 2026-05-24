<div align="center">

<br/>

```
 █████╗ ██╗         ██╗  ██╗██╗██████╗  █████╗ ██╗   ██╗ █████╗ ██╗  ██╗
██╔══██╗██║         ██║  ██║██║██╔══██╗██╔══██╗╚██╗ ██╔╝██╔══██╗██║  ██║
███████║██║         ███████║██║██║  ██║███████║ ╚████╔╝ ███████║███████║
██╔══██║██║         ██╔══██║██║██║  ██║██╔══██║  ╚██╔╝  ██╔══██║██╔══██║
██║  ██║███████╗    ██║  ██║██║██████╔╝██║  ██║   ██║   ██║  ██║██║  ██║
╚═╝  ╚═╝╚══════╝    ╚═╝  ╚═╝╚═╝╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝
```

### 🌙 *Your Complete Ramadan Companion* 🌙

### *Group Number* 
### *02*

<br/>

## 🔗 Project Links

- 📂 GitHub Repository: [Al-Hidayah](https://github.com/ArifAli8866/Al-Hidayah)  
- 🌍 Live Demo: [https://al-hidayah-sand.vercel.app/](https://al-hidayah-sand.vercel.app/)


[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Claude AI](https://img.shields.io/badge/Anthropic-Claude_AI-D97706?style=for-the-badge&logo=anthropic&logoColor=white)](https://anthropic.com)

<br/>

> *"Indeed, with hardship will be ease."* — Quran 94:6

<br/>

**Al-Hidayah** is a full-stack Ramadan companion web application that helps Muslims track prayers, read Quran, calculate Zakat, and stay spiritually connected throughout the blessed month — powered by real Islamic APIs and AI.

<br/>

---

</div>

## 👥 Authors

<table align="center">
  <tr>
    <td align="center">
      <b>Arif Ali</b><br/>
      <code>24P-0736</code>
    </td>
    <td align="center">
      <b>Arslan Tariq</b><br/>
      <code>24P-0610</code>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <i>FAST National University of Computing and Emerging Sciences</i><br/>
      <b>Database Lab Project</b>
    </td>
  </tr>
</table>

---

## ✨ Features at a Glance

| Module | Feature | Powered By |
|:------:|---------|-----------|
| 🏠 | Live Sehri / Iftar countdown with animated hero | Vanilla JS |
| 🕌 | Location-based prayer times + 30-day Ramadan tracker | AlAdhan API |
| 📖 | Quran reader with audio recitation & ayah bookmarks | Al-Quran Cloud |
| 🤲 | 10+ authentic duas with transliteration & translation | Static DB |
| ⚖️ | Zakat, Ushr, Gold/Silver & Fitrana calculators | PostgreSQL |
| 🤖 | Mufti AI — contextual Islamic chatbot | Anthropic Claude |
| 🍽️ | 14 curated Sehri & Iftar recipes | In-App |
| ▶️ | Categorized Islamic video library | In-App |
| 🌓 | Dark / Light mode with persistent preference | localStorage + DB |

---

## 🏗️ Project Structure

```
alhidayah/
│
├── 📂 templates/
│   └── index.html              ← Single-Page Application (SPA) shell
│
├── 📂 static/
│   ├── css/
│   │   └── style.css           ← Full dark/light theme system
│   └── js/
│       └── app.js              ← All client-side logic & API calls
│
├── 📂 backend/
│   └── app.py                  ← Flask REST API (all endpoints)
│
├── 📂 database/
│   └── schema.sql              ← PostgreSQL DDL (11 tables, views, triggers)
│
├── requirements.txt
└── README.md
```

---

## 🗄️ Database Architecture

> Demonstrating production-level PostgreSQL design patterns

### 📋 Tables

| Table | Purpose |
|-------|---------|
| `users` | Registered users with location, theme & settings |
| `prayer_logs` | Daily prayer tracking per user |
| `quran_progress` | Surah + last Ayah bookmark per user |
| `fasting_log` | 30-day fasting history |
| `zakat_records` | All Zakat / Ushr / Fitrana calculations |
| `dua_favorites` | User-bookmarked duas |
| `chatbot_sessions` | Mufti AI chat sessions |
| `chatbot_messages` | Full AI conversation history |
| `notification_schedule` | Per-prayer notification preferences |
| `user_sessions` | JWT-based auth sessions |
| `recipe_bookmarks` | Saved recipes per user |

### 👁️ Views

| View | Purpose |
|------|---------|
| `v_prayer_stats` | Prayer completion rates per user |
| `v_quran_stats` | Quran reading summary & progress |
| `v_fasting_stats` | Fasting overview across Ramadan |

### 🎓 Database Concepts Demonstrated

```
✅  Normalization          11 tables with proper foreign key relationships
✅  Triggers               Auto-create notification rows on signup; timestamp updates
✅  Views                  Computed stats — v_prayer_stats, v_quran_stats, v_fasting_stats
✅  PL/pgSQL Functions      Helper functions for complex queries
✅  Indexes                 On frequently-queried columns for performance
✅  Transactions            UPSERT patterns for prayer and Quran logs
✅  Constraints             CHECK, UNIQUE, NOT NULL applied throughout
✅  UUID Primary Keys       For users and sessions (collision-safe)
✅  JSONB Support           Schema ready for flexible future extensions
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- PostgreSQL 15+
- An [Anthropic API Key](https://console.anthropic.com/)

---

### 1️⃣ Database Setup

```bash
# Install PostgreSQL
sudo apt install postgresql

# Run the schema
psql -U postgres -f database/schema.sql

# Verify tables were created
psql -U postgres -d alhidayah_db -c "\dt"
```

---

### 2️⃣ Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate          # Linux / macOS
# venv\Scripts\activate           # Windows

# Install all dependencies
pip install -r requirements.txt
```

---

### 3️⃣ Environment Configuration

Create a `.env` file in the project root:

```env
# ── Database ─────────────────────────────────
DB_NAME=alhidayah_db
DB_USER=postgres
DB_PASS=your_password
DB_HOST=localhost
DB_PORT=5432

# ── Security ─────────────────────────────────
JWT_SECRET=your_secret_key_here

# ── AI ───────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

---

### 4️⃣ Launch

```bash
cd backend
python app.py
```

> 🟢 Server running at **`http://localhost:5000`**

---

## 🌐 REST API Reference

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user with location |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `GET` | `/api/auth/me` | Fetch current user profile |

### 🕌 Prayer

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/prayer/times` | Location-based prayer times |
| `POST` | `/api/prayer/log` | Mark a prayer as completed |
| `GET` | `/api/prayer/log` | Full prayer history |
| `GET` | `/api/prayer/stats` | Completion statistics |

### 📖 Qur'an

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/quran/progress` | Get all Surah progress |
| `POST` | `/api/quran/progress` | Update last read Ayah bookmark |
| `GET` | `/api/quran/surah/<n>` | Fetch Surah from Al-Quran Cloud |

### ⚖️ Zakat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/zakat/save` | Save a Zakat calculation |
| `GET` | `/api/zakat/history` | User's full calculation history |

### 🤖 Mufti AI Chatbot

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chatbot/message` | Send message → receive AI response |

### ⚙️ Notifications & Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notifications` | Fetch notification preferences |
| `PUT` | `/api/notifications` | Update notification settings |
| `PUT` | `/api/user/settings` | Update theme, city & other prefs |

---

## 📖 Feature Deep-Dive

<details>
<summary><b>🕌 Prayer Times & Tracker</b></summary>
<br/>

- Pulls real-time prayer times from the **AlAdhan API** based on the user's saved city
- Sehri (Fajr) and Iftar (Maghrib) times are displayed prominently on the home screen
- Users can **mark each of the 5 prayers** individually as completed
- A full **30-day Ramadan tracker** syncs every log to PostgreSQL
- **Browser push notifications** fire 10 minutes before each prayer

</details>

<details>
<summary><b>📖 Qur'an Reader</b></summary>
<br/>

- 20+ Surahs with full **Arabic text and English translation**
- **Audio recitation** streamed from the Islamic Network CDN
- Choose from 4 reciters: Alafasy · Sudais · Husary · Minshawi
- **Ayah-level bookmarking** — saves the exact verse you stopped at and resumes automatically on next visit
- Visual **30-Juz progress tracker**

</details>

<details>
<summary><b>⚖️ Zakat Calculator + Mufti AI</b></summary>
<br/>

- **4 calculators:** Wealth Zakat, Gold & Silver, Ushr (Agricultural), Fitrana
- All calculations are stored in PostgreSQL with timestamps
- **Mufti AI** — an Islamic chatbot built on Anthropic Claude with full context of the user's profile and past Zakat history

</details>

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#0D7377` — Deep Teal |
| Secondary | `#1A6B4A` — Jade Green |
| Background (Light) | Warm Cream |
| Background (Dark) | Deep Charcoal |
| Inspiration | Classic Islamic geometric tile patterns |

---

## 🧪 Demo Account

```
Email     →   demo@alhidayah.app
Password  →   demo1234
```

---

## 🔌 External APIs Used

| API | Purpose |
|-----|---------|
| [AlAdhan](https://aladhan.com/prayer-times-api) | Prayer times by location |
| [Al-Quran Cloud](https://alquran.cloud/api) | Quran text & audio |
| [Islamic.Network CDN](https://cdn.islamic.network) | Audio recitation files |
| [Anthropic Claude](https://docs.anthropic.com) | Mufti AI chatbot |

---

<div align="center">

<br/>

**رَمَضَانُ مُبَارَك**

*Ramadan Mubarak — May this project be a source of benefit* 🌙

<br/>

Made with 🤍 by **Arif Ali** & **Arslan Tariq** · FAST NUCES

</div>
