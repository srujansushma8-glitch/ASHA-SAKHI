"""
WebSocket Voice Interaction Router (/ws/voice).
Handles full conversational duplex communication between frontend and backend:
- Utterance streaming & VAD-based chunk processing
- AI4Bharat ASR transcription
- Independent MoHFW danger sign detection with immediate emergency interruption
- Structured clinical extraction
- Spoken Kannada confirmation & voice correction lifecycle
- Database persistence and automated follow-up task generation.
"""

import json
import base64
import logging
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Optional, Dict, Any

from app.schemas.voice_session import WSIncomingMessage, WSOutgoingMessage
from app.services.session_manager import session_manager, VoiceSession
from app.services.asr_adapter import BaseASRAdapter
from app.services.ai4bharat_asr import get_asr_adapter
from app.services.tts_adapter import BaseTTSAdapter, get_tts_adapter
from app.services.danger_detector import danger_detector
from app.services.llm_extractor import clinical_extractor
from app.services.audio_manager import audio_manager

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket Voice"])

asr_adapter: BaseASRAdapter = get_asr_adapter()
tts_adapter: BaseTTSAdapter = get_tts_adapter()


@router.websocket("/ws/voice")
async def voice_websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    current_session: Optional[VoiceSession] = None
    logger.info("New WebSocket connection accepted on /ws/voice")

    async def send_event(event_name: str, data: Dict[str, Any]):
        msg = WSOutgoingMessage(
            event=event_name,
            session_id=current_session.session_id if current_session else "NONE",
            data=data,
            timestamp=datetime.now().isoformat(),
        )
        await websocket.send_text(msg.model_dump_json())

    try:
        while True:
            # Handle both JSON text frames and raw binary audio frames
            message = await websocket.receive()

            if "text" in message and message["text"]:
                try:
                    payload = json.loads(message["text"])
                except Exception as e:
                    await send_event("error", {"message": f"Invalid JSON payload: {e}"})
                    continue

                event = payload.get("event")
                session_id = payload.get("session_id")
                data = payload.get("data", {})

                # 1. EVENT: start_session
                if event == "start_session":
                    current_session = session_manager.get_or_create_session(session_id)
                    current_session.status = "RECORDING"
                    current_session.audio_buffer.clear()
                    if "beneficiary_id" in data:
                        current_session.current_record = None
                    await send_event(
                        "session_started",
                        {
                            "status": "ready",
                            "beneficiary_id": data.get("beneficiary_id"),
                            "sample_rate": 16000,
                            "format": "wav_pcm",
                        },
                    )

                # 2. EVENT: audio_chunk (sent as base64 in JSON)
                elif event == "audio_chunk":
                    if not current_session:
                        current_session = session_manager.get_or_create_session(session_id)
                    b64_str = data.get("audio_base64", "")
                    if b64_str:
                        chunk_bytes = base64.b64decode(b64_str)
                        current_session.audio_buffer.extend(chunk_bytes)

                # 3. EVENT: stop_recording
                elif event == "stop_recording":
                    if not current_session or len(current_session.audio_buffer) == 0:
                        await send_event("error", {"message": "No audio received to process."})
                        continue

                    current_session.status = "PROCESSING"
                    raw_audio = bytes(current_session.audio_buffer)
                    # Privacy: clear memory buffer immediately after taking reference
                    current_session.audio_buffer.clear()

                    # Convert / wrap to valid 16kHz WAV format
                    wav_audio = audio_manager.validate_or_wrap_wav(raw_audio)

                    # A. Run Speech Recognition (AI4Bharat / Mock)
                    asr_res = await asr_adapter.transcribe(wav_audio, language="kn")
                    transcript = asr_res.transcript
                    current_session.transcript_history.append(transcript)

                    # Emit transcript_final
                    await send_event(
                        "transcript_final",
                        {
                            "transcript": transcript,
                            "latency_ms": asr_res.latency_ms,
                            "is_mock": asr_res.is_mock,
                            "model_name": asr_res.model_name,
                        },
                    )

                    # B. Independent Deterministic Danger-Sign Detection
                    danger_res = danger_detector.detect(transcript)
                    current_session.danger_result = danger_res

                    if danger_res.has_danger:
                        # HIGH-PRIORITY EMERGENCY EVENT: Interrupt normal confirmation!
                        current_session.status = "INTERRUPTED_EMERGENCY"
                        # Generate emergency alert audio without waiting
                        emergency_tts = tts_adapter.get_emergency_audio()

                        await send_event(
                            "danger_alert",
                            {
                                "severity": danger_res.highest_severity,
                                "detected_signs": [s.model_dump() for s in danger_res.detected_signs],
                                "detected_phrases": danger_res.detected_phrases,
                                "instruction_kn": danger_res.spoken_instruction_kn,
                                "instruction_en": danger_res.spoken_instruction_en,
                                "referral_action": danger_res.referral_action,
                                "audio_base64": emergency_tts.audio_base64,
                            },
                        )

                    # C. Structured Clinical Extraction
                    extracted = clinical_extractor.extract(transcript)
                    current_session.current_record = extracted

                    await send_event(
                        "record_extracted",
                        {
                            "record": extracted.model_dump(),
                            "requires_clarification": extracted.requires_clarification,
                            "clarification_prompt": extracted.clarification_prompt,
                            "danger_flag": danger_res.has_danger,
                        },
                    )

                    # D. Normal Confirmation Audio (Only if not interrupted by emergency)
                    if not danger_res.has_danger:
                        current_session.status = "AWAITING_CONFIRMATION"
                        readback_text = current_session.build_confirmation_text_kn()
                        confirm_tts = await tts_adapter.synthesize(readback_text, language="kn")

                        await send_event(
                            "confirmation_audio",
                            {
                                "text": readback_text,
                                "audio_base64": confirm_tts.audio_base64,
                                "latency_ms": confirm_tts.latency_ms,
                                "is_mock": confirm_tts.is_mock,
                            },
                        )

                # 4. EVENT: correct_field
                elif event == "correct_field":
                    if not current_session:
                        await send_event("error", {"message": "No active session found."})
                        continue

                    field = data.get("field_name")
                    val = data.get("new_value")
                    success, ack_msg = current_session.apply_correction(field, val)

                    if not success:
                        await send_event("error", {"message": ack_msg})
                        continue

                    await send_event(
                        "record_updated",
                        {
                            "record": current_session.current_record.model_dump(),
                            "field_name": field,
                            "new_value": val,
                        },
                    )

                    # Synthesize voice acknowledgment of the correction
                    ack_tts = await tts_adapter.synthesize(ack_msg, language="kn")
                    await send_event(
                        "confirmation_audio",
                        {
                            "text": ack_msg,
                            "audio_base64": ack_tts.audio_base64,
                            "latency_ms": ack_tts.latency_ms,
                        },
                    )

                # 5. EVENT: confirm_record
                elif event == "confirm_record":
                    if not current_session or not current_session.current_record:
                        await send_event("error", {"message": "No record available to confirm."})
                        continue

                    saved_result = current_session.commit_visit_to_db()
                    ack_save = "ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ."
                    save_tts = await tts_adapter.synthesize(ack_save, language="kn")

                    await send_event(
                        "visit_saved",
                        {
                            "visit": saved_result["visit"],
                            "followups": saved_result["followups"],
                            "danger_alerts": saved_result["danger_alerts"],
                            "audio_base64": save_tts.audio_base64,
                            "confirmation_text": ack_save,
                        },
                    )

                # 6. EVENT: interrupt_audio
                elif event == "interrupt_audio":
                    logger.info(f"[Session {current_session.session_id if current_session else 'NONE'}] Audio output interrupted.")

            # Raw binary frame received over WebSocket
            elif "bytes" in message and message["bytes"]:
                if not current_session:
                    current_session = session_manager.get_or_create_session()
                current_session.audio_buffer.extend(message["bytes"])

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected for session: {current_session.session_id if current_session else 'unknown'}")
        if current_session:
            session_manager.remove_session(current_session.session_id)
    except Exception as e:
        logger.error(f"Unexpected error in WebSocket loop: {e}", exc_info=True)
        await send_event("error", {"message": f"Internal server error: {e}"})
        if current_session:
            session_manager.remove_session(current_session.session_id)
