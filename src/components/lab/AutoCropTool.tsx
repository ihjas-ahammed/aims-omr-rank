import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Loader2, RefreshCw, RotateCw } from 'lucide-react';
import { autoCropAndRotate, AutoCropResult } from '../../services/geminiService';

interface AutoCropToolProps {
  apiKeys: string[];
  liteModel: string;
  onBack: () => void;
}

export default function AutoCropTool({ apiKeys, liteModel, onBack }: AutoCropToolProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cropData, setCropData] = useState<AutoCropResult | null>(null);
  const [manualRotation, setManualRotation] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
      setError(null);
      setCropData(null);
      setManualRotation(0);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const renderCanvas = (file: File, res: AutoCropResult, rot: number) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError("Failed to initialize canvas");
        setIsProcessing(false);
        return;
      }

      const x = (res.xmin / 1000) * img.width;
      const y = (res.ymin / 1000) * img.height;
      const w = ((res.xmax - res.xmin) / 1000) * img.width;
      const h = ((res.ymax - res.ymin) / 1000) * img.height;

      // If rotating by 90 or 270, the final dimensions are swapped
      if (rot === 90 || rot === 270) {
        canvas.width = h;
        canvas.height = w;
      } else {
        canvas.width = w;
        canvas.height = h;
      }

      // Move origin to center
      ctx.translate(canvas.width / 2, canvas.height / 2);
      // Rotate the canvas context
      ctx.rotate((rot * Math.PI) / 180);
      
      // Draw the cropped region relative to the new rotated center
      ctx.drawImage(img, x, y, w, h, -w / 2, -h / 2, w, h);
      
      setResultUrl(canvas.toDataURL('image/jpeg', 0.9));
      setIsProcessing(false);
    };
    img.onerror = () => {
      setError("Failed to load image for cropping");
      setIsProcessing(false);
    };
    img.src = URL.createObjectURL(file);
  };

  const processImage = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    setCropData(null);
    
    try {
      const base64 = await fileToBase64(selectedFile);
      const res = await autoCropAndRotate(base64, selectedFile.type, apiKeys, liteModel);
      
      // Enforce portrait orientation if the model missed it
      const w = res.xmax - res.xmin;
      const h = res.ymax - res.ymin;
      let finalRotation = res.rotation;
      
      // If crop box is landscape (wider than tall) but the model returned 0 or 180 rotation
      // then we auto-correct it by adding 90 degrees because OMR sheets are inherently portrait.
      if (w > h && (finalRotation === 0 || finalRotation === 180)) {
        console.log(`Auto-correcting orientation: crop is wider (${w}) than tall (${h}), setting rotation to 90.`);
        finalRotation = (finalRotation + 90) % 360;
      }

      setCropData(res);
      setManualRotation(finalRotation);
      renderCanvas(selectedFile, res, finalRotation);
    } catch (err: any) {
      setError(err.message || 'Failed to process image');
      setIsProcessing(false);
    }
  };

  const handleManualRotate = () => {
    if (!selectedFile || !cropData) return;
    const newRot = (manualRotation + 90) % 360;
    setManualRotation(newRot);
    setIsProcessing(true);
    renderCanvas(selectedFile, cropData, newRot);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Auto-Crop & Rotate OMR</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full">
            <p className="text-gray-600 mb-4">Upload a raw image of an OMR sheet. The Lite model will attempt to find its boundaries, crop out the background, and orient it correctly.</p>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Image
              </button>
              <button
                onClick={processImage}
                disabled={!selectedFile || isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {isProcessing ? 'Processing...' : 'Process with Lite Model'}
              </button>
            </div>
            
            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}

            {cropData && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-gray-700">Model Prediction:</p>
                  <button 
                    onClick={handleManualRotate}
                    disabled={isProcessing}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-md text-gray-700 font-medium transition-colors disabled:opacity-50"
                  >
                    <RotateCw className="w-4 h-4" /> Rotate +90°
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-600 font-mono bg-white p-2 rounded border border-gray-100">
                  <div><span className="font-bold">ymin:</span> {cropData.ymin}</div>
                  <div><span className="font-bold">xmin:</span> {cropData.xmin}</div>
                  <div><span className="font-bold">ymax:</span> {cropData.ymax}</div>
                  <div><span className="font-bold">xmax:</span> {cropData.xmax}</div>
                  <div className="text-purple-600"><span className="font-bold">Current Rot:</span> {manualRotation}°</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center min-h-[400px]">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 w-full text-left">Original Image</h3>
            {previewUrl ? (
              <img src={previewUrl} alt="Original" className="max-w-full max-h-[500px] object-contain shadow-sm border border-gray-300 rounded" />
            ) : (
              <div className="text-gray-400">No image uploaded</div>
            )}
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col items-center justify-center min-h-[400px]">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 w-full text-left">Result</h3>
            {isProcessing && !resultUrl ? (
              <div className="flex flex-col items-center text-purple-600">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="font-medium animate-pulse">Model is computing coordinates...</p>
              </div>
            ) : resultUrl ? (
              <div className="relative flex items-center justify-center w-full h-full">
                <img src={resultUrl} alt="Cropped" className="max-w-full max-h-[500px] object-contain shadow-md border border-gray-300 rounded transition-all duration-300" />
                {isProcessing && (
                  <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400">Waiting for processing...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
