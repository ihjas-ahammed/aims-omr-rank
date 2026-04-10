import React from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';
import { OMRResult } from '../../services/geminiService';
import { Chapter } from '../../utils/topicParser';

interface AppTopRankCardProps {
  student: OMRResult;
  rank: number;
  score: number;
  chapters: Chapter[];
  imageUrl?: string;
  onImageClick: (e: React.MouseEvent, name: string) => void;
  onClick: () => void;
  orderClass: string;
}

export default function AppTopRankCard({ 
  student, rank, score, chapters, imageUrl, onImageClick, onClick, orderClass 
}: AppTopRankCardProps) {
  
  const calculateChapterProgress = (studentData: OMRResult, chapter: Chapter) => {
    if (chapter.questions.length === 0) return 0;
    let correct = 0;
    chapter.questions.forEach(q => {
      if (studentData.scores[`q${q}`] === 1) correct++;
    });
    return (correct / chapter.questions.length) * 100;
  };

  let cardBg = 'bg-white border-gray-200';
  let rankColor = 'text-gray-500';
  let progressBg = 'bg-blue-500';
  let sizeClass = 'w-full md:w-[280px]'; // Standard podium size
  
  if (rank === 1) {
    cardBg = 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 shadow-yellow-100';
    rankColor = 'text-yellow-700';
    progressBg = 'bg-yellow-500';
    sizeClass = 'w-full md:w-[320px] md:scale-105 z-10'; // Make Rank 1 slightly larger on desktop
  } else if (rank === 2) {
    cardBg = 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 shadow-gray-100';
    rankColor = 'text-gray-700';
    progressBg = 'bg-gray-500';
  } else if (rank === 3) {
    cardBg = 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-400 shadow-orange-100';
    rankColor = 'text-orange-700';
    progressBg = 'bg-orange-500';
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageClick(e, student.name);
  };

  return (
    <div 
      onClick={onClick}
      className={`relative rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col ${cardBg} ${sizeClass} ${orderClass}`}
    >
      <div className={`absolute top-0 right-0 bg-black/5 px-4 py-1.5 rounded-bl-xl font-black text-lg ${rankColor}`}>
        #{rank}
      </div>

      <div className="flex flex-col items-center gap-4 mb-4 mt-2">
        <div 
          className={`relative rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden group shrink-0 ${rank === 1 ? 'w-28 h-28' : 'w-24 h-24'}`}
          onClick={handleImageClick}
        >
          {imageUrl ? (
            <>
              <img src={imageUrl} alt={student.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
              <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          )}
        </div>
        
        <div className="text-center w-full">
          <h3 className={`${rank === 1 ? 'text-2xl' : 'text-xl'} font-bold text-gray-900 truncate px-2`} title={student.name}>
            {student.name}
          </h3>
          <div className="flex items-center justify-center gap-3 mt-2 text-sm">
            <span className="font-medium text-green-700 bg-green-100/80 px-2 py-0.5 rounded border border-green-200/50">C: {student.right}</span>
            <span className="font-medium text-red-700 bg-red-100/80 px-2 py-0.5 rounded border border-red-200/50">W: {student.wrong}</span>
          </div>
          <div className={`${rank === 1 ? 'text-4xl' : 'text-3xl'} font-black mt-3 text-gray-800`}>
            {score} <span className="text-sm font-medium text-gray-500">pts</span>
          </div>
        </div>
      </div>

      <div className={`space-y-3 mt-auto pt-4 border-t ${rank === 1 ? 'border-yellow-300' : 'border-black/5'}`}>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Chapter Progress</h4>
        {chapters.map(chapter => {
          if (chapter.questions.length === 0) return null;
          const progress = calculateChapterProgress(student, chapter);
          return (
            <div key={chapter.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-700 truncate pr-2 font-medium" title={chapter.name}>{chapter.name}</span>
                <span className="font-bold text-gray-900">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${progressBg}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}