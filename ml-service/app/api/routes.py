"""
API Route Handlers for the ML Inference Microservice.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel
from typing import Optional, Dict, Any
try:
    import torch
    cuda_available = torch.cuda.is_available()
    gpu_name = torch.cuda.get_device_name(0) if cuda_available else None
except ImportError:
    torch = None
    cuda_available = False
    gpu_name = None

from app.config import settings
from app.services.inference import inference_service

router = APIRouter()

class TryOnRequestJSON(BaseModel):
    customer_image_b64: str
    hairstyle_image_b64: str
    hair_color: Optional[str] = None

class FaceValidationRequestJSON(BaseModel):
    image_b64: str

@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {
        "status": "healthy",
        "service": "salon-ml-inference",
        "device": "cuda" if cuda_available else "cpu",
        "cuda_available": cuda_available,
        "gpu_name": gpu_name,
        "active_adapter": settings.MODEL_ADAPTER
    }

@router.get("/model-info", status_code=status.HTTP_200_OK)
async def model_info():
    return {
        "model_name": inference_service.model.model_name,
        "adapter": settings.MODEL_ADAPTER,
        "supported_adapters": ["localvision", "hairfastgan", "stablehair"],
        "is_loaded": inference_service.model.is_loaded,
        "features": {
            "face_identity_preservation": True,
            "seamless_poisson_blending": True,
            "cielab_hair_color_engine": True,
            "yunet_landmark_alignment": True
        }
    }

@router.post("/api/v1/validate-face")
async def validate_face(payload: FaceValidationRequestJSON):
    """
    Validates a customer photo in real-time.
    Provides immediate feedback (face present, blur, lighting, angle).
    """
    try:
        val = inference_service.validate_customer_image(payload.image_b64)
        return val
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation failed: {str(e)}"
        )

@router.post("/api/v1/try-on")
async def try_on_json(payload: TryOnRequestJSON):
    """
    JSON Endpoint: Accepts base64 customer image and hairstyle image.
    Generates realistic try-on result and returns base64 JPEG.
    """
    try:
        result = inference_service.run_tryon(
            customer_image_data=payload.customer_image_b64,
            hairstyle_image_data=payload.hairstyle_image_b64,
            hair_color=payload.hair_color
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hairstyle try-on generation error: {str(e)}"
        )

@router.post("/api/v1/try-on-upload")
async def try_on_multipart(
    customer_image: UploadFile = File(...),
    hairstyle_image: UploadFile = File(...),
    hair_color: Optional[str] = Form(None)
):
    """
    Multipart/form-data upload endpoint for direct file streams.
    """
    try:
        cust_bytes = await customer_image.read()
        style_bytes = await hairstyle_image.read()

        result = inference_service.run_tryon(
            customer_image_data=cust_bytes,
            hairstyle_image_data=style_bytes,
            hair_color=hair_color
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hairstyle try-on generation error: {str(e)}"
        )
