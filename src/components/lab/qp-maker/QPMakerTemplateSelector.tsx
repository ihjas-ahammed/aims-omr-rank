import React from 'react';
import { LayoutTemplate, CheckCircle2 } from 'lucide-react';
import { QP_TEMPLATES } from './constants';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function QPMakerTemplateSelector({ selectedId, onSelect }: Props) {
  return (
    <div className="p-4 md:p-6 border-b border-gray-200">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <LayoutTemplate className="w-5 h-5 text-indigo-600" /> Template Design
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {QP_TEMPLATES.map(template => (
          <div 
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col gap-2 ${
              selectedId === template.id 
                ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                : 'border-gray-200 bg-white hover:border-indigo-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <h4 className={`font-bold ${selectedId === template.id ? 'text-indigo-900' : 'text-gray-800'}`}>
                {template.name}
              </h4>
              {selectedId === template.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}