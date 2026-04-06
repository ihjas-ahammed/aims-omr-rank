import React from 'react';
import { OMRResult } from '../../services/geminiService';
import { Chapter } from '../../utils/topicParser';
import CosmicDotGrid from './CosmicDotGrid';
import ChapterProgressBars from './ChapterProgressBars';

interface TopRankCardProps {
  student: OMRResult;
  rank: number;
  score: number;
  chapters: Chapter[];
  imageUrl?: string;
  fontSizeScale: number;
}

export default function TopRankCard({ student, rank, score, chapters, imageUrl, fontSizeScale }: TopRankCardProps) {
  let cardClasses = "flex flex-col items-center rounded-xl p-[0.8em] border shadow-md relative overflow-hidden break-inside-avoid ";
  let badgeClasses = "absolute -bottom-[0.5em] -right-[0.5em] w-[2.2em] h-[2.2em] rounded-full text-white flex items-center justify-center font-bold border-[0.15em] border-white z-20 text-[0.8em] shadow-sm ";
  let scale = "scale-100";
  
  if (rank === 1) {
    cardClasses += "bg-gradient-to-b from-yellow-50 to-white border-yellow-200 z-10 ";
    badgeClasses += "bg-yellow-500";
    scale = "scale-105 mx-2"; // Make 1st place stand out slightly
  } else if (rank === 2) {
    cardClasses += "bg-gradient-to-b from-gray-50 to-white border-gray-200 ";
    badgeClasses += "bg-gray-400";
  } else {
    cardClasses += "bg-gradient-to-b from-orange-50 to-white border-orange-200 ";
    badgeClasses += "bg-orange-500";
  }

  // Use the passed fontSizeScale to control internal scaling proportionately
  return (
    <div className={`${cardClasses} ${scale}`} style={{ fontSize: `${fontSizeScale}px`, width: '14em' }}>
      <div className="relative mb-[0.6em] mt-[0.2em]">
        {imageUrl ? (
          <img src={imageUrl} alt={student.name} className="w-[4.5em] h-[4.5em] rounded-full object-cover border-[0.2em] border-white shadow-sm" />
        ) : (
          <div className="w-[4.5em] h-[4.5em] rounded-full bg-gray-100 flex items-center justify-center border-[0.2em] border-white shadow-sm text-gray-500 font-bold text-[1.8em]">
            {student.name.charAt(0)}
          </div>
        )}
        <div className={badgeClasses}>#{rank}</div>
      </div>
      
      <h3 className="text-[1.1em] font-bold text-center break-words leading-tight w-full px-[0.2em] text-gray-900 tracking-tight">{student.name}</h3>
      
      <div className="flex items-center justify-center gap-[0.6em] mt-[0.6em] mb-[0.6em] w-full">
        <span className="text-[0.7em] font-bold text-green-700 bg-green-50 px-[0.5em] py-[0.2em] rounded border border-green-200">C:{student.right}</span>
        <span className="text-[1.8em] font-black text-indigo-600 leading-none drop-shadow-sm">
          {score}<span className="text-[0.35em] ml-[0.1em] text-indigo-400 uppercase align-middle">pts</span>
        </span>
        <span className="text-[0.7em] font-bold text-red-700 bg-red-50 px-[0.5em] py-[0.2em] rounded border border-red-200">W:{student.wrong}</span>
      </div>
      <div className="mt-auto flex flex-row items-center justify-between w-full z-10 pt-[0.4em] border-t border-gray-100">
              <div className="border-r border-gray-100 pr-[0.4em] shrink mx-auto ">
                <CosmicDotGrid scores={student.scores} />
              </div>
              <div className="flex-1 pl-[0.4em] flex flex-col justify-center">
                <ChapterProgressBars chapters={chapters} student={student} compact={false} />
              </div>
            </div>  
    </div>
  );
}
