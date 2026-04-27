"""
Migration: Add `parent_reply_id` column to `post_replies`.

Enables threaded/nested replies on community posts. Existing rows
default to NULL → top-level reply (no behavior change for anything
that was already published).

ON DELETE SET NULL — soft-deleting / hard-deleting a parent reply
must NOT cascade-delete the entire subtree, otherwise a single
moderator action could vaporize a long thread. Orphaned children
become top-level replies on the post; the frontend already renders
them safely as roots.

Idempotent: ALTER ... ADD COLUMN IF NOT EXISTS + CREATE INDEX IF
NOT EXISTS. Safe to re-run on every boot.
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
            ALTER TABLE post_replies
            ADD COLUMN IF NOT EXISTS parent_reply_id UUID NULL
                REFERENCES post_replies(id) ON DELETE SET NULL;
        """))
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_post_replies_parent_reply_id
            ON post_replies (parent_reply_id);
        """))
        conn.commit()


if __name__ == "__main__":
    run()
    print("Migration: Added parent_reply_id column to post_replies.")
