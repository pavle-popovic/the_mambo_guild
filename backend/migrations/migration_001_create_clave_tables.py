"""
Migration 001: Create Clave Economy Tables
- clave_transactions: Track all clave earnings and spending
- Add current_claves column to user_profiles
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


def run_migration():
    """Create clave economy tables."""
    engine = get_engine()
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # ============================================
            # 1. Create clave_transactions table
            # ============================================
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'clave_transactions'
                )
            """))
            table_exists = result.scalar()
            
            if not table_exists:
                print("Creating clave_transactions table...")
                conn.execute(text("""
                    CREATE TABLE clave_transactions (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        amount INTEGER NOT NULL,
                        reason VARCHAR(100) NOT NULL,
                        reference_id UUID,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                """))
                conn.execute(text("""
                    CREATE INDEX idx_clave_transactions_user_id 
                    ON clave_transactions(user_id)
                """))
                conn.execute(text("""
                    CREATE INDEX idx_clave_transactions_created_at 
                    ON clave_transactions(created_at)
                """))
                print("✓ clave_transactions table created")
            else:
                print("✓ clave_transactions table already exists")
            
            # ============================================
            # 2. Add current_claves column to user_profiles
            # ============================================
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'user_profiles' 
                AND column_name = 'current_claves'
            """))
            if result.fetchone() is None:
                print("Adding current_claves column to user_profiles...")
                conn.execute(text("""
                    ALTER TABLE user_profiles 
                    ADD COLUMN current_claves INTEGER DEFAULT 0 NOT NULL
                """))
                print("✓ current_claves column added")
            else:
                print("✓ current_claves column already exists")
            
            # ============================================
            # 3. Add last_daily_claim column to user_profiles
            # ============================================
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'user_profiles' 
                AND column_name = 'last_daily_claim'
            """))
            if result.fetchone() is None:
                print("Adding last_daily_claim column to user_profiles...")
                conn.execute(text("""
                    ALTER TABLE user_profiles 
                    ADD COLUMN last_daily_claim DATE
                """))
                print("✓ last_daily_claim column added")
            else:
                print("✓ last_daily_claim column already exists")
            
            trans.commit()
            print("\n✅ Migration 001 completed successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration 001 failed: {e}")
            raise


if __name__ == "__main__":
    run_migration()
