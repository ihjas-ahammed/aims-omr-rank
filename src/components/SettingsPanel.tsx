import React, { useRef, useState } from 'react';
import { Plus, Minus, Loader2, Upload, RefreshCw, CheckCircle } from 'lucide-react';
import { fetchAvailableModels, parseTopicMappingWithAI, extractTextFromDocument } from '../services/geminiService';
import { fileToBase64 } from '../utils/imageProcessing';
import TopicEditor from './TopicEditor';

interface SettingsPanelProps {
  apiKeys: string[];
  setApiKeys: React.Dispatch<React.SetStateAction<string[]>>;
  liteModel: string;
  setLiteModel: (v: string) => void;
  proModel: string;
  setProModel: (v: string) => void;
  availableModels: string[];
  setAvailableModels: (models: string[]) => void;
  imageResolution: number;
  setImageResolution: (res: number) => void;
  sampling: number;
  setSampling: (val: number) => void;
  concurrency: number;
  setConcurrency: (val: number) => void;
  requestsPerKey: number;
  setRequestsPerKey: (val: number) => void;
  autoCropEnabled: boolean;
  setAutoCropEnabled: (val: boolean) => void;
  answerKey: string;
  setAnswerKey: (val: string) => void;
  attendanceSheet: string;
  setAttendanceSheet: (val: string) => void;
  topicMapping: string;
  setTopicMapping: (val: string) => void;
  parsedTopicMapping: any;
  setParsedTopicMapping: (val: any) => void;
}

export default function SettingsPanel({
  apiKeys, setApiKeys,
  liteModel, setLiteModel,
  proModel, setProModel,
  availableModels, setAvailableModels,
  imageResolution, setImageResolution,
  sampling, setSampling,
  concurrency, setConcurrency,
  requestsPerKey, setRequestsPerKey,
  autoCropEnabled, setAutoCropEnabled,
  answerKey, setAnswerKey,
  attendanceSheet, setAttendanceSheet,
  topicMapping, setTopicMapping,
  parsedTopicMapping, setParsedTopicMapping
}: SettingsPanelProps) {
  const [isExtractingText, setIsExtractingText] = useState<'answerKey' | 'topicMapping' | null>(null);
  const [isUpdatingMapping, setIsUpdatingMapping] = useState(false);
  
  const answerKeyFileInputRef = useRef<HTMLInputElement>(null);
  const topicMappingFileInputRef = useRef<HTMLInputElement>(null);

  const handleFetchModels = async () => {
    try {
      const keys = apiKeys.filter(k => k.trim());
      if (keys.length === 0) return alert('Add at least one API key first.');
      const models = await fetchAvailableModels(keys);
      setAvailableModels(models);
      if (!models.includes(liteModel) && models.length > 0) setLiteModel(models[0]);
      if (!models.includes(proModel) && models.length > 0) setProModel(models[0]);
      alert(`Fetched ${models.length} models successfully!`);
    } catch (error: any) {
      alert('Failed to fetch models: ' + error.message);
    }
  };

  const handleExtractTextFromFile = async (event: React.ChangeEvent<HTMLInputElement>, type: 'answerKey' | 'topicMapping') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtractingText(type);
    try {
      const keys = apiKeys.filter(k => k.trim());
      if (keys.length === 0) {
        alert('Please add at least one API key first.');
        setIsExtractingText(null);
        return;
      }

      const base64 = await fileToBase64(file);
      const extractedText = await extractTextFromDocument(base64, file.type, keys, proModel, type);
      
      if (type === 'answerKey') setAnswerKey(extractedText);
      else setTopicMapping(extractedText);
      
      alert(`Successfully extracted ${type === 'answerKey' ? 'Answer Key' : 'Topic Mapping'}!`);
    } catch (error: any) {
      alert(`Failed to extract text: ${error.message}`);
    } finally {
      setIsExtractingText(null);
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
    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
      <h2 className="text-lg font-medium">Settings</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gemini API Keys
          </label>
          <div className="space-y-2">
            {apiKeys.map((key, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    const newKeys = [...apiKeys];
                    newKeys[i] = e.target.value;
                    setApiKeys(newKeys);
                  }}
                  placeholder="AIzaSy..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
                <button 
                  onClick={() => setApiKeys(prev => prev.filter((_, idx) => idx !== i))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button 
              onClick={() => setApiKeys(prev => [...prev, ''])}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium px-1"
            >
              <Plus className="w-4 h-4" /> Add API Key
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fallback Model (for JSON restructuring)
            </label>
            <input
              type="text"
              list="available-models"
              value={liteModel}
              onChange={(e) => setLiteModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pro Model (for valuation)
            </label>
            <input
              type="text"
              list="available-models"
              value={proModel}
              onChange={(e) => setProModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <datalist id="available-models">
            {availableModels.map(m => (
              <option key={m} value={m} />
            ))}
          </datalist>
          
          <div className="md:col-span-2 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Image Resolution: {imageResolution}px
              </label>
              <input
                type="range"
                min="500"
                max="2048"
                step="100"
                value={imageResolution}
                onChange={(e) => setImageResolution(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1" title="Validations for consensus">
                Sampling
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={sampling}
                onChange={(e) => setSampling(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 h-[42px]"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1" title="Images/Request">
                Images/Req
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={concurrency}
                onChange={(e) => setConcurrency(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 h-[42px]"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1" title="Requests/Key">
                Reqs/Key
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={requestsPerKey}
                onChange={(e) => setRequestsPerKey(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 h-[42px]"
              />
            </div>
            <button
              onClick={handleFetchModels}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 border border-gray-300 transition-colors whitespace-nowrap h-[42px]"
            >
              Fetch Models
            </button>
          </div>

          <div className="md:col-span-2 mt-2 p-4 bg-purple-50 rounded-lg border border-purple-100 flex items-center justify-between">
            <div>
              <label htmlFor="autoCropEnabled" className="text-sm font-bold text-purple-900 cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoCropEnabled"
                  checked={autoCropEnabled}
                  onChange={(e) => setAutoCropEnabled(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-white border-purple-300 rounded focus:ring-purple-500 cursor-pointer"
                />
                Auto-Crop & Rotate OMR with AI
              </label>
              <p className="text-xs text-purple-700 mt-1 ml-6">
                Uses the Lite model to perfectly frame and rotate images before evaluation. Highly recommended for skewed scans!
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Answer Key
            </label>
            <div className="flex gap-2">
              <input 
                type="file" 
                accept="image/*,application/pdf" 
                className="hidden" 
                ref={answerKeyFileInputRef}
                onChange={(e) => handleExtractTextFromFile(e, 'answerKey')}
              />
              <button
                onClick={() => answerKeyFileInputRef.current?.click()}
                disabled={isExtractingText === 'answerKey'}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isExtractingText === 'answerKey' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Load from Image/PDF</>
                )}
              </button>
            </div>
          </div>
          <textarea
            value={answerKey}
            onChange={(e) => setAnswerKey(e.target.value)}
            rows={8}
            placeholder="* **Q1.** A\n* **Q2.** B..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attendance Sheet (Paste names here for cross-checking)
          </label>
          <textarea
            value={attendanceSheet}
            onChange={(e) => setAttendanceSheet(e.target.value)}
            rows={4}
            placeholder="John Doe\nJane Smith\nFathima Nasha..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Topic Wise Questions (for Rank List)
            </label>
            <div className="flex gap-2">
              <input 
                type="file" 
                accept="image/*,application/pdf" 
                className="hidden" 
                ref={topicMappingFileInputRef}
                onChange={(e) => handleExtractTextFromFile(e, 'topicMapping')}
              />
              <button
                onClick={() => topicMappingFileInputRef.current?.click()}
                disabled={isExtractingText === 'topicMapping'}
                className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isExtractingText === 'topicMapping' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Load from Image/PDF</>
                )}
              </button>
              <button
                onClick={handleUpdateTopicMapping}
                disabled={isUpdatingMapping}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium hover:bg-indigo-200 disabled:opacity-50 transition-colors"
              >
                {isUpdatingMapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {isUpdatingMapping ? 'Updating...' : 'Update Mapping'}
              </button>
            </div>
          </div>
          <textarea
            value={topicMapping}
            onChange={(e) => setTopicMapping(e.target.value)}
            rows={8}
            placeholder="### Chapter 1\n* Topic 1: Q1, Q2..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
          {parsedTopicMapping && (
            <>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Mapping successfully parsed and saved.
              </p>
              <TopicEditor 
                parsedTopicMapping={parsedTopicMapping} 
                onUpdate={setParsedTopicMapping} 
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
