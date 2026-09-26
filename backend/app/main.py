"""
Main FastAPI Application Entry Point for AI Salon Virtual Hairstyle Backend.
"""

from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database
from app.services.retention import purge_expired_images

from app.api.sessions import router as sessions_router
from app.api.hairstyles import router as hairstyles_router
from app.api.images import router as images_router
from app.api.tryon import router as tryon_router
from app.api.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist & seed catalog
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        purge_expired_images(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="AI Salon Virtual Hairstyle Try-On Backend API",
    description="Enterprise API Gateway for salon virtual try-on, catalog management, and customer sessions",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local Vite dev server and production clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static asset directory for hairstyles catalog
if os.path.exists(settings.STATIC_DIR):
    app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Include API Routers
app.include_router(sessions_router)
app.include_router(hairstyles_router)
app.include_router(images_router)
app.include_router(tryon_router)
app.include_router(admin_router)

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "salon-backend-api",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=False)
