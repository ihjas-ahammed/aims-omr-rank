export type TaskType = 'tcr' | 'entrance' | 'revision';

export type TaskStatus = 'pending' | 'ongoing' | 'finished';

export interface SessionData {
  id: string;
  teacher: string | null;
  date?: string;
  startTime?: string;
  endTime?: string;
}

export interface TaskData {
  status: TaskStatus;
  sessions: SessionData[];
}

export interface ChapterProgress {
  name: string;
  tcr: TaskData;
  entrance: TaskData;
  revision: TaskData;
}

export interface SubjectProgress {
  name: string;
  chapters: ChapterProgress[];
}

export type BatchName = 'B1' | 'B2' | 'B3';

export type CourseProgressMap = Record<BatchName, SubjectProgress[]>;
