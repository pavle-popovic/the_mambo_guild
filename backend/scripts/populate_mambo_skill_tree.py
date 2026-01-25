"""
Populate Mambo 101 with Skill Tree Graph Structure

This script:
1. Finds the Mambo 101 course
2. Deletes existing week/day-based lessons
3. Creates skill tree nodes (Levels) based on the graph structure
4. Creates edges between nodes
5. Populates lessons for each node
"""

import sys
import os
import asyncio
from typing import List, Dict, Tuple

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from models import get_engine, Base
from models.course import World, Level, Lesson, LevelEdge
from models.progress import UserProgress  # Add this import


# Graph structure from the mermaid diagram
SKILL_TREE_NODES = {
    # Week 1
    "Timing": {"title": "Basic Timing", "x": 10, "y": 10, "week": 1, "day": 1},
    "BasicSteps1": {"title": "Basic Steps 1", "x": 30, "y": 10, "week": 1, "day": 2},
    "Turns1": {"title": "Turns 1", "x": 50, "y": 5, "week": 1, "day": 3},
    "SuzyQ1": {"title": "Suzy Q 1", "x": 50, "y": 15, "week": 1, "day": 5},
    "Turns2": {"title": "Turns 2", "x": 70, "y": 5, "week": 1, "day": 4},
    "Combo1": {"title": "COMBO 1", "x": 90, "y": 10, "week": 1, "day": 6, "is_combo": True},
    
    # Week 2
    "Taps1": {"title": "Taps 1", "x": 10, "y": 30, "week": 2, "day": 2},
    "SonStep": {"title": "Son Step", "x": 30, "y": 30, "week": 2, "day": 3},
    "ArmStyling": {"title": "Arm Styling 1", "x": 50, "y": 30, "week": 2, "day": 4},
    "Braid": {"title": "Braid", "x": 70, "y": 30, "week": 2, "day": 5},
    "SuzyQ2": {"title": "Suzy Q 2", "x": 50, "y": 40, "week": 2, "day": 1},
    "Combo2": {"title": "COMBO 2", "x": 90, "y": 35, "week": 2, "day": 6, "is_combo": True},
    
    # Week 3
    "Flares1": {"title": "Flares 1", "x": 10, "y": 55, "week": 3, "day": 1},
    "Twist1": {"title": "Twist 1", "x": 30, "y": 55, "week": 3, "day": 3},
    "Basic2": {"title": "Basic Steps 2", "x": 50, "y": 55, "week": 3, "day": 4},
    "SuzyQ3": {"title": "Suzy Q 3", "x": 50, "y": 65, "week": 3, "day": 2},
    "Taps2": {"title": "Taps 2", "x": 10, "y": 65, "week": 3, "day": 5},
    "Combo3": {"title": "COMBO 3", "x": 90, "y": 60, "week": 3, "day": 6, "is_combo": True},
    
    # Week 4
    "Swing1": {"title": "Swing Step 1", "x": 30, "y": 80, "week": 4, "day": 1},
    "Synco1": {"title": "Syncopation 1", "x": 50, "y": 80, "week": 4, "day": 3},
    "Swing2": {"title": "Swing Step 2", "x": 30, "y": 90, "week": 4, "day": 2},
    "Synco2": {"title": "Syncopation 2", "x": 50, "y": 90, "week": 4, "day": 4},
    "Combo4": {"title": "COMBO 4: BOSS BATTLE", "x": 70, "y": 85, "week": 4, "day": 5, "is_combo": True, "is_boss": True},
}

# Edges from the graph (dependencies)
SKILL_TREE_EDGES = [
    # Week 1
    ("Timing", "BasicSteps1"),
    ("BasicSteps1", "Turns1"),
    ("BasicSteps1", "SuzyQ1"),
    ("Turns1", "Turns2"),
    ("Turns2", "Combo1"),
    ("SuzyQ1", "Combo1"),
    
    # Week 2
    ("Combo1", "Taps1"),
    ("Combo1", "SonStep"),
    ("Combo1", "ArmStyling"),
    ("Combo1", "Braid"),
    ("SuzyQ1", "SuzyQ2"),  # Skill track bypass
    ("Taps1", "Combo2"),
    ("SonStep", "Combo2"),
    ("ArmStyling", "Combo2"),
    ("Braid", "Combo2"),
    ("SuzyQ2", "Combo2"),
    
    # Week 3
    ("Combo2", "Flares1"),
    ("Combo2", "Twist1"),
    ("Combo2", "Basic2"),
    ("SuzyQ2", "SuzyQ3"),  # Skill track bypass
    ("Taps1", "Taps2"),  # Skill track bypass
    ("Flares1", "Combo3"),
    ("Twist1", "Combo3"),
    ("Basic2", "Combo3"),
    ("SuzyQ3", "Combo3"),
    ("Taps2", "Combo3"),
    
    # Week 4
    ("Combo3", "Swing1"),
    ("Combo3", "Synco1"),
    ("Swing1", "Swing2"),
    ("Synco1", "Synco2"),
    ("Swing2", "Combo4"),
    ("Synco2", "Combo4"),
]

# Lesson data mapping (from CSV)
LESSON_DATA = {
    (1, 1): [  # Week 1, Day 1: Basic Timing
        {"title": "Welcome to Mambo 101! A warm welcome note", "order": 1},
        {"title": "Quick intro to Mambo history, Mambo time", "order": 2},
        {"title": "Side Step Mechanic, Front steps, Back steps", "order": 3},
        {"title": "Drill: Side Steps to music", "order": 4},
        {"title": "Notes Recap", "order": 5, "type": "history"},
        {"title": "Quiz", "order": 6, "type": "quiz"},
    ],
    (1, 2): [  # Week 1, Day 2: Basic Steps 1
        {"title": "Basic step, break forward and back", "order": 1},
        {"title": "Drill: Side step and basic step", "order": 2},
        {"title": "Notes Recap", "order": 3, "type": "history"},
        {"title": "Practice drill", "order": 4},
        {"title": "Notes Recap", "order": 5, "type": "history"},
    ],
    (1, 3): [  # Week 1, Day 3: Turns 1
        {"title": "Right turn, prep on 2", "order": 1},
        {"title": "Side step and basic step drill, and right turn", "order": 2},
        {"title": "Notes Recap", "order": 3, "type": "history"},
        {"title": "History: Eddie Torres and on2", "order": 4, "type": "history"},
    ],
    (1, 4): [  # Week 1, Day 4: Turns 2
        {"title": "Left turn", "order": 1},
        {"title": "Variation: Broken Left turn", "order": 2},
        {"title": "Drill: Basic, Side, Right and Left turns", "order": 3},
        {"title": "Notes Recap", "order": 4, "type": "history"},
        {"title": "Quiz", "order": 5, "type": "quiz"},
    ],
    (1, 5): [  # Week 1, Day 5: Suzy Q 1
        {"title": "Crosses on cord beats, front and back", "order": 1},
        {"title": "Suzy q. Technique and flow", "order": 2},
        {"title": "Drill: Basic, suzy q, Cord Steps", "order": 3},
        {"title": "Notes Recap", "order": 4, "type": "history"},
        {"title": "Quiz", "order": 5, "type": "quiz"},
    ],
    (1, 6): [  # Week 1, Day 6: Combo 1
        {"title": "Combination: Full routine", "order": 1},
        {"title": "Drill: The Combination", "order": 2},
        {"title": "Practice tip", "order": 3, "type": "history"},
        {"title": "Congratulations on week 1!", "order": 4, "type": "history"},
    ],
    # Week 2
    (2, 1): [  # Week 2, Day 1: Suzy Q 2
        {"title": "Recap & Variations", "order": 1},
        {"title": "More Variations: 2 Cord steps + Suzy Q", "order": 2},
        {"title": "Drill: Variations and turns", "order": 3},
        {"title": "Notes Recap", "order": 4, "type": "history"},
        {"title": "Touches or Taps", "order": 5},
        {"title": "History: The Suzy Q move", "order": 6, "type": "history"},
    ],
    (2, 2): [  # Week 2, Day 2: Taps 1
        {"title": "Taps variations: Diagonal", "order": 1},
        {"title": "Drill: Tap variations", "order": 2},
        {"title": "Notes Recap", "order": 3, "type": "history"},
        {"title": "Quiz", "order": 4, "type": "quiz"},
    ],
    (2, 3): [  # Week 2, Day 3: Son Step
        {"title": "Back step and Son steps", "order": 1},
        {"title": "Son Step (Tiempo) with styling", "order": 2},
        {"title": "Drill: Son Steps and variations", "order": 3},
        {"title": "Notes Recap", "order": 4, "type": "history"},
        {"title": "History: Son Cubano, Danzon, Mambo", "order": 5, "type": "history"},
    ],
    (2, 4): [  # Arm Styling
        {"title": "Basic arms in mambo and salsa", "order": 1},
        {"title": "Drill: Son Steps with arms", "order": 2},
        {"title": "Notes Recap", "order": 3, "type": "history"},
        {"title": "Quiz", "order": 4, "type": "quiz"},
    ],
    (2, 5): [  # Braid
        {"title": "Fall off the log step", "order": 1},
        {"title": "Drill: Fall off the log variations", "order": 2},
        {"title": "Notes Recap", "order": 3, "type": "history"},
        {"title": "History: Charleston influence", "order": 4, "type": "history"},
    ],
    (2, 6): [  # Combo 2
        {"title": "Combination: Full Week 2 routine", "order": 1},
        {"title": "Drill: The Combination", "order": 2},
        {"title": "Practice tip", "order": 3, "type": "history"},
        {"title": "Congratulations on week 2!", "order": 4, "type": "history"},
    ],
    # Week 3
    (3, 1): [  # Flares 1
        {"title": "Introduction to flares: Tres tres", "order": 1},
        {"title": "Variation: And 1 flare on basic", "order": 2},
        {"title": "Drill: Basics with flares", "order": 3},
        {"title": "Notes Recap", "order": 4, "type": "history"},
        {"title": "Quiz", "order": 5, "type": "quiz"},
    ],
    (3, 2): [  # Suzy Q 3
        {"title": "Cross overs and crosses back", "order": 1},
        {"title": "Spiral step variations", "order": 2},
        {"title": "Drill: Cross overs and spirals", "order": 3},
        {"title": "Notes Recap", "order": 4, "type": "history"},
        {"title": "History", "order": 5, "type": "history"},
    ],
    (3, 3): [  # Twist 1
        {"title": "Twisting in place: dissociation", "order": 1},
        {"title": "Variation: Basic with heel twist", "order": 2},
        {"title": "Drill: Basic variations and twists", "order": 3},
        {"title": "Notes Recap", "order": 4, "type": "history"},
        {"title": "History: Bebop and the mambo twist", "order": 5, "type": "history"},
    ],
    (3, 4): [  # Basic 2
        {"title": "Brinko step: Classic mambo move", "order": 1},
        {"title": "Drill: Steps of the Day", "order": 2},
        {"title": "Notes Recap", "order": 3, "type": "history"},
        {"title": "Quiz", "order": 4, "type": "quiz"},
    ],
    (3, 5): [  # Taps 2
        {"title": "Toe Heel Toe Step", "order": 1},
        {"title": "Drill: Taps variations", "order": 2},
        {"title": "Notes Recap", "order": 3, "type": "history"},
        {"title": "Quiz", "order": 4, "type": "quiz"},
    ],
    (3, 6): [  # Combo 3
        {"title": "Combination: Full Week 3 routine", "order": 1},
        {"title": "Drill: The Combination", "order": 2},
        {"title": "Practice tip", "order": 3, "type": "history"},
        {"title": "Congratulations on week 3!", "order": 4, "type": "history"},
    ],
    # Week 4
    (4, 1): [  # Swing 1
        {"title": "Swing Step! The and 1 flare", "order": 1},
        {"title": "Full Swing step", "order": 2},
        {"title": "Drill: Swing Step", "order": 3},
        {"title": "Notes Recap", "order": 4, "type": "history"},
        {"title": "History: Palladium swing step", "order": 5, "type": "history"},
    ],
    (4, 2): [  # Swing 2
        {"title": "Front and back Swing step", "order": 1},
        {"title": "Diagonal Swing Step", "order": 2},
        {"title": "Drill: All Swing variations", "order": 3},
        {"title": "Notes Recap", "order": 4, "type": "history"},
    ],
    (4, 3): [  # Synco 1
        {"title": "Cha cha cha rhythm", "order": 1},
        {"title": "Pas de bourre variations", "order": 2},
        {"title": "Drill: Cha Cha Cha rhythms", "order": 3},
        {"title": "Notes Recap", "order": 4, "type": "history"},
    ],
    (4, 4): [  # Synco 2
        {"title": "Mambo jazz: kick and flare", "order": 1},
        {"title": "Drill: Cha Cha and kick ball change", "order": 2},
        {"title": "Notes Recap", "order": 3, "type": "history"},
        {"title": "Quiz", "order": 4, "type": "quiz"},
    ],
    (4, 5): [  # Combo 4 - Boss Battle
        {"title": "Choreo Part 1", "order": 1},
        {"title": "Drill: Choreo Part 1", "order": 2},
        {"title": "Choreo Part 2", "order": 3},
        {"title": "Drill: Choreo Part 2", "order": 4},
        {"title": "Choreo Part 3", "order": 5},
        {"title": "Drill: Choreo Part 3", "order": 6},
        {"title": "Challenge: Full Choreo", "order": 7},
        {"title": "CONGRATULATION! Course Complete", "order": 8, "type": "history"},
    ],
}


async def populate_mambo_101_skill_tree():
    """Main function to populate Mambo 101 with skill tree structure"""
    from sqlalchemy.orm import sessionmaker
    
    engine = get_engine()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db: Session = SessionLocal()
    
    try:
        # Find Mambo 101 course
        course = db.query(World).filter(World.title == "Mambo 101").first()
        if not course:
            print("ERROR: Mambo 101 course not found!")
            return
        
        print(f"Found course: {course.title} (ID: {course.id})")
        
        # Step 1: Delete all existing lessons, levels, edges, and user progress
        print("\n--- Deleting existing data ---")
        
        # Delete all edges for this world
        db.query(LevelEdge).filter(LevelEdge.world_id == course.id).delete()
        
        # Delete user progress for all lessons in this course
        for level in course.levels:
            for lesson in level.lessons:
                # Delete user progress for this lesson
                db.query(UserProgress).filter(UserProgress.lesson_id == lesson.id).delete()
                # Delete the lesson
                db.delete(lesson)
            # Delete the level
            db.delete(level)
        
        db.commit()
        print("Deleted all existing data")
        
        # Step 2: Create new skill tree nodes (Levels)
        print("\n--- Creating skill tree nodes ---")
        node_map = {}  # Map node keys to Level objects
        
        for node_key, node_data in SKILL_TREE_NODES.items():
            level = Level(
                world_id=course.id,
                title=node_data["title"],
                description=f"Module for {node_data['title']}",
                order_index=len(node_map),
                x_position=node_data["x"],
                y_position=node_data["y"],
            )
            db.add(level)
            db.flush()  # Get the ID
            node_map[node_key] = level
            print(f"Created node: {node_data['title']} at ({node_data['x']}, {node_data['y']})")
        
        db.commit()
        
        # Step 3: Create edges
        print("\n--- Creating edges ---")
        for from_key, to_key in SKILL_TREE_EDGES:
            if from_key not in node_map or to_key not in node_map:
                print(f"WARNING: Skipping edge {from_key} -> {to_key} (node not found)")
                continue
            
            edge = LevelEdge(
                world_id=course.id,
                from_level_id=node_map[from_key].id,
                to_level_id=node_map[to_key].id,
            )
            db.add(edge)
            print(f"Created edge: {from_key} -> {to_key}")
        
        db.commit()
        
        # Step 4: Populate lessons for each node
        print("\n--- Populating lessons ---")
        for node_key, node_data in SKILL_TREE_NODES.items():
            week = node_data["week"]
            day = node_data["day"]
            level = node_map[node_key]
            
            lesson_data = LESSON_DATA.get((week, day), [])
            if not lesson_data:
                print(f"WARNING: No lesson data for {node_data['title']} (Week {week}, Day {day})")
                continue
            
            print(f"\nAdding {len(lesson_data)} lessons to {node_data['title']}:")
            for lesson in lesson_data:
                lesson_type = lesson.get("type", "video")
                is_boss = node_data.get("is_boss", False) and lesson["order"] == len(lesson_data)
                
                new_lesson = Lesson(
                    level_id=level.id,
                    title=lesson["title"],
                    description=f"Lesson {lesson['order']} for {node_data['title']}",
                    video_url="",  # Will be populated by admin
                    xp_value=50 if not is_boss else 100,
                    order_index=lesson["order"] - 1,
                    is_boss_battle=is_boss,
                    lesson_type=lesson_type,
                )
                db.add(new_lesson)
                print(f"  - {lesson['title']} ({lesson_type})")
        
        db.commit()
        
        print("\n✅ Successfully populated Mambo 101 with skill tree structure!")
        print(f"Created {len(node_map)} nodes with {len(SKILL_TREE_EDGES)} edges")
        
    except Exception as e:
        print(f"ERROR: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(populate_mambo_101_skill_tree())
