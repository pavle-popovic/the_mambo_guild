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
from models.community import Post, PostReply, PostReaction, CommunityTag, ModerationStatus, SavedPost
from services.moderation_service import evaluate_reply, evaluate_post
from services.mux_service import delete_asset as delete_mux_asset
from services import rate_limit_service
from services.clave_service import (
    spend_claves, can_afford, get_video_slot_status, get_question_slot_status,
    award_accepted_answer,
    COST_REACTION, COST_COMMENT, COST_POST_QUESTION, COST_POST_VIDEO,
)

logger = logging.getLogger(__name__)


def _get_user_info(user: User, db: Session) -> dict:
    """Build user info dict for responses."""
    profile = user.profile
    is_pro = False
    is_guild_master = False
    
    # Check subscription
    if user.subscription:
        is_active = user.subscription.status in (SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING)
        is_pro = is_active and user.subscription.tier in [SubscriptionTier.ADVANCED, SubscriptionTier.PERFORMER]
        # Guild Master = PERFORMER tier (top premium tier)
        is_guild_master = is_active and user.subscription.tier == SubscriptionTier.PERFORMER
    
    return {
        "id": str(user.id),
        "username": profile.username if profile else "",
        "first_name": profile.first_name if profile else "Unknown",
        "last_name": profile.last_name if profile else "User",
        "avatar_url": profile.avatar_url if profile else None,
        "is_pro": is_pro,
        "is_guild_master": is_guild_master,
        "level": profile.level if profile else 1,
        # Shop cosmetic overlays (null when nothing equipped). Surfaced on
        # every post.user payload so feed cards can render borders + title
        # chips without an extra round-trip.
        "equipped_border_sku": profile.equipped_border_sku if profile else None,
        "equipped_title_sku": profile.equipped_title_sku if profile else None,
    }


def _build_post_dict(
    post: Post,
    user: User,
    user_reaction: str | None,
    db: Session,
    is_saved: bool = False,
) -> dict:
    """Build the post response dict from pre-loaded objects."""
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
        "video_type": post.video_type,
        "is_solved": post.is_solved,
        "reaction_count": post.reaction_count,
        "reply_count": post.reply_count,
        "user_reaction": user_reaction,
        "is_saved": is_saved,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
    }


def _format_post_response(post: Post, current_user_id: str, db: Session) -> dict:
    """Format a single post for API response. For feeds use _format_posts_bulk."""
    user = db.query(User).filter(User.id == post.user_id).options(
        joinedload(User.profile), joinedload(User.subscription)
    ).first()
    user_reaction = None
    is_saved = False
    if current_user_id:
        reaction = db.query(PostReaction).filter(
            PostReaction.post_id == post.id,
            PostReaction.user_id == current_user_id
        ).first()
        if reaction:
            user_reaction = reaction.reaction_type
        is_saved = db.query(SavedPost).filter(
            SavedPost.post_id == post.id,
            SavedPost.user_id == current_user_id
        ).first() is not None
    return _build_post_dict(post, user, user_reaction, db, is_saved=is_saved)


def _format_posts_bulk(posts: list, current_user_id: str, db: Session) -> list:
    """
    Format a list of posts for API response using batch queries.
    Avoids N+1: 2 extra queries regardless of how many posts.
    """
    if not posts:
        return []

    # Batch-load all authors in one query (with profile + subscription)
    user_ids = list({p.user_id for p in posts})
    users = db.query(User).filter(User.id.in_(user_ids)).options(
        joinedload(User.profile), joinedload(User.subscription)
    ).all()
    user_map = {str(u.id): u for u in users}

    post_ids = [p.id for p in posts]

    # Batch-load current user's reactions and saved status in two queries
    reaction_map: dict = {}
    saved_set: set = set()
    if current_user_id:
        reactions = db.query(PostReaction).filter(
            PostReaction.post_id.in_(post_ids),
            PostReaction.user_id == current_user_id
        ).all()
        reaction_map = {str(r.post_id): r.reaction_type for r in reactions}

        saved_rows = db.query(SavedPost.post_id).filter(
            SavedPost.post_id.in_(post_ids),
            SavedPost.user_id == current_user_id
        ).all()
        saved_set = {str(row[0]) for row in saved_rows}

    return [
        _build_post_dict(
            p,
            user_map.get(str(p.user_id)),
            reaction_map.get(str(p.id)),
            db,
            is_saved=str(p.id) in saved_set,
        )
        for p in posts
    ]


def _format_reply_response(reply: PostReply, db: Session, user: User = None) -> dict:
    """Format a reply for API response. Pass pre-loaded user to avoid extra query."""
    if user is None:
        user = db.query(User).filter(User.id == reply.user_id).options(
            joinedload(User.profile), joinedload(User.subscription)
        ).first()
    return {
        "id": str(reply.id),
        "user": _get_user_info(user, db) if user else None,
        "content": reply.content,
        "mux_playback_id": reply.mux_playback_id,
        "is_accepted_answer": reply.is_accepted_answer,
        "moderation_status": reply.moderation_status or "active",
        "created_at": reply.created_at,
        "parent_reply_id": str(reply.parent_reply_id) if reply.parent_reply_id else None,
    }


def format_posts_bulk_public(posts: list, current_user_id: str, db: Session) -> list:
    """Public wrapper for _format_posts_bulk, used by saved posts endpoint."""
    return _format_posts_bulk(posts, current_user_id, db)


def create_post(
    user_id: str,
    post_type: str,
    title: str,
    tags: List[str],
    body: str = None,
    is_wip: bool = False,
    feedback_type: str = "coach",
    video_type: str = None,
    mux_asset_id: str = None,
    mux_playback_id: str = None,
    video_duration_seconds: int = None,
    db: Session = None
) -> dict:
    """
    Create a new post.
    Returns: {success, post, message} or {success: False, message}
    """
    # Hourly rate limit (anti-spam; the only gate now that posting is free).
    allowed, info = rate_limit_service.check("post", user_id, db)
    if not allowed:
        return {"success": False, "message": info["message"], "rate_limited": True}

    # Validate tags exist
    if not tags or len(tags) == 0:
        return {"success": False, "message": "At least one tag is required"}

    valid_tag_slugs = [row[0] for row in db.query(CommunityTag.slug).filter(
        CommunityTag.slug.in_(tags)
    ).all()]

    if not valid_tag_slugs:
        return {"success": False, "message": "At least one valid tag is required. Invalid tags provided."}

    # Check if any tags were invalid
    if len(valid_tag_slugs) < len(tags):
        invalid_tags = set(tags) - set(valid_tag_slugs)
        return {"success": False, "message": f"Invalid tags: {', '.join(invalid_tags)}. Please select valid tags."}


    # Determine cost
    if post_type == "stage":
        cost = COST_POST_VIDEO

        # video_type is required for Stage posts — UI enforces this, but
        # defend in service in case a client bypasses the schema.
        if video_type not in ("motw", "original", "guild"):
            return {"success": False, "message": "video_type must be one of: motw, original, guild"}

        # Serialize concurrent uploads by this user behind the profile row
        # lock so the slot-count read is not racy against a sibling request
        # that is about to INSERT. Without this, two parallel uploads can
        # both see `current < limit` and both insert, exceeding the cap.
        # The lock is released when this request's transaction commits.
        db.query(UserProfile).filter(
            UserProfile.user_id == user_id
        ).with_for_update().first()

        # Check video slot limit
        slot_status = get_video_slot_status(user_id, db)
        if not slot_status["allowed"]:
            return {"success": False, "message": slot_status["message"]}
    else:
        cost = COST_POST_QUESTION

        # See note above — same TOCTOU applies to lab question slots.
        db.query(UserProfile).filter(
            UserProfile.user_id == user_id
        ).with_for_update().first()

        # Check question slot limit
        q_slot_status = get_question_slot_status(user_id, db)
        if not q_slot_status["allowed"]:
            return {"success": False, "message": q_slot_status["message"]}

        # Lab posts require body
        if not body or not body.strip():
            return {"success": False, "message": "Question body is required for Lab posts"}
    
    # Posting is free. spend_claves() is a no-op when cost == 0 but we keep the
    # call so anti-abuse (future non-zero pricing) can reuse the same path.
    success, balance = spend_claves(user_id, cost, f"post_{post_type}", db)
    if not success:
        return {
            "success": False,
            "message": f"Unable to post right now. Please try again shortly.",
            "required": cost,
            "balance": balance
        }
    
    # AI Gatekeeper on post content (fail-closed).
    moderation_status = evaluate_post(title=title, body=body)

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
        video_type=video_type if post_type == "stage" else None,
        mux_asset_id=mux_asset_id,
        mux_playback_id=mux_playback_id,
        video_duration_seconds=video_duration_seconds,
        moderation_status=moderation_status,
    )
    db.add(post)

    # Only visible posts count toward tag usage — flagged posts must not
    # inflate channel/trending tag stats.
    if moderation_status == ModerationStatus.ACTIVE.value:
        for tag_slug in valid_tag_slugs:
            db.query(CommunityTag).filter(
                CommunityTag.slug == tag_slug
            ).update({"usage_count": CommunityTag.usage_count + 1})

    db.flush()

    logger.info(f"User {user_id} created {post_type} post {post.id} [moderation={moderation_status}]")

    # Author-friendly message: don't reveal that AI flagged them (shadowban),
    # just acknowledge. Admin queue handles review.
    return {
        "success": True,
        "post": _format_post_response(post, user_id, db),
        "message": "Post created"
    }


_VALID_VIDEO_TYPES = {"motw", "original", "guild"}


def get_feed(
    post_type: str = None,
    tag: str = None,
    tags: List[str] = None,
    video_type: str = None,
    skip: int = 0,
    limit: int = 20,
    current_user_id: str = None,
    db: Session = None
) -> List[dict]:
    """
    Get paginated feed of posts.
    Supports single tag or multi-tag filtering.
    Shadowban: flagged posts are visible only to their author.
    """
    from sqlalchemy import or_ as _or

    query = db.query(Post).filter(Post.is_deleted == False)

    if current_user_id:
        query = query.filter(_or(
            Post.moderation_status == ModerationStatus.ACTIVE.value,
            Post.user_id == current_user_id,
        ))
    else:
        query = query.filter(Post.moderation_status == ModerationStatus.ACTIVE.value)

    if post_type:
        query = query.filter(Post.post_type == post_type)

    if video_type and video_type in _VALID_VIDEO_TYPES:
        # video_type only applies to stage posts; lab posts have it null.
        query = query.filter(Post.video_type == video_type)

    if tags and len(tags) > 0:
        # Multi-tag filter: post must have ANY of the specified tags
        query = query.filter(_or(*[Post.tags.any(t) for t in tags]))
    elif tag:
        query = query.filter(Post.tags.any(tag))

    posts = query.order_by(desc(Post.created_at)).offset(skip).limit(limit).all()
    return _format_posts_bulk(posts, current_user_id, db)


def get_post_detail(
    post_id: str,
    current_user_id: str,
    db: Session
) -> Optional[dict]:
    """
    Get full post detail with replies.
    Shadowban: flagged posts are returned only to their author.
    """
    post = db.query(Post).filter(Post.id == post_id, Post.is_deleted == False).first()
    if not post:
        return None

    if post.moderation_status != ModerationStatus.ACTIVE.value:
        if str(post.user_id) != str(current_user_id or ""):
            return None

    response = _format_post_response(post, current_user_id, db)

    # Reply load is wrapped in try/except so a transient SELECT failure
    # (e.g. mid-deploy when an additive column hasn't propagated to the
    # schema cache yet) degrades gracefully — the post itself still
    # renders with an empty replies list instead of bubbling a 5xx that
    # Railway maps to 502 for the whole modal.
    try:
        replies = db.query(PostReply).filter(
            PostReply.post_id == post_id,
            PostReply.is_deleted == False
        ).order_by(
            desc(PostReply.is_accepted_answer),
            PostReply.created_at
        ).all()

        # Shadowban filter: show flagged/ghosted replies ONLY to their author
        visible_replies = [
            r for r in replies
            if r.moderation_status == ModerationStatus.ACTIVE.value
            or str(r.user_id) == current_user_id
        ]

        # Batch-load reply authors to avoid N+1
        reply_user_ids = list({r.user_id for r in visible_replies})
        reply_users = db.query(User).filter(User.id.in_(reply_user_ids)).options(
            joinedload(User.profile), joinedload(User.subscription)
        ).all() if reply_user_ids else []
        reply_user_map = {str(u.id): u for u in reply_users}

        response["replies"] = [
            _format_reply_response(r, db, user=reply_user_map.get(str(r.user_id)))
            for r in visible_replies
        ]
    except Exception:
        # Roll back any partial state on this connection so the next
        # query starts clean. Surface the error in logs so the operator
        # sees it; client gets the post with no replies, not a 5xx.
        try:
            db.rollback()
        except Exception:
            pass
        logger.exception("get_post_detail: reply load failed for post %s", post_id)
        response["replies"] = []

    return response


def add_reaction(
    post_id: str,
    user_id: str,
    db: Session
) -> dict:
    """
    Like a post. Idempotent — a second call is a no-op.
    """
    post = db.query(Post).filter(Post.id == post_id, Post.is_deleted == False).first()
    if not post:
        return {"success": False, "message": "Post not found"}

    # Prevent self-reaction
    if str(post.user_id) == user_id:
        return {"success": False, "message": "You cannot like your own posts"}

    # Already liked → no-op, report current state
    existing = db.query(PostReaction).filter(
        PostReaction.post_id == post_id,
        PostReaction.user_id == user_id
    ).first()
    if existing:
        return {
            "success": True,
            "message": "Already liked",
            "user_reaction": "like",
            "reaction_count": post.reaction_count,
            "already_reacted": True,
        }

    # Hourly rate limit on new likes
    allowed, info = rate_limit_service.check("reaction", user_id, db)
    if not allowed:
        return {"success": False, "message": info["message"], "rate_limited": True}

    reaction = PostReaction(
        id=uuid.uuid4(),
        post_id=post_id,
        user_id=user_id,
        reaction_type="like",
    )
    db.add(reaction)
    post.reaction_count += 1
    db.flush()

    logger.info(f"User {user_id} liked post {post_id}")
    return {
        "success": True,
        "message": "Liked",
        "user_reaction": "like",
        "reaction_count": post.reaction_count,
        "already_reacted": False,
    }


def remove_reaction(
    post_id: str,
    user_id: str,
    db: Session
) -> dict:
    """
    Unlike a post.

    Decrements the reactor's `reactions_given_count` and the post
    owner's `reactions_received_count` so the Talent Scout and Crowd
    Favorite badge progressions reflect real state. Without this, a
    like/unlike loop would ratchet the counters upward forever and
    let users farm badge thresholds without actually holding likes.
    """
    from models.community import UserStats

    reaction = db.query(PostReaction).filter(
        PostReaction.post_id == post_id,
        PostReaction.user_id == user_id
    ).first()

    if not reaction:
        return {"success": False, "message": "No like to remove"}

    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        post.reaction_count = max(0, post.reaction_count - 1)

    # Reactor: decrement reactions_given_count.
    reactor_stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
    if reactor_stats and reactor_stats.reactions_given_count > 0:
        reactor_stats.reactions_given_count -= 1

    # Post owner: decrement reactions_received_count.
    if post:
        owner_stats = db.query(UserStats).filter(UserStats.user_id == post.user_id).first()
        if owner_stats and owner_stats.reactions_received_count > 0:
            owner_stats.reactions_received_count -= 1

    db.delete(reaction)
    db.flush()

    total = post.reaction_count if post else 0
    return {
        "success": True,
        "message": "Unliked",
        "user_reaction": None,
        "reaction_count": total,
    }


def _resolve_reply_parent(
    parent_reply_id: str,
    post_id: str,
    db: Session,
) -> tuple[bool, str, "str | None"]:
    """Resolve the actual parent_reply_id for a new threaded reply.

    Returns (ok, message, resolved_parent_id). The parent must exist,
    not be soft-deleted, and belong to the same post (prevents
    cross-post nesting via crafted IDs).

    Instagram-style flattening: if the requested parent is itself a
    nested reply, attach the new reply to the thread root instead, so
    every reply-to-reply lands as a sibling under the original
    top-level comment. This caps threading at exactly two visual
    levels regardless of how deep the user clicks Reply.
    """
    parent = db.query(PostReply).filter(
        PostReply.id == parent_reply_id,
        PostReply.is_deleted == False,
    ).first()
    if not parent:
        return (False, "Parent reply not found", None)
    if str(parent.post_id) != str(post_id):
        return (False, "Parent reply belongs to a different post", None)

    # If the target reply has its own parent, attach to that root
    # instead. Verify the root still exists and isn't soft-deleted —
    # if the root was removed, attach to the requested target so the
    # reply doesn't disappear entirely.
    if parent.parent_reply_id is not None:
        root = db.query(PostReply).filter(
            PostReply.id == parent.parent_reply_id,
            PostReply.is_deleted == False,
        ).first()
        if root is not None:
            return (True, "", str(root.id))

    return (True, "", str(parent.id))


def add_reply(
    post_id: str,
    user_id: str,
    content: str,
    mux_asset_id: str = None,
    mux_playback_id: str = None,
    parent_reply_id: str = None,
    db: Session = None
) -> dict:
    """
    Add a reply/comment to a post.
    """
    post = db.query(Post).filter(Post.id == post_id, Post.is_deleted == False).first()
    if not post:
        return {"success": False, "message": "Post not found"}

    # Check feedback_type - "hype" mode disables comments
    if post.feedback_type == "hype":
        return {"success": False, "message": "Comments are disabled on this post (Hype mode)"}

    # Validate the nesting target before we run rate-limits or AI moderation
    # — otherwise a bad parent_reply_id could waste a rate-limit slot.
    # The resolver also flattens replies-to-nested-replies onto the thread
    # root (Instagram pattern), so we always end up with at most one level
    # of nesting per post.
    if parent_reply_id:
        ok, message, resolved_parent_id = _resolve_reply_parent(parent_reply_id, post_id, db)
        if not ok:
            return {"success": False, "message": message}
        parent_reply_id = resolved_parent_id

    # Hourly rate limit.
    allowed, info = rate_limit_service.check("reply", user_id, db)
    if not allowed:
        return {"success": False, "message": info["message"], "rate_limited": True}

    # Commenting is free. spend_claves() is a no-op at cost 0 but we keep it
    # so the same path can gate future pricing or per-user accounting.
    success, balance = spend_claves(user_id, COST_COMMENT, "comment", db, reference_id=str(post_id))
    if not success:
        return {
            "success": False,
            "message": "Unable to post comment right now. Please try again shortly.",
            "required": COST_COMMENT,
            "balance": balance
        }

    # AI Gatekeeper: evaluate reply content before saving
    moderation_status = evaluate_reply(content)

    # Create reply with moderation status
    reply = PostReply(
        id=uuid.uuid4(),
        post_id=post_id,
        user_id=user_id,
        parent_reply_id=parent_reply_id,
        content=content,
        mux_asset_id=mux_asset_id,
        mux_playback_id=mux_playback_id,
        moderation_status=moderation_status,
    )
    db.add(reply)

    # Only count publicly visible replies toward reply_count
    if moderation_status == ModerationStatus.ACTIVE.value:
        post.reply_count += 1

    db.flush()

    logger.info(f"User {user_id} replied to post {post_id} [moderation={moderation_status}]")
    return {
        "success": True,
        "reply": _format_reply_response(reply, db),
        "message": "Comment posted"
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
    post = db.query(Post).filter(Post.id == post_id, Post.is_deleted == False).first()
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
    return {"success": True, "message": "Solution marked! Helper awarded 15 🥢"}


def update_post(
    post_id: str,
    user_id: str,
    title: str = None,
    body: str = None,
    tags: List[str] = None,
    is_wip: bool = None,
    feedback_type: str = None,
    is_admin: bool = False,
    db: Session = None
) -> dict:
    """
    Update an existing post (own posts or admin).
    Returns: {success, post, message} or {success: False, message}
    """
    post = db.query(Post).filter(Post.id == post_id, Post.is_deleted == False).first()
    if not post:
        return {"success": False, "message": "Post not found"}

    # Owner or admin can update
    if str(post.user_id) != user_id and not is_admin:
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
    Soft-delete a post (own posts or admin).
    """
    post = db.query(Post).filter(Post.id == post_id, Post.is_deleted == False).first()
    if not post:
        return {"success": False, "message": "Post not found"}

    try:
        # Check ownership or admin status
        from models.user import User, UserRole

        user = db.query(User).filter(User.id == user_id).first()
        is_admin = False
        if user:
            is_admin = user.role == UserRole.ADMIN

        if str(post.user_id) != user_id and not is_admin:
            return {"success": False, "message": "You can only delete your own posts"}

        # Soft delete
        post.is_deleted = True

        # Decrement tag usage counts so tag stats remain accurate
        for tag_slug in (post.tags or []):
            db.query(CommunityTag).filter(
                CommunityTag.slug == tag_slug
            ).update({"usage_count": CommunityTag.usage_count - 1})

        # Mux asset cleanup: free the video from Mux so we don't pay for orphaned assets.
        # Post's own video.
        if post.mux_asset_id:
            try:
                delete_mux_asset(post.mux_asset_id)
            except Exception:
                logger.exception(f"Failed to delete Mux asset {post.mux_asset_id} for post {post_id}")

        # Cascade: video replies on this post also get their Mux assets released.
        reply_assets = db.query(PostReply.mux_asset_id).filter(
            PostReply.post_id == post_id,
            PostReply.mux_asset_id.isnot(None),
            PostReply.is_deleted == False
        ).all()
        for (asset_id,) in reply_assets:
            try:
                delete_mux_asset(asset_id)
            except Exception:
                logger.exception(f"Failed to delete reply Mux asset {asset_id} for post {post_id}")

        db.flush()

        logger.info(f"User {user_id} (Admin: {is_admin}) soft-deleted post {post_id}")
        return {"success": True, "message": "Post deleted"}

    except Exception as e:
        logger.error(f"Error deleting post {post_id}: {e}", exc_info=True)
        db.rollback()
        return {"success": False, "message": "Server error while deleting post"}


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
    tag: str = None,
    tags: List[str] = None,
    video_type: str = None,
    skip: int = 0,
    limit: int = 20,
    current_user_id: str = None,
    db: Session = None
) -> List[dict]:
    """
    Search posts by title, author username, and/or tags.
    Title and username use ILIKE; also matches if query appears in any tag.
    Additional tag/tags/video_type params narrow results.
    Shadowban: flagged posts are returned only to their author.
    """
    from sqlalchemy import or_
    from models.user import UserProfile

    # Escape ILIKE special characters to prevent wildcard injection
    escaped_query = query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    pattern = f"%{escaped_query}%"

    # Search title OR username (via outer join — keeps posts whose author
    # has no profile row from being silently dropped) OR tag content.
    search_query = (
        db.query(Post)
        .outerjoin(UserProfile, UserProfile.user_id == Post.user_id)
        .filter(
            Post.is_deleted == False,
            or_(
                Post.title.ilike(pattern),
                UserProfile.username.ilike(pattern),
                Post.tags.any(query.lower()),
            ),
        )
    )

    if current_user_id:
        search_query = search_query.filter(or_(
            Post.moderation_status == ModerationStatus.ACTIVE.value,
            Post.user_id == current_user_id,
        ))
    else:
        search_query = search_query.filter(
            Post.moderation_status == ModerationStatus.ACTIVE.value
        )

    if post_type:
        search_query = search_query.filter(Post.post_type == post_type)

    if video_type and video_type in _VALID_VIDEO_TYPES:
        search_query = search_query.filter(Post.video_type == video_type)

    # Additional tag filtering
    if tags and len(tags) > 0:
        search_query = search_query.filter(or_(*[Post.tags.any(t) for t in tags]))
    elif tag:
        search_query = search_query.filter(Post.tags.any(tag))

    # The outer join to user_profiles can dup posts if a user has multiple
    # profile rows (shouldn't happen, but the join could in theory). Use
    # distinct() to be safe.
    posts = (
        search_query
        .distinct(Post.id)
        .order_by(Post.id, desc(Post.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return _format_posts_bulk(posts, current_user_id, db)


def update_reply(
    post_id: str,
    reply_id: str,
    user_id: str,
    content: str,
    is_admin: bool = False,
    db: Session = None
) -> dict:
    """
    Update a reply (owner or admin).
    """
    reply = db.query(PostReply).filter(
        PostReply.id == reply_id,
        PostReply.post_id == post_id,
        PostReply.is_deleted == False
    ).first()
    if not reply:
        return {"success": False, "message": "Reply not found"}

    if str(reply.user_id) != user_id and not is_admin:
        return {"success": False, "message": "You can only edit your own replies"}

    reply.content = content
    db.flush()

    logger.info(f"User {user_id} (admin={is_admin}) updated reply {reply_id}")
    return {
        "success": True,
        "reply": _format_reply_response(reply, db),
        "message": "Reply updated successfully"
    }


def delete_reply(
    post_id: str,
    reply_id: str,
    user_id: str,
    is_admin: bool = False,
    db: Session = None
) -> dict:
    """
    Soft-delete a reply (owner or admin).
    Decrements reply_count and unmarks accepted answer if applicable.
    """
    reply = db.query(PostReply).filter(
        PostReply.id == reply_id,
        PostReply.post_id == post_id,
        PostReply.is_deleted == False
    ).first()
    if not reply:
        return {"success": False, "message": "Reply not found"}

    if str(reply.user_id) != user_id and not is_admin:
        return {"success": False, "message": "You can only delete your own replies"}

    # Soft delete
    reply.is_deleted = True

    # Mux asset cleanup for video replies.
    if reply.mux_asset_id:
        try:
            delete_mux_asset(reply.mux_asset_id)
        except Exception:
            logger.exception(f"Failed to delete Mux asset {reply.mux_asset_id} for reply {reply_id}")

    # Decrement reply count on parent post
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        post.reply_count = max(0, post.reply_count - 1)

        # If this was the accepted answer, unmark it
        if reply.is_accepted_answer:
            reply.is_accepted_answer = False
            post.accepted_answer_id = None
            post.is_solved = False

    db.flush()

    logger.info(f"User {user_id} (admin={is_admin}) soft-deleted reply {reply_id}")
    return {"success": True, "message": "Reply deleted"}
