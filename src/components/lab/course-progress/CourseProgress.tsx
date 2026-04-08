import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Download, Loader2, RotateCcw, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SubjectProgress, TaskData, TaskStatus, BatchName, CourseProgressMap } from './types';
import { initialData } from './initialData';
import SubjectView from './SubjectView';
import { getCourseProgress, saveCourseProgress, isFirebaseConfigured } from '../../../services/firebaseService';

const BATCHES: BatchName[] = ['B1', 'B2', 'B3'];

const cloneProgress = (data: SubjectProgress[]) => JSON.parse(JSON.stringify(data)) as SubjectProgress[];

export default function CourseProgress({ onBack }: { onBack: () => void }) {
  const [progressMap, setProgressMap] = useState<CourseProgressMap>({
    B1: cloneProgress(initialData),
    B2: cloneProgress(initialData),
    B3: cloneProgress(initialData)
  });
  const [selectedBatch, setSelectedBatch] = useState<BatchName>('B1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<number | null>(null);

  const data = progressMap[selectedBatch] || [];

  // Helper to migrate old fields to new TaskData format
  const migrateTask = (val: any): TaskData => {
    if (!val) return { status: 'pending', sessions: [] };
    
    // If it's already TaskData (has status and sessions array)
    if (val.status && Array.isArray(val.sessions)) {
      return val as TaskData;
    }
    
    // If it was the previous SessionData[] format
    if (Array.isArray(val)) {
      const hasOngoing = val.some(v => v.status === 'ongoing');
      const allFinished = val.length > 0 && val.every(v => v.status === 'finished');
      const status: TaskStatus = allFinished ? 'finished' : (hasOngoing ? 'ongoing' : (val.length > 0 ? 'finished' : 'pending'));
      
      const cleanSessions = val.map(v => {
        const { status, ...rest } = v; // Strip old status from sessions
        return { ...rest, id: v.id || Math.random().toString(36).substring(7) };
      });
      return { status, sessions: cleanSessions };
    }
    
    // If it was the old string format
    if (typeof val === 'string') {
      return { 
        status: 'finished', 
        sessions: [{ id: Math.random().toString(36).substring(7), teacher: val }] 
      };
    }
    
    // If it was the old single object format
    if (typeof val === 'object' && val.status && val.teacher !== undefined) {
      const { status, ...rest } = val;
      return { 
        status: status as TaskStatus, 
        sessions: [{ id: Math.random().toString(36).substring(7), ...rest }] 
      };
    }
    
    return { status: 'pending', sessions: [] };
  };

  useEffect(() => {
    document.title = 'AIMS - Course Progress';
    fetchData();
    return () => { document.title = 'OMR Checker Pro'; };
  }, []);

  const migrateSubject = (sub: any): SubjectProgress => ({
    ...sub,
    chapters: sub.chapters.map((ch: any) => ({
      ...ch,
      tcr: migrateTask(ch.tcr),
      entrance: migrateTask(ch.entrance),
      revision: migrateTask(ch.revision)
    }))
  });

  const createProgressMap = (subjects: SubjectProgress[]): CourseProgressMap => ({
    B1: subjects,
    B2: cloneProgress(subjects),
    B3: cloneProgress(subjects)
  });

  const loadProgress = (raw: any): CourseProgressMap => {
    if (Array.isArray(raw)) {
      return createProgressMap(raw.map(migrateSubject));
    }

    if (raw && typeof raw === 'object') {
      return {
        B1: raw.B1 && Array.isArray(raw.B1) ? raw.B1.map(migrateSubject) : cloneProgress(initialData),
        B2: raw.B2 && Array.isArray(raw.B2) ? raw.B2.map(migrateSubject) : cloneProgress(initialData),
        B3: raw.B3 && Array.isArray(raw.B3) ? raw.B3.map(migrateSubject) : cloneProgress(initialData)
      };
    }

    return {
      B1: cloneProgress(initialData),
      B2: cloneProgress(initialData),
      B3: cloneProgress(initialData)
    };
  };

  const fetchData = async () => {
    try {
      const res = await getCourseProgress();
      const loadedProgress = loadProgress(res);
      setProgressMap(loadedProgress);

      if (isFirebaseConfigured) {
        await saveCourseProgress(loadedProgress);
      }
    } catch (e) {
      console.error('Failed to load from Firebase, falling back to local storage', e);
      const saved = localStorage.getItem('omr_course_progress');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProgressMap(loadProgress(parsed));
        } catch (err) {
          setProgressMap(loadProgress(null));
        }
      } else {
        setProgressMap(loadProgress(null));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveMap = async (map: CourseProgressMap) => {
    setSaving(true);
    try {
      await saveCourseProgress(map);
      localStorage.setItem('omr_course_progress', JSON.stringify(map));
    } catch (e) {
      console.error('Failed to save to Firebase', e);
      localStorage.setItem('omr_course_progress', JSON.stringify(map));
    } finally {
      setSaving(false);
    }
  };

  const updateChapter = async (subjectIdx: number, chapterIdx: number, field: 'tcr' | 'entrance' | 'revision', taskData: TaskData) => {
    const currentBatch = data;
    const newData = [...currentBatch];
    const newSubject = { ...newData[subjectIdx] };
    const newChapters = [...newSubject.chapters];
    const newChapter = { ...newChapters[chapterIdx] };

    newChapter[field] = taskData;
    newChapters[chapterIdx] = newChapter;
    newSubject.chapters = newChapters;
    newData[subjectIdx] = newSubject;

    const updatedMap = { ...progressMap, [selectedBatch]: newData };
    setProgressMap(updatedMap);
    await saveMap(updatedMap);
  };

  const handleReset = async () => {
    if (!window.confirm(`Are you sure you want to reset course progress for ${selectedBatch}? This cannot be undone.`)) return;

    const resetBatch = data.map((sub) => ({
      ...sub,
      chapters: sub.chapters.map((ch) => ({
        ...ch,
        tcr: { status: 'pending', sessions: [] } as TaskData,
        entrance: { status: 'pending', sessions: [] } as TaskData,
        revision: { status: 'pending', sessions: [] } as TaskData
      }))
    }));

    const resetMap = { ...progressMap, [selectedBatch]: resetBatch };
    setProgressMap(resetMap);
    await saveMap(resetMap);
  };

  const handleExport = () => {
    const wsData = [['Class', 'Subject', 'Chapter', 'TCR', 'Entrance', 'Revision']];

    const formatTask = (task: TaskData) => {
      const sessionStr = task.sessions.map((s) => s.teacher || 'Unassigned').join(', ');
      return sessionStr ? `${sessionStr} [${task.status.toUpperCase()}]` : `[${task.status.toUpperCase()}]`;
    };

    data.forEach((sub) => {
      sub.chapters.forEach((ch) => {
        wsData.push([
          selectedBatch,
          sub.name,
          ch.name,
          formatTask(ch.tcr),
          formatTask(ch.entrance),
          formatTask(ch.revision)
        ]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Course Progress ${selectedBatch}`);
    ws['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 40 }, { wch: 30 }, { wch: 30 }, { wch: 30 }];
    XLSX.writeFile(wb, `Course_Progress_${selectedBatch}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (selectedSubjectIndex !== null) {
    return (
      <SubjectView 
        subject={data[selectedSubjectIndex]} 
        onBack={() => setSelectedSubjectIndex(null)}
        onUpdate={(cIdx, field, taskData) => updateChapter(selectedSubjectIndex, cIdx, field, taskData)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <BookOpen className="w-6 h-6 text-green-600" />
              <h2>Course Progress</h2>
              {saving && <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-2" />}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {BATCHES.map((batch) => (
              <button
                key={batch}
                type="button"
                onClick={() => {
                  setSelectedBatch(batch);
                  setSelectedSubjectIndex(null);
                }}
                className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${selectedBatch === batch ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              >
                {batch}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md font-medium hover:bg-red-100 transition-colors shadow-sm border border-red-200 flex-1 md:flex-none"
          >
            <RotateCcw className="w-4 h-4" /> Reset Class
          </button>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors shadow-sm flex-1 md:flex-none"
          >
            <Download className="w-4 h-4" /> Export XLS
          </button>
        </div>
      </div>

      {!isFirebaseConfigured && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium"><strong>Firebase Not Configured:</strong> Course Progress data is only being saved locally to this browser and will not sync globally across devices.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((subject, idx) => {
          const totalTasks = subject.chapters.length * 3;
          const completedTasks = subject.chapters.reduce((acc, ch) => {
            return acc + (ch.tcr.status === 'finished' ? 1 : 0) 
                       + (ch.entrance.status === 'finished' ? 1 : 0) 
                       + (ch.revision.status === 'finished' ? 1 : 0);
          }, 0);
          const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

          return (
            <div 
              key={subject.name}
              onClick={() => setSelectedSubjectIndex(idx)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-green-300 transition-all"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase">{subject.name}</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-600">
                  <span>Progress</span>
                  <span>{percent}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{completedTasks} of {totalTasks} tasks fully completed</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}