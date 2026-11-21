"""
WebSocket Voice Interaction Router (/ws/voice).
Handles full conversational duplex communication between frontend and backend across all 22 scheduled Indian languages:
- Utterance streaming & VAD-based chunk processing
- AI4Bharat Indic-Transcribe multilingual ASR transcription
- Multilingual Indic Conversational Voice Agent (Intent, Registration, History Search, Follow-ups, Corrections)
- Independent MoHFW danger sign detection with immediate emergency interruption
- Automated simulated ambulance dispatch creation
- Structured clinical extraction
- Spoken native language confirmation & voice correction lifecycle in active Indic language
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
from app.services.indic_voice_agent import indic_voice_agent
from app.services.audio_manager import audio_manager
from app.services.ambulance_service import ambulance_service
from app.services.indic_languages import get_language_info, INDIC_LANGUAGES

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket Voice"])

asr_adapter: BaseASRAdapter = get_asr_adapter()
tts_adapter: BaseTTSAdapter = get_tts_adapter()

# Global set of active WebSocket clients for real-time broadcast
active_connections: set = set()


async def broadcast_ws_event(event_name: str, data: Dict[str, Any]):
    """Broadcasts real-time events (e.g. ambulance telemetry, danger alerts) to all connected clients."""
    payload = json.dumps({
        "event": event_name,
        "data": data,
        "timestamp": datetime.now().isoformat()
    })
    for ws in list(active_connections):
        try:
            await ws.send_text(payload)
        except Exception:
            active_connections.discard(ws)


@router.websocket("/ws/voice")
async def voice_websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
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
                    # Determine active language (defaults to Kannada)
                    req_lang = data.get("language") or payload.get("language") or "kn"
                    norm_lang = req_lang.lower().split("-")[0].strip()
                    if norm_lang not in INDIC_LANGUAGES:
                        norm_lang = "kn"

                    current_session = session_manager.get_or_create_session(session_id, language=norm_lang)
                    current_session.status = "RECORDING"
                    current_session.audio_buffer.clear()
                    current_session.language = norm_lang

                    if "beneficiary_id" in data:
                        current_session.current_record = None

                    lang_info = get_language_info(norm_lang)
                    await send_event(
                        "session_started",
                        {
                            "status": "ready",
                            "beneficiary_id": data.get("beneficiary_id"),
                            "language": norm_lang,
                            "language_name": lang_info.name_en,
                            "language_native": lang_info.name_native,
                            "sample_rate": 16000,
                            "format": "wav_pcm",
                        },
                    )

                # 2. EVENT: audio_chunk (sent as base64 in JSON)
                elif event == "audio_chunk":
                    if not current_session:
                        current_session = session_manager.get_or_create_session(session_id)
                    b64_str = data.get("audio_base64") or payload.get("audio_data") or payload.get("audio_base64") or ""
                    if b64_str:
                        chunk_bytes = base64.b64decode(b64_str)
                        current_session.audio_buffer.extend(chunk_bytes)

                # 3. EVENT: stop_recording
                elif event == "stop_recording":
                    if not current_session:
                        current_session = session_manager.get_or_create_session(session_id)

                    # Check for directly bundled audio in stop_recording
                    direct_b64 = data.get("audio_base64") or payload.get("audio_base64") or payload.get("audio_data") or ""
                    if direct_b64:
                        try:
                            direct_bytes = base64.b64decode(direct_b64)
                            if direct_bytes and len(direct_bytes) > 0:
                                current_session.audio_buffer.clear()
                                current_session.audio_buffer.extend(direct_bytes)
                        except Exception as dec_err:
                            logger.warning(f"Failed decoding audio_base64 in stop_recording: {dec_err}")

                    if len(current_session.audio_buffer) == 0:
                        await send_event(
                            "error",
                            {
                                "code": "NO_AUDIO_CAPTURED",
                                "message": "ಯಾವುದೇ ಧ್ವನಿ ದಾಖಲಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಪರಿಶೀಲಿಸಿ ಮತ್ತೊಮ್ಮೆ ಮಾತನಾಡಿ (No audio received. Please check mic permissions and speak again.)",
                                "can_retry": True
                            }
                        )
                        continue

                    current_session.status = "PROCESSING"
                    raw_audio = bytes(current_session.audio_buffer)
                    current_session.audio_buffer.clear()

                    active_lang = current_session.language or data.get("language") or "kn"
                    if active_lang not in INDIC_LANGUAGES:
                        active_lang = "kn"

                    try:
                        wav_audio = audio_manager.validate_or_wrap_wav(raw_audio)

                        # A. Speech Recognition (AI4Bharat Indic-Transcribe / Mock)
                        asr_res = await asr_adapter.transcribe(wav_audio, language=active_lang)
                        transcript = asr_res.transcript or ""
                        current_session.transcript_history.append(transcript)

                        if not transcript.strip():
                            await send_event(
                                "error",
                                {
                                    "code": "NO_SPEECH_DETECTED",
                                    "message": "ಧ್ವನಿ ಸ್ಪಷ್ಟವಾಗಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾಗಿ ಮತ್ತೊಮ್ಮೆ ಮಾತನಾಡಿ (No speech detected. Please speak clearly and try again.)",
                                    "can_retry": True
                                }
                            )
                            continue

                        await send_event(
                            "transcript_final",
                            {
                                "transcript": transcript,
                                "text": transcript,
                                "language": active_lang,
                                "latency_ms": asr_res.latency_ms,
                                "is_mock": asr_res.is_mock,
                                "model_name": asr_res.model_name,
                            },
                        )

                        # B. Independent Deterministic Danger-Sign Detection
                        danger_res = danger_detector.detect(transcript, language=active_lang)
                        current_session.danger_result = danger_res

                        # C. Process Conversational Turn with Indic Voice Agent
                        agent_resp = indic_voice_agent.process_turn(
                            transcript=transcript,
                            language=active_lang,
                            session_context=current_session.context
                        )

                        # If danger detected: generate simulated ambulance request & emergency alert
                        sim_amb = None
                        if danger_res.has_danger:
                            current_session.status = "INTERRUPTED_EMERGENCY"
                            emergency_tts = tts_adapter.get_emergency_audio(language=active_lang)

                            # Automatically trigger simulated ambulance dispatch
                            ben_id = "BEN-KA-001"
                            if current_session.current_record and current_session.current_record.beneficiary_id:
                                ben_id = current_session.current_record.beneficiary_id

                            pickup = "Hoskote Village"
                            from app.models.beneficiary import BeneficiaryRepository
                            ben = BeneficiaryRepository.get_by_id(ben_id)
                            if ben and ben.get("village"):
                                pickup = ben["village"]

                            sim_amb = ambulance_service.create_request(
                                beneficiary_id=ben_id,
                                emergency_id=danger_res.detected_signs[0].sign_id if danger_res.detected_signs else None,
                                pickup_location=pickup,
                                notes=f"Auto-triggered simulated 108 dispatch for danger sign: {danger_res.highest_severity} ({active_lang})",
                            )
                            current_session.simulated_ambulance = sim_amb

                            await send_event(
                                "danger_alert",
                                {
                                    "severity": danger_res.highest_severity,
                                    "detected_signs": [s.model_dump() for s in danger_res.detected_signs],
                                    "detected_phrases": danger_res.detected_phrases,
                                    "instruction_kn": danger_res.spoken_instruction_kn,
                                    "instruction_en": danger_res.spoken_instruction_en,
                                    "spoken_native": emergency_tts.text,
                                    "referral_action": danger_res.referral_action,
                                    "audio_base64": emergency_tts.audio_base64,
                                    "simulated_ambulance": sim_amb,
                                },
                            )

                        # D. If Agent handled Registration, Search, Tasks, Assistant Queries, or Greeting
                        if agent_resp.intent and agent_resp.intent not in {"VISIT_AWAITING_CONFIRMATION", "CLINICAL_VISIT"}:
                            # Synthesize natural voice response in active language
                            spoken_audio = await tts_adapter.synthesize(agent_resp.spoken_text, language=active_lang)

                            await send_event(
                                "agent_response",
                                {
                                    "intent": agent_resp.intent,
                                    "spoken_text": agent_resp.spoken_text,
                                    "display_text": agent_resp.display_text,
                                    "language": active_lang,
                                    "audio_base64": spoken_audio.audio_base64,
                                    "latency_ms": spoken_audio.latency_ms,
                                    "extracted_data": agent_resp.extracted_data,
                                    "saved_entity_id": agent_resp.saved_entity_id,
                                    "danger_flag": danger_res.has_danger,
                                    "alert": danger_res.detected_signs[0].model_dump() if danger_res.has_danger and danger_res.detected_signs else None,
                                    "transcript": transcript,
                                },
                            )

                        # E. Standard Clinical Visit Extraction Flow
                        if agent_resp.intent in {"VISIT_AWAITING_CONFIRMATION", "CLINICAL_VISIT"} or not agent_resp.intent:
                            extracted = clinical_extractor.extract(transcript)
                            current_session.current_record = extracted

                            await send_event(
                                "record_extracted",
                                {
                                    "record": extracted.model_dump(),
                                    "requires_clarification": extracted.requires_clarification,
                                    "clarification_prompt": extracted.clarification_prompt,
                                    "danger_flag": danger_res.has_danger,
                                    "language": active_lang,
                                    "transcript": transcript,
                                },
                            )

                            # Normal Confirmation Audio in Active Language (if not interrupted by emergency)
                            if not danger_res.has_danger:
                                current_session.status = "AWAITING_CONFIRMATION"
                                readback_text = agent_resp.spoken_text or current_session.build_confirmation_text(language=active_lang)
                                confirm_tts = await tts_adapter.synthesize(readback_text, language=active_lang)

                                await send_event(
                                    "confirmation_audio",
                                    {
                                        "text": readback_text,
                                        "language": active_lang,
                                        "audio_base64": confirm_tts.audio_base64,
                                        "latency_ms": confirm_tts.latency_ms,
                                        "is_mock": confirm_tts.is_mock,
                                    },
                                )
                    except Exception as turn_err:
                        logger.error(f"Error processing voice turn: {turn_err}", exc_info=True)
                        await send_event(
                            "error",
                            {
                                "code": "TURN_PROCESSING_FAILED",
                                "message": f"ಸಂಸ್ಕರಣೆಯಲ್ಲಿ ದೋಷ: {str(turn_err)} (Processing error: {str(turn_err)})",
                                "can_retry": True
                            }
                        )

                # 4. EVENT: correct_field
                elif event == "correct_field":
                    if not current_session:
                        await send_event("error", {"message": "No active session found."})
                        continue

                    field = data.get("field_name") or payload.get("field_name")
                    val = data.get("new_value") if "new_value" in data else payload.get("new_value")
                    active_lang = current_session.language or "kn"
                    success, ack_msg = current_session.apply_correction(field, val, language=active_lang)

                    if not success:
                        await send_event("error", {"message": ack_msg})
                        continue

                    if current_session.current_record:
                        await send_event(
                            "record_updated",
                            {
                                "record": current_session.current_record.model_dump(),
                                "field_name": field,
                                "new_value": val,
                                "language": active_lang,
                            },
                        )

                    ack_tts = await tts_adapter.synthesize(ack_msg, language=active_lang)
                    await send_event(
                        "confirmation_audio",
                        {
                            "text": ack_msg,
                            "language": active_lang,
                            "audio_base64": ack_tts.audio_base64,
                            "latency_ms": ack_tts.latency_ms,
                        },
                    )

                # 5. EVENT: confirm_record
                elif event == "confirm_record":
                    if not current_session:
                        await send_event("error", {"message": "No active session."})
                        continue

                    active_lang = current_session.language or "kn"

                    # Priority 1: If structured clinical visit record exists, commit visit to database & schedule follow-ups
                    if current_session.current_record:
                        saved_result = current_session.commit_visit_to_db()

                        ack_translations = {
                            "kn": "ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.",
                            "hi": "स्वास्थ्य रिकॉर्ड सफलतापूर्वक सुरक्षित कर लिया गया है।",
                            "te": "రికార్డు విజయవంతంగా సేవ్ చేయబడింది.",
                            "ta": "பதிவு வெற்றிகரமாக சேமிக்கப்பட்டது.",
                            "ml": "റെക്കോർഡ് വിജയകരമായി സേവ് ചെയ്തു.",
                            "bn": "রেকর্ড সফলভাবে সংরক্ষিত হয়েছে।",
                            "mr": "नोंद यशस्वीपणे सेव्ह झाली आहे.",
                            "gu": "રેકોર્ડ સફળતાપૂર્વક સાચવી લીધો છે.",
                            "ur": "ریکارڈ کامیابی سے محفوظ کر لیا گیا۔",
                            "pa": "ਰਿਕਾਰਡ ਸੇਵ ਹੋ ਗਿਆ ਹੈ।",
                            "or": "ରେକର୍ଡ ସଫଳତାର ସହ ସେଭ ହୋଇଛି।",
                            "as": "ৰেকৰ্ড সফলভাৱে সংৰক্ষণ কৰা হ'ল।"
                        }
                        ack_save = ack_translations.get(active_lang, "Record successfully saved to field register.")
                        save_tts = await tts_adapter.synthesize(ack_save, language=active_lang)

                        await send_event(
                            "visit_saved",
                            {
                                "visit": saved_result["visit"],
                                "followups": saved_result["followups"],
                                "danger_alerts": saved_result["danger_alerts"],
                                "simulated_ambulance": saved_result.get("simulated_ambulance"),
                                "audio_base64": save_tts.audio_base64,
                                "confirmation_text": ack_save,
                                "language": active_lang,
                            },
                        )
                        continue

                    # Priority 2: Check if there is a pending agent-level action (like registration)
                    if current_session.context.get("pending_action"):
                        agent_resp = indic_voice_agent.process_turn("confirm", active_lang, current_session.context)
                        ack_save = agent_resp.spoken_text
                        save_tts = await tts_adapter.synthesize(ack_save, language=active_lang)
                        await send_event(
                            "visit_saved",
                            {
                                "confirmation_text": ack_save,
                                "audio_base64": save_tts.audio_base64,
                                "language": active_lang,
                            },
                        )
                        continue

                    await send_event("error", {"message": "No record available to confirm."})

                # 5B. EVENT: assistant_query (Text or recognized question)
                elif event == "assistant_query":
                    query_str = data.get("query") or payload.get("query", "")
                    active_lang = data.get("language") or payload.get("language") or (current_session.language if current_session else "en") or "en"
                    from app.services.sakhi_assistant import sakhi_assistant
                    res = sakhi_assistant.process_query(
                        query_str,
                        active_lang,
                        current_session.context if current_session else {}
                    )
                    spoken_audio = await tts_adapter.synthesize(res["spoken_text"], language=active_lang)
                    await send_event(
                        "assistant_response",
                        {
                            "intent": res["intent"],
                            "spoken_text": res["spoken_text"],
                            "display_text": res["display_text"],
                            "records": res.get("records"),
                            "count": res.get("count"),
                            "language": active_lang,
                            "suggested_actions": res.get("suggested_actions"),
                            "audio_base64": spoken_audio.audio_base64,
                            "latency_ms": spoken_audio.latency_ms
                        }
                    )

                # 6. EVENT: interrupt_audio
                elif event == "interrupt_audio":
                    logger.info(f"[Session {current_session.session_id if current_session else 'NONE'}] Audio output interrupted.")

            elif "bytes" in message and message["bytes"]:
                if not current_session:
                    current_session = session_manager.get_or_create_session()
                current_session.audio_buffer.extend(message["bytes"])

    except WebSocketDisconnect:
        active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected for session: {current_session.session_id if current_session else 'unknown'}")
        if current_session:
            session_manager.remove_session(current_session.session_id)
    except Exception as e:
        # Check if client cleanly disconnected via Starlette or connection dropped
        if "disconnect" in type(e).__name__.lower() or "disconnect" in str(e).lower():
            active_connections.discard(websocket)
            logger.info(f"WebSocket client disconnected for session: {current_session.session_id if current_session else 'unknown'}")
            if current_session:
                session_manager.remove_session(current_session.session_id)
            return

        logger.error(f"Unexpected error in WebSocket loop: {e}", exc_info=True)
        await send_event("error", {"message": f"Internal server error: {e}"})
        if current_session:
            session_manager.remove_session(current_session.session_id)
