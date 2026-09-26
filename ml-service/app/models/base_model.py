"""
Base Model Abstraction for ML Service.
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
    timings: Dict[str, int]
    metadata: Dict[str, Any]
    success: bool
    error_message: Optional[str] = None

class HairstyleTransferModel(ABC):
    def __init__(self, model_name: str, config: Optional[Dict[str, Any]] = None):
        self.model_name = model_name
        self.config = config or {}
        self.is_loaded = False

    @abstractmethod
    def load_model(self) -> bool:
        pass

    @abstractmethod
    def validate_input(self, customer_image: np.ndarray, hairstyle_image: np.ndarray) -> Dict[str, Any]:
        pass

    @abstractmethod
    def preprocess(self, customer_image: np.ndarray, hairstyle_image: np.ndarray) -> Dict[str, Any]:
        pass

    @abstractmethod
    def generate(
        self,
        customer_image: np.ndarray,
        hairstyle_image: np.ndarray,
        hair_color: Optional[str] = None
    ) -> ModelInferenceResult:
        pass

    @abstractmethod
    def postprocess(self, raw_output: np.ndarray, original_customer: np.ndarray, **kwargs) -> np.ndarray:
        pass
