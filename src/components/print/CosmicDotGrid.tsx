import React from 'react';

interface CosmicDotGridProps {
  scores: Record<string, number>;
  variant?: 'default' | 'top';
}

export default function CosmicDotGrid({ scores, variant = 'default' }: CosmicDotGridProps) {
  const dotSizeClass = variant === 'top' ? 'w-[0.55em] h-[0.55em]' : 'w-[0.45em] h-[0.45em]';
  const gapClass = variant === 'top' ? 'gap-[0.05em]' : 'gap-[0.08em]';
  const containerWidth = variant === 'top' ? 'w-fit' : 'w-fit';

  return (
    <div className={`grid grid-cols-5 ${gapClass} ${containerWidth} mx-auto`}>
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
            className={`${dotSizeClass} rounded-sm ${bgClass} transition-colors`}
            title={`Q${qNum}: ${score === 1 ? 'Correct' : score === -1 ? 'Wrong' : 'Blank'}`}
          />
        );
      })}
    </div>
  );
}
