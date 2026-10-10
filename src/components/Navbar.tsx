import React from 'react';
import { Sparkles, Compass, MessageSquareCode, GraduationCap, History } from 'lucide-react';

interface NavbarProps {
  activeTab: 'interview' | 'training' | 'history';
  onSelectTab: (tab: 'interview' | 'training' | 'history') => void;
  onQuickStart: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onQuickStart,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <div 
          onClick={() => onSelectTab('interview')}
          className="cursor-pointer text-lg font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm font-black text-sm">
            K
          </span>
          <span className="font-display tracking-tight text-slate-100 font-semibold">
            Kariyer & Mülakat Koçu
          </span>
        </div>

        {/* Zone 2: Navigation Links (1-2 word labels, single line) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectTab('interview')}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === 'interview'
                ? 'text-indigo-400 border-indigo-500 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <MessageSquareCode className="w-4 h-4" />
            <span>Mülakat Simülasyonu</span>
          </button>

          <button
            onClick={() => onSelectTab('training')}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === 'training'
                ? 'text-indigo-400 border-indigo-500 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Eğitim Yol Haritası</span>
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
              activeTab === 'history'
                ? 'text-indigo-400 border-indigo-500 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Kayıtlı Analizler ({savedCount})</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onQuickStart}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap shrink-0 active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hızlı Prova Başlat</span>
          </button>
        </div>
      </div>
    </header>
  );
};
