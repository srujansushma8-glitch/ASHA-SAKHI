"""
Live Voice Session Manager for ASHA Worker Interaction.
Maintains stateful visit record throughout the audio conversational lifecycle:
1. Structured Extraction ->
2. Spoken Record Readback ->
3. Voice Correction Handling ->
4. Explicit Confirmation & Database Commitment ->
5. High-Priority Emergency Interruption & Simulated Ambulance Dispatch.
"""

import uuid
import logging
from typing import Dict, Optional, Any, Tuple
from app.schemas.visit import StructuredVisitExtraction, VisitCreate
from app.schemas.danger_alert import DangerAlertDetectionResult
from app.services.danger_detector import danger_detector
from app.services.llm_extractor import clinical_extractor
from app.services.tts_adapter import get_tts_adapter, BaseTTSAdapter, TTSResult
from app.services.followup_engine import followup_engine
from app.services.ambulance_service import ambulance_service
from app.models.visit import VisitRepository
from app.models.followup import FollowupRepository
from app.models.danger_alert import DangerAlertRepository
from app.models.beneficiary import BeneficiaryRepository

logger = logging.getLogger(__name__)


class VoiceSession:
    """Represents a single active voice session with an ASHA worker."""

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.status = "IDLE"  # IDLE, RECORDING, PROCESSING, AWAITING_CONFIRMATION, COMPLETED, INTERRUPTED_EMERGENCY
        self.audio_buffer = bytearray()
        self.transcript_history = []
        self.current_record: Optional[StructuredVisitExtraction] = None
        self.danger_result: Optional[DangerAlertDetectionResult] = None
        self.is_confirmed = False
        self.saved_visit_id: Optional[str] = None
        self.simulated_ambulance: Optional[Dict[str, Any]] = None

    def build_confirmation_text_kn(self) -> str:
        """Constructs a natural Kannada readback of the extracted structured record."""
        if not self.current_record:
            return "ಯಾವುದೇ ವಿವರಗಳು ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಮಾತನಾಡಿ."

        r = self.current_record
        parts = []

        if r.beneficiary_name or r.beneficiary_id:
            name_str = r.beneficiary_name or r.beneficiary_id
            parts.append(f"ಫಲಾನುಭವಿ {name_str}")

        if r.visit_type:
            parts.append(f"ಭೇಟಿ {r.visit_type}")

        if r.weight:
            parts.append(f"ತೂಕ {r.weight} ಕೆಜಿ")

        if r.vaccinations_completed:
            vacs = ", ".join(r.vaccinations_completed)
            parts.append(f"ನೀಡಿದ ಲಸಿಕೆ {vacs}")

        if r.vaccinations_due:
            due_vacs = ", ".join(r.vaccinations_due)
            parts.append(f"ಬಾಕಿ ಇರುವ ಲಸಿಕೆ {due_vacs}")

        if r.next_visit_date:
            parts.append(f"ಮುಂದಿನ ಭೇಟಿ ದಿನಾಂಕ {r.next_visit_date}")

        details_summary = ", ".join(parts)
        return f"ದಾಖಲಿಸಿದ ವಿವರಗಳು: {details_summary}. ನೀವು ದಾಖಲಿಸಿರುವ ವಿವರಗಳು ಸರಿಯಾಗಿವೆಯೇ?"

    def apply_correction(self, field_name: str, new_value: Any) -> Tuple[bool, str]:
        """Applies a field correction and returns natural Kannada voice acknowledgment."""
        if not self.current_record:
            return False, "ಯಾವುದೇ ದಾಖಲೆ ಸಕ್ರಿಯವಾಗಿಲ್ಲ."

        valid_fields = {
            "weight", "beneficiary_name", "beneficiary_id", "visit_type",
            "next_visit_date", "additional_notes", "vaccinations_due", "vaccinations_completed"
        }

        if field_name not in valid_fields:
            return False, f"ಕ್ಷಮಿಸಿ, '{field_name}' ಬದಲಾಯಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ."

        # Type conversion & validation
        if field_name == "weight":
            try:
                new_value = float(new_value)
                if not (0.5 <= new_value <= 200.0):
                    return False, "ತೂಕದ ಮೌಲ್ಯ ಅಮಾನ್ಯವಾಗಿದೆ (0.5 ರಿಂದ 200 ಕೆಜಿ ಒಳಗೆ ಇರಬೇಕು)."
            except ValueError:
                return False, "ತೂಕ ಸಂಖ್ಯೆಯಲ್ಲಿರಬೇಕು."

        setattr(self.current_record, field_name, new_value)
        logger.info(f"[Session {self.session_id}] Field '{field_name}' updated to '{new_value}'")

        field_labels_kn = {
            "weight": "ತೂಕವನ್ನು",
            "beneficiary_name": "ಹೆಸರನ್ನು",
            "beneficiary_id": "ಐಡಿಯನ್ನು",
            "visit_type": "ಭೇಟಿ ಪ್ರಕಾರವನ್ನು",
            "next_visit_date": "ಮುಂದಿನ ದಿನಾಂಕವನ್ನು",
        }
        label = field_labels_kn.get(field_name, field_name)
        ack_text = f"{label} {new_value} ಎಂದು ಬದಲಾಯಿಸಲಾಗಿದೆ. ಈಗ ವಿವರಗಳು ಸರಿಯಾಗಿವೆಯೇ?"
        return True, ack_text

    def commit_visit_to_db(self) -> Dict[str, Any]:
        """
        Saves confirmed visit, schedules follow-ups, logs danger alerts,
        and initiates simulated ambulance dispatch if emergency triggered.
        """
        if not self.current_record:
            raise ValueError("No record to save.")

        has_danger = bool(self.danger_result and self.danger_result.has_danger)
        referral_status = self.danger_result.referral_action if has_danger else "NONE"

        visit_create = VisitCreate(
            beneficiary_id=self.current_record.beneficiary_id,
            beneficiary_name=self.current_record.beneficiary_name,
            visit_type=self.current_record.visit_type or "General Visit",
            weight=self.current_record.weight,
            vaccinations_due=self.current_record.vaccinations_due,
            vaccinations_completed=self.current_record.vaccinations_completed,
            next_visit_date=self.current_record.next_visit_date,
            additional_notes=self.current_record.additional_notes,
            transcript_raw=" | ".join(self.transcript_history),
            is_confirmed=True,
            danger_flag=has_danger,
            referral_status=referral_status,
        )

        saved_visit = VisitRepository.create(visit_create)
        self.saved_visit_id = saved_visit["id"]
        self.is_confirmed = True
        self.status = "COMPLETED"

        # 1. Generate guideline-based follow-ups
        followups = followup_engine.generate_followups(
            visit=visit_create,
            danger_flag=has_danger,
            referral_status=referral_status,
        )
        saved_followups = []
        for fu in followups:
            fu.visit_id = saved_visit["id"]
            saved_fu = FollowupRepository.create(fu)
            saved_followups.append(saved_fu)

        # 2. Record danger alerts if any
        saved_alerts = []
        if has_danger and self.danger_result:
            for sign in self.danger_result.detected_signs:
                from app.schemas.danger_alert import DangerAlertCreate
                alert_create = DangerAlertCreate(
                    visit_id=saved_visit["id"],
                    beneficiary_id=visit_create.beneficiary_id,
                    sign_id=sign.sign_id,
                    category=sign.category,
                    detected_phrase=sign.english_phrase,
                    severity=sign.severity,
                    source_guideline=f"{sign.source_document} - {sign.relevant_section_page}",
                    referral_action=sign.action_instruction_en,
                    audio_alert_spoken=True,
                    resolved=False,
                )
                saved_alert = DangerAlertRepository.create(alert_create)
                saved_alerts.append(saved_alert)

        # 3. Trigger simulated ambulance dispatch if emergency referral triggered
        simulated_amb = None
        if has_danger:
            pickup_loc = "Hoskote Village"
            if visit_create.beneficiary_id:
                ben = BeneficiaryRepository.get_by_id(visit_create.beneficiary_id)
                if ben and ben.get("village"):
                    pickup_loc = ben["village"]

            simulated_amb = ambulance_service.create_request(
                beneficiary_id=visit_create.beneficiary_id,
                emergency_id=saved_alerts[0]["id"] if saved_alerts else None,
                visit_id=saved_visit["id"],
                pickup_location=pickup_loc,
                notes="Automatic simulated 108 triage dispatch for emergency maternal/neonatal referral.",
            )
            self.simulated_ambulance = simulated_amb

        return {
            "visit": saved_visit,
            "followups": saved_followups,
            "danger_alerts": saved_alerts,
            "simulated_ambulance": simulated_amb,
        }


class SessionManager:
    """In-memory manager of active voice sessions."""

    def __init__(self):
        self._sessions: Dict[str, VoiceSession] = {}

    def get_or_create_session(self, session_id: Optional[str] = None) -> VoiceSession:
        if not session_id:
            session_id = f"SES-{uuid.uuid4().hex[:8].upper()}"
        if session_id not in self._sessions:
            self._sessions[session_id] = VoiceSession(session_id)
        return self._sessions[session_id]

    def remove_session(self, session_id: str) -> None:
        if session_id in self._sessions:
            self._sessions[session_id].audio_buffer.clear()
            del self._sessions[session_id]


session_manager = SessionManager()
