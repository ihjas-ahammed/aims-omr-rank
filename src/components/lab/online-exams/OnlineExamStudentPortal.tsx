import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send, 
  FileText, 
  Layers, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  RotateCcw, 
  ChevronRight, 
  User, 
  Users, 
  Phone, 
  GraduationCap,
  Download,
  AlertTriangle,
  ZoomIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  OnlineExam, 
  ExamQuestion, 
  DescriptiveAnswer, 
  DescriptiveAnswerImage,
  fetchOnlineExamById, 
  submitOnlineExam 
} from '../../../services/onlineExamService';
import { uploadAnswerPhotoToB2 } from '../../../services/b2StorageService';
import { processImage, compressImageToBlob } from '../../../utils/imageProcessing';

interface OnlineExamStudentPortalProps {
  examId: string;
}

interface SavedStudentProfile {
  name: string;
  studentClass: string;
  phoneNumber: string;
  admissionNo?: string;
  lastUsedAt: string;
}

const LOCAL_STORAGE_PROFILES = 'aims_exam_saved_profiles';
const LOCAL_STORAGE_ACTIVE_PROFILE = 'aims_exam_active_profile';

export default function OnlineExamStudentPortal({ examId }: OnlineExamStudentPortalProps) {
  const [exam, setExam] = useState<OnlineExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step flow: 'onboarding' | 'taking' | 'submitted'
  const [step, setStep] = useState<'onboarding' | 'taking' | 'submitted'>('onboarding');

  // Student Profile state
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('A1');
  const [customClass, setCustomClass] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [savedProfiles, setSavedProfiles] = useState<SavedStudentProfile[]>([]);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);

  // Exam taking state
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, string>>({});
  const [descriptiveAnswers, setDescriptiveAnswers] = useState<Record<number, DescriptiveAnswer>>({});
  const [uploadingQuestions, setUploadingQuestions] = useState<Record<number, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [activeFilter, setActiveFilter] = useState<'all' | 'mcq' | 'descriptive' | 'unanswered'>('all');

  // Timer & Countdown
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  // Anti-cheat incident tracking
  const [incidents, setIncidents] = useState<{ time: string; reason: string }[]>([]);
  const [showCheatModal, setShowCheatModal] = useState(false);
  const [cheatReasonInput, setCheatReasonInput] = useState('');
  const lastHiddenTime = useRef<string>('');

  // Confirmation & Submission
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionReceiptId, setSubmissionReceiptId] = useState<string | null>(null);
  const [submissionTime, setSubmissionTime] = useState<string | null>(null);

  // Image Preview Modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // File Inputs references for camera & gallery
  const cameraInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const galleryInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    // Load saved student profiles from localStorage
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_PROFILES);
      if (raw) {
        const parsed: SavedStudentProfile[] = JSON.parse(raw);
        setSavedProfiles(parsed);
        if (parsed.length > 0) {
          setStudentName(parsed[0].name);
          setStudentClass(parsed[0].studentClass);
          setPhoneNumber(parsed[0].phoneNumber || '');
        }
      }
    } catch (e) {}

    // Fetch Exam
    async function loadExam() {
      setLoading(true);
      try {
        const data = await fetchOnlineExamById(examId);
        if (data) {
          setExam(data);
          if (data.durationMinutes && data.durationMinutes > 0) {
            setSecondsRemaining(data.durationMinutes * 60);
          }
        } else {
          setError('Exam not found. Please verify the exam link.');
        }
      } catch (err: any) {
        setError('Failed to load the exam: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    if (examId) {
      loadExam();
    } else {
      setError('No Exam ID specified in URL.');
      setLoading(false);
    }
  }, [examId]);

  // Countdown timer effect
  useEffect(() => {
    if (step !== 'taking' || secondsRemaining === null) return;
    if (secondsRemaining <= 0) {
      handleFinalSubmit(); // Auto-submit when time expires
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [step, secondsRemaining]);

  // Anti-Cheat: Visibility / Focus tracker
  useEffect(() => {
    if (step !== 'taking') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastHiddenTime.current = new Date().toISOString();
      } else {
        setShowCheatModal(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [step]);

  const handleSelectSavedProfile = (profile: SavedStudentProfile) => {
    setStudentName(profile.name);
    setStudentClass(profile.studentClass);
    setPhoneNumber(profile.phoneNumber || '');
    setIsAccountSwitcherOpen(false);
  };

  const handleStartExam = () => {
    if (!studentName.trim()) {
      alert('Please enter your full name.');
      return;
    }

    const finalClass = studentClass === 'Other' ? customClass.trim() || 'General' : studentClass;

    // Save profile to device memory
    const updatedProfiles = savedProfiles.filter(p => p.name.toLowerCase() !== studentName.trim().toLowerCase());
    const newProfile: SavedStudentProfile = {
      name: studentName.trim(),
      studentClass: finalClass,
      phoneNumber: phoneNumber.trim(),
      lastUsedAt: new Date().toISOString()
    };
    updatedProfiles.unshift(newProfile);
    setSavedProfiles(updatedProfiles);
    localStorage.setItem(LOCAL_STORAGE_PROFILES, JSON.stringify(updatedProfiles));
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_PROFILE, JSON.stringify(newProfile));

    setStep('taking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCheatModalSubmit = () => {
    const reason = cheatReasonInput.trim() || 'Tab switched / App minimized';
    setIncidents(prev => [...prev, { time: lastHiddenTime.current || new Date().toISOString(), reason }]);
    setShowCheatModal(false);
    setCheatReasonInput('');
  };

  // MCQ Selection
  const handleSelectOption = (qNum: number, option: string) => {
    setMcqAnswers(prev => ({
      ...prev,
      [qNum]: prev[qNum] === option ? '' : option
    }));
  };

  // Descriptive Photo Upload to Backblaze B2
  const handlePhotoUpload = async (qNum: number, files: FileList | null) => {
    if (!files || files.length === 0 || !exam) return;

    setUploadingQuestions(prev => ({ ...prev, [qNum]: true }));
    setUploadProgress(prev => ({ ...prev, [qNum]: 10 }));

    const studentFolder = `${studentName.trim()}_${phoneNumber.trim() || 'std'}`;
    const currentAns = descriptiveAnswers[qNum] || { questionNumber: qNum, images: [] };
    const currentImages = [...currentAns.images];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Auto-compress image to optimal quality and resolution (1200px max, 0.65 JPEG)
        // Reduces 8-15MB phone camera snaps to sharp ~100-180KB documents
        const compressedBlob = await compressImageToBlob(file, 1200, 0.65);

        setUploadProgress(prev => ({ ...prev, [qNum]: 40 + Math.round(((i + 1) / files.length) * 50) }));

        // Upload to Backblaze B2
        const uploaded = await uploadAnswerPhotoToB2({
          file: compressedBlob,
          examId: exam.id,
          studentFolder,
          questionNumber: qNum,
          photoIndex: currentImages.length + i
        });

        currentImages.push(uploaded);
      }

      setDescriptiveAnswers(prev => ({
        ...prev,
        [qNum]: {
          questionNumber: qNum,
          images: currentImages
        }
      }));
    } catch (e: any) {
      alert('Photo upload failed: ' + e.message);
    } finally {
      setUploadingQuestions(prev => ({ ...prev, [qNum]: false }));
      setUploadProgress(prev => ({ ...prev, [qNum]: 0 }));
    }
  };

  const handleUpdateTextAnswer = (qNum: number, text: string) => {
    setDescriptiveAnswers(prev => {
      const current = prev[qNum] || { questionNumber: qNum, images: [] };
      return {
        ...prev,
        [qNum]: {
          ...current,
          questionNumber: qNum,
          textAnswer: text
        }
      };
    });
  };

  const handleRemovePhoto = (qNum: number, imgIndex: number) => {
    setDescriptiveAnswers(prev => {
      const current = prev[qNum];
      if (!current) return prev;
      const updatedImages = current.images.filter((_, idx) => idx !== imgIndex);
      return {
        ...prev,
        [qNum]: { ...current, images: updatedImages }
      };
    });
  };

  const handleFinalSubmit = async () => {
    if (!exam || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const finalClass = studentClass === 'Other' ? customClass.trim() || 'General' : studentClass;

      const subId = await submitOnlineExam(exam, {
        studentName,
        studentClass: finalClass,
        phoneNumber,
        mcqAnswers,
        descriptiveAnswers,
        incidents
      });

      setSubmissionReceiptId(subId);
      setSubmissionTime(new Date().toLocaleTimeString());
      setStep('submitted');
      setShowSubmitConfirm(false);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } catch (e: any) {
      alert('Failed to submit exam: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Count answered questions
  const mcqQuestions = exam?.questions.filter(q => q.type === 'mcq') || [];
  const descQuestions = exam?.questions.filter(q => q.type === 'descriptive') || [];
  const answeredMcqCount = Object.values(mcqAnswers).filter(Boolean).length;
  const answeredDescCount = Object.values(descriptiveAnswers).filter(
    a => (a.images && a.images.length > 0) || (a.textAnswer && a.textAnswer.trim().length > 0)
  ).length;
  const totalAnswered = answeredMcqCount + answeredDescCount;
  const totalQuestionsCount = exam?.questions.length || 0;

  // Filter questions for display
  const displayedQuestions = exam?.questions.filter(q => {
    if (activeFilter === 'mcq') return q.type === 'mcq';
    if (activeFilter === 'descriptive') return q.type === 'descriptive';
    if (activeFilter === 'unanswered') {
      if (q.type === 'mcq') return !mcqAnswers[q.number];
      const desc = descriptiveAnswers[q.number];
      return !(desc?.images?.length || desc?.textAnswer?.trim()?.length);
    }
    return true;
  }) || [];

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------
  // RENDER: Loading / Error
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-400">Loading Exam Portal...</p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center space-y-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-bold text-white">Cannot Load Exam</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md">{error || 'Exam not found.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Screen 1 — Onboarding / Login (Dark theme matching Improvement)
  // -------------------------------------------------------------
  if (step === 'onboarding') {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center items-center p-3 sm:p-6 relative overflow-hidden">
        
        {/* Glow ambient backgrounds */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-purple-600/15 blur-[100px] pointer-events-none rounded-full" />

        {/* Header Branding */}
        <header className="w-full max-w-md mx-auto flex items-center justify-between py-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <img 
              src="/aims_plus_icon.png" 
              alt="AIMS Plus Logo" 
              className="w-10 h-10 rounded-2xl object-contain bg-slate-900 border border-slate-800 p-0.5 shadow-lg shadow-indigo-500/10 shrink-0" 
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white">AIMS Plus Online Exam</h1>
                <span className="px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 text-[9px] font-extrabold rounded-md border border-indigo-500/30">
                  PORTAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Higher Secondary Academic Portal</p>
            </div>
          </div>

          {savedProfiles.length > 0 && (
            <button
              type="button"
              onClick={() => setIsAccountSwitcherOpen(true)}
              className="flex items-center gap-1 py-1 px-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full text-xs font-bold text-slate-300 transition-all cursor-pointer shadow"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Profiles ({savedProfiles.length})</span>
            </button>
          )}
        </header>

        {/* Main Card */}
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/80 space-y-5 relative z-10 my-auto">
          
          {/* Exam Details Pill */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-black rounded border border-indigo-500/30 uppercase">
                {exam.subject || 'General'}
              </span>
              <span className="font-bold text-slate-400">{exam.className}</span>
            </div>
            <h2 className="text-base font-black text-white">{exam.title}</h2>
            
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                <Clock className="w-3 h-3 text-amber-400" />
                {exam.durationMinutes > 0 ? `${exam.durationMinutes} Minutes` : 'Untimed'}
              </span>
              <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                {exam.totalMarks} Total Marks
              </span>
              <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                <Layers className="w-3 h-3 text-purple-400" />
                {exam.questions.length} Questions
              </span>
            </div>
          </div>

          {/* Student Profile Form */}
          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Full Name *
              </label>
              <input
                type="text"
                placeholder="Enter your name..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> Class / Batch *
              </label>
              <select
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="A1">Batch A1</option>
                <option value="A2">Batch A2</option>
                <option value="B1">Batch B1</option>
                <option value="B2">Batch B2</option>
                <option value="B3">Batch B3</option>
                <option value="Other">Other (Custom Batch)</option>
              </select>

              {studentClass === 'Other' && (
                <input
                  type="text"
                  placeholder="Enter your batch / class name..."
                  value={customClass}
                  onChange={(e) => setCustomClass(e.target.value)}
                  className="w-full mt-2 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs"
                />
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-400" /> WhatsApp / Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium font-mono"
              />
            </div>
          </div>

          {/* Instructions box */}
          {exam.instructions && (
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-200/90 leading-relaxed">
              <strong>Instructions:</strong> {exam.instructions}
            </div>
          )}

          {/* Start Exam Button */}
          <button
            type="button"
            onClick={handleStartExam}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
          >
            <span>Start Online Exam</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Account Switcher Modal */}
        {isAccountSwitcherOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-4 space-y-3 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-white text-sm">Select Profile</h3>
                <button onClick={() => setIsAccountSwitcherOpen(false)} className="text-slate-400 hover:text-white p-1">✕</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {savedProfiles.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectSavedProfile(p)}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-white text-xs uppercase">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.studentClass} • {p.phoneNumber || 'No Phone'}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Screen 3 — Submission Receipt & Confetti
  // -------------------------------------------------------------
  if (step === 'submitted') {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center items-center p-3 sm:p-6 relative overflow-hidden">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">Exam Submitted Successfully!</h2>
            <p className="text-xs text-slate-400">Your answers and photos have been uploaded safely to the evaluation database.</p>
          </div>

          {/* Submission Receipt Box */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Student:</span>
              <span className="font-bold text-white uppercase">{studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Batch:</span>
              <span className="font-bold text-slate-300">{studentClass}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Exam:</span>
              <span className="font-bold text-indigo-300">{exam.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Submitted At:</span>
              <span className="font-bold text-slate-300">{submissionTime}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1.5">
              <span className="text-slate-500">Receipt ID:</span>
              <span className="font-bold text-emerald-400 text-[11px] truncate max-w-[180px]">{submissionReceiptId}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Done & Exit
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: Screen 2 — Exam Taking Workspace (Mobile First)
  // -------------------------------------------------------------
  const isTimeLow = secondsRemaining !== null && secondsRemaining <= 300; // < 5 mins

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      
      {/* Sticky Mobile-First Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <img 
              src="/aims_plus_icon.png" 
              alt="Logo" 
              className="w-8 h-8 rounded-xl object-contain bg-slate-950 border border-slate-800 p-0.5 shrink-0" 
            />
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-extrabold text-white truncate">
                {exam.title}
              </h2>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {studentName} • {studentClass}
              </div>
            </div>
          </div>

          {/* Right Controls: Timer & Submit */}
          <div className="flex items-center gap-2 shrink-0">
            {secondsRemaining !== null && (
              <div className={`px-2.5 py-1 rounded-xl font-mono font-bold text-xs flex items-center gap-1 border ${
                isTimeLow 
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' 
                  : 'bg-slate-800 text-amber-300 border-slate-700'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              className="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 cursor-pointer active:scale-95 flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Submit Exam</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4">
        
        {/* Progress Tracker Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
          <div className="space-y-1 flex-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Question Progress:</span>
              <span className="text-indigo-400 font-mono">{totalAnswered} of {totalQuestionsCount} Answered</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${totalQuestionsCount > 0 ? (totalAnswered / totalQuestionsCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-center overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap ${
                activeFilter === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({totalQuestionsCount})
            </button>
            {mcqQuestions.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter('mcq')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  activeFilter === 'mcq' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                MCQs ({mcqQuestions.length})
              </button>
            )}
            {descQuestions.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter('descriptive')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  activeFilter === 'descriptive' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Descriptive ({descQuestions.length})
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveFilter('unanswered')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors whitespace-nowrap ${
                activeFilter === 'unanswered' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unanswered ({totalQuestionsCount - totalAnswered})
            </button>
          </div>
        </div>

        {/* Questions Cards List */}
        <div className="space-y-4">
          {displayedQuestions.map((q) => {
            const isMcq = q.type === 'mcq';
            const selectedOpt = mcqAnswers[q.number];
            const descAns = descriptiveAnswers[q.number];
            const uploadedImages = descAns?.images || [];
            const hasTextAnswer = (descAns?.textAnswer?.trim()?.length || 0) > 0;
            const isAnswered = isMcq ? !!selectedOpt : (uploadedImages.length > 0 || hasTextAnswer);
            const isUploading = uploadingQuestions[q.number];
            const progress = uploadProgress[q.number] || 0;

            return (
              <div
                key={q.number}
                id={`question_${q.number}`}
                className={`p-4 sm:p-5 rounded-2xl border transition-all shadow-lg ${
                  isAnswered
                    ? 'bg-slate-900/90 border-indigo-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-7 h-7 rounded-xl bg-slate-800 text-white font-black text-xs flex items-center justify-center border border-slate-700 shadow">
                      {q.number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                      isMcq 
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' 
                        : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    }`}>
                      {isMcq ? 'Multiple Choice' : 'Descriptive Question'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 font-mono">
                      +{q.marks} M {isMcq && q.negativeMarks ? `(-${q.negativeMarks})` : ''}
                    </span>
                  </div>

                  {/* Answered indicator */}
                  {isAnswered && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <Check className="w-3 h-3" /> Answered
                    </span>
                  )}
                </div>

                {/* Question Prompt */}
                <p className="text-sm sm:text-base font-bold text-white leading-relaxed mb-4">
                  {q.prompt}
                </p>

                {/* Optional question image */}
                {q.imageUrl && (
                  <div className="mb-4">
                    <img 
                      src={q.imageUrl} 
                      alt={`Question ${q.number} diagram`} 
                      className="max-h-64 rounded-xl border border-slate-800 object-contain bg-slate-950" 
                    />
                  </div>
                )}

                {/* MCQ Mode: Interactive Option Selector (Single column on mobile, 2 cols on tablet+) */}
                {isMcq && (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(q.options && q.options.length > 0 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D']).map((optVal, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isSelected = selectedOpt === letter;
                        const displayText = (optVal && optVal.trim()) ? optVal.trim() : `Option ${letter}`;

                        return (
                          <button
                            key={letter}
                            type="button"
                            onClick={() => handleSelectOption(q.number, letter)}
                            className={`p-3.5 sm:p-4 rounded-2xl border text-left flex items-start gap-3.5 cursor-pointer transition-all active:scale-98 ${
                              isSelected
                                ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white border-indigo-400 shadow-xl shadow-indigo-600/30 ring-2 ring-indigo-500/50'
                                : 'bg-slate-950/90 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span className={`w-8 h-8 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center shrink-0 border transition-colors ${
                              isSelected ? 'bg-indigo-600 text-white border-indigo-400 shadow-md' : 'bg-slate-900 border-slate-700 text-slate-400'
                            }`}>
                              {letter}
                            </span>
                            <span className="text-xs sm:text-sm font-bold leading-relaxed break-words flex-1 text-slate-100 pt-0.5">
                              {displayText}
                            </span>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Descriptive Mode: Text Input Box & Camera/Photo Upload */}
                {!isMcq && (
                  <div className="space-y-4 pt-1">
                    
                    {/* 1. Written / Typed Answer Input Box */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-slate-300 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-purple-400" />
                          <span>Type Answer / Derivation Steps:</span>
                        </label>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {(descAns?.textAnswer?.length || 0)} chars
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        placeholder="Type your written explanation, numerical calculations, or answer here (optional if uploading handwritten photos)..."
                        value={descAns?.textAnswer || ''}
                        onChange={(e) => handleUpdateTextAnswer(q.number, e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 leading-relaxed"
                      />
                    </div>

                    {/* 2. Photo Upload Section */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-pink-400" />
                          <span>Upload Handwritten Answer Photos:</span>
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">
                          {uploadedImages.length} page(s) attached
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1. Camera Capture Button (Native Mobile Rear Camera) */}
                        <button
                          type="button"
                          onClick={() => cameraInputRefs.current[q.number]?.click()}
                          disabled={isUploading}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Take Photo with Camera</span>
                        </button>
                        <input
                          ref={(el) => { cameraInputRefs.current[q.number] = el; }}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handlePhotoUpload(q.number, e.target.files)}
                          className="hidden"
                        />

                        {/* 2. Gallery / File Upload Button */}
                        <button
                          type="button"
                          onClick={() => galleryInputRefs.current[q.number]?.click()}
                          disabled={isUploading}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <Upload className="w-4 h-4 text-purple-400" />
                          <span>Upload from Gallery</span>
                        </button>
                        <input
                          ref={(el) => { galleryInputRefs.current[q.number] = el; }}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handlePhotoUpload(q.number, e.target.files)}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Uploading Progress bar */}
                    {isUploading && (
                      <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-purple-200">
                          <span className="flex items-center gap-1.5">
                            <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                            Compressing & uploading to Backblaze B2 storage...
                          </span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-500 h-full transition-all duration-200" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Uploaded Answer Photos Grid */}
                    {uploadedImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                        {uploadedImages.map((img, idx) => (
                          <div
                            key={img.b2Key || idx}
                            className="relative group bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-md"
                          >
                            <img
                              src={img.url}
                              alt={`Answer page ${idx + 1}`}
                              className="w-full h-28 object-cover cursor-pointer group-hover:scale-105 transition-transform"
                              onClick={() => setPreviewImage(img.url)}
                            />
                            
                            <div className="p-1.5 bg-slate-900 text-[10px] font-mono text-slate-300 flex items-center justify-between">
                              <span>Page {idx + 1}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setPreviewImage(img.url)}
                                  className="text-slate-400 hover:text-white p-0.5"
                                  title="View Photo"
                                >
                                  <ZoomIn className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(q.number, idx)}
                                  className="text-rose-400 hover:text-rose-300 p-0.5"
                                  title="Remove Photo"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Bottom Sticky Review & Submit Bar for Mobile */}
      <div className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 z-30 sm:hidden">
        <button
          type="button"
          onClick={() => setShowSubmitConfirm(true)}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Review & Submit ({totalAnswered}/{totalQuestionsCount} Answered)</span>
        </button>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white">Confirm Exam Submission</h3>
              <p className="text-xs text-slate-400">Please verify your answers before final submission.</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Student:</span>
                <span className="font-bold text-white uppercase">{studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">MCQs Answered:</span>
                <span className="font-bold text-indigo-400">{answeredMcqCount} of {mcqQuestions.length}</span>
              </div>
              {descQuestions.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Descriptive Completed:</span>
                  <span className="font-bold text-purple-400">{answeredDescCount} of {descQuestions.length} questions</span>
                </div>
              )}
              {totalQuestionsCount - totalAnswered > 0 && (
                <div className="flex justify-between text-amber-400 pt-1 border-t border-slate-800 font-bold">
                  <span>⚠️ Unattempted Questions:</span>
                  <span>{totalQuestionsCount - totalAnswered}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Back to Exam
              </button>
              
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Submitting...' : 'Yes, Submit Final'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Cheat Incident Explanation Modal */}
      {showCheatModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
              <ShieldAlert className="w-5 h-5" />
              <span>Exam Focus Lost / Tab Switch Detected</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our system detected that you minimized the browser window or switched to another app. Please provide a brief reason to resume:
            </p>
            <input
              type="text"
              placeholder="e.g. Received a phone call / accidental home swipe"
              value={cheatReasonInput}
              onChange={(e) => setCheatReasonInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleCheatModalSubmit}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black shadow cursor-pointer"
            >
              Continue Exam
            </button>
          </div>
        </div>
      )}

      {/* Photo Fullscreen Lightbox Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col justify-between p-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="p-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              ✕ Close Preview
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-2">
            <img 
              src={previewImage} 
              alt="Answer Page Preview" 
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
