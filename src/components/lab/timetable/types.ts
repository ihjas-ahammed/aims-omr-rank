export const BATCHES = ["B1", "B2", "A1", "A2"] as const;
export type Batch = typeof BATCHES[number];

export interface TimetableSession {
  id: string;
  time: string;
  teacher: string;
}

export type TimetableDay = Record<Batch, TimetableSession[]>;

export const DEFAULT_TIMES = ["8.30-10.45", "11.00-1.00", "1.45-2.50", "2.50-4.00", "4.00-4.30"];

export const getEmptyTimetable = (): TimetableDay => {
  return BATCHES.reduce((acc, batch) => {
    acc[batch] = DEFAULT_TIMES.map((time, idx) => ({
      id: `${batch}-${idx}`,
      time,
      teacher: ''
    }));
    return acc;
  }, {} as TimetableDay);
};