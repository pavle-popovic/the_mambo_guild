from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import enum

from models import Base


class Difficulty(str, enum.Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"


class World(Base):
    __tablename__ = "worlds"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    order_index = Column(Integer, nullable=False)
    is_free = Column(Boolean, default=False, nullable=False)
    image_url = Column(String, nullable=True)
    difficulty = Column(SQLEnum(Difficulty), nullable=False)
    is_published = Column(Boolean, default=False, nullable=False)

    # Relationships
    levels = relationship("Level", back_populates="world", order_by="Level.order_index")


class Level(Base):
    __tablename__ = "levels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    world_id = Column(UUID(as_uuid=True), ForeignKey("worlds.id"), nullable=False)
    title = Column(String, nullable=False)
    order_index = Column(Integer, nullable=False)

    # Relationships
    world = relationship("World", back_populates="levels")
    lessons = relationship("Lesson", back_populates="level", order_by="Lesson.order_index")


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

    # Relationships
    level = relationship("Level", back_populates="lessons")
    progress = relationship("UserProgress", back_populates="lesson")
    submissions = relationship("BossSubmission", back_populates="lesson")
    comments = relationship("Comment", back_populates="lesson")

