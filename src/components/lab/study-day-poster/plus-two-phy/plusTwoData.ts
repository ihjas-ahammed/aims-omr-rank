import { PHY_CYCLE_LABEL, PHY_TIMETABLE } from './phyData';
import { MATH_CYCLE_LABEL, MATH_TIMETABLE } from './mathData';

// Plus Two study schedule: one subject per week (a "cycle"), a chapter or two per day and an exam on the last day.

export interface PlusTwoChapter {
  tag: string; // "CH 05", "CHAPTER 01", "CH 05, 06, 07 · REV" (REV marks a revision day)
  title: string;
  icon: string;
  topics: string[];
}

export interface PlusTwoStudyDay {
  date: string; // YYYY-MM-DD
  dayNo: number;
  chapters: PlusTwoChapter[];
}

export interface PlusTwoExamDay {
  date: string;
  exam: true;
  label: string;
}

export type PlusTwoDay = PlusTwoStudyDay | PlusTwoExamDay;

export interface PlusTwoCycle {
  subject: string;
  label: string; // date range as printed on the chart
  accent: string;
  tint: string;
  hero?: string; // icon key of the round subject badge in the date panel (none for Mathematics)
  examIcon: string;
  days: PlusTwoDay[];
}

export const PLUS_TWO_CYCLES: PlusTwoCycle[] = [
  {
    subject: 'PHYSICS',
    label: PHY_CYCLE_LABEL,
    accent: '#0072dc',
    tint: '#e1effc',
    hero: 'phy_hero',
    examIcon: 'phy_exam',
    days: PHY_TIMETABLE.map((d) =>
      'topics' in d ? { date: d.date, dayNo: d.dayNo, chapters: [{ tag: d.tag, title: d.title, icon: d.icon, topics: d.topics }] } : d
    )
  },
  {
    subject: 'MATHEMATICS',
    label: MATH_CYCLE_LABEL,
    accent: '#168a1f',
    tint: '#e3f9e1',
    examIcon: 'math_exam',
    days: MATH_TIMETABLE
  }
];

export interface PlusTwoLookup {
  cycle: PlusTwoCycle;
  day: PlusTwoDay;
  index: number; // position of the day in its cycle
}

export function getPlusTwoDay(dateKey: string): PlusTwoLookup | null {
  for (const cycle of PLUS_TWO_CYCLES) {
    const index = cycle.days.findIndex((d) => d.date === dateKey);
    if (index >= 0) return { cycle, day: cycle.days[index], index };
  }
  return null;
}

export const isExamDay = (d: PlusTwoDay): d is PlusTwoExamDay => 'exam' in d;
