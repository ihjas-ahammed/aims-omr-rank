import React from 'react';
import { Chapter } from '../../utils/topicParser';
import { OMRResult } from '../../services/geminiService';

interface Props {
  chapters: Chapter[];
  student: OMRResult;
  compact?: boolean;
}

export default function ChapterProgressBars({ chapters, student, compact = false }: Props) {
  // Only show chapters that actually have questions mapped to them
  const validChapters = chapters.filter(c => c.questions.length > 0);
  
  if (validChapters.length === 0) return null;

  return (
    <div className={`flex flex-col gap-[0.15em] w-full ${compact ? '' : 'mt-[0.3em] px-[0.2em] border-t border-gray-100 pt-[0.4em]'}`}>
      {validChapters.map((c, idx) => {
        let correct = 0;
        c.questions.forEach(q => {
          if (student.scores[`q${q}`] === 1) correct++;
        });
        const progress = (correct / c.questions.length) * 100;
        
        return (
          <div key={c.name} className="flex items-center justify-between gap-[0.2em]">
            <span 
              className={`text-[0.45em] text-gray-600 font-bold text-left uppercase tracking-wide truncate ${compact ? 'w-[1.2em]' : 'w-[7em]'}`} 
              title={c.name}
            >
              {compact ? `${idx + 1}` : c.name}
            </span>
            <div className={`flex-1 ${compact ? 'h-[0.2em]' : 'h-[0.25em]'} bg-gray-200 rounded-full overflow-hidden`}>
              <div 
                className="h-full bg-indigo-500 rounded-full" 
                style={{ width: `${progress}%` }} 
              />
            </div>
            {!compact && (
              <span className="text-[0.4em] text-gray-500 font-medium w-[1.5em] text-right">
                {Math.round(progress)}%
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
