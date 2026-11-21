"""
Ambulance Dispatch & Movement Simulation Service.
Simulates life-saving 108 emergency transport lifecycle for ASHA field referrals:
REQUESTED -> DISPATCHED -> ON_THE_WAY -> ARRIVED -> COMPLETED.
CRITICAL SAFETY RULE: Never claims or initiates a real ambulance dispatch.
"""

import logging
from typing import Optional, Dict, Any
from app.models.ambulance import AmbulanceRepository
from app.schemas.ambulance import AmbulanceRequestCreate, AmbulanceStatus, AmbulanceTrackingResponse

logger = logging.getLogger(__name__)

# Known village coordinate centers in Karnataka (Bangalore Rural / Ramanagara district)
VILLAGE_COORDINATES = {
    "hoskote": (13.0732, 77.7915),
    "devanahalli": (13.2483, 77.7126),
    "vijayapura": (13.2922, 77.8011),
    "ramanagara": (12.7209, 77.2799),
    "channapatna": (12.6518, 77.2089),
}

STATUS_PROGRESSION = [
    AmbulanceStatus.REQUESTED,
    AmbulanceStatus.DISPATCHED,
    AmbulanceStatus.ON_THE_WAY,
    AmbulanceStatus.ARRIVED,
    AmbulanceStatus.COMPLETED,
]

PROGRESS_MAP = {
    AmbulanceStatus.REQUESTED: 10,
    AmbulanceStatus.DISPATCHED: 35,
    AmbulanceStatus.ON_THE_WAY: 70,
    AmbulanceStatus.ARRIVED: 95,
    AmbulanceStatus.COMPLETED: 100,
    AmbulanceStatus.CANCELLED: 0,
}

ETA_MAP = {
    AmbulanceStatus.REQUESTED: 15,
    AmbulanceStatus.DISPATCHED: 12,
    AmbulanceStatus.ON_THE_WAY: 6,
    AmbulanceStatus.ARRIVED: 0,
    AmbulanceStatus.COMPLETED: 0,
    AmbulanceStatus.CANCELLED: 0,
}


class AmbulanceSimulationService:
    """
    Manages stateful progression of simulated emergency ambulance requests.
    """

    @staticmethod
    def create_request(
        beneficiary_id: Optional[str] = None,
        emergency_id: Optional[str] = None,
        visit_id: Optional[str] = None,
        pickup_location: str = "Hoskote Village",
        destination_facility: str = "Hoskote Taluk Hospital / Primary Health Centre (PHC)",
        notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Creates a new simulated ambulance dispatch record."""
        req_create = AmbulanceRequestCreate(
            beneficiary_id=beneficiary_id,
            emergency_id=emergency_id,
            visit_id=visit_id,
            pickup_location=pickup_location,
            destination_facility=destination_facility,
            notes=notes,
        )
        saved = AmbulanceRepository.create(req_create)
        logger.info(
            f"[AMBULANCE SIMULATION] Dispatched simulated ambulance request {saved['id']} "
            f"for beneficiary {beneficiary_id} at {pickup_location} (ETA {saved['eta_minutes']}m)"
        )
        return saved

    @staticmethod
    def step_simulation(request_id: str) -> Optional[Dict[str, Any]]:
        """
        Advances the simulated ambulance to the next logical state:
        REQUESTED -> DISPATCHED -> ON_THE_WAY -> ARRIVED -> COMPLETED.
        Simulates location updates moving towards destination.
        """
        record = AmbulanceRepository.get_by_id(request_id)
        if not record:
            return None

        current_status = AmbulanceStatus(record["status"])
        if current_status in [AmbulanceStatus.COMPLETED, AmbulanceStatus.CANCELLED]:
            return record

        curr_idx = STATUS_PROGRESSION.index(current_status)
        next_status = STATUS_PROGRESSION[min(len(STATUS_PROGRESSION) - 1, curr_idx + 1)]
        next_eta = ETA_MAP[next_status]

        # Simulate movement towards pickup coordinates
        loc_key = record["pickup_location"].lower()
        target_lat, target_lng = 13.0732, 77.7915
        for k, coords in VILLAGE_COORDINATES.items():
            if k in loc_key:
                target_lat, target_lng = coords
                break

        # Linear interpolation step
        ratio = PROGRESS_MAP[next_status] / 100.0
        base_lat, base_lng = 13.0100, 77.7000
        sim_lat = round(base_lat + ratio * (target_lat - base_lat), 4)
        sim_lng = round(base_lng + ratio * (target_lng - base_lng), 4)

        updated = AmbulanceRepository.update_location(
            request_id=request_id,
            current_latitude=sim_lat,
            current_longitude=sim_lng,
            eta_minutes=next_eta,
            status=next_status.value,
        )

        logger.info(
            f"[AMBULANCE SIMULATION] Step {request_id}: {current_status.value} -> {next_status.value} | "
            f"ETA {next_eta}m | Coordinates ({sim_lat}, {sim_lng})"
        )
        return updated

    @staticmethod
    def get_tracking_info(request_id: str) -> Optional[AmbulanceTrackingResponse]:
        """Provides full real-time simulated telemetry for frontend mapping."""
        record = AmbulanceRepository.get_by_id(request_id)
        if not record:
            return None

        status_enum = AmbulanceStatus(record["status"])
        progress = PROGRESS_MAP.get(status_enum, 0)

        return AmbulanceTrackingResponse(
            request_id=record["id"],
            status=status_enum,
            vehicle_number=record["vehicle_number"],
            driver_name=record["driver_name"],
            driver_phone=record["driver_phone"],
            eta_minutes=record["eta_minutes"],
            current_latitude=record["current_latitude"],
            current_longitude=record["current_longitude"],
            pickup_location=record["pickup_location"],
            destination_facility=record["destination_facility"],
            progress_percentage=progress,
            is_simulation=True,
            simulation_disclaimer="SIMULATION ONLY - NOT A REAL 108 AMBULANCE DISPATCH",
        )


ambulance_service = AmbulanceSimulationService()
