import React from 'react';
import { QPMakerDayData } from './types';
import { saveImage, deleteImage } from '../../../services/db';

import QPMakerTemplateSelector from './QPMakerTemplateSelector';
import QPMakerExamParams from './QPMakerExamParams';
import QPMakerBatches from './QPMakerBatches';
import QPMakerItems from './QPMakerItems';
import QPMakerInstructions from './QPMakerInstructions';

interface QPMakerFormProps {
  data: QPMakerDayData;
  onUpdate: (data: Partial<QPMakerDayData>) => void;
  isGenerating: boolean;
  generateProgress: { current: number, total: number, target: string };
  onGenerate: (compiledInstructions: string, targets: string[]) => void;
}

export default function QPMakerForm({ data, onUpdate, isGenerating, generateProgress, onGenerate }: QPMakerFormProps) {
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newItems = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        type: 'image' as const,
        file,
        description: '',
        previewUrl: URL.createObjectURL(file)
      }));
      for(const item of newItems) {
        await saveImage(item.id, item.file!);
      }
      onUpdate({ items: [...data.items, ...newItems] });
    }
  };

  const handleAddText = () => {
    const newItem = {
      id: Math.random().toString(36).substring(7),
      type: 'text' as const,
      textContent: '',
      description: ''
    };
    onUpdate({ items: [...data.items, newItem] });
  };

  const removeItem = async (id: string) => {
    const toRemove = data.items.find(f => f.id === id);
    if (toRemove?.type === 'image') {
      if (toRemove.previewUrl) URL.revokeObjectURL(toRemove.previewUrl);
      await deleteImage(id);
    }
    onUpdate({ items: data.items.filter(f => f.id !== id) });
  };

  const updateItemDescription = (id: string, description: string) => {
    onUpdate({
      items: data.items.map(f => f.id === id ? { ...f, description } : f)
    });
  };

  const updateItemTextContent = (id: string, textContent: string) => {
    onUpdate({
      items: data.items.map(f => f.id === id ? { ...f, textContent } : f)
    });
  };

  const parseTargets = (text: string) => {
    const lines = text.split('\n');
    const targets: string[] = [];
    lines.forEach(line => {
      const parts = line.split(':');
      if (parts.length === 2) {
        const batch = parts[0].trim();
        const sets = parts[1].split(',').map(s => s.trim());
        sets.forEach(s => {
          if (s) targets.push(`${batch} - ${s}`);
        });
      } else {
        if (line.trim()) targets.push(line.trim());
      }
    });
    return targets;
  };

  const handleSubmit = () => {
    if (data.items.length === 0) {
      alert('Please add at least one image or text item containing the questions.');
      return;
    }
    
    const targets = parseTargets(data.batchesAndSets);
    if (targets.length === 0) {
      alert('Please define at least one batch/set target.');
      return;
    }

    const subjectsStr = data.subjectDivisions.map(d => `${d.subject}: ${d.marks}`).join(', ');

    const compiledInstructions = `
EXAM DATE: ${data.date}
DURATION: ${data.duration} minutes
MAXIMUM MARKS: ${data.totalMarks}
SUBJECTS & MARKS DIVISION: ${subjectsStr}

PROVIDED SOURCE MATERIAL & INSTRUCTIONS:
${data.items.map((item, i) => {
  if (item.type === 'image') return `Source ${i + 1} (Image): ${item.description}`;
  return `Source ${i + 1} (Text):\nContent: ${item.textContent}\nInstruction: ${item.description}`;
}).join('\n\n')}

ADDITIONAL INSTRUCTIONS:
${data.extraInstructions}
    `.trim();

    onGenerate(compiledInstructions, targets);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <QPMakerTemplateSelector 
        selectedId={data.templateId || 'default'} 
        onSelect={(id) => onUpdate({ templateId: id })} 
      />
      <QPMakerExamParams data={data} onUpdate={onUpdate} />
      <QPMakerBatches data={data} onUpdate={onUpdate} />
      <QPMakerItems 
        data={data} 
        onFileUpload={handleFileUpload} 
        onAddText={handleAddText}
        onRemoveItem={removeItem} 
        onUpdateDescription={updateItemDescription}
        onUpdateTextContent={updateItemTextContent}
      />
      <QPMakerInstructions 
        data={data} 
        onUpdate={onUpdate} 
        isGenerating={isGenerating} 
        generateProgress={generateProgress}
        onGenerate={handleSubmit} 
      />
    </div>
  );
}