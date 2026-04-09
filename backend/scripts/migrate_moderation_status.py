"""
Migration: Add moderation_status column to post_replies table.

Run once:
  python scripts/migrate_moderation_status.py

Safe to re-run — checks if column exists first.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_engine
from sqlalchemy import text

def migrate():
    engine = get_engine()
    with engine.connect() as conn:
        # Check if column already exists
        result = conn.execute(text("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'post_replies'
              AND column_name = 'moderation_status'
        """))
        if result.fetchone():
            print("Column 'moderation_status' already exists — skipping.")
            return

        # Add column with default 'active'
        conn.execute(text("""
            ALTER TABLE post_replies
            ADD COLUMN moderation_status VARCHAR(20) NOT NULL DEFAULT 'active'
        """))

        # Add index for fast admin queries
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_post_replies_moderation_status
            ON post_replies (moderation_status)
        """))

        conn.commit()
        print("Migration complete: added 'moderation_status' column to post_replies.")

if __name__ == "__main__":
    migrate()
