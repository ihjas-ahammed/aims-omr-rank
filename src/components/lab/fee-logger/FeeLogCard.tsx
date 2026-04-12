import React from 'react';
import { format } from 'date-fns';
import { Smartphone, Receipt, Trash2 } from 'lucide-react';
import { FeeLogData } from '../../../services/firebaseService';

interface Props {
  log: FeeLogData;
  deletingId: string | null;
  setDeletingId: (id: string | null) => void;
  handleDelete: (id: string) => void;
}

export default function FeeLogCard({ log, deletingId, setDeletingId, handleDelete }: Props) {
  let dateDisplay = 'N/A';
  if (log.date) {
    try {
      // ensure consistent parsing
      dateDisplay = format(new Date(log.date + 'T12:00:00'), 'MMM d, yyyy');
    } catch (e) {
      dateDisplay = log.date;
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-bold text-gray-900 text-lg">{log.studentName}</div>
          <div className="text-xs text-gray-500 font-medium mt-0.5">Adm: {log.admissionNo} • Class: {log.studentClass}</div>
        </div>
        <div className="font-black text-blue-600 text-lg">${Number(log.feeAmount).toFixed(2)}</div>
      </div>
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
        <div className="flex flex-col gap-1.5 text-xs">
          <span className="text-gray-500 font-medium">{dateDisplay}</span>
          {log.isGPay ? (
            <span className="inline-flex items-center text-green-700 bg-green-50 px-2 py-1 rounded-full font-bold w-fit border border-green-200">
              <Smartphone className="w-3 h-3 mr-1" /> GPay
            </span>
          ) : (
            <span className="inline-flex items-center text-gray-700 bg-gray-100 px-2 py-1 rounded-full font-bold w-fit border border-gray-200">
              <Receipt className="w-3 h-3 mr-1" /> Cash/Other
            </span>
          )}
        </div>
        <div>
          {deletingId === log.id ? (
            <div className="flex flex-col items-end gap-2 bg-red-50 p-2 rounded-lg border border-red-100">
              <span className="text-xs text-red-600 font-bold px-1">Delete?</span>
              <div className="flex gap-2">
                <button onClick={() => handleDelete(log.id)} className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-red-700 transition-colors shadow-sm">Yes</button>
                <button onClick={() => setDeletingId(null)} className="bg-white text-gray-700 border border-gray-300 px-3 py-1.5 rounded text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm">No</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setDeletingId(log.id)} className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-100">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}