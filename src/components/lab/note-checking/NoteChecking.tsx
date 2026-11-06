import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Search, Check, RefreshCw, Loader2, Users, Printer } from 'lucide-react';
import {
  AttendanceStudent,
  NoteProgressMap,
  NoteSummary,
  NOTE_BATCHES,
  fetchAttendanceStudents,
  fetchNoteProgress,
  fetchAllNoteSummaries,
  fetchAllNoteChapters,
  setChapterDone,
  setManyChaptersDone
} from '../../../services/noteCheckingService';
import { getSubjectsForBatch } from '../../../data/ncertSyllabusData';

interface NoteCheckingProps {
  onBack?: () => void;
}

const gradeLabel = (batch: string) => (['A1', 'A2'].includes(batch) ? 'Plus One' : 'Plus Two');

// Local calendar day (YYYY-MM-DD) of an ISO timestamp.
const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const dayLabel = (key: string) =>
  new Date(`${key}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
const shortDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';

interface DoneItem {
  id: string;
  number: number;
  title: string;
  subject: string;
  at: string;
}

export default function NoteChecking({ onBack }: NoteCheckingProps) {
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [summaries, setSummaries] = useState<Record<string, NoteSummary>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [batch, setBatch] = useState<string>(NOTE_BATCHES[0]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'latest'>('name');
  const [selected, setSelected] = useState<AttendanceStudent | null>(null);
  const [progress, setProgress] = useState<NoteProgressMap>({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [activeSubject, setActiveSubject] = useState('');
  const [profileView, setProfileView] = useState<'subject' | 'day'>('subject');
  const [allChapters, setAllChapters] = useState<Record<string, NoteProgressMap>>({});
  const printRef = useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = useState<number | null>(null);
  const [printMode, setPrintMode] = useState<'student' | 'batch' | null>(null);

  useEffect(() => {
    document.title = 'Note Checking • AIMS PLUS';
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, c] = await Promise.all([fetchAttendanceStudents(), fetchAllNoteSummaries()]);
      setStudents(s);
      setSummaries(c);
    } catch (e: any) {
      setError(e?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const subjects = useMemo(() => (selected ? getSubjectsForBatch(selected.batch) : []), [selected]);
  const totalChapters = useMemo(() => subjects.reduce((n, s) => n + s.chapters.length, 0), [subjects]);

  const openStudent = async (s: AttendanceStudent) => {
    setSelected(s);
    setProgress({});
    setProfileView('subject');
    setActiveSubject(getSubjectsForBatch(s.batch)[0]?.id || '');
    setProgressLoading(true);
    try {
      setProgress(await fetchNoteProgress(s.enrollNumber));
    } catch (e: any) {
      setError(e?.message || 'Failed to load progress');
    } finally {
      setProgressLoading(false);
    }
  };

  const closeStudent = () => {
    setSelected(null);
    fetchAllNoteSummaries().then(setSummaries).catch(() => {});
  };

  const doneCount = Object.values(progress).filter(p => p.done).length;

  // Completed chapters grouped by the day they were ticked, newest day first.
  const doneByDay = useMemo(() => {
    const items: DoneItem[] = [];
    subjects.forEach(s =>
      s.chapters.forEach(c => {
        const p = progress[c.id];
        if (p?.done) items.push({ id: c.id, number: c.number, title: c.title, subject: s.name, at: p.at });
      })
    );
    items.sort((a, b) => b.at.localeCompare(a.at));
    const groups: { day: string; items: DoneItem[] }[] = [];
    items.forEach(it => {
      const k = dayKey(it.at);
      const g = groups[groups.length - 1];
      if (g && g.day === k) g.items.push(it);
      else groups.push({ day: k, items: [it] });
    });
    return groups;
  }, [subjects, progress]);

  const toggle = async (chapterId: string) => {
    if (!selected) return;
    const next = !progress[chapterId]?.done;
    const prev = progress;
    setProgress({ ...progress, [chapterId]: { done: next, at: new Date().toISOString() } });
    try {
      await setChapterDone(selected, chapterId, next);
    } catch (e: any) {
      setProgress(prev);
      setError(e?.message || 'Failed to save');
    }
  };

  const toggleSubject = async (subjectId: string, done: boolean) => {
    if (!selected) return;
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;
    const ids = subject.chapters.map(c => c.id);
    const prev = progress;
    const now = new Date().toISOString();
    const patch: NoteProgressMap = { ...progress };
    ids.forEach(id => (patch[id] = { done, at: now }));
    setProgress(patch);
    try {
      await setManyChaptersDone(selected, ids, done);
    } catch (e: any) {
      setProgress(prev);
      setError(e?.message || 'Failed to save');
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = students.filter(s => (q ? s.name.toLowerCase().includes(q) : s.batch === batch));
    if (sortBy === 'latest') {
      list.sort((a, b) => {
        const la = summaries[a.enrollNumber]?.lastTick || '';
        const lb = summaries[b.enrollNumber]?.lastTick || '';
        return lb.localeCompare(la) || a.name.localeCompare(b.name);
      });
    }
    return list;
  }, [students, batch, query, sortBy, summaries]);

  const print = async (mode: 'student' | 'batch') => {
    if (mode === 'batch') {
      try {
        setAllChapters(await fetchAllNoteChapters());
      } catch (e: any) {
        setError(e?.message || 'Failed to load chapter ticks');
        return;
      }
    }
    setPageHeight(null);
    setPrintMode(mode);
    // Render the sheet, measure it, then size the page to fit so nothing breaks across pages.
    setTimeout(() => {
      const px = printRef.current?.scrollHeight || 0;
      setPageHeight(Math.ceil((px * 25.4) / 96) + 4);
      setTimeout(() => {
        window.print();
        setPrintMode(null);
        setPageHeight(null);
      }, 150);
    }, 200);
  };

  const batchSubjects = useMemo(() => getSubjectsForBatch(batch), [batch]);

  const printedOn = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const header = (
    <div className="flex items-center gap-3 mb-4">
      {(selected || onBack) && (
        <button
          onClick={selected ? closeStudent : onBack}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-gray-900 truncate">{selected ? selected.name : 'Note Checking'}</h1>
        <p className="text-xs text-gray-500">
          {selected
            ? `${selected.batch} • ${gradeLabel(selected.batch)} • ${doneCount}/${totalChapters} chapters`
            : 'Tick the chapters whose notes are completed'}
        </p>
      </div>
      {selected ? (
        <button
          onClick={() => print('student')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-indigo-300"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
      ) : (
        <>
          <button
            onClick={() => print('batch')}
            disabled={loading || query.trim() !== ''}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-indigo-300 disabled:opacity-40"
            title="Print the selected batch"
          >
            <Printer className="w-4 h-4" /> Print batch
          </button>
          <button onClick={load} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="Reload">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-50 print:hidden">
        <div className="max-w-3xl mx-auto p-4">
          {header}

          {error && (
            <div className="mb-3 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
          )}

          {!selected && (
            <>
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {NOTE_BATCHES.map(b => (
                  <button
                    key={b}
                    onClick={() => {
                      setBatch(b);
                      setQuery('');
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border whitespace-nowrap ${
                      batch === b && !query
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <div className="relative mb-3">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search student name (all batches)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-16 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {filtered.length} students
                    </p>
                    <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden text-xs font-semibold">
                      {(['name', 'latest'] as const).map(k => (
                        <button
                          key={k}
                          onClick={() => setSortBy(k)}
                          className={`px-3 py-1.5 ${sortBy === k ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
                        >
                          {k === 'name' ? 'Name' : 'Latest tick'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                    {filtered.map(s => {
                      const total = getSubjectsForBatch(s.batch).reduce((n, x) => n + x.chapters.length, 0);
                      const sum = summaries[s.enrollNumber];
                      const done = sum?.count || 0;
                      return (
                        <button
                          key={s.enrollNumber}
                          onClick={() => openStudent(s)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-indigo-50"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{s.name}</div>
                            <div className="text-xs text-gray-500">
                              {s.batch} • last tick {shortDate(sum?.lastTick || null)}
                            </div>
                          </div>
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              done > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {done}/{total}
                          </span>
                        </button>
                      );
                    })}
                    {filtered.length === 0 && (
                      <div className="p-8 text-center text-sm text-gray-400">No students found</div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {selected && (
            <>
              <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden text-sm font-semibold mb-3 w-fit">
                {(['subject', 'day'] as const).map(k => (
                  <button
                    key={k}
                    onClick={() => setProfileView(k)}
                    className={`px-4 py-2 ${profileView === k ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
                  >
                    {k === 'subject' ? 'By subject' : 'By day (latest first)'}
                  </button>
                ))}
              </div>

              {progressLoading ? (
                <div className="flex justify-center py-16 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : profileView === 'day' ? (
                <div className="space-y-4">
                  {doneByDay.length === 0 && (
                    <div className="p-8 text-center text-sm text-gray-400 bg-white rounded-xl border border-gray-200">
                      No chapters ticked yet
                    </div>
                  )}
                  {doneByDay.map(g => (
                    <div key={g.day}>
                      <div className="text-xs font-bold text-gray-500 uppercase mb-1.5">
                        {dayLabel(g.day)} • {g.items.length}
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                        {g.items.map(it => (
                          <button
                            key={it.id}
                            onClick={() => toggle(it.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                          >
                            <span className="w-6 h-6 shrink-0 rounded-md bg-emerald-500 text-white flex items-center justify-center">
                              <Check className="w-4 h-4" />
                            </span>
                            <span className="flex-1 text-sm text-gray-900">
                              <span className="text-gray-400 mr-2">{it.number}.</span>
                              {it.title}
                              <span className="block text-xs text-gray-500">{it.subject}</span>
                            </span>
                            <span className="text-xs text-gray-400">{timeLabel(it.at)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-3 overflow-x-auto">
                    {subjects.map(s => {
                      const d = s.chapters.filter(c => progress[c.id]?.done).length;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setActiveSubject(s.id)}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold border whitespace-nowrap ${
                            activeSubject === s.id
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-700 border-gray-200'
                          }`}
                        >
                          {s.name} {d}/{s.chapters.length}
                        </button>
                      );
                    })}
                  </div>
                  {subjects
                    .filter(s => s.id === activeSubject)
                    .map(s => {
                      const allDone = s.chapters.every(c => progress[c.id]?.done);
                      return (
                        <div key={s.id}>
                          <div className="flex justify-end mb-2">
                            <button
                              onClick={() => toggleSubject(s.id, !allDone)}
                              className="text-xs font-semibold text-indigo-600 hover:underline"
                            >
                              {allDone ? 'Untick all' : 'Tick all'}
                            </button>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                            {s.chapters.map(c => {
                              const p = progress[c.id];
                              const done = !!p?.done;
                              return (
                                <button
                                  key={c.id}
                                  onClick={() => toggle(c.id)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                                >
                                  <span
                                    className={`w-6 h-6 shrink-0 rounded-md border flex items-center justify-center ${
                                      done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 bg-white'
                                    }`}
                                  >
                                    {done && <Check className="w-4 h-4" />}
                                  </span>
                                  <span className="flex-1 text-sm text-gray-900">
                                    <span className="text-gray-400 mr-2">{c.number}.</span>
                                    {c.title}
                                  </span>
                                  {done && <span className="text-xs text-gray-400">{shortDate(p.at)}</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Print sheet: one continuous page sized to its content (no page breaks) */}
      {printMode && (
        <div
          ref={printRef}
          className="fixed -left-[10000px] top-0 w-[210mm] bg-white text-black box-border p-[10mm] print:static print:left-0"
          style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' } as React.CSSProperties}
        >
          {pageHeight && (
            <style>{`@media print { @page { size: 210mm ${pageHeight}mm; margin: 0; } html, body { background: #fff !important; } }`}</style>
          )}

          <div className="flex items-end justify-between border-b-4 border-black pb-3 mb-4">
            <div>
              <div className="text-[11px] font-bold tracking-[0.25em] text-gray-600">AIMS PLUS</div>
              <h1 className="text-2xl font-extrabold leading-tight">Note Checking</h1>
            </div>
            <div className="text-right text-[11px] text-gray-600">
              {printMode === 'batch' ? `Batch ${batch} • ${gradeLabel(batch)}` : selected ? `${selected.batch} • ${gradeLabel(selected.batch)}` : ''}
              <br />
              Printed {printedOn}
            </div>
          </div>

          {printMode === 'student' && selected && (
            <>
              <div className="flex items-center justify-between rounded-lg border-2 border-black px-4 py-3 mb-5">
                <div className="text-xl font-extrabold">{selected.name}</div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold leading-none">
                    {doneCount}/{totalChapters}
                  </div>
                  <div className="text-[10px] text-gray-600">chapters completed</div>
                </div>
              </div>

              <h2 className="text-sm font-extrabold uppercase tracking-wider mb-2">Chapter-wise</h2>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
                {subjects.map(s => {
                  const d = s.chapters.filter(c => progress[c.id]?.done).length;
                  return (
                    <div key={s.id}>
                      <div className="flex justify-between border-b-2 border-black pb-1 mb-1 text-[12px] font-extrabold">
                        <span>{s.name}</span>
                        <span>
                          {d}/{s.chapters.length}
                        </span>
                      </div>
                      {s.chapters.map((c, ci) => {
                        const p = progress[c.id];
                        return (
                          <div
                            key={c.id}
                            className={`flex items-center gap-2 px-1 py-[3px] text-[11px] ${ci % 2 ? 'bg-gray-100' : ''}`}
                          >
                            <span
                              className={`inline-flex shrink-0 items-center justify-center w-[15px] h-[15px] border-[1.5px] border-black text-[11px] leading-none ${
                                p?.done ? 'bg-black text-white font-bold' : 'bg-white'
                              }`}
                            >
                              {p?.done ? '✓' : ''}
                            </span>
                            <span className="flex-1">
                              <span className="text-gray-500">{c.number}.</span> {c.title}
                            </span>
                            {p?.done && <span className="text-[9px] text-gray-600 whitespace-nowrap">{shortDate(p.at)}</span>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <h2 className="text-sm font-extrabold uppercase tracking-wider mb-2">Completed by day (latest first)</h2>
              {doneByDay.length === 0 && <p className="text-[11px] text-gray-600">None yet.</p>}
              {doneByDay.map(g => (
                <div key={g.day} className="mb-2">
                  <div className="text-[11px] font-bold bg-gray-200 px-2 py-[2px]">
                    {dayLabel(g.day)} • {g.items.length}
                  </div>
                  {g.items.map(it => (
                    <div key={it.id} className="text-[11px] px-2 py-[2px] border-b border-gray-200">
                      <b>{it.subject}</b> — {it.number}. {it.title}
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {printMode === 'batch' && (
            <>
              <p className="text-[11px] text-gray-600 mb-3">
                {filtered.length} students • each square is a chapter number; <b>filled</b> = notes completed
              </p>
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-black text-white text-left">
                    <th className="py-1.5 pl-2 pr-1 w-6">#</th>
                    <th className="py-1.5 pr-2">Student</th>
                    {batchSubjects.map(sub => (
                      <th key={sub.id} className="py-1.5 px-2">
                        {sub.name}
                      </th>
                    ))}
                    <th className="py-1.5 px-2 text-center">Done</th>
                    <th className="py-1.5 pr-2">Last</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const total = batchSubjects.reduce((n, x) => n + x.chapters.length, 0);
                    const chap = allChapters[s.enrollNumber] || {};
                    const sum = summaries[s.enrollNumber];
                    return (
                      <tr key={s.enrollNumber} className={`align-top border-b border-gray-300 ${i % 2 ? 'bg-gray-100' : ''}`}>
                        <td className="py-1.5 pl-2 pr-1 text-gray-600">{i + 1}</td>
                        <td className="py-1.5 pr-2 font-bold">{s.name}</td>
                        {batchSubjects.map(sub => (
                          <td key={sub.id} className="py-1.5 px-2">
                            <div className="flex flex-wrap gap-[3px]">
                              {sub.chapters.map(c => {
                                const done = !!chap[c.id]?.done;
                                return (
                                  <span
                                    key={c.id}
                                    className={`inline-flex items-center justify-center w-[19px] h-[19px] border-[1.5px] border-black text-[9px] leading-none ${
                                      done ? 'bg-black text-white font-bold' : 'bg-white text-gray-500'
                                    }`}
                                  >
                                    {c.number}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        ))}
                        <td className="py-1.5 px-2 text-center font-bold whitespace-nowrap">
                          {sum?.count || 0}/{total}
                        </td>
                        <td className="py-1.5 pr-2 whitespace-nowrap text-gray-600">{shortDate(sum?.lastTick || null)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </>
  );
}
