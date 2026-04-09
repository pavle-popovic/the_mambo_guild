"""
Bulk thumbnail upload script.
Reads images from a local directory, compresses with Pillow, uploads to R2,
and updates the database thumbnail_url for each course (World) and module (Level).

Usage:
    python scripts/upload_thumbnails.py --input-dir ./generated_thumbnails

Expected directory structure:
    generated_thumbnails/
        courses/
            mambo-101.jpg
            mambo-201.jpg
            mambo-301.jpg
            pachanga.jpg
            bodymovement-mastery.jpg
        modules/
            m101_basic_timing.jpg
            m101_basic_steps_1.jpg
            ... (all module keys without the thumbnails/modules/ prefix)
"""
import sys
import os
import io
import argparse
import logging
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", ".env"))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"))

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import boto3
from PIL import Image
from sqlalchemy import create_engine, text
from config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Compression settings
COURSE_MAX_WIDTH = 1280
COURSE_MAX_HEIGHT = 720
MODULE_MAX_WIDTH = 640
MODULE_MAX_HEIGHT = 360
JPEG_QUALITY = 82  # Good balance of quality vs size


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.AWS_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name="auto",
    )


def compress_image(image_path: str, max_w: int, max_h: int) -> bytes:
    """Open, resize, and compress an image to JPEG bytes."""
    img = Image.open(image_path).convert("RGB")

    # Resize maintaining aspect ratio
    img.thumbnail((max_w, max_h), Image.LANCZOS)

    buffer = io.BytesIO()
    img.save(buffer, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    buffer.seek(0)

    original_size = os.path.getsize(image_path)
    compressed_size = buffer.getbuffer().nbytes
    ratio = (1 - compressed_size / original_size) * 100 if original_size else 0
    logger.info(f"  Compressed {os.path.basename(image_path)}: {original_size//1024}KB -> {compressed_size//1024}KB ({ratio:.0f}% reduction)")

    return buffer.read()


def upload_to_r2(s3, object_key: str, data: bytes):
    """Upload bytes to R2."""
    s3.put_object(
        Bucket=settings.AWS_BUCKET_NAME,
        Key=object_key,
        Body=data,
        ContentType="image/jpeg",
        CacheControl="public, max-age=31536000",  # 1 year cache
    )
    logger.info(f"  Uploaded -> {object_key}")


def get_public_url(object_key: str) -> str:
    domain = settings.R2_PUBLIC_DOMAIN or f"https://{settings.AWS_ENDPOINT_URL}/{settings.AWS_BUCKET_NAME}"
    return f"{domain}/{object_key}"


# ── Module key -> Level title mapping ──
# Used to match filenames to database Level records
MODULE_KEY_TO_TITLE = {
    # Mambo 101 (24 modules)
    "m101_basic_timing": "Basic Timing",
    "m101_basic_steps_1": "Basic Steps 1",
    "m101_basic_step_2": "Basic Step 2",
    "m101_basic_step_3": "Basic Step 3",
    "m101_basic_2": "Basic 2",
    "m101_turns_1": "Turns 1",
    "m101_turns_2": "Turns 2",
    "m101_suzy_q_1": "Suzy Q 1",
    "m101_suzy_q_2": "Suzy Q 2",
    "m101_suzy_q_3": "Suzy Q 3",
    "m101_taps_1": "Taps 1",
    "m101_taps_2": "Taps 2",
    "m101_pattern_1": "Pattern 1",
    "m101_flares_1": "Flares 1",
    "m101_twist_1": "Twist 1",
    "m101_arm_styling_1": "Arm Styling 1",
    "m101_swing_1": "Swing Step 1",
    "m101_swing_2": "Swing Step 2",
    "m101_synco_1": "Syncopation 1",
    "m101_synco_2": "Syncopation 2",
    "m101_combo_1": "COMBO 1",
    "m101_combo_2": "COMBO 2",
    "m101_combo_3": "COMBO 3",
    "m101_combo_4": "COMBO 4",

    # Mambo 201 (23 modules)
    "m201_building_blocks": "Building Blocks",
    "m201_flares_2": "Flares 2",
    "m201_jumps_1": "Jumps 1",
    "m201_suzy_q_4": "Suzy Q 4",
    "m201_turns_3": "Turns 3",
    "m201_turns_4": "Turns 4",
    "m201_angles_1": "Angles 1",
    "m201_angles_2": "Angles 2",
    "m201_body_3": "Bodymovement 3",
    "m201_level_1": "Level 1",
    "m201_ronde_1": "Ronde 1",
    "m201_sync_3": "Syncopation 3",
    "m201_patterns_2": "Patterns 2",
    "m201_hook_1": "Hook 1",
    "m201_style_2": "Styling 2",
    "m201_style_3": "Styling 3",
    "m201_combo_5": "Combo 5",
    "m201_combo_6": "Combo 6",
    "m201_combo_7": "Combo 7",
    "m201_combo_8": "Combo 8",
    "m201_combo_9": "Combo 9",
    "m201_combo_10": "Combo 10",
    "m201_combo_11": "Combo 11",

    # Mambo 301 (21 modules)
    "m301_style_4": "Styling 4",
    "m301_timing_2": "Timing 2",
    "m301_timing_3": "Timing 3",
    "m301_swing_3": "Swing Step 3",
    "m301_taps_3": "Taps 3",
    "m301_synco_5": "Syncopation 5",
    "m301_synco_6": "Syncopation 6",
    "m301_suzy_q_5": "Suzy Q 5",
    "m301_flares_3": "Flares 3",
    "m301_body_5": "Bodymovement 5",
    "m301_twist_3": "Twist 3",
    "m301_angles_3": "Angles 3",
    "m301_level_2": "Level 2",
    "m301_hook_2": "Hook 2",
    "m301_hook_3": "Hook 3",
    "m301_hook_4": "Hook 4",
    "m301_jumps_2": "Jumps 2",
    "m301_combo_12": "Combo 12",
    "m301_combo_13": "Combo 13",
    "m301_combo_14": "Combo 14",
    "m301_combo_15": "Combo 15",

    # Pachanga (18 modules)
    "pc_bounce": "Bounce",
    "pc_angles": "Angles",
    "pc_basic": "Basic Pachanga",
    "pc_ssd": "Single Single Double",
    "pc_history1": "History 1",
    "pc_history2": "History 2",
    "pc_basic_to_p": "Basic to Pachanga",
    "pc_walking": "Walking Pachanga",
    "pc_charleston_p": "Charleston Pachanga",
    "pc_kick_tap": "Kick Tap Chuck",
    "pc_charleston_s": "Charleston SSD",
    "pc_hops": "Pachanga Hops",
    "pc_jump": "Pachanga Jump",
    "pc_skip": "Pachanga Skip",
    "pc_ronde": "Pachanga Ronde",
    "pc_kick": "Pachanga Kick",
    "pc_synco": "Pachanga Syncopation",
    "pc_choreo": "Choreo Smooth Criminal",

    # Bodymovement Mastery (13 modules)
    "bm_shimmy": "Shimmy",
    "bm_shoulders": "Shoulders",
    "bm_bodyroll": "Bodyroll",
    "bm_ribs": "Ribcage",
    "bm_bm1": "Bodymovement 1",
    "bm_despelote": "Despelote",
    "bm_head": "Head",
    "bm_bm2": "Bodymovement 2",
    "bm_arm_wave": "Arm Wave",
    "bm_side_wave": "Side Wave",
    "bm_knees": "Knees",
    "bm_hips": "Hips",
    "bm_bounce": "Bounce",

    # Science & History (20 modules)
    "mh_precursors": "The Precursors - Son, Danzón, Rumba, and the Roots of Cuban Rhythm",
    "mh_big_three": "The Big Three - Machito, Puente, and Rodríguez",
    "mh_palladium_era": "The Palladium Era - The Utopian Melting Pot",
    "mh_palladium_legends": "The Palladium Legends - Inventing New York Style",
    "mh_migration": "Mambo's Migration - From the Tropicana to the Bronx",
    "mh_pachanga": "The Pachanga Fad - The Death of Mambo and the Flute Revolution",
    "mh_barrio": "The Barrio Identity - The Soundtrack of Survival",
    "mh_fania": "The Birth of \"Salsa\" - Fania Records and the Marketing Machine",
    "mh_hustle": "The Hustle Influence - Disco and the Slot",
    "mh_eddie": "Codifying On2 - Eddie Torres and the Modern Syllabus",
    "mh_revival": "The Mambo Revival - The Rise of the Dance Company",
    "mh_vazquez": "The Vazquez Brothers - Setting the Global Standard",
    "mh_la_style": "Los Angeles Style - Flash, Danger, and the Downbeat",
    "mh_torres": "Albert Torres - The Emperor of Salsa",
    "mh_congress": "The Congress Circuit - Building a Global Industry",
    "mh_casino": "Casino Style and Timba - Cuba's Parallel Evolution",
    "mh_dancesport": "Dancesport vs. Social Latin - The Great Divide",
    "mh_youtube": "The Digital Standardization - YouTube and the Death of Regional Style",
    "mh_biomechanics": "Biomechanics of Mambo - The Physics of Fusion",
    "mh_global": "The Global Economy & Identity - Who Owns the Dance?",

    # Training Science (18 modules)
    "ts_cardio": "Train Like a Dancer, Not a Runner — The Right Cardio for Salsa",
    "ts_stop_asking": "Stop Asking If You Got It — Start Asking How",
    "ts_slow_motion": "Slow Motion — The Practice Method That Feels Like Cheating (It Isn't)",
    "ts_scat": "Scat the Beat — Why Talking to Yourself Makes You a Better Dancer",
    "ts_afternoon": "The Afternoon Advantage — When You Train Matters as Much as How",
    "ts_pap": "Post-Activation Potentiation — The 5-Minute Warm-Up Hack That Actually Works",
    "ts_speed": "The Speed Paradox — Go Faster by Making Yourself Smaller",
    "ts_magnesium": "Magnesium — The Mineral That Runs Your Learning Hardware",
    "ts_blind": "Blind Drills — Train Your Hidden Superpower",
    "ts_mirror": "The 67% Mirror Rule — Stop Staring, Start Feeling",
    "ts_feed": "Feed the Machine — Why Under-Eating Is Destroying Your Dancing",
    "ts_sleep": "Sleep Is Your Most Powerful Training Tool — No, Seriously",
    "ts_overspeed": "Overspeed Training — Hack Your Nervous System's Speed Limit",
    "ts_mental": "Mental Rehearsal — The Practice That Costs You Nothing",
    "ts_spacing": "Practice Less, Learn More — The Counterintuitive Science of Spacing",
    "ts_focus": "The Focus Trick — Why Thinking About Your Body Is Wrecking Your Dancing",
    "ts_chunking": "Chunking — How Your Brain Compresses Complexity into Freedom",
    "ts_85_rule": "The 85% Rule — The Cheat Code Hidden in Your Mistakes",

    # Choreographies (single-module courses)
    "choreo_irimo": "Irimo — Full Choreography",
    "choreo_chacha": "ChaChaCha Bruno Mars — Full Choreography",
    "choreo_rebelion": "Rebelion — Full Choreography",
    "choreo_taxista": "Taxista — Full Choreography",
}

# Course slug -> module key prefix (to match modules to their parent course)
COURSE_SLUG_TO_PREFIX = {
    "mambo-101": "m101_",
    "mambo-201": "m201_",
    "mambo-301": "m301_",
    "pachanga": "pc_",
    "bodymovement-mastery": "bm_",
    "mambo-history": "mh_",
    "training-science": "ts_",
    "irimo": "choreo_irimo",
    "chacha-bruno-mars": "choreo_chacha",
    "rebelion": "choreo_rebelion",
    "taxista": "choreo_taxista",
}


def main():
    parser = argparse.ArgumentParser(description="Upload compressed thumbnails to R2 and update DB")
    parser.add_argument("--input-dir", required=True, help="Directory with courses/ and modules/ subdirectories")
    parser.add_argument("--dry-run", action="store_true", help="Preview without uploading or updating DB")
    args = parser.parse_args()

    input_dir = args.input_dir
    courses_dir = os.path.join(input_dir, "courses")
    modules_dir = os.path.join(input_dir, "modules")

    if not os.path.isdir(input_dir):
        logger.error(f"Input directory not found: {input_dir}")
        sys.exit(1)

    s3 = get_s3_client()
    engine = create_engine(settings.DATABASE_URL, echo=False)

    # ── Upload Course Thumbnails ──
    if os.path.isdir(courses_dir):
        logger.info("=== UPLOADING COURSE THUMBNAILS ===")
        for filename in sorted(os.listdir(courses_dir)):
            if not filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                continue
            slug = os.path.splitext(filename)[0]  # e.g., "mambo-101"
            filepath = os.path.join(courses_dir, filename)
            r2_key = f"thumbnails/courses/{slug}.jpg"

            logger.info(f"Processing course: {slug}")
            compressed = compress_image(filepath, COURSE_MAX_WIDTH, COURSE_MAX_HEIGHT)

            if not args.dry_run:
                upload_to_r2(s3, r2_key, compressed)
                public_url = get_public_url(r2_key)

                with engine.begin() as conn:
                    result = conn.execute(
                        text("UPDATE worlds SET thumbnail_url = :url WHERE slug = :slug"),
                        {"url": public_url, "slug": slug},
                    )
                    if result.rowcount:
                        logger.info(f"  DB updated: worlds.thumbnail_url for slug={slug}")
                    else:
                        logger.warning(f"  No world found with slug={slug}")
            else:
                logger.info(f"  [DRY RUN] Would upload {r2_key} and update DB")

    # ── Upload Module Thumbnails ──
    if os.path.isdir(modules_dir):
        logger.info("=== UPLOADING MODULE THUMBNAILS ===")
        for filename in sorted(os.listdir(modules_dir)):
            if not filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                continue
            module_key = os.path.splitext(filename)[0]  # e.g., "m101_basic_timing"
            filepath = os.path.join(modules_dir, filename)
            r2_key = f"thumbnails/modules/{module_key}.jpg"

            title = MODULE_KEY_TO_TITLE.get(module_key)
            if not title:
                logger.warning(f"  Unknown module key: {module_key}, skipping DB update")
                continue

            logger.info(f"Processing module: {module_key} ({title})")
            compressed = compress_image(filepath, MODULE_MAX_WIDTH, MODULE_MAX_HEIGHT)

            if not args.dry_run:
                upload_to_r2(s3, r2_key, compressed)
                public_url = get_public_url(r2_key)

                # Find the correct course to narrow down Level matching
                # (some titles like "Intro" appear in multiple courses)
                course_slug = None
                for slug, prefix in COURSE_SLUG_TO_PREFIX.items():
                    if module_key.startswith(prefix):
                        course_slug = slug
                        break

                with engine.begin() as conn:
                    if course_slug:
                        result = conn.execute(
                            text("""
                                UPDATE levels SET thumbnail_url = :url
                                WHERE title = :title
                                AND world_id = (SELECT id FROM worlds WHERE slug = :slug)
                            """),
                            {"url": public_url, "title": title, "slug": course_slug},
                        )
                    else:
                        result = conn.execute(
                            text("UPDATE levels SET thumbnail_url = :url WHERE title = :title"),
                            {"url": public_url, "title": title},
                        )

                    if result.rowcount:
                        logger.info(f"  DB updated: levels.thumbnail_url for '{title}'")
                    else:
                        logger.warning(f"  No level found with title='{title}' (course={course_slug})")
            else:
                logger.info(f"  [DRY RUN] Would upload {r2_key} and update DB")

    logger.info("=== DONE ===")


if __name__ == "__main__":
    main()
