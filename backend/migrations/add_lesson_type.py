"""Add lesson_type to lessons table."""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine

def run_migration():
    engine = get_engine()
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # Check if column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='lessons' AND column_name='lesson_type'
            """))
            if result.fetchone() is None:
                print("Adding lesson_type column...")
                # Add column with default value 'video'
                conn.execute(text("""
                    ALTER TABLE lessons 
                    ADD COLUMN lesson_type VARCHAR DEFAULT 'video' NOT NULL
                """))
                print("✓ lesson_type column added")
            else:
                print("✓ lesson_type column already exists")
            
            trans.commit()
            print("\n✅ Migration completed successfully!")
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration failed: {e}")
            raise

if __name__ == "__main__":
    run_migration()

