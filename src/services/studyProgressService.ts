import { db, rtdb } from './firebaseService';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, set, get, child, remove } from 'firebase/database';
import { STUDY_SUBJECTS } from '../data/studyProgressData';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export type StudentMedium = 'English' | 'Malayalam';

export interface StudentProfile {
  name: string;
  studentClass: string;
  admissionNo: string;
  medium: StudentMedium;
}

export interface ChapterProgressEntry {
  boxes: [boolean, boolean, boolean];
  timestamps: [string | null, string | null, string | null];
}

export type ChapterBoxesMap = Record<string, ChapterProgressEntry>;

export interface StudentProgressRecord {
  id: string;
  admissionNo: string;
  studentName: string;
  studentClass: string;
  medium: StudentMedium;
  progress: ChapterBoxesMap;
  overallPercentage: number;
  subjectPercentages: Record<string, number>;
  updatedAt: string;
}

// Normalize raw data from storage/firestore to handle backward compatibility
export function normalizeChapterBoxesMap(raw: any): ChapterBoxesMap {
  if (!raw || typeof raw !== 'object') return {};
  const normalized: ChapterBoxesMap = {};

  Object.entries(raw).forEach(([chapterId, value]: [string, any]) => {
    if (Array.isArray(value)) {
      // Legacy boolean array format
      normalized[chapterId] = {
        boxes: [!!value[0], !!value[1], !!value[2]],
        timestamps: [null, null, null]
      };
    } else if (value && typeof value === 'object' && Array.isArray(value.boxes)) {
      // New format with timestamps
      const ts = Array.isArray(value.timestamps) ? value.timestamps : [null, null, null];
      normalized[chapterId] = {
        boxes: [!!value.boxes[0], !!value.boxes[1], !!value.boxes[2]],
        timestamps: [ts[0] || null, ts[1] || null, ts[2] || null]
      };
    } else {
      normalized[chapterId] = {
        boxes: [false, false, false],
        timestamps: [null, null, null]
      };
    }
  });

  return normalized;
}

// Calculate percentages helper
export function calculateProgressStats(progress: ChapterBoxesMap) {
  const subjectPercentages: Record<string, number> = {};
  let totalCheckedBoxes = 0;
  let totalPossibleBoxes = 0;

  STUDY_SUBJECTS.forEach(subject => {
    let subChecked = 0;
    let subPossible = subject.chapters.length * 3;

    subject.chapters.forEach(ch => {
      const entry = progress[ch.id] || { boxes: [false, false, false], timestamps: [null, null, null] };
      const boxes = entry.boxes;
      const count = (boxes[0] ? 1 : 0) + (boxes[1] ? 1 : 0) + (boxes[2] ? 1 : 0);
      subChecked += count;
    });

    subjectPercentages[subject.id] = subPossible > 0 ? Math.round((subChecked / subPossible) * 100) : 0;
    totalCheckedBoxes += subChecked;
    totalPossibleBoxes += subPossible;
  });

  const overallPercentage = totalPossibleBoxes > 0 ? Math.round((totalCheckedBoxes / totalPossibleBoxes) * 100) : 0;

  return {
    subjectPercentages,
    overallPercentage,
    totalCheckedBoxes,
    totalPossibleBoxes
  };
}

const LOCAL_STORAGE_KEY_PROFILE = 'study_progress_student_profile';
const LOCAL_STORAGE_KEY_PROGRESS = 'study_progress_chapter_boxes';
const LOCAL_STORAGE_KEY_ALL_RECORDS = 'study_progress_all_records_cache';

export function getLocalStudentProfile(): StudentProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      medium: parsed.medium === 'Malayalam' ? 'Malayalam' : 'English'
    };
  } catch (e) {
    return null;
  }
}

export function saveLocalStudentProfile(profile: StudentProfile): void {
  localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(profile));
}

export function getLocalChapterProgress(): ChapterBoxesMap {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PROGRESS);
    if (!raw) return {};
    return normalizeChapterBoxesMap(JSON.parse(raw));
  } catch (e) {
    return {};
  }
}

export function saveLocalChapterProgress(progress: ChapterBoxesMap): void {
  localStorage.setItem(LOCAL_STORAGE_KEY_PROGRESS, JSON.stringify(progress));
}

export async function saveStudentProgress(
  profile: StudentProfile,
  progress: ChapterBoxesMap
): Promise<void> {
  saveLocalStudentProfile(profile);
  saveLocalChapterProgress(progress);

  const stats = calculateProgressStats(progress);
  const docId = profile.admissionNo.trim().replace(/[\/\\#\?\.\$\[\]]/g, '_') || `student_${Date.now()}`;
  const nowIso = new Date().toISOString();

  const recordData: StudentProgressRecord = {
    id: docId,
    admissionNo: profile.admissionNo.trim(),
    studentName: profile.name.trim(),
    studentClass: profile.studentClass.trim(),
    medium: profile.medium,
    progress,
    overallPercentage: stats.overallPercentage,
    subjectPercentages: stats.subjectPercentages,
    updatedAt: nowIso
  };

  // Local Storage Cache
  try {
    const localAllRaw = localStorage.getItem(LOCAL_STORAGE_KEY_ALL_RECORDS) || '[]';
    const localAll: StudentProgressRecord[] = JSON.parse(localAllRaw);
    const existingIdx = localAll.findIndex(r => r.admissionNo === profile.admissionNo.trim() || r.id === docId);
    if (existingIdx >= 0) {
      localAll[existingIdx] = recordData;
    } else {
      localAll.push(recordData);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_ALL_RECORDS, JSON.stringify(localAll));
  } catch (e) {
    console.error('Error saving to local records cache', e);
  }

  const sanitizedRecord = JSON.parse(JSON.stringify(recordData));

  // 1. Primary Save to Firebase Realtime Database (RTDB)
  if (rtdb) {
    try {
      const studentRef = ref(rtdb, `study_progress/${docId}`);
      await set(studentRef, sanitizedRecord);
    } catch (e) {
      console.error('RTDB write failed:', e);
    }
  }

  // 2. Secondary Sync to Firestore (db)
  if (db) {
    try {
      const docRef = doc(db, 'study_progress', docId);
      await setDoc(docRef, {
        ...sanitizedRecord,
        updatedAtServer: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error('Firestore write failed:', e);
    }
  }
}

export async function fetchAllStudentProgress(): Promise<StudentProgressRecord[]> {
  // 1. Try Firebase Realtime Database (RTDB) First
  if (rtdb) {
    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, 'study_progress'));
      if (snapshot.exists()) {
        const val = snapshot.val();
        const records: StudentProgressRecord[] = Object.values(val).map((data: any) => ({
          id: data.id || data.admissionNo,
          admissionNo: data.admissionNo || '',
          studentName: data.studentName || 'Unknown',
          studentClass: data.studentClass || 'N/A',
          medium: data.medium === 'Malayalam' ? 'Malayalam' : 'English',
          progress: normalizeChapterBoxesMap(data.progress),
          overallPercentage: data.overallPercentage ?? 0,
          subjectPercentages: data.subjectPercentages || {},
          updatedAt: data.updatedAt || new Date().toISOString()
        }));

        records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        localStorage.setItem(LOCAL_STORAGE_KEY_ALL_RECORDS, JSON.stringify(records));
        return records;
      }
    } catch (e) {
      console.warn('RTDB fetch all failed, trying Firestore:', e);
    }
  }

  // 2. Try Firestore (db) Fallback
  if (db) {
    try {
      let querySnapshot;
      try {
        const q = query(collection(db, 'study_progress'), orderBy('updatedAt', 'desc'));
        querySnapshot = await getDocs(q);
      } catch (err) {
        querySnapshot = await getDocs(collection(db, 'study_progress'));
      }

      const records: StudentProgressRecord[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        records.push({
          id: docSnap.id,
          admissionNo: data.admissionNo || docSnap.id,
          studentName: data.studentName || 'Unknown',
          studentClass: data.studentClass || 'N/A',
          medium: data.medium === 'Malayalam' ? 'Malayalam' : 'English',
          progress: normalizeChapterBoxesMap(data.progress),
          overallPercentage: data.overallPercentage ?? 0,
          subjectPercentages: data.subjectPercentages || {},
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      });

      records.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      localStorage.setItem(LOCAL_STORAGE_KEY_ALL_RECORDS, JSON.stringify(records));
      return records;
    } catch (e) {
      console.warn('Firestore fetch all failed, using local fallback:', e);
    }
  }

  try {
    const localAllRaw = localStorage.getItem(LOCAL_STORAGE_KEY_ALL_RECORDS) || '[]';
    const parsed = JSON.parse(localAllRaw);
    return parsed.map((r: any) => ({
      ...r,
      medium: r.medium === 'Malayalam' ? 'Malayalam' : 'English',
      progress: normalizeChapterBoxesMap(r.progress)
    }));
  } catch (e) {
    return [];
  }
}

export async function deleteStudentProgressRecord(id: string): Promise<void> {
  // 1. Archive to Local Storage Trash Cache
  try {
    const localAllRaw = localStorage.getItem(LOCAL_STORAGE_KEY_ALL_RECORDS) || '[]';
    const localAll: StudentProgressRecord[] = JSON.parse(localAllRaw);
    const targetRecord = localAll.find(r => r.id === id || r.admissionNo === id);
    
    if (targetRecord) {
      const deletedArchiveRaw = localStorage.getItem('study_progress_deleted_archive_cache') || '[]';
      const deletedArchive: any[] = JSON.parse(deletedArchiveRaw);
      deletedArchive.push({
        ...targetRecord,
        deletedAt: new Date().toISOString()
      });
      localStorage.setItem('study_progress_deleted_archive_cache', JSON.stringify(deletedArchive));
    }

    const filtered = localAll.filter(r => r.id !== id && r.admissionNo !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY_ALL_RECORDS, JSON.stringify(filtered));
  } catch (e) {}

  // 2. Archive & Delete in RTDB
  if (rtdb) {
    try {
      const activeRef = ref(rtdb, `study_progress/${id}`);
      const snap = await get(activeRef);
      if (snap.exists()) {
        const deletedRef = ref(rtdb, `deleted_study_progress/${id}`);
        await set(deletedRef, {
          ...snap.val(),
          deletedAt: new Date().toISOString()
        });
      }
      await remove(activeRef);
    } catch (e) {
      console.error('RTDB archive/delete failed:', e);
    }
  }

  // 3. Archive & Delete in Firestore
  if (db) {
    try {
      const docRef = doc(db, 'study_progress', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const deletedRef = doc(db, 'deleted_study_progress', id);
        await setDoc(deletedRef, {
          ...data,
          deletedAt: new Date().toISOString(),
          deletedAtServer: serverTimestamp()
        });
      }

      await deleteDoc(docRef);
    } catch (e) {
      console.error('Firestore archive & delete failed:', e);
    }
  }
}

// Function to fetch archived/deleted student records for admin restore
export async function fetchDeletedStudentProgress(): Promise<StudentProgressRecord[]> {
  if (rtdb) {
    try {
      const dbRef = ref(rtdb);
      const snapshot = await get(child(dbRef, 'deleted_study_progress'));
      if (snapshot.exists()) {
        const val = snapshot.val();
        return Object.values(val).map((data: any) => ({
          id: data.id || data.admissionNo,
          admissionNo: data.admissionNo || '',
          studentName: data.studentName || 'Unknown',
          studentClass: data.studentClass || 'N/A',
          medium: data.medium === 'Malayalam' ? 'Malayalam' : 'English',
          progress: normalizeChapterBoxesMap(data.progress),
          overallPercentage: data.overallPercentage ?? 0,
          subjectPercentages: data.subjectPercentages || {},
          updatedAt: data.updatedAt || new Date().toISOString()
        }));
      }
    } catch (e) {}
  }

  if (db) {
    try {
      const q = query(collection(db, 'deleted_study_progress'), orderBy('deletedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const records: StudentProgressRecord[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        records.push({
          id: docSnap.id,
          admissionNo: data.admissionNo || docSnap.id,
          studentName: data.studentName || 'Unknown',
          studentClass: data.studentClass || 'N/A',
          medium: data.medium === 'Malayalam' ? 'Malayalam' : 'English',
          progress: normalizeChapterBoxesMap(data.progress),
          overallPercentage: data.overallPercentage ?? 0,
          subjectPercentages: data.subjectPercentages || {},
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      });
      return records;
    } catch (e) {
      console.warn('Firestore fetch deleted records failed:', e);
    }
  }

  try {
    const deletedArchiveRaw = localStorage.getItem('study_progress_deleted_archive_cache') || '[]';
    return JSON.parse(deletedArchiveRaw);
  } catch (e) {
    return [];
  }
}

// Function to restore a deleted student record back to active study_progress
export async function restoreStudentProgressRecord(record: StudentProgressRecord): Promise<void> {
  await saveStudentProgress(
    {
      name: record.studentName,
      studentClass: record.studentClass,
      admissionNo: record.admissionNo,
      medium: record.medium
    },
    record.progress
  );

  if (rtdb) {
    try {
      await remove(ref(rtdb, `deleted_study_progress/${record.id}`));
    } catch (e) {}
  }

  if (db) {
    try {
      await deleteDoc(doc(db, 'deleted_study_progress', record.id));
    } catch (e) {}
  }

  try {
    const deletedArchiveRaw = localStorage.getItem('study_progress_deleted_archive_cache') || '[]';
    const deletedArchive: any[] = JSON.parse(deletedArchiveRaw);
    const filtered = deletedArchive.filter(r => r.id !== record.id && r.admissionNo !== record.admissionNo);
    localStorage.setItem('study_progress_deleted_archive_cache', JSON.stringify(filtered));
  } catch (e) {}
}

// Helper: Format date string nicely for Excel
function formatDateForExcel(isoStr: string | null | undefined): string {
  if (!isoStr) return 'Pending';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return 'Pending';
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return 'Pending';
  }
}

// Export student study progress to Excel workbook (FOCUSED ON TICK TIMESTAMPS)
export async function exportStudyProgressToExcel(records: StudentProgressRecord[]) {
  const workbook = new ExcelJS.Workbook();

  // ==========================================
  // SHEET 1: Chapter Tick Timestamps Log (PRIMARY FOCUS SHEET)
  // ==========================================
  const chapterLogSheet = workbook.addWorksheet('Chapter Tick Timestamps');

  // Title Banner
  chapterLogSheet.addRow(['STUDENT CHAPTER CHECKPOINT TICK TIMESTAMPS REPORT']);
  chapterLogSheet.mergeCells('A1:L1');
  const titleCell1 = chapterLogSheet.getCell('A1');
  titleCell1.font = { name: 'Arial', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF065F46' } };
  titleCell1.alignment = { vertical: 'middle', horizontal: 'center' };
  chapterLogSheet.getRow(1).height = 40;

  chapterLogSheet.addRow([
    `Report Generated: ${new Date().toLocaleString('en-GB')}  |  Total Students: ${records.length}`,
    '', '', '', '', '', '', '', '', '', '', ''
  ]);
  chapterLogSheet.mergeCells('A2:L2');
  const subCell1 = chapterLogSheet.getCell('A2');
  subCell1.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } };
  chapterLogSheet.getRow(2).height = 24;

  chapterLogSheet.addRow([]);

  const chapterLogHeaders = [
    'Admission No',
    'Student Name',
    'Class',
    'Medium',
    'Subject',
    'Ch #',
    'Chapter Name',
    'Checkpoint 1 Tick Time',
    'Checkpoint 2 Tick Time',
    'Checkpoint 3 Tick Time',
    'Chapter Status',
    'Completion Time'
  ];

  const headerRow1 = chapterLogSheet.addRow(chapterLogHeaders);
  headerRow1.height = 28;
  headerRow1.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  records.forEach((rec, rIdx) => {
    const isMalayalam = rec.medium === 'Malayalam';

    STUDY_SUBJECTS.forEach((subject) => {
      const subName = isMalayalam ? subject.nameMl : subject.nameEn;

      subject.chapters.forEach((ch) => {
        const entry = rec.progress?.[ch.id] || { boxes: [false, false, false], timestamps: [null, null, null] };
        const boxes = entry.boxes;
        const ts = entry.timestamps;
        const chTitle = isMalayalam ? ch.titleMl : ch.titleEn;

        const ts1Formatted = boxes[0] ? formatDateForExcel(ts[0]) : 'Pending';
        const ts2Formatted = boxes[1] ? formatDateForExcel(ts[1]) : 'Pending';
        const ts3Formatted = boxes[2] ? formatDateForExcel(ts[2]) : 'Pending';

        const checkedCount = (boxes[0] ? 1 : 0) + (boxes[1] ? 1 : 0) + (boxes[2] ? 1 : 0);
        let statusText = 'Not Started';
        if (checkedCount === 3) statusText = 'Fully Ticked';
        else if (checkedCount > 0) statusText = `In Progress (${checkedCount}/3)`;

        const completionTime = (checkedCount === 3 && ts[2]) ? formatDateForExcel(ts[2]) : 'Incomplete';

        const row = chapterLogSheet.addRow([
          rec.admissionNo,
          rec.studentName,
          rec.studentClass,
          rec.medium || 'English',
          subName,
          ch.chapterNumber,
          chTitle,
          ts1Formatted,
          ts2Formatted,
          ts3Formatted,
          statusText,
          completionTime
        ]);

        row.height = 22;
        const isEven = rIdx % 2 === 0;

        row.eachCell((cell, colNumber) => {
          cell.font = { name: 'Arial', size: 10 };
          // Center align columns: Adm No, Class, Medium, Ch #, Timestamps & Status
          const isCenter = [1, 3, 4, 6, 8, 9, 10, 11, 12].includes(colNumber);
          cell.alignment = { vertical: 'middle', horizontal: isCenter ? 'center' : 'left' };

          if (isEven) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          }

          // Highlight completed timestamps vs pending
          if (colNumber >= 8 && colNumber <= 10) {
            if (cell.value !== 'Pending') {
              cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF047857' } };
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
            } else {
              cell.font = { name: 'Arial', size: 10, color: { argb: 'FF94A3B8' } };
            }
          }

          // Highlight status
          if (colNumber === 11) {
            if (cell.value === 'Fully Ticked') {
              cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF065F46' } };
            } else if (cell.value.toString().startsWith('In Progress')) {
              cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFB45309' } };
            }
          }
        });
      });
    });
  });

  chapterLogSheet.columns.forEach((col, idx) => {
    if (idx === 0) col.width = 16;       // Adm No
    else if (idx === 1) col.width = 24;  // Name
    else if (idx === 2) col.width = 14;  // Class
    else if (idx === 3) col.width = 14;  // Medium
    else if (idx === 4) col.width = 18;  // Subject
    else if (idx === 5) col.width = 8;   // Ch #
    else if (idx === 6) col.width = 38;  // Chapter Name
    else if (idx >= 7 && idx <= 9) col.width = 24; // Checkpoint Timestamps
    else if (idx === 10) col.width = 18; // Status
    else col.width = 24;                 // Completion Time
  });

  // ==========================================
  // SHEET 2: Student Activity Timeline & Last Active
  // ==========================================
  const studentSummarySheet = workbook.addWorksheet('Student Activity Summary');

  studentSummarySheet.addRow(['STUDENT ENGAGEMENT & ACTIVITY TIMELINE']);
  studentSummarySheet.mergeCells('A1:I1');
  const titleCell2 = studentSummarySheet.getCell('A1');
  titleCell2.font = { name: 'Arial', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E1B4B' } };
  titleCell2.alignment = { vertical: 'middle', horizontal: 'center' };
  studentSummarySheet.getRow(1).height = 40;

  studentSummarySheet.addRow([`Generated: ${new Date().toLocaleString('en-GB')}`, '', '', '', '', '', '', '', '']);
  studentSummarySheet.mergeCells('A2:I2');
  const subCell2 = studentSummarySheet.getCell('A2');
  subCell2.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } };
  studentSummarySheet.getRow(2).height = 24;

  studentSummarySheet.addRow([]);

  const studentSummaryHeaders = [
    'Admission No',
    'Student Name',
    'Class',
    'Medium',
    'Completed Checkpoints',
    'Overall Status',
    'First Tick Time',
    'Latest Tick Time',
    'Last Profile Update'
  ];

  const headerRow2 = studentSummarySheet.addRow(studentSummaryHeaders);
  headerRow2.height = 28;
  headerRow2.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3730A3' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  records.forEach((rec, idx) => {
    let allTimestamps: number[] = [];
    let tickedCount = 0;

    Object.values(rec.progress || {}).forEach((entry) => {
      entry.boxes?.forEach((b, bIdx) => {
        if (b) {
          tickedCount++;
          if (entry.timestamps?.[bIdx]) {
            const t = new Date(entry.timestamps[bIdx]!).getTime();
            if (!isNaN(t)) allTimestamps.push(t);
          }
        }
      });
    });

    allTimestamps.sort((a, b) => a - b);

    const firstTick = allTimestamps.length > 0 ? formatDateForExcel(new Date(allTimestamps[0]).toISOString()) : 'No Ticks Yet';
    const latestTick = allTimestamps.length > 0 ? formatDateForExcel(new Date(allTimestamps[allTimestamps.length - 1]).toISOString()) : 'No Ticks Yet';
    const lastUpdate = formatDateForExcel(rec.updatedAt);

    const overallStatus = tickedCount === 72 ? 'Fully Completed' : tickedCount > 0 ? 'In Progress' : 'Not Started';

    const row = studentSummarySheet.addRow([
      rec.admissionNo,
      rec.studentName,
      rec.studentClass,
      rec.medium || 'English',
      `${tickedCount} / 72 Checkpoints (${rec.overallPercentage}%)`,
      overallStatus,
      firstTick,
      latestTick,
      lastUpdate
    ]);

    row.height = 22;
    const isEven = idx % 2 === 0;

    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 10 };
      const isCenter = [1, 3, 4, 5, 6, 7, 8, 9].includes(colNumber);
      cell.alignment = { vertical: 'middle', horizontal: isCenter ? 'center' : 'left' };

      if (isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }

      if (colNumber === 6) {
        if (cell.value === 'Fully Completed') {
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF047857' } };
        } else if (cell.value === 'In Progress') {
          cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFB45309' } };
        }
      }
    });
  });

  studentSummarySheet.columns.forEach((col, idx) => {
    if (idx === 0) col.width = 16;
    else if (idx === 1) col.width = 24;
    else if (idx === 2) col.width = 14;
    else if (idx === 3) col.width = 14;
    else if (idx === 4) col.width = 30;
    else if (idx === 5) col.width = 18;
    else if (idx >= 6 && idx <= 8) col.width = 24;
  });

  // ==========================================
  // SHEET 3: Subject-Wise Latest Activity Timestamps
  // ==========================================
  const subjectSheet = workbook.addWorksheet('Subject Activity Timestamps');

  subjectSheet.addRow(['SUBJECT-WISE LATEST STUDY ACTIVITY TIMESTAMPS']);
  subjectSheet.mergeCells('A1:L1');
  const titleCell3 = subjectSheet.getCell('A1');
  titleCell3.font = { name: 'Arial', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF831843' } };
  titleCell3.alignment = { vertical: 'middle', horizontal: 'center' };
  subjectSheet.getRow(1).height = 40;

  subjectSheet.addRow([`Report Generated: ${new Date().toLocaleString('en-GB')}`, '', '', '', '', '', '', '', '', '', '', '']);
  subjectSheet.mergeCells('A2:L2');
  const subCell3 = subjectSheet.getCell('A2');
  subCell3.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF475569' } };
  subjectSheet.getRow(2).height = 24;

  subjectSheet.addRow([]);

  const subjectHeaders = [
    'Admission No',
    'Student Name',
    'Class',
    'Medium',
    'Physics Last Active',
    'Chemistry Last Active',
    'Biology Last Active',
    'Maths Last Active',
    'English Last Active',
    'Hindi Last Active',
    'History Last Active',
    'Geography Last Active'
  ];

  const headerRow3 = subjectSheet.addRow(subjectHeaders);
  headerRow3.height = 28;
  headerRow3.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9D174D' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  records.forEach((rec, idx) => {
    const subTimestamps: Record<string, string> = {};

    STUDY_SUBJECTS.forEach((subject) => {
      let latestTime: number = 0;
      subject.chapters.forEach((ch) => {
        const entry = rec.progress?.[ch.id];
        if (entry?.timestamps) {
          entry.timestamps.forEach((ts) => {
            if (ts) {
              const t = new Date(ts).getTime();
              if (t > latestTime) latestTime = t;
            }
          });
        }
      });

      subTimestamps[subject.id] = latestTime > 0 ? formatDateForExcel(new Date(latestTime).toISOString()) : 'Not Started';
    });

    const row = subjectSheet.addRow([
      rec.admissionNo,
      rec.studentName,
      rec.studentClass,
      rec.medium || 'English',
      subTimestamps['physics'] || 'Not Started',
      subTimestamps['chemistry'] || 'Not Started',
      subTimestamps['biology'] || 'Not Started',
      subTimestamps['maths'] || 'Not Started',
      subTimestamps['english'] || 'Not Started',
      subTimestamps['hindi'] || 'Not Started',
      subTimestamps['history'] || 'Not Started',
      subTimestamps['geography'] || 'Not Started'
    ]);

    row.height = 22;
    const isEven = idx % 2 === 0;

    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Arial', size: 10 };
      const isCenter = colNumber !== 2;
      cell.alignment = { vertical: 'middle', horizontal: isCenter ? 'center' : 'left' };

      if (isEven) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }

      if (colNumber >= 5 && cell.value !== 'Not Started') {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFBE185D' } };
      }
    });
  });

  subjectSheet.columns.forEach((col, idx) => {
    if (idx === 0) col.width = 16;
    else if (idx === 1) col.width = 24;
    else if (idx === 2) col.width = 14;
    else if (idx === 3) col.width = 14;
    else col.width = 24;
  });

  // Write and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Student_Study_Progress_Timestamps_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
