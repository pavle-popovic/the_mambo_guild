"""
Migration 025: seed the 4 protected "specials" + backfill Founder.

Background:
  * Migration 019 has a PROTECTED_IDS block that does only
    `UPDATE ... SET is_active = TRUE WHERE id = ANY(:ids)` — if a row
    doesn't exist, nothing happens.
  * The standalone seed scripts (`seed_founder_badge.py`,
    `seed_badges_complete.py`) were never wired into migrations, so
    production `badge_definitions` ended up missing `founder_diamond`,
    `beta_tester`, `pro_member`, and `guild_master`.
  * At signup, `badge_service.award_badge(user_id, "founder_diamond")`
    silently no-ops when the definition is absent (logs + returns),
    which is why users who signed up (including the admin account)
    have no Founder badge on their profile.

This migration:
  1. Drops the stale CHECK constraint from migration 003 that rejected
     `category = 'special'` (idempotent — Postgres auto-names it
     `badge_definitions_category_check`).
  2. Upserts the 4 protected badges with the correct lowercase tier
     and `category='special'`. Safe to re-run.
  3. Backfills `user_badges` with `founder_diamond` for every existing
     user who doesn't already own it. Uses the unique constraint on
     `(user_id, badge_id)` via `ON CONFLICT DO NOTHING` so re-runs are
     no-ops.

Idempotent end-to-end. Safe to re-run.
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


PROTECTED_BADGES = [
    # (id, name, description, tier, category, requirement_type, threshold)
    (
        "founder_diamond",
        "Founder",
        "Original member of The Mambo Guild. Reserved for the first 1,000 dancers to join.",
        "diamond",
        "special",
        "manual",
        0,
    ),
    (
        "beta_tester",
        "Beta Tester",
        "Helped stress-test the Guild during early access.",
        "gold",
        "special",
        "manual",
        0,
    ),
    (
        "pro_member",
        "Pro Member",
        "Active Advanced subscription. Unlocks every Lab and Stage feature.",
        "gold",
        "special",
        "subscription",
        0,
    ),
    (
        "guild_master",
        "Guild Master",
        "Active Performer subscription. Coaching access, premium stages, the lot.",
        "diamond",
        "special",
        "subscription",
        0,
    ),
]


def run():
    engine = get_engine()
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # 1. Drop the legacy CHECK constraint if it still exists.
            #    Migration 003 declared it inline, so Postgres auto-named
            #    it `badge_definitions_category_check`.
            conn.execute(text(
                "ALTER TABLE badge_definitions "
                "DROP CONSTRAINT IF EXISTS badge_definitions_category_check"
            ))

            # 2. Upsert the 4 protected specials.
            for bid, name, desc, tier, category, req_type, threshold in PROTECTED_BADGES:
                conn.execute(
                    text("""
                        INSERT INTO badge_definitions
                            (id, name, description, tier, category,
                             requirement_type, threshold, is_active, created_at)
                        VALUES
                            (:id, :name, :description, :tier, :category,
                             :requirement_type, :threshold, TRUE, NOW())
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

            # 3. Backfill Founder to every existing user who doesn't have it.
            #    `ON CONFLICT (user_id, badge_id) DO NOTHING` relies on
            #    the `unique_user_badge` constraint from migration 003.
            backfilled = conn.execute(text("""
                INSERT INTO user_badges (user_id, badge_id, earned_at)
                SELECT u.id, 'founder_diamond', NOW()
                FROM users u
                ON CONFLICT (user_id, badge_id) DO NOTHING
            """)).rowcount

            trans.commit()

            total_defs = conn.execute(text(
                "SELECT COUNT(*) FROM badge_definitions "
                "WHERE id = ANY(:ids)"
            ), {"ids": [b[0] for b in PROTECTED_BADGES]}).scalar()

            print(
                f"Migration 025: ensured {total_defs}/4 protected badge defs, "
                f"backfilled {backfilled} user(s) with founder_diamond."
            )
        except Exception:
            trans.rollback()
            raise


if __name__ == "__main__":
    run()
