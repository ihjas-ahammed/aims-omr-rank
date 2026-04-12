import React, { useState, useMemo, useEffect } from 'react';
import { Search, Calendar } from 'lucide-react';
import { FeeLogData } from '../../../services/firebaseService';
import { StudentSummary, StudentFeeCard, StudentFeeTable, FeeStatsRow, StudentProgressCard, FeeTargetCSVImport } from './index';

interface FeeDashboardProps {
  logs: FeeLogData[];
  loading: boolean;
}

type ViewMode = 'tracker' | 'progress';

export default function FeeDashboard({ logs, loading }: FeeDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('progress');
  
  const [targetFee, setTargetFee] = useState<number>(() => {
    const saved = localStorage.getItem('omr_target_fee');
    return saved ? Number(saved) : 24000;
  });

  // Store individual student target fees (supports overriding globally configured fee)
  const [individualTargets, setIndividualTargets] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('omr_individual_targets');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('omr_target_fee', targetFee.toString());
  }, [targetFee]);

  useEffect(() => {
    localStorage.setItem('omr_individual_targets', JSON.stringify(individualTargets));
  }, [individualTargets]);

  const handleUpdateTarget = (id: string, val: number) => {
    setIndividualTargets(prev => ({ ...prev, [id]: val }));
  };

  const handleImportTargets = (newTargets: Record<string, number>) => {
    setIndividualTargets(prev => ({ ...prev, ...newTargets }));
  };

  const studentSummaries = useMemo(() => {
    const map = new Map<string, StudentSummary>();
    
    logs.forEach(log => {
      let dateObj;
      try {
        dateObj = new Date(log.date + 'T12:00:00');
      } catch {
        return;
      }
      
      const month = dateObj.getMonth(); // 0 to 11
      
      // Combine records with the same admission number (if valid)
      const adm = log.admissionNo ? String(log.admissionNo).trim().toUpperCase() : '';
      const key = (adm && adm !== '-' && adm !== 'UNKNOWN') ? adm : `NAME-${log.studentName.trim().toUpperCase()}`;
      
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          admissionNo: log.admissionNo || '-',
          studentName: log.studentName, // Takes the first encountered name
          studentClass: log.studentClass || '-',
          monthlyPayments: {},
          totalPaid: 0,
          targetFee: 0 // Will be populated after aggregation
        });
      }
      
      const summary = map.get(key)!;
      if (!summary.monthlyPayments[month]) {
        summary.monthlyPayments[month] = [];
      }
      
      summary.monthlyPayments[month].push({
        amount: Number(log.feeAmount),
        isGPay: log.isGPay,
        date: log.date
      });
      
      // Sort payments within the month by date
      summary.monthlyPayments[month].sort((a, b) => a.date.localeCompare(b.date));
      
      summary.totalPaid += Number(log.feeAmount);
    });
    
    return Array.from(map.values()).map(summary => {
      // Priority: admissionNo specific target -> id specific target -> global target
      const tFee = individualTargets[summary.admissionNo] ?? individualTargets[summary.id] ?? targetFee;
      return { ...summary, targetFee: tFee };
    }).sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [logs, individualTargets, targetFee]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return studentSummaries;
    const query = searchQuery.toLowerCase();
    return studentSummaries.filter(s => 
      s.studentName.toLowerCase().includes(query) || 
      s.admissionNo.toLowerCase().includes(query) ||
      s.studentClass.toLowerCase().includes(query)
    );
  }, [studentSummaries, searchQuery]);

  const totalRevenue = studentSummaries.reduce((sum, s) => sum + s.totalPaid, 0);

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
        <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-1">No data available</h3>
        <p className="text-gray-500 text-sm">Add or scan fee logs to see the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <FeeStatsRow 
        studentCount={studentSummaries.length}
        totalRevenue={totalRevenue}
        targetFee={targetFee}
        onTargetFeeChange={setTargetFee}
      />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between sm:justify-start">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setViewMode('progress')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${
                viewMode === 'progress' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Target Progress
            </button>
            <button
              onClick={() => setViewMode('tracker')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${
                viewMode === 'tracker' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              12-Month Tracker
            </button>
          </div>
          <FeeTargetCSVImport onImport={handleImportTargets} />
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, class, adm no..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Main Content */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 font-medium">No students match your search.</p>
        </div>
      ) : viewMode === 'progress' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => (
            <StudentProgressCard 
              key={student.id} 
              student={student} 
              onUpdateTarget={handleUpdateTarget}
            />
          ))}
        </div>
      ) : (
        <>
          {/* Mobile view for 12-month tracker */}
          <div className="block lg:hidden space-y-4">
            {filteredStudents.map(student => (
              <StudentFeeCard key={student.id} student={student} onUpdateTarget={handleUpdateTarget} />
            ))}
          </div>

          {/* Desktop view for 12-month tracker */}
          <div className="hidden lg:block">
            <StudentFeeTable students={filteredStudents} onUpdateTarget={handleUpdateTarget} />
          </div>
        </>
      )}
    </div>
  );
}
