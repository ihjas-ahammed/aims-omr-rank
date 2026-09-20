import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Palette,
  Code,
  Check,
  RotateCcw,
  Save,
  HelpCircle,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Columns
} from 'lucide-react';
import { QpTemplate } from './defaultDartTemplates';
import { buildPreviewHtml } from './qpCompiler';

// -------------------------------------------------------------
// MathJax loader utility for live formula preview
// -------------------------------------------------------------
export function ensureMathJax(onReady?: () => void) {
  if ((window as any).MathJax) {
    if (onReady) onReady();
    return;
  }
  (window as any).MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true
    },
    options: {
      skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
    },
    chtml: {
      displayAlign: 'left',
      scale: 0.95
    }
  };
  const script = document.createElement('script');
  script.id = 'MathJax-script';
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  script.async = true;
  script.onload = () => {
    if (onReady) onReady();
  };
  document.head.appendChild(script);
}

// -------------------------------------------------------------
// 1. Template Design Preview Modal
// -------------------------------------------------------------
interface TemplatePreviewModalProps {
  open: boolean;
  template: QpTemplate | null;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export function TemplatePreviewModal({
  open,
  template,
  onClose,
  onSelectTemplate
}: TemplatePreviewModalProps) {
  const [twoCol, setTwoCol] = useState(false);
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (open && template) {
      const generated = buildPreviewHtml(template, { twoColumn: twoCol });
      setHtml(generated);
    }
  }, [open, template, twoCol]);

  if (!open || !template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 truncate">
                Design Preview: {template.name}
              </h3>
              <p className="text-xs text-gray-500 truncate">{template.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50">
              <Columns className="w-3.5 h-3.5 text-indigo-600" />
              <span>2-Column</span>
              <input
                type="checkbox"
                checked={twoCol}
                onChange={(e) => setTwoCol(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 ml-1"
              />
            </label>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content iframe */}
        <div className="flex-1 bg-slate-100 min-h-[360px] sm:min-h-[480px] p-2 overflow-hidden">
          <iframe
            srcDoc={html}
            title="Template Preview"
            className="w-full h-full border-0 rounded-xl bg-white shadow-inner"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-white">
          <span className="text-xs font-mono text-gray-500">ID: {template.id}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSelectTemplate(template.id);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              <Check className="w-4 h-4" /> Use This Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. Permanent Design HTML Template Editor Modal
// -------------------------------------------------------------
interface DesignEditorModalProps {
  open: boolean;
  template: QpTemplate | null;
  onClose: () => void;
  onSave: (templateId: string, customHtml: string) => void;
  onReset: (templateId: string) => void;
}

export function DesignEditorModal({
  open,
  template,
  onClose,
  onSave,
  onReset
}: DesignEditorModalProps) {
  const [htmlCode, setHtmlCode] = useState('');

  useEffect(() => {
    if (open && template) {
      setHtmlCode(template.html || '');
    }
  }, [open, template]);

  if (!open || !template) return null;

  const placeholders = [
    '{{TITLE}}',
    '{{EXAM_DATE}}',
    '{{TOTAL_MARKS}}',
    '{{DURATION}}',
    '{{BATCH}}',
    '{{SET}}',
    '{{QUESTIONS_HTML}}',
    '{{STYLE_RULES}}'
  ];

  const handleInsertTag = (tag: string) => {
    setHtmlCode((prev) => prev + tag);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
              <Code className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  Edit Design HTML: {template.name}
                </h3>
                {template.isCustomized ? (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                    Customized
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Custom changes are saved permanently to your local browser storage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Placeholders Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-gray-200 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" /> Insert Placeholder:
          </span>
          {placeholders.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleInsertTag(tag)}
              className="px-2 py-0.5 text-[11px] font-mono font-medium bg-white text-indigo-700 border border-indigo-200 hover:border-indigo-400 rounded shadow-xs transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Editor Textarea */}
        <div className="flex-1 p-4 bg-slate-900 overflow-hidden flex flex-col">
          <textarea
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            className="w-full flex-1 bg-transparent text-emerald-400 font-mono text-xs sm:text-sm p-2 outline-none resize-none selection:bg-indigo-900 selection:text-white"
            placeholder="<!DOCTYPE html>..."
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset this template to its original default Dart design?')) {
                onReset(template.id);
                onClose();
              }
            }}
            disabled={!template.isCustomized}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Default
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(template.id, htmlCode);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" /> Save Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3. Question Editor Dialog with live MathJax rendering
// -------------------------------------------------------------
interface QuestionEditorDialogProps {
  open: boolean;
  sectionIdx: number;
  questionIdx: number;
  number: string;
  text: string;
  marks: string;
  sectionBadge: string;
  sectionTitle: string;
  onClose: () => void;
  onSave: (sectionIdx: number, questionIdx: number, number: string, text: string, marks: string) => void;
}

export function QuestionEditorDialog({
  open,
  sectionIdx,
  questionIdx,
  number: initialNumber,
  text: initialText,
  marks: initialMarks,
  sectionBadge,
  sectionTitle,
  onClose,
  onSave
}: QuestionEditorDialogProps) {
  const [number, setNumber] = useState(initialNumber);
  const [text, setText] = useState(initialText);
  const [marks, setMarks] = useState(initialMarks);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setNumber(initialNumber);
      setText(initialText);
      setMarks(initialMarks);
      ensureMathJax();
    }
  }, [open, initialNumber, initialText, initialMarks]);

  useEffect(() => {
    if (open && previewRef.current && (window as any).MathJax?.typesetPromise) {
      (window as any).MathJax.typesetPromise([previewRef.current]).catch(() => {});
    }
  }, [text, open]);

  if (!open) return null;

  const mathChips = [
    { label: '$inline$', snippet: ' $x = y^2$ ' },
    { label: '$$block$$', snippet: ' $$E = mc^2$$ ' },
    { label: '\\frac{a}{b}', snippet: ' $\\frac{a}{b}$ ' },
    { label: '\\sqrt{x}', snippet: ' $\\sqrt{x}$ ' },
    { label: '\\int_a^b', snippet: ' $\\int_0^1 x dx$ ' }
  ];

  const handleInsertMath = (snippet: string) => {
    setText((prev) => prev + snippet);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50/80">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-900 truncate">
              Edit Question {number} ({sectionBadge} &mdash; {sectionTitle})
            </h3>
            <p className="text-xs text-gray-500">Edit question text, equation markup, or marks allocation.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Question Number
              </label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Marks Allocated
              </label>
              <input
                type="text"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold text-sm outline-none"
              />
            </div>
          </div>

          {/* Math Formula Quick Chips */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Math Formula Presets:
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {mathChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleInsertMath(chip.snippet)}
                  className="px-2 py-1 text-xs font-mono font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Textarea */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Question Content (HTML / LaTeX MathJax)
            </label>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-normal text-sm outline-none resize-y"
              placeholder="Question text with \(x^2 + y^2 = r^2\) or sub-questions <ol type='a'><li>...</li></ol>"
            />
          </div>

          {/* Live MathJax Preview Box */}
          <div>
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Live Formula Preview
            </div>
            <div
              ref={previewRef}
              className="p-3 bg-slate-50 border border-gray-200 rounded-lg text-sm text-gray-800 min-h-[50px] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: text || '<span class="text-gray-400 italic">No content</span>' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(sectionIdx, questionIdx, number, text, marks);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Save Question
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 4. Section Editor Dialog
// -------------------------------------------------------------
interface SectionEditorDialogProps {
  open: boolean;
  sectionIdx: number;
  badge: string;
  title: string;
  instruction: string;
  onClose: () => void;
  onSave: (sectionIdx: number, badge: string, title: string, instruction: string) => void;
}

export function SectionEditorDialog({
  open,
  sectionIdx,
  badge: initialBadge,
  title: initialTitle,
  instruction: initialInstruction,
  onClose,
  onSave
}: SectionEditorDialogProps) {
  const [badge, setBadge] = useState(initialBadge);
  const [title, setTitle] = useState(initialTitle);
  const [instruction, setInstruction] = useState(initialInstruction);

  useEffect(() => {
    if (open) {
      setBadge(initialBadge);
      setTitle(initialTitle);
      setInstruction(initialInstruction);
    }
  }, [open, initialBadge, initialTitle, initialInstruction]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50/80">
          <h3 className="text-base font-bold text-gray-900">Edit Section Header & Instructions</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Badge
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Section A"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold text-sm outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                Section Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Physics / Mathematics"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-semibold text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Section Instructions
            </label>
            <textarea
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Answer all questions. Each carries 2 marks."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(sectionIdx, badge, title, instruction);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Save Section
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 5. Image & PDF Zoom Modal
// -------------------------------------------------------------
interface ImageZoomModalProps {
  open: boolean;
  src: string;
  title: string;
  isPdf?: boolean;
  onClose: () => void;
}

export function ImageZoomModal({ open, src, title, isPdf, onClose }: ImageZoomModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-800">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-2 min-w-0">
            {isPdf ? (
              <FileText className="w-5 h-5 text-red-600" />
            ) : (
              <ImageIcon className="w-5 h-5 text-indigo-600" />
            )}
            <h3 className="text-sm font-bold text-gray-900 truncate">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 bg-slate-900 p-4 flex items-center justify-center overflow-auto min-h-[300px]">
          {isPdf ? (
            <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
              <FileText className="w-16 h-16 text-red-500 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 text-base mb-1">{title}</h4>
              <p className="text-xs text-gray-500 mb-4">PDF Document is ready for AI question extraction.</p>
              <button
                onClick={() => {
                  const win = window.open();
                  if (win) {
                    win.document.write(`<iframe src="${src}" style="border:0; width:100%; height:100vh;"></iframe>`);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Open PDF in New Tab
              </button>
            </div>
          ) : (
            <img
              src={src}
              alt={title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-md"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 6. Sync Dart Code Modal
// -------------------------------------------------------------
interface DartSyncModalProps {
  open: boolean;
  onClose: () => void;
  onParsedTemplates: (templates: QpTemplate[]) => void;
}

export function DartSyncModal({ open, onClose, onParsedTemplates }: DartSyncModalProps) {
  const [dartCode, setDartCode] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const handleParse = async () => {
    setError('');
    try {
      const { parseDartTemplates } = await import('./defaultDartTemplates');
      const templates = parseDartTemplates(dartCode);
      if (templates.length === 0) {
        setError('No valid QpTemplate definitions found in the provided Dart code.');
        return;
      }
      onParsedTemplates(templates);
      onClose();
    } catch (err: any) {
      setError(`Failed to parse Dart templates: ${err.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = (evt.target?.result as string) || '';
      setDartCode(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-gray-50/80">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-gray-900">Sync / Upload Dart Templates</h3>
              <p className="text-xs text-gray-500">
                Extract templates from <code>aims/lib/screens/qp_templates.dart</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
              Upload Dart File (.dart)
            </label>
            <input
              type="file"
              accept=".dart"
              onChange={handleFileUpload}
              className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
              Or Paste Dart Source Code
            </label>
            <textarea
              rows={10}
              value={dartCode}
              onChange={(e) => setDartCode(e.target.value)}
              placeholder="const String _elegantSerif = r'''...''';&#10;const List<QpTemplate> qpTemplates = [...];"
              className="w-full font-mono text-xs p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleParse}
            disabled={!dartCode.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Extract & Apply Templates
          </button>
        </div>
      </div>
    </div>
  );
}
