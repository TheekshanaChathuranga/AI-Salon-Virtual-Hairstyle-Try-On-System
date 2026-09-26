"""
Virtual Try-On Job Orchestration Routes.
"""

import os
import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import TryOnJob, CustomerSession, Hairstyle
from app.schemas import CreateTryOnJobRequest, TryOnJobResponse
from app.services.ml_client import ml_client
from app.config import settings

router = APIRouter(prefix="/api/v1", tags=["Virtual Try-On"])

def read_image_bytes(image_path_or_url: str) -> bytes:
    """Helper to load image bytes from uploads or static hairstyle storage."""
    clean_path = image_path_or_url.replace("/api/v1/images/", "").replace("/static/", "")
    # Check uploads directory
    candidate_upload = os.path.join(settings.STORAGE_DIR, os.path.basename(clean_path))
    if os.path.exists(candidate_upload):
        with open(candidate_upload, "rb") as f:
            return f.read()

    # Check static directory
    candidate_static = os.path.join(settings.STATIC_DIR, clean_path)
    if os.path.exists(candidate_static):
        with open(candidate_static, "rb") as f:
            return f.read()

    # Check fallback in prototype/data
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    candidate_proto = os.path.join(root_dir, "prototype", "data", os.path.basename(clean_path))
    if os.path.exists(candidate_proto):
        with open(candidate_proto, "rb") as f:
            return f.read()

    raise FileNotFoundError(f"Source image file not found: {image_path_or_url}")

async def process_tryon_task(job_id: str, db: Session):
    job = db.query(TryOnJob).filter(TryOnJob.id == job_id).first()
    if not job:
        return

    job.status = "PROCESSING"
    db.commit()

    try:
        cust_bytes = read_image_bytes(job.input_image_url)
        style_bytes = read_image_bytes(job.hairstyle.reference_image_url)

        ml_res = await ml_client.run_tryon(
            customer_image_bytes=cust_bytes,
            hairstyle_image_bytes=style_bytes,
            hair_color=job.selected_color
        )

        job.status = "COMPLETED"
        job.output_image_url = ml_res["output_image_url"]
        job.model_name = ml_res.get("model_name", "AI Salon ML")
        job.processing_time_ms = ml_res.get("processing_time_ms", 0)
        job.completed_at = datetime.now(timezone.utc)
    except Exception as e:
        job.status = "FAILED"
        job.error_message = f"The hairstyle preview could not be generated. Please try another photo: {str(e)}"
    finally:
        db.commit()

@router.post("/try-on", response_model=TryOnJobResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_tryon_job(
    payload: CreateTryOnJobRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # 1. Validate session
    session = db.query(CustomerSession).filter(CustomerSession.session_token == payload.session_token).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid customer session or session expired.")

    # 2. Validate hairstyle
    style = db.query(Hairstyle).filter(Hairstyle.id == payload.hairstyle_id).first()
    if not style:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hairstyle not found.")

    # 3. Create Job
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=settings.IMAGE_RETENTION_HOURS)

    job = TryOnJob(
        id=str(uuid.uuid4()),
        session_id=session.id,
        hairstyle_id=style.id,
        selected_color=payload.selected_color,
        input_image_url=payload.input_image_id_or_url,
        status="QUEUED",
        created_at=now,
        expires_at=expires_at
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    # 4. Dispatch processing
    # Execute immediately in background task
    await process_tryon_task(job.id, db)
    db.refresh(job)

    return job

@router.get("/try-on/{job_id}", response_model=TryOnJobResponse)
def get_tryon_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(TryOnJob).filter(TryOnJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Try-on job not found.")
    return job

@router.get("/results/{job_id}")
def get_tryon_result(job_id: str, db: Session = Depends(get_db)):
    job = db.query(TryOnJob).filter(TryOnJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Try-on result not found.")

    return {
        "job_id": job.id,
        "status": job.status,
        "customer_original_url": job.input_image_url,
        "hairstyle_name": job.hairstyle.name if job.hairstyle else "Custom Style",
        "hairstyle_reference_url": job.hairstyle.reference_image_url if job.hairstyle else None,
        "selected_color": job.selected_color,
        "result_url": job.output_image_url,
        "model_name": job.model_name,
        "processing_time_ms": job.processing_time_ms,
        "created_at": job.created_at,
        "completed_at": job.completed_at
    }

@router.post("/results/{job_id}/share")
def share_tryon_result(job_id: str, db: Session = Depends(get_db)):
    job = db.query(TryOnJob).filter(TryOnJob.id == job_id).first()
    if not job or job.status != "COMPLETED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Result not ready for sharing.")

    share_token = str(uuid.uuid4())[:8]
    return {
        "share_id": share_token,
        "share_url": f"/result/{job.id}?share={share_token}",
        "salon_consultation_text": f"Customer lookbook: {job.hairstyle.name if job.hairstyle else 'Hairstyle'} with {job.selected_color or 'original'} tone."
    }
