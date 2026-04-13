import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, FileSignature, Settings, Loader2 } from 'lucide-react';
import { get, set } from 'idb-keyval';
import DescriptiveSettings from './DescriptiveSettings';
import DescriptiveResultCard from './DescriptiveResultCard';
import DescriptiveFixNameModal from './DescriptiveFixNameModal';
import DescriptiveToolbar from './DescriptiveToolbar';
import DescriptiveQueue from './DescriptiveQueue';
import DescriptiveProgress from './DescriptiveProgress';
import { DescriptiveImage, DescriptiveStudent } from './types';
import { fileToBase64, processImage } from '../../../utils/imageProcessing';
import { dataURLtoFile } from '../../../utils/fileUtils';
import { autoCropAndRotate } from '../../../services/geminiService';
import { identifyStudentFromPage, evaluateDescriptiveAnswers } from '../../../services/gemini/descriptiveService';
import { saveImage, getImage, deleteImage } from '../../../services/db';

interface Props {
  onBack: () => void;
}

export default function DescriptiveDashboard({ onBack }: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const [showFixName, setShowFixName] = useState(false);
  const [images, setImages] = useState<DescriptiveImage[]>([]);
  const [students, setStudents] = useState<DescriptiveStudent[]>([]);
  const [pipelineState, setPipelineState] = useState<'idle' | 'processing' | 'done'>('idle');
  const [progress, setProgress] = useState({ step: '', current: 0, total: 0 });
  const [isLoadingState, setIsLoadingState] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getApiKeys = () => JSON.parse(localStorage.getItem('omr_apiKeysList') || '[]').filter((k: string) => k.trim());
  const getLiteModel = () => localStorage.getItem('omr_liteModel') || 'gemini-3.1-flash-lite-preview';
  const getProModel = () => localStorage.getItem('omr_proModel') || 'gemini-3.1-pro-preview';
  const getAnswerKey = () => localStorage.getItem('aims_desc_answerKey') || '';
  const getTopicMapping = () => localStorage.getItem('aims_desc_topicMapping') || '';

  // Load state from IndexedDB on mount
  useEffect(() => {
    const loadState = async () => {
      setIsLoadingState(true);
      try {
        const savedImagesMeta = await get('desc_images_meta');
        const savedStudentsMeta = await get('desc_students_meta');
        const savedPipelineState = await get('desc_pipeline_state');
        
        let loadedImages: DescriptiveImage[] = [];
        
        if (savedImagesMeta) {
          loadedImages = (await Promise.all(savedImagesMeta.map(async (meta: any) => {
            const file = await getImage(meta.id);
            if (!file) return null;
            return {
              ...meta,
              file,
              previewUrl: URL.createObjectURL(file)
            };
          }))).filter(Boolean) as DescriptiveImage[];
          setImages(loadedImages);
        }

        if (savedStudentsMeta) {
          const loadedStudents = savedStudentsMeta.map((std: any) => {
            const stdImages = std.images
              .map((imgMeta: any) => loadedImages.find(i => i.id === imgMeta.id))
              .filter(Boolean);
            return { ...std, images: stdImages };
          });
          setStudents(loadedStudents);
        }

        if (savedPipelineState) {
          setPipelineState(savedPipelineState);
        }
      } catch (e) {
        console.error("Failed to load state", e);
      } finally {
        setIsLoadingState(false);
      }
    };
    loadState();
  }, []);

  const saveState = async (imgs: DescriptiveImage[], stds: DescriptiveStudent[], pState: string) => {
    const imgsMeta = imgs.map(img => ({ id: img.id, status: img.status, croppedBase64: img.croppedBase64, studentId: img.studentId }));
    const stdsMeta = stds.map(std => ({
      ...std,
      images: std.images.map(img => ({ id: img.id }))
    }));
    await set('desc_images_meta', imgsMeta);
    await set('desc_students_meta', stdsMeta);
    await set('desc_pipeline_state', pState);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending' as const
      }));
      
      for (const img of newImages) {
        await saveImage(img.id, img.file);
      }

      const updatedImages = [...images, ...newImages];
      const newPipelineState = pipelineState === 'done' ? 'idle' : pipelineState;
      
      setImages(updatedImages);
      if (pipelineState === 'done') setPipelineState('idle');
      
      await saveState(updatedImages, students, newPipelineState);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = async (id: string) => {
    const img = images.find(i => i.id === id);
    if (img && img.previewUrl) URL.revokeObjectURL(img.previewUrl);
    await deleteImage(id);
    
    const newImages = images.filter(i => i.id !== id);
    setImages(newImages);
    await saveState(newImages, students, pipelineState);
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all images and results?")) {
      for (const img of images) {
        if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
        await deleteImage(img.id);
      }
      setImages([]);
      setStudents([]);
      setPipelineState('idle');
      setProgress({ step: '', current: 0, total: 0 });
      await saveState([], [], 'idle');
    }
  };

  const applyCrop = async (img: DescriptiveImage, keys: string[], liteModel: string) => {
    const base64 = await fileToBase64(img.file);
    try {
      const cropRes = await autoCropAndRotate(base64, img.file.type, keys, liteModel);
      const { base64: croppedBase64 } = await processImage(img.file, 1600, cropRes.rotation);
      return croppedBase64;
    } catch (e) {
      console.warn("Auto crop failed for image, using original", e);
      const { base64: defaultBase64 } = await processImage(img.file, 1600, 0);
      return defaultBase64;
    }
  };

  const runPipeline = async () => {
    const keys = getApiKeys();
    if (keys.length === 0) {
      alert("Please configure API keys in settings first.");
      setShowSettings(true);
      return;
    }
    if (!getAnswerKey()) {
      alert("Please provide an answer key in settings first.");
      setShowSettings(true);
      return;
    }

    let currentPipelineState: 'idle' | 'processing' | 'done' = 'processing';
    setPipelineState(currentPipelineState);
    
    try {
      const liteModel = getLiteModel();
      const proModel = getProModel();
      
      let updatedImages = [...images];
      let updatedStudents = [...students];

      // Calculate initial tasks
      const actionsToCrop = updatedImages.filter(img => img.status !== 'cropped').length;
      const actionsToGroup = updatedImages.filter(img => !img.studentId).length;
      const actionsToEval = updatedStudents.filter(std => std.status !== 'success').length;
      
      let totalActions = actionsToCrop + actionsToGroup + actionsToEval;
      let completedActions = 0;

      const updateProg = (stepDesc: string) => {
        setProgress({ step: stepDesc, current: completedActions, total: totalActions });
      };

      // Phase 1: Crop Uncropped Images
      for (let i = 0; i < updatedImages.length; i++) {
        if (updatedImages[i].status !== 'cropped') {
          updateProg(`Cropping scanned page ${i + 1}...`);
          const img = updatedImages[i];
          const croppedBase64 = await applyCrop(img, keys, liteModel);
          const croppedFile = dataURLtoFile(`data:image/jpeg;base64,${croppedBase64}`, img.file.name || 'cropped.jpg');
          
          await saveImage(img.id, croppedFile);
          if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
          
          updatedImages[i] = {
            ...img,
            file: croppedFile,
            previewUrl: URL.createObjectURL(croppedFile),
            croppedBase64,
            status: 'cropped'
          };
          
          setImages([...updatedImages]);
          completedActions++;
        }
      }

      // Phase 2: Identify and Group Students
      let currentStudent: DescriptiveStudent | null = updatedStudents.length > 0 ? updatedStudents[updatedStudents.length - 1] : null;
      
      for (let i = 0; i < updatedImages.length; i++) {
        if (!updatedImages[i].studentId) {
          updateProg(`Identifying student for page ${i + 1}...`);
          const img = updatedImages[i];
          const prevName = currentStudent?.name || null;
          
          const idRes = await identifyStudentFromPage(img.croppedBase64!, img.file.type, prevName, keys, liteModel);
          
          if (idRes.isNewStudent || !currentStudent) {
            currentStudent = {
              id: `std-${Math.random().toString(36).substring(7)}`,
              name: idRes.studentName || `Unknown Student ${updatedStudents.length + 1}`,
              images: [],
              status: 'pending'
            };
            updatedStudents.push(currentStudent);
            totalActions++; // Dynamic addition as new students are found
          }
          
          // Add image to group
          currentStudent.images.push(img);
          updatedImages[i].studentId = currentStudent.id;
          currentStudent.status = 'pending';
          
          setImages([...updatedImages]);
          setStudents([...updatedStudents]);
          completedActions++;
        }
      }

      // Ensure intermediate save
      await saveState(updatedImages, updatedStudents, 'processing');

      // Phase 3: Evaluate Unevaluated Students
      for (let i = 0; i < updatedStudents.length; i++) {
        const std = updatedStudents[i];
        if (std.status !== 'success') {
          updateProg(`Evaluating answers for ${std.name}...`);
          
          std.status = 'evaluating';
          setStudents([...updatedStudents]);
          
          try {
            const evalImages = await Promise.all(std.images.map(async img => {
              const b64 = img.croppedBase64 || await fileToBase64(img.file);
              return { base64: b64, mimeType: img.file.type };
            }));

            const res = await evaluateDescriptiveAnswers(evalImages, getAnswerKey(), getTopicMapping(), keys, proModel);
            std.result = res;
            std.status = 'success';
            std.error = undefined;
          } catch (e: any) {
            std.error = e.message;
            std.status = 'error';
          }
          
          completedActions++;
          updateProg(`Evaluated ${std.name}`);
          setStudents([...updatedStudents]);
          await saveState(updatedImages, updatedStudents, 'processing');
        }
      }

      currentPipelineState = 'done';
      setPipelineState(currentPipelineState);
      await saveState(updatedImages, updatedStudents, currentPipelineState);

    } catch (err: any) {
      alert("Pipeline failed: " + err.message);
      currentPipelineState = 'idle';
      setPipelineState(currentPipelineState);
      await saveState(images, students, currentPipelineState);
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) return;
    
    let csv = 'NAME,SCORE,FEEDBACK\n';
    students.forEach(s => {
      const score = s.result?.totalScore ?? 0;
      const feedback = (s.result?.feedback ?? '').replace(/"/g, '""');
      csv += `"${s.name}",${score},"${feedback}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'descriptive_results.csv';
    link.click();
  };

  const handleUpdateStudents = async (updated: DescriptiveStudent[]) => {
    setStudents(updated);
    await saveState(images, updated, pipelineState);
  };

  if (isLoadingState) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <FileSignature className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Descriptive Evaluation</h2>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm w-full md:w-auto"
        >
          <Settings className="w-4 h-4" /> Settings
        </button>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileUpload}
        />

        <DescriptiveToolbar
          pipelineState={pipelineState}
          imagesCount={images.length}
          studentsCount={students.length}
          onUploadClick={() => fileInputRef.current?.click()}
          onClearAll={handleClearAll}
          onFixNames={() => setShowFixName(true)}
          onExportCSV={handleExportCSV}
          onEvaluate={runPipeline}
        />

        {/* Dynamic Progress Bar Component */}
        {pipelineState === 'processing' && (
          <DescriptiveProgress step={progress.step} current={progress.current} total={progress.total} />
        )}

        {/* View Selection: Images Queue or Grouped Students */}
        {students.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {students.map((student, idx) => (
              <DescriptiveResultCard key={student.id} student={student} index={idx} />
            ))}
          </div>
        ) : (
          <DescriptiveQueue images={images} onRemove={handleRemoveImage} />
        )}
      </div>

      {showSettings && <DescriptiveSettings onClose={() => setShowSettings(false)} />}
      
      {showFixName && (
        <DescriptiveFixNameModal 
          students={students} 
          onUpdateStudents={handleUpdateStudents}
          onClose={() => setShowFixName(false)} 
        />
      )}
    </div>
  );
}