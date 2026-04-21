"""
Migration 016: Add video_type column to posts.

Categorizes Stage video posts into three types (rendered with the former
reaction emojis in the UI):
  - motw:     Move of the Week submission (fire)
  - original: Own choreo or freestyle      (metronome)
  - guild:    Choreo from Guild classes    (clap)

Lab posts stay NULL. Existing Stage posts are backfilled to 'original'
(safest assumption for user-submitted practice).

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
            ADD COLUMN IF NOT EXISTS video_type VARCHAR(20);
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_posts_video_type
            ON posts(video_type);
        """))
        # Backfill: existing Stage posts default to 'original'.
        result = conn.execute(text("""
            UPDATE posts
            SET video_type = 'original'
            WHERE post_type = 'stage' AND video_type IS NULL;
        """))
        conn.commit()
        print(f"Migration 016: Added video_type column; backfilled {result.rowcount} Stage posts to 'original'.")


if __name__ == "__main__":
    run()
