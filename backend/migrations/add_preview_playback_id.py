"""
Migration script to add mux_preview_playback_id column to the worlds table.
Run this script to update the database schema.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine
from config import settings

def run_migration():
    """Add mux_preview_playback_id column to worlds table if it doesn't exist."""
    engine = get_engine()
    
    with engine.connect() as conn:
        # Start a transaction
        trans = conn.begin()
        
        try:
            # Check if column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='worlds' AND column_name='mux_preview_playback_id'
            """))
            
            if result.fetchone() is None:
                print("Adding mux_preview_playback_id column...")
                conn.execute(text("""
                    ALTER TABLE worlds 
                    ADD COLUMN mux_preview_playback_id VARCHAR
                """))
                print("✓ mux_preview_playback_id column added")
            else:
                print("✓ mux_preview_playback_id column already exists")
            
            # Commit the transaction
            trans.commit()
            print("\n✅ Migration completed successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration failed: {e}")
            raise

if __name__ == "__main__":
    print("Running preview playback ID migration...")
    print(f"Database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'N/A'}\n")
    run_migration()

