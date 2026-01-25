"""
Seed graph edges (connections) between modules for all courses.
This creates the prerequisite relationships shown in the skill tree.

Usage: docker-compose exec backend python scripts/seed_graph_edges.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uuid
from sqlalchemy import create_engine, text
from config import settings

engine = create_engine(settings.DATABASE_URL.replace("+asyncpg", ""))

def get_levels_for_course(conn, course_slug: str) -> dict:
    """Get a mapping of level title -> level id for a course."""
    result = conn.execute(text("""
        SELECT l.id, l.title
        FROM levels l
        JOIN worlds w ON l.world_id = w.id
        WHERE w.slug = :slug
    """), {"slug": course_slug})

    levels = {}
    for row in result:
        levels[row[1]] = row[0]
    return levels

def get_course_id(conn, course_slug: str) -> str:
    """Get course ID by slug."""
    result = conn.execute(text("SELECT id FROM worlds WHERE slug = :slug"), {"slug": course_slug})
    row = result.fetchone()
    return str(row[0]) if row else None

def create_edge(world_id: str, from_id: str, to_id: str) -> dict:
    """Create an edge record."""
    return {
        "id": str(uuid.uuid4()),
        "world_id": world_id,
        "from_level_id": from_id,
        "to_level_id": to_id
    }

def seed_mambo_101_edges(conn):
    """
    Mambo 101 Graph Structure:

    WEEK 1: FOUNDATIONS
    Timing -> Basic Steps 1 -> Turns 1 -> Turns 2 -> Combo 1
    Basic Steps 1 -> Suzy Q 1 -> Combo 1

    WEEK 2: STYLING
    Combo 1 -> Taps 1, Son Step, Arm Styling 1, Braid
    Suzy Q 1 -> Suzy Q 2
    Taps 1, Son Step, Arm Styling 1, Braid, Suzy Q 2 -> Combo 2

    WEEK 3: TECHNIQUE
    Combo 2 -> Flares 1, Twist 1, Basic 2
    Suzy Q 2 -> Suzy Q 3
    Taps 1 -> Taps 2
    Flares 1, Twist 1, Basic 2, Suzy Q 3, Taps 2 -> Combo 3

    WEEK 4: RHYTHM
    Combo 3 -> Swing Step 1, Syncopation 1
    Swing Step 1 -> Swing Step 2 -> Combo 4
    Syncopation 1 -> Syncopation 2 -> Combo 4
    """
    levels = get_levels_for_course(conn, "mambo-101")
    world_id = get_course_id(conn, "mambo-101")

    if not levels or not world_id:
        print("  ERROR: Could not find Mambo 101 course or levels")
        return []

    edges = []

    # Week 1
    edges.append(create_edge(world_id, levels["Basic Timing"], levels["Basic Steps 1"]))
    edges.append(create_edge(world_id, levels["Basic Steps 1"], levels["Turns 1"]))
    edges.append(create_edge(world_id, levels["Basic Steps 1"], levels["Suzy Q 1"]))
    edges.append(create_edge(world_id, levels["Turns 1"], levels["Turns 2"]))
    edges.append(create_edge(world_id, levels["Turns 2"], levels["Combo 1"]))
    edges.append(create_edge(world_id, levels["Suzy Q 1"], levels["Combo 1"]))

    # Week 2
    edges.append(create_edge(world_id, levels["Combo 1"], levels["Taps 1"]))
    edges.append(create_edge(world_id, levels["Combo 1"], levels["Son Step"]))
    edges.append(create_edge(world_id, levels["Combo 1"], levels["Arm Styling 1"]))
    edges.append(create_edge(world_id, levels["Combo 1"], levels["Braid"]))
    edges.append(create_edge(world_id, levels["Suzy Q 1"], levels["Suzy Q 2"]))  # Skill track bypass
    edges.append(create_edge(world_id, levels["Taps 1"], levels["Combo 2"]))
    edges.append(create_edge(world_id, levels["Son Step"], levels["Combo 2"]))
    edges.append(create_edge(world_id, levels["Arm Styling 1"], levels["Combo 2"]))
    edges.append(create_edge(world_id, levels["Braid"], levels["Combo 2"]))
    edges.append(create_edge(world_id, levels["Suzy Q 2"], levels["Combo 2"]))

    # Week 3
    edges.append(create_edge(world_id, levels["Combo 2"], levels["Flares 1"]))
    edges.append(create_edge(world_id, levels["Combo 2"], levels["Twist 1"]))
    edges.append(create_edge(world_id, levels["Combo 2"], levels["Basic 2"]))
    edges.append(create_edge(world_id, levels["Suzy Q 2"], levels["Suzy Q 3"]))  # Skill track bypass
    edges.append(create_edge(world_id, levels["Taps 1"], levels["Taps 2"]))  # Skill track bypass
    edges.append(create_edge(world_id, levels["Flares 1"], levels["Combo 3"]))
    edges.append(create_edge(world_id, levels["Twist 1"], levels["Combo 3"]))
    edges.append(create_edge(world_id, levels["Basic 2"], levels["Combo 3"]))
    edges.append(create_edge(world_id, levels["Suzy Q 3"], levels["Combo 3"]))
    edges.append(create_edge(world_id, levels["Taps 2"], levels["Combo 3"]))

    # Week 4
    edges.append(create_edge(world_id, levels["Combo 3"], levels["Swing Step 1"]))
    edges.append(create_edge(world_id, levels["Combo 3"], levels["Syncopation 1"]))
    edges.append(create_edge(world_id, levels["Swing Step 1"], levels["Swing Step 2"]))
    edges.append(create_edge(world_id, levels["Syncopation 1"], levels["Syncopation 2"]))
    edges.append(create_edge(world_id, levels["Swing Step 2"], levels["Combo 4: Boss Battle"]))
    edges.append(create_edge(world_id, levels["Syncopation 2"], levels["Combo 4: Boss Battle"]))

    return edges

def seed_mambo_201_edges(conn):
    """Mambo 201 Graph Structure"""
    levels = get_levels_for_course(conn, "mambo-201")
    world_id = get_course_id(conn, "mambo-201")

    if not levels or not world_id:
        print("  ERROR: Could not find Mambo 201 course or levels")
        return []

    edges = []

    # Week 1: Building Blocks
    edges.append(create_edge(world_id, levels["Recap Mambo 101"], levels["Flares 2"]))
    edges.append(create_edge(world_id, levels["Recap Mambo 101"], levels["Jumps 1"]))
    edges.append(create_edge(world_id, levels["Recap Mambo 101"], levels["Suzy Q 4"]))
    edges.append(create_edge(world_id, levels["Flares 2"], levels["Combo 5"]))
    edges.append(create_edge(world_id, levels["Jumps 1"], levels["Combo 5"]))
    edges.append(create_edge(world_id, levels["Suzy Q 4"], levels["Combo 5"]))

    # Week 2: Angles & Turns
    edges.append(create_edge(world_id, levels["Combo 5"], levels["Turns 3: Double"]))
    edges.append(create_edge(world_id, levels["Combo 5"], levels["Angles 1: Diagonals"]))
    edges.append(create_edge(world_id, levels["Turns 3: Double"], levels["Combo 6"]))
    edges.append(create_edge(world_id, levels["Angles 1: Diagonals"], levels["Combo 6"]))
    edges.append(create_edge(world_id, levels["Combo 6"], levels["Angles 2: Slides"]))
    edges.append(create_edge(world_id, levels["Combo 6"], levels["Bodymovement 3"]))
    edges.append(create_edge(world_id, levels["Angles 2: Slides"], levels["Combo 7"]))
    edges.append(create_edge(world_id, levels["Bodymovement 3"], levels["Combo 7"]))

    # Week 3: Levels & Patterns
    edges.append(create_edge(world_id, levels["Suzy Q 4"], levels["Level 1: Suzy Q/Heel Twist"]))  # Skill track bypass
    edges.append(create_edge(world_id, levels["Combo 7"], levels["Ronde 1"]))
    edges.append(create_edge(world_id, levels["Combo 7"], levels["Syncopations 3"]))
    edges.append(create_edge(world_id, levels["Combo 7"], levels["Patterns 1"]))
    edges.append(create_edge(world_id, levels["Ronde 1"], levels["Combo 8"]))
    edges.append(create_edge(world_id, levels["Level 1: Suzy Q/Heel Twist"], levels["Combo 8"]))
    edges.append(create_edge(world_id, levels["Syncopations 3"], levels["Combo 9"]))
    edges.append(create_edge(world_id, levels["Patterns 1"], levels["Combo 9"]))

    # Week 4: Styling & Spin
    edges.append(create_edge(world_id, levels["Turns 3: Double"], levels["Turns 4: Spin Practice"]))  # Skill track bypass
    edges.append(create_edge(world_id, levels["Combo 9"], levels["Styling 2: Combs"]))
    edges.append(create_edge(world_id, levels["Combo 9"], levels["Styling 3: Legs"]))
    edges.append(create_edge(world_id, levels["Combo 9"], levels["Pose 1"]))
    edges.append(create_edge(world_id, levels["Styling 2: Combs"], levels["Combo 10"]))
    edges.append(create_edge(world_id, levels["Styling 3: Legs"], levels["Combo 10"]))
    edges.append(create_edge(world_id, levels["Pose 1"], levels["Combo 11: Graduation"]))
    edges.append(create_edge(world_id, levels["Turns 4: Spin Practice"], levels["Combo 11: Graduation"]))

    return edges

def seed_mambo_301_edges(conn):
    """Mambo 301 Graph Structure"""
    levels = get_levels_for_course(conn, "mambo-301")
    world_id = get_course_id(conn, "mambo-301")

    if not levels or not world_id:
        print("  ERROR: Could not find Mambo 301 course or levels")
        return []

    edges = []

    # Section 1: Complexity
    edges.append(create_edge(world_id, levels["Recap 201"], levels["Styling 4: Arms"]))
    edges.append(create_edge(world_id, levels["Recap 201"], levels["Timing 2: Son"]))
    edges.append(create_edge(world_id, levels["Recap 201"], levels["Swing Step 3"]))
    edges.append(create_edge(world_id, levels["Recap 201"], levels["Taps 3: Technique"]))
    edges.append(create_edge(world_id, levels["Styling 4: Arms"], levels["Combo 12"]))
    edges.append(create_edge(world_id, levels["Swing Step 3"], levels["Combo 12"]))
    edges.append(create_edge(world_id, levels["Taps 3: Technique"], levels["Combo 12"]))

    # Section 2: Rhythm Mastery
    edges.append(create_edge(world_id, levels["Timing 2: Son"], levels["Timing 3: Syncopation"]))  # Skill track
    edges.append(create_edge(world_id, levels["Timing 3: Syncopation"], levels["Syncopation 5"]))
    edges.append(create_edge(world_id, levels["Syncopation 5"], levels["Syncopation 6"]))
    edges.append(create_edge(world_id, levels["Combo 12"], levels["Suzy Q 5"]))
    edges.append(create_edge(world_id, levels["Syncopation 6"], levels["Combo 13"]))
    edges.append(create_edge(world_id, levels["Suzy Q 5"], levels["Combo 13"]))

    # Section 3: 3D Dancing
    edges.append(create_edge(world_id, levels["Combo 13"], levels["Flare 3"]))
    edges.append(create_edge(world_id, levels["Combo 13"], levels["Bodymovement 4"]))
    edges.append(create_edge(world_id, levels["Combo 13"], levels["Twists 3"]))
    edges.append(create_edge(world_id, levels["Combo 13"], levels["Angles 3"]))
    edges.append(create_edge(world_id, levels["Combo 13"], levels["Level 2"]))
    edges.append(create_edge(world_id, levels["Flare 3"], levels["Combo 14"]))
    edges.append(create_edge(world_id, levels["Bodymovement 4"], levels["Combo 14"]))
    edges.append(create_edge(world_id, levels["Twists 3"], levels["Combo 14"]))
    edges.append(create_edge(world_id, levels["Angles 3"], levels["Combo 14"]))
    edges.append(create_edge(world_id, levels["Level 2"], levels["Combo 14"]))

    # Section 4: The Hook & Flight
    edges.append(create_edge(world_id, levels["Combo 14"], levels["Hook Step 1"]))
    edges.append(create_edge(world_id, levels["Hook Step 1"], levels["Hook Step 2"]))  # Skill track
    edges.append(create_edge(world_id, levels["Hook Step 2"], levels["Hook Step 3"]))  # Skill track
    edges.append(create_edge(world_id, levels["Taps 3: Technique"], levels["Taps 4: Real Tap"]))  # Skill track bypass
    edges.append(create_edge(world_id, levels["Combo 14"], levels["Jumps 2"]))
    edges.append(create_edge(world_id, levels["Combo 14"], levels["Pose 2"]))
    edges.append(create_edge(world_id, levels["Hook Step 3"], levels["Combo 15: Crazy Combo"]))
    edges.append(create_edge(world_id, levels["Taps 4: Real Tap"], levels["Combo 15: Crazy Combo"]))
    edges.append(create_edge(world_id, levels["Jumps 2"], levels["Combo 15: Crazy Combo"]))
    edges.append(create_edge(world_id, levels["Pose 2"], levels["Combo 15: Crazy Combo"]))

    return edges

def seed_pachanga_edges(conn):
    """Pachanga Graph Structure"""
    levels = get_levels_for_course(conn, "pachanga")
    world_id = get_course_id(conn, "pachanga")

    if not levels or not world_id:
        print("  ERROR: Could not find Pachanga course or levels")
        return []

    edges = []

    # Phase 1: The Groove
    edges.append(create_edge(world_id, levels["History & Intro"], levels["Bounce & Timing"]))
    edges.append(create_edge(world_id, levels["Bounce & Timing"], levels["Angles"]))
    edges.append(create_edge(world_id, levels["Angles"], levels["Basic Pachanga 1"]))
    edges.append(create_edge(world_id, levels["Basic Pachanga 1"], levels["Single Single Double"]))
    edges.append(create_edge(world_id, levels["Single Single Double"], levels["Walking Pachanga"]))
    edges.append(create_edge(world_id, levels["Walking Pachanga"], levels["Mini Combo: Charleston"]))

    # Phase 2: Fancy Footwork
    edges.append(create_edge(world_id, levels["Single Single Double"], levels["Styling"]))  # Skill track bypass
    edges.append(create_edge(world_id, levels["Mini Combo: Charleston"], levels["Pachanga Kicks"]))
    edges.append(create_edge(world_id, levels["Mini Combo: Charleston"], levels["Pachanga Taps"]))
    edges.append(create_edge(world_id, levels["Pachanga Kicks"], levels["Pachanga Jumps 1 & 2"]))
    edges.append(create_edge(world_id, levels["Pachanga Taps"], levels["Syncopated Pachanga"]))
    edges.append(create_edge(world_id, levels["Pachanga Jumps 1 & 2"], levels["Glides & Shuffles"]))
    edges.append(create_edge(world_id, levels["Syncopated Pachanga"], levels["Glides & Shuffles"]))
    edges.append(create_edge(world_id, levels["Glides & Shuffles"], levels["Final Pachanga Combo"]))
    edges.append(create_edge(world_id, levels["Styling"], levels["Final Pachanga Combo"]))

    return edges

def seed_bodymovement_edges(conn):
    """Bodymovement Graph Structure"""
    levels = get_levels_for_course(conn, "bodymovement")
    world_id = get_course_id(conn, "bodymovement")

    if not levels or not world_id:
        print("  ERROR: Could not find Bodymovement course or levels")
        return []

    edges = []

    # Part 1: Isolations (linear chain)
    edges.append(create_edge(world_id, levels["Intro"], levels["Head"]))
    edges.append(create_edge(world_id, levels["Head"], levels["Shoulders"]))
    edges.append(create_edge(world_id, levels["Shoulders"], levels["Ribcage"]))
    edges.append(create_edge(world_id, levels["Ribcage"], levels["Hips"]))
    edges.append(create_edge(world_id, levels["Hips"], levels["Knees"]))
    edges.append(create_edge(world_id, levels["Knees"], levels["Basic Bodymovement 1"]))

    # Part 2: Flow & Integration
    edges.append(create_edge(world_id, levels["Basic Bodymovement 1"], levels["Arm Waves"]))
    edges.append(create_edge(world_id, levels["Arm Waves"], levels["Body Waves"]))
    edges.append(create_edge(world_id, levels["Body Waves"], levels["Side Waves"]))
    edges.append(create_edge(world_id, levels["Basic Bodymovement 1"], levels["Glides"]))
    edges.append(create_edge(world_id, levels["Basic Bodymovement 1"], levels["Shimmy"]))
    edges.append(create_edge(world_id, levels["Side Waves"], levels["Despelote"]))
    edges.append(create_edge(world_id, levels["Glides"], levels["Despelote"]))
    edges.append(create_edge(world_id, levels["Shimmy"], levels["Despelote"]))
    edges.append(create_edge(world_id, levels["Despelote"], levels["Final Body Combo"]))

    return edges

def seed_all_edges():
    """Seed all graph edges for all courses."""

    with engine.connect() as conn:
        # Clear existing edges
        print("Clearing existing edges...")
        conn.execute(text("DELETE FROM level_edges"))
        conn.commit()

        all_edges = []

        # Mambo 101
        print("\nSeeding Mambo 101 edges...")
        edges = seed_mambo_101_edges(conn)
        all_edges.extend(edges)
        print(f"  Created {len(edges)} edges")

        # Mambo 201
        print("\nSeeding Mambo 201 edges...")
        edges = seed_mambo_201_edges(conn)
        all_edges.extend(edges)
        print(f"  Created {len(edges)} edges")

        # Mambo 301
        print("\nSeeding Mambo 301 edges...")
        edges = seed_mambo_301_edges(conn)
        all_edges.extend(edges)
        print(f"  Created {len(edges)} edges")

        # Pachanga
        print("\nSeeding Pachanga edges...")
        edges = seed_pachanga_edges(conn)
        all_edges.extend(edges)
        print(f"  Created {len(edges)} edges")

        # Bodymovement
        print("\nSeeding Bodymovement edges...")
        edges = seed_bodymovement_edges(conn)
        all_edges.extend(edges)
        print(f"  Created {len(edges)} edges")

        # Insert all edges
        print(f"\nInserting {len(all_edges)} total edges...")
        for edge in all_edges:
            conn.execute(
                text("""
                    INSERT INTO level_edges (id, world_id, from_level_id, to_level_id)
                    VALUES (:id, :world_id, :from_level_id, :to_level_id)
                """),
                edge
            )
        conn.commit()

        print("\n" + "="*60)
        print("EDGE SEEDING COMPLETE!")
        print("="*60)
        print(f"\nTotal edges created: {len(all_edges)}")

if __name__ == "__main__":
    seed_all_edges()
