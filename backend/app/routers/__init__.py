from app.routers.health import router as health_router
from app.routers.beneficiaries import router as beneficiaries_router
from app.routers.visits import router as visits_router
from app.routers.followups import router as followups_router
from app.routers.voice_ws import router as voice_ws_router
from app.routers.ambulance import router as ambulance_router
from app.routers.sync import router as sync_router
from app.routers.visit_requests import router as visit_requests_router

__all__ = [
    "health_router",
    "beneficiaries_router",
    "visits_router",
    "followups_router",
    "voice_ws_router",
    "ambulance_router",
    "sync_router",
    "visit_requests_router",
]
