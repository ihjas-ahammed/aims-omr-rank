import { db, rtdb } from './firebaseService';
import { collection, doc, setDoc, getDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref, set, get, child, onValue, off } from 'firebase/database';
import { 
  NCERT_SYLLABUS_DATA, 
  NCERTSubject, 
  getGradeForBatch, 
  getSubjectsForBatch, 
  findSubjectById 
} from '../data/ncertSyllabusData';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface TeacherProfile {
  name: string;
  subjects: string[];
  selectedBatch: string; // 'B1' | 'B2' | 'B3' | 'A1' | 'A2'
  selectedSubjectId: string;
}

export interface SubtopicProgress {
  completed: boolean;
  completedAt: string | null;
  teacherName: string;
  notes?: string;
}

export interface ProgressHistoryItem {
  subtopicId: string;
  subtopicCode: string;
  subtopicTitle: string;
  chapterTitle: string;
  teacher: string;
  timestamp: string;
  action: 'completed' | 'uncompleted';
}

export interface TeacherLogRecord {
  id: string; // e.g. B1_physics_12
  batch: string;
  gradeKey: 'plus_one' | 'plus_two';
  subjectId: string;
  subjectName: string;
  subtopics: Record<string, SubtopicProgress>;
  completedCount: number;
  totalCount: number;
  percentage: number;
  lastUpdated: string;
  lastTeacher: string;
  history?: ProgressHistoryItem[];
}

const LOCAL_KEY_PROFILE = 'aims_teacher_profile';
const LOCAL_KEY_SAVED_PROFILES = 'aims_saved_teacher_profiles';
const LOCAL_KEY_LOGS_CACHE = 'aims_teacher_logs_cache';

export function getLocalTeacherProfile(): TeacherProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY_PROFILE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveLocalTeacherProfile(profile: TeacherProfile): void {
  try {
    const sanitized: TeacherProfile = {
      name: profile.name.trim(),
      subjects: profile.subjects || [],
      selectedBatch: profile.selectedBatch || 'B1',
      selectedSubjectId: profile.selectedSubjectId || 'physics_12'
    };
    localStorage.setItem(LOCAL_KEY_PROFILE, JSON.stringify(sanitized));

    // Also update saved profiles list
    const savedRaw = localStorage.getItem(LOCAL_KEY_SAVED_PROFILES);
    let savedList: TeacherProfile[] = savedRaw ? JSON.parse(savedRaw) : [];
    const idx = savedList.findIndex(p => p.name.toLowerCase() === sanitized.name.toLowerCase());
    if (idx >= 0) {
      savedList[idx] = sanitized;
    } else {
      savedList.push(sanitized);
    }
    localStorage.setItem(LOCAL_KEY_SAVED_PROFILES, JSON.stringify(savedList));
  } catch (e) {
    console.warn('Failed to save teacher profile locally:', e);
  }
}

export function getAllSavedTeacherProfiles(): TeacherProfile[] {
  try {
    const savedRaw = localStorage.getItem(LOCAL_KEY_SAVED_PROFILES);
    return savedRaw ? JSON.parse(savedRaw) : [];
  } catch (e) {
    return [];
  }
}

export function calculateLogStats(
  batch: string,
  subjectId: string,
  subtopics: Record<string, SubtopicProgress>
): { completedCount: number; totalCount: number; percentage: number } {
  const subject = findSubjectById(subjectId);
  if (!subject) {
    const completedCount = Object.values(subtopics).filter(s => s.completed).length;
    return {
      completedCount,
      totalCount: completedCount,
      percentage: completedCount > 0 ? 100 : 0
    };
  }

  let totalCount = 0;
  let completedCount = 0;

  subject.chapters.forEach(ch => {
    ch.subtopics.forEach(sub => {
      totalCount++;
      if (subtopics[sub.id]?.completed) {
        completedCount++;
      }
    });
  });

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return { completedCount, totalCount, percentage };
}

export function getCachedTeacherLogs(): Record<string, TeacherLogRecord> {
  try {
    const raw = localStorage.getItem(LOCAL_KEY_LOGS_CACHE);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function setCachedTeacherLog(record: TeacherLogRecord): void {
  try {
    const cache = getCachedTeacherLogs();
    cache[record.id] = record;
    localStorage.setItem(LOCAL_KEY_LOGS_CACHE, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to write to local logs cache:', e);
  }
}

export async function fetchTeacherLog(batch: string, subjectId: string): Promise<TeacherLogRecord | null> {
  const docId = `${batch}_${subjectId}`;
  
  // 1. Check local cache first
  const cache = getCachedTeacherLogs();
  const cached = cache[docId] || null;

  // 2. Fetch from RTDB
  if (rtdb) {
    try {
      const dbRef = ref(rtdb);
      const snap = await get(child(dbRef, `teacher_logs/${docId}`));
      if (snap.exists()) {
        const val = snap.val() as TeacherLogRecord;
        setCachedTeacherLog(val);
        return val;
      }
    } catch (e) {
      console.warn(`RTDB fetch failed for ${docId}:`, e);
    }
  }

  // 3. Fetch from Firestore fallback
  if (db) {
    try {
      const docRef = doc(db, 'teacher_logs', docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const val = docSnap.data() as TeacherLogRecord;
        setCachedTeacherLog(val);
        return val;
      }
    } catch (e) {
      console.warn(`Firestore fetch failed for ${docId}:`, e);
    }
  }

  return cached;
}

export async function fetchAllTeacherLogs(): Promise<TeacherLogRecord[]> {
  const recordsMap: Record<string, TeacherLogRecord> = { ...getCachedTeacherLogs() };

  // 1. Try RTDB
  if (rtdb) {
    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, 'teacher_logs'));
      if (snapshot.exists()) {
        const val = snapshot.val();
        Object.entries(val).forEach(([key, rec]: [string, any]) => {
          recordsMap[key] = rec;
        });
        localStorage.setItem(LOCAL_KEY_LOGS_CACHE, JSON.stringify(recordsMap));
        return Object.values(recordsMap);
      }
    } catch (e) {
      console.warn('RTDB fetch all teacher logs failed:', e);
    }
  }

  // 2. Try Firestore fallback
  if (db) {
    try {
      const colRef = collection(db, 'teacher_logs');
      const snap = await getDocs(colRef);
      snap.forEach(d => {
        recordsMap[d.id] = d.data() as TeacherLogRecord;
      });
      localStorage.setItem(LOCAL_KEY_LOGS_CACHE, JSON.stringify(recordsMap));
    } catch (e) {
      console.warn('Firestore fetch all teacher logs failed:', e);
    }
  }

  return Object.values(recordsMap);
}

export async function toggleSubtopicStatus(params: {
  batch: string;
  subjectId: string;
  subtopicId: string;
  completed: boolean;
  teacherName: string;
  notes?: string;
}): Promise<TeacherLogRecord> {
  const { batch, subjectId, subtopicId, completed, teacherName, notes } = params;
  const docId = `${batch}_${subjectId}`;
  const gradeKey = getGradeForBatch(batch);
  const subject = findSubjectById(subjectId);
  const subjectName = subject ? subject.name : subjectId;

  // Retrieve current state
  const existing = await fetchTeacherLog(batch, subjectId);
  const currentSubtopics = existing ? { ...existing.subtopics } : {};
  const currentHistory = existing?.history ? [...existing.history] : [];

  const nowIso = new Date().toISOString();

  // Update target subtopic
  currentSubtopics[subtopicId] = {
    completed,
    completedAt: completed ? nowIso : null,
    teacherName: teacherName || 'Teacher',
    notes: notes !== undefined ? notes : (currentSubtopics[subtopicId]?.notes || '')
  };

  // Find subtopic details for history log
  let subtopicCode = '';
  let subtopicTitle = '';
  let chapterTitle = '';
  if (subject) {
    for (const ch of subject.chapters) {
      const found = ch.subtopics.find(s => s.id === subtopicId);
      if (found) {
        subtopicCode = found.code;
        subtopicTitle = found.title;
        chapterTitle = ch.title;
        break;
      }
    }
  }

  const historyEntry: ProgressHistoryItem = {
    subtopicId,
    subtopicCode,
    subtopicTitle,
    chapterTitle,
    teacher: teacherName || 'Teacher',
    timestamp: nowIso,
    action: completed ? 'completed' : 'uncompleted'
  };

  // Keep last 50 history entries
  const updatedHistory = [historyEntry, ...currentHistory.filter(h => h.subtopicId !== subtopicId)].slice(0, 50);

  const stats = calculateLogStats(batch, subjectId, currentSubtopics);

  const record: TeacherLogRecord = {
    id: docId,
    batch,
    gradeKey,
    subjectId,
    subjectName,
    subtopics: currentSubtopics,
    completedCount: stats.completedCount,
    totalCount: stats.totalCount,
    percentage: stats.percentage,
    lastUpdated: nowIso,
    lastTeacher: teacherName || 'Teacher',
    history: updatedHistory
  };

  // 1. Update Local Storage Cache immediately
  setCachedTeacherLog(record);

  // 2. Save to RTDB (Realtime DB)
  if (rtdb) {
    try {
      const nodeRef = ref(rtdb, `teacher_logs/${docId}`);
      await set(nodeRef, JSON.parse(JSON.stringify(record)));
    } catch (e) {
      console.error('Failed to save teacher log to RTDB:', e);
    }
  }

  // 3. Mirror sync to Firestore
  if (db) {
    try {
      const docRef = doc(db, 'teacher_logs', docId);
      await setDoc(docRef, {
        ...JSON.parse(JSON.stringify(record)),
        updatedAtServer: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error('Failed to sync teacher log to Firestore:', e);
    }
  }

  return record;
}

export async function bulkUpdateChapterSubtopics(params: {
  batch: string;
  subjectId: string;
  subtopicIds: string[];
  completed: boolean;
  teacherName: string;
}): Promise<TeacherLogRecord> {
  const { batch, subjectId, subtopicIds, completed, teacherName } = params;
  const docId = `${batch}_${subjectId}`;
  const gradeKey = getGradeForBatch(batch);
  const subject = findSubjectById(subjectId);
  const subjectName = subject ? subject.name : subjectId;

  const existing = await fetchTeacherLog(batch, subjectId);
  const currentSubtopics = existing ? { ...existing.subtopics } : {};
  let currentHistory = existing?.history ? [...existing.history] : [];

  const nowIso = new Date().toISOString();

  subtopicIds.forEach(id => {
    currentSubtopics[id] = {
      completed,
      completedAt: completed ? nowIso : null,
      teacherName: teacherName || 'Teacher',
      notes: currentSubtopics[id]?.notes || ''
    };
  });

  const stats = calculateLogStats(batch, subjectId, currentSubtopics);

  const record: TeacherLogRecord = {
    id: docId,
    batch,
    gradeKey,
    subjectId,
    subjectName,
    subtopics: currentSubtopics,
    completedCount: stats.completedCount,
    totalCount: stats.totalCount,
    percentage: stats.percentage,
    lastUpdated: nowIso,
    lastTeacher: teacherName || 'Teacher',
    history: currentHistory
  };

  setCachedTeacherLog(record);

  if (rtdb) {
    try {
      const nodeRef = ref(rtdb, `teacher_logs/${docId}`);
      await set(nodeRef, JSON.parse(JSON.stringify(record)));
    } catch (e) {
      console.error('RTDB bulk update failed:', e);
    }
  }

  if (db) {
    try {
      const docRef = doc(db, 'teacher_logs', docId);
      await setDoc(docRef, {
        ...JSON.parse(JSON.stringify(record)),
        updatedAtServer: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error('Firestore bulk update failed:', e);
    }
  }

  return record;
}

export function subscribeTeacherLog(
  batch: string,
  subjectId: string,
  callback: (data: TeacherLogRecord | null) => void
): () => void {
  const docId = `${batch}_${subjectId}`;

  if (rtdb) {
    const nodeRef = ref(rtdb, `teacher_logs/${docId}`);
    const listener = (snapshot: any) => {
      if (snapshot.exists()) {
        const val = snapshot.val() as TeacherLogRecord;
        setCachedTeacherLog(val);
        callback(val);
      } else {
        callback(null);
      }
    };
    onValue(nodeRef, listener);
    return () => off(nodeRef, 'value', listener);
  }

  // Fallback: poll or local cache
  fetchTeacherLog(batch, subjectId).then(callback);
  return () => {};
}

export function subscribeAllTeacherLogs(
  callback: (records: TeacherLogRecord[]) => void
): () => void {
  if (rtdb) {
    const nodeRef = ref(rtdb, 'teacher_logs');
    const listener = (snapshot: any) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list: TeacherLogRecord[] = Object.values(val);
        callback(list);
      } else {
        callback([]);
      }
    };
    onValue(nodeRef, listener);
    return () => off(nodeRef, 'value', listener);
  }

  fetchAllTeacherLogs().then(callback);
  return () => {};
}

export async function exportTeacherLogsToExcel(logs: TeacherLogRecord[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AIMS Education System';
  workbook.created = new Date();

  // Sheet 1: Summary Matrix
  const summarySheet = workbook.addWorksheet('Overall Progress Matrix');
  summarySheet.columns = [
    { header: 'Batch', key: 'batch', width: 12 },
    { header: 'Class / Level', key: 'level', width: 22 },
    { header: 'Subject', key: 'subject', width: 20 },
    { header: 'Completion %', key: 'percentage', width: 15 },
    { header: 'Completed Subtopics', key: 'completed', width: 20 },
    { header: 'Total Subtopics', key: 'total', width: 16 },
    { header: 'Last Teacher Logged', key: 'teacher', width: 20 },
    { header: 'Last Updated', key: 'updated', width: 22 }
  ];

  // Format header row
  const headerRow = summarySheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' } // Dark blue
  };

  const batches = ['B1', 'B2', 'B3', 'A1', 'A2'];
  batches.forEach(b => {
    const grade = getGradeForBatch(b);
    const gradeTitle = grade === 'plus_two' ? 'Plus Two (Class 12)' : 'Plus One (Class 11)';
    const subjects = getSubjectsForBatch(b);

    subjects.forEach(sub => {
      const rec = logs.find(l => l.batch === b && l.subjectId === sub.id);
      const total = sub.chapters.reduce((acc, ch) => acc + ch.subtopics.length, 0);
      const completed = rec?.completedCount || 0;
      const pct = rec?.percentage || 0;

      const row = summarySheet.addRow({
        batch: b,
        level: gradeTitle,
        subject: sub.name,
        percentage: `${pct}%`,
        completed: completed,
        total: total,
        teacher: rec?.lastTeacher || '—',
        updated: rec?.lastUpdated ? new Date(rec.lastUpdated).toLocaleString() : '—'
      });

      if (pct >= 80) {
        row.getCell('percentage').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
      } else if (pct >= 40) {
        row.getCell('percentage').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
      }
    });
  });

  // Sheet 2: Detailed Subtopic Checklist per Batch & Subject
  const detailSheet = workbook.addWorksheet('Subtopics Detail Register');
  detailSheet.columns = [
    { header: 'Batch', key: 'batch', width: 10 },
    { header: 'Subject', key: 'subject', width: 18 },
    { header: 'Chapter No', key: 'chNo', width: 12 },
    { header: 'Chapter Name', key: 'chName', width: 35 },
    { header: 'Subtopic Code', key: 'code', width: 15 },
    { header: 'Subtopic Title', key: 'title', width: 45 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Teacher Name', key: 'teacher', width: 18 },
    { header: 'Completed Date & Time', key: 'timestamp', width: 24 },
    { header: 'Notes / Remarks', key: 'notes', width: 30 }
  ];

  const detailHeader = detailSheet.getRow(1);
  detailHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  detailHeader.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0F766E' } // Teal dark
  };

  batches.forEach(b => {
    const subjects = getSubjectsForBatch(b);
    subjects.forEach(sub => {
      const rec = logs.find(l => l.batch === b && l.subjectId === sub.id);
      sub.chapters.forEach(ch => {
        ch.subtopics.forEach(st => {
          const prog = rec?.subtopics?.[st.id];
          const isDone = !!prog?.completed;

          const row = detailSheet.addRow({
            batch: b,
            subject: sub.name,
            chNo: ch.number,
            chName: ch.title,
            code: st.code,
            title: st.title,
            status: isDone ? 'COMPLETED' : 'PENDING',
            teacher: prog?.teacherName || (isDone ? (rec?.lastTeacher || 'Teacher') : '—'),
            timestamp: prog?.completedAt ? new Date(prog.completedAt).toLocaleString() : '—',
            notes: prog?.notes || ''
          });

          if (isDone) {
            row.getCell('status').font = { bold: true, color: { argb: 'FF065F46' } };
            row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
          }
        });
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const filename = `AIMS_Teacher_Progress_Log_${new Date().toISOString().split('T')[0]}.xlsx`;
  saveAs(blob, filename);
}
