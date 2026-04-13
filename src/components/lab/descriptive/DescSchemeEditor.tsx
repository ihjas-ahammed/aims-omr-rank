import React, { useState, useEffect } from 'react';
import { fileToBase64 } from '../../../utils/imageProcessing';
import { extractTextFromDocument } from '../../../services/geminiService';
import ExtractButton from './ExtractButton';
import { FileText, AlertTriangle } from 'lucide-react';
import { DescQuestionScheme } from './types';

interface Props {
  answerKey: string;
  setAnswerKey: (val: string) => void;
}

export default function DescSchemeEditor({ answerKey, setAnswerKey }: Props) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [parsedScheme, setParsedScheme] = useState<DescQuestionScheme[] | null>(null);
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    if (!answerKey.trim()) {
      setParsedScheme(null);
      setParseError(false);
      return;
    }
    try {
      const parsed = JSON.parse(answerKey);
      if (Array.isArray(parsed) && parsed.every(p => p.qNum && p.rubric)) {
        setParsedScheme(parsed);
        setParseError(false);
      } else {
        setParsedScheme(null);
        setParseError(true);
      }
    } catch (e) {
      setParsedScheme(null);
      setParseError(true);
    }
  }, [answerKey]);

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
      
      // Attempt to clean JSON formatting
      const cleaned = extractedText.replace(/```json\n?|\n?```/g, '').trim();
      setAnswerKey(cleaned);
      
    } catch (error: any) {
      alert(`Failed to extract text: ${error.message}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpdateField = (index: number, field: string, value: any, rubricKey?: keyof DescQuestionScheme['rubric']) => {
    if (!parsedScheme) return;
    const newScheme = [...parsedScheme];
    if (rubricKey) {
      newScheme[index].rubric[rubricKey] = value;
    } else {
      (newScheme[index] as any)[field] = value;
    }
    setParsedScheme(newScheme);
    setAnswerKey(JSON.stringify(newScheme, null, 2));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="block text-sm font-bold text-gray-700">Question Paper & Evaluation Scheme</label>
        <div className="flex flex-wrap gap-2">
          <ExtractButton 
            isExtracting={isExtracting} 
            onFileSelect={handleExtract} 
            label="Auto-Generate Scheme with AI"
            icon={<FileText className="w-3.5 h-3.5" />}
          />
        </div>
      </div>

      {parseError && (
        <div className="p-3 bg-orange-50 border border-orange-200 text-orange-800 rounded-lg flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          The scheme could not be parsed as the strict JSON format. Please use the AI generator button above.
        </div>
      )}

      {parsedScheme ? (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {parsedScheme.map((q, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">Q.Num:</span>
                  <input 
                    type="text" 
                    value={q.qNum}
                    onChange={e => handleUpdateField(idx, 'qNum', e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded font-bold outline-none focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500">Max Score:</span>
                  <input 
                    type="number" 
                    value={q.maxScore}
                    onChange={e => handleUpdateField(idx, 'maxScore', Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-gray-300 rounded font-bold outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-3">
                  <div className="w-4 h-4 mt-1 rounded-full bg-green-500 shrink-0 shadow-sm" />
                  <textarea 
                    value={q.rubric["3"]} 
                    onChange={e => handleUpdateField(idx, '', e.target.value, "3")}
                    rows={2}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded bg-green-50/30 focus:border-green-500 outline-none resize-none"
                    placeholder="Criteria for full marks..."
                  />
                </div>
                <div className="flex gap-3">
                  <div className="w-4 h-4 mt-1 rounded-full bg-yellow-400 shrink-0 shadow-sm" />
                  <textarea 
                    value={q.rubric["2"]} 
                    onChange={e => handleUpdateField(idx, '', e.target.value, "2")}
                    rows={2}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded bg-yellow-50/30 focus:border-yellow-500 outline-none resize-none"
                    placeholder="Criteria for partial marks..."
                  />
                </div>
                <div className="flex gap-3">
                  <div className="w-4 h-4 mt-1 rounded-full bg-orange-500 shrink-0 shadow-sm" />
                  <textarea 
                    value={q.rubric["1"]} 
                    onChange={e => handleUpdateField(idx, '', e.target.value, "1")}
                    rows={2}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded bg-orange-50/30 focus:border-orange-500 outline-none resize-none"
                    placeholder="Criteria for minimal marks..."
                  />
                </div>
                <div className="flex gap-3">
                  <div className="w-4 h-4 mt-1 rounded-full bg-red-500 shrink-0 shadow-sm" />
                  <textarea 
                    value={q.rubric["0"]} 
                    onChange={e => handleUpdateField(idx, '', e.target.value, "0")}
                    rows={2}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded bg-red-50/30 focus:border-red-500 outline-none resize-none"
                    placeholder="Criteria for zero marks..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <textarea
          value={answerKey}
          onChange={(e) => setAnswerKey(e.target.value)}
          placeholder="Upload a Question Paper to auto-generate the JSON evaluation scheme..."
          rows={10}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-sm font-mono"
        />
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
      `}} />
    </div>
  );
}