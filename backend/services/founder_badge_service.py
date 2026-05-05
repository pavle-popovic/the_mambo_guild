"""
Founder Diamond — gated claim service.

Rule: a Founder Diamond seat is claimable iff
  (a) the user originally came from the waitlist
      (UserProfile.was_waitlister = TRUE)
  (b) the current time is < FOUNDER_DEADLINE
      (2026-05-07 06:00:00 UTC = Wed May 7 08:00 Rome / CEST)
  (c) fewer than FOUNDER_CAP (300) seats have been claimed
  (d) the user has not already claimed a seat

Cap is enforced atomically with a Postgres transaction-scoped advisory
lock so two concurrent webhook deliveries can't both pass at count=299.
The lock is released automatically on commit/rollback.

The claim is recorded in `founder_claims` (one row per user, monotonic
claim_position 1..300). Awarding the actual badge is delegated to
badge_service.award_badge so notifications and analytics fire on the
same path as every other badge.

Idempotent: repeat calls for the same user are no-ops.
"""
import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.community import FounderClaim, UserBadge
from models.user import UserProfile

logger = logging.getLogger(__name__)


FOUNDER_BADGE_ID = "founder_diamond"
FOUNDER_CAP = 300
# Hard deadline. Anything strictly before this UTC instant qualifies;
# anything at or after is rejected. Stored as aware UTC so comparisons
# with `datetime.now(timezone.utc)` are unambiguous.
FOUNDER_DEADLINE = datetime(2026, 5, 7, 6, 0, 0, tzinfo=timezone.utc)
# Constant key for the pg advisory lock that serialises the
# count-then-insert window. Picked to not collide with the Guild Master
# seat lock (734829_1) or the per-user checkout locks.
_FOUNDER_LOCK_KEY = 734830_1


def _lock_founder_seats(db: Session) -> None:
    """
    Acquire a transaction-scoped advisory lock that serialises Founder
    seat allocation. Released automatically at commit/rollback. Best
    effort on non-Postgres backends (silently noops).
    """
    try:
        db.execute(
            text("SELECT pg_advisory_xact_lock(:k)"),
            {"k": _FOUNDER_LOCK_KEY},
        )
    except Exception:
        logger.debug(
            "Advisory lock unavailable — continuing without serialisation"
        )


def get_status(db: Session) -> dict:
    """
    Public read of cap progress. Cheap COUNT(*) on a small table.

    Returns:
        {
          "claimed":   int,    # rows in founder_claims
          "remaining": int,    # max(0, cap - claimed)
          "cap":       300,
          "deadline":  ISO-8601 UTC string,
          "expired":   bool,   # now >= deadline
        }
    """
    claimed = db.query(FounderClaim).count()
    now = datetime.now(timezone.utc)
    return {
        "claimed": claimed,
        "remaining": max(0, FOUNDER_CAP - claimed),
        "cap": FOUNDER_CAP,
        "deadline": FOUNDER_DEADLINE.isoformat(),
        "expired": now >= FOUNDER_DEADLINE,
    }


def try_claim(user_id, db: Session) -> Optional[int]:
    """
    Attempt to claim a Founder Diamond seat for ``user_id``.

    Returns:
        The assigned ``claim_position`` (1..300) if a new claim was
        recorded; ``None`` if the user is ineligible, the cap is full,
        the deadline has passed, or the user has already claimed.

    Side effects:
        - Inserts a row into ``founder_claims``.
        - Calls ``badge_service.award_badge`` to grant the actual badge
          (notification + analytics fire from there).
        - Caller is responsible for committing the transaction. We only
          ``flush`` so the lock and the row land in the same TX.

    Safety:
        - Wrapped in try/except: a failed claim must NEVER block the
          surrounding subscription webhook from completing. Returns None
          on any unexpected error.
    """
    try:
        # Gate (b) — deadline. Cheap to check first; saves a lock acquire
        # for late traffic.
        if datetime.now(timezone.utc) >= FOUNDER_DEADLINE:
            return None

        # Gate (a) — waitlister origin. Read with FOR UPDATE not needed
        # because was_waitlister is set once at signup and never flipped
        # back. Plain read is race-free for our purposes.
        profile = (
            db.query(UserProfile)
            .filter(UserProfile.user_id == user_id)
            .first()
        )
        if not profile or not profile.was_waitlister:
            return None

        # Gate (d) — already claimed (early exit before locking).
        existing = (
            db.query(FounderClaim)
            .filter(FounderClaim.user_id == user_id)
            .first()
        )
        if existing is not None:
            return None

        # Serialise the count-then-insert window across concurrent
        # webhook deliveries.
        _lock_founder_seats(db)

        # Re-check (d) inside the lock — another delivery for the same
        # user could have raced us between the early exit and the lock.
        existing = (
            db.query(FounderClaim)
            .filter(FounderClaim.user_id == user_id)
            .first()
        )
        if existing is not None:
            return None

        # Gate (c) — cap.
        claimed = db.query(FounderClaim).count()
        if claimed >= FOUNDER_CAP:
            logger.info(
                "founder_claim: cap reached (%d/%d), rejecting user %s",
                claimed, FOUNDER_CAP, user_id,
            )
            return None

        # Allocate the next position. Monotonic by design: even if rows
        # were ever deleted, max+1 keeps positions unique. Safe under
        # the advisory lock — only one transaction runs this at a time.
        next_position = (
            db.query(FounderClaim.claim_position)
            .order_by(FounderClaim.claim_position.desc())
            .limit(1)
            .scalar()
        )
        next_position = (next_position or 0) + 1

        claim = FounderClaim(
            user_id=user_id,
            claim_position=next_position,
            claimed_at=datetime.now(timezone.utc),
        )
        db.add(claim)

        # Award the actual badge if not already held. The pre-launch
        # auto-award path may have already given existing waitlisters
        # this badge — in that case we still record the claim row (so
        # they keep the badge through the May 6 sweep) but skip the
        # duplicate award_badge call.
        already_has_badge = (
            db.query(UserBadge)
            .filter(
                UserBadge.user_id == user_id,
                UserBadge.badge_id == FOUNDER_BADGE_ID,
            )
            .first()
        )
        if not already_has_badge:
            # Local import to avoid a circular dependency at module load
            # (badge_service -> notification_service -> ... -> models).
            from services import badge_service
            badge_service.award_badge(str(user_id), FOUNDER_BADGE_ID, db)

        db.flush()
        logger.info(
            "founder_claim: user %s awarded position %d/%d",
            user_id, next_position, FOUNDER_CAP,
        )
        return next_position

    except IntegrityError:
        # Unique constraint violation — concurrent claim won. Treat as
        # "already claimed" rather than an error.
        logger.info(
            "founder_claim: race lost on unique constraint for user %s",
            user_id,
        )
        return None
    except Exception:
        logger.exception(
            "founder_claim: unexpected failure for user %s — skipping",
            user_id,
        )
        return None
