"""
Migration 010: Add soft-delete columns to posts and post_replies tables.
Also adds updated_at column to post_replies.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


def run():
    engine = get_engine()
    with engine.connect() as conn:
        # Add is_deleted to posts
        conn.execute(text("""
            ALTER TABLE posts
            ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
        """))

        # Add is_deleted and updated_at to post_replies
        conn.execute(text("""
            ALTER TABLE post_replies
            ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
        """))
        conn.execute(text("""
            ALTER TABLE post_replies
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
        """))

        conn.commit()
        print("Migration 010: Added is_deleted columns to posts and post_replies.")


if __name__ == "__main__":
    run()
