"""
Live Voice Session Manager for ASHA Worker Interaction.
Maintains stateful visit record and conversational context throughout the audio lifecycle across all 22 scheduled Indian languages:
1. Multilingual Structured Extraction & Intent Resolution
2. Spoken Record Readback in active Indic language
3. Multi-turn Voice Correction & Follow-up Handling
4. Explicit Confirmation & SQLite Database Commitment
5. High-Priority Emergency Interruption & Simulated 108 Ambulance Dispatch.
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
from app.services.indic_languages import INDIC_LANGUAGES, get_language_info
from app.models.visit import VisitRepository
from app.models.followup import FollowupRepository
from app.models.danger_alert import DangerAlertRepository
from app.models.beneficiary import BeneficiaryRepository

logger = logging.getLogger(__name__)


class VoiceSession:
    """Represents a single active voice session with an ASHA worker."""

    def __init__(self, session_id: str, language: str = "kn"):
        self.session_id = session_id
        self.language = language
        self.status = "IDLE"  # IDLE, RECORDING, PROCESSING, AWAITING_CONFIRMATION, COMPLETED, INTERRUPTED_EMERGENCY
        self.audio_buffer = bytearray()
        self.transcript_history = []
        self.context: Dict[str, Any] = {}
        self.current_record: Optional[StructuredVisitExtraction] = None
        self.danger_result: Optional[DangerAlertDetectionResult] = None
        self.is_confirmed = False
        self.saved_visit_id: Optional[str] = None
        self.simulated_ambulance: Optional[Dict[str, Any]] = None

    def build_confirmation_text(self, language: Optional[str] = None) -> str:
        """Constructs a natural spoken readback of the extracted record in the active language."""
        lang = (language or self.language or "kn").lower().split("-")[0].strip()
        if not self.current_record:
            fallbacks = {
                "kn": "ಯಾವುದೇ ವಿವರಗಳು ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಮಾತನಾಡಿ.",
                "hi": "कोई विवरण उपलब्ध नहीं है। कृपया पुनः बोलें।",
                "te": "ఎలాంటి వివరాలు అందుబాటులో లేవు. దయచేసి మళ్లీ మాట్లాడండి.",
                "ta": "எந்த விவரமும் கிடைக்கவில்லை. தயவுசெய்து மீண்டும் பேசவும்.",
                "ur": "کوئی تفصیلات دستیاب نہیں ہیں۔ برائے مہربانی دوبارہ بولیں۔"
            }
            return fallbacks.get(lang, "No details recorded. Please speak again.")

        r = self.current_record
        ben_name = r.beneficiary_name or r.beneficiary_id or "Beneficiary"
        v_type = r.visit_type or "Visit"
        wt = f"{r.weight} kg" if r.weight else "Not weighed"
        vac = ", ".join(r.vaccinations_completed) if r.vaccinations_completed else "None"
        next_d = r.next_visit_date or "Next month"

        templates = {
            "kn": f"ದಾಖಲಿಸಿದ ವಿವರಗಳು: ಫಲಾನುಭವಿ {ben_name}, ಭೇಟಿ {v_type}, ತೂಕ {wt}, ನೀಡಿದ ಲಸಿಕೆ {vac}, ಮುಂದಿನ ದಿನಾಂಕ {next_d}. ಈ ವಿವರಗಳು ಸರಿಯಾಗಿವೆಯೇ?",
            "hi": f"दर्ज विवरण: लाभार्थी {ben_name}, जांच {v_type}, वजन {wt}, टीका {vac}, आगामी तिथि {next_d}। क्या यह विवरण सही है?",
            "te": f"నమోదైన వివరాలు: లబ్ధిదారుడు {ben_name}, తనిఖీ {v_type}, బరువు {wt}, టీకా {vac}, తదుపరి తేదీ {next_d}. ఈ వివరాలు సరిగ్గా ఉన్నాయా?",
            "ta": f"பதிவு செய்யப்பட்ட விவரங்கள்: பயனாளி {ben_name}, பரிசோதனை {v_type}, எடை {wt}, தடுப்பூசி {vac}, அடுத்த தேதி {next_d}. விவரங்கள் சரியா?",
            "ml": f"രേഖപ്പെടുത്തിയ വിവരങ്ങൾ: {ben_name}, സന്ദർശനം {v_type}, ഭാരം {wt}, വാക്സിൻ {vac}, അടുത്ത തീയതി {next_d}. വിവരങ്ങൾ ശരിയാണോ?",
            "bn": f"নথিভুক্ত বিবরণ: সুবিধাভোগী {ben_name}, ভিজিট {v_type}, ওজন {wt}, টিকা {vac}, পরবর্তী তারিখ {next_d}। বিবরণ কি সঠিক?",
            "mr": f"नोंदवलेली माहिती: लाभार्थी {ben_name}, तपासणी {v_type}, वजन {wt}, लस {vac}, पुढील तारीख {next_d}. ही माहिती बरोबर आहे का?",
            "gu": f"નોંધાયેલ વિગતો: લાભાર્થી {ben_name}, મુલાકાત {v_type}, વજન {wt}, રસી {vac}, આગામી તારીખ {next_d}. શું વિગતો બરાબર છે?",
            "ur": f"درج شدہ تفصیلات: مستفید {ben_name}، معائنہ {v_type}، وزن {wt}، ٹیکہ {vac}، اگلی تاریخ {next_d}۔ کیا یہ تفصیلات درست ہیں؟",
            "pa": f"ਦਰਜ ਕੀਤੇ ਵੇਰਵੇ: ਲਾਭਪਾਤਰੀ {ben_name}, ਜਾਂਚ {v_type}, ਭਾਰ {wt}, ਟੀਕਾ {vac}, ਅਗਲੀ ਤਾਰੀਖ {next_d}। ਕੀ ਇਹ ਸਹੀ ਹੈ?",
            "or": f"ଦର୍ଜ ବିବରଣୀ: ହିତାଧିକାରୀ {ben_name}, ଯାଞ୍ଚ {v_type}, ଓଜନ {wt}, ଟିକା {vac}, ପରବର୍ତ୍ତୀ ତାରିଖ {next_d}। ଏହା ଠିକ ଅଛି କି?",
            "as": f"নথিবদ্ধ তথ্য: হিতাধিকাৰী {ben_name}, পৰীক্ষা {v_type}, ওজন {wt}, টিকাকৰণ {vac}, পৰৱৰ্তী তাৰিখ {next_d}। এই তথ্য সঠিক নে?"
        }
        return templates.get(lang, f"Recorded details: {ben_name}, {v_type}, weight {wt}, vaccines {vac}, next due {next_d}. Are these details correct?")

    def build_confirmation_text_kn(self) -> str:
        """Backward-compatible helper for Kannada readback."""
        return self.build_confirmation_text("kn")

    def apply_correction(self, field_name: str, new_value: Any, language: Optional[str] = None) -> Tuple[bool, str]:
        """Applies a field correction and returns voice acknowledgment in the active language."""
        lang = (language or self.language or "kn").lower().split("-")[0].strip()
        if not self.current_record:
            return False, "ಯಾವುದೇ ದಾಖಲೆ ಸಕ್ರಿಯವಾಗಿಲ್ಲ." if lang == "kn" else "No active record found."

        valid_fields = {
            "weight", "beneficiary_name", "beneficiary_id", "visit_type",
            "next_visit_date", "additional_notes", "vaccinations_due", "vaccinations_completed"
        }

        if field_name not in valid_fields:
            return False, f"Cannot modify '{field_name}'"

        if field_name == "weight":
            try:
                new_value = float(new_value)
                if not (0.5 <= new_value <= 200.0):
                    return False, "Weight must be between 0.5 and 200 kg."
            except ValueError:
                return False, "Weight must be a numerical value."

        setattr(self.current_record, field_name, new_value)
        logger.info(f"[Session {self.session_id}] Field '{field_name}' updated to '{new_value}' in '{lang}'")

        acks = {
            "kn": f"{field_name} ಮೌಲ್ಯವನ್ನು {new_value} ಎಂದು ಬದಲಾಯಿಸಲಾಗಿದೆ. ಈಗ ವಿವರಗಳು ಸರಿಯಾಗಿವೆಯೇ?",
            "hi": f"{field_name} को बदलकर {new_value} कर दिया गया है। क्या अब यह सही है?",
            "te": f"{field_name} విలువను {new_value} గా మార్చాము. ఇప్పుడు వివరాలు సరిగ్గా ఉన్నాయా?",
            "ta": f"{field_name} மதிப்பு {new_value} என மாற்றப்பட்டது. இப்போது விவரம் சரியா?",
            "ur": f"{field_name} کو تبدیل کر کے {new_value} کر دیا گیا۔ کیا اب یہ ٹھیک ہے؟"
        }
        return True, acks.get(lang, f"Field '{field_name}' updated to {new_value}. Please confirm.")

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

    def get_or_create_session(self, session_id: Optional[str] = None, language: str = "kn") -> VoiceSession:
        if not session_id:
            session_id = f"SES-{uuid.uuid4().hex[:8].upper()}"
        if session_id not in self._sessions:
            self._sessions[session_id] = VoiceSession(session_id, language=language)
        else:
            if language and self._sessions[session_id].language != language:
                self._sessions[session_id].language = language
        return self._sessions[session_id]

    def remove_session(self, session_id: str) -> None:
        if session_id in self._sessions:
            self._sessions[session_id].audio_buffer.clear()
            del self._sessions[session_id]


session_manager = SessionManager()
