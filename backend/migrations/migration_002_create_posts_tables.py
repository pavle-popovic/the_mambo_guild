"""
Migration 002: Create Community Posts Tables
- posts: The Stage (videos) & The Lab (questions)
- post_replies: Comments/answers on posts
- post_reactions: Fire, Ruler, Clap reactions
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from models import get_engine


def run_migration():
    """Create community posts tables."""
    engine = get_engine()
    
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # ============================================
            # 1. Create posts table
            # ============================================
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'posts'
                )
            """))
            table_exists = result.scalar()
            
            if not table_exists:
                print("Creating posts table...")
                conn.execute(text("""
                    CREATE TABLE posts (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        post_type VARCHAR(10) NOT NULL CHECK (post_type IN ('stage', 'lab')),
                        
                        -- Content
                        title VARCHAR(200) NOT NULL,
                        body TEXT,
                        mux_asset_id VARCHAR(100),
                        mux_playback_id VARCHAR(100),
                        video_duration_seconds INTEGER,
                        
                        -- Metadata
                        tags VARCHAR(50)[] DEFAULT '{}',
                        is_wip BOOLEAN DEFAULT false,
                        feedback_type VARCHAR(10) DEFAULT 'coach' CHECK (feedback_type IN ('hype', 'coach')),
                        
                        -- Lab-specific
                        is_solved BOOLEAN DEFAULT false,
                        accepted_answer_id UUID,
                        
                        -- Counts (denormalized for performance)
                        reaction_count INTEGER DEFAULT 0,
                        reply_count INTEGER DEFAULT 0,
                        
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NOW()
                    )
                """))
                conn.execute(text("""
                    CREATE INDEX idx_posts_user_id ON posts(user_id)
                """))
                conn.execute(text("""
                    CREATE INDEX idx_posts_type ON posts(post_type)
                """))
                conn.execute(text("""
                    CREATE INDEX idx_posts_created_at ON posts(created_at DESC)
                """))
                conn.execute(text("""
                    CREATE INDEX idx_posts_tags ON posts USING GIN(tags)
                """))
                print("✓ posts table created")
            else:
                print("✓ posts table already exists")
            
            # ============================================
            # 2. Create post_replies table
            # ============================================
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'post_replies'
                )
            """))
            table_exists = result.scalar()
            
            if not table_exists:
                print("Creating post_replies table...")
                conn.execute(text("""
                    CREATE TABLE post_replies (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        
                        content TEXT NOT NULL,
                        mux_asset_id VARCHAR(100),
                        mux_playback_id VARCHAR(100),
                        
                        is_accepted_answer BOOLEAN DEFAULT false,
                        
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                """))
                conn.execute(text("""
                    CREATE INDEX idx_post_replies_post_id ON post_replies(post_id)
                """))
                conn.execute(text("""
                    CREATE INDEX idx_post_replies_user_id ON post_replies(user_id)
                """))
                print("✓ post_replies table created")
            else:
                print("✓ post_replies table already exists")
            
            # ============================================
            # 3. Create post_reactions table
            # ============================================
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'post_reactions'
                )
            """))
            table_exists = result.scalar()
            
            if not table_exists:
                print("Creating post_reactions table...")
                conn.execute(text("""
                    CREATE TABLE post_reactions (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
                        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('fire', 'ruler', 'clap')),
                        created_at TIMESTAMP DEFAULT NOW(),
                        UNIQUE(post_id, user_id)
                    )
                """))
                conn.execute(text("""
                    CREATE INDEX idx_post_reactions_post_id ON post_reactions(post_id)
                """))
                conn.execute(text("""
                    CREATE INDEX idx_post_reactions_user_id ON post_reactions(user_id)
                """))
                print("✓ post_reactions table created")
            else:
                print("✓ post_reactions table already exists")
            
            # ============================================
            # 4. Add FK for accepted_answer_id (after post_replies exists)
            # ============================================
            result = conn.execute(text("""
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = 'posts' 
                AND constraint_name = 'fk_posts_accepted_answer'
            """))
            if result.fetchone() is None:
                print("Adding foreign key for accepted_answer_id...")
                conn.execute(text("""
                    ALTER TABLE posts 
                    ADD CONSTRAINT fk_posts_accepted_answer 
                    FOREIGN KEY (accepted_answer_id) 
                    REFERENCES post_replies(id) 
                    ON DELETE SET NULL
                """))
                print("✓ accepted_answer_id foreign key added")
            else:
                print("✓ accepted_answer_id foreign key already exists")
            
            trans.commit()
            print("\n✅ Migration 002 completed successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration 002 failed: {e}")
            raise


if __name__ == "__main__":
    run_migration()
