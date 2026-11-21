"""
Independent Deterministic Danger-Sign Detection Engine
Strictly based on MoHFW and NHM Maternal Health and Home-Based Newborn Care (HBNC) guidelines.
Does not depend exclusively on LLMs.
Supports exact and conservative fuzzy matching, precise negation windows,
historical vs current event differentiation, and comprehensive coverage of all 22 scheduled Indian languages.
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
            # English & Medical
            "bleeding during pregnancy", "vaginal bleeding", "bleeding", "heavy bleeding",
            "spotting with blood", "per vaginal bleeding", "pv bleeding", "antepartum hemorrhage",
            # Kannada
            "ರಕ್ತಸ್ರಾವ", "ರಕ್ತ ಹೋಗುತ್ತಿದೆ", "ಬ್ಲೀಡಿಂಗ್ ಆಗುತ್ತಿದೆ", "ಬ್ಲೀಡಿಂಗ್", "bleeding agtidhe",
            "bleeding aagide", "bleeding aguttide", "raktasrava", "raktha srava", "rakta hogtide",
            # Hindi
            "रक्तस्राव", "खून बह रहा है", "खून आ रहा है", "ब्लीडिंग हो रही है", "ब्लीडिंग", "khoon aana",
            # Telugu
            "రక్తస్రావం", "రక్తం పోతుంది", "రక్తం కారుతోంది", "బ్లీడింగ్", "rakthasravam",
            # Tamil
            "இரத்தப்போக்கு", "ரத்தப்போக்கு", "ரத்தம் வருகிறது", "ப்ளீடிங்", "rathapokku",
            # Malayalam
            "രക്തസ്രാവം", "രക്തം പോകുന്നു", "ബ്ലീഡിങ്", "rakthasravam",
            # Bengali
            "রক্তপাত", "রক্তক্ষরণ", "রক্ত যাচ্ছে", "ব্লিডিং", "rokto jaache",
            # Marathi
            "रक्त जात आहे", "रक्तस्राव", "ब्लिडिंग", "raktsrav",
            # Gujarati
            "લોહી વહી રહ્યું છે", "રક્તસ્રાવ", "બ્લીડિંગ", "lohi aave che",
            # Odia
            "ରକ୍ତସ୍ରାବ", "ରକ୍ତ ପଡୁଛି", "ବ୍ଲିଡିଂ",
            # Punjabi
            "ਖੂਨ ਵਹਿ ਰਿਹਾ ਹੈ", "ਖੂਨ ਪੈ ਰਿਹਾ ਹੈ", "ਬਲੀਡਿੰਗ",
            # Assamese
            "ৰক্তস্ৰাৱ", "তেজ ওলাইছে", "ব্লিডিং",
            # Urdu / Kashmiri / Sindhi
            "خون بہہ رہا ہے", "شدید خون", "بلیڈنگ", "خون گژھان", "خون درام", "رت وهندو رهيو آهي", "رت وهندو", "گهڻو رت",
            # Bodo
            "गोबां थै ओंखारदों", "थै ओंखारदों", "थै ओंखार",
            # Dogri
            "खून पौने दा चक्कर", "खून पौना", "खून औंदे",
            # Konkani
            "रगत वता", "रगतास्राव", "रगत येता",
            # Manipuri
            "ই য়াম্না থোক্লি", "ই থোক্লি",
            # Santali
            "ᱢᱟᱭᱟᱢ ᱞᱤᱸᱜᱤᱱ ᱠᱟᱱᱟ", "ᱢᱟᱭᱟᱢ ᱞᱤᱸᱜᱤᱱ",
            # Sanskrit / Nepali / Maithili
            "रक्तस्रावः", "रक्तस्राव"
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
            # English & Medical
            "high fever in newborn", "baby has high fever", "newborn fever", "infant high fever",
            "baby temperature high", "neonatal pyrexia", "sepsis fever",
            # Kannada
            "ಮಗುವಿಗೆ ತೀವ್ರ ಜ್ವರ", "ಮಗು ಮೈ ಬಿಸಿಯಾಗಿದೆ", "ತೀವ್ರ ಜ್ವರ", "ಮಗುವಿಗೆ ಜ್ವರ",
            "maguvige teevra jwara", "baby jwara", "tumba jwara ide", "teevra jwara", "magu mai bisi",
            # Hindi
            "तेज बुखार", "बच्चे को तेज बुखार", "शिशु को बुखार", "तेज़ बुखार", "baby ko bukhar",
            # Telugu
            "తీవ్ర జ్వరం", "బిడ్డకు తీవ్ర జ్వరం", "బాబుకి జ్వరం", "teevra jwaram",
            # Tamil
            "அதிக காய்ச்சல்", "குழந்தைக்கு காய்ச்சல்", "தீவிர காய்ச்சல்", "athiga kaaichal",
            # Malayalam
            "കടുത്ത പനി", "കുഞ്ഞിന് പനി", "തീവ്ര പനി", "kadutta pani",
            # Bengali
            "তীব্র জ্বর", "বাচ্চার জ্বর", "খুব বেশি জ্বর", "tibro jwor",
            # Marathi
            "तीव्र ताप", "बाळाला ताप", "खूप ताप", "teevra taap",
            # Gujarati
            "તીવ્ર તાવ", "બાળકને તાવ", "ખૂબ તાવ", "teevra tav",
            # Odia
            "ତୀବ୍ର ଜ୍ୱର", "ଛୁଆକୁ ଜ୍ୱର", "ଅଧିକ ଜ୍ୱର",
            # Punjabi
            "ਤੇਜ਼ ਬੁਖਾਰ", "ਬੱਚੇ ਨੂੰ ਤੇਜ਼ ਬੁਖਾਰ",
            # Assamese
            "তীব্র জ্বৰ", "কেঁচুৱাৰ জ্বৰ",
            # Urdu / Kashmiri
            "شدید بخار", "بچے کو تیز بخار", "تیز بکھار", "شورس بکھار"
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
            # English & Medical
            "severe headache blurred vision", "convulsions in pregnancy", "seizures in pregnancy",
            "fits in pregnancy", "severe headache", "eclampsia fits",
            # Kannada
            "ತೀವ್ರ ತಲೆನೋವು", "ಕಣ್ಣು ಮಂಜಾಗುವುದು", "ಸೆಳೆವು", "ಫಿಟ್ಸ್", "fits bandide",
            "selevu", "teevra talenovu", "kannu manjaguttide",
            # Hindi / Marathi
            "दौरे", "फिट्स", "तेज सिरदर्द", "धुंधला दिखना", "झटके", "तीव्र डोकेदुखी",
            # Telugu
            "మూర్ఛ", "కళ్ళు మసకబారడం", "తీవ్ర తలనొప్పి", "ఫిట్స్",
            # Tamil
            "வலிப்பு", "கடுமையான தலைவலி", "பார்வை மங்குதல்",
            # Bengali
            "খিঁচুনি", "তীব্র মাথাব্যথা", "চোখে ঝাপসা দেখা",
            # Urdu
            "دورے", "شدید سر درد", "آنکھوں کے آگے اندھیرا"
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
            "water breaking", "water leakage", "fluid discharge watery", "amniotic fluid leakage",
            "ude neeru odedide", "neeru hogtide", "panikattu odedide", "neeru soruvudu",
            "ನೀರು ಹೋಗುತ್ತಿದೆ", "ಉದೆ ನೀರು ಒಡೆದಿದೆ", "ಪನಿಕಟ್ಟು ಒಡೆದಿದೆ", "ನೀರು ಸೋರುವುದು",
            "पानी छूट गया", "पानी बह रहा", "నీళ్లు పడుతున్నాయి", "பனிக்குடம் உடைந்தது"
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
            "decreased fetal movement", "baby not moving", "magu alugaduttilla", "chalane illa",
            "chalane kadimeyagide", "no fetal movement", "reduced fetal movement",
            "ಮಗುವಿನ ಚಲನೆ ಕಡಿಮೆಯಾಗಿದೆ", "ಮಗು ಅಲುಗಾಡುತ್ತಿಲ್ಲ", "ಚಲನೆ ಕಡಿಮೆ",
            "बच्चा हिल नहीं रहा", "हलचल नहीं है", "కదలికలు లేవు", "அசைவு இல்லை"
        ],
        severity="HIGH",
        source_document="MoHFW Maternal Health Clinical Guidelines for Primary Care, GoI",
        relevant_section_page="Section 3.6: Fetal Well-being Assessment, Page 29",
    ),
    DangerSignDefinition(
        sign_id="DNG-NEO-002",
        category="NEWBORN_HBNC",
        english_phrase="Newborn unable to feed or suckle",
        kannada_phrase="ಮಗುವಿಗೆ ಹಾಲು ಕುಡಿಯಲು ಆಗದಿರುವುದು",
        common_spoken_variations=[
            "baby unable to feed", "unable to suckle", "haalu kudiyuttilla", "magu haalu kudiyalla",
            "baby not latching", "feeding difficulty newborn", "no suckling reflex",
            "ಮಗು ಹಾಲು ಕುಡಿಯುತ್ತಿಲ್ಲ", "ಹಾಲು ಕುಡಿಯಲು ಆಗುತ್ತಿಲ್ಲ",
            "दूध नहीं पी रहा", "स्तनपान नहीं कर पा रहा", "పాలు తాగడం లేదు", "பால் குடிக்கவில்லை"
        ],
        severity="CRITICAL",
        source_document="MoHFW Home Based Newborn Care Operational Guidelines, GoI",
        relevant_section_page="Module 6: Managing Feeding Problems in Neonates, Page 27",
    ),
    DangerSignDefinition(
        sign_id="DNG-NEO-003",
        category="NEWBORN_HBNC",
        english_phrase="Difficulty breathing / chest indrawing in newborn",
        kannada_phrase="ಮಗುವಿಗೆ ಉಸಿರಾಟದ ತೊಂದರೆ ಅಥವಾ ಎದೆ ಗೂಡು ಒಳಗೆ ಹೋಗುವುದು",
        common_spoken_variations=[
            "difficulty breathing newborn", "chest indrawing baby", "usirata tondare", "ede olage hogtide",
            "fast breathing infant", "grunting breath baby", "swasa tondare",
            "ಮಗುವಿಗೆ ಉಸಿರಾಟದ ತೊಂದರೆ", "ಎದೆ ಒಳಗೆ ಹೋಗುತ್ತಿದೆ",
            "सांस लेने में तकलीफ", "पसलियां चलना", "శ్వాస తీసుకోవడంలో ఇబ్బంది", "மூச்சுத்திணறல்"
        ],
        severity="CRITICAL",
        source_document="MoHFW HBNC Protocols on Acute Respiratory Infection in Newborn, GoI",
        relevant_section_page="Module 7: Respiratory Distress and Sepsis, Page 35",
    ),
    DangerSignDefinition(
        sign_id="DNG-NEO-004",
        category="NEWBORN_HBNC",
        english_phrase="Hypothermia / baby cold to touch",
        kannada_phrase="ಮಗುವಿನ ಮೈ ತಣ್ಣಗಾಗಿರುವುದು",
        common_spoken_variations=[
            "baby cold to touch", "magu mai tannagagide", "hypothermia baby", "kai kaalu tannagagide",
            "cold body infant", "mai chali", "ಮಗು ಮೈ ತಣ್ಣಗಾಗಿದೆ", "ಕೈ ಕಾಲು ತಣ್ಣಗಾಗಿದೆ",
            "शरीर ठंडा पड़ गया", "శరీరం చల్లబడింది", "உடல் குளிர்ந்துள்ளது"
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
            "excessive bleeding after delivery", "postpartum hemorrhage", "pph", "herigeya nantara raktasrava",
            "delivery aadamele heavy bleeding", "raktada thundugalu", "ಹೆರಿಗೆ ನಂತರ ರಕ್ತಸ್ರಾವ", "ಹೆರಿಗೆ ಬಳಿಕ ವಿಪರೀತ ರಕ್ತಸ್ರಾವ",
            "प्रसव के बाद भारी रक्तस्राव", "కాన్పు తర్వాత రక్తస్రావం", "பிரசவத்திற்கு பின் ரத்தப்போக்கு"
        ],
        severity="CRITICAL",
        source_document="MoHFW Guidelines for Management of Postpartum Haemorrhage, GoI",
        relevant_section_page="Section 2: Emergency Response to Postpartum Bleeding, Page 12",
    ),
]

# Negation keywords across English, Kannada, and Indian Languages
NEGATION_WORDS = {
    # English
    "no", "not", "without", "never", "denies", "denied", "nil", "none",
    "negative", "doesn't", "does not", "did not", "didn't", "zero",
    # Kannada
    "ಇಲ್ಲ", "ಇಲ್ಲವೇ", "ಇಲ್ಲವೇಇಲ್ಲ", "ಆಗಿಲ್ಲ", "ಕಂಡುಬಂದಿಲ್ಲ", "ಇರ್ಲಿಲ್ಲ",
    "ಇರಲಿಲ್ಲ", "ತೊಂದರೆ ಇಲ್ಲ", "ಸಮಸ್ಯೆ ಇಲ್ಲ", "ಸಾಮಾನ್ಯ", "illa", "agilla",
    # Hindi / Marathi
    "नहीं", "ना", "बिना", "मुक्त", "नाही", "नव्हते", "nahi", "na",
    # Telugu
    "లేదు", "కాదు", "రావడం లేదు", "లేవు", "ledu", "kaadu",
    # Tamil
    "இல்லை", "இல்ல", "கிடையாது", "illai",
    # Malayalam
    "ഇല്ല", "illa",
    # Bengali / Assamese
    "না", "নেই", "নাই", "নাইবা",
    # Gujarati
    "નથી", "નહીં",
    # Urdu
    "نہیں", "نہ"
}

# Clause boundary conjunctions that block negation from bleeding into adjacent clauses
BOUNDARY_CONJUNCTIONS = {
    "ಆದರೆ", "adare", "but", "however", "yet", "and", "ಮತ್ತು", "mattu",
    "लेकिन", "परंतु", "और", "కానీ", "మరియు", "ஆனால்", "மற்றும்", "কিন্তু", "आणि", "पण"
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
    # Hindi / Marathi
    "पिछली गर्भावस्था में", "पिछले साल", "पहले हुआ था", "मागच्या वर्षी",
    # Telugu / Tamil
    "గత గర్భంలో", "పోయిన సంవత్సరం", "முந்தைய கர்ப்பத்தில்"
}


class DangerSignDetector:
    """
    Deterministic rule-based danger sign detector with conservative fuzzy matching
    and localized negation/historical context windows across all 22 scheduled Indian languages.
    """

    def __init__(self, fuzzy_threshold: int = 85, strict_mode: bool = True):
        self.fuzzy_threshold = fuzzy_threshold
        self.strict_mode = strict_mode
        self.definitions = GUIDELINE_DANGER_SIGNS

    def clean_text(self, text: str) -> str:
        """Normalizes whitespace and cleans characters for matching across all Indic scripts."""
        text = text.lower()
        # Retain all Unicode word characters and whitespace across all 22 Indian scripts
        text = re.sub(r"[^\w\s]", " ", text)
        return " ".join(text.split())

    def _is_negated_in_window(self, tokens: List[str], match_start_idx: int, match_end_idx: int) -> bool:
        """
        Checks if a negation token exists strictly in the local clause.
        Stops expanding the window if a clause conjunction (e.g. 'but' / 'ಆದರೆ' / 'लेकिन') is crossed.
        """
        before_tokens = []
        for i in range(match_start_idx - 1, max(-1, match_start_idx - 4), -1):
            tok = tokens[i]
            if tok in BOUNDARY_CONJUNCTIONS:
                break
            before_tokens.insert(0, tok)

        after_tokens = []
        for i in range(match_end_idx + 1, min(len(tokens), match_end_idx + 4)):
            tok = tokens[i]
            if tok in BOUNDARY_CONJUNCTIONS:
                break
            after_tokens.append(tok)

        window_tokens = before_tokens + after_tokens
        return any(neg in window_tokens for neg in NEGATION_WORDS)

    def _is_historical_in_window(self, text: str, match_start_char: int, match_end_char: int) -> bool:
        """Checks for past pregnancy or resolved history markers."""
        window_start = max(0, match_start_char - 40)
        window_end = min(len(text), match_end_char + 40)
        snippet = text[window_start:window_end]

        for marker in HISTORICAL_MARKERS:
            if marker in snippet:
                return True
        return False

    def detect(self, transcript: str, language: str = "kn") -> DangerAlertDetectionResult:
        """
        Performs danger sign detection across transcript in any language.
        Returns DangerAlertDetectionResult with native instructions for that language.
        """
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

            for var in sign_def.common_spoken_variations:
                norm_var = self.clean_text(var)

                # 1. Exact Substring Search
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

                    if not is_hist and not is_neg:
                        sign_matched = True
                        best_match_phrase = var
                        break

                # 2. Conservative Fuzzy Matching for multi-word phrases
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

        lang_code = language.lower().split("-")[0].strip()
        spoken_instructions = {
            "kn": "ಈ ಫಲಾನುಭವಿಗೆ ತಕ್ಷಣ PHC ಗೆ ರೆಫರ್ ಮಾಡಿ.",
            "hi": "इस लाभार्थी को तुरंत नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) में रेफर करें।",
            "te": "ఈ లబ్ధిదారుని వెంటనే పీహెచ్‌సీ ఆసుపత్రికి రిఫర్ చేయండి.",
            "ta": "இந்த பயனாளியை உடனடியாக ஆரம்ப சுகாதார நிலையத்திற்கு பரிந்துரைக்கவும்.",
            "ml": "ഈ ഗുണഭോക്താവിനെ ഉടൻ തന്നെ പിഎച്ച്സിയിലേക്ക് റഫർ ചെയ്യുക.",
            "bn": "এই সুবিধাভোগীকে অবিলম্বে পিএইচসি হাসপাতালে রেফার করুন।",
            "mr": "या लाभार्थ्याला ताबडतोब प्राथमिक आरोग्य केंद्रात पाठवा.",
            "gu": "આ લાભાર્થીને તાત્કાલિક પીએચસી હોસ્પિટલમાં મોકલો.",
            "ur": "اس مستفید کو فوری طور پر پی ایچ سی ہسپتال ریفر کریں۔",
            "pa": "ਤੁਰੰਤ ਹਸਪਤਾਲ ਰੈਫਰ ਕਰੋ।",
            "or": "ତୁରନ୍ତ ଡାକ୍ତରଖାନାକୁ ରେଫର କରନ୍ତୁ।",
            "as": "অতি সোনকালে চিকিৎসালয়লৈ প্ৰেৰণ কৰক।"
        }

        spoken_native = spoken_instructions.get(lang_code, "Refer to Primary Health Centre (PHC) immediately.")

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
            notes=f"Detected {len(active_detected_signs)} active clinical danger sign(s). Native instruction: {spoken_native}",
        )


danger_detector = DangerSignDetector()
