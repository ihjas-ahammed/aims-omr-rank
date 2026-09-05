import React, { useState, useEffect, useMemo } from 'react';
import { X, Copy, Calendar, ArrowRight, Check, Sparkles, Layers } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sourceDayDate: string;
  sourceClassData: any;
  availableDays: Array<{ date: string; dayName?: string }>;
  onConfirmDuplicate: (
    sourceDayDate: string,
    sourceClassData: any,
    newClassName: string,
    targetDayDate: string
  ) => Promise<void> | void;
}

const PRESET_CLASSES = ['PLUS ONE', 'PLUS TWO', 'A1', 'A2', 'B1', 'B2', 'B3'];

export const DuplicateClassModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sourceDayDate,
  sourceClassData,
  availableDays,
  onConfirmDuplicate
}) => {
  const [targetClassName, setTargetClassName] = useState('');
  const [targetDayDate, setTargetDayDate] = useState(sourceDayDate);
  const [submitting, setSubmitting] = useState(false);

  // Compute tomorrow's date
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }, []);

  useEffect(() => {
    if (isOpen && sourceClassData) {
      setTargetDayDate(sourceDayDate);
      // Smart suggestion: if A1, suggest A2; if A2, suggest B1; otherwise Append "(Copy)"
      const currentName = sourceClassData.class_name || '';
      if (currentName === 'A1') setTargetClassName('A2');
      else if (currentName === 'A2') setTargetClassName('B1');
      else if (currentName === 'PLUS ONE') setTargetClassName('PLUS TWO');
      else setTargetClassName(`${currentName} (Copy)`);
    }
  }, [isOpen, sourceClassData, sourceDayDate]);

  if (!isOpen || !sourceClassData) return null;

  const handleDuplicate = async () => {
    if (!targetClassName.trim() || !targetDayDate) return;
    setSubmitting(true);
    try {
      await onConfirmDuplicate(
        sourceDayDate,
        sourceClassData,
        targetClassName.trim().toUpperCase(),
        targetDayDate
      );
      onClose();
    } catch (e) {
      console.error('Failed to duplicate class:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const subjectCount = (sourceClassData.subjects || []).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-300 shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#062e5b] text-white flex items-center justify-center">
              <Copy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#062e5b]">
                Duplicate Class Timetable
              </h3>
              <p className="text-[11px] text-slate-500">
                Clone this class schedule with all subjects and timings into another class or day.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Source Card Summary */}
          <div className="bg-slate-50 p-3.5 border border-slate-200 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Source Timetable Card:
            </div>
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 bg-[#062e5b] text-white font-black text-xs">
                {sourceClassData.class_name}
              </span>
              <span className="font-bold text-slate-600">
                {sourceDayDate}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium pt-1">
              Timing: <span className="font-bold text-[#5c921c]">{sourceClassData.time || '8.30 am – 5.00 pm'}</span>
              {' • '}
              Subjects: <span className="font-bold">{subjectCount} configured</span>
            </div>
            {sourceClassData.apt_exam && (
              <div className="text-[10px] text-amber-800 font-semibold">
                APT Exam: {sourceClassData.apt_exam}
              </div>
            )}
            {sourceClassData.extra_note && (
              <div className="text-[10px] text-red-600 font-semibold">
                Note: {sourceClassData.extra_note}
              </div>
            )}
          </div>

          {/* New Class Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target / New Class Name:
            </label>
            <input
              type="text"
              value={targetClassName}
              onChange={(e) => setTargetClassName(e.target.value)}
              placeholder="e.g. A2, B1, PLUS TWO"
              className="w-full p-2 bg-white border border-slate-300 font-bold text-sm text-slate-900 focus:border-[#062e5b] focus:outline-none"
              autoFocus
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {PRESET_CLASSES.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTargetClassName(p)}
                  className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${
                    targetClassName.toUpperCase() === p
                      ? 'bg-[#062e5b] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Target Schedule Day */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target Schedule Day:
            </label>
            <select
              value={targetDayDate}
              onChange={(e) => setTargetDayDate(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 font-bold text-xs text-slate-900 focus:border-[#062e5b] focus:outline-none"
            >
              {availableDays.map(d => (
                <option key={d.date} value={d.date}>
                  {d.dayName ? `${d.dayName} (${d.date})` : d.date} {d.date === sourceDayDate ? ' (Current Day)' : ''}
                </option>
              ))}
              {!availableDays.some(d => d.date === tomorrowStr) && (
                <option value={tomorrowStr}>
                  Tomorrow ({tomorrowStr})
                </option>
              )}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              Duplicate to the same day or transfer the timetable card directly to another schedule date.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDuplicate}
            disabled={!targetClassName.trim() || submitting}
            className="px-5 py-1.5 font-black bg-[#062e5b] text-white hover:bg-[#0d427d] flex items-center gap-1.5 disabled:opacity-40 transition-colors shadow-xs"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{submitting ? 'Duplicating...' : 'Duplicate Class'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
