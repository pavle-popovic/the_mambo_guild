"""
Clone the "Choreo Smooth Criminal" boss level from the Pachanga course
into a standalone Advanced, paid, unlisted choreo World titled
"Smooth Criminal (Pachanga)".

Mirrors mux_playback_id / mux_asset_id / content_json / thumbnails
exactly so the new course shares the same Mux video and captions.

Usage:
    docker-compose exec backend python scripts/seed_smooth_criminal_choreo.py
    OR
    cd backend && python scripts/seed_smooth_criminal_choreo.py
"""

import sys
import os
import uuid
import json
import logging

# Load env vars from project root .env (DATABASE_URL points at prod Supabase)
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_PROJECT_ROOT = os.path.dirname(_BACKEND_DIR)
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(_PROJECT_ROOT, ".env"))
except ImportError:
    pass

sys.path.insert(0, _BACKEND_DIR)

from sqlalchemy import create_engine, text
from config import settings

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


SOURCE_COURSE_SLUG = "pachanga"
SOURCE_LEVEL_TITLE = "Choreo Smooth Criminal"

NEW_COURSE_SLUG = "smooth-criminal-pachanga"
NEW_COURSE_TITLE = "Smooth Criminal (Pachanga)"
NEW_COURSE_DESCRIPTION = (
    "A full Pachanga choreography to Michael Jackson's Smooth Criminal. "
    "Fast, sharp, and packed with everything you've drilled in the Pachanga course."
)
# Choreos are a single performance — no learning objectives.
NEW_COURSE_OBJECTIVES: list[str] = []


def seed():
    engine = create_engine(settings.DATABASE_URL, echo=False)

    with engine.begin() as conn:
        # --- Locate source ---
        source_world = conn.execute(
            text("SELECT id, title FROM worlds WHERE slug = :slug"),
            {"slug": SOURCE_COURSE_SLUG},
        ).first()
        if not source_world:
            raise SystemExit(f"Source course '{SOURCE_COURSE_SLUG}' not found.")
        source_world_id = source_world[0]
        logger.info(f"Found source course: {source_world[1]} ({source_world_id})")

        source_level = conn.execute(
            text(
                "SELECT id, title, thumbnail_url, mux_preview_playback_id, "
                "mux_preview_asset_id, outcome, duration_minutes, total_xp "
                "FROM levels WHERE world_id = :world_id AND title = :title"
            ),
            {"world_id": source_world_id, "title": SOURCE_LEVEL_TITLE},
        ).first()
        if not source_level:
            raise SystemExit(
                f"Source level '{SOURCE_LEVEL_TITLE}' not found in '{SOURCE_COURSE_SLUG}'."
            )
        (
            source_level_id,
            source_level_title,
            source_level_thumbnail,
            source_level_preview_playback,
            source_level_preview_asset,
            source_level_outcome,
            source_level_duration,
            source_level_total_xp,
        ) = source_level
        logger.info(f"Found source level: {source_level_title} ({source_level_id})")

        source_lessons = conn.execute(
            text(
                "SELECT id, title, description, video_url, xp_value, order_index, "
                "is_boss_battle, duration_minutes, lesson_type, week_number, "
                "day_number, content_json, mux_playback_id, mux_asset_id, "
                "thumbnail_url "
                "FROM lessons WHERE level_id = :level_id "
                "ORDER BY week_number NULLS FIRST, day_number NULLS FIRST, order_index"
            ),
            {"level_id": source_level_id},
        ).fetchall()
        if not source_lessons:
            raise SystemExit("No lessons found under the source level.")
        logger.info(f"Found {len(source_lessons)} source lesson(s).")

        # --- Clean up any prior clone with the same slug ---
        existing = conn.execute(
            text("SELECT id FROM worlds WHERE slug = :slug"),
            {"slug": NEW_COURSE_SLUG},
        ).first()
        if existing:
            logger.info(f"Removing existing course '{NEW_COURSE_SLUG}' for idempotent reseed.")
            conn.execute(text("DELETE FROM worlds WHERE slug = :slug"), {"slug": NEW_COURSE_SLUG})

        # --- Decide order_index for the new course (max + 1) ---
        max_order = conn.execute(
            text("SELECT COALESCE(MAX(order_index), 0) FROM worlds")
        ).scalar()
        new_order_index = (max_order or 0) + 1

        # Pull source thumbnail for the new course image
        source_world_thumb = conn.execute(
            text("SELECT image_url, thumbnail_url FROM worlds WHERE id = :id"),
            {"id": source_world_id},
        ).first()
        course_image_url = source_level_thumbnail or (source_world_thumb[0] if source_world_thumb else None)
        course_thumbnail_url = source_level_thumbnail or (source_world_thumb[1] if source_world_thumb else None)

        # --- Create new World ---
        new_world_id = str(uuid.uuid4())
        logger.info(f"Creating new course '{NEW_COURSE_TITLE}' (id={new_world_id})...")
        conn.execute(
            text(
                """
                INSERT INTO worlds (
                    id, title, description, slug, order_index,
                    is_free, image_url, thumbnail_url,
                    difficulty, is_published, course_type,
                    total_duration_minutes, objectives
                )
                VALUES (
                    :id, :title, :description, :slug, :order_index,
                    :is_free, :image_url, :thumbnail_url,
                    :difficulty, :is_published, :course_type,
                    :total_duration_minutes, CAST(:objectives AS jsonb)
                )
                """
            ),
            {
                "id": new_world_id,
                "title": NEW_COURSE_TITLE,
                "description": NEW_COURSE_DESCRIPTION,
                "slug": NEW_COURSE_SLUG,
                "order_index": new_order_index,
                "is_free": False,
                "image_url": course_image_url,
                "thumbnail_url": course_thumbnail_url,
                "difficulty": "ADVANCED",
                "is_published": False,  # unlisted
                "course_type": "choreo",
                "total_duration_minutes": source_level_duration or 0,
                "objectives": json.dumps(NEW_COURSE_OBJECTIVES),
            },
        )

        # --- Create single Level mirroring the source ---
        new_level_id = str(uuid.uuid4())
        conn.execute(
            text(
                """
                INSERT INTO levels (
                    id, world_id, title, order_index,
                    x_position, y_position,
                    thumbnail_url, mux_preview_playback_id, mux_preview_asset_id,
                    outcome, duration_minutes, total_xp, status
                )
                VALUES (
                    :id, :world_id, :title, 1,
                    50.0, 50.0,
                    :thumbnail_url, :mux_preview_playback_id, :mux_preview_asset_id,
                    :outcome, :duration_minutes, :total_xp, 'active'
                )
                """
            ),
            {
                "id": new_level_id,
                "world_id": new_world_id,
                "title": NEW_COURSE_TITLE,
                "thumbnail_url": source_level_thumbnail,
                "mux_preview_playback_id": source_level_preview_playback,
                "mux_preview_asset_id": source_level_preview_asset,
                "outcome": source_level_outcome,
                "duration_minutes": source_level_duration or 0,
                "total_xp": source_level_total_xp or 100,
            },
        )

        # --- Clone every lesson ---
        for i, lesson in enumerate(source_lessons, start=1):
            (
                _src_id,
                title,
                description,
                video_url,
                xp_value,
                order_index,
                is_boss_battle,
                duration_minutes,
                lesson_type,
                week_number,
                day_number,
                content_json,
                mux_playback_id,
                mux_asset_id,
                thumbnail_url,
            ) = lesson

            new_lesson_id = str(uuid.uuid4())
            conn.execute(
                text(
                    """
                    INSERT INTO lessons (
                        id, level_id, title, description, video_url,
                        xp_value, order_index, is_boss_battle, duration_minutes,
                        lesson_type, week_number, day_number,
                        content_json, mux_playback_id, mux_asset_id, thumbnail_url
                    )
                    VALUES (
                        :id, :level_id, :title, :description, :video_url,
                        :xp_value, :order_index, :is_boss_battle, :duration_minutes,
                        :lesson_type, :week_number, :day_number,
                        CAST(:content_json AS jsonb), :mux_playback_id, :mux_asset_id, :thumbnail_url
                    )
                    """
                ),
                {
                    "id": new_lesson_id,
                    "level_id": new_level_id,
                    "title": title,
                    "description": description,
                    "video_url": video_url or "",
                    "xp_value": xp_value or 100,
                    "order_index": order_index or i,
                    "is_boss_battle": bool(is_boss_battle),
                    "duration_minutes": duration_minutes,
                    "lesson_type": lesson_type or "video",
                    "week_number": week_number,
                    "day_number": day_number,
                    "content_json": json.dumps(content_json) if content_json is not None else None,
                    "mux_playback_id": mux_playback_id,
                    "mux_asset_id": mux_asset_id,
                    "thumbnail_url": thumbnail_url,
                },
            )
            logger.info(
                f"  Cloned lesson [{i}] '{title}' "
                f"(mux={mux_playback_id or '-'}, type={lesson_type or 'video'})"
            )

        logger.info("")
        logger.info("=" * 60)
        logger.info("SMOOTH CRIMINAL (PACHANGA) CHOREO CREATED")
        logger.info("=" * 60)
        logger.info(f"  World id     : {new_world_id}")
        logger.info(f"  Slug         : {NEW_COURSE_SLUG}")
        logger.info(f"  Difficulty   : ADVANCED")
        logger.info(f"  Free         : False")
        logger.info(f"  Published    : False (unlisted)")
        logger.info(f"  course_type  : choreo")
        logger.info(f"  Lessons      : {len(source_lessons)}")


if __name__ == "__main__":
    seed()
