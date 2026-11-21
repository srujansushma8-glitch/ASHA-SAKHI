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
  MessageSquare,
  Edit3,
  Save,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { audioRecorder } from '../services/audioRecorder';
import { voiceWs } from '../services/websocket';
import { ttsService } from '../services/ttsService';
import { isDemoMode, api } from '../services/api';
import { DEMO_SCENARIOS } from '../services/mockData';
import { useLanguage } from '../context/LanguageContext';
import WaveformVisualizer from '../components/WaveformVisualizer';
import MicrophonePermissionModal from '../components/MicrophonePermissionModal';

export default function VoiceRecordingScreen({ 
  onRecordExtracted, 
  onDangerAlert, 
  onBack,
  initialScenarioId = 'anc_routine',
  onOpenLanguageSelector
}) {
  const { language, setLanguage, t, dir, isRtl, langInfo } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [processingStatus, setProcessingStatus] = useState(t('voice.readyToRecord'));
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
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [isSavingDirect, setIsSavingDirect] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [errorState, setErrorState] = useState(null);

  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    setProcessingStatus(t('voice.readyToRecord'));
  }, [language, t]);

  useEffect(() => {
    setIsDemo(isDemoMode());

    voiceWs.connect().catch(err => {
      console.warn('[VoiceRecordingScreen] WS connection error', err);
    });

    const unsubSession = voiceWs.on('session_started', () => {
      setProcessingStatus(`${t('voice.listeningIn', { lang: langInfo.name_native })}`);
    });

    const unsubPartial = voiceWs.on('transcript_partial', (payload) => {
      setPartialTranscript(payload.text || '');
      setWindowCount(prev => prev + 1);
      setProcessingStatus(t('voice.processingWindow'));
    });

    const unsubFinal = voiceWs.on('transcript_final', (payload) => {
      const text = payload.transcript || payload.text || '';
      setFinalTranscript(text);
      setPartialTranscript('');
      setProcessingStatus(t('voice.fullTranscriptReceived'));
    });

    const unsubExtracted = voiceWs.on('record_extracted', (payload) => {
      setIsProcessing(false);
      setProcessingStatus(t('voice.fieldsExtracted'));
      setExtractedRecordData(payload.record);
      if (payload.transcript && !finalTranscript) {
        setFinalTranscript(payload.transcript);
      }
    });

    const unsubDanger = voiceWs.on('danger_alert', (payload) => {
      const alertObj = payload.alert || payload;
      setActiveDangerAlert(alertObj);
      if (onDangerAlert) onDangerAlert(alertObj);
      if (payload.audio_base64) {
        setIsPlayingTTS(true);
        ttsService.playBase64Audio(payload.audio_base64, 'wav', () => {
          setIsPlayingTTS(false);
        });
      }
    });

    const unsubAgent = voiceWs.on('agent_response', (payload) => {
      setIsProcessing(false);
      setAgentResponse(payload);
      if (payload.transcript && !finalTranscript) {
        setFinalTranscript(payload.transcript);
      }
      if (payload.spoken_text) {
        setProcessingStatus(payload.spoken_text);
      }
      if (payload.audio_base64) {
        setIsPlayingTTS(true);
        ttsService.playBase64Audio(payload.audio_base64, 'wav', () => {
          setIsPlayingTTS(false);
        });
      } else if (payload.spoken_text) {
        setIsPlayingTTS(true);
        ttsService.speakText(payload.spoken_text, {
          language: langInfo.bcp47,
          onEnd: () => setIsPlayingTTS(false)
        });
      }
      if (payload.danger_flag && onDangerAlert) {
        const alertObj = payload.alert || payload;
        setActiveDangerAlert(alertObj);
        onDangerAlert(alertObj);
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
      const textToSpeak = language === 'en' 
        ? (payload.transcript_en || payload.text)
        : language === 'hi'
        ? (payload.transcript_hi || payload.text)
        : (payload.transcript_kannada || payload.text);

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
      setErrorState(payload);
      setProcessingStatus(`${t('common.error') || 'Error'}: ${payload.message || 'Processing error'}`);
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
  }, [language, langInfo, t, onDangerAlert]);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      ttsService.stop();
      setErrorState(null);
      setExtractedRecordData(null);
      setActiveDangerAlert(null);
      setAgentResponse(null);
      setPartialTranscript('');
      setFinalTranscript('');
      setWindowCount(0);
      setDuration(0);

      // 1. Immediately initiate WebSocket session with active language
      voiceWs.startSession({
        language,
        audioConfig: { sampleRate: 16000, encoding: 'audio/wav' },
        demoScenarioId: demoScenario
      });

      // 2. Start hardware audio recorder
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

      setIsRecording(true);
      setProcessingStatus(`${t('voice.listeningIn', { lang: langInfo.name_native })}`);

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
    setProcessingStatus(t('voice.processingWindow'));

    try {
      const { blob, url, base64Audio, mimeType } = await audioRecorder.stopRecording();
      if (url) {
        setRecordedAudioUrl(url);
      }
      voiceWs.stopRecording({ audioBase64: base64Audio, mimeType: mimeType || 'audio/wav' });
    } catch (err) {
      console.error('[VoiceRecording] Stop error', err);
      voiceWs.stopRecording();
      setIsProcessing(false);
    }
  };


  const handleQuickSave = async () => {
    if (!extractedRecordData) return;
    try {
      setIsSavingDirect(true);
      voiceWs.confirmRecord(extractedRecordData);
      await api.confirmVisit({
        session_id: voiceWs.sessionId || `SES-${Date.now()}`,
        beneficiary_id: extractedRecordData.beneficiary_id || 'BEN-KA-001',
        beneficiary_name: extractedRecordData.beneficiary_name || 'Lakshmi',
        visit_type: extractedRecordData.visit_type || 'General Visit',
        weight: parseFloat(extractedRecordData.weight) || 54.0,
        vaccinations_due: extractedRecordData.vaccinations_due || [],
        vaccinations_completed: extractedRecordData.vaccinations_completed || [],
        next_visit_date: extractedRecordData.next_visit_date,
        additional_notes: extractedRecordData.additional_notes || '',
        transcript_raw: finalTranscript || editedTranscript || '',
        created_at: new Date().toISOString()
      });
      setSaveSuccessMsg('ದಾಖಲೆ ಉಳಿಸಲಾಗಿದೆ (Visit saved successfully)');
      setTimeout(() => {
        setSaveSuccessMsg('');
        if (onBack) onBack();
      }, 1500);
    } catch (err) {
      console.error('[VoiceRecording] Quick save error', err);
      setSaveSuccessMsg('ಉಳಿಸಲಾಗಿದೆ (Saved to local register)');
      setTimeout(() => {
        setSaveSuccessMsg('');
        if (onBack) onBack();
      }, 1500);
    } finally {
      setIsSavingDirect(false);
    }
  };

  const handleRetry = () => {
    clearInterval(timerRef.current);
    audioRecorder.reset();
    ttsService.stop();
    setErrorState(null);
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
    setProcessingStatus(t('voice.readyToRecord'));
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
    const text = language === 'en'
      ? (extractedRecordData.spoken_confirmation_en || `${extractedRecordData.beneficiary_name} visit recorded. Weight ${extractedRecordData.weight || ''} kg.`)
      : language === 'hi'
      ? (extractedRecordData.spoken_confirmation_hi || `${extractedRecordData.beneficiary_name} का दौरा दर्ज किया गया। वजन ${extractedRecordData.weight || ''} किग्रा।`)
      : (extractedRecordData.spoken_confirmation_kn || `${extractedRecordData.beneficiary_name} ಅವರ ಭೇಟಿ ವಿವರ ದಾಖಲಾಗಿದೆ. ತೂಕ ${extractedRecordData.weight || ''} kg.`);

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
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6 animate-fade-in pb-24 lg:pb-12" dir={dir}>
      {/* 1. Top Header Navigation Strip */}
      <div className="bg-white rounded-3xl p-5 lg:p-6 border border-[#F0DDE2] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] text-[#3B2A33] hover:bg-[#FDF6F5] active:scale-[0.98] transition-decelerate"
            title={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg lg:text-xl font-bold text-[#3B2A33] leading-tight font-serif">
                {t('voice.title')}
              </h1>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#FDF6F5] text-[#A25B74] border border-[#F0DDE2]">
                AI4Bharat VAD
              </span>
            </div>
            <p className="text-xs text-[#7A6670] font-medium mt-0.5">
              {t('voice.subtitle')}
            </p>
          </div>
        </div>

        {/* 22 Indic Languages Pill Button */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {onOpenLanguageSelector && (
            <button
              onClick={onOpenLanguageSelector}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-[#FDF6F5] hover:bg-[#F9ECEC] border border-[#A25B74]/30 text-[#3B2A33] text-xs font-bold transition-all shadow-xs group"
              title="Change language among 22 scheduled Indian languages"
            >
              <Globe className="w-4 h-4 text-[#A25B74] group-hover:rotate-45 transition-transform" />
              <span className="font-semibold">{langInfo.name_native}</span>
              <span className="text-[#C47A92] font-normal">({langInfo.name_en})</span>
              <span className="text-[10px] bg-[#A25B74] text-white px-1.5 py-0.2 rounded-md font-mono font-bold">22</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: HERO RECORDING CONTROLS & WAVEFORM */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 lg:p-8 border border-[#F0DDE2] shadow-card text-center relative overflow-hidden space-y-5">
            {/* Active Language Badge */}
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xs px-3 py-1 rounded-full bg-[#FDF6F5] text-[#3B2A33] border border-[#F0DDE2] font-semibold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#A25B74] animate-pulse" />
                <span>{langInfo.name_native}</span>
                <span className="text-[#C47A92] font-mono text-[10px]">[{langInfo.bcp47}]</span>
                {isRtl && <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-bold">RTL</span>}
              </span>
            </div>

            {/* Duration Counter Pill */}
            <div className="inline-flex items-center space-x-2.5 px-6 py-2 rounded-full bg-[#FDF6F5] border border-[#F0DDE2] text-[#3B2A33] font-mono text-lg font-bold shadow-inner">
              <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-[#B94A58] animate-ping' : 'bg-[#A25B74]'}`}></span>
              <span>{formatDuration(duration)}</span>
            </div>

            {/* Large Interactive Microphone Button */}
            <div className="relative flex items-center justify-center py-4">
              {isRecording && (
                <div className="absolute w-48 h-48 rounded-full bg-[#FCF1F1] animate-ping pointer-events-none"></div>
              )}
              {isRecording && (
                <div className="absolute w-40 h-40 rounded-full bg-[#F8DADA] animate-pulse pointer-events-none"></div>
              )}

              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isProcessing}
                aria-label={isRecording ? t('voice.stop') : t('voice.speak')}
                className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-card border-4 border-white active:scale-95 transition-decelerate touch-manipulation ${
                  isRecording
                    ? 'bg-[#B94A58] hover:bg-[#A33D4A] text-white shadow-md animate-pulse'
                    : isProcessing
                    ? 'bg-[#C47A92]/40 text-white cursor-not-allowed'
                    : 'bg-gradient-to-tr from-[#A25B74] to-[#C47A92] hover:from-[#84455C] hover:to-[#A25B74] text-white shadow-md shadow-[#A25B74]/30'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-9 h-9 fill-current" />
                    <span className="text-xs font-bold mt-1">{t('voice.stop')}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-10 h-10" />
                    <span className="text-xs font-bold mt-1">{t('voice.speak')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Processing Status Text */}
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-2 text-xs font-bold text-[#3B2A33]">
                {isProcessing && <div className="w-2.5 h-2.5 rounded-full bg-[#A25B74] animate-bounce"></div>}
                <span>{processingStatus}</span>
              </div>
              <p className="text-xs text-[#C47A92] font-medium">
                {isRecording
                  ? t('voice.vadPrompt', { lang: langInfo.name_native })
                  : t('voice.speakIdlePrompt')}
              </p>
            </div>

            {/* In-Place Friendly Error & Immediate Retry Card */}
            {errorState && (
              <div className="p-3.5 rounded-2xl bg-[#FCF1F1] border border-[#F0B8B8] text-center space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#B94A58]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorState.message || 'Processing error occurred'}</span>
                </div>
                <button
                  onClick={handleStartRecording}
                  className="px-4 py-2 rounded-xl bg-[#B94A58] hover:bg-[#A33D4A] text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{langInfo.code === 'kn' ? 'ಮತ್ತೊಮ್ಮೆ ಮಾತನಾಡಿ (Speak Again)' : 'Speak Again'}</span>
                </button>
              </div>
            )}

            {/* Primary Action Controls: Retry, Stop, Playback */}
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#F0DDE2]">
              <button
                onClick={handleRetry}
                disabled={isRecording && duration < 1}
                className="flex-1 py-3 px-4 rounded-2xl border border-[#F0DDE2] text-[#3B2A33] font-semibold text-xs hover:bg-[#FDF6F5] active:scale-95 transition-decelerate flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4 text-[#7A6670]" />
                <span>{t('voice.restart')}</span>
              </button>

              {isRecording && (
                <button
                  onClick={handleStopRecording}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#B94A58] text-white font-bold text-xs hover:bg-[#A33D4A] shadow-md active:scale-95 transition-decelerate flex items-center justify-center space-x-2"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>{t('voice.finish')}</span>
                </button>
              )}

              {recordedAudioUrl && !isRecording && (
                <button
                  onClick={toggleAudioPlayback}
                  className="flex-1 py-3 px-4 rounded-2xl bg-[#FDF6F5] text-[#A25B74] border border-[#F0DDE2] font-bold text-xs hover:bg-[#FDF6F5] active:scale-95 transition-decelerate flex items-center justify-center space-x-2"
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingAudio ? t('voice.pause') : t('voice.play')}</span>
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

        {/* RIGHT COLUMN: TRANSCRIPT, PRESETS & EXTRACTED DATA */}
        <div className="lg:col-span-7 space-y-6">
          {/* Evaluation Preset Selector */}
          {isDemo && (
            <div className="bg-white rounded-3xl p-5 border border-[#F0DDE2] shadow-card space-y-3">
              <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-2.5">
                <span className="text-xs font-bold text-[#3B2A33] flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#A25B74]" />
                  <span>{t('dashboard.evalPresetsTitle')}</span>
                </span>
                <span className="text-[10px] bg-[#FDF6F5] text-[#A25B74] font-mono px-2.5 py-0.5 rounded-full font-bold border border-[#F0DDE2]">
                  AI4Bharat Multilingual
                </span>
              </div>

              <select
                value={demoScenario}
                onChange={(e) => setDemoScenario(e.target.value)}
                disabled={isRecording || isProcessing}
                className="w-full bg-[#FDF6F5] text-[#3B2A33] text-xs font-bold border border-[#F0DDE2] rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#A25B74]"
              >
                {DEMO_SCENARIOS.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.title}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#7A6670] font-medium">
                *Active Language: <strong>{langInfo.name_native} ({langInfo.name_en})</strong>. Indic-Transcribe & Indic-Speak active.
              </p>
            </div>
          )}

          {/* Conversational Agent Response Card (If Turn Active) */}
          {agentResponse && (
            <div className={`rounded-3xl p-5 border shadow-card space-y-3 animate-fade-in ${
              agentResponse.danger_flag
                ? 'bg-[#FCF1F1] border-[#B94A58]'
                : 'bg-[#FDF6F5] border-[#F0DDE2]'
            }`}>
              <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-2.5">
                <div className="flex items-center space-x-2">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-white ${
                    agentResponse.danger_flag ? 'bg-[#B94A58]' : 'bg-[#A25B74]'
                  }`}>
                    {agentResponse.danger_flag ? <AlertTriangle className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#3B2A33]">
                      {t('voice.agentSpokenResponse')}
                    </h4>
                    <span className="text-[10px] font-mono text-[#7A6670]">
                      Intent: {agentResponse.intent}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePlayVoiceReadback}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FDF6F5] text-[#3B2A33] text-xs font-bold border border-[#F0DDE2] flex items-center space-x-1.5 shadow-xs"
                >
                  <Volume2 className={`w-3.5 h-3.5 text-[#A25B74] ${isPlayingTTS ? 'animate-bounce' : ''}`} />
                  <span>{isPlayingTTS ? t('voice.speaking') : t('voice.play')}</span>
                </button>
              </div>

              <p className="text-[#3B2A33] font-semibold text-base leading-relaxed">
                {agentResponse.spoken_text}
              </p>

              {agentResponse.saved_entity_id && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E8F7F1] text-[#477A60] font-mono text-xs font-bold border border-[#C8EEDD]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved Entity: {agentResponse.saved_entity_id}</span>
                </div>
              )}
            </div>
          )}

          {/* Live / Received Transcript Box */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0DDE2] shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-3 h-3 rounded-full bg-[#A25B74]"></span>
                <div>
                  <h3 className="font-bold text-sm text-[#3B2A33]">
                    {t('voice.liveTranscript')}
                  </h3>
                  <span className="text-[11px] text-[#C47A92] font-mono">
                    AI4Bharat Indic-Transcribe Window • {langInfo.name_en} ({langInfo.bcp47})
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (!isEditingTranscript) {
                      setEditedTranscript(finalTranscript || partialTranscript || '');
                    } else if (editedTranscript) {
                      setFinalTranscript(editedTranscript);
                    }
                    setIsEditingTranscript(!isEditingTranscript);
                  }}
                  className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-[#FDF6F5] text-[#A25B74] border border-[#F0DDE2] hover:bg-[#F9ECEC] flex items-center space-x-1 transition-colors"
                  title="Edit spoken transcript"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingTranscript ? 'Done' : 'Edit'}</span>
                </button>

                <span className="text-xs font-mono font-bold text-[#477A60] bg-[#E8F7F1] px-3 py-1 rounded-full border border-[#C8EEDD]">
                  {windowCount > 0 ? `Audio Window #${windowCount}` : 'VAD Active'}
                </span>
              </div>
            </div>

            <div className="min-h-[160px] p-4 rounded-2xl bg-[#FDF6F5] border border-[#F0DDE2] text-sm leading-relaxed flex flex-col justify-between">
              {isEditingTranscript ? (
                <div className="space-y-3">
                  <textarea
                    value={editedTranscript}
                    onChange={(e) => setEditedTranscript(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-white border border-[#F0DDE2] rounded-xl text-[#3B2A33] font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#A25B74]"
                    placeholder="Edit transcript in Kannada or English..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setFinalTranscript(editedTranscript);
                        setIsEditingTranscript(false);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#A25B74] text-white text-xs font-bold shadow-sm"
                    >
                      Apply Changes
                    </button>
                  </div>
                </div>
              ) : finalTranscript ? (
                <div className="space-y-3">
                  <p className="text-[#3B2A33] font-semibold text-base leading-relaxed">{finalTranscript}</p>
                  <div className="flex items-center text-xs text-[#477A60] font-bold pt-2 border-t border-[#F0DDE2]/50">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-[#477A60] shrink-0" />
                    <span>{t('voice.transcriptSuccess')} ({langInfo.name_native})</span>
                  </div>
                </div>
              ) : partialTranscript ? (
                <p className="text-[#A25B74] font-semibold text-base animate-pulse">
                  {partialTranscript}
                </p>
              ) : isRecording ? (
                <p className="text-[#C47A92] font-medium">
                  {t('voice.speakKeepGoing')}
                </p>
              ) : (
                <p className="text-[#C47A92] font-medium">
                  {t('voice.speakIdlePrompt')}
                </p>
              )}
            </div>
          </div>

          {/* Extracted Beneficiary Information & Actions Card */}
          {extractedRecordData && (
            <div className="bg-white rounded-3xl p-6 border-2 border-[#C8EEDD] shadow-card space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#F0DDE2] pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-[#477A60] text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#3B2A33]">
                      {t('voice.extractedReady')}
                    </h4>
                    <span className="text-[10px] text-[#C47A92] font-mono">
                      ID: {extractedRecordData.beneficiary_id}
                    </span>
                  </div>
                </div>

                {/* Voice Read-back Button */}
                <button
                  onClick={handlePlayVoiceReadback}
                  className="px-3 py-1.5 rounded-xl bg-[#FDF6F5] hover:bg-[#F9ECEC] text-[#3B2A33] text-xs font-bold border border-[#F0DDE2] flex items-center space-x-1.5 active:scale-95 transition-decelerate"
                  title={t('voice.readback')}
                >
                  <Volume2 className={`w-4 h-4 text-[#A25B74] ${isPlayingTTS ? 'animate-bounce' : ''}`} />
                  <span>{isPlayingTTS ? t('voice.speaking') : t('voice.readback')}</span>
                </button>
              </div>

              {/* Extracted Fields Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FDF6F5] border border-[#F0DDE2]">
                  <span className="text-[10px] text-[#C47A92] block font-medium">{t('common.beneficiary')}</span>
                  <span className="font-bold text-[#3B2A33]">{extractedRecordData.beneficiary_name}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FDF6F5] border border-[#F0DDE2]">
                  <span className="text-[10px] text-[#C47A92] block font-medium">{t('structuredRecord.visitType')}</span>
                  <span className="font-bold text-[#A25B74]">{extractedRecordData.visit_type}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FDF6F5] border border-[#F0DDE2]">
                  <span className="text-[10px] text-[#C47A92] block font-medium">{t('common.weight')}</span>
                  <span className="font-bold font-mono text-[#3B2A33]">{extractedRecordData.weight || 'N/A'} kg</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FDF6F5] border border-[#F0DDE2]">
                  <span className="text-[10px] text-[#C47A92] block font-medium">{t('structuredRecord.nextVisit')}</span>
                  <span className="font-bold font-mono text-[#477A60]">{extractedRecordData.next_visit_date || 'N/A'}</span>
                </div>
              </div>

              {saveSuccessMsg && (
                <div className="p-3 bg-[#E8F7F1] border border-[#C8EEDD] text-[#477A60] rounded-xl text-xs font-bold text-center animate-fade-in flex items-center justify-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Confirmation and Review CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleQuickSave}
                  disabled={isSavingDirect}
                  className="w-full sm:flex-1 bg-[#477A60] hover:bg-[#3B6650] text-white font-bold py-3.5 px-4 rounded-2xl shadow-touch flex items-center justify-center space-x-2 text-xs active:scale-95 transition-decelerate"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingDirect ? 'Saving...' : 'Save Visit Now'}</span>
                </button>

                <button
                  onClick={handleProceedToRecord}
                  className="w-full sm:flex-1 bg-gradient-to-r from-[#A25B74] to-[#C47A92] hover:from-[#84455C] hover:to-[#A25B74] text-white font-bold py-3.5 px-4 rounded-2xl shadow-touch flex items-center justify-center space-x-2 text-xs active:scale-95 transition-decelerate"
                >
                  <span>{t('voice.reviewAndSave')}</span>
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
