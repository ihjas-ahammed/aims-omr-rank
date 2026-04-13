import React from 'react';
import { DescriptiveBreakdown } from './types';

interface Props {
  breakdown: DescriptiveBreakdown[];
}

export default function DescCosmicDotGrid({ breakdown }: Props) {
  return (
    <div className="flex flex-wrap gap-[0.25em] justify-center items-center p-[0.3em] bg-white rounded-lg border border-gray-100 shadow-inner">
      {breakdown.map((q, i) => {
        let bgClass = 'bg-gray-200';
        if (q.colorLevel === 3) bgClass = 'bg-green-500';
        else if (q.colorLevel === 2) bgClass = 'bg-yellow-400';
        else if (q.colorLevel === 1) bgClass = 'bg-orange-500';
        else if (q.colorLevel === 0) bgClass = 'bg-red-500';

        return (
          <div 
            key={i} 
            className={`w-[0.55em] h-[0.55em] rounded-full ${bgClass} shadow-sm border border-black/5`} 
            title={`Q${q.questionNumber}: ${q.score}/${q.maxScore}`} 
          />
        );
      })}
    </div>
  );
}