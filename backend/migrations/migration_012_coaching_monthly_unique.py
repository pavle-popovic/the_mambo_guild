"""
Migration 012: Enforce "one coaching submission per user per month" at the DB
level so two concurrent POST /premium/coaching/submit requests can't both slip
past the application-level check and create duplicate submissions for the same
billing cycle.
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
            CREATE UNIQUE INDEX IF NOT EXISTS
                uq_coaching_submissions_user_month_year
            ON coaching_submissions (user_id, submission_month, submission_year);
        """))
        conn.commit()
        print("Migration 012: Added unique index on coaching_submissions(user_id, submission_month, submission_year).")


if __name__ == "__main__":
    run()
