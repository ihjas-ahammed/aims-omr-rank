import React, { useState } from 'react';
import { fileToBase64 } from '../../../utils/imageProcessing';
import { extractTextFromDocument } from '../../../services/geminiService';
import ExtractButton from './ExtractButton';
import { FileText, Key } from 'lucide-react';

interface Props {
  answerKey: string;
  setAnswerKey: (val: string | ((prev: string) => string)) => void;
}

export default function DescAnswerKeySection({ answerKey, setAnswerKey }: Props) {
  const [extractingType, setExtractingType] = useState<'questions' | 'answers' | null>(null);

  const handleExtract = async (file: File, type: 'questions' | 'answers') => {
    setExtractingType(type);
    try {
      const apiKeys = JSON.parse(localStorage.getItem('omr_apiKeysList') || '[]').filter((k: string) => k.trim());
      const proModel = localStorage.getItem('omr_proModel') || 'gemini-3.1-pro-preview';
      
      if (apiKeys.length === 0) {
        alert('Please add at least one API key in the home settings first.');
        return;
      }

      const base64 = await fileToBase64(file);
      const extractionType = type === 'questions' ? 'descQuestions' : 'descAnswerKey';
      const extractedText = await extractTextFromDocument(base64, file.type, apiKeys, proModel, extractionType);

      setAnswerKey(prev => {
        const trimmed = prev.trim();
        if (!trimmed) return extractedText;
        return `${trimmed}\n\n--- ${type === 'questions' ? 'Questions' : 'Answers'} ---\n\n${extractedText}`;
      });

      alert(`Successfully extracted ${type === 'questions' ? 'Questions' : 'Answer Key'}!`);
    } catch (error: any) {
      alert(`Failed to extract text: ${error.message}`);
    } finally {
      setExtractingType(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="block text-sm font-bold text-gray-700">Answer Key & Questions</label>
        <div className="flex flex-wrap gap-2">
          <ExtractButton 
            isExtracting={extractingType === 'questions'} 
            onFileSelect={(file) => handleExtract(file, 'questions')} 
            label="Scan Questions"
            icon={<FileText className="w-3.5 h-3.5" />}
          />
          <ExtractButton 
            isExtracting={extractingType === 'answers'} 
            onFileSelect={(file) => handleExtract(file, 'answers')} 
            label="Scan Answers"
            icon={<Key className="w-3.5 h-3.5" />}
          />
        </div>
      </div>
      <textarea
        value={answerKey}
        onChange={(e) => setAnswerKey(e.target.value)}
        placeholder="Paste or scan question paper and answer key here..."
        rows={8}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-mono"
      />
    </div>
  );
}