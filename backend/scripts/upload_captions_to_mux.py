"""
Upload the re-chunked VTTs (from rechunk_vtt_captions.py) to R2 and attach
them as Mux caption tracks for every Mux asset in every course, in every
available locale.

Runs end-to-end:
  1. Query Supabase for all Mux asset IDs (lessons, level previews, world
     previews) across every video-bearing course.
  2. Resolve each asset to its expected video-stem filename.
  3. For each of 14 locales: delete any existing Mux track of that language,
     re-upload the corresponding _chunked VTT to R2, and create a fresh
     Mux text track.

Safe to re-run: each run fully replaces existing tracks per asset/locale.

Usage:
  python backend/scripts/upload_captions_to_mux.py --dry-run
  python backend/scripts/upload_captions_to_mux.py --execute
  python backend/scripts/upload_captions_to_mux.py --execute --only-slug pachanga
  python backend/scripts/upload_captions_to_mux.py --execute --only-lang en
"""

import argparse
import os
import sys
import time
from pathlib import Path
from urllib.parse import urlparse, unquote

import boto3
import mux_python
import psycopg2
from dotenv import load_dotenv
from mux_python.rest import ApiException

load_dotenv("C:/Users/pavle/Desktop/salsa_lab_v2/.env")

# ── Config ───────────────────────────────────────────────────────────────────
DATABASE_URL = os.environ["DATABASE_URL"].replace(":6543/", ":5432/")
MUX_TOKEN_ID = os.environ["MUX_TOKEN_ID"]
MUX_TOKEN_SECRET = os.environ["MUX_TOKEN_SECRET"]
R2_ENDPOINT = os.environ["AWS_ENDPOINT_URL"]
R2_KEY = os.environ["AWS_ACCESS_KEY_ID"]
R2_SECRET = os.environ["AWS_SECRET_ACCESS_KEY"]
R2_BUCKET = os.environ["AWS_BUCKET_NAME"]
R2_DOMAIN = os.environ["R2_PUBLIC_DOMAIN"].rstrip("/")

MG_BASE = Path("D:/MamboGuild")
CAPTION_BASE = MG_BASE / "caption_cleanup"

# Locale -> (Mux language name, chunked caption dir name)
CAPTION_LANGS = {
    "en": ("English",    "Clean_Captions_chunked"),
    "de": ("German",     "Captions_de_chunked"),
    "es": ("Spanish",    "Captions_es_chunked"),
    "fr": ("French",     "Captions_fr_chunked"),
    "it": ("Italian",    "Captions_it_chunked"),
    "ja": ("Japanese",   "Captions_ja_chunked"),
    "ko": ("Korean",     "Captions_ko_chunked"),
    "nl": ("Dutch",      "Captions_nl_chunked"),
    "pl": ("Polish",     "Captions_pl_chunked"),
    "pt": ("Portuguese", "Captions_pt_chunked"),
    "ru": ("Russian",    "Captions_ru_chunked"),
    "sr": ("Serbian",    "Captions_sr_chunked"),
    "tr": ("Turkish",    "Captions_tr_chunked"),
    "zh": ("Chinese",    "Captions_zh_chunked"),
}

# ── Mapping: world slug + level title -> video folder + stem prefixes ───────
# Keys must match CURRENT DB level titles (post-cleanup: em-dashes replaced,
# suffixes stripped). For each (slug, level_title) we list the file prefixes
# to scan for in the course folder; find_files_by_prefixes then classifies
# files into lessons[] / drills[] / preview by filename suffix.
LEVEL_FILE_MAP = {
    "mambo-101": {
        "Basic Timing":     ("Mambo101Edited", ["Timing_1"]),
        "Basic Steps 1":    ("Mambo101Edited", ["Basic_Step_1"]),
        "Basic Step 2":     ("Mambo101Edited", ["Basic_Step_2"]),
        "Turns 1":          ("Mambo101Edited", ["Turn_1"]),
        "Suzy Q 1":         ("Mambo101Edited", ["SuzyQ_1"]),
        "Turns 2":          ("Mambo101Edited", ["Turn_2"]),
        "COMBO 1":          ("Mambo101Edited", ["Combo_1"]),
        "Taps 1":           ("Mambo101Edited", ["Taps_1"]),
        "Arm Styling 1":    ("Mambo101Edited", ["Styling_1"]),
        "Pattern 1":        ("Mambo101Edited", ["Pattern_1", "Parttern_1"]),
        "Suzy Q 2":         ("Mambo101Edited", ["SuzyQ_2"]),
        "COMBO 2":          ("Mambo101Edited", ["Combo_2"]),
        "Basic Step 3":     ("Mambo101Edited", ["Basic_Step_3"]),
        "Basic Steps 3":    ("Mambo101Edited", ["Basic_Step_3"]),
        "Flares 1":         ("Mambo101Edited", ["Flares_1"]),
        "Twist 1":          ("Mambo101Edited", ["Twist_1"]),
        "Suzy Q 3":         ("Mambo101Edited", ["Suzy_Q_3"]),
        "Taps 2":           ("Mambo101Edited", ["Taps_2"]),
        "COMBO 3":          ("Mambo101Edited", ["Combo_3"]),
        "Swing Step 1":     ("Mambo101Edited", ["Swing_1"]),
        "Syncopation 1":    ("Mambo101Edited", ["Syncopation_1"]),
        "Swing Step 2":     ("Mambo101Edited", ["Swing_2"]),
        "Syncopation 2":    ("Mambo101Edited", ["Syncopation_2"]),
        "COMBO 4":          ("Mambo101Edited", ["Combo_4"]),
    },
    "mambo-201": {
        "Building Blocks":  ("Mambo201Edited", ["Building_blocks_1"]),
        "Flares 2":         ("Mambo201Edited", ["Flares_2"]),
        "Jumps 1":          ("Mambo201Edited", ["Jumps_1"]),
        "Suzy Q 4":         ("Mambo201Edited", ["Suzy_Q_4", "SuzyQ_4"]),
        "Combo 5":          ("Mambo201Edited", ["Combo_5"]),
        "Turns 3":          ("Mambo201Edited", ["Turns_3"]),
        "Angles 1":         ("Mambo201Edited", ["Angles_1"]),
        "Combo 6":          ("Mambo201Edited", ["Combo_6"]),
        "Angles 2":         ("Mambo201Edited", ["Angles_2"]),
        "Bodymovement 3":   ("Mambo201Edited", ["Bodymovement_3"]),
        "Combo 7":          ("Mambo201Edited", ["Combo_7"]),
        "Level 1":          ("Mambo201Edited", ["Levels_1"]),
        "Ronde 1":          ("Mambo201Edited", ["Ronde_1"]),
        "Syncopation 3":    ("Mambo201Edited", ["Syncopation_3", "Syncopations_3"]),
        "Patterns 2":       ("Mambo201Edited", ["Patterns_2"]),
        "Combo 8":          ("Mambo201Edited", ["Combo_8"]),
        "Combo 9":          ("Mambo201Edited", ["Combo_9"]),
        "Turns 4":          ("Mambo201Edited", ["Turn_4"]),
        "Styling 2":        ("Mambo201Edited", ["Styling_2"]),
        "Styling 3":        ("Mambo201Edited", ["Styling_3"]),
        "Hook 1":           ("Mambo201Edited", ["Hook_1"]),
        "Combo 10":         ("Mambo201Edited", ["Combo_10"]),
        "Combo 11":         ("Mambo201Edited", ["Combo_11"]),
    },
    "mambo-301": {
        "Styling 4":        ("Mambo301Edited", ["Styling_4"]),
        "Timing 2":         ("Mambo301Edited", ["Timing_2"]),
        "Swing Step 3":     ("Mambo301Edited", ["Swing_Step_3"]),
        "Taps 3":           ("Mambo301Edited", ["Taps_3"]),
        "Combo 12":         ("Mambo301Edited", ["Combo_12"]),
        "Bodymovement 5":   ("Mambo301Edited", ["Bodymovement_5"]),
        "Timing 3":         ("Mambo301Edited", ["Timing_3"]),
        "Syncopation 5":    ("Mambo301Edited", ["Syncopations_5"]),
        "Syncopation 6":    ("Mambo301Edited", ["Syncopations_6"]),
        "Suzy Q 5":         ("Mambo301Edited", ["SuzyQ_5"]),
        "Combo 13":         ("Mambo301Edited", ["Combo_13"]),
        "Flares 3":         ("Mambo301Edited", ["Flares_3"]),
        "Twist 3":          ("Mambo301Edited", ["Twists_3"]),
        "Angles 3":         ("Mambo301Edited", ["Angles_3"]),
        "Level 2":          ("Mambo301Edited", ["Level_2", "Levels_2"]),
        "Combo 14":         ("Mambo301Edited", ["Combo_14"]),
        "Hook 2":           ("Mambo301Edited", ["Hook_2"]),
        "Hook 3":           ("Mambo301Edited", ["Hook_3"]),
        "Jumps 2":          ("Mambo301Edited", ["Jumps_2"]),
        "Combo 15":         ("Mambo301Edited", ["Combo_15"]),
    },
    "pachanga": {
        "History 1":              ("PachangaEdited", ["PachangaHistory1"]),
        "Bounce":                 ("PachangaEdited", ["Foundamentals_Bounce"]),
        "Angles":                 ("PachangaEdited", ["Foundamentals_Angles"]),
        "Basic Pachanga":         ("PachangaEdited", ["Pachanga_Basic"]),
        "Single Single Double":   ("PachangaEdited", ["Single_Single_Double"]),
        "History 2":              ("PachangaEdited", ["PachangaHistory2"]),
        "Basic to Pachanga":      ("PachangaEdited", ["Basic_to_Pachanga"]),
        "Walking Pachanga":       ("PachangaEdited", ["Walking_Pachanga"]),
        "Charleston Pachanga":    ("PachangaEdited", ["Charleston_Pachanga"]),
        "Kick Tap Chuck":         ("PachangaEdited", ["Kick_Brush_Chuck"]),
        "Charleston SSD":         ("PachangaEdited", ["SSD_Charleston"]),
        "Pachanga Hops":          ("PachangaEdited", ["Pachanga_Hops"]),
        "Pachanga Jump":          ("PachangaEdited", ["Pachanga_Jumps"]),
        "Pachanga Skip":          ("PachangaEdited", ["Pachanga_Skips"]),
        "Pachanga Ronde":         ("PachangaEdited", ["Ronde_Pachanga"]),
        "Pachanga Kick":          ("PachangaEdited", ["Pachanga_Kick"]),
        "Pachanga Syncopation":   ("PachangaEdited", ["Syncopated_Pachanga"]),
        "Choreo Smooth Criminal": ("PachangaEdited", ["Smooth_Criminal"]),
    },
    "bodymovement-mastery": {
        "Head":           ("BodymovementsEdited", ["Head"]),
        "Shoulders":      ("BodymovementsEdited", ["Shoulder"]),
        "Ribcage":        ("BodymovementsEdited", ["Ribcage"]),
        "Hips":           ("BodymovementsEdited", ["Hips"]),
        "Knees":          ("BodymovementsEdited", ["Knee"]),
        "Bodymovement 1": ("BodymovementsEdited", ["Bodymovement_1"]),
        "Bounce":         ("BodymovementsEdited", ["Bounce"]),
        "Bodymovement 2": ("BodymovementsEdited", ["Bodymovement_2"]),
        "Arm Wave":       ("BodymovementsEdited", ["Arm_Wave"]),
        "Bodyroll":       ("BodymovementsEdited", ["Bodyroll"]),
        "Side Wave":      ("BodymovementsEdited", ["Sidewave"]),
        "Shimmy":         ("BodymovementsEdited", ["Shimmy"]),
        "Despelote":      ("BodymovementsEdited", ["Despelote"]),
    },
}

# World preview assets (the hero video on each course landing page)
WORLD_INTRO = {
    "mambo-101":            ("Mambo101Edited",      "IntroMambo101"),
    "mambo-201":            ("Mambo201Edited",      "IntroMambo201"),
    "mambo-301":            ("Mambo301Edited",      "IntroMambo301"),
    "pachanga":             ("PachangaEdited",      "IntroPachanga"),
    "bodymovement-mastery": ("BodymovementsEdited", "IntroBodymovement"),
    "irimo":                ("IrimoEdited",         "Irimo_Demo"),
    "rebelion":             ("RebelionEdited",      "Rebelion_Demo"),
    "taxista":              ("TaxistaEdited",       "TaxistaDemo"),
}

# Choreographies have a single Lesson + a single Preview — simpler than mapped courses.
# Mapping: (world_slug, level_title) -> (course_folder, lesson_stem, preview_stem)
CHOREO_ASSETS = {
    ("chacha-bruno-mars", "ChaChaCha Bruno Mars, Full Choreography"):
        ("BrunoMarsEdited", "ChaChaChaBrunoMarsDanceLesson", None),
    ("irimo", "Irimo, Full Choreography"):
        ("IrimoEdited", "Irimo_Lesson", "Irimo_Preview"),
    ("rebelion", "Rebelion, Full Choreography"):
        ("RebelionEdited", "Rebelion_Lesson", "Rebelion_Preview"),
    ("taxista", "Taxista, Full Choreography"):
        ("TaxistaEdited", "Taxista_Lesson", "Taxista_Preview"),
}

VIDEO_EXTS = {".mp4", ".mov", ".wav", ".MP4", ".MOV", ".WAV"}

# Per-lesson title overrides for cases where a lesson lives in a level
# whose LEVEL_FILE_MAP prefixes don't match the actual video file (e.g.
# the whole-course intro videos sit inside the first content level).
# Without these, stem_from_passthrough's idx=0 fallback would attach the
# level's first lesson VTT to the intro asset.
# Keys: (world_slug, lesson_title).  Values: (course_folder, stem).
LESSON_TITLE_OVERRIDES = {
    ("mambo-101", "Intro to Mambo 101"): ("Mambo101Edited", "IntroMambo101"),
    ("mambo-201", "Intro to Mambo 201"): ("Mambo201Edited", "IntroMambo201"),
    ("mambo-301", "Intro to Mambo 301"): ("Mambo301Edited", "IntroMambo301"),
}


def db_connect():
    p = urlparse(DATABASE_URL)
    conn = psycopg2.connect(
        host=p.hostname, port=p.port or 5432,
        dbname=p.path.lstrip('/'),
        user=p.username, password=unquote(p.password or ""),
        sslmode="require", connect_timeout=30,
        options="-c statement_timeout=60000",
    )
    conn.autocommit = True
    return conn


def find_files_by_prefixes(course_folder: str, prefixes: list) -> dict:
    folder = MG_BASE / course_folder
    if not folder.exists():
        return {"lessons": [], "drills": [], "preview": None}

    all_files = sorted(
        f for f in folder.iterdir()
        if f.suffix.lower() in VIDEO_EXTS
        and any(f.stem.startswith(p) for p in prefixes)
    )

    def is_lesson(stem: str) -> bool:
        # Standard lesson markers, plus the "Lessonn" typo for Bodymovement_5_Lessonn_2.
        return ("_Lesson_" in stem
                or "_Lessonn_" in stem
                or stem.endswith("_Lesson")
                or stem.endswith("_Lessonn"))

    def is_drill(stem: str) -> bool:
        return "_Drill" in stem

    def is_preview(stem: str) -> bool:
        return "_Preview" in stem or "_Preveiw" in stem  # typo in Bodymovement_2_Preveiw

    lessons = sorted(f for f in all_files if is_lesson(f.stem))
    drills = sorted(f for f in all_files if is_drill(f.stem))
    prev = next((f for f in all_files if is_preview(f.stem)), None)
    # Standalone files with none of the markers (e.g. PachangaHistory1.mp4).
    bare = sorted(
        f for f in all_files
        if not is_lesson(f.stem) and not is_drill(f.stem) and not is_preview(f.stem)
    )
    # Treat bare files as lessons; appended AFTER marker-classified lessons so
    # `Foo_Lesson_1` always wins over a bare `Foo` with the same prefix.
    lessons = lessons + bare
    return {"lessons": lessons, "drills": drills, "preview": prev}


def stem_from_passthrough(passthrough: str, level_title: str, world_slug: str, lesson_title: str = ""):
    # Highest priority: a per-lesson override pinning a (slug, title) to a
    # specific (folder, stem). Used for whole-course intros that don't follow
    # the parent level's prefix convention.
    override = LESSON_TITLE_OVERRIDES.get((world_slug, lesson_title))
    if override:
        return override

    mapping = LEVEL_FILE_MAP.get(world_slug, {}).get(level_title)
    if not mapping:
        return None
    course_folder, prefixes = mapping
    files = find_files_by_prefixes(course_folder, prefixes)

    parts = passthrough.split(":")
    kind = parts[0] if parts else ""

    # Some assets were re-uploaded with passthrough `reupload:<stem>`.
    if kind == "reupload" and len(parts) >= 2 and parts[1]:
        return (course_folder, parts[1])

    # `lesson:<id>:<stem>` with a non-numeric stem is an explicit pin (e.g.
    # `lesson:uuid:Basic_Step_1_Drill_1`). Honor it when the named video
    # actually exists in the course folder; otherwise fall through to the
    # legacy idx=0 behavior.
    if kind == "lesson" and len(parts) >= 3 and parts[2] and not parts[2].isdigit():
        explicit_stem = parts[2]
        course_dir = MG_BASE / course_folder
        if course_dir.exists() and any(
            f.is_file()
            and f.stem == explicit_stem
            and f.suffix.lower() in {ext.lower() for ext in VIDEO_EXTS}
            for f in course_dir.iterdir()
        ):
            return (course_folder, explicit_stem)

    if kind == "lesson":
        idx = int(parts[2]) - 1 if len(parts) >= 3 and parts[2].isdigit() else 0
        lessons, drills = files["lessons"], files["drills"]
        if idx < len(lessons):
            return (course_folder, lessons[idx].stem)
        # Some drill assets were uploaded as `lesson:id:N` past the last lesson.
        # Fall back to drills; duplicate drill DB entries (same source, two
        # Mux uploads) map to the same physical drill file.
        if drills:
            drill_idx = max(0, min(idx - len(lessons), len(drills) - 1))
            return (course_folder, drills[drill_idx].stem)
        return None
    if kind == "drill":
        idx = int(parts[2]) - 1 if len(parts) >= 3 and parts[2].isdigit() else 0
        arr = files["drills"]
        return (course_folder, arr[idx].stem) if idx < len(arr) else None
    if kind == "preview":
        f = files["preview"]
        return (course_folder, f.stem) if f else None

    return None


def upload_tracks(assets_api, s3, asset_id, course_folder, stem, label, langs, dry_run):
    """Delete existing tracks per lang, upload chunked VTT to R2, create new tracks."""
    try:
        asset = assets_api.get_asset(asset_id)
    except ApiException as e:
        print(f"  [{label}] ERROR fetching asset: {e}")
        return 0

    existing = {t.language_code: t.id for t in (asset.data.tracks or []) if t.type == "text"}
    updated = 0

    for lang in langs:
        lang_name, caption_folder = CAPTION_LANGS[lang]
        vtt_path = CAPTION_BASE / caption_folder / f"{course_folder}__{stem}.vtt"
        if not vtt_path.exists():
            # still OK for non-EN (translation may not exist yet); only log for EN
            if lang == "en":
                print(f"  [{label}] [{lang}] local VTT not found: {vtt_path.name}")
            continue

        r2_key = f"captions/{lang}/{course_folder}__{stem}.vtt"
        r2_url = f"{R2_DOMAIN}/{r2_key}"

        if dry_run:
            updated += 1
            continue

        old_track_id = existing.get(lang)
        if old_track_id:
            try:
                assets_api.delete_asset_track(asset_id, old_track_id)
                time.sleep(0.2)
            except ApiException as e:
                print(f"  [{label}] [{lang}] delete failed: {e}")
                continue

        try:
            s3.upload_file(str(vtt_path), R2_BUCKET, r2_key,
                           ExtraArgs={"ContentType": "text/vtt"})
        except Exception as e:
            print(f"  [{label}] [{lang}] R2 upload failed: {e}")
            continue

        tr = mux_python.CreateTrackRequest(
            url=r2_url, type="text", text_type="subtitles",
            language_code=lang, name=lang_name,
            closed_captions=(lang == "en"),
            passthrough=lang,
        )
        try:
            assets_api.create_asset_track(asset_id, tr)
            updated += 1
        except ApiException as e:
            print(f"  [{label}] [{lang}] create_track failed: {e}")

        time.sleep(0.2)

    return updated


def main():
    p = argparse.ArgumentParser(description=__doc__)
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--dry-run", action="store_true")
    g.add_argument("--execute", action="store_true")
    p.add_argument("--only-slug", help="Limit to one world slug (e.g. 'pachanga')")
    p.add_argument("--only-lang", help="Limit to one locale (e.g. 'en')")
    p.add_argument("--skip-world-previews", action="store_true")
    p.add_argument("--skip-level-previews", action="store_true")
    p.add_argument("--skip-lessons", action="store_true")
    args = p.parse_args()

    langs = list(CAPTION_LANGS.keys())
    if args.only_lang:
        if args.only_lang not in CAPTION_LANGS:
            print(f"Unknown locale: {args.only_lang}")
            sys.exit(2)
        langs = [args.only_lang]

    mux_cfg = mux_python.Configuration()
    mux_cfg.username = MUX_TOKEN_ID
    mux_cfg.password = MUX_TOKEN_SECRET
    assets_api = mux_python.AssetsApi(mux_python.ApiClient(mux_cfg))
    s3 = boto3.client("s3", endpoint_url=R2_ENDPOINT,
                      aws_access_key_id=R2_KEY, aws_secret_access_key=R2_SECRET)

    conn = db_connect()
    cur = conn.cursor()

    slug_filter = "AND w.slug = %s" if args.only_slug else ""
    slug_params = (args.only_slug,) if args.only_slug else ()

    # ── Lesson assets ────────────────────────────────────────────────────────
    cur.execute(f"""
        SELECT l.mux_asset_id, lv.title, w.slug, l.title
        FROM lessons l
        JOIN levels lv ON l.level_id = lv.id
        JOIN worlds w  ON lv.world_id = w.id
        WHERE l.mux_asset_id IS NOT NULL AND l.mux_asset_id != ''
              {slug_filter}
        ORDER BY w.slug, lv.order_index, l.order_index
    """, slug_params)
    lesson_rows = cur.fetchall()

    cur.execute(f"""
        SELECT lv.mux_preview_asset_id, lv.title, w.slug
        FROM levels lv
        JOIN worlds w ON lv.world_id = w.id
        WHERE lv.mux_preview_asset_id IS NOT NULL
              AND lv.mux_preview_asset_id != ''
              AND lv.mux_preview_asset_id NOT LIKE 'placeholder%%'
              AND lv.mux_preview_asset_id NOT LIKE 'pending%%'
              {slug_filter}
        ORDER BY w.slug, lv.order_index
    """, slug_params)
    preview_rows = cur.fetchall()

    cur.execute(f"""
        SELECT mux_preview_asset_id, title, slug
        FROM worlds w
        WHERE mux_preview_asset_id IS NOT NULL AND mux_preview_asset_id != ''
              {slug_filter.replace('w.slug','slug')}
        ORDER BY slug
    """, slug_params)
    world_rows = cur.fetchall()
    conn.close()

    print(f"\n=== Caption Upload: {'DRY-RUN' if args.dry_run else 'EXECUTE'} ===")
    print(f"  Locales : {langs}")
    print(f"  Lessons : {len(lesson_rows)}")
    print(f"  Previews: {len(preview_rows)}")
    print(f"  Worlds  : {len(world_rows)}\n")

    total_updated = 0
    skipped = []

    # ── Lesson assets ────────────────────────────────────────────────────────
    if not args.skip_lessons:
        print("── Lessons ──")
        for asset_id, level_title, slug, lesson_title in lesson_rows:
            # Choreo courses: use direct hardcoded mapping
            choreo = CHOREO_ASSETS.get((slug, level_title))
            if choreo:
                course_folder, lesson_stem, _ = choreo
                stem = lesson_stem
            else:
                try:
                    a = assets_api.get_asset(asset_id)
                    pt = a.data.passthrough or ""
                except Exception:
                    pt = ""
                res = stem_from_passthrough(pt, level_title, slug, lesson_title)
                if not res:
                    skipped.append((slug, level_title, lesson_title, "no stem"))
                    continue
                course_folder, stem = res

            label = f"{slug}/{lesson_title}"[:60]
            print(f"  {label}")
            n = upload_tracks(assets_api, s3, asset_id, course_folder, stem, label, langs, args.dry_run)
            total_updated += n
            if n:
                print(f"    -> {n} tracks")
            time.sleep(0.3)

    # ── Level previews ───────────────────────────────────────────────────────
    if not args.skip_level_previews:
        print("\n── Level previews ──")
        for asset_id, level_title, slug in preview_rows:
            choreo = CHOREO_ASSETS.get((slug, level_title))
            if choreo:
                course_folder, _, preview_stem = choreo
                if not preview_stem:
                    continue
                stem = preview_stem
            else:
                try:
                    a = assets_api.get_asset(asset_id)
                    pt = a.data.passthrough or "preview:"
                except Exception:
                    pt = "preview:"
                res = stem_from_passthrough(pt, level_title, slug)
                if not res:
                    mapping = LEVEL_FILE_MAP.get(slug, {}).get(level_title)
                    if mapping:
                        files = find_files_by_prefixes(mapping[0], mapping[1])
                        if files["preview"]:
                            res = (mapping[0], files["preview"].stem)
                if not res:
                    skipped.append((slug, level_title, "[preview]", "no stem"))
                    continue
                course_folder, stem = res

            label = f"{slug}/{level_title} [preview]"[:60]
            print(f"  {label}")
            n = upload_tracks(assets_api, s3, asset_id, course_folder, stem, label, langs, args.dry_run)
            total_updated += n
            if n:
                print(f"    -> {n} tracks")
            time.sleep(0.3)

    # ── World previews ───────────────────────────────────────────────────────
    if not args.skip_world_previews:
        print("\n── World previews ──")
        for asset_id, world_title, slug in world_rows:
            intro = WORLD_INTRO.get(slug)
            if not intro:
                skipped.append((slug, "[world]", world_title, "no intro map"))
                continue
            course_folder, stem = intro
            label = f"{slug} [world preview]"[:60]
            print(f"  {label}")
            n = upload_tracks(assets_api, s3, asset_id, course_folder, stem, label, langs, args.dry_run)
            total_updated += n
            if n:
                print(f"    -> {n} tracks")
            time.sleep(0.3)

    print("\n" + "=" * 60)
    print(f"Total tracks {'would be ' if args.dry_run else ''}updated: {total_updated}")
    if skipped:
        print(f"\nSKIPPED ({len(skipped)}):")
        for row in skipped[:30]:
            print(f"  {row}")
        if len(skipped) > 30:
            print(f"  ... and {len(skipped) - 30} more")


if __name__ == "__main__":
    main()
