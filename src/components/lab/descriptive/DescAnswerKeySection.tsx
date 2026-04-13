import React, { useState } from 'react';
import { fileToBase64 } from '../../../utils/imageProcessing';
import { extractTextFromDocument } from '../../../services/geminiService';
import ExtractButton from './ExtractButton';
import { FileText } from 'lucide-react';

interface Props {
  answerKey: string;
  setAnswerKey: (val: string | ((prev: string) => string)) => void;
}

export default function DescAnswerKeySection({ answerKey, setAnswerKey }: Props) {
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
      const extractedText = await extractTextFromDocument(base64, file.type, apiKeys, proModel, 'descQPAndScheme');

      setAnswerKey(prev => {
        const trimmed = prev.trim();
        if (!trimmed) return extractedText;
        return `${trimmed}\n\n--- Extracted Evaluation Scheme ---\n\n${extractedText}`;
      });

      alert(`Successfully extracted evaluation scheme from Question Paper!`);
    } catch (error: any) {
      alert(`Failed to extract text: ${error.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="block text-sm font-bold text-gray-700">Question Paper & Answer Scheme</label>
        <div className="flex flex-wrap gap-2">
          <ExtractButton 
            isExtracting={isExtracting} 
            onFileSelect={handleExtract} 
            label="Scan Question Paper"
            icon={<FileText className="w-3.5 h-3.5" />}
          />
        </div>
      </div>
      <textarea
        value={answerKey}
        onChange={(e) => setAnswerKey(e.target.value)}
        placeholder="Paste evaluation scheme here or upload a Question Paper to auto-generate the scheme..."
        rows={10}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-mono"
      />
    </div>
  );
}