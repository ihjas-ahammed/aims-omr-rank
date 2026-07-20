import React, { useState, useEffect, useMemo } from 'react';
import { 
  StudentProgressRecord, 
  fetchAllStudentProgress, 
  deleteStudentProgressRecord, 
  fetchDeletedStudentProgress,
  restoreStudentProgressRecord,
  exportStudyProgressToExcel 
} from '../../../services/studyProgressService';
import { STUDY_SUBJECTS } from '../../../data/studyProgressData';
import { 
  ArrowLeft, 
  Search, 
  Trash2, 
  Users, 
  Award, 
  RefreshCw, 
  FileSpreadsheet, 
  BarChart, 
  Lock, 
  Key, 
  Clock,
  RotateCcw,
  Archive
} from 'lucide-react';

interface StudyProgressAdminProps {
  onBack?: () => void;
  hideBack?: boolean;
}

export default function StudyProgressAdmin({ onBack, hideBack = false }: StudyProgressAdminProps) {
  // Set document title
  useEffect(() => {
    document.title = 'Study Progress Admin';
  }, []);

  // Secret Key Check: requires key=aims2019 in hash or search
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    return hash.includes('key=aims2019') || search.includes('key=aims2019');
  });

  const [inputAdminKey, setInputAdminKey] = useState('');
  const [keyError, setKeyError] = useState('');

  const [records, setRecords] = useState<StudentProgressRecord[]>([]);
  const [deletedRecords, setDeletedRecords] = useState<StudentProgressRecord[]>([]);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedMediumFilter, setSelectedMediumFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'percentage'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal inspection state
  const [inspectRecord, setInspectRecord] = useState<StudentProgressRecord | null>(null);

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  const handleKeyAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputAdminKey.trim() === 'aims2019') {
      window.location.hash = '#admin?key=aims2019';
      setIsAuthorized(true);
      setKeyError('');
    } else {
      setKeyError('Invalid Admin Key. Access denied.');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllStudentProgress();
      setRecords(data);
      const archived = await fetchDeletedStudentProgress();
      setDeletedRecords(archived);
    } catch (e) {
      console.error('Failed to load study progress records:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to archive/delete "${name}"? Data will be backed up to database archive.`)) return;
    try {
      await deleteStudentProgressRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id && r.admissionNo !== id));
      if (inspectRecord?.id === id) setInspectRecord(null);
      const archived = await fetchDeletedStudentProgress();
      setDeletedRecords(archived);
    } catch (e) {
      alert('Failed to delete record.');
    }
  };

  const handleRestore = async (record: StudentProgressRecord) => {
    try {
      await restoreStudentProgressRecord(record);
      setDeletedRecords(prev => prev.filter(r => r.id !== record.id));
      await loadData();
      alert(`Restored "${record.studentName}" back to active roster!`);
    } catch (e) {
      alert('Failed to restore student record.');
    }
  };

  const classList = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => {
      if (r.studentClass) set.add(r.studentClass.trim());
    });
    return Array.from(set).sort();
  }, [records]);

  // Filtered & Sorted records
  const filteredRecords = useMemo(() => {
    let result = records.filter(r => {
      const queryLower = searchQuery.toLowerCase();
      const matchSearch = 
        r.studentName.toLowerCase().includes(queryLower) ||
        r.admissionNo.toLowerCase().includes(queryLower) ||
        r.studentClass.toLowerCase().includes(queryLower);

      const matchClass = selectedClass === 'ALL' || r.studentClass === selectedClass;
      const matchMedium = selectedMediumFilter === 'ALL' || r.medium === selectedMediumFilter;
      return matchSearch && matchClass && matchMedium;
    });

    result.sort((a, b) => {
      if (sortBy === 'name') {
        const comp = a.studentName.localeCompare(b.studentName);
        return sortOrder === 'asc' ? comp : -comp;
      }
      if (sortBy === 'percentage') {
        const comp = (a.overallPercentage || 0) - (b.overallPercentage || 0);
        return sortOrder === 'asc' ? comp : -comp;
      }
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [records, searchQuery, selectedClass, selectedMediumFilter, sortBy, sortOrder]);

  // Summary statistics
  const stats = useMemo(() => {
    const totalStudents = records.length;
    if (totalStudents === 0) {
      return { totalStudents: 0, avgPercentage: 0, topSubject: 'N/A' };
    }

    const avgPercentage = Math.round(
      records.reduce((acc, r) => acc + (r.overallPercentage || 0), 0) / totalStudents
    );

    const subjectSums: Record<string, number> = {};
    STUDY_SUBJECTS.forEach(s => { subjectSums[s.id] = 0; });

    records.forEach(r => {
      STUDY_SUBJECTS.forEach(s => {
        subjectSums[s.id] += (r.subjectPercentages?.[s.id] || 0);
      });
    });

    let topSubId = STUDY_SUBJECTS[0].id;
    let maxAvg = -1;
    Object.entries(subjectSums).forEach(([subId, sum]) => {
      const avg = sum / totalStudents;
      if (avg > maxAvg) {
        maxAvg = avg;
        topSubId = subId;
      }
    });

    const topSubjectName = STUDY_SUBJECTS.find(s => s.id === topSubId)?.nameEn || 'N/A';

    return {
      totalStudents,
      avgPercentage,
      topSubject: topSubjectName
    };
  }, [records]);

  const handleExportExcel = async () => {
    if (filteredRecords.length === 0) {
      alert('No student records available to export.');
      return;
    }
    await exportStudyProgressToExcel(filteredRecords);
  };

  // --- SECRET KEY PROMPT SCREEN ---
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <img src="/app_icon.png" alt="Study Progress Logo" className="w-12 h-12 rounded-2xl object-contain bg-slate-950 border border-slate-800 p-1 mx-auto mb-3 shadow-lg" />
            <h2 className="text-xl font-extrabold text-white">Study Progress Admin</h2>
            <p className="text-slate-400 text-xs">
              Enter the required admin secret key to view student study progress records.
            </p>
          </div>

          {keyError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold text-center">
              {keyError}
            </div>
          )}

          <form onSubmit={handleKeyAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" /> Admin Key
              </label>
              <input
                type="password"
                placeholder="Enter secret key"
                value={inputAdminKey}
                onChange={(e) => setInputAdminKey(e.target.value)}
                className="w-full h-12 px-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm font-medium"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-98"
            >
              Unlock Admin Portal
            </button>
          </form>

          {onBack && (
            <button
              onClick={onBack}
              className="w-full text-xs text-slate-400 hover:text-slate-200 text-center py-2 cursor-pointer"
            >
              ← Back to Student Form
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- AUTHORIZED ADMIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="bg-slate-900 rounded-2xl p-4 md:p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <img src="/app_icon.png" alt="Study Progress Logo" className="w-10 h-10 rounded-xl object-contain bg-slate-950 border border-slate-800 p-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-white">Study Progress Admin</h1>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-md">
                  Authorized
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Real-time student progress logs & Excel spreadsheet report generator
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowTrashModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer relative"
          >
            <Archive className="w-3.5 h-3.5" /> Archive Trash ({deletedRecords.length})
          </button>

          <button
            onClick={loadData}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg flex items-center gap-3.5">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registered</p>
            <h3 className="text-xl font-black text-white mt-0.5">{stats.totalStudents}</h3>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg flex items-center gap-3.5">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0">
            <BarChart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Progress</p>
            <h3 className="text-xl font-black text-indigo-400 mt-0.5">{stats.avgPercentage}%</h3>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Subject</p>
            <h3 className="text-xl font-black text-white mt-0.5">{stats.topSubject}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 rounded-2xl p-3.5 border border-slate-800 shadow-lg flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search student, adm no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Classes</option>
            {classList.map(cls => (
              <option key={cls} value={cls}>Class: {cls}</option>
            ))}
          </select>

          <select
            value={selectedMediumFilter}
            onChange={(e) => setSelectedMediumFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Mediums</option>
            <option value="English">English Medium</option>
            <option value="Malayalam">Malayalam Medium</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-') as ['date' | 'name' | 'percentage', 'asc' | 'desc'];
              setSortBy(sb);
              setSortOrder(so);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="percentage-desc">Highest %</option>
            <option value="percentage-asc">Lowest %</option>
            <option value="name-asc">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Roster View */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-7 h-7 animate-spin mx-auto text-indigo-500" />
            <p className="text-xs font-semibold">Loading student records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-1">
            <p className="text-sm font-bold text-white">No student records found</p>
            <p className="text-xs text-slate-500">Students can sign up at <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">/form/studyprogress</code></p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/60 border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Adm No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Medium</th>
                    <th className="py-3 px-4">Overall Completion</th>
                    <th className="py-3 px-4">Subject Breakdown</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300 font-medium">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{record.admissionNo}</td>
                      <td className="py-3.5 px-4 font-bold text-indigo-200">{record.studentName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md font-semibold text-[11px]">
                          {record.studentClass}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          record.medium === 'Malayalam' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {record.medium || 'English'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                            <div 
                              className="bg-indigo-500 h-full rounded-full"
                              style={{ width: `${record.overallPercentage || 0}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-indigo-400">{record.overallPercentage || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {STUDY_SUBJECTS.map(s => {
                            const p = record.subjectPercentages?.[s.id] || 0;
                            return (
                              <span 
                                key={s.id}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  p === 100 ? 'bg-emerald-500/20 text-emerald-300' : p > 0 ? 'bg-slate-800 text-slate-300' : 'bg-slate-900 text-slate-600'
                                }`}
                              >
                                {s.code}: {p}%
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {record.updatedAt ? new Date(record.updatedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setInspectRecord(record)}
                          className="px-2.5 py-1 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold mr-2 hover:bg-indigo-600/30 transition-all cursor-pointer"
                        >
                          Inspect Timestamps
                        </button>
                        <button
                          onClick={() => handleDelete(record.id, record.studentName)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Archive / Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="block md:hidden divide-y divide-slate-800 p-3 space-y-3">
              {filteredRecords.map((record) => (
                <div key={record.id} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm flex items-center gap-2">
                        {record.studentName}
                        <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">
                          {record.medium || 'English'}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Adm: {record.admissionNo} • Class: {record.studentClass}</p>
                    </div>
                    <span className="text-base font-black text-indigo-400">{record.overallPercentage || 0}%</span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full rounded-full"
                      style={{ width: `${record.overallPercentage || 0}%` }}
                    ></div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {STUDY_SUBJECTS.map(s => {
                      const p = record.subjectPercentages?.[s.id] || 0;
                      return (
                        <span 
                          key={s.id}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p === 100 ? 'bg-emerald-500/20 text-emerald-300' : p > 0 ? 'bg-slate-800 text-slate-300' : 'bg-slate-900 text-slate-600'
                          }`}
                        >
                          {s.code}: {p}%
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500">
                      {record.updatedAt ? new Date(record.updatedAt).toLocaleDateString() : 'N/A'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setInspectRecord(record)}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                      >
                        Inspect Timestamps
                      </button>
                      <button
                        onClick={() => handleDelete(record.id, record.studentName)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Inspect Student Modal */}
      {inspectRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-5 md:p-6 shadow-2xl text-white space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {inspectRecord.studentName}
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs rounded-md">
                    {inspectRecord.medium || 'English'} Medium
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Class: {inspectRecord.studentClass} • Adm No: {inspectRecord.admissionNo} • Overall: {inspectRecord.overallPercentage}%
                </p>
              </div>
              <button
                onClick={() => setInspectRecord(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {STUDY_SUBJECTS.map((subject) => {
                const isMl = inspectRecord.medium === 'Malayalam';
                const subName = isMl ? subject.nameMl : subject.nameEn;
                const subPerc = inspectRecord.subjectPercentages?.[subject.id] || 0;

                return (
                  <div key={subject.id} className="border border-slate-800 rounded-2xl p-3.5 space-y-2 bg-slate-950/50">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-xs text-white">{subName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md">
                        {subPerc}% Completed
                      </span>
                    </div>

                    <div className="space-y-2">
                      {subject.chapters.map((ch) => {
                        const entry = inspectRecord.progress?.[ch.id] || { boxes: [false, false, false], timestamps: [null, null, null] };
                        const boxes = entry.boxes;
                        const timestamps = entry.timestamps;
                        const chTitle = isMl ? ch.titleMl : ch.titleEn;

                        return (
                          <div key={ch.id} className="bg-slate-900 p-3 rounded-xl text-xs space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-slate-200">Ch {ch.chapterNumber}: {chTitle}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {Array.from({ length: ch.totalBoxes || 3 }).map((_, idx) => (
                                  <span
                                    key={idx}
                                    className={`w-6 h-6 rounded-lg font-bold text-[10px] flex items-center justify-center ${
                                      boxes[idx] ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-600'
                                    }`}
                                  >
                                    {boxes[idx] ? '✓' : (ch.totalBoxes || 3) === 1 ? '✓' : idx + 1}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className={`grid gap-1.5 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 ${(ch.totalBoxes || 3) === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}>
                              {Array.from({ length: ch.totalBoxes || 3 }).map((_, idx) => {
                                const isChecked = boxes[idx];
                                const ts = timestamps[idx];

                                return (
                                  <div key={idx} className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                                    <span>
                                      {(ch.totalBoxes || 3) === 1 ? 'Checkpoint' : `Box ${idx + 1}`}: {isChecked ? (ts ? new Date(ts).toLocaleString() : 'Ticked') : 'Pending'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectRecord(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trash / Archived Restore Modal */}
      {showTrashModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 md:p-6 shadow-2xl text-white space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Archive className="w-4 h-4 text-amber-400" /> Database Trash Archive ({deletedRecords.length})
                </h3>
                <p className="text-xs text-slate-400">Archived deleted student profiles are preserved safely in database.</p>
              </div>
              <button
                onClick={() => setShowTrashModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            {deletedRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Trash is empty. No deleted student records found.
              </div>
            ) : (
              <div className="space-y-3">
                {deletedRecords.map((r) => (
                  <div key={r.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white text-xs">{r.studentName} (Adm: {r.admissionNo})</h4>
                      <p className="text-[11px] text-slate-400">Class: {r.studentClass} • {r.medium} • Progress: {r.overallPercentage}%</p>
                    </div>

                    <button
                      onClick={() => handleRestore(r)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restore
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowTrashModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
