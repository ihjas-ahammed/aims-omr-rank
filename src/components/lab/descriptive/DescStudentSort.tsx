import React from 'react';
import { ArrowUp, ArrowDown, Search } from 'lucide-react';

interface Props {
  sortBy: 'name' | 'score' | 'default';
  setSortBy: (v: 'name' | 'score' | 'default') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (v: 'asc' | 'desc') => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}

export default function DescStudentSort({ sortBy, setSortBy, sortOrder, setSortOrder, searchQuery, setSearchQuery }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-gray-600 uppercase tracking-wider ml-1">Sort:</span>
        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 outline-none font-medium"
        >
          <option value="default">Default</option>
          <option value="name">Name</option>
          <option value="score">Score</option>
        </select>
        
        {sortBy !== 'default' && (
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
          >
            {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search students..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
        />
      </div>
    </div>
  );
}