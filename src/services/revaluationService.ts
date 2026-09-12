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

export type RevaluationBatch = 'B1' | 'B2' | 'B3' | string;

export interface RevaluationSubjectScore {
  subject: string;
  score: number | string;
}

export interface RevaluationResponse {
  id?: string;
  name: string;
  batch: RevaluationBatch;
  phone?: string;
  subjects: RevaluationSubjectScore[];
  notes?: string;
  submittedAt?: any;
}

export const REVALUATION_COMMON_SUBJECTS = [
  'Physics',
  'Chemistry',
  'Mathematics',
  'Biology',
  'English',
  'Malayalam',
  'Hindi',
  'Arabic',
  'Computer Science'
] as const;

const LOCAL_STORAGE_KEY = 'local_revaluation_responses';

export async function submitRevaluationResponse(
  response: Omit<RevaluationResponse, 'id' | 'submittedAt'>
): Promise<string> {
  const localId = 'local_' + Math.random().toString(36).substring(2, 9);
  
  if (!db) {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
    const parsed = JSON.parse(localData);
    const newEntry: RevaluationResponse = {
      ...response,
      id: localId,
      submittedAt: new Date().toISOString()
    };
    parsed.push(newEntry);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    return localId;
  }

  try {
    const docRef = await addDoc(collection(db, 'revaluation_responses'), {
      ...response,
      submittedAt: serverTimestamp()
    });

    // Also mirror locally as backup
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
      const parsed = JSON.parse(localData);
      parsed.unshift({
        ...response,
        id: docRef.id,
        submittedAt: new Date().toISOString()
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed.slice(0, 100)));
    } catch (e) {
      // Ignore localStorage sync issues
    }

    return docRef.id;
  } catch (err) {
    console.warn('Direct Firestore write failed, writing to localStorage cache:', err);
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
    const parsed = JSON.parse(localData);
    const newEntry: RevaluationResponse = {
      ...response,
      id: localId,
      submittedAt: new Date().toISOString()
    };
    parsed.push(newEntry);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    return localId;
  }
}

export async function getRevaluationResponses(): Promise<RevaluationResponse[]> {
  if (!db) {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
    try {
      return JSON.parse(localData);
    } catch {
      return [];
    }
  }

  try {
    const q = query(collection(db, 'revaluation_responses'), orderBy('submittedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const list = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      let submittedAtStr = new Date().toISOString();
      if (data.submittedAt) {
        try {
          submittedAtStr = data.submittedAt.toDate().toISOString();
        } catch {
          submittedAtStr = String(data.submittedAt);
        }
      }
      return {
        id: docSnapshot.id,
        ...data,
        submittedAt: submittedAtStr
      } as RevaluationResponse;
    });

    // Cache to localStorage
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch {}

    return list;
  } catch (err) {
    console.warn('Ordered fetch failed, trying collection fallback:', err);
    try {
      const querySnapshot = await getDocs(collection(db, 'revaluation_responses'));
      const list = querySnapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        let submittedAtStr = new Date().toISOString();
        if (data.submittedAt) {
          try {
            submittedAtStr = data.submittedAt.toDate().toISOString();
          } catch {
            submittedAtStr = String(data.submittedAt);
          }
        }
        return {
          id: docSnapshot.id,
          ...data,
          submittedAt: submittedAtStr
        } as RevaluationResponse;
      });

      return list.sort((a, b) => {
        const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return timeB - timeA;
      });
    } catch (fallbackErr) {
      console.warn('Falling back to local revaluation responses cache:', fallbackErr);
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
      try {
        return JSON.parse(localData);
      } catch {
        return [];
      }
    }
  }
}

export async function deleteRevaluationResponse(id: string): Promise<void> {
  // Update local cache
  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY) || '[]';
    const parsed = JSON.parse(localData) as RevaluationResponse[];
    const filtered = parsed.filter(item => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch {}

  if (!db) return;
  try {
    await deleteDoc(doc(db, 'revaluation_responses', id));
  } catch (err) {
    console.error('Error deleting revaluation response:', err);
    throw err;
  }
}

export async function clearAllRevaluationResponses(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {}

  if (!db) return;
  try {
    const snapshot = await getDocs(collection(db, 'revaluation_responses'));
    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'revaluation_responses', d.id)));
    await Promise.all(deletePromises);
  } catch (err) {
    console.error('Error clearing all revaluation responses:', err);
    throw err;
  }
}
