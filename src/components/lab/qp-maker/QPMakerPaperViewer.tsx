import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Palette,
  Code,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Columns,
  BookOpen,
  Printer,
  ExternalLink,
  Download,
  Copy,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Edit3,
  Check,
  FileText,
  Sliders,
  Layers
} from 'lucide-react';
import { GeneratedPaper, QPSection, QPQuestion, QPAsset } from './types';
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

  // Zoom & duplex
  const [zoomScale, setZoomScale] = useState(1.0);
  const [duplex, setDuplex] = useState(false);
  const [compiledHtml, setCompiledHtml] = useState('');
  const [copied, setCopied] = useState(false);

  // Drag & drop question reordering state
  const [dragged, setDragged] = useState<{ sectionIdx: number; questionIdx: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ sectionIdx: number; questionIdx: number | null; position: 'before' | 'after' | 'inside' } | null>(null);

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

  // Recompile active paper HTML whenever controls or active paper changes
  useEffect(() => {
    if (!activePaper) return;

    const batchCount = papers.filter((p) => p.batch === activePaper.batch).length;
    const isSingleSet =
      activePaper.hideSet !== undefined
        ? activePaper.hideSet
        : !activePaper.set || activePaper.set.trim() === '' || activePaper.set.toLowerCase() === 'none' || batchCount <= 1;

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
      <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
        No generated question papers available to view.
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

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden animate-fadeIn">
      {/* Top Toolbar */}
      <div className="p-3 sm:px-5 border-b border-gray-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Paper Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar max-w-full pb-1 sm:pb-0">
          {papers.map((p, idx) => {
            const batchCount = papers.filter((o) => o.batch === p.batch).length;
            const isSingle =
              p.hideSet || !p.set || p.set === 'None' || p.set.trim() === '' || batchCount <= 1;
            const tabLabel = isSingle ? p.batch : `${p.batch} - ${p.set}`;
            const isSel = idx === activePaperIdx;

            return (
              <button
                key={idx}
                onClick={() => onSelectPaper(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all shadow-xs ${
                  isSel
                    ? 'bg-indigo-600 text-white shadow-indigo-200'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile View Toggle: Questions vs Preview */}
        <div className="flex md:hidden items-center bg-gray-200 p-0.5 rounded-lg text-xs font-bold w-full justify-center">
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              mobileTab === 'preview' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-600'
            }`}
          >
            Live Preview
          </button>
          <button
            onClick={() => setMobileTab('questions')}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              mobileTab === 'questions' ? 'bg-white text-indigo-600 shadow-xs' : 'text-gray-600'
            }`}
          >
            Questions Editor ({activePaper.sections?.reduce((s, sec) => s + (sec.questions?.length || 0), 0) || 0})
          </button>
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Design Template Switcher */}
          <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-gray-200 shadow-2xs">
            <Palette className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <select
              value={currentTemplateId}
              onChange={(e) => handleSwitchTemplate(e.target.value)}
              className="text-xs font-bold text-gray-800 bg-transparent outline-none cursor-pointer max-w-[130px] truncate"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.isCustomized ? '(Custom)' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const curT = templates.find((t) => t.id === currentTemplateId) || templates[0];
                onOpenDesignEditor(curT);
              }}
              title="Edit Design HTML Permanently"
              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenDartSync}
              title="Sync latest templates from Dart"
              className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font & LaTeX Math Size */}
          <div className="hidden lg:flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-gray-200 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-500">Font:</span>
            <select
              value={currentFontSize}
              onChange={(e) => handleSwitchFontSize(e.target.value)}
              className="text-xs font-bold text-gray-800 bg-transparent outline-none cursor-pointer"
            >
              {['10px', '11px', '12px', '13px', '14px', '15px', '16px', '18px'].map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
            <span className="text-[11px] font-bold text-gray-500 ml-1">LaTeX:</span>
            <select
              value={currentLatexSize}
              onChange={(e) => handleSwitchLatexSize(e.target.value)}
              className="text-xs font-bold text-gray-800 bg-transparent outline-none cursor-pointer"
            >
              {['80%', '85%', '90%', '95%', '100%', '105%', '110%', '120%', '130%'].map((ls) => (
                <option key={ls} value={ls}>
                  {ls}
                </option>
              ))}
            </select>
          </div>

          {/* Zoom Scale */}
          <div className="hidden sm:flex items-center gap-0.5 bg-white px-1.5 py-1 rounded-xl border border-gray-200 shadow-2xs">
            <button
              onClick={() => setZoomScale((prev) => Math.max(0.4, Math.round((prev - 0.05) * 100) / 100))}
              disabled={zoomScale <= 0.4}
              title="Zoom Out (-5%)"
              className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 rounded"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-gray-700 min-w-[42px] text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={() => setZoomScale((prev) => Math.min(1.6, Math.round((prev + 0.05) * 100) / 100))}
              disabled={zoomScale >= 1.6}
              title="Zoom In (+5%)"
              className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 rounded"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomScale !== 1.0 && (
              <button
                onClick={() => setZoomScale(1.0)}
                title="Reset Zoom to 100%"
                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* 2-Column Toggle */}
          <label className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
            <Columns className="w-3.5 h-3.5 text-indigo-600" />
            <span>2-Col</span>
            <input
              type="checkbox"
              checked={currentTwoCol}
              onChange={(e) => handleToggleTwoCol(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 ml-0.5"
            />
          </label>

          {/* Duplex Toggle */}
          <label className="hidden md:flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Duplex</span>
            <input
              type="checkbox"
              checked={duplex}
              onChange={(e) => setDuplex(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 ml-0.5"
            />
          </label>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenNewWindow}
              title="Open Paper in New Tab"
              className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-gray-200 bg-white"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadHtml}
              title="Download HTML File"
              className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-gray-200 bg-white"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyHtml}
              title="Copy HTML to Clipboard"
              className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-gray-200 bg-white"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors ml-1"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Questions Quick Navigator & Drag-Drop Reordering */}
        <div
          className={`${
            mobileTab === 'questions' ? 'flex w-full' : 'hidden md:flex md:w-[320px] lg:w-[360px]'
          } flex-col border-r border-gray-200 bg-white overflow-y-auto custom-scrollbar p-3 space-y-3 shrink-0`}
        >
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" /> Questions Navigator
            </span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Drag to Reorder
            </span>
          </div>

          {activePaper.sections?.map((sec, sIdx) => (
            <div
              key={sIdx}
              onDragOver={(e) => handleSectionDragOver(e, sIdx)}
              onDrop={(e) => handleDrop(e, sIdx, null)}
              className={`p-2 rounded-xl transition-colors ${
                dragOver?.sectionIdx === sIdx && dragOver?.position === 'inside'
                  ? 'bg-indigo-50/70 border-2 border-dashed border-indigo-400'
                  : 'bg-slate-50/60 border border-gray-200/80'
              }`}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between gap-1 p-2 rounded-lg bg-white border border-gray-200 shadow-2xs mb-2">
                <div
                  onClick={() =>
                    onOpenEditSection({
                      sectionIdx: sIdx,
                      badge: sec.badge,
                      title: sec.title,
                      instruction: sec.instruction
                    })
                  }
                  className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 group"
                  title="Click to edit section badge & instructions"
                >
                  <span className="px-1.5 py-0.5 text-[10px] font-black bg-indigo-50 text-indigo-700 rounded shrink-0">
                    {sec.badge}
                  </span>
                  <span className="text-xs font-bold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                    {sec.title || 'Untitled Section'}
                  </span>
                </div>
                <button
                  onClick={() =>
                    onOpenEditSection({
                      sectionIdx: sIdx,
                      badge: sec.badge,
                      title: sec.title,
                      instruction: sec.instruction
                    })
                  }
                  className="p-1 text-gray-400 hover:text-indigo-600 rounded"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {sec.instruction && (
                <p className="text-[11px] text-gray-500 italic px-1 mb-2 line-clamp-1">
                  &ldquo;{sec.instruction}&rdquo;
                </p>
              )}

              {/* Questions List */}
              <div className="space-y-1.5">
                {sec.questions?.map((q, qIdx) => {
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
                        <div className="h-1 bg-indigo-600 rounded-full mb-1 shadow-sm animate-pulse" />
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
                        className={`p-2 rounded-lg border transition-all cursor-pointer group ${
                          isDraggingThis
                            ? 'bg-indigo-50 border-indigo-300 opacity-40'
                            : 'bg-white border-gray-200 hover:border-indigo-400 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1">
                            <span
                              className="text-gray-400 group-hover:text-indigo-600 cursor-grab"
                              title="Drag to reorder"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-black text-indigo-700">Q.{q.number}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Nudge Buttons */}
                            <button
                              disabled={qIdx === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveQuestion(sIdx, qIdx, -1);
                              }}
                              className="p-0.5 text-gray-400 hover:text-indigo-600 disabled:opacity-20"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              disabled={qIdx === (sec.questions.length - 1)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveQuestion(sIdx, qIdx, 1);
                              }}
                              className="p-0.5 text-gray-400 hover:text-indigo-600 disabled:opacity-20"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <span className="px-1.5 py-0.2 text-[10px] font-extrabold bg-gray-100 text-gray-700 rounded">
                              {q.marks}M
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-700 line-clamp-2 pl-4 leading-snug">
                          {q.text.replace(/<[^>]*>?/gm, '')}
                        </p>
                      </div>

                      {isTargetBottom && (
                        <div className="h-1 bg-indigo-600 rounded-full mt-1 shadow-sm animate-pulse" />
                      )}
                    </div>
                  );
                })}

                {(!sec.questions || sec.questions.length === 0) && (
                  <div className="p-3 text-center text-xs text-gray-400 border border-dashed border-gray-300 rounded-lg">
                    Drop questions here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Live Compiled Paper Preview */}
        <div
          className={`${
            mobileTab === 'preview' ? 'flex flex-1' : 'hidden md:flex md:flex-1'
          } bg-slate-100 p-2 sm:p-4 overflow-hidden items-center justify-center`}
        >
          <iframe
            id="qp-preview-iframe"
            srcDoc={compiledHtml}
            title="Question Paper Preview"
            className="w-full h-full rounded-xl border-0 shadow-md bg-white"
          />
        </div>
      </div>
    </div>
  );
}
