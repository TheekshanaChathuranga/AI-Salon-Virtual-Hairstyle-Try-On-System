"""
LocalVisionAdapter implementation for ML Microservice.
High-speed Poisson seamless face cloning with 5-point landmark alignment
and CIELAB hair coloring.
"""

import time
import os
import cv2
import numpy as np
from typing import Dict, Any, Optional

from app.models.base_model import HairstyleTransferModel, ModelInferenceResult
from app.preprocessing.validator import ImageValidator
from app.postprocessing.hair_color import HairColorEngine

class LocalVisionAdapter(HairstyleTransferModel):
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        super().__init__(model_name="LocalVision-v1", config=config)
        self.validator = ImageValidator()
        self.is_loaded = True

    def load_model(self) -> bool:
        self.is_loaded = True
        return True

    def validate_input(self, customer_image: np.ndarray, hairstyle_image: np.ndarray) -> Dict[str, Any]:
        cust_val = self.validator.validate(customer_image)
        if not cust_val["valid"]:
            return {"valid": False, "error": f"Customer photo: {cust_val['message']}"}

        style_val = self.validator.validate(hairstyle_image)
        if not style_val["valid"]:
            return {"valid": False, "error": f"Hairstyle reference: {style_val['message']}"}

        return {
            "valid": True,
            "customer": cust_val,
            "hairstyle": style_val
        }

    def preprocess(self, customer_image: np.ndarray, hairstyle_image: np.ndarray) -> Dict[str, Any]:
        val_res = self.validate_input(customer_image, hairstyle_image)
        if not val_res["valid"]:
            raise ValueError(val_res["error"])
        return val_res

    def generate(
        self,
        customer_image: np.ndarray,
        hairstyle_image: np.ndarray,
        hair_color: Optional[str] = None
    ) -> ModelInferenceResult:
        start_time = time.perf_counter()

        # 1. Preprocess and Validate
        t0 = time.perf_counter()
        val = self.preprocess(customer_image, hairstyle_image)
        t_prep = int((time.perf_counter() - t0) * 1000)

        cust_val = val["customer"]
        style_val = val["hairstyle"]

        # 2. Eye Landmark Alignment Matrix
        t1 = time.perf_counter()
        c_eyes = np.array([cust_val['landmarks']['right_eye'], cust_val['landmarks']['left_eye']], dtype=np.float32)
        s_eyes = np.array([style_val['landmarks']['right_eye'], style_val['landmarks']['left_eye']], dtype=np.float32)

        c_eye_center = np.mean(c_eyes, axis=0)
        s_eye_center = np.mean(s_eyes, axis=0)
        scale = float(np.linalg.norm(s_eyes[1] - s_eyes[0]) / (np.linalg.norm(c_eyes[1] - c_eyes[0]) + 1e-6))
        angle = float(np.degrees(
            np.arctan2(s_eyes[1, 1] - s_eyes[0, 1], s_eyes[1, 0] - s_eyes[0, 0]) -
            np.arctan2(c_eyes[1, 1] - c_eyes[0, 1], c_eyes[1, 0] - c_eyes[0, 0])
        ))

        M = cv2.getRotationMatrix2D(tuple(c_eye_center), angle, scale)
        M[0, 2] += (s_eye_center[0] - c_eye_center[0])
        M[1, 2] += (s_eye_center[1] - c_eye_center[1])

        sh, sw = hairstyle_image.shape[:2]
        warped_cust = cv2.warpAffine(
            customer_image,
            M,
            (sw, sh),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REFLECT
        )

        # 3. Exact Face Shield Oval
        lm = style_val['landmarks']
        re = np.array(lm['right_eye'])
        le = np.array(lm['left_eye'])
        rm = np.array(lm['right_mouth'])
        l_m = np.array(lm['left_mouth'])

        mid_eye = (re + le) / 2.0
        mid_mouth = (rm + l_m) / 2.0
        ed = float(np.linalg.norm(le - re))

        face_center = (int(mid_eye[0]), int((mid_eye[1] + mid_mouth[1]) / 2.0 + ed * 0.06))
        face_mask = np.zeros((sh, sw), dtype=np.uint8)
        radius_x = int(ed * 0.72)
        radius_y = int(ed * 1.05)
        cv2.ellipse(face_mask, face_center, (radius_x, radius_y), 0, 0, 360, 255, -1)

        # 4. Poisson Seamless Compositing
        try:
            cloned = cv2.seamlessClone(warped_cust, hairstyle_image, face_mask, face_center, cv2.NORMAL_CLONE)
        except Exception:
            mask_blurred = cv2.GaussianBlur(face_mask.astype(np.float32) / 255.0, (21, 21), 7.0)[:, :, np.newaxis]
            cloned = (warped_cust.astype(np.float32) * mask_blurred + hairstyle_image.astype(np.float32) * (1.0 - mask_blurred)).astype(np.uint8)

        t_infer = int((time.perf_counter() - t1) * 1000)

        # 5. Hair Coloring
        t2 = time.perf_counter()
        if hair_color:
            hair_zone = np.zeros((sh, sw), dtype=np.uint8)
            cv2.ellipse(hair_zone, (face_center[0], int(face_center[1] - ed * 0.2)), (int(ed * 1.8), int(ed * 2.8)), 0, 0, 360, 255, -1)
            hair_zone = cv2.bitwise_and(hair_zone, cv2.bitwise_not(cv2.dilate(face_mask, np.ones((15, 15), np.uint8))))

            corners = [cloned[0:20, 0:20], cloned[0:20, -20:]]
            bg_mean = np.mean(corners, axis=(0, 1, 2))
            diff = np.linalg.norm(cloned.astype(np.float32) - bg_mean, axis=2)
            hair_mask_refined = cv2.bitwise_and(hair_zone, (diff > 30).astype(np.uint8) * 255)

            final_output = HairColorEngine.apply_color(
                image_bgr=cloned,
                hair_mask=hair_mask_refined,
                color_name_or_hex=hair_color
            )
        else:
            final_output = cloned

        t_post = int((time.perf_counter() - t2) * 1000)
        total_time_ms = int((time.perf_counter() - start_time) * 1000)

        return ModelInferenceResult(
            result_image=final_output,
            original_customer_image=customer_image,
            reference_hairstyle_image=hairstyle_image,
            model_name=self.model_name,
            selected_color=hair_color,
            processing_time_ms=total_time_ms,
            timings={
                "preprocessing_ms": t_prep,
                "inference_ms": t_infer,
                "postprocessing_ms": t_post
            },
            metadata={
                "customer_face_box": cust_val["face_box"],
                "customer_confidence": cust_val["confidence"],
                "blur_score": cust_val["blur_score"],
                "inter_ocular_distance": ed
            },
            success=True
        )

    def postprocess(self, raw_output: np.ndarray, original_customer: np.ndarray, **kwargs) -> np.ndarray:
        return raw_output
