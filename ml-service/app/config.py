import os

class Settings:
    MODEL_ADAPTER: str = os.getenv("MODEL_ADAPTER", "localvision") # 'localvision', 'hairfastgan', 'stablehair'
    DEVICE: str = os.getenv("DEVICE", "cpu") # 'cuda' or 'cpu'
    PORT: int = int(os.getenv("PORT", "8001"))
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    YUNET_PATH: str = os.getenv(
        "YUNET_PATH",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "yunet.onnx"))
    )
    MAX_IMAGE_SIZE_MB: int = int(os.getenv("MAX_IMAGE_SIZE_MB", "10"))
    MIN_FACE_CONFIDENCE: float = float(os.getenv("MIN_FACE_CONFIDENCE", "0.6"))

settings = Settings()
