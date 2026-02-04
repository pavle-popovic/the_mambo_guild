"""
Migration 008: Create Premium Features Tables
- live_calls: Weekly live Zoom calls
- coaching_submissions: 1-on-1 video analysis submissions
- dj_booth_tracks: Stem-separated tracks for the mixer

Run with: python migrations/migration_008_create_premium_tables.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


def run_migration():
    """Create premium feature tables."""
    engine = get_engine()
    
    with engine.connect() as conn:
        # Create live_calls table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS live_calls (
                id UUID PRIMARY KEY,
                title VARCHAR(200) NOT NULL DEFAULT 'Weekly Roundtable',
                description TEXT,
                scheduled_at TIMESTAMP NOT NULL,
                duration_minutes INTEGER NOT NULL DEFAULT 60,
                zoom_link VARCHAR(500) NOT NULL,
                zoom_meeting_id VARCHAR(100),
                status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
                recording_mux_playback_id VARCHAR(100),
                recording_mux_asset_id VARCHAR(100),
                recording_thumbnail_url VARCHAR(500),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT check_live_call_status CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled'))
            );
        """))
        print("✅ Created live_calls table")
        
        # Create coaching_submissions table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS coaching_submissions (
                id UUID PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                video_mux_playback_id VARCHAR(100) NOT NULL,
                video_mux_asset_id VARCHAR(100) NOT NULL,
                video_duration_seconds INTEGER,
                specific_question VARCHAR(140),
                allow_social_share BOOLEAN NOT NULL DEFAULT FALSE,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                feedback_video_url VARCHAR(500),
                feedback_notes TEXT,
                reviewed_by UUID REFERENCES users(id),
                reviewed_at TIMESTAMP,
                submission_month INTEGER NOT NULL,
                submission_year INTEGER NOT NULL,
                submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT check_coaching_status CHECK (status IN ('pending', 'in_review', 'completed', 'expired'))
            );
        """))
        print("✅ Created coaching_submissions table")
        
        # Create index for coaching submissions lookup
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_coaching_user_month_year 
            ON coaching_submissions(user_id, submission_month, submission_year);
        """))
        print("✅ Created coaching_submissions index")
        
        # Create dj_booth_tracks table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS dj_booth_tracks (
                id UUID PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                artist VARCHAR(200) NOT NULL,
                album VARCHAR(200),
                year INTEGER,
                duration_seconds INTEGER NOT NULL,
                bpm INTEGER,
                cover_image_url VARCHAR(500),
                full_mix_url VARCHAR(500) NOT NULL,
                percussion_url VARCHAR(500) NOT NULL,
                piano_bass_url VARCHAR(500) NOT NULL,
                vocals_brass_url VARCHAR(500) NOT NULL,
                order_index INTEGER NOT NULL DEFAULT 0,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        """))
        print("✅ Created dj_booth_tracks table")
        
        conn.commit()
        print("\n✅ Migration 008 completed successfully!")


def rollback_migration():
    """Drop premium feature tables."""
    engine = get_engine()
    
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS dj_booth_tracks CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS coaching_submissions CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS live_calls CASCADE;"))
        conn.commit()
        print("✅ Rolled back migration 008")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        rollback_migration()
    else:
        run_migration()
