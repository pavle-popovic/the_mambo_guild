"""
Posting rewards: turning posts into claves with guardrails.

Call `award_post_reward(post_id, db)` after a post is successfully created
and committed. The service:
  * Picks the reward amount from the post's shape (stage vs lab).
  * Enforces a per-day cap and a per-user cooldown (checked against
    existing `clave_transactions` rows).
  * Refuses to pay twice for the same post (idempotent by reference_id).

Call `clawback_post_reward(post_id, db)` on soft-delete or moderation
rejection. It inserts one negative reversal transaction and nudges the
user's balance down — we allow it to go negative because the simplest
anti-farming posture is "debts are real; future earnings backfill them."

Reason strings are intentionally namespaced (`post_reward:stage`,
`post_reward:lab`, `post_reward_clawback:*`) so `LIKE 'post_reward:%'`
queries can find the full set for caps and audits.
"""
from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from models.community import ClaveTransaction, Post
from models.user import UserProfile
from services import clave_service

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Tunables
# ---------------------------------------------------------------------------

REWARD_STAGE_POST = 40         # 4x boost
REWARD_LAB_QUESTION = 12       # 4x boost

DAILY_REWARD_CAP = 120         # scaled 4x with per-post amounts; daily cap is the real anti-farming gate
COOLDOWN_SECONDS = 60          # 60s blocks bot bursts but allows back-to-back legitimate posts
LAB_BODY_MIN_CHARS = 40        # prevent "a?" farming
CLAWBACK_WINDOW_HOURS = 72

REASON_PREFIX = "post_reward:"
CLAWBACK_PREFIX = "post_reward_clawback:"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _reward_reason(post: Post) -> Optional[tuple[str, int]]:
    """Return (reason_suffix, amount) for this post, or None if ineligible."""
    if post.post_type == "stage":
        if not post.mux_asset_id:
            return None
        if post.video_duration_seconds is not None and post.video_duration_seconds <= 0:
            return None
        return ("stage", REWARD_STAGE_POST)

    if post.post_type == "lab":
        body = (post.body or "").strip()
        if len(body) < LAB_BODY_MIN_CHARS:
            return None
        return ("lab", REWARD_LAB_QUESTION)

    return None


def _today_bounds_utc() -> tuple[datetime, datetime]:
    """UTC start-of-day / end-of-day window, used by the daily cap query."""
    now = datetime.now(timezone.utc)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    return start, end


def _already_rewarded(user_id: str, post_id: str, db: Session) -> bool:
    """Has this exact post already yielded a reward txn? (idempotency)."""
    row = (
        db.query(ClaveTransaction.id)
        .filter(
            ClaveTransaction.user_id == user_id,
            ClaveTransaction.reference_id == post_id,
            ClaveTransaction.reason.like(f"{REASON_PREFIX}%"),
        )
        .first()
    )
    return row is not None


def _sum_today_rewards(user_id: str, db: Session) -> int:
    start, end = _today_bounds_utc()
    total = (
        db.query(func.coalesce(func.sum(ClaveTransaction.amount), 0))
        .filter(
            ClaveTransaction.user_id == user_id,
            ClaveTransaction.reason.like(f"{REASON_PREFIX}%"),
            ClaveTransaction.created_at >= start,
            ClaveTransaction.created_at < end,
        )
        .scalar()
    )
    # `amount` for rewards is positive; clawbacks live under a different
    # prefix and don't count against the cap.
    return int(total or 0)


def _on_cooldown(user_id: str, db: Session) -> bool:
    latest = (
        db.query(func.max(ClaveTransaction.created_at))
        .filter(
            ClaveTransaction.user_id == user_id,
            ClaveTransaction.reason.like(f"{REASON_PREFIX}%"),
        )
        .scalar()
    )
    if not latest:
        return False
    # `created_at` on clave_transactions is naive UTC (datetime.utcnow).
    elapsed = (datetime.utcnow() - latest).total_seconds()
    return elapsed < COOLDOWN_SECONDS


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def award_post_reward(post_id: str, db: Session) -> dict:
    """Credit claves to the post author for creating `post_id`.

    Silent on every reason-to-skip path; returns a dict the caller can log
    but should not surface to users (we don't want to tip people off to
    the exact cap / cooldown heuristics).

    Concurrency: we take `SELECT ... FOR UPDATE` on the author's
    user_profiles row at the top so that a user posting from multiple
    tabs serialises here. Without the lock, two simultaneous posts both
    pass the cooldown + daily-cap checks against the same pre-award
    ledger state and both get rewarded, bypassing the cap by up to N×.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return {"awarded": False, "reason": "post_not_found"}

    shape = _reward_reason(post)
    if not shape:
        return {"awarded": False, "reason": "ineligible"}

    kind, amount = shape
    user_id = str(post.user_id)

    # Lock the author's profile for the duration of the check+award
    # sequence. Any concurrent award_post_reward / earn_claves for this
    # user will wait until we commit or rollback.
    profile_lock = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == user_id)
        .with_for_update()
        .first()
    )
    if not profile_lock:
        return {"awarded": False, "reason": "profile_not_found"}

    if _already_rewarded(user_id, str(post.id), db):
        return {"awarded": False, "reason": "already_rewarded"}

    if _on_cooldown(user_id, db):
        return {"awarded": False, "reason": "cooldown"}

    already_today = _sum_today_rewards(user_id, db)
    if already_today >= DAILY_REWARD_CAP:
        return {"awarded": False, "reason": "daily_cap"}

    # If paying the full amount would exceed the cap, trim to what's left
    # (keeps the incentive on the post that pushed them over instead of
    # blackholing it). At minimum 1 🥢.
    amount = min(amount, max(0, DAILY_REWARD_CAP - already_today))
    if amount <= 0:
        return {"awarded": False, "reason": "daily_cap"}

    reason = f"{REASON_PREFIX}{kind}"
    new_balance = clave_service.earn_claves(
        user_id=user_id,
        amount=amount,
        reason=reason,
        db=db,
        reference_id=str(post.id),
    )
    logger.info(
        "post-reward: user=%s post=%s kind=%s amount=%s new_balance=%s",
        user_id, post.id, kind, amount, new_balance,
    )
    return {
        "awarded": True,
        "amount": amount,
        "reason": reason,
        "new_balance": new_balance,
    }


def clawback_post_reward(post_id: str, db: Session) -> dict:
    """Reverse any post_reward:* txns previously awarded for this post.

    Idempotent: if a matching clawback row already exists, we do nothing.
    Only claws back if the original reward is within `CLAWBACK_WINDOW_HOURS`.
    Allows the balance to go negative — simplest way to guarantee the
    ledger is always correct without racing against concurrent spends.
    """
    reward = (
        db.query(ClaveTransaction)
        .filter(
            ClaveTransaction.reference_id == post_id,
            ClaveTransaction.reason.like(f"{REASON_PREFIX}%"),
        )
        .order_by(ClaveTransaction.created_at.desc())
        .first()
    )
    if not reward:
        return {"clawed_back": False, "reason": "no_reward"}

    # Window check — old enough rewards are safe from clawback so a
    # moderator deleting ancient content doesn't wipe earned balance.
    age = datetime.utcnow() - reward.created_at
    if age > timedelta(hours=CLAWBACK_WINDOW_HOURS):
        return {"clawed_back": False, "reason": "out_of_window"}

    # Idempotency check — same prefix namespace so a second delete is a no-op.
    already = (
        db.query(ClaveTransaction.id)
        .filter(
            ClaveTransaction.reference_id == post_id,
            ClaveTransaction.reason.like(f"{CLAWBACK_PREFIX}%"),
        )
        .first()
    )
    if already:
        return {"clawed_back": False, "reason": "already_clawed_back"}

    kind = reward.reason.split(":", 1)[1] if ":" in reward.reason else "unknown"
    clawback_reason = f"{CLAWBACK_PREFIX}{kind}"

    # Write the reversal txn. We don't use spend_claves() because we intentionally
    # want to allow the balance to go negative; spend_claves refuses negative.
    txn = ClaveTransaction(
        user_id=reward.user_id,
        amount=-reward.amount,
        reason=clawback_reason,
        reference_id=reward.reference_id,
    )
    db.add(txn)

    profile = (
        db.query(UserProfile)
        .filter(UserProfile.user_id == reward.user_id)
        .with_for_update()
        .first()
    )
    if profile:
        profile.current_claves = profile.current_claves - reward.amount
    db.flush()

    logger.info(
        "post-reward clawback: user=%s post=%s amount=%s",
        reward.user_id, post_id, -reward.amount,
    )
    return {
        "clawed_back": True,
        "amount": -reward.amount,
        "reason": clawback_reason,
    }
