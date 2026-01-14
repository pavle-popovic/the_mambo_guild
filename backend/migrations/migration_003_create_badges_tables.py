"""
Migration 003: Create Badge System Tables
- badge_definitions: All available badges and their requirements
- user_badges: Track which badges each user has earned
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


def run_migration():
    """Create badge system tables."""
    engine = get_engine()
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # ============================================
            # 1. Create badge_definitions table
            # ============================================
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'badge_definitions'
                )
            """))
            table_exists = result.scalar()
            
            if not table_exists:
                print("Creating badge_definitions table...")
                conn.execute(text("""
                    CREATE TABLE badge_definitions (
                        id VARCHAR(50) PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        description TEXT NOT NULL,
                        icon_url VARCHAR(255),
                        category VARCHAR(20) NOT NULL CHECK (category IN ('course', 'community', 'performance')),
                        requirement_type VARCHAR(50) NOT NULL,
                        requirement_value INTEGER NOT NULL,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                """))
                print("✓ badge_definitions table created")
                
                # Seed initial badges
                print("Seeding badge definitions...")
                conn.execute(text("""
                    INSERT INTO badge_definitions (id, name, description, category, requirement_type, requirement_value) VALUES
                    ('metronome', 'The Metronome', 'Completed 7 drills in 7 consecutive days', 'course', 'drills_7_days', 7),
                    ('the_lion', 'The Lion', 'Completed Advanced Mastery Course', 'course', 'course_complete', 1),
                    ('el_maestro', 'El Maestro', '10 answers marked as Solution', 'community', 'solutions_given', 10),
                    ('the_eye', 'The Eye', 'Reacted 100 times', 'community', 'reactions_given', 100),
                    ('first_responder', 'First Responder', 'Answered 5 questions within 1 hour of posting', 'community', 'fast_answers', 5),
                    ('firestarter', 'Firestarter', 'Received 100 Fire reactions on your posts', 'performance', 'fires_received', 100),
                    ('cinematographer', 'The Cinematographer', 'Posted 10 high-resolution videos to The Stage', 'performance', 'hd_videos_posted', 10)
                """))
                print("✓ Badge definitions seeded")
            else:
                print("✓ badge_definitions table already exists")
            
            # ============================================
            # 2. Create user_badges table
            # ============================================
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'user_badges'
                )
            """))
            table_exists = result.scalar()
            
            if not table_exists:
                print("Creating user_badges table...")
                conn.execute(text("""
                    CREATE TABLE user_badges (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        badge_id VARCHAR(50) NOT NULL REFERENCES badge_definitions(id),
                        earned_at TIMESTAMP DEFAULT NOW(),
                        UNIQUE(user_id, badge_id)
                    )
                """))
                conn.execute(text("""
                    CREATE INDEX idx_user_badges_user_id ON user_badges(user_id)
                """))
                print("✓ user_badges table created")
            else:
                print("✓ user_badges table already exists")
            
            trans.commit()
            print("\n✅ Migration 003 completed successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration 003 failed: {e}")
            raise


if __name__ == "__main__":
    run_migration()
