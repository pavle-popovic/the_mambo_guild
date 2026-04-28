"""
Migration 029: payment_card_fingerprints table.

Trial-abuse defense. The pre-existing guards (disposable-email blocklist,
Stripe email lookup, normalized-email metadata search) catch
"different-email-on-throwaway-domain" loops, but they DO NOT catch the
same-card-different-email pattern explicitly called out as a known gap
in services/payments.py::_email_has_prior_stripe_subscription.

This migration creates the missing piece. The card_fingerprint_service
records one row per (Stripe card fingerprint, user) pair on every
trialing-state subscription.created webhook. The next time the same
fingerprint shows up for a DIFFERENT user, the new trial is collapsed
to trial_end=now so no extra free month gets extracted.

Schema:
  id                          UUID PK
  fingerprint                 VARCHAR(64) NOT NULL    (Stripe-issued)
  user_id                     UUID NOT NULL FK -> users(id) ON DELETE CASCADE
  stripe_payment_method_id    VARCHAR(64) NULL        (audit trail)
  first_used_for_trial_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()

  UNIQUE (fingerprint, user_id)  — webhook retries are a no-op insert
  INDEX  (fingerprint)           — hot path is cross-user reuse lookup

Idempotent: CREATE TABLE IF NOT EXISTS, CREATE INDEX IF NOT EXISTS.
Safe to re-run.

Why per-(fingerprint, user) uniqueness instead of just per-fingerprint:
a single legitimate user re-subscribing on the same card after a
cancellation must not be blocked. Cross-user reuse is the only signal
we treat as abuse.
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
                CREATE TABLE IF NOT EXISTS payment_card_fingerprints (
                    id                       UUID PRIMARY KEY,
                    fingerprint              VARCHAR(64) NOT NULL,
                    user_id                  UUID NOT NULL
                                             REFERENCES users(id) ON DELETE CASCADE,
                    stripe_payment_method_id VARCHAR(64) NULL,
                    first_used_for_trial_at  TIMESTAMP WITH TIME ZONE
                                             NOT NULL DEFAULT NOW(),
                    CONSTRAINT uq_pcf_fingerprint_user
                        UNIQUE (fingerprint, user_id)
                );
            """))
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_pcf_fingerprint
                ON payment_card_fingerprints (fingerprint);
            """))
            trans.commit()
            print(
                "Migration 029: payment_card_fingerprints table + index created."
            )
        except Exception:
            trans.rollback()
            raise


if __name__ == "__main__":
    run()
