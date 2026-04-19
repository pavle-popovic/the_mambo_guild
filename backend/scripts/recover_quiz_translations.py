"""
Recovery script for the topic-course quiz extraction migration.

Context:
  extract_quizzes_from_topic_modules.py created 76 quiz lessons but lost
  per-locale translations because the localized quiz content lived as
  markdown inside `translations[locale].notes`, not as a structured
  `questions` array. The script also failed to strip quiz blocks from EN
  notes because EN uses a different markdown format than the locales did.

This script recovers everything by re-parsing the original source markdown
in D:/MamboGuild and writing into the live Supabase rows that already exist.

Sources:
  - Mambo history EN  : D:/MamboGuild/history_modules/edited/module_NN.md
  - Mambo history loc : D:/MamboGuild/history_modules/translations/module_NN.json
  - Mambo history map : D:/MamboGuild/history_modules/_module_map.json
  - Training EN       : D:/MamboGuild/training_science_course/module_N.md
  - Training loc      : D:/MamboGuild/training_science_course/translations/module_NN.json
  - Training map      : D:/MamboGuild/training_science_course/_module_map.json

Per module the script:
  1. Loads EN markdown + 13-locale JSON.
  2. For each locale (incl. EN) parses the inline quiz blocks into structured
     questions and strips the quiz section from notes.
  3. Updates the existing history lesson with:
        notes = clean EN notes
        translations[locale].notes = clean locale notes
        questions_extracted = true   (idempotency marker)
  4. Updates the existing 2 quiz lessons (order_index 2,3) under the same
     level: replaces content_json with first/second question incl. translations.

Usage (from the repo root):
  export $(grep -E "^DATABASE_URL=" .env | xargs) \
    && python backend/scripts/recover_quiz_translations.py --dry-run
  ... then --execute.
"""

import argparse
import json
import os
import re
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(SCRIPT_DIR))

from sqlalchemy import create_engine, text  # noqa: E402
from config import settings  # noqa: E402


LOCALES = ["es", "pt", "fr", "de", "it", "ja", "ko", "zh", "ru", "pl", "nl", "ar", "el"]

MAMBO_EN_DIR = "D:/MamboGuild/history_modules/edited"
MAMBO_LOC_DIR = "D:/MamboGuild/history_modules/translations"
MAMBO_MAP = "D:/MamboGuild/history_modules/_module_map.json"

TRAIN_EN_DIR = "D:/MamboGuild/training_science_course"
TRAIN_LOC_DIR = "D:/MamboGuild/training_science_course/translations"
TRAIN_MAP = "D:/MamboGuild/training_science_course/_module_map.json"


# ---------------------------------------------------------------------------
# Quiz parser — works across EN + all 13 locales (same structural format)
# ---------------------------------------------------------------------------

# Question can begin as `**N. text...**` (most locales) or plain `N. text...`
# (raw EN format in mod 18). We allow optional leading `**`.
QUESTION_START_RE = re.compile(r"^(?:\*\*)?(\d+)\.\s", re.MULTILINE)

# A question option line: optional bullet/asterisk, then a short label
# (1–3 chars: ASCII A-D, Arabic أبجد, Greek ΑΒΓΔ, full-width A-D, etc.),
# then `)` or `）` (full-width). Allow zero whitespace before content (CJK
# typography typically has no space after the paren).
OPTION_LINE_RE = re.compile(
    r"^\s*[-*•]?\s*(\S{1,3}?)[\)\）]\s*(.+?)\s*$",
    re.MULTILINE,
)


def find_quiz_section(notes: str) -> tuple[int, int] | None:
    """Return (start_idx, end_idx) of the quiz section, or None.

    Identified by: a `## ` heading whose first non-blank successor line is
    `**1. ` or `1. ` (raw EN). End is the next `## ` heading, `---` line, or
    end of string.
    """
    for h in re.finditer(r"^##\s+[^\n]+\n", notes, re.MULTILINE):
        body_start = h.end()
        rest = notes[body_start:]
        m_blank = re.match(r"(?:[ \t]*\n)*", rest)
        first_content_idx = body_start + (m_blank.end() if m_blank else 0)
        peek = notes[first_content_idx:first_content_idx + 6]
        if peek.startswith("**1.") or peek.startswith("1. "):
            end_match = re.search(r"^(?:##\s|---)", notes[first_content_idx:], re.MULTILINE)
            end_idx = first_content_idx + end_match.start() if end_match else len(notes)
            return (h.start(), end_idx)
    # Fallback: heading-less quiz
    m = re.search(r"^(?:\*\*)?1\.\s", notes, re.MULTILINE)
    if m:
        end_match = re.search(r"^(?:##\s|---)", notes[m.start():], re.MULTILINE)
        end_idx = m.start() + end_match.start() if end_match else len(notes)
        return (m.start(), end_idx)
    return None


def _clean_option_text(text: str) -> str:
    # strip trailing markdown bold/italic and stray punctuation noise
    return text.strip()


def parse_questions(notes: str) -> list[dict]:
    """Parse the quiz section into a list of structured question dicts.

    Output question shape:
        { question, options: [str,str,str,str], answer: "A"|"B"|"C"|"D",
          explanation }

    Answer is always normalised to ASCII A-D (positional). Options are kept
    in the order they appear in the source.
    """
    section = find_quiz_section(notes)
    if not section:
        return []
    quiz_md = notes[section[0]:section[1]]

    starts = [m.start() for m in QUESTION_START_RE.finditer(quiz_md)]
    if not starts:
        return []

    questions = []
    for i, start in enumerate(starts):
        end = starts[i + 1] if i + 1 < len(starts) else len(quiz_md)
        block = quiz_md[start:end]

        # Skip the leading `**N. ` or `N. `
        prefix_match = re.match(r"(?:\*\*)?\d+\.\s", block)
        if not prefix_match:
            continue
        body = block[prefix_match.end():]

        # Question text ends at closing `**` if bolded, else at end of line
        if body.lstrip().startswith("") and "**" in body[:300]:
            close_idx = body.find("**")
        else:
            close_idx = -1
        if close_idx > 0:
            question_text = body[:close_idx].strip()
            rest = body[close_idx + 2:]
        else:
            # No bold close — take up to first blank line
            nl_match = re.search(r"\n\s*\n", body)
            if nl_match:
                question_text = body[:nl_match.start()].strip()
                rest = body[nl_match.end():]
            else:
                question_text = body.strip()
                rest = ""

        # Strip a trailing ? alone-on-line that some markdowns wrap separately
        question_text = re.sub(r"\s+", " ", question_text).strip()

        # Extract option lines in order. Capture letter/label + text.
        # We require at least 2 options to consider it a valid question.
        labels: list[str] = []
        opt_texts: list[str] = []
        last_option_end = 0
        seen_labels: set[str] = set()
        for om in OPTION_LINE_RE.finditer(rest):
            label = om.group(1)
            text_ = _clean_option_text(om.group(2))
            # Skip duplicates (label seen already)
            if label in seen_labels:
                continue
            # Skip if label is suspicious (looks like a sentence fragment)
            if len(label) > 2 and not label.isalpha():
                continue
            labels.append(label)
            opt_texts.append(text_)
            seen_labels.add(label)
            last_option_end = max(last_option_end, om.end())
            if len(labels) >= 4:
                break

        if len(opt_texts) < 2:
            continue

        # Find the answer letter. After the options, look for the first label
        # token (matching one of the option labels) appearing in answer-y
        # contexts.
        post = rest[last_option_end:]

        # 1) `**LABEL)` or `**LABEL)**` (bolded letter+paren)
        # 2) `: LABEL)` or `： LABEL)` (after colon)
        # 3) raw line starting with the label after a checkmark
        answer_idx = None

        # Build a regex alternation of the captured labels (escape them).
        label_alt = "|".join(re.escape(l) for l in labels)
        # Walk the post-options text line by line. The answer line is the
        # first line that (a) contains a label token followed by `)` or `）`
        # and (b) carries an answer-y signal: bolded text, colon, or ✓ check.
        line_iter = re.finditer(r"^(.*)$", post, re.MULTILINE)
        answer_match = None
        for lm in line_iter:
            line = lm.group(1)
            if not (("**" in line) or (":" in line) or ("：" in line) or ("✓" in line)):
                continue
            # Find first label-token followed by `)` or `）` in this line
            tok = re.search(rf"({label_alt})[\)\）]", line)
            if not tok:
                continue
            hit_label = tok.group(1)
            if hit_label not in labels:
                continue
            answer_idx = labels.index(hit_label)
            # Build a synthetic match into `post` so explanation extraction
            # below can use .end(). Translate line-local offset to post offset.
            line_start_in_post = lm.start()
            tok_end_in_post = line_start_in_post + tok.end()

            class _Synthetic:
                def __init__(self, e):
                    self._e = e

                def end(self):
                    return self._e

            answer_match = _Synthetic(tok_end_in_post)
            break

        if answer_idx is None:
            # Fallback: assume first option
            answer_idx = 0
            answer_match = None

        # Explanation: text after the matched answer marker, taken until end
        # of line or end of block. Strip surrounding asterisks.
        explanation = ""
        if answer_match is not None:
            after = post[answer_match.end():]
            # Take up to next blank line
            nl_match = re.search(r"\n\s*\n", after)
            chunk = after[:nl_match.start()] if nl_match else after
            chunk = chunk.strip()
            # Drop leading bolded text + trailing ** noise
            chunk = re.sub(r"^\*+\s*", "", chunk)
            chunk = re.sub(r"\*+$", "", chunk).strip()
            # If chunk starts with the answer text + period, keep it as expl
            explanation = chunk

        if not question_text or len(opt_texts) < 2:
            continue

        questions.append({
            "question": question_text,
            "options": opt_texts,
            "answer": chr(65 + answer_idx),  # 0->A, 1->B, etc.
            "explanation": explanation,
        })

    return questions


def strip_quiz(notes: str) -> str:
    """Remove the entire quiz section (heading + question blocks) from notes."""
    section = find_quiz_section(notes)
    if not section:
        return notes
    cleaned = notes[:section[0]] + notes[section[1]:]
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.rstrip() + "\n"


# ---------------------------------------------------------------------------
# Source loading
# ---------------------------------------------------------------------------

def load_module(course_slug: str, mod_num: int) -> dict:
    """Return {'notes_by_locale': {'en': str, 'de': str, ...}}"""
    if course_slug == "mambo-history":
        en_path = f"{MAMBO_EN_DIR}/module_{mod_num:02d}.md"
        loc_path = f"{MAMBO_LOC_DIR}/module_{mod_num:02d}.json"
    elif course_slug == "training-science":
        en_path = f"{TRAIN_EN_DIR}/module_{mod_num}.md"
        loc_path = f"{TRAIN_LOC_DIR}/module_{mod_num:02d}.json"
    else:
        raise ValueError(course_slug)

    notes_by_locale = {}
    with open(en_path, "r", encoding="utf-8") as f:
        notes_by_locale["en"] = f.read()
    with open(loc_path, "r", encoding="utf-8") as f:
        loc = json.load(f)
    for locale in LOCALES:
        if locale in loc and isinstance(loc[locale], str):
            notes_by_locale[locale] = loc[locale]
    return notes_by_locale


def load_module_map(course_slug: str) -> dict:
    path = MAMBO_MAP if course_slug == "mambo-history" else TRAIN_MAP
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def lesson_id_from_map(course_slug: str, info: dict) -> str:
    """history map uses 'history_lesson_id'; training map uses 'lesson_id'"""
    return info.get("history_lesson_id") or info["lesson_id"]


# ---------------------------------------------------------------------------
# Per-module recovery
# ---------------------------------------------------------------------------

def recover_module(conn, course_slug: str, mod_num: int, info: dict, *,
                   dry_run: bool, verbose: bool) -> dict:
    summary = {
        "module": mod_num,
        "title": info.get("title", ""),
        "history_lesson_id": lesson_id_from_map(course_slug, info),
        "questions_per_locale": {},
        "history_notes_chars": {},
        "quiz_lessons_updated": 0,
        "skipped": False,
        "reason": None,
    }

    notes_by_locale = load_module(course_slug, mod_num)

    # Parse + clean per locale
    parsed: dict[str, dict] = {}  # locale -> {questions, notes_clean}
    for locale, raw_notes in notes_by_locale.items():
        questions = parse_questions(raw_notes)
        cleaned = strip_quiz(raw_notes)
        parsed[locale] = {"questions": questions, "notes": cleaned}
        summary["questions_per_locale"][locale] = len(questions)
        summary["history_notes_chars"][locale] = len(cleaned)

    # We need at least 2 EN questions to fill 2 quiz lessons
    en_questions = parsed.get("en", {}).get("questions", [])
    if len(en_questions) < 2:
        summary["skipped"] = True
        summary["reason"] = f"only {len(en_questions)} EN questions parsed"
        return summary

    # ---- Build cleaned content_json for the existing history lesson ----
    history_lesson_id = summary["history_lesson_id"]
    new_history_content: dict = {
        "notes": parsed["en"]["notes"],
        "questions_extracted": True,
        "translations": {},
    }
    for locale in LOCALES:
        if locale not in parsed:
            continue
        new_history_content["translations"][locale] = {
            "notes": parsed[locale]["notes"],
        }

    # ---- Look up the two existing quiz lessons under this level ----
    level_id = info["level_id"]
    quiz_rows = conn.execute(
        text("""
            SELECT id, order_index, title
            FROM lessons
            WHERE level_id = :lid AND lesson_type = 'quiz'
            ORDER BY order_index
        """),
        {"lid": level_id},
    ).fetchall()

    if len(quiz_rows) < 2:
        summary["skipped"] = True
        summary["reason"] = f"expected 2 quiz lessons, found {len(quiz_rows)}"
        return summary

    quiz_payloads = []
    for q_index in range(2):
        quiz_lesson_id = str(quiz_rows[q_index].id)
        # Build content_json for this quiz lesson
        en_q = en_questions[q_index]
        new_quiz_content: dict = {"questions": [en_q], "translations": {}}
        for locale in LOCALES:
            loc_qs = parsed.get(locale, {}).get("questions", [])
            if len(loc_qs) > q_index:
                new_quiz_content["translations"][locale] = {
                    "questions": [loc_qs[q_index]]
                }
        if not new_quiz_content["translations"]:
            new_quiz_content.pop("translations")
        quiz_payloads.append({
            "id": quiz_lesson_id,
            "content_json": json.dumps(new_quiz_content, ensure_ascii=False),
        })

    if verbose:
        print(f"\n  [{course_slug}/module {mod_num}] {summary['title']}")
        for locale in ["en"] + LOCALES:
            if locale in parsed:
                qcount = summary["questions_per_locale"][locale]
                ncount = summary["history_notes_chars"][locale]
                print(f"    {locale}: {qcount} qs parsed, notes {ncount} chars")
        for i, p in enumerate(quiz_payloads):
            print(f"    + quiz {i+1} -> lesson {p['id'][:8]}…")

    if dry_run:
        summary["quiz_lessons_updated"] = len(quiz_payloads)
        return summary

    # Update history lesson
    conn.execute(
        text("UPDATE lessons SET content_json = CAST(:cj AS jsonb) WHERE id = :id"),
        {"cj": json.dumps(new_history_content, ensure_ascii=False), "id": history_lesson_id},
    )

    # Update quiz lessons
    for p in quiz_payloads:
        conn.execute(
            text("UPDATE lessons SET content_json = CAST(:cj AS jsonb) WHERE id = :id"),
            {"cj": p["content_json"], "id": p["id"]},
        )

    summary["quiz_lessons_updated"] = len(quiz_payloads)
    return summary


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    grp = parser.add_mutually_exclusive_group()
    grp.add_argument("--dry-run", action="store_true")
    grp.add_argument("--execute", action="store_true")
    parser.add_argument("--verbose", action="store_true")
    parser.add_argument("--slug", action="append", choices=("mambo-history", "training-science"))
    args = parser.parse_args()

    dry_run = not args.execute
    slugs = tuple(args.slug) if args.slug else ("mambo-history", "training-science")

    db_url = settings.DATABASE_URL.replace("+asyncpg", "")
    engine = create_engine(db_url)

    print("=" * 72)
    print(f"Recovery — {'DRY RUN' if dry_run else 'EXECUTE'}")
    print(f"Slugs: {', '.join(slugs)}")
    print(f"DB: {db_url.rsplit('@', 1)[-1]}")
    print("=" * 72)

    totals = {"modules": 0, "skipped": 0, "quizzes_updated": 0, "locales_seen": set()}

    with engine.connect() as conn:
        trans = conn.begin()
        try:
            for slug in slugs:
                mod_map = load_module_map(slug)
                print(f"\n>> {slug} ({len(mod_map)} modules)")
                for mod_str, info in sorted(mod_map.items(), key=lambda kv: int(kv[0])):
                    mod_num = int(mod_str)
                    s = recover_module(conn, slug, mod_num, info, dry_run=dry_run, verbose=args.verbose)
                    totals["modules"] += 1
                    if s["skipped"]:
                        totals["skipped"] += 1
                        print(f"  - skip mod {mod_num}: {s['reason']}")
                    else:
                        totals["quizzes_updated"] += s["quiz_lessons_updated"]
                        totals["locales_seen"].update(s["questions_per_locale"].keys())
                        loc_summary = ",".join(
                            f"{loc}:{n}" for loc, n in s["questions_per_locale"].items() if n
                        )
                        print(f"  + mod {mod_num} ({s['title'][:50]}…): {s['quiz_lessons_updated']} quizzes [{loc_summary}]")

            if dry_run:
                trans.rollback()
            else:
                trans.commit()
        except Exception:
            trans.rollback()
            raise

    print("\n" + "=" * 72)
    print(f"Modules processed: {totals['modules']}")
    print(f"Skipped:           {totals['skipped']}")
    print(f"Quiz lessons {'planned' if dry_run else 'updated'}: {totals['quizzes_updated']}")
    print(f"Locales seen: {', '.join(sorted(totals['locales_seen']))}")
    print("=" * 72)
    if dry_run:
        print("DRY RUN — nothing persisted. Re-run with --execute.")


if __name__ == "__main__":
    main()
