"""
Migration 022: coaching_submissions gains a `source` discriminator.

Existing rows are subscription-backed (Performer tier's free monthly
submission). The Golden Ticket path inserts rows with source='golden_ticket',
and we want a Performer to be able to stack their free subscription
submission + a ticket purchase in the same month.

The old uniqueness rule was (user_id, submission_month, submission_year).
The new rule adds `source` so the two kinds can coexist.

Idempotent: drops the old constraint if present, adds the column + new
constraint only if not already there.
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
                ALTER TABLE coaching_submissions
                ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'subscription';
            """))

            # Drop the old constraint (if it still exists) and rebuild with `source`.
            conn.execute(text("""
                ALTER TABLE coaching_submissions
                DROP CONSTRAINT IF EXISTS uq_coaching_submissions_user_month_year;
            """))

            # Only add the new constraint if an identically-named one isn't there.
            # Postgres has no IF NOT EXISTS for ADD CONSTRAINT; do the check manually.
            exists = conn.execute(text("""
                SELECT 1 FROM pg_constraint
                WHERE conname = 'uq_coaching_submissions_user_month_year_source'
            """)).scalar()
            if not exists:
                conn.execute(text("""
                    ALTER TABLE coaching_submissions
                    ADD CONSTRAINT uq_coaching_submissions_user_month_year_source
                    UNIQUE (user_id, submission_month, submission_year, source);
                """))

            trans.commit()
            print("Migration 022: coaching_submissions.source added; unique constraint rebuilt.")
        except Exception:
            trans.rollback()
            raise


if __name__ == "__main__":
    run()
