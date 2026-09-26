"""
Customer Session API Routes with Explicit Privacy Consent.
"""

import uuid
import secrets
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CustomerSession
from app.schemas import CreateSessionRequest, SessionResponse
from app.config import settings

router = APIRouter(prefix="/api/v1/customers", tags=["Sessions"])

@router.post("/session", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_customer_session(payload: CreateSessionRequest, db: Session = Depends(get_db)):
    if not payload.consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer consent is required to process photographs for virtual try-on."
        )

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(hours=settings.IMAGE_RETENTION_HOURS)
    token = secrets.token_hex(32)

    session = CustomerSession(
        id=str(uuid.uuid4()),
        session_token=token,
        consent_given=True,
        consent_timestamp=now,
        expires_at=expires_at
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return SessionResponse(
        session_id=session.id,
        session_token=session.session_token,
        consent_given=session.consent_given,
        created_at=session.created_at,
        expires_at=session.expires_at
    )
