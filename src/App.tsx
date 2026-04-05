import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, Settings, Download, Trash2, CheckCircle, XCircle, AlertCircle, Play, RefreshCw, FileImage, Loader2, Plus, Minus, RotateCcw, Trophy } from 'lucide-react';
import { evaluateOMR, evaluateOMRBatch, fetchAvailableModels, correctNamesBatch, parseTopicMappingWithAI, extractTextFromDocument, OMRResult } from './services/geminiService';
import { saveImage, getImage, deleteImage, clearImages } from './services/db';
import RankList from './components/RankList';
import StudentDetail from './components/StudentDetail';
import PrintableRankList from './components/PrintableRankList';
import TopicEditor from './components/TopicEditor';
import ReviewModal from './components/ReviewModal';
import PredictiveProgressBar from './components/PredictiveProgressBar';

interface ProcessedFile {
  id: string;
  fileName: string;
  file?: File;
  previewUrl?: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  attempt?: number;
  maxAttempts?: number;
  stageName?: string;
  result?: OMRResult;
  error?: string;
}

const DEFAULT_ATTENDANCE = `ADIL MARZOOQUE
ADISANKAR
ADITHYA RAJ
ADWAID
AHAMED IRFAN K
AHAMED JUNAID
AHLAM HASAN K
AMAL CHANDRA N
ANJANA K
ANSHIA P
ANSILA KADOORAN
APARNA C
ARSHA FATHIMA M
ARSHIN PC
ASWATHY E
ATHUL VB
AVANI PS
AYISHA DIYA
AZAL MHD
DIYA AK
DIYA FATHIMA KP
DIYA MEHRIN K
DIYA V
FAHMA VP
FAIZ AHMED AN
FARHA P
FATHIMA DILFA P
FATHIMA FIZA M
FATHIMA HIBA PP
FATHIMA HUDA N
FATHIMA LIYA A
FATHIMA MINHA PE
FATHIMA MISBHA VA
FATHIMA NASHA
FATHIMA NASHA CP
FATHIMA RIFNA A
FATHIMA SHAHNA PK
FIDA THASNIM
GOURI NANDA C
HAMNA FATHIMA
HANIYA FATHIMA P
HANIYYA V
HASNA SHARI VP
HIBA FATHIMA KP
HISHAM MHD
KRISHNA PRIYA PC
KRISTHI MUNADHA T
LASIN ABDULLAH
LISNA K
LIYA FATHIMA A
MAJID A
MAZIN MHD
MHD ADNAN K
MHD AHANN TK
MHD ANAS P
MHD ANFAS TK
MHD ASHFAQUE
MHD DANISH
MHD DIYAN
MHD FAIROOZ
MHD FARHAN K
MHD FATHIN ALI
MHD LIYAN P
MHD MAJID RAMZAN TP
MHD MUFLIH A
MHD NAJADH
MHD RAZAL T
MHD RISHAN P
MHD SABITH P
MHD SABITH TK
MHD SADHIL V
MHD SHAFEEQ KK
MHD SHAHABAS K
MHD SINAN A
MILHA RAZACK A
MINHA PK
MISHAL AHAMED
NAIRA ABDUL LATHEEF
NAJIH AHAMED
NAJIYA NASRIN C
NAJVA
NAJVA FATHIMA C
NASHA FATHIMA P
NIDHA FATHIMA K
NIDHA SHIRIN N
NITHIN RAJ
RAJEEBA K
RANA FATHIMA K
REHAN ABDUL RAHEEM
REVATHY K
RIDHA K
RIFA CP
RIFA P
RINSHA JALIDHA P
RINSHA SHERIN T
RIYA SUNEER
SHABANA JASMIN
SILNA FATHIMA
SITHARA BASHEER P
SIYA TP
THANHA FATHIMA`;

const DEFAULT_ANSWER_KEY = `*   **Q1.** B
*   **Q2.** A
*   **Q3.** A
*   **Q4.** B
*   **Q5.** C
*   **Q6.** A
*   **Q7.** A
*   **Q8.** B
*   **Q9.** C
*   **Q10.** D
*   **Q11.** A
*   **Q12.** C
*   **Q13.** B
*   **Q14.** A
*   **Q15.** C
*   **Q16.** A
*   **Q17.** Cancelled (give mark to everyone)
*   **Q18.** B
*   **Q19.** A
*   **Q20.** C
*   **Q21.** A
*   **Q22.** A
*   **Q23.** A
*   **Q24.** B
*   **Q25.** A`;

const DEFAULT_TOPIC_MAPPING = `Here is the classification of the questions by chapter and specific topic based on the NCERT Class 12 Physics syllabus:

### **Chapter 4: Moving Charges and Magnetism**
*   **Magnetic Force on a Charge:** Q1, Q2
*   **Biot-Savart Law:** Q3
*   **Magnetic Field due to a Straight Wire:** Q4
*   **Magnetic Field due to a Circular Current Loop:** Q5
*   **The Solenoid (Ampere’s Circuital Law):** Q6
*   **Force between Two Parallel Currents:** Q7
*   **Moving Coil Galvanometer (Conversion to Voltmeter):** Q8

### **Chapter 5: Magnetism and Matter**
*   **The Magnetic Dipole (Magnetic Moment):** Q9
*   **The Bar Magnet (Axial and Equatorial Fields):** Q10
*   **Magnetic Dipole in a Uniform Magnetic Field (Potential Energy):** Q11
*   **Magnetic Properties of Materials (Curie’s Law & Transitions):** Q12, Q13

### **Chapter 6: Electromagnetic Induction (EMI)**
*   **Magnetic Flux:** Q14, Q15
*   **Faraday’s and Lenz’s Law (Induced EMF & Charge):** Q16, Q17
*   **Motional Electromotive Force:** Q18, Q19, Q20
*   **Eddy Currents:** Q21
*   **Mutual Induction:** Q22
*   **AC Generator (Peak EMF):** Q23

### **Chapter 7: Alternating Current**
*   **AC Voltage Applied to a Series LR Circuit (Impedance & Inductance):** Q24
*   **Transformers:** Q25`;

type ViewState = 'home' | 'ranklist' | 'detail' | 'printableRanklist';

export default function App() {
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
  const [imageResolution, setImageResolution] = useState<number>(() => parseInt(localStorage.getItem('omr_imageResolution') || '1024', 10));
  const [availableModels, setAvailableModels] = useState<string[]>(['gemini-3.1-flash-lite-preview', 'gemini-3.1-flash-preview', 'gemini-3.1-pro-preview', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemma-2-2b-it', 'gemma-2-9b-it', 'gemma-2-27b-it']);
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
  const [isUpdatingMapping, setIsUpdatingMapping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [correctNamesOnExport, setCorrectNamesOnExport] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState(false);
  const [view, setView] = useState<ViewState>('home');
  const [selectedStudent, setSelectedStudent] = useState<OMRResult | null>(null);
  const [files, setFiles] = useState<ProcessedFile[]>(() => {
    const saved = localStorage.getItem('omr_files');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [reviewFileId, setReviewFileId] = useState<string | null>(null);
  const [sampling, setSampling] = useState<number>(() => {
    const saved = localStorage.getItem('omr_sampling');
    return saved ? parseInt(saved, 10) : 2;
  });
  const [concurrency, setConcurrency] = useState<number>(() => {
    const saved = localStorage.getItem('omr_concurrency');
    return saved ? parseInt(saved, 10) : 1;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const answerKeyFileInputRef = useRef<HTMLInputElement>(null);
  const topicMappingFileInputRef = useRef<HTMLInputElement>(null);
  const averageTimeRef = useRef<number>(8000); // Default 8 seconds per attempt

  useEffect(() => {
    localStorage.setItem('omr_apiKeysList', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    localStorage.setItem('omr_liteModel', liteModel);
  }, [liteModel]);

  useEffect(() => {
    localStorage.setItem('omr_proModel', proModel);
  }, [proModel]);

  useEffect(() => {
    localStorage.setItem('omr_imageResolution', imageResolution.toString());
  }, [imageResolution]);

  useEffect(() => {
    localStorage.setItem('omr_sampling', sampling.toString());
  }, [sampling]);

  useEffect(() => {
    localStorage.setItem('omr_concurrency', concurrency.toString());
  }, [concurrency]);

  useEffect(() => {
    localStorage.setItem('omr_attendance', attendanceSheet);
  }, [attendanceSheet]);

  useEffect(() => {
    localStorage.setItem('omr_answerKey', answerKey);
  }, [answerKey]);

  useEffect(() => {
    localStorage.setItem('omr_topicMapping', topicMapping);
  }, [topicMapping]);

  useEffect(() => {
    if (parsedTopicMapping) {
      localStorage.setItem('omr_parsedTopicMapping', JSON.stringify(parsedTopicMapping));
    }
  }, [parsedTopicMapping]);

  useEffect(() => {
    const filesToSave = files.map(f => ({
      id: f.id,
      fileName: f.fileName,
      status: f.status,
      result: f.result,
      error: f.error
    }));
    localStorage.setItem('omr_files', JSON.stringify(filesToSave));
  }, [files]);

  useEffect(() => {
    const loadImages = async () => {
      const loadedFiles = await Promise.all(files.map(async f => {
        if (!f.previewUrl) {
          try {
            const file = await getImage(f.id);
            if (file) {
              return { ...f, file, previewUrl: URL.createObjectURL(file) };
            }
          } catch (e) {
            console.error('Failed to load image from DB', e);
          }
        }
        return f;
      }));
      setFiles(loadedFiles);
      setIsLoaded(true);
    };
    if (!isLoaded && files.length > 0) {
      loadImages();
    } else if (!isLoaded) {
      setIsLoaded(true);
    }
  }, [isLoaded, files]);

  const handleFetchModels = async () => {
    try {
      const keys = apiKeys.filter(k => k.trim());
      const models = await fetchAvailableModels(keys);
      setAvailableModels(models);
      if (!models.includes(liteModel) && models.length > 0) {
        setLiteModel(models[0]);
      }
      if (!models.includes(proModel) && models.length > 0) {
        setProModel(models[0]);
      }
      alert(`Fetched ${models.length} models successfully!`);
    } catch (error: any) {
      alert('Failed to fetch models: ' + error.message);
    }
  };

  const handleUpdateTopicMapping = async () => {
    setIsUpdatingMapping(true);
    try {
      const keys = apiKeys.filter(k => k.trim());
      const parsed = await parseTopicMappingWithAI(topicMapping, keys, proModel);
      setParsedTopicMapping(parsed);
      alert('Topic mapping updated successfully!');
    } catch (error: any) {
      alert('Failed to update topic mapping: ' + error.message);
    }
    setIsUpdatingMapping(false);
  };

  const [isExtractingText, setIsExtractingText] = useState<'answerKey' | 'topicMapping' | null>(null);

  const handleExtractTextFromFile = async (event: React.ChangeEvent<HTMLInputElement>, type: 'answerKey' | 'topicMapping') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtractingText(type);
    try {
      const keys = apiKeys.filter(k => k.trim());
      if (keys.length === 0) {
        alert('Please add at least one API key first.');
        setIsExtractingText(null);
        return;
      }

      const base64 = await fileToBase64(file);
      const extractedText = await extractTextFromDocument(base64, file.type, keys, proModel, type);
      
      if (type === 'answerKey') {
        setAnswerKey(extractedText);
      } else {
        setTopicMapping(extractedText);
      }
      
      alert(`Successfully extracted ${type === 'answerKey' ? 'Answer Key' : 'Topic Mapping'}!`);
    } catch (error: any) {
      alert(`Failed to extract text: ${error.message}`);
    } finally {
      setIsExtractingText(null);
    }
    
    // Reset input
    event.target.value = '';
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
  };

  const clearAllFiles = async () => {
    if (window.confirm('Are you sure you want to clear all files and results?')) {
      await clearImages();
      setFiles([]);
    }
  };

  const processImage = (file: File, maxResolution: number, rotation: number = 0): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));

        let width = img.width;
        let height = img.height;

        if (width > maxResolution || height > maxResolution) {
          if (width > height) {
            height = Math.round((height * maxResolution) / width);
            width = maxResolution;
          } else {
            width = Math.round((width * maxResolution) / height);
            height = maxResolution;
          }
        }

        if (rotation === 90 || rotation === 270) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -width / 2, -height / 2, width, height);

        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, 0.8);
        const base64 = dataUrl.split(',')[1];
        resolve({ base64, mimeType });
      };
      
      img.onerror = reject;
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data:image/jpeg;base64, part
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const processFiles = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const keys = apiKeys.filter(k => k.trim());
    const baseConcurrency = Math.max(1, concurrency);
    const concurrencyLimit = keys.length > 0 ? baseConcurrency * keys.length : baseConcurrency;
    
    const pendingIds = files.filter(f => f.status === 'pending' || f.status === 'error').map(f => f.id);
    setProgress({ current: 0, total: pendingIds.length });
    let completedCount = 0;

    for (let i = 0; i < pendingIds.length; i += concurrencyLimit) {
      const chunkIds = pendingIds.slice(i, i + concurrencyLimit);
      
      setFiles(prev => prev.map(f => chunkIds.includes(f.id) ? { ...f, status: 'processing', error: undefined, attempt: 1, maxAttempts: sampling + 3, stageName: `Sampling 1/${sampling}` } : f));

      try {
        const imagesToProcess: { id: string, base64: string, mimeType: string, fileObj: File }[] = [];
        
        for (const id of chunkIds) {
          const currentFile = files.find(f => f.id === id);
          if (!currentFile) continue;
          
          let fileObj = currentFile.file;
          if (!fileObj) {
            fileObj = await getImage(id);
            if (!fileObj) continue;
          }
          
          const { base64, mimeType } = await processImage(fileObj, imageResolution, 0);
          imagesToProcess.push({ id, base64, mimeType, fileObj });
        }

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
          
          const batchResults = await evaluateOMRBatch(remainingImages, keys, proModel, liteModel, answerKey);
          
          const elapsed = Date.now() - attemptStartTime;
          averageTimeRef.current = (averageTimeRef.current * 4 + elapsed) / 5;

          for (const img of remainingImages) {
            if (batchResults[img.id]) {
              resultsHistory[img.id].push(batchResults[img.id]);
            }
            
            if (attempt >= sampling - 1) {
              const counts = new Map<string, number>();
              let bestResult: OMRResult | null = null;
              
              for (const r of resultsHistory[img.id]) {
                const key = JSON.stringify(r.scores);
                counts.set(key, (counts.get(key) || 0) + 1);
                if (counts.get(key)! >= targetMatches) {
                  bestResult = r;
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
            const fileObj = imagesToProcess.find(img => img.id === f.id)?.fileObj;
            return { ...f, status: 'success', result: finalResults[f.id], file: fileObj };
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
        
        // Update the files in state so the UI reflects the corrected names too
        setFiles(prev => prev.map(f => {
          if (f.status === 'success' && f.result && nameMap[f.result.name]) {
            return {
              ...f,
              result: {
                ...f.result,
                name: nameMap[f.result.name]
              }
            };
          }
          return f;
        }));

        // Update our local finalFiles array for the CSV generation
        finalFiles = finalFiles.map(f => {
          if (f.result && nameMap[f.result.name]) {
            return {
              ...f,
              result: {
                ...f.result,
                name: nameMap[f.result.name]
              }
            };
          }
          return f;
        });
      } catch (error: any) {
        alert('Failed to correct names: ' + error.message);
        setIsExporting(false);
        return; // abort export if correction fails
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

  const csvInputRef = useRef<HTMLInputElement>(null);

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
        
        if (cells.length < 4) continue;

        const name = cells[0].replace(/^"|"$/g, '').replace(/""/g, '"');
        const right = parseInt(cells[1], 10) || 0;
        const wrong = parseInt(cells[2], 10) || 0;
        
        const scores: Record<string, number> = {};
        for (let q = 1; q <= 25; q++) {
          const scoreIdx = 3 + q - 1; // Q1 is at index 3
          scores[`q${q}`] = parseInt(cells[scoreIdx] || '0', 10) || 0;
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans print:bg-white">
      <header className="bg-white shadow-sm border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold tracking-tight">OMR Checker Pro</h1>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:m-0 print:max-w-none print:space-y-0">
        {showSettings && (
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
            <h2 className="text-lg font-medium">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gemini API Keys
                </label>
                <div className="space-y-2">
                  {apiKeys.map((key, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => {
                          const newKeys = [...apiKeys];
                          newKeys[i] = e.target.value;
                          setApiKeys(newKeys);
                        }}
                        placeholder="AIzaSy..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button 
                        onClick={() => setApiKeys(prev => prev.filter((_, idx) => idx !== i))}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-colors"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setApiKeys(prev => [...prev, ''])}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium px-1"
                  >
                    <Plus className="w-4 h-4" /> Add API Key
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fallback Model (for JSON restructuring)
                  </label>
                  <input
                    type="text"
                    list="available-models"
                    value={liteModel}
                    onChange={(e) => setLiteModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pro Model (for valuation)
                  </label>
                  <input
                    type="text"
                    list="available-models"
                    value={proModel}
                    onChange={(e) => setProModel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <datalist id="available-models">
                  {availableModels.map(m => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                <div className="md:col-span-2 flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Image Resolution: {imageResolution}px
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="2048"
                      step="100"
                      value={imageResolution}
                      onChange={(e) => setImageResolution(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sampling
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={sampling}
                      onChange={(e) => setSampling(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 h-[42px]"
                      title="Number of validations to run for consensus"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Concurrency
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={concurrency}
                      onChange={(e) => setConcurrency(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 h-[42px]"
                      title="Number of images to process simultaneously"
                    />
                  </div>
                  <button
                    onClick={handleFetchModels}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 border border-gray-300 transition-colors whitespace-nowrap h-[42px]"
                  >
                    Fetch Models
                  </button>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Answer Key
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      className="hidden" 
                      ref={answerKeyFileInputRef}
                      onChange={(e) => handleExtractTextFromFile(e, 'answerKey')}
                    />
                    <button
                      onClick={() => answerKeyFileInputRef.current?.click()}
                      disabled={isExtractingText === 'answerKey'}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {isExtractingText === 'answerKey' ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</>
                      ) : (
                        <><Upload className="w-4 h-4" /> Load from Image/PDF</>
                      )}
                    </button>
                  </div>
                </div>
                <textarea
                  value={answerKey}
                  onChange={(e) => setAnswerKey(e.target.value)}
                  rows={8}
                  placeholder="* **Q1.** A\n* **Q2.** B..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attendance Sheet (Paste names here for cross-checking)
                </label>
                <textarea
                  value={attendanceSheet}
                  onChange={(e) => setAttendanceSheet(e.target.value)}
                  rows={4}
                  placeholder="John Doe\nJane Smith\nFathima Nasha..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Topic Wise Questions (for Rank List)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      className="hidden" 
                      ref={topicMappingFileInputRef}
                      onChange={(e) => handleExtractTextFromFile(e, 'topicMapping')}
                    />
                    <button
                      onClick={() => topicMappingFileInputRef.current?.click()}
                      disabled={isExtractingText === 'topicMapping'}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {isExtractingText === 'topicMapping' ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Extracting...</>
                      ) : (
                        <><Upload className="w-4 h-4" /> Load from Image/PDF</>
                      )}
                    </button>
                    <button
                      onClick={handleUpdateTopicMapping}
                      disabled={isUpdatingMapping}
                      className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm font-medium hover:bg-indigo-200 disabled:opacity-50 transition-colors"
                    >
                      {isUpdatingMapping ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {isUpdatingMapping ? 'Updating...' : 'Update Mapping'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={topicMapping}
                  onChange={(e) => setTopicMapping(e.target.value)}
                  rows={8}
                  placeholder="### Chapter 1\n* Topic 1: Q1, Q2..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
                {parsedTopicMapping && (
                  <>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Mapping successfully parsed and saved.
                    </p>
                    <TopicEditor 
                      parsedTopicMapping={parsedTopicMapping} 
                      onUpdate={setParsedTopicMapping} 
                    />
                  </>
                )}
              </div>
            </div>
          </section>
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

        {files.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col gap-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Processing Queue ({files.length} files)</h2>
                <div className="flex gap-2 items-center">
                  <label className="flex items-center gap-2 text-sm text-gray-700 mr-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={correctNamesOnExport}
                      onChange={(e) => setCorrectNamesOnExport(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Correct names against attendance sheet
                  </label>
                  <button
                    onClick={clearAllFiles}
                    disabled={isProcessing || isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                  {files.some(f => f.status === 'error') && (
                    <button
                      onClick={retryAllFailed}
                      disabled={isProcessing || isExporting}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry Failed
                    </button>
                  )}
                  {files.some(f => f.status === 'success') && (
                    <button
                      onClick={recheckAll}
                      disabled={isProcessing || isExporting}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md font-medium hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Recheck All
                    </button>
                  )}
                  <button
                    onClick={processFiles}
                    disabled={isProcessing || isExporting || files.every(f => f.status === 'success')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    {isProcessing ? 'Processing...' : 'Start Processing'}
                  </button>
                  <button
                    onClick={exportCSV}
                    disabled={!files.some(f => f.status === 'success') || isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isExporting ? 'Correcting...' : 'Export CSV'}
                  </button>
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    ref={csvInputRef}
                    onChange={handleImportCSV}
                  />
                  <button
                    onClick={() => csvInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md font-medium hover:bg-teal-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Import CSV
                  </button>
                  <button
                    onClick={() => setView('ranklist')}
                    disabled={!files.some(f => f.status === 'success')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trophy className="w-4 h-4" />
                    Rank List
                  </button>
                </div>
              </div>
              
              {isProcessing && progress.total > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
            
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  className={`p-4 flex items-start gap-4 ${file.status === 'success' ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                  onClick={() => {
                    if (file.status === 'success') {
                      setReviewFileId(file.id);
                    }
                  }}
                >
                  {file.previewUrl ? (
                    <img src={file.previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-gray-200 shrink-0" />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center shrink-0 text-gray-400">
                      <FileImage className="w-8 h-8" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {file.fileName || 'Camera Capture'}
                      </h3>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                        disabled={file.status === 'processing'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {file.status === 'pending' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Pending
                      </span>
                    )}
                    {file.status === 'processing' && (
                      <div className="w-full">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 animate-pulse mb-2">
                          Processing...
                        </span>
                        <PredictiveProgressBar 
                          isProcessing={true} 
                          stageName={file.stageName || 'Processing...'}
                          attempt={file.attempt || 1} 
                          expectedAttempts={file.maxAttempts || 1} 
                          averageTime={averageTimeRef.current} 
                        />
                      </div>
                    )}
                    {file.status === 'error' && (
                      <div className="text-sm text-red-600 flex items-start gap-1 mt-1">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span className="flex-1">{file.error}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            retryFile(file.id);
                          }}
                          disabled={isProcessing}
                          className="ml-2 text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50 font-medium"
                        >
                          <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                      </div>
                    )}
                    {file.status === 'success' && file.result && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-gray-900">{file.result.name}</span>
                            <span className="text-sm text-gray-500">
                              (Right: <span className="text-green-600 font-medium">{file.result.right}</span>, 
                              Wrong: <span className="text-red-600 font-medium">{file.result.wrong}</span>)
                            </span>
                            {file.result.confidences && file.result.confidences.length > 0 ? (
                              <div className="flex gap-1">
                                {file.result.confidences.map((conf, idx) => (
                                  <span key={idx} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                                    conf < 30 ? 'bg-red-100 text-red-800' : 
                                    conf < 50 ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-green-100 text-green-800'
                                  }`} title={`Attempt ${idx + 1} Confidence`}>
                                    {conf}%
                                  </span>
                                ))}
                              </div>
                            ) : file.result.confidence !== undefined && (
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                file.result.confidence < 30 ? 'bg-red-100 text-red-800' : 
                                file.result.confidence < 50 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {file.result.confidence}% Conf
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              recheckFile(file.id);
                            }}
                            disabled={isProcessing}
                            className="text-purple-600 hover:text-purple-800 flex items-center gap-1 disabled:opacity-50 font-medium text-sm"
                          >
                            <RotateCcw className="w-3 h-3" /> Recheck
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: 25 }, (_, i) => i + 1).map(qNum => {
                            const score = file.result!.scores[`q${qNum}`];
                            let bgColor = 'bg-gray-100 text-gray-600';
                            if (score === 1) bgColor = 'bg-green-100 text-green-700';
                            if (score === -1) bgColor = 'bg-red-100 text-red-700';
                            
                            return (
                              <div key={qNum} className={`text-[10px] px-1.5 py-0.5 rounded ${bgColor}`} title={`Q${qNum}: ${score}`}>
                                Q{qNum}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
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
        />
      )}
    </div>
  );
}
