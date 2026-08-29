import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Plus, 
  ClipboardList, 
  ExternalLink, 
  Trophy, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Clock, 
  BookOpen, 
  Users, 
  Layers, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Sparkles,
  ChevronRight,
  Eye,
  Upload,
  Camera,
  X,
  FileUp,
  Wand2,
  HelpCircle,
  Image as ImageIcon
} from "lucide-react";
import { 
  OnlineExam, 
  ExamQuestion, 
  fetchAllOnlineExams, 
  saveOnlineExam, 
  deleteOnlineExam 
} from "../../../services/onlineExamService";
import { 
  generateExamWithAI, 
  AIExamFileAttachment 
} from "../../../services/gemini/aiExamGeneratorService";
import { processImage } from "../../../utils/imageProcessing";

interface OnlineExamsAdminProps {
  onBack?: () => void;
  onNavigateToEvaluation?: (examId: string) => void;
}

export default function OnlineExamsAdmin({ onBack, onNavigateToEvaluation }: OnlineExamsAdminProps) {
  const [exams, setExams] = useState<OnlineExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedExamId, setCopiedExamId] = useState<string | null>(null);

  // Modal / Form state for creating/editing an exam
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Physics");
  const [className, setClassName] = useState("All Batches");
  const [instructions, setInstructions] = useState("Answer all questions. For descriptive questions, write clearly on plain paper and upload photos of your answers.");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Quick generator helper state
  const [quickMcqCount, setQuickMcqCount] = useState(10);
  const [quickDescCount, setQuickDescCount] = useState(2);

  // AI Exam Generator Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSubject, setAiSubject] = useState("Physics");
  const [aiClass, setAiClass] = useState("Plus One Science");
  const [aiDuration, setAiDuration] = useState(45);
  const [aiNumMcq, setAiNumMcq] = useState(10);
  const [aiNumDesc, setAiNumDesc] = useState(2);
  const [aiAttachments, setAiAttachments] = useState<AIExamFileAttachment[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    setLoading(true);
    try {
      const data = await fetchAllOnlineExams();
      setExams(data);
    } catch (e) {
      console.error("Failed to load exams:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyStudentLink = (examId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const link = `${window.location.origin}/form/exam/#${examId}`;
    navigator.clipboard.writeText(link);
    setCopiedExamId(examId);
    setTimeout(() => setCopiedExamId(null), 2500);
  };

  const handleOpenCreateModal = (examToEdit?: OnlineExam) => {
    if (examToEdit) {
      setEditingExamId(examToEdit.id);
      setTitle(examToEdit.title);
      setSubject(examToEdit.subject || "General");
      setClassName(examToEdit.className || "All Batches");
      setInstructions(examToEdit.instructions || "");
      setDurationMinutes(examToEdit.durationMinutes || 0);
      setQuestions(examToEdit.questions || []);
    } else {
      setEditingExamId(null);
      setTitle("");
      setSubject("Physics");
      setClassName("All Batches");
      setInstructions("Answer all questions. For descriptive questions, upload clear photos of your written answers.");
      setDurationMinutes(45);
      
      // Default sample questions: 2 MCQs + 1 Descriptive
      const initialQuestions: ExamQuestion[] = [
        {
          id: "q1",
          number: 1,
          type: "mcq",
          prompt: "Which of the following is a scalar quantity?",
          marks: 4,
          negativeMarks: 1,
          numOptions: 4,
          options: ["Velocity", "Work", "Force", "Acceleration"],
          correctOption: "B"
        },
        {
          id: "q2",
          number: 2,
          type: "mcq",
          prompt: "The SI unit of electric charge is:",
          marks: 4,
          negativeMarks: 1,
          numOptions: 4,
          options: ["Ampere", "Coulomb", "Volt", "Ohm"],
          correctOption: "B"
        },
        {
          id: "q3",
          number: 3,
          type: "descriptive",
          prompt: "State and prove the Work-Energy Theorem for a constant force with appropriate equations.",
          marks: 5,
          maxImages: 5,
          guidelines: "Show initial and final kinetic energy and write step-by-step derivation."
        }
      ];
      setQuestions(initialQuestions);
    }
    setIsCreateModalOpen(true);
  };

  const handleAddQuestion = (type: "mcq" | "descriptive") => {
    const nextNum = questions.length + 1;
    const newQ: ExamQuestion = type === "mcq" ? {
      id: `q_${Date.now()}_${nextNum}`,
      number: nextNum,
      type: "mcq",
      prompt: `Question ${nextNum}`,
      marks: 4,
      negativeMarks: 1,
      numOptions: 4,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctOption: "A"
    } : {
      id: `q_${Date.now()}_${nextNum}`,
      number: nextNum,
      type: "descriptive",
      prompt: `Descriptive Question ${nextNum}: Explain in detail.`,
      marks: 5,
      maxImages: 5,
      guidelines: "Upload handwritten photo"
    };

    setQuestions(prev => [...prev, newQ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Renumber questions sequentially
      return updated.map((q, idx) => ({ ...q, number: idx + 1 }));
    });
  };

  const handleUpdateQuestion = (index: number, fields: Partial<ExamQuestion>) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...fields };
      return updated;
    });
  };

  // MCQ Option Text Handlers
  const handleUpdateOptionText = (qIndex: number, optIndex: number, text: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      const q = updated[qIndex];
      const opts = [...(q.options || ["Option A", "Option B", "Option C", "Option D"])];
      opts[optIndex] = text;
      updated[qIndex] = { ...q, options: opts, numOptions: opts.length };
      return updated;
    });
  };

  const handleAddOptionToQuestion = (qIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      const q = updated[qIndex];
      const opts = [...(q.options || [])];
      const nextLetter = String.fromCharCode(65 + opts.length);
      opts.push(`Option ${nextLetter}`);
      updated[qIndex] = { ...q, options: opts, numOptions: opts.length };
      return updated;
    });
  };

  const handleRemoveOptionFromQuestion = (qIndex: number, optIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      const q = updated[qIndex];
      const opts = (q.options || []).filter((_, idx) => idx !== optIndex);
      if (opts.length === 0) return prev;
      
      const letterToRemove = String.fromCharCode(65 + optIndex);
      let newCorrect = q.correctOption;
      if (newCorrect === letterToRemove || !newCorrect) {
        newCorrect = "A";
      }
      updated[qIndex] = { ...q, options: opts, numOptions: opts.length, correctOption: newCorrect };
      return updated;
    });
  };

  const handleQuickPopulate = () => {
    const totalQ: ExamQuestion[] = [];
    let curNum = 1;
    for (let i = 0; i < quickMcqCount; i++) {
      totalQ.push({
        id: `q_mcq_${curNum}`,
        number: curNum,
        type: "mcq",
        prompt: `MCQ Question ${curNum}`,
        marks: 4,
        negativeMarks: 1,
        numOptions: 4,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctOption: "A"
      });
      curNum++;
    }
    for (let i = 0; i < quickDescCount; i++) {
      totalQ.push({
        id: `q_desc_${curNum}`,
        number: curNum,
        type: "descriptive",
        prompt: `Descriptive Question ${curNum}`,
        marks: 5,
        maxImages: 5,
        guidelines: "Upload handwritten photo"
      });
      curNum++;
    }
    setQuestions(totalQ);
  };

  // -------------------------------------------------------------
  // AI File Upload Handlers
  // -------------------------------------------------------------
  const handleAiFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setAiError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        let base64 = '';
        let fileType = file.type || 'application/octet-stream';

        if (file.type && file.type.startsWith('image/')) {
          // Auto-compress large camera snaps / images for AI
          const processed = await processImage(file, 1200, 0, 0.7);
          base64 = processed.base64;
          fileType = processed.mimeType;
        } else {
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const result = reader.result as string;
              const b64 = result.split(',')[1];
              resolve(b64);
            };
            reader.onerror = reject;
          });
          reader.readAsDataURL(file);
          base64 = await base64Promise;
        }

        setAiAttachments(prev => [
          ...prev,
          {
            name: file.name,
            type: fileType,
            base64
          }
        ]);
      } catch (err: any) {
        console.error("Error reading file for AI:", err);
        setAiError(`Failed to read file ${file.name}: ${err.message}`);
      }
    }
  };

  const handleRemoveAiAttachment = (index: number) => {
    setAiAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // -------------------------------------------------------------
  // Run AI Exam Generator
  // -------------------------------------------------------------
  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim() && aiAttachments.length === 0) {
      setAiError("Please enter prompt instructions or attach at least one question paper document / image.");
      return;
    }

    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const generated = await generateExamWithAI({
        instructions: aiPrompt,
        attachments: aiAttachments,
        subject: aiSubject,
        className: aiClass,
        targetDurationMinutes: aiDuration,
        numMcq: aiNumMcq,
        numDescriptive: aiNumDesc
      });

      // Populate created exam modal with generated data
      setEditingExamId(null);
      setTitle(generated.title);
      setSubject(generated.subject || aiSubject);
      setClassName(generated.className || aiClass);
      setInstructions(generated.instructions || "Answer all questions carefully.");
      setDurationMinutes(generated.durationMinutes || aiDuration);
      setQuestions(generated.questions || []);

      // Close AI modal and open the Exam Editor for review!
      setIsAiModalOpen(false);
      setIsCreateModalOpen(true);
    } catch (err: any) {
      console.error("AI Exam Generation Error:", err);
      setAiError(err.message || "Failed to generate exam with AI.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveExam = async () => {
    if (!title.trim()) {
      alert("Please enter an Exam Title.");
      return;
    }
    if (questions.length === 0) {
      alert("Please add at least one question to the exam.");
      return;
    }

    setIsSaving(true);
    try {
      const examId = await saveOnlineExam({
        id: editingExamId || undefined,
        title,
        subject,
        className,
        instructions,
        durationMinutes,
        questions,
        isPublished: true
      });

      setIsCreateModalOpen(false);
      await loadExams();
      alert(editingExamId ? "Exam updated successfully!" : "Exam created successfully!");
    } catch (e: any) {
      alert("Failed to save exam: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExam = async (examId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete exam "${title}"?`)) {
      return;
    }
    try {
      await deleteOnlineExam(examId);
      setExams(prev => prev.filter(x => x.id !== examId));
    } catch (e: any) {
      alert("Failed to delete exam: " + e.message);
    }
  };

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) || 
    (e.subject && e.subject.toLowerCase().includes(search.toLowerCase())) ||
    e.className.toLowerCase().includes(search.toLowerCase())
  );

  const calculateTotalMarks = (qList: ExamQuestion[]) => {
    return qList.reduce((acc, q) => acc + (Number(q.marks) || 0), 0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 pb-20">
      <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Online Exams Manager
              </h1>
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-black rounded-full uppercase tracking-wider border border-indigo-500/30">
                Descriptive + MCQ
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Create and evaluate online tests with direct B2 camera photo uploads and AI generator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* AI Generator Button */}
          <button
            onClick={() => {
              setAiError(null);
              setIsAiModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-purple-600/30 transition-all cursor-pointer hover:scale-102"
          >
            <Sparkles className="w-4 h-4" />
            <span>✨ AI Exam Generator</span>
          </button>

          {/* Manual Create Button */}
          <button
            onClick={() => handleOpenCreateModal()}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Exam</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search exams by title, subject, or batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="text-xs font-mono text-slate-400">
          Total: <span className="font-bold text-white">{exams.length}</span> Exams
        </div>
      </div>

      {/* Exams Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold">Loading exams from Firestore...</p>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="p-12 text-center text-slate-500 space-y-4 bg-slate-900/40 rounded-2xl border border-slate-800">
          <ClipboardList className="w-12 h-12 mx-auto text-slate-600" />
          <div>
            <h3 className="text-base font-bold text-slate-300">No Online Exams Created Yet</h3>
            <p className="text-xs text-slate-500 mt-1">Click "✨ AI Exam Generator" or "Create Exam" to start conducting online tests.</p>
          </div>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Try AI Exam Generator
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredExams.map((exam) => {
            const mcqCount = exam.questions.filter(q => q.type === "mcq").length;
            const descCount = exam.questions.filter(q => q.type === "descriptive").length;
            const totalMarks = calculateTotalMarks(exam.questions);

            return (
              <div
                key={exam.id}
                onClick={() => {
                  if (onNavigateToEvaluation) onNavigateToEvaluation(exam.id);
                }}
                className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
              >
                {/* Card Top */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {exam.subject || "General"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {exam.durationMinutes > 0 ? `${exam.durationMinutes} Mins` : "Untimed"}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {exam.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{exam.className}</span>
                  </div>
                </div>

                {/* Question Type Breakdown */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">MCQs</div>
                    <div className="font-extrabold text-blue-400">{mcqCount}</div>
                  </div>
                  <div className="border-x border-slate-800">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Descriptive</div>
                    <div className="font-extrabold text-purple-400">{descCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Marks</div>
                    <div className="font-extrabold text-emerald-400">{totalMarks} M</div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={(e) => handleCopyStudentLink(exam.id, e)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                      copiedExamId === exam.id
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    {copiedExamId === exam.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCreateModal(exam);
                      }}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 rounded-lg transition-colors cursor-pointer"
                      title="Edit Exam Questions"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteExam(exam.id, exam.title, e)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="p-1 text-slate-600 group-hover:text-indigo-400 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: AI EXAM GENERATOR MODAL (Multimodal GenAI)       */}
      {/* ========================================================= */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-purple-900/30 animate-in fade-in zoom-in duration-150 my-auto">
            
            {/* AI Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl text-white shadow-lg shadow-purple-600/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    AI Exam Generator
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-md uppercase">
                      Gemini Multimodal
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Upload documents/images or type a prompt to instantly draft exam questions
                  </p>
                </div>
              </div>
              <button 
                onClick={() => !isGeneratingAi && setIsAiModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer disabled:opacity-50"
                disabled={isGeneratingAi}
              >
                ✕
              </button>
            </div>

            {/* AI Body */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              
              {/* Error Box */}
              {aiError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Step 1: Prompt & Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  1. Instructions / Syllabus / Topic Description
                </label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Create a 25-mark Physics test from Class 11 Units & Measurements. Include 10 MCQs and 2 Descriptive derivation questions."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-xs sm:text-sm"
                />
              </div>

              {/* Step 2: Attachments (Question Paper Images or PDF Docs) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  2. Attach Question Paper Materials (Images / PDF / Text)
                </label>
                
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*,application/pdf,text/plain"
                    onChange={(e) => handleAiFileUpload(e.target.files)}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleAiFileUpload(e.target.files)}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    <FileUp className="w-3.5 h-3.5 text-purple-400" />
                    <span>Upload Documents / Images</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-pink-400" />
                    <span>Snap Photo (Camera)</span>
                  </button>
                </div>

                {/* Attachment Chips */}
                {aiAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                    {aiAttachments.map((att, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/50 border border-purple-500/30 rounded-lg text-purple-200 text-xs font-mono"
                      >
                        <span className="truncate max-w-[150px]">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAiAttachment(idx)}
                          className="text-purple-400 hover:text-rose-400"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3: Preset Configuration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Subject</label>
                  <select
                    value={aiSubject}
                    onChange={(e) => setAiSubject(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="English">English</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Target Batch</label>
                  <select
                    value={aiClass}
                    onChange={(e) => setAiClass(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="All Batches">All Batches</option>
                    <option value="A1">Batch A1</option>
                    <option value="A2">Batch A2</option>
                    <option value="B1">Batch B1</option>
                    <option value="B2">Batch B2</option>
                    <option value="B3">Batch B3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">MCQ Count</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={aiNumMcq}
                    onChange={(e) => setAiNumMcq(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs text-center focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Descriptive Count</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={aiNumDesc}
                    onChange={(e) => setAiNumDesc(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs text-center focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

            </div>

            {/* AI Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                disabled={isGeneratingAi}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGenerateWithAI}
                disabled={isGeneratingAi}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50 transition-all hover:scale-102"
              >
                {isGeneratingAi ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Generate & Open in Editor</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EXAM CREATOR / EDITOR MODAL (Detailed & Manual)  */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {editingExamId ? "Edit Online Exam" : "Create New Online Exam"}
                </h2>
                <p className="text-xs text-slate-400">
                  Configure questions, options text, marks, and descriptive guidelines
                </p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Exam Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Plus One Physics Improvement Test"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="English">English</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Arabic">Arabic</option>
                    <option value="Commerce">Commerce / Accountancy</option>
                    <option value="General">General Exam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Target Batch</label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All Batches">All Batches</option>
                    <option value="A1">Batch A1</option>
                    <option value="A2">Batch A2</option>
                    <option value="B1">Batch B1</option>
                    <option value="B2">Batch B2</option>
                    <option value="B3">Batch B3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Duration (Minutes, 0 = Untimed)</label>
                  <input
                    type="number"
                    min="0"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Instructions for Students</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Quick Generator Box */}
              <div className="p-3 sm:p-4 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="text-xs font-bold text-indigo-200">
                    Quick Generator:
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400">MCQs:</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={quickMcqCount}
                    onChange={(e) => setQuickMcqCount(parseInt(e.target.value, 10) || 0)}
                    className="w-14 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs text-center"
                  />
                  <span className="text-xs text-slate-400">Descriptive:</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={quickDescCount}
                    onChange={(e) => setQuickDescCount(parseInt(e.target.value, 10) || 0)}
                    className="w-14 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs text-center"
                  />
                  <button
                    type="button"
                    onClick={handleQuickPopulate}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow"
                  >
                    Generate Slots
                  </button>
                </div>
              </div>

              {/* Questions List Header */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-sm">
                    Questions ({questions.length})
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-black rounded-md border border-emerald-500/30">
                    Total: {calculateTotalMarks(questions)} Marks
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddQuestion("mcq")}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> + MCQ
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddQuestion("descriptive")}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Descriptive
                  </button>
                </div>
              </div>

              {/* Questions Builder */}
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3.5 relative group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-black text-xs flex items-center justify-center">
                          {q.number}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                          q.type === "mcq"
                            ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                            : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                        }`}>
                          {q.type === "mcq" ? "MCQ (Single Choice)" : "Descriptive (Photo Upload)"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-400">Marks:</span>
                          <input
                            type="number"
                            min="1"
                            value={q.marks}
                            onChange={(e) => handleUpdateQuestion(idx, { marks: parseInt(e.target.value, 10) || 1 })}
                            className="w-12 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-white text-xs font-bold"
                          />
                        </div>
                        {q.type === "mcq" && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-slate-400">Neg:</span>
                            <input
                              type="number"
                              min="0"
                              value={q.negativeMarks ?? 1}
                              onChange={(e) => handleUpdateQuestion(idx, { negativeMarks: parseInt(e.target.value, 10) || 0 })}
                              className="w-12 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-rose-300 text-xs font-bold"
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        Question Prompt:
                      </label>
                      <textarea
                        rows={2}
                        placeholder={`Question ${q.number} text or problem statement...`}
                        value={q.prompt}
                        onChange={(e) => handleUpdateQuestion(idx, { prompt: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* MCQ Options with Custom Text Inputs */}
                    {q.type === "mcq" && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-300">
                            Option Values & Correct Answer Key:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddOptionToQuestion(idx)}
                            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Add Option
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(q.options || ["Option A", "Option B", "Option C", "Option D"]).map((optVal, optIdx) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            const isCorrect = q.correctOption === letter;

                            return (
                              <div 
                                key={letter}
                                className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                                  isCorrect 
                                    ? "bg-emerald-950/30 border-emerald-500/40 ring-1 ring-emerald-500/30" 
                                    : "bg-slate-900/60 border-slate-800/80"
                                }`}
                              >
                                {/* Correct Key Radio Selector */}
                                <label 
                                  className={`flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs cursor-pointer transition-colors border shrink-0 ${
                                    isCorrect 
                                      ? "bg-emerald-500 text-slate-950 border-emerald-400" 
                                      : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500"
                                  }`}
                                  title={`Click to mark Option ${letter} as correct answer`}
                                >
                                  <input
                                    type="radio"
                                    name={`correct_key_${q.number}_${idx}`}
                                    checked={isCorrect}
                                    onChange={() => handleUpdateQuestion(idx, { correctOption: letter })}
                                    className="hidden"
                                  />
                                  <span>{letter}</span>
                                </label>

                                {/* Option Text Input */}
                                <input
                                  type="text"
                                  placeholder={`Option ${letter} text (e.g. 9.8 m/s²)`}
                                  value={optVal}
                                  onChange={(e) => handleUpdateOptionText(idx, optIdx, e.target.value)}
                                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                                />

                                {/* Correct Badge Indicator */}
                                {isCorrect && (
                                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-md border border-emerald-500/30 shrink-0">
                                    ✓ Correct
                                  </span>
                                )}

                                {/* Remove Option (if > 2 options) */}
                                {(q.options?.length || 4) > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOptionFromQuestion(idx, optIdx)}
                                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                                    title="Remove this option"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Descriptive Guidelines */}
                    {q.type === "descriptive" && (
                      <div className="space-y-2 pt-1 text-xs">
                        <div className="flex items-center gap-3 text-slate-400">
                          <span className="font-bold text-slate-300">Max Photo Uploads:</span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={q.maxImages || 5}
                            onChange={(e) => handleUpdateQuestion(idx, { maxImages: parseInt(e.target.value, 10) || 5 })}
                            className="w-14 px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-white text-xs font-bold"
                          />
                          <span className="text-slate-500">Pages per student</span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">
                            Teacher Guidelines / Expected Answer Hints:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. State law (1M), write derivation (3M), diagram (1M)"
                            value={q.guidelines || ""}
                            onChange={(e) => handleUpdateQuestion(idx, { guidelines: e.target.value })}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                type="button"
                onClick={handleSaveExam}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? "Saving..." : editingExamId ? "Update Exam" : "Publish Online Exam"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
