import React from 'react';
import { FileText, Loader2, Sparkles } from 'lucide-react';
import { QPMakerDayData } from './types';

interface Props {
  data: QPMakerDayData;
  onUpdate: (data: Partial<QPMakerDayData>) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export default function QPMakerInstructions({ data, onUpdate, isGenerating, onGenerate }: Props) {
  return (
    <>
      <div className="p-4 md:p-6">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
          <FileText className="w-4 h-4 text-indigo-500" /> Global / Additional Instructions
        </label>
        <textarea
          value={data.extraInstructions}
          onChange={(e) => onUpdate({ extraInstructions: e.target.value })}
          rows={3}
          placeholder="Any global rules for the AI..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-sm leading-relaxed transition-shadow shadow-sm resize-y outline-none"
        />
      </div>
      
      <div className="p-4 md:p-6 bg-gray-50 border-t border-gray-200">
        <button
          onClick={onGenerate}
          disabled={isGenerating || data.uploadedFiles.length === 0}
          className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          {isGenerating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
          {isGenerating ? 'AI is generating papers...' : 'Generate Question Papers'}
        </button>
      </div>
    </>
  );
}