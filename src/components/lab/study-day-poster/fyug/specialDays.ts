import type { Slot } from './fyugData';

// Special days: a date whose timetable changed at short notice, edited on the page and used instead of the
// weekly timetable for that date. Kept in this browser only (localStorage), keyed by YYYY-MM-DD.

export interface SpecialDay {
  subtitle?: string; // header bar text; empty = the usual "n HOURS • start – end"
  unordered?: boolean; // subjects known, but no fixed order or timings: cards show "ANY ORDER" and no times
  slots: Slot[];
}

export const MAX_SLOTS = 8;

const STORAGE_KEY = 'fyug-special-days-v1';

export function loadSpecialDays(): Record<string, SpecialDay> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const out: Record<string, SpecialDay> = {};
    for (const [key, day] of Object.entries(raw ?? {})) {
      const d = day as SpecialDay;
      if (/^\d{4}-\d{2}-\d{2}$/.test(key) && Array.isArray(d?.slots)) out[key] = d;
    }
    return out;
  } catch {
    return {};
  }
}

export function saveSpecialDays(days: Record<string, SpecialDay>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
  } catch {
    // storage full or blocked: the edit still shows for this visit
  }
}

// Poster height (logical px) for a day with fewer than five cards, so the cards don't stretch; undefined = standard.
export function specialDayHeight(slotCount: number, standard: number): number | undefined {
  const CARD = 150;
  const height = 288 + slotCount * CARD + (slotCount - 1) * 12 + 12 + 172 + 26;
  return slotCount > 0 && height < standard ? height : undefined;
}
