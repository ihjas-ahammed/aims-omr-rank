import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { SubjectProgress, TaskType, TaskData } from './types';
import SubjectTable from './SubjectTable';
import SubjectMobileCards from './SubjectMobileCards';
import SessionManagerModal from './SessionManagerModal';

interface Props {
  subject: SubjectProgress;
  onBack: () => void;
  onUpdate: (chapterIdx: number, field: TaskType, taskData: TaskData) => void;
}

export default function SubjectView({ subject, onBack, onUpdate }: Props) {
  const [editing, setEditing] = useState<{ cIdx: number, field: TaskType, taskData: TaskData } | null>(null);

  const openEdit = (cIdx: number, field: TaskType, taskData: TaskData) => {
    setEditing({ cIdx, field, taskData });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 uppercase">{subject.name} Progress</h2>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <SubjectTable subject={subject} onOpenEdit={openEdit} />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <SubjectMobileCards subject={subject} onOpenEdit={openEdit} />
      </div>

      {editing && (
        <SessionManagerModal
          subjectName={subject.name}
          chapterName={subject.chapters[editing.cIdx].name}
          taskType={editing.field}
          taskData={editing.taskData}
          onSave={(updatedTaskData) => {
            onUpdate(editing.cIdx, editing.field, updatedTaskData);
            // Keep the parent state in sync so the modal sees the latest data
            setEditing(prev => prev ? { ...prev, taskData: updatedTaskData } : null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}