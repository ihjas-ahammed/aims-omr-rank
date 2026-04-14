import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, Send, FileWarning, Eye } from 'lucide-react';
import { getExam, submitExamResult, ExamData, ExamIncident } from '../../../services/firebaseService';

interface ExamTakeProps {
  examId: string;
  onFinish: () => void;
}

export default function ExamTake({ examId, onFinish }: ExamTakeProps) {
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [step, setStep] = useState<'details' | 'taking' | 'submitted'>('details');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [incidents, setIncidents] = useState<ExamIncident[]>([]);
  
  const [cheatPromptVisible, setCheatPromptVisible] = useState(false);
  const [cheatReason, setCheatReason] = useState('');
  const lastHiddenTime = useRef<string>('');

  useEffect(() => {
    async function fetchExam() {
      try {
        const data = await getExam(examId);
        setExam(data);
      } catch (err: any) {
        setError("Could not load the exam. Please check the link.");
      } finally {
        setLoading(false);
      }
    }
    fetchExam();
  }, [examId]);

  // Anti-Cheat Mechanism
  useEffect(() => {
    if (step !== 'taking') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastHiddenTime.current = new Date().toISOString();
      } else {
        setCheatPromptVisible(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [step]);

  const handleCheatSubmit = () => {
    if (!cheatReason.trim()) {
      alert("Please provide a reason.");
      return;
    }
    setIncidents(prev => [...prev, { time: lastHiddenTime.current, reason: cheatReason }]);
    setCheatPromptVisible(false);
    setCheatReason('');
  };

  const handleOptionSelect = (qNum: number, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [qNum]: prev[qNum] === option ? '' : option // toggle off if clicked again
    }));
  };

  const submitExam = async () => {
    if (!exam) return;
    
    if (!window.confirm("Are you sure you want to submit your exam? You cannot undo this.")) {
      return;
    }
    
    setLoading(true);
    
    let right = 0;
    let wrong = 0;
    
    for (let i = 1; i <= exam.totalQuestions; i++) {
      const studentAns = answers[i];
      const correctAns = exam.answerKey[i];
      
      if (studentAns) {
        if (studentAns === correctAns) right++;
        else wrong++;
      }
    }
    
    const score = (right * 4) - wrong; // Standard scoring
    
    try {
      await submitExamResult(examId, {
        studentName,
        studentClass,
        answers,
        score,
        totalRight: right,
        totalWrong: wrong,
        incidents
      });
      setStep('submitted');
    } catch (err) {
      alert("Failed to submit exam. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === 'details') {
    return <div className="flex h-screen items-center justify-center text-indigo-600">Loading Exam...</div>;
  }

  if (error || !exam) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center p-6">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
        <button onClick={onFinish} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded font-medium">Return Home</button>
      </div>
    );
  }

  if (step === 'details') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-indigo-600 p-8 text-center text-white">
            <h1 className="text-3xl font-black mb-2">{exam.title}</h1>
            <p className="text-indigo-200 font-medium">{exam.className}</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-md flex gap-3">
              <FileWarning className="w-6 h-6 text-orange-600 shrink-0" />
              <div className="text-sm text-orange-800">
                <strong>Warning:</strong> Once you start the exam, do not switch tabs or close the window. The system monitors activity and will log tab switches as potential violations.
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={studentName} 
                  onChange={e => setStudentName(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-medium" 
                  placeholder="Enter your real name"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Class / Batch</label>
                <input 
                  type="text" 
                  value={studentClass} 
                  onChange={e => setStudentClass(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-medium" 
                  placeholder="e.g. 12A"
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!studentName.trim() || !studentClass.trim()) {
                  alert("Please enter your name and class.");
                  return;
                }
                setStep('taking');
              }}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-md flex justify-center items-center gap-2"
            >
              Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'submitted') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Submitted!</h2>
          <p className="text-gray-600 mb-8">Your exam has been successfully recorded. You may now close this window.</p>
          <button onClick={onFinish} className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
            Exit
          </button>
        </div>
      </div>
    );
  }

  const optionsCount = exam.numOptions || 4;
  const options = Array.from({ length: optionsCount }, (_, i) => String.fromCharCode(65 + i));

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 overflow-hidden">
      {/* Cheat Prompt Modal */}
      {cheatPromptVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white p-6 rounded-xl max-w-lg w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <Eye className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Activity Logged</h2>
            </div>
            <p className="text-gray-700 mb-4 font-medium">
              You left the exam screen. This incident has been logged. Please explain why you switched tabs or minimized the window:
            </p>
            <textarea
              value={cheatReason}
              onChange={e => setCheatReason(e.target.value)}
              className="w-full px-4 py-3 border border-red-300 rounded-lg focus:ring-red-500 focus:border-red-500 mb-4 font-medium"
              rows={3}
              placeholder="Provide a valid reason..."
            />
            <button
              onClick={handleCheatSubmit}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
            >
              Resume Exam
            </button>
          </div>
        </div>
      )}

      {/* Left Side - Question Paper */}
      <div className="md:w-1/2 h-[50vh] md:h-full bg-gray-900 overflow-y-auto p-4 flex flex-col items-center gap-4 custom-scrollbar">
        {exam.images.map((img, i) => (
          <img key={i} src={img} alt={`Question Paper Page ${i+1}`} className="w-full max-w-2xl rounded shadow-lg bg-white" />
        ))}
      </div>

      {/* Right Side - OMR Bubbles */}
      <div className="md:w-1/2 h-[50vh] md:h-full bg-white flex flex-col border-l border-gray-200">
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-md z-10 shrink-0">
          <div>
            <h2 className="font-bold text-lg truncate max-w-[200px] md:max-w-xs">{exam.title}</h2>
            <p className="text-indigo-200 text-xs font-medium">{studentName} • {studentClass}</p>
          </div>
          <button
            onClick={submitExam}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white font-bold rounded shadow-sm disabled:opacity-50 transition-colors"
          >
            {loading ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit</>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 custom-scrollbar">
          <div className="max-w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-3">
            {Array.from({ length: exam.totalQuestions }, (_, i) => i + 1).map(qNum => (
              <div key={qNum} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200 shadow-sm overflow-x-auto hide-scrollbar">
                <span className="w-6 font-bold text-gray-700 text-right shrink-0">{qNum}.</span>
                <div className="flex gap-1.5 shrink-0">
                  {options.map(opt => {
                    const isSelected = answers[qNum] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleOptionSelect(qNum, opt)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                          isSelected 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-500 hover:border-indigo-400 hover:bg-indigo-50'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="pb-12 pt-8 text-center text-sm text-gray-400">End of Questions</div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}