
from sqlalchemy import text
from models import get_engine

def run_migration():
    """
    Migration: Add referral_code and referred_by_code to user_profiles
    """
    engine = get_engine()
    
    with engine.connect() as conn:
        print("Running Migration 006: Add Referral Fields...")
        
        # Add referral_code
        try:
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN referral_code VARCHAR(20)"))
            conn.execute(text("CREATE UNIQUE INDEX idx_user_profiles_referral_code ON user_profiles(referral_code)"))
            print("✓ Added referral_code column")
        except Exception as e:
            if "duplicate column" in str(e) or "already exists" in str(e):
                print("✓ referral_code column already exists")
            else:
                raise e

        # Add referred_by_code
        try:
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN referred_by_code VARCHAR(20)"))
            conn.execute(text("CREATE INDEX idx_user_profiles_referred_by_code ON user_profiles(referred_by_code)"))
            # Note: We don't enforce FK constraint to avoid complexity if code logic changes, 
            # just string matching is fine for v1 waitlist.
            print("✓ Added referred_by_code column")
        except Exception as e:
            if "duplicate column" in str(e) or "already exists" in str(e):
                print("✓ referred_by_code column already exists")
            else:
                raise e
            
        # Add referral_count (optimization to avoid count queries)
        try:
            conn.execute(text("ALTER TABLE user_profiles ADD COLUMN referral_count INTEGER DEFAULT 0 NOT NULL"))
            print("✓ Added referral_count column")
        except Exception as e:
            if "duplicate column" in str(e) or "already exists" in str(e):
                print("✓ referral_count column already exists")
            else:
                raise e

        conn.commit()
        print("✅ Migration 006 completed successfully!")

if __name__ == "__main__":
    run_migration()
