import React, { useState, useEffect, useMemo } from 'react';
import { 
  ImprovementStudentProgressRecord,
  fetchAllImprovementProgress, 
  deleteImprovementProgressRecord,
  exportImprovementProgressToExcel,
  ImprovementBatch,
  getTodayDateKey,
  getWeeklyGoalStatus,
  IMPROVEMENT_WEEKLY_SCHEDULE,
  WeeklyGoalStatus
} from '../../../services/improvementStudyProgressService';
import { 
  ALL_IMPROVEMENT_SUBJECTS, 
  AVAILABLE_IMPROVEMENT_OPTIONS,
  getImprovementSubjectList,
  ImprovementSubjectDef 
} from '../../../data/improvementStudyProgressData';
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Trash2, 
  Filter, 
  Info, 
  Users, 
  BookOpen, 
  Layers, 
  Copy, 
  Check, 
  Share2, 
  Moon, 
  Sparkles, 
  MessageSquare, 
  RefreshCw,
  Zap,
  FlaskConical,
  Dna,
  Calculator,
  Cpu,
  Flame,
  X,
  ExternalLink,
  Eye,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  ListOrdered,
  Target,
  Clock,
  Flag,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

interface ImprovementStudyProgressAdminProps {
  onBack?: () => void;
  hideBack?: boolean;
}

const ALL_SUBJECT_KEYS = [
  'physics',
  'chemistry',
  'biology',
  'mathematics',
  'computer_science',
  'english',
  'language'
];

export default function ImprovementStudyProgressAdmin({ onBack, hideBack = false }: ImprovementStudyProgressAdminProps) {
  const [records, setRecords] = useState<ImprovementStudentProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState<'ALL' | ImprovementBatch>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [goalFilter, setGoalFilter] = useState<'ALL' | 'ON_TRACK' | 'BEHIND' | 'AHEAD'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'percentage' | 'streak'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Copy modal & states
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Inspect modal
  const [inspectRecord, setInspectRecord] = useState<ImprovementStudentProgressRecord | null>(null);

  const activeMilestone = useMemo(() => getWeeklyGoalStatus(0).currentWeek, []);

  useEffect(() => {
    document.title = 'Admin • Improvement Study Progress';
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllImprovementProgress();
      setRecords(data);
    } catch (e) {
      console.error(e);
      alert('Failed to load improvement student records.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the record for "${name}"? This action cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteImprovementProgressRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
      if (inspectRecord?.id === id) setInspectRecord(null);
    } catch (e) {
      console.error(e);
      alert('Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = records.length;
    const b1 = records.filter(r => r.studentClass === 'B1').length;
    const b2 = records.filter(r => r.studentClass === 'B2').length;
    const b3 = records.filter(r => r.studentClass === 'B3').length;

    const subjectCounts: Record<string, number> = {};
    ALL_SUBJECT_KEYS.forEach(sub => {
      subjectCounts[sub] = records.filter(r => 
        r.selectedSubjects && r.selectedSubjects.some(s => s.toLowerCase().includes(sub.toLowerCase()))
      ).length;
    });

    const totalPercentageSum = records.reduce((acc, r) => acc + (r.overallPercentage || 0), 0);
    const avgPercentage = total > 0 ? Math.round(totalPercentageSum / total) : 0;
    const todayStudiedCount = records.filter(r => !!r.todayStudied).length;

    const targetPct = activeMilestone.targetPercentage;
    const onTrackCount = records.filter(r => (r.overallPercentage || 0) >= targetPct).length;
    const behindCount = records.filter(r => (r.overallPercentage || 0) < targetPct).length;

    return { total, b1, b2, b3, subjectCounts, avgPercentage, todayStudiedCount, onTrackCount, behindCount };
  }, [records, activeMilestone]);

  // Filter & sort
  const processedRecords = useMemo(() => {
    let result = [...records];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.studentName.toLowerCase().includes(q) || 
        (r.phoneNumber && r.phoneNumber.includes(q)) ||
        (r.selectedSubjects && r.selectedSubjects.some(s => s.toLowerCase().includes(q)))
      );
    }

    if (batchFilter !== 'ALL') {
      result = result.filter(r => r.studentClass === batchFilter);
    }

    if (subjectFilter !== 'ALL') {
      result = result.filter(r => 
        r.selectedSubjects && r.selectedSubjects.some(s => s.toLowerCase().includes(subjectFilter.toLowerCase()))
      );
    }

    if (goalFilter === 'ON_TRACK') {
      result = result.filter(r => (r.overallPercentage || 0) >= activeMilestone.targetPercentage);
    } else if (goalFilter === 'BEHIND') {
      result = result.filter(r => (r.overallPercentage || 0) < activeMilestone.targetPercentage);
    } else if (goalFilter === 'AHEAD') {
      result = result.filter(r => (r.overallPercentage || 0) > activeMilestone.targetPercentage);
    }

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.studentName.localeCompare(b.studentName) 
          : b.studentName.localeCompare(a.studentName);
      } else if (sortBy === 'percentage') {
        const pA = a.overallPercentage || 0;
        const pB = b.overallPercentage || 0;
        return sortOrder === 'desc' ? pB - pA : pA - pB;
      } else if (sortBy === 'streak') {
        const sA = a.studyStreak || 0;
        const sB = b.studyStreak || 0;
        return sortOrder === 'desc' ? sB - sA : sA - sB;
      } else {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
    });

    return result;
  }, [records, searchQuery, batchFilter, subjectFilter, goalFilter, activeMilestone, sortBy, sortOrder]);

  const toggleSort = (type: 'date' | 'name' | 'percentage' | 'streak') => {
    if (sortBy === type) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder(type === 'name' ? 'asc' : 'desc');
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch (e) {
      alert('Failed to copy to clipboard.');
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/form/improvement`;
    copyToClipboard(url, 'link');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Helper generators for Copy Modal
  const generateNamesList = (items: ImprovementStudentProgressRecord[]) => {
    return items.map(r => r.studentName.toUpperCase()).join('\n');
  };

  const generateWhatsAppMessage = () => {
    let msg = `*AIMS PLUS - Improvement Study Progress & Weekly Target Report*\n`;
    msg += `Date: ${new Date().toLocaleDateString()}\n`;
    msg += `🎯 Current Target: Week ${activeMilestone.weekNumber} (${activeMilestone.targetPercentage}% by ${activeMilestone.targetDateFormatted})\n`;
    msg += `Total Students: ${processedRecords.length}\n`;
    if (batchFilter !== 'ALL') msg += `Batch: Class ${batchFilter}\n`;
    if (subjectFilter !== 'ALL') msg += `Subject: ${subjectFilter.toUpperCase()}\n`;
    if (goalFilter !== 'ALL') msg += `Filter: ${goalFilter}\n`;
    msg += `----------------------------------------\n\n`;

    processedRecords.forEach((r, idx) => {
      const goal = r.weeklyGoalStatus || getWeeklyGoalStatus(r.overallPercentage || 0);
      msg += `${idx + 1}. *${r.studentName.toUpperCase()}* (Class ${r.studentClass}) - *${r.overallPercentage || 0}%*\n`;
      msg += `   • 🎯 Sep 7 Goal (20%): ${goal.isCompleted ? '✅ On Track' : `⏳ Need +${Math.abs(goal.deltaPercentage)}%`} | Streak: 🔥 ${r.studyStreak || 0}d\n`;
      msg += `   • Studied Today: ${r.todayStudied ? '✅ YES' : '❌ NO'}\n`;
      msg += `   • Subjects: ${(r.selectedSubjects || []).join(', ')}\n`;
      msg += `   • Phone / Passkey: ${r.phoneNumber}\n\n`;
    });

    return msg;
  };

  const generateTabSeparatedData = () => {
    let tsv = `No\tName (ALL CAPS)\tBatch\tPhone\tToday Studied\tStreak\tWeekly Goal Status\tSubjects\tOverall %\tDate\n`;
    processedRecords.forEach((r, idx) => {
      const goal = r.weeklyGoalStatus || getWeeklyGoalStatus(r.overallPercentage || 0);
      tsv += `${idx + 1}\t${r.studentName.toUpperCase()}\t${r.studentClass}\t${r.phoneNumber}\t${r.todayStudied ? 'YES' : 'NO'}\t${r.studyStreak || 0}\t${goal.statusText}\t${(r.selectedSubjects || []).join(', ')}\t${r.overallPercentage || 0}%\t${r.updatedAt || ''}\n`;
    });
    return tsv;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-gray-200/80 p-5 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          {!hideBack && onBack && (
            <button
              onClick={onBack}
              className="p-2.5 hover:bg-slate-100 rounded-2xl transition-colors text-gray-600 hover:text-gray-900 cursor-pointer border border-transparent hover:border-gray-200 shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <img 
            src="/aims_plus_icon.png" 
            alt="AIMS Plus Logo" 
            className="w-11 h-11 rounded-2xl object-contain bg-slate-900 border border-slate-200 p-0.5 shadow-sm shrink-0" 
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Improvement Study Progress</h2>
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-black rounded-full">
                {records.length} Students
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              NCERT topic-level progress & daily study check-in matrix for Plus One Bio-Science and Computer Science students.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Share Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 cursor-pointer"
            title="Copy Student Portal Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Form'}</span>
          </button>

          {/* Copy Data Button */}
          <button
            onClick={() => setShowCopyModal(true)}
            disabled={processedRecords.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all border border-indigo-200/80 cursor-pointer disabled:opacity-50"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Lists / WhatsApp</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={() => exportImprovementProgressToExcel(processedRecords, batchFilter, subjectFilter)}
            disabled={processedRecords.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          {/* Refresh */}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
            title="Reload Records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Total Students</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">{stats.total}</span>
          <span className="text-[10px] text-indigo-600 font-bold mt-0.5 block">Enrolled Candidates</span>
        </div>

        <div className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Studied Today
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats.todayStudiedCount}</span>
          <span className="text-[10px] text-gray-500 font-semibold mt-0.5 block">Daily Check-ins</span>
        </div>

        <div className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block flex items-center gap-1">
            <Target className="w-3 h-3 text-emerald-600" /> Week 1 On Track
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{stats.onTrackCount}</span>
          <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">≥ {activeMilestone.targetPercentage}% by {activeMilestone.targetDateShort}</span>
        </div>

        <div className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" /> Needs Push
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{stats.behindCount}</span>
          <span className="text-[10px] text-amber-700 font-bold mt-0.5 block">&lt; {activeMilestone.targetPercentage}% Milestone</span>
        </div>

        <div className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Avg Progress</span>
          <span className="text-2xl font-black text-indigo-600 mt-1 block">{stats.avgPercentage}%</span>
          <span className="text-[10px] text-gray-500 font-semibold mt-0.5 block">Across Chosen Topics</span>
        </div>

        <div className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Class Batches</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-black text-gray-800">B1: {stats.b1}</span>
            <span className="text-xs font-black text-gray-800">B2: {stats.b2}</span>
            <span className="text-xs font-black text-gray-800">B3: {stats.b3}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-medium mt-1 block">Class Distribution</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200/80 p-4 rounded-3xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name (ALL CAPS), phone passkey, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Batch Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto shrink-0">
            {(['ALL', 'B1', 'B2', 'B3'] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBatchFilter(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  batchFilter === b
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-slate-200'
                }`}
              >
                {b === 'ALL' ? 'All Batches' : `Class ${b}`}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Goal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-2.5">
          <span className="text-gray-400 font-bold text-[11px] uppercase mr-1 flex items-center gap-1 shrink-0">
            <Target className="w-3 h-3 text-indigo-500" /> Goal (Sep 7: {activeMilestone.targetPercentage}%):
          </span>
          <button
            onClick={() => setGoalFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer ${
              goalFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
            }`}
          >
            All Students ({stats.total})
          </button>
          <button
            onClick={() => setGoalFilter('ON_TRACK')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
              goalFilter === 'ON_TRACK'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>On Track (≥{activeMilestone.targetPercentage}%)</span>
            <span className="px-1.5 py-0.2 bg-emerald-800 text-white rounded text-[10px]">
              {stats.onTrackCount}
            </span>
          </button>
          <button
            onClick={() => setGoalFilter('BEHIND')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
              goalFilter === 'BEHIND'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Needs Push (&lt;{activeMilestone.targetPercentage}%)</span>
            <span className="px-1.5 py-0.2 bg-amber-800 text-white rounded text-[10px]">
              {stats.behindCount}
            </span>
          </button>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-gray-400 font-bold text-[11px] uppercase mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3 h-3" /> Subject:
          </span>
          <button
            onClick={() => setSubjectFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer ${
              subjectFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
            }`}
          >
            All Subjects
          </button>
          {ALL_SUBJECT_KEYS.map((sub) => {
            const isSelected = subjectFilter === sub;
            const count = stats.subjectCounts[sub] || 0;
            return (
              <button
                key={sub}
                onClick={() => setSubjectFilter(sub)}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                }`}
              >
                <span>{sub.toUpperCase().replace('_', ' ')}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                  isSelected ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Student List */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white border border-gray-200 rounded-3xl">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-gray-600">Loading student improvement progress records...</p>
        </div>
      ) : processedRecords.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white border border-gray-200 rounded-3xl">
          <Info className="w-8 h-8 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No student records found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery || batchFilter !== 'ALL' || subjectFilter !== 'ALL'
              ? 'No student matches the current search or filters. Try adjusting your criteria.'
              : 'No students have registered yet. Share the registration link to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          
          {/* Table Header Controls */}
          <div className="flex items-center justify-between text-xs text-gray-500 px-2">
            <span>Showing <strong>{processedRecords.length}</strong> of <strong>{records.length}</strong> students</span>
            <div className="flex items-center gap-3">
              <span className="font-medium">Sort by:</span>
              <button
                onClick={() => toggleSort('date')}
                className={`font-bold transition ${sortBy === 'date' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => toggleSort('name')}
                className={`font-bold transition ${sortBy === 'name' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Name {sortBy === 'name' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => toggleSort('percentage')}
                className={`font-bold transition ${sortBy === 'percentage' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Progress % {sortBy === 'percentage' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
              <button
                onClick={() => toggleSort('streak')}
                className={`font-bold transition ${sortBy === 'streak' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Streak {sortBy === 'streak' && (sortOrder === 'desc' ? '↓' : '↑')}
              </button>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-gray-200/80 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-gray-200 text-xs font-bold uppercase tracking-wider">
                    <th className="px-4 py-3.5 text-center w-12">No.</th>
                    <th className="px-4 py-3.5">Student Name (ALL CAPS)</th>
                    <th className="px-3 py-3.5 text-center w-20">Class</th>
                    <th className="px-4 py-3.5">Phone / Passkey</th>
                    <th className="px-3 py-3.5 text-center w-28">Today Studied?</th>
                    <th className="px-3 py-3.5 text-center w-24">Streak</th>
                    <th className="px-4 py-3.5 text-center w-36">Weekly Goal (Sep 7: {activeMilestone.targetPercentage}%)</th>
                    <th className="px-4 py-3.5">Improvement Subjects</th>
                    <th className="px-4 py-3.5 text-center w-28">Progress %</th>
                    <th className="px-4 py-3.5 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {processedRecords.map((r, index) => {
                    const goal = r.weeklyGoalStatus || getWeeklyGoalStatus(r.overallPercentage || 0);

                    return (
                      <tr key={r.id || index} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3.5 text-center font-bold text-gray-400">{index + 1}</td>
                        <td className="px-4 py-3.5 font-extrabold text-gray-900 tracking-wide font-mono uppercase">
                          {r.studentName}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-bold text-xs">
                            {r.studentClass}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-gray-700 font-semibold">
                          {r.phoneNumber || 'N/A'}
                        </td>
                        <td className="px-3 py-3.5 text-center">
                          {r.todayStudied ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-md text-[10px] inline-flex items-center gap-1 shadow-sm">
                              <Check className="w-3 h-3 text-emerald-700 stroke-[3]" /> YES
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-bold rounded-md text-[10px]">
                              NO
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-center font-bold">
                          {r.studyStreak && r.studyStreak > 0 ? (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[11px] font-black inline-flex items-center gap-1">
                              🔥 {r.studyStreak}d
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black inline-flex items-center gap-1 border shadow-xs ${
                            goal.isCompleted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : goal.isOnTrack
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {goal.isCompleted ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                            )}
                            <span>{goal.isCompleted ? 'On Track' : `Need +${Math.abs(goal.deltaPercentage)}%`}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[260px]">
                            {(r.selectedSubjects || []).map(sub => (
                              <span key={sub} className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold">
                                {sub.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-black text-xs text-indigo-600">{r.overallPercentage || 0}%</span>
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                              <div 
                                className="bg-indigo-600 h-full rounded-full"
                                style={{ width: `${r.overallPercentage || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setInspectRecord(r)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                              title="Inspect Student Progress"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(r.id, r.studentName)}
                              disabled={deletingId === r.id}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 px-5 py-3.5 border-t border-gray-200 text-xs text-gray-500 font-medium flex justify-between items-center">
              <span>Showing {processedRecords.length} of {records.length} improvement students</span>
              <span>AIMS Plus Academic Evaluation Portal</span>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {processedRecords.map((r, index) => {
              const goal = r.weeklyGoalStatus || getWeeklyGoalStatus(r.overallPercentage || 0);

              return (
                <div key={r.id || index} className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded font-bold text-[10px]">
                          {r.studentClass}
                        </span>
                        <h4 className="font-extrabold text-gray-900 uppercase font-mono tracking-wide text-sm">
                          {r.studentName}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">📞 {r.phoneNumber || 'N/A'}</p>
                    </div>
                    <span className="text-base font-black text-indigo-600 shrink-0">
                      {r.overallPercentage || 0}%
                    </span>
                  </div>

                  {/* Badges Row */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black inline-flex items-center gap-1 border ${
                      goal.isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : goal.isOnTrack
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {goal.isCompleted ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                      )}
                      <span>Goal: {goal.isCompleted ? 'On Track' : `Need +${Math.abs(goal.deltaPercentage)}%`}</span>
                    </span>

                    {r.todayStudied && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-md text-[10px] inline-flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700 stroke-[3]" /> Studied Today
                      </span>
                    )}

                    {r.studyStreak && r.studyStreak > 0 ? (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-black inline-flex items-center gap-1">
                        🔥 {r.studyStreak}d Streak
                      </span>
                    ) : null}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full"
                      style={{ width: `${r.overallPercentage || 0}%` }}
                    />
                  </div>

                  {/* Subjects & Action */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(r.selectedSubjects || []).map(sub => (
                        <span key={sub} className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                          {sub.toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setInspectRecord(r)}
                        className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold text-xs transition cursor-pointer"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleDelete(r.id, r.studentName)}
                        disabled={deletingId === r.id}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. COPY DATA MODAL */}
      {/* ========================================================================= */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Copy className="w-5 h-5 text-indigo-600" />
                  <span>Copy Lists & WhatsApp Format</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Quickly copy formatted lists to paste into WhatsApp groups or Sheets.</p>
              </div>
              <button
                onClick={() => setShowCopyModal(false)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Option 1: Names in ALL CAPS */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-bold text-gray-900 block">Copy Student Names Only (ALL CAPS)</span>
                  <span className="text-xs text-gray-500">List of names, one per line (Total: {processedRecords.length})</span>
                </div>
                <button
                  onClick={() => copyToClipboard(generateNamesList(processedRecords), 'names_only')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer shrink-0"
                >
                  {copiedKey === 'names_only' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'names_only' ? 'Copied!' : 'Copy Names'}</span>
                </button>
              </div>

              {/* Option 2: WhatsApp Format */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-bold text-gray-900 block">Copy WhatsApp Progress Summary</span>
                  <span className="text-xs text-gray-500">Ready to send directly in WhatsApp Class Groups</span>
                </div>
                <button
                  onClick={() => copyToClipboard(generateWhatsAppMessage(), 'whatsapp')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer shrink-0"
                >
                  {copiedKey === 'whatsapp' ? <Check className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'whatsapp' ? 'Copied!' : 'Copy WhatsApp'}</span>
                </button>
              </div>

              {/* Option 3: TSV Data for Sheets */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-bold text-gray-900 block">Copy for Google Sheets (TSV)</span>
                  <span className="text-xs text-gray-500">Tab-separated rows, paste directly with Ctrl+V into sheets</span>
                </div>
                <button
                  onClick={() => copyToClipboard(generateTabSeparatedData(), 'tsv')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer shrink-0"
                >
                  {copiedKey === 'tsv' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'tsv' ? 'Copied!' : 'Copy TSV'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STUDENT DETAIL INSPECTION MODAL */}
      {/* ========================================================================= */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md font-bold text-xs">
                    Class {inspectRecord.studentClass}
                  </span>
                  <h3 className="text-xl font-black text-white uppercase font-mono tracking-wide">
                    {inspectRecord.studentName}
                  </h3>
                  {inspectRecord.todayStudied && (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black rounded-full">
                      ✓ Studied Today
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  📞 Passkey: {inspectRecord.phoneNumber} • Completion: <strong className="text-indigo-400">{inspectRecord.overallPercentage}%</strong> • Streak: <strong className="text-amber-400">🔥 {inspectRecord.studyStreak || 0} days</strong>
                </p>
              </div>
              <button
                onClick={() => setInspectRecord(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 5-Week Milestone Progress */}
            {(() => {
              const goal = inspectRecord.weeklyGoalStatus || getWeeklyGoalStatus(inspectRecord.overallPercentage || 0);
              return (
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        5-Week Target Milestone (Sep 1 – Oct 5)
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
                      goal.isCompleted 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {goal.statusText}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {goal.milestones.map((m) => {
                      const isPassedOrDone = m.status === 'completed';
                      return (
                        <div
                          key={m.weekNumber}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            isPassedOrDone
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                              : m.isCurrentWeek
                                ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50'
                                : 'bg-slate-900/50 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <span className="text-[9px] font-black uppercase">W{m.weekNumber}</span>
                            {isPassedOrDone && <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />}
                          </div>
                          <div className="text-xs font-black text-white">{m.targetPercentage}%</div>
                          <div className="text-[9px] text-slate-400 font-medium truncate mt-0.5">{m.targetDateShort}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Subject Breakdowns */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Subject & NCERT Topic Breakdown ({inspectRecord.selectedSubjects?.length || 0} Subjects)
              </h4>

              <div className="space-y-3">
                {getImprovementSubjectList(inspectRecord.selectedSubjects, inspectRecord.secondLanguage, inspectRecord.languageChapterCount).map((subj) => {
                  const perc = inspectRecord.subjectPercentages?.[subj.id] || 0;
                  return (
                    <div key={subj.id} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{subj.nameEn}</span>
                        <span className="text-xs font-black text-indigo-400">{perc}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all"
                          style={{ width: `${perc}%` }}
                        ></div>
                      </div>

                      {/* Chapters Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                        {subj.chapters.map((ch) => {
                          const entry = inspectRecord.progress?.[ch.id] || { boxes: [], timestamps: [] };
                          const hasTopics = ch.topics && ch.topics.length > 0;
                          const totalT = hasTopics ? ch.topics!.length : (ch.totalBoxes || 1);
                          let doneT = 0;
                          for (let i = 0; i < totalT; i++) {
                            if (entry.boxes[i]) doneT++;
                          }
                          const isDone = doneT === totalT;

                          return (
                            <div 
                              key={ch.id}
                              className={`p-2.5 rounded-xl text-xs font-medium flex items-center justify-between gap-2 border ${
                                isDone 
                                  ? 'bg-emerald-950/20 text-emerald-300 border-emerald-500/20' 
                                  : doneT > 0 
                                    ? 'bg-slate-900 text-slate-300 border-slate-700' 
                                    : 'bg-slate-900/60 text-slate-500 border-slate-800'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <span className="block font-bold truncate">Ch {ch.chapterNumber}: {ch.titleEn}</span>
                                {hasTopics && (
                                  <span className="text-[10px] text-slate-400 block">
                                    {doneT} of {totalT} Topics Done
                                  </span>
                                )}
                              </div>
                              <span className="font-black shrink-0">{isDone ? '✓ 100%' : `${Math.round((doneT / totalT) * 100)}%`}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectRecord(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
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
