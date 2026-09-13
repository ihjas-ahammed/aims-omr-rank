import React, { useState, useEffect, useMemo } from 'react';
import { 
  getClass10Term1Responses, 
  deleteClass10Term1Response, 
  Class10Term1Response,
  SCERT_CLASS_10_SUBJECTS,
  TOTAL_MAX_MARKS,
  calculateSSLCGrade
} from '../../../services/class10Term1Service';
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
  Filter, 
  ExternalLink,
  Award, 
  TrendingUp, 
  Eye, 
  Printer, 
  X, 
  Sparkles,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface Class10Term1AdminProps {
  onBack?: () => void;
  hideBack?: boolean;
}

export default function Class10Term1Admin({ onBack, hideBack = false }: Class10Term1AdminProps) {
  const [responses, setResponses] = useState<Class10Term1Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'marks_desc' | 'marks_asc' | 'name' | 'newest'>('marks_desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<Class10Term1Response | null>(null);

  const formUrl = `${window.location.origin}/form/class-10-term-1`;

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const data = await getClass10Term1Responses();
      setResponses(data);
    } catch (err) {
      console.error('Failed to load class 10 responses:', err);
      alert('Failed to load responses. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

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

  const handleDelete = async (id: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to delete the record for "${studentName}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteClass10Term1Response(id);
      setResponses(prev => prev.filter(r => r.id !== id));
      if (viewingRecord?.id === id) {
        setViewingRecord(null);
      }
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

  // Distinct classes for filter dropdown (defaults to Class E1 and Class M1)
  const availableClasses = useMemo(() => {
    const set = new Set<string>(['Class E1', 'Class M1']);
    responses.forEach(r => {
      if (r.className && r.className.trim()) set.add(r.className.trim());
    });
    return Array.from(set).sort();
  }, [responses]);

  // Filtered and Sorted responses
  const filteredResponses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const list = responses.filter(r => {
      const matchesSearch = !q ||
        r.studentName.toLowerCase().includes(q) ||
        (r.className && r.className.toLowerCase().includes(q));

      const matchesClass = selectedClass === 'All' || r.className.trim().toLowerCase() === selectedClass.toLowerCase();

      return matchesSearch && matchesClass;
    });

    list.sort((a, b) => {
      if (sortBy === 'marks_desc') {
        return (b.totalMarks || 0) - (a.totalMarks || 0);
      }
      if (sortBy === 'marks_asc') {
        return (a.totalMarks || 0) - (b.totalMarks || 0);
      }
      if (sortBy === 'name') {
        return a.studentName.localeCompare(b.studentName);
      }
      // 'newest'
      const timeA = a.submittedAt ? new Date(a.submittedAt?.toDate?.() || a.submittedAt).getTime() : 0;
      const timeB = b.submittedAt ? new Date(b.submittedAt?.toDate?.() || b.submittedAt).getTime() : 0;
      return timeB - timeA;
    });

    return list;
  }, [responses, searchQuery, selectedClass, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    if (filteredResponses.length === 0) {
      return { total: 0, avgScore: 0, avgPercentage: 0, highestScore: 0, fullAPlus: 0 };
    }

    const total = filteredResponses.length;
    let sumScore = 0;
    let highest = 0;
    let aPlusCount = 0;

    filteredResponses.forEach(r => {
      const score = r.totalMarks || 0;
      sumScore += score;
      if (score > highest) highest = score;
      if (r.grade === 'A+' || r.percentage >= 90) {
        aPlusCount++;
      }
    });

    const avgScore = Math.round((sumScore / total) * 10) / 10;
    const avgPercentage = Math.round(((sumScore / total) / TOTAL_MAX_MARKS * 100) * 10) / 10;

    return {
      total,
      avgScore,
      avgPercentage,
      highestScore: highest,
      fullAPlus: aPlusCount
    };
  }, [filteredResponses]);

  // Excel Export with ExcelJS
  const exportToExcel = async () => {
    if (filteredResponses.length === 0) {
      alert('No data to export.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INSPIRE Cheekkode';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Class 10 Term 1 Marks', {
      views: [{ showGridLines: true }]
    });

    // Title Block
    worksheet.mergeCells('A1:Q1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'INSPIRE CHEEKKODE — CLASS 10 TERM 1 MARKS REGISTER';
    titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4338CA' } // Indigo-700
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 36;

    // Subtitle Block
    worksheet.mergeCells('A2:Q2');
    const subCell = worksheet.getCell('A2');
    subCell.value = `Export Date: ${new Date().toLocaleDateString('en-GB')} | Total Candidates: ${filteredResponses.length} | Max Aggregate: ${TOTAL_MAX_MARKS}`;
    subCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF374151' } };
    subCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E7FF' } // Indigo-100
    };
    subCell.alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(2).height = 24;

    worksheet.addRow([]); // Blank spacer

    // Header Row
    const headerRow = worksheet.addRow([
      'Sl No',
      'Student Name',
      'Class',
      'FL 1 (40)',
      'FL 2 (40)',
      'English (80)',
      'Hindi (40)',
      'Social Science (80)',
      'Physics (40)',
      'Chemistry (40)',
      'Biology (40)',
      'Maths (80)',
      `Total (${TOTAL_MAX_MARKS})`,
      'Percentage',
      'Grade',
      'Submission Date'
    ]);

    headerRow.height = 26;
    headerRow.eachCell(cell => {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' } // Slate-800
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        bottom: { style: 'medium', color: { argb: 'FF64748B' } },
        left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
        right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
      };
    });

    // Data Rows
    filteredResponses.forEach((rec, idx) => {
      let dateStr = '—';
      if (rec.submittedAt) {
        try {
          const d = rec.submittedAt?.toDate ? rec.submittedAt.toDate() : new Date(rec.submittedAt);
          dateStr = d.toLocaleDateString('en-GB') + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
          dateStr = String(rec.submittedAt);
        }
      }

      const row = worksheet.addRow([
        idx + 1,
        rec.studentName,
        rec.className,
        rec.subjects['mal1'] !== null && rec.subjects['mal1'] !== undefined ? rec.subjects['mal1'] : '—',
        rec.subjects['mal2'] !== null && rec.subjects['mal2'] !== undefined ? rec.subjects['mal2'] : '—',
        rec.subjects['eng'] !== null && rec.subjects['eng'] !== undefined ? rec.subjects['eng'] : '—',
        rec.subjects['hin'] !== null && rec.subjects['hin'] !== undefined ? rec.subjects['hin'] : '—',
        rec.subjects['ss'] !== null && rec.subjects['ss'] !== undefined ? rec.subjects['ss'] : '—',
        rec.subjects['phy'] !== null && rec.subjects['phy'] !== undefined ? rec.subjects['phy'] : '—',
        rec.subjects['chem'] !== null && rec.subjects['chem'] !== undefined ? rec.subjects['chem'] : '—',
        rec.subjects['bio'] !== null && rec.subjects['bio'] !== undefined ? rec.subjects['bio'] : '—',
        rec.subjects['math'] !== null && rec.subjects['math'] !== undefined ? rec.subjects['math'] : '—',
        rec.totalMarks,
        `${rec.percentage}%`,
        rec.grade,
        dateStr
      ]);

      row.height = 22;
      const isEven = idx % 2 === 0;

      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Calibri', size: 10 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };

        // Alignments
        if (colNumber === 2) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
          cell.font = { name: 'Calibri', size: 10, bold: true };
        } else if (colNumber === 16) {
          // Total column
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E1B4B' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF2FF' } };
        } else if (colNumber === 18) {
          // Grade column
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF065F46' } };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });
    });

    // Auto fit column widths
    worksheet.columns.forEach((col, i) => {
      if (i === 0) col.width = 8;
      else if (i === 1) col.width = 24;
      else if (i === 2 || i === 3) col.width = 14;
      else if (i >= 5 && i <= 14) col.width = 13;
      else if (i === 15) col.width = 14;
      else if (i === 18) col.width = 20;
      else col.width = 12;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const filename = `INSPIRE_Cheekkode_Class10_Term1_Marks_${new Date().toISOString().split('T')[0]}.xlsx`;
    saveAs(blob, filename);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/20 py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER BRANDING CARD */}
        {/* User requirement: "Also in the header instead of wind plus Just write INSPIRE Cheekkode That's all we need" */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                {!hideBack && onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors mr-1 cursor-pointer"
                    title="Go Back"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider border border-indigo-100/80">
                  Admin Evaluation Hub
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                INSPIRE Cheekkode
              </h1>
              <p className="text-slate-600 text-sm mt-1 font-medium">
                Class 10 Term 1 Marks Administration & Performance Register
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={copyFormLink}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Form Link'}</span>
              </button>

              <a
                href="/form/class-10-term-1"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Form</span>
              </a>

              <button
                type="button"
                onClick={exportToExcel}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-100 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={fetchResponses}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                title="Refresh Records"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* STATISTICS SUMMARY BAR */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidates</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class Average</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {stats.avgScore} <span className="text-xs font-semibold text-slate-400">({stats.avgPercentage}%)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Score</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">
                {stats.highestScore} <span className="text-xs font-semibold text-slate-400">/ {TOTAL_MAX_MARKS}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full A+ Achievers</div>
              <div className="text-2xl font-black text-emerald-600 mt-0.5">
                {stats.fullAPlus}
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH, FILTER & SORT CONTROLS */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by student name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase">Class:</span>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
            >
              <option value="All">All Classes</option>
              {availableClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
            >
              <option value="marks_desc">Total Marks (High to Low)</option>
              <option value="marks_asc">Total Marks (Low to High)</option>
              <option value="name">Student Name (A-Z)</option>
              <option value="newest">Submission (Newest First)</option>
            </select>
          </div>

        </div>

        {/* RESPONSES TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm font-semibold">Loading Class 10 submissions...</p>
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3 px-4">
              <BookOpen className="w-12 h-12 text-slate-300 stroke-1" />
              <p className="text-base font-bold text-slate-700">No submissions found</p>
              <p className="text-xs text-slate-400 max-w-sm">
                No marks have been recorded yet or no records match your filter criteria. Share the form link to start collecting.
              </p>
              <a
                href="/form/class-10-term-1"
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Go to Form</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-black tracking-wider text-[10px]">
                    <th className="py-3.5 px-4 text-center w-12">#</th>
                    <th className="py-3.5 px-4 min-w-[160px]">Student</th>
                    <th className="py-3.5 px-3 min-w-[90px]">Class</th>
                    <th className="py-3.5 px-2 text-center" title="First Language 1 (Max 40)">FL1 (40)</th>
                    <th className="py-3.5 px-2 text-center" title="First Language 2 (Max 40)">FL2 (40)</th>
                    <th className="py-3.5 px-2 text-center" title="English (Max 80)">ENG (80)</th>
                    <th className="py-3.5 px-2 text-center" title="Hindi (Max 40)">HIN (40)</th>
                    <th className="py-3.5 px-2 text-center" title="Social Science (Max 80)">SS (80)</th>
                    <th className="py-3.5 px-2 text-center" title="Physics (Max 40)">PHY (40)</th>
                    <th className="py-3.5 px-2 text-center" title="Chemistry (Max 40)">CHE (40)</th>
                    <th className="py-3.5 px-2 text-center" title="Biology (Max 40)">BIO (40)</th>
                    <th className="py-3.5 px-2 text-center" title="Mathematics (Max 80)">MATH (80)</th>
                    <th className="py-3.5 px-4 text-center min-w-[90px] bg-indigo-50/70 text-indigo-900">Total ({TOTAL_MAX_MARKS})</th>
                    <th className="py-3.5 px-3 text-center min-w-[70px]">Grade</th>
                    <th className="py-3.5 px-4 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredResponses.map((r, index) => {
                    const gradeColor = 
                      r.grade === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                      r.grade === 'A' ? 'bg-teal-100 text-teal-800' :
                      r.grade === 'B+' || r.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                      r.grade === 'C+' || r.grade === 'C' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-600';

                    return (
                      <tr key={r.id || index} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-center font-bold text-slate-400">
                          {index + 1}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-sm">{r.studentName}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded font-bold text-xs">
                            {r.className}
                          </span>
                        </td>

                        {/* Subject Columns */}
                        <td className="py-3 px-2 text-center font-semibold text-slate-700">
                          {r.subjects['mal1'] !== null && r.subjects['mal1'] !== undefined ? r.subjects['mal1'] : '—'}
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-slate-700">
                          {r.subjects['mal2'] !== null && r.subjects['mal2'] !== undefined ? r.subjects['mal2'] : '—'}
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-slate-700">
                          {r.subjects['eng'] !== null && r.subjects['eng'] !== undefined ? r.subjects['eng'] : '—'}
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-slate-700">
                          {r.subjects['hin'] !== null && r.subjects['hin'] !== undefined ? r.subjects['hin'] : '—'}
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-slate-700">
                          {r.subjects['ss'] !== null && r.subjects['ss'] !== undefined ? r.subjects['ss'] : '—'}
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-slate-700">
                          {r.subjects['phy'] !== null && r.subjects['phy'] !== undefined ? r.subjects['phy'] : '—'}
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-slate-700">
                          {r.subjects['chem'] !== null && r.subjects['chem'] !== undefined ? r.subjects['chem'] : '—'}
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-slate-700">
                          {r.subjects['bio'] !== null && r.subjects['bio'] !== undefined ? r.subjects['bio'] : '—'}
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-slate-700">
                          {r.subjects['math'] !== null && r.subjects['math'] !== undefined ? r.subjects['math'] : '—'}
                        </td>

                        {/* Total Marks */}
                        <td className="py-3 px-4 text-center bg-indigo-50/50 font-black text-indigo-900 text-sm">
                          {r.totalMarks}
                          <span className="block text-[10px] font-bold text-indigo-400">{r.percentage}%</span>
                        </td>

                        {/* Grade */}
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-black ${gradeColor}`}>
                            {r.grade}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewingRecord(r)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="View Scorecard"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              disabled={deletingId === r.id}
                              onClick={() => r.id && handleDelete(r.id, r.studentName)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete Record"
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
          )}
        </div>

        {/* INDIVIDUAL SCORECARD MODAL */}
        {viewingRecord && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                    INSPIRE Cheekkode • Report Card
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">
                    {viewingRecord.studentName}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="font-semibold">{viewingRecord.className}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewingRecord(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Subject Scores List */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Class 10 SCERT Subject Performance
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {SCERT_CLASS_10_SUBJECTS.map(sub => {
                    const mark = viewingRecord.subjects[sub.id];
                    const hasMark = mark !== null && mark !== undefined;
                    const subPct = hasMark ? (mark / sub.maxMarks) * 100 : 0;
                    const subGrade = hasMark ? calculateSSLCGrade(subPct).grade : '—';

                    return (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                      >
                        <div className="font-medium text-slate-800">
                          {sub.id === 'mal1' ? `FL 1 (${viewingRecord.fl1Variant || 'Malayalam I'})` : sub.name}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900">
                            {hasMark ? mark : '—'} <span className="text-slate-400 font-normal">/ {sub.maxMarks}</span>
                          </span>
                          <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded font-black text-[11px]">
                            {subGrade}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Total Box */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">AGGREGATE TOTAL</div>
                  <div className="text-2xl font-black text-indigo-950 mt-0.5">
                    {viewingRecord.totalMarks} <span className="text-xs text-indigo-500 font-semibold">/ {TOTAL_MAX_MARKS}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">OVERALL GRADE</div>
                  <div className="flex items-center justify-end gap-2 mt-0.5">
                    <span className="text-base font-black text-indigo-700">{viewingRecord.percentage}%</span>
                    <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm font-black">
                      {viewingRecord.grade}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Scorecard</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingRecord(null)}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
