import React from 'react';
import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { HOUR_TIMES, ROOMS, SUBJECTS, TEACHERS, type Slot, type SubjectKey } from './fyugData';
import { MAX_SLOTS, type SpecialDay } from './specialDays';

interface FyugDayEditorProps {
  day: SpecialDay | null; // null = the date follows the normal timetable
  onStart: () => void; // begin a special timetable from the date's normal hours
  onStartPracticals: () => void; // begin a special timetable with a single practicals card
  onChange: (day: SpecialDay) => void;
  onReset: () => void; // drop the special day and go back to the normal timetable
}

// 16px text on phones, so iOS does not zoom the page when a field is focused.
const input =
  'w-full min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 md:py-1.5 text-base md:text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition';

export const practicalTitle = (subject: SubjectKey) => `${SUBJECTS[subject].name} Practical`;

// Special timetable editor: replace the hours of one date (subject, teacher, time, room, or a free title) when
// the timetable changes at short notice, e.g. a day with only practicals. The poster redraws on every edit.
export default function FyugDayEditor({ day, onStart, onStartPracticals, onChange, onReset }: FyugDayEditorProps) {
  if (!day) {
    return (
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-lg">
        <h2 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Special timetable</h2>
        <p className="text-xs text-slate-400 mb-3">Timetable changed for this date? Make a special one.</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onStartPracticals}
            className="py-2.5 md:py-2 text-xs font-bold rounded-lg bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 transition"
          >
            Practicals only
          </button>
          <button
            onClick={onStart}
            className="py-2.5 md:py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Edit the hours
          </button>
        </div>
      </section>
    );
  }

  const setSlot = (i: number, patch: Partial<Slot>) =>
    onChange({ ...day, slots: day.slots.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  // A practicals card is titled after its subject, so the title follows when the subject changes.
  const setSubject = (i: number, subject: SubjectKey) => {
    const slot = day.slots[i];
    setSlot(i, slot.title === practicalTitle(slot.subject) ? { subject, title: practicalTitle(subject) } : { subject });
  };

  const move = (i: number, delta: number) => {
    const slots = [...day.slots];
    const j = i + delta;
    if (j < 0 || j >= slots.length) return;
    [slots[i], slots[j]] = [slots[j], slots[i]];
    onChange({ ...day, slots });
  };

  const add = () => {
    const last = day.slots[day.slots.length - 1];
    onChange({
      ...day,
      slots: [...day.slots, { subject: last?.subject ?? 'thermo', teacher: last?.teacher ?? '', time: day.unordered ? '' : HOUR_TIMES[day.slots.length] ?? '' }]
    });
  };

  return (
    <section className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 md:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-bold text-xs text-amber-300 uppercase tracking-wider">Special timetable</h2>
        <button onClick={onReset} className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition">
          <RotateCcw className="w-3 h-3" />
          <span>Back to normal</span>
        </button>
      </div>

      <label className="block text-[11px] text-slate-400 mb-1">Header bar text</label>
      <input
        className={input}
        value={day.subtitle ?? ''}
        placeholder="Automatic (hours and time span)"
        onChange={(e) => onChange({ ...day, subtitle: e.target.value })}
      />

      <label className="flex items-start gap-2 mt-3 text-xs text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={!!day.unordered}
          onChange={(e) =>
            onChange({
              ...day,
              unordered: e.target.checked,
              slots: e.target.checked ? day.slots.map((s) => ({ ...s, time: '' })) : day.slots
            })
          }
        />
        <span>
          Orderless day <span className="text-slate-500">— subjects known, order and timings not fixed (no hour numbers or times)</span>
        </span>
      </label>

      <div className="mt-4 space-y-3">
        {day.slots.map((slot, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-bold text-white"
                style={{ backgroundColor: SUBJECTS[slot.subject].accent }}
              >
                {day.unordered ? `SUBJECT ${i + 1}` : `HOUR ${i + 1}`}
              </span>
              <div className="ml-auto flex items-center gap-0.5 text-slate-400">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="p-2 md:p-1 rounded hover:bg-slate-800 disabled:opacity-30" aria-label="Move up">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === day.slots.length - 1}
                  className="p-2 md:p-1 rounded hover:bg-slate-800 disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onChange({ ...day, slots: day.slots.filter((_, j) => j !== i) })}
                  disabled={day.slots.length === 1}
                  className="p-2 md:p-1 rounded hover:bg-red-500/20 hover:text-red-300 disabled:opacity-30"
                  aria-label="Remove hour"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                className={`${input} col-span-2`}
                value={slot.subject}
                onChange={(e) => setSubject(i, e.target.value as SubjectKey)}
                aria-label="Subject"
              >
                {(Object.keys(SUBJECTS) as SubjectKey[]).map((key) => (
                  <option key={key} value={key}>
                    {SUBJECTS[key].name}
                  </option>
                ))}
              </select>
              <input
                className={`${input} col-span-2`}
                value={slot.title ?? ''}
                placeholder="Title (instead of subject name)"
                onChange={(e) => setSlot(i, { title: e.target.value })}
              />
              <select
                className={`${input} col-span-2`}
                value={slot.teacher}
                onChange={(e) => setSlot(i, { teacher: e.target.value })}
                aria-label="Teacher"
              >
                <option value="">No teacher</option>
                {[...TEACHERS, ...(slot.teacher && !TEACHERS.includes(slot.teacher) ? [slot.teacher] : [])].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {!day.unordered && (
                <input
                  className={input}
                  value={slot.time ?? ''}
                  list="fyug-times"
                  placeholder="Time"
                  onChange={(e) => setSlot(i, { time: e.target.value })}
                />
              )}
              <input
                className={input}
                value={slot.room ?? ''}
                list="fyug-rooms"
                placeholder="Room"
                onChange={(e) => setSlot(i, { room: e.target.value })}
              />
              <input
                className={input}
                value={slot.note ?? ''}
                placeholder="Note"
                onChange={(e) => setSlot(i, { note: e.target.value })}
              />
              <input
                className={input}
                value={slot.badge ?? ''}
                maxLength={5}
                placeholder="Badge (LAB)"
                onChange={(e) => setSlot(i, { badge: e.target.value.toUpperCase() })}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={add}
        disabled={day.slots.length >= MAX_SLOTS}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 md:py-2 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition disabled:opacity-40"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>{day.unordered ? 'Add subject' : 'Add hour'}</span>
      </button>
      <p className="text-[11px] text-slate-500 mt-3">A note shows in place of the teacher. Saved in this browser, for this date only.</p>

      <datalist id="fyug-rooms">
        {ROOMS.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>
      <datalist id="fyug-times">
        {HOUR_TIMES.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </section>
  );
}
