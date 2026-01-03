from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from models import get_db
from models.user import User
from models.progress import BossSubmission, SubmissionStatus
from models.course import World, Level, Lesson
from schemas.submissions import SubmissionResponse, GradeSubmissionRequest
from dependencies import get_admin_user
from datetime import datetime
import uuid

router = APIRouter()


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
    submission.reviewed_at = datetime.utcnow()
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

