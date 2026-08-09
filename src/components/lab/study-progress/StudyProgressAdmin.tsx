import React, { useState, useEffect, useMemo } from 'react';
import { 
  StudentProgressRecord, 
  fetchAllStudentProgress, 
  deleteStudentProgressRecord, 
  fetchDeletedStudentProgress,
  restoreStudentProgressRecord,
  exportStudyProgressToExcel 
} from '../../../services/studyProgressService';
import { STUDY_SUBJECTS, getSubjectListForStudent } from '../../../data/studyProgressData';
import { 
  ArrowLeft, 
  Search, 
  Trash2, 
  Users, 
  Award, 
  RefreshCw, 
  FileSpreadsheet, 
  BarChart, 
  Clock,
  RotateCcw,
  Archive,
  FileCheck,
  MessageSquare,
  Send,
  Play,
  Pause,
  Settings,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Key,
  Printer,
  PhoneOff,
  Download
} from 'lucide-react';
import StudentReportModal, { generateOffscreenReportCanvas } from './StudentReportModal';
import WhatsAppSettingsModal from './WhatsAppSettingsModal';
import { 
  sendReportViaWhatsAppCloudAPI, 
  getBatchWhatsAppProgress, 
  saveBatchWhatsAppProgress, 
  clearBatchWhatsAppProgress, 
  BatchWhatsAppProgressState,
  formatWhatsAppPhoneNumber,
  isEligibleForBatchWhatsApp,
  isSentToday,
  getWeeklySendCount
} from '../../../utils/whatsappService';
import { updateStudentWhatsAppSent, updateStudentWhatsAppFailed } from '../../../services/studyProgressService';
import { downloadRosterPDF, downloadMissingNumbersPDF } from '../../../utils/pdfExportService';


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

  // Modal inspection & WhatsApp state
  const [inspectRecord, setInspectRecord] = useState<StudentProgressRecord | null>(null);
  const [reportRecord, setReportRecord] = useState<StudentProgressRecord | null>(null);
  const [showWASettings, setShowWASettings] = useState(false);
  const [showBatchWAModal, setShowBatchWAModal] = useState(false);
  const [showMissingNumbersModal, setShowMissingNumbersModal] = useState(false);
  const [showPrintRosterModal, setShowPrintRosterModal] = useState(false);
  const [sendingSingleWAId, setSendingSingleWAId] = useState<string | null>(null);

  // Phone filter state
  const [selectedPhoneFilter, setSelectedPhoneFilter] = useState<'ALL' | 'WITH_PHONE' | 'MISSING_PHONE'>('ALL');

  // Batch WhatsApp state
  const [batchClassFilter, setBatchClassFilter] = useState<string>('ALL');
  const [batchState, setBatchState] = useState<BatchWhatsAppProgressState | null>(() => getBatchWhatsAppProgress());
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [isBatchPaused, setIsBatchPaused] = useState(false);
  const [batchLogs, setBatchLogs] = useState<string[]>([]);


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

  // Single WhatsApp Dispatch Handler (with single-send guard & override)
  const handleSendSingleWhatsApp = async (record: StudentProgressRecord, forceOverride: boolean = false) => {
    const formattedPhone = formatWhatsAppPhoneNumber(record.phoneNumber);
    if (!formattedPhone) {
      alert(`Student "${record.studentName}" does not have a valid phone number registered.`);
      return;
    }

    if (record.whatsappSentAt && !forceOverride) {
      const sentDate = new Date(record.whatsappSentAt).toLocaleString();
      if (!window.confirm(`Scorecard was already sent to ${record.studentName} (${record.phoneNumber}) on ${sentDate}.\n\nDo you want to resend now?`)) {
        return;
      }
    }

    setSendingSingleWAId(record.id);

    try {
      const canvas = await generateOffscreenReportCanvas(record);
      const res = await sendReportViaWhatsAppCloudAPI(record, canvas);
      if (res.success) {
        const timestamp = new Date().toISOString();
        await updateStudentWhatsAppSent(record.id || record.admissionNo, timestamp);
        setRecords(prev => prev.map(r => (r.id === record.id || r.admissionNo === record.admissionNo) ? { ...r, whatsappSentAt: timestamp, whatsappFailedAt: undefined, whatsappError: undefined } : r));
        alert(`✓ Scorecard report sent successfully to ${record.studentName} (${formattedPhone})!`);
      } else {
        const timestamp = new Date().toISOString();
        await updateStudentWhatsAppFailed(record.id || record.admissionNo, res.message);
        setRecords(prev => prev.map(r => (r.id === record.id || r.admissionNo === record.admissionNo) ? { ...r, whatsappFailedAt: timestamp, whatsappError: res.message } : r));
        alert(`❌ WhatsApp API Error: ${res.message}`);
      }
    } catch (err: any) {
      alert(`Error sending WhatsApp message: ${err.message || err}`);
    } finally {
      setSendingSingleWAId(null);
    }
  };

  // Batch WhatsApp Dispatch Processor
  const handleStartBatchDispatch = async (resume: boolean = false) => {
    const targetStudents = records.filter(r => {
      if (batchClassFilter !== 'ALL' && r.studentClass !== batchClassFilter) return false;
      return true;
    });

    let sentNos: string[] = resume && batchState ? [...batchState.sentAdmissionNos] : [];
    let failedNos: string[] = resume && batchState ? [...batchState.failedAdmissionNos] : [];

    const eligibleStudents = targetStudents.filter(r => {
      if (sentNos.includes(r.admissionNo)) return false;
      const { eligible, reason } = isEligibleForBatchWhatsApp(r);
      if (!eligible && !resume) {
        return false;
      }
      return true;
    });

    if (eligibleStudents.length === 0) {
      alert(`No eligible students found in Class ${batchClassFilter}.\n\nPolicy rules:\n1. Must have valid phone number\n2. Cannot be sent twice on the same day\n3. Max 2 successful sends allowed per week.`);
      return;
    }

    setIsBatchRunning(true);
    setIsBatchPaused(false);

    const initialState: BatchWhatsAppProgressState = {
      targetClass: batchClassFilter,
      totalCount: eligibleStudents.length,
      completedCount: sentNos.length + failedNos.length,
      sentAdmissionNos: sentNos,
      failedAdmissionNos: failedNos,
      lastUpdated: new Date().toISOString(),
      isPaused: false
    };

    setBatchState(initialState);
    saveBatchWhatsAppProgress(initialState);

    for (let i = 0; i < eligibleStudents.length; i++) {
      const student = eligibleStudents[i];
      setBatchLogs(prev => [`[${new Date().toLocaleTimeString()}] Processing (${i + 1}/${eligibleStudents.length}): ${student.studentName} (Adm #${student.admissionNo})...`, ...prev]);

      try {
        const canvas = await generateOffscreenReportCanvas(student);
        const res = await sendReportViaWhatsAppCloudAPI(student, canvas);

        if (res.success) {
          const timestamp = new Date().toISOString();
          await updateStudentWhatsAppSent(student.id || student.admissionNo, timestamp);
          sentNos.push(student.admissionNo);

          setRecords(prev => prev.map(r => (r.id === student.id || r.admissionNo === student.admissionNo) ? { ...r, whatsappSentAt: timestamp, whatsappFailedAt: undefined, whatsappError: undefined } : r));
          setBatchLogs(prev => [`✓ Sent: ${student.studentName} (${student.phoneNumber})`, ...prev]);
        } else {
          const timestamp = new Date().toISOString();
          await updateStudentWhatsAppFailed(student.id || student.admissionNo, res.message);
          failedNos.push(student.admissionNo);
          setRecords(prev => prev.map(r => (r.id === student.id || r.admissionNo === student.admissionNo) ? { ...r, whatsappFailedAt: timestamp, whatsappError: res.message } : r));
          setBatchLogs(prev => [`❌ Failed: ${student.studentName} - ${res.message}`, ...prev]);
        }
      } catch (err: any) {
        const timestamp = new Date().toISOString();
        const errMsg = err.message || String(err);
        await updateStudentWhatsAppFailed(student.id || student.admissionNo, errMsg);
        failedNos.push(student.admissionNo);
        setRecords(prev => prev.map(r => (r.id === student.id || r.admissionNo === student.admissionNo) ? { ...r, whatsappFailedAt: timestamp, whatsappError: errMsg } : r));
        setBatchLogs(prev => [`❌ Error: ${student.studentName} - ${errMsg}`, ...prev]);
      }

      const updatedState: BatchWhatsAppProgressState = {
        targetClass: batchClassFilter,
        totalCount: targetStudents.length,
        completedCount: sentNos.length + failedNos.length,
        sentAdmissionNos: sentNos,
        failedAdmissionNos: failedNos,
        lastUpdated: new Date().toISOString(),
        isPaused: false
      };

      setBatchState(updatedState);
      saveBatchWhatsAppProgress(updatedState);

      // Delay 1.5s between sends to avoid API rate limits
      await new Promise(res => setTimeout(res, 1500));
    }

    setIsBatchRunning(false);
    setBatchLogs(prev => [`🎉 Batch Dispatch Completed! Sent: ${sentNos.length}, Failed: ${failedNos.length}`, ...prev]);
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
      
      const hasPhone = !!(r.phoneNumber && formatWhatsAppPhoneNumber(r.phoneNumber));
      const matchPhone = 
        selectedPhoneFilter === 'ALL' || 
        (selectedPhoneFilter === 'WITH_PHONE' && hasPhone) || 
        (selectedPhoneFilter === 'MISSING_PHONE' && !hasPhone);

      return matchSearch && matchClass && matchMedium && matchPhone;
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
  }, [records, searchQuery, selectedClass, selectedMediumFilter, selectedPhoneFilter, sortBy, sortOrder]);

  const missingPhoneRecords = useMemo(() => {
    return records.filter(r => {
      const matchClass = selectedClass === 'ALL' || r.studentClass === selectedClass;
      const hasPhone = !!(r.phoneNumber && formatWhatsAppPhoneNumber(r.phoneNumber));
      return matchClass && !hasPhone;
    }).sort((a, b) => a.studentClass.localeCompare(b.studentClass) || a.studentName.localeCompare(b.studentName));
  }, [records, selectedClass]);

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
            <img src="/app_icon.png?v=2" alt="AIMS Logo" className="w-12 h-12 rounded-2xl object-contain bg-slate-950 border border-slate-800 p-1 mx-auto mb-3 shadow-lg" />
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
            <img src="/app_icon.png?v=2" alt="AIMS Logo" className="w-10 h-10 rounded-xl object-contain bg-slate-950 border border-slate-800 p-0.5" />
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
            onClick={() => exportStudyProgressToExcel(filteredRecords)}
            className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel (.xlsx)
          </button>

          {/* Download Filtered Roster PDF Button */}
          <button
            onClick={() => downloadRosterPDF(filteredRecords, 'STUDENT STUDY PROGRESS ROSTER REPORT', { classFilter: selectedClass, mediumFilter: selectedMediumFilter, phoneFilter: selectedPhoneFilter, searchQuery })}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
            title="Download active filtered student list as clean vector PDF document"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Roster ({filteredRecords.length})</span>
          </button>

          {/* Missing Phone Numbers List & Print Button */}
          <button
            onClick={() => setShowMissingNumbersModal(true)}
            className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            title="Get and print list of students without registered phone numbers"
          >
            <PhoneOff className="w-4 h-4 text-rose-400" />
            <span>Missing Numbers ({missingPhoneRecords.length})</span>
          </button>

          {/* Batch WhatsApp Dispatch Button */}
          <button
            onClick={() => setShowBatchWAModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <MessageSquare className="w-4 h-4 fill-current text-white" />
            <span>Batch WhatsApp</span>
          </button>

          {/* WhatsApp Settings Button */}
          <button
            onClick={() => setShowWASettings(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Configure WhatsApp API Credentials & Caption"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
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
            value={selectedPhoneFilter}
            onChange={(e) => setSelectedPhoneFilter(e.target.value as 'ALL' | 'WITH_PHONE' | 'MISSING_PHONE')}
            className={`px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none cursor-pointer ${
              selectedPhoneFilter === 'MISSING_PHONE' 
                ? 'bg-rose-900/50 text-rose-200 border-rose-500 font-bold' 
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <option value="ALL">All Phone Status</option>
            <option value="WITH_PHONE">✓ Has Phone Number</option>
            <option value="MISSING_PHONE">⚠️ Missing Phone Number ({records.filter(r => !(r.phoneNumber && formatWhatsAppPhoneNumber(r.phoneNumber))).length})</option>
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
                    <th className="py-3 px-4">Phone No</th>
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
                      <td className="py-3.5 px-4 font-mono text-slate-300 text-xs">{record.phoneNumber || 'N/A'}</td>
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
                        {/* WhatsApp Single Send Button */}
                        <button
                          onClick={() => handleSendSingleWhatsApp(record)}
                          disabled={sendingSingleWAId === record.id}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold mr-2 transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95 ${
                            record.whatsappSentAt
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : record.whatsappFailedAt
                              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30 font-bold animate-pulse'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                          }`}
                          title={
                            record.whatsappSentAt
                              ? `Sent on ${new Date(record.whatsappSentAt).toLocaleString()}. Click to resend.`
                              : record.whatsappFailedAt
                              ? `Failed: ${record.whatsappError || 'Unknown Error'}. Click to retry.`
                              : 'Send Scorecard via WhatsApp'
                          }
                        >
                          {sendingSingleWAId === record.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <MessageSquare className="w-3.5 h-3.5 fill-current" />
                          )}
                          <span>
                            {record.whatsappSentAt ? 'Sent ✓' : record.whatsappFailedAt ? 'Failed ❌ (Retry)' : 'WhatsApp'}
                          </span>
                        </button>

                        <button
                          onClick={() => setReportRecord(record)}
                          className="px-2.5 py-1 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold mr-2 hover:bg-indigo-600/30 transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <FileCheck className="w-3.5 h-3.5" /> Study Report (PNG)
                        </button>
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
                      <p className="text-xs text-slate-400 mt-0.5">
                        Adm: {record.admissionNo} • Class: {record.studentClass} {record.phoneNumber ? `• Ph: ${record.phoneNumber}` : ''}
                      </p>
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
                    {getSubjectListForStudent(record.firstLanguage).map(s => {
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
                    <div className="flex flex-wrap items-center gap-1.5 justify-end">
                      <button
                        onClick={() => handleSendSingleWhatsApp(record)}
                        disabled={sendingSingleWAId === record.id}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 active:scale-95 transition-all ${
                          record.whatsappSentAt
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : record.whatsappFailedAt
                            ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md'
                        }`}
                        title={
                          record.whatsappSentAt
                            ? `Sent on ${new Date(record.whatsappSentAt).toLocaleString()}. Click to resend.`
                            : record.whatsappFailedAt
                            ? `Failed: ${record.whatsappError || 'Unknown Error'}. Click to retry.`
                            : 'Send Scorecard via WhatsApp'
                        }
                      >
                        {sendingSingleWAId === record.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <MessageSquare className="w-3.5 h-3.5 fill-current" />
                        )}
                        <span>
                          {record.whatsappSentAt ? 'Sent ✓' : record.whatsappFailedAt ? 'Failed ❌ (Retry)' : 'WhatsApp'}
                        </span>
                      </button>

                      <button
                        onClick={() => setReportRecord(record)}
                        className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                      >
                        <FileCheck className="w-3.5 h-3.5" /> Report PNG
                      </button>
                      <button
                        onClick={() => setInspectRecord(record)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer active:scale-95 transition-all"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleDelete(record.id, record.studentName)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer rounded-lg hover:bg-slate-800"
                        title="Archive / Delete Record"
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
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-md">
                    {inspectRecord.firstLanguage || 'Malayalam'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Class: {inspectRecord.studentClass} • Adm No: {inspectRecord.admissionNo} {inspectRecord.phoneNumber ? `• Phone: ${inspectRecord.phoneNumber}` : ''} • Overall: {inspectRecord.overallPercentage}%
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
              {getSubjectListForStudent(inspectRecord.firstLanguage).map((subject) => {
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

            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                onClick={() => {
                  const rec = inspectRecord;
                  setInspectRecord(null);
                  setReportRecord(rec);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" /> Download Study Report PNG
              </button>
              <button
                onClick={() => setInspectRecord(null)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
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

      {/* WhatsApp Settings Modal */}
      {showWASettings && (
        <WhatsAppSettingsModal
          onClose={() => setShowWASettings(false)}
        />
      )}

      {/* Batch WhatsApp Dispatch Modal */}
      {showBatchWAModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl text-white space-y-4 my-auto max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                  <MessageSquare className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Batch WhatsApp Scorecard Dispatch</h3>
                  <p className="text-xs text-slate-400">Send personalized scorecards to class rosters via Meta WhatsApp API</p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchWAModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Class Filter Selection */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Target Class / Batch
              </label>
              <select
                value={batchClassFilter}
                disabled={isBatchRunning}
                onChange={(e) => setBatchClassFilter(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
              >
                <option value="ALL">All Classes / Batches ({records.filter(r => r.phoneNumber).length} Eligible Phone Numbers)</option>
                {classList.map(cls => {
                  const cnt = records.filter(r => r.studentClass === cls && r.phoneNumber).length;
                  const unsentCnt = records.filter(r => r.studentClass === cls && r.phoneNumber && !r.whatsappSentAt).length;
                  return (
                    <option key={cls} value={cls}>
                      Class {cls} ({cnt} students with phone • {unsentCnt} unsent)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Resume Saved Unfinished Batch Alert */}
            {batchState && !isBatchRunning && batchState.completedCount < batchState.totalCount && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Unfinished Batch Progress Detected ({batchState.completedCount} / {batchState.totalCount} completed for Class {batchState.targetClass})
                </div>
                <p className="text-[11px] text-amber-200/80">
                  Last active: {new Date(batchState.lastUpdated).toLocaleString()}. You can resume sending to remaining unsent students without duplicate messages!
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleStartBatchDispatch(true)}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Resume Unfinished Batch
                  </button>
                  <button
                    onClick={() => {
                      clearBatchWhatsAppProgress();
                      setBatchState(null);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Clear Stored Progress
                  </button>
                </div>
              </div>
            )}

            {/* Live Progress Bar & Stats */}
            {batchState && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Batch Sending Progress</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {batchState.completedCount} / {batchState.totalCount} ({Math.round((batchState.completedCount / (batchState.totalCount || 1)) * 100)}%)
                  </span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(batchState.completedCount / (batchState.totalCount || 1)) * 100}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="text-emerald-400 font-semibold">✓ Sent: {batchState.sentAdmissionNos.length}</span>
                  <span className="text-rose-400 font-semibold">❌ Failed: {batchState.failedAdmissionNos.length}</span>
                  <span className="text-slate-400 font-semibold">Remaining: {batchState.totalCount - batchState.completedCount}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setShowBatchWAModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>

              {!isBatchRunning ? (
                <button
                  onClick={() => handleStartBatchDispatch(false)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" /> Start New Batch Dispatch
                </button>
              ) : (
                <button
                  onClick={() => setIsBatchRunning(false)}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Pause className="w-4 h-4 fill-current" /> Stop Batch
                </button>
              )}
            </div>

            {/* Real-time Dispatch Logs */}
            {batchLogs.length > 0 && (
              <div className="border-t border-slate-800 pt-3 space-y-1.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Dispatch Console Log</h4>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 max-h-36 overflow-y-auto font-mono text-[11px] space-y-1">
                  {batchLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={log.startsWith('✓') ? 'text-emerald-400' : log.startsWith('❌') ? 'text-rose-400' : 'text-slate-300'}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Print Filtered Roster Modal (Simple Compact PDF Layout) */}
      {showPrintRosterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-5 md:p-6 shadow-2xl text-white space-y-4 my-8 max-h-[92vh] overflow-y-auto print:max-h-none print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
            
            {/* Modal Control Bar (Hidden on Print) */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 print:hidden">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Printer className="w-5 h-5 text-indigo-400" />
                  Print Filtered Roster (PDF)
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs rounded-md font-bold">
                    {filteredRecords.length} Students
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Class: <span className="font-bold text-white">{selectedClass}</span> • Medium: <span className="font-bold text-white">{selectedMediumFilter}</span> • Phone Status: <span className="font-bold text-white">{selectedPhoneFilter}</span> {searchQuery ? `• Search: "${searchQuery}"` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadMissingNumbersPDF(missingPhoneRecords, selectedClass)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download PDF Report
                </button>
                <button
                  onClick={() => downloadRosterPDF(filteredRecords, 'STUDENT STUDY PROGRESS ROSTER REPORT', { classFilter: selectedClass, mediumFilter: selectedMediumFilter, phoneFilter: selectedPhoneFilter, searchQuery })}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download Vector PDF File
                </button>
                <button
                  onClick={() => setShowPrintRosterModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Document Container */}
            <div className="space-y-3 print:space-y-2">
              
              {/* Document Header */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between print:bg-white print:border-b-2 print:border-black print:rounded-none print:p-0 print:pb-2">
                <div className="flex items-center gap-3">
                  <img src="/logo1.png" alt="AIMS Logo" className="w-10 h-10 object-contain" />
                  <div>
                    <h2 className="text-sm font-black text-white print:text-black">AIMS ACADEMIC EVALUATION SYSTEMS</h2>
                    <p className="text-[11px] font-bold text-indigo-400 print:text-gray-800 uppercase tracking-wider">
                      STUDENT STUDY PROGRESS ROSTER REPORT
                    </p>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400 print:text-black leading-tight">
                  <p className="font-bold">Class: {selectedClass === 'ALL' ? 'All Classes' : `Class ${selectedClass}`} | Medium: {selectedMediumFilter}</p>
                  <p>Total Filtered Roster: {filteredRecords.length} Students</p>
                  <p className="text-[10px] text-slate-500 print:text-gray-600">Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-1">
                  <p className="text-sm font-bold text-white">No students match current filter criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-2xl print:border-black print:rounded-none">
                  <table className="w-full text-left text-[11px] print:text-[10px]">
                    <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800 print:bg-gray-100 print:text-black print:border-black">
                      <tr>
                        <th className="py-2 px-2.5 w-8">#</th>
                        <th className="py-2 px-2.5">Adm No</th>
                        <th className="py-2 px-2.5">Student Name</th>
                        <th className="py-2 px-2.5">Class</th>
                        <th className="py-2 px-2.5">Medium</th>
                        <th className="py-2 px-2.5">First Lang</th>
                        <th className="py-2 px-2.5">Overall %</th>
                        <th className="py-2 px-2.5">Phone Number</th>
                        <th className="py-2 px-2.5">WhatsApp Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200 print:divide-gray-300 print:text-black">
                      {filteredRecords.map((rec, idx) => {
                        const formattedPhone = formatWhatsAppPhoneNumber(rec.phoneNumber);
                        return (
                          <tr key={rec.id} className="hover:bg-slate-800/40 print:hover:bg-transparent">
                            <td className="py-1.5 px-2.5 font-semibold text-slate-400 print:text-black">{idx + 1}</td>
                            <td className="py-1.5 px-2.5 font-mono font-bold text-indigo-300 print:text-black">{rec.admissionNo}</td>
                            <td className="py-1.5 px-2.5 font-bold text-white print:text-black">{rec.studentName}</td>
                            <td className="py-1.5 px-2.5 font-semibold">{rec.studentClass}</td>
                            <td className="py-1.5 px-2.5">{rec.medium}</td>
                            <td className="py-1.5 px-2.5">{rec.firstLanguage || 'Malayalam'}</td>
                            <td className="py-1.5 px-2.5 font-bold text-emerald-400 print:text-black">{rec.overallPercentage}%</td>
                            <td className="py-1.5 px-2.5 font-mono">
                              {formattedPhone ? (
                                <span className="text-slate-200 print:text-black">{formattedPhone}</span>
                              ) : (
                                <span className="text-rose-400 print:text-gray-500 italic">Not Registered</span>
                              )}
                            </td>
                            <td className="py-1.5 px-2.5 font-semibold">
                              {rec.whatsappSentAt ? (
                                <span className="text-emerald-400 print:text-black font-bold">✓ Sent</span>
                              ) : rec.whatsappFailedAt ? (
                                <span className="text-rose-400 print:text-black">❌ Failed</span>
                              ) : (
                                <span className="text-slate-500 print:text-gray-500">Unsent</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Ultra Compact Print Footer */}
              <div className="p-2 bg-slate-950/60 border border-slate-800 rounded-xl text-[10px] text-slate-400 flex items-center justify-between print:bg-white print:border-none print:p-0 print:text-black">
                <p>Generated by AIMS Group of Institutions • Verification: aims-kondotty1.web.app</p>
                <p className="font-bold shrink-0 ml-4">Official Verified Student Roster</p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Student Study Progress Report PNG Modal */}
      {reportRecord && (
        <StudentReportModal
          record={reportRecord}
          allRecords={records}
          onClose={() => setReportRecord(null)}
          onSelectStudent={(rec) => setReportRecord(rec)}
        />
      )}
    </div>
  );
}
