import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  NCERT_SYLLABUS_DATA, 
  NCERTSubject, 
  NCERTChapter, 
  NCERTSubtopic, 
  TEACHER_PRESET_NAMES,
  TEACHER_SUBJECT_OPTIONS,
  getGradeForBatch, 
  getSubjectsForBatch, 
  findSubjectById,
  findSubjectByNameAndGrade
} from '../../../data/ncertSyllabusData';
import { 
  TeacherProfile, 
  TeacherLogRecord, 
  SubtopicProgress,
  getLocalTeacherProfile, 
  saveLocalTeacherProfile, 
  getAllSavedTeacherProfiles,
  fetchTeacherLog, 
  toggleSubtopicStatus, 
  bulkUpdateChapterSubtopics,
  subscribeTeacherLog
} from '../../../services/teacherLogService';
import { 
  CheckCircle2, 
  Circle, 
  User, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Clock, 
  CheckCheck, 
  RotateCcw, 
  ArrowRight, 
  Edit3, 
  Users, 
  ShieldCheck, 
  Layers, 
  Zap, 
  FlaskConical, 
  Dna, 
  Calculator, 
  MessageSquare, 
  ExternalLink,
  CheckSquare,
  Square,
  AlertCircle,
  School,
  ArrowLeftRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TeacherLogFormProps {
  onNavigateAdmin?: () => void;
}

export default function TeacherLogForm({ onNavigateAdmin }: TeacherLogFormProps) {
  const [profile, setProfile] = useState<TeacherProfile | null>(() => getLocalTeacherProfile());
  const [savedProfiles, setSavedProfiles] = useState<TeacherProfile[]>(() => getAllSavedTeacherProfiles());
  
  // Ask class & teacher info on load if not yet confirmed for this session or if profile is missing
  const [isClassPickerOpen, setIsClassPickerOpen] = useState(() => {
    const sessionConfirmed = sessionStorage.getItem('aims_teacher_session_active');
    return !sessionConfirmed || !profile?.name;
  });

  // Profile Form State
  const [inputName, setInputName] = useState(profile?.name || '');
  const [inputSubjects, setInputSubjects] = useState<string[]>(profile?.subjects || ['Physics']);
  const [inputBatch, setInputBatch] = useState<string>(profile?.selectedBatch || 'B1');
  const [inputSubjectId, setInputSubjectId] = useState<string>(profile?.selectedSubjectId || 'physics_12');

  // Active View State
  const activeBatch = profile?.selectedBatch || 'B1';
  const gradeKey = getGradeForBatch(activeBatch);
  const availableSubjects = useMemo(() => getSubjectsForBatch(activeBatch), [activeBatch]);
  
  // Resolve active subject
  const activeSubjectId = useMemo(() => {
    if (profile?.selectedSubjectId && availableSubjects.some(s => s.id === profile.selectedSubjectId)) {
      return profile.selectedSubjectId;
    }
    if (profile?.subjects && profile.subjects.length > 0) {
      const match = findSubjectByNameAndGrade(profile.subjects[0], gradeKey);
      if (match) return match.id;
    }
    return availableSubjects[0]?.id || 'physics_12';
  }, [profile, availableSubjects, gradeKey]);

  const activeSubject = useMemo(() => {
    return availableSubjects.find(s => s.id === activeSubjectId) || availableSubjects[0];
  }, [availableSubjects, activeSubjectId]);

  // Log Data State
  const [logRecord, setLogRecord] = useState<TeacherLogRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Notes Modal State
  const [activeNoteSubtopic, setActiveNoteSubtopic] = useState<{ id: string; title: string; code: string; notes: string } | null>(null);

  useEffect(() => {
    document.title = "AIMS Teacher's Log";
  }, []);

  // Realtime subscription for current batch & subject
  useEffect(() => {
    if (!activeBatch || !activeSubjectId) return;
    setIsLoading(true);

    const unsubscribe = subscribeTeacherLog(activeBatch, activeSubjectId, (data) => {
      setLogRecord(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [activeBatch, activeSubjectId]);

  // Auto-expand chapters initially
  useEffect(() => {
    if (activeSubject) {
      const initial: Record<string, boolean> = {};
      activeSubject.chapters.forEach(ch => {
        initial[ch.id] = true;
      });
      setExpandedChapters(initial);
    }
  }, [activeSubject?.id]);

  const handleConfirmClassAndTeacher = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputName.trim()) return;

    const newProfile: TeacherProfile = {
      name: inputName.trim(),
      subjects: inputSubjects.length > 0 ? inputSubjects : ['Physics'],
      selectedBatch: inputBatch,
      selectedSubjectId: inputSubjectId
    };

    saveLocalTeacherProfile(newProfile);
    setProfile(newProfile);
    setSavedProfiles(getAllSavedTeacherProfiles());
    sessionStorage.setItem('aims_teacher_session_active', 'true');
    setIsClassPickerOpen(false);
  };

  const handleBatchSwitch = (newBatch: string) => {
    if (!profile) return;
    const nextGrade = getGradeForBatch(newBatch);
    const nextSubjects = getSubjectsForBatch(newBatch);
    
    let nextSubId = nextSubjects[0]?.id || '';
    if (activeSubject) {
      const matched = findSubjectByNameAndGrade(activeSubject.name, nextGrade);
      if (matched) nextSubId = matched.id;
    }

    const updated: TeacherProfile = {
      ...profile,
      selectedBatch: newBatch,
      selectedSubjectId: nextSubId
    };
    saveLocalTeacherProfile(updated);
    setProfile(updated);
  };

  const handleSubjectSwitch = (newSubjectId: string) => {
    if (!profile) return;
    const updated: TeacherProfile = {
      ...profile,
      selectedSubjectId: newSubjectId
    };
    saveLocalTeacherProfile(updated);
    setProfile(updated);
  };

  const handleToggleSubtopic = async (subtopicId: string, currentStatus: boolean) => {
    if (!profile || !activeSubject) return;
    setSyncStatus('saving');

    const nextStatus = !currentStatus;

    // Optimistic UI Update
    setLogRecord(prev => {
      const existing = prev?.subtopics || {};
      const updatedSubtopics: Record<string, SubtopicProgress> = {
        ...existing,
        [subtopicId]: {
          completed: nextStatus,
          completedAt: nextStatus ? new Date().toISOString() : null,
          teacherName: profile.name,
          notes: existing[subtopicId]?.notes || ''
        }
      };
      const completedCount = Object.values(updatedSubtopics).filter(s => s.completed).length;
      const totalCount = activeSubject.chapters.reduce((acc, ch) => acc + ch.subtopics.length, 0);
      return {
        id: `${activeBatch}_${activeSubject.id}`,
        batch: activeBatch,
        gradeKey,
        subjectId: activeSubject.id,
        subjectName: activeSubject.name,
        subtopics: updatedSubtopics,
        completedCount,
        totalCount,
        percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        lastUpdated: new Date().toISOString(),
        lastTeacher: profile.name
      };
    });

    if (nextStatus) {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#3b82f6', '#10b981', '#6366f1']
      });
    }

    try {
      await toggleSubtopicStatus({
        batch: activeBatch,
        subjectId: activeSubject.id,
        subtopicId,
        completed: nextStatus,
        teacherName: profile.name
      });
      setSyncStatus('synced');
    } catch (err) {
      console.error('Failed to sync subtopic toggle:', err);
      setSyncStatus('offline');
    }
  };

  const handleBulkChapterToggle = async (chapter: NCERTChapter, markCompleted: boolean) => {
    if (!profile || !activeSubject) return;
    const subtopicIds = chapter.subtopics.map(s => s.id);
    setSyncStatus('saving');

    if (markCompleted) {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b']
      });
    }

    try {
      const updated = await bulkUpdateChapterSubtopics({
        batch: activeBatch,
        subjectId: activeSubject.id,
        subtopicIds,
        completed: markCompleted,
        teacherName: profile.name
      });
      setLogRecord(updated);
      setSyncStatus('synced');
    } catch (err) {
      console.error('Failed to bulk toggle chapter:', err);
      setSyncStatus('offline');
    }
  };

  const handleSaveNote = async () => {
    if (!activeNoteSubtopic || !profile || !activeSubject) return;
    const isDone = logRecord?.subtopics?.[activeNoteSubtopic.id]?.completed || false;
    
    setSyncStatus('saving');
    try {
      await toggleSubtopicStatus({
        batch: activeBatch,
        subjectId: activeSubject.id,
        subtopicId: activeNoteSubtopic.id,
        completed: isDone,
        teacherName: profile.name,
        notes: activeNoteSubtopic.notes.trim()
      });
      setSyncStatus('synced');
      setActiveNoteSubtopic(null);
    } catch (err) {
      console.error('Failed to save note:', err);
      setSyncStatus('offline');
    }
  };

  const toggleChapterExpand = (chapterId: string) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  // Progress metrics
  const totalSubtopics = useMemo(() => {
    if (!activeSubject) return 0;
    return activeSubject.chapters.reduce((acc, ch) => acc + ch.subtopics.length, 0);
  }, [activeSubject]);

  const completedSubtopics = useMemo(() => {
    if (!logRecord?.subtopics) return 0;
    return Object.values(logRecord.subtopics).filter(s => s.completed).length;
  }, [logRecord]);

  const progressPercentage = totalSubtopics > 0 ? Math.round((completedSubtopics / totalSubtopics) * 100) : 0;

  // Filtered chapters & subtopics based on search & tab
  const filteredChapters = useMemo(() => {
    if (!activeSubject) return [];
    const q = searchQuery.toLowerCase().trim();

    return activeSubject.chapters.map(ch => {
      const matchedSubtopics = ch.subtopics.filter(sub => {
        const isDone = !!logRecord?.subtopics?.[sub.id]?.completed;
        const matchesQuery = !q || sub.title.toLowerCase().includes(q) || sub.code.toLowerCase().includes(q) || ch.title.toLowerCase().includes(q);
        
        if (!matchesQuery) return false;
        if (statusFilter === 'completed') return isDone;
        if (statusFilter === 'pending') return !isDone;
        return true;
      });

      const chapterCompletedCount = ch.subtopics.filter(s => logRecord?.subtopics?.[s.id]?.completed).length;
      const chapterTotalCount = ch.subtopics.length;
      const chapterPct = chapterTotalCount > 0 ? Math.round((chapterCompletedCount / chapterTotalCount) * 100) : 0;

      return {
        ...ch,
        subtopics: matchedSubtopics,
        chapterCompletedCount,
        chapterTotalCount,
        chapterPct
      };
    }).filter(ch => ch.subtopics.length > 0 || !searchQuery);
  }, [activeSubject, logRecord, searchQuery, statusFilter]);

  const getSubjectIcon = (id: string) => {
    if (id.includes('phy')) return <Zap className="w-4 h-4 text-rose-500" />;
    if (id.includes('chem')) return <FlaskConical className="w-4 h-4 text-purple-500" />;
    if (id.includes('bio')) return <Dna className="w-4 h-4 text-emerald-500" />;
    if (id.includes('math')) return <Calculator className="w-4 h-4 text-cyan-500" />;
    return <BookOpen className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 sm:pb-16 font-sans">
      
      {/* Top Sticky Navigation Header - Optimized for Mobile & Touch */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm font-black text-sm sm:text-base shrink-0">
              A
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                  Teacher's Log
                </h1>
                <span className="hidden xs:inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  NCERT
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                {profile?.name ? `Logged as: ${profile.name}` : 'Curriculum Tracker'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Quick Change Class & Teacher Button */}
            <button
              onClick={() => {
                setInputName(profile?.name || '');
                setInputSubjects(profile?.subjects || ['Physics']);
                setInputBatch(profile?.selectedBatch || 'B1');
                setInputSubjectId(profile?.selectedSubjectId || 'physics_12');
                setIsClassPickerOpen(true);
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 active:scale-95"
              title="Change teacher or active class"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-extrabold text-slate-900">{profile?.name || 'Set Teacher'}</span>
              <Edit3 className="w-3 h-3 text-slate-400 hidden sm:inline ml-0.5" />
            </button>

            {/* Admin Matrix Link */}
            <button
              onClick={() => {
                if (onNavigateAdmin) {
                  onNavigateAdmin();
                } else {
                  window.history.pushState({}, '', '/admin/teacher');
                  window.location.href = '/admin/teacher';
                }
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200 active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin Matrix</span>
            </button>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 pt-3 sm:pt-6 space-y-3 sm:space-y-5">
        
        {/* Mobile-First Class & Subject Segmented Bar */}
        <section className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs space-y-3">
          
          {/* Batch Selector Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Class / Batch:
              </span>
              <button
                onClick={() => {
                  setInputName(profile?.name || '');
                  setInputSubjects(profile?.subjects || ['Physics']);
                  setInputBatch(profile?.selectedBatch || 'B1');
                  setInputSubjectId(profile?.selectedSubjectId || 'physics_12');
                  setIsClassPickerOpen(true);
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <ArrowLeftRight className="w-3 h-3" /> Switch Class
              </button>
            </div>

            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {['B1', 'B2', 'B3'].map(b => (
                <button
                  key={b}
                  onClick={() => handleBatchSwitch(b)}
                  className={`py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all border ${
                    activeBatch === b
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span className="block text-[9px] uppercase font-bold text-blue-200 leading-none mb-0.5">Plus Two</span>
                  {b}
                </button>
              ))}

              {['A1', 'A2'].map(b => (
                <button
                  key={b}
                  onClick={() => handleBatchSwitch(b)}
                  className={`py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all border ${
                    activeBatch === b
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span className="block text-[9px] uppercase font-bold text-indigo-200 leading-none mb-0.5">Plus One</span>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Horizontal Pills (Horizontal scroll on mobile) */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Subject ({gradeKey === 'plus_two' ? 'Class 12' : 'Class 11'}):
            </span>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
              {availableSubjects.map(sub => {
                const isSelected = activeSubject?.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubjectSwitch(sub.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border active:scale-95 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span>{getSubjectIcon(sub.id)}</span>
                    <span>{sub.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </section>

        {/* Progress Overview Card (Mobile Optimized) */}
        {activeSubject && (
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg border border-slate-700/50">
            <div className="relative z-10 space-y-3 sm:space-y-4">
              
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-white/20">
                    Batch {activeBatch}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] sm:text-xs font-semibold border border-blue-400/30">
                    {gradeKey === 'plus_two' ? 'Plus Two (12th)' : 'Plus One (11th)'}
                  </span>
                </div>

                <span className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {syncStatus === 'saving' ? 'Saving...' : 'Synced'}
                </span>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="space-y-0.5">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {activeSubject.name}
                  </h2>
                  <p className="text-xs text-slate-300 font-medium">
                    {logRecord?.lastTeacher ? `Last updated by ${logRecord.lastTeacher}` : 'No progress logged yet'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-2xl sm:text-3xl font-black text-white leading-none">
                    {progressPercentage}%
                  </div>
                  <div className="text-[11px] text-slate-300 font-semibold mt-0.5">
                    {completedSubtopics} / {totalSubtopics} Topics
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
                <div 
                  className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

            </div>
          </section>
        )}

        {/* Search & Filter Toolbar */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g. Optics, 1.3)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-1 rounded-xl">
            {(['all', 'pending', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold capitalize transition-all ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {/* Chapters & Subtopics Checklist */}
        <section className="space-y-3">
          {filteredChapters.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 space-y-1">
              <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-700 text-sm">No topics found</h3>
              <p className="text-xs text-slate-400">Try adjusting your search terms.</p>
            </div>
          ) : (
            filteredChapters.map((chapter) => {
              const isExpanded = !!expandedChapters[chapter.id];
              const isFullyDone = chapter.chapterTotalCount > 0 && chapter.chapterCompletedCount === chapter.chapterTotalCount;

              return (
                <div 
                  key={chapter.id}
                  className={`bg-white rounded-2xl border transition-all duration-150 overflow-hidden shadow-xs ${
                    isFullyDone ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                  }`}
                >
                  {/* Chapter Header */}
                  <div 
                    className={`p-3.5 sm:p-4 flex items-center justify-between gap-2.5 cursor-pointer select-none transition-colors ${
                      isFullyDone ? 'hover:bg-emerald-50/30' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => toggleChapterExpand(chapter.id)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-extrabold text-xs sm:text-sm shrink-0 ${
                        isFullyDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {chapter.number}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Ch {chapter.number}
                          </span>
                          {isFullyDone && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                              Done
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate">
                          {chapter.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-600">
                        {chapter.chapterCompletedCount}/{chapter.chapterTotalCount}
                      </span>
                      <div className="w-10 sm:w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isFullyDone ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${chapter.chapterPct}%` }}
                        />
                      </div>
                      <span className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>

                  {/* Chapter Subtopics */}
                  {isExpanded && (
                    <div className="px-3 pb-3 sm:px-4 sm:pb-4 border-t border-slate-100 space-y-2 pt-2.5">
                      
                      {/* Chapter Quick Actions */}
                      <div className="flex items-center justify-between text-[11px] py-0.5 border-b border-slate-100 mb-1">
                        <span className="text-slate-400 font-medium">
                          {chapter.subtopics.length} subsections
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBulkChapterToggle(chapter, true);
                            }}
                            className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                          >
                            <CheckCheck className="w-3 h-3" /> Mark All
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBulkChapterToggle(chapter, false);
                            }}
                            className="font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Reset
                          </button>
                        </div>
                      </div>

                      {/* Subtopics List */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {chapter.subtopics.map(sub => {
                          const itemProgress = logRecord?.subtopics?.[sub.id];
                          const isDone = !!itemProgress?.completed;
                          const hasNotes = !!itemProgress?.notes?.trim();

                          return (
                            <div
                              key={sub.id}
                              onClick={() => handleToggleSubtopic(sub.id, isDone)}
                              className={`p-2.5 sm:p-3 rounded-xl border flex items-start justify-between gap-2.5 cursor-pointer transition-all active:scale-[0.99] ${
                                isDone
                                  ? 'bg-emerald-50/50 border-emerald-200'
                                  : 'bg-white border-slate-200 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <div className="pt-0.5">
                                  {isDone ? (
                                    <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white">
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white" />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                      {sub.code}
                                    </span>
                                    <span className={`text-xs font-bold leading-snug ${
                                      isDone ? 'text-slate-900' : 'text-slate-800'
                                    }`}>
                                      {sub.title}
                                    </span>
                                  </div>

                                  {isDone && (
                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap">
                                      <span className="font-semibold text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded">
                                        ✓ {itemProgress.teacherName || 'Teacher'}
                                      </span>
                                      {itemProgress.completedAt && (
                                        <span className="text-slate-400">
                                          {new Date(itemProgress.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {hasNotes && (
                                    <p className="mt-1 text-[10px] text-slate-600 italic bg-amber-50 p-1 rounded border border-amber-200">
                                      "{itemProgress.notes}"
                                    </p>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveNoteSubtopic({
                                    id: sub.id,
                                    title: sub.title,
                                    code: sub.code,
                                    notes: itemProgress?.notes || ''
                                  });
                                }}
                                className={`p-1 rounded-lg text-xs shrink-0 ${
                                  hasNotes 
                                    ? 'text-amber-600 bg-amber-100' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                                title="Add remark"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>

      </main>

      {/* Mobile Sticky Quick Switcher Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none">Active Session</span>
          <span className="text-xs font-black text-slate-900">Batch {activeBatch} • {activeSubject?.name} ({progressPercentage}%)</span>
        </div>
        <button
          onClick={() => {
            setInputName(profile?.name || '');
            setInputSubjects(profile?.subjects || ['Physics']);
            setInputBatch(profile?.selectedBatch || 'B1');
            setInputSubjectId(profile?.selectedSubjectId || 'physics_12');
            setIsClassPickerOpen(true);
          }}
          className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs active:scale-95"
        >
          Change Class
        </button>
      </div>

      {/* Class & Teacher Selection Modal - Prompted to ensure class info is explicitly asked */}
      {isClassPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Select Class & Teacher</h3>
                  <p className="text-xs text-slate-500">Pick your name and the class you are taking</p>
                </div>
              </div>
              {profile?.name && (
                <button 
                  onClick={() => setIsClassPickerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <form onSubmit={handleConfirmClassAndTeacher} className="space-y-4">
              
              {/* Teacher Selection with exact course progress presets */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
                  Teacher Name / Initials *
                </label>
                
                {/* Presets Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 mb-2">
                  {TEACHER_PRESET_NAMES.map(name => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setInputName(name)}
                      className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all border ${
                        inputName === name
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                <input 
                  type="text"
                  required
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Or enter teacher initials / name..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Class / Batch Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
                  Select Class / Batch to Log *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1.5">
                    <span className="text-[10px] font-extrabold text-blue-700 uppercase block">Plus Two (12th)</span>
                    <div className="grid grid-cols-3 gap-1">
                      {['B1', 'B2', 'B3'].map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setInputBatch(b)}
                          className={`py-2 rounded-xl text-xs font-black transition-all ${
                            inputBatch === b
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-white text-slate-700 hover:bg-blue-100/50 border border-slate-200'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-1.5">
                    <span className="text-[10px] font-extrabold text-indigo-700 uppercase block">Plus One (11th)</span>
                    <div className="grid grid-cols-2 gap-1">
                      {['A1', 'A2'].map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setInputBatch(b)}
                          className={`py-2 rounded-xl text-xs font-black transition-all ${
                            inputBatch === b
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-white text-slate-700 hover:bg-indigo-100/50 border border-slate-200'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!inputName.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                >
                  <span>Start Logging Batch {inputBatch}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Note / Remarks Modal */}
      {activeNoteSubtopic && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-black">
                  {activeNoteSubtopic.code}
                </span>
                <h3 className="font-bold text-slate-800 text-xs sm:text-sm truncate max-w-[220px]">
                  {activeNoteSubtopic.title}
                </h3>
              </div>
              <button 
                onClick={() => setActiveNoteSubtopic(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                Class Remarks / Notes
              </label>
              <textarea 
                rows={3}
                value={activeNoteSubtopic.notes}
                onChange={(e) => setActiveNoteSubtopic({ ...activeNoteSubtopic, notes: e.target.value })}
                placeholder="e.g. Theory finished, NCERT questions 1-10 done..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setActiveNoteSubtopic(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
