"""
Notification Service - Create and manage in-app notifications.
"""
import logging
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from models.notification import Notification

logger = logging.getLogger(__name__)


def create_notification(
    user_id: str,
    type: str,
    title: str,
    message: str,
    reference_type: str = None,
    reference_id: str = None,
    db: Session = None
) -> Notification:
    """Create a new notification for a user."""
    notification = Notification(
        id=uuid.uuid4(),
        user_id=user_id,
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

    return [_format_notification(n) for n in notifications]


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

    return [_format_notification(n) for n in notifications]


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


def _format_notification(n: Notification) -> dict:
    """Format a notification for API response."""
    return {
        "id": str(n.id),
        "type": n.type,
        "title": n.title,
        "message": n.message,
        "reference_type": n.reference_type,
        "reference_id": n.reference_id,
        "is_read": n.is_read,
        "created_at": n.created_at
    }
