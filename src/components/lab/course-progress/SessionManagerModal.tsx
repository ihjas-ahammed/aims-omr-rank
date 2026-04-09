import React, { useState, useEffect } from 'react';
import { TaskType, TaskData, SessionData, TaskStatus } from './types';
import SessionEditForm from './SessionEditForm';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

interface Props {
  subjectName: string;
  chapterName: string;
  taskType: TaskType;
  taskData: TaskData;
  onSave: (taskData: TaskData) => void;
  onClose: () => void;
}

export default function SessionManagerModal({ subjectName, chapterName, taskType, taskData, onSave, onClose }: Props) {
  const [localTaskData, setLocalTaskData] = useState<TaskData>(taskData);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [userCancelledAdd, setUserCancelledAdd] = useState(false);

  useEffect(() => {
    if (localTaskData.sessions.length === 0 && !isAdding && !editingSessionId && !userCancelledAdd) {
      setIsAdding(true);
    }
  }, [localTaskData.sessions.length, isAdding, editingSessionId, userCancelledAdd]);

  const getTaskLabel = (field: TaskType) => {
    if (field === 'tcr') return 'TCR';
    if (field === 'entrance') return 'Entrance';
    return 'Revision';
  };

  const handleStatusChange = (status: TaskStatus) => {
    const newTaskData = { ...localTaskData, status };
    setLocalTaskData(newTaskData);
    onSave(newTaskData);
  };

  const handleSaveSession = (session: SessionData) => {
    let newSessions;
    if (isAdding) {
      newSessions = [...localTaskData.sessions, session];
      setUserCancelledAdd(false); // Reset cancel flag when a session is added
    } else {
      newSessions = localTaskData.sessions.map(s => s.id === session.id ? session : s);
    }

    // Automatically change status to 'ongoing' if adding first session and status is still pending
    let newStatus = localTaskData.status;
    if (isAdding && newStatus === 'pending') {
      newStatus = 'ongoing';
    }

    const newTaskData = { status: newStatus, sessions: newSessions };
    setLocalTaskData(newTaskData);
    setIsAdding(false);
    setEditingSessionId(null);
    onSave(newTaskData); // Auto-save on addition or edit
  };

  const handleDeleteSession = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }
    const newSessions = localTaskData.sessions.filter(s => s.id !== id);
    const newTaskData = { ...localTaskData, sessions: newSessions };
    setLocalTaskData(newTaskData);
    setEditingSessionId(null);
    setIsAdding(false);
    onSave(newTaskData); // Auto-save on deletion
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-start justify-between shrink-0">
          <div className="flex-1 pr-2">
            <h3 className="font-bold text-gray-900 truncate" title={chapterName}>
              {chapterName}
            </h3>
            <p className="text-xs text-gray-600 mt-1 font-medium">Task: {getTaskLabel(taskType)} ({subjectName})</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Task Status Selection */}
        <div className="p-4 border-b border-gray-100 bg-white shrink-0">
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Overall Task Status</label>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => handleStatusChange('pending')}
              className={`py-2 text-xs font-bold rounded-lg border transition-colors ${localTaskData.status === 'pending' ? 'bg-gray-100 border-gray-400 text-gray-800 shadow-inner' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => handleStatusChange('ongoing')}
              className={`py-2 text-xs font-bold rounded-lg border transition-colors ${localTaskData.status === 'ongoing' ? 'bg-orange-100 border-orange-400 text-orange-800 shadow-inner' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              Ongoing
            </button>
            <button 
              onClick={() => handleStatusChange('finished')}
              className={`py-2 text-xs font-bold rounded-lg border transition-colors ${localTaskData.status === 'finished' ? 'bg-green-100 border-green-500 text-green-800 shadow-inner' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              Completed
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-gray-50/50 flex flex-col">
          <div className="p-4 space-y-3">
            {localTaskData.sessions.length > 0 ? (
              localTaskData.sessions.map((session) => (
                <div key={session.id} className={`bg-white p-3 rounded-xl border ${editingSessionId === session.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} shadow-sm flex items-center justify-between gap-3 transition-all`}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{session.teacher || 'Unassigned'}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate font-medium">
                        {session.date ? session.date : 'No date'}
                        {session.startTime && ` • ${session.startTime}`}
                        {session.endTime && ` - ${session.endTime}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => { setEditingSessionId(session.id); setIsAdding(false); }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit Session"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              !isAdding && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No sessions recorded yet.
                </div>
              )
            )}
            
            {!(isAdding || editingSessionId) && (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium text-sm mt-2"
              >
                <Plus className="w-4 h-4" /> Add Session Record
              </button>
            )}
          </div>

          {(isAdding || editingSessionId) && (
            <div className="mt-auto border-t border-gray-200 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <SessionEditForm
                key={editingSessionId || 'new'}
                initialSession={editingSessionId ? localTaskData.sessions.find(s => s.id === editingSessionId) : undefined}
                onSave={handleSaveSession}
                onCancel={() => {
                  setIsAdding(false);
                  setEditingSessionId(null);
                  setUserCancelledAdd(true);
                }}
              />
            </div>
          )}
        </div>

        {!(isAdding || editingSessionId) && (
          <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3 shrink-0">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm w-full sm:w-auto"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}