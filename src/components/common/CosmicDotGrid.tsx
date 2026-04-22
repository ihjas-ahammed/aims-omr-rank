import React from 'react';

interface CosmicDotGridProps {
  scores: Record<string, number>;
  numQuestions: number;
  columns?: number;
  dotSize?: string;
  gap?: string;
}

export default function CosmicDotGrid({ 
  scores, 
  numQuestions, 
  columns = 5, 
  dotSize = '0.55em', 
  gap = '0.05em' 
}: CosmicDotGridProps) {
  return (
    <div 
      className="grid justify-center items-center mx-auto"
      style={{ 
        gap: gap, 
        gridTemplateColumns: `repeat(${columns}, max-content)` 
      }}
    >
      {Array.from({ length: numQuestions }, (_, i) => i + 1).map(qNum => {
        const score = scores[`q${qNum}`] || 0;
        let bgClass = 'bg-gray-200';
        if (score === 1) bgClass = 'bg-green-500';
        else if (score === -1) bgClass = 'bg-red-500';

        return (
          <div
            key={qNum}
            style={{ width: dotSize, height: dotSize }}
            className={`rounded-sm ${bgClass} transition-colors`}
            title={`Q${qNum}: ${score === 1 ? 'Correct' : score === -1 ? 'Wrong' : 'Blank'}`}
          />
        );
      })}
    </div>
  );
}