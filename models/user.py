from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum

from models import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    ADMIN = "admin"
    INSTRUCTOR = "instructor"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    subscription = relationship("Subscription", back_populates="user", uselist=False)
    progress = relationship("UserProgress", back_populates="user")
    submissions = relationship("BossSubmission", back_populates="user")
    comments = relationship("Comment", back_populates="user")


class CurrentLevelTag(str, enum.Enum):
    BEGINNER = "Beginner"
    NOVICE = "Novice"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), unique=True, nullable=False, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    current_level_tag = Column(SQLEnum(CurrentLevelTag), nullable=False)
    xp = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    streak_count = Column(Integer, default=0, nullable=False)
    last_login_date = Column(DateTime, nullable=True)
    badges = Column(String, default="[]", nullable=False)  # JSONB stored as string for now

    # Relationships
    user = relationship("User", back_populates="profile")


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    INCOMPLETE = "incomplete"
    TRIALING = "trialing"


class SubscriptionTier(str, enum.Enum):
    ROOKIE = "rookie"
    SOCIAL_DANCER = "social_dancer"
    PERFORMER = "performer"


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), unique=True, nullable=False, index=True)
    stripe_customer_id = Column(String, index=True, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    status = Column(SQLEnum(SubscriptionStatus), default=SubscriptionStatus.INCOMPLETE, nullable=False)
    tier = Column(SQLEnum(SubscriptionTier), default=SubscriptionTier.ROOKIE, nullable=False)
    current_period_end = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="subscription")

