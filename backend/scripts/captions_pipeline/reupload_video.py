"""
Re-upload pipeline for a single video — for when a lesson video is re-recorded
and needs to replace the existing Mux asset, with all caption work
re-triggered cleanly.

What this does (Mux + DB + state):
  1. Look up the target lesson row in Supabase to discover current
     mux_asset_id (so we can leave the old asset around for safety; you can
     delete it manually after verification).
  2. Create a new Mux Direct Upload, PUT the new MP4 bytes to it, poll until
     the new asset is 'ready', and capture asset_id + playback_id.
  3. Update the lessons row in Supabase: new mux_asset_id, mux_playback_id,
     and (optionally) a fresh passthrough so the caption resolver still maps
     to the right physical filename.
  4. Mark all non-EN locales for this (course_folder, stem) as 'needs_redo'
     in caption_state.json. Optionally also clears the EN slot if you pass
     --invalidate-en (you must regenerate the EN VTT before re-uploading).

What this does NOT do (do these as documented in README.md):
  - Move/rename the new MP4 into d:/MamboGuild/<CourseFolder>/<stem>.mp4.
    The caption resolver expects that path; do this manually before running
    transcribe_videos.py.
  - Re-run Whisper. After running this, run
    `python d:/MamboGuild/caption_cleanup/transcribe_videos.py` (or its
    single-file flavour) to regenerate the EN VTT.
  - Re-run the caption upload to Mux. After translations are done, run
    `python backend/scripts/upload_captions_to_mux.py --execute --only-slug X`.

Usage:
  # By lesson UUID (safest)
  python reupload_video.py --lesson-id <uuid> \
      --new-mp4 D:/MamboGuild/PachangaEdited/PachangaHistory1.mp4 \
      --course-folder PachangaEdited --stem PachangaHistory1

  # Dry-run: do everything except the DB update
  python reupload_video.py --lesson-id <uuid> --new-mp4 ... \
      --course-folder PachangaEdited --stem PachangaHistory1 --dry-run-db

Requires the same env as upload_captions_to_mux.py (DATABASE_URL,
MUX_TOKEN_ID, MUX_TOKEN_SECRET).
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from pathlib import Path
from urllib.parse import urlparse, unquote

import psycopg2
import requests
from dotenv import load_dotenv

import mux_python
from mux_python.rest import ApiException

from build_state import (
    CAPTION_BASE,
    LOCALE_DIRS,
    NON_EN_LOCALES,
    load_state,
    save_state,
)


load_dotenv("C:/Users/pavle/Desktop/salsa_lab_v2/.env")

DATABASE_URL = os.environ["DATABASE_URL"].replace(":6543/", ":5432/")
MUX_TOKEN_ID = os.environ["MUX_TOKEN_ID"]
MUX_TOKEN_SECRET = os.environ["MUX_TOKEN_SECRET"]


def db_connect():
    p = urlparse(DATABASE_URL)
    conn = psycopg2.connect(
        host=p.hostname, port=p.port or 5432,
        dbname=p.path.lstrip("/"),
        user=p.username, password=unquote(p.password or ""),
        sslmode="require", connect_timeout=30,
        options="-c statement_timeout=60000",
    )
    conn.autocommit = True
    return conn


def mux_clients():
    cfg = mux_python.Configuration()
    cfg.username = MUX_TOKEN_ID
    cfg.password = MUX_TOKEN_SECRET
    api = mux_python.ApiClient(cfg)
    uploads = mux_python.DirectUploadsApi(api)
    assets = mux_python.AssetsApi(api)
    return uploads, assets


def create_direct_upload(uploads_api, passthrough: str) -> tuple[str, str]:
    """Create a direct upload + return (upload_id, signed_url)."""
    new_settings = mux_python.CreateAssetRequest(
        playback_policy=[mux_python.PlaybackPolicy.PUBLIC],
        passthrough=passthrough,
        # Smart MP4 helps with downloads if needed
        mp4_support="standard",
    )
    req = mux_python.CreateUploadRequest(
        new_asset_settings=new_settings,
        cors_origin="*",
        timeout=3600,
    )
    resp = uploads_api.create_direct_upload(req)
    return resp.data.id, resp.data.url


def put_mp4(url: str, mp4_path: Path) -> None:
    size = mp4_path.stat().st_size
    print(f"  Uploading {mp4_path.name} ({size/1_000_000:.1f} MB) to Mux...")
    with mp4_path.open("rb") as f:
        r = requests.put(url, data=f,
                         headers={"Content-Type": "application/octet-stream"},
                         timeout=3600)
    r.raise_for_status()


def wait_for_asset(uploads_api, assets_api, upload_id: str,
                   max_wait_sec: int = 1800) -> tuple[str, str]:
    """Poll the direct upload until it has an asset_id, then poll the asset
    until it is 'ready'. Returns (asset_id, playback_id)."""
    deadline = time.time() + max_wait_sec
    asset_id: str | None = None

    print("  Waiting for Mux to register the asset...")
    while time.time() < deadline:
        u = uploads_api.get_direct_upload(upload_id)
        asset_id = u.data.asset_id
        if asset_id:
            break
        if u.data.status in ("errored", "cancelled"):
            sys.exit(f"Direct upload failed: status={u.data.status}")
        time.sleep(3)
    if not asset_id:
        sys.exit("Direct upload never produced an asset_id.")
    print(f"    asset_id = {asset_id}")

    print("  Waiting for asset to become ready...")
    while time.time() < deadline:
        a = assets_api.get_asset(asset_id)
        status = a.data.status
        if status == "ready":
            playbacks = a.data.playback_ids or []
            if not playbacks:
                sys.exit("Asset ready but no playback_ids attached.")
            return asset_id, playbacks[0].id
        if status == "errored":
            sys.exit(f"Asset errored: {a.data.errors}")
        time.sleep(5)
    sys.exit("Timed out waiting for asset to become ready.")


def fetch_lesson(conn, lesson_id: str) -> dict:
    cur = conn.cursor()
    cur.execute(
        """
        SELECT l.id, l.title, l.mux_asset_id, l.mux_playback_id,
               lv.title AS level_title, w.slug AS world_slug
        FROM lessons l
        JOIN levels lv ON l.level_id = lv.id
        JOIN worlds w  ON lv.world_id = w.id
        WHERE l.id = %s
        """,
        (lesson_id,),
    )
    row = cur.fetchone()
    if not row:
        sys.exit(f"No lesson with id {lesson_id}")
    return {
        "id": row[0],
        "title": row[1],
        "mux_asset_id": row[2],
        "mux_playback_id": row[3],
        "level_title": row[4],
        "world_slug": row[5],
    }


def update_lesson_row(conn, lesson_id: str, asset_id: str, playback_id: str) -> None:
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE lessons
        SET mux_asset_id = %s,
            mux_playback_id = %s,
            updated_at = NOW()
        WHERE id = %s
        """,
        (asset_id, playback_id, lesson_id),
    )


def mark_non_en_redo(stem: str, *, invalidate_en: bool) -> int:
    state = load_state()
    entry = state.setdefault("stems", {}).setdefault(stem, {"locales": {}})
    locales = entry.setdefault("locales", {})
    n = 0
    for loc in NON_EN_LOCALES:
        slot = locales.setdefault(loc, {"status": "missing"})
        slot["status"] = "needs_redo"
        slot.pop("translated_mtime", None)
        slot.pop("uploaded", None)
        n += 1
    if invalidate_en:
        en_slot = locales.setdefault("en", {})
        en_slot["status"] = "needs_redo"
        en_slot.pop("translated_mtime", None)
        en_slot.pop("uploaded", None)
    save_state(state)
    return n


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--lesson-id", required=True,
                   help="Supabase lessons.id (UUID) to update.")
    p.add_argument("--new-mp4", required=True,
                   help="Path to the new MP4 file (will be uploaded to Mux).")
    p.add_argument("--course-folder", required=True,
                   help="Course folder name under D:/MamboGuild/, e.g. 'PachangaEdited'.")
    p.add_argument("--stem", required=True,
                   help="Video stem name (without extension) — used to compute "
                        "the caption stem 'CourseFolder__stem'.")
    p.add_argument("--passthrough",
                   help="Override the Mux passthrough. Default: 'reupload:<stem>'.")
    p.add_argument("--dry-run-db", action="store_true",
                   help="Skip the DB UPDATE (still uploads to Mux + marks state).")
    p.add_argument("--invalidate-en", action="store_true",
                   help="Also flag EN as needs_redo (do this if the new MP4 has "
                        "different content and you'll re-transcribe).")
    args = p.parse_args()

    mp4 = Path(args.new_mp4)
    if not mp4.is_file():
        sys.exit(f"New MP4 not found: {mp4}")
    caption_stem = f"{args.course_folder}__{args.stem}"
    state = load_state()
    if caption_stem not in state.get("stems", {}):
        print(f"  WARN: caption stem '{caption_stem}' not currently tracked in state. "
              f"It will be added.")

    print(f"=== Re-upload pipeline ===")
    print(f"  lesson_id     : {args.lesson_id}")
    print(f"  new mp4       : {mp4}")
    print(f"  caption stem  : {caption_stem}")
    print()

    conn = db_connect()
    try:
        lesson = fetch_lesson(conn, args.lesson_id)
    finally:
        # We'll reopen for the update later
        pass
    print(f"  Existing row  : {lesson['title']!r} (world={lesson['world_slug']}, "
          f"level={lesson['level_title']})")
    print(f"  Old asset_id  : {lesson['mux_asset_id']}")
    print(f"  Old playback  : {lesson['mux_playback_id']}")
    print()

    uploads_api, assets_api = mux_clients()
    passthrough = args.passthrough or f"reupload:{args.stem}"
    upload_id, signed_url = create_direct_upload(uploads_api, passthrough)
    put_mp4(signed_url, mp4)
    new_asset_id, new_playback_id = wait_for_asset(uploads_api, assets_api, upload_id)

    print()
    print(f"  New asset_id  : {new_asset_id}")
    print(f"  New playback  : {new_playback_id}")
    print(f"  Passthrough   : {passthrough}")
    print()

    if args.dry_run_db:
        print("  [DRY-RUN-DB] Skipping UPDATE lessons; printing only.")
    else:
        update_lesson_row(conn, args.lesson_id, new_asset_id, new_playback_id)
        print(f"  UPDATED lessons.id={args.lesson_id}")
    conn.close()

    n = mark_non_en_redo(caption_stem, invalidate_en=args.invalidate_en)
    print(f"  Marked {n} non-EN locales as needs_redo for stem '{caption_stem}'."
          + ("  [+EN cleared]" if args.invalidate_en else ""))

    print()
    print("=== Next steps ===")
    print(f"  1. Move/rename the source MP4 into "
          f"d:/MamboGuild/{args.course_folder}/{args.stem}.mp4 "
          f"if it is not already there.")
    print(f"  2. Re-transcribe to refresh the EN VTT:")
    print(f"       python d:/MamboGuild/caption_cleanup/transcribe_videos.py")
    print(f"  3. Re-chunk the new EN VTT:")
    print(f"       python backend/scripts/rechunk_vtt_captions.py --only en")
    print(f"  4. Re-translate (in chat): ask me to 'continue captions for stem {caption_stem}'.")
    print(f"  5. Re-upload caption tracks to Mux:")
    print(f"       python backend/scripts/upload_captions_to_mux.py --execute "
          f"--only-slug {lesson['world_slug']}")


if __name__ == "__main__":
    main()
