"""
Revoke orphaned Founder Diamond badges.

Pre-launch, every waitlister got the badge auto-awarded at signup. Post-
launch, the gating rule changed (waitlister + must start a trial before
2026-05-06 18:00 UTC, capped at 300). The migration backfilled
`founder_claims` rows for users who actually trialed BUT did not revoke
the badge from the rest of the pre-launch holders.

This script removes `user_badges` rows where badge_id='founder_diamond'
AND there is NO corresponding `founder_claims` row. Safe to re-run.

Usage:
    python scripts/_revoke_orphan_founder_badges.py             # dry-run
    python scripts/_revoke_orphan_founder_badges.py --apply     # actually delete

Always dry-runs first by default. Prints the exact list of users that
would lose the badge so you can spot-check before --apply.
"""
import argparse
import os
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        ".env",
    ))
except ImportError:
    pass

import psycopg2
from psycopg2.extras import RealDictCursor


PREVIEW_SQL = """
    SELECT ub.user_id, u.email, up.username,
           COALESCE(s.status::text, 'no_sub') AS sub_status,
           ub.earned_at
    FROM user_badges ub
    JOIN users u ON u.id = ub.user_id
    LEFT JOIN user_profiles up ON up.user_id = u.id
    LEFT JOIN subscriptions s ON s.user_id = u.id
    WHERE ub.badge_id = 'founder_diamond'
      AND ub.user_id NOT IN (SELECT user_id FROM founder_claims)
    ORDER BY u.email
"""

DELETE_SQL = """
    DELETE FROM user_badges
    WHERE badge_id = 'founder_diamond'
      AND user_id NOT IN (SELECT user_id FROM founder_claims)
"""


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true",
                        help="Actually delete. Default is dry-run.")
    parser.add_argument("--limit-preview", type=int, default=20,
                        help="How many sample rows to print in dry-run.")
    args = parser.parse_args()

    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        sys.exit("DATABASE_URL not set")

    print(f"Mode: {'APPLY (will delete)' if args.apply else 'DRY-RUN (preview only)'}")
    print()

    with psycopg2.connect(db_url) as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Sanity: count BEFORE
            n_badges_before = cur.execute(
                "SELECT COUNT(*) FROM user_badges WHERE badge_id = 'founder_diamond'"
            ) or cur.fetchone()
            cur.execute("SELECT COUNT(*) AS n FROM user_badges WHERE badge_id = 'founder_diamond'")
            badges_before = cur.fetchone()["n"]
            cur.execute("SELECT COUNT(*) AS n FROM founder_claims")
            claims = cur.fetchone()["n"]
            cur.execute(PREVIEW_SQL)
            rows = cur.fetchall()

            print(f"Before:")
            print(f"  user_badges (founder_diamond): {badges_before}")
            print(f"  founder_claims:                {claims}")
            print(f"  Orphans (will be revoked):     {len(rows)}")
            print()

            if not rows:
                print("No orphans found. Nothing to do.")
                return

            print(f"Sample (first {min(args.limit_preview, len(rows))} of {len(rows)} orphans):")
            for r in rows[:args.limit_preview]:
                print(f"  - {r['username']:<24} {r['email']:<44} "
                      f"sub={r['sub_status']:<12} earned_at={r['earned_at']}")
            if len(rows) > args.limit_preview:
                print(f"  ... and {len(rows) - args.limit_preview} more")
            print()

            if not args.apply:
                print("DRY-RUN — no changes made. Re-run with --apply to delete.")
                return

            # Confirm before deleting
            print(f"About to DELETE {len(rows)} user_badges rows...")
            cur.execute(DELETE_SQL)
            deleted = cur.rowcount
            conn.commit()

            cur.execute("SELECT COUNT(*) AS n FROM user_badges WHERE badge_id = 'founder_diamond'")
            badges_after = cur.fetchone()["n"]

            print(f"Deleted: {deleted}")
            print(f"After:")
            print(f"  user_badges (founder_diamond): {badges_after}")
            print(f"  founder_claims:                {claims}")
            print(f"  Match: {'✓' if badges_after == claims else '⚠'}")


if __name__ == "__main__":
    main()
