import React, { useState } from 'react';
import { StudentSummary, EditableTargetFee } from './index';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface StudentProgressCardProps {
  student: StudentSummary;
  onUpdateTarget: (id: string, target: number) => void;
}

export default function StudentProgressCard({ student, onUpdateTarget }: StudentProgressCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Calculate progress percentage (cap at 100% for the bar visual)
  const currentTarget = student.targetFee;
  const rawProgress = currentTarget > 0 ? (student.totalPaid / currentTarget) * 100 : 0;
  const progress = Math.min(100, Math.round(rawProgress));
  
  let colorClass = 'bg-red-500';
  let bgClass = 'bg-red-50 text-red-700 border-red-200';
  
  if (progress >= 100) {
    colorClass = 'bg-green-500';
    bgClass = 'bg-green-50 text-green-700 border-green-200';
  } else if (progress >= 50) {
    colorClass = 'bg-yellow-400';
    bgClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
  }

  // Flatten all payments for the expanded view
  const allPayments = Object.values(student.monthlyPayments)
    .flat()
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0" onClick={() => setExpanded(!expanded)}>
            <h3 className="font-bold text-gray-900 truncate cursor-pointer hover:text-blue-600" title={student.studentName}>
              {student.studentName}
            </h3>
            <div className="text-xs text-gray-500 mt-0.5 truncate cursor-pointer">
              Adm: {student.admissionNo} • Class: {student.studentClass}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0 ${bgClass}`}>
              Paid: ${student.totalPaid}
            </div>
            <EditableTargetFee 
              value={student.targetFee} 
              onSave={(val) => onUpdateTarget(student.id, val)} 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${colorClass} transition-all duration-500`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <span className="text-xs font-bold text-gray-600 w-9 text-right">{Math.round(rawProgress)}%</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Payment History</h4>
          {allPayments.length > 0 ? (
            <div className="space-y-2">
              {allPayments.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-200 text-sm shadow-sm">
                  <div className="font-medium text-gray-700">{p.date}</div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.isGPay ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {p.isGPay ? 'GPay' : 'Cash'}
                    </span>
                    <span className="font-black text-gray-900">${p.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-4 bg-white rounded-lg border border-dashed border-gray-200">
              No payments logged.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
