import React from 'react';
import { DescriptiveStudent } from './types';
import { ArrowLeft, Printer, Settings2 } from 'lucide-react';

interface Props {
  students: DescriptiveStudent[];
  onBack: () => void;
}

export default function DescriptivePrintView({ students, onBack }: Props) {
  // Filter evaluated students
  const validStudents = students.filter(s => s.status === 'success' && s.result);

  return (
    <div className="min-h-screen bg-gray-100 text-black print:bg-white pb-12">
      <div className="print:hidden mb-6 p-4 md:p-6 bg-white border-b border-gray-200 text-gray-900 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-200">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <Settings2 className="w-5 h-5" />
              </div>
              Print Evaluation Results
            </h2>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg w-full md:w-auto justify-center"
          >
            <Printer className="w-5 h-5" />
            Print Cards
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 1cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .print-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-4 print:p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:gap-4 print-grid">
          {validStudents.map((student, idx) => {
            const res = student.result!;
            const maxScore = res.maxTotalScore || res.breakdown.reduce((sum, b) => sum + b.maxScore, 0) || 1;
            
            return (
              <div key={student.id} className="bg-white rounded-2xl border border-gray-300 shadow-sm p-5 break-inside-avoid flex flex-col">
                <div className="mb-4 pb-3 border-b border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Student</div>
                  <h3 className="text-xl font-black text-gray-900 truncate leading-tight" title={student.name}>{student.name}</h3>
                  <div className="mt-2 text-lg font-bold text-gray-600">
                    Score: <span className="text-2xl font-black text-indigo-600">{res.totalScore}</span> / {maxScore}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {res.breakdown.map((q, i) => {
                    let dotColor = 'bg-gray-200';
                    if (q.colorLevel === 0) dotColor = 'bg-red-500';
                    else if (q.colorLevel === 1) dotColor = 'bg-orange-500';
                    else if (q.colorLevel === 2) dotColor = 'bg-yellow-400';
                    else if (q.colorLevel === 3) dotColor = 'bg-green-500';

                    return (
                      <div key={i} className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        <span className="text-xs font-bold text-gray-700 w-5">Q{q.questionNumber}</span>
                        <div className={`w-3.5 h-3.5 rounded-full ${dotColor} shadow-inner`} />
                      </div>
                    );
                  })}
                </div>
                
                {/* Optional tiny feedback snippet if fits */}
                <div className="mt-auto text-[11px] font-medium text-gray-500 line-clamp-3 bg-gray-50 p-2 rounded">
                  {res.feedback}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend / Key at bottom of print */}
        <div className="mt-12 bg-white p-6 rounded-2xl border border-gray-300 shadow-sm break-inside-avoid">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Evaluation Legend</h3>
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded-full shadow-inner"/> <span className="text-sm font-bold text-gray-700">R: No answer / Wrong</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-500 rounded-full shadow-inner"/> <span className="text-sm font-bold text-gray-700">O: Only attempt</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-yellow-400 rounded-full shadow-inner"/> <span className="text-sm font-bold text-gray-700">Y: Correct way, wrong value</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded-full shadow-inner"/> <span className="text-sm font-bold text-gray-700">G: All correct</span></div>
          </div>
          
          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl whitespace-pre-wrap font-medium">
            <span className="font-bold text-gray-800 uppercase tracking-widest text-xs block mb-2">Answer Key & Scheme Context</span>
            {localStorage.getItem('aims_desc_answerKey') || 'No scheme provided.'}
          </div>
        </div>
      </div>
    </div>
  );
}