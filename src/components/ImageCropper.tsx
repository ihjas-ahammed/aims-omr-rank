import React, { useState } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { RotateCcw, RotateCw, Check, X } from 'lucide-react';
import { getCroppedImg } from '../utils/cropUtils';

interface ImageCropperProps {
  imageUrl: string;
  onSave: (file: File) => void;
  onCancel: () => void;
}

export default function ImageCropper({ imageUrl, onSave, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [pixelCrop, setPixelCrop] = useState<PixelCrop | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  
  const rotateImage = (degrees: number) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Swap dimensions for 90 or 270 degree rotations
      if (degrees === 90 || degrees === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }
      
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      
      canvas.toBlob((blob) => {
        if (blob) {
          setCurrentImageUrl(URL.createObjectURL(blob));
          setCrop(undefined); // Reset crop box for newly rotated image
          setPixelCrop(null);
        }
      }, 'image/jpeg', 0.9);
    };
    img.src = currentImageUrl;
  };

  const handleSave = async () => {
    try {
      const file = await getCroppedImg(currentImageUrl, pixelCrop);
      onSave(file);
    } catch (e) {
      console.error('Failed to crop/save image', e);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col w-full h-full bg-white z-20">
      <div className="flex justify-between items-center p-3 border-b bg-gray-50 shrink-0">
        <div className="flex gap-2">
          <button 
            onClick={() => rotateImage(270)} 
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Left
          </button>
          <button 
            onClick={() => rotateImage(90)} 
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <RotateCw className="w-4 h-4" /> Right
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onCancel} 
            className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-medium rounded text-sm transition-colors"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 font-medium rounded text-sm transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" /> Apply Changes
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-900 flex items-center justify-center p-4 min-h-0">
        <p className="absolute top-16 left-4 text-xs text-white/50 bg-black/40 px-2 py-1 rounded">Draw to crop. Leave unselected to just rotate.</p>
        <ReactCrop 
          crop={crop} 
          onChange={c => setCrop(c)} 
          onComplete={c => setPixelCrop(c)} 
          className="max-h-full max-w-full flex items-center justify-center"
        >
          <img src={currentImageUrl} alt="Editor Canvas" style={{ maxHeight: '70vh', maxWidth: '100%', objectFit: 'contain' }} />
        </ReactCrop>
      </div>
    </div>
  );
}