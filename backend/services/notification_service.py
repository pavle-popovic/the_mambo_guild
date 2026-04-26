"""
Notification Service - Create and manage in-app notifications.
"""
import logging
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from models.notification import Notification
from models.user import UserProfile

logger = logging.getLogger(__name__)


def create_notification(
    user_id: str,
    type: str,
    title: str,
    message: str,
    reference_type: str = None,
    reference_id: str = None,
    actor_id: str = None,
    db: Session = None
) -> Notification:
    """Create a new notification for a user.

    `actor_id` should be set for events triggered by another user (reactions,
    replies, etc.) so the dropdown can render their avatar + clickable handle.
    Leave None for system events (badges, scheduled meetings).
    """
    notification = Notification(
        id=uuid.uuid4(),
        user_id=user_id,
        actor_id=actor_id,
        type=type,
        title=title,
        message=message,
        reference_type=reference_type,
        reference_id=reference_id
    )
    db.add(notification)
    db.flush()
    logger.info(f"Notification created for user {user_id}: {type} - {title}")
    return notification


def get_notifications(
    user_id: str,
    skip: int = 0,
    limit: int = 20,
    db: Session = None
) -> List[dict]:
    """Get all notifications for a user, newest first."""
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(
        desc(Notification.created_at)
    ).offset(skip).limit(limit).all()

    return _format_notifications(notifications, db)


def get_unread_notifications(
    user_id: str,
    limit: int = 20,
    db: Session = None
) -> List[dict]:
    """Get unread notifications for a user."""
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).order_by(
        desc(Notification.created_at)
    ).limit(limit).all()

    return _format_notifications(notifications, db)


def get_unread_count(user_id: str, db: Session) -> int:
    """Get count of unread notifications."""
    return db.query(func.count(Notification.id)).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).scalar() or 0


def mark_read(notification_id: str, user_id: str, db: Session) -> bool:
    """Mark a single notification as read."""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    if not notification:
        return False
    notification.is_read = True
    db.flush()
    return True


def mark_all_read(user_id: str, db: Session) -> int:
    """Mark all notifications as read. Returns count updated."""
    count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.flush()
    return count


def _format_notifications(rows: List[Notification], db: Session) -> List[dict]:
    """Format a list of notifications, batch-loading actor profiles in one query.

    Notifications without an actor_id (legacy rows + system events) just get
    None for the actor fields, and the frontend falls back to the embedded
    message text.
    """
    actor_ids = {n.actor_id for n in rows if n.actor_id is not None}
    actors: dict = {}
    if actor_ids:
        profiles = db.query(UserProfile).filter(UserProfile.user_id.in_(actor_ids)).all()
        actors = {str(p.user_id): p for p in profiles}

    return [_format_notification(n, actors.get(str(n.actor_id)) if n.actor_id else None) for n in rows]


def _format_notification(n: Notification, actor: Optional[UserProfile] = None) -> dict:
    """Format a notification for API response."""
    return {
        "id": str(n.id),
        "type": n.type,
        "title": n.title,
        "message": n.message,
        "reference_type": n.reference_type,
        "reference_id": n.reference_id,
        "is_read": n.is_read,
        "created_at": n.created_at,
        "actor_id": str(n.actor_id) if n.actor_id else None,
        "actor_username": actor.username if actor else None,
        "actor_avatar_url": actor.avatar_url if actor else None,
    }
