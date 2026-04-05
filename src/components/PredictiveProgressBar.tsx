import React, { useState, useEffect } from 'react';

interface Props {
  isProcessing: boolean;
  attempt: number;
  maxAttempts: number;
  averageTime: number;
}

export default function PredictiveProgressBar({ isProcessing, attempt, maxAttempts, averageTime }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setProgress(100);
      return;
    }

    setProgress(0);
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      // Easing function: goes fast initially, slows down, asymptotes at 95%
      // Using a simple exponential decay curve
      const currentProgress = 95 * (1 - Math.exp(-elapsed / (averageTime / 2)));
      setProgress(currentProgress);
    }, 100);

    return () => clearInterval(interval);
  }, [isProcessing, attempt, averageTime]);

  if (!isProcessing && progress === 0) return null;

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
        <span>{isProcessing ? `Validating (Attempt ${attempt} of ${maxAttempts})...` : 'Complete'}</span>
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
