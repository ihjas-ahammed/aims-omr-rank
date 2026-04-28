import React from 'react';
import { OMRResult } from '../../services/geminiService';
import { Chapter } from '../../utils/topicParser';
import CosmicDotGrid from '../common/CosmicDotGrid';

interface AppStandardRankCardProps {
  student: OMRResult;
  rank: number;
  score: number;
  chapters: Chapter[];
  numQuestions: number;
  onClick: () => void;
  dotCols: number;
  dotSize: number;
  dotGap: number;
}

export default function AppStandardRankCard({ 
  student, rank, score, chapters, numQuestions, onClick, dotCols, dotSize, dotGap
}: AppStandardRankCardProps) {

  const calculateChapterProgress = (studentData: OMRResult, chapter: Chapter) => {
    if (chapter.questions.length === 0) return 0;
    let correct = 0;
    chapter.questions.forEach(q => {
      if (studentData.scores[`q${q}`] === 1) correct++;
    });
    return (correct / chapter.questions.length) * 100;
  };

  return (
    <div 
      onClick={onClick}
      className="relative rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden bg-white border-gray-200 flex flex-col h-full"
    >
      <div className="absolute top-0 right-0 bg-black/5 px-4 py-1.5 rounded-bl-xl font-black text-lg text-gray-500">
        #{rank}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 min-w-0 pr-8">
          <h3 className="text-lg font-bold text-gray-900 truncate" title={student.name}>
            {student.name}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className="font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">C: {student.right}</span>
            <span className="font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">W: {student.wrong}</span>
          </div>
          <div className="text-2xl font-black mt-2 text-gray-800">
            {score} <span className="text-sm font-medium text-gray-500">pts</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-4">
        <div className="flex justify-center">
          <CosmicDotGrid scores={student.scores} numQuestions={numQuestions} columns={dotCols} dotSize={`${dotSize}px`} gap={`${dotGap}px`} />
        </div>

        {chapters.some(c => c.questions.length > 0) && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Chapter Progress</h4>
            {chapters.map(chapter => {
              if (chapter.questions.length === 0) return null;
              const progress = calculateChapterProgress(student, chapter);
              return (
                <div key={chapter.name} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-600 truncate pr-2 font-medium" title={chapter.name}>{chapter.name}</span>
                    <span className="font-bold text-gray-700">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-400 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}