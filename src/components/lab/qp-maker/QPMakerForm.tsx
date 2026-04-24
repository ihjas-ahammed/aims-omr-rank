import React from 'react';
import { QPMakerDayData } from './types';
import { saveImage, deleteImage } from '../../../services/db';

import QPMakerTemplateSelector from './QPMakerTemplateSelector';
import QPMakerExamParams from './QPMakerExamParams';
import QPMakerBatches from './QPMakerBatches';
import QPMakerFiles from './QPMakerFiles';
import QPMakerInstructions from './QPMakerInstructions';

interface QPMakerFormProps {
  data: QPMakerDayData;
  onUpdate: (data: Partial<QPMakerDayData>) => void;
  isGenerating: boolean;
  onGenerate: (compiledInstructions: string) => void;
}

export default function QPMakerForm({ data, onUpdate, isGenerating, onGenerate }: QPMakerFormProps) {
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        description: '',
        previewUrl: URL.createObjectURL(file)
      }));
      // Save to IndexedDB
      for(const f of newFiles) {
        await saveImage(f.id, f.file);
      }
      onUpdate({ uploadedFiles:[...data.uploadedFiles, ...newFiles] });
    }
  };

  const removeFile = async (id: string) => {
    const toRemove = data.uploadedFiles.find(f => f.id === id);
    if (toRemove && toRemove.previewUrl) {
      URL.revokeObjectURL(toRemove.previewUrl);
    }
    await deleteImage(id);
    onUpdate({ uploadedFiles: data.uploadedFiles.filter(f => f.id !== id) });
  };

  const updateFileDescription = (id: string, description: string) => {
    onUpdate({
      uploadedFiles: data.uploadedFiles.map(f => f.id === id ? { ...f, description } : f)
    });
  };

  const handleSubmit = () => {
    if (data.uploadedFiles.length === 0) {
      alert('Please upload at least one image containing the questions.');
      return;
    }
    
    const subjectsStr = data.subjectDivisions.map(d => `${d.subject}: ${d.marks}`).join(', ');

    const compiledInstructions = `
EXAM DATE: ${data.date}
DURATION: ${data.duration} minutes
MAXIMUM MARKS: ${data.totalMarks}
SUBJECTS & MARKS DIVISION: ${subjectsStr}

REQUIRED OUTPUT FILES (Batches & Sets):
${data.batchesAndSets}

UPLOADED FILES & THEIR MAPPING DESCRIPTIONS:
${data.uploadedFiles.map((f, i) => `File ${i + 1} (${f.file?.name || 'Image'}): ${f.description}`).join('\n\n')}

ADDITIONAL INSTRUCTIONS:
${data.extraInstructions}
    `.trim();

    onGenerate(compiledInstructions);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <QPMakerTemplateSelector 
        selectedId={data.templateId || 'default'} 
        onSelect={(id) => onUpdate({ templateId: id })} 
      />
      <QPMakerExamParams data={data} onUpdate={onUpdate} />
      <QPMakerBatches data={data} onUpdate={onUpdate} />
      <QPMakerFiles 
        data={data} 
        onFileUpload={handleFileUpload} 
        onRemoveFile={removeFile} 
        onUpdateDescription={updateFileDescription} 
      />
      <QPMakerInstructions 
        data={data} 
        onUpdate={onUpdate} 
        isGenerating={isGenerating} 
        onGenerate={handleSubmit} 
      />
    </div>
  );
}