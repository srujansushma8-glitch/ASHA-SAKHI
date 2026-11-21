"""
Unit tests for Structured Information Extraction Engine.
Includes 20+ comprehensive synthetic transcript test cases covering:
- Pure Kannada speech transcripts
- Kannada-English code-mixed transcripts
- Beneficiary ID parsing
- Weight extraction (decimals, integers, Kannada numerals, newborn vs adult)
- Date parsing (ISO YYYY-MM-DD, standard DD-MM-YYYY)
- Completed vs due vaccination discrimination
- Missing fields and uncertainty preservation
- Clinical clarification prompts
- Additional clinical notes (IFA goli, BP, nutrition)
"""

import pytest
from app.services.llm_extractor import DeterministicExtractor


@pytest.fixture
def extractor():
    return DeterministicExtractor()


# TEST CASE 1: Standard ANC visit with ID, weight, vaccine, date
def test_case_01_standard_anc_codemix(extractor):
    text = "ಫಲಾನುಭವಿ ಲಕ್ಷ್ಮಿ BEN-KA-001, ANC checkup, weight 54 kg, TT injection ಕೊಟ್ಟಿದ್ದೇವೆ, next visit date 2026-12-15."
    rec = extractor.extract(text)
    assert rec.beneficiary_id == "BEN-KA-001"
    assert rec.beneficiary_name == "ಲಕ್ಷ್ಮಿ"
    assert rec.visit_type == "ANC checkup"
    assert rec.weight == 54.0
    assert "TT injection" in rec.vaccinations_completed
    assert rec.vaccinations_due == []
    assert rec.next_visit_date == "2026-12-15"
    assert rec.requires_clarification is False


# TEST CASE 2: Newborn home visit with infant weight (decimal) and HBNC type
def test_case_02_newborn_visit_decimal_weight(extractor):
    text = "Baby of Kavitha BEN-KA-004, newborn home visit day 3, weight 2.8 kg, BCG ಕೊಟ್ಟಿದೆ."
    rec = extractor.extract(text)
    assert rec.beneficiary_id == "BEN-KA-004"
    assert "ಕವಿತಾ" in (rec.beneficiary_name or "")
    assert rec.visit_type == "Newborn home visit"
    assert rec.weight == 2.8
    assert "BCG" in rec.vaccinations_completed


# TEST CASE 3: Kannada numerals conversion (ತೂಕ ೫೨ ಕೆಜಿ)
def test_case_03_kannada_numerals_weight(extractor):
    text = "ಸುಮಿತ್ರಾ BEN-KA-002, ಗರ್ಭಿಣಿ ತಪಾಸಣೆ, ತೂಕ ೫೨ ಕೆಜಿ, ಮುಂದಿನ ಭೇಟಿ 2026-12-20."
    rec = extractor.extract(text)
    assert rec.beneficiary_id == "BEN-KA-002"
    assert rec.weight == 52.0
    assert rec.next_visit_date == "2026-12-20"


# TEST CASE 4: Discrimination of vaccinations DUE vs vaccinations COMPLETED
def test_case_04_vaccinations_due_vs_completed(extractor):
    text = "ರಾಧಾ BEN-KA-003, PNC visit, BCG ಮತ್ತು OPV 0 ಕೊಟ್ಟಿದ್ದೇವೆ, ಆದರೆ Pentavalent 1 ಬಾಕಿ ಇದೆ, next vaccine Pentavalent 1 ಕೊಡಬೇಕು."
    rec = extractor.extract(text)
    assert rec.beneficiary_id == "BEN-KA-003"
    assert "BCG" in rec.vaccinations_completed
    assert "OPV 0" in rec.vaccinations_completed
    assert "Pentavalent 1" in rec.vaccinations_due
    assert "Pentavalent 1" not in rec.vaccinations_completed


# TEST CASE 5: Missing beneficiary ID triggers uncertainty and clarification prompt
def test_case_05_missing_beneficiary_id(extractor):
    text = "ANC checkup, weight 56 kg, TT 1 done, IFA goli ಕೊಟ್ಟಿದೆ."
    rec = extractor.extract(text)
    assert rec.beneficiary_id is None
    assert rec.requires_clarification is True
    assert rec.clarification_prompt is not None
    assert "ಫಲಾನುಭವಿ" in rec.clarification_prompt


# TEST CASE 6: Missing weight preserves None without inventing values
def test_case_06_missing_weight_never_invented(extractor):
    text = "BEN-KA-001 ಲಕ್ಷ್ಮಿ, ANC checkup, TT injection done."
    rec = extractor.extract(text)
    assert rec.beneficiary_id == "BEN-KA-001"
    assert rec.weight is None
    assert any("Weight" in note for note in rec.uncertainty_notes)


# TEST CASE 7: Preserving medical notes (IFA goli, BP normal)
def test_case_07_medical_notes_preservation(extractor):
    text = "BEN-KA-002 ಸುಮಿತ್ರಾ, ANC checkup, weight 49 kg, IFA goli ಕೊಟ್ಟಿದೆ, BP normal, diet counseling done."
    rec = extractor.extract(text)
    assert rec.additional_notes is not None
    assert "IFA tablets" in rec.additional_notes
    assert "BP normal" in rec.additional_notes
    assert "Diet" in rec.additional_notes


# TEST CASE 8: Date format DD-MM-YYYY normalized to ISO YYYY-MM-DD
def test_case_08_date_format_normalization(extractor):
    text = "BEN-KA-001, ANC visit, weight 55 kg, next visit 18-12-2026."
    rec = extractor.extract(text)
    assert rec.next_visit_date == "2026-12-18"


# TEST CASE 9: Multiple pending vaccinations due
def test_case_09_multiple_vaccines_due(extractor):
    text = "BEN-KA-004 ಬೇಬಿ ಆಫ್ ಕವಿತಾ, newborn visit, Pentavalent 1 ಬಾಕಿ ಇದೆ, Rota 1 ಬಾಕಿ ಇದೆ, fIPV 1 ಕೊಡಬೇಕು."
    rec = extractor.extract(text)
    assert "Pentavalent 1" in rec.vaccinations_due
    assert "Rota 1" in rec.vaccinations_due
    assert "fIPV 1" in rec.vaccinations_due


# TEST CASE 10: Out of bounds weight rejected (e.g. 500 kg typo)
def test_case_10_out_of_bounds_weight_rejected(extractor):
    text = "BEN-KA-001 ಲಕ್ಷ್ಮಿ, ANC checkup, weight 500 kg."
    rec = extractor.extract(text)
    assert rec.weight is None  # Out-of-bounds weight must not be recorded


# TEST CASE 11: Pure Kannada transcript for PNC visit
def test_case_11_pure_kannada_pnc(extractor):
    text = "ಫಲಾನುಭವಿ ರಾಧಾ BEN-KA-003, ಬಾಣಂತಿ ಭೇಟಿ, ತೂಕ ೫೫ ಕೆಜಿ, ಬಿಪಿ ನಾರ್ಮಲ್ ಆಗಿದೆ."
    rec = extractor.extract(text)
    assert rec.beneficiary_id == "BEN-KA-003"
    assert rec.visit_type == "PNC visit"
    assert rec.weight == 55.0


# TEST CASE 12: Newborn weight with grams notation (3.1 kg)
def test_case_12_newborn_grams_decimal(extractor):
    text = "BEN-KA-005 ಬೇಬಿ ಆಫ್ ರೂಪಾ, ನವಜಾತ ಶಿಶು ತಪಾಸಣೆ, ತೂಕ 3.1 kg, ಹಾಲು ಚೆನ್ನಾಗಿ ಕುಡಿಯುತ್ತಿದೆ."
    rec = extractor.extract(text)
    assert rec.beneficiary_id == "BEN-KA-005"
    assert rec.weight == 3.1
    assert rec.visit_type == "Newborn home visit"


# TEST CASE 13: Fuzzy linking by beneficiary name when ID is absent
def test_case_13_fuzzy_name_linking(extractor):
    text = "ಲಕ್ಷ್ಮಿ ಅವರಿಗೆ ANC checkup ಮಾಡಿದ್ದೇವೆ, weight 53.5 kg."
    rec = extractor.extract(text)
    assert rec.beneficiary_name == "ಲಕ್ಷ್ಮಿ"
    assert rec.beneficiary_id == "BEN-KA-001"  # Linked to known synthetic ID
    assert rec.weight == 53.5


# TEST CASE 14: Immunization visit type detection
def test_case_14_immunization_visit_type(extractor):
    text = "BEN-KA-004, immunization camp visit, OPV 1 ಕೊಟ್ಟಿದ್ದೇವೆ, Pentavalent 1 ಕೊಟ್ಟಿದ್ದೇವೆ."
    rec = extractor.extract(text)
    assert rec.visit_type == "Immunization"
    assert "OPV 1" in rec.vaccinations_completed
    assert "Pentavalent 1" in rec.vaccinations_completed


# TEST CASE 15: Empty or whitespace-only transcript handles gracefully
def test_case_15_empty_transcript_handling(extractor):
    text = "   "
    rec = extractor.extract(text)
    assert rec.requires_clarification is True
    assert rec.beneficiary_id is None


# TEST CASE 16: English-only spoken input in Kannada field setup
def test_case_16_english_only_speech(extractor):
    text = "Beneficiary Lakshmi BEN-KA-001, ANC visit, weight 54 kg, TT injection completed, next visit 2026-12-10."
    rec = extractor.extract(text)
    assert rec.beneficiary_id == "BEN-KA-001"
    assert rec.weight == 54.0
    assert "TT injection" in rec.vaccinations_completed
    assert rec.next_visit_date == "2026-12-10"


# TEST CASE 17: Date without century or malformed date not hallucinated
def test_case_17_malformed_date_rejected(extractor):
    text = "BEN-KA-001, ANC checkup, next visit date 99-99-9999."
    rec = extractor.extract(text)
    assert rec.next_visit_date is None


# TEST CASE 18: TT 2 and Booster dose handling
def test_case_18_tt_booster_dose(extractor):
    text = "BEN-KA-002 ಸುಮಿತ್ರಾ, ANC checkup, TT 2 ಕೊಟ್ಟಿದ್ದೇವೆ, ಮುಂದಿನ ಭೇಟಿ 2026-12-25."
    rec = extractor.extract(text)
    assert "TT injection" in rec.vaccinations_completed
    assert rec.next_visit_date == "2026-12-25"


# TEST CASE 19: Fractional weight in Kannada text (52.5 kg)
def test_case_19_fractional_weight(extractor):
    text = "ಫಲಾನುಭವಿ BEN-KA-001, ANC checkup, ತೂಕ 52.5 ಕೆಜಿ."
    rec = extractor.extract(text)
    assert rec.weight == 52.5


# TEST CASE 20: Complex multi-sentence code-mixed visit
def test_case_20_complex_code_mix(extractor):
    text = (
        "ಇವತ್ತು BEN-KA-003 ರಾಧಾ ಅವರ ಮನೆಗೆ ಹೋಗಿದ್ದೆ, PNC visit day 14. "
        "Weight 56 kg ide. BCG and OPV 0 completed aagide. "
        "Pentavalent 1 due ide. Next visit date 2026-12-05. "
        "IFA goli ಕೊಟ್ಟಿದ್ದೇವೆ ಮತ್ತು ಆಹಾರ ಸಲಹೆ ನೀಡಿದೆ."
    )
    rec = extractor.extract(text)
    assert rec.beneficiary_id == "BEN-KA-003"
    assert rec.weight == 56.0
    assert "BCG" in rec.vaccinations_completed
    assert "OPV 0" in rec.vaccinations_completed
    assert "Pentavalent 1" in rec.vaccinations_due
    assert rec.next_visit_date == "2026-12-05"
    assert "IFA tablets" in (rec.additional_notes or "")
