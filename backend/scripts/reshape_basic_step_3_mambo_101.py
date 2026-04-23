"""
One-shot migration: relocate "Basic Step 3" in Mambo 101.

Before:  Combo 3 -> Basic Step 3 -> Combo 4
After:   Combo 2 -> Basic Step 3 -> Combo 3

Combo 4 remains reachable via Swing Step 2 and Syncopation 2, so no
orphaning occurs. Other courses and other modules are untouched.

Idempotent: safe to re-run. Supports --dry-run to preview without writing.

Usage:
    # Local dev (Docker):
    docker-compose exec backend python scripts/reshape_basic_step_3_mambo_101.py --dry-run
    docker-compose exec backend python scripts/reshape_basic_step_3_mambo_101.py

    # Prod (Railway/Supabase) — set DATABASE_URL appropriately first.
"""

import sys
import os
import uuid
import argparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from config import settings

COURSE_SLUG = "mambo-101"
TARGET_TITLE = "Basic Step 3"
NEW_PARENT_TITLE = "COMBO 2"    # Basic Step 3's new prerequisite
NEW_CHILD_TITLE = "COMBO 3"     # what Basic Step 3 now unlocks


def find_level_id(conn, world_id: str, title: str) -> str | None:
    row = conn.execute(
        text(
            "SELECT id FROM levels WHERE world_id = :wid AND title = :title LIMIT 1"
        ),
        {"wid": world_id, "title": title},
    ).fetchone()
    return str(row[0]) if row else None


def find_world_id(conn, slug: str) -> str | None:
    row = conn.execute(
        text("SELECT id FROM worlds WHERE slug = :slug LIMIT 1"),
        {"slug": slug},
    ).fetchone()
    return str(row[0]) if row else None


def list_edges_touching(conn, world_id: str, level_id: str) -> list[dict]:
    """Return all edges where the given level is source or target, with titles."""
    rows = conn.execute(
        text(
            """
            SELECT e.id,
                   e.from_level_id,
                   e.to_level_id,
                   f.title AS from_title,
                   t.title AS to_title
            FROM level_edges e
            JOIN levels f ON f.id = e.from_level_id
            JOIN levels t ON t.id = e.to_level_id
            WHERE e.world_id = :wid
              AND (e.from_level_id = :lid OR e.to_level_id = :lid)
            """
        ),
        {"wid": world_id, "lid": level_id},
    ).fetchall()
    return [
        {
            "id": str(r[0]),
            "from_id": str(r[1]),
            "to_id": str(r[2]),
            "from_title": r[3],
            "to_title": r[4],
        }
        for r in rows
    ]


def edge_exists(conn, world_id: str, from_id: str, to_id: str) -> bool:
    row = conn.execute(
        text(
            """
            SELECT 1 FROM level_edges
            WHERE world_id = :wid
              AND from_level_id = :fid
              AND to_level_id = :tid
            LIMIT 1
            """
        ),
        {"wid": world_id, "fid": from_id, "tid": to_id},
    ).fetchone()
    return row is not None


def main(dry_run: bool) -> int:
    engine = create_engine(settings.DATABASE_URL.replace("+asyncpg", ""))

    with engine.connect() as conn:
        trans = conn.begin()
        try:
            world_id = find_world_id(conn, COURSE_SLUG)
            if not world_id:
                print(f"ERROR: course '{COURSE_SLUG}' not found.")
                return 1

            target_id = find_level_id(conn, world_id, TARGET_TITLE)
            new_parent_id = find_level_id(conn, world_id, NEW_PARENT_TITLE)
            new_child_id = find_level_id(conn, world_id, NEW_CHILD_TITLE)

            missing = [
                n
                for n, v in {
                    TARGET_TITLE: target_id,
                    NEW_PARENT_TITLE: new_parent_id,
                    NEW_CHILD_TITLE: new_child_id,
                }.items()
                if v is None
            ]
            if missing:
                print(
                    f"ERROR: missing level(s) in '{COURSE_SLUG}': {missing}. "
                    "Aborting without changes."
                )
                return 1

            mode = "DRY-RUN" if dry_run else "LIVE"
            print(f"\n[{mode}] Reshaping '{TARGET_TITLE}' in '{COURSE_SLUG}'")
            print(f"  world_id     = {world_id}")
            print(f"  target_id    = {target_id} ({TARGET_TITLE})")
            print(f"  new_parent   = {new_parent_id} ({NEW_PARENT_TITLE})")
            print(f"  new_child    = {new_child_id} ({NEW_CHILD_TITLE})")

            existing = list_edges_touching(conn, world_id, target_id)
            print(f"\nExisting edges touching '{TARGET_TITLE}': {len(existing)}")
            for e in existing:
                arrow = (
                    f"{e['from_title']} -> {e['to_title']}"
                    if e["from_id"] == target_id or e["to_id"] == target_id
                    else "?"
                )
                print(f"  [{e['id']}] {arrow}")

            if not existing:
                print(
                    f"  (no existing edges — '{TARGET_TITLE}' is currently disconnected)"
                )

            # Delete all existing edges touching Basic Step 3
            if existing:
                print(f"\nDeleting {len(existing)} edge(s)...")
                if not dry_run:
                    conn.execute(
                        text(
                            """
                            DELETE FROM level_edges
                            WHERE world_id = :wid
                              AND (from_level_id = :lid OR to_level_id = :lid)
                            """
                        ),
                        {"wid": world_id, "lid": target_id},
                    )

            # Insert new edges (idempotent check even though we just cleared)
            to_insert = [
                (new_parent_id, target_id, f"{NEW_PARENT_TITLE} -> {TARGET_TITLE}"),
                (target_id, new_child_id, f"{TARGET_TITLE} -> {NEW_CHILD_TITLE}"),
            ]
            print(f"\nInserting {len(to_insert)} new edge(s):")
            for from_id, to_id, label in to_insert:
                if not dry_run and edge_exists(conn, world_id, from_id, to_id):
                    print(f"  SKIP (already exists): {label}")
                    continue
                print(f"  ADD: {label}")
                if not dry_run:
                    conn.execute(
                        text(
                            """
                            INSERT INTO level_edges
                                (id, world_id, from_level_id, to_level_id)
                            VALUES (:id, :wid, :fid, :tid)
                            """
                        ),
                        {
                            "id": str(uuid.uuid4()),
                            "wid": world_id,
                            "fid": from_id,
                            "tid": to_id,
                        },
                    )

            if dry_run:
                print("\n[DRY-RUN] Rolling back — no changes written.")
                trans.rollback()
            else:
                trans.commit()
                print("\nCommitted.")

            # Post-commit verification
            print("\nFinal edges touching Basic Step 3:")
            for e in list_edges_touching(conn, world_id, target_id):
                print(f"  {e['from_title']} -> {e['to_title']}")

            return 0
        except Exception as exc:
            trans.rollback()
            print(f"\nFAILED: {exc}")
            return 2


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without writing to the database.",
    )
    args = parser.parse_args()
    sys.exit(main(dry_run=args.dry_run))
