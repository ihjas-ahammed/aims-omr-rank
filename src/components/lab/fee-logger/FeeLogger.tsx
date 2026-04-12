import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, ImageIcon, List, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { FeeLogForm, FeeLogList, ImageScanner, FeeDashboard } from './index';
import { getFeeLogs, saveFeeLogs, isFirebaseConfigured, FeeLogData } from '../../../services/firebaseService';

interface FeeLoggerProps {
  onBack: () => void;
  apiKeys: string[];
  model: string;
  concurrency: number;
  requestsPerKey: number;
}

type FeeLoggerTab = 'dashboard' | 'form' | 'scanner' | 'list';

export default function FeeLogger({ onBack, apiKeys, model, concurrency, requestsPerKey }: FeeLoggerProps) {
  const [activeTab, setActiveTab] = useState<FeeLoggerTab>('dashboard');
  const [logs, setLogs] = useState<FeeLogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        const dbLogs = await getFeeLogs();
        setLogs(dbLogs);
      } else {
        const local = localStorage.getItem('omr_fee_logs');
        if (local) setLogs(JSON.parse(local));
      }
    } catch (e) {
      console.error("Failed to load logs:", e);
      const local = localStorage.getItem('omr_fee_logs');
      if (local) setLogs(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  const saveLogsToDB = async (newLogs: FeeLogData[]) => {
    setLogs(newLogs);
    localStorage.setItem('omr_fee_logs', JSON.stringify(newLogs));
    if (isFirebaseConfigured) {
      try {
        await saveFeeLogs(newLogs);
      } catch (e) {
        console.error("Failed to save to firebase", e);
      }
    }
  };

  const handleAddLogs = async (newEntries: Omit<FeeLogData, 'id' | 'createdAt'>[]) => {
    const created = newEntries.map(entry => ({
      ...entry,
      id: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    }));
    await saveLogsToDB([...created, ...logs]);
    setActiveTab('dashboard');
  };

  const handleDeleteLog = async (id: string) => {
    const newLogs = logs.filter(l => l.id !== id);
    await saveLogsToDB(newLogs);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Fee Logger</h1>
        </div>
      </div>

      <p className="text-gray-600">
        Log and track student fee payments. View 12-month progress, add entries manually, or scan from handwritten ledgers using AI.
      </p>

      {!isFirebaseConfigured && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium"><strong>Firebase Not Configured:</strong> Fee logs are only being saved locally to this browser and will not sync globally across devices.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </span>
        </button>
        <button
          onClick={() => setActiveTab('form')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'form'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Manual Entry
          </span>
        </button>
        <button
          onClick={() => setActiveTab('scanner')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'scanner'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            Scan Images
          </span>
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'list'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="flex items-center gap-2">
            <List className="w-4 h-4" />
            View Logs
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="py-2">
        {activeTab === 'dashboard' && (
          <FeeDashboard logs={logs} loading={loading} />
        )}

        {activeTab === 'form' && (
          <FeeLogForm onAddLogs={handleAddLogs} />
        )}

        {activeTab === 'scanner' && (
          <ImageScanner
            onAddLogs={handleAddLogs}
            existingLogs={logs}
            apiKeys={apiKeys}
            model={model}
            concurrency={concurrency}
            requestsPerKey={requestsPerKey}
          />
        )}

        {activeTab === 'list' && (
          <FeeLogList 
             logs={logs} 
             loading={loading} 
             onDeleteLog={handleDeleteLog} 
          />
        )}
      </div>
    </div>
  );
}
