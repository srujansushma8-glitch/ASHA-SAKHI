"""
Unit tests for Independent Deterministic Danger-Sign Detection Engine.
Validates exact matching, conservative fuzzy matching, strict localized negation windows,
historical event differentiation, and zero false-suppression of concurrent genuine danger signs.
"""

import pytest
from app.services.danger_detector import DangerSignDetector, GUIDELINE_DANGER_SIGNS


@pytest.fixture
def detector():
    return DangerSignDetector(fuzzy_threshold=85, strict_mode=True)


def test_guideline_metadata_completeness():
    """Verifies that all required metadata fields are stored for every guideline danger sign."""
    for sign in GUIDELINE_DANGER_SIGNS:
        assert sign.sign_id.startswith("DNG-")
        assert sign.category in ["MATERNAL_ANC", "MATERNAL_PNC", "NEWBORN_HBNC", "GENERAL_OBSTETRIC"]
        assert len(sign.english_phrase) > 0
        assert len(sign.kannada_phrase) > 0
        assert len(sign.common_spoken_variations) >= 3
        assert sign.severity in ["CRITICAL", "HIGH"]
        assert "MoHFW" in sign.source_document
        assert len(sign.relevant_section_page) > 0


def test_detect_bleeding_during_pregnancy_english(detector):
    text = "Beneficiary Lakshmi BEN-KA-001 has vaginal bleeding during pregnancy and severe pain."
    res = detector.detect(text)
    assert res.has_danger is True
    assert res.highest_severity == "CRITICAL"
    assert any(s.sign_id == "DNG-MAT-001" for s in res.detected_signs)
    assert res.referral_action == "IMMEDIATE_REFERRAL_PHC"
    assert "PHC" in res.spoken_instruction_kn


def test_detect_bleeding_during_pregnancy_kannada(detector):
    text = "ಫಲಾನುಭವಿ ಲಕ್ಷ್ಮಿ, ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ ರಕ್ತಸ್ರಾವ ಆಗುತ್ತಿದೆ ತಕ್ಷಣ ನೋಡ್ಬೇಕು."
    res = detector.detect(text)
    assert res.has_danger is True
    assert any(s.sign_id == "DNG-MAT-001" for s in res.detected_signs)


def test_detect_high_fever_in_newborn_kannada_english_codemix(detector):
    text = "Baby of Kavitha, newborn visit day 3, ಮಗುವಿಗೆ teevra jwara ಮತ್ತು baby has high fever."
    res = detector.detect(text)
    assert res.has_danger is True
    assert res.highest_severity == "CRITICAL"
    assert any(s.sign_id == "DNG-NEO-001" for s in res.detected_signs)


def test_detect_severe_convulsions_fits(detector):
    text = "Pregnant woman Sumitra BEN-KA-002, fits bandide ಮತ್ತು teevra talenovu ide."
    res = detector.detect(text)
    assert res.has_danger is True
    assert any(s.sign_id == "DNG-MAT-002" for s in res.detected_signs)


def test_detect_premature_water_breaking(detector):
    text = "ANC visit, 8th month, neeru hogtide panikattu odedide."
    res = detector.detect(text)
    assert res.has_danger is True
    assert any(s.sign_id == "DNG-MAT-003" for s in res.detected_signs)


def test_detect_newborn_unable_to_feed(detector):
    text = "ಬೇಬಿ ಆಫ್ ರೂಪಾ, ಮಗು ಮೊಲೆಹಾಲು ಕುಡಿಯುತ್ತಿಲ್ಲ, baby unable to suckle."
    res = detector.detect(text)
    assert res.has_danger is True
    assert any(s.sign_id == "DNG-NEO-002" for s in res.detected_signs)


def test_detect_newborn_chest_indrawing_fast_breathing(detector):
    text = "Newborn baby fast breathing and ede kusiyuttide severe respiratory distress."
    res = detector.detect(text)
    assert res.has_danger is True
    assert any(s.sign_id == "DNG-NEO-003" for s in res.detected_signs)


def test_detect_postpartum_haemorrhage(detector):
    text = "PNC visit Day 2, delivery aadamele heavy bleeding postpartum hemorrhage."
    res = detector.detect(text)
    assert res.has_danger is True
    assert any(s.sign_id == "DNG-MAT-005" for s in res.detected_signs)


def test_negation_handling_kannada(detector):
    """Checks that 'ರಕ್ತಸ್ರಾವ ಇಲ್ಲ' (no bleeding) is correctly negated and not flagged as emergency."""
    text = "ಲಕ್ಷ್ಮಿ ANC checkup, ಯಾವುದೇ ರಕ್ತಸ್ರಾವ ಇಲ್ಲ, ತೂಕ 54 kg, ಬಿಪಿ ನಾರ್ಮಲ್."
    res = detector.detect(text)
    assert res.has_danger is False
    assert res.is_negated is True


def test_negation_handling_code_mix(detector):
    """Checks that 'bleeding illa' is recognized as negated."""
    text = "BEN-KA-001 Lakshmi, bleeding illa, weight 52 kg."
    res = detector.detect(text)
    assert res.has_danger is False
    assert res.is_negated is True


def test_mixed_negation_does_not_suppress_genuine_danger(detector):
    """
    CRITICAL SAFETY REQUIREMENT:
    'bleeding illa, adare baby has high fever'
    Bleeding is negated, BUT high fever must still trigger high-priority emergency!
    """
    text = "ಲಕ್ಷ್ಮಿ ಅವರ ಮಗು, bleeding illa, ಆದರೆ baby has high fever teevra jwara ide."
    res = detector.detect(text)
    assert res.has_danger is True
    # Danger sign for fever must be present
    assert any(s.sign_id == "DNG-NEO-001" for s in res.detected_signs)
    # Danger sign for bleeding must NOT be in active detected signs
    assert not any(s.sign_id == "DNG-MAT-001" for s in res.detected_signs)


def test_historical_event_not_treated_as_acute_emergency(detector):
    """
    Checks that past historical events (e.g. fever or bleeding last year)
    do not trigger an acute active referral interrupt.
    """
    text = "ಹಿಂದಿನ ಗರ್ಭಾವಸ್ಥೆಯಲ್ಲಿ previous pregnancy last year bleeding ittu, ಈಗೇನೂ ತೊಂದರೆ ಇಲ್ಲ."
    res = detector.detect(text)
    assert res.has_danger is False
    assert res.is_historical is True


def test_normal_routine_visit_no_danger(detector):
    """Routine normal visits must not trigger danger alerts (no false positives)."""
    text = "ಫಲಾನುಭವಿ BEN-KA-001 ಲಕ್ಷ್ಮಿ, ANC 3rd visit, weight 54 kg, TT injection done, BP normal, IFA goli given."
    res = detector.detect(text)
    assert res.has_danger is False
