/**
 * Text-to-Speech (TTS) & Audio Readback Service
 * Supports AI4Bharat Indic-Speak audio playback across all 22 scheduled Indian languages
 * with local Web Speech API synthesis fallback and instantaneous interruption.
 */

class TTSService {
  constructor() {
    this.currentAudio = null;
    this.isPlaying = false;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.onStateChangeCallback = null;
  }

  /**
   * Play base64 WAV or MP3 audio from backend Indic-Speak
   */
  async playBase64Audio(b64Audio, format = 'wav', onEnd) {
    this.stop();
    try {
      const audioSource = `data:audio/${format};base64,${b64Audio}`;
      return this.playAudioData(audioSource, onEnd);
    } catch (err) {
      console.warn('[TTS] Failed to create audio from base64', err);
      if (onEnd) onEnd();
    }
  }

  /**
   * Play backend audio URL or base64 data URI
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
   * Speak text in any of the 22 Indian languages using SpeechSynthesis (fallback or browser engine)
   */
  speakText(text, { language, onStart, onEnd } = {}) {
    this.stop();

    if (!this.synth) {
      console.warn('[TTS] Web Speech API not supported in this browser environment');
      if (onEnd) onEnd();
      return;
    }

    try {
      const activeLang = language || (typeof window !== 'undefined' ? localStorage.getItem('asha_language') : 'en') || 'en';
      const bcpMap = {
        en: 'en-IN', kn: 'kn-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN',
        mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN', ml: 'ml-IN', pa: 'pa-IN',
        or: 'or-IN', as: 'as-IN', ur: 'ur-IN', sa: 'sa-IN', ks: 'ks-IN',
        kok: 'kok-IN', mai: 'mai-IN', mni: 'mni-IN', ne: 'ne-NP',
        sat: 'sat-IN', sd: 'sd-IN', doi: 'doi-IN', brx: 'brx-IN'
      };
      const targetLang = bcpMap[activeLang.split('-')[0].toLowerCase()] || (activeLang.includes('-') ? activeLang : 'en-IN');

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLang;
      utterance.rate = 0.95; // Slightly slower for clarity in rural healthcare contexts
      utterance.pitch = 1.0;

      // Find best matching voice for this Indic language
      const voices = this.synth.getVoices ? this.synth.getVoices() : [];
      const langPrefix = language.split('-')[0].toLowerCase();
      
      const matchedVoice = voices.find(v => 
        v.lang.toLowerCase().startsWith(langPrefix) || 
        v.lang.toLowerCase().replace('_', '-').includes(language.toLowerCase())
      );
      const inVoice = voices.find(v => v.lang === 'en-IN' || v.lang.includes('IN'));

      if (matchedVoice) {
        utterance.voice = matchedVoice;
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
   * Interrupt and immediately stop any current playback or utterance
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

  onStateChange(cb) {
    this.onStateChangeCallback = cb;
  }
}

export const ttsService = new TTSService();
