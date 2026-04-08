import React from 'react';
import { SubjectProgress, TaskType, TaskData } from './types';
import TaskBadge from './TaskBadge';

interface Props {
  subject: SubjectProgress;
  onOpenEdit: (cIdx: number, field: TaskType, val: TaskData) => void;
}

export default function SubjectTable({ subject, onOpenEdit }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
            <th className="p-4 font-semibold">Chapter</th>
            <th className="p-4 font-semibold text-center w-48">TCR</th>
            <th className="p-4 font-semibold text-center w-48">Entrance</th>
            <th className="p-4 font-semibold text-center w-48">Revision</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {subject.chapters.map((chapter, cIdx) => (
            <tr key={cIdx} className="hover:bg-gray-50 transition-colors">
              <td className="p-4 text-sm font-medium text-gray-800">{chapter.name}</td>
              {(['tcr', 'entrance', 'revision'] as TaskType[]).map(field => {
                const taskData = chapter[field];
                return (
                  <td key={field} className="p-3 text-center align-top">
                    <TaskBadge 
                      task={taskData} 
                      onClick={() => onOpenEdit(cIdx, field, taskData)} 
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}