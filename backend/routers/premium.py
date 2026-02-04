"""
Premium Features Router
Handles Live Calls, Coaching Submissions, and DJ Booth tracks.
All endpoints require Guild Master (PERFORMER) tier unless noted.
"""
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from dependencies import get_db, get_current_user
from models.user import User, Subscription, SubscriptionTier, SubscriptionStatus, UserProfile
from models.premium import (
    LiveCall, LiveCallStatus,
    WeeklyArchive,
    CoachingSubmission, CoachingSubmissionStatus,
    DJBoothTrack
)
from schemas.premium import (
    # Live Calls
    LiveCallCreate, LiveCallUpdate, LiveCallResponse, LiveCallAdminResponse,
    UpcomingCallStatus, PastRecordingResponse,
    # Weekly Archives
    WeeklyArchiveCreate, WeeklyArchiveUpdate, WeeklyArchiveResponse,
    # Coaching
    CoachingSubmissionCreate, CoachingSubmissionUpdate,
    CoachingSubmissionResponse, CoachingSubmissionAdminResponse, CoachingStatusResponse,
    # DJ Booth
    DJBoothTrackCreate, DJBoothTrackUpdate,
    DJBoothTrackResponse, DJBoothTrackPreview
)
from services.r2_service import generate_r2_signed_url

router = APIRouter(prefix="/premium", tags=["premium"])


# ============================================
# Helper Functions
# ============================================

def is_guild_master(user: User) -> bool:
    """Check if user has Guild Master (PERFORMER) tier."""
    if not user.subscription:
        return False
    return (
        user.subscription.status == SubscriptionStatus.ACTIVE and
        user.subscription.tier == SubscriptionTier.PERFORMER
    )


def require_guild_master(user: User):
    """Raise 403 if user is not Guild Master."""
    if not is_guild_master(user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This feature requires Guild Master (Performer) subscription."
        )


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
async def get_live_call_status(
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
async def get_past_recordings(
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
async def create_live_call(
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
async def get_all_live_calls(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all live calls (for admin management). Admin only."""
    require_admin(current_user)
    
    calls = db.query(LiveCall).order_by(desc(LiveCall.scheduled_at)).all()
    return [_format_admin_call_response(c) for c in calls]


@router.put("/admin/live/{call_id}", response_model=LiveCallAdminResponse)
async def update_live_call(
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
async def delete_live_call(
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
async def get_coaching_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if user can submit a coaching video this month.
    Guild Master only.
    """
    require_guild_master(current_user)
    
    now = datetime.now(timezone.utc)
    current_month = now.month
    current_year = now.year
    
    # Check for existing submission this month
    existing = db.query(CoachingSubmission).filter(
        CoachingSubmission.user_id == current_user.id,
        CoachingSubmission.submission_month == current_month,
        CoachingSubmission.submission_year == current_year
    ).first()
    
    if existing:
        # Calculate next month's first day
        if current_month == 12:
            next_credit = datetime(current_year + 1, 1, 1, tzinfo=timezone.utc)
        else:
            next_credit = datetime(current_year, current_month + 1, 1, tzinfo=timezone.utc)
        
        return CoachingStatusResponse(
            can_submit=False,
            current_submission=_format_submission_response(existing),
            next_credit_date=next_credit,
            message=f"Credit used. Resets on {next_credit.strftime('%B 1, %Y')}"
        )
    
    return CoachingStatusResponse(
        can_submit=True,
        current_submission=None,
        next_credit_date=None,
        message="You have 1 coaching credit available this month!"
    )


@router.post("/coaching/submit", response_model=CoachingSubmissionResponse)
async def submit_coaching_video(
    data: CoachingSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a video for 1-on-1 coaching review.
    Limited to 1 per month. Guild Master only.
    """
    require_guild_master(current_user)
    
    now = datetime.now(timezone.utc)
    current_month = now.month
    current_year = now.year
    
    # Check for existing submission
    existing = db.query(CoachingSubmission).filter(
        CoachingSubmission.user_id == current_user.id,
        CoachingSubmission.submission_month == current_month,
        CoachingSubmission.submission_year == current_year
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a coaching video this month."
        )
    
    # Validate video duration (max 60 seconds)
    if data.video_duration_seconds and data.video_duration_seconds > 60:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Video must be 60 seconds or less."
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
        submission_year=current_year
    )
    
    db.add(submission)
    
    # Award XP for social share consent
    if data.allow_social_share and current_user.profile:
        current_user.profile.xp += 50
    
    db.commit()
    db.refresh(submission)
    
    return _format_submission_response(submission)


@router.get("/coaching/my-submissions", response_model=List[CoachingSubmissionResponse])
async def get_my_coaching_submissions(
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
        submitted_at=sub.submitted_at
    )


# ============================================
# Admin Coaching Management
# ============================================

@router.get("/admin/coaching", response_model=List[CoachingSubmissionAdminResponse])
async def get_coaching_queue(
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
            user_first_name=profile.first_name if profile else "Unknown",
            user_last_name=profile.last_name if profile else "User",
            user_email=user.email if user else "",
            user_avatar_url=profile.avatar_url if profile else None
        ))
    
    return result


@router.put("/admin/coaching/{submission_id}", response_model=CoachingSubmissionResponse)
async def update_coaching_submission(
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
    
    # TODO: Send notification to user that feedback is ready
    
    return _format_submission_response(submission)


# ============================================
# DJ Booth Endpoints
# ============================================

@router.get("/dj-booth/tracks", response_model=List[DJBoothTrackResponse])
async def get_dj_booth_tracks(
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
async def get_dj_booth_preview(
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
async def create_dj_booth_track(
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
async def update_dj_booth_track(
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
async def delete_dj_booth_track(
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
# Weekly Archives (Cloudflare R2)
# ============================================

@router.get("/archives", response_model=List[WeeklyArchiveResponse])
async def get_weekly_archives(
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
            thumbnail_url=archive.thumbnail_url
        )
        for archive in archives
    ]


@router.get("/archives/{archive_id}/signed-url")
async def get_archive_signed_url(
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
    
    # Generate signed URL (2 hours expiration)
    try:
        signed_url = generate_r2_signed_url(
            file_key=archive.r2_file_key,
            expires_in_seconds=7200  # 2 hours
        )
        return {"url": signed_url, "expires_in": 7200}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate signed URL: {str(e)}"
        )


# Admin endpoints for managing archives
@router.post("/admin/archives", response_model=WeeklyArchiveResponse)
async def create_weekly_archive(
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
        thumbnail_url=archive.thumbnail_url
    )


@router.get("/admin/archives", response_model=List[WeeklyArchiveResponse])
async def get_all_archives_admin(
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
            thumbnail_url=archive.thumbnail_url,
            is_published=archive.is_published,
            r2_file_key=archive.r2_file_key
        )
        for archive in archives
    ]


@router.put("/admin/archives/{archive_id}", response_model=WeeklyArchiveResponse)
async def update_weekly_archive(
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
        thumbnail_url=archive.thumbnail_url
    )


@router.delete("/admin/archives/{archive_id}")
async def delete_weekly_archive(
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
