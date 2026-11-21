"""
AI4Bharat Indic-Speak and Indic-TTS Speech Generation Adapter.
Connects to official AI4Bharat/Bhashini Dhruva pipeline if credentials are provided,
with instant fallback to pre-rendered emergency audio and MockTTSAdapter.
Never invents endpoints or credentials.
"""

import time
import base64
import logging
import httpx
from typing import Optional
from app.config import settings
from app.services.tts_adapter import BaseTTSAdapter, TTSResult, MockTTSAdapter

logger = logging.getLogger(__name__)


class AI4BharatHostedTTS(BaseTTSAdapter):
    """
    Adapter for official AI4Bharat / Bhashini Dhruva TTS Pipeline API.
    Model: Indic-TTS Kannada (Female voice) / Indic-Speak.
    Official Endpoint: https://dhruva-api.bhashini.gov.in/services/inference/pipeline
    """

    def __init__(self):
        self.api_url = settings.AI4BHARAT_TTS_API_URL
        self.api_key = settings.AI4BHARAT_API_KEY
        self.user_id = settings.AI4BHARAT_USER_ID
        self.service_id = settings.AI4BHARAT_TTS_SERVICE_ID
        self.gender = settings.AI4BHARAT_TTS_GENDER
        self.model_name = "ai4bharat-dhruva-indic-tts-kn"
        self._fallback_mock = MockTTSAdapter()

    async def synthesize(self, text: str, language: str = "kn", gender: str = "female") -> TTSResult:
        # Check if official credentials are provided
        if not self.api_key or not self.user_id:
            logger.warning(
                "AI4Bharat credentials not configured in .env; falling back to MockTTSAdapter."
            )
            return await self._fallback_mock.synthesize(text, language=language, gender=gender)

        start_time = time.perf_counter()

        headers = {
            "Content-Type": "application/json",
            "userID": self.user_id,
            "ulcaApiKey": self.api_key,
            "Authorization": self.api_key,
        }

        payload = {
            "pipelineTasks": [
                {
                    "taskType": "tts",
                    "config": {
                        "language": {"sourceLanguage": language},
                        "serviceId": self.service_id,
                        "gender": gender or self.gender,
                    },
                }
            ],
            "inputData": {
                "input": [{"source": text}]
            },
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(self.api_url, json=payload, headers=headers)
                latency_ms = (time.perf_counter() - start_time) * 1000

                if response.status_code == 200:
                    resp_data = response.json()
                    pipeline_response = resp_data.get("pipelineResponse", [])
                    if pipeline_response and "audio" in pipeline_response[0]:
                        audios = pipeline_response[0]["audio"]
                        if audios and "audioContent" in audios[0]:
                            audio_b64 = audios[0]["audioContent"]
                            audio_bytes = base64.b64decode(audio_b64)
                            return TTSResult(
                                audio_bytes=audio_bytes,
                                audio_base64=audio_b64,
                                text=text,
                                is_mock=False,
                                model_name=self.model_name,
                                latency_ms=round(latency_ms, 2),
                                format="wav",
                            )
                    logger.warning(f"Unexpected Dhruva TTS response format: {resp_data}")
                else:
                    logger.error(
                        f"Dhruva TTS API error: status {response.status_code}, response: {response.text}"
                    )
        except Exception as e:
            logger.error(f"Failed to communicate with AI4Bharat Dhruva TTS endpoint: {e}")

        # Fallback to mock adapter on failure
        return await self._fallback_mock.synthesize(text, language=language, gender=gender)


def get_tts_adapter() -> BaseTTSAdapter:
    """Factory function returning the configured TTS adapter."""
    mode = settings.TTS_MODE.lower()
    if mode == "ai4bharat_hosted":
        return AI4BharatHostedTTS()
    else:
        return MockTTSAdapter()
