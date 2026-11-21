"""
Ambulance Dispatch & Movement Tracking Service.
Supports both LIVE GPS Mode (real device telemetry) and DEMO SIMULATION Mode (calibrated road waypoints).
Implements the 6-phase emergency lifecycle:
EMERGENCY_REQUESTED -> AMBULANCE_ASSIGNED -> EN_ROUTE -> APPROACHING -> ARRIVED -> TRIP_COMPLETED.
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.models.ambulance import AmbulanceRepository
from app.schemas.ambulance import (
    AmbulanceRequestCreate,
    AmbulanceStatus,
    AmbulanceTelemetryUpdate,
    AmbulanceTrackingResponse,
)

logger = logging.getLogger(__name__)

# Realistic physical road waypoints along Mandya Keregodu Road (Karnataka)
MANDYA_ROAD_WAYPOINTS = [
    {"lat": 12.5240, "lng": 76.8980, "status": "AMBULANCE_ASSIGNED", "eta": 15, "dist": 7.8, "desc": "Mandya Taluk Hospital Base (Dispatched)"},
    {"lat": 12.5350, "lng": 76.9030, "status": "EN_ROUTE", "eta": 11, "dist": 6.1, "desc": "Mandya Medical College Circle (NH-275)"},
    {"lat": 12.5480, "lng": 76.9110, "status": "EN_ROUTE", "eta": 8, "dist": 4.5, "desc": "Gutalu Road / Sugar Town Junction"},
    {"lat": 12.5620, "lng": 76.9190, "status": "APPROACHING", "eta": 5, "dist": 2.8, "desc": "Keregodu Road Cross (Approaching)"},
    {"lat": 12.5760, "lng": 76.9240, "status": "APPROACHING", "eta": 2, "dist": 1.1, "desc": "Keregodu Gram Panchayat Boundary"},
    {"lat": 12.5835, "lng": 76.9280, "status": "ARRIVED", "eta": 0, "dist": 0.0, "desc": "Patient Residence Pickup Location (Arrived)"},
]

STATUS_SEQUENCE = [
    "EMERGENCY_REQUESTED",
    "AMBULANCE_ASSIGNED",
    "EN_ROUTE",
    "APPROACHING",
    "ARRIVED",
    "TRIP_COMPLETED",
]

# In-memory telemetry cache for high-frequency GPS updates
_LIVE_TELEMETRY_CACHE: Dict[str, Dict[str, Any]] = {}


class AmbulanceTrackingService:
    """
    Manages live GPS telemetry and demo simulation for 108 emergency transport.
    """

    @staticmethod
    def create_request(
        beneficiary_id: Optional[str] = "ASHA-KA-2024-0102",
        emergency_id: Optional[str] = None,
        visit_id: Optional[str] = None,
        pickup_location: str = "House #42, Main Road, Keregodu Village",
        destination_facility: str = "Mandya Taluk Hospital & PHC Sector 4",
        notes: Optional[str] = None,
        pickup_lat: float = 12.5835,
        pickup_lng: float = 76.9280,
    ) -> Dict[str, Any]:
        req_create = AmbulanceRequestCreate(
            beneficiary_id=beneficiary_id,
            emergency_id=emergency_id,
            visit_id=visit_id,
            pickup_location=pickup_location,
            destination_facility=destination_facility,
            notes=notes,
            pickup_lat=pickup_lat,
            pickup_lng=pickup_lng,
        )
        saved = AmbulanceRepository.create(req_create)
        return saved

    @staticmethod
    def record_telemetry(request_id: str, telemetry: AmbulanceTelemetryUpdate) -> Dict[str, Any]:
        """
        Records high-frequency live GPS telemetry from the ambulance driver interface.
        """
        lat = telemetry.current_latitude
        lng = telemetry.current_longitude

        # Validate latitude and longitude ordering and boundaries
        if not (-90.0 <= lat <= 90.0 and -180.0 <= lng <= 180.0):
            raise ValueError(f"Invalid GPS coordinates: lat={lat}, lng={lng}")

        status = telemetry.status or "EN_ROUTE"
        eta = telemetry.eta_minutes if telemetry.eta_minutes is not None else 8
        dist = telemetry.distance_km if telemetry.distance_km is not None else 2.4

        # Update persistent repository
        updated = AmbulanceRepository.update_location(
            request_id=request_id,
            current_latitude=lat,
            current_longitude=lng,
            eta_minutes=eta,
            status=status,
        )

        # Update live cache
        cache_data = {
            "request_id": request_id,
            "current_latitude": lat,
            "current_longitude": lng,
            "accuracy": telemetry.accuracy,
            "speed": telemetry.speed,
            "heading": telemetry.heading,
            "eta_minutes": eta,
            "distance_km": dist,
            "status": status,
            "tracking_mode": telemetry.tracking_mode or "LIVE_GPS",
            "trip_active": telemetry.trip_active,
            "driver_name": telemetry.driver_name or "Ramesh Gowda",
            "driver_phone": telemetry.driver_phone or "+91 94480 10801",
            "vehicle_number": telemetry.vehicle_number or "KA-11-G-1081",
            "updated_at": datetime.now().isoformat(),
        }
        _LIVE_TELEMETRY_CACHE[request_id] = cache_data
        return cache_data

    @staticmethod
    def step_simulation(request_id: str) -> Dict[str, Any]:
        """
        Advances the simulated ambulance along the calibrated physical road waypoints.
        """
        record = AmbulanceRepository.get_by_id(request_id)
        current_status = record["status"] if record else "EMERGENCY_REQUESTED"

        # Determine current waypoint index
        curr_cache = _LIVE_TELEMETRY_CACHE.get(request_id, {})
        curr_idx = curr_cache.get("waypoint_index", 0)

        next_idx = min(len(MANDYA_ROAD_WAYPOINTS) - 1, curr_idx + 1)
        wp = MANDYA_ROAD_WAYPOINTS[next_idx]

        status = wp["status"]
        if next_idx == len(MANDYA_ROAD_WAYPOINTS) - 1:
            status = "ARRIVED"

        updated = AmbulanceRepository.update_location(
            request_id=request_id,
            current_latitude=wp["lat"],
            current_longitude=wp["lng"],
            eta_minutes=wp["eta"],
            status=status,
        )

        telemetry_update = {
            "request_id": request_id,
            "current_latitude": wp["lat"],
            "current_longitude": wp["lng"],
            "accuracy": 4.5,
            "speed": 42.0,
            "heading": 38.5,
            "eta_minutes": wp["eta"],
            "distance_km": wp["dist"],
            "status": status,
            "tracking_mode": "DEMO_SIMULATION",
            "trip_active": status != "TRIP_COMPLETED",
            "waypoint_index": next_idx,
            "updated_at": datetime.now().isoformat(),
        }
        _LIVE_TELEMETRY_CACHE[request_id] = telemetry_update
        return telemetry_update

    @staticmethod
    def get_tracking_info(request_id: str) -> Optional[AmbulanceTrackingResponse]:
        record = AmbulanceRepository.get_by_id(request_id)
        if not record:
            # Create default seed record if missing
            record = AmbulanceTrackingService.create_request()

        cached = _LIVE_TELEMETRY_CACHE.get(request_id, {})

        status = cached.get("status") or record.get("status") or "AMBULANCE_ASSIGNED"
        lat = cached.get("current_latitude") or record.get("current_latitude") or 12.5450
        lng = cached.get("current_longitude") or record.get("current_longitude") or 76.9090
        eta = cached.get("eta_minutes") if cached.get("eta_minutes") is not None else record.get("eta_minutes") or 8
        dist = cached.get("distance_km") if cached.get("distance_km") is not None else 2.4
        mode = cached.get("tracking_mode") or "LIVE_GPS"

        # Calculate progress percentage based on 6 statuses
        status_map = {
            "EMERGENCY_REQUESTED": 15,
            "AMBULANCE_ASSIGNED": 35,
            "EN_ROUTE": 60,
            "APPROACHING": 85,
            "ARRIVED": 98,
            "TRIP_COMPLETED": 100,
            "REQUESTED": 15,
            "DISPATCHED": 35,
            "ON_THE_WAY": 60,
            "COMPLETED": 100,
        }
        progress = status_map.get(status, 40)

        is_sim = mode == "DEMO_SIMULATION"
        disclaimer = "DEMO SIMULATION: Predefined road coordinates for testing." if is_sim else None

        return AmbulanceTrackingResponse(
            request_id=record.get("id") or request_id,
            status=status,
            vehicle_number=cached.get("vehicle_number") or record.get("vehicle_number") or "KA-11-G-1081",
            driver_name=cached.get("driver_name") or record.get("driver_name") or "Ramesh Gowda",
            driver_phone=cached.get("driver_phone") or record.get("driver_phone") or "+91 94480 10801",
            eta_minutes=eta,
            distance_km=dist,
            current_latitude=lat,
            current_longitude=lng,
            pickup_location=record.get("pickup_location") or "Keregodu Village, Mandya",
            destination_facility=record.get("destination_facility") or "Mandya Taluk Hospital & PHC",
            progress_percentage=progress,
            pickup_lat=12.5835,
            pickup_lng=76.9280,
            hospital_lat=12.5240,
            hospital_lng=76.8980,
            beneficiary_name="Geetha M. (High Risk ANC)",
            tracking_mode=mode,
            trip_active=cached.get("trip_active", True),
            accuracy=cached.get("accuracy"),
            speed=cached.get("speed"),
            heading=cached.get("heading"),
            is_simulation=is_sim,
            simulation_disclaimer=disclaimer,
        )


ambulance_service = AmbulanceTrackingService()
AmbulanceSimulationService = AmbulanceTrackingService

