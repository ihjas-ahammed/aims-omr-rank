import React, { useState } from 'react';
import { Trash2, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { QPItem } from './types';
import { fileToBase64 } from '../../../utils/imageProcessing';
import { generateImageDescription } from '../../../services/gemini/qpMakerService';

interface QPMakerImageCardProps {
  itemData: QPItem;
  index: number;
  onRemove: (id: string) => void;
  onUpdateDescription: (id: string, description: string) => void;
}

export default function QPMakerImageCard({ itemData, index, onRemove, onUpdateDescription }: QPMakerImageCardProps) {
  const [isDescribing, setIsDescribing] = useState(false);

  const handleAutoDescribe = async () => {
    if (!itemData.file) {
      alert("Image file not available for auto-describe.");
      return;
    }
    setIsDescribing(true);
    try {
      const apiKeysStr = localStorage.getItem('omr_apiKeysList');
      const apiKeys = apiKeysStr ? JSON.parse(apiKeysStr) : [];
      const liteModel = localStorage.getItem('omr_liteModel') || 'gemini-3.1-flash-lite-preview';

      const base64 = await fileToBase64(itemData.file);
      const description = await generateImageDescription(base64, itemData.file.type, apiKeys, liteModel);
      
      onUpdateDescription(itemData.id, description);
    } catch (error: any) {
      alert(`Failed to auto-describe: ${error.message}`);
    } finally {
      setIsDescribing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="relative w-full md:w-32 h-48 md:h-32 shrink-0 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden group flex items-center justify-center">
        {itemData.previewUrl ? (
          <img src={itemData.previewUrl} alt={`Source ${index + 1}`} className="w-full h-full object-contain bg-white" />
        ) : (
          <ImageIcon className="w-8 h-8 text-gray-300" />
        )}
        <div className="absolute top-0 left-0 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-10">
          Src {index + 1}
        </div>
        <button 
          onClick={() => onRemove(itemData.id)}
          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
          title="Remove Image"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-gray-600 uppercase tracking-wider">
            <ImageIcon className="w-3.5 h-3.5" /> Description / Mapping
          </label>
          <button
            onClick={handleAutoDescribe}
            disabled={isDescribing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50 border border-indigo-100 shadow-sm"
          >
            {isDescribing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Auto-Describe
          </button>
        </div>
        <textarea
          value={itemData.description}
          onChange={(e) => onUpdateDescription(itemData.id, e.target.value)}
          placeholder="e.g. Physics (for all class, set A, set B). Change values for Set B."
          className="w-full flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm resize-none outline-none min-h-[100px]"
        />
      </div>
    </div>
  );
}