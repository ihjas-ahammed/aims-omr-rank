import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { POSTER_H, POSTER_SCALE, POSTER_W } from '../posterRenderer';
import { loadCsIcons, renderCsPoster, type CsAssets } from './csPosterRenderer';
import { CS_CYCLE_LABEL, getCsDay } from './csTimetable';
import logoUrl from '../biology/aims-plus-logo.png';

interface CsDayPosterProps {
  onBack?: () => void;
}

const toInputDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const offsetFromToday = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toInputDate(d);
};

const loadLogo = (): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = logoUrl;
  });

export default function CsDayPoster({ onBack }: CsDayPosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [date, setDate] = useState(() => offsetFromToday(1));
  const [assets, setAssets] = useState<CsAssets | null>(null);
  const [fontsTick, setFontsTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadLogo(), loadCsIcons()]).then(([logo, icons]) => {
      if (!cancelled) setAssets({ logo, icons });
    });
    // Canvas text only uses a web font once it has been loaded, so request every weight the poster draws with.
    Promise.all(['700', '800', '900'].map((w) => document.fonts?.load(`${w} 20px Montserrat`)))
      .catch(() => undefined)
      .then(() => !cancelled && setFontsTick((n) => n + 1));
    return () => {
      cancelled = true;
    };
  }, []);

  const day = useMemo(() => getCsDay(date), [date]);
  const dateObj = useMemo(() => new Date(date + 'T00:00:00'), [date]);

  useEffect(() => {
    if (canvasRef.current && assets && day) {
      renderCsPoster(canvasRef.current, { date: dateObj, day, assets });
    }
  }, [assets, dateObj, day, fontsTick]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !day) return;
    const link = document.createElement('a');
    link.download = `computer-science-${date}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [date, day]);

  const stepDate = (delta: number) => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setDate(toInputDate(d));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition" aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white leading-none">Computer Science Study Day Poster</h1>
            <p className="text-xs text-slate-400 mt-0.5">Plus One • Chapters 02–05 • Cycle {CS_CYCLE_LABEL}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 items-start">
        <div className="space-y-5">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Study Date</h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Default: Tomorrow
              </span>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition [color-scheme:dark]"
            />
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => stepDate(-1)}
                className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                −1 Day
              </button>
              <button
                onClick={() => setDate(offsetFromToday(1))}
                className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-300 transition"
              >
                Tomorrow
              </button>
              <button
                onClick={() => stepDate(1)}
                className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                +1 Day
              </button>
            </div>
          </section>

          <button
            onClick={download}
            disabled={!day || !assets}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 shadow-lg shadow-emerald-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
        </div>

        <div className="flex flex-col items-center">
          {day ? (
            <div className="w-full max-w-[460px] rounded-2xl overflow-hidden bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_1px_1px_rgba(255,255,255,0.1)]">
              <canvas
                ref={canvasRef}
                width={POSTER_W * POSTER_SCALE}
                height={POSTER_H * POSTER_SCALE}
                className="w-full h-auto block"
              />
            </div>
          ) : (
            <div className="w-full max-w-[460px] rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-10 text-center">
              <p className="text-sm font-semibold text-slate-200">No timetable for this date</p>
              <p className="text-xs text-slate-400 mt-1">The Computer Science cycle runs {CS_CYCLE_LABEL}. Pick a date inside it.</p>
            </div>
          )}
          {day && (
            <p className="text-xs text-slate-500 mt-3 text-center">
              Output: <span className="text-slate-300 font-mono">{POSTER_W * POSTER_SCALE} × {POSTER_H * POSTER_SCALE} px</span> PNG
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
