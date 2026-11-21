import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class AppSettings(BaseModel):
    # Service settings
    HOST: str = os.getenv("PYTHON_SERVICE_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PYTHON_SERVICE_PORT", "8000"))
    
    # Audio DSP settings
    TARGET_SAMPLE_RATE: int = 16000
    RMS_FRAME_LENGTH: int = 2048        # ~128ms at 16kHz
    RMS_HOP_LENGTH: int = 512           # ~32ms at 16kHz
    WINDOW_SEC: float = 0.5             # 0.5s - 1.0s window for dynamic estimation
    HOP_SEC: float = 0.25               # Overlapping step
    LOUDNESS_INCREASE_RATIO: float = 2.4 # ~+7.6 dB relative to baseline
    PITCH_MIN_HZ: float = 65.0          # Low male pitch
    PITCH_MAX_HZ: float = 400.0         # High female / stressed pitch
    PITCH_SHIFT_SEMITONES: float = 4.0  # Significant pitch jump
    PAUSE_MIN_DURATION_SEC: float = 2.5 # Minimum duration for significant pause
    
    # Speech-to-Text settings
    WHISPER_MODEL_SIZE: str = os.getenv("WHISPER_MODEL_SIZE", "base")
    WHISPER_DEVICE: str = os.getenv("WHISPER_DEVICE", "cpu")
    WHISPER_COMPUTE_TYPE: str = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
    
    # LLM & AI Analysis settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini") # "gemini", "openai", or "heuristic"
    CONTEXT_WINDOW_SEC: float = 8.0     # Context window surrounding events

settings = AppSettings()
