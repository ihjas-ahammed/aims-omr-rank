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
  let scale = "";
  let cardHeight = '18.5em';
  let cardWidth = '14em';

  if (rank === 1) {
    cardClasses += "bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100 border-yellow-200 text-slate-900 z-10 ";
    badgeClasses += "bg-yellow-600";
    cardHeight = '22em';
    cardWidth = '15.5em';
  } else if (rank === 2) {
    cardClasses += "bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 border-slate-300 text-slate-900 ";
    badgeClasses += "bg-slate-600";
    cardHeight = '19em';
  } else {
    cardClasses += "bg-gradient-to-br from-orange-100 via-orange-200 to-amber-100 border-orange-300 text-slate-900 ";
    badgeClasses += "bg-orange-600";
    cardHeight = '19em';
  }

  // Use the passed fontSizeScale to control internal scaling proportionately
  return (
    <div className={`${cardClasses} ${scale}`} style={{ fontSize: `${fontSizeScale}px`, width: cardWidth, minHeight: cardHeight, height: cardHeight }}>
      <div className="relative mb-[0.5em] mt-[0.3em]">
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
      <div className="mt-auto flex flex-row items-stretch w-full z-10 pt-[0.2em]">
        <div className="w-1/3 max-w-[5.2em] border-r border-gray-100 pr-[0.3em] shrink-0 flex items-center justify-center">
          <div className="aspect-square h-full max-h-[11.5em] flex items-center justify-center">
            <CosmicDotGrid scores={student.scores} variant="top" />
          </div>
        </div>
        <div className="flex-1 pl-[0.3em] flex flex-col justify-center">
          <ChapterProgressBars chapters={chapters} student={student} compact={false} showPercent={false} showNames={false} />
        </div>
      </div>  
    </div>
  );
}
