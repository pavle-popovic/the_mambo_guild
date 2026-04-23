"""
One-time backfill: for every user who is still `auth_provider='waitlist'`
and has a non-null `referred_by_code`, clear that code.

Why:
  Before the deferred-payout change, the referrer was paid 50 claves at
  waitlist signup. After the change, the payout is deferred to the
  /reset-password (account-claim) step.

  Users who signed up with a referrer_code BEFORE that change had their
  referrer paid ALREADY. If we leave `referred_by_code` on their profile,
  their eventual account claim will hit the new deferred-payout path and
  pay the referrer AGAIN.

  Clearing the code marks the referral as settled so the claim flow
  no-ops the payout block.

Idempotent. Safe to re-run (a cleared column stays cleared).
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

from sqlalchemy import text

from models import get_engine


def run():
    engine = get_engine()
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # COUNT first so the log line tells us what the single write
            # actually touched (UPDATE rowcount is driver-dependent).
            to_clear = conn.execute(text("""
                SELECT COUNT(*)
                FROM user_profiles p
                JOIN users u ON u.id = p.user_id
                WHERE u.auth_provider = 'waitlist'
                  AND p.referred_by_code IS NOT NULL
            """)).scalar()

            conn.execute(text("""
                UPDATE user_profiles
                SET referred_by_code = NULL
                WHERE user_id IN (
                    SELECT p.user_id
                    FROM user_profiles p
                    JOIN users u ON u.id = p.user_id
                    WHERE u.auth_provider = 'waitlist'
                      AND p.referred_by_code IS NOT NULL
                )
            """))
            trans.commit()
            print(f"Cleared referred_by_code on {to_clear} historical waitlist user(s).")
        except Exception:
            trans.rollback()
            raise


if __name__ == "__main__":
    run()
