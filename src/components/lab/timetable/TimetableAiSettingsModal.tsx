import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Key, Cpu, RefreshCw, Check, CheckCircle2, 
  AlertCircle, Eye, EyeOff, ShieldCheck, Zap, RotateCcw
} from 'lucide-react';
import { 
  getTimetableAiConfig, 
  saveTimetableAiConfig, 
  fetchTimetableGeminiModels, 
  testGeminiApiKeyAndModel,
  PRESET_TIMETABLE_MODELS,
  DEFAULT_TIMETABLE_PRIMARY_MODEL,
  TimetableAiConfig
} from '../../../services/timetableAiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (config: TimetableAiConfig) => void;
}

export const TimetableAiSettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(DEFAULT_TIMETABLE_PRIMARY_MODEL);
  const [useCustomAsPrimary, setUseCustomAsPrimary] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  // Dynamic model fetch
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  // Connectivity Test State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getTimetableAiConfig();
      setApiKey(config.customApiKey);
      setModel(config.customModel || DEFAULT_TIMETABLE_PRIMARY_MODEL);
      setUseCustomAsPrimary(config.useCustomAsPrimary);
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFetchModels = async () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter a Gemini API key first to fetch your available models.'
      });
      return;
    }

    setIsFetchingModels(true);
    setTestResult(null);
    try {
      const models = await fetchTimetableGeminiModels(apiKey.trim());
      setFetchedModels(models);
      if (models.length > 0 && !models.includes(model)) {
        setModel(models[0]);
      }
      setTestResult({
        success: true,
        message: `Successfully fetched ${models.length} Gemini models from your account!`
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to fetch models.'
      });
    } finally {
      setIsFetchingModels(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter an API key to test connection.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testGeminiApiKeyAndModel(apiKey.trim(), model);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const updatedConfig: TimetableAiConfig = {
      customApiKey: apiKey.trim(),
      customModel: model.trim() || DEFAULT_TIMETABLE_PRIMARY_MODEL,
      useCustomAsPrimary
    };

    saveTimetableAiConfig(updatedConfig);
    setSavedSuccess(true);
    if (onSaved) onSaved(updatedConfig);

    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleResetToDefaults = () => {
    setApiKey('');
    setModel(DEFAULT_TIMETABLE_PRIMARY_MODEL);
    setUseCustomAsPrimary(true);
    saveTimetableAiConfig({
      customApiKey: '',
      customModel: DEFAULT_TIMETABLE_PRIMARY_MODEL,
      useCustomAsPrimary: true
    });
    setTestResult({
      success: true,
      message: 'Reset to default system API key and Gemini 2.5 Flash model.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] text-slate-900">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-[#062e5b] font-black text-base">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Timetable AI Model & API Key Settings</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Status banner */}
          <div className="p-3 bg-blue-50/70 border border-blue-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-blue-900">
              <span className="font-bold">Custom AI Priority Configuration</span>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Provide your custom Google Gemini API Key and select your preferred model. When marked as Primary, timetable scanning will execute on your custom setup before falling back to system backups.
              </p>
            </div>
          </div>

          {/* Test & Alert Result */}
          {testResult && (
            <div
              className={`p-3 border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-red-50 border-red-300 text-red-700'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span className="font-semibold">{testResult.message}</span>
            </div>
          )}

          {/* Section 1: API Key */}
          <div className="space-y-2 bg-slate-50 p-3.5 border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-black text-[#062e5b] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                Custom Gemini API Key
              </label>
              {apiKey.trim() ? (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Custom Key Set
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600">
                  Using System Default Key
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... (Leave empty to use system default)"
                className="w-full pl-3 pr-20 py-2 bg-white border border-slate-300 font-mono text-xs text-slate-900 focus:border-[#062e5b] focus:outline-none"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                  title={showApiKey ? 'Hide Key' : 'Show Key'}
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => setApiKey('')}
                    className="text-[10px] text-slate-400 hover:text-red-600 px-1"
                    title="Clear Key"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Get an API key from Google AI Studio (aistudio.google.com). Keys are stored securely in your browser local storage.
            </p>
          </div>

          {/* Section 2: Model Selection */}
          <div className="space-y-2.5 bg-slate-50 p-3.5 border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-black text-[#062e5b] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                Gemini Model Selection
              </label>

              <button
                type="button"
                onClick={handleFetchModels}
                disabled={isFetchingModels || !apiKey.trim()}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 flex items-center gap-1"
                title="Fetch live models available to this API key"
              >
                <RefreshCw className={`w-3 h-3 ${isFetchingModels ? 'animate-spin' : ''}`} />
                Fetch Live Models
              </button>
            </div>

            {/* Quick Model Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Recommended Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {PRESET_TIMETABLE_MODELS.map(m => {
                  const isSelected = model === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setModel(m.id)}
                      className={`p-2 text-left border transition-all ${
                        isSelected
                          ? 'border-[#062e5b] bg-[#062e5b]/10 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-black ${isSelected ? 'text-[#062e5b]' : 'text-slate-800'}`}>
                          {m.name}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#062e5b]" />}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{m.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Model Dropdown if fetched */}
            {fetchedModels.length > 0 && (
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-semibold text-slate-600">
                  Fetched Models ({fetchedModels.length}):
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 font-mono text-xs text-slate-800 focus:border-[#062e5b] focus:outline-none"
                >
                  {fetchedModels.map(mName => (
                    <option key={mName} value={mName}>
                      {mName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Manual Custom Model Input */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-semibold text-slate-600">
                Selected Model ID / Custom Model String:
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value.trim())}
                placeholder="e.g. gemini-2.5-flash, gemini-3.1-flash-preview"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 font-mono text-xs text-slate-900 font-bold focus:border-[#062e5b] focus:outline-none"
              />
            </div>
          </div>

          {/* Section 3: Use As Primary Toggle */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 space-y-1.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomAsPrimary}
                onChange={(e) => setUseCustomAsPrimary(e.target.checked)}
                className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <div className="space-y-0.5">
                <span className="font-black text-amber-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  Use Custom API Key & Model as Primary
                </span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  When enabled, timetable scanning will ALWAYS use your custom API key and chosen model (<strong>{model || DEFAULT_TIMETABLE_PRIMARY_MODEL}</strong>) as the primary engine. System keys will only be utilized as a safety fallback.
                </p>
              </div>
            </label>
          </div>

          {/* Test Connection Button */}
          <div className="flex justify-between items-center pt-1">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Defaults
            </button>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey.trim()}
              className="px-3 py-1.5 text-xs font-bold border border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-40 flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : 'text-blue-600'}`} />
              {isTesting ? 'Testing Connection...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-bold bg-[#062e5b] hover:bg-[#0d427d] text-white flex items-center gap-1.5 shadow-sm"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save AI Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
