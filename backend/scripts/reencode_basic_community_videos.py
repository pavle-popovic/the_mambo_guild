"""
Re-encode community videos that were uploaded on Mux's "basic" video_quality
tier (no ABR ladder → stutters on slow networks) into "plus" tier.

Strategy:
  1. Find every Post.mux_asset_id where the asset is on basic.
  2. Create a NEW Mux asset that ingests the OLD asset's HLS stream
     (https://stream.mux.com/{playback_id}.m3u8) with video_quality=plus
     and max_resolution_tier=1080p. Mux supports URL inputs natively.
  3. Wait until the new asset is ready, then swap the post's
     mux_asset_id / mux_playback_id atomically.
  4. Delete the old asset to free Mux storage.

Run from backend/:
    python scripts/reencode_basic_community_videos.py [--dry-run] [--limit N]
"""
import sys
import os
import argparse
import time
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

from models import get_session_local
from models.community import Post
from config import settings


def run(dry_run: bool = False, limit: int | None = None):
    if not settings.MUX_TOKEN_ID or not settings.MUX_TOKEN_SECRET:
        logger.error("MUX credentials missing — abort")
        sys.exit(1)

    from mux_python import (
        AssetsApi, ApiClient, Configuration,
        CreateAssetRequest, InputSettings,
    )
    cfg = Configuration()
    cfg.username = settings.MUX_TOKEN_ID
    cfg.password = settings.MUX_TOKEN_SECRET
    api_client = ApiClient(cfg)
    assets_api = AssetsApi(api_client)

    SessionLocal = get_session_local()
    db = SessionLocal()

    try:
        posts = (
            db.query(Post)
            .filter(
                Post.post_type == "stage",
                Post.mux_asset_id.isnot(None),
                Post.is_deleted == False,
            )
            .order_by(Post.created_at.desc())
            .all()
        )
        logger.info(f"Found {len(posts)} stage posts with assets")

        candidates = []
        for p in posts:
            try:
                a = assets_api.get_asset(p.mux_asset_id).data
            except Exception as e:
                logger.warning(f"  could not fetch asset {p.mux_asset_id} for post {p.id}: {e}")
                continue
            quality = getattr(a, "video_quality", None) or getattr(a, "encoding_tier", None)
            if quality == "basic":
                candidates.append((p, a))

        logger.info(f"{len(candidates)} are on basic tier and need re-encoding")

        if limit is not None:
            candidates = candidates[:limit]
            logger.info(f"--limit applied: processing {len(candidates)}")

        for idx, (post, old_asset) in enumerate(candidates, 1):
            logger.info(f"[{idx}/{len(candidates)}] post={post.id} title={post.title[:40]!r}")
            logger.info(f"  old asset {old_asset.id} (basic) — playback {post.mux_playback_id}")

            if dry_run:
                logger.info("  DRY RUN: would re-encode")
                continue

            input_url = f"https://stream.mux.com/{post.mux_playback_id}.m3u8"
            new_request = CreateAssetRequest(
                input=[InputSettings(url=input_url)],
                playback_policies=["public"],
                video_quality="plus",
                max_resolution_tier="1080p",
                passthrough=old_asset.passthrough,
                meta=old_asset.meta,
            )
            try:
                resp = assets_api.create_asset(new_request)
                new_asset = resp.data
            except Exception as e:
                logger.error(f"  re-encode create FAILED: {e}")
                continue

            logger.info(f"  new asset {new_asset.id} — waiting for ready…")

            # Poll until new asset is ready (max 5 min)
            new_playback_id = None
            deadline = time.time() + 300
            while time.time() < deadline:
                try:
                    fresh = assets_api.get_asset(new_asset.id).data
                except Exception as e:
                    logger.warning(f"  poll error: {e}")
                    time.sleep(5)
                    continue
                if fresh.status == "ready" and fresh.playback_ids:
                    new_playback_id = fresh.playback_ids[0].id
                    break
                if fresh.status == "errored":
                    logger.error(f"  new asset errored — leaving post on old basic asset")
                    break
                time.sleep(5)

            if not new_playback_id:
                logger.warning(f"  re-encode did not finish in time, skipping swap")
                continue

            old_asset_id = post.mux_asset_id
            post.mux_asset_id = new_asset.id
            post.mux_playback_id = new_playback_id
            db.commit()
            logger.info(f"  swapped post {post.id} → new playback {new_playback_id}")

            try:
                assets_api.delete_asset(old_asset_id)
                logger.info(f"  deleted old basic asset {old_asset_id}")
            except Exception as e:
                logger.warning(f"  could not delete old asset (manual cleanup): {e}")

    finally:
        db.close()

    logger.info("Done.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=None,
                        help="Re-encode only the first N candidates (test run)")
    args = parser.parse_args()
    run(dry_run=args.dry_run, limit=args.limit)
