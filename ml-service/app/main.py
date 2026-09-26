"""
Main entry point for the ML Inference Microservice.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.services.inference import inference_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML model into memory once
    inference_service.initialize()
    yield
    # Shutdown
    print("[ML Service] Shutting down.")

app = FastAPI(
    title="AI Salon ML Inference Microservice",
    description="High-fidelity virtual hairstyle try-on inference engine",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for communication from backend or direct clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    from app.config import settings
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=False)
