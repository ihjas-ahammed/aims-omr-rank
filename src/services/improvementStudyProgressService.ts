import { db, rtdb } from './firebaseService';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, set, get, child, remove } from 'firebase/database';
import { 
  ImprovementSubjectDef, 
  ImprovementSecondLanguage, 
  getImprovementSubjectList,
  ALL_IMPROVEMENT_SUBJECTS 
} from '../data/improvementStudyProgressData';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export type StudentMedium = 'English' | 'Malayalam';
export type ImprovementBatch = 'B1' | 'B2' | 'B3';

export interface ImprovementStudentProfile {
  name: string; // Stored in ALL CAPS
  studentClass: ImprovementBatch;
  phoneNumber: string; // Passkey
  selectedSubjects: string[]; // Subject IDs (e.g. ['physics', 'chemistry'])
  secondLanguage?: ImprovementSecondLanguage;
  languageChapterCount?: number; // Custom chapter count for selected language
  medium?: StudentMedium;
  dailyCheckins?: Record<string, boolean>; // Date string (YYYY-MM-DD) -> boolean
  createdAt?: string;
}

export interface ChapterProgressEntry {
  boxes: boolean[];
  timestamps: (string | null)[];
}

export type ChapterBoxesMap = Record<string, ChapterProgressEntry>;

export interface WeeklyGoalMilestone {
  weekNumber: number; // 1 to 5
  title: string; // e.g. "Week 1 Target"
  startDate: string; // "2026-09-01"
  targetDate: string; // "2026-09-07"
  targetDateFormatted: string; // "September 7, 2026"
  targetDateShort: string; // "Sep 7"
  targetPercentage: number; // 20, 40, 60, 80, 100
  description: string;
}

export const IMPROVEMENT_WEEKLY_SCHEDULE: WeeklyGoalMilestone[] = [
  {
    weekNumber: 1,
    title: 'Week 1 Target',
    startDate: '2026-09-01',
    targetDate: '2026-09-07',
    targetDateFormatted: 'September 7, 2026',
    targetDateShort: 'Sep 7',
    targetPercentage: 20,
    description: 'First 20% completion of chosen subjects'
  },
  {
    weekNumber: 2,
    title: 'Week 2 Target',
    startDate: '2026-09-08',
    targetDate: '2026-09-14',
    targetDateFormatted: 'September 14, 2026',
    targetDateShort: 'Sep 14',
    targetPercentage: 40,
    description: 'Reach 40% cumulative completion'
  },
  {
    weekNumber: 3,
    title: 'Week 3 Target',
    startDate: '2026-09-15',
    targetDate: '2026-09-21',
    targetDateFormatted: 'September 21, 2026',
    targetDateShort: 'Sep 21',
    targetPercentage: 60,
    description: 'Cross 60% midway syllabus coverage'
  },
  {
    weekNumber: 4,
    title: 'Week 4 Target',
    startDate: '2026-09-22',
    targetDate: '2026-09-28',
    targetDateFormatted: 'September 28, 2026',
    targetDateShort: 'Sep 28',
    targetPercentage: 80,
    description: 'Reach 80% advanced completion'
  },
  {
    weekNumber: 5,
    title: 'Week 5 Final Target',
    startDate: '2026-09-29',
    targetDate: '2026-10-05',
    targetDateFormatted: 'October 5, 2026',
    targetDateShort: 'Oct 5',
    targetPercentage: 100,
    description: '100% full syllabus master & revision complete'
  }
];

export interface MilestoneItem extends WeeklyGoalMilestone {
  status: 'completed' | 'in_progress' | 'pending';
  isCurrentWeek: boolean;
}

export interface WeeklyGoalStatus {
  currentWeek: WeeklyGoalMilestone;
  activeMilestoneIndex: number;
  daysLeftInTarget: number;
  isCompleted: boolean;
  isOnTrack: boolean;
  deltaPercentage: number;
  statusText: string;
  milestones: MilestoneItem[];
}

export function getWeeklyGoalStatus(currentPercentage: number, customDate?: Date): WeeklyGoalStatus {
  const now = customDate || new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  let activeIndex = 0;
  for (let i = 0; i < IMPROVEMENT_WEEKLY_SCHEDULE.length; i++) {
    const m = IMPROVEMENT_WEEKLY_SCHEDULE[i];
    if (todayStr <= m.targetDate) {
      activeIndex = i;
      break;
    }
    if (i === IMPROVEMENT_WEEKLY_SCHEDULE.length - 1) {
      activeIndex = i;
    }
  }

  const activeMilestone = IMPROVEMENT_WEEKLY_SCHEDULE[activeIndex];
  const targetDateObj = new Date(`${activeMilestone.targetDate}T23:59:59`);
  const diffTime = targetDateObj.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const isCompleted = currentPercentage >= activeMilestone.targetPercentage;
  const isOnTrack = isCompleted || (currentPercentage >= activeMilestone.targetPercentage - 5);
  const delta = currentPercentage - activeMilestone.targetPercentage;

  let statusText = '';
  if (currentPercentage >= 100) {
    statusText = 'Full 100% Syllabus Mastered! 🏆';
  } else if (isCompleted) {
    statusText = `Week ${activeMilestone.weekNumber} Target Achieved (${currentPercentage}% / ${activeMilestone.targetPercentage}%) 🎉`;
  } else if (daysLeft === 0) {
    statusText = `Target due today! Need +${Math.abs(delta)}% to reach ${activeMilestone.targetPercentage}%`;
  } else {
    statusText = `Need +${Math.abs(delta)}% by ${activeMilestone.targetDateShort} (${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left)`;
  }

  const milestones: MilestoneItem[] = IMPROVEMENT_WEEKLY_SCHEDULE.map((m, idx) => {
    let status: 'completed' | 'in_progress' | 'pending' = 'pending';
    if (currentPercentage >= m.targetPercentage) {
      status = 'completed';
    } else if (idx === activeIndex || (idx > 0 && currentPercentage >= IMPROVEMENT_WEEKLY_SCHEDULE[idx - 1].targetPercentage)) {
      status = 'in_progress';
    }

    return {
      ...m,
      status,
      isCurrentWeek: idx === activeIndex
    };
  });

  return {
    currentWeek: activeMilestone,
    activeMilestoneIndex: activeIndex,
    daysLeftInTarget: daysLeft,
    isCompleted,
    isOnTrack,
    deltaPercentage: delta,
    statusText,
    milestones
  };
}

export interface ImprovementStudentProgressRecord {
  id: string;
  studentName: string;
  studentClass: ImprovementBatch;
  phoneNumber: string;
  selectedSubjects: string[];
  secondLanguage?: ImprovementSecondLanguage;
  languageChapterCount?: number;
  medium?: StudentMedium;
  progress: ChapterBoxesMap;
  dailyCheckins?: Record<string, boolean>;
  todayStudied?: boolean;
  studyStreak?: number;
  overallPercentage: number;
  subjectPercentages: Record<string, number>;
  totalCheckedChapters: number;
  totalPossibleChapters: number;
  weeklyGoalStatus?: WeeklyGoalStatus;
  updatedAt: string;
}

// -------------------------------------------------------------
// Normalization & Date helpers
// -------------------------------------------------------------
export function normalizePhone(raw: string): string {
  if (!raw) return '';
  return raw.replace(/[^0-9]/g, '');
}

export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function normalizeDocId(name: string, studentClass: string, phone: string): string {
  const cleanName = (name || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '_').slice(0, 40);
  const cleanPhone = normalizePhone(phone).slice(-10) || 'NOPHON';
  const cleanClass = (studentClass || 'B1').trim().toUpperCase();
  return `${cleanClass}_${cleanPhone}_${cleanName}`.replace(/_{2,}/g, '_');
}

export function normalizeChapterBoxesMap(raw: any): ChapterBoxesMap {
  if (!raw || typeof raw !== 'object') return {};
  const normalized: ChapterBoxesMap = {};

  Object.entries(raw).forEach(([chapterId, value]: [string, any]) => {
    if (Array.isArray(value)) {
      normalized[chapterId] = {
        boxes: value.map(v => !!v),
        timestamps: value.map(() => null)
      };
    } else if (value && typeof value === 'object' && Array.isArray(value.boxes)) {
      const ts = Array.isArray(value.timestamps) ? value.timestamps : [];
      normalized[chapterId] = {
        boxes: value.boxes.map((b: any) => !!b),
        timestamps: value.boxes.map((_: any, idx: number) => ts[idx] || null)
      };
    } else {
      normalized[chapterId] = {
        boxes: [false],
        timestamps: [null]
      };
    }
  });

  return normalized;
}

// -------------------------------------------------------------
// Calculate Study Streak from Daily Check-ins
// -------------------------------------------------------------
export function calculateStudyStreak(dailyCheckins?: Record<string, boolean>): number {
  if (!dailyCheckins || Object.keys(dailyCheckins).length === 0) return 0;

  let streak = 0;
  const d = new Date();
  
  // Check if today is checked
  const todayKey = getTodayDateKey();
  const checkedToday = !!dailyCheckins[todayKey];
  if (checkedToday) streak++;

  // Step backwards day by day
  let cursor = new Date(d);
  cursor.setDate(cursor.getDate() - 1);

  while (true) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const day = String(cursor.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${day}`;

    if (dailyCheckins[key]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// -------------------------------------------------------------
// Calculate statistics tailored for the student's selected subjects
// -------------------------------------------------------------
export function calculateImprovementProgressStats(
  progress: ChapterBoxesMap,
  selectedSubjectIds: string[],
  secondLanguage?: ImprovementSecondLanguage,
  languageChapterCount?: number
) {
  const subjectPercentages: Record<string, number> = {};
  let totalCheckedBoxes = 0;
  let totalPossibleBoxes = 0;

  const subjects = getImprovementSubjectList(selectedSubjectIds, secondLanguage, languageChapterCount);

  subjects.forEach(subject => {
    let subChecked = 0;
    let subPossible = 0;

    subject.chapters.forEach(ch => {
      // If chapter has topics, each topic is 1 checkbox
      const maxB = ch.topics && ch.topics.length > 0 ? ch.topics.length : (ch.totalBoxes || 1);
      subPossible += maxB;
      
      const entry = progress[ch.id] || { boxes: [], timestamps: [] };
      const boxes = entry.boxes || [];
      for (let i = 0; i < maxB; i++) {
        if (boxes[i]) subChecked++;
      }
    });

    subjectPercentages[subject.id] = subPossible > 0 ? Math.round((subChecked / subPossible) * 100) : 0;
    totalCheckedBoxes += subChecked;
    totalPossibleBoxes += subPossible;
  });

  const overallPercentage = totalPossibleBoxes > 0 
    ? Math.round((totalCheckedBoxes / totalPossibleBoxes) * 100) 
    : 0;

  return {
    subjectPercentages,
    overallPercentage,
    totalCheckedBoxes,
    totalPossibleBoxes
  };
}

// -------------------------------------------------------------
// Local Storage Keys & Profile Management
// -------------------------------------------------------------
const KEY_ACTIVE_ID = 'improvement_study_progress_active_id';
const KEY_ACTIVE_PROFILE = 'improvement_study_progress_active_profile';
const KEY_ACTIVE_PROGRESS = 'improvement_study_progress_active_boxes';
const KEY_SAVED_PROFILES = 'improvement_study_progress_saved_profiles';
const KEY_ALL_RECORDS_CACHE = 'improvement_study_progress_all_records_cache';

export function getAllLocalImprovementProfiles(): ImprovementStudentProfile[] {
  try {
    const raw = localStorage.getItem(KEY_SAVED_PROFILES);
    if (!raw) return [];
    const parsed: ImprovementStudentProfile[] = JSON.parse(raw);
    return parsed.map(p => ({
      ...p,
      name: (p.name || '').toUpperCase(),
      studentClass: (p.studentClass || 'B1') as ImprovementBatch,
      phoneNumber: p.phoneNumber || '',
      selectedSubjects: p.selectedSubjects || ['physics', 'chemistry'],
      languageChapterCount: p.languageChapterCount || 10,
      dailyCheckins: p.dailyCheckins || {}
    }));
  } catch (e) {
    return [];
  }
}

export function saveLocalImprovementProfile(profile: ImprovementStudentProfile): void {
  const sanitized: ImprovementStudentProfile = {
    ...profile,
    name: profile.name.trim().toUpperCase(),
    studentClass: profile.studentClass,
    phoneNumber: profile.phoneNumber.trim(),
    selectedSubjects: profile.selectedSubjects && profile.selectedSubjects.length > 0 
      ? profile.selectedSubjects 
      : ['physics', 'chemistry'],
    secondLanguage: profile.secondLanguage || 'Malayalam',
    languageChapterCount: profile.languageChapterCount || 10,
    dailyCheckins: profile.dailyCheckins || {},
    medium: profile.medium || 'English'
  };

  const id = normalizeDocId(sanitized.name, sanitized.studentClass, sanitized.phoneNumber);
  localStorage.setItem(KEY_ACTIVE_ID, id);
  localStorage.setItem(KEY_ACTIVE_PROFILE, JSON.stringify(sanitized));

  try {
    const profiles = getAllLocalImprovementProfiles();
    const existingIndex = profiles.findIndex(p => 
      normalizeDocId(p.name, p.studentClass, p.phoneNumber) === id
    );

    if (existingIndex >= 0) {
      profiles[existingIndex] = sanitized;
    } else {
      profiles.unshift(sanitized);
    }
    localStorage.setItem(KEY_SAVED_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save local improvement profiles array:', e);
  }
}

export function getLocalImprovementProfile(): ImprovementStudentProfile | null {
  try {
    const raw = localStorage.getItem(KEY_ACTIVE_PROFILE);
    if (!raw) return null;
    const p: ImprovementStudentProfile = JSON.parse(raw);
    return {
      ...p,
      name: (p.name || '').toUpperCase(),
      studentClass: (p.studentClass || 'B1') as ImprovementBatch,
      phoneNumber: p.phoneNumber || '',
      selectedSubjects: p.selectedSubjects || ['physics', 'chemistry'],
      languageChapterCount: p.languageChapterCount || 10,
      dailyCheckins: p.dailyCheckins || {}
    };
  } catch (e) {
    return null;
  }
}

export function getLocalImprovementProgress(id?: string): ChapterBoxesMap {
  try {
    const docId = id || localStorage.getItem(KEY_ACTIVE_ID);
    if (!docId) {
      const activeRaw = localStorage.getItem(KEY_ACTIVE_PROGRESS);
      return activeRaw ? normalizeChapterBoxesMap(JSON.parse(activeRaw)) : {};
    }
    const raw = localStorage.getItem(`improvement_study_progress_boxes_${docId}`);
    if (raw) return normalizeChapterBoxesMap(JSON.parse(raw));
    const activeRaw = localStorage.getItem(KEY_ACTIVE_PROGRESS);
    return activeRaw ? normalizeChapterBoxesMap(JSON.parse(activeRaw)) : {};
  } catch (e) {
    return {};
  }
}

export function saveLocalImprovementProgress(progress: ChapterBoxesMap, id?: string): void {
  try {
    const docId = id || localStorage.getItem(KEY_ACTIVE_ID);
    const json = JSON.stringify(progress);
    localStorage.setItem(KEY_ACTIVE_PROGRESS, json);
    if (docId) {
      localStorage.setItem(`improvement_study_progress_boxes_${docId}`, json);
    }
  } catch (e) {
    console.error('Failed to save local improvement boxes:', e);
  }
}

export function switchActiveImprovementProfile(id: string): { profile: ImprovementStudentProfile | null; progress: ChapterBoxesMap } {
  const profiles = getAllLocalImprovementProfiles();
  const match = profiles.find(p => normalizeDocId(p.name, p.studentClass, p.phoneNumber) === id);

  if (match) {
    localStorage.setItem(KEY_ACTIVE_ID, id);
    localStorage.setItem(KEY_ACTIVE_PROFILE, JSON.stringify(match));
    const progress = getLocalImprovementProgress(id);
    localStorage.setItem(KEY_ACTIVE_PROGRESS, JSON.stringify(progress));
    return { profile: match, progress };
  }

  return { profile: null, progress: {} };
}

export function removeLocalImprovementProfile(id: string): ImprovementStudentProfile[] {
  try {
    const profiles = getAllLocalImprovementProfiles().filter(p => 
      normalizeDocId(p.name, p.studentClass, p.phoneNumber) !== id
    );
    localStorage.setItem(KEY_SAVED_PROFILES, JSON.stringify(profiles));
    localStorage.removeItem(`improvement_study_progress_boxes_${id}`);

    const activeId = localStorage.getItem(KEY_ACTIVE_ID);
    if (activeId === id) {
      if (profiles.length > 0) {
        const nextId = normalizeDocId(profiles[0].name, profiles[0].studentClass, profiles[0].phoneNumber);
        switchActiveImprovementProfile(nextId);
      } else {
        localStorage.removeItem(KEY_ACTIVE_ID);
        localStorage.removeItem(KEY_ACTIVE_PROFILE);
        localStorage.removeItem(KEY_ACTIVE_PROGRESS);
      }
    }
    return profiles;
  } catch (e) {
    return [];
  }
}

// -------------------------------------------------------------
// SAVE PROGRESS (RTDB + Firestore + Local Storage)
// -------------------------------------------------------------
export async function saveImprovementStudentProgress(
  profile: ImprovementStudentProfile,
  progress: ChapterBoxesMap
): Promise<void> {
  const sanitizedProfile: ImprovementStudentProfile = {
    ...profile,
    name: profile.name.trim().toUpperCase(),
    studentClass: profile.studentClass,
    phoneNumber: profile.phoneNumber.trim(),
    selectedSubjects: profile.selectedSubjects && profile.selectedSubjects.length > 0 
      ? profile.selectedSubjects 
      : ['physics', 'chemistry'],
    secondLanguage: profile.secondLanguage || 'Malayalam',
    languageChapterCount: profile.languageChapterCount || 10,
    dailyCheckins: profile.dailyCheckins || {},
    medium: profile.medium || 'English'
  };

  const docId = normalizeDocId(sanitizedProfile.name, sanitizedProfile.studentClass, sanitizedProfile.phoneNumber);
  
  saveLocalImprovementProfile(sanitizedProfile);
  saveLocalImprovementProgress(progress, docId);

  const stats = calculateImprovementProgressStats(
    progress, 
    sanitizedProfile.selectedSubjects, 
    sanitizedProfile.secondLanguage,
    sanitizedProfile.languageChapterCount
  );
  const nowIso = new Date().toISOString();
  const todayKey = getTodayDateKey();
  const todayStudied = !!sanitizedProfile.dailyCheckins?.[todayKey];
  const studyStreak = calculateStudyStreak(sanitizedProfile.dailyCheckins);

  const recordData: ImprovementStudentProgressRecord = {
    id: docId,
    studentName: sanitizedProfile.name,
    studentClass: sanitizedProfile.studentClass,
    phoneNumber: sanitizedProfile.phoneNumber,
    selectedSubjects: sanitizedProfile.selectedSubjects,
    secondLanguage: sanitizedProfile.secondLanguage,
    languageChapterCount: sanitizedProfile.languageChapterCount,
    medium: sanitizedProfile.medium,
    dailyCheckins: sanitizedProfile.dailyCheckins,
    todayStudied,
    studyStreak,
    progress,
    overallPercentage: stats.overallPercentage,
    subjectPercentages: stats.subjectPercentages,
    totalCheckedChapters: stats.totalCheckedBoxes,
    totalPossibleChapters: stats.totalPossibleBoxes,
    updatedAt: nowIso
  };

  // Update all records cache
  try {
    const raw = localStorage.getItem(KEY_ALL_RECORDS_CACHE) || '[]';
    const localAll: ImprovementStudentProgressRecord[] = JSON.parse(raw);
    const existingIdx = localAll.findIndex(r => r.id === docId);
    if (existingIdx >= 0) {
      localAll[existingIdx] = recordData;
    } else {
      localAll.unshift(recordData);
    }
    localStorage.setItem(KEY_ALL_RECORDS_CACHE, JSON.stringify(localAll));
  } catch (e) {}

  // 1. Save to Realtime Database
  if (rtdb) {
    try {
      const rtdbRef = ref(rtdb, `improvement_study_progress/${docId}`);
      await set(rtdbRef, {
        id: docId,
        studentName: sanitizedProfile.name,
        studentClass: sanitizedProfile.studentClass,
        phoneNumber: sanitizedProfile.phoneNumber,
        selectedSubjects: sanitizedProfile.selectedSubjects,
        secondLanguage: sanitizedProfile.secondLanguage,
        languageChapterCount: sanitizedProfile.languageChapterCount,
        dailyCheckins: sanitizedProfile.dailyCheckins || {},
        todayStudied,
        studyStreak,
        medium: sanitizedProfile.medium,
        progress,
        overallPercentage: stats.overallPercentage,
        subjectPercentages: stats.subjectPercentages,
        totalCheckedChapters: stats.totalCheckedBoxes,
        totalPossibleChapters: stats.totalPossibleBoxes,
        updatedAt: nowIso
      });
    } catch (e) {
      console.warn('RTDB improvement progress write failed, falling back:', e);
    }
  }

  // 2. Save to Firestore
  if (db) {
    try {
      const docRef = doc(db, 'improvement_study_progress', docId);
      await setDoc(docRef, {
        id: docId,
        studentName: sanitizedProfile.name,
        studentClass: sanitizedProfile.studentClass,
        phoneNumber: sanitizedProfile.phoneNumber,
        selectedSubjects: sanitizedProfile.selectedSubjects,
        secondLanguage: sanitizedProfile.secondLanguage,
        languageChapterCount: sanitizedProfile.languageChapterCount,
        dailyCheckins: sanitizedProfile.dailyCheckins || {},
        todayStudied,
        studyStreak,
        medium: sanitizedProfile.medium,
        progress,
        overallPercentage: stats.overallPercentage,
        subjectPercentages: stats.subjectPercentages,
        totalCheckedChapters: stats.totalCheckedBoxes,
        totalPossibleChapters: stats.totalPossibleBoxes,
        updatedAt: nowIso
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore improvement progress write failed:', e);
    }
  }
}

// -------------------------------------------------------------
// SAVE DAILY CHECK-IN (Did student study today's topics?)
// -------------------------------------------------------------
export async function saveImprovementDailyCheckin(
  profile: ImprovementStudentProfile,
  dateKey: string,
  studied: boolean
): Promise<ImprovementStudentProfile> {
  const currentCheckins = { ...(profile.dailyCheckins || {}) };
  currentCheckins[dateKey] = studied;

  const updatedProfile: ImprovementStudentProfile = {
    ...profile,
    dailyCheckins: currentCheckins
  };

  const progress = getLocalImprovementProgress(normalizeDocId(profile.name, profile.studentClass, profile.phoneNumber));
  await saveImprovementStudentProgress(updatedProfile, progress);

  return updatedProfile;
}

// -------------------------------------------------------------
// LOGIN STUDENT (Lookup across RTDB, Firestore, and Local Storage)
// -------------------------------------------------------------
export async function loginImprovementStudent(
  name: string,
  studentClass: ImprovementBatch,
  phoneNumber: string
): Promise<{ profile: ImprovementStudentProfile; progress: ChapterBoxesMap } | null> {
  const upperName = (name || '').trim().toUpperCase();
  const cleanPhone = normalizePhone(phoneNumber);
  const targetDocId = normalizeDocId(upperName, studentClass, cleanPhone);

  // 1. Check local saved profiles first
  const localProfiles = getAllLocalImprovementProfiles();
  const localMatch = localProfiles.find(p => 
    normalizeDocId(p.name, p.studentClass, p.phoneNumber) === targetDocId ||
    (p.studentClass === studentClass && normalizePhone(p.phoneNumber) === cleanPhone && p.name.toUpperCase() === upperName)
  );

  if (localMatch) {
    const progress = getLocalImprovementProgress(targetDocId);
    saveLocalImprovementProfile(localMatch);
    saveLocalImprovementProgress(progress, targetDocId);
    return { profile: localMatch, progress };
  }

  // 2. Query RTDB by direct doc ID
  if (rtdb) {
    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, `improvement_study_progress/${targetDocId}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const profile: ImprovementStudentProfile = {
          name: (data.studentName || data.name || upperName).toUpperCase(),
          studentClass: (data.studentClass || studentClass) as ImprovementBatch,
          phoneNumber: data.phoneNumber || data.phone || cleanPhone,
          selectedSubjects: data.selectedSubjects || data.improvementSubjects || ['physics', 'chemistry'],
          secondLanguage: data.secondLanguage || 'Malayalam',
          languageChapterCount: data.languageChapterCount || 10,
          dailyCheckins: data.dailyCheckins || {},
          medium: data.medium || 'English'
        };
        const progress = normalizeChapterBoxesMap(data.progress);
        saveLocalImprovementProfile(profile);
        saveLocalImprovementProgress(progress, targetDocId);
        return { profile, progress };
      }
    } catch (e) {
      console.warn('RTDB login direct lookup failed, scanning...', e);
    }

    // 2b. Scan RTDB for flexible match on phone + class
    try {
      const dbRef = ref(rtdb);
      const allSnapshot = await get(child(dbRef, 'improvement_study_progress'));
      if (allSnapshot.exists()) {
        const all = allSnapshot.val();
        const found = Object.values(all).find((item: any) => {
          const itemPhone = normalizePhone(item.phoneNumber || item.phone || '');
          const itemName = (item.studentName || item.name || '').toUpperCase().trim();
          const itemClass = item.studentClass || item.batch;
          return itemPhone.endsWith(cleanPhone.slice(-10)) && 
                 (itemName === upperName || itemName.includes(upperName) || upperName.includes(itemName)) &&
                 itemClass === studentClass;
        }) as any;

        if (found) {
          const profile: ImprovementStudentProfile = {
            name: (found.studentName || found.name || upperName).toUpperCase(),
            studentClass: (found.studentClass || studentClass) as ImprovementBatch,
            phoneNumber: found.phoneNumber || found.phone || cleanPhone,
            selectedSubjects: found.selectedSubjects || found.improvementSubjects || ['physics', 'chemistry'],
            secondLanguage: found.secondLanguage || 'Malayalam',
            languageChapterCount: found.languageChapterCount || 10,
            dailyCheckins: found.dailyCheckins || {},
            medium: found.medium || 'English'
          };
          const progress = normalizeChapterBoxesMap(found.progress);
          const foundId = normalizeDocId(profile.name, profile.studentClass, profile.phoneNumber);
          saveLocalImprovementProfile(profile);
          saveLocalImprovementProgress(progress, foundId);
          return { profile, progress };
        }
      }
    } catch (e) {
      console.warn('RTDB scan failed:', e);
    }
  }

  // 3. Query Firestore
  if (db) {
    try {
      const docRef = doc(db, 'improvement_study_progress', targetDocId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const profile: ImprovementStudentProfile = {
          name: (data.studentName || data.name || upperName).toUpperCase(),
          studentClass: (data.studentClass || studentClass) as ImprovementBatch,
          phoneNumber: data.phoneNumber || data.phone || cleanPhone,
          selectedSubjects: data.selectedSubjects || data.improvementSubjects || ['physics', 'chemistry'],
          secondLanguage: data.secondLanguage || 'Malayalam',
          languageChapterCount: data.languageChapterCount || 10,
          dailyCheckins: data.dailyCheckins || {},
          medium: data.medium || 'English'
        };
        const progress = normalizeChapterBoxesMap(data.progress);
        saveLocalImprovementProfile(profile);
        saveLocalImprovementProgress(progress, targetDocId);
        return { profile, progress };
      }
    } catch (e) {
      console.warn('Firestore direct login lookup failed:', e);
    }

    // 3b. Scan Firestore collection
    try {
      const qSnap = await getDocs(collection(db, 'improvement_study_progress'));
      let foundData: any = null;
      qSnap.forEach(d => {
        const item = d.data();
        const itemPhone = normalizePhone(item.phoneNumber || item.phone || '');
        const itemName = (item.studentName || item.name || '').toUpperCase().trim();
        const itemClass = item.studentClass || item.batch;
        if (itemPhone.endsWith(cleanPhone.slice(-10)) && 
            (itemName === upperName || itemName.includes(upperName) || upperName.includes(itemName)) &&
            itemClass === studentClass) {
          foundData = item;
        }
      });

      if (foundData) {
        const profile: ImprovementStudentProfile = {
          name: (foundData.studentName || foundData.name || upperName).toUpperCase(),
          studentClass: (foundData.studentClass || studentClass) as ImprovementBatch,
          phoneNumber: foundData.phoneNumber || foundData.phone || cleanPhone,
          selectedSubjects: foundData.selectedSubjects || foundData.improvementSubjects || ['physics', 'chemistry'],
          secondLanguage: foundData.secondLanguage || 'Malayalam',
          languageChapterCount: foundData.languageChapterCount || 10,
          dailyCheckins: foundData.dailyCheckins || {},
          medium: foundData.medium || 'English'
        };
        const progress = normalizeChapterBoxesMap(foundData.progress);
        const foundId = normalizeDocId(profile.name, profile.studentClass, profile.phoneNumber);
        saveLocalImprovementProfile(profile);
        saveLocalImprovementProgress(progress, foundId);
        return { profile, progress };
      }
    } catch (e) {
      console.warn('Firestore scan failed:', e);
    }
  }

  // 4. Fallback: check cached all records
  try {
    const raw = localStorage.getItem(KEY_ALL_RECORDS_CACHE);
    if (raw) {
      const all: ImprovementStudentProgressRecord[] = JSON.parse(raw);
      const match = all.find(r => 
        r.studentClass === studentClass && 
        normalizePhone(r.phoneNumber).endsWith(cleanPhone.slice(-10)) &&
        r.studentName.toUpperCase().includes(upperName)
      );
      if (match) {
        const profile: ImprovementStudentProfile = {
          name: match.studentName.toUpperCase(),
          studentClass: match.studentClass,
          phoneNumber: match.phoneNumber,
          selectedSubjects: match.selectedSubjects,
          secondLanguage: match.secondLanguage,
          languageChapterCount: match.languageChapterCount || 10,
          dailyCheckins: match.dailyCheckins || {},
          medium: match.medium
        };
        const progress = normalizeChapterBoxesMap(match.progress);
        const foundId = normalizeDocId(profile.name, profile.studentClass, profile.phoneNumber);
        saveLocalImprovementProfile(profile);
        saveLocalImprovementProgress(progress, foundId);
        return { profile, progress };
      }
    }
  } catch (e) {}

  return null;
}

// -------------------------------------------------------------
// FETCH ALL IMPROVEMENT PROGRESS RECORDS (For Admin)
// -------------------------------------------------------------
export async function fetchAllImprovementProgress(): Promise<ImprovementStudentProgressRecord[]> {
  const todayKey = getTodayDateKey();

  // 1. Try RTDB
  if (rtdb) {
    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, 'improvement_study_progress'));
      if (snapshot.exists()) {
        const val = snapshot.val();
        const records: ImprovementStudentProgressRecord[] = Object.values(val).map((data: any) => {
          const name = (data.studentName || data.name || 'UNKNOWN').toUpperCase();
          const batch = (data.studentClass || data.batch || 'B1') as ImprovementBatch;
          const phone = data.phoneNumber || data.phone || '';
          const selected = data.selectedSubjects || data.improvementSubjects || ['physics', 'chemistry'];
          const progress = normalizeChapterBoxesMap(data.progress);
          const langCount = data.languageChapterCount || 10;
          const checkins = data.dailyCheckins || {};
          const stats = calculateImprovementProgressStats(progress, selected, data.secondLanguage, langCount);

          const overallPct = data.overallPercentage ?? stats.overallPercentage;
          const weeklyGoal = getWeeklyGoalStatus(overallPct);

          return {
            id: data.id || normalizeDocId(name, batch, phone),
            studentName: name,
            studentClass: batch,
            phoneNumber: phone,
            selectedSubjects: selected,
            secondLanguage: data.secondLanguage,
            languageChapterCount: langCount,
            medium: data.medium || 'English',
            progress,
            dailyCheckins: checkins,
            todayStudied: !!checkins[todayKey],
            studyStreak: calculateStudyStreak(checkins),
            overallPercentage: overallPct,
            subjectPercentages: data.subjectPercentages || stats.subjectPercentages,
            totalCheckedChapters: stats.totalCheckedBoxes,
            totalPossibleChapters: stats.totalPossibleBoxes,
            weeklyGoalStatus: weeklyGoal,
            updatedAt: data.updatedAt || new Date().toISOString()
          };
        });

        records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        localStorage.setItem(KEY_ALL_RECORDS_CACHE, JSON.stringify(records));
        return records;
      }
    } catch (e) {
      console.warn('RTDB fetch all improvement records failed, trying Firestore:', e);
    }
  }

  // 2. Try Firestore
  if (db) {
    try {
      let querySnapshot;
      try {
        const q = query(collection(db, 'improvement_study_progress'), orderBy('updatedAt', 'desc'));
        querySnapshot = await getDocs(q);
      } catch (err) {
        querySnapshot = await getDocs(collection(db, 'improvement_study_progress'));
      }

      const records: ImprovementStudentProgressRecord[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const name = (data.studentName || data.name || 'UNKNOWN').toUpperCase();
        const batch = (data.studentClass || data.batch || 'B1') as ImprovementBatch;
        const phone = data.phoneNumber || data.phone || '';
        const selected = data.selectedSubjects || data.improvementSubjects || ['physics', 'chemistry'];
        const progress = normalizeChapterBoxesMap(data.progress);
        const langCount = data.languageChapterCount || 10;
        const checkins = data.dailyCheckins || {};
        const stats = calculateImprovementProgressStats(progress, selected, data.secondLanguage, langCount);
        const overallPct = data.overallPercentage ?? stats.overallPercentage;
        const weeklyGoal = getWeeklyGoalStatus(overallPct);

        records.push({
          id: docSnap.id,
          studentName: name,
          studentClass: batch,
          phoneNumber: phone,
          selectedSubjects: selected,
          secondLanguage: data.secondLanguage,
          languageChapterCount: langCount,
          medium: data.medium || 'English',
          progress,
          dailyCheckins: checkins,
          todayStudied: !!checkins[todayKey],
          studyStreak: calculateStudyStreak(checkins),
          overallPercentage: overallPct,
          subjectPercentages: data.subjectPercentages || stats.subjectPercentages,
          totalCheckedChapters: stats.totalCheckedBoxes,
          totalPossibleChapters: stats.totalPossibleBoxes,
          weeklyGoalStatus: weeklyGoal,
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      });

      records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      localStorage.setItem(KEY_ALL_RECORDS_CACHE, JSON.stringify(records));
      return records;
    } catch (e) {
      console.warn('Firestore fetch all improvement records failed:', e);
    }
  }

  // 3. Fallback: Local Cache
  try {
    const raw = localStorage.getItem(KEY_ALL_RECORDS_CACHE);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return [];
}

// -------------------------------------------------------------
// DELETE RECORD (Admin)
// -------------------------------------------------------------
export async function deleteImprovementProgressRecord(id: string): Promise<void> {
  if (rtdb) {
    try {
      const rtdbRef = ref(rtdb, `improvement_study_progress/${id}`);
      await remove(rtdbRef);
    } catch (e) {
      console.warn('RTDB delete failed:', e);
    }
  }

  if (db) {
    try {
      const docRef = doc(db, 'improvement_study_progress', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Firestore delete failed:', e);
    }
  }

  try {
    const raw = localStorage.getItem(KEY_ALL_RECORDS_CACHE);
    if (raw) {
      const all: ImprovementStudentProgressRecord[] = JSON.parse(raw);
      const updated = all.filter(r => r.id !== id);
      localStorage.setItem(KEY_ALL_RECORDS_CACHE, JSON.stringify(updated));
    }
  } catch (e) {}
}

// -------------------------------------------------------------
// EXCEL EXPORT (Detailed Subject Matrices & Progress)
// -------------------------------------------------------------
export async function exportImprovementProgressToExcel(
  records: ImprovementStudentProgressRecord[],
  batchFilter = 'ALL',
  subjectFilter = 'ALL'
): Promise<void> {
  if (!records || records.length === 0) {
    alert('No improvement records to export.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AIMS Plus Higher Secondary';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Improvement Study Progress', {
    views: [{ showGridLines: true }]
  });

  // Title Banner
  worksheet.mergeCells('A1:L1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'AIMS PLUS HIGHER SECONDARY - IMPROVEMENT STUDY PROGRESS REPORT';
  titleCell.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4338CA' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).height = 34;

  // Metadata Row
  worksheet.mergeCells('A2:L2');
  const metaCell = worksheet.getCell('A2');
  metaCell.value = `Export Date: ${new Date().toLocaleDateString()} | Batch: ${batchFilter} | Subject Filter: ${subjectFilter} | Total Enrolled: ${records.length}`;
  metaCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF374151' } };
  metaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  metaCell.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(2).height = 22;

  // Header Row
  const headers = [
    'Sl. No',
    'Student Name (ALL CAPS)',
    'Batch',
    'Phone (Passkey)',
    'Today Studied?',
    'Study Streak',
    'Weekly Goal Status (Sep 1–Oct 5)',
    'Selected Subjects',
    'Language / Count',
    'Total Done',
    'Total Checkpoints',
    'Overall %',
    'Subject-wise Progress (%)'
  ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF312E81' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF9CA3AF' } },
      left: { style: 'thin', color: { argb: 'FF9CA3AF' } },
      bottom: { style: 'medium', color: { argb: 'FF4338CA' } },
      right: { style: 'thin', color: { argb: 'FF9CA3AF' } }
    };
  });

  // Populate Data Rows
  records.forEach((record, index) => {
    const subProgressSummary = Object.entries(record.subjectPercentages || {})
      .map(([subId, perc]) => `${subId.toUpperCase()}: ${perc}%`)
      .join(' | ');

    const langInfo = record.selectedSubjects?.includes('language') 
      ? `${record.secondLanguage || 'MAL'} (${record.languageChapterCount || 10} Chs)` 
      : '-';

    const goalStatus = record.weeklyGoalStatus || getWeeklyGoalStatus(record.overallPercentage || 0);

    const row = worksheet.addRow([
      index + 1,
      record.studentName.toUpperCase(),
      record.studentClass,
      record.phoneNumber || '-',
      record.todayStudied ? 'YES' : 'NO',
      `${record.studyStreak || 0} days`,
      goalStatus.statusText,
      (record.selectedSubjects || []).map(s => s.toUpperCase()).join(', '),
      langInfo,
      record.totalCheckedChapters || 0,
      record.totalPossibleChapters || 0,
      `${record.overallPercentage || 0}%`,
      subProgressSummary || '-'
    ]);

    row.height = 24;
    const isEven = index % 2 === 0;

    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF9FAFB' }
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: (colNumber === 1 || colNumber === 3 || colNumber === 5 || colNumber === 6 || colNumber === 10 || colNumber === 11 || colNumber === 12) ? 'center' : 'left'
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
      };

      if (colNumber === 2) {
        cell.font = { name: 'Calibri', size: 10, bold: true };
      }
      if (colNumber === 5 && record.todayStudied) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF059669' } };
      }
      if (colNumber === 7 && goalStatus.isCompleted) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF059669' } };
      }
      if (colNumber === 12) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF4338CA' } };
      }
    });
  });

  // Auto-fit Column Widths
  worksheet.columns = [
    { width: 8 },  // Sl No
    { width: 28 }, // Name
    { width: 10 }, // Batch
    { width: 16 }, // Phone
    { width: 14 }, // Today Studied?
    { width: 14 }, // Streak
    { width: 32 }, // Weekly Goal Status
    { width: 28 }, // Subjects
    { width: 18 }, // Language Info
    { width: 13 }, // Done
    { width: 15 }, // Total Checkpoints
    { width: 12 }, // Overall %
    { width: 38 }  // Subject %
  ];

  // Write and Save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const filename = `AIMS_PLUS_Improvement_Progress_${batchFilter}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(blob, filename);
}
