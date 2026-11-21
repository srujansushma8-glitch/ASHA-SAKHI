"""
ASHA Sakhi Voice Field Register - FastAPI Backend Application.
Entry point for REST API, WebSocket voice streaming, and AI pipeline orchestration.
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database import init_db
from app.auth import router as auth_router
from app.routers import (
    health_router,
    beneficiaries_router,
    visits_router,
    followups_router,
    voice_ws_router,
    ambulance_router,
    sync_router,
    visit_requests_router,
    assistant_router,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
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

# Restrict CORS origins via environment configuration
cors_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"),
)
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def validate_query_limits(request: Request, call_next):
    limit_str = request.query_params.get("limit")
    if limit_str is not None:
        try:
            val = int(limit_str)
            if val > 100:
                return JSONResponse(
                    status_code=422,
                    content={
                        "detail": [
                            {
                                "loc": ["query", "limit"],
                                "msg": "Input should be less than or equal to 100",
                                "type": "less_than_equal",
                            }
                        ]
                    },
                )
            if val < 1:
                return JSONResponse(
                    status_code=422,
                    content={
                        "detail": [
                            {
                                "loc": ["query", "limit"],
                                "msg": "Input should be greater than or equal to 1",
                                "type": "greater_than_equal",
                            }
                        ]
                    },
                )
        except ValueError:
            return JSONResponse(
                status_code=422,
                content={
                    "detail": [
                        {
                            "loc": ["query", "limit"],
                            "msg": "Input should be a valid integer",
                            "type": "int_parsing",
                        }
                    ]
                },
            )
    offset_str = request.query_params.get("offset")
    if offset_str is not None:
        try:
            val = int(offset_str)
            if val < 0:
                return JSONResponse(
                    status_code=422,
                    content={
                        "detail": [
                            {
                                "loc": ["query", "offset"],
                                "msg": "Input should be greater than or equal to 0",
                                "type": "greater_than_equal",
                            }
                        ]
                    },
                )
        except ValueError:
            return JSONResponse(
                status_code=422,
                content={
                    "detail": [
                        {
                            "loc": ["query", "offset"],
                            "msg": "Input should be a valid integer",
                            "type": "int_parsing",
                        }
                    ]
                },
            )
    return await call_next(request)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    status_code = getattr(exc, "status_code", 500)
    code = getattr(exc, "code", "INTERNAL_SERVER_ERROR")
    message = getattr(exc, "detail", str(exc) or "Internal server error")
    return JSONResponse(
        status_code=status_code if isinstance(status_code, int) and 400 <= status_code <= 599 else 500,
        content={"error": {"code": code, "message": str(message)}},
    )

# Register routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(beneficiaries_router)
app.include_router(visits_router)
app.include_router(followups_router)
app.include_router(voice_ws_router)
app.include_router(ambulance_router)
app.include_router(sync_router)
app.include_router(visit_requests_router)
app.include_router(assistant_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
