"""
One-time backfill: grant the Promoter badge to every user who has
`referral_count >= 3` but does not already own it.

Root cause of the gap: the milestone check in /waitlist only fired on
the *incoming* signup, so users who crossed 3 referrals on a signup
where the check was skipped (early code path, exception swallow, etc.)
never received the badge. Runtime logic handles future cases; this
script fills the 6 existing eligible users.

Uses `badge_service.award_badge`, which is idempotent — re-running is
a no-op for users who already have it.
"""
from __future__ import annotations

import os
import sys

from dotenv import load_dotenv

backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for candidate in (
    os.path.join(backend_root, ".env"),
    os.path.join(os.path.dirname(backend_root), ".env"),
):
    if os.path.exists(candidate):
        load_dotenv(candidate)
        break
sys.path.insert(0, backend_root)

from sqlalchemy.orm import Session

from models import get_engine
from models.user import UserProfile
from models.community import UserBadge
from services import badge_service


def run():
    engine = get_engine()
    with Session(engine) as db:
        eligible = (
            db.query(UserProfile.user_id, UserProfile.username, UserProfile.referral_count)
            .filter(UserProfile.referral_count >= 3)
            .all()
        )
        print(f"Found {len(eligible)} user(s) with referral_count >= 3.")

        already_owners = {
            row.user_id
            for row in db.query(UserBadge.user_id)
            .filter(UserBadge.badge_id == "promoter")
            .all()
        }

        granted = 0
        for user_id, username, count in eligible:
            if user_id in already_owners:
                print(f"  @{username} ({count} referrals): already has Promoter — skipping")
                continue
            try:
                badge_service.award_badge(str(user_id), "promoter", db)
                granted += 1
                print(f"  @{username} ({count} referrals): granted Promoter")
            except Exception as exc:
                print(f"  @{username}: FAILED — {exc}")

        db.commit()
        print(f"\nDone. Granted Promoter to {granted} user(s).")


if __name__ == "__main__":
    run()
