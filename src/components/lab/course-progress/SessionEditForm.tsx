import React, { useState } from 'react';
import { SessionData } from './types';

interface Props {
  initialSession?: SessionData;
  onSave: (session: SessionData) => void;
  onCancel: () => void;
}

export default function SessionEditForm({ initialSession, onSave, onCancel }: Props) {
  const [teacher, setTeacher] = useState(initialSession?.teacher || '');
  const [date, setDate] = useState(initialSession?.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(initialSession?.startTime || '');
  const [endTime, setEndTime] = useState(initialSession?.endTime || '');

  const handleSave = () => {
    onSave({
      id: initialSession?.id || Math.random().toString(36).substring(7),
      teacher: teacher.trim() || null,
      date: date || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-white">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-gray-900 text-lg">{initialSession ? 'Edit Session Details' : 'New Session'}</h4>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Teacher / Assignee</label>
        <input 
          type="text"
          autoFocus
          value={teacher}
          onChange={e => setTeacher(e.target.value)}
          placeholder="e.g. ABR"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Date</label>
        <input 
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm font-medium text-gray-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Start Time</label>
          <input 
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm font-medium text-gray-700"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">End Time</label>
          <input 
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm font-medium text-gray-700"
          />
        </div>
      </div>

      <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3">
        <button 
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg transition-colors w-full sm:w-auto"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors w-full sm:w-auto shadow-sm"
        >
          {initialSession ? 'Update Session' : 'Confirm & Add'}
        </button>
      </div>
    </div>
  );
}