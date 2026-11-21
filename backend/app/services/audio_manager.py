"""
Audio Manager for Voice Field Register.
Handles chunk buffering, voice activity detection (VAD), format validation,
and privacy-preserving audio lifecycle management (never retains raw audio after processing).
"""

import io
import wave
import struct
import logging
from typing import Tuple, Optional
from app.config import settings

logger = logging.getLogger(__name__)


class AudioManager:
    """
    Manages audio streams, format normalization, and voice activity detection.
    """

    def __init__(self, sample_rate: int = 16000, channels: int = 1):
        self.sample_rate = sample_rate
        self.channels = channels
        self.bytes_per_sample = 2  # 16-bit PCM

    def validate_or_wrap_wav(self, raw_bytes: bytes) -> bytes:
        """
        Ensures audio bytes have a valid RIFF WAV header.
        If raw PCM is received from WebSocket stream, wraps it with a standard WAV header.
        """
        if not raw_bytes or len(raw_bytes) == 0:
            return b""

        # Check if already has RIFF header
        if raw_bytes[:4] == b"RIFF" and raw_bytes[8:12] == b"WAVE":
            return raw_bytes

        # Wrap raw PCM in RIFF WAV container
        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wav_file:
            wav_file.setnchannels(self.channels)
            wav_file.setsampwidth(self.bytes_per_sample)
            wav_file.setframerate(self.sample_rate)
            wav_file.writeframes(raw_bytes)

        return buffer.getvalue()

    def estimate_audio_duration_seconds(self, wav_bytes: bytes) -> float:
        """Estimates duration of WAV audio in seconds."""
        if len(wav_bytes) <= 44:
            return 0.0
        try:
            with wave.open(io.BytesIO(wav_bytes), "rb") as wav_file:
                frames = wav_file.getnframes()
                rate = wav_file.getframerate()
                return frames / float(rate)
        except Exception:
            # Fallback estimation based on bytes
            data_bytes = max(0, len(wav_bytes) - 44)
            bytes_per_sec = self.sample_rate * self.channels * self.bytes_per_sample
            return data_bytes / float(bytes_per_sec)

    def simple_vad_energy_check(self, pcm_bytes: bytes, threshold: int = 400) -> bool:
        """
        Simple, robust Voice Activity Detection (VAD) via RMS energy calculation.
        Detects if speech is active in a PCM 16-bit chunk.
        """
        if len(pcm_bytes) < 2:
            return False

        # Read samples
        count = len(pcm_bytes) // 2
        format_str = f"<{count}h"
        try:
            samples = struct.unpack(format_str, pcm_bytes[: count * 2])
            if not samples:
                return False
            sum_squares = sum(s * s for s in samples)
            rms = (sum_squares / count) ** 0.5
            return rms > threshold
        except Exception:
            return False


audio_manager = AudioManager()
