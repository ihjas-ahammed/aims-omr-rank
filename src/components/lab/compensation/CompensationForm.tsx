import React, { useState } from 'react';
import { A2_COMPENSATION_CHAPTERS, A2_SUBJECTS } from '../../../data/compensationData';
import { submitCompensationResponse } from '../../../services/firebaseService';
import { 
  BookOpen, 
  CheckCircle2, 
  User, 
  MessageSquare, 
  Send, 
  Check, 
  Sparkles, 
  Zap, 
  FlaskConical, 
  Calculator, 
  Dna,
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CompensationForm() {
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState<'A1' | 'A2'>('A2');
  const [reason, setReason] = useState('');
  
  // Selected chapter IDs
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  
  // Active subject tab for quick filtering on mobile
  const [activeSubjectTab, setActiveSubjectTab] = useState<'All' | 'Physics' | 'Chemistry' | 'Mathematics' | 'Zoology'>('All');

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleChapter = (chapterId: string) => {
    setSelectedChapterIds(prev => {
      if (prev.includes(chapterId)) {
        return prev.filter(id => id !== chapterId);
      }
      return [...prev, chapterId];
    });
    if (errors.chapters) {
      setErrors(prev => ({ ...prev, chapters: '' }));
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'Physics':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'Chemistry':
        return <FlaskConical className="w-4 h-4 text-purple-500" />;
      case 'Mathematics':
        return <Calculator className="w-4 h-4 text-blue-500" />;
      case 'Zoology':
        return <Dna className="w-4 h-4 text-emerald-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-500" />;
    }
  };

  const getSubjectBg = (subject: string) => {
    switch (subject) {
      case 'Physics':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Chemistry':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Mathematics':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Zoology':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter your full name';
    }

    if (selectedChapterIds.length === 0) {
      newErrors.chapters = 'Please select at least one chapter for compensation class';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const selectedChapters = A2_COMPENSATION_CHAPTERS
        .filter(c => selectedChapterIds.includes(c.id))
        .map(c => ({
          subject: c.subject,
          chapter: c.name,
          teacher: c.teacher || ''
        }));

      await submitCompensationResponse({
        name: name.trim(),
        studentClass,
        selectedChapters,
        reason: reason.trim()
      });

      setSubmitting(false);
      setSubmitted(true);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      alert('An error occurred while submitting your request. Please try again.');
    }
  };

  const handleReset = () => {
    setName('');
    setStudentClass('A2');
    setReason('');
    setSelectedChapterIds([]);
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    const selectedChaptersList = A2_COMPENSATION_CHAPTERS.filter(c => selectedChapterIds.includes(c.id));

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden p-6 sm:p-8 text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full mb-2">
              Submitted Successfully
            </span>
            <h2 className="text-2xl font-black text-slate-900">Request Recorded!</h2>
            <p className="text-slate-500 text-sm mt-1">
              Thank you, <strong className="text-slate-800">{name}</strong>. Your compensation class request for <span className="font-bold text-indigo-600">Batch {studentClass}</span> has been registered.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
              <span>Student Class: <strong className="text-slate-800 font-bold">{studentClass}</strong></span>
              <span>Total Chapters: <strong className="text-indigo-600 font-bold">{selectedChaptersList.length}</strong></span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {selectedChaptersList.map(ch => (
                <div key={ch.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{ch.name}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{ch.subject}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  const filteredChapters = activeSubjectTab === 'All' 
    ? A2_COMPENSATION_CHAPTERS 
    : A2_COMPENSATION_CHAPTERS.filter(c => c.subject === activeSubjectTab);

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Form Header Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/2 -top-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/15 backdrop-blur-md text-amber-300 font-extrabold text-xs tracking-wider uppercase rounded-full border border-white/20 flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" /> Batch A1 / A2
                </span>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-semibold text-xs rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> AIMS Plus
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Compensation Class Request
              </h1>
              <p className="text-indigo-200 text-xs sm:text-sm mt-1.5">
                Select your class and the chapters you need extra/compensation classes for.
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-5 sm:p-8 space-y-6">
          
          {/* Section 1: Student Information */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-indigo-600" />
              Student Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Class / Batch Selector */}
              <div>
                <label htmlFor="student-class-select" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Class / Batch <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="student-class-select"
                    value={studentClass}
                    onChange={e => setStudentClass(e.target.value as 'A1' | 'A2')}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-800 transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  >
                    <option value="A1">Batch A1</option>
                    <option value="A2">Batch A2</option>
                  </select>
                </div>
              </div>

              {/* Full Name Input */}
              <div>
                <label htmlFor="student-name-input" className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="student-name-input"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter student full name"
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                      errors.name 
                        ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-200' 
                        : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Chapter Selection for A2 */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Select Chapter Required
                  <span className="text-rose-500">*</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose all the chapters you need a compensation class for.
                </p>
              </div>

              {/* Counter Badge */}
              <div className="self-start sm:self-auto">
                <span className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedChapterIds.length > 0
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {selectedChapterIds.length} {selectedChapterIds.length === 1 ? 'Chapter' : 'Chapters'} Selected
                </span>
              </div>
            </div>

            {errors.chapters && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                {errors.chapters}
              </div>
            )}

            {/* Subject Tabs for quick navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['All', ...A2_SUBJECTS] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveSubjectTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeSubjectTab === tab
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredChapters.map(chapter => {
                const isSelected = selectedChapterIds.includes(chapter.id);

                return (
                  <div
                    key={chapter.id}
                    onClick={() => toggleChapter(chapter.id)}
                    className={`group relative p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-200 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl border flex items-center justify-center shrink-0 ${getSubjectBg(chapter.subject)}`}>
                          {getSubjectIcon(chapter.subject)}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                            {chapter.subject}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug group-hover:text-indigo-900 transition-colors">
                            {chapter.name}
                          </h3>
                        </div>
                      </div>

                      {/* Custom Checkbox */}
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 border-indigo-600 text-white' 
                          : 'border-slate-300 bg-white group-hover:border-indigo-400'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Additional Notes / Reason */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label htmlFor="compensation-reason-input" className="block text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              Reason / Specific Topics <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="compensation-reason-input"
              rows={2}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g., Missed previous class due to health / Need numerical solving revision"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting Request...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Compensation Request
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-400">
            AIMS Plus Learning Centre • Batch A2 Special Compensation Portal
          </p>

        </form>
      </div>
    </div>
  );
}

