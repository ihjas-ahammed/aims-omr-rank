import React, { useRef } from 'react';
import { Loader2, Upload } from 'lucide-react';

interface ExtractButtonProps {
  isExtracting: boolean;
  onFileSelect: (file: File) => void;
  label: string;
  icon?: React.ReactNode;
}

export default function ExtractButton({ isExtracting, onFileSelect, label, icon }: ExtractButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <input 
        type="file" 
        accept="image/*,application/pdf" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isExtracting}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {isExtracting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          icon || <Upload className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">{isExtracting ? 'Extracting...' : label}</span>
        <span className="sm:hidden">{isExtracting ? 'Wait...' : label}</span>
      </button>
    </>
  );
}