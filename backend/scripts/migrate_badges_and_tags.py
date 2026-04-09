"""
migrate_badges_and_tags.py
──────────────────────────────────────────────────────────────────────────────
1. Uploads all badge PNGs from frontend/public/badges/ to R2 under badges/
2. Updates badge_definitions.icon_url in Supabase to full R2 URLs
3. Inserts 16 community_tags into Supabase (skips existing slugs)

Safe to re-run (idempotent).

Usage (from project root, inside backend container):
    python scripts/migrate_badges_and_tags.py
"""

import os
import sys
import logging
logging.disable(logging.CRITICAL)

script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
root_dir    = os.path.dirname(backend_dir)
sys.path.insert(0, backend_dir)

from dotenv import load_dotenv
load_dotenv(os.path.join(root_dir, ".env"))

import boto3
from sqlalchemy import create_engine, text
from config import settings

SEPARATOR = "─" * 62

# ── Badge PNG directory (mounted as volume in Docker) ──────────────────────
BADGES_DIR = os.path.join(backend_dir, "scripts", "badges_temp")

# ── Community tags seed data (mirrors local DB) ────────────────────────────
COMMUNITY_TAGS = [
    ("advanced",      "Advanced",      "Level",  0),
    ("beginner",      "Beginner",      "Level",  0),
    ("body-movement", "Body Movement", "Focus",  0),
    ("boogaloo",      "Boogaloo",      "Style",  0),
    ("cha-cha-cha",   "Cha Cha Cha",   "Style",  0),
    ("choreo",        "Choreo",        "Focus",  0),
    ("drills",        "Drills",        "Focus",  0),
    ("intermediate",  "Intermediate",  "Level",  0),
    ("mambo",         "Mambo",         "Style",  0),
    ("musicality",    "Musicality",    "Focus",  0),
    ("pachanga",      "Pachanga",      "Style",  0),
    ("salsa-fusion",  "Salsa Fusion",  "Style",  0),
    ("salsa-on2",     "Salsa On2",     "Style",  0),
    ("styling",       "Styling",       "Focus",  0),
    ("timing",        "Timing",        "Focus",  0),
    ("turn",          "Turn",          "Focus",  0),
]


def run():
    print(SEPARATOR)
    print("  Mambo Guild — Badge R2 Migration + Community Tags")
    print(SEPARATOR)

    # ── 1. Validate R2 config ──────────────────────────────────────────────
    missing = [k for k in ("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY",
                            "AWS_ENDPOINT_URL", "AWS_BUCKET_NAME")
               if not getattr(settings, k, None)]
    if missing:
        print(f"  ERROR: Missing R2 env vars: {missing}")
        sys.exit(1)

    public_domain = (settings.R2_PUBLIC_DOMAIN or "").rstrip("/")
    if not public_domain:
        print("  ERROR: R2_PUBLIC_DOMAIN not set")
        sys.exit(1)

    # ── 2. Connect to Supabase ─────────────────────────────────────────────
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"sslmode": "require"},
        echo=False,
    )

    # ── 3. Upload badge PNGs to R2 ─────────────────────────────────────────
    print(f"\n  [1/3] Uploading badge PNGs → R2 (badges/)")
    print(f"        Source : {BADGES_DIR}")
    print(f"        Bucket : {settings.AWS_BUCKET_NAME}")

    if not os.path.isdir(BADGES_DIR):
        print(f"  ERROR: badges dir not found: {BADGES_DIR}")
        sys.exit(1)

    s3 = boto3.client(
        "s3",
        endpoint_url=settings.AWS_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name="auto",
    )

    png_files = sorted(f for f in os.listdir(BADGES_DIR) if f.endswith(".png"))
    uploaded = []
    skipped  = []

    for fname in png_files:
        key = f"badges/{fname}"
        local_path = os.path.join(BADGES_DIR, fname)

        # Check if already exists in R2
        try:
            s3.head_object(Bucket=settings.AWS_BUCKET_NAME, Key=key)
            skipped.append(fname)
        except s3.exceptions.ClientError:
            # Doesn't exist — upload
            with open(local_path, "rb") as f:
                s3.put_object(
                    Bucket=settings.AWS_BUCKET_NAME,
                    Key=key,
                    Body=f,
                    ContentType="image/png",
                    CacheControl="public, max-age=31536000",  # 1-year cache
                )
            uploaded.append(fname)
            print(f"        ✓ {fname}")

    if skipped:
        print(f"        ↷ {len(skipped)} already in R2, skipped")
    print(f"        Uploaded {len(uploaded)} new file(s)")

    # ── 4. Update icon_url in badge_definitions ───────────────────────────
    print(f"\n  [2/3] Updating badge_definitions.icon_url in Supabase")

    with engine.begin() as conn:
        rows = conn.execute(text(
            "SELECT id, icon_url FROM badge_definitions WHERE icon_url IS NOT NULL"
        )).fetchall()

        updated_badges = 0
        for badge_id, old_url in rows:
            if not old_url:
                continue
            # Extract filename from paths like /badges/firestarter_bronze.png
            filename = old_url.split("/")[-1]
            new_url = f"{public_domain}/badges/{filename}"

            if old_url != new_url:
                conn.execute(
                    text("UPDATE badge_definitions SET icon_url = :url WHERE id = :id"),
                    {"url": new_url, "id": badge_id},
                )
                updated_badges += 1

    print(f"        Updated {updated_badges} badge icon_url(s)")

    # ── 5. Insert community_tags ──────────────────────────────────────────
    print(f"\n  [3/3] Inserting community_tags into Supabase")

    with engine.begin() as conn:
        existing = {row[0] for row in conn.execute(
            text("SELECT slug FROM community_tags")
        ).fetchall()}

        inserted = 0
        for slug, name, category, usage_count in COMMUNITY_TAGS:
            if slug in existing:
                print(f"        ↷ '{slug}' already exists")
                continue
            conn.execute(
                text("""
                    INSERT INTO community_tags (slug, name, category, usage_count)
                    VALUES (:slug, :name, :category, :usage_count)
                """),
                {"slug": slug, "name": name, "category": category,
                 "usage_count": usage_count},
            )
            inserted += 1
            print(f"        ✓ {name} ({category})")

    print(f"        Inserted {inserted} tag(s)")

    # ── 6. Summary ────────────────────────────────────────────────────────
    print(f"\n{SEPARATOR}")
    print("  RESULT: SUCCESS")
    print(f"  • {len(uploaded)} badge PNGs uploaded to R2")
    print(f"  • {updated_badges} badge icon_url records updated in Supabase")
    print(f"  • {inserted} community tags inserted into Supabase")
    print(SEPARATOR)


if __name__ == "__main__":
    run()
