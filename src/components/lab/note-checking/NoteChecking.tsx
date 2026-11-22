import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Search, Check, RefreshCw, Loader2, Users, Printer, Download, Mic, MicOff, Star } from 'lucide-react';
import {
  AttendanceStudent,
  NoteProgressMap,
  NoteSummary,
  NOTE_BATCHES,
  fetchAttendanceStudents,
  fetchNoteProgress,
  fetchAllNoteChapters,
  setChapterDone,
  setChapterPartial,
  setManyChaptersDone,
  NoteBatchConfig,
  fetchNoteConfig,
  setIdealStudent,
  LeaveVerifiedEntry,
  fetchLeaveVerified,
  setLeaveVerified
} from '../../../services/noteCheckingService';
import { getSubjectsForBatch } from '../../../data/ncertSyllabusData';
import { exportSheetToPdf } from './pdfExport';
import { matchChapter } from './voiceMatch';

// Print layout: portrait A4 with a fixed number of students per page, one single-line row each.
const PRINT_ROWS_PER_PAGE = 50;

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

type Status = 'green' | 'yellow' | 'red';

// Screen badge colours and print colours per status.
const STATUS_BADGE: Record<Status, string> = {
  green: 'bg-emerald-100 text-emerald-700',
  yellow: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700'
};
const STATUS_PRINT: Record<Status, string> = {
  green: 'bg-green-200 text-green-900',
  yellow: 'bg-yellow-200 text-yellow-900',
  red: 'bg-red-200 text-red-900'
};
// Solid bar fills for the printed subject progress bars.
const PRINT_BAR: Record<Status, string> = { green: '#16a34a', yellow: '#eab308', red: '#dc2626' };
const STATUS_BAR: Record<Status, string> = {
  green: 'border-green-600',
  yellow: 'border-yellow-500',
  red: 'border-red-600'
};

// Consecutive chapter numbers collapse into ranges: [1,2,3,5] -> "1–3,5".
const fmtRanges = (nums: number[]) => {
  const n = [...nums].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < n.length; ) {
    let j = i;
    while (j + 1 < n.length && n[j + 1] === n[j] + 1) j++;
    parts.push(j - i >= 2 ? `${n[i]}–${n[j]}` : n.slice(i, j + 1).join(','));
    i = j + 1;
  }
  return parts.join(',');
};

// One student's standing in one subject. `missing` holds the chapter numbers that most of the batch has
// completed but this student has not; the status follows from how much of that expected set is missing.
interface SubjectStat {
  id: string;
  name: string;
  done: number;
  total: number;
  expected: number;
  missing: number[];
  status: Status;
}

const missingStatus = (missing: number, expected: number): Status =>
  missing === 0 ? 'green' : missing * 2 <= expected ? 'yellow' : 'red';

interface DoneItem {
  id: string;
  partial?: boolean;
  number: number;
  title: string;
  subject: string;
  at: string;
}

export default function NoteChecking({ onBack }: NoteCheckingProps) {
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [batch, setBatch] = useState<string>(NOTE_BATCHES[0]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'latest' | 'progress'>('name');
  const [progressDesc, setProgressDesc] = useState(true);
  const [selected, setSelected] = useState<AttendanceStudent | null>(null);
  const [progress, setProgress] = useState<NoteProgressMap>({});
  const [progressLoading, setProgressLoading] = useState(false);
  const [activeSubject, setActiveSubject] = useState('');
  const [profileView, setProfileView] = useState<'subject' | 'day'>('subject');
  const [allChapters, setAllChapters] = useState<Record<string, NoteProgressMap>>({});
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [incompleteOnly, setIncompleteOnly] = useState(false);
  const [printMode, setPrintMode] = useState<'student' | 'batch' | 'partial' | 'leave' | null>(null);
  // Partial check mode: tapping a chapter marks it partially checked (not complete) instead of done.
  const [partialMode, setPartialMode] = useState(false);
  const [listView, setListView] = useState<'students' | 'partial' | 'leave'>('students');
  const [config, setConfig] = useState<Record<string, NoteBatchConfig>>({});
  // Leave notes verified: one tick per student per day; `leaveByDay[day][enroll]`.
  const today = dayKey(new Date().toISOString());
  const [leaveDay, setLeaveDay] = useState(today);
  const [leaveByDay, setLeaveByDay] = useState<Record<string, Record<string, LeaveVerifiedEntry>>>({});
  const [leavePending, setLeavePending] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef<{ id: string; t: number }>({ id: '', t: 0 });
  const [listening, setListening] = useState(false);
  const [voiceMsg, setVoiceMsg] = useState('');
  const [voiceOk, setVoiceOk] = useState<'ok' | 'err' | ''>('');
  const [interim, setInterim] = useState('');
  const [hearing, setHearing] = useState(false);
  const recogRef = useRef<any>(null);

  useEffect(() => {
    document.title = 'Note Checking • AIMS PLUS';
    load();
  }, []);

  const load = async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    try {
      const [s, c, cfg] = await Promise.all([
        fetchAttendanceStudents(forceRefresh),
        fetchAllNoteChapters(),
        fetchNoteConfig().catch(() => ({}))
      ]);
      setStudents(s);
      setAllChapters(c);
      setConfig(cfg);
    } catch (e: any) {
      setError(e?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    [today, leaveDay].forEach(d => {
      if (!leaveByDay[d]) fetchLeaveVerified(d).then(m => setLeaveByDay(p => (p[d] ? p : { ...p, [d]: m }))).catch(() => {});
    });
  }, [leaveDay]);

  const leaveToday = leaveByDay[today] || {};
  const toggleLeaveVerified = async (st: AttendanceStudent) => {
    const on = !leaveToday[st.enrollNumber];
    const prev = leaveByDay;
    setLeaveByDay(p => {
      const d = { ...(p[today] || {}) };
      if (on) d[st.enrollNumber] = { at: new Date().toISOString(), name: st.name, batch: st.batch };
      else delete d[st.enrollNumber];
      return { ...p, [today]: d };
    });
    try {
      await setLeaveVerified(st, today, on);
    } catch (e: any) {
      setLeaveByDay(prev);
      setError(e?.message || 'Failed to save');
    }
  };

  const leaveDayMap = leaveByDay[leaveDay] || {};
  const leaveRows = useMemo(() => {
    const inBatch = students.filter(x => x.batch === batch);
    const ok = inBatch.filter(x => leaveDayMap[x.enrollNumber]).sort((a, b) => a.name.localeCompare(b.name));
    const pending = inBatch.filter(x => !leaveDayMap[x.enrollNumber]);
    return { ok, pending };
  }, [students, batch, leaveDayMap]);

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
    fetchAllNoteChapters().then(setAllChapters).catch(() => {});
  };

  const doneCount = Object.values(progress).filter(p => p.done).length;

  // Completed chapters grouped by the day they were ticked, newest day first.
  const doneByDay = useMemo(() => {
    const items: DoneItem[] = [];
    subjects.forEach(s =>
      s.chapters.forEach(c => {
        const p = progress[c.id];
        if (p?.done || p?.partial) items.push({ id: c.id, partial: !p.done, number: c.number, title: c.title, subject: s.name, at: p.at });
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

  // Partial check: only for chapters that are not done; tapping again clears it.
  const togglePartial = async (chapterId: string) => {
    if (!selected || progress[chapterId]?.done) return;
    const next = !progress[chapterId]?.partial;
    const prev = progress;
    setProgress({ ...progress, [chapterId]: { done: false, partial: next, at: new Date().toISOString() } });
    try {
      await setChapterPartial(selected, chapterId, next);
    } catch (e: any) {
      setProgress(prev);
      setError(e?.message || 'Failed to save');
    }
  };

  // Forces a chapter to partial (or clears it), whatever its current state.
  const applyPartial = async (chapterId: string, partial: boolean) => {
    if (!selected) return;
    const prev = progress;
    setProgress(p => ({ ...p, [chapterId]: { done: false, partial, at: new Date().toISOString() } }));
    try {
      await setChapterPartial(selected, chapterId, partial);
    } catch (e: any) {
      setProgress(prev);
      setError(e?.message || 'Failed to save');
    }
  };

  // Single tap ticks (or partial in partial mode); a quick second tap on the same chapter makes it partial.
  const tapChapter = (chapterId: string) => {
    if (partialMode) return togglePartial(chapterId);
    const now = Date.now();
    const dbl = lastTap.current.id === chapterId && now - lastTap.current.t < 350;
    lastTap.current = dbl ? { id: '', t: 0 } : { id: chapterId, t: now };
    return dbl ? applyPartial(chapterId, true) : toggle(chapterId);
  };

  // Voice tick: say a chapter name of the open subject; add "partial" to mark it partially checked.
  const handleSpeech = async (text: string) => {
    if (!selected) return;
    const sub = subjects.find(x => x.id === activeSubject);
    if (!sub) return;
    const m = matchChapter(text, sub.chapters);
    if (!m.chapterId) {
      setVoiceOk('err');
      navigator.vibrate?.([60, 40, 60]);
      setVoiceMsg(`“${text}” — ${m.reason === 'ambiguous' ? 'matches more than one chapter' : 'no match in ' + sub.name}`);
      return;
    }
    const ch = sub.chapters.find(c => c.id === m.chapterId)!;
    const cur = progressRef.current[ch.id];
    if (m.partial) {
      if (!cur?.done) await applyPartial(ch.id, true);
    } else if (!cur?.done) {
      const prev = progressRef.current;
      setProgress(p => ({ ...p, [ch.id]: { done: true, at: new Date().toISOString() } }));
      try {
        await setChapterDone(selected, ch.id, true);
      } catch (e: any) {
        setProgress(prev);
        setError(e?.message || 'Failed to save');
      }
    }
    setVoiceOk('ok');
    navigator.vibrate?.(40);
    setVoiceMsg(`${m.partial ? '½ ' : '✓ '}${ch.number}. ${ch.title}${cur?.done ? ' (already done)' : ''}`);
  };

  const speechRef = useRef(handleSpeech);
  speechRef.current = handleSpeech;
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const stopListening = () => {
    recogRef.current?.stop();
    recogRef.current = null;
    setListening(false);
    setInterim('');
    setHearing(false);
  };
  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setVoiceMsg('Voice input is not supported in this browser (use Chrome)');
      return;
    }
    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-IN';
    r.onresult = (e: any) => {
      let live = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) speechRef.current(e.results[i][0].transcript);
        else live += e.results[i][0].transcript;
      }
      setInterim(live);
    };
    r.onspeechstart = () => setHearing(true);
    r.onspeechend = () => setHearing(false);
    r.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setVoiceMsg(`Voice error: ${e.error}`);
        if (e.error === 'not-allowed') stopListening();
      }
    };
    // Chrome ends the session after silence; restart while the button is on.
    r.onend = () => {
      if (recogRef.current === r) {
        try { r.start(); } catch { /* already running */ }
      }
    };
    recogRef.current = r;
    setVoiceMsg('');
    setVoiceOk('');
    setListening(true);
    r.start();
  };
  useEffect(() => () => recogRef.current?.stop(), []);
  useEffect(() => {
    if (!selected && recogRef.current) stopListening();
  }, [selected]);

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

  // Done-count and latest tick per student, derived from the one read of every student's ticks.
  const summaries = useMemo(() => {
    const out: Record<string, NoteSummary> = {};
    Object.entries(allChapters).forEach(([id, chap]) => {
      const done = Object.values(chap).filter(c => c?.done);
      out[id] = { count: done.length, lastTick: done.reduce<string | null>((m, c) => (!m || c.at > m ? c.at : m), null) };
    });
    return out;
  }, [allChapters]);

  // Chapters "expected" per batch and subject: done by more than half of the batch's students who have any tick
  // (students with no ticks yet are the unchecked majority and would make every chapter look unexpected).
  const expectedByBatch = useMemo(() => {
    const out: Record<string, Record<string, Set<string>>> = {};
    NOTE_BATCHES.forEach(b => {
      const checked = students.filter(s => s.batch === b && (summaries[s.enrollNumber]?.count || 0) > 0);
      const per: Record<string, Set<string>> = {};
      // An ideal (complete) student, when set, defines the expected chapters instead of the class majority.
      const ideal = config[b]?.idealEnroll ? allChapters[config[b].idealEnroll!] : undefined;
      getSubjectsForBatch(b).forEach(sub => {
        per[sub.id] = new Set(
          sub.chapters
            .filter(c =>
              ideal
                ? ideal[c.id]?.done
                : checked.filter(s => allChapters[s.enrollNumber]?.[c.id]?.done).length * 2 > checked.length
            )
            .map(c => c.id)
        );
      });
      out[b] = per;
    });
    return out;
  }, [students, summaries, allChapters, config]);

  const statsOf = useMemo(() => {
    const out: Record<string, SubjectStat[]> = {};
    students.forEach(s => {
      const chap = allChapters[s.enrollNumber] || {};
      out[s.enrollNumber] = getSubjectsForBatch(s.batch).map(sub => {
        const exp = expectedByBatch[s.batch]?.[sub.id] || new Set<string>();
        const missing = sub.chapters.filter(c => exp.has(c.id) && !chap[c.id]?.done).map(c => c.number);
        return {
          id: sub.id,
          name: sub.name,
          done: sub.chapters.filter(c => chap[c.id]?.done).length,
          total: sub.chapters.length,
          expected: exp.size,
          missing,
          status: missingStatus(missing.length, exp.size)
        };
      });
    });
    return out;
  }, [students, allChapters, expectedByBatch]);

  // Class average of ticked chapters per batch. Students with no ticks are left out of the average
  // (they are the majority and would drag it to ~0).
  const batchAvg = useMemo(() => {
    const acc: Record<string, { total: number; n: number }> = {};
    students.forEach(s => {
      const c = summaries[s.enrollNumber]?.count || 0;
      if (c <= 0) return;
      const a = (acc[s.batch] ||= { total: 0, n: 0 });
      a.total += c;
      a.n += 1;
    });
    return Object.fromEntries(Object.entries(acc).map(([b, v]) => [b, v.total / v.n])) as Record<string, number>;
  }, [students, summaries]);

  // green: at/above class average • yellow: below it • red: no ticks, or below a quarter of the average
  const statusFor = (count: number, studentBatch: string): Status => {
    const avg = batchAvg[studentBatch] || 0;
    if (count <= 0 || count < avg / 4) return 'red';
    if (count < avg) return 'yellow';
    return 'green';
  };

  // Overall colour: against the ideal student when one is set (share of expected chapters missing), else the class average.
  const overallStatus = (s: AttendanceStudent, count: number): Status => {
    if (!config[s.batch]?.idealEnroll) return statusFor(count, s.batch);
    const st = statsOf[s.enrollNumber] || [];
    return missingStatus(
      st.reduce((n, x) => n + x.missing.length, 0),
      st.reduce((n, x) => n + x.expected, 0)
    );
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = students.filter(s =>
      q ? s.name.toLowerCase().includes(q) || s.enrollNumber.toLowerCase().includes(q) : s.batch === batch
    );
    const inSubject = (st: SubjectStat) => subjectFilter === 'all' || st.id === subjectFilter;
    // Subject / incomplete filters apply to the batch view only, not to a cross-batch search.
    if (!q && incompleteOnly) {
      list = list.filter(s => (statsOf[s.enrollNumber] || []).some(st => inSubject(st) && st.missing.length > 0));
    }
    const progressOf = (s: AttendanceStudent) =>
      !q && subjectFilter !== 'all'
        ? statsOf[s.enrollNumber]?.find(st => st.id === subjectFilter)?.done || 0
        : summaries[s.enrollNumber]?.count || 0;
    if (sortBy === 'latest') {
      list.sort((a, b) => {
        const la = summaries[a.enrollNumber]?.lastTick || '';
        const lb = summaries[b.enrollNumber]?.lastTick || '';
        return lb.localeCompare(la) || a.name.localeCompare(b.name);
      });
    } else if (sortBy === 'progress') {
      list.sort((a, b) => {
        const ca = progressOf(a);
        const cb = progressOf(b);
        return (progressDesc ? cb - ca : ca - cb) || a.name.localeCompare(b.name);
      });
    }
    return list;
  }, [students, batch, query, sortBy, progressDesc, summaries, statsOf, subjectFilter, incompleteOnly]);

  // Students with partially checked chapters in the open batch, grouped by the day the partial check was made.
  const partialGroups = useMemo(() => {
    const lookup = new Map<string, { subject: string; order: number; number: number }>();
    getSubjectsForBatch(batch).forEach((sub, si) =>
      sub.chapters.forEach(c => lookup.set(c.id, { subject: sub.name, order: si, number: c.number }))
    );
    const byDay = new Map<string, Map<string, { student: AttendanceStudent; items: { subject: string; order: number; number: number }[] }>>();
    students
      .filter(s => s.batch === batch)
      .forEach(s => {
        Object.entries(allChapters[s.enrollNumber] || {}).forEach(([id, e]) => {
          const meta = lookup.get(id);
          if (!meta || !e?.partial || e.done) return;
          const day = dayKey(e.at);
          const m = byDay.get(day) || new Map();
          const entry = m.get(s.enrollNumber) || { student: s, items: [] };
          entry.items.push(meta);
          m.set(s.enrollNumber, entry);
          byDay.set(day, m);
        });
      });
    return [...byDay.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([day, m]) => ({
        day,
        students: [...m.values()]
          .sort((a, b) => a.student.name.localeCompare(b.student.name))
          .map(({ student, items }) => {
            const subs = new Map<string, { order: number; nums: number[] }>();
            items.forEach(it => {
              const g = subs.get(it.subject) || { order: it.order, nums: [] };
              g.nums.push(it.number);
              subs.set(it.subject, g);
            });
            return {
              student,
              parts: [...subs.entries()].sort((a, b) => a[1].order - b[1].order).map(([subject, g]) => ({ subject, nums: g.nums }))
            };
          })
      }));
  }, [students, allChapters, batch]);
  const partialStudentCount = new Set(partialGroups.flatMap(g => g.students.map(x => x.student.enrollNumber))).size;

  const print = (mode: 'student' | 'batch' | 'partial' | 'leave') => {
    setPrintMode(mode);
    // Give React a moment to render the print sheet, then open the browser print dialog (real A4 pages).
    setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 200);
  };

  const batchSubjects = useMemo(() => getSubjectsForBatch(batch), [batch]);
  // The printed list shows only the filtered subject when a subject filter is on.
  const printSubjects = subjectFilter === 'all' ? batchSubjects : batchSubjects.filter(x => x.id === subjectFilter);

  const downloadPdf = (mode: 'student' | 'batch' | 'partial' | 'leave') => {
    setPrintMode(mode);
    setPdfBusy(true);
    setTimeout(async () => {
      try {
        const who = mode === 'student' ? selected?.name.replace(/\s+/g, '-') : batch;
        await exportSheetToPdf(
          sheetRef.current!,
          `Note-checking_${who}${mode === 'partial' ? '_partial' : mode === 'leave' ? '_leave-verified' : ''}_${mode === 'leave' ? leaveDay : new Date().toISOString().slice(0, 10)}.pdf`,
          mode === 'batch' ? 8 : 10
        );
      } catch (e: any) {
        setError(e?.message || 'Failed to create PDF');
      } finally {
        setPrintMode(null);
        setPdfBusy(false);
      }
    }, 300);
  };

  const idealOf = (b: string) => students.find(x => x.enrollNumber === config[b]?.idealEnroll);
  const toggleIdeal = async () => {
    if (!selected) return;
    const isIdeal = config[selected.batch]?.idealEnroll === selected.enrollNumber;
    const prev = config;
    setConfig({ ...config, [selected.batch]: isIdeal ? {} : { idealEnroll: selected.enrollNumber } });
    try {
      await setIdealStudent(selected.batch, isIdeal ? null : selected.enrollNumber);
    } catch (e: any) {
      setConfig(prev);
      setError(e?.message || 'Failed to save');
    }
  };

  const printedOn = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const header = (
    <div className="flex items-center gap-2 mb-4">
      {(selected || onBack) && (
        <button
          onClick={selected ? closeStudent : onBack}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <div className="flex-1 min-w-0 basis-0">
        <h1 className="text-xl font-bold text-gray-900 truncate">{selected ? selected.name : 'Note Checking'}</h1>
        <p className="text-xs text-gray-500 truncate">
          {selected
            ? `${selected.batch} • ${gradeLabel(selected.batch)} • ${doneCount}/${totalChapters} chapters`
            : 'Tick completed notes'}
        </p>
      </div>
      {selected ? (
        <>
        <button
          onClick={() => downloadPdf('student')}
          disabled={pdfBusy}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-indigo-300 disabled:opacity-40"
        >
          {pdfBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}<span className="hidden sm:inline">PDF</span>
        </button>
        <button
          onClick={() => print('student')}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-indigo-300"
        >
          <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Print</span>
        </button>
        </>
      ) : (
        <>
          <button
            onClick={() => downloadPdf(listView === 'partial' ? 'partial' : listView === 'leave' ? 'leave' : 'batch')}
            disabled={pdfBusy || loading || (listView === 'students' && query.trim() !== '') || (listView === 'partial' && partialGroups.length === 0) || (listView === 'leave' && leaveRows.ok.length === 0)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-indigo-300 disabled:opacity-40"
            title="Download the current list as PDF"
          >
            {pdfBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}<span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={() => print(listView === 'partial' ? 'partial' : listView === 'leave' ? 'leave' : 'batch')}
            disabled={loading || (listView === 'students' && query.trim() !== '') || (listView === 'partial' && partialGroups.length === 0) || (listView === 'leave' && leaveRows.ok.length === 0)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-indigo-300 disabled:opacity-40"
            title="Print the selected batch"
          >
            <Printer className="w-4 h-4" /> <span className="hidden sm:inline">{listView === 'students' ? 'Print batch' : 'Print list'}</span>
          </button>
          <button onClick={() => load(true)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="Reload">
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
                      setSubjectFilter('all');
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

              <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden text-sm font-semibold mb-3 w-fit">
                {(['students', 'partial', 'leave'] as const).map(k => (
                  <button
                    key={k}
                    onClick={() => setListView(k)}
                    className={`px-4 py-2 ${listView === k ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
                  >
                    {k === 'students'
                      ? 'Students'
                      : k === 'partial'
                        ? `Partial checks${partialStudentCount ? ` (${partialStudentCount})` : ''}`
                        : 'Leave notes'}
                  </button>
                ))}
              </div>

              {listView === 'students' && (
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search student name or enroll no. (all batches)"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
              )}

              {listView === 'students' && !query && !loading && (
                <div className="mb-3">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {[{ id: 'all', name: 'All subjects' }, ...batchSubjects].map(sub => {
                      const incomplete = students.filter(
                        st =>
                          st.batch === batch &&
                          (statsOf[st.enrollNumber] || []).some(x => (sub.id === 'all' || x.id === sub.id) && x.missing.length > 0)
                      ).length;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => setSubjectFilter(sub.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap ${
                            subjectFilter === sub.id
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          {sub.name}
                          <span className={`ml-1.5 ${subjectFilter === sub.id ? 'text-indigo-100' : 'text-red-500'}`}>
                            {incomplete} incomplete
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <label className="flex items-center gap-2 mt-2 text-xs text-gray-600 w-fit cursor-pointer">
                    <input type="checkbox" checked={incompleteOnly} onChange={e => setIncompleteOnly(e.target.checked)} />
                    Show only incomplete students
                  </label>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {config[batch]?.idealEnroll
                      ? `Incomplete = missing a chapter that the ideal student (${students.find(x => x.enrollNumber === config[batch].idealEnroll)?.name || '—'}) has completed.`
                      : `Incomplete = missing a chapter that most checked students in ${batch} have completed.`}
                  </p>
                </div>
              )}

              {listView === 'leave' ? (
                loading ? (
                  <div className="flex justify-center py-16 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[11px] text-gray-400">
                      Students whose leave notes were verified as up to date. The tick is per day (open a student and tap “Leave
                      notes verified” — it starts fresh every day). Pick any date to see that day’s list.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="date"
                        value={leaveDay}
                        max={today}
                        onChange={e => e.target.value && setLeaveDay(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm"
                      />
                      {leaveDay !== today && (
                        <button onClick={() => setLeaveDay(today)} className="text-xs font-semibold text-indigo-600">
                          Today
                        </button>
                      )}
                      <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={leavePending} onChange={e => setLeavePending(e.target.checked)} />
                        Show not verified
                      </label>
                    </div>
                    <div className="text-xs font-bold text-gray-500 uppercase">
                      {dayLabel(leaveDay)} • {batch} • {leaveRows.ok.length} verified • {leaveRows.pending.length} not yet
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                      {(leavePending ? leaveRows.pending : leaveRows.ok).map(st => (
                        <button
                          key={st.enrollNumber}
                          onClick={() => openStudent(st)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-indigo-50"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{st.name}</div>
                            <div className="text-xs text-gray-500">#{st.enrollNumber}</div>
                          </div>
                          {leaveDayMap[st.enrollNumber] && (
                            <span className="text-xs text-emerald-600 font-semibold">✓ {timeLabel(leaveDayMap[st.enrollNumber].at)}</span>
                          )}
                        </button>
                      ))}
                      {(leavePending ? leaveRows.pending : leaveRows.ok).length === 0 && (
                        <div className="p-8 text-center text-sm text-gray-400">
                          {leavePending ? 'Everyone is verified' : `No leave notes verified in ${batch} on this day`}
                        </div>
                      )}
                    </div>
                  </div>
                )
              ) : listView === 'partial' ? (
                loading ? (
                  <div className="flex justify-center py-16 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-[11px] text-gray-400">
                      Chapters whose notes were checked but are not complete (e.g. submitted after leave), grouped by the day
                      they were marked. Turn on “Partial check mode” inside a student to mark them.
                    </p>
                    {partialGroups.length === 0 && (
                      <div className="p-8 text-center text-sm text-gray-400 bg-white rounded-xl border border-gray-200">
                        No partial checks in {batch}
                      </div>
                    )}
                    {partialGroups.map(g => (
                      <div key={g.day}>
                        <div className="text-xs font-bold text-gray-500 uppercase mb-1.5">
                          {dayLabel(g.day)} • {g.students.length} student{g.students.length === 1 ? '' : 's'}
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                          {g.students.map(({ student, parts }) => (
                            <button
                              key={student.enrollNumber}
                              onClick={() => openStudent(student)}
                              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-amber-50"
                            >
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">{student.name}</div>
                                <div className="text-xs text-gray-500">#{student.enrollNumber}</div>
                              </div>
                              <div className="text-xs text-amber-700 text-right">
                                {parts.map(p => (
                                  <div key={p.subject}>
                                    {p.subject} <b>{fmtRanges(p.nums)}</b>
                                  </div>
                                ))}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : loading ? (
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
                      {(['name', 'latest', 'progress'] as const).map(k => (
                        <button
                          key={k}
                          onClick={() => {
                            if (k === 'progress' && sortBy === 'progress') setProgressDesc(d => !d);
                            setSortBy(k);
                          }}
                          className={`px-3 py-1.5 ${sortBy === k ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
                        >
                          {k === 'name' ? 'Name' : k === 'latest' ? 'Latest tick' : `Progress ${sortBy === 'progress' ? (progressDesc ? '↓' : '↑') : ''}`.trim()}
                        </button>
                      ))}
                    </div>
                  </div>
                  {!query && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-[11px] text-gray-500">
                      <span>
                        Class avg {batch}: <b className="text-gray-700">{(batchAvg[batch] || 0).toFixed(1)}</b> (students with ticks)
                      </span>
                      <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ≥ avg</span>
                      <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-full bg-amber-400" /> below avg</span>
                      <span className="flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-full bg-red-500" /> none or &lt; ¼ avg</span>
                    </div>
                  )}
                  <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                    {filtered.map(s => {
                      const total = getSubjectsForBatch(s.batch).reduce((n, x) => n + x.chapters.length, 0);
                      const sum = summaries[s.enrollNumber];
                      const done = sum?.count || 0;
                      const stats = statsOf[s.enrollNumber] || [];
                      const focus = !query && subjectFilter !== 'all' ? stats.find(x => x.id === subjectFilter) : undefined;
                      return (
                        <button
                          key={s.enrollNumber}
                          onClick={() => openStudent(s)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-indigo-50"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{s.name}</div>
                            <div className="text-xs text-gray-500">
                              #{s.enrollNumber} • {s.batch} • last tick {shortDate(sum?.lastTick || null)}
                              {leaveToday[s.enrollNumber] && <b className="ml-1 text-emerald-600">• leave ✓</b>}
                            </div>
                            {focus ? (
                              <div className="text-xs mt-1 text-gray-600">
                                {focus.missing.length > 0 ? (
                                  <>
                                    <b className="text-red-600">{focus.name} incomplete</b> — missing ch:{' '}
                                    <b className="text-red-600">{fmtRanges(focus.missing)}</b>
                                  </>
                                ) : (
                                  <span className="text-emerald-600 font-semibold">{focus.name} complete</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {stats.map(st => (
                                  <span key={st.id} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_BADGE[st.status]}`}>
                                    {st.name} {st.done}/{st.total}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded-full ${
                              focus ? STATUS_BADGE[focus.status] : STATUS_BADGE[overallStatus(s, done)]
                            }`}
                          >
                            {focus ? `${focus.done}/${focus.total}` : `${done}/${total}`}
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
              <label
                className={`flex items-center gap-3 mb-3 px-3 py-2 rounded-lg border text-sm cursor-pointer ${
                  partialMode ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <input type="checkbox" checked={partialMode} onChange={e => setPartialMode(e.target.checked)} />
                <span className="font-semibold">Partial check mode</span>
                <span className="text-xs opacity-70">
                  {partialMode ? 'Tap a chapter to mark it partially checked' : 'Off — tapping ticks a chapter as done'}
                </span>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  onClick={() => toggleLeaveVerified(selected)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold ${
                    leaveToday[selected.enrollNumber]
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-400'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${leaveToday[selected.enrollNumber] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-400'}`}>
                    {leaveToday[selected.enrollNumber] && <Check className="w-3 h-3" />}
                  </span>
                  Leave notes verified today
                </button>
                <button
                  onClick={toggleIdeal}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold ${
                    config[selected.batch]?.idealEnroll === selected.enrollNumber
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-yellow-400'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  {config[selected.batch]?.idealEnroll === selected.enrollNumber
                    ? `Ideal for ${selected.batch} (tap to remove)`
                    : `Set as ideal for ${selected.batch}`}
                </button>
                <button
                  onClick={listening ? stopListening : startListening}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold ${
                    listening ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {listening ? 'Stop voice' : 'Voice tick'}
                </button>
              </div>
              {(listening || voiceMsg) && (
                <div className="mb-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                  {listening && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${hearing ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                      <span className="min-w-0 truncate">
                        {interim ? <>Hearing: <b className="text-gray-900">{interim}</b></> : hearing ? 'Hearing…' : 'Listening — say a chapter name, add “partial” for ½'}
                      </span>
                    </div>
                  )}
                  {voiceMsg && (
                    <div className={`font-semibold ${listening ? 'mt-1' : ''} ${voiceOk === 'ok' ? 'text-emerald-600' : voiceOk === 'err' ? 'text-red-600' : 'text-gray-600'}`}>
                      {voiceMsg}
                    </div>
                  )}
                </div>
              )}
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
                            onClick={() => tapChapter(it.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                          >
                            {it.partial ? (
                              <span className="w-6 h-6 shrink-0 rounded-md border-2 border-amber-400 bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold">
                                ½
                              </span>
                            ) : (
                              <span className="w-6 h-6 shrink-0 rounded-md bg-emerald-500 text-white flex items-center justify-center">
                                <Check className="w-4 h-4" />
                              </span>
                            )}
                            <span className="flex-1 text-sm text-gray-900">
                              <span className="text-gray-400 mr-2">{it.number}.</span>
                              {it.title}
                              <span className="block text-xs text-gray-500">
                                {it.subject}
                                {it.partial && <b className="ml-2 text-amber-600">Partial</b>}
                              </span>
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
                          {s.chapters.some(c => progress[c.id]?.partial && !progress[c.id]?.done) &&
                            ` · ½${s.chapters.filter(c => progress[c.id]?.partial && !progress[c.id]?.done).length}`}
                        </button>
                      );
                    })}
                  </div>
                  {subjects
                    .filter(s => s.id === activeSubject)
                    .map(s => {
                      const allDone = s.chapters.every(c => progress[c.id]?.done);
                      const exp = expectedByBatch[selected.batch]?.[s.id];
                      const missingNums = s.chapters.filter(c => exp?.has(c.id) && !progress[c.id]?.done).map(c => c.number);
                      return (
                        <div key={s.id}>
                          {exp && exp.size > 0 && (
                            <p className={`text-xs mb-2 ${missingNums.length ? 'text-red-600' : 'text-emerald-600'}`}>
                              {missingNums.length
                                ? `Missing chapters ${config[selected.batch]?.idealEnroll ? 'the ideal student has' : `most of ${selected.batch} have`} completed: ${fmtRanges(missingNums)}`
                                : `Up to date with the chapters ${config[selected.batch]?.idealEnroll ? 'the ideal student has' : `most of ${selected.batch} have`} completed`}
                            </p>
                          )}
                          <div className={`flex justify-end mb-2 ${partialMode ? 'invisible' : ''}`}>
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
                                  onClick={() => tapChapter(c.id)}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
                                >
                                  <span
                                    className={`w-6 h-6 shrink-0 rounded-md border flex items-center justify-center text-sm font-bold ${
                                      done
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : p?.partial
                                          ? 'bg-amber-100 border-amber-400 text-amber-700'
                                          : 'border-gray-300 bg-white'
                                    }`}
                                  >
                                    {done ? <Check className="w-4 h-4" /> : p?.partial ? '½' : null}
                                  </span>
                                  <span className="flex-1 text-sm text-gray-900">
                                    <span className="text-gray-400 mr-2">{c.number}.</span>
                                    {c.title}
                                  </span>
                                  {p?.partial && !done && (
                                    <span className="text-xs text-amber-600 font-semibold">Partial • {shortDate(p.at)}</span>
                                  )}
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

      {/* Print sheet: real A4 pages (portrait for a student, landscape for a batch) with normal page breaks */}
      {printMode && (
        <div
          ref={sheetRef}
          className={`${pdfBusy ? '' : 'hidden print:block'} bg-white text-black box-border`}
          style={
            {
              printColorAdjust: 'exact',
              WebkitPrintColorAdjust: 'exact',
              ...(pdfBusy
                ? { position: 'fixed', top: 0, left: -10000, width: `${210 - 2 * (printMode === 'batch' ? 8 : 10)}mm` }
                : {})
            } as React.CSSProperties
          }
        >
          <style>{`@media print {
            @page { size: A4 portrait; margin: ${printMode === 'batch' ? '8mm' : '10mm'}; }
            html, body { background: #fff !important; }
            .np-avoid { break-inside: avoid; page-break-inside: avoid; }
            thead { display: table-header-group; }
          }`}</style>

          <div className={`flex items-end justify-between border-black ${printMode === 'batch' ? 'border-b-2 pb-1.5 mb-2' : 'border-b-4 pb-3 mb-4'}`}>
            <div>
              <div className={`font-bold tracking-[0.25em] text-gray-600 ${printMode === 'batch' ? 'text-[10px]' : 'text-[13px]'}`}>AIMS PLUS</div>
              <h1 className={`font-extrabold leading-tight ${printMode === 'batch' ? 'text-[20px]' : 'text-[30px]'}`}>
                Note Checking{printMode === 'partial' ? ' — Partial checks' : printMode === 'leave' ? ' — Leave notes verified' : ''}
              </h1>
            </div>
            <div className="text-right text-[13px] text-gray-600">
              {printMode === 'batch' || printMode === 'partial' || printMode === 'leave' ? `Batch ${batch} • ${gradeLabel(batch)}` : selected ? `${selected.batch} • ${gradeLabel(selected.batch)}` : ''}
              <br />
              Printed {printedOn}
            </div>
          </div>

          {printMode === 'leave' && (
            <>
              <p className="text-[12px] text-gray-700 mb-3">
                Leave notes verified on <b>{dayLabel(leaveDay)}</b> • {leaveRows.ok.length} of {leaveRows.ok.length + leaveRows.pending.length} students.
              </p>
              {leaveRows.ok.map((st, i) => (
                <div key={st.enrollNumber} className="np-avoid flex items-baseline gap-3 text-[13px] px-2 py-[3px] border-b border-gray-200">
                  <span className="w-6 text-gray-500">{i + 1}</span>
                  <b className="flex-1">{st.name}</b>
                  <span className="text-gray-600">{timeLabel(leaveDayMap[st.enrollNumber].at)}</span>
                </div>
              ))}
            </>
          )}

          {printMode === 'partial' && (
            <>
              <p className="text-[12px] text-gray-700 mb-3">
                Chapters whose notes were checked but are not complete, by the day they were marked. {partialStudentCount} student
                {partialStudentCount === 1 ? '' : 's'}.
              </p>
              {partialGroups.map(g => (
                <div key={g.day} className="mb-4">
                  <div className="np-avoid text-[13px] font-bold bg-gray-200 px-2 py-[3px]">
                    {dayLabel(g.day)} • {g.students.length}
                  </div>
                  {g.students.map(({ student, parts }, i) => (
                    <div key={student.enrollNumber} className="np-avoid flex items-baseline gap-3 text-[13px] px-2 py-[3px] border-b border-gray-200">
                      <span className="w-6 text-gray-500">{i + 1}</span>
                      <b className="flex-1">{student.name}</b>
                      <span className="text-right">
                        {parts.map(p => (
                          <span key={p.subject} className="ml-3">
                            {p.subject} <b>{fmtRanges(p.nums)}</b>
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {printMode === 'student' && selected && (
            <>
              <div className={`np-avoid flex items-center justify-between rounded-lg border-2 border-black px-5 py-4 mb-6 ${STATUS_PRINT[overallStatus(selected, doneCount)]}`}>
                <div>
                  <div className="text-[26px] font-extrabold">{selected.name}</div>
                  <div className="text-[12px]">
                    Batch {selected.batch} class average: {(batchAvg[selected.batch] || 0).toFixed(1)} chapters
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[34px] font-extrabold leading-none">
                    {doneCount}/{totalChapters}
                  </div>
                  <div className="text-[12px]">chapters completed</div>
                </div>
              </div>

              <h2 className="text-[15px] font-extrabold uppercase tracking-wider mb-3">Chapter-wise</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-7">
                {subjects.map(s => {
                  const d = s.chapters.filter(c => progress[c.id]?.done).length;
                  return (
                    <div key={s.id} className="np-avoid">
                      <div className="flex justify-between border-b-2 border-black pb-1 mb-1 text-[14px] font-extrabold">
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
                            className={`flex items-center gap-2 px-1 py-[4px] text-[13px] leading-snug ${ci % 2 ? 'bg-gray-100' : ''}`}
                          >
                            <span
                              className={`inline-flex shrink-0 items-center justify-center w-[18px] h-[18px] border-2 border-black text-[13px] leading-none ${
                                p?.done ? 'bg-black text-white font-bold' : 'bg-white'
                              }`}
                            >
                              {p?.done ? '✓' : ''}
                            </span>
                            <span className="flex-1">
                              <span className="text-gray-500">{c.number}.</span> {c.title}
                            </span>
                            {p?.done && <span className="text-[11px] text-gray-600 whitespace-nowrap">{shortDate(p.at)}</span>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <h2 className="text-[15px] font-extrabold uppercase tracking-wider mb-2">Completed by day (latest first)</h2>
              {doneByDay.length === 0 && <p className="text-[13px] text-gray-600">None yet.</p>}
              {doneByDay.map(g => (
                <div key={g.day} className="mb-3">
                  <div className="np-avoid text-[13px] font-bold bg-gray-200 px-2 py-[3px]">
                    {dayLabel(g.day)} • {g.items.length}
                  </div>
                  {g.items.map(it => (
                    <div key={it.id} className="np-avoid text-[13px] px-2 py-[3px] border-b border-gray-200">
                      <b>{it.subject}</b> — {it.number}. {it.title}
                    </div>
                  ))}
                </div>
              ))}
            </>
          )}

          {printMode === 'batch' && (
            <>
              <p className="text-[10px] leading-tight text-gray-700 mb-2">
                <b>{filtered.length} students</b>
                {subjectFilter !== 'all' || incompleteOnly
                  ? ` (${incompleteOnly ? 'incomplete only' : 'filtered'}${
                      subjectFilter !== 'all' ? ` • ${batchSubjects.find(x => x.id === subjectFilter)?.name}` : ''
                    })`
                  : ''}
                {' • '}Bar = chapters completed of all chapters in the subject. Numbers = <b>missing chapters</b>: ones {idealOf(batch) ? `the ideal student (${idealOf(batch)!.name})` : 'most of the batch'} has completed that this student has not (✓ = none missing). Subject colour: green none missing,
                yellow up to half missing, red more than half. {subjectFilter !== 'all' ? 'Done column: chapters done in this subject.' : <>Done column: class avg <b>{(batchAvg[batch] || 0).toFixed(1)}</b>.</>}
              </p>
              {Array.from({ length: Math.ceil(filtered.length / PRINT_ROWS_PER_PAGE) }, (_, page) => {
                const rows = filtered.slice(page * PRINT_ROWS_PER_PAGE, (page + 1) * PRINT_ROWS_PER_PAGE);
                const totalCh = batchSubjects.reduce((n, x) => n + x.chapters.length, 0);
                return (
                  <table
                    key={page}
                    className={`w-full border-collapse text-[10px] ${page > 0 ? 'np-force-break' : ''}`}
                    style={{
                      tableLayout: 'fixed',
                      breakAfter: page < Math.ceil(filtered.length / PRINT_ROWS_PER_PAGE) - 1 ? 'page' : 'auto'
                    }}
                  >
                    <colgroup>
                      <col style={{ width: 24 }} />
                      <col style={{ width: 140 }} />
                      {printSubjects.map(sub => (
                        <col key={sub.id} />
                      ))}
                      <col style={{ width: 40 }} />
                      <col style={{ width: 38 }} />
                    </colgroup>
                    <thead>
                      <tr className="bg-black text-white text-left" style={{ height: 18 }}>
                        <th className="pl-1.5">#</th>
                        <th>Student</th>
                        {printSubjects.map(sub => (
                          <th key={sub.id} className="px-1.5">
                            {sub.name} <span className="font-normal opacity-70">· missing</span>
                          </th>
                        ))}
                        <th className="text-center">Done</th>
                        <th>Last</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((s, i) => {
                        const sum = summaries[s.enrollNumber];
                        const count = sum?.count || 0;
                        const status = overallStatus(s, count);
                        const stats = (statsOf[s.enrollNumber] || []).filter(
                          st => subjectFilter === 'all' || st.id === subjectFilter
                        );
                        const only = subjectFilter !== 'all' ? stats[0] : undefined;
                        return (
                          <tr
                            key={s.enrollNumber}
                            className={`border-b border-gray-300 ${i % 2 ? 'bg-gray-50' : ''}`}
                            style={{ height: 18 }}
                          >
                            <td className={`pl-1 text-gray-600 border-l-[5px] ${STATUS_BAR[status]}`}>
                              {page * PRINT_ROWS_PER_PAGE + i + 1}
                            </td>
                            <td className="pr-1 font-bold overflow-hidden whitespace-nowrap text-ellipsis">{s.name}</td>
                            {stats.map(st => (
                              <td key={st.id} className="px-1.5 overflow-hidden">
                                <div className="flex items-center gap-1 whitespace-nowrap" style={{ height: 16 }}>
                                  <span className="inline-block shrink-0 border border-black bg-white" style={{ width: 30, height: 7 }}>
                                    <span
                                      className="block h-full"
                                      style={{
                                        width: `${st.total ? (st.done / st.total) * 100 : 0}%`,
                                        background: PRINT_BAR[st.status]
                                      }}
                                    />
                                  </span>
                                  <span className="shrink-0 text-[9px] text-gray-600">
                                    {st.done}/{st.total}
                                  </span>
                                  {st.missing.length > 0 ? (
                                    <span className="min-w-0 flex-1 overflow-hidden text-ellipsis font-extrabold text-red-700">
                                      {fmtRanges(st.missing)}
                                    </span>
                                  ) : (
                                    <span className="font-extrabold text-green-700">✓</span>
                                  )}
                                </div>
                              </td>
                            ))}
                            <td className={`text-center font-extrabold whitespace-nowrap ${STATUS_PRINT[only ? only.status : status]}`}>
                              {only ? `${only.done}/${only.total}` : `${count}/${totalCh}`}
                            </td>
                            <td className="whitespace-nowrap text-gray-600 text-[9px]">{shortDate(sum?.lastTick || null)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })}
            </>
          )}
        </div>
      )}
    </>
  );
}
