import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import DescSchemeEditor from './DescSchemeEditor';
import DescTopicMappingSection from './DescTopicMappingSection';

interface Props {
  onClose: () => void;
}

export default function DescriptiveSettings({ onClose }: Props) {
  const [answerKey, setAnswerKey] = useState('');
  const [topicMapping, setTopicMapping] = useState('');

  useEffect(() => {
    setAnswerKey(localStorage.getItem('aims_desc_answerKey') || '');
    setTopicMapping(localStorage.getItem('aims_desc_topicMapping') || '');
  }, []);

  const handleSave = () => {
    localStorage.setItem('aims_desc_answerKey', answerKey);
    localStorage.setItem('aims_desc_topicMapping', topicMapping);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">Descriptive Evaluation Settings</h2>
          <button onClick={onClose} className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800 mb-6">
            <strong>Note:</strong> API Keys and Models are shared with the OMR module. Configure them in the main Home settings.
          </div>
          
          <DescSchemeEditor answerKey={answerKey} setAnswerKey={setAnswerKey} />
          
          <DescTopicMappingSection topicMapping={topicMapping} setTopicMapping={setTopicMapping} />
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}