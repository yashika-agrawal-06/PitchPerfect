import React from 'react';
import { Menu, Sparkles, PlusCircle } from 'lucide-react';

export default function Header({ onMenuClick, onQuickBuild, currentView }) {
  const titles = {
    dashboard: 'Workspace Overview',
    builder: 'Structured Pitch Studio',
    improver: 'Idea Gap & Health Analysis',
    judge: 'Simulated Judge Q&A',
    pitches: 'Saved Pitch Vault',
    guide: 'Hackathon Pitch Playbook',
  };

  return (
    <header className="h-16 sticky top-0 z-30 bg-navy-950/80 backdrop-blur-md border-b border-navy-800/80 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-850">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight">{titles[currentView] || 'PitchPerfect'}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onQuickBuild} className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-medium transition shadow-sm shadow-violet-600/30">
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">New Pitch</span>
        </button>
      </div>
    </header>
  );
}
