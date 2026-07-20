import React, { useState, useEffect, useMemo } from 'react';
import { 
  STUDY_SUBJECTS, 
  TOTAL_CHAPTERS, 
  TOTAL_CHECKPOINTS, 
  SubjectDef, 
  ChapterDef 
} from '../../../data/studyProgressData';
import { 
  StudentProfile, 
  StudentMedium,
  ChapterBoxesMap, 
  getLocalStudentProfile, 
  getLocalChapterProgress, 
  saveStudentProgress, 
  calculateProgressStats 
} from '../../../services/studyProgressService';
import { 
  CheckCircle2, 
  User, 
  Hash, 
  GraduationCap, 
  Edit3, 
  Check, 
  ArrowRight,
  Flame,
  Globe,
  ChevronDown,
  ChevronUp,
  Layers,
  Zap,
  FlaskConical,
  Dna,
  Calculator,
  BookOpen,
  Languages,
  Landmark,
  Loader2,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudyProgressFormProps {
  onNavigateAdmin?: () => void;
}

const BATCH_OPTIONS = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'M1', 'M2'];

function getSubjectIcon(subjectId: string) {
  switch (subjectId) {
    case 'physics': return <Zap className="w-5 h-5 text-rose-100 drop-shadow" />;
    case 'chemistry': return <FlaskConical className="w-5 h-5 text-purple-100 drop-shadow" />;
    case 'biology': return <Dna className="w-5 h-5 text-emerald-100 drop-shadow" />;
    case 'maths': return <Calculator className="w-5 h-5 text-cyan-100 drop-shadow" />;
    case 'english': return <BookOpen className="w-5 h-5 text-amber-100 drop-shadow" />;
    case 'hindi': return <Languages className="w-5 h-5 text-orange-100 drop-shadow" />;
    case 'malayalam2': return <BookOpen className="w-5 h-5 text-pink-100 drop-shadow" />;
    case 'history': return <Landmark className="w-5 h-5 text-violet-100 drop-shadow" />;
    case 'geography': return <Globe className="w-5 h-5 text-sky-100 drop-shadow" />;
    default: return <BookOpen className="w-5 h-5 text-slate-100 drop-shadow" />;
  }
}

export default function StudyProgressForm({ onNavigateAdmin }: StudyProgressFormProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(() => getLocalStudentProfile());
  const [boxes, setBoxes] = useState<ChapterBoxesMap>(() => getLocalChapterProgress());
  
  // Set page title
  useEffect(() => {
    document.title = 'Study Progress';
  }, []);

  // Onboarding input states
  const [inputName, setInputName] = useState(profile?.name || '');
  const [inputClass, setInputClass] = useState(profile?.studentClass || 'E1');
  const [inputAdmNo, setInputAdmNo] = useState(profile?.admissionNo || '');
  const [inputMedium, setInputMedium] = useState<StudentMedium>(profile?.medium || 'English');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formError, setFormError] = useState('');

  // Saving state tracker for specific checkbox
  const [savingBoxKey, setSavingBoxKey] = useState<string | null>(null);

  // Real-time auto-save indicator toast
  const [saveToast, setSaveToast] = useState(false);

  // Accordion open/close state map for each subject (id -> boolean)
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    STUDY_SUBJECTS.forEach((s, idx) => {
      initial[s.id] = idx === 0;
    });
    return initial;
  });

  // PWA deferred prompt state & Install click state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [hasClickedInstall, setHasClickedInstall] = useState(() => {
    return localStorage.getItem('study_progress_pwa_installed') === 'true';
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const stats = useMemo(() => calculateProgressStats(boxes), [boxes]);

  const isMalayalam = profile?.medium === 'Malayalam';

  const triggerSaveToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
      } catch (e) {}
      setDeferredPrompt(null);
    }
    setHasClickedInstall(true);
    localStorage.setItem('study_progress_pwa_installed', 'true');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) {
      setFormError('Please enter your full name');
      return;
    }
    if (!inputClass.trim()) {
      setFormError('Please select your batch');
      return;
    }
    if (!inputAdmNo.trim()) {
      setFormError('Please enter your admission number');
      return;
    }

    setFormError('');
    const newProfile: StudentProfile = {
      name: inputName.trim(),
      studentClass: inputClass.trim(),
      admissionNo: inputAdmNo.trim(),
      medium: inputMedium
    };

    try {
      await saveStudentProgress(newProfile, boxes);
      setProfile(newProfile);
      setIsEditingProfile(false);
      triggerSaveToast();

      // Prompt PWA installation dialog on registration submit if prompt is ready and not installed
      if (deferredPrompt && !hasClickedInstall) {
        handleInstallClick();
      }
    } catch (err) {
      alert('Failed to save profile to database. Please try again.');
    }
  };

  // ONLY mark as ticked when successfully saved to DB
  const toggleBox = async (chapterId: string, boxIndex: 0 | 1 | 2) => {
    if (!profile || savingBoxKey) return;

    const boxKey = `${chapterId}_${boxIndex}`;
    setSavingBoxKey(boxKey);

    const entry = boxes[chapterId] || { boxes: [false, false, false], timestamps: [null, null, null] };
    const currentBoxes: [boolean, boolean, boolean] = [...entry.boxes] as [boolean, boolean, boolean];
    const currentTimestamps: [string | null, string | null, string | null] = [...entry.timestamps] as [string | null, string | null, string | null];

    const nextState = !currentBoxes[boxIndex];
    currentBoxes[boxIndex] = nextState;
    currentTimestamps[boxIndex] = nextState ? new Date().toISOString() : null;

    const updatedMap: ChapterBoxesMap = {
      ...boxes,
      [chapterId]: {
        boxes: currentBoxes,
        timestamps: currentTimestamps
      }
    };

    try {
      // 1. Save to Database FIRST
      await saveStudentProgress(profile, updatedMap);

      // 2. ONLY update local UI state when saved to DB!
      setBoxes(updatedMap);
      triggerSaveToast();

      const newStats = calculateProgressStats(updatedMap);
      if (newStats.overallPercentage === 100 && stats.overallPercentage !== 100) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to save checkpoint to DB:', err);
      alert('Failed to save checkpoint to database. Please check your internet connection.');
    } finally {
      setSavingBoxKey(null);
    }
  };

  const toggleSubjectAccordion = (subjectId: string) => {
    setOpenSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const setAllAccordionState = (isOpen: boolean) => {
    const next: Record<string, boolean> = {};
    STUDY_SUBJECTS.forEach(s => { next[s.id] = isOpen; });
    setOpenSubjects(next);
  };

  // --- SIGN UP / PROFILE ENTRY SCREEN ---
  if (!profile || isEditingProfile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 md:p-8 font-sans">
        <header className="w-full max-w-lg mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src="/app_icon.png" alt="Study Progress Logo" className="w-10 h-10 rounded-xl object-contain bg-slate-900 border border-slate-800 p-1 shadow-lg" />
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white">Study Progress</h1>
              <p className="text-[11px] text-slate-400">Student Portal</p>
            </div>
          </div>
        </header>

        <div className="w-full max-w-lg mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 my-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">Student Registration</h2>
            <p className="text-slate-400 text-xs md:text-sm">
              Enter your details, select your batch and preferred medium of instruction.
            </p>
          </div>

          {formError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold text-center">
              {formError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-400" /> Student Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                className="w-full h-12 px-4 bg-slate-800/90 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Batch Selector Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-400" /> Batch
                </label>
                <select
                  value={inputClass}
                  onChange={(e) => setInputClass(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-800/90 border border-slate-700 rounded-2xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold transition-all cursor-pointer"
                  required
                >
                  {BATCH_OPTIONS.map(batch => (
                    <option key={batch} value={batch}>Batch {batch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-indigo-400" /> Admission No
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4812"
                  value={inputAdmNo}
                  onChange={(e) => setInputAdmNo(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-800/90 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium transition-all"
                  required
                />
              </div>
            </div>

            {/* Medium Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-400" /> Medium of Instruction
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-slate-800/60 border border-slate-700 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setInputMedium('English')}
                  className={`py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    inputMedium === 'English'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>English Medium</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInputMedium('Malayalam')}
                  className={`py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    inputMedium === 'Malayalam'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>മലയാളം (Malayalam)</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-13 mt-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-sm"
            >
              {isEditingProfile ? 'Save & Return' : 'Start Progress Tracking'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(false)}
              className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        <footer className="w-full max-w-lg mx-auto py-4 text-center text-xs text-slate-500">
          Study Progress • Student Module
        </footer>
      </div>
    );
  }

  // --- MAIN DASHBOARD SCREEN ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/app_icon.png" alt="Study Progress Logo" className="w-9 h-9 rounded-xl object-contain bg-slate-950 border border-slate-800 p-0.5" />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold text-white leading-tight">Study Progress</h1>
                <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold rounded-md">
                  {profile.medium}
                </span>
                <button
                  onClick={() => {
                    setInputName(profile.name);
                    setInputClass(profile.studentClass);
                    setInputAdmNo(profile.admissionNo);
                    setInputMedium(profile.medium);
                    setIsEditingProfile(true);
                  }}
                  className="p-1 text-slate-400 hover:text-indigo-400 cursor-pointer ml-1"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">{profile.name} • Batch {profile.studentClass} • Adm: {profile.admissionNo}</p>
            </div>
          </div>

          {/* Remove Install App button once clicked */}
          {deferredPrompt && !hasClickedInstall && (
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              title="Install App to Homescreen"
            >
              <Download className="w-3.5 h-3.5" /> Install App
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto p-4 space-y-5">
        {/* Realtime Auto-Save Floating Toast */}
        {saveToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-emerald-400 border border-emerald-500/40 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-2 text-xs font-extrabold animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Saved to Database!
          </div>
        )}

        {/* Overall Completion Progress Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" /> Overall Progress
            </span>
            <span className="text-xl font-black text-indigo-400">{stats.overallPercentage}%</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.overallPercentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{stats.totalCheckedBoxes} of {stats.totalPossibleBoxes} Checkpoints Completed</span>
            <span>{TOTAL_CHAPTERS} Chapters Total</span>
          </div>
        </div>

        {/* Accordion Controls Bar */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" /> Subjects ({STUDY_SUBJECTS.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAllAccordionState(true)}
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Expand All
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setAllAccordionState(false)}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* SUBJECT ACCORDION DROPDOWNS WITH MATERIAL/LUCIDE ICONS */}
        <div className="space-y-4">
          {STUDY_SUBJECTS.map((subject) => {
            const isOpen = !!openSubjects[subject.id];
            const subPerc = stats.subjectPercentages[subject.id] || 0;
            const subName = isMalayalam ? subject.nameMl : subject.nameEn;

            let completedChaptersCount = 0;
            subject.chapters.forEach(ch => {
              const entry = boxes[ch.id] || { boxes: [false, false, false], timestamps: [null, null, null] };
              const maxB = ch.totalBoxes || 3;
              let allDone = true;
              for (let i = 0; i < maxB; i++) {
                if (!entry.boxes[i]) allDone = false;
              }
              if (allDone) completedChaptersCount++;
            });

            return (
              <div 
                key={subject.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen ? 'border-slate-700 shadow-xl bg-slate-900' : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-900'
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleSubjectAccordion(subject.id)}
                  className="w-full p-4 md:p-5 flex items-center justify-between text-left cursor-pointer select-none transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 ${subject.bgGradient} shadow-md`}>
                      {getSubjectIcon(subject.id)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base md:text-lg leading-tight">
                        {subName}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {completedChaptersCount} of {subject.chapters.length} Chapters Completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-black text-indigo-400">{subPerc}%</span>
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1 border border-slate-700">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${subPerc}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="p-1.5 bg-slate-800 rounded-xl text-slate-400">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="border-t border-slate-800/80 p-3 md:p-5 space-y-3 bg-slate-950/40 divide-y divide-slate-800/50">
                    {subject.chapters.map((chapter: ChapterDef) => {
                      const entry = boxes[chapter.id] || { boxes: [false, false, false], timestamps: [null, null, null] };
                      const chBoxes = entry.boxes;
                      const chTimestamps = entry.timestamps;
                      const maxB = chapter.totalBoxes || 3;
                      let checkedCount = 0;
                      for (let i = 0; i < maxB; i++) {
                        if (chBoxes[i]) checkedCount++;
                      }
                      const isFullyCompleted = checkedCount === maxB;

                      const chTitle = isMalayalam ? chapter.titleMl : chapter.titleEn;
                      const chSubtitle = isMalayalam ? (chapter.subtitleMl || chapter.subtitleEn) : chapter.subtitleEn;
                      const chUnit = isMalayalam ? (chapter.unitMl || chapter.unitEn) : chapter.unitEn;

                      return (
                        <div 
                          key={chapter.id}
                          className={`p-3.5 md:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isFullyCompleted 
                              ? 'bg-emerald-950/20 border-emerald-500/30' 
                              : checkedCount > 0 
                                ? 'bg-slate-900 border-slate-800' 
                                : 'bg-slate-900/40 border-slate-800/60'
                          }`}
                        >
                          {/* Left Column: Number badge + Unit / Title / Subtitle */}
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                              isFullyCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {chapter.chapterNumber}
                            </div>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              {chUnit && (
                                <div className="text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase">
                                  {chUnit}
                                </div>
                              )}
                              <h4 className="font-bold text-white text-xs md:text-sm leading-snug">
                                {chTitle}
                              </h4>
                              {chSubtitle && (
                                <p className="text-[11px] text-slate-400">
                                  {chSubtitle}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right Side: Checkpoint Button */}
                          <div className="shrink-0 flex items-center pl-1">
                            {Array.from({ length: maxB }).map((_, idx) => {
                              const isChecked = chBoxes[idx as 0 | 1 | 2];
                              const ts = chTimestamps[idx as 0 | 1 | 2];
                              const isSavingThisBox = savingBoxKey === `${chapter.id}_${idx}`;

                              return (
                                <button
                                  key={idx}
                                  disabled={!!savingBoxKey}
                                  onClick={() => toggleBox(chapter.id, idx as 0 | 1 | 2)}
                                  className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl border-2 font-bold text-xs flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-md ${
                                    isSavingThisBox
                                      ? 'bg-slate-800 border-indigo-500 text-indigo-400 animate-pulse'
                                      : isChecked
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-emerald-500/30'
                                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-400'
                                  }`}
                                  title={ts ? `Ticked: ${new Date(ts).toLocaleString()}` : `Toggle Checkpoint`}
                                >
                                  {isSavingThisBox ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                                  ) : isChecked ? (
                                    <Check className="w-6 h-6 stroke-[3]" />
                                  ) : (
                                    <span className="text-base font-black">✓</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
