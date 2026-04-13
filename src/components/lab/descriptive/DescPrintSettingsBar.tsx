import React from 'react';
import { ArrowLeft, Printer, Settings2 } from 'lucide-react';

interface Props {
  title: string;
  setTitle: (v: string) => void;
  subtitle: string;
  setSubtitle: (v: string) => void;
  cardsPerRow: number;
  setCardsPerRow: (v: number) => void;
  onBack: () => void;
  onPrint: () => void;
}

export default function DescPrintSettingsBar({
  title, setTitle, subtitle, setSubtitle, cardsPerRow, setCardsPerRow, onBack, onPrint
}: Props) {
  return (
    <div className="print:hidden mb-4 p-4 md:p-6 bg-white border-b border-gray-200 text-gray-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors border border-gray-200">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
              <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                <Settings2 className="w-5 h-5" />
              </div>
              Print Descriptive Results
            </h2>
          </div>
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg w-full md:w-auto justify-center active:scale-95"
          >
            <Printer className="w-5 h-5" />
            Print List
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Main Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-bold text-slate-900 outline-none transition-shadow shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-bold text-slate-900 outline-none transition-shadow shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cards per row</label>
            <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl border border-slate-200">
              {[2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => setCardsPerRow(num)}
                  className={`flex-1 py-2 rounded-lg text-sm font-black transition-all ${cardsPerRow === num ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-800'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}