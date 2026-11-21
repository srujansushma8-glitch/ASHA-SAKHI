import React, { useEffect, useRef } from 'react';
import { audioRecorder } from '../services/audioRecorder';

export default function WaveformVisualizer({ isRecording, isProcessing, isPlayingTTS }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set high-DPI canvas dimensions
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = 64;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Background grid / centerline
      ctx.beginPath();
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      if (isRecording) {
        // Try getting live audio data from recorder
        const realData = audioRecorder.getWaveformData(dataArray);

        if (realData && audioRecorder.analyser) {
          // Live microphone visualization
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#0D9488'; // Teal
          ctx.beginPath();

          const sliceWidth = width / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = realData[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }
          ctx.lineTo(width, height / 2);
          ctx.stroke();

          // Draw frequency bars at bottom
          const barWidth = (width / bufferLength) * 1.5;
          let barX = 0;
          for (let i = 0; i < bufferLength; i += 2) {
            const barHeight = Math.abs(realData[i] - 128) * 0.8;
            ctx.fillStyle = i % 4 === 0 ? '#14B8A6' : '#0D9488';
            ctx.fillRect(barX, (height / 2) - barHeight / 2, barWidth - 1, barHeight);
            barX += barWidth + 1;
          }
        } else {
          // Synthesized active wave for demo recording
          phaseRef.current += 0.08;
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#0D9488';
          ctx.beginPath();

          for (let x = 0; x < width; x += 3) {
            const angle = (x / width) * Math.PI * 4 + phaseRef.current;
            const y = height / 2 + Math.sin(angle) * (height * 0.35) * Math.sin((x / width) * Math.PI);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Second harmonic
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let x = 0; x < width; x += 4) {
            const angle = (x / width) * Math.PI * 6 - phaseRef.current * 1.2;
            const y = height / 2 + Math.cos(angle) * (height * 0.2) * Math.sin((x / width) * Math.PI);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (isPlayingTTS) {
        // Readback TTS wave
        phaseRef.current += 0.12;
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#0284C7'; // Sky/Blue for readback
        ctx.beginPath();
        for (let x = 0; x < width; x += 3) {
          const angle = (x / width) * Math.PI * 5 + phaseRef.current;
          const y = height / 2 + Math.sin(angle) * (height * 0.28) * Math.sin((x / width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (isProcessing) {
        // Processing pulse
        phaseRef.current += 0.05;
        ctx.fillStyle = '#0D9488';
        const numDots = 5;
        const spacing = width / (numDots + 1);
        for (let i = 1; i <= numDots; i++) {
          const scale = (Math.sin(phaseRef.current + i * 0.8) + 1) / 2;
          const radius = 3 + scale * 5;
          ctx.beginPath();
          ctx.arc(i * spacing, height / 2, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Idle flat wave with gentle ripple
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#94A3B8';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, isProcessing, isPlayingTTS]);

  return (
    <div className="w-full bg-white rounded-xl p-3 border border-navy-100 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-navy-600 flex items-center space-x-1">
          <span className={`w-2 h-2 rounded-full ${
            isRecording ? 'bg-emergency-500 animate-ping' : isPlayingTTS ? 'bg-blue-500 animate-pulse' : 'bg-navy-300'
          }`}></span>
          <span>
            {isRecording ? 'ಲೈವ್ ಆಡಿಯೋ ಇನ್‌ಪುಟ್ (Live Audio Input)' : isPlayingTTS ? 'ಧ್ವನಿ ಓದುವಿಕೆ (TTS Spoken Readback)' : 'ಆಡಿಯೋ ಸ್ಥಿತಿ (Audio Ready)'}
          </span>
        </span>
        <span className="text-[10px] text-navy-400 font-mono">16kHz PCM</span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-16 rounded-lg bg-navy-50/50 block"
      />
    </div>
  );
}
