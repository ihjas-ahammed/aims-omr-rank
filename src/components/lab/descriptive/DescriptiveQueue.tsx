import React from 'react';
import { Trash2 } from 'lucide-react';
import { DescriptiveImage } from './types';

interface Props {
  images: DescriptiveImage[];
  onRemove: (id: string) => void;
}

export default function DescriptiveQueue({ images, onRemove }: Props) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
      <div className="p-3 border-b border-gray-200 bg-white font-medium text-gray-700">
        Uploaded Images Queue ({images.length})
      </div>
      {images.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          No images uploaded yet.
        </div>
      ) : (
        <div className="p-4 flex gap-4 overflow-x-auto hide-scrollbar">
          {images.map(img => (
            <div key={img.id} className="relative shrink-0 w-24 h-32 rounded-lg border border-gray-300 overflow-hidden bg-white group">
              <img src={img.previewUrl} alt="scan" className="w-full h-full object-cover" />
              <button 
                onClick={() => onRemove(img.id)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}