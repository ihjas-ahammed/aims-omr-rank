import { db, rtdb } from './firebaseService';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, orderBy } from 'firebase/firestore';
import { ref, set, get, child, remove } from 'firebase/database';
import { 
  PlusOneBatch, 
  PlusOneScheduleItem, 
  getScheduleForBatch, 
  getTodayDateString, 
  getDaysDifference 
} from '../data/plusOneStudyData';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface PlusOneStudentProfile {
  name: string; // Stored in ALL CAPS
  batch: PlusOneBatch; // 'A1' | 'A2'
  phoneNumber: string; // Passkey
  createdAt?: string;
  updatedAt?: string;
}

export interface PlusOneChapterProgress {
  completed: boolean;
  boxes: boolean[];
  timestamps: (string | null)[];
  updatedAt?: string;
}

export type PlusOneProgressMap = Record<string, PlusOneChapterProgress>;

export interface PlusOneProgressStats {
  totalChapters: number;
  completedChapters: number;
  overallPercentage: number;
  physicsPercentage: number;
  physicsDone: number;
  physicsTotal: number;
  mathsPercentage: number;
  mathsDone: number;
  mathsTotal: number;
}

export interface PlusOneStudentRecord {
  id: string;
  studentName: string;
  batch: PlusOneBatch;
  phoneNumber: string;
  progress: PlusOneProgressMap;
  overallPercentage: number;
  physicsPercentage: number;
  mathsPercentage: number;
  completedChaptersCount: number;
  totalChaptersCount: number;
  todayFocusCompleted: boolean;
  daysToPhysicsExam: number;
  daysToMathsExam: number;
  updatedAt: string;
  createdAt?: string;
}

// LocalStorage Keys
const KEY_ACTIVE_ID = 'plusone_study_progress_active_id';
const KEY_ACTIVE_PROFILE = 'plusone_study_progress_active_profile';
const KEY_ACTIVE_PROGRESS = 'plusone_study_progress_active_boxes';
const KEY_SAVED_PROFILES = 'plusone_study_progress_saved_profiles';
const KEY_ALL_RECORDS_CACHE = 'plusone_study_progress_all_records_cache';

// Helper: Normalize Document ID (e.g. "MUHAMMED_ALI__A1__9876543210")
export function normalizePlusOneDocId(name: string, batch: string, phone: string): string {
  const cleanName = (name || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'STUDENT';

  const cleanBatch = (batch || 'A1').trim().toUpperCase();
  const cleanPhone = (phone || '').trim().replace(/\D/g, '') || '0000';

  return `${cleanName}__${cleanBatch}__${cleanPhone}`;
}

// -------------------------------------------------------------
// PROGRESS STATS CALCULATOR
// -------------------------------------------------------------
export function calculatePlusOneStats(batch: PlusOneBatch, progress: PlusOneProgressMap): PlusOneProgressStats {
  const schedule = getScheduleForBatch(batch);
  // Filter out pure exam entries from syllabus percentage
  const studyItems = schedule.items.filter(item => !item.isExam);
  const physicsItems = studyItems.filter(item => item.subject === 'physics');
  const mathsItems = studyItems.filter(item => item.subject === 'mathematics');

  let physicsDone = 0;
  physicsItems.forEach(item => {
    if (progress[item.id]?.completed) {
      physicsDone++;
    }
  });

  let mathsDone = 0;
  mathsItems.forEach(item => {
    if (progress[item.id]?.completed) {
      mathsDone++;
    }
  });

  const totalChapters = studyItems.length;
  const completedChapters = physicsDone + mathsDone;

  const physicsTotal = physicsItems.length;
  const mathsTotal = mathsItems.length;

  const physicsPercentage = physicsTotal > 0 ? Math.round((physicsDone / physicsTotal) * 100) : 0;
  const mathsPercentage = mathsTotal > 0 ? Math.round((mathsDone / mathsTotal) * 100) : 0;
  const overallPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  return {
    totalChapters,
    completedChapters,
    overallPercentage,
    physicsPercentage,
    physicsDone,
    physicsTotal,
    mathsPercentage,
    mathsDone,
    mathsTotal
  };
}

// -------------------------------------------------------------
// LOCAL STORAGE MANAGEMENT
// -------------------------------------------------------------
export function getLocalPlusOneProfile(): PlusOneStudentProfile | null {
  try {
    const raw = localStorage.getItem(KEY_ACTIVE_PROFILE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.name && parsed.phoneNumber) {
      return {
        name: (parsed.name || '').toUpperCase(),
        batch: (parsed.batch === 'A2' ? 'A2' : 'A1') as PlusOneBatch,
        phoneNumber: parsed.phoneNumber,
        createdAt: parsed.createdAt,
        updatedAt: parsed.updatedAt
      };
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function getAllLocalPlusOneProfiles(): PlusOneStudentProfile[] {
  try {
    const raw = localStorage.getItem(KEY_SAVED_PROFILES);
    if (!raw) {
      const active = getLocalPlusOneProfile();
      return active ? [active] : [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(p => p && p.name && p.phoneNumber);
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function saveLocalPlusOneProfileArray(profiles: PlusOneStudentProfile[]) {
  try {
    localStorage.setItem(KEY_SAVED_PROFILES, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save local plus one profiles array:', e);
  }
}

export function getLocalPlusOneProgress(docId?: string): PlusOneProgressMap {
  try {
    const id = docId || localStorage.getItem(KEY_ACTIVE_ID);
    if (id) {
      const specific = localStorage.getItem(`plusone_study_progress_boxes_${id}`);
      if (specific) {
        return JSON.parse(specific);
      }
    }
    const general = localStorage.getItem(KEY_ACTIVE_PROGRESS);
    if (general) {
      return JSON.parse(general);
    }
    return {};
  } catch (e) {
    return {};
  }
}

export function saveLocalPlusOneProgress(progress: PlusOneProgressMap, docId?: string) {
  try {
    const json = JSON.stringify(progress);
    localStorage.setItem(KEY_ACTIVE_PROGRESS, json);
    const id = docId || localStorage.getItem(KEY_ACTIVE_ID);
    if (id) {
      localStorage.setItem(`plusone_study_progress_boxes_${id}`, json);
    }
  } catch (e) {
    console.error('Failed to save local plusone progress:', e);
  }
}

export function switchActivePlusOneProfile(profile: PlusOneStudentProfile) {
  const docId = normalizePlusOneDocId(profile.name, profile.batch, profile.phoneNumber);
  localStorage.setItem(KEY_ACTIVE_ID, docId);
  localStorage.setItem(KEY_ACTIVE_PROFILE, JSON.stringify(profile));

  const progress = getLocalPlusOneProgress(docId);
  localStorage.setItem(KEY_ACTIVE_PROGRESS, JSON.stringify(progress));
}

export function removeLocalPlusOneProfile(id: string) {
  const list = getAllLocalPlusOneProfiles();
  const filtered = list.filter(p => normalizePlusOneDocId(p.name, p.batch, p.phoneNumber) !== id);
  saveLocalPlusOneProfileArray(filtered);

  const activeId = localStorage.getItem(KEY_ACTIVE_ID);
  if (activeId === id) {
    if (filtered.length > 0) {
      switchActivePlusOneProfile(filtered[0]);
    } else {
      localStorage.removeItem(KEY_ACTIVE_ID);
      localStorage.removeItem(KEY_ACTIVE_PROFILE);
      localStorage.removeItem(KEY_ACTIVE_PROGRESS);
    }
  }
  localStorage.removeItem(`plusone_study_progress_boxes_${id}`);
}

// -------------------------------------------------------------
// SAVE STUDENT PROGRESS (FIREBASE RTDB + FIRESTORE + LOCAL CACHE)
// -------------------------------------------------------------
export async function savePlusOneStudentProgress(
  profile: PlusOneStudentProfile,
  progress: PlusOneProgressMap
): Promise<void> {
  const sanitizedProfile: PlusOneStudentProfile = {
    name: (profile.name || '').trim().toUpperCase(),
    batch: profile.batch === 'A2' ? 'A2' : 'A1',
    phoneNumber: (profile.phoneNumber || '').trim(),
    createdAt: profile.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const docId = normalizePlusOneDocId(
    sanitizedProfile.name,
    sanitizedProfile.batch,
    sanitizedProfile.phoneNumber
  );

  const nowIso = new Date().toISOString();
  sanitizedProfile.updatedAt = nowIso;

  // 1. Calculate stats
  const stats = calculatePlusOneStats(sanitizedProfile.batch, progress);
  const schedule = getScheduleForBatch(sanitizedProfile.batch);
  const todayStr = getTodayDateString();
  const todayItem = schedule.items.find(i => i.dateIso === todayStr);
  const todayFocusCompleted = !!(todayItem && progress[todayItem.id]?.completed);
  const daysToPhysicsExam = getDaysDifference(schedule.physicsExamDate);
  const daysToMathsExam = getDaysDifference(schedule.mathsExamDate);

  // 2. Update Local Storage
  localStorage.setItem(KEY_ACTIVE_ID, docId);
  localStorage.setItem(KEY_ACTIVE_PROFILE, JSON.stringify(sanitizedProfile));
  saveLocalPlusOneProgress(progress, docId);

  // Save into multi-account list
  const existingProfiles = getAllLocalPlusOneProfiles();
  const filtered = existingProfiles.filter(p => 
    normalizePlusOneDocId(p.name, p.batch, p.phoneNumber) !== docId
  );
  filtered.unshift(sanitizedProfile);
  saveLocalPlusOneProfileArray(filtered);

  // Update Admin Cache locally
  try {
    const cachedStr = localStorage.getItem(KEY_ALL_RECORDS_CACHE);
    const localAll: PlusOneStudentRecord[] = cachedStr ? JSON.parse(cachedStr) : [];
    const recordData: PlusOneStudentRecord = {
      id: docId,
      studentName: sanitizedProfile.name,
      batch: sanitizedProfile.batch,
      phoneNumber: sanitizedProfile.phoneNumber,
      progress,
      overallPercentage: stats.overallPercentage,
      physicsPercentage: stats.physicsPercentage,
      mathsPercentage: stats.mathsPercentage,
      completedChaptersCount: stats.completedChapters,
      totalChaptersCount: stats.totalChapters,
      todayFocusCompleted,
      daysToPhysicsExam,
      daysToMathsExam,
      updatedAt: nowIso,
      createdAt: sanitizedProfile.createdAt
    };

    const existingIdx = localAll.findIndex(r => r.id === docId);
    if (existingIdx >= 0) {
      localAll[existingIdx] = recordData;
    } else {
      localAll.unshift(recordData);
    }
    localStorage.setItem(KEY_ALL_RECORDS_CACHE, JSON.stringify(localAll));
  } catch (e) {}

  const payload = {
    id: docId,
    studentName: sanitizedProfile.name,
    batch: sanitizedProfile.batch,
    phoneNumber: sanitizedProfile.phoneNumber,
    progress,
    overallPercentage: stats.overallPercentage,
    physicsPercentage: stats.physicsPercentage,
    mathsPercentage: stats.mathsPercentage,
    completedChaptersCount: stats.completedChapters,
    totalChaptersCount: stats.totalChapters,
    todayFocusCompleted,
    daysToPhysicsExam,
    daysToMathsExam,
    updatedAt: nowIso,
    createdAt: sanitizedProfile.createdAt
  };

  // 3. Save to Realtime Database
  if (rtdb) {
    try {
      const rtdbRef = ref(rtdb, `plusone_study_progress/${docId}`);
      await set(rtdbRef, payload);
    } catch (e) {
      console.warn('RTDB plusone progress write failed, falling back:', e);
    }
  }

  // 4. Save to Firestore
  if (db) {
    try {
      const docRef = doc(db, 'plusone_study_progress', docId);
      await setDoc(docRef, payload, { merge: true });
    } catch (e) {
      console.warn('Firestore plusone progress write failed:', e);
    }
  }
}

// -------------------------------------------------------------
// STUDENT LOGIN (LOOKUP BY NAME, BATCH, PHONE)
// -------------------------------------------------------------
export async function loginPlusOneStudent(
  name: string,
  batch: PlusOneBatch,
  phone: string
): Promise<{ profile: PlusOneStudentProfile; progress: PlusOneProgressMap } | null> {
  const targetDocId = normalizePlusOneDocId(name, batch, phone);

  // 1. Check local cache
  const localBoxes = getLocalPlusOneProgress(targetDocId);
  if (Object.keys(localBoxes).length > 0) {
    const saved = getAllLocalPlusOneProfiles().find(p => 
      normalizePlusOneDocId(p.name, p.batch, p.phoneNumber) === targetDocId
    );
    if (saved) {
      switchActivePlusOneProfile(saved);
      return { profile: saved, progress: localBoxes };
    }
  }

  // 2. Query RTDB
  if (rtdb) {
    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, `plusone_study_progress/${targetDocId}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const profile: PlusOneStudentProfile = {
          name: (data.studentName || name).toUpperCase(),
          batch: (data.batch || batch) as PlusOneBatch,
          phoneNumber: data.phoneNumber || phone,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
        const progress: PlusOneProgressMap = data.progress || {};
        switchActivePlusOneProfile(profile);
        saveLocalPlusOneProgress(progress, targetDocId);
        return { profile, progress };
      }
    } catch (e) {
      console.warn('RTDB student lookup failed:', e);
    }
  }

  // 3. Query Firestore
  if (db) {
    try {
      const docRef = doc(db, 'plusone_study_progress', targetDocId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const profile: PlusOneStudentProfile = {
          name: (data.studentName || name).toUpperCase(),
          batch: (data.batch || batch) as PlusOneBatch,
          phoneNumber: data.phoneNumber || phone,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
        const progress: PlusOneProgressMap = data.progress || {};
        switchActivePlusOneProfile(profile);
        saveLocalPlusOneProgress(progress, targetDocId);
        return { profile, progress };
      }
    } catch (e) {
      console.warn('Firestore student lookup failed:', e);
    }
  }

  return null;
}

// -------------------------------------------------------------
// FETCH ALL PROGRESS RECORDS (FOR ADMIN DASHBOARD)
// -------------------------------------------------------------
export async function fetchAllPlusOneProgress(): Promise<PlusOneStudentRecord[]> {
  const todayStr = getTodayDateString();

  // 1. Try RTDB
  if (rtdb) {
    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, 'plusone_study_progress'));
      if (snapshot.exists()) {
        const val = snapshot.val();
        const records: PlusOneStudentRecord[] = Object.values(val).map((data: any) => {
          const name = (data.studentName || data.name || 'UNKNOWN').toUpperCase();
          const batch = (data.batch || 'A1') as PlusOneBatch;
          const phone = data.phoneNumber || data.phone || '';
          const progress: PlusOneProgressMap = data.progress || {};
          const stats = calculatePlusOneStats(batch, progress);
          const schedule = getScheduleForBatch(batch);
          const todayItem = schedule.items.find(i => i.dateIso === todayStr);

          return {
            id: data.id || normalizePlusOneDocId(name, batch, phone),
            studentName: name,
            batch,
            phoneNumber: phone,
            progress,
            overallPercentage: data.overallPercentage ?? stats.overallPercentage,
            physicsPercentage: data.physicsPercentage ?? stats.physicsPercentage,
            mathsPercentage: data.mathsPercentage ?? stats.mathsPercentage,
            completedChaptersCount: stats.completedChapters,
            totalChaptersCount: stats.totalChapters,
            todayFocusCompleted: !!(todayItem && progress[todayItem.id]?.completed),
            daysToPhysicsExam: getDaysDifference(schedule.physicsExamDate),
            daysToMathsExam: getDaysDifference(schedule.mathsExamDate),
            updatedAt: data.updatedAt || new Date().toISOString(),
            createdAt: data.createdAt
          };
        });

        records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        localStorage.setItem(KEY_ALL_RECORDS_CACHE, JSON.stringify(records));
        return records;
      }
    } catch (e) {
      console.warn('RTDB fetch all plus one records failed:', e);
    }
  }

  // 2. Try Firestore
  if (db) {
    try {
      let querySnapshot;
      try {
        const q = query(collection(db, 'plusone_study_progress'), orderBy('updatedAt', 'desc'));
        querySnapshot = await getDocs(q);
      } catch (err) {
        querySnapshot = await getDocs(collection(db, 'plusone_study_progress'));
      }

      const records: PlusOneStudentRecord[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const name = (data.studentName || data.name || 'UNKNOWN').toUpperCase();
        const batch = (data.batch || 'A1') as PlusOneBatch;
        const phone = data.phoneNumber || data.phone || '';
        const progress: PlusOneProgressMap = data.progress || {};
        const stats = calculatePlusOneStats(batch, progress);
        const schedule = getScheduleForBatch(batch);
        const todayItem = schedule.items.find(i => i.dateIso === todayStr);

        records.push({
          id: docSnap.id,
          studentName: name,
          batch,
          phoneNumber: phone,
          progress,
          overallPercentage: data.overallPercentage ?? stats.overallPercentage,
          physicsPercentage: data.physicsPercentage ?? stats.physicsPercentage,
          mathsPercentage: data.mathsPercentage ?? stats.mathsPercentage,
          completedChaptersCount: stats.completedChapters,
          totalChaptersCount: stats.totalChapters,
          todayFocusCompleted: !!(todayItem && progress[todayItem.id]?.completed),
          daysToPhysicsExam: getDaysDifference(schedule.physicsExamDate),
          daysToMathsExam: getDaysDifference(schedule.mathsExamDate),
          updatedAt: data.updatedAt || new Date().toISOString(),
          createdAt: data.createdAt
        });
      });

      records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      localStorage.setItem(KEY_ALL_RECORDS_CACHE, JSON.stringify(records));
      return records;
    } catch (e) {
      console.warn('Firestore fetch all plus one records failed:', e);
    }
  }

  // 3. Fallback to LocalStorage cache
  try {
    const raw = localStorage.getItem(KEY_ALL_RECORDS_CACHE);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return [];
}

// -------------------------------------------------------------
// DELETE STUDENT RECORD
// -------------------------------------------------------------
export async function deletePlusOneProgressRecord(id: string): Promise<void> {
  removeLocalPlusOneProfile(id);

  if (rtdb) {
    try {
      const rtdbRef = ref(rtdb, `plusone_study_progress/${id}`);
      await remove(rtdbRef);
    } catch (e) {
      console.error('RTDB plusone delete failed:', e);
    }
  }

  if (db) {
    try {
      const docRef = doc(db, 'plusone_study_progress', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.error('Firestore plusone delete failed:', e);
    }
  }
}

// -------------------------------------------------------------
// EXPORT PLUS ONE RECORDS TO EXCEL (.xlsx)
// -------------------------------------------------------------
export async function exportPlusOneProgressToExcel(records: PlusOneStudentRecord[]): Promise<void> {
  if (!records || records.length === 0) {
    alert('No student records found to export.');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AIMS Plus Institute';
  workbook.created = new Date();

  // Sheet 1: Master Overview
  const sheetOverview = workbook.addWorksheet('Overview');
  sheetOverview.columns = [
    { header: 'SL NO', key: 'sl', width: 8 },
    { header: 'STUDENT NAME', key: 'name', width: 28 },
    { header: 'BATCH', key: 'batch', width: 10 },
    { header: 'PHONE NUMBER', key: 'phone', width: 16 },
    { header: 'OVERALL %', key: 'overall', width: 14 },
    { header: 'CHAPTERS DONE', key: 'chaptersDone', width: 16 },
    { header: 'PHYSICS %', key: 'physics', width: 14 },
    { header: 'MATHEMATICS %', key: 'maths', width: 16 },
    { header: "TODAY'S FOCUS DONE", key: 'todayFocus', width: 20 },
    { header: 'DAYS TO PHY EXAM', key: 'daysPhy', width: 18 },
    { header: 'DAYS TO MATH EXAM', key: 'daysMath', width: 18 },
    { header: 'LAST UPDATED', key: 'updatedAt', width: 22 }
  ];

  // Header styling
  const headerRow = sheetOverview.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' } // slate-800
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  records.forEach((r, idx) => {
    const row = sheetOverview.addRow({
      sl: idx + 1,
      name: r.studentName,
      batch: r.batch,
      phone: r.phoneNumber,
      overall: `${r.overallPercentage}%`,
      chaptersDone: `${r.completedChaptersCount} / ${r.totalChaptersCount}`,
      physics: `${r.physicsPercentage}%`,
      maths: `${r.mathsPercentage}%`,
      todayFocus: r.todayFocusCompleted ? 'YES' : 'NO',
      daysPhy: r.daysToPhysicsExam <= 0 ? 'Exam Done' : `${r.daysToPhysicsExam} days`,
      daysMath: r.daysToMathsExam <= 0 ? 'Exam Done' : `${r.daysToMathsExam} days`,
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toLocaleString() : ''
    });

    row.alignment = { vertical: 'middle' };
    row.getCell('sl').alignment = { horizontal: 'center' };
    row.getCell('batch').alignment = { horizontal: 'center' };
    row.getCell('overall').alignment = { horizontal: 'center' };
    row.getCell('todayFocus').alignment = { horizontal: 'center' };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const dateStr = getTodayDateString();
  saveAs(blob, `Plus_One_Study_Progress_${dateStr}.xlsx`);
}
