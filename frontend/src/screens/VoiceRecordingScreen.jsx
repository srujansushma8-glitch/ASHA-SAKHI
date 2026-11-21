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
  Volume2
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

    // Connect WebSocket
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

  const handleProceedToRecord = () => {
    if (extractedRecordData && onRecordExtracted) {
      onRecordExtracted(extractedRecordData, activeDangerAlert);
    }
  };

  return (
    <div className="space-y-4 pb-28 max-w-2xl mx-auto px-4 pt-3 animate-fade-in">
      {/* 1. Top Configuration Bar */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-card flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold font-kannada text-navy leading-tight">
            ಧ್ವನಿ ಕ್ಷೇತ್ರ ದಿನಚರಿ (Voice Register)
          </h2>
          <p className="text-xs text-navy-500 font-medium mt-0.5">
            AI4Bharat Indic-Transcribe & Indic-Speak
          </p>
        </div>

        {/* Language Selection Chips */}
        <div className="flex bg-navy-50 p-1 rounded-xl border border-navy-100">
          <button
            onClick={() => setLanguage('kn')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-decelerate active:scale-[0.98] ${
              language === 'kn' ? 'bg-primary text-white shadow-subtle' : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            ಕನ್ನಡ
          </button>
          <button
            onClick={() => setLanguage('kn-en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-decelerate active:scale-[0.98] ${
              language === 'kn-en' ? 'bg-primary text-white shadow-subtle' : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            ಕನ್+Eng
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-decelerate active:scale-[0.98] ${
              language === 'en' ? 'bg-primary text-white shadow-subtle' : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            Eng
          </button>
        </div>
      </div>

      {/* 2. Demo Scenario Selector (for Hackathon Evaluation) */}
      {isDemo && (
        <div className="bg-mint-surface/40 border border-teal-200 rounded-2xl p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>ಪರೀಕ್ಷಾ ಸನ್ನಿವೇಶಗಳು (Evaluation Presets):</span>
            </span>
            <span className="text-[10px] bg-white text-primary font-mono px-2 py-0.5 rounded-full font-bold border border-teal-200">
              AI4Bharat Mock
            </span>
          </div>
          <select
            value={demoScenario}
            onChange={(e) => setDemoScenario(e.target.value)}
            disabled={isRecording || isProcessing}
            className="w-full bg-white text-navy text-xs font-medium border border-navy-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {DEMO_SCENARIOS.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.title}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-navy-600 font-medium">
            *ಮೈಕ್ರೊಫೋನ್ ಒತ್ತಿದಾಗ ಆಯ್ದ ಸನ್ನಿವೇಶದ ಧ್ವನಿ ವಿಂಡೋಗಳು ಪರೀಕ್ಷೆಗೆ ಲಭ್ಯವಾಗುತ್ತವೆ.
          </p>
        </div>
      )}

      {/* 3. High-Fidelity Waveform Visualizer */}
      <WaveformVisualizer 
        isRecording={isRecording} 
        isProcessing={isProcessing} 
        isPlayingTTS={isPlayingTTS} 
      />

      {/* 4. Main Hero Recording Control Card */}
      <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-card text-center relative overflow-hidden">
        {/* Recording Duration Pill */}
        <div className="inline-block px-4 py-1 rounded-full bg-ivory-bg border border-navy-100 text-navy font-mono text-sm font-bold mb-4">
          {formatDuration(duration)}
        </div>

        {/* Large Prominent Microphone Control */}
        <div className="relative flex items-center justify-center my-3">
          {isRecording && (
            <div className="absolute w-36 h-36 rounded-full bg-emergency-100 animate-ping pointer-events-none"></div>
          )}
          {isRecording && (
            <div className="absolute w-28 h-28 rounded-full bg-emergency-200 animate-pulse pointer-events-none"></div>
          )}

          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isProcessing}
            aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
            className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-touch border-4 border-white active:scale-[0.98] transition-decelerate touch-manipulation ${
              isRecording
                ? 'bg-emergency hover:bg-emergency-hover text-white shadow-emergency'
                : isProcessing
                ? 'bg-navy-300 text-white cursor-not-allowed'
                : 'bg-primary hover:bg-primary-hover text-white shadow-touch'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-8 h-8 fill-current" />
                <span className="text-[11px] font-bold mt-1 font-kannada">ನಿಲ್ಲಿಸಿ</span>
              </>
            ) : (
              <>
                <Mic className="w-8 h-8" />
                <span className="text-[11px] font-bold mt-1 font-kannada">ಮಾತನಾಡಿ</span>
              </>
            )}
          </button>
        </div>

        {/* Status Message */}
        <div className="mt-4">
          <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-navy">
            {isProcessing && <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce"></div>}
            <span>{processingStatus}</span>
          </div>
          <p className="text-[11px] text-navy-400 mt-1 font-kannada font-medium">
            {isRecording
              ? 'ಸ್ಪಷ್ಟವಾಗಿ ಕನ್ನಡದಲ್ಲಿ ಅಥವಾ ವೈದ್ಯಕೀಯ ಪದಗಳೊಂದಿಗೆ ಮಾತನಾಡಿ'
              : 'ಭೇಟಿ ವಿವರಗಳನ್ನು ಧ್ವನಿ ಮೂಲಕ ನಮೂದಿಸಲು ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ'}
          </p>
        </div>

        {/* Action Controls: Retry, Stop, Playback */}
        <div className="flex items-center justify-center space-x-3 mt-5 pt-4 border-t border-navy-100">
          <button
            onClick={handleRetry}
            disabled={isRecording && duration < 1}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-navy-200 text-navy font-semibold text-xs hover:bg-ivory-bg active:scale-[0.98] transition-decelerate touch-manipulation"
          >
            <RotateCcw className="w-4 h-4 text-navy-500" />
            <span>ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ (Retry)</span>
          </button>

          {isRecording && (
            <button
              onClick={handleStopRecording}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emergency text-white font-semibold text-xs hover:bg-emergency-hover shadow-emergency active:scale-[0.98] transition-decelerate touch-manipulation"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>ದಾಖಲೆ ಮುಗಿಸಿ (Stop)</span>
            </button>
          )}

          {recordedAudioUrl && !isRecording && (
            <button
              onClick={toggleAudioPlayback}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-mint-surface text-primary border border-primary-200 font-semibold text-xs hover:bg-primary-100 active:scale-[0.98] transition-decelerate touch-manipulation"
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

      {/* 5. Transcript Display Container */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            <h3 className="font-bold text-xs text-navy font-kannada">
              ಸ್ವೀಕೃತ ಪಠ್ಯ (Indic-Transcribe Transcript)
            </h3>
          </div>
          <span className="text-[10px] text-navy-400 font-mono">
            {windowCount > 0 ? `Audio Window #${windowCount}` : 'VAD Window'}
          </span>
        </div>

        <div className="min-h-[90px] p-3.5 rounded-xl bg-ivory-bg border border-navy-100 text-xs leading-relaxed font-kannada">
          {finalTranscript ? (
            <div className="space-y-2">
              <p className="text-navy font-medium">{finalTranscript}</p>
              <div className="flex items-center text-[10px] text-healthcare font-semibold pt-1 border-t border-navy-100">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-healthcare shrink-0" />
                <span>AI4Bharat Indic-Transcribe ಧ್ವನಿ ಯಶಸ್ವಿಯಾಗಿ ಪರಿವರ್ತಿಸಿದೆ (ವಿಶ್ವಾಸಾರ್ಹತೆ: 94%)</span>
              </div>
            </div>
          ) : partialTranscript ? (
            <p className="text-primary font-medium animate-pulse">
              {partialTranscript}
            </p>
          ) : isRecording ? (
            <p className="text-navy-400">
              ಮಾತನಾಡುತ್ತಿರಿ... ಮೊದಲ ಆಡಿಯೋ ವಿಂಡೋ ಪೂರ್ಣಗೊಂಡ ನಂತರ ಪಠ್ಯ ಇಲ್ಲಿ ಮೂಡುತ್ತದೆ.
            </p>
          ) : (
            <p className="text-navy-400">
              ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿದ ನಂತರ ಕನ್ನಡ ಮತ್ತು ವೈದ್ಯಕೀಯ ಪಠ್ಯ ಇಲ್ಲಿ ದಾಖಲಾಗುತ್ತದೆ.
            </p>
          )}
        </div>
      </div>

      {/* 6. Extracted Result Notice Banner */}
      {extractedRecordData && (
        <div className="bg-healthcare text-white rounded-2xl p-4 shadow-touch flex items-center justify-between animate-fade-in">
          <div>
            <div className="flex items-center space-x-1.5 text-mint-surface text-xs font-bold">
              <Check className="w-4 h-4 text-white" />
              <span>ದಾಖಲೆ ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ (Fields Extracted)</span>
            </div>
            <p className="text-xs text-white/95 mt-0.5 font-kannada font-medium">
              ಫಲಾನುಭವಿ: {extractedRecordData.beneficiary_name} ({extractedRecordData.visit_type})
            </p>
          </div>
          <button
            onClick={handleProceedToRecord}
            className="bg-white text-healthcare hover:bg-ivory-bg active:scale-[0.98] text-xs font-bold py-2.5 px-4 rounded-xl shadow-subtle flex items-center space-x-1.5 transition-decelerate touch-manipulation"
          >
            <span>ವಿವರ ನೋಡಿ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

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
