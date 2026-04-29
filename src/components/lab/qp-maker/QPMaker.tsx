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
  subjectDivisions: [{ id: '1', subject: 'Physics', marks: '15' }],
  batchesAndSets: 'B1: Set A, Set B\nB2: Set A, Set B',
  extraInstructions: 'Make sure to allocate the right questions. Change values for mathematical/physics problems to create Set B variations.',
  templateId: 'default',
  items: [],
  generatedPapers: []
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
  const [generateProgress, setGenerateProgress] = useState({ current: 0, total: 0, target: '' });

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
            const parsed = JSON.parse(saved);
            const items = parsed.items || parsed.uploadedFiles || [];
            const loadedItems = await Promise.all(items.map(async (item: any) => {
              if (item.type === 'text') return item;
              const fileObj = await getImage(item.id);
              if (fileObj) {
                return { ...item, type: 'image', file: fileObj, previewUrl: URL.createObjectURL(fileObj) };
              }
              return { ...item, type: 'image' };
            }));
            
            loadedData[day] = {
              ...defaultDayData,
              ...parsed,
              items: loadedItems
            };
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
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    Object.entries(dataByDay).forEach(([day, data]) => {
      const dataToSave = {
        ...data,
        items: data.items.map(item => ({ 
          id: item.id, 
          type: item.type, 
          description: item.description,
          textContent: item.textContent 
        }))
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

    const items = dataByDay[dayToRemove]?.items || [];
    for (const item of items) {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.type === 'image') await deleteImage(item.id);
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

  const handleGenerate = async (compiledInstructions: string, targets: string[]) => {
    const currentData = dataByDay[currentDay];
    if (!currentData || currentData.items.length === 0) {
      alert("Please add at least one image or text item.");
      return;
    }

    setIsGenerating(true);
    setGenerateProgress({ current: 0, total: targets.length, target: targets[0] || '' });
    
    try {
      const apiKeysStr = localStorage.getItem('omr_apiKeysList');
      const apiKeys = apiKeysStr ? JSON.parse(apiKeysStr) : [];
      const model = localStorage.getItem('omr_proModel') || 'gemini-3.1-pro-preview';
      
      const templateHtml = QP_TEMPLATES.find(t => t.id === currentData.templateId)?.html || QP_TEMPLATES[0].html;

      const { generateSingleQuestionPaper } = await import('../../../services/gemini/qpMakerService');
      
      const results = [];
      for (let i = 0; i < targets.length; i++) {
        setGenerateProgress({ current: i, total: targets.length, target: targets[i] });
        const res = await generateSingleQuestionPaper(currentData.items, compiledInstructions, targets[i], templateHtml, apiKeys, model);
        results.push(res);
      }
      
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
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI QP Maker</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">Automated HTML Question Paper Generation</p>
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
          generateProgress={generateProgress}
          onGenerate={handleGenerate} 
        />
      ) : (
        <QPMakerResults 
          results={currentData.generatedPapers} 
          onReset={() => {
            if(window.confirm("Discard generated papers and edit?")) {
              updateCurrentDayData({ generatedPapers: [] });
            }
          }} 
        />
      )}
    </div>
  );
}