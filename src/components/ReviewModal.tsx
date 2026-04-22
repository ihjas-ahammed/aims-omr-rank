import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { OMRResult } from '../services/geminiService';
import ReviewImagePanel from './review/ReviewImagePanel';
import ReviewDetailsPanel from './review/ReviewDetailsPanel';
import ReviewKeyPanel from './review/ReviewKeyPanel';

interface ReviewModalProps {
  fileId: string;
  fileName: string;
  previewUrl?: string;
  splitPreviews?: string[];
  result?: OMRResult;
  answerKey?: string;
  numQuestions: number;
  onClose: () => void;
  onRetry: (id: string) => void;
  isProcessing: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  onUpdateName?: (id: string, newName: string) => void;
  onUpdateScore?: (id: string, qNum: number, newScore: number) => void;
  onUpdateImage?: (id: string, file: File) => void;
}

export default function ReviewModal({
  fileId, fileName, previewUrl, splitPreviews, result, answerKey, numQuestions,
  onClose, onRetry, isProcessing,
  onNext, onPrev, hasNext, hasPrev, onUpdateName, onUpdateScore, onUpdateImage
}: ReviewModalProps) {
  const[isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(result?.name || '');
  const [isEditingImage, setIsEditingImage] = useState(false);

  useEffect(() => {
    setIsEditingName(false);
    setEditedName(result?.name || '');
    setIsEditingImage(false);
  }, [fileId, result?.name]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingName || isEditingImage) return;
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasNext, hasPrev, onNext, onPrev, isEditingName, isEditingImage]);

  if (!result) return null;

  const handleSaveName = () => {
    if (onUpdateName && editedName.trim()) {
      onUpdateName(fileId, editedName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-sm">
      {hasPrev && !isEditingImage && (
        <button onClick={onPrev} className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/80 hover:bg-white rounded-full shadow-lg z-50 transition-all">
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800" />
        </button>
      )}
      {hasNext && !isEditingImage && (
        <button onClick={onNext} className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/80 hover:bg-white rounded-full shadow-lg z-50 transition-all">
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-gray-800" />
        </button>
      )}

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden relative">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate pr-4">Review: {fileName}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors shrink-0">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          <ReviewImagePanel
            fileId={fileId}
            previewUrl={previewUrl}
            splitPreviews={splitPreviews}
            isEditingImage={isEditingImage}
            setIsEditingImage={setIsEditingImage}
            onUpdateImage={onUpdateImage}
          />

          <ReviewDetailsPanel
            fileId={fileId}
            result={result}
            numQuestions={numQuestions}
            isEditingName={isEditingName}
            setIsEditingName={setIsEditingName}
            editedName={editedName}
            setEditedName={setEditedName}
            handleSaveName={handleSaveName}
            onUpdateScore={onUpdateScore}
            onRetry={onRetry}
            onClose={onClose}
            isProcessing={isProcessing}
          />

          <ReviewKeyPanel answerKey={answerKey} />
        </div>
      </div>
    </div>
  );
}