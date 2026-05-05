"""Read-only deep-dive on the 2 drift subs from the audit.

For each: fetch full Stripe sub object (status, trial_start/end,
status_transitions, latest_invoice, created), fetch DB row with all
timestamps, side-by-side print.

Also lists every Stripe Event for those subscription IDs so we can see
which webhooks fired and which the backend missed.
"""
from __future__ import annotations
import os, sys, json
from datetime import datetime, timezone
from pathlib import Path

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

SUSPECTS = [
    ("akhilsbehl@gmail.com",            "sub_1TTlfn1XXRdctrrVOY7vDCFO"),
    ("diane.lee.villagonzalo@gmail.com", "sub_1TTggB1XXRdctrrVyLneJwyf"),
]


def ts(epoch):
    if epoch is None:
        return "—"
    return datetime.fromtimestamp(epoch, tz=timezone.utc).isoformat()


engine = get_engine()
for email, sub_id in SUSPECTS:
    print("=" * 80)
    print(f"  {email}")
    print(f"  {sub_id}")
    print("=" * 80)

    # Stripe side
    try:
        s = stripe.Subscription.retrieve(sub_id)
        print(f"\n  STRIPE:")
        print(f"    status              = {s.status}")
        print(f"    trial_start         = {ts(s.trial_start)}")
        print(f"    trial_end           = {ts(s.trial_end)}")
        cpe = getattr(s, "current_period_end", None)
        if cpe is None and getattr(s, "items", None):
            try:
                cpe = s["items"]["data"][0].get("current_period_end")
            except Exception:
                pass
        print(f"    current_period_end  = {ts(cpe)}")
        print(f"    cancel_at_period_end= {s.cancel_at_period_end}")
        print(f"    created             = {ts(s.created)}")
        print(f"    latest_invoice      = {s.latest_invoice}")
    except Exception as e:
        print(f"  STRIPE FETCH FAILED: {type(e).__name__}: {e}")
        continue

    # DB side
    with engine.connect() as conn:
        row = conn.execute(text("""
            SELECT u.email, u.created_at AS user_created,
                   s.tier, s.status,
                   s.current_period_start, s.current_period_end,
                   s.cancel_at_period_end, s.scheduled_tier
            FROM subscriptions s JOIN users u ON u.id = s.user_id
            WHERE s.stripe_subscription_id = :sid
        """), {"sid": sub_id}).first()

    if row:
        print(f"\n  DB:")
        print(f"    status              = {row.status}")
        print(f"    tier                = {row.tier}")
        print(f"    current_period_end  = {row.current_period_end}")
        print(f"    cancel_at_period_end= {row.cancel_at_period_end}")
        print(f"    scheduled_tier      = {row.scheduled_tier}")
        print(f"    user.created_at     = {row.user_created}")

    # Stripe events log for this sub (last 20)
    print(f"\n  STRIPE EVENTS (most recent first, last 20 for related types):")
    try:
        evs = stripe.Event.list(limit=20, type="customer.subscription.updated")
        # filter to our sub_id manually since type filter doesn't combine with object id
        related = []
        for ev in evs.auto_paging_iter():
            obj = ev.data.object
            if isinstance(obj, dict) and obj.get("id") == sub_id:
                related.append(ev)
            elif hasattr(obj, "id") and obj.id == sub_id:
                related.append(ev)
            if len(related) >= 5:
                break
        # also created
        for type_name in ("customer.subscription.created", "customer.subscription.deleted",
                          "invoice.paid", "invoice.payment_succeeded"):
            for ev in stripe.Event.list(limit=20, type=type_name).auto_paging_iter():
                obj = ev.data.object
                if isinstance(obj, dict):
                    o_id = obj.get("subscription") or obj.get("id")
                else:
                    o_id = getattr(obj, "subscription", None) or getattr(obj, "id", None)
                if o_id == sub_id:
                    related.append(ev)
                    break  # one per type is enough

        related.sort(key=lambda e: e.created, reverse=True)
        if not related:
            print(f"    (no recent events found for this sub_id)")
        for ev in related[:10]:
            print(f"    {ts(ev.created)}  {ev.type:<40}  ({ev.id})")
    except Exception as e:
        print(f"    EVENT FETCH FAILED: {type(e).__name__}: {e}")

    print()
