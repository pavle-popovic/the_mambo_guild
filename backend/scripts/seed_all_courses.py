"""
Comprehensive seed script for all courses and modules.
Run this after dropping containers to recreate all course data.

Usage: docker-compose exec backend python scripts/seed_all_courses.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
from sqlalchemy import create_engine, text
from config import settings

# Connect to database
engine = create_engine(settings.DATABASE_URL.replace("+asyncpg", ""))

# ============================================================================
# COURSE DEFINITIONS
# ============================================================================

COURSES = [
    {
        "id": str(uuid.uuid4()),
        "title": "Mambo 101",
        "slug": "mambo-101",
        "description": "Master the fundamentals of Mambo dancing. Build your foundation with timing, basic steps, turns, and essential styling.",
        "difficulty": "BEGINNER",
        "course_type": "course",
        "order_index": 1,
        "is_free": True,
        "is_published": True,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Mambo 201",
        "slug": "mambo-201",
        "description": "Elevate your Mambo with advanced turns, angles, levels, and styling techniques. Build on your 101 foundation.",
        "difficulty": "INTERMEDIATE",
        "course_type": "course",
        "order_index": 2,
        "is_free": False,
        "is_published": True,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Mambo 301",
        "slug": "mambo-301",
        "description": "Master advanced Mambo techniques including hooks, complex syncopations, 3D movement, and performance-level combinations.",
        "difficulty": "ADVANCED",
        "course_type": "course",
        "order_index": 3,
        "is_free": False,
        "is_published": True,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Pachanga",
        "slug": "pachanga",
        "description": "Learn the playful and energetic Pachanga style. Perfect for all levels - from beginners to professionals looking to add flair.",
        "difficulty": "Open",
        "course_type": "topic",
        "order_index": 4,
        "is_free": False,
        "is_published": True,
    },
    {
        "id": str(uuid.uuid4()),
        "title": "Bodymovement",
        "slug": "bodymovement",
        "description": "Develop body isolations, waves, and flow. Essential for any dancer looking to add texture and style to their movement.",
        "difficulty": "Open",
        "course_type": "topic",
        "order_index": 5,
        "is_free": False,
        "is_published": True,
    },
]

# ============================================================================
# MODULE DEFINITIONS BY COURSE
# ============================================================================

def get_mambo_101_modules(course_id: str):
    """Mambo 101 - 4 Weeks: Foundations"""
    return [
        # WEEK 1: FOUNDATIONS
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Basic Timing", "order_index": 1, "outcome": "Understand the 8-count rhythm"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Basic Steps 1", "order_index": 2, "outcome": "Master the basic step pattern"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Turns 1", "order_index": 3, "outcome": "Learn basic turn technique"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Turns 2", "order_index": 4, "outcome": "Build turn confidence"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Suzy Q 1", "order_index": 5, "outcome": "Start the Suzy Q skill track"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 1", "order_index": 6, "outcome": "Combine Week 1 skills"},

        # WEEK 2: STYLING
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Taps 1", "order_index": 7, "outcome": "Add taps to your movement"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Son Step", "order_index": 8, "outcome": "Learn the traditional Son step"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Arm Styling 1", "order_index": 9, "outcome": "Basic arm movements"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Braid", "order_index": 10, "outcome": "Master the braid step"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Suzy Q 2", "order_index": 11, "outcome": "Advance your Suzy Q"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 2", "order_index": 12, "outcome": "Combine Week 2 skills"},

        # WEEK 3: TECHNIQUE
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Flares 1", "order_index": 13, "outcome": "Introduction to flares"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Twist 1", "order_index": 14, "outcome": "Basic twist technique"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Basic 2", "order_index": 15, "outcome": "Advanced basic variations"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Suzy Q 3", "order_index": 16, "outcome": "Master Suzy Q variations"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Taps 2", "order_index": 17, "outcome": "Advanced tap patterns"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 3", "order_index": 18, "outcome": "Combine Week 3 skills"},

        # WEEK 4: RHYTHM
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Swing Step 1", "order_index": 19, "outcome": "Learn swing step basics"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Syncopation 1", "order_index": 20, "outcome": "Introduction to syncopation"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Swing Step 2", "order_index": 21, "outcome": "Advanced swing variations"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Syncopation 2", "order_index": 22, "outcome": "Syncopation patterns"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 4: Boss Battle", "order_index": 23, "outcome": "Final 101 combination"},
    ]

def get_mambo_201_modules(course_id: str):
    """Mambo 201 - 4 Weeks: Building on foundations"""
    return [
        # WEEK 1: BUILDING BLOCKS
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Recap Mambo 101", "order_index": 1, "outcome": "Refresh your foundations"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Flares 2", "order_index": 2, "outcome": "Advanced flare technique"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Jumps 1", "order_index": 3, "outcome": "Introduction to jumps"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Suzy Q 4", "order_index": 4, "outcome": "Continue Suzy Q mastery"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 5", "order_index": 5, "outcome": "Combine Week 1 skills"},

        # WEEK 2: ANGLES & TURNS
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Turns 3: Double", "order_index": 6, "outcome": "Master double turns"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Angles 1: Diagonals", "order_index": 7, "outcome": "Diagonal movement patterns"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 6", "order_index": 8, "outcome": "Mid-week checkpoint"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Angles 2: Slides", "order_index": 9, "outcome": "Sliding diagonal movements"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Bodymovement 3", "order_index": 10, "outcome": "Integrate body movement"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 7", "order_index": 11, "outcome": "End of Week 2 combo"},

        # WEEK 3: LEVELS & PATTERNS
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Level 1: Suzy Q/Heel Twist", "order_index": 12, "outcome": "Low level movement"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Ronde 1", "order_index": 13, "outcome": "Circular leg movements"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Syncopations 3", "order_index": 14, "outcome": "Complex syncopation"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Patterns 1", "order_index": 15, "outcome": "Floor pattern awareness"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 8", "order_index": 16, "outcome": "Mid-week checkpoint"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 9", "order_index": 17, "outcome": "End of Week 3 combo"},

        # WEEK 4: STYLING & SPIN
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Turns 4: Spin Practice", "order_index": 18, "outcome": "Spin technique drills"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Styling 2: Combs", "order_index": 19, "outcome": "Hand/arm styling details"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Styling 3: Legs", "order_index": 20, "outcome": "Leg styling techniques"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Pose 1", "order_index": 21, "outcome": "Posing fundamentals"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 10", "order_index": 22, "outcome": "Mid-week combo"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 11: Graduation", "order_index": 23, "outcome": "201 Graduation combo"},
    ]

def get_mambo_301_modules(course_id: str):
    """Mambo 301 - 4 Sections: Advanced mastery"""
    return [
        # SECTION 1: COMPLEXITY
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Recap 201", "order_index": 1, "outcome": "Review intermediate skills"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Styling 4: Arms", "order_index": 2, "outcome": "Advanced arm styling"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Timing 2: Son", "order_index": 3, "outcome": "Son timing mastery"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Swing Step 3", "order_index": 4, "outcome": "Advanced swing variations"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Taps 3: Technique", "order_index": 5, "outcome": "Technical tap mastery"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 12", "order_index": 6, "outcome": "Section 1 combination"},

        # SECTION 2: RHYTHM MASTERY
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Timing 3: Syncopation", "order_index": 7, "outcome": "Syncopated timing"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Syncopation 5", "order_index": 8, "outcome": "Advanced syncopation"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Syncopation 6", "order_index": 9, "outcome": "Expert syncopation"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Suzy Q 5", "order_index": 10, "outcome": "Master level Suzy Q"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 13", "order_index": 11, "outcome": "Section 2 combination"},

        # SECTION 3: 3D DANCING
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Flare 3", "order_index": 12, "outcome": "Expert flare technique"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Bodymovement 4", "order_index": 13, "outcome": "Advanced body movement"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Twists 3", "order_index": 14, "outcome": "Complex twist patterns"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Angles 3", "order_index": 15, "outcome": "Multi-directional angles"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Level 2", "order_index": 16, "outcome": "Advanced level changes"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 14", "order_index": 17, "outcome": "Section 3 combination"},

        # SECTION 4: THE HOOK & FLIGHT
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Hook Step 1", "order_index": 18, "outcome": "Introduction to hooks"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Hook Step 2", "order_index": 19, "outcome": "Hook variations"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Hook Step 3", "order_index": 20, "outcome": "Master hooks"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Taps 4: Real Tap", "order_index": 21, "outcome": "Authentic tap technique"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Jumps 2", "order_index": 22, "outcome": "Advanced jump patterns"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Pose 2", "order_index": 23, "outcome": "Advanced posing"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Combo 15: Crazy Combo", "order_index": 24, "outcome": "Final 301 masterpiece"},
    ]

def get_pachanga_modules(course_id: str):
    """Pachanga - 2 Phases: The Groove"""
    return [
        # PHASE 1: THE GROOVE
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "History & Intro", "order_index": 1, "outcome": "Understand Pachanga origins"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Bounce & Timing", "order_index": 2, "outcome": "Feel the Pachanga groove"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Angles", "order_index": 3, "outcome": "Pachanga directional work"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Basic Pachanga 1", "order_index": 4, "outcome": "Core Pachanga step"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Single Single Double", "order_index": 5, "outcome": "Key rhythm pattern"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Walking Pachanga", "order_index": 6, "outcome": "Walking variations"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Mini Combo: Charleston", "order_index": 7, "outcome": "Charleston-style combo"},

        # PHASE 2: FANCY FOOTWORK
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Styling", "order_index": 8, "outcome": "Pachanga styling details"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Pachanga Kicks", "order_index": 9, "outcome": "Kick techniques"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Pachanga Taps", "order_index": 10, "outcome": "Tap variations"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Pachanga Jumps 1 & 2", "order_index": 11, "outcome": "Jump patterns"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Syncopated Pachanga", "order_index": 12, "outcome": "Syncopated rhythms"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Glides & Shuffles", "order_index": 13, "outcome": "Smooth floor work"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Final Pachanga Combo", "order_index": 14, "outcome": "Complete Pachanga routine"},
    ]

def get_bodymovement_modules(course_id: str):
    """Bodymovement - 2 Parts: Isolations & Flow"""
    return [
        # PART 1: ISOLATIONS
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Intro", "order_index": 1, "outcome": "Body awareness foundations"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Head", "order_index": 2, "outcome": "Head isolation control"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Shoulders", "order_index": 3, "outcome": "Shoulder isolation mastery"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Ribcage", "order_index": 4, "outcome": "Ribcage isolation control"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Hips", "order_index": 5, "outcome": "Hip isolation patterns"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Knees", "order_index": 6, "outcome": "Knee articulation"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Basic Bodymovement 1", "order_index": 7, "outcome": "Combine isolations"},

        # PART 2: FLOW & INTEGRATION
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Arm Waves", "order_index": 8, "outcome": "Flowing arm movement"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Body Waves", "order_index": 9, "outcome": "Full body wave technique"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Side Waves", "order_index": 10, "outcome": "Lateral wave patterns"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Glides", "order_index": 11, "outcome": "Smooth gliding movement"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Shimmy", "order_index": 12, "outcome": "Shimmy technique"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Despelote", "order_index": 13, "outcome": "Despelote mastery"},
        {"id": str(uuid.uuid4()), "world_id": course_id, "title": "Final Body Combo", "order_index": 14, "outcome": "Complete body routine"},
    ]

# ============================================================================
# MAIN SEED FUNCTION
# ============================================================================

def seed_all_courses():
    """Seed all courses and modules into the database."""

    with engine.connect() as conn:
        # First, clear existing data (optional - comment out if you want to keep existing data)
        print("Clearing existing courses and modules...")
        conn.execute(text("DELETE FROM lessons"))
        conn.execute(text("DELETE FROM levels"))
        conn.execute(text("DELETE FROM worlds"))
        conn.commit()
        print("Cleared existing data.")

        # Insert courses
        print("\nCreating courses...")
        for course in COURSES:
            conn.execute(
                text("""
                    INSERT INTO worlds (id, title, description, slug, order_index, is_free, difficulty, is_published, course_type, total_duration_minutes, objectives)
                    VALUES (:id, :title, :description, :slug, :order_index, :is_free, :difficulty, :is_published, :course_type, 0, '[]'::jsonb)
                """),
                course
            )
            print(f"  Created: {course['title']} ({course['difficulty']})")
        conn.commit()

        # Insert modules for each course
        print("\nCreating modules...")

        module_getters = {
            "Mambo 101": get_mambo_101_modules,
            "Mambo 201": get_mambo_201_modules,
            "Mambo 301": get_mambo_301_modules,
            "Pachanga": get_pachanga_modules,
            "Bodymovement": get_bodymovement_modules,
        }

        for course in COURSES:
            modules = module_getters[course["title"]](course["id"])
            print(f"\n  {course['title']} ({len(modules)} modules):")

            for module in modules:
                # Calculate grid position (3 columns layout)
                x_pos = ((module["order_index"] - 1) % 3) * 200 + 100
                y_pos = ((module["order_index"] - 1) // 3) * 150 + 100

                conn.execute(
                    text("""
                        INSERT INTO levels (id, world_id, title, order_index, outcome, duration_minutes, total_xp, status, x_position, y_position)
                        VALUES (:id, :world_id, :title, :order_index, :outcome, 0, 0, 'active', :x_position, :y_position)
                    """),
                    {**module, "x_position": x_pos, "y_position": y_pos}
                )
                print(f"    - {module['title']}")

        conn.commit()

        print("\n" + "="*60)
        print("SEED COMPLETE!")
        print("="*60)
        print(f"\nCreated {len(COURSES)} courses:")
        for course in COURSES:
            module_count = len(module_getters[course["title"]](course["id"]))
            print(f"  - {course['title']}: {course['difficulty']} ({module_count} modules)")
        print("\nAll courses and modules have been seeded successfully!")

if __name__ == "__main__":
    seed_all_courses()
