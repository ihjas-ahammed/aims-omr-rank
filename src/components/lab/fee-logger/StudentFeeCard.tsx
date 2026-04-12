import React from 'react';
import { StudentSummary, EditableTargetFee } from './index';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface StudentFeeCardProps {
  student: StudentSummary;
  onUpdateTarget: (id: string, target: number) => void;
}

export default function StudentFeeCard({ student, onUpdateTarget }: StudentFeeCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="pr-2 min-w-0">
          <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 truncate" title={student.studentName}>{student.studentName}</h3>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-500">
            <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Adm: {student.admissionNo}</span>
            <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Class: {student.studentClass}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-black border border-blue-200 shrink-0">
            ${student.totalPaid.toFixed(2)}
          </div>
          <EditableTargetFee 
            value={student.targetFee} 
            onSave={(val) => onUpdateTarget(student.id, val)} 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
        {MONTHS.map((month, index) => {
          const payments = student.monthlyPayments[index] || [];
          const hasPayments = payments.length > 0;
          
          return (
            <div 
              key={month} 
              className={`flex flex-col items-center py-1.5 rounded-md border transition-colors ${
                hasPayments ? 'bg-white border-gray-300 shadow-sm' : 'bg-gray-50 border-gray-100'
              }`}
            >
              <span className={`text-[10px] font-bold ${hasPayments ? 'text-gray-800' : 'text-gray-400'}`}>
                {month}
              </span>
              <div className="flex flex-col items-center justify-center gap-0.5 mt-1 min-h-[12px]">
                {hasPayments ? (
                  payments.map((p, idx) => (
                    <span 
                      key={idx} 
                      className={`text-[9px] font-bold px-1 rounded ${
                        p.isGPay ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-green-50 text-green-700 border border-green-100'
                      }`}
                      title={`$${p.amount.toFixed(2)} on ${p.date}`}
                    >
                      ${p.amount}
                    </span>
                  ))
                ) : (
                  <div className={`w-1.5 h-1.5 rounded-full bg-gray-200 mt-0.5`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
