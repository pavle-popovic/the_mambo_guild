"""
One-time cleanup: revoke pro_member / guild_master from users whose current
subscription tier no longer warrants them.

Rationale:
  * `revoke_subscription_badges` is now wired into Stripe webhooks, so future
    downgrades/cancellations self-heal.
  * Anyone who already downgraded or cancelled BEFORE that wiring shipped
    still has stale rows in `user_badges`. This script walks the existing
    state once and fixes them.

Rules (same as the runtime helper — we import it directly so logic stays in
sync):
  - tier = performer        -> keep both badges (no-op)
  - tier = advanced         -> revoke guild_master, keep pro_member
  - tier = rookie / no sub  -> revoke both

Idempotent. Safe to run repeatedly.
"""
from __future__ import annotations

import os
import sys

from dotenv import load_dotenv

backend_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# .env lives at the repo root (one level above backend/), not inside backend/.
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
from models.user import Subscription
from models.community import UserBadge
from services.badge_service import revoke_subscription_badges


def run():
    engine = get_engine()
    with Session(engine) as db:
        # All users who currently own at least one subscription badge.
        candidate_user_ids = {
            row.user_id
            for row in db.query(UserBadge.user_id)
            .filter(UserBadge.badge_id.in_(["pro_member", "guild_master"]))
            .distinct()
            .all()
        }

        print(f"Found {len(candidate_user_ids)} user(s) with subscription badges.")

        total_removed = 0
        untouched = 0
        subs_by_user = {
            s.user_id: s
            for s in db.query(Subscription)
            .filter(Subscription.user_id.in_(candidate_user_ids))
            .all()
        }

        for user_id in candidate_user_ids:
            sub = subs_by_user.get(user_id)
            tier_value = sub.tier.value if (sub and sub.tier) else "rookie"
            removed = revoke_subscription_badges(str(user_id), tier_value, db)
            if removed:
                total_removed += removed
                print(f"  user {user_id} (tier={tier_value}): removed {removed} badge(s)")
            else:
                untouched += 1

        db.commit()
        print(
            f"\nDone. Removed {total_removed} stale subscription-badge row(s) "
            f"across {len(candidate_user_ids) - untouched} user(s); "
            f"{untouched} user(s) left untouched."
        )


if __name__ == "__main__":
    run()
