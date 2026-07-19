import React, { useState, useEffect } from 'react';
import { submitImprovementResponse } from '../../../services/firebaseService';
import { ClipboardList, CheckCircle2, User, Award, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ImprovementForm() {
  const [name, setName] = useState('');
  const [batch, setBatch] = useState<'B1' | 'B2' | 'B3'>('B1');
  
  // Scores
  const [english, setEnglish] = useState('');
  const [language, setLanguage] = useState('');
  const [physics, setPhysics] = useState('');
  const [chemistry, setChemistry] = useState('');
  const [mathematics, setMathematics] = useState('');
  const [sixthSubjectType, setSixthSubjectType] = useState<'Biology' | 'Computer Science'>('Biology');
  const [sixthSubjectScore, setSixthSubjectScore] = useState('');

  // Improvement selection
  const [improvementSubjects, setImprovementSubjects] = useState<string[]>([]);

  // Form states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Parse values to number helper
  const getNum = (val: string) => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Calculate Total Score dynamically
  const totalScore = 
    getNum(english) + 
    getNum(language) + 
    getNum(physics) + 
    getNum(chemistry) + 
    getNum(mathematics) + 
    getNum(sixthSubjectScore);

  // Sync checkboxes labels to sixth subject type selection
  useEffect(() => {
    // If the sixth subject type changes, filter out any old B/CS improvement selections
    setImprovementSubjects(prev => 
      prev.filter(sub => sub !== 'Biology' && sub !== 'Computer Science')
    );
  }, [sixthSubjectType]);

  const validateField = (field: string, value: string, max: number): string => {
    if (!value) return '';
    const num = Number(value);
    if (isNaN(num)) return 'Must be a number';
    if (!Number.isInteger(num)) return 'Must be an integer';
    if (num < 0 || num > max) return `Must be between 0 and ${max}`;
    return '';
  };

  const handleScoreChange = (
    value: string, 
    setter: React.Dispatch<React.SetStateAction<string>>, 
    fieldName: string, 
    max: number
  ) => {
    // Only allow numbers/empty string
    if (value !== '' && !/^\d+$/.test(value)) return;
    
    setter(value);
    const err = validateField(fieldName, value, max);
    setErrors(prev => ({ ...prev, [fieldName]: err }));
  };

  const toggleImprovementSubject = (subject: string) => {
    setImprovementSubjects(prev => {
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      }
      if (prev.length >= 3) {
        setErrors(prevErrors => ({
          ...prevErrors,
          improvementLimit: 'You can select a maximum of 3 subjects for improvement.'
        }));
        return prev;
      }
      setErrors(prevErrors => ({
        ...prevErrors,
        improvementLimit: ''
      }));
      return [...prev, subject];
    });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate inputs
    if (!name.trim()) newErrors.name = 'Full Name is required';
    
    const fieldsToValidate = [
      { name: 'english', val: english, max: 100 },
      { name: 'language', val: language, max: 100 },
      { name: 'physics', val: physics, max: 80 },
      { name: 'chemistry', val: chemistry, max: 80 },
      { name: 'mathematics', val: mathematics, max: 80 },
      { name: 'sixthSubjectScore', val: sixthSubjectScore, max: 80 },
    ];

    fieldsToValidate.forEach(f => {
      if (!f.val) {
        newErrors[f.name] = 'Score is required';
      } else {
        const err = validateField(f.name, f.val, f.max);
        if (err) newErrors[f.name] = err;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
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
        name: name.trim(),
        batch,
        scores: {
          english: getNum(english),
          language: getNum(language),
          physics: getNum(physics),
          chemistry: getNum(chemistry),
          mathematics: getNum(mathematics),
          sixthSubjectType,
          sixthSubjectScore: getNum(sixthSubjectScore),
        },
        totalScore,
        improvementSubjects,
        wantsEntranceExams: false,
        preferredEntranceExams: [],
      });

      // Show Confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      setSubmitted(true);
    } catch (e) {
      console.error(e);
      alert('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setName('');
    setBatch('B1');
    setEnglish('');
    setLanguage('');
    setPhysics('');
    setChemistry('');
    setMathematics('');
    setSixthSubjectScore('');
    setImprovementSubjects([]);
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="inline-flex p-4 bg-emerald-100 text-emerald-600 rounded-full">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Submission Successful!</h2>
          <p className="text-gray-600 text-sm">
            Thank you, <strong>{name}</strong>. Your academic profile and improvement preferences have been successfully logged.
          </p>
          <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Batch:</span>
              <span className="font-semibold text-gray-900">{batch}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total Score:</span>
              <span className="font-semibold text-gray-900">{totalScore} / 520</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Improvement Subjects:</span>
              <span className="font-semibold text-gray-900 max-w-[200px] text-right truncate">
                {improvementSubjects.length > 0 ? improvementSubjects.join(', ') : 'None'}
              </span>
            </div>

          </div>
          <button
            onClick={handleReset}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 bg-purple-600/10 text-purple-600 rounded-2xl border border-purple-500/10">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Academic Profile Update</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Please fill in your current marks and mark improvements to help us process your profile accurately.
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-md space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-5">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <User className="w-5 h-5 text-purple-500" />
              <span>Basic Information</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (e.target.value.trim()) {
                      setErrors(prev => ({ ...prev, name: '' }));
                    }
                  }}
                  className={`w-full px-4 py-3 bg-gray-50 border ${errors.name ? 'border-red-400 focus:ring-red-200 focus:border-red-500' : 'border-gray-200 focus:ring-purple-200 focus:border-purple-500'} rounded-xl focus:outline-none focus:ring-4 transition-all text-sm`}
                />
                {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Batch
                </label>
                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-1 border border-gray-200 rounded-xl">
                  {(['B1', 'B2', 'B3'] as const).map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBatch(b)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${batch === b ? 'bg-white text-purple-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Subject Scores */}
          <div className="space-y-6">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <Award className="w-5 h-5 text-purple-500" />
              <span>Subject Scores (Science Stream)</span>
            </h3>

            {/* Selector for 6th subject */}
            <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-800">Select 6th Subject Option</span>
                <p className="text-xs text-slate-500">Pick your elective science subject to enter its score.</p>
              </div>
              <div className="flex bg-white p-1 border border-purple-100 rounded-xl shrink-0">
                {(['Biology', 'Computer Science'] as const).map(subj => (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => setSixthSubjectType(subj)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sixthSubjectType === subj ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {subj === 'Biology' ? 'Biology' : 'CS'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
              {/* English */}
              <div id="english">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  English <span className="text-slate-400 font-normal">(Max 100)</span>
                </label>
                <input
                  type="text"
                  placeholder="Score"
                  value={english}
                  onChange={(e) => handleScoreChange(e.target.value, setEnglish, 'english', 100)}
                  className={`w-full px-4 py-3 bg-gray-50 border ${errors.english ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all text-sm`}
                />
                {errors.english && <span className="text-xs text-red-500 mt-1 block">{errors.english}</span>}
              </div>

              {/* Language */}
              <div id="language">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Language <span className="text-slate-400 font-normal">(Max 100)</span>
                </label>
                <input
                  type="text"
                  placeholder="Score"
                  value={language}
                  onChange={(e) => handleScoreChange(e.target.value, setLanguage, 'language', 100)}
                  className={`w-full px-4 py-3 bg-gray-50 border ${errors.language ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all text-sm`}
                />
                {errors.language && <span className="text-xs text-red-500 mt-1 block">{errors.language}</span>}
              </div>

              {/* Physics */}
              <div id="physics">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Physics <span className="text-slate-400 font-normal">(Max 80)</span>
                </label>
                <input
                  type="text"
                  placeholder="Score"
                  value={physics}
                  onChange={(e) => handleScoreChange(e.target.value, setPhysics, 'physics', 80)}
                  className={`w-full px-4 py-3 bg-gray-50 border ${errors.physics ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all text-sm`}
                />
                {errors.physics && <span className="text-xs text-red-500 mt-1 block">{errors.physics}</span>}
              </div>

              {/* Chemistry */}
              <div id="chemistry">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Chemistry <span className="text-slate-400 font-normal">(Max 80)</span>
                </label>
                <input
                  type="text"
                  placeholder="Score"
                  value={chemistry}
                  onChange={(e) => handleScoreChange(e.target.value, setChemistry, 'chemistry', 80)}
                  className={`w-full px-4 py-3 bg-gray-50 border ${errors.chemistry ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all text-sm`}
                />
                {errors.chemistry && <span className="text-xs text-red-500 mt-1 block">{errors.chemistry}</span>}
              </div>

              {/* Mathematics */}
              <div id="mathematics">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Mathematics <span className="text-slate-400 font-normal">(Max 80)</span>
                </label>
                <input
                  type="text"
                  placeholder="Score"
                  value={mathematics}
                  onChange={(e) => handleScoreChange(e.target.value, setMathematics, 'mathematics', 80)}
                  className={`w-full px-4 py-3 bg-gray-50 border ${errors.mathematics ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all text-sm`}
                />
                {errors.mathematics && <span className="text-xs text-red-500 mt-1 block">{errors.mathematics}</span>}
              </div>

              {/* 6th Subject (Bio or CS) */}
              <div id="sixthSubjectScore">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 truncate">
                  {sixthSubjectType} <span className="text-slate-400 font-normal">(Max 80)</span>
                </label>
                <input
                  type="text"
                  placeholder="Score"
                  value={sixthSubjectScore}
                  onChange={(e) => handleScoreChange(e.target.value, setSixthSubjectScore, 'sixthSubjectScore', 80)}
                  className={`w-full px-4 py-3 bg-gray-50 border ${errors.sixthSubjectScore ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all text-sm`}
                />
                {errors.sixthSubjectScore && <span className="text-xs text-red-500 mt-1 block">{errors.sixthSubjectScore}</span>}
              </div>
            </div>

            {/* Total Display Section */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between shadow-inner">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Calculated Total Marks</span>
                <div className="text-xs text-slate-300">Auto calculated on entering subject scores</div>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  {totalScore}
                </span>
                <span className="text-xs text-slate-400 font-medium block">out of 520</span>
              </div>
            </div>
          </div>

          {/* Section 3: Improvement Subjects Selector */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <ClipboardList className="w-5 h-5 text-purple-500" />
              <span>Improvement Exam Subjects Selection</span>
            </h3>
            <p className="text-xs text-gray-500 flex flex-col sm:flex-row sm:justify-between gap-1">
              <span>Select the subjects for which you wish to write improvement exams.</span>
              <span className="font-semibold text-purple-600 shrink-0">Selected: {improvementSubjects.length} / 3 max</span>
            </p>

            {errors.improvementLimit && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl font-medium">
                {errors.improvementLimit}
              </div>
            )}

            <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100 bg-gray-50/30">
              {[
                { name: 'English', score: english, max: 100 },
                { name: 'Language', score: language, max: 100 },
                { name: 'Physics', score: physics, max: 80 },
                { name: 'Chemistry', score: chemistry, max: 80 },
                { name: 'Mathematics', score: mathematics, max: 80 },
                { name: sixthSubjectType, score: sixthSubjectScore, max: 80 },
              ].map((sub) => {
                const isSelected = improvementSubjects.includes(sub.name);
                const scoreValue = sub.score ? `${sub.score} / ${sub.max}` : `Not entered`;
                
                return (
                  <div
                    key={sub.name}
                    onClick={() => toggleImprovementSubject(sub.name)}
                    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors select-none ${isSelected ? 'bg-purple-50/30' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300 bg-white'}`}>
                        {isSelected && (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm font-semibold ${isSelected ? 'text-purple-900' : 'text-gray-700'}`}>
                        {sub.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 bg-white border border-gray-200/60 px-2.5 py-1 rounded-full shadow-sm">
                      Score: {scoreValue}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>



          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-purple-900/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Submit Academic Profile</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
