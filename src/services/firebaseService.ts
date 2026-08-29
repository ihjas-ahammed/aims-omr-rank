import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDoc, getDocs, updateDoc, serverTimestamp, query, orderBy, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA88qBFpFuxgZTOmE5qRCzaAYqcQlPRRoA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'aims-kondotty1.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'aims-kondotty1',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'aims-kondotty1.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '613707197972',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:613707197972:web:98ee168875b8d76d78c101',
  databaseURL: 'https://aims-plus-evaluation-default-rtdb.asia-southeast1.firebasedatabase.app'
};

export const isFirebaseConfigured = !!firebaseConfig.apiKey;

// Initialize Firebase only if config exists and hasn't been initialized
export const app = isFirebaseConfigured ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()) : null;
export const db = isFirebaseConfigured ? getFirestore(app!) : null;
export const rtdb = isFirebaseConfigured ? getDatabase(app!) : null;
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

// Student Improvement Responses (Night Class)
export interface ImprovementResponse {
  id?: string;
  name: string;
  batch: 'B1' | 'B2' | 'B3' | string;
  phone?: string;
  improvementSubjects: string[];
  notes?: string;
  // Legacy / optional fields for backward compatibility
  scores?: {
    english?: number;
    language?: number;
    physics?: number;
    chemistry?: number;
    mathematics?: number;
    sixthSubjectType?: string;
    sixthSubjectScore?: number;
  };
  totalScore?: number;
  wantsEntranceExams?: boolean;
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
  try {
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
  } catch (err) {
    console.error("Error fetching improvement_responses:", err);
    try {
      const querySnapshot = await getDocs(collection(db, 'improvement_responses'));
      const list = querySnapshot.docs.map(doc => {
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
      return list.sort((a, b) => (b.submittedAt > a.submittedAt ? 1 : -1));
    } catch (fallbackErr) {
      console.warn("Falling back to local improvement responses:", fallbackErr);
      const localData = localStorage.getItem('local_improvement_responses') || '[]';
      return JSON.parse(localData);
    }
  }
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

export async function clearAllImprovementResponses(): Promise<void> {
  if (!db) {
    localStorage.removeItem('local_improvement_responses');
    return;
  }
  const snapshot = await getDocs(collection(db, 'improvement_responses'));
  const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'improvement_responses', d.id)));
  await Promise.all(deletePromises);
  localStorage.removeItem('local_improvement_responses');
}

// Student Compensation Class Requests (Batch A2)
export interface CompensationSelectedChapter {
  subject: string;
  chapter: string;
  teacher?: string;
}

export interface CompensationResponse {
  id?: string;
  name: string;
  studentClass: string; // 'A2'
  phone?: string;
  selectedChapters: CompensationSelectedChapter[];
  reason?: string;
  submittedAt?: any;
}

export async function submitCompensationResponse(response: Omit<CompensationResponse, 'id' | 'submittedAt'>): Promise<void> {
  if (!db) {
    const localData = localStorage.getItem('local_compensation_responses') || '[]';
    const parsed = JSON.parse(localData);
    parsed.push({
      ...response,
      id: 'local_' + Math.random().toString(36).substring(2, 9),
      submittedAt: new Date().toISOString()
    });
    localStorage.setItem('local_compensation_responses', JSON.stringify(parsed));
    return;
  }
  await addDoc(collection(db, 'compensation_responses'), {
    ...response,
    submittedAt: serverTimestamp()
  });
}

export async function getCompensationResponses(): Promise<CompensationResponse[]> {
  if (!db) {
    const localData = localStorage.getItem('local_compensation_responses') || '[]';
    return JSON.parse(localData);
  }
  try {
    const q = query(collection(db, 'compensation_responses'), orderBy('submittedAt', 'desc'));
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
      } as CompensationResponse;
    });
  } catch (err) {
    console.error("Error fetching compensation_responses:", err);
    try {
      // Fallback if index missing or query error
      const querySnapshot = await getDocs(collection(db, 'compensation_responses'));
      const list = querySnapshot.docs.map(doc => {
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
        } as CompensationResponse;
      });
      return list.sort((a, b) => (b.submittedAt > a.submittedAt ? 1 : -1));
    } catch (fallbackErr) {
      console.warn("Falling back to local compensation responses:", fallbackErr);
      const localData = localStorage.getItem('local_compensation_responses') || '[]';
      return JSON.parse(localData);
    }
  }
}

export async function deleteCompensationResponse(id: string): Promise<void> {
  if (!db) {
    const localData = localStorage.getItem('local_compensation_responses') || '[]';
    const parsed = JSON.parse(localData) as CompensationResponse[];
    const filtered = parsed.filter(item => item.id !== id);
    localStorage.setItem('local_compensation_responses', JSON.stringify(filtered));
    return;
  }
  await deleteDoc(doc(db, 'compensation_responses', id));
}

// ---------------- Timetable Manager & Global AI Key ----------------
export const DEFAULT_GLOBAL_GEMINI_API_KEY = "AIzaSyBaXtDi_OglFxqKWNDDNqXXYHSjeO8n-rQ";

export const LEAKED_BLOCKED_KEYS = [
  "AIzaSyAT2oFfKW8mfPT8iP-SetxXfeFdwfFi0ro",
  "AIzaSyA88qBFpFuxgZTOmE5qRCzaAYqcQlPRRoA",
  "AIzaSyC6BuQvYUAb5kFd5W2tazuD0kAtTSuYMfs"
];

export const DEFAULT_TEACHER_MAPPINGS: Record<string, string> = {
  "ABR": "PHYSICS",
  "ARJ": "PHYSICS",
  "JN": "PHYSICS",
  "CY": "CHEMISTRY",
  "AMR": "CHEMISTRY",
  "CSD": "CHEMISTRY",
  "MF": "MATHS",
  "ADL": "MATHS",
  "SRJ": "MATHS",
  "MRS": "MATHS",
  "AZ": "ZOOLOGY",
  "SDR": "ZOOLOGY",
  "HB": "ZOOLOGY",
  "TK": "ZOOLOGY",
  "JS": "BOTANY",
  "SHM": "BOTANY",
  "HR": "BOTANY",
  "SB": "BOTANY",
  "ENG": "ENGLISH",
  "CS": "COMPUTER SCIENCE"
};

export async function getGlobalAiApiKey(): Promise<string> {
  let localKey = localStorage.getItem('aims_global_ai_api_key');
  if (localKey && LEAKED_BLOCKED_KEYS.includes(localKey.trim())) {
    localStorage.removeItem('aims_global_ai_api_key');
    localKey = null;
  }
  if (localKey && localKey.trim()) return localKey.trim();

  if (!db) {
    localStorage.setItem('aims_global_ai_api_key', DEFAULT_GLOBAL_GEMINI_API_KEY);
    return DEFAULT_GLOBAL_GEMINI_API_KEY;
  }

  try {
    const docRef = doc(db, 'app_data', 'global_ai_settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const k = (data?.gemini_api_key || data?.apiKey || '').trim();
      if (k && !LEAKED_BLOCKED_KEYS.includes(k)) {
        localStorage.setItem('aims_global_ai_api_key', k);
        return k;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch global AI key from Firestore, using verified default:", err);
  }

  localStorage.setItem('aims_global_ai_api_key', DEFAULT_GLOBAL_GEMINI_API_KEY);
  return DEFAULT_GLOBAL_GEMINI_API_KEY;
}

export async function saveGlobalAiApiKey(apiKey: string): Promise<void> {
  const cleanKey = apiKey.trim();
  localStorage.setItem('aims_global_ai_api_key', cleanKey);
  if (!db) return;
  try {
    const docRef = doc(db, 'app_data', 'global_ai_settings');
    await setDoc(docRef, { apiKey: cleanKey, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.error("Failed to save global AI key to Firestore:", err);
  }
}

export async function getTimetablesDataset(): Promise<{ days: any[] }> {
  const localStr = localStorage.getItem('aims_timetables_dataset');
  let fallbackData: { days: any[] } = { days: [] };
  if (localStr) {
    try { fallbackData = JSON.parse(localStr); } catch (e) {}
  }

  if (!db) return fallbackData;
  try {
    const docRef = doc(db, 'app_data', 'timetables_dataset');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data()?.days) {
      const remoteData = { days: snap.data().days };
      localStorage.setItem('aims_timetables_dataset', JSON.stringify(remoteData));
      return remoteData;
    }
    return fallbackData;
  } catch (err) {
    console.warn("Error fetching timetables dataset from Firestore:", err);
    return fallbackData;
  }
}

export async function saveTimetablesDataset(data: { days: any[] }): Promise<void> {
  localStorage.setItem('aims_timetables_dataset', JSON.stringify(data));
  if (!db) return;
  try {
    const docRef = doc(db, 'app_data', 'timetables_dataset');
    await setDoc(docRef, { days: data.days, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.error("Error saving timetables dataset to Firestore:", err);
  }
}

export async function getTeacherMappingsData(): Promise<Record<string, string>> {
  const localStr = localStorage.getItem('aims_teacher_mappings');
  let fallback: Record<string, string> = { ...DEFAULT_TEACHER_MAPPINGS };
  if (localStr) {
    try {
      const parsed = JSON.parse(localStr);
      if (parsed && typeof parsed === 'object') fallback = { ...DEFAULT_TEACHER_MAPPINGS, ...parsed };
    } catch (e) {}
  }

  if (!db) return fallback;
  try {
    const docRef = doc(db, 'app_data', 'teacher_mappings');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data()?.mappings) {
      const remote = { ...DEFAULT_TEACHER_MAPPINGS, ...snap.data().mappings };
      localStorage.setItem('aims_teacher_mappings', JSON.stringify(remote));
      return remote;
    }
    // Seed defaults in Firestore if empty
    await setDoc(docRef, { mappings: DEFAULT_TEACHER_MAPPINGS, updatedAt: serverTimestamp() }, { merge: true });
    return fallback;
  } catch (err) {
    console.warn("Error fetching teacher mappings from Firestore:", err);
    return fallback;
  }
}

export async function saveTeacherMappingsData(mappings: Record<string, string>): Promise<void> {
  localStorage.setItem('aims_teacher_mappings', JSON.stringify(mappings));
  if (!db) return;
  try {
    const docRef = doc(db, 'app_data', 'teacher_mappings');
    await setDoc(docRef, { mappings, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.error("Error saving teacher mappings to Firestore:", err);
  }
}