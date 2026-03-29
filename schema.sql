 
--  AL-HIDAYAH DATABASE SCHEMA
--  Ramadan Companion Web Application
--  Name : Arif Ali (24P-0736) | Arslan Tariq (24P-0610)
 


-- Create and connect to the database
CREATE DATABASE alhidayah_db;
\c alhidayah_db;


 
-- TABLE 1: USERS
-- Stores registered user accounts and their preferences.
 

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    full_name     VARCHAR(120) NOT NULL,
    email         VARCHAR(180) NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,
    city          VARCHAR(100) DEFAULT 'Karachi',
    country       VARCHAR(80)  DEFAULT 'Pakistan',
    latitude      NUMERIC(10,6),
    longitude     NUMERIC(10,6),
    timezone      VARCHAR(50)  DEFAULT 'Asia/Karachi',

    -- 1 = Karachi Method, 2 = ISNA, 3 = MWL
    calc_method   SMALLINT     DEFAULT 1 CHECK (calc_method IN (1, 2, 3)),

    theme         VARCHAR(10)  DEFAULT 'dark',
    language      VARCHAR(10)  DEFAULT 'en',
    ramadan_year  SMALLINT     DEFAULT 1446,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    last_login    TIMESTAMP
);


 
-- TABLE 2: PRAYER LOGS
-- Tracks whether each prayer was performed on a given day.
 

CREATE TABLE prayer_logs (
    id          SERIAL PRIMARY KEY,
    user_id     INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prayer_name VARCHAR(20) NOT NULL
                    CHECK (prayer_name IN ('Fajr','Dhuhr','Asr','Maghrib','Isha')),
    prayer_date DATE NOT NULL,
    prayed      BOOLEAN  DEFAULT FALSE,
    prayed_at   TIMESTAMP,

    -- is_qaza = TRUE means the prayer was made up after its time
    is_qaza     BOOLEAN  DEFAULT FALSE,
    notes       TEXT,

    UNIQUE (user_id, prayer_name, prayer_date)
);


 
-- TABLE 3: QURAN PROGRESS
-- Tracks how far the user has read in each surah.
 

CREATE TABLE quran_progress (
    id           SERIAL PRIMARY KEY,
    user_id      INT     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    surah_number SMALLINT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    last_ayah    SMALLINT DEFAULT 1,
    total_ayahs  SMALLINT,
    is_completed BOOLEAN  DEFAULT FALSE,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- How many times the user has read this surah
    read_count   SMALLINT DEFAULT 1,

    UNIQUE (user_id, surah_number)
);


 
-- TABLE 4: FASTING LOG
-- Records whether the user fasted on each day of Ramadan.
 

CREATE TABLE fasting_log (
    id          SERIAL PRIMARY KEY,
    user_id     INT     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fast_date   DATE    NOT NULL,
    ramadan_day SMALLINT NOT NULL CHECK (ramadan_day BETWEEN 1 AND 30),
    fasted      BOOLEAN DEFAULT TRUE,
    sehri_eaten BOOLEAN DEFAULT TRUE,
    iftar_time  TIME,
    notes       TEXT,

    UNIQUE (user_id, fast_date)
);


 
-- TABLE 5: ZAKAT RECORDS
-- Stores each zakat calculation done by the user.
 

CREATE TABLE zakat_records (
    id             SERIAL PRIMARY KEY,
    user_id        INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Type of zakat being calculated
    calc_type      VARCHAR(20) NOT NULL
                       CHECK (calc_type IN ('wealth', 'gold', 'ushr', 'fitrana')),

    -- Asset inputs
    cash_amount           NUMERIC(18,2) DEFAULT 0,
    investments           NUMERIC(18,2) DEFAULT 0,
    business_goods        NUMERIC(18,2) DEFAULT 0,
    receivables           NUMERIC(18,2) DEFAULT 0,
    debts                 NUMERIC(18,2) DEFAULT 0,
    gold_grams            NUMERIC(10,3) DEFAULT 0,
    silver_grams          NUMERIC(10,3) DEFAULT 0,
    gold_price_per_gram   NUMERIC(10,2) DEFAULT 0,
    silver_price_per_gram NUMERIC(10,2) DEFAULT 0,

    currency              VARCHAR(5)    DEFAULT 'PKR',

    -- Calculated results
    total_assets    NUMERIC(18,2),
    net_zakatable   NUMERIC(18,2),
    zakat_amount    NUMERIC(18,2),

    -- Whether the user's wealth crossed the nisab threshold
    nisab_met       BOOLEAN   DEFAULT FALSE,
    notes           TEXT,
    calculated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


 
-- TABLE 6: DUA FAVORITES
-- Saves duas that the user has bookmarked.
 

CREATE TABLE dua_favorites (
    id        SERIAL PRIMARY KEY,
    user_id   INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dua_key   VARCHAR(80) NOT NULL,
    dua_title VARCHAR(200),
    saved_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, dua_key)
);


 
-- TABLE 7: CHATBOT SESSIONS
-- One session = one conversation with the AI assistant.
 

CREATE TABLE chatbot_sessions (
    id              SERIAL PRIMARY KEY,
    user_id         INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


 
-- TABLE 8: CHATBOT MESSAGES
-- Stores every message in a chatbot session.
 

CREATE TABLE chatbot_messages (
    id         SERIAL PRIMARY KEY,
    session_id INT  NOT NULL REFERENCES chatbot_sessions(id) ON DELETE CASCADE,
    role       VARCHAR(15) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content    TEXT NOT NULL,
    sent_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


 
-- TABLE 9: NOTIFICATION SCHEDULE
-- Controls when prayer reminders are sent to the user.
 

CREATE TABLE notification_schedule (
    id             SERIAL PRIMARY KEY,
    user_id        INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prayer_name    VARCHAR(20) NOT NULL,
    enabled        BOOLEAN  DEFAULT TRUE,

    -- How many minutes before the prayer to send the reminder
    minutes_before SMALLINT DEFAULT 10,

    UNIQUE (user_id, prayer_name)
);


 
-- TABLE 10: USER SESSIONS
-- Tracks active login sessions (for JWT / token auth).
 

CREATE TABLE user_sessions (
    id         SERIAL PRIMARY KEY,
    user_id    INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);


 
-- TABLE 11: RECIPE BOOKMARKS
-- Saves Sehri/Iftar recipes the user wants to revisit.
 

CREATE TABLE recipe_bookmarks (
    id              SERIAL PRIMARY KEY,
    user_id         INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_name     VARCHAR(100) NOT NULL,
    recipe_category VARCHAR(30),
    saved_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (user_id, recipe_name)
);


-- 3 VIEWS
-- Pre-built queries that act like virtual tables for reports.

-- View 1: Prayer completion summary per user
CREATE VIEW v_prayer_stats AS
SELECT
    u.id          AS user_id,
    u.full_name,
    COUNT(pl.id) FILTER (WHERE pl.prayed = TRUE) AS total_prayed,
    COUNT(pl.id)                                  AS total_scheduled
FROM users u
LEFT JOIN prayer_logs pl ON pl.user_id = u.id
GROUP BY u.id, u.full_name;


-- View 2: Quran reading summary per user
CREATE VIEW v_quran_stats AS
SELECT
    user_id,
    COUNT(*)                                       AS surahs_started,
    COUNT(*) FILTER (WHERE is_completed = TRUE)    AS surahs_completed,
    SUM(last_ayah)                                 AS total_ayahs_read
FROM quran_progress
GROUP BY user_id;


-- View 3: Fasting summary per user
CREATE VIEW v_fasting_stats AS
SELECT
    user_id,
    COUNT(*) FILTER (WHERE fasted = TRUE)          AS days_fasted,
    COUNT(*) FILTER (WHERE fasted = FALSE)         AS days_missed,
    30 - COUNT(*)                                  AS days_remaining
FROM fasting_log
GROUP BY user_id;



CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION fn_set_updated_at();



CREATE OR REPLACE FUNCTION fn_create_default_notifications()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_schedule (user_id, prayer_name, enabled, minutes_before)
    VALUES
        (NEW.id, 'Fajr',    TRUE, 15),
        (NEW.id, 'Dhuhr',   TRUE, 10),
        (NEW.id, 'Asr',     TRUE, 10),
        (NEW.id, 'Maghrib', TRUE,  5),
        (NEW.id, 'Isha',    TRUE, 10),
        (NEW.id, 'Sehri',   TRUE, 20),
        (NEW.id, 'Iftar',   TRUE,  5);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_notifications
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION fn_create_default_notifications();

-- DEMO USER (password: demo1234)
-- A sample record for testing the application.

INSERT INTO users (full_name, email, password_hash, city, latitude, longitude)
VALUES (
    'Demo User',
    'demo@alhidayah.app',
    'demo1234',       
    'Karachi',
    24.8607,
    67.0011
);
