import React, { useState } from 'react';
import { 
  submitRevaluationResponse, 
  RevaluationBatch, 
  RevaluationSubjectScore, 
  REVALUATION_COMMON_SUBJECTS 
} from '../../../services/revaluationService';
import { 
  User, 
  Phone, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  Plus, 
  Trash2, 
  Zap, 
  FlaskConical, 
  Calculator, 
  Dna, 
  Languages, 
  Laptop, 
  FileText, 
  Check, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RevaluationForm() {
  const [name, setName] = useState('');
  const [batch, setBatch] = useState<RevaluationBatch>('B1');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Selected subjects with scores
  const [selectedSubjects, setSelectedSubjects] = useState<RevaluationSubjectScore[]>([]);

  // Custom subject input state
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Form status & feedback
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<string>('');

  // Quick subject icon helper
  const getSubjectIcon = (subjectName: string) => {
    const s = subjectName.toLowerCase();
    if (s.includes('physics')) return <Zap className="w-4 h-4 text-amber-500" />;
    if (s.includes('chemistry')) return <FlaskConical className="w-4 h-4 text-purple-500" />;
    if (s.includes('math')) return <Calculator className="w-4 h-4 text-blue-500" />;
    if (s.includes('bio') || s.includes('botany') || s.includes('zoology')) return <Dna className="w-4 h-4 text-emerald-500" />;
    if (s.includes('computer') || s.includes('cs')) return <Laptop className="w-4 h-4 text-cyan-500" />;
    if (s.includes('english') || s.includes('malayalam') || s.includes('hindi') || s.includes('arabic') || s.includes('urdu')) {
      return <Languages className="w-4 h-4 text-rose-500" />;
    }
    return <BookOpen className="w-4 h-4 text-indigo-500" />;
  };

  // Toggle subject from tags
  const handleToggleSubject = (subjectName: string) => {
    const trimmed = subjectName.trim();
    if (!trimmed) return;

    const alreadyExists = selectedSubjects.some(
      s => s.subject.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) {
      // Toggle off if already selected
      setSelectedSubjects(prev => prev.filter(s => s.subject.toLowerCase() !== trimmed.toLowerCase()));
      // Clear error for that subject if any
      setErrors(prev => {
        const next = { ...prev };
        delete next[`score_${trimmed}`];
        return next;
      });
    } else {
      // Add subject
      setSelectedSubjects(prev => [...prev, { subject: trimmed, score: '' }]);
      if (errors.subjects) {
        setErrors(prev => {
          const next = { ...prev };
          delete next.subjects;
          return next;
        });
      }
    }
  };

  const handleAddCustomSubject = () => {
    const trimmed = customSubjectName.trim();
    if (!trimmed) return;

    const alreadyExists = selectedSubjects.some(
      s => s.subject.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) {
      setErrors(prev => ({
        ...prev,
        subjects: `"${trimmed}" is already added to your list below.`
      }));
      return;
    }

    setSelectedSubjects(prev => [...prev, { subject: trimmed, score: '' }]);
    setCustomSubjectName('');
    setShowCustomInput(false);

    if (errors.subjects) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.subjects;
        return next;
      });
    }
  };

  const handleRemoveSubject = (subjectName: string) => {
    setSelectedSubjects(prev => prev.filter(s => s.subject !== subjectName));
  };

  const handleScoreChange = (subjectName: string, value: string) => {
    setSelectedSubjects(prev =>
      prev.map(item => (item.subject === subjectName ? { ...item, score: value } : item))
    );

    // Clear subject errors if any
    if (errors[`score_${subjectName}`]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[`score_${subjectName}`];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter student name';
    }

    if (!batch) {
      newErrors.batch = 'Please select your batch';
    }

    if (selectedSubjects.length === 0) {
      newErrors.subjects = 'Please select at least one subject for revaluation';
    } else {
      selectedSubjects.forEach(s => {
        if (s.score === '' || s.score === undefined || s.score === null) {
          newErrors[`score_${s.subject}`] = `Enter current score for ${s.subject}`;
        } else if (isNaN(Number(s.score)) || Number(s.score) < 0) {
          newErrors[`score_${s.subject}`] = `Enter a valid score (0 or greater)`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const sanitizedSubjects = selectedSubjects.map(s => ({
        subject: s.subject.trim(),
        score: Number(s.score)
      }));

      const id = await submitRevaluationResponse({
        name: name.trim(),
        batch,
        phone: phone.trim() || undefined,
        subjects: sanitizedSubjects,
        notes: notes.trim() || undefined
      });

      setSubmittedId(id);
      setSubmitting(false);
      setSubmitted(true);

      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Error submitting revaluation application:', err);
      setSubmitting(false);
      alert('Failed to submit revaluation application. Please check your internet connection.');
    }
  };

  const handleReset = () => {
    setName('');
    setBatch('B1');
    setPhone('');
    setNotes('');
    setSelectedSubjects([]);
    setCustomSubjectName('');
    setShowCustomInput(false);
    setErrors({});
    setSubmitted(false);
    setSubmittedId('');
  };

  // Submitted success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-slate-50 to-purple-50/40 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden p-6 sm:p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full mb-2">
              Application Submitted
            </span>
            <h2 className="text-2xl font-black text-slate-900">Revaluation Registered!</h2>
            <p className="text-slate-500 text-sm mt-1">
              Thank you, <strong className="text-slate-800">{name}</strong>. Your revaluation request for <span className="font-bold text-indigo-600">Batch {batch}</span> has been received.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-left space-y-3">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 text-slate-500 font-medium">
              <span>Candidate: <strong className="text-slate-800">{name}</strong></span>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold">Batch {batch}</span>
            </div>

            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Subjects Requested ({selectedSubjects.length}):
            </div>
            <div className="space-y-2">
              {selectedSubjects.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-xs">
                  <div className="flex items-center gap-2">
                    {getSubjectIcon(s.subject)}
                    <span className="font-semibold text-slate-800">{s.subject}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Current Score</span>
                    <span className="font-bold text-indigo-700">{s.score}</span>
                  </div>
                </div>
              ))}
            </div>

            {notes && (
              <div className="pt-2 text-xs text-slate-600 border-t border-slate-200">
                <span className="font-semibold text-slate-700">Remarks: </span>
                {notes}
              </div>
            )}

            {submittedId && (
              <div className="text-[11px] text-slate-400 text-center pt-1 font-mono">
                Ref ID: {submittedId}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Submit Another Application</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/40 via-slate-50 to-blue-50/40 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header Branding Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-bl-full pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider border border-indigo-100/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AIMS Plus Learning Centre
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Revaluation Application Form
          </h1>
          <p className="text-slate-600 text-sm mt-2 max-w-lg leading-relaxed">
            Please fill out your details, select your batch (<strong className="text-slate-800">B1, B2, or B3</strong>), and choose each subject you wish to submit for revaluation along with your current score.
          </p>
        </div>

        {/* Main Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Student Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-indigo-600" />
              Student Information
            </h2>

            {/* Student Name */}
            <div>
              <label htmlFor="student-name-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="student-name-input"
                  type="text"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.name;
                        return next;
                      });
                    }
                  }}
                  placeholder="Enter student's full name"
                  className={`w-full px-4 py-3 bg-slate-50/70 border rounded-2xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                    errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Batch Selector (B1, B2, B3) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Batch <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['B1', 'B2', 'B3'] as const).map(b => {
                  const isSelected = batch === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBatch(b)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 relative ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-[1.02]'
                          : 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-xs font-medium opacity-80">Batch</span>
                      <span className="text-lg font-black">{b}</span>
                    </button>
                  );
                })}
              </div>
              {errors.batch && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.batch}
                </p>
              )}
            </div>

            {/* Phone / Contact */}
            <div>
              <label htmlFor="student-phone-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone / WhatsApp Number <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <input
                  id="student-phone-input"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g., 9876543210"
                  className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                />
              </div>
            </div>

          </div>

          {/* Section 2: Subjects for Revaluation & Scores */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Subjects for Revaluation
              </h2>
              {selectedSubjects.length > 0 && (
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                  {selectedSubjects.length} {selectedSubjects.length === 1 ? 'subject' : 'subjects'} added
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500">
              Select each subject you want to apply for revaluation. As you add a subject, enter your current score obtained in that subject.
            </p>

            {/* Subject Tags Selection */}
            <div className="space-y-3 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/70">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tap to Add / Remove Subjects
                </label>
                <span className="text-[11px] text-slate-400">
                  Select all subjects you need revalued
                </span>
              </div>

              {/* Tags Grid */}
              <div className="flex flex-wrap gap-2 pt-1">
                {REVALUATION_COMMON_SUBJECTS.map(subj => {
                  const isAdded = selectedSubjects.some(
                    s => s.subject.toLowerCase() === subj.toLowerCase()
                  );
                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => handleToggleSubject(subj)}
                      className={`px-3.5 py-2 text-xs rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isAdded
                          ? 'bg-indigo-600 text-white shadow-xs scale-[1.02]'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 shadow-2xs'
                      }`}
                    >
                      {isAdded ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{subj}</span>
                    </button>
                  );
                })}

                {/* Other / Custom Subject Tag */}
                <button
                  type="button"
                  onClick={() => setShowCustomInput(prev => !prev)}
                  className={`px-3.5 py-2 text-xs rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    showCustomInput
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-600 border border-dashed border-slate-300 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Other Subject</span>
                </button>
              </div>

              {/* Custom Subject Input */}
              {showCustomInput && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={customSubjectName}
                    onChange={e => setCustomSubjectName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSubject();
                      }
                    }}
                    placeholder="Enter subject name (e.g. Zoology, Economics)..."
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubject}
                    disabled={!customSubjectName.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              )}
            </div>

            {/* Error banner for subjects */}
            {errors.subjects && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.subjects}</span>
              </div>
            )}

            {/* Active Selected Subjects List with Score Inputs */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Selected Subjects & Obtained Scores
              </label>

              {selectedSubjects.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600">No subjects selected yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tap on the <span className="font-semibold text-indigo-600">+ tags</span> above to add subjects you want revalued.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedSubjects.map(item => {
                    const scoreError = errors[`score_${item.subject}`];
                    return (
                      <div
                        key={item.subject}
                        className={`p-3.5 bg-white border rounded-2xl shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          scoreError ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Subject Badge & Icon */}
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-slate-100 rounded-xl">
                            {getSubjectIcon(item.subject)}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-800 block">
                              {item.subject}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Revaluation requested
                            </span>
                          </div>
                        </div>

                        {/* Score Input & Delete Button */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 sm:w-44">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Current Score / Marks <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={item.score}
                              onChange={e => handleScoreChange(item.subject, e.target.value)}
                              placeholder="e.g. 42"
                              className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-slate-900 text-sm font-bold placeholder:text-slate-300 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                                scoreError ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                              }`}
                            />
                            {scoreError && (
                              <span className="text-[11px] text-rose-500 font-medium block mt-1">
                                {scoreError}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(item.subject)}
                            title={`Remove ${item.subject}`}
                            className="p-2.5 mt-4 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 3: Notes / Remarks */}
            <div className="pt-2">
              <label htmlFor="reval-notes-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Additional Notes / Remarks <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <textarea
                id="reval-notes-input"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Any special remarks or details regarding your revaluation application..."
                className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all resize-none"
              />
            </div>

          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-60 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Revaluation Application</span>
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-2.5">
              Your application will be recorded in the AIMS Plus Revaluation database.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
}
