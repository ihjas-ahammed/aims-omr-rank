import React from 'react';
import { Layers } from 'lucide-react';
import { QPMakerDayData } from './types';

interface Props {
  data: QPMakerDayData;
  onUpdate: (data: Partial<QPMakerDayData>) => void;
}

export default function QPMakerBatches({ data, onUpdate }: Props) {
  return (
    <div className="p-4 md:p-6 border-b border-gray-200">
      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Layers className="w-5 h-5 text-indigo-600" /> Batches & Sets
      </h3>
      <p className="text-xs text-gray-500 mb-4">Define exactly which batches and sets the AI should output HTML files for.</p>
      <textarea
        value={data.batchesAndSets}
        onChange={(e) => onUpdate({ batchesAndSets: e.target.value })}
        rows={4}
        placeholder="B1: Set A, Set B&#10;B2: Set A, Set B"
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-sm leading-relaxed transition-shadow shadow-sm resize-y outline-none"
      />
    </div>
  );
}