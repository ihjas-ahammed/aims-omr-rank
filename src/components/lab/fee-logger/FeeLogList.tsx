import React, { useState } from 'react';
import { format } from 'date-fns';
import { Receipt, Smartphone, Trash2 } from 'lucide-react';
import { FeeLogData } from '../../../services/firebaseService';
import FeeLogCard from './FeeLogCard';

interface FeeLogListProps {
  logs: FeeLogData[];
  loading: boolean;
  onDeleteLog: (id: string) => Promise<void>;
}

export default function FeeLogList({ logs, loading, onDeleteLog }: FeeLogListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await onDeleteLog(id);
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <Receipt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">No fee logs yet</h3>
        <p className="text-gray-500 text-sm">Fees logged will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">Recent Fee Logs</h2>
        <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{logs.length} Entries</span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {logs.map((log) => {
              let dateDisplay = 'N/A';
              if (log.date) {
                try {
                  dateDisplay = format(new Date(log.date + 'T12:00:00'), 'MMM d, yyyy');
                } catch(e) {
                  dateDisplay = log.date;
                }
              }

              return (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                  {dateDisplay}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{log.studentName}</div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">Adm: {log.admissionNo}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                  {log.studentClass}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-blue-600">
                  ${Number(log.feeAmount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {log.isGPay ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                      <Smartphone className="w-3 h-3 mr-1" />
                      GPay
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                      <Receipt className="w-3 h-3 mr-1" />
                      Other
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {deletingId === log.id ? (
                    <div className="flex items-center justify-end gap-2 bg-red-50 p-1.5 rounded-lg border border-red-100 w-fit ml-auto">
                      <span className="text-xs text-red-600 font-bold px-1">Delete?</span>
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded text-xs transition-colors shadow-sm"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-2.5 py-1 rounded text-xs transition-colors shadow-sm"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(log.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden p-4 space-y-3 bg-gray-50">
        {logs.map((log) => (
          <FeeLogCard 
            key={log.id} 
            log={log} 
            deletingId={deletingId} 
            setDeletingId={setDeletingId} 
            handleDelete={handleDelete} 
          />
        ))}
      </div>
    </div>
  );
}