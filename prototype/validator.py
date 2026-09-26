"""
Face and Image Quality Validator for AI Salon Try-On System.
Detects faces, evaluates frontal pose, blurriness, illumination, and ensures
customer photos adhere to salon production standards.
"""

import os
import cv2
import numpy as np
from typing import Dict, Any, Tuple, Optional

class ImageValidator:
    def __init__(self, yunet_path: Optional[str] = None, min_face_confidence: float = 0.6):
        self.min_face_confidence = min_face_confidence
        if yunet_path is None:
            # Default to bundled yunet.onnx in prototype or relative folder
            base_dir = os.path.dirname(os.path.abspath(__file__))
            yunet_path = os.path.join(base_dir, "yunet.onnx")
            if not os.path.exists(yunet_path):
                # Fallback to current working directory
                yunet_path = os.path.abspath("prototype/yunet.onnx")

        self.yunet_path = yunet_path
        self._detector = None

    def _get_detector(self, width: int, height: int):
        if not os.path.exists(self.yunet_path):
            raise FileNotFoundError(f"YuNet ONNX model not found at {self.yunet_path}")
        return cv2.FaceDetectorYN_create(
            self.yunet_path,
            "",
            (width, height),
            self.min_face_confidence,
            0.3,
            5000
        )

    def validate(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Validates an input BGR image.
        Returns:
            {
                "valid": bool,
                "message": str,
                "face_box": [x, y, w, h],
                "landmarks": {
                    "right_eye": (x, y),
                    "left_eye": (x, y),
                    "nose": (x, y),
                    "right_mouth": (x, y),
                    "left_mouth": (x, y)
                },
                "confidence": float,
                "blur_score": float,
                "brightness_score": float,
                "num_faces": int
            }
        """
        if image is None or image.size == 0:
            return {
                "valid": False,
                "message": "Invalid image data received.",
                "face_box": None,
                "landmarks": None,
                "confidence": 0.0,
                "blur_score": 0.0,
                "brightness_score": 0.0,
                "num_faces": 0
            }

        height, width = image.shape[:2]
        if height < 256 or width < 256:
            return {
                "valid": False,
                "message": f"Image resolution too low ({width}x{height}). Minimum required is 256x256.",
                "face_box": None,
                "landmarks": None,
                "confidence": 0.0,
                "blur_score": 0.0,
                "brightness_score": 0.0,
                "num_faces": 0
            }

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # 1. Blur Detection using Laplacian variance
        blur_score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        if blur_score < 40.0:
            return {
                "valid": False,
                "message": "The photo appears too blurry. Please take or upload a sharper photo with your face in focus.",
                "face_box": None,
                "landmarks": None,
                "confidence": 0.0,
                "blur_score": blur_score,
                "brightness_score": float(np.mean(gray)),
                "num_faces": 0
            }

        # 2. Illumination / Brightness validation
        mean_brightness = float(np.mean(gray))
        if mean_brightness < 35.0:
            return {
                "valid": False,
                "message": "The photo is too dark. Please use brighter, well-lit salon lighting.",
                "face_box": None,
                "landmarks": None,
                "confidence": 0.0,
                "blur_score": blur_score,
                "brightness_score": mean_brightness,
                "num_faces": 0
            }
        elif mean_brightness > 240.0:
            return {
                "valid": False,
                "message": "The photo is overexposed/too bright. Please reduce harsh direct glare.",
                "face_box": None,
                "landmarks": None,
                "confidence": 0.0,
                "blur_score": blur_score,
                "brightness_score": mean_brightness,
                "num_faces": 0
            }

        # 3. Face Detection & Landmark Extraction using YuNet
        detector = self._get_detector(width, height)
        res, raw_faces = detector.detect(image)

        if raw_faces is None or len(raw_faces) == 0:
            return {
                "valid": False,
                "message": "No face detected. Please ensure your face is clearly visible and facing the camera.",
                "face_box": None,
                "landmarks": None,
                "confidence": 0.0,
                "blur_score": blur_score,
                "brightness_score": mean_brightness,
                "num_faces": 0
            }

        # Filter faces by minimum area (must be at least 4% of image area to be considered a subject)
        min_area = (width * height) * 0.04
        significant_faces = []
        for f in raw_faces:
            fw, fh = f[2], f[3]
            area = fw * fh
            if area >= min_area and f[-1] >= self.min_face_confidence:
                significant_faces.append(f)

        if len(significant_faces) == 0:
            return {
                "valid": False,
                "message": "Face is too small or far from the camera. Please frame your face closer.",
                "face_box": None,
                "landmarks": None,
                "confidence": float(raw_faces[0][-1]),
                "blur_score": blur_score,
                "brightness_score": mean_brightness,
                "num_faces": len(raw_faces)
            }

        if len(significant_faces) > 1:
            return {
                "valid": False,
                "message": "Multiple people detected. Only one customer should be visible in the photo.",
                "face_box": None,
                "landmarks": None,
                "confidence": float(significant_faces[0][-1]),
                "blur_score": blur_score,
                "brightness_score": mean_brightness,
                "num_faces": len(significant_faces)
            }

        primary_face = significant_faces[0]
        fx, fy, fw, fh = [float(v) for v in primary_face[0:4]]
        confidence = float(primary_face[-1])

        # 5 Facial Landmarks:
        # [4,5]: Right Eye, [6,7]: Left Eye, [8,9]: Nose, [10,11]: Right Mouth, [12,13]: Left Mouth
        landmarks = {
            "right_eye": (float(primary_face[4]), float(primary_face[5])),
            "left_eye": (float(primary_face[6]), float(primary_face[7])),
            "nose": (float(primary_face[8]), float(primary_face[9])),
            "right_mouth": (float(primary_face[10]), float(primary_face[11])),
            "left_mouth": (float(primary_face[12]), float(primary_face[13]))
        }

        # 4. Frontal Orientation Check:
        # Eye distance and nose symmetry
        re_x, re_y = landmarks["right_eye"]
        le_x, le_y = landmarks["left_eye"]
        nose_x, nose_y = landmarks["nose"]

        eye_dist = np.hypot(le_x - re_x, le_y - re_y)
        if eye_dist < fw * 0.2:
            return {
                "valid": False,
                "message": "Extreme face profile detected. Please look directly forward at the camera.",
                "face_box": [fx, fy, fw, fh],
                "landmarks": landmarks,
                "confidence": confidence,
                "blur_score": blur_score,
                "brightness_score": mean_brightness,
                "num_faces": 1
            }

        # Check nose centering between eyes (yaw estimation)
        mid_eye_x = (re_x + le_x) / 2.0
        yaw_offset = abs(nose_x - mid_eye_x) / (eye_dist + 1e-6)
        if yaw_offset > 0.45:
            return {
                "valid": False,
                "message": "Please look straight ahead rather than turning sideways.",
                "face_box": [fx, fy, fw, fh],
                "landmarks": landmarks,
                "confidence": confidence,
                "blur_score": blur_score,
                "brightness_score": mean_brightness,
                "num_faces": 1
            }

        return {
            "valid": True,
            "message": "Photo passed all quality and face alignment checks.",
            "face_box": [fx, fy, fw, fh],
            "landmarks": landmarks,
            "confidence": round(confidence, 4),
            "blur_score": round(blur_score, 2),
            "brightness_score": round(mean_brightness, 2),
            "num_faces": 1
        }
