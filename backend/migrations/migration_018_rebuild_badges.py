"""
Migration 018: Retire fire/ruler/clap badge families; add video-type and
total-likes badge families.

With the community revamp, reactions collapse to a single 'like' and the
three old reaction emojis become video-type categories. Badges follow.

Changes:
  1. Adds `is_active` boolean column on badge_definitions (default TRUE).
     The trophy case filters unearned badges by is_active so retired
     families stop showing up in the "unearned" tab.
  2. Marks legacy badge defs inactive (requirement_type IN
     ('fires_received', 'claps_received', 'metronomes_received')). Users
     who earned them still see them in their trophy case.
  3. Seeds four new badge families with bronze/silver/gold/diamond tiers:
       - motw_videos:     Move Master       (3 / 10 / 25 / 50)
       - original_videos: The Originator    (3 / 10 / 25 / 50)
       - guild_videos:    Class Act         (3 / 10 / 25 / 50)
       - likes_received:  Crowd Favorite    (10 / 50 / 200 / 1000)

Idempotent: ADD COLUMN IF NOT EXISTS and ON CONFLICT DO UPDATE.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


NEW_BADGES = [
    # (id, name, description, tier, category, requirement_type, threshold)
    ("motw_bronze",    "Move Master I",    "Posted 3 Move of the Week submissions",   "bronze",  "community", "motw_videos",     3),
    ("motw_silver",    "Move Master II",   "Posted 10 Move of the Week submissions",  "silver",  "community", "motw_videos",    10),
    ("motw_gold",      "Move Master III",  "Posted 25 Move of the Week submissions",  "gold",    "community", "motw_videos",    25),
    ("motw_diamond",   "Move Master IV",   "Posted 50 Move of the Week submissions",  "diamond", "community", "motw_videos",    50),

    ("original_bronze",  "The Originator I",   "Shared 3 original choreos or freestyles",   "bronze",  "community", "original_videos",  3),
    ("original_silver",  "The Originator II",  "Shared 10 original choreos or freestyles",  "silver",  "community", "original_videos", 10),
    ("original_gold",    "The Originator III", "Shared 25 original choreos or freestyles",  "gold",    "community", "original_videos", 25),
    ("original_diamond", "The Originator IV",  "Shared 50 original choreos or freestyles",  "diamond", "community", "original_videos", 50),

    ("guild_bronze",   "Class Act I",    "Posted 3 Guild class choreos",   "bronze",  "community", "guild_videos",  3),
    ("guild_silver",   "Class Act II",   "Posted 10 Guild class choreos",  "silver",  "community", "guild_videos", 10),
    ("guild_gold",     "Class Act III",  "Posted 25 Guild class choreos",  "gold",    "community", "guild_videos", 25),
    ("guild_diamond",  "Class Act IV",   "Posted 50 Guild class choreos",  "diamond", "community", "guild_videos", 50),

    ("liked_bronze",   "Crowd Favorite I",   "Received 10 likes on your posts",    "bronze",  "community", "likes_received",   10),
    ("liked_silver",   "Crowd Favorite II",  "Received 50 likes on your posts",    "silver",  "community", "likes_received",   50),
    ("liked_gold",     "Crowd Favorite III", "Received 200 likes on your posts",   "gold",    "community", "likes_received",  200),
    ("liked_diamond",  "Crowd Favorite IV",  "Received 1000 likes on your posts",  "diamond", "community", "likes_received", 1000),
]


LEGACY_REQUIREMENT_TYPES = ("fires_received", "claps_received", "metronomes_received")


def run():
    engine = get_engine()
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            conn.execute(text("""
                ALTER TABLE badge_definitions
                ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
            """))

            retired = conn.execute(
                text("""
                    UPDATE badge_definitions
                    SET is_active = FALSE
                    WHERE requirement_type = ANY(:types)
                """),
                {"types": list(LEGACY_REQUIREMENT_TYPES)},
            )

            for bid, name, desc, tier, category, req_type, threshold in NEW_BADGES:
                conn.execute(
                    text("""
                        INSERT INTO badge_definitions
                            (id, name, description, tier, category, requirement_type, threshold, is_active, created_at)
                        VALUES
                            (:id, :name, :description, :tier, :category, :requirement_type, :threshold, TRUE, NOW())
                        ON CONFLICT (id) DO UPDATE SET
                            name = EXCLUDED.name,
                            description = EXCLUDED.description,
                            tier = EXCLUDED.tier,
                            category = EXCLUDED.category,
                            requirement_type = EXCLUDED.requirement_type,
                            threshold = EXCLUDED.threshold,
                            is_active = TRUE
                    """),
                    {
                        "id": bid,
                        "name": name,
                        "description": desc,
                        "tier": tier,
                        "category": category,
                        "requirement_type": req_type,
                        "threshold": threshold,
                    },
                )

            trans.commit()
            print(f"Migration 018: Retired {retired.rowcount} legacy badge defs; "
                  f"upserted {len(NEW_BADGES)} new badge defs.")
        except Exception:
            trans.rollback()
            raise


if __name__ == "__main__":
    run()
