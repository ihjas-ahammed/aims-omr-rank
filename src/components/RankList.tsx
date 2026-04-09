import React, { useState, useEffect, useRef } from 'react';
import { OMRResult } from '../services/geminiService';
import { parseTopicMapping, Chapter } from '../utils/topicParser';
import { getStudentImage, saveStudentImage } from '../services/db';
import { ArrowLeft, Camera, Image as ImageIcon, Printer, Search } from 'lucide-react';

interface RankListProps {
  files: { result?: OMRResult }[];
  topicMapping: string;
  parsedTopicMapping?: any;
  onBack: () => void;
  onStudentClick: (student: OMRResult) => void;
  onPrintableClick: () => void;
}

export default function RankList({ files, topicMapping, parsedTopicMapping, onBack, onStudentClick, onPrintableClick }: RankListProps) {
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
    }); // Sort by highest score

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

  const calculateChapterProgress = (student: OMRResult, chapter: Chapter) => {
    if (chapter.questions.length === 0) return 0;
    let correct = 0;
    chapter.questions.forEach(q => {
      if (student.scores[`q${q}`] === 1) correct++;
    });
    return (correct / chapter.questions.length) * 100;
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResults.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 shadow-sm">
            No students found matching your search.
          </div>
        ) : (
          filteredResults.map(({ student, rank }, mapIndex) => {
            // Find original global index for proper styling of top 3
            const index = rankedResults.findIndex(r => r.student.name === student.name);
            const isTop3 = index < 3;
            
            let cardBg = 'bg-white border-gray-200';
            let rankColor = 'text-gray-500';
            let spanClass = '';
            
            if (index === 0) {
              cardBg = 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 shadow-yellow-100';
              rankColor = 'text-yellow-700';
              spanClass = 'md:col-span-2 md:row-span-2';
            } else if (index === 1) {
              cardBg = 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400';
              rankColor = 'text-gray-700';
            } else if (index === 2) {
              cardBg = 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-400';
              rankColor = 'text-orange-700';
            }

            return (
              <div 
                key={`${student.name}-${rank}`}
                onClick={() => onStudentClick(student)}
                className={`relative rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${cardBg} ${spanClass}`}
              >
                <div className={`absolute top-0 right-0 bg-black/5 px-4 py-1.5 rounded-bl-xl font-black text-lg ${rankColor}`}>
                  #{rank}
                </div>

                <div className={`flex items-center gap-4 mb-4 ${index === 0 ? 'md:flex-col md:items-start md:gap-6' : ''}`}>
                  {isTop3 && (
                    <div 
                      className={`relative rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden group shrink-0 ${index === 0 ? 'w-24 h-24 md:w-32 md:h-32' : 'w-20 h-20'}`}
                      onClick={(e) => triggerImageUpload(e, student.name)}
                    >
                      {studentImages[student.name] ? (
                        <>
                          <img src={studentImages[student.name]} alt={student.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      )}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`${index === 0 ? 'text-2xl md:text-3xl' : 'text-lg'} font-bold text-gray-900 truncate`} title={student.name}>
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">Correct: {student.right}</span>
                      <span className="font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded">Wrong: {student.wrong}</span>
                    </div>
                    <div className={`${index === 0 ? 'text-4xl' : 'text-2xl'} font-black mt-2 text-gray-800`}>
                      {calculateScore(student)} <span className="text-sm font-medium text-gray-500">pts</span>
                    </div>
                  </div>
                </div>

                <div className={`space-y-3 mt-4 pt-4 border-t ${index === 0 ? 'border-yellow-300' : 'border-black/5'}`}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Chapter Progress</h4>
                  {chapters.map(chapter => {
                    const progress = calculateChapterProgress(student, chapter);
                    return (
                      <div key={chapter.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-700 truncate pr-2 font-medium" title={chapter.name}>{chapter.name}</span>
                          <span className="font-bold text-gray-900">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${index === 0 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}