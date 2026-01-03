"""
Database initialization script.
Run this to create all tables.
"""
from models import Base, get_engine

def init_db():
    """Create all database tables."""
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()

