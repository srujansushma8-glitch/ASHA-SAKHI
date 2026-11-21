"""
Offline Synchronization REST API Router.
Enables offline batch upload and delta sync for mobile field registers.
"""

from fastapi import APIRouter, Query, Depends
from app.schemas.sync import (
    SyncBatchUploadRequest,
    SyncBatchUploadResponse,
    SyncDeltaResponse,
)
from app.services.sync_service import sync_service
from app.auth import get_current_user

router = APIRouter(
    prefix="/api/sync",
    tags=["Offline Synchronization"],
    dependencies=[Depends(get_current_user)],
)


@router.post("/batch", response_model=SyncBatchUploadResponse)
async def upload_offline_batch(req: SyncBatchUploadRequest):
    """
    Uploads a batch of offline visit records captured without cellular connectivity.
    Idempotently saves visits and schedules required follow-ups.
    """
    return sync_service.process_batch(req)


@router.get("/delta", response_model=SyncDeltaResponse)
async def get_sync_delta(
    since: str = Query("", description="ISO timestamp for delta synchronization")
):
    """
    Retrieves records modified or created since the given timestamp.
    """
    return sync_service.get_delta(since)
