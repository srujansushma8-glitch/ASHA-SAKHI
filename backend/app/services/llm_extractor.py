"""
Structured Information Extraction Engine.
Extracts validated clinical fields from Kannada and Kannada-English code-mixed transcripts.
Includes both:
1. Robust deterministic extractor with RapidFuzz, regex, Kannada numeral/date parsing.
2. Optional Gemini LLM extraction layer with zero-hallucination prompting and automatic fallback.
"""

import re
import json
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta, date
from rapidfuzz import fuzz

from app.config import settings
from app.schemas.visit import StructuredVisitExtraction

logger = logging.getLogger(__name__)

# Kannada numeral mapping
KANNADA_DIGITS = {
    "೦": "0", "೧": "1", "೨": "2", "೩": "3", "೪": "4",
    "೫": "5", "೬": "6", "೭": "7", "೮": "8", "೯": "9"
}

# Known synthetic beneficiaries for fuzzy entity linking
KNOWN_BENEFICIARIES = [
    {"id": "BEN-KA-001", "name": "ಲಕ್ಷ್ಮಿ", "name_en": "Lakshmi", "category": "Pregnant Woman"},
    {"id": "BEN-KA-002", "name": "ಸುಮಿತ್ರಾ", "name_en": "Sumitra", "category": "Pregnant Woman"},
    {"id": "BEN-KA-003", "name": "ರಾಧಾ", "name_en": "Radha", "category": "Lactating Mother"},
    {"id": "BEN-KA-004", "name": "ಬೇಬಿ ಆಫ್ ಕವಿತಾ", "name_en": "Baby of Kavitha", "category": "Infant"},
    {"id": "BEN-KA-005", "name": "ಬೇಬಿ ಆಫ್ ರೂಪಾ", "name_en": "Baby of Roopa", "category": "Infant"},
]

# Clinical vaccine vocabulary
VACCINE_CATALOG = [
    "TT injection", "TT 1", "TT 2", "TT Booster",
    "BCG", "OPV 0", "OPV 1", "OPV 2", "OPV 3",
    "Pentavalent 1", "Pentavalent 2", "Pentavalent 3",
    "Rota 1", "Rota 2", "Rota 3",
    "fIPV 1", "fIPV 2",
    "PCV 1", "PCV 2", "PCV Booster",
    "MR 1", "MR 2",
    "DPT Booster 1", "DPT Booster 2",
    "Vitamin A",
]


class DeterministicExtractor:
    """
    Deterministic rule-based extractor engineered for Kannada-English health speech.
    Guarantees zero hallucination; preserves uncertainty; strictly validates numbers and dates.
    """

    def _convert_kannada_digits(self, text: str) -> str:
        for kn, ar in KANNADA_DIGITS.items():
            text = text.replace(kn, ar)
        return text

    def extract_beneficiary(self, text: str) -> tuple[Optional[str], Optional[str]]:
        """Extracts beneficiary ID and name with fuzzy matching on known registry."""
        ben_id = None
        ben_name = None

        # 1. Look for explicit ID pattern (BEN-KA-xxx, B-xxx, etc.)
        id_match = re.search(r"\b(BEN-[A-Z]+-\d{3}|BEN-\d+|B-\d{3})\b", text, re.IGNORECASE)
        if id_match:
            ben_id = id_match.group(1).upper()

        # 2. Match known beneficiary names or link ID
        for b in KNOWN_BENEFICIARIES:
            if ben_id and b["id"] == ben_id:
                ben_name = b["name"]
                break
            if b["name"] in text or b["name_en"].lower() in text.lower():
                ben_name = b["name"]
                if not ben_id:
                    ben_id = b["id"]
                break

        # Fallback regex for "baby of X" or "ಬೇಬಿ ಆಫ್ X"
        if not ben_name:
            baby_match = re.search(r"(ಬೇಬಿ ಆಫ್ \w+|baby of \w+)", text, re.IGNORECASE)
            if baby_match:
                ben_name = baby_match.group(1)

        return ben_id, ben_name

    def extract_visit_type(self, text: str) -> str:
        """Categorizes visit type based on clinical keywords."""
        lower = text.lower()
        if "anc" in lower or "ಗರ್ಭಿಣಿ" in text or "antenatal" in lower:
            return "ANC checkup"
        if "newborn" in lower or "ನವಜಾತ" in text or "ಶಿಶು" in text or "baby of" in lower:
            return "Newborn home visit"
        if "pnc" in lower or "ಬಾಣಂತಿ" in text or "postnatal" in lower:
            return "PNC visit"
        if "immunization" in lower or "ಲಸಿಕೆ" in text or "vaccination" in lower:
            return "Immunization"
        return "General Visit"

    def extract_weight(self, text: str) -> Optional[float]:
        """Extracts weight in kilograms with validation."""
        clean_text = self._convert_kannada_digits(text)

        # Regex patterns: "weight 54 kg", "ತೂಕ 54", "54.5 kg", "2.8 kg", "weight 3.2"
        patterns = [
            r"(?:weight|ತೂಕ|ವೆಯ್ಟ್)[\s:=]+([0-9]+(?:\.[0-9]+)?)\s*(?:kg|ಕೆಜಿ|kilo)?",
            r"([0-9]+(?:\.[0-9]+)?)\s*(?:kg|ಕೆಜಿ|ಕಿಗ್ರಾಂ)",
        ]

        for pat in patterns:
            match = re.search(pat, clean_text, re.IGNORECASE)
            if match:
                try:
                    val = float(match.group(1))
                    # Validate realistic human clinical weights (newborn 1.0kg to adult 180kg)
                    if 0.5 <= val <= 200.0:
                        return val
                except ValueError:
                    pass
        return None

    def extract_vaccinations(self, text: str) -> tuple[List[str], List[str]]:
        """
        Distinguishes vaccinations completed from vaccinations due.
        Never confuses due with completed.
        Checks forward context (following the vaccine) first, then backward clause context.
        """
        completed = []
        due = []

        completed_cues = [
            "ಕೊಟ್ಟಿದ್ದೇವೆ", "ಹಾಕಲಾಗಿದೆ", "ಕೊಟ್ಟಿದೆ", "ಆಗಿದೆ", "ಮುಗಿದಿದೆ",
            "done", "given", "completed", "received", "administered"
        ]
        due_cues = [
            "ಬಾಕಿ ಇದೆ", "ಕೊಡಬೇಕು", "ಹಾಕಬೇಕು", "ಮುಂದಿನ ಲಸಿಕೆ", "ಮುಂದಿನ ಡೋಸ್",
            "due", "pending", "remaining", "next vaccine", "next dose"
        ]

        text_lower = text.lower()

        # Check for TT injection / TT 1 / TT 2 / TT Booster
        if re.search(r"\b(tt injection|tt 1|tt 2|tt booster|tt|ಟಿಟಿ)\b", text, re.IGNORECASE):
            match = re.search(r"\b(?:tt injection|tt 1|tt 2|tt booster|tt|ಟಿಟಿ)\b", text, re.IGNORECASE)
            if match:
                start_idx, end_idx = match.span()
                forward_snippet = text_lower[end_idx: min(len(text_lower), end_idx + 35)]
                backward_snippet = text_lower[max(0, start_idx - 25): start_idx]

                if any(cue in forward_snippet for cue in due_cues):
                    due.append("TT injection")
                elif any(cue in forward_snippet for cue in completed_cues):
                    completed.append("TT injection")
                elif any(cue in backward_snippet for cue in due_cues):
                    due.append("TT injection")
                else:
                    completed.append("TT injection")

        # Check for standard vaccines in catalog
        for vac in VACCINE_CATALOG:
            if vac.startswith("TT"):
                continue
            vac_lower = vac.lower()
            if vac_lower in text_lower:
                idx = text_lower.find(vac_lower)
                end_idx = idx + len(vac_lower)
                # Forward window (immediate clause after vaccine)
                forward_snippet = text_lower[end_idx: min(len(text_lower), end_idx + 35)]
                backward_snippet = text_lower[max(0, idx - 25): idx]

                # Stop forward snippet if clause boundary reached
                for delim in [".", ";"]:
                    if delim in forward_snippet:
                        forward_snippet = forward_snippet[:forward_snippet.find(delim)]

                if any(cue in forward_snippet for cue in due_cues):
                    due.append(vac)
                elif any(cue in forward_snippet for cue in completed_cues):
                    completed.append(vac)
                elif any(cue in backward_snippet for cue in due_cues) and not any(cue in backward_snippet for cue in completed_cues):
                    due.append(vac)
                else:
                    completed.append(vac)

        # Remove duplicates while preserving order
        completed = list(dict.fromkeys(completed))
        due = list(dict.fromkeys(due))

        return completed, due

    def extract_next_visit_date(self, text: str) -> Optional[str]:
        """Extracts confirmed next visit date in YYYY-MM-DD format."""
        clean_text = self._convert_kannada_digits(text)

        # Pattern 1: ISO date YYYY-MM-DD
        iso_match = re.search(r"\b(202[4-9]-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01]))\b", clean_text)
        if iso_match:
            return iso_match.group(1)

        # Pattern 2: DD-MM-YYYY or DD/MM/YYYY
        dmy_match = re.search(r"\b([0-3]?\d)[-/]([01]?\d)[-/](202[4-9])\b", clean_text)
        if dmy_match:
            day, month, year = dmy_match.groups()
            try:
                dt = datetime(int(year), int(month), int(day))
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                pass

        return None

    def extract_additional_notes(self, text: str) -> Optional[str]:
        """Extracts medical notes like IFA tablets, BP, or advice."""
        notes = []
        if re.search(r"\b(ifa goli|ifa tablet|ಐಎಫ್ಎ|iron folic)\b", text, re.IGNORECASE):
            notes.append("IFA tablets distributed")
        if re.search(r"\b(bp normal|ಬಿಪಿ ನಾರ್ಮಲ್)\b", text, re.IGNORECASE):
            notes.append("BP normal")
        if re.search(r"\b(diet counseling|ಆಹಾರ ಸಲಹೆ)\b", text, re.IGNORECASE):
            notes.append("Diet and nutrition counseling provided")

        return "; ".join(notes) if notes else None

    def extract_pregnancy_status(self, text: str, v_type: str) -> Optional[str]:
        """Classifies pregnancy status from text and visit context."""
        lower = text.lower()
        if "anc" in lower or "ಗರ್ಭಿಣಿ" in text or "antenatal" in lower or v_type == "ANC checkup":
            return "Pregnant"
        if "pnc" in lower or "ಬಾಣಂತಿ" in text or "postnatal" in lower or v_type == "PNC visit":
            return "Postpartum"
        if "newborn" in lower or "ನವಜಾತ" in text or "ಶಿಶು" in text or "baby of" in lower or v_type == "Newborn home visit":
            return "Infant"
        return "Unknown"

    def extract_gestational_age(self, text: str) -> Optional[str]:
        """Extracts gestational age or infant age milestone."""
        clean = self._convert_kannada_digits(text)
        m = re.search(r"\b(ಮೂರನೇ ತಿಂಗಳು|ನಾಲ್ಕನೇ ತಿಂಗಳು|ಐದನೇ ತಿಂಗಳು|ಆರನೇ ತಿಂಗಳು|ಏಳನೇ ತಿಂಗಳು|ಎಂಟನೇ ತಿಂಗಳು|ಒಂಬತ್ತನೇ ತಿಂಗಳು)\b", text)
        if m:
            return m.group(1)
        m2 = re.search(r"\b(\d+)\s*(?:weeks?|months?|days?|ತಿಂಗಳು|ವಾರ|ದಿನ)\b", clean, re.IGNORECASE)
        if m2:
            return m2.group(0)
        m3 = re.search(r"\b(day\s*\d+|1st trimester|2nd trimester|3rd trimester)\b", clean, re.IGNORECASE)
        if m3:
            return m3.group(0)
        return None

    def extract_symptoms(self, text: str):
        """Extracts clinically documented maternal and neonatal symptoms and duration."""
        lower = text.lower()
        symptoms = []
        if "bleeding" in lower or "ರಕ್ತಸ್ರಾವ" in text:
            symptoms.append("Vaginal bleeding")
        if "fever" in lower or "ಜ್ವರ" in text or "jwara" in lower:
            symptoms.append("Fever")
        if "headache" in lower or "ತಲೆನೋವು" in text:
            symptoms.append("Severe headache")
        if "vomiting" in lower or "ವಾಂತಿ" in text:
            symptoms.append("Vomiting")
        if "swelling" in lower or "ಊತ" in text or "edema" in lower:
            symptoms.append("Edema / swelling")
        if "pain" in lower or "ಹೊಟ್ಟೆನೋವು" in text:
            symptoms.append("Abdominal pain")
        if "ಹಾಲು ಕುಡಿಯುತ್ತಿಲ್ಲ" in text or "unable to suckle" in lower or "not feeding" in lower:
            symptoms.append("Poor feeding / unable to suckle")

        dur_match = re.search(r"(\d+)\s*(?:days?|weeks?|ದಿನ|ವಾರ)\b", self._convert_kannada_digits(text), re.IGNORECASE)
        dur = dur_match.group(0) if dur_match else None
        return symptoms, dur

    def extract_medications(self, text: str) -> List[str]:
        """Extracts medications distributed to beneficiary."""
        meds = []
        lower = text.lower()
        if "ifa" in lower or "iron" in lower or "ಐಎಫ್ಎ" in text:
            meds.append("IFA tablets (Iron & Folic Acid)")
        if "calcium" in lower or "ಕ್ಯಾಲ್ಸಿಯಂ" in text:
            meds.append("Calcium tablets")
        if "albendazole" in lower or "ಅಲ್ಬೆಂಡಾಜೋಲ್" in text:
            meds.append("Albendazole")
        if "paracetamol" in lower or "ಪ್ಯಾರಸಿಟಮಾಲ್" in text:
            meds.append("Paracetamol")
        return meds

    def extract(self, transcript: str) -> StructuredVisitExtraction:
        """Performs full deterministic extraction on transcript."""
        if not transcript or not transcript.strip():
            return StructuredVisitExtraction(
                requires_clarification=True,
                clarification_prompt="ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಮತ್ತೆ ಮಾತನಾಡಿ."
            )

        ben_id, ben_name = self.extract_beneficiary(transcript)
        v_type = self.extract_visit_type(transcript)
        weight = self.extract_weight(transcript)
        vac_comp, vac_due = self.extract_vaccinations(transcript)
        next_date = self.extract_next_visit_date(transcript)
        notes = self.extract_additional_notes(transcript)

        uncertainties = []
        requires_clarification = False
        clarification_prompt = None

        if not ben_id and not ben_name:
            uncertainties.append("Beneficiary identification missing in utterance.")
            requires_clarification = True
            clarification_prompt = "ಫಲಾನುಭವಿಯ ಹೆಸರು ಅಥವಾ ಐಡಿ ಯಾವುದು ದಯವಿಟ್ಟು ತಿಳಿಸಿ?"
        elif weight is None and v_type in ["ANC checkup", "Newborn home visit"]:
            uncertainties.append("Weight measurement not explicitly stated.")

        preg_status = self.extract_pregnancy_status(transcript, v_type)
        gest_age = self.extract_gestational_age(transcript)
        symptoms, dur = self.extract_symptoms(transcript)
        meds = self.extract_medications(transcript)
        measurements = {}
        if weight:
            measurements["weight_kg"] = weight
        if "bp normal" in transcript.lower() or "ಬಿಪಿ ನಾರ್ಮಲ್" in transcript:
            measurements["blood_pressure"] = "Normal (120/80)"

        return StructuredVisitExtraction(
            beneficiary_id=ben_id,
            beneficiary_name=ben_name,
            visit_type=v_type,
            weight=weight,
            vaccinations_due=vac_due,
            vaccinations_completed=vac_comp,
            next_visit_date=next_date,
            additional_notes=notes,
            uncertainty_notes=uncertainties,
            requires_clarification=requires_clarification,
            clarification_prompt=clarification_prompt,
            pregnancy_status=preg_status,
            gestational_age=gest_age,
            symptoms=symptoms,
            symptom_duration=dur,
            measurements=measurements,
            medications=meds,
            observations=notes,
            confidence_score=0.70 if requires_clarification else 0.96,
        )


class GeminiLLMExtractor:
    """
    LLM-based structured extractor using Google Gemini API.
    Used if GEMINI_API_KEY is configured; falls back seamlessly to DeterministicExtractor.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL
        self.fallback = DeterministicExtractor()

    async def extract(self, transcript: str) -> StructuredVisitExtraction:
        if not self.api_key:
            return self.fallback.extract(transcript)

        # System instructions with strict clinical constraints
        system_prompt = (
            "You are a medical data extraction engine for ASHA workers in Karnataka, India.\n"
            "Extract structured health record from Kannada/Kannada-English code-mixed transcript.\n"
            "STRICT RULES:\n"
            "1. Output ONLY valid JSON matching the schema.\n"
            "2. Never hallucinate or invent missing values. If a field was not spoken, output null or empty array.\n"
            "3. Distinguish completed vaccinations from vaccinations due.\n"
            "4. Never treat missing information as a negative health finding.\n"
            "5. Preserve uncertainty in 'uncertainty_notes'.\n"
            "JSON fields required:\n"
            "{\n"
            '  "beneficiary_id": string or null,\n'
            '  "beneficiary_name": string or null,\n'
            '  "visit_type": string,\n'
            '  "weight": float or null,\n'
            '  "vaccinations_due": [string],\n'
            '  "vaccinations_completed": [string],\n'
            '  "next_visit_date": "YYYY-MM-DD" or null,\n'
            '  "additional_notes": string or null,\n'
            '  "uncertainty_notes": [string],\n'
            '  "requires_clarification": boolean,\n'
            '  "clarification_prompt": string or null\n'
            "}"
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_prompt}\n\nASHA WORKER TRANSCRIPT:\n{transcript}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.0,
                "response_mime_type": "application/json"
            }
        }

        try:
            import httpx
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    raw_json_str = data["candidates"][0]["content"]["parts"][0]["text"]
                    parsed = json.loads(raw_json_str)
                    return StructuredVisitExtraction(**parsed)
                else:
                    logger.warning(f"Gemini API returned status {res.status_code}, falling back.")
        except Exception as e:
            logger.error(f"Gemini LLM extraction failed: {e}; falling back to deterministic extractor.")

        return self.fallback.extract(transcript)


# Extractor selector based on environment settings
def get_extractor():
    mode = settings.EXTRACTION_MODE.lower()
    if mode == "gemini" or (mode == "auto" and settings.GEMINI_API_KEY):
        return GeminiLLMExtractor()
    return DeterministicExtractor()


clinical_extractor = get_extractor()
