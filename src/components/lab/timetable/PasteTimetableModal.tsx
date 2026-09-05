import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, ClipboardPaste, FileSpreadsheet, Check, AlertTriangle, 
  Calendar, Clock, BookOpen, Sparkles, ArrowRight, RotateCcw,
  Layers, Plus
} from 'lucide-react';
import { 
  parseClipboardTimetable, 
  ParsedClipboardResult, 
  ParsedClipboardClass 
} from '../../../utils/timetableClipboardParser';
import { saveTeacherMappingsData } from '../../../services/firebaseService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teacherMappings: Record<string, string>;
  onUpdateMappings: (mappings: Record<string, string>) => void;
  onImport: (dayData: {
    date: string;
    isoDate: string;
    dayName: string;
    classes: any[];
  }) => void;
}

const COMMON_SUBJECTS = [
  'PHYSICS', 'CHEMISTRY', 'MATHS', 'BOTANY', 'ZOOLOGY', 'COMPUTER SCIENCE', 'ENGLISH'
];

const APT_CHIPS = ['Zoology', 'Botany', 'CS', 'Maths', 'Physics', 'Chemistry'];

const EXAMPLE_CLIPBOARD_TEXT = `30/08/26\t9.00-10.45\t11.00-12.45\t1.30-3.00\t3.4.30
A1\tARJ\tJS\tMF & Exam\tAZ
A2\tAZ\tMF\tAZ\tJS`;

export const PasteTimetableModal: React.FC<Props> = ({
  isOpen,
  onClose,
  teacherMappings,
  onUpdateMappings,
  onImport
}) => {
  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<ParsedClipboardResult | null>(null);

  // Editable Date & Time overrides
  const [customIsoDate, setCustomIsoDate] = useState('');
  const [customOverallTime, setCustomOverallTime] = useState('');
  const [classAptExams, setClassAptExams] = useState<Record<string, string>>({});
  const [bulkAptInput, setBulkAptInput] = useState('');

  // Unmapped teacher resolution
  const [unmappedSelections, setUnmappedSelections] = useState<Record<string, string>>({});
  const [saveMappingsChecked, setSaveMappingsChecked] = useState(true);

  // Clipboard read feedback
  const [clipboardNotice, setClipboardNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Auto-try clipboard read if empty
      if (!rawText.trim()) {
        tryAutoReadClipboard();
      }
    }
  }, [isOpen]);

  const tryAutoReadClipboard = async () => {
    if (!navigator.clipboard?.readText) return;
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim() && (text.includes('\t') || text.includes('-') || text.includes('/'))) {
        setRawText(text);
        setClipboardNotice('Pasted text from clipboard automatically!');
        setTimeout(() => setClipboardNotice(null), 3000);
      }
    } catch {
      // Clipboard read permission might be denied, user can paste with Ctrl+V
    }
  };

  // Re-parse whenever rawText or teacherMappings change
  useEffect(() => {
    if (!rawText.trim()) {
      setParsed(null);
      return;
    }

    const currentMappings = { ...teacherMappings, ...unmappedSelections };
    const res = parseClipboardTimetable(rawText, currentMappings);
    setParsed(res);

    if (res.success) {
      if (!customIsoDate || customIsoDate !== res.isoDate) {
        setCustomIsoDate(res.isoDate);
      }
      if (!customOverallTime || customOverallTime === '8.30.00 am – 5.00 pm') {
        setCustomOverallTime(res.time);
      }

      // Pre-fill unmapped selections if any new ones
      setUnmappedSelections(prev => {
        const next = { ...prev };
        res.unmappedTeachers.forEach(t => {
          if (!next[t]) next[t] = 'PHYSICS';
        });
        return next;
      });
    }
  }, [rawText, teacherMappings]);

  // Derived effective date & day name
  const { effectiveDateStr, effectiveIsoDate, effectiveDayName } = useMemo(() => {
    if (!customIsoDate) {
      const now = new Date();
      const dStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      return {
        effectiveDateStr: parsed?.date || dStr,
        effectiveIsoDate: now.toISOString().split('T')[0],
        effectiveDayName: parsed?.dayName || now.toLocaleDateString('en-US', { weekday: 'long' })
      };
    }
    const [y, m, d] = customIsoDate.split('-');
    const dt = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    const dStr = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
    const dayName = dt.toLocaleDateString('en-US', { weekday: 'long' });
    return {
      effectiveDateStr: dStr,
      effectiveIsoDate: customIsoDate,
      effectiveDayName: dayName
    };
  }, [customIsoDate, parsed]);

  if (!isOpen) return null;

  // Handle direct manual paste button click
  const handleManualPasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard?.readText) {
        alert('Clipboard reading is not supported by your browser. Please press Ctrl+V / Cmd+V in the text box below.');
        return;
      }
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        alert('Clipboard is empty. Copy cells from Excel or Sheets first, then click paste.');
        return;
      }
      setRawText(text);
      setClipboardNotice('Pasted text from clipboard successfully!');
      setTimeout(() => setClipboardNotice(null), 3000);
    } catch (e: any) {
      alert('Could not access clipboard directly: ' + (e?.message || 'Permission denied. Please paste directly into the box with Ctrl+V.'));
    }
  };

  // Bulk Apply APT
  const handleApplyBulkAptToAll = (val: string) => {
    setBulkAptInput(val);
    if (!parsed?.classes) return;
    const updated: Record<string, string> = {};
    parsed.classes.forEach(c => {
      updated[c.class_name] = val;
    });
    setClassAptExams(updated);
  };

  const handleToggleBulkAptChip = (subj: string) => {
    const list = bulkAptInput.split(',').map(s => s.trim()).filter(Boolean);
    let updated: string[];
    if (list.includes(subj)) {
      updated = list.filter(s => s !== subj);
    } else {
      updated = [...list, subj];
    }
    handleApplyBulkAptToAll(updated.join(', '));
  };

  const handleToggleClassApt = (className: string, subj: string) => {
    const current = classAptExams[className] || '';
    const list = current.split(',').map(s => s.trim()).filter(Boolean);
    let updated: string[];
    if (list.includes(subj)) {
      updated = list.filter(s => s !== subj);
    } else {
      updated = [...list, subj];
    }
    setClassAptExams(prev => ({
      ...prev,
      [className]: updated.join(', ')
    }));
  };

  const handleConfirmImport = async () => {
    if (!parsed || !parsed.classes || parsed.classes.length === 0) return;

    // 1. Save new mappings if any
    const newMappings = { ...teacherMappings, ...unmappedSelections };
    if (saveMappingsChecked && Object.keys(unmappedSelections).length > 0) {
      await saveTeacherMappingsData(newMappings);
      onUpdateMappings(newMappings);
    }

    // 2. Resolve subjects and classwise APT exams
    const finalClasses = parsed.classes.map(c => {
      const resolvedSubjects = c.subjects.map(s => {
        let name = s.name;
        if ((name === 'PENDING' || !name) && s.teacher_code && newMappings[s.teacher_code]) {
          name = newMappings[s.teacher_code];
        }
        return {
          ...s,
          name
        };
      });

      const chosenApt = classAptExams[c.class_name] !== undefined
        ? classAptExams[c.class_name]
        : (c.apt_exam || '');

      return {
        ...c,
        title: `${c.class_name} - TIME TABLE`,
        time: customOverallTime || c.time,
        apt_exam: chosenApt,
        subjects: resolvedSubjects
      };
    });

    onImport({
      date: effectiveDateStr,
      isoDate: effectiveIsoDate,
      dayName: effectiveDayName,
      classes: finalClasses
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-300 shadow-2xl max-w-4xl w-full my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-[#062e5b] text-white flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#062e5b] flex items-center gap-2">
                Paste Excel Timetable (Direct / No AI)
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Instant 0s
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Copy cells directly from Excel, Google Sheets, or WhatsApp text and paste below.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-100 p-2.5 border border-slate-200">
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualPasteFromClipboard}
                className="px-3 py-1.5 font-bold bg-[#062e5b] text-white hover:bg-[#0d427d] flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                Paste from Clipboard
              </button>

              <button
                onClick={() => setRawText(EXAMPLE_CLIPBOARD_TEXT)}
                className="px-3 py-1.5 font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 flex items-center gap-1 transition-colors"
              >
                Load Example
              </button>

              {rawText && (
                <button
                  onClick={() => setRawText('')}
                  className="px-2.5 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {clipboardNotice && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 border border-emerald-200 flex items-center gap-1 animate-pulse">
                <Check className="w-3 h-3 text-emerald-600" /> {clipboardNotice}
              </span>
            )}
          </div>

          {/* Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <span>Pasted Text / Table Data</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (Supports Tab-separated Excel copy, comma, or space-separated rows)
                </span>
              </label>
              {parsed && parsed.success && (
                <span className="text-[11px] font-bold text-emerald-700">
                  ✔ Detected {parsed.classes.length} {parsed.classes.length === 1 ? 'class' : 'classes'}, {parsed.timeSlots.length} time slots
                </span>
              )}
            </div>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Example:\n30/08/26    9.00-10.45    11.00-12.45    1.30-3.00    3.4.30\nA1    ARJ    JS    MF & Exam    AZ\nA2    AZ    MF    AZ    JS`}
              className="w-full font-mono text-[11px] bg-slate-50 border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:border-[#062e5b] resize-y"
            />
          </div>

          {/* Live Parsed Preview */}
          {parsed && parsed.success && (
            <div className="space-y-4 border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h4 className="font-black text-xs text-[#062e5b] uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#78b82a]" /> Parsed Schedule Preview
                </h4>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-[#062e5b]" />
                  <span>{effectiveDayName} ({effectiveDateStr})</span>
                </div>
              </div>

              {/* Schedule Metadata Overrides */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-3 border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Schedule Date
                  </label>
                  <input
                    type="date"
                    value={effectiveIsoDate}
                    onChange={(e) => setCustomIsoDate(e.target.value)}
                    className="w-full p-1.5 text-xs bg-white border border-slate-300 font-bold text-slate-900 focus:border-[#062e5b] focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-500 mt-1 font-semibold">
                    {effectiveDayName} • {effectiveDateStr}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Overall Timing Label
                  </label>
                  <input
                    type="text"
                    value={customOverallTime}
                    onChange={(e) => setCustomOverallTime(e.target.value)}
                    placeholder="8.30.00 am – 5.00 pm"
                    className="w-full p-1.5 text-xs bg-white border border-slate-300 font-bold text-slate-900 focus:border-[#062e5b] focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-500 mt-1">
                    Appears in poster card header
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Time Slots ({parsed.timeSlots.length})
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {parsed.timeSlots.map((ts, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-bold">
                        {ts}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bulk Apply APT Bar */}
              <div className="bg-amber-50/60 border border-amber-200 p-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-[#062e5b] text-xs">Bulk APT Exam to All Classes:</span>
                    <span className="text-[10px] text-slate-500 font-medium">(Fast One-Click Apply)</span>
                  </div>
                  <input
                    type="text"
                    value={bulkAptInput}
                    onChange={(e) => handleApplyBulkAptToAll(e.target.value)}
                    placeholder="e.g. Zoology, Botany, CS"
                    className="p-1 px-2 text-xs bg-white border border-amber-300 w-full sm:w-64 font-bold text-slate-800 focus:border-[#062e5b] focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {APT_CHIPS.map(subj => {
                    const isSelected = bulkAptInput.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => handleToggleBulkAptChip(subj)}
                        className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${
                          isSelected
                            ? 'bg-[#062e5b] text-white border border-[#062e5b]'
                            : 'bg-white text-slate-700 border border-slate-300 hover:border-amber-400'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Unmapped Teachers Warning (if any) */}
              {parsed.unmappedTeachers.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Unmapped Teacher Codes Found ({parsed.unmappedTeachers.length})</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Assign these teacher codes to their subject. They will automatically populate in the timetable cards.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                    {parsed.unmappedTeachers.map(code => (
                      <div key={code} className="flex items-center gap-2 bg-white p-2 border border-amber-200">
                        <span className="font-mono font-black text-slate-900 w-12">{code}:</span>
                        <select
                          value={unmappedSelections[code] || 'PHYSICS'}
                          onChange={(e) => {
                            const subj = e.target.value;
                            setUnmappedSelections(prev => ({ ...prev, [code]: subj }));
                          }}
                          className="flex-1 p-1 text-xs border border-slate-300 bg-slate-50 font-bold focus:border-[#062e5b]"
                        >
                          {COMMON_SUBJECTS.map(subj => (
                            <option key={subj} value={subj}>{subj}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={saveMappingsChecked}
                      onChange={(e) => setSaveMappingsChecked(e.target.checked)}
                      className="rounded-none border-slate-300 text-[#062e5b] focus:ring-[#062e5b]"
                    />
                    <span>Save newly mapped teachers to database for future timetables</span>
                  </label>
                </div>
              )}

              {/* Classes Preview Cards */}
              <div>
                <h5 className="font-black text-slate-700 mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#062e5b]" />
                  <span>Detected Classes ({parsed.classes.length})</span>
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {parsed.classes.map((cls, idx) => {
                    const aptForClass = classAptExams[cls.class_name] || '';
                    return (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 bg-[#062e5b] text-white font-black text-xs">
                            {cls.class_name}
                          </span>
                          {cls.extra_note && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 font-extrabold text-[10px] border border-red-200">
                              ★ {cls.extra_note}
                            </span>
                          )}
                        </div>

                        {/* Subjects */}
                        <div className="flex flex-wrap gap-1">
                          {cls.subjects.map((s, sIdx) => {
                            const isGreen = s.color === 'green';
                            const effectiveSubjectName = s.name === 'PENDING' && s.teacher_code && unmappedSelections[s.teacher_code]
                              ? unmappedSelections[s.teacher_code]
                              : s.name;
                            return (
                              <span
                                key={sIdx}
                                className={`px-1.5 py-0.5 text-[10px] font-bold border ${
                                  isGreen
                                    ? 'bg-[#78b82a]/15 text-[#5c921c] border-[#78b82a]/30'
                                    : 'bg-[#062e5b]/10 text-[#062e5b] border-[#062e5b]/20'
                                }`}
                              >
                                {effectiveSubjectName} {s.teacher_code ? `(${s.teacher_code})` : ''}
                              </span>
                            );
                          })}
                        </div>

                        {/* Class APT Exam Row */}
                        <div className="pt-1 border-t border-slate-200">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-bold text-slate-500">APT Exam:</span>
                            <input
                              type="text"
                              value={aptForClass}
                              onChange={(e) => {
                                const val = e.target.value;
                                setClassAptExams(prev => ({ ...prev, [cls.class_name]: val }));
                              }}
                              placeholder="e.g. Zoology, Botany, CS"
                              className="p-1 px-1.5 text-[10px] bg-white border border-slate-300 font-bold text-slate-800 w-44 focus:border-[#062e5b] focus:outline-none"
                            />
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {APT_CHIPS.map(chip => {
                              const isSel = aptForClass.includes(chip);
                              return (
                                <button
                                  key={chip}
                                  type="button"
                                  onClick={() => handleToggleClassApt(cls.class_name, chip)}
                                  className={`px-1.5 py-0.2 text-[9px] font-bold ${
                                    isSel
                                      ? 'bg-[#062e5b] text-white'
                                      : 'bg-white text-slate-600 border border-slate-300 hover:border-slate-400'
                                  }`}
                                >
                                  {isSel ? '✓' : '+'} {chip}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {parsed && !parsed.success && rawText && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{parsed.error || 'Could not parse timetable text. Please check format.'}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={!parsed || !parsed.success || !parsed.classes || parsed.classes.length === 0}
            className="px-5 py-2 font-black bg-[#062e5b] text-white hover:bg-[#0d427d] disabled:opacity-40 flex items-center gap-2 transition-colors shadow-sm"
          >
            <span>Import Schedule ({parsed?.classes?.length || 0} Classes)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
