import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { SUBJECTS, type SubjectKey } from './fyugData';
import { SYLLABUS } from './syllabus';
import {
  SUBJECT_KEYS,
  doneUnits,
  formatUnits,
  loadProgress,
  onProgressChange,
  overall,
  saveProgress,
  totalUnits,
  unitPercent,
  type Progress
} from './progress';

const ROMAN = ['I', 'II', 'III', 'IV'];

// Syllabus checklist: tick a finished unit, or drag its slider for a part-covered one; the poster's progress bars
// and every total here are worked out from those slider values.
export default function FyugTopics() {
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [open, setOpen] = useState<SubjectKey | null>(SUBJECT_KEYS[0]);

  useEffect(() => onProgressChange(() => setProgress(loadProgress())), []);

  const total = useMemo(() => overall(progress), [progress]);

  // Set how far a set of units in one subject is covered (one unit, or a whole module), 0 to 100.
  const setUnits = (key: SubjectKey, units: number[], percent: number) => {
    const all = loadProgress();
    const current = { ...all[key] };
    units.forEach((n) => {
      if (percent > 0) current[n] = percent;
      else delete current[n];
    });
    saveProgress({ ...all, [key]: current });
  };

  return (
    <main className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Sixth Semester syllabus</h2>
            <p className="text-2xl font-bold text-white mt-1">
              {Math.round((total.done / total.total) * 100)}%
              <span className="text-sm font-medium text-slate-400 ml-2">
                {formatUnits(total.done)} of {total.total} units
              </span>
            </p>
          </div>
        </div>
        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all"
            style={{ width: `${(total.done / total.total) * 100}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-3">Tick a finished unit, or drag its slider if it is partly covered. Saved in this browser; the poster updates straight away.</p>
      </section>

      {SUBJECT_KEYS.map((key) => {
        const sub = SUBJECTS[key];
        const doneCount = doneUnits(progress, key);
        const count = totalUnits(key);
        const isOpen = open === key;
        return (
          <section key={key} className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <button onClick={() => setOpen(isOpen ? null : key)} className="w-full text-left p-4 sm:p-5 hover:bg-slate-800/40 transition">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-8 rounded-full shrink-0" style={{ backgroundColor: sub.accent }} />
                <span className="flex-1 font-bold text-sm text-white">{sub.name}</span>
                <span className="text-xs font-mono text-slate-400">
                  {formatUnits(doneCount)}/{count}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(doneCount / count) * 100}%`, backgroundColor: sub.accent }}
                />
              </div>
            </button>

            {isOpen && (
              <div className="px-4 sm:px-5 pb-5 space-y-5">
                {SYLLABUS[key].map((mod) => {
                  const units = mod.units.map((u) => u.n);
                  const covered = units.reduce((s, n) => s + unitPercent(progress, key, n) / 100, 0);
                  const allDone = covered === units.length;
                  return (
                    <div key={mod.module}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Module {ROMAN[mod.module - 1]}
                          <span className="ml-2 font-mono text-slate-500">
                            {formatUnits(covered)}/{units.length}
                          </span>
                        </h3>
                        <button
                          onClick={() => setUnits(key, units, allDone ? 0 : 100)}
                          className="text-[11px] font-medium text-blue-300 hover:text-blue-200 transition"
                        >
                          {allDone ? 'Clear module' : 'Tick whole module'}
                        </button>
                      </div>
                      <ul className="space-y-1.5">
                        {mod.units.map((u) => {
                          const pct = unitPercent(progress, key, u.n);
                          const checked = pct === 100;
                          return (
                            <li
                              key={u.n}
                              className={`rounded-xl border transition ${
                                checked
                                  ? 'bg-emerald-500/10 border-emerald-500/30'
                                  : pct > 0
                                    ? 'bg-slate-950/60 border-slate-600'
                                    : 'bg-slate-950/60 border-slate-800'
                              }`}
                            >
                              <button
                                role="checkbox"
                                aria-checked={checked}
                                onClick={() => setUnits(key, [u.n], checked ? 0 : 100)}
                                className="w-full flex items-start gap-3 text-left px-3 pt-2.5 pb-1"
                              >
                                <span
                                  className={`mt-0.5 w-5 h-5 shrink-0 rounded-md border flex items-center justify-center ${
                                    checked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'
                                  }`}
                                >
                                  {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                                </span>
                                <span className="w-5 shrink-0 text-xs font-mono text-slate-500 mt-0.5">{u.n}</span>
                                <span className={`text-sm ${checked ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                                  {u.text}
                                </span>
                              </button>
                              <div className="flex items-center gap-3 pl-11 pr-3 pb-2">
                                <input
                                  type="range"
                                  min={0}
                                  max={100}
                                  step={5}
                                  value={pct}
                                  onChange={(e) => setUnits(key, [u.n], Number(e.target.value))}
                                  aria-label={`Unit ${u.n} covered`}
                                  className="flex-1 min-w-0 h-6 cursor-pointer"
                                  style={{ accentColor: sub.accent }}
                                />
                                <span className="w-10 text-right text-xs font-mono text-slate-400">{pct}%</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </main>
  );
}
