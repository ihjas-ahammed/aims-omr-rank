import React from 'react';
import { ArrowLeft, Printer, Settings2 } from 'lucide-react';

interface PrintSettingsBarProps {
  subjectName: string;
  setSubjectName: (v: string) => void;
  dayNumber: string;
  setDayNumber: (v: string) => void;
  columnsPerPage: number;
  setColumnsPerPage: (v: number) => void;
  cardScale: number;
  setCardScale: (v: number) => void;
  showTop3: boolean;
  setShowTop3: (v: boolean) => void;
  showHeader: boolean;
  setShowHeader: (v: boolean) => void;
  onBack: () => void;
}

export default function PrintSettingsBar({
  subjectName, setSubjectName, dayNumber, setDayNumber,
  columnsPerPage, setColumnsPerPage, cardScale, setCardScale,
  showTop3, setShowTop3, showHeader, setShowHeader, onBack
}: PrintSettingsBarProps) {
  return (
    <div className="print:hidden mb-4 p-4 md:p-6 bg-white border-b border-gray-200 text-gray-900 shadow-sm sticky top-0 z-50">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-600" />
            Advanced Print Setup
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-gray-500 hidden md:block">
            (Tip: Set Background Graphics to "ON" in your print dialog to keep the dark cards)
          </p>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Print List
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
          <input
            type="text"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Day</label>
          <input
            type="text"
            value={dayNumber}
            onChange={(e) => setDayNumber(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1" title="Cards per row">Columns</label>
          <input
            type="number"
            min="1"
            max="20"
            value={columnsPerPage}
            onChange={(e) => setColumnsPerPage(Number(e.target.value))}
            className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1" title="Adjust to fit more cards">Scale (px)</label>
          <input
            type="number"
            min="4"
            max="32"
            value={cardScale}
            onChange={(e) => setCardScale(Number(e.target.value))}
            className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
          />
        </div>
        <div className="col-span-2 flex flex-col gap-2 pt-1">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input type="checkbox" checked={showTop3} onChange={(e) => setShowTop3(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" /> 
            Show Top 3 Podium
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input type="checkbox" checked={showHeader} onChange={(e) => setShowHeader(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" /> 
            Show Header
          </label>
        </div>
      </div>
    </div>
  );
}
