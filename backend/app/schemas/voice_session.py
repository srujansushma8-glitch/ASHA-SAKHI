"""
WebSocket message models and schemas for voice session protocol.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any, List
from app.schemas.visit import StructuredVisitExtraction


class WSIncomingMessage(BaseModel):
    """Event sent by frontend to backend over /ws/voice."""

    event: str  # start_session, audio_chunk, stop_recording, confirm_record, correct_field, interrupt_audio
    session_id: Optional[str] = None
    data: Optional[Dict[str, Any]] = Field(default_factory=dict)


class WSOutgoingMessage(BaseModel):
    """Event emitted by backend to frontend over /ws/voice."""

    event: str  # session_started, transcript_final, record_extracted, record_updated, confirmation_audio, danger_alert, visit_saved, error
    session_id: str
    data: Dict[str, Any] = Field(default_factory=dict)
    timestamp: Optional[str] = None


class VoiceSessionState(BaseModel):
    """In-memory state maintained during a live voice interaction."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    session_id: str
    beneficiary_id: Optional[str] = None
    status: str = "IDLE"  # IDLE, RECORDING, PROCESSING, AWAITING_CONFIRMATION, COMPLETED, INTERRUPTED_EMERGENCY
    accumulated_audio: bytearray = Field(default_factory=bytearray, exclude=True)
    transcript_full: str = ""
    extracted_record: Optional[StructuredVisitExtraction] = None
    pending_corrections: List[Dict[str, Any]] = Field(default_factory=list)
    danger_detected: bool = False
    danger_details: Optional[Dict[str, Any]] = None
    confirmation_spoken: bool = False
    is_confirmed: bool = False
