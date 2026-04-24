import React from 'react';
import { Calendar, Clock, Target } from 'lucide-react';
import SubjectDivisionInput from './SubjectDivisionInput';
import { QPMakerDayData } from './types';

interface Props {
  data: QPMakerDayData;
  onUpdate: (data: Partial<QPMakerDayData>) => void;
}

export default function QPMakerExamParams({ data, onUpdate }: Props) {
  return (
    <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/50">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-600" /> Exam Parameters
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4 text-indigo-500" /> Date
          </label>
          <input
            type="text"
            value={data.date}
            onChange={(e) => onUpdate({ date: e.target.value })}
            placeholder="DD/MM/YYYY"
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-shadow shadow-sm outline-none"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
            <Clock className="w-4 h-4 text-indigo-500" /> Duration (Mins)
          </label>
          <input
            type="text"
            value={data.duration}
            onChange={(e) => onUpdate({ duration: e.target.value })}
            placeholder="e.g. 30"
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-shadow shadow-sm outline-none"
          />
        </div>
        <div className="sm:col-span-2 md:col-span-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
            <Target className="w-4 h-4 text-indigo-500" /> Total Marks
          </label>
          <input
            type="text"
            value={data.totalMarks}
            onChange={(e) => onUpdate({ totalMarks: e.target.value })}
            placeholder="e.g. 15"
            className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-shadow shadow-sm outline-none"
          />
        </div>
        <div className="sm:col-span-2 md:col-span-4">
          <SubjectDivisionInput 
            divisions={data.subjectDivisions} 
            onChange={(divs) => onUpdate({ subjectDivisions: divs })} 
          />
        </div>
      </div>
    </div>
  );
}