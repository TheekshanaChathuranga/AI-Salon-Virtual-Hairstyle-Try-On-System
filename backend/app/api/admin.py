"""
Salon Admin Dashboard Analytics API Routes.
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import TryOnJob, Hairstyle
from app.schemas import AdminStatsResponse

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_dashboard_stats(db: Session = Depends(get_db)):
    total_tryons = db.query(TryOnJob).count()

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    daily_tryons = db.query(TryOnJob).filter(TryOnJob.created_at >= today_start).count()

    failed_generations = db.query(TryOnJob).filter(TryOnJob.status == "FAILED").count()

    avg_time_row = db.query(func.avg(TryOnJob.processing_time_ms)).filter(TryOnJob.status == "COMPLETED").scalar()
    avg_gen_time = int(avg_time_row) if avg_time_row is not None else 0

    # Popular hairstyles aggregation
    popular_counts = (
        db.query(Hairstyle.name, Hairstyle.category, func.count(TryOnJob.id).label("tryon_count"))
        .join(TryOnJob, Hairstyle.id == TryOnJob.hairstyle_id)
        .group_by(Hairstyle.id)
        .order_by(func.count(TryOnJob.id).desc())
        .limit(5)
        .all()
    )

    popular_list = [
        {"name": row[0], "category": row[1], "count": row[2]}
        for row in popular_counts
    ]

    return AdminStatsResponse(
        total_tryons=total_tryons,
        daily_tryons=daily_tryons,
        popular_hairstyles=popular_list,
        failed_generations=failed_generations,
        average_generation_time_ms=avg_gen_time
    )
