import React, { useState, useEffect } from 'react';
import { OMRResult } from '../services/geminiService';
import { parseTopicMapping, Chapter } from '../utils/topicParser';
import { getStudentImage } from '../services/db';
import { ArrowLeft, Printer } from 'lucide-react';

interface PrintableRankListProps {
  files: { result?: OMRResult }[];
  topicMapping: string;
  parsedTopicMapping?: any;
  onBack: () => void;
}

const CircularProgress = ({ percentage, chapterNumber }: { percentage: number, chapterNumber: number }) => {
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  let colorClass = 'text-red-500';
  if (percentage >= 80) colorClass = 'text-green-500';
  else if (percentage >= 50) colorClass = 'text-yellow-500';

  return (
    <div className="relative flex items-center justify-center w-6 h-6" title={`Chapter ${chapterNumber}: ${Math.round(percentage)}%`}>
      <svg className="transform -rotate-90 w-6 h-6" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx="12"
          cy="12"
          r={radius}
          stroke="currentColor"
          strokeWidth="2.5"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={colorClass}
        />
      </svg>
      <span className="absolute text-[8px] font-bold">{chapterNumber}</span>
    </div>
  );
};

export default function PrintableRankList({ files, topicMapping, parsedTopicMapping, onBack }: PrintableRankListProps) {
  const [subjectName, setSubjectName] = useState('PHYSICS');
  const [dayNumber, setDayNumber] = useState('4');
  const [studentImages, setStudentImages] = useState<Record<string, string>>({});

  const chapters: Chapter[] = parsedTopicMapping || parseTopicMapping(topicMapping);
  
  const calculateScore = (student: OMRResult) => (student.right * 4) - student.wrong;

  const results = files
    .filter(f => f.result)
    .map(f => f.result!)
    .sort((a, b) => calculateScore(b) - calculateScore(a));

  useEffect(() => {
    const loadImages = async () => {
      const top3 = results.slice(0, 3);
      const images: Record<string, string> = {};
      for (const student of top3) {
        const file = await getStudentImage(student.name);
        if (file) {
          images[student.name] = URL.createObjectURL(file);
        }
      }
      setStudentImages(images);
    };
    loadImages();
  }, [results]);

  const calculateChapterProgress = (student: OMRResult, chapter: Chapter) => {
    if (chapter.questions.length === 0) return 0;
    let correct = 0;
    chapter.questions.forEach(q => {
      if (student.scores[`q${q}`] === 1) correct++;
    });
    return (correct / chapter.questions.length) * 100;
  };

  const top3 = results.slice(0, 3);

  // Reorder top 3 to put 1st place in the middle: [2nd, 1st, 3rd]
  const displayTop3 = [];
  if (top3.length > 1) displayTop3.push({ student: top3[1], rank: 2 });
  if (top3.length > 0) displayTop3.push({ student: top3[0], rank: 1 });
  if (top3.length > 2) displayTop3.push({ student: top3[2], rank: 3 });

  // Generate the chapter/topic string
  const chapterTopicString = chapters.map(c => c.name).join(' · ');

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      {/* Non-printable controls */}
      <div className="print:hidden mb-8 space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">Print Setup</h2>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>
        <div className="flex gap-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 w-full"
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <input
              type="text"
              value={dayNumber}
              onChange={(e) => setDayNumber(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 w-full"
            />
          </div>
        </div>
      </div>

      {/* Printable Content */}
      <div className="print:m-0">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <img src="/logo1.png" alt="Logo 1" className="h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold tracking-[0.2em] text-gray-800">A I M S  P L U S  T E S T  S E R I E S  ·  C R A S H  2 0 2 6</h1>
              <h2 className="text-2xl font-black mt-1">DAY {dayNumber} — RANK LIST</h2>
            </div>
            <img src="/logo2.png" alt="Logo 2" className="h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
          </div>
          <div className="text-center text-sm font-medium text-gray-700 max-w-4xl mx-auto uppercase">
            <span className="font-bold">{subjectName}</span> | {chapterTopicString}
          </div>
        </div>

        {/* Top 3 Section */}
        {displayTop3.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-wrap justify-center items-end gap-6">
              {displayTop3.map(({ student, rank }) => {
                let cardClasses = "flex flex-col items-center rounded-xl p-4 border shadow-sm ";
                let badgeClasses = "absolute -bottom-2 -right-2 w-8 h-8 rounded-full text-white flex items-center justify-center font-bold border-2 border-white ";
                
                if (rank === 1) {
                  cardClasses += "bg-gradient-to-br from-yellow-50 to-yellow-200 border-yellow-400 w-80 transform scale-105 z-10";
                  badgeClasses += "bg-yellow-500";
                } else if (rank === 2) {
                  cardClasses += "bg-gradient-to-br from-gray-50 to-gray-200 border-gray-400 w-72";
                  badgeClasses += "bg-gray-500";
                } else {
                  cardClasses += "bg-gradient-to-br from-orange-50 to-orange-200 border-orange-400 w-72";
                  badgeClasses += "bg-orange-500";
                }

                return (
                  <div key={`${student.name}-${rank}`} className={cardClasses}>
                    <div className="relative mb-3">
                      {studentImages[student.name] ? (
                        <img src={studentImages[student.name]} alt={student.name} className={`${rank === 1 ? 'w-28 h-28' : 'w-24 h-24'} rounded-full object-cover border-4 border-white shadow-md`} />
                      ) : (
                        <div className={`${rank === 1 ? 'w-28 h-28 text-3xl' : 'w-24 h-24 text-2xl'} rounded-full bg-white flex items-center justify-center border-4 border-white shadow-md text-gray-400 font-bold`}>
                          {student.name.charAt(0)}
                        </div>
                      )}
                      <div className={badgeClasses}>
                        #{rank}
                      </div>
                    </div>
                    <h3 className={`${rank === 1 ? 'text-xl' : 'text-lg'} font-bold text-center truncate w-full`}>{student.name}</h3>
                    <div className={`${rank === 1 ? 'text-3xl' : 'text-2xl'} font-black text-indigo-600 my-1`}>
                      {calculateScore(student)} <span className="text-sm font-normal text-gray-600">pts</span>
                    </div>
                    <div className="flex gap-3 text-xs font-medium mb-2">
                      <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded">Correct: {student.right}</span>
                      <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded">Wrong: {student.wrong}</span>
                    </div>
                    
                    <div className="w-full mt-2 space-y-1">
                      {chapters.map((chapter, cIdx) => {
                        const progress = calculateChapterProgress(student, chapter);
                        return (
                          <div key={cIdx} className="flex items-center justify-between text-xs">
                            <span className="truncate pr-2 text-gray-700 font-medium">{chapter.name}</span>
                            <span className="font-bold">{Math.round(progress)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Students Grid (up to 10 columns) */}
        <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">All Students</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 print:grid-cols-8 gap-2 print:gap-1">
            {results.map((student, index) => (
              <div key={`${student.name}-${index}`} className="flex flex-col p-2 border border-gray-200 rounded-lg text-center bg-white shadow-sm print:shadow-none print:border-gray-300">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold text-gray-400">#{index + 1}</span>
                  <span className="text-sm font-black text-indigo-600">{calculateScore(student)}</span>
                </div>
                <h4 className="text-[10px] font-bold truncate mb-1" title={student.name}>{student.name}</h4>
                <div className="flex justify-center gap-2 text-[8px] font-medium mb-1.5">
                  <span className="text-green-600">C: {student.right}</span>
                  <span className="text-red-600">W: {student.wrong}</span>
                </div>
                <div className="flex flex-wrap justify-center gap-0.5 mt-auto">
                  {chapters.map((chapter, cIdx) => (
                    <CircularProgress 
                      key={cIdx} 
                      percentage={calculateChapterProgress(student, chapter)} 
                      chapterNumber={cIdx + 1} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
