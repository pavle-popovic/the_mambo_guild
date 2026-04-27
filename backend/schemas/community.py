"""
Pydantic schemas for Community features (Mambo Guild v4.0)
- Clave Economy
- Posts (The Stage & The Lab)
- Badges
- Tags
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Literal
from datetime import datetime


# ============================================
# Clave Economy Schemas
# ============================================

class ClaveTransactionResponse(BaseModel):
    """Single clave transaction in wallet history."""
    id: str
    amount: int
    reason: str
    reference_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WalletResponse(BaseModel):
    """User's wallet state."""
    current_claves: int
    is_pro: bool
    recent_transactions: List[ClaveTransactionResponse] = []
    
    # Slot limits based on tier
    video_slots_used: int = 0
    video_slots_limit: int = 5  # 5 for base, 20 for pro


class DailyClaimResponse(BaseModel):
    """Response after claiming daily claves."""
    success: bool
    amount: int
    new_balance: int
    streak_bonus: Optional[int] = None  # If streak milestone hit
    message: str


class ClaveBalanceCheck(BaseModel):
    """Quick balance check response."""
    can_afford: bool
    current_balance: int
    required_amount: int
    shortfall: int = 0


# ============================================
# Post Schemas
# ============================================

class PostCreateRequest(BaseModel):
    """Request to create a new post."""
    post_type: Literal['stage', 'lab']
    title: str = Field(..., min_length=3, max_length=200)
    body: Optional[str] = None  # Required for 'lab'
    tags: List[str] = Field(..., min_items=1, max_items=5)
    is_wip: bool = False  # "Work in Progress" mode
    feedback_type: Literal['hype', 'coach'] = 'coach'
    video_type: Optional[Literal['motw', 'original', 'guild']] = None  # Required when post_type='stage'

    # Video info (for stage posts) - set after Mux upload
    mux_asset_id: Optional[str] = None
    mux_playback_id: Optional[str] = None
    video_duration_seconds: Optional[int] = None

    @validator('body')
    def body_required_for_lab(cls, v, values):
        if values.get('post_type') == 'lab' and not v:
            raise ValueError('Body is required for Lab questions')
        return v

    @validator('video_type')
    def video_type_required_for_stage(cls, v, values):
        if values.get('post_type') == 'stage' and not v:
            raise ValueError('video_type is required for Stage posts (motw, original, or guild)')
        return v


class PostUpdateRequest(BaseModel):
    """Request to update an existing post."""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    body: Optional[str] = None
    tags: Optional[List[str]] = Field(None, min_items=1, max_items=5)
    is_wip: Optional[bool] = None
    feedback_type: Optional[Literal['hype', 'coach']] = None

    @validator('body')
    def body_required_for_lab(cls, v, values):
        # Note: post_type is not in update request, so we can't validate here
        # Validation will happen in the service layer
        return v


class PostUserInfo(BaseModel):
    """Embedded user info in post response."""
    id: str
    username: Optional[str] = None
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    is_pro: bool = False
    is_guild_master: bool = False  # PERFORMER tier = Guild Master status
    level: int = 1


class PostResponse(BaseModel):
    """Full post response for feed."""
    id: str
    user: PostUserInfo
    post_type: str
    title: str
    body: Optional[str] = None
    mux_playback_id: Optional[str] = None
    video_duration_seconds: Optional[int] = None
    tags: List[str] = []
    is_wip: bool = False
    feedback_type: str = 'coach'
    video_type: Optional[str] = None  # 'motw' | 'original' | 'guild' for Stage posts
    is_solved: bool = False
    reaction_count: int = 0
    reply_count: int = 0
    user_reaction: Optional[str] = None  # 'like' if the current user has liked, else None
    is_saved: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PostDetailResponse(PostResponse):
    """Extended post response with replies."""
    replies: List['ReplyResponse'] = []


class ReactionRequest(BaseModel):
    """Request to like/unlike a post. Body is intentionally empty — toggle semantics."""
    pass


class ReplyCreateRequest(BaseModel):
    """Request to create a reply/comment."""
    content: str = Field(..., min_length=1, max_length=2000)
    mux_asset_id: Optional[str] = None  # Optional video reply
    mux_playback_id: Optional[str] = None
    # When set, this reply is a child of the referenced reply (threaded
    # reply). Server validates same-post + depth limit.
    parent_reply_id: Optional[str] = None


class ReplyUpdateRequest(BaseModel):
    """Request to update a reply/comment."""
    content: str = Field(..., min_length=1, max_length=2000)


class ReplyResponse(BaseModel):
    """Reply/comment response."""
    id: str
    user: PostUserInfo
    content: str
    mux_playback_id: Optional[str] = None
    is_accepted_answer: bool = False
    moderation_status: str = "active"
    created_at: datetime

    class Config:
        from_attributes = True


class UploadCheckResponse(BaseModel):
    """Pre-upload eligibility check."""
    allowed: bool
    current_slots: int
    max_slots: int
    message: str


class FeedQueryParams(BaseModel):
    """Query parameters for feed."""
    post_type: Optional[Literal['stage', 'lab']] = None
    tag: Optional[str] = None
    skip: int = 0
    limit: int = 20


# ============================================
# Badge Schemas
# ============================================

class BadgeResponse(BaseModel):
    """Badge definition with user's earned status."""
    id: str
    name: str
    description: str
    icon_url: Optional[str] = None
    category: str
    requirement_type: str
    requirement_value: int
    is_earned: bool = False
    earned_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserBadgeAward(BaseModel):
    """Response when a badge is awarded."""
    badge_id: str
    badge_name: str
    message: str


# ============================================
# Tag Schemas
# ============================================

class TagResponse(BaseModel):
    """Community tag."""
    slug: str
    name: str
    category: Optional[str] = None
    usage_count: int = 0

    class Config:
        from_attributes = True


# ============================================
# Public Profile Schemas (Extended)
# ============================================

class PublicProfileStats(BaseModel):
    """Stats shown on public profile and used for badge progress calculation."""
    # Reactions given/received
    reactions_given: int = 0
    reactions_received: int = 0        # total likes across all your posts — drives Crowd Favorite
    likes_received: int = 0            # alias of reactions_received for clarity
    # Legacy per-type counts (kept so old trophies still display accurately)
    fires_received: int = 0
    claps_received: int = 0
    metronomes_received: int = 0

    # Solutions & Questions
    solutions_accepted: int = 0
    questions_posted: int = 0

    # Content Creation
    videos_posted: int = 0
    motw_videos: int = 0       # Move of the Week submissions
    original_videos: int = 0   # Own choreo / freestyle
    guild_videos: int = 0      # Guild class choreos
    comments_posted: int = 0

    # Streaks
    current_streak: int = 0



class PublicProfileResponse(BaseModel):
    """Public user profile with badges and stats."""
    id: str
    first_name: str
    last_name: str
    avatar_url: Optional[str] = None
    level: int
    level_title: str  # e.g., "Level 12 Mambo Soldier"
    is_pro: bool = False
    is_guild_master: bool = False  # PERFORMER tier = Guild Master status
    instagram_url: Optional[str] = None
    stats: PublicProfileStats
    badges: List[BadgeResponse] = []


# Forward reference update for PostDetailResponse
PostDetailResponse.model_rebuild()
