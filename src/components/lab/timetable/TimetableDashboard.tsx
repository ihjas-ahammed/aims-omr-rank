import React, { useState, useEffect } from 'react';
import { ArrowLeft, CalendarDays, Loader2, AlertTriangle } from 'lucide-react';
import { Batch, getEmptyTimetable, TimetableDay, DEFAULT_TIMES, BATCHES, TimetableSession } from './types';
import TimetableDesktop from './TimetableDesktop';
import TimetableMobile from './TimetableMobile';
import EditSlotModal from './EditSlotModal';
import { getTimetable, saveTimetable, isFirebaseConfigured } from '../../../services/firebaseService';

interface Props {
  onBack: () => void;
}

export default function TimetableDashboard({ onBack }: Props) {
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<TimetableDay>(getEmptyTimetable());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editing, setEditing] = useState<{ batch: Batch, sIdx: number, session: TimetableSession } | null>(null);

  useEffect(() => {
    document.title = "AIMS - Timetable";
    return () => { document.title = "OMR Checker Pro"; };
  }, []);

  useEffect(() => {
    fetchTimetable(date);
  }, [date]);

  const migrateData = (rawData: any): TimetableDay => {
    if (!rawData) return getEmptyTimetable();
    
    // Check if it's the old format (Record<Batch, Record<string, string>>)
    if (rawData["B1"] && !Array.isArray(rawData["B1"])) {
      return BATCHES.reduce((acc, batch) => {
        acc[batch] = DEFAULT_TIMES.map((time, idx) => ({
          id: `${batch}-${idx}`,
          time,
          teacher: rawData[batch]?.[time] || ''
        }));
        return acc;
      }, {} as TimetableDay);
    }
    
    // Return as is if already array
    return rawData as TimetableDay;
  };

  const fetchTimetable = async (selectedDate: string) => {
    setLoading(true);
    let loadedData: TimetableDay | null = null;
    
    try {
      const res = await getTimetable(selectedDate);
      if (res) {
        loadedData = migrateData(res);
      } else {
        const local = localStorage.getItem(`omr_timetable_${selectedDate}`);
        loadedData = migrateData(local ? JSON.parse(local) : null);
        
        // Initialize global data if Firebase is configured
        if (isFirebaseConfigured && !res && loadedData) {
          await saveTimetable(selectedDate, loadedData);
        }
      }
    } catch (e) {
      console.error(e);
      const local = localStorage.getItem(`omr_timetable_${selectedDate}`);
      loadedData = migrateData(local ? JSON.parse(local) : null);
    } finally {
      setData(loadedData || getEmptyTimetable());
      setLoading(false);
    }
  };

  const handleUpdateSlot = async (batch: Batch, sIdx: number, updatedSession: TimetableSession) => {
    const newData = { ...data };
    if (!newData[batch]) newData[batch] = getEmptyTimetable()[batch];
    
    newData[batch][sIdx] = updatedSession;
    
    setData(newData);
    setSaving(true);
    
    try {
      await saveTimetable(date, newData);
      localStorage.setItem(`omr_timetable_${date}`, JSON.stringify(newData));
    } catch (e) {
      console.error(e);
      localStorage.setItem(`omr_timetable_${date}`, JSON.stringify(newData));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <CalendarDays className="w-6 h-6 text-orange-600" />
            <h2>Daily Timetable</h2>
            {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-2" />}
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <label className="text-sm font-semibold text-gray-600 ml-2 whitespace-nowrap">Select Date:</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-1.5 border-none bg-gray-50 rounded-md focus:ring-orange-500 font-medium text-gray-800 w-full md:w-auto"
          />
        </div>
      </div>

      {!isFirebaseConfigured && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium"><strong>Firebase Not Configured:</strong> Timetable data is only being saved locally to this browser and will not sync globally.</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : (
          <div className="p-0 sm:p-4">
            <div className="hidden md:block">
              <TimetableDesktop data={data} onEditSlot={(batch, sIdx, session) => setEditing({ batch, sIdx, session })} />
            </div>
            <div className="block md:hidden">
              <TimetableMobile data={data} onEditSlot={(batch, sIdx, session) => setEditing({ batch, sIdx, session })} />
            </div>
          </div>
        )}
      </div>

      {editing && (
        <EditSlotModal 
          batch={editing.batch}
          session={editing.session}
          onSave={(updatedSession) => {
            handleUpdateSlot(editing.batch, editing.sIdx, updatedSession);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}