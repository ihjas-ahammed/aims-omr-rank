import React from 'react';
import { SubjectProgress, TaskType, TaskData } from './types';
import TaskBadge from './TaskBadge';

interface Props {
  subject: SubjectProgress;
  onOpenEdit: (cIdx: number, field: TaskType, taskData: TaskData) => void;
}

export default function SubjectMobileCards({ subject, onOpenEdit }: Props) {
  return (
    <div className="space-y-4">
      {subject.chapters.map((chapter, cIdx) => (
        <div key={cIdx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-gray-800 mb-3 leading-tight break-words">{chapter.name}</h3>
          <div className="grid grid-cols-3 gap-2">
            {(['tcr', 'entrance', 'revision'] as TaskType[]).map(field => {
              const taskData = chapter[field];
              const label = field === 'tcr' ? 'TCR' : field === 'entrance' ? 'Entrance' : 'Revision';
              return (
                <TaskBadge 
                  key={field}
                  task={taskData} 
                  label={label}
                  onClick={() => onOpenEdit(cIdx, field, taskData)} 
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}