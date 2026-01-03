from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from models import get_db
from models.user import User
from models.progress import BossSubmission, SubmissionStatus
from models.course import Lesson
from schemas.submissions import SubmissionCreateRequest, SubmissionResponse
from dependencies import get_current_user
from datetime import datetime
import uuid

router = APIRouter()


@router.post("/submit", response_model=SubmissionResponse)
async def submit_boss_battle(
    submission_data: SubmissionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a boss battle video."""
    lesson = db.query(Lesson).filter(Lesson.id == submission_data.lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    if not lesson.is_boss_battle:
        raise HTTPException(status_code=400, detail="This lesson is not a boss battle")
    
    # Check if submission already exists
    existing = db.query(BossSubmission).filter(
        BossSubmission.user_id == current_user.id,
        BossSubmission.lesson_id == lesson.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Submission already exists for this lesson")
    
    # Create submission
    submission = BossSubmission(
        id=uuid.uuid4(),
        user_id=current_user.id,
        lesson_id=lesson.id,
        video_url=submission_data.video_url,
        status=SubmissionStatus.PENDING
    )
    db.add(submission)
    db.commit()
    
    return SubmissionResponse(
        id=str(submission.id),
        status=submission.status,
        feedback=submission.instructor_feedback,
        submitted_at=submission.submitted_at
    )


@router.get("/my-submissions", response_model=List[SubmissionResponse])
async def get_my_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all submissions for current user."""
    submissions = db.query(BossSubmission).filter(
        BossSubmission.user_id == current_user.id
    ).order_by(BossSubmission.submitted_at.desc()).all()
    
    return [
        SubmissionResponse(
            id=str(s.id),
            status=s.status,
            feedback=s.instructor_feedback,
            submitted_at=s.submitted_at
        )
        for s in submissions
    ]

