import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import get_session_local
from models.community import Post, PostReaction, PostReply, UserStats, UserBadge, BadgeDefinition
from models.user import User, UserProfile
from sqlalchemy import func
from services import badge_service

def retroactively_award_badges():
    """
    Calculate and award badges based on existing user activity.
    This only needs to run once to catch up historical data.
    """
    SessionLocal = get_session_local()
    db = SessionLocal()
    
    try:
        print("=== RETROACTIVE BADGE AWARD ===\n")
        
        # Get all users
        users = db.query(User).all()
        
        for user in users:
            user_id = str(user.id)
            print(f"Processing user: {user.email} ({user_id})")
            
            # Get or create UserStats
            stats = badge_service.get_or_create_stats(user_id, db)
            
            # === 1. Count reactions GIVEN ===
            reactions_given = db.query(func.count(PostReaction.id)).filter(
                PostReaction.user_id == user_id
            ).scalar() or 0
            
            if reactions_given != stats.reactions_given_count:
                print(f"  Reactions Given: {stats.reactions_given_count} -> {reactions_given}")
                stats.reactions_given_count = reactions_given
                badge_service.check_and_award_badges(user_id, "reactions_given", reactions_given, db)
            
            # === 2. Count reactions RECEIVED ===
            reactions_received = db.query(func.count(PostReaction.id)).join(
                Post, PostReaction.post_id == Post.id
            ).filter(Post.user_id == user_id).scalar() or 0
            
            if reactions_received != stats.reactions_received_count:
                print(f"  Reactions Received: {stats.reactions_received_count} -> {reactions_received}")
                stats.reactions_received_count = reactions_received
                badge_service.check_and_award_badges(user_id, "reactions_received", reactions_received, db)
            
            # === 3. Count FIRES received ===
            fires_received = db.query(func.count(PostReaction.id)).join(
                Post, PostReaction.post_id == Post.id
            ).filter(
                Post.user_id == user_id,
                PostReaction.reaction_type == "fire"
            ).scalar() or 0
            
            if fires_received > 0:
                print(f"  Fires Received: {fires_received}")
                badge_service.check_and_award_badges(user_id, "fires_received", fires_received, db)
            
            # === 4. Count CLAPS received ===
            claps_received = db.query(func.count(PostReaction.id)).join(
                Post, PostReaction.post_id == Post.id
            ).filter(
                Post.user_id == user_id,
                PostReaction.reaction_type == "clap"
            ).scalar() or 0
            
            if claps_received > 0:
                print(f"  Claps Received: {claps_received}")
                badge_service.check_and_award_badges(user_id, "claps_received", claps_received, db)
            
            # === 5. Count METRONOMES (ruler) received ===
            metronomes_received = db.query(func.count(PostReaction.id)).join(
                Post, PostReaction.post_id == Post.id
            ).filter(
                Post.user_id == user_id,
                PostReaction.reaction_type == "ruler"
            ).scalar() or 0
            
            if metronomes_received > 0:
                print(f"  Metronomes Received: {metronomes_received}")
                badge_service.check_and_award_badges(user_id, "metronomes_received", metronomes_received, db)
            
            # === 6. Count videos posted (Center Stage) ===
            videos_posted = db.query(func.count(Post.id)).filter(
                Post.user_id == user_id,
                Post.post_type == "stage",
                Post.mux_asset_id.isnot(None)
            ).scalar() or 0
            
            if videos_posted > 0:
                print(f"  Videos Posted: {videos_posted}")
                badge_service.check_and_award_badges(user_id, "videos_posted", videos_posted, db)
            
            # === 7. Count comments posted (The Socialite) ===
            comments_posted = db.query(func.count(PostReply.id)).filter(
                PostReply.user_id == user_id
            ).scalar() or 0
            
            if comments_posted > 0:
                print(f"  Comments Posted: {comments_posted}")
                badge_service.check_and_award_badges(user_id, "comments_posted", comments_posted, db)
            
            # === 8. Count questions posted (Curious Mind) ===
            questions_posted = db.query(func.count(Post.id)).filter(
                Post.user_id == user_id,
                Post.post_type == "lab"
            ).scalar() or 0
            
            if questions_posted > 0:
                print(f"  Questions Posted: {questions_posted}")
                badge_service.check_and_award_badges(user_id, "questions_posted", questions_posted, db)
            
            # === 9. Count solutions accepted ===
            solutions_accepted = db.query(func.count(PostReply.id)).filter(
                PostReply.user_id == user_id,
                PostReply.is_accepted_answer == True
            ).scalar() or 0
            
            if solutions_accepted != stats.solutions_accepted_count:
                print(f"  Solutions Accepted: {stats.solutions_accepted_count} -> {solutions_accepted}")
                stats.solutions_accepted_count = solutions_accepted
                badge_service.check_and_award_badges(user_id, "solutions_accepted", solutions_accepted, db)
            
            # === 7. Check streak badges (based on current profile streak) ===
            profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
            if profile and profile.streak_count > 0:
                print(f"  Streak: {profile.streak_count}")
                badge_service.check_streak_badges(user_id, profile.streak_count, db)
            
            db.flush()
            print()
        
        db.commit()
        print("✅ Retroactive badge award complete!")
        
        # Summary
        total_badges_awarded = db.query(func.count(UserBadge.id)).scalar()
        print(f"\nTotal badges now awarded: {total_badges_awarded}")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    retroactively_award_badges()
