import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .split('\n').filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')]));
const src = JSON.parse(fs.readFileSync(new URL('./omr-exam-physics-4q.json', import.meta.url), 'utf8'));
const now = new Date().toISOString();
const totalMarks = src.questions.reduce((s, q) => s + (Number(q.marks) || 0), 0);
const examId = `exam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
const exam = { id: examId, ...src, totalMarks, passMarks: Math.round(totalMarks * 0.4), questionPaperImages: [], createdAt: now, updatedAt: now };
const enc = v => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
};
const body = { fields: Object.fromEntries(Object.entries(exam).map(([k, v]) => [k, enc(v)])) };
fs.writeFileSync('/tmp/omr-exam-body.json', JSON.stringify(body));
fs.writeFileSync('/tmp/omr-exam-id.txt', examId);
fs.writeFileSync('/tmp/omr-exam-project.txt', env.VITE_FIREBASE_PROJECT_ID);
console.log(examId, env.VITE_FIREBASE_PROJECT_ID);
