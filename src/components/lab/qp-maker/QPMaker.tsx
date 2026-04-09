import React, { useState } from 'react';
import { ArrowLeft, FileText, Plus, X, Save, Download, Upload, Eye, Edit3, Trash2 } from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
  marks: number;
}

interface QPMakerProps {
  onBack: () => void;
}

export default function QPMaker({ onBack }: QPMakerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    questionText: '',
    marks: 5
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [examTitle, setExamTitle] = useState('');
  const [duration, setDuration] = useState('60');
  const [totalMarks, setTotalMarks] = useState('100');
  const [instructions, setInstructions] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleAddQuestion = () => {
    if (!currentQuestion.questionText?.trim()) {
      alert('Please enter a question');
      return;
    }

    const newQuestion: Question = {
      id: Math.random().toString(36).substring(7),
      questionText: currentQuestion.questionText,
      marks: currentQuestion.marks || 5
    };

    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = newQuestion;
      setQuestions(updated);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, newQuestion]);
    }

    resetForm();
  };

  const resetForm = () => {
    setCurrentQuestion({
      questionText: '',
      marks: 5
    });
    setIsEditing(false);
  };

  const handleEditQuestion = (index: number) => {
    setCurrentQuestion(questions[index]);
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleDeleteQuestion = (index: number) => {
    if (window.confirm('Delete this question?')) {
      setQuestions(questions.filter((_, i) => i !== index));
      if (editingIndex === index) {
        resetForm();
      }
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const exportQP = (format: 'html' | 'json' | 'md') => {
    let content = '';
    let mimeType = '';
    let extension = '';

    if (format === 'json') {
      const qpData = {
        title: examTitle || 'Question Paper',
        duration,
        totalMarks,
        instructions,
        questions
      };
      content = JSON.stringify(qpData, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    } else if (format === 'html') {
      content = generateHTML();
      mimeType = 'text/html';
      extension = 'html';
    } else if (format === 'md') {
      content = generateMarkdown();
      mimeType = 'text/markdown';
      extension = 'md';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${examTitle || 'question-paper'}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateHTML = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${examTitle || 'Question Paper'}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 24px; }
    .logo { margin-bottom: 15px; }
    .meta { display: flex; justify-content: space-between; margin-top: 15px; font-weight: bold; }
    .instructions { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .questions { list-style: none; padding: 0; }
    .question { margin-bottom: 25px; page-break-inside: avoid; }
    .question-header { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px; }
    .question-text { white-space: pre-wrap; }
    .marks { color: #666; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <img src="logo1.png" alt="AIMS Plus Lab" class="logo" style="max-height: 60px;" />
    <h1>${examTitle || 'Question Paper'}</h1>
    <div class="meta">
      <span>Duration: ${duration} minutes</span>
      <span>Maximum Marks: ${totalMarks}</span>
    </div>
  </div>
  ${instructions ? `<div class="instructions"><strong>Instructions:</strong><br>${instructions.replace(/\n/g, '<br>')}</div>` : ''}
  <ol class="questions">
    ${questions.map((q, i) => `
    <li class="question">
      <div class="question-header">
        <span>Question ${i + 1}</span>
        <span class="marks">[${q.marks} marks]</span>
      </div>
      <div class="question-text">${q.questionText}</div>
    </li>`).join('')}
  </ol>
</body>
</html>`;
  };

  const generateMarkdown = () => {
    let md = `# ${examTitle || 'Question Paper'}\n\n`;
    md += `**Duration:** ${duration} minutes  \n`;
    md += `**Maximum Marks:** ${totalMarks}\n\n`;

    if (instructions) {
      md += `## Instructions\n\n${instructions}\n\n`;
    }

    md += `## Questions\n\n`;
    questions.forEach((q, i) => {
      md += `### Q${i + 1} [${q.marks} marks]\n\n`;
      md += `${q.questionText}\n\n`;
    });
    return md;
  };

  const importQP = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.title) setExamTitle(data.title);
        if (data.duration) setDuration(data.duration);
        if (data.totalMarks) setTotalMarks(data.totalMarks);
        if (data.instructions) setInstructions(data.instructions);
        if (data.questions) setQuestions(data.questions);
      } catch (err) {
        alert('Invalid question paper file');
      }
    };
    reader.readAsText(file);
  };

  const totalQuestionsMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  const handlePrint = () => {
    const printContent = document.getElementById('qp-preview-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${examTitle || 'Question Paper'}</title>
            <style>
              body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
              .logo { max-height: 60px; margin-bottom: 15px; }
              .header h1 { margin: 0; font-size: 24px; }
              .meta { display: flex; justify-content: center; gap: 40px; margin-top: 15px; font-weight: bold; }
              .instructions { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
              .questions { list-style: none; padding: 0; }
              .question { margin-bottom: 25px; page-break-inside: avoid; }
              .question-header { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 8px; }
              .question-text { white-space: pre-wrap; }
              .marks { color: #666; }
              @media print { body { margin: 20px; } }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="${window.location.origin}/logo1.png" alt="AIMS Plus Lab" class="logo" />
              <h1>${examTitle || 'Question Paper'}</h1>
              <div class="meta">
                <span>Duration: ${duration} minutes</span>
                <span>Maximum Marks: ${totalMarks}</span>
              </div>
            </div>
            ${instructions ? `<div class="instructions"><strong>Instructions:</strong><br>${instructions.replace(/\n/g, '<br>')}</div>` : ''}
            <ol class="questions">
              ${questions.map((q, i) => `
                <li class="question">
                  <div class="question-header">
                    <span>Question ${i + 1}</span>
                    <span class="marks">[${q.marks} marks]</span>
                  </div>
                  <div class="question-text">${q.questionText}</div>
                </li>`).join('')}
            </ol>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo1.png" alt="AIMS Plus Lab" className="h-10 w-auto object-contain" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">QP Maker</h2>
              <p className="text-sm text-gray-500">Create descriptive question papers</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            showPreview ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {showPreview ? (
        /* Preview Mode */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Question Paper Preview</h3>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                onClick={() => exportQP('html')}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Export HTML
              </button>
              <button
                onClick={() => exportQP('md')}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Export MD
              </button>
              <button
                onClick={() => exportQP('json')}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
            </div>
          </div>
          <div className="p-8" id="qp-preview-content">
            <div className="max-w-3xl mx-auto">
              <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                <img src="/logo1.png" alt="AIMS Plus Lab" className="h-16 mx-auto mb-3 object-contain" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{examTitle || 'Question Paper'}</h1>
                <div className="flex justify-between text-sm font-bold mt-3 max-w-md mx-auto">
                  <span>Duration: {duration} minutes</span>
                  <span>Maximum Marks: {totalMarks}</span>
                </div>
              </div>

              {instructions && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="font-bold text-gray-800 mb-2">Instructions:</p>
                  <div className="text-gray-600 whitespace-pre-wrap">{instructions}</div>
                </div>
              )}

              <ol className="space-y-6">
                {questions.map((q, i) => (
                  <li key={q.id} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-bold text-gray-800">Question {i + 1}</span>
                      <span className="text-sm text-gray-500 font-medium">[{q.marks} marks]</span>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{q.questionText}</div>
                  </li>
                ))}
              </ol>

              {questions.length === 0 && (
                <p className="text-center text-gray-500 py-8">No questions added yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <>
          {/* Exam Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Save className="w-4 h-4" />
              Exam Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Exam Title</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g., Physics - Chapter 1 Test"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Total Marks</label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Instructions (optional)</label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., All questions are compulsory. Show all steps in calculations..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
              />
            </div>
          </div>

          {/* Add/Edit Question Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              {isEditing ? <><Edit3 className="w-4 h-4" /> Edit Question</> : <><Plus className="w-4 h-4" /> Add Question</>}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Question (supports Markdown)</label>
                <textarea
                  value={currentQuestion.questionText}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                  placeholder="Enter your descriptive question here...

You can use:
- **bold** for emphasis
- *italics* for terms
- Equations like E = mc²
- Lists and more..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Marks</label>
                <input
                  type="number"
                  value={currentQuestion.marks}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddQuestion}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors text-sm"
                >
                  {isEditing ? 'Update Question' : 'Add Question'}
                </button>
                {isEditing && (
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Questions List */}
          {questions.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-700">
                  Questions ({questions.length}) — Total: {totalQuestionsMarks} marks
                  {totalMarks && totalQuestionsMarks !== parseInt(totalMarks) && (
                    <span className={`ml-2 text-xs ${totalQuestionsMarks > parseInt(totalMarks) ? 'text-red-600' : 'text-amber-600'}`}>
                      (Expected: {totalMarks})
                    </span>
                  )}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => document.getElementById('qp-import')?.click()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <Upload className="w-4 h-4" />
                    Import
                  </button>
                  <input
                    id="qp-import"
                    type="file"
                    accept=".json"
                    onChange={importQP}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {questions.map((q, index) => (
                  <div key={q.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Q{index + 1}</span>
                          <span className="text-xs font-medium text-green-600">{q.marks} marks</span>
                        </div>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap font-serif">{q.questionText}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleEditQuestion(index)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(index)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {questions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No questions added yet. Start building your question paper!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
