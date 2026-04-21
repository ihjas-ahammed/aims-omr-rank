import React from 'react';
import { Plus, X } from 'lucide-react';

interface Props {
  days: number[];
  currentDay: number;
  onSetCurrentDay: (day: number) => void;
  onAddDay: () => void;
  onRemoveDay: (day: number) => void;
}

export default function QPMakerDaySelector({ days, currentDay, onSetCurrentDay, onAddDay, onRemoveDay }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      {days.map(day => (
        <div key={day} className="flex items-center shrink-0">
          <button
            onClick={() => onSetCurrentDay(day)}
            className={`px-4 py-2 rounded-l-md font-medium text-sm transition-colors ${currentDay === day ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
          >
            Day {day}
          </button>
          {days.length > 1 && (
            <button
              onClick={() => onRemoveDay(day)}
              className={`px-2 py-2 rounded-r-md border-y border-r text-sm transition-colors ${currentDay === day ? 'bg-indigo-700 text-white border-indigo-700 hover:bg-indigo-800' : 'bg-white text-gray-400 border-gray-200 hover:bg-red-50 hover:text-red-500'}`}
              title="Delete Day"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={onAddDay}
        className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium shrink-0"
      >
        <Plus className="w-4 h-4" /> Add Day
      </button>
    </div>
  );
}