import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, ScanLine, Loader2, AlertCircle, Check, CheckCircle2, 
  UserCheck, Calendar, Clock, Camera, Sparkles, Layers, RefreshCw,
  Key, Cpu, Settings, ChevronDown, ChevronUp, Eye, EyeOff, ShieldCheck, Zap
} from 'lucide-react';
import { 
  scanTimetableImageFromClient, 
  ScanTimetableResult, 
  ScannedClass,
  getTimetableAiConfig,
  saveTimetableAiConfig,
  PRESET_TIMETABLE_MODELS,
  DEFAULT_TIMETABLE_PRIMARY_MODEL,
  TimetableAiConfig,
  testGeminiApiKeyAndModel
} from '../../../services/timetableAiService';
import { saveTeacherMappingsData } from '../../../services/firebaseService';
import { TimetableAiSettingsModal } from './TimetableAiSettingsModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  teacherMappings: Record<string, string>;
  onImport: (scannedData: { date: string; isoDate: string; dayName: string; time: string; classes: ScannedClass[] }) => void;
  onUpdateMappings: (updated: Record<string, string>) => void;
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

const APT_CHIPS = ['Zoology', 'Botany', 'CS', 'Physics', 'Chemistry', 'Maths'];

export const ScanTimetableModal: React.FC<Props> = ({
  isOpen,
  onClose,
  teacherMappings,
  onImport,
  onUpdateMappings
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanTimetableResult | null>(null);
  const [unmappedSelections, setUnmappedSelections] = useState<Record<string, string>>({});
  const [saveMappingsChecked, setSaveMappingsChecked] = useState(true);
  
  // AI Config States
  const [aiConfig, setAiConfig] = useState<TimetableAiConfig>(getTimetableAiConfig());
  const [showAiSettingsInline, setShowAiSettingsInline] = useState(false);
  const [showFullAiModal, setShowFullAiModal] = useState(false);
  const [showApiKeyText, setShowApiKeyText] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testingAi, setTestingAi] = useState(false);

  // Classwise APT Exam States
  const [classAptExams, setClassAptExams] = useState<Record<string, string>>({});
  const [bulkAptInput, setBulkAptInput] = useState('');
  
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = getTimetableAiConfig();
      setAiConfig(cfg);
      setAiTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setScanning(true);
    setScanResult(null);

    try {
      const res = await scanTimetableImageFromClient(selectedFile, {
        customApiKey: aiConfig.customApiKey,
        customModel: aiConfig.customModel,
        useCustomAsPrimary: aiConfig.useCustomAsPrimary
      });
      setScanResult(res);

      // Pre-populate unmapped selections with fallback
      const initialSelections: Record<string, string> = {};
      res.unmapped_teachers.forEach(code => {
        initialSelections[code] = 'PHYSICS';
      });
      setUnmappedSelections(initialSelections);

      // Pre-populate classwise APT exams
      const initialClassApts: Record<string, string> = {};
      (res.classes || []).forEach(c => {
        initialClassApts[c.class_name] = c.apt_exam || '';
      });
      setClassAptExams(initialClassApts);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to scan image with AI.');
    } finally {
      setScanning(false);
    }
  };

  const handleUpdateInlineAiConfig = (updates: Partial<TimetableAiConfig>) => {
    const updated = { ...aiConfig, ...updates };
    setAiConfig(updated);
    saveTimetableAiConfig(updated);
  };

  const handleTestInlineKey = async () => {
    if (!aiConfig.customApiKey.trim()) {
      setAiTestResult({ success: false, message: 'Please enter an API key first to test.' });
      return;
    }
    setTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await testGeminiApiKeyAndModel(aiConfig.customApiKey, aiConfig.customModel);
      setAiTestResult(res);
    } catch (err: any) {
      setAiTestResult({ success: false, message: err?.message || 'Test failed.' });
    } finally {
      setTestingAi(false);
    }
  };


  // Toggle APT subject chip for a specific class
  const handleToggleClassApt = (className: string, subj: string) => {
    const current = classAptExams[className] || '';
    const list = current.split(',').map(s => s.trim()).filter(Boolean);
    let updated: string[];
    if (list.includes(subj)) {
      updated = list.filter(s => s !== subj);
    } else {
      updated = [...list, subj];
    }
    setClassAptExams(prev => ({
      ...prev,
      [className]: updated.join(', ')
    }));
  };

  const handleSetClassApt = (className: string, val: string) => {
    setClassAptExams(prev => ({
      ...prev,
      [className]: val
    }));
  };

  // Bulk Apply APT to all classes
  const handleApplyBulkAptToAll = (aptVal: string) => {
    if (!scanResult) return;
    const updated: Record<string, string> = {};
    scanResult.classes.forEach(c => {
      updated[c.class_name] = aptVal;
    });
    setClassAptExams(updated);
    setBulkAptInput(aptVal);
  };

  const handleToggleBulkChip = (subj: string) => {
    const list = bulkAptInput.split(',').map(s => s.trim()).filter(Boolean);
    let updatedList: string[];
    if (list.includes(subj)) {
      updatedList = list.filter(s => s !== subj);
    } else {
      updatedList = [...list, subj];
    }
    const finalStr = updatedList.join(', ');
    handleApplyBulkAptToAll(finalStr);
  };

  const handleConfirmImport = async () => {
    if (!scanResult) return;

    // 1. Update mappings if new ones were provided
    const newMappings = { ...teacherMappings, ...unmappedSelections };
    if (saveMappingsChecked && Object.keys(unmappedSelections).length > 0) {
      await saveTeacherMappingsData(newMappings);
      onUpdateMappings(newMappings);
    }

    // 2. Re-resolve pending subjects in scanned classes and assign classwise APT exams
    const resolvedClasses: ScannedClass[] = (scanResult.classes || []).map(c => {
      const updatedSubjects = (c.subjects || []).map(s => {
        let name = s.name;
        if (name === 'PENDING' && s.teacher_code && newMappings[s.teacher_code]) {
          name = newMappings[s.teacher_code];
        }
        return {
          ...s,
          name
        };
      });

      const chosenApt = classAptExams[c.class_name] !== undefined 
        ? classAptExams[c.class_name] 
        : (c.apt_exam || '');

      return {
        ...c,
        apt_exam: chosenApt,
        subjects: updatedSubjects
      };
    });

    onImport({
      date: scanResult.date,
      isoDate: scanResult.isoDate,
      dayName: scanResult.dayName,
      time: scanResult.time,
      classes: resolvedClasses
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-[#062e5b] font-black text-base">
            <ScanLine className="w-5 h-5 text-[#78b82a]" />
            Scan Timetable Schedule with AI
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          {/* AI Configuration Bar & Quick Settings Toggle */}
          <div className="border border-slate-200 bg-slate-50 p-3 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center flex-wrap gap-1.5">
                <span className="text-xs font-black text-[#062e5b] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>AI Engine:</span>
                </span>
                
                {/* Active Model Pill */}
                <span className="px-2 py-0.5 bg-[#062e5b] text-white font-mono font-bold text-[10px]">
                  {aiConfig.customModel || DEFAULT_TIMETABLE_PRIMARY_MODEL}
                </span>

                {/* Key Status Pill */}
                {aiConfig.customApiKey.trim() ? (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] flex items-center gap-1">
                    <Key className="w-3 h-3" />
                    {aiConfig.useCustomAsPrimary ? 'Custom Key (Primary)' : 'Custom Key'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-semibold text-[10px]">
                    System Key
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowAiSettingsInline(!showAiSettingsInline)}
                  className="px-2.5 py-1 text-[11px] font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center gap-1 shadow-2xs"
                >
                  <Settings className="w-3 h-3 text-[#062e5b]" />
                  {showAiSettingsInline ? 'Hide AI Config' : 'Configure Key & Model'}
                  {showAiSettingsInline ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Inline Expandable AI Settings Panel */}
            {showAiSettingsInline && (
              <div className="pt-2 border-t border-slate-200 space-y-3 bg-white p-3 border">
                {/* Test Feedback if any */}
                {aiTestResult && (
                  <div
                    className={`p-2 border text-[11px] flex items-center gap-1.5 ${
                      aiTestResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}
                  >
                    {aiTestResult.success ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                    <span className="font-semibold">{aiTestResult.message}</span>
                  </div>
                )}

                {/* Custom API Key Input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-amber-600" />
                      Custom Gemini API Key:
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (Leave blank to use system key)
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showApiKeyText ? 'text' : 'password'}
                      value={aiConfig.customApiKey}
                      onChange={(e) => handleUpdateInlineAiConfig({ customApiKey: e.target.value })}
                      placeholder="AIzaSy... (Paste custom Gemini API key)"
                      className="w-full pl-2.5 pr-20 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#062e5b] focus:outline-none"
                    />
                    <div className="absolute right-1.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowApiKeyText(!showApiKeyText)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title={showApiKeyText ? 'Hide' : 'Show'}
                      >
                        {showApiKeyText ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                      {aiConfig.customApiKey && (
                        <button
                          type="button"
                          onClick={() => handleUpdateInlineAiConfig({ customApiKey: '' })}
                          className="text-[10px] text-slate-400 hover:text-red-600 px-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Model Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-indigo-600" />
                    Select Gemini Model:
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_TIMETABLE_MODELS.map(m => {
                      const isSel = aiConfig.customModel === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleUpdateInlineAiConfig({ customModel: m.id })}
                          className={`px-2 py-1 text-[10px] font-bold transition-colors ${
                            isSel
                              ? 'bg-[#062e5b] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={aiConfig.customModel}
                    onChange={(e) => handleUpdateInlineAiConfig({ customModel: e.target.value.trim() })}
                    placeholder="Or type custom model name (e.g. gemini-2.5-flash)"
                    className="w-full px-2.5 py-1 text-xs font-mono bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:border-[#062e5b] focus:outline-none"
                  />
                </div>

                {/* Use Custom as Primary Checkbox */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-900">
                    <input
                      type="checkbox"
                      checked={aiConfig.useCustomAsPrimary}
                      onChange={(e) => handleUpdateInlineAiConfig({ useCustomAsPrimary: e.target.checked })}
                      className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600" />
                      Use this custom API Key & Model as Primary
                    </span>
                  </label>
                  <p className="text-[10px] text-slate-500 ml-5">
                    When active, timetable generation will prioritize your custom key and selected model.
                  </p>
                </div>

                {/* Bottom actions inside inline drawer */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFullAiModal(true)}
                    className="text-[11px] font-semibold text-[#062e5b] hover:underline flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3" /> Full AI Settings & Live Model Fetcher
                  </button>

                  <button
                    type="button"
                    onClick={handleTestInlineKey}
                    disabled={testingAi || !aiConfig.customApiKey.trim()}
                    className="px-2.5 py-1 text-[11px] font-bold border border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-40 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${testingAi ? 'animate-spin' : 'text-blue-600'}`} />
                    {testingAi ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Drop Zone & Camera Buttons */}
          <div className="space-y-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                scanning ? 'border-indigo-400 bg-indigo-50/50' : 'border-[#062e5b]/40 hover:border-[#062e5b] bg-slate-50'
              }`}
            >
              {scanning ? (
                <div className="flex flex-col items-center gap-2 text-indigo-600">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="font-bold text-sm">
                    Scanning with {aiConfig.customModel || DEFAULT_TIMETABLE_PRIMARY_MODEL} ({aiConfig.customApiKey ? 'Custom Key' : 'System Key'})...
                  </span>
                  <span className="text-xs text-slate-500">Extracting time slots, batch rows, teacher codes & notes</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-700">
                  <Upload className="w-8 h-8 text-[#062e5b]" />
                  <span className="font-bold text-sm">
                    {file ? `File: ${file.name}` : 'Click or Drag & Drop Timetable Image Here'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Supports JPEG, PNG, WEBP (e.g. photo or screenshot)
                  </span>
                </div>
              )}
            </div>

            {/* Direct Camera Button for Mobile */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={scanning}
                className="px-3.5 py-1.5 text-xs font-bold border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 shadow-xs"
              >
                <Camera className="w-4 h-4 text-[#78b82a]" /> Take Photo with Camera
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Scan Results & Review */}
          {scanResult && (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Found {scanResult.classes.length} classes for {scanResult.date} ({scanResult.dayName})</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {scanResult.usedModel && (
                    <span className="text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 border border-emerald-300">
                      ⚡ {scanResult.usedModel} ({scanResult.usedKeyType === 'custom' ? 'Custom Key' : 'System Key'})
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5">
                    {scanResult.time}
                  </span>
                </div>
              </div>


              {/* Unmapped Teachers Prompt */}
              {scanResult.unmapped_teachers && scanResult.unmapped_teachers.length > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    <span>New Teacher Codes Detected ({scanResult.unmapped_teachers.length})</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    The following teacher codes were not in our directory. Please select their subjects:
                  </p>

                  <div className="space-y-2 pt-1">
                    {scanResult.unmapped_teachers.map(code => (
                      <div key={code} className="flex items-center gap-3 bg-white p-2 border border-amber-200">
                        <span className="px-2 py-0.5 bg-[#062e5b] text-white text-xs font-bold tracking-wider w-16 text-center">
                          {code}
                        </span>
                        <select
                          value={unmappedSelections[code] || 'PHYSICS'}
                          onChange={(e) => setUnmappedSelections({ ...unmappedSelections, [code]: e.target.value })}
                          className="flex-1 text-xs bg-slate-50 border border-slate-300 p-1.5 font-semibold text-slate-800 focus:outline-none"
                        >
                          {STANDARD_SUBJECTS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center gap-2 text-xs text-amber-900 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={saveMappingsChecked}
                        onChange={(e) => setSaveMappingsChecked(e.target.checked)}
                        className="rounded border-amber-400 text-amber-600"
                      />
                      Save these teacher mappings to Firebase directory for future scans
                    </label>
                  </div>
                </div>
              )}

              {/* Classwise APT Exams Manager */}
              <div className="p-4 bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#062e5b]">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>Classwise APT Exams ({scanResult.classes.length} Classes)</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Configure APT exams individually per class
                  </span>
                </div>

                {/* Bulk Quick Apply Bar */}
                <div className="p-2.5 bg-amber-50/60 border border-amber-200 space-y-1.5">
                  <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Quick Apply to All Classes:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {APT_CHIPS.map(chip => {
                      const isSel = bulkAptInput.includes(chip);
                      return (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleToggleBulkChip(chip)}
                          className={`px-2 py-0.5 text-[11px] font-bold transition-colors ${
                            isSel
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border border-amber-200'
                          }`}
                        >
                          {chip}
                        </button>
                      );
                    })}
                    {bulkAptInput && (
                      <button
                        type="button"
                        onClick={() => handleApplyBulkAptToAll('')}
                        className="px-2 py-0.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Class by Class Configuration List */}
                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {scanResult.classes.map((c, i) => {
                    const classApt = classAptExams[c.class_name] || '';
                    return (
                      <div key={i} className="p-3 bg-white border border-slate-200 shadow-xs space-y-2">
                        {/* Class Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-[#062e5b] text-white font-black text-xs">
                              {c.class_name}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                              {c.subjects.map(s => s.name).join(', ')}
                            </span>
                          </div>
                          {c.extra_note && (
                            <span className="px-1.5 py-0.2 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold">
                              ★ {c.extra_note}
                            </span>
                          )}
                        </div>

                        {/* Individual Class APT Selector */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex flex-wrap items-center gap-1">
                            {APT_CHIPS.map(chip => {
                              const isClassSel = classApt.includes(chip);
                              return (
                                <button
                                  key={chip}
                                  type="button"
                                  onClick={() => handleToggleClassApt(c.class_name, chip)}
                                  className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${
                                    isClassSel
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                  }`}
                                >
                                  {chip}
                                </button>
                              );
                            })}
                            {classApt && (
                              <button
                                type="button"
                                onClick={() => handleSetClassApt(c.class_name, '')}
                                className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-slate-700"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={classApt}
                            onChange={(e) => handleSetClassApt(c.class_name, e.target.value)}
                            placeholder="e.g. Zoology, Botany, CS"
                            className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:border-[#062e5b] focus:outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!scanResult || scanning}
            className="px-4 py-1.5 text-xs font-bold bg-[#062e5b] hover:bg-[#0d427d] text-white flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
          >
            <Check className="w-4 h-4" />
            Import {scanResult ? `${scanResult.classes.length} Classes` : 'Timetable'}
          </button>
        </div>
      </div>

      {/* Standalone Full AI Settings Modal */}
      {showFullAiModal && (
        <TimetableAiSettingsModal
          isOpen={showFullAiModal}
          onClose={() => setShowFullAiModal(false)}
          onSaved={(newCfg) => {
            setAiConfig(newCfg);
          }}
        />
      )}
    </div>
  );
};

