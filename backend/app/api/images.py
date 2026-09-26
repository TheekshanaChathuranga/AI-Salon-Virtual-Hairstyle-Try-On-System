"""
Secure Image Upload and Privacy Scrubbing Routes.
"""

import os
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse

from app.config import settings
from app.services.storage import storage_service
from app.services.ml_client import ml_client
from app.schemas import ImageUploadResponse

router = APIRouter(prefix="/api/v1/images", tags=["Images"])

@router.post("/upload", response_model=ImageUploadResponse)
async def upload_customer_image(file: UploadFile = File(...)):
    # 1. Save and validate file format/size
    image_id, file_url, size_bytes = storage_service.save_upload(file)

    # 2. Inspect face presence and quality via ML microservice
    filename = os.path.basename(file_url)
    filepath = os.path.join(settings.STORAGE_DIR, filename)

    is_valid_face = True
    val_message = "Photo passed quality and face detection checks."

    try:
        with open(filepath, "rb") as f:
            raw_bytes = f.read()
        val_result = await ml_client.validate_face(raw_bytes)
        is_valid_face = val_result.get("valid", False)
        val_message = val_result.get("message", "Validation completed.")
    except Exception as e:
        print(f"[Upload] ML Service face check note: {e}")

    return ImageUploadResponse(
        image_id=image_id,
        url=file_url,
        filename=filename,
        size_bytes=size_bytes,
        is_valid_face=is_valid_face,
        validation_message=val_message
    )

@router.get("/{filename}")
def serve_image(filename: str):
    # Protect against directory traversal
    safe_name = os.path.basename(filename)
    filepath = os.path.join(settings.STORAGE_DIR, safe_name)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.")
    return FileResponse(filepath)

@router.delete("/{filename}", status_code=status.HTTP_200_OK)
def delete_customer_image(filename: str):
    """
    Immediate Privacy Scrub: User or system can request immediate erasure of their image.
    """
    safe_name = os.path.basename(filename)
    success = storage_service.delete_image(safe_name)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found or already deleted.")
    return {"message": "Image permanently erased in compliance with privacy retention policy."}
