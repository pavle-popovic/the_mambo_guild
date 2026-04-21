"""
Migration 015: Add moderation_status column to posts.

Mirrors the PostReply column added earlier. Enables shadowban-style AI
moderation on posts (author still sees own flagged posts; admins approve
or ghost via the moderation queue).

Idempotent via ADD COLUMN IF NOT EXISTS.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


def run():
    engine = get_engine()
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE posts
            ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20)
                NOT NULL DEFAULT 'active';
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_posts_moderation_status
            ON posts(moderation_status);
        """))
        conn.commit()
        print("Migration 015: Added moderation_status column to posts.")


if __name__ == "__main__":
    run()
