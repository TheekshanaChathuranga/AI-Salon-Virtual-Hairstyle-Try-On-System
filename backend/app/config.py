import os

class Settings:
    PROJECT_NAME: str = "AI Salon Virtual Hairstyle Backend"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./salon.db")
    ML_SERVICE_URL: str = os.getenv("ML_SERVICE_URL", "http://localhost:8001")
    IMAGE_RETENTION_HOURS: int = int(os.getenv("IMAGE_RETENTION_HOURS", "24"))
    MAX_IMAGE_SIZE_MB: int = int(os.getenv("MAX_IMAGE_SIZE_MB", "10"))
    PORT: int = int(os.getenv("PORT", "8000"))
    SECRET_KEY: str = os.getenv("SECRET_KEY", "salon-ai-super-secret-key-production-ready-2026")
    STORAGE_DIR: str = os.path.abspath(os.getenv("STORAGE_DIR", os.path.join(os.path.dirname(__file__), "..", "uploads")))
    STATIC_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))

settings = Settings()
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
os.makedirs(settings.STATIC_DIR, exist_ok=True)
