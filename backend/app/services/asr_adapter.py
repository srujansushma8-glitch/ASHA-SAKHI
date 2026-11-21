"""
Abstract Speech Recognition (ASR) Adapter Architecture.
Provides unified interface, latency measurement, and mock implementation
for reliable end-to-end testing of all 22 scheduled Indian languages and code-mixed health speech.
"""

import time
import logging
from abc import ABC, abstractmethod
from typing import Optional, List, Dict
from pydantic import BaseModel
from app.config import settings
from app.services.indic_languages import INDIC_LANGUAGES

logger = logging.getLogger(__name__)


class ASRResult(BaseModel):
    """Normalized response from speech recognition."""

    transcript: str
    is_mock: bool = False
    model_name: str
    latency_ms: float
    confidence: float = 1.0
    language: str = "kn"


class BaseASRAdapter(ABC):
    """Abstract base class for all ASR adapters."""

    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, language: str = "kn") -> ASRResult:
        """Transcribes complete utterance audio bytes into text."""
        pass


class MockASRAdapter(BaseASRAdapter):
    """
    High-fidelity Multilingual Mock ASR Adapter supporting all 22 scheduled Indian languages.
    Provides authentic health register utterances preserving critical medical terms.
    """

    def __init__(self):
        self.model_name = "mock-ai4bharat-indic-conformer-asr"
        self._custom_queue: List[str] = []

        # Preset authentic utterances per language covering all 9 required field scenarios
        self._lang_utterances: Dict[str, List[str]] = {}
        for code, info in INDIC_LANGUAGES.items():
            self._lang_utterances[code] = [
                info.sample_anc_phrase,
                info.sample_danger_phrase,
                info.sample_query_phrase,
                f"Register new pregnant woman Sunita age 24 in {info.region}, weight 52 kg, BP 120/80 normal.",
                f"Show today's pending follow-ups and high-risk visits in {info.region}.",
                f"Check immunization status and vaccines due for child in {info.region}.",
                f"Newborn home visit day 3, weight 2.9 kg, breastfeeding normal, mother recovering well.",
                f"Update beneficiary weight to 52 kg.",
                info.sample_greeting
            ]

        # Comprehensive clinical Kannada utterances across all 9 field scenarios
        self._lang_utterances["kn"] = [
            # 1. Routine ANC Visit with clinical vitals & next visit
            "ಫಲಾನುಭವಿ ಲಕ್ಷ್ಮಿ BEN-KA-001, ANC checkup ಮೂರನೇ ತಿಂಗಳು, weight 54 kg, TT injection ಮೊದಲ ಡೋಸ್ ಕೊಟ್ಟಿದ್ದೇವೆ, IFA goli ಕೊಟ್ಟಿದೆ, next visit date 2026-12-15.",
            # 2. Maternal High-Risk Danger Sign (Severe Bleeding -> Triggers Immediate Emergency Protocol)
            "BEN-KA-002 ಸುಮಿತ್ರಾ, ANC checkup ಆಗಿದೆ, weight 52 kg, ಆದರೆ bleeding agtidhe ತಕ್ಷಣ ನೋಡ್ಬೇಕು, ರಕ್ತಸ್ರಾವ ಹೆಚ್ಚಾಗಿದೆ.",
            # 3. Newborn High-Risk Danger Sign (High Fever & Unable to Suckle -> Triggers Immediate Protocol)
            "BEN-KA-004 ಬೇಬಿ ಆಫ್ ಕವಿತಾ, newborn home visit day 3, weight 2.8 kg, ಮಗುವಿಗೆ teevra jwara ಮತ್ತು ಹಾಲು ಕುಡಿಯುತ್ತಿಲ್ಲ, baby unable to suckle.",
            # 4. Beneficiary Registration (New Pregnant Woman)
            "ಹೊಸ ಗರ್ಭಿಣಿ ಮಹಿಳೆ ಕವಿತಾ ವಯಸ್ಸು 24 ಹೊಸಕೋಟೆ ಗ್ರಾಮ ತೂಕ 52 kg ಬಿಪಿ 120/80 ಸಾಮಾನ್ಯ ಎಂದು ನೋಂದಾಯಿಸಿ.",
            # 5. Pending Tasks & Today's Follow-ups Query
            "ಇಂದಿನ ಬಾಕಿ ಇರುವ ಫಾಲೋ-ಅಪ್ ಮತ್ತು ಹೈ-ರಿಸ್ಕ್ ಗರ್ಭಿಣಿಯರ ಪಟ್ಟಿ ತೋರಿಸಿ.",
            # 6. Child Immunization & Vaccination Status Check
            "ರಾಧಾ BEN-KA-003, ಮಗುವಿಗೆ BCG ಮತ್ತು OPV 0 ಆಗಿದೆ, ಮುಂದಿನ ಪೆಂಟಾವಲೆಂಟ್ 1 ಲಸಿಕೆ ಯಾವಾಗ ಕೊಡಬೇಕು ಪರಿಶೀಲಿಸಿ.",
            # 7. Beneficiary History & Previous Visit Search
            "ಫಲಾನುಭವಿ BEN-KA-001 ಲಕ್ಷ್ಮಿ ಅವರ ಹಿಂದಿನ ಭೇಟಿಯ ವಿವರ ಮತ್ತು ತೂಕದ ಮಾಹಿತಿ ತೋರಿಸಿ.",
            # 8. Postnatal Care (PNC / HBNC) Routine Home Visit
            "ರಾಧಾ BEN-KA-003, PNC ಭೇಟಿ, ತೂಕ 56 kg, ತಾಯಿ ಮತ್ತು ಮಗು ಕ್ಷೇಮವಾಗಿದ್ದಾರೆ, ಮುಂದಿನ ಭೇಟಿ 2026-12-01.",
            # 9. Spoken Field Correction
            "ಫಲಾನುಭವಿ BEN-KA-001 ತೂಕ 54 kg ಅಲ್ಲ 52 kg ಎಂದು ಬದಲಾಯಿಸಿ."
        ]
        self._counters: Dict[str, int] = {k: 0 for k in INDIC_LANGUAGES}

    def set_next_transcript(self, transcript: str) -> None:
        """Helper for unit tests to inject exact expected transcript."""
        self._custom_queue.insert(0, transcript)

    async def transcribe(self, audio_bytes: bytes, language: str = "kn") -> ASRResult:
        start_time = time.perf_counter()
        lang = language.lower().split("-")[0].strip()
        if lang not in self._lang_utterances:
            lang = "kn"

        # Simulate network or compute inference latency (~110ms)
        latency_ms = (time.perf_counter() - start_time) * 1000 + 110.0

        if not audio_bytes or len(audio_bytes) < 44:
            # Empty or invalid audio buffer
            return ASRResult(
                transcript="",
                is_mock=True,
                model_name=self.model_name,
                latency_ms=latency_ms,
                confidence=0.0,
                language=lang,
            )

        # Check custom test queue first
        if self._custom_queue:
            text = self._custom_queue.pop(0)
        else:
            utterance_list = self._lang_utterances[lang]
            idx = self._counters.get(lang, 0) % len(utterance_list)
            text = utterance_list[idx]
            self._counters[lang] = idx + 1

        logger.info(f"[Mock ASR] Transcribed {len(audio_bytes)} bytes in '{lang}' -> '{text}' in {latency_ms:.1f}ms")

        return ASRResult(
            transcript=text,
            is_mock=True,
            model_name=f"ai4bharat-indic-transcribe-{lang}",
            latency_ms=round(latency_ms, 2),
            confidence=0.96,
            language=lang,
        )


def get_asr_adapter() -> BaseASRAdapter:
    """Factory function returning configured ASR adapter."""
    mode = settings.ASR_MODE.lower()
    if mode == "ai4bharat_hosted":
        from app.services.ai4bharat_asr import AI4BharatHostedASR
        return AI4BharatHostedASR()
    return MockASRAdapter()
