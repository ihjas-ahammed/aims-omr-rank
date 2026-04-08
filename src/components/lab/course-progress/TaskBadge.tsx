import React from 'react';
import { TaskData } from './types';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface Props {
  task: TaskData;
  onClick: () => void;
  label?: string; // used for mobile view
}

export default function TaskBadge({ task, onClick, label }: Props) {
  const { status, sessions } = task;

  let bgColor = 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50 shadow-sm';
  let headerIcon = <Circle className="w-4 h-4 shrink-0" />;
  let statusText = 'Pending';

  if (status === 'ongoing') {
    bgColor = 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100 shadow-sm';
    headerIcon = <Clock className="w-4 h-4 shrink-0 text-orange-500" />;
    statusText = 'Ongoing';
  } else if (status === 'finished') {
    bgColor = 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100 shadow-sm';
    headerIcon = <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />;
    statusText = 'Completed';
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div 
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-2 rounded-md cursor-pointer transition-colors border w-full h-full min-h-[4rem] ${bgColor}`}
      >
        {label && <span className="text-[10px] uppercase font-bold opacity-60 mb-1.5">{label}</span>}
        <div className="flex items-center justify-center gap-1.5 w-full">
          {headerIcon}
          <span className="text-xs font-bold truncate">{statusText}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`flex flex-col items-center justify-start p-2 rounded-md cursor-pointer transition-colors border w-full h-full min-h-[4rem] ${bgColor}`}
    >
      {label && <span className="text-[10px] uppercase font-bold opacity-60 mb-1.5">{label}</span>}
      
      {/* Visual Header indicating the Overall Task Status */}
      <div className="flex items-center gap-1 mb-2 opacity-80">
        {headerIcon}
        <span className="text-[10px] font-bold uppercase">{statusText}</span>
      </div>

      <div className="flex flex-col w-full gap-1.5 items-center justify-center flex-1">
        {sessions.map((s, idx) => (
          <div key={s.id || idx} className="flex items-center gap-1.5 w-full justify-center bg-white/60 px-2 py-1.5 rounded border border-black/5">
            <span className="text-[11px] sm:text-xs font-bold truncate text-gray-800" title={s.teacher || 'Unassigned'}>
              {s.teacher || 'Unassigned'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}