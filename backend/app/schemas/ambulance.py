"""
Pydantic schemas for Simulated Ambulance Dispatch and Tracking.
Explicitly flags that this is a simulated triage tool and never a real 108 booking.
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class AmbulanceStatus(str, Enum):
    REQUESTED = "REQUESTED"
    DISPATCHED = "DISPATCHED"
    ON_THE_WAY = "ON_THE_WAY"
    ARRIVED = "ARRIVED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class AmbulanceRequestCreate(BaseModel):
    beneficiary_id: Optional[str] = None
    emergency_id: Optional[str] = None
    visit_id: Optional[str] = None
    pickup_location: str = Field(..., description="Village name or landmark for emergency pickup")
    destination_facility: Optional[str] = "Hoskote Taluk Hospital / Primary Health Centre (PHC)"
    notes: Optional[str] = None


class AmbulanceStatusUpdate(BaseModel):
    status: AmbulanceStatus
    notes: Optional[str] = None


class AmbulanceLocationUpdate(BaseModel):
    current_latitude: float
    current_longitude: float
    eta_minutes: int = Field(ge=0)
    status: Optional[AmbulanceStatus] = None


class AmbulanceRequestResponse(BaseModel):
    id: str
    beneficiary_id: Optional[str]
    emergency_id: Optional[str]
    visit_id: Optional[str]
    pickup_location: str
    status: AmbulanceStatus
    vehicle_number: str
    driver_name: str
    driver_phone: str
    eta_minutes: int
    current_latitude: float
    current_longitude: float
    destination_facility: str
    is_simulation: bool = True
    simulation_disclaimer: str
    notes: Optional[str]
    created_at: str
    updated_at: str


class AmbulanceTrackingResponse(BaseModel):
    request_id: str
    status: AmbulanceStatus
    vehicle_number: str
    driver_name: str
    driver_phone: str
    eta_minutes: int
    current_latitude: float
    current_longitude: float
    pickup_location: str
    destination_facility: str
    progress_percentage: int
    is_simulation: bool = True
    simulation_disclaimer: str = "SIMULATION ONLY - NOT A REAL 108 AMBULANCE DISPATCH"
