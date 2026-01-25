-- Migration: Add skill tree graph properties
-- This adds columns to levels table and creates level_edges table

-- Add new columns to levels table
ALTER TABLE levels 
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS x_position REAL DEFAULT 0.0 NOT NULL,
    ADD COLUMN IF NOT EXISTS y_position REAL DEFAULT 0.0 NOT NULL,
    ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR;

-- Create level_edges table
CREATE TABLE IF NOT EXISTS level_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    world_id UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
    from_level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    to_level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    CONSTRAINT fk_level_edges_world FOREIGN KEY (world_id) REFERENCES worlds(id),
    CONSTRAINT fk_level_edges_from FOREIGN KEY (from_level_id) REFERENCES levels(id),
    CONSTRAINT fk_level_edges_to FOREIGN KEY (to_level_id) REFERENCES levels(id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS ix_level_edges_world_id ON level_edges(world_id);
CREATE INDEX IF NOT EXISTS ix_level_edges_from_level ON level_edges(from_level_id);
CREATE INDEX IF NOT EXISTS ix_level_edges_to_level ON level_edges(to_level_id);
