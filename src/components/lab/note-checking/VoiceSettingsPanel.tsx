import { useEffect, useState } from 'react';
import { VoiceSettings, DEFAULT_VOICE_SETTINGS, speakText } from './voiceSettings';

const LANGS = [
  ['en-IN', 'English (India)'],
  ['en-US', 'English (US)'],
  ['en-GB', 'English (UK)'],
  ['ml-IN', 'Malayalam'],
  ['hi-IN', 'Hindi']
];

interface Props {
  value: VoiceSettings;
  onChange: (v: VoiceSettings) => void;
}

export default function VoiceSettingsPanel({ value, onChange }: Props) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [offlineMsg, setOfflineMsg] = useState('');
  const set = (p: Partial<VoiceSettings>) => onChange({ ...value, ...p });

  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis?.getVoices() || []);
    load();
    window.speechSynthesis?.addEventListener?.('voiceschanged', load);
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', load);
  }, []);

  const shown = voices.filter(v => !value.ttsOfflineOnly || v.localService);

  // Chrome 139+: check / download the on-device recognition pack for the chosen language.
  const prepareOffline = async () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR?.available) return setOfflineMsg('This browser cannot check offline packs; try turning it on and listening.');
    try {
      const opts = { langs: [value.lang], processLocally: true };
      let st = await SR.available(opts);
      if (st === 'downloadable' || st === 'downloading') {
        setOfflineMsg('Downloading offline language pack…');
        await SR.install(opts);
        st = await SR.available(opts);
      }
      setOfflineMsg(st === 'available' ? 'Offline recognition ready for ' + value.lang : `Offline recognition: ${st}`);
    } catch (e: any) {
      setOfflineMsg(e?.message || 'Could not prepare offline recognition');
    }
  };

  const slider = (label: string, key: 'ttsRate' | 'ttsPitch' | 'ttsVolume', min: number, max: number, step: number) => (
    <label className="flex items-center gap-3 text-xs text-gray-600">
      <span className="w-14">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value[key]} onChange={e => set({ [key]: Number(e.target.value) })} className="flex-1" />
      <span className="w-8 text-right font-semibold text-gray-800">{value[key]}</span>
    </label>
  );

  return (
    <div className="mb-3 rounded-lg border border-gray-200 bg-white p-3 space-y-3 text-sm">
      <div className="font-bold text-gray-800">Voice settings <span className="font-normal text-xs text-gray-400">(applied next time you start Voice tick)</span></div>

      <div className="space-y-2">
        <div className="text-xs font-bold uppercase text-gray-500">Listening</div>
        <select value={value.lang} onChange={e => set({ lang: e.target.value })} className="w-full px-2 py-1.5 rounded border border-gray-200 text-sm">
          {LANGS.map(([c, n]) => (
            <option key={c} value={c}>{n} ({c})</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input type="checkbox" checked={value.offlineStt} onChange={e => set({ offlineStt: e.target.checked })} />
          Offline recognition (on-device, no internet)
        </label>
        {value.offlineStt && (
          <div className="flex items-center gap-2 text-xs">
            <button onClick={prepareOffline} className="px-2 py-1 rounded border border-gray-300 font-semibold text-indigo-600">Check / download pack</button>
            <span className="text-gray-500">{offlineMsg}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-xs font-bold uppercase text-gray-500">Spoken feedback</div>
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input type="checkbox" checked={value.ttsEnabled} onChange={e => set({ ttsEnabled: e.target.checked })} />
          Say the matched chapter name after each tick (the mic pauses while it speaks)
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input type="checkbox" checked={value.ttsFailures} onChange={e => set({ ttsFailures: e.target.checked })} />
          Also say “not found” / “unclear”
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input type="checkbox" checked={value.ttsOfflineOnly} onChange={e => set({ ttsOfflineOnly: e.target.checked })} />
          Offline voices only (installed on this device)
        </label>
        <select value={value.ttsVoice} onChange={e => set({ ttsVoice: e.target.value })} className="w-full px-2 py-1.5 rounded border border-gray-200 text-sm">
          <option value="">Automatic</option>
          {shown.map(v => (
            <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang}){v.localService ? ' • offline' : ''}</option>
          ))}
        </select>
        {slider('Speed', 'ttsRate', 0.5, 2.5, 0.1)}
        {slider('Pitch', 'ttsPitch', 0.5, 2, 0.1)}
        {slider('Volume', 'ttsVolume', 0, 1, 0.1)}
        <div className="flex gap-2">
          <button onClick={() => speakText('Electric Charges and Fields', value)} className="px-3 py-1.5 rounded border border-gray-300 text-xs font-semibold text-indigo-600">Test voice</button>
          <button onClick={() => onChange(DEFAULT_VOICE_SETTINGS)} className="px-3 py-1.5 rounded border border-gray-300 text-xs font-semibold text-gray-600">Reset</button>
        </div>
      </div>
    </div>
  );
}
