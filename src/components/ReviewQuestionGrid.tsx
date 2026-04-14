import React from 'react';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { OMRResult } from '../services/geminiService';

interface Props {
  fileId: string;
  result: OMRResult;
  numQuestions: number;
  onUpdateScore?: (id: string, qNum: number, newScore: number) => void;
}

export default function ReviewQuestionGrid({ fileId, result, numQuestions, onUpdateScore }: Props) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 mb-6 max-h-[30vh] overflow-y-auto custom-scrollbar pr-1 border border-gray-100 rounded-lg p-2 bg-gray-50">
      {Array.from({ length: numQuestions }, (_, i) => i + 1).map(qNum => {
        const score = result.scores[`q${qNum}`] || 0;
        let bgColor = 'bg-white border-gray-200 text-gray-600';
        let Icon = MinusCircle;
        let iconColor = 'text-gray-400';
        
        if (score === 1) {
          bgColor = 'bg-green-50 border-green-200 text-green-800';
          Icon = CheckCircle;
          iconColor = 'text-green-500';
        } else if (score === -1) {
          bgColor = 'bg-red-50 border-red-200 text-red-800';
          Icon = XCircle;
          iconColor = 'text-red-500';
        }

        return (
          <div 
            key={qNum} 
            onClick={() => {
              if (onUpdateScore) {
                const nextScore = score === 1 ? -1 : score === -1 ? 0 : 1;
                onUpdateScore(fileId, qNum, nextScore);
              }
            }}
            className={`flex flex-col items-center p-1.5 sm:p-2 rounded border shadow-sm cursor-pointer hover:opacity-80 transition-opacity ${bgColor}`}
            title="Click to toggle result (Right -> Wrong -> No Answer)"
          >
            <span className="text-[10px] sm:text-xs font-medium mb-0.5">Q{qNum}</span>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
            <span className="text-[10px] sm:text-xs mt-0.5 font-bold">{score > 0 ? '+1' : score < 0 ? '-1' : '0'}</span>
          </div>
        );
      })}
    </div>
  );
}