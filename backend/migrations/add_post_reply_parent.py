"""
Migration: Add `parent_reply_id` column to `post_replies`.

Enables threaded/nested replies on community posts. Existing rows
default to NULL → top-level reply.

Split into three independent idempotent steps so a hiccup on the
self-referential FK doesn't leave the column missing entirely (which
would crash every subsequent SELECT against post_replies, since the
SQLAlchemy model declares the column). Steps:

  1. ADD COLUMN parent_reply_id UUID — minimum viable change. If only
     this lands, queries succeed; we just lose the DB-level integrity
     net (the service-layer parent validation in `_resolve_reply_parent`
     still rejects bad IDs).
  2. ADD CONSTRAINT FK with ON DELETE SET NULL — guarded by a NOT
     EXISTS lookup in pg_constraint so re-runs are no-ops.
  3. CREATE INDEX on parent_reply_id — speeds up the children-by-parent
     fetch the dropdown does on every post open.

Each step uses `engine.begin()` so commit/rollback is automatic and
DDL doesn't sit inside a half-open transaction.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
from sqlalchemy import text
from models import get_engine

logger = logging.getLogger("uvicorn.error")


def _column_exists(conn, table: str, column: str) -> bool:
    row = conn.execute(text("""
        SELECT 1 FROM information_schema.columns
        WHERE table_name = :table AND column_name = :column
        LIMIT 1
    """), {"table": table, "column": column}).first()
    return row is not None


def run() -> None:
    engine = get_engine()

    # Step 1 — add the column. Critical: if this fails, subsequent
    # SELECT * from post_replies will 500 because the model declares
    # parent_reply_id. Surfaces the exception so Railway's deploy logs
    # show the real reason (lock, permission, etc.).
    with engine.begin() as conn:
        conn.execute(text("""
            ALTER TABLE post_replies
            ADD COLUMN IF NOT EXISTS parent_reply_id UUID NULL;
        """))

    # Step 2 — add the self-FK separately. Guard with pg_constraint so
    # re-runs are no-ops; failures here are non-critical because the
    # service layer already validates the parent.
    try:
        with engine.begin() as conn:
            conn.execute(text("""
                DO $$ BEGIN
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_constraint
                        WHERE conname = 'post_replies_parent_reply_id_fkey'
                    ) THEN
                        ALTER TABLE post_replies
                        ADD CONSTRAINT post_replies_parent_reply_id_fkey
                        FOREIGN KEY (parent_reply_id)
                        REFERENCES post_replies(id) ON DELETE SET NULL;
                    END IF;
                END $$;
            """))
    except Exception as exc:
        logger.warning("post_replies parent_reply_id FK skipped: %s", exc)

    # Step 3 — index for fast children-by-parent lookups.
    try:
        with engine.begin() as conn:
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_post_replies_parent_reply_id
                ON post_replies (parent_reply_id);
            """))
    except Exception as exc:
        logger.warning("post_replies parent_reply_id index skipped: %s", exc)

    # Verification — confirm the column actually exists after step 1
    # ran, so a silent failure can't cause every reply query to 500
    # without a peep in the logs.
    with engine.connect() as conn:
        if not _column_exists(conn, "post_replies", "parent_reply_id"):
            logger.error(
                "post_replies.parent_reply_id MISSING after migration — "
                "reply queries will fail. Run migrations/add_post_reply_parent.py "
                "manually against the DB."
            )
            raise RuntimeError("parent_reply_id column not present after migration")


if __name__ == "__main__":
    run()
    print("Migration: Added parent_reply_id column to post_replies.")
