import React, { useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  ShieldAlert,
  Award,
  Sparkles,
} from 'lucide-react';
import { coachingEngine } from '../services/coachingEngine';

export default function IdeaImprover({ project, setProject, sampleProject, onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await coachingEngine.improveIdea(project);
      setAnalysis(result);
    } catch (err) {
      console.error('Idea analysis failed:', err);
      setError(err.message || 'Failed to analyze idea.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/30 via-navy-900 to-navy-900 border border-amber-500/20 p-6 sm:p-8">
        <div className="flex items-center gap-3 text-amber-400 mb-2">
          <Lightbulb className="w-5 h-5" />
          <span className="text-xs font-bold tracking-wider uppercase">
            Hackathon Viability Audit
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Detect Blindspots Before the Judges Do.
        </h2>
        <p className="mt-2 text-slate-300 text-sm max-w-2xl leading-relaxed">
          Most hackathon ideas fail not from weak code, but from unclear user personas, lack of
          competitive moats, or vague impact metrics.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Analyzing idea...' : 'Run gap analysis'}
          </button>
          {!project.title && (
            <button
              onClick={() => setProject(sampleProject)}
              className="px-4 py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 border border-navy-700 text-xs font-medium transition"
            >
              Fill sample project
            </button>
          )}

          {analysis && (
            analysis.isFallback ? (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                Local Heuristics Review
              </span>
            ) : (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Gemini AI Review
              </span>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-950/30 border border-rose-500/40 p-4 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">Pitch Readiness Score</span>
                <div className="text-3xl font-extrabold text-white mt-1">
                  {analysis.score}
                  <span className="text-sm text-slate-500">/100</span>
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                  analysis.score >= 80
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {analysis.score >= 80 ? 'A' : analysis.score >= 60 ? 'B' : 'C'}
              </div>
            </div>

            <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
              <div className="text-xs font-semibold text-slate-400">Strengths</div>
              <div className="text-2xl font-bold text-white mt-2">
                {(analysis.strengths || []).length}
              </div>
            </div>

            <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
              <div className="text-xs font-semibold text-slate-400">Critical gaps</div>
              <div className="text-2xl font-bold text-white mt-2">
                {(analysis.critiques || []).length}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-4">
                <CheckCircle2 className="w-4 h-4" />
                Strengths
              </div>
              <ul className="space-y-3">
                {(analysis.strengths || []).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="mt-1 text-emerald-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
              <div className="flex items-center gap-2 text-amber-400 font-semibold mb-4">
                <AlertTriangle className="w-4 h-4" />
                Critiques
              </div>
              <ul className="space-y-3">
                {(analysis.critiques || []).map((item, idx) => (
                  <li key={idx} className="rounded-xl bg-navy-850 border border-navy-700 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-white">
                        {item.category || 'Critique'}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full font-medium uppercase ${
                          item.severity === 'high'
                            ? 'bg-red-500/15 text-red-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {item.severity || 'Medium'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {item.message}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
            <div className="flex items-center gap-2 text-violet-400 font-semibold mb-4">
              <ShieldAlert className="w-4 h-4" />
              Judge-facing suggestions
            </div>
            <ul className="space-y-3">
              {(analysis.suggestions || []).map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                  <Award className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!analysis && !loading && (
        <div className="rounded-2xl bg-navy-900 border border-dashed border-navy-800 p-8 text-center text-slate-300">
          Pick a project, then run the analyzer to see strengths, critique, and judge-readiness guidance.
        </div>
      )}

      {loading && (
        <div className="rounded-2xl bg-navy-900 border border-navy-800 p-8 text-center text-slate-300">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-3" />
          Running idea assessment...
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => onNavigate('builder')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition"
        >
          Continue to builder <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
