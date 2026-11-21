"""
Ambulance REST API Router.
Supports both LIVE GPS Mode (real device telemetry) and DEMO SIMULATION Mode.
Provides real-time telemetry streaming, driver dispatch actions, and WebSocket broadcast.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from app.models.ambulance import AmbulanceRepository
from app.schemas.ambulance import (
    AmbulanceRequestCreate,
    AmbulanceRequestResponse,
    AmbulanceStatusUpdate,
    AmbulanceLocationUpdate,
    AmbulanceTelemetryUpdate,
    AmbulanceTrackingResponse,
)
from app.services.ambulance_service import ambulance_service
from app.routers.voice_ws import broadcast_ws_event
from app.auth import get_current_user

router = APIRouter(
    prefix="/api/ambulance",
    tags=["Ambulance Operations & Live GPS"],
    dependencies=[Depends(get_current_user)],
)


@router.post("/requests", response_model=AmbulanceRequestResponse)
async def create_ambulance_request(data: AmbulanceRequestCreate):
    created = ambulance_service.create_request(
        beneficiary_id=data.beneficiary_id,
        emergency_id=data.emergency_id,
        visit_id=data.visit_id,
        pickup_location=data.pickup_location,
        destination_facility=data.destination_facility or "Mandya Taluk Hospital & PHC Sector 4",
        notes=data.notes,
        pickup_lat=data.pickup_lat or 12.5835,
        pickup_lng=data.pickup_lng or 76.9280,
    )
    return created


@router.get("/requests", response_model=List[AmbulanceRequestResponse])
async def list_ambulance_requests(
    beneficiary_id: Optional[str] = Query(None, description="Filter by beneficiary ID"),
    status: Optional[str] = Query(None, description="Filter by dispatch status"),
):
    return AmbulanceRepository.get_all(beneficiary_id=beneficiary_id, status=status)


@router.get("/requests/{request_id}", response_model=AmbulanceRequestResponse)
async def get_ambulance_request(request_id: str):
    record = AmbulanceRepository.get_by_id(request_id)
    if not record:
        raise HTTPException(
            status_code=404, detail=f"Ambulance request '{request_id}' not found."
        )
    return record


@router.patch("/requests/{request_id}/status", response_model=AmbulanceRequestResponse)
async def update_ambulance_status(request_id: str, data: AmbulanceStatusUpdate):
    status_str = data.status.value if hasattr(data.status, "value") else str(data.status)
    updated = AmbulanceRepository.update_status(
        request_id=request_id,
        new_status=status_str,
        notes=data.notes,
    )
    if not updated:
        raise HTTPException(
            status_code=404, detail=f"Ambulance request '{request_id}' not found."
        )
    # Broadcast to all connected dashboards
    await broadcast_ws_event("ambulance_update", updated)
    return updated


@router.post("/requests/{request_id}/telemetry")
async def receive_driver_telemetry(request_id: str, data: AmbulanceTelemetryUpdate):
    """
    Receives high-frequency live GPS telemetry from the Ambulance Driver interface.
    Broadcasts the position instantly to the ASHA worker dashboard over WebSockets.
    """
    try:
        recorded = ambulance_service.record_telemetry(request_id, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Broadcast live coordinates to all active dashboards
    await broadcast_ws_event("ambulance_update", recorded)
    return {"status": "ok", "telemetry": recorded}


@router.post("/requests/{request_id}/trip/start")
async def start_ambulance_trip(request_id: str):
    """
    Initiates an emergency trip: sets status to 'AMBULANCE_ASSIGNED' and activates live GPS streaming.
    """
    updated = AmbulanceRepository.update_status(request_id, "AMBULANCE_ASSIGNED", notes="Trip started by driver")
    if not updated:
        # Create request if not present
        ambulance_service.create_request()
        updated = AmbulanceRepository.update_status(request_id, "AMBULANCE_ASSIGNED", notes="Trip started by driver")
    
    tracking = ambulance_service.get_tracking_info(request_id)
    payload = tracking.model_dump() if hasattr(tracking, "model_dump") else tracking.dict()
    payload["trip_active"] = True
    await broadcast_ws_event("ambulance_update", payload)
    return payload


@router.post("/requests/{request_id}/trip/stop")
async def stop_ambulance_trip(request_id: str):
    """
    Completes the emergency transport trip: sets status to 'TRIP_COMPLETED' and terminates GPS streaming.
    """
    updated = AmbulanceRepository.update_status(request_id, "TRIP_COMPLETED", notes="Trip completed by driver")
    tracking = ambulance_service.get_tracking_info(request_id)
    payload = tracking.model_dump() if hasattr(tracking, "model_dump") else tracking.dict()
    payload["trip_active"] = False
    payload["status"] = "TRIP_COMPLETED"
    await broadcast_ws_event("ambulance_update", payload)
    return payload


@router.post("/requests/{request_id}/simulate-step")
async def simulate_dispatch_step(request_id: str):
    """
    Advances the demonstration simulation along realistic Mandya road waypoints.
    """
    stepped = ambulance_service.step_simulation(request_id)
    await broadcast_ws_event("ambulance_update", stepped)
    return stepped


@router.get("/tracking", response_model=AmbulanceTrackingResponse)
async def get_default_ambulance_tracking():
    """
    Returns real-time telemetry for the default active ambulance request (AMB-REQ-108-001).
    """
    tracking = ambulance_service.get_tracking_info("AMB-REQ-108-001")
    if not tracking:
        raise HTTPException(
            status_code=404, detail="Default ambulance request not found."
        )
    return tracking


@router.get("/requests/{request_id}/tracking", response_model=AmbulanceTrackingResponse)
async def get_ambulance_tracking(request_id: str):
    """
    Returns real-time telemetry, driver details, road distances, and coordinates for map rendering.
    """
    tracking = ambulance_service.get_tracking_info(request_id)
    if not tracking:
        raise HTTPException(
            status_code=404, detail=f"Ambulance request '{request_id}' not found."
        )
    return tracking
