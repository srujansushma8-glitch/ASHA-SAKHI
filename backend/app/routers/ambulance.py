"""
Ambulance Simulation REST API Router.
Provides endpoints for creating simulated ambulance requests, managing dispatch statuses,
advancing simulated transport steps, and tracking simulated vehicle telemetry.
CRITICAL SAFETY RULE: Explicitly flags all outputs with is_simulation=True and disclaimers.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.ambulance import AmbulanceRepository
from app.schemas.ambulance import (
    AmbulanceRequestCreate,
    AmbulanceRequestResponse,
    AmbulanceStatusUpdate,
    AmbulanceLocationUpdate,
    AmbulanceTrackingResponse,
)
from app.services.ambulance_service import ambulance_service

router = APIRouter(prefix="/api/ambulance", tags=["Ambulance Simulation"])


@router.post("/requests", response_model=AmbulanceRequestResponse)
async def create_ambulance_request(data: AmbulanceRequestCreate):
    """
    Creates a simulated 108 ambulance dispatch request.
    Note: Simulation only. Never claims real emergency dispatch.
    """
    created = ambulance_service.create_request(
        beneficiary_id=data.beneficiary_id,
        emergency_id=data.emergency_id,
        visit_id=data.visit_id,
        pickup_location=data.pickup_location,
        destination_facility=data.destination_facility or "Hoskote Taluk Hospital / PHC",
        notes=data.notes,
    )
    return created


@router.get("/requests", response_model=List[AmbulanceRequestResponse])
async def list_ambulance_requests(
    beneficiary_id: Optional[str] = Query(None, description="Filter by beneficiary ID"),
    status: Optional[str] = Query(None, description="Filter by dispatch status"),
):
    """Retrieves all simulated ambulance requests."""
    return AmbulanceRepository.get_all(beneficiary_id=beneficiary_id, status=status)


@router.get("/requests/{request_id}", response_model=AmbulanceRequestResponse)
async def get_ambulance_request(request_id: str):
    """Retrieves details of a specific simulated ambulance request."""
    record = AmbulanceRepository.get_by_id(request_id)
    if not record:
        raise HTTPException(
            status_code=404, detail=f"Ambulance request '{request_id}' not found."
        )
    return record


@router.patch("/requests/{request_id}/status", response_model=AmbulanceRequestResponse)
async def update_ambulance_status(request_id: str, data: AmbulanceStatusUpdate):
    """Updates the dispatch status (REQUESTED, DISPATCHED, ON_THE_WAY, ARRIVED, COMPLETED)."""
    updated = AmbulanceRepository.update_status(
        request_id=request_id,
        new_status=data.status.value,
        notes=data.notes,
    )
    if not updated:
        raise HTTPException(
            status_code=404, detail=f"Ambulance request '{request_id}' not found."
        )
    return updated


@router.patch("/requests/{request_id}/location", response_model=AmbulanceRequestResponse)
async def update_ambulance_location(request_id: str, data: AmbulanceLocationUpdate):
    """Updates simulated GPS coordinates, remaining ETA, and optional status."""
    status_val = data.status.value if data.status else None
    updated = AmbulanceRepository.update_location(
        request_id=request_id,
        current_latitude=data.current_latitude,
        current_longitude=data.current_longitude,
        eta_minutes=data.eta_minutes,
        status=status_val,
    )
    if not updated:
        raise HTTPException(
            status_code=404, detail=f"Ambulance request '{request_id}' not found."
        )
    return updated


@router.post("/requests/{request_id}/simulate-step", response_model=AmbulanceRequestResponse)
async def simulate_dispatch_step(request_id: str):
    """
    Advances the simulation step automatically:
    REQUESTED -> DISPATCHED -> ON_THE_WAY -> ARRIVED -> COMPLETED.
    """
    updated = ambulance_service.step_simulation(request_id)
    if not updated:
        raise HTTPException(
            status_code=404, detail=f"Ambulance request '{request_id}' not found."
        )
    return updated


@router.get("/requests/{request_id}/tracking", response_model=AmbulanceTrackingResponse)
async def get_ambulance_tracking(request_id: str):
    """Returns real-time simulated telemetry, progress percentage, and driver info for map rendering."""
    tracking = ambulance_service.get_tracking_info(request_id)
    if not tracking:
        raise HTTPException(
            status_code=404, detail=f"Ambulance request '{request_id}' not found."
        )
    return tracking
