import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Settings, CheckCircle, Plus, X, Beaker } from 'lucide-react';
import { evaluateOMRBatch, correctNamesBatch, autoCropAndRotate, OMRResult } from './services/geminiService';
import { saveImage, getImage, deleteImage } from './services/db';
import { processImage, fileToBase64, applyCropAndRotate, rotateImageFile } from './utils/imageProcessing';
import { dataURLtoFile } from './utils/fileUtils';

import SettingsPanel from './components/SettingsPanel';
import RankList from './components/RankList';
import StudentDetail from './components/StudentDetail';
import PrintableRankList from './components/PrintableRankList';
import ReviewModal from './components/ReviewModal';
import Lab from './components/Lab';
import AutoCropTool from './components/lab/AutoCropTool';
import QueueItem, { ProcessedFile } from './components/QueueItem';
import QueueToolbar from './components/QueueToolbar';
import CourseProgress from './components/lab/course-progress/CourseProgress';
import TimetableDashboard from './components/lab/timetable/TimetableDashboard';
import ATRList from './components/lab/atr-list/ATRList';
import QPMaker from './components/lab/qp-maker/QPMaker';
import FeeLogger from './components/lab/fee-logger/FeeLogger';

// Online Exams Imports
import { ExamDashboard, ExamSetup, ExamTake, ExamResults } from './components/lab/online-exams';

const DEFAULT_ATTENDANCE = `ADIL MARZOOQUE\nADISANKAR\nADITHYA RAJ\nADWAID\nAHAMED IRFAN K\nAHAMED JUNAID\nAHLAM HASAN K\nAMAL CHANDRA N\nANJANA K\nANSHIA P\nANSILA KADOORAN\nAPARNA C\nARSHA FATHIMA M\nARSHIN PC\nASWATHY E\nATHUL VB\nAVANI PS\nAYISHA DIYA\nAZAL MHD\nDIYA AK\nDIYA FATHIMA KP\nDIYA MEHRIN K\nDIYA V\nFAHMA VP\nFAIZ AHMED AN\nFARHA P\nFATHIMA DILFA P\nFATHIMA FIZA M\nFATHIMA HIBA PP\nFATHIMA HUDA N\nFATHIMA LIYA A\nFATHIMA MINHA PE\nFATHIMA MISBHA VA\nFATHIMA NASHA\nFATHIMA NASHA CP\nFATHIMA RIFNA A\nFATHIMA SHAHNA PK\nFIDA THASNIM\nGOURI NANDA C\nHAMNA FATHIMA\nHANIYA FATHIMA P\nHANIYYA V\nHASNA SHARI VP\nHIBA FATHIMA KP\nHISHAM MHD\nKRISHNA PRIYA PC\nKRISTHI MUNADHA T\nLASIN ABDULLAH\nLISNA K\nLIYA FATHIMA A\nMAJID A\nMAZIN MHD\nMHD ADNAN K\nMHD AHANN TK\nMHD ANFAS TK\nMHD ASHFAQUE\nMHD DANISH\nMHD DIYAN\nMHD FAIROOZ\nMHD FARHAN K\nMHD FATHIN ALI\nMHD LIYAN P\nMHD MAJID RAMZAN TP\nMHD MUFLIH A\nMHD NAJADH\nMHD RAZAL T\nMHD RISHAN P\nMHD SABITH P\nMHD SABITH TK\nMHD SADHIL V\nMHD SHAFEEQ KK\nMHD SHAHABAS K\nMHD SINAN A\nMILHA RAZACK A\nMINHA PK\nMISHAL AHAMED\nNAIRA ABDUL LATHEEF\nNAJIH AHAMED\nNAJIYA NASRIN C\nNAJVA\nNAJVA FATHIMA C\nNASHA FATHIMA P\nNIDHA FATHIMA K\nNIDHA SHIRIN N\nNITHIN RAJ\nRAJEEBA K\nRANA FATHIMA K\nREHAN ABDUL RAHEEM\nREVATHY K\nRIDHA K\nRIFA CP\nRIFA P\nRINSHA JALIDHA P\nRINSHA SHERIN T\nRIYA SUNEER\nSHABANA JASMIN\nSILNA FATHIMA\nSITHARA BASHEER P\nSIYA TP\nTHANHA FATHIMA`;

const DEFAULT_ANSWER_KEY = `*   **Q1.** B\n*   **Q2.** A\n*   **Q3.** A\n*   **Q4.** B\n*   **Q5.** C\n*   **Q6.** A\n*   **Q7.** A\n*   **Q8.** B\n*   **Q9.** C\n*   **Q10.** D\n*   **Q11.** A\n*   **Q12.** C\n*   **Q13.** B\n*   **Q14.** A\n*   **Q15.** C\n*   **Q16.** A\n*   **Q17.** Cancelled (give mark to everyone)\n*   **Q18.** B\n*   **Q19.** A\n*   **Q20.** C\n*   **Q21.** A\n*   **Q22.** A\n*   **Q23.** A\n*   **Q24.** B\n*   **Q25.** A`;

const DEFAULT_TOPIC_MAPPING = `Here is the classification of the questions by chapter and specific topic based on the NCERT Class 12 Physics syllabus:\n\n### **Chapter 4: Moving Charges and Magnetism**\n*   **Magnetic Force on a Charge:** Q1, Q2\n*   **Biot-Savart Law:** Q3\n*   **Magnetic Field due to a Straight Wire:** Q4\n*   **Magnetic Field due to a Circular Current Loop:** Q5\n*   **The Solenoid (Ampere’s Circuital Law):** Q6\n*   **Force between Two Parallel Currents:** Q7\n*   **Moving Coil Galvanometer (Conversion to Voltmeter):** Q8\n\n### **Chapter 5: Magnetism and Matter**\n*   **The Magnetic Dipole (Magnetic Moment):** Q9\n*   **The Bar Magnet (Axial and Equatorial Fields):** Q10\n*   **Magnetic Dipole in a Uniform Magnetic Field (Potential Energy):** Q11\n*   **Magnetic Properties of Materials (Curie’s Law & Transitions):** Q12, Q13\n\n### **Chapter 6: Electromagnetic Induction (EMI)**\n*   **Magnetic Flux:** Q14, Q15\n*   **Faraday’s and Lenz’s Law (Induced EMF & Charge):** Q16, Q17\n*   **Motional Electromotive Force:** Q18, Q19, Q20\n*   **Eddy Currents:** Q21\n*   **Mutual Induction:** Q22\n*   **AC Generator (Peak EMF):** Q23\n\n### **Chapter 7: Alternating Current**\n*   **AC Voltage Applied to a Series LR Circuit (Impedance & Inductance):** Q24\n*   **Transformers:** Q25`;

type ViewState = 'home' | 'ranklist' | 'detail' | 'printableRanklist' | 'lab' | 'lab-crop' | 'lab-exams' | 'exam-setup' | 'exam-results' | 'exam-take' | 'lab-course-progress' | 'lab-timetable' | 'lab-atr-list' | 'lab-qp-maker' | 'lab-fee-logger';

export default function App() {
  const [view, setView] = useState<ViewState>(() => {
    if (window.location.pathname === '/course-progress') {
      return 'lab-course-progress';
    }
    if (window.location.pathname === '/timetable') {
      return 'lab-timetable';
    }
    if (new URLSearchParams(window.location.search).get('examId')) {
      return 'exam-take';
    }
    return 'lab';
  });

  const [apiKeys, setApiKeys] = useState<string[]>(() => {
    const saved = localStorage.getItem('omr_apiKeysList');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const oldSaved = localStorage.getItem('omr_apiKeys');
    if (oldSaved) return oldSaved.split(',').map(k => k.trim()).filter(Boolean);
    return [''];
  });
  const [liteModel, setLiteModel] = useState<string>(() => localStorage.getItem('omr_liteModel') || 'gemini-3.1-flash-lite-preview');
  const [proModel, setProModel] = useState<string>(() => localStorage.getItem('omr_proModel') || 'gemini-3.1-pro-preview');
  const [availableModels, setAvailableModels] = useState<string[]>(['gemini-3.1-flash-lite-preview', 'gemini-3.1-flash-preview', 'gemini-3.1-pro-preview', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemma-2-2b-it', 'gemma-2-9b-it', 'gemma-2-27b-it']);
  const [imageResolution, setImageResolution] = useState<number>(() => parseInt(localStorage.getItem('omr_imageResolution') || '1024', 10));
  const [sampling, setSampling] = useState<number>(() => {
    const saved = localStorage.getItem('omr_sampling');
    return saved ? parseInt(saved, 10) : 2;
  });
  const [concurrency, setConcurrency] = useState<number>(() => {
    const saved = localStorage.getItem('omr_concurrency');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [requestsPerKey, setRequestsPerKey] = useState<number>(() => {
    const saved = localStorage.getItem('omr_requestsPerKey');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [autoCropEnabled, setAutoCropEnabled] = useState<boolean>(() => {
    return localStorage.getItem('omr_autoCrop') === 'true';
  });

  const [attendanceSheet, setAttendanceSheet] = useState<string>(() => localStorage.getItem('omr_attendance') || DEFAULT_ATTENDANCE);
  const [answerKey, setAnswerKey] = useState<string>(() => localStorage.getItem('omr_answerKey') || DEFAULT_ANSWER_KEY);
  const [topicMapping, setTopicMapping] = useState<string>(() => localStorage.getItem('omr_topicMapping') || DEFAULT_TOPIC_MAPPING);
  const [parsedTopicMapping, setParsedTopicMapping] = useState<any>(() => {
    const saved = localStorage.getItem('omr_parsedTopicMapping');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [showSettings, setShowSettings] = useState(false);
  const [correctNamesOnExport, setCorrectNamesOnExport] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<OMRResult | null>(null);
  
  // Lab Exams State
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

  const [days, setDays] = useState<number[]>(() => {
    const saved = localStorage.getItem('omr_days');
    return saved ? JSON.parse(saved) : [1];
  });
  const [currentDay, setCurrentDay] = useState<number>(() => {
    const saved = localStorage.getItem('omr_currentDay');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [filesByDay, setFilesByDay] = useState<Record<number, ProcessedFile[]>>(() => {
    const savedDays = localStorage.getItem('omr_days');
    const daysList = savedDays ? JSON.parse(savedDays) : [1];
    const initial: Record<number, ProcessedFile[]> = {};
    
    daysList.forEach((day: number) => {
      const saved = localStorage.getItem(`omr_files_${day}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as ProcessedFile[];
          initial[day] = parsed.map(f => f.status === 'processing' ? { ...f, status: 'pending', attempt: 0, stageName: undefined } : f);
        } catch (e) {
          initial[day] = [];
        }
      } else if (day === 1) {
        const oldSaved = localStorage.getItem('omr_files');
        if (oldSaved) {
          try {
            const parsed = JSON.parse(oldSaved) as ProcessedFile[];
            initial[day] = parsed.map(f => f.status === 'processing' ? { ...f, status: 'pending', attempt: 0, stageName: undefined } : f);
          } catch (e) {
            initial[day] = [];
          }
        } else {
          initial[day] = [];
        }
      } else {
        initial[day] = [];
      }
    });
    return initial;
  });

  const files = filesByDay[currentDay] || [];
  const setFiles = (updater: React.SetStateAction<ProcessedFile[]>) => {
    setFilesByDay(prev => {
      const currentFiles = prev[currentDay] || [];
      const newFiles = typeof updater === 'function' ? updater(currentFiles) : updater;
      return { ...prev, [currentDay]: newFiles };
    });
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());
  const [reviewFileId, setReviewFileId] = useState<string | null>(null);
  
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'score' | 'verification_confidence' | 'name_confidence'>('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [isRotating, setIsRotating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  const averageTimeRef = useRef<number>(8000);

  // Manage browser history for popstate navigation
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/course-progress') setView('lab-course-progress');
      else if (window.location.pathname === '/timetable') setView('lab-timetable');
      else if (window.location.pathname === '/') setView('home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => { localStorage.setItem('omr_apiKeysList', JSON.stringify(apiKeys)); }, [apiKeys]);
  useEffect(() => { localStorage.setItem('omr_liteModel', liteModel); }, [liteModel]);
  useEffect(() => { localStorage.setItem('omr_proModel', proModel); }, [proModel]);
  useEffect(() => { localStorage.setItem('omr_imageResolution', imageResolution.toString()); }, [imageResolution]);
  useEffect(() => { localStorage.setItem('omr_sampling', sampling.toString()); }, [sampling]);
  useEffect(() => { localStorage.setItem('omr_concurrency', concurrency.toString()); }, [concurrency]);
  useEffect(() => { localStorage.setItem('omr_requestsPerKey', requestsPerKey.toString()); }, [requestsPerKey]);
  useEffect(() => { localStorage.setItem('omr_autoCrop', autoCropEnabled.toString()); }, [autoCropEnabled]);
  useEffect(() => { localStorage.setItem('omr_attendance', attendanceSheet); }, [attendanceSheet]);
  useEffect(() => { localStorage.setItem('omr_answerKey', answerKey); }, [answerKey]);
  useEffect(() => { localStorage.setItem('omr_topicMapping', topicMapping); }, [topicMapping]);
  useEffect(() => {
    if (parsedTopicMapping) {
      localStorage.setItem('omr_parsedTopicMapping', JSON.stringify(parsedTopicMapping));
    }
  }, [parsedTopicMapping]);
  useEffect(() => { localStorage.setItem('omr_days', JSON.stringify(days)); }, [days]);
  useEffect(() => { localStorage.setItem('omr_currentDay', currentDay.toString()); }, [currentDay]);

  useEffect(() => {
    const missingPreviewFiles = files.filter(f => !f.previewUrl && !failedImageIds.has(f.id));
    
    if (missingPreviewFiles.length > 0) {
      const loadMissingImages = async () => {
        const loadedData = await Promise.all(
          missingPreviewFiles.map(async (f) => {
            try {
              const file = await getImage(f.id);
              if (file) {
                return { id: f.id, file, previewUrl: URL.createObjectURL(file) };
              }
            } catch (e) {
              console.error('Failed to load image from DB', e);
            }
            return { id: f.id, failed: true };
          })
        );

        const newFailedIds = loadedData.filter(l => l.failed).map(l => l.id);
        if (newFailedIds.length > 0) {
          setFailedImageIds(prev => new Set([...prev, ...newFailedIds]));
        }

        setFiles(prev => prev.map(f => {
          const loaded = loadedData.find(l => l.id === f.id);
          if (loaded && loaded.previewUrl) {
            return { ...f, file: loaded.file, previewUrl: loaded.previewUrl };
          }
          return f;
        }));
      };
      
      loadMissingImages();
    }
  }, [files, failedImageIds]);

  useEffect(() => {
    Object.entries(filesByDay).forEach(([day, filesList]) => {
      const filesToSave = filesList.map(f => ({
        ...f,
        file: undefined, 
        previewUrl: undefined 
      }));
      localStorage.setItem(`omr_files_${day}`, JSON.stringify(filesToSave));
    });
  }, [filesByDay]);

  const addDay = () => {
    const newDay = Math.max(...days, 0) + 1;
    setDays(prev => [...prev, newDay]);
    setFilesByDay(prev => ({ ...prev, [newDay]: [] }));
    setCurrentDay(newDay);
  };

  const deleteDay = (dayToDelete: number) => {
    if (days.length <= 1) return;
    if (!window.confirm(`Are you sure you want to delete Day ${dayToDelete}? This will remove all files for this day.`)) return;
    
    const filesToDelete = filesByDay[dayToDelete] || [];
    filesToDelete.forEach(f => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
      deleteImage(f.id);
    });
    
    setDays(prev => prev.filter(d => d !== dayToDelete));
    setFilesByDay(prev => {
      const next = { ...prev };
      delete next[dayToDelete];
      return next;
    });
    localStorage.removeItem(`omr_files_${dayToDelete}`);
    
    if (currentDay === dayToDelete) {
      setCurrentDay(days.find(d => d !== dayToDelete) || 1);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        fileName: file.name,
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending' as const,
      }));
      
      for (const f of newFiles) {
        await saveImage(f.id, f.file);
      }
      
      setFiles(prev => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const removeFile = async (id: string) => {
    await deleteImage(id);
    setFiles(prev => prev.filter(f => f.id !== id));
    setSelectedFileIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const clearAllFiles = async () => {
    if (window.confirm(`Are you sure you want to clear all files and results for Day ${currentDay}?`)) {
      const filesToDelete = filesByDay[currentDay] || [];
      for (const f of filesToDelete) {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        await deleteImage(f.id);
      }
      setFiles([]);
      setSelectedFileIds(new Set());
    }
  };

  const handleUpdateFileImage = async (id: string, newFile: File) => {
    await saveImage(id, newFile);
    const newPreviewUrl = URL.createObjectURL(newFile);
    setFiles(prev => prev.map(f => f.id === id ? { ...f, file: newFile, previewUrl: newPreviewUrl } : f));
  };

  const rotateSelected = async () => {
    if (selectedFileIds.size === 0 || isRotating) return;
    setIsRotating(true);
    
    try {
      for (const id of selectedFileIds) {
        const currentFiles = filesByDay[currentDay] || [];
        const fileIndex = currentFiles.findIndex(f => f.id === id);
        if (fileIndex === -1) continue;
        
        let fileObj = currentFiles[fileIndex].file;
        if (!fileObj) {
          fileObj = await getImage(id);
        }
        
        if (fileObj) {
          const rotatedFile = await rotateImageFile(fileObj, 90);
          await saveImage(id, rotatedFile);
          const newPreviewUrl = URL.createObjectURL(rotatedFile);
          
          setFiles(prev => prev.map(f => {
            if (f.id === id) {
              if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
              return { ...f, file: rotatedFile, previewUrl: newPreviewUrl };
            }
            return f;
          }));
        }
      }
      setSelectedFileIds(new Set());
    } catch (e) {
      console.error("Failed to rotate selected files", e);
      alert("Failed to rotate some images.");
    } finally {
      setIsRotating(false);
    }
  };

  const processFiles = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const keys = apiKeys.filter(k => k.trim());
    const baseConcurrency = Math.max(1, concurrency);
    const reqsPerKey = Math.max(1, requestsPerKey);
    const totalConcurrentRequests = keys.length > 0 ? keys.length * reqsPerKey : 1;
    const concurrencyLimit = totalConcurrentRequests * baseConcurrency;
    
    const pendingIds = files.filter(f => f.status === 'pending' || f.status === 'error').map(f => f.id);
    setProgress({ current: 0, total: pendingIds.length });
    let completedCount = 0;

    for (let i = 0; i < pendingIds.length; i += concurrencyLimit) {
      const chunkIds = pendingIds.slice(i, i + concurrencyLimit);
      
      setFiles(prev => prev.map(f => chunkIds.includes(f.id) ? { ...f, status: 'processing', error: undefined, attempt: 1, maxAttempts: sampling + 3, stageName: `Preparing Image...` } : f));

      try {
        const loadedImagesPromises = chunkIds.map(async (id) => {
          const currentFile = filesByDay[currentDay]?.find(f => f.id === id) || files.find(f => f.id === id);
          if (!currentFile) return null;
          
          let fileObj = currentFile.file;
          if (!fileObj) {
            fileObj = await getImage(id);
            if (!fileObj) return null;
          }

          if (autoCropEnabled) {
            setFiles(prev => prev.map(f => f.id === id ? { ...f, stageName: 'Auto-Cropping (Lite)...' } : f));
            const rawBase64 = await fileToBase64(fileObj);
            try {
              const cropData = await autoCropAndRotate(rawBase64, fileObj.type, keys, liteModel);
              const w = cropData.xmax - cropData.xmin;
              const h = cropData.ymax - cropData.ymin;
              let finalRotation = cropData.rotation;
              
              if (w > h && (finalRotation === 0 || finalRotation === 180)) {
                finalRotation = (finalRotation + 90) % 360;
              }
              
              const { base64, mimeType } = await applyCropAndRotate(fileObj, cropData, finalRotation, imageResolution);
              
              const croppedDataUrl = `data:${mimeType};base64,${base64}`;
              const croppedFile = dataURLtoFile(croppedDataUrl, fileObj.name || 'image.jpg');
              await saveImage(id, croppedFile);
              const newPreviewUrl = URL.createObjectURL(croppedFile);
              
              setFiles(prev => prev.map(f => f.id === id ? { ...f, file: croppedFile, previewUrl: newPreviewUrl } : f));

              return { id, base64, mimeType, fileObj: croppedFile };
            } catch (error: any) {
              console.error(`Auto-crop failed for ${id}, falling back to raw image.`, error);
              const { base64, mimeType } = await processImage(fileObj, imageResolution, 0);
              return { id, base64, mimeType, fileObj };
            }
          } else {
            const { base64, mimeType } = await processImage(fileObj, imageResolution, 0);
            return { id, base64, mimeType, fileObj };
          }
        });

        const loadedResults = await Promise.all(loadedImagesPromises);
        const imagesToProcess = loadedResults.filter(Boolean) as { id: string, base64: string, mimeType: string, fileObj: File }[];

        if (imagesToProcess.length === 0) continue;

        let resultsHistory: Record<string, OMRResult[]> = {};
        for (const img of imagesToProcess) {
          resultsHistory[img.id] = [];
        }
        
        let targetMatches = sampling >= 2 ? 2 : 1;
        let maxAttempts = sampling + 3;
        let finalResults: Record<string, OMRResult> = {};
        let completedIds = new Set<string>();

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          let stageName = attempt < sampling ? `Sampling ${attempt + 1}/${sampling}` : `Verification ${attempt - sampling + 1}`;
          
          const remainingImages = imagesToProcess.filter(img => !completedIds.has(img.id));
          if (remainingImages.length === 0) break;
          
          setFiles(prev => prev.map(f => remainingImages.some(img => img.id === f.id) ? { ...f, attempt: attempt + 1, maxAttempts, stageName } : f));
          
          const attemptStartTime = Date.now();
          
          const chunkedPromises = [];
          for (let k = 0; k < remainingImages.length; k += baseConcurrency) {
            const chunk = remainingImages.slice(k, k + baseConcurrency);
            chunkedPromises.push(evaluateOMRBatch(chunk, keys, proModel, liteModel, answerKey));
          }
          
          const chunkResults = await Promise.all(chunkedPromises);
          const batchResults = chunkResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
          
          const elapsed = Date.now() - attemptStartTime;
          averageTimeRef.current = (averageTimeRef.current * 4 + elapsed) / 5;

          for (const img of remainingImages) {
            if (batchResults[img.id]) {
              resultsHistory[img.id].push(batchResults[img.id]);
            }
            
            if (attempt >= targetMatches - 1) {
              const counts = new Map<string, number>();
              let bestResult: OMRResult | null = null;
              
              for (const r of resultsHistory[img.id]) {
                const key = JSON.stringify(r.scores);
                counts.set(key, (counts.get(key) || 0) + 1);
                if (counts.get(key)! >= targetMatches) {
                  bestResult = resultsHistory[img.id].find(res => JSON.stringify(res.scores) === key) || r;
                  break;
                }
              }
              
              if (bestResult) {
                bestResult.confidences = resultsHistory[img.id].map(r => r.confidence);
                finalResults[img.id] = bestResult;
                completedIds.add(img.id);
              } else if (attempt === maxAttempts - 1) {
                const lastRes = resultsHistory[img.id][resultsHistory[img.id].length - 1];
                if (lastRes) {
                  lastRes.confidences = resultsHistory[img.id].map(r => r.confidence);
                  finalResults[img.id] = lastRes;
                }
                completedIds.add(img.id);
              }
            }
          }
        }

        setFiles(prev => prev.map(f => {
          if (finalResults[f.id]) {
            return { ...f, status: 'success', result: finalResults[f.id] };
          }
          if (chunkIds.includes(f.id) && !finalResults[f.id]) {
            return { ...f, status: 'error', error: 'Failed to evaluate' };
          }
          return f;
        }));

      } catch (error: any) {
        setFiles(prev => prev.map(f => chunkIds.includes(f.id) ? { ...f, status: 'error', error: error.message } : f));
      } finally {
        completedCount += chunkIds.length;
        setProgress(p => ({ ...p, current: completedCount }));
      }
    }

    setIsProcessing(false);
  };

  const retryAllFailed = () => {
    setFiles(prev => prev.map(f => f.status === 'error' ? { ...f, status: 'pending', error: undefined } : f));
  };

  const retryFile = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'pending', error: undefined } : f));
  };

  const recheckAll = () => {
    setFiles(prev => prev.map(f => f.status === 'success' ? { ...f, status: 'pending', error: undefined, result: undefined } : f));
  };

  const recheckFile = (id: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'pending', error: undefined, result: undefined } : f));
  };

  const fixNames = async () => {
    const successfulFiles = files.filter(f => f.status === 'success' && f.result);
    if (successfulFiles.length === 0) return;
    if (!attendanceSheet.trim()) {
      alert('Please enter the attendance sheet first.');
      return;
    }

    setIsProcessing(true);
    try {
      const uniqueNames = Array.from(new Set(successfulFiles.map(f => f.result!.name)));
      const keys = apiKeys.filter(k => k.trim());
      const nameMap = await correctNamesBatch(uniqueNames, attendanceSheet, keys, proModel);
      
      setFiles(prev => prev.map(f => {
        if (f.status === 'success' && f.result && nameMap[f.result.name]) {
          return {
            ...f,
            result: {
              ...f.result,
              name: nameMap[f.result.name].correctedName,
              nameConfidence: nameMap[f.result.name].confidence
            }
          };
        }
        return f;
      }));
    } catch (error) {
      console.error("Failed to fix names:", error);
      alert("Failed to fix names. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const exportCSV = async () => {
    const successfulFiles = files.filter(f => f.status === 'success' && f.result);
    if (successfulFiles.length === 0) return;

    let finalFiles = [...successfulFiles];

    if (correctNamesOnExport && attendanceSheet.trim()) {
      setIsExporting(true);
      try {
        const uniqueNames = Array.from(new Set(successfulFiles.map(f => f.result!.name)));
        const keys = apiKeys.filter(k => k.trim());
        const nameMap = await correctNamesBatch(uniqueNames, attendanceSheet, keys, proModel);
        
        setFiles(prev => prev.map(f => {
          if (f.status === 'success' && f.result && nameMap[f.result.name]) {
            return {
              ...f,
              result: {
                ...f.result,
                name: nameMap[f.result.name].correctedName,
                nameConfidence: nameMap[f.result.name].confidence
              }
            };
          }
          return f;
        }));

        finalFiles = finalFiles.map(f => {
          if (f.result && nameMap[f.result.name]) {
            return {
              ...f,
              result: {
                ...f.result,
                name: nameMap[f.result.name].correctedName,
                nameConfidence: nameMap[f.result.name].confidence
              }
            };
          }
          return f;
        });
      } catch (error: any) {
        alert('Failed to correct names: ' + error.message);
        setIsExporting(false);
        return; 
      }
      setIsExporting(false);
    }

    let csv = 'NAME,RIGHT,WRONG,';
    for (let i = 1; i <= 25; i++) csv += `Q${i},`;
    csv = csv.slice(0, -1) + '\n';

    finalFiles.forEach(f => {
      const r = f.result!;
      let row = `"${r.name.replace(/"/g, '""')}",${r.right},${r.wrong},`;
      for (let i = 1; i <= 25; i++) {
        row += `${r.scores[`q${i}`]},`;
      }
      csv += row.slice(0, -1) + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'omr_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) return;

      const importedFiles: ProcessedFile[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        let cells = [];
        let inQuotes = false;
        let currentCell = '';
        for (let char of lines[i]) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            cells.push(currentCell.trim());
            currentCell = '';
          } else {
            currentCell += char;
          }
        }
        cells.push(currentCell.trim());
        
        if (cells.length < 3) continue;

        const name = cells[0].replace(/^"|"$/g, '').replace(/""/g, '"');
        const right = parseInt(cells[1], 10) || 0;
        const wrong = parseInt(cells[2], 10) || 0;
        
        const scores: Record<string, number> = {};
        if (cells.length >= 4) {
          for (let q = 1; q <= 25; q++) {
            const scoreIdx = 3 + q - 1; 
            scores[`q${q}`] = parseInt(cells[scoreIdx] || '0', 10) || 0;
          }
        }

        importedFiles.push({
          id: `imported-${Date.now()}-${i}`,
          file: new File([], 'imported.csv'),
          fileName: `Imported: ${name}`,
          status: 'success',
          result: {
            name,
            right,
            wrong,
            scores
          }
        });
      }

      setFiles(prev => [...prev, ...importedFiles]);
    };
    reader.readAsText(file);
    
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  };

  const reviewableFiles = files.filter(f => f.result);
  const currentReviewIndex = reviewableFiles.findIndex(f => f.id === reviewFileId);
  const hasNextReview = currentReviewIndex >= 0 && currentReviewIndex < reviewableFiles.length - 1;
  const hasPrevReview = currentReviewIndex > 0;

  const handleNextReview = () => {
    if (hasNextReview) setReviewFileId(reviewableFiles[currentReviewIndex + 1].id);
  };

  const handlePrevReview = () => {
    if (hasPrevReview) setReviewFileId(reviewableFiles[currentReviewIndex - 1].id);
  };

  const handleUpdateResultName = (id: string, newName: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id && f.result) {
        return { ...f, result: { ...f.result, name: newName } };
      }
      return f;
    }));
  };

  const handleUpdateResultScore = (id: string, qNum: number, newScore: number) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id && f.result) {
        const newScores = { ...f.result.scores, [`q${qNum}`]: newScore };
        
        let right = 0;
        let wrong = 0;
        Object.values(newScores).forEach(score => {
          if (score === 1) right++;
          if (score === -1) wrong++;
        });

        return { 
          ...f, 
          result: { 
            ...f.result, 
            scores: newScores,
            right,
            wrong
          } 
        };
      }
      return f;
    }));
  };

  const filteredFiles = files.filter(f => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return f.fileName.toLowerCase().includes(q) || (f.result?.name.toLowerCase().includes(q) ?? false);
  });

  const isAllSelected = filteredFiles.length > 0 && selectedFileIds.size === filteredFiles.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFileIds(new Set(filteredFiles.map(f => f.id)));
    } else {
      setSelectedFileIds(new Set());
    }
  };

  const handleToggleSelect = (id: string, checked: boolean) => {
    const newSet = new Set(selectedFileIds);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedFileIds(newSet);
  };

  const successfulResults = files.filter(f => f.status === 'success' && f.result).map(f => f.result!);
  const sortedResults = [...successfulResults].sort((a, b) => ((b.right * 4) - b.wrong) - ((a.right * 4) - a.wrong));
  const currentDetailIndex = selectedStudent ? sortedResults.findIndex(r => r.name === selectedStudent.name) : -1;
  const hasNextDetail = currentDetailIndex >= 0 && currentDetailIndex < sortedResults.length - 1;
  const hasPrevDetail = currentDetailIndex > 0;

  const handleDetailNext = () => {
    if (hasNextDetail) setSelectedStudent(sortedResults[currentDetailIndex + 1]);
  };
  const handleDetailPrev = () => {
    if (hasPrevDetail) setSelectedStudent(sortedResults[currentDetailIndex - 1]);
  };

  // Dedicated full-screen view for taking the exam
  if (view === 'exam-take') {
    const activeExamId = selectedExamId || new URLSearchParams(window.location.search).get('examId');
    if (!activeExamId) {
      return <div className="p-8 text-center text-red-500">Invalid Exam ID provided.</div>;
    }
    return <ExamTake examId={activeExamId} onFinish={() => {
      window.history.pushState({}, '', '/');
      setView('home');
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans print:bg-white">
      <header className="bg-white shadow-sm border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { window.history.pushState({}, '', '/'); setView('lab'); }}>
            <Beaker className="w-6 h-6 text-purple-600" />
            <h1 className="text-xl font-semibold tracking-tight">AIMS Plus Lab</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { window.history.pushState({}, '', '/'); setView('lab'); }}
              className={`flex items-center gap-2 p-2 rounded-md transition-colors ${view === 'lab' || view.startsWith('lab-') || view.startsWith('exam') ? 'text-purple-600 bg-purple-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              <Beaker className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Home</span>
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:m-0 print:max-w-none print:space-y-0">
        
        {view === 'home' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 print:hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {days.map(day => (
              <div key={day} className="flex items-center shrink-0">
                <button
                  onClick={() => setCurrentDay(day)}
                  className={`px-4 py-2 rounded-l-md font-medium text-sm transition-colors ${currentDay === day ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'}`}
                >
                  Day {day}
                </button>
                {days.length > 1 && (
                  <button
                    onClick={() => deleteDay(day)}
                    className={`px-2 py-2 rounded-r-md border-y border-r text-sm transition-colors ${currentDay === day ? 'bg-blue-700 text-white border-blue-700 hover:bg-blue-800' : 'bg-white text-gray-400 border-gray-200 hover:bg-red-50 hover:text-red-500'}`}
                    title="Delete Day"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addDay}
              className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Day
            </button>
          </div>
        )}

        {showSettings && (
          <SettingsPanel
            apiKeys={apiKeys}
            setApiKeys={setApiKeys}
            liteModel={liteModel}
            setLiteModel={setLiteModel}
            proModel={proModel}
            setProModel={setProModel}
            availableModels={availableModels}
            setAvailableModels={setAvailableModels}
            imageResolution={imageResolution}
            setImageResolution={setImageResolution}
            sampling={sampling}
            setSampling={setSampling}
            concurrency={concurrency}
            setConcurrency={setConcurrency}
            requestsPerKey={requestsPerKey}
            setRequestsPerKey={setRequestsPerKey}
            autoCropEnabled={autoCropEnabled}
            setAutoCropEnabled={setAutoCropEnabled}
            answerKey={answerKey}
            setAnswerKey={setAnswerKey}
            attendanceSheet={attendanceSheet}
            setAttendanceSheet={setAttendanceSheet}
            topicMapping={topicMapping}
            setTopicMapping={setTopicMapping}
            parsedTopicMapping={parsedTopicMapping}
            setParsedTopicMapping={setParsedTopicMapping}
          />
        )}

        {view === 'lab' && (
          <Lab onNavigate={(v) => {
            if (v === 'home') {
              window.history.pushState({}, '', '/');
              setView('home');
            } else if (v === 'lab-course-progress') {
              window.history.pushState({}, '', '/course-progress');
              setView('lab-course-progress');
            } else if (v === 'lab-timetable') {
              window.history.pushState({}, '', '/timetable');
              setView('lab-timetable');
            } else {
              setView(v);
            }
          }} />
        )}

        {view === 'lab-crop' && (
          <AutoCropTool apiKeys={apiKeys} liteModel={liteModel} onBack={() => setView('lab')} />
        )}
        
        {view === 'lab-exams' && (
          <ExamDashboard 
            onNavigate={(v, id) => { 
              if (id) setSelectedExamId(id); 
              setView(v); 
            }} 
            onBack={() => setView('lab')} 
          />
        )}
        
        {view === 'exam-setup' && (
          <ExamSetup onNavigate={(v) => setView(v)} />
        )}

        {view === 'exam-results' && selectedExamId && (
          <ExamResults examId={selectedExamId} onBack={() => setView('lab-exams')} />
        )}

        {view === 'lab-course-progress' && (
          <CourseProgress onBack={() => {
            window.history.pushState({}, '', '/');
            setView('lab');
          }} />
        )}

        {view === 'lab-timetable' && (
          <TimetableDashboard onBack={() => {
            window.history.pushState({}, '', '/');
            setView('lab');
          }} />
        )}

        {view === 'lab-atr-list' && (
          <ATRList onBack={() => setView('lab')} />
        )}

        {view === 'lab-qp-maker' && (
          <QPMaker onBack={() => setView('lab')} />
        )}

        {view === 'lab-fee-logger' && (
          <FeeLogger 
            onBack={() => setView('lab')} 
            apiKeys={apiKeys} 
            model={proModel} 
            concurrency={concurrency}
            requestsPerKey={requestsPerKey}
          />
        )}

        {view === 'ranklist' && (
          <RankList 
            files={files} 
            topicMapping={topicMapping} 
            parsedTopicMapping={parsedTopicMapping}
            onBack={() => setView('home')} 
            onStudentClick={(student) => {
              setSelectedStudent(student);
              setView('detail');
            }}
            onPrintableClick={() => setView('printableRanklist')}
          />
        )}

        {view === 'printableRanklist' && (
          <PrintableRankList
            files={files}
            topicMapping={topicMapping}
            parsedTopicMapping={parsedTopicMapping}
            onBack={() => setView('ranklist')}
          />
        )}

        {view === 'detail' && selectedStudent && (
          <StudentDetail 
            student={selectedStudent} 
            topicMapping={topicMapping} 
            parsedTopicMapping={parsedTopicMapping}
            onBack={() => setView('ranklist')} 
            onNext={handleDetailNext}
            onPrev={handleDetailPrev}
            hasNext={hasNextDetail}
            hasPrev={hasPrevDetail}
          />
        )}

        {view === 'home' && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Upload className="w-8 h-8 mb-3" />
                <span className="font-medium">Upload OMR Images</span>
                <span className="text-sm mt-1">Supports bulk upload</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </div>
              
              <div 
                onClick={() => cameraInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Camera className="w-8 h-8 mb-3" />
                <span className="font-medium">Take Picture</span>
                <span className="text-sm mt-1">Use device camera</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  ref={cameraInputRef}
                  onChange={handleFileUpload}
                />
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <QueueToolbar
                filesLength={files.length}
                hasErrors={files.some(f => f.status === 'error')}
                hasSuccess={files.some(f => f.status === 'success')}
                isProcessing={isProcessing}
                isExporting={isExporting}
                isRotating={isRotating}
                autoCropEnabled={autoCropEnabled}
                setAutoCropEnabled={setAutoCropEnabled}
                correctNamesOnExport={correctNamesOnExport}
                setCorrectNamesOnExport={setCorrectNamesOnExport}
                onClearAll={clearAllFiles}
                onRetryFailed={retryAllFailed}
                onRecheckAll={recheckAll}
                onProcess={processFiles}
                onFixNames={fixNames}
                onExportCSV={exportCSV}
                onImportCSVClick={() => csvInputRef.current?.click()}
                onViewRankList={() => setView('ranklist')}
                allSuccess={files.length > 0 && files.every(f => f.status === 'success')}
                selectedCount={selectedFileIds.size}
                isAllSelected={isAllSelected}
                onSelectAll={handleSelectAll}
                onRotateSelected={rotateSelected}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={csvInputRef}
                onChange={handleImportCSV}
              />
              
              {files.length > 0 && (
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 font-medium">Sort by:</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 py-1"
                    >
                      <option value="default">Default (Upload Order)</option>
                      <option value="name">Name</option>
                      <option value="score">Score</option>
                      <option value="verification_confidence">Verification Confidence</option>
                      <option value="name_confidence">Name Confidence</option>
                    </select>
                    {sortBy !== 'default' && (
                      <button 
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-1.5 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors"
                        title={sortOrder === 'asc' ? "Ascending" : "Descending"}
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {isProcessing && progress.total > 0 && (
                <div className="w-full bg-gray-200 h-1.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-1.5 transition-all duration-300 ease-out" 
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
              )}
              
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {filteredFiles.length > 0 ? (
                  [...filteredFiles].sort((a, b) => {
                    if (sortBy === 'default') return 0;
                    
                    if (a.status !== 'success' && b.status === 'success') return 1;
                    if (a.status === 'success' && b.status !== 'success') return -1;
                    if (a.status !== 'success' && b.status !== 'success') return 0;
                    
                    const resA = a.result!;
                    const resB = b.result!;
                    
                    let comparison = 0;
                    switch (sortBy) {
                      case 'name':
                        comparison = resA.name.localeCompare(resB.name);
                        break;
                      case 'score':
                        const scoreA = (resA.right * 4) - resA.wrong;
                        const scoreB = (resB.right * 4) - resB.wrong;
                        comparison = scoreA - scoreB;
                        break;
                      case 'verification_confidence':
                        const confA = resA.confidence ?? 0;
                        const confB = resB.confidence ?? 0;
                        comparison = confA - confB;
                        break;
                      case 'name_confidence':
                        const nameConfA = resA.nameConfidence ?? 0;
                        const nameConfB = resB.nameConfidence ?? 0;
                        comparison = nameConfA - nameConfB;
                        break;
                    }
                    
                    return sortOrder === 'asc' ? comparison : -comparison;
                  }).map((file) => (
                    <QueueItem
                      key={file.id}
                      file={file}
                      isProcessing={isProcessing}
                      averageTime={averageTimeRef.current}
                      isSelected={selectedFileIds.has(file.id)}
                      onToggleSelect={handleToggleSelect}
                      onRemove={removeFile}
                      onRetry={retryFile}
                      onRecheck={recheckFile}
                      onClick={() => {
                        if (file.status === 'success') {
                          setReviewFileId(file.id);
                        }
                      }}
                    />
                  ))
                ) : (
                  <div className="p-12 text-center text-gray-500">
                    {files.length === 0 ? "No images in queue. Upload some to get started." : "No files matched your search."}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {reviewFileId && (
        <ReviewModal
          fileId={reviewFileId}
          fileName={files.find(f => f.id === reviewFileId)?.fileName || ''}
          previewUrl={files.find(f => f.id === reviewFileId)?.previewUrl}
          result={files.find(f => f.id === reviewFileId)?.result}
          answerKey={answerKey}
          onClose={() => setReviewFileId(null)}
          onRetry={(id) => {
            recheckFile(id);
          }}
          isProcessing={isProcessing}
          onNext={handleNextReview}
          onPrev={handlePrevReview}
          hasNext={hasNextReview}
          hasPrev={hasPrevReview}
          onUpdateName={handleUpdateResultName}
          onUpdateScore={handleUpdateResultScore}
          onUpdateImage={handleUpdateFileImage}
        />
      )}
    </div>
  );
}
