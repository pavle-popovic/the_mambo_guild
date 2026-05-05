"""Stripe <-> DB sync audit. Read-only.

Pulls every subscription from Stripe (paginated) and every subscription
from the DB, then cross-references:

  * Stripe sub exists, no matching DB row    (missed webhook on creation)
  * DB sub_id present, Stripe says 404       (orphaned DB row)
  * Both exist, status/tier/period mismatch  (drift to fix)

Stripe is the source of truth for billing state. The DB should mirror
it. Any mismatch = either a missed webhook or a manual DB edit that
needs reconciling.

Tier mapping: Stripe price -> tier is inferred from the price object's
unit amount cents. We treat anything in the Performer cents range as
performer, Advanced range as advanced, anything else as unknown.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path
from datetime import datetime, timezone

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_PROJECT_ROOT = _BACKEND_DIR.parent
try:
    from dotenv import load_dotenv
    load_dotenv(_PROJECT_ROOT / ".env")
except ImportError:
    pass
sys.path.insert(0, str(_BACKEND_DIR))

import stripe
from sqlalchemy import text
from models import get_engine

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
mode = "LIVE" if stripe.api_key.startswith("sk_live_") else "TEST" if stripe.api_key.startswith("sk_test_") else "UNKNOWN"


def fetch_all_stripe_subs():
    """Paginate through every subscription on the Stripe account."""
    out = []
    starting_after = None
    while True:
        params = {"limit": 100, "status": "all", "expand": ["data.items"]}
        if starting_after:
            params["starting_after"] = starting_after
        resp = stripe.Subscription.list(**params)
        out.extend(resp.data)
        if not resp.has_more:
            break
        starting_after = resp.data[-1].id
    return out


def load_db_subs():
    """Pull every DB sub row keyed by stripe_subscription_id (where present)."""
    engine = get_engine()
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT u.email, s.user_id, s.tier, s.status, s.stripe_subscription_id,
                   s.stripe_customer_id, s.current_period_start, s.current_period_end,
                   s.cancel_at_period_end
            FROM subscriptions s
            JOIN users u ON u.id = s.user_id
        """)).all()
    return {r.stripe_subscription_id: r for r in rows if r.stripe_subscription_id}


def cents_to_tier(cents: int | None) -> str:
    """Best-effort price -> tier mapping based on observed prices.
    Performer = $59 (5900) full, $29.50 (2950) Founder discount.
    Advanced  = $39 (3900) full, $19.50 (1950) Founder discount.
    Trialing $0 (0) doesn't tell us the tier from amount; rely on price/product
    metadata in those cases (skipped here for simplicity)."""
    if cents in (5900, 2950):
        return "performer"
    if cents in (3900, 1950):
        return "advanced"
    if cents == 0:
        return "(trial $0)"
    return f"unknown(${cents/100:.2f})"


def main():
    print(f"\nStripe key mode: {mode}\n")
    if mode == "UNKNOWN":
        print("STRIPE_SECRET_KEY not set or unrecognized prefix; aborting.")
        return

    print("Fetching all Stripe subscriptions (this may take a moment)...")
    stripe_subs = fetch_all_stripe_subs()
    print(f"  -> {len(stripe_subs)} subscriptions on Stripe\n")

    print("Loading DB subscription rows...")
    db_by_sid = load_db_subs()
    print(f"  -> {len(db_by_sid)} DB rows have a stripe_subscription_id\n")

    print("=" * 90)
    print("MISMATCHES")
    print("=" * 90)

    drift_count = 0
    orphan_db = []

    db_sids_seen = set()

    for ss in stripe_subs:
        sid = ss.id
        db = db_by_sid.get(sid)
        if not db:
            # Stripe knows about it, DB doesn't.
            cust = ss.customer
            try:
                cust_obj = stripe.Customer.retrieve(cust)
                cust_email = cust_obj.email or "<no email on customer>"
            except Exception:
                cust_email = "<lookup failed>"
            print(f"\n  [STRIPE-ONLY]  {sid}")
            print(f"     status={ss.status}  customer={cust} ({cust_email})")
            drift_count += 1
            continue

        db_sids_seen.add(sid)

        # Compare statuses
        diffs = []
        if ss.status != db.status:
            diffs.append(f"status: stripe={ss.status} vs db={db.status}")

        # Tier from Stripe item amount
        try:
            item = ss["items"]["data"][0]
            amount = item["price"]["unit_amount"]
            stripe_tier = cents_to_tier(amount)
        except Exception:
            stripe_tier = "?"
        if stripe_tier not in ("?",) and stripe_tier != db.tier and not stripe_tier.startswith("("):
            diffs.append(f"tier: stripe={stripe_tier} vs db={db.tier}")

        # cancel_at_period_end
        if bool(ss.cancel_at_period_end) != bool(db.cancel_at_period_end):
            diffs.append(
                f"cancel_at_period_end: stripe={ss.cancel_at_period_end} vs "
                f"db={db.cancel_at_period_end}"
            )

        # current_period_end (compare timestamps within tolerance)
        try:
            stripe_end = datetime.fromtimestamp(ss.current_period_end, tz=timezone.utc)
            db_end = db.current_period_end
            if db_end is not None:
                if db_end.tzinfo is None:
                    db_end = db_end.replace(tzinfo=timezone.utc)
                if abs((stripe_end - db_end).total_seconds()) > 60:
                    diffs.append(f"period_end: stripe={stripe_end.isoformat()} vs db={db_end.isoformat()}")
        except Exception:
            pass

        if diffs:
            print(f"\n  [DRIFT]  {sid}  ({db.email})")
            for d in diffs:
                print(f"     {d}")
            drift_count += 1

    # DB rows whose sub_id wasn't in Stripe's list (orphans / wrong mode)
    for sid, db in db_by_sid.items():
        if sid not in db_sids_seen:
            orphan_db.append(db)

    if orphan_db:
        print()
        print("=" * 90)
        print(f"DB-ONLY (sub_id present in DB but Stripe returned no match): {len(orphan_db)}")
        print("(could be in the OTHER Stripe mode, or genuinely orphaned)")
        print("=" * 90)
        for db in orphan_db:
            print(f"  {db.email:<45} sub_id={db.stripe_subscription_id} (db status={db.status} tier={db.tier})")

    print()
    print("=" * 90)
    if drift_count == 0 and not orphan_db:
        print("CLEAN. Stripe and DB are in full agreement.")
    else:
        print(f"Total drift items: {drift_count}  +  DB-only orphans: {len(orphan_db)}")
    print("=" * 90)


if __name__ == "__main__":
    main()
