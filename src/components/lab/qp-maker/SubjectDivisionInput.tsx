import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SubjectDivision } from './types';

interface Props {
  divisions: SubjectDivision[];
  onChange: (divs: SubjectDivision[]) => void;
}

export default function SubjectDivisionInput({ divisions, onChange }: Props) {
  const handleAdd = () => {
    onChange([...divisions, { id: Math.random().toString(36).substring(7), subject: 'Physics', marks: '' }]);
  };
  
  const handleRemove = (id: string) => {
    onChange(divisions.filter(d => d.id !== id));
  };
  
  const handleChange = (id: string, field: keyof SubjectDivision, value: string) => {
    onChange(divisions.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const subjects =['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Botany', 'Zoology', 'General'];

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
        Subjects & Marks Division
      </label>
      {divisions.map((div, i) => (
        <div key={div.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select 
            value={div.subject} 
            onChange={e => handleChange(div.id, 'subject', e.target.value)}
            className="flex-1 px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none bg-white font-medium text-gray-800"
          >
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={div.marks} 
              onChange={e => handleChange(div.id, 'marks', e.target.value)}
              placeholder="Marks"
              className="w-full sm:w-24 px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none font-medium"
            />
            <button 
              onClick={() => handleRemove(div.id)} 
              className="p-2.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 sm:border-transparent bg-white sm:bg-transparent"
              title="Remove Subject"
            >
              <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      ))}
      <button 
        onClick={handleAdd} 
        className="flex items-center justify-center sm:justify-start gap-1 w-full sm:w-auto px-4 py-2.5 sm:p-0 text-sm text-indigo-600 hover:text-indigo-800 font-bold sm:font-medium bg-indigo-50 sm:bg-transparent rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Subject
      </button>
    </div>
  );
}