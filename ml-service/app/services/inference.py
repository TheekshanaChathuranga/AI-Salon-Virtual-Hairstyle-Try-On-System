"""
Inference Service Manager for ML Microservice.
Follows singleton pattern to ensure models are loaded once into memory on startup.
"""

import base64
import time
import cv2
import numpy as np
from typing import Dict, Any, Optional, Tuple

from app.config import settings
from app.models.base_model import HairstyleTransferModel, ModelInferenceResult
from app.models.local_vision_adapter import LocalVisionAdapter
from app.models.hairfastgan_adapter import HairFastGANAdapter
from app.models.stable_hair_adapter import StableHairAdapter
from app.preprocessing.validator import ImageValidator

class InferenceService:
    _instance: Optional['InferenceService'] = None
    model: Optional[HairstyleTransferModel] = None
    validator: Optional[ImageValidator] = None

    def __init__(self):
        self.validator = ImageValidator()
        self.adapter_name = settings.MODEL_ADAPTER.lower()
        self.model = self._create_adapter(self.adapter_name)

    @classmethod
    def get_instance(cls) -> 'InferenceService':
        if cls._instance is None:
            cls._instance = InferenceService()
        return cls._instance

    def _create_adapter(self, adapter_name: str) -> HairstyleTransferModel:
        if adapter_name == "hairfastgan":
            return HairFastGANAdapter()
        elif adapter_name == "stablehair":
            return StableHairAdapter()
        else:
            return LocalVisionAdapter()

    def initialize(self):
        """Called once during FastAPI lifespan startup."""
        print(f"[InferenceService] Initializing ML adapter: {self.adapter_name.upper()}...")
        success = self.model.load_model()
        print(f"[InferenceService] Model loaded successfully: {success}")

    def decode_image(self, image_data: Any) -> np.ndarray:
        """Decodes raw bytes, file buffers, or base64 string into BGR OpenCV image."""
        if isinstance(image_data, np.ndarray):
            return image_data

        if isinstance(image_data, str):
            # Check for data URI prefix e.g. "data:image/jpeg;base64,"
            if "base64," in image_data:
                image_data = image_data.split("base64,")[1]
            raw_bytes = base64.b64decode(image_data)
        elif isinstance(image_data, bytes):
            raw_bytes = image_data
        else:
            raise ValueError(f"Unsupported image data format: {type(image_data)}")

        np_arr = np.frombuffer(raw_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image from provided byte buffer.")
        return img

    def encode_image_base64(self, image_bgr: np.ndarray, quality: int = 92) -> str:
        """Encodes OpenCV BGR image into Base64 JPEG data URI."""
        encode_params = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        success, buffer = cv2.imencode(".jpg", image_bgr, encode_params)
        if not success:
            raise ValueError("Failed to encode result image to JPEG.")
        b64_str = base64.b64encode(buffer).decode("utf-8")
        return f"data:image/jpeg;base64,{b64_str}"

    def validate_customer_image(self, customer_image_data: Any) -> Dict[str, Any]:
        """Fast validation endpoint for real-time frontend feedback."""
        img = self.decode_image(customer_image_data)
        return self.validator.validate(img)

    def run_tryon(
        self,
        customer_image_data: Any,
        hairstyle_image_data: Any,
        hair_color: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes hairstyle transfer try-on.
        Returns:
            {
                "success": bool,
                "result_image_b64": str,
                "model_name": str,
                "selected_color": str,
                "processing_time_ms": int,
                "timings": dict,
                "metadata": dict
            }
        """
        cust_img = self.decode_image(customer_image_data)
        style_img = self.decode_image(hairstyle_image_data)

        res = self.model.generate(cust_img, style_img, hair_color=hair_color)

        result_b64 = self.encode_image_base64(res.result_image)

        return {
            "success": res.success,
            "result_image_b64": result_b64,
            "model_name": res.model_name,
            "selected_color": res.selected_color,
            "processing_time_ms": res.processing_time_ms,
            "timings": res.timings,
            "metadata": res.metadata
        }

inference_service = InferenceService.get_instance()
