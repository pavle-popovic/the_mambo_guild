"""
Direct database seeding script that runs inside the container.
Uses the correct enum values.
"""
import sys
import os

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from config import settings
import uuid

# Fix Unicode encoding for Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

def seed_courses():
    """Create initial courses and lessons using raw SQL with correct enum values."""
    engine = create_engine(settings.DATABASE_URL, echo=False)
    
    try:
        with engine.begin() as conn:
            # Check if courses already exist
            result = conn.execute(text("SELECT id FROM worlds WHERE slug IN ('mambo-101', 'mambo-201')"))
            if result.fetchall():
                print("Courses already exist. Skipping seed.")
                return
            
            # Create Mambo 101 (Beginner Course)
            world_101_id = str(uuid.uuid4())
            conn.execute(text("""
                INSERT INTO worlds (id, title, description, slug, order_index, is_free, difficulty, is_published)
                VALUES (:id, :title, :description, :slug, :order_index, :is_free, :difficulty, :is_published)
            """), {
                "id": world_101_id,
                "title": "Mambo 101",
                "description": "First time salsa on2 dancers. Master the fundamental steps, understand the basics of timing, and learn the rich history of Mambo. This course is designed for complete beginners who want to build a solid foundation in New York Style Salsa On2. You'll learn the essential footwork, body movement, and musicality that form the core of this beautiful dance style.",
                "slug": "mambo-101",
                "order_index": 1,
                "is_free": True,
                "difficulty": "BEGINNER",
                "is_published": True
            })
            
            # Create Level 1 for Mambo 101
            level_101_1_id = str(uuid.uuid4())
            conn.execute(text("""
                INSERT INTO levels (id, world_id, title, order_index)
                VALUES (:id, :world_id, :title, :order_index)
            """), {
                "id": level_101_1_id,
                "world_id": world_101_id,
                "title": "Foundation",
                "order_index": 1
            })
            
            # Create lessons for Mambo 101
            lessons_101 = [
                {"title": "Introduction to Mambo", "description": "Welcome to Mambo! Learn about the history and origins of this vibrant dance style.", "video_url": "https://example.com/video/mambo-101-1", "xp_value": 50, "order_index": 1, "is_boss_battle": False, "duration_minutes": 10},
                {"title": "The Basic Step (On2)", "description": "Master the fundamental rhythm of New York Style Salsa.", "video_url": "https://example.com/video/mambo-101-2", "xp_value": 50, "order_index": 2, "is_boss_battle": False, "duration_minutes": 15},
                {"title": "Side Breaks and Basic Turns", "description": "Expand your movement vocabulary with side breaks and learn your first turn.", "video_url": "https://example.com/video/mambo-101-3", "xp_value": 50, "order_index": 3, "is_boss_battle": False, "duration_minutes": 12},
                {"title": "Cross Body Lead Basics", "description": "Learn the essential cross body lead pattern, the foundation of partner work.", "video_url": "https://example.com/video/mambo-101-4", "xp_value": 50, "order_index": 4, "is_boss_battle": False, "duration_minutes": 18},
                {"title": "Musicality: Understanding the Clave", "description": "Discover the clave rhythm and how it drives Mambo music.", "video_url": "https://example.com/video/mambo-101-5", "xp_value": 75, "order_index": 5, "is_boss_battle": False, "duration_minutes": 20},
                {"title": "BOSS BATTLE: Your First Routine", "description": "Put it all together! Perform your first complete Mambo routine.", "video_url": "https://example.com/video/mambo-101-boss", "xp_value": 500, "order_index": 6, "is_boss_battle": True, "duration_minutes": 25}
            ]
            
            for lesson_data in lessons_101:
                lesson_id = str(uuid.uuid4())
                conn.execute(text("""
                    INSERT INTO lessons (id, level_id, title, description, video_url, xp_value, order_index, is_boss_battle, duration_minutes)
                    VALUES (:id, :level_id, :title, :description, :video_url, :xp_value, :order_index, :is_boss_battle, :duration_minutes)
                """), {
                    "id": lesson_id,
                    "level_id": level_101_1_id,
                    **lesson_data
                })
            
            # Create Mambo 201 (Intermediate Course)
            world_201_id = str(uuid.uuid4())
            conn.execute(text("""
                INSERT INTO worlds (id, title, description, slug, order_index, is_free, difficulty, is_published)
                VALUES (:id, :title, :description, :slug, :order_index, :is_free, :difficulty, :is_published)
            """), {
                "id": world_201_id,
                "title": "Mambo 201",
                "description": "Intermediate salsa on2 dancers. Build on your foundation with more complex steps, refine your technique, learn choreography patterns, and deepen your understanding of Mambo's cultural history.",
                "slug": "mambo-201",
                "order_index": 2,
                "is_free": False,
                "difficulty": "INTERMEDIATE",
                "is_published": True
            })
            
            # Create Level 1 for Mambo 201
            level_201_1_id = str(uuid.uuid4())
            conn.execute(text("""
                INSERT INTO levels (id, world_id, title, order_index)
                VALUES (:id, :world_id, :title, :order_index)
            """), {
                "id": level_201_1_id,
                "world_id": world_201_id,
                "title": "Intermediate Techniques",
                "order_index": 1
            })
            
            # Create lessons for Mambo 201
            lessons_201 = [
                {"title": "Advanced Cross Body Variations", "description": "Explore creative variations of the cross body lead.", "video_url": "https://example.com/video/mambo-201-1", "xp_value": 75, "order_index": 1, "is_boss_battle": False, "duration_minutes": 20},
                {"title": "Spin Technique and Multiple Spins", "description": "Master single and multiple spins with proper technique.", "video_url": "https://example.com/video/mambo-201-2", "xp_value": 75, "order_index": 2, "is_boss_battle": False, "duration_minutes": 22},
                {"title": "Hammerlocks and Wrap Patterns", "description": "Learn intermediate patterns including hammerlocks and wraps.", "video_url": "https://example.com/video/mambo-201-3", "xp_value": 75, "order_index": 3, "is_boss_battle": False, "duration_minutes": 18},
                {"title": "Choreography: Building Combinations", "description": "Learn how to combine patterns into flowing choreography.", "video_url": "https://example.com/video/mambo-201-4", "xp_value": 100, "order_index": 4, "is_boss_battle": False, "duration_minutes": 25},
                {"title": "Mambo History: The Golden Age", "description": "Explore the golden age of Mambo in 1950s New York.", "video_url": "https://example.com/video/mambo-201-5", "xp_value": 50, "order_index": 5, "is_boss_battle": False, "duration_minutes": 15},
                {"title": "BOSS BATTLE: Intermediate Routine Performance", "description": "Showcase your intermediate skills!", "video_url": "https://example.com/video/mambo-201-boss", "xp_value": 500, "order_index": 6, "is_boss_battle": True, "duration_minutes": 30}
            ]
            
            for lesson_data in lessons_201:
                lesson_id = str(uuid.uuid4())
                conn.execute(text("""
                    INSERT INTO lessons (id, level_id, title, description, video_url, xp_value, order_index, is_boss_battle, duration_minutes)
                    VALUES (:id, :level_id, :title, :description, :video_url, :xp_value, :order_index, :is_boss_battle, :duration_minutes)
                """), {
                    "id": lesson_id,
                    "level_id": level_201_1_id,
                    **lesson_data
                })
            
            print("[SUCCESS] Successfully created courses and lessons!")
            print(f"   - Mambo 101: {len(lessons_101)} lessons")
            print(f"   - Mambo 201: {len(lessons_201)} lessons")
        
    except Exception as e:
        print(f"[ERROR] Error seeding courses: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    print("Seeding courses...")
    seed_courses()
