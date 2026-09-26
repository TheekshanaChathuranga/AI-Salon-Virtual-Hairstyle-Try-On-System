"""
Abstract Base Model and Interfaces for AI Salon Hairstyle Transfer.
Enables plug-and-play swapping between HairFastGAN, Stable-Hair, LocalVision,
and future deep-learning generative models.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional, Dict, Any
import numpy as np

@dataclass
class ModelInferenceResult:
    result_image: np.ndarray
    original_customer_image: np.ndarray
    reference_hairstyle_image: np.ndarray
    model_name: str
    selected_color: Optional[str]
    processing_time_ms: int
    timings: Dict[str, int] # preprocess, inference, postprocess
    metadata: Dict[str, Any]
    success: bool
    error_message: Optional[str] = None

class HairstyleTransferModel(ABC):
    """
    Unified interface for virtual try-on hairstyle transfer models.
    """
    def __init__(self, model_name: str, config: Optional[Dict[str, Any]] = None):
        self.model_name = model_name
        self.config = config or {}
        self.is_loaded = False

    @abstractmethod
    def load_model(self) -> bool:
        """Loads neural network weights / assets into memory / GPU."""
        pass

    @abstractmethod
    def validate_input(self, customer_image: np.ndarray, hairstyle_image: np.ndarray) -> Dict[str, Any]:
        """Validates images and face alignment."""
        pass

    @abstractmethod
    def preprocess(self, customer_image: np.ndarray, hairstyle_image: np.ndarray) -> Dict[str, Any]:
        """Preprocesses inputs (cropping, landmark alignment, normalization)."""
        pass

    @abstractmethod
    def generate(
        self,
        customer_image: np.ndarray,
        hairstyle_image: np.ndarray,
        hair_color: Optional[str] = None
    ) -> ModelInferenceResult:
        """Executes full try-on pipeline and returns structured result."""
        pass

    @abstractmethod
    def postprocess(self, raw_output: np.ndarray, original_customer: np.ndarray, **kwargs) -> np.ndarray:
        """Applies blending, edge sharpening, and face identity restoration."""
        pass
