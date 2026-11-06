import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .split('\n').filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')]));
const BASE = `https://firestore.googleapis.com/v1/projects/${env.VITE_FIREBASE_PROJECT_ID}/databases/(default)/documents/online_exams`;
const KEY = env.VITE_FIREBASE_API_KEY;
const ID = 'exam_1792902931700_ml01';
const enc = v => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
};
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
const get = await (await fetch(`${BASE}/${ID}?key=${KEY}`)).json();
const obj = Object.fromEntries(Object.entries(get.fields).map(([k, v]) => [k, dec(v)]));

const replaceIn = (qNum, from, to) => {
  const q = obj.questions.find(x => x.number === qNum);
  if (!q) throw new Error(`Q${qNum} missing`);
  const hay = q.prompt;
  if (!hay.includes(from)) throw new Error(`Q${qNum} prompt does not contain: ${from}`);
  q.prompt = hay.replace(from, to);
};
const setOption = (qNum, idx, from, to) => {
  const q = obj.questions.find(x => x.number === qNum);
  if (q.options[idx] !== from) throw new Error(`Q${qNum} option ${idx} is "${q.options[idx]}"`);
  q.options[idx] = to;
};



replaceIn(14, 'ഏത് ആയി', 'ഏത് ധ്രുവമായി');



obj.updatedAt = new Date().toISOString();
const body = { fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, enc(v)])) };
const res = await fetch(`${BASE}/${ID}?key=${KEY}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
console.log('PATCH', res.status);
for (const n of [7, 10, 14, 15, 17]) {
  const q = obj.questions.find(x => x.number === n);
  console.log(`Q${n}:`, q.prompt, n === 10 ? '| A: ' + q.options[0] : '');
}
