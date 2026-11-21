"""
Health check router.
"""

from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health")
async def health_check():
    """Health check reporting system and model adapter statuses."""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "asr_mode": settings.ASR_MODE,
        "tts_mode": settings.TTS_MODE,
        "extraction_mode": settings.EXTRACTION_MODE,
        "database": "sqlite_connected",
    }
