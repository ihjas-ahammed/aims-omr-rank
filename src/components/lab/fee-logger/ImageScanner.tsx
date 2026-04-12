import React, { useState, useRef } from 'react';
import { Upload, ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { extractFeeRecordsBatch } from '../../../services/geminiService';
import { FeeLogData } from '../../../services/firebaseService';
import { ExtractedRecord, ImageScannerResults } from './index';

interface ImageScannerProps {
  onAddLogs: (logs: Omit<FeeLogData, 'id' | 'createdAt'>[]) => Promise<void>;
  existingLogs: FeeLogData[];
  apiKeys: string[];
  model: string;
  concurrency: number;
  requestsPerKey: number;
}

export default function ImageScanner({ onAddLogs, existingLogs, apiKeys, model, concurrency, requestsPerKey }: ImageScannerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<ExtractedRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDuplicateReason = (record: ExtractedRecord, index: number) => {
    if (!record.admissionNo || !record.date) return null;

    // Check intra-batch
    const intraBatch = results.findIndex((r, i) =>
      i !== index &&
      r.admissionNo === record.admissionNo &&
      r.date === record.date &&
      r.feeAmount === record.feeAmount
    );
    if (intraBatch !== -1) return 'Duplicate found in current scan';

    // Check DB
    const dbMatch = existingLogs.find(log => {
      if (!log.date || !log.admissionNo) return false;
      return log.admissionNo === record.admissionNo &&
             log.date === record.date &&
             Number(log.feeAmount) === Number(record.feeAmount);
    });

    if (dbMatch) return 'Already exists in database';

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setResults([]);
      setError(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const processImages = async () => {
    const validKeys = apiKeys.filter(k => k.trim());
    if (validKeys.length === 0) {
      setError("No valid API keys found. Please configure them in Settings.");
      return;
    }
    
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);
    setProgress({ current: 0, total: files.length });

    try {
      const totalConcurrentRequests = validKeys.length > 0 ? validKeys.length * requestsPerKey : 1;
      const concurrencyLimit = totalConcurrentRequests * Math.max(1, concurrency);

      const allExtracted: ExtractedRecord[] = [];
      let completed = 0;

      for (let i = 0; i < files.length; i += concurrencyLimit) {
        const chunk = files.slice(i, i + concurrencyLimit);

        const chunkPromises = chunk.map(async (file, idx) => {
          const base64 = await fileToBase64(file);
          const imgData = { id: `img-${i + idx}`, base64, mimeType: file.type };
          
          // Process one image per request
          const extractedRecords = await extractFeeRecordsBatch([imgData], validKeys, model);
          return extractedRecords[imgData.id] || [];
        });

        const chunkResults = await Promise.allSettled(chunkPromises);

        for (const result of chunkResults) {
          if (result.status === 'fulfilled') {
            allExtracted.push(...result.value);
          } else {
            console.error("Error processing an image:", result.reason);
          }
          completed++;
        }
        setProgress({ current: completed, total: files.length });
      }

      setResults(allExtracted);
    } catch (err: any) {
      console.error("Error processing images:", err);
      setError(err.message || "Failed to process images. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToDatabase = async () => {
    if (results.length === 0) return;
    setIsSaving(true);
    setError(null);

    try {
      const newEntries = results.map(record => ({
        admissionNo: String(record.admissionNo || ''),
        studentClass: String(record.studentClass || ''),
        studentName: String(record.studentName || ''),
        feeAmount: Number(record.feeAmount) || 0,
        isGPay: Boolean(record.isGPay),
        date: String(record.date || '')
      }));

      await onAddLogs(newEntries);
      setResults([]);
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      console.error("Error saving records:", err);
      setError("Failed to save records to database.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeRecord = (index: number) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const updateRecord = (index: number, field: keyof ExtractedRecord, value: any) => {
    const newResults = [...results];
    newResults[index] = { ...newResults[index], [field]: value };
    setResults(newResults);
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-blue-600" />
        Scan from Images
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Upload Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 w-full">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2.5 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100 transition-colors cursor-pointer border border-gray-200 rounded-md bg-gray-50"
            />
          </div>
          <button
            onClick={processImages}
            disabled={files.length === 0 || isProcessing || isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing ({progress.current}/{progress.total})
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Extract Data
              </>
            )}
          </button>
        </div>

        {apiKeys.filter(k => k.trim()).length === 0 && (
          <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm border border-yellow-200">
            Please configure Gemini API keys in Settings to use image scanning.
          </div>
        )}

        {files.length > 0 && !isProcessing && results.length === 0 && (
          <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
            {files.length} image{files.length > 1 ? 's' : ''} selected. Click "Extract Data" to process.
          </p>
        )}

        {/* Results Section */}
        <ImageScannerResults
          results={results}
          isSaving={isSaving}
          saveToDatabase={saveToDatabase}
          removeRecord={removeRecord}
          updateRecord={updateRecord}
          getDuplicateReason={getDuplicateReason}
        />
      </div>
    </div>
  );
}
