"""
Migration: Flatten existing post_replies onto thread roots.

Once threaded replies shipped, some rows ended up nested under
non-root replies (e.g. a reply-to-reply written before the
service-layer flattening landed). The Instagram-style design is
exactly two levels deep, so this migration walks every reply whose
parent has its own parent and re-parents it to the actual thread
root.

Implementation: iterative — each pass moves every affected reply one
step closer to the root via a single UPDATE. We stop the moment a
pass touches zero rows, so this is naturally idempotent and a no-op
on already-flat data. Bounded at 20 passes as a safety belt; cycles
shouldn't be possible (the FK is to the same table with SET NULL),
but the bound prevents pathological loops if data ever drifts.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
from sqlalchemy import text
from models import get_engine

logger = logging.getLogger("uvicorn.error")


_MAX_PASSES = 20


def run() -> None:
    engine = get_engine()
    total_updated = 0
    for _ in range(_MAX_PASSES):
        with engine.begin() as conn:
            result = conn.execute(text("""
                UPDATE post_replies r
                SET parent_reply_id = p.parent_reply_id
                FROM post_replies p
                WHERE r.parent_reply_id = p.id
                  AND p.parent_reply_id IS NOT NULL
            """))
            updated = result.rowcount or 0
        if updated == 0:
            break
        total_updated += updated
    if total_updated:
        logger.info("post_replies thread flatten: re-parented %s rows", total_updated)


if __name__ == "__main__":
    run()
    print("Migration: Flattened nested post_replies onto thread roots.")
