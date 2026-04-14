import React, { useState, useEffect, useRef } from 'react';
import { OMRResult } from '../services/geminiService';
import { parseTopicMapping, Chapter } from '../utils/topicParser';
import { getStudentImage, saveStudentImage } from '../services/db';
import { ArrowLeft, Printer, Search } from 'lucide-react';
import AppTopRankCard from './ranklist/AppTopRankCard';
import AppStandardRankCard from './ranklist/AppStandardRankCard';
import ClassDashboard from './ranklist/ClassDashboard';

interface RankListProps {
  files: { result?: OMRResult }[];
  topicMapping: string;
  parsedTopicMapping?: any;
  numQuestions: number;
  onBack: () => void;
  onStudentClick: (student: OMRResult) => void;
  onPrintableClick: () => void;
}

export default function RankList({ files, topicMapping, parsedTopicMapping, numQuestions, onBack, onStudentClick, onPrintableClick }: RankListProps) {
  const [studentImages, setStudentImages] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedStudentForImage, setSelectedStudentForImage] = useState<string | null>(null);

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

  const filteredResults = rankedResults.filter(r => r.student.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Podium contains all students with rank 1, 2, or 3 (up to 5 max)
  const podiumStudents = filteredResults.filter(r => r.rank <= 3).slice(0, 5);
  // The rest go into the standard grid
  const standardStudents = filteredResults.slice(podiumStudents.length);

  useEffect(() => {
    const loadImages = async () => {
      const images: Record<string, string> = {};
      // Only load images for those who actually appear in the podium
      for (const item of podiumStudents) {
        const file = await getStudentImage(item.student.name);
        if (file) {
          images[item.student.name] = URL.createObjectURL(file);
        }
      }
      setStudentImages(images);
    };
    loadImages();
  }, [rankedResults, searchQuery]); 

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && selectedStudentForImage) {
      const file = event.target.files[0];
      await saveStudentImage(selectedStudentForImage, file);
      setStudentImages(prev => ({
        ...prev,
        [selectedStudentForImage]: URL.createObjectURL(file)
      }));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSelectedStudentForImage(null);
  };

  const triggerImageUpload = (e: React.MouseEvent, studentName: string) => {
    e.stopPropagation();
    setSelectedStudentForImage(studentName);
    fileInputRef.current?.click();
  };

  // Helper to visually arrange podium so highest ranks are in the center on desktop
  const getDesktopOrderClass = (index: number, total: number) => {
    const orders: Record<number, number[]> = {
      1: [1],
      2: [2, 1],
      3: [2, 1, 3],
      4: [3, 2, 4, 1],
      5: [3, 2, 4, 1, 5]
    };
    const order = orders[total]?.[index] || index + 1;
    const map: Record<number, string> = {
      1: 'md:order-1',
      2: 'md:order-2',
      3: 'md:order-3',
      4: 'md:order-4',
      5: 'md:order-5'
    };
    return map[order] || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">Rank List</h2>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
          <button
            onClick={onPrintableClick}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Printable List</span>
            <span className="sm:hidden">Print</span>
          </button>
        </div>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleImageUpload}
      />

      {podiumStudents.length === 0 && standardStudents.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
          No students found matching your search.
        </div>
      ) : (
        <>
          <ClassDashboard results={sortedResults} chapters={chapters} numQuestions={numQuestions} />

          {podiumStudents.length > 0 && (
            <div className="flex flex-col md:flex-row flex-wrap justify-center items-center md:items-end gap-6 mb-12 mt-4">
              {podiumStudents.map((item, index) => (
                <AppTopRankCard
                  key={`${item.student.name}-${item.rank}`}
                  student={item.student}
                  rank={item.rank}
                  score={item.score}
                  chapters={chapters}
                  numQuestions={numQuestions}
                  imageUrl={studentImages[item.student.name]}
                  onImageClick={triggerImageUpload}
                  onClick={() => onStudentClick(item.student)}
                  orderClass={getDesktopOrderClass(index, podiumStudents.length)}
                />
              ))}
            </div>
          )}

          {standardStudents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {standardStudents.map(item => (
                <AppStandardRankCard
                  key={`${item.student.name}-${item.rank}`}
                  student={item.student}
                  rank={item.rank}
                  score={item.score}
                  chapters={chapters}
                  onClick={() => onStudentClick(item.student)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}