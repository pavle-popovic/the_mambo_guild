"""
Read-only consistency checks for skill-tree (Level + LevelEdge) data.

These do NOT mutate anything — they only emit warnings. Run on startup or
on-demand (admin endpoint) to detect mis-seeded prerequisite graphs that can
strand learners (e.g. Pachanga "Bounce" unlocked before "History").

Detected issues:
  1. Self-loop edges (level depends on itself) — covered by an admin endpoint
     guard (see admin_courses.create_edge), this surfaces any pre-existing rows.
  2. Backwards prerequisites — an edge whose `from_level` has a HIGHER
     `order_index` than its `to_level`, indicating the user-visible order
     contradicts the dependency graph.
"""
from __future__ import annotations

import logging
from typing import List, Dict, Any

from sqlalchemy.orm import Session

from models.course import Level, LevelEdge, World

logger = logging.getLogger(__name__)


def find_self_loop_edges(db: Session) -> List[Dict[str, Any]]:
    """Return any LevelEdge rows where from_level_id == to_level_id."""
    rows = db.query(LevelEdge).filter(LevelEdge.from_level_id == LevelEdge.to_level_id).all()
    return [
        {
            "edge_id": str(e.id),
            "world_id": str(e.world_id),
            "level_id": str(e.from_level_id),
        }
        for e in rows
    ]


def find_backwards_prerequisites(db: Session) -> List[Dict[str, Any]]:
    """
    Return edges where the prerequisite has a higher order_index than the
    level it unlocks. The skill tree's user-visible order should match its
    unlock graph; mismatches are a content-data smell.
    """
    edges = db.query(LevelEdge).all()
    if not edges:
        return []

    level_ids = {e.from_level_id for e in edges} | {e.to_level_id for e in edges}
    levels = db.query(Level).filter(Level.id.in_(level_ids)).all()
    level_by_id = {str(l.id): l for l in levels}

    issues: List[Dict[str, Any]] = []
    for e in edges:
        from_lvl = level_by_id.get(str(e.from_level_id))
        to_lvl = level_by_id.get(str(e.to_level_id))
        if not from_lvl or not to_lvl:
            continue
        if from_lvl.order_index > to_lvl.order_index:
            issues.append({
                "edge_id": str(e.id),
                "world_id": str(e.world_id),
                "from_level": {"id": str(from_lvl.id), "title": from_lvl.title, "order_index": from_lvl.order_index},
                "to_level": {"id": str(to_lvl.id), "title": to_lvl.title, "order_index": to_lvl.order_index},
            })
    return issues


def run_startup_sanity_check(db: Session) -> Dict[str, Any]:
    """
    Run all course-graph sanity checks. Returns the same structure that the
    admin endpoint can serve, and writes WARNING logs for any findings so
    they show up in Railway/console output without crashing the boot.
    """
    report = {
        "self_loops": find_self_loop_edges(db),
        "backwards_prerequisites": find_backwards_prerequisites(db),
    }

    if report["self_loops"]:
        logger.warning(
            "[course_validation] %d self-loop edge(s) detected: %s",
            len(report["self_loops"]),
            report["self_loops"],
        )
    if report["backwards_prerequisites"]:
        logger.warning(
            "[course_validation] %d backwards-prerequisite edge(s) detected: %s",
            len(report["backwards_prerequisites"]),
            report["backwards_prerequisites"],
        )

    if not report["self_loops"] and not report["backwards_prerequisites"]:
        logger.info("[course_validation] Skill-tree graph is consistent.")

    return report
