import React from 'react';
import { Batch, BATCHES, TimetableDay, TimetableSession } from './types';
import { Clock } from 'lucide-react';

interface Props {
  data: TimetableDay;
  onEditSlot: (batch: Batch, sessionIndex: number, session: TimetableSession) => void;
}

export default function TimetableMobile({ data, onEditSlot }: Props) {
  return (
    <div className="space-y-6 p-4">
      {BATCHES.map(batch => (
        <div key={batch} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-black text-lg text-gray-800">Batch {batch}</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data[batch]?.map((session, sIdx) => (
              <div 
                key={session.id} 
                onClick={() => onEditSlot(batch, sIdx, session)}
                className={`flex flex-col gap-1 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                  session.teacher 
                    ? 'bg-orange-50 border-orange-200 shadow-sm'
                    : 'bg-white border-dashed border-gray-200 active:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1 justify-center text-gray-500 opacity-80 mb-1">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-center">{session.time}</span>
                </div>
                <div className="flex items-center justify-center flex-1">
                  {session.teacher ? (
                    <span className="font-bold text-sm text-center text-orange-800 line-clamp-2">{session.teacher}</span>
                  ) : (
                    <span className="text-xs font-medium text-gray-400">Assign</span>
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