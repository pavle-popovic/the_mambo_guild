-- Migration 013: Meta CAPI + ML event pipeline
--
-- Adds one new table (user_events) and six nullable columns on user_profiles
-- for first-touch ad attribution. Fully additive and idempotent — safe to re-run.
--
-- Run BEFORE deploying the code that references these columns. If you deploy
-- code first, registrations will 500 because SQLAlchemy will emit queries
-- against columns that do not yet exist.
--
-- Apply on Supabase via: Dashboard → SQL Editor → paste this file → Run.
-- Or via psql: psql "$DATABASE_URL" -f 013_meta_analytics_pipeline.sql
--
-- Rollback: drop the column/table statements at the bottom (commented out by
-- default to prevent accidental destructive runs).

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. user_events — append-only product analytics / ML training event log.
--    Also the DB side of the Meta CAPI dedup (event_id matches browser Pixel).
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Dedup key — shared with the browser Pixel's `eventID`. UNIQUE so repeat
    -- client retries are no-ops.
    event_id        VARCHAR NOT NULL UNIQUE,

    -- Nullable: pre-auth events (landing PageView, waitlist Lead) have no
    -- user_id yet; `anonymous_id` stitches them together on signup.
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    anonymous_id    VARCHAR,

    event_name      VARCHAR NOT NULL,

    -- Monetary value + ISO 4217 currency. NULL for non-commercial events.
    value           NUMERIC(10, 2),
    currency        VARCHAR(3),

    -- Free-form event payload. Commonly queried fields live at the top level
    -- of the JSONB so expression indexes stay cheap.
    properties      JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Request context (Meta Advanced Matching + ML feature engineering).
    client_ip       VARCHAR,
    user_agent      VARCHAR,
    fbp             VARCHAR,
    fbc             VARCHAR,
    page_url        VARCHAR,
    referrer        VARCHAR,

    -- CAPI dispatch status. NULL = not a conversion event / not yet forwarded.
    capi_sent_at    TIMESTAMPTZ,
    capi_status     VARCHAR,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes: match the SQLAlchemy model exactly so ORM-generated queries hit
-- covering indexes. IF NOT EXISTS makes each statement re-runnable.
CREATE UNIQUE INDEX IF NOT EXISTS ix_user_events_event_id      ON user_events (event_id);
CREATE        INDEX IF NOT EXISTS ix_user_events_user_id       ON user_events (user_id);
CREATE        INDEX IF NOT EXISTS ix_user_events_anonymous_id  ON user_events (anonymous_id);
CREATE        INDEX IF NOT EXISTS ix_user_events_event_name    ON user_events (event_name);
CREATE        INDEX IF NOT EXISTS ix_user_events_created_at    ON user_events (created_at);

-- Composite indexes for the hot query paths:
--   • "all events for user X in their first 7 days"  (ML feature query)
CREATE INDEX IF NOT EXISTS ix_user_events_user_time ON user_events (user_id, created_at);
--   • "how many Purchase events last week?"  (cohort rollups)
CREATE INDEX IF NOT EXISTS ix_user_events_name_time ON user_events (event_name, created_at);


-- ─────────────────────────────────────────────────────────────────────────
-- 2. user_profiles — first-touch ad attribution columns.
--    All nullable: users created before this migration have NULL, which is
--    correct (we don't know their first-touch source retroactively).
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS fbp                     VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS fbc                     VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_touch_utm         JSONB;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_touch_landing_url VARCHAR(500);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_touch_referrer    VARCHAR(500);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_touch_at          TIMESTAMPTZ;

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────
-- Rollback (DO NOT RUN unless you intend to discard analytics data):
--
--   BEGIN;
--     DROP TABLE IF EXISTS user_events;
--     ALTER TABLE user_profiles DROP COLUMN IF EXISTS fbp;
--     ALTER TABLE user_profiles DROP COLUMN IF EXISTS fbc;
--     ALTER TABLE user_profiles DROP COLUMN IF EXISTS first_touch_utm;
--     ALTER TABLE user_profiles DROP COLUMN IF EXISTS first_touch_landing_url;
--     ALTER TABLE user_profiles DROP COLUMN IF EXISTS first_touch_referrer;
--     ALTER TABLE user_profiles DROP COLUMN IF EXISTS first_touch_at;
--   COMMIT;
-- ─────────────────────────────────────────────────────────────────────────
