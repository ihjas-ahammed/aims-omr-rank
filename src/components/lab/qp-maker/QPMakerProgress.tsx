import React from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  current: number;
  total: number;
  target: string;
}

export default function QPMakerProgress({ current, total, target }: Props) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  
  return (
    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <span className="text-sm font-bold text-indigo-900 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating {target}...
        </span>
        <span className="text-xs font-bold text-indigo-700 bg-white px-3 py-1 rounded-full border border-indigo-200 shadow-sm self-start sm:self-auto">
          Paper {current + 1} of {total}
        </span>
      </div>
      <div className="h-2.5 w-full bg-indigo-200/50 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-600 transition-all duration-300 rounded-full relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>
    </div>
  );
}