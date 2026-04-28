"""
Founder Diamond — post-deadline revocation sweep.

Run at or after 2026-05-06 18:00 UTC. Idempotent (safe to re-run).

Removes the `founder_diamond` badge from any holder who does NOT have
a row in `founder_claims`. Those rows are written by the gated trial
flow in services/founder_badge_service.py — they represent the only
people who legitimately earned the badge under the new rule.

Effect:
  - Pre-launch auto-award holders who never started a trial → revoked.
  - Pre-launch auto-award holders who DID start a trial before the
    deadline → kept (they have a founder_claims row from the webhook).
  - Post-launch trial-starters in the first 300 → kept.
  - Anyone else with the badge somehow → revoked.

Safety:
  - Read-only on `founder_claims` (only DELETEs from `user_badges`).
  - Wrapped in a single transaction; a failure rolls back fully.
  - Prints a detailed plan first, then asks for explicit confirmation
    unless --yes is passed (for cron use).

Usage:
  # Dry-run (default): show what would be revoked, do nothing.
  python -m scripts.founder_revocation_sweep

  # Apply, with interactive confirmation:
  python -m scripts.founder_revocation_sweep --apply

  # Apply with no prompt (for scheduled cron / Railway one-off).
  python -m scripts.founder_revocation_sweep --apply --yes
"""
import argparse
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.orm import sessionmaker

from models import get_engine
from services.founder_badge_service import (
    FOUNDER_BADGE_ID,
    FOUNDER_DEADLINE,
)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--apply", action="store_true",
        help="Actually revoke. Without this flag the script is a dry-run.",
    )
    parser.add_argument(
        "--yes", action="store_true",
        help="Skip the interactive confirmation prompt (for cron).",
    )
    args = parser.parse_args()

    now = datetime.now(timezone.utc)
    print(f"Founder revocation sweep — {now.isoformat()}")
    print(f"Deadline: {FOUNDER_DEADLINE.isoformat()}")
    if now < FOUNDER_DEADLINE:
        delta = FOUNDER_DEADLINE - now
        print(
            f"WARNING: deadline has not passed yet "
            f"({delta} remaining). Refusing to run."
        )
        sys.exit(1)

    engine = get_engine()
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        # Headline counts (read-only).
        total_holders = db.execute(text(
            "SELECT COUNT(*) FROM user_badges WHERE badge_id = :bid"
        ), {"bid": FOUNDER_BADGE_ID}).scalar() or 0

        total_claims = db.execute(text(
            "SELECT COUNT(*) FROM founder_claims"
        )).scalar() or 0

        # Holders without a claim — the revocation set.
        to_revoke_rows = db.execute(text("""
            SELECT ub.user_id, u.email
            FROM user_badges ub
            LEFT JOIN founder_claims fc ON fc.user_id = ub.user_id
            JOIN users u ON u.id = ub.user_id
            WHERE ub.badge_id = :bid AND fc.user_id IS NULL
            ORDER BY ub.earned_at
        """), {"bid": FOUNDER_BADGE_ID}).all()

        to_revoke_count = len(to_revoke_rows)
        keep_count = total_holders - to_revoke_count

        print()
        print(f"Current founder_diamond holders: {total_holders}")
        print(f"Rows in founder_claims:         {total_claims}")
        print(f"  -> keep:      {keep_count}")
        print(f"  -> revoke:    {to_revoke_count}")
        print()

        if to_revoke_count == 0:
            print("Nothing to do. Exiting.")
            return

        # Sample preview (first 10 emails, never PII to logs in prod).
        print("First 10 to be revoked (sample):")
        for uid, email in to_revoke_rows[:10]:
            print(f"  - {uid}  {email}")
        if to_revoke_count > 10:
            print(f"  ... and {to_revoke_count - 10} more")
        print()

        if not args.apply:
            print("DRY-RUN. Re-run with --apply to actually revoke.")
            return

        if not args.yes:
            confirm = input(
                f"Revoke {to_revoke_count} badge(s) now? Type 'YES' to confirm: "
            )
            if confirm != "YES":
                print("Aborted.")
                sys.exit(2)

        # Single-statement delete; relies on the LEFT JOIN above being
        # consistent inside the same transaction since we have no other
        # concurrent writers post-deadline.
        result = db.execute(text("""
            DELETE FROM user_badges
            WHERE badge_id = :bid
              AND user_id NOT IN (SELECT user_id FROM founder_claims)
        """), {"bid": FOUNDER_BADGE_ID})
        db.commit()
        print(f"Revoked {result.rowcount} badge(s).")

    except Exception as e:
        db.rollback()
        print(f"FAILED: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
