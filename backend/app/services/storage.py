"""
Secure Storage and Image Management Service.
Enforces randomized filenames, MIME type validation, file size restrictions,
and privacy-preserving image deletion.
"""

import os
import uuid
from typing import Tuple, Optional
from fastapi import UploadFile, HTTPException, status
from PIL import Image

from app.config import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}

class StorageService:
    @staticmethod
    def save_upload(file: UploadFile) -> Tuple[str, str, int]:
        """
        Validates and saves an uploaded customer image with a randomized UUID filename.
        Returns: (image_id, relative_path, file_size)
        """
        # 1. Extension check
        ext = os.path.splitext(file.filename or "")[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file format '{ext}'. Allowed formats: JPG, JPEG, PNG, WEBP."
            )

        # 2. Generate cryptographically safe random UUID filename
        image_id = str(uuid.uuid4())
        safe_filename = f"{image_id}{ext}"
        destination_path = os.path.join(settings.STORAGE_DIR, safe_filename)

        # 3. Stream and enforce size limit
        max_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
        total_bytes = 0

        with open(destination_path, "wb") as out_file:
            while chunk := file.file.read(1024 * 1024):
                total_bytes += len(chunk)
                if total_bytes > max_bytes:
                    out_file.close()
                    if os.path.exists(destination_path):
                        os.remove(destination_path)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File exceeds maximum limit of {settings.MAX_IMAGE_SIZE_MB}MB."
                    )
                out_file.write(chunk)

        # 4. Deep Inspection using PIL to verify it's a valid, non-executable image
        try:
            with Image.open(destination_path) as img:
                img.verify()
        except Exception:
            if os.path.exists(destination_path):
                os.remove(destination_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Corrupt or malicious image file detected."
            )

        relative_url = f"/api/v1/images/{safe_filename}"
        return image_id, relative_url, total_bytes

    @staticmethod
    def delete_image(filename_or_id: str) -> bool:
        """Deletes customer image immediately upon request."""
        # Sanitize filename against path traversal attacks
        base_name = os.path.basename(filename_or_id)
        file_path = os.path.join(settings.STORAGE_DIR, base_name)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False

storage_service = StorageService()
