/**
 * Text-to-Speech (TTS) & Audio Readback Service
 * Supports AI4Bharat Indic-Speak audio playback and local speech synthesis fallback.
 * Allows interruption with `interrupt_audio` event.
 */

class TTSService {
  constructor() {
    this.currentAudio = null;
    this.isPlaying = false;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.onStateChangeCallback = null;
  }

  /**
   * Play backend audio URL or base64
   */
  async playAudioData(audioSource, onEnd) {
    this.stop();

    try {
      this.currentAudio = new Audio(audioSource);
      this.isPlaying = true;
      if (this.onStateChangeCallback) this.onStateChangeCallback(true);

      this.currentAudio.onended = () => {
        this.isPlaying = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        if (onEnd) onEnd();
      };

      this.currentAudio.onerror = (e) => {
        console.warn('[TTS] Audio element error, falling back to speech synthesis', e);
        this.isPlaying = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        if (onEnd) onEnd();
      };

      await this.currentAudio.play();
    } catch (err) {
      console.warn('[TTS] Audio play error', err);
      this.isPlaying = false;
      if (this.onStateChangeCallback) this.onStateChangeCallback(false);
      if (onEnd) onEnd();
    }
  }

  /**
   * Speak text in Kannada using SpeechSynthesis (fallback or demo mode)
   */
  speakText(text, { language = 'kn-IN', onStart, onEnd } = {}) {
    this.stop();

    if (!this.synth) {
      console.warn('[TTS] Web Speech API not supported in this browser environment');
      if (onEnd) onEnd();
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.95; // Slightly slower for clarity in rural healthcare contexts
      utterance.pitch = 1.0;

      // Find Kannada or Indian English voice if available
      const voices = this.synth.getVoices();
      const knVoice = voices.find(v => v.lang.includes('kn') || v.lang.includes('kannada') || v.name.toLowerCase().includes('kannada'));
      const inVoice = voices.find(v => v.lang === 'en-IN' || v.lang.includes('IN'));

      if (knVoice) {
        utterance.voice = knVoice;
      } else if (inVoice) {
        utterance.voice = inVoice;
      }

      utterance.onstart = () => {
        this.isPlaying = true;
        if (this.onStateChangeCallback) this.onStateChangeCallback(true);
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this.isPlaying = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('[TTS] Utterance error', e);
        this.isPlaying = false;
        if (this.onStateChangeCallback) this.onStateChangeCallback(false);
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    } catch (err) {
      console.error('[TTS] SpeechSynthesis failed', err);
      this.isPlaying = false;
      if (this.onStateChangeCallback) this.onStateChangeCallback(false);
      if (onEnd) onEnd();
    }
  }

  /**
   * Stop any playing audio immediately
   */
  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }

    if (this.synth && this.synth.speaking) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }

    this.isPlaying = false;
    if (this.onStateChangeCallback) this.onStateChangeCallback(false);
  }

  setOnStateChange(cb) {
    this.onStateChangeCallback = cb;
  }
}

export const ttsService = new TTSService();
