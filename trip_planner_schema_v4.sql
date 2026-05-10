-- ============================================================
-- TRIP PLANNER SCHEMA  v4
-- Changes from v3:
--   [MUST-HAVE 1] Password reset flow: password_reset_token +
--                 password_reset_expires_at added to Users
--   [MUST-HAVE 2] UserSessions table added for JWT blacklisting
--                 and multi-device session management
--   [SHOULD-HAVE 1] start_time TIME added to Activities for
--                   calendar timeline rendering
--   [SHOULD-HAVE 2] updated_at added to Trips, Bookings,
--                   Expenses, Activities, PackingItems
-- ============================================================

CREATE DATABASE IF NOT EXISTS trip_planner
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE trip_planner;

-- ============================================================
-- ENCRYPTION CONVENTION (application layer, not DB layer)
--
-- Fields marked [ENCRYPTED] store AES-256-GCM ciphertext, Base64-encoded.
-- Each encrypted field has a paired _iv column (BINARY(16)) holding
-- the random initialisation vector used for that specific encryption.
-- The application encrypts before INSERT and decrypts after SELECT.
-- The DB never sees plaintext for these fields.
--
-- Fields marked [SENSITIVE - NOT IN AI VIEW] are excluded from
-- the AIAgentView defined at the bottom of this file.
--
-- Size limits rationale:
--   VARCHAR sizes are set to the smallest value that fits real-world data.
--   TEXT is avoided where VARCHAR is sufficient to prevent row-overflow.
--   DECIMAL precision is kept at (10,2) for money and (10,6) for rates.
--   BLOB is used for encrypted fields whose ciphertext may exceed 500 chars.
-- ============================================================


-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE Users (
    user_id             INT            AUTO_INCREMENT PRIMARY KEY,

    -- Display name: 2–100 chars.
    name                VARCHAR(100)   NOT NULL,
                        CHECK (CHAR_LENGTH(name) BETWEEN 2 AND 100),

    -- Email: RFC 5321 hard limit 254 chars. [SENSITIVE - NOT IN AI VIEW]
    email               VARCHAR(254)   UNIQUE NOT NULL,

    -- bcrypt is always exactly 60 chars. CHECK blocks anything shorter
    -- (plain text that was never hashed). [SENSITIVE - NOT IN AI VIEW]
    password_hash       CHAR(60)       NOT NULL,
                        CHECK (CHAR_LENGTH(password_hash) = 60),

    -- Avatar: HTTPS only. [SENSITIVE - NOT IN AI VIEW]
    avatar_url          VARCHAR(500)   DEFAULT NULL,
                        CHECK (avatar_url IS NULL OR avatar_url LIKE 'https://%'),

    language_preference VARCHAR(10)    DEFAULT 'en',
    timezone            VARCHAR(50)    DEFAULT 'UTC',
    currency_preference CHAR(3)        DEFAULT 'USD',

    email_verified      BOOLEAN        DEFAULT FALSE,
    email_verified_at   TIMESTAMP      DEFAULT NULL,

    -- Soft delete for GDPR right-to-erasure audit trail.
    -- PII is anonymised at app layer before this flag is set.
    -- [SENSITIVE - NOT IN AI VIEW]
    is_deleted          BOOLEAN        DEFAULT FALSE,
    deleted_at          TIMESTAMP      DEFAULT NULL,

    -- Suspension without deletion (abuse investigations).
    is_active           BOOLEAN        DEFAULT TRUE,

    -- Inactive-account detection and purge policy enforcement.
    last_login_at       TIMESTAMP      DEFAULT NULL,

    -- -------------------------------------------------------
    -- Brute-force timeout (v3)
    -- failed_login_attempts increments on each wrong password.
    -- App sets locked_until = NOW() + INTERVAL when threshold hit.
    -- Both reset to 0/NULL on successful login.
    -- [SENSITIVE - NOT IN AI VIEW]
    -- -------------------------------------------------------
    failed_login_attempts TINYINT UNSIGNED DEFAULT 0,
                          CHECK (failed_login_attempts <= 10),
    locked_until          TIMESTAMP      DEFAULT NULL,

    -- -------------------------------------------------------
    -- [MUST-HAVE 1] Password reset flow
    -- password_reset_token: a secure random token (UUID v4, 36 chars)
    --   emailed to the user. The app hashes it before storing so the
    --   raw token is never in the DB — only its SHA-256 hex (64 chars).
    -- password_reset_expires_at: token expires after 1 hour (app-enforced).
    --   After use or expiry the app sets both fields back to NULL.
    -- Flow:
    --   1. User requests reset → app generates token, emails raw value,
    --      stores SHA-256(token) here with expiry = NOW() + 1 HOUR.
    --   2. User clicks link → app hashes submitted token, compares to DB,
    --      checks expires_at > NOW().
    --   3. Match + not expired → allow password change, NULL both fields.
    -- [SENSITIVE - NOT IN AI VIEW]
    -- -------------------------------------------------------
    password_reset_token      CHAR(64)   DEFAULT NULL,  -- SHA-256 hex of raw token
    password_reset_expires_at TIMESTAMP  DEFAULT NULL,

    created_at          TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- ============================================================
-- [MUST-HAVE 2] USER SESSIONS
-- Tracks active sessions for JWT blacklisting, forced logout on
-- password change, and "log out all devices" functionality.
--
-- Flow (JWT):
--   Login  → INSERT a new session row, return session_id as JWT jti claim.
--   Request → app checks: session exists AND revoked = FALSE AND expires_at > NOW().
--   Logout → UPDATE revoked = TRUE for that session_id.
--   Password change → UPDATE revoked = TRUE WHERE user_id = ? (all sessions).
--   "Log out all devices" → same as password change revocation.
--
-- Expired and revoked rows can be purged by a nightly cleanup job;
-- they are not needed for security once expired.
-- ============================================================
CREATE TABLE UserSessions (
    -- session_id = JWT jti claim. UUID v4, 36 chars.
    session_id   VARCHAR(36)   PRIMARY KEY,
    user_id      INT           NOT NULL,

    -- ip_address and user_agent stored for anomalous login detection.
    ip_address   VARCHAR(45)   DEFAULT NULL,   -- supports IPv6
    user_agent   VARCHAR(500)  DEFAULT NULL,

    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    expires_at   TIMESTAMP     NOT NULL,
    revoked      BOOLEAN       DEFAULT FALSE,
    revoked_at   TIMESTAMP     DEFAULT NULL,   -- when was this session revoked

    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_sessions_user (user_id),         -- fast "all sessions for user" lookup
    INDEX idx_sessions_expiry (expires_at)     -- fast cleanup job queries
);


-- ============================================================
-- TRIPS
-- ============================================================
CREATE TABLE Trips (
    trip_id         INT           AUTO_INCREMENT PRIMARY KEY,
    user_id         INT           NOT NULL,

    trip_name       VARCHAR(150)  NOT NULL,
                    CHECK (CHAR_LENGTH(trip_name) BETWEEN 1 AND 150),

    start_date      DATE          DEFAULT NULL,
    end_date        DATE          DEFAULT NULL,

    budget          DECIMAL(10,2) DEFAULT NULL,
                    CHECK (budget IS NULL OR budget >= 0),

    currency        CHAR(3)       DEFAULT 'USD',
    status          ENUM('planning','active','completed','cancelled') DEFAULT 'planning',

    cover_photo_url VARCHAR(500)  DEFAULT NULL,
                    CHECK (cover_photo_url IS NULL OR cover_photo_url LIKE 'https://%'),

    is_public       BOOLEAN       DEFAULT FALSE,
    share_token     VARCHAR(36)   UNIQUE DEFAULT NULL,

    CONSTRAINT chk_public_token
        CHECK (is_public = FALSE OR share_token IS NOT NULL),

    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    -- [SHOULD-HAVE 2] Track last modification for sync and "last edited" UI.
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);


-- ============================================================
-- DESTINATIONS
-- ============================================================
CREATE TABLE Destinations (
    destination_id INT           AUTO_INCREMENT PRIMARY KEY,
    trip_id        INT           NOT NULL,

    city           VARCHAR(100)  DEFAULT NULL,
    country        VARCHAR(100)  DEFAULT NULL,
    country_code   CHAR(2)       DEFAULT NULL,

    arrival_date   DATE          DEFAULT NULL,
    departure_date DATE          DEFAULT NULL,

    sequence_order SMALLINT      DEFAULT 10,
                   CHECK (sequence_order > 0),

    description    VARCHAR(1000) DEFAULT NULL,

    FOREIGN KEY (trip_id) REFERENCES Trips(trip_id) ON DELETE CASCADE
);


-- ============================================================
-- ACTIVITIES
-- ============================================================
CREATE TABLE Activities (
    activity_id    INT           AUTO_INCREMENT PRIMARY KEY,
    trip_id        INT           NOT NULL,
    destination_id INT           DEFAULT NULL,

    activity_name  VARCHAR(150)  DEFAULT NULL,
                   CHECK (activity_name IS NULL OR CHAR_LENGTH(activity_name) BETWEEN 1 AND 150),

    date           DATE          DEFAULT NULL,

    -- [SHOULD-HAVE 1] start_time enables calendar timeline rendering.
    -- Without this, all activities on the same date have no position
    -- on the timeline — the calendar can only show a date, not a time slot.
    -- NULL = unscheduled activity (still valid for list view).
    start_time     TIME          DEFAULT NULL,

    location       VARCHAR(200)  DEFAULT NULL,

    cost           DECIMAL(10,2) DEFAULT NULL,
                   CHECK (cost IS NULL OR cost >= 0),

    activity_type  ENUM('museum','adventure','food','transport','shopping',
                        'tour','nature','entertainment','other') DEFAULT 'other',

    -- duration_mins drives both filter queries and calendar block height.
    -- start_time + duration_mins = end time, rendered as block on timeline.
    duration_mins  SMALLINT      DEFAULT NULL,
                   CHECK (duration_mins IS NULL OR (duration_mins > 0 AND duration_mins <= 1440)),

    notes          VARCHAR(1000) DEFAULT NULL,  -- [SENSITIVE - NOT IN AI VIEW]

    -- [SHOULD-HAVE 2] Track last modification.
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (trip_id)        REFERENCES Trips(trip_id)             ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES Destinations(destination_id) ON DELETE SET NULL
);


-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE Bookings (
    booking_id   INT           AUTO_INCREMENT PRIMARY KEY,
    trip_id      INT           NOT NULL,

    booking_type ENUM('flight','hotel','car_rental','train','ferry','tour','other'),
    provider     VARCHAR(150)  DEFAULT NULL,

    -- PNR / hotel confirmation: AES-256-GCM encrypted.
    -- [ENCRYPTED] [SENSITIVE - NOT IN AI VIEW]
    reference_number_enc  TINYBLOB      DEFAULT NULL,
    reference_number_iv   BINARY(16)    DEFAULT NULL,

    booking_date  DATE          DEFAULT NULL,
    check_in      DATETIME      DEFAULT NULL,
    check_out     DATETIME      DEFAULT NULL,

    cost          DECIMAL(10,2) DEFAULT NULL,
                  CHECK (cost IS NULL OR cost >= 0),

    currency      CHAR(3)       DEFAULT 'USD',

    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
                  CHECK (exchange_rate > 0),

    base_amount   DECIMAL(10,2) DEFAULT NULL,
                  CHECK (base_amount IS NULL OR base_amount >= 0),

    status        ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',

    expense_id    INT           DEFAULT NULL,

    -- [SHOULD-HAVE 2] Track last modification for sync.
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (trip_id) REFERENCES Trips(trip_id) ON DELETE CASCADE
);


-- ============================================================
-- EXPENSES
-- receipt_url removed (v3 — PCI-DSS risk).
-- ============================================================
CREATE TABLE Expenses (
    expense_id    INT           AUTO_INCREMENT PRIMARY KEY,
    trip_id       INT           NOT NULL,

    category      ENUM('accommodation','food','transport','activity',
                       'shopping','health','visa','other'),

    amount        DECIMAL(10,2) DEFAULT NULL,
                  CHECK (amount IS NULL OR amount >= 0),

    currency      CHAR(3)       DEFAULT 'USD',

    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
                  CHECK (exchange_rate > 0),

    base_amount   DECIMAL(10,2) DEFAULT NULL,
                  CHECK (base_amount IS NULL OR base_amount >= 0),

    expense_date  DATE          DEFAULT NULL,

    -- Capped at 300 chars to prevent unintentional PII dumping.
    -- [SENSITIVE - NOT IN AI VIEW]
    description   VARCHAR(300)  DEFAULT NULL,

    booking_id    INT           DEFAULT NULL,

    -- [SHOULD-HAVE 2] Track last modification for sync.
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (trip_id)    REFERENCES Trips(trip_id)       ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE SET NULL
);

-- Forward FK: Bookings → Expenses (circular reference resolved via ALTER)
ALTER TABLE Bookings
    ADD CONSTRAINT fk_bookings_expense
    FOREIGN KEY (expense_id) REFERENCES Expenses(expense_id) ON DELETE SET NULL;


-- ============================================================
-- PACKING ITEMS
-- ============================================================
CREATE TABLE PackingItems (
    item_id    INT              AUTO_INCREMENT PRIMARY KEY,
    trip_id    INT              NOT NULL,

    item_name  VARCHAR(100)     NOT NULL,
               CHECK (CHAR_LENGTH(item_name) BETWEEN 1 AND 100),

    category   VARCHAR(50)      DEFAULT NULL,

    quantity   TINYINT UNSIGNED DEFAULT 1,
               CHECK (quantity BETWEEN 1 AND 99),

    is_packed  BOOLEAN          DEFAULT FALSE,

    -- [SHOULD-HAVE 2] Timestamp when item was checked off, useful
    -- for cross-device sync (e.g. phone checks off, tablet reflects it).
    created_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (trip_id) REFERENCES Trips(trip_id) ON DELETE CASCADE
);


-- ============================================================
-- TRIP NOTES
-- Write-through cache: Redis first, async persist here. DB = source of truth.
-- ============================================================
CREATE TABLE TripNotes (
    note_id        INT        AUTO_INCREMENT PRIMARY KEY,
    trip_id        INT        NOT NULL,
    destination_id INT        DEFAULT NULL,

    -- Freeform content encrypted (users paste passports, PINs, card details).
    -- [ENCRYPTED] [SENSITIVE - NOT IN AI VIEW]
    content_enc    BLOB       NOT NULL,
    content_iv     BINARY(16) NOT NULL,

    -- Set TRUE by app PII scanner before encryption.
    is_sensitive   BOOLEAN    DEFAULT FALSE,

    created_at     TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (trip_id)        REFERENCES Trips(trip_id)               ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES Destinations(destination_id) ON DELETE SET NULL
);


-- ============================================================
-- SAVED DESTINATIONS
-- ============================================================
CREATE TABLE SavedDestinations (
    user_id      INT          NOT NULL,
    city_name    VARCHAR(100) NOT NULL,
    country_code CHAR(2)      DEFAULT NULL,
    saved_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, city_name),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);


-- ============================================================
-- AUDIT LOG
-- No FK on user_id: audit rows must survive user deletion.
-- Never delete rows; archive to cold storage after 2 years (SOC 2).
-- ============================================================
CREATE TABLE AuditLog (
    log_id         BIGINT       AUTO_INCREMENT PRIMARY KEY,
    user_id        INT          DEFAULT NULL,
    action         ENUM('INSERT','UPDATE','DELETE','LOGIN','LOGOUT',
                        'LOGIN_FAILED','ACCOUNT_LOCKED',
                        'PASSWORD_RESET_REQUESTED',   -- new: reset token issued
                        'PASSWORD_RESET_COMPLETED',   -- new: password successfully changed
                        'SESSION_REVOKED'              -- new: session forced out
                   ) NOT NULL,
    table_name     VARCHAR(50)  NOT NULL,
    record_id      INT          DEFAULT NULL,
    -- password_hash, reference_number_enc, content_enc, password_reset_token
    -- are NEVER written to changed_fields.
    changed_fields JSON         DEFAULT NULL,
    ip_address     VARCHAR(45)  DEFAULT NULL,
    user_agent     VARCHAR(500) DEFAULT NULL,
    created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- AI AGENT VIEW
-- SELECT-only. Excludes all credentials, encrypted blobs,
-- financial figures, free-text sensitive fields, and security columns.
-- Hard-filters deleted and suspended accounts.
-- ============================================================
CREATE VIEW AIAgentView AS
SELECT
    -- User context
    u.user_id,
    u.name                AS user_name,
    u.language_preference,
    u.timezone,
    u.currency_preference,

    -- Trip overview
    t.trip_id,
    t.trip_name,
    t.start_date,
    t.end_date,
    t.currency            AS trip_currency,
    t.status              AS trip_status,
    t.is_public,

    -- Destinations
    d.destination_id,
    d.city,
    d.country,
    d.country_code,
    d.arrival_date,
    d.departure_date,
    d.sequence_order,

    -- Activities (no cost, no notes, no encrypted fields)
    -- start_time included: agents can answer "what time is my museum visit?"
    a.activity_id,
    a.activity_name,
    a.activity_type,
    a.date                AS activity_date,
    a.start_time          AS activity_start_time,
    a.duration_mins,
    a.location            AS activity_location,

    -- Bookings (status + logistics only — no reference numbers, no cost)
    b.booking_id,
    b.booking_type,
    b.provider,
    b.check_in,
    b.check_out,
    b.status              AS booking_status,

    -- Packing (no PII)
    p.item_id,
    p.item_name,
    p.category            AS packing_category,
    p.quantity,
    p.is_packed

FROM Users             u
JOIN  Trips            t ON t.user_id         = u.user_id
LEFT JOIN Destinations d ON d.trip_id         = t.trip_id
LEFT JOIN Activities   a ON a.trip_id         = t.trip_id
LEFT JOIN Bookings     b ON b.trip_id         = t.trip_id
LEFT JOIN PackingItems p ON p.trip_id         = t.trip_id
WHERE
    u.is_deleted = FALSE
    AND u.is_active  = TRUE;

-- Grant AI agent DB user read-only access to the view only.
-- CREATE USER 'ai_agent'@'%' IDENTIFIED BY '<strong-password>';
-- GRANT SELECT ON trip_planner.AIAgentView TO 'ai_agent'@'%';
