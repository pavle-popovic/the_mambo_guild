"""
Migration script to add mux_playback_id and mux_asset_id fields to lessons table.
"""
import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from config import settings

def migrate():
    """Add Mux fields to lessons table."""
    engine = create_engine(settings.DATABASE_URL, echo=True)
    
    try:
        with engine.begin() as conn:
            # Check if columns already exist
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'lessons' AND column_name IN ('mux_playback_id', 'mux_asset_id')
            """))
            existing_columns = {row[0] for row in result}
            
            # Add mux_playback_id if it doesn't exist
            if 'mux_playback_id' not in existing_columns:
                print("Adding mux_playback_id column...")
                conn.execute(text("""
                    ALTER TABLE lessons 
                    ADD COLUMN mux_playback_id VARCHAR
                """))
                print("✓ Added mux_playback_id column")
            
            # Add mux_asset_id if it doesn't exist
            if 'mux_asset_id' not in existing_columns:
                print("Adding mux_asset_id column...")
                conn.execute(text("""
                    ALTER TABLE lessons 
                    ADD COLUMN mux_asset_id VARCHAR
                """))
                print("✓ Added mux_asset_id column")
            
            print("\n✅ Migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Migration error: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    migrate()
