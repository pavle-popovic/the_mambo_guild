
import os
import sys
import uuid
import time
from datetime import datetime
from dotenv import load_dotenv

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(project_root, '.env')
load_dotenv(env_path)

# backend path
backend_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_path)

from sqlalchemy import text
from models import get_engine
from services import badge_service
from models.user import User, UserProfile
from models.community import UserBadge, BadgeDefinition, UserStats
from sqlalchemy.orm import sessionmaker

def setup_and_verify():
    engine = get_engine()
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    print("🛡️ Starting Admin Setup & Gamification Verification...")
    
    # ==========================================
    # 1. Setup Admin Account
    # ==========================================
    admin_email = "admin@themamboinn.com"
    admin_user = db.query(User).filter(User.email == admin_email).first()
    
    if not admin_user:
        print(f"👤 Creating Admin User ({admin_email})...")
        admin_user = User(
            id=str(uuid.uuid4()),
            email=admin_email,
            is_verified=True,
            role="admin",
            auth_provider="email",
            hashed_password="hashed_placeholder"
        )
        db.add(admin_user)
        # Create profile
        admin_profile = UserProfile(
            user_id=admin_user.id, 
            display_name="El Jefe",
            username="ElJefe",
            current_level_tag="Beginner",
            first_name="El",
            last_name="Jefe"
        )
        db.add(admin_profile)
        # Create stats
        admin_stats = UserStats(user_id=admin_user.id)
        db.add(admin_stats)
        db.commit()
    else:
        print(f"👤 Admin User found ({admin_user.id})")
        
    # Award Manual Badges to Admin
    badges_to_award = ["founder_diamond", "beta_tester"]
    
    for badge_id in badges_to_award:
        badge_def = db.query(BadgeDefinition).filter(BadgeDefinition.id == badge_id).first()
        if badge_def:
            # Check if owned
            owned = db.query(UserBadge).filter(UserBadge.user_id == admin_user.id, UserBadge.badge_id == badge_id).first()
            if not owned:
                print(f"   🏆 Awarding '{badge_def.name}' to Admin...")
                badge_service.award_badge(admin_user.id, badge_def, db)
            else:
                print(f"   ✓ Admin already has '{badge_def.name}'")
        else:
            print(f"   ⚠️ Badge Definition '{badge_id}' not found!")
            
    db.commit()

    # ==========================================
    # 2. Verify General Logic (Simulation)
    # ==========================================
    print("\n🧪 Verifying Progression Logic (Simulation)...")
    
    # Create a temporary test user for simulation
    sim_user_id = str(uuid.uuid4())
    sim_email = f"sim_{int(time.time())}@test.com"
    
    try:
        sim_user = User(id=sim_user_id, email=sim_email, is_verified=True, auth_provider="email")
        db.add(sim_user)
        # Create Sim Profile for stats tracking
        sim_profile = UserProfile(
            user_id=sim_user_id,
            first_name="Sim",
            last_name="User",
            username="SimUser", 
            current_level_tag="Beginner"
        )
        db.add(sim_profile)
        db.flush()
        
        # Create a Post for the Sim User to receive reactions
        from models.community import Post, PostReaction
        sim_post = Post(
             id=uuid.uuid4(),
             user_id=sim_user_id,
             title="My Salsa Journey",
             post_type="stage",
             feedback_type="hype"
        )
        db.add(sim_post)
        db.flush()

        # Test A: Firestarter (Reactions Received: FIRE)
        # Threshold for Bronze is 10
        print("   Testing 'Firestarter' (Gateway: fires_received >= 10)...")
        
        # Simulate receiving 10 FIRE reactions from Admin (or randoms)
        # We need unique user_ids for reactions ideally, but if logic doesn't enforce distinct reactors in service...
        # Models enforce unique(post_id, user_id). So we need 10 dummy users? 
        # Or just manually increment stats + mock query?
        # The service now queries PostReaction count. So we MUST insert PostReactions.
        
        for i in range(10):
            reactor_id = str(uuid.uuid4())
            # We assume these users exist? Foreign Key might fail if we don't create them.
            # To save time, we can reuse Admin ID? No, unique constraint.
            # We will just CREATE generic reactor users.
            r_user = User(id=reactor_id, email=f"r{i}@test.com", is_verified=True)
            db.add(r_user)
            db.flush()
            
            reaction = PostReaction(
                user_id=reactor_id,
                post_id=sim_post.id,
                reaction_type="fire"
            )
            db.add(reaction)
            db.flush()
            
            # Call service
            badge_service.increment_reaction_received(sim_user_id, "fire", db)
            
        # Check if badge awarded
        badge = db.query(UserBadge).filter(UserBadge.user_id == sim_user_id, UserBadge.badge_id == "firestarter_bronze").first()
        if badge:
            print("   ✅ SUCCESS: 'Firestarter (Bronze)' awarded automatically.")
        else:
            print("   ❌ FAILURE: 'Firestarter (Bronze)' NOT awarded.")

        # Test B: Streak Logic 'Unstoppable'
        # Threshold for Bronze is 3
        print("   Testing 'Unstoppable' (Gateway: daily_streak >= 3)...")
        badge_service.check_streak_badges(sim_user_id, 3, db)
        
        us_bronze = db.query(UserBadge).filter(UserBadge.user_id == sim_user_id, UserBadge.badge_id == "unstoppable_bronze").first()
        if us_bronze:
             print("   ✅ SUCCESS: 'Unstoppable (Bronze)' awarded automatically.")
        else:
             print("   ❌ FAILURE: 'Unstoppable (Bronze)' NOT awarded.")
             
    except Exception as e:
        print(f"❌ Simulation Exception: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Cleanup Simulation User
        print("\n🧹 Cleaning up simulation data...")
        # Cascade delete should handle profile/badges if configured, but let's be explicit to avoid FK errors
        try:
             db.execute(text("DELETE FROM user_badges WHERE user_id = :uid"), {"uid": sim_user_id})
             db.execute(text("DELETE FROM user_profiles WHERE user_id = :uid"), {"uid": sim_user_id}) # Delete profile first!
             db.execute(text("DELETE FROM post_reactions WHERE post_id IN (SELECT id FROM posts WHERE user_id = :uid)"), {"uid": sim_user_id})
             db.execute(text("DELETE FROM posts WHERE user_id = :uid"), {"uid": sim_user_id})
             db.execute(text("DELETE FROM users WHERE email LIKE 'r%@test.com'")) # Cleanup reactors
             db.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": sim_user_id})
             db.commit()
             print("Done.")
        except Exception as e:
             print(f"Cleanup Error: {e}")
             db.rollback()
        db.close()

if __name__ == "__main__":
    setup_and_verify()
