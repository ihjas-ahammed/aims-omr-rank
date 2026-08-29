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
  usedModel?: string;
  usedKeyType?: 'custom' | 'global';
}

export interface TimetableAiConfig {
  customApiKey: string;
  customModel: string;
  useCustomAsPrimary: boolean;
}

export interface ScanTimetableOptions {
  customApiKey?: string;
  customModel?: string;
  useCustomAsPrimary?: boolean;
}

export const TIMETABLE_CUSTOM_API_KEY_STORAGE = 'aims_timetable_custom_api_key';
export const TIMETABLE_CUSTOM_MODEL_STORAGE = 'aims_timetable_custom_model';
export const TIMETABLE_USE_CUSTOM_PRIMARY_STORAGE = 'aims_timetable_use_custom_as_primary';

export const DEFAULT_TIMETABLE_PRIMARY_MODEL = 'gemini-2.5-flash';

export const PRESET_TIMETABLE_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Fast & highly accurate table extraction (Recommended)' },
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', desc: 'Ultra-fast, lowest latency' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Standard production vision model' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', desc: 'Lightweight multimodal OCR' },
  { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite Latest', desc: 'Latest Flash Lite alias' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'Deep reasoning capability' },
  { id: 'gemini-3.1-flash-preview', name: 'Gemini 3.1 Flash Preview', desc: 'Preview high-performance model' }
];

export const FALLBACK_TIMETABLE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-pro'
];

/**
 * Get current Timetable AI configuration from local storage
 */
export function getTimetableAiConfig(): TimetableAiConfig {
  const customApiKey = (localStorage.getItem(TIMETABLE_CUSTOM_API_KEY_STORAGE) || '').trim();
  const customModel = (localStorage.getItem(TIMETABLE_CUSTOM_MODEL_STORAGE) || DEFAULT_TIMETABLE_PRIMARY_MODEL).trim();
  const storedPrimary = localStorage.getItem(TIMETABLE_USE_CUSTOM_PRIMARY_STORAGE);

  // Default to true if not explicitly set
  const useCustomAsPrimary = storedPrimary === null ? true : storedPrimary === 'true';

  return {
    customApiKey,
    customModel: customModel || DEFAULT_TIMETABLE_PRIMARY_MODEL,
    useCustomAsPrimary
  };
}

/**
 * Save Timetable AI configuration to local storage
 */
export function saveTimetableAiConfig(config: Partial<TimetableAiConfig>): void {
  if (config.customApiKey !== undefined) {
    localStorage.setItem(TIMETABLE_CUSTOM_API_KEY_STORAGE, config.customApiKey.trim());
  }
  if (config.customModel !== undefined) {
    localStorage.setItem(TIMETABLE_CUSTOM_MODEL_STORAGE, config.customModel.trim());
  }
  if (config.useCustomAsPrimary !== undefined) {
    localStorage.setItem(TIMETABLE_USE_CUSTOM_PRIMARY_STORAGE, String(config.useCustomAsPrimary));
  }
}

/**
 * Fetch available Gemini models from Google API using the given key
 */
export async function fetchTimetableGeminiModels(apiKey: string): Promise<string[]> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('Please provide an API key to fetch models.');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch models from Gemini API.');
  }

  if (data.models && Array.isArray(data.models)) {
    const names = data.models
      .map((m: any) => (m.name || '').replace('models/', ''))
      .filter((name: string) => typeof name === 'string' && name.toLowerCase().includes('gemini'));
    return (Array.from(new Set(names)) as string[]).sort();
  }


  throw new Error('No Gemini models returned for this API key.');
}

/**
 * Test connectivity for an API key and model
 */
export async function testGeminiApiKeyAndModel(
  apiKey: string,
  modelName: string = DEFAULT_TIMETABLE_PRIMARY_MODEL
): Promise<{ success: boolean; message: string }> {
  try {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      return { success: false, message: 'API key cannot be empty.' };
    }
    const cleanModel = modelName.trim() || DEFAULT_TIMETABLE_PRIMARY_MODEL;
    const ai = new GoogleGenAI({ apiKey: cleanKey });
    const response = await ai.models.generateContent({
      model: cleanModel,
      contents: 'Ping test. Reply with word OK.'
    });

    if (response && response.text) {
      return { success: true, message: `Connected successfully using ${cleanModel}!` };
    }
    return { success: false, message: 'No response received from Gemini API.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection test failed.' };
  }
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
  optionsOrKey?: string | ScanTimetableOptions
): Promise<ScanTimetableResult> {
  // 1. Resolve Config Options
  const storedConfig = getTimetableAiConfig();
  let customApiKey = '';
  let customModel = '';
  let useCustomAsPrimary = true;

  if (typeof optionsOrKey === 'string') {
    customApiKey = optionsOrKey;
    customModel = storedConfig.customModel;
    useCustomAsPrimary = storedConfig.useCustomAsPrimary;
  } else if (optionsOrKey && typeof optionsOrKey === 'object') {
    customApiKey = optionsOrKey.customApiKey !== undefined ? optionsOrKey.customApiKey : storedConfig.customApiKey;
    customModel = optionsOrKey.customModel !== undefined ? optionsOrKey.customModel : storedConfig.customModel;
    useCustomAsPrimary = optionsOrKey.useCustomAsPrimary !== undefined ? optionsOrKey.useCustomAsPrimary : storedConfig.useCustomAsPrimary;
  } else {
    customApiKey = storedConfig.customApiKey;
    customModel = storedConfig.customModel;
    useCustomAsPrimary = storedConfig.useCustomAsPrimary;
  }

  // 2. Resolve Global Backup Key
  const globalKey = await getGlobalAiApiKey();

  // 3. Build Key Resolution Queue
  // If useCustomAsPrimary is true and customApiKey is non-empty, custom key is primary!
  interface KeyCandidate {
    key: string;
    type: 'custom' | 'global';
  }

  const keyCandidates: KeyCandidate[] = [];
  const cleanCustomKey = (customApiKey || '').trim();
  const cleanGlobalKey = (globalKey || '').trim() || DEFAULT_GLOBAL_GEMINI_API_KEY;

  if (useCustomAsPrimary && cleanCustomKey && !LEAKED_BLOCKED_KEYS.includes(cleanCustomKey)) {
    keyCandidates.push({ key: cleanCustomKey, type: 'custom' });
    if (cleanGlobalKey && cleanGlobalKey !== cleanCustomKey && !LEAKED_BLOCKED_KEYS.includes(cleanGlobalKey)) {
      keyCandidates.push({ key: cleanGlobalKey, type: 'global' });
    }
  } else {
    if (cleanGlobalKey && !LEAKED_BLOCKED_KEYS.includes(cleanGlobalKey)) {
      keyCandidates.push({ key: cleanGlobalKey, type: 'global' });
    }
    if (cleanCustomKey && cleanCustomKey !== cleanGlobalKey && !LEAKED_BLOCKED_KEYS.includes(cleanCustomKey)) {
      keyCandidates.push({ key: cleanCustomKey, type: 'custom' });
    }
  }

  // Fallback default if candidates empty
  if (keyCandidates.length === 0) {
    keyCandidates.push({ key: DEFAULT_GLOBAL_GEMINI_API_KEY, type: 'global' });
  }

  // 4. Build Model Priority Sequence
  // The primary model (chosen custom model) is placed first!
  const targetPrimaryModel = (customModel || DEFAULT_TIMETABLE_PRIMARY_MODEL).trim();
  const modelsToTry: string[] = [
    targetPrimaryModel,
    ...FALLBACK_TIMETABLE_MODELS.filter(m => m !== targetPrimaryModel)
  ];

  // 5. Prepare Base64 Image
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

  let rawJsonText = '';
  let lastError: any = null;
  let usedModelName = '';
  let usedKeyType: 'custom' | 'global' = 'global';

  // 6. Execute AI Generation with Priority Queue
  keyLoop: for (const keyCandidate of keyCandidates) {
    for (const model of modelsToTry) {
      try {
        const ai = new GoogleGenAI({ apiKey: keyCandidate.key });
        const response = await ai.models.generateContent({
          model,
          contents: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType } }
          ]
        });

        if (response && response.text) {
          rawJsonText = response.text.trim();
          if (rawJsonText) {
            usedModelName = model;
            usedKeyType = keyCandidate.type;
            break keyLoop;
          }
        }
      } catch (err: any) {
        lastError = err;
      }
    }
  }

  if (!rawJsonText) {
    throw new Error(`Failed to scan timetable image with Gemini (${usedModelName || targetPrimaryModel}): ${lastError?.message || 'Empty response'}`);
  }

  // Clean JSON markup
  if (rawJsonText.startsWith("```json")) rawJsonText = rawJsonText.substring(7);
  if (rawJsonText.startsWith("```")) rawJsonText = rawJsonText.substring(3);
  if (rawJsonText.endsWith("```")) rawJsonText = rawJsonText.substring(0, rawJsonText.length - 3);

  const parsed = JSON.parse(rawJsonText.trim());

  // 7. Format Date
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

  // 8. Format Timing
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

  // 9. Teacher Mappings Resolution
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
    unmapped_teachers: Array.from(unmappedTeachers).sort(),
    usedModel: usedModelName,
    usedKeyType
  };
}

