"""
One-shot script: clear stale stripe_customer_id / stripe_subscription_id
from subscription rows for specific users so the next checkout mints a
fresh Stripe customer in the correct environment.

Usage:
    python clear_stale_stripe_customers.py [--apply]

Default is dry-run. Pass --apply to commit the change.
"""
import sys
import os

# Allow running from the scripts directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine, text

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    # Try loading from .env two levels up
    env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
    if os.path.exists(env_path):
        for line in open(env_path):
            line = line.strip()
            if line.startswith("DATABASE_URL="):
                DATABASE_URL = line[len("DATABASE_URL="):]
                break

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set")
    sys.exit(1)

APPLY = "--apply" in sys.argv

TARGET_EMAILS = [
    "thelightpopo@gmail.com",
    "pavlepopovic1999@hotmail.com",
]

engine = create_engine(DATABASE_URL)

with engine.begin() as conn:
    for email in TARGET_EMAILS:
        row = conn.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": email},
        ).fetchone()
        if not row:
            print(f"  {email}: user not found — skip")
            continue
        user_id = row[0]

        sub = conn.execute(
            text(
                "SELECT stripe_customer_id, stripe_subscription_id, status "
                "FROM subscriptions WHERE user_id = :uid"
            ),
            {"uid": str(user_id)},
        ).fetchone()
        if not sub:
            print(f"  {email}: no subscription row — skip")
            continue

        cid, sid, status = sub
        print(f"  {email}: stripe_customer_id={cid}  stripe_subscription_id={sid}  status={status}")

        if APPLY:
            conn.execute(
                text(
                    "UPDATE subscriptions "
                    "SET stripe_customer_id = NULL, stripe_subscription_id = NULL "
                    "WHERE user_id = :uid"
                ),
                {"uid": str(user_id)},
            )
            print(f"    -> CLEARED")
        else:
            print(f"    -> (dry-run, pass --apply to clear)")
