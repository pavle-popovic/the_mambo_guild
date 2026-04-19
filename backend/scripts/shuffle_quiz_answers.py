"""
Shuffle quiz answer option order across ALL courses and ALL locales.

Current state: the correct answer is disproportionately "B" (survey: 72% B).
After this script: every question's options are randomly permuted. The
ASCII "A) "/"B) "/… prefixes in each option string are rewritten to match
the new position, and the `answer` letter is updated so the correct option
still points to the same underlying text.

Quiz shape (confirmed by DB survey, 175 top-level + 2275 locale questions):
  content_json.questions = [
    {
      "question": str,
      "options":  ["A) text", "B) text", ...],   # 2-4 items
      "answer":   "A" | "B" | "C" | "D",         # ASCII letter, positional
      "number":   int? (optional),
      "explanation": str? (optional),
    },
    ...
  ]
  content_json.translations.{locale}.questions = [ ...same shape... ]

For each question the script picks ONE random permutation and applies it to
EN + every locale that has a parallel question at the same index with the
same option count. Locale mismatches are logged and skipped per-question.

Usage:
  python backend/scripts/shuffle_quiz_answers.py --dry-run
  python backend/scripts/shuffle_quiz_answers.py --execute [--seed N]
"""

import argparse
import json
import os
import random
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

PREFIX_RE = re.compile(r"^\s*([A-D])[\)\.]\s*", re.UNICODE)


def strip_prefix(opt):
    """Return raw option text with any leading 'A) ' / 'B. ' prefix removed."""
    if not isinstance(opt, str):
        return opt
    return PREFIX_RE.sub("", opt, count=1)


def with_prefix(text, idx):
    """Re-prefix option text with 'A) ' at idx=0, 'B) ' at idx=1, etc."""
    return f"{chr(ord('A') + idx)}) {text}"


def shuffle_one(q, perm):
    """Apply permutation to q['options'] and remap q['answer'].

    perm[i] = old_index whose content should land at new position i.
    Returns True on success, False if shape doesn't match.
    """
    opts = q.get("options")
    if not isinstance(opts, list) or len(opts) != len(perm):
        return False
    ans = q.get("answer")
    if not isinstance(ans, str) or len(ans) != 1:
        return False
    old_ans_idx = ord(ans.upper()) - ord("A")
    if not (0 <= old_ans_idx < len(opts)):
        return False

    raw = [strip_prefix(o) for o in opts]
    new_opts = [with_prefix(raw[perm[i]], i) for i in range(len(perm))]
    # new answer position = where old_ans_idx sits in perm
    new_ans_idx = perm.index(old_ans_idx)
    q["options"] = new_opts
    q["answer"] = chr(ord("A") + new_ans_idx)
    return True


def verify_answer_maps_to_same_text(before_q, after_q):
    """Confirm the new correct option has the same raw text as the old one."""
    old_idx = ord(before_q["answer"].upper()) - ord("A")
    new_idx = ord(after_q["answer"].upper()) - ord("A")
    return strip_prefix(before_q["options"][old_idx]) == strip_prefix(after_q["options"][new_idx])


def process_lesson(cj, stats, rng):
    """Shuffle every question in content_json in place. Return True if any change."""
    changed = False
    top_qs = cj.get("questions") or []
    translations = cj.get("translations") or {}

    for i, q in enumerate(top_qs):
        opts = q.get("options")
        if not isinstance(opts, list) or len(opts) < 2:
            stats["skipped_bad_shape"] += 1
            continue
        n = len(opts)
        # Keep picking permutations until we get one that actually moves the answer
        # (only if n>1 and there's more than one distinct option letter — i.e. always here).
        # For n==2 there are 2 perms, identity keeps answer; we allow identity to keep simplicity.
        perm = list(range(n))
        rng.shuffle(perm)

        # Record pre-shuffle answer letter for distribution stats
        before_ans = q.get("answer", "").upper()
        before_snapshot = {"options": list(q["options"]), "answer": q.get("answer")}

        ok = shuffle_one(q, perm)
        if not ok:
            stats["skipped_bad_shape"] += 1
            continue
        if not verify_answer_maps_to_same_text(before_snapshot, q):
            stats["verification_failures"] += 1
            # revert
            q["options"] = before_snapshot["options"]
            q["answer"] = before_snapshot["answer"]
            continue
        stats["en_shuffled"] += 1
        stats["before_dist"][before_ans] = stats["before_dist"].get(before_ans, 0) + 1
        stats["after_dist"][q["answer"]] = stats["after_dist"].get(q["answer"], 0) + 1
        changed = True

        # Apply same permutation to every locale question at the same index
        for loc, tv in translations.items():
            if not isinstance(tv, dict):
                continue
            loc_qs = tv.get("questions") or []
            if i >= len(loc_qs):
                stats["loc_missing"] += 1
                continue
            lq = loc_qs[i]
            lopts = lq.get("options")
            if not isinstance(lopts, list) or len(lopts) != n:
                stats["loc_count_mismatch"] += 1
                continue
            before_loc = {"options": list(lq["options"]), "answer": lq.get("answer")}
            ok_loc = shuffle_one(lq, perm)
            if not ok_loc or not verify_answer_maps_to_same_text(before_loc, lq):
                lq["options"] = before_loc["options"]
                lq["answer"] = before_loc["answer"]
                stats["loc_skipped"] += 1
                continue
            stats["loc_shuffled"] += 1

    return changed


def main():
    p = argparse.ArgumentParser(description=__doc__)
    grp = p.add_mutually_exclusive_group(required=True)
    grp.add_argument("--dry-run", action="store_true")
    grp.add_argument("--execute", action="store_true")
    p.add_argument("--seed", type=int, default=None,
                   help="RNG seed for reproducibility (default: non-deterministic)")
    args = p.parse_args()

    sys.path.insert(0, os.path.dirname(SCRIPT_DIR))
    from sqlalchemy import create_engine, text
    from config import settings

    rng = random.Random(args.seed) if args.seed is not None else random.Random()

    db_url = settings.DATABASE_URL.replace("+asyncpg", "")
    engine = create_engine(db_url)
    print(f"DB: {db_url.rsplit('@', 1)[-1]}")
    print(f"Mode: {'DRY-RUN' if args.dry_run else 'EXECUTE'}")
    if args.seed is not None:
        print(f"Seed: {args.seed}")

    stats = {
        "lessons_scanned": 0,
        "lessons_changed": 0,
        "en_shuffled": 0,
        "loc_shuffled": 0,
        "loc_missing": 0,
        "loc_count_mismatch": 0,
        "loc_skipped": 0,
        "skipped_bad_shape": 0,
        "verification_failures": 0,
        "before_dist": {},
        "after_dist": {},
    }

    with engine.connect() as conn:
        trans = conn.begin()
        try:
            rows = conn.execute(text("""
                SELECT l.id, w.slug
                FROM lessons l
                JOIN levels lv ON lv.id = l.level_id
                JOIN worlds w ON w.id = lv.world_id
                WHERE l.content_json::text LIKE '%"questions"%'
            """)).fetchall()

            per_course = {}
            for row in rows:
                stats["lessons_scanned"] += 1
                cur = conn.execute(
                    text("SELECT content_json FROM lessons WHERE id = :id"),
                    {"id": row.id},
                ).fetchone()
                cj = cur.content_json
                if cj is None:
                    continue
                if isinstance(cj, str):
                    cj = json.loads(cj)

                changed = process_lesson(cj, stats, rng)
                if not changed:
                    continue
                stats["lessons_changed"] += 1
                per_course[row.slug] = per_course.get(row.slug, 0) + 1
                if not args.dry_run:
                    conn.execute(
                        text("UPDATE lessons SET content_json = CAST(:cj AS jsonb) WHERE id = :id"),
                        {"cj": json.dumps(cj, ensure_ascii=False), "id": row.id},
                    )

            if args.dry_run:
                trans.rollback()
            else:
                trans.commit()
        except Exception:
            trans.rollback()
            raise

    print("\n" + "=" * 60)
    print(f"Lessons scanned : {stats['lessons_scanned']}")
    print(f"Lessons changed : {stats['lessons_changed']}")
    print(f"EN questions shuffled   : {stats['en_shuffled']}")
    print(f"Locale questions shuffled: {stats['loc_shuffled']}")
    print(f"Locale missing at idx    : {stats['loc_missing']}")
    print(f"Locale count mismatch    : {stats['loc_count_mismatch']}")
    print(f"Locale shuffle skipped   : {stats['loc_skipped']}")
    print(f"Questions with bad shape : {stats['skipped_bad_shape']}")
    print(f"Verification failures    : {stats['verification_failures']}")
    print(f"\nEN answer distribution BEFORE: {stats['before_dist']}")
    print(f"EN answer distribution AFTER : {stats['after_dist']}")
    print(f"\nLessons changed per course:")
    for slug, n in sorted(per_course.items(), key=lambda kv: -kv[1]):
        print(f"  {slug:30s} {n}")
    if args.dry_run:
        print("\nDRY-RUN, no writes. Re-run with --execute to apply.")


if __name__ == "__main__":
    main()
