import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusOneBatch, 
  PlusOneScheduleItem,
  getScheduleForBatch,
  getTodayDateString,
  getExamCountdowns,
  getTodayFocusItem,
  getDaysDifference
} from '../../../data/plusOneStudyData';
import { 
  PlusOneStudentProfile,
  PlusOneProgressMap,
  PlusOneChapterProgress,
  getLocalPlusOneProfile,
  getLocalPlusOneProgress,
  savePlusOneStudentProgress,
  calculatePlusOneStats,
  loginPlusOneStudent,
  getAllLocalPlusOneProfiles,
  switchActivePlusOneProfile,
  removeLocalPlusOneProfile,
  normalizePlusOneDocId
} from '../../../services/plusOneStudyProgressService';
import { 
  CheckCircle2, 
  User, 
  GraduationCap, 
  Edit3, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Calculator, 
  Loader2, 
  Users, 
  UserPlus, 
  Trash2, 
  X, 
  Phone, 
  KeyRound, 
  LogOut, 
  Calendar, 
  Award, 
  ArrowRight,
  AlertCircle,
  Share2,
  Sparkles,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlusOneStudyProgressFormProps {
  onNavigateAdmin?: () => void;
}

export default function PlusOneStudyProgressForm({ onNavigateAdmin }: PlusOneStudyProgressFormProps) {
  const [profile, setProfile] = useState<PlusOneStudentProfile | null>(() => getLocalPlusOneProfile());
  const [progress, setProgress] = useState<PlusOneProgressMap>(() => getLocalPlusOneProgress());
  const [savedProfiles, setSavedProfiles] = useState<PlusOneStudentProfile[]>(() => getAllLocalPlusOneProfiles());

  // Auth & Profile state
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  
  // Inputs
  const [inputName, setInputName] = useState(profile?.name || '');
  const [inputBatch, setInputBatch] = useState<PlusOneBatch>(profile?.batch || 'A1');
  const [inputPhone, setInputPhone] = useState(profile?.phoneNumber || '');

  // Submissions & Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);
  const [loginSuccessToast, setLoginSuccessToast] = useState(false);

  // Accordion expanded chapters map
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  // Active Batch schedule
  const activeBatch: PlusOneBatch = profile?.batch || inputBatch || 'A1';
  const scheduleDef = useMemo(() => getScheduleForBatch(activeBatch), [activeBatch]);
  const examCountdowns = useMemo(() => getExamCountdowns(activeBatch), [activeBatch]);
  const todayStr = useMemo(() => getTodayDateString(), []);

  // Stats
  const stats = useMemo(() => calculatePlusOneStats(activeBatch, progress), [activeBatch, progress]);

  // Set of completed chapter IDs
  const completedItemIds = useMemo(() => {
    const setIds = new Set<string>();
    Object.entries(progress).forEach(([id, entry]) => {
      if (entry?.completed) setIds.add(id);
    });
    return setIds;
  }, [progress]);

  // Today's focus item
  const todayFocus = useMemo(() => {
    return getTodayFocusItem(activeBatch, completedItemIds);
  }, [activeBatch, completedItemIds]);

  const isTodayFocusCompleted = todayFocus.item ? !!progress[todayFocus.item.id]?.completed : false;

  useEffect(() => {
    document.title = `Plus One Study Progress • Batch ${activeBatch}`;
  }, [activeBatch]);

  // Trigger Save Toast
  const triggerSaveToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2200);
  };

  // ==========================================
  // REGISTRATION & PROFILE UPDATE
  // ==========================================
  const handleRegisterOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const upperName = inputName.trim().toUpperCase();
    const cleanPhone = inputPhone.trim();

    if (!upperName) {
      setFormError('Please enter your full name');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 8) {
      setFormError('Please enter a valid phone number (at least 8-10 digits)');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    const newProfile: PlusOneStudentProfile = {
      name: upperName,
      batch: inputBatch,
      phoneNumber: cleanPhone
    };

    try {
      const docId = normalizePlusOneDocId(newProfile.name, newProfile.batch, newProfile.phoneNumber);
      const existingProgress = getLocalPlusOneProgress(docId);
      const targetProgress = Object.keys(existingProgress).length > 0 && !isEditingProfile 
        ? existingProgress 
        : progress;

      await savePlusOneStudentProgress(newProfile, targetProgress);
      setProfile(newProfile);
      setProgress(targetProgress);
      setSavedProfiles(getAllLocalPlusOneProfiles());
      setIsEditingProfile(false);
      triggerSaveToast();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
      alert('Unable to save profile. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // LOGIN SUBMIT
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const upperName = inputName.trim().toUpperCase();
    const cleanPhone = inputPhone.trim();

    if (!upperName) {
      setFormError('Please enter your registered Name');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 8) {
      setFormError('Please enter your phone number');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const result = await loginPlusOneStudent(upperName, inputBatch, cleanPhone);

      if (result) {
        setProfile(result.profile);
        setProgress(result.progress);
        setInputName(result.profile.name);
        setInputBatch(result.profile.batch);
        setInputPhone(result.profile.phoneNumber);
        setSavedProfiles(getAllLocalPlusOneProfiles());

        setLoginSuccessToast(true);
        setTimeout(() => setLoginSuccessToast(false), 2500);
      } else {
        setFormError(
          `No record found for "${upperName}" in Batch ${inputBatch} with phone ${cleanPhone}. Please switch to New Student if you haven't registered yet.`
        );
      }
    } catch (err) {
      console.error(err);
      setFormError('Login failed. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // ACCOUNT SWITCHER
  // ==========================================
  const handleSwitchAccount = (targetProfile: PlusOneStudentProfile) => {
    switchActivePlusOneProfile(targetProfile);
    setProfile(targetProfile);
    setInputName(targetProfile.name);
    setInputBatch(targetProfile.batch);
    setInputPhone(targetProfile.phoneNumber);
    setProgress(getLocalPlusOneProgress());
    setIsAccountSwitcherOpen(false);
    triggerSaveToast();
  };

  const handleRemoveAccount = (targetProfile: PlusOneStudentProfile) => {
    const docId = normalizePlusOneDocId(targetProfile.name, targetProfile.batch, targetProfile.phoneNumber);
    if (!window.confirm(`Remove saved account for "${targetProfile.name}" on this device?`)) return;
    removeLocalPlusOneProfile(docId);
    const updated = getAllLocalPlusOneProfiles();
    setSavedProfiles(updated);
    if (profile && normalizePlusOneDocId(profile.name, profile.batch, profile.phoneNumber) === docId) {
      if (updated.length > 0) {
        handleSwitchAccount(updated[0]);
      } else {
        setProfile(null);
        setProgress({});
      }
    }
  };

  const handleLogout = () => {
    if (!window.confirm('Log out from this session?')) return;
    if (profile) {
      const docId = normalizePlusOneDocId(profile.name, profile.batch, profile.phoneNumber);
      removeLocalPlusOneProfile(docId);
    }
    setProfile(null);
    setProgress({});
  };

  // ==========================================
  // TOGGLE CHAPTER COMPLETION
  // ==========================================
  const handleToggleChapter = async (item: PlusOneScheduleItem, forceState?: boolean) => {
    if (!profile) return;
    const currentEntry = progress[item.id];
    const newState = forceState !== undefined ? forceState : !currentEntry?.completed;

    setSavingKey(item.id);

    const totalTopics = item.topics.length;
    const newBoxes = Array(totalTopics).fill(newState);
    const nowIso = new Date().toISOString();
    const newTimestamps = Array(totalTopics).fill(newState ? nowIso : null);

    const updatedEntry: PlusOneChapterProgress = {
      completed: newState,
      boxes: newBoxes,
      timestamps: newTimestamps,
      updatedAt: nowIso
    };

    const newProgress: PlusOneProgressMap = {
      ...progress,
      [item.id]: updatedEntry
    };

    setProgress(newProgress);

    try {
      await savePlusOneStudentProgress(profile, newProgress);
      triggerSaveToast();

      if (newState) {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.65 }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingKey(null);
    }
  };

  // ==========================================
  // TOGGLE TOPIC CHECKBOX
  // ==========================================
  const handleToggleTopic = async (item: PlusOneScheduleItem, topicIdx: number) => {
    if (!profile) return;
    const topicKey = `${item.id}_${topicIdx}`;
    setSavingKey(topicKey);

    const currentEntry = progress[item.id] || {
      completed: false,
      boxes: Array(item.topics.length).fill(false),
      timestamps: Array(item.topics.length).fill(null)
    };

    const newBoxes = [...currentEntry.boxes];
    while (newBoxes.length < item.topics.length) newBoxes.push(false);

    const newTimestamps = [...(currentEntry.timestamps || [])];
    while (newTimestamps.length < item.topics.length) newTimestamps.push(null);

    const nextBoxState = !newBoxes[topicIdx];
    newBoxes[topicIdx] = nextBoxState;
    newTimestamps[topicIdx] = nextBoxState ? new Date().toISOString() : null;

    const allDone = newBoxes.every(b => b === true);

    const updatedEntry: PlusOneChapterProgress = {
      completed: allDone,
      boxes: newBoxes,
      timestamps: newTimestamps,
      updatedAt: new Date().toISOString()
    };

    const newProgress: PlusOneProgressMap = {
      ...progress,
      [item.id]: updatedEntry
    };

    setProgress(newProgress);

    try {
      await savePlusOneStudentProgress(profile, newProgress);
      triggerSaveToast();

      if (allDone) {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.6 }
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingKey(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const setAllExpanded = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    scheduleDef.items.forEach(i => {
      next[i.id] = expand;
    });
    setExpandedChapters(next);
  };

  // =========================================================================
  // VIEW: MINIMAL APPLE-STYLE REGISTRATION / LOGIN MODAL
  // =========================================================================
  if (!profile || isEditingProfile) {
    return (
      <div className="min-h-screen bg-[#fbfbfd] text-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display',system-ui,sans-serif]">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <img 
              src="/aims_plus_logo.png" 
              alt="AIMS Plus" 
              className="h-9 sm:h-10 w-auto object-contain mx-auto" 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo1.png'; }} 
            />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Plus One Study Planner
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Class 11 Intensive Study Schedule • October 2026
            </p>
          </div>

          {/* Segmented Control */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setFormError(''); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'register' 
                  ? 'bg-white text-slate-900 shadow-sm font-bold' 
                  : 'hover:text-slate-900'
              }`}
            >
              {isEditingProfile ? 'Edit Profile' : 'New Student'}
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setFormError(''); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                authMode === 'login' 
                  ? 'bg-white text-slate-900 shadow-sm font-bold' 
                  : 'hover:text-slate-900'
              }`}
            >
              Returning Student
            </button>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{formError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={authMode === 'register' ? handleRegisterOrUpdate : handleLogin} className="space-y-4">
            
            {/* Student Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Full Name
              </label>
              <input
                type="text"
                required
                value={inputName}
                onChange={(e) => setInputName(e.target.value.toUpperCase())}
                placeholder="e.g. MOHAMMED SHAHAN"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
              />
            </div>

            {/* Batch Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Select Your Batch
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setInputBatch('A1')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    inputBatch === 'A1'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Batch A1</span>
                    {inputBatch === 'A1' && <Check className="w-4 h-4 text-blue-600 stroke-[2.5]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Week 1: 04–11 Oct
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setInputBatch('A2')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    inputBatch === 'A2'
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Batch A2</span>
                    {inputBatch === 'A2' && <Check className="w-4 h-4 text-blue-600 stroke-[2.5]" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Week 1: 05–12 Oct
                  </p>
                </button>
              </div>
            </div>

            {/* Mobile / Passkey */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Mobile / WhatsApp Number
              </label>
              <input
                type="tel"
                required
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                placeholder="10-digit phone number"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <span className="text-[11px] text-slate-400 block">
                Used to restore your progress across different browsers and devices
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>{authMode === 'register' ? (isEditingProfile ? 'Save Changes' : 'Open My Study Planner') : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {isEditingProfile && (
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors text-center"
              >
                Cancel
              </button>
            )}
          </form>

          {/* Saved accounts on this device */}
          {savedProfiles.length > 0 && !isEditingProfile && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Saved Accounts on this device
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {savedProfiles.map((p) => (
                  <div
                    key={`${p.name}_${p.batch}_${p.phoneNumber}`}
                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-between text-xs transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleSwitchAccount(p)}
                      className="flex-1 text-left flex items-center gap-2 cursor-pointer truncate"
                    >
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                        {p.batch}
                      </span>
                      <span className="font-semibold text-slate-800 truncate">{p.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveAccount(p)}
                      className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center pt-1">
            <a
              href="/admin/progress/plusone"
              onClick={(e) => {
                if (onNavigateAdmin) {
                  e.preventDefault();
                  onNavigateAdmin();
                }
              }}
              className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors inline-flex items-center gap-1"
            >
              <span>Faculty & Admin Portal</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN APPLE MINIMAL STUDENT WORKSPACE (LIGHT THEME)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display',system-ui,sans-serif] pb-24 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Progress saved</span>
        </div>
      )}

      {loginSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-2">
          <span>Welcome back, {profile.name}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR (Apple Glass Style) */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          
          {/* Left Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img 
              src="/aims_plus_logo.png" 
              alt="AIMS Plus" 
              className="h-6 sm:h-7 w-auto object-contain shrink-0" 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo1.png'; }} 
            />
            <div className="h-4 w-px bg-slate-200 shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900 truncate">
                  {profile.name}
                </span>
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                  Batch {profile.batch}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block truncate">
                {profile.phoneNumber}
              </span>
            </div>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Account Switcher Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAccountSwitcherOpen(!isAccountSwitcherOpen)}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Switch</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Account Dropdown */}
              {isAccountSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xl z-50 space-y-1.5">
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Accounts on this device
                  </div>

                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {savedProfiles.map(p => {
                      const isActive = p.name === profile.name && p.batch === profile.batch;
                      return (
                        <div
                          key={`${p.name}_${p.batch}_${p.phoneNumber}`}
                          className={`p-2 rounded-xl flex items-center justify-between text-xs ${
                            isActive ? 'bg-blue-50/70 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSwitchAccount(p)}
                            className="flex-1 text-left truncate cursor-pointer flex items-center gap-1.5"
                          >
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                              {p.batch}
                            </span>
                            <span className="truncate">{p.name}</span>
                          </button>
                          {!isActive && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAccount(p)}
                              className="text-slate-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountSwitcherOpen(false);
                        setIsEditingProfile(true);
                      }}
                      className="w-full py-1.5 px-2 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Name / Batch</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountSwitcherOpen(false);
                        handleLogout();
                      }}
                      className="w-full py-1.5 px-2 hover:bg-red-50 text-red-600 rounded-lg text-xs font-medium flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin button */}
            <a
              href="/admin/progress/plusone"
              onClick={(e) => {
                if (onNavigateAdmin) {
                  e.preventDefault();
                  onNavigateAdmin();
                }
              }}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-xs font-medium text-slate-700 transition-colors"
            >
              Admin
            </a>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTAINER */}
      {/* ========================================================================= */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        
        {/* ========================================================================= */}
        {/* TODAY'S FOCUS HERO (Apple Style Card) */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
          
          {/* Top Row: Eyebrow + Today's Date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-600 tracking-wide uppercase text-[11px]">
                Today's Target
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {todayFocus.item && (
              <span className="text-slate-400 text-[11px]">
                Scheduled: {todayFocus.item.dateFormatted}
              </span>
            )}
          </div>

          {/* Chapter Title & Subtitle */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 leading-snug">
              {todayFocus.item ? todayFocus.item.title : 'All Chapters Completed'}
            </h2>
            {todayFocus.item && (
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {todayFocus.item.subject === 'physics' ? 'Physics' : 'Mathematics'} • Week {todayFocus.item.weekNumber}
              </p>
            )}
          </div>

          {/* Primary Action Button */}
          {todayFocus.item && !todayFocus.item.isExam && (
            <div className="pt-1">
              <button
                type="button"
                disabled={savingKey === todayFocus.item.id}
                onClick={() => handleToggleChapter(todayFocus.item)}
                className={`w-full py-3.5 px-5 rounded-2xl font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99] ${
                  isTodayFocusCompleted
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100/60'
                    : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                }`}
              >
                {savingKey === todayFocus.item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-current" />
                ) : isTodayFocusCompleted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                    <span>Completed for Today</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 stroke-[2.5]" />
                    <span>Mark "{todayFocus.item.title}" Done</span>
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* EXAM COUNTDOWN CARDS (Apple Fitness/Health Widget Style) */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4">
          
          {/* Physics Exam Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-indigo-500" /> Physics Exam
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                {examCountdowns.physics.dateDisplay}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {examCountdowns.physics.isToday ? 'Today' : examCountdowns.physics.isPast ? 'Done' : examCountdowns.physics.daysRemaining}
              </span>
              {!examCountdowns.physics.isToday && !examCountdowns.physics.isPast && (
                <span className="text-xs text-slate-500 font-medium">days left</span>
              )}
            </div>

            <div className="pt-1">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, 100 - (examCountdowns.physics.daysRemaining * 12)))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mathematics Exam Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-blue-500" /> Maths Exam
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                {examCountdowns.maths.dateDisplay}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {examCountdowns.maths.isToday ? 'Today' : examCountdowns.maths.isPast ? 'Done' : examCountdowns.maths.daysRemaining}
              </span>
              {!examCountdowns.maths.isToday && !examCountdowns.maths.isPast && (
                <span className="text-xs text-slate-500 font-medium">days left</span>
              )}
            </div>

            <div className="pt-1">
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, 100 - (examCountdowns.maths.daysRemaining * 7)))}%` }}
                />
              </div>
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* OVERALL PROGRESS CARD (Crisp, Minimal) */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Syllabus Completion
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {stats.completedChapters} of {stats.totalChapters} chapters finished
              </span>
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {stats.overallPercentage}%
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#0071e3] h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.overallPercentage}%` }}
            />
          </div>

          {/* Subject split */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>
              Physics: <strong className="text-slate-800 font-semibold">{stats.physicsDone}/{stats.physicsTotal}</strong>
            </span>
            <span>
              Mathematics: <strong className="text-slate-800 font-semibold">{stats.mathsDone}/{stats.mathsTotal}</strong>
            </span>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CHAPTERS TIMELINE CHECKLIST (Apple Reminders / Notes Style) */}
        {/* ========================================================================= */}
        <section className="space-y-3 pt-2">
          
          {/* Section Header */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-900">
              Study Schedule Checklist
            </h3>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setAllExpanded(true)}
                className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              >
                Expand all
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => setAllExpanded(false)}
                className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
              >
                Collapse
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white border border-slate-200/80 rounded-3xl divide-y divide-slate-100 shadow-sm overflow-hidden">
            {scheduleDef.items.map((item, idx) => {
              const isCompleted = !!progress[item.id]?.completed;
              const isToday = item.dateIso === todayStr;
              const daysDiff = getDaysDifference(item.dateIso);
              const isOverdue = daysDiff < 0 && !isCompleted && !item.isExam;
              const isExpanded = !!expandedChapters[item.id];
              const entry = progress[item.id] || { completed: false, boxes: [], timestamps: [] };

              // Count completed subtopics
              let checkedCount = 0;
              for (let i = 0; i < item.topics.length; i++) {
                if (entry.boxes[i]) checkedCount++;
              }

              // Special Row for Exam
              if (item.isExam) {
                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 bg-slate-50/70 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        ★
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900">{item.title}</span>
                          {isToday && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              Today
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {item.dateFormatted} ({item.dayName})
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-slate-400">
                      Official Exam
                    </span>
                  </div>
                );
              }

              return (
                <div key={item.id} className="transition-colors">
                  
                  {/* Main row */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50">
                    
                    {/* Left: Tactile Apple Circular Checkbox */}
                    <button
                      type="button"
                      disabled={savingKey === item.id}
                      onClick={() => handleToggleChapter(item)}
                      className="shrink-0 cursor-pointer p-1 -m-1"
                      title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-[#34c759] border-[#34c759] text-white shadow-sm'
                          : isToday
                            ? 'border-blue-500 bg-blue-50/50'
                            : 'border-slate-300 hover:border-slate-400 bg-white'
                      }`}>
                        {savingKey === item.id ? (
                          <Loader2 className="w-3 h-3 animate-spin text-current" />
                        ) : isCompleted ? (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        ) : null}
                      </div>
                    </button>

                    {/* Middle: Title, due date & badges */}
                    <div 
                      onClick={() => toggleExpand(item.id)}
                      className="flex-1 min-w-0 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold leading-snug ${
                          isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}>
                          {item.title}
                        </span>

                        {isToday && (
                          <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200/80 rounded text-[10px] font-bold">
                            Due Today
                          </span>
                        )}
                        {isOverdue && (
                          <span className="px-1.5 py-0.2 bg-red-50 text-red-700 border border-red-200/80 rounded text-[10px] font-semibold">
                            Overdue
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{item.dateFormatted}</span>
                        <span>•</span>
                        <span className="capitalize">{item.subject}</span>
                        <span>•</span>
                        <span>{checkedCount}/{item.topics.length} topics</span>
                      </div>
                    </div>

                    {/* Right: Expand/Collapse Arrow */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                  </div>

                  {/* Expandable Subtopics Tray */}
                  {isExpanded && (
                    <div className="px-4 pb-3 pt-1 bg-slate-50/60 border-t border-slate-100 space-y-1 text-xs">
                      <div className="flex justify-between items-center py-1 text-[11px] text-slate-400 font-medium">
                        <span>NCERT Subtopics & Checkpoints</span>
                        <button
                          type="button"
                          onClick={() => handleToggleChapter(item, !isCompleted)}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          {isCompleted ? 'Uncheck all' : 'Check all'}
                        </button>
                      </div>

                      {item.topics.map((t, tIdx) => {
                        const isDone = !!entry.boxes[tIdx];
                        return (
                          <div
                            key={t.id}
                            onClick={() => handleToggleTopic(item, tIdx)}
                            className="p-2 bg-white rounded-xl border border-slate-200/60 flex items-center justify-between gap-2.5 cursor-pointer hover:border-slate-300 transition-colors"
                          >
                            <span className={`text-xs ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {t.topicNumber ? `${t.topicNumber} ` : ''}{t.titleEn}
                            </span>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                              isDone ? 'bg-[#34c759] border-[#34c759] text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
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

        </section>

      </main>
    </div>
  );
}
