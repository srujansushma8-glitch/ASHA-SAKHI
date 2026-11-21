"""
Integration tests for WebSocket Voice Interface (/ws/voice).
Validates duplex protocol, danger sign interruption, field correction, and persistence.
"""

import json
import base64
import pytest
from starlette.testclient import TestClient
from app.main import app
from app.services.tts_adapter import generate_synthesized_wav_tone
from app.services.ai4bharat_asr import get_asr_adapter
from app.services.asr_adapter import MockASRAdapter


def test_websocket_full_session_lifecycle():
    client = TestClient(app)
    # Generate 1 sec sample wav bytes
    sample_wav = generate_synthesized_wav_tone(1.0, 440.0)
    sample_b64 = base64.b64encode(sample_wav).decode("utf-8")

    with client.websocket_connect("/ws/voice") as websocket:
        # 1. start_session
        websocket.send_json({
            "event": "start_session",
            "session_id": "TEST-SES-001",
            "data": {"beneficiary_id": "BEN-KA-001"}
        })
        resp = websocket.receive_json()
        assert resp["event"] == "session_started"
        assert resp["data"]["status"] == "ready"

        # 2. send audio_chunk
        websocket.send_json({
            "event": "audio_chunk",
            "session_id": "TEST-SES-001",
            "data": {"audio_base64": sample_b64}
        })

        # 3. stop_recording
        websocket.send_json({
            "event": "stop_recording",
            "session_id": "TEST-SES-001"
        })

        # Expect transcript_final
        resp_transcript = websocket.receive_json()
        assert resp_transcript["event"] == "transcript_final"
        assert len(resp_transcript["data"]["transcript"]) > 0

        # Expect record_extracted
        resp_extracted = websocket.receive_json()
        assert resp_extracted["event"] == "record_extracted"
        assert "record" in resp_extracted["data"]

        # If no danger, expect confirmation_audio
        resp_audio = websocket.receive_json()
        if resp_extracted["data"]["danger_flag"]:
            # If danger detected, previous event would have been danger_alert
            assert resp_audio["event"] in ["danger_alert", "confirmation_audio"]
        else:
            assert resp_audio["event"] == "confirmation_audio"
            assert "audio_base64" in resp_audio["data"]

        # 4. correct_field
        websocket.send_json({
            "event": "correct_field",
            "session_id": "TEST-SES-001",
            "data": {"field_name": "weight", "new_value": 52.0}
        })
        resp_updated = websocket.receive_json()
        assert resp_updated["event"] == "record_updated"
        assert resp_updated["data"]["record"]["weight"] == 52.0

        resp_ack_audio = websocket.receive_json()
        assert resp_ack_audio["event"] == "confirmation_audio"

        # 5. confirm_record
        websocket.send_json({
            "event": "confirm_record",
            "session_id": "TEST-SES-001"
        })
        resp_saved = websocket.receive_json()
        assert resp_saved["event"] == "visit_saved"
        assert "visit" in resp_saved["data"]
        assert resp_saved["data"]["visit"]["weight"] == 52.0
        assert len(resp_saved["data"]["followups"]) >= 1


def test_websocket_danger_sign_emergency_interruption():
    """Verifies that an utterance with a danger sign immediately fires a danger_alert event."""
    client = TestClient(app)
    sample_wav = generate_synthesized_wav_tone(1.0, 440.0)
    sample_b64 = base64.b64encode(sample_wav).decode("utf-8")

    # Inject danger transcript into mock ASR
    asr = get_asr_adapter()
    if isinstance(asr, MockASRAdapter):
        asr.set_next_transcript("BEN-KA-002 ಸುಮಿತ್ರಾ, bleeding agtidhe vaginal bleeding severe emergency.")

    with client.websocket_connect("/ws/voice") as websocket:
        websocket.send_json({
            "event": "start_session",
            "session_id": "DANGER-SES-002",
            "data": {"beneficiary_id": "BEN-KA-002"}
        })
        websocket.receive_json()  # session_started

        websocket.send_json({
            "event": "audio_chunk",
            "session_id": "DANGER-SES-002",
            "data": {"audio_base64": sample_b64}
        })

        websocket.send_json({
            "event": "stop_recording",
            "session_id": "DANGER-SES-002"
        })

        resp_transcript = websocket.receive_json()
        assert resp_transcript["event"] == "transcript_final"

        # Danger alert must immediately fire
        resp_danger = websocket.receive_json()
        assert resp_danger["event"] == "danger_alert"
        assert resp_danger["data"]["severity"] == "CRITICAL"
        assert "PHC" in resp_danger["data"]["instruction_kn"]
        assert "audio_base64" in resp_danger["data"]


def test_websocket_bundled_audio_stop_recording():
    """Verifies that direct base64 audio bundled in stop_recording works seamlessly without chunks."""
    client = TestClient(app)
    sample_wav = generate_synthesized_wav_tone(1.0, 440.0)
    sample_b64 = base64.b64encode(sample_wav).decode("utf-8")

    with client.websocket_connect("/ws/voice") as websocket:
        websocket.send_json({
            "event": "start_session",
            "session_id": "DIRECT-SES-003",
            "data": {"beneficiary_id": "BEN-KA-001", "language": "kn"}
        })
        resp_start = websocket.receive_json()
        assert resp_start["event"] == "session_started"

        # Send stop_recording WITH bundled audio directly
        websocket.send_json({
            "event": "stop_recording",
            "session_id": "DIRECT-SES-003",
            "data": {"audio_base64": sample_b64}
        })

        resp_transcript = websocket.receive_json()
        assert resp_transcript["event"] == "transcript_final"
        assert len(resp_transcript["data"]["transcript"]) > 0


def test_websocket_empty_audio_returns_recoverable_error():
    """Verifies that empty audio produces an informative, recoverable error with can_retry: True."""
    client = TestClient(app)

    with client.websocket_connect("/ws/voice") as websocket:
        websocket.send_json({
            "event": "start_session",
            "session_id": "EMPTY-SES-004",
            "data": {"beneficiary_id": "BEN-KA-001"}
        })
        websocket.receive_json()

        # Stop recording without sending any audio
        websocket.send_json({
            "event": "stop_recording",
            "session_id": "EMPTY-SES-004",
            "data": {}
        })

        resp_err = websocket.receive_json()
        assert resp_err["event"] == "error"
        assert resp_err["data"]["code"] == "NO_AUDIO_CAPTURED"
        assert resp_err["data"]["can_retry"] is True


def test_websocket_multilingual_registration_turn():
    """Verifies conversational registration turn via voice across Indic language pipeline."""
    client = TestClient(app)
    sample_wav = generate_synthesized_wav_tone(1.0, 440.0)
    sample_b64 = base64.b64encode(sample_wav).decode("utf-8")

    asr = get_asr_adapter()
    if isinstance(asr, MockASRAdapter):
        asr.set_next_transcript("ಹೊಸ ಗರ್ಭಿಣಿ ಮಹಿಳೆ ಕವಿತಾ ವಯಸ್ಸು 24 ಹೊಸಕೋಟೆ ಗ್ರಾಮ ತೂಕ 52 kg ಬಿಪಿ 120/80 ಸಾಮಾನ್ಯ ಎಂದು ನೋಂದಾಯಿಸಿ.")

    with client.websocket_connect("/ws/voice") as websocket:
        websocket.send_json({
            "event": "start_session",
            "session_id": "REG-SES-005",
            "data": {"language": "kn"}
        })
        websocket.receive_json()

        websocket.send_json({
            "event": "stop_recording",
            "session_id": "REG-SES-005",
            "data": {"audio_base64": sample_b64}
        })

        resp_tr = websocket.receive_json()
        assert resp_tr["event"] == "transcript_final"
        assert "ಕವಿತಾ" in resp_tr["data"]["transcript"]

        resp_agent = websocket.receive_json()
        assert resp_agent["event"] in ["agent_response", "record_extracted"]
        assert "audio_base64" in resp_agent["data"]
