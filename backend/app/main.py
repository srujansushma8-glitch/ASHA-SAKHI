"""
ASHA Sakhi Voice Field Register - FastAPI Backend Application.
Entry point for REST API, WebSocket voice streaming, and AI pipeline orchestration.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import (
    health_router,
    beneficiaries_router,
    visits_router,
    followups_router,
    voice_ws_router,
    ambulance_router,
    sync_router,
    visit_requests_router,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("asha_sakhi")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle management."""
    logger.info(f"Starting {settings.APP_NAME} in '{settings.APP_ENV}' mode...")
    # Initialize SQLite database with schema and synthetic beneficiaries
    init_db(seed_synthetic=True)
    logger.info("Database initialized with synthetic records.")
    yield
    logger.info("Shutting down ASHA Sakhi backend.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend AI Engine and Voice Field Register for ASHA Workers in Karnataka, India.",
    version="1.1.0",
    lifespan=lifespan,
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router)
app.include_router(beneficiaries_router)
app.include_router(visits_router)
app.include_router(followups_router)
app.include_router(voice_ws_router)
app.include_router(ambulance_router)
app.include_router(sync_router)
app.include_router(visit_requests_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
