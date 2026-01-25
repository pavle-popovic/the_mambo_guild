"""
Community Models for Mambo Inn v4.0
- Clave Economy (transactions)
- Posts (The Stage & The Lab)
- Reactions, Replies
- Badges
- Tags
"""
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, ARRAY, CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum

from models import Base


# ============================================
# Clave Economy
# ============================================

class ClaveTransaction(Base):
    """Track all clave earnings and spending."""
    __tablename__ = "clave_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)  # Positive = earned, Negative = spent
    reason = Column(String(100), nullable=False)  # 'daily_login', 'reaction', 'post_video', etc.
    reference_id = Column(UUID(as_uuid=True), nullable=True)  # Links to post_id, comment_id, etc.
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="clave_transactions")


# ============================================
# Community Posts
# ============================================

class PostType(str, enum.Enum):
    STAGE = "stage"  # Video posts (Instagram-style)
    LAB = "lab"      # Q&A posts (Stack Overflow-style)


class FeedbackType(str, enum.Enum):
    HYPE = "hype"    # Only reactions allowed
    COACH = "coach"  # Comments enabled


class ReactionType(str, enum.Enum):
    FIRE = "fire"    # 🔥
    RULER = "ruler"  # 📏 (precision)
    CLAP = "clap"    # 👏


class Post(Base):
    """Community posts for The Stage and The Lab."""
    __tablename__ = "posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    post_type = Column(String(10), nullable=False)  # 'stage' or 'lab'
    
    # Content
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=True)  # For Lab questions
    mux_asset_id = Column(String(100), nullable=True)  # For Stage videos
    mux_playback_id = Column(String(100), nullable=True)
    video_duration_seconds = Column(Integer, nullable=True)
    
    # Metadata
    tags = Column(ARRAY(String(50)), default=list)
    is_wip = Column(Boolean, default=False)  # "Work in Progress" banner
    feedback_type = Column(String(10), default="coach")  # 'hype' or 'coach'
    
    # Lab-specific
    is_solved = Column(Boolean, default=False)
    accepted_answer_id = Column(UUID(as_uuid=True), ForeignKey("post_replies.id", ondelete="SET NULL"), nullable=True)
    
    # Denormalized counts for performance
    reaction_count = Column(Integer, default=0)
    reply_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="posts")
    replies = relationship("PostReply", back_populates="post", foreign_keys="PostReply.post_id", cascade="all, delete-orphan")
    reactions = relationship("PostReaction", back_populates="post", cascade="all, delete-orphan")
    accepted_answer = relationship("PostReply", foreign_keys=[accepted_answer_id], post_update=True)

    # Constraints
    __table_args__ = (
        CheckConstraint("post_type IN ('stage', 'lab')", name="check_post_type"),
        CheckConstraint("feedback_type IN ('hype', 'coach')", name="check_feedback_type"),
    )


class PostReply(Base):
    """Replies/comments on posts."""
    __tablename__ = "post_replies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    content = Column(Text, nullable=False)
    mux_asset_id = Column(String(100), nullable=True)  # Optional video reply
    mux_playback_id = Column(String(100), nullable=True)
    
    is_accepted_answer = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    post = relationship("Post", back_populates="replies", foreign_keys=[post_id])
    user = relationship("User", backref="post_replies")


class PostReaction(Base):
    """Reactions on posts (Fire, Ruler, Clap)."""
    __tablename__ = "post_reactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reaction_type = Column(String(20), nullable=False)  # 'fire', 'ruler', 'clap'
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    post = relationship("Post", back_populates="reactions")
    user = relationship("User", backref="post_reactions")

    # Constraints
    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="unique_post_user_reaction"),
        CheckConstraint("reaction_type IN ('fire', 'ruler', 'clap')", name="check_reaction_type"),
    )


# ============================================
# Badge System & Stats
# ============================================

class BadgeCategory(str, enum.Enum):
    COURSE = "course"
    COMMUNITY = "community"
    PERFORMANCE = "performance"


class BadgeTier(str, enum.Enum):
    SILVER = "silver"
    GOLD = "gold"
    DIAMOND = "diamond"


class BadgeDefinition(Base):
    """Badge definitions with tiering."""
    __tablename__ = "badge_definitions"

    id = Column(String(50), primary_key=True)  # e.g., 'metronome_silver', 'el_maestro_gold'
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    
    # Visuals
    tier = Column(String(20), nullable=False, default="silver")  # 'silver', 'gold', 'diamond'
    icon_url = Column(String(255), nullable=True)
    
    # Logic
    category = Column(String(20), nullable=False)  # 'course', 'community', 'performance'
    requirement_type = Column(String(50), nullable=False)  # 'drills_7_days', 'solutions_count', etc.
    threshold = Column(Integer, nullable=False)  # The value needed to earn (10, 50, 100...)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user_badges = relationship("UserBadge", back_populates="badge")


class UserBadge(Base):
    """Track which badges each user has earned."""
    __tablename__ = "user_badges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    badge_id = Column(String(50), ForeignKey("badge_definitions.id"), nullable=False)
    
    earned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    display_order = Column(Integer, default=0)  # For custom profile sorting

    # Relationships
    user = relationship("User", backref="badges")
    badge = relationship("BadgeDefinition", back_populates="user_badges")

    # Constraints
    __table_args__ = (
        UniqueConstraint("user_id", "badge_id", name="unique_user_badge"),
    )


class UserStats(Base):
    """Aggregated stats for gamification triggers."""
    __tablename__ = "user_stats"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    
    reactions_given_count = Column(Integer, default=0)
    reactions_received_count = Column(Integer, default=0)
    solutions_accepted_count = Column(Integer, default=0)
    
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="stats")


# ============================================
# Community Tags
# ============================================

class CommunityTag(Base):
    """Predefined taxonomy for post categorization."""
    __tablename__ = "community_tags"

    slug = Column(String(50), primary_key=True)  # e.g., 'on2', 'spinning'
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=True)  # 'technique', 'general', etc.
    usage_count = Column(Integer, default=0)
