"""
Pydantic schemas for Premium Features (Guild Master tier)
- Live Calls (The Roundtable)
- Coaching Submissions (1-on-1 Video Analysis)
- DJ Booth Tracks (Mambo Mixer)
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


# ============================================
# Live Calls (The Roundtable)
# ============================================

class LiveCallCreate(BaseModel):
    """Admin request to create a new live call."""
    title: str = Field(default="Weekly Roundtable", max_length=200)
    description: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: int = Field(default=60, ge=15, le=180)
    zoom_link: str = Field(..., max_length=500)
    zoom_meeting_id: Optional[str] = None


class LiveCallUpdate(BaseModel):
    """Admin request to update a live call."""
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(None, ge=15, le=180)
    zoom_link: Optional[str] = Field(None, max_length=500)
    zoom_meeting_id: Optional[str] = None
    status: Optional[Literal['scheduled', 'live', 'completed', 'cancelled']] = None
    # Recording (after call)
    recording_mux_playback_id: Optional[str] = None
    recording_mux_asset_id: Optional[str] = None
    recording_thumbnail_url: Optional[str] = None


class LiveCallResponse(BaseModel):
    """Live call response for users."""
    id: str
    title: str
    description: Optional[str] = None
    scheduled_at: datetime
    duration_minutes: int
    status: str
    # Only show zoom_link if status is 'scheduled' or 'live'
    zoom_link: Optional[str] = None
    zoom_meeting_id: Optional[str] = None
    # Recording (for completed calls)
    recording_mux_playback_id: Optional[str] = None
    recording_thumbnail_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class LiveCallAdminResponse(LiveCallResponse):
    """Extended response for admin with all details."""
    recording_mux_asset_id: Optional[str] = None
    updated_at: datetime


class UpcomingCallStatus(BaseModel):
    """Status response for the next live call."""
    state: Literal['no_upcoming', 'upcoming', 'live']
    call: Optional[LiveCallResponse] = None
    countdown_seconds: Optional[int] = None  # Seconds until call starts
    message: str


# ============================================
# Past Recordings (The Vault)
# ============================================

class PastRecordingResponse(BaseModel):
    """Past call recording for The Vault."""
    id: str
    title: str
    description: Optional[str] = None
    recorded_at: datetime  # When the call happened
    duration_minutes: int
    mux_playback_id: str
    thumbnail_url: Optional[str] = None

    class Config:
        from_attributes = True


# ============================================
# Coaching Submissions (1-on-1 Video Analysis)
# ============================================

class CoachingSubmissionCreate(BaseModel):
    """User request to submit a video for coaching."""
    video_mux_playback_id: str
    video_mux_asset_id: str
    video_duration_seconds: Optional[int] = None
    specific_question: Optional[str] = Field(None, max_length=140)
    allow_social_share: bool = False


class CoachingSubmissionUpdate(BaseModel):
    """Admin request to update/complete a submission."""
    status: Optional[Literal['pending', 'in_review', 'completed', 'expired']] = None
    feedback_video_url: Optional[str] = Field(None, max_length=500)
    feedback_notes: Optional[str] = None


class CoachingSubmissionResponse(BaseModel):
    """Coaching submission response."""
    id: str
    user_id: str
    video_mux_playback_id: str
    video_duration_seconds: Optional[int] = None
    specific_question: Optional[str] = None
    allow_social_share: bool
    status: str
    feedback_video_url: Optional[str] = None
    feedback_notes: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    submission_month: int
    submission_year: int
    submitted_at: datetime

    class Config:
        from_attributes = True


class CoachingSubmissionAdminResponse(CoachingSubmissionResponse):
    """Extended response for admin queue."""
    user_first_name: str
    user_last_name: str
    user_email: str
    user_avatar_url: Optional[str] = None


class CoachingStatusResponse(BaseModel):
    """Status check for user's coaching submission eligibility."""
    can_submit: bool
    current_submission: Optional[CoachingSubmissionResponse] = None
    next_credit_date: Optional[datetime] = None  # When credit resets
    message: str


# ============================================
# DJ Booth Tracks (Mambo Mixer)
# ============================================

class DJBoothTrackCreate(BaseModel):
    """Admin request to create a new DJ Booth track."""
    title: str = Field(..., max_length=200)
    artist: str = Field(..., max_length=200)
    album: Optional[str] = Field(None, max_length=200)
    year: Optional[int] = None
    duration_seconds: int
    bpm: Optional[int] = None
    cover_image_url: Optional[str] = None
    full_mix_url: str
    percussion_url: str
    piano_bass_url: str
    vocals_brass_url: str
    order_index: int = 0


class DJBoothTrackUpdate(BaseModel):
    """Admin request to update a track."""
    title: Optional[str] = Field(None, max_length=200)
    artist: Optional[str] = Field(None, max_length=200)
    album: Optional[str] = Field(None, max_length=200)
    year: Optional[int] = None
    duration_seconds: Optional[int] = None
    bpm: Optional[int] = None
    cover_image_url: Optional[str] = None
    full_mix_url: Optional[str] = None
    percussion_url: Optional[str] = None
    piano_bass_url: Optional[str] = None
    vocals_brass_url: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None


class DJBoothTrackResponse(BaseModel):
    """Track response for users (includes stem URLs for playback)."""
    id: str
    title: str
    artist: str
    album: Optional[str] = None
    year: Optional[int] = None
    duration_seconds: int
    bpm: Optional[int] = None
    cover_image_url: Optional[str] = None
    # Stem URLs for playback
    full_mix_url: str
    percussion_url: str
    piano_bass_url: str
    vocals_brass_url: str

    class Config:
        from_attributes = True


class DJBoothTrackPreview(BaseModel):
    """Track preview for non-premium users (no stem URLs)."""
    id: str
    title: str
    artist: str
    album: Optional[str] = None
    year: Optional[int] = None
    duration_seconds: int
    bpm: Optional[int] = None
    cover_image_url: Optional[str] = None
    is_locked: bool = True  # Always locked for non-premium

    class Config:
        from_attributes = True


# ============================================
# Weekly Archives (Cloudflare R2)
# ============================================

class WeeklyArchiveCreate(BaseModel):
    """Admin request to create a new weekly archive."""
    title: str = Field(..., max_length=200)
    description: Optional[str] = None
    r2_file_key: str = Field(..., max_length=500)  # e.g., "archives/week-42.mp4"
    recorded_at: datetime
    duration_minutes: Optional[int] = Field(None, ge=1, le=180)
    topics: Optional[List[str]] = None  # ['timing', 'styling', 'Q&A']
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = True
    live_call_id: Optional[str] = None  # Link to original LiveCall if applicable


class WeeklyArchiveUpdate(BaseModel):
    """Admin request to update an archive."""
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    r2_file_key: Optional[str] = Field(None, max_length=500)
    duration_minutes: Optional[int] = Field(None, ge=1, le=180)
    topics: Optional[List[str]] = None
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = None


class WeeklyArchiveResponse(BaseModel):
    """Archive response for users."""
    id: str
    title: str
    description: Optional[str] = None
    recorded_at: str  # ISO format
    duration_minutes: Optional[int] = None
    topics: List[str] = []
    thumbnail_url: Optional[str] = None
    # Admin-only fields (optional)
    is_published: Optional[bool] = None
    r2_file_key: Optional[str] = None

    class Config:
        from_attributes = True
