"""
HTTP Client for communicating with the ML Inference Microservice.
"""

import os
import uuid
import httpx
import base64
from typing import Dict, Any, Optional

from app.config import settings

class MLClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.ML_SERVICE_URL

    async def check_health(self) -> Dict[str, Any]:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{self.base_url}/health")
            resp.raise_for_status()
            return resp.json()

    async def validate_face(self, image_bytes: bytes) -> Dict[str, Any]:
        b64_img = base64.b64encode(image_bytes).decode("utf-8")
        payload = {"image_b64": f"data:image/jpeg;base64,{b64_img}"}
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(f"{self.base_url}/api/v1/validate-face", json=payload)
            resp.raise_for_status()
            return resp.json()

    async def run_tryon(
        self,
        customer_image_bytes: bytes,
        hairstyle_image_bytes: bytes,
        hair_color: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends try-on request to ML service, saves output image to storage,
        and returns result URL and performance metrics.
        """
        cust_b64 = base64.b64encode(customer_image_bytes).decode("utf-8")
        style_b64 = base64.b64encode(hairstyle_image_bytes).decode("utf-8")

        payload = {
            "customer_image_b64": f"data:image/jpeg;base64,{cust_b64}",
            "hairstyle_image_b64": f"data:image/jpeg;base64,{style_b64}",
            "hair_color": hair_color
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(f"{self.base_url}/api/v1/try-on", json=payload)
            resp.raise_for_status()
            data = resp.json()

        # Save result image to disk
        result_b64_str = data["result_image_b64"]
        if "base64," in result_b64_str:
            result_b64_str = result_b64_str.split("base64,")[1]

        raw_result_bytes = base64.b64decode(result_b64_str)
        output_id = str(uuid.uuid4())
        output_filename = f"result_{output_id}.jpg"
        output_path = os.path.join(settings.STORAGE_DIR, output_filename)

        with open(output_path, "wb") as f:
            f.write(raw_result_bytes)

        return {
            "output_image_url": f"/api/v1/images/{output_filename}",
            "model_name": data.get("model_name", "AI Salon ML"),
            "processing_time_ms": data.get("processing_time_ms", 0),
            "timings": data.get("timings", {}),
            "metadata": data.get("metadata", {})
        }

ml_client = MLClient()
