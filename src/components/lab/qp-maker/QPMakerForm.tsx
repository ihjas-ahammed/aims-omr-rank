import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Trash2, Calendar, Loader2, Sparkles } from 'lucide-react';
import { DEFAULT_QP_PROMPT } from './constants';
import { format } from 'date-fns';

interface QPMakerFormProps {
  isGenerating: boolean;
  onGenerate: (files: File[], date: string, instructions: string) => void;
}

export default function QPMakerForm({ isGenerating, onGenerate }: QPMakerFormProps) {
  const [date, setDate] = useState(() => format(new Date(), 'dd/MM/yyyy'));
  const [instructions, setInstructions] = useState(DEFAULT_QP_PROMPT);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto update instructions if user changes the date
  useEffect(() => {
    if (instructions.includes('[DATE]')) {
      setInstructions(instructions.replace('[DATE]', date));
    }
  }, [date]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      alert('Please upload at least one image containing the questions.');
      return;
    }
    if (!instructions.trim()) {
      alert('Please provide instructions for the AI.');
      return;
    }
    onGenerate(files, date, instructions);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 md:p-6 space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
                <Calendar className="w-4 h-4 text-indigo-500" /> Exam Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium text-sm transition-shadow shadow-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
                <Upload className="w-4 h-4 text-indigo-500" /> Handwritten Question Images
              </label>
              <p className="text-xs text-gray-500 mb-3">Upload the images containing the questions for all subjects.</p>
              
              <div className="flex flex-wrap gap-3">
                {files.map((file, i) => (
                  <div key={i} className="relative w-20 h-24 sm:w-24 sm:h-28 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0 group overflow-hidden">
                    <img src={URL.createObjectURL(file)} alt={`Upload ${i}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                    <button 
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-24 sm:w-24 sm:h-28 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                >
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">Upload</span>
                </div>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col h-full">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-1">
              <FileText className="w-4 h-4 text-indigo-500" /> AI Instructions
            </label>
            <p className="text-xs text-gray-500 mb-2">Modify the prompt to define how the files should be mapped to batches and sets.</p>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full flex-1 min-h-[200px] px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm leading-relaxed transition-shadow shadow-sm resize-y"
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-200">
        <button
          onClick={handleSubmit}
          disabled={isGenerating || files.length === 0}
          className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
          {isGenerating ? 'AI is generating papers...' : 'Generate HTML Question Papers'}
        </button>
      </div>
    </div>
  );
}