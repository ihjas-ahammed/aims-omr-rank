import { SUBJECTS, type SubjectKey } from './fyugData';
import { SYLLABUS } from './syllabus';

// How far each syllabus unit is covered, set on the Topics tab. Kept in this browser only (localStorage): per
// subject, unit number -> percent covered (1 to 100; untouched units are left out). The poster and the Topics tab
// (often open in two browser tabs) both read it.

export type Progress = Partial<Record<SubjectKey, Record<number, number>>>;

const STORAGE_KEY = 'fyug-syllabus-progress-v1';
const CHANGE_EVENT = 'fyug-syllabus-progress';

export const SUBJECT_KEYS = Object.keys(SUBJECTS) as SubjectKey[];

export function loadProgress(): Progress {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const out: Progress = {};
    for (const key of SUBJECT_KEYS) {
      const saved = raw?.[key];
      const units: Record<number, number> = {};
      if (Array.isArray(saved)) {
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

export function saveProgress(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // storage full or blocked: the progress still works for this visit
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
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
