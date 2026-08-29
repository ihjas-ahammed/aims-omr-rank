/**
 * Online Exam Management & Evaluation Service (Firebase Firestore Backend)
 */
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebaseService';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getB2PresignedUrl } from './b2StorageService';

export type QuestionType = 'mcq' | 'descriptive';

export interface ExamQuestion {
  id: string;
  number: number;
  type: QuestionType;
  prompt: string;
  imageUrl?: string;        // Optional question diagram or clipping
  marks: number;            // Default: 4 for MCQ, custom for descriptive
  negativeMarks?: number;   // For MCQ (default 1)
  // MCQ Options
  numOptions?: number;      // 4
  options?: string[];       // ['A', 'B', 'C', 'D'] or text
  correctOption?: string;   // 'A' | 'B' | 'C' | 'D'
  // Descriptive metadata
  maxImages?: number;       // default 5
  guidelines?: string;
}

export interface OnlineExam {
  id: string;
  title: string;
  subject?: string;
  className: string;        // Batch restriction or "All Batches"
  instructions?: string;
  durationMinutes: number;  // 0 for untimed, or e.g. 45
  totalMarks: number;
  passMarks?: number;
  questions: ExamQuestion[];
  questionPaperImages?: string[]; // Optional full QP pages
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DescriptiveAnswerImage {
  b2Key: string;
  url: string;
  fileName: string;
  fileSize?: number;
  uploadedAt: string;
}

export interface DescriptiveAnswer {
  questionNumber: number;
  images: DescriptiveAnswerImage[];
  textAnswer?: string;
  awardedMarks?: number;    // Assigned by teacher during evaluation
  feedback?: string;        // Optional teacher feedback
  isGraded?: boolean;
}

export interface ExamIncident {
  time: string;
  reason: string;
}

export interface OnlineExamSubmission {
  id: string;
  examId: string;
  studentName: string;
  studentClass: string;
  phoneNumber?: string;
  admissionNo?: string;
  mcqAnswers: Record<number, string>; // { 1: 'B', 2: 'A' }
  descriptiveAnswers: Record<number, DescriptiveAnswer>; // { 3: { ... } }
  mcqScore: number;
  descriptiveScore: number;
  totalScore: number;
  maxPossibleScore: number;
  totalRightMcq: number;
  totalWrongMcq: number;
  totalUnattemptedMcq: number;
  isFullyGraded: boolean;
  incidents: ExamIncident[];
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: string;
}

const COLLECTION_EXAMS = 'online_exams';
const SUB_COLLECTION_SUBMISSIONS = 'submissions';
const LOCAL_STORAGE_EXAMS_CACHE = 'aims_online_exams_cache';

function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// -------------------------------------------------------------
// Exam CRUD
// -------------------------------------------------------------

/**
 * Creates or updates an online exam in Firestore
 */
export async function saveOnlineExam(exam: Partial<OnlineExam>): Promise<string> {
  const examId = exam.id || `exam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Auto calculate total marks if not provided
  const totalMarks = exam.questions?.reduce((sum, q) => sum + (Number(q.marks) || 0), 0) || exam.totalMarks || 0;

  const examData: OnlineExam = {
    id: examId,
    title: exam.title?.trim() || 'Untitled Exam',
    subject: exam.subject?.trim() || 'General',
    className: exam.className?.trim() || 'All Batches',
    instructions: exam.instructions || '',
    durationMinutes: Number(exam.durationMinutes) || 0,
    totalMarks,
    passMarks: Number(exam.passMarks) || Math.round(totalMarks * 0.4),
    questions: exam.questions || [],
    questionPaperImages: exam.questionPaperImages || [],
    isPublished: exam.isPublished ?? true,
    createdAt: exam.createdAt || now,
    updatedAt: now
  };

  if (db) {
    await setDoc(doc(db, COLLECTION_EXAMS, examId), cleanForFirestore(examData), { merge: true });
  }

  // Update local cache
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EXAMS_CACHE);
    const list: OnlineExam[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(e => e.id !== examId);
    filtered.unshift(examData);
    localStorage.setItem(LOCAL_STORAGE_EXAMS_CACHE, JSON.stringify(filtered));
  } catch (e) {}

  return examId;
}

/**
 * Fetches all online exams
 */
export async function fetchAllOnlineExams(): Promise<OnlineExam[]> {
  if (!db) {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_EXAMS_CACHE);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  try {
    const q = query(collection(db, COLLECTION_EXAMS), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const exams: OnlineExam[] = [];
    snap.forEach((d) => {
      exams.push({ id: d.id, ...(d.data() as any) });
    });
    localStorage.setItem(LOCAL_STORAGE_EXAMS_CACHE, JSON.stringify(exams));
    return exams;
  } catch (e) {
    console.warn('Firestore fetch failed, using local cache:', e);
    const raw = localStorage.getItem(LOCAL_STORAGE_EXAMS_CACHE);
    return raw ? JSON.parse(raw) : [];
  }
}

/**
 * Fetches a single exam by ID
 */
export async function fetchOnlineExamById(examId: string): Promise<OnlineExam | null> {
  if (!examId) return null;

  if (db) {
    try {
      const snap = await getDoc(doc(db, COLLECTION_EXAMS, examId));
      if (snap.exists()) {
        return { id: snap.id, ...(snap.data() as any) };
      }
    } catch (e) {
      console.warn('Failed to fetch exam from Firestore:', e);
    }
  }

  // Fallback to local cache
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EXAMS_CACHE);
    if (raw) {
      const list: OnlineExam[] = JSON.parse(raw);
      const match = list.find(e => e.id === examId);
      if (match) return match;
    }
  } catch (e) {}

  return null;
}

/**
 * Deletes an exam
 */
export async function deleteOnlineExam(examId: string): Promise<void> {
  if (db) {
    try {
      await deleteDoc(doc(db, COLLECTION_EXAMS, examId));
    } catch (e) {
      console.warn('Failed to delete exam from Firestore:', e);
    }
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EXAMS_CACHE);
    if (raw) {
      const list: OnlineExam[] = JSON.parse(raw);
      const filtered = list.filter(e => e.id !== examId);
      localStorage.setItem(LOCAL_STORAGE_EXAMS_CACHE, JSON.stringify(filtered));
    }
  } catch (e) {}
}

// -------------------------------------------------------------
// Submissions & Grading
// -------------------------------------------------------------

/**
 * Submits student exam responses
 */
export async function submitOnlineExam(
  exam: OnlineExam,
  submissionData: {
    studentName: string;
    studentClass: string;
    phoneNumber?: string;
    admissionNo?: string;
    mcqAnswers: Record<number, string>;
    descriptiveAnswers: Record<number, DescriptiveAnswer>;
    incidents?: ExamIncident[];
  }
): Promise<string> {
  const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const submittedAt = new Date().toISOString();

  // Auto-grade MCQs
  let totalRightMcq = 0;
  let totalWrongMcq = 0;
  let totalUnattemptedMcq = 0;
  let mcqScore = 0;
  let descriptiveScore = 0;

  const mcqQuestions = exam.questions.filter(q => q.type === 'mcq');
  const descriptiveQuestions = exam.questions.filter(q => q.type === 'descriptive');

  for (const q of mcqQuestions) {
    const studentAns = submissionData.mcqAnswers[q.number];
    const correctAns = q.correctOption?.trim().toUpperCase();
    const markValue = Number(q.marks) || 4;
    const negValue = q.negativeMarks !== undefined ? Number(q.negativeMarks) : 1;

    if (!studentAns) {
      totalUnattemptedMcq++;
    } else if (correctAns && studentAns.trim().toUpperCase() === correctAns) {
      totalRightMcq++;
      mcqScore += markValue;
    } else {
      totalWrongMcq++;
      mcqScore -= negValue;
    }
  }

  // Check if there are any descriptive questions
  const hasDescriptive = descriptiveQuestions.length > 0;
  const isFullyGraded = !hasDescriptive; // If no descriptive questions, immediately graded

  const submission: OnlineExamSubmission = {
    id: submissionId,
    examId: exam.id,
    studentName: submissionData.studentName.trim(),
    studentClass: submissionData.studentClass.trim(),
    phoneNumber: submissionData.phoneNumber?.trim() || '',
    admissionNo: submissionData.admissionNo?.trim() || '',
    mcqAnswers: submissionData.mcqAnswers || {},
    descriptiveAnswers: submissionData.descriptiveAnswers || {},
    mcqScore,
    descriptiveScore: 0,
    totalScore: mcqScore,
    maxPossibleScore: exam.totalMarks,
    totalRightMcq,
    totalWrongMcq,
    totalUnattemptedMcq,
    isFullyGraded,
    incidents: submissionData.incidents || [],
    submittedAt
  };

  if (db) {
    // Write into subcollection online_exams/{examId}/submissions/{submissionId}
    const subDocRef = doc(db, COLLECTION_EXAMS, exam.id, SUB_COLLECTION_SUBMISSIONS, submissionId);
    await setDoc(subDocRef, cleanForFirestore(submission));
  }

  // Cache locally
  try {
    const key = `aims_exam_subs_${exam.id}`;
    const raw = localStorage.getItem(key);
    const list: OnlineExamSubmission[] = raw ? JSON.parse(raw) : [];
    list.unshift(submission);
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {}

  return submissionId;
}

/**
 * Fetches all submissions for a given exam
 */
export async function fetchExamSubmissions(examId: string): Promise<OnlineExamSubmission[]> {
  if (!examId) return [];

  if (db) {
    try {
      const q = query(
        collection(db, COLLECTION_EXAMS, examId, SUB_COLLECTION_SUBMISSIONS),
        orderBy('submittedAt', 'desc')
      );
      const snap = await getDocs(q);
      const subs: OnlineExamSubmission[] = [];
      snap.forEach((d) => {
        subs.push({ id: d.id, ...(d.data() as any) });
      });
      localStorage.setItem(`aims_exam_subs_${examId}`, JSON.stringify(subs));
      return subs;
    } catch (e) {
      console.warn('Failed to fetch submissions from Firestore:', e);
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(`aims_exam_subs_${examId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Real-time listener for exam submissions
 */
export function subscribeToExamSubmissions(
  examId: string, 
  onUpdate: (subs: OnlineExamSubmission[]) => void
): () => void {
  if (!db || !examId) return () => {};

  const q = query(
    collection(db, COLLECTION_EXAMS, examId, SUB_COLLECTION_SUBMISSIONS),
    orderBy('submittedAt', 'desc')
  );

  return onSnapshot(q, (snap) => {
    const subs: OnlineExamSubmission[] = [];
    snap.forEach((d) => {
      subs.push({ id: d.id, ...(d.data() as any) });
    });
    localStorage.setItem(`aims_exam_subs_${examId}`, JSON.stringify(subs));
    onUpdate(subs);
  }, (error) => {
    console.warn('Submission listener error:', error);
  });
}

/**
 * Grades a descriptive question for a student and updates the submission
 */
export async function gradeStudentDescriptive(
  exam: OnlineExam,
  submissionId: string,
  descriptiveGrades: Record<number, { marks: number; feedback?: string }>,
  gradedBy: string = 'Teacher'
): Promise<void> {
  const submissions = await fetchExamSubmissions(exam.id);
  const target = submissions.find(s => s.id === submissionId);
  if (!target) throw new Error('Submission not found.');

  let newDescScore = 0;
  const updatedDescAnswers = { ...target.descriptiveAnswers };

  const descQuestions = exam.questions.filter(q => q.type === 'descriptive');
  let allDescGraded = true;

  for (const q of descQuestions) {
    const current = updatedDescAnswers[q.number] || {
      questionNumber: q.number,
      images: []
    };
    const gradeInfo = descriptiveGrades[q.number];

    if (gradeInfo !== undefined) {
      current.awardedMarks = Math.min(Math.max(0, Number(gradeInfo.marks) || 0), q.marks);
      current.feedback = gradeInfo.feedback || '';
      current.isGraded = true;
    }

    if (current.awardedMarks !== undefined) {
      newDescScore += current.awardedMarks;
    } else {
      allDescGraded = false;
    }

    updatedDescAnswers[q.number] = current;
  }

  const newTotalScore = (target.mcqScore || 0) + newDescScore;
  const isFullyGraded = allDescGraded;

  const updatePayload = {
    descriptiveAnswers: updatedDescAnswers,
    descriptiveScore: newDescScore,
    totalScore: newTotalScore,
    isFullyGraded,
    gradedAt: new Date().toISOString(),
    gradedBy
  };

  if (db) {
    const subDocRef = doc(db, COLLECTION_EXAMS, exam.id, SUB_COLLECTION_SUBMISSIONS, submissionId);
    await updateDoc(subDocRef, cleanForFirestore(updatePayload));
  }

  // Update local cache
  try {
    const key = `aims_exam_subs_${exam.id}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const list: OnlineExamSubmission[] = JSON.parse(raw);
      const idx = list.findIndex(s => s.id === submissionId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updatePayload };
        localStorage.setItem(key, JSON.stringify(list));
      }
    }
  } catch (e) {}
}

// -------------------------------------------------------------
// Excel Export for Online Exams
// -------------------------------------------------------------

export async function exportExamResultsToExcel(
  exam: OnlineExam,
  submissions: OnlineExamSubmission[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AIMS Plus Academic Portal';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Exam Results', {
    properties: { defaultRowHeight: 22 }
  });

  // Header Title Row
  worksheet.mergeCells('A1:G1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `${exam.title.toUpperCase()} — RESULTS SHEET`;
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' } // Slate-800
  };

  // Sub-header Info Row
  worksheet.mergeCells('A2:G2');
  const infoCell = worksheet.getCell('A2');
  infoCell.value = `Subject: ${exam.subject || 'General'} | Class: ${exam.className} | Total Marks: ${exam.totalMarks} | Submissions: ${submissions.length}`;
  infoCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FFE2E8F0' } };
  infoCell.alignment = { horizontal: 'center', vertical: 'middle' };
  infoCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF334155' }
  };

  // Dynamic Columns
  const mcqQuestions = exam.questions.filter(q => q.type === 'mcq');
  const descQuestions = exam.questions.filter(q => q.type === 'descriptive');

  const baseColumns = [
    { header: 'Rank', key: 'rank', width: 8 },
    { header: 'Student Name', key: 'name', width: 24 },
    { header: 'Class / Batch', key: 'class', width: 16 },
    { header: 'Phone / Reg', key: 'phone', width: 16 },
    { header: 'Total Score', key: 'totalScore', width: 14 },
    { header: 'MCQ Score', key: 'mcqScore', width: 12 },
    { header: 'Desc Score', key: 'descScore', width: 12 },
    { header: 'Grading Status', key: 'status', width: 16 }
  ];

  // Add columns for each question
  const qColumns = exam.questions.map(q => ({
    header: `Q${q.number} (${q.type === 'mcq' ? 'MCQ' : 'Desc'}) [${q.marks}M]`,
    key: `q_${q.number}`,
    width: q.type === 'mcq' ? 14 : 28
  }));

  const extraColumns = [
    { header: 'Tab Switches / Incidents', key: 'incidents', width: 22 },
    { header: 'Submitted At', key: 'submittedAt', width: 20 },
    { header: 'Answer Sheet Image Links', key: 'imageLinks', width: 45 }
  ];

  const allColumns = [...baseColumns, ...qColumns, ...extraColumns];
  worksheet.getRow(4).values = allColumns.map(c => c.header);
  worksheet.columns = allColumns;

  // Style Header Row 4
  const headerRow = worksheet.getRow(4);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4338CA' } // Indigo 700
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF1E1B4B' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
    };
  });

  // Sort submissions by total score descending
  const sortedSubs = [...submissions].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));

  let rank = 1;
  for (const sub of sortedSubs) {
    const rowValues: Record<string, any> = {
      rank: rank++,
      name: sub.studentName,
      class: sub.studentClass,
      phone: sub.phoneNumber || sub.admissionNo || '—',
      totalScore: sub.totalScore || 0,
      mcqScore: sub.mcqScore || 0,
      descScore: sub.descriptiveScore || 0,
      status: sub.isFullyGraded ? '✓ Evaluated' : '⏳ Pending Review'
    };

    // Fill Question columns
    for (const q of exam.questions) {
      if (q.type === 'mcq') {
        const studentAns = sub.mcqAnswers?.[q.number] || '—';
        const isCorrect = q.correctOption && studentAns.toUpperCase() === q.correctOption.toUpperCase();
        rowValues[`q_${q.number}`] = `${studentAns} ${isCorrect ? '(+ ' + q.marks + ')' : studentAns !== '—' ? '(- ' + (q.negativeMarks || 1) + ')' : '(0)'}`;
      } else {
        const descAns = sub.descriptiveAnswers?.[q.number];
        const awarded = descAns?.awardedMarks !== undefined ? `${descAns.awardedMarks}/${q.marks} M` : 'Pending';
        const imgCount = descAns?.images?.length || 0;
        rowValues[`q_${q.number}`] = `${awarded} (${imgCount} pages)`;
      }
    }

    rowValues['incidents'] = sub.incidents?.length ? `${sub.incidents.length} alert(s)` : 'Clean (0)';
    rowValues['submittedAt'] = new Date(sub.submittedAt).toLocaleString();

    // Gather all B2 image URLs
    const allImages: string[] = [];
    Object.values(sub.descriptiveAnswers || {}).forEach(ans => {
      ans.images?.forEach(img => {
        if (img.url) allImages.push(img.url);
      });
    });
    rowValues['imageLinks'] = allImages.join(' , ');

    const row = worksheet.addRow(rowValues);
    row.height = 22;
    row.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 9 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const sanitizedTitle = exam.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  saveAs(blob, `${sanitizedTitle}_Results.xlsx`);
}
