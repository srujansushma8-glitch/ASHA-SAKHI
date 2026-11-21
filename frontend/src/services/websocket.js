/**
 * WebSocket Service for ASHA Voice Field Register
 * Manages /ws/voice duplex streaming connection and agreed event protocol:
 *
 * Frontend -> Backend Events:
 * - start_session
 * - audio_chunk
 * - stop_recording
 * - confirm_record
 * - correct_field
 * - interrupt_audio
 *
 * Backend -> Frontend Events:
 * - session_started
 * - transcript_partial
 * - transcript_final
 * - record_extracted
 * - record_updated
 * - confirmation_audio
 * - danger_alert
 * - visit_saved
 * - error
 */

import { isDemoMode } from './api';
import { DEMO_SCENARIOS } from './mockData';

const getWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `ws://${host}:8000/ws/voice`;
};

class VoiceWebSocketClient {
  constructor() {
    this.ws = null;
    this.sessionId = null;
    this.sessionLanguage = 'kn';
    this.listeners = new Map();
    this.status = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, CONNECTED, ERROR
    this.isLive = false;
    this.mockTimer = null;
    this.currentDemoScenario = null;
  }

  /**
   * Subscribe to specific backend-to-frontend event
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);

    // Return unbind function
    return () => {
      const set = this.listeners.get(eventName);
      if (set) {
        set.delete(callback);
      }
    };
  }

  /**
   * Emit event internally to subscribers
   */
  emit(eventName, payload) {
    const set = this.listeners.get(eventName);
    if (set) {
      set.forEach(cb => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[WebSocket] Listener error for ${eventName}`, err);
        }
      });
    }
    const allSet = this.listeners.get('*');
    if (allSet) {
      allSet.forEach(cb => cb(eventName, payload));
    }
  }

  /**
   * Connect to backend /ws/voice WebSocket with automatic fallback to offline simulation
   */
  connect(url = getWsUrl()) {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.status = 'CONNECTING';
      this.emit('connection_state', { status: 'CONNECTING', mode: 'live' });

      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.status = 'CONNECTED';
          this.isLive = true;
          this.emit('connection_state', { status: 'CONNECTED', mode: 'live', url });
          console.log('[WebSocket] Connected live to backend:', url);
          resolve();
        };

        this.ws.onmessage = (messageEvent) => {
          try {
            const data = JSON.parse(messageEvent.data);
            const eventName = data.event || data.type;
            if (eventName) {
              this.emit(eventName, data.data || data);
            }
          } catch (err) {
            console.error('[WebSocket] Malformed message received', err);
          }
        };

        this.ws.onerror = (err) => {
          console.warn('[WebSocket] Live connection unavailable, activating local fallback.', err);
          this.isLive = false;
          this.status = 'CONNECTED';
          this.emit('connection_state', { status: 'CONNECTED', mode: 'demo_fallback' });
          resolve();
        };

        this.ws.onclose = () => {
          this.isLive = false;
          this.status = 'DISCONNECTED';
          this.emit('connection_state', { status: 'DISCONNECTED' });
        };
      } catch (err) {
        console.warn('[WebSocket] Exception during connect, using local fallback:', err.message);
        this.isLive = false;
        this.status = 'CONNECTED';
        this.emit('connection_state', { status: 'CONNECTED', mode: 'demo_fallback' });
        resolve();
      }
    });
  }

  /**
   * Disconnect cleanly
   */
  disconnect() {
    this.clearMockTimers();
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }
    this.isLive = false;
    this.status = 'DISCONNECTED';
    this.emit('connection_state', { status: 'DISCONNECTED' });
  }

  /**
   * Send JSON payload to backend or execute fallback
   */
  send(event, data = {}) {
    const message = {
      event,
      session_id: this.sessionId,
      data: data.data || data,
      ...data
    };

    if (this.isLive && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.log(`[WebSocket ${this.isLive ? 'LIVE' : 'LOCAL'}] Handled:`, event);
    }
  }

  /**
   * Frontend Event: start_session
   */
  startSession({ language = 'kn', audioConfig = {}, demoScenarioId = 'anc_routine' } = {}) {
    this.sessionId = `SES-${Date.now().toString().slice(-6)}`;
    this.sessionLanguage = language || 'kn';
    this.currentDemoScenario = DEMO_SCENARIOS.find(s => s.id === demoScenarioId) || DEMO_SCENARIOS[0];

    const payload = {
      event: 'start_session',
      session_id: this.sessionId,
      language: this.sessionLanguage,
      data: {
        language: this.sessionLanguage,
        audio_config: {
          sample_rate: audioConfig.sampleRate || 16000,
          encoding: audioConfig.encoding || 'audio/webm',
          channels: 1
        }
      }
    };

    if (this.isLive && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send('start_session', payload);
    } else {
      setTimeout(() => {
        this.emit('session_started', {
          session_id: this.sessionId,
          status: 'ready',
          language: this.sessionLanguage,
          model: 'AI4Bharat Indic-Transcribe (Offline Mode)'
        });
      }, 100);
    }
  }

  /**
   * Frontend Event: audio_chunk
   */
  sendAudioChunk(chunkData = {}) {
    if (!this.sessionId) {
      this.sessionId = `SES-${Date.now().toString().slice(-6)}`;
    }

    const chunkIndex = chunkData.chunkIndex ?? 0;
    const base64Audio = chunkData.base64Audio || chunkData.base64 || chunkData.audio_data || '';
    const size = chunkData.size || (base64Audio ? base64Audio.length : 0);
    const mimeType = chunkData.mimeType || 'audio/wav';

    if (!base64Audio) return;

    const payload = {
      event: 'audio_chunk',
      session_id: this.sessionId,
      chunk_index: chunkIndex,
      audio_data: base64Audio,
      data: {
        audio_base64: base64Audio,
        chunk_index: chunkIndex,
        size_bytes: size,
        format: mimeType
      }
    };

    if (this.isLive && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send('audio_chunk', payload);
    } else {
      // Local preview partial transcript
      if (chunkIndex % 2 === 0 && this.currentDemoScenario) {
        const fullText = this.sessionLanguage === 'kn'
          ? (this.currentDemoScenario.audio_transcript_kn || this.currentDemoScenario.audio_transcript_en_translation)
          : (this.currentDemoScenario.audio_transcript_en_translation || this.currentDemoScenario.audio_transcript_kn);
        const words = (fullText || '').split(' ');
        const partialCount = Math.min(words.length, Math.floor((chunkIndex / 4) * words.length));
        if (partialCount > 0 && partialCount < words.length) {
          this.emit('transcript_partial', {
            session_id: this.sessionId,
            text: words.slice(0, partialCount).join(' ') + '...',
            window_id: Math.floor(chunkIndex / 2),
            is_partial_window: true
          });
        }
      }
    }
  }

  /**
   * Frontend Event: stop_recording
   */
  stopRecording(options = {}) {
    if (!this.sessionId) {
      this.sessionId = `SES-${Date.now().toString().slice(-6)}`;
    }

    const audioBase64 = options.audioBase64 || options.audio_base64 || '';
    const mimeType = options.mimeType || options.format || 'audio/wav';

    const payload = {
      event: 'stop_recording',
      session_id: this.sessionId,
      audio_base64: audioBase64,
      data: {
        audio_base64: audioBase64,
        format: mimeType
      }
    };

    if (this.isLive && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send('stop_recording', payload);
    } else {
      this.clearMockTimers();
      const scenario = this.currentDemoScenario || DEMO_SCENARIOS[0];

      this.mockTimer = setTimeout(() => {
        const finalTxt = this.sessionLanguage === 'kn'
          ? (scenario.audio_transcript_kn || scenario.audio_transcript_en_translation)
          : (scenario.audio_transcript_en_translation || scenario.audio_transcript_kn);

        this.emit('transcript_final', {
          session_id: this.sessionId,
          text: finalTxt,
          language: this.sessionLanguage,
          latency_ms: 115.0,
          is_mock: true,
          model_name: 'AI4Bharat Indic-Transcribe (Demo Fallback)'
        });

        setTimeout(() => {
          this.emit('record_extracted', {
            session_id: this.sessionId,
            record: scenario.extracted_record,
            requires_clarification: false,
            danger_flag: Boolean(scenario.isEmergency)
          });

          if (scenario.isEmergency && scenario.danger_alert) {
            setTimeout(() => {
              this.emit('danger_alert', {
                session_id: this.sessionId,
                alert: scenario.danger_alert,
                severity: 'CRITICAL',
                instruction_kn: 'ಈ ಫಲಾನುಭವಿಗೆ ತಕ್ಷಣ PHC ಗೆ ರೆಫರ್ ಮಾಡಿ.',
                instruction_en: 'Refer to Primary Health Centre (PHC) immediately.'
              });
            }, 300);
          }

          setTimeout(() => {
            const spokenTxt = this.sessionLanguage === 'kn'
              ? (scenario.spoken_confirmation_kn || scenario.spoken_confirmation_en)
              : (scenario.spoken_confirmation_en || scenario.spoken_confirmation_kn);

            this.emit('confirmation_audio', {
              session_id: this.sessionId,
              text: spokenTxt,
              language: this.sessionLanguage,
              duration_sec: 4.8
            });
          }, 600);

        }, 500);
      }, 500);
    }
  }

  /**
   * Frontend Event: confirm_record
   */
  confirmRecord(visitRecord) {
    const payload = {
      event: 'confirm_record',
      session_id: this.sessionId,
      data: { visit_record: visitRecord }
    };

    if (this.isLive && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send('confirm_record', payload);
    } else {
      setTimeout(() => {
        this.emit('visit_saved', {
          session_id: this.sessionId,
          visit: {
            id: `VIS-DEMO-${Date.now().toString().slice(-4)}`,
            ...visitRecord,
            status: 'Confirmed'
          },
          confirmation_text: this.sessionLanguage === 'kn' ? 'ದಾಖಲೆ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ.' : 'Record saved successfully.',
          timestamp: new Date().toISOString()
        });
      }, 300);
    }
  }

  /**
   * Frontend Event: correct_field
   */
  correctField({ fieldName, newValue, correctionText, correctionAudio }) {
    const payload = {
      event: 'correct_field',
      session_id: this.sessionId,
      data: {
        field_name: fieldName,
        new_value: newValue,
        correction_text: correctionText,
        correction_audio: correctionAudio
      }
    };

    if (this.isLive && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send('correct_field', payload);
    } else {
      setTimeout(() => {
        this.emit('record_updated', {
          session_id: this.sessionId,
          field_name: fieldName,
          new_value: newValue,
          message: this.sessionLanguage === 'kn'
            ? `ಕ್ಷೇತ್ರ '${fieldName}' ಅನ್ನು ಯಶಸ್ವಿಯಾಗಿ ತಿದ್ದಲಾಗಿದೆ.`
            : `Field '${fieldName}' updated successfully.`
        });
      }, 250);
    }
  }

  /**
   * Frontend Event: interrupt_audio
   */
  interruptAudio() {
    if (this.isLive && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send('interrupt_audio', { event: 'interrupt_audio', session_id: this.sessionId });
    }
  }

  clearMockTimers() {
    if (this.mockTimer) {
      clearTimeout(this.mockTimer);
      this.mockTimer = null;
    }
  }
}

export const voiceWs = new VoiceWebSocketClient();
