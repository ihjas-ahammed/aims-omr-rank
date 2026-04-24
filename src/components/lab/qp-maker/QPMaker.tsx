import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import QPMakerForm from './QPMakerForm';
import QPMakerResults from './QPMakerResults';
import QPMakerDaySelector from './QPMakerDaySelector';
import { QPMakerDayData } from './types';
import { format } from 'date-fns';
import { getImage, deleteImage } from '../../../services/db';
import { QP_TEMPLATES } from './constants';

const defaultDayData: QPMakerDayData = {
  date: format(new Date(), 'dd/MM/yyyy'),
  duration: '30',
  totalMarks: '15',
  subjectDivisions:[{ id: '1', subject: 'Physics', marks: '15' }],
  batchesAndSets: 'B1: Set A, Set B\nB2: Set A, Set B',
  extraInstructions: 'Make sure to allocate the right questions. Change values for mathematical/physics problems to create Set B variations.',
  templateId: 'default',
  uploadedFiles:[],
  generatedPapers:[]
};

export default function QPMaker({ onBack }: { onBack: () => void }) {
  const [days, setDays] = useState<number[]>(() => {
    const saved = localStorage.getItem('qp_days');
    return saved ? JSON.parse(saved) : [1];
  });
  const [currentDay, setCurrentDay] = useState<number>(() => {
    const saved = localStorage.getItem('qp_currentDay');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [dataByDay, setDataByDay] = useState<Record<number, QPMakerDayData>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem('qp_days', JSON.stringify(days));
    localStorage.setItem('qp_currentDay', currentDay.toString());
  }, [days, currentDay]);

  useEffect(() => {
    const loadData = async () => {
      const loadedData: Record<number, QPMakerDayData> = {};
      for (const day of days) {
        const saved = localStorage.getItem(`qp_data_${day}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as QPMakerDayData;
            // Load images from DB
            const filesWithPreview = await Promise.all(parsed.uploadedFiles.map(async f => {
              const fileObj = await getImage(f.id);
              if (fileObj) {
                return { ...f, file: fileObj, previewUrl: URL.createObjectURL(fileObj) };
              }
              return f;
            }));
            parsed.uploadedFiles = filesWithPreview;
            loadedData[day] = parsed;
          } catch (e) {
            loadedData[day] = { ...defaultDayData };
          }
        } else {
          loadedData[day] = { ...defaultDayData };
        }
      }
      setDataByDay(loadedData);
      setIsLoaded(true);
    };
    loadData();
  },[]);

  useEffect(() => {
    if (!isLoaded) return;
    // Save current state to local storage without file objects/previewUrls
    Object.entries(dataByDay).forEach(([day, data]) => {
      const dataToSave = {
        ...data,
        uploadedFiles: data.uploadedFiles.map(f => ({ id: f.id, description: f.description }))
      };
      localStorage.setItem(`qp_data_${day}`, JSON.stringify(dataToSave));
    });
  }, [dataByDay, isLoaded]);

  const addDay = () => {
    const newDay = Math.max(...days, 0) + 1;
    setDays([...days, newDay]);
    setDataByDay({ ...dataByDay, [newDay]: { ...defaultDayData } });
    setCurrentDay(newDay);
  };

  const removeDay = async (dayToRemove: number) => {
    if (days.length <= 1) return;
    if (!window.confirm(`Are you sure you want to delete Day ${dayToRemove}?`)) return;

    // cleanup images
    const files = dataByDay[dayToRemove]?.uploadedFiles ||[];
    for (const f of files) {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      await deleteImage(f.id);
    }

    const newDays = days.filter(d => d !== dayToRemove);
    setDays(newDays);
    
    const newData = { ...dataByDay };
    delete newData[dayToRemove];
    setDataByDay(newData);
    
    localStorage.removeItem(`qp_data_${dayToRemove}`);
    
    if (currentDay === dayToRemove) {
      setCurrentDay(newDays[0]);
    }
  };

  const updateCurrentDayData = (newData: Partial<QPMakerDayData>) => {
    setDataByDay(prev => ({
      ...prev,
      [currentDay]: { ...prev[currentDay], ...newData }
    }));
  };

  const handleGenerate = async (compiledInstructions: string) => {
    const currentData = dataByDay[currentDay];
    if (!currentData || currentData.uploadedFiles.length === 0) {
      alert("Please upload at least one image.");
      return;
    }
    const files = currentData.uploadedFiles.map(f => f.file).filter(Boolean) as File[];
    if (files.length === 0) return;

    setIsGenerating(true);
    try {
      const apiKeysStr = localStorage.getItem('omr_apiKeysList');
      const apiKeys = apiKeysStr ? JSON.parse(apiKeysStr) :[];
      const model = localStorage.getItem('omr_proModel') || 'gemini-3.1-pro-preview';
      
      const templateHtml = QP_TEMPLATES.find(t => t.id === currentData.templateId)?.html || QP_TEMPLATES[0].html;

      const { generateQuestionPapers } = await import('../../../services/gemini/qpMakerService');
      const results = await generateQuestionPapers(files, compiledInstructions, templateHtml, apiKeys, model);
      updateCurrentDayData({ generatedPapers: results });
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isLoaded) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  const currentData = dataByDay[currentDay] || defaultDayData;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors border border-gray-200 bg-white shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI QP Maker</h2>
              <p className="text-sm text-gray-500 font-medium">Automated HTML Question Paper Generation</p>
            </div>
          </div>
        </div>
      </div>

      <QPMakerDaySelector 
        days={days}
        currentDay={currentDay}
        onSetCurrentDay={setCurrentDay}
        onAddDay={addDay}
        onRemoveDay={removeDay}
      />

      {currentData.generatedPapers.length === 0 ? (
        <QPMakerForm 
          data={currentData}
          onUpdate={updateCurrentDayData}
          isGenerating={isGenerating} 
          onGenerate={handleGenerate} 
        />
      ) : (
        <QPMakerResults 
          results={currentData.generatedPapers} 
          onReset={() => {
            if(window.confirm("Discard generated papers and edit?")) {
              updateCurrentDayData({ generatedPapers:[] });
            }
          }} 
        />
      )}
    </div>
  );
}