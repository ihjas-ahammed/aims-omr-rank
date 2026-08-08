import React, { useState, useEffect, useMemo } from 'react';
import { 
  STUDY_SUBJECTS, 
  TOTAL_CHAPTERS, 
  TOTAL_CHECKPOINTS, 
  SubjectDef, 
  ChapterDef,
  FirstLanguageSubject,
  getSubjectListForStudent
} from '../../../data/studyProgressData';
import { 
  StudentProfile, 
  StudentMedium,
  ChapterBoxesMap, 
  getLocalStudentProfile, 
  getLocalChapterProgress, 
  saveStudentProgress, 
  calculateProgressStats,
  getAllLocalProfiles,
  switchActiveProfile,
  removeLocalProfile
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
  Download,
  Users,
  UserPlus,
  Trash2,
  X,
  Phone,
  PhoneCall
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
    case 'malayalam1': return <BookOpen className="w-5 h-5 text-pink-100 drop-shadow" />;
    case 'malayalam2': return <BookOpen className="w-5 h-5 text-pink-100 drop-shadow" />;
    case 'arabic': return <BookOpen className="w-5 h-5 text-emerald-100 drop-shadow" />;
    case 'urdu': return <BookOpen className="w-5 h-5 text-amber-100 drop-shadow" />;
    case 'history': return <Landmark className="w-5 h-5 text-violet-100 drop-shadow" />;
    case 'geography': return <Globe className="w-5 h-5 text-sky-100 drop-shadow" />;
    default: return <BookOpen className="w-5 h-5 text-slate-100 drop-shadow" />;
  }
}

export default function StudyProgressForm({ onNavigateAdmin }: StudyProgressFormProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(() => getLocalStudentProfile());
  const [boxes, setBoxes] = useState<ChapterBoxesMap>(() => getLocalChapterProgress());
  const [savedProfiles, setSavedProfiles] = useState<StudentProfile[]>(() => getAllLocalProfiles());
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  
  // Set page title
  useEffect(() => {
    document.title = 'AIMS';
  }, []);

  // Onboarding input states
  const [inputName, setInputName] = useState(profile?.name || '');
  const [inputClass, setInputClass] = useState(profile?.studentClass || 'E1');
  const [inputAdmNo, setInputAdmNo] = useState(profile?.admissionNo || '');
  const [inputMedium, setInputMedium] = useState<StudentMedium>(profile?.medium || 'English');
  const [inputFirstLang, setInputFirstLang] = useState<FirstLanguageSubject>(profile?.firstLanguage || 'Malayalam');
  const [inputPhone, setInputPhone] = useState(profile?.phoneNumber || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formError, setFormError] = useState('');

  // Custom Alert Modal state for existing users without phone number
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(() => {
    return !!(profile && (!profile.phoneNumber || !profile.phoneNumber.trim()));
  });
  const [modalPhone, setModalPhone] = useState('');
  const [modalPhoneError, setModalPhoneError] = useState('');
  const [isSavingModalPhone, setIsSavingModalPhone] = useState(false);

  const handleSwitchAccount = (admNo: string) => {
    const { profile: nextProfile, progress: nextBoxes } = switchActiveProfile(admNo);
    if (nextProfile) {
      setProfile(nextProfile);
      setBoxes(nextBoxes);
      setInputName(nextProfile.name);
      setInputClass(nextProfile.studentClass);
      setInputAdmNo(nextProfile.admissionNo);
      setInputMedium(nextProfile.medium);
      setInputFirstLang(nextProfile.firstLanguage || 'Malayalam');
      setInputPhone(nextProfile.phoneNumber || '');
      setIsEditingProfile(false);
      setIsAddingAccount(false);
      setIsAccountSwitcherOpen(false);
      setShowPhoneModal(!!(!nextProfile.phoneNumber || !nextProfile.phoneNumber.trim()));
      triggerSaveToast();
    }
  };

  const handleAddAccount = () => {
    setInputName('');
    setInputClass('E1');
    setInputAdmNo('');
    setInputMedium('English');
    setInputFirstLang('Malayalam');
    setInputPhone('');
    setIsAddingAccount(true);
    setIsEditingProfile(false);
    setIsAccountSwitcherOpen(false);
  };

  const handleRemoveAccount = (admNo: string) => {
    const updated = removeLocalProfile(admNo);
    setSavedProfiles(updated);
    const active = getLocalStudentProfile();
    setProfile(active);
    if (active) {
      setBoxes(getLocalChapterProgress(active.admissionNo));
    } else {
      setBoxes({});
      setIsAddingAccount(true);
    }
  };

  // Auto-prompt old users who haven't selected a first language subject yet
  useEffect(() => {
    if (profile && !profile.firstLanguage) {
      setIsEditingProfile(true);
      setFormError('Please select your First Language Subject (Malayalam I, Arabic, or Urdu) to update your profile.');
    }
  }, [profile]);

  const handleSaveOldUserPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = modalPhone.trim();
    if (!trimmed || trimmed.length < 8) {
      setModalPhoneError('Please enter a valid Phone / WhatsApp number (at least 8-10 digits)');
      return;
    }
    setIsSavingModalPhone(true);
    setModalPhoneError('');

    try {
      const updatedProfile: StudentProfile = {
        ...profile!,
        phoneNumber: trimmed
      };
      await saveStudentProgress(updatedProfile, boxes);
      setProfile(updatedProfile);
      setInputPhone(trimmed);
      setSavedProfiles(getAllLocalProfiles());
      setShowPhoneModal(false);
      triggerSaveToast();
    } catch (err) {
      setModalPhoneError('Failed to save phone number to database. Please check your internet connection.');
    } finally {
      setIsSavingModalPhone(false);
    }
  };

  // Saving state tracker for specific checkbox
  const [savingBoxKey, setSavingBoxKey] = useState<string | null>(null);

  // Real-time auto-save indicator toast
  const [saveToast, setSaveToast] = useState(false);

  const studentSubjects = useMemo(() => getSubjectListForStudent(profile?.firstLanguage), [profile?.firstLanguage]);

  // Accordion open/close state map for each subject (id -> boolean)
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    studentSubjects.forEach((s, idx) => {
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

  const stats = useMemo(() => calculateProgressStats(boxes, profile?.firstLanguage), [boxes, profile?.firstLanguage]);

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
    if (!inputPhone.trim() || inputPhone.trim().length < 8) {
      setFormError('Please enter a valid Phone / WhatsApp number (at least 8-10 digits)');
      return;
    }

    setFormError('');
    const newProfile: StudentProfile = {
      name: inputName.trim(),
      studentClass: inputClass.trim(),
      admissionNo: inputAdmNo.trim(),
      medium: inputMedium,
      firstLanguage: inputFirstLang,
      phoneNumber: inputPhone.trim()
    };

    try {
      const existingBoxes = getLocalChapterProgress(newProfile.admissionNo);
      const targetBoxes = (Object.keys(existingBoxes).length > 0 && !isEditingProfile) ? existingBoxes : boxes;

      await saveStudentProgress(newProfile, targetBoxes);
      setProfile(newProfile);
      setBoxes(targetBoxes);
      setSavedProfiles(getAllLocalProfiles());
      setIsEditingProfile(false);
      setIsAddingAccount(false);
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

      const newStats = calculateProgressStats(updatedMap, profile.firstLanguage);
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
    studentSubjects.forEach(s => { next[s.id] = isOpen; });
    setOpenSubjects(next);
  };

  // --- SIGN UP / PROFILE ENTRY SCREEN ---
  if (!profile || isEditingProfile || isAddingAccount) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 md:p-8 font-sans">
        <header className="w-full max-w-lg mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src="/app_icon.png?v=2" alt="AIMS Logo" className="w-10 h-10 rounded-xl object-contain bg-slate-900 border border-slate-800 p-1 shadow-lg" />
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white">Study Progress</h1>
              <p className="text-[11px] text-slate-400">Student Portal</p>
            </div>
          </div>

          {savedProfiles.length > 0 && (
            <button
              type="button"
              onClick={() => setIsAccountSwitcherOpen(true)}
              className="flex items-center gap-2 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-full transition-all cursor-pointer shadow-lg text-xs font-bold text-slate-300"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Accounts ({savedProfiles.length})</span>
            </button>
          )}
        </header>

        <div className="w-full max-w-lg mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 my-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isEditingProfile ? 'Edit Student Profile' : isAddingAccount ? 'Add Student Account' : 'Student Registration'}
            </h2>
            <p className="text-slate-400 text-xs md:text-sm">
              {isAddingAccount ? 'Add another student account to track progress on this device.' : 'Enter your details, select your batch, first language, and preferred medium.'}
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
                placeholder="Enter full name"
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

            {/* Phone Number Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-indigo-400" /> Phone / WhatsApp Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                className="w-full h-12 px-4 bg-slate-800/90 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium transition-all"
                required
              />
            </div>

            {/* First Language Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" /> First Language Subject
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-800/60 border border-slate-700 rounded-2xl">
                {(['Malayalam', 'Arabic', 'Urdu'] as FirstLanguageSubject[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setInputFirstLang(lang)}
                    className={`py-3 px-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                      inputFirstLang === lang
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{lang === 'Malayalam' ? 'Malayalam I' : lang}</span>
                  </button>
                ))}
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
              {isEditingProfile ? 'Save & Return' : isAddingAccount ? 'Add Account' : 'Start Progress Tracking'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {(isEditingProfile || (isAddingAccount && profile)) && (
            <button
              type="button"
              onClick={() => {
                setIsEditingProfile(false);
                setIsAddingAccount(false);
                if (profile) {
                  setInputName(profile.name);
                  setInputClass(profile.studentClass);
                  setInputAdmNo(profile.admissionNo);
                  setInputMedium(profile.medium);
                  setInputFirstLang(profile.firstLanguage || 'Malayalam');
                }
              }}
              className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl text-xs transition-all cursor-pointer"
            >
              Cancel & Return
            </button>
          )}
        </div>

        <footer className="w-full max-w-lg mx-auto py-4 text-center text-xs text-slate-500">
          Study Progress • Student Module
        </footer>

        {/* Account Switcher Modal */}
        {isAccountSwitcherOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">Switch Account</h3>
                    <p className="text-xs text-slate-400">Select an account to view or track progress</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAccountSwitcherOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                {savedProfiles.map((p) => {
                  const isActive = profile?.admissionNo === p.admissionNo;
                  const pProgress = getLocalChapterProgress(p.admissionNo);
                  const pStats = calculateProgressStats(pProgress, p.firstLanguage);

                  return (
                    <div
                      key={p.admissionNo}
                      onClick={() => handleSwitchAccount(p.admissionNo)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600/10 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                          : 'bg-slate-800/50 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-inner flex-shrink-0 ${
                          isActive
                            ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-indigo-500/30'
                            : 'bg-gradient-to-tr from-slate-700 to-slate-800'
                        }`}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                            {isActive && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold rounded-md flex-shrink-0">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            Adm #{p.admissionNo} • Batch {p.studentClass} • {p.medium}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg">
                          {pStats.overallPercentage}%
                        </span>

                        {savedProfiles.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Remove ${p.name} (Adm #${p.admissionNo}) from this device?`)) {
                                handleRemoveAccount(p.admissionNo);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Remove Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={handleAddAccount}
                  className="w-full py-3 px-4 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Account</span>
                </button>
              </div>
            </div>
          </div>
        )}
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
            <img src="/app_icon.png?v=2" alt="AIMS Logo" className="w-9 h-9 rounded-xl object-contain bg-slate-950 border border-slate-800 p-0.5" />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-extrabold text-white leading-tight">Study Progress</h1>
                <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold rounded-md">
                  {profile.medium}
                </span>
                <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-extrabold rounded-md">
                  {profile.firstLanguage || 'Malayalam'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{profile.name} • Batch {profile.studentClass} • Adm: {profile.admissionNo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Account Switcher Button */}
            <button
              onClick={() => setIsAccountSwitcherOpen(true)}
              className="flex items-center gap-2 py-1.5 px-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-full transition-all cursor-pointer shadow-sm active:scale-95 group"
              title="Switch Account"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-[10px] flex items-center justify-center shadow">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-white max-w-[90px] sm:max-w-[130px] truncate">
                {profile.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
            </button>

            {/* Edit Profile */}
            <button
              onClick={() => {
                setInputName(profile.name);
                setInputClass(profile.studentClass);
                setInputAdmNo(profile.admissionNo);
                setInputMedium(profile.medium);
                setInputFirstLang(profile.firstLanguage || 'Malayalam');
                setInputPhone(profile.phoneNumber || '');
                setIsEditingProfile(true);
              }}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-full transition-colors cursor-pointer"
              title="Edit Profile Details"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Remove Install App button once clicked */}
            {deferredPrompt && !hasClickedInstall && (
              <button
                onClick={handleInstallClick}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                title="Install App to Homescreen"
              >
                <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Install</span>
              </button>
            )}
          </div>
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
            <span>{studentSubjects.reduce((acc, s) => acc + s.chapters.length, 0)} Chapters Total</span>
          </div>
        </div>

        {/* Accordion Controls Bar */}
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

        {/* SUBJECT ACCORDION DROPDOWNS WITH MATERIAL/LUCIDE ICONS */}
        <div className="space-y-4">
          {studentSubjects.map((subject) => {
            const isOpen = !!openSubjects[subject.id];
            const subPerc = stats.subjectPercentages[subject.id] || 0;
            const subName = isMalayalam ? subject.nameMl : subject.nameEn;

            let completedChaptersCount = 0;
            subject.chapters.forEach(ch => {
              const entry = boxes[ch.id] || { boxes: [false, false, false], timestamps: [null, null, null] };
              const maxB = ch.totalBoxes || 1;
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
                      const maxB = chapter.totalBoxes || 1;
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

      {/* Account Switcher Modal */}
      {isAccountSwitcherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Switch Account</h3>
                  <p className="text-xs text-slate-400">Select an account to view or track progress</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountSwitcherOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {savedProfiles.map((p) => {
                const isActive = profile?.admissionNo === p.admissionNo;
                const pProgress = getLocalChapterProgress(p.admissionNo);
                const pStats = calculateProgressStats(pProgress, p.firstLanguage);

                return (
                  <div
                    key={p.admissionNo}
                    onClick={() => handleSwitchAccount(p.admissionNo)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                        : 'bg-slate-800/50 hover:bg-slate-800 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-inner flex-shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-indigo-500/30'
                          : 'bg-gradient-to-tr from-slate-700 to-slate-800'
                      }`}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{p.name}</h4>
                          {isActive && (
                            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold rounded-md flex-shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          Adm #{p.admissionNo} • Batch {p.studentClass} • {p.medium}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg">
                        {pStats.overallPercentage}%
                      </span>

                      {savedProfiles.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Remove ${p.name} (Adm #${p.admissionNo}) from this device?`)) {
                              handleRemoveAccount(p.admissionNo);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove Account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={handleAddAccount}
                className="w-full py-3 px-4 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 font-bold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM OLD USER PHONE ALERT MODAL */}
      {showPhoneModal && profile && (!profile.phoneNumber || !profile.phoneNumber.trim()) && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-5 text-white relative">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 p-3 mx-auto flex items-center justify-center text-indigo-400 shadow-lg mb-2">
                <PhoneCall className="w-7 h-7 text-indigo-400 animate-pulse" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-extrabold rounded-full mb-1">
                <span>Action Required for Existing Students</span>
              </div>
              <h3 className="text-xl font-black text-white">Update Phone Number</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Dear <strong className="text-indigo-300">{profile.name}</strong>, please enter your mobile / WhatsApp number to complete your profile update and sync with database.
              </p>
            </div>

            {modalPhoneError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs font-semibold text-center">
                {modalPhoneError}
              </div>
            )}

            <form onSubmit={handleSaveOldUserPhone} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-indigo-400" /> Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={modalPhone}
                  onChange={(e) => setModalPhone(e.target.value)}
                  className="w-full h-12 px-4 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-medium transition-all"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isSavingModalPhone}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isSavingModalPhone ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving to Database...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Save & Update Profile
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
