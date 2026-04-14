import React, { useState, useRef } from 'react';
import { ArrowLeft, Loader2, Upload, Trash2, Save } from 'lucide-react';
import { processImage } from '../../../utils/imageProcessing';
import { createExam } from '../../../services/firebaseService';

interface ExamSetupProps {
  onNavigate: (view: any) => void;
}

export default function ExamSetup({ onNavigate }: ExamSetupProps) {
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(25);
  const [numOptions, setNumOptions] = useState(4);
  const [answerKeyInput, setAnswerKeyInput] = useState('');
  const [images, setImages] = useState<{ url: string; base64: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    setIsProcessing(true);
    
    try {
      const newImages = [];
      for (const file of Array.from(event.target.files)) {
        // Compress image tightly so it easily fits within Firestore doc limits (1MB)
        const { base64, mimeType } = await processImage(file, 800, 0); 
        newImages.push({
          url: URL.createObjectURL(file),
          base64: `data:${mimeType};base64,${base64}`
        });
      }
      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      alert("Error processing images. Ensure they are valid image files.");
    } finally {
      setIsProcessing(false);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const parseAnswerKey = () => {
    const keyMap: Record<number, string> = {};
    const lines = answerKeyInput.split('\n');
    let qNum = 1;
    const maxChar = String.fromCharCode(64 + numOptions);
    const regex = new RegExp(`\\b([A-${maxChar}])\\b`, 'i');
    
    for (const line of lines) {
      const match = line.match(regex);
      if (match && qNum <= totalQuestions) {
        keyMap[qNum] = match[1].toUpperCase();
        qNum++;
      }
    }
    return keyMap;
  };

  const handleCreateExam = async () => {
    if (!title || !className || images.length === 0 || !answerKeyInput) {
      alert("Please fill in all fields, provide an answer key, and upload at least one image.");
      return;
    }

    const keyMap = parseAnswerKey();
    if (Object.keys(keyMap).length === 0) {
      alert(`Could not parse any valid answers (A-${String.fromCharCode(64 + numOptions)}) from the Answer Key input.`);
      return;
    }

    setIsProcessing(true);

    try {
      const examId = await createExam({
        title,
        className,
        totalQuestions,
        numOptions,
        answerKey: keyMap,
        images: images.map(img => img.base64)
      });

      // Save locally to dashboard
      const saved = localStorage.getItem('omr_created_exams');
      const examsList = saved ? JSON.parse(saved) : [];
      examsList.push({ id: examId, title, date: new Date().toISOString() });
      localStorage.setItem('omr_created_exams', JSON.stringify(examsList));

      alert("Exam Created Successfully!");
      onNavigate('lab-exams');
    } catch (error: any) {
      alert("Failed to create exam: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <button onClick={() => onNavigate('lab-exams')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Setup Online Exam</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Exam Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. Physics Chapter 4 Mock Test" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Target Class/Batch</label>
            <input 
              type="text" 
              value={className} 
              onChange={(e) => setClassName(e.target.value)} 
              placeholder="e.g. Crash 2026" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Total Questions</label>
            <input 
              type="number" 
              min="1" 
              max="200" 
              value={totalQuestions} 
              onChange={(e) => setTotalQuestions(Number(e.target.value))} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Options Per Question</label>
            <input 
              type="number" 
              min="2" 
              max="6" 
              value={numOptions} 
              onChange={(e) => setNumOptions(Number(e.target.value))} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Question Paper Images</label>
          <p className="text-xs text-gray-500 mb-3">Upload clear images of the question paper pages. They will be compressed and presented to the students.</p>
          
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          
          <div className="flex flex-wrap gap-4">
            {images.map((img, i) => (
              <div key={i} className="relative w-32 h-40 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0 group">
                <img src={img.url} alt={`QP Page ${i + 1}`} className="w-full h-full object-cover rounded-lg opacity-90 group-hover:opacity-100" />
                <button 
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1 rounded-b-lg">
                  Page {i + 1}
                </div>
              </div>
            ))}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <Upload className="w-6 h-6 mb-2" />
              <span className="text-xs font-medium">Add Pages</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Answer Key</label>
          <p className="text-xs text-gray-500 mb-2">Paste your answer key. The system will look for letters A to {String.fromCharCode(64 + numOptions)} to assign to questions 1 to {totalQuestions}.</p>
          <textarea 
            value={answerKeyInput} 
            onChange={(e) => setAnswerKeyInput(e.target.value)} 
            rows={10} 
            placeholder="1. A&#10;2. B&#10;3. C&#10;..." 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleCreateExam}
            disabled={isProcessing}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isProcessing ? 'Saving to Cloud...' : 'Create Exam & Generate Link'}
          </button>
        </div>
      </div>
    </div>
  );
}