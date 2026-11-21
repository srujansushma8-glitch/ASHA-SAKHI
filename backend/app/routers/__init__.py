from app.routers.health import router as health_router
from app.routers.beneficiaries import router as beneficiaries_router
from app.routers.visits import router as visits_router
from app.routers.followups import router as followups_router
from app.routers.voice_ws import router as voice_ws_router

__all__ = [
    "health_router",
    "beneficiaries_router",
    "visits_router",
    "followups_router",
    "voice_ws_router",
]
