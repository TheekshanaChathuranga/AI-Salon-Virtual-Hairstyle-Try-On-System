"""
Hairstyle Catalog API Routes.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models import Hairstyle
from app.schemas import HairstyleResponse, HairstyleCreate, HairstyleUpdate

router = APIRouter(prefix="/api/v1/hairstyles", tags=["Hairstyles"])

@router.get("", response_model=List[HairstyleResponse])
def list_hairstyles(
    category: Optional[str] = Query(None, description="Category filter (short, medium, long, special)"),
    length: Optional[str] = Query(None, description="Length filter (pixie, bob, shoulder, long)"),
    texture: Optional[str] = Query(None, description="Texture filter (straight, wavy, curly, coily)"),
    search: Optional[str] = Query(None, description="Search term in name, description, or tags"),
    include_inactive: bool = Query(False, description="Admin flag to include inactive styles"),
    db: Session = Depends(get_db)
):
    query = db.query(Hairstyle)
    if not include_inactive:
        query = query.filter(Hairstyle.active == True)

    if category:
        query = query.filter(Hairstyle.category == category.lower())
    if length:
        query = query.filter(Hairstyle.length == length.lower())
    if texture:
        query = query.filter(Hairstyle.texture == texture.lower())
    if search:
        search_pattern = f"%{search.lower()}%"
        query = query.filter(
            or_(
                Hairstyle.name.ilike(search_pattern),
                Hairstyle.description.ilike(search_pattern)
            )
        )

    return query.order_by(Hairstyle.created_at.asc()).all()

@router.get("/{hairstyle_id}", response_model=HairstyleResponse)
def get_hairstyle(hairstyle_id: str, db: Session = Depends(get_db)):
    style = db.query(Hairstyle).filter(Hairstyle.id == hairstyle_id).first()
    if not style:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hairstyle not found.")
    return style

@router.post("", response_model=HairstyleResponse, status_code=status.HTTP_201_CREATED)
def create_hairstyle(payload: HairstyleCreate, db: Session = Depends(get_db)):
    new_style = Hairstyle(**payload.model_dump())
    db.add(new_style)
    db.commit()
    db.refresh(new_style)
    return new_style

@router.put("/{hairstyle_id}", response_model=HairstyleResponse)
def update_hairstyle(hairstyle_id: str, payload: HairstyleUpdate, db: Session = Depends(get_db)):
    style = db.query(Hairstyle).filter(Hairstyle.id == hairstyle_id).first()
    if not style:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hairstyle not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(style, key, value)

    db.commit()
    db.refresh(style)
    return style

@router.delete("/{hairstyle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hairstyle(hairstyle_id: str, hard_delete: bool = False, db: Session = Depends(get_db)):
    style = db.query(Hairstyle).filter(Hairstyle.id == hairstyle_id).first()
    if not style:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hairstyle not found.")

    if hard_delete:
        db.delete(style)
    else:
        style.active = False
    db.commit()
    return None
