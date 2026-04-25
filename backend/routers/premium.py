"""
Premium Features Router
Handles Live Calls, Coaching Submissions, and DJ Booth tracks.
All endpoints require Guild Master (PERFORMER) tier unless noted.
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple
import uuid

logger = logging.getLogger(__name__)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError

from dependencies import get_db, get_current_user
from models.user import User, Subscription, SubscriptionTier, SubscriptionStatus, UserProfile
from models.premium import (
    LiveCall, LiveCallStatus,
    WeeklyArchive,
    WeeklyMeetingConfig,
    CoachingSubmission, CoachingSubmissionStatus,
    DJBoothTrack,
    ReleaseScheduleItem,
)
from schemas.premium import (
    # Live Calls
    LiveCallCreate, LiveCallUpdate, LiveCallResponse, LiveCallAdminResponse,
    UpcomingCallStatus, PastRecordingResponse,
    # Weekly Archives
    WeeklyArchiveCreate, WeeklyArchiveUpdate, WeeklyArchiveResponse,
    # Weekly Meeting Config
    WeeklyMeetingConfigResponse, WeeklyMeetingConfigUpdate,
    # Coaching
    CoachingSubmissionCreate, CoachingSubmissionUpdate,
    CoachingSubmissionResponse, CoachingSubmissionAdminResponse, CoachingStatusResponse,
    # DJ Booth
    DJBoothTrackCreate, DJBoothTrackUpdate,
    DJBoothTrackResponse, DJBoothTrackPreview,
    # Release Schedule
    ReleaseScheduleItemCreate, ReleaseScheduleItemUpdate, ReleaseScheduleItemResponse,
)
from services.r2_service import generate_r2_signed_url
from services.email_service import send_coaching_feedback_email
from services.notification_service import create_notification

router = APIRouter(prefix="/premium", tags=["premium"])


# ============================================
# Helper Functions
# ============================================

def _as_utc(dt: Optional[datetime]) -> Optional[datetime]:
    """Attach UTC tzinfo to a naive datetime so Pydantic serializes it with
    a `+00:00` suffix. Without this, `new Date()` in the browser parses the
    ISO string as local time, shifting the schedule by the user's offset."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def is_guild_master(user: User) -> bool:
    """
    Gate for Guild Master-only perks (1-on-1 feedback, Zoom roundtable, badge,
    extra claves). Requires an ACTIVE PERFORMER subscription that has not
    passed its billing period end. The period_end check is defense-in-depth
    in case a `customer.subscription.deleted` webhook was missed.
    """
    sub = user.subscription
    if not sub:
        return False
    if sub.status != SubscriptionStatus.ACTIVE or sub.tier != SubscriptionTier.PERFORMER:
        return False
    if sub.current_period_end is not None:
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        end = sub.current_period_end
        if end.tzinfo is None:
            end = end.replace(tzinfo=timezone.utc)
        if end < now:
            return False
    return True


def require_guild_master(user: User):
    """Raise 403 if user is not Guild Master."""
    if not is_guild_master(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This feature requires Guild Master (Performer) subscription."
        )


# Minimum days between two subscription-source coaching submissions. The
# calendar-month uniqueness DB constraint already blocks two submissions in
# the same month, but a user can otherwise churn Pro→Performer→Pro across
# month boundaries (e.g. submit on day 28, re-upgrade on day 32) and harvest
# extra credits while paying only Stripe proration fees. A 25-day floor
# closes that window: legit monthly users have ~30-day gaps and pass; the
# churn pattern requires gaps under 28 days and is rejected.
COACHING_SUBSCRIPTION_COOLDOWN_DAYS = 25


def _ensure_utc(dt: Optional[datetime]) -> Optional[datetime]:
    """Coerce a naive UTC timestamp to tz-aware. Some legacy rows were stored
    naive; comparing them against datetime.now(tz=UTC) crashes on tz mismatch."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _subscription_coaching_eligibility(
    db: Session, user_id: uuid.UUID, now: datetime
) -> Tuple[bool, Optional["CoachingSubmission"], Optional[datetime]]:
    """
    Decide whether `user_id` can claim their subscription-tier coaching slot.

    Returns ``(can_submit, blocking_submission, next_credit_at)``:
    - ``can_submit`` is True when nothing blocks a new submission.
    - ``blocking_submission`` is the most recent subscription-source row that
      forces the cooldown (None when the user is eligible).
    - ``next_credit_at`` is when the cooldown lifts, or the 1st of next
      calendar month if the calendar-uniqueness rule is the binding gate.

    Combines two checks:
      1. ``COACHING_SUBSCRIPTION_COOLDOWN_DAYS`` since the last subscription
         submission — defeats Pro→Performer→Pro churn across month boundaries.
      2. The pre-existing calendar-month uniqueness — a legacy belt-and-braces
         check that is also enforced at DB level by a UniqueConstraint.
    """
    last_sub_submission = (
        db.query(CoachingSubmission)
        .filter(
            CoachingSubmission.user_id == user_id,
            CoachingSubmission.source == "subscription",
        )
        .order_by(desc(CoachingSubmission.submitted_at))
        .first()
    )

    # (1) Cooldown gate.
    if last_sub_submission is not None:
        last_at = _ensure_utc(last_sub_submission.submitted_at) or now
        cooldown_lifts_at = last_at + timedelta(days=COACHING_SUBSCRIPTION_COOLDOWN_DAYS)
        if now < cooldown_lifts_at:
            return False, last_sub_submission, cooldown_lifts_at

    # (2) Calendar-month gate (kept for parity with the DB unique constraint).
    current_month_existing = (
        db.query(CoachingSubmission)
        .filter(
            CoachingSubmission.user_id == user_id,
            CoachingSubmission.submission_month == now.month,
            CoachingSubmission.submission_year == now.year,
            CoachingSubmission.source == "subscription",
        )
        .first()
    )
    if current_month_existing is not None:
        if now.month == 12:
            next_credit = datetime(now.year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            next_credit = datetime(now.year, now.month + 1, 1, tzinfo=timezone.utc)
        return False, current_month_existing, next_credit

    return True, None, None


def require_admin(user: User):
    """Raise 403 if user is not admin."""
    if user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required."
        )


# ============================================
# Live Calls Endpoints
# ============================================

@router.get("/live/status", response_model=UpcomingCallStatus)
def get_live_call_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the status of the next live call.
    Returns state: 'no_upcoming', 'upcoming', or 'live'.
    Guild Master only.
    """
    require_guild_master(current_user)
    
    now = datetime.now(timezone.utc)
    
    # First check for live calls
    live_call = db.query(LiveCall).filter(
        LiveCall.status == LiveCallStatus.LIVE
    ).first()
    
    if live_call:
        return UpcomingCallStatus(
            state="live",
            call=_format_call_response(live_call, show_zoom=True),
            countdown_seconds=0,
            message="The Roundtable is LIVE! Join now."
        )
    
    # Check for upcoming calls
    upcoming_call = db.query(LiveCall).filter(
        LiveCall.status == LiveCallStatus.SCHEDULED,
        LiveCall.scheduled_at > now
    ).order_by(LiveCall.scheduled_at.asc()).first()
    
    if upcoming_call:
        countdown = int((upcoming_call.scheduled_at.replace(tzinfo=timezone.utc) - now).total_seconds())
        return UpcomingCallStatus(
            state="upcoming",
            call=_format_call_response(upcoming_call, show_zoom=True),
            countdown_seconds=max(0, countdown),
            message=f"Next call: {upcoming_call.title}"
        )
    
    return UpcomingCallStatus(
        state="no_upcoming",
        call=None,
        countdown_seconds=None,
        message="No upcoming calls scheduled. Check back soon!"
    )


@router.get("/live/recordings", response_model=List[PastRecordingResponse])
def get_past_recordings(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get past call recordings (The Vault).
    Guild Master only.
    """
    require_guild_master(current_user)
    
    recordings = db.query(LiveCall).filter(
        LiveCall.status == LiveCallStatus.COMPLETED,
        LiveCall.recording_mux_playback_id.isnot(None)
    ).order_by(desc(LiveCall.scheduled_at)).offset(skip).limit(limit).all()
    
    return [
        PastRecordingResponse(
            id=str(r.id),
            title=r.title,
            description=r.description,
            recorded_at=r.scheduled_at,
            duration_minutes=r.duration_minutes,
            mux_playback_id=r.recording_mux_playback_id,
            thumbnail_url=r.recording_thumbnail_url
        )
        for r in recordings
    ]


def _format_call_response(call: LiveCall, show_zoom: bool = False) -> LiveCallResponse:
    """Format a LiveCall for response."""
    return LiveCallResponse(
        id=str(call.id),
        title=call.title,
        description=call.description,
        scheduled_at=call.scheduled_at,
        duration_minutes=call.duration_minutes,
        status=call.status.value,
        zoom_link=call.zoom_link if show_zoom and call.status in [LiveCallStatus.SCHEDULED, LiveCallStatus.LIVE] else None,
        zoom_meeting_id=call.zoom_meeting_id if show_zoom else None,
        recording_mux_playback_id=call.recording_mux_playback_id if call.status == LiveCallStatus.COMPLETED else None,
        recording_thumbnail_url=call.recording_thumbnail_url if call.status == LiveCallStatus.COMPLETED else None,
        created_at=call.created_at
    )


# ============================================
# Admin Live Call Management
# ============================================

@router.post("/admin/live", response_model=LiveCallAdminResponse)
def create_live_call(
    data: LiveCallCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new live call. Admin only."""
    require_admin(current_user)
    
    call = LiveCall(
        id=uuid.uuid4(),
        title=data.title,
        description=data.description,
        scheduled_at=data.scheduled_at,
        duration_minutes=data.duration_minutes,
        zoom_link=data.zoom_link,
        zoom_meeting_id=data.zoom_meeting_id,
        status=LiveCallStatus.SCHEDULED
    )
    
    db.add(call)
    db.commit()
    db.refresh(call)
    
    return _format_admin_call_response(call)


@router.get("/admin/live", response_model=List[LiveCallAdminResponse])
def get_all_live_calls(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all live calls (for admin management). Admin only."""
    require_admin(current_user)
    
    calls = db.query(LiveCall).order_by(desc(LiveCall.scheduled_at)).all()
    return [_format_admin_call_response(c) for c in calls]


@router.put("/admin/live/{call_id}", response_model=LiveCallAdminResponse)
def update_live_call(
    call_id: str,
    data: LiveCallUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a live call. Admin only."""
    require_admin(current_user)
    
    call = db.query(LiveCall).filter(LiveCall.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    update_data = data.model_dump(exclude_unset=True)
    if 'status' in update_data:
        update_data['status'] = LiveCallStatus(update_data['status'])
    
    for key, value in update_data.items():
        setattr(call, key, value)
    
    db.commit()
    db.refresh(call)
    
    return _format_admin_call_response(call)


@router.delete("/admin/live/{call_id}")
def delete_live_call(
    call_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a live call. Admin only."""
    require_admin(current_user)
    
    call = db.query(LiveCall).filter(LiveCall.id == call_id).first()
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    db.delete(call)
    db.commit()
    
    return {"success": True, "message": "Call deleted"}


def _format_admin_call_response(call: LiveCall) -> LiveCallAdminResponse:
    """Format a LiveCall for admin response."""
    return LiveCallAdminResponse(
        id=str(call.id),
        title=call.title,
        description=call.description,
        scheduled_at=call.scheduled_at,
        duration_minutes=call.duration_minutes,
        status=call.status.value,
        zoom_link=call.zoom_link,
        zoom_meeting_id=call.zoom_meeting_id,
        recording_mux_playback_id=call.recording_mux_playback_id,
        recording_mux_asset_id=call.recording_mux_asset_id,
        recording_thumbnail_url=call.recording_thumbnail_url,
        created_at=call.created_at,
        updated_at=call.updated_at
    )


# ============================================
# Coaching Submissions Endpoints
# ============================================

@router.get("/coaching/status", response_model=CoachingStatusResponse)
def get_coaching_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if user can submit a coaching video this month.
    Guild Master only.
    """
    require_guild_master(current_user)

    now = datetime.now(timezone.utc)

    can_submit, blocking, next_credit_at = _subscription_coaching_eligibility(
        db, current_user.id, now
    )

    if not can_submit and blocking is not None:
        when = next_credit_at or now
        # %B %d works on both Windows (%#d) and POSIX (%-d) — accept the
        # leading zero ("April 05") as a tiny cosmetic compromise for portability.
        when_label = when.strftime("%B %d, %Y")
        return CoachingStatusResponse(
            can_submit=False,
            current_submission=_format_submission_response(blocking),
            next_credit_date=when,
            message=f"Credit used. Next credit available on {when_label}",
        )

    return CoachingStatusResponse(
        can_submit=True,
        current_submission=None,
        next_credit_date=None,
        message="You have 1 coaching credit available!"
    )


@router.post("/coaching/submit", response_model=CoachingSubmissionResponse)
def submit_coaching_video(
    data: CoachingSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a video for 1-on-1 coaching review.
    Limited to 1 per month. Guild Master only.
    """
    require_guild_master(current_user)

    # Defense-in-depth re-check against a freshly-loaded subscription row.
    # `current_user.subscription` is a relationship hydrated when the request
    # started; a tier change that landed in the meantime (downgrade webhook,
    # dispute, refund) would not show up there. Re-querying closes the
    # ~25-min frontend-cache window and webhook-lag races where a downgraded
    # member could still slip a submission through.
    fresh_sub = (
        db.query(Subscription)
        .filter(Subscription.user_id == current_user.id)
        .first()
    )
    if (
        fresh_sub is None
        or fresh_sub.tier != SubscriptionTier.PERFORMER
        or fresh_sub.status != SubscriptionStatus.ACTIVE
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your Guild Master access is no longer active. Refresh and try again.",
        )

    now = datetime.now(timezone.utc)
    current_month = now.month
    current_year = now.year

    can_submit, blocking, next_credit_at = _subscription_coaching_eligibility(
        db, current_user.id, now
    )
    if not can_submit:
        when_label = (
            next_credit_at.strftime("%B %d, %Y")
            if next_credit_at is not None
            else None
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"You've already used a coaching credit recently. Next credit available on {when_label}."
                if when_label
                else "You have already submitted a coaching video this month."
            ),
        )

    # Validate video duration (max 100 seconds)
    if data.video_duration_seconds and data.video_duration_seconds > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Video must be 100 seconds or less."
        )

    submission = CoachingSubmission(
        id=uuid.uuid4(),
        user_id=current_user.id,
        video_mux_playback_id=data.video_mux_playback_id,
        video_mux_asset_id=data.video_mux_asset_id,
        video_duration_seconds=data.video_duration_seconds,
        specific_question=data.specific_question,
        allow_social_share=data.allow_social_share,
        status=CoachingSubmissionStatus.PENDING,
        submission_month=current_month,
        submission_year=current_year,
        source="subscription",
    )

    db.add(submission)

    try:
        db.commit()
    except IntegrityError:
        # Race: two concurrent submits slipped past the existence check above.
        # The unique index on (user_id, submission_month, submission_year)
        # rejects the second insert — surface the same user-facing error as
        # the pre-check so the client flow is identical.
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a coaching video this month."
        )
    db.refresh(submission)

    return _format_submission_response(submission)


@router.post("/coaching/submit-ticket", response_model=CoachingSubmissionResponse)
def submit_coaching_video_with_ticket(
    data: CoachingSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Redeem an unfulfilled Golden Ticket purchase against a new coaching
    submission. Unlike the subscription slot, this is not gated by tier
    (anyone who owns a ticket can use it) and does not consume the
    monthly subscription credit.
    """
    # Local imports to avoid pulling the shop subsystem into premium's
    # top-level import graph.
    from models.shop import ShopPurchase
    from services import shop_service

    now = datetime.now(timezone.utc)
    current_month = now.month
    current_year = now.year

    # Find an unfulfilled Golden Ticket for this user. We don't scope by
    # stock_period_key — a ticket bought in a prior month is still valid
    # to redeem later; the global stock cap was on purchase, not redemption.
    purchase = (
        db.query(ShopPurchase)
        .filter(
            ShopPurchase.user_id == current_user.id,
            ShopPurchase.sku == "ticket_golden",
            ShopPurchase.status == "fulfilled",
            ShopPurchase.fulfillment_id.is_(None),
        )
        .order_by(ShopPurchase.created_at.asc())
        .first()
    )
    if not purchase:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You don't have an unused Golden Ticket. Buy one from the shop first."
        )

    if data.video_duration_seconds and data.video_duration_seconds > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Video must be 100 seconds or less."
        )

    submission = CoachingSubmission(
        id=uuid.uuid4(),
        user_id=current_user.id,
        video_mux_playback_id=data.video_mux_playback_id,
        video_mux_asset_id=data.video_mux_asset_id,
        video_duration_seconds=data.video_duration_seconds,
        specific_question=data.specific_question,
        allow_social_share=data.allow_social_share,
        status=CoachingSubmissionStatus.PENDING,
        submission_month=current_month,
        submission_year=current_year,
        source="golden_ticket",
    )
    db.add(submission)

    try:
        db.flush()
    except IntegrityError:
        # (user_id, month, year, source) unique: can't stack two tickets
        # in the same calendar month. Rare; the shop hard-caps global stock
        # at 2/month so a single user racing two redemptions in one month
        # would have to have bought twice. Still reject cleanly.
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You've already redeemed a Golden Ticket this month."
        )

    shop_service.mark_fulfilled(str(purchase.id), str(submission.id), db)
    db.commit()
    db.refresh(submission)

    return _format_submission_response(submission)


@router.get("/coaching/ticket-status")
def get_coaching_ticket_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return whether the current user holds any unfulfilled Golden Tickets.
    Used by the coaching upload page to show the "Redeem Ticket" path.
    """
    from models.shop import ShopPurchase

    count = (
        db.query(ShopPurchase)
        .filter(
            ShopPurchase.user_id == current_user.id,
            ShopPurchase.sku == "ticket_golden",
            ShopPurchase.status == "fulfilled",
            ShopPurchase.fulfillment_id.is_(None),
        )
        .count()
    )
    return {"unfulfilled_tickets": count, "can_redeem": count > 0}


@router.get("/coaching/my-submissions", response_model=List[CoachingSubmissionResponse])
def get_my_coaching_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all coaching submissions for current user. Guild Master only."""
    require_guild_master(current_user)
    
    submissions = db.query(CoachingSubmission).filter(
        CoachingSubmission.user_id == current_user.id
    ).order_by(desc(CoachingSubmission.submitted_at)).all()
    
    return [_format_submission_response(s) for s in submissions]


def _format_submission_response(sub: CoachingSubmission) -> CoachingSubmissionResponse:
    """Format a CoachingSubmission for response."""
    return CoachingSubmissionResponse(
        id=str(sub.id),
        user_id=str(sub.user_id),
        video_mux_playback_id=sub.video_mux_playback_id,
        video_duration_seconds=sub.video_duration_seconds,
        specific_question=sub.specific_question,
        allow_social_share=sub.allow_social_share,
        status=sub.status.value,
        feedback_video_url=sub.feedback_video_url,
        feedback_notes=sub.feedback_notes,
        reviewed_at=sub.reviewed_at,
        submission_month=sub.submission_month,
        submission_year=sub.submission_year,
        submitted_at=sub.submitted_at,
        source=sub.source or "subscription",
    )


# ============================================
# Admin Coaching Management
# ============================================

@router.get("/admin/coaching", response_model=List[CoachingSubmissionAdminResponse])
def get_coaching_queue(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get coaching submissions queue. Admin only."""
    require_admin(current_user)
    
    query = db.query(CoachingSubmission)
    
    if status_filter:
        query = query.filter(CoachingSubmission.status == CoachingSubmissionStatus(status_filter))
    else:
        # Default: show pending first
        query = query.filter(CoachingSubmission.status == CoachingSubmissionStatus.PENDING)
    
    submissions = query.order_by(CoachingSubmission.submitted_at.asc()).all()
    
    result = []
    for sub in submissions:
        user = db.query(User).filter(User.id == sub.user_id).first()
        profile = db.query(UserProfile).filter(UserProfile.user_id == sub.user_id).first()
        
        result.append(CoachingSubmissionAdminResponse(
            id=str(sub.id),
            user_id=str(sub.user_id),
            video_mux_playback_id=sub.video_mux_playback_id,
            video_duration_seconds=sub.video_duration_seconds,
            specific_question=sub.specific_question,
            allow_social_share=sub.allow_social_share,
            status=sub.status.value,
            feedback_video_url=sub.feedback_video_url,
            feedback_notes=sub.feedback_notes,
            reviewed_at=sub.reviewed_at,
            submission_month=sub.submission_month,
            submission_year=sub.submission_year,
            submitted_at=sub.submitted_at,
            source=sub.source or "subscription",
            user_first_name=profile.first_name if profile else "Unknown",
            user_last_name=profile.last_name if profile else "User",
            user_email=user.email if user else "",
            user_avatar_url=profile.avatar_url if profile else None
        ))
    
    return result


@router.put("/admin/coaching/{submission_id}", response_model=CoachingSubmissionResponse)
def update_coaching_submission(
    submission_id: str,
    data: CoachingSubmissionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update/complete a coaching submission. Admin only."""
    require_admin(current_user)
    
    submission = db.query(CoachingSubmission).filter(
        CoachingSubmission.id == submission_id
    ).first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    update_data = data.model_dump(exclude_unset=True)
    
    # Handle status change to completed
    if update_data.get('status') == 'completed':
        update_data['status'] = CoachingSubmissionStatus.COMPLETED
        submission.reviewed_by = current_user.id
        submission.reviewed_at = datetime.now(timezone.utc)
    elif 'status' in update_data:
        update_data['status'] = CoachingSubmissionStatus(update_data['status'])
    
    for key, value in update_data.items():
        setattr(submission, key, value)
    
    db.commit()
    db.refresh(submission)

    # Send notification email + in-app notification to student when feedback is ready
    if submission.status == CoachingSubmissionStatus.COMPLETED and submission.feedback_video_url:
        student_user = db.query(User).filter(User.id == submission.user_id).first()
        student_profile = db.query(UserProfile).filter(UserProfile.user_id == submission.user_id).first()
        if student_user:
            student_name = student_profile.first_name if student_profile else "there"
            send_coaching_feedback_email(
                student_email=student_user.email,
                student_name=student_name,
                feedback_url=submission.feedback_video_url
            )
            try:
                create_notification(
                    user_id=str(student_user.id),
                    type="coaching_feedback_ready",
                    title="Your Feedback is Ready",
                    message="Your 1-on-1 video feedback has been uploaded. Watch it now!",
                    reference_type="coaching_submission",
                    reference_id=str(submission.id),
                    db=db,
                )
                db.commit()
            except Exception:
                logger.exception("Failed to create coaching feedback notification")
                db.rollback()

    return _format_submission_response(submission)


# ============================================
# DJ Booth Endpoints
# ============================================

@router.get("/dj-booth/tracks", response_model=List[DJBoothTrackResponse])
def get_dj_booth_tracks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all DJ Booth tracks with stem URLs.
    Guild Master only - full access to stems.
    """
    require_guild_master(current_user)
    
    tracks = db.query(DJBoothTrack).filter(
        DJBoothTrack.is_active == True
    ).order_by(DJBoothTrack.order_index).all()
    
    return [
        DJBoothTrackResponse(
            id=str(t.id),
            title=t.title,
            artist=t.artist,
            album=t.album,
            year=t.year,
            duration_seconds=t.duration_seconds,
            bpm=t.bpm,
            cover_image_url=t.cover_image_url,
            full_mix_url=t.full_mix_url,
            percussion_url=t.percussion_url,
            piano_bass_url=t.piano_bass_url,
            vocals_brass_url=t.vocals_brass_url
        )
        for t in tracks
    ]


@router.get("/dj-booth/preview", response_model=List[DJBoothTrackPreview])
def get_dj_booth_preview(
    db: Session = Depends(get_db)
):
    """
    Get DJ Booth track previews (no stem URLs).
    Public endpoint - shows what's available but locked.
    """
    tracks = db.query(DJBoothTrack).filter(
        DJBoothTrack.is_active == True
    ).order_by(DJBoothTrack.order_index).all()
    
    return [
        DJBoothTrackPreview(
            id=str(t.id),
            title=t.title,
            artist=t.artist,
            album=t.album,
            year=t.year,
            duration_seconds=t.duration_seconds,
            bpm=t.bpm,
            cover_image_url=t.cover_image_url,
            is_locked=True
        )
        for t in tracks
    ]


# ============================================
# Admin DJ Booth Management
# ============================================

@router.post("/admin/dj-booth", response_model=DJBoothTrackResponse)
def create_dj_booth_track(
    data: DJBoothTrackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new DJ Booth track. Admin only."""
    require_admin(current_user)
    
    track = DJBoothTrack(
        id=uuid.uuid4(),
        title=data.title,
        artist=data.artist,
        album=data.album,
        year=data.year,
        duration_seconds=data.duration_seconds,
        bpm=data.bpm,
        cover_image_url=data.cover_image_url,
        full_mix_url=data.full_mix_url,
        percussion_url=data.percussion_url,
        piano_bass_url=data.piano_bass_url,
        vocals_brass_url=data.vocals_brass_url,
        order_index=data.order_index
    )
    
    db.add(track)
    db.commit()
    db.refresh(track)
    
    return DJBoothTrackResponse(
        id=str(track.id),
        title=track.title,
        artist=track.artist,
        album=track.album,
        year=track.year,
        duration_seconds=track.duration_seconds,
        bpm=track.bpm,
        cover_image_url=track.cover_image_url,
        full_mix_url=track.full_mix_url,
        percussion_url=track.percussion_url,
        piano_bass_url=track.piano_bass_url,
        vocals_brass_url=track.vocals_brass_url
    )


@router.put("/admin/dj-booth/{track_id}", response_model=DJBoothTrackResponse)
def update_dj_booth_track(
    track_id: str,
    data: DJBoothTrackUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a DJ Booth track. Admin only."""
    require_admin(current_user)
    
    track = db.query(DJBoothTrack).filter(DJBoothTrack.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(track, key, value)
    
    db.commit()
    db.refresh(track)
    
    return DJBoothTrackResponse(
        id=str(track.id),
        title=track.title,
        artist=track.artist,
        album=track.album,
        year=track.year,
        duration_seconds=track.duration_seconds,
        bpm=track.bpm,
        cover_image_url=track.cover_image_url,
        full_mix_url=track.full_mix_url,
        percussion_url=track.percussion_url,
        piano_bass_url=track.piano_bass_url,
        vocals_brass_url=track.vocals_brass_url
    )


@router.delete("/admin/dj-booth/{track_id}")
def delete_dj_booth_track(
    track_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a DJ Booth track. Admin only."""
    require_admin(current_user)
    
    track = db.query(DJBoothTrack).filter(DJBoothTrack.id == track_id).first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    
    db.delete(track)
    db.commit()
    
    return {"success": True, "message": "Track deleted"}


# ============================================
# Weekly Meeting Config
# ============================================

@router.get("/weekly-meeting", response_model=WeeklyMeetingConfigResponse)
def get_weekly_meeting(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the weekly meeting link and notes. Guild Master only."""
    require_guild_master(current_user)

    config = db.query(WeeklyMeetingConfig).filter(WeeklyMeetingConfig.id == 1).first()
    if not config:
        return WeeklyMeetingConfigResponse()

    return WeeklyMeetingConfigResponse(
        meeting_url=config.meeting_url,
        meeting_notes=config.meeting_notes,
        meeting_starts_at=_as_utc(config.meeting_starts_at),
        meeting_day_of_week=config.meeting_day_of_week,
        meeting_hour_utc=config.meeting_hour_utc,
        meeting_minute_utc=config.meeting_minute_utc,
        updated_at=config.updated_at
    )


@router.get("/admin/weekly-meeting", response_model=WeeklyMeetingConfigResponse)
def get_weekly_meeting_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the weekly meeting config. Admin only."""
    require_admin(current_user)

    config = db.query(WeeklyMeetingConfig).filter(WeeklyMeetingConfig.id == 1).first()
    if not config:
        return WeeklyMeetingConfigResponse()

    return WeeklyMeetingConfigResponse(
        meeting_url=config.meeting_url,
        meeting_notes=config.meeting_notes,
        meeting_starts_at=_as_utc(config.meeting_starts_at),
        meeting_day_of_week=config.meeting_day_of_week,
        meeting_hour_utc=config.meeting_hour_utc,
        meeting_minute_utc=config.meeting_minute_utc,
        updated_at=config.updated_at
    )


@router.put("/admin/weekly-meeting", response_model=WeeklyMeetingConfigResponse)
def update_weekly_meeting(
    data: WeeklyMeetingConfigUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upsert the weekly meeting config (always row id=1). Admin only."""
    require_admin(current_user)

    config = db.query(WeeklyMeetingConfig).filter(WeeklyMeetingConfig.id == 1).first()
    is_new = config is None
    if is_new:
        config = WeeklyMeetingConfig(id=1)
        db.add(config)

    # Snapshot schedule-relevant fields before mutation so we can tell whether
    # to fan out a notification (ignore notes-only edits).
    prev = {
        "meeting_url": getattr(config, "meeting_url", None),
        "meeting_starts_at": getattr(config, "meeting_starts_at", None),
        "meeting_day_of_week": getattr(config, "meeting_day_of_week", None),
        "meeting_hour_utc": getattr(config, "meeting_hour_utc", None),
        "meeting_minute_utc": getattr(config, "meeting_minute_utc", None),
    }

    update_dict = data.model_dump(exclude_unset=True)
    # Strip timezone before storing — column is naive DateTime (UTC assumed).
    if "meeting_starts_at" in update_dict and update_dict["meeting_starts_at"] is not None:
        dt = update_dict["meeting_starts_at"]
        if dt.tzinfo is not None:
            dt = dt.astimezone(timezone.utc).replace(tzinfo=None)
        update_dict["meeting_starts_at"] = dt

    for key, value in update_dict.items():
        setattr(config, key, value)

    config.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(config)

    schedule_fields = ("meeting_url", "meeting_starts_at", "meeting_day_of_week", "meeting_hour_utc", "meeting_minute_utc")
    schedule_changed = is_new or any(
        getattr(config, f) != prev[f] for f in schedule_fields
    )

    if schedule_changed:
        try:
            performers = db.query(User).join(Subscription, Subscription.user_id == User.id).filter(
                Subscription.status == SubscriptionStatus.ACTIVE,
                Subscription.tier == SubscriptionTier.PERFORMER,
            ).all()
            for performer in performers:
                create_notification(
                    user_id=str(performer.id),
                    type="weekly_meeting_scheduled",
                    title="New Roundtable Scheduled",
                    message="The next Roundtable is set. Tap to see the new time and link.",
                    reference_type="weekly_meeting",
                    reference_id=None,
                    db=db,
                )
            db.commit()
            logger.info("Weekly-meeting notification fanned out to %d performers", len(performers))
        except Exception:
            logger.exception("Failed to fan out weekly-meeting notifications")
            db.rollback()

    return WeeklyMeetingConfigResponse(
        meeting_url=config.meeting_url,
        meeting_notes=config.meeting_notes,
        meeting_starts_at=_as_utc(config.meeting_starts_at),
        meeting_day_of_week=config.meeting_day_of_week,
        meeting_hour_utc=config.meeting_hour_utc,
        meeting_minute_utc=config.meeting_minute_utc,
        updated_at=config.updated_at
    )


# ============================================
# Weekly Archives (Cloudflare R2)
# ============================================

@router.get("/archives", response_model=List[WeeklyArchiveResponse])
def get_weekly_archives(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all published weekly archives.
    Requires Guild Master subscription.
    """
    require_guild_master(current_user)
    
    archives = db.query(WeeklyArchive).filter(
        WeeklyArchive.is_published == True
    ).order_by(desc(WeeklyArchive.recorded_at)).all()
    
    return [
        WeeklyArchiveResponse(
            id=str(archive.id),
            title=archive.title,
            description=archive.description,
            recorded_at=archive.recorded_at.isoformat(),
            duration_minutes=archive.duration_minutes,
            topics=archive.topics or [],
            youtube_url=archive.youtube_url,
            thumbnail_url=archive.thumbnail_url
        )
        for archive in archives
    ]


@router.get("/archives/{archive_id}/signed-url")
def get_archive_signed_url(
    archive_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a signed URL for streaming an archive video.
    URL expires after 2 hours to prevent link sharing.
    Requires Guild Master subscription.
    """
    require_guild_master(current_user)
    
    archive = db.query(WeeklyArchive).filter(
        WeeklyArchive.id == archive_id,
        WeeklyArchive.is_published == True
    ).first()
    
    if not archive:
        raise HTTPException(status_code=404, detail="Archive not found")

    if not archive.r2_file_key:
        raise HTTPException(
            status_code=400,
            detail="This archive has no R2 file. Use the youtube_url field instead."
        )

    # Generate signed URL (2 hours expiration)
    try:
        signed_url = generate_r2_signed_url(
            file_key=archive.r2_file_key,
            expires_in_seconds=7200  # 2 hours
        )
        return {"url": signed_url, "expires_in": 7200}
    except Exception as e:
        logger.error(f"Failed to generate signed URL for archive: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate download URL. Please try again."
        )


# Admin endpoints for managing archives
@router.post("/admin/archives", response_model=WeeklyArchiveResponse)
def create_weekly_archive(
    archive_data: WeeklyArchiveCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new weekly archive. Admin only."""
    require_admin(current_user)
    
    archive = WeeklyArchive(
        title=archive_data.title,
        description=archive_data.description,
        r2_file_key=archive_data.r2_file_key,
        youtube_url=archive_data.youtube_url,
        recorded_at=archive_data.recorded_at,
        duration_minutes=archive_data.duration_minutes,
        topics=archive_data.topics or [],
        thumbnail_url=archive_data.thumbnail_url,
        is_published=archive_data.is_published if archive_data.is_published is not None else True,
        live_call_id=archive_data.live_call_id
    )

    db.add(archive)
    db.commit()
    db.refresh(archive)

    return WeeklyArchiveResponse(
        id=str(archive.id),
        title=archive.title,
        description=archive.description,
        recorded_at=archive.recorded_at.isoformat(),
        duration_minutes=archive.duration_minutes,
        topics=archive.topics or [],
        youtube_url=archive.youtube_url,
        thumbnail_url=archive.thumbnail_url,
        is_published=archive.is_published,
        r2_file_key=archive.r2_file_key
    )


@router.get("/admin/archives", response_model=List[WeeklyArchiveResponse])
def get_all_archives_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all archives (including unpublished). Admin only."""
    require_admin(current_user)
    
    archives = db.query(WeeklyArchive).order_by(desc(WeeklyArchive.recorded_at)).all()
    
    return [
        WeeklyArchiveResponse(
            id=str(archive.id),
            title=archive.title,
            description=archive.description,
            recorded_at=archive.recorded_at.isoformat(),
            duration_minutes=archive.duration_minutes,
            topics=archive.topics or [],
            youtube_url=archive.youtube_url,
            thumbnail_url=archive.thumbnail_url,
            is_published=archive.is_published,
            r2_file_key=archive.r2_file_key
        )
        for archive in archives
    ]


@router.put("/admin/archives/{archive_id}", response_model=WeeklyArchiveResponse)
def update_weekly_archive(
    archive_id: str,
    update_data: WeeklyArchiveUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an archive. Admin only."""
    require_admin(current_user)
    
    archive = db.query(WeeklyArchive).filter(WeeklyArchive.id == archive_id).first()
    if not archive:
        raise HTTPException(status_code=404, detail="Archive not found")
    
    if update_data.title is not None:
        archive.title = update_data.title
    if update_data.description is not None:
        archive.description = update_data.description
    if update_data.r2_file_key is not None:
        archive.r2_file_key = update_data.r2_file_key
    if update_data.youtube_url is not None:
        archive.youtube_url = update_data.youtube_url
    if update_data.duration_minutes is not None:
        archive.duration_minutes = update_data.duration_minutes
    if update_data.topics is not None:
        archive.topics = update_data.topics
    if update_data.thumbnail_url is not None:
        archive.thumbnail_url = update_data.thumbnail_url
    if update_data.is_published is not None:
        archive.is_published = update_data.is_published

    db.commit()
    db.refresh(archive)

    return WeeklyArchiveResponse(
        id=str(archive.id),
        title=archive.title,
        description=archive.description,
        recorded_at=archive.recorded_at.isoformat(),
        duration_minutes=archive.duration_minutes,
        topics=archive.topics or [],
        youtube_url=archive.youtube_url,
        thumbnail_url=archive.thumbnail_url,
        is_published=archive.is_published,
        r2_file_key=archive.r2_file_key
    )


@router.delete("/admin/archives/{archive_id}")
def delete_weekly_archive(
    archive_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an archive. Admin only. Does not delete the R2 file."""
    require_admin(current_user)
    
    archive = db.query(WeeklyArchive).filter(WeeklyArchive.id == archive_id).first()
    if not archive:
        raise HTTPException(status_code=404, detail="Archive not found")
    
    db.delete(archive)
    db.commit()

    return {"success": True, "message": "Archive deleted"}


# ============================================
# Release Schedule (landing page)
# ============================================

@router.get("/release-schedule", response_model=List[ReleaseScheduleItemResponse])
def list_release_schedule_public(db: Session = Depends(get_db)):
    """Public list of upcoming releases, ordered by date ascending."""
    items = (
        db.query(ReleaseScheduleItem)
        .order_by(ReleaseScheduleItem.release_date.asc())
        .all()
    )
    return items


@router.get("/admin/release-schedule", response_model=List[ReleaseScheduleItemResponse])
def list_release_schedule_admin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Admin list of all release items."""
    require_admin(current_user)
    return (
        db.query(ReleaseScheduleItem)
        .order_by(ReleaseScheduleItem.release_date.asc())
        .all()
    )


@router.post("/admin/release-schedule", response_model=ReleaseScheduleItemResponse)
def create_release_schedule_item(
    data: ReleaseScheduleItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new release item. Admin only."""
    require_admin(current_user)

    item = ReleaseScheduleItem(
        release_date=data.release_date,
        title=data.title,
        artist=data.artist,
        release_type=data.release_type,
        level=data.level,
        featured=data.featured,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/admin/release-schedule/{item_id}", response_model=ReleaseScheduleItemResponse)
def update_release_schedule_item(
    item_id: uuid.UUID,
    data: ReleaseScheduleItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update a release item. Admin only."""
    require_admin(current_user)

    item = db.query(ReleaseScheduleItem).filter(ReleaseScheduleItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Release item not found")

    update_dict = data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(item, key, value)

    item.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/admin/release-schedule/{item_id}")
def delete_release_schedule_item(
    item_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a release item. Admin only."""
    require_admin(current_user)

    item = db.query(ReleaseScheduleItem).filter(ReleaseScheduleItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Release item not found")

    db.delete(item)
    db.commit()
    return {"success": True, "message": "Release item deleted"}
