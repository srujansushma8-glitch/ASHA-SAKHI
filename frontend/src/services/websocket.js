/**
 * WebSocket Service for ASHA Voice Field Register
 * Manages /ws/voice connection and agreed event protocol:
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

const DEFAULT_WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/voice';

class VoiceWebSocketClient {
  constructor() {
    this.ws = null;
    this.sessionId = null;
    this.listeners = new Map();
    this.status = 'DISCONNECTED'; // DISCONNECTED, CONNECTING, CONNECTED, ERROR
    this.mockTimer = null;
    this.mockAudioWindows = [];
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
    // Also dispatch to a catch-all listener if needed
    const allSet = this.listeners.get('*');
    if (allSet) {
      allSet.forEach(cb => cb(eventName, payload));
    }
  }

  /**
   * Connect to backend /ws/voice WebSocket
   */
  connect(url = DEFAULT_WS_URL) {
    if (isDemoMode()) {
      this.status = 'CONNECTED';
      this.emit('connection_state', { status: 'CONNECTED', mode: 'demo' });
      return Promise.resolve();
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.status = 'CONNECTING';
      this.emit('connection_state', { status: 'CONNECTING', mode: 'live' });

      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.status = 'CONNECTED';
          this.emit('connection_state', { status: 'CONNECTED', mode: 'live' });
          resolve();
        };

        this.ws.onmessage = (messageEvent) => {
          try {
            const data = JSON.parse(messageEvent.data);
            const eventName = data.event || data.type;
            if (eventName) {
              this.emit(eventName, data);
            }
          } catch (err) {
            console.error('[WebSocket] Malformed message received', err);
          }
        };

        this.ws.onerror = (err) => {
          this.status = 'ERROR';
          this.emit('connection_state', { status: 'ERROR', error: 'WebSocket connection failed' });
          this.emit('error', { message: 'WebSocket connection error with backend server' });
          reject(err);
        };

        this.ws.onclose = () => {
          this.status = 'DISCONNECTED';
          this.emit('connection_state', { status: 'DISCONNECTED' });
        };
      } catch (err) {
        this.status = 'ERROR';
        this.emit('connection_state', { status: 'ERROR', error: err.message });
        reject(err);
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
    this.status = 'DISCONNECTED';
    this.emit('connection_state', { status: 'DISCONNECTED' });
  }

  /**
   * Send JSON payload to backend
   */
  send(event, data = {}) {
    const message = { event, session_id: this.sessionId, ...data };
    if (!isDemoMode() && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.log(`[WebSocket ${isDemoMode() ? 'DEMO' : 'OFFLINE'}] Sent:`, event, message);
    }
  }

  /**
   * Frontend Event: start_session
   */
  startSession({ language = 'en', audioConfig = {}, demoScenarioId = 'anc_routine' } = {}) {
    this.sessionId = `SES-${Date.now().toString().slice(-6)}`;
    this.sessionLanguage = language || 'en';

    // Set demo scenario if in demo mode
    this.currentDemoScenario = DEMO_SCENARIOS.find(s => s.id === demoScenarioId) || DEMO_SCENARIOS[0];

    const payload = {
      event: 'start_session',
      session_id: this.sessionId,
      language: language, // 'kn' | 'kn-en' | 'en'
      audio_config: {
        sample_rate: audioConfig.sampleRate || 16000,
        encoding: audioConfig.encoding || 'audio/webm',
        channels: 1
      }
    };

    if (isDemoMode()) {
      // Simulate session_started confirmation from AI4Bharat pipeline
      setTimeout(() => {
        this.emit('session_started', {
          session_id: this.sessionId,
          negotiated_config: payload.audio_config,
          model: 'AI4Bharat Indic-Transcribe (Kannada)',
          tts_engine: 'AI4Bharat Indic-Speak',
          mode: 'demo_simulation'
        });
      }, 150);
      return;
    }

    this.send('start_session', payload);
  }

  /**
   * Frontend Event: audio_chunk
   */
  sendAudioChunk({ chunkIndex, base64Audio, size, mimeType }) {
    if (!this.sessionId) {
      console.warn('[WebSocket] Cannot send chunk without an active session');
      return;
    }

    const payload = {
      event: 'audio_chunk',
      session_id: this.sessionId,
      chunk_index: chunkIndex,
      audio_data: base64Audio,
      size_bytes: size,
      format: mimeType
    };

    if (isDemoMode()) {
      // Indic-Transcribe processes completed audio windows rather than true streaming
      // Simulate window processing every 2 chunks
      if (chunkIndex % 2 === 0 && this.currentDemoScenario) {
        const fullText = this.sessionLanguage === 'kn'
          ? (this.currentDemoScenario.audio_transcript_kn || this.currentDemoScenario.audio_transcript_en_translation)
          : this.sessionLanguage === 'hi'
          ? (this.currentDemoScenario.audio_transcript_hi || this.currentDemoScenario.audio_transcript_en_translation)
          : (this.currentDemoScenario.audio_transcript_en_translation || this.currentDemoScenario.audio_transcript_kn);
        // Divide into windows
        const words = fullText.split(' ');
        const partialCount = Math.min(words.length, Math.floor((chunkIndex / 4) * words.length));
        if (partialCount > 0 && partialCount < words.length) {
          const partialText = words.slice(0, partialCount).join(' ') + '...';
          this.emit('transcript_partial', {
            session_id: this.sessionId,
            text: partialText,
            window_id: Math.floor(chunkIndex / 2),
            is_partial_window: true
          });
        }
      }
      return;
    }

    this.send('audio_chunk', payload);
  }

  /**
   * Frontend Event: stop_recording
   */
  stopRecording() {
    if (!this.sessionId) return;

    const payload = {
      event: 'stop_recording',
      session_id: this.sessionId
    };

    if (isDemoMode()) {
      this.clearMockTimers();
      const scenario = this.currentDemoScenario || DEMO_SCENARIOS[0];

      // Step 1: Indic-Transcribe final audio window processing
      this.mockTimer = setTimeout(() => {
        const finalTxt = this.sessionLanguage === 'kn'
          ? (scenario.audio_transcript_kn || scenario.audio_transcript_en_translation)
          : this.sessionLanguage === 'hi'
          ? (scenario.audio_transcript_hi || scenario.audio_transcript_en_translation)
          : (scenario.audio_transcript_en_translation || scenario.audio_transcript_kn);

        this.emit('transcript_final', {
          session_id: this.sessionId,
          text: finalTxt,
          text_translation_en: scenario.audio_transcript_en_translation,
          confidence: 0.94,
          model: `AI4Bharat Indic-Transcribe (${this.sessionLanguage.toUpperCase()})`
        });

        // Step 2: Information Extraction into Structured Clinical Visit Record
        setTimeout(() => {
          this.emit('record_extracted', {
            session_id: this.sessionId,
            record: scenario.extracted_record
          });

          // Step 3: Danger sign detection check
          if (scenario.isEmergency && scenario.danger_alert) {
            setTimeout(() => {
              this.emit('danger_alert', {
                session_id: this.sessionId,
                alert: scenario.danger_alert
              });
            }, 300);
          }

          // Step 4: Spoken readback confirmation (AI4Bharat Indic-Speak)
          setTimeout(() => {
            const spokenTxt = this.sessionLanguage === 'kn'
              ? (scenario.spoken_confirmation_kn || scenario.spoken_confirmation_en)
              : this.sessionLanguage === 'hi'
              ? (scenario.spoken_confirmation_hi || scenario.spoken_confirmation_en)
              : (scenario.spoken_confirmation_en || scenario.spoken_confirmation_kn);

            this.emit('confirmation_audio', {
              session_id: this.sessionId,
              transcript_kannada: spokenTxt,
              transcript: spokenTxt,
              audio_url: null,
              duration_sec: 5.2
            });
          }, 800);

        }, 700);
      }, 600);
      return;
    }

    this.send('stop_recording', payload);
  }

  /**
   * Frontend Event: confirm_record
   */
  confirmRecord(visitRecord) {
    const payload = {
      event: 'confirm_record',
      session_id: this.sessionId,
      visit_record: visitRecord
    };

    if (isDemoMode()) {
      setTimeout(() => {
        this.emit('visit_saved', {
          session_id: this.sessionId,
          visit_id: `VIS-DEMO-${Date.now().toString().slice(-4)}`,
          status: 'Confirmed',
          timestamp: new Date().toISOString()
        });
      }, 400);
      return;
    }

    this.send('confirm_record', payload);
  }

  /**
   * Frontend Event: correct_field
   */
  correctField({ fieldName, newValue, correctionText, correctionAudio }) {
    const payload = {
      event: 'correct_field',
      session_id: this.sessionId,
      field_name: fieldName,
      new_value: newValue,
      correction_text: correctionText,
      correction_audio: correctionAudio
    };

    if (isDemoMode()) {
      setTimeout(() => {
        this.emit('record_updated', {
          session_id: this.sessionId,
          updated_field: fieldName,
          new_value: newValue,
          message: this.sessionLanguage === 'kn'
            ? `ಕ್ಷೇತ್ರ '${fieldName}' ಅನ್ನು ಯಶಸ್ವಿಯಾಗಿ ತಿದ್ದಲಾಗಿದೆ.`
            : this.sessionLanguage === 'hi'
            ? `फ़ील्ड '${fieldName}' को सफलतापूर्वक संशोधित किया गया।`
            : `Field '${fieldName}' updated successfully.`
        });
      }, 350);
      return;
    }

    this.send('correct_field', payload);
  }

  /**
   * Frontend Event: interrupt_audio
   */
  interruptAudio() {
    const payload = {
      event: 'interrupt_audio',
      session_id: this.sessionId
    };

    if (isDemoMode()) {
      console.log('[WebSocket DEMO] Spoken audio readback interrupted by ASHA worker');
      return;
    }

    this.send('interrupt_audio', payload);
  }

  clearMockTimers() {
    if (this.mockTimer) {
      clearTimeout(this.mockTimer);
      this.mockTimer = null;
    }
  }
}

export const voiceWs = new VoiceWebSocketClient();
