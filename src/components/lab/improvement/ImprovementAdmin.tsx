import React, { useState, useEffect, useMemo } from 'react';
import { getImprovementResponses, deleteImprovementResponse, clearAllImprovementResponses, ImprovementResponse } from '../../../services/firebaseService';
import { ArrowLeft, Search, Download, Trash2, Filter, Info, Users, BookOpen, Layers, Copy, Check, Share2, Phone, Moon, Sparkles, MessageSquare, AlertTriangle, RefreshCw } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ImprovementAdminProps {
  onBack?: () => void;
  hideBack?: boolean;
}

const ALL_SUBJECTS = ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'English'];

export default function ImprovementAdmin({ onBack, hideBack = false }: ImprovementAdminProps) {
  const [responses, setResponses] = useState<ImprovementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState<'ALL' | 'B1' | 'B2' | 'B3'>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Copy modal / states
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const data = await getImprovementResponses();
      setResponses(data);
    } catch (e) {
      console.error(e);
      alert('Failed to load improvement responses.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteImprovementResponse(id);
      setResponses(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
      alert('Failed to delete response.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleResetAll = async () => {
    setResetting(true);
    try {
      // Automatic backup before resetting
      await exportToExcel(true);
      await clearAllImprovementResponses();
      setResponses([]);
      setShowResetModal(false);
      alert('All improvement night class submissions have been reset successfully. A backup Excel was downloaded.');
    } catch (e) {
      console.error(e);
      alert('Failed to reset submissions.');
    } finally {
      setResetting(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    const total = responses.length;
    const b1 = responses.filter(r => r.batch === 'B1').length;
    const b2 = responses.filter(r => r.batch === 'B2').length;
    const b3 = responses.filter(r => r.batch === 'B3').length;

    // Subject breakdown
    const subjectCounts: Record<string, number> = {};
    ALL_SUBJECTS.forEach(sub => {
      subjectCounts[sub] = responses.filter(r => 
        r.improvementSubjects && r.improvementSubjects.some(s => s.toLowerCase().includes(sub.toLowerCase()))
      ).length;
    });

    return { total, b1, b2, b3, subjectCounts };
  }, [responses]);

  // Filter and Sort responses
  const processedResponses = useMemo(() => {
    let result = [...responses];

    // Search query filter (case-insensitive name match)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.name.toLowerCase().includes(q) || 
        (r.phone && r.phone.includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q))
      );
    }

    // Batch filter
    if (batchFilter !== 'ALL') {
      result = result.filter(r => r.batch === batchFilter);
    }

    // Subject filter
    if (subjectFilter !== 'ALL') {
      result = result.filter(r => 
        r.improvementSubjects && r.improvementSubjects.some(s => s.toLowerCase().includes(subjectFilter.toLowerCase()))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
    });

    return result;
  }, [responses, searchQuery, batchFilter, subjectFilter, sortBy, sortOrder]);

  const toggleSort = (type: 'date' | 'name') => {
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
      console.error(e);
      alert('Failed to copy to clipboard.');
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/form/improvement`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error(e);
      alert(`Registration URL: ${url}`);
    }
  };

  // Excel generation
  const exportToExcel = async (isBackup = false) => {
    const dataToExport = isBackup ? responses : processedResponses;
    if (dataToExport.length === 0) {
      alert('No data available to export.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Improvement Night Class');

    // Title Row
    worksheet.addRow(['AIMS Plus Learning Centre - Improvement Night Class Registrations']);
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4338CA' } // Indigo-700
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 38;

    // Subtitle Info Row
    worksheet.addRow([
      `Export Date: ${new Date().toLocaleString()}`, 
      `Total Students: ${dataToExport.length}`,
      `Batch Filter: ${batchFilter} | Subject Filter: ${subjectFilter}`
    ]);
    worksheet.mergeCells('A2:E2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.font = { name: 'Arial', size: 10, italic: true };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(2).height = 20;

    // Header Row
    const headerRowData = [
      'No.', 
      'Student Name (ALL CAPS)', 
      'Batch', 
      'Improvement Subjects', 
      'Registration Time'
    ];
    worksheet.addRow(headerRowData);
    
    // Format Header Row
    const headerRow = worksheet.getRow(3);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E293B' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' } // Slate-200
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'medium', color: { argb: 'FF94A3B8' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Populate rows
    dataToExport.forEach((r, idx) => {
      const rowData = [
        idx + 1,
        (r.name || '').toUpperCase(),
        r.batch || 'B1',
        r.improvementSubjects && r.improvementSubjects.length > 0 ? r.improvementSubjects.join(', ') : 'None',
        r.submittedAt ? new Date(r.submittedAt).toLocaleString() : 'N/A'
      ];
      
      worksheet.addRow(rowData);
      
      const row = worksheet.getRow(4 + idx);
      row.height = 20;
      
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 9 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFF1F5F9' } },
          bottom: { style: 'thin', color: { argb: 'FFF1F5F9' } },
          left: { style: 'thin', color: { argb: 'FFF1F5F9' } },
          right: { style: 'thin', color: { argb: 'FFF1F5F9' } }
        };
        
        // Alignment
        if (colNumber === 2 || colNumber === 4) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        // Bold for student name
        if (colNumber === 2) {
          cell.font = { name: 'Arial', size: 9, bold: true };
        }
      });
    });

    // Autofit column widths
    worksheet.columns.forEach((column) => {
      let maxLen = 0;
      column.eachCell!({ includeEmpty: true }, (cell, rowNum) => {
        if (rowNum > 2 && cell.value) {
          const len = String(cell.value).length;
          if (len > maxLen) maxLen = len;
        }
      });
      column.width = Math.max(maxLen + 4, 14);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const prefix = isBackup ? 'BACKUP_AIMS_Improvement_NightClass' : 'AIMS_Improvement_NightClass';
    saveAs(new Blob([buffer]), `${prefix}_${batchFilter}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Helper generators for Copy Modal
  const generateNamesList = (items: ImprovementResponse[]) => {
    return items.map(r => r.name.toUpperCase()).join('\n');
  };

  const generateNamesWithBatchList = (items: ImprovementResponse[]) => {
    return items.map((r, i) => `${i + 1}. ${r.name.toUpperCase()} (${r.batch}) - ${r.improvementSubjects.join(', ')}`).join('\n');
  };

  const generateWhatsAppMessage = () => {
    let msg = `*AIMS PLUS - Improvement Night Class List*\n`;
    msg += `Date: ${new Date().toLocaleDateString()}\n`;
    msg += `Total Students: ${processedResponses.length}\n`;
    if (batchFilter !== 'ALL') msg += `Batch: ${batchFilter}\n`;
    if (subjectFilter !== 'ALL') msg += `Subject: ${subjectFilter}\n`;
    msg += `----------------------------------------\n\n`;

    processedResponses.forEach((r, idx) => {
      msg += `${idx + 1}. *${r.name.toUpperCase()}* (${r.batch})\n`;
      msg += `   • Subjects: ${r.improvementSubjects.join(', ')}\n\n`;
    });

    return msg;
  };

  const generateTabSeparatedData = () => {
    let tsv = `No\tName\tBatch\tSubjects\tDate\n`;
    processedResponses.forEach((r, idx) => {
      tsv += `${idx + 1}\t${r.name.toUpperCase()}\t${r.batch}\t${r.improvementSubjects.join(', ')}\t${r.submittedAt || ''}\n`;
    });
    return tsv;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-gray-200/80 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          {!hideBack && onBack && (
            <button
              onClick={onBack}
              className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer border border-transparent hover:border-gray-200"
              title="Back to Lab Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Moon className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Improvement Night Class</h2>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">
                {responses.length} enrolled
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Manage registered students, export lists, copy data by subject/batch, and share form.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Share Link */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 cursor-pointer"
            title="Copy Form URL for students"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-600" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Form'}</span>
          </button>

          {/* Take / Copy Data Button */}
          <button
            onClick={() => setShowCopyModal(true)}
            disabled={processedResponses.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all border border-indigo-200/80 cursor-pointer disabled:opacity-50"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Take / Copy Data</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={() => exportToExcel(false)}
            disabled={processedResponses.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>

          {/* Reset All Submissions */}
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-bold rounded-xl transition-all border border-rose-200 cursor-pointer"
            title="Reset/Clear form data"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white border border-gray-200/80 p-4.5 rounded-2xl shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Total Students</span>
            <span className="text-xl font-black text-gray-900">{stats.total}</span>
          </div>
        </div>

        {/* Batch Distribution */}
        <div className="bg-white border border-gray-200/80 p-4.5 rounded-2xl shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Batches</span>
            <div className="flex gap-2 text-xs font-black text-gray-800 mt-0.5">
              <span>B1: <span className="text-purple-600 font-extrabold">{stats.b1}</span></span>
              <span>•</span>
              <span>B2: <span className="text-indigo-600 font-extrabold">{stats.b2}</span></span>
              <span>•</span>
              <span>B3: <span className="text-blue-600 font-extrabold">{stats.b3}</span></span>
            </div>
          </div>
        </div>

        {/* Top Subjects */}
        <div className="bg-white border border-gray-200/80 p-4.5 rounded-2xl shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Physics & Chemistry</span>
            <span className="text-xs font-bold text-gray-800">
              Phy: <span className="text-blue-600">{stats.subjectCounts['Physics'] || 0}</span> | Che: <span className="text-emerald-600">{stats.subjectCounts['Chemistry'] || 0}</span>
            </span>
          </div>
        </div>

        {/* Math & Electives */}
        <div className="bg-white border border-gray-200/80 p-4.5 rounded-2xl shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Maths & Electives</span>
            <span className="text-xs font-bold text-gray-800">
              Mat: <span className="text-rose-600">{stats.subjectCounts['Mathematics'] || 0}</span> | Bio: <span className="text-green-600">{stats.subjectCounts['Biology'] || 0}</span> | CS: <span className="text-cyan-600">{stats.subjectCounts['Computer Science'] || 0}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Subject Filter Badges Bar */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            <span>Filter by Subject Demand:</span>
          </span>
          {subjectFilter !== 'ALL' && (
            <button 
              onClick={() => setSubjectFilter('ALL')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              Clear Subject Filter
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => setSubjectFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subjectFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Subjects ({stats.total})
          </button>
          {ALL_SUBJECTS.map(sub => {
            const count = stats.subjectCounts[sub] || 0;
            const isSelected = subjectFilter === sub;
            return (
              <button
                key={sub}
                onClick={() => setSubjectFilter(sub)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{sub}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Control panel (Search & Batch Filters) */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by student name, phone, or specific topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl text-sm"
            />
          </div>

          {/* Batch Selector & Sorting */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 border border-gray-200 rounded-xl bg-gray-50 p-1">
              {(['ALL', 'B1', 'B2', 'B3'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBatchFilter(b)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    batchFilter === b 
                      ? 'bg-white text-indigo-600 shadow-sm border border-gray-100' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {b === 'ALL' ? 'All Batches' : b}
                </button>
              ))}
            </div>

            {/* Sort Name */}
            <button
              onClick={() => toggleSort('name')}
              className={`flex items-center gap-1 px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'name' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>Name {sortBy === 'name' && (sortOrder === 'asc' ? 'A→Z' : 'Z→A')}</span>
            </button>

            {/* Sort Date */}
            <button
              onClick={() => toggleSort('date')}
              className={`flex items-center gap-1 px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'date' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main List / Table */}
      {loading ? (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <span className="text-sm text-gray-500 font-medium">Fetching registered students...</span>
        </div>
      ) : processedResponses.length === 0 ? (
        <div className="bg-white border border-gray-200/80 rounded-2xl p-12 text-center shadow-sm space-y-3">
          <Info className="mx-auto h-12 w-12 text-gray-300" />
          <h4 className="text-base font-bold text-gray-900">No student registrations found</h4>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            {responses.length === 0 
              ? 'No student has enrolled in the Improvement Night Class yet. Share the link /form/improvement to start collecting registrations.'
              : 'No results match your active search and filter options.'}
          </p>
          {responses.length === 0 && (
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow hover:bg-indigo-700 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Copy Public Form Link</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Mobile View Cards */}
          <div className="md:hidden space-y-3">
            {processedResponses.map((r, index) => (
              <div key={r.id || index} className="bg-white border border-gray-200 rounded-2xl p-4.5 shadow-sm space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                      <h4 className="text-sm font-black text-gray-900 tracking-wide font-mono">
                        {r.name.toUpperCase()}
                      </h4>
                    </div>
                    <div className="mt-1">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold">
                        {r.batch}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => r.id && handleDelete(r.id)}
                    disabled={deletingId === r.id}
                    className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete registration"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Selected Subjects */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Enrolled Subjects ({r.improvementSubjects.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {r.improvementSubjects.map(sub => (
                      <span key={sub} className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-100 flex justify-between items-center">
                  <span>Enrolled: {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-gray-200 text-xs font-bold uppercase tracking-wider">
                    <th className="px-5 py-3.5 text-center w-12">No.</th>
                    <th className="px-5 py-3.5">Student Name (ALL CAPS)</th>
                    <th className="px-4 py-3.5 text-center w-24">Batch</th>
                    <th className="px-5 py-3.5">Improvement Subjects</th>
                    <th className="px-4 py-3.5 text-center w-36">Enrolled Date</th>
                    <th className="px-4 py-3.5 text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {processedResponses.map((r, index) => (
                    <tr key={r.id || index} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 text-center font-bold text-gray-400">{index + 1}</td>
                      <td className="px-5 py-3.5 font-extrabold text-gray-900 tracking-wide font-mono">
                        {r.name.toUpperCase()}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md font-bold text-xs">
                          {r.batch}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[360px]">
                          {r.improvementSubjects && r.improvementSubjects.length > 0 ? (
                            r.improvementSubjects.map(sub => (
                              <span key={sub} className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold">
                                {sub}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 italic">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center text-gray-500 font-medium">
                        {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => r.id && handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="text-gray-400 hover:text-rose-600 disabled:opacity-50 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Footer */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-gray-200 text-xs text-gray-500 font-medium flex justify-between items-center">
              <span>Showing {processedResponses.length} of {responses.length} enrolled students</span>
              <span>AIMS Plus Improvement Night Class</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* "TAKE / COPY DATA" MODAL */}
      {/* ========================================================================= */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Copy className="w-5 h-5 text-indigo-600" />
                  <span>Take / Copy Specific Data</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Quickly copy formatted lists to paste into WhatsApp, Sheets, or documents.</p>
              </div>
              <button
                onClick={() => setShowCopyModal(false)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Option 1: Copy All Names Only */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-bold text-gray-900 block">Copy Student Names Only (ALL CAPS)</span>
                  <span className="text-xs text-gray-500">List of names, one per line (Total: {processedResponses.length})</span>
                </div>
                <button
                  onClick={() => copyToClipboard(generateNamesList(processedResponses), 'names_only')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer shrink-0"
                >
                  {copiedKey === 'names_only' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'names_only' ? 'Copied!' : 'Copy Names'}</span>
                </button>
              </div>

              {/* Option 2: Copy WhatsApp formatted summary */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-bold text-gray-900 block">Copy WhatsApp Formatted Message</span>
                  <span className="text-xs text-gray-500">Ready to send directly in WhatsApp class groups</span>
                </div>
                <button
                  onClick={() => copyToClipboard(generateWhatsAppMessage(), 'whatsapp')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer shrink-0"
                >
                  {copiedKey === 'whatsapp' ? <Check className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'whatsapp' ? 'Copied!' : 'Copy WhatsApp'}</span>
                </button>
              </div>

              {/* Option 3: Copy Tab-Separated Data for Google Sheets */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-bold text-gray-900 block">Copy for Google Sheets / Excel</span>
                  <span className="text-xs text-gray-500">Tab-separated rows, paste directly with Ctrl+V into sheets</span>
                </div>
                <button
                  onClick={() => copyToClipboard(generateTabSeparatedData(), 'sheets')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer shrink-0"
                >
                  {copiedKey === 'sheets' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sheets' ? 'Copied!' : 'Copy TSV'}</span>
                </button>
              </div>

              {/* Option 4: Copy by Subject specific list */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Copy Names by Subject:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_SUBJECTS.map(subj => {
                    const subjStudents = responses.filter(r => 
                      r.improvementSubjects && r.improvementSubjects.some(s => s.toLowerCase().includes(subj.toLowerCase()))
                    );
                    return (
                      <button
                        key={subj}
                        onClick={() => copyToClipboard(generateNamesList(subjStudents), `subj_${subj}`)}
                        className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 transition cursor-pointer text-left"
                      >
                        <span className="truncate">{subj} ({subjStudents.length})</span>
                        {copiedKey === `subj_${subj}` ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowCopyModal(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESET / CLEAR ALL DATA CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 text-center">
            <div className="inline-flex p-4 bg-rose-100 text-rose-600 rounded-full">
              <AlertTriangle className="w-10 h-10" />
            </div>
            
            <div>
              <h3 className="text-xl font-black text-gray-900">Reset Improvement Submissions?</h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                This will clear all current student registrations from the database so you can start fresh for new improvement night classes.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-800 font-medium text-left space-y-1">
              <span className="font-bold block">Automatic Safety Backup:</span>
              <span>An Excel file containing all {responses.length} current submissions will be automatically generated and downloaded before clearing.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAll}
                disabled={resetting}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {resetting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Backup & Clear All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
