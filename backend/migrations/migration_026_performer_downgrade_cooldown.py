"""
Migration 026: subscriptions gains `last_performer_downgrade_at`.

Records the most recent moment the user transitioned Performer→Advanced.
The 30-day Performer re-upgrade cooldown in /payments/update-subscription
reads this column and refuses upgrades while it's within the window.
Closes the proration-cycle exploit (rapid upgrade→downgrade→upgrade to
extract Performer perks at the prorated daily rate) without resorting to
a deferred-downgrade flow.

Idempotent: ADD COLUMN IF NOT EXISTS. Nullable + no default, so existing
subscriptions land in "no cooldown" — they can re-upgrade freely the
next time. We don't want to retroactively penalize anyone who already
downgraded before this column existed.
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
                ADD COLUMN IF NOT EXISTS last_performer_downgrade_at TIMESTAMP NULL;
            """))
            trans.commit()
            print("Migration 026: subscriptions.last_performer_downgrade_at added.")
        except Exception:
            trans.rollback()
            raise


if __name__ == "__main__":
    run()
