"""
Migration 006: Update Badges and Add User Stats (v4.0 Gamification)
- badge_definitions: Add 'tier' and rename 'requirement_value' to 'threshold'
- user_badges: Add 'display_order'
- user_stats: Create new table for aggregated gamification stats
- user_profiles: Add 'reputation'
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


def run_migration():
    """Update schema for v4.0 gamification."""
    engine = get_engine()
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            print("Starting Migration 006 (Gamification Updates)...")

            # ============================================
            # 1. Update badge_definitions
            # ============================================
            # Check if 'tier' exists
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'badge_definitions' AND column_name = 'tier'
                )
            """))
            if not result.scalar():
                print("Adding 'tier' to badge_definitions...")
                conn.execute(text("ALTER TABLE badge_definitions ADD COLUMN tier VARCHAR(20) DEFAULT 'silver'"))
            
            # Check if 'threshold' exists (or rename requirement_value)
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'badge_definitions' AND column_name = 'threshold'
                )
            """))
            if not result.scalar():
                print("Renaming 'requirement_value' to 'threshold'...")
                # Check if requirement_value exists first (it should)
                conn.execute(text("ALTER TABLE badge_definitions RENAME COLUMN requirement_value TO threshold"))

            # ============================================
            # 2. Update user_badges
            # ============================================
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'user_badges' AND column_name = 'display_order'
                )
            """))
            if not result.scalar():
                print("Adding 'display_order' to user_badges...")
                conn.execute(text("ALTER TABLE user_badges ADD COLUMN display_order INTEGER DEFAULT 0"))

            # ============================================
            # 3. Create user_stats
            # ============================================
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'user_stats'
                )
            """))
            if not result.scalar():
                print("Creating user_stats table...")
                conn.execute(text("""
                    CREATE TABLE user_stats (
                        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                        reactions_given_count INTEGER DEFAULT 0,
                        reactions_received_count INTEGER DEFAULT 0,
                        solutions_accepted_count INTEGER DEFAULT 0,
                        last_updated TIMESTAMP DEFAULT NOW()
                    )
                """))

            # ============================================
            # 4. Update user_profiles
            # ============================================
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'user_profiles' AND column_name = 'reputation'
                )
            """))
            if not result.scalar():
                print("Adding 'reputation' to user_profiles...")
                conn.execute(text("ALTER TABLE user_profiles ADD COLUMN reputation INTEGER DEFAULT 0"))

            trans.commit()
            print("\n✅ Migration 006 completed successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration 006 failed: {e}")
            raise


if __name__ == "__main__":
    run_migration()
