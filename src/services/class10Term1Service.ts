import { db } from './firebaseService';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy 
} from 'firebase/firestore';

export interface SCERTClass10Subject {
  id: string;
  name: string;
  shortName: string;
  code: string;
  maxMarks: number;
  category: 'language' | 'science' | 'math' | 'social' | 'it';
}

// Official Kerala SCERT Class 10 Subjects (without IT) with their exact Terminal Exam max marks (Total 440)
export const SCERT_CLASS_10_SUBJECTS: SCERTClass10Subject[] = [
  { id: 'mal1', name: 'First Language Part 1 (Malayalam I / Arabic / Urdu / Sanskrit)', shortName: 'Language 1', code: 'FL1', maxMarks: 40, category: 'language' },
  { id: 'mal2', name: 'First Language Part 2 (Malayalam II)', shortName: 'Language 2', code: 'FL2', maxMarks: 40, category: 'language' },
  { id: 'eng', name: 'English', shortName: 'English', code: 'ENG', maxMarks: 80, category: 'language' },
  { id: 'hin', name: 'Hindi', shortName: 'Hindi', code: 'HIN', maxMarks: 40, category: 'language' },
  { id: 'ss', name: 'Social Science', shortName: 'Social Science', code: 'SS', maxMarks: 80, category: 'social' },
  { id: 'phy', name: 'Physics', shortName: 'Physics', code: 'PHY', maxMarks: 40, category: 'science' },
  { id: 'chem', name: 'Chemistry', shortName: 'Chemistry', code: 'CHE', maxMarks: 40, category: 'science' },
  { id: 'bio', name: 'Biology', shortName: 'Biology', code: 'BIO', maxMarks: 40, category: 'science' },
  { id: 'math', name: 'Mathematics', shortName: 'Mathematics', code: 'MATH', maxMarks: 80, category: 'math' },
];

export const TOTAL_MAX_MARKS = SCERT_CLASS_10_SUBJECTS.reduce((sum, s) => sum + s.maxMarks, 0); // 440

export interface Class10SubjectScore {
  subjectId: string;
  subjectName: string;
  marks: number | null;
  maxMarks: number;
  variant?: string; // e.g. "Malayalam 1", "Arabic", "Urdu", "Sanskrit"
}

export interface Class10Term1Response {
  id?: string;
  studentName: string;
  className: string; // Class e.g. "Class E1", "Class M1"
  batch?: string; // optional
  rollNo?: string;
  phone?: string;
  fl1Variant?: string; // Chosen first language variant e.g. "Malayalam I"
  subjects: Record<string, number | null>; // subjectId -> entered marks
  totalMarks: number; // auto-calculated
  maxMarks: number; // 480
  percentage: number; // auto-calculated
  grade: string; // A+, A, B+, B, C+, C, D+, D, E
  notes?: string;
  submittedAt?: any;
}

// Kerala SSLC 9-point grading scale
export function calculateSSLCGrade(percentage: number): { grade: string; label: string; color: string } {
  if (percentage >= 90) return { grade: 'A+', label: 'Outstanding (90-100%)', color: 'emerald' };
  if (percentage >= 80) return { grade: 'A', label: 'Excellent (80-89%)', color: 'teal' };
  if (percentage >= 70) return { grade: 'B+', label: 'Very Good (70-79%)', color: 'blue' };
  if (percentage >= 60) return { grade: 'B', label: 'Good (60-69%)', color: 'indigo' };
  if (percentage >= 50) return { grade: 'C+', label: 'Above Average (50-59%)', color: 'amber' };
  if (percentage >= 40) return { grade: 'C', label: 'Average (40-49%)', color: 'orange' };
  if (percentage >= 30) return { grade: 'D+', label: 'Marginal (30-39%)', color: 'rose' };
  if (percentage >= 20) return { grade: 'D', label: 'Needs Improvement (20-29%)', color: 'red' };
  return { grade: 'E', label: 'Needs Improvement (<20%)', color: 'slate' };
}

const LOCAL_STORAGE_KEY = 'local_class10_term1_responses';

export async function submitClass10Term1Response(
  response: Omit<Class10Term1Response, 'id' | 'submittedAt'>
): Promise<string> {
  const localId = 'local_' + Math.random().toString(36).substring(2, 9);

  // Clean data so that Firestore NEVER receives undefined values (which throws FirebaseError addDoc() called with invalid data: undefined)
  const cleanPayload: Record<string, any> = {};
  for (const [key, value] of Object.entries(response)) {
    if (value !== undefined) {
      if (key === 'subjects' && typeof value === 'object' && value !== null) {
        const cleanSubs: Record<string, number | null> = {};
        for (const [subKey, subVal] of Object.entries(value)) {
          cleanSubs[subKey] = (subVal !== undefined && subVal !== null) ? Number(subVal) : null;
        }
        cleanPayload.subjects = cleanSubs;
      } else {
        cleanPayload[key] = value;
      }
    }
  }

  if (!db) {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
    const parsed: Class10Term1Response[] = JSON.parse(localData);
    const newEntry: Class10Term1Response = {
      ...(cleanPayload as any),
      id: localId,
      submittedAt: new Date().toISOString()
    };
    parsed.unshift(newEntry);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    return localId;
  }

  try {
    const docRef = await addDoc(collection(db, 'class10_term1_responses'), {
      ...cleanPayload,
      submittedAt: serverTimestamp()
    });

    // Mirror to localStorage
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
      const parsed: Class10Term1Response[] = JSON.parse(localData);
      parsed.unshift({
        ...(cleanPayload as any),
        id: docRef.id,
        submittedAt: new Date().toISOString()
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed.slice(0, 150)));
    } catch (e) {
      // ignore
    }

    return docRef.id;
  } catch (err) {
    console.warn('Firestore write failed, using local storage fallback:', err);
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
    const parsed: Class10Term1Response[] = JSON.parse(localData);
    const newEntry: Class10Term1Response = {
      ...(cleanPayload as any),
      id: localId,
      submittedAt: new Date().toISOString()
    };
    parsed.unshift(newEntry);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    return localId;
  }
}

export async function getClass10Term1Responses(): Promise<Class10Term1Response[]> {
  if (!db) {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
    return JSON.parse(localData);
  }

  try {
    const q = query(collection(db, 'class10_term1_responses'), orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    const results: Class10Term1Response[] = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      results.push({
        id: docSnap.id,
        studentName: data.studentName || '',
        className: data.className || 'Class 10',
        batch: data.batch || '',
        rollNo: data.rollNo || '',
        phone: data.phone || '',
        fl1Variant: data.fl1Variant || 'Malayalam I',
        subjects: data.subjects || {},
        totalMarks: typeof data.totalMarks === 'number' ? data.totalMarks : 0,
        maxMarks: typeof data.maxMarks === 'number' ? data.maxMarks : TOTAL_MAX_MARKS,
        percentage: typeof data.percentage === 'number' ? data.percentage : 0,
        grade: data.grade || 'E',
        notes: data.notes || '',
        submittedAt: data.submittedAt
      });
    });

    // Also merge any local-only entries that might not have reached Firestore
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
      const localParsed: Class10Term1Response[] = JSON.parse(localData);
      for (const localItem of localParsed) {
        if (localItem.id?.startsWith('local_') && !results.some(r => r.id === localItem.id)) {
          results.push(localItem);
        }
      }
    } catch (e) {
      // ignore
    }

    return results;
  } catch (err) {
    console.warn('Firestore fetch failed, returning localStorage cache:', err);
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
    return JSON.parse(localData);
  }
}

export async function deleteClass10Term1Response(id: string): Promise<void> {
  // Always delete from localStorage
  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
    const parsed: Class10Term1Response[] = JSON.parse(localData);
    const filtered = parsed.filter(item => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to remove from localStorage:', e);
  }

  if (!db || id.startsWith('local_')) {
    return;
  }

  try {
    await deleteDoc(doc(db, 'class10_term1_responses', id));
  } catch (err) {
    console.error('Firestore deleteDoc failed:', err);
    throw err;
  }
}
