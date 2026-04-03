import React from 'react';
import { Chapter } from '../utils/topicParser';
import { Edit2 } from 'lucide-react';

interface TopicEditorProps {
  parsedTopicMapping: Chapter[];
  onUpdate: (newMapping: Chapter[]) => void;
}

export default function TopicEditor({ parsedTopicMapping, onUpdate }: TopicEditorProps) {
  const handleChapterNameChange = (chapterIndex: number, newName: string) => {
    const updated = [...parsedTopicMapping];
    updated[chapterIndex] = { ...updated[chapterIndex], name: newName };
    onUpdate(updated);
  };

  const handleTopicNameChange = (chapterIndex: number, topicIndex: number, newName: string) => {
    const updated = [...parsedTopicMapping];
    const updatedTopics = [...updated[chapterIndex].topics];
    updatedTopics[topicIndex] = { ...updatedTopics[topicIndex], name: newName };
    updated[chapterIndex] = { ...updated[chapterIndex], topics: updatedTopics };
    onUpdate(updated);
  };

  if (!parsedTopicMapping || parsedTopicMapping.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Edit2 className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">Rename Chapters & Topics</h3>
      </div>
      <div className="space-y-6">
        {parsedTopicMapping.map((chapter, cIdx) => (
          <div key={cIdx} className="bg-white p-4 rounded-md shadow-sm border border-gray-100">
            <div className="mb-3">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Chapter Name</label>
              <input
                type="text"
                value={chapter.name}
                onChange={(e) => handleChapterNameChange(cIdx, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 font-medium text-gray-900"
              />
            </div>
            
            <div className="pl-4 border-l-2 border-indigo-100 space-y-3">
              {chapter.topics.map((topic, tIdx) => (
                <div key={tIdx}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Topic {tIdx + 1} <span className="font-normal text-gray-400">(Questions: {topic.questions.map(q => `Q${q}`).join(', ')})</span>
                  </label>
                  <input
                    type="text"
                    value={topic.name}
                    onChange={(e) => handleTopicNameChange(cIdx, tIdx, e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
