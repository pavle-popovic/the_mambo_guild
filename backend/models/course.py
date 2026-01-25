from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey, Enum as SQLEnum, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum

from models import Base


class Difficulty(str, enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    OPEN = "Open"


class CourseType(str, enum.Enum):
    COURSE = "course"
    CHOREO = "choreo"
    TOPIC = "topic"


class LessonType(str, enum.Enum):
    VIDEO = "video"  # Video lesson with notes
    QUIZ = "quiz"  # Quiz only, no video, no notes
    HISTORY = "history"  # Notes only, no video


class World(Base):
    __tablename__ = "worlds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    order_index = Column(Integer, nullable=False)
    is_free = Column(Boolean, default=False, nullable=False)
    image_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    mux_preview_playback_id = Column(String, nullable=True)  # Mux playback ID for course preview video
    mux_preview_asset_id = Column(String, nullable=True)  # Mux asset ID for course preview video (needed for deletion)
    difficulty = Column(SQLEnum(Difficulty), nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)
    course_type = Column(String, default="course", nullable=False)  # course, choreo, topic

    # Course metadata
    total_duration_minutes = Column(Integer, default=0, nullable=False)  # Total course duration
    objectives = Column(JSONB, default=list, nullable=False)  # Array of 3 course objectives/bullet points

    # Relationships
    levels = relationship("Level", back_populates="world", order_by="Level.order_index")


class Level(Base):
    __tablename__ = "levels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    world_id = Column(UUID(as_uuid=True), ForeignKey("worlds.id"), nullable=False)
    title = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False)

    # Graph/Skill Tree properties
    description = Column(Text, nullable=True)
    x_position = Column(Float, default=0.0, nullable=False)  # X coordinate for graph layout (0-100 percentage or pixel)
    y_position = Column(Float, default=0.0, nullable=False)  # Y coordinate for graph layout (0-100 percentage or pixel)
    thumbnail_url = Column(String, nullable=True)  # Icon/thumbnail for the skill node

    # Module metadata
    outcome = Column(String(255), nullable=True)  # e.g., "Unlock Stable Turns"
    duration_minutes = Column(Integer, default=0, nullable=False)  # Total module duration
    total_xp = Column(Integer, default=0, nullable=False)  # Total XP rewards
    status = Column(String(50), default="active", nullable=False)  # active, coming_soon, locked

    # Mux preview video for skill tree hover (uses animated GIF for cost efficiency)
    mux_preview_playback_id = Column(String, nullable=True)
    mux_preview_asset_id = Column(String, nullable=True)

    # Relationships
    world = relationship("World", back_populates="levels")
    lessons = relationship(
        "Lesson", 
        back_populates="level", 
        order_by="Lesson.week_number, Lesson.day_number, Lesson.order_index"
    )
    # Edges for skill tree dependencies
    outgoing_edges = relationship("LevelEdge", foreign_keys="[LevelEdge.from_level_id]", back_populates="from_level", cascade="all, delete-orphan")
    incoming_edges = relationship("LevelEdge", foreign_keys="[LevelEdge.to_level_id]", back_populates="to_level", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    level_id = Column(UUID(as_uuid=True), ForeignKey("levels.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    video_url = Column(String, nullable=False)
    xp_value = Column(Integer, default=50, nullable=False)
    order_index = Column(Integer, nullable=False)
    is_boss_battle = Column(Boolean, default=False, nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    
    # Lesson type: video (video + notes), quiz (quiz only), history (notes only)
    # Use String column to store enum values directly (not enum names)
    lesson_type = Column(String, default=LessonType.VIDEO.value, nullable=False)
    
    # Week/Day sorting fields
    week_number = Column(Integer, nullable=True, index=True)
    day_number = Column(Integer, nullable=True, index=True)
    
    # Rich content storage (JSONB for better querying)
    content_json = Column(JSONB, nullable=True)
    
    # Mux video integration
    mux_playback_id = Column(String, nullable=True)
    mux_asset_id = Column(String, nullable=True)
    
    # Thumbnail image
    thumbnail_url = Column(String, nullable=True)

    # Relationships
    level = relationship("Level", back_populates="lessons")
    progress = relationship("UserProgress", back_populates="lesson")
    submissions = relationship("BossSubmission", back_populates="lesson")
    comments = relationship("Comment", back_populates="lesson")



class LevelEdge(Base):
    """Represents a dependency edge between two skill nodes (levels) in the skill tree"""
    __tablename__ = "level_edges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    world_id = Column(UUID(as_uuid=True), ForeignKey("worlds.id"), nullable=False, index=True)
    from_level_id = Column(UUID(as_uuid=True), ForeignKey("levels.id"), nullable=False)
    to_level_id = Column(UUID(as_uuid=True), ForeignKey("levels.id"), nullable=False)

    # Relationships
    world = relationship("World")
    from_level = relationship("Level", foreign_keys=[from_level_id], back_populates="outgoing_edges")
    to_level = relationship("Level", foreign_keys=[to_level_id], back_populates="incoming_edges")
