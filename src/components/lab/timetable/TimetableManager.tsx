import React, { useState, useMemo, useRef } from 'react';
import { 
  CalendarDays, Plus, Search, Sliders, ScanLine, Download, Trash2, 
  Copy, Edit2, Calendar, Clock, BookOpen, AlertTriangle, ArrowRight, X, Check,
  Archive, Loader2, FileDown, Sparkles, ClipboardPaste
} from 'lucide-react';

import { TeacherMappingsModal } from './TeacherMappingsModal';
import { ScanTimetableModal } from './ScanTimetableModal';
import { TimetableAiSettingsModal } from './TimetableAiSettingsModal';
import { PasteTimetableModal } from './PasteTimetableModal';
import { DuplicateClassModal } from './DuplicateClassModal';
import { PosterCardPreview } from './PosterCardPreview';
import { downloadTimetableCardImage, captureTimetableCardBlob, createTimetableZipArchive } from '../../../utils/timetableCardExport';
import { getTimetableAiConfig, TimetableAiConfig } from '../../../services/timetableAiService';
import { saveAs } from 'file-saver';

interface DaySchedule {
  date: string;
  isoDate: string;
  dayName: string;
  classes: any[];
}

interface Props {
  days: DaySchedule[];
  teacherMappings: Record<string, string>;
  onOpenClassEditor: (dayDate: string, classData: any) => void;
  onAddNewDay: (newDay: DaySchedule) => Promise<void> | void;
  onDeleteDay: (dateStr: string) => Promise<void> | void;
  onDuplicateDay: (sourceDay: DaySchedule) => Promise<void> | void;
  onAddClassToDay: (dateStr: string, newClassName: string) => Promise<void> | void;
  onDeleteClassFromDay: (dateStr: string, className: string) => Promise<void> | void;
  onDuplicateClass: (
    sourceDate: string,
    sourceClassData: any,
    newClassName: string,
    targetDate: string
  ) => Promise<void> | void;
  onUpdateTeacherMappings: (newMappings: Record<string, string>) => void;
  onCreateNewCardDirect: () => void;
}

const STARTER_CLASSES = ['PLUS ONE', 'PLUS TWO', 'A1', 'A2', 'B1', 'B2', 'B3'];

export const TimetableManager: React.FC<Props> = ({
  days,
  teacherMappings,
  onOpenClassEditor,
  onAddNewDay,
  onDeleteDay,
  onDuplicateDay,
  onAddClassToDay,
  onDeleteClassFromDay,
  onDuplicateClass,
  onUpdateTeacherMappings,
  onCreateNewCardDirect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMappingsModal, setShowMappingsModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showAiSettingsModal, setShowAiSettingsModal] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [duplicateTarget, setDuplicateTarget] = useState<{ dayDate: string; classData: any } | null>(null);
  const [aiConfig, setAiConfig] = useState<TimetableAiConfig>(() => getTimetableAiConfig());


  // Add Day Modal State
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [newDayIso, setNewDayIso] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedStarterClasses, setSelectedStarterClasses] = useState<string[]>(['PLUS ONE', 'PLUS TWO', 'A1', 'A2']);

  // Add Class Modal State
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [targetDayForClass, setTargetDayForClass] = useState('');
  const [newClassName, setNewClassName] = useState('');

  // Toast / Download Status
  const [downloadingClassKey, setDownloadingClassKey] = useState<string | null>(null);
  const [quickExportTarget, setQuickExportTarget] = useState<{ dayDate: string; classData: any } | null>(null);

  // Today & Tomorrow Strings
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }, []);

  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }, []);

  // Filtered days list
  const filteredDays = useMemo(() => {
    if (!searchQuery.trim()) return days;
    const q = searchQuery.toLowerCase();
    return days.filter(d => {
      if (d.date.includes(q) || (d.dayName && d.dayName.toLowerCase().includes(q))) return true;
      if (d.classes && d.classes.some(c => c.class_name.toLowerCase().includes(q) || (c.subjects && c.subjects.some((s: any) => s.name.toLowerCase().includes(q))))) return true;
      return false;
    });
  }, [days, searchQuery]);

  const handleConfirmAddDay = async () => {
    if (!newDayIso) return;
    const [y, m, d] = newDayIso.split('-');
    const dateStr = `${d}/${m}/${y}`;
    const dt = new Date(`${y}-${m}-${d}`);
    const dayName = dt.toLocaleDateString('en-US', { weekday: 'long' });

    const starterClasses = selectedStarterClasses.map(cName => ({
      class_name: cName,
      title: `${cName} - TIME TABLE`,
      time: '8.30.00 am – 5.00 pm',
      apt_exam: 'Zoology, Botany, CS',
      extra_note: '',
      phone1: '9072651666',
      phone2: '9072652666',
      subjects: [
        { id: 1, name: 'MATHS', teacher_code: 'MRS', color: 'blue', icon_type: 'math', icon: '' },
        { id: 2, name: 'CHEMISTRY', teacher_code: 'CY', color: 'green', icon_type: 'icon', icon: 'science' },
        { id: 3, name: 'PHYSICS', teacher_code: 'JN', color: 'blue', icon_type: 'icon', icon: 'grain' },
        { id: 4, name: 'CHEMISTRY', teacher_code: 'CY', color: 'green', icon_type: 'icon', icon: 'science' }
      ]
    }));

    await onAddNewDay({
      date: dateStr,
      isoDate: newDayIso,
      dayName: dayName,
      classes: starterClasses
    });

    setShowAddDayModal(false);
  };

  const handleConfirmAddClass = async () => {
    if (!newClassName.trim() || !targetDayForClass) return;
    await onAddClassToDay(targetDayForClass, newClassName.trim().toUpperCase());
    setShowAddClassModal(false);
    setNewClassName('');
  };

  // Zipping / Batch Export State
  const [zippingDayDate, setZippingDayDate] = useState<string | null>(null);
  const [zipProgressText, setZipProgressText] = useState<string>('');

  // Quick download helper
  const handleQuickDownload = async (dayDate: string, c: any) => {
    const key = `${dayDate}_${c.class_name}`;
    setDownloadingClassKey(key);
    setQuickExportTarget({ dayDate, classData: c });

    setTimeout(async () => {
      try {
        await downloadTimetableCardImage(c.class_name, dayDate, 'quick-export-poster-card');
      } catch (e) {
        console.error('Quick download failed:', e);
      } finally {
        setDownloadingClassKey(null);
        setQuickExportTarget(null);
      }
    }, 120);
  };

  // Robust Sequential ZIP Exporter for all cards in a day (bypasses browser multi-download limits)
  const handleDownloadDayAsZip = async (day: DaySchedule) => {
    if (!day.classes || day.classes.length === 0) return;
    setZippingDayDate(day.date);
    setZipProgressText(`Preparing 0/${day.classes.length}...`);

    const files: Array<{ name: string; blob: Blob }> = [];
    const cleanDate = day.date.replace(/[\/\.\-]/g, '_');

    try {
      for (let i = 0; i < day.classes.length; i++) {
        const cls = day.classes[i];
        setZipProgressText(`Rendering ${i + 1}/${day.classes.length}: ${cls.class_name}...`);
        
        // 1. Mount offscreen
        setQuickExportTarget({ dayDate: day.date, classData: cls });
        
        // 2. Allow DOM and fonts to settle
        await new Promise(resolve => setTimeout(resolve, 140));
        
        // 3. Capture blob
        const blob = await captureTimetableCardBlob('quick-export-poster-card');
        const cleanBatch = (cls.class_name || 'CLASS').replace(/\s+/g, '_');
        files.push({
          name: `TIMETABLE_${cleanBatch}_${cleanDate}.png`,
          blob
        });
      }

      setZipProgressText('Packaging ZIP archive...');
      const zipBlob = await createTimetableZipArchive(day.date, files);
      saveAs(zipBlob, `TIMETABLES_${cleanDate}.zip`);
    } catch (err) {
      console.error('Batch ZIP export failed:', err);
      alert('Failed to package timetable images into ZIP. Please try downloading individually.');
    } finally {
      setZippingDayDate(null);
      setZipProgressText('');
      setQuickExportTarget(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 border border-slate-200 shadow-sm rounded-none">
        <div>
          <div className="flex items-center gap-2 text-xl font-black text-[#062e5b]">
            <CalendarDays className="w-6 h-6 text-[#062e5b]" />
            Timetable Manager
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Day-wise schedule dashboard, AI timetable scanner, and high-resolution poster card generator.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search day or class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 w-44 text-slate-900 font-medium focus:border-[#062e5b] focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowMappingsModal(true)}
            className="px-3 py-1.5 text-xs font-bold border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            Teacher Mappings
          </button>

          <button
            onClick={() => setShowAiSettingsModal(true)}
            className="px-3 py-1.5 text-xs font-bold border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors relative"
            title="Configure Timetable AI API Key, Gemini Model & Primary Priority"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            AI Settings
            {aiConfig.customApiKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" title="Custom AI Key Active" />
            )}
          </button>

          <button
            onClick={() => setShowPasteModal(true)}
            className="px-3 py-1.5 text-xs font-bold border border-emerald-600 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/60 flex items-center gap-1.5 transition-colors"
            title="Paste timetable table directly from Excel, Sheets, or text without AI"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-emerald-600" />
            Paste from Clipboard
          </button>

          <button
            onClick={() => setShowScanModal(true)}
            className="px-3 py-1.5 text-xs font-bold border border-[#78b82a] text-[#5c921c] hover:bg-[#78b82a]/10 flex items-center gap-1.5 transition-colors"
          >
            <ScanLine className="w-3.5 h-3.5" />
            Scan Image
          </button>


          <button
            onClick={() => setShowAddDayModal(true)}
            className="px-3.5 py-1.5 text-xs font-bold border border-[#062e5b] text-[#062e5b] hover:bg-[#062e5b]/10 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Day
          </button>

          <button
            onClick={onCreateNewCardDirect}
            className="px-4 py-1.5 text-xs font-bold bg-[#062e5b] hover:bg-[#0d427d] text-white flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Class Card
          </button>
        </div>
      </div>

      {/* Days List */}
      {filteredDays.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-slate-700">
              No timetable schedules configured
            </h3>
            <p className="text-xs text-slate-500">
              Scan a timetable image or add a new schedule day to get started.
            </p>
          </div>
          <div className="flex justify-center flex-wrap gap-3">
            <button
              onClick={() => setShowPasteModal(true)}
              className="px-4 py-2 text-xs font-bold border border-emerald-600 text-emerald-700 hover:bg-emerald-50 flex items-center gap-1.5"
            >
              <ClipboardPaste className="w-4 h-4" /> Paste Excel / Text
            </button>
            <button
              onClick={() => setShowScanModal(true)}
              className="px-4 py-2 text-xs font-bold border border-[#78b82a] text-[#5c921c] hover:bg-[#78b82a]/10 flex items-center gap-1.5"
            >
              <ScanLine className="w-4 h-4" /> Scan Timetable Image
            </button>
            <button
              onClick={() => setShowAddDayModal(true)}
              className="px-4 py-2 text-xs font-bold bg-[#062e5b] text-white hover:bg-[#0d427d] flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Schedule Day
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredDays.map(day => {
            const isToday = day.date === todayStr;
            const isTomorrow = day.date === tomorrowStr;
            const classCount = (day.classes || []).length;

            return (
              <div
                key={day.date}
                className={`bg-white p-4 sm:p-5 border transition-all ${
                  isToday
                    ? 'border-2 border-[#062e5b] shadow-md'
                    : 'border-slate-200 shadow-sm'
                }`}
              >
                {/* Day Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 flex items-center justify-center font-bold ${
                        isToday ? 'bg-[#062e5b] text-white' : 'bg-slate-100 text-[#062e5b]'
                      }`}
                    >
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-[#062e5b]">
                          {day.dayName || 'Schedule Day'}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          ({day.date})
                        </span>
                        {isToday && (
                          <span className="px-2 py-0.5 bg-blue-600 text-white font-extrabold text-[10px]">
                            TODAY
                          </span>
                        )}
                        {isTomorrow && (
                          <span className="px-2 py-0.5 bg-[#78b82a]/20 text-[#5c921c] font-extrabold text-[10px]">
                            TOMORROW
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {classCount} {classCount === 1 ? 'class configured' : 'classes configured'}
                      </span>
                    </div>
                  </div>

                  {/* Day Action Buttons */}
                  <div className="flex items-center flex-wrap gap-2">
                    {/* Download All as ZIP Button */}
                    <button
                      onClick={() => handleDownloadDayAsZip(day)}
                      disabled={zippingDayDate === day.date || !day.classes || day.classes.length === 0}
                      className="px-2.5 py-1 text-xs font-bold border border-amber-400 text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      title="Download all class timetable cards for this day as a single ZIP file"
                    >
                      {zippingDayDate === day.date ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                          <span>{zipProgressText || 'Packaging...'}</span>
                        </>
                      ) : (
                        <>
                          <Archive className="w-3.5 h-3.5 text-amber-700" />
                          <span>Download All ({classCount})</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setTargetDayForClass(day.date);
                        setNewClassName('');
                        setShowAddClassModal(true);
                      }}
                      className="px-2.5 py-1 text-xs font-bold border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Class
                    </button>

                    <button
                      onClick={() => onDuplicateDay(day)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      title="Duplicate schedule to tomorrow"
                    >
                      <Copy className="w-3.5 h-3.5" /> Duplicate to Tomorrow
                    </button>

                    <button
                      onClick={() => onDeleteDay(day.date)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Delete day"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Classes Grid */}
                {(!day.classes || day.classes.length === 0) ? (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 mt-3 border border-slate-200">
                    No classes configured for this day. Click &quot;Add Class&quot; above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-3.5">
                    {day.classes.map((c, cIdx) => {
                      return (
                        <div
                          key={`${day.date}_${c.class_name}_${cIdx}`}
                          className="p-3.5 bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-[#062e5b] transition-colors shadow-xs"
                        >
                          <div>
                            {/* Class Header */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2 py-0.5 bg-[#062e5b] text-white font-black text-xs tracking-wider">
                                {c.class_name}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => setDuplicateTarget({ dayDate: day.date, classData: c })}
                                  className="p-1 text-slate-600 hover:text-[#062e5b] hover:bg-slate-200"
                                  title={`Duplicate ${c.class_name} timetable card`}
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleQuickDownload(day.date, c)}
                                  className="p-1 text-[#062e5b] hover:bg-slate-200"
                                  title="Quick Download PNG Card"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteClassFromDay(day.date, c.class_name)}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  title="Remove Class"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Timing */}
                            <div className="flex items-center gap-1 text-xs font-bold text-[#5c921c] mb-2">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{c.time || '8.30 am – 5.00 pm'}</span>
                            </div>

                            {/* Subjects Pills */}
                            <div className="flex flex-wrap gap-1 mb-2.5">
                              {(c.subjects || []).map((s: any, idx: number) => {
                                const isGreen = s.color === 'green';
                                return (
                                  <span
                                    key={idx}
                                    className={`px-1.5 py-0.5 text-[10px] font-bold border ${
                                      isGreen
                                        ? 'bg-[#78b82a]/15 text-[#5c921c] border-[#78b82a]/30'
                                        : 'bg-[#062e5b]/10 text-[#062e5b] border-[#062e5b]/20'
                                    }`}
                                  >
                                    {s.name} {s.teacher_code ? `(${s.teacher_code.replace(/[\(\)]/g, '')})` : ''}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Extra Note / Improvement Exam */}
                            {c.extra_note && (
                              <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 text-[10px] font-extrabold">
                                <span>★</span> {c.extra_note}
                              </div>
                            )}

                            {/* APT Exam */}
                            {c.apt_exam && (
                              <div className="mb-2 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                                APT: {c.apt_exam}
                              </div>
                            )}
                          </div>

                          {/* Open Editor Button */}
                          <button
                            onClick={() => onOpenClassEditor(day.date, c)}
                            className="mt-2 w-full py-1.5 text-xs font-bold bg-[#062e5b] hover:bg-[#0d427d] text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit Timetable Card
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Teacher Mappings Modal */}
      <TeacherMappingsModal
        isOpen={showMappingsModal}
        onClose={() => setShowMappingsModal(false)}
        mappings={teacherMappings}
        onSave={(newMappings) => {
          onUpdateTeacherMappings(newMappings);
        }}
      />

      {/* Scan Image Modal */}
      <ScanTimetableModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        teacherMappings={teacherMappings}
        onUpdateMappings={onUpdateTeacherMappings}
        onImport={(scannedData) => {
          onAddNewDay({
            date: scannedData.date,
            isoDate: scannedData.isoDate,
            dayName: scannedData.dayName,
            classes: scannedData.classes
          });
        }}
      />

      {/* AI Settings Modal */}
      <TimetableAiSettingsModal
        isOpen={showAiSettingsModal}
        onClose={() => setShowAiSettingsModal(false)}
        onSaved={(newCfg) => {
          setAiConfig(newCfg);
        }}
      />

      {/* Paste Timetable Modal (Direct Excel / Text Paste without AI) */}
      <PasteTimetableModal
        isOpen={showPasteModal}
        onClose={() => setShowPasteModal(false)}
        teacherMappings={teacherMappings}
        onUpdateMappings={onUpdateTeacherMappings}
        onImport={(pastedData) => {
          onAddNewDay({
            date: pastedData.date,
            isoDate: pastedData.isoDate,
            dayName: pastedData.dayName,
            classes: pastedData.classes
          });
        }}
      />

      {/* Duplicate Class Modal */}
      {duplicateTarget && (
        <DuplicateClassModal
          isOpen={!!duplicateTarget}
          onClose={() => setDuplicateTarget(null)}
          sourceDayDate={duplicateTarget.dayDate}
          sourceClassData={duplicateTarget.classData}
          availableDays={days.map(d => ({ date: d.date, dayName: d.dayName }))}
          onConfirmDuplicate={onDuplicateClass}
        />
      )}


      {/* Add Day Modal */}
      {showAddDayModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-black text-sm text-[#062e5b] flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Add Schedule Day
              </span>
              <button onClick={() => setShowAddDayModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Pick Date:
              </label>
              <input
                type="date"
                value={newDayIso}
                onChange={(e) => setNewDayIso(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 font-bold focus:border-[#062e5b] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Starter Classes for this Day:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_CLASSES.map(c => {
                  const isSel = selectedStarterClasses.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        if (isSel) {
                          setSelectedStarterClasses(selectedStarterClasses.filter(x => x !== c));
                        } else {
                          setSelectedStarterClasses([...selectedStarterClasses, c]);
                        }
                      }}
                      className={`px-2 py-0.5 text-xs font-bold transition-colors ${
                        isSel ? 'bg-[#062e5b] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowAddDayModal(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={handleConfirmAddDay}
                className="px-4 py-1.5 text-xs font-bold bg-[#062e5b] text-white hover:bg-[#0d427d] shadow-sm"
              >
                Create Schedule Day
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Class to Day Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-black text-sm text-[#062e5b]">
                Add Class to {targetDayForClass}
              </span>
              <button onClick={() => setShowAddClassModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Presets:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_CLASSES.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setNewClassName(b)}
                    className={`px-2 py-0.5 text-xs font-bold ${
                      newClassName === b ? 'bg-[#062e5b] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Class / Batch Name:
              </label>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value.toUpperCase())}
                placeholder="e.g. PLUS ONE, B1"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 text-slate-900 font-bold focus:border-[#062e5b] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setShowAddClassModal(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={handleConfirmAddClass}
                disabled={!newClassName.trim()}
                className="px-4 py-1.5 text-xs font-bold bg-[#062e5b] text-white hover:bg-[#0d427d] disabled:opacity-50 shadow-sm"
              >
                Add Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Offscreen Export Mount (visible to renderer with width 480px, placed outside viewport) */}
      {quickExportTarget && (
        <div
          style={{
            position: 'fixed',
            left: '-9999px',
            top: '0',
            width: '480px',
            pointerEvents: 'none',
            zIndex: -9999
          }}
        >
          <PosterCardPreview
            id="quick-export-poster-card"
            batchName={quickExportTarget.classData.class_name}
            title={quickExportTarget.classData.title || `${quickExportTarget.classData.class_name} - TIME TABLE`}
            date={quickExportTarget.dayDate}
            time={quickExportTarget.classData.time || '8.30.00 am – 5.00 pm'}
            aptExam={quickExportTarget.classData.apt_exam || ''}
            extraNote={quickExportTarget.classData.extra_note || ''}
            phone1={quickExportTarget.classData.phone1 || '9072651666'}
            phone2={quickExportTarget.classData.phone2 || '9072652666'}
            subjects={quickExportTarget.classData.subjects || []}
          />
        </div>
      )}
    </div>
  );
};
