import type { SubjectKey } from './fyugData';

// Source: "Academic Calendar for Continuous Internal Assessment" — Department of Physics,
// Sullamussalam Science College, BSc Physics (Honours) Sixth Semester. All 36 entries.

export type EventKind = 'classes' | 'lab' | 'assignment' | 'openbook' | 'exam' | 'seminar';

export interface CalendarEvent {
  date: string; // YYYY-MM-DD
  subject?: SubjectKey; // omitted for college-wide events ("All Courses" / classes conclude)
  event: string;
  note?: string;
  kind: EventKind;
}

const ev = (
  date: string,
  subject: SubjectKey | undefined,
  event: string,
  kind: EventKind,
  note?: string
): CalendarEvent => ({ date, subject, event, kind, note });

export const CALENDAR: CalendarEvent[] = [
  // November 2026
  ev('2026-11-09', undefined, 'Classes Commence', 'classes', 'All Courses'),
  ev('2026-11-26', 'thermo', 'Lab Exercise', 'lab'),
  // December 2026
  ev('2026-12-01', 'thermo', 'Practical Examination', 'lab'),
  ev('2026-12-02', 'thermo', 'Practical Examination', 'lab'),
  ev('2026-12-08', 'electronics', 'Assignment-1 Submission', 'assignment'),
  ev('2026-12-11', 'nano', 'Assignment-1 Submission', 'assignment'),
  ev('2026-12-14', 'nuclear', 'Open Book Assessment-1', 'openbook'),
  ev('2026-12-16', 'electrical', 'Assignment-1 Submission', 'assignment'),
  ev('2026-12-17', 'opto', 'Assignment-1 Submission', 'assignment'),
  ev('2026-12-28', 'thermo', 'Open Book Assessment-1', 'openbook'),
  ev('2026-12-30', 'electronics', 'Lab Exercise', 'lab'),
  // January 2027
  ev('2027-01-04', 'electronics', 'Practical Examination', 'lab'),
  ev('2027-01-05', 'electronics', 'Practical Examination', 'lab'),
  ev('2027-01-08', 'nano', 'Assignment-2 Submission', 'assignment'),
  ev('2027-01-11', 'opto', 'Assignment-2 Submission', 'assignment'),
  ev('2027-01-15', 'nuclear', 'Open Book Assessment-2', 'openbook'),
  ev('2027-01-19', 'thermo', 'Midsemester Examination', 'exam', 'Internal Test'),
  ev('2027-01-20', 'electronics', 'Midsemester Examination', 'exam', 'Internal Test'),
  ev('2027-01-21', 'nuclear', 'Midsemester Examination', 'exam', 'Internal Test'),
  ev('2027-01-22', 'nano', 'Midsemester Examination', 'exam', 'Internal Test'),
  ev('2027-01-25', 'opto', 'Midsemester Examination', 'exam', 'Internal Test'),
  ev('2027-01-27', 'electrical', 'Midsemester Examination', 'exam', 'Internal Test'),
  // February 2027
  ev('2027-02-01', 'thermo', 'Open Book Assessment-2', 'openbook'),
  ev('2027-02-04', 'electronics', 'Assignment-2 Submission', 'assignment'),
  ev('2027-02-05', 'nano', 'Assignment-3 Submission', 'assignment'),
  ev('2027-02-08', 'nuclear', 'Mini-Project / Seminar', 'seminar', 'Open-Ended Module'),
  ev('2027-02-09', 'nano', 'Mini-Project / Seminar', 'seminar', 'Open-Ended Module'),
  ev('2027-02-10', 'opto', 'Mini-Project / Seminar', 'seminar', 'Open-Ended Module'),
  ev('2027-02-11', 'electrical', 'Mini-Project / Seminar', 'seminar', 'Open-Ended Module'),
  ev('2027-02-12', 'nuclear', 'Open Book Assessment-3', 'openbook'),
  ev('2027-02-12', 'opto', 'Assignment-3 Submission', 'assignment'),
  ev('2027-02-15', 'nano', 'Assignment-4 Submission', 'assignment'),
  ev('2027-02-16', 'electrical', 'Assignment-2 Submission', 'assignment'),
  ev('2027-02-17', 'opto', 'Assignment-4 Submission', 'assignment'),
  ev('2027-02-19', 'nuclear', 'Open Book Assessment-4', 'openbook'),
  ev('2027-02-19', undefined, 'Classes Conclude On', 'classes')
];

export interface Upcoming {
  date: Date;
  daysAway: number; // 0 = today
  events: CalendarEvent[]; // everything on that date (some days have two)
}

const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// The next calendar day (today included) that has an event, with all of that day's events.
// Returns null once the last event has passed.
export function getUpcoming(today = new Date()): Upcoming | null {
  const todayKey = toKey(today);
  const next = CALENDAR.filter((e) => e.date >= todayKey).sort((a, b) => a.date.localeCompare(b.date))[0];
  if (!next) return null;
  const date = new Date(next.date + 'T00:00:00');
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysAway = Math.round((date.getTime() - startOfToday.getTime()) / 86400000);
  return { date, daysAway, events: CALENDAR.filter((e) => e.date === next.date) };
}
