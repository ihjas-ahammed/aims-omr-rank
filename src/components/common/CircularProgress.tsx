import React from 'react';

interface CircularProgressProps {
  percentage: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  colorClass?: string;
  trackColorClass?: string;
}

export default function CircularProgress({
  percentage,
  strokeWidth = 6,
  children,
  colorClass = 'text-green-500',
  trackColorClass = 'text-black/5'
}: CircularProgressProps) {
  const radius = 50 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          className={`${trackColorClass} stroke-current`}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        <circle
          className={`${colorClass} stroke-current transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
      </svg>
      <div 
        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative z-10" 
        style={{ padding: `${strokeWidth / 2 + 1}%` }}
      >
        {children}
      </div>
    </div>
  );
}