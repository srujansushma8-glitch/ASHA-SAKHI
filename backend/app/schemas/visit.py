"""
Pydantic schemas for Visit records and Extraction results.
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date


class StructuredVisitExtraction(BaseModel):
    """
    Extracted structured record from ASHA worker's voice transcript.
    Never invents missing values; preserves uncertainty.
    """

    beneficiary_id: Optional[str] = Field(
        default=None, description="Identifier for beneficiary (e.g. BEN-KA-001)"
    )
    beneficiary_name: Optional[str] = Field(
        default=None, description="Name of beneficiary in Kannada or English"
    )
    visit_type: Optional[str] = Field(
        default="General Visit",
        description="Type of visit (ANC checkup, PNC visit, Newborn home visit, Immunization)",
    )
    weight: Optional[float] = Field(
        default=None, ge=0.5, le=200.0, description="Weight in kg (e.g. 52.5 or 3.2 for newborn)"
    )
    vaccinations_due: List[str] = Field(
        default_factory=list, description="List of vaccines due for this visit"
    )
    vaccinations_completed: List[str] = Field(
        default_factory=list, description="List of vaccines given/completed during this visit"
    )
    next_visit_date: Optional[str] = Field(
        default=None, description="Confirmed next visit date (YYYY-MM-DD)"
    )
    additional_notes: Optional[str] = Field(
        default=None, description="Additional clinical notes, IFA tablets distributed, etc."
    )
    uncertainty_notes: List[str] = Field(
        default_factory=list, description="Any ambiguity flagged during extraction"
    )
    requires_clarification: bool = Field(
        default=False, description="True if critical fields require verbal confirmation"
    )
    clarification_prompt: Optional[str] = Field(
        default=None, description="Specific question to ask ASHA worker if clarification needed"
    )
    pregnancy_status: Optional[str] = Field(
        default=None, description="Maternal/neonatal status: Pregnant, Postpartum, Infant, Non-pregnant, Unknown"
    )
    gestational_age: Optional[str] = Field(
        default=None, description="Gestational age or newborn day/week"
    )
    symptoms: List[str] = Field(
        default_factory=list, description="Reported clinical symptoms"
    )
    symptom_duration: Optional[str] = Field(
        default=None, description="Duration of symptoms e.g. 2 days"
    )
    measurements: Dict[str, Any] = Field(
        default_factory=dict, description="Structured clinical measurements (weight_kg, bp, etc.)"
    )
    medications: List[str] = Field(
        default_factory=list, description="Prescribed or distributed medications (IFA, Calcium, Albendazole)"
    )
    observations: Optional[str] = Field(
        default=None, description="Objective health worker observations"
    )
    confidence_score: float = Field(
        default=0.95, ge=0.0, le=1.0, description="Confidence score of clinical extraction"
    )

    @field_validator("next_visit_date")
    @classmethod
    def validate_iso_date(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        try:
            # Check if format is YYYY-MM-DD
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            return None


class VisitCreate(BaseModel):
    beneficiary_id: Optional[str] = None
    beneficiary_name: Optional[str] = None
    visit_type: str
    visit_date: str = Field(default_factory=lambda: date.today().isoformat())
    weight: Optional[float] = None
    vaccinations_due: List[str] = Field(default_factory=list)
    vaccinations_completed: List[str] = Field(default_factory=list)
    next_visit_date: Optional[str] = None
    additional_notes: Optional[str] = None
    transcript_raw: Optional[str] = None
    is_confirmed: bool = False
    danger_flag: bool = False
    referral_status: str = "NONE"


class VisitCorrectRequest(BaseModel):
    visit_id: Optional[str] = None
    field_name: str
    new_value: str | float | list
    reason: Optional[str] = None


class VisitConfirmRequest(BaseModel):
    visit_id: Optional[str] = None
    record: StructuredVisitExtraction
    transcript_raw: Optional[str] = None
    danger_flag: bool = False
    referral_status: str = "NONE"


class VisitResponse(BaseModel):
    id: str
    beneficiary_id: Optional[str]
    beneficiary_name: Optional[str]
    visit_type: str
    visit_date: str
    weight: Optional[float]
    vaccinations_due: List[str]
    vaccinations_completed: List[str]
    next_visit_date: Optional[str]
    additional_notes: Optional[str]
    transcript_raw: Optional[str]
    is_confirmed: bool
    danger_flag: bool
    referral_status: str
    created_at: str
