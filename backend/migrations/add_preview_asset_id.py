"""Add mux_preview_asset_id column to worlds table."""
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
                WHERE table_name='worlds' AND column_name='mux_preview_asset_id'
            """))
            if result.fetchone() is None:
                print("Adding mux_preview_asset_id column...")
                conn.execute(text("""
                    ALTER TABLE worlds 
                    ADD COLUMN mux_preview_asset_id VARCHAR
                """))
                print("✓ mux_preview_asset_id column added")
            else:
                print("✓ mux_preview_asset_id column already exists")
            
            trans.commit()
            print("\n✅ Migration completed successfully!")
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration failed: {e}")
            raise

if __name__ == "__main__":
    run_migration()

