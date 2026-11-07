import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { POSTER_H, POSTER_SCALE, POSTER_W } from '../posterRenderer';
import {
  AIMS_FONT_REQUESTS,
  AIMS_FONT_STYLESHEET,
  loadAimsIcons,
  renderAimsPoster,
  type AimsAssets
} from './aimsPosterRenderer';
import { FIRST_DATE, LAST_DATE, defaultDateKey, getRevisionItems } from './schedule';
import logoUrl from './aims-logo.png';

interface AimsRevisionPosterProps {
  onBack?: () => void;
}

const FONT_LINK_ID = 'aims-revision-poster-fonts';

const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const loadLogo = (): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = logoUrl;
  });

const prettyRange = `${FIRST_DATE.split('-').reverse().join('/')} – ${LAST_DATE.split('-').reverse().join('/')}`;

export default function AimsRevisionPoster({ onBack }: AimsRevisionPosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [date, setDate] = useState(() => defaultDateKey());
  const [assets, setAssets] = useState<AimsAssets | null>(null);
  const [fontsTick, setFontsTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Malayalam / Devanagari webfonts are only needed on this page, so load them here rather than in index.html.
    if (!document.getElementById(FONT_LINK_ID)) {
      const link = document.createElement('link');
      link.id = FONT_LINK_ID;
      link.rel = 'stylesheet';
      link.href = AIMS_FONT_STYLESHEET;
      document.head.appendChild(link);
    }

    Promise.all([loadLogo(), loadAimsIcons()]).then(([logo, icons]) => {
      if (!cancelled) setAssets({ logo, icons });
    });

    // Canvas text only uses a webfont once it has been loaded; sample text pulls the right unicode-range subset.
    const reload = () =>
      Promise.all(AIMS_FONT_REQUESTS.map(([font, text]) => document.fonts?.load(font, text)))
        .catch(() => undefined)
        .then(() => !cancelled && setFontsTick((n) => n + 1));
    reload();
    // The stylesheet may land after the first request; ask again once it is in.
    const retry = window.setTimeout(reload, 1500);

    return () => {
      cancelled = true;
      window.clearTimeout(retry);
    };
  }, []);

  const items = useMemo(() => getRevisionItems(date), [date]);
  const dateObj = useMemo(() => new Date(date + 'T00:00:00'), [date]);

  useEffect(() => {
    if (canvasRef.current && assets && items) {
      renderAimsPoster(canvasRef.current, { date: dateObj, items, assets });
    }
  }, [assets, dateObj, items, fontsTick]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !items) return;
    const link = document.createElement('a');
    link.download = `aims-revision-${date}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [date, items]);

  const step = (delta: number) => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setDate(toKey(d));
  };

  const navBtn =
    'p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-40';

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
            <h1 className="font-bold text-lg tracking-tight text-white leading-none">AIMS Revision Schedule</h1>
            <p className="text-xs text-slate-400 mt-0.5">Class 10 • {prettyRange}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8 items-start">
        <div className="space-y-5">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Date</h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Default: Today
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => step(-1)} disabled={date <= FIRST_DATE} className={navBtn} aria-label="Previous day">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={date}
                min={FIRST_DATE}
                max={LAST_DATE}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition [color-scheme:dark]"
              />
              <button onClick={() => step(1)} disabled={date >= LAST_DATE} className={navBtn} aria-label="Next day">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setDate(defaultDateKey())}
              className="mt-3 w-full py-1.5 text-xs font-medium rounded-lg bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-300 transition"
            >
              Today
            </button>
          </section>

          <button
            onClick={download}
            disabled={!items || !assets}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 shadow-lg shadow-emerald-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>
        </div>

        <div className="flex flex-col items-center">
          {items ? (
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
              <p className="text-sm font-semibold text-slate-200">No revision scheduled for this date</p>
              <p className="text-xs text-slate-400 mt-1">The schedule runs {prettyRange}.</p>
            </div>
          )}
          {items && (
            <p className="text-xs text-slate-500 mt-3 text-center">
              Output: <span className="text-slate-300 font-mono">{POSTER_W * POSTER_SCALE} × {POSTER_H * POSTER_SCALE} px</span> PNG
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
