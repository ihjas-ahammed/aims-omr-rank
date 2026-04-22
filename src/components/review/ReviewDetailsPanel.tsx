import React from 'react';
import { Edit2, Check, X, RefreshCw } from 'lucide-react';
import ReviewQuestionGrid from '../ReviewQuestionGrid';
import { OMRResult } from '../../services/geminiService';

interface Props {
  fileId: string;
  result: OMRResult;
  numQuestions: number;
  isEditingName: boolean;
  setIsEditingName: (v: boolean) => void;
  editedName: string;
  setEditedName: (v: string) => void;
  handleSaveName: () => void;
  onUpdateScore?: (id: string, qNum: number, newScore: number) => void;
  onRetry: (id: string) => void;
  onClose: () => void;
  isProcessing: boolean;
}

export default function ReviewDetailsPanel({
  fileId, result, numQuestions, isEditingName, setIsEditingName, editedName, setEditedName, handleSaveName, onUpdateScore, onRetry, onClose, isProcessing
}: Props) {
  return (
    <div className="md:w-4/12 p-4 sm:p-6 overflow-y-auto bg-white flex flex-col border-r border-gray-200">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {isEditingName ? (
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-1 text-xl sm:text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent px-1 py-0.5"
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
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{result.name}</h3>
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
        <div className="flex gap-2 sm:gap-4 text-base sm:text-lg mt-4 flex-wrap">
          <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 flex-1 text-center">
            <span className="font-semibold text-xs uppercase block opacity-70">Right</span> {result.right}
          </div>
          <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200 flex-1 text-center">
            <span className="font-semibold text-xs uppercase block opacity-70">Wrong</span> {result.wrong}
          </div>
          <div className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 flex-1 text-center">
            <span className="font-semibold text-xs uppercase block opacity-70">Score</span> {result.right - result.wrong}
          </div>
        </div>
      </div>

      <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2 text-sm uppercase tracking-wider">Question Breakdown</h4>
      <ReviewQuestionGrid
        fileId={fileId}
        result={result}
        numQuestions={numQuestions}
        onUpdateScore={onUpdateScore}
      />

      <div className="mt-auto pt-4 border-t border-gray-200 shrink-0">
        <button
          onClick={() => {
            onRetry(fileId);
            onClose();
          }}
          disabled={isProcessing}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors text-base shadow-sm"
        >
          <RefreshCw className="w-5 h-5" />
          Retry Evaluation
        </button>
      </div>
    </div>
  );
}