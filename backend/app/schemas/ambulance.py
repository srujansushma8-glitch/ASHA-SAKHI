"""
Pydantic schemas for Real GPS and Simulated Ambulance Dispatch and Tracking.
Supports 6 emergency lifecycle statuses, real device GPS telemetry streaming, and road routing metrics.
"""

from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel, Field, model_validator


class AmbulanceStatus(str, Enum):
    # Phase 4 Required 6 Emergency Lifecyle Statuses:
    EMERGENCY_REQUESTED = "EMERGENCY_REQUESTED"
    AMBULANCE_ASSIGNED = "AMBULANCE_ASSIGNED"
    EN_ROUTE = "EN_ROUTE"
    APPROACHING = "APPROACHING"
    ARRIVED = "ARRIVED"
    TRIP_COMPLETED = "TRIP_COMPLETED"
    
    # Backwards compatibility aliases:
    REQUESTED = "REQUESTED"
    DISPATCHED = "DISPATCHED"
    ON_THE_WAY = "ON_THE_WAY"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class AmbulanceRequestCreate(BaseModel):
    beneficiary_id: Optional[str] = None
    emergency_id: Optional[str] = None
    visit_id: Optional[str] = None
    pickup_location: str = Field(..., description="Village name or landmark for emergency pickup")
    destination_facility: Optional[str] = "Mandya Taluk Hospital & PHC Sector 4"
    notes: Optional[str] = None
    pickup_lat: Optional[float] = 12.5835
    pickup_lng: Optional[float] = 76.9280


class AmbulanceStatusUpdate(BaseModel):
    status: AmbulanceStatus
    notes: Optional[str] = None


class AmbulanceLocationUpdate(BaseModel):
    current_latitude: float
    current_longitude: float
    eta_minutes: int = Field(ge=0)
    status: Optional[AmbulanceStatus] = None


class AmbulanceTelemetryUpdate(BaseModel):
    current_latitude: Optional[float] = None
    current_longitude: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None
    eta_minutes: Optional[int] = None
    distance_km: Optional[float] = None
    status: Optional[str] = None
    tracking_mode: Optional[str] = "LIVE_GPS"  # "LIVE_GPS" or "DEMO_SIMULATION"
    trip_active: Optional[bool] = True
    driver_name: Optional[str] = "Ramesh Gowda"
    driver_phone: Optional[str] = "+91 94480 10801"
    vehicle_number: Optional[str] = "KA-11-G-1081"

    @model_validator(mode="before")
    @classmethod
    def resolve_lat_lng(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if "current_latitude" not in values or values["current_latitude"] is None:
                values["current_latitude"] = values.get("latitude", 12.5450)
            if "current_longitude" not in values or values["current_longitude"] is None:
                values["current_longitude"] = values.get("longitude", 76.9090)
        return values


class AmbulanceRequestResponse(BaseModel):
    id: str
    beneficiary_id: Optional[str]
    emergency_id: Optional[str]
    visit_id: Optional[str]
    pickup_location: str
    status: str
    vehicle_number: str
    driver_name: str
    driver_phone: str
    eta_minutes: int
    current_latitude: float
    current_longitude: float
    destination_facility: str
    is_simulation: bool = False
    simulation_disclaimer: Optional[str] = None
    notes: Optional[str]
    created_at: str
    updated_at: str


class AmbulanceTrackingResponse(BaseModel):
    request_id: str
    status: str
    vehicle_number: str
    driver_name: str
    driver_phone: str
    eta_minutes: int
    distance_km: float = 2.4
    current_latitude: float
    current_longitude: float
    pickup_location: str
    destination_facility: str
    progress_percentage: int
    pickup_lat: float = 12.5835
    pickup_lng: float = 76.9280
    hospital_lat: float = 12.5240
    hospital_lng: float = 76.8980
    beneficiary_name: Optional[str] = "Geetha M."
    tracking_mode: str = "LIVE_GPS"  # "LIVE_GPS" or "DEMO_SIMULATION"
    trip_active: bool = False
    accuracy: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None
    is_simulation: bool = False
    simulation_disclaimer: Optional[str] = None
