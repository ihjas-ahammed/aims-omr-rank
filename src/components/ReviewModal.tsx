import React from 'react';
import { X, RefreshCw, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { OMRResult } from '../services/geminiService';

interface ReviewModalProps {
  fileId: string;
  fileName: string;
  previewUrl?: string;
  result?: OMRResult;
  onClose: () => void;
  onRetry: (id: string) => void;
  isProcessing: boolean;
}

export default function ReviewModal({ fileId, fileName, previewUrl, result, onClose, onRetry, isProcessing }: ReviewModalProps) {
  if (!result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Review: {fileName}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Image Side */}
          <div className="md:w-1/2 bg-gray-100 p-4 flex items-center justify-center overflow-auto border-r border-gray-200">
            {previewUrl ? (
              <img src={previewUrl} alt="OMR Sheet" className="max-w-full max-h-full object-contain shadow-sm rounded border border-gray-300" />
            ) : (
              <div className="text-gray-500">No image preview available</div>
            )}
          </div>
          
          {/* Details Side */}
          <div className="md:w-1/2 p-6 overflow-y-auto bg-white flex flex-col">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{result.name}</h3>
              <div className="flex gap-4 text-lg">
                <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                  <span className="font-semibold">Right:</span> {result.right}
                </div>
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg border border-red-200">
                  <span className="font-semibold">Wrong:</span> {result.wrong}
                </div>
                <div className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-200">
                  <span className="font-semibold">Score:</span> {result.right - result.wrong}
                </div>
              </div>
            </div>

            <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Question Breakdown</h4>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {Array.from({ length: 25 }, (_, i) => i + 1).map(qNum => {
                const score = result.scores[`q${qNum}`];
                let bgColor = 'bg-gray-100 border-gray-200 text-gray-600';
                let Icon = MinusCircle;
                let iconColor = 'text-gray-400';
                
                if (score === 1) {
                  bgColor = 'bg-green-50 border-green-200 text-green-800';
                  Icon = CheckCircle;
                  iconColor = 'text-green-500';
                } else if (score === -1) {
                  bgColor = 'bg-red-50 border-red-200 text-red-800';
                  Icon = XCircle;
                  iconColor = 'text-red-500';
                }

                return (
                  <div key={qNum} className={`flex flex-col items-center p-2 rounded border ${bgColor}`}>
                    <span className="text-xs font-medium mb-1">Q{qNum}</span>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                    <span className="text-xs mt-1 font-bold">{score > 0 ? '+1' : score < 0 ? '-1' : '0'}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onRetry(fileId);
                  onClose();
                }}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors text-lg shadow-sm"
              >
                <RefreshCw className="w-5 h-5" />
                Retry Evaluation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
