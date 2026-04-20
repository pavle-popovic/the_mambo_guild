"""
Migration: Add `meeting_starts_at` column to `weekly_meeting_configs`.

Static one-off datetime replaces the recurring day-of-week schedule for the
Roundtable. The old columns stay as a fallback so existing rows without a
meeting_starts_at still render on the client.

Idempotent: uses IF NOT EXISTS so re-runs are safe.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


def run():
    engine = get_engine()
    with engine.connect() as conn:
        conn.execute(text("""
            ALTER TABLE weekly_meeting_configs
            ADD COLUMN IF NOT EXISTS meeting_starts_at TIMESTAMP NULL;
        """))
        conn.commit()
        print("Migration: Added meeting_starts_at column to weekly_meeting_configs.")


if __name__ == "__main__":
    run()
