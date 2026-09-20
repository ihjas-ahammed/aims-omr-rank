import React, { useRef } from 'react';
import MatIcon from './MatIcon';
import { QPMakerDayData } from './types';
import QPMakerImageCard from './QPMakerImageCard';
import QPMakerTextCard from './QPMakerTextCard';

interface Props {
  data: QPMakerDayData;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddText: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateDescription: (id: string, desc: string) => void;
  onUpdateTextContent: (id: string, content: string) => void;
}

export default function QPMakerItems({ data, onFileUpload, onAddText, onRemoveItem, onUpdateDescription, onUpdateTextContent }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(e);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <MatIcon name="folder_open" size={22} className="text-indigo-600" />
            <span>Source Materials</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">Add images or text blocks containing your raw questions.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={onAddText}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold sm:font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm"
          >
            <MatIcon name="post_add" size={18} />
            <span>Add Text</span>
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-bold sm:font-medium hover:bg-indigo-100 transition-colors shadow-sm text-sm"
          >
            <MatIcon name="add_photo_alternate" size={18} />
            <span>Add Images</span>
          </button>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-4">
        {data.items.length === 0 ? (
          <div className="text-center py-10 bg-white border-2 border-dashed border-gray-200 rounded-xl">
            <div className="flex justify-center gap-2 mb-2 text-gray-300">
              <MatIcon name="cloud_upload" size={32} />
            </div>
            <p className="text-sm font-medium text-gray-500">No source materials added yet.</p>
          </div>
        ) : (
          data.items.map((item, i) => (
            item.type === 'image' ? (
              <QPMakerImageCard 
                key={item.id}
                itemData={item}
                index={i}
                onRemove={onRemoveItem}
                onUpdateDescription={onUpdateDescription}
              />
            ) : (
              <QPMakerTextCard 
                key={item.id}
                itemData={item}
                index={i}
                onRemove={onRemoveItem}
                onUpdateDescription={onUpdateDescription}
                onUpdateTextContent={onUpdateTextContent}
              />
            )
          ))
        )}
      </div>
    </div>
  );
}