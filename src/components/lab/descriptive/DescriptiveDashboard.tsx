import React, { useState, useRef } from 'react';
import { ArrowLeft, FileSignature, Settings, Loader2 } from 'lucide-react';
import DescriptiveSettings from './DescriptiveSettings';
import DescriptiveFixNameModal from './DescriptiveFixNameModal';
import DescriptiveToolbar from './DescriptiveToolbar';
import DescriptiveQueue from './DescriptiveQueue';
import DescriptiveProgress from './DescriptiveProgress';
import DescriptiveStudentList from './DescriptiveStudentList';
import DescriptiveDetailModal from './DescriptiveDetailModal';
import DescriptivePrintView from './DescriptivePrintView';
import DescStudentSort from './DescStudentSort';
import { DescriptiveStudent } from './types';
import { useDescriptivePipeline } from './hooks/useDescriptivePipeline';

interface Props {
  onBack: () => void;
}

export default function DescriptiveDashboard({ onBack }: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const [showFixName, setShowFixName] = useState(false);
  const [showPrintView, setShowPrintView] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<DescriptiveStudent | null>(null);
  
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'default'>('default');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    images,
    students,
    pipelineState,
    progress,
    isLoadingState,
    handleFileUpload,
    handleRemoveImage,
    handleClearAll,
    runPipeline,
    handleExportCSV,
    handleUpdateStudents,
    handleRemoveStudent
  } = useDescriptivePipeline();

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleFileUpload(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isLoadingState) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (showPrintView) {
    return <DescriptivePrintView students={students} onBack={() => setShowPrintView(false)} />;
  }

  const unassignedImages = images.filter(img => !img.studentId);

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'default') return 0;
    
    if (sortBy === 'name') {
      const cmp = a.name.localeCompare(b.name);
      return sortOrder === 'asc' ? cmp : -cmp;
    }
    
    if (sortBy === 'score') {
      const scoreA = a.result?.totalScore || 0;
      const scoreB = b.result?.totalScore || 0;
      const cmp = scoreA - scoreB;
      return sortOrder === 'asc' ? cmp : -cmp;
    }
    
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors border border-gray-200 bg-white shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <FileSignature className="w-6 h-6" />
            </div>
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

      <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={onUpload}
        />

        <DescriptiveToolbar
          pipelineState={pipelineState}
          imagesCount={images.length}
          studentsCount={students.length}
          onUploadClick={() => fileInputRef.current?.click()}
          onClearAll={handleClearAll}
          onFixNames={() => setShowFixName(true)}
          onExportCSV={handleExportCSV}
          onEvaluate={() => runPipeline(() => setShowSettings(true))}
          onPrint={() => setShowPrintView(true)}
        />

        {pipelineState === 'processing' && (
          <DescriptiveProgress step={progress.step} current={progress.current} total={progress.total} />
        )}

        {unassignedImages.length > 0 && (
          <DescriptiveQueue images={unassignedImages} onRemove={handleRemoveImage} />
        )}

        {students.length > 0 && (
          <>
            <DescStudentSort 
              sortBy={sortBy} setSortBy={setSortBy} 
              sortOrder={sortOrder} setSortOrder={setSortOrder} 
              searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
            />
            <DescriptiveStudentList 
              students={sortedStudents} 
              onRemoveStudent={handleRemoveStudent}
              onViewDetails={(s) => setSelectedStudentForDetails(s)} 
            />
          </>
        )}

        {!unassignedImages.length && !students.length && pipelineState !== 'processing' && (
          <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            No images uploaded yet. Click "Upload Images" to start.
          </div>
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

      {selectedStudentForDetails && (
        <DescriptiveDetailModal
          student={selectedStudentForDetails}
          onClose={() => setSelectedStudentForDetails(null)}
        />
      )}
    </div>
  );
}