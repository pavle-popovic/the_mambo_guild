"""
Seed script for the Pachanga Course with skill tree graph structure.

Skill tree layout (3 branches from Basic Pachanga):
  - Left path:   Single Single Double → Walking Pachanga → Kick Tap Chuck → Pachanga Hops → Pachanga Ronde
  - Middle path: History 2 → Charleston Pachanga → Charleston SSD → Pachanga Jump → Pachanga Kicks
  - Right path:  Basic to Pachanga → Pachanga Skip
  - All paths converge at Pachanga Syncopations → Choreo Smooth Criminal (Boss)

Usage:
    docker-compose exec backend python scripts/seed_pachanga_course.py
    OR
    cd backend && python scripts/seed_pachanga_course.py
"""

import sys
import os
import uuid
import logging

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# SKILL TREE DEFINITION
# ============================================================================

COURSE_SLUG = "pachanga"

PACHANGA_NODES = [
    # --- Linear entry path ---
    {"id": "pc_intro",        "title": "Intro",                  "x": 50.0, "y": 95.0, "type": "skill"},
    {"id": "pc_history1",     "title": "History 1",              "x": 50.0, "y": 88.0, "type": "skill"},
    {"id": "pc_bounce",       "title": "Bounce",                 "x": 50.0, "y": 81.0, "type": "skill"},
    {"id": "pc_angles",       "title": "Angles",                 "x": 50.0, "y": 74.0, "type": "skill"},
    {"id": "pc_basic",        "title": "Basic Pachanga",         "x": 50.0, "y": 67.0, "type": "skill"},

    # --- Row 6: three branches ---
    {"id": "pc_ssd",          "title": "Single Single Double",   "x": 20.0, "y": 58.0, "type": "skill"},
    {"id": "pc_history2",     "title": "History 2",              "x": 50.0, "y": 58.0, "type": "skill"},
    {"id": "pc_basic_to_p",   "title": "Basic to Pachanga",      "x": 80.0, "y": 58.0, "type": "skill_track"},

    # --- Row 7 ---
    {"id": "pc_walking",      "title": "Walking Pachanga",       "x": 20.0, "y": 50.0, "type": "skill"},
    {"id": "pc_charleston_p", "title": "Charleston Pachanga",    "x": 50.0, "y": 50.0, "type": "skill"},

    # --- Row 8 ---
    {"id": "pc_kick_tap",     "title": "Kick Tap Chuck",         "x": 20.0, "y": 42.0, "type": "skill"},
    {"id": "pc_charleston_s", "title": "Charleston SSD",         "x": 50.0, "y": 42.0, "type": "skill"},

    # --- Row 9 ---
    {"id": "pc_hops",         "title": "Pachanga Hops",          "x": 20.0, "y": 34.0, "type": "skill"},
    {"id": "pc_jump",         "title": "Pachanga Jump",          "x": 50.0, "y": 34.0, "type": "skill"},
    {"id": "pc_skip",         "title": "Pachanga Skip",          "x": 80.0, "y": 34.0, "type": "skill_track"},

    # --- Row 10 ---
    {"id": "pc_ronde",        "title": "Pachanga Ronde",         "x": 20.0, "y": 26.0, "type": "skill"},
    {"id": "pc_kicks",        "title": "Pachanga Kicks",         "x": 50.0, "y": 26.0, "type": "skill"},

    # --- Row 11: convergence ---
    {"id": "pc_synco",        "title": "Pachanga Syncopations",  "x": 50.0, "y": 16.0, "type": "skill"},

    # --- Row 12: final boss ---
    {"id": "pc_choreo",       "title": "Choreo Smooth Criminal", "x": 50.0, "y": 6.0,  "type": "combo"},
]

PACHANGA_EDGES = [
    # Linear entry path
    ("pc_intro",        "pc_history1"),
    ("pc_history1",     "pc_bounce"),
    ("pc_bounce",       "pc_angles"),
    ("pc_angles",       "pc_basic"),

    # Basic Pachanga → SSD → Walking Pachanga
    ("pc_basic",        "pc_ssd"),
    ("pc_ssd",          "pc_walking"),

    # Basic Pachanga → Charleston Pachanga → Charleston SSD (prerequisite for Charleston SSD)
    ("pc_basic",        "pc_charleston_p"),
    ("pc_charleston_p", "pc_charleston_s"),

    # Walking Pachanga also feeds Charleston SSD
    ("pc_walking",      "pc_charleston_s"),

    # Charleston SSD → Final Boss (short-circuit path)
    ("pc_charleston_s", "pc_choreo"),

    # Walking Pachanga → Kick Tap Chuck
    ("pc_walking",      "pc_kick_tap"),

    # Kick Tap Chuck splits into Hops and Skips
    ("pc_kick_tap",     "pc_hops"),
    ("pc_kick_tap",     "pc_skip"),

    # Skips → Ronde, Jump, and Kicks
    ("pc_skip",         "pc_ronde"),
    ("pc_skip",         "pc_jump"),
    ("pc_skip",         "pc_kicks"),

    # Hops → Kicks
    ("pc_hops",         "pc_kicks"),

    # Ronde → Syncopations
    ("pc_ronde",        "pc_synco"),

    # All leaves (no further outgoing edges) → Final Boss
    ("pc_synco",        "pc_choreo"),
    ("pc_kicks",        "pc_choreo"),
    ("pc_jump",         "pc_choreo"),
    # History 2 and Basic to Pachanga are standalone nodes with no incoming path
    ("pc_history2",     "pc_choreo"),
    ("pc_basic_to_p",   "pc_choreo"),
]

COURSE_OBJECTIVES = [
    "Master the Pachanga Vocabulary: From Basics to Glides",
    "Unlock Speed & Fancy Footwork",
    "Learn the history and culture of pachanga dance and charanga music.",
]

# ============================================================================
# SEED FUNCTION
# ============================================================================

def seed_pachanga_course():
    engine = create_engine(settings.DATABASE_URL, echo=False)

    try:
        with engine.begin() as conn:
            # --- Delete existing course with this slug (idempotent) ---
            logger.info(f"Removing existing course '{COURSE_SLUG}' if present...")
            conn.execute(text("DELETE FROM worlds WHERE slug = :slug"), {"slug": COURSE_SLUG})

            # --- Create World (course) ---
            world_id = str(uuid.uuid4())
            logger.info(f"Creating Pachanga course (id={world_id})...")
            conn.execute(text("""
                INSERT INTO worlds (
                    id, title, description, slug, order_index,
                    is_free, difficulty, is_published, course_type,
                    total_duration_minutes, objectives
                )
                VALUES (
                    :id, :title, :description, :slug, :order_index,
                    :is_free, :difficulty, :is_published, :course_type,
                    0, CAST(:objectives AS jsonb)
                )
            """), {
                "id": world_id,
                "title": "Pachanga",
                "description": (
                    "Master the groove of Pachanga. From the basic bounce and history "
                    "to fancy footwork, Charleston rhythms, and the Smooth Criminal choreo."
                ),
                "slug": COURSE_SLUG,
                "order_index": 4,
                "is_free": False,
                "difficulty": "OPEN",
                "is_published": True,
                "course_type": "course",
                "objectives": __import__("json").dumps(COURSE_OBJECTIVES),
            })

            # --- Create Levels (skill tree nodes) ---
            node_id_map = {}
            for i, node in enumerate(PACHANGA_NODES):
                level_id = str(uuid.uuid4())
                node_id_map[node["id"]] = level_id
                is_boss = node["type"] == "combo"

                conn.execute(text("""
                    INSERT INTO levels (
                        id, world_id, title, order_index,
                        x_position, y_position,
                        duration_minutes, total_xp, status
                    )
                    VALUES (
                        :id, :world_id, :title, :order_index,
                        :x_position, :y_position,
                        0, 100, 'active'
                    )
                """), {
                    "id": level_id,
                    "world_id": world_id,
                    "title": node["title"],
                    "order_index": i + 1,
                    "x_position": node["x"],
                    "y_position": node["y"],
                })

                # Placeholder lesson so the node is clickable in the UI
                conn.execute(text("""
                    INSERT INTO lessons (
                        id, level_id, title, description,
                        video_url, xp_value, order_index,
                        is_boss_battle, duration_minutes, lesson_type
                    )
                    VALUES (
                        :id, :level_id, :title, :description,
                        'https://example.com/placeholder', :xp, 1,
                        :is_boss, 10, 'video'
                    )
                """), {
                    "id": str(uuid.uuid4()),
                    "level_id": level_id,
                    "title": f"Lesson: {node['title']}",
                    "description": f"Content for {node['title']}",
                    "xp": 100 if is_boss else 50,
                    "is_boss": is_boss,
                })

                logger.info(f"  Created node [{i+1:02d}] {node['title']}")

            # --- Create Edges ---
            logger.info("Creating skill tree edges...")
            for from_key, to_key in PACHANGA_EDGES:
                if from_key not in node_id_map or to_key not in node_id_map:
                    logger.warning(f"  Skipping edge {from_key} → {to_key} (node missing)")
                    continue
                conn.execute(text("""
                    INSERT INTO level_edges (id, world_id, from_level_id, to_level_id)
                    VALUES (:id, :world_id, :from_id, :to_id)
                """), {
                    "id": str(uuid.uuid4()),
                    "world_id": world_id,
                    "from_id": node_id_map[from_key],
                    "to_id": node_id_map[to_key],
                })
                logger.info(f"  Edge: {from_key} → {to_key}")

        logger.info("")
        logger.info("=" * 60)
        logger.info("PACHANGA COURSE SEEDED SUCCESSFULLY")
        logger.info("=" * 60)
        logger.info(f"  Nodes : {len(PACHANGA_NODES)}")
        logger.info(f"  Edges : {len(PACHANGA_EDGES)}")
        logger.info(f"  Slug  : {COURSE_SLUG}")

    except Exception as e:
        logger.error(f"Seed failed: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    seed_pachanga_course()
