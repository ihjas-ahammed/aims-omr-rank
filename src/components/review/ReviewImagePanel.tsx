import React, { useState } from 'react';
import { Crop, Layers, Image as ImageIcon } from 'lucide-react';
import ImageCropper from '../ImageCropper';

interface Props {
  fileId: string;
  previewUrl?: string;
  splitPreviews?: string[];
  isEditingImage: boolean;
  setIsEditingImage: (v: boolean) => void;
  onUpdateImage?: (id: string, file: File) => void;
}

export default function ReviewImagePanel({
  fileId,
  previewUrl,
  splitPreviews,
  isEditingImage,
  setIsEditingImage,
  onUpdateImage
}: Props) {
  const [viewMode, setViewMode] = useState<'original' | 'splits'>('original');

  const hasSplits = splitPreviews && splitPreviews.length > 0;

  return (
    <div className="md:w-5/12 bg-gray-100 p-0 md:p-4 flex flex-col overflow-hidden border-r border-gray-200 relative min-h-0">
      {isEditingImage && previewUrl ? (
        <ImageCropper
          imageUrl={previewUrl}
          onSave={async (file) => {
            if (onUpdateImage) await onUpdateImage(fileId, file);
            setIsEditingImage(false);
          }}
          onCancel={() => setIsEditingImage(false)}
        />
      ) : (
        <div className="flex flex-col h-full w-full">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-2 bg-white/80 backdrop-blur border-b border-gray-200 z-10 shrink-0">
            <div className="flex bg-gray-200 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('original')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'original' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Original</span>
                <span className="sm:hidden">Orig</span>
              </button>
              {hasSplits && (
                <button
                  onClick={() => setViewMode('splits')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'splits' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Splits ({splitPreviews.length})</span>
                  <span className="sm:hidden">Splits</span>
                </button>
              )}
            </div>
            <button
              onClick={() => setIsEditingImage(true)}
              className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors flex items-center gap-1"
              title="Crop / Edit Image"
            >
              <Crop className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Crop</span>
            </button>
          </div>

          {/* Image Container */}
          <div className={`w-full h-full flex items-center overflow-auto p-4 flex-col gap-4 relative min-h-[40vh] md:min-h-0 ${viewMode === 'splits' ? 'justify-start' : 'justify-center'}`}>
            {viewMode === 'splits' && hasSplits ? (
              splitPreviews.map((url, i) => (
                <div key={i} className="relative group shrink-0">
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">Part {i + 1}</div>
                  <img
                    src={url}
                    alt={`OMR Sheet Piece ${i}`}
                    className="max-w-full object-contain shadow-sm rounded border border-gray-300 bg-white"
                  />
                </div>
              ))
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="OMR Sheet"
                className="max-w-full max-h-full object-contain shadow-sm rounded border border-gray-300 shrink-0"
              />
            ) : (
              <div className="text-gray-500 font-medium">No image preview available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}