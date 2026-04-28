from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional, List
from datetime import datetime
import re


class UserRegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    confirm_password: str

    # Optional Meta Ads attribution captured on the landing page.
    fbclid: Optional[str] = Field(default=None, max_length=255)
    utm: Optional[dict] = None
    landing_url: Optional[str] = Field(default=None, max_length=500)
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 30:
            raise ValueError("Username cannot exceed 30 characters")
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError("Username can only contain letters, numbers, and underscores")
        return v.lower()
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password meets security requirements."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if len(v) > 72:
            raise ValueError("Password cannot exceed 72 characters")
        # Check for at least one letter and one number
        if not re.search(r'[a-zA-Z]', v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r'\d', v):
            raise ValueError("Password must contain at least one number")
        return v

    @model_validator(mode='after')
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    # Server-generated event id for the CAPI conversion that fired on the
    # authoritative action (register / login). Client echoes it back via
    # fbq('track', ..., { eventID }) so Meta dedupes browser + server events.
    analytics_event_id: Optional[str] = None


class BadgeResponse(BaseModel):
    id: str
    name: str
    description: str
    tier: str
    icon_url: Optional[str] = None
    category: str
    requirement_type: str
    requirement_value: int
    is_earned: bool
    earned_at: Optional[datetime] = None
    display_order: int = 0

    class Config:
        from_attributes = True


class UserStatsResponse(BaseModel):
    reactions_given: int
    reactions_received: int
    solutions_accepted: int
    
    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    id: str
    first_name: str
    last_name: str
    username: Optional[str] = None
    xp: int
    level: int
    streak_count: int
    tier: str
    role: str
    avatar_url: Optional[str] = None
    instagram_url: Optional[str] = None
    current_level_tag: Optional[str] = None

    # Subscription lifecycle (for cancel/resume UI)
    subscription_cancel_at_period_end: bool = False
    subscription_period_end: Optional[datetime] = None
    subscription_status: Optional[str] = None   # "trialing" | "active" | ...
    # When set, the tier the subscription will drop to at period_end via a
    # Stripe SubscriptionSchedule. Currently only "advanced" — written when
    # the user schedules a Performer→Pro downgrade. Drives the
    # "Downgrading on …" banner and the "Keep Guild Master" CTA.
    subscription_scheduled_tier: Optional[str] = None
    has_used_trial: bool = False
    # True once the user has clicked the email-verification link (or
    # auto-true for OAuth signups + waitlisters who claimed their account).
    # Frontend uses this to surface a "verify your email" banner and to
    # gate the "Start Free Trial" CTA before it round-trips to Stripe.
    is_verified: bool = False

    # Gamification v4
    reputation: int = 0
    current_claves: int = 0
    badges: List[BadgeResponse] = []
    stats: Optional[UserStatsResponse] = None

    # Equipped shop cosmetics — SKUs from shop_items. Null when nothing equipped.
    equipped_border_sku: Optional[str] = None
    equipped_title_sku: Optional[str] = None

    class Config:
        from_attributes = True


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    confirm_password: str
    
    @model_validator(mode='after')
    def passwords_match(self):
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self
    
    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validate password meets security requirements."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if len(v) > 72:
            raise ValueError("Password cannot exceed 72 characters")
        if not re.search(r'[a-zA-Z]', v):
            raise ValueError("Password must contain at least one letter")
        if not re.search(r'\d', v):
            raise ValueError("Password must contain at least one number")
        return v


class BadgeReorderRequest(BaseModel):
    badge_ids: List[str]


class VerifyEmailRequest(BaseModel):
    """Body of POST /api/auth/verify-email — exchanges a signed token for a
    flip of users.is_verified to True."""
    token: str


class ResendVerificationRequest(BaseModel):
    """Body of POST /api/auth/send-verification — re-sends a verification
    link to the currently-logged-in user. No fields needed; the user is
    derived from the auth cookie."""
    pass
