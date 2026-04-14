"""
Skill-tree access helpers.

Centralizes the read-side prerequisite logic so every endpoint that serves a
lesson applies the same unlock rules. The rules:

- Admins always have full access.
- A level is unlocked only when all its prerequisite levels are 100% complete.
- Levels with no prerequisites are always unlocked.
- A lesson is accessible when its level is unlocked (and subscription allows).
"""

from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session, joinedload

from models.course import Lesson, Level, LevelEdge, World
from models.progress import UserProgress
from models.user import Subscription, SubscriptionStatus, User, UserRole


def compute_level_unlock_map(
    db: Session,
    world: World,
    user: Optional[User],
) -> Dict[str, bool]:
    """
    Return {level_id: is_unlocked} for every level in the given world.

    Mirrors the logic in `get_world_skill_tree` — a level is unlocked when all
    its prerequisite levels are 100% complete. This function does NOT apply an
    admin bypass; callers needing role-based overrides should apply them on top
    of the returned map.
    """
    edges = db.query(LevelEdge).filter(LevelEdge.world_id == world.id).all()

    prerequisites_map: Dict[str, List[str]] = {}
    for edge in edges:
        prerequisites_map.setdefault(str(edge.to_level_id), []).append(
            str(edge.from_level_id)
        )

    completed_lesson_ids: set = set()
    if user:
        all_lesson_ids = [
            str(l.id) for level in world.levels for l in level.lessons
        ]
        if all_lesson_ids:
            rows = (
                db.query(UserProgress.lesson_id)
                .filter(
                    UserProgress.user_id == user.id,
                    UserProgress.is_completed == True,  # noqa: E712
                    UserProgress.lesson_id.in_(all_lesson_ids),
                )
                .all()
            )
            completed_lesson_ids = {str(lid) for (lid,) in rows}

    level_completion_map: Dict[str, float] = {}
    for level in world.levels:
        total = len(level.lessons)
        if total == 0:
            level_completion_map[str(level.id)] = 0.0
        else:
            done = sum(
                1 for lesson in level.lessons if str(lesson.id) in completed_lesson_ids
            )
            level_completion_map[str(level.id)] = (done / total) * 100

    unlocked: Dict[str, bool] = {}

    def resolve(level_id: str) -> bool:
        if level_id in unlocked:
            return unlocked[level_id]
        prereqs = prerequisites_map.get(level_id, [])
        if not prereqs:
            unlocked[level_id] = True
            return True
        all_done = all(
            level_completion_map.get(pid, 0.0) >= 100.0 for pid in prereqs
        )
        unlocked[level_id] = all_done
        return all_done

    for level in world.levels:
        resolve(str(level.id))

    return unlocked


def is_lesson_accessible(
    db: Session,
    lesson: Lesson,
    user: User,
) -> Tuple[bool, Optional[str]]:
    """
    Return (accessible, reason). Reason is one of:
      None          — accessible
      "subscription"— paid world, user not subscribed
      "prerequisites" — level prerequisites not met
    """
    if user.role == UserRole.ADMIN:
        return (True, None)

    level = lesson.level
    world = level.world if level else None
    if not world:
        # No world means we can't reason about access; fail closed.
        return (False, "prerequisites")

    if not world.is_free:
        subscription = (
            db.query(Subscription)
            .filter(Subscription.user_id == user.id)
            .first()
        )
        if not subscription or subscription.status not in (
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.TRIALING,
        ):
            return (False, "subscription")

    # Ensure the world's levels + lessons are loaded for the unlock map.
    # If the caller eager-loaded them this is a no-op.
    if not world.levels or any(not hasattr(lvl, "lessons") for lvl in world.levels):
        world = (
            db.query(World)
            .filter(World.id == world.id)
            .options(joinedload(World.levels).joinedload(Level.lessons))
            .first()
        )

    unlock_map = compute_level_unlock_map(db, world, user)
    if not unlock_map.get(str(lesson.level_id), False):
        return (False, "prerequisites")

    return (True, None)
