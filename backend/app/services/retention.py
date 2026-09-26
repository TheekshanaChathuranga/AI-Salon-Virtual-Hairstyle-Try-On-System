"""
Automated Privacy Retention Service.
Periodically scrubs customer photos and try-on results exceeding the retention threshold.
"""

import os
import time
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from app.config import settings
from app.models import TryOnJob, CustomerSession

def purge_expired_images(db: Session) -> int:
    """
    Finds and deletes try-on images and expired customer sessions.
    Returns the count of purged files.
    """
    now = datetime.now(timezone.utc)
    expired_jobs = db.query(TryOnJob).filter(TryOnJob.expires_at <= now).all()
    purged_count = 0

    for job in expired_jobs:
        # Delete output image if exists
        if job.output_image_url:
            filename = os.path.basename(job.output_image_url)
            filepath = os.path.join(settings.STORAGE_DIR, filename)
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                    purged_count += 1
                except Exception as e:
                    print(f"[Retention] Failed to delete file {filepath}: {e}")

        # Delete input image if stored in uploads
        if job.input_image_url and "/api/v1/images/" in job.input_image_url:
            filename = os.path.basename(job.input_image_url)
            filepath = os.path.join(settings.STORAGE_DIR, filename)
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                    purged_count += 1
                except Exception:
                    pass

        db.delete(job)

    # Clean up expired sessions
    expired_sessions = db.query(CustomerSession).filter(CustomerSession.expires_at <= now).all()
    for s in expired_sessions:
        db.delete(s)

    db.commit()
    if purged_count > 0:
        print(f"[Retention] Successfully purged {purged_count} expired images to protect customer privacy.")
    return purged_count
