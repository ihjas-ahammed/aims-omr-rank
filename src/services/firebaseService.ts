import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, updateDoc, serverTimestamp, query, orderBy, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

export const isFirebaseConfigured = !!firebaseConfig.apiKey;

// Initialize Firebase only if config exists and hasn't been initialized
export const app = isFirebaseConfigured ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) : null;
export const db = isFirebaseConfigured ? getFirestore(app!) : null;
export const auth = isFirebaseConfigured ? getAuth(app!) : null;

export interface ExamIncident {
  time: string;
  reason: string;
}

export interface ExamSubmission {
  id?: string;
  studentName: string;
  studentClass: string;
  answers: Record<number, string>;
  score: number;
  totalRight: number;
  totalWrong: number;
  incidents: ExamIncident[];
  submittedAt: any;
}

export interface ExamData {
  id?: string;
  title: string;
  className: string;
  totalQuestions: number;
  answerKey: Record<number, string>; // e.g., { 1: 'A', 2: 'B' }
  images: string[]; // Base64 compressed images
  createdAt: any;
}

export interface FeeLogData {
  id: string;
  admissionNo: string;
  studentClass: string;
  studentName: string;
  feeAmount: number;
  isGPay: boolean;
  date: string;
  createdAt: string;
}

// Service Functions
export async function createExam(examData: Omit<ExamData, 'id' | 'createdAt'>): Promise<string> {
  if (!db) throw new Error("Firebase is not configured.");
  
  const docRef = await addDoc(collection(db, 'exams'), {
    ...examData,
    createdAt: serverTimestamp()
  });
  
  return docRef.id;
}

export async function getExam(examId: string): Promise<ExamData> {
  if (!db) throw new Error("Firebase is not configured.");
  
  const docRef = doc(db, 'exams', examId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error("Exam not found!");
  }
  
  return { id: docSnap.id, ...docSnap.data() } as ExamData;
}

export async function submitExamResult(examId: string, submission: Omit<ExamSubmission, 'id' | 'submittedAt'>): Promise<void> {
  if (!db) throw new Error("Firebase is not configured.");
  
  await addDoc(collection(db, `exams/${examId}/submissions`), {
    ...submission,
    submittedAt: serverTimestamp()
  });
}

export async function getExamSubmissions(examId: string): Promise<ExamSubmission[]> {
  if (!db) throw new Error("Firebase is not configured.");
  
  const q = query(collection(db, `exams/${examId}/submissions`), orderBy('score', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ExamSubmission[];
}

export async function getCourseProgress(): Promise<any> {
  if (!db) throw new Error("Firebase is not configured.");
  
  const docRef = doc(db, 'app_data', 'course_progress');
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists() && docSnap.data().subjects) {
    return docSnap.data().subjects;
  }
  return null;
}

export async function saveCourseProgress(subjects: any): Promise<void> {
  if (!db) throw new Error("Firebase is not configured.");
  
  const docRef = doc(db, 'app_data', 'course_progress');
  await setDoc(docRef, { subjects, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getTimetable(date: string): Promise<any> {
  if (!db) throw new Error("Firebase is not configured.");
  
  const docRef = doc(db, 'app_data', `timetable_${date}`);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists() && docSnap.data().data) {
    return docSnap.data().data;
  }
  return null;
}

export async function saveTimetable(date: string, data: any): Promise<void> {
  if (!db) throw new Error("Firebase is not configured.");
  
  const docRef = doc(db, 'app_data', `timetable_${date}`);
  await setDoc(docRef, { data, updatedAt: serverTimestamp() }, { merge: true });
}

export async function getFeeLogs(): Promise<FeeLogData[]> {
  if (!db) throw new Error("Firebase is not configured.");
  const docRef = doc(db, 'app_data', 'fee_logs');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists() && docSnap.data().logs) {
    return docSnap.data().logs;
  }
  return [];
}

export async function saveFeeLogs(logs: FeeLogData[]): Promise<void> {
  if (!db) throw new Error("Firebase is not configured.");
  const docRef = doc(db, 'app_data', 'fee_logs');
  await setDoc(docRef, { logs, updatedAt: serverTimestamp() }, { merge: true });
}