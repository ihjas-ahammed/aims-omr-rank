import React, { useState, useEffect } from 'react';
import { ArrowLeft, Cloud, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import { getCloudSnapshots, saveCloudSnapshot, deleteCloudSnapshot, CloudSnapshot, isFirebaseConfigured } from '../../../services/firebaseService';
import SnapshotCard from './SnapshotCard';
import CreateSnapshotModal from './CreateSnapshotModal';

interface Props {
  onBack: () => void;
}

export default function CloudSessions({ onBack }: Props) {
  const [snapshots, setSnapshots] = useState<CloudSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = async () => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getCloudSnapshots();
      setSnapshots(data);
    } catch (e) {
      console.error('Failed to load snapshots:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (name: string) => {
    // Collect localStorage
    const dump: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) dump[key] = localStorage.getItem(key) || '';
    }

    const snapshotData = {
      localStorage: dump,
      cookies: document.cookie
    };

    await saveCloudSnapshot(name, JSON.stringify(snapshotData));
    await loadSnapshots();
    setIsCreateModalOpen(false);
  };

  const handleRestore = (snapshot: CloudSnapshot) => {
    if (!window.confirm(`Are you sure you want to restore "${snapshot.name}"? This will overwrite your current settings and reload the page.`)) {
      return;
    }

    try {
      const parsed = JSON.parse(snapshot.data);
      
      // Restore localStorage
      if (parsed.localStorage) {
        localStorage.clear();
        for (const [k, v] of Object.entries(parsed.localStorage)) {
          localStorage.setItem(k, v as string);
        }
      }

      // Restore cookies
      if (parsed.cookies) {
        const cookiePairs = parsed.cookies.split(';');
        cookiePairs.forEach((c: string) => {
          if (c.trim()) document.cookie = c.trim() + "; path=/";
        });
      }

      alert("Snapshot restored successfully! The page will now reload.");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Failed to restore snapshot data.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this snapshot permanently?")) return;
    try {
      await deleteCloudSnapshot(id);
      setSnapshots(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete snapshot.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Cloud className="w-6 h-6 text-sky-600" />
            <h1 className="text-2xl font-bold text-gray-900">Cloud Data Sessions</h1>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!isFirebaseConfigured}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">New Snapshot</span>
        </button>
      </div>

      <p className="text-gray-600 text-sm sm:text-base">
        Backup your current browser data (localStorage & cookies) to the cloud. You can restore these settings on any device to easily sync your AI configurations, fee targets, and temporary session data.
      </p>

      {!isFirebaseConfigured && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium"><strong>Firebase Not Configured:</strong> Cloud Data Sessions require a Firebase backend to store snapshots.</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {snapshots.length === 0 ? (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-500">
              No snapshots found in the cloud.
            </div>
          ) : (
            snapshots.map(snap => (
              <SnapshotCard 
                key={snap.id} 
                snapshot={snap} 
                onRestore={() => handleRestore(snap)}
                onDelete={() => handleDelete(snap.id)} 
              />
            ))
          )}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateSnapshotModal 
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}