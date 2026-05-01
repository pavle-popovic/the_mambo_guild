"""
READ-ONLY: cross-check the Founder Diamond claim/badge integrity.

Invariants we expect to hold:

  1. Every user with a `founder_claims` row should have the badge in
     `user_badges` (badge_id='founder_diamond').
  2. Every TRIALING / ACTIVE user who was a waitlister AND started before
     the cutoff should have a `founder_claims` row (and therefore the
     badge), unless the 300-cap was already hit.
  3. No registered-but-never-subscribed user (status NULL or INCOMPLETE)
     should have the badge.
  4. The total number of `founder_claims` rows should equal the number
     of `user_badges` rows for badge_id='founder_diamond'.
  5. Founder claim positions should be a contiguous sequence 1..N with
     no duplicates and no gaps.

Reports any violations of the above with the specific user_id / email so
you can investigate. No writes, no fixes. Run as often as you like.

Usage:
    python scripts/_verify_founder_diamond.py
"""
import os
import sys
from datetime import datetime, timezone

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


FOUNDER_DEADLINE = datetime(2026, 5, 6, 18, 0, 0, tzinfo=timezone.utc)
FOUNDER_CAP = 300


def q(cur, sql, params=()):
    cur.execute(sql, params)
    return cur.fetchall()


def main():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        sys.exit("DATABASE_URL not set")

    print(f"Founder deadline: {FOUNDER_DEADLINE.isoformat()}")
    print(f"Cap:              {FOUNDER_CAP}")
    print(f"Now:              {datetime.now(timezone.utc).isoformat()}")
    print()

    with psycopg2.connect(db_url) as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            # ---- TOTALS ----
            n_claims = q(cur, "SELECT COUNT(*) AS n FROM founder_claims")[0]["n"]
            n_badges = q(cur, """
                SELECT COUNT(*) AS n FROM user_badges
                WHERE badge_id = 'founder_diamond'
            """)[0]["n"]
            print(f"founder_claims rows:        {n_claims}")
            print(f"user_badges (founder_diamond) rows: {n_badges}")
            if n_claims != n_badges:
                print(f"  ⚠ MISMATCH: claims and badges differ by {abs(n_claims - n_badges)}")
            else:
                print("  ✓ claim count matches badge count")
            print()

            # ---- POSITION CONTINUITY ----
            positions = q(cur, """
                SELECT claim_position FROM founder_claims
                ORDER BY claim_position
            """)
            pos_list = [r["claim_position"] for r in positions]
            if pos_list:
                expected = list(range(1, max(pos_list) + 1))
                missing = sorted(set(expected) - set(pos_list))
                dupes = [p for p in set(pos_list) if pos_list.count(p) > 1]
                print(f"Claim positions: {min(pos_list)}..{max(pos_list)}")
                if missing:
                    print(f"  ⚠ Missing positions: {missing[:10]}{'...' if len(missing) > 10 else ''}")
                if dupes:
                    print(f"  ⚠ Duplicate positions: {dupes}")
                if not missing and not dupes:
                    print(f"  ✓ contiguous, no gaps, no duplicates")
            print()

            # ---- INVARIANT 3: registered-but-never-subscribed should NOT have badge ----
            print("=" * 70)
            print("INVARIANT: registered-but-never-trialed users should NOT have badge")
            print("=" * 70)
            offenders_no_trial = q(cur, """
                SELECT u.id, u.email, up.username, s.status AS sub_status,
                       fc.claim_position, fc.claimed_at
                FROM user_badges ub
                JOIN users u ON u.id = ub.user_id
                LEFT JOIN user_profiles up ON up.user_id = u.id
                LEFT JOIN subscriptions s ON s.user_id = u.id
                LEFT JOIN founder_claims fc ON fc.user_id = u.id
                WHERE ub.badge_id = 'founder_diamond'
                  AND (s.status IS NULL OR s.status = 'incomplete')
            """)
            if offenders_no_trial:
                print(f"  ⚠ {len(offenders_no_trial)} user(s) have the badge despite never trialing:")
                for r in offenders_no_trial:
                    print(f"    - {r['username']:<20} {r['email']:<40} "
                          f"sub={r['sub_status'] or 'NONE'} claim_pos={r['claim_position']}")
            else:
                print("  ✓ no registered-only users have the badge")
            print()

            # ---- INVARIANT 2: TRIALING/ACTIVE waitlisters should HAVE badge (within cap) ----
            print("=" * 70)
            print("INVARIANT: waitlister trialers/payers should HAVE badge")
            print("=" * 70)
            should_have = q(cur, """
                SELECT u.id, u.email, up.username, s.status AS sub_status,
                       up.was_waitlister,
                       (SELECT 1 FROM user_badges ub
                        WHERE ub.user_id = u.id AND ub.badge_id = 'founder_diamond'
                        LIMIT 1) AS has_badge,
                       (SELECT claim_position FROM founder_claims fc
                        WHERE fc.user_id = u.id) AS claim_position,
                       s.current_period_start
                FROM users u
                JOIN user_profiles up ON up.user_id = u.id
                JOIN subscriptions s ON s.user_id = u.id
                WHERE s.status IN ('trialing', 'active', 'past_due')
                ORDER BY s.current_period_start NULLS LAST
            """)
            missing_badges = [
                r for r in should_have
                if r["was_waitlister"]
                and r["has_badge"] is None
            ]
            non_waitlist_with_badge = [
                r for r in should_have
                if not r["was_waitlister"] and r["has_badge"]
            ]
            print(f"  Total active subs: {len(should_have)}")
            print(f"    of which were waitlisters: {sum(1 for r in should_have if r['was_waitlister'])}")
            print(f"    of which have badge:       {sum(1 for r in should_have if r['has_badge'])}")
            print(f"    of which have claim row:   {sum(1 for r in should_have if r['claim_position'])}")
            print()

            if missing_badges:
                print(f"  ⚠ {len(missing_badges)} waitlister trialer(s) MISSING badge:")
                for r in missing_badges:
                    print(f"    - {r['username']:<20} {r['email']:<40} "
                          f"sub={r['sub_status']} started={r['current_period_start']}")
                print()
                print("  Possible explanations:")
                print("    1. Cap of 300 was hit before they trialed (then a missing badge is correct)")
                print("    2. Race condition or webhook delivery issue (would need backfill)")
                print("    3. They started AFTER the deadline (would be correct to skip)")
            else:
                print("  ✓ every waitlister trialer/payer has the badge")
            print()

            if non_waitlist_with_badge:
                print(f"  ⚠ {len(non_waitlist_with_badge)} non-waitlister user(s) have badge (unexpected):")
                for r in non_waitlist_with_badge:
                    print(f"    - {r['username']} {r['email']} sub={r['sub_status']}")
            else:
                print("  ✓ no non-waitlister has the badge")
            print()

            # ---- BREAKDOWN BY STATUS ----
            print("=" * 70)
            print("Badge holders by current subscription status")
            print("=" * 70)
            breakdown = q(cur, """
                SELECT COALESCE(s.status::text, 'no_sub') AS status,
                       COUNT(*) AS n
                FROM user_badges ub
                JOIN users u ON u.id = ub.user_id
                LEFT JOIN subscriptions s ON s.user_id = u.id
                WHERE ub.badge_id = 'founder_diamond'
                GROUP BY s.status
                ORDER BY n DESC
            """)
            for r in breakdown:
                marker = "✓" if r["status"] in ("trialing", "active") else "⚠"
                print(f"  {marker} {r['status']:<15} {r['n']:>4}")


if __name__ == "__main__":
    main()
