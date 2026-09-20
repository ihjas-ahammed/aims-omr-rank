import React, { useState, useEffect, useMemo } from 'react';
import MatIcon from './MatIcon';
import { GeneratedPaper, QPSection, QPAsset } from './types';
import { QpTemplate } from './defaultDartTemplates';
import { compileQpHtml } from './qpCompiler';

interface QPMakerPaperViewerProps {
  papers: GeneratedPaper[];
  activePaperIdx: number;
  templates: QpTemplate[];
  assets: QPAsset[];
  date: string;
  duration: string;
  totalMarks: string;
  subtitle: string;
  onSelectPaper: (idx: number) => void;
  onUpdatePaper: (updatedPaper: GeneratedPaper) => void;
  onOpenDesignEditor: (template: QpTemplate) => void;
  onOpenDartSync: () => void;
  onOpenEditQuestion: (params: {
    sectionIdx: number;
    questionIdx: number;
    number: string;
    text: string;
    marks: string;
    sectionBadge: string;
    sectionTitle: string;
  }) => void;
  onOpenEditSection: (params: {
    sectionIdx: number;
    badge: string;
    title: string;
    instruction: string;
  }) => void;
}

export default function QPMakerPaperViewer({
  papers,
  activePaperIdx,
  templates,
  assets,
  date,
  duration,
  totalMarks,
  subtitle,
  onSelectPaper,
  onUpdatePaper,
  onOpenDesignEditor,
  onOpenDartSync,
  onOpenEditQuestion,
  onOpenEditSection
}: QPMakerPaperViewerProps) {
  // Mobile active tab: 'questions' | 'preview'
  const [mobileTab, setMobileTab] = useState<'questions' | 'preview'>('preview');

  // Desktop sidebar collapse for distraction-free full canvas
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Search filter for questions in navigator
  const [searchFilter, setSearchFilter] = useState('');

  // Collapsed sections map
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});

  // Zoom & duplex
  const [zoomScale, setZoomScale] = useState(1.0);
  const [duplex, setDuplex] = useState(false);
  const [compiledHtml, setCompiledHtml] = useState('');
  const [copied, setCopied] = useState(false);

  // Drag & drop question reordering state
  const [dragged, setDragged] = useState<{ sectionIdx: number; questionIdx: number } | null>(null);
  const [dragOver, setDragOver] = useState<{
    sectionIdx: number;
    questionIdx: number | null;
    position: 'before' | 'after' | 'inside';
  } | null>(null);

  const activePaper = papers[activePaperIdx] || papers[0];

  const currentTemplateId = activePaper?.templateId || 'elegant';
  const currentFontSize = activePaper?.fontSize || '13px';
  const currentLatexSize = activePaper?.latexSize || '100%';
  const currentTwoCol = activePaper?.twoColumn !== undefined ? activePaper.twoColumn : false;

  // Build assetSources
  const assetSources = useMemo(() => {
    const map: Record<string, string> = {};
    for (const a of assets) {
      const b64 = a.bytes || a.imageBytes;
      const mime = a.mimeType || 'image/png';
      if (a.filename && b64) {
        map[a.filename] = b64.startsWith('data:') ? b64 : `data:${mime};base64,${b64}`;
      }
    }
    return map;
  }, [assets]);

  // Aggregate paper metrics
  const totalPaperQuestions = useMemo(() => {
    return activePaper?.sections?.reduce((s, sec) => s + (sec.questions?.length || 0), 0) || 0;
  }, [activePaper]);

  const calculatedTotalMarks = useMemo(() => {
    return (
      activePaper?.sections?.reduce((s, sec) => {
        return (
          s +
          (sec.questions?.reduce((qSum, q) => qSum + (parseFloat(q.marks) || 0), 0) || 0)
        );
      }, 0) || 0
    );
  }, [activePaper]);

  // Recompile active paper HTML whenever controls or active paper changes
  useEffect(() => {
    if (!activePaper) return;

    const batchCount = papers.filter((p) => p.batch === activePaper.batch).length;
    const isSingleSet =
      activePaper.hideSet !== undefined
        ? activePaper.hideSet
        : !activePaper.set ||
          activePaper.set.trim() === '' ||
          activePaper.set.toLowerCase() === 'none' ||
          batchCount <= 1;

    const html = compileQpHtml({
      templateId: currentTemplateId,
      sections: activePaper.sections || [],
      batch: activePaper.batch || 'B1',
      setLabel: activePaper.set || 'Set A',
      date: activePaper.date || date,
      duration: activePaper.duration || duration,
      marks: activePaper.totalMarks || totalMarks,
      subtitle: activePaper.subtitle || subtitle,
      scale: zoomScale,
      duplicateForDuplex: duplex,
      assetSources,
      hideSet: isSingleSet,
      setCount: batchCount || 1,
      twoColumn: currentTwoCol,
      fontSize: currentFontSize,
      latexSize: currentLatexSize,
      templates
    });

    setCompiledHtml(html);
  }, [
    activePaper,
    currentTemplateId,
    currentFontSize,
    currentLatexSize,
    currentTwoCol,
    zoomScale,
    duplex,
    assetSources,
    date,
    duration,
    totalMarks,
    subtitle,
    templates,
    papers
  ]);

  if (!activePaper) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-2">
        <MatIcon name="description" size={36} className="text-slate-300" />
        <span className="font-semibold text-sm">No generated question papers available to view.</span>
      </div>
    );
  }

  // Quick switch template
  const handleSwitchTemplate = (newTemplateId: string) => {
    const updated: GeneratedPaper = {
      ...activePaper,
      templateId: newTemplateId
    };
    onUpdatePaper(updated);
  };

  // Quick switch font size
  const handleSwitchFontSize = (newSize: string) => {
    const updated: GeneratedPaper = {
      ...activePaper,
      fontSize: newSize
    };
    onUpdatePaper(updated);
  };

  // Quick switch latex size
  const handleSwitchLatexSize = (newSize: string) => {
    const updated: GeneratedPaper = {
      ...activePaper,
      latexSize: newSize
    };
    onUpdatePaper(updated);
  };

  // Quick switch 2-col
  const handleToggleTwoCol = (val: boolean) => {
    const updated: GeneratedPaper = {
      ...activePaper,
      twoColumn: val
    };
    onUpdatePaper(updated);
  };

  // Move Question Nudge Up / Down
  const handleMoveQuestion = (sectionIdx: number, questionIdx: number, direction: number) => {
    const sections: QPSection[] = JSON.parse(JSON.stringify(activePaper.sections || []));
    const questions = sections[sectionIdx]?.questions;
    if (!questions) return;

    const newIdx = questionIdx + direction;
    if (newIdx < 0 || newIdx >= questions.length) return;

    const temp = questions[questionIdx];
    questions[questionIdx] = questions[newIdx];
    questions[newIdx] = temp;

    // Renumber sequentially 1, 2, 3...
    questions.forEach((q, idx) => {
      q.number = String(idx + 1);
    });

    onUpdatePaper({
      ...activePaper,
      sections
    });
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, sectionIdx: number, questionIdx: number) => {
    setDragged({ sectionIdx, questionIdx });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, sectionIdx: number, questionIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragged) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const position = offset < rect.height / 2 ? 'before' : 'after';

    if (
      !dragOver ||
      dragOver.sectionIdx !== sectionIdx ||
      dragOver.questionIdx !== questionIdx ||
      dragOver.position !== position
    ) {
      setDragOver({ sectionIdx, questionIdx, position });
    }
  };

  const handleSectionDragOver = (e: React.DragEvent, sectionIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragged) return;

    const sec = activePaper.sections?.[sectionIdx];
    if (!sec || !sec.questions || sec.questions.length === 0) {
      if (!dragOver || dragOver.sectionIdx !== sectionIdx || dragOver.questionIdx !== null) {
        setDragOver({ sectionIdx, questionIdx: null, position: 'inside' });
      }
    }
  };

  const handleDrop = (e: React.DragEvent, targetSectionIdx: number, targetQuestionIdx: number | null) => {
    e.preventDefault();
    if (!dragged) return;

    const srcSIdx = dragged.sectionIdx;
    const srcQIdx = dragged.questionIdx;

    const sections: QPSection[] = JSON.parse(JSON.stringify(activePaper.sections || []));
    if (!sections[srcSIdx]?.questions?.[srcQIdx]) {
      setDragged(null);
      setDragOver(null);
      return;
    }

    const [moved] = sections[srcSIdx].questions.splice(srcQIdx, 1);
    if (!sections[targetSectionIdx]) {
      setDragged(null);
      setDragOver(null);
      return;
    }

    if (!sections[targetSectionIdx].questions) {
      sections[targetSectionIdx].questions = [];
    }

    let insertIdx =
      targetQuestionIdx !== null ? targetQuestionIdx : sections[targetSectionIdx].questions.length;

    if (dragOver && dragOver.position === 'after' && targetQuestionIdx !== null) {
      if (srcSIdx === targetSectionIdx && srcQIdx < targetQuestionIdx) {
        insertIdx = targetQuestionIdx;
      } else {
        insertIdx = targetQuestionIdx + 1;
      }
    } else if (srcSIdx === targetSectionIdx && srcQIdx < targetQuestionIdx) {
      insertIdx = Math.max(0, targetQuestionIdx - 1);
    }

    insertIdx = Math.max(0, Math.min(insertIdx, sections[targetSectionIdx].questions.length));
    sections[targetSectionIdx].questions.splice(insertIdx, 0, moved);

    // Sequentially renumber questions (1, 2, 3...)
    sections.forEach((sec) => {
      sec.questions?.forEach((q, idx) => {
        q.number = String(idx + 1);
      });
    });

    onUpdatePaper({
      ...activePaper,
      sections
    });

    setDragged(null);
    setDragOver(null);
  };

  // Actions
  const handleOpenNewWindow = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(compiledHtml);
      win.document.close();
    }
  };

  const handlePrint = () => {
    const iframe = document.getElementById('qp-preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    } else {
      handleOpenNewWindow();
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([compiledHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activePaper.filename || `${activePaper.batch}_${activePaper.set}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(compiledHtml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleSectionCollapse = (sIdx: number) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sIdx]: !prev[sIdx]
    }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[620px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. TOP STUDIO TOOLBAR (ICON-FIRST WITH MATERIAL ICONS)                    */}
      {/* ========================================================================= */}
      <div className="p-2.5 sm:px-4 border-b border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        {/* Left: Paper Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar max-w-full pb-1 sm:pb-0">
          {papers.map((p, idx) => {
            const batchCount = papers.filter((o) => o.batch === p.batch).length;
            const isSingle =
              p.hideSet || !p.set || p.set === 'None' || p.set.trim() === '' || batchCount <= 1;
            const tabLabel = isSingle ? p.batch : `${p.batch} • ${p.set}`;
            const isSel = idx === activePaperIdx;
            const qCount =
              p.sections?.reduce((s, sec) => s + (sec.questions?.length || 0), 0) || 0;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectPaper(idx)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-600/30'
                    : 'bg-white text-slate-700 hover:bg-slate-100/90 border border-slate-200/90 shadow-2xs hover:border-slate-300'
                }`}
              >
                <MatIcon
                  name="description"
                  size={16}
                  className={isSel ? 'text-indigo-200' : 'text-slate-400 group-hover:text-indigo-600'}
                />
                <span>{tabLabel}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold transition-colors ${
                    isSel ? 'bg-indigo-700/90 text-indigo-100' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {qCount}Q
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Segmented Toggle */}
        <div className="flex md:hidden items-center bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold w-full justify-center">
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'preview'
                ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MatIcon name="visibility" size={16} />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('questions')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === 'questions'
                ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MatIcon name="format_list_bulleted" size={16} />
            <span>Questions ({totalPaperQuestions})</span>
          </button>
        </div>

        {/* Controls Toolbar Clusters */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Cluster 1: Template & Code */}
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-2xs">
            <MatIcon name="palette" size={18} className="text-indigo-600" />
            <select
              value={currentTemplateId}
              onChange={(e) => handleSwitchTemplate(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer max-w-[130px] truncate"
              title="Switch Dart CSS/HTML Design Template"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.isCustomized ? '(Custom)' : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                const curT = templates.find((t) => t.id === currentTemplateId) || templates[0];
                onOpenDesignEditor(curT);
              }}
              title="Edit Design HTML/CSS Permanently"
              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center"
            >
              <MatIcon name="code" size={16} />
            </button>
            <button
              type="button"
              onClick={onOpenDartSync}
              title="Sync latest templates from Dart"
              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center"
            >
              <MatIcon name="sync" size={16} />
            </button>
          </div>

          {/* Cluster 2: Typography & LaTeX Scaling */}
          <div className="hidden lg:flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
            <MatIcon name="format_size" size={16} className="text-slate-500" title="Font Size" />
            <select
              value={currentFontSize}
              onChange={(e) => handleSwitchFontSize(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              title="Font Size"
            >
              {['10px', '11px', '12px', '13px', '14px', '15px', '16px', '18px'].map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
            <div className="w-px h-3.5 bg-slate-200 mx-0.5" />
            <MatIcon name="functions" size={16} className="text-slate-500" title="LaTeX Size" />
            <select
              value={currentLatexSize}
              onChange={(e) => handleSwitchLatexSize(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              title="LaTeX Formula Scale"
            >
              {['80%', '85%', '90%', '95%', '100%', '105%', '110%', '120%', '130%'].map((ls) => (
                <option key={ls} value={ls}>
                  {ls}
                </option>
              ))}
            </select>
          </div>

          {/* Cluster 3: Layout Toggle Pills with Material Icons */}
          <button
            type="button"
            onClick={() => handleToggleTwoCol(!currentTwoCol)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
              currentTwoCol
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Toggle Two-Column Newspaper Layout"
          >
            <MatIcon
              name="view_column"
              size={18}
              className={currentTwoCol ? 'text-indigo-600' : 'text-slate-400'}
            />
            <span className="hidden xl:inline">2-Col</span>
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                currentTwoCol ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setDuplex(!duplex)}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
              duplex
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Toggle 2-Up Duplex Sheet Printing"
          >
            <MatIcon
              name="auto_stories"
              size={18}
              className={duplex ? 'text-indigo-600' : 'text-slate-400'}
            />
            <span className="hidden xl:inline">Duplex</span>
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                duplex ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            />
          </button>

          {/* Cluster 4: Zoom Controls with Material Icons */}
          <div className="hidden sm:flex items-center gap-0.5 bg-white px-1.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.max(0.4, Math.round((prev - 0.05) * 100) / 100))}
              disabled={zoomScale <= 0.4}
              title="Zoom Out (-5%)"
              className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center"
            >
              <MatIcon name="zoom_out" size={18} />
            </button>
            <button
              type="button"
              onClick={() => setZoomScale(1.0)}
              title="Click to reset zoom to 100%"
              className="text-xs font-bold text-slate-700 min-w-[42px] text-center hover:text-indigo-600 transition-colors"
            >
              {Math.round(zoomScale * 100)}%
            </button>
            <button
              type="button"
              onClick={() => setZoomScale((prev) => Math.min(1.6, Math.round((prev + 0.05) * 100) / 100))}
              disabled={zoomScale >= 1.6}
              title="Zoom In (+5%)"
              className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center"
            >
              <MatIcon name="zoom_in" size={18} />
            </button>
            {zoomScale !== 1.0 && (
              <button
                type="button"
                onClick={() => setZoomScale(1.0)}
                title="Reset Zoom to 100%"
                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center"
              >
                <MatIcon name="restart_alt" size={16} />
              </button>
            )}
          </div>

          {/* Desktop Full Canvas Toggle */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 bg-white shadow-2xs transition-all"
            title={sidebarCollapsed ? 'Show Questions Navigator' : 'Hide Questions Navigator (Full Canvas)'}
          >
            <MatIcon name={sidebarCollapsed ? 'fullscreen_exit' : 'fullscreen'} size={18} />
          </button>

          {/* Cluster 5: Action Triggers (Using Material Icons) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleOpenNewWindow}
              title="Open Paper in New Browser Tab"
              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 bg-white shadow-2xs transition-all flex items-center justify-center"
            >
              <MatIcon name="open_in_new" size={18} />
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              title="Download Standalone HTML File"
              className="p-1.5 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all hover:text-indigo-600 flex items-center justify-center"
            >
              <MatIcon name="download" size={18} />
            </button>

            <button
              type="button"
              onClick={handleCopyHtml}
              title={copied ? 'Copied to Clipboard!' : 'Copy Compiled HTML'}
              className={`p-1.5 rounded-xl border transition-all flex items-center justify-center ${
                copied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-indigo-600 shadow-2xs'
              }`}
            >
              <MatIcon
                name={copied ? 'check' : 'content_copy'}
                size={18}
                className={copied ? 'text-emerald-600' : ''}
              />
            </button>

            <button
              type="button"
              onClick={handlePrint}
              title="Print Question Paper"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 rounded-xl shadow-xs hover:shadow-sm transition-all active:scale-95 ml-0.5"
            >
              <MatIcon name="print" size={18} className="text-indigo-300" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN SPLIT BODY (QUESTIONS NAVIGATOR & LIVE PREVIEW FRAME)              */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Questions Quick Navigator */}
        <div
          className={`${
            mobileTab === 'questions'
              ? 'flex w-full'
              : sidebarCollapsed
              ? 'hidden'
              : 'hidden md:flex md:w-[320px] lg:w-[370px]'
          } flex-col border-r border-slate-200 bg-slate-50/50 overflow-hidden shrink-0 transition-all`}
        >
          {/* Navigator Header with Material Icons */}
          <div className="p-3 border-b border-slate-200 bg-white space-y-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <MatIcon name="format_list_bulleted" size={18} />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">
                    Questions Navigator
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {totalPaperQuestions} Questions • {calculatedTotalMarks} Marks
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                <MatIcon name="drag_indicator" size={14} />
                <span>Drag</span>
              </span>
            </div>

            {/* Quick Search in Questions */}
            <div className="relative">
              <MatIcon
                name="search"
                size={16}
                className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Filter questions or keywords..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 placeholder-slate-400"
              />
              {searchFilter && (
                <button
                  type="button"
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded flex items-center justify-center"
                >
                  <MatIcon name="close" size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Navigator Scrollable Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
            {activePaper.sections?.map((sec, sIdx) => {
              const isCollapsed = Boolean(collapsedSections[sIdx]);
              const secMarks =
                sec.questions?.reduce((sum, q) => sum + (parseFloat(q.marks) || 0), 0) || 0;

              // Filter questions if search is active
              const displayedQuestions = (sec.questions || []).filter((q) => {
                if (!searchFilter.trim()) return true;
                const clean = q.text.replace(/<[^>]*>?/gm, '').toLowerCase();
                return clean.includes(searchFilter.toLowerCase()) || q.number.includes(searchFilter);
              });

              if (searchFilter.trim() && displayedQuestions.length === 0) {
                return null;
              }

              return (
                <div
                  key={sIdx}
                  onDragOver={(e) => handleSectionDragOver(e, sIdx)}
                  onDrop={(e) => handleDrop(e, sIdx, null)}
                  className={`rounded-2xl transition-all border ${
                    dragOver?.sectionIdx === sIdx && dragOver?.position === 'inside'
                      ? 'bg-indigo-50/80 border-2 border-dashed border-indigo-500 shadow-sm'
                      : 'bg-white border-slate-200/90 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  {/* Section Header Strip */}
                  <div className="p-2.5 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl border-b border-slate-100 flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleSectionCollapse(sIdx)}
                        className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors flex items-center justify-center"
                        title={isCollapsed ? 'Expand Section' : 'Collapse Section'}
                      >
                        <MatIcon name={isCollapsed ? 'chevron_right' : 'expand_more'} size={18} />
                      </button>

                      <span className="px-1.5 py-0.5 text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-md shrink-0">
                        {sec.badge || `Sec ${sIdx + 1}`}
                      </span>

                      <div
                        onClick={() =>
                          onOpenEditSection({
                            sectionIdx: sIdx,
                            badge: sec.badge,
                            title: sec.title,
                            instruction: sec.instruction
                          })
                        }
                        className="cursor-pointer truncate group flex-1"
                        title="Click to edit section title & instructions"
                      >
                        <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {sec.title || 'Untitled Section'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {sec.questions?.length || 0}Q • {secMarks}M
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenEditSection({
                            sectionIdx: sIdx,
                            badge: sec.badge,
                            title: sec.title,
                            instruction: sec.instruction
                          })
                        }
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors flex items-center justify-center"
                        title="Edit Section Details"
                      >
                        <MatIcon name="edit" size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Section Instruction Preview */}
                  {sec.instruction && !isCollapsed && (
                    <div className="px-3 pt-2 pb-1 text-[11px] text-slate-500 italic line-clamp-1 border-b border-slate-50">
                      &ldquo;{sec.instruction}&rdquo;
                    </div>
                  )}

                  {/* Questions List */}
                  {!isCollapsed && (
                    <div className="p-2 space-y-2">
                      {displayedQuestions.map((q) => {
                        const originalQIdx = (sec.questions || []).findIndex(
                          (original) => original === q
                        );
                        const qIdx = originalQIdx >= 0 ? originalQIdx : 0;

                        const isDraggingThis =
                          dragged?.sectionIdx === sIdx && dragged?.questionIdx === qIdx;
                        const isTargetTop =
                          dragOver?.sectionIdx === sIdx &&
                          dragOver?.questionIdx === qIdx &&
                          dragOver?.position === 'before';
                        const isTargetBottom =
                          dragOver?.sectionIdx === sIdx &&
                          dragOver?.questionIdx === qIdx &&
                          dragOver?.position === 'after';

                        return (
                          <div key={qIdx} className="relative">
                            {isTargetTop && (
                              <div className="h-1.5 bg-indigo-600 rounded-full mb-1 shadow-sm animate-pulse" />
                            )}

                            <div
                              draggable
                              onDragStart={(e) => handleDragStart(e, sIdx, qIdx)}
                              onDragOver={(e) => handleDragOver(e, sIdx, qIdx)}
                              onDrop={(e) => handleDrop(e, sIdx, qIdx)}
                              onClick={() =>
                                onOpenEditQuestion({
                                  sectionIdx: sIdx,
                                  questionIdx: qIdx,
                                  number: q.number,
                                  text: q.text,
                                  marks: q.marks,
                                  sectionBadge: sec.badge,
                                  sectionTitle: sec.title
                                })
                              }
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer group ${
                                isDraggingThis
                                  ? 'bg-indigo-50 border-indigo-300 opacity-40 shadow-inner'
                                  : 'bg-slate-50/70 hover:bg-white border-slate-200/90 hover:border-indigo-400 hover:shadow-xs'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="text-slate-400 group-hover:text-indigo-600 cursor-grab active:cursor-grabbing p-0.5 flex items-center justify-center"
                                    title="Drag to reorder question"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MatIcon name="drag_indicator" size={16} />
                                  </span>
                                  <span className="px-1.5 py-0.5 text-[10px] font-black bg-indigo-100/70 text-indigo-800 rounded">
                                    Q.{q.number}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  {/* Quick Nudge Up/Down */}
                                  <button
                                    type="button"
                                    disabled={qIdx === 0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveQuestion(sIdx, qIdx, -1);
                                    }}
                                    className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-colors flex items-center justify-center"
                                    title="Move Up"
                                  >
                                    <MatIcon name="arrow_upward" size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={qIdx === (sec.questions?.length || 0) - 1}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveQuestion(sIdx, qIdx, 1);
                                    }}
                                    className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-20 transition-colors flex items-center justify-center"
                                    title="Move Down"
                                  >
                                    <MatIcon name="arrow_downward" size={14} />
                                  </button>

                                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-black bg-slate-200/70 text-slate-700 rounded ml-1">
                                    <MatIcon name="military_tech" size={12} />
                                    <span>{q.marks}M</span>
                                  </span>
                                </div>
                              </div>

                              <p className="text-xs text-slate-700 line-clamp-2 pl-4 leading-relaxed font-normal">
                                {q.text.replace(/<[^>]*>?/gm, '')}
                              </p>
                            </div>

                            {isTargetBottom && (
                              <div className="h-1.5 bg-indigo-600 rounded-full mt-1 shadow-sm animate-pulse" />
                            )}
                          </div>
                        );
                      })}

                      {(!sec.questions || sec.questions.length === 0) && (
                        <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 flex items-center justify-center gap-1.5">
                          <MatIcon name="drag_indicator" size={16} />
                          <span>Drop questions here</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Live Compiled Paper Preview */}
        <div
          className={`${
            mobileTab === 'preview' ? 'flex flex-1' : 'hidden md:flex md:flex-1'
          } bg-gradient-to-br from-slate-100 via-slate-200/60 to-slate-100 p-2 sm:p-4 overflow-hidden flex-col items-center justify-center relative`}
        >
          {/* Subtle Paper Status Pill with Material Icons */}
          <div className="absolute top-3 left-4 z-10 hidden sm:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-300/70 shadow-xs text-[11px] font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {activePaper.batch} • {activePaper.set || 'Set A'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-slate-500">
              <MatIcon name="palette" size={14} />
              <span>{templates.find((t) => t.id === currentTemplateId)?.name || 'Default'}</span>
            </span>
          </div>

          <div className="w-full h-full pt-6 sm:pt-7 flex items-center justify-center">
            <iframe
              id="qp-preview-iframe"
              srcDoc={compiledHtml}
              title="Question Paper Live Preview"
              className="w-full h-full rounded-2xl border border-slate-300/80 shadow-2xl bg-white transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
