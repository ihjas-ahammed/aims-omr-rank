import React from 'react';

interface CosmicDotGridProps {
  scores: Record<string, number>;
  numQuestions: number;
  variant?: 'default' | 'top';
}

export default function CosmicDotGrid({ scores, numQuestions, variant = 'default' }: CosmicDotGridProps) {
  let dotSize = variant === 'top' ? 0.55 : 0.45;
  let gap = variant === 'top' ? 0.05 : 0.08;

  if (numQuestions > 100) {
    dotSize *= 0.6;
    gap *= 0.6;
  } else if (numQuestions > 50) {
    dotSize *= 0.75;
    gap *= 0.75;
  }

  return (
    <div 
      className="flex flex-wrap justify-center mx-auto w-full"
      style={{ gap: `${gap}em` }}
    >
      {Array.from({ length: numQuestions }, (_, i) => i + 1).map(qNum => {
        const score = scores[`q${qNum}`] || 0;
        let bgClass = 'bg-gray-200'; // Blank / No Answer

        if (score === 1) {
          bgClass = 'bg-green-500';
        } else if (score === -1) {
          bgClass = 'bg-red-500';
        }

        return (
          <div
            key={qNum}
            style={{ width: `${dotSize}em`, height: `${dotSize}em` }}
            className={`rounded-sm ${bgClass} transition-colors`}
            title={`Q${qNum}: ${score === 1 ? 'Correct' : score === -1 ? 'Wrong' : 'Blank'}`}
          />
        );
      })}
    </div>
  );
}