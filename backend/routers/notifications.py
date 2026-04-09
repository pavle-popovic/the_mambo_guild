"""
Notification API Endpoints
/api/notifications - In-app notifications
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from models import get_db
from models.user import User
from dependencies import get_current_user
from services import notification_service

router = APIRouter(tags=["Notifications"])


@router.get("/")
def get_notifications(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notifications for the current user."""
    return notification_service.get_notifications(
        user_id=str(current_user.id),
        skip=skip,
        limit=limit,
        db=db
    )


@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications."""
    count = notification_service.get_unread_count(str(current_user.id), db)
    return {"unread_count": count}


@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a single notification as read."""
    success = notification_service.mark_read(notification_id, str(current_user.id), db)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.commit()
    return {"success": True}


@router.post("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read."""
    count = notification_service.mark_all_read(str(current_user.id), db)
    db.commit()
    return {"success": True, "count": count}
