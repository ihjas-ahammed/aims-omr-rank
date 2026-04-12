import React from 'react';
import { Users, DollarSign, Target } from 'lucide-react';

interface FeeStatsRowProps {
  studentCount: number;
  totalRevenue: number;
  targetFee: number;
  onTargetFeeChange: (val: number) => void;
}

export default function FeeStatsRow({
  studentCount,
  totalRevenue,
  targetFee,
  onTargetFeeChange
}: FeeStatsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Students</p>
          <p className="text-2xl font-black text-gray-900">{studentCount}</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-black text-gray-900">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
         <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
          <Target className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Target Fee (Per Student)</p>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
            <input
              type="number"
              min="0"
              value={targetFee}
              onChange={(e) => onTargetFeeChange(Number(e.target.value) || 0)}
              className="w-full pl-7 pr-3 py-1.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 font-bold outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}