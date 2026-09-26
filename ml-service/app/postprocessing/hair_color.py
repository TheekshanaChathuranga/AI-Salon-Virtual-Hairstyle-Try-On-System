"""
Hair Color Engine for ML Service.
"""

import cv2
import numpy as np
from typing import Dict, Tuple, Optional, Any

SALON_COLOR_PRESETS: Dict[str, Dict[str, Any]] = {
    "natural_black": {
        "name": "Natural Black",
        "l_factor": 0.45,
        "target_a": 0,
        "target_b": 0,
        "sat_mult": 0.3,
        "hex": "#1A1A1A"
    },
    "dark_brown": {
        "name": "Dark Brown",
        "l_factor": 0.65,
        "target_a": 8,
        "target_b": 18,
        "sat_mult": 0.7,
        "hex": "#3B2219"
    },
    "brown": {
        "name": "Rich Brown",
        "l_factor": 0.85,
        "target_a": 12,
        "target_b": 28,
        "sat_mult": 0.9,
        "hex": "#5A3825"
    },
    "light_brown": {
        "name": "Light Brown",
        "l_factor": 1.15,
        "target_a": 14,
        "target_b": 32,
        "sat_mult": 1.0,
        "hex": "#85583E"
    },
    "blonde": {
        "name": "Honey Blonde",
        "l_factor": 1.55,
        "target_a": 6,
        "target_b": 46,
        "sat_mult": 1.2,
        "hex": "#D1B280"
    },
    "ash_blonde": {
        "name": "Ash Blonde",
        "l_factor": 1.45,
        "target_a": -2,
        "target_b": 18,
        "sat_mult": 0.6,
        "hex": "#C5BAA8"
    },
    "burgundy": {
        "name": "Burgundy",
        "l_factor": 0.75,
        "target_a": 42,
        "target_b": 16,
        "sat_mult": 1.4,
        "hex": "#5E1929"
    },
    "red": {
        "name": "Vibrant Red",
        "l_factor": 1.05,
        "target_a": 48,
        "target_b": 38,
        "sat_mult": 1.5,
        "hex": "#9B2318"
    },
    "caramel": {
        "name": "Warm Caramel",
        "l_factor": 1.25,
        "target_a": 18,
        "target_b": 42,
        "sat_mult": 1.15,
        "hex": "#A76B39"
    },
    "copper": {
        "name": "Glossy Copper",
        "l_factor": 1.15,
        "target_a": 32,
        "target_b": 44,
        "sat_mult": 1.35,
        "hex": "#B8562B"
    }
}

class HairColorEngine:
    @staticmethod
    def hex_to_lab(hex_code: str) -> Tuple[float, float, float]:
        hex_code = hex_code.lstrip("#")
        if len(hex_code) == 3:
            hex_code = "".join([c * 2 for c in hex_code])
        r = int(hex_code[0:2], 16)
        g = int(hex_code[2:4], 16)
        b = int(hex_code[4:6], 16)
        bgr = np.uint8([[[b, g, r]]])
        lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)[0, 0]
        return float(lab[0]), float(lab[1]), float(lab[2])

    @classmethod
    def apply_color(
        cls,
        image_bgr: np.ndarray,
        hair_mask: np.ndarray,
        color_name_or_hex: str,
        blend_strength: float = 0.85
    ) -> np.ndarray:
        if color_name_or_hex is None or hair_mask is None or np.max(hair_mask) == 0:
            return image_bgr.copy()

        color_key = color_name_or_hex.lower().replace(" ", "_").replace("-", "_")

        lab = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2LAB).astype(np.float32)
        l_chan, a_chan, b_chan = cv2.split(lab)

        if hair_mask.dtype != np.float32:
            mask_float = hair_mask.astype(np.float32) / 255.0
        else:
            mask_float = hair_mask.copy()

        mask_blurred = cv2.GaussianBlur(mask_float, (9, 9), 3.0)

        if color_key in SALON_COLOR_PRESETS:
            preset = SALON_COLOR_PRESETS[color_key]
            l_factor = preset["l_factor"]
            target_a = 128.0 + preset["target_a"]
            target_b = 128.0 + preset["target_b"]

            new_l = l_chan * l_factor
            if l_factor > 1.0:
                boost = (255.0 - l_chan) * (l_factor - 1.0) * 0.4
                new_l = np.clip(l_chan + boost, 0, 255)
            else:
                new_l = np.clip(new_l, 0, 255)

            new_a = a_chan * (1.0 - blend_strength) + target_a * blend_strength
            new_b = b_chan * (1.0 - blend_strength) + target_b * blend_strength

        elif color_name_or_hex.startswith("#") or len(color_name_or_hex) in (6, 7):
            target_l, target_a, target_b = cls.hex_to_lab(color_name_or_hex)
            ratio = (target_l + 20) / (np.mean(l_chan[mask_blurred > 0.3]) + 1e-5)
            ratio = float(np.clip(ratio, 0.5, 1.8))
            new_l = np.clip(l_chan * ratio, 0, 255)
            new_a = a_chan * (1.0 - blend_strength) + target_a * blend_strength
            new_b = b_chan * (1.0 - blend_strength) + target_b * blend_strength
        else:
            return image_bgr.copy()

        final_l = l_chan * (1.0 - mask_blurred) + new_l * mask_blurred
        final_a = a_chan * (1.0 - mask_blurred) + new_a * mask_blurred
        final_b = b_chan * (1.0 - mask_blurred) + new_b * mask_blurred

        merged_lab = cv2.merge([
            np.clip(final_l, 0, 255).astype(np.uint8),
            np.clip(final_a, 0, 255).astype(np.uint8),
            np.clip(final_b, 0, 255).astype(np.uint8)
        ])

        return cv2.cvtColor(merged_lab, cv2.COLOR_LAB2BGR)
