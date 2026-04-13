import React from 'react';
import { Upload, Trash2, CheckCircle2, Download, Play, Loader2, Printer } from 'lucide-react';

interface Props {
  pipelineState: string;
  imagesCount: number;
  studentsCount: number;
  onUploadClick: () => void;
  onClearAll: () => void;
  onFixNames: () => void;
  onExportCSV: () => void;
  onEvaluate: () => void;
  onPrint?: () => void;
}

export default function DescriptiveToolbar({
  pipelineState, imagesCount, studentsCount,
  onUploadClick, onClearAll, onFixNames, onExportCSV, onEvaluate, onPrint
}: Props) {
  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div className="flex flex-wrap gap-3 w-full lg:w-auto">
        <button
          onClick={onUploadClick}
          disabled={pipelineState === 'processing'}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Upload className="w-4 h-4" /> Upload Images
        </button>
        <button
          onClick={onClearAll}
          disabled={pipelineState === 'processing' || (imagesCount === 0 && studentsCount === 0)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Trash2 className="w-4 h-4" /> Clear All
        </button>
      </div>

      <div className="flex flex-wrap gap-3 w-full lg:w-auto">
        <button
          onClick={onFixNames}
          disabled={pipelineState === 'processing' || studentsCount === 0}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg font-medium hover:bg-yellow-100 transition-colors disabled:opacity-50 shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4" /> Fix Names
        </button>
        <button
          onClick={onExportCSV}
          disabled={pipelineState !== 'done'}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg font-medium hover:bg-green-100 transition-colors disabled:opacity-50 shadow-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
        {onPrint && (
          <button
            onClick={onPrint}
            disabled={pipelineState !== 'done'}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print Results
          </button>
        )}
        <button
          onClick={onEvaluate}
          disabled={imagesCount === 0 || pipelineState === 'processing'}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {pipelineState === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Evaluate
        </button>
      </div>
    </div>
  );
}