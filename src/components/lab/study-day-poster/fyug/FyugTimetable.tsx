import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import { POSTER_H, POSTER_SCALE, POSTER_W } from '../posterRenderer';
import { loadFyugIcons, renderFyugPoster, type FyugAssets } from './fyugPosterRenderer';
import { SUBJECTS, defaultDate, getDaySubtitle, getPosterHeight, getSlots } from './fyugData';
import { daysUntil, getEventsOn, getUpcomingEventDays } from './calendar';
import { SUBJECT_KEYS, formatUnits, loadProgress, onProgressChange, overall, subjectFraction, type Progress } from './progress';
import FyugTopics from './FyugTopics';
import FyugDayEditor, { practicalTitle } from './FyugDayEditor';
import { loadSpecialDays, saveSpecialDays, specialDayHeight, type SpecialDay } from './specialDays';

interface FyugTimetableProps {
  onBack?: () => void;
}

const TOPICS_PATH = '/fyug-timetable/topics';
const SHOW_PROGRESS_KEY = 'fyug-poster-show-progress';

const toInputDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function FyugTimetable({ onBack }: FyugTimetableProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initial = useMemo(() => defaultDate(), []);
  const [date, setDate] = useState(() => toInputDate(initial.date));
  const [assets, setAssets] = useState<FyugAssets | null>(null);
  const [fontsTick, setFontsTick] = useState(0);
  // The Topics tab has its own address, so it can be opened in a second browser tab next to the poster.
  const [tab, setTab] = useState<'poster' | 'topics'>(() =>
    window.location.pathname.replace(/\/$/, '') === TOPICS_PATH ? 'topics' : 'poster'
  );
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [showProgress, setShowProgress] = useState(() => localStorage.getItem(SHOW_PROGRESS_KEY) !== '0');

  useEffect(() => onProgressChange(() => setProgress(loadProgress())), []);

  const switchTab = (next: 'poster' | 'topics') => {
    setTab(next);
    window.history.replaceState({}, '', next === 'topics' ? TOPICS_PATH : '/fyug-timetable');
  };

  const toggleShowProgress = () => {
    setShowProgress((on) => {
      localStorage.setItem(SHOW_PROGRESS_KEY, on ? '0' : '1');
      return !on;
    });
  };

  useEffect(() => {
    let cancelled = false;
    loadFyugIcons().then((icons) => !cancelled && setAssets({ icons }));

    // Canvas text only uses a web font once it has been loaded, so request every weight the poster draws with.
    Promise.all(['700', '800', '900'].map((w) => document.fonts?.load(`${w} 20px Montserrat`)))
      .catch(() => undefined)
      .then(() => !cancelled && setFontsTick((n) => n + 1));
    return () => {
      cancelled = true;
    };
  }, []);

  const dateObj = useMemo(() => new Date(date + 'T00:00:00'), [date]);
  // A special day edited on this page replaces the date's normal timetable.
  const [specialDays, setSpecialDays] = useState(loadSpecialDays);
  const special: SpecialDay | null = specialDays[date] ?? null;
  const slots = useMemo(() => (special ? special.slots : getSlots(dateObj)), [special, dateObj]);
  const posterH =
    (special ? specialDayHeight(special.slots.length, POSTER_H) : getPosterHeight(dateObj)) ?? POSTER_H;

  const updateSpecial = (day: SpecialDay | null) => {
    setSpecialDays((all) => {
      const next = { ...all };
      if (day) next[date] = day;
      else delete next[date];
      saveSpecialDays(next);
      return next;
    });
  };

  // A day with only practicals: one LAB card (the subject and the rest can be changed in the editor).
  const startPracticals = () =>
    updateSpecial({
      subtitle: 'PRACTICALS ONLY',
      slots: [{ subject: 'thermo', teacher: '', title: practicalTitle('thermo'), note: '', badge: 'LAB', time: '' }]
    });

  // Start from the date's current hours (a weekend has none, so it starts with one blank hour).
  const startSpecial = () =>
    updateSpecial({
      subtitle: getDaySubtitle(dateObj) ?? '',
      slots: getSlots(dateObj)?.map((s) => ({ ...s })) ?? [{ subject: 'thermo', teacher: '', time: '' }]
    });
  // Footer: the poster date's own calendar events, or the next event day when it has none, followed by the
  // event day after that ("THEN" line).
  const upcoming = useMemo(() => getUpcomingEventDays(dateObj), [dateObj]);
  const { events, then, isNext } = useMemo(() => {
    const own = getEventsOn(dateObj);
    return own.length
      ? { events: own, then: upcoming[0] ?? [], isNext: false }
      : { events: upcoming[0] ?? [], then: upcoming[1] ?? [], isNext: true };
  }, [dateObj, upcoming]);
  const daysLeft = isNext && events.length ? daysUntil(dateObj, events[0].date) : undefined;

  const fractions = useMemo(
    () => Object.fromEntries(SUBJECT_KEYS.map((key) => [key, subjectFraction(progress, key)])),
    [progress]
  );
  const total = useMemo(() => overall(progress), [progress]);

  useEffect(() => {
    if (tab === 'poster' && canvasRef.current && assets && slots) {
      renderFyugPoster(canvasRef.current, {
        date: dateObj,
        events,
        then,
        slots,
        assets,
        height: posterH,
        subtitle: special?.subtitle?.trim() || undefined,
        unordered: !!special?.unordered,
        nextLabel: isNext,
        daysLeft,
        progress: showProgress ? fractions : undefined
      });
    }
  }, [tab, assets, dateObj, slots, special, events, then, isNext, daysLeft, posterH, fontsTick, showProgress, fractions]);

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !slots) return;
    const link = document.createElement('a');
    link.download = `timetable-${date}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [date, slots]);

  const stepDate = (delta: number) => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setDate(toInputDate(d));
  };

  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-800 text-slate-300 transition" aria-label="Back">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="font-bold text-base sm:text-lg tracking-tight text-white leading-none truncate">
              FYUG Timetable<span className="hidden sm:inline"> Poster</span>
            </h1>
            <p className="hidden sm:block text-xs text-slate-400 mt-0.5">Daily timetable • Hour 1 – Hour 5</p>
          </div>
          <div className="ml-auto shrink-0 flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
            {(['poster', 'topics'] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                  tab === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'poster' ? 'Poster' : 'Topics'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {tab === 'topics' ? (
        <FyugTopics />
      ) : (
      <main className="max-w-5xl mx-auto px-3 sm:px-4 py-4 md:py-6 grid grid-cols-1 md:grid-cols-[340px_1fr] gap-5 md:gap-8 items-start">
        <div className="space-y-5">
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Date</h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Default: Tomorrow
              </span>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-base md:text-sm text-white focus:outline-none focus:border-blue-500 transition [color-scheme:dark]"
            />
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => stepDate(-1)}
                className="flex-1 py-2.5 md:py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                −1 Day
              </button>
              <button
                onClick={() => setDate(toInputDate(defaultDate().date))}
                className="flex-1 py-2.5 md:py-1.5 text-xs font-medium rounded-lg bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-300 transition"
              >
                Tomorrow
              </button>
              <button
                onClick={() => stepDate(1)}
                className="flex-1 py-2.5 md:py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              >
                +1 Day
              </button>
            </div>
            {initial.skippedWeekend && date === toInputDate(initial.date) && (
              <p className="text-[11px] text-amber-300/90 mt-3">
                Tomorrow is a weekend with no classes, so this shows {weekday}.
              </p>
            )}
          </section>

          <FyugDayEditor
            day={special}
            onStart={startSpecial}
            onStartPracticals={startPracticals}
            onChange={updateSpecial}
            onReset={() => updateSpecial(null)}
          />

          <button
            onClick={download}
            disabled={!slots || !assets}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 shadow-lg shadow-emerald-500/25 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Syllabus progress</h2>
              <span className="text-xs font-bold text-white">
                {formatUnits(total.done)}/{total.total} units
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all"
                style={{ width: `${(total.done / total.total) * 100}%` }}
              />
            </div>
            <div className="mt-4 space-y-2">
              {SUBJECT_KEYS.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-28 shrink-0 truncate text-[11px] text-slate-300">{SUBJECTS[key].name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${fractions[key] * 100}%`, backgroundColor: SUBJECTS[key].accent }}
                    />
                  </div>
                  <span className="w-9 text-right text-[11px] font-mono text-slate-400">
                    {Math.round(fractions[key] * 100)}%
                  </span>
                </div>
              ))}
            </div>
            <a
              href={TOPICS_PATH}
              target="_blank"
              rel="noopener"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-300 transition"
            >
              <span>Check topics</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <label className="mt-3 flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" checked={showProgress} onChange={toggleShowProgress} className="accent-emerald-500" />
              <span>Show progress bars on the poster</span>
            </label>
          </section>

          {upcoming.length > 0 && (
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-lg">
              <h2 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">Upcoming events</h2>
              <ul className="space-y-2.5">
                {upcoming.slice(0, 5).flat().map((e, i) => (
                  <li key={i} className="flex gap-3 text-xs">
                    <span className="w-14 shrink-0 font-mono text-emerald-400">
                      {new Date(e.date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="text-slate-200">
                      {e.event}
                      <span className="text-slate-500"> • {e.subject ? SUBJECTS[e.subject].name : e.note ?? 'All Courses'}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* On phones the poster comes first, with the controls below it. */}
        <div className="flex flex-col items-center order-first md:order-none">
          {slots ? (
            <div className="w-full max-w-[460px] rounded-2xl overflow-hidden bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_1px_1px_rgba(255,255,255,0.1)]">
              <canvas
                ref={canvasRef}
                width={POSTER_W * POSTER_SCALE}
                height={posterH * POSTER_SCALE}
                className="w-full h-auto block"
              />
            </div>
          ) : (
            <div className="w-full max-w-[460px] rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-10 text-center">
              <p className="text-sm font-semibold text-slate-200">No classes on {weekday}</p>
              <p className="text-xs text-slate-400 mt-1">The timetable runs Monday to Friday. Pick a weekday.</p>
            </div>
          )}
          {slots && (
            <p className="text-xs text-slate-500 mt-3 text-center">
              Output: <span className="text-slate-300 font-mono">{POSTER_W * POSTER_SCALE} × {posterH * POSTER_SCALE} px</span> PNG
            </p>
          )}
        </div>
      </main>
      )}
    </div>
  );
}
