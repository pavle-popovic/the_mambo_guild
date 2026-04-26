"""
Migration: Add `actor_id` column to `notifications`.

Lets the notifications dropdown render the acting user's avatar +
clickable @username (mirroring the community-feed UX) instead of
showing the actor name baked into the message string.

Idempotent: ALTER TABLE ... ADD COLUMN IF NOT EXISTS, so re-runs and
the auto-startup hook are safe. No FK to user_profiles — actor rows
get deleted in production occasionally, and we'd rather keep the
notification (with a null actor) than CASCADE-delete it.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


def run() -> None:
    engine = get_engine()
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE notifications
            ADD COLUMN IF NOT EXISTS actor_id UUID NULL;
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_notifications_actor_id
            ON notifications (actor_id);
        """))
        conn.commit()


if __name__ == "__main__":
    run()
    print("Migration: Added actor_id column to notifications.")
