"""
Migration: Create saved_posts table for bookmarks.

Run once:
  python scripts/migrate_saved_posts.py

Safe to re-run — checks if table exists first.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_engine
from sqlalchemy import text

def migrate():
    engine = get_engine()
    with engine.connect() as conn:
        # Check if table already exists
        result = conn.execute(text("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_name = 'saved_posts'
        """))
        if result.fetchone():
            print("Table 'saved_posts' already exists — skipping.")
            return

        conn.execute(text("""
            CREATE TABLE saved_posts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT unique_user_saved_post UNIQUE (user_id, post_id)
            )
        """))

        conn.execute(text("""
            CREATE INDEX ix_saved_posts_user_id ON saved_posts (user_id)
        """))
        conn.execute(text("""
            CREATE INDEX ix_saved_posts_post_id ON saved_posts (post_id)
        """))

        conn.commit()
        print("Migration complete: created 'saved_posts' table.")

if __name__ == "__main__":
    migrate()
