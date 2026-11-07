import { STUDY_SUBJECTS, type ChapterDef } from '../../../../data/studyProgressData';

// Class 10 revision schedule. Chapter/unit names come from src/data/studyProgressData.ts
// (the same data the class 10 study progress screens use), so no names are typed in here.

export type SubjectKey =
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'maths'
  | 'english'
  | 'hindi'
  | 'malayalam2'
  | 'history'
  | 'geography';

type Ref = { chapter: number } | { unit: number };

const ch = (n: number): Ref => ({ chapter: n });
const un = (n: number): Ref => ({ unit: n });

export const SCHEDULE: { date: string; items: { subject: SubjectKey; refs: Ref[] }[] }[] = (
  [
    ['2026-11-09', 'maths', ch(6)],
    ['2026-11-10', 'chemistry', ch(5)],
    ['2026-11-11', 'history', ch(5)],
    ['2026-11-12', 'physics', ch(3)],
    ['2026-11-13', 'english', un(3)],
    ['2026-11-14', 'maths', ch(7)],
    ['2026-11-15', 'geography', ch(5)],
    ['2026-11-16', 'biology', ch(3)],
    ['2026-11-17', 'hindi', un(3)],
    ['2026-11-18', 'maths', ch(8)],
    ['2026-11-19', 'history', ch(6)],
    ['2026-11-20', 'chemistry', ch(4)],
    ['2026-11-21', 'malayalam2', un(2), un(3)],
    ['2026-11-22', 'geography', ch(6)],
    ['2026-11-23', 'physics', ch(4)],
    ['2026-11-24', 'biology', ch(4)],
    ['2026-11-25', 'maths', ch(9)],
    ['2026-11-26', 'history', ch(7)],
    ['2026-11-27', 'physics', ch(5)],
    ['2026-11-28', 'hindi', un(4)],
    ['2026-11-29', 'maths', ch(10)],
    ['2026-11-30', 'chemistry', ch(6)],
    ['2026-12-01', 'english', un(4)],
    ['2026-12-02', 'physics', ch(6)],
    ['2026-12-03', 'biology', ch(5)],
    ['2026-12-04', 'maths', ch(11)]
  ] as [string, SubjectKey, ...Ref[]][]
).map(([date, subject, ...refs]) => ({ date, items: [{ subject, refs }] }));

export const FIRST_DATE = SCHEDULE[0].date;
export const LAST_DATE = SCHEDULE[SCHEDULE.length - 1].date;

export interface Lesson {
  en: string;
  ml?: string; // native-script title when it differs from English
}

export interface RevisionItem {
  subject: SubjectKey;
  subjectLabel: string; // e.g. "HISTORY"
  kind: 'chapter' | 'unit';
  number: number;
  titleEn: string; // chapter title, or unit name for units
  titleMl?: string;
  lessons: Lesson[]; // only for units
}

const LABELS: Record<SubjectKey, string> = {
  physics: 'PHYSICS',
  chemistry: 'CHEMISTRY',
  biology: 'BIOLOGY',
  maths: 'MATHS',
  english: 'ENGLISH',
  hindi: 'HINDI',
  malayalam2: 'MALAYALAM II',
  history: 'HISTORY',
  geography: 'GEOGRAPHY'
};

const hasNativeScript = (s: string) => /[^\u0000-ɏ -⁯]/.test(s);

function resolveItem(subject: SubjectKey, ref: Ref): RevisionItem {
  const def = STUDY_SUBJECTS.find((s) => s.id === subject);
  if (!def) throw new Error(`Unknown subject ${subject}`);
  const subjectLabel = LABELS[subject];

  if ('chapter' in ref) {
    const c = def.chapters.find((x) => x.chapterNumber === ref.chapter);
    if (!c) throw new Error(`${subject} chapter ${ref.chapter} not found`);
    return {
      subject,
      subjectLabel,
      kind: 'chapter',
      number: ref.chapter,
      titleEn: c.titleEn,
      titleMl: hasNativeScript(c.titleMl) ? c.titleMl : undefined,
      lessons: []
    };
  }

  const inUnit: ChapterDef[] = def.chapters.filter((x) => (x.unitEn ?? '').startsWith(`UNIT ${ref.unit}`));
  if (inUnit.length === 0) throw new Error(`${subject} unit ${ref.unit} not found`);

  const unitName = (inUnit[0].unitEn ?? '').replace(/^UNIT \d+\s*:?\s*/i, '').trim();
  // Hindi lesson titles carry a genre tag, e.g. "खिड़की (लघुकथा)" — drop it for the poster.
  const clean = (t: string) => (subject === 'hindi' ? t.replace(/\s*\([^)]*\)\s*$/, '') : t);
  const lessons: Lesson[] = inUnit.map((c) => ({
    en: c.titleEn,
    ml: c.titleMl !== c.titleEn ? clean(c.titleMl) : undefined
  }));

  // A unit made of a single lesson that carries the unit's own name: show it as the title instead.
  if (lessons.length === 1 && lessons[0].en === unitName) {
    return {
      subject,
      subjectLabel,
      kind: 'unit',
      number: ref.unit,
      titleEn: unitName,
      titleMl: lessons[0].ml,
      lessons: []
    };
  }

  return { subject, subjectLabel, kind: 'unit', number: ref.unit, titleEn: unitName, lessons };
}

export function getRevisionItems(dateKey: string): RevisionItem[] | null {
  const entry = SCHEDULE.find((e) => e.date === dateKey);
  if (!entry) return null;
  return entry.items.flatMap(({ subject, refs }) => refs.map((r) => resolveItem(subject, r)));
}

// Before the first date show the first poster, after the last show the last, otherwise today.
export function defaultDateKey(today = new Date()): string {
  const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  if (key < FIRST_DATE) return FIRST_DATE;
  if (key > LAST_DATE) return LAST_DATE;
  return key;
}
