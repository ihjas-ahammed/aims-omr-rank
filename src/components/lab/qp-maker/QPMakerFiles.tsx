import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { QPMakerDayData } from './types';
import QPMakerImageCard from './QPMakerImageCard';

interface Props {
  data: QPMakerDayData;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (id: string) => void;
  onUpdateDescription: (id: string, desc: string) => void;
}

export default function QPMakerFiles({ data, onFileUpload, onRemoveFile, onUpdateDescription }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileUpload(e);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="p-4 md:p-6 border-b border-gray-200 bg-gray-50/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" /> Uploaded Questions & Mapping
          </h3>
          <p className="text-xs text-gray-500 mt-1">Upload files and write specific instructions next to each.</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold sm:font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm w-full sm:w-auto"
        >
          <Upload className="w-4 h-4" /> Add Files
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

      <div className="space-y-4">
        {data.uploadedFiles.length === 0 ? (
          <div className="text-center py-10 bg-white border-2 border-dashed border-gray-200 rounded-xl">
            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">No images uploaded yet.</p>
          </div>
        ) : (
          data.uploadedFiles.map((f, i) => (
            <QPMakerImageCard 
              key={f.id}
              fileData={f}
              index={i}
              onRemove={onRemoveFile}
              onUpdateDescription={onUpdateDescription}
            />
          ))
        )}
      </div>
    </div>
  );
}