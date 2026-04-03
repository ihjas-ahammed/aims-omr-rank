import React, { useState, useEffect, useRef } from 'react';
import { OMRResult } from '../services/geminiService';
import { parseTopicMapping, Chapter } from '../utils/topicParser';
import { getStudentImage, saveStudentImage } from '../services/db';
import { ArrowLeft, Camera, Image as ImageIcon, Printer } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedStudentForImage, setSelectedStudentForImage] = useState<string | null>(null);

  const chapters: Chapter[] = parsedTopicMapping || parseTopicMapping(topicMapping);
  
  const calculateScore = (student: OMRResult) => (student.right * 4) - student.wrong;

  const results = files
    .filter(f => f.result)
    .map(f => f.result!)
    .sort((a, b) => calculateScore(b) - calculateScore(a)); // Sort by highest score

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">Rank List</h2>
        </div>
        <button
          onClick={onPrintableClick}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Printable Rank List
        </button>
      </div>

      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleImageUpload}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((student, index) => {
          const isTop3 = index < 3;
          let cardBg = 'bg-white border-gray-200';
          let rankColor = 'text-gray-500';
          
          if (index === 0) {
            cardBg = 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300';
            rankColor = 'text-yellow-600';
          } else if (index === 1) {
            cardBg = 'bg-gradient-to-br from-gray-50 to-gray-200 border-gray-300';
            rankColor = 'text-gray-600';
          } else if (index === 2) {
            cardBg = 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300';
            rankColor = 'text-orange-600';
          }

          return (
            <div 
              key={student.name}
              onClick={() => onStudentClick(student)}
              className={`relative rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${cardBg}`}
            >
              <div className="absolute top-0 right-0 bg-black/5 px-3 py-1 rounded-bl-xl font-bold text-lg">
                #{index + 1}
              </div>

              <div className="flex items-center gap-4 mb-4">
                {isTop3 && (
                  <div 
                    className="relative w-20 h-20 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group shrink-0"
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
                  <h3 className="text-lg font-bold text-gray-900 truncate" title={student.name}>
                    {student.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm">
                    <span className="font-medium text-green-600">Right: {student.right}</span>
                    <span className="font-medium text-red-600">Wrong: {student.wrong}</span>
                  </div>
                  <div className="text-2xl font-black mt-1 text-gray-800">
                    {calculateScore(student)} <span className="text-sm font-medium text-gray-500">pts</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-4 pt-4 border-t border-black/5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Chapter Progress</h4>
                {chapters.map(chapter => {
                  const progress = calculateChapterProgress(student, chapter);
                  return (
                    <div key={chapter.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-700 truncate pr-2" title={chapter.name}>{chapter.name}</span>
                        <span className="font-medium text-gray-900">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
