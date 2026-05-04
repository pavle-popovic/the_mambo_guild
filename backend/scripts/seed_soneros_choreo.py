"""Create the Soneros De Bailadores standalone advanced choreo World
(unpublished, paid) with one Level + one Lesson pointing at the Mux
asset already uploaded by _upload_soneros_to_mux.py.
"""

import sys
import os
import uuid
import json
import logging

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

# Set in this run from _upload_soneros_to_mux.py
MUX_ASSET_ID = "wkseiEy5R01fFepeSqNYj7KaU85qbv00bAHzHZITWuSGs"
MUX_PLAYBACK_ID = "V376d6cN2nUIUQKWjkFD02MKODa01pKY7b9C02Y8LkmfSc"
DURATION_MIN = 19  # 1112s -> ~18.5 min, round up

NEW_SLUG = "soneros-de-bailadores"
NEW_TITLE = "Soneros De Bailadores"
LEVEL_TITLE = "Soneros De Bailadores, Full Choreography"
LESSON_TITLE = LEVEL_TITLE

# Unused R2 thumbnail flagged by the user
THUMBNAIL_URL = "https://pub-bad1fce3595144f2bac8492efa3aec64.r2.dev/thumbnails/4fbf8bb9-a88b-4033-b42d-88692b9f9888.webp"


def main():
    engine = create_engine(settings.DATABASE_URL, echo=False)
    with engine.begin() as conn:
        # Idempotent reseed
        existing = conn.execute(
            text("SELECT id FROM worlds WHERE slug = :slug"), {"slug": NEW_SLUG}
        ).first()
        if existing:
            logger.info(f"Removing existing course '{NEW_SLUG}' for reseed.")
            conn.execute(text("DELETE FROM worlds WHERE slug = :slug"), {"slug": NEW_SLUG})

        max_order = conn.execute(text("SELECT COALESCE(MAX(order_index),0) FROM worlds")).scalar() or 0
        new_order = max_order + 1

        new_world_id = str(uuid.uuid4())
        conn.execute(
            text(
                """
                INSERT INTO worlds (
                    id, title, description, slug, order_index,
                    is_free, image_url, thumbnail_url,
                    difficulty, is_published, course_type,
                    total_duration_minutes, objectives
                ) VALUES (
                    :id, :title, :description, :slug, :order_index,
                    :is_free, :image_url, :thumbnail_url,
                    :difficulty, :is_published, :course_type,
                    :duration, CAST(:objectives AS jsonb)
                )
                """
            ),
            {
                "id": new_world_id,
                "title": NEW_TITLE,
                "description": (
                    "An advanced full Pachanga-flavored choreography to "
                    "Soneros de Bailadores. Strong, grounded, and built on "
                    "everything you've drilled in the advanced course."
                ),
                "slug": NEW_SLUG,
                "order_index": new_order,
                "is_free": False,
                "image_url": THUMBNAIL_URL,
                "thumbnail_url": THUMBNAIL_URL,
                "difficulty": "ADVANCED",
                "is_published": False,
                "course_type": "choreo",
                "duration": DURATION_MIN,
                "objectives": json.dumps([]),  # choreo: no learning objectives
            },
        )

        new_level_id = str(uuid.uuid4())
        conn.execute(
            text(
                """
                INSERT INTO levels (
                    id, world_id, title, order_index,
                    x_position, y_position,
                    duration_minutes, total_xp, status
                ) VALUES (
                    :id, :world_id, :title, 1,
                    50.0, 50.0,
                    :duration, 100, 'active'
                )
                """
            ),
            {
                "id": new_level_id,
                "world_id": new_world_id,
                "title": LEVEL_TITLE,
                "duration": DURATION_MIN,
            },
        )

        new_lesson_id = str(uuid.uuid4())
        conn.execute(
            text(
                """
                INSERT INTO lessons (
                    id, level_id, title, description, video_url,
                    xp_value, order_index, is_boss_battle, duration_minutes,
                    lesson_type, mux_playback_id, mux_asset_id
                ) VALUES (
                    :id, :level_id, :title, NULL, '',
                    100, 1, false, :duration,
                    'video', :mux_pb, :mux_asset
                )
                """
            ),
            {
                "id": new_lesson_id,
                "level_id": new_level_id,
                "title": LESSON_TITLE,
                "duration": DURATION_MIN,
                "mux_pb": MUX_PLAYBACK_ID,
                "mux_asset": MUX_ASSET_ID,
            },
        )

        logger.info("=" * 60)
        logger.info("SONEROS DE BAILADORES CHOREO CREATED")
        logger.info("=" * 60)
        logger.info(f"  World id   : {new_world_id}")
        logger.info(f"  Level id   : {new_level_id}")
        logger.info(f"  Lesson id  : {new_lesson_id}")
        logger.info(f"  Slug       : {NEW_SLUG}")
        logger.info(f"  Difficulty : ADVANCED")
        logger.info(f"  Free       : False")
        logger.info(f"  Published  : False (unlisted)")
        logger.info(f"  Mux asset  : {MUX_ASSET_ID}")
        logger.info(f"  Mux pb     : {MUX_PLAYBACK_ID}")


if __name__ == "__main__":
    main()
