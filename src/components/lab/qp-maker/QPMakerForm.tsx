import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Target,
  FileText,
  Plus,
  Trash2,
  Copy,
  Sparkles,
  Layers,
  Palette,
  Code,
  Image as ImageIcon,
  Upload,
  Clipboard,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Columns,
  Eye,
  Type as TypeIcon,
  HelpCircle,
  BrainCircuit,
  Sliders,
  Maximize2
} from 'lucide-react';
import {
  QPMakerDayData,
  SubjectDivision,
  QPItem,
  QPAsset
} from './types';
import { QpTemplate } from './defaultDartTemplates';

interface QPMakerFormProps {
  dayNum: number;
  data: QPMakerDayData;
  templates: QpTemplate[];
  isGenerating: boolean;
  generateProgress: { current: number; total: number; target: string; percent: number };
  onUpdate: (data: Partial<QPMakerDayData>) => void;
  onSaveDay: () => void;
  onGenerate: () => void;
  onOpenPreviewTemplate: (template: QpTemplate) => void;
  onOpenDesignEditor: (template: QpTemplate) => void;
  onOpenDartSync: () => void;
  onZoomMedia: (params: { src: string; title: string; isPdf?: boolean }) => void;
  onAutoDescribeItem: (item: QPItem) => Promise<void>;
  describingIds: string[];
}

export default function QPMakerForm({
  dayNum,
  data,
  templates,
  isGenerating,
  generateProgress,
  onUpdate,
  onSaveDay,
  onGenerate,
  onOpenPreviewTemplate,
  onOpenDesignEditor,
  onOpenDartSync,
  onZoomMedia,
  onAutoDescribeItem,
  describingIds
}: QPMakerFormProps) {
  // Target Papers Matrix states
  const [showRawTargets, setShowRawTargets] = useState(false);
  const [newBatch, setNewBatch] = useState('B1');
  const [newSelectedSet, setNewSelectedSet] = useState('Set A');
  const [customSet, setCustomSet] = useState('');
  const [selectedDivisionClass, setSelectedDivisionClass] = useState('ALL');

  // Selected AI Model
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('omr_proModel') || 'gemini-2.5-flash';
  });

  // Parse target papers into structured list
  const targetPapersList = useMemo(() => {
    const list: { batch: string; set: string; label: string; hideSet: boolean }[] = [];
    const lines = (data.batchesAndSets || '').split('\n');
    const batchSetsMap: Record<string, string[]> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const parts = trimmed.split(':');
      if (parts.length >= 2) {
        const batch = parts[0].trim();
        const rawSets = parts[1]
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        if (!batchSetsMap[batch]) batchSetsMap[batch] = [];
        for (const s of rawSets) {
          if (!batchSetsMap[batch].includes(s)) batchSetsMap[batch].push(s);
        }
      } else if (trimmed.includes('-')) {
        const pts = trimmed.split('-');
        const batch = pts[0].trim();
        const set = pts.slice(1).join('-').trim();
        if (!batchSetsMap[batch]) batchSetsMap[batch] = [];
        if (set && !batchSetsMap[batch].includes(set)) batchSetsMap[batch].push(set);
      } else {
        const batch = trimmed;
        if (!batchSetsMap[batch]) batchSetsMap[batch] = [];
      }
    }

    for (const [batch, sets] of Object.entries(batchSetsMap)) {
      if (sets.length === 0) {
        list.push({ batch, set: '', label: batch, hideSet: true });
      } else if (sets.length === 1) {
        list.push({ batch, set: sets[0], label: `${batch} - ${sets[0]}`, hideSet: true });
      } else {
        for (const set of sets) {
          list.push({ batch, set, label: `${batch} - ${set}`, hideSet: false });
        }
      }
    }
    return list.length > 0
      ? list
      : [{ batch: 'B1', set: 'Set A', label: 'B1 - Set A', hideSet: true }];
  }, [data.batchesAndSets]);

  const syncTargetsToText = (targetLabels: string[]) => {
    const map: Record<string, string[]> = {};
    for (const target of targetLabels) {
      const pts = target.split(' - ');
      if (pts.length >= 2) {
        const batch = pts[0].trim();
        const set = pts.slice(1).join(' - ').trim();
        if (!map[batch]) map[batch] = [];
        if (!map[batch].includes(set)) map[batch].push(set);
      } else {
        if (!map[target]) map[target] = [];
      }
    }
    const lines: string[] = [];
    for (const [batch, sets] of Object.entries(map)) {
      lines.push(sets.length > 0 ? `${batch}: ${sets.join(', ')}` : batch);
    }
    return lines.join('\n');
  };

  // Available classes for per-class division override
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    targetPapersList.forEach((t) => {
      if (t.batch) classSet.add(t.batch);
    });
    Object.keys(data.classDivisions || {}).forEach((k) => {
      if (k) classSet.add(k);
    });
    return Array.from(classSet);
  }, [targetPapersList, data.classDivisions]);

  // Calculate default allocated marks balance
  const defaultAllocatedMarks = useMemo(() => {
    return (data.subjectDivisions || []).reduce(
      (sum, s) => sum + (parseInt(s.marks, 10) || 0),
      0
    );
  }, [data.subjectDivisions]);

  const targetTotalMarksNum = parseInt(data.totalMarks || '0', 10) || 0;
  const isDefaultBalanced = defaultAllocatedMarks === targetTotalMarksNum;

  // Prompt Preset Chips
  const handleAddPresetPrompt = (presetText: string) => {
    const current = data.extraInstructions || '';
    if (!current.trim()) {
      onUpdate({ extraInstructions: presetText });
    } else if (!current.includes(presetText)) {
      onUpdate({ extraInstructions: `${current}\n• ${presetText}` });
    }
  };

  // Image / PDF Files upload handler
  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const isPdf =
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const mime = isPdf ? 'application/pdf' : file.type || 'image/png';
      const reader = new FileReader();
      reader.onload = (evt) => {
        const b64 = evt.target?.result as string;
        const newItem: QPItem = {
          id: 'i_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          type: isPdf ? 'pdf' : 'image',
          filename: file.name,
          description: isPdf ? `PDF Source: ${file.name}` : '',
          imageBytes: b64,
          dataUrl: b64,
          mimeType: mime,
          file
        };
        onUpdate({ items: [...(data.items || []), newItem] });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Diagram Assets upload handler
  const handleAddAssets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const mime = file.type || 'image/png';
      const reader = new FileReader();
      reader.onload = (evt) => {
        const b64 = evt.target?.result as string;
        const newAsset: QPAsset = {
          id: 'a_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          filename: file.name.replace(/\s+/g, '_'),
          description: '',
          width: 'auto',
          height: 'auto',
          bytes: b64,
          imageBytes: b64,
          mimeType: mime,
          file
        };
        onUpdate({ assets: [...(data.assets || []), newAsset] });
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Clipboard Paste Handler (Browser clipboard)
  const handlePasteClipboard = async (targetType: 'source' | 'asset') => {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipItems = await navigator.clipboard.read();
        for (const item of clipItems) {
          const imgType = item.types.find((t) => t.startsWith('image/'));
          if (imgType) {
            const blob = await item.getType(imgType);
            const reader = new FileReader();
            reader.onload = () => {
              const b64 = reader.result as string;
              const ext = imgType.split('/')[1] || 'png';
              if (targetType === 'asset') {
                const fname = `pasted_diagram_${Date.now()}.${ext}`;
                const newAsset: QPAsset = {
                  id: 'a_' + Date.now(),
                  filename: fname,
                  description: '',
                  width: 'auto',
                  height: 'auto',
                  bytes: b64,
                  imageBytes: b64,
                  mimeType: imgType
                };
                onUpdate({ assets: [...(data.assets || []), newAsset] });
              } else {
                const fname = `pasted_image_${Date.now()}.${ext}`;
                const newItem: QPItem = {
                  id: 'i_' + Date.now(),
                  type: 'image',
                  filename: fname,
                  description: '',
                  imageBytes: b64,
                  dataUrl: b64,
                  mimeType: imgType
                };
                onUpdate({ items: [...(data.items || []), newItem] });
              }
            };
            reader.readAsDataURL(blob);
            return;
          }
          const pdfType = item.types.find((t) => t === 'application/pdf');
          if (pdfType && targetType === 'source') {
            const blob = await item.getType(pdfType);
            const reader = new FileReader();
            reader.onload = () => {
              const b64 = reader.result as string;
              const fname = `pasted_doc_${Date.now()}.pdf`;
              const newItem: QPItem = {
                id: 'i_' + Date.now(),
                type: 'pdf',
                filename: fname,
                description: `PDF Source: ${fname}`,
                imageBytes: b64,
                dataUrl: b64,
                mimeType: 'application/pdf'
              };
              onUpdate({ items: [...(data.items || []), newItem] });
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }

      // Text clipboard fallback
      const text = await navigator.clipboard?.readText?.();
      if (text && text.trim().length > 0 && targetType === 'source') {
        const newItem: QPItem = {
          id: 't_' + Date.now(),
          type: 'text',
          isText: true,
          description: '',
          textContent: text.trim(),
          filename: 'Pasted Question Text'
        };
        onUpdate({ items: [...(data.items || []), newItem] });
        return;
      }

      alert('No image, PDF file, or text found in your clipboard.');
    } catch (err: any) {
      console.error('Paste error:', err);
      alert('Could not paste clipboard content: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Sticky/Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-sm font-black bg-indigo-600 text-white rounded-xl shadow-xs">
            Day {dayNum}
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Question Paper Setup & Structure
            </h3>
            <p className="text-xs text-gray-500">
              Configure subject marks, Dart templates, questions sources, and AI instructions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onSaveDay}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Save Day
          </button>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-all hover:shadow-indigo-100"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate All Papers</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generation Progress Bar */}
      {isGenerating && (
        <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              Generating {generateProgress.target} ({generateProgress.current + 1} of{' '}
              {generateProgress.total})...
            </span>
            <span>{generateProgress.percent}%</span>
          </div>
          <div className="w-full bg-indigo-200/70 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${generateProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ===================== COLUMN 1 ===================== */}
        <div className="space-y-6">
          {/* CARD 1: EXAM METADATA */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>1. Exam Metadata</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Subtitle / Examination Title
                </label>
                <input
                  type="text"
                  value={data.subtitle}
                  onChange={(e) => onUpdate({ subtitle: e.target.value })}
                  placeholder="e.g. Daily Examination / Mid-Term Test"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-semibold outline-none"
                />
              </div>

              {/* Date with quick chips */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Exam Date
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        const day = String(d.getDate()).padStart(2, '0');
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        onUpdate({ date: `${day}/${m}/${d.getFullYear()}` });
                      }}
                      className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        const day = String(d.getDate()).padStart(2, '0');
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        onUpdate({ date: `${day}/${m}/${d.getFullYear()}` });
                      }}
                      className="px-2 py-0.5 text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={data.date}
                  onChange={(e) => onUpdate({ date: e.target.value })}
                  placeholder="DD/MM/YYYY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="text"
                    value={data.duration}
                    onChange={(e) => onUpdate({ duration: e.target.value })}
                    placeholder="30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-semibold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Total Target Marks
                  </label>
                  <input
                    type="text"
                    value={data.totalMarks}
                    onChange={(e) => onUpdate({ totalMarks: e.target.value })}
                    placeholder="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-semibold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                  AI Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    localStorage.setItem('omr_proModel', e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-semibold outline-none bg-white"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Accurate)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Advanced Reasoning)</option>
                  <option value="gemini-3.1-flash-lite-preview">gemini-3.1-flash-lite-preview (Ultra Fast)</option>
                </select>
              </div>
            </div>
          </div>

          {/* CARD 2: SUBJECT DIVISIONS & CLASS OVERRIDES */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                <span>2. Subject Divisions & Class Scores</span>
              </div>
              {selectedDivisionClass === 'ALL' ? (
                <button
                  type="button"
                  onClick={() => {
                    const updated = [
                      ...(data.subjectDivisions || []),
                      { id: String(Date.now()), subject: 'Chemistry', marks: '15' }
                    ];
                    onUpdate({ subjectDivisions: updated });
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Subject
                </button>
              ) : (
                data.classDivisions?.[selectedDivisionClass]?.enabled && (
                  <button
                    type="button"
                    onClick={() => {
                      const existing = data.classDivisions[selectedDivisionClass];
                      const updatedSubjects = [
                        ...(existing.subjects || []),
                        { id: String(Date.now()), subject: 'Mathematics', marks: '15' }
                      ];
                      onUpdate({
                        classDivisions: {
                          ...data.classDivisions,
                          [selectedDivisionClass]: { ...existing, subjects: updatedSubjects }
                        }
                      });
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Subject
                  </button>
                )
              )}
            </div>

            {/* Class Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap p-1.5 bg-slate-50 border border-gray-200 rounded-xl">
              <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider px-1">
                Target:
              </span>
              <button
                type="button"
                onClick={() => setSelectedDivisionClass('ALL')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  selectedDivisionClass === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All Classes (Default)
              </button>
              {availableClasses.map((cls) => {
                const hasCustom = Boolean(data.classDivisions?.[cls]?.enabled);
                const isSel = selectedDivisionClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedDivisionClass(cls)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      isSel
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : hasCustom
                        ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    Class: {cls}
                    {hasCustom && (
                      <span className="ml-1 text-[10px] font-black opacity-80">
                        ({data.classDivisions[cls].maxMarks}M)
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Default Subject Divisions */}
            {selectedDivisionClass === 'ALL' ? (
              <div className="space-y-3">
                {/* Marks balance banner */}
                <div
                  className={`p-2.5 px-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold ${
                    isDefaultBalanced
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {isDefaultBalanced ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                    {isDefaultBalanced
                      ? `Marks Balanced: ${defaultAllocatedMarks} / ${targetTotalMarksNum}`
                      : `Marks Mismatch: Allocated ${defaultAllocatedMarks} vs Target ${targetTotalMarksNum}`}
                  </span>
                  {!isDefaultBalanced && (
                    <button
                      type="button"
                      onClick={() => onUpdate({ totalMarks: String(defaultAllocatedMarks) })}
                      className="text-[11px] underline hover:text-amber-950"
                    >
                      Auto-Sync Target
                    </button>
                  )}
                </div>

                {/* Subject List */}
                <div className="space-y-2">
                  {(data.subjectDivisions || []).map((sub, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sub.subject}
                        onChange={(e) => {
                          const updated = [...data.subjectDivisions];
                          updated[idx] = { ...updated[idx], subject: e.target.value };
                          onUpdate({ subjectDivisions: updated });
                        }}
                        placeholder="Subject Name (e.g. Physics)"
                        className="flex-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold outline-none"
                      />
                      <input
                        type="text"
                        value={sub.marks}
                        onChange={(e) => {
                          const updated = [...data.subjectDivisions];
                          updated[idx] = { ...updated[idx], marks: e.target.value };
                          onUpdate({ subjectDivisions: updated });
                        }}
                        placeholder="Marks"
                        className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold outline-none"
                      />
                      {data.subjectDivisions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = data.subjectDivisions.filter((_, i) => i !== idx);
                            onUpdate({ subjectDivisions: updated });
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Specific Target Class Custom Configuration */
              (() => {
                const cls = selectedDivisionClass;
                const clsConfig = data.classDivisions?.[cls] || {
                  enabled: false,
                  maxMarks: data.totalMarks,
                  subjects: data.subjectDivisions.map((s) => ({
                    ...s,
                    id: Math.random().toString(36).substring(2, 7)
                  }))
                };
                const classAllocated = (clsConfig.subjects || []).reduce(
                  (sum, s) => sum + (parseInt(s.marks, 10) || 0),
                  0
                );
                const classTargetNum = parseInt(clsConfig.maxMarks || '0', 10) || 0;
                const isClassBalanced = classAllocated === classTargetNum;

                return (
                  <div className="space-y-3">
                    {/* Class Custom Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-gray-200 rounded-xl">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={clsConfig.enabled}
                          onChange={(e) => {
                            const enabled = e.target.checked;
                            onUpdate({
                              classDivisions: {
                                ...data.classDivisions,
                                [cls]: { ...clsConfig, enabled }
                              }
                            });
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className="text-xs font-bold text-gray-800">
                          Custom Scores & Subjects for Class {cls}
                        </span>
                      </label>
                      {clsConfig.enabled && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdate({
                              classDivisions: {
                                ...data.classDivisions,
                                [cls]: {
                                  enabled: true,
                                  maxMarks: data.totalMarks,
                                  subjects: data.subjectDivisions.map((s) => ({
                                    ...s,
                                    id: Math.random().toString(36).substring(2, 7)
                                  }))
                                }
                              }
                            });
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:underline"
                        >
                          Copy from Default
                        </button>
                      )}
                    </div>

                    {clsConfig.enabled ? (
                      <div className="space-y-3 p-3 bg-white border border-gray-200 rounded-xl">
                        <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                            Max Score for Class {cls}
                          </label>
                          <input
                            type="text"
                            value={clsConfig.maxMarks}
                            onChange={(e) => {
                              onUpdate({
                                classDivisions: {
                                  ...data.classDivisions,
                                  [cls]: { ...clsConfig, maxMarks: e.target.value }
                                }
                              });
                            }}
                            className="w-full sm:w-48 px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold outline-none"
                          />
                        </div>

                        {/* Balance pill */}
                        <div
                          className={`p-2 px-3 rounded-lg border flex items-center justify-between gap-2 text-xs font-bold ${
                            isClassBalanced
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            {isClassBalanced ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            )}
                            Allocated {classAllocated} / Target {classTargetNum}
                          </span>
                          {!isClassBalanced && (
                            <button
                              type="button"
                              onClick={() => {
                                onUpdate({
                                  classDivisions: {
                                    ...data.classDivisions,
                                    [cls]: { ...clsConfig, maxMarks: String(classAllocated) }
                                  }
                                });
                              }}
                              className="text-[11px] underline hover:text-amber-950"
                            >
                              Auto-Sync Class
                            </button>
                          )}
                        </div>

                        {/* Subject list */}
                        <div className="space-y-2">
                          {(clsConfig.subjects || []).map((sub, sIdx) => (
                            <div key={sIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={sub.subject}
                                onChange={(e) => {
                                  const updated = [...clsConfig.subjects];
                                  updated[sIdx] = { ...updated[sIdx], subject: e.target.value };
                                  onUpdate({
                                    classDivisions: {
                                      ...data.classDivisions,
                                      [cls]: { ...clsConfig, subjects: updated }
                                    }
                                  });
                                }}
                                className="flex-2 px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold outline-none"
                              />
                              <input
                                type="text"
                                value={sub.marks}
                                onChange={(e) => {
                                  const updated = [...clsConfig.subjects];
                                  updated[sIdx] = { ...updated[sIdx], marks: e.target.value };
                                  onUpdate({
                                    classDivisions: {
                                      ...data.classDivisions,
                                      [cls]: { ...clsConfig, subjects: updated }
                                    }
                                  });
                                }}
                                className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold outline-none"
                              />
                              {(clsConfig.subjects || []).length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = clsConfig.subjects.filter((_, i) => i !== sIdx);
                                    onUpdate({
                                      classDivisions: {
                                        ...data.classDivisions,
                                        [cls]: { ...clsConfig, subjects: updated }
                                      }
                                    });
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 border border-dashed border-gray-300 rounded-xl text-center space-y-2">
                        <p className="text-xs text-gray-600">
                          <strong>Class {cls}</strong> uses the Default Subject Divisions (
                          {defaultAllocatedMarks} marks).
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdate({
                              classDivisions: {
                                ...data.classDivisions,
                                [cls]: { ...clsConfig, enabled: true }
                              }
                            });
                          }}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Enable Separate Scores & Subjects for Class {cls}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>

          {/* CARD 3: TARGET PAPERS MATRIX */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>3. Target Papers ({targetPapersList.length} Variants)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRawTargets(!showRawTargets)}
                className="text-xs font-bold text-gray-600 hover:text-indigo-600"
              >
                {showRawTargets ? 'Adaptive Mode' : 'Raw Text Mode'}
              </button>
            </div>

            {/* Target Variant Chips */}
            {targetPapersList.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {targetPapersList.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs"
                  >
                    <span>{t.label}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const remaining = targetPapersList
                          .filter((_, i) => i !== idx)
                          .map((x) => x.label);
                        onUpdate({ batchesAndSets: syncTargetsToText(remaining) });
                      }}
                      className="hover:text-red-600"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}

            {!showRawTargets ? (
              <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                  Add New Target Variant:
                </span>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <input
                    type="text"
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    placeholder="Batch (e.g. B1)"
                    className="w-full sm:w-32 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold outline-none"
                  />
                  <select
                    value={newSelectedSet}
                    onChange={(e) => setNewSelectedSet(e.target.value)}
                    className="w-full sm:w-36 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold outline-none"
                  >
                    {['Set A', 'Set B', 'Set C', 'Set D', 'Set E', 'Custom...'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {newSelectedSet === 'Custom...' && (
                    <input
                      type="text"
                      value={customSet}
                      onChange={(e) => setCustomSet(e.target.value)}
                      placeholder="Custom Set (e.g. Set 1)"
                      className="w-full sm:w-36 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-semibold outline-none"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const batch = newBatch.trim();
                      const set =
                        newSelectedSet === 'Custom...' ? customSet.trim() : newSelectedSet;
                      if (!batch || !set) return;
                      const targetLabel = `${batch} - ${set}`;
                      const currentLabels = targetPapersList.map((x) => x.label);
                      if (!currentLabels.includes(targetLabel)) {
                        const updated = [...currentLabels, targetLabel];
                        onUpdate({ batchesAndSets: syncTargetsToText(updated) });
                        if (newSelectedSet === 'Custom...') setCustomSet('');
                      }
                    }}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            ) : (
              <textarea
                rows={3}
                value={data.batchesAndSets}
                onChange={(e) => onUpdate({ batchesAndSets: e.target.value })}
                placeholder="B1: Set A, Set B&#10;B2: Set A, Set B"
                className="w-full font-mono text-xs p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>
        </div>

        {/* ===================== COLUMN 2 ===================== */}
        <div className="space-y-6">
          {/* CARD 4: QP DESIGN TEMPLATE */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span>4. QP Design Template ({templates.length} Active)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const curT =
                      templates.find((t) => t.id === data.templateId) || templates[0];
                    onOpenDesignEditor(curT);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                >
                  <Code className="w-3.5 h-3.5" /> Edit HTML
                </button>
                <button
                  type="button"
                  onClick={onOpenDartSync}
                  className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-indigo-600"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Sync Dart
                </button>
              </div>
            </div>

            {/* Layout & Typography bar */}
            <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.twoColumn}
                    onChange={(e) => onUpdate({ twoColumn: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                      <Columns className="w-3.5 h-3.5 text-indigo-600" /> Two-Column Layout
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      Renders continuous 2-column examination stream
                    </span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200/60">
                <div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                    Base Font Size
                  </span>
                  <select
                    value={data.fontSize}
                    onChange={(e) => onUpdate({ fontSize: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 outline-none cursor-pointer"
                  >
                    {['10px', '11px', '12px', '13px', '14px', '15px', '16px', '18px'].map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                    LaTeX Math Size
                  </span>
                  <select
                    value={data.latexSize}
                    onChange={(e) => onUpdate({ latexSize: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-800 outline-none cursor-pointer"
                  >
                    {['80%', '85%', '90%', '95%', '100%', '105%', '110%', '120%', '130%'].map(
                      (ls) => (
                        <option key={ls} value={ls}>
                          {ls}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Template Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {templates.map((t) => {
                const isSel = data.templateId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => onUpdate({ templateId: t.id })}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSel
                        ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-600/20'
                        : 'bg-white border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-black text-gray-900 truncate">
                          {t.name}
                        </span>
                        {t.isCustomized && (
                          <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-100 text-amber-800 rounded">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-tight">
                        {t.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPreviewTemplate(t);
                        }}
                        className="flex-1 py-1 text-[11px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-center"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDesignEditor(t);
                        }}
                        className="py-1 px-2 text-[11px] font-bold text-indigo-600 hover:bg-indigo-100 rounded-md transition-colors"
                        title="Edit HTML"
                      >
                        <Code className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD 5: PROMPT PRESETS & DIRECTIVES */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>5. AI Directives & Prompt Presets</span>
            </div>

            {/* Presets Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  handleAddPresetPrompt(
                    'Format all multi-part sub-questions using HTML <ol type="a"> or <ol type="i"> tags, with each sub-question enclosed in <li>.'
                  )
                }
                className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200 transition-colors"
              >
                Sub-questions (&lt;ol&gt; tags)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAddPresetPrompt(
                    'Strictly write only questions. Do NOT provide any answers, solutions, explanations, or hints under any circumstances.'
                  )
                }
                className="px-2.5 py-1 text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 transition-colors"
              >
                Questions Only (No Answers)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAddPresetPrompt(
                    'Ensure each question has exact sub-marks and formulas in MathJax format.'
                  )
                }
                className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Strict Marking Scheme
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAddPresetPrompt(
                    'Include theoretical derivations and reference diagram assets where applicable.'
                  )
                }
                className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Diagrams & Derivations
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAddPresetPrompt(
                    'Format math equations compactly for optimal two-column presentation.'
                  )
                }
                className="px-2.5 py-1 text-[11px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Two-Column Math Density
              </button>
            </div>

            <textarea
              rows={3}
              value={data.extraInstructions}
              onChange={(e) => onUpdate({ extraInstructions: e.target.value })}
              placeholder="Additional instructions for question selection, allocation, or formatting..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm outline-none resize-none"
            />
          </div>

          {/* CARD 6: SOURCE MATERIALS */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>6. Source Materials ({data.items?.length || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Add Files</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    hidden
                    onChange={handleAddFiles}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handlePasteClipboard('source')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newItem: QPItem = {
                      id: 't_' + Date.now(),
                      type: 'text',
                      isText: true,
                      description: '',
                      textContent: '',
                      filename: 'Text Source Block'
                    };
                    onUpdate({ items: [...(data.items || []), newItem] });
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <TypeIcon className="w-3.5 h-3.5" />
                  <span>Add Text</span>
                </button>
              </div>
            </div>

            {/* Items List */}
            {(!data.items || data.items.length === 0) ? (
              <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl space-y-1">
                <p className="text-xs font-bold text-gray-600">No Question Sources Added Yet</p>
                <p className="text-[11px] text-gray-400">
                  Upload question images/PDFs, paste from clipboard (Ctrl+V), or add text blocks.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {data.items.map((item, idx) => {
                  const isPdf = item.type === 'pdf';
                  const isDescribing = describingIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 border border-gray-200 rounded-xl flex items-start gap-3"
                    >
                      {/* Thumbnail or Icon */}
                      {item.type === 'text' ? (
                        <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 text-gray-400">
                          <TypeIcon className="w-6 h-6" />
                        </div>
                      ) : isPdf ? (
                        <div
                          onClick={() =>
                            onZoomMedia({
                              src: item.imageBytes || item.dataUrl || '',
                              title: item.filename || 'PDF Document',
                              isPdf: true
                            })
                          }
                          className="w-16 h-16 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center shrink-0 cursor-pointer text-red-500 hover:bg-red-100 transition-colors"
                        >
                          <FileText className="w-6 h-6" />
                          <span className="text-[9px] font-black uppercase mt-0.5">PDF</span>
                        </div>
                      ) : (
                        <div
                          onClick={() =>
                            onZoomMedia({
                              src: item.imageBytes || item.dataUrl || '',
                              title: item.filename || 'Question Source',
                              isPdf: false
                            })
                          }
                          className="w-16 h-16 bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0 cursor-pointer group relative"
                        >
                          <img
                            src={item.imageBytes || item.dataUrl}
                            alt="Source"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      )}

                      {/* Content / description */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-gray-800 truncate">
                            {item.filename || 'Source Material'}
                          </span>
                          <div className="flex items-center gap-1">
                            {!isPdf && item.type !== 'text' && (
                              <button
                                type="button"
                                disabled={isDescribing}
                                onClick={() => onAutoDescribeItem(item)}
                                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 rounded transition-colors"
                              >
                                {isDescribing ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3 h-3" />
                                )}
                                <span>Auto-Describe</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = data.items.filter((_, i) => i !== idx);
                                onUpdate({ items: updated });
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {item.type === 'text' && (
                          <textarea
                            rows={3}
                            value={item.textContent || ''}
                            onChange={(e) => {
                              const updated = [...data.items];
                              updated[idx] = { ...updated[idx], textContent: e.target.value };
                              onUpdate({ items: updated });
                            }}
                            placeholder="Paste questions here with choices or LaTeX..."
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                          />
                        )}

                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...data.items];
                            updated[idx] = { ...updated[idx], description: e.target.value };
                            onUpdate({ items: updated });
                          }}
                          placeholder="Instructions/description for AI (e.g. For B1 Set A Section 1)"
                          className="w-full px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CARD 7: ASSETS / EXTERNAL DIAGRAMS */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>7. Assets / External Images ({data.assets?.length || 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Assets</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleAddAssets}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => handlePasteClipboard('asset')}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Paste Diagram</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Upload diagrams or charts (e.g. <code>triangle.png</code>). The AI will embed them into questions using <code>&lt;img src="filename"&gt;</code>.
            </p>

            {(!data.assets || data.assets.length === 0) ? (
              <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl space-y-1">
                <p className="text-xs font-bold text-gray-600">No Diagram Assets Added</p>
                <p className="text-[11px] text-gray-400">
                  Upload figures or circuit diagrams that need to appear within questions.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {data.assets.map((asset, idx) => (
                  <div
                    key={asset.id}
                    className="p-3 bg-slate-50 border border-gray-200 rounded-xl flex items-start gap-3"
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() =>
                        onZoomMedia({
                          src: asset.bytes || asset.imageBytes || '',
                          title: asset.filename,
                          isPdf: false
                        })
                      }
                      className="w-16 h-16 bg-white border border-gray-200 rounded-lg overflow-hidden shrink-0 cursor-pointer group relative"
                    >
                      <img
                        src={asset.bytes || asset.imageBytes}
                        alt={asset.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-gray-800 truncate">
                          {asset.filename}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = data.assets.filter((_, i) => i !== idx);
                            onUpdate({ assets: updated });
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={asset.filename}
                        onChange={(e) => {
                          const updated = [...data.assets];
                          updated[idx] = { ...updated[idx], filename: e.target.value };
                          onUpdate({ assets: updated });
                        }}
                        placeholder="Filename (e.g. triangle.png)"
                        className="w-full px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-xs outline-none font-mono"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={asset.width || 'auto'}
                          onChange={(e) => {
                            const updated = [...data.assets];
                            updated[idx] = { ...updated[idx], width: e.target.value };
                            onUpdate({ assets: updated });
                          }}
                          placeholder="Width (default: auto)"
                          className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-[11px] outline-none"
                        />
                        <input
                          type="text"
                          value={asset.height || 'auto'}
                          onChange={(e) => {
                            const updated = [...data.assets];
                            updated[idx] = { ...updated[idx], height: e.target.value };
                            onUpdate({ assets: updated });
                          }}
                          placeholder="Height (default: auto)"
                          className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-[11px] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}