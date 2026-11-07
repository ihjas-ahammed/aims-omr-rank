import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, ClipboardCopy, Download, Upload } from 'lucide-react';
import { SVG_CATALOG, DEFAULT_LOGO_SVG } from './svgCatalog';
import { PRESETS, buildAIPrompt, type PresetKey, type StudyCard } from './presets';
import { POSTER_H, POSTER_SCALE, POSTER_W, renderPoster, type PosterAssets } from './posterRenderer';

interface StudyDayPosterProps {
  onBack?: () => void;
}

const LOGO_STORAGE_KEY = 'studycard_custom_logo';

const CORNER_OPTIONS = [
  { value: 'corners_physics', label: 'Physics — Atomic Orbitals' },
  { value: 'corners_chemistry', label: 'Chemistry — Molecular Hexagons' },
  { value: 'corners_math', label: 'Mathematics — Sine & Geometry' },
  { value: 'corners_cs', label: 'Comp Sci — Circuit Nodes' },
  { value: 'corners_biology', label: 'Biology — DNA & Cellular' }
];

const PRESET_BUTTONS: { key: PresetKey; label: string; cls: string }[] = [
  { key: 'physics', label: 'Physics', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25' },
  { key: 'chemistry', label: 'Chemistry', cls: 'bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25' },
  { key: 'math', label: 'Mathematics', cls: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25' },
  { key: 'cs', label: 'Comp Sci', cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/25' },
  { key: 'biology', label: 'Biology', cls: 'bg-teal-500/15 text-teal-300 border-teal-500/30 hover:bg-teal-500/25' }
];

const toInputDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const offsetFromToday = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toInputDate(d);
};

const svgToImage = (svg: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });

const urlToImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

const safeFilename = (card: StudyCard, date: Date) => {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `study-card-${toInputDate(date)}-${slug(card.subject || 'Study')}-${slug(card.chapterTitle || 'Card')}.png`;
};

const dropdownGroups = (() => {
  const groups: Record<string, { key: string; label: string }[]> = {};
  for (const [key, item] of Object.entries(SVG_CATALOG)) {
    (groups[item.category] ||= []).push({ key, label: item.label });
  }
  return Object.entries(groups);
})();

const selectCls =
  'w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500';
const cardCls = 'bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg';

export default function StudyDayPoster({ onBack }: StudyDayPosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const [cards, setCards] = useState<StudyCard[]>([structuredClone(PRESETS.physics)]);
  const [cardIdx, setCardIdx] = useState(0);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(PRESETS.physics, null, 2));
  const [jsonValid, setJsonValid] = useState(true);
  const [date, setDate] = useState(() => offsetFromToday(1));
  const [logoScale, setLogoScale] = useState(100);
  const [customLogo, setCustomLogo] = useState<{ img: HTMLImageElement; name: string } | null>(null);
  const [defaultLogo, setDefaultLogo] = useState<HTMLImageElement | null>(null);
  const [svgImages, setSvgImages] = useState<Record<string, HTMLImageElement>>({});
  const [fontsTick, setFontsTick] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [rawNotes, setRawNotes] = useState('');
  const [toast, setToast] = useState('');

  const card = cards[cardIdx] ?? cards[0];

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2800);
  }, []);

  // Load default logo, saved custom logo and every catalog icon once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [logo, ...icons] = await Promise.all([
        svgToImage(DEFAULT_LOGO_SVG),
        ...Object.values(SVG_CATALOG).map((item) =>
          svgToImage(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${item.viewBox}" width="400" height="400">${item.svg}</svg>`
          )
        )
      ]);
      if (cancelled) return;
      setDefaultLogo(logo);
      setSvgImages(Object.fromEntries(Object.keys(SVG_CATALOG).map((k, i) => [k, icons[i]])));

      try {
        const saved = localStorage.getItem(LOGO_STORAGE_KEY);
        if (saved) {
          const img = await urlToImage(saved);
          if (!cancelled) setCustomLogo({ img, name: 'Custom logo loaded ✓' });
        }
      } catch {
        /* storage unavailable or image broken — fall back to default logo */
      }
    })();
    document.fonts?.ready.then(() => !cancelled && setFontsTick((n) => n + 1));
    return () => {
      cancelled = true;
      window.clearTimeout(toastTimer.current);
    };
  }, []);

  const assets: PosterAssets = useMemo(
    () => ({ svgImages, logo: customLogo?.img ?? defaultLogo }),
    [svgImages, customLogo, defaultLogo]
  );

  const draw = useCallback(
    (canvas: HTMLCanvasElement, target: StudyCard, dayOffset: number) => {
      const d = new Date(date + 'T00:00:00');
      d.setDate(d.getDate() + dayOffset);
      renderPoster(canvas, { card: target, date: d, logoScale: logoScale / 100, assets });
      return d;
    },
    [date, logoScale, assets]
  );

  useEffect(() => {
    if (canvasRef.current && card) draw(canvasRef.current, card, 0);
  }, [draw, card, fontsTick]);

  const syncJson = (next: StudyCard[]) =>
    setJsonText(JSON.stringify(next.length === 1 ? next[0] : next, null, 2));

  const handleJsonChange = (raw: string) => {
    setJsonText(raw);
    try {
      const parsed = JSON.parse(raw.trim());
      let list: StudyCard[];
      if (Array.isArray(parsed)) {
        if (parsed.length === 0) throw new Error('Empty array');
        list = parsed;
      } else if (parsed && typeof parsed === 'object') {
        list = [parsed];
      } else {
        throw new Error('Must be JSON object or array');
      }
      setCards(list);
      setCardIdx((i) => (i >= list.length ? 0 : i));
      setJsonValid(true);
    } catch {
      setJsonValid(false);
    }
  };

  const updateField = (field: keyof StudyCard, value: string) => {
    const next = cards.map((c, i) => (i === cardIdx ? { ...c, [field]: value } : c));
    setCards(next);
    syncJson(next);
    setJsonValid(true);
  };

  const loadPreset = (key: PresetKey) => {
    const next = [structuredClone(PRESETS[key])];
    setCards(next);
    setCardIdx(0);
    syncJson(next);
    setJsonValid(true);
    showToast(`Loaded ${PRESETS[key].subject} sample`);
  };

  const stepDate = (delta: number) => {
    const d = date ? new Date(date + 'T00:00:00') : new Date();
    d.setDate(d.getDate() + delta);
    setDate(toInputDate(d));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result);
      try {
        const img = await urlToImage(dataUrl);
        setCustomLogo({ img, name: file.name });
        try {
          localStorage.setItem(LOGO_STORAGE_KEY, dataUrl);
        } catch {
          /* quota exceeded — logo just won't persist */
        }
        showToast('Institute logo updated!');
      } catch {
        showToast('Could not read that image');
      }
    };
    reader.readAsDataURL(file);
  };

  const resetLogo = () => {
    setCustomLogo(null);
    try {
      localStorage.removeItem(LOGO_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    showToast('Reset to default AIMS PLUS logo');
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(buildAIPrompt(rawNotes.trim()));
      showToast('AI Prompt copied! Paste into ChatGPT/Claude.');
    } catch {
      showToast('Clipboard blocked — allow clipboard access and retry');
    }
  };

  const download = (target: StudyCard, dayOffset: number, canvas: HTMLCanvasElement) => {
    const d = draw(canvas, target, dayOffset);
    const link = document.createElement('a');
    link.download = safeFilename(target, d);
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadOne = () => {
    if (!canvasRef.current) return;
    download(card, 0, canvasRef.current);
    showToast('Saved high-res PNG!');
  };

  const downloadAll = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    for (let i = 0; i < cards.length; i++) {
      download(cards[i], i, canvas);
      await new Promise((r) => setTimeout(r, 250));
    }
    draw(canvas, card, 0);
    showToast(`Downloaded all ${cards.length} study cards!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition"
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/20">
              SC
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white leading-none">Study Day Poster</h1>
              <p className="text-xs text-slate-400 mt-0.5">Daily Chapter Poster Generator • High-DPI PNG</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Load Sample:</span>
            {PRESET_BUTTONS.map((p) => (
              <button
                key={p.key}
                onClick={() => loadPreset(p.key)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${p.cls}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Institute logo */}
            <section className={cardCls}>
              <div className="flex items-center justify-between mb-3">
                <StepTitle n={1} title="Institute Logo" />
                <button onClick={resetLogo} className="text-xs text-slate-400 hover:text-white underline">
                  Reset Default
                </button>
              </div>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-3.5 cursor-pointer bg-slate-950/50 transition group">
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-400 mb-1 transition" />
                <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                  {customLogo?.name ?? 'Click to upload institute logo'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">PNG, SVG, JPG (Transparent PNG best)</span>
              </label>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs text-slate-400 whitespace-nowrap">Logo Size:</span>
                <input
                  type="range"
                  min={60}
                  max={150}
                  value={logoScale}
                  onChange={(e) => setLogoScale(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-mono w-10 text-right">{logoScale}%</span>
              </div>
            </section>

            {/* 2. Study date */}
            <section className={cardCls}>
              <div className="flex items-center justify-between mb-3">
                <StepTitle n={2} title="Study Date" />
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Default: Tomorrow
                </span>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition [color-scheme:dark]"
              />
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => setDate(offsetFromToday(0))}
                  className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                >
                  Today
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
          </div>

          {/* 3. JSON + AI prompt */}
          <section className={cardCls}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <StepTitle n={3} title="Chapter JSON & AI Prompt Builder" />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNotes((v) => !v)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  Add Raw Notes to Prompt
                </button>
                <button
                  onClick={copyPrompt}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-md shadow-blue-600/20 transition"
                >
                  <ClipboardCopy className="w-4 h-4" />
                  <span>Copy AI Prompt</span>
                </button>
              </div>
            </div>

            {showNotes && (
              <div className="mb-4 p-3.5 rounded-xl bg-slate-950 border border-blue-500/30">
                <label className="block text-xs font-semibold text-blue-300 mb-1.5">
                  Optional: Paste your raw syllabus, textbook index, or topic list here first, then click "Copy AI Prompt":
                </label>
                <textarea
                  rows={3}
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  placeholder="e.g. Chapter 12 Atoms - Rutherford alpha scattering, Bohr model radius & velocity, hydrogen spectra, de Broglie proof..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  When you click <b>Copy AI Prompt</b>, these notes will be bundled with the full JSON schema & SVG icon catalog.
                </p>
              </div>
            )}

            <div className="relative">
              <textarea
                rows={10}
                value={jsonText}
                onChange={(e) => handleJsonChange(e.target.value)}
                spellCheck={false}
                className="w-full font-mono text-xs leading-relaxed bg-slate-950 border border-slate-800 rounded-xl p-4 text-emerald-300 focus:outline-none focus:border-blue-500 transition"
              />
              <div
                className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                  jsonValid
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {jsonValid
                  ? cards.length > 1
                    ? `✓ Valid JSON (${cards.length} Cards)`
                    : '✓ Valid JSON'
                  : '✗ Invalid JSON Syntax'}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              💡 <b>Math Typography Tip:</b> Subscripts & superscripts like <code className="text-slate-200">r_n</code>,{' '}
              <code className="text-slate-200">E_n = -13.6/n^2 eV</code>, or <code className="text-slate-200">H_2O</code> are
              automatically italicized and formatted on the poster! You can paste a single JSON object or an array{' '}
              <code className="text-slate-200">[ ... ]</code> of chapters.
            </p>
          </section>

          {/* 4. SVG graphics */}
          <section className={cardCls}>
            <div className="flex items-center justify-between mb-4">
              <StepTitle n={4} title="Built-in SVG Graphics & Visual Override" />
              <span className="text-xs text-slate-400">Auto-selected by JSON or customize below</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <IconSelect
                label="Top-Right Subject Icon"
                value={card?.topRightIcon ?? ''}
                onChange={(v) => updateField('topRightIcon', v)}
              />
              <IconSelect
                label="Chapter Banner Icon"
                value={card?.chapterIcon ?? ''}
                onChange={(v) => updateField('chapterIcon', v)}
              />
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Bottom Corner Graphic</label>
                <select
                  value={card?.cornerGraphic ?? 'corners_physics'}
                  onChange={(e) => updateField('cornerGraphic', e.target.value)}
                  className={selectCls}
                >
                  {CORNER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Live preview */}
        <div className="lg:col-span-5 flex flex-col items-center lg:sticky lg:top-20">
          <div className="w-full max-w-[460px] mb-3 flex items-center justify-between gap-2">
            {cards.length > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setCardIdx((i) => (i - 1 + cards.length) % cards.length)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                  aria-label="Previous card"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold px-2 text-white">
                  Card {cardIdx + 1} / {cards.length}
                </span>
                <button
                  onClick={() => setCardIdx((i) => (i + 1) % cards.length)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300"
                  aria-label="Next card"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
              {cards.length > 1 && (
                <button
                  onClick={downloadAll}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 transition"
                >
                  Download All PNGs
                </button>
              )}
              <button
                onClick={downloadOne}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save as PNG</span>
              </button>
            </div>
          </div>

          <div className="w-full max-w-[460px] rounded-2xl overflow-hidden bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_1px_1px_rgba(255,255,255,0.1)]">
            <canvas
              ref={canvasRef}
              width={POSTER_W * POSTER_SCALE}
              height={POSTER_H * POSTER_SCALE}
              className="w-full h-auto block"
            />
          </div>

          <p className="text-xs text-slate-500 mt-3 text-center">
            Output Resolution:{' '}
            <span className="text-slate-300 font-mono">
              {POSTER_W * POSTER_SCALE} × {POSTER_H * POSTER_SCALE} px
            </span>{' '}
            (Print & WhatsApp/Instagram HD Ready)
          </p>
        </div>
      </main>

      <div
        className={`fixed bottom-5 right-5 z-50 transition-all duration-300 bg-slate-900 border border-emerald-500/40 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 pointer-events-none ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="text-xs font-semibold">{toast}</span>
      </div>
    </div>
  );
}

function StepTitle({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
        {n}
      </span>
      <h2 className="font-bold text-sm text-white uppercase tracking-wider">{title}</h2>
    </div>
  );
}

function IconSelect({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
        {!SVG_CATALOG[value] && <option value={value}>{value || '—'}</option>}
        {dropdownGroups.map(([cat, list]) => (
          <optgroup key={cat} label={cat}>
            {list.map(({ key, label: l }) => (
              <option key={key} value={key}>
                {l} ({key})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
