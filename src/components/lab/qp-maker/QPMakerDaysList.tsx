import React from 'react';
import {
  Calendar,
  Clock,
  Target,
  Plus,
  Copy,
  Trash2,
  Printer,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FileText,
  CalendarDays,
  Sparkles,
  Layers,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { QPMakerDayData } from './types';

interface QPMakerDaysListProps {
  days: number[];
  dataByDay: Record<number, QPMakerDayData>;
  onSelectDay: (dayNum: number) => void;
  onAddDay: () => void;
  onDuplicateDay: (dayNum: number) => void;
  onDeleteDay: (dayNum: number) => void;
  onOpenViewer: (dayNum: number) => void;
}

export default function QPMakerDaysList({
  days,
  dataByDay,
  onSelectDay,
  onAddDay,
  onDuplicateDay,
  onDeleteDay,
  onOpenViewer
}: QPMakerDaysListProps) {
  // Aggregate statistics for cognitive reassurance & progress
  const totalPapersGenerated = days.reduce((sum, dNum) => {
    const papers = dataByDay[dNum]?.generatedPapers || [];
    return sum + papers.length;
  }, 0);

  const totalSourceItems = days.reduce((sum, dNum) => {
    const items = dataByDay[dNum]?.items || [];
    return sum + items.length;
  }, 0);

  return (
    <div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Aggregate Overview Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-[#062e5b] rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
        {/* Subtle background glow circles */}
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold mb-1 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Day Exam Management</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Examination Schedules &amp; Question Papers
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed">
              Create structured question papers with custom subject divisions, LaTeX math equations, and multiple set distributions.
            </p>
          </div>

          {/* Aggregate Metrics Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl text-center min-w-[90px]">
              <div className="text-lg sm:text-xl font-black text-white">{days.length}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Exam Days</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl text-center min-w-[90px]">
              <div className="text-lg sm:text-xl font-black text-amber-300">{totalPapersGenerated}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Papers Ready</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl text-center min-w-[90px]">
              <div className="text-lg sm:text-xl font-black text-emerald-300">{totalSourceItems}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Sources</div>
            </div>

            <button
              onClick={onAddDay}
              className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-indigo-50 text-indigo-900 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 hover:shadow-lg"
            >
              <Plus className="w-4 h-4 text-indigo-600 stroke-[3]" />
              <span>Add Exam Day</span>
            </button>
          </div>
        </div>
      </div>

      {/* Days Grid */}
      {days.length === 0 ? (
        <div className="text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-slate-300 shadow-xs">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CalendarDays className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-extrabold text-slate-900 mb-1">No Examination Days Created Yet</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            Create your first examination day to configure subject divisions, upload question sources, and compile print-ready papers.
          </p>
          <button
            onClick={onAddDay}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Create Day 1
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {days.map((dayNum) => {
            const dayObj = dataByDay[dayNum] || ({} as Partial<QPMakerDayData>);
            const papersCount = (dayObj.generatedPapers || []).length;
            const marks = dayObj.totalMarks || '15';
            const duration = dayObj.duration || '30';
            const tmpl = dayObj.templateId || 'elegant';
            const sourcesCount = (dayObj.items || []).length + (dayObj.assets || []).length;

            return (
              <div
                key={dayNum}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between gap-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-300 group relative overflow-hidden"
              >
                {/* Top Accent Strip */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${
                    papersCount > 0
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-400'
                  }`}
                />

                <div className="space-y-3.5">
                  {/* Header Row: Day Badge & Date */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 text-xs font-black bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100/80 shadow-2xs">
                      Day {dayNum}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      {dayObj.date || 'No Date'}
                    </span>
                  </div>

                  {/* Exam Title / Subtitle */}
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {dayObj.subtitle || 'Daily Examination'}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      {sourcesCount > 0 ? `${sourcesCount} source items attached` : 'No sources uploaded yet'}
                    </p>
                  </div>

                  {/* Key Metadata Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="px-2.5 py-1 text-[11px] font-extrabold bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80">
                      {marks} Marks
                    </span>
                    <span className="px-2.5 py-1 text-[11px] font-extrabold bg-slate-50 text-slate-700 rounded-xl border border-slate-200/80">
                      {duration} Mins
                    </span>
                    <span className="px-2.5 py-1 text-[11px] font-mono font-bold bg-indigo-50/50 text-indigo-700 rounded-xl border border-indigo-100 truncate max-w-[130px]">
                      {tmpl}
                    </span>
                  </div>
                </div>

                {/* Bottom Bar: Status & Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {papersCount > 0 ? (
                      <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{papersCount} Ready</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Draft</span>
                      </span>
                    )}
                  </div>

                  {/* Action Icons & Triggers */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateDay(dayNum)}
                      title="Duplicate Day Configuration"
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {days.length > 1 && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete Day ${dayNum} and all its question paper data?`)) {
                            onDeleteDay(dayNum);
                          }
                        }}
                        title="Delete Day"
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onSelectDay(dayNum)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors ml-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Setup</span>
                    </button>
                    {papersCount > 0 && (
                      <button
                        onClick={() => onOpenViewer(dayNum)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-all active:scale-95"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Papers</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
