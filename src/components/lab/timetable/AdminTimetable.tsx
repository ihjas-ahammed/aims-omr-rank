import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ArrowLeft, Cloud, CloudCheck, RefreshCw } from 'lucide-react';
import { TimetableManager } from './TimetableManager';
import { TimetableEditor } from './TimetableEditor';
import { 
  getTimetablesDataset, 
  saveTimetablesDataset, 
  getTeacherMappingsData, 
  saveTeacherMappingsData,
  DEFAULT_TEACHER_MAPPINGS
} from '../../../services/firebaseService';

const LOCAL_STORAGE_DAYS_KEY = 'aims_timetables_dataset_cache';
const LOCAL_STORAGE_MAPPINGS_KEY = 'aims_teacher_mappings_cache';

interface Props {
  onBack?: () => void;
}

export default function AdminTimetable({ onBack }: Props) {
  const [screen, setScreen] = useState<'manager' | 'editor'>('manager');

  // Fast synchronous initial cache retrieval (0ms loading!)
  const [days, setDays] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_DAYS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.days || [];
      }
    } catch (e) {}
    return [];
  });

  const [teacherMappings, setTeacherMappings] = useState<Record<string, string>>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_MAPPINGS_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {}
    return { ...DEFAULT_TEACHER_MAPPINGS };
  });

  // Only show blocking loader if local cache is completely empty on first launch
  const [loading, setLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_DAYS_KEY);
      return !cached;
    } catch (e) {
      return true;
    }
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Selected Day & Class for Editor
  const [selectedDayDate, setSelectedDayDate] = useState<string>('');
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>('');
  const [selectedClassName, setSelectedClassName] = useState<string>('PLUS ONE');
  const [selectedClassData, setSelectedClassData] = useState<any>(null);

  useEffect(() => {
    document.title = "AIMS - Timetable Manager";
    // Sync with Firebase in background immediately
    syncWithDatabase();
    return () => {
      document.title = "OMR Checker Pro";
    };
  }, []);

  const syncWithDatabase = useCallback(async () => {
    setIsSyncing(true);
    try {
      const [ds, mappings] = await Promise.all([
        getTimetablesDataset(),
        getTeacherMappingsData()
      ]);

      if (ds && Array.isArray(ds.days)) {
        setDays(ds.days);
        try {
          localStorage.setItem(LOCAL_STORAGE_DAYS_KEY, JSON.stringify(ds));
        } catch (e) {}
      }

      if (mappings && Object.keys(mappings).length > 0) {
        setTeacherMappings(mappings);
        try {
          localStorage.setItem(LOCAL_STORAGE_MAPPINGS_KEY, JSON.stringify(mappings));
        } catch (e) {}
      }

      setLastSyncedAt(new Date());
    } catch (e) {
      console.warn("Background Firebase sync note:", e);
    } finally {
      setIsSyncing(false);
      setLoading(false);
    }
  }, []);

  const persistDays = async (newDays: any[]) => {
    // 1. Immediate local update (0ms UI latency)
    setDays(newDays);
    try {
      localStorage.setItem(LOCAL_STORAGE_DAYS_KEY, JSON.stringify({ days: newDays }));
    } catch (e) {}

    // 2. Background Firestore synchronization
    setIsSyncing(true);
    try {
      await saveTimetablesDataset({ days: newDays });
      setLastSyncedAt(new Date());
    } catch (e) {
      console.error("Failed to save timetables dataset to Firebase:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const persistTeacherMappings = async (newMappings: Record<string, string>) => {
    // 1. Immediate local update
    setTeacherMappings(newMappings);
    try {
      localStorage.setItem(LOCAL_STORAGE_MAPPINGS_KEY, JSON.stringify(newMappings));
    } catch (e) {}

    // 2. Background Firestore update
    setIsSyncing(true);
    try {
      await saveTeacherMappingsData(newMappings);
      setLastSyncedAt(new Date());
    } catch (e) {
      console.error("Failed to save teacher mappings to Firebase:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenClassEditor = (dayDate: string, classData: any) => {
    const day = days.find(d => d.date === dayDate);
    setSelectedDayDate(dayDate);
    setSelectedIsoDate(day?.isoDate || '');
    setSelectedClassName(classData.class_name);
    setSelectedClassData(classData);
    setScreen('editor');
  };

  const handleCreateNewCardDirect = () => {
    const now = new Date();
    const dStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    setSelectedDayDate(dStr);
    setSelectedIsoDate(now.toISOString().split('T')[0]);
    setSelectedClassName('PLUS ONE');
    setSelectedClassData(null);
    setScreen('editor');
  };

  const handleSaveClassFromEditor = async (savedClassData: any) => {
    const targetDate = savedClassData.date;
    const targetIso = savedClassData.isoDate;
    const targetDayName = new Date(targetIso).toLocaleDateString('en-US', { weekday: 'long' });

    const existingDayIdx = days.findIndex(d => d.date === targetDate);
    let updatedDays = [...days];

    if (existingDayIdx >= 0) {
      const existingDay = updatedDays[existingDayIdx];
      const classes = [...(existingDay.classes || [])];
      const cIdx = classes.findIndex(c => c.class_name === savedClassData.class_name || c.class_name === selectedClassName);
      if (cIdx >= 0) {
        classes[cIdx] = savedClassData;
      } else {
        classes.push(savedClassData);
      }
      updatedDays[existingDayIdx] = {
        ...existingDay,
        date: targetDate,
        isoDate: targetIso,
        classes
      };
    } else {
      updatedDays.unshift({
        date: targetDate,
        isoDate: targetIso,
        dayName: targetDayName,
        classes: [savedClassData]
      });
    }

    await persistDays(updatedDays);
    setSelectedDayDate(targetDate);
    setSelectedClassName(savedClassData.class_name);
  };

  const handleAddNewDay = async (newDay: any) => {
    const updated = [newDay, ...days.filter(d => d.date !== newDay.date)];
    await persistDays(updated);
  };

  const handleDeleteDay = async (dateStr: string) => {
    if (!window.confirm(`Delete timetable schedule for ${dateStr}?`)) return;
    const updated = days.filter(d => d.date !== dateStr);
    await persistDays(updated);
  };

  const handleDuplicateDay = async (sourceDay: any) => {
    const tm = new Date();
    tm.setDate(tm.getDate() + 1);
    const nextDate = `${String(tm.getDate()).padStart(2, '0')}/${String(tm.getMonth() + 1).padStart(2, '0')}/${tm.getFullYear()}`;
    const nextIso = tm.toISOString().split('T')[0];
    const nextDayName = tm.toLocaleDateString('en-US', { weekday: 'long' });

    if (days.some(d => d.date === nextDate)) {
      alert(`Schedule for tomorrow (${nextDate}) already exists.`);
      return;
    }

    const cloned = {
      date: nextDate,
      isoDate: nextIso,
      dayName: nextDayName,
      classes: JSON.parse(JSON.stringify(sourceDay.classes || []))
    };

    const updated = [cloned, ...days];
    await persistDays(updated);
  };

  const handleAddClassToDay = async (dateStr: string, newClassName: string) => {
    const updated = days.map(d => {
      if (d.date === dateStr) {
        const classes = d.classes || [];
        if (classes.some((c: any) => c.class_name === newClassName)) return d;
        const newClass = {
          class_name: newClassName,
          title: `${newClassName} - TIME TABLE`,
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
        };
        return { ...d, classes: [...classes, newClass] };
      }
      return d;
    });
    await persistDays(updated);
  };

  const handleDeleteClassFromDay = async (dateStr: string, className: string) => {
    if (!window.confirm(`Delete ${className} from ${dateStr}?`)) return;
    const updated = days.map(d => {
      if (d.date === dateStr) {
        return { ...d, classes: (d.classes || []).filter((c: any) => c.class_name !== className) };
      }
      return d;
    });
    await persistDays(updated);
  };

  const handleDuplicateClass = async (
    sourceDate: string,
    sourceClassData: any,
    newClassName: string,
    targetDate: string
  ) => {
    let updatedDays = [...days];
    const targetIdx = updatedDays.findIndex(d => d.date === targetDate);

    const clonedClass = {
      ...JSON.parse(JSON.stringify(sourceClassData)),
      class_name: newClassName,
      title: `${newClassName} - TIME TABLE`,
    };

    if (targetIdx >= 0) {
      const targetDay = updatedDays[targetIdx];
      const classes = [...(targetDay.classes || [])];
      const existingClassIdx = classes.findIndex(c => c.class_name === newClassName);
      if (existingClassIdx >= 0) {
        classes[existingClassIdx] = clonedClass;
      } else {
        classes.push(clonedClass);
      }
      updatedDays[targetIdx] = {
        ...targetDay,
        classes
      };
    } else {
      const parts = targetDate.split('/');
      let targetIso = '';
      let targetDayName = '';
      if (parts.length === 3) {
        const [d, m, y] = parts;
        targetIso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        const dt = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
        targetDayName = dt.toLocaleDateString('en-US', { weekday: 'long' });
      }
      updatedDays.unshift({
        date: targetDate,
        isoDate: targetIso,
        dayName: targetDayName,
        classes: [clonedClass]
      });
    }

    await persistDays(updatedDays);
  };

  if (loading && days.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#062e5b]" />
        <span className="text-xs font-bold text-slate-500">Loading Timetable Manager...</span>
      </div>
    );
  }

  if (screen === 'editor') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <TimetableEditor
          initialDate={selectedDayDate}
          initialIsoDate={selectedIsoDate}
          initialClassName={selectedClassName}
          initialClassData={selectedClassData}
          onBack={() => setScreen('manager')}
          onSave={handleSaveClassFromEditor}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar Header (Replaces default global OMR Checker header) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                title="Return to Lab"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <img
                src="/logo01.png"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo0.png';
                }}
                alt="AIMS PLUS"
                className="h-10 w-auto max-w-[130px] object-contain block"
              />
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div>
                <h1 className="text-sm font-black text-[#062e5b] leading-tight flex items-center gap-1.5">
                  <span>Timetable System</span>
                  <span className="px-1.5 py-0.2 bg-[#78b82a]/20 text-[#5c921c] font-black text-[9px]">
                    PLUS
                  </span>
                </h1>
                <p className="text-[11px] font-medium text-slate-500">
                  AI Schedule Scanner & Poster Generator
                </p>
              </div>
            </div>
          </div>

          {/* Sync Status Badge */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isSyncing
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
              title={lastSyncedAt ? `Last cloud sync: ${lastSyncedAt.toLocaleTimeString()}` : 'Cloud Synced'}
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Cloud Synced</span>
                </>
              )}
            </div>

            <button
              onClick={() => syncWithDatabase()}
              disabled={isSyncing}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh from Cloud"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-3 sm:p-6">
        <TimetableManager
          days={days}
          teacherMappings={teacherMappings}
          onOpenClassEditor={handleOpenClassEditor}
          onAddNewDay={handleAddNewDay}
          onDeleteDay={handleDeleteDay}
          onDuplicateDay={handleDuplicateDay}
          onAddClassToDay={handleAddClassToDay}
          onDeleteClassFromDay={handleDeleteClassFromDay}
          onDuplicateClass={handleDuplicateClass}
          onUpdateTeacherMappings={persistTeacherMappings}
          onCreateNewCardDirect={handleCreateNewCardDirect}
        />
      </main>
    </div>
  );
}
