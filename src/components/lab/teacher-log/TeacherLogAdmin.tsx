import React, { useState, useEffect, useMemo } from 'react';
import { 
  NCERT_SYLLABUS_DATA, 
  NCERTSubject, 
  NCERTChapter, 
  NCERTSubtopic,
  ALL_GRADE_LEVELS,
  getGradeForBatch, 
  getSubjectsForBatch, 
  findSubjectById 
} from '../../../data/ncertSyllabusData';
import { 
  TeacherLogRecord, 
  fetchAllTeacherLogs, 
  subscribeAllTeacherLogs, 
  exportTeacherLogsToExcel,
  toggleSubtopicStatus
} from '../../../services/teacherLogService';
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Filter, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Users, 
  BookOpen, 
  Sparkles, 
  Zap, 
  FlaskConical, 
  Dna, 
  Calculator, 
  ChevronRight, 
  Calendar, 
  FileSpreadsheet, 
  RefreshCw, 
  Eye, 
  ShieldCheck, 
  ExternalLink,
  MessageSquare,
  BarChart3,
  ListFilter
} from 'lucide-react';

interface TeacherLogAdminProps {
  onBack?: () => void;
  hideBack?: boolean;
}

const ALL_BATCHES = ['B1', 'B2', 'B3', 'A1', 'A2'];

export default function TeacherLogAdmin({ onBack, hideBack = false }: TeacherLogAdminProps) {
  const [logs, setLogs] = useState<TeacherLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters & View Mode
  const [viewMode, setViewMode] = useState<'matrix' | 'drilldown' | 'activity'>('matrix');

  // Drilldown selection
  const [drilldownBatch, setDrilldownBatch] = useState<string>('B1');
  const [drilldownSubjectId, setDrilldownSubjectId] = useState<string>('physics_12');

  useEffect(() => {
    document.title = "AIMS - Teacher Progress Matrix (Admin)";
  }, []);

  // Subscribe to all logs in realtime
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeAllTeacherLogs((records) => {
      setLogs(records);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Compute stats
  const totalSubtopicsPossible = useMemo(() => {
    let total = 0;
    ALL_BATCHES.forEach(b => {
      const subjects = getSubjectsForBatch(b);
      subjects.forEach(s => {
        total += s.chapters.reduce((acc, ch) => acc + ch.subtopics.length, 0);
      });
    });
    return total;
  }, []);

  const totalSubtopicsCompleted = useMemo(() => {
    return logs.reduce((acc, l) => acc + (l.completedCount || 0), 0);
  }, [logs]);

  const globalCompletionPct = totalSubtopicsPossible > 0 ? Math.round((totalSubtopicsCompleted / totalSubtopicsPossible) * 100) : 0;

  const uniqueTeachers = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      if (l.lastTeacher && l.lastTeacher !== 'Teacher') set.add(l.lastTeacher);
      if (l.subtopics) {
        Object.values(l.subtopics).forEach(st => {
          if (st.teacherName && st.teacherName !== 'Teacher') set.add(st.teacherName);
        });
      }
    });
    return Array.from(set);
  }, [logs]);

  // Aggregate recent activities
  const recentActivities = useMemo(() => {
    const list: Array<{
      batch: string;
      subjectId: string;
      subjectName: string;
      subtopicId: string;
      subtopicCode: string;
      subtopicTitle: string;
      chapterTitle: string;
      teacher: string;
      timestamp: string;
      action: 'completed' | 'uncompleted';
    }> = [];

    logs.forEach(l => {
      if (l.history) {
        l.history.forEach(h => {
          list.push({
            batch: l.batch,
            subjectId: l.subjectId,
            subjectName: l.subjectName,
            ...h
          });
        });
      }
    });

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 100);
  }, [logs]);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportTeacherLogsToExcel(logs);
    } catch (e) {
      console.error('Failed to export excel:', e);
      alert('Failed to generate Excel report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getSubjectIcon = (id: string) => {
    if (id.includes('phy')) return <Zap className="w-4 h-4 text-rose-500" />;
    if (id.includes('chem')) return <FlaskConical className="w-4 h-4 text-purple-500" />;
    if (id.includes('bio')) return <Dna className="w-4 h-4 text-emerald-500" />;
    if (id.includes('math')) return <Calculator className="w-4 h-4 text-cyan-500" />;
    return <BookOpen className="w-4 h-4 text-slate-500" />;
  };

  // Resolved drilldown subject
  const currentDrilldownSubject = useMemo(() => {
    const subjects = getSubjectsForBatch(drilldownBatch);
    return subjects.find(s => s.id === drilldownSubjectId) || subjects[0];
  }, [drilldownBatch, drilldownSubjectId]);

  const currentDrilldownLog = useMemo(() => {
    return logs.find(l => l.batch === drilldownBatch && l.subjectId === currentDrilldownSubject?.id) || null;
  }, [logs, drilldownBatch, currentDrilldownSubject]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      
      {/* Top Header - Mobile Compact */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
          
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {!hideBack && onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-sm font-black text-sm sm:text-base shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                  Progress Hub
                </h1>
                <span className="text-[9px] sm:text-[11px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  Admin
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
                Batches B1-B3 (Plus Two) & A1-A2 (Plus One)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => {
                window.history.pushState({}, '', '/form/teacher');
                window.location.href = '/form/teacher';
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Teacher</span> Form
            </button>

            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Excel'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 space-y-4 sm:space-y-6">

        {/* Global KPI Cards (2x2 on Mobile) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-base sm:text-xl shrink-0">
              5
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase">Batches</p>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">B1-B3, A1-A2</h3>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-base sm:text-xl shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase">Completed</p>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">{totalSubtopicsCompleted} Topics</h3>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm sm:text-base shrink-0">
              {globalCompletionPct}%
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase">Avg Coverage</p>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">{globalCompletionPct}% Syllabus</h3>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-base sm:text-xl shrink-0">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase">Teachers</p>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">{uniqueTeachers.length} Active</h3>
            </div>
          </div>

        </section>

        {/* View Mode Navigation Tabs */}
        <section className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
          <div className="grid grid-cols-3 gap-1 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'matrix'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Matrix</span>
            </button>

            <button
              onClick={() => setViewMode('drilldown')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'drilldown'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>

            <button
              onClick={() => setViewMode('activity')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'activity'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
          </div>

          <span className="hidden sm:inline-block text-xs text-slate-400 font-medium pr-2">
            Live Global Database Sync
          </span>
        </section>

        {/* VIEW 1: OVERVIEW MATRIX */}
        {viewMode === 'matrix' && (
          <section className="space-y-4">
            
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Curriculum Progress Matrix</h3>
                <p className="text-xs text-slate-500">Cross-batch comparison across all official NCERT subjects</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Batch</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Physics</th>
                      <th className="py-3 px-4">Chemistry</th>
                      <th className="py-3 px-4">Biology</th>
                      <th className="py-3 px-4">Mathematics</th>
                      <th className="py-3 px-4 text-right">Average</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ALL_BATCHES.map(batch => {
                      const grade = getGradeForBatch(batch);
                      const gradeTitle = grade === 'plus_two' ? 'Plus Two (12th)' : 'Plus One (11th)';
                      const subjects = getSubjectsForBatch(batch);

                      let batchCompleted = 0;
                      let batchTotal = 0;

                      subjects.forEach(s => {
                        const rec = logs.find(l => l.batch === batch && l.subjectId === s.id);
                        const total = s.chapters.reduce((acc, ch) => acc + ch.subtopics.length, 0);
                        batchTotal += total;
                        batchCompleted += rec?.completedCount || 0;
                      });

                      const batchPct = batchTotal > 0 ? Math.round((batchCompleted / batchTotal) * 100) : 0;

                      return (
                        <tr key={batch} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-black text-slate-900">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                              grade === 'plus_two' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {batch}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold text-slate-600">
                            {gradeTitle}
                          </td>

                          {['Physics', 'Chemistry', 'Biology', 'Mathematics'].map(subjName => {
                            const sub = subjects.find(s => s.name.toLowerCase().includes(subjName.toLowerCase()));
                            if (!sub) return <td key={subjName} className="py-3 px-4 text-xs text-slate-300">—</td>;

                            const rec = logs.find(l => l.batch === batch && l.subjectId === sub.id);
                            const total = sub.chapters.reduce((acc, ch) => acc + ch.subtopics.length, 0);
                            const completed = rec?.completedCount || 0;
                            const pct = rec?.percentage || 0;

                            return (
                              <td key={subjName} className="py-3 px-4">
                                <div 
                                  onClick={() => {
                                    setDrilldownBatch(batch);
                                    setDrilldownSubjectId(sub.id);
                                    setViewMode('drilldown');
                                  }}
                                  className="cursor-pointer group p-2 rounded-xl hover:bg-slate-100 transition-all space-y-1 border border-transparent hover:border-slate-200"
                                >
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-extrabold text-slate-900 group-hover:text-blue-600">{pct}%</span>
                                    <span className="text-[10px] text-slate-400 font-semibold">{completed}/{total}</span>
                                  </div>
                                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all ${
                                        pct >= 80 ? 'bg-emerald-500' : pct >= 40 ? 'bg-blue-600' : 'bg-slate-400'
                                      }`}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  {rec?.lastTeacher && (
                                    <div className="text-[10px] text-slate-400 font-medium truncate">
                                      by {rec.lastTeacher}
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}

                          <td className="py-3 px-4 text-right">
                            <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-black ${
                              batchPct >= 75
                                ? 'bg-emerald-100 text-emerald-800'
                                : batchPct >= 40
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {batchPct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards (Responsive & Clean) */}
            <div className="grid grid-cols-1 md:hidden gap-3">
              {ALL_BATCHES.map(b => {
                const grade = getGradeForBatch(b);
                const subjects = getSubjectsForBatch(b);

                return (
                  <div key={b} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                          {b}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">Batch {b}</h4>
                          <p className="text-[10px] text-slate-400">
                            {grade === 'plus_two' ? 'Plus Two (Class 12)' : 'Plus One (Class 11)'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setDrilldownBatch(b);
                          setViewMode('drilldown');
                        }}
                        className="text-xs font-bold text-blue-600 flex items-center gap-0.5"
                      >
                        Register <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {subjects.map(sub => {
                        const rec = logs.find(l => l.batch === b && l.subjectId === sub.id);
                        const total = sub.chapters.reduce((acc, ch) => acc + ch.subtopics.length, 0);
                        const completed = rec?.completedCount || 0;
                        const pct = rec?.percentage || 0;

                        return (
                          <div 
                            key={sub.id} 
                            onClick={() => {
                              setDrilldownBatch(b);
                              setDrilldownSubjectId(sub.id);
                              setViewMode('drilldown');
                            }}
                            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer space-y-1 border border-slate-100"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800 text-[11px] truncate">
                                {sub.name}
                              </span>
                              <span className="font-extrabold text-slate-900">{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  pct >= 80 ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="text-[9px] text-slate-400 flex items-center justify-between">
                              <span>{completed}/{total}</span>
                              {rec?.lastTeacher && <span>by {rec.lastTeacher}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

          </section>
        )}

        {/* VIEW 2: DETAILED DRILLDOWN */}
        {viewMode === 'drilldown' && (
          <section className="space-y-4">
            
            {/* Batch & Subject Toolbar */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Select Batch:
                </span>
                <div className="grid grid-cols-5 gap-1">
                  {ALL_BATCHES.map(b => (
                    <button
                      key={b}
                      onClick={() => setDrilldownBatch(b)}
                      className={`py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        drilldownBatch === b
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Select Subject:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {getSubjectsForBatch(drilldownBatch).map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setDrilldownSubjectId(sub.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                        currentDrilldownSubject?.id === sub.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      {getSubjectIcon(sub.id)}
                      <span>{sub.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drilldown Summary Card */}
            {currentDrilldownSubject && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">
                    Batch {drilldownBatch}
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
                    {currentDrilldownSubject.name} Register
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900">
                    {currentDrilldownLog?.percentage || 0}%
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">
                    {currentDrilldownLog?.completedCount || 0} Topics Done
                  </div>
                </div>
              </div>
            )}

            {/* Subtopics Register */}
            {currentDrilldownSubject && (
              <div className="space-y-3">
                {currentDrilldownSubject.chapters.map(ch => {
                  const chCompleted = ch.subtopics.filter(st => currentDrilldownLog?.subtopics?.[st.id]?.completed).length;
                  const isAllDone = chCompleted === ch.subtopics.length && ch.subtopics.length > 0;

                  return (
                    <div 
                      key={ch.id} 
                      className={`bg-white rounded-2xl border overflow-hidden shadow-xs ${
                        isAllDone ? 'border-emerald-200' : 'border-slate-200'
                      }`}
                    >
                      <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {ch.number}
                          </span>
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                            {ch.title}
                          </h4>
                        </div>

                        <span className="text-[11px] font-bold text-slate-600 shrink-0">
                          {chCompleted}/{ch.subtopics.length} Done
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {ch.subtopics.map(sub => {
                          const prog = currentDrilldownLog?.subtopics?.[sub.id];
                          const isDone = !!prog?.completed;

                          return (
                            <div key={sub.id} className="p-2.5 px-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  isDone ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                                }`}>
                                  {isDone && '✓'}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">
                                      {sub.code}
                                    </span>
                                    <span className={`text-xs font-bold truncate ${isDone ? 'text-slate-900' : 'text-slate-700'}`}>
                                      {sub.title}
                                    </span>
                                  </div>
                                  {prog?.notes && (
                                    <p className="text-[10px] text-slate-500 italic mt-0.5">
                                      "{prog.notes}"
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0 text-xs">
                                {isDone ? (
                                  <div>
                                    <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                                      {prog.teacherName || 'Teacher'}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-300 text-[11px]">Pending</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </section>
        )}

        {/* VIEW 3: LIVE TIMELINE */}
        {viewMode === 'activity' && (
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Live Activity Feed</h3>
              <p className="text-[11px] text-slate-500">Real-time log of topics covered across classrooms</p>
            </div>

            {recentActivities.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No activity recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentActivities.map((act, idx) => (
                  <div key={idx} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                        {act.teacher?.charAt(0) || 'T'}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                          <strong className="font-bold text-slate-900">{act.teacher}</strong>
                          <span className="text-slate-400">marked</span>
                          <span className="font-bold text-blue-700 bg-blue-50 px-1 rounded">
                            {act.subtopicCode}
                          </span>
                          <span className="text-slate-400">for</span>
                          <span className="font-bold bg-slate-100 text-slate-800 px-1 rounded text-[11px]">
                            Batch {act.batch} ({act.subjectName})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">
                          {act.subtopicTitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 text-[10px] text-slate-400">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

      </main>

    </div>
  );
}
