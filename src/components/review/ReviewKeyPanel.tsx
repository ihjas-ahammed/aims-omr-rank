import React from 'react';

interface Props {
  answerKey?: string;
}

export default function ReviewKeyPanel({ answerKey }: Props) {
  return (
    <div className="hidden md:flex md:w-3/12 p-6 overflow-y-auto bg-gray-50 flex-col">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Answer Key</h4>
      <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm overflow-y-auto">
        <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap font-sans break-words">
          {answerKey || 'No answer key provided.'}
        </pre>
      </div>
    </div>
  );
}