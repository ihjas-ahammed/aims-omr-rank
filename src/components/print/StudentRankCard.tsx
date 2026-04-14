import React from 'react';
import { OMRResult } from '../../services/geminiService';
import { Chapter } from '../../utils/topicParser';
import CosmicDotGrid from './CosmicDotGrid';
import ChapterProgressBars from './ChapterProgressBars';

interface StudentRankCardProps {
  student: OMRResult;
  rank: number;
  score: number;
  chapters: Chapter[];
  numQuestions: number;
}

export default function StudentRankCard({ student, rank, score, chapters, numQuestions }: StudentRankCardProps) {
  return (
    <div className="flex flex-col p-[0.4em] border border-gray-200 rounded-[0.6em] text-center bg-white shadow-sm relative overflow-hidden h-full break-inside-avoid">
      
      <div className="flex justify-between items-center mb-[0.2em] z-10">
        <span className="text-[0.55em] font-bold text-gray-500 bg-gray-100 px-[0.4em] py-[0.1em] rounded border border-gray-200">#{rank}</span>
      </div>
      
      <h4 className="text-[0.65em] font-bold break-words leading-tight mb-[0.4em] px-[0.1em] text-gray-900 z-10 tracking-tight" title={student.name}>
        {student.name}
      </h4>
      
      <div className="flex justify-center items-center gap-[0.3em] text-[0.55em] font-bold mb-[0.4em] z-10">
        <span className="text-green-700 bg-green-50 px-[0.4em] py-[0.1em] rounded border border-green-200">C:{student.right}</span>
        <span className="text-[1.4em] font-black text-indigo-600 leading-none mx-[0.1em]">
          {score}
        </span>
        <span className="text-red-700 bg-red-50 px-[0.4em] py-[0.1em] rounded border border-red-200">W:{student.wrong}</span>
      </div>
      
      {/* Container for Dots (Left) and Progress Bars (Right) side by side */}
      <div className="mt-auto flex flex-row items-start w-full z-10 pt-[0.4em] border-t border-gray-100">
        <div className="w-1/2 border-r border-gray-100 pr-[0.4em] shrink-0">
          <CosmicDotGrid scores={student.scores} numQuestions={numQuestions} />
        </div>
        <div className="w-1/2 pl-[0.4em] flex flex-col justify-center">
          <ChapterProgressBars chapters={chapters} student={student} compact={true} />
        </div>
      </div>
    </div>
  );
}