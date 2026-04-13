import React, { useState, useRef } from 'react';
import { X, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { DescriptiveStudent } from './types';
import { fixDescriptiveNamesBatch } from '../../../services/gemini/descriptiveService';

interface Props {
  students: DescriptiveStudent[];
  onUpdateStudents: (updated: DescriptiveStudent[]) => void;
  onClose: () => void;
}

export default function DescriptiveFixNameModal({ students, onUpdateStudents, onClose }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      // Assume 2nd column (index 1) is the original name list
      const officialNames: string[] = [];
      data.forEach(row => {
        if (row && row.length >= 2) {
          const name = String(row[1]).trim();
          if (name && name.toLowerCase() !== 'name') {
            officialNames.push(name);
          }
        }
      });

      if (officialNames.length === 0) {
        alert("No names found in the 2nd column of the CSV.");
        setIsProcessing(false);
        return;
      }

      const extractedNames = students.map(s => s.name);
      
      const keys = JSON.parse(localStorage.getItem('omr_apiKeysList') || '[]').filter((k:string) => k.trim());
      const model = localStorage.getItem('omr_proModel') || 'gemini-3.1-pro-preview';

      const mappings = await fixDescriptiveNamesBatch(extractedNames, officialNames, keys, model);
      
      const updatedStudents = students.map(s => {
        if (mappings[s.name]) {
          return { ...s, name: mappings[s.name].correctedName };
        }
        return s;
      });

      onUpdateStudents(updatedStudents);
      alert("Names fixed successfully!");
      onClose();
    } catch (err: any) {
      alert("Failed to fix names: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Fix Names with CSV</h2>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 text-center space-y-4">
          <p className="text-sm text-gray-600">
            Upload a CSV or Excel file containing the official student names in the <strong>2nd column</strong>. The AI will match the extracted names to the official list.
          </p>
          <input 
            type="file" 
            accept=".csv, .xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {isProcessing ? 'Processing Names...' : 'Upload CSV & Fix'}
          </button>
        </div>
      </div>
    </div>
  );
}