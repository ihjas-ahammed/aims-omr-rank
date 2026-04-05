import React, { useState, useEffect } from 'react';

interface Props {
  isProcessing: boolean;
  stageName: string;
  attempt: number;
  expectedAttempts: number;
  averageTime: number;
}

export default function PredictiveProgressBar({ isProcessing, stageName, attempt, expectedAttempts, averageTime }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setProgress(100);
      return;
    }

    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      const currentAttemptProgress = 95 * (1 - Math.exp(-elapsed / (averageTime / 2)));
      
      const baseProgress = ((attempt - 1) / expectedAttempts) * 100;
      const attemptContribution = currentAttemptProgress / expectedAttempts;
      
      let totalProgress = baseProgress + attemptContribution;
      if (totalProgress > 98) totalProgress = 98;
      
      setProgress(prev => Math.max(prev, totalProgress));
    }, 100);

    return () => clearInterval(interval);
  }, [isProcessing, attempt, expectedAttempts, averageTime]);

  if (!isProcessing && progress === 0) return null;

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
        <span>{isProcessing ? stageName : 'Complete'}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
