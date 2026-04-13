import React from 'react';
import { DescriptiveStudent } from './types';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface Props {
  student: DescriptiveStudent;
  index: number;
  onRemove: (id: string) => void;
}

export default function DescriptiveResultCard({ student, index, onRemove }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row transition-shadow hover:shadow-md relative">
      {/* Left side: Images */}
      <div className="w-full md:w-1/3 bg-gray-50 p-4 border-b md:border-b-0 md:border-r border-gray-200 flex gap-3 overflow-x-auto items-center hide-scrollbar">
        {student.images.map((img, i) => (
          <img 
            key={i} 
            src={img.previewUrl} 
            alt={`Page ${i+1}`} 
            className="h-32 w-24 object-contain bg-white p-1 rounded-lg shadow-sm border border-gray-300 shrink-0" 
          />
        ))}
      </div>

      {/* Right side: Details */}
      <div className="p-5 flex-1 flex flex-col min-w-0 relative">
        <button 
          onClick={() => onRemove(student.id)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors z-10"
          title="Remove Student Record"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="flex justify-between items-start mb-4 gap-2 pr-10">
          <div className="min-w-0">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Student {index + 1}</div>
            <h3 className="text-xl font-bold text-gray-900 break-words">{student.name}</h3>
          </div>
          {student.status === 'success' && student.result && (
            <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl text-center shrink-0 shadow-sm">
              <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-0.5">Score</div>
              <div className="text-2xl font-black text-green-800 leading-none">{student.result.totalScore}</div>
            </div>
          )}
          {student.status === 'error' && (
            <div className="bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-red-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Failed</span>
            </div>
          )}
          {(student.status === 'pending' || student.status === 'evaluating') && (
            <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-blue-700 shrink-0">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">Evaluating</span>
            </div>
          )}
        </div>

        {student.status === 'success' && student.result && (
          <div className="flex flex-col gap-4 flex-1 mt-2">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Score Breakdown</h4>
              {Array.isArray(student.result.breakdown) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {student.result.breakdown.map((item, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-2">
                        <span className="font-bold text-gray-800 text-sm">Q{item.questionNumber}</span>
                        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                          {item.score} / {item.maxScore}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3" title={item.remarks}>{item.remarks}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 whitespace-pre-wrap text-sm">{String(student.result.breakdown)}</p>
              )}
            </div>
            
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex-1">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Overall Feedback</h4>
              <p className="text-blue-900/80 whitespace-pre-wrap text-sm font-medium leading-relaxed">{student.result.feedback}</p>
            </div>
          </div>
        )}

        {student.status === 'error' && (
          <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-100 mt-2 font-medium">
            {student.error}
          </div>
        )}
      </div>
    </div>
  );
}