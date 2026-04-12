import React, { useRef, useState } from 'react';
import { Loader2, Upload, RefreshCw, CheckCircle } from 'lucide-react';
import { parseTopicMappingWithAI, extractTextFromDocument } from '../../services/geminiService';
import { fileToBase64 } from '../../utils/imageProcessing';
import TopicEditor from '../TopicEditor';

interface TopicMappingPanelProps {
  apiKeys: string[];
  proModel: string;
  topicMapping: string;
  setTopicMapping: (val: string) => void;
  parsedTopicMapping: any;
  setParsedTopicMapping: (val: any) => void;
  dayLabel?: string;
}

export default function TopicMappingPanel({
  apiKeys,
  proModel,
  topicMapping,
  setTopicMapping,
  parsedTopicMapping,
  setParsedTopicMapping,
  dayLabel
}: TopicMappingPanelProps) {
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [isUpdatingMapping, setIsUpdatingMapping] = useState(false);

  const topicMappingFileInputRef = useRef<HTMLInputElement>(null);

  const handleExtractTextFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtractingText(true);
    try {
      const keys = apiKeys.filter(k => k.trim());
      if (keys.length === 0) {
        alert('Please add at least one API key first.');
        setIsExtractingText(false);
        return;
      }

      const base64 = await fileToBase64(file);
      const extractedText = await extractTextFromDocument(base64, file.type, keys, proModel, 'topicMapping');

      setTopicMapping(extractedText);

      alert('Successfully extracted Topic Mapping!');
    } catch (error: any) {
      alert(`Failed to extract text: ${error.message}`);
    } finally {
      setIsExtractingText(false);
    }

    event.target.value = '';
  };

  const handleUpdateTopicMapping = async () => {
    setIsUpdatingMapping(true);
    try {
      const keys = apiKeys.filter(k => k.trim());
      const parsed = await parseTopicMappingWithAI(topicMapping, keys, proModel);
      setParsedTopicMapping(parsed);
      alert('Topic mapping updated successfully!');
    } catch (error: any) {
      alert('Failed to update topic mapping: ' + error.message);
    }
    setIsUpdatingMapping(false);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          Topic Wise Questions {dayLabel ? `(Day ${dayLabel})` : ''}
        </h3>
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            ref={topicMappingFileInputRef}
            onChange={handleExtractTextFromFile}
          />
          <button
            onClick={() => topicMappingFileInputRef.current?.click()}
            disabled={isExtractingText}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isExtractingText ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Extracting...</>
            ) : (
              <><Upload className="w-3 h-3" /> From Image/PDF</>
            )}
          </button>
          <button
            onClick={handleUpdateTopicMapping}
            disabled={isUpdatingMapping}
            className="flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-200 disabled:opacity-50 transition-colors"
          >
            {isUpdatingMapping ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {isUpdatingMapping ? 'Updating...' : 'Parse'}
          </button>
        </div>
      </div>
      <textarea
        value={topicMapping}
        onChange={(e) => setTopicMapping(e.target.value)}
        rows={6}
        placeholder="### Chapter 1\n* Topic 1: Q1, Q2..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
      />
      {parsedTopicMapping && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Mapping parsed and saved.
        </p>
      )}
      {parsedTopicMapping && (
        <TopicEditor
          parsedTopicMapping={parsedTopicMapping}
          onUpdate={setParsedTopicMapping}
        />
      )}
    </div>
  );
}
