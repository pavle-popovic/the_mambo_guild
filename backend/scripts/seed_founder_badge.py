
import os
import sys
from dotenv import load_dotenv

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(project_root, '.env')
load_dotenv(env_path)

# scripts is in backend/scripts
# backend is parent
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_path)

from sqlalchemy import text
from models import get_engine
import json
from datetime import datetime

def seed_badges():
    """
    Seed standard badges including the Founder's Badge
    """
    engine = get_engine()
    
    badges = [
        {
            "id": "founder_diamond",
            "name": "Founder",
            "description": "Original member of The Mambo Guild. Reserved for the first 1000 users.",
            "tier": "Diamond",
            "category": "special",
            "requirement_type": "manual", 
            "requirement_value": 0,
            "requirements": json.dumps({"type": "manual"})
        },
        {
            "id": "beta_tester",
            "name": "Beta Tester",
            "description": "Helped test the platform during early access.",
            "tier": "Gold",
            "category": "special",
            "requirement_type": "manual",
            "requirement_value": 0,
            "requirements": json.dumps({"type": "manual"})
        }
    ]

    badge_dir = os.path.join(os.path.dirname(project_root), "frontend", "public", "badges")

    with engine.connect() as conn:
        print("💎 Seeding Badges...")
        for badge in badges:
            try:
                # Dynamic Icon Logic (Remote vs Local)
                slug = badge["id"]
                local_path = os.path.join(badge_dir, f"{slug}.png")
                
                if os.path.exists(local_path):
                    badge["icon_url"] = f"/badges/{slug}.png"
                    print(f"  -> Found local asset for {slug}")
                else:
                    badge["icon_url"] = f"https://pub-bad1fce3595144f2bac8492efa3aec64.r2.dev/badges/{slug}.png"
                    print(f"  -> Using remote fallback for {slug}")

                # Note: requirement_type and threshold are for legacy schema compatibility
                # We also provide created_at to satisfy NOT NULL constraint if default is missing
                conn.execute(text("""
                    INSERT INTO badge_definitions (id, name, description, icon_url, tier, category, requirements, requirement_type, threshold, created_at)
                    VALUES (:id, :name, :description, :icon_url, :tier, :category, :requirements, :requirement_type, :threshold, :created_at)
                    ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    icon_url = EXCLUDED.icon_url,
                    tier = EXCLUDED.tier,
                    requirements = EXCLUDED.requirements
                """), {**badge, "threshold": badge["requirement_value"], "created_at": datetime.utcnow()}) 
                print(f"✓ Processed badge: {badge['name']}")
            except Exception as e:
                print(f"❌ Error seeding {badge['name']}: {str(e)}")
        
        conn.commit()
        print("✅ Badge seeding completed!")

if __name__ == "__main__":
    seed_badges()
