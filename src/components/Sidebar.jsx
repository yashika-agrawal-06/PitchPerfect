import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  HelpCircle,
  BookOpen,
  Layers,
  FolderGit2,
  X,
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, isOpen, setIsOpen, pitchCount }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'builder', label: 'Pitch Builder', icon: Sparkles },
    { id: 'improver', label: 'Idea Improver', icon: Layers },
    { id: 'judge', label: 'Judge Practice', icon: HelpCircle },
    { id: 'pitches', label: 'My Pitches', icon: FolderGit2, badge: pitchCount },
    { id: 'guide', label: 'Pitch Guide', icon: BookOpen },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-64 bg-navy-900 border-r border-navy-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">
                Pitch<span className="text-violet-400">Perfect</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">Hackathon Coach</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-navy-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25' : 'text-slate-400 hover:text-slate-100 hover:bg-navy-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-navy-800 text-violet-300 border border-violet-500/30'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-navy-800">
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-700/60 text-xs">
            <div className="flex items-center gap-2 text-violet-400 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AWS Serverless Engine
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Powered by AWS Lambda &amp; Gemini with client-side fallback resilience.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
