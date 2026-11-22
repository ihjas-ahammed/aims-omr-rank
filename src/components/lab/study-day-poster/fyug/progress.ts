import { SUBJECTS, type SubjectKey } from './fyugData';
import { SYLLABUS } from './syllabus';
import { rtdb } from '../../../../services/firebaseService';
import { onValue, ref, set, update } from 'firebase/database';

// How far each syllabus unit is covered, set on the Topics tab. Kept in this browser only (localStorage): per
// subject, unit number -> percent covered (1 to 100; untouched units are left out). The poster and the Topics tab
// (often open in two browser tabs) both read it. It is shared by every device and user with no login: Realtime
// Database `fyug_syllabus_progress/{subject}/{unit}` is the source of truth and localStorage is the local cache.

export type Progress = Partial<Record<SubjectKey, Record<number, number>>>;

const STORAGE_KEY = 'fyug-syllabus-progress-v1';
const CHANGE_EVENT = 'fyug-syllabus-progress';

export const SUBJECT_KEYS = Object.keys(SUBJECTS) as SubjectKey[];

const DB_PATH = 'fyug_syllabus_progress';

const readLocal = (): unknown => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

export function loadProgress(): Progress {
  return normalize(readLocal());
}

// `remote`: Realtime Database returns {1: 50, 2: 20} as an array, so an array there means index -> percent,
// unlike the earlier local format (a list of ticked unit numbers).
function normalize(raw: any, remote = false): Progress {
  try {
    const out: Progress = {};
    for (const key of SUBJECT_KEYS) {
      const saved = raw?.[key];
      const units: Record<number, number> = {};
      if (Array.isArray(saved) && remote) {
        saved.forEach((pct, n) => {
          const p = Math.round(Number(pct));
          if (p > 0) units[n] = Math.min(100, p);
        });
      } else if (Array.isArray(saved)) {
        // Earlier format: a list of the units ticked as done.
        for (const n of saved) if (typeof n === 'number') units[n] = 100;
      } else if (saved && typeof saved === 'object') {
        for (const [n, pct] of Object.entries(saved)) {
          const p = Math.round(Number(pct));
          if (p > 0) units[Number(n)] = Math.min(100, p);
        }
      }
      out[key] = units;
    }
    return out;
  } catch {
    return {};
  }
}

function writeLocal(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // storage full or blocked: the progress still works for this visit
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Saves locally and pushes only the units that changed, so two devices editing different units never overwrite each other.
export function saveProgress(progress: Progress) {
  const before = loadProgress();
  writeLocal(progress);
  if (!rtdb) return;
  const patch: Record<string, number | null> = {};
  for (const key of SUBJECT_KEYS) {
    const units = new Set([...Object.keys(before[key] ?? {}), ...Object.keys(progress[key] ?? {})]);
    units.forEach((n) => {
      const was = before[key]?.[Number(n)] ?? 0;
      const now = progress[key]?.[Number(n)] ?? 0;
      if (was !== now) patch[`${DB_PATH}/${key}/${n}`] = now > 0 ? now : null;
    });
  }
  if (Object.keys(patch).length) update(ref(rtdb), patch).catch((e) => console.warn('Progress sync failed', e));
}

let syncStarted = false;

// Starts the live sync (once per page load): remote changes replace the local copy and notify the page. If the
// database has no progress yet, what this browser already has is uploaded as the starting point.
export function startProgressSync() {
  if (syncStarted || !rtdb) return;
  syncStarted = true;
  let first = true;
  onValue(
    ref(rtdb, DB_PATH),
    (snap) => {
      const remote = snap.val();
      if (remote == null) {
        const local = loadProgress();
        if (first && overall(local).done > 0) set(ref(rtdb!, DB_PATH), local).catch(() => undefined);
      } else {
        writeLocal(normalize(remote, true));
      }
      first = false;
    },
    (e) => console.warn('Progress sync unavailable, using this browser only', e)
  );
}

// Calls back whenever the progress changes, in this tab or in another one.
export function onProgressChange(cb: () => void): () => void {
  const onStorage = (e: StorageEvent) => e.key === STORAGE_KEY && cb();
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, cb);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, cb);
  };
}

export const totalUnits = (key: SubjectKey) => SYLLABUS[key].reduce((n, m) => n + m.units.length, 0);

// Percent of one unit covered, 0 to 100.
export const unitPercent = (progress: Progress, key: SubjectKey, n: number) => progress[key]?.[n] ?? 0;

// Units covered in a subject, counting a part-covered unit as that part of one (so 2 units at 50% = 1).
export function doneUnits(progress: Progress, key: SubjectKey): number {
  return SYLLABUS[key].reduce((sum, m) => sum + m.units.reduce((s, u) => s + unitPercent(progress, key, u.n) / 100, 0), 0);
}

// 12, 12.5 … for showing a units-covered figure.
export const formatUnits = (n: number) => String(Math.round(n * 10) / 10);

// Fraction of the subject covered, 0 to 1.
export const subjectFraction = (progress: Progress, key: SubjectKey) => doneUnits(progress, key) / totalUnits(key);

export function overall(progress: Progress): { done: number; total: number } {
  return SUBJECT_KEYS.reduce(
    (acc, key) => ({ done: acc.done + doneUnits(progress, key), total: acc.total + totalUnits(key) }),
    { done: 0, total: 0 }
  );
}
