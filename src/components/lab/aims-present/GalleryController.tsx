import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Play, Pause, SkipForward, RotateCcw, Plus, X, Radio, Zap } from 'lucide-react';
import { Slide } from '../../../services/firebaseService';
import { studentsFor, STUDENTS, Student, CATEGORY_LABEL } from './students';

interface GalleryControllerProps {
  slide: Slide;
  isLive: boolean;
  // Persists a patch onto the gallery slide (current student, queue, mode).
  // Going through Firebase means a queue preset before the slide is live, and
  // every step while live, are both just slide edits — one source of truth.
  onPatch: (patch: Partial<Slide>) => void;
}

const byKey = (key: string): Student | undefined => STUDENTS.find(s => s.photoUrl === key);

// Drives the student gallery and lets the presenter manage who shows:
//  - Auto mode: walks the set A→Z at the fixed delay; the queue jumps people forward.
//  - Queue-only mode: shows only queued students; when the queue runs out it holds
//    on the last one (waiting) so the presenter can add the next.
// "Show now" on any queued student replaces who's on screen immediately.
export default function GalleryController({ slide, isLive, onPatch }: GalleryControllerProps) {
  const category = slide.galleryCategory || 'all';
  const delay = Math.max(0.5, slide.slideshowDelay ?? 5);
  const queueOnly = !!slide.galleryQueueOnly;
  const list = useMemo(() => studentsFor(category), [category]);
  const queueKeys = useMemo(() => slide.galleryQueue || [], [slide.galleryQueue]);

  const [search, setSearch] = useState('');
  const [paused, setPaused] = useState(false);
  const [waiting, setWaiting] = useState(false); // queue-only ran out, holding
  const [timerNonce, setTimerNonce] = useState(0); // bump to restart the delay

  // Refs so the interval/handlers always read the latest values.
  const azIndexRef = useRef(0);              // next A→Z index to show
  const queueKeysRef = useRef<string[]>([]);
  const onPatchRef = useRef(onPatch);
  const currentKeyRef = useRef<string | undefined>(slide.galleryCurrentKey);
  const queueOnlyRef = useRef(queueOnly);
  const waitingRef = useRef(false);
  queueKeysRef.current = queueKeys;
  onPatchRef.current = onPatch;
  currentKeyRef.current = slide.galleryCurrentKey;
  queueOnlyRef.current = queueOnly;

  const searchInputRef = useRef<HTMLInputElement>(null);
  const firstResultRef = useRef<HTMLButtonElement>(null);

  const setWaitingBoth = (v: boolean) => { waitingRef.current = v; setWaiting(v); };

  // Advance one step: priority queue first, else step A→Z (or hold in queue-only).
  const advance = () => {
    const keys = queueKeysRef.current;
    if (keys.length > 0) {
      onPatchRef.current({ galleryCurrentKey: keys[0], galleryQueue: keys.slice(1) });
      setWaitingBoth(false);
    } else if (queueOnlyRef.current) {
      setWaitingBoth(true); // hold on the current student, wait for the next add
    } else if (list.length > 0) {
      const idx = azIndexRef.current;
      azIndexRef.current = (idx + 1) % list.length;
      onPatchRef.current({ galleryCurrentKey: list[idx].photoUrl });
      setWaitingBoth(false);
    }
  };

  // Show a specific student right now, pulling them out of the queue. Works
  // whether or not the slide is live: while hidden it simply becomes the current
  // student, so it's shown first when the slide is switched live. While live it
  // replaces who's on screen and gets a full delay (timer restart).
  const showNow = (s: Student) => {
    onPatch({ galleryCurrentKey: s.photoUrl, galleryQueue: queueKeys.filter(k => k !== s.photoUrl) });
    const i = list.findIndex(x => x.photoUrl === s.photoUrl); // resume A→Z after them
    if (i >= 0) azIndexRef.current = (i + 1) % list.length;
    setWaitingBoth(false);
    setTimerNonce(n => n + 1);
  };

  // Resume A→Z just after the student currently on screen.
  useEffect(() => {
    const k = currentKeyRef.current;
    const i = k ? list.findIndex(s => s.photoUrl === k) : -1;
    if (i >= 0) azIndexRef.current = (i + 1) % list.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Changing the student set restarts the A→Z walk from the top.
  useEffect(() => {
    azIndexRef.current = 0;
  }, [category]);

  // On going live with nothing shown yet, show the first one immediately
  // (a preset queue plays first), instead of waiting a full delay.
  useEffect(() => {
    if (isLive && list.length > 0 && !currentKeyRef.current) advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  // Auto-advance timer — only while live and playing. timerNonce restarts it.
  useEffect(() => {
    if (!isLive || paused || list.length === 0) return;
    const t = setInterval(advance, delay * 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, paused, delay, list.length, timerNonce]);

  const addToQueue = (s: Student) => {
    if (isLive && queueOnlyRef.current && waitingRef.current) {
      // Queue had run out and we were holding — show this one straight away.
      onPatch({ galleryCurrentKey: s.photoUrl });
      setWaitingBoth(false);
      setTimerNonce(n => n + 1);
    } else if (!queueKeys.includes(s.photoUrl)) {
      onPatch({ galleryQueue: [...queueKeys, s.photoUrl] });
    }
    setSearch('');
    searchInputRef.current?.focus();
  };
  const removeFromQueue = (key: string) => onPatch({ galleryQueue: queueKeys.filter(k => k !== key) });

  const restart = () => {
    azIndexRef.current = 0;
    setWaitingBoth(false);
    onPatch({ galleryCurrentKey: queueOnly ? '' : (list[0]?.photoUrl || ''), galleryQueue: [] });
    setTimerNonce(n => n + 1);
  };

  const current = slide.galleryCurrentKey ? byKey(slide.galleryCurrentKey) : undefined;
  const queueStudents = queueKeys.map(byKey).filter(Boolean) as Student[];

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return list.filter(s => s.name.toLowerCase().includes(q)).slice(0, 40);
  }, [search, list]);

  const statusLabel = !isLive ? 'Gallery (not live)' : (waiting ? 'Waiting — add the next student' : 'Now showing');

  return (
    <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
      {/* Status row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {current?.photoUrl ? (
            <img src={current.photoUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-gray-400 flex items-center gap-1">
              <Radio className={`w-3 h-3 ${isLive && !paused && !waiting ? 'text-green-500' : (waiting ? 'text-amber-500' : 'text-gray-400')}`} />
              {statusLabel}
            </p>
            <p className="font-semibold text-gray-900 truncate">{current?.name || (isLive ? '—' : 'Preset the queue, then set live')}</p>
            <p className="text-xs text-gray-400">{CATEGORY_LABEL[category as keyof typeof CATEGORY_LABEL] || 'All'} · {list.length} students · {delay}s each</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(p => !p)}
            disabled={!isLive}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md disabled:opacity-40 ${paused ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {paused ? <><Play className="w-4 h-4" /> Resume</> : <><Pause className="w-4 h-4" /> Pause</>}
          </button>
          <button onClick={advance} disabled={!isLive} title="Skip to next" className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-40">
            <SkipForward className="w-4 h-4" />
          </button>
          <button onClick={restart} disabled={!isLive} title="Restart" className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-40">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Mode</span>
        <div className="inline-flex rounded-md border border-gray-200 overflow-hidden">
          <button
            onClick={() => onPatch({ galleryQueueOnly: false })}
            className={`px-3 py-1.5 text-xs font-medium ${!queueOnly ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Auto A→Z
          </button>
          <button
            onClick={() => onPatch({ galleryQueueOnly: true })}
            className={`px-3 py-1.5 text-xs font-medium ${queueOnly ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Queue only
          </button>
        </div>
        <span className="text-[11px] text-gray-400">
          {queueOnly ? 'Shows only queued students; holds when empty.' : 'Plays everyone A→Z; queue jumps forward.'}
        </span>
      </div>

      {!isLive && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          You can build the “up next” queue now. Set this slide live to start — queued students play first.
        </p>
      )}
      {isLive && waiting && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          Holding on the last student. Add a name and it shows immediately.
        </p>
      )}

      {/* Search + priority queue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">Add priority student</label>
          <div className="relative mt-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                // Tab → jump to the top result (so the next Enter adds it).
                if (e.key === 'Tab' && !e.shiftKey && results.length > 0) {
                  e.preventDefault();
                  firstResultRef.current?.focus();
                }
              }}
              placeholder="Search by name…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-violet-400"
            />
          </div>
          {results.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-100 rounded-md divide-y divide-gray-100">
              {results.map((s, i) => (
                <button
                  key={s.photoUrl}
                  ref={i === 0 ? firstResultRef : undefined}
                  onClick={() => addToQueue(s)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-violet-50 focus:bg-violet-100 focus:outline-none"
                >
                  <img src={s.photoUrl} alt="" className="w-7 h-7 rounded object-cover border border-gray-200 shrink-0" />
                  <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{s.name}</span>
                  <span className="text-[11px] text-gray-400 shrink-0">{CATEGORY_LABEL[s.category]}</span>
                  <Plus className="w-4 h-4 text-violet-500 shrink-0" />
                </button>
              ))}
            </div>
          )}
          {search.trim() && results.length === 0 && (
            <p className="mt-2 text-xs text-gray-400">No match.</p>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">Up next ({queueStudents.length})</label>
          <div className="mt-1 max-h-56 overflow-y-auto space-y-1.5">
            {queueStudents.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">
                {queueOnly ? 'Queue empty — add students to show them.' : 'Queue empty — plays A→Z. Search to jump people forward.'}
              </p>
            ) : (
              queueStudents.map((s, i) => (
                <div key={s.photoUrl} className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-md px-2 py-1.5">
                  <span className="text-xs font-semibold text-violet-400 w-4 shrink-0">{i + 1}</span>
                  <img src={s.photoUrl} alt="" className="w-7 h-7 rounded object-cover border border-violet-200 shrink-0" />
                  <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{s.name}</span>
                  <button
                    onClick={() => showNow(s)}
                    title={isLive ? 'Show now (replace current)' : 'Make current — shows first when live'}
                    className="flex items-center gap-1 px-1.5 py-1 text-[11px] font-medium rounded bg-green-100 text-green-700 hover:bg-green-200 shrink-0"
                  >
                    <Zap className="w-3 h-3" /> {isLive ? 'Show now' : 'Show first'}
                  </button>
                  <button onClick={() => removeFromQueue(s.photoUrl)} className="p-1 text-gray-400 hover:text-red-500 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
