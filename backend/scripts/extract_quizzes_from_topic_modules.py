"""
Migration: extract embedded quizzes out of topic-module history lessons into
their own quiz-typed lessons.

Why: in the `mambo-history` and `training-science` topic courses, every module
is a single `lesson_type='history'` lesson whose `content_json.questions` array
holds the Knowledge Check questions. Translated copies of those modules
embedded the quiz markdown directly inside the translated `notes` field, so
non-English readers see raw quiz text in the body. We want each module to look
like:
    1. notes-only history lesson (order_index=1)
    2. quiz lesson with question #1 (order_index=2)
    3. quiz lesson with question #2 (order_index=3)

The script:
  - Targets worlds with slug in {'mambo-history', 'training-science'}.
  - For each level under those worlds, finds its primary lesson (the one with
    lesson_type='history' at order_index=1).
  - Skips lessons already migrated (marker `content_json.questions_extracted`).
  - Reads the first 2 questions from `content_json.questions`.
  - For each translation locale under `content_json.translations`, pulls the
    matching translated questions if present (key `questions` or `quiz`).
  - Strips quiz markdown blocks from the notes string for English AND every
    translation (regex matches `**N. ...**` blocks + A/B/C/D options + correct
    answer line, plus any preceding `## ` heading that looks like the quiz
    section heading).
  - Inserts 2 new lesson rows under the same level with lesson_type='quiz'
    and content_json that mirrors the translation shape.
  - Updates the original lesson: clears `questions`, sets the marker, writes
    cleaned notes back into both English and translated locales.

Usage (run inside the backend Docker container):
    docker-compose exec backend python scripts/extract_quizzes_from_topic_modules.py --dry-run
    docker-compose exec backend python scripts/extract_quizzes_from_topic_modules.py --execute

Defaults to --dry-run. Pass --execute to actually write. Add --verbose to dump
sample payloads.

Safe to re-run: idempotent via the `questions_extracted` marker.
"""

import argparse
import json
import os
import re
import sys
import uuid
from copy import deepcopy

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(SCRIPT_DIR))

from sqlalchemy import create_engine, text  # noqa: E402
from config import settings  # noqa: E402


TARGET_SLUGS = ("mambo-history", "training-science")


# ---------------------------------------------------------------------------
# Question normalisation
# ---------------------------------------------------------------------------

def normalize_question(q: dict) -> dict | None:
    """
    Turn whatever shape a question is stored in into the shape the lesson page
    expects:
        { question, options: [str, str, ...], answer: "A"|"B"|..., explanation }

    Accepts source shapes:
        - options as dict {"A": ..., "B": ...} with `correct: "B"` (seed format)
        - options as list of strings with `answer: "B"`
        - options as list of {text, isCorrect} objects
    """
    if not isinstance(q, dict):
        return None

    question_text = q.get("question") or q.get("text") or ""
    if not question_text:
        return None

    raw_opts = q.get("options")
    answer_letter = (q.get("answer") or q.get("correct") or "").strip().upper()
    explanation = q.get("explanation") or ""

    options_list: list[str] = []

    if isinstance(raw_opts, dict):
        # {"A": "...", "B": "..."} -> sorted by letter
        for letter in sorted(raw_opts.keys()):
            val = raw_opts[letter]
            if isinstance(val, str):
                options_list.append(val)
        # answer already a letter; nothing to derive
    elif isinstance(raw_opts, list):
        # could be ["text", ...] or [{text, isCorrect}, ...]
        derived_letter = None
        for idx, item in enumerate(raw_opts):
            if isinstance(item, str):
                options_list.append(item)
            elif isinstance(item, dict):
                options_list.append(item.get("text") or "")
                if item.get("isCorrect") and derived_letter is None:
                    derived_letter = chr(65 + idx)
        if not answer_letter and derived_letter:
            answer_letter = derived_letter
    else:
        return None

    if not options_list:
        return None

    if answer_letter not in {"A", "B", "C", "D", "E"}:
        # fall back to A so it never crashes the page; flag in explanation
        answer_letter = answer_letter or "A"

    return {
        "question": question_text,
        "options": options_list,
        "answer": answer_letter,
        "explanation": explanation,
    }


# ---------------------------------------------------------------------------
# Notes scrubbing
# ---------------------------------------------------------------------------

# One full quiz block: line starting with **N. question?**, options, then a
# *Correct Answer: ...* line. Anchored to start-of-line so bolded body text
# like **1.** in the prose can't accidentally match.
QUIZ_BLOCK_RE = re.compile(
    r"^\*\*\d+\.\s.*?\*Correct\s+Answer:[^\n]*\n",
    re.DOTALL | re.MULTILINE,
)

# The localized "Knowledge Check" heading immediately preceding **1. We can't
# rely on the word itself (translated), so we match any `## ` heading whose
# next non-blank content is `**1. `.
QUIZ_HEADING_RE = re.compile(
    r"^##\s+[^\n]+\n(?:[ \t]*\n)*(?=\*\*1\.\s)",
    re.MULTILINE,
)


def strip_quiz_from_notes(notes: str) -> str:
    """Remove quiz markdown (heading + numbered question blocks) from notes."""
    if not notes:
        return notes

    cleaned = notes

    # Drop the localized "Knowledge Check" heading that precedes **1.
    cleaned = QUIZ_HEADING_RE.sub("", cleaned)

    # Drop every `**N. ...**` ... `*Correct Answer: ...*` block.
    cleaned = QUIZ_BLOCK_RE.sub("", cleaned)

    # Collapse 3+ consecutive blank lines down to 2.
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)

    return cleaned.rstrip() + "\n"


# ---------------------------------------------------------------------------
# Per-lesson migration
# ---------------------------------------------------------------------------

def build_quiz_content(question_en: dict, translations: dict, q_index: int) -> dict:
    """
    Build content_json for a new quiz lesson.

    `question_en` is the normalized English question.
    `translations` is the original lesson's translations dict; we pull the
    same-index question from each locale if available.
    `q_index` is 0 for the first quiz, 1 for the second.
    """
    content: dict = {"questions": [question_en]}
    out_translations: dict = {}

    for locale, payload in (translations or {}).items():
        if not isinstance(payload, dict):
            continue
        loc_questions = payload.get("questions") or payload.get("quiz") or []
        if not isinstance(loc_questions, list) or len(loc_questions) <= q_index:
            continue
        normalized = normalize_question(loc_questions[q_index])
        if normalized is None:
            continue
        out_translations[locale] = {"questions": [normalized]}

    if out_translations:
        content["translations"] = out_translations

    return content


def migrate_lesson(conn, lesson_row, *, dry_run: bool, verbose: bool) -> dict:
    """
    Migrate a single history lesson. Returns a summary dict.
    """
    lesson_id = str(lesson_row.id)
    level_id = str(lesson_row.level_id)
    title = lesson_row.title
    content_json = lesson_row.content_json or {}

    summary = {
        "lesson_id": lesson_id,
        "title": title,
        "skipped": False,
        "reason": None,
        "quiz_lessons_created": 0,
        "translations_carried": [],
    }

    if content_json.get("questions_extracted"):
        summary["skipped"] = True
        summary["reason"] = "already migrated (marker set)"
        return summary

    raw_questions = content_json.get("questions") or content_json.get("quiz") or []
    if not isinstance(raw_questions, list) or len(raw_questions) < 1:
        summary["skipped"] = True
        summary["reason"] = "no questions in content_json"
        return summary

    # Normalize first 2 English questions
    normalized = []
    for q in raw_questions[:2]:
        n = normalize_question(q)
        if n:
            normalized.append(n)
    if not normalized:
        summary["skipped"] = True
        summary["reason"] = "questions present but none normalizable"
        return summary

    translations = content_json.get("translations") or {}

    # ---- Build cleaned content_json for the original lesson ----
    new_content = deepcopy(content_json)

    # Clean English notes
    en_notes = new_content.get("notes") or new_content.get("content") or ""
    new_content["notes"] = strip_quiz_from_notes(en_notes)
    if "content" in new_content:
        new_content["content"] = new_content["notes"]

    # Drop English questions
    new_content.pop("questions", None)
    new_content.pop("quiz", None)
    new_content["questions_extracted"] = True

    # Clean each translation: strip quiz from notes, drop questions/quiz keys
    if isinstance(new_content.get("translations"), dict):
        for locale, payload in list(new_content["translations"].items()):
            if not isinstance(payload, dict):
                continue
            loc_notes = payload.get("notes") or payload.get("content") or ""
            cleaned_loc_notes = strip_quiz_from_notes(loc_notes)
            if "notes" in payload:
                payload["notes"] = cleaned_loc_notes
            if "content" in payload:
                payload["content"] = cleaned_loc_notes
            payload.pop("questions", None)
            payload.pop("quiz", None)
            new_content["translations"][locale] = payload
            summary["translations_carried"].append(locale)

    # ---- Build and insert quiz lessons ----
    quiz_lesson_payloads = []
    for q_index, q in enumerate(normalized):
        quiz_content = build_quiz_content(q, translations, q_index)

        # Title carries translations too if present
        quiz_title = f"{title} — Quiz {q_index + 1}"

        # Carry translations of the title where possible: translated lesson's
        # `notes` field is the only thing translators touched, so we don't
        # have a translated title. Skip per-locale title translation; the
        # frontend will fall back to English title for non-EN locales, which
        # matches current behaviour for the rest of the platform.

        quiz_lesson_payloads.append({
            "id": str(uuid.uuid4()),
            "level_id": level_id,
            "title": quiz_title,
            "description": q["question"][:200],
            "video_url": "",
            "xp_value": 25,
            "order_index": q_index + 2,  # 2 and 3
            "is_boss_battle": False,
            "duration_minutes": 2,
            "lesson_type": "quiz",
            "content_json": json.dumps(quiz_content, ensure_ascii=False),
        })

    if verbose:
        print(f"\n  [{title}]")
        print(f"    cleaned EN notes length: {len(new_content['notes'])} chars")
        print(f"    translations cleaned: {summary['translations_carried']}")
        for p in quiz_lesson_payloads:
            print(f"    + quiz lesson order={p['order_index']}: {p['description'][:70]}…")

    if dry_run:
        summary["quiz_lessons_created"] = len(quiz_lesson_payloads)
        return summary

    # Update original lesson
    conn.execute(
        text("""
            UPDATE lessons
            SET content_json = CAST(:cj AS jsonb)
            WHERE id = :id
        """),
        {"cj": json.dumps(new_content, ensure_ascii=False), "id": lesson_id},
    )

    # Insert quiz lessons
    for p in quiz_lesson_payloads:
        conn.execute(
            text("""
                INSERT INTO lessons (
                    id, level_id, title, description, video_url, xp_value,
                    order_index, is_boss_battle, duration_minutes, lesson_type,
                    content_json
                )
                VALUES (
                    :id, :level_id, :title, :description, :video_url, :xp_value,
                    :order_index, :is_boss_battle, :duration_minutes, :lesson_type,
                    CAST(:content_json AS jsonb)
                )
            """),
            p,
        )

    summary["quiz_lessons_created"] = len(quiz_lesson_payloads)
    return summary


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    grp = parser.add_mutually_exclusive_group()
    grp.add_argument("--dry-run", action="store_true", help="default; preview without writing")
    grp.add_argument("--execute", action="store_true", help="actually write to the database")
    parser.add_argument("--verbose", action="store_true", help="dump per-lesson details")
    parser.add_argument(
        "--slug",
        action="append",
        choices=TARGET_SLUGS,
        help="restrict to one slug (default: both topic courses)",
    )
    args = parser.parse_args()

    dry_run = not args.execute  # default to dry-run
    slugs = tuple(args.slug) if args.slug else TARGET_SLUGS

    db_url = settings.DATABASE_URL.replace("+asyncpg", "")
    engine = create_engine(db_url)

    print("=" * 72)
    print(f"Quiz extraction migration — {'DRY RUN' if dry_run else 'EXECUTE'}")
    print(f"Targeting slugs: {', '.join(slugs)}")
    print(f"DB: {db_url.rsplit('@', 1)[-1] if '@' in db_url else db_url}")
    print("=" * 72)

    totals = {
        "lessons_seen": 0,
        "lessons_skipped": 0,
        "lessons_migrated": 0,
        "quiz_lessons_created": 0,
        "translations_touched": set(),
    }

    # We always open an explicit transaction. For dry-run we simply never
    # call commit (and rollback at the end). For execute we commit at the end.
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            worlds = conn.execute(
                text("SELECT id, title, slug FROM worlds WHERE slug = ANY(:slugs)"),
                {"slugs": list(slugs)},
            ).fetchall()

            if not worlds:
                print("No matching worlds found. Aborting.")
                trans.rollback()
                return

            for world in worlds:
                print(f"\n>> {world.title} ({world.slug})")

                lessons = conn.execute(
                    text("""
                        SELECT l.id, l.level_id, l.title, l.content_json, l.order_index, l.lesson_type
                        FROM lessons l
                        JOIN levels lv ON lv.id = l.level_id
                        WHERE lv.world_id = :wid
                          AND l.lesson_type = 'history'
                          AND l.order_index = 1
                        ORDER BY lv.order_index
                    """),
                    {"wid": str(world.id)},
                ).fetchall()

                for lesson in lessons:
                    totals["lessons_seen"] += 1
                    summary = migrate_lesson(
                        conn, lesson, dry_run=dry_run, verbose=args.verbose
                    )

                    if summary["skipped"]:
                        totals["lessons_skipped"] += 1
                        print(f"  - skip: {summary['title']} ({summary['reason']})")
                    else:
                        totals["lessons_migrated"] += 1
                        totals["quiz_lessons_created"] += summary["quiz_lessons_created"]
                        totals["translations_touched"].update(summary["translations_carried"])
                        tag = "would create" if dry_run else "created"
                        print(
                            f"  + {summary['title']}: {tag} "
                            f"{summary['quiz_lessons_created']} quiz lessons "
                            f"({len(summary['translations_carried'])} locales)"
                        )

            if dry_run:
                trans.rollback()
            else:
                trans.commit()
        except Exception:
            trans.rollback()
            raise

    print("\n" + "=" * 72)
    print(f"Lessons seen:           {totals['lessons_seen']}")
    print(f"Lessons skipped:        {totals['lessons_skipped']}")
    print(f"Lessons migrated:       {totals['lessons_migrated']}")
    print(f"Quiz lessons {'planned' if dry_run else 'created'}:  {totals['quiz_lessons_created']}")
    locales = sorted(totals["translations_touched"])
    print(f"Locales touched:        {', '.join(locales) if locales else '(none)'}")
    print("=" * 72)
    if dry_run:
        print("DRY RUN — rolled back, no changes persisted.")
        print("Re-run with --execute to apply.")


if __name__ == "__main__":
    main()
