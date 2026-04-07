import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, ClipboardList, ExternalLink, Trophy } from 'lucide-react';
import { isFirebaseConfigured } from '../../../services/firebaseService';

interface ExamDashboardProps {
  onNavigate: (view: any, examId?: string) => void;
  onBack: () => void;
}

interface LocalExamRecord {
  id: string;
  title: string;
  date: string;
}

export default function ExamDashboard({ onNavigate, onBack }: ExamDashboardProps) {
  const [createdExams, setCreatedExams] = useState<LocalExamRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('omr_created_exams');
    if (saved) {
      try {
        setCreatedExams(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  if (!isFirebaseConfigured) {
    return (
      <div className="max-w-3xl mx-auto mt-12 bg-red-50 p-6 rounded-xl border border-red-200 text-center">
        <h2 className="text-xl font-bold text-red-700 mb-2">Firebase Not Configured</h2>
        <p className="text-red-600 mb-4">
          Online Exams require a Firebase backend to store questions and student submissions.
        </p>
        <p className="text-sm text-red-500 mb-4">
          Please check the <code className="bg-red-100 px-1 rounded">firebase-setup.md</code> file for instructions on how to set up your `.env.local` variables.
        </p>
        <button onClick={onBack} className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Online Exams Dashboard</h2>
        </div>
        <button
          onClick={() => onNavigate('exam-setup')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Exam
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-800">Your Created Exams</h3>
        </div>
        
        {createdExams.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            You haven't created any online exams yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {createdExams.map(exam => (
              <div key={exam.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{exam.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">Created on {new Date(exam.date).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/?examId=${exam.id}`;
                      navigator.clipboard.writeText(link);
                      alert('Exam link copied to clipboard!');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Copy Link
                  </button>
                  <button
                    onClick={() => onNavigate('exam-results', exam.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    <Trophy className="w-4 h-4" /> View Results
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}