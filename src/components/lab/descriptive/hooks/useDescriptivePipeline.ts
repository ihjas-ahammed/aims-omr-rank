import { useState, useEffect } from 'react';
import { get, set } from 'idb-keyval';
import { DescriptiveImage, DescriptiveStudent } from '../types';
import { saveImage, getImage, deleteImage } from '../../../../services/db';
import { fileToBase64, processImage, applyCropAndRotate } from '../../../../utils/imageProcessing';
import { dataURLtoFile } from '../../../../utils/fileUtils';
import { autoCropAndRotate } from '../../../../services/geminiService';
import { identifyStudentFromPage, evaluateDescriptiveAnswers } from '../../../../services/gemini/descriptiveService';

export function useDescriptivePipeline() {
  const [images, setImages] = useState<DescriptiveImage[]>([]);
  const [students, setStudents] = useState<DescriptiveStudent[]>([]);
  const [pipelineState, setPipelineState] = useState<'idle' | 'processing' | 'done'>('idle');
  const [progress, setProgress] = useState({ step: '', current: 0, total: 0 });
  const [isLoadingState, setIsLoadingState] = useState(true);

  const getApiKeys = () => JSON.parse(localStorage.getItem('omr_apiKeysList') || '[]').filter((k: string) => k.trim());
  const getLiteModel = () => localStorage.getItem('omr_liteModel') || 'gemini-3.1-flash-lite-preview';
  const getProModel = () => localStorage.getItem('omr_proModel') || 'gemini-3.1-pro-preview';
  const getAnswerKey = () => localStorage.getItem('aims_desc_answerKey') || '';
  const getTopicMapping = () => localStorage.getItem('aims_desc_topicMapping') || '';
  const getConcurrency = () => parseInt(localStorage.getItem('omr_concurrency') || '1', 10);
  const getRequestsPerKey = () => parseInt(localStorage.getItem('omr_requestsPerKey') || '1', 10);

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

  const handleFileUpload = async (filesList: FileList) => {
    const newImages = Array.from(filesList).map(file => ({
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
    setPipelineState(newPipelineState);
    
    await saveState(updatedImages, students, newPipelineState);
  };

  const handleRemoveImage = async (id: string) => {
    const img = images.find(i => i.id === id);
    if (img && img.previewUrl) URL.revokeObjectURL(img.previewUrl);
    await deleteImage(id);
    
    const newImages = images.filter(i => i.id !== id);
    setImages(newImages);
    await saveState(newImages, students, pipelineState);
  };

  const handleRemoveStudent = async (id: string) => {
    if (!window.confirm("Remove this student and all their scanned pages?")) return;
    
    const std = students.find(s => s.id === id);
    if (std) {
       for (const img of std.images) {
          if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
          await deleteImage(img.id);
       }
    }
    const newStudents = students.filter(s => s.id !== id);
    const newImages = images.filter(img => img.studentId !== id);
    setStudents(newStudents);
    setImages(newImages);
    await saveState(newImages, newStudents, pipelineState);
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
      const w = cropRes.xmax - cropRes.xmin;
      const h = cropRes.ymax - cropRes.ymin;
      let finalRotation = cropRes.rotation;
      
      if (w > h && (finalRotation === 0 || finalRotation === 180)) {
        console.log(`Auto-correcting orientation: crop is wider (${w}) than tall (${h}), setting rotation to 90.`);
        finalRotation = (finalRotation + 90) % 360;
      }
      
      const { base64: croppedBase64, mimeType } = await applyCropAndRotate(img.file, cropRes, finalRotation, 1600);
      return { croppedBase64, mimeType };
    } catch (e) {
      console.warn("Auto crop failed for image, using original", e);
      const { base64: defaultBase64, mimeType } = await processImage(img.file, 1600, 0);
      return { croppedBase64: defaultBase64, mimeType };
    }
  };

  const runPipeline = async (onRequireSettings: () => void) => {
    const keys = getApiKeys();
    if (keys.length === 0) {
      alert("Please configure API keys in settings first.");
      onRequireSettings();
      return;
    }
    if (!getAnswerKey()) {
      alert("Please provide an evaluation scheme in settings first.");
      onRequireSettings();
      return;
    }

    let currentPipelineState: 'idle' | 'processing' | 'done' = 'processing';
    setPipelineState(currentPipelineState);
    
    try {
      const liteModel = getLiteModel();
      const proModel = getProModel();
      const baseConcurrency = Math.max(1, getConcurrency());
      const reqsPerKey = Math.max(1, getRequestsPerKey());
      const totalConcurrentRequests = keys.length > 0 ? keys.length * reqsPerKey : 1;
      const concurrencyLimit = totalConcurrentRequests * baseConcurrency;
      
      let updatedImages = [...images];
      let updatedStudents = [...students];

      const actionsToCrop = updatedImages.filter(img => img.status !== 'cropped').length;
      const actionsToGroup = updatedImages.filter(img => !img.studentId).length;
      const actionsToEval = updatedStudents.filter(std => std.status !== 'success').length;
      
      let totalActions = actionsToCrop + actionsToGroup + actionsToEval;
      let currentCompleted = 0;

      const updateProg = (stepDesc: string, advance: boolean = false) => {
        if (advance) currentCompleted++;
        setProgress({ step: stepDesc, current: currentCompleted, total: totalActions });
      };

      updateProg('Starting pipeline...');

      // Phase 1: Crop
      const uncroppedImages = updatedImages.filter(img => img.status !== 'cropped');
      for (let i = 0; i < uncroppedImages.length; i += concurrencyLimit) {
        const chunk = uncroppedImages.slice(i, i + concurrencyLimit);
        await Promise.all(chunk.map(async (img) => {
          const { croppedBase64, mimeType } = await applyCrop(img, keys, liteModel);
          const croppedFile = dataURLtoFile(`data:${mimeType};base64,${croppedBase64}`, img.file.name || 'cropped.jpg');
          
          await saveImage(img.id, croppedFile);
          if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
          
          const index = updatedImages.findIndex(u => u.id === img.id);
          updatedImages[index] = {
            ...img,
            file: croppedFile,
            previewUrl: URL.createObjectURL(croppedFile),
            croppedBase64,
            status: 'cropped'
          };
          updateProg(`Cropped page...`, true);
        }));
        setImages([...updatedImages]);
      }

      // Phase 2: Identify and Group
      let currentStudent: DescriptiveStudent | null = updatedStudents.length > 0 ? updatedStudents[updatedStudents.length - 1] : null;
      
      for (let i = 0; i < updatedImages.length; i++) {
        if (!updatedImages[i].studentId) {
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
            totalActions++; 
          }
          
          currentStudent.images.push(img);
          updatedImages[i].studentId = currentStudent.id;
          currentStudent.status = 'pending';
          
          setImages([...updatedImages]);
          setStudents([...updatedStudents]);
          updateProg(`Identified student...`, true);
        }
      }

      await saveState(updatedImages, updatedStudents, 'processing');

      // Phase 3: Evaluate
      const unevaluatedStudents = updatedStudents.filter(std => std.status !== 'success');
      for (let i = 0; i < unevaluatedStudents.length; i += concurrencyLimit) {
        const chunk = unevaluatedStudents.slice(i, i + concurrencyLimit);
        
        chunk.forEach(std => {
          const index = updatedStudents.findIndex(u => u.id === std.id);
          updatedStudents[index].status = 'evaluating';
        });
        setStudents([...updatedStudents]);

        await Promise.all(chunk.map(async (std) => {
          try {
            const evalImages = await Promise.all(std.images.map(async img => {
              const b64 = img.croppedBase64 || await fileToBase64(img.file);
              return { base64: b64, mimeType: img.file.type };
            }));

            const res = await evaluateDescriptiveAnswers(evalImages, getAnswerKey(), getTopicMapping(), keys, proModel);
            const index = updatedStudents.findIndex(u => u.id === std.id);
            updatedStudents[index].result = res;
            updatedStudents[index].status = 'success';
            updatedStudents[index].error = undefined;
          } catch (e: any) {
            const index = updatedStudents.findIndex(u => u.id === std.id);
            updatedStudents[index].error = e.message;
            updatedStudents[index].status = 'error';
          }
          updateProg(`Evaluated ${std.name}`, true);
        }));
        
        setStudents([...updatedStudents]);
        await saveState(updatedImages, updatedStudents, 'processing');
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

  return {
    images,
    students,
    pipelineState,
    progress,
    isLoadingState,
    handleFileUpload,
    handleRemoveImage,
    handleRemoveStudent,
    handleClearAll,
    runPipeline,
    handleExportCSV,
    handleUpdateStudents
  };
}