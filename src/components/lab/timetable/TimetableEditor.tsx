import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, Save, Download, Copy, Share2, Plus, Trash2, ArrowUp, ArrowDown, 
  Sparkles, Calendar, Clock, Phone, BookOpen, AlertCircle, Check, Eye, Edit3, X, CheckCircle2
} from 'lucide-react';
import { PosterCardPreview, PosterSubject } from './PosterCardPreview';
import { downloadTimetableCardImage, copyTimetableCardToClipboard } from '../../../utils/timetableCardExport';
import { getAutoIconForSubject } from '../../../services/timetableAiService';

interface Props {
  initialDate: string;
  initialIsoDate?: string;
  initialClassName: string;
  initialClassData?: any;
  onBack: () => void;
  onSave: (savedClassData: any) => Promise<void> | void;
}

const BATCH_PRESETS = ['PLUS ONE', 'PLUS TWO', 'A1', 'A2', 'B1', 'B2', 'B3', 'B1 BOYS', 'B1 GIRLS'];
const APT_CHIPS = ['Zoology', 'Botany', 'CS', 'Physics', 'Chemistry', 'Maths'];
const EXTRA_NOTE_CHIPS = ['Maths Improvement', 'Phy Improvement', 'Chem Improvement', 'Improvement Exam', 'NEET Model Exam', 'Special Test'];

const SUBJECT_PRESETS = [
  { name: 'MATHS', code: 'MRS', icon_type: 'math', icon: '' },
  { name: 'CHEMISTRY', code: 'CY', icon_type: 'icon', icon: 'science' },
  { name: 'PHYSICS', code: 'JN', icon_type: 'icon', icon: 'grain' },
  { name: 'BOTANY', code: 'JS', icon_type: 'icon', icon: 'psychiatry' },
  { name: 'ZOOLOGY', code: 'AZ', icon_type: 'icon', icon: 'pets' },
  { name: 'COMPUTER SCIENCE', code: 'CS', icon_type: 'icon', icon: 'terminal' },
  { name: 'ENGLISH', code: 'ENG', icon_type: 'icon', icon: 'menu_book' }
];

const AutoFitPosterPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [naturalHeight, setNaturalHeight] = useState(720);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth;
      const availableWidth = Math.max(containerWidth - 24, 240);
      const cardBaseWidth = 480;
      
      const newScale = Math.min(1, availableWidth / cardBaseWidth);
      setScale(newScale);

      const cardEl = containerRef.current.querySelector('#timetable-poster-card') as HTMLElement;
      if (cardEl && cardEl.offsetHeight > 0) {
        setNaturalHeight(cardEl.offsetHeight);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      window.removeEventListener('resize', updateScale);
      observer.disconnect();
    };
  }, [children]);

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center justify-start overflow-hidden py-1">
      <div 
        style={{
          width: `${480 * scale}px`,
          height: `${naturalHeight * scale}px`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'width 0.15s ease, height 0.15s ease'
        }}
      >
        <div 
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: '480px'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export const TimetableEditor: React.FC<Props> = ({
  initialDate,
  initialIsoDate,
  initialClassName,
  initialClassData,
  onBack,
  onSave
}) => {
  // --- Form States ---
  const [batchName, setBatchName] = useState(initialClassName || 'PLUS ONE');
  const [customTitle, setCustomTitle] = useState(initialClassData?.title || '');
  const [date, setDate] = useState(initialDate || '');
  const [isoDate, setIsoDate] = useState(initialIsoDate || '');
  const [dayName, setDayName] = useState(() => {
    if (initialIsoDate) {
      return new Date(initialIsoDate).toLocaleDateString('en-US', { weekday: 'long' });
    }
    return '';
  });

  // Time States
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('17:00');
  const [timeFormatMode, setTimeFormatMode] = useState<'dot_sec' | 'standard' | 'upper'>('dot_sec');
  const [time, setTime] = useState(initialClassData?.time || '8.30.00 am – 5.00 pm');

  // Exam & Notes
  const [aptExam, setAptExam] = useState(initialClassData?.apt_exam || '');
  const [extraNote, setExtraNote] = useState(initialClassData?.extra_note || '');

  // Contacts
  const [phone1, setPhone1] = useState(initialClassData?.phone1 || '9072651666');
  const [phone2, setPhone2] = useState(initialClassData?.phone2 || '9072652666');

  // Subjects List
  const [subjects, setSubjects] = useState<PosterSubject[]>(() => {
    if (initialClassData?.subjects && initialClassData.subjects.length > 0) {
      return initialClassData.subjects;
    }
    return [
      { id: 1, name: 'MATHS', teacher_code: 'MRS', color: 'blue', icon_type: 'math', icon: '' },
      { id: 2, name: 'CHEMISTRY', teacher_code: 'CY', color: 'green', icon_type: 'icon', icon: 'science' },
      { id: 3, name: 'PHYSICS', teacher_code: 'JN', color: 'blue', icon_type: 'icon', icon: 'grain' },
      { id: 4, name: 'CHEMISTRY', teacher_code: 'CY', color: 'green', icon_type: 'icon', icon: 'science' }
    ];
  });

  // UI Navigation States
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [rawPasteText, setRawPasteText] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [targetPhone, setTargetPhone] = useState('');
  const [shareCaption, setShareCaption] = useState('Here is the timetable schedule:');

  // Operation States
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Build effective title
  const effectiveTitle = useMemo(() => {
    if (customTitle.trim()) return customTitle.trim();
    return `${batchName} - TIME TABLE`;
  }, [batchName, customTitle]);

  // Format Time String helper
  const formatTimePiece = (t24: string, mode: 'dot_sec' | 'standard' | 'upper') => {
    if (!t24) return '';
    const [hStr, mStr] = t24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const isPm = h >= 12;
    h = h % 12;
    if (h === 0) h = 12;

    if (mode === 'dot_sec') {
      return `${h}.${m}.00 ${isPm ? 'pm' : 'am'}`;
    } else if (mode === 'standard') {
      return `${h}:${m} ${isPm ? 'pm' : 'am'}`;
    } else {
      return `${h}:${m} ${isPm ? 'PM' : 'AM'}`;
    }
  };

  const handleTimeChange = (st: string, et: string, mode = timeFormatMode) => {
    setStartTime(st);
    setEndTime(et);
    const piece1 = formatTimePiece(st, mode);
    const piece2 = formatTimePiece(et, mode);
    if (piece1 && piece2) {
      setTime(`${piece1} – ${piece2}`);
    } else if (piece1) {
      setTime(piece1);
    }
  };

  // Date handlers
  const handleIsoDateChange = (newIso: string) => {
    setIsoDate(newIso);
    if (newIso) {
      const [y, m, d] = newIso.split('-');
      setDate(`${d}/${m}/${y}`);
      const dt = new Date(`${y}-${m}-${d}`);
      setDayName(dt.toLocaleDateString('en-US', { weekday: 'long' }));
    }
  };

  const handleSetQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const iso = d.toISOString().split('T')[0];
    handleIsoDateChange(iso);
  };

  // APT Chips helper
  const handleToggleApt = (subj: string) => {
    const list = aptExam.split(',').map(s => s.trim()).filter(Boolean);
    if (list.includes(subj)) {
      setAptExam(list.filter(s => s !== subj).join(', '));
    } else {
      setAptExam([...list, subj].join(', '));
    }
  };

  // Subject operations
  const handleAddSubject = (name = 'PHYSICS', code = '') => {
    const nextColor = subjects.length % 2 === 0 ? 'blue' : 'green';
    const auto = getAutoIconForSubject(name);
    setSubjects([
      ...subjects,
      {
        id: Date.now(),
        name: name.toUpperCase(),
        teacher_code: code.toUpperCase(),
        color: nextColor,
        icon_type: auto.icon_type,
        icon: auto.icon
      }
    ]);
  };

  const handleUpdateSubject = (index: number, updates: Partial<PosterSubject>) => {
    setSubjects(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleRemoveSubject = (index: number) => {
    setSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveSubject = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === subjects.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    setSubjects(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Quick WhatsApp Text Parser
  const handleParseRawText = () => {
    if (!rawPasteText.trim()) return;
    const text = rawPasteText.trim();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    let extBatch = '';
    let extDate = '';
    let extTime = '';
    let extApt = '';
    let extNote = '';
    const extSubjects: PosterSubject[] = [];

    // Find date
    const dateMatch = text.match(/(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})/);
    if (dateMatch) {
      let [_, d, m, y] = dateMatch;
      if (y.length === 2) y = '20' + y;
      extDate = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      setIsoDate(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
    }

    // Find time
    const timeMatch = text.match(/(?:time\s*[:\-]?\s*)?(\d{1,2}(?:[\.:]\d{2})?\s*(?:am|pm)?\s*[\-–]\s*\d{1,2}(?:[\.:]\d{2})?\s*(?:am|pm)?)/i);
    if (timeMatch) {
      extTime = timeMatch[1].trim();
    }

    // Find APT
    const aptMatch = text.match(/apt\s*exam\s*[:\-]?\s*(.+)/i);
    if (aptMatch) {
      extApt = aptMatch[1].trim();
    }

    // Find Extra Note
    const noteMatch = text.match(/(?:note|improvement|exam)\s*[:\-]?\s*(.+)/i);
    if (noteMatch && !noteMatch[1].toLowerCase().includes('time')) {
      extNote = noteMatch[1].trim();
    }

    // Parse subject rows
    lines.forEach(line => {
      // Check for batch name in top line
      if (!extBatch && (line.includes('PLUS') || line.includes('TIME TABLE') || line.match(/^[A-B]\d/))) {
        const b = line.replace(/time\s*table/i, '').replace(/[\-\:\—]/g, '').trim();
        if (b) extBatch = b;
        return;
      }

      // Skip date, time, apt lines
      if (line.match(/(\d{1,2})[\/\.](\d{1,2})/) || line.toLowerCase().includes('time') || line.toLowerCase().includes('apt')) {
        return;
      }

      // Check subject + teacher (e.g. MATHS (MRS), CHEMISTRY CY)
      const subjMatch = line.match(/^([A-Za-z\s]+)(?:\(([^)]+)\)|\s+([A-Z]{1,4}))?$/);
      if (subjMatch) {
        const sName = subjMatch[1].trim();
        const sCode = (subjMatch[2] || subjMatch[3] || '').trim();
        const auto = getAutoIconForSubject(sName);
        const col = extSubjects.length % 2 === 0 ? 'blue' : 'green';
        extSubjects.push({
          id: Date.now() + Math.random(),
          name: sName.toUpperCase(),
          teacher_code: sCode.toUpperCase(),
          color: col,
          icon_type: auto.icon_type,
          icon: auto.icon
        });
      }
    });

    if (extBatch) setBatchName(extBatch);
    if (extDate) setDate(extDate);
    if (extTime) setTime(extTime);
    if (extApt) setAptExam(extApt);
    if (extNote) setExtraNote(extNote);
    if (extSubjects.length > 0) setSubjects(extSubjects);

    showToast(`Parsed ${extSubjects.length} subjects from text!`);
    setShowPasteBox(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        class_name: batchName,
        title: effectiveTitle,
        date: date,
        isoDate: isoDate,
        time: time,
        apt_exam: aptExam,
        extra_note: extraNote,
        phone1: phone1,
        phone2: phone2,
        subjects: subjects
      };
      await onSave(payload);
      showToast(`Saved timetable for ${batchName}!`);
    } catch (e: any) {
      showToast('Save failed: ' + (e.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadTimetableCardImage(batchName, date);
      showToast('Poster card downloaded!');
    } catch (e: any) {
      showToast('Download error: ' + e.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    setCopying(true);
    try {
      await copyTimetableCardToClipboard();
      showToast('Poster image copied to clipboard! (Ctrl+V to paste)');
    } catch (e: any) {
      showToast('Copy failed: ' + e.message);
    } finally {
      setCopying(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!targetPhone.trim()) {
      showToast('Please enter a target phone number.');
      return;
    }
    const cleanNumber = targetPhone.replace(/[^0-9]/g, '');
    const encodedCaption = encodeURIComponent(`${shareCaption}\n\n*${effectiveTitle}*\nDate: ${date}\nTime: ${time}`);
    const url = `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encodedCaption}`;
    window.open(url, '_blank');
    setShowShareModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 text-slate-900">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
            title="Back to Timetable Manager"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img
            src="/logo01.png"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo0.png';
            }}
            alt="AIMS PLUS"
            className="h-9 w-auto max-w-[110px] object-contain hidden sm:block"
          />
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {date}
              </span>
              <span className="text-slate-300">•</span>
              <span className="px-2 py-0.5 bg-[#062e5b] text-white font-black text-[10px] tracking-wide">
                {batchName}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-[#062e5b] leading-tight">
              Edit Class Timetable Card
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setShowPasteBox(!showPasteBox)}
            className="px-3 py-1.5 text-xs font-bold border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {showPasteBox ? 'Hide Paste' : 'Quick Paste'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3.5 py-1.5 text-xs font-bold border border-[#062e5b] text-[#062e5b] hover:bg-[#062e5b]/10 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save Schedule'}
          </button>

          <button
            onClick={handleCopy}
            disabled={copying}
            className="px-3.5 py-1.5 text-xs font-bold border border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            {copying ? 'Copied!' : 'Copy Image'}
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-1.5 text-xs font-black bg-[#062e5b] hover:bg-[#0d427d] text-white flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? 'Rendering PNG...' : 'Download PNG'}
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="px-3.5 py-1.5 text-xs font-bold bg-[#78b82a] hover:bg-[#5c921c] text-white flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mobile Tab Control (<1024px) */}
      <div className="lg:hidden flex bg-white border border-slate-200 p-1 shadow-xs">
        <button
          onClick={() => setMobileTab('edit')}
          className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'edit'
              ? 'bg-[#062e5b] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          Edit Details
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            mobileTab === 'preview'
              ? 'bg-[#062e5b] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Live Poster Card
        </button>
      </div>

      {/* Quick WhatsApp Paste Drawer */}
      {showPasteBox && (
        <div className="bg-emerald-50/70 p-4 border border-emerald-200 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Quick WhatsApp Schedule Parser
            </span>
            <button onClick={() => setShowPasteBox(false)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
          <textarea
            rows={4}
            value={rawPasteText}
            onChange={(e) => setRawPasteText(e.target.value)}
            placeholder={`PLUS ONE - TIME TABLE\n28/08/2026\nMATHS (MRS)\nCHEMISTRY (CY)\nPHYSICS (JN)\nTime: 8.30.00 am – 5.00 pm\nAPT Exam : Zoology, Botany, CS`}
            className="w-full p-2.5 text-xs font-mono bg-white border border-emerald-300 text-slate-900 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={handleParseRawText}
            className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" /> Parse & Populate Form
          </button>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className={`space-y-4 lg:col-span-6 xl:col-span-7 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {/* Section 1: Class & Date Info */}
          <div className="bg-white p-4 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#062e5b] border-b border-slate-100 pb-2">
              <BookOpen className="w-4 h-4" />
              Class & Date Details
            </div>

            {/* Batch Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Batch / Class Name:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BATCH_PRESETS.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBatchName(b)}
                    className={`px-2.5 py-1 text-xs font-bold transition-colors ${
                      batchName === b
                        ? 'bg-[#062e5b] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value.toUpperCase())}
                placeholder="Or custom batch name"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 font-bold focus:border-[#062e5b] focus:outline-none"
              />
            </div>

            {/* Custom Banner Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Custom Banner Title (Optional):
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={effectiveTitle}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 focus:border-[#062e5b] focus:outline-none"
              />
            </div>

            {/* Calendar Date Picker */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#062e5b]" />
                  Schedule Date:
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSetQuickDate(0)}
                    className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickDate(1)}
                    className="px-2 py-0.5 text-[10px] font-bold bg-[#78b82a]/15 text-[#5c921c] border border-[#78b82a]/30 hover:bg-[#78b82a]/25"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickDate(2)}
                    className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                  >
                    Day After
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    value={isoDate}
                    onChange={(e) => handleIsoDateChange(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 font-bold focus:border-[#062e5b] focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 font-bold focus:border-[#062e5b] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Timing Configuration */}
          <div className="bg-white p-4 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-[#062e5b] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#78b82a]" />
                Class Timing
              </span>
              {/* Timing Format Switcher */}
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setTimeFormatMode('dot_sec');
                    handleTimeChange(startTime, endTime, 'dot_sec');
                  }}
                  className={`px-2 py-0.5 ${timeFormatMode === 'dot_sec' ? 'bg-[#062e5b] text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  .00 am
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimeFormatMode('standard');
                    handleTimeChange(startTime, endTime, 'standard');
                  }}
                  className={`px-2 py-0.5 ${timeFormatMode === 'standard' ? 'bg-[#062e5b] text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  am/pm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTimeFormatMode('upper');
                    handleTimeChange(startTime, endTime, 'upper');
                  }}
                  className={`px-2 py-0.5 ${timeFormatMode === 'upper' ? 'bg-[#062e5b] text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  AM/PM
                </button>
              </div>
            </div>

            {/* Time Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">Start Time:</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => handleTimeChange(e.target.value, endTime)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 font-bold focus:border-[#062e5b] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">End Time:</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => handleTimeChange(startTime, e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 font-bold focus:border-[#062e5b] focus:outline-none"
                />
              </div>
            </div>

            {/* Quick Timing Presets */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleTimeChange('08:30', '17:00')}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              >
                Full Day (8:30 – 5:00)
              </button>
              <button
                type="button"
                onClick={() => handleTimeChange('08:30', '13:00')}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              >
                Morning (8:30 – 1:00)
              </button>
              <button
                type="button"
                onClick={() => handleTimeChange('13:30', '17:00')}
                className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              >
                Afternoon (1:30 – 5:00)
              </button>
            </div>

            {/* Formatted Text Output */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500">Poster Display Text:</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-[#5c921c] font-black focus:border-[#062e5b] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Extra Note & APT Exam */}
          <div className="bg-white p-4 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#062e5b] border-b border-slate-100 pb-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              Special Notes & APT Exam
            </div>

            {/* Extra Note / Improvement Exam */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <span>Extra Note Banner (e.g. Improvement Exam):</span>
                <span className="text-[10px] text-slate-400 font-normal">(Only shown if filled)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {EXTRA_NOTE_CHIPS.map(note => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => setExtraNote(extraNote === note ? '' : note)}
                    className={`px-2 py-0.5 text-xs font-bold transition-colors ${
                      extraNote === note
                        ? 'bg-red-600 text-white'
                        : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={extraNote}
                onChange={(e) => setExtraNote(e.target.value)}
                placeholder="e.g. MATHS IMPROVEMENT"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-red-600 font-extrabold focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* APT Exam Banner */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                APT Exam Subjects:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {APT_CHIPS.map(chip => {
                  const isSel = aptExam.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleToggleApt(chip)}
                      className={`px-2 py-0.5 text-xs font-bold transition-colors ${
                        isSel
                          ? 'bg-amber-500 text-white'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
                {aptExam && (
                  <button
                    type="button"
                    onClick={() => setAptExam('')}
                    className="px-2 py-0.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                type="text"
                value={aptExam}
                onChange={(e) => setAptExam(e.target.value)}
                placeholder="e.g. Zoology, Botany, CS"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 font-semibold focus:border-[#062e5b] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 4: Subjects Manager */}
          <div className="bg-white p-4 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-[#062e5b] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#062e5b]" />
                Class Subjects ({subjects.length})
              </span>
              <button
                type="button"
                onClick={() => handleAddSubject('PHYSICS', '')}
                className="px-2.5 py-1 text-xs font-bold bg-[#062e5b] text-white hover:bg-[#0d427d] flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Subject
              </button>
            </div>

            {/* Quick Add Preset Buttons */}
            <div className="flex flex-wrap gap-1">
              {SUBJECT_PRESETS.map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleAddSubject(p.name, p.code)}
                  className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-[#062e5b]" /> {p.name}
                </button>
              ))}
            </div>

            {/* Subject Rows */}
            <div className="space-y-2.5">
              {subjects.map((s, idx) => {
                const isBlue = (s.color || (idx % 2 === 0 ? 'blue' : 'green')) === 'blue';
                return (
                  <div
                    key={s.id || idx}
                    className="p-3 bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2 justify-between"
                  >
                    {/* Index & Color Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-400 w-4 text-center">
                        {idx + 1}.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateSubject(idx, { color: isBlue ? 'green' : 'blue' })}
                        className={`px-2 py-0.5 text-[10px] font-extrabold tracking-wider ${
                          isBlue ? 'bg-[#062e5b] text-white' : 'bg-[#78b82a] text-white'
                        }`}
                        title="Click to toggle theme color (Blue/Green)"
                      >
                        {isBlue ? 'BLUE' : 'GREEN'}
                      </button>
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => handleUpdateSubject(idx, { name: e.target.value.toUpperCase() })}
                        placeholder="Subject (e.g. MATHS)"
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 font-black focus:border-[#062e5b] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={s.teacher_code || ''}
                        onChange={(e) => handleUpdateSubject(idx, { teacher_code: e.target.value.toUpperCase() })}
                        placeholder="Teacher Code (e.g. MRS)"
                        className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 font-bold focus:border-[#062e5b] focus:outline-none"
                      />
                    </div>

                    {/* Actions: Reorder & Delete */}
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => handleMoveSubject(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveSubject(idx, 'down')}
                        disabled={idx === subjects.length - 1}
                        className="p-1 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(idx)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Remove Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 5: Contact Phones */}
          <div className="bg-white p-4 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#062e5b] border-b border-slate-100 pb-2">
              <Phone className="w-4 h-4 text-[#78b82a]" />
              Footer Phone Numbers
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">Phone 1:</label>
                <input
                  type="text"
                  value={phone1}
                  onChange={(e) => setPhone1(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 font-bold focus:border-[#062e5b] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500">Phone 2:</label>
                <input
                  type="text"
                  value={phone2}
                  onChange={(e) => setPhone2(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 font-bold focus:border-[#062e5b] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: High Fidelity Poster Card Preview */}
        <div className={`lg:col-span-6 xl:col-span-5 space-y-3 ${mobileTab === 'edit' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between bg-white px-4 py-2 border border-slate-200 shadow-xs">
            <span className="text-xs font-black text-[#062e5b] flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#78b82a]" />
              Live Poster Card Preview
            </span>
            <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 text-slate-600 border border-slate-200">
              Auto-Fit Preview
            </span>
          </div>

          {/* Auto-Scaled Card Frame */}
          <div className="p-2 sm:p-4 bg-slate-100 border border-slate-200 flex justify-center items-center overflow-hidden shadow-inner">
            <AutoFitPosterPreview>
              <PosterCardPreview
                batchName={batchName}
                title={effectiveTitle}
                date={date}
                time={time}
                aptExam={aptExam}
                extraNote={extraNote}
                phone1={phone1}
                phone2={phone2}
                subjects={subjects}
              />
            </AutoFitPosterPreview>
          </div>
        </div>
      </div>

      {/* Sticky Mobile Floating Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex items-center justify-between gap-2 shadow-2xl">
        <button
          onClick={() => setMobileTab(mobileTab === 'edit' ? 'preview' : 'edit')}
          className="px-3 py-2 text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-1.5 border border-slate-300"
        >
          {mobileTab === 'edit' ? <Eye className="w-4 h-4 text-[#78b82a]" /> : <Edit3 className="w-4 h-4 text-blue-600" />}
          {mobileTab === 'edit' ? 'Preview' : 'Edit'}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={copying}
            className="p-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
            title="Copy Card PNG"
          >
            {copying ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-3.5 py-2 text-xs font-black bg-[#062e5b] text-white flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Exporting...' : 'Download'}
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3.5 py-2 text-xs font-black bg-[#78b82a] text-white flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* WhatsApp Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-black text-sm text-[#062e5b] flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#78b82a]" />
                Share Timetable via WhatsApp
              </span>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">
                Target Phone Number (with country code):
              </label>
              <input
                type="text"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                placeholder="e.g. 919876543210"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 text-slate-900 font-semibold focus:border-[#062e5b] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600">
                Message Caption:
              </label>
              <textarea
                rows={2}
                value={shareCaption}
                onChange={(e) => setShareCaption(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 text-slate-900 focus:border-[#062e5b] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleOpenWhatsApp}
                className="px-4 py-1.5 text-xs font-bold bg-[#78b82a] hover:bg-[#5c921c] text-white flex items-center gap-1.5 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                Open in WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
