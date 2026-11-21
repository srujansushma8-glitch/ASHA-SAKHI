import React, { useEffect, useRef } from 'react';
import { audioRecorder } from '../services/audioRecorder';
import { useLanguage } from '../context/LanguageContext';

export default function WaveformVisualizer({ isRecording, isProcessing, isPlayingTTS }) {
  const { t } = useLanguage();
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

      // Centerline
      ctx.beginPath();
      ctx.strokeStyle = '#F0DDE2';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
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
          ctx.strokeStyle = '#A25B74'; // Electric Cyan
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

          // Frequency bars
          const barWidth = (width / bufferLength) * 1.5;
          let barX = 0;
          for (let i = 0; i < bufferLength; i += 2) {
            const barHeight = Math.abs(realData[i] - 128) * 0.7;
            ctx.fillStyle = i % 4 === 0 ? '#19B8D5' : '#087F8C'; // Electric Cyan & Teal
            ctx.fillRect(barX, (height / 2) - barHeight / 2, barWidth - 1, barHeight);
            barX += barWidth + 1;
          }
        } else {
          // Synthesized active wave for demo recording
          phaseRef.current += 0.08;
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#A25B74'; // Electric Cyan
          ctx.beginPath();

          for (let x = 0; x < width; x += 3) {
            const angle = (x / width) * Math.PI * 4 + phaseRef.current;
            const y = height / 2 + Math.sin(angle) * (height * 0.32) * Math.sin((x / width) * Math.PI);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Second harmonic
          ctx.strokeStyle = '#20A675'; // Healthcare Green
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let x = 0; x < width; x += 4) {
            const angle = (x / width) * Math.PI * 6 - phaseRef.current * 1.2;
            const y = height / 2 + Math.cos(angle) * (height * 0.18) * Math.sin((x / width) * Math.PI);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else if (isPlayingTTS) {
        // Readback TTS wave
        phaseRef.current += 0.10;
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#20A675'; // Healthcare Green
        ctx.beginPath();
        for (let x = 0; x < width; x += 3) {
          const angle = (x / width) * Math.PI * 5 + phaseRef.current;
          const y = height / 2 + Math.sin(angle) * (height * 0.25) * Math.sin((x / width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else if (isProcessing) {
        // Processing pulse
        phaseRef.current += 0.05;
        ctx.fillStyle = '#087F8C'; // Teal
        const numDots = 5;
        const spacing = width / (numDots + 1);
        for (let i = 1; i <= numDots; i++) {
          const scale = (Math.sin(phaseRef.current + i * 0.8) + 1) / 2;
          const radius = 3 + scale * 4;
          ctx.beginPath();
          ctx.arc(i * spacing, height / 2, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Idle flat line
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#F0DDE2';
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
    <div className="bg-white rounded-3xl p-5 border border-navy-200/60 shadow-card flex flex-col items-center justify-center">
      <div className="w-full flex items-center justify-between text-[11px] font-medium text-navy-400 mb-2.5 px-1">
        <span className="flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${
            isRecording 
              ? 'bg-emergency animate-ping' 
              : isPlayingTTS 
              ? 'bg-healthcare animate-pulse' 
              : isProcessing 
              ? 'bg-[#A25B74] animate-bounce' 
              : 'bg-navy-300'
          }`}></span>
          <span className="font-semibold text-[#3B2A33]">
            {isRecording 
              ? t('modals.waveformStream') 
              : isPlayingTTS 
              ? t('modals.waveformReadback') 
              : isProcessing 
              ? t('modals.waveformProcessing') 
              : t('modals.waveformReady')}
          </span>
        </span>
        <span className="font-mono text-[10px] text-cyan-700 font-bold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
          16kHz PCM
        </span>
      </div>

      <div className="w-full h-24 bg-softblue rounded-2xl overflow-hidden border border-navy-200/70 flex items-center justify-center relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
}
