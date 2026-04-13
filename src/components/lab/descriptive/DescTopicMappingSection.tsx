import React, { useState } from 'react';
import { fileToBase64 } from '../../../utils/imageProcessing';
import { extractTextFromDocument } from '../../../services/geminiService';
import ExtractButton from './ExtractButton';
import { Map } from 'lucide-react';

interface Props {
  topicMapping: string;
  setTopicMapping: (val: string) => void;
}

export default function DescTopicMappingSection({ topicMapping, setTopicMapping }: Props) {
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtract = async (file: File) => {
    setIsExtracting(true);
    try {
      const apiKeys = JSON.parse(localStorage.getItem('omr_apiKeysList') || '[]').filter((k: string) => k.trim());
      const proModel = localStorage.getItem('omr_proModel') || 'gemini-3.1-pro-preview';
      
      if (apiKeys.length === 0) {
        alert('Please add at least one API key in the home settings first.');
        return;
      }

      const base64 = await fileToBase64(file);
      const extractedText = await extractTextFromDocument(base64, file.type, apiKeys, proModel, 'descTopicMapping');

      setTopicMapping(extractedText);
      alert('Successfully extracted Topic Mapping!');
    } catch (error: any) {
      alert(`Failed to extract text: ${error.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-3 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="block text-sm font-bold text-gray-700">Topic Mapping (Optional)</label>
        <div className="flex flex-wrap gap-2">
          <ExtractButton 
            isExtracting={isExtracting} 
            onFileSelect={handleExtract} 
            label="Scan Mapping"
            icon={<Map className="w-3.5 h-3.5" />}
          />
        </div>
      </div>
      <textarea
        value={topicMapping}
        onChange={(e) => setTopicMapping(e.target.value)}
        placeholder="e.g. Cell Biology: Q1, Q2..."
        rows={5}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-mono"
      />
    </div>
  );
}