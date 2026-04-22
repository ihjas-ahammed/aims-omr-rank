import React from 'react';
import { ProcessedFile } from '../components/QueueItem';
import {
  autoCropAndRotate,
  aiSplitOMRImage,
  evaluateOMRBatch,
  extractNameWithLite,
  OMRResult
} from '../services/geminiService';
import { fileToBase64, applyCropAndRotate, processImage } from './imageProcessing';
import { dataURLtoFile } from './fileUtils';
import { getImage, saveImage } from '../services/db';
import { gradeAnswers } from './grading';

export interface OMRProcessorParams {
  files: ProcessedFile[];
  filesByDay: Record<number, ProcessedFile[]>;
  currentDay: number;
  apiKeys: string[];
  liteModel: string;
  proModel: string;
  imageResolution: number;
  sampling: number;
  concurrency: number;
  requestsPerKey: number;
  numQuestions: number;
  numOptions: number;
  autoCropEnabled: boolean;
  experimentalSplit: boolean;
  experimentalSplitPrompt: string;
  answerKey: string;
  setFiles: React.Dispatch<React.SetStateAction<ProcessedFile[]>>;
  setProgress: React.Dispatch<React.SetStateAction<{ current: number, total: number }>>;
  averageTimeRef: React.MutableRefObject<number>;
}

export async function processOMRImages({
  files,
  filesByDay,
  currentDay,
  apiKeys,
  liteModel,
  proModel,
  imageResolution,
  sampling,
  concurrency,
  requestsPerKey,
  numQuestions,
  numOptions,
  autoCropEnabled,
  experimentalSplit,
  experimentalSplitPrompt,
  answerKey,
  setFiles,
  setProgress,
  averageTimeRef
}: OMRProcessorParams) {
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
    let completedIds = new Set<string>();

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

            return { id, base64, mimeType, fileObj: croppedFile, extractedName: cropData.name };
          } catch (error: any) {
            console.error(`Auto-crop failed for ${id}, falling back to raw image.`, error);
            const { base64, mimeType } = await processImage(fileObj, imageResolution, 0);
            const fallbackName = await extractNameWithLite(base64, mimeType, keys, liteModel);
            return { id, base64, mimeType, fileObj, extractedName: fallbackName };
          }
        } else {
          const { base64, mimeType } = await processImage(fileObj, imageResolution, 0);
          const extractedName = await extractNameWithLite(base64, mimeType, keys, liteModel);
          return { id, base64, mimeType, fileObj, extractedName };
        }
      });

      const loadedResults = await Promise.all(loadedImagesPromises);
      const imagesToProcess = loadedResults.filter(Boolean) as { id: string, base64: string, mimeType: string, fileObj: File, extractedName?: string }[];

      if (imagesToProcess.length === 0) continue;

      let finalImagesToProcess: { id: string, base64: string, mimeType: string, fileObj: File, originalId: string, splitIndex?: number, extractedName?: string }[] =[];

      for (const img of imagesToProcess) {
        if (experimentalSplit) {
          setFiles(prev => prev.map(f => f.id === img.id ? { ...f, stageName: 'AI Splitting Image...' } : f));
          try {
            const splitRes = await aiSplitOMRImage(img.base64, img.mimeType, keys, liteModel, experimentalSplitPrompt);
            const splitBoxes = splitRes.boxes || [];

            let splitPreviews: string[] =[];
            for (let idx = 0; idx < splitBoxes.length; idx++) {
              const splitData = await applyCropAndRotate(img.fileObj, splitBoxes[idx], splitBoxes[idx].rotation, imageResolution);
              const splitDataUrl = `data:${splitData.mimeType};base64,${splitData.base64}`;
              const splitFile = dataURLtoFile(splitDataUrl, `split_${idx}_${img.fileObj.name || 'image.jpg'}`);
              const splitUrl = URL.createObjectURL(splitFile);
              splitPreviews.push(splitUrl);

              finalImagesToProcess.push({
                originalId: img.id,
                id: `${img.id}_part${idx}`,
                base64: splitData.base64,
                mimeType: splitData.mimeType,
                fileObj: splitFile,
                splitIndex: idx,
                extractedName: splitRes.name || img.extractedName
              });
            }

            setFiles(prev => prev.map(f => f.id === img.id ? { ...f, splitPreviews } : f));
          } catch (err) {
            console.error('Failed to split, falling back to original');
            finalImagesToProcess.push({ ...img, originalId: img.id });
          }
        } else {
          finalImagesToProcess.push({ ...img, originalId: img.id });
        }
      }

      let resultsHistory: Record<string, Array<{ answers: Record<string, string>, confidence: number }>> = {};
      for (const img of imagesToProcess) {
        resultsHistory[img.id] =[];
      }

      let targetMatches = sampling >= 2 ? 2 : 1;
      let maxAttempts = sampling + 3;
      let finalResults: Record<string, OMRResult> = {};

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        let stageName = attempt < sampling ? `Sampling ${attempt + 1}/${sampling}` : `Verification ${attempt - sampling + 1}`;

        const remainingImages = finalImagesToProcess.filter(img => !completedIds.has(img.originalId));
        if (remainingImages.length === 0) break;

        setFiles(prev => prev.map(f => remainingImages.some(img => img.originalId === f.id) ? { ...f, attempt: attempt + 1, maxAttempts, stageName } : f));

        const attemptStartTime = Date.now();

        const allChunks =[];
        for (let k = 0; k < remainingImages.length; k += baseConcurrency) {
          allChunks.push(remainingImages.slice(k, k + baseConcurrency));
        }

        let rawBatchResults: any = {};

        for (let m = 0; m < allChunks.length; m += totalConcurrentRequests) {
          const activeChunks = allChunks.slice(m, m + totalConcurrentRequests);
          const activePromises = activeChunks.map(chunk => {
            return evaluateOMRBatch(chunk, keys, proModel, liteModel, numQuestions, numOptions).then(res => {
              setFiles(prev => prev.map(f => {
                if (chunk.some(img => img.originalId === f.id)) {
                  return { ...f, stageName: `Evaluated (Attempt ${attempt + 1})` };
                }
                return f;
              }));
              return res;
            });
          });
          const chunkResults = await Promise.all(activePromises);
          const combined = chunkResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
          rawBatchResults = { ...rawBatchResults, ...combined };
        }

        const batchMergedAnswers: Record<string, { answers: Record<string, string>, confidence: number, name: string }> = {};

        // Merge parts if needed
        for (const piece of remainingImages) {
          const pieceResult = rawBatchResults[piece.id];
          if (pieceResult) {
            if (!batchMergedAnswers[piece.originalId]) {
              batchMergedAnswers[piece.originalId] = {
                answers: {},
                confidence: pieceResult.confidence,
                name: piece.extractedName || 'Unknown'
              };
            }
            const merged = batchMergedAnswers[piece.originalId];
            merged.confidence = Math.min(merged.confidence, pieceResult.confidence);
            
            // Prioritize extracted name
            if (piece.extractedName && piece.extractedName !== 'Unknown' && (!merged.name || merged.name === 'Unknown')) {
              merged.name = piece.extractedName;
            }

            for (let q = 1; q <= numQuestions; q++) {
              const qKeyStr = q.toString();
              if (pieceResult.answers[qKeyStr]) {
                merged.answers[qKeyStr] = pieceResult.answers[qKeyStr];
              }
            }
          }
        }

        const elapsed = Date.now() - attemptStartTime;
        averageTimeRef.current = (averageTimeRef.current * 4 + elapsed) / 5;

        for (const img of imagesToProcess) {
          if (batchMergedAnswers[img.id]) {
            resultsHistory[img.id].push({
              answers: batchMergedAnswers[img.id].answers,
              confidence: batchMergedAnswers[img.id].confidence
            });
          }

          if (attempt >= targetMatches - 1) {
            const counts = new Map<string, number>();
            let bestResult: { answers: Record<string, string>, confidence: number } | null = null;

            for (const r of resultsHistory[img.id]) {
              const keyStr = JSON.stringify(r.answers);
              counts.set(keyStr, (counts.get(keyStr) || 0) + 1);
              if (counts.get(keyStr)! >= targetMatches) {
                bestResult = resultsHistory[img.id].find(res => JSON.stringify(res.answers) === keyStr) || r;
                break;
              }
            }

            // Only grade the best/final result once it's locked in
            if (bestResult || attempt === maxAttempts - 1) {
              const targetResult = bestResult || resultsHistory[img.id][resultsHistory[img.id].length - 1];
              
              if (targetResult) {
                const graded = gradeAnswers(targetResult.answers, answerKey, numQuestions);
                finalResults[img.id] = {
                  name: batchMergedAnswers[img.id]?.name || img.extractedName || 'Unknown',
                  right: graded.right,
                  wrong: graded.wrong,
                  scores: graded.scores,
                  answers: targetResult.answers, // Optional storage for UI reference
                  confidence: targetResult.confidence,
                  confidences: resultsHistory[img.id].map(r => r.confidence)
                };

                if (!completedIds.has(img.id)) {
                  completedIds.add(img.id);
                  completedCount++;
                  setProgress(p => ({ ...p, current: completedCount }));
                }
              }
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
      const failedInChunk = chunkIds.filter(id => !completedIds.has(id));
      completedCount += failedInChunk.length;
      setProgress(p => ({ ...p, current: completedCount }));
    }
  }
}