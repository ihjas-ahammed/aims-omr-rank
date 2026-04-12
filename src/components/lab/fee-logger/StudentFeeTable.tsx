import React from 'react';
import { StudentSummary, EditableTargetFee } from './index';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface StudentFeeTableProps {
  students: StudentSummary[];
  onUpdateTarget: (id: string, target: number) => void;
}

export default function StudentFeeTable({ students, onUpdateTarget }: StudentFeeTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 shadow-[1px_0_0_0_#e5e7eb]">Student Details</th>
            {MONTHS.map(m => (
              <th key={m} className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center min-w-[70px]">{m}</th>
            ))}
            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Target Fee</th>
            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total Paid</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {students.map(student => (
            <tr key={student.id} className="hover:bg-blue-50/30 transition-colors group">
              <td className="p-4 sticky left-0 bg-white group-hover:bg-blue-50/30 z-10 shadow-[1px_0_0_0_#f3f4f6]">
                <div className="font-bold text-sm text-gray-900">{student.studentName}</div>
                <div className="text-xs text-gray-500 font-medium mt-0.5">Adm: {student.admissionNo} • Class: {student.studentClass}</div>
              </td>
              
              {MONTHS.map((m, i) => {
                const payments = student.monthlyPayments[i] || [];
                const hasPayments = payments.length > 0;
                
                return (
                  <td key={i} className="p-2 text-center align-top">
                    <div className="flex flex-col items-center gap-1 mt-1">
                      {hasPayments ? (
                        payments.map((p, idx) => (
                          <div
                            key={idx}
                            className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-bold border shadow-sm ${
                              p.isGPay 
                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                : 'bg-green-50 text-green-700 border-green-200'
                            }`}
                            title={`Paid $${p.amount.toFixed(2)} on ${p.date} (${p.isGPay ? 'GPay' : 'Cash'})`}
                          >
                            ${p.amount.toFixed(0)}
                          </div>
                        ))
                      ) : (
                        <div className="inline-block w-2 h-2 bg-gray-200 rounded-full mx-auto mt-1" title={`Unpaid in ${m}`} />
                      )}
                    </div>
                  </td>
                );
              })}
              
              <td className="p-4 text-sm text-right align-middle">
                <div className="flex justify-end">
                  <EditableTargetFee 
                    value={student.targetFee} 
                    onSave={(val) => onUpdateTarget(student.id, val)} 
                  />
                </div>
              </td>

              <td className="p-4 text-sm font-black text-blue-600 text-right align-middle">
                ${student.totalPaid.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
