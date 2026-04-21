import React, { useState } from 'react';
import { GeneratedQP } from '../../../services/gemini/qpMakerService';
import { Download, FileCode, Printer, RotateCcw, Eye } from 'lucide-react';
import QPPreviewModal from './QPPreviewModal';

interface QPMakerResultsProps {
  results: GeneratedQP[];
  onReset: () => void;
}

export default function QPMakerResults({ results, onReset }: QPMakerResultsProps) {
  const[previewFile, setPreviewFile] = useState<GeneratedQP | null>(null);

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    results.forEach(res => {
      handleDownload(res.filename, res.htmlContent);
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Generated Question Papers</h3>
            <p className="text-sm text-gray-500 mt-1">Successfully created {results.length} files.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadAll}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download All
            </button>
            <button
              onClick={onReset}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-200 transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Edit & Regenerate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((res, i) => (
            <div key={i} className="flex flex-col bg-gray-50 rounded-xl border border-gray-200 p-4 hover:border-indigo-300 transition-colors shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                  <FileCode className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 truncate" title={res.filename}>{res.filename}</h4>
                  <p className="text-xs text-gray-500 uppercase font-medium mt-0.5">HTML Document</p>
                </div>
              </div>
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => setPreviewFile(res)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <Eye className="w-4 h-4" /> Preview
                </button>
                <button
                  onClick={() => handleDownload(res.filename, res.htmlContent)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" /> Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {previewFile && (
        <QPPreviewModal
          filename={previewFile.filename}
          htmlContent={previewFile.htmlContent}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}