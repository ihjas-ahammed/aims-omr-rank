import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .split('\n').filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')]));
const BASE = `https://firestore.googleapis.com/v1/projects/${env.VITE_FIREBASE_PROJECT_ID}/databases/(default)/documents/online_exams`;
const KEY = env.VITE_FIREBASE_API_KEY;
const enc = v => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
};
const ids = ['exam_1792902391392_wcc67', 'exam_1792902931700_ml01'];
for (const id of ids) {
  const get = await (await fetch(`${BASE}/${id}?key=${KEY}`)).json();
  const exam = JSON.parse(JSON.stringify(get.fields, (k, v) => v));
  // Convert Firestore REST fields → plain object (only the parts we need)
  const dec = v => {
    if ('stringValue' in v) return v.stringValue;
    if ('integerValue' in v) return Number(v.integerValue);
    if ('doubleValue' in v) return v.doubleValue;
    if ('booleanValue' in v) return v.booleanValue;
    if ('nullValue' in v) return null;
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(dec);
    if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, dec(x)]));
    return null;
  };
  const obj = Object.fromEntries(Object.entries(get.fields).map(([k, v]) => [k, dec(v)]));
  obj.questions = obj.questions.map(q => q.type === 'mcq' ? { ...q, marks: 2, negativeMarks: 0 } : q);
  obj.totalMarks = obj.questions.reduce((s, q) => s + (Number(q.marks) || 0), 0);
  obj.passMarks = Math.round(obj.totalMarks * 0.4);
  obj.updatedAt = new Date().toISOString();
  const body = { fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, enc(v)])) };
  const res = await fetch(`${BASE}/${id}?key=${KEY}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  console.log(id, res.status, obj.questions.length, 'Qs, total', obj.totalMarks, 'pass', obj.passMarks, 'negative', obj.questions[0].negativeMarks);
}
