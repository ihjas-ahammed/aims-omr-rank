import React, { useState } from 'react';
import { X, LayoutTemplate } from 'lucide-react';
import { DescriptiveStudent } from './types';

interface Props {
  student: DescriptiveStudent;
  onClose: () => void;
}

export default function DescriptiveDetailModal({ student, onClose }: Props) {
  const [selectedImg, setSelectedImg] = useState(student.images[0]?.previewUrl || '');

  const res = student.result;
  const maxScore = res?.maxTotalScore || res?.breakdown.reduce((sum, b) => sum + b.maxScore, 0) || 1;

  const getColorClass = (level: number) => {
    switch (level) {
      case 0: return 'border-red-400 bg-red-50 text-red-900';
      case 1: return 'border-orange-400 bg-orange-50 text-orange-900';
      case 2: return 'border-yellow-400 bg-yellow-50 text-yellow-900';
      case 3: return 'border-green-400 bg-green-50 text-green-900';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-gray-900">{student.name}</h2>
            {res && (
              <p className="text-sm font-bold text-gray-500 mt-0.5">
                Total Score: <span className="text-indigo-600 text-lg ml-1">{res.totalScore}</span> / {maxScore}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          {/* Left: Analysis */}
          <div className="w-full md:w-1/2 lg:w-3/5 p-4 sm:p-6 overflow-y-auto flex flex-col gap-6 custom-scrollbar bg-white">
            
            {res?.breakdown && res.breakdown.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Question Analysis</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {res.breakdown.map((q, i) => (
                    <div key={i} className={`p-3 rounded-xl border-2 flex flex-col ${getColorClass(q.colorLevel)}`}>
                      <div className="flex justify-between items-center mb-2 pb-2 border-b border-black/10">
                        <span className="font-bold text-sm">Q{q.questionNumber}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/60 shadow-sm border border-black/5">
                          {q.score} / {q.maxScore}
                        </span>
                      </div>
                      <p className="text-xs font-medium opacity-80 leading-relaxed break-words">{q.remarks}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {res?.feedback && (
              <div className="mt-auto">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Overall Feedback</h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap shadow-inner">
                  {res.feedback}
                </div>
              </div>
            )}

            {!res && (
              <div className="flex-1 flex items-center justify-center text-gray-400 font-medium">
                No evaluation data available.
              </div>
            )}
          </div>

          {/* Right: Image Preview */}
          <div className="w-full md:w-1/2 lg:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 bg-gray-100 flex flex-col overflow-hidden min-h-[300px] md:min-h-0">
            <div className="flex-1 p-4 flex items-center justify-center overflow-auto relative">
              {selectedImg ? (
                <img src={selectedImg} alt="Page preview" className="max-w-full max-h-full object-contain rounded shadow-sm bg-white" />
              ) : (
                <div className="flex flex-col items-center text-gray-400 gap-2">
                  <LayoutTemplate className="w-8 h-8" />
                  <span className="text-sm font-medium">No pages found</span>
                </div>
              )}
            </div>
            
            {student.images.length > 1 && (
              <div className="h-24 bg-white border-t border-gray-200 p-2 flex gap-2 overflow-x-auto shrink-0 custom-scrollbar items-center">
                {student.images.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedImg(img.previewUrl)}
                    className={`h-full aspect-[1/1.4] shrink-0 rounded border-2 overflow-hidden transition-all ${selectedImg === img.previewUrl ? 'border-indigo-500 shadow-md scale-105' : 'border-transparent hover:border-gray-300 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img.previewUrl} className="w-full h-full object-cover bg-gray-50" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
      `}} />
    </div>
  );
}