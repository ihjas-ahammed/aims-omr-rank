import React from 'react';
import { Loader2, Save, AlertTriangle, Trash2 } from 'lucide-react';
import { ExtractedRecord } from './index';

interface ImageScannerResultsProps {
  results: ExtractedRecord[];
  isSaving: boolean;
  saveToDatabase: () => void;
  removeRecord: (index: number) => void;
  updateRecord: (index: number, field: keyof ExtractedRecord, value: any) => void;
  getDuplicateReason: (record: ExtractedRecord, index: number) => string | null;
}

export default function ImageScannerResults({
  results,
  isSaving,
  saveToDatabase,
  removeRecord,
  updateRecord,
  getDuplicateReason
}: ImageScannerResultsProps) {
  if (results.length === 0) return null;

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Extracted Records ({results.length})
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Please review the extracted data. Edit fields directly before saving.
          </p>
        </div>
        <button
          onClick={saveToDatabase}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save All
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Adm No</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">GPay</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((record, idx) => {
              const duplicateReason = getDuplicateReason(record, idx);
              return (
              <tr key={idx} className={`hover:bg-gray-50 transition-colors ${duplicateReason ? 'bg-yellow-50' : ''}`}>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={record.admissionNo}
                    onChange={(e) => updateRecord(idx, 'admissionNo', e.target.value)}
                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-1 text-sm font-medium"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={record.studentClass}
                    onChange={(e) => updateRecord(idx, 'studentClass', e.target.value)}
                    className="w-20 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-1 text-sm font-medium"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={record.studentName}
                    onChange={(e) => updateRecord(idx, 'studentName', e.target.value)}
                    className="w-full min-w-[150px] bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-1 text-sm font-bold text-gray-900"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    value={record.feeAmount}
                    onChange={(e) => updateRecord(idx, 'feeAmount', Number(e.target.value))}
                    className="w-24 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-1 text-sm font-bold text-blue-600"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={record.isGPay}
                    onChange={(e) => updateRecord(idx, 'isGPay', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="date"
                    value={record.date}
                    onChange={(e) => updateRecord(idx, 'date', e.target.value)}
                    className="w-32 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-1 text-sm font-medium"
                  />
                </td>
                <td className="px-4 py-2 text-center flex items-center justify-center gap-2 h-[53px]">
                  {duplicateReason && (
                    <div title={duplicateReason} className="text-yellow-600 bg-yellow-100 p-1.5 rounded">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  )}
                  <button
                    onClick={() => removeRecord(idx)}
                    className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                    title="Remove row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {results.map((record, idx) => {
          const duplicateReason = getDuplicateReason(record, idx);
          return (
            <div key={idx} className={`p-4 border rounded-xl shadow-sm ${duplicateReason ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                 <span className="font-bold text-gray-700 text-sm">Record #{idx+1}</span>
                 <div className="flex items-center gap-2">
                   {duplicateReason && <AlertTriangle className="w-4 h-4 text-yellow-600" title={duplicateReason} />}
                   <button onClick={() => removeRecord(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 className="w-4 h-4"/></button>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="text-xs font-bold text-gray-500 block mb-1">Adm No</label>
                   <input type="text" value={record.admissionNo} onChange={(e) => updateRecord(idx, 'admissionNo', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm font-medium focus:border-blue-500 outline-none"/>
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-500 block mb-1">Class</label>
                   <input type="text" value={record.studentClass} onChange={(e) => updateRecord(idx, 'studentClass', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm font-medium focus:border-blue-500 outline-none"/>
                 </div>
                 <div className="col-span-2">
                   <label className="text-xs font-bold text-gray-500 block mb-1">Name</label>
                   <input type="text" value={record.studentName} onChange={(e) => updateRecord(idx, 'studentName', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm font-bold text-gray-900 focus:border-blue-500 outline-none"/>
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-500 block mb-1">Amount</label>
                   <input type="number" value={record.feeAmount} onChange={(e) => updateRecord(idx, 'feeAmount', Number(e.target.value))} className="w-full border border-gray-200 rounded-lg p-2 text-sm font-bold text-blue-600 focus:border-blue-500 outline-none"/>
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-500 block mb-1">Date</label>
                   <input type="date" value={record.date} onChange={(e) => updateRecord(idx, 'date', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm font-medium focus:border-blue-500 outline-none"/>
                 </div>
                 <div className="col-span-2 flex items-center mt-1 p-2 bg-gray-50 rounded-lg border border-gray-100">
                   <input type="checkbox" checked={record.isGPay} onChange={(e) => updateRecord(idx, 'isGPay', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300"/>
                   <label className="text-sm font-medium text-gray-700 ml-2">Paid via GPay</label>
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
