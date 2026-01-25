-- Migration: Add Mux preview video fields to levels table
-- These fields enable animated GIF previews for skill tree nodes on hover

ALTER TABLE levels
    ADD COLUMN IF NOT EXISTS mux_preview_playback_id VARCHAR,
    ADD COLUMN IF NOT EXISTS mux_preview_asset_id VARCHAR;

-- Add comment for clarity
COMMENT ON COLUMN levels.mux_preview_playback_id IS 'Mux playback ID for hover preview video (animated GIF)';
COMMENT ON COLUMN levels.mux_preview_asset_id IS 'Mux asset ID for cleanup/deletion';
