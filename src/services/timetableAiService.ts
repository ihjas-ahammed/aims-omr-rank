import { GoogleGenAI } from '@google/genai';
import { 
  getGlobalAiApiKey, 
  getTeacherMappingsData, 
  DEFAULT_TEACHER_MAPPINGS,
  DEFAULT_GLOBAL_GEMINI_API_KEY,
  LEAKED_BLOCKED_KEYS
} from './firebaseService';

export interface ScannedSubject {
  id: number;
  name: string;
  teacher_code: string;
  color: 'blue' | 'green';
  icon_type: string;
  icon: string;
}

export interface ScannedClass {
  class_name: string;
  title: string;
  time: string;
  apt_exam: string;
  extra_note: string;
  phone1: string;
  phone2: string;
  subjects: ScannedSubject[];
}

export interface ScanTimetableResult {
  success: boolean;
  date: string;
  isoDate: string;
  dayName: string;
  time: string;
  time_slots: string[];
  classes: ScannedClass[];
  unmapped_teachers: string[];
  error?: string;
}

export function getAutoIconForSubject(subjectName: string): { icon_type: string; icon: string } {
  const lower = (subjectName || '').toLowerCase();
  if (lower.includes('math')) return { icon_type: 'math', icon: '' };
  if (lower.includes('chem')) return { icon_type: 'icon', icon: 'science' };
  if (lower.includes('phys')) return { icon_type: 'icon', icon: 'grain' };
  if (lower.includes('botan') || lower.includes('plant')) return { icon_type: 'icon', icon: 'psychiatry' };
  if (lower.includes('zoo') || lower.includes('bio') || lower.includes('anim')) return { icon_type: 'icon', icon: 'pets' };
  if (lower.includes('comp') || lower.includes('cs') || lower.includes('ip')) return { icon_type: 'icon', icon: 'terminal' };
  if (lower.includes('eng')) return { icon_type: 'icon', icon: 'menu_book' };
  return { icon_type: 'icon', icon: 'menu_book' };
}

export async function scanTimetableImageFromClient(
  fileOrBase64: File | string,
  customApiKey?: string
): Promise<ScanTimetableResult> {
  // 1. Resolve API Key (Priority: customApiKey -> stored global key in Firebase -> default global key)
  let apiKey = (customApiKey && customApiKey.trim()) ? customApiKey.trim() : await getGlobalAiApiKey();
  if (!apiKey || LEAKED_BLOCKED_KEYS.includes(apiKey.trim())) {
    apiKey = DEFAULT_GLOBAL_GEMINI_API_KEY;
  }

  // 2. Prepare Base64 Image
  let base64Data = '';
  let mimeType = 'image/jpeg';

  if (typeof fileOrBase64 === 'string') {
    if (fileOrBase64.startsWith('data:')) {
      const parts = fileOrBase64.split(';base64,');
      mimeType = parts[0].replace('data:', '') || 'image/jpeg';
      base64Data = parts[1];
    } else {
      base64Data = fileOrBase64;
    }
  } else {
    mimeType = fileOrBase64.type || 'image/jpeg';
    base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        const b64 = res.includes(';base64,') ? res.split(';base64,')[1] : res;
        resolve(b64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBase64);
    });
  }

  const prompt = `You are an expert timetable OCR and schedule parser.
Analyze this timetable schedule image table.
Extract:
1. The date mentioned in the header or table (e.g. '29/08/26' -> return as '29/08/2026').
2. All time slot headers (e.g. ['09.00-11.00', '11.15-1.15', '2.00-3.30', '3.30-5.00']).
3. All rows of classes / batches:
   - "class_name": (e.g. 'B1', 'B2', 'B3', 'A1', 'A2', 'PLUS ONE', etc.)
   - "slots": list of period values (e.g. teacher codes like 'MF', 'JSM', 'ARJ', 'IRD', or subject names, or 'Exam', or null if empty).
   - "extra_note": if any slot indicates an exam, improvement exam, special test, or session note (e.g. 'Maths Improvement', 'Phy Improvement', 'Exam', 'Botany Exam'), extract it here.

Return ONLY a valid JSON object matching this schema without markdown code blocks:
{
  "date": "DD/MM/YYYY",
  "time_slots": ["09.00-11.00", "11.15-1.15", "2.00-3.30", "3.30-5.00"],
  "classes": [
    {
      "class_name": "B1",
      "slots": ["MF", "JSM", "ARJ", "Maths Improvement"],
      "extra_note": "Maths Improvement"
    }
  ]
}`;

  const modelsToTry = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash', 'gemini-flash-latest'];
  let rawJsonText = '';
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model,
        contents: [
          { text: prompt },
          { inlineData: { data: base64Data, mimeType } }
        ]
      });

      if (response && response.text) {
        rawJsonText = response.text.trim();
        if (rawJsonText) break;
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  if (!rawJsonText) {
    throw new Error(`Failed to scan timetable image with Gemini: ${lastError?.message || 'Empty response'}`);
  }

  // Clean JSON markup
  if (rawJsonText.startsWith("```json")) rawJsonText = rawJsonText.substring(7);
  if (rawJsonText.startsWith("```")) rawJsonText = rawJsonText.substring(3);
  if (rawJsonText.endsWith("```")) rawJsonText = rawJsonText.substring(0, rawJsonText.length - 3);

  const parsed = JSON.parse(rawJsonText.trim());

  // 3. Format Date
  const rawDate = parsed.date || "";
  let dateStr = "";
  let isoDate = "";
  let dayName = "";

  if (rawDate) {
    const m = rawDate.match(/(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/);
    if (m) {
      const d = m[1].padStart(2, '0');
      const mo = m[2].padStart(2, '0');
      let yr = m[3];
      if (yr.length === 2) yr = "20" + yr;
      dateStr = `${d}/${mo}/${yr}`;
      isoDate = `${yr}-${mo}-${d}`;
      try {
        const dt = new Date(`${yr}-${mo}-${d}`);
        dayName = dt.toLocaleDateString('en-US', { weekday: 'long' });
      } catch (e) {}
    }
  }

  if (!dateStr) {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const mo = String(today.getMonth() + 1).padStart(2, '0');
    const yr = String(today.getFullYear());
    dateStr = `${d}/${mo}/${yr}`;
    isoDate = `${yr}-${mo}-${d}`;
    dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  }

  // 4. Format Timing
  const timeSlots: string[] = parsed.time_slots || [];
  let overallTime = "8.30.00 am – 5.00 pm";
  if (timeSlots && timeSlots.length >= 1) {
    const firstSlot = timeSlots[0].trim();
    const lastSlot = timeSlots[timeSlots.length - 1].trim();
    const startMatch = firstSlot.match(/(\d{1,2})[\.:](\d{2})/);
    const endMatch = lastSlot.match(/[\-–to]+\s*(\d{1,2})[\.:](\d{2})/);
    if (startMatch && endMatch) {
      let sh = parseInt(startMatch[1], 10);
      const sm = startMatch[2];
      if (sh === 89 || sh > 12) sh = 9; // Handle OCR typo '89.00' for 9.00
      const eh = parseInt(endMatch[1], 10);
      const em = endMatch[2];
      overallTime = `${sh}.${sm}.00 am – ${eh}.${em} pm`;
    }
  }

  // 5. Teacher Mappings Resolution
  const mappings = await getTeacherMappingsData();
  const knownUpper = ['PHYSICS', 'CHEMISTRY', 'MATHS', 'MATHEMATICS', 'BOTANY', 'ZOOLOGY', 'BIOLOGY', 'COMPUTER SCIENCE', 'ENGLISH'];
  const unmappedTeachers = new Set<string>();
  const processedClasses: ScannedClass[] = [];

  for (const rawClass of (parsed.classes || [])) {
    const cName = (rawClass.class_name || "CLASS").trim().toUpperCase();
    const slots: any[] = rawClass.slots || [];
    let extraNote = rawClass.extra_note || "";

    const classSubjects: ScannedSubject[] = [];
    for (let idx = 0; idx < slots.length; idx++) {
      const slot = slots[idx];
      if (!slot || !String(slot).trim()) continue;
      const slotStr = String(slot).trim();

      // Check if slot is an Exam or Improvement Note
      if (/(improvement|exam|test|session|revision|apt)/i.test(slotStr)) {
        if (!extraNote) extraNote = slotStr;
        continue;
      }

      const codeClean = slotStr.replace(/[\(\)]/g, '').trim().toUpperCase();
      let subjName = 'PENDING';
      let tCode = codeClean;

      if (knownUpper.includes(codeClean)) {
        subjName = codeClean;
        tCode = '';
      } else if (mappings[codeClean]) {
        subjName = mappings[codeClean];
        tCode = codeClean;
      } else {
        subjName = 'PENDING';
        tCode = codeClean;
        if (codeClean.length >= 2 && /^[A-Z]+$/.test(codeClean)) {
          unmappedTeachers.add(codeClean);
        }
      }

      const iconMeta = getAutoIconForSubject(subjName);
      classSubjects.push({
        id: idx + 1,
        name: subjName,
        teacher_code: tCode,
        color: classSubjects.length % 2 === 0 ? 'blue' : 'green',
        icon_type: iconMeta.icon_type,
        icon: iconMeta.icon
      });
    }

    processedClasses.push({
      class_name: cName,
      title: `${cName} - TIME TABLE`,
      time: overallTime,
      apt_exam: "",
      extra_note: extraNote,
      phone1: "9072651666",
      phone2: "9072652666",
      subjects: classSubjects
    });
  }

  return {
    success: true,
    date: dateStr,
    isoDate: isoDate,
    dayName: dayName,
    time: overallTime,
    time_slots: timeSlots,
    classes: processedClasses,
    unmapped_teachers: Array.from(unmappedTeachers).sort()
  };
}
