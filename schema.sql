-- ============================================================
--  AL-HIDAYAH DATABASE SCHEMA  |  PostgreSQL
--  Ramadan Companion Web Application
--  Course: Database Lab Project
--  Authors: Arif Ali (24P-0736) | Arslan Tariq (24P-0610)
-- ============================================================

-- Drop & recreate for clean setup
DROP DATABASE IF EXISTS alhidayah_db;
CREATE DATABASE alhidayah_db
    WITH ENCODING='UTF8'
    LC_COLLATE='en_US.UTF-8'
    LC_CTYPE='en_US.UTF-8';

\c alhidayah_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ────────────────────────────────────────────────
-- TABLE 1: USERS
-- ────────────────────────────────────────────────
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name       VARCHAR(120) NOT NULL,
    email           VARCHAR(180) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    city            VARCHAR(100) NOT NULL DEFAULT 'Karachi',
    country         VARCHAR(80)  NOT NULL DEFAULT 'Pakistan',
    latitude        NUMERIC(10,6),
    longitude       NUMERIC(10,6),
    timezone        VARCHAR(50)  NOT NULL DEFAULT 'Asia/Karachi',
    calc_method     SMALLINT     NOT NULL DEFAULT 1,   -- 1=Karachi,2=ISNA,3=MWL
    theme           VARCHAR(10)  NOT NULL DEFAULT 'dark',
    language        VARCHAR(10)  NOT NULL DEFAULT 'en',
    notification_prayer   BOOLEAN NOT NULL DEFAULT TRUE,
    notification_sehri    BOOLEAN NOT NULL DEFAULT TRUE,
    notification_iftar    BOOLEAN NOT NULL DEFAULT TRUE,
    ramadan_year    SMALLINT     NOT NULL DEFAULT 1446,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_login      TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);

-- ────────────────────────────────────────────────
-- TABLE 2: PRAYER LOGS
-- ────────────────────────────────────────────────
CREATE TABLE prayer_logs (
    id              SERIAL PRIMARY KEY,
    user_id         UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prayer_name     VARCHAR(20)  NOT NULL,  -- Fajr,Dhuhr,Asr,Maghrib,Isha
    prayer_date     DATE         NOT NULL,
    prayed          BOOLEAN      NOT NULL DEFAULT FALSE,
    prayed_at       TIMESTAMPTZ,
    is_qaza         BOOLEAN      NOT NULL DEFAULT FALSE,
    notes           TEXT,
    UNIQUE(user_id, prayer_name, prayer_date)
);

CREATE INDEX idx_prayer_logs_user ON prayer_logs(user_id, prayer_date);

-- ────────────────────────────────────────────────
-- TABLE 3: QURAN READING PROGRESS
-- ────────────────────────────────────────────────
CREATE TABLE quran_progress (
    id              SERIAL PRIMARY KEY,
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    surah_number    SMALLINT    NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    last_ayah       SMALLINT    NOT NULL DEFAULT 1,
    total_ayahs     SMALLINT,
    is_completed    BOOLEAN     NOT NULL DEFAULT FALSE,
    last_read_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_count      SMALLINT    NOT NULL DEFAULT 1,
    UNIQUE(user_id, surah_number)
);

CREATE INDEX idx_quran_progress_user ON quran_progress(user_id);

-- ────────────────────────────────────────────────
-- TABLE 4: RAMADAN FASTING LOG
-- ────────────────────────────────────────────────
CREATE TABLE fasting_log (
    id              SERIAL PRIMARY KEY,
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fast_date       DATE        NOT NULL,
    ramadan_day     SMALLINT    NOT NULL CHECK (ramadan_day BETWEEN 1 AND 30),
    fasted          BOOLEAN     NOT NULL DEFAULT TRUE,
    sehri_eaten     BOOLEAN     NOT NULL DEFAULT TRUE,
    iftar_time      TIME,
    notes           TEXT,
    UNIQUE(user_id, fast_date)
);

CREATE INDEX idx_fasting_log_user ON fasting_log(user_id);

-- ────────────────────────────────────────────────
-- TABLE 5: ZAKAT RECORDS
-- ────────────────────────────────────────────────
CREATE TABLE zakat_records (
    id              SERIAL PRIMARY KEY,
    user_id         UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    calc_type       VARCHAR(20)    NOT NULL,  -- wealth,gold,ushr,fitrana
    cash_amount     NUMERIC(18,2)  DEFAULT 0,
    investments     NUMERIC(18,2)  DEFAULT 0,
    business_goods  NUMERIC(18,2)  DEFAULT 0,
    receivables     NUMERIC(18,2)  DEFAULT 0,
    debts           NUMERIC(18,2)  DEFAULT 0,
    gold_grams      NUMERIC(10,3)  DEFAULT 0,
    silver_grams    NUMERIC(10,3)  DEFAULT 0,
    gold_price_per_gram  NUMERIC(10,2) DEFAULT 0,
    silver_price_per_gram NUMERIC(10,2) DEFAULT 0,
    produce_kg      NUMERIC(10,3)  DEFAULT 0,
    irrigation_type VARCHAR(15),               -- rain / artificial
    price_per_kg    NUMERIC(10,2)  DEFAULT 0,
    family_members  SMALLINT       DEFAULT 1,
    food_type       VARCHAR(20),
    currency        VARCHAR(5)     NOT NULL DEFAULT 'PKR',
    total_assets    NUMERIC(18,2),
    net_zakatable   NUMERIC(18,2),
    zakat_amount    NUMERIC(18,2),
    nisab_met       BOOLEAN        DEFAULT FALSE,
    notes           TEXT,
    calculated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_zakat_user ON zakat_records(user_id);

-- ────────────────────────────────────────────────
-- TABLE 6: DUAS FAVORITES
-- ────────────────────────────────────────────────
CREATE TABLE dua_favorites (
    id              SERIAL PRIMARY KEY,
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dua_key         VARCHAR(80) NOT NULL,
    dua_title       VARCHAR(200),
    saved_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, dua_key)
);

-- ────────────────────────────────────────────────
-- TABLE 7: CHATBOT CONVERSATIONS (Zakat AI)
-- ────────────────────────────────────────────────
CREATE TABLE chatbot_sessions (
    id              SERIAL PRIMARY KEY,
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id      UUID        NOT NULL DEFAULT uuid_generate_v4(),
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chatbot_messages (
    id              SERIAL PRIMARY KEY,
    session_id      UUID        NOT NULL REFERENCES chatbot_sessions(session_id) ON DELETE CASCADE,
    role            VARCHAR(15) NOT NULL CHECK (role IN ('user','assistant','system')),
    content         TEXT        NOT NULL,
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_session ON chatbot_messages(session_id, sent_at);

-- ────────────────────────────────────────────────
-- TABLE 8: NOTIFICATION PREFERENCES
-- ────────────────────────────────────────────────
CREATE TABLE notification_schedule (
    id              SERIAL PRIMARY KEY,
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prayer_name     VARCHAR(20) NOT NULL,
    enabled         BOOLEAN     NOT NULL DEFAULT TRUE,
    minutes_before  SMALLINT    NOT NULL DEFAULT 10,
    UNIQUE(user_id, prayer_name)
);

-- ────────────────────────────────────────────────
-- TABLE 9: USER SESSIONS (Auth)
-- ────────────────────────────────────────────────
CREATE TABLE user_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           TEXT        NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address      INET,
    user_agent      TEXT
);

CREATE INDEX idx_sessions_token ON user_sessions(token);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);

-- ────────────────────────────────────────────────
-- TABLE 10: RECIPE BOOKMARKS
-- ────────────────────────────────────────────────
CREATE TABLE recipe_bookmarks (
    id              SERIAL PRIMARY KEY,
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_name     VARCHAR(100) NOT NULL,
    recipe_category VARCHAR(30),
    saved_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, recipe_name)
);

-- ────────────────────────────────────────────────
-- VIEWS
-- ────────────────────────────────────────────────

-- View: User prayer completion for current month
CREATE VIEW v_prayer_stats AS
SELECT
    u.id AS user_id,
    u.full_name,
    u.city,
    COUNT(pl.id) FILTER (WHERE pl.prayed = TRUE)  AS total_prayed,
    COUNT(pl.id)                                   AS total_scheduled,
    ROUND(
        100.0 * COUNT(pl.id) FILTER (WHERE pl.prayed = TRUE)
        / NULLIF(COUNT(pl.id), 0), 1
    )                                              AS completion_pct,
    COUNT(pl.id) FILTER (WHERE pl.is_qaza = TRUE) AS qaza_count
FROM users u
LEFT JOIN prayer_logs pl ON pl.user_id = u.id
GROUP BY u.id, u.full_name, u.city;

-- View: Quran reading summary
CREATE VIEW v_quran_stats AS
SELECT
    user_id,
    COUNT(*)                        AS surahs_started,
    COUNT(*) FILTER (WHERE is_completed) AS surahs_completed,
    MAX(last_read_at)               AS last_read,
    SUM(last_ayah)                  AS total_ayahs_read
FROM quran_progress
GROUP BY user_id;

-- View: Fasting summary
CREATE VIEW v_fasting_stats AS
SELECT
    user_id,
    COUNT(*) FILTER (WHERE fasted = TRUE)       AS days_fasted,
    COUNT(*) FILTER (WHERE fasted = FALSE)      AS days_missed,
    COUNT(*) FILTER (WHERE sehri_eaten = TRUE)  AS sehri_count,
    30 - COUNT(*)                               AS days_remaining
FROM fasting_log
GROUP BY user_id;

-- ────────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ────────────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- Auto-create default notification schedule on user register
CREATE OR REPLACE FUNCTION fn_create_default_notifications()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_schedule (user_id, prayer_name, enabled, minutes_before)
    VALUES
        (NEW.id, 'Fajr',    TRUE, 15),
        (NEW.id, 'Dhuhr',   TRUE, 10),
        (NEW.id, 'Asr',     TRUE, 10),
        (NEW.id, 'Maghrib', TRUE, 5),
        (NEW.id, 'Isha',    TRUE, 10),
        (NEW.id, 'Sehri',   TRUE, 20),
        (NEW.id, 'Iftar',   TRUE, 5);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_notifications
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION fn_create_default_notifications();

-- ────────────────────────────────────────────────
-- SEED DATA
-- ────────────────────────────────────────────────

-- Demo user (password: demo1234)
INSERT INTO users (full_name, email, password_hash, city, latitude, longitude, timezone)
VALUES (
    'Demo User',
    'demo@alhidayah.app',
    crypt('demo1234', gen_salt('bf')),
    'Karachi',
    24.8607, 67.0011,
    'Asia/Karachi'
);

\echo ''
\echo '✅ Al-Hidayah database schema created successfully!'
\echo '   Tables: users, prayer_logs, quran_progress, fasting_log,'
\echo '           zakat_records, dua_favorites, chatbot_sessions,'
\echo '           chatbot_messages, notification_schedule, user_sessions,'
\echo '           recipe_bookmarks'
\echo '   Views:  v_prayer_stats, v_quran_stats, v_fasting_stats'
\echo '   Demo login: demo@alhidayah.app / demo1234'
