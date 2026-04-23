"""Read-only: top referrers + distribution. Safe to run anytime."""
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
        top = conn.execute(text("""
            SELECT p.username, u.email, p.referral_count
            FROM user_profiles p
            JOIN users u ON u.id = p.user_id
            WHERE p.referral_count > 0
            ORDER BY p.referral_count DESC
            LIMIT 10
        """)).fetchall()

        dist = conn.execute(text("""
            SELECT
                COUNT(*) FILTER (WHERE referral_count = 0)  AS zero,
                COUNT(*) FILTER (WHERE referral_count >= 1 AND referral_count < 3) AS one_or_two,
                COUNT(*) FILTER (WHERE referral_count >= 3) AS three_plus,
                MAX(referral_count)                          AS max_count,
                COALESCE(SUM(referral_count), 0)             AS total_referrals
            FROM user_profiles
        """)).fetchone()

        promoter_owners = conn.execute(text("""
            SELECT COUNT(DISTINCT user_id)
            FROM user_badges
            WHERE badge_id = 'promoter'
        """)).scalar()

        print("=== Top 10 referrers ===")
        if not top:
            print("  (nobody has referred anyone yet)")
        for r in top:
            print(f"  {r.referral_count:>3}  @{r.username}  <{r.email}>")

        print("\n=== Distribution ===")
        print(f"  0 referrals:      {dist.zero}")
        print(f"  1-2 referrals:    {dist.one_or_two}")
        print(f"  3+ referrals:     {dist.three_plus}  (eligible for Promoter)")
        print(f"  max referral_count: {dist.max_count}")
        print(f"  total referrals across all users: {dist.total_referrals}")
        print(f"\n  Promoter badge owners in user_badges: {promoter_owners}")


if __name__ == "__main__":
    run()
