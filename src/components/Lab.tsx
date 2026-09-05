import React from 'react';
import { ArrowLeft, Crop, Beaker, ChevronRight, MonitorPlay, BookOpen, CalendarDays, ListOrdered, FileCheck, FileText, Receipt, CloudUpload, BarChart2, FileSignature, Presentation, ClipboardList, Moon, Calculator, Zap, GraduationCap } from 'lucide-react';

interface LabProps {
  onNavigate: (view: 'lab-crop' | 'lab-exams' | 'admin-online-exams' | 'lab-course-progress' | 'lab-timetable' | 'lab-atr-list' | 'lab-qp-maker' | 'lab-fee-logger' | 'lab-cloud-sessions' | 'lab-score-analysis' | 'lab-descriptive' | 'lab-aims-present' | 'home' | 'lab-improvement-responses' | 'lab-compensation-responses' | 'teacher-log-form' | 'study-progress-form' | 'sem5-progress-mathematics' | 'sem5-progress-physics') => void;
}

export default function Lab({ onNavigate }: LabProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      <p className="text-gray-600">
        Welcome to AIMS Lab! Explore our suite of educational tools and experimental features.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Sem 5 Mathematics Study Progress */}
        <div 
          onClick={() => onNavigate('sem5-progress-mathematics')}
          className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-cyan-400 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-cyan-100 text-cyan-700 rounded-lg group-hover:bg-cyan-200 transition-colors">
              <Calculator className="w-6 h-6" />
            </div>
            <span className="px-2 py-0.5 bg-cyan-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider">
              SEM 5
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Sem 5 Maths Progress (/form/progress/mathematics/5)</h3>
          <p className="text-sm text-gray-700 flex-1">
            B.Sc. Mathematics Honours Semester 5 official curriculum tracker (Real Analysis II, Abstract Algebra, Complex Analysis, Electives & LaTeX), target date countdown, and concept mastery logs.
          </p>
        </div>

        {/* Sem 5 Physics Study Progress */}
        <div 
          onClick={() => onNavigate('sem5-progress-physics')}
          className="bg-gradient-to-br from-rose-50 to-indigo-50 border-2 border-rose-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-rose-400 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-rose-100 text-rose-700 rounded-lg group-hover:bg-rose-200 transition-colors">
              <Zap className="w-6 h-6" />
            </div>
            <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider">
              SEM 5
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Sem 5 Physics Progress (/form/progress/physics/5)</h3>
          <p className="text-sm text-gray-700 flex-1">
            B.Sc. Physics Honours Semester 5 official curriculum tracker (Quantum Mechanics I, Optics, Electrodynamics II, Materials Science & Python), target completion countdown, and mastery checklists.
          </p>
        </div>

        <div
          onClick={() => onNavigate('home')}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
              <FileCheck className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">OMR Sheet Grading</h3>
          <p className="text-sm text-gray-700 flex-1">
            Upload OMR answer sheets, auto-evaluate responses using AI, and generate ranked results with topic-wise analysis.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('lab-descriptive')}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
              <FileSignature className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Descriptive Evaluation</h3>
          <p className="text-sm text-gray-600 flex-1">
            Upload handwritten descriptive exam sheets. Auto-crop, group by student automatically, and evaluate answers with AI feedback.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('admin-online-exams')}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-400 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <MonitorPlay className="w-6 h-6" />
            </div>
            <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider">
              NEW
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Online Exams (/admin/exams)</h3>
          <p className="text-sm text-gray-700 flex-1">
            Conduct MCQ & Descriptive exams with direct camera photo uploads to Backblaze B2, inline image grading, and Excel/ZIP exports.
          </p>
        </div>

        <div
          onClick={() => onNavigate('lab-aims-present')}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-violet-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-violet-50 text-violet-600 rounded-lg group-hover:bg-violet-100 transition-colors">
              <Presentation className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Aims Presenter</h3>
          <p className="text-sm text-gray-600 flex-1">
            Present and control slides from any device. The control screen drives live view screens in real-time across devices.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('teacher-log-form')}
          className="bg-gradient-to-br from-blue-50 to-emerald-50 border-2 border-blue-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-lg group-hover:bg-blue-200 transition-colors">
              <ClipboardList className="w-6 h-6" />
            </div>
            <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider">
              NEW
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Teacher's Log (/form/teacher)</h3>
          <p className="text-sm text-gray-700 flex-1">
            Official NCERT chapter & subsection checklist for teachers across batches (B1, B2, B3 for Plus Two, A1, A2 for Plus One), real-time cloud sync, and admin progress matrix (/admin/teacher).
          </p>
        </div>

        <div 
          onClick={() => onNavigate('study-progress-form')}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <ClipboardList className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Student Study Progress</h3>
          <p className="text-sm text-gray-600 flex-1">
            Student chapter progress tracker (/form/studyprogress). Supports 1-time sign up, PWA add to home screen, 3-box chapter logs, and Excel exports.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('lab-course-progress')}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Course Progress</h3>
          <p className="text-sm text-gray-600 flex-1">
            Track chapter-wise progress of courses including TCR, Entrance discussion, and Revision. Assign teachers to each completed module.
          </p>
        </div>

        <div
          onClick={() => onNavigate('lab-timetable')}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
              <CalendarDays className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Timetable Manager</h3>
          <p className="text-sm text-gray-600 flex-1">
            Day-wise schedule dashboard, clipboard table paste, AI scanner, and high-resolution poster generator.
          </p>
        </div>

        <div
          onClick={() => onNavigate('lab-atr-list')}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-cyan-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg group-hover:bg-cyan-100 transition-colors">
              <ListOrdered className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">ATR List</h3>
          <p className="text-sm text-gray-600 flex-1">
            Process exam Excel files, match student names, and generate ATR rankings with hat-trick tracking.
          </p>
        </div>

        <div
          onClick={() => onNavigate('lab-score-analysis')}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-lg group-hover:bg-teal-100 transition-colors">
              <BarChart2 className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Score Data Analysis</h3>
          <p className="text-sm text-gray-600 flex-1">
            Import CSV score sheets to view dashboards and generate physical printed records of student scores.
          </p>
        </div>

        <div
          onClick={() => onNavigate('lab-qp-maker')}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-pink-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-pink-50 text-pink-600 rounded-lg group-hover:bg-pink-100 transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-pink-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">QP Maker</h3>
          <p className="text-sm text-gray-600 flex-1">
            Create and manage question papers. Add questions with options, set correct answers, and export as JSON.
          </p>
        </div>

        <div
          onClick={() => onNavigate('lab-fee-logger')}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <Receipt className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Fee Logger</h3>
          <p className="text-sm text-gray-600 flex-1">
            Log and track student fee payments. Manually enter data or scan handwritten ledgers using AI.
          </p>
        </div>

        <div
          onClick={() => onNavigate('lab-cloud-sessions')}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-sky-50 text-sky-600 rounded-lg group-hover:bg-sky-100 transition-colors">
              <CloudUpload className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-sky-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Cloud Data Sessions</h3>
          <p className="text-sm text-gray-600 flex-1">
            Backup and restore your local settings, keys, and configurations to Firebase. Seamlessly sync between devices.
          </p>
        </div>

        <div
          onClick={() => onNavigate('lab-improvement-responses')}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <Moon className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Improvement Study Progress</h3>
          <p className="text-sm text-gray-600 flex-1">
            Manage Plus One SCERT student registrations, subject choices, study progress checkpoints, copy name lists, and export data.
          </p>
        </div>

      </div>
    </div>
  );
}