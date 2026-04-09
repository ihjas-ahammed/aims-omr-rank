import React, { useState, useEffect } from 'react';
import { OMRResult } from '../services/geminiService';
import { parseTopicMapping, Chapter } from '../utils/topicParser';
import { getStudentImage } from '../services/db';
import StudentRankCard from './print/StudentRankCard';
import TopRankCard from './print/TopRankCard';
import PrintSettingsBar from './print/PrintSettingsBar';

interface PrintableRankListProps {
  files: { result?: OMRResult }[];
  topicMapping: string;
  parsedTopicMapping?: any;
  onBack: () => void;
}

export default function PrintableRankList({ files, topicMapping, parsedTopicMapping, onBack }: PrintableRankListProps) {
  const [subjectName, setSubjectName] = useState('PHYSICS');
  const [dayNumber, setDayNumber] = useState('4');
  const [studentImages, setStudentImages] = useState<Record<string, string>>({});
  
  // Print Customization Settings
  const [columnsPerPage, setColumnsPerPage] = useState<number>(10);
  const [cardScale, setCardScale] = useState<number>(11); // base font size in px
  const [showTop3, setShowTop3] = useState<boolean>(true);
  const [showHeader, setShowHeader] = useState<boolean>(true);

  const chapters: Chapter[] = parsedTopicMapping || parseTopicMapping(topicMapping);
  
  const calculateScore = (student: OMRResult) => (student.right * 4) - student.wrong;

  const sortedResults = files
    .filter(f => f.result)
    .map(f => f.result!)
    .sort((a, b) => {
      const scoreDiff = calculateScore(b) - calculateScore(a);
      return scoreDiff !== 0 ? scoreDiff : a.name.localeCompare(b.name);
    });

  const rankedResults = sortedResults.reduce(
    (acc, student, index) => {
      const score = calculateScore(student);
      const previous = acc[index - 1];
      const rank = previous
        ? previous.score === score
          ? previous.rank
          : previous.rank + 1
        : 1;
      acc.push({ student, score, rank });
      return acc;
    },
    [] as Array<{ student: typeof sortedResults[number]; score: number; rank: number }>
  );

  useEffect(() => {
    const loadImages = async () => {
      const top3 = rankedResults.slice(0, 3);
      const images: Record<string, string> = {};
      for (const item of top3) {
        const file = await getStudentImage(item.student.name);
        if (file) {
          images[item.student.name] = URL.createObjectURL(file);
        }
      }
      setStudentImages(images);
    };
    loadImages();
  }, [rankedResults]);

  const top3 = rankedResults.slice(0, 3);

  // Reorder top 3 to put 1st place in the middle: [2nd, 1st, 3rd]
  const displayTop3 = [];
  if (top3.length > 1) displayTop3.push({ student: top3[1].student, rank: top3[1].rank });
  if (top3.length > 0) displayTop3.push({ student: top3[0].student, rank: top3[0].rank });
  if (top3.length > 2) displayTop3.push({ student: top3[2].student, rank: top3[2].rank });

  // Generate the chapter/topic string
  const chapterTopicString = chapters.map(c => c.name).join(' · ');

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Non-printable controls */}
      <PrintSettingsBar
        subjectName={subjectName}
        setSubjectName={setSubjectName}
        dayNumber={dayNumber}
        setDayNumber={setDayNumber}
        columnsPerPage={columnsPerPage}
        setColumnsPerPage={setColumnsPerPage}
        cardScale={cardScale}
        setCardScale={setCardScale}
        showTop3={showTop3}
        setShowTop3={setShowTop3}
        showHeader={showHeader}
        setShowHeader={setShowHeader}
        onBack={onBack}
      />

      {/* Printable Content */}
      <div className="print:m-0 p-4 md:p-8 pt-0">
        {showHeader && (
          <div className="mb-8 pt-4">
            <div className="flex items-center justify-between mb-4">
              <img src="/logo1.png" alt="Logo" className="h-12 md:h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
              <div className="text-center flex-1">
                <h1 className="text-sm md:text-xl font-bold tracking-[0.4em] uppercase ml-[0.4em] text-gray-800">
                  AIMS PLUS TEST SERIES · CRASH 2026
                </h1>
                <h2 className="text-xl md:text-2xl font-black mt-1">DAY {dayNumber} — RANK LIST</h2>
              </div>
              <img src="/logo2.png" alt="Logo" className="h-12 md:h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
            <div className="text-center text-xs md:text-sm font-medium max-w-4xl mx-auto uppercase text-gray-700">
              <span className="font-bold text-gray-900">{subjectName}</span> | {chapterTopicString}
            </div>
          </div>
        )}

        {/* Top 3 Section */}
        {showTop3 && displayTop3.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-wrap justify-center items-end gap-4 md:gap-8">
              {displayTop3.map(({ student, rank }) => (
                <TopRankCard 
                  key={`top-${student.name}-${rank}`}
                  student={student}
                  rank={rank}
                  score={calculateScore(student)}
                  chapters={chapters}
                  imageUrl={studentImages[student.name]}
                  fontSizeScale={Math.max(cardScale, 14)} // Keep top cards slightly bigger
                />
              ))}
            </div>
          </div>
        )}

        {/* All Students Grid */}
        <div>
          {showHeader && <h2 className="text-lg font-bold mb-4 border-b pb-2 border-gray-200">All Students</h2>}
          <div 
            className="grid gap-[0.2em] print:gap-[0.2em] items-stretch justify-items-center"
            style={{ 
              gridTemplateColumns: `repeat(${columnsPerPage}, minmax(0, 1fr))`,
              fontSize: `${cardScale}px` 
            }}
          >
            {rankedResults.map(({ student, rank, score }) => (
              <div key={`${student.name}-${rank}`} className="w-full h-full">
                <StudentRankCard 
                  student={student} 
                  rank={rank} 
                  score={score}
                  chapters={chapters} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}