"""
Leaderboard Service - Ranking system with periods and categories.
"""
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, case

from models.user import User, UserProfile
from models.community import Post, PostReply, PostReaction, UserStats

logger = logging.getLogger(__name__)

# Period definitions
PERIOD_FILTERS = {
    "weekly": 7,
    "monthly": 30,
    "all_time": None
}

# Scoring weights per category
SCORING = {
    "overall": {"posts": 5, "reactions_received": 2, "replies": 3, "solutions": 15},
    "helpful": {"posts": 0, "reactions_received": 0, "replies": 3, "solutions": 10},
    "creative": {"posts": 5, "reactions_received": 3, "replies": 0, "solutions": 0},
    "active": {"posts": 3, "reactions_received": 0, "replies": 2, "reactions_given": 1},
}


def _get_date_filter(period: str) -> Optional[datetime]:
    """Get the cutoff date for a given period."""
    days = PERIOD_FILTERS.get(period)
    if days is None:
        return None
    return datetime.now(timezone.utc) - timedelta(days=days)


def get_leaderboard(
    period: str = "all_time",
    category: str = "overall",
    limit: int = 10,
    db: Session = None
) -> List[dict]:
    """
    Get leaderboard entries for a given period and category.
    Returns list of {user_id, first_name, avatar_url, score, rank}.
    """
    cutoff = _get_date_filter(period)
    weights = SCORING.get(category, SCORING["overall"])

    # Build subqueries for each metric
    # Posts count
    posts_q = db.query(
        Post.user_id,
        func.count(Post.id).label("post_count")
    ).filter(Post.is_deleted == False)
    if cutoff:
        posts_q = posts_q.filter(Post.created_at >= cutoff)
    posts_q = posts_q.group_by(Post.user_id).subquery()

    # Reactions received count
    reactions_recv_q = db.query(
        Post.user_id,
        func.count(PostReaction.id).label("reactions_received")
    ).join(PostReaction, PostReaction.post_id == Post.id).filter(Post.is_deleted == False)
    if cutoff:
        reactions_recv_q = reactions_recv_q.filter(PostReaction.created_at >= cutoff)
    reactions_recv_q = reactions_recv_q.group_by(Post.user_id).subquery()

    # Replies count
    replies_q = db.query(
        PostReply.user_id,
        func.count(PostReply.id).label("reply_count")
    ).filter(PostReply.is_deleted == False)
    if cutoff:
        replies_q = replies_q.filter(PostReply.created_at >= cutoff)
    replies_q = replies_q.group_by(PostReply.user_id).subquery()

    # Solutions count
    solutions_q = db.query(
        PostReply.user_id,
        func.count(PostReply.id).label("solution_count")
    ).filter(
        PostReply.is_accepted_answer == True,
        PostReply.is_deleted == False
    )
    if cutoff:
        solutions_q = solutions_q.filter(PostReply.created_at >= cutoff)
    solutions_q = solutions_q.group_by(PostReply.user_id).subquery()

    # Reactions given (for 'active' category)
    reactions_given_q = db.query(
        PostReaction.user_id,
        func.count(PostReaction.id).label("reactions_given")
    )
    if cutoff:
        reactions_given_q = reactions_given_q.filter(PostReaction.created_at >= cutoff)
    reactions_given_q = reactions_given_q.group_by(PostReaction.user_id).subquery()

    # Build the score expression
    score_parts = []
    if weights.get("posts", 0) > 0:
        score_parts.append(func.coalesce(posts_q.c.post_count, 0) * weights["posts"])
    if weights.get("reactions_received", 0) > 0:
        score_parts.append(func.coalesce(reactions_recv_q.c.reactions_received, 0) * weights["reactions_received"])
    if weights.get("replies", 0) > 0:
        score_parts.append(func.coalesce(replies_q.c.reply_count, 0) * weights["replies"])
    if weights.get("solutions", 0) > 0:
        score_parts.append(func.coalesce(solutions_q.c.solution_count, 0) * weights["solutions"])
    if weights.get("reactions_given", 0) > 0:
        score_parts.append(func.coalesce(reactions_given_q.c.reactions_given, 0) * weights["reactions_given"])

    if not score_parts:
        return []

    score_expr = score_parts[0]
    for part in score_parts[1:]:
        score_expr = score_expr + part

    # Main query
    query = db.query(
        User.id,
        UserProfile.username,
        UserProfile.first_name,
        UserProfile.avatar_url,
        score_expr.label("score")
    ).join(
        UserProfile, User.id == UserProfile.user_id, isouter=True
    )

    # Join subqueries
    if weights.get("posts", 0) > 0:
        query = query.outerjoin(posts_q, User.id == posts_q.c.user_id)
    if weights.get("reactions_received", 0) > 0:
        query = query.outerjoin(reactions_recv_q, User.id == reactions_recv_q.c.user_id)
    if weights.get("replies", 0) > 0:
        query = query.outerjoin(replies_q, User.id == replies_q.c.user_id)
    if weights.get("solutions", 0) > 0:
        query = query.outerjoin(solutions_q, User.id == solutions_q.c.user_id)
    if weights.get("reactions_given", 0) > 0:
        query = query.outerjoin(reactions_given_q, User.id == reactions_given_q.c.user_id)

    results = query.filter(
        score_expr > 0
    ).order_by(desc("score")).limit(limit).all()

    return [
        {
            "id": str(r.id),
            "username": r.username,
            "first_name": r.first_name or "User",
            "avatar_url": r.avatar_url,
            "score": r.score or 0,
            "rank": idx + 1
        }
        for idx, r in enumerate(results)
    ]


def get_user_rank(
    user_id: str,
    period: str = "all_time",
    category: str = "overall",
    db: Session = None
) -> dict:
    """
    Get a specific user's rank and score.
    Returns {rank, score}.
    """
    # Get full leaderboard (up to 1000) and find user's position
    leaderboard = get_leaderboard(period=period, category=category, limit=1000, db=db)

    for entry in leaderboard:
        if entry["id"] == user_id:
            return {"rank": entry["rank"], "score": entry["score"]}

    return {"rank": None, "score": 0}


def get_hall_of_fame(limit: int = 5, db: Session = None) -> List[dict]:
    """Get all-time top contributors."""
    return get_leaderboard(period="all_time", category="overall", limit=limit, db=db)
