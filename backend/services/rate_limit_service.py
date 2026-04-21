"""
Rate Limit Service
==================

Per-user hourly rate limits on community actions. Replaces the "clave cost"
as our primary spam defense now that engagement is free.

Limits are intentionally generous — a genuinely active user shouldn't hit
them. They are a soft floor against bot/scripted abuse, not a throttle on
human behavior.

Backed by the existing Post / PostReply / PostReaction tables (no Redis,
no new schema). Queries are indexed on user_id + created_at so the cost
is a single count per hour.
"""
from datetime import datetime, timedelta
from typing import Tuple
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.community import Post, PostReply, PostReaction
from services.clave_service import is_user_pro


# (free_limit, pro_limit) per hour
LIMITS = {
    "post": (10, 20),
    "reply": (30, 60),
    "reaction": (60, 120),
}

_ACTION_LABELS = {
    "post": "posts",
    "reply": "replies",
    "reaction": "reactions",
}


def _limit_for(action: str, is_pro: bool) -> int:
    free, pro = LIMITS[action]
    return pro if is_pro else free


def _count_since(db: Session, action: str, user_id: str, since: datetime) -> int:
    if action == "post":
        return db.query(func.count(Post.id)).filter(
            Post.user_id == user_id,
            Post.created_at >= since,
        ).scalar() or 0
    if action == "reply":
        return db.query(func.count(PostReply.id)).filter(
            PostReply.user_id == user_id,
            PostReply.created_at >= since,
        ).scalar() or 0
    if action == "reaction":
        return db.query(func.count(PostReaction.id)).filter(
            PostReaction.user_id == user_id,
            PostReaction.created_at >= since,
        ).scalar() or 0
    raise ValueError(f"Unknown rate limit action: {action}")


def check(action: str, user_id: str, db: Session) -> Tuple[bool, dict]:
    """
    Returns (allowed, info). info includes current/limit/reset_seconds so
    callers can surface useful feedback. On denial, allowed=False.

    Unknown action raises ValueError (programmer error, not user input).
    """
    is_pro = is_user_pro(user_id, db)
    limit = _limit_for(action, is_pro)

    window_start = datetime.utcnow() - timedelta(hours=1)
    current = _count_since(db, action, user_id, window_start)

    if current < limit:
        return True, {"current": current, "limit": limit, "window_seconds": 3600}

    label = _ACTION_LABELS.get(action, action)
    return False, {
        "current": current,
        "limit": limit,
        "window_seconds": 3600,
        "message": (
            f"You've hit the hourly limit of {limit} {label}. "
            "Take a breather and come back shortly."
        ),
    }
