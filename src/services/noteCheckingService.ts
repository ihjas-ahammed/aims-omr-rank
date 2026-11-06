import { rtdb } from './firebaseService';
import { ref, get, set, update } from 'firebase/database';

export interface AttendanceStudent {
  enrollNumber: string;
  name: string;
  batch: string;
}

export interface NoteChapterEntry {
  done: boolean;
  at: string;
}

export type NoteProgressMap = Record<string, NoteChapterEntry>;

export const NOTE_BATCHES = ['A1', 'A2', 'B1', 'B2', 'B3'];

const PROGRESS_ROOT = 'note_checking';

let cachedStudents: AttendanceStudent[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 1000; // 1-minute cache to avoid re-downloading student rosters on re-renders

export async function fetchAttendanceStudents(forceRefresh = false): Promise<AttendanceStudent[]> {
  if (!rtdb) throw new Error('Firebase is not configured');

  if (!forceRefresh && cachedStudents && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedStudents;
  }

  const map = new Map<string, AttendanceStudent>();

  // 1. Primary source: attendance/by_student (contains registered students with name, department, enroll_number)
  try {
    const snap = await get(ref(rtdb, 'attendance/by_student'));
    const raw = snap.val();
    if (raw && typeof raw === 'object') {
      Object.entries(raw).forEach(([key, val]: [string, any]) => {
        if (!val) return;
        const name = String(val.name || '').trim();
        const batch = String(val.department || '').trim().toUpperCase();
        const enrollNumber = String(val.enroll_number || key).trim();
        if (name && NOTE_BATCHES.includes(batch) && enrollNumber) {
          map.set(enrollNumber, {
            enrollNumber,
            name: name.toUpperCase(),
            batch
          });
        }
      });
    }
  } catch (err) {
    console.warn('Failed to fetch from attendance/by_student:', err);
  }

  // 2. Fallback / supplement: attendance/users (in case users node contains student names)
  try {
    const snap = await get(ref(rtdb, 'attendance/users'));
    const raw = snap.val();
    if (raw) {
      const list: any[] = Array.isArray(raw) ? raw : Object.values(raw);
      list.forEach(u => {
        if (!u || u.enabled === 0) return;
        const name = String(u.name || '').trim();
        const batch = String(u.department || '').trim().toUpperCase();
        const enrollNumber = String(u.enroll_number || '').trim();
        if (name && NOTE_BATCHES.includes(batch) && enrollNumber && !map.has(enrollNumber)) {
          map.set(enrollNumber, {
            enrollNumber,
            name: name.toUpperCase(),
            batch
          });
        }
      });
    }
  } catch (err) {
    console.warn('Failed to fetch from attendance/users:', err);
  }

  // 3. Fallback / supplement: existing records under note_checking
  try {
    const snap = await get(ref(rtdb, PROGRESS_ROOT));
    const raw = snap.val();
    if (raw && typeof raw === 'object') {
      Object.entries(raw).forEach(([id, val]: [string, any]) => {
        if (!val) return;
        const name = String(val.name || '').trim();
        const batch = String(val.batch || '').trim().toUpperCase();
        if (name && NOTE_BATCHES.includes(batch) && !map.has(id)) {
          map.set(id, {
            enrollNumber: id,
            name: name.toUpperCase(),
            batch
          });
        }
      });
    }
  } catch (err) {
    console.warn('Failed to fetch from note_checking:', err);
  }

  const result = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  cachedStudents = result;
  cacheTimestamp = Date.now();
  return result;
}

export async function fetchNoteProgress(enrollNumber: string): Promise<NoteProgressMap> {
  if (!rtdb) return {};
  const snap = await get(ref(rtdb, `${PROGRESS_ROOT}/${enrollNumber}/chapters`));
  return (snap.val() as NoteProgressMap) || {};
}

export interface NoteSummary {
  count: number;
  lastTick: string | null; // ISO time of the most recent completed chapter
}

// Done-count and latest tick per student, for the list badges and sorting.
export async function fetchAllNoteSummaries(): Promise<Record<string, NoteSummary>> {
  if (!rtdb) return {};
  const snap = await get(ref(rtdb, PROGRESS_ROOT));
  const raw = snap.val() || {};
  const out: Record<string, NoteSummary> = {};
  Object.keys(raw).forEach(id => {
    const done = Object.values<any>(raw[id]?.chapters || {}).filter(c => c?.done);
    const lastTick = done.reduce<string | null>((m, c) => (!m || c.at > m ? c.at : m), null);
    out[id] = { count: done.length, lastTick };
  });
  return out;
}

// Every student's chapter ticks, keyed by enroll number (for the batch print matrix).
export async function fetchAllNoteChapters(): Promise<Record<string, NoteProgressMap>> {
  if (!rtdb) return {};
  const snap = await get(ref(rtdb, PROGRESS_ROOT));
  const raw = snap.val() || {};
  const out: Record<string, NoteProgressMap> = {};
  Object.keys(raw).forEach(id => {
    out[id] = raw[id]?.chapters || {};
  });
  return out;
}

export async function setChapterDone(
  student: AttendanceStudent,
  chapterId: string,
  done: boolean
): Promise<void> {
  if (!rtdb) throw new Error('Firebase is not configured');
  const now = new Date().toISOString();
  const base = `${PROGRESS_ROOT}/${student.enrollNumber}`;
  await update(ref(rtdb), {
    [`${base}/name`]: student.name,
    [`${base}/batch`]: student.batch,
    [`${base}/updatedAt`]: now,
    [`${base}/chapters/${chapterId}`]: { done, at: now }
  });
}

export async function setManyChaptersDone(
  student: AttendanceStudent,
  chapterIds: string[],
  done: boolean
): Promise<void> {
  if (!rtdb) throw new Error('Firebase is not configured');
  const now = new Date().toISOString();
  const base = `${PROGRESS_ROOT}/${student.enrollNumber}`;
  const patch: Record<string, unknown> = {
    [`${base}/name`]: student.name,
    [`${base}/batch`]: student.batch,
    [`${base}/updatedAt`]: now
  };
  chapterIds.forEach(id => {
    patch[`${base}/chapters/${id}`] = { done, at: now };
  });
  await update(ref(rtdb), patch);
}
