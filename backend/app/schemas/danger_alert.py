"""
Pydantic schemas for Danger Signs and Emergency Alerts.
Conforms to MoHFW/NHM maternal and child health guidelines.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class DangerSignDefinition(BaseModel):
    """Predefined, source-verified public-health danger sign metadata."""

    sign_id: str
    category: str  # MATERNAL_ANC, MATERNAL_PNC, NEWBORN_HBNC, GENERAL_OBSTETRIC
    english_phrase: str
    kannada_phrase: str
    common_spoken_variations: List[str]
    severity: str = "CRITICAL"  # CRITICAL, HIGH
    source_document: str
    relevant_section_page: str
    action_instruction_en: str = "Immediate referral to Primary Health Centre (PHC) required."
    action_instruction_kn: str = "ಈ ಫಲಾನುಭವಿಗೆ ತಕ್ಷಣ PHC ಗೆ ರೆಫರ್ ಮಾಡಿ."


class DangerAlertDetectionResult(BaseModel):
    """Result of danger sign detection across an utterance."""

    has_danger: bool
    detected_signs: List[DangerSignDefinition] = Field(default_factory=list)
    detected_phrases: List[str] = Field(default_factory=list)
    highest_severity: Optional[str] = None
    referral_action: str = "NONE"
    spoken_instruction_kn: str = "ಈ ಫಲಾನುಭವಿಗೆ ತಕ್ಷಣ PHC ಗೆ ರೆಫರ್ ಮಾಡಿ."
    spoken_instruction_en: str = "Refer to PHC immediately."
    is_negated: bool = False
    is_historical: bool = False
    notes: Optional[str] = None


class DangerAlertCreate(BaseModel):
    visit_id: Optional[str] = None
    beneficiary_id: Optional[str] = None
    sign_id: str
    category: str
    detected_phrase: str
    severity: str
    source_guideline: str
    referral_action: str
    audio_alert_spoken: bool = True
    resolved: bool = False


class DangerAlertResponse(DangerAlertCreate):
    id: str
    created_at: str
