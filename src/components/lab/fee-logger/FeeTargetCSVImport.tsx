import React, { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface FeeTargetCSVImportProps {
  onImport: (targets: Record<string, number>) => void;
}

export default function FeeTargetCSVImport({ onImport }: FeeTargetCSVImportProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      // header: 1 reads sheet as a 2D array
      const data = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

      const newTargets: Record<string, number> = {};
      let count = 0;

      data.forEach(row => {
        // Ensure row has enough columns. 13th column is index 12.
        if (Array.isArray(row) && row.length >= 13) {
          // 3rd Column is Adm No (Index 2)
          const admNo = String(row[2] || '').trim();
          // 13th Column is Max Fee (Index 12)
          const targetFee = Number(row[12]);
          
          if (admNo && !isNaN(targetFee) && admNo !== 'Admission No' && admNo !== 'Adm No' && admNo !== '-') {
            newTargets[admNo] = targetFee;
            count++;
          }
        }
      });

      if (count > 0) {
        onImport(newTargets);
        alert(`Successfully imported/updated target fees for ${count} students.`);
      } else {
        alert('No valid data found. Ensure Admission No is in the 3rd column (C) and Max Fee is in the 13th column (M).');
      }

    } catch (error) {
      console.error("Error reading CSV:", error);
      alert('Failed to parse the file. Please check the format.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept=".csv, .xls, .xlsx" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-medium transition-colors text-sm shadow-sm border border-indigo-200 disabled:opacity-50"
        title="Upload CSV (Col C: Adm No, Col M: Max Fee)"
      >
        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        <span className="hidden sm:inline">Import Max Fees</span>
        <span className="sm:hidden">Import Targets</span>
      </button>
    </div>
  );
}
