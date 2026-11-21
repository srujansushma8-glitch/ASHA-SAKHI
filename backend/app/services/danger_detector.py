"""
Independent Deterministic Danger-Sign Detection Engine
Strictly based on MoHFW and NHM Maternal Health and Home-Based Newborn Care (HBNC) guidelines.
Does not depend exclusively on LLMs.
Supports exact and conservative fuzzy matching, precise negation windows,
and historical vs current event differentiation.
"""

import re
import logging
from typing import List, Tuple, Optional, Dict, Any
from rapidfuzz import fuzz
from app.schemas.danger_alert import DangerSignDefinition, DangerAlertDetectionResult

logger = logging.getLogger(__name__)

# Predefined source-verified public health guideline danger sign definitions
GUIDELINE_DANGER_SIGNS: List[DangerSignDefinition] = [
    DangerSignDefinition(
        sign_id="DNG-MAT-001",
        category="MATERNAL_ANC",
        english_phrase="Bleeding during pregnancy",
        kannada_phrase="ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ರಕ್ತಸ್ರಾವ",
        common_spoken_variations=[
            "bleeding during pregnancy",
            "vaginal bleeding",
            "bleeding agtidhe",
            "bleeding aagide",
            "bleeding aguttide",
            "bleeding ittu",
            "bleeding",
            "heavy bleeding",
            "raktasrava",
            "raktha srava",
            "rakta hogtide",
            "raktha hogtidhe",
            "blood hogtide",
            "rakta bandide",
            "spotting with blood",
            "per vaginal bleeding",
            "pv bleeding",
            "ರಕ್ತಸ್ರಾವ",
            "ರಕ್ತ ಹೋಗುತ್ತಿದೆ",
            "ಬ್ಲೀಡಿಂಗ್ ಆಗುತ್ತಿದೆ",
            "ಬ್ಲೀಡಿಂಗ್",
        ],
        severity="CRITICAL",
        source_document="MoHFW Guidelines on Antenatal Care and Skilled Attendance at Birth (GoI)",
        relevant_section_page="Section 3.2: Identification and Management of Danger Signs in Pregnancy, Page 24",
    ),
    DangerSignDefinition(
        sign_id="DNG-NEO-001",
        category="NEWBORN_HBNC",
        english_phrase="High fever in newborn",
        kannada_phrase="ಮಗುವಿಗೆ ತೀವ್ರ ಜ್ವರ",
        common_spoken_variations=[
            "high fever in newborn",
            "maguvige teevra jwara",
            "baby has high fever",
            "newborn fever",
            "magu mai bisiyagide",
            "maguvige jwara",
            "baby jwara",
            "high fever",
            "tumba jwara ide",
            "teevra jwara",
            "magu mai bisi",
            "infant high fever",
            "baby temp high",
            "ಮಗುವಿಗೆ ತೀವ್ರ ಜ್ವರ",
            "ಮಗು ಮೈ ಬಿಸಿಯಾಗಿದೆ",
            "ತೀವ್ರ ಜ್ವರ",
            "ಮಗುವಿಗೆ ಜ್ವರ",
        ],
        severity="CRITICAL",
        source_document="MoHFW Home Based Newborn Care (HBNC) Operational Guidelines (GoI)",
        relevant_section_page="Module 6 & 7: Identification of Serious Neonatal Sepsis & Danger Signs, Page 32",
    ),
    DangerSignDefinition(
        sign_id="DNG-MAT-002",
        category="MATERNAL_ANC",
        english_phrase="Severe headache with blurred vision or convulsions",
        kannada_phrase="ತೀವ್ರ ತಲೆನೋವು, ಕಣ್ಣು ಮಂಜಾಗುವುದು ಅಥವಾ ಸೆಳೆವು",
        common_spoken_variations=[
            "severe headache blurred vision",
            "convulsions in pregnancy",
            "fits bandide",
            "selevu",
            "teevra talenovu",
            "kannu manjaguttide",
            "kannu kanistilla",
            "fits",
            "seizures in pregnancy",
            "talenovu kannu manju",
            "severe headache pregnancy",
            "ತೀವ್ರ ತಲೆನೋವು",
            "ಕಣ್ಣು ಮಂಜಾಗುವುದು",
            "ಸೆಳೆವು",
            "ಫಿಟ್ಸ್",
        ],
        severity="CRITICAL",
        source_document="MoHFW Operational Guidelines for Maternal Health - High Risk Pregnancy, GoI",
        relevant_section_page="Section 4.1: Hypertensive Disorders of Pregnancy & Eclampsia, Page 18",
    ),
    DangerSignDefinition(
        sign_id="DNG-MAT-003",
        category="MATERNAL_ANC",
        english_phrase="Premature water breaking / leaking fluid",
        kannada_phrase="ಹೆರಿಗೆಗೂ ಮುನ್ನ ನೀರು ಸೋರುವುದು",
        common_spoken_variations=[
            "water breaking",
            "water leakage",
            "ude neeru odedide",
            "neeru hogtide",
            "panikattu odedide",
            "fluid discharge watery",
            "amniotic fluid leakage",
            "neeru soruvudu",
            "ನೀರು ಹೋಗುತ್ತಿದೆ",
            "ಉದೆ ನೀರು ಒಡೆದಿದೆ",
            "ಪನಿಕಟ್ಟು ಒಡೆದಿದೆ",
            "ನೀರು ಸೋರುವುದು",
        ],
        severity="CRITICAL",
        source_document="MoHFW Antenatal Care Training Guidelines for ASHA, GoI",
        relevant_section_page="Section 3.4: Premature Rupture of Membranes (PROM), Page 26",
    ),
    DangerSignDefinition(
        sign_id="DNG-MAT-004",
        category="MATERNAL_ANC",
        english_phrase="Decreased or absent fetal movements",
        kannada_phrase="ಮಗುವಿನ ಚಲನೆ ಕಡಿಮೆಯಾಗುವುದು ಅಥವಾ ಇಲ್ಲದಿರುವುದು",
        common_spoken_variations=[
            "decreased fetal movement",
            "baby not moving",
            "magu alugaduttilla",
            "chalane illa",
            "chalane kadimeyagide",
            "no fetal movement",
            "hotteyalli magu kadime alugaduthe",
            "reduced fetal movement",
            "ಮಗುವಿನ ಚಲನೆ ಕಡಿಮೆಯಾಗಿದೆ",
            "ಮಗು ಅಲುಗಾಡುತ್ತಿಲ್ಲ",
            "ಚಲನೆ ಕಡಿಮೆ",
        ],
        severity="HIGH",
        source_document="MoHFW Maternal Health Clinical Guidelines for Primary Care, GoI",
        relevant_section_page="Section 3.6: Fetal Well-being Assessment, Page 29",
    ),
    DangerSignDefinition(
        sign_id="DNG-NEO-002",
        category="NEWBORN_HBNC",
        english_phrase="Newborn unable to feed or suckle",
        kannada_phrase="ಮಗು ಮೊಲೆಹಾಲು ಕುಡಿಯದಿರುವುದು",
        common_spoken_variations=[
            "baby not feeding",
            "unable to suck",
            "haalu kudiyuttilla",
            "molehaalu heeruttilla",
            "refusal to feed",
            "haalu beeda antide",
            "cannot suckle",
            "magu haalu kudita illa",
            "not drinking milk",
            "ಹಾಲು ಕುಡಿಯುತ್ತಿಲ್ಲ",
            "ಮೊಲೆಹಾಲು ಹೀರುತ್ತಿಲ್ಲ",
            "ಹಾಲು ಕುಡಿತ ಇಲ್ಲ",
        ],
        severity="CRITICAL",
        source_document="MoHFW Home Based Newborn Care (HBNC) Operational Guidelines, GoI",
        relevant_section_page="Module 6: Sepsis and Inability to Feed in Young Infants, Page 34",
    ),
    DangerSignDefinition(
        sign_id="DNG-NEO-003",
        category="NEWBORN_HBNC",
        english_phrase="Fast breathing or severe chest indrawing in newborn",
        kannada_phrase="ಮಗುವಿಗೆ ವೇಗದ ಉಸಿರಾಟ ಅಥವಾ ಎದೆ ಕುಸಿಯುವುದು",
        common_spoken_variations=[
            "fast breathing newborn",
            "chest indrawing",
            "ede kusiyuttide",
            "usirata teevra",
            "ede baditidhe",
            "difficulty breathing baby",
            "gurgling sound newborn",
            "veegada usirata",
            "ವೇಗದ ಉಸಿರಾಟ",
            "ಎದೆ ಕುಸಿಯುತ್ತಿದೆ",
            "ಉಸಿರಾಟ ತೊಂದರೆ",
        ],
        severity="CRITICAL",
        source_document="MoHFW HBNC Guidelines for Community Health Workers, GoI",
        relevant_section_page="Module 6: Respiratory Infections and Fast Breathing, Page 36",
    ),
    DangerSignDefinition(
        sign_id="DNG-NEO-004",
        category="NEWBORN_HBNC",
        english_phrase="Newborn hypothermia / cold to touch",
        kannada_phrase="ಮಗುವಿನ ಮೈ ವಿಪರೀತ ತಣ್ಣಗಾಗುವುದು",
        common_spoken_variations=[
            "baby cold to touch",
            "magu mai tannagagide",
            "hypothermia baby",
            "kai kaalu tannagagide",
            "cold body infant",
            "mai chali",
            "ಮಗು ಮೈ ತಣ್ಣಗಾಗಿದೆ",
            "ಕೈ ಕಾಲು ತಣ್ಣಗಾಗಿದೆ",
        ],
        severity="HIGH",
        source_document="MoHFW HBNC Protocols on Thermal Protection, GoI",
        relevant_section_page="Module 5: Keeping Baby Warm and Hypothermia Management, Page 38",
    ),
    DangerSignDefinition(
        sign_id="DNG-MAT-005",
        category="MATERNAL_PNC",
        english_phrase="Severe postpartum haemorrhage / excessive bleeding after birth",
        kannada_phrase="ಹೆರಿಗೆಯ ನಂತರ ವಿಪರೀತ ರಕ್ತಸ್ರಾವ",
        common_spoken_variations=[
            "excessive bleeding after delivery",
            "postpartum hemorrhage",
            "pph",
            "herigeya nantara raktasrava",
            "delivery aadamele heavy bleeding",
            "raktada thundugalu",
            "ಹೆರಿಗೆ ನಂತರ ರಕ್ತಸ್ರಾವ",
            "ಹೆರಿಗೆ ಬಳಿಕ ವಿಪರೀತ ರಕ್ತಸ್ರಾವ",
        ],
        severity="CRITICAL",
        source_document="MoHFW Guidelines for Management of Postpartum Haemorrhage, GoI",
        relevant_section_page="Section 2: Emergency Response to Postpartum Bleeding, Page 12",
    ),
]

# Negation keywords in Kannada, English, and Romanized Kannada
NEGATION_WORDS = {
    # English
    "no", "not", "without", "never", "denies", "denied", "nil", "none",
    "negative", "doesn't", "does not", "did not", "didn't", "zero",
    # Kannada
    "ಇಲ್ಲ", "ಇಲ್ಲವೇ", "ಇಲ್ಲವೇಇಲ್ಲ", "ಆಗಿಲ್ಲ", "ಕಂಡುಬಂದಿಲ್ಲ", "ಇರ್ಲಿಲ್ಲ",
    "ಇರಲಿಲ್ಲ", "ತೊಂದರೆ ಇಲ್ಲ", "ಸಮಸ್ಯೆ ಇಲ್ಲ", "ಸಾಮಾನ್ಯ",
    # Romanized Kannada
    "illa", "illave", "aagilla", "agilla", "kandubandilla", "irlilla",
    "iralilla", "tondare illa", "samasye illa", "saamanya"
}

# Clause boundary conjunctions that block negation from bleeding into adjacent clauses
BOUNDARY_CONJUNCTIONS = {
    "ಆದರೆ", "adare", "but", "however", "yet", "and", "ಮತ್ತು", "mattu"
}

# Historical markers indicating past occurrences rather than active emergency
HISTORICAL_MARKERS = {
    # English
    "last year", "two years ago", "previous pregnancy", "last pregnancy",
    "past history", "history of", "in 2023", "in 2024", "in 2025",
    "earlier had", "resolved", "had in first pregnancy", "months back",
    # Kannada
    "ಹಿಂದಿನ ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ", "ಹಿಂದಿನ ಸಲ", "ಹಿಂದೆ ಇತ್ತು", "ಹೋದ ವರ್ಷ",
    "ಮೊದಲ ಹೆರಿಗೆಯಲ್ಲಿ", "ಹಿಂದಿನ ಡೆಲಿವರಿಯಲ್ಲಿ", "ಮುಂಚೆ ಇತ್ತು",
    # Romanized Kannada
    "hindina garbhavastheyalli", "hindina sala", "hinde ittu", "hoda varsha",
    "modala herigeyalli", "hindina delivery"
}


class DangerSignDetector:
    """
    Deterministic rule-based danger sign detector with conservative fuzzy matching
    and localized negation/historical context windows.
    """

    def __init__(self, fuzzy_threshold: int = 85, strict_mode: bool = True):
        self.fuzzy_threshold = fuzzy_threshold
        self.strict_mode = strict_mode
        self.definitions = GUIDELINE_DANGER_SIGNS

    def clean_text(self, text: str) -> str:
        """Normalizes whitespace and cleans characters for matching."""
        text = text.lower()
        # Retain Kannada unicode along with alphanumerics
        text = re.sub(r"[^\w\s\u0C80-\u0CFF]", " ", text)
        return " ".join(text.split())

    def _is_negated_in_window(self, tokens: List[str], match_start_idx: int, match_end_idx: int) -> bool:
        """
        Checks if a negation token exists strictly in the local clause.
        Stops expanding the window if a clause conjunction (e.g. 'but' / 'ಆದರೆ') is crossed.
        """
        # Backward window (up to 3 tokens before, stopped by boundary conjunction)
        before_tokens = []
        for i in range(match_start_idx - 1, max(-1, match_start_idx - 4), -1):
            tok = tokens[i]
            if tok in BOUNDARY_CONJUNCTIONS:
                break
            before_tokens.insert(0, tok)

        # Forward window (up to 3 tokens after, stopped by boundary conjunction)
        after_tokens = []
        for i in range(match_end_idx + 1, min(len(tokens), match_end_idx + 4)):
            tok = tokens[i]
            if tok in BOUNDARY_CONJUNCTIONS:
                break
            after_tokens.append(tok)

        window_tokens = before_tokens + after_tokens
        window_text = " ".join(window_tokens)

        for neg in NEGATION_WORDS:
            if " " in neg:
                if neg in window_text:
                    return True
            else:
                if neg in window_tokens:
                    return True
        return False

    def _is_historical_in_window(self, text: str, phrase_match_start: int, phrase_match_end: int) -> bool:
        """Checks if historical markers appear within 60 characters around the phrase."""
        window_start = max(0, phrase_match_start - 60)
        window_end = min(len(text), phrase_match_end + 60)
        window_snippet = text[window_start:window_end].lower()

        for marker in HISTORICAL_MARKERS:
            if marker in window_snippet:
                return True
        return False

    def detect(self, transcript: str) -> DangerAlertDetectionResult:
        if not transcript or not transcript.strip():
            return DangerAlertDetectionResult(has_danger=False)

        normalized_text = self.clean_text(transcript)
        tokens = normalized_text.split()

        active_detected_signs: List[DangerSignDefinition] = []
        matched_phrases: List[str] = []
        has_negated_sign = False
        has_historical_sign = False

        for sign_def in self.definitions:
            sign_matched = False
            best_match_phrase = ""
            matched_negated = False
            matched_historical = False

            # Sort variations by length descending to match longest, most specific phrase first
            sorted_vars = sorted(sign_def.common_spoken_variations, key=lambda v: len(v), reverse=True)

            for var in sorted_vars:
                norm_var = self.clean_text(var)
                if not norm_var:
                    continue

                # 1. Exact substring match
                if norm_var in normalized_text:
                    match_pos = normalized_text.find(norm_var)
                    prefix_tokens = normalized_text[:match_pos].split()
                    var_tokens = norm_var.split()
                    t_start = len(prefix_tokens)
                    t_end = t_start + len(var_tokens) - 1

                    is_hist = self._is_historical_in_window(normalized_text, match_pos, match_pos + len(norm_var))
                    is_neg = self._is_negated_in_window(tokens, t_start, t_end)

                    if is_hist:
                        matched_historical = True
                    if is_neg:
                        matched_negated = True

                    if is_hist or is_neg:
                        continue

                    sign_matched = True
                    best_match_phrase = var
                    break

                # 2. Conservative fuzzy match for multi-word phrases (len >= 8)
                if len(norm_var) >= 8 and " " in norm_var:
                    ratio = fuzz.partial_ratio(norm_var, normalized_text)
                    if ratio >= self.fuzzy_threshold:
                        match_pos = normalized_text.find(norm_var[:6])
                        if match_pos == -1:
                            match_pos = 0
                        prefix_tokens = normalized_text[:match_pos].split()
                        var_tokens = norm_var.split()
                        t_start = len(prefix_tokens)
                        t_end = t_start + len(var_tokens) - 1

                        is_hist = self._is_historical_in_window(normalized_text, match_pos, match_pos + len(norm_var))
                        is_neg = self._is_negated_in_window(tokens, t_start, t_end)

                        if is_hist:
                            matched_historical = True
                        if is_neg:
                            matched_negated = True

                        if is_hist or is_neg:
                            continue

                        sign_matched = True
                        best_match_phrase = f"{var} (fuzzy {ratio}%)"
                        break

            if sign_matched:
                active_detected_signs.append(sign_def)
                matched_phrases.append(best_match_phrase)
            if matched_negated:
                has_negated_sign = True
            if matched_historical:
                has_historical_sign = True

        if not active_detected_signs:
            return DangerAlertDetectionResult(
                has_danger=False,
                is_negated=has_negated_sign,
                is_historical=has_historical_sign,
                referral_action="NONE",
            )

        severities = [s.severity for s in active_detected_signs]
        highest_sev = "CRITICAL" if "CRITICAL" in severities else "HIGH"

        logger.warning(
            f"DANGER SIGN DETECTED: {[s.sign_id for s in active_detected_signs]} in utterance: '{transcript}'"
        )

        return DangerAlertDetectionResult(
            has_danger=True,
            detected_signs=active_detected_signs,
            detected_phrases=matched_phrases,
            highest_severity=highest_sev,
            referral_action="IMMEDIATE_REFERRAL_PHC",
            spoken_instruction_kn="ಈ ಫಲಾನುಭವಿಗೆ ತಕ್ಷಣ PHC ಗೆ ರೆಫರ್ ಮಾಡಿ.",
            spoken_instruction_en="Refer to Primary Health Centre (PHC) immediately.",
            is_negated=has_negated_sign,
            is_historical=has_historical_sign,
            notes=f"Detected {len(active_detected_signs)} active clinical danger sign(s).",
        )


danger_detector = DangerSignDetector()
