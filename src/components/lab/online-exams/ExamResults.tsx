import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Search, Download, AlertTriangle } from 'lucide-react';
import { getExamSubmissions, ExamSubmission, getExam, ExamData } from '../../../services/firebaseService';

interface ExamResultsProps {
  examId: string;
  onBack: () => void;
}

export default function ExamResults({ examId, onBack }: ExamResultsProps) {
  const [exam, setExam] = useState<ExamData | null>(null);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [examData, subs] = await Promise.all([
          getExam(examId),
          getExamSubmissions(examId)
        ]);
        setExam(examData);
        setSubmissions(subs);
      } catch (error) {
        alert("Failed to load results.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [examId]);

  const exportCSV = () => {
    if (!exam || submissions.length === 0) return;

    let csv = 'NAME,CLASS,SCORE,RIGHT,WRONG,INCIDENTS,';
    for (let i = 1; i <= exam.totalQuestions; i++) csv += `Q${i},`;
    csv = csv.slice(0, -1) + '\n';

    submissions.forEach(sub => {
      let row = `"${sub.studentName}","${sub.studentClass}",${sub.score},${sub.totalRight},${sub.totalWrong},${sub.incidents.length},`;
      for (let i = 1; i <= exam.totalQuestions; i++) {
        const ans = sub.answers[i] || '';
        const correct = exam.answerKey[i];
        const mark = ans === correct ? 1 : ans ? -1 : 0;
        row += `${mark},`;
      }
      csv += row.slice(0, -1) + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${exam.title.replace(/\s+/g, '_')}_Results.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = submissions.filter(s => 
    s.studentName.toLowerCase().includes(search.toLowerCase()) || 
    s.studentClass.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Exam Results</h2>
            {exam && <p className="text-gray-500 font-medium">{exam.title}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" 
            />
          </div>
          <button
            onClick={exportCSV}
            disabled={submissions.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm shrink-0"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Class</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Incidents</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 font-medium">
                      No submissions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((sub, idx) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-500">#{idx + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{sub.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.studentClass}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 inline-flex text-sm leading-5 font-bold rounded-full bg-indigo-100 text-indigo-800">
                          {sub.score} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="text-green-600 font-medium mr-2">{sub.totalRight} R</span>
                        <span className="text-red-600 font-medium">{sub.totalWrong} W</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {sub.incidents.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-red-600 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" /> {sub.incidents.length} Warnings
                            </span>
                            {sub.incidents.map((inc, i) => (
                              <div key={i} className="text-xs bg-red-50 text-red-800 p-1 rounded mt-1 border border-red-100">
                                "{inc.reason}"
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-green-600 font-medium">Clean</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}