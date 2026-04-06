import React from 'react';

interface CosmicDotGridProps {
  scores: Record<string, number>;
}

export default function CosmicDotGrid({ scores }: CosmicDotGridProps) {
  return (
    <div className="grid grid-cols-5 gap-[0.12em] w-fit mx-auto">
      {Array.from({ length: 25 }, (_, i) => i + 1).map(qNum => {
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
            className={`w-[0.3em] h-[0.3em] rounded-full ${bgClass} transition-colors`}
            title={`Q${qNum}: ${score === 1 ? 'Correct' : score === -1 ? 'Wrong' : 'Blank'}`}
          />
        );
      })}
    </div>
  );
}
