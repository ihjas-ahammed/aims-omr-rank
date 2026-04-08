import React, { useState } from 'react';
import { Batch, TimetableSession } from './types';

interface Props {
  batch: Batch;
  session: TimetableSession;
  onSave: (session: TimetableSession) => void;
  onClose: () => void;
}

export default function EditSlotModal({ batch, session, onSave, onClose }: Props) {
  const [teacherInput, setTeacherInput] = useState(session.teacher || '');
  const [timeInput, setTimeInput] = useState(session.time || '');

  const handleSave = () => {
    onSave({
      ...session,
      teacher: teacherInput.trim(),
      time: timeInput.trim()
    });
  };

  const handleClear = () => {
    setTeacherInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50">
          <h3 className="font-black text-gray-900 text-lg">Assign Session</h3>
          <p className="text-sm text-gray-600 mt-1 font-medium">Batch {batch}</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Time Slot</label>
            <input 
              type="text"
              value={timeInput}
              onChange={e => setTimeInput(e.target.value)}
              placeholder="e.g. 8.30-10.45"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Teacher / Subject / Exam</label>
            <input 
              type="text"
              autoFocus
              value={teacherInput}
              onChange={e => setTeacherInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="e.g. ARJ or Exam"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 font-medium"
            />
            <div className="flex gap-2 mt-3 flex-wrap">
              {['Exam', 'Holiday', 'Self Study'].map(quick => (
                <button 
                  key={quick}
                  onClick={() => setTeacherInput(quick)}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded transition-colors"
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between gap-3">
          <button 
            onClick={handleClear}
            className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
          >
            Clear Assignee
          </button>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}