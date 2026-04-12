import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface EditableTargetFeeProps {
  value: number;
  onSave: (val: number) => void;
}

export default function EditableTargetFee({ value, onSave }: EditableTargetFeeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    const num = Number(tempVal);
    if (!isNaN(num) && num >= 0) {
      onSave(num);
    } else {
      setTempVal(value.toString());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempVal(value.toString());
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 bg-white border border-blue-300 rounded px-1.5 py-0.5 shadow-sm">
        <span className="text-gray-500 text-xs font-bold">$</span>
        <input
          ref={inputRef}
          type="number"
          min="0"
          value={tempVal}
          onChange={(e) => setTempVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          style={{ appearance: 'textfield', WebkitAppearance: 'none' }}
          className="w-14 text-xs font-bold outline-none bg-transparent text-gray-900"
        />
        <button onClick={handleSave} className="text-green-600 hover:bg-green-50 rounded p-0.5 transition-colors">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={handleCancel} className="text-red-500 hover:bg-red-50 rounded p-0.5 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-1 cursor-pointer group text-xs text-gray-500 hover:text-blue-600 transition-colors"
      title="Click to edit maximum fee"
    >
      <span className="font-bold border-b border-dashed border-gray-400 group-hover:border-blue-400 transition-colors">
        Target: ${value}
      </span>
      <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
