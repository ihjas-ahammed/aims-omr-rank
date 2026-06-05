import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, updateDoc, serverTimestamp, query, orderBy, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
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
  numOptions?: number;
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

export interface CloudSnapshot {
  id: string;
  name: string;
  createdAt: string;
  data: string;
}

export type SlideType = 'text' | 'image' | 'persons' | 'speaker' | 'congrats' | 'title';

export interface Person {
  id: string;
  name: string;
  role: string;        // e.g. "Director"
  photoUrl: string;    // external URL
}

export interface Slide {
  id: string;
  type: SlideType;
  text?: string;                  // text slides
  imageUrl?: string;              // image slides (external URL)
  persons?: Person[];             // persons / speaker slides (people)
  activePersonId?: string | null; // persons / speaker: who is currently highlighted
  // speaker slides (awards template):
  segment?: string;               // program segment, e.g. "Welcome Address"
  // congrats slides (awards template):
  congratsTitle?: string;
  congratsSubtitle?: string;
  congratsMessage?: string;
}

export type AnchorV = 'top' | 'center' | 'bottom';
export type AnchorH = 'left' | 'center' | 'right';

// Presentation-wide settings applied to all persons slides.
export interface PresentationSettings {
  personScale: number;     // photo/text size multiplier, e.g. 1.0 (slider 0.5–1.5)
  personAnchorV: AnchorV;  // vertical placement of the panel
  personAnchorH: AnchorH;  // horizontal placement of the panel
}

export const DEFAULT_PRESENTATION_SETTINGS: PresentationSettings = {
  personScale: 1,
  personAnchorV: 'center',
  personAnchorH: 'center',
};

export interface Presentation {
  id?: string;
  title: string;
  slides: Slide[];
  activeSlideId: string | null;
  settings?: PresentationSettings;
  createdAt?: any;
  updatedAt?: any;
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

export async function saveCloudSnapshot(name: string, data: string): Promise<string> {
  if (!db) throw new Error("Firebase is not configured.");
  const docRef = await addDoc(collection(db, 'cloud_sessions'), {
    name,
    data,
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp()
  });
  return docRef.id;
}

export async function getCloudSnapshots(): Promise<CloudSnapshot[]> {
  if (!db) throw new Error("Firebase is not configured.");
  const q = query(collection(db, 'cloud_sessions'), orderBy('timestamp', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CloudSnapshot[];
}

export async function deleteCloudSnapshot(id: string): Promise<void> {
  if (!db) throw new Error("Firebase is not configured.");
  await deleteDoc(doc(db, 'cloud_sessions', id));
}

// --- Aims Presenter ---

export async function createPresentation(title: string): Promise<string> {
  if (!db) throw new Error("Firebase is not configured.");
  const docRef = await addDoc(collection(db, 'presentations'), {
    title: title || 'Untitled Presentation',
    slides: [],
    activeSlideId: null,
    settings: DEFAULT_PRESENTATION_SETTINGS,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Create a presentation pre-filled with data (used by templates).
export async function createPresentationFromData(
  data: Pick<Presentation, 'title' | 'slides' | 'activeSlideId' | 'settings'>
): Promise<string> {
  if (!db) throw new Error("Firebase is not configured.");
  const docRef = await addDoc(collection(db, 'presentations'), {
    title: data.title || 'Untitled Presentation',
    slides: data.slides || [],
    activeSlideId: data.activeSlideId ?? null,
    settings: data.settings || DEFAULT_PRESENTATION_SETTINGS,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getPresentation(id: string): Promise<Presentation> {
  if (!db) throw new Error("Firebase is not configured.");
  const docRef = doc(db, 'presentations', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error("Presentation not found!");
  }
  return { id: docSnap.id, ...docSnap.data() } as Presentation;
}

// Realtime subscription. Returns an unsubscribe function.
export function subscribePresentation(
  id: string,
  cb: (p: Presentation | null) => void,
  onError?: (e: Error) => void
): () => void {
  if (!db) {
    onError?.(new Error("Firebase is not configured."));
    return () => {};
  }
  const docRef = doc(db, 'presentations', id);
  return onSnapshot(
    docRef,
    (snap) => {
      if (!snap.exists()) {
        cb(null);
        return;
      }
      cb({ id: snap.id, ...snap.data() } as Presentation);
    },
    (err) => onError?.(err as Error)
  );
}

export async function updatePresentation(id: string, patch: Partial<Presentation>): Promise<void> {
  if (!db) throw new Error("Firebase is not configured.");
  const docRef = doc(db, 'presentations', id);
  await updateDoc(docRef, { ...patch, updatedAt: serverTimestamp() });
}

export async function listPresentations(): Promise<Presentation[]> {
  if (!db) throw new Error("Firebase is not configured.");
  const q = query(collection(db, 'presentations'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Presentation[];
}

export async function deletePresentation(id: string): Promise<void> {
  if (!db) throw new Error("Firebase is not configured.");
  await deleteDoc(doc(db, 'presentations', id));
}