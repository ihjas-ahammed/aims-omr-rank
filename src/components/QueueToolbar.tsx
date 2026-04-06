import React from 'react';
import { Trash2, RefreshCw, RotateCcw, Play, CheckCircle, Download, Upload, Trophy, Loader2, RotateCw, Search } from 'lucide-react';

interface QueueToolbarProps {
  filesLength: number;
  hasErrors: boolean;
  hasSuccess: boolean;
  isProcessing: boolean;
  isExporting: boolean;
  isRotating: boolean;
  autoCropEnabled: boolean;
  setAutoCropEnabled: (v: boolean) => void;
  correctNamesOnExport: boolean;
  setCorrectNamesOnExport: (v: boolean) => void;
  onClearAll: () => void;
  onRetryFailed: () => void;
  onRecheckAll: () => void;
  onProcess: () => void;
  onFixNames: () => void;
  onExportCSV: () => void;
  onImportCSVClick: () => void;
  onViewRankList: () => void;
  allSuccess: boolean;
  selectedCount: number;
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onRotateSelected: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
}

export default function QueueToolbar({
  filesLength, hasErrors, hasSuccess, isProcessing, isExporting, isRotating,
  autoCropEnabled, setAutoCropEnabled, correctNamesOnExport, setCorrectNamesOnExport,
  onClearAll, onRetryFailed, onRecheckAll, onProcess, onFixNames, onExportCSV, onImportCSVClick, onViewRankList, allSuccess,
  selectedCount, isAllSelected, onSelectAll, onRotateSelected,
  searchQuery, onSearchChange
}: QueueToolbarProps) {
  return (
    <div className="flex flex-col gap-4 w-full bg-gray-50 p-4 border-b border-gray-200">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-medium whitespace-nowrap">Queue ({filesLength})</h2>
          <label className="flex items-center gap-2 text-sm text-gray-700 bg-white px-2.5 py-1.5 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
            <input 
              type="checkbox" 
              checked={isAllSelected} 
              onChange={(e) => onSelectAll(e.target.checked)} 
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer" 
              disabled={filesLength === 0}
            />
            <span className="font-medium">All</span>
          </label>
          <button
            onClick={onRotateSelected}
            disabled={isProcessing || isExporting || isRotating || selectedCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md font-bold hover:bg-indigo-200 disabled:opacity-50 transition-colors text-sm shadow-sm"
            title="Rotate Selected 90° Clockwise"
          >
            {isRotating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
            <span>Rotate ({selectedCount})</span>
          </button>
        </div>
        
        <div className="w-full md:w-64">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search names or files..." 
               value={searchQuery} 
               onChange={(e) => onSearchChange(e.target.value)} 
               className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 shadow-sm" 
             />
           </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 items-center">
        <label className="flex items-center gap-2 text-sm text-gray-700 bg-white px-3 py-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={autoCropEnabled}
            onChange={(e) => setAutoCropEnabled(e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="hidden sm:inline">Auto-Crop & Rotate</span>
          <span className="sm:hidden">Auto-Crop</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 bg-white px-3 py-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={correctNamesOnExport}
            onChange={(e) => setCorrectNamesOnExport(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="hidden sm:inline">Correct Names</span>
          <span className="sm:hidden">Names</span>
        </label>
        
        <button
          onClick={onClearAll}
          disabled={isProcessing || isExporting || filesLength === 0}
          className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title="Clear All"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden lg:inline">Clear</span>
        </button>
        {hasErrors && (
          <button
            onClick={onRetryFailed}
            disabled={isProcessing || isExporting}
            className="flex items-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            title="Retry Failed"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden lg:inline">Retry</span>
          </button>
        )}
        {hasSuccess && (
          <button
            onClick={onRecheckAll}
            disabled={isProcessing || isExporting}
            className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-md font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            title="Recheck All"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden lg:inline">Recheck</span>
          </button>
        )}
        <button
          onClick={onProcess}
          disabled={isProcessing || isExporting || allSuccess || filesLength === 0}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title="Start Processing"
        >
          <Play className="w-4 h-4" />
          <span className="hidden lg:inline">{isProcessing ? 'Processing...' : 'Start'}</span>
        </button>
        <button
          onClick={onFixNames}
          disabled={!hasSuccess || isProcessing || isExporting}
          className="flex items-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-md font-medium hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title="Fix Names"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="hidden lg:inline">Fix Names</span>
        </button>
        <button
          onClick={onExportCSV}
          disabled={!hasSuccess || isExporting}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title="Export CSV"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span className="hidden lg:inline">{isExporting ? 'Correcting...' : 'Export'}</span>
        </button>
        <button
          onClick={onImportCSVClick}
          disabled={isProcessing}
          className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-md font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title="Import CSV"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden lg:inline">Import</span>
        </button>
        <button
          onClick={onViewRankList}
          disabled={!hasSuccess}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          title="Rank List"
        >
          <Trophy className="w-4 h-4" />
          <span className="hidden lg:inline">Rank List</span>
        </button>
      </div>
    </div>
  );
}