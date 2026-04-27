"""
Tier helpers.

The codebase already has `is_user_pro` in clave_service, which collapses
Advanced + Performer into a single "pro" flag. Tier-gated shop items need
more precision: some SKUs require Advanced-or-higher while Rookies are
locked out, and future SKUs may be Performer-only. Rather than scatter
enum comparisons across routers, centralise the ordering here.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from models.user import Subscription, SubscriptionTier, SubscriptionStatus


# Total order on tiers. Higher value = more privileges.
_TIER_RANK = {
    "rookie": 0,
    "advanced": 1,
    "performer": 2,
}


def user_tier(user_id: str, db: Session) -> str:
    """Resolve the user's current effective tier string.

    Returns 'rookie' if the user has no active subscription or is past-due /
    cancelled. `SubscriptionStatus.TRIALING` counts as the subscribed tier.

    Defense in depth: if Stripe ever fails to deliver a renewal webhook,
    the local row can stay ACTIVE past its true period end. Treat an
    expired period as effective Rookie so tier-gated features don't keep
    granting access on a lapsed subscription. premium.is_guild_master
    already does this check; mirroring it here keeps every tier-gated
    surface (shop, feature flags, etc.) consistent.
    """
    sub = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == user_id,
            Subscription.status.in_([
                SubscriptionStatus.ACTIVE,
                SubscriptionStatus.TRIALING,
            ]),
        )
        .first()
    )
    if not sub:
        return "rookie"
    period_end = sub.current_period_end
    if period_end is not None:
        # Naive datetimes from older rows: treat as UTC so the comparison
        # below doesn't raise.
        if period_end.tzinfo is None:
            period_end = period_end.replace(tzinfo=timezone.utc)
        if period_end < datetime.now(timezone.utc):
            return "rookie"
    return sub.tier.value if isinstance(sub.tier, SubscriptionTier) else str(sub.tier)


def require_tier_at_least(user_id: str, required: Optional[str], db: Session) -> bool:
    """True iff the user's tier rank is >= the required tier.

    A `required` of None means no tier gate (open to all).
    """
    if not required:
        return True
    needed = _TIER_RANK.get(required, 99)
    have = _TIER_RANK.get(user_tier(user_id, db), -1)
    return have >= needed


def community_participation_status(user_id: str, db: Session) -> dict:
    """Resolve whether a user can post/comment in the community.

    Returns a dict so the caller can branch on `state`:
      - "allowed"  → user has paid access and can author content
      - "free"     → no paid subscription (rookie / inactive); blocked
      - "trial"    → trialing on a paid tier; blocked ONLY when the
                     BLOCK_TRIAL_FROM_COMMUNITY_POSTING flag is on
      - "expired"  → had a sub but the period ended; treat as free

    The flag-gated trial path lets us flip on stricter friction later
    (forcing a real $39 charge + 7-day wait before posting) without
    a code change. Default off so trialing members can author today.
    """
    from config import settings

    sub = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == user_id,
            Subscription.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]),
        )
        .first()
    )
    if not sub:
        return {"state": "free", "allowed": False}

    period_end = sub.current_period_end
    if period_end is not None:
        if period_end.tzinfo is None:
            period_end = period_end.replace(tzinfo=timezone.utc)
        if period_end < datetime.now(timezone.utc):
            return {"state": "expired", "allowed": False}

    tier_value = sub.tier.value if isinstance(sub.tier, SubscriptionTier) else str(sub.tier)
    if tier_value not in ("advanced", "performer"):
        return {"state": "free", "allowed": False}

    if sub.status == SubscriptionStatus.TRIALING and settings.BLOCK_TRIAL_FROM_COMMUNITY_POSTING:
        return {"state": "trial", "allowed": False}

    return {"state": "allowed", "allowed": True}


def can_participate_in_community(user_id: str, db: Session) -> bool:
    """Boolean wrapper for `community_participation_status`."""
    return community_participation_status(user_id, db)["allowed"]


# Frontend-facing messages keyed by the participation state. Centralised
# here so the upgrade banner and the inline error stay in sync.
COMMUNITY_GATE_MESSAGES = {
    "free": "Posting in the community is for paid Mambo Guild members. Subscribe to share your practice or ask questions.",
    "expired": "Your subscription has lapsed. Renew to keep posting in the community.",
    "trial": "For security reasons, posting is not possible during your free trial. You'll be able to post once your trial ends and your first payment is processed.",
}


def community_gate_message(state: str, *, surface: str = "post") -> str:
    """Return the user-facing message for a blocked participation state.

    `surface` lets us tweak wording for the lab/stage/comment endpoints
    without duplicating the trial copy across places.
    """
    if state == "free" and surface == "comment":
        return "Commenting is for paid Mambo Guild members. Subscribe to join the conversation."
    return COMMUNITY_GATE_MESSAGES.get(state, COMMUNITY_GATE_MESSAGES["free"])
