// Voice tick settings (speech recognition + spoken feedback), kept per device in localStorage.
export interface VoiceSettings {
  lang: string; // recognition language
  offlineStt: boolean; // on-device recognition (Chrome: processLocally) so it works without internet
  ttsEnabled: boolean; // speak the mapped chapter name back
  ttsVoice: string; // voiceURI, '' = default
  ttsOfflineOnly: boolean; // only offer/use voices installed on the device
  ttsRate: number;
  ttsPitch: number;
  ttsVolume: number;
  ttsFailures: boolean; // also say "not found" / "unclear"
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  lang: 'en-IN',
  offlineStt: false,
  ttsEnabled: true,
  ttsVoice: '',
  ttsOfflineOnly: false,
  ttsRate: 1.4,
  ttsPitch: 1,
  ttsVolume: 1,
  ttsFailures: true
};

const KEY = 'note-voice-settings-v1';

export const loadVoiceSettings = (): VoiceSettings => {
  try {
    return { ...DEFAULT_VOICE_SETTINGS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return DEFAULT_VOICE_SETTINGS;
  }
};

export const saveVoiceSettings = (s: VoiceSettings) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
};

export const pickVoice = (s: VoiceSettings): SpeechSynthesisVoice | undefined => {
  const voices = window.speechSynthesis?.getVoices() || [];
  const pool = s.ttsOfflineOnly ? voices.filter(v => v.localService) : voices;
  return pool.find(v => v.voiceURI === s.ttsVoice) || pool.find(v => v.lang === s.lang) || pool.find(v => v.lang.startsWith(s.lang.slice(0, 2)));
};

// Speaks `text` quickly with the configured voice; `onDone` fires when finished (or if speech is unavailable).
export const speakText = (text: string, s: VoiceSettings, onDone?: () => void) => {
  const synth = window.speechSynthesis;
  if (!synth || !text) return onDone?.();
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice(s);
  if (v) {
    u.voice = v;
    u.lang = v.lang;
  } else u.lang = s.lang;
  u.rate = s.ttsRate;
  u.pitch = s.ttsPitch;
  u.volume = s.ttsVolume;
  u.onend = () => onDone?.();
  u.onerror = () => onDone?.();
  synth.speak(u);
};
