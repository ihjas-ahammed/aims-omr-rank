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

export async function fetchAttendanceStudents(): Promise<AttendanceStudent[]> {
  if (!rtdb) throw new Error('Firebase is not configured');
  const snap = await get(ref(rtdb, 'attendance/users'));
  const raw = snap.val();
  if (!raw) return [];
  const list: any[] = Array.isArray(raw) ? raw : Object.values(raw);
  return list
    .filter(u => u && u.enabled !== 0 && (u.name || '').trim() && NOTE_BATCHES.includes(u.department))
    .map(u => ({
      enrollNumber: String(u.enroll_number),
      name: String(u.name).trim().toUpperCase(),
      batch: u.department as string
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
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
