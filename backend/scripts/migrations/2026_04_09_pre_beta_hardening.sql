-- Pre-beta hardening migration (2026-04-09)
--
-- Covers:
--   P1.2  stripe_webhook_events  — idempotency guard for Stripe webhook replays
--   P1.3  xp_audit_log           — audit trail for every XP grant
--   P2.2  users.first_name/last_name VARCHAR(100)
--   P2.3  users.timezone TEXT DEFAULT 'UTC'
--
-- Run this in Supabase SQL editor once. Safe to re-run (IF NOT EXISTS / IF EXISTS).

-- ---------------------------------------------------------------
-- P1.2 — Stripe webhook events
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    event_id     TEXT PRIMARY KEY,
    event_type   TEXT NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_stripe_webhook_events_event_type
    ON stripe_webhook_events (event_type);

-- ---------------------------------------------------------------
-- P1.3 — XP audit log
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS xp_audit_log (
    id            UUID PRIMARY KEY,
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delta         INTEGER NOT NULL,
    reason        TEXT NOT NULL,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ix_xp_audit_log_user_id
    ON xp_audit_log (user_id);
CREATE INDEX IF NOT EXISTS ix_xp_audit_log_created_at
    ON xp_audit_log (created_at DESC);

-- ---------------------------------------------------------------
-- P2.2 — Cap name field length (defense in depth against DoS / DB bloat)
-- first_name / last_name live on user_profiles (not users)
-- ---------------------------------------------------------------
UPDATE user_profiles SET first_name = LEFT(first_name, 100) WHERE LENGTH(first_name) > 100;
UPDATE user_profiles SET last_name  = LEFT(last_name,  100) WHERE LENGTH(last_name)  > 100;

ALTER TABLE user_profiles ALTER COLUMN first_name TYPE VARCHAR(100);
ALTER TABLE user_profiles ALTER COLUMN last_name  TYPE VARCHAR(100);

-- ---------------------------------------------------------------
-- P2.3 — User timezone (streak computation fix)
-- Stored on user_profiles so it co-locates with streak_count / last_login_date.
-- ---------------------------------------------------------------
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC';
