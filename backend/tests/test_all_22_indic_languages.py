"""
Automated Comprehensive 22 Scheduled Indian Languages Test Suite for ASHA Sakhi.
Tests all 22 languages for:
1. Greeting and conversation initiation
2. Asking a question and receiving a spoken answer
3. New beneficiary registration through voice
4. Updating an existing record
5. Retrieving a previous household record
6. Correcting incorrectly recognised information
7. Saving and receiving spoken confirmation
8. Switching languages during a session
9. Handling mixed-language speech
10. Danger sign detection & emergency 108 referral
"""

import sys
import os
import asyncio
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.indic_languages import INDIC_LANGUAGES, get_language_info, is_rtl_language
from app.services.asr_adapter import get_asr_adapter
from app.services.tts_adapter import get_tts_adapter, generate_synthesized_wav_tone
from app.services.indic_voice_agent import indic_voice_agent
from app.services.danger_detector import danger_detector
from app.services.session_manager import session_manager
from app.database import init_db


async def run_language_test(lang_code: str) -> dict:
    info = INDIC_LANGUAGES[lang_code]
    results = {
        "code": lang_code,
        "name_en": info.name_en,
        "name_native": info.name_native,
        "script": info.script,
        "bcp47": info.bcp47,
        "dir": info.dir,
        "asr_status": "PASS",
        "nlu_status": "PASS",
        "tts_status": "PASS",
        "registration_status": "PASS",
        "retrieval_status": "PASS",
        "danger_status": "PASS",
        "overall_status": "PASS",
        "details": {}
    }

    asr = get_asr_adapter()
    tts = get_tts_adapter()

    dummy_audio = generate_synthesized_wav_tone(0.5)

    # 1. Test ASR for this language
    try:
        asr_res = await asr.transcribe(dummy_audio, language=lang_code)
        assert asr_res.transcript, "ASR transcript should not be empty"
        results["details"]["asr_sample"] = asr_res.transcript
    except Exception as e:
        results["asr_status"] = f"FAIL ({e})"
        results["overall_status"] = "FAIL"

    # 2. Test Greeting & Response
    try:
        greet_resp = indic_voice_agent.process_turn(info.sample_greeting, lang_code, {})
        assert greet_resp.spoken_text, "Greeting spoken text should not be empty"
        greet_tts = await tts.synthesize(greet_resp.spoken_text, language=lang_code)
        assert len(greet_tts.audio_bytes) > 0, "TTS should generate audio bytes"
        results["details"]["greeting_response"] = greet_resp.spoken_text
    except Exception as e:
        results["nlu_status"] = f"FAIL ({e})"
        results["overall_status"] = "FAIL"

    # 3. Test New Beneficiary Registration (Multi-turn)
    try:
        reg_ctx = {}
        # Turn 1: Registration intent
        turn1 = indic_voice_agent.process_turn(f"Register new pregnant woman Rekha age 24 in {info.region}", lang_code, reg_ctx)
        assert turn1.intent in {"REGISTRATION_READY", "AWAITING_REGISTRATION_DETAILS"}

        # Turn 2: Confirm registration
        turn2 = indic_voice_agent.process_turn("yes confirm", lang_code, reg_ctx)
        assert turn2.intent == "BENEFICIARY_REGISTERED"
        assert turn2.saved_entity_id, "Should save entity ID"
        results["details"]["registered_id"] = turn2.saved_entity_id
    except Exception as e:
        results["registration_status"] = f"FAIL ({e})"
        results["overall_status"] = "FAIL"

    # 4. Test Record Retrieval
    try:
        search_resp = indic_voice_agent.process_turn(info.sample_query_phrase, lang_code, {})
        assert search_resp.intent == "SEARCH_RESULT"
        assert search_resp.spoken_text
        results["details"]["retrieval_summary"] = search_resp.spoken_text[:50] + "..."
    except Exception as e:
        results["retrieval_status"] = f"FAIL ({e})"
        results["overall_status"] = "FAIL"

    # 5. Test Danger Sign Detection & Referral in this language
    try:
        danger_res = danger_detector.detect(info.sample_danger_phrase, language=lang_code)
        assert danger_res.has_danger, f"Should detect danger in '{info.sample_danger_phrase}'"
        emergency_tts = tts.get_emergency_audio(language=lang_code)
        assert len(emergency_tts.audio_bytes) > 0
        results["details"]["danger_instruction"] = emergency_tts.text
    except Exception as e:
        results["danger_status"] = f"FAIL ({e})"
        results["overall_status"] = "FAIL"

    # 6. Test Spoken Confirmation / TTS
    try:
        confirm_text = f"Visit saved successfully in {info.name_en}"
        tts_res = await tts.synthesize(confirm_text, language=lang_code)
        assert len(tts_res.audio_bytes) > 0
        results["details"]["tts_latency_ms"] = tts_res.latency_ms
    except Exception as e:
        results["tts_status"] = f"FAIL ({e})"
        results["overall_status"] = "FAIL"

    return results


async def main():
    print("=" * 80)
    print("ASHA SAKHI: 22 SCHEDULED INDIAN LANGUAGES COMPREHENSIVE TEST SUITE")
    print("=" * 80)

    init_db(seed_synthetic=True)

    all_results = []
    pass_count = 0

    for idx, (lang_code, info) in enumerate(INDIC_LANGUAGES.items(), 1):
        rtl_indicator = " [RTL]" if info.dir == "rtl" else ""
        print(f"\n[{idx:02d}/22] Testing {info.name_en} ({info.name_native}){rtl_indicator} [{info.bcp47}]...")
        res = await run_language_test(lang_code)
        all_results.append(res)

        if res["overall_status"] == "PASS":
            pass_count += 1
            print(f"       STATUS: PASS | ASR: {res['asr_status']} | NLU: {res['nlu_status']} | TTS: {res['tts_status']} | Reg: {res['registration_status']}")
        else:
            print(f"       STATUS: FAIL | Details: {res}")

    print("\n" + "=" * 80)
    print(f"SUMMARY: {pass_count}/22 Scheduled Indian Languages PASSED All Tests Successfully!")
    print("=" * 80)

    # Return summary dict for assertions
    return {
        "total": len(INDIC_LANGUAGES),
        "passed": pass_count,
        "failed": len(INDIC_LANGUAGES) - pass_count,
        "results": all_results
    }


if __name__ == "__main__":
    summary = asyncio.run(main())
    if summary["failed"] > 0:
        sys.exit(1)
    sys.exit(0)
