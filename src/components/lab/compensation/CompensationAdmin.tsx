import React, { useState, useEffect, useMemo } from 'react';
import { getCompensationResponses, deleteCompensationResponse, CompensationResponse } from '../../../services/firebaseService';
import { 
  Download, 
  Search, 
  Trash2, 
  RefreshCw, 
  Users, 
  BookOpen, 
  Share2, 
  ArrowLeft, 
  Zap, 
  FlaskConical, 
  Calculator, 
  Calendar, 
  Copy, 
  Check, 
  Phone, 
  FileSpreadsheet, 
  X,
  Filter
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface CompensationAdminProps {
  onBack?: () => void;
  hideBack?: boolean;
}

export default function CompensationAdmin({ onBack, hideBack = false }: CompensationAdminProps) {
  const [responses, setResponses] = useState<CompensationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedBatch, setSelectedBatch] = useState<string>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);

  // URLs
  const baseUrlEval = 'https://aims-plus-evalution.web.app';
  const baseUrlKondotty = 'https://aims-kondotty1.web.app';
  
  const formPath = '/form/compensation';
  const adminPath = '/admin/compensation';

  const formUrlEval = `${baseUrlEval}${formPath}`;
  const adminUrlEval = `${baseUrlEval}${adminPath}`;
  
  const formUrlKondotty = `${baseUrlKondotty}${formPath}`;
  const adminUrlKondotty = `${baseUrlKondotty}${adminPath}`;

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const data = await getCompensationResponses();
      setResponses(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load compensation requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this response?')) return;
    setDeletingId(id);
    try {
      await deleteCompensationResponse(id);
      setResponses(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete response.');
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLinkType(type);
    setTimeout(() => setCopiedLinkType(null), 2000);
  };

  // Filtered responses
  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      const matchesSearch = 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.phone && r.phone.includes(searchQuery)) ||
        (r.reason && r.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.selectedChapters.some(c => 
          c.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.teacher && c.teacher.toLowerCase().includes(searchQuery.toLowerCase()))
        );

      const matchesSubject = selectedSubject === 'All' || 
        r.selectedChapters.some(c => c.subject === selectedSubject);

      const matchesBatch = selectedBatch === 'All' || 
        (r.studentClass || 'A2') === selectedBatch;

      return matchesSearch && matchesSubject && matchesBatch;
    });
  }, [responses, searchQuery, selectedSubject, selectedBatch]);

  // Analytics stats
  const totalStudents = responses.length;
  const totalChapterRequests = useMemo(() => {
    return responses.reduce((acc, r) => acc + (r.selectedChapters?.length || 0), 0);
  }, [responses]);

  const topRequestedChapter = useMemo(() => {
    const map: Record<string, number> = {};
    responses.forEach(r => {
      r.selectedChapters?.forEach(c => {
        const key = `${c.subject}: ${c.chapter}`;
        map[key] = (map[key] || 0) + 1;
      });
    });
    let topName = 'N/A';
    let maxCount = 0;
    Object.entries(map).forEach(([key, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topName = key;
      }
    });
    return { name: topName, count: maxCount };
  }, [responses]);

  // Export to Excel using exceljs
  const exportToExcel = async () => {
    if (filteredResponses.length === 0) {
      alert('No data available to export.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('A2 Compensation Requests');

    // Title Row
    worksheet.addRow(['AIMS Plus Learning Centre - Batch A2 Compensation Class Requests']);
    worksheet.mergeCells('A1:G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' } // Indigo-600
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 36;

    // Subtitle Row
    worksheet.addRow([
      `Exported: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} | Total Students: ${filteredResponses.length} | Batch: A2`
    ]);
    worksheet.mergeCells('A2:G2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF4B5563' } };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(2).height = 20;

    // Header Row
    const headerRowData = [
      'No.',
      'Student Name',
      'Class',
      'Phone / WhatsApp',
      'Requested Chapters (Subject & Teacher)',
      'Total Chapters',
      'Reason / Notes',
      'Submission Date'
    ];
    worksheet.addRow(headerRowData);

    const headerRow = worksheet.getRow(3);
    headerRow.height = 26;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1F2937' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E7FF' } // Indigo-100
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFC7D2FE' } },
        bottom: { style: 'medium', color: { argb: 'FF818CF8' } },
        left: { style: 'thin', color: { argb: 'FFC7D2FE' } },
        right: { style: 'thin', color: { argb: 'FFC7D2FE' } }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Populate rows
    filteredResponses.forEach((r, idx) => {
      const chaptersText = r.selectedChapters
        .map(c => `${c.chapter} (${c.subject}${c.teacher ? ` - ${c.teacher}` : ''})`)
        .join(', ');

      const rowData = [
        idx + 1,
        r.name,
        r.studentClass || 'A2',
        r.phone || 'N/A',
        chaptersText,
        r.selectedChapters.length,
        r.reason || 'None',
        r.submittedAt ? new Date(r.submittedAt).toLocaleString() : 'N/A'
      ];

      worksheet.addRow(rowData);
      const row = worksheet.getRow(4 + idx);
      row.height = 22;

      row.eachCell((cell, colNum) => {
        cell.font = { name: 'Arial', size: 9 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFF3F4F6' } },
          bottom: { style: 'thin', color: { argb: 'FFF3F4F6' } },
          left: { style: 'thin', color: { argb: 'FFF3F4F6' } },
          right: { style: 'thin', color: { argb: 'FFF3F4F6' } }
        };

        if (colNum === 2 || colNum === 5 || colNum === 7) {
          cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        if (colNum === 6) {
          cell.font = { name: 'Arial', size: 9, bold: true };
        }
      });
    });

    // Column widths
    worksheet.columns = [
      { width: 6 },   // No
      { width: 24 },  // Name
      { width: 10 },  // Class
      { width: 16 },  // Phone
      { width: 50 },  // Chapters
      { width: 14 },  // Total Chapters
      { width: 30 },  // Reason
      { width: 22 }   // Date
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `A2_Compensation_Class_Requests_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const getSubjectBadge = (subject: string) => {
    switch (subject) {
      case 'Physics':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Chemistry':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Mathematics':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Zoology':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          {!hideBack && onBack && (
            <button
              onClick={onBack}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-[11px] font-extrabold rounded-md uppercase tracking-wider">
                Batch A2
              </span>
              <span className="text-xs text-slate-400 font-medium">• Admin Dashboard</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-0.5">
              Compensation Class Responses
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowShareModal(true)}
            className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 border border-indigo-200"
          >
            <Share2 className="w-4 h-4" />
            Share Links
          </button>

          <button
            onClick={fetchResponses}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={exportToExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-200 flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalStudents}</div>
            <div className="text-xs font-semibold text-slate-500">Total Student Requests</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalChapterRequests}</div>
            <div className="text-xs font-semibold text-slate-500">Total Chapter Requests</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-slate-900 truncate" title={topRequestedChapter.name}>
              {topRequestedChapter.name}
            </div>
            <div className="text-xs font-semibold text-slate-500">
              Most Requested ({topRequestedChapter.count} times)
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search student, chapter, teacher..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs transition-all outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none focus:border-indigo-500"
          >
            <option value="All">All Batches</option>
            <option value="A1">Batch A1</option>
            <option value="A2">Batch A2</option>
          </select>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white outline-none focus:border-indigo-500"
          >
            <option value="All">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Zoology">Zoology</option>
          </select>
        </div>
      </div>

      {/* Responses Section (Mobile Cards & Desktop Table) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
            Loading compensation class requests...
          </div>
        ) : filteredResponses.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No compensation class requests found. Share the form link to start collecting requests.
          </div>
        ) : (
          <>
            {/* Mobile View: Card Stack */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredResponses.map((r, index) => (
                <div key={r.id || index} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{r.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold rounded text-[10px]">
                          {r.studentClass || 'A2'}
                        </span>
                        {r.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {r.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => r.id && handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Requested Chapters ({r.selectedChapters.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {r.selectedChapters.map((ch, idx) => (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getSubjectBadge(ch.subject)}`}
                        >
                          {ch.chapter}
                          {ch.teacher && <span className="ml-1 opacity-75 font-mono">[{ch.teacher}]</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  {r.reason && (
                    <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-slate-700">
                      <span className="font-semibold text-slate-500 block text-[10px]">Notes / Reason:</span>
                      {r.reason}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 flex items-center gap-1 border-t border-slate-100 pt-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4 text-center">#</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4 text-center">Class</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Requested Chapters</th>
                    <th className="py-3.5 px-4">Reason / Notes</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredResponses.map((r, index) => (
                    <tr key={r.id || index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 text-center font-mono text-slate-400 font-semibold">
                        {index + 1}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">
                        {r.name}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 font-extrabold rounded text-xs">
                          {r.studentClass || 'A2'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium">
                        {r.phone || 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {r.selectedChapters.map((ch, idx) => (
                            <span
                              key={idx}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getSubjectBadge(ch.subject)}`}
                            >
                              {ch.chapter}
                              {ch.teacher && <span className="ml-1 opacity-75 font-mono">[{ch.teacher}]</span>}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 max-w-xs truncate" title={r.reason}>
                        {r.reason || '—'}
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                        {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => r.id && handleDelete(r.id)}
                          disabled={deletingId === r.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Share Links Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-600" />
                Share Links (Batch A2)
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Primary Published Domain: aims-plus-evalution */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">
                  Primary Published Domain (aims-plus-evalution)
                </span>

                {/* Form Link */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Student Form URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={formUrlEval}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-800"
                    />
                    <button
                      onClick={() => copyToClipboard(formUrlEval, 'formEval')}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition-all"
                    >
                      {copiedLinkType === 'formEval' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLinkType === 'formEval' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Admin Link */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Admin Dashboard URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={adminUrlEval}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-800"
                    />
                    <button
                      onClick={() => copyToClipboard(adminUrlEval, 'adminEval')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition-all"
                    >
                      {copiedLinkType === 'adminEval' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLinkType === 'adminEval' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Alternative Domain: aims-kondotty1 */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Secondary Domain (aims-kondotty1)
                </span>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Student Form URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={formUrlKondotty}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-800"
                    />
                    <button
                      onClick={() => copyToClipboard(formUrlKondotty, 'formKon')}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition-all"
                    >
                      {copiedLinkType === 'formKon' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLinkType === 'formKon' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Admin Dashboard URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={adminUrlKondotty}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-800"
                    />
                    <button
                      onClick={() => copyToClipboard(adminUrlKondotty, 'adminKon')}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition-all"
                    >
                      {copiedLinkType === 'adminKon' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLinkType === 'adminKon' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
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
