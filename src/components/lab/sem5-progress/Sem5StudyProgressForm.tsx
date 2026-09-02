import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sem5Subject,
  Sem5StudentProfile, 
  Sem5ProgressMap, 
  Sem5TopicProgress,
  Sem5Stats,
  Sem5Milestone,
  Sem5GoalSchedule,
  calculateSem5GoalSchedule,
  getLocalSem5Profile, 
  saveLocalSem5Profile, 
  getAllSavedSem5Profiles,
  getLocalSem5Progress, 
  saveSem5ProgressToCloud,
  subscribeSem5StudentData,
  loginSem5Student,
  saveSem5DailyCheckin,
  calculateSem5Stats,
  getTodayDateKey,
  removeLocalSem5Profile,
  normalizeDocId,
  exportSem5ProgressToExcel
} from '../../../services/sem5StudyProgressService';
import { 
  SEM5_SYLLABUS_DATA,
  Sem5CourseDef,
  Sem5ModuleDef,
  Sem5TopicDef,
  getSem5Courses,
  getSem5DefaultCoreCourses,
  findSem5CourseById
} from '../../../data/sem5StudyProgressData';
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
  RotateCw,
  ArrowRight, 
  Edit3, 
  Users, 
  UserPlus,
  KeyRound,
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
  Calendar,
  Flame,
  Download,
  Target,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  TrendingUp,
  Award,
  BookMarked,
  Info,
  Phone,
  LogOut,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  X,
  Plus,
  Flag
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Sem5StudyProgressFormProps {
  subject: Sem5Subject;
  onNavigateAdmin?: () => void;
}

export default function Sem5StudyProgressForm({ subject, onNavigateAdmin }: Sem5StudyProgressFormProps) {
  const allAvailableCourses = useMemo(() => getSem5Courses(subject), [subject]);
  const defaultCourses = useMemo(() => getSem5DefaultCoreCourses(subject), [subject]);

  const [profile, setProfile] = useState<Sem5StudentProfile | null>(() => getLocalSem5Profile(subject));
  const [progress, setProgress] = useState<Sem5ProgressMap>(() => {
    const prof = getLocalSem5Profile(subject);
    return prof ? getLocalSem5Progress(subject, prof.id) : {};
  });

  const [savedProfiles, setSavedProfiles] = useState<Sem5StudentProfile[]>(() => getAllSavedSem5Profiles());

  // Auth view mode: 'register' vs 'login'
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isManagingCourses, setIsManagingCourses] = useState(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const [isEditingGoalModal, setIsEditingGoalModal] = useState(false);

  // Form input states
  const [inputName, setInputName] = useState(profile?.name || '');
  const [inputPhone, setInputPhone] = useState(profile?.phoneNumber || '');

  // Default start date: today
  const defaultStartDate = useMemo(() => getTodayDateKey(), []);

  // Default target date: 35 days from today
  const defaultTargetDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 35);
    return d.toISOString().split('T')[0];
  }, []);

  const [inputStartDate, setInputStartDate] = useState(profile?.startDate || defaultStartDate);
  const [inputTargetDate, setInputTargetDate] = useState(profile?.targetCompleteDate || defaultTargetDate);
  const [inputIntervalDays, setInputIntervalDays] = useState<number>(profile?.intervalDays || 7);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(profile?.selectedCourses || defaultCourses);

  // Async submission / login states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [savingCheckin, setSavingCheckin] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Active Selected Course Tab
  const [activeCourseId, setActiveCourseId] = useState<string>(() => {
    if (profile?.selectedCourses && profile.selectedCourses.length > 0) {
      return profile.selectedCourses[0];
    }
    return defaultCourses[0] || allAvailableCourses[0]?.id || '';
  });

  // UI state: Closed by default for all dropdowns
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline'>('synced');
  const [activeNoteTopic, setActiveNoteTopic] = useState<{ id: string; code: string; title: string; notes: string } | null>(null);

  useEffect(() => {
    const subjTitle = subject === 'mathematics' ? 'Mathematics' : 'Physics';
    document.title = `AIMS Plus • Semester 5 ${subjTitle} Study Progress`;
  }, [subject]);

  // Subscribe to cloud updates for active student
  useEffect(() => {
    if (!profile?.id) return;

    const unsubscribe = subscribeSem5StudentData(subject, profile.id, (data) => {
      if (data.profile) setProfile(data.profile);
      if (data.progress) setProgress(data.progress);
    });

    return () => unsubscribe();
  }, [subject, profile?.id]);

  const activeCourse = useMemo(() => {
    return allAvailableCourses.find(c => c.id === activeCourseId) || allAvailableCourses[0];
  }, [allAvailableCourses, activeCourseId]);

  // Auto-expand modules only when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const exp: Record<string, boolean> = {};
      activeCourse?.modules.forEach(m => {
        const matchesModule = m.title.toLowerCase().includes(q);
        const matchesTopic = m.topics.some(t => t.title.toLowerCase().includes(q) || t.code.toLowerCase().includes(q));
        if (matchesModule || matchesTopic) {
          exp[m.id] = true;
        }
      });
      setExpandedModules(exp);
    }
  }, [searchQuery, activeCourse]);

  // Overall Metrics
  const stats = useMemo(() => {
    return calculateSem5Stats(
      allAvailableCourses, 
      profile?.selectedCourses || selectedCourseIds, 
      progress, 
      profile?.targetCompleteDate || inputTargetDate,
      profile?.dailyCheckins,
      profile?.startDate || inputStartDate,
      profile?.intervalDays || inputIntervalDays
    );
  }, [allAvailableCourses, profile, selectedCourseIds, progress, inputTargetDate, inputStartDate, inputIntervalDays]);

  // Goal & Milestone Schedule (Divides End Date - Start Date into Intervals)
  const goalSchedule = useMemo(() => {
    return calculateSem5GoalSchedule(
      stats.percentage,
      profile?.startDate || inputStartDate,
      profile?.targetCompleteDate || inputTargetDate,
      profile?.intervalDays || inputIntervalDays
    );
  }, [stats.percentage, profile?.startDate, profile?.targetCompleteDate, profile?.intervalDays, inputStartDate, inputTargetDate, inputIntervalDays]);

  const toggleAllModules = () => {
    if (!activeCourse) return;
    const allOpen = activeCourse.modules.every(m => !!expandedModules[m.id]);
    if (allOpen) {
      setExpandedModules({});
    } else {
      const exp: Record<string, boolean> = {};
      activeCourse.modules.forEach(m => {
        exp[m.id] = true;
      });
      setExpandedModules(exp);
    }
  };

  const todayKey = getTodayDateKey();
  const todayStudied = profile?.dailyCheckins ? profile.dailyCheckins[todayKey] : undefined;

  const triggerSaveToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2200);
  };

  // ==========================================
  // REGISTER / UPDATE PROFILE HANDLER
  // ==========================================
  const handleRegisterOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) {
      setFormError('Please enter your full name in ALL CAPS.');
      return;
    }
    const cleanPhone = inputPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 6) {
      setFormError('Please enter a valid phone number (Passkey).');
      return;
    }
    if (selectedCourseIds.length === 0) {
      setFormError('Please select at least one course to track.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const upperName = inputName.trim().toUpperCase();
    const studentId = normalizeDocId(upperName, subject, cleanPhone);
    const now = new Date().toISOString();

    const newProfile: Sem5StudentProfile = {
      id: studentId,
      name: upperName,
      phoneNumber: cleanPhone,
      subject,
      semester: 5,
      selectedCourses: selectedCourseIds,
      startDate: inputStartDate || defaultStartDate,
      targetCompleteDate: inputTargetDate || defaultTargetDate,
      intervalDays: inputIntervalDays || 7,
      targetCreatedDate: profile?.targetCreatedDate || now.split('T')[0],
      dailyCheckins: profile?.dailyCheckins || {},
      createdAt: profile?.createdAt || now,
      lastActive: now
    };

    try {
      saveLocalSem5Profile(newProfile);
      setProfile(newProfile);
      setSavedProfiles(getAllSavedSem5Profiles());
      setIsEditingProfile(false);
      setIsManagingCourses(false);
      setActiveCourseId(selectedCourseIds[0] || allAvailableCourses[0]?.id || '');

      await saveSem5ProgressToCloud(newProfile, progress);
      triggerSaveToast();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      setFormError('Failed to save profile. Please check your internet connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // LOGIN HANDLER (PASSKEY: NAME + PHONE)
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) {
      setFormError('Please enter your full name in ALL CAPS.');
      return;
    }
    const cleanPhone = inputPhone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 4) {
      setFormError('Please enter your phone number passkey.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const result = await loginSem5Student(inputName.trim(), cleanPhone, subject);
      if (result) {
        setProfile(result.profile);
        setProgress(result.progress);
        setSavedProfiles(getAllSavedSem5Profiles());
        setSelectedCourseIds(result.profile.selectedCourses);
        setInputStartDate(result.profile.startDate || defaultStartDate);
        setInputTargetDate(result.profile.targetCompleteDate);
        setInputIntervalDays(result.profile.intervalDays || 7);
        setActiveCourseId(result.profile.selectedCourses[0] || allAvailableCourses[0]?.id || '');
        triggerSaveToast();

        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 }
        });
      } else {
        setFormError('No matching record found. Please verify your Name and Phone or click Register.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setFormError('Failed to login. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // UPDATE GOAL / SCHEDULE HANDLER
  // ==========================================
  const handleUpdateGoalSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);

    const updatedProfile: Sem5StudentProfile = {
      ...profile,
      startDate: inputStartDate || defaultStartDate,
      targetCompleteDate: inputTargetDate || defaultTargetDate,
      intervalDays: inputIntervalDays || 7,
      lastActive: new Date().toISOString()
    };

    try {
      saveLocalSem5Profile(updatedProfile);
      setProfile(updatedProfile);
      setSavedProfiles(getAllSavedSem5Profiles());
      setIsEditingGoalModal(false);

      await saveSem5ProgressToCloud(updatedProfile, progress);
      triggerSaveToast();

      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.7 }
      });
    } catch (err) {
      console.error('Failed to update goal schedule:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // DAILY CHECK-IN HANDLER
  // ==========================================
  const handleDailyCheckin = async (studied: boolean) => {
    if (!profile || savingCheckin) return;
    setSavingCheckin(true);

    try {
      const updated = await saveSem5DailyCheckin(profile, todayKey, studied);
      setProfile(updated);
      setSavedProfiles(getAllSavedSem5Profiles());
      triggerSaveToast();

      if (studied) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 }
        });
      }
    } catch (err) {
      console.error('Daily checkin error:', err);
    } finally {
      setSavingCheckin(false);
    }
  };

  // Toggle Single Topic Status
  const handleToggleTopic = async (topicId: string, currentStatus: boolean) => {
    if (!profile) return;
    setSyncStatus('saving');

    const nextStatus = !currentStatus;
    const now = new Date().toISOString();

    const updated: Sem5ProgressMap = {
      ...progress,
      [topicId]: {
        ...(progress[topicId] || {}),
        completed: nextStatus,
        completedAt: nextStatus ? now : null,
        conceptDone: nextStatus ? true : (progress[topicId]?.conceptDone || false)
      }
    };

    setProgress(updated);
    triggerSaveToast();

    if (nextStatus) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#a855f7', '#3b82f6', '#10b981']
      });
    }

    try {
      await saveSem5ProgressToCloud(profile, updated);
      setSyncStatus('synced');
    } catch {
      setSyncStatus('offline');
    }
  };

  // Granular Stage Toggle (Concept, Problems, Revision)
  const handleToggleStage = async (topicId: string, stage: 'conceptDone' | 'problemsDone' | 'revisionDone', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile) return;
    setSyncStatus('saving');

    const cur = progress[topicId] || { completed: false };
    const nextVal = !cur[stage];
    
    const updatedTopic: Sem5TopicProgress = {
      ...cur,
      [stage]: nextVal,
      completed: (stage === 'conceptDone' && nextVal && cur.problemsDone) || 
                 (stage === 'problemsDone' && nextVal && cur.conceptDone) || 
                 cur.completed
    };

    const updated: Sem5ProgressMap = {
      ...progress,
      [topicId]: updatedTopic
    };

    setProgress(updated);
    triggerSaveToast();

    try {
      await saveSem5ProgressToCloud(profile, updated);
      setSyncStatus('synced');
    } catch {
      setSyncStatus('offline');
    }
  };

  // Bulk Module Toggle
  const handleBulkModuleToggle = async (module: Sem5ModuleDef, markCompleted: boolean) => {
    if (!profile) return;
    setSyncStatus('saving');

    const updated: Sem5ProgressMap = { ...progress };
    const now = new Date().toISOString();

    module.topics.forEach(t => {
      updated[t.id] = {
        ...(updated[t.id] || {}),
        completed: markCompleted,
        completedAt: markCompleted ? now : null,
        conceptDone: markCompleted ? true : (updated[t.id]?.conceptDone || false),
        problemsDone: markCompleted ? true : (updated[t.id]?.problemsDone || false)
      };
    });

    setProgress(updated);
    triggerSaveToast();

    if (markCompleted) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#f59e0b']
      });
    }

    try {
      await saveSem5ProgressToCloud(profile, updated);
      setSyncStatus('synced');
    } catch {
      setSyncStatus('offline');
    }
  };

  // Save Topic Remarks / Note
  const handleSaveNote = async () => {
    if (!activeNoteTopic || !profile) return;
    setSyncStatus('saving');

    const updated: Sem5ProgressMap = {
      ...progress,
      [activeNoteTopic.id]: {
        ...(progress[activeNoteTopic.id] || { completed: false }),
        notes: activeNoteTopic.notes.trim()
      }
    };

    setProgress(updated);
    setActiveNoteTopic(null);
    triggerSaveToast();

    try {
      await saveSem5ProgressToCloud(profile, updated);
      setSyncStatus('synced');
    } catch {
      setSyncStatus('offline');
    }
  };

  const toggleModuleExpand = (modId: string) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const toggleCourseChoice = (courseId: string) => {
    setSelectedCourseIds(prev => {
      if (prev.includes(courseId)) {
        if (prev.length === 1) {
          setFormError('Please keep at least one course selected.');
          return prev;
        }
        setFormError('');
        return prev.filter(c => c !== courseId);
      } else {
        setFormError('');
        return [...prev, courseId];
      }
    });
  };

  const handleLogout = () => {
    if (confirm('Do you want to log out from this session? Your progress is saved on the cloud and can be reopened anytime with your Name and Phone.')) {
      setProfile(null);
      setAuthMode('login');
      setInputName('');
      setInputPhone('');
    }
  };

  // Past 7 days streak list
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

  // Filtered Topics for Active Course
  const filteredModules = useMemo(() => {
    if (!activeCourse) return [];
    const q = searchQuery.toLowerCase().trim();

    return activeCourse.modules.map(mod => {
      const matchedTopics = mod.topics.filter(top => {
        const isDone = !!progress[top.id]?.completed;
        const matchesQuery = !q || top.title.toLowerCase().includes(q) || top.code.toLowerCase().includes(q) || mod.title.toLowerCase().includes(q);

        if (!matchesQuery) return false;
        if (statusFilter === 'completed') return isDone;
        if (statusFilter === 'pending') return !isDone;
        return true;
      });

      const modCompleted = mod.topics.filter(t => progress[t.id]?.completed).length;
      const modTotal = mod.topics.length;
      const modPct = modTotal > 0 ? Math.round((modCompleted / modTotal) * 100) : 0;

      return {
        ...mod,
        topics: matchedTopics,
        modCompleted,
        modTotal,
        modPct
      };
    }).filter(m => m.topics.length > 0 || !searchQuery);
  }, [activeCourse, progress, searchQuery, statusFilter]);

  const enrolledCourses = useMemo(() => {
    const list = profile?.selectedCourses || selectedCourseIds;
    return allAvailableCourses.filter(c => list.includes(c.id));
  }, [allAvailableCourses, profile?.selectedCourses, selectedCourseIds]);

  // =========================================================================
  // 1. ONBOARDING SCREEN (Register / Login - Matching Improvement Theme)
  // =========================================================================
  if (!profile || isEditingProfile || isManagingCourses) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-3.5 sm:p-6 md:p-8 font-sans relative overflow-x-hidden">
        {/* Subtle Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[700px] h-[300px] sm:h-[350px] bg-indigo-600/15 blur-[120px] sm:blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 right-5 w-[350px] sm:w-[500px] h-[300px] sm:h-[350px] bg-purple-600/15 blur-[100px] sm:blur-[130px] pointer-events-none rounded-full" />

        {/* Top Header */}
        <header className="w-full max-w-xl mx-auto flex items-center justify-between py-2 sm:py-4 relative z-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900 border border-slate-800 p-0.5 shadow-lg shadow-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-lg shrink-0">
              {subject === 'mathematics' ? '∑' : 'λ'}
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white">
                  Sem 5 {subject === 'mathematics' ? 'Mathematics' : 'Physics'} Progress
                </h1>
                <span className="px-1.5 sm:px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[9px] sm:text-[10px] font-extrabold rounded-full border border-indigo-500/30">
                  FYUGP
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400">AIMS Plus Academic Portal</p>
            </div>
          </div>

          {savedProfiles.filter(p => p.subject === subject).length > 0 && !profile && (
            <button
              type="button"
              onClick={() => setIsAccountSwitcherOpen(true)}
              className="flex items-center gap-1 py-1.5 px-2.5 sm:px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-full transition-all cursor-pointer shadow-lg text-[11px] sm:text-xs font-bold text-slate-300 active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Accounts ({savedProfiles.filter(p => p.subject === subject).length})</span>
            </button>
          )}
        </header>

        {/* Main Card */}
        <div className="w-full max-w-xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-8 shadow-2xl shadow-black/80 space-y-5 sm:space-y-6 my-auto relative z-10">
          
          {/* Mode Switcher Tabs */}
          {!isEditingProfile && !isManagingCourses && (
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
              {isManagingCourses 
                ? 'Update Enrolled Courses'
                : isEditingProfile 
                  ? 'Edit Student Profile'
                  : authMode === 'register' 
                    ? 'Student Registration' 
                    : 'Student Login'}
            </h2>
            <p className="text-slate-400 text-[11px] sm:text-xs md:text-sm">
              {authMode === 'register'
                ? 'Enter your name in ALL CAPS, phone number passkey, and target date.'
                : 'Login with Name and Phone passkey to open anywhere.'}
            </p>
          </div>

          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl sm:rounded-2xl text-rose-300 text-xs font-semibold text-center animate-in fade-in">
              {formError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={authMode === 'register' || isEditingProfile || isManagingCourses ? handleRegisterOrUpdate : handleLogin} className="space-y-4 sm:space-y-5">
            
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
                placeholder="ENTER FULL NAME"
                value={inputName}
                onChange={(e) => {
                  const upper = e.target.value.toUpperCase();
                  setInputName(upper);
                  if (upper.trim()) setFormError('');
                }}
                className="w-full h-12 sm:h-13 px-3.5 sm:px-4 bg-slate-950/70 border border-slate-700 rounded-xl sm:rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all"
                required
                autoFocus={!isManagingCourses}
              />
            </div>

            {/* Phone Number (Passkey) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-indigo-400" /> Phone / WhatsApp Number <span className="text-rose-400">*</span>
                </span>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                  <KeyRound className="w-3 h-3" /> Passkey
                </span>
              </label>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
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

            {/* Study Target & Milestone Schedule Dates */}
            {(authMode === 'register' || isEditingProfile) && (
              <div className="p-3.5 sm:p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <span>Study Schedule & Milestones *</span>
                  </label>
                  <span className="text-[11px] font-bold text-amber-400">
                    {goalSchedule.totalDays} Total Days ({goalSchedule.totalSlices} Milestones)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Start Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Start Date
                    </label>
                    <input 
                      type="date"
                      required
                      value={inputStartDate}
                      onChange={(e) => setInputStartDate(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Target Complete Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5 text-amber-400" /> Target Complete Date
                    </label>
                    <input 
                      type="date"
                      required
                      min={inputStartDate}
                      value={inputTargetDate}
                      onChange={(e) => setInputTargetDate(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Milestone Interval (Days) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                      Milestone Division Pace (Days per slice):
                    </label>
                    <span className="text-xs font-black text-indigo-300">
                      Every {inputIntervalDays} {inputIntervalDays === 1 ? 'Day' : 'Days'} ({inputIntervalDays === 7 ? '1 Week' : `${inputIntervalDays}d`})
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: '5 Days', days: 5 },
                      { label: '7 Days (1W)', days: 7 },
                      { label: '10 Days', days: 10 },
                      { label: '14 Days (2W)', days: 14 }
                    ].map(opt => (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => setInputIntervalDays(opt.days)}
                        className={`py-1.5 px-2 rounded-xl text-center text-xs font-bold border transition-all ${
                          inputIntervalDays === opt.days
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Presets for Target Date */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[10px] text-slate-500 font-bold">Quick Target:</span>
                  {[
                    { label: '+30 Days', days: 30 },
                    { label: '+45 Days', days: 45 },
                    { label: '+60 Days', days: 60 }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const start = inputStartDate ? new Date(inputStartDate) : new Date();
                        start.setDate(start.getDate() + preset.days);
                        setInputTargetDate(start.toISOString().split('T')[0]);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-indigo-900/50 text-indigo-300 text-[10px] font-bold border border-slate-700 transition-all active:scale-95"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Live Milestone Breakdown Preview */}
                <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-[11px] text-indigo-200">
                  <span className="font-black text-white">Milestone Plan: </span>
                  Divides {goalSchedule.totalDays} days into <strong>{goalSchedule.totalSlices} milestones</strong> ({goalSchedule.intervalDays} days each) reaching 100% by {inputTargetDate}.
                </div>
              </div>
            )}

            {/* Enrolled Courses Selection */}
            {(authMode === 'register' || isEditingProfile || isManagingCourses) && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-indigo-400" /> Enrolled Courses <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-xs font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                    Selected: {selectedCourseIds.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-0.5 max-h-48 overflow-y-auto pr-1">
                  {allAvailableCourses.map((c) => {
                    const isSelected = selectedCourseIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => toggleCourseChoice(c.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-4 h-4 rounded flex items-center justify-center text-xs shrink-0 ${
                            isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-700'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-bold truncate">
                            {c.code ? `[${c.code}] ` : ''}{c.title}
                          </span>
                        </div>

                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                          c.type === 'core' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {c.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <span>{isManagingCourses ? 'Save Changes' : isEditingProfile ? 'Update Profile' : authMode === 'register' ? 'Complete Registration' : 'Login to My Progress'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-xs text-slate-600 relative z-10">
          AIMS Education • Semester 5 Honours Curriculum Portal
        </footer>

        {/* Account Switcher Drawer */}
        {isAccountSwitcherOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-white">Saved Student Accounts</h3>
                <button onClick={() => setIsAccountSwitcherOpen(false)} className="text-slate-400 hover:text-white text-sm font-bold">
                  ✕
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedProfiles.filter(p => p.subject === subject).map(sp => (
                  <div
                    key={sp.id}
                    onClick={() => {
                      setProfile(sp);
                      setProgress(getLocalSem5Progress(subject, sp.id));
                      saveLocalSem5Profile(sp);
                      setSelectedCourseIds(sp.selectedCourses);
                      setInputTargetDate(sp.targetCompleteDate);
                      setActiveCourseId(sp.selectedCourses[0] || allAvailableCourses[0]?.id || '');
                      setIsAccountSwitcherOpen(false);
                      setIsEditingProfile(false);
                      setIsManagingCourses(false);
                    }}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-indigo-500 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-white uppercase">{sp.name}</h4>
                      <p className="text-[10px] text-slate-500">Phone: {sp.phoneNumber} • Target: {sp.targetCompleteDate}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLocalSem5Profile(sp.id);
                        setSavedProfiles(getAllSavedSem5Profiles());
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // =========================================================================
  // 2. MAIN LOGGED-IN STUDY PROGRESS DASHBOARD (Slate-950 Dark Theme)
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 sm:pb-16 font-sans relative overflow-x-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-96 right-0 w-[450px] h-[400px] bg-purple-600/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
          
          {/* Left: Logo & Subject Title */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs font-black text-sm shrink-0">
              {subject === 'mathematics' ? '∑' : 'λ'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 leading-none">
                <h1 className="text-xs sm:text-base font-black tracking-tight text-white truncate">
                  Sem 5 {subject === 'mathematics' ? 'Mathematics' : 'Physics'}
                </h1>
                <span className="text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  FYUGP
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 font-medium truncate mt-0.5">
                <span className="truncate">{profile.name}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-amber-400 font-bold shrink-0">
                  <KeyRound className="w-3 h-3" /> {profile.phoneNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            
            {/* Accounts Button */}
            {savedProfiles.filter(p => p.subject === subject).length > 1 && (
              <button
                onClick={() => setIsAccountSwitcherOpen(true)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                title="Switch Account"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Accounts</span>
              </button>
            )}

            {/* Profile / Edit Button (Compact Avatar on mobile, full pill on desktop) */}
            <button
              onClick={() => {
                setInputName(profile.name);
                setInputPhone(profile.phoneNumber);
                setInputStartDate(profile.startDate || defaultStartDate);
                setInputTargetDate(profile.targetCompleteDate);
                setInputIntervalDays(profile.intervalDays || 7);
                setSelectedCourseIds(profile.selectedCourses);
                setIsEditingProfile(true);
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              title="Edit Profile"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-bold text-white max-w-[90px] md:max-w-[130px] truncate hidden sm:inline">{profile.name}</span>
              <Edit3 className="w-3 h-3 text-slate-400 hidden sm:inline" />
            </button>

            {/* Excel Download */}
            <button
              onClick={() => exportSem5ProgressToExcel(profile, allAvailableCourses, progress, stats)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold border border-emerald-800/60 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
              title="Export progress to Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Excel</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 transition-all cursor-pointer"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 pt-3 sm:pt-5 space-y-3 sm:space-y-5 relative z-10">
        
        {/* ========================================================================= */}
        {/* MILESTONE TARGET & PACING GOAL PROGRESS (Start Date -> Target Date) */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl relative overflow-hidden space-y-3 sm:space-y-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 relative z-10">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="p-1 bg-indigo-500/20 text-indigo-300 rounded-lg shrink-0">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                </span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-300">
                  {goalSchedule.totalSlices}-Milestone Study Plan
                </span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-200 text-[9px] sm:text-[10px] font-black rounded-full border border-indigo-500/30">
                  {goalSchedule.intervalDays === 7 ? 'Weekly (7-Day) Pace' : `${goalSchedule.intervalDays} Days / Slice`}
                </span>
              </div>
              <h3 className="text-xs sm:text-base font-bold text-white leading-tight">
                {goalSchedule.currentSlice.title}: {goalSchedule.currentSlice.targetPercentage}% by {goalSchedule.currentSlice.targetDateFormatted}
              </h3>
            </div>

            {/* Target Status Badge & Quick Edit */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 self-start sm:self-auto">
              <div className={`px-2.5 py-1 rounded-xl border text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-xs ${
                goalSchedule.isCompleted 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-emerald-950/40' 
                  : goalSchedule.isOnTrack
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {goalSchedule.isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <span>{goalSchedule.statusText}</span>
              </div>

              <button
                onClick={() => {
                  setInputStartDate(profile.startDate || defaultStartDate);
                  setInputTargetDate(profile.targetCompleteDate);
                  setInputIntervalDays(profile.intervalDays || 7);
                  setIsEditingGoalModal(true);
                }}
                className="p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700/80 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                title="Adjust Plan Dates & Pace"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Edit Plan</span>
              </button>
            </div>
          </div>

          {/* Dual Target Progress Bar with Marker Flag and Milestone Divider Lines */}
          <div className="space-y-1.5 relative z-10">
            <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-400 font-bold">
              <span className="flex items-center gap-1">
                <span>Current Overall:</span>
                <strong className="text-white text-xs sm:text-sm font-black">{stats.percentage}%</strong>
              </span>
              <span className="text-indigo-300 flex items-center gap-1">
                <Flag className="w-3 h-3 text-indigo-400" />
                <span>Target ({goalSchedule.currentSlice.targetDateShort}):</span>
                <strong className="text-white">{goalSchedule.currentSlice.targetPercentage}%</strong>
              </span>
            </div>

            <div className="relative w-full bg-slate-950/90 rounded-full h-3.5 sm:h-4 overflow-hidden border border-slate-700/80 p-0.5">
              
              {/* Vertical Milestone Target Divider Lines */}
              {goalSchedule.milestones.map((m) => (
                <div
                  key={m.sliceNumber}
                  className={`absolute top-0 bottom-0 z-20 pointer-events-none transition-all ${
                    m.isCurrentSlice
                      ? 'w-1 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                      : m.status === 'completed'
                        ? 'w-0.5 bg-emerald-400/70'
                        : 'w-0.5 bg-indigo-400/40'
                  }`}
                  style={{ left: `calc(${m.targetPercentage}% - ${m.isCurrentSlice ? '2px' : '1px'})` }}
                  title={`${m.title}: ${m.targetPercentage}% by ${m.targetDateShort}`}
                />
              ))}

              {/* Progress Bar Fill */}
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out relative z-10 ${
                  goalSchedule.isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'
                }`}
                style={{ width: `${Math.min(100, stats.percentage)}%` }}
              />
            </div>
          </div>

          {/* Milestone Step Matrix (Ultra-clean single-row layout on mobile and desktop) */}
          <div className={`pt-1 relative z-10 ${
            goalSchedule.milestones.length <= 5 
              ? 'grid grid-cols-5 gap-1 sm:gap-2' 
              : 'flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar sm:grid sm:grid-cols-6 md:grid-cols-7'
          }`}>
            {goalSchedule.milestones.map((m) => {
              const isPassedOrDone = m.status === 'completed';
              const isCurrent = m.isCurrentSlice;

              return (
                <div
                  key={m.sliceNumber}
                  className={`p-1.5 sm:p-2.5 rounded-xl border text-center transition-all shrink-0 min-w-[56px] sm:min-w-0 ${
                    isPassedOrDone
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : isCurrent
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/80 scale-[1.02]'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-0.5">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight">
                      {m.title.replace('Week ', 'W').replace('Milestone ', 'M')}
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
        </section>

        {/* Target Complete Date & Countdown Summary Card */}
        <section className="relative overflow-hidden bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
          
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                Semester 5
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] sm:text-xs font-semibold border border-purple-500/30">
                {subject === 'mathematics' ? 'Mathematics Honours' : 'Physics Honours'}
              </span>
            </div>

            {/* Target Date Pill */}
            <button
              onClick={() => {
                setInputName(profile.name);
                setInputPhone(profile.phoneNumber);
                setInputStartDate(profile.startDate || defaultStartDate);
                setInputTargetDate(profile.targetCompleteDate);
                setInputIntervalDays(profile.intervalDays || 7);
                setSelectedCourseIds(profile.selectedCourses);
                setIsEditingProfile(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 text-xs font-bold border border-indigo-700/50 transition-all active:scale-95 cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Target: {profile.targetCompleteDate}</span>
              <Edit3 className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
            
            {/* Progress Metrics */}
            <div className="space-y-1 sm:col-span-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {stats.percentage}% Syllabus Mastered
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {stats.completedTopics} of {stats.totalTopics} topics completed across {enrolledCourses.length} courses
              </p>

              <div className="flex items-center gap-2.5 pt-1 text-xs font-semibold flex-wrap">
                <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <Calendar className="w-3.5 h-3.5" />
                  <strong>{stats.daysRemaining} Days Left</strong>
                </span>
                <span className="flex items-center gap-1 text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Need <strong>{stats.requiredDailyPace} topics/day</strong>
                </span>
              </div>
            </div>

            {/* Mastery Breakdown */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 text-center">
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                  <BookOpen className="w-3 h-3 text-cyan-400" /> Theory
                </div>
                <div className="text-base font-black text-cyan-400">{stats.conceptCount}</div>
              </div>
              <div className="space-y-0.5 border-x border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                  <Edit3 className="w-3 h-3 text-amber-400" /> Problems
                </div>
                <div className="text-base font-black text-amber-400">{stats.problemsCount}</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                  <RotateCw className="w-3 h-3 text-emerald-400" /> Revision
                </div>
                <div className="text-base font-black text-emerald-400">{stats.revisionCount}</div>
              </div>
            </div>

          </div>

          {/* Progress Bar with Milestone Dividers */}
          <div className="relative w-full bg-slate-950 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
            {goalSchedule.milestones.map((m) => (
              <div
                key={m.sliceNumber}
                className="absolute top-0 bottom-0 w-0.5 bg-slate-700/60 z-20 pointer-events-none"
                style={{ left: `${m.targetPercentage}%` }}
              />
            ))}
            <div 
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300 relative z-10"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>

        </section>

        {/* Daily Check-In & Streak Widget */}
        <section className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {stats.streak} Day Streak
              </span>
              <span className="text-xs font-bold text-slate-300">Daily Study Check-in</span>
            </div>
            
            {/* 7-Day Dots */}
            <div className="flex items-center gap-1.5 pt-1">
              {past7Days.map((d) => (
                <div key={d.key} className="flex flex-col items-center gap-0.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    d.isStudied 
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : d.isToday 
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-slate-950 text-slate-600 border border-slate-800'
                  }`}>
                    {d.isStudied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : d.dayName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-medium text-slate-400">Studied today?</span>
            <button
              onClick={() => handleDailyCheckin(true)}
              disabled={savingCheckin || todayStudied === true}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                todayStudied === true
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Yes</span>
            </button>
            <button
              onClick={() => handleDailyCheckin(false)}
              disabled={savingCheckin || todayStudied === false}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                todayStudied === false
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>Not yet</span>
            </button>
          </div>
        </section>

        {/* Course Tabs (Horizontally scrollable on desktop and mobile) */}
        <section className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                Enrolled Courses ({enrolledCourses.length}):
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">(Scroll horizontally to view all courses)</span>
            </div>
            <button
              onClick={() => {
                setInputName(profile.name);
                setInputPhone(profile.phoneNumber);
                setSelectedCourseIds(profile.selectedCourses);
                setInputStartDate(profile.startDate || defaultStartDate);
                setInputTargetDate(profile.targetCompleteDate);
                setInputIntervalDays(profile.intervalDays || 7);
                setIsManagingCourses(true);
              }}
              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <Settings className="w-3 h-3" /> Select Electives
            </button>
          </div>

          {/* Horizontally scrollable course list */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/40 -mx-1 px-1 select-none">
            {enrolledCourses.map(course => {
              const isSelected = activeCourse?.id === course.id;
              const courseTopics = course.modules.reduce((acc, m) => acc + m.topics.length, 0);
              const courseDone = course.modules.reduce((acc, m) => {
                return acc + m.topics.filter(t => progress[t.id]?.completed).length;
              }, 0);
              const coursePct = courseTopics > 0 ? Math.round((courseDone / courseTopics) * 100) : 0;

              return (
                <button
                  key={course.id}
                  onClick={() => setActiveCourseId(course.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all border active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white border-slate-800'
                  }`}
                >
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                        course.type === 'core' 
                          ? (isSelected ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-300')
                          : (isSelected ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-300')
                      }`}>
                        {course.code || course.type.toUpperCase()}
                      </span>
                      <span className="truncate max-w-[140px] sm:max-w-[200px] font-extrabold">{course.title}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {coursePct}%
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Active Course Banner & Textbook */}
        {activeCourse && (
          <section className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black">
                  {activeCourse.code || 'Course'}
                </span>
                <span className="text-xs font-bold uppercase text-slate-400">
                  {activeCourse.type === 'core' ? 'Major Core' : activeCourse.type === 'sec' ? 'Skill Enhancement Course (SEC)' : 'Major Elective'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white truncate">
                {activeCourse.title}
              </h3>
              {activeCourse.textbook && (
                <p className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1">
                  <BookMarked className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Textbook: {activeCourse.textbook}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['all', 'pending', 'completed'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`py-1 px-2.5 rounded-lg text-[11px] font-bold capitalize transition-all ${
                      statusFilter === tab
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Search Bar & Expand/Collapse All */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, theorems, or sections in this course..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={toggleAllModules}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            {activeCourse && activeCourse.modules.every(m => !!expandedModules[m.id]) ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                <span>Expand All</span>
              </>
            )}
          </button>
        </section>

        {/* Modules & Topics Checklist */}
        <section className="space-y-3">
          {filteredModules.length === 0 ? (
            <div className="bg-slate-900/90 rounded-2xl p-8 text-center border border-slate-800 text-slate-400 space-y-1">
              <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
              <h3 className="font-bold text-white text-sm">No topics found</h3>
              <p className="text-xs text-slate-500">Try clearing your search query or status filter.</p>
            </div>
          ) : (
            filteredModules.map((module) => {
              const isExpanded = !!expandedModules[module.id];
              const isFullyDone = module.modTotal > 0 && module.modCompleted === module.modTotal;

              return (
                <div 
                  key={module.id}
                  className={`bg-slate-900/90 border transition-all overflow-hidden rounded-2xl shadow-xl ${
                    isFullyDone ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-slate-800'
                  }`}
                >
                  {/* Module Header - Clean Title without 'Module I:' prefix */}
                  <div 
                    className={`p-3.5 sm:p-4 flex items-center justify-between gap-2.5 cursor-pointer select-none transition-colors ${
                      isFullyDone ? 'hover:bg-emerald-950/20' : 'hover:bg-slate-800/50'
                    }`}
                    onClick={() => toggleModuleExpand(module.id)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 ${
                        isFullyDone
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                          : 'bg-slate-950 text-indigo-400 border border-slate-800'
                      }`}>
                        {module.number}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-white truncate">
                            {module.title}
                          </h4>
                          {isFullyDone && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Mastered
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-300">
                        {module.modCompleted}/{module.modTotal}
                      </span>
                      <div className="w-10 sm:w-12 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isFullyDone ? 'bg-emerald-400' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${module.modPct}%` }}
                        />
                      </div>
                      <span className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>

                  {/* Module Topics */}
                  {isExpanded && (
                    <div className="px-3 pb-3 sm:px-4 sm:pb-4 border-t border-slate-800 space-y-2 pt-2.5">
                      
                      <div className="flex items-center justify-between text-[11px] py-0.5 border-b border-slate-800/80 mb-1">
                        <span className="text-slate-400 font-medium">
                          {module.topics.length} topics / sections
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBulkModuleToggle(module, true);
                            }}
                            className="font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
                          >
                            <CheckCheck className="w-3 h-3" /> Mark All
                          </button>
                          <span className="text-slate-700">|</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBulkModuleToggle(module, false);
                            }}
                            className="font-semibold text-slate-500 hover:text-slate-300 flex items-center gap-0.5 cursor-pointer"
                          >
                            <RotateCcw className="w-2.5 h-2.5" /> Reset
                          </button>
                        </div>
                      </div>

                      {/* Topics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {module.topics.map((top) => {
                          const item = progress[top.id] || { completed: false };
                          const isDone = !!item.completed;
                          const hasNotes = !!item.notes?.trim();

                          return (
                            <div
                              key={top.id}
                              onClick={() => handleToggleTopic(top.id, isDone)}
                              className={`p-2.5 sm:p-3 rounded-xl border flex flex-col justify-between gap-2 cursor-pointer transition-all active:scale-[0.99] ${
                                isDone
                                  ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <div className="pt-0.5 shrink-0">
                                    {isDone ? (
                                      <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 rounded-md border border-slate-700 bg-slate-900" />
                                    )}
                                  </div>

                                  <div className="min-w-0 space-y-0.5">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] font-black text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                                        {top.code}
                                      </span>
                                      <span className={`text-xs font-bold leading-snug ${
                                        isDone ? 'text-white' : 'text-slate-200'
                                      }`}>
                                        {top.title}
                                      </span>
                                    </div>
                                    
                                    {hasNotes && (
                                      <p className="text-[10px] text-amber-300 italic bg-amber-500/10 p-1 rounded border border-amber-500/20">
                                        "{item.notes}"
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveNoteTopic({
                                      id: top.id,
                                      code: top.code,
                                      title: top.title,
                                      notes: item.notes || ''
                                    });
                                  }}
                                  className={`p-1 rounded-lg text-xs shrink-0 cursor-pointer ${
                                    hasNotes ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-slate-300'
                                  }`}
                                  title="Add topic note"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* 3-Stage Mastery Buttons with Material Icons */}
                              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
                                <button
                                  onClick={(e) => handleToggleStage(top.id, 'conceptDone', e)}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                                    item.conceptDone
                                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-extrabold'
                                      : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                                  }`}
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>Concept</span>
                                  {item.conceptDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </button>

                                <button
                                  onClick={(e) => handleToggleStage(top.id, 'problemsDone', e)}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                                    item.problemsDone
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-extrabold'
                                      : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                                  }`}
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Problems</span>
                                  {item.problemsDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </button>

                                <button
                                  onClick={(e) => handleToggleStage(top.id, 'revisionDone', e)}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all border cursor-pointer ${
                                    item.revisionDone
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-extrabold'
                                      : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                                  }`}
                                >
                                  <RotateCw className="w-3 h-3" />
                                  <span>Revision</span>
                                  {item.revisionDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </button>
                              </div>

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

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-16 sm:bottom-6 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-2xl border border-indigo-500/40 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Progress saved & synced to cloud</span>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-20 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 py-2 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none">
            Target: {profile.targetCompleteDate} ({stats.daysRemaining}d left)
          </span>
          <span className="text-xs font-black text-white">
            {stats.percentage}% Done • {stats.completedTopics}/{stats.totalTopics} Topics
          </span>
        </div>
        <button
          onClick={() => {
            setInputName(profile.name);
            setInputPhone(profile.phoneNumber);
            setInputTargetDate(profile.targetCompleteDate);
            setSelectedCourseIds(profile.selectedCourses);
            setIsEditingProfile(true);
          }}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-xs active:scale-95"
        >
          Profile
        </button>
      </div>

      {/* Note / Remarks Modal */}
      {activeNoteTopic && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-black">
                  {activeNoteTopic.code}
                </span>
                <h3 className="font-bold text-white text-xs sm:text-sm truncate">
                  {activeNoteTopic.title}
                </h3>
              </div>
              <button 
                onClick={() => setActiveNoteTopic(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                Study Remarks, Important Theorems or Doubts
              </label>
              <textarea 
                rows={4}
                value={activeNoteTopic.notes}
                onChange={(e) => setActiveNoteTopic({ ...activeNoteTopic, notes: e.target.value })}
                placeholder="Study remarks, theorem proofs to revise, or textbook questions..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setActiveNoteTopic(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal & Milestone Schedule Editor Modal */}
      {isEditingGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300">
                  <Target className="w-5 h-5 text-indigo-400" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-white">Customize Study Plan & Pace</h3>
                  <p className="text-xs text-slate-400">Set start date, target date, and pacing intervals</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditingGoalModal(false)} 
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGoalSchedule} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Start Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Start Date
                  </label>
                  <input 
                    type="date"
                    required
                    value={inputStartDate}
                    onChange={(e) => setInputStartDate(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Target Complete Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-amber-400" /> Target Date
                  </label>
                  <input 
                    type="date"
                    required
                    min={inputStartDate}
                    value={inputTargetDate}
                    onChange={(e) => setInputTargetDate(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Milestone Interval Pace */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Milestone Interval (Days per slice):
                  </label>
                  <span className="text-xs font-black text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    Every {inputIntervalDays} {inputIntervalDays === 1 ? 'Day' : 'Days'} ({inputIntervalDays === 7 ? '1 Week' : `${inputIntervalDays}d`})
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '5 Days', days: 5 },
                    { label: '7 Days (1W)', days: 7 },
                    { label: '10 Days', days: 10 },
                    { label: '14 Days (2W)', days: 14 }
                  ].map(opt => (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => setInputIntervalDays(opt.days)}
                      className={`py-2 px-2.5 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                        inputIntervalDays === opt.days
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 font-extrabold'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[11px] text-slate-400 font-bold">Quick Target:</span>
                {[
                  { label: '+30 Days', days: 30 },
                  { label: '+45 Days', days: 45 },
                  { label: '+60 Days', days: 60 }
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      const start = inputStartDate ? new Date(inputStartDate) : new Date();
                      start.setDate(start.getDate() + preset.days);
                      setInputTargetDate(start.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-indigo-900/50 text-indigo-300 text-[11px] font-bold border border-slate-800 transition-all active:scale-95 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Live Preview Card */}
              <div className="p-3 bg-indigo-950/40 rounded-2xl border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
                <div className="font-extrabold text-white flex items-center justify-between">
                  <span>Schedule Breakdown Preview</span>
                  <span className="text-amber-400">{goalSchedule.totalDays} Days ({goalSchedule.totalSlices} Milestones)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your study plan spans from <strong>{inputStartDate}</strong> to <strong>{inputTargetDate}</strong>, divided into <strong>{goalSchedule.totalSlices} milestones</strong> of {goalSchedule.intervalDays} days each.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingGoalModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Study Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
