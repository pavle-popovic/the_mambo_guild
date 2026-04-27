"""
Migration: Backfill `actor_id` for legacy reaction/reply notifications.

Pre-migration rows have the actor name baked into the message but no
foreign key, so the dropdown can't render the avatar+username header.
We can recover the actor by matching the notification's created_at to
the corresponding reaction/reply row (both are written in the same
transaction, so timestamps differ by milliseconds).

Conservative match window of ±5 seconds and `ORDER BY closest first`
keep ambiguous cases (multi-actor posts) from picking the wrong user.

Idempotent: the WHERE actor_id IS NULL filter means this is a no-op on
the second run, so it's safe to leave in the startup hook.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
from sqlalchemy import text
from models import get_engine

logger = logging.getLogger(__name__)


# Process at most this many rows per startup so the migration can't
# block boot under pathological backlogs. After the first deploy
# completes the backfill, subsequent runs see zero candidates.
_BATCH_LIMIT = 5000


def run() -> None:
    engine = get_engine()
    with engine.connect() as conn:
        # Reactions
        conn.execute(text("""
            UPDATE notifications n
            SET actor_id = sub.actor_id
            FROM (
                SELECT DISTINCT ON (n2.id)
                    n2.id AS notif_id,
                    pr.user_id AS actor_id
                FROM notifications n2
                JOIN post_reactions pr
                  ON pr.post_id::text = n2.reference_id
                 AND pr.user_id <> n2.user_id
                 AND pr.created_at BETWEEN n2.created_at - INTERVAL '5 seconds'
                                       AND n2.created_at + INTERVAL '5 seconds'
                WHERE n2.type = 'reaction_received'
                  AND n2.actor_id IS NULL
                  AND n2.reference_type = 'post'
                  AND n2.reference_id IS NOT NULL
                ORDER BY n2.id, ABS(EXTRACT(EPOCH FROM (pr.created_at - n2.created_at))) ASC
                LIMIT :limit
            ) sub
            WHERE n.id = sub.notif_id
        """), {"limit": _BATCH_LIMIT})

        # Replies
        conn.execute(text("""
            UPDATE notifications n
            SET actor_id = sub.actor_id
            FROM (
                SELECT DISTINCT ON (n2.id)
                    n2.id AS notif_id,
                    pr.user_id AS actor_id
                FROM notifications n2
                JOIN post_replies pr
                  ON pr.post_id::text = n2.reference_id
                 AND pr.user_id <> n2.user_id
                 AND pr.created_at BETWEEN n2.created_at - INTERVAL '5 seconds'
                                       AND n2.created_at + INTERVAL '5 seconds'
                WHERE n2.type = 'reply_received'
                  AND n2.actor_id IS NULL
                  AND n2.reference_type = 'post'
                  AND n2.reference_id IS NOT NULL
                ORDER BY n2.id, ABS(EXTRACT(EPOCH FROM (pr.created_at - n2.created_at))) ASC
                LIMIT :limit
            ) sub
            WHERE n.id = sub.notif_id
        """), {"limit": _BATCH_LIMIT})

        conn.commit()


if __name__ == "__main__":
    run()
    print("Migration: Backfilled actor_id for legacy reaction/reply notifications.")
