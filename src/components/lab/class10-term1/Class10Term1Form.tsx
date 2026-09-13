import React, { useState, useMemo, useEffect } from 'react';
import { 
  SCERT_CLASS_10_SUBJECTS, 
  TOTAL_MAX_MARKS,
  calculateSSLCGrade, 
  submitClass10Term1Response 
} from '../../../services/class10Term1Service';
import { 
  User, 
  CheckCircle2, 
  Send, 
  RefreshCw, 
  BookOpen, 
  Calculator, 
  Zap, 
  FlaskConical, 
  Dna, 
  Languages, 
  Laptop, 
  Globe, 
  Award, 
  Check, 
  School, 
  Hash, 
  Sparkles,
  ChevronRight,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const FL1_VARIANTS = [
  'Malayalam I',
  'Arabic',
  'Urdu',
  'Sanskrit (Academic)',
  'Sanskrit (Oriental)',
  'Tamil',
  'Kannada'
];

export default function Class10Term1Form() {
  // Student & Class info
  const [studentName, setStudentName] = useState('');
  const [className, setClassName] = useState('Class E1');
  const [fl1Variant, setFl1Variant] = useState('Malayalam I');

  // Subject marks (string values for easy typing)
  const [marks, setMarks] = useState<Record<string, string>>({
    mal1: '',
    mal2: '',
    eng: '',
    hin: '',
    ss: '',
    phy: '',
    chem: '',
    bio: '',
    math: ''
  });

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedResponseId, setSubmittedResponseId] = useState('');

  // Dynamically set app and page title to "Inspire" and remove favicon for this route
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Inspire';

    const iconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement | null;
    const prevIcon = iconLink ? iconLink.getAttribute('href') || '' : '';
    if (iconLink) {
      iconLink.setAttribute('href', 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>');
    }

    const metaAppleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    const prevAppleTitle = metaAppleTitle?.getAttribute('content') || '';
    if (metaAppleTitle) {
      metaAppleTitle.setAttribute('content', 'Inspire');
    }

    return () => {
      document.title = prevTitle || 'AIMS';
      if (iconLink && prevIcon) {
        iconLink.setAttribute('href', prevIcon);
      }
      if (metaAppleTitle && prevAppleTitle) {
        metaAppleTitle.setAttribute('content', prevAppleTitle);
      }
    };
  }, []);

  // Subject icon helper
  const getSubjectIcon = (category: string, code: string) => {
    switch (category) {
      case 'language':
        return <Languages className="w-4 h-4 text-rose-500" />;
      case 'science':
        if (code === 'PHY') return <Zap className="w-4 h-4 text-amber-500" />;
        if (code === 'CHE') return <FlaskConical className="w-4 h-4 text-purple-500" />;
        return <Dna className="w-4 h-4 text-emerald-500" />;
      case 'math':
        return <Calculator className="w-4 h-4 text-blue-500" />;
      case 'social':
        return <Globe className="w-4 h-4 text-orange-500" />;
      case 'it':
        return <Laptop className="w-4 h-4 text-cyan-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
    }
  };

  // Safe clamping handler: strictly limit to max marks
  const handleMarkChange = (subjectId: string, maxMarks: number, rawValue: string) => {
    if (rawValue === '') {
      setMarks(prev => ({ ...prev, [subjectId]: '' }));
      if (errors[subjectId]) {
        setErrors(prev => {
          const next = { ...prev };
          delete next[subjectId];
          return next;
        });
      }
      return;
    }

    const num = parseFloat(rawValue);
    if (isNaN(num)) return;

    if (num < 0) {
      setMarks(prev => ({ ...prev, [subjectId]: '0' }));
    } else if (num > maxMarks) {
      // Clamped strictly to max marks
      setMarks(prev => ({ ...prev, [subjectId]: String(maxMarks) }));
    } else {
      setMarks(prev => ({ ...prev, [subjectId]: rawValue }));
    }

    if (errors[subjectId]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[subjectId];
        return next;
      });
    }
  };

  // Auto-calculated totals
  const { totalMarks, enteredCount, percentage, gradeInfo } = useMemo(() => {
    let sum = 0;
    let count = 0;

    SCERT_CLASS_10_SUBJECTS.forEach(sub => {
      const valStr = marks[sub.id];
      if (valStr !== undefined && valStr.trim() !== '') {
        const num = parseFloat(valStr);
        if (!isNaN(num)) {
          sum += Math.min(Math.max(num, 0), sub.maxMarks);
          count++;
        }
      }
    });

    // percentage based on 480 total marks
    const pct = TOTAL_MAX_MARKS > 0 ? (sum / TOTAL_MAX_MARKS) * 100 : 0;
    const grade = calculateSSLCGrade(pct);

    return {
      totalMarks: Math.round(sum * 10) / 10,
      enteredCount: count,
      percentage: Math.round(pct * 10) / 10,
      gradeInfo: grade
    };
  }, [marks]);

  const effectiveClass = className;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!studentName.trim()) {
      newErrors.studentName = 'Please enter student name';
    }

    // Check if at least one subject mark is entered
    if (enteredCount === 0) {
      newErrors.general = 'Please enter marks for at least one subject';
    }

    // Validate each entered mark is not above max marks
    SCERT_CLASS_10_SUBJECTS.forEach(sub => {
      const valStr = marks[sub.id];
      if (valStr && valStr.trim() !== '') {
        const num = parseFloat(valStr);
        if (isNaN(num)) {
          newErrors[sub.id] = 'Invalid number';
        } else if (num < 0) {
          newErrors[sub.id] = 'Cannot be negative';
        } else if (num > sub.maxMarks) {
          newErrors[sub.id] = `Cannot exceed max mark of ${sub.maxMarks}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const el = document.getElementById(firstErrorKey);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);

    try {
      // Map marks record to numeric or null
      const formattedSubjects: Record<string, number | null> = {};
      SCERT_CLASS_10_SUBJECTS.forEach(sub => {
        const str = marks[sub.id];
        if (str !== undefined && str.trim() !== '') {
          const num = parseFloat(str);
          formattedSubjects[sub.id] = isNaN(num) ? null : Math.min(Math.max(num, 0), sub.maxMarks);
        } else {
          formattedSubjects[sub.id] = null;
        }
      });

      const docId = await submitClass10Term1Response({
        studentName: studentName.trim(),
        className: effectiveClass,
        fl1Variant: fl1Variant,
        subjects: formattedSubjects,
        totalMarks: totalMarks,
        maxMarks: TOTAL_MAX_MARKS,
        percentage: percentage,
        grade: gradeInfo.grade
      });

      setSubmittedResponseId(docId);
      setSubmitted(true);
      setSubmitting(false);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Failed to submit marks:', err);
      alert('Failed to submit marks. Please check your network connection.');
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setStudentName('');
    setClassName('Class E1');
    setMarks({
      mal1: '',
      mal2: '',
      eng: '',
      hin: '',
      ss: '',
      phy: '',
      chem: '',
      bio: '',
      math: ''
    });
    setErrors({});
    setSubmitted(false);
    setSubmittedResponseId('');
  };

  // Submitted Success View
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 py-8 px-4 sm:px-6">
        <div className="max-w-xl mx-auto space-y-6">
          
          {/* Success Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-2">
                Submission Confirmed
              </span>
              <h2 className="text-2xl font-black text-slate-900">Marks Successfully Recorded!</h2>
              <p className="text-slate-500 text-sm mt-1">
                Term 1 evaluation for <strong className="text-slate-800">{studentName}</strong> has been saved.
              </p>
            </div>

            {/* Scorecard Summary */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-left space-y-4">
              <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200 text-slate-600">
                <div>
                  <span className="font-semibold text-slate-400">STUDENT: </span>
                  <strong className="text-slate-900 text-sm">{studentName}</strong>
                </div>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold">
                    {effectiveClass}
                  </span>
                </div>
              </div>

              {/* Subject Marks Table */}
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {SCERT_CLASS_10_SUBJECTS.map(sub => {
                  const val = marks[sub.id];
                  const numVal = val ? parseFloat(val) : null;
                  const isEntered = numVal !== null && !isNaN(numVal);
                  const subPct = isEntered ? (numVal / sub.maxMarks) * 100 : 0;
                  const subGrade = isEntered ? calculateSSLCGrade(subPct).grade : '-';

                  return (
                    <div 
                      key={sub.id} 
                      className="flex items-center justify-between text-xs py-1.5 px-3 rounded-lg bg-white border border-slate-100"
                    >
                      <div className="flex items-center gap-2 font-medium text-slate-700 truncate mr-2">
                        {getSubjectIcon(sub.category, sub.code)}
                        <span className="truncate">
                          {sub.id === 'mal1' ? `FL 1 (${fl1Variant})` : sub.shortName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-slate-900">
                          {isEntered ? numVal : '—'} <span className="text-slate-400 font-normal">/ {sub.maxMarks}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                          subGrade === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                          subGrade === 'A' ? 'bg-teal-100 text-teal-800' :
                          subGrade === 'B+' || subGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {subGrade}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Summary Row */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Overall Total</div>
                  <div className="text-xl font-black text-slate-900">
                    {totalMarks} <span className="text-sm font-semibold text-slate-400">/ {TOTAL_MAX_MARKS}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Percentage & Grade</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-indigo-600">{percentage}%</span>
                    <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-sm font-black shadow-sm">
                      {gradeInfo.grade}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Enter Another Student</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/25 to-slate-100 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6 pb-24">
        
        {/* Header Branding Card */}
        {/* User specification: INSPIRE Cheekkode */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider border border-indigo-100/80">
              SCERT Kerala • Class 10
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            INSPIRE Cheekkode
          </h1>
          <p className="text-slate-600 text-sm mt-1.5 max-w-xl font-medium leading-relaxed">
            Class 10 First Term Examination (Term 1) Marks Collection Portal
          </p>
        </div>

        {/* APPLICATION FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* SECTION 1: STUDENT & CLASS INFO */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <User className="w-4 h-4 text-indigo-600" />
              Student & Class Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Student Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="studentName"
                    type="text"
                    value={studentName}
                    onChange={e => {
                      setStudentName(e.target.value);
                      if (errors.studentName) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.studentName;
                          return next;
                        });
                      }
                    }}
                    placeholder="Enter full name of student"
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                      errors.studentName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.studentName && (
                  <p className="text-rose-500 text-xs mt-1 font-medium">{errors.studentName}</p>
                )}
              </div>

              {/* Class Selection: exactly 2 options (Class E1 and Class M1) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Class <span className="text-rose-500">*</span>
                </label>
                <select
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
                >
                  <option value="Class E1">Class E1</option>
                  <option value="Class M1">Class M1</option>
                </select>
              </div>

              {/* First Language Choice */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  First Language Part 1 Paper
                </label>
                <select
                  value={fl1Variant}
                  onChange={e => setFl1Variant(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
                >
                  {FL1_VARIANTS.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* SECTION 2: CLASS 10 SCERT SUBJECTS */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                Class 10 SCERT Subjects (9 Subjects • Max {TOTAL_MAX_MARKS})
              </h2>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Strictly limited to Max Marks
              </span>
            </div>

            {errors.general && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.general}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {SCERT_CLASS_10_SUBJECTS.map((sub, index) => {
                const enteredVal = marks[sub.id] || '';
                const num = enteredVal !== '' ? parseFloat(enteredVal) : null;
                const isEntered = num !== null && !isNaN(num);
                const subPct = isEntered ? (num / sub.maxMarks) * 100 : 0;
                const subGrade = isEntered ? calculateSSLCGrade(subPct).grade : null;

                const displayName = sub.id === 'mal1' 
                  ? `First Language 1 (${fl1Variant})` 
                  : sub.name;

                return (
                  <div
                    key={sub.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isEntered 
                        ? 'bg-slate-50/80 border-indigo-200/90 shadow-xs' 
                        : 'bg-white border-slate-200/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-2 rounded-xl bg-slate-100 shrink-0">
                          {getSubjectIcon(sub.category, sub.code)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                            Subject #{index + 1} • {sub.code}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={displayName}>
                            {displayName}
                          </h3>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black shrink-0 border border-slate-200">
                        Max: {sub.maxMarks}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="relative flex-1">
                        <input
                          id={sub.id}
                          type="number"
                          min="0"
                          max={sub.maxMarks}
                          step="any"
                          value={enteredVal}
                          onChange={e => handleMarkChange(sub.id, sub.maxMarks, e.target.value)}
                          placeholder={`0 - ${sub.maxMarks}`}
                          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 text-sm font-bold placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all ${
                            errors[sub.id] 
                              ? 'border-rose-400 bg-rose-50/30' 
                              : isEntered 
                                ? 'border-indigo-300 ring-1 ring-indigo-100' 
                                : 'border-slate-200'
                          }`}
                        />
                      </div>

                      {/* Grade Badge */}
                      {subGrade ? (
                        <div className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
                          <span className="text-[11px] font-bold text-slate-500">Grade:</span>
                          <span className="text-xs font-black text-indigo-700">{subGrade}</span>
                        </div>
                      ) : (
                        <div className="shrink-0 px-3 py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-medium border border-slate-100">
                          Pending
                        </div>
                      )}
                    </div>

                    {errors[sub.id] && (
                      <p className="text-rose-500 text-[11px] font-semibold mt-1">{errors[sub.id]}</p>
                    )}

                    {/* Clamping Notice */}
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Limited to max {sub.maxMarks} marks</span>
                      {isEntered && (
                        <span className="font-semibold text-slate-600">
                          {Math.round(subPct)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: BOTTOM AUTO CALCULATED TOTAL (USER REQUIREMENT) */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-indigo-700/60">
              <div>
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-indigo-300" />
                  Auto-Calculated Bottom Total
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                  Overall Score Summary
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-bold text-indigo-200">
                  {enteredCount} of {SCERT_CLASS_10_SUBJECTS.length} Subjects Entered
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
              {/* Total Marks */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-xs text-indigo-200 font-medium">TOTAL MARKS</div>
                <div className="text-3xl font-black mt-1">
                  {totalMarks} <span className="text-lg font-semibold text-indigo-300">/ {TOTAL_MAX_MARKS}</span>
                </div>
                <div className="text-[11px] text-indigo-300/80 mt-1">
                  SCERT Max Total: {TOTAL_MAX_MARKS}
                </div>
              </div>

              {/* Percentage */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-xs text-indigo-200 font-medium">PERCENTAGE</div>
                <div className="text-3xl font-black text-cyan-300 mt-1">
                  {percentage}%
                </div>
                <div className="text-[11px] text-indigo-300/80 mt-1">
                  Based on {TOTAL_MAX_MARKS} aggregate
                </div>
              </div>

              {/* Predicted SSLC Grade */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="text-xs text-indigo-200 font-medium">PREDICTED GRADE</div>
                <div className="text-3xl font-black text-emerald-300 mt-1">
                  {gradeInfo.grade}
                </div>
                <div className="text-[11px] text-indigo-300/80 mt-1">
                  {gradeInfo.label}
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-indigo-200 font-medium">
                <span>Total Score Completion</span>
                <span>{percentage}% of Max Total</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 via-indigo-300 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Submitting Marks...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Class 10 Term 1 Marks</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

        {/* STICKY BOTTOM BAR FOR MOBILE SCROLLING */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:hidden z-30 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Auto Total</span>
            <span className="text-base font-black text-slate-900">
              {totalMarks} <span className="text-xs text-slate-400 font-normal">/ {TOTAL_MAX_MARKS}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-indigo-600">{percentage}%</span>
            <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-xs font-black">
              {gradeInfo.grade}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
