import React from 'react';
import { ArrowLeft, Crop, Beaker, ChevronRight } from 'lucide-react';

interface LabProps {
  onNavigate: (view: 'lab-crop') => void;
  onBack: () => void;
}

export default function Lab({ onNavigate, onBack }: LabProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
        Welcome to the Lab! Here you can test out new experimental features powered by Gemini Lite models before they are integrated into the main workflow.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
    </div>
  );
}
