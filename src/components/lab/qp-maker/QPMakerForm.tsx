import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, Calendar, Loader2, Sparkles, Clock, Target, Layers } from 'lucide-react';
import { format } from 'date-fns';

interface UploadedFile {
  id: string;
  file: File;
  description: string;
  previewUrl: string;
}

interface QPMakerFormProps {
  isGenerating: boolean;
  onGenerate: (files: File[], compiledInstructions: string) => void;
}

export default function QPMakerForm({ isGenerating, onGenerate }: QPMakerFormProps) {
  const [date, setDate] = useState(() => format(new Date(), 'dd/MM/yyyy'));
  const [duration, setDuration] = useState('30');
  const [totalMarks, setTotalMarks] = useState('15');
  const [subjectDivision, setSubjectDivision] = useState('Chemistry: 5, Mathematics: 5, Biology: 5');
  const [batchesAndSets, setBatchesAndSets] = useState('B1: Set A, Set B\nB2: Set A, Set B\nB3: Set A, Set B');
  const [extraInstructions, setExtraInstructions] = useState('Each subject must have the specified marks. Make sure to allocate the right questions. Change values for mathematical/physics problems to create Set B variations.');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        description: '',
        previewUrl: URL.createObjectURL(file)
      }));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const toRemove = prev.find(f => f.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
      return filtered;
    });
  };

  const updateFileDescription = (id: string, description: string) => {
    setUploadedFiles(prev => prev.map(f => f.id === id ? { ...f, description } : f));
  };

  const handleSubmit = () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one image containing the questions.');
      return;
    }
    
    // Compile everything into a structured prompt
    const compiledInstructions = `
EXAM DATE: ${date}
DURATION: ${duration} minutes
MAXIMUM MARKS: ${totalMarks}
SUBJECTS & MARKS DIVISION: ${subjectDivision}

REQUIRED OUTPUT FILES (Batches & Sets):
${batchesAndSets}

UPLOADED FILES & THEIR MAPPING DESCRIPTIONS:
${uploadedFiles.map((f, i) => `File ${i + 1} (${f.file.name}): ${f.description}`).join('\n\n')}

ADDITIONAL INSTRUCTIONS:
${extraInstructions}
    `.trim();

    onGenerate(uploadedFiles.map(f => f.file), compiledInstructions);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* 1. Exam Parameters */}
      <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" /> Exam Parameters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> Date
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="DD/MM/YYYY"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-shadow shadow-sm outline-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              <Clock className="w-4 h-4 text-indigo-500" /> Duration (Mins)
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 30"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-shadow shadow-sm outline-none"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              <Target className="w-4 h-4 text-indigo-500" /> Total Marks
            </label>
            <input
              type="text"
              value={totalMarks}
              onChange={(e) => setTotalMarks(e.target.value)}
              placeholder="e.g. 15"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-shadow shadow-sm outline-none"
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Subjects & Marks Division
            </label>
            <input
              type="text"
              value={subjectDivision}
              onChange={(e) => setSubjectDivision(e.target.value)}
              placeholder="e.g. Chemistry: 5, Mathematics: 5, Biology: 5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-shadow shadow-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Batches & Sets Config */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" /> Batches & Sets
        </h3>
        <p className="text-xs text-gray-500 mb-4">Define exactly which batches and sets the AI should output HTML files for.</p>
        <textarea
          value={batchesAndSets}
          onChange={(e) => setBatchesAndSets(e.target.value)}
          rows={4}
          placeholder="B1: Set A, Set B&#10;B2: Set A, Set B"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-sm leading-relaxed transition-shadow shadow-sm resize-y outline-none"
        />
      </div>

      {/* 3. Image Uploads and Side-by-Side Descriptions */}
      <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" /> Uploaded Questions & Mapping
            </h3>
            <p className="text-xs text-gray-500 mt-1">Upload files and write specific instructions next to each (e.g., "Physics for B1, B2 (Set A and B)")</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <Upload className="w-4 h-4" /> Add Files
          </button>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>

        <div className="space-y-4">
          {uploadedFiles.length === 0 ? (
            <div className="text-center py-10 bg-white border-2 border-dashed border-gray-200 rounded-xl">
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">No images uploaded yet.</p>
            </div>
          ) : (
            uploadedFiles.map((f, i) => (
              <div key={f.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="relative w-full sm:w-32 h-40 shrink-0 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden group">
                  <img src={f.previewUrl} alt={`Upload ${i+1}`} className="w-full h-full object-cover" />
                  <div className="absolute top-0 left-0 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg">
                    File {i+1}
                  </div>
                  <button 
                    onClick={() => removeFile(f.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Description / Mapping Instructions</label>
                  <textarea
                    value={f.description}
                    onChange={(e) => updateFileDescription(f.id, e.target.value)}
                    placeholder="e.g. Physics (for all class, set A, set B). Change values for Set B."
                    className="w-full flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-none outline-none"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Extra Instructions */}
      <div className="p-4 md:p-6">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
          <FileText className="w-4 h-4 text-indigo-500" /> Global / Additional Instructions
        </label>
        <textarea
          value={extraInstructions}
          onChange={(e) => setExtraInstructions(e.target.value)}
          rows={3}
          placeholder="Any global rules for the AI..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-sm leading-relaxed transition-shadow shadow-sm resize-y outline-none"
        />
      </div>
      
      <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-200">
        <button
          onClick={handleSubmit}
          disabled={isGenerating || uploadedFiles.length === 0}
          className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
          {isGenerating ? 'AI is generating papers...' : 'Generate Question Papers'}
        </button>
      </div>
    </div>
  );
}