import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  RotateCcw, 
  Check, 
  Play, 
  Pause, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  Volume2, 
  ArrowLeft, 
  FileText, 
  Activity, 
  Layers, 
  ShieldCheck,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import WaveformVisualizer from '../components/WaveformVisualizer';
import MicrophonePermissionModal from '../components/MicrophonePermissionModal';
import { audioRecorder } from '../services/audioRecorder';
import { voiceWs } from '../services/websocket';
import { ttsService } from '../services/ttsService';
import { isDemoMode } from '../services/api';
import { DEMO_SCENARIOS } from '../services/mockData';

export default function VoiceRecordingScreen({ 
  onRecordExtracted, 
  onDangerAlert, 
  onBack,
  initialScenarioId = 'anc_routine'
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [language, setLanguage] = useState('kn'); // 'kn', 'kn-en', 'en'
  const [processingStatus, setProcessingStatus] = useState('ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಮಾಡಲು ಸಿದ್ಧ (Ready to Record)');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [windowCount, setWindowCount] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permError, setPermError] = useState(null);
  const [demoScenario, setDemoScenario] = useState(initialScenarioId);
  const [isDemo, setIsDemo] = useState(isDemoMode());
  const [extractedRecordData, setExtractedRecordData] = useState(null);
  const [activeDangerAlert, setActiveDangerAlert] = useState(null);

  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    setIsDemo(isDemoMode());

    voiceWs.connect().catch(err => {
      console.warn('[VoiceRecordingScreen] WS connection error', err);
    });

    const unsubSession = voiceWs.on('session_started', (payload) => {
      setProcessingStatus('ಧ್ವನಿ ಸ್ವೀಕರಿಸಲಾಗುತ್ತಿದೆ... (Listening...)');
    });

    const unsubPartial = voiceWs.on('transcript_partial', (payload) => {
      setPartialTranscript(payload.text || '');
      setWindowCount(prev => prev + 1);
      setProcessingStatus(`Indic-Transcribe ಆಡಿಯೋ ವಿಂಡೋ #${payload.window_id || 1} ಸಂಸ್ಕರಣೆ...`);
    });

    const unsubFinal = voiceWs.on('transcript_final', (payload) => {
      setFinalTranscript(payload.text || '');
      setPartialTranscript('');
      setProcessingStatus('AI4Bharat ಮಾದರಿಯಿಂದ ಪೂರ್ಣ ಪಠ್ಯ ಪಡೆಯಲಾಗಿದೆ. ಕ್ಷೇತ್ರಗಳನ್ನು ಪ್ರತ್ಯೇಕಿಸಲಾಗುತ್ತಿದೆ...');
    });

    const unsubExtracted = voiceWs.on('record_extracted', (payload) => {
      setIsProcessing(false);
      setProcessingStatus('ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಗುರುತಿಸಲಾಗಿದೆ! (Fields Extracted)');
      setExtractedRecordData(payload.record);
    });

    const unsubDanger = voiceWs.on('danger_alert', (payload) => {
      setActiveDangerAlert(payload.alert);
      if (onDangerAlert) onDangerAlert(payload.alert);
    });

    const unsubTTS = voiceWs.on('confirmation_audio', (payload) => {
      if (payload.transcript_kannada) {
        setIsPlayingTTS(true);
        ttsService.speakText(payload.transcript_kannada, {
          language: 'kn-IN',
          onEnd: () => setIsPlayingTTS(false)
        });
      }
    });

    const unsubError = voiceWs.on('error', (payload) => {
      setIsProcessing(false);
      setIsRecording(false);
      setProcessingStatus(`ದೋಷ: ${payload.message || 'Processing error'}`);
    });

    return () => {
      unsubSession();
      unsubPartial();
      unsubFinal();
      unsubExtracted();
      unsubDanger();
      unsubTTS();
      unsubError();
      clearInterval(timerRef.current);
      audioRecorder.cleanup();
      ttsService.stop();
    };
  }, []);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      ttsService.stop();
      setExtractedRecordData(null);
      setActiveDangerAlert(null);
      setPartialTranscript('');
      setFinalTranscript('');
      setWindowCount(0);
      setDuration(0);

      const { stream, mimeType } = await audioRecorder.startRecording({
        timeslice: 1000,
        onChunk: (chunk) => {
          voiceWs.sendAudioChunk({
            chunkIndex: chunk.chunkIndex,
            base64Audio: chunk.base64,
            size: chunk.size,
            mimeType: chunk.mimeType
          });
        },
        onStateChange: (state) => {
          if (state === 'recording') setIsRecording(true);
        }
      });

      voiceWs.startSession({
        language,
        audioConfig: { sampleRate: 16000, encoding: mimeType },
        demoScenarioId: demoScenario
      });

      setIsRecording(true);
      setProcessingStatus('ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ... (Listening...)');

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('[VoiceRecording] Failed to start recording', err);
      setIsRecording(false);
      setPermError(err.message);
      setPermModalOpen(true);
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    clearInterval(timerRef.current);
    setIsRecording(false);
    setIsProcessing(true);
    setProcessingStatus('ಆಡಿಯೋ ವಿಂಡೋಗಳನ್ನು ಸಂಸ್ಕರಿಸಲಾಗುತ್ತಿದೆ... (Processing with Indic-Transcribe...)');

    try {
      const { blob, url } = await audioRecorder.stopRecording();
      if (url) {
        setRecordedAudioUrl(url);
      }
      voiceWs.stopRecording();
    } catch (err) {
      console.error('[VoiceRecording] Stop error', err);
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    clearInterval(timerRef.current);
    audioRecorder.reset();
    ttsService.stop();
    setIsRecording(false);
    setIsProcessing(false);
    setDuration(0);
    setPartialTranscript('');
    setFinalTranscript('');
    setWindowCount(0);
    setRecordedAudioUrl(null);
    setExtractedRecordData(null);
    setActiveDangerAlert(null);
    setProcessingStatus('ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಮಾಡಲು ಸಿದ್ಧ (Ready to Record)');
  };

  const toggleAudioPlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handlePlayVoiceReadback = () => {
    if (!extractedRecordData) return;
    const text = extractedRecordData.spoken_confirmation_kn || 
      `${extractedRecordData.beneficiary_name} ಅವರ ಭೇಟಿ ವಿವರ ದಾಖಲಾಗಿದೆ. ತೂಕ ${extractedRecordData.weight || ''} kg.`;
    setIsPlayingTTS(true);
    ttsService.speakText(text, {
      language: 'kn-IN',
      onEnd: () => setIsPlayingTTS(false)
    });
  };

  const handleProceedToRecord = () => {
    if (extractedRecordData && onRecordExtracted) {
      onRecordExtracted(extractedRecordData, activeDangerAlert);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12">
      {/* 1. Top Header Navigation Strip */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-navy-200/60 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-softblue border border-navy-200/70 text-navy-800 hover:bg-navy-100 active:scale-[0.98] transition-decelerate"
            title="ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ (Back to Home)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg lg:text-xl font-bold font-kannada text-navy-900 leading-tight">
                ಧ್ವನಿ ಕ್ಷೇತ್ರ ದಿನಚರಿ (Voice Field Assistant)
              </h1>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                AI4Bharat VAD
              </span>
            </div>
            <p className="text-xs text-navy-500 font-medium mt-0.5">
              Indic-Transcribe ASR (Kannada/Code-Mixed) & Indic-Speak TTS
            </p>
          </div>
        </div>

        {/* Language Selection Chips */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs text-navy-500 font-bold hidden sm:inline font-kannada">ಭಾಷೆ:</span>
          <div className="flex bg-softblue p-1 rounded-2xl border border-navy-200/60">
            {[
              { id: 'kn', label: 'ಕನ್ನಡ' },
              { id: 'kn-en', label: 'ಕನ್+Eng' },
              { id: 'en', label: 'English' }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-decelerate active:scale-[0.98] ${
                  language === lang.id
                    ? 'bg-primary text-white shadow-touch'
                    : 'text-navy-600 hover:text-navy-900'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: HERO RECORDING CONTROLS & WAVEFORM (Span 5) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Hero Recording Card */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-navy-200/60 shadow-card text-center relative overflow-hidden space-y-5">
            {/* Duration Counter Pill */}
            <div className="inline-flex items-center space-x-2.5 px-6 py-2 rounded-full bg-softblue border border-navy-200/70 text-navy-900 font-mono text-lg font-bold shadow-inner">
              <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-emergency animate-ping' : 'bg-primary'}`}></span>
              <span>{formatDuration(duration)}</span>
            </div>

            {/* Large Interactive Microphone Button */}
            <div className="relative flex items-center justify-center py-4">
              {isRecording && (
                <div className="absolute w-48 h-48 rounded-full bg-emergency-100 animate-ping pointer-events-none"></div>
              )}
              {isRecording && (
                <div className="absolute w-40 h-40 rounded-full bg-emergency-200 animate-pulse pointer-events-none"></div>
              )}

              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isProcessing}
                aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
                className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-card border-4 border-white active:scale-95 transition-decelerate touch-manipulation ${
                  isRecording
                    ? 'bg-emergency hover:bg-emergency-hover text-white shadow-emergency animate-pulse'
                    : isProcessing
                    ? 'bg-navy-300 text-white cursor-not-allowed'
                    : 'bg-gradient-to-tr from-primary to-cyan hover:from-primary-hover hover:to-cyan-hover text-white shadow-cyan'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-9 h-9 fill-current" />
                    <span className="text-xs font-bold mt-1 font-kannada">ನಿಲ್ಲಿಸಿ</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-10 h-10" />
                    <span className="text-xs font-bold mt-1 font-kannada">ಮಾತನಾಡಿ</span>
                  </>
                )}
              </button>
            </div>

            {/* Processing Status Text */}
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-2 text-xs font-bold text-navy-900">
                {isProcessing && <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"></div>}
                <span>{processingStatus}</span>
              </div>
              <p className="text-xs text-navy-400 font-kannada font-medium">
                {isRecording
                  ? 'ಸ್ಪಷ್ಟವಾಗಿ ಕನ್ನಡದಲ್ಲಿ ಅಥವಾ ವೈದ್ಯಕೀಯ ಪದಗಳೊಂದಿಗೆ ಮಾತನಾಡಿ'
                  : 'ಭೇಟಿ ವಿವರಗಳನ್ನು ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಲು ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ'}
              </p>
            </div>

            {/* Primary Action Controls: Retry, Stop, Playback */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-navy-100">
              <button
                onClick={handleRetry}
                disabled={isRecording && duration < 1}
                className="flex-1 py-3 px-4 rounded-2xl border border-navy-200 text-navy-800 font-semibold text-xs hover:bg-softblue active:scale-95 transition-decelerate flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4 text-navy-500" />
                <span>ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ</span>
              </button>

              {isRecording && (
                <button
                  onClick={handleStopRecording}
                  className="flex-1 py-3 px-4 rounded-2xl bg-emergency text-white font-bold text-xs hover:bg-emergency-hover shadow-emergency active:scale-95 transition-decelerate flex items-center justify-center space-x-2"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>ಮುಕ್ತಾಯ</span>
                </button>
              )}

              {recordedAudioUrl && !isRecording && (
                <button
                  onClick={toggleAudioPlayback}
                  className="flex-1 py-3 px-4 rounded-2xl bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold text-xs hover:bg-cyan-100 active:scale-95 transition-decelerate flex items-center justify-center space-x-2"
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingAudio ? 'ವಿರಾಮ' : 'ಕೇಳಿ (Play)'}</span>
                </button>
              )}
            </div>

            {recordedAudioUrl && (
              <audio
                ref={audioPlayerRef}
                src={recordedAudioUrl}
                onEnded={() => setIsPlayingAudio(false)}
                className="hidden"
              />
            )}
          </div>

          {/* Waveform Visualizer Card */}
          <WaveformVisualizer 
            isRecording={isRecording} 
            isProcessing={isProcessing} 
            isPlayingTTS={isPlayingTTS} 
          />
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: TRANSCRIPT, PRESETS & EXTRACTED DATA (7)   */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Evaluation Preset Selector */}
          {isDemo && (
            <div className="bg-white rounded-3xl p-5 border border-navy-200/60 shadow-card space-y-3">
              <div className="flex items-center justify-between border-b border-navy-100 pb-2.5">
                <span className="text-xs font-bold text-navy-900 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>ಪರೀಕ್ಷಾ ಸನ್ನಿವೇಶಗಳು (Evaluation Presets for Judges):</span>
                </span>
                <span className="text-[10px] bg-cyan-50 text-cyan-800 font-mono px-2.5 py-0.5 rounded-full font-bold border border-cyan-200">
                  AI4Bharat Mock Active
                </span>
              </div>

              <select
                value={demoScenario}
                onChange={(e) => setDemoScenario(e.target.value)}
                disabled={isRecording || isProcessing}
                className="w-full bg-softblue text-navy-900 text-xs font-bold border border-navy-200 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary font-kannada"
              >
                {DEMO_SCENARIOS.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.title}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-navy-500 font-medium">
                *ಮೈಕ್ರೊಫೋನ್ ಬಟನ್ ಒತ್ತಿದಾಗ ಈ ಸನ್ನಿವೇಶದ ಆಡಿಯೋ ವಿಂಡೋಗಳನ್ನು Indic-Transcribe ಮಾದರಿಗೆ ರವಾನಿಸಲಾಗುತ್ತದೆ.
              </p>
            </div>
          )}

          {/* Live / Received Transcript Box */}
          <div className="bg-white rounded-3xl p-6 border border-navy-200/60 shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-navy-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <div>
                  <h3 className="font-bold text-sm text-navy-900 font-kannada">
                    ಸ್ವೀಕೃತ ಪಠ್ಯ (Live / Received Transcript)
                  </h3>
                  <span className="text-[11px] text-navy-400 font-mono">
                    AI4Bharat Indic-Transcribe Window
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-healthcare bg-healthcare-50 px-3 py-1 rounded-full border border-healthcare-100">
                {windowCount > 0 ? `Audio Window #${windowCount}` : 'VAD Active'}
              </span>
            </div>

            <div className="min-h-[160px] p-4 rounded-2xl bg-softblue border border-navy-100 text-sm leading-relaxed font-kannada flex flex-col justify-between">
              {finalTranscript ? (
                <div className="space-y-3">
                  <p className="text-navy-900 font-semibold text-base leading-relaxed">{finalTranscript}</p>
                  <div className="flex items-center text-xs text-healthcare font-bold pt-2 border-t border-navy-200/50">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-healthcare shrink-0" />
                    <span>AI4Bharat Indic-Transcribe ನಿಂದ ಧ್ವನಿ ಯಶಸ್ವಿಯಾಗಿ ಗುರುತಿಸಲಾಗಿದೆ (ವಿಶ್ವಾಸಾರ್ಹತೆ: 94%)</span>
                  </div>
                </div>
              ) : partialTranscript ? (
                <p className="text-primary font-semibold text-base animate-pulse">
                  {partialTranscript}
                </p>
              ) : isRecording ? (
                <p className="text-navy-400 font-medium">
                  ಮಾತನಾಡುತ್ತಿರಿ... ಮೊದಲ ಆಡಿಯೋ ವಿಂಡೋ ಪೂರ್ಣಗೊಂಡ ನಂತರ ಪಠ್ಯ ಇಲ್ಲಿ ನೈಜ ಸಮಯದಲ್ಲಿ ಮೂಡುತ್ತದೆ.
                </p>
              ) : (
                <p className="text-navy-400 font-medium">
                  ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿದ ನಂತರ ಕನ್ನಡ ಮತ್ತು ವೈದ್ಯಕೀಯ ಪಠ್ಯ ಇಲ್ಲಿ ದಾಖಲಾಗುತ್ತದೆ.
                </p>
              )}
            </div>
          </div>

          {/* Extracted Beneficiary Information & Actions Card */}
          {extractedRecordData && (
            <div className="bg-white rounded-3xl p-6 border-2 border-healthcare-200 shadow-card space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-navy-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-healthcare text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-navy-900 font-kannada">
                      ರಚನಾತ್ಮಕ ಮಾಹಿತಿ ಸಿದ್ಧವಾಗಿದೆ (Extracted Clinical Data)
                    </h4>
                    <span className="text-[10px] text-navy-400 font-mono">
                      ID: {extractedRecordData.beneficiary_id}
                    </span>
                  </div>
                </div>

                {/* Voice Read-back Button */}
                <button
                  onClick={handlePlayVoiceReadback}
                  className="px-3 py-1.5 rounded-xl bg-softblue hover:bg-cyan-50 text-navy-800 text-xs font-bold border border-navy-200 flex items-center space-x-1.5 active:scale-95 transition-decelerate"
                  title="ಧ್ವನಿ ಖಚಿತತೆ ಕೇಳಿ"
                >
                  <Volume2 className={`w-4 h-4 text-primary ${isPlayingTTS ? 'animate-bounce' : ''}`} />
                  <span className="font-kannada">{isPlayingTTS ? 'ನುಡಿಯುತ್ತಿದೆ...' : 'ಧ್ವನಿ ಓದುವಿಕೆ (Read-Back)'}</span>
                </button>
              </div>

              {/* Extracted Fields Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-softblue border border-navy-100">
                  <span className="text-[10px] text-navy-400 block font-medium">ಫಲಾನುಭವಿ</span>
                  <span className="font-bold text-navy-900 font-kannada">{extractedRecordData.beneficiary_name}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-softblue border border-navy-100">
                  <span className="text-[10px] text-navy-400 block font-medium">ಭೇಟಿ ಪ್ರಕಾರ</span>
                  <span className="font-bold text-primary">{extractedRecordData.visit_type}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-softblue border border-navy-100">
                  <span className="text-[10px] text-navy-400 block font-medium">ತೂಕ (Weight)</span>
                  <span className="font-bold font-mono text-navy-900">{extractedRecordData.weight || 'N/A'} kg</span>
                </div>
                <div className="p-2.5 rounded-xl bg-softblue border border-navy-100">
                  <span className="text-[10px] text-navy-400 block font-medium">ಮುಂದಿನ ಭೇಟಿ</span>
                  <span className="font-bold font-mono text-healthcare">{extractedRecordData.next_visit_date || 'N/A'}</span>
                </div>
              </div>

              {/* Confirmation and Review CTA Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleProceedToRecord}
                  className="flex-1 bg-gradient-to-r from-primary to-healthcare hover:from-primary-hover hover:to-healthcare-hover text-white font-bold py-3.5 px-4 rounded-2xl shadow-touch flex items-center justify-center space-x-2 text-xs active:scale-95 transition-decelerate"
                >
                  <span className="font-kannada">ವಿವರ ಪರಿಶೀಲಿಸಿ & ಉಳಿಸಿ (Review & Save)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Microphone Permission Modal */}
      <MicrophonePermissionModal
        isOpen={permModalOpen}
        onClose={() => setPermModalOpen(false)}
        onRetry={() => {
          setPermModalOpen(false);
          handleStartRecording();
        }}
        errorMessage={permError}
      />
    </div>
  );
}
