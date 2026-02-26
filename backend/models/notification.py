"""
Notification Model - In-app notifications for community events.
"""
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from models import Base


class Notification(Base):
    """In-app notifications for users."""
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    type = Column(String(50), nullable=False)  # 'badge_earned', 'reaction_received', 'reply_received', 'answer_accepted'
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)

    # Optional reference to related entity
    reference_type = Column(String(50), nullable=True)  # 'post', 'reply', 'badge'
    reference_id = Column(String(100), nullable=True)

    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="notifications")
