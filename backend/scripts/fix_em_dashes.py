"""
Fix em-dashes ("—") in ALL courses across ALL languages.

Replacement rule:
  " — "  -> ", "      (AI-slop spaced form)
  remaining stray "—" -> ","

Targets in the DB (Supabase prod):
  worlds.title, worlds.description
  levels.title, levels.description, levels.outcome
  lessons.title, lessons.description
  lessons.content_json  (recursive — covers notes, quiz questions, options,
                         explanations, and every translations[locale] branch)

On-disk source files (rewritten so future reseeds stay clean):
  mambo_course/*.md
  training_science_course/*.md
  D:/MamboGuild/history_modules/translations/module_NN.json
  D:/MamboGuild/training_science_course/translations/module_NN.json

Usage:
  python backend/scripts/fix_em_dashes.py --files
  python backend/scripts/fix_em_dashes.py --db-dry
  python backend/scripts/fix_em_dashes.py --db-exec
"""

import argparse
import json
import os
import sys


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))

HISTORY_MD_DIR = os.path.join(REPO_ROOT, "mambo_course")
TRAIN_MD_DIR = os.path.join(REPO_ROOT, "training_science_course")
HISTORY_LOC_DIR = "D:/MamboGuild/history_modules/translations"
TRAIN_LOC_DIR = "D:/MamboGuild/training_science_course/translations"


def fix(text):
    if text is None or "—" not in text:
        return text
    out = text.replace(" — ", ", ")
    out = out.replace("—", ",")
    return out


def fix_tree(obj):
    if isinstance(obj, str):
        return fix(obj)
    if isinstance(obj, list):
        return [fix_tree(x) for x in obj]
    if isinstance(obj, dict):
        return {k: fix_tree(v) for k, v in obj.items()}
    return obj


def count_em_dashes(obj):
    if isinstance(obj, str):
        return obj.count("—")
    if isinstance(obj, list):
        return sum(count_em_dashes(x) for x in obj)
    if isinstance(obj, dict):
        return sum(count_em_dashes(v) for v in obj.values())
    return 0


# ----------------------------------------------------------------------
# Phase 1: on-disk source files
# ----------------------------------------------------------------------

def rewrite_md_files(directory):
    stats = {"files": 0, "changed": 0, "replacements": 0}
    if not os.path.isdir(directory):
        print(f"  SKIP (not found): {directory}")
        return stats
    for fn in sorted(os.listdir(directory)):
        if not fn.endswith(".md"):
            continue
        path = os.path.join(directory, fn)
        with open(path, "r", encoding="utf-8") as f:
            raw = f.read()
        before = raw.count("—")
        stats["files"] += 1
        if before == 0:
            continue
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(fix(raw))
        stats["changed"] += 1
        stats["replacements"] += before
        print(f"  {fn}: {before} replaced")
    return stats


def rewrite_json_files(directory):
    stats = {"files": 0, "changed": 0, "replacements": 0}
    if not os.path.isdir(directory):
        print(f"  SKIP (not found): {directory}")
        return stats
    for fn in sorted(os.listdir(directory)):
        if not fn.endswith(".json"):
            continue
        path = os.path.join(directory, fn)
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception as e:
            print(f"  SKIP {fn}: {e}")
            continue
        before = count_em_dashes(data)
        stats["files"] += 1
        if before == 0:
            continue
        with open(path, "w", encoding="utf-8") as f:
            json.dump(fix_tree(data), f, ensure_ascii=False, indent=2)
        stats["changed"] += 1
        stats["replacements"] += before
        print(f"  {fn}: {before} replaced")
    return stats


def run_files():
    print("\n== EN markdown: history ==")
    s1 = rewrite_md_files(HISTORY_MD_DIR)
    print("\n== EN markdown: training ==")
    s2 = rewrite_md_files(TRAIN_MD_DIR)
    print("\n== Translations: history ==")
    s3 = rewrite_json_files(HISTORY_LOC_DIR)
    print("\n== Translations: training ==")
    s4 = rewrite_json_files(TRAIN_LOC_DIR)
    total = s1["replacements"] + s2["replacements"] + s3["replacements"] + s4["replacements"]
    print(f"\nTotal source replacements: {total}")


# ----------------------------------------------------------------------
# Phase 2: live DB (ALL courses, ALL languages)
# ----------------------------------------------------------------------

PLAIN_COLUMNS = [
    ("worlds", "title"),
    ("worlds", "description"),
    ("levels", "title"),
    ("levels", "description"),
    ("levels", "outcome"),
    ("lessons", "title"),
    ("lessons", "description"),
]


def run_db(dry_run):
    sys.path.insert(0, os.path.dirname(SCRIPT_DIR))
    from sqlalchemy import create_engine, text
    from config import settings

    db_url = settings.DATABASE_URL.replace("+asyncpg", "")
    engine = create_engine(db_url)
    print(f"DB: {db_url.rsplit('@', 1)[-1]}")
    print(f"Mode: {'DRY-RUN' if dry_run else 'EXECUTE'}")

    totals = {"plain_rows": 0, "plain_reps": 0, "json_rows": 0, "json_reps": 0}

    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # ---- Plain text columns (title/description/outcome across tables) ----
            for table, col in PLAIN_COLUMNS:
                rows = conn.execute(
                    text(f"SELECT id, {col} FROM {table} WHERE {col} LIKE '%—%'"),
                ).fetchall()
                if not rows:
                    print(f"  {table}.{col}: 0 rows")
                    continue
                reps = sum(r[1].count("—") for r in rows)
                totals["plain_rows"] += len(rows)
                totals["plain_reps"] += reps
                print(f"  {table}.{col}: {len(rows)} rows, {reps} em-dashes")
                if not dry_run:
                    for r in rows:
                        conn.execute(
                            text(f"UPDATE {table} SET {col} = :v WHERE id = :id"),
                            {"v": fix(r[1]), "id": r[0]},
                        )

            # ---- lessons.content_json (covers every locale via translations[locale]) ----
            rows = conn.execute(
                text("SELECT id, content_json FROM lessons WHERE content_json::text LIKE '%—%'"),
            ).fetchall()
            print(f"\n  lessons.content_json: {len(rows)} rows with em-dashes")
            for r in rows:
                content = r.content_json
                if isinstance(content, str):
                    content = json.loads(content)
                before = count_em_dashes(content)
                if before == 0:
                    continue
                totals["json_rows"] += 1
                totals["json_reps"] += before
                if not dry_run:
                    conn.execute(
                        text("UPDATE lessons SET content_json = CAST(:cj AS jsonb) WHERE id = :id"),
                        {"cj": json.dumps(fix_tree(content), ensure_ascii=False), "id": r.id},
                    )

            if dry_run:
                trans.rollback()
            else:
                trans.commit()
        except Exception:
            trans.rollback()
            raise

    print("\n" + "=" * 60)
    print(f"Plain columns: {totals['plain_rows']} rows, {totals['plain_reps']} em-dashes")
    print(f"content_json : {totals['json_rows']} rows, {totals['json_reps']} em-dashes")
    print(f"TOTAL        : {totals['plain_rows'] + totals['json_rows']} rows, "
          f"{totals['plain_reps'] + totals['json_reps']} em-dashes")
    if dry_run:
        print("DRY-RUN — no writes. Re-run with --db-exec to apply.")


# ----------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--files", action="store_true", help="rewrite source markdown + translation JSON on disk")
    p.add_argument("--db-dry", action="store_true", help="scan DB, report counts, no writes")
    p.add_argument("--db-exec", action="store_true", help="apply rewrite to DB")
    args = p.parse_args()

    if not (args.files or args.db_dry or args.db_exec):
        p.print_help()
        return
    if args.files:
        run_files()
    if args.db_dry:
        run_db(dry_run=True)
    if args.db_exec:
        run_db(dry_run=False)


if __name__ == "__main__":
    main()
