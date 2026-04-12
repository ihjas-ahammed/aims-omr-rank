import React from 'react';
import { format } from 'date-fns';
import { CloudSnapshot } from '../../../services/firebaseService';
import { Download, Trash2, Clock } from 'lucide-react';

interface Props {
  snapshot: CloudSnapshot;
  onRestore: () => void;
  onDelete: () => void;
}

export default function SnapshotCard({ snapshot, onRestore, onDelete }: Props) {
  const date = new Date(snapshot.createdAt);
  const formattedDate = isNaN(date.getTime()) ? 'Unknown date' : format(date, 'PPpp');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 flex flex-col justify-between h-full transition-shadow hover:shadow-md">
      <div className="mb-4">
        <h3 className="font-bold text-lg text-gray-900 break-words line-clamp-2" title={snapshot.name}>
          {snapshot.name}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
          <Clock className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
        <button
          onClick={onRestore}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-800 rounded-lg font-medium transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Restore
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors"
          title="Delete Snapshot"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}