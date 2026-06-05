import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Play, Pause, SkipForward, RotateCcw, Plus, X, Radio } from 'lucide-react';
import { Slide } from '../../../services/firebaseService';
import { studentsFor, Student, CATEGORY_LABEL } from './students';

interface GalleryControllerProps {
  slide: Slide;
  isLive: boolean;
  // Writes the given student's photoUrl as the gallery's current student (synced
  // to the view via Firebase). This is the single source of "who is on screen".
  onShow: (key: string) => void;
}

// Drives the student gallery while it is the live slide:
//  - walks the category A–Z at the fixed delay, and
//  - lets the presenter search and queue priority students, who are shown
//    after the current one, one per delay tick (so a burst of additions still
//    plays out at the normal pace).
export default function GalleryController({ slide, isLive, onShow }: GalleryControllerProps) {
  const category = slide.galleryCategory || 'all';
  const delay = Math.max(0.5, slide.slideshowDelay ?? 5);
  const list = useMemo(() => studentsFor(category), [category]);

  const [queue, setQueue] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [paused, setPaused] = useState(false);

  // Refs the interval reads so it always sees the latest values without resubscribing.
  const azIndexRef = useRef(0);
  const queueRef = useRef<Student[]>([]);
  const onShowRef = useRef(onShow);
  // Fast add-flow: type in the input → Tab jumps to the top result → Enter adds
  // it and bounces focus back to the input, ready for the next name.
  const searchInputRef = useRef<HTMLInputElement>(null);
  const firstResultRef = useRef<HTMLButtonElement>(null);
  queueRef.current = queue;
  onShowRef.current = onShow;

  // Advance one step: priority queue takes precedence, else step A–Z.
  const advance = () => {
    if (list.length === 0) return;
    if (queueRef.current.length > 0) {
      const [next, ...rest] = queueRef.current;
      setQueue(rest);
      onShowRef.current(next.photoUrl);
    } else {
      azIndexRef.current = (azIndexRef.current + 1) % list.length;
      onShowRef.current(list[azIndexRef.current].photoUrl);
    }
  };

  // When the category changes, restart the A–Z walk from the top.
  useEffect(() => {
    azIndexRef.current = 0;
    setQueue([]);
    if (isLive && list.length > 0) onShowRef.current(list[0].photoUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // On going live: resume from the current student if one is set, else start at A.
  useEffect(() => {
    if (!isLive || list.length === 0) return;
    const idx = list.findIndex(s => s.photoUrl === slide.galleryCurrentKey);
    if (idx >= 0) {
      azIndexRef.current = idx;
    } else {
      azIndexRef.current = 0;
      onShowRef.current(list[0].photoUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  // The auto-advance timer — only runs while live and playing.
  useEffect(() => {
    if (!isLive || paused || list.length === 0) return;
    const t = setInterval(advance, delay * 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, paused, delay, list.length]);

  const addToQueue = (s: Student) => {
    setQueue(prev => (prev.some(q => q.photoUrl === s.photoUrl) ? prev : [...prev, s]));
    setSearch('');
    // Bounce focus back to the search box so the next name can be typed immediately.
    searchInputRef.current?.focus();
  };
  const removeFromQueue = (key: string) => setQueue(prev => prev.filter(q => q.photoUrl !== key));

  const restart = () => {
    azIndexRef.current = 0;
    setQueue([]);
    if (list.length > 0) onShow(list[0].photoUrl);
  };

  const current = list.find(s => s.photoUrl === slide.galleryCurrentKey)
    || (slide.galleryCurrentKey ? studentsFor('all').find(s => s.photoUrl === slide.galleryCurrentKey) : undefined);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return list.filter(s => s.name.toLowerCase().includes(q)).slice(0, 40);
  }, [search, list]);

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
              <Radio className={`w-3 h-3 ${isLive && !paused ? 'text-green-500' : 'text-gray-400'}`} /> Now showing
            </p>
            <p className="font-semibold text-gray-900 truncate">{current?.name || '—'}</p>
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
          <button onClick={restart} disabled={!isLive} title="Restart from A" className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-40">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isLive && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          Set this slide live to start the gallery.
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
                  {s.percent && <span className="text-xs text-gray-400 shrink-0">{s.percent}</span>}
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
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">Up next ({queue.length})</label>
          <div className="mt-1 max-h-56 overflow-y-auto space-y-1.5">
            {queue.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">Queue empty — playing A→Z. Search above to jump people forward.</p>
            ) : (
              queue.map((s, i) => (
                <div key={s.photoUrl} className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-md px-2 py-1.5">
                  <span className="text-xs font-semibold text-violet-400 w-4 shrink-0">{i + 1}</span>
                  <img src={s.photoUrl} alt="" className="w-7 h-7 rounded object-cover border border-violet-200 shrink-0" />
                  <span className="flex-1 min-w-0 text-sm text-gray-800 truncate">{s.name}</span>
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
