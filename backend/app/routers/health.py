"""
Health check and multilingual languages router.
"""

from fastapi import APIRouter
from app.config import settings
from app.services.indic_languages import INDIC_LANGUAGES
from app.database import get_db_connection

router = APIRouter(prefix="/api", tags=["Health & Languages"])


@router.get("/health")
async def health_check():
    """Health check reporting system and model adapter statuses."""
    with get_db_connection() as conn:
        conn.execute("SELECT 1").fetchone()

    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "asr_mode": settings.ASR_MODE,
        "tts_mode": settings.TTS_MODE,
        "extraction_mode": settings.EXTRACTION_MODE,
        "database": "sqlite_connected",
        "supported_languages_count": len(INDIC_LANGUAGES),
    }


@router.get("/languages")
async def get_supported_languages():
    """Returns metadata for all 22 scheduled Indian languages."""
    return {
        "total": len(INDIC_LANGUAGES),
        "languages": [info.model_dump() for info in INDIC_LANGUAGES.values()]
    }
