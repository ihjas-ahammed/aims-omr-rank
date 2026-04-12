import React, { useState } from 'react';
import { ArrowLeft, Printer, Settings2 } from 'lucide-react';
import { StudentScoreRecord } from './index';

interface PrintableScoreCardsProps {
  students: StudentScoreRecord[];
  scoreHeaders: string[];
  onBack: () => void;
}

export default function PrintableScoreCards({ students, scoreHeaders, onBack }: PrintableScoreCardsProps) {
  const [title, setTitle] = useState('WEEKLY SCORE REPORT');
  const [subtitle, setSubtitle] = useState('AIMS PLUS TRACK RECORD');
  
  // By default, select the last 7 columns to fit perfectly on standard printed cards
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>(
    scoreHeaders.slice(Math.max(0, scoreHeaders.length - 7))
  );

  const [cardsPerRow, setCardsPerRow] = useState<number>(2);

  const handleToggleHeader = (header: string) => {
    setSelectedHeaders(prev => {
      if (prev.includes(header)) {
        return prev.filter(h => h !== header);
      } else {
        return [...prev, header];
      }
    });
  };

  const formatHeader = (h: string) => {
    // Simplify headers like "Score (07/04/25)" to "07/04/25"
    return h.replace(/Score\s*\(?/i, '').replace(/\)/g, '').trim();
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black print:bg-white pb-12">
      {/* Print Settings Toolbar */}
      <div className="print:hidden mb-6 p-4 md:p-6 bg-white border-b border-gray-200 text-gray-900 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-200">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
                  <Settings2 className="w-5 h-5" />
                </div>
                Print Setup
              </h2>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-md hover:shadow-lg w-full md:w-auto justify-center active:scale-95"
            >
              <Printer className="w-5 h-5" />
              Print Cards
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Main Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-bold text-slate-900 outline-none transition-shadow shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-bold text-slate-900 outline-none transition-shadow shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cards per row (Print)</label>
              <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl border border-slate-200">
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => setCardsPerRow(num)}
                    className={`flex-1 py-2 rounded-lg text-sm font-black transition-all ${cardsPerRow === num ? 'bg-white text-teal-700 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-800'}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Select Columns to Print <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md ml-2">{selectedHeaders.length} selected</span>
            </label>
            <div className="flex flex-wrap gap-2.5">
              {scoreHeaders.map(h => (
                <label key={h} className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs sm:text-sm font-bold transition-all shadow-sm ${selectedHeaders.includes(h) ? 'bg-teal-50 border-teal-300 text-teal-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedHeaders.includes(h)} 
                    onChange={() => handleToggleHeader(h)} 
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                  />
                  {formatHeader(h)}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 0.5cm; }
          .print-grid {
            grid-template-columns: repeat(${cardsPerRow}, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Cards Area */}
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto print:max-w-none print:p-0">
        <div className={`grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 print-grid`}>
          {students.map((student, idx) => (
            <div 
              key={idx} 
              className="rounded-2xl shadow-md bg-white flex flex-col h-full overflow-hidden break-inside-avoid border border-gray-200 print:shadow-sm"
            >
              {/* Colorful Banner */}
              <div className="bg-gradient-to-r from-teal-600 to-emerald-500 p-4 sm:p-5 text-center text-white relative">
                <div className="absolute top-0 right-0 bg-black/10 px-3 py-1 rounded-bl-xl font-bold text-xs">
                  #{idx + 1}
                </div>
                <h2 className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-teal-100 opacity-90">{subtitle}</h2>
                <h1 className="text-lg md:text-xl font-black uppercase tracking-wide mt-1 leading-tight drop-shadow-sm">{title}</h1>
              </div>
              
              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col bg-slate-50/30">
                <div className="mb-5 text-center">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Student Name</div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight drop-shadow-sm line-clamp-2">{student.name}</h3>
                </div>

                <div className="mt-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-teal-50">
                        {selectedHeaders.map((h, i) => (
                          <th key={h} className={`border-b-2 border-teal-200 px-1 py-2 text-[9px] sm:text-[10px] font-bold text-teal-800 uppercase text-center leading-tight ${i !== selectedHeaders.length - 1 ? 'border-r border-teal-100/50' : ''}`}>
                            {formatHeader(h)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {selectedHeaders.map((h, i) => {
                          const val = student.scores[h];
                          const isNumber = !isNaN(Number(val)) && val !== '-';
                          return (
                            <td key={h} className={`px-1 py-3 text-center text-base sm:text-lg font-black border-r last:border-r-0 border-gray-100 bg-white ${isNumber ? 'text-gray-800' : 'text-gray-300'}`}>
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}