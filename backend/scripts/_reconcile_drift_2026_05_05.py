"""ONE-OFF: reconcile the 2 status drifts identified by the
2026-05-05 Stripe<->DB audit.

Hard-coded to the exact 2 subscription IDs. No segment queries, no
fuzzy matching. Dry-run by default. --apply to commit.

Each row is set to status='trialing' to match the actual Stripe state.
The recently-shipped fix in payments.py:1064 prevents this drift from
recurring (invoice.payment_succeeded now mirrors stripe_subscription.status
instead of hard-coding ACTIVE).
"""
from __future__ import annotations
import argparse, os, sys
from pathlib import Path

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_PROJECT_ROOT = _BACKEND_DIR.parent
try:
    from dotenv import load_dotenv
    load_dotenv(_PROJECT_ROOT / ".env")
except ImportError:
    pass
sys.path.insert(0, str(_BACKEND_DIR))

from sqlalchemy import text
from models import get_engine

TARGETS = [
    # (email_for_logging, stripe_subscription_id, expected_current_status, target_status)
    ("akhilsbehl@gmail.com",            "sub_1TTlfn1XXRdctrrVOY7vDCFO", "active", "trialing"),
    ("diane.lee.villagonzalo@gmail.com", "sub_1TTggB1XXRdctrrVyLneJwyf", "active", "trialing"),
]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Actually commit. Default is dry-run.")
    args = parser.parse_args()

    engine = get_engine()
    with engine.connect() as conn:
        for email, sub_id, expected_current, target in TARGETS:
            row = conn.execute(text("""
                SELECT u.email, s.status, s.tier
                FROM subscriptions s JOIN users u ON u.id = s.user_id
                WHERE s.stripe_subscription_id = :sid
            """), {"sid": sub_id}).first()

            if not row:
                print(f"  SKIP  {email} ({sub_id}): no DB row found")
                continue

            print(f"  {email}: db.status={row.status}  tier={row.tier}")
            if row.status != expected_current:
                print(f"    >> SAFETY ABORT: expected current status={expected_current}, "
                      f"got {row.status}. Bailing on this row to avoid stomping a "
                      f"newer state. Re-audit and re-run.")
                continue

            if not args.apply:
                print(f"    [DRY] would UPDATE status -> {target}")
                continue

            conn.execute(text("""
                UPDATE subscriptions
                SET status = :target
                WHERE stripe_subscription_id = :sid
                  AND status = :expected
            """), {"sid": sub_id, "target": target, "expected": expected_current})
            conn.commit()
            print(f"    UPDATED status -> {target}")


if __name__ == "__main__":
    main()
