import React from 'react';
import { ArrowLeft, Crop, Beaker, ChevronRight, MonitorPlay, BookOpen, CalendarDays, ListOrdered } from 'lucide-react';

interface LabProps {
  onNavigate: (view: 'lab-crop' | 'lab-exams' | 'lab-course-progress' | 'lab-timetable' | 'lab-atr-list') => void;
  onBack: () => void;
}

export default function Lab({ onNavigate, onBack }: LabProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <Beaker className="w-6 h-6 text-purple-600" />
          <h2>Lab (Experimental Features)</h2>
        </div>
      </div>
      
      <p className="text-gray-600">
        Welcome to the Lab! Here you can test out new experimental features.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigate('lab-crop')}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
              <Crop className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Auto-Crop & Rotate OMR</h3>
          <p className="text-sm text-gray-600">
            Use Gemini Lite to automatically detect the OMR sheet boundaries, crop out the background, and rotate the image upright.
          </p>
        </div>

        <div 
          onClick={() => onNavigate('lab-exams')}
          className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <MonitorPlay className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">Online Exams</h3>
          <p className="text-sm text-gray-600">
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

      </div>
    </div>
  );
}