import React from 'react';
import {
  Sparkles,
  Lightbulb,
  ShieldCheck,
  ArrowRight,
  Target,
  Zap,
  Clock,
  FileText,
  ExternalLink,
} from 'lucide-react';

export default function Dashboard({ onNavigate, project, onSetProject, sampleProject, savedPitches }) {
  const handleLoadSample = () => {
    onSetProject(sampleProject);
    onNavigate('builder');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-900/40 via-navy-850 to-navy-900 border border-violet-500/20 p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 mb-4">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            Hackathon Ready Pitch System
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Your idea deserves a pitch that delivers.
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Turn fragmented hackathon concepts into concise, judge-tested problem statements, architectural rundowns, and high-impact 60-second verbal hooks.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => onNavigate('builder')} className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition shadow-lg shadow-violet-600/30 flex items-center gap-2">
              <span>Build My Pitch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={handleLoadSample} className="px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 font-medium text-sm transition flex items-center gap-2">
              <span>Load Sample Project</span>
              <Sparkles className="w-4 h-4 text-violet-400" />
            </button>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Core Coaching Workflows</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div onClick={() => onNavigate('builder')} className="group cursor-pointer rounded-2xl bg-navy-900 border border-navy-800 hover:border-violet-500/50 p-6 transition-all duration-200 hover:shadow-xl hover:shadow-violet-600/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white transition duration-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Build My Pitch</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generate an organized 5-section pitch tailored with distinct problem framing, technical stack notes, and a 60-second verbal script.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-violet-400 text-xs font-semibold group-hover:translate-x-1 transition">
              Launch Builder <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div onClick={() => onNavigate('improver')} className="group cursor-pointer rounded-2xl bg-navy-900 border border-navy-800 hover:border-violet-500/50 p-6 transition-all duration-200 hover:shadow-xl hover:shadow-violet-600/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition duration-200">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Improve My Idea</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Run an automated gap analysis on your idea to detect weak problem statements, ambiguous users, and missing technical moats.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-amber-400 text-xs font-semibold group-hover:translate-x-1 transition">
              Analyze Concept <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div onClick={() => onNavigate('judge')} className="group cursor-pointer rounded-2xl bg-navy-900 border border-navy-800 hover:border-violet-500/50 p-6 transition-all duration-200 hover:shadow-xl hover:shadow-violet-600/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition duration-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Practice With a Judge</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Face simulated tough judge questions one by one. Submit your answers and receive immediate tactical scoring and critique.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-emerald-400 text-xs font-semibold group-hover:translate-x-1 transition">
              Start Simulation <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-navy-900 border border-navy-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-400" />
              Active Project Scope
            </h3>
            {project.title && <span className="text-xs px-2.5 py-1 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">In Memory</span>}
          </div>

          {project.title ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-navy-850 border border-navy-700">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">Project</div>
                <div className="text-xl font-bold text-white">{project.title}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-4 rounded-xl bg-navy-850 border border-navy-700">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">Core Problem</div>
                  <p className="text-slate-300 leading-relaxed">{project.problem}</p>
                </div>
                <div className="p-4 rounded-xl bg-navy-850 border border-navy-700">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">Target Audience</div>
                  <p className="text-slate-300 leading-relaxed">{project.targetUsers}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-navy-700 p-8 text-center text-slate-400">
              No active project yet. Load the sample or create your own idea.
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-navy-900 border border-navy-800 p-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-violet-400" />
            Quick Status
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-navy-850 border border-navy-700 px-3 py-2">
              <span className="text-slate-400">Saved pitches</span>
              <span className="text-white font-semibold">{savedPitches.length}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-navy-850 border border-navy-700 px-3 py-2">
              <span className="text-slate-400">Current theme</span>
              <span className="text-white font-semibold truncate max-w-[140px]">{project.hackathonTheme || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-navy-850 border border-navy-700 px-3 py-2">
              <span className="text-slate-400">Build status</span>
              <span className="text-emerald-400 font-semibold">Ready</span>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-violet-600/10 border border-violet-500/20 p-3">
            <div className="flex items-center gap-2 text-violet-300 font-medium mb-2">
              <FileText className="w-4 h-4" />
              Coach note
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Lead with impact and a defensible technical edge — judges usually decide within the first 30 seconds.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-navy-900 border border-navy-800 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-violet-400" />
            Recommended next steps
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <button onClick={() => onNavigate('builder')} className="text-left rounded-xl border border-navy-700 bg-navy-850 p-4 hover:border-violet-500/40 transition">
            <div className="text-sm font-semibold text-white mb-1">1. Draft the pitch</div>
            <div className="text-xs text-slate-400">Turn your idea into a 5-part storyline with a strong verbal hook.</div>
          </button>
          <button onClick={() => onNavigate('improver')} className="text-left rounded-xl border border-navy-700 bg-navy-850 p-4 hover:border-amber-500/30 transition">
            <div className="text-sm font-semibold text-white mb-1">2. Stress-test the idea</div>
            <div className="text-xs text-slate-400">Identify weak spots before you walk into a judging round.</div>
          </button>
          <button onClick={() => onNavigate('judge')} className="text-left rounded-xl border border-navy-700 bg-navy-850 p-4 hover:border-emerald-500/30 transition">
            <div className="text-sm font-semibold text-white mb-1">3. Practice interviews</div>
            <div className="text-xs text-slate-400">Answer skeptical judge questions with disciplined, concise responses.</div>
          </button>
        </div>
      </div>
    </div>
  );
}
