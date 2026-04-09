-- ============================================================================
-- BETA SYNC MIGRATIONS — paste this whole file into Supabase SQL editor.
-- Safe to run multiple times (idempotent via IF NOT EXISTS / ON CONFLICT).
-- ============================================================================
--
-- What this runs:
--   1. Adds `moderation_status` column to post_replies (AI Moderation feature)
--   2. Creates `saved_posts` table (Saved Posts feature)
--   3. Seeds 16 rows into `community_tags` (Community taxonomy)
--
-- Does NOT run: badge PNG upload to R2 — that's handled by a separate Python
-- script and is cosmetic (badges still work with existing icons).
--
-- Wrap everything in a single transaction so a failure mid-way rolls back.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. post_replies.moderation_status
-- ----------------------------------------------------------------------------
ALTER TABLE post_replies
  ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS ix_post_replies_moderation_status
  ON post_replies (moderation_status);

-- ----------------------------------------------------------------------------
-- 2. saved_posts table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_posts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id    UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP   NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_saved_post UNIQUE (user_id, post_id)
);

CREATE INDEX IF NOT EXISTS ix_saved_posts_user_id ON saved_posts (user_id);
CREATE INDEX IF NOT EXISTS ix_saved_posts_post_id ON saved_posts (post_id);

-- ----------------------------------------------------------------------------
-- 3. community_tags seed data (16 rows)
-- ----------------------------------------------------------------------------
INSERT INTO community_tags (slug, name, category, usage_count) VALUES
  ('advanced',      'Advanced',      'Level',  0),
  ('beginner',      'Beginner',      'Level',  0),
  ('body-movement', 'Body Movement', 'Focus',  0),
  ('boogaloo',      'Boogaloo',      'Style',  0),
  ('cha-cha-cha',   'Cha Cha Cha',   'Style',  0),
  ('choreo',        'Choreo',        'Focus',  0),
  ('drills',        'Drills',        'Focus',  0),
  ('intermediate',  'Intermediate',  'Level',  0),
  ('mambo',         'Mambo',         'Style',  0),
  ('musicality',    'Musicality',    'Focus',  0),
  ('pachanga',      'Pachanga',      'Style',  0),
  ('salsa-fusion',  'Salsa Fusion',  'Style',  0),
  ('salsa-on2',     'Salsa On2',     'Style',  0),
  ('styling',       'Styling',       'Focus',  0),
  ('timing',        'Timing',        'Focus',  0),
  ('turn',          'Turn',          'Focus',  0)
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- ============================================================================
-- Verification queries — run these AFTER the migration to confirm success.
-- ============================================================================

-- Should return 'active' column type: character varying(20)
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'post_replies' AND column_name = 'moderation_status';

-- Should return 1 row (the saved_posts table exists)
SELECT table_name FROM information_schema.tables WHERE table_name = 'saved_posts';

-- Should return 16
SELECT COUNT(*) AS total_tags FROM community_tags;
