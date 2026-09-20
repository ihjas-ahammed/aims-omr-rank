import React, { useState, useMemo } from 'react';
import MatIcon from './MatIcon';
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

type FormPhase = 'BLUEPRINT' | 'SOURCES' | 'DESIGN' | 'ALL';

// Psychology-based presets for rapid cognitive flow & reduced keystroke overhead
const SUBTITLE_PRESETS = [
  'Daily Examination',
  'Weekly Test',
  'Unit Examination',
  'Model Exam',
  'Revision Series',
  'NEET Mock Test'
];

const DURATION_PRESETS = [
  { label: '30 Mins', value: '30' },
  { label: '45 Mins', value: '45' },
  { label: '1 Hour', value: '60' },
  { label: '90 Mins', value: '90' },
  { label: '2 Hours', value: '120' }
];

const MARKS_PRESETS = ['15', '20', '25', '30', '45', '50', '75', '100'];

const TARGET_PRESETS = [
  {
    label: 'Standard 2 Sets (B1, B2: Set A, B)',
    value: 'B1: Set A, Set B\nB2: Set A, Set B'
  },
  {
    label: 'Single Set (B1, B2: Set A)',
    value: 'B1: Set A\nB2: Set A'
  },
  {
    label: 'Campus 4 Batches (A1, A2, B1, B2: Set A, B)',
    value: 'A1: Set A, Set B\nA2: Set A, Set B\nB1: Set A, Set B\nB2: Set A, Set B'
  }
];

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
  // Navigation Phase State (Progressive Disclosure)
  const [activePhase, setActivePhase] = useState<FormPhase>('BLUEPRINT');

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
  const isDefaultBalanced = defaultAllocatedMarks === targetTotalMarksNum && targetTotalMarksNum > 0;

  // Question & Material Counts
  const sourcesCount = (data.items || []).length;
  const assetsCount = (data.assets || []).length;
  const totalMaterials = sourcesCount + assetsCount;

  // Psychology-based Milestone Verification (Goal Gradient Effect)
  const milestoneExamInfo = Boolean(data.subtitle && data.subtitle.trim() && data.date && data.date.trim());
  const milestoneMarks = isDefaultBalanced;
  const milestoneTargets = targetPapersList.length > 0;
  const milestoneSources = totalMaterials > 0;

  const readinessPercent = useMemo(() => {
    let pts = 0;
    if (milestoneExamInfo) pts += 25;
    if (milestoneMarks) pts += 25;
    if (milestoneTargets) pts += 25;
    if (milestoneSources) pts += 25;
    return pts;
  }, [milestoneExamInfo, milestoneMarks, milestoneTargets, milestoneSources]);

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

  // Helper to switch phase & scroll smoothly to top
  const switchPhase = (phase: FormPhase) => {
    setActivePhase(phase);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 w-full max-w-7xl mx-auto min-w-0 overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* TOP ACTION HEADER & EXAM READINESS HUD */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="px-3.5 py-1.5 text-xs font-black bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
              Day {dayNum}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 min-w-0">
                <span className="truncate">{data.subtitle || 'Daily Examination'}</span>
                <span className="text-xs font-bold text-slate-400 font-mono shrink-0">({data.date || 'No Date'})</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate">
                Structured Question Paper Generator with Dart Engine &amp; Multi-Set Compiler
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            <button
              type="button"
              onClick={onSaveDay}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="Save Day Configuration"
            >
              <MatIcon name="save" size={18} />
              <span>Save Day</span>
            </button>
            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 rounded-xl shadow-md transition-all active:scale-95 hover:shadow-indigo-100"
              title="Generate All Question Papers"
            >
              <MatIcon
                name={isGenerating ? 'sync' : 'bolt'}
                size={20}
                className={isGenerating ? 'animate-spin' : 'text-amber-300'}
              />
              <span>{isGenerating ? 'Generating...' : 'Generate All Papers'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Readiness Scorecard (Goal Gradient Effect) */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 gap-2">
            <span className="flex items-center gap-1.5 shrink-0">
              <MatIcon name="shield" size={18} className="text-indigo-600" />
              <span>Blueprint Readiness ({readinessPercent}%)</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 truncate text-right">
              {readinessPercent === 100
                ? '✓ Ready for generation'
                : 'Complete milestones below'}
            </span>
          </div>

          {/* Micro Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                readinessPercent === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-500'
              }`}
              style={{ width: `${readinessPercent}%` }}
            />
          </div>

          {/* Milestone Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {/* 1. Exam Info */}
            <div
              onClick={() => setActivePhase('BLUEPRINT')}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all min-w-0 ${
                milestoneExamInfo
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'
              }`}
            >
              <span className="flex items-center gap-1.5 truncate min-w-0 pr-1">
                <MatIcon name="event_note" size={16} />
                <span className="truncate">1. Basics</span>
              </span>
              <MatIcon
                name={milestoneExamInfo ? 'check_circle' : 'radio_button_unchecked'}
                size={16}
                className={milestoneExamInfo ? 'text-emerald-600 shrink-0' : 'text-slate-300 shrink-0'}
              />
            </div>

            {/* 2. Marks Balance */}
            <div
              onClick={() => setActivePhase('BLUEPRINT')}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all min-w-0 ${
                milestoneMarks
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/70 border-amber-200 text-amber-900 hover:border-amber-400'
              }`}
            >
              <span className="flex items-center gap-1.5 truncate min-w-0 pr-1">
                <MatIcon name="balance" size={16} />
                <span className="truncate">2. Marks ({defaultAllocatedMarks}/{targetTotalMarksNum})</span>
              </span>
              <MatIcon
                name={milestoneMarks ? 'check_circle' : 'warning'}
                size={16}
                className={milestoneMarks ? 'text-emerald-600 shrink-0' : 'text-amber-500 shrink-0'}
              />
            </div>

            {/* 3. Target Papers */}
            <div
              onClick={() => setActivePhase('BLUEPRINT')}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all min-w-0 ${
                milestoneTargets
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'
              }`}
            >
              <span className="flex items-center gap-1.5 truncate min-w-0 pr-1">
                <MatIcon name="groups" size={16} />
                <span className="truncate">3. Targets ({targetPapersList.length}P)</span>
              </span>
              <MatIcon
                name={milestoneTargets ? 'check_circle' : 'radio_button_unchecked'}
                size={16}
                className={milestoneTargets ? 'text-emerald-600 shrink-0' : 'text-slate-300 shrink-0'}
              />
            </div>

            {/* 4. Sources */}
            <div
              onClick={() => setActivePhase('SOURCES')}
              className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all min-w-0 ${
                milestoneSources
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'
              }`}
            >
              <span className="flex items-center gap-1.5 truncate min-w-0 pr-1">
                <MatIcon name="folder_open" size={16} />
                <span className="truncate">4. Sources ({totalMaterials})</span>
              </span>
              <MatIcon
                name={milestoneSources ? 'check_circle' : 'radio_button_unchecked'}
                size={16}
                className={milestoneSources ? 'text-emerald-600 shrink-0' : 'text-slate-300 shrink-0'}
              />
            </div>
          </div>
        </div>

        {/* Phase Navigation Tabs (Hick's Law / Progressive Disclosure) */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActivePhase('BLUEPRINT')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                activePhase === 'BLUEPRINT'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MatIcon name="assignment" size={16} />
              <span>1. Blueprint</span>
              {milestoneExamInfo && milestoneMarks && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePhase('SOURCES')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                activePhase === 'SOURCES'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MatIcon name="auto_stories" size={16} />
              <span>2. Sources ({totalMaterials})</span>
              {milestoneSources && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePhase('DESIGN')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                activePhase === 'DESIGN'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MatIcon name="rocket_launch" size={16} />
              <span>3. Launchpad</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActivePhase(activePhase === 'ALL' ? 'BLUEPRINT' : 'ALL')}
            className={`flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors whitespace-nowrap ${
              activePhase === 'ALL'
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <MatIcon name="view_agenda" size={16} />
            <span>{activePhase === 'ALL' ? 'Continuous View' : 'View All'}</span>
          </button>
        </div>
      </div>

      {/* Generation Progress Bar (when generating) */}
      {isGenerating && (
        <div className="p-4 bg-indigo-50/90 border border-indigo-200 rounded-3xl space-y-2 animate-fadeIn shadow-xs">
          <div className="flex items-center justify-between text-xs font-black text-indigo-900">
            <span className="flex items-center gap-2">
              <MatIcon name="sync" size={16} className="animate-spin text-indigo-600" />
              <span>Generating {generateProgress.target} ({generateProgress.current + 1} of {generateProgress.total})...</span>
            </span>
            <span className="font-mono">{generateProgress.percent}%</span>
          </div>
          <div className="w-full bg-indigo-200/70 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 h-full transition-all duration-300 rounded-full"
              style={{ width: `${generateProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PHASE 1: EXAM BLUEPRINT (METADATA + SUBJECTS + TARGETS) */}
      {/* ------------------------------------------------------------- */}
      {(activePhase === 'BLUEPRINT' || activePhase === 'ALL') && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLUMN A: EXAM METADATA */}
            <div className="space-y-6">
              {/* CARD 1: EXAM METADATA */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <MatIcon name="assignment" size={18} className="text-indigo-600" />
                    <span>1. Examination Basics</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">Step 1 of 3</span>
                </div>

                <div className="space-y-3.5">
                  {/* Subtitle / Exam Title */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MatIcon name="edit_note" size={16} className="text-indigo-600" />
                      <span>Subtitle / Examination Title</span>
                    </label>
                    <input
                      type="text"
                      value={data.subtitle}
                      onChange={(e) => onUpdate({ subtitle: e.target.value })}
                      placeholder="e.g. Daily Examination / Mid-Term Test"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold outline-none transition-all"
                    />

                    {/* Subtitle Quick Chips with Material Icons */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {SUBTITLE_PRESETS.map((preset) => {
                        let icon = 'label';
                        if (preset.includes('Daily')) icon = 'today';
                        else if (preset.includes('Weekly')) icon = 'event_repeat';
                        else if (preset.includes('Unit')) icon = 'menu_book';
                        else if (preset.includes('Model')) icon = 'workspace_premium';
                        else if (preset.includes('Revision')) icon = 'history_edu';
                        else if (preset.includes('Mock') || preset.includes('NEET')) icon = 'school';

                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => onUpdate({ subtitle: preset })}
                            className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-lg border transition-all ${
                              data.subtitle === preset
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <MatIcon name={icon} size={12} />
                            <span>{preset}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Exam Date */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <MatIcon name="calendar_today" size={16} className="text-indigo-600" />
                        <span>Exam Date</span>
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
                          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                        >
                          <MatIcon name="today" size={12} />
                          <span>Today</span>
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
                          className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                        >
                          <MatIcon name="event" size={12} />
                          <span>Tomorrow</span>
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={data.date}
                      onChange={(e) => onUpdate({ date: e.target.value })}
                      placeholder="DD/MM/YYYY"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-semibold outline-none transition-all"
                    />
                  </div>

                  {/* Duration & Marks with Material Icons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <MatIcon name="schedule" size={16} className="text-indigo-600" />
                        <span>Duration (Mins)</span>
                      </label>
                      <input
                        type="text"
                        value={data.duration}
                        onChange={(e) => onUpdate({ duration: e.target.value })}
                        placeholder="30"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-bold outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {DURATION_PRESETS.map((dp) => (
                          <button
                            key={dp.value}
                            type="button"
                            onClick={() => onUpdate({ duration: dp.value })}
                            className={`flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                              data.duration === dp.value
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <MatIcon name="timer" size={12} />
                            <span>{dp.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <MatIcon name="military_tech" size={16} className="text-indigo-600" />
                        <span>Total Marks</span>
                      </label>
                      <input
                        type="text"
                        value={data.totalMarks}
                        onChange={(e) => onUpdate({ totalMarks: e.target.value })}
                        placeholder="15"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm font-bold outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {MARKS_PRESETS.map((mp) => (
                          <button
                            key={mp}
                            type="button"
                            onClick={() => onUpdate({ totalMarks: mp })}
                            className={`flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded border ${
                              data.totalMarks === mp
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            <MatIcon name="grade" size={12} />
                            <span>{mp}M</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI Model Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MatIcon name="smart_toy" size={16} className="text-amber-500" />
                      <span>AI Engine Model</span>
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => {
                        setSelectedModel(e.target.value);
                        localStorage.setItem('omr_proModel', e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs font-bold outline-none bg-white"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast, Accurate &amp; Reliable)</option>
                      <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Deep Mathematical Reasoning)</option>
                      <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite (Ultra-Low Latency)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN B: SUBJECT DIVISIONS & TARGET PAPERS */}
            <div className="space-y-6">
              {/* CARD 2: SUBJECT DIVISIONS */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <MatIcon name="calculate" size={18} className="text-indigo-600" />
                    <span>2. Subject Divisions &amp; Marks</span>
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
                      <MatIcon name="add" size={16} />
                      <span>Add Subject</span>
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
                        <MatIcon name="add" size={16} />
                        <span>Add Subject</span>
                      </button>
                    )
                  )}
                </div>

                {/* Target Class Switcher Pills */}
                <div className="flex items-center gap-1.5 flex-wrap p-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-1 flex items-center gap-1">
                    <MatIcon name="tune" size={12} />
                    <span>Scope:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDivisionClass('ALL')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                      selectedDivisionClass === 'ALL'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <MatIcon name="groups" size={14} />
                    <span>All Classes (Default)</span>
                  </button>
                  {availableClasses.map((cls) => {
                    const hasCustom = Boolean(data.classDivisions?.[cls]?.enabled);
                    const isSel = selectedDivisionClass === cls;
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setSelectedDivisionClass(cls)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                          isSel
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : hasCustom
                            ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <MatIcon name="school" size={12} />
                        <span>{cls}</span>
                        {hasCustom && (
                          <span className="text-[10px] font-black opacity-80">
                            ({data.classDivisions[cls].maxMarks}M)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Subject Divisions List */}
                {selectedDivisionClass === 'ALL' ? (
                  <div className="space-y-3">
                    {/* Live Balance Banner */}
                    <div
                      className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold ${
                        isDefaultBalanced
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-amber-50 text-amber-900 border-amber-200'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <MatIcon
                          name={isDefaultBalanced ? 'check_circle' : 'warning'}
                          size={18}
                          className={isDefaultBalanced ? 'text-emerald-600 shrink-0' : 'text-amber-600 shrink-0'}
                        />
                        <span className="truncate">
                          {isDefaultBalanced
                            ? `Marks Balanced: ${defaultAllocatedMarks} / ${targetTotalMarksNum} Marks`
                            : `Marks Mismatch: Subjects sum to ${defaultAllocatedMarks} vs Target ${targetTotalMarksNum}`}
                        </span>
                      </span>
                      {!isDefaultBalanced && (
                        <button
                          type="button"
                          onClick={() => onUpdate({ totalMarks: String(defaultAllocatedMarks) })}
                          className="flex items-center justify-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-extrabold rounded-lg shadow-2xs transition-colors shrink-0"
                        >
                          <MatIcon name="sync" size={12} />
                          <span>Auto-Sync Target</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {(data.subjectDivisions || []).map((sub, idx) => (
                        <div key={idx} className="flex items-center gap-2 min-w-0">
                          <input
                            type="text"
                            value={sub.subject}
                            onChange={(e) => {
                              const updated = [...data.subjectDivisions];
                              updated[idx] = { ...updated[idx], subject: e.target.value };
                              onUpdate({ subjectDivisions: updated });
                            }}
                            placeholder="Subject Name (e.g. Physics)"
                            className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold outline-none focus:border-indigo-600"
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
                            className="w-16 sm:w-20 shrink-0 px-2 sm:px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-center outline-none focus:border-indigo-600"
                          />
                          {data.subjectDivisions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = data.subjectDivisions.filter((_, i) => i !== idx);
                                onUpdate({ subjectDivisions: updated });
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-colors flex items-center justify-center shrink-0"
                              title="Delete Subject"
                            >
                              <MatIcon name="delete" size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Custom Per-Class Overrides
                  (() => {
                    const clsConfig = data.classDivisions?.[selectedDivisionClass] || {
                      enabled: false,
                      maxMarks: data.totalMarks,
                      subjects: []
                    };
                    const isEnabled = clsConfig.enabled;

                    return (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-purple-50/70 border border-purple-200 rounded-2xl gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-purple-900 block truncate">
                              Custom Marks for Batch {selectedDivisionClass}
                            </span>
                            <span className="text-[11px] text-purple-700 block truncate">
                              Override subject divisions specifically for this batch
                            </span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={(e) => {
                                const en = e.target.checked;
                                onUpdate({
                                  classDivisions: {
                                    ...data.classDivisions,
                                    [selectedDivisionClass]: {
                                      enabled: en,
                                      maxMarks: clsConfig.maxMarks || data.totalMarks,
                                      subjects:
                                        clsConfig.subjects && clsConfig.subjects.length > 0
                                          ? clsConfig.subjects
                                          : JSON.parse(JSON.stringify(data.subjectDivisions || []))
                                    }
                                  }
                                });
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600" />
                          </label>
                        </div>

                        {isEnabled && (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center gap-2">
                              <label className="text-xs font-bold text-slate-700 shrink-0">Batch Max Marks:</label>
                              <input
                                type="text"
                                value={clsConfig.maxMarks}
                                onChange={(e) => {
                                  onUpdate({
                                    classDivisions: {
                                      ...data.classDivisions,
                                      [selectedDivisionClass]: {
                                        ...clsConfig,
                                        maxMarks: e.target.value
                                      }
                                    }
                                  });
                                }}
                                className="w-20 sm:w-24 px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-bold outline-none"
                              />
                            </div>

                            {(clsConfig.subjects || []).map((sub: SubjectDivision, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 min-w-0">
                                <input
                                  type="text"
                                  value={sub.subject}
                                  onChange={(e) => {
                                    const updated = [...clsConfig.subjects];
                                    updated[idx] = { ...updated[idx], subject: e.target.value };
                                    onUpdate({
                                      classDivisions: {
                                        ...data.classDivisions,
                                        [selectedDivisionClass]: { ...clsConfig, subjects: updated }
                                      }
                                    });
                                  }}
                                  placeholder="Subject"
                                  className="flex-1 min-w-0 px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold outline-none"
                                />
                                <input
                                  type="text"
                                  value={sub.marks}
                                  onChange={(e) => {
                                    const updated = [...clsConfig.subjects];
                                    updated[idx] = { ...updated[idx], marks: e.target.value };
                                    onUpdate({
                                      classDivisions: {
                                        ...data.classDivisions,
                                        [selectedDivisionClass]: { ...clsConfig, subjects: updated }
                                      }
                                    });
                                  }}
                                  placeholder="Marks"
                                  className="w-16 shrink-0 px-2 py-1.5 border border-slate-300 rounded-xl text-xs font-bold text-center outline-none"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* CARD 3: TARGET PAPERS MATRIX */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <MatIcon name="layers" size={18} className="text-indigo-600" />
                    <span>3. Target Papers ({targetPapersList.length} Papers)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRawTargets(!showRawTargets)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    <MatIcon name="code" size={14} />
                    <span>{showRawTargets ? 'Visual Mode' : 'Raw Mode'}</span>
                  </button>
                </div>

                {/* Target Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {TARGET_PRESETS.map((tp) => (
                    <button
                      key={tp.label}
                      type="button"
                      onClick={() => onUpdate({ batchesAndSets: tp.value })}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 rounded-xl border border-slate-200 transition-colors"
                    >
                      <MatIcon name="playlist_add" size={14} />
                      <span>{tp.label.split('(')[0].trim()}</span>
                    </button>
                  ))}
                </div>

                {/* Target Variant Chips with Material Icons */}
                {targetPapersList.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {targetPapersList.map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs"
                      >
                        <MatIcon name="label" size={14} className="text-indigo-600" />
                        <span>{t.label}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const remaining = targetPapersList
                              .filter((_, i) => i !== idx)
                              .map((x) => x.label);
                            onUpdate({ batchesAndSets: syncTargetsToText(remaining) });
                          }}
                          className="hover:text-rose-600 flex items-center justify-center"
                          title="Remove Target"
                        >
                          <MatIcon name="close" size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {!showRawTargets ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                      <MatIcon name="tune" size={12} />
                      <span>Add Custom Variant:</span>
                    </span>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={newBatch}
                        onChange={(e) => setNewBatch(e.target.value.toUpperCase())}
                        placeholder="Batch (e.g. B1)"
                        className="w-full sm:w-28 md:w-32 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none uppercase shrink-0"
                      />
                      <select
                        value={newSelectedSet}
                        onChange={(e) => setNewSelectedSet(e.target.value)}
                        className="w-full sm:w-32 md:w-36 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none shrink-0"
                      >
                        {['Set A', 'Set B', 'Set C', 'Set D', 'Set E', 'Single Set (No Set)', 'Custom...'].map((s) => (
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
                          placeholder="Custom Set Name"
                          className="w-full sm:flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none min-w-0"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!newBatch.trim()) return;
                          const chosenSet =
                            newSelectedSet === 'Single Set (No Set)'
                              ? ''
                              : newSelectedSet === 'Custom...'
                              ? customSet.trim()
                              : newSelectedSet;
                          const currentLabels = targetPapersList.map((x) => x.label);
                          const newLabel = chosenSet ? `${newBatch.trim()} - ${chosenSet}` : newBatch.trim();
                          if (!currentLabels.includes(newLabel)) {
                            currentLabels.push(newLabel);
                            onUpdate({ batchesAndSets: syncTargetsToText(currentLabels) });
                          }
                          setCustomSet('');
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
                      >
                        <MatIcon name="add" size={16} />
                        <span>Add Target</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <textarea
                      rows={4}
                      value={data.batchesAndSets}
                      onChange={(e) => onUpdate({ batchesAndSets: e.target.value })}
                      placeholder="B1: Set A, Set B&#10;B2: Set A, Set B"
                      className="w-full p-3 font-mono text-xs border border-slate-300 rounded-2xl outline-none focus:border-indigo-600 bg-slate-50"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Phase 1 Footer Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={onSaveDay}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              <MatIcon name="save" size={16} />
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              onClick={() => switchPhase('SOURCES')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all"
            >
              <span>Next: Question Sources &amp; Materials ({totalMaterials})</span>
              <MatIcon name="arrow_forward" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PHASE 2: QUESTION SOURCES & MATERIALS (ITEMS + ASSETS) */}
      {/* ------------------------------------------------------------- */}
      {(activePhase === 'SOURCES' || activePhase === 'ALL') && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CARD 6: SOURCE QUESTIONS */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <MatIcon name="source" size={18} className="text-indigo-600" />
                  <span>4. Question Source Materials ({sourcesCount} Items)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePasteClipboard('source')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                    title="Paste Image or Document from Clipboard"
                  >
                    <MatIcon name="content_paste" size={14} />
                    <span>Paste</span>
                  </button>
                  <label className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer shadow-xs transition-colors">
                    <MatIcon name="upload_file" size={14} />
                    <span>Upload Images/PDF</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,application/pdf"
                      onChange={handleAddFiles}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Upload Drop Area */}
              {sourcesCount === 0 ? (
                <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center space-y-3 bg-slate-50/50">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                    <MatIcon name="cloud_upload" size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800">Upload Question Sources or Question Images</h4>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Drop images, past papers, or PDFs. Gemini AI will automatically extract and structure questions.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                  {(data.items || []).map((item, idx) => {
                    const isDescribing = describingIds.includes(item.id);
                    const isImageOrPdf = item.type === 'image' || item.type === 'pdf';

                    return (
                      <div
                        key={item.id || idx}
                        className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2.5 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 rounded-lg">
                              {item.type.toUpperCase()}
                            </span>
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {item.filename || `Item #${idx + 1}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {isImageOrPdf && (
                              <button
                                type="button"
                                onClick={() =>
                                  onZoomMedia({
                                    src: item.imageBytes || item.dataUrl || '',
                                    title: item.filename || 'Source Image',
                                    isPdf: item.type === 'pdf'
                                  })
                                }
                                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                                title="Zoom Image"
                              >
                                <MatIcon name="zoom_in" size={16} />
                              </button>
                            )}

                            {isImageOrPdf && (
                              <button
                                type="button"
                                disabled={isDescribing}
                                onClick={() => onAutoDescribeItem(item)}
                                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl transition-colors shadow-2xs"
                                title="Run Gemini Vision OCR description"
                              >
                                {isDescribing ? (
                                  <MatIcon name="sync" size={14} className="animate-spin text-indigo-600" />
                                ) : (
                                  <MatIcon name="auto_awesome" size={14} className="text-amber-500" />
                                )}
                                <span>{isDescribing ? 'Extracting...' : 'AI Describe'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                const updated = data.items.filter((_, i) => i !== idx);
                                onUpdate({ items: updated });
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                              title="Delete Item"
                            >
                              <MatIcon name="delete" size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Text description or raw text */}
                        {item.isText ? (
                          <textarea
                            rows={3}
                            value={item.textContent}
                            onChange={(e) => {
                              const updated = [...data.items];
                              updated[idx] = { ...updated[idx], textContent: e.target.value };
                              onUpdate({ items: updated });
                            }}
                            placeholder="Enter raw question text or LaTeX equations..."
                            className="w-full p-2.5 text-xs font-mono bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-600"
                          />
                        ) : (
                          <textarea
                            rows={2}
                            value={item.description}
                            onChange={(e) => {
                              const updated = [...data.items];
                              updated[idx] = { ...updated[idx], description: e.target.value };
                              onUpdate({ items: updated });
                            }}
                            placeholder="Image description or instructions for question generation..."
                            className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-600"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CARD 7: DIAGRAMS & ASSETS */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <MatIcon name="photo_library" size={18} className="text-indigo-600" />
                  <span>5. Diagrams &amp; Assets ({assetsCount} Files)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePasteClipboard('asset')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
                  >
                    <MatIcon name="content_paste" size={14} /> Paste
                  </button>
                  <label className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer shadow-xs transition-colors">
                    <MatIcon name="add_photo_alternate" size={14} />
                    <span>Upload Diagram</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleAddAssets}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {assetsCount === 0 ? (
                <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center space-y-2 bg-slate-50/50">
                  <MatIcon name="image" size={32} className="text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No Diagrams Uploaded</p>
                  <p className="text-[11px] text-slate-400">
                    Upload standalone images referenced in questions as &lt;img src=&quot;filename.png&quot;&gt;.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
                  {(data.assets || []).map((asset, idx) => (
                    <div
                      key={asset.id || idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                          {asset.filename}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = data.assets.filter((_, i) => i !== idx);
                            onUpdate({ assets: updated });
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <MatIcon name="delete" size={14} />
                        </button>
                      </div>

                      <div className="aspect-video bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                        <img
                          src={asset.bytes || asset.imageBytes}
                          alt={asset.filename}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <input
                        type="text"
                        value={asset.filename}
                        onChange={(e) => {
                          const updated = [...data.assets];
                          updated[idx] = { ...updated[idx], filename: e.target.value };
                          onUpdate({ assets: updated });
                        }}
                        className="w-full px-2 py-1 text-xs font-mono bg-white border border-slate-300 rounded-lg outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Phase 2 Footer Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => switchPhase('BLUEPRINT')}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              <MatIcon name="arrow_back" size={16} />
              <span>Back to Blueprint</span>
            </button>
            <button
              type="button"
              onClick={() => switchPhase('DESIGN')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md transition-all"
            >
              <span>Next: Design &amp; Launchpad</span>
              <MatIcon name="arrow_forward" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PHASE 3: DESIGN TEMPLATES & AI LAUNCHPAD */}
      {/* ------------------------------------------------------------- */}
      {(activePhase === 'DESIGN' || activePhase === 'ALL') && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CARD 4: QP DESIGN TEMPLATE */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                  <MatIcon name="palette" size={18} className="text-indigo-600" />
                  <span>5. QP Design Template ({templates.length} Templates)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const curT = templates.find((t) => t.id === data.templateId) || templates[0];
                      onOpenDesignEditor(curT);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    <MatIcon name="code" size={14} /> Edit HTML
                  </button>
                  <button
                    type="button"
                    onClick={onOpenDartSync}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-600"
                  >
                    <MatIcon name="sync" size={14} /> Sync Dart
                  </button>
                </div>
              </div>

              {/* Layout & Typography settings */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.twoColumn}
                    onChange={(e) => onUpdate({ twoColumn: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <MatIcon name="view_column" size={16} className="text-indigo-600" /> Two-Column Stream Layout
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Renders continuous dual columns like standard high-school entrance papers
                    </span>
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      Base Font Size
                    </span>
                    <select
                      value={data.fontSize}
                      onChange={(e) => onUpdate({ fontSize: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    >
                      {['10px', '11px', '12px', '13px', '14px', '15px', '16px', '18px'].map((sz) => (
                        <option key={sz} value={sz}>
                          {sz}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                      LaTeX Math Size
                    </span>
                    <select
                      value={data.latexSize}
                      onChange={(e) => onUpdate({ latexSize: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    >
                      {['80%', '85%', '90%', '95%', '100%', '105%', '110%', '120%', '130%'].map((ls) => (
                        <option key={ls} value={ls}>
                          {ls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Template Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                {templates.map((t) => {
                  const isSel = data.templateId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => onUpdate({ templateId: t.id })}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                        isSel
                          ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-black text-slate-900 truncate">
                            {t.name}
                          </span>
                          {t.isCustomized && (
                            <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-100 text-amber-800 rounded">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">
                          {t.description || 'Structured examination template'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPreviewTemplate(t);
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <MatIcon name="visibility" size={14} /> Preview
                        </button>
                        {isSel && (
                          <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARD 5 & LAUNCHPAD: PROMPT DIRECTIVES & LAUNCHPAD */}
            <div className="space-y-6">
              {/* CARD 5: AI DIRECTIVES */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                    <MatIcon name="psychology" size={18} className="text-amber-500" />
                    <span>6. AI Directives &amp; Guidelines</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={data.extraInstructions}
                    onChange={(e) => onUpdate({ extraInstructions: e.target.value })}
                    placeholder="Instructions for Gemini: e.g. strictly NEET syllabus, balanced options..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-medium leading-relaxed"
                  />

                  {/* Preset Directive Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'Strict NEET syllabus adherence',
                      'Include step-by-step numericals',
                      'Assertion-Reasoning question format',
                      'Vary options order between Set A & Set B'
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleAddPresetPrompt(chip)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 rounded-xl border border-slate-200 transition-colors"
                      >
                        <MatIcon name="add" size={14} />
                        <span>{chip}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* LAUNCHPAD ACTION CARD */}
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-[#062e5b] p-6 rounded-3xl text-white shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
                      <MatIcon name="bolt" size={14} className="text-amber-300" />
                      <span>Ready to Compile</span>
                    </div>
                    <h4 className="text-lg font-black tracking-tight">Generate All Variants</h4>
                  </div>
                  <span className="text-2xl font-black text-amber-300 font-mono">
                    {targetPapersList.length} Papers
                  </span>
                </div>

                <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                  Compiles Dart template &ldquo;{data.templateId}&rdquo; with {data.totalMarks} marks, {data.duration} mins duration, and distributes unique question permutations across all target batches.
                </p>

                <button
                  type="button"
                  onClick={onGenerate}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <MatIcon name="sync" size={18} className="animate-spin" />
                      <span>Generating Question Papers...</span>
                    </>
                  ) : (
                    <>
                      <MatIcon name="rocket_launch" size={18} />
                      <span>Launch &amp; Compile All Papers Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Phase 3 Footer Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={() => switchPhase('SOURCES')}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              <MatIcon name="arrow_back" size={16} />
              <span>Back to Sources</span>
            </button>
            <button
              type="button"
              onClick={onSaveDay}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <MatIcon name="save" size={16} />
              <span>Save Day</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}