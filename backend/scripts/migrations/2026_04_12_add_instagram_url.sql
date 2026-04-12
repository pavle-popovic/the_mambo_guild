-- Add instagram_url to user_profiles (2026-04-12)
--
-- Additive, nullable column for the "Connect on Instagram" link shown in
-- the public profile modal. Safe to re-run (IF NOT EXISTS).
--
-- Run this in Supabase SQL editor before deploying the backend.

ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255);
