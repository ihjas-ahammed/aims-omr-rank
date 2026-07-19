import React, { useState, useEffect, useMemo } from 'react';
import { getImprovementResponses, deleteImprovementResponse, ImprovementResponse } from '../../../services/firebaseService';
import { ArrowLeft, Search, Download, Trash2, Filter, Info, Users, Award, BookOpen, Layers } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface ImprovementAdminProps {
  onBack?: () => void;
  hideBack?: boolean;
}

export default function ImprovementAdmin({ onBack, hideBack = false }: ImprovementAdminProps) {
  const [responses, setResponses] = useState<ImprovementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState<'ALL' | 'B1' | 'B2' | 'B3'>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // Stats calculation
  const stats = useMemo(() => {
    const total = responses.length;
    const b1 = responses.filter(r => r.batch === 'B1').length;
    const b2 = responses.filter(r => r.batch === 'B2').length;
    const b3 = responses.filter(r => r.batch === 'B3').length;
    const entranceCount = responses.filter(r => r.wantsEntranceExams).length;
    
    // Average score calculation
    const avgScore = total > 0 
      ? Math.round(responses.reduce((sum, r) => sum + r.totalScore, 0) / total) 
      : 0;

    return { total, b1, b2, b3, entranceCount, avgScore };
  }, [responses]);

  // Filter and Sort responses
  const processedResponses = useMemo(() => {
    let result = [...responses];

    // Search query filter (case-insensitive name match)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(q));
    }

    // Batch filter
    if (batchFilter !== 'ALL') {
      result = result.filter(r => r.batch === batchFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'score') {
        return sortOrder === 'desc' 
          ? b.totalScore - a.totalScore 
          : a.totalScore - b.totalScore;
      } else {
        // Sort by date (submittedAt)
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
    });

    return result;
  }, [responses, searchQuery, batchFilter, sortBy, sortOrder]);

  const toggleSort = (type: 'date' | 'score') => {
    if (sortBy === type) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  // Excel generation using exceljs
  const exportToExcel = async () => {
    if (processedResponses.length === 0) {
      alert('No data available to export.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Improvement Responses');

    // Title Row
    worksheet.addRow(['AIMS Plus Academic & Improvement Responses']);
    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF7C3AED' } // Purple-600
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 40;

    // Subtitle Info Row
    worksheet.addRow([
      `Exported: ${new Date().toLocaleDateString()}`, 
      `Total Records: ${processedResponses.length}`,
      `Filter: Batch ${batchFilter}`
    ]);
    worksheet.mergeCells('A2:L2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.font = { name: 'Arial', size: 10, italic: true };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(2).height = 20;

    // Header Row
    const headerRowData = [
      'No.', 
      'Student Name', 
      'Batch', 
      'English (100)', 
      'Language (100)', 
      'Physics (80)', 
      'Chemistry (80)', 
      'Mathematics (80)', 
      'Elective (80)', 
      'Elective Type',
      'Total Score (520)', 
      'Improvement Subjects', 
      'Wants Night Class', 
      'Preferred Entrance', 
      'Submission Date'
    ];
    worksheet.addRow(headerRowData);
    
    // Format Header Row
    const headerRow = worksheet.getRow(3);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1F2937' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' } // Gray-200
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'medium', color: { argb: 'FF9CA3AF' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Populate rows
    processedResponses.forEach((r, idx) => {
      const rowData = [
        idx + 1,
        r.name,
        r.batch,
        r.scores.english,
        r.scores.language,
        r.scores.physics,
        r.scores.chemistry,
        r.scores.mathematics,
        r.scores.sixthSubjectScore,
        r.scores.sixthSubjectType === 'Biology' ? 'Biology' : 'Computer Science',
        r.totalScore,
        r.improvementSubjects.length > 0 ? r.improvementSubjects.join(', ') : 'None',
        r.wantsEntranceExams ? 'Yes' : 'No',
        r.preferredEntranceExams && r.preferredEntranceExams.length > 0 ? r.preferredEntranceExams.join(', ') : 'None',
        r.submittedAt ? new Date(r.submittedAt).toLocaleString() : 'N/A'
      ];
      
      worksheet.addRow(rowData);
      
      const row = worksheet.getRow(4 + idx);
      row.height = 20;
      
      // Formatting cell styles
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Arial', size: 9 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFF3F4F6' } },
          bottom: { style: 'thin', color: { argb: 'FFF3F4F6' } },
          left: { style: 'thin', color: { argb: 'FFF3F4F6' } },
          right: { style: 'thin', color: { argb: 'FFF3F4F6' } }
        };
        
        // Alignment
        if (colNumber === 2 || colNumber === 12 || colNumber === 14) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        // Highlight total score column
        if (colNumber === 11) {
          cell.font = { name: 'Arial', size: 9, bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF5F3FF' } // Slate-purple tint
          };
        }
      });
    });

    // Autofit column widths
    worksheet.columns.forEach((column) => {
      let maxLen = 0;
      column.eachCell!({ includeEmpty: true }, (cell, rowNum) => {
        if (rowNum > 2 && cell.value) { // Skip title and description
          const len = String(cell.value).length;
          if (len > maxLen) maxLen = len;
        }
      });
      column.width = Math.max(maxLen + 4, 10);
    });

    // Write file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `AIMS_Improvement_Responses_${batchFilter}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          {!hideBack && onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-gray-900 focus:outline-none"
              title="Back to Lab Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900">Student Profile Responses</h2>
            <p className="text-xs text-gray-500">View academic scores, improvement listings and export reports.</p>
          </div>
        </div>

        <button
          onClick={exportToExcel}
          disabled={processedResponses.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg focus:outline-none shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export to Excel</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Total Submitted</span>
            <span className="text-lg font-bold text-gray-900">{stats.total}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Batches distribution</span>
            <span className="text-xs font-bold text-gray-700">B1: {stats.b1} | B2: {stats.b2} | B3: {stats.b3}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Night Class Option</span>
            <span className="text-lg font-bold text-gray-900">{stats.entranceCount}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">Average Total Score</span>
            <span className="text-lg font-bold text-gray-900">{stats.avgScore} <span className="text-xs text-gray-400 font-normal">/ 520</span></span>
          </div>
        </div>
      </div>

      {/* Control panel (Filters / Search) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 rounded-xl text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Batch selector */}
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl bg-gray-50 p-1">
              <span className="pl-2.5 text-xs text-gray-500 font-semibold flex items-center gap-1">
                <Filter className="w-3 h-3" /> Batch
              </span>
              {(['ALL', 'B1', 'B2', 'B3'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBatchFilter(b)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${batchFilter === b ? 'bg-white text-purple-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Sorting controls */}
            <button
              onClick={() => toggleSort('score')}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${sortBy === 'score' ? 'bg-purple-50 border-purple-200 text-purple-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <span>Score</span>
              {sortBy === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>

            <button
              onClick={() => toggleSort('date')}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${sortBy === 'date' ? 'bg-purple-50 border-purple-200 text-purple-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <span>Date</span>
              {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>

        </div>
      </div>

      {/* Main Table view */}
      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <span className="text-sm text-gray-500 font-medium">Fetching improvement submissions...</span>
        </div>
      ) : processedResponses.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm space-y-3">
          <Info className="mx-auto h-12 w-12 text-gray-300" />
          <h4 className="text-base font-bold text-gray-900">No submissions found</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {responses.length === 0 
              ? 'No student has completed the form yet. Share the link /form/improvement to collect details.'
              : 'No results match your search and batch filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {processedResponses.map((r, index) => (
              <div key={r.id || index} className="bg-white border border-gray-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                {/* Header: Name, Batch, and Delete */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      <span className="text-gray-400 font-medium mr-1">#{index + 1}</span> {r.name}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-gray-600">{r.batch}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.wantsEntranceExams ? 'bg-orange-50 text-orange-600 border border-orange-100/50' : 'bg-gray-50 text-gray-400 border border-gray-200/40'}`}>
                        Night Class: {r.wantsEntranceExams ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => r.id && handleDelete(r.id)}
                    disabled={deletingId === r.id}
                    className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Scores Grid */}
                <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-white p-1.5 rounded border border-gray-100">
                      <span className="text-[9px] text-gray-400 block uppercase font-medium">English</span>
                      <span className="font-bold text-gray-700">{r.scores.english}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-gray-100">
                      <span className="text-[9px] text-gray-400 block uppercase font-medium">Language</span>
                      <span className="font-bold text-gray-700">{r.scores.language}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-gray-100">
                      <span className="text-[9px] text-gray-400 block uppercase font-medium">Physics</span>
                      <span className="font-bold text-gray-700">{r.scores.physics}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-gray-100">
                      <span className="text-[9px] text-gray-400 block uppercase font-medium">Chemistry</span>
                      <span className="font-bold text-gray-700">{r.scores.chemistry}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-gray-100">
                      <span className="text-[9px] text-gray-400 block uppercase font-medium">Math</span>
                      <span className="font-bold text-gray-700">{r.scores.mathematics}</span>
                    </div>
                    <div className="bg-white p-1.5 rounded border border-gray-100">
                      <span className="text-[9px] text-gray-400 block uppercase font-medium truncate" title={r.scores.sixthSubjectType}>
                        {r.scores.sixthSubjectType === 'Biology' ? 'Bio' : 'CS'}
                      </span>
                      <span className="font-bold text-gray-700">{r.scores.sixthSubjectScore}</span>
                    </div>
                  </div>
                  
                  {/* Total score row */}
                  <div className="pt-2 border-t border-gray-200/40 flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-gray-500">Total Score:</span>
                    <span className="font-extrabold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">{r.totalScore} / 520</span>
                  </div>
                </div>

                {/* Improvements selection */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Improvements selected</span>
                  {r.improvementSubjects.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {r.improvementSubjects.map(sub => (
                        <span key={sub} className="px-2 py-0.5 bg-purple-50 border border-purple-100 text-purple-600 rounded text-[9px] font-bold">
                          {sub}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">None selected</span>
                  )}
                </div>

                {/* Preferred Entrance selection */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Preferred Entrance</span>
                  {r.preferredEntranceExams && r.preferredEntranceExams.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {r.preferredEntranceExams.map(exam => (
                        <span key={exam} className="px-2 py-0.5 bg-orange-50 border border-orange-100 text-orange-600 rounded text-[9px] font-bold">
                          {exam}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">None selected</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-gray-100 text-xs font-bold uppercase tracking-wider">
                    <th className="px-5 py-4 text-center w-12">No.</th>
                    <th className="px-5 py-4">Student Name</th>
                    <th className="px-4 py-4 text-center">Batch</th>
                    <th className="px-3 py-4 text-center">ENG (100)</th>
                    <th className="px-3 py-4 text-center">LANG (100)</th>
                    <th className="px-3 py-4 text-center">PHY (80)</th>
                    <th className="px-3 py-4 text-center">CHE (80)</th>
                    <th className="px-3 py-4 text-center">MAT (80)</th>
                    <th className="px-4 py-4 text-center">Elective (80)</th>
                    <th className="px-4 py-4 text-center">Total (520)</th>
                    <th className="px-5 py-4">Improvements</th>
                    <th className="px-4 py-4 text-center">Night Class</th>
                    <th className="px-5 py-4">Preferred Entrance</th>
                    <th className="px-4 py-4 text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {processedResponses.map((r, index) => (
                    <tr key={r.id || index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-center font-medium text-gray-400">{index + 1}</td>
                      <td className="px-5 py-3.5 font-bold text-gray-900 truncate max-w-[150px]">{r.name}</td>
                      <td className="px-4 py-3.5 text-center font-semibold"><span className="px-2 py-1 bg-slate-100 rounded-md text-gray-700">{r.batch}</span></td>
                      <td className="px-3 py-3.5 text-center text-gray-600 font-semibold">{r.scores.english}</td>
                      <td className="px-3 py-3.5 text-center text-gray-600 font-semibold">{r.scores.language}</td>
                      <td className="px-3 py-3.5 text-center text-gray-600 font-semibold">{r.scores.physics}</td>
                      <td className="px-3 py-3.5 text-center text-gray-600 font-semibold">{r.scores.chemistry}</td>
                      <td className="px-3 py-3.5 text-center text-gray-600 font-semibold">{r.scores.mathematics}</td>
                      <td className="px-4 py-3.5 text-center text-gray-600 font-semibold truncate" title={r.scores.sixthSubjectType}>
                        {r.scores.sixthSubjectScore} <span className="text-[10px] text-gray-400 block font-normal">{r.scores.sixthSubjectType === 'Biology' ? 'Bio' : 'CS'}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-extrabold text-purple-600 text-sm bg-purple-50/30">{r.totalScore}</td>
                      <td className="px-5 py-3.5 text-gray-600 font-medium">
                        {r.improvementSubjects.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {r.improvementSubjects.map(sub => (
                              <span key={sub} className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded border border-purple-100 text-[10px] font-bold">
                                {sub}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${r.wantsEntranceExams ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-gray-50 text-gray-400 border border-gray-200/50'}`}>
                          {r.wantsEntranceExams ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 font-medium">
                        {r.preferredEntranceExams && r.preferredEntranceExams.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {r.preferredEntranceExams.map(exam => (
                              <span key={exam} className="px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded border border-orange-100 text-[10px] font-bold">
                                {exam}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => r.id && handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="text-gray-400 hover:text-red-600 disabled:opacity-50 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
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
            
            {/* Footer page descriptor */}
            <div className="bg-gray-50 px-5 py-3.5 border-t border-gray-100 text-xs text-gray-500 font-medium flex justify-between items-center">
              <span>Showing {processedResponses.length} of {responses.length} total entries</span>
              <span>AIMS Plus Lab Evaluation</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
