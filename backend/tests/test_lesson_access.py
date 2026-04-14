"""
Unit tests for skill_tree_access — the module that gates lesson access by
prerequisite completion. These tests use MagicMock sessions to keep the suite
runnable without a live DB.
"""

from types import SimpleNamespace
from unittest.mock import MagicMock

from models.user import UserRole, SubscriptionStatus
from services.skill_tree_access import (
    compute_level_unlock_map,
    is_lesson_accessible,
)


def _make_lesson(lesson_id: str):
    return SimpleNamespace(id=lesson_id)


def _make_level(level_id: str, lessons):
    return SimpleNamespace(id=level_id, lessons=lessons)


def _make_world(world_id: str, levels, is_free=True):
    return SimpleNamespace(id=world_id, levels=levels, is_free=is_free)


def _make_user(user_id: str = "u1", role=UserRole.STUDENT):
    return SimpleNamespace(id=user_id, role=role)


def _make_edge(world_id: str, from_id: str, to_id: str):
    return SimpleNamespace(
        id=f"{from_id}->{to_id}",
        world_id=world_id,
        from_level_id=from_id,
        to_level_id=to_id,
    )


def _session_for(edges, completed_lesson_ids):
    """Build a MagicMock Session that returns edges for LevelEdge queries and
    a list of completed lesson tuples for UserProgress queries."""
    db = MagicMock()

    def query(model):
        q = MagicMock()
        model_name = getattr(model, "__name__", str(model))
        if "LevelEdge" in model_name:
            q.filter.return_value.all.return_value = edges
        else:
            q.filter.return_value.all.return_value = [
                (lid,) for lid in completed_lesson_ids
            ]
        return q

    db.query.side_effect = query
    return db


def test_unlock_map_no_prerequisites_all_unlocked():
    l1 = _make_level("L1", [_make_lesson("les1")])
    l2 = _make_level("L2", [_make_lesson("les2")])
    world = _make_world("W1", [l1, l2])
    user = _make_user()
    db = _session_for(edges=[], completed_lesson_ids=[])

    unlocked = compute_level_unlock_map(db, world, user)
    assert unlocked == {"L1": True, "L2": True}


def test_unlock_map_locks_downstream_until_prereq_complete():
    l1 = _make_level("L1", [_make_lesson("les1")])
    l2 = _make_level("L2", [_make_lesson("les2")])
    world = _make_world("W1", [l1, l2])
    user = _make_user()
    edges = [_make_edge("W1", "L1", "L2")]

    # L1 not complete → L2 locked
    db = _session_for(edges=edges, completed_lesson_ids=[])
    unlocked = compute_level_unlock_map(db, world, user)
    assert unlocked == {"L1": True, "L2": False}

    # L1 complete → L2 unlocked
    db = _session_for(edges=edges, completed_lesson_ids=["les1"])
    unlocked = compute_level_unlock_map(db, world, user)
    assert unlocked == {"L1": True, "L2": True}


def test_is_lesson_accessible_admin_always_true():
    lesson = SimpleNamespace(
        id="x",
        level_id="L2",
        level=SimpleNamespace(
            id="L2",
            world=SimpleNamespace(id="W1", is_free=False, levels=[]),
        ),
    )
    admin = _make_user(role=UserRole.ADMIN)
    db = MagicMock()

    accessible, reason = is_lesson_accessible(db, lesson, admin)
    assert accessible is True
    assert reason is None


def test_is_lesson_accessible_blocks_on_missing_prereq():
    les1 = _make_lesson("les1")
    les2 = _make_lesson("les2")
    l1 = _make_level("L1", [les1])
    l2 = _make_level("L2", [les2])
    world = _make_world("W1", [l1, l2], is_free=True)
    # Wire lesson → level → world
    les2_detail = SimpleNamespace(
        id="les2",
        level_id="L2",
        level=SimpleNamespace(id="L2", world=world),
    )
    # level stub also needs a lessons attribute for the reload path; ensure
    # world.levels is truthy so no reload query runs.
    user = _make_user()
    db = _session_for(
        edges=[_make_edge("W1", "L1", "L2")],
        completed_lesson_ids=[],
    )

    accessible, reason = is_lesson_accessible(db, les2_detail, user)
    assert accessible is False
    assert reason == "prerequisites"


def test_is_lesson_accessible_subscription_block_on_paid_world():
    les1 = _make_lesson("les1")
    l1 = _make_level("L1", [les1])
    world = _make_world("W1", [l1], is_free=False)
    lesson = SimpleNamespace(
        id="les1",
        level_id="L1",
        level=SimpleNamespace(id="L1", world=world),
    )
    user = _make_user()

    db = MagicMock()
    # No subscription row → first() returns None
    sub_query = MagicMock()
    sub_query.filter.return_value.first.return_value = None
    db.query.return_value = sub_query

    accessible, reason = is_lesson_accessible(db, lesson, user)
    assert accessible is False
    assert reason == "subscription"
