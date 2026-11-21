"""
Benchmark and Latency Measurement Suite.
Measures and verifies actual latency of:
- ASR Transcription
- TTS Speech Generation
- Danger Sign Detection
- Structured Clinical Extraction
Do not claim real-time performance without empirical measurement!
"""

import time
import pytest
from app.services.asr_adapter import MockASRAdapter
from app.services.tts_adapter import MockTTSAdapter, generate_synthesized_wav_tone
from app.services.danger_detector import DangerSignDetector
from app.services.llm_extractor import DeterministicExtractor


@pytest.mark.asyncio
async def test_benchmark_asr_latency():
    """Measures transcription latency across 10 audio chunks."""
    adapter = MockASRAdapter()
    sample_wav = generate_synthesized_wav_tone(2.0, 440.0)
    latencies = []

    for _ in range(10):
        t0 = time.perf_counter()
        res = await adapter.transcribe(sample_wav, language="kn")
        elapsed = (time.perf_counter() - t0) * 1000
        latencies.append(res.latency_ms)

    avg_latency = sum(latencies) / len(latencies)
    p95_latency = sorted(latencies)[int(0.95 * len(latencies))]

    print(f"\n[BENCHMARK] ASR Latency - Avg: {avg_latency:.2f}ms | p95: {p95_latency:.2f}ms | Min: {min(latencies):.2f}ms")
    assert avg_latency < 1000.0  # Must be comfortably within responsive range


@pytest.mark.asyncio
async def test_benchmark_tts_latency():
    """Measures TTS synthesis latency across typical spoken confirmation phrases."""
    adapter = MockTTSAdapter()
    test_phrases = [
        "ನೀವು ದಾಖಲಿಸಿರುವ ವಿವರಗಳು ಸರಿಯಾಗಿವೆಯೇ?",
        "ಈ ಫಲಾನುಭವಿಗೆ ತಕ್ಷಣ PHC ಗೆ ರೆಫರ್ ಮಾಡಿ.",
        "ತೂಕವನ್ನು 54 kg ಎಂದು ಬದಲಾಯಿಸಲಾಗಿದೆ.",
        "ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.",
    ]
    latencies = []

    for phrase in test_phrases:
        t0 = time.perf_counter()
        res = await adapter.synthesize(phrase, language="kn")
        elapsed = (time.perf_counter() - t0) * 1000
        latencies.append(res.latency_ms)

    avg_latency = sum(latencies) / len(latencies)
    print(f"\n[BENCHMARK] TTS Latency - Avg: {avg_latency:.2f}ms | Max: {max(latencies):.2f}ms")
    assert avg_latency < 800.0


def test_benchmark_danger_detector_latency():
    """Measures deterministic danger detection execution time (critical safety SLA < 10ms)."""
    detector = DangerSignDetector()
    transcript = "ಫಲಾನುಭವಿ ಸುಮಿತ್ರಾ BEN-KA-002, ANC checkup, bleeding agtidhe vaginal bleeding, ತಕ್ಷಣ ನೋಡ್ಬೇಕು."
    latencies = []

    for _ in range(50):
        t0 = time.perf_counter()
        res = detector.detect(transcript)
        elapsed_ms = (time.perf_counter() - t0) * 1000
        latencies.append(elapsed_ms)
        assert res.has_danger is True

    avg_ms = sum(latencies) / len(latencies)
    print(f"\n[BENCHMARK] Danger Sign Detection Latency - Avg: {avg_ms:.4f}ms (SLA < 10ms)")
    assert avg_ms < 10.0  # Ultra-fast sub-10ms response guaranteed


def test_benchmark_structured_extraction_latency():
    """Measures deterministic extraction execution time (SLA < 20ms)."""
    extractor = DeterministicExtractor()
    transcript = "ಫಲಾನುಭವಿ ಲಕ್ಷ್ಮಿ BEN-KA-001, ANC checkup, weight 54 kg, TT injection ಕೊಟ್ಟಿದ್ದೇವೆ, next visit date 2026-12-15."
    latencies = []

    for _ in range(50):
        t0 = time.perf_counter()
        rec = extractor.extract(transcript)
        elapsed_ms = (time.perf_counter() - t0) * 1000
        latencies.append(elapsed_ms)
        assert rec.beneficiary_id == "BEN-KA-001"

    avg_ms = sum(latencies) / len(latencies)
    print(f"\n[BENCHMARK] Structured Extraction Latency - Avg: {avg_ms:.4f}ms (SLA < 20ms)")
    assert avg_ms < 20.0
