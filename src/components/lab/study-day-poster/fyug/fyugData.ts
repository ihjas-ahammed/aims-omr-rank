// Weekly timetable transcribed from the FYUG timetable screenshot (Mon–Fri, Hour 1–5).
// Full subject titles come from the Sixth Semester academic calendar (the screenshot truncates them with "…").
// A room is only set where the screenshot showed one.

export type SubjectKey = 'thermo' | 'nuclear' | 'electronics' | 'electrical' | 'nano' | 'opto';

export interface Subject {
  name: string;
  icon: string; // key into FYUG_ICONS
  accent: string;
  tint: string;
}

export const SUBJECTS: Record<SubjectKey, Subject> = {
  thermo: { name: 'Thermodynamics', icon: 'thermo', accent: '#0284c7', tint: '#e0f2fe' },
  nuclear: { name: 'Nuclear and Particle Physics', icon: 'nuclear', accent: '#5b52d6', tint: '#ececfd' },
  electronics: { name: 'Electronics–II', icon: 'electronics', accent: '#2563eb', tint: '#e3edfd' },
  electrical: { name: 'Electrical and Photovoltaic Devices', icon: 'electrical', accent: '#0e7490', tint: '#dff5f9' },
  nano: { name: 'Nanoscience and Technology', icon: 'nano', accent: '#16803c', tint: '#e3f6e8' },
  opto: { name: 'Optoelectronics and Semiconductor Devices', icon: 'opto', accent: '#0f766e', tint: '#ddf5f1' }
};

export interface Slot {
  subject: SubjectKey;
  teacher: string;
  room?: string;
  time?: string; // filled in by getSlots, e.g. "9:30 – 10:30"
  // Only for one-off days (see DATE_OVERRIDES): replaces the subject name, the teacher line and the "HOUR n" badge.
  title?: string;
  note?: string;
  badge?: string;
}

// Hour timings. Fridays have a shorter afternoon (2–3 and 3–4).
const TIMES = ['9:30 – 10:30', '10:30 – 11:30', '11:40 – 12:30', '1:30 – 2:30', '2:30 – 3:30'];
const FRIDAY_TIMES = ['9:30 – 10:30', '10:30 – 11:30', '11:40 – 12:30', '2:00 – 3:00', '3:00 – 4:00'];

const SAFEEQUE = 'C A SAFEEQUE';
const NAJIYA = 'NAJIYA K M';
const RAHOOF = 'ABDUL RAHOOF.K.A';
const SHANID = 'MOHD SHANID N A';
const N101 = 'N 101';

// Index = weekday number (1 = Monday … 5 = Friday); each day lists Hour 1 … Hour 5.
export const WEEK: Record<number, Slot[]> = {
  1: [
    { subject: 'thermo', teacher: SAFEEQUE, room: N101 },
    { subject: 'nuclear', teacher: NAJIYA, room: N101 },
    { subject: 'electronics', teacher: RAHOOF, room: N101 },
    { subject: 'electronics', teacher: RAHOOF, room: N101 },
    { subject: 'electronics', teacher: RAHOOF, room: N101 }
  ],
  2: [
    { subject: 'electronics', teacher: RAHOOF, room: N101 },
    { subject: 'nuclear', teacher: SAFEEQUE },
    { subject: 'nano', teacher: SHANID },
    { subject: 'nano', teacher: SHANID },
    { subject: 'electrical', teacher: RAHOOF }
  ],
  3: [
    { subject: 'electronics', teacher: RAHOOF, room: N101 },
    { subject: 'electrical', teacher: RAHOOF },
    { subject: 'thermo', teacher: SAFEEQUE, room: N101 },
    { subject: 'nano', teacher: SHANID },
    { subject: 'nano', teacher: SHANID }
  ],
  4: [
    { subject: 'opto', teacher: SHANID },
    { subject: 'opto', teacher: SHANID },
    { subject: 'nuclear', teacher: NAJIYA, room: N101 },
    { subject: 'thermo', teacher: NAJIYA },
    { subject: 'thermo', teacher: SAFEEQUE, room: N101 }
  ],
  5: [
    { subject: 'electrical', teacher: RAHOOF },
    { subject: 'opto', teacher: SHANID },
    { subject: 'opto', teacher: SHANID },
    { subject: 'nuclear', teacher: NAJIYA, room: N101 },
    { subject: 'thermo', teacher: SAFEEQUE }
  ]
};

// One-off days that replace the weekly timetable entirely (key = YYYY-MM-DD).
export const DATE_OVERRIDES: Record<string, { slots: Slot[]; subtitle: string; height?: number; showNextEvent?: boolean }> = {
  // 10 Nov 2026: only the Thermodynamics practical, at least three experiments to be done.
  '2026-11-10': {
    subtitle: 'THERMODYNAMICS LAB DAY',
    height: 770, // logical px; one normal-sized card plus the footer, so the image is shorter than the usual 1160
    showNextEvent: true, // no event on the day itself, so the footer shows the next one from the calendar
    slots: [
      {
        subject: 'thermo',
        teacher: '',
        title: 'Thermodynamics Practical',
        note: 'Do at least 3 experiments',
        badge: 'LAB'
      }
    ]
  }
};

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function getDaySubtitle(date: Date): string | undefined {
  return DATE_OVERRIDES[dateKey(date)]?.subtitle;
}

export function showsNextEvent(date: Date): boolean {
  return !!DATE_OVERRIDES[dateKey(date)]?.showNextEvent;
}

// Poster height for a day with fewer cards; undefined = the standard height.
export function getPosterHeight(date: Date): number | undefined {
  return DATE_OVERRIDES[dateKey(date)]?.height;
}

export function getSlots(date: Date): Slot[] | null {
  const override = DATE_OVERRIDES[dateKey(date)];
  if (override) return override.slots;
  const day = WEEK[date.getDay()];
  if (!day) return null;
  const times = date.getDay() === 5 ? FRIDAY_TIMES : TIMES;
  return day.map((slot, i) => ({ ...slot, time: times[i] }));
}

// Tomorrow, or the next Monday when tomorrow falls on a weekend (there are no weekend classes).
export function defaultDate(from = new Date()): { date: Date; skippedWeekend: boolean } {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 1);
  let skipped = false;
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
    skipped = true;
  }
  return { date: d, skippedWeekend: skipped };
}
