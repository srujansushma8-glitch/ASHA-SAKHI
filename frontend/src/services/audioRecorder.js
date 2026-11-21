/**
 * Web Audio API & MediaRecorder Service for ASHA Voice Field Register
 * - Requests microphone permissions with explicit error taxonomy
 * - Applies echoCancellation, noiseSuppression, autoGainControl
 * - Feeds real-time AnalyserNode for canvas waveform rendering
 * - Emits chunked audio buffers for AI4Bharat Indic-Transcribe processing windows
 */

class AudioRecorderService {
  constructor() {
    this.mediaRecorder = null;
    this.audioContext = null;
    this.analyser = null;
    this.sourceNode = null;
    this.stream = null;
    this.audioChunks = [];
    this.recordedBlob = null;
    this.recordedUrl = null;
    this.isRecording = false;
    this.onChunkCallback = null;
    this.onStateChangeCallback = null;
    this.chunkIndex = 0;
    this.chunkInterval = 1000; // 1-second chunks for audio window processing
  }

  /**
   * Check if browser supports required audio APIs
   */
  isSupported() {
    return Boolean(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      (window.MediaRecorder || window.AudioContext || window.webkitAudioContext)
    );
  }

  /**
   * Request microphone permission explicitly with optimal constraints
   */
  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error('BROWSER_UNSUPPORTED: Web Audio or MediaRecorder is not supported in this browser.');
    }

    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Optimal for speech recognition models
          channelCount: 1
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // Immediately stop track after test permission check if not recording yet
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('PERMISSION_DENIED: Microphone access was blocked by the user or browser.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('NO_DEVICE: No microphone detected on this mobile device.');
      } else {
        throw new Error(`MIC_ERROR: ${err.message || 'Unable to access microphone'}`);
      }
    }
  }

  /**
   * Start recording session with live AudioContext analyzer and MediaRecorder chunker
   */
  async startRecording({ onChunk, onStateChange, timeslice = 1000 } = {}) {
    if (this.isRecording) {
      console.warn('[AudioRecorder] Already recording');
      return;
    }

    this.onChunkCallback = onChunk;
    this.onStateChangeCallback = onStateChange;
    this.audioChunks = [];
    this.chunkIndex = 0;
    this.recordedBlob = null;
    if (this.recordedUrl) {
      URL.revokeObjectURL(this.recordedUrl);
      this.recordedUrl = null;
    }

    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Setup Web Audio API Analyser for live visualizer
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);
      this.sourceNode.connect(this.analyser);

      // Determine best supported mimeType
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = ''; // Let browser choose default
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      this.mediaRecorder = new MediaRecorder(this.stream, options);

      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
          this.chunkIndex += 1;

          // Convert slice to base64 for websocket transmission
          if (this.onChunkCallback) {
            try {
              const base64Data = await this.blobToBase64(event.data);
              this.onChunkCallback({
                chunkIndex: this.chunkIndex,
                size: event.data.size,
                base64: base64Data,
                mimeType: this.mediaRecorder.mimeType || 'audio/webm'
              });
            } catch (convErr) {
              console.error('[AudioRecorder] Failed converting chunk to base64', convErr);
            }
          }
        }
      };

      this.mediaRecorder.onstart = () => {
        this.isRecording = true;
        if (this.onStateChangeCallback) this.onStateChangeCallback('recording');
      };

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        this.recordedBlob = new Blob(this.audioChunks, {
          type: this.mediaRecorder?.mimeType || 'audio/webm'
        });
        this.recordedUrl = URL.createObjectURL(this.recordedBlob);
        if (this.onStateChangeCallback) this.onStateChangeCallback('stopped');
      };

      this.mediaRecorder.onerror = (err) => {
        console.error('[AudioRecorder] MediaRecorder error', err);
        this.isRecording = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback('error', err);
      };

      // Request data in chunks (timeslice) to feed windowed Indic-Transcribe processing
      this.mediaRecorder.start(timeslice);
      return {
        stream: this.stream,
        mimeType: this.mediaRecorder.mimeType
      };
    } catch (err) {
      this.cleanup();
      throw err;
    }
  }

  /**
   * Stop recording cleanly and release mic tracks
   */
  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        this.cleanup();
        resolve({ blob: this.recordedBlob, url: this.recordedUrl });
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        this.recordedBlob = new Blob(this.audioChunks, {
          type: this.mediaRecorder?.mimeType || 'audio/webm'
        });
        this.recordedUrl = URL.createObjectURL(this.recordedBlob);
        this.cleanup();
        if (this.onStateChangeCallback) this.onStateChangeCallback('stopped');
        resolve({ blob: this.recordedBlob, url: this.recordedUrl });
      };

      try {
        this.mediaRecorder.stop();
      } catch (err) {
        console.warn('[AudioRecorder] Error on stop()', err);
        this.cleanup();
        resolve({ blob: this.recordedBlob, url: this.recordedUrl });
      }
    });
  }

  /**
   * Get audio frequency / waveform data for canvas visualization
   */
  getWaveformData(dataArray) {
    if (!this.analyser) return null;
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  getFrequencyData(dataArray) {
    if (!this.analyser) return null;
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Cleanup tracks and audio nodes without discarding recorded blob
   */
  cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch (e) {}
      this.sourceNode = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch (e) {}
      this.audioContext = null;
    }
    this.analyser = null;
    this.isRecording = false;
  }

  /**
   * Convert blob to base64 string
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        // strip data:*/*;base64, header
        const base64 = typeof result === 'string' ? result.split(',')[1] : '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Reset all state
   */
  reset() {
    this.cleanup();
    if (this.recordedUrl) {
      URL.revokeObjectURL(this.recordedUrl);
      this.recordedUrl = null;
    }
    this.audioChunks = [];
    this.recordedBlob = null;
    this.chunkIndex = 0;
  }
}

export const audioRecorder = new AudioRecorderService();
