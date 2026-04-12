import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { ArrowLeft, Upload, Printer, BarChart2, Search, FileText, Edit2 } from 'lucide-react';
import PrintableScoreCards from './PrintableScoreCards';
import { StudentScoreRecord } from './index';

interface ScoreAnalysisDashboardProps {
  onBack: () => void;
}

export default function ScoreAnalysisDashboard({ onBack }: ScoreAnalysisDashboardProps) {
  const [students, setStudents] = useState<StudentScoreRecord[]>([]);
  const [scoreHeaders, setScoreHeaders] = useState<string[]>([]);
  const [showPrintView, setShowPrintView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Report Title for Printing the Big List
  const [reportTitle, setReportTitle] = useState('AIMS PLUS - Score Analysis Report');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      if (data.length < 1) {
        alert("No data found in file.");
        return;
      }

      const headers = data[0] as string[];
      
      // Try to find the Name column. Default to index 1 if not explicitly labeled 'NAME'.
      let nameIdx = headers.findIndex(h => h && String(h).toUpperCase().includes('NAME'));
      if (nameIdx === -1) nameIdx = 1;

      // Filter score columns (exclude Sl No, Name, Phone numbers)
      const excludeRegex = /SL\s*NO|NAME|PARENT|WHATSAPP|PHONE|NO\./i;
      const validScoreIndices: number[] = [];
      const extractedHeaders: string[] = [];

      headers.forEach((h, i) => {
        if (!h) return;
        const strH = String(h);
        if (i !== nameIdx && !excludeRegex.test(strH)) {
          validScoreIndices.push(i);
          extractedHeaders.push(strH);
        }
      });

      const parsedStudents: StudentScoreRecord[] = [];

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[nameIdx]) continue;

        const scores: Record<string, string | number> = {};
        validScoreIndices.forEach((colIdx, headerArrayIdx) => {
          const headerName = extractedHeaders[headerArrayIdx];
          scores[headerName] = row[colIdx] !== undefined && row[colIdx] !== '' ? row[colIdx] : '-';
        });

        parsedStudents.push({
          name: String(row[nameIdx]).trim(),
          scores
        });
      }

      setScoreHeaders(extractedHeaders);
      setStudents(parsedStudents);
      
      // Auto-set title to filename (without extension) if imported
      setReportTitle(`Score Analysis - ${file.name.replace(/\.[^/.]+$/, "")}`);

    } catch (err) {
      console.error(err);
      alert("Failed to parse file. Please ensure it's a valid CSV/Excel file.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrintTable = () => {
    window.print();
  };

  if (showPrintView) {
    return (
      <PrintableScoreCards 
        students={students} 
        scoreHeaders={scoreHeaders} 
        onBack={() => setShowPrintView(false)} 
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 print:p-0 print:m-0 print:max-w-none">
      
      <style>{`
        @media print {
          @page { size: landscape; margin: 1cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .print-no-overflow { overflow: visible !important; }
        }
      `}</style>

      {/* Header - Hidden on Print */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-200">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h2>Score Data Analysis</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <input 
            type="file" 
            accept=".csv, .xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Import CSV/XLSX
          </button>
          <button
            onClick={handlePrintTable}
            disabled={students.length === 0}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Print Big List
          </button>
          <button
            onClick={() => setShowPrintView(true)}
            disabled={students.length === 0}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print Cards
          </button>
        </div>
      </div>

      {/* Printable Header - Visible only on Print */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-3xl font-black text-gray-900 uppercase tracking-wider border-b-2 border-gray-900 pb-4 inline-block px-8">
          {reportTitle}
        </h1>
        <p className="text-gray-500 font-medium mt-2">
          Generated on {new Date().toLocaleDateString()} | Total Students: {filteredStudents.length}
        </p>
      </div>

      {/* Main Content Area */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-200 print:border-none print:shadow-none print:p-0">
        
        {/* Toolbar & Title Editor - Hidden on Print */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 print:hidden">
          
          <div className="flex items-center gap-2 group flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2 w-full max-w-md">
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full text-lg font-bold text-gray-900 border-b-2 border-teal-500 outline-none bg-transparent px-1 py-1"
                  autoFocus
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                />
              </div>
            ) : (
              <>
                <h3 className="font-bold text-gray-800 text-lg md:text-xl truncate" title="Click to edit print title">
                  {reportTitle}
                </h3>
                <button 
                  onClick={() => setIsEditingTitle(true)}
                  className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                  title="Edit title for printing"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search student name..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 text-sm font-medium transition-colors outline-none" 
            />
          </div>
        </div>

        {/* Data Table */}
        {students.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 print:hidden">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
              <Upload className="w-8 h-8 text-teal-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Data Imported</h3>
            <p className="text-gray-500 font-medium">Upload a CSV or Excel file to view and analyze score data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto print-no-overflow border border-gray-200 rounded-xl shadow-sm print:border-gray-400 print:shadow-none">
            <table className="w-full text-left border-collapse min-w-[600px] print:min-w-full">
              <thead>
                <tr className="bg-slate-100 print:bg-gray-200 border-b border-gray-300">
                  <th className="p-3 text-xs md:text-sm font-black text-slate-700 uppercase tracking-wider sticky left-0 bg-slate-100 print:bg-gray-200 shadow-[1px_0_0_0_#cbd5e1] print:shadow-none z-10 w-12 text-center">
                    #
                  </th>
                  <th className="p-3 text-xs md:text-sm font-black text-slate-700 uppercase tracking-wider sticky left-[48px] bg-slate-100 print:bg-gray-200 shadow-[1px_0_0_0_#cbd5e1] print:shadow-none z-10">
                    Student Name
                  </th>
                  {scoreHeaders.map((header, idx) => (
                    <th key={idx} className="p-3 text-xs md:text-sm font-black text-slate-700 uppercase tracking-wider text-center border-l border-gray-200">
                      {header.replace(/Score\s*\(?/i, '').replace(/\)/g, '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 print:divide-gray-300">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={scoreHeaders.length + 2} className="p-8 text-center text-gray-500 font-medium">
                      No records match your search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, i) => (
                    <tr key={i} className="hover:bg-teal-50/50 transition-colors group break-inside-avoid even:bg-slate-50/50 print:even:bg-gray-50">
                      <td className="p-3 text-sm font-bold text-gray-500 text-center sticky left-0 bg-white group-hover:bg-teal-50 even:bg-slate-50/50 print:bg-transparent shadow-[1px_0_0_0_#e5e7eb] print:shadow-none z-10">
                        {i + 1}
                      </td>
                      <td className="p-3 font-bold text-sm md:text-base text-gray-900 sticky left-[48px] bg-white group-hover:bg-teal-50 even:bg-slate-50/50 print:bg-transparent shadow-[1px_0_0_0_#e5e7eb] print:shadow-none z-10 truncate max-w-[200px] sm:max-w-xs">
                        {student.name}
                      </td>
                      {scoreHeaders.map((header, hIdx) => {
                        const val = student.scores[header];
                        const isNumber = !isNaN(Number(val)) && val !== '-';
                        return (
                          <td key={hIdx} className="p-3 text-sm md:text-base text-center border-l border-gray-100 print:border-gray-300">
                            <span className={isNumber ? "font-black text-indigo-700 print:text-black" : "font-medium text-gray-400"}>
                              {val}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}