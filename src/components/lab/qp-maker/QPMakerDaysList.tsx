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
  CalendarDays
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
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Exam Days ({days.length})
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage multiple examination days, customize subject divisions, and generate papers.
          </p>
        </div>
        <button
          onClick={onAddDay}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all hover:shadow-indigo-100"
        >
          <Plus className="w-4 h-4" /> Add New Exam Day
        </button>
      </div>

      {/* Days Grid */}
      {days.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
            <CalendarDays className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-gray-900 mb-1">No Exam Days Created Yet</h4>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
            Create your first examination day to configure subject marks, upload question sources, and generate print-ready papers.
          </p>
          <button
            onClick={onAddDay}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Day 1
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {days.map((dayNum) => {
            const dayObj = dataByDay[dayNum] || ({} as Partial<QPMakerDayData>);
            const papersCount = (dayObj.generatedPapers || []).length;
            const marks = dayObj.totalMarks || '15';
            const duration = dayObj.duration || '30';
            const tmpl = dayObj.templateId || 'elegant';

            return (
              <div
                key={dayNum}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 flex flex-col justify-between gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-indigo-200 group"
              >
                <div>
                  {/* Top Bar: Badge & Date */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 text-xs font-black bg-indigo-50 text-indigo-700 rounded-lg">
                      Day {dayNum}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {dayObj.date || 'No Date'}
                    </span>
                  </div>

                  {/* Subtitle */}
                  <h4 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2.5">
                    {dayObj.subtitle || 'Daily Examination'}
                  </h4>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-gray-50 text-gray-700 rounded border border-gray-200">
                      {marks} Marks
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-gray-50 text-gray-700 rounded border border-gray-200">
                      {duration} Mins
                    </span>
                    <span className="px-2 py-0.5 text-[11px] font-mono font-medium bg-gray-50 text-gray-600 rounded border border-gray-200 truncate max-w-[120px]">
                      {tmpl}
                    </span>
                  </div>
                </div>

                {/* Bottom Bar: Status & Actions */}
                <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {papersCount > 0 ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        {papersCount} Paper{papersCount === 1 ? '' : 's'} Ready
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                        <AlertCircle className="w-4 h-4" />
                        No Papers Yet
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateDay(dayNum)}
                      title="Duplicate Day"
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {days.length > 1 && (
                      <button
                        onClick={() => onDeleteDay(dayNum)}
                        title="Delete Day"
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onSelectDay(dayNum)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ml-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Setup
                    </button>
                    {papersCount > 0 && (
                      <button
                        onClick={() => onOpenViewer(dayNum)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" /> View
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
