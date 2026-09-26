from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# Session Schemas
class CreateSessionRequest(BaseModel):
    consent: bool = Field(..., description="Explicit customer consent for temporary virtual try-on processing")

class SessionResponse(BaseModel):
    session_id: str
    session_token: str
    consent_given: bool
    created_at: datetime
    expires_at: datetime

# Hairstyle Schemas
class HairstyleBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    length: str
    texture: str
    reference_image_url: str
    thumbnail_url: str
    tags: List[str] = []
    active: bool = True

class HairstyleCreate(HairstyleBase):
    pass

class HairstyleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    length: Optional[str] = None
    texture: Optional[str] = None
    reference_image_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    tags: Optional[List[str]] = None
    active: Optional[bool] = None

class HairstyleResponse(HairstyleBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Try-On Job Schemas
class CreateTryOnJobRequest(BaseModel):
    session_token: str
    hairstyle_id: str
    input_image_id_or_url: str
    selected_color: Optional[str] = None

class TryOnJobResponse(BaseModel):
    id: str
    session_id: str
    hairstyle_id: Optional[str] = None
    selected_color: Optional[str] = None
    input_image_url: str
    output_image_url: Optional[str] = None
    status: str
    model_name: str
    processing_time_ms: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Image Upload Response
class ImageUploadResponse(BaseModel):
    image_id: str
    url: str
    filename: str
    size_bytes: int
    is_valid_face: bool
    validation_message: str

# Admin Stats
class AdminStatsResponse(BaseModel):
    total_tryons: int
    daily_tryons: int
    popular_hairstyles: List[Dict[str, Any]]
    failed_generations: int
    average_generation_time_ms: int
