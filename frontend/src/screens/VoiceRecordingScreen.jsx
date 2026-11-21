import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  Square, 
  RotateCcw, 
  Play, 
  Pause, 
  Check, 
  AlertTriangle, 
  Volume2, 
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  Info,
  Globe,
  Radio,
  MessageSquare
} from 'lucide-react';
import { audioRecorder } from '../services/audioRecorder';
import { voiceWs } from '../services/websocket';
import { ttsService } from '../services/ttsService';
import { isDemoMode } from '../services/api';
import { DEMO_SCENARIOS } from '../services/mockData';
import { getLanguageByCode, INDIC_LANGUAGES } from '../services/languages';
import WaveformVisualizer from '../components/WaveformVisualizer';
import MicrophonePermissionModal from '../components/MicrophonePermissionModal';

export default function VoiceRecordingScreen({ 
  onRecordExtracted, 
  onDangerAlert, 
  onBack,
  initialScenarioId = 'anc_routine',
  currentLanguage = 'kn',
  onOpenLanguageSelector
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [language, setLanguage] = useState(currentLanguage);
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
  const [agentResponse, setAgentResponse] = useState(null);

  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const langInfo = getLanguageByCode(language);
  const isRtl = langInfo.dir === 'rtl';

  useEffect(() => {
    setLanguage(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    setIsDemo(isDemoMode());

    voiceWs.connect().catch(err => {
      console.warn('[VoiceRecordingScreen] WS connection error', err);
    });

    const unsubSession = voiceWs.on('session_started', (payload) => {
      setProcessingStatus(`ಧ್ವನಿ ಸ್ವೀಕರಿಸಲಾಗುತ್ತಿದೆ... (Listening in ${langInfo.name_en})...`);
    });

    const unsubPartial = voiceWs.on('transcript_partial', (payload) => {
      setPartialTranscript(payload.text || '');
      setWindowCount(prev => prev + 1);
      setProcessingStatus(`Indic-Transcribe ಆಡಿಯೋ ವಿಂಡೋ #${payload.window_id || 1} ಸಂಸ್ಕರಣೆ...`);
    });

    const unsubFinal = voiceWs.on('transcript_final', (payload) => {
      setFinalTranscript(payload.text || '');
      setPartialTranscript('');
      setProcessingStatus(`AI4Bharat ಮಾದರಿಯಿಂದ ಪೂರ್ಣ ಪಠ್ಯ ಪಡೆಯಲಾಗಿದೆ (${langInfo.name_native}).`);
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

    const unsubAgent = voiceWs.on('agent_response', (payload) => {
      setAgentResponse(payload);
      if (payload.spoken_text) {
        setProcessingStatus(payload.spoken_text);
      }
      if (payload.danger_flag && payload.alert && onDangerAlert) {
        setActiveDangerAlert(payload.alert);
        onDangerAlert(payload.alert);
      }
    });

    const unsubTTSAudio = voiceWs.on('tts_audio', (payload) => {
      if (payload.audio_b64) {
        setIsPlayingTTS(true);
        ttsService.playBase64Audio(payload.audio_b64, payload.audio_format || 'wav', () => {
          setIsPlayingTTS(false);
        });
      } else if (payload.text) {
        setIsPlayingTTS(true);
        ttsService.speakText(payload.text, {
          language: langInfo.bcp47,
          onEnd: () => setIsPlayingTTS(false)
        });
      }
    });

    const unsubTTS = voiceWs.on('confirmation_audio', (payload) => {
      const textToSpeak = payload.transcript_kannada || payload.text;
      if (textToSpeak) {
        setIsPlayingTTS(true);
        ttsService.speakText(textToSpeak, {
          language: langInfo.bcp47,
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
      unsubAgent();
      unsubTTSAudio();
      unsubTTS();
      unsubError();
      clearInterval(timerRef.current);
      audioRecorder.cleanup();
      ttsService.stop();
    };
  }, [language]);

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
      setAgentResponse(null);
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
      setProcessingStatus(`ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ (${langInfo.name_native})...`);

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
    setProcessingStatus(`ಆಡಿಯೋ ವಿಂಡೋಗಳನ್ನು ಸಂಸ್ಕರಿಸಲಾಗುತ್ತಿದೆ (${langInfo.name_en} Indic-Transcribe)...`);

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
    setAgentResponse(null);
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
    if (agentResponse?.spoken_text) {
      setIsPlayingTTS(true);
      ttsService.speakText(agentResponse.spoken_text, {
        language: langInfo.bcp47,
        onEnd: () => setIsPlayingTTS(false)
      });
      return;
    }

    if (!extractedRecordData) return;
    const text = extractedRecordData.spoken_confirmation_kn || 
      `${extractedRecordData.beneficiary_name} ಅವರ ಭೇಟಿ ವಿವರ ದಾಖಲಾಗಿದೆ. ತೂಕ ${extractedRecordData.weight || ''} kg.`;
    setIsPlayingTTS(true);
    ttsService.speakText(text, {
      language: langInfo.bcp47,
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
      <div className="bg-white  rounded-3xl p-5 lg:p-6 border border-[#F0DDE2] dark:border-[#F0DDE2] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-[#FDF6F5]  border border-[#F0DDE2] dark:border-[#F0DDE2] text-[#3B2A33]  hover:bg-[#FDF6F5] active:scale-[0.98] transition-decelerate"
            title="ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ (Back to Home)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg lg:text-xl font-bold font-kannada text-[#3B2A33]  leading-tight">
                ಧ್ವನಿ ಕ್ಷೇತ್ರ ದಿನಚರಿ (Multilingual Voice Assistant)
              </h1>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#FDF6F5] text-[#A25B74] border border-[#F0DDE2]">
                AI4Bharat VAD
              </span>
            </div>
            <p className="text-xs text-[#7A6670]  font-medium mt-0.5">
              Indic-Transcribe ASR & Indic-Speak TTS across 22 Scheduled Indian Languages
            </p>
          </div>
        </div>

        {/* 22 Indic Languages Pill Button */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {onOpenLanguageSelector && (
            <button
              onClick={onOpenLanguageSelector}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-[#FDF6F5]  hover:bg-cream-100 hover:bg-[#FDF6F5] border border-primary/30 text-[#3B2A33]  text-xs font-bold transition-all shadow-xs group"
              title="Change language among 22 scheduled Indian languages"
            >
              <Globe className="w-4 h-4 text-[#A25B74] group-hover:rotate-45 transition-transform" />
              <span className="font-semibold">{langInfo.name_native}</span>
              <span className="text-[#C47A92]  font-normal">({langInfo.name_en})</span>
              <span className="text-[10px] bg-[#A25B74] text-white px-1.5 py-0.2 rounded-md font-mono font-bold">22</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: HERO RECORDING CONTROLS & WAVEFORM (Span 5) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Hero Recording Card */}
          <div className="bg-white  rounded-3xl p-6 lg:p-8 border border-[#F0DDE2] dark:border-[#F0DDE2] shadow-card text-center relative overflow-hidden space-y-5">
            {/* Active Language Badge */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xs px-3 py-1 rounded-full bg-[#FDF6F5]  text-[#3B2A33]  border border-[#F0DDE2] dark:border-[#F0DDE2] font-semibold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-secondary animate-pulse" />
                <span dir={isRtl ? 'rtl' : 'ltr'}>{langInfo.name_native}</span>
                <span className="text-[#C47A92] font-mono text-[10px]">[{langInfo.bcp47}]</span>
                {isRtl && <span className="text-[9px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-1 rounded font-bold">RTL</span>}
              </span>
            </div>

            {/* Duration Counter Pill */}
            <div className="inline-flex items-center space-x-2.5 px-6 py-2 rounded-full bg-[#FDF6F5]  border border-[#F0DDE2] dark:border-[#F0DDE2] text-[#3B2A33]  font-mono text-lg font-bold shadow-inner">
              <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-[#B94A58] animate-ping' : 'bg-[#A25B74]'}`}></span>
              <span>{formatDuration(duration)}</span>
            </div>

            {/* Large Interactive Microphone Button */}
            <div className="relative flex items-center justify-center py-4">
              {isRecording && (
                <div className="absolute w-48 h-48 rounded-full bg-[#FCF1F1] dark:bg-[#B94A58]/20 animate-ping pointer-events-none"></div>
              )}
              {isRecording && (
                <div className="absolute w-40 h-40 rounded-full bg-[#F8DADA] dark:bg-[#B94A58]/30 animate-pulse pointer-events-none"></div>
              )}

              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isProcessing}
                aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
                className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-card border-4 border-white dark:border-[#F0DDE2] active:scale-95 transition-decelerate touch-manipulation ${
                  isRecording
                    ? 'bg-[#B94A58] hover:bg-[#A33D4A] text-white shadow-emergency animate-pulse'
                    : isProcessing
                    ? 'bg-[#C47A92]/40 text-white cursor-not-allowed'
                    : 'bg-gradient-to-tr from-[#A25B74] to-[#C47A92] hover:from-[#84455C] hover:to-[#A25B74] text-white shadow-md shadow-[#A25B74]/30'
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
              <div className="flex items-center justify-center space-x-2 text-xs font-bold text-[#3B2A33] ">
                {isProcessing && <div className="w-2.5 h-2.5 rounded-full bg-[#A25B74] animate-bounce"></div>}
                <span dir={isRtl ? 'rtl' : 'ltr'}>{processingStatus}</span>
              </div>
              <p className="text-xs text-[#C47A92]  font-medium" dir={isRtl ? 'rtl' : 'ltr'}>
                {isRecording
                  ? `ಸ್ಪಷ್ಟವಾಗಿ ${langInfo.name_native} ದಲ್ಲಿ ಅಥವಾ ವೈದ್ಯಕೀಯ ಪದಗಳೊಂದಿಗೆ ಮಾತನಾಡಿ`
                  : `Speak in ${langInfo.name_en} (${langInfo.name_native}) to record visits, register beneficiaries, or ask health questions.`}
              </p>
            </div>

            {/* Primary Action Controls: Retry, Stop, Playback */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#F0DDE2] dark:border-[#F0DDE2]">
              <button
                onClick={handleRetry}
                disabled={isRecording && duration < 1}
                className="flex-1 py-3 px-4 rounded-2xl border border-[#F0DDE2] dark:border-[#F0DDE2] text-[#3B2A33]  font-semibold text-xs hover:bg-[#FDF6F5] hover:bg-[#FDF6F5] active:scale-95 transition-decelerate flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4 text-[#7A6670]" />
                <span>ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ</span>
              </button>

              {isRecording && (
                <button
                  onClick={handleStopRecording}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#B94A58] text-white font-bold text-xs hover:bg-[#B94A58]-hover shadow-emergency active:scale-95 transition-decelerate flex items-center justify-center space-x-2"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>ಮುಕ್ತಾಯ</span>
                </button>
              )}

              {recordedAudioUrl && !isRecording && (
                <button
                  onClick={toggleAudioPlayback}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#FDF6F5] text-[#A25B74] border border-[#F0DDE2] font-bold text-xs hover:bg-[#FDF6F5] active:scale-95 transition-decelerate flex items-center justify-center space-x-2"
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
            <div className="bg-white  rounded-3xl p-5 border border-[#F0DDE2] dark:border-[#F0DDE2] shadow-card space-y-3">
              <div className="flex items-center justify-between border-b border-[#F0DDE2] dark:border-[#F0DDE2] pb-2.5">
                <span className="text-xs font-bold text-[#3B2A33]  flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#A25B74]" />
                  <span>ಪರೀಕ್ಷಾ ಸನ್ನಿವೇಶಗಳು (Evaluation Presets for Judges):</span>
                </span>
                <span className="text-[10px] bg-[#FDF6F5] text-[#A25B74] font-mono px-2.5 py-0.5 rounded-full font-bold border border-[#F0DDE2]">
                  AI4Bharat Multilingual
                </span>
              </div>

              <select
                value={demoScenario}
                onChange={(e) => setDemoScenario(e.target.value)}
                disabled={isRecording || isProcessing}
                className="w-full bg-[#FDF6F5]  text-[#3B2A33]  text-xs font-bold border border-[#F0DDE2] dark:border-[#F0DDE2] rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#A25B74] font-kannada"
              >
                {DEMO_SCENARIOS.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.title}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#7A6670]  font-medium">
                *Selected language: <strong>{langInfo.name_native} ({langInfo.name_en})</strong>. Indic-Transcribe & Indic-Speak active.
              </p>
            </div>
          )}

          {/* AI4Bharat Conversational Agent Response Card (If Turn Active) */}
          {agentResponse && (
            <div className={`rounded-3xl p-5 border shadow-card space-y-3 animate-fade-in ${
              agentResponse.danger_flag
                ? 'bg-[#FCF1F1]/80 dark:bg-[#B94A58]/20 border-emergency-300'
                : 'bg-gradient-to-r from-mint-50/80 via-white to-softblue  border-mint-200 dark:border-[#F0DDE2]'
            }`}>
              <div className="flex items-center justify-between border-b border-[#F0DDE2] dark:border-[#F0DDE2] pb-2.5">
                <div className="flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-white ${
                    agentResponse.danger_flag ? 'bg-[#B94A58]' : 'bg-[#A25B74]'
                  }`}>
                    {agentResponse.danger_flag ? <AlertTriangle className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#3B2A33] ">
                      ಆಶಾ ಸಖಿ ಉತ್ತರ (Agent Spoken Response)
                    </h4>
                    <span className="text-[10px] font-mono text-[#7A6670] ">
                      Intent: {agentResponse.intent}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePlayVoiceReadback}
                  className="px-3 py-1.5 rounded-xl bg-white  hover:bg-mint-100 hover:bg-[#FDF6F5] text-[#3B2A33]  text-xs font-bold border border-[#F0DDE2] dark:border-[#F0DDE2] flex items-center space-x-1.5 shadow-xs"
                >
                  <Volume2 className={`w-3.5 h-3.5 text-[#A25B74] ${isPlayingTTS ? 'animate-bounce' : ''}`} />
                  <span>{isPlayingTTS ? 'ನುಡಿಯುತ್ತಿದೆ...' : 'ಕೇಳಿ (Play Voice)'}</span>
                </button>
              </div>

              <p 
                className="text-[#3B2A33]  font-semibold text-base leading-relaxed"
                dir={isRtl ? 'rtl' : 'ltr'}
              >
                {agentResponse.spoken_text}
              </p>

              {agentResponse.saved_entity_id && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E8F7F1] dark:bg-[#477A60]/20 text-[#477A60] font-mono text-xs font-bold border border-[#C8EEDD]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved Entity: {agentResponse.saved_entity_id}</span>
                </div>
              )}
            </div>
          )}

          {/* Live / Received Transcript Box */}
          <div className="bg-white  rounded-3xl p-6 border border-[#F0DDE2] dark:border-[#F0DDE2] shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] dark:border-[#F0DDE2] pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-[#A25B74]"></span>
                <div>
                  <h3 className="font-bold text-sm text-[#3B2A33]  font-kannada">
                    ಸ್ವೀಕೃತ ಪಠ್ಯ (Live / Received Transcript)
                  </h3>
                  <span className="text-[11px] text-[#C47A92] font-mono">
                    AI4Bharat Indic-Transcribe Window • {langInfo.name_en} ({langInfo.bcp47})
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-[#477A60] bg-[#E8F7F1] dark:bg-[#477A60]/20 px-3 py-1 rounded-full border border-[#C8EEDD] dark:border-healthcare/30">
                {windowCount > 0 ? `Audio Window #${windowCount}` : 'VAD Active'}
              </span>
            </div>

            <div 
              className="min-h-[160px] p-4 rounded-2xl bg-[#FDF6F5]  border border-[#F0DDE2] dark:border-[#F0DDE2] text-sm leading-relaxed flex flex-col justify-between"
              dir={isRtl ? 'rtl' : 'ltr'}
            >
              {finalTranscript ? (
                <div className="space-y-3">
                  <p className="text-[#3B2A33]  font-semibold text-base leading-relaxed">{finalTranscript}</p>
                  <div className="flex items-center text-xs text-[#477A60] font-bold pt-2 border-t border-[#F0DDE2]/50 dark:border-[#F0DDE2]">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-[#477A60] shrink-0" />
                    <span>AI4Bharat Indic-Transcribe ನಿಂದ ಧ್ವನಿ ಯಶಸ್ವಿಯಾಗಿ ಗುರುತಿಸಲಾಗಿದೆ ({langInfo.name_native})</span>
                  </div>
                </div>
              ) : partialTranscript ? (
                <p className="text-[#A25B74] font-semibold text-base animate-pulse">
                  {partialTranscript}
                </p>
              ) : isRecording ? (
                <p className="text-[#C47A92]  font-medium">
                  ಮಾತನಾಡುತ್ತಿರಿ... ಮೊದಲ ಆಡಿಯೋ ವಿಂಡೋ ಪೂರ್ಣಗೊಂಡ ನಂತರ ಪಠ್ಯ ಇಲ್ಲಿ ನೈಜ ಸಮಯದಲ್ಲಿ ಮೂಡುತ್ತದೆ.
                </p>
              ) : (
                <p className="text-[#C47A92]  font-medium">
                  ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿದ ನಂತರ {langInfo.name_native} ಮತ್ತು ವೈದ್ಯಕೀಯ ಪಠ್ಯ ಇಲ್ಲಿ ದಾಖಲಾಗುತ್ತದೆ.
                </p>
              )}
            </div>
          </div>

          {/* Extracted Beneficiary Information & Actions Card */}
          {extractedRecordData && (
            <div className="bg-white  rounded-3xl p-6 border-2 border-[#C8EEDD] dark:border-healthcare-700 shadow-card space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#F0DDE2] dark:border-[#F0DDE2] pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#477A60] text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#3B2A33]  font-kannada">
                      ರಚನಾತ್ಮಕ ಮಾಹಿತಿ ಸಿದ್ಧವಾಗಿದೆ (Extracted Clinical Data)
                    </h4>
                    <span className="text-[10px] text-[#C47A92] font-mono">
                      ID: {extractedRecordData.beneficiary_id}
                    </span>
                  </div>
                </div>

                {/* Voice Read-back Button */}
                <button
                  onClick={handlePlayVoiceReadback}
                  className="px-3 py-1.5 rounded-xl bg-[#FDF6F5]  hover:bg-[#FDF6F5] hover:bg-[#FDF6F5] text-[#3B2A33]  text-xs font-bold border border-[#F0DDE2] dark:border-[#F0DDE2] flex items-center space-x-1.5 active:scale-95 transition-decelerate"
                  title="ಧ್ವನಿ ಖಚಿತತೆ ಕೇಳಿ"
                >
                  <Volume2 className={`w-4 h-4 text-[#A25B74] ${isPlayingTTS ? 'animate-bounce' : ''}`} />
                  <span className="font-kannada">{isPlayingTTS ? 'ನುಡಿಯುತ್ತಿದೆ...' : 'ಧ್ವನಿ ಓದುವಿಕೆ (Read-Back)'}</span>
                </button>
              </div>

              {/* Extracted Fields Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FDF6F5]  border border-[#F0DDE2] dark:border-[#F0DDE2]">
                  <span className="text-[10px] text-[#C47A92] block font-medium">ಫಲಾನುಭವಿ</span>
                  <span className="font-bold text-[#3B2A33]  font-kannada">{extractedRecordData.beneficiary_name}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FDF6F5]  border border-[#F0DDE2] dark:border-[#F0DDE2]">
                  <span className="text-[10px] text-[#C47A92] block font-medium">ಭೇಟಿ ಪ್ರಕಾರ</span>
                  <span className="font-bold text-[#A25B74]">{extractedRecordData.visit_type}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FDF6F5]  border border-[#F0DDE2] dark:border-[#F0DDE2]">
                  <span className="text-[10px] text-[#C47A92] block font-medium">ತೂಕ (Weight)</span>
                  <span className="font-bold font-mono text-[#3B2A33] ">{extractedRecordData.weight || 'N/A'} kg</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FDF6F5]  border border-[#F0DDE2] dark:border-[#F0DDE2]">
                  <span className="text-[10px] text-[#C47A92] block font-medium">ಮುಂದಿನ ಭೇಟಿ</span>
                  <span className="font-bold font-mono text-[#477A60]">{extractedRecordData.next_visit_date || 'N/A'}</span>
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
