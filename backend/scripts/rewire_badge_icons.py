"""
Rewire orphan badge images to active badges that are missing icon_url.

The previous badge system had reaction-specific tiered families
(firestarter / human_metronome / crowd_favorite) that have since been
replaced by post-type-based tiers (liked / motw_love / guild). The old
PNGs still sit in R2 but no active badge points to them, while the
replacement badges have icon_url = NULL.

This script points each imageless active badge at a suitable orphan image.

Idempotent: only updates rows whose icon_url is NULL or obviously stale.
Safe to run against dev Docker or prod Supabase — no data is deleted.

Usage:
    python -m scripts.rewire_badge_icons            # dry run
    python -m scripts.rewire_badge_icons --apply    # write changes
"""
import os
import sys

script_dir = os.path.abspath(os.path.dirname(__file__)) # .../backend/scripts
backend_dir = os.path.dirname(script_dir)             # .../backend
project_root = os.path.dirname(backend_dir)           # .../salsa_lab_v2

env_path = os.path.join(project_root, ".env")
from dotenv import load_dotenv
load_dotenv(env_path)

sys.path.insert(0, backend_dir)

backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_path)

from sqlalchemy.orm import sessionmaker
from models import get_engine
from models.community import BadgeDefinition


R2_BASE = "https://pub-bad1fce3595144f2bac8492efa3aec64.r2.dev/badges"

# (active_badge_id)  ->  (orphan_image_slug)
MAPPING: dict[str, str] = {
    # liked_* (Crowd Favorite — total likes received):
    "liked_bronze":  "crowd_favorite_bronze_v3",
    "liked_silver":  "crowd_favorite_silver",
    "liked_gold":    "crowd_favorite_gold",
    "liked_diamond": "liked_diamond", # Newly generated!

    # motw_love_* (Move Magnet) — now has dedicated artwork!
    "motw_love_bronze":  "motw_love_bronze",
    "motw_love_silver":  "motw_love_silver",
    "motw_love_gold":    "motw_love_gold",
    "motw_love_diamond": "motw_love_diamond",

    # guild_* (Class Act — guild training videos) — rhythm/discipline works.
    "guild_bronze":  "human_metronome_bronze",
    "guild_silver":  "human_metronome_silver",
    "guild_gold":    "human_metronome_gold",
    "guild_diamond": "guild_diamond", # Newly generated!

    # promoter — now has dedicated artwork!
    "promoter": "promoter",
    
    # pro_member, guild_master, founder_diamond
    "pro_member": "pro_member_v3",
    "guild_master": "guild_master_v2",
    "founder_diamond": "founder_diamond",

    # --- Fallback singletons for the remaining families ---
    # No tiered orphan PNGs exist for these four families, so all four tiers
    # in a family share one thematic singleton. Intended as a temporary fix
    # until proper per-tier artwork is uploaded; swapping later only requires
    # editing this map.

    # guild_love_* (Guild Applause — likes on guild posts):
    "guild_love_bronze":  "guild_love_bronze",
    "guild_love_silver":  "guild_love_silver",
    "guild_love_gold":    "guild_love_gold",
    "guild_love_diamond": "guild_love_diamond", # Newly generated!

    # motw_* (Move Master — MOTW video count):
    "motw_bronze":  "motw_bronze_v3",
    "motw_silver":  "motw_silver",
    "motw_gold":    "motw_gold",
    "motw_diamond": "motw_diamond", # Newly generated!

    # original_* (The Originator — original video count) — now has dedicated artwork!
    "original_bronze":  "original_bronze",
    "original_silver":  "original_silver",
    "original_gold":    "original_gold",
    "original_diamond": "original_diamond",

    # original_love_* (Fan Favorite — likes on original posts):
    "original_love_bronze":  "original_love_bronze",
    "original_love_silver":  "original_love_silver",
    "original_love_gold":    "original_love_gold",
    "original_love_diamond": "original_love_diamond", # Newly generated!
}


def run(apply_changes: bool) -> None:
    engine = get_engine()
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        updated = 0
        skipped = 0
        missing = 0

        for badge_id, slug in MAPPING.items():
            badge = db.query(BadgeDefinition).filter(
                BadgeDefinition.id == badge_id
            ).first()

            if not badge:
                print(f"  [MISS] {badge_id:35s}  no such badge in DB")
                missing += 1
                continue

            new_url = f"{R2_BASE}/{slug}.png"
            if badge.icon_url == new_url:
                print(f"  [OK]   {badge_id:35s}  already set")
                skipped += 1
                continue

            old = badge.icon_url or "(null)"
            print(f"  [SET]  {badge_id:35s}  {old!s:60s}  ->  {slug}.png")
            if apply_changes:
                badge.icon_url = new_url
            updated += 1

        if apply_changes:
            db.commit()
            print(f"\nCommitted: {updated} updated, {skipped} already correct, {missing} missing.")
        else:
            print(f"\nDRY RUN: would update {updated}; {skipped} already correct; {missing} missing.")
            print("Re-run with --apply to commit.")
    finally:
        db.close()


if __name__ == "__main__":
    apply = "--apply" in sys.argv
    run(apply)
