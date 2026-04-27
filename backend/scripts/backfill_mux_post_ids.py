"""
Recovery script: link Mux assets back to community posts that have NULL mux IDs.

Root cause: the frontend polls check-upload-status for 60s max. If Mux takes longer
to transcode, the post is left with mux_asset_id=NULL and the video never plays.
The webhook is the backup but appears to be failing in prod.

This script:
1. Fetches all Mux assets (paginated, up to 500 newest)
2. For each asset whose passthrough contains a post_id, checks if that post
   still has mux_asset_id=NULL
3. Updates the post and awards claves if not already rewarded

Run from the backend/ directory:
    python scripts/backfill_mux_post_ids.py [--dry-run]
"""

import sys
import os
import json
import argparse

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger(__name__)

from models import get_session_local
from models.community import Post
from config import settings


def run(dry_run: bool = False):
    if not settings.MUX_TOKEN_ID or not settings.MUX_TOKEN_SECRET:
        logger.error("MUX_TOKEN_ID / MUX_TOKEN_SECRET not set — aborting")
        sys.exit(1)

    from mux_python import AssetsApi, ApiClient, Configuration
    configuration = Configuration()
    configuration.username = settings.MUX_TOKEN_ID
    configuration.password = settings.MUX_TOKEN_SECRET

    api_client = ApiClient(configuration)
    assets_api = AssetsApi(api_client)

    SessionLocal = get_session_local()
    db = SessionLocal()

    try:
        page = 1
        page_size = 100
        total_scanned = 0
        total_fixed = 0
        total_skipped = 0

        while True:
            logger.info(f"Fetching Mux assets page {page} (limit={page_size})")
            try:
                resp = assets_api.list_assets(limit=page_size, page=page)
            except Exception as e:
                logger.error(f"Mux API error: {e}")
                break

            assets = resp.data or []
            if not assets:
                logger.info("No more assets — done scanning")
                break

            for asset in assets:
                total_scanned += 1
                passthrough_raw = asset.passthrough
                if not passthrough_raw:
                    continue

                try:
                    pdata = json.loads(passthrough_raw) if isinstance(passthrough_raw, str) else passthrough_raw
                except (json.JSONDecodeError, TypeError):
                    continue

                post_id = pdata.get("post_id")
                if not post_id:
                    continue

                if not asset.playback_ids or len(asset.playback_ids) == 0:
                    logger.debug(f"Asset {asset.id} (post {post_id}) has no playback IDs yet — skipping")
                    total_skipped += 1
                    continue

                playback_id = asset.playback_ids[0].id

                post = db.query(Post).filter(Post.id == post_id).first()
                if not post:
                    logger.warning(f"  post_id={post_id} not found in DB (asset {asset.id})")
                    continue

                if post.mux_asset_id:
                    logger.debug(f"  post {post_id} already has mux_asset_id={post.mux_asset_id} — skipping")
                    total_skipped += 1
                    continue

                logger.info(
                    f"  FIXING post {post_id} ('{post.title[:50] if post.title else '?'}') "
                    f"→ asset={asset.id} playback={playback_id}"
                )

                if not dry_run:
                    post.mux_asset_id = asset.id
                    post.mux_playback_id = playback_id
                    db.commit()

                    # Award claves if not already rewarded (idempotent)
                    try:
                        from services import posting_reward_service
                        outcome = posting_reward_service.award_post_reward(str(post.id), db)
                        if outcome.get("awarded"):
                            db.commit()
                            logger.info(
                                f"    Awarded {outcome['amount']} claves "
                                f"(new balance: {outcome['new_balance']})"
                            )
                        else:
                            logger.info(f"    Claves already rewarded or not eligible")
                    except Exception as e:
                        logger.warning(f"    Clave award failed (non-fatal): {e}")
                        db.rollback()

                total_fixed += 1

            if len(assets) < page_size:
                break
            page += 1

    finally:
        db.close()

    mode = "[DRY RUN] " if dry_run else ""
    logger.info(
        f"\n{mode}Done. Scanned {total_scanned} assets | Fixed {total_fixed} posts | "
        f"Skipped {total_skipped} (already linked or no playback ID)"
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Backfill Mux post IDs")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be fixed without writing")
    args = parser.parse_args()
    run(dry_run=args.dry_run)
