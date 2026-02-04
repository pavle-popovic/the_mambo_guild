"""
Post Service - Community Posts for The Stage & The Lab
Handles post creation, feeds, reactions, replies, and solutions.
"""
import logging
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from sqlalchemy.dialects.postgresql import ARRAY
import uuid

from models.user import User, UserProfile, Subscription, SubscriptionTier, SubscriptionStatus
from models.community import Post, PostReply, PostReaction, CommunityTag
from services.clave_service import (
    spend_claves, can_afford, get_video_slot_status,
    award_accepted_answer, process_reaction_refund,
    COST_REACTION, COST_COMMENT, COST_POST_QUESTION, COST_POST_VIDEO
)

logger = logging.getLogger(__name__)


def _get_user_info(user: User, db: Session) -> dict:
    """Build user info dict for responses."""
    profile = user.profile
    is_pro = False
    is_guild_master = False
    
    # Check subscription
    if user.subscription:
        is_active = user.subscription.status == SubscriptionStatus.ACTIVE
        is_pro = is_active and user.subscription.tier in [SubscriptionTier.ADVANCED, SubscriptionTier.PERFORMER]
        # Guild Master = PERFORMER tier (top premium tier)
        is_guild_master = is_active and user.subscription.tier == SubscriptionTier.PERFORMER
    
    return {
        "id": str(user.id),
        "first_name": profile.first_name if profile else "Unknown",
        "last_name": profile.last_name if profile else "User",
        "avatar_url": profile.avatar_url if profile else None,
        "is_pro": is_pro,
        "is_guild_master": is_guild_master,
        "level": profile.level if profile else 1
    }


def _format_post_response(post: Post, current_user_id: str, db: Session) -> dict:
    """Format a post for API response."""
    user = db.query(User).filter(User.id == post.user_id).first()
    
    # Check if current user has reacted
    user_reaction = None
    if current_user_id:
        reaction = db.query(PostReaction).filter(
            PostReaction.post_id == post.id,
            PostReaction.user_id == current_user_id
        ).first()
        if reaction:
            user_reaction = reaction.reaction_type
    
    return {
        "id": str(post.id),
        "user": _get_user_info(user, db) if user else None,
        "post_type": post.post_type,
        "title": post.title,
        "body": post.body,
        "mux_playback_id": post.mux_playback_id,
        "video_duration_seconds": post.video_duration_seconds,
        "tags": post.tags or [],
        "is_wip": post.is_wip,
        "feedback_type": post.feedback_type,
        "is_solved": post.is_solved,
        "reaction_count": post.reaction_count,
        "reply_count": post.reply_count,
        "user_reaction": user_reaction,
        "created_at": post.created_at,
        "updated_at": post.updated_at
    }


def _format_reply_response(reply: PostReply, db: Session) -> dict:
    """Format a reply for API response."""
    user = db.query(User).filter(User.id == reply.user_id).first()
    
    return {
        "id": str(reply.id),
        "user": _get_user_info(user, db) if user else None,
        "content": reply.content,
        "mux_playback_id": reply.mux_playback_id,
        "is_accepted_answer": reply.is_accepted_answer,
        "created_at": reply.created_at
    }


def create_post(
    user_id: str,
    post_type: str,
    title: str,
    tags: List[str],
    body: str = None,
    is_wip: bool = False,
    feedback_type: str = "coach",
    mux_asset_id: str = None,
    mux_playback_id: str = None,
    video_duration_seconds: int = None,
    db: Session = None
) -> dict:
    """
    Create a new post.
    Returns: {success, post, message} or {success: False, message}
    """
    # Validate tags exist
    if not tags or len(tags) == 0:
        return {"success": False, "message": "At least one tag is required"}
    
    valid_tags = db.query(CommunityTag.slug).filter(
        CommunityTag.slug.in_(tags)
    ).all()
    valid_tag_slugs = [t[0] for t in valid_tags]
    
    if not valid_tag_slugs:
        return {"success": False, "message": "At least one valid tag is required. Invalid tags provided."}
    
    # Check if any tags were invalid
    if len(valid_tag_slugs) < len(tags):
        invalid_tags = set(tags) - set(valid_tag_slugs)
        return {"success": False, "message": f"Invalid tags: {', '.join(invalid_tags)}. Please select valid tags."}
    
    # Determine cost
    if post_type == "stage":
        cost = COST_POST_VIDEO
        
        # Check video slot limit
        slot_status = get_video_slot_status(user_id, db)
        if not slot_status["allowed"]:
            return {"success": False, "message": slot_status["message"]}
    else:
        cost = COST_POST_QUESTION
        
        # Lab posts require body
        if not body or not body.strip():
            return {"success": False, "message": "Question body is required for Lab posts"}
    
    # Check and spend claves
    success, balance = spend_claves(user_id, cost, f"post_{post_type}", db)
    if not success:
        return {
            "success": False,
            "message": f"Insufficient claves. You need {cost} 🥢 but have {balance} 🥢",
            "required": cost,
            "balance": balance
        }
    
    # Create post
    post = Post(
        id=uuid.uuid4(),
        user_id=user_id,
        post_type=post_type,
        title=title,
        body=body,
        tags=valid_tag_slugs,
        is_wip=is_wip,
        feedback_type=feedback_type,
        mux_asset_id=mux_asset_id,
        mux_playback_id=mux_playback_id,
        video_duration_seconds=video_duration_seconds
    )
    db.add(post)
    
    # Update tag usage counts
    for tag_slug in valid_tag_slugs:
        db.query(CommunityTag).filter(
            CommunityTag.slug == tag_slug
        ).update({"usage_count": CommunityTag.usage_count + 1})
    
    db.flush()
    
    logger.info(f"User {user_id} created {post_type} post {post.id}")
    
    return {
        "success": True,
        "post": _format_post_response(post, user_id, db),
        "message": f"Post created! (-{cost} 🥢)"
    }


def get_feed(
    post_type: str = None,
    tag: str = None,
    skip: int = 0,
    limit: int = 20,
    current_user_id: str = None,
    db: Session = None
) -> List[dict]:
    """
    Get paginated feed of posts.
    """
    query = db.query(Post)
    
    if post_type:
        query = query.filter(Post.post_type == post_type)
    
    if tag:
        # Use PostgreSQL array contains operator (@>)
        query = query.filter(Post.tags.any(tag))
    
    posts = query.order_by(desc(Post.created_at)).offset(skip).limit(limit).all()
    
    return [_format_post_response(p, current_user_id, db) for p in posts]


def get_post_detail(
    post_id: str,
    current_user_id: str,
    db: Session
) -> Optional[dict]:
    """
    Get full post detail with replies.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return None
    
    # Get replies ordered by accepted answer first, then by date
    replies = db.query(PostReply).filter(
        PostReply.post_id == post_id
    ).order_by(
        desc(PostReply.is_accepted_answer),
        PostReply.created_at
    ).all()
    
    response = _format_post_response(post, current_user_id, db)
    response["replies"] = [_format_reply_response(r, db) for r in replies]
    
    return response


def add_reaction(
    post_id: str,
    user_id: str,
    reaction_type: str,
    db: Session
) -> dict:
    """
    Add or change a reaction on a post.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return {"success": False, "message": "Post not found"}
    
    # Check for existing reaction
    existing = db.query(PostReaction).filter(
        PostReaction.post_id == post_id,
        PostReaction.user_id == user_id
    ).first()
    
    if existing:
        # Change reaction type (no charge for changing)
        if existing.reaction_type != reaction_type:
            existing.reaction_type = reaction_type
            db.flush()
            return {"success": True, "message": "Reaction updated"}
        else:
            return {"success": True, "message": "Already reacted"}
            
    # Prevent self-reaction
    if str(post.user_id) == user_id:
         return {"success": False, "message": "You cannot react to your own posts"}
    
    # New reaction - charge claves
    success, balance = spend_claves(user_id, COST_REACTION, "reaction", db, reference_id=str(post_id))
    if not success:
        return {
            "success": False,
            "message": f"Insufficient claves. You need {COST_REACTION} 🥢",
            "required": COST_REACTION,
            "balance": balance
        }
    
    # Create reaction
    reaction = PostReaction(
        id=uuid.uuid4(),
        post_id=post_id,
        user_id=user_id,
        reaction_type=reaction_type
    )
    db.add(reaction)
    
    # Update post reaction count
    post.reaction_count += 1
    
    # Process refund for post owner (ANY reaction type triggers it)
    if str(post.user_id) != user_id:
        process_reaction_refund(str(post_id), str(post.user_id), db)
    
    db.flush()
    
    logger.info(f"User {user_id} reacted {reaction_type} on post {post_id}")
    return {"success": True, "message": f"Reacted with {reaction_type}! (-{COST_REACTION} 🥢)"}


def remove_reaction(
    post_id: str,
    user_id: str,
    db: Session
) -> dict:
    """
    Remove a reaction from a post (refunds clave).
    """
    reaction = db.query(PostReaction).filter(
        PostReaction.post_id == post_id,
        PostReaction.user_id == user_id
    ).first()
    
    if not reaction:
        return {"success": False, "message": "No reaction to remove"}
    
    # Get post to update count
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        post.reaction_count = max(0, post.reaction_count - 1)
    
    db.delete(reaction)
    
    # Note: We don't refund claves for removing reactions (anti-abuse)
    db.flush()
    
    return {"success": True, "message": "Reaction removed"}


def add_reply(
    post_id: str,
    user_id: str,
    content: str,
    mux_asset_id: str = None,
    mux_playback_id: str = None,
    db: Session = None
) -> dict:
    """
    Add a reply/comment to a post.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return {"success": False, "message": "Post not found"}
    
    # Check feedback_type - "hype" mode disables comments
    if post.feedback_type == "hype":
        return {"success": False, "message": "Comments are disabled on this post (Hype mode)"}
    
    # Charge claves
    success, balance = spend_claves(user_id, COST_COMMENT, "comment", db, reference_id=str(post_id))
    if not success:
        return {
            "success": False,
            "message": f"Insufficient claves. You need {COST_COMMENT} 🥢",
            "required": COST_COMMENT,
            "balance": balance
        }
    
    # Create reply
    reply = PostReply(
        id=uuid.uuid4(),
        post_id=post_id,
        user_id=user_id,
        content=content,
        mux_asset_id=mux_asset_id,
        mux_playback_id=mux_playback_id
    )
    db.add(reply)
    
    # Update post reply count
    post.reply_count += 1
    
    db.flush()
    
    logger.info(f"User {user_id} replied to post {post_id}")
    return {
        "success": True,
        "reply": _format_reply_response(reply, db),
        "message": f"Comment posted! (-{COST_COMMENT} 🥢)"
    }


def mark_solution(
    post_id: str,
    reply_id: str,
    user_id: str,
    db: Session
) -> dict:
    """
    Mark a reply as the accepted solution (OP only).
    Awards claves to the helper.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return {"success": False, "message": "Post not found"}
    
    # Only OP can mark solution
    if str(post.user_id) != user_id:
        return {"success": False, "message": "Only the question author can mark a solution"}
    
    # Only for Lab posts
    if post.post_type != "lab":
        return {"success": False, "message": "Solutions are only for Lab questions"}
    
    reply = db.query(PostReply).filter(
        PostReply.id == reply_id,
        PostReply.post_id == post_id
    ).first()
    
    if not reply:
        return {"success": False, "message": "Reply not found"}
    
    # Can't accept your own answer
    if str(reply.user_id) == user_id:
        return {"success": False, "message": "You can't accept your own answer"}
    
    # Unmark previous accepted answer if any
    if post.accepted_answer_id:
        old_answer = db.query(PostReply).filter(
            PostReply.id == post.accepted_answer_id
        ).first()
        if old_answer:
            old_answer.is_accepted_answer = False
    
    # Mark new answer
    reply.is_accepted_answer = True
    post.accepted_answer_id = reply.id
    post.is_solved = True
    
    # Award claves to the helper
    award_accepted_answer(str(reply.user_id), str(post_id), db)
    
    db.flush()
    
    logger.info(f"Post {post_id} marked reply {reply_id} as solution")
    return {"success": True, "message": "Solution marked! Helper awarded 10 🥢"}


def update_post(
    post_id: str,
    user_id: str,
    title: str = None,
    body: str = None,
    tags: List[str] = None,
    is_wip: bool = None,
    feedback_type: str = None,
    db: Session = None
) -> dict:
    """
    Update an existing post (own posts only).
    Returns: {success, post, message} or {success: False, message}
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return {"success": False, "message": "Post not found"}
    
    # Only owner can update
    if str(post.user_id) != user_id:
        return {"success": False, "message": "You can only edit your own posts"}
    
    # Update fields if provided
    if title is not None:
        post.title = title
    
    if body is not None:
        # Lab posts require body
        if post.post_type == "lab" and not body.strip():
            return {"success": False, "message": "Question body is required for Lab posts"}
        post.body = body
    
    if tags is not None:
        # Validate tags exist
        valid_tags = db.query(CommunityTag.slug).filter(
            CommunityTag.slug.in_(tags)
        ).all()
        valid_tag_slugs = [t[0] for t in valid_tags]
        
        if not valid_tag_slugs:
            return {"success": False, "message": "At least one valid tag is required"}
        
        if len(valid_tag_slugs) < len(tags):
            invalid_tags = set(tags) - set(valid_tag_slugs)
            return {"success": False, "message": f"Invalid tags: {', '.join(invalid_tags)}. Please select valid tags."}
        
        # Update tag usage counts (decrement old, increment new)
        old_tags = set(post.tags or [])
        new_tags = set(valid_tag_slugs)
        
        for tag_slug in old_tags - new_tags:
            db.query(CommunityTag).filter(
                CommunityTag.slug == tag_slug
            ).update({"usage_count": CommunityTag.usage_count - 1})
        
        for tag_slug in new_tags - old_tags:
            db.query(CommunityTag).filter(
                CommunityTag.slug == tag_slug
            ).update({"usage_count": CommunityTag.usage_count + 1})
        
        post.tags = valid_tag_slugs
    
    if is_wip is not None:
        post.is_wip = is_wip
    
    if feedback_type is not None:
        post.feedback_type = feedback_type
    
    db.flush()
    
    logger.info(f"User {user_id} updated post {post_id}")
    
    return {
        "success": True,
        "post": _format_post_response(post, user_id, db),
        "message": "Post updated successfully"
    }


def delete_post(
    post_id: str,
    user_id: str,
    db: Session
) -> dict:
    """
    Delete a post (own posts only).
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return {"success": False, "message": "Post not found"}
    
    try:
        # Check ownership or admin status
        # Local import to assure no circular deps and correct Enum access
        from models.user import User, UserRole
        
        # Get user to check role
        user = db.query(User).filter(User.id == user_id).first()
        is_admin = False
        if user:
            # Check against Enum or string value
            is_admin = (user.role == UserRole.ADMIN) or (str(user.role) == "admin")
        
        if str(post.user_id) != user_id and not is_admin:
            return {"success": False, "message": "You can only delete your own posts"}
        
        # Delete from Mux if asset ID exists
        if post.mux_asset_id:
            try:
                from services import mux_service
                logger.info(f"Attempting to delete Mux asset {post.mux_asset_id} for post {post_id}")
                mux_service.delete_asset(post.mux_asset_id)
            except Exception as e:
                # Log but do not block post deletion
                logger.error(f"Failed to delete Mux asset {post.mux_asset_id} for post {post_id}: {e}")
        
        # Delete the post (cascades to reactions and replies)
        db.delete(post)
        db.commit() # Commit explicitly
        
        logger.info(f"User {user_id} (Admin: {is_admin}) deleted post {post_id}")
        return {"success": True, "message": "Post deleted"}
        
    except Exception as e:
        logger.error(f"CRITICAL ERROR deleting post {post_id}: {e}", exc_info=True)
        db.rollback()
        return {"success": False, "message": f"Server error while deleting post: {str(e)}"}


def get_tags(db: Session) -> List[dict]:
    """
    Get all available community tags.
    """
    tags = db.query(CommunityTag).order_by(CommunityTag.name).all()
    return [
        {
            "slug": t.slug,
            "name": t.name,
            "category": t.category,
            "usage_count": t.usage_count
        }
        for t in tags
    ]


def search_posts(
    query: str,
    post_type: str = None,
    skip: int = 0,
    limit: int = 20,
    current_user_id: str = None,
    db: Session = None
) -> List[dict]:
    """
    Search posts by title and tags.
    """
    search_query = db.query(Post).filter(
        Post.title.ilike(f"%{query}%")
    )
    
    if post_type:
        search_query = search_query.filter(Post.post_type == post_type)
    
    posts = search_query.order_by(desc(Post.created_at)).offset(skip).limit(limit).all()
    
    return [_format_post_response(p, current_user_id, db) for p in posts]
