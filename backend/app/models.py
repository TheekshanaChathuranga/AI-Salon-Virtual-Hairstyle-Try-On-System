import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="admin")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Hairstyle(Base):
    __tablename__ = "hairstyles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(120), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, index=True) # short, medium, long, special
    length = Column(String(50), nullable=False)               # pixie, bob, shoulder, long
    texture = Column(String(50), nullable=False)              # straight, wavy, curly, coily
    reference_image_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=False)
    tags = Column(JSON, default=list)
    active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    jobs = relationship("TryOnJob", back_populates="hairstyle")

class CustomerSession(Base):
    __tablename__ = "customer_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_token = Column(String(128), unique=True, nullable=False, index=True)
    consent_given = Column(Boolean, default=False)
    consent_timestamp = Column(DateTime(timezone=True), nullable=True)
    ip_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime(timezone=True), nullable=False)

    jobs = relationship("TryOnJob", back_populates="session", cascade="all, delete-orphan")

class TryOnJob(Base):
    __tablename__ = "tryon_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("customer_sessions.id", ondelete="CASCADE"), nullable=False)
    hairstyle_id = Column(String(36), ForeignKey("hairstyles.id", ondelete="SET NULL"), nullable=True)
    selected_color = Column(String(50), nullable=True)
    input_image_url = Column(String(500), nullable=False)
    output_image_url = Column(String(500), nullable=True)
    status = Column(String(20), default="QUEUED", index=True) # QUEUED, PROCESSING, COMPLETED, FAILED
    model_name = Column(String(50), default="LocalVision-v1")
    processing_time_ms = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    session = relationship("CustomerSession", back_populates="jobs")
    hairstyle = relationship("Hairstyle", back_populates="jobs")

class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    level = Column(String(10), nullable=False) # INFO, WARN, ERROR
    service = Column(String(30), nullable=False)
    message = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
