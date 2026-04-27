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


def can_participate_in_community(user_id: str, db: Session) -> bool:
    """True iff the user is on a fully-paid (non-trial) Advanced/Performer
    subscription. Stricter than `user_tier`: trialing users are blocked.

    The point: a malicious actor wanting to abuse the community would have
    to commit a real $39 charge AND wait out a 7-day trial. Free-tier and
    trialing users can read the community but not post or comment.
    """
    sub = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == user_id,
            Subscription.status == SubscriptionStatus.ACTIVE,
        )
        .first()
    )
    if not sub:
        return False
    period_end = sub.current_period_end
    if period_end is not None:
        if period_end.tzinfo is None:
            period_end = period_end.replace(tzinfo=timezone.utc)
        if period_end < datetime.now(timezone.utc):
            return False
    tier_value = sub.tier.value if isinstance(sub.tier, SubscriptionTier) else str(sub.tier)
    return tier_value in ("advanced", "performer")
