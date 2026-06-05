import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Presentation as PresentationIcon, Link2, MonitorPlay, Loader2, FilePlus, Sparkles, X } from 'lucide-react';
import {
  listPresentations,
  createPresentation,
  createPresentationFromData,
  deletePresentation,
  Presentation,
  isFirebaseConfigured,
} from '../../../services/firebaseService';
import { TEMPLATES } from './templates';

interface PresentDashboardProps {
  onBack: () => void;
  onOpenControl: (id: string) => void;
}

export default function PresentDashboard({ onBack, onOpenControl }: PresentDashboardProps) {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const load = () => {
    if (!isFirebaseConfigured) { setLoading(false); return; }
    setLoading(true);
    listPresentations()
      .then(setPresentations)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const createBlank = async () => {
    setShowNew(false);
    setCreating(true);
    try {
      const id = await createPresentation('Untitled Presentation');
      onOpenControl(id);
    } catch (err) {
      console.error(err);
      alert('Failed to create presentation.');
    } finally {
      setCreating(false);
    }
  };

  const createFromTemplate = async (templateId: string) => {
    const tpl = TEMPLATES.find(t => t.id === templateId);
    if (!tpl) return;
    setShowNew(false);
    setCreating(true);
    try {
      const id = await createPresentationFromData(tpl.build());
      onOpenControl(id);
    } catch (err) {
      console.error(err);
      alert('Failed to create presentation.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deletePresentation(id);
      setPresentations(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete.');
    }
  };

  const copyViewLink = (id: string) => {
    const url = `${window.location.origin}/aims-present/view/${id}`;
    navigator.clipboard?.writeText(url);
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-red-500">Firebase is not configured. Aims Presenter requires Firebase.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => setShowNew(true)}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:opacity-60 text-sm font-medium"
        >
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New presentation
        </button>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">New presentation</h3>
              <button onClick={() => setShowNew(false)} className="p-1 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
            </div>

            <button
              onClick={createBlank}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-violet-400 hover:bg-violet-50 text-left transition-colors"
            >
              <div className="p-2 bg-gray-100 text-gray-600 rounded-md"><FilePlus className="w-5 h-5" /></div>
              <div>
                <p className="font-medium text-gray-900">Blank presentation</p>
                <p className="text-xs text-gray-500">Start empty and add your own slides.</p>
              </div>
            </button>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Templates</p>
              <div className="space-y-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => createFromTemplate(t.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-rose-50 hover:border-amber-400 text-left transition-colors"
                  >
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-md"><Sparkles className="w-5 h-5" /></div>
                    <div>
                      <p className="font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="p-3 bg-violet-100 text-violet-600 rounded-lg">
          <PresentationIcon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Aims Presenter</h2>
          <p className="text-sm text-gray-500">Control slides from any device, shown live on view screens.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : presentations.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No presentations yet. Create one to get started.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presentations.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 truncate flex-1">{p.title}</h3>
                <button onClick={() => handleDelete(p.id!, p.title)} className="p-1 text-gray-400 hover:text-red-500 shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400">{p.slides?.length || 0} slide{(p.slides?.length || 0) === 1 ? '' : 's'}</p>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => onOpenControl(p.id!)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium bg-violet-600 text-white rounded-md hover:bg-violet-700"
                >
                  <MonitorPlay className="w-4 h-4" /> Control
                </button>
                <button
                  onClick={() => copyViewLink(p.id!)}
                  title="Copy view link"
                  className="px-3 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  <Link2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
