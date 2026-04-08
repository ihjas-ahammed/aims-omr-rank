import React from 'react';
import { Batch, BATCHES, TimetableDay, TimetableSession } from './types';
import { UserPlus, Clock } from 'lucide-react';

interface Props {
  data: TimetableDay;
  onEditSlot: (batch: Batch, sessionIndex: number, session: TimetableSession) => void;
}

export default function TimetableDesktop({ data, onEditSlot }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {BATCHES.map(batch => (
        <div key={batch} className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="font-black text-2xl text-gray-800 w-16 shrink-0 text-center">{batch}</div>
          <div className="flex gap-3 overflow-x-auto pb-2 flex-1 scrollbar-thin scrollbar-thumb-gray-300">
            {data[batch]?.map((session, sIdx) => (
              <div 
                key={session.id}
                onClick={() => onEditSlot(batch, sIdx, session)}
                className={`min-w-[140px] flex flex-col justify-center rounded-lg border-2 cursor-pointer transition-all p-3 shrink-0 ${
                  session.teacher 
                    ? 'bg-white border-orange-200 hover:border-orange-400 shadow-sm'
                    : 'bg-white border-dashed border-gray-200 hover:border-orange-400'
                }`}
              >
                <div className="flex items-center gap-1.5 text-gray-500 mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">{session.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  {session.teacher ? (
                    <span className="font-bold text-orange-800 text-sm tracking-wide break-words w-full">{session.teacher}</span>
                  ) : (
                    <span className="text-gray-400 font-medium text-sm flex items-center gap-1">
                      <UserPlus className="w-4 h-4" /> Assign
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}