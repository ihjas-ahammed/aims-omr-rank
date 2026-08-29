import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Copy, 
  Check, 
  Trophy, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ExternalLink, 
  FileSpreadsheet, 
  Archive, 
  Share2, 
  Eye, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  Save, 
  Sparkles,
  MessageCircle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { 
  OnlineExam, 
  OnlineExamSubmission, 
  fetchOnlineExamById, 
  subscribeToExamSubmissions, 
  gradeStudentDescriptive, 
  exportExamResultsToExcel 
} from '../../../services/onlineExamService';
import { downloadExamImagesAsZip, StudentImageEntry } from '../../../services/b2StorageService';
import { evaluateSubmissionWithAI } from '../../../services/gemini/aiExamEvaluationService';

interface OnlineExamEvaluationAdminProps {
  examId: string;
  onBack?: () => void;
}

export default function OnlineExamEvaluationAdmin({ examId, onBack }: OnlineExamEvaluationAdminProps) {
  const [exam, setExam] = useState<OnlineExam | null>(null);
  const [submissions, setSubmissions] = useState<OnlineExamSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Active student evaluation modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [currentGradeMap, setCurrentGradeMap] = useState<Record<number, { marks: number; feedback: string }>>({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [isSavingGrade, setIsSavingGrade] = useState(false);

  // AI Evaluation states
  const [evaluatingStudentId, setEvaluatingStudentId] = useState<string | null>(null);
  const [isBatchAiEvaluating, setIsBatchAiEvaluating] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; currentStudent: string } | null>(null);

  // High-Res Image Lightbox Modal
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; rotation: number } | null>(null);

  // Bulk ZIP download progress
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<{ completed: number; total: number } | null>(null);

  useEffect(() => {
    loadExamData();
    const unsubscribe = subscribeToExamSubmissions(examId, (subs) => {
      setSubmissions(subs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [examId]);

  const loadExamData = async () => {
    try {
      const e = await fetchOnlineExamById(examId);
      setExam(e);
    } catch (err) {
      console.error('Failed to load exam:', err);
    }
  };

  const selectedStudent = submissions.find(s => s.id === selectedStudentId);

  // Synchronize grade map when student is selected
  useEffect(() => {
    if (selectedStudent && exam) {
      const map: Record<number, { marks: number; feedback: string }> = {};
      exam.questions.filter(q => q.type === 'descriptive').forEach(q => {
        const existing = selectedStudent.descriptiveAnswers?.[q.number];
        map[q.number] = {
          marks: existing?.awardedMarks ?? 0,
          feedback: existing?.feedback || ''
        };
      });
      setCurrentGradeMap(map);
      setOverallFeedback((selectedStudent as any).teacherOverallFeedback || selectedStudent.gradedBy || '');
    }
  }, [selectedStudentId, selectedStudent, exam]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/form/exam/#${examId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSaveStudentGrades = async () => {
    if (!exam || !selectedStudentId) return;
    setIsSavingGrade(true);
    try {
      await gradeStudentDescriptive(exam, selectedStudentId, currentGradeMap, overallFeedback);
      alert('Evaluation saved successfully!');
      setSelectedStudentId(null);
    } catch (e: any) {
      alert('Failed to save grade: ' + e.message);
    } finally {
      setIsSavingGrade(false);
    }
  };


  // -------------------------------------------------------------
  // AI Evaluation Handlers
  // -------------------------------------------------------------
  const handleAiEvaluateSingle = async (sub: OnlineExamSubmission) => {
    if (!exam) return;
    setEvaluatingStudentId(sub.id);
    try {
      const res = await evaluateSubmissionWithAI(exam, sub);
      if (selectedStudentId === sub.id) {
        setCurrentGradeMap(res.grades);
        setOverallFeedback(res.overallFeedback);
      }
    } catch (err: any) {
      alert(`AI Evaluation error for ${sub.studentName}: ${err.message}`);
    } finally {
      setEvaluatingStudentId(null);
    }
  };

  const handleAiEvaluateAllSubmissions = async () => {
    if (!exam || submissions.length === 0) return;
    const descQuestions = exam.questions.filter(q => q.type === 'descriptive');
    if (descQuestions.length === 0) {
      alert('This exam does not have descriptive questions to grade.');
      return;
    }

    const toGrade = submissions.filter(s => !s.isFullyGraded || Object.keys(s.descriptiveAnswers || {}).length > 0);
    if (toGrade.length === 0) {
      alert('All submissions are already evaluated.');
      return;
    }

    if (!window.confirm(`Start AI evaluation for ${toGrade.length} student submission(s)? This will read their handwritten photos and typed answers using Gemini.`)) {
      return;
    }

    setIsBatchAiEvaluating(true);
    let successCount = 0;

    for (let i = 0; i < toGrade.length; i++) {
      const sub = toGrade[i];
      setBatchProgress({
        current: i + 1,
        total: toGrade.length,
        currentStudent: sub.studentName
      });

      try {
        await evaluateSubmissionWithAI(exam, sub);
        successCount++;
      } catch (err: any) {
        console.error(`AI evaluation failed for ${sub.studentName}:`, err);
      }
    }

    setIsBatchAiEvaluating(false);
    setBatchProgress(null);
    alert(`AI Evaluation complete! Successfully graded ${successCount} of ${toGrade.length} submissions.`);
  };

  const handleDownloadExcel = () => {
    if (!exam) return;
    exportExamResultsToExcel(exam, submissions);
  };

  const handleDownloadAllImagesZip = async () => {
    if (!exam) return;
    setIsZipping(true);
    setZipProgress({ completed: 0, total: 1 });

    try {
      const entries: StudentImageEntry[] = [];
      submissions.forEach(sub => {
        if (!sub.descriptiveAnswers) return;
        Object.entries(sub.descriptiveAnswers).forEach(([qNum, ans]) => {
          (ans.images || []).forEach((img, idx) => {
            entries.push({
              studentName: sub.studentName,
              studentClass: sub.studentClass,
              phoneNumber: sub.phoneNumber,
              questionNumber: parseInt(qNum, 10),
              imageIndex: idx + 1,
              b2Key: img.b2Key || '',
              url: img.url,
              imageUrl: img.url
            });

          });
        });
      });

      if (entries.length === 0) {
        alert('No student uploaded photos found in this exam.');
        return;
      }

      await downloadExamImagesAsZip(exam.title, entries, (completed, total) => {
        setZipProgress({ completed, total });
      });
    } catch (e: any) {
      alert('Failed to download ZIP: ' + e.message);
    } finally {
      setIsZipping(false);
      setZipProgress(null);
    }
  };

  const handleShareWhatsApp = () => {
    if (!exam) return;
    const total = submissions.length;
    const graded = submissions.filter(s => s.isFullyGraded).length;
    const avg = total > 0 ? (submissions.reduce((sum, s) => sum + (s.totalScore || 0), 0) / total).toFixed(1) : 0;

    let text = `📊 *${exam.title} — Online Exam Report*\n`;
    text += `📚 Subject: ${exam.subject || 'General'} | Class: ${exam.className}\n`;
    text += `👥 Total Submissions: *${total}* (Evaluated: ${graded}/${total})\n`;
    text += `🎯 Class Average Score: *${avg} / ${exam.totalMarks} Marks*\n\n`;
    text += `🏆 *Top Scorers:*\n`;

    const sorted = [...submissions].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0)).slice(0, 5);
    sorted.forEach((s, idx) => {
      text += `${idx + 1}. *${s.studentName}* (${s.studentClass}) — ${s.totalScore}/${exam.totalMarks} M\n`;
    });

    text += `\n🔗 *Full Evaluation & Student Portal:* ${window.location.origin}/admin/exam/#${exam.id}\n`;
    text += `✨ Generated by AIMS Plus Academic Portal`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter(s => {
    const matchesSearch = 
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentClass.toLowerCase().includes(search.toLowerCase()) ||
      (s.phoneNumber && s.phoneNumber.includes(search));

    if (!matchesSearch) return false;
    if (statusFilter === 'pending') return !s.isFullyGraded;
    if (statusFilter === 'graded') return s.isFullyGraded;
    return true;
  });

  // Calculate Key Performance Stats
  const totalSubmissions = submissions.length;
  const gradedCount = submissions.filter(s => s.isFullyGraded).length;
  const pendingCount = totalSubmissions - gradedCount;
  const highestScore = totalSubmissions > 0 ? Math.max(...submissions.map(s => s.totalScore || 0)) : 0;
  const avgScore = totalSubmissions > 0 ? (submissions.reduce((sum, s) => sum + (s.totalScore || 0), 0) / totalSubmissions).toFixed(1) : '0';

  if (loading && !exam) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-400">Loading Exam Submissions & Answers...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-bold">Exam Not Found</h2>
        <p className="text-sm text-slate-400">The requested exam ID does not exist or has been removed.</p>
        {onBack && (
          <button onClick={onBack} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold">
            Go Back
          </button>
        )}
      </div>
    );
  }

  const hasDescriptive = exam.questions.some(q => q.type === 'descriptive');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Navigation & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-black rounded-md border border-indigo-500/30 uppercase">
                {exam.subject || 'General'}
              </span>
              <span className="text-xs font-bold text-slate-400">{exam.className}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {exam.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Evaluate All Button */}
          {hasDescriptive && (
            <button
              onClick={handleAiEvaluateAllSubmissions}
              disabled={isBatchAiEvaluating || submissions.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-black shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBatchAiEvaluating ? `AI Grading (${batchProgress?.current}/${batchProgress?.total})...` : '✨ AI Evaluate All'}</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
              copiedLink 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{copiedLink ? 'Copied Student Link!' : 'Copy Form URL'}</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            disabled={submissions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleDownloadAllImagesZip}
            disabled={isZipping || submissions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
          >
            <Archive className="w-3.5 h-3.5 text-purple-400" />
            <span>{isZipping ? `Zipping (${zipProgress?.completed}/${zipProgress?.total})...` : 'Download Images (ZIP)'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            disabled={submissions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
          >
            <Share2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Batch AI Progress Banner */}
      {isBatchAiEvaluating && batchProgress && (
        <div className="p-4 bg-purple-950/60 border border-purple-500/40 rounded-2xl flex items-center justify-between gap-4 shadow-lg shadow-purple-900/20 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin shrink-0" />
            <div>
              <div className="text-sm font-extrabold text-purple-200 flex items-center gap-2">
                <span>Evaluating with Gemini Multimodal AI...</span>
                <span className="font-mono text-xs text-purple-300">
                  ({batchProgress.current} / {batchProgress.total})
                </span>
              </div>
              <p className="text-xs text-purple-300/80">
                Currently grading: <strong className="text-white">{batchProgress.currentStudent}</strong>
              </p>
            </div>
          </div>
          <div className="w-32 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
              style={{ width: `${Math.round((batchProgress.current / batchProgress.total) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Key Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Submissions</div>
          <div className="text-2xl font-black text-white">{totalSubmissions}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            {gradedCount} Evaluated • {pendingCount} Pending
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Highest Score</div>
          <div className="text-2xl font-black text-emerald-400">
            {highestScore} <span className="text-xs text-slate-500">/ {exam.totalMarks}</span>
          </div>
          <div className="text-[11px] text-emerald-500/80 font-mono">Top performance</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Score</div>
          <div className="text-2xl font-black text-blue-400">
            {avgScore} <span className="text-xs text-slate-500">/ {exam.totalMarks}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">Class average</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Exam Questions</div>
          <div className="text-2xl font-black text-purple-400">
            {exam.questions.length} <span className="text-xs text-slate-500">Q</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {exam.questions.filter(q => q.type === 'mcq').length} MCQ • {exam.questions.filter(q => q.type === 'descriptive').length} Desc
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalSubmissions})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'pending' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('graded')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'graded' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Evaluated ({gradedCount})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-2">
          <Users className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-bold text-slate-400">No submissions matching criteria</p>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Batch / Reg</th>
                  <th className="py-3 px-4 text-center">MCQ Score</th>
                  <th className="py-3 px-4 text-center">Descriptive Score</th>
                  <th className="py-3 px-4 text-center">Total Score</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {filteredSubmissions.map((sub) => {
                  const descUploadedCount = Object.values(sub.descriptiveAnswers || {}).reduce(
                    (acc, a) => acc + (a.images?.length || 0), 0
                  );
                  const isEvaluatingThis = evaluatingStudentId === sub.id;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-white text-sm uppercase">
                          {sub.studentName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Submitted: {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-200">{sub.studentClass}</div>
                        <div className="text-[11px] text-slate-500">{sub.phoneNumber || sub.admissionNo || '—'}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-200">
                        {sub.mcqScore} M
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        {hasDescriptive ? (
                          <div>
                            <span className="font-bold text-purple-300">{sub.descriptiveScore} M</span>
                            <div className="text-[10px] text-slate-500 font-mono">({descUploadedCount} photos)</div>
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 font-black text-sm rounded-lg border border-indigo-500/30">
                          {sub.totalScore} / {exam.totalMarks}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {sub.isFullyGraded ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Evaluated
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded-full border border-amber-500/30">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* AI Grade Button */}
                          {hasDescriptive && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAiEvaluateSingle(sub);
                              }}
                              disabled={isEvaluatingThis || isBatchAiEvaluating}
                              className="px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl font-bold text-xs shadow cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-50"
                              title="Evaluate handwritten & typed answers with Gemini AI"
                            >
                              {isEvaluatingThis ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                                  <span>Grading...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                  <span>AI Grade</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedStudentId(sub.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow cursor-pointer transition-colors"
                          >
                            {hasDescriptive && !sub.isFullyGraded ? 'Grade & Mark' : 'Inspect Details'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Evaluation & Answer Inspection Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black text-sm flex items-center justify-center shadow shrink-0">
                  {selectedStudent.studentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black text-white uppercase font-mono">
                      {selectedStudent.studentName}
                    </h2>
                    <span className="px-2 py-0.2 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded border border-indigo-500/30">
                      {selectedStudent.studentClass}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Total Score: <strong>{selectedStudent.totalScore} / {exam.totalMarks} Marks</strong> | Submitted: {new Date(selectedStudent.submittedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* AI Evaluate In Modal */}
                {hasDescriptive && (
                  <button
                    onClick={() => handleAiEvaluateSingle(selectedStudent)}
                    disabled={evaluatingStudentId === selectedStudent.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl text-xs font-black shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    {evaluatingStudentId === selectedStudent.id ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>AI Grading...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto-Grade with AI</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setSelectedStudentId(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              
              {/* Anti-cheat alerts banner if any */}
              {selectedStudent.incidents && selectedStudent.incidents.length > 0 && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-300 text-xs space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    {selectedStudent.incidents.length} Tab-Switch / Focus-Lost Alert(s) Detected:
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-amber-200/90 pl-1 space-y-0.5">
                    {selectedStudent.incidents.map((inc, i) => (
                      <li key={i}>
                        {new Date(inc.time).toLocaleTimeString()}: {inc.reason || 'App minimized / switched tab'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Section 1: MCQ Responses Breakdown */}
              {exam.questions.filter(q => q.type === 'mcq').length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      <span>🔘 Multiple Choice Questions</span>
                      <span className="text-xs font-bold text-slate-400">
                        (Score: {selectedStudent.mcqScore} M)
                      </span>
                    </h3>
                    <div className="text-[11px] text-slate-400">
                      Right: <strong className="text-emerald-400">{selectedStudent.totalRightMcq}</strong> | Wrong: <strong className="text-rose-400">{selectedStudent.totalWrongMcq}</strong> | Unattempted: <strong>{selectedStudent.totalUnattemptedMcq}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {exam.questions.filter(q => q.type === 'mcq').map(q => {
                      const ans = selectedStudent.mcqAnswers?.[q.number];
                      const correct = q.correctOption?.toUpperCase();
                      const isCorrect = ans && ans.toUpperCase() === correct;
                      const isWrong = ans && ans.toUpperCase() !== correct;

                      const optIdx = ans ? ans.charCodeAt(0) - 65 : -1;
                      const optText = (optIdx >= 0 && q.options && q.options[optIdx]) ? q.options[optIdx] : null;
                      const correctIdx = correct ? correct.charCodeAt(0) - 65 : -1;
                      const correctText = (correctIdx >= 0 && q.options && q.options[correctIdx]) ? q.options[correctIdx] : null;

                      return (
                        <div
                          key={q.number}
                          className={`p-2.5 rounded-xl border flex flex-col justify-between ${
                            isCorrect 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                              : isWrong 
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold">Q{q.number}</span>
                            <span className="font-mono text-[10px]">
                              {isCorrect ? `+${q.marks}` : isWrong ? `-${q.negativeMarks || 1}` : '0'}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="font-black text-sm font-mono">{ans || '—'}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Key: {correct}</span>
                          </div>
                          {optText && optText !== `Option ${ans}` && (
                            <div className="text-[10px] text-slate-400 truncate mt-1" title={optText}>
                              {optText}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 2: Descriptive Answers & Image Viewer */}
              {exam.questions.filter(q => q.type === 'descriptive').length > 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <span>📝 Descriptive Handwritten Answers</span>
                    <span className="text-xs font-bold text-purple-400">
                      (Evaluate photos & assign marks)
                    </span>
                  </h3>

                  {exam.questions.filter(q => q.type === 'descriptive').map(q => {
                    const descAns = selectedStudent.descriptiveAnswers?.[q.number];
                    const images = descAns?.images || [];
                    const grade = currentGradeMap[q.number] || { marks: 0, feedback: '' };

                    return (
                      <div
                        key={q.number}
                        className="p-4 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-4"
                      >
                        {/* Question Header & Prompt */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                          <div>
                            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-black rounded-md border border-purple-500/30">
                              Question {q.number} • Max {q.marks} Marks
                            </span>
                            <p className="text-xs sm:text-sm font-bold text-white mt-1">
                              {q.prompt}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-bold text-slate-400">Mark Awarded:</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max={q.marks}
                                step="0.5"
                                value={grade.marks}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setCurrentGradeMap(prev => ({
                                    ...prev,
                                    [q.number]: { ...prev[q.number], marks: Math.min(q.marks, Math.max(0, val)) }
                                  }));
                                }}
                                className="w-16 px-2 py-1 bg-slate-900 border border-purple-500/40 rounded-xl text-center text-white font-extrabold text-sm focus:outline-none focus:border-purple-400"
                              />
                              <span className="text-slate-500 text-xs font-bold">/ {q.marks}</span>
                            </div>
                          </div>
                        </div>

                        {/* Student's Typed Text Answer (if provided) */}
                        {descAns?.textAnswer && descAns.textAnswer.trim().length > 0 && (
                          <div className="p-3.5 bg-slate-900/90 border border-indigo-500/20 rounded-xl space-y-1.5">
                            <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Student's Typed Answer:</span>
                            </div>
                            <div className="text-xs sm:text-sm text-slate-100 whitespace-pre-wrap font-sans leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800 select-text">
                              {descAns.textAnswer}
                            </div>
                          </div>
                        )}

                        {/* Uploaded Answer Photos from Backblaze B2 */}
                        {images.length === 0 ? (
                          !descAns?.textAnswer?.trim() && (
                            <div className="p-6 bg-slate-900/60 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-xs">
                              No answer sheet photos or typed answer submitted for this question.
                            </div>
                          )
                        ) : (
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-slate-400 block">
                              Uploaded Answer Sheets ({images.length} pages) — Click to enlarge/zoom:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {images.map((img, imgIdx) => (
                                <div
                                  key={img.b2Key || imgIdx}
                                  onClick={() => setLightboxImage({
                                    url: img.url,
                                    title: `${selectedStudent.studentName} — Q${q.number} (Page ${imgIdx + 1})`,
                                    rotation: 0
                                  })}
                                  className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-purple-500 transition-all shadow-md"
                                >
                                  <img
                                    src={img.url}
                                    alt={`Q${q.number} Page ${imgIdx + 1}`}
                                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="p-2 bg-slate-900/90 rounded-full text-white">
                                      <Eye className="w-4 h-4" />
                                    </div>
                                  </div>
                                  <div className="p-1.5 bg-slate-950 text-[10px] font-mono text-slate-400 text-center flex items-center justify-between px-2">
                                    <span>Page {imgIdx + 1}</span>
                                    <ExternalLink className="w-3 h-3 text-slate-500" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Teacher Feedback input */}
                        <div className="pt-2">
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">
                            Teacher Feedback / Remarks for Question {q.number}:
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Good derivation, minor formula error in step 2"
                            value={grade.feedback}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCurrentGradeMap(prev => ({
                                ...prev,
                                [q.number]: { ...prev[q.number], feedback: val }
                              }));
                            }}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Overall General Feedback */}
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                    <label className="block text-xs font-bold text-slate-300">
                      Overall Exam Remarks / Final Feedback:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Well answered! Need to improve neatness in derivations."
                      value={overallFeedback}
                      onChange={(e) => setOverallFeedback(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between gap-3 bg-slate-950/60">
              <button
                onClick={() => setSelectedStudentId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveStudentGrades}
                disabled={isSavingGrade}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingGrade ? 'Saving Evaluation...' : 'Save Student Grade'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Image Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-in fade-in">
          {/* Top Bar */}
          <div className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-slate-800">
            <span className="font-bold text-sm truncate max-w-md">{lightboxImage.title}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLightboxImage(prev => prev ? { ...prev, rotation: (prev.rotation + 90) % 360 } : null)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                title="Rotate 90 degrees"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate</span>
              </button>
              <button
                onClick={() => window.open(lightboxImage.url, '_blank')}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                title="Open original in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Original</span>
              </button>
              <button
                onClick={() => setLightboxImage(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-bold cursor-pointer text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Main Photo View */}
          <div className="flex-1 flex items-center justify-center w-full max-w-5xl overflow-hidden py-4">
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              style={{ transform: `rotate(${lightboxImage.rotation}deg)` }}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}
