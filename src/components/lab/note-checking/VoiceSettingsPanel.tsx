import { useState } from 'react';
import { VoiceSettings, DEFAULT_VOICE_SETTINGS } from './voiceSettings';

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
  const [offlineMsg, setOfflineMsg] = useState('');
  const set = (p: Partial<VoiceSettings>) => onChange({ ...value, ...p });

  // Chrome 139+: check / download the on-device recognition pack for the chosen language.
  const prepareOffline = async () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR?.available) return setOfflineMsg('This browser cannot check offline packs; turn it on and try listening.');
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

  const slider = (label: string, key: 'maxAlternatives' | 'minConfidence', min: number, max: number, step: number) => (
    <label className="flex items-center gap-3 text-xs text-gray-600">
      <span className="w-24">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value[key]} onChange={e => set({ [key]: Number(e.target.value) })} className="flex-1" />
      <span className="w-8 text-right font-semibold text-gray-800">{value[key]}</span>
    </label>
  );

  return (
    <div className="mb-3 rounded-lg border border-gray-200 bg-white p-3 space-y-2 text-sm">
      <div className="font-bold text-gray-800">
        Speech recognition <span className="font-normal text-xs text-gray-400">(applied next time you start Voice tick)</span>
      </div>
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
      <label className="flex items-center gap-2 text-xs text-gray-700">
        <input type="checkbox" checked={value.interim} onChange={e => set({ interim: e.target.checked })} />
        Show words live while speaking
      </label>
      {slider('Alternatives', 'maxAlternatives', 1, 5, 1)}
      {slider('Min confidence', 'minConfidence', 0, 0.9, 0.1)}
      <button onClick={() => onChange(DEFAULT_VOICE_SETTINGS)} className="px-3 py-1.5 rounded border border-gray-300 text-xs font-semibold text-gray-600">Reset</button>
    </div>
  );
}
