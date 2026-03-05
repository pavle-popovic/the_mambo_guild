from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional, Any, Dict
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from models import get_db
from models.user import User, UserProfile, Subscription, SubscriptionStatus, SubscriptionTier
from models.progress import BossSubmission, SubmissionStatus, UserProgress
from models.course import World, Level, Lesson
from schemas.submissions import SubmissionResponse, GradeSubmissionRequest
from dependencies import get_admin_user
import uuid

router = APIRouter()

# ---------------------------------------------------------------------------
# Tier prices used for estimated MRR (update if pricing changes)
# ---------------------------------------------------------------------------
TIER_PRICES: Dict[str, float] = {
    "rookie": 19.0,
    "advanced": 39.0,
    "performer": 79.0,
}


@router.get("/submissions", response_model=List[SubmissionResponse])
async def get_pending_submissions(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all pending boss battle submissions."""
    submissions = db.query(BossSubmission).filter(
        BossSubmission.status == SubmissionStatus.PENDING
    ).order_by(BossSubmission.submitted_at.asc()).all()
    
    return [
        SubmissionResponse(
            id=str(s.id),
            status=s.status,
            feedback=s.instructor_feedback,
            submitted_at=s.submitted_at
        )
        for s in submissions
    ]


@router.post("/submissions/{submission_id}/grade")
async def grade_submission(
    submission_id: str,
    grade_data: GradeSubmissionRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Grade a boss battle submission."""
    submission = db.query(BossSubmission).filter(BossSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Update submission
    if grade_data.status == "approved":
        submission.status = SubmissionStatus.APPROVED
        # Award XP for boss battle
        from services.gamification_service import award_xp
        award_xp(str(submission.user_id), 500, db)  # Boss battle XP
        
        # Unlock next world logic would go here
    elif grade_data.status == "rejected":
        submission.status = SubmissionStatus.REJECTED
    else:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    submission.instructor_feedback = grade_data.feedback_text
    submission.instructor_video_url = grade_data.feedback_video_url
    submission.reviewed_at = datetime.now(timezone.utc)
    submission.reviewed_by = admin_user.id
    
    db.commit()
    
    return {"message": "Submission graded successfully"}


@router.get("/stats")
async def get_admin_stats(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get admin dashboard statistics."""
    from models.user import UserProfile
    
    total_users = db.query(User).count()
    total_submissions = db.query(BossSubmission).count()
    pending_submissions = db.query(BossSubmission).filter(
        BossSubmission.status == SubmissionStatus.PENDING
    ).count()
    
    return {
        "total_users": total_users,
        "total_submissions": total_submissions,
        "pending_submissions": pending_submissions
    }


class StudentResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    xp: int
    level: int
    streak_count: int
    created_at: datetime
    role: str
    
    class Config:
        from_attributes = True


def escape_like_pattern(pattern: str) -> str:
    """Escape special characters in LIKE patterns to prevent wildcard abuse."""
    # Escape backslash first, then other special characters
    pattern = pattern.replace("\\", "\\\\")
    pattern = pattern.replace("%", "\\%")
    pattern = pattern.replace("_", "\\_")
    return pattern


@router.get("/students", response_model=List[StudentResponse])
async def get_all_students(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None
):
    """Get all enrolled students with their profile information."""
    # PERFORMANCE FIX: Use joinedload to eager-load profiles in a single query
    query = db.query(User).options(joinedload(User.profile)).join(UserProfile)
    
    # Optional search by name or email
    if search:
        # Escape special LIKE characters to prevent wildcard abuse
        escaped_search = escape_like_pattern(search)
        search_filter = f"%{escaped_search}%"
        query = query.filter(
            (User.email.ilike(search_filter)) |
            (UserProfile.first_name.ilike(search_filter)) |
            (UserProfile.last_name.ilike(search_filter))
        )
    
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for user in users:
        if user.profile:
            result.append(StudentResponse(
                id=str(user.id),
                email=user.email,
                first_name=user.profile.first_name,
                last_name=user.profile.last_name,
                xp=user.profile.xp,
                level=user.profile.level,
                streak_count=user.profile.streak_count,
                created_at=user.created_at,
                role=user.role.value if hasattr(user.role, 'value') else str(user.role)
            ))

    return result


# ===========================================================================
# DASHBOARD STATS — comprehensive stats for the admin overview page
# ===========================================================================

@router.get("/dashboard-stats")
async def get_dashboard_stats(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Return all stats needed by the admin dashboard in a single call."""
    from models.premium import CoachingSubmission, CoachingSubmissionStatus

    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    # ── Users ──────────────────────────────────────────────────────────────
    total_users = db.query(User).count()
    users_this_week = db.query(User).filter(User.created_at >= week_ago).count()
    users_last_week = db.query(User).filter(
        User.created_at >= two_weeks_ago,
        User.created_at < week_ago,
    ).count()

    if users_last_week > 0:
        user_growth_pct = round(
            ((users_this_week - users_last_week) / users_last_week) * 100, 1
        )
    elif users_this_week > 0:
        user_growth_pct = 100.0
    else:
        user_growth_pct = 0.0

    # ── Subscriptions ──────────────────────────────────────────────────────
    rookie_count = db.query(Subscription).filter(
        Subscription.status == SubscriptionStatus.ACTIVE,
        Subscription.tier == SubscriptionTier.ROOKIE,
    ).count()
    advanced_count = db.query(Subscription).filter(
        Subscription.status == SubscriptionStatus.ACTIVE,
        Subscription.tier == SubscriptionTier.ADVANCED,
    ).count()
    performer_count = db.query(Subscription).filter(
        Subscription.status == SubscriptionStatus.ACTIVE,
        Subscription.tier == SubscriptionTier.PERFORMER,
    ).count()
    active_subscriptions = rookie_count + advanced_count + performer_count
    canceled_count = db.query(Subscription).filter(
        Subscription.status == SubscriptionStatus.CANCELED,
    ).count()
    estimated_mrr = (
        rookie_count * TIER_PRICES["rookie"]
        + advanced_count * TIER_PRICES["advanced"]
        + performer_count * TIER_PRICES["performer"]
    )

    # ── Boss Submissions ───────────────────────────────────────────────────
    total_submissions = db.query(BossSubmission).count()
    pending_submissions = db.query(BossSubmission).filter(
        BossSubmission.status == SubmissionStatus.PENDING
    ).count()
    approved_this_week = db.query(BossSubmission).filter(
        BossSubmission.status == SubmissionStatus.APPROVED,
        BossSubmission.reviewed_at >= week_ago,
    ).count()
    rejected_this_week = db.query(BossSubmission).filter(
        BossSubmission.status == SubmissionStatus.REJECTED,
        BossSubmission.reviewed_at >= week_ago,
    ).count()
    total_reviewed = db.query(BossSubmission).filter(
        BossSubmission.status.in_([SubmissionStatus.APPROVED, SubmissionStatus.REJECTED])
    ).count()
    total_approved_all = db.query(BossSubmission).filter(
        BossSubmission.status == SubmissionStatus.APPROVED
    ).count()
    boss_pass_rate = (
        round((total_approved_all / total_reviewed) * 100, 1) if total_reviewed > 0 else 0.0
    )

    # ── Coaching ───────────────────────────────────────────────────────────
    coaching_pending = db.query(CoachingSubmission).filter(
        CoachingSubmission.status == CoachingSubmissionStatus.PENDING
    ).count()
    coaching_completed_month = db.query(CoachingSubmission).filter(
        CoachingSubmission.status == CoachingSubmissionStatus.COMPLETED,
        CoachingSubmission.reviewed_at >= month_start,
    ).count()

    # ── Recent Signups ─────────────────────────────────────────────────────
    recent_rows = (
        db.query(User, UserProfile, Subscription)
        .outerjoin(UserProfile, UserProfile.user_id == User.id)
        .outerjoin(Subscription, Subscription.user_id == User.id)
        .order_by(User.created_at.desc())
        .limit(10)
        .all()
    )
    recent_signups = [
        {
            "id": str(u.id),
            "email": u.email,
            "first_name": p.first_name if p else "",
            "last_name": p.last_name if p else "",
            "avatar_url": p.avatar_url if p else None,
            "tier": s.tier.value if s else None,
            "sub_status": s.status.value if s else None,
            "created_at": u.created_at.isoformat(),
            "xp": p.xp if p else 0,
            "level": p.level if p else 1,
        }
        for u, p, s in recent_rows
    ]

    # ── Top Lessons by Completions ─────────────────────────────────────────
    top_lessons_rows = (
        db.query(
            Lesson.id,
            Lesson.title,
            Lesson.is_boss_battle,
            Level.title.label("level_title"),
            World.title.label("world_title"),
            func.count(UserProgress.id).label("completions"),
        )
        .join(UserProgress, UserProgress.lesson_id == Lesson.id)
        .join(Level, Level.id == Lesson.level_id)
        .join(World, World.id == Level.world_id)
        .filter(UserProgress.is_completed == True)
        .group_by(Lesson.id, Lesson.title, Lesson.is_boss_battle, Level.title, World.title)
        .order_by(func.count(UserProgress.id).desc())
        .limit(5)
        .all()
    )
    top_lessons = [
        {
            "id": str(r.id),
            "title": r.title,
            "is_boss_battle": r.is_boss_battle,
            "level_title": r.level_title,
            "world_title": r.world_title,
            "completions": r.completions,
        }
        for r in top_lessons_rows
    ]

    # ── World Stats ────────────────────────────────────────────────────────
    worlds = (
        db.query(World)
        .filter(World.is_published == True)
        .order_by(World.order_index)
        .all()
    )
    world_stats = []
    for world in worlds:
        total_lessons_count = (
            db.query(func.count(Lesson.id))
            .join(Level, Level.id == Lesson.level_id)
            .filter(Level.world_id == world.id)
            .scalar()
            or 0
        )
        total_completions = (
            db.query(func.count(UserProgress.id))
            .join(Lesson, Lesson.id == UserProgress.lesson_id)
            .join(Level, Level.id == Lesson.level_id)
            .filter(Level.world_id == world.id, UserProgress.is_completed == True)
            .scalar()
            or 0
        )
        students_started = (
            db.query(func.count(func.distinct(UserProgress.user_id)))
            .join(Lesson, Lesson.id == UserProgress.lesson_id)
            .join(Level, Level.id == Lesson.level_id)
            .filter(Level.world_id == world.id, UserProgress.is_completed == True)
            .scalar()
            or 0
        )
        denom = students_started * total_lessons_count
        completion_rate = round((total_completions / denom) * 100, 1) if denom > 0 else 0.0
        world_stats.append(
            {
                "id": str(world.id),
                "title": world.title,
                "total_lessons": total_lessons_count,
                "total_completions": total_completions,
                "students_started": students_started,
                "completion_rate": completion_rate,
            }
        )

    return {
        "total_users": total_users,
        "users_this_week": users_this_week,
        "users_last_week": users_last_week,
        "user_growth_pct": user_growth_pct,
        "active_subscriptions": active_subscriptions,
        "rookie_count": rookie_count,
        "advanced_count": advanced_count,
        "performer_count": performer_count,
        "canceled_count": canceled_count,
        "estimated_mrr": estimated_mrr,
        "tier_prices": TIER_PRICES,
        "pending_submissions": pending_submissions,
        "approved_this_week": approved_this_week,
        "rejected_this_week": rejected_this_week,
        "total_submissions": total_submissions,
        "boss_pass_rate": boss_pass_rate,
        "coaching_pending": coaching_pending,
        "coaching_completed_month": coaching_completed_month,
        "recent_signups": recent_signups,
        "top_lessons": top_lessons,
        "world_stats": world_stats,
    }


# ===========================================================================
# STUDENT DETAIL — full profile for the student slide-over
# ===========================================================================

class StudentDetailResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    username: Optional[str]
    avatar_url: Optional[str]
    current_level_tag: Optional[str]
    xp: int
    level: int
    streak_count: int
    current_claves: int
    reputation: int
    inventory_freezes: int
    referral_code: Optional[str]
    referral_count: int
    badges: str
    created_at: datetime
    role: str
    sub_tier: Optional[str]
    sub_status: Optional[str]
    sub_period_end: Optional[datetime]
    lessons_completed: int
    boss_battles_attempted: int
    boss_battles_passed: int
    recent_lessons: List[Dict[str, Any]]

    class Config:
        from_attributes = True


@router.get("/students/{user_id}", response_model=StudentDetailResponse)
async def get_student_detail(
    user_id: str,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Get full profile detail for a single student."""
    user = (
        db.query(User)
        .options(joinedload(User.profile))
        .filter(User.id == user_id)
        .first()
    )
    if not user or not user.profile:
        raise HTTPException(status_code=404, detail="Student not found")

    profile = user.profile
    sub = db.query(Subscription).filter(Subscription.user_id == user.id).first()

    lessons_completed = db.query(UserProgress).filter(
        UserProgress.user_id == user.id, UserProgress.is_completed == True
    ).count()

    boss_total = db.query(BossSubmission).filter(BossSubmission.user_id == user.id).count()
    boss_passed = db.query(BossSubmission).filter(
        BossSubmission.user_id == user.id,
        BossSubmission.status == SubmissionStatus.APPROVED,
    ).count()

    recent_rows = (
        db.query(UserProgress, Lesson)
        .join(Lesson, Lesson.id == UserProgress.lesson_id)
        .filter(UserProgress.user_id == user.id, UserProgress.is_completed == True)
        .order_by(UserProgress.completed_at.desc())
        .limit(5)
        .all()
    )
    recent_lessons = [
        {
            "lesson_id": str(up.lesson_id),
            "title": lesson.title,
            "completed_at": up.completed_at.isoformat() if up.completed_at else None,
            "xp_value": lesson.xp_value,
            "is_boss_battle": lesson.is_boss_battle,
        }
        for up, lesson in recent_rows
    ]

    return StudentDetailResponse(
        id=str(user.id),
        email=user.email,
        first_name=profile.first_name,
        last_name=profile.last_name,
        username=profile.username,
        avatar_url=profile.avatar_url,
        current_level_tag=profile.current_level_tag.value if profile.current_level_tag else None,
        xp=profile.xp,
        level=profile.level,
        streak_count=profile.streak_count,
        current_claves=profile.current_claves,
        reputation=profile.reputation,
        inventory_freezes=profile.inventory_freezes,
        referral_code=profile.referral_code,
        referral_count=profile.referral_count,
        badges=profile.badges,
        created_at=user.created_at,
        role=user.role.value if hasattr(user.role, "value") else str(user.role),
        sub_tier=sub.tier.value if sub else None,
        sub_status=sub.status.value if sub else None,
        sub_period_end=sub.current_period_end if sub else None,
        lessons_completed=lessons_completed,
        boss_battles_attempted=boss_total,
        boss_battles_passed=boss_passed,
        recent_lessons=recent_lessons,
    )


# ===========================================================================
# GRANT XP — manually award XP to a student
# ===========================================================================

class GrantXPRequest(BaseModel):
    amount: int
    reason: Optional[str] = None


@router.post("/students/{user_id}/grant-xp")
async def grant_xp_to_student(
    user_id: str,
    data: GrantXPRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Manually grant XP to a student. Admin only."""
    if data.amount <= 0 or data.amount > 10000:
        raise HTTPException(status_code=400, detail="Amount must be between 1 and 10000")

    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Student not found")

    profile.xp += data.amount
    profile.level = max(1, profile.xp // 1000)
    db.commit()

    return {
        "success": True,
        "new_xp": profile.xp,
        "new_level": profile.level,
        "message": f"Granted {data.amount} XP to {profile.first_name} {profile.last_name}",
    }


# ===========================================================================
# SEND ANNOUNCEMENT — broadcast email to students
# ===========================================================================

class AnnouncementRequest(BaseModel):
    subject: str
    message: str
    tier_filter: Optional[str] = "all"


@router.post("/send-announcement")
async def send_announcement(
    data: AnnouncementRequest,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    """Broadcast an email announcement to students. Admin only."""
    from services.email_service import send_announcement_email

    if not data.subject.strip() or not data.message.strip():
        raise HTTPException(status_code=400, detail="Subject and message are required")

    query = (
        db.query(User, UserProfile)
        .join(UserProfile, UserProfile.user_id == User.id)
    )

    if data.tier_filter and data.tier_filter != "all":
        try:
            tier_enum = SubscriptionTier(data.tier_filter)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid tier filter")
        query = query.join(Subscription, Subscription.user_id == User.id).filter(
            Subscription.tier == tier_enum,
            Subscription.status == SubscriptionStatus.ACTIVE,
        )

    users = query.all()

    sent_count = 0
    failed_count = 0
    for user, profile in users:
        success = send_announcement_email(
            email=user.email,
            name=profile.first_name,
            subject=data.subject,
            message=data.message,
        )
        if success:
            sent_count += 1
        else:
            failed_count += 1

    return {
        "sent_count": sent_count,
        "failed_count": failed_count,
        "message": f"Announcement sent to {sent_count} students",
    }
