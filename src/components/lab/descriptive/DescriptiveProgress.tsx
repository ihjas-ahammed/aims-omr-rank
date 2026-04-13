import React from 'react';

interface Props {
  step: string;
  current: number;
  total: number;
}

export default function DescriptiveProgress({ step, current, total }: Props) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <span className="text-sm font-bold text-blue-900">{step}</span>
        <span className="text-xs font-bold text-blue-700 bg-white px-3 py-1 rounded-full border border-blue-200">
          Step {current} of {total}
        </span>
      </div>
      <div className="h-2.5 w-full bg-blue-200/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-300 rounded-full relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}