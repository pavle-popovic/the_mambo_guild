from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum, ForeignKey, Boolean, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, date
import enum
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.progress import BossSubmission

from models import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"
    INSTRUCTOR = "instructor"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    auth_provider = Column(String, default="email", nullable=False)  # "email", "google", "apple"
    social_id = Column(String, index=True, nullable=True)  # OAuth provider's unique user ID
    is_verified = Column(Boolean, default=False, nullable=False)  # Email verification status
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    progress = relationship("UserProgress", back_populates="user")
    # Submissions relationship removed temporarily to fix login
    # Access submissions via: db.query(BossSubmission).filter(BossSubmission.user_id == user.id)
    comments = relationship("Comment", back_populates="user")


class CurrentLevelTag(str, enum.Enum):
    BEGINNER = "Beginner"
    NOVICE = "Novice"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    username = Column(String(30), unique=True, index=True, nullable=True)
    avatar_url = Column(String, nullable=True)
    current_level_tag = Column(SQLEnum(CurrentLevelTag), nullable=False)
    xp = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    streak_count = Column(Integer, default=0, nullable=False)
    last_login_date = Column(DateTime, nullable=True)
    badges = Column(String, default="[]", nullable=False)  # JSONB stored as string for now
    
    # Clave Economy (v4.0)
    current_claves = Column(Integer, default=0, nullable=False)
    reputation = Column(Integer, default=0, nullable=False)  # "Maestro Score"
    last_daily_claim = Column(Date, nullable=True)  # Track daily login bonus

    # Relationships
    user = relationship("User", back_populates="profile")


# NOTE: SubscriptionStatus and SubscriptionTier use LOWERCASE values in database
# (e.g., 'active', 'rookie'), so we use values_callable to match.
# UserRole and CurrentLevelTag use UPPERCASE names in database (e.g., 'ADMIN', 'BEGINNER').
class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    INCOMPLETE = "incomplete"
    TRIALING = "trialing"


class SubscriptionTier(str, enum.Enum):
    ROOKIE = "rookie"
    ADVANCED = "advanced"  # Renamed from SOCIAL_DANCER
    PERFORMER = "performer"


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    stripe_customer_id = Column(String, index=True, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    # Use values_callable to match lowercase values in database
    status = Column(
        SQLEnum(SubscriptionStatus, values_callable=lambda x: [e.value for e in x]),
        default=SubscriptionStatus.INCOMPLETE,
        nullable=False
    )
    tier = Column(
        SQLEnum(SubscriptionTier, values_callable=lambda x: [e.value for e in x]),
        default=SubscriptionTier.ROOKIE,
        nullable=False
    )
    current_period_end = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="subscription")

