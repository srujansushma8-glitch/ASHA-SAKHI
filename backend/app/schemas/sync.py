"""
Pydantic schemas for Offline Synchronization Support.
Enables rural ASHA field workers to store visits locally while disconnected
and synchronize idempotently upon regaining cellular coverage.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.visit import VisitCreate
from app.schemas.followup import FollowupCreate


class OfflineVisitItem(BaseModel):
    client_id: str = Field(..., description="Local client-side temporary UUID")
    visit_data: VisitCreate
    recorded_at: str


class SyncBatchUploadRequest(BaseModel):
    asha_worker_id: Optional[str] = "ASHA-KA-LOCAL"
    device_id: Optional[str] = "ANDROID-DEVICE-01"
    sync_timestamp: str
    visits: List[OfflineVisitItem] = Field(default_factory=list)
    pending_followups: List[FollowupCreate] = Field(default_factory=list)


class SyncedItemMapping(BaseModel):
    client_id: str
    server_id: str
    status: str = "SYNCED"


class SyncBatchUploadResponse(BaseModel):
    status: str = "SUCCESS"
    synced_visits_count: int
    synced_followups_count: int
    mappings: List[SyncedItemMapping] = Field(default_factory=list)
    conflicts_resolved: int = 0
    server_timestamp: str


class SyncDeltaResponse(BaseModel):
    since_timestamp: str
    server_timestamp: str
    beneficiaries: List[Dict[str, Any]] = Field(default_factory=list)
    visits: List[Dict[str, Any]] = Field(default_factory=list)
    followups: List[Dict[str, Any]] = Field(default_factory=list)
