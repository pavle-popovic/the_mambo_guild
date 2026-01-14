"""
Script to create the default Mambo courses.
Run with: python scripts/create_default_courses.py
"""
import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_db, Base, engine
from models.course import World, Difficulty
import uuid

def create_default_courses():
    """Create Mambo 101, 201, and 301 courses."""
    db = next(get_db())
    
    try:
        courses = [
            {
                "title": "Mambo 101",
                "description": "Welcome to Mambo 101! This beginner-friendly course will introduce you to the fundamentals of salsa dancing. Learn the basic steps, rhythm, and essential techniques that form the foundation of mambo. Perfect for those taking their first steps into the world of Latin dance.",
                "slug": "mambo-101",
                "order_index": 1,
                "is_free": True,
                "difficulty": Difficulty.BEGINNER,
                "is_published": True,
                "image_url": None
            },
            {
                "title": "Mambo 201",
                "description": "Take your mambo skills to the next level with Mambo 201. This intermediate course builds upon the fundamentals, introducing more complex patterns, combinations, and styling techniques. You'll refine your timing, learn new moves, and develop the confidence to dance with partners.",
                "slug": "mambo-201",
                "order_index": 2,
                "is_free": False,
                "difficulty": Difficulty.INTERMEDIATE,
                "is_published": True,
                "image_url": None
            },
            {
                "title": "Mambo 301",
                "description": "Master the art of mambo with our advanced course. Mambo 301 challenges you with intricate patterns, advanced footwork, and professional styling techniques. Perfect your musicality, learn performance-quality moves, and become a confident, skilled mambo dancer ready for any dance floor.",
                "slug": "mambo-301",
                "order_index": 3,
                "is_free": False,
                "difficulty": Difficulty.ADVANCED,
                "is_published": True,
                "image_url": None
            }
        ]
        
        created_count = 0
        for course_data in courses:
            # Check if course already exists
            existing = db.query(World).filter(World.slug == course_data["slug"]).first()
            if existing:
                print(f"Course '{course_data['title']}' already exists, skipping...")
                continue
            
            world = World(
                id=uuid.uuid4(),
                title=course_data["title"],
                description=course_data["description"],
                slug=course_data["slug"],
                order_index=course_data["order_index"],
                is_free=course_data["is_free"],
                image_url=course_data["image_url"],
                difficulty=course_data["difficulty"],
                is_published=course_data["is_published"]
            )
            
            db.add(world)
            created_count += 1
            print(f"Created course: {course_data['title']}")
        
        db.commit()
        print(f"\nSuccessfully created {created_count} course(s)!")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating courses: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()
    
    return True

if __name__ == "__main__":
    print("Creating default Mambo courses...")
    print("-" * 50)
    if create_default_courses():
        print("-" * 50)
        print("Done!")
        sys.exit(0)
    else:
        print("-" * 50)
        print("Failed to create courses")
        sys.exit(1)
