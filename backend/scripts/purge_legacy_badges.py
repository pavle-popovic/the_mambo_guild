"""
Delete legacy reaction-based BadgeDefinition rows and remap the four
singleton-using active families to proper tiered artwork.

The legacy families (firestarter / human_metronome / crowd_favorite)
were replaced by post-type-based equivalents and already marked
is_active=False. This script finishes the job by:

  1. Deleting any user_badges rows that reference the 12 legacy badges
     (only the admin has earned them; they were never visible in the UI).
  2. Deleting the 12 legacy badge_definitions rows.
  3. Updating icon_url on the four active families still using singleton
     art (motw_*, original_*, original_love_*, guild_love_*) to share
     the three existing tiered PNG sets with other active families.

After this runs, every active badge has a proper tier-progression icon.
The three tiered sets are shared across families:
  - human_metronome_*   -> guild_*, motw_*
  - firestarter_*       -> motw_love_*, original_*
  - crowd_favorite_*    -> liked_*, original_love_*, guild_love_*

Idempotent. Dry-run by default; pass --apply to commit.

Usage:
    python -m scripts.purge_legacy_badges
    python -m scripts.purge_legacy_badges --apply
"""
import os
import sys

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(project_root, ".env")
from dotenv import load_dotenv
load_dotenv(env_path)

backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_path)

from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from models import get_engine
from models.community import BadgeDefinition


R2_BASE = "https://pub-bad1fce3595144f2bac8492efa3aec64.r2.dev/badges"

LEGACY_IDS: list[str] = [
    "firestarter_bronze", "firestarter_silver", "firestarter_gold", "firestarter_diamond",
    "human_metronome_bronze", "human_metronome_silver", "human_metronome_gold", "human_metronome_diamond",
    "crowd_favorite_bronze", "crowd_favorite_silver", "crowd_favorite_gold", "crowd_favorite_diamond",
]

# (active_badge_id) -> (tiered_image_slug)
REMAP: dict[str, str] = {
    # motw_* (Move Master) — share human_metronome_* with guild_*.
    "motw_bronze":  "human_metronome_bronze",
    "motw_silver":  "human_metronome_silver",
    "motw_gold":    "human_metronome_gold",
    "motw_diamond": "human_metronome_diamond",

    # original_* (The Originator) — share firestarter_* with motw_love_*.
    "original_bronze":  "firestarter_bronze",
    "original_silver":  "firestarter_silver",
    "original_gold":    "firestarter_gold",
    "original_diamond": "firestarter_diamond",

    # original_love_* (Fan Favorite) — share crowd_favorite_* with liked_*.
    "original_love_bronze":  "crowd_favorite_bronze",
    "original_love_silver":  "crowd_favorite_silver",
    "original_love_gold":    "crowd_favorite_gold",
    "original_love_diamond": "crowd_favorite_diamond",

    # guild_love_* (Guild Applause) — three-way share on crowd_favorite_*.
    "guild_love_bronze":  "crowd_favorite_bronze",
    "guild_love_silver":  "crowd_favorite_silver",
    "guild_love_gold":    "crowd_favorite_gold",
    "guild_love_diamond": "crowd_favorite_diamond",
}


def run(apply_changes: bool) -> None:
    engine = get_engine()
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # 1. user_badges rows pointing at legacy badges
        ub_count = db.execute(
            text("SELECT COUNT(*) FROM user_badges WHERE badge_id = ANY(:ids)"),
            {"ids": LEGACY_IDS},
        ).scalar()
        print(f"Step 1: user_badges rows to delete: {ub_count}")

        # 2. legacy badge_definitions (must all be is_active=False)
        legacy_defs = db.query(BadgeDefinition).filter(
            BadgeDefinition.id.in_(LEGACY_IDS)
        ).all()
        still_active = [b.id for b in legacy_defs if b.is_active]
        if still_active:
            print(f"  ABORT: refusing to delete badges still marked active: {still_active}")
            return
        print(f"Step 2: badge_definitions to delete: {len(legacy_defs)}")
        for b in legacy_defs:
            print(f"    - {b.id}")

        # 3. icon remapping plan
        print(f"Step 3: icon_url updates:")
        to_update: list[tuple[BadgeDefinition, str]] = []
        for badge_id, slug in REMAP.items():
            badge = db.query(BadgeDefinition).filter(
                BadgeDefinition.id == badge_id
            ).first()
            if not badge:
                print(f"    [MISS] {badge_id} not found")
                continue
            new_url = f"{R2_BASE}/{slug}.png"
            if badge.icon_url == new_url:
                print(f"    [OK]   {badge_id:35s}  already set")
                continue
            old = (badge.icon_url or "(null)").rsplit("/", 1)[-1]
            print(f"    [SET]  {badge_id:35s}  {old:30s}  ->  {slug}.png")
            to_update.append((badge, new_url))

        if not apply_changes:
            print("\nDRY RUN. Re-run with --apply to commit.")
            return

        # --- apply ---
        if ub_count:
            db.execute(
                text("DELETE FROM user_badges WHERE badge_id = ANY(:ids)"),
                {"ids": LEGACY_IDS},
            )
        for b in legacy_defs:
            db.delete(b)
        for badge, new_url in to_update:
            badge.icon_url = new_url
        db.commit()
        print(f"\nCommitted: deleted {ub_count} user_badges + {len(legacy_defs)} badge_definitions, "
              f"updated {len(to_update)} icons.")
    finally:
        db.close()


if __name__ == "__main__":
    apply = "--apply" in sys.argv
    run(apply)
