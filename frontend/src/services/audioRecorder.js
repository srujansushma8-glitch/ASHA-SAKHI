/**
 * Web Audio API & MediaRecorder Service for ASHA Voice Field Register
 * - Requests microphone permissions with explicit error taxonomy
 * - Applies echoCancellation, noiseSuppression, autoGainControl
 * - Feeds real-time AnalyserNode for canvas waveform rendering
 * - Emits chunked audio buffers for AI4Bharat Indic-Transcribe processing windows
 * - Encodes 16kHz 16-bit Mono RIFF WAV audio for direct compatibility with ASR pipelines
 */

function encodeWav(samples, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length minus RIFF header (36 + data length)
  view.setUint32(4, 36 + samples.length * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * channels * bytesPerSample = sampleRate * 1 * 2)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channels * bytesPerSample = 1 * 2)
  view.setUint16(32, 2, true);
  // bits per sample (16-bit)
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, samples.length * 2, true);

  // write 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return buffer;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function downsampleBuffer(buffer, inputSampleRate, outputSampleRate = 16000) {
  if (inputSampleRate === outputSampleRate) return buffer;
  if (inputSampleRate < outputSampleRate) return buffer;
  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : buffer[offsetBuffer];
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

class AudioRecorderService {
  constructor() {
    this.mediaRecorder = null;
    this.audioContext = null;
    this.analyser = null;
    this.sourceNode = null;
    this.scriptNode = null;
    this.stream = null;
    this.audioChunks = [];
    this.pcmBuffers = [];
    this.recordedBlob = null;
    this.recordedUrl = null;
    this.isRecording = false;
    this.onChunkCallback = null;
    this.onStateChangeCallback = null;
    this.chunkIndex = 0;
    this.chunkInterval = 1000;
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
          sampleRate: 16000,
          channelCount: 1
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
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
   * Start recording session with live AudioContext analyzer and PCM audio capture
   */
  async startRecording({ onChunk, onStateChange, timeslice = 1000 } = {}) {
    if (this.isRecording) {
      console.warn('[AudioRecorder] Already recording');
      return;
    }

    this.onChunkCallback = onChunk;
    this.onStateChangeCallback = onStateChange;
    this.audioChunks = [];
    this.pcmBuffers = [];
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

      // Setup Web Audio API AudioContext for analysis and direct PCM capture
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

      // ScriptProcessor for PCM audio capture
      try {
        const bufferSize = 4096;
        this.scriptNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);
        this.scriptNode.onaudioprocess = (audioProcessingEvent) => {
          if (!this.isRecording) return;
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          this.pcmBuffers.push(new Float32Array(inputData));
        };
        this.sourceNode.connect(this.scriptNode);
        this.scriptNode.connect(this.audioContext.destination);
      } catch (procErr) {
        console.warn('[AudioRecorder] ScriptProcessor fallback warning:', procErr);
      }

      // Determine best supported mimeType for MediaRecorder
      let mimeType = 'audio/webm;codecs=opus';
      if (!window.MediaRecorder || !MediaRecorder.isTypeSupported(mimeType)) {
        if (window.MediaRecorder && MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (window.MediaRecorder && MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (window.MediaRecorder && MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = '';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      if (window.MediaRecorder) {
        this.mediaRecorder = new MediaRecorder(this.stream, options);

        this.mediaRecorder.ondataavailable = async (event) => {
          if (event.data && event.data.size > 0) {
            this.audioChunks.push(event.data);
            this.chunkIndex += 1;

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

        this.mediaRecorder.onerror = (err) => {
          console.error('[AudioRecorder] MediaRecorder error', err);
          this.isRecording = false;
          if (this.onStateChangeCallback) this.onStateChangeCallback('error', err);
        };

        this.mediaRecorder.start(timeslice);
      } else {
        this.isRecording = true;
        if (this.onStateChangeCallback) this.onStateChangeCallback('recording');
      }

      return {
        stream: this.stream,
        mimeType: this.mediaRecorder?.mimeType || 'audio/wav'
      };
    } catch (err) {
      this.cleanup();
      throw err;
    }
  }

  /**
   * Stop recording cleanly, synthesize standard 16kHz Mono WAV, and return base64 audio
   */
  async stopRecording() {
    this.isRecording = false;

    return new Promise((resolve) => {
      const finalizeAudio = async () => {
        try {
          let wavBlob = null;
          let base64Audio = '';

          // 1. Convert captured PCM buffers to 16kHz 16-bit Mono WAV
          if (this.pcmBuffers.length > 0) {
            const totalSamples = this.pcmBuffers.reduce((acc, b) => acc + b.length, 0);
            const mergedSamples = new Float32Array(totalSamples);
            let offset = 0;
            for (const b of this.pcmBuffers) {
              mergedSamples.set(b, offset);
              offset += b.length;
            }

            const inputSampleRate = this.audioContext?.sampleRate || 44100;
            const downsampled = downsampleBuffer(mergedSamples, inputSampleRate, 16000);
            const wavBuffer = encodeWav(downsampled, 16000);
            wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
            base64Audio = await this.blobToBase64(wavBlob);
          }

          // 2. If MediaRecorder generated chunks, create fallback blob and preview URL
          if (this.audioChunks.length > 0) {
            this.recordedBlob = new Blob(this.audioChunks, {
              type: this.mediaRecorder?.mimeType || 'audio/webm'
            });
          }

          // If PCM buffers weren't available, convert recordedBlob to base64
          if (!base64Audio && this.recordedBlob) {
            base64Audio = await this.blobToBase64(this.recordedBlob);
          }

          const primaryBlob = wavBlob || this.recordedBlob;
          if (primaryBlob) {
            if (this.recordedUrl) {
              URL.revokeObjectURL(this.recordedUrl);
            }
            this.recordedUrl = URL.createObjectURL(primaryBlob);
          }

          this.cleanup();
          if (this.onStateChangeCallback) this.onStateChangeCallback('stopped');

          resolve({
            blob: primaryBlob,
            url: this.recordedUrl,
            base64Audio,
            mimeType: wavBlob ? 'audio/wav' : (this.mediaRecorder?.mimeType || 'audio/webm'),
            sizeBytes: primaryBlob?.size || 0
          });
        } catch (err) {
          console.warn('[AudioRecorder] Error in finalizeAudio:', err);
          this.cleanup();
          resolve({
            blob: this.recordedBlob,
            url: this.recordedUrl,
            base64Audio: '',
            mimeType: 'audio/wav'
          });
        }
      };

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          finalizeAudio();
        };
        try {
          this.mediaRecorder.stop();
        } catch (err) {
          console.warn('[AudioRecorder] Error on stop()', err);
          finalizeAudio();
        }
      } else {
        finalizeAudio();
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
    this.isRecording = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.scriptNode) {
      try { this.scriptNode.disconnect(); } catch (e) {}
      this.scriptNode = null;
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
  }

  /**
   * Convert blob to base64 string
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
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
    this.pcmBuffers = [];
    this.recordedBlob = null;
    this.chunkIndex = 0;
  }
}

export const audioRecorder = new AudioRecorderService();
