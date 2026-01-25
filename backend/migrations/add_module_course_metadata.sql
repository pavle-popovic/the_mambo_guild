-- Migration: Add module and course metadata fields
-- Date: 2025-01-24

-- Add new fields to levels (modules)
ALTER TABLE levels ADD COLUMN IF NOT EXISTS outcome VARCHAR(255);  -- e.g., "Unlock Stable Turns"
ALTER TABLE levels ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;  -- Total module duration
ALTER TABLE levels ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;  -- Total XP rewards (can be calculated or override)
ALTER TABLE levels ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';  -- active, coming_soon, locked

-- Add new fields to worlds (courses)
ALTER TABLE worlds ADD COLUMN IF NOT EXISTS total_duration_minutes INTEGER DEFAULT 0;  -- Total course duration
ALTER TABLE worlds ADD COLUMN IF NOT EXISTS objectives JSONB DEFAULT '[]'::jsonb;  -- Array of 3 bullet points

-- Seed some default values (optional - calculates from lessons)
-- UPDATE levels SET duration_minutes = (
--   SELECT COALESCE(SUM(duration_minutes), 0) FROM lessons WHERE lessons.level_id = levels.id
-- );
-- UPDATE levels SET total_xp = (
--   SELECT COALESCE(SUM(xp_value), 0) FROM lessons WHERE lessons.level_id = levels.id
-- );
