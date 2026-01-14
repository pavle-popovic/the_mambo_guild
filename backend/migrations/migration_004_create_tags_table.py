"""
Migration 004: Create Community Tags Table
- community_tags: Predefined taxonomy for post categorization
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


def run_migration():
    """Create community tags table."""
    engine = get_engine()
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # ============================================
            # 1. Create community_tags table
            # ============================================
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'community_tags'
                )
            """))
            table_exists = result.scalar()
            
            if not table_exists:
                print("Creating community_tags table...")
                conn.execute(text("""
                    CREATE TABLE community_tags (
                        slug VARCHAR(50) PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        category VARCHAR(50),
                        usage_count INTEGER DEFAULT 0
                    )
                """))
                print("✓ community_tags table created")
                
                # Seed initial tags
                print("Seeding community tags...")
                conn.execute(text("""
                    INSERT INTO community_tags (slug, name, category) VALUES
                    ('on2', 'On2 Timing', 'technique'),
                    ('on1', 'On1 Timing', 'technique'),
                    ('spinning', 'Spinning', 'technique'),
                    ('musicality', 'Musicality', 'general'),
                    ('partnerwork', 'Partnerwork', 'technique'),
                    ('footwork', 'Footwork', 'technique'),
                    ('styling', 'Styling', 'general'),
                    ('shines', 'Shines', 'technique'),
                    ('beginner', 'Beginner', 'general'),
                    ('intermediate', 'Intermediate', 'general'),
                    ('advanced', 'Advanced', 'general'),
                    ('body-movement', 'Body Movement', 'technique'),
                    ('timing', 'Timing', 'technique'),
                    ('history', 'History & Culture', 'general'),
                    ('question', 'Question', 'general')
                """))
                print("✓ Community tags seeded")
            else:
                print("✓ community_tags table already exists")
            
            trans.commit()
            print("\n✅ Migration 004 completed successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration 004 failed: {e}")
            raise


if __name__ == "__main__":
    run_migration()
