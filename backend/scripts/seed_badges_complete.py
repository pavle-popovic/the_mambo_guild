
import os
import sys
from dotenv import load_dotenv
import json
from datetime import datetime

# Setup path to backend
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(project_root, '.env')
load_dotenv(env_path)

backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_path)

from sqlalchemy import text
from models import get_engine

def get_badges_list():
    badges = []
    
    # 1. Firestarter (Received 'Fire' reactions)
    # Desc: "Your dancing is heating up the stage."
    base_id = "firestarter"
    name = "Firestarter"
    desc = "Your dancing is heating up the stage."
    category = "performance" # Matching "Reactions received" better than community generic
    req_type = "fires_received"
    thresholds = [
        ("bronze", 10, "Warm embers."),
        ("silver", 50, "Full blaze."),
        ("gold", 200, "Inferno status."),
        ("diamond", 1000, "A supernova on the dance floor.")
    ]
    for tier, val, suffix in thresholds:
        badges.append({
            "id": f"{base_id}_{tier}",
            "name": f"{name}",
            "description": f"{desc} {suffix}",
            "tier": tier.capitalize(),
            "category": category,
            "requirement_type": req_type,
            "requirement_value": val,
            "requirements": {"type": req_type, "threshold": val}
        })

    # 2. Human Metronome (Received 'Metronome' reactions)
    # Desc: "Impeccable timing acknowledged by peers."
    base_id = "human_metronome"
    name = "Human Metronome"
    desc = "Impeccable timing acknowledged by peers."
    category = "performance"
    req_type = "metronomes_received"
    thresholds = [
        ("bronze", 5, "Finding the groove."),
        ("silver", 25, "Locked in."),
        ("gold", 100, "Absolute precision."),
        ("diamond", 500, "You ARE the rhythm.")
    ]
    for tier, val, suffix in thresholds:
        badges.append({
            "id": f"{base_id}_{tier}",
            "name": f"{name}",
            "description": f"{desc} {suffix}",
            "tier": tier.capitalize(),
            "category": category,
            "requirement_type": req_type,
            "requirement_value": val,
            "requirements": {"type": req_type, "threshold": val}
        })

    # 3. Crowd Favorite (Received 'Clap' reactions)
    # Desc: "Recognized for great effort and spirit."
    base_id = "crowd_favorite"
    name = "Crowd Favorite"
    desc = "Recognized for great effort and spirit."
    category = "community"
    req_type = "claps_received"
    thresholds = [
        ("bronze", 5, "Turning heads."),
        ("silver", 25, "Applause rising."),
        ("gold", 100, "Standing ovation."),
        ("diamond", 500, "The people's champion.")
    ]
    for tier, val, suffix in thresholds:
        badges.append({
            "id": f"{base_id}_{tier}",
            "name": f"{name}",
            "description": f"{desc} {suffix}",
            "tier": tier.capitalize(),
            "category": category,
            "requirement_type": req_type,
            "requirement_value": val,
            "requirements": {"type": req_type, "threshold": val}
        })

    # 4. Talent Scout (Given reactions to others)
    # Desc: "Supporting the community with feedback."
    base_id = "talent_scout"
    name = "Talent Scout"
    desc = "Supporting the community with feedback."
    category = "community"
    req_type = "reactions_given"
    thresholds = [
        ("bronze", 10, "Eye for talent."),
        ("silver", 100, "Dedicated supporter."),
        ("gold", 500, "Community pillar."),
        ("diamond", 2000, "The ultimate hype person.")
    ]
    for tier, val, suffix in thresholds:
        badges.append({
            "id": f"{base_id}_{tier}",
            "name": f"{name}",
            "description": f"{desc} {suffix}",
            "tier": tier.capitalize(),
            "category": category,
            "requirement_type": req_type,
            "requirement_value": val,
            "requirements": {"type": req_type, "threshold": val}
        })

    # 5. Center Stage (Videos Posted)
    # Desc: "Sharing your journey on The Stage."
    base_id = "center_stage"
    name = "Center Stage"
    desc = "Sharing your journey on The Stage."
    category = "performance"
    req_type = "videos_posted"
    thresholds = [
        ("bronze", 1, "First steps."),
        ("silver", 10, "Regular performer."),
        ("gold", 50, "Star power."),
        ("diamond", 100, "Legend of the stage.")
    ]
    for tier, val, suffix in thresholds:
        badges.append({
            "id": f"{base_id}_{tier}",
            "name": f"{name}",
            "description": f"{desc} {suffix}",
            "tier": tier.capitalize(),
            "category": category,
            "requirement_type": req_type,
            "requirement_value": val,
            "requirements": {"type": req_type, "threshold": val}
        })

    # 6. The Professor (Answers marked as 'Accepted Solution')
    # Desc: "Providing verified solutions to community questions."
    base_id = "the_professor"
    name = "The Professor"
    desc = "Providing verified solutions to community questions."
    category = "learning"
    req_type = "solutions_accepted"
    thresholds = [
        ("bronze", 1, "Helpful hand."),
        ("silver", 5, "Trusted advisor."),
        ("gold", 20, "Master instructor."),
        ("diamond", 50, "The Oracle of Salsa.")
    ]
    for tier, val, suffix in thresholds:
        badges.append({
            "id": f"{base_id}_{tier}",
            "name": f"{name}",
            "description": f"{desc} {suffix}",
            "tier": tier.capitalize(),
            "category": category,
            "requirement_type": req_type,
            "requirement_value": val,
            "requirements": {"type": req_type, "threshold": val}
        })

    # 7. The Socialite (Comments posted)
    # Desc: "Active participant in discussions."
    base_id = "the_socialite"
    name = "The Socialite"
    desc = "Active participant in discussions."
    category = "community"
    req_type = "comments_posted"
    thresholds = [
        ("bronze", 10, "Breaking the ice."),
        ("silver", 50, "Life of the party."),
        ("gold", 200, "Everywhere at once."),
        ("diamond", 1000, "Voice of the generation.")
    ]
    for tier, val, suffix in thresholds:
        badges.append({
            "id": f"{base_id}_{tier}",
            "name": f"{name}",
            "description": f"{desc} {suffix}",
            "tier": tier.capitalize(),
            "category": category,
            "requirement_type": req_type,
            "requirement_value": val,
            "requirements": {"type": req_type, "threshold": val}
        })

    # 8. Unstoppable (Daily Login Streak)
    # Desc: "Consistent dedication to showing up."
    base_id = "unstoppable"
    name = "Unstoppable"
    desc = "Consistent dedication to showing up."
    category = "streaks"
    req_type = "daily_streak"
    thresholds = [
        ("bronze", 3, "Building momentum."),
        ("silver", 14, "Two weeks strong."),
        ("gold", 30, "Monthly master."),
        ("diamond", 100, "Truly unstoppable force.")
    ]
    for tier, val, suffix in thresholds:
        badges.append({
            "id": f"{base_id}_{tier}",
            "name": f"{name}",
            "description": f"{desc} {suffix}",
            "tier": tier.capitalize(),
            "category": category,
            "requirement_type": req_type,
            "requirement_value": val,
            "requirements": {"type": req_type, "threshold": val}
        })

    # 9. Curious Mind (Questions Posted in The Lab)
    # Desc: "Asking for help and learning from others."
    base_id = "curious_mind"
    name = "Curious Mind"
    desc = "Asking for help and learning from others."
    category = "community"
    req_type = "questions_posted"
    thresholds = [
        ("bronze", 1, "First question."),
        ("silver", 10, "Regular learner."),
        ("gold", 25, "Deep diver."),
        ("diamond", 50, "Master inquirer.")
    ]
    for tier, val, suffix in thresholds:
        badges.append({
            "id": f"{base_id}_{tier}",
            "name": f"{name}",
            "description": f"{desc} {suffix}",
            "tier": tier.capitalize(),
            "category": category,
            "requirement_type": req_type,
            "requirement_value": val,
            "requirements": {"type": req_type, "threshold": val}
        })

    # 10. Founder Diamond (Legacy Preservation)
    badges.append({
        "id": "founder_diamond",
        "name": "Founder",
        "description": "Original member of The Mambo Guild. Reserved for the first 1000 users.",
        "tier": "Diamond",
        "category": "special",
        "requirement_type": "manual",
        "requirement_value": 0,
        "requirements": {"type": "manual"}
    })

    # 10. Beta Tester (Legacy Preservation)
    badges.append({
        "id": "beta_tester",
        "name": "Beta Tester",
        "description": "Helped test the platform during early access.",
        "tier": "Gold",
        "category": "special",
        "requirement_type": "manual",
        "requirement_value": 0,
        "requirements": {"type": "manual"}
    })

    return badges

def seed_badges():
    engine = get_engine()
    badges = get_badges_list()
    
    with engine.connect() as conn:
        print(f"🚀 Seeding {len(badges)} badges...")
        
        for badge in badges:
            try:
                # Prepare JSON serialization for requirements
                badge_data = badge.copy()
                badge_data["requirements"] = json.dumps(badge["requirements"])
                badge_data["created_at"] = datetime.utcnow()
                badge_data["threshold"] = badge["requirement_value"] # Explicit mapping
                
                # Placeholder Icon generation if missing
                if "icon_url" not in badge_data:
                    # Use local public assets if they exist
                    slug = badge_data["id"]
                    
                    # Calculate path to frontend public badges to check existence
                    # project_root is .../backend, so we go up one level to .../ and then to frontend
                    fs_root = os.path.dirname(project_root)
                    local_badge_path = os.path.join(fs_root, 'frontend', 'public', 'badges', f"{slug}.png")
                    
                    if os.path.exists(local_badge_path):
                         badge_data["icon_url"] = f"/badges/{slug}.png"
                         print(f"  -> Found local asset for {slug}")
                    else:
                         # Fallback for special badges without local files (like Founder if not present)
                         badge_data["icon_url"] = f"https://pub-bad1fce3595144f2bac8492efa3aec64.r2.dev/badges/{slug}.png"
                         print(f"  -> Using remote fallback for {slug}")

                conn.execute(text("""
                    INSERT INTO badge_definitions (
                        id, name, description, icon_url, tier, category, 
                        requirements, requirement_type, threshold, created_at
                    )
                    VALUES (
                        :id, :name, :description, :icon_url, :tier, :category,
                        :requirements, :requirement_type, :threshold, :created_at
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        description = EXCLUDED.description,
                        icon_url = EXCLUDED.icon_url,
                        tier = EXCLUDED.tier,
                        requirements = EXCLUDED.requirements,
                        threshold = EXCLUDED.threshold
                """), badge_data)
                print(f"✓ {badge['name']} ({badge['tier']})")
                
            except Exception as e:
                print(f"❌ Error seeding {badge['name']}: {str(e)}")
        
        conn.commit()
        print("✅ Badge seeding completed!")

if __name__ == "__main__":
    seed_badges()
