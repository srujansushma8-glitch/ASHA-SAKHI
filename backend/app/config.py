"""
Configuration settings for ASHA Sakhi Backend
Loads environment variables and provides structured application configuration.
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "ASHA Sakhi Voice Field Register"
    APP_ENV: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_PATH: Path = BASE_DIR / "data" / "asha_sakhi.db"
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'data' / 'asha_sakhi.db'}"

    # Speech Recognition (ASR)
    ASR_MODE: str = Field(default="mock", description="Options: mock, ai4bharat_hosted, indic_transcribe_local")
    AI4BHARAT_ASR_API_URL: str = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
    AI4BHARAT_API_KEY: str = ""
    AI4BHARAT_USER_ID: str = ""
    AI4BHARAT_ASR_SERVICE_ID: str = "bhashini/ai4bharat/conformer-multilingual-asr"

    # Speech Synthesis (TTS)
    TTS_MODE: str = Field(default="mock", description="Options: mock, ai4bharat_hosted, indic_tts_local")
    AI4BHARAT_TTS_API_URL: str = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
    AI4BHARAT_TTS_SERVICE_ID: str = "bhashini/ai4bharat/indic-tts-kn"
    AI4BHARAT_TTS_GENDER: str = "female"

    # Information Extraction
    EXTRACTION_MODE: str = Field(default="auto", description="Options: auto, deterministic, gemini")
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # Danger Detection
    DANGER_DETECTION_STRICT_MODE: bool = True
    FUZZY_MATCH_THRESHOLD: int = 85

    # Audio Parameters
    AUDIO_SAMPLE_RATE: int = 16000
    AUDIO_CHANNELS: int = 1
    MAX_AUDIO_CHUNK_BYTES: int = 1048576  # 1MB per chunk

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
