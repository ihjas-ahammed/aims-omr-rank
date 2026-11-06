import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusOneStudentRecord,
  fetchAllPlusOneProgress, 
  deletePlusOneProgressRecord, 
  exportPlusOneProgressToExcel 
} from '../../../services/plusOneStudyProgressService';
import { 
  PlusOneBatch, 
  getScheduleForBatch, 
  getTodayDateString,
  getExamCountdowns 
} from '../../../data/plusOneStudyData';
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Trash2, 
  Users, 
  Check, 
  RefreshCw, 
  Zap, 
  Calculator, 
  X, 
  ExternalLink, 
  Eye, 
  Award, 
  Share2
} from 'lucide-react';

interface PlusOneStudyProgressAdminProps {
  onBack?: () => void;
  hideBack?: boolean;
}

export default function PlusOneStudyProgressAdmin({ onBack, hideBack = false }: PlusOneStudyProgressAdminProps) {
  const [records, setRecords] = useState<PlusOneStudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState<'ALL' | PlusOneBatch>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'ON_TRACK' | 'BEHIND'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'percentage' | 'batch'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modals
  const [inspectRecord, setInspectRecord] = useState<PlusOneStudentRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const countdownA1 = useMemo(() => getExamCountdowns('A1'), []);
  const countdownA2 = useMemo(() => getExamCountdowns('A2'), []);

  useEffect(() => {
    document.title = 'Admin • Plus One Study Progress';
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllPlusOneProgress();
      setRecords(data);
    } catch (e) {
      console.error(e);
      alert('Failed to load student progress records.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the record for "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deletePlusOneProgressRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      if (inspectRecord?.id === id) setInspectRecord(null);
    } catch (e) {
      console.error(e);
      alert('Failed to delete student record.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportPlusOneProgressToExcel(processedRecords);
    } catch (e) {
      console.error(e);
      alert('Failed to export to Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyFormLink = () => {
    const url = `${window.location.origin}/form/progress/plusone`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = records.length;
    const a1Count = records.filter(r => r.batch === 'A1').length;
    const a2Count = records.filter(r => r.batch === 'A2').length;

    const totalPct = records.reduce((acc, r) => acc + (r.overallPercentage || 0), 0);
    const avgPercentage = total > 0 ? Math.round(totalPct / total) : 0;

    const todayCompletedCount = records.filter(r => r.todayFocusCompleted).length;
    const masterCompletedCount = records.filter(r => (r.overallPercentage || 0) >= 100).length;

    return { total, a1Count, a2Count, avgPercentage, todayCompletedCount, masterCompletedCount };
  }, [records]);

  // Processed (filtered & sorted) records
  const processedRecords = useMemo(() => {
    return records
      .filter(r => {
        if (batchFilter !== 'ALL' && r.batch !== batchFilter) return false;

        if (statusFilter === 'COMPLETED' && (r.overallPercentage || 0) < 100) return false;
        if (statusFilter === 'ON_TRACK' && ((r.overallPercentage || 0) < 40 || (r.overallPercentage || 0) >= 100)) return false;
        if (statusFilter === 'BEHIND' && (r.overallPercentage || 0) >= 40) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = r.studentName.toLowerCase().includes(q);
          const matchPhone = (r.phoneNumber || '').includes(q);
          if (!matchName && !matchPhone) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'date') {
          diff = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        } else if (sortBy === 'percentage') {
          diff = (b.overallPercentage || 0) - (a.overallPercentage || 0);
        } else if (sortBy === 'name') {
          diff = a.studentName.localeCompare(b.studentName);
        } else if (sortBy === 'batch') {
          diff = a.batch.localeCompare(b.batch);
        }
        return sortOrder === 'asc' ? -diff : diff;
      });
  }, [records, batchFilter, statusFilter, searchQuery, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-slate-900 font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display',system-ui,sans-serif] pb-20 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            {!hideBack && (
              <button
                type="button"
                onClick={onBack || (() => window.history.back())}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <img 
                src="/aims_plus_logo.png" 
                alt="AIMS Plus" 
                className="h-6 sm:h-7 w-auto object-contain shrink-0" 
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo1.png'; }} 
              />
              <div className="h-4 w-px bg-slate-200 shrink-0" />
              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  Plus One Study Progress Admin
                </h1>
                <p className="text-[11px] text-slate-500">
                  Batches A1 & A2 • Live Monitor
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyFormLink}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedLink ? 'Copied' : 'Form Link'}</span>
            </button>

            <a
              href="/form/progress/plusone"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
              title="Open Student Form"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExporting || records.length === 0}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Export Excel'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* ========================================================================= */}
        {/* KPI OVERVIEW CARDS (Minimalist Apple Style) */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Enrolled Students
            </span>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-[11px] text-slate-500">
              A1: {stats.a1Count} • A2: {stats.a2Count}
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Avg Completion
            </span>
            <div className="text-2xl font-bold text-blue-600">{stats.avgPercentage}%</div>
            <div className="text-[11px] text-slate-500">Syllabus covered</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Today's Focus Done
            </span>
            <div className="text-2xl font-bold text-emerald-600">{stats.todayCompletedCount}</div>
            <div className="text-[11px] text-slate-500">Active today</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              100% Finished
            </span>
            <div className="text-2xl font-bold text-slate-900">{stats.masterCompletedCount}</div>
            <div className="text-[11px] text-slate-500">All chapters complete</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Phy Exam (A1)
            </span>
            <div className="text-2xl font-bold text-slate-900">
              {countdownA1.physics.isToday ? 'Today' : countdownA1.physics.isPast ? 'Done' : `${countdownA1.physics.daysRemaining}d`}
            </div>
            <div className="text-[11px] text-slate-500">{countdownA1.physics.dateDisplay}</div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Maths Exam
            </span>
            <div className="text-2xl font-bold text-slate-900">
              {countdownA1.maths.isToday ? 'Today' : countdownA1.maths.isPast ? 'Done' : `${countdownA1.maths.daysRemaining}d`}
            </div>
            <div className="text-[11px] text-slate-500">{countdownA1.maths.dateDisplay}</div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* CONTROLS BAR: SEARCH, BATCH FILTER, STATUS FILTER */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
          
          {/* Search bar */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or phone..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            
            {/* Batch Filter */}
            <div className="flex p-0.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
              {(['ALL', 'A1', 'A2'] as const).map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBatchFilter(b)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    batchFilter === b ? 'bg-white text-slate-900 shadow-sm font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  {b === 'ALL' ? 'All' : `Batch ${b}`}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">100% Completed</option>
              <option value="ON_TRACK">On Track (40%+)</option>
              <option value="BEHIND">Behind (&lt;40%)</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={`${sortBy}_${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('_');
                setSortBy(sb as any);
                setSortOrder(so as any);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="date_desc">Recent activity</option>
              <option value="percentage_desc">Highest progress</option>
              <option value="percentage_asc">Lowest progress</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="batch_asc">Batch</option>
            </select>

          </div>

        </section>

        {/* ========================================================================= */}
        {/* STUDENT RECORDS TABLE */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{processedRecords.length} of {records.length} Students</span>
            <span className="text-slate-400">Live Database Sync</span>
          </div>

          {loading ? (
            <div className="p-12 text-center space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading records...</p>
            </div>
          ) : processedRecords.length === 0 ? (
            <div className="p-12 text-center space-y-1">
              <Users className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">No Student Records Found</p>
              <p className="text-xs text-slate-400">
                Share the student registration link to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Batch</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Overall Syllabus</th>
                    <th className="py-3 px-4">Physics</th>
                    <th className="py-3 px-4">Maths</th>
                    <th className="py-3 px-4">Today's Focus</th>
                    <th className="py-3 px-4">Last Active</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {processedRecords.map((r, index) => {
                    const isDeletThis = deletingId === r.id;

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {index + 1}
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <button
                            type="button"
                            onClick={() => setInspectRecord(r)}
                            className="hover:text-blue-600 text-left transition-colors cursor-pointer"
                          >
                            {r.studentName}
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            Batch {r.batch}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {r.phoneNumber ? (
                            <a
                              href={`https://wa.me/91${r.phoneNumber.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-blue-600 transition-colors"
                            >
                              {r.phoneNumber}
                            </a>
                          ) : '—'}
                        </td>

                        {/* Overall Progress */}
                        <td className="py-3 px-4">
                          <div className="space-y-1 w-28">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-slate-900">{r.overallPercentage}%</span>
                              <span className="text-slate-400 text-[10px]">{r.completedChaptersCount}/{r.totalChaptersCount}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#0071e3] h-full rounded-full"
                                style={{ width: `${r.overallPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-indigo-600">
                            {r.physicsPercentage}%
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-blue-600">
                            {r.mathsPercentage}%
                          </span>
                        </td>

                        {/* Today's Focus */}
                        <td className="py-3 px-4">
                          {r.todayFocusCompleted ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center gap-1">
                              <Check className="w-2.5 h-2.5 stroke-[3]" /> Done
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Last Active */}
                        <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                          {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setInspectRecord(r)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Inspect Checklist"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              disabled={isDeletThis}
                              onClick={() => handleDelete(r.id, r.studentName)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>

      {/* ========================================================================= */}
      {/* DETAIL INSPECTION MODAL (Clean Apple Sheet Style) */}
      {/* ========================================================================= */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-h-[85vh] flex flex-col space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{inspectRecord.studentName}</h3>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700">
                    Batch {inspectRecord.batch}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phone: {inspectRecord.phoneNumber} • Overall: <strong className="text-slate-900">{inspectRecord.overallPercentage}%</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checklist breakdown */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 text-xs">
              {(() => {
                const schedule = getScheduleForBatch(inspectRecord.batch);
                return schedule.items.map((item, idx) => {
                  const isExam = item.isExam;
                  const entry = inspectRecord.progress[item.id];
                  const isDone = !!entry?.completed;

                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 ${
                        isExam
                          ? 'bg-slate-50 border-slate-200 text-slate-500'
                          : isDone
                            ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                            : 'bg-white border-slate-200/70 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isDone ? 'bg-[#34c759] text-white' : 'border border-slate-300 text-slate-400'
                        }`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div className="truncate">
                          <span className="font-medium text-slate-900 truncate block">{item.title}</span>
                          <span className="text-[10px] text-slate-400">Due: {item.dateFormatted}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold shrink-0 text-slate-500">
                        {isExam ? 'Exam' : isDone ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectRecord(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
