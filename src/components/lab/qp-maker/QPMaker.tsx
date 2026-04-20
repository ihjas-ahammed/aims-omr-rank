import React, { useState } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import QPMakerForm from './QPMakerForm';
import QPMakerResults from './QPMakerResults';
import { generateQuestionPapers, GeneratedQP } from '../../../services/gemini/qpMakerService';

interface QPMakerProps {
  onBack: () => void;
}

export default function QPMaker({ onBack }: QPMakerProps) {
  const [generatedPapers, setGeneratedPapers] = useState<GeneratedQP[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (files: File[], compiledInstructions: string) => {
    setIsGenerating(true);
    try {
      const apiKeysStr = localStorage.getItem('omr_apiKeysList');
      const apiKeys = apiKeysStr ? JSON.parse(apiKeysStr) : [];
      const model = localStorage.getItem('omr_proModel') || 'gemini-3.1-pro-preview';

      // Send the fully compiled instructions instead of combining it inside the service
      const results = await generateQuestionPapers(files, '', compiledInstructions, apiKeys, model);
      setGeneratedPapers(results);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to discard these generated papers?")) {
      setGeneratedPapers([]);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors border border-gray-200 bg-white shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI QP Maker</h2>
              <p className="text-sm text-gray-500 font-medium">Automated HTML Question Paper Generation</p>
            </div>
          </div>
        </div>
      </div>

      {generatedPapers.length === 0 ? (
        <QPMakerForm 
          isGenerating={isGenerating} 
          onGenerate={handleGenerate} 
        />
      ) : (
        <QPMakerResults 
          results={generatedPapers} 
          onReset={handleReset} 
        />
      )}
    </div>
  );
}