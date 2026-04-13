import React from 'react';
import { ArrowLeft, Crop, Beaker, ChevronRight, MonitorPlay, BookOpen, CalendarDays, ListOrdered, FileCheck, FileText, Receipt, CloudUpload, BarChart2, FileSignature } from 'lucide-react';

interface LabProps {
  onNavigate: (view: 'lab-crop' | 'lab-exams' | 'lab-course-progress' | 'lab-timetable' | 'lab-atr-list' | 'lab-qp-maker' | 'lab-fee-logger' | 'lab-cloud-sessions' | 'lab-score-analysis' | 'lab-descriptive' | 'home') => void;
}

export default function Lab({ onNavigate }: LabProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      <p className="text-gray-600">
        Welcome to AIMS Plus Lab! Explore our suite of educational tools and experimental features.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          onClick={() => onNavigate('lab-exams')}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <MonitorPlay className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Online Exams</h3>
          <p className="text-sm text-gray-600 flex-1">
            Setup online exams using images of a question paper. Generate a link, collect student responses with anti-cheat monitoring, and view results.
          </p>
        </div>

        <div 
          onClick={() => {
            window.history.pushState({}, '', '/course-progress');
            onNavigate('lab-course-progress');
          }}
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
          onClick={() => {
            window.history.pushState({}, '', '/timetable');
            onNavigate('lab-timetable');
          }}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
              <CalendarDays className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Timetable</h3>
          <p className="text-sm text-gray-600 flex-1">
            Manage daily timetables, assign teachers to specific batches and time slots seamlessly.
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

      </div>
    </div>
  );
}