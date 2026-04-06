import React, { useState, useEffect, useRef } from 'react';
import { OMRResult } from '../services/geminiService';
import { parseTopicMapping } from '../utils/topicParser';
import { getStudentImage, saveStudentImage } from '../services/db';
import { ArrowLeft, Camera, Image as ImageIcon, CheckCircle2, XCircle, Circle, ChevronLeft, ChevronRight } from 'lucide-react';

interface StudentDetailProps {
  student: OMRResult;
  topicMapping: string;
  parsedTopicMapping?: any;
  onBack: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export default function StudentDetail({ student, topicMapping, parsedTopicMapping, onBack, onNext, onPrev, hasNext, hasPrev }: StudentDetailProps) {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chapters = parsedTopicMapping || parseTopicMapping(topicMapping);

  useEffect(() => {
    const loadImage = async () => {
      const file = await getStudentImage(student.name);
      if (file) {
        setImage(URL.createObjectURL(file));
      } else {
        setImage(null);
      }
    };
    loadImage();
  }, [student.name]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasNext, hasPrev, onNext, onPrev]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      await saveStudentImage(student.name, file);
      setImage(URL.createObjectURL(file));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getQuestionStatusIcon = (score: number) => {
    if (score === 1) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (score === -1) return <XCircle className="w-4 h-4 text-red-500" />;
    return <Circle className="w-4 h-4 text-gray-300" />;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">Detailed Report</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onPrev} 
            disabled={!hasPrev} 
            className="p-2 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
            title="Previous Student (Left Arrow)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={onNext} 
            disabled={!hasNext} 
            className="p-2 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors"
            title="Next Student (Right Arrow)"
          >
            <ChevronRight className="w-5 h-5" />
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div 
          className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden group cursor-pointer shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? (
            <>
              <img src={image} alt={student.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500 transition-colors">
              <ImageIcon className="w-10 h-10 mb-2" />
              <span className="text-xs font-medium">Add Photo</span>
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">{student.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
            <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
              <div className="text-sm text-gray-500 font-medium">Total Score</div>
              <div className="text-2xl font-bold text-gray-900">{(student.right * 4) - student.wrong}</div>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
              <div className="text-sm text-green-600 font-medium">Correct</div>
              <div className="text-2xl font-bold text-green-700">{student.right}</div>
            </div>
            <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100">
              <div className="text-sm text-red-600 font-medium">Wrong</div>
              <div className="text-2xl font-bold text-red-700">{student.wrong}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">Topic Breakdown</h3>
        <div className="grid gap-6">
          {chapters.map(chapter => {
            if (chapter.questions.length === 0) return null;
            
            let chapterCorrect = 0;
            chapter.questions.forEach(q => {
              if (student.scores[`q${q}`] === 1) chapterCorrect++;
            });
            const chapterProgress = (chapterCorrect / chapter.questions.length) * 100;

            return (
              <div key={chapter.name} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-900">{chapter.name}</h4>
                    <span className="text-sm font-medium text-gray-600">
                      {chapterCorrect} / {chapter.questions.length}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${chapterProgress}%` }}
                    />
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {chapter.topics.map(topic => {
                    if (topic.questions.length === 0) return null;
                    
                    let topicCorrect = 0;
                    topic.questions.forEach(q => {
                      if (student.scores[`q${q}`] === 1) topicCorrect++;
                    });

                    return (
                      <div key={topic.name} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 text-sm">{topic.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {topicCorrect} of {topic.questions.length} correct
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {topic.questions.map(q => (
                            <div key={q} className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                              <span className="text-xs font-medium text-gray-600 w-5">Q{q}</span>
                              {getQuestionStatusIcon(student.scores[`q${q}`])}
                            </div>
                          ))}
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
    </div>
  );
}