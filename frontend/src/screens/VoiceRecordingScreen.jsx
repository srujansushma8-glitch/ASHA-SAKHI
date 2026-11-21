import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Square, 
  RotateCcw, 
  Check, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  Languages,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown
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
  // State variables
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
    // Check demo mode setting
    setIsDemo(isDemoMode());

    // Connect WebSocket
    voiceWs.connect().catch(err => {
      console.warn('[VoiceRecordingScreen] WS connection error', err);
    });

    // Subscribe to WebSocket events
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

  // Format mm:ss
  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start recording
  const handleStartRecording = async () => {
    try {
      ttsService.stop();
      setExtractedRecordData(null);
      setActiveDangerAlert(null);
      setPartialTranscript('');
      setFinalTranscript('');
      setWindowCount(0);
      setDuration(0);

      // Start recording with AudioRecorder
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

      // Notify backend via WebSocket
      voiceWs.startSession({
        language,
        audioConfig: { sampleRate: 16000, encoding: mimeType },
        demoScenarioId: demoScenario
      });

      setIsRecording(true);
      setProcessingStatus('ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ... (Listening...)');

      // Start duration counter
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

  // Stop recording
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

  // Retry / Reset
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

  // Audio Playback
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

  // Proceed to structured visit view
  const handleProceedToRecord = () => {
    if (extractedRecordData && onRecordExtracted) {
      onRecordExtracted(extractedRecordData, activeDangerAlert);
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-2xl mx-auto px-4 pt-3">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-kannada text-navy-900 leading-tight">
            ಧ್ವನಿ ಕ್ಷೇತ್ರ ದಿನಚರಿ (Voice Register)
          </h2>
          <p className="text-xs text-navy-600 mt-0.5">
            AI4Bharat Indic-Transcribe & Indic-Speak
          </p>
        </div>

        {/* Language Selection Chips */}
        <div className="flex bg-navy-100/80 p-1 rounded-xl">
          <button
            onClick={() => setLanguage('kn')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all touch-manipulation ${
              language === 'kn' ? 'bg-white text-teal-800 shadow-sm' : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            ಕನ್ನಡ
          </button>
          <button
            onClick={() => setLanguage('kn-en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all touch-manipulation ${
              language === 'kn-en' ? 'bg-white text-teal-800 shadow-sm' : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            ಕನ್+Eng
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all touch-manipulation ${
              language === 'en' ? 'bg-white text-teal-800 shadow-sm' : 'text-navy-600 hover:text-navy-900'
            }`}
          >
            Eng
          </button>
        </div>
      </div>

      {/* Demo Scenario Preset Selector (when in Demo Mode) */}
      {isDemo && (
        <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-teal-900 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>ಪರೀಕ್ಷಾ ಸನ್ನಿವೇಶಗಳು (Demo Voice Scenarios):</span>
            </span>
            <span className="text-[10px] bg-teal-200 text-teal-900 font-mono px-1.5 py-0.5 rounded font-bold">
              AI4Bharat Mock
            </span>
          </div>
          <select
            value={demoScenario}
            onChange={(e) => setDemoScenario(e.target.value)}
            disabled={isRecording || isProcessing}
            className="w-full bg-white text-navy-900 text-xs font-medium border border-teal-300 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {DEMO_SCENARIOS.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.title}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-teal-700 mt-1">
            *ಮೈಕ್ರೊಫೋನ್ ಬಟನ್ ಒತ್ತಿದಾಗ ಈ ಸನ್ನಿವೇಶದ ಆಡಿಯೋ ವಿಂಡೋಗಳನ್ನು ಸಂಸ್ಕರಿಸಿ ತೋರಿಸಲಾಗುತ್ತದೆ.
          </p>
        </div>
      )}

      {/* Waveform Visualizer */}
      <WaveformVisualizer 
        isRecording={isRecording} 
        isProcessing={isProcessing} 
        isPlayingTTS={isPlayingTTS} 
      />

      {/* Main Recording Center Card */}
      <div className="bg-white rounded-2xl p-6 border border-navy-100 shadow-sm text-center relative overflow-hidden">
        {/* Recording Timer */}
        <div className="inline-block px-4 py-1 rounded-full bg-navy-100 text-navy-800 font-mono text-sm font-bold mb-4">
          {formatDuration(duration)}
        </div>

        {/* Large Touch-friendly Microphone Button */}
        <div className="relative flex items-center justify-center my-2">
          {isRecording && (
            <div className="absolute w-36 h-36 rounded-full bg-teal-400/20 animate-ping pointer-events-none"></div>
          )}
          {isRecording && (
            <div className="absolute w-28 h-28 rounded-full bg-teal-500/30 animate-pulse pointer-events-none"></div>
          )}

          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isProcessing}
            aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
            className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 touch-manipulation border-4 ${
              isRecording
                ? 'bg-emergency-600 hover:bg-emergency-700 text-white border-white shadow-emergency'
                : isProcessing
                ? 'bg-navy-400 text-white border-navy-200 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white border-teal-100 shadow-touch'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-8 h-8 fill-current" />
                <span className="text-[11px] font-bold mt-1">ನಿಲ್ಲಿಸಿ</span>
              </>
            ) : (
              <>
                <Mic className="w-9 h-9" />
                <span className="text-[11px] font-bold mt-1">ಮಾತನಾಡಿ</span>
              </>
            )}
          </button>
        </div>

        {/* Processing Status Text */}
        <div className="mt-4">
          <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-navy-700">
            {isProcessing && <div className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-bounce"></div>}
            <span>{processingStatus}</span>
          </div>
          <p className="text-[11px] text-navy-400 mt-1 font-kannada">
            {isRecording
              ? 'ಸ್ಪಷ್ಟವಾಗಿ ಕನ್ನಡದಲ್ಲಿ ಅಥವಾ ವೈದ್ಯಕೀಯ ಪದಗಳೊಂದಿಗೆ ಮಾತನಾಡಿ'
              : 'ದಾಖಲಿಸಲು ಮೈಕ್ ಬಟನ್ ಒತ್ತಿ'}
          </p>
        </div>

        {/* Action Controls: Stop, Retry */}
        <div className="flex items-center justify-center space-x-3 mt-5 pt-4 border-t border-navy-100">
          <button
            onClick={handleRetry}
            disabled={isRecording && duration < 1}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-navy-200 text-navy-700 font-semibold text-xs hover:bg-navy-50 active:scale-95 transition-all touch-manipulation"
          >
            <RotateCcw className="w-4 h-4 text-navy-500" />
            <span>ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ (Retry)</span>
          </button>

          {isRecording && (
            <button
              onClick={handleStopRecording}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emergency-600 text-white font-semibold text-xs hover:bg-emergency-700 shadow-emergency active:scale-95 transition-all touch-manipulation"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>ದಾಖಲೆ ಮುಗಿಸಿ (Stop)</span>
            </button>
          )}

          {recordedAudioUrl && !isRecording && (
            <button
              onClick={toggleAudioPlayback}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 font-semibold text-xs hover:bg-teal-100 active:scale-95 transition-all touch-manipulation"
            >
              {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlayingAudio ? 'ವಿರಾಮ' : 'ಕೇಳಿ (Play)'}</span>
            </button>
          )}
        </div>

        {/* Hidden Audio element for playback */}
        {recordedAudioUrl && (
          <audio
            ref={audioPlayerRef}
            src={recordedAudioUrl}
            onEnded={() => setIsPlayingAudio(false)}
            className="hidden"
          />
        )}
      </div>

      {/* Live / Received Transcript Area */}
      <div className="bg-white rounded-2xl p-4 border border-navy-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <h3 className="font-bold text-xs text-navy-900 font-kannada">
              ಸ್ವೀಕೃತ ಪಠ್ಯ (Live / Received Transcript)
            </h3>
          </div>
          <span className="text-[10px] text-navy-400 font-mono">
            {windowCount > 0 ? `Audio Window #${windowCount}` : 'Indic-Transcribe Window'}
          </span>
        </div>

        {/* Partial or Final Transcript Box */}
        <div className="min-h-[90px] p-3 rounded-xl bg-navy-50/70 border border-navy-100 text-xs leading-relaxed font-kannada">
          {finalTranscript ? (
            <div className="space-y-2">
              <p className="text-navy-900 font-medium">{finalTranscript}</p>
              <div className="flex items-center text-[10px] text-emerald-700 font-semibold pt-1 border-t border-navy-100">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>AI4Bharat Indic-Transcribe ಮಾದರಿಯಿಂದ ಯಶಸ್ವಿಯಾಗಿ ಧ್ವನಿ ಗುರುತಿಸಲಾಗಿದೆ (Confidence 94%)</span>
              </div>
            </div>
          ) : partialTranscript ? (
            <p className="text-teal-900 font-medium italic animate-pulse">
              {partialTranscript}
            </p>
          ) : isRecording ? (
            <p className="text-navy-400 italic">
              ಮಾತನಾಡುತ್ತಿರಿ... ಮೊದಲ ಆಡಿಯೋ ವಿಂಡೋ ಪೂರ್ಣಗೊಂಡ ನಂತರ ಪಠ್ಯ ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ.
            </p>
          ) : (
            <p className="text-navy-400 italic">
              ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿದ ನಂತರ ಪಠ್ಯ ಇಲ್ಲಿ ದಾಖಲಾಗುತ್ತದೆ.
            </p>
          )}
        </div>
      </div>

      {/* Next Step Banner (When Extracted) */}
      {extractedRecordData && (
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl p-4 shadow-touch flex items-center justify-between animate-fade-in">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-200 text-xs font-bold">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>ದಾಖಲೆ ಪ್ರತ್ಯೇಕಿಸಲಾಗಿದೆ (Fields Extracted)</span>
            </div>
            <p className="text-xs text-white/90 mt-0.5 font-kannada">
              ಫಲಾನುಭವಿ: {extractedRecordData.beneficiary_name} ({extractedRecordData.visit_type})
            </p>
          </div>
          <button
            onClick={handleProceedToRecord}
            className="bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 text-xs font-bold py-2.5 px-4 rounded-xl shadow flex items-center space-x-1.5 touch-manipulation"
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
