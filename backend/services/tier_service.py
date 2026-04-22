"""
Tier helpers.

The codebase already has `is_user_pro` in clave_service, which collapses
Advanced + Performer into a single "pro" flag. Tier-gated shop items need
more precision: some SKUs require Advanced-or-higher while Rookies are
locked out, and future SKUs may be Performer-only. Rather than scatter
enum comparisons across routers, centralise the ordering here.
"""
from __future__ import annotations

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
