import React, { useState } from 'react';
import { X, CloudUpload, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export default function CreateSnapshotModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onCreate(name.trim());
    } catch (error) {
      console.error(error);
      alert('Failed to save snapshot.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 text-gray-800">
            <CloudUpload className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-bold">Create Snapshot</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Snapshot Name</label>
          <input
            type="text"
            autoFocus
            required
            placeholder="e.g., Device A Backup - Term 1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all font-medium text-gray-900"
          />
          
          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CloudUpload className="w-5 h-5" />}
              Save Backup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}