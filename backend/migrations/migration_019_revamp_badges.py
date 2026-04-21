"""
Migration 019: Full badge revamp.

Goals:
  * Keep Founder X, Pro Member, Guild Master, Beta Tester as-is.
  * Rename `beta_tester`'s trigger: the "3 referrals" path becomes a NEW badge,
    `promoter`. Beta Tester stays as a manual-grant-only founders badge.
  * Make bronze tiers achievable at 1 (hook effect, reduces churn) and push
    gold/diamond harder.
  * Add three NEW like-per-video-type badge families alongside the existing
    total-likes family:
        - motw_love_*       likes received on MOTW posts
        - original_love_*   likes received on original posts
        - guild_love_*      likes received on guild posts
  * Rewrite names + descriptions across the board so the trophy case reads
    consistently in English (i18n layer will supply localized names, this is
    the English fallback).

Idempotent: all writes are UPDATEs or UPSERTs. Existing UserBadge rows are
never touched, so anyone who already earned a badge keeps it.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


# Every row: (id, name, description, tier, category, requirement_type, threshold)
# Ordered family-by-family for readability.
REVAMPED_BADGES = [
    # --- MOTW videos posted (Move Master) ---
    ("motw_bronze",   "Move Master I",   "Posted your first Move of the Week video. Welcome to the floor.", "bronze",  "community", "motw_videos",   1),
    ("motw_silver",   "Move Master II",  "Posted 10 Move of the Week videos.",                               "silver",  "community", "motw_videos",  10),
    ("motw_gold",     "Move Master III", "Posted 30 Move of the Week videos. You're a regular.",             "gold",    "community", "motw_videos",  30),
    ("motw_diamond",  "Move Master IV",  "Posted 100 Move of the Week videos. Certified weekly legend.",     "diamond", "community", "motw_videos", 100),

    # --- Original videos posted (The Originator) ---
    ("original_bronze",  "The Originator I",   "Shared your first original choreo or freestyle.",                     "bronze",  "community", "original_videos",   1),
    ("original_silver",  "The Originator II",  "Shared 10 original choreos or freestyles.",                            "silver",  "community", "original_videos",  10),
    ("original_gold",    "The Originator III", "Shared 30 original choreos or freestyles. You have a voice.",          "gold",    "community", "original_videos",  30),
    ("original_diamond", "The Originator IV",  "Shared 100 original choreos or freestyles. A true creator.",           "diamond", "community", "original_videos", 100),

    # --- Guild choreos posted (Class Act) ---
    ("guild_bronze",   "Class Act I",    "Posted your first Guild-class choreo.",                             "bronze",  "community", "guild_videos",   1),
    ("guild_silver",   "Class Act II",   "Posted 10 Guild-class choreos.",                                    "silver",  "community", "guild_videos",  10),
    ("guild_gold",     "Class Act III",  "Posted 30 Guild-class choreos. Full ensemble material.",            "gold",    "community", "guild_videos",  30),
    ("guild_diamond",  "Class Act IV",   "Posted 100 Guild-class choreos. Guild pillar.",                     "diamond", "community", "guild_videos", 100),

    # --- Any video posted (Center Stage) ---
    ("center_stage_bronze",  "Center Stage I",   "Posted your first video to The Stage.",                          "bronze",  "performance", "videos_posted",   1),
    ("center_stage_silver",  "Center Stage II",  "Posted 25 videos to The Stage.",                                 "silver",  "performance", "videos_posted",  25),
    ("center_stage_gold",    "Center Stage III", "Posted 75 videos to The Stage. Mic check permanent.",            "gold",    "performance", "videos_posted",  75),
    ("center_stage_diamond", "Center Stage IV",  "Posted 250 videos to The Stage. Headliner status.",              "diamond", "performance", "videos_posted", 250),

    # --- Total likes received (Crowd Favorite) ---
    ("liked_bronze",   "Crowd Favorite I",    "Received your first like.",                               "bronze",  "community", "likes_received",    1),
    ("liked_silver",   "Crowd Favorite II",   "Received 100 total likes across your posts.",             "silver",  "community", "likes_received",  100),
    ("liked_gold",     "Crowd Favorite III",  "Received 500 total likes across your posts.",             "gold",    "community", "likes_received",  500),
    ("liked_diamond",  "Crowd Favorite IV",   "Received 2,500 total likes. The room loves you.",         "diamond", "community", "likes_received", 2500),

    # --- NEW: Likes on MOTW posts (Move Magnet) ---
    ("motw_love_bronze",  "Move Magnet I",   "Got your first like on a Move of the Week video.",  "bronze",  "community", "motw_likes",    1),
    ("motw_love_silver",  "Move Magnet II",  "25 likes across your Move of the Week videos.",     "silver",  "community", "motw_likes",   25),
    ("motw_love_gold",    "Move Magnet III", "150 likes across your Move of the Week videos.",    "gold",    "community", "motw_likes",  150),
    ("motw_love_diamond", "Move Magnet IV",  "1,000 likes across your Move of the Week videos.",  "diamond", "community", "motw_likes", 1000),

    # --- NEW: Likes on Original posts (Fan Favorite) ---
    ("original_love_bronze",  "Fan Favorite I",   "Got your first like on an original post.",    "bronze",  "community", "original_likes",    1),
    ("original_love_silver",  "Fan Favorite II",  "25 likes across your original posts.",        "silver",  "community", "original_likes",   25),
    ("original_love_gold",    "Fan Favorite III", "150 likes across your original posts.",       "gold",    "community", "original_likes",  150),
    ("original_love_diamond", "Fan Favorite IV",  "1,000 likes across your original posts.",     "diamond", "community", "original_likes", 1000),

    # --- NEW: Likes on Guild posts (Guild Applause) ---
    ("guild_love_bronze",  "Guild Applause I",   "Got your first like on a Guild-class post.",   "bronze",  "community", "guild_likes",    1),
    ("guild_love_silver",  "Guild Applause II",  "25 likes across your Guild-class posts.",      "silver",  "community", "guild_likes",   25),
    ("guild_love_gold",    "Guild Applause III", "150 likes across your Guild-class posts.",     "gold",    "community", "guild_likes",  150),
    ("guild_love_diamond", "Guild Applause IV",  "1,000 likes across your Guild-class posts.",   "diamond", "community", "guild_likes", 1000),

    # --- Likes given (Talent Scout) ---
    ("talent_scout_bronze",  "Talent Scout I",   "Gave your first like.",                   "bronze",  "community", "reactions_given",    1),
    ("talent_scout_silver",  "Talent Scout II",  "Gave 100 likes across the community.",    "silver",  "community", "reactions_given",  100),
    ("talent_scout_gold",    "Talent Scout III", "Gave 500 likes. Eye for talent.",         "gold",    "community", "reactions_given",  500),
    ("talent_scout_diamond", "Talent Scout IV",  "Gave 2,500 likes. Community champion.",   "diamond", "community", "reactions_given", 2500),

    # --- Comments posted (The Socialite) ---
    ("the_socialite_bronze",  "The Socialite I",   "Left your first comment.",                                  "bronze",  "community", "comments_posted",    1),
    ("the_socialite_silver",  "The Socialite II",  "Left 50 comments.",                                         "silver",  "community", "comments_posted",   50),
    ("the_socialite_gold",    "The Socialite III", "Left 250 comments. You're the conversation.",              "gold",    "community", "comments_posted",  250),
    ("the_socialite_diamond", "The Socialite IV",  "Left 1,000 comments. Literally can't stop talking dance.", "diamond", "community", "comments_posted", 1000),

    # --- Questions posted (Curious Mind) ---
    ("curious_mind_bronze",  "Curious Mind I",   "Asked your first question in the Lab.",           "bronze",  "community", "questions_posted",   1),
    ("curious_mind_silver",  "Curious Mind II",  "Asked 15 questions in the Lab.",                  "silver",  "community", "questions_posted",  15),
    ("curious_mind_gold",    "Curious Mind III", "Asked 50 questions in the Lab.",                  "gold",    "community", "questions_posted",  50),
    ("curious_mind_diamond", "Curious Mind IV",  "Asked 150 questions. The Lab runs on your why.",  "diamond", "community", "questions_posted", 150),

    # --- Solutions accepted (The Professor) ---
    ("the_professor_bronze",  "The Professor I",   "Had your first answer marked as the solution.",       "bronze",  "community", "solutions_accepted",   1),
    ("the_professor_silver",  "The Professor II",  "Had 10 answers marked as solutions.",                 "silver",  "community", "solutions_accepted",  10),
    ("the_professor_gold",    "The Professor III", "Had 40 answers marked as solutions. Tenured.",        "gold",    "community", "solutions_accepted",  40),
    ("the_professor_diamond", "The Professor IV",  "Had 150 answers marked as solutions. Department chair.", "diamond", "community", "solutions_accepted", 150),

    # --- Daily streak (Unstoppable) ---
    ("unstoppable_bronze",  "Unstoppable I",   "Logged in two days in a row.",                 "bronze",  "community", "daily_streak",   1),
    ("unstoppable_silver",  "Unstoppable II",  "14-day practice streak.",                      "silver",  "community", "daily_streak",  14),
    ("unstoppable_gold",    "Unstoppable III", "60-day practice streak. Two months, pure.",    "gold",    "community", "daily_streak",  60),
    ("unstoppable_diamond", "Unstoppable IV",  "200-day practice streak. Built different.",    "diamond", "community", "daily_streak", 200),

    # --- NEW: Referral promoter (replaces old beta_tester trigger) ---
    ("promoter", "Promoter", "Brought 3 dancers into the Guild through your referral link.",
        "gold", "special", "referrals_converted", 3),
]


# Badges that should remain untouched (manual / subscription)
PROTECTED_IDS = ("founder_diamond", "beta_tester", "pro_member", "guild_master")


def run():
    engine = get_engine()
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # Ensure is_active column exists (added in 018, but be safe).
            conn.execute(text("""
                ALTER TABLE badge_definitions
                ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
            """))

            # Upsert every revamped badge. Keeps existing UserBadge rows intact
            # because badge IDs are stable.
            for bid, name, desc, tier, category, req_type, threshold in REVAMPED_BADGES:
                conn.execute(
                    text("""
                        INSERT INTO badge_definitions
                            (id, name, description, tier, category, requirement_type, threshold, is_active, created_at)
                        VALUES
                            (:id, :name, :description, :tier, :category, :requirement_type, :threshold, TRUE, NOW())
                        ON CONFLICT (id) DO UPDATE SET
                            name             = EXCLUDED.name,
                            description      = EXCLUDED.description,
                            tier             = EXCLUDED.tier,
                            category         = EXCLUDED.category,
                            requirement_type = EXCLUDED.requirement_type,
                            threshold        = EXCLUDED.threshold,
                            is_active        = TRUE
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

            # Make sure the protected specials are active with the right metadata.
            # (Only normalise flags; don't rewrite names or descriptions.)
            conn.execute(
                text("""
                    UPDATE badge_definitions
                    SET is_active = TRUE
                    WHERE id = ANY(:ids)
                """),
                {"ids": list(PROTECTED_IDS)},
            )

            trans.commit()

            total = conn.execute(
                text("SELECT COUNT(*) FROM badge_definitions WHERE is_active = TRUE")
            ).scalar()
            print(f"Migration 019: upserted {len(REVAMPED_BADGES)} revamped badges. "
                  f"{total} active badge defs in the catalogue.")
        except Exception:
            trans.rollback()
            raise


if __name__ == "__main__":
    run()
