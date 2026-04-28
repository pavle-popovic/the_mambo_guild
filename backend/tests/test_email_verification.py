"""
Static / wiring tests for the email-verification gate.

These tests do NOT touch a database, Redis, or Resend. They catch
import errors, missing routes, schema drift, and silent removals of
the trial-gate / register-side-effect / waitlist-auto-verify code
paths. The actual end-to-end "click the link, status flips, trial
unlocks" flow is verified manually against staging — see the
"Manual verification" block at the bottom of this file.

Why a static layer is enough pre-launch:
- Token generation is itsdangerous (deterministic, well-tested upstream).
- Single-use enforcement reuses the password-reset Redis blacklist path,
  which has been live in prod since launch.
- Rate limiting reuses check_rate_limit, also live in prod.
- All three side-effects we care about (auto-send on register, auto-
  verify on waitlist claim, trial-gate on checkout) are implemented as
  inline code in named handlers — verified here by source inspection.
"""
import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# ---------------------------------------------------------------------------
# 1. Imports + signatures.
# ---------------------------------------------------------------------------

def test_email_service_exposes_send_email_verification_email():
    from services import email_service
    assert callable(getattr(email_service, "send_email_verification_email", None)), (
        "services.email_service.send_email_verification_email must exist for the "
        "register-time auto-send and the /send-verification endpoint."
    )


def test_config_has_email_verification_expire_hours():
    from config import settings
    assert isinstance(settings.EMAIL_VERIFICATION_EXPIRE_HOURS, int)
    # 24h is the spec'd default. Drift here would silently shorten /
    # extend the verification-link replay window.
    assert settings.EMAIL_VERIFICATION_EXPIRE_HOURS >= 1
    assert settings.EMAIL_VERIFICATION_EXPIRE_HOURS <= 168, (
        "Verification token TTL above one week is suspicious; sign of a "
        "config typo (hours vs minutes)."
    )


def test_request_schemas_present():
    from schemas.auth import VerifyEmailRequest, ResendVerificationRequest

    # VerifyEmailRequest must require a token field.
    assert "token" in VerifyEmailRequest.model_fields
    # ResendVerificationRequest is intentionally empty (the user is
    # derived from the auth cookie).
    assert ResendVerificationRequest.model_fields == {}


# ---------------------------------------------------------------------------
# 2. Endpoints registered on the auth router.
# ---------------------------------------------------------------------------

def _auth_router_paths():
    from routers import auth as auth_router
    return {
        (r.path, tuple(sorted(r.methods)))
        for r in auth_router.router.routes
    }


def test_verify_email_endpoint_registered():
    paths = _auth_router_paths()
    assert ("/verify-email", ("POST",)) in paths


def test_send_verification_endpoint_registered():
    paths = _auth_router_paths()
    assert ("/send-verification", ("POST",)) in paths


# ---------------------------------------------------------------------------
# 3. Side-effects on existing handlers — register / reset_password / checkout.
# ---------------------------------------------------------------------------

def test_register_enqueues_verification_email():
    """
    The /register handler must enqueue a verification email at the end
    of a successful signup. Without this, every new user lands in
    is_verified=False with no link to click — a permanent block on
    starting the free trial.
    """
    import inspect
    from routers import auth
    src = inspect.getsource(auth.register)
    assert "send_email_verification_email" in src, (
        "register() must enqueue send_email_verification_email after creating "
        "the user; otherwise users have no verification link to click."
    )
    # The send must use the email-verification serializer (distinct salt
    # from password-reset).
    assert 'salt="email-verification"' in src


def test_waitlist_claim_auto_verifies_email():
    """
    A waitlister claiming their account via /reset-password must be
    auto-marked is_verified=True. Justification: clicking the password-
    reset link is itself proof of inbox access. Without this, the
    waitlist-claim cohort would have to do a SECOND email round-trip
    just to start the trial — the friction the user explicitly asked
    us to remove.
    """
    import inspect
    from routers import auth
    src = inspect.getsource(auth.reset_password)
    # The waitlist branch must set is_verified=True. Looking for the
    # exact assignment so a refactor that drops it fails loudly.
    assert "user.is_verified = True" in src, (
        "reset_password() must set user.is_verified = True on the waitlist "
        "claim path so claimers don't need a second email round-trip."
    )


def test_checkout_gates_trial_on_email_verification():
    """
    POST /create-checkout-session must reject a fresh-trial attempt
    from an unverified user. The frontend matches on the literal
    string "email_verification_required" in the detail to surface the
    verify-email modal instead of a generic toast — drift in either
    side breaks that UX.
    """
    import inspect
    from routers import payments
    src = inspect.getsource(payments.create_checkout_session)
    assert "is_verified" in src, (
        "create_checkout_session must check is_verified on the trial path."
    )
    assert "email_verification_required" in src, (
        "create_checkout_session must use the literal sentinel "
        "'email_verification_required' in the 400 detail so the frontend "
        "modal can be shown."
    )


# ---------------------------------------------------------------------------
# 4. Profile response — is_verified surfaced to the frontend.
# ---------------------------------------------------------------------------

def test_user_profile_response_has_is_verified():
    """The /me endpoint's response model must expose is_verified so the
    frontend can show a verify-email banner / gate the trial CTA before
    the round-trip."""
    from schemas.auth import UserProfileResponse
    assert "is_verified" in UserProfileResponse.model_fields


# ---------------------------------------------------------------------------
# Manual verification (run against staging Railway URL with test keys):
#
#   # Sign up a fresh user via the frontend.
#   # 1. /register with a real inbox you own.
#   # 2. Confirm: GET /api/auth/me → is_verified == false.
#   # 3. Confirm: a verification email arrived in the inbox.
#
#   # Confirm the trial-gate fires:
#   curl -s -X POST $API/api/payments/create-checkout-session \
#        -H "Cookie: access_token=$TOKEN" \
#        -H "Content-Type: application/json" \
#        -d '{"price_id":"'$ADV'","success_url":"...","cancel_url":"..."}' \
#        -i | head -20
#   # Expect: HTTP/1.1 400, detail starts with "email_verification_required:".
#
#   # Click the link from the inbox → /verify-email?token=…
#   # Expect: success screen, /me now returns is_verified == true,
#   # second create-checkout-session call returns a Stripe URL.
#
#   # Resend rate limit:
#   for i in 1 2 3 4; do
#     curl -s -X POST $API/api/auth/send-verification \
#          -H "Cookie: access_token=$TOKEN"
#     echo
#   done
#   # Expect: 4th call returns 429 (3-per-10-min cap per email).
#
#   # Waitlist auto-verify:
#   # 1. POST /api/auth/waitlist with a fresh email.
#   # 2. POST /api/auth/forgot-password (set ALLOW_ACCOUNT_CLAIM=true).
#   # 3. Click reset link → POST /api/auth/reset-password.
#   # 4. Confirm: /me returns is_verified == true even though no
#   #    /verify-email round-trip happened.
# ---------------------------------------------------------------------------
