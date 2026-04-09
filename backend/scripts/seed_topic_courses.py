"""
Seed script for History & Training Science topic courses.
Reads markdown modules, parses content + quiz, and seeds as "history" lesson type.

Two-step process (markdown files are on host, not in Docker container):
  Step 1 (host):   python backend/scripts/seed_topic_courses.py --generate
                    → writes backend/scripts/_topic_data.json
  Step 2 (docker): docker-compose exec backend python scripts/seed_topic_courses.py
                    → reads _topic_data.json and seeds DB
"""

import sys
import os
import re
import json
import uuid

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(SCRIPT_DIR, "_topic_data.json")


# ============================================================================
# MARKDOWN PARSER
# ============================================================================

def parse_module_md(filepath: str) -> dict:
    """Parse a module markdown file into notes (markdown) and quiz (structured JSON)."""
    with open(filepath, "r", encoding="utf-8") as f:
        raw = f.read()

    # Extract title from first line
    title_match = re.match(r"^#\s+Module\s+\d+:\s*(.+)", raw)
    title = title_match.group(1).strip() if title_match else os.path.basename(filepath)

    # Split at Knowledge Check section
    quiz_split = re.split(r"##\s+Knowledge\s+Check", raw, maxsplit=1)
    notes_md = quiz_split[0].strip()

    # Parse quiz questions
    questions = []
    if len(quiz_split) > 1:
        quiz_section = quiz_split[1]
        # Stop at Watch & Listen or Further Reading
        quiz_section = re.split(r"##\s+📺|##\s+📚|---", quiz_section, maxsplit=1)[0]

        # Match each question block
        q_blocks = re.split(r"\*\*(\d+)\.\s+", quiz_section)

        i = 1
        while i < len(q_blocks) - 1:
            q_body = q_blocks[i + 1]

            # Extract question text (everything before first A))
            q_text_match = re.match(r"(.+?)\*\*\s*\n", q_body, re.DOTALL)
            question_text = q_text_match.group(1).strip() if q_text_match else ""

            # Extract options
            options = {}
            for letter in ["A", "B", "C", "D"]:
                opt_match = re.search(rf"{letter}\)\s+(.+?)(?:\n|$)", q_body)
                if opt_match:
                    options[letter] = opt_match.group(1).strip()

            # Extract correct answer
            correct_match = re.search(r"\*Correct\s+Answer:\s+([A-D])\)", q_body)
            correct = correct_match.group(1) if correct_match else "A"

            # Extract explanation
            explain_match = re.search(r"\*Correct\s+Answer:\s+[A-D]\)\s+(.+?)\*", q_body, re.DOTALL)
            explanation = explain_match.group(1).strip() if explain_match else ""

            if question_text and options:
                questions.append({
                    "question": question_text,
                    "options": options,
                    "correct": correct,
                    "explanation": explanation,
                })

            i += 2

    return {
        "title": title,
        "notes": notes_md,
        "questions": questions,
    }


# ============================================================================
# STEP 1: GENERATE — runs on host, reads markdown, writes JSON
# ============================================================================

def generate_data():
    """Parse all markdown modules and write a single JSON data file."""
    root = os.path.dirname(os.path.dirname(SCRIPT_DIR))  # project root

    topics = [
        {
            "title": "Science & History of Mambo",
            "slug": "mambo-history",
            "description": "A deep dive into the history, culture, and biomechanics of Mambo \u2014 from its Cuban roots to the global dance floor.",
            "difficulty": "OPEN",
            "course_type": "topic",
            "order_index": 6,
            "is_free": False,
            "is_published": True,
            "source_dir": os.path.join(root, "mambo_course"),
            "module_count": 20,
        },
        {
            "title": "Effective Training Guide",
            "slug": "training-science",
            "description": "Science-backed training methods to accelerate your dance learning \u2014 from optimal practice to recovery and nutrition.",
            "difficulty": "OPEN",
            "course_type": "topic",
            "order_index": 7,
            "is_free": False,
            "is_published": True,
            "source_dir": os.path.join(root, "training_science_course"),
            "module_count": 18,
        },
    ]

    output = []
    for topic in topics:
        modules = []
        for idx in range(1, topic["module_count"] + 1):
            filepath = os.path.join(topic["source_dir"], f"module_{idx}.md")
            if not os.path.exists(filepath):
                print(f"  WARNING: {filepath} not found, skipping")
                continue
            parsed = parse_module_md(filepath)
            modules.append(parsed)
            quiz_info = f" + {len(parsed['questions'])} quiz Q" if parsed["questions"] else ""
            print(f"  Module {idx}: {parsed['title']}{quiz_info}")

        output.append({
            "title": topic["title"],
            "slug": topic["slug"],
            "description": topic["description"],
            "difficulty": topic["difficulty"],
            "course_type": topic["course_type"],
            "order_index": topic["order_index"],
            "is_free": topic["is_free"],
            "is_published": topic["is_published"],
            "modules": modules,
        })
        print(f"\n  {topic['title']}: {len(modules)} modules parsed\n")

    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Wrote {DATA_FILE}")
    print("Now run: docker-compose exec backend python scripts/seed_topic_courses.py")


# ============================================================================
# STEP 2: SEED — runs in Docker, reads JSON, seeds DB
# ============================================================================

def seed_from_data():
    """Read the generated JSON data file and seed the database."""
    sys.path.insert(0, os.path.dirname(SCRIPT_DIR))
    from sqlalchemy import create_engine, text
    from config import settings

    engine = create_engine(settings.DATABASE_URL.replace("+asyncpg", ""))

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        topics = json.load(f)

    with engine.connect() as conn:
        for topic in topics:
            slug = topic["slug"]

            # Check if course already exists — delete and re-seed
            existing = conn.execute(
                text("SELECT id FROM worlds WHERE slug = :slug"),
                {"slug": slug}
            ).fetchone()

            if existing:
                world_id = str(existing[0])
                print(f"\n  '{topic['title']}' already exists (id={world_id}). Deleting and re-seeding...")
                conn.execute(text("DELETE FROM lessons WHERE level_id IN (SELECT id FROM levels WHERE world_id = :wid)"), {"wid": world_id})
                conn.execute(text("DELETE FROM level_edges WHERE world_id = :wid"), {"wid": world_id})
                conn.execute(text("DELETE FROM levels WHERE world_id = :wid"), {"wid": world_id})
                conn.execute(text("DELETE FROM worlds WHERE id = :wid"), {"wid": world_id})
                conn.commit()

            # Create World (course)
            world_id = str(uuid.uuid4())
            conn.execute(
                text("""
                    INSERT INTO worlds (id, title, description, slug, order_index, is_free, difficulty, is_published, course_type, total_duration_minutes, objectives)
                    VALUES (:id, :title, :description, :slug, :order_index, :is_free, :difficulty, :is_published, :course_type, 0, '[]'::jsonb)
                """),
                {
                    "id": world_id,
                    "title": topic["title"],
                    "description": topic["description"],
                    "slug": topic["slug"],
                    "order_index": topic["order_index"],
                    "is_free": topic["is_free"],
                    "difficulty": topic["difficulty"],
                    "is_published": topic["is_published"],
                    "course_type": topic["course_type"],
                }
            )
            print(f"\n  Created topic: {topic['title']}")

            # Seed each module
            for idx, mod in enumerate(topic["modules"], 1):
                level_id = str(uuid.uuid4())
                lesson_id = str(uuid.uuid4())

                # Calculate grid position (3 columns, 0-100 range like existing courses)
                # Tree grows bottom-to-top: first module at bottom (high y), last at top (low y)
                total = len(topic["modules"])
                col = (idx - 1) % 3          # 0, 1, 2
                row = (idx - 1) // 3          # 0, 1, 2, ...
                max_row = (total - 1) // 3
                x_pos = 30 + col * 20         # 30, 50, 70
                y_pos = 95 - row * (80 / max(max_row, 1))  # bottom-to-top within 15-95

                # Create Level (module node)
                conn.execute(
                    text("""
                        INSERT INTO levels (id, world_id, title, order_index, outcome, duration_minutes, total_xp, status, x_position, y_position)
                        VALUES (:id, :world_id, :title, :order_index, :outcome, 10, 50, 'active', :x_position, :y_position)
                    """),
                    {
                        "id": level_id,
                        "world_id": world_id,
                        "title": mod["title"],
                        "order_index": idx,
                        "outcome": f"Complete: {mod['title']}",
                        "x_position": float(x_pos),
                        "y_position": float(y_pos),
                    }
                )

                # Build content_json
                content_json = {"notes": mod["notes"]}
                if mod.get("questions"):
                    content_json["questions"] = mod["questions"]

                # Create Lesson (history type)
                desc = mod["notes"][:200] + "..." if len(mod["notes"]) > 200 else mod["notes"]
                conn.execute(
                    text("""
                        INSERT INTO lessons (id, level_id, title, description, video_url, xp_value, order_index, is_boss_battle, duration_minutes, lesson_type, content_json)
                        VALUES (:id, :level_id, :title, :description, '', 50, 1, false, 10, 'history', CAST(:content_json AS jsonb))
                    """),
                    {
                        "id": lesson_id,
                        "level_id": level_id,
                        "title": mod["title"],
                        "description": desc,
                        "content_json": json.dumps(content_json, ensure_ascii=False),
                    }
                )

                quiz_info = f" + {len(mod['questions'])} quiz Q" if mod.get("questions") else ""
                print(f"    Module {idx}: {mod['title']}{quiz_info}")

            conn.commit()

        print("\n" + "=" * 60)
        print("TOPIC SEED COMPLETE!")
        print("=" * 60)
        for topic in topics:
            print(f"  {topic['title']} ({len(topic['modules'])} modules) — slug: {topic['slug']}")
        print()


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    if "--generate" in sys.argv:
        generate_data()
    else:
        if not os.path.exists(DATA_FILE):
            print(f"ERROR: {DATA_FILE} not found.")
            print("Run with --generate on the host first to create it.")
            sys.exit(1)
        seed_from_data()
