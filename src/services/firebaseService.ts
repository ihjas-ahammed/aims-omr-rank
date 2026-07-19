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

export type SlideType = 'text' | 'image' | 'slideshow' | 'persons' | 'speaker' | 'congrats' | 'title' | 'gallery';

// Which set of student photos a gallery slide draws from (see students.ts).
export type GalleryCategory = 'full-aplus' | '5-aplus' | '90-above' | 'all';

// Transition used between images in a slideshow slide.
export type SlideshowAnimation = 'slide' | 'fade' | 'zoom';

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
  // slideshow slides: cycles through external image URLs while the slide is live.
  images?: string[];              // ordered list of external image URLs
  slideshowDelay?: number;        // seconds each image is shown (default 4)
  slideshowAnimation?: SlideshowAnimation; // transition between images (default 'slide')
  persons?: Person[];             // persons / speaker slides (people)
  activePersonId?: string | null; // persons / speaker: who is currently highlighted
  // speaker slides (awards template):
  segment?: string;               // program segment, e.g. "Welcome Address"
  // congrats slides (awards template):
  congratsTitle?: string;
  congratsSubtitle?: string;
  congratsMessage?: string;
  // footer caption shown on awards slides (title/speaker/congrats/gallery).
  // Defaults to 'SSLC Awards 2026' for backward compatibility.
  footerCaption?: string;
  // gallery slides (student congratulations gallery — see students.ts):
  galleryCategory?: GalleryCategory; // which student set to cycle through
  galleryTitle?: string;             // eyebrow shown above each student, e.g. "Plus Two 2026"
  gallerySubtitle?: string;          // line under the eyebrow, e.g. "Full A+ Achievers"
  // `galleryCurrentKey` is written by the controller each step; the view simply
  // displays the student whose photoUrl matches it. Reuses `slideshowDelay` for pacing.
  galleryCurrentKey?: string;        // photoUrl of the student currently on screen
  // Priority "up next" queue (photoUrl keys). Persisted so it can be preset
  // before the slide goes live; the driver shows these next, one per delay.
  galleryQueue?: string[];
  // Queue-only mode: don't auto-walk A→Z — show only queued students, and hold
  // on the last one when the queue runs out (so the presenter can add the next).
  galleryQueueOnly?: boolean;
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

// Student Improvement Responses
export interface ImprovementResponse {
  id?: string;
  name: string;
  batch: 'B1' | 'B2' | 'B3';
  scores: {
    english: number;
    language: number;
    physics: number;
    chemistry: number;
    mathematics: number;
    sixthSubjectType: 'Biology' | 'Computer Science';
    sixthSubjectScore: number;
  };
  totalScore: number;
  improvementSubjects: string[];
  wantsEntranceExams: boolean;
  preferredEntranceExams?: string[];
  submittedAt?: any;
}

export async function submitImprovementResponse(response: Omit<ImprovementResponse, 'id' | 'submittedAt'>): Promise<void> {
  if (!db) {
    const localData = localStorage.getItem('local_improvement_responses') || '[]';
    const parsed = JSON.parse(localData);
    parsed.push({
      ...response,
      id: 'local_' + Math.random().toString(36).substring(2, 9),
      submittedAt: new Date().toISOString()
    });
    localStorage.setItem('local_improvement_responses', JSON.stringify(parsed));
    return;
  }
  await addDoc(collection(db, 'improvement_responses'), {
    ...response,
    submittedAt: serverTimestamp()
  });
}

export async function getImprovementResponses(): Promise<ImprovementResponse[]> {
  if (!db) {
    const localData = localStorage.getItem('local_improvement_responses') || '[]';
    return JSON.parse(localData);
  }
  const q = query(collection(db, 'improvement_responses'), orderBy('submittedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    let submittedAtStr = new Date().toISOString();
    if (data.submittedAt) {
      try {
        submittedAtStr = data.submittedAt.toDate().toISOString();
      } catch (e) {
        submittedAtStr = String(data.submittedAt);
      }
    }
    return {
      id: doc.id,
      ...data,
      submittedAt: submittedAtStr
    } as ImprovementResponse;
  });
}

export async function deleteImprovementResponse(id: string): Promise<void> {
  if (!db) {
    const localData = localStorage.getItem('local_improvement_responses') || '[]';
    const parsed = JSON.parse(localData) as ImprovementResponse[];
    const filtered = parsed.filter(item => item.id !== id);
    localStorage.setItem('local_improvement_responses', JSON.stringify(filtered));
    return;
  }
  await deleteDoc(doc(db, 'improvement_responses', id));
}