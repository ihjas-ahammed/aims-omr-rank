import React from 'react';
import { DescriptiveStudent } from './types';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface Props {
  student: DescriptiveStudent;
  onRemove: (id: string) => void;
  onViewDetails: (student: DescriptiveStudent) => void;
}

export default function DescriptiveOverviewCard({ student, onRemove, onViewDetails }: Props) {
  let cardClasses = "bg-white border-gray-200 hover:border-blue-300 text-gray-900";
  let scoreDisplay = "--";
  let maxScoreDisplay = "--";
  
  if (student.status === 'success' && student.result) {
    const total = student.result.totalScore;
    const maxTotal = student.result.maxTotalScore || student.result.breakdown.reduce((s, b) => s + b.maxScore, 0) || 1;
    const pct = (total / maxTotal) * 100;
    
    scoreDisplay = total.toString();
    maxScoreDisplay = maxTotal.toString();
    
    // Proportional coloring: < 47% Red, <= 80% Yellow, > 80% Green
    if (pct < 47) {
      cardClasses = "bg-red-50 border-red-200 text-red-900 hover:border-red-400";
    } else if (pct <= 80) {
      cardClasses = "bg-yellow-50 border-yellow-200 text-yellow-900 hover:border-yellow-400";
    } else {
      cardClasses = "bg-green-50 border-green-200 text-green-900 hover:border-green-400";
    }
  }

  return (
    <div 
      onClick={() => onViewDetails(student)}
      className={`relative p-4 md:p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between ${cardClasses}`}
    >
      <div className="flex flex-col min-w-0 pr-4">
        <h3 className="font-bold text-lg truncate leading-tight mb-1" title={student.name}>{student.name}</h3>
        
        {student.status === 'success' && (
          <div className="flex items-center gap-2 opacity-80 text-sm font-medium">
            Score: {scoreDisplay} / {maxScoreDisplay}
          </div>
        )}
        
        {student.status === 'error' && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 mt-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Evaluation Failed
          </div>
        )}

        {(student.status === 'pending' || student.status === 'evaluating') && (
          <div className="flex items-center gap-1.5 text-xs font-bold opacity-70 mt-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Evaluating...
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {student.status === 'success' && (
          <div className="text-3xl font-black opacity-90 drop-shadow-sm">
            {scoreDisplay}
          </div>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(student.id); }}
          className="p-2 opacity-40 hover:opacity-100 hover:text-red-600 hover:bg-red-100 rounded-full transition-all"
          title="Remove Student"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}