"""
Static / wiring tests for the gated Founder Diamond claim.

These tests do NOT touch a database — they catch import errors, missing
routes, missing model columns, and constants that drifted from spec.
The actual atomic-claim semantics (cap = 300, deadline gate, race
serialisation) require a live Postgres and are validated by the
manual smoke pipeline in `scripts/founder_revocation_sweep.py --apply
--yes` (dry-run first) plus the Stripe-webhook test trigger documented
at the bottom of this file.

Why a smoke layer is enough pre-launch:
- The claim service is a single file with no fan-out.
- The cap is enforced by Postgres advisory lock (real DB-only behaviour
  to verify in staging).
- The webhook integration is an additive call wrapped in try/except,
  so any failure cannot break the rest of the subscription flow — that
  property is verified by inspection of the wrapping `try`.
"""
import os
import sys
from datetime import datetime, timezone

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# ---------------------------------------------------------------------------
# 1. Imports + constants — typo / drift guard.
# ---------------------------------------------------------------------------

def test_service_imports_and_constants():
    from services import founder_badge_service as svc

    assert svc.FOUNDER_BADGE_ID == "founder_diamond"
    assert svc.FOUNDER_CAP == 300
    # Deadline must be the exact spec'd UTC instant. Drift here would
    # silently extend or shorten the claim window.
    assert svc.FOUNDER_DEADLINE == datetime(2026, 5, 6, 18, 0, 0, tzinfo=timezone.utc)
    assert callable(svc.try_claim)
    assert callable(svc.get_status)


def test_founder_router_imports_and_registers_status_route():
    from routers import founder
    paths = {(r.path, tuple(sorted(r.methods))) for r in founder.router.routes}
    assert ("/founder-badge/status", ("GET",)) in paths


def test_founder_router_mounted_on_api_router():
    """The router must be included in the api_router so /api/founder-badge/status resolves."""
    from routers import api_router
    paths = {getattr(r, "path", None) for r in api_router.routes}
    assert "/founder-badge/status" in paths


# ---------------------------------------------------------------------------
# 2. Model schema — column / table presence.
# ---------------------------------------------------------------------------

def test_user_profile_has_was_waitlister_column():
    from models.user import UserProfile
    cols = {c.name for c in UserProfile.__table__.columns}
    assert "was_waitlister" in cols
    col = UserProfile.__table__.c.was_waitlister
    # Must be NOT NULL with a server-side default so migrations don't break
    # existing rows.
    assert col.nullable is False
    assert col.server_default is not None


def test_founder_claim_table_shape():
    from models.community import FounderClaim
    cols = {c.name: c for c in FounderClaim.__table__.columns}
    assert set(cols) == {"user_id", "claim_position", "claimed_at"}
    assert cols["user_id"].primary_key is True
    assert cols["claim_position"].unique is True
    assert cols["claim_position"].nullable is False


# ---------------------------------------------------------------------------
# 3. Behavioural guards — auto-award removed, webhook hook present.
# ---------------------------------------------------------------------------

def test_waitlist_signup_no_longer_auto_awards_founder_badge():
    """
    The pre-launch behaviour awarded founder_diamond at waitlist signup.
    Under the new gated rule that line MUST be gone, otherwise the cap
    is meaningless (every signup gets a badge before any trial starts).
    """
    import inspect
    from routers import auth
    src = inspect.getsource(auth.join_waitlist)
    assert 'badge_service.award_badge(str(user_id), "founder_diamond"' not in src
    # And the durable origin marker must be set so the webhook can
    # later identify this user as a former waitlister.
    assert "was_waitlister=True" in src


def test_webhook_calls_founder_try_claim():
    """
    The Stripe subscription handler must invoke try_claim on TRIALING
    or ACTIVE transitions. Without this hook the cap is unreachable.
    """
    import inspect
    from routers import payments
    src = inspect.getsource(payments)
    assert "founder_badge_service" in src
    assert "try_claim" in src
    # The call must be wrapped in try/except — failures here cannot
    # block the rest of the webhook.
    assert "founder_diamond claim failed (non-fatal)" in src


# ---------------------------------------------------------------------------
# 4. Status payload shape — frontend contract.
# ---------------------------------------------------------------------------

def test_status_response_model_shape():
    from routers.founder import FounderBadgeStatusResponse
    fields = FounderBadgeStatusResponse.model_fields
    assert set(fields) == {"claimed", "remaining", "cap", "deadline", "expired"}


# ---------------------------------------------------------------------------
# Manual verification (run against a staging Railway URL with test keys):
#
#   # Show current cap progress (cached 30s).
#   curl -i https://<staging>/api/founder-badge/status
#
#   # Trigger a fake trial-start for a known waitlister user. Replace
#   # cus_XXX with the user's stripe_customer_id.
#   stripe trigger customer.subscription.created \
#       --override "customer=cus_XXX" \
#       --override "status=trialing" \
#       --override "items.data[0].price=$STRIPE_ADVANCED_PRICE_ID"
#
#   # Verify a row appeared in founder_claims and the user got the badge.
#   psql $DATABASE_URL -c "SELECT * FROM founder_claims ORDER BY claim_position DESC LIMIT 5;"
#   psql $DATABASE_URL -c "SELECT * FROM user_badges WHERE badge_id='founder_diamond';"
#
#   # Race test: fire two webhooks for the SAME user concurrently. Should
#   # produce exactly one row in founder_claims (advisory lock + unique PK).
#
#   # Cap test: in a clean staging DB, fire 301 different users through
#   # the trial-start path. The 301st must NOT receive a row or badge.
#
#   # Dry-run the revocation sweep:
#   python -m scripts.founder_revocation_sweep
# ---------------------------------------------------------------------------
