import React, { useState, useEffect, useMemo } from 'react';
import { 
  getRevaluationResponses, 
  deleteRevaluationResponse, 
  RevaluationResponse,
  RevaluationBatch,
  REVALUATION_COMMON_SUBJECTS
} from '../../../services/revaluationService';
import { 
  Download, 
  Search, 
  Trash2, 
  RefreshCw, 
  Users, 
  BookOpen, 
  Share2, 
  ArrowLeft, 
  Copy, 
  Check, 
  Phone, 
  FileSpreadsheet, 
  Filter, 
  ExternalLink,
  Layers,
  Award,
  Clock,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface RevaluationAdminProps {
  onBack?: () => void;
  hideBack?: boolean;
}

export default function RevaluationAdmin({ onBack, hideBack = false }: RevaluationAdminProps) {
  const [responses, setResponses] = useState<RevaluationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<string>('All');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'subjects_count'>('newest');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // URLs for sharing
  const formUrl = `${window.location.origin}/form/revaluation`;

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const data = await getRevaluationResponses();
      setResponses(data);
    } catch (err) {
      console.error('Failed to load revaluation responses:', err);
      alert('Failed to load revaluation responses. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const handleDelete = async (id: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to delete the revaluation record for "${studentName}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteRevaluationResponse(id);
      setResponses(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete response:', err);
      alert('Failed to delete response. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const copyFormLink = () => {
    navigator.clipboard.writeText(formUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filtered & Sorted responses
  const filteredResponses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filtered = responses.filter(r => {
      // Search matches
      const matchesSearch = !q || 
        r.name.toLowerCase().includes(q) ||
        (r.phone && r.phone.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q)) ||
        r.subjects.some(s => 
          s.subject.toLowerCase().includes(q) || 
          String(s.score).includes(q)
        );

      // Batch matches
      const matchesBatch = selectedBatch === 'All' || r.batch === selectedBatch;

      // Subject matches
      const matchesSubject = selectedSubject === 'All' ||
        r.subjects.some(s => s.subject.toLowerCase() === selectedSubject.toLowerCase());

      return matchesSearch && matchesBatch && matchesSubject;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'oldest') {
        const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return timeA - timeB;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'subjects_count') {
        return (b.subjects?.length || 0) - (a.subjects?.length || 0);
      }
      return 0;
    });
  }, [responses, searchQuery, selectedBatch, selectedSubject, sortBy]);

  // Analytics Stats
  const totalStudents = responses.length;
  
  const totalSubjectRevaluations = useMemo(() => {
    return responses.reduce((acc, r) => acc + (r.subjects?.length || 0), 0);
  }, [responses]);

  const batchCounts = useMemo(() => {
    const counts: Record<string, number> = { B1: 0, B2: 0, B3: 0 };
    responses.forEach(r => {
      if (r.batch in counts) {
        counts[r.batch] = (counts[r.batch] || 0) + 1;
      } else {
        counts[r.batch] = (counts[r.batch] || 0) + 1;
      }
    });
    return counts;
  }, [responses]);

  const topRequestedSubject = useMemo(() => {
    const map: Record<string, number> = {};
    responses.forEach(r => {
      r.subjects?.forEach(s => {
        const key = s.subject.trim();
        map[key] = (map[key] || 0) + 1;
      });
    });

    let top = 'None';
    let max = 0;
    Object.entries(map).forEach(([subj, count]) => {
      if (count > max) {
        max = count;
        top = subj;
      }
    });
    return { name: top, count: max };
  }, [responses]);

  // Export to Excel using exceljs
  const exportToExcel = async () => {
    if (filteredResponses.length === 0) {
      alert('No revaluation records to export.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Revaluation Applications');

    // Title Row
    worksheet.addRow(['AIMS Plus Learning Centre - Student Revaluation Applications']);
    worksheet.mergeCells('A1:K1');
    const titleCell = worksheet.getCell('A1');
    titleCell.font = { name: 'Calibri', size: 15, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4338CA' } // Indigo-700
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 36;

    // Subtitle Row
    worksheet.addRow([
      `Exported: ${new Date().toLocaleString()} | Filter: Batch ${selectedBatch}, Subject ${selectedSubject} | Total Students: ${filteredResponses.length}`
    ]);
    worksheet.mergeCells('A2:K2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF475569' } };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(2).height = 20;

    // Header Row
    const headerRowData = [
      'No.',
      'Student Name',
      'Batch',
      'Phone / WhatsApp',
      'Subjects & Scores (Summary)',
      'Total Subjects',
      'Physics',
      'Chemistry',
      'Mathematics',
      'Biology',
      'English',
      'Other Subjects & Scores',
      'Notes / Remarks',
      'Submission Timestamp'
    ];
    worksheet.addRow(headerRowData);

    const headerRow = worksheet.getRow(3);
    headerRow.height = 26;
    headerRow.eachCell(cell => {
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E293B' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E7FF' } // Indigo-100
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'medium', color: { argb: 'FF6366F1' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Populate data
    filteredResponses.forEach((r, idx) => {
      const summaryText = (r.subjects || [])
        .map(s => `${s.subject}: ${s.score}`)
        .join(', ');

      const getScoreForSubject = (subjName: string) => {
        const found = (r.subjects || []).find(
          s => s.subject.toLowerCase() === subjName.toLowerCase()
        );
        return found ? found.score : '';
      };

      const otherSubjects = (r.subjects || []).filter(
        s => !['physics', 'chemistry', 'mathematics', 'biology', 'english'].includes(s.subject.toLowerCase())
      );
      const otherSubjectsText = otherSubjects.map(s => `${s.subject}: ${s.score}`).join(', ');

      const rowData = [
        idx + 1,
        r.name,
        r.batch,
        r.phone || 'N/A',
        summaryText,
        r.subjects?.length || 0,
        getScoreForSubject('physics'),
        getScoreForSubject('chemistry'),
        getScoreForSubject('mathematics'),
        getScoreForSubject('biology'),
        getScoreForSubject('english'),
        otherSubjectsText || '',
        r.notes || '',
        r.submittedAt ? new Date(r.submittedAt).toLocaleString() : 'N/A'
      ];

      worksheet.addRow(rowData);
      const row = worksheet.getRow(4 + idx);
      row.height = 22;

      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Calibri', size: 9 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFF1F5F9' } },
          bottom: { style: 'thin', color: { argb: 'FFF1F5F9' } },
          left: { style: 'thin', color: { argb: 'FFF1F5F9' } },
          right: { style: 'thin', color: { argb: 'FFF1F5F9' } }
        };

        // Alignments
        if (colNum === 2 || colNum === 5 || colNum === 12 || colNum === 13) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        if (colNum === 6) {
          cell.font = { name: 'Calibri', size: 9, bold: true };
        }
      });
    });

    // Column widths
    worksheet.columns = [
      { width: 6 },   // No.
      { width: 22 },  // Student Name
      { width: 10 },  // Batch
      { width: 16 },  // Phone
      { width: 34 },  // Summary
      { width: 14 },  // Total Subjects
      { width: 12 },  // Physics
      { width: 12 },  // Chemistry
      { width: 12 },  // Math
      { width: 12 },  // Biology
      { width: 12 },  // English
      { width: 24 },  // Other
      { width: 22 },  // Notes
      { width: 22 }   // Timestamp
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `AIMS_Revaluation_Applications_${dateStr}.xlsx`);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (filteredResponses.length === 0) {
      alert('No revaluation records to export.');
      return;
    }

    const headers = [
      'No.',
      'Student Name',
      'Batch',
      'Phone',
      'Subjects and Scores',
      'Total Subjects',
      'Notes',
      'Submitted At'
    ];

    const rows = filteredResponses.map((r, idx) => {
      const subjectsStr = (r.subjects || []).map(s => `${s.subject}: ${s.score}`).join('; ');
      return [
        idx + 1,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${r.batch}"`,
        `"${(r.phone || '').replace(/"/g, '""')}"`,
        `"${subjectsStr.replace(/"/g, '""')}"`,
        r.subjects?.length || 0,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
        `"${r.submittedAt ? new Date(r.submittedAt).toLocaleString() : ''}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const dateStr = new Date().toISOString().slice(0, 10);
    saveAs(blob, `AIMS_Revaluation_Applications_${dateStr}.csv`);
  };

  const getBatchBadgeColor = (b: string) => {
    switch (b) {
      case 'B1':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'B2':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'B3':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          {!hideBack && onBack && (
            <button
              onClick={onBack}
              className="p-2.5 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors cursor-pointer"
              title="Back to Lab"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                AIMS Plus Lab
              </span>
              <span className="text-xs text-slate-400 font-medium">Revaluation Admin</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
              Revaluation Applications Portal
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchResponses}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Form</span>
          </button>

          <a
            href="/form/revaluation"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Form</span>
          </a>

          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Share Form Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Share Revaluation Form</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Share this public link with students to submit their revaluation requests for batches B1, B2, and B3.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-700 truncate select-all">
                {formUrl}
              </span>
              <button
                onClick={copyFormLink}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Applications
            </span>
            <span className="text-2xl font-black text-slate-900">
              {totalStudents}
            </span>
          </div>
        </div>

        {/* Total Subject Revaluations */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Subjects Total
            </span>
            <span className="text-2xl font-black text-slate-900">
              {totalSubjectRevaluations}
            </span>
          </div>
        </div>

        {/* Batch Breakdown */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            By Batch (B1 / B2 / B3)
          </span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
              B1: {batchCounts.B1 || 0}
            </span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">
              B2: {batchCounts.B2 || 0}
            </span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold">
              B3: {batchCounts.B3 || 0}
            </span>
          </div>
        </div>

        {/* Most Requested Subject */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Award className="w-5 h-5" />
          </div>
          <div className="truncate">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Top Subject
            </span>
            <span className="text-base font-black text-slate-900 truncate block">
              {topRequestedSubject.name}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {topRequestedSubject.count} student{topRequestedSubject.count === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by student name, phone, subject, score..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Batch Filter */}
            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Batch:</span>
              <select
                value={selectedBatch}
                onChange={e => setSelectedBatch(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All">All Batches</option>
                <option value="B1">Batch B1</option>
                <option value="B2">Batch B2</option>
                <option value="B3">Batch B3</option>
              </select>
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Subject:</span>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All">All Subjects</option>
                {REVALUATION_COMMON_SUBJECTS.map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="subjects_count">Most Subjects</option>
              </select>
            </div>

          </div>
        </div>

        {/* Active Filter Summary */}
        <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800">{filteredResponses.length}</strong> of{' '}
            <strong className="text-slate-800">{responses.length}</strong> records
          </span>
          {(searchQuery || selectedBatch !== 'All' || selectedSubject !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBatch('All');
                setSelectedSubject('All');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table / Submissions List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading revaluation records...</p>
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No applications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {responses.length === 0
                ? 'No students have submitted a revaluation request yet. Share the form link to start collecting applications.'
                : 'No submissions matched your search and filter criteria.'}
            </p>
            {responses.length === 0 && (
              <button
                onClick={copyFormLink}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Form Link Copied!' : 'Copy Form Link'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 text-center w-12">#</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4 text-center">Batch</th>
                  <th className="py-3.5 px-4">Phone / Contact</th>
                  <th className="py-3.5 px-4">Subjects & Scores</th>
                  <th className="py-3.5 px-4 text-center">Total</th>
                  <th className="py-3.5 px-4">Submitted At</th>
                  <th className="py-3.5 px-4 text-center w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredResponses.map((r, idx) => (
                  <tr
                    key={r.id || idx}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Index */}
                    <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>

                    {/* Student Name & Notes */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{r.name}</div>
                      {r.notes && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                          "{r.notes}"
                        </div>
                      )}
                    </td>

                    {/* Batch */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${getBatchBadgeColor(r.batch)}`}>
                        {r.batch}
                      </span>
                    </td>

                    {/* Phone / WhatsApp */}
                    <td className="py-3 px-4">
                      {r.phone ? (
                        <a
                          href={`https://wa.me/91${r.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium"
                          title="Open in WhatsApp"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{r.phone}</span>
                        </a>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Subjects & Scores */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {r.subjects.map((s, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 border border-slate-200/80 rounded-md text-[11px] text-slate-800 font-medium"
                          >
                            <span className="font-semibold">{s.subject}:</span>
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-1 rounded">
                              {s.score}
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Total Subjects */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full font-bold text-xs">
                        {r.subjects?.length || 0}
                      </span>
                    </td>

                    {/* Submitted At */}
                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {r.submittedAt ? (
                        <div>
                          <div>{new Date(r.submittedAt).toLocaleDateString()}</div>
                          <div className="text-slate-400">{new Date(r.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => r.id && handleDelete(r.id, r.name)}
                        disabled={deletingId === r.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete application"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
