import React, { useState } from 'react';
import { TaskType, SessionData, TaskStatus } from './types';

interface Props {
  subjectName: string;
  chapterName: string;
  taskType: TaskType;
  currentSession: SessionData;
  onSave: (data: SessionData) => void;
  onClose: () => void;
}

export default function EditTaskModal({ subjectName, chapterName, taskType, currentSession, onSave, onClose }: Props) {
  const [teacher, setTeacher] = useState(currentSession.teacher || '');
  const [status, setStatus] = useState<TaskStatus>(currentSession.status || 'pending');
  const [date, setDate] = useState(currentSession.date || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(currentSession.startTime || '');
  const [endTime, setEndTime] = useState(currentSession.endTime || '');

  const getTaskLabel = (field: TaskType) => {
    if (field === 'tcr') return 'TCR';
    if (field === 'entrance') return 'Entrance';
    return 'Revision';
  };

  const handleSave = () => {
    onSave({
      teacher: teacher.trim() || null,
      status,
      date: date || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined
    });
  };

  const handleClear = () => {
    onSave({ teacher: null, status: 'pending' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-200 bg-gray-50 shrink-0">
          <h3 className="font-bold text-gray-800 truncate" title={chapterName}>
            {chapterName}
          </h3>
          <p className="text-xs text-gray-500 mt-1 font-medium">Task: {getTaskLabel(taskType)} ({subjectName})</p>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Teacher / Assignee</label>
            <input 
              type="text"
              autoFocus
              value={teacher}
              onChange={e => setTeacher(e.target.value)}
              placeholder="e.g. ABR"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 font-medium"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Session Status</label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setStatus('pending')}
                className={`py-2 text-xs font-bold rounded-md border transition-colors ${status === 'pending' ? 'bg-gray-100 border-gray-400 text-gray-800' : 'bg-white border-gray-200 text-gray-500'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setStatus('ongoing')}
                className={`py-2 text-xs font-bold rounded-md border transition-colors ${status === 'ongoing' ? 'bg-orange-100 border-orange-400 text-orange-800' : 'bg-white border-gray-200 text-gray-500'}`}
              >
                Ongoing
              </button>
              <button 
                onClick={() => setStatus('finished')}
                className={`py-2 text-xs font-bold rounded-md border transition-colors ${status === 'finished' ? 'bg-green-100 border-green-400 text-green-800' : 'bg-white border-gray-200 text-gray-500'}`}
              >
                Finished
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Date</label>
            <input 
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Start Time</label>
              <input 
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">End Time</label>
              <input 
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between gap-3 shrink-0">
          <button 
            onClick={handleClear}
            className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
          >
            Clear Task
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
              className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}