"""
Migration 017: Collapse post reactions to a single 'like' type.

Previously post_reactions.reaction_type allowed 'fire' | 'ruler' | 'clap'.
With the community revamp, those three emojis are being repurposed as
video-type categories on posts themselves (see migration 016). Reactions
on posts are now a single toggleable 'like'.

This migration:
  1. Drops the old CHECK constraint on reaction_type.
  2. Collapses all existing reaction rows to 'like'. The unique
     (post_id, user_id) constraint already prevents double-counting.
  3. Adds a new CHECK constraint restricting reaction_type to 'like'.

Idempotent: constraint drop/add guard against re-runs via IF EXISTS.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


def run():
    engine = get_engine()
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            conn.execute(text("""
                ALTER TABLE post_reactions
                DROP CONSTRAINT IF EXISTS check_reaction_type;
            """))
            result = conn.execute(text("""
                UPDATE post_reactions
                SET reaction_type = 'like'
                WHERE reaction_type <> 'like';
            """))
            conn.execute(text("""
                ALTER TABLE post_reactions
                ADD CONSTRAINT check_reaction_type
                CHECK (reaction_type = 'like');
            """))
            trans.commit()
            print(f"Migration 017: Collapsed {result.rowcount} reactions to 'like'.")
        except Exception:
            trans.rollback()
            raise


if __name__ == "__main__":
    run()
