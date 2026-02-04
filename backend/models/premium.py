"""
Premium Feature Models for Guild Master (PERFORMER) tier
- Live Calls (The Roundtable)
- Weekly Archives (R2 Video Storage - NO Mux)
- Coaching Submissions (1-on-1 Video Analysis)
- DJ Booth Tracks (Mambo Mixer)
"""
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum

from models import Base


# ============================================
# Live Calls (The Roundtable)
# ============================================

class LiveCallStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class LiveCall(Base):
    """
    Weekly live Zoom calls for Guild Master members.
    Admin schedules calls, users see upcoming/live status.
    """
    __tablename__ = "live_calls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False, default="Weekly Roundtable")
    description = Column(Text, nullable=True)
    
    # Scheduling
    scheduled_at = Column(DateTime, nullable=False)  # When the call starts
    duration_minutes = Column(Integer, default=60, nullable=False)
    
    # Zoom integration - just store the link
    zoom_link = Column(String(500), nullable=False)
    zoom_meeting_id = Column(String(100), nullable=True)  # Optional: for display
    
    # Status
    status = Column(
        SQLEnum(LiveCallStatus, values_callable=lambda x: [e.value for e in x]),
        default=LiveCallStatus.SCHEDULED,
        nullable=False
    )
    
    # Recording (after call is completed)
    recording_mux_playback_id = Column(String(100), nullable=True)
    recording_mux_asset_id = Column(String(100), nullable=True)
    recording_thumbnail_url = Column(String(500), nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<LiveCall {self.title} at {self.scheduled_at}>"


# ============================================
# Weekly Archives (Cloudflare R2 Storage)
# ============================================

class WeeklyArchive(Base):
    """
    Archived recordings of weekly Roundtable sessions.
    Stored in Cloudflare R2 (S3-compatible) for zero egress fees.
    Uses HTML5 video player with signed URLs for security.
    """
    __tablename__ = "weekly_archives"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # R2 Storage
    r2_file_key = Column(String(500), nullable=False)  # e.g., "archives/week-42-musicality.mp4"
    
    # Recording metadata
    recorded_at = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    
    # Topics/Tags for filtering
    topics = Column(ARRAY(String), default=[], nullable=False)  # ['timing', 'styling', 'Q&A']
    
    # Thumbnail (optional - can use static image)
    thumbnail_url = Column(String(500), nullable=True)
    
    # Publishing control
    is_published = Column(Boolean, default=True, nullable=False)
    
    # Optional link to original LiveCall (if migrated from Mux)
    live_call_id = Column(UUID(as_uuid=True), ForeignKey("live_calls.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    live_call = relationship("LiveCall", backref="archive")
    
    def __repr__(self):
        return f"<WeeklyArchive {self.title} from {self.recorded_at}>"


# ============================================
# Coaching Submissions (1-on-1 Video Analysis)
# ============================================

class CoachingSubmissionStatus(str, enum.Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    COMPLETED = "completed"
    EXPIRED = "expired"  # If not reviewed within cycle


class CoachingSubmission(Base):
    """
    Monthly 1-on-1 video analysis submissions for Guild Master members.
    One submission per user per billing cycle/month.
    """
    __tablename__ = "coaching_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # User's submission
    video_mux_playback_id = Column(String(100), nullable=False)
    video_mux_asset_id = Column(String(100), nullable=False)
    video_duration_seconds = Column(Integer, nullable=True)
    specific_question = Column(String(140), nullable=True)  # "What should I look at?"
    
    # Marketing consent
    allow_social_share = Column(Boolean, default=False, nullable=False)
    
    # Status tracking
    status = Column(
        SQLEnum(CoachingSubmissionStatus, values_callable=lambda x: [e.value for e in x]),
        default=CoachingSubmissionStatus.PENDING,
        nullable=False
    )
    
    # Admin feedback
    feedback_video_url = Column(String(500), nullable=True)  # Loom/external link
    feedback_notes = Column(Text, nullable=True)  # Optional text notes
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    
    # Billing cycle tracking (for "1 per month" limit)
    submission_month = Column(Integer, nullable=False)  # 1-12
    submission_year = Column(Integer, nullable=False)  # 2024, 2025, etc.
    
    # Timestamps
    submitted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="coaching_submissions")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    
    def __repr__(self):
        return f"<CoachingSubmission {self.id} by user {self.user_id}>"


# ============================================
# DJ Booth Tracks (Mambo Mixer)
# ============================================

class DJBoothTrack(Base):
    """
    Salsa tracks with separated stems for the DJ Booth feature.
    Allows users to isolate instruments (percussion, piano, vocals).
    """
    __tablename__ = "dj_booth_tracks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    artist = Column(String(200), nullable=False)
    
    # Album/metadata
    album = Column(String(200), nullable=True)
    year = Column(Integer, nullable=True)
    duration_seconds = Column(Integer, nullable=False)
    bpm = Column(Integer, nullable=True)  # Beats per minute
    
    # Cover art
    cover_image_url = Column(String(500), nullable=True)
    
    # Stem URLs (stored in cloud storage - S3/Cloudinary)
    full_mix_url = Column(String(500), nullable=False)
    percussion_url = Column(String(500), nullable=False)  # Congas/Timbales/Bongo
    piano_bass_url = Column(String(500), nullable=False)  # Melodic rhythm
    vocals_brass_url = Column(String(500), nullable=False)  # Melody (vocals + brass)
    
    # Ordering/display
    order_index = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f"<DJBoothTrack {self.title} by {self.artist}>"
