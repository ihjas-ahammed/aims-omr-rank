import React from 'react';
import { Trash2, AlertCircle, RefreshCw, CheckCircle, RotateCcw, FileImage } from 'lucide-react';
import PredictiveProgressBar from './PredictiveProgressBar';
import { OMRResult } from '../services/geminiService';

export interface ProcessedFile {
  id: string;
  fileName: string;
  file?: File;
  previewUrl?: string;
  splitPreviews?: string[];
  status: 'pending' | 'processing' | 'success' | 'error';
  attempt?: number;
  maxAttempts?: number;
  stageName?: string;
  result?: OMRResult;
  error?: string;
}

interface QueueItemProps {
  file: ProcessedFile;
  numQuestions: number;
  isProcessing: boolean;
  averageTime: number;
  isSelected: boolean;
  onToggleSelect: (id: string, checked: boolean) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onRecheck: (id: string) => void;
  onClick: () => void;
}

export default function QueueItem({ file, numQuestions, isProcessing, averageTime, isSelected, onToggleSelect, onRemove, onRetry, onRecheck, onClick }: QueueItemProps) {
  return (
    <div 
      className={`p-4 flex items-start gap-3 sm:gap-4 ${file.status === 'success' ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''} ${isSelected ? 'bg-blue-50/50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center h-24 pt-0">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={(e) => onToggleSelect(file.id, e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {file.previewUrl ? (
        <div className="relative shrink-0">
          <img src={file.previewUrl} alt="Preview" className="w-24 h-24 object-contain rounded-lg border border-gray-200 bg-white" />
          {file.splitPreviews && file.splitPreviews.length > 0 && (
            <div className="absolute -top-2 -right-2 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200 shadow-sm">
              Split
            </div>
          )}
        </div>
      ) : file.splitPreviews && file.splitPreviews.length > 0 ? (
        <div className="flex flex-col gap-1 shrink-0 h-24 overflow-y-auto custom-scrollbar pr-1">
          {file.splitPreviews.map((url, i) => (
             <img key={i} src={url} alt={`Split Preview ${i}`} className="w-24 object-contain rounded-lg border border-gray-200 bg-white" />
          ))}
        </div>
      ) : (
        <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center shrink-0 text-gray-400">
          <FileImage className="w-8 h-8" />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900 truncate pr-2">
            {file.fileName || 'Camera Capture'}
          </h3>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(file.id);
            }}
            className="text-gray-400 hover:text-red-500 shrink-0"
            disabled={file.status === 'processing'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        {file.status === 'pending' && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Pending
          </span>
        )}
        {file.status === 'processing' && (
          <div className="w-full">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse mb-2">
              Processing...
            </span>
            <PredictiveProgressBar 
              isProcessing={true} 
              stageName={file.stageName || 'Processing...'}
              attempt={file.attempt || 1} 
              expectedAttempts={file.maxAttempts || 1} 
              averageTime={averageTime} 
            />
          </div>
        )}
        {file.status === 'error' && (
          <div className="text-sm text-red-600 flex items-start gap-1 mt-1">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="flex-1">{file.error}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRetry(file.id);
              }}
              disabled={isProcessing}
              className="ml-2 text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50 font-medium"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}
        {file.status === 'success' && file.result && (
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium text-gray-900">{file.result.name}</span>
                <span className="text-sm text-gray-500">
                  (Right: <span className="text-green-600 font-medium">{file.result.right}</span>, 
                  Wrong: <span className="text-red-600 font-medium">{file.result.wrong}</span>)
                </span>
                {file.result.confidences && file.result.confidences.length > 0 ? (
                  <div className="flex gap-1">
                    {file.result.confidences.map((conf, idx) => (
                      <span key={idx} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        conf < 30 ? 'bg-red-100 text-red-800' : 
                        conf < 50 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`} title={`Attempt ${idx + 1} Confidence`}>
                        {conf}%
                      </span>
                    ))}
                  </div>
                ) : file.result.confidence !== undefined && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    file.result.confidence < 30 ? 'bg-red-100 text-red-800' : 
                    file.result.confidence < 50 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {file.result.confidence}% Conf
                  </span>
                )}
                {file.result.nameConfidence !== undefined && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    file.result.nameConfidence < 30 ? 'bg-orange-100 text-orange-800' : 
                    file.result.nameConfidence < 50 ? 'bg-blue-100 text-blue-800' : 
                    'bg-purple-100 text-purple-800'
                  }`} title="Name Match Confidence">
                    Name: {file.result.nameConfidence}%
                  </span>
                )}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRecheck(file.id);
                }}
                disabled={isProcessing}
                className="text-purple-600 hover:text-purple-800 flex items-center gap-1 disabled:opacity-50 font-medium text-sm border border-purple-200 px-2 py-1 rounded bg-purple-50 hover:bg-purple-100"
              >
                <RotateCcw className="w-3 h-3" /> Recheck
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar p-1 border border-gray-100 rounded bg-white">
              {Array.from({ length: numQuestions }, (_, i) => i + 1).map(qNum => {
                const score = file.result!.scores[`q${qNum}`];
                let bgColor = 'bg-gray-100 text-gray-600';
                if (score === 1) bgColor = 'bg-green-100 text-green-700';
                if (score === -1) bgColor = 'bg-red-100 text-red-700';
                
                return (
                  <div key={qNum} className={`text-[10px] px-1.5 py-0.5 rounded ${bgColor}`} title={`Q${qNum}: ${score}`}>
                    Q{qNum}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}