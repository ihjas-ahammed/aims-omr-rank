import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const env = Object.fromEntries(
  fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('='))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
);
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
});
const db = getFirestore(app);

const src = JSON.parse(fs.readFileSync(new URL('./omr-exam-physics-4q.json', import.meta.url), 'utf8'));
const now = new Date().toISOString();
const totalMarks = src.questions.reduce((s, q) => s + (Number(q.marks) || 0), 0);
const examId = `exam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
const exam = {
  id: examId,
  ...src,
  totalMarks,
  passMarks: Math.round(totalMarks * 0.4),
  questionPaperImages: [],
  createdAt: now,
  updatedAt: now,
};
await setDoc(doc(db, 'online_exams', examId), JSON.parse(JSON.stringify(exam)), { merge: true });
console.log('Created exam:', examId, '| totalMarks', totalMarks, '| passMarks', exam.passMarks);
process.exit(0);
