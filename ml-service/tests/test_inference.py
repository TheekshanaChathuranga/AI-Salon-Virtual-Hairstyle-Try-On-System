import os
import sys
import cv2
import numpy as np

# Add ml-service root to pythonpath
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.inference import inference_service
from app.config import settings

def test_inference_pipeline():
    inference_service.initialize()

    # Load test images
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    cust_path = os.path.join(base_dir, "prototype", "data", "customer.jpg")
    style_path = os.path.join(base_dir, "prototype", "data", "hair_blonde_bob.jpg")

    assert os.path.exists(cust_path), f"Customer image not found: {cust_path}"
    assert os.path.exists(style_path), f"Hairstyle image not found: {style_path}"

    with open(cust_path, "rb") as f:
        cust_bytes = f.read()
    with open(style_path, "rb") as f:
        style_bytes = f.read()

    # Test try-on
    result = inference_service.run_tryon(cust_bytes, style_bytes, hair_color="blonde")

    assert result["success"] is True
    assert result["result_image_b64"].startswith("data:image/jpeg;base64,")
    assert result["processing_time_ms"] > 0
    print(f"ML Service Test Passed! Processing time: {result['processing_time_ms']}ms")

if __name__ == "__main__":
    test_inference_pipeline()
