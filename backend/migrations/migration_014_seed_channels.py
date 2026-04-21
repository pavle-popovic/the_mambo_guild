"""
Migration 014: Seed community "channels" as CommunityTag rows.

Channels are top-level rooms for community posts (Technique, Music & Rhythm,
History & Culture, Social Dancing, Practice Feedback, Check-ins & Wins).
They live in the existing community_tags table with category='channel' so
the feed, filters, and post composer can treat them distinctly without a
new table.

Idempotent: re-running inserts only missing rows (ON CONFLICT DO NOTHING).
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


CHANNELS = [
    ("ch-technique", "Technique", "channel"),
    ("ch-music-rhythm", "Music & Rhythm", "channel"),
    ("ch-history-culture", "History & Culture", "channel"),
    ("ch-social-dancing", "Social Dancing", "channel"),
    ("ch-practice-feedback", "Practice Feedback", "channel"),
    ("ch-checkins-wins", "Check-ins & Wins", "channel"),
]


def run():
    engine = get_engine()
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            for slug, name, category in CHANNELS:
                conn.execute(
                    text(
                        """
                        INSERT INTO community_tags (slug, name, category, usage_count)
                        VALUES (:slug, :name, :category, 0)
                        ON CONFLICT (slug) DO UPDATE SET
                            name = EXCLUDED.name,
                            category = EXCLUDED.category
                        """
                    ),
                    {"slug": slug, "name": name, "category": category},
                )
            trans.commit()
            print(f"Migration 014: Seeded {len(CHANNELS)} community channels.")
        except Exception:
            trans.rollback()
            raise


if __name__ == "__main__":
    run()
