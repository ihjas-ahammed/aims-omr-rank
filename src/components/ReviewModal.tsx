import React, { useState, useEffect } from 'react';
import { X, RefreshCw, CheckCircle, XCircle, MinusCircle, ChevronLeft, ChevronRight, RotateCw, Edit2, Check } from 'lucide-react';
import { OMRResult } from '../services/geminiService';

interface ReviewModalProps {
  fileId: string;
  fileName: string;
  previewUrl?: string;
  result?: OMRResult;
  answerKey?: string;
  onClose: () => void;
  onRetry: (id: string) => void;
  isProcessing: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  onUpdateName?: (id: string, newName: string) => void;
}

export default function ReviewModal({ 
  fileId, fileName, previewUrl, result, answerKey, 
  onClose, onRetry, isProcessing,
  onNext, onPrev, hasNext, hasPrev, onUpdateName
}: ReviewModalProps) {
  const [rotation, setRotation] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(result?.name || '');

  useEffect(() => {
    setRotation(0);
    setIsEditingName(false);
    setEditedName(result?.name || '');
  }, [fileId, result?.name]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingName) return; // Don't navigate while typing
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasNext, hasPrev, onNext, onPrev, isEditingName]);

  if (!result) return null;

  const handleSaveName = () => {
    if (onUpdateName && editedName.trim()) {
      onUpdateName(fileId, editedName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      {hasPrev && (
        <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg z-50 transition-all">
          <ChevronLeft className="w-8 h-8 text-gray-800" />
        </button>
      )}
      {hasNext && (
        <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white rounded-full shadow-lg z-50 transition-all">
          <ChevronRight className="w-8 h-8 text-gray-800" />
        </button>
      )}

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden relative">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Review: {fileName}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Image Side */}
          <div className="md:w-5/12 bg-gray-100 p-4 flex flex-col items-center justify-center overflow-hidden border-r border-gray-200 relative">
            <button 
              onClick={() => setRotation(r => (r + 90) % 360)} 
              className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow z-10 text-gray-700 transition-colors"
              title="Rotate Image"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <div className="w-full h-full flex items-center justify-center overflow-auto">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="OMR Sheet" 
                  className="max-w-full max-h-full object-contain shadow-sm rounded border border-gray-300 transition-transform duration-200" 
                  style={{ transform: `rotate(${rotation}deg)` }}
                />
              ) : (
                <div className="text-gray-500">No image preview available</div>
              )}
            </div>
          </div>
          
          {/* Details Side */}
          <div className="md:w-4/12 p-6 overflow-y-auto bg-white flex flex-col border-r border-gray-200">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="flex-1 text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent px-1 py-0.5"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                    />
                    <button onClick={handleSaveName} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                      <Check className="w-5 h-5" />
                    </button>
                    <button onClick={() => { setIsEditingName(false); setEditedName(result.name); }} className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900">{result.name}</h3>
                    <button 
                      onClick={() => setIsEditingName(true)} 
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit Name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              <div className="flex gap-4 text-lg mt-4">
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

          {/* Answer Key Side */}
          <div className="md:w-3/12 p-6 overflow-y-auto bg-gray-50 flex flex-col">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Answer Key</h4>
            <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm overflow-y-auto">
              <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap font-sans">
                {answerKey || 'No answer key provided.'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
