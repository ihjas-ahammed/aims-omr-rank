import React, { useState, useEffect, useMemo } from 'react';
import { 
  ALL_IMPROVEMENT_SUBJECTS, 
  AVAILABLE_IMPROVEMENT_OPTIONS,
  IMPROVEMENT_LANGUAGE_SUBJECTS,
  ImprovementSubjectDef, 
  ImprovementChapterDef,
  ImprovementTopicDef,
  ImprovementSecondLanguage, 
  getImprovementSubjectList 
} from '../../../data/improvementStudyProgressData';
import { 
  ImprovementStudentProfile, 
  ImprovementBatch,
  ChapterBoxesMap, 
  getLocalImprovementProfile, 
  getLocalImprovementProgress, 
  saveImprovementStudentProgress, 
  saveImprovementDailyCheckin,
  calculateImprovementProgressStats,
  calculateStudyStreak,
  getTodayDateKey,
  getAllLocalImprovementProfiles,
  switchActiveImprovementProfile,
  removeLocalImprovementProfile,
  loginImprovementStudent,
  normalizeDocId,
  getWeeklyGoalStatus,
  WeeklyGoalStatus,
  IMPROVEMENT_WEEKLY_SCHEDULE
} from '../../../services/improvementStudyProgressService';
import { 
  CheckCircle2, 
  User, 
  GraduationCap, 
  Edit3, 
  Check, 
  ArrowRight,
  Flame,
  ChevronDown,
  ChevronUp,
  Layers,
  Zap,
  FlaskConical,
  Dna,
  Calculator,
  BookOpen,
  Languages,
  Cpu,
  Loader2,
  Users,
  UserPlus,
  Trash2,
  X,
  Phone,
  KeyRound,
  LogOut,
  SlidersHorizontal,
  CheckSquare,
  Plus,
  Minus,
  Hash,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  ListOrdered,
  CheckCheck,
  Download,
  Target,
  Clock,
  Flag,
  TrendingUp,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ImprovementStudyProgressFormProps {
  onNavigateAdmin?: () => void;
}

const BATCHES: ImprovementBatch[] = ['B1', 'B2', 'B3'];
const LANGUAGE_CHAPTER_PRESETS = [6, 8, 10, 12, 14, 16, 18, 20];

function getSubjectIcon(subjectId: string) {
  switch (subjectId) {
    case 'physics': return <Zap className="w-5 h-5 text-rose-100 drop-shadow" />;
    case 'chemistry': return <FlaskConical className="w-5 h-5 text-purple-100 drop-shadow" />;
    case 'biology': return <Dna className="w-5 h-5 text-emerald-100 drop-shadow" />;
    case 'mathematics': return <Calculator className="w-5 h-5 text-cyan-100 drop-shadow" />;
    case 'computer_science': return <Cpu className="w-5 h-5 text-teal-100 drop-shadow" />;
    case 'english': return <BookOpen className="w-5 h-5 text-amber-100 drop-shadow" />;
    case 'language':
    case 'malayalam':
    case 'hindi':
    case 'arabic':
    case 'urdu':
      return <Languages className="w-5 h-5 text-pink-100 drop-shadow" />;
    default: 
      return <BookOpen className="w-5 h-5 text-slate-100 drop-shadow" />;
  }
}

export default function ImprovementStudyProgressForm({ onNavigateAdmin }: ImprovementStudyProgressFormProps) {
  const [profile, setProfile] = useState<ImprovementStudentProfile | null>(() => getLocalImprovementProfile());
  const [boxes, setBoxes] = useState<ChapterBoxesMap>(() => getLocalImprovementProgress());
  const [savedProfiles, setSavedProfiles] = useState<ImprovementStudentProfile[]>(() => getAllLocalImprovementProfiles());
  
  // Auth view mode: 'register' vs 'login'
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const [isManagingSubjects, setIsManagingSubjects] = useState(false);

  // Form input states
  const [inputName, setInputName] = useState(profile?.name || '');
  const [inputClass, setInputClass] = useState<ImprovementBatch>(profile?.studentClass || 'B1');
  const [inputPhone, setInputPhone] = useState(profile?.phoneNumber || '');
  const [inputSecondLang, setInputSecondLang] = useState<ImprovementSecondLanguage>(profile?.secondLanguage || 'Malayalam');
  const [inputLanguageChapterCount, setInputLanguageChapterCount] = useState<number>(profile?.languageChapterCount || 10);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(profile?.selectedSubjects || ['physics', 'chemistry', 'mathematics']);

  // Async submission / login states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [loginSuccessToast, setLoginSuccessToast] = useState(false);

  // Saving state tracker for specific checkbox / daily checkin
  const [savingBoxKey, setSavingBoxKey] = useState<string | null>(null);
  const [savingCheckin, setSavingCheckin] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Chapter sub-dropdown expanded states (mapping chapterId -> boolean)
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // PWA installation state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [hasClickedInstall, setHasClickedInstall] = useState(() => {
    return localStorage.getItem('improvement_pwa_installed') === 'true';
  });

  useEffect(() => {
    document.title = 'AIMS Plus • Improvement Study Progress';
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Compute active subjects for the logged in student
  const studentSubjects = useMemo(() => {
    return getImprovementSubjectList(
      profile?.selectedSubjects, 
      profile?.secondLanguage,
      profile?.languageChapterCount || 10
    );
  }, [profile?.selectedSubjects, profile?.secondLanguage, profile?.languageChapterCount]);

  // Accordion state (first subject open by default)
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    studentSubjects.forEach((s, idx) => {
      initial[s.id] = idx === 0;
    });
    return initial;
  });

  // Calculate live statistics for student's chosen subjects
  const stats = useMemo(() => {
    return calculateImprovementProgressStats(
      boxes, 
      profile?.selectedSubjects || [], 
      profile?.secondLanguage,
      profile?.languageChapterCount || 10
    );
  }, [boxes, profile?.selectedSubjects, profile?.secondLanguage, profile?.languageChapterCount]);

  const todayKey = getTodayDateKey();
  const todayStudied = profile?.dailyCheckins ? profile.dailyCheckins[todayKey] : undefined;
  const currentStreak = calculateStudyStreak(profile?.dailyCheckins);

  const weeklyGoal = useMemo(() => {
    return getWeeklyGoalStatus(stats.overallPercentage);
  }, [stats.overallPercentage]);

  const triggerSaveToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2200);
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
      } catch (e) {}
      setDeferredPrompt(null);
    }
    setHasClickedInstall(true);
    localStorage.setItem('improvement_pwa_installed', 'true');
  };

  // Toggle subject selection during registration
  const toggleSubjectChoice = (subjectId: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        if (prev.length === 1) {
          setFormError('Please keep at least one subject selected.');
          return prev;
        }
        setFormError('');
        return prev.filter(s => s !== subjectId);
      } else {
        setFormError('');
        return [...prev, subjectId];
      }
    });
  };

  // Toggle chapter sub-dropdown for topics
  const toggleChapterExpand = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  // ==========================================
  // DAILY CHECK-IN HANDLER
  // ==========================================
  const handleDailyCheckin = async (studied: boolean) => {
    if (!profile || savingCheckin) return;
    setSavingCheckin(true);

    try {
      const updated = await saveImprovementDailyCheckin(profile, todayKey, studied);
      setProfile(updated);
      setSavedProfiles(getAllLocalImprovementProfiles());
      triggerSaveToast();

      if (studied) {
        confetti({
          particleCount: 60,
          spread: 50,
          origin: { y: 0.7 }
        });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save daily check-in. Please try again.');
    } finally {
      setSavingCheckin(false);
    }
  };

  // ==========================================
  // REGISTRATION & PROFILE UPDATE SUBMIT
  // ==========================================
  const handleRegisterOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const upperName = inputName.trim().toUpperCase();
    const cleanPhone = inputPhone.trim();

    if (!upperName) {
      setFormError('Please enter your full name (in ALL CAPS)');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 8) {
      setFormError('Please enter a valid Phone / WhatsApp number (at least 8-10 digits) to act as your passkey');
      return;
    }
    if (selectedSubjects.length === 0) {
      setFormError('Please select at least one subject you want to improve');
      return;
    }

    const safeLangChapters = selectedSubjects.includes('language')
      ? Math.max(1, Math.min(inputLanguageChapterCount || 10, 40))
      : 10;

    setFormError('');
    setIsSubmitting(true);

    const newProfile: ImprovementStudentProfile = {
      name: upperName,
      studentClass: inputClass,
      phoneNumber: cleanPhone,
      selectedSubjects,
      secondLanguage: inputSecondLang,
      languageChapterCount: safeLangChapters,
      dailyCheckins: profile?.dailyCheckins || {}
    };

    try {
      const docId = normalizeDocId(newProfile.name, newProfile.studentClass, newProfile.phoneNumber);
      const existingBoxes = getLocalImprovementProgress(docId);
      const targetBoxes = (Object.keys(existingBoxes).length > 0 && !isEditingProfile && !isManagingSubjects) 
        ? existingBoxes 
        : boxes;

      await saveImprovementStudentProgress(newProfile, targetBoxes);
      setProfile(newProfile);
      setBoxes(targetBoxes);
      setSavedProfiles(getAllLocalImprovementProfiles());
      setIsEditingProfile(false);
      setIsManagingSubjects(false);
      triggerSaveToast();

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      if (deferredPrompt && !hasClickedInstall) {
        handleInstallClick();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save improvement profile. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // LOGIN SUBMIT (Lookup by Name, Class & Phone)
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const upperName = inputName.trim().toUpperCase();
    const cleanPhone = inputPhone.trim();

    if (!upperName) {
      setFormError('Please enter your registered Name (ALL CAPS)');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 8) {
      setFormError('Please enter your registered Phone number (Passkey)');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const result = await loginImprovementStudent(upperName, inputClass, cleanPhone);

      if (result) {
        setProfile(result.profile);
        setBoxes(result.progress);
        setSelectedSubjects(result.profile.selectedSubjects);
        setInputName(result.profile.name);
        setInputClass(result.profile.studentClass);
        setInputPhone(result.profile.phoneNumber);
        setInputSecondLang(result.profile.secondLanguage || 'Malayalam');
        setInputLanguageChapterCount(result.profile.languageChapterCount || 10);
        setSavedProfiles(getAllLocalImprovementProfiles());
        
        setLoginSuccessToast(true);
        setTimeout(() => setLoginSuccessToast(false), 3000);
      } else {
        setFormError(
          `No student account found for "${upperName}" in Class ${inputClass} with phone ${cleanPhone}. Please verify your details or switch to Register.`
        );
      }
    } catch (err) {
      console.error(err);
      setFormError('Login failed due to a network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // TOPIC / CHAPTER CHECKPOINT TOGGLE
  // ==========================================
  const toggleTopicBox = async (chapterId: string, topicIndex: number, totalTopics: number) => {
    if (!profile || savingBoxKey) return;

    const boxKey = `${chapterId}_${topicIndex}`;
    setSavingBoxKey(boxKey);

    const entry = boxes[chapterId] || { 
      boxes: Array(totalTopics).fill(false), 
      timestamps: Array(totalTopics).fill(null) 
    };
    
    const currentBoxes = [...(entry.boxes || [])];
    while (currentBoxes.length < totalTopics) currentBoxes.push(false);

    const currentTimestamps = [...(entry.timestamps || [])];
    while (currentTimestamps.length < totalTopics) currentTimestamps.push(null);

    const nextState = !currentBoxes[topicIndex];
    currentBoxes[topicIndex] = nextState;
    currentTimestamps[topicIndex] = nextState ? new Date().toISOString() : null;

    const updatedMap: ChapterBoxesMap = {
      ...boxes,
      [chapterId]: {
        boxes: currentBoxes,
        timestamps: currentTimestamps
      }
    };

    try {
      await saveImprovementStudentProgress(profile, updatedMap);
      setBoxes(updatedMap);
      triggerSaveToast();

      const newStats = calculateImprovementProgressStats(
        updatedMap, 
        profile.selectedSubjects, 
        profile.secondLanguage,
        profile.languageChapterCount || 10
      );
      if (newStats.overallPercentage === 100 && stats.overallPercentage !== 100) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to save topic checkpoint:', err);
      alert('Failed to save checkpoint. Please check your connection.');
    } finally {
      setSavingBoxKey(null);
    }
  };

  // Mark all topics in a chapter as done / undone
  const toggleAllChapterTopics = async (chapter: ImprovementChapterDef, markAllDone: boolean) => {
    if (!profile || savingBoxKey) return;
    const totalCount = chapter.topics && chapter.topics.length > 0 ? chapter.topics.length : (chapter.totalBoxes || 1);
    
    setSavingBoxKey(`${chapter.id}_all`);

    const newBoxes = Array(totalCount).fill(markAllDone);
    const newTimestamps = Array(totalCount).fill(markAllDone ? new Date().toISOString() : null);

    const updatedMap: ChapterBoxesMap = {
      ...boxes,
      [chapter.id]: {
        boxes: newBoxes,
        timestamps: newTimestamps
      }
    };

    try {
      await saveImprovementStudentProgress(profile, updatedMap);
      setBoxes(updatedMap);
      triggerSaveToast();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingBoxKey(null);
    }
  };

  // ==========================================
  // ACCOUNT SWITCHER ACTIONS
  // ==========================================
  const handleSwitchAccount = (id: string) => {
    const { profile: nextProfile, progress: nextBoxes } = switchActiveImprovementProfile(id);
    if (nextProfile) {
      setProfile(nextProfile);
      setBoxes(nextBoxes);
      setInputName(nextProfile.name);
      setInputClass(nextProfile.studentClass);
      setInputPhone(nextProfile.phoneNumber);
      setSelectedSubjects(nextProfile.selectedSubjects);
      setInputSecondLang(nextProfile.secondLanguage || 'Malayalam');
      setInputLanguageChapterCount(nextProfile.languageChapterCount || 10);
      setIsEditingProfile(false);
      setIsManagingSubjects(false);
      setIsAccountSwitcherOpen(false);
      triggerSaveToast();
    }
  };

  const handleAddNewAccount = () => {
    setInputName('');
    setInputClass('B1');
    setInputPhone('');
    setSelectedSubjects(['physics', 'chemistry', 'mathematics']);
    setInputSecondLang('Malayalam');
    setInputLanguageChapterCount(10);
    setAuthMode('register');
    setProfile(null);
    setIsEditingProfile(false);
    setIsManagingSubjects(false);
    setIsAccountSwitcherOpen(false);
  };

  const handleLogout = () => {
    if (confirm('Do you want to log out from this session? Your progress is saved on the cloud and can be reopened anytime with your Name, Class & Phone.')) {
      setProfile(null);
      setAuthMode('login');
      setInputName('');
      setInputPhone('');
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
    studentSubjects.forEach(s => { next[s.id] = isOpen; });
    setOpenSubjects(next);
  };

  // Generate past 7 days for the streak display
  const past7Days = useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const key = `${y}-${m}-${day}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
      const isToday = key === todayKey;
      const isStudied = !!profile?.dailyCheckins?.[key];
      list.push({ key, dayName, isToday, isStudied });
    }
    return list;
  }, [profile?.dailyCheckins, todayKey]);

  // =========================================================================
  // 1. ONBOARDING SCREEN (Register / Login Modal - Mobile Optimized)
  // =========================================================================
  if (!profile || isEditingProfile || isManagingSubjects) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-3.5 sm:p-6 md:p-8 font-sans relative overflow-x-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[700px] h-[300px] sm:h-[350px] bg-indigo-600/15 blur-[120px] sm:blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 right-5 w-[350px] sm:w-[500px] h-[300px] sm:h-[350px] bg-purple-600/15 blur-[100px] sm:blur-[130px] pointer-events-none rounded-full" />

        {/* Top Header */}
        <header className="w-full max-w-xl mx-auto flex items-center justify-between py-2 sm:py-4 relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <img 
              src="/aims_plus_icon.png" 
              alt="AIMS Plus Logo" 
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-contain bg-slate-900 border border-slate-800 p-0.5 shadow-lg shadow-indigo-500/10 shrink-0" 
            />
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white">Improvement Study Progress</h1>
                <span className="px-1.5 sm:px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[9px] sm:text-[10px] font-extrabold rounded-full border border-indigo-500/30">
                  +1 SCERT
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400">AIMS Plus Academic Portal</p>
            </div>
          </div>

          {savedProfiles.length > 0 && !profile && (
            <button
              type="button"
              onClick={() => setIsAccountSwitcherOpen(true)}
              className="flex items-center gap-1 py-1.5 px-2.5 sm:px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-full transition-all cursor-pointer shadow-lg text-[11px] sm:text-xs font-bold text-slate-300 active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Accounts ({savedProfiles.length})</span>
            </button>
          )}
        </header>

        {/* Main Card */}
        <div className="w-full max-w-xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-8 shadow-2xl shadow-black/80 space-y-5 sm:space-y-6 my-auto relative z-10">
          
          {/* Mode Switcher Tabs (Only if not editing existing profile) */}
          {!isEditingProfile && !isManagingSubjects && (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setFormError('');
                }}
                className={`py-2.5 sm:py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Register</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setFormError('');
                }}
                className={`py-2.5 sm:py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Login (Passkey)</span>
              </button>
            </div>
          )}

          {/* Heading */}
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
              {isManagingSubjects 
                ? 'Update Improvement Subjects'
                : isEditingProfile 
                  ? 'Edit Student Profile'
                  : authMode === 'register' 
                    ? 'Student Registration' 
                    : 'Student Login'}
            </h2>
            <p className="text-slate-400 text-[11px] sm:text-xs md:text-sm">
              {authMode === 'register'
                ? 'Enter your name in ALL CAPS, select batch and subjects to track.'
                : 'Login with Name, Class and Phone passkey to open anywhere.'}
            </p>
          </div>

          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl sm:rounded-2xl text-rose-300 text-xs font-semibold text-center animate-in fade-in">
              {formError}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* AUTH FORM: REGISTER / EDIT / LOGIN */}
          {/* ------------------------------------------------------------- */}
          <form onSubmit={authMode === 'register' || isEditingProfile || isManagingSubjects ? handleRegisterOrUpdate : handleLogin} className="space-y-4 sm:space-y-5">
            
            {/* Student Name (ALL CAPS) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-400" /> Student Name (ALL CAPS) <span className="text-rose-400">*</span>
                </span>
                <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase">Uppercase Only</span>
              </label>
              <input
                type="text"
                placeholder="ENTER FULL NAME (E.G. MUHAMMED DANISH)"
                value={inputName}
                onChange={(e) => {
                  const upper = e.target.value.toUpperCase();
                  setInputName(upper);
                  if (upper.trim()) setFormError('');
                }}
                className="w-full h-12 sm:h-13 px-3.5 sm:px-4 bg-slate-950/70 border border-slate-700 rounded-xl sm:rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all"
                required
                autoFocus={!isManagingSubjects}
              />
            </div>

            {/* Batch Selector (B1, B2, B3) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-400" /> Class / Batch <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/70 border border-slate-800 rounded-xl sm:rounded-2xl">
                {BATCHES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setInputClass(b)}
                    className={`py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      inputClass === b
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/40 scale-[1.02]'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span>Class {b}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Number (Passkey) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-indigo-400" /> Phone / WhatsApp Number <span className="text-rose-400">*</span>
                </span>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                  Passkey 🔑
                </span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={inputPhone}
                onChange={(e) => {
                  setInputPhone(e.target.value);
                  if (e.target.value.trim()) setFormError('');
                }}
                className="w-full h-12 sm:h-13 px-3.5 sm:px-4 bg-slate-950/70 border border-slate-700 rounded-xl sm:rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm font-medium transition-all"
                required
              />
              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
                {authMode === 'register' 
                  ? 'Your phone number acts as your passkey to sync and login from any device.'
                  : 'Enter your registered phone number to restore your progress.'}
              </p>
            </div>

            {/* Subject Selection (Registration / Subject Edit Mode) */}
            {(authMode === 'register' || isEditingProfile || isManagingSubjects) && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-indigo-400" /> Subjects to Improve <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                    Selected: {selectedSubjects.length}
                  </span>
                </div>
                
                <p className="text-[11px] text-slate-400">
                  Select the SCERT Plus One subjects you chose to improve:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  {AVAILABLE_IMPROVEMENT_OPTIONS.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.id);
                    return (
                      <div
                        key={sub.id}
                        onClick={() => toggleSubjectChoice(sub.id)}
                        className={`p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-950/50 scale-[1.01]'
                            : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {getSubjectIcon(sub.id)}
                          </div>
                          <div className="min-w-0">
                            <span className={`text-xs font-bold block truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                              {sub.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {sub.desc}
                            </span>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* If Language is chosen, show Second Language & Chapter Count Picker */}
                {selectedSubjects.includes('language') && (
                  <div className="p-3.5 bg-slate-950/80 border border-purple-500/30 rounded-xl sm:rounded-2xl space-y-3 mt-2 shadow-inner">
                    
                    {/* Language Selector */}
                    <div>
                      <span className="text-xs font-bold text-purple-300 block mb-1.5 flex items-center gap-1.5">
                        <Languages className="w-4 h-4 text-purple-400" /> Choose Language Subject:
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['Malayalam', 'Hindi', 'Arabic', 'Urdu'] as ImprovementSecondLanguage[]).map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setInputSecondLang(lang)}
                            className={`py-2 px-1 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              inputSecondLang === lang
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* How many chapters question */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                          <Hash className="w-4 h-4 text-purple-400" /> How many chapters in your {inputSecondLang}?
                        </span>
                        <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-black rounded-lg border border-purple-500/30 font-mono">
                          {inputLanguageChapterCount} Chapters
                        </span>
                      </div>

                      {/* Quick Chapter Presets */}
                      <div className="flex flex-wrap gap-1.5">
                        {LANGUAGE_CHAPTER_PRESETS.map((count) => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setInputLanguageChapterCount(count)}
                            className={`py-1.5 px-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer font-mono ${
                              inputLanguageChapterCount === count
                                ? 'bg-purple-600 text-white shadow-md scale-105'
                                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                            }`}
                          >
                            {count}
                          </button>
                        ))}
                      </div>

                      {/* Stepper & Custom Number Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setInputLanguageChapterCount(prev => Math.max(1, (prev || 10) - 1))}
                          className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-95 shrink-0"
                          title="Decrease Chapters"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <input
                          type="number"
                          min={1}
                          max={35}
                          value={inputLanguageChapterCount}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setInputLanguageChapterCount(isNaN(val) ? 1 : Math.max(1, Math.min(val, 35)));
                          }}
                          className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-center text-sm font-mono focus:outline-none focus:border-purple-500"
                        />

                        <button
                          type="button"
                          onClick={() => setInputLanguageChapterCount(prev => Math.min(35, (prev || 10) + 1))}
                          className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer active:scale-95 shrink-0"
                          title="Increase Chapters"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-13 sm:h-14 mt-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold rounded-xl sm:rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-xs sm:text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>{authMode === 'register' ? 'Saving Registration...' : 'Logging in...'}</span>
                </>
              ) : (
                <>
                  <span>
                    {isManagingSubjects 
                      ? 'Save Subjects & Return' 
                      : isEditingProfile 
                        ? 'Save & Return to Dashboard' 
                        : authMode === 'register' 
                          ? 'Start Improvement Progress Tracking' 
                          : 'Login to My Study Progress'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Cancel button if editing existing profile */}
          {(isEditingProfile || isManagingSubjects) && profile && (
            <button
              type="button"
              onClick={() => {
                setIsEditingProfile(false);
                setIsManagingSubjects(false);
                setInputName(profile.name);
                setInputClass(profile.studentClass);
                setInputPhone(profile.phoneNumber);
                setSelectedSubjects(profile.selectedSubjects);
                setInputLanguageChapterCount(profile.languageChapterCount || 10);
              }}
              className="w-full py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl sm:rounded-2xl text-xs transition-all cursor-pointer"
            >
              Cancel & Return
            </button>
          )}

          {/* Footer Note */}
          <div className="text-center text-[10px] sm:text-xs text-slate-500 pt-0.5">
            AIMS Plus Learning Centre • Higher Secondary
          </div>
        </div>

        <footer className="w-full max-w-xl mx-auto py-2 sm:py-4 text-center text-[10px] sm:text-xs text-slate-500 relative z-10">
          Improvement Study Progress • Plus One Bio Science & Computer Science
        </footer>

        {/* Account Switcher Modal */}
        {isAccountSwitcherOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-tight">Saved Accounts</h3>
                    <p className="text-[11px] text-slate-400">Select an account to view on this device</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAccountSwitcherOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {savedProfiles.map((p) => {
                  const id = normalizeDocId(p.name, p.studentClass, p.phoneNumber);
                  const isActive = profile && normalizeDocId(profile.name, profile.studentClass, profile.phoneNumber) === id;
                  const pProgress = getLocalImprovementProgress(id);
                  const pStats = calculateImprovementProgressStats(
                    pProgress, 
                    p.selectedSubjects, 
                    p.secondLanguage,
                    p.languageChapterCount || 10
                  );

                  return (
                    <div
                      key={id}
                      onClick={() => handleSwitchAccount(id)}
                      className={`p-3 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600/10 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                          : 'bg-slate-800/50 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-inner shrink-0 ${
                          isActive
                            ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-indigo-500/30'
                            : 'bg-gradient-to-tr from-slate-700 to-slate-800'
                        }`}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-white truncate uppercase font-mono">{p.name}</h4>
                            {isActive && (
                              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold rounded-md shrink-0">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                            Class {p.studentClass} • {p.selectedSubjects?.length || 0} Subs • 📞 {p.phoneNumber}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                          {pStats.overallPercentage}%
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove ${p.name} (Class ${p.studentClass}) from this device?`)) {
                              const updated = removeLocalImprovementProfile(id);
                              setSavedProfiles(updated);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-800 pt-2.5">
                <button
                  type="button"
                  onClick={handleAddNewAccount}
                  className="w-full py-2.5 px-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add / Register New Account</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 2. MAIN STUDENT PROGRESS DASHBOARD (Mobile First & Highly Responsive)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 overflow-x-hidden">
      
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-4 py-2 sm:py-2.5 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          
          {/* Logo & Student Info (Left side) */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <img 
              src="/aims_plus_icon.png" 
              alt="AIMS Plus" 
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-contain bg-slate-950 border border-slate-800/80 p-0.5 shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[11px] sm:text-xs font-bold tracking-tight text-slate-300">
                  Improvement
                </span>
                <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 text-[9px] font-black rounded-md border border-indigo-500/30 shrink-0">
                  {profile.studentClass}
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-black text-white uppercase font-mono tracking-wide truncate mt-0.5">
                {profile.name}
              </h2>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Account Switcher: Icon circle on mobile, text pill on sm+ */}
            <button
              onClick={() => setIsAccountSwitcherOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 p-1 sm:py-1 sm:px-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-full transition-all cursor-pointer shadow-sm active:scale-95 group"
              title="Switch Account"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-[10px] flex items-center justify-center shadow shrink-0">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-[11px] font-bold text-slate-200 group-hover:text-white max-w-[100px] truncate uppercase font-mono">
                {profile.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 mr-0.5" />
            </button>

            {/* Install App button in header */}
            {deferredPrompt && !hasClickedInstall && (
              <button
                onClick={handleInstallClick}
                className="px-2 sm:px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1 cursor-pointer active:scale-95 shrink-0"
                title="Install App to Homescreen"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install App</span>
              </button>
            )}

            {/* Edit Profile */}
            <button
              onClick={() => {
                setInputName(profile.name);
                setInputClass(profile.studentClass);
                setInputPhone(profile.phoneNumber);
                setSelectedSubjects(profile.selectedSubjects);
                setInputSecondLang(profile.secondLanguage || 'Malayalam');
                setInputLanguageChapterCount(profile.languageChapterCount || 10);
                setIsEditingProfile(true);
              }}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-colors cursor-pointer active:scale-95"
              title="Edit Profile & Subjects"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-400 bg-slate-800/70 hover:bg-rose-500/10 border border-slate-700/60 rounded-xl transition-colors cursor-pointer active:scale-95"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-5">
        
        {/* Real-time Save Toast */}
        {saveToast && (
          <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 bg-slate-900/95 text-emerald-400 border border-emerald-500/40 rounded-2xl px-3.5 py-2 shadow-2xl flex items-center gap-1.5 text-xs font-extrabold animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Saved to Cloud!
          </div>
        )}

        {/* Login Success Notification */}
        {loginSuccessToast && (
          <div className="p-3 sm:p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
              <span>Welcome back, <strong>{profile.name}</strong>! Your progress is loaded.</span>
            </div>
            <button onClick={() => setLoginSuccessToast(false)} className="text-emerald-400 hover:text-white p-1">✕</button>
          </div>
        )}

        {/* PWA Install Request Banner (same as Study Progress) */}
        {deferredPrompt && !hasClickedInstall && (
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-indigo-950/90 via-purple-950/80 to-slate-900 border border-indigo-500/30 rounded-2xl sm:rounded-3xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3 min-w-0">
              <img 
                src="/aims_plus_icon.png" 
                alt="AIMS Plus" 
                className="w-10 h-10 rounded-2xl bg-slate-950 p-0.5 border border-indigo-400/30 shadow-md shrink-0 object-contain" 
              />
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-black text-white leading-tight flex items-center gap-1.5">
                  <span>Install AIMS Plus App</span>
                  <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 text-[9px] font-black rounded-md border border-indigo-500/30">
                    PWA
                  </span>
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-300 truncate mt-0.5">
                  Add to your home screen for 1-tap quick access & daily check-ins!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasClickedInstall(true);
                  localStorage.setItem('improvement_pwa_installed', 'true');
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DAILY CHECK-IN CARD (Did user study today's Plus Two topics?) */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                  Daily Study Check-in
                </span>
                {currentStreak > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] sm:text-xs font-extrabold flex items-center gap-1 shadow-sm">
                    <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{currentStreak} Day Streak!</span>
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                Did you study today's Plus Two topics?
              </h3>
            </div>

            {/* Past 7 Days History Pills */}
            <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
              {past7Days.map((d) => (
                <div key={d.key} className="flex flex-col items-center gap-1" title={`${d.key}: ${d.isStudied ? 'Studied' : 'No'}`}>
                  <span className={`text-[8px] font-bold ${d.isToday ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {d.dayName}
                  </span>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] transition-all ${
                    d.isStudied 
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-sm shadow-emerald-500/50' 
                      : d.isToday 
                        ? 'border border-dashed border-indigo-400 bg-indigo-950/40' 
                        : 'bg-slate-800'
                  }`}>
                    {d.isStudied ? '✓' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Yes / No Interactive Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              disabled={savingCheckin}
              onClick={() => handleDailyCheckin(true)}
              className={`py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md ${
                todayStudied === true
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white ring-2 ring-emerald-400/50 shadow-emerald-600/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
              }`}
            >
              {savingCheckin ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <ThumbsUp className={`w-4 h-4 ${todayStudied === true ? 'fill-white text-white' : 'text-emerald-400'}`} />
              )}
              <span>Yes, Studied Today!</span>
              {todayStudied === true && <Check className="w-4 h-4 stroke-[3]" />}
            </button>

            <button
              type="button"
              disabled={savingCheckin}
              onClick={() => handleDailyCheckin(false)}
              className={`py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md ${
                todayStudied === false
                  ? 'bg-gradient-to-r from-rose-700 to-rose-800 text-white ring-2 ring-rose-500/50'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
              }`}
            >
              <ThumbsDown className={`w-4 h-4 ${todayStudied === false ? 'fill-white text-white' : 'text-rose-400'}`} />
              <span>Not Yet / Incomplete</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5-WEEK IMPROVEMENT TARGET & WEEKLY GOAL PROGRESS (Sep 1 to Oct 5) */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative z-10">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg shrink-0">
                  <Target className="w-4 h-4 text-indigo-400" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                  5-Week Target Milestone
                </span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-200 text-[10px] font-black rounded-full border border-indigo-500/30">
                  20% / Week Pace
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                {weeklyGoal.currentWeek.title}: {weeklyGoal.currentWeek.targetPercentage}% by {weeklyGoal.currentWeek.targetDateFormatted}
              </h3>
            </div>

            {/* Target Status Badge */}
            <div className="flex items-center gap-2 shrink-0">
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 shadow-sm ${
                weeklyGoal.isCompleted 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-emerald-950/40' 
                  : weeklyGoal.isOnTrack
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {weeklyGoal.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{weeklyGoal.statusText}</span>
              </div>
            </div>
          </div>

          {/* Dual Target Progress Bar with Marker Flag */}
          <div className="space-y-1.5 relative z-10">
            <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-400 font-bold">
              <span className="flex items-center gap-1">
                <span>Current Overall:</span>
                <strong className="text-white text-xs sm:text-sm font-black">{stats.overallPercentage}%</strong>
              </span>
              <span className="text-indigo-300 flex items-center gap-1">
                <Flag className="w-3 h-3 text-indigo-400" />
                <span>Target ({weeklyGoal.currentWeek.targetDateShort}):</span>
                <strong className="text-white">{weeklyGoal.currentWeek.targetPercentage}%</strong>
              </span>
            </div>

            <div className="relative w-full bg-slate-800/90 rounded-full h-3.5 sm:h-4 overflow-hidden border border-slate-700/80 p-0.5">
              {/* Target Marker Flag Line */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-amber-400 z-20 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
                style={{ left: `calc(${weeklyGoal.currentWeek.targetPercentage}% - 2px)` }}
                title={`Target: ${weeklyGoal.currentWeek.targetPercentage}%`}
              />
              
              {/* Actual Progress Bar */}
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  weeklyGoal.isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                }`}
                style={{ width: `${Math.min(100, stats.overallPercentage)}%` }}
              />
            </div>
          </div>

          {/* 5-Week Milestone Step Matrix */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1 relative z-10">
            {weeklyGoal.milestones.map((m) => {
              const isPassedOrDone = m.status === 'completed';
              const isCurrent = m.isCurrentWeek;

              return (
                <div
                  key={m.weekNumber}
                  className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all ${
                    isPassedOrDone
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : isCurrent
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/80 scale-[1.02]'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight">
                      W{m.weekNumber}
                    </span>
                    {isPassedOrDone && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 stroke-[3]" />}
                  </div>
                  <div className="text-[11px] sm:text-xs font-black text-white">
                    {m.targetPercentage}%
                  </div>
                  <div className="text-[8px] sm:text-[9px] text-slate-400 font-medium truncate mt-0.5">
                    {m.targetDateShort}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Overall Completion Progress Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-3xl pointer-events-none rounded-full" />

          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500 shrink-0" /> Overall Progress
              </span>
              <p className="text-[11px] text-slate-500 truncate">
                {studentSubjects.length} enrolled subjects
              </p>
            </div>
            <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              {stats.overallPercentage}%
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-3 sm:h-3.5 overflow-hidden p-0.5 border border-slate-700/80">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${stats.overallPercentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-[11px] sm:text-xs text-slate-400 relative z-10 pt-0.5">
            <span>
              <strong className="text-white font-bold">{stats.totalCheckedBoxes}</strong> of <strong className="text-white font-bold">{stats.totalPossibleBoxes}</strong> Checkpoints Done
            </span>
            <button
              onClick={() => {
                setSelectedSubjects(profile.selectedSubjects);
                setInputLanguageChapterCount(profile.languageChapterCount || 10);
                setIsManagingSubjects(true);
              }}
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer transition-colors text-[11px] sm:text-xs"
            >
              <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Change Subjects</span>
            </button>
          </div>
        </div>

        {/* Subjects Header & Accordion Controls */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" /> Subjects ({studentSubjects.length})
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

        {/* ========================================================================= */}
        {/* SUBJECT ACCORDIONS WITH NCERT TOPIC SUB-DROPDOWNS */}
        {/* ========================================================================= */}
        <div className="space-y-3 sm:space-y-4">
          {studentSubjects.map((subject) => {
            const isOpen = !!openSubjects[subject.id];
            const subPerc = stats.subjectPercentages[subject.id] || 0;
            const subName = subject.nameEn;

            let completedChaptersCount = 0;
            subject.chapters.forEach(ch => {
              const entry = boxes[ch.id] || { boxes: [], timestamps: [] };
              const maxB = ch.topics && ch.topics.length > 0 ? ch.topics.length : (ch.totalBoxes || 1);
              let allDone = true;
              for (let i = 0; i < maxB; i++) {
                if (!entry.boxes[i]) allDone = false;
              }
              if (allDone && maxB > 0) completedChaptersCount++;
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
                  className="w-full p-3.5 sm:p-5 flex items-center justify-between text-left cursor-pointer select-none transition-all gap-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0 ${subject.bgGradient} shadow-md`}>
                      {getSubjectIcon(subject.id)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-sm sm:text-base md:text-lg leading-tight truncate">
                        {subName}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                        {completedChaptersCount} of {subject.chapters.length} Chapters Mastered
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-black text-indigo-400">{subPerc}%</span>
                      <div className="w-12 sm:w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1 border border-slate-700">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${subPerc}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="p-1 sm:p-1.5 bg-slate-800 rounded-xl text-slate-400">
                      {isOpen ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="border-t border-slate-800/80 p-2.5 sm:p-4 md:p-5 space-y-3 bg-slate-950/40 divide-y divide-slate-800/60">
                    {subject.chapters.map((chapter: ImprovementChapterDef) => {
                      const entry = boxes[chapter.id] || { boxes: [], timestamps: [] };
                      const hasTopics = chapter.topics && chapter.topics.length > 0;
                      const totalTopicsCount = hasTopics ? chapter.topics!.length : (chapter.totalBoxes || 1);
                      const isExpanded = !!expandedChapters[chapter.id];

                      let checkedTopicsCount = 0;
                      for (let i = 0; i < totalTopicsCount; i++) {
                        if (entry.boxes[i]) checkedTopicsCount++;
                      }
                      const isFullyDone = checkedTopicsCount === totalTopicsCount;
                      const chapterProgressPerc = totalTopicsCount > 0 ? Math.round((checkedTopicsCount / totalTopicsCount) * 100) : 0;

                      return (
                        <div key={chapter.id} className="pt-3 first:pt-0 space-y-2">
                          
                          {/* Chapter Header Row */}
                          <div 
                            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                              isFullyDone 
                                ? 'bg-emerald-950/25 border-emerald-500/40' 
                                : checkedTopicsCount > 0 
                                  ? 'bg-slate-900 border-slate-800 shadow-md' 
                                  : 'bg-slate-900/50 border-slate-800/70'
                            }`}
                          >
                            {/* Left Info */}
                            <div 
                              onClick={() => hasTopics && toggleChapterExpand(chapter.id)} 
                              className={`flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1 ${hasTopics ? 'cursor-pointer select-none' : ''}`}
                            >
                              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                                isFullyDone ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {chapter.chapterNumber}
                              </div>

                              <div className="min-w-0 flex-1 space-y-0.5">
                                {chapter.unitEn && (
                                  <div className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-indigo-400 uppercase">
                                    {chapter.unitEn}
                                  </div>
                                )}
                                <h4 className="font-bold text-white text-xs sm:text-sm leading-snug break-words">
                                  {chapter.titleEn}
                                </h4>
                                
                                {hasTopics ? (
                                  <div className="flex items-center gap-2 pt-0.5">
                                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                                      <strong className={isFullyDone ? 'text-emerald-400' : 'text-indigo-300'}>{checkedTopicsCount}</strong> / {totalTopicsCount} NCERT Topics
                                    </span>
                                    <span className="text-slate-600">•</span>
                                    <span className={`text-[10px] font-extrabold ${isFullyDone ? 'text-emerald-400' : 'text-slate-400'}`}>
                                      {chapterProgressPerc}%
                                    </span>
                                  </div>
                                ) : (
                                  chapter.subtitleEn && (
                                    <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">
                                      {chapter.subtitleEn}
                                    </p>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Right Controls */}
                            <div className="shrink-0 flex items-center gap-1.5 pl-1">
                              {hasTopics ? (
                                <>
                                  {/* Quick Mark All Button */}
                                  <button
                                    type="button"
                                    onClick={() => toggleAllChapterTopics(chapter, !isFullyDone)}
                                    className={`px-2 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer active:scale-95 border flex items-center gap-1 ${
                                      isFullyDone
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-750'
                                    }`}
                                    title={isFullyDone ? 'Unmark all topics' : 'Mark all topics as done'}
                                  >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{isFullyDone ? 'All Done' : 'Check All'}</span>
                                  </button>

                                  {/* Sub-dropdown Expand Chevron */}
                                  <button
                                    type="button"
                                    onClick={() => toggleChapterExpand(chapter.id)}
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                                      isExpanded 
                                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' 
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                                    }`}
                                    title={isExpanded ? 'Collapse Topics' : 'Expand NCERT Topics'}
                                  >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                </>
                              ) : (
                                /* English and Language: Simple Chapter Tick (Old Way) */
                                <button
                                  type="button"
                                  disabled={!!savingBoxKey}
                                  onClick={() => toggleTopicBox(chapter.id, 0, 1)}
                                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border-2 font-bold text-xs flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-md ${
                                    savingBoxKey === `${chapter.id}_0`
                                      ? 'bg-slate-800 border-indigo-500 text-indigo-400 animate-pulse'
                                      : isFullyDone
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-emerald-500/30'
                                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-400'
                                  }`}
                                  title={isFullyDone ? 'Chapter Completed' : 'Mark Chapter Done'}
                                >
                                  {savingBoxKey === `${chapter.id}_0` ? (
                                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-indigo-400" />
                                  ) : isFullyDone ? (
                                    <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
                                  ) : (
                                    <span className="text-sm sm:text-base font-black">✓</span>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* NCERT TOPICS SUB-DROPDOWN LIST */}
                          {hasTopics && isExpanded && (
                            <div className="ml-3 sm:ml-4 pl-3 sm:pl-4 border-l-2 border-indigo-500/30 space-y-2 py-1.5 animate-in slide-in-from-top-2 duration-200">
                              <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1 mb-1">
                                <ListOrdered className="w-3.5 h-3.5" />
                                <span>NCERT Section Checklist ({chapter.topics!.length} Topics)</span>
                              </div>

                              {chapter.topics!.map((topic, topicIdx) => {
                                const isTopicChecked = !!entry.boxes[topicIdx];
                                const isSavingThis = savingBoxKey === `${chapter.id}_${topicIdx}`;

                                return (
                                  <div
                                    key={topic.id}
                                    onClick={() => toggleTopicBox(chapter.id, topicIdx, chapter.topics!.length)}
                                    className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer select-none ${
                                      isTopicChecked
                                        ? 'bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-950/30'
                                        : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2 min-w-0 flex-1">
                                      <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 ${
                                        isTopicChecked 
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                          : 'bg-slate-800 text-slate-400'
                                      }`}>
                                        {topic.topicNumber || `${chapter.chapterNumber}.${topicIdx + 1}`}
                                      </span>
                                      <span className={`text-xs font-semibold leading-snug ${
                                        isTopicChecked ? 'text-emerald-200 line-through opacity-90' : 'text-slate-200'
                                      }`}>
                                        {topic.titleEn}
                                      </span>
                                    </div>

                                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                                      isTopicChecked 
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-sm' 
                                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'
                                    }`}>
                                      {isSavingThis ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                      ) : isTopicChecked ? (
                                        <Check className="w-4 h-4 stroke-[3]" />
                                      ) : (
                                        <span className="text-xs font-black text-slate-600">✓</span>
                                      )}
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
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Account Switcher Modal */}
      {isAccountSwitcherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">Switch Account</h3>
                  <p className="text-[11px] text-slate-400">Select an account to view or track progress</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountSwitcherOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {savedProfiles.map((p) => {
                const id = normalizeDocId(p.name, p.studentClass, p.phoneNumber);
                const isActive = profile && normalizeDocId(profile.name, profile.studentClass, profile.phoneNumber) === id;
                const pProgress = getLocalImprovementProgress(id);
                const pStats = calculateImprovementProgressStats(
                  pProgress, 
                  p.selectedSubjects, 
                  p.secondLanguage,
                  p.languageChapterCount || 10
                );

                return (
                  <div
                    key={id}
                    onClick={() => handleSwitchAccount(id)}
                    className={`p-3 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-2.5 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                        : 'bg-slate-800/50 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-inner shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-indigo-500/30'
                          : 'bg-gradient-to-tr from-slate-700 to-slate-800'
                      }`}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate uppercase font-mono">{p.name}</h4>
                          {isActive && (
                            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] font-extrabold rounded-md shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                          Class {p.studentClass} • {p.selectedSubjects?.length || 0} Subs • 📞 {p.phoneNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">
                        {pStats.overallPercentage}%
                      </span>

                      {savedProfiles.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove ${p.name} (Class ${p.studentClass}) from this device?`)) {
                              const updated = removeLocalImprovementProfile(id);
                              setSavedProfiles(updated);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-2.5">
              <button
                type="button"
                onClick={handleAddNewAccount}
                className="w-full py-2.5 px-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add / Register New Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
