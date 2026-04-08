import React from 'react';
import { Batch, BATCHES, TimeSlot, TIME_SLOTS, TimetableDay } from './types';
import { UserPlus } from 'lucide-react';

interface Props {
  data: TimetableDay;
  onEditSlot: (batch: Batch, slot: TimeSlot, currentTeacher: string) => void;
}

export default function TimetableGrid({ data, onEditSlot }: Props) {
  return (
    <>
      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 text-gray-700 text-sm border-b border-gray-200">
              <th className="p-4 font-bold border-r border-gray-200 bg-gray-100 w-24 text-center">Batch / Time</th>
              {TIME_SLOTS.map(slot => (
                <th key={slot} className="p-4 font-bold text-center w-40">{slot}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {BATCHES.map(batch => (
              <tr key={batch} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-lg font-black text-gray-800 text-center border-r border-gray-200 bg-gray-50">
                  {batch}
                </td>
                {TIME_SLOTS.map(slot => {
                  const teacher = data[batch]?.[slot] || '';
                  return (
                    <td key={slot} className="p-3 text-center align-middle">
                      <div 
                        onClick={() => onEditSlot(batch, slot, teacher)}
                        className={`min-h-[3rem] flex items-center justify-center rounded-lg border-2 cursor-pointer transition-all p-2 mx-auto max-w-[120px] ${
                          teacher 
                            ? 'bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100 hover:border-orange-300 shadow-sm'
                            : 'bg-white border-dashed border-gray-200 text-gray-400 hover:border-orange-400 hover:bg-orange-50'
                        }`}
                      >
                        {teacher ? (
                          <span className="font-bold text-sm tracking-wide break-words">{teacher}</span>
                        ) : (
                          <UserPlus className="w-4 h-4 opacity-50" />
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View (Cards) */}
      <div className="block md:hidden space-y-6 p-4">
        {BATCHES.map(batch => (
          <div key={batch} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-black text-lg text-gray-800">Batch {batch}</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {TIME_SLOTS.map(slot => {
                const teacher = data[batch]?.[slot] || '';
                return (
                  <div key={slot} className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500 text-center tracking-wider">{slot}</span>
                    <div 
                      onClick={() => onEditSlot(batch, slot, teacher)}
                      className={`h-12 flex items-center justify-center rounded-lg border-2 cursor-pointer transition-all p-2 ${
                        teacher 
                          ? 'bg-orange-50 border-orange-200 text-orange-800 shadow-sm'
                          : 'bg-white border-dashed border-gray-200 text-gray-400 active:bg-gray-50'
                      }`}
                    >
                      {teacher ? (
                        <span className="font-bold text-sm text-center line-clamp-2">{teacher}</span>
                      ) : (
                        <span className="text-xs font-medium opacity-60">Assign</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}