"""
Migration 028: gated Founder Diamond claim.

Two changes:

  1. user_profiles.was_waitlister (boolean, default false): durable marker
     for "this account originally came in via the velvet-rope waitlist."
     Survives the auth_provider flip from 'waitlist' to 'email' that
     happens when a waitlister claims their account via /reset-password,
     so the trial-start gate in the Stripe webhook can still recognise
     them. Backfilled true for:
       (a) every user still flagged auth_provider='waitlist'
       (b) every user who currently holds the 'founder_diamond' badge
           (the auto-award was waitlist-only, so badge-holders are
            necessarily former waitlisters)

  2. founder_claims (new table): single source of truth for who has
     claimed a Founder Diamond seat AFTER the new gating rule lands.
     Cap of 300 is enforced at the application layer with a Postgres
     advisory lock; the table itself only enforces uniqueness per user
     and per claim_position.

       user_id        UUID  PK    FK -> users(id) ON DELETE CASCADE
       claim_position INT   NOT NULL UNIQUE  (1..300, monotonic by claimed_at)
       claimed_at     TIMESTAMPTZ NOT NULL  default now()

     Pre-existing badge holders are NOT backfilled into this table —
     they have until the May 6 18:00 UTC cutoff to start a trial and
     earn a row. The revocation sweep at the cutoff removes the badge
     from any holder lacking a row here.

Idempotent: IF NOT EXISTS on column add and table create. Safe to re-run.
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
            # 1a. Column.
            conn.execute(text("""
                ALTER TABLE user_profiles
                ADD COLUMN IF NOT EXISTS was_waitlister BOOLEAN NOT NULL DEFAULT FALSE;
            """))

            # 1b. Backfill from current waitlist auth_provider.
            conn.execute(text("""
                UPDATE user_profiles up
                SET was_waitlister = TRUE
                FROM users u
                WHERE up.user_id = u.id
                  AND u.auth_provider = 'waitlist'
                  AND up.was_waitlister = FALSE;
            """))

            # 1c. Backfill from existing founder_diamond holders (covers
            # waitlisters who already claimed and flipped auth_provider
            # to 'email').
            conn.execute(text("""
                UPDATE user_profiles up
                SET was_waitlister = TRUE
                FROM user_badges ub
                WHERE up.user_id = ub.user_id
                  AND ub.badge_id = 'founder_diamond'
                  AND up.was_waitlister = FALSE;
            """))

            # 2. founder_claims table.
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS founder_claims (
                    user_id        UUID PRIMARY KEY
                                   REFERENCES users(id) ON DELETE CASCADE,
                    claim_position INTEGER NOT NULL UNIQUE,
                    claimed_at     TIMESTAMP WITH TIME ZONE
                                   NOT NULL DEFAULT NOW()
                );
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_founder_claims_position
                ON founder_claims (claim_position);
            """))

            trans.commit()
            print(
                "Migration 028: user_profiles.was_waitlister backfilled, "
                "founder_claims table created."
            )
        except Exception:
            trans.rollback()
            raise


if __name__ == "__main__":
    run()
