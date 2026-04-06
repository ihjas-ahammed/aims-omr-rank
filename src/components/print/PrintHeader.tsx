import React from 'react';

interface PrintHeaderProps {
  subjectName: string;
  dayNumber: string;
  chapterTopicString: string;
}

export default function PrintHeader({ subjectName, dayNumber, chapterTopicString }: PrintHeaderProps) {
  return (
    <div className="mb-8 pt-4">
      <div className="flex items-center justify-between mb-4">
        <img src="/logo1.png" alt="Logo" className="h-12 md:h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
        <div className="text-center flex-1">
          <h1 className="text-sm md:text-xl font-bold tracking-[0.4em] uppercase ml-[0.4em] text-slate-800">
            AIMS PLUS TEST SERIES · CRASH 2026
          </h1>
          <h2 className="text-xl md:text-2xl font-black mt-1 text-slate-900">DAY {dayNumber} — RANK LIST</h2>
        </div>
        <img src="/logo2.png" alt="Logo" className="h-12 md:h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
      </div>
      <div className="text-center text-xs md:text-sm font-medium max-w-4xl mx-auto uppercase text-slate-700">
        <span className="font-bold text-slate-900">{subjectName}</span> | {chapterTopicString}
      </div>
    </div>
  );
}
