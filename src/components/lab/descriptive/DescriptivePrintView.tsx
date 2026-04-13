import React, { useState, useEffect } from 'react';
import { DescriptiveStudent, DescQuestionScheme } from './types';
import DescPrintSettingsBar from './DescPrintSettingsBar';
import DescCosmicDotGrid from './DescCosmicDotGrid';

interface Props {
  students: DescriptiveStudent[];
  onBack: () => void;
}

export default function DescriptivePrintView({ students, onBack }: Props) {
  const [title, setTitle] = useState('DESCRIPTIVE EVALUATION');
  const [subtitle, setSubtitle] = useState('AIMS PLUS TRACK RECORD');
  const [cardsPerRow, setCardsPerRow] = useState<number>(3);
  const [scheme, setScheme] = useState<DescQuestionScheme[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('aims_desc_answerKey') || '[]');
      if (Array.isArray(parsed)) setScheme(parsed);
    } catch(e) {}
  }, []);

  const validStudents = students.filter(s => s.status === 'success' && s.result);

  const rankedStudents = [...validStudents].sort((a, b) => {
    return (b.result?.totalScore || 0) - (a.result?.totalScore || 0);
  });

  return (
    <div className="min-h-screen bg-gray-100 text-black print:bg-white pb-12">
      <DescPrintSettingsBar 
        title={title} setTitle={setTitle}
        subtitle={subtitle} setSubtitle={setSubtitle}
        cardsPerRow={cardsPerRow} setCardsPerRow={setCardsPerRow}
        onBack={onBack} onPrint={() => window.print()}
      />

      <style>{`
        @media print {
          @page { margin: 0.5cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .print-grid {
            grid-template-columns: repeat(${cardsPerRow}, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }
          .break-before-legend { page-break-before: always; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 print:max-w-none print:p-0">
        
        {/* Header for print */}
        <div className="hidden print:block text-center mb-6">
          <h2 className="text-sm font-bold tracking-[0.3em] text-gray-500 uppercase">{subtitle}</h2>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-widest mt-1 border-b-2 border-gray-900 inline-block pb-2 px-6">{title}</h1>
        </div>

        <div className={`grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 print-grid`}>
          {rankedStudents.map((student, idx) => {
            const res = student.result!;
            const maxScore = res.maxTotalScore || res.breakdown.reduce((sum, b) => sum + b.maxScore, 0) || 1;
            
            return (
              <div key={student.id} className="rounded-2xl shadow-md bg-white flex flex-col h-full overflow-hidden break-inside-avoid border border-gray-200 print:shadow-sm">
                <div className="flex justify-between items-center p-3 z-10 bg-gray-50 border-b border-gray-200">
                  <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-200">#{idx + 1}</span>
                </div>
                
                <div className="p-4 text-center">
                  <h3 className="text-xl font-black text-gray-900 leading-tight truncate mb-3" title={student.name}>{student.name}</h3>
                  <div className="inline-block bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2 mb-4">
                    <span className="text-sm font-bold text-indigo-900 uppercase tracking-widest mr-2">Score</span>
                    <span className="text-3xl font-black text-indigo-700">{res.totalScore}</span>
                    <span className="text-sm font-bold text-indigo-400">/{maxScore}</span>
                  </div>
                  
                  <div className="mt-auto">
                    <DescCosmicDotGrid breakdown={res.breakdown} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {scheme.length > 0 && (
          <div className="mt-12 bg-white p-6 md:p-8 rounded-2xl border border-gray-300 shadow-sm break-inside-avoid break-before-legend">
            <h3 className="text-2xl font-black text-gray-900 mb-6 border-b-2 border-gray-100 pb-3 uppercase tracking-wider text-center">Evaluation Legend</h3>
            
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2"><div className="w-5 h-5 bg-green-500 rounded-full shadow-inner border border-black/10"/> <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Full Marks</span></div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 bg-yellow-400 rounded-full shadow-inner border border-black/10"/> <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Partial Marks</span></div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 bg-orange-500 rounded-full shadow-inner border border-black/10"/> <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Minimal / Attempt</span></div>
              <div className="flex items-center gap-2"><div className="w-5 h-5 bg-red-500 rounded-full shadow-inner border border-black/10"/> <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Wrong / Blank</span></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {scheme.map(q => (
                <div key={q.qNum} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="font-black text-lg text-gray-800 mb-3 border-b border-gray-200 pb-2">Q{q.qNum} <span className="text-sm font-bold text-gray-500">(Max: {q.maxScore})</span></h4>
                  <ul className="space-y-2 text-sm">
                    {q.rubric["3"] && <li className="flex gap-2 items-start"><div className="w-3 h-3 mt-1 bg-green-500 rounded-full shrink-0"/> <span className="font-medium text-gray-700">{q.rubric["3"]}</span></li>}
                    {q.rubric["2"] && <li className="flex gap-2 items-start"><div className="w-3 h-3 mt-1 bg-yellow-400 rounded-full shrink-0"/> <span className="font-medium text-gray-700">{q.rubric["2"]}</span></li>}
                    {q.rubric["1"] && <li className="flex gap-2 items-start"><div className="w-3 h-3 mt-1 bg-orange-500 rounded-full shrink-0"/> <span className="font-medium text-gray-700">{q.rubric["1"]}</span></li>}
                    {q.rubric["0"] && <li className="flex gap-2 items-start"><div className="w-3 h-3 mt-1 bg-red-500 rounded-full shrink-0"/> <span className="font-medium text-gray-700">{q.rubric["0"]}</span></li>}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}