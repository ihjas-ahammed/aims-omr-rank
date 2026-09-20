import React, { useState, useEffect, useMemo } from 'react';
import MatIcon from './MatIcon';
import { format } from 'date-fns';
import {
  QPMakerDayData,
  QPItem,
  QPAsset,
  GeneratedPaper,
  SubjectDivision
} from './types';
import {
  QpTemplate,
  getSavedTemplates,
  saveCustomTemplate,
  resetCustomTemplate
} from './defaultDartTemplates';
import QPMakerDaysList from './QPMakerDaysList';
import QPMakerForm from './QPMakerForm';
import QPMakerPaperViewer from './QPMakerPaperViewer';
import {
  TemplatePreviewModal,
  DesignEditorModal,
  QuestionEditorDialog,
  SectionEditorDialog,
  ImageZoomModal,
  DartSyncModal
} from './QPMakerModals';
import {
  generateQuestionPaperTask,
  generateImageDescription
} from '../../../services/gemini/qpMakerService';

const defaultDayData: QPMakerDayData = {
  date: format(new Date(), 'dd/MM/yyyy'),
  subtitle: 'Daily Examination',
  duration: '30',
  totalMarks: '15',
  subjectDivisions: [{ id: '1', subject: 'Physics', marks: '15' }],
  classDivisions: {},
  batchesAndSets: 'B1: Set A, Set B\nB2: Set A, Set B',
  extraInstructions: 'Ensure questions adhere strictly to the target syllabus.',
  templateId: 'elegant',
  twoColumn: false,
  fontSize: '13px',
  latexSize: '100%',
  items: [],
  assets: [],
  generatedPapers: []
};

type ViewMode = 'DAYS_LIST' | 'DAY_EDITOR' | 'PAPER_VIEWER';

export default function QPMaker({ onBack }: { onBack: () => void }) {
  // Master View Mode
  const [viewMode, setViewMode] = useState<ViewMode>('DAY_EDITOR');

  // Days state
  const [days, setDays] = useState<number[]>(() => {
    const saved = localStorage.getItem('qp_days');
    return saved ? JSON.parse(saved) : [1];
  });
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const saved = localStorage.getItem('qp_currentDay');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [dataByDay, setDataByDay] = useState<Record<number, QPMakerDayData>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Active Paper Index for PAPER_VIEWER
  const [activePaperIdx, setActivePaperIdx] = useState(0);

  // Templates
  const [templates, setTemplates] = useState<QpTemplate[]>(() => getSavedTemplates());

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState({
    current: 0,
    total: 0,
    target: '',
    percent: 0
  });

  // Describing IDs
  const [describingIds, setDescribingIds] = useState<string[]>([]);

  // Modals state
  const [previewTemplateModal, setPreviewTemplateModal] = useState<{
    open: boolean;
    template: QpTemplate | null;
  }>({ open: false, template: null });

  const [designEditorModal, setDesignEditorModal] = useState<{
    open: boolean;
    template: QpTemplate | null;
  }>({ open: false, template: null });

  const [editQuestionDialog, setEditQuestionDialog] = useState<{
    open: boolean;
    sectionIdx: number;
    questionIdx: number;
    number: string;
    text: string;
    marks: string;
    sectionBadge: string;
    sectionTitle: string;
  }>({
    open: false,
    sectionIdx: -1,
    questionIdx: -1,
    number: '1',
    text: '',
    marks: '1',
    sectionBadge: '',
    sectionTitle: ''
  });

  const [editSectionDialog, setEditSectionDialog] = useState<{
    open: boolean;
    sectionIdx: number;
    badge: string;
    title: string;
    instruction: string;
  }>({
    open: false,
    sectionIdx: -1,
    badge: '',
    title: '',
    instruction: ''
  });

  const [imageZoomModal, setImageZoomModal] = useState<{
    open: boolean;
    src: string;
    title: string;
    isPdf: boolean;
  }>({
    open: false,
    src: '',
    title: '',
    isPdf: false
  });

  const [dartSyncModalOpen, setDartSyncModalOpen] = useState(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const loadedData: Record<number, QPMakerDayData> = {};
    for (const day of days) {
      const saved = localStorage.getItem(`qp_data_${day}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          loadedData[day] = {
            ...defaultDayData,
            ...parsed,
            items: parsed.items || [],
            assets: parsed.assets || [],
            generatedPapers: parsed.generatedPapers || []
          };
        } catch (e) {
          loadedData[day] = { ...defaultDayData };
        }
      } else {
        loadedData[day] = { ...defaultDayData };
      }
    }
    setDataByDay(loadedData);
    setIsLoaded(true);
  }, []);

  // 2. Persist Days & Selected Day
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('qp_days', JSON.stringify(days));
    localStorage.setItem('qp_currentDay', selectedDay.toString());
  }, [days, selectedDay, isLoaded]);

  // 3. Persist Data of current day
  const saveDayData = (dayNum: number, dayData: QPMakerDayData) => {
    localStorage.setItem(`qp_data_${dayNum}`, JSON.stringify(dayData));
  };

  const updateCurrentDayData = (newData: Partial<QPMakerDayData>) => {
    setDataByDay((prev) => {
      const current = prev[selectedDay] || { ...defaultDayData };
      const updated = { ...current, ...newData };
      saveDayData(selectedDay, updated);
      return { ...prev, [selectedDay]: updated };
    });
  };

  // 4. Global Paste Listener
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const files = clipboardData.files;
      if (files && files.length > 0) {
        e.preventDefault();
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const isPdf =
            file.type === 'application/pdf' ||
            (file.name && file.name.toLowerCase().endsWith('.pdf'));
          const mime = isPdf ? 'application/pdf' : file.type || 'image/png';
          const reader = new FileReader();
          reader.onload = (evt) => {
            const b64 = evt.target?.result as string;
            const newItem: QPItem = {
              id: 'i_' + Date.now() + '_' + i,
              type: isPdf ? 'pdf' : 'image',
              filename: file.name || (isPdf ? `pasted_doc_${i + 1}.pdf` : `pasted_image_${i + 1}.png`),
              description: isPdf ? `PDF Source: ${file.name || 'document.pdf'}` : '',
              imageBytes: b64,
              dataUrl: b64,
              mimeType: mime
            };
            setDataByDay((prev) => {
              const cur = prev[selectedDay] || { ...defaultDayData };
              const updated = { ...cur, items: [...(cur.items || []), newItem] };
              saveDayData(selectedDay, updated);
              return { ...prev, [selectedDay]: updated };
            });
          };
          reader.readAsDataURL(file);
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [selectedDay]);

  // Day Operations
  const handleAddDay = () => {
    const nextDay = days.length > 0 ? Math.max(...days) + 1 : 1;
    const newDays = [...days, nextDay];
    const newDayObj = { ...defaultDayData };
    setDays(newDays);
    setDataByDay((prev) => ({ ...prev, [nextDay]: newDayObj }));
    saveDayData(nextDay, newDayObj);
    setSelectedDay(nextDay);
    setViewMode('DAY_EDITOR');
  };

  const handleDuplicateDay = (dayToDup: number) => {
    const source = dataByDay[dayToDup] || defaultDayData;
    const nextDay = days.length > 0 ? Math.max(...days) + 1 : 1;
    const clonedData: QPMakerDayData = JSON.parse(JSON.stringify(source));
    clonedData.generatedPapers = []; // Reset generated papers for new day

    const newDays = [...days, nextDay];
    setDays(newDays);
    setDataByDay((prev) => ({ ...prev, [nextDay]: clonedData }));
    saveDayData(nextDay, clonedData);
    setSelectedDay(nextDay);
    setViewMode('DAY_EDITOR');
  };

  const handleDeleteDay = (dayToDelete: number) => {
    if (days.length <= 1) {
      alert('You must keep at least one examination day.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete Day ${dayToDelete}?`)) return;

    const newDays = days.filter((d) => d !== dayToDelete);
    setDays(newDays);
    setDataByDay((prev) => {
      const copy = { ...prev };
      delete copy[dayToDelete];
      return copy;
    });
    localStorage.removeItem(`qp_data_${dayToDelete}`);

    if (selectedDay === dayToDelete) {
      setSelectedDay(newDays[0]);
    }
  };

  // Template custom design HTML operations
  const handleSaveDesignHtml = (templateId: string, customHtml: string) => {
    saveCustomTemplate(templateId, customHtml);
    setTemplates(getSavedTemplates());
  };

  const handleResetDesignHtml = (templateId: string) => {
    resetCustomTemplate(templateId);
    setTemplates(getSavedTemplates());
  };

  // Auto-describe handler
  const handleAutoDescribeItem = async (item: QPItem) => {
    const b64 = item.imageBytes || item.dataUrl;
    if (!b64) return;

    setDescribingIds((prev) => [...prev, item.id]);
    try {
      const apiKeysStr = localStorage.getItem('omr_apiKeysList');
      const apiKeys = apiKeysStr ? JSON.parse(apiKeysStr) : [];
      const model = localStorage.getItem('omr_proModel') || 'gemini-2.5-flash';

      const desc = await generateImageDescription(
        b64,
        item.mimeType || 'image/png',
        apiKeys,
        model
      );

      const current = dataByDay[selectedDay] || defaultDayData;
      const updatedItems = (current.items || []).map((it) =>
        it.id === item.id ? { ...it, description: desc } : it
      );
      updateCurrentDayData({ items: updatedItems });
    } catch (err: any) {
      console.error('Auto describe failed:', err);
      alert('Could not auto-describe image: ' + err.message);
    } finally {
      setDescribingIds((prev) => prev.filter((id) => id !== item.id));
    }
  };

  // Generation Handler
  const handleGeneratePapers = async () => {
    const currentData = dataByDay[selectedDay] || defaultDayData;

    // Parse targets
    const lines = (currentData.batchesAndSets || '').split('\n');
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

    const targetList: { batch: string; set: string; label: string; hideSet: boolean }[] = [];
    for (const [batch, sets] of Object.entries(batchSetsMap)) {
      if (sets.length === 0) {
        targetList.push({ batch, set: '', label: batch, hideSet: true });
      } else if (sets.length === 1) {
        targetList.push({ batch, set: sets[0], label: `${batch} - ${sets[0]}`, hideSet: true });
      } else {
        for (const set of sets) {
          targetList.push({ batch, set, label: `${batch} - ${set}`, hideSet: false });
        }
      }
    }

    if (targetList.length === 0) {
      alert('No target batches and sets configured.');
      return;
    }
    if (!currentData.items || currentData.items.length === 0) {
      alert('Please add at least one question source (Images, PDF document, or text block).');
      return;
    }

    const apiKeysStr = localStorage.getItem('omr_apiKeysList');
    const apiKeys = apiKeysStr ? JSON.parse(apiKeysStr) : [];
    if (!apiKeys || apiKeys.length === 0) {
      alert('No Google AI Gemini API keys found. Please configure them in Settings.');
      return;
    }

    const modelName = localStorage.getItem('omr_proModel') || 'gemini-2.5-flash';

    setIsGenerating(true);
    setGenerateProgress({ current: 0, total: targetList.length, target: targetList[0].label, percent: 5 });

    const newPapers: GeneratedPaper[] = [...(currentData.generatedPapers || [])];

    for (let i = 0; i < targetList.length; i++) {
      const target = targetList[i];
      const percent = Math.round((i / targetList.length) * 100);
      setGenerateProgress({
        current: i,
        total: targetList.length,
        target: target.label,
        percent: Math.max(5, percent)
      });

      const batchCount = targetList.filter((t) => t.batch === target.batch).length;
      const isSingleSet =
        target.hideSet || !target.set || target.set === 'None' || target.set.trim() === '' || batchCount <= 1;

      // Class override check
      const classDiv = currentData.classDivisions?.[target.batch];
      const hasCustom = classDiv && classDiv.enabled;
      const effectiveMarks = hasCustom && classDiv.maxMarks ? classDiv.maxMarks : currentData.totalMarks;
      const effectiveSubjects =
        hasCustom && classDiv.subjects && classDiv.subjects.length > 0
          ? classDiv.subjects
          : currentData.subjectDivisions;

      try {
        const generatedPaper = await generateQuestionPaperTask({
          targetName: target.label,
          templateId: currentData.templateId || 'elegant',
          date: currentData.date,
          duration: currentData.duration,
          marks: effectiveMarks,
          subtitle: currentData.subtitle,
          instructions: currentData.extraInstructions,
          subjects: effectiveSubjects,
          items: currentData.items,
          assets: currentData.assets,
          fontSize: currentData.fontSize,
          latexSize: currentData.latexSize,
          twoColumn: currentData.twoColumn,
          hideSet: isSingleSet,
          setCount: batchCount || 1,
          apiKeys,
          modelName,
          customTemplates: templates
        });

        // Add or replace
        const existingIdx = newPapers.findIndex(
          (p) => p.filename === generatedPaper.filename || `${p.batch} - ${p.set}` === target.label
        );
        if (existingIdx >= 0) {
          newPapers[existingIdx] = generatedPaper;
        } else {
          newPapers.push(generatedPaper);
        }
      } catch (err: any) {
        console.error(`Failed to generate ${target.label}:`, err);
        alert(`Failed to generate ${target.label}: ${err.message}`);
      }
    }

    updateCurrentDayData({ generatedPapers: newPapers });
    setIsGenerating(false);
    setGenerateProgress({ current: targetList.length, total: targetList.length, target: '', percent: 100 });

    if (newPapers.length > 0) {
      setActivePaperIdx(0);
      setViewMode('PAPER_VIEWER');
    }
  };

  // Structured Question Dialog Save
  const handleSaveEditedQuestion = (
    sectionIdx: number,
    questionIdx: number,
    number: string,
    text: string,
    marks: string
  ) => {
    const curPaper = currentData.generatedPapers?.[activePaperIdx];
    if (!curPaper) return;

    const sections = JSON.parse(JSON.stringify(curPaper.sections || []));
    if (sections[sectionIdx]?.questions?.[questionIdx]) {
      sections[sectionIdx].questions[questionIdx] = {
        ...sections[sectionIdx].questions[questionIdx],
        number,
        text,
        marks
      };
      const updatedPapers = [...currentData.generatedPapers];
      updatedPapers[activePaperIdx] = { ...curPaper, sections };
      updateCurrentDayData({ generatedPapers: updatedPapers });
    }
  };

  // Section Header Dialog Save
  const handleSaveEditedSection = (
    sectionIdx: number,
    badge: string,
    title: string,
    instruction: string
  ) => {
    const curPaper = currentData.generatedPapers?.[activePaperIdx];
    if (!curPaper) return;

    const sections = JSON.parse(JSON.stringify(curPaper.sections || []));
    if (sections[sectionIdx]) {
      sections[sectionIdx] = {
        ...sections[sectionIdx],
        badge: badge.trim(),
        title: title.trim(),
        instruction: instruction.trim()
      };
      const updatedPapers = [...currentData.generatedPapers];
      updatedPapers[activePaperIdx] = { ...curPaper, sections };
      updateCurrentDayData({ generatedPapers: updatedPapers });
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-gray-500 font-medium">
        <MatIcon name="sync" size={20} className="animate-spin mr-2 text-indigo-600" />
        <span>Loading Question Paper Studio...</span>
      </div>
    );
  }

  const currentData = dataByDay[selectedDay] || defaultDayData;
  const papersCount = (currentData.generatedPapers || []).length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 pb-16 px-1.5 sm:px-4 overflow-x-hidden">
      {/* Top Main Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 w-full min-w-0">
        {/* Title & Back */}
        <div className="flex items-center gap-2.5 min-w-0 max-w-full">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 bg-white shadow-xs text-slate-700 flex items-center justify-center shrink-0"
            title="Return to Lab"
          >
            <MatIcon name="arrow_back" size={20} />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl shadow-sm flex items-center justify-center shrink-0">
              <MatIcon name="menu_book" size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate">
                  Question Paper Studio
                </h2>
                <button
                  type="button"
                  onClick={() => setDartSyncModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200 transition-colors shrink-0"
                  title="View & sync Dart-ported question paper templates"
                >
                  <MatIcon name="auto_awesome" size={14} className="text-indigo-500" />
                  <span>{templates.length} Templates</span>
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                Structured Question Paper Generator &amp; Multi-Set Compiler
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher & Day Selector */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end min-w-0">
          {/* Direct Day Selector Dropdown when in Editor or Viewer */}
          {days.length > 1 && viewMode !== 'DAYS_LIST' && (
            <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs shrink-0">
              <MatIcon name="calendar_month" size={16} className="text-indigo-600 shrink-0" />
              <select
                value={selectedDay}
                onChange={(e) => {
                  const newDay = parseInt(e.target.value, 10);
                  setSelectedDay(newDay);
                  setActivePaperIdx(0);
                }}
                className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    Day {d} {dataByDay[d]?.date ? `(${dataByDay[d].date})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* View Mode Switcher Pills */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto max-w-full">
            <button
              onClick={() => setViewMode('DAYS_LIST')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                viewMode === 'DAYS_LIST'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Exam Days List"
            >
              <MatIcon name="calendar_view_day" size={16} />
              <span className="hidden sm:inline">Days</span>
              <span>({days.length})</span>
            </button>

            <button
              onClick={() => setViewMode('DAY_EDITOR')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                viewMode === 'DAY_EDITOR'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={`Day ${selectedDay} Configuration`}
            >
              <MatIcon name="tune" size={16} />
              <span>Day {selectedDay}</span>
            </button>

            {papersCount > 0 && (
              <button
                onClick={() => setViewMode('PAPER_VIEWER')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  viewMode === 'PAPER_VIEWER'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60'
                }`}
                title="View Generated Question Papers"
              >
                <MatIcon name="description" size={16} className="text-amber-600" />
                <span className="hidden sm:inline">Papers</span>
                <span>({papersCount})</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ----------------- VIEW 1: DAYS LIST ----------------- */}
      {viewMode === 'DAYS_LIST' && (
        <QPMakerDaysList
          days={days}
          dataByDay={dataByDay}
          onSelectDay={(dayNum) => {
            setSelectedDay(dayNum);
            setViewMode('DAY_EDITOR');
          }}
          onAddDay={handleAddDay}
          onDuplicateDay={handleDuplicateDay}
          onDeleteDay={handleDeleteDay}
          onOpenViewer={(dayNum) => {
            setSelectedDay(dayNum);
            setActivePaperIdx(0);
            setViewMode('PAPER_VIEWER');
          }}
        />
      )}

      {/* ----------------- VIEW 2: DAY SETUP & CONFIG ----------------- */}
      {viewMode === 'DAY_EDITOR' && (
        <QPMakerForm
          dayNum={selectedDay}
          data={currentData}
          templates={templates}
          isGenerating={isGenerating}
          generateProgress={generateProgress}
          onUpdate={updateCurrentDayData}
          onSaveDay={() => {
            saveDayData(selectedDay, currentData);
            alert(`Day ${selectedDay} configuration saved!`);
          }}
          onGenerate={handleGeneratePapers}
          onOpenPreviewTemplate={(tmpl) => setPreviewTemplateModal({ open: true, template: tmpl })}
          onOpenDesignEditor={(tmpl) => setDesignEditorModal({ open: true, template: tmpl })}
          onOpenDartSync={() => setDartSyncModalOpen(true)}
          onZoomMedia={(params) =>
            setImageZoomModal({ open: true, src: params.src, title: params.title, isPdf: Boolean(params.isPdf) })
          }
          onAutoDescribeItem={handleAutoDescribeItem}
          describingIds={describingIds}
        />
      )}

      {/* ----------------- VIEW 3: LIVE VIEWER & QUESTION EDITOR ----------------- */}
      {viewMode === 'PAPER_VIEWER' && (
        <QPMakerPaperViewer
          papers={currentData.generatedPapers || []}
          activePaperIdx={activePaperIdx}
          templates={templates}
          assets={currentData.assets || []}
          date={currentData.date}
          duration={currentData.duration}
          totalMarks={currentData.totalMarks}
          subtitle={currentData.subtitle}
          onSelectPaper={(idx) => setActivePaperIdx(idx)}
          onUpdatePaper={(updatedPaper) => {
            const updated = [...(currentData.generatedPapers || [])];
            updated[activePaperIdx] = updatedPaper;
            updateCurrentDayData({ generatedPapers: updated });
          }}
          onOpenDesignEditor={(tmpl) => setDesignEditorModal({ open: true, template: tmpl })}
          onOpenDartSync={() => setDartSyncModalOpen(true)}
          onOpenEditQuestion={(params) => setEditQuestionDialog({ open: true, ...params })}
          onOpenEditSection={(params) => setEditSectionDialog({ open: true, ...params })}
        />
      )}

      {/* ----------------- MODALS ----------------- */}
      <TemplatePreviewModal
        open={previewTemplateModal.open}
        template={previewTemplateModal.template}
        onClose={() => setPreviewTemplateModal({ open: false, template: null })}
        onSelectTemplate={(templateId) => updateCurrentDayData({ templateId })}
      />

      <DesignEditorModal
        open={designEditorModal.open}
        template={designEditorModal.template}
        onClose={() => setDesignEditorModal({ open: false, template: null })}
        onSave={handleSaveDesignHtml}
        onReset={handleResetDesignHtml}
      />

      <QuestionEditorDialog
        open={editQuestionDialog.open}
        sectionIdx={editQuestionDialog.sectionIdx}
        questionIdx={editQuestionDialog.questionIdx}
        number={editQuestionDialog.number}
        text={editQuestionDialog.text}
        marks={editQuestionDialog.marks}
        sectionBadge={editQuestionDialog.sectionBadge}
        sectionTitle={editQuestionDialog.sectionTitle}
        onClose={() => setEditQuestionDialog((prev) => ({ ...prev, open: false }))}
        onSave={handleSaveEditedQuestion}
      />

      <SectionEditorDialog
        open={editSectionDialog.open}
        sectionIdx={editSectionDialog.sectionIdx}
        badge={editSectionDialog.badge}
        title={editSectionDialog.title}
        instruction={editSectionDialog.instruction}
        onClose={() => setEditSectionDialog((prev) => ({ ...prev, open: false }))}
        onSave={handleSaveEditedSection}
      />

      <ImageZoomModal
        open={imageZoomModal.open}
        src={imageZoomModal.src}
        title={imageZoomModal.title}
        isPdf={imageZoomModal.isPdf}
        onClose={() => setImageZoomModal((prev) => ({ ...prev, open: false }))}
      />

      <DartSyncModal
        open={dartSyncModalOpen}
        onClose={() => setDartSyncModalOpen(false)}
        onParsedTemplates={(parsed) => {
          setTemplates(parsed);
          alert(`Successfully extracted ${parsed.length} templates from Dart!`);
        }}
      />
    </div>
  );
}