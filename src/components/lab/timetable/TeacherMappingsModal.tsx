import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sliders, Check, RotateCcw } from 'lucide-react';
import { saveTeacherMappingsData, DEFAULT_TEACHER_MAPPINGS } from '../../../services/firebaseService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mappings: Record<string, string>;
  onSave: (newMappings: Record<string, string>) => void;
}

const STANDARD_SUBJECTS = [
  'PHYSICS',
  'CHEMISTRY',
  'MATHS',
  'BOTANY',
  'ZOOLOGY',
  'COMPUTER SCIENCE',
  'ENGLISH'
];

export const TeacherMappingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  mappings,
  onSave
}) => {
  const [editingMappings, setEditingMappings] = useState<Record<string, string>>({ ...mappings });
  const [newCode, setNewCode] = useState('');
  const [newSubject, setNewSubject] = useState('PHYSICS');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEditingMappings({ ...mappings });
    }
  }, [isOpen, mappings]);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newCode.trim()) return;
    const code = newCode.trim().toUpperCase();
    setEditingMappings(prev => ({
      ...prev,
      [code]: newSubject
    }));
    setNewCode('');
  };

  const handleRemove = (code: string) => {
    setEditingMappings(prev => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset teacher mappings to standard course progress defaults?')) {
      setEditingMappings({ ...DEFAULT_TEACHER_MAPPINGS });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveTeacherMappingsData(editingMappings);
      onSave(editingMappings);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-[#062e5b] font-black text-base">
            <Sliders className="w-5 h-5 text-indigo-600" />
            Teacher to Subject Mappings
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs text-slate-500">
            Configure teacher code to subject mapping. When scanning images or raw schedule text, teacher codes will automatically resolve to these subjects. Synced globally via Firebase.
          </p>

          {/* Add Row */}
          <div className="p-3 bg-slate-50 border border-slate-200 flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Code (e.g. ARJ)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              className="px-3 py-1.5 text-xs font-bold uppercase bg-white border border-slate-300 w-28 text-slate-900 focus:border-[#062e5b] focus:outline-none"
            />
            <select
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 flex-1 text-slate-900 focus:border-[#062e5b] focus:outline-none"
            >
              {STANDARD_SUBJECTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={!newCode.trim()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 disabled:opacity-50 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {/* Existing Mappings List */}
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {Object.entries(editingMappings).map(([code, subj]) => (
              <div
                key={code}
                className="flex items-center justify-between p-2 bg-white border border-slate-200 hover:border-slate-300"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-[#062e5b] text-white font-bold text-xs tracking-wider">
                    {code}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {subj}
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(code)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  title="Remove mapping"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <button
            onClick={handleResetDefaults}
            className="text-xs text-slate-500 hover:text-slate-700 font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset Defaults
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-xs font-bold bg-[#062e5b] hover:bg-[#0d427d] text-white flex items-center gap-1.5 shadow-sm"
            >
              {saving ? 'Saving...' : <><Check className="w-3.5 h-3.5" /> Save Mappings</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
