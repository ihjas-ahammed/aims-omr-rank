import React, { useState, useEffect } from 'react';
import { OMRResult } from '../services/geminiService';
import { parseTopicMapping, Chapter } from '../utils/topicParser';
import { getStudentImage } from '../services/db';
import StudentRankCard from './print/StudentRankCard';
import TopRankCard from './print/TopRankCard';
import PrintSettingsBar from './print/PrintSettingsBar';
import PrintHeader from './print/PrintHeader';

interface PrintableRankListProps {
  files: { result?: OMRResult }[];
  topicMapping: string;
  parsedTopicMapping?: any;
  numQuestions: number;
  onBack: () => void;
}

export default function PrintableRankList({ files, topicMapping, parsedTopicMapping, numQuestions, onBack }: PrintableRankListProps) {
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

  // Take up to 5 students that occupy rank 1, 2, or 3
  const podiumStudents = rankedResults.filter(r => r.rank <= 3).slice(0, 5);

  useEffect(() => {
    const loadImages = async () => {
      const images: Record<string, string> = {};
      for (const item of podiumStudents) {
        const file = await getStudentImage(item.student.name);
        if (file) {
          images[item.student.name] = URL.createObjectURL(file);
        }
      }
      setStudentImages(images);
    };
    loadImages();
  }, [rankedResults]);

  // Reorder top podium to put highest ranks in the middle
  const displayPodium: Array<{ student: OMRResult, rank: number }> = [];
  [...podiumStudents].sort((a,b) => a.rank - b.rank).forEach((item, i) => {
    if (i % 2 === 0) displayPodium.push({ student: item.student, rank: item.rank });
    else displayPodium.unshift({ student: item.student, rank: item.rank });
  });

  const chapterTopicString = chapters.map(c => c.name).join(' · ');
  
  // Adjust podium sizing if there are more than 3 cards
  const podiumScale = podiumStudents.length > 3 ? Math.max(cardScale * 0.75, 10) : Math.max(cardScale, 14);

  return (
    <div className="min-h-screen bg-white text-black">
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

      <div className="print:m-0 p-4 md:p-8 pt-0">
        {showHeader && (
          <PrintHeader 
            subjectName={subjectName} 
            dayNumber={dayNumber} 
            chapterTopicString={chapterTopicString} 
          />
        )}

        {showTop3 && displayPodium.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-wrap justify-center items-end gap-4 md:gap-8">
              {displayPodium.map(({ student, rank }) => (
                <TopRankCard 
                  key={`top-${student.name}-${rank}`}
                  student={student}
                  rank={rank}
                  score={calculateScore(student)}
                  chapters={chapters}
                  numQuestions={numQuestions}
                  imageUrl={studentImages[student.name]}
                  fontSizeScale={podiumScale} 
                />
              ))}
            </div>
          </div>
        )}

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
                  numQuestions={numQuestions}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}