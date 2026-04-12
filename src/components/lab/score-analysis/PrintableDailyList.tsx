import React, { useState, useMemo } from 'react';
import { ArrowLeft, Printer, Settings2 } from 'lucide-react';
import { StudentScoreRecord } from './index';

interface PrintableDailyListProps {
  students: StudentScoreRecord[];
  scoreColumn: string;
  onBack: () => void;
}

export default function PrintableDailyList({ students, scoreColumn, onBack }: PrintableDailyListProps) {
  const formattedDate = scoreColumn.replace(/Score\s*\(?/i, '').replace(/\)/g, '').trim();
  
  const [title, setTitle] = useState('DAILY SCORE REPORT');
  const [subtitle, setSubtitle] = useState('AIMS PLUS');
  const [examDate, setExamDate] = useState(formattedDate);

  // Process data: Filter out absentees/invalid scores, convert to number, sort descending
  const rankedStudents = useMemo(() => {
    const validStudents = students
      .filter(s => {
        const val = s.scores[scoreColumn];
        return val !== undefined && val !== '-' && val !== '' && !isNaN(Number(val));
      })
      .map(s => ({
        ...s,
        numScore: Number(s.scores[scoreColumn])
      }))
      .sort((a, b) => b.numScore - a.numScore); // Sort Highest to Lowest

    // Assign dense ranking (1, 2, 2, 4...)
    let currentRank = 1;
    return validStudents.map((s, index) => {
      if (index > 0 && validStudents[index - 1].numScore !== s.numScore) {
        currentRank = index + 1;
      }
      return { ...s, rank: currentRank };
    });
  }, [students, scoreColumn]);

  return (
    <div className="min-h-screen bg-gray-100 text-black print:bg-white pb-12">
      {/* Print Settings Toolbar */}
      <div className="print:hidden mb-6 p-4 md:p-6 bg-white border-b border-gray-200 text-gray-900 shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-200">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Settings2 className="w-5 h-5" />
                </div>
                Daily Print Setup
              </h2>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg w-full md:w-auto justify-center active:scale-95"
            >
              <Printer className="w-5 h-5" />
              Print Daily Report
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Main Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-bold text-slate-900 outline-none transition-shadow shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subtitle</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-bold text-slate-900 outline-none transition-shadow shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Exam Date / Column</label>
              <input
                type="text"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-bold text-slate-900 outline-none transition-shadow shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 1cm; size: portrait; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
        }
      `}</style>

      {/* Printable Area */}
      <div className="p-4 md:p-8 pt-0 max-w-4xl mx-auto print:max-w-none print:p-0 bg-white shadow-xl print:shadow-none min-h-[297mm]">
        
        {/* Beautiful Header */}
        <div className="text-center mb-8 border-b-4 border-indigo-600 pb-6 pt-8">
          <h2 className="text-sm md:text-base font-bold text-indigo-600 uppercase tracking-[0.3em] mb-2">{subtitle}</h2>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider text-gray-900 mb-3">{title}</h1>
          <div className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-800 px-6 py-2 rounded-full font-bold text-lg shadow-sm">
            {examDate}
          </div>
        </div>

        {/* Results Table */}
        {rankedStudents.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium">
            No valid scores found for this date.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-y-2 border-gray-300">
                <th className="py-3 px-4 text-sm font-black text-gray-600 uppercase tracking-wider w-20 text-center">Rank</th>
                <th className="py-3 px-4 text-sm font-black text-gray-600 uppercase tracking-wider">Student Name</th>
                <th className="py-3 px-4 text-sm font-black text-gray-600 uppercase tracking-wider w-32 text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rankedStudents.map((student, idx) => {
                // Highlight Top 3 rows
                let rowBg = 'bg-white';
                let rankColor = 'text-gray-500';
                
                if (student.rank === 1) {
                  rowBg = 'bg-yellow-50/50';
                  rankColor = 'text-yellow-600';
                } else if (student.rank === 2) {
                  rowBg = 'bg-slate-50';
                  rankColor = 'text-slate-500';
                } else if (student.rank === 3) {
                  rowBg = 'bg-orange-50/30';
                  rankColor = 'text-orange-500';
                }

                return (
                  <tr key={idx} className={`${rowBg} break-inside-avoid`}>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-black text-sm ${student.rank <= 3 ? 'bg-white shadow-sm border border-gray-200' : ''} ${rankColor}`}>
                        {student.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${student.rank <= 3 ? 'text-gray-900 text-lg' : 'text-gray-800 text-base'}`}>
                        {student.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-black ${student.rank <= 3 ? 'text-indigo-700 text-xl' : 'text-indigo-600 text-lg'}`}>
                        {student.numScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="mt-8 text-center text-sm font-medium text-gray-400 pb-8">
          Total Students Present: {rankedStudents.length}
        </div>

      </div>
    </div>
  );
}