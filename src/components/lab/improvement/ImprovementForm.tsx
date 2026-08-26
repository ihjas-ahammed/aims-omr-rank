import React, { useState } from 'react';
import { submitImprovementResponse } from '../../../services/firebaseService';
import { CheckCircle2, User, BookOpen, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const AVAILABLE_SUBJECTS = [
  { id: 'Physics', name: 'Physics' },
  { id: 'Chemistry', name: 'Chemistry' },
  { id: 'Mathematics', name: 'Mathematics' },
  { id: 'Biology', name: 'Biology' },
  { id: 'Computer Science', name: 'Computer Science' },
  { id: 'English', name: 'English' },
];

export default function ImprovementForm() {
  const [name, setName] = useState('');
  const [batch, setBatch] = useState<'B1' | 'B2' | 'B3'>('B1');
  const [improvementSubjects, setImprovementSubjects] = useState<string[]>([]);

  // Form states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleSubject = (subjectId: string) => {
    setImprovementSubjects(prev => {
      const next = prev.includes(subjectId)
        ? prev.filter(s => s !== subjectId)
        : [...prev, subjectId];
      
      if (next.length > 0) {
        setErrors(errs => ({ ...errs, subjects: '' }));
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate inputs - convert name to uppercase
    const trimmedName = name.trim().toUpperCase();
    if (!trimmedName) {
      newErrors.name = 'Full Name is required';
    }

    if (improvementSubjects.length === 0) {
      newErrors.subjects = 'Please select at least one subject';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);

    try {
      await submitImprovementResponse({
        name: trimmedName,
        batch,
        improvementSubjects,
      });

      // Trigger Confetti Celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSubmitted(true);
    } catch (e) {
      console.error(e);
      alert('Failed to submit. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setBatch('B1');
    setImprovementSubjects([]);
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-400 rounded-full ring-8 ring-emerald-500/5">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div>
            <div className="text-xs font-black tracking-widest text-indigo-400 uppercase mb-1">AIMS PLUS</div>
            <h2 className="text-2xl font-black text-white tracking-tight">Improvement Night Class</h2>
            <p className="text-slate-400 text-sm mt-1">
              Your registration has been successfully recorded.
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-slate-950/70 rounded-2xl p-5 text-left border border-slate-800 space-y-3 shadow-inner">
            <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2.5">
              <span className="text-slate-400 font-medium">Student Name:</span>
              <span className="font-extrabold text-white tracking-wider font-mono">{name.toUpperCase()}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2.5">
              <span className="text-slate-400 font-medium">Batch:</span>
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold rounded-lg text-xs">{batch}</span>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-semibold text-slate-400 block">Selected Subjects:</span>
              <div className="flex flex-wrap gap-1.5">
                {improvementSubjects.map(sub => (
                  <span key={sub} className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg text-xs shadow-sm">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-950 cursor-pointer"
            >
              Submit Another Response
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        
        {/* Header Banner */}
        <div className="text-center space-y-2">
          <div className="inline-block text-xs font-black tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 rounded-full">
            AIMS PLUS
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Improvement Night Class
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
            Please register your name and select the subjects you require.
          </p>
        </div>

        {/* Main Form Card */}
        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-7">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Student Information</span>
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* Full Name Input (ALL CAPS) */}
              <div id="name">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="name-input"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => {
                    const upper = e.target.value.toUpperCase();
                    setName(upper);
                    if (upper.trim()) {
                      setErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  className={`w-full px-4 py-3.5 bg-slate-950/70 border ${errors.name ? 'border-rose-500 focus:ring-rose-500/30' : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/30'} rounded-xl focus:outline-none focus:ring-4 transition-all text-base font-bold text-white uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-500 tracking-wider`}
                  autoComplete="off"
                  autoFocus
                />
                {errors.name && (
                  <span className="text-xs font-semibold text-rose-400 mt-1.5 block animate-in fade-in">
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Batch Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Batch <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-1 border border-slate-800 rounded-xl">
                  {(['B1', 'B2', 'B3'] as const).map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBatch(b)}
                      className={`py-3 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${batch === b ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Subject Selection */}
          <div className="space-y-4" id="subjects">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Select Subjects</span>
              </h3>
              <span className="text-xs font-bold text-indigo-400">
                Selected: {improvementSubjects.length}
              </span>
            </div>

            {errors.subjects && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-semibold animate-in fade-in">
                {errors.subjects}
              </div>
            )}

            {/* Subject Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {AVAILABLE_SUBJECTS.map((sub) => {
                const isSelected = improvementSubjects.includes(sub.id);
                return (
                  <div
                    key={sub.id}
                    onClick={() => toggleSubject(sub.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-950/50 scale-[1.01]'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <span className={`text-sm font-bold block ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {sub.name}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-xl shadow-indigo-950 flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Footer note */}
          <div className="text-center text-xs text-slate-500 pt-1">
            AIMS Plus Learning Centre
          </div>

        </form>
      </div>
    </div>
  );
}
