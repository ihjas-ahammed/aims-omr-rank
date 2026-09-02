// Semester 5 Study Progress Service
// Dual Firebase (RTDB + Firestore) + LocalStorage Synchronization
import { ref, set, get, onValue, off, child, remove } from 'firebase/database';
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { rtdb, db } from './firebaseService';
import { Sem5CourseDef, getSem5Courses, getSem5DefaultCoreCourses } from '../data/sem5StudyProgressData';
import ExcelJS from 'exceljs';

export type Sem5Subject = 'mathematics' | 'physics';

export interface Sem5TopicProgress {
  completed: boolean;
  completedAt?: string | null;
  conceptDone?: boolean;
  problemsDone?: boolean;
  revisionDone?: boolean;
  notes?: string;
  confidence?: 1 | 2 | 3 | 4 | 5;
}

export type Sem5ProgressMap = Record<string, Sem5TopicProgress>;

export interface Sem5StudentProfile {
  id: string;
  name: string; // Stored in ALL CAPS
  phoneNumber: string; // Passkey
  subject: Sem5Subject;
  semester: 5;
  selectedCourses: string[];
  startDate?: string; // YYYY-MM-DD (defaults to today or profile created date)
  targetCompleteDate: string; // YYYY-MM-DD
  intervalDays?: number; // Days per milestone slice, default 7
  targetCreatedDate?: string; // YYYY-MM-DD
  dailyCheckins?: Record<string, boolean>; // Date string (YYYY-MM-DD) -> boolean
  createdAt: string;
  lastActive: string;
}

export interface Sem5Milestone {
  sliceIndex: number;
  sliceNumber: number;
  title: string;
  startDate: string;
  targetDate: string;
  targetDateFormatted: string;
  targetDateShort: string;
  targetPercentage: number;
  isCurrentSlice: boolean;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface Sem5GoalSchedule {
  startDate: string;
  targetDate: string;
  intervalDays: number;
  totalDays: number;
  totalSlices: number;
  currentSlice: Sem5Milestone;
  activeSliceIndex: number;
  daysLeftInCurrentSlice: number;
  isCompleted: boolean;
  isOnTrack: boolean;
  deltaPercentage: number;
  statusText: string;
  milestones: Sem5Milestone[];
}

export interface Sem5Stats {
  totalTopics: number;
  completedTopics: number;
  percentage: number;
  conceptCount: number;
  problemsCount: number;
  revisionCount: number;
  daysRemaining: number;
  startDate: string;
  targetDate: string;
  intervalDays: number;
  requiredDailyPace: number;
  streak: number;
}

const LOCAL_PROFILE_KEY_PREFIX = 'aims_sem5_profile_';
const LOCAL_PROGRESS_KEY_PREFIX = 'aims_sem5_progress_';
const ALL_PROFILES_KEY = 'aims_sem5_all_profiles';

export function normalizeDocId(name: string, subject: Sem5Subject, phone: string): string {
  const cleanName = name.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
  const cleanPhone = phone.trim().replace(/\D/g, '');
  return `${cleanName}_SEM5_${subject.toUpperCase()}_${cleanPhone}`;
}

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function calculateStudyStreak(checkins?: Record<string, boolean>): number {
  if (!checkins) return 0;
  
  let streak = 0;
  const now = new Date();
  
  // Check from today or yesterday
  const checkDate = new Date(now);
  const todayKey = getTodayDateKey();
  
  // If not checked today yet, start from yesterday
  if (!checkins[todayKey]) {
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  while (true) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${d}`;
    
    if (checkins[dateKey]) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

// Local Storage helpers
export function getLocalSem5Profile(subject: Sem5Subject): Sem5StudentProfile | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_PROFILE_KEY_PREFIX}${subject}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalSem5Profile(profile: Sem5StudentProfile): void {
  try {
    localStorage.setItem(`${LOCAL_PROFILE_KEY_PREFIX}${profile.subject}`, JSON.stringify(profile));
    
    // Also save in all profiles register
    const all = getAllSavedSem5Profiles();
    const filtered = all.filter(p => p.id !== profile.id);
    filtered.unshift(profile);
    localStorage.setItem(ALL_PROFILES_KEY, JSON.stringify(filtered.slice(0, 25)));
  } catch (err) {
    console.error('Failed to save profile locally:', err);
  }
}

export function getAllSavedSem5Profiles(): Sem5StudentProfile[] {
  try {
    const raw = localStorage.getItem(ALL_PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function removeLocalSem5Profile(profileId: string): void {
  try {
    const all = getAllSavedSem5Profiles();
    const filtered = all.filter(p => p.id !== profileId);
    localStorage.setItem(ALL_PROFILES_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to remove profile locally:', err);
  }
}

export function getLocalSem5Progress(subject: Sem5Subject, studentId: string): Sem5ProgressMap {
  try {
    const raw = localStorage.getItem(`${LOCAL_PROGRESS_KEY_PREFIX}${subject}_${studentId}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalSem5Progress(subject: Sem5Subject, studentId: string, progress: Sem5ProgressMap): void {
  try {
    localStorage.setItem(`${LOCAL_PROGRESS_KEY_PREFIX}${subject}_${studentId}`, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save progress locally:', err);
  }
}

// Firebase Cloud Sync
export async function saveSem5ProgressToCloud(
  profile: Sem5StudentProfile,
  progress: Sem5ProgressMap
): Promise<void> {
  const now = new Date().toISOString();
  const updatedProfile: Sem5StudentProfile = {
    ...profile,
    lastActive: now
  };

  saveLocalSem5Profile(updatedProfile);
  saveLocalSem5Progress(profile.subject, profile.id, progress);

  // 1. Realtime Database Sync
  if (rtdb) {
    try {
      const rtdbRef = ref(rtdb, `sem5_progress/${profile.subject}/${profile.id}`);
      await set(rtdbRef, {
        profile: updatedProfile,
        progress,
        lastUpdated: now
      });
    } catch (err) {
      console.warn('RTDB sync failed, using local storage:', err);
    }
  }

  // 2. Firestore Sync Backup
  if (db) {
    try {
      const docRef = doc(db, 'sem5_study_progress', profile.id);
      await setDoc(docRef, {
        profile: updatedProfile,
        progress,
        lastUpdated: now
      }, { merge: true });
    } catch (err) {
      console.warn('Firestore sync failed:', err);
    }
  }
}

// Student Login via Passkey (Name + Phone)
export async function loginSem5Student(
  name: string,
  phoneNumber: string,
  subject: Sem5Subject
): Promise<{ profile: Sem5StudentProfile; progress: Sem5ProgressMap } | null> {
  const studentId = normalizeDocId(name, subject, phoneNumber);

  // 1. Try RTDB
  if (rtdb) {
    try {
      const rtdbRef = ref(rtdb, `sem5_progress/${subject}/${studentId}`);
      const snap = await get(rtdbRef);
      if (snap.exists()) {
        const val = snap.val();
        if (val.profile) {
          saveLocalSem5Profile(val.profile);
          saveLocalSem5Progress(subject, studentId, val.progress || {});
          return {
            profile: val.profile,
            progress: val.progress || {}
          };
        }
      }
    } catch (err) {
      console.warn('RTDB login error:', err);
    }
  }

  // 2. Try Firestore
  if (db) {
    try {
      const docRef = doc(db, 'sem5_study_progress', studentId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.profile) {
          saveLocalSem5Profile(data.profile);
          saveLocalSem5Progress(subject, studentId, data.progress || {});
          return {
            profile: data.profile,
            progress: data.progress || {}
          };
        }
      }
    } catch (err) {
      console.warn('Firestore login error:', err);
    }
  }

  // 3. Fallback to Local Storage
  const saved = getAllSavedSem5Profiles();
  const matched = saved.find(p => p.id === studentId || (p.name.toUpperCase() === name.trim().toUpperCase() && p.phoneNumber === phoneNumber.trim()));
  if (matched) {
    const localProg = getLocalSem5Progress(subject, matched.id);
    saveLocalSem5Profile(matched);
    return {
      profile: matched,
      progress: localProg
    };
  }

  return null;
}

export function subscribeSem5StudentData(
  subject: Sem5Subject,
  studentId: string,
  callback: (data: { profile: Sem5StudentProfile | null; progress: Sem5ProgressMap }) => void
): () => void {
  if (!rtdb) {
    callback({
      profile: getLocalSem5Profile(subject),
      progress: getLocalSem5Progress(subject, studentId)
    });
    return () => {};
  }

  const rtdbRef = ref(rtdb, `sem5_progress/${subject}/${studentId}`);
  const listener = onValue(rtdbRef, (snapshot) => {
    if (snapshot.exists()) {
      const val = snapshot.val();
      callback({
        profile: val.profile || null,
        progress: val.progress || {}
      });
    } else {
      callback({
        profile: getLocalSem5Profile(subject),
        progress: getLocalSem5Progress(subject, studentId)
      });
    }
  });

  return () => {
    off(rtdbRef, 'value', listener);
  };
}

export async function saveSem5DailyCheckin(
  profile: Sem5StudentProfile,
  dateKey: string,
  studied: boolean
): Promise<Sem5StudentProfile> {
  const updatedCheckins = {
    ...(profile.dailyCheckins || {}),
    [dateKey]: studied
  };

  const updatedProfile: Sem5StudentProfile = {
    ...profile,
    dailyCheckins: updatedCheckins,
    lastActive: new Date().toISOString()
  };

  saveLocalSem5Profile(updatedProfile);

  // Sync to Cloud
  if (rtdb) {
    try {
      const rtdbRef = ref(rtdb, `sem5_progress/${profile.subject}/${profile.id}/profile`);
      await set(rtdbRef, updatedProfile);
    } catch {}
  }

  if (db) {
    try {
      const docRef = doc(db, 'sem5_study_progress', profile.id);
      await setDoc(docRef, { profile: updatedProfile }, { merge: true });
    } catch {}
  }

  return updatedProfile;
}

// Calculate Milestone Goal Schedule (Divides Target Date - Start Date into Intervals)
export function calculateSem5GoalSchedule(
  currentPercentage: number,
  startDateStr?: string,
  targetDateStr?: string,
  intervalDaysInput?: number,
  customDate?: Date
): Sem5GoalSchedule {
  const now = customDate || new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const intervalDays = Math.max(1, intervalDaysInput && !isNaN(intervalDaysInput) ? Number(intervalDaysInput) : 7);

  let startDate = startDateStr;
  if (!startDate || isNaN(new Date(startDate).getTime())) {
    startDate = todayStr;
  }

  let targetDate = targetDateStr;
  if (!targetDate || isNaN(new Date(targetDate).getTime())) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 35);
    targetDate = d.toISOString().split('T')[0];
  }

  // Ensure targetDate > startDate
  const startObj = new Date(startDate + 'T00:00:00');
  let endObj = new Date(targetDate + 'T23:59:59');
  if (endObj.getTime() <= startObj.getTime()) {
    endObj = new Date(startObj.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    targetDate = endObj.toISOString().split('T')[0];
  }

  const diffMs = endObj.getTime() - startObj.getTime();
  const totalDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const totalSlices = Math.max(1, Math.ceil(totalDays / intervalDays));

  const milestones: Sem5Milestone[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  for (let i = 0; i < totalSlices; i++) {
    const sliceStartMs = startObj.getTime() + i * intervalDays * 24 * 60 * 60 * 1000;
    const sliceEndMs = Math.min(endObj.getTime(), startObj.getTime() + (i + 1) * intervalDays * 24 * 60 * 60 * 1000 - 1000);
    
    const sliceStartD = new Date(sliceStartMs);
    const sliceEndD = new Date(sliceEndMs);

    const sStartStr = sliceStartD.toISOString().split('T')[0];
    const sEndStr = sliceEndD.toISOString().split('T')[0];

    const targetPct = i === totalSlices - 1 ? 100 : Math.min(99, Math.round(((i + 1) / totalSlices) * 100));
    
    const shortDate = `${monthNames[sliceEndD.getMonth()]} ${sliceEndD.getDate()}`;
    const formattedDate = `${fullMonthNames[sliceEndD.getMonth()]} ${sliceEndD.getDate()}, ${sliceEndD.getFullYear()}`;

    let status: 'completed' | 'in_progress' | 'pending' = 'pending';
    if (currentPercentage >= targetPct) {
      status = 'completed';
    }

    const title = intervalDays === 7 ? `Week ${i + 1}` : `Milestone ${i + 1}`;

    milestones.push({
      sliceIndex: i,
      sliceNumber: i + 1,
      title,
      startDate: sStartStr,
      targetDate: sEndStr,
      targetDateFormatted: formattedDate,
      targetDateShort: shortDate,
      targetPercentage: targetPct,
      isCurrentSlice: false,
      status
    });
  }

  // Determine active milestone slice based on today
  let activeIndex = 0;
  for (let i = 0; i < milestones.length; i++) {
    if (todayStr <= milestones[i].targetDate) {
      activeIndex = i;
      break;
    }
    if (i === milestones.length - 1) {
      activeIndex = i;
    }
  }

  milestones[activeIndex].isCurrentSlice = true;
  if (milestones[activeIndex].status !== 'completed') {
    milestones[activeIndex].status = 'in_progress';
  }

  const currentSlice = milestones[activeIndex];
  const currentSliceEndObj = new Date(`${currentSlice.targetDate}T23:59:59`);
  const diffToSliceEnd = currentSliceEndObj.getTime() - now.getTime();
  const daysLeftInCurrentSlice = Math.max(0, Math.ceil(diffToSliceEnd / (1000 * 60 * 60 * 24)));

  const isCompleted = currentPercentage >= currentSlice.targetPercentage;
  const isOnTrack = isCompleted || (currentPercentage >= currentSlice.targetPercentage - 5);
  const deltaPercentage = currentPercentage - currentSlice.targetPercentage;

  let statusText = '';
  if (currentPercentage >= 100) {
    statusText = 'Full 100% Syllabus Completed! 🏆';
  } else if (isCompleted) {
    statusText = `${currentSlice.title} Target Achieved (${currentPercentage}% / ${currentSlice.targetPercentage}%) 🎉`;
  } else if (daysLeftInCurrentSlice === 0) {
    statusText = `Target due today! Need +${Math.abs(deltaPercentage)}% to reach ${currentSlice.targetPercentage}%`;
  } else {
    statusText = `Need +${Math.abs(deltaPercentage)}% by ${currentSlice.targetDateShort} (${daysLeftInCurrentSlice} ${daysLeftInCurrentSlice === 1 ? 'day' : 'days'} left)`;
  }

  return {
    startDate,
    targetDate,
    intervalDays,
    totalDays,
    totalSlices,
    currentSlice,
    activeSliceIndex: activeIndex,
    daysLeftInCurrentSlice,
    isCompleted,
    isOnTrack,
    deltaPercentage,
    statusText,
    milestones
  };
}

// Calculate Progress Metrics & Target Date Analytics
export function calculateSem5Stats(
  courses: Sem5CourseDef[],
  selectedCourseIds: string[],
  progress: Sem5ProgressMap,
  targetDateStr: string,
  dailyCheckins?: Record<string, boolean>,
  startDateStr?: string,
  intervalDaysInput?: number
): Sem5Stats {
  const activeCourses = courses.filter(c => selectedCourseIds.includes(c.id));
  
  let totalTopics = 0;
  let completedTopics = 0;
  let conceptCount = 0;
  let problemsCount = 0;
  let revisionCount = 0;

  activeCourses.forEach(c => {
    c.modules.forEach(m => {
      m.topics.forEach(t => {
        totalTopics++;
        const prog = progress[t.id];
        if (prog?.completed) completedTopics++;
        if (prog?.conceptDone) conceptCount++;
        if (prog?.problemsDone) problemsCount++;
        if (prog?.revisionDone) revisionCount++;
      });
    });
  });

  const percentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Start and Target Date calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = startDateStr && !isNaN(new Date(startDateStr).getTime()) 
    ? startDateStr 
    : today.toISOString().split('T')[0];

  let targetDate = new Date(targetDateStr);
  if (isNaN(targetDate.getTime())) {
    // Default to 35 days from start date
    targetDate = new Date(startDate);
    targetDate.setDate(targetDate.getDate() + 35);
  }
  targetDate.setHours(0, 0, 0, 0);

  const intervalDays = Math.max(1, intervalDaysInput && !isNaN(intervalDaysInput) ? Number(intervalDaysInput) : 7);

  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const topicsLeft = Math.max(0, totalTopics - completedTopics);
  const requiredDailyPace = Math.ceil(topicsLeft / daysRemaining);
  const streak = calculateStudyStreak(dailyCheckins);

  return {
    totalTopics,
    completedTopics,
    percentage,
    conceptCount,
    problemsCount,
    revisionCount,
    daysRemaining,
    startDate,
    targetDate: targetDate.toISOString().split('T')[0],
    intervalDays,
    requiredDailyPace,
    streak
  };
}

// Export Semester 5 Progress to Excel
export async function exportSem5ProgressToExcel(
  profile: Sem5StudentProfile,
  courses: Sem5CourseDef[],
  progress: Sem5ProgressMap,
  stats: Sem5Stats
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AIMS Plus Academic Hub';
  workbook.created = new Date();

  // 1. Summary Sheet
  const sumSheet = workbook.addWorksheet('Progress Overview', {
    properties: { tabColor: { argb: 'FF4F46E5' } }
  });

  sumSheet.columns = [
    { header: 'Metric', key: 'metric', width: 32 },
    { header: 'Value', key: 'val', width: 40 }
  ];

  sumSheet.addRow({ metric: 'Student Name', val: profile.name });
  sumSheet.addRow({ metric: 'Phone Number (Passkey)', val: profile.phoneNumber });
  sumSheet.addRow({ metric: 'Programme & Semester', val: `B.Sc. ${profile.subject.toUpperCase()} (Semester 5)` });
  sumSheet.addRow({ metric: 'Target Completion Date', val: profile.targetCompleteDate });
  sumSheet.addRow({ metric: 'Days Remaining', val: `${stats.daysRemaining} days` });
  sumSheet.addRow({ metric: 'Current Study Streak', val: `${stats.streak} Days Streak` });
  sumSheet.addRow({ metric: 'Overall Syllabus Completed', val: `${stats.percentage}% (${stats.completedTopics} of ${stats.totalTopics} Topics)` });
  sumSheet.addRow({ metric: 'Theory & Concept Mastery', val: `${stats.conceptCount} Topics` });
  sumSheet.addRow({ metric: 'Problems & Derivations Done', val: `${stats.problemsCount} Topics` });
  sumSheet.addRow({ metric: 'Final Revisions Completed', val: `${stats.revisionCount} Topics` });
  sumSheet.addRow({ metric: 'Required Daily Pace', val: `${stats.requiredDailyPace} Topics / day` });
  sumSheet.addRow({ metric: 'Last Active Date', val: profile.lastActive ? new Date(profile.lastActive).toLocaleString() : 'N/A' });

  // Style Header
  sumSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sumSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }
  };

  // 2. Detailed Course Sheets
  const activeCourses = courses.filter(c => profile.selectedCourses.includes(c.id));

  activeCourses.forEach(course => {
    const sheetName = course.code ? `${course.code.slice(0, 15)}` : course.title.slice(0, 20);
    const sheet = workbook.addWorksheet(sheetName);

    sheet.columns = [
      { header: 'Module', key: 'mod', width: 20 },
      { header: 'Code', key: 'code', width: 10 },
      { header: 'Topic Title', key: 'title', width: 45 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Concept', key: 'concept', width: 12 },
      { header: 'Problems', key: 'problems', width: 12 },
      { header: 'Revision', key: 'rev', width: 12 },
      { header: 'Notes', key: 'notes', width: 30 }
    ];

    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' }
    };

    course.modules.forEach(m => {
      m.topics.forEach(t => {
        const prog = progress[t.id];
        sheet.addRow({
          mod: m.title,
          code: t.code,
          title: t.title,
          status: prog?.completed ? 'COMPLETED' : 'PENDING',
          concept: prog?.conceptDone ? 'DONE' : '-',
          problems: prog?.problemsDone ? 'DONE' : '-',
          rev: prog?.revisionDone ? 'DONE' : '-',
          notes: prog?.notes || ''
        });
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `AIMS_${profile.subject.toUpperCase()}_Sem5_Progress_${profile.name.replace(/\s+/g, '_')}.xlsx`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
