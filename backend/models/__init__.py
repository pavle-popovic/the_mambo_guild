from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from config import settings

# Base class for models
Base = declarative_base()

# Lazy initialization of engine and session
_engine = None
_SessionLocal = None

def get_engine():
    """Get or create the database engine."""
    global _engine
    if _engine is None:
        db_url = settings.DATABASE_URL
        # Skip SSL for local Docker postgres (service name "postgres" or localhost)
        is_local = "@postgres:" in db_url or "@localhost:" in db_url or "@127.0.0.1:" in db_url
        connect_args = {"connect_timeout": 10}
        if not is_local:
            connect_args["sslmode"] = "require"
        _engine = create_engine(
            db_url,
            echo=False,
            pool_pre_ping=True,       # Test connection before use (fixes stale connections)
            pool_recycle=300,          # Recycle connections every 5 min (Supabase drops idle)
            pool_size=5,               # Small pool for NANO compute
            max_overflow=10,
            connect_args=connect_args,
        )
    return _engine

def get_session_local():
    """Get or create the session factory."""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _SessionLocal

# For backward compatibility - expose engine as a property-like function
def engine():
    """Get the engine (for backward compatibility)."""
    return get_engine()

# Import all models to ensure they're registered
from models.user import User, UserProfile, Subscription
from models.course import World, Level, Lesson
from models.progress import UserProgress, BossSubmission, Comment
from models.community import (
    ClaveTransaction,
    Post, PostReply, PostReaction,
    BadgeDefinition, UserBadge,
    CommunityTag, SavedPost
)
from models.notification import Notification
from models.premium import (
    LiveCall, LiveCallStatus,
    WeeklyArchive,
    CoachingSubmission, CoachingSubmissionStatus,
    DJBoothTrack
)
from models.payment import StripeWebhookEvent, XPAuditLog

# Dependency to get database session
def get_db():
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

