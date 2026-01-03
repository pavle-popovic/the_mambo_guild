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
        _engine = create_engine(settings.DATABASE_URL, echo=True)
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

# Dependency to get database session
def get_db():
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

