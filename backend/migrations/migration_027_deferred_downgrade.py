"""
Migration 027: deferred downgrade fields on `subscriptions`.

Adds three columns:

  - scheduled_tier (varchar 32): the tier that will activate at the next
    period boundary. Currently only "advanced" is written, on a scheduled
    Performer→Pro downgrade. NULL means "no scheduled change".
  - stripe_schedule_id (varchar 255): the SubscriptionSchedule on Stripe
    that drives the scheduled change. NULL when no schedule is active.
  - current_period_start (timestamp): mirror of Stripe's
    sub.current_period_start. Needed to gate per-period perks (e.g. the
    1:1 coaching slot) against the user's actual paid window rather than
    the calendar month, which closes a small "upgrade late in month →
    claim two sessions before downgrade fires" edge case.

Idempotent: ADD COLUMN IF NOT EXISTS for each. All three are nullable
with no default, so existing rows land in "no scheduled change, no
period_start known" — webhooks fill in `current_period_start` on the
next subscription.* event for any sub still in good standing.

Why we keep `last_performer_downgrade_at` from migration 026: a one-
release escape hatch. The 30-day re-upgrade cooldown that read it is
being deleted in this same change, but leaving the column means a
revert of the app code restores the old behaviour without a schema
roll-back. Plan to drop it in a follow-up migration.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


def run():
    engine = get_engine()
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            conn.execute(text("""
                ALTER TABLE subscriptions
                ADD COLUMN IF NOT EXISTS scheduled_tier VARCHAR(32) NULL;
            """))
            conn.execute(text("""
                ALTER TABLE subscriptions
                ADD COLUMN IF NOT EXISTS stripe_schedule_id VARCHAR(255) NULL;
            """))
            conn.execute(text("""
                ALTER TABLE subscriptions
                ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP NULL;
            """))
            trans.commit()
            print(
                "Migration 027: subscriptions.scheduled_tier, "
                "stripe_schedule_id, current_period_start added."
            )
        except Exception:
            trans.rollback()
            raise


if __name__ == "__main__":
    run()
