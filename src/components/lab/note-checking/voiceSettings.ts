// Voice tick (speech-to-text) settings, kept per device in localStorage.
export interface VoiceSettings {
  lang: string; // recognition language
  offlineStt: boolean; // on-device recognition (Chrome: processLocally) so it works without internet
  interim: boolean; // show words live while speaking
  maxAlternatives: number; // extra guesses per phrase; the first that matches a chapter wins
  minConfidence: number; // ignore guesses the engine is less sure of than this (0 = accept all)
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  lang: 'en-IN',
  offlineStt: false,
  interim: true,
  maxAlternatives: 3,
  minConfidence: 0
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
