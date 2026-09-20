import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calendar, Clock, Plus, Trash2, Share2, Download, Copy, Check, CheckCircle2,
  ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Sliders, X, Search, FileText,
  Layers, Zap, BookOpen, UserPlus, Save, AlertCircle, Sparkles, RefreshCw, Archive
} from 'lucide-react';
import { PosterCardPreview, PosterSubject } from './PosterCardPreview';
import { 
  downloadTimetableCardImage, 
  shareTimetableCardImage, 
  copyTimetableCardToClipboard, 
  createTimetableZipArchive,
  captureTimetableCardBlob 
} from '../../../utils/timetableCardExport';
import { getAutoIconForSubject } from '../../../services/timetableAiService';

export interface QuickClassConfig {
  className: string;
  time: string;
  subjects: PosterSubject[];
  hasAptExam: boolean;
  aptExamSubjects: string[];
  aptExamText: string;
  remarks: string;
}

interface Props {
  onBack: () => void;
  days: any[];
  teacherMappings: Record<string, string>;
  onUpdateTeacherMappings: (newMappings: Record<string, string>) => void;
  onSaveQuickTimetables: (
    dateStr: string,
    isoDate: string,
    dayName: string,
    classes: any[]
  ) => Promise<void> | void;
}

// Preset standard classes
const STANDARD_CLASSES = [
  'A1', 'A2', 'B1', 'B2', 'B3', 'B4', 'CS', 'NON-MATHS', 'PLUS ONE', 'PLUS TWO'
];

// Preset subjects
const SUBJECT_OPTIONS = [
  { name: 'PHYSICS', defaultCode: 'JN', color: 'blue' as const },
  { name: 'CHEMISTRY', defaultCode: 'CY', color: 'green' as const },
  { name: 'MATHS', defaultCode: 'MRS', color: 'blue' as const },
  { name: 'BOTANY', defaultCode: 'JS', color: 'green' as const },
  { name: 'ZOOLOGY', defaultCode: 'AZ', color: 'blue' as const },
  { name: 'COMPUTER SCIENCE', defaultCode: 'CS', color: 'green' as const },
  { name: 'ENGLISH', defaultCode: 'ENG', color: 'blue' as const }
];

const APT_SUBJECT_CHIPS = [
  'Botany', 'Zoology', 'Physics', 'Chemistry', 'Maths', 'CS'
];

const REMARKS_PRESETS = [
  'Special Test',
  'NEET Model Exam',
  'Bring Lab Record',
  'Revision Class',
  'Improvement Exam',
  'Arrival by 8:45 AM'
];

const TIME_PRESETS = [
  '09:00 AM – 04:30 PM',
  '08:30 AM – 05:00 PM',
  '09:00 AM – 01:00 PM',
  '01:30 PM – 05:00 PM'
];

/**
 * Custom Dropdown View for selecting teacher codes and adding new teachers dynamically.
 * Renders an interactive popover card rather than a native <select> input.
 */
interface TeacherDropdownViewProps {
  currentCode: string;
  subjectName: string;
  teacherMappings: Record<string, string>;
  onSelect: (code: string) => void;
  onAddNewTeacher: (code: string, subject: string) => void;
  onClose: () => void;
}

const TeacherDropdownView: React.FC<TeacherDropdownViewProps> = ({
  currentCode,
  subjectName,
  teacherMappings,
  onSelect,
  onAddNewTeacher,
  onClose
}) => {
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newSubj, setNewSubj] = useState(subjectName || 'PHYSICS');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Group mappings: matching this subject vs others
  const { matched, others } = useMemo(() => {
    const sNorm = subjectName.trim().toUpperCase();
    const mList: Array<{ code: string; subj: string }> = [];
    const oList: Array<{ code: string; subj: string }> = [];

    const q = search.trim().toUpperCase();
    Object.entries(teacherMappings).forEach(([code, subj]) => {
      const codeUp = code.toUpperCase();
      const subjUp = String(subj).toUpperCase();
      if (q && !codeUp.includes(q) && !subjUp.includes(q)) return;

      const isSubjMatch = (
        (sNorm.includes('PHYS') && subjUp.includes('PHYS')) ||
        (sNorm.includes('CHEM') && subjUp.includes('CHEM')) ||
        (sNorm.includes('MATH') && subjUp.includes('MATH')) ||
        (sNorm.includes('BOTAN') && subjUp.includes('BOTAN')) ||
        (sNorm.includes('ZOO') && subjUp.includes('ZOO')) ||
        (sNorm.includes('COMP') && (subjUp.includes('COMP') || subjUp.includes('CS'))) ||
        sNorm === subjUp
      );

      if (isSubjMatch) {
        mList.push({ code, subj });
      } else {
        oList.push({ code, subj });
      }
    });

    return { matched: mList, others: oList };
  }, [teacherMappings, subjectName, search]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    const cleanCode = newCode.trim().toUpperCase();
    const cleanSubj = newSubj.trim().toUpperCase() || subjectName;
    onAddNewTeacher(cleanCode, cleanSubj);
    onSelect(cleanCode);
  };

  return (
    <div 
      ref={modalRef}
      className="absolute right-0 top-full mt-1 w-72 sm:w-80 bg-white border border-slate-300 rounded-xl shadow-2xl z-50 p-3 text-slate-800 animate-in fade-in zoom-in-95 duration-100"
      style={{ minWidth: '260px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-800">Assign Teacher Code</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded">
            {subjectName}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-2">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter code or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#062e5b] focus:bg-white"
          autoFocus
        />
      </div>

      {/* Teachers List */}
      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {/* Recommended for this subject */}
        {matched.length > 0 && (
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
              Suggested for {subjectName}
            </div>
            <div className="grid grid-cols-2 gap-1">
              {matched.map(({ code, subj }) => {
                const isSelected = currentCode.toUpperCase() === code.toUpperCase();
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => onSelect(code)}
                    className={`flex items-center justify-between px-2 py-1.5 text-xs rounded-lg font-bold border transition-all text-left ${
                      isSelected
                        ? 'bg-[#062e5b] text-white border-[#062e5b]'
                        : 'bg-blue-50/70 hover:bg-blue-100/80 text-blue-950 border-blue-200/80'
                    }`}
                  >
                    <span>{code}</span>
                    <span className={`text-[10px] font-normal truncate max-w-[80px] ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      {subj}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Other teachers */}
        {others.length > 0 && (
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
              All Teachers
            </div>
            <div className="grid grid-cols-2 gap-1">
              {others.map(({ code, subj }) => {
                const isSelected = currentCode.toUpperCase() === code.toUpperCase();
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => onSelect(code)}
                    className={`flex items-center justify-between px-2 py-1.5 text-xs rounded-lg font-medium border transition-all text-left ${
                      isSelected
                        ? 'bg-[#062e5b] text-white border-[#062e5b]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <span className="font-bold">{code}</span>
                    <span className={`text-[10px] truncate max-w-[70px] ${isSelected ? 'text-slate-200' : 'text-slate-400'}`}>
                      {subj}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {matched.length === 0 && others.length === 0 && (
          <div className="text-center py-4 text-xs text-slate-400">
            No teacher codes match &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      {/* Action Footer: Clear or Add New */}
      <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onSelect('')}
          className="text-[11px] font-medium text-slate-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
        >
          No Teacher
        </button>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-[11px] font-bold text-[#062e5b] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Inline Add New Teacher Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="mt-2 pt-2 border-t border-slate-200 space-y-2 bg-slate-50 p-2 rounded-lg">
          <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5 text-blue-600" />
            <span>Create & Add New Teacher Code</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Code</label>
              <input
                type="text"
                placeholder="e.g. NSR"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                className="w-full px-2 py-1 text-xs font-bold uppercase bg-white border border-slate-300 rounded focus:outline-none focus:border-[#062e5b]"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-0.5">Subject</label>
              <input
                type="text"
                placeholder="e.g. PHYSICS"
                value={newSubj}
                onChange={(e) => setNewSubj(e.target.value.toUpperCase())}
                className="w-full px-2 py-1 text-xs uppercase bg-white border border-slate-300 rounded focus:outline-none focus:border-[#062e5b]"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-[10px] px-2 py-1 text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newCode.trim()}
              className="text-[10px] font-bold px-3 py-1 bg-[#062e5b] text-white rounded hover:bg-[#0d427d] disabled:opacity-50"
            >
              Add & Assign
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export const QuickTimetableCreate: React.FC<Props> = ({
  onBack,
  days,
  teacherMappings,
  onUpdateTeacherMappings,
  onSaveQuickTimetables
}) => {
  // Step State: 1 = Select Classes & Date/Time, 2 = Configure All in Scroll View, 3 = Final View & Share
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Auto-set Date to Tomorrow
  const defaultDateData = useMemo(() => {
    const tm = new Date();
    tm.setDate(tm.getDate() + 1);
    const dStr = `${String(tm.getDate()).padStart(2, '0')}/${String(tm.getMonth() + 1).padStart(2, '0')}/${tm.getFullYear()}`;
    const isoStr = tm.toISOString().split('T')[0];
    const dayName = tm.toLocaleDateString('en-US', { weekday: 'long' });
    return { dateStr: dStr, isoStr, dayName };
  }, []);

  const [dateStr, setDateStr] = useState<string>(defaultDateData.dateStr);
  const [isoDate, setIsoDate] = useState<string>(defaultDateData.isoStr);
  const [dayName, setDayName] = useState<string>(defaultDateData.dayName);

  // Auto-set Time to 9:00 AM to 4:30 PM
  const [commonTime, setCommonTime] = useState<string>('09:00 AM – 04:30 PM');

  // Selected Classes List in Step 1
  const [selectedClasses, setSelectedClasses] = useState<string[]>(['A1', 'A2', 'B1', 'B2', 'B3']);
  const [customClassInput, setCustomClassInput] = useState<string>('');

  // Class Configurations for Step 2
  const [classConfigs, setClassConfigs] = useState<Record<string, QuickClassConfig>>({});

  // Active Dropdown state: which subject slot has the teacher dropdown open
  const [activeTeacherDropdown, setActiveTeacherDropdown] = useState<{
    className: string;
    subjectId: string | number;
  } | null>(null);

  // Share & Download Status State
  const [sharingClassKey, setSharingClassKey] = useState<string | null>(null);
  const [downloadingClassKey, setDownloadingClassKey] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [zippingAll, setZippingAll] = useState<boolean>(false);

  // Quick Preset Date Helper
  const setQuickDate = (offsetDays: number) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + offsetDays);
    const d = `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
    const iso = dt.toISOString().split('T')[0];
    const name = dt.toLocaleDateString('en-US', { weekday: 'long' });
    setDateStr(d);
    setIsoDate(iso);
    setDayName(name);
  };

  const handleIsoDateChange = (newIso: string) => {
    setIsoDate(newIso);
    if (newIso) {
      const parts = newIso.split('-');
      if (parts.length === 3) {
        const [y, m, d] = parts;
        setDateStr(`${d}/${m}/${y}`);
        const dt = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
        setDayName(dt.toLocaleDateString('en-US', { weekday: 'long' }));
      }
    }
  };

  // Toggle Class Selection
  const toggleClassSelection = (cName: string) => {
    setSelectedClasses(prev => 
      prev.includes(cName) ? prev.filter(c => c !== cName) : [...prev, cName]
    );
  };

  // Add Custom Class
  const handleAddCustomClass = () => {
    if (!customClassInput.trim()) return;
    const c = customClassInput.trim().toUpperCase();
    if (!selectedClasses.includes(c)) {
      setSelectedClasses(prev => [...prev, c]);
    }
    setCustomClassInput('');
  };

  // Prepare Class Configs when moving from Step 1 to Step 2
  const handleProceedToStep2 = () => {
    if (selectedClasses.length === 0) {
      alert('Please select at least one class to continue.');
      return;
    }

    setClassConfigs(prev => {
      const nextConfigs: Record<string, QuickClassConfig> = { ...prev };
      
      selectedClasses.forEach(cName => {
        if (!nextConfigs[cName]) {
          // Provide sensible starter subjects: Physics, Chemistry, Maths, Biology
          nextConfigs[cName] = {
            className: cName,
            time: commonTime,
            subjects: [
              {
                id: 1,
                name: 'PHYSICS',
                teacher_code: 'JN',
                color: 'blue',
                icon_type: 'icon',
                icon: 'grain'
              },
              {
                id: 2,
                name: 'CHEMISTRY',
                teacher_code: 'CY',
                color: 'green',
                icon_type: 'icon',
                icon: 'science'
              },
              {
                id: 3,
                name: 'MATHS',
                teacher_code: 'MRS',
                color: 'blue',
                icon_type: 'math',
                icon: ''
              },
              {
                id: 4,
                name: 'BOTANY',
                teacher_code: 'JS',
                color: 'green',
                icon_type: 'icon',
                icon: 'psychiatry'
              }
            ],
            hasAptExam: false,
            aptExamSubjects: [],
            aptExamText: '',
            remarks: ''
          };
        } else {
          // Update default time if unchanged
          if (!nextConfigs[cName].time) {
            nextConfigs[cName].time = commonTime;
          }
        }
      });

      return nextConfigs;
    });

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2: Subject Manipulation
  const handleAddSubjectToClass = (cName: string, subjectName: string, defaultCode?: string) => {
    const cleanSubj = subjectName.trim().toUpperCase();
    const iconMeta = getAutoIconForSubject(cleanSubj);

    // Find suggested teacher code from teacherMappings if not provided
    let tCode = defaultCode || '';
    if (!tCode) {
      const matchedEntry = Object.entries(teacherMappings).find(([_, s]) => 
        String(s).toUpperCase() === cleanSubj || cleanSubj.includes(String(s).toUpperCase())
      );
      if (matchedEntry) tCode = matchedEntry[0];
    }

    setClassConfigs(prev => {
      const current = prev[cName];
      if (!current) return prev;
      const subjectsCount = current.subjects.length;
      const newSubject: PosterSubject = {
        id: Date.now() + Math.random(),
        name: cleanSubj,
        teacher_code: tCode,
        color: subjectsCount % 2 === 0 ? 'blue' : 'green',
        icon_type: iconMeta.icon_type,
        icon: iconMeta.icon
      };

      return {
        ...prev,
        [cName]: {
          ...current,
          subjects: [...current.subjects, newSubject]
        }
      };
    });
  };

  const handleRemoveSubjectFromClass = (cName: string, subjectId: string | number) => {
    setClassConfigs(prev => {
      const current = prev[cName];
      if (!current) return prev;
      const updatedSubjects = current.subjects
        .filter(s => s.id !== subjectId)
        .map((s, idx) => ({
          ...s,
          color: idx % 2 === 0 ? 'blue' as const : 'green' as const
        }));

      return {
        ...prev,
        [cName]: {
          ...current,
          subjects: updatedSubjects
        }
      };
    });
  };

  const handleUpdateSubjectTeacher = (cName: string, subjectId: string | number, newTeacherCode: string) => {
    setClassConfigs(prev => {
      const current = prev[cName];
      if (!current) return prev;
      return {
        ...prev,
        [cName]: {
          ...current,
          subjects: current.subjects.map(s => 
            s.id === subjectId ? { ...s, teacher_code: newTeacherCode } : s
          )
        }
      };
    });
    setActiveTeacherDropdown(null);
  };

  // Add new teacher to mappings and update
  const handleAddNewTeacherMapping = (code: string, subject: string) => {
    const updated = {
      ...teacherMappings,
      [code.toUpperCase()]: subject.toUpperCase()
    };
    onUpdateTeacherMappings(updated);
  };

  // APT Exam Toggle & Subject Selection
  const handleToggleAptExam = (cName: string, enabled: boolean) => {
    setClassConfigs(prev => {
      const current = prev[cName];
      if (!current) return prev;
      return {
        ...prev,
        [cName]: {
          ...current,
          hasAptExam: enabled,
          aptExamText: enabled ? (current.aptExamText || current.aptExamSubjects.join(', ')) : ''
        }
      };
    });
  };

  const handleToggleAptExamSubject = (cName: string, aptSubj: string) => {
    setClassConfigs(prev => {
      const current = prev[cName];
      if (!current) return prev;
      const exists = current.aptExamSubjects.includes(aptSubj);
      const nextSubjects = exists 
        ? current.aptExamSubjects.filter(s => s !== aptSubj)
        : [...current.aptExamSubjects, aptSubj];

      return {
        ...prev,
        [cName]: {
          ...current,
          aptExamSubjects: nextSubjects,
          aptExamText: nextSubjects.join(', ')
        }
      };
    });
  };

  // Remarks change
  const handleRemarksChange = (cName: string, text: string) => {
    setClassConfigs(prev => {
      const current = prev[cName];
      if (!current) return prev;
      return {
        ...prev,
        [cName]: {
          ...current,
          remarks: text
        }
      };
    });
  };

  // Copy one class config to ALL other selected classes
  const handleCopyClassConfigToAll = (sourceClassName: string) => {
    const sourceConfig = classConfigs[sourceClassName];
    if (!sourceConfig) return;

    if (!window.confirm(`Copy subjects, teachers, remarks, and APT exam settings from ${sourceClassName} to ALL other selected classes?`)) {
      return;
    }

    setClassConfigs(prev => {
      const next = { ...prev };
      selectedClasses.forEach(cName => {
        if (cName !== sourceClassName) {
          next[cName] = {
            ...next[cName],
            time: sourceConfig.time,
            subjects: sourceConfig.subjects.map(s => ({ ...s, id: Date.now() + Math.random() })),
            hasAptExam: sourceConfig.hasAptExam,
            aptExamSubjects: [...sourceConfig.aptExamSubjects],
            aptExamText: sourceConfig.aptExamText,
            remarks: sourceConfig.remarks
          };
        }
      });
      return next;
    });
  };

  // Proceed to Step 3: Final Review & Share
  const handleProceedToStep3 = () => {
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Direct Share Single Card Image (Pure image without text/title)
  const handleShareCard = async (cName: string) => {
    const elementId = `quick-poster-card-${cName.replace(/\s+/g, '-')}`;
    setSharingClassKey(cName);
    try {
      // Small pause for layout settle
      await new Promise(r => setTimeout(r, 200));
      const res = await shareTimetableCardImage(cName, dateStr, elementId);
      if (res.method === 'clipboard') {
        alert('Timetable image copied to clipboard! You can paste it directly into WhatsApp or chats.');
      } else if (res.method === 'download') {
        alert('Direct share is not supported on this browser. The poster image was downloaded.');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Share failed:', err);
        alert('Failed to share poster: ' + (err?.message || 'Error'));
      }
    } finally {
      setSharingClassKey(null);
    }
  };

  // Download Single Card Image
  const handleDownloadCard = async (cName: string) => {
    const elementId = `quick-poster-card-${cName.replace(/\s+/g, '-')}`;
    setDownloadingClassKey(cName);
    try {
      await new Promise(r => setTimeout(r, 200));
      await downloadTimetableCardImage(cName, dateStr, elementId);
    } catch (err: any) {
      console.error('Download failed:', err);
      alert('Failed to download image: ' + (err?.message || 'Error'));
    } finally {
      setDownloadingClassKey(null);
    }
  };

  // Copy Single Card Image to Clipboard
  const handleCopyCard = async (cName: string) => {
    const elementId = `quick-poster-card-${cName.replace(/\s+/g, '-')}`;
    try {
      const res = await copyTimetableCardToClipboard(elementId);
      if (res.success) {
        alert(`Copied ${cName} timetable poster to clipboard!`);
      } else {
        alert('Could not copy image: ' + res.message);
      }
    } catch (e: any) {
      alert('Clipboard copy error: ' + e?.message);
    }
  };

  // Save All Generated Classes to Timetable Database
  const handleSaveAllToDatabase = async () => {
    setIsSaving(true);
    try {
      const compiledClasses = selectedClasses.map(cName => {
        const conf = classConfigs[cName] || {
          className: cName,
          time: commonTime,
          subjects: [],
          hasAptExam: false,
          aptExamSubjects: [],
          aptExamText: '',
          remarks: ''
        };

        return {
          class_name: cName,
          title: `${cName} - TIME TABLE`,
          time: conf.time || commonTime,
          apt_exam: conf.hasAptExam ? (conf.aptExamText || conf.aptExamSubjects.join(', ')) : '',
          extra_note: conf.remarks || '',
          phone1: '9072651666',
          phone2: '9072652666',
          subjects: conf.subjects
        };
      });

      await onSaveQuickTimetables(dateStr, isoDate, dayName, compiledClasses);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (e: any) {
      console.error('Save failed:', e);
      alert('Failed to save to database: ' + (e?.message || 'Error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Batch ZIP Download
  const handleDownloadAllZip = async () => {
    setZippingAll(true);
    try {
      const itemsToZip: Array<{ className: string; elementId: string }> = selectedClasses.map(cName => ({
        className: cName,
        elementId: `quick-poster-card-${cName.replace(/\s+/g, '-')}`
      }));

      await createTimetableZipArchive(dateStr, itemsToZip, (current, total) => {
        // progress callback if needed
      });
    } catch (e: any) {
      console.error('Zip download failed:', e);
      alert('Failed to create ZIP: ' + (e?.message || 'Error'));
    } finally {
      setZippingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Top Sticky Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Return to Timetable Manager"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 rounded-sm">
                  Quick Mode
                </span>
                <h1 className="text-sm font-black text-[#062e5b]">
                  {step === 1 && 'Step 1: Select Classes & Date/Time'}
                  {step === 2 && 'Step 2: Configure Subjects & Teachers'}
                  {step === 3 && 'Step 3: Preview & Share Timetables'}
                </h1>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                {step === 1 && 'Pick batch classes, set tomorrow’s date & common timing'}
                {step === 2 && 'Set periods, teacher codes, remarks & APT exam for all classes'}
                {step === 3 && 'Share poster cards one by one or download as PNG'}
              </p>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-1 sm:gap-2">
            {[1, 2, 3].map((sNum) => (
              <button
                key={sNum}
                type="button"
                onClick={() => {
                  if (sNum === 1) setStep(1);
                  if (sNum === 2 && selectedClasses.length > 0) handleProceedToStep2();
                  if (sNum === 3 && selectedClasses.length > 0) handleProceedToStep3();
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                  step === sNum
                    ? 'bg-[#062e5b] text-white ring-2 ring-[#062e5b]/20 shadow-xs'
                    : step > sNum
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > sNum ? '✓' : sNum}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">

        {/* ============================================================ */}
        {/* STEP 1: CLASS SELECTION & DATE / TIME SETUP */}
        {/* ============================================================ */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Intro Hero Banner */}
            <div className="bg-gradient-to-r from-[#062e5b] to-[#0a4687] rounded-2xl p-5 text-white shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-2">
                    <Zap className="w-3.5 h-3.5 fill-amber-300" />
                    Fast Batch Creator
                  </div>
                  <h2 className="text-xl font-black tracking-tight">Create Timetables in Seconds</h2>
                  <p className="text-xs text-blue-100 mt-1 max-w-xl">
                    Select your classes below. Tomorrow&apos;s date and standard 9:00 AM – 04:30 PM timing have been auto-configured for you.
                  </p>
                </div>
              </div>
            </div>

            {/* 1. Class Selection Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#062e5b] flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Select Classes</h3>
                    <p className="text-[11px] text-slate-500">Pick which classes to generate timetable posters for</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedClasses([...STANDARD_CLASSES])}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedClasses([])}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Standard Class Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {STANDARD_CLASSES.map((cName) => {
                  const isSelected = selectedClasses.includes(cName);
                  return (
                    <button
                      key={cName}
                      type="button"
                      onClick={() => toggleClassSelection(cName)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#062e5b] text-white border-[#062e5b] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cName}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-amber-300 stroke-[3]" />
                      ) : (
                        <Plus className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Class Input */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Add custom class (e.g. NEET REPEATERS, CRASH A)..."
                  value={customClassInput}
                  onChange={(e) => setCustomClassInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomClass())}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#062e5b]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomClass}
                  disabled={!customClassInput.trim()}
                  className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl disabled:opacity-50 transition-colors"
                >
                  + Add Class
                </button>
              </div>

              {/* Selected Classes Summary Bar */}
              <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="font-bold text-slate-800">{selectedClasses.length} classes selected:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedClasses.map(c => (
                    <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-800 font-bold rounded text-[11px] inline-flex items-center gap-1">
                      {c}
                      <button
                        type="button"
                        onClick={() => toggleClassSelection(c)}
                        className="hover:text-red-600"
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Date Setup Card (Auto-Set to Tomorrow) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Schedule Date</h3>
                  <p className="text-[11px] text-slate-500">Auto-set to tomorrow (editable)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        value={isoDate}
                        onChange={(e) => handleIsoDateChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#062e5b]"
                      />
                    </div>
                    <span className="text-xs font-extrabold text-[#062e5b] px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl whitespace-nowrap">
                      {dateStr}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700 mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{dayName}</span>
                  </div>
                </div>

                {/* Quick Date Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setQuickDate(1)}
                    className="px-3 py-1.5 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition-colors"
                  >
                    ⚡ Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(0)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(2)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors"
                  >
                    Day After
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Time Setup Card (Auto-Set to 9 to 4:30) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Timing</h3>
                  <p className="text-[11px] text-slate-500">Auto-set to 9:00 AM – 04:30 PM (editable)</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={commonTime}
                    onChange={(e) => setCommonTime(e.target.value)}
                    placeholder="e.g. 09:00 AM – 04:30 PM"
                    className="w-full pl-9 pr-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#062e5b]"
                  />
                </div>

                {/* Quick Time Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {TIME_PRESETS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCommonTime(t)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-semibold border transition-all ${
                        commonTime === t
                          ? 'bg-[#062e5b] text-white border-[#062e5b]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Proceed to Step 2 Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleProceedToStep2}
                disabled={selectedClasses.length === 0}
                className="px-6 py-3 bg-[#062e5b] hover:bg-[#0d427d] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <span>Next: Configure Subjects &amp; Teachers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: CONFIGURE ALL CLASSES IN SINGLE SCROLL VIEW */}
        {/* ============================================================ */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Summary Toolbar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 sticky top-16 z-20">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#062e5b]">
                    {dateStr} ({dayName})
                  </span>
                  <span className="text-[11px] text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-600">{commonTime}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Configuring {selectedClasses.length} classes in scroll view
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  ← Back to Step 1
                </button>
                <button
                  type="button"
                  onClick={handleProceedToStep3}
                  className="px-4 py-1.5 text-xs font-bold bg-[#062e5b] hover:bg-[#0d427d] text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Preview &amp; Share</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scroll Container with Cards for All Selected Classes */}
            <div className="space-y-6">
              {selectedClasses.map((cName, classIndex) => {
                const conf = classConfigs[cName] || {
                  className: cName,
                  time: commonTime,
                  subjects: [],
                  hasAptExam: false,
                  aptExamSubjects: [],
                  aptExamText: '',
                  remarks: ''
                };

                return (
                  <div
                    key={cName}
                    className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-visible transition-shadow hover:shadow-sm"
                  >
                    {/* Class Card Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-[#062e5b] text-white flex items-center justify-center font-black text-xs shadow-xs">
                          {classIndex + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900">{cName}</h3>
                            <span className="text-[11px] font-bold text-slate-500">TIME TABLE</span>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500">{conf.time || commonTime}</span>
                        </div>
                      </div>

                      {/* Convenience: Copy to all other classes */}
                      <button
                        type="button"
                        onClick={() => handleCopyClassConfigToAll(cName)}
                        className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                        title="Copy this class's subjects, teachers, and exam settings to all other classes"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy to All Classes</span>
                      </button>
                    </div>

                    <div className="p-4 sm:p-5 space-y-5">
                      {/* 1. Subjects Section */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                            <span>Select Subjects &amp; Teacher Codes</span>
                          </label>
                          <span className="text-[11px] font-medium text-slate-400">
                            {conf.subjects.length} periods added
                          </span>
                        </div>

                        {/* Subject Quick Add Chips */}
                        <div className="flex flex-wrap gap-1.5 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase self-center mr-1">
                            + Add:
                          </span>
                          {SUBJECT_OPTIONS.map((opt) => (
                            <button
                              key={opt.name}
                              type="button"
                              onClick={() => handleAddSubjectToClass(cName, opt.name, opt.defaultCode)}
                              className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 hover:text-blue-900 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-all"
                            >
                              <Plus className="w-3 h-3 text-blue-600" />
                              <span>{opt.name}</span>
                            </button>
                          ))}
                        </div>

                        {/* Configured Subjects List */}
                        {conf.subjects.length === 0 ? (
                          <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                            No subjects added yet. Click any subject button above to add.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {conf.subjects.map((subj, sIdx) => {
                              const isDropdownOpen = (
                                activeTeacherDropdown?.className === cName &&
                                activeTeacherDropdown?.subjectId === subj.id
                              );

                              return (
                                <div
                                  key={subj.id || sIdx}
                                  className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl relative hover:bg-slate-50 transition-colors"
                                >
                                  {/* Left: Period # and Subject Badge */}
                                  <div className="flex items-center gap-2 min-w-[140px]">
                                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                                      {sIdx + 1}
                                    </span>
                                    <span
                                      className={`px-2.5 py-1 text-xs font-black uppercase rounded-lg border ${
                                        subj.color === 'green'
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                          : 'bg-blue-50 text-blue-800 border-blue-200'
                                      }`}
                                    >
                                      {subj.name}
                                    </span>
                                  </div>

                                  {/* Center & Right: Teacher Code Trigger & Delete */}
                                  <div className="flex items-center gap-2 relative">
                                    <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
                                      Teacher:
                                    </span>

                                    {/* TEACHER CODE DROPDOWN VIEW TRIGGER (Not standard input!) */}
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (isDropdownOpen) {
                                            setActiveTeacherDropdown(null);
                                          } else {
                                            setActiveTeacherDropdown({
                                              className: cName,
                                              subjectId: subj.id || sIdx
                                            });
                                          }
                                        }}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-2 transition-all ${
                                          subj.teacher_code
                                            ? 'bg-white text-[#062e5b] border-blue-300 shadow-2xs hover:border-blue-400'
                                            : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                                        }`}
                                        title="Click to open teacher dropdown view & add new teachers"
                                      >
                                        <span>{subj.teacher_code || 'Select Teacher'}</span>
                                        <ChevronDown className="w-3 h-3 text-slate-400" />
                                      </button>

                                      {/* THE INTERACTIVE DROPDOWN VIEW POPOVER */}
                                      {isDropdownOpen && (
                                        <TeacherDropdownView
                                          currentCode={subj.teacher_code || ''}
                                          subjectName={subj.name}
                                          teacherMappings={teacherMappings}
                                          onSelect={(newCode) => handleUpdateSubjectTeacher(cName, subj.id || sIdx, newCode)}
                                          onAddNewTeacher={handleAddNewTeacherMapping}
                                          onClose={() => setActiveTeacherDropdown(null)}
                                        />
                                      )}
                                    </div>

                                    {/* Remove Subject Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveSubjectFromClass(cName, subj.id || sIdx)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                      title="Remove period"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* 2. APT EXAM Toggle & Subjects */}
                      <div className="pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={conf.hasAptExam}
                              onChange={(e) => handleToggleAptExam(cName, e.target.checked)}
                              className="w-4 h-4 rounded text-[#062e5b] focus:ring-[#062e5b] border-slate-300"
                            />
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              APT EXAM
                            </span>
                          </label>
                          <span className="text-[11px] text-slate-400">
                            Check to enable APT Exam section on timetable
                          </span>
                        </div>

                        {/* If APT EXAM is ON, show APT subject selector chips */}
                        {conf.hasAptExam && (
                          <div className="mt-2.5 p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 animate-in fade-in duration-100">
                            <div className="text-[11px] font-bold text-amber-900">
                              Select APT Exam Subjects:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {APT_SUBJECT_CHIPS.map((chip) => {
                                const isSelected = conf.aptExamSubjects.includes(chip);
                                return (
                                  <button
                                    key={chip}
                                    type="button"
                                    onClick={() => handleToggleAptExamSubject(cName, chip)}
                                    className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-all ${
                                      isSelected
                                        ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                                        : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100/50'
                                    }`}
                                  >
                                    {isSelected ? '✓ ' : '+ '}
                                    {chip}
                                  </button>
                                );
                              })}
                            </div>
                            <input
                              type="text"
                              value={conf.aptExamText}
                              onChange={(e) => {
                                const val = e.target.value;
                                setClassConfigs(prev => ({
                                  ...prev,
                                  [cName]: {
                                    ...prev[cName],
                                    aptExamText: val
                                  }
                                }));
                              }}
                              placeholder="e.g. Zoology, Botany, CS"
                              className="w-full px-3 py-1.5 text-xs bg-white border border-amber-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* 3. Remarks / Extra Things */}
                      <div className="pt-3 border-t border-slate-100">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Remarks / Extra Notes</span>
                        </label>
                        <input
                          type="text"
                          value={conf.remarks}
                          onChange={(e) => handleRemarksChange(cName, e.target.value)}
                          placeholder="Write extra notes or announcements (e.g. Special Test, Bring lab coat)..."
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#062e5b]"
                        />

                        {/* Remarks Suggestions */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {REMARKS_PRESETS.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleRemarksChange(cName, preset)}
                              className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded"
                            >
                              + {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Floating Navigation */}
            <div className="pt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
              >
                ← Back to Step 1
              </button>

              <button
                type="button"
                onClick={handleProceedToStep3}
                className="px-6 py-3 bg-[#062e5b] hover:bg-[#0d427d] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <span>Generate &amp; Preview Timetables</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: FINAL TIMETABLE VIEW & SHARE ONE BY ONE */}
        {/* ============================================================ */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Summary & Batch Action Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-[#062e5b] flex items-center gap-2">
                  <span>Timetable Posters Generated</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold">
                    {selectedClasses.length} Posters Ready
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  {dateStr} ({dayName}) • {commonTime} • Share posters directly to WhatsApp or download
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Save All to Database */}
                <button
                  type="button"
                  onClick={handleSaveAllToDatabase}
                  disabled={isSaving}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs ${
                    savedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#062e5b] hover:bg-[#0d427d] text-white'
                  }`}
                >
                  {isSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : savedSuccess ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{savedSuccess ? 'Saved to Timetables!' : 'Save All to Database'}</span>
                </button>

                {/* Batch ZIP Download */}
                <button
                  type="button"
                  onClick={handleDownloadAllZip}
                  disabled={zippingAll}
                  className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-colors"
                  title="Download all generated class posters in a single ZIP file"
                >
                  <Archive className="w-3.5 h-3.5 text-blue-600" />
                  <span>{zippingAll ? 'Creating ZIP...' : 'Download All (ZIP)'}</span>
                </button>

                {/* Return / Edit */}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                >
                  Edit Configuration
                </button>
              </div>
            </div>

            {/* Notification Banner when saved */}
            {savedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All timetable schedules for {dateStr} have been saved and synchronized to the cloud!</span>
              </div>
            )}

            {/* List of Timetable Posters (Share one by one) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {selectedClasses.map((cName) => {
                const conf = classConfigs[cName] || {
                  className: cName,
                  time: commonTime,
                  subjects: [],
                  hasAptExam: false,
                  aptExamSubjects: [],
                  aptExamText: '',
                  remarks: ''
                };

                const cardDomId = `quick-poster-card-${cName.replace(/\s+/g, '-')}`;
                const isSharingThis = sharingClassKey === cName;
                const isDownloadingThis = downloadingClassKey === cName;

                return (
                  <div
                    key={cName}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col items-center space-y-4"
                  >
                    {/* Header Bar */}
                    <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-[#062e5b] text-white font-black text-xs rounded-lg">
                          {cName}
                        </span>
                        <span className="text-xs font-bold text-slate-700">Timetable Poster</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">{dateStr}</span>
                    </div>

                    {/* Responsive Container for Poster Card Preview */}
                    <div className="w-full overflow-x-auto flex justify-center py-2 bg-slate-50/50 rounded-xl border border-slate-100">
                      <div className="origin-top transform scale-[0.85] sm:scale-100 transition-transform">
                        <PosterCardPreview
                          id={cardDomId}
                          batchName={cName}
                          title={`${cName} - TIME TABLE`}
                          date={dateStr}
                          time={conf.time || commonTime}
                          aptExam={conf.hasAptExam ? (conf.aptExamText || conf.aptExamSubjects.join(', ')) : ''}
                          extraNote={conf.remarks || ''}
                          phone1="9072651666"
                          phone2="9072652666"
                          subjects={conf.subjects}
                        />
                      </div>
                    </div>

                    {/* Action Buttons: Direct Share, Download PNG, Copy */}
                    <div className="w-full pt-2 flex flex-col sm:flex-row items-center gap-2">
                      {/* DIRECT SHARE BUTTON (Primary green action) */}
                      <button
                        type="button"
                        onClick={() => handleShareCard(cName)}
                        disabled={isSharingThis}
                        className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
                        title="Directly share this PNG image to WhatsApp or other apps"
                      >
                        {isSharingThis ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Sharing...</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4" />
                            <span>Direct Share Image</span>
                          </>
                        )}
                      </button>

                      {/* Download PNG Button */}
                      <button
                        type="button"
                        onClick={() => handleDownloadCard(cName)}
                        disabled={isDownloadingThis}
                        className="w-full sm:w-auto py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
                        title="Download High-Res PNG"
                      >
                        {isDownloadingThis ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span>PNG</span>
                      </button>

                      {/* Copy Image to Clipboard */}
                      <button
                        type="button"
                        onClick={() => handleCopyCard(cName)}
                        className="w-full sm:w-auto py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
                        title="Copy image directly to clipboard"
                      >
                        <Copy className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              >
                ← Back to Edit
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSelectedClasses(['A1', 'A2', 'B1', 'B2', 'B3']);
                  }}
                  className="px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  Create Another Timetable
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#062e5b] hover:bg-[#0d427d] rounded-xl shadow-xs transition-colors"
                >
                  Exit to Timetable Manager
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
