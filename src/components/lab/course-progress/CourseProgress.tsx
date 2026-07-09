import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BookOpen, Download, Upload, Loader2, RotateCcw, AlertTriangle } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { SubjectProgress, TaskData, TaskStatus, BatchName, CourseProgressMap } from './types';
import { initialData, initialDataB1, initialDataB2, initialDataB3 } from './initialData';
import SubjectView from './SubjectView';
import { getCourseProgress, saveCourseProgress, isFirebaseConfigured } from '../../../services/firebaseService';

const BATCHES: BatchName[] = ['B1', 'B2', 'B3'];

const cloneProgress = (data: SubjectProgress[]) => JSON.parse(JSON.stringify(data)) as SubjectProgress[];

export default function CourseProgress({ onBack }: { onBack: () => void }) {
  const [progressMap, setProgressMap] = useState<CourseProgressMap>({
    B1: cloneProgress(initialDataB1),
    B2: cloneProgress(initialDataB2),
    B3: cloneProgress(initialDataB3)
  });
  const [selectedBatch, setSelectedBatch] = useState<BatchName>('B1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        B1: raw.B1 && Array.isArray(raw.B1) ? raw.B1.map(migrateSubject) : cloneProgress(initialDataB1),
        B2: raw.B2 && Array.isArray(raw.B2) ? raw.B2.map(migrateSubject) : cloneProgress(initialDataB2),
        B3: raw.B3 && Array.isArray(raw.B3) ? raw.B3.map(migrateSubject) : cloneProgress(initialDataB3)
      };
    }

    return {
      B1: cloneProgress(initialDataB1),
      B2: cloneProgress(initialDataB2),
      B3: cloneProgress(initialDataB3)
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

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    const greenFill: ExcelJS.Fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00FF00' }
    };

    const getTeacherStr = (task: TaskData) => {
      return task.sessions.map((s) => s.teacher).filter(Boolean).join(', ') || '';
    };

    progressMap.B1.forEach((sub, sIdx) => {
      if (sIdx > 0) {
        worksheet.addRow([]); // Blank row between subjects
      }

      // Batch header row
      const batchRow = worksheet.addRow([
        null, 'B1', 'B1', 'B1', 'B2', 'B2', 'B2', 'B3', 'B3', 'B3'
      ]);

      // Subject header row
      const subHeaderRow = worksheet.addRow([
        sub.name.toUpperCase(),
        'TCR', 'Entrance ', 'Revision ',
        'TCR', 'Entrance ', 'Revision ',
        'TCR', 'Entrance ', 'Revision '
      ]);

      // Make headers bold
      batchRow.font = { bold: true };
      subHeaderRow.font = { bold: true };

      sub.chapters.forEach((ch, cIdx) => {
        const b1Ch = progressMap.B1[sIdx].chapters[cIdx];
        const b2Ch = progressMap.B2[sIdx].chapters[cIdx];
        const b3Ch = progressMap.B3[sIdx].chapters[cIdx];

        const rowData = [
          ch.name,
          getTeacherStr(b1Ch.tcr),
          getTeacherStr(b1Ch.entrance),
          getTeacherStr(b1Ch.revision),
          getTeacherStr(b2Ch.tcr),
          getTeacherStr(b2Ch.entrance),
          getTeacherStr(b2Ch.revision),
          getTeacherStr(b3Ch.tcr),
          getTeacherStr(b3Ch.entrance),
          getTeacherStr(b3Ch.revision)
        ];

        const row = worksheet.addRow(rowData);

        const tasks = [
          { ch: b1Ch, field: 'tcr', col: 2 },
          { ch: b1Ch, field: 'entrance', col: 3 },
          { ch: b1Ch, field: 'revision', col: 4 },
          { ch: b2Ch, field: 'tcr', col: 5 },
          { ch: b2Ch, field: 'entrance', col: 6 },
          { ch: b2Ch, field: 'revision', col: 7 },
          { ch: b3Ch, field: 'tcr', col: 8 },
          { ch: b3Ch, field: 'entrance', col: 9 },
          { ch: b3Ch, field: 'revision', col: 10 }
        ];

        tasks.forEach(({ ch: batchCh, field, col }) => {
          const task = batchCh[field as 'tcr' | 'entrance' | 'revision'];
          if (task.status === 'finished') {
            row.getCell(col).fill = greenFill;
          }
        });
      });
    });

    // Auto-fit column widths
    worksheet.columns.forEach((col, idx) => {
      if (idx === 0) {
        col.width = 40;
      } else {
        col.width = 15;
      }
    });

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'Course_Progress_All_Batches.xlsx');
    } catch (err) {
      console.error('Failed to export Excel file:', err);
      alert('Failed to export Excel file.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const buffer = evt.target?.result as ArrayBuffer;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const sheet = workbook.worksheets[0];

        // Start with a clean copy of the initial empty baseline structure for B1, B2, B3
        const parsedMap: CourseProgressMap = {
          B1: cloneProgress(initialData),
          B2: cloneProgress(initialData),
          B3: cloneProgress(initialData)
        };

        let currentSubject: string | null = null;

        const mapCellToTask = (cell: ExcelJS.Cell): TaskData => {
          const val = cell.value;
          const teacher = val ? String(val).trim() : '';

          if (!teacher) {
            return { status: 'pending', sessions: [] };
          }

          let isGreen = false;
          if (cell.fill && cell.fill.type === 'pattern' && cell.fill.fgColor) {
            const argb = cell.fill.fgColor.argb;
            if (argb === 'FF00FF00' || argb === '00FF00') {
              isGreen = true;
            }
          }

          return {
            status: isGreen ? 'finished' : 'ongoing',
            sessions: [{
              id: Math.random().toString(36).substring(7),
              teacher
            }]
          };
        };

        for (let i = 1; i <= sheet.rowCount; i++) {
          const row = sheet.getRow(i);
          const col1 = row.getCell(1).value;
          const col2 = row.getCell(2).value;

          const col1Str = col1 ? String(col1).trim() : '';
          const col2Str = col2 ? String(col2).trim() : '';

          if (!col1Str) continue;

          if (col2Str === 'TCR') {
            currentSubject = col1Str;
          } else if (currentSubject) {
            const sIdxB1 = parsedMap.B1.findIndex(s => s.name.toUpperCase() === currentSubject!.toUpperCase());
            const sIdxB2 = parsedMap.B2.findIndex(s => s.name.toUpperCase() === currentSubject!.toUpperCase());
            const sIdxB3 = parsedMap.B3.findIndex(s => s.name.toUpperCase() === currentSubject!.toUpperCase());

            if (sIdxB1 !== -1) {
              const chB1 = parsedMap.B1[sIdxB1].chapters.find(c => c.name.trim().toUpperCase() === col1Str.toUpperCase());
              if (chB1) {
                chB1.tcr = mapCellToTask(row.getCell(2));
                chB1.entrance = mapCellToTask(row.getCell(3));
                chB1.revision = mapCellToTask(row.getCell(4));
              }
            }

            if (sIdxB2 !== -1) {
              const chB2 = parsedMap.B2[sIdxB2].chapters.find(c => c.name.trim().toUpperCase() === col1Str.toUpperCase());
              if (chB2) {
                chB2.tcr = mapCellToTask(row.getCell(5));
                chB2.entrance = mapCellToTask(row.getCell(6));
                chB2.revision = mapCellToTask(row.getCell(7));
              }
            }

            if (sIdxB3 !== -1) {
              const chB3 = parsedMap.B3[sIdxB3].chapters.find(c => c.name.trim().toUpperCase() === col1Str.toUpperCase());
              if (chB3) {
                chB3.tcr = mapCellToTask(row.getCell(8));
                chB3.entrance = mapCellToTask(row.getCell(9));
                chB3.revision = mapCellToTask(row.getCell(10));
              }
            }
          }
        }

        setProgressMap(parsedMap);
        await saveMap(parsedMap);
        alert('Successfully imported course progress from XLSX!');
      } catch (err) {
        console.error(err);
        alert('Failed to parse the imported XLSX file. Please ensure it matches the correct template format.');
      } finally {
        setImporting(false);
      }
    };

    reader.readAsArrayBuffer(file);
    e.target.value = '';
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".xlsx"
            className="hidden"
          />
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-md font-medium hover:bg-red-100 transition-colors shadow-sm border border-red-200 flex-1 md:flex-none"
          >
            <RotateCcw className="w-4 h-4" /> Reset Class
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-md font-medium hover:bg-gray-50 transition-colors shadow-sm flex-1 md:flex-none disabled:opacity-50"
          >
            {importing ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Import XLS
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

          const totalChapters = subject.chapters.length;
          const completedTCRChapters = subject.chapters.filter(ch => ch.tcr.status === 'finished').length;
          const chapterPercent = totalChapters === 0 ? 0 : Math.round((completedTCRChapters / totalChapters) * 100);

          return (
            <div 
              key={subject.name}
              onClick={() => setSelectedSubjectIndex(idx)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-green-300 transition-all"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase">{subject.name}</h3>
              <div className="space-y-4">
                {/* Progress Percentages Header */}
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <span>Progress</span>
                  <div className="flex gap-3">
                    <span className="text-blue-600 font-bold">TCR: {chapterPercent}%</span>
                    <span className="text-green-600 font-bold">Tasks: {percent}%</span>
                  </div>
                </div>

                {/* Layered Progress Bar Container */}
                <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  {/* Chapter Progress (TCR) - Transparent Blue */}
                  <div 
                    className="absolute top-0 left-0 bg-blue-500/30 h-full rounded-full transition-all"
                    style={{ width: `${chapterPercent}%` }}
                  />
                  {/* Task Progress - Solid Green */}
                  <div 
                    className="absolute top-0 left-0 bg-green-500 h-full rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Detailed progress description */}
                <div className="flex flex-col gap-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Chapters Taught (TCR):</span>
                    <span className="font-semibold text-blue-600">{completedTCRChapters} of {totalChapters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Tasks Completed:</span>
                    <span className="font-semibold text-green-600">{completedTasks} of {totalTasks}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}