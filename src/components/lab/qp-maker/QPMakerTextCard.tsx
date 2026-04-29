import React from 'react';
import { Trash2, Type } from 'lucide-react';
import { QPItem } from './types';

interface QPMakerTextCardProps {
  itemData: QPItem;
  index: number;
  onRemove: (id: string) => void;
  onUpdateDescription: (id: string, description: string) => void;
  onUpdateTextContent: (id: string, textContent: string) => void;
}

export default function QPMakerTextCard({ itemData, index, onRemove, onUpdateDescription, onUpdateTextContent }: QPMakerTextCardProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm relative">
      <div className="absolute top-0 left-0 bg-black/5 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-br-lg z-10">
        Src {index + 1}
      </div>
      <button 
        onClick={() => onRemove(itemData.id)}
        className="absolute top-2 right-2 bg-red-50 text-red-500 p-1.5 rounded-full hover:bg-red-100 transition-colors z-10"
        title="Remove Text Block"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="w-full md:w-1/2 flex flex-col mt-4 md:mt-0 pt-2">
        <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 pl-1">
          <Type className="w-3.5 h-3.5" /> Text Content
        </label>
        <textarea
          value={itemData.textContent || ''}
          onChange={(e) => onUpdateTextContent(itemData.id, e.target.value)}
          placeholder="Paste question text here..."
          className="w-full flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-y outline-none min-h-[120px]"
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col pt-2">
        <label className="block text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 pl-1">
          Instructions / Mapping
        </label>
        <textarea
          value={itemData.description}
          onChange={(e) => onUpdateDescription(itemData.id, e.target.value)}
          placeholder="e.g. Physics Section A. Generate questions from this text."
          className="w-full flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-y outline-none min-h-[120px]"
        />
      </div>
    </div>
  );
}