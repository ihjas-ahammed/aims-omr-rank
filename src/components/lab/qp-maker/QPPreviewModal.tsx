import React from 'react';
import { X, Download, Printer } from 'lucide-react';

interface QPPreviewModalProps {
  filename: string;
  htmlContent: string;
  onClose: () => void;
}

export default function QPPreviewModal({ filename, htmlContent, onClose }: QPPreviewModalProps) {
  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      // Give MathJax time to render before printing
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Preview: {filename}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors ml-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-100 p-4 overflow-hidden relative">
          <div className="w-full h-full bg-white shadow-inner rounded border border-gray-200 overflow-hidden relative">
             <iframe 
               srcDoc={htmlContent} 
               className="w-full h-full border-none bg-white"
               title="Question Paper Preview"
               sandbox="allow-scripts allow-same-origin"
             />
          </div>
        </div>
      </div>
    </div>
  );
}