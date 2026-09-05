export interface ParsedClipboardSubject {
  id: number;
  name: string;
  teacher_code: string;
  color: 'blue' | 'green';
  icon_type: string;
  icon: string;
  slotTime?: string;
}

export interface ParsedClipboardClass {
  class_name: string;
  title: string;
  time: string;
  apt_exam: string;
  extra_note: string;
  phone1: string;
  phone2: string;
  subjects: ParsedClipboardSubject[];
}

export interface ParsedClipboardResult {
  success: boolean;
  error?: string;
  date: string;
  isoDate: string;
  dayName: string;
  time: string;
  timeSlots: string[];
  classes: ParsedClipboardClass[];
  unmappedTeachers: string[];
  rawRowCount: number;
}

const KNOWN_SUBJECTS_UPPER = [
  'PHYSICS', 'CHEMISTRY', 'MATHS', 'MATHEMATICS',
  'BOTANY', 'ZOOLOGY', 'BIOLOGY', 'COMPUTER SCIENCE', 'CS',
  'ENGLISH', 'MALAYALAM', 'HINDI', 'ARABIC', 'COMMERCE', 'ECONOMICS'
];

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

/**
 * Normalizes a single date token into DD/MM/YYYY and YYYY-MM-DD
 */
export function parseDateToken(rawToken: string): { dateStr: string; isoDate: string; dayName: string } | null {
  if (!rawToken) return null;
  const token = rawToken.trim();

  // 1. DD/MM/YY or DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = token.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);

    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }

    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      const dStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dt = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00Z`);
      const dayName = dt.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
      return { dateStr: dStr, isoDate: iso, dayName };
    }
  }

  // 2. YYYY-MM-DD
  const ymdMatch = token.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);

    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      const dStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
      const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dt = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00:00Z`);
      const dayName = dt.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
      return { dateStr: dStr, isoDate: iso, dayName };
    }
  }

  return null;
}

/**
 * Clean and normalize time slot string (e.g. "3.4.30" -> "3.00-4.30" or "9.00-10.45")
 */
export function normalizeTimeSlot(slotStr: string): string {
  let s = slotStr.trim();
  // Handle case like "3.4.30" -> "3.00 - 4.30"
  if (/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/.test(s)) {
    const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
    if (m) {
      return `${m[1]}.00 - ${m[2]}.${m[3]}`;
    }
  }
  return s.replace(/\s*-\s*/g, ' - ');
}

/**
 * Parses raw text copied from Excel / Sheets / text clipboard
 */
export function parseClipboardTimetable(
  rawText: string,
  teacherMappings: Record<string, string> = {}
): ParsedClipboardResult {
  if (!rawText || !rawText.trim()) {
    return {
      success: false,
      error: 'Clipboard text is empty.',
      date: '',
      isoDate: '',
      dayName: '',
      time: '',
      timeSlots: [],
      classes: [],
      unmappedTeachers: [],
      rawRowCount: 0
    };
  }

  // Split into lines
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) {
    return {
      success: false,
      error: 'No valid lines found in text.',
      date: '',
      isoDate: '',
      dayName: '',
      time: '',
      timeSlots: [],
      classes: [],
      unmappedTeachers: [],
      rawRowCount: 0
    };
  }

  // Helper to split line into columns (detecting tabs, commas, or multiple spaces)
  const splitLine = (line: string): string[] => {
    if (line.includes('\t')) {
      return line.split('\t').map(c => c.trim());
    }
    if (line.includes(',') && !line.includes('\t')) {
      return line.split(',').map(c => c.trim());
    }
    if (line.includes(';') && !line.includes('\t')) {
      return line.split(';').map(c => c.trim());
    }
    // Fallback to 2 or more spaces
    return line.split(/\s{2,}/).map(c => c.trim());
  };

  const firstRowCols = splitLine(lines[0]);
  let detectedDateStr = '';
  let detectedIsoDate = '';
  let detectedDayName = '';
  let timeSlots: string[] = [];

  // 1. Check if first column of first row is a Date
  const dateInfo = parseDateToken(firstRowCols[0]);
  if (dateInfo) {
    detectedDateStr = dateInfo.dateStr;
    detectedIsoDate = dateInfo.isoDate;
    detectedDayName = dateInfo.dayName;
    timeSlots = firstRowCols.slice(1).filter(Boolean).map(normalizeTimeSlot);
  } else {
    // If not a date, check subsequent cols for time slots
    timeSlots = firstRowCols.slice(1).filter(Boolean).map(normalizeTimeSlot);
  }

  // Fallback date if not detected
  if (!detectedDateStr) {
    const now = new Date();
    detectedDateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    detectedIsoDate = now.toISOString().split('T')[0];
    detectedDayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  }

  // Calculate default overall time from time slots
  let overallTime = '8.30.00 am – 5.00 pm';
  if (timeSlots.length >= 2) {
    const firstSlot = timeSlots[0];
    const lastSlot = timeSlots[timeSlots.length - 1];
    const startPart = firstSlot.split('-')[0]?.trim();
    const endPart = lastSlot.split('-')[1]?.trim() || lastSlot.split('-')[0]?.trim();
    if (startPart && endPart) {
      overallTime = `${startPart} am – ${endPart} pm`;
    }
  }

  const unmappedSet = new Set<string>();
  const parsedClasses: ParsedClipboardClass[] = [];

  // 2. Parse Class Rows (from line 1 onwards)
  for (let rIdx = 1; rIdx < lines.length; rIdx++) {
    const cols = splitLine(lines[rIdx]);
    if (cols.length === 0 || !cols[0]) continue;

    const className = cols[0].toUpperCase().trim();
    const slotCells = cols.slice(1);
    const classSubjects: ParsedClipboardSubject[] = [];
    let classExtraNote = '';

    for (let cIdx = 0; cIdx < slotCells.length; cIdx++) {
      const cell = slotCells[cIdx]?.trim();
      if (!cell) continue;

      const slotTime = timeSlots[cIdx] || '';

      // Check for extra notes like "MF & Exam", "AZ / Exam", "Exam"
      let teacherCode = cell;
      let slotNote = '';

      if (/(?:&|\/|\+|\band\b)\s*(?:exam|test|session|revision)/i.test(cell)) {
        const parts = cell.split(/(?:&|\/|\+|\band\b)/i);
        teacherCode = parts[0]?.trim() || '';
        slotNote = parts[1]?.trim() || 'Exam';
      } else if (/^(?:exam|test|revision|improvement)$/i.test(cell)) {
        teacherCode = '';
        slotNote = cell;
      }

      if (slotNote && !classExtraNote) {
        classExtraNote = slotNote;
      }

      const cleanCode = teacherCode.replace(/[\(\)]/g, '').trim().toUpperCase();
      let subjectName = 'PENDING';
      let finalTeacherCode = cleanCode;

      if (!cleanCode) {
        // Pure note or exam slot
        subjectName = (slotNote || 'EXAM').toUpperCase();
        finalTeacherCode = '';
      } else if (KNOWN_SUBJECTS_UPPER.includes(cleanCode)) {
        subjectName = cleanCode;
        finalTeacherCode = '';
      } else if (teacherMappings[cleanCode]) {
        subjectName = teacherMappings[cleanCode];
        finalTeacherCode = cleanCode;
      } else {
        subjectName = 'PENDING';
        finalTeacherCode = cleanCode;
        if (cleanCode.length >= 2 && /^[A-Z0-9]+$/.test(cleanCode)) {
          unmappedSet.add(cleanCode);
        }
      }

      const autoIcon = getAutoIconForSubject(subjectName);
      const color: 'blue' | 'green' = classSubjects.length % 2 === 0 ? 'blue' : 'green';

      classSubjects.push({
        id: cIdx + 1,
        name: subjectName,
        teacher_code: finalTeacherCode,
        color,
        icon_type: autoIcon.icon_type,
        icon: autoIcon.icon,
        slotTime
      });
    }

    parsedClasses.push({
      class_name: className,
      title: `${className} - TIME TABLE`,
      time: overallTime,
      apt_exam: '',
      extra_note: classExtraNote,
      phone1: '9072651666',
      phone2: '9072652666',
      subjects: classSubjects
    });
  }

  return {
    success: parsedClasses.length > 0,
    error: parsedClasses.length === 0 ? 'No class rows detected. Please check the clipboard table format.' : undefined,
    date: detectedDateStr,
    isoDate: detectedIsoDate,
    dayName: detectedDayName,
    time: overallTime,
    timeSlots,
    classes: parsedClasses,
    unmappedTeachers: Array.from(unmappedSet).sort(),
    rawRowCount: lines.length
  };
}
