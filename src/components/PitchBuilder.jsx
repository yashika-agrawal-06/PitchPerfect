import React, { useState } from 'react';
import {
  Loader2,
  Sparkles,
  Save,
  Copy,
  Check,
  ChevronRight,
  Layers,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function PitchBuilder({
  project,
  setProject,
  sampleProject,
  generatedPitch,
  setGeneratedPitch,
  onGeneratePitch,
  onSavePitch,
  onNavigate,
  storageError,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setProject((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleUseSample = () => {
    setProject(sampleProject);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!project.title?.trim() && !project.problem?.trim()) {
      setError('Please provide at least a project title and problem statement.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onGeneratePitch();
    } catch (err) {
      console.error('Pitch generation failed:', err);
      setError(err.message || 'Failed to generate pitch.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSavePitch();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleUpdateSection = (key, value) => {
    setGeneratedPitch((current) => {
      if (!current) return current;
      return {
        ...current,
        sections: {
          ...current.sections,
          [key]: {
            ...current.sections[key],
            content: value,
          },
        },
      };
    });
  };

  const handleCopy = async (content, key) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
    } catch (err) {
      console.error('Clipboard access failed', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {storageError && (
        <div className="rounded-xl bg-amber-950/30 border border-amber-500/40 p-3.5 text-xs text-amber-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{storageError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Blueprint Input Form */}
        <div className="lg:col-span-5 rounded-2xl bg-navy-900 border border-navy-800 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Project Blueprint
            </h2>
            <button
              onClick={handleUseSample}
              className="text-xs text-violet-300 hover:text-violet-200 transition"
            >
              Use sample
            </button>
          </div>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              handleGenerate();
            }}
          >
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Project / Product Name
              </label>
              <input
                type="text"
                value={project.title || ''}
                onChange={(event) => handleInputChange('title', event.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition"
                placeholder="e.g., PulseGuard"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Problem Statement
              </label>
              <textarea
                rows={4}
                value={project.problem || ''}
                onChange={(event) => handleInputChange('problem', event.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition resize-none"
                placeholder="Describe the pain point, cost of inaction, and urgency..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Users
              </label>
              <textarea
                rows={3}
                value={project.targetUsers || ''}
                onChange={(event) => handleInputChange('targetUsers', event.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition resize-none"
                placeholder="Who is directly affected? Be specific about the beachhead persona..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hackathon Track / Theme
              </label>
              <input
                type="text"
                value={project.hackathonTheme || ''}
                onChange={(event) => handleInputChange('hackathonTheme', event.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition"
                placeholder="e.g., AI for Social Good, Smart Campus"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Technologies & Stack
              </label>
              <input
                type="text"
                value={project.technologies || ''}
                onChange={(event) => handleInputChange('technologies', event.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition"
                placeholder="e.g., React, FastAPI, Web Bluetooth, PostGIS"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Pitch Sections...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Structured Pitch</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Pitch Workspace Output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-400" />
                Pitch Workspace
              </h2>
              {generatedPitch && (
                generatedPitch.isFallback ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    Local Heuristics
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Gemini AI
                  </span>
                )
              )}
            </div>

            {generatedPitch && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 text-xs font-medium transition"
                >
                  {savedSuccess ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{savedSuccess ? 'Saved!' : 'Save to Vault'}</span>
                </button>

                <button
                  onClick={() => onNavigate('judge')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition"
                >
                  <span>Practice with Judge</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {!generatedPitch && !loading && (
            <div className="rounded-2xl bg-navy-900 border border-dashed border-navy-800 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-navy-850 border border-navy-700 flex items-center justify-center mx-auto mb-3 text-slate-500">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-300">Workspace is Waiting</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Fill out the project blueprint on the left or load the sample project to generate your structured 5-part pitch.
              </p>
              <button
                onClick={handleUseSample}
                className="px-4 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-violet-300 border border-violet-500/20 text-xs font-medium transition"
              >
                Load PulseGuard Sample
              </button>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl bg-navy-900 border border-navy-800 p-12 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Synthesizing Hackathon Pitch</p>
                <p className="text-xs text-slate-400">
                  Structuring problem clarity, technical moat, and 60-second verbal delivery script...
                </p>
              </div>
            </div>
          )}

          {generatedPitch && !loading && (
            <div className="space-y-4">
              {Object.entries(generatedPitch.sections || {}).map(([key, section]) => (
                <div
                  key={key}
                  className={`rounded-2xl p-5 border transition-all ${
                    key === 'sixtySecondPitch'
                      ? 'bg-gradient-to-br from-violet-950/40 via-navy-900 to-navy-900 border-violet-500/40 shadow-lg shadow-violet-950/30'
                      : 'bg-navy-900 border-navy-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {key === 'sixtySecondPitch' && (
                        <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                      )}
                      {section.title}
                    </h3>
                    <button
                      onClick={() => handleCopy(section.content, key)}
                      className="p-1.5 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 transition"
                      title="Copy section to clipboard"
                    >
                      {copiedKey === key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <textarea
                    rows={key === 'sixtySecondPitch' ? 4 : 3}
                    value={section.content || ''}
                    onChange={(event) => handleUpdateSection(key, event.target.value)}
                    className="w-full bg-navy-850/60 rounded-xl p-3 text-slate-200 text-xs sm:text-sm border border-navy-750 focus:outline-none focus:border-violet-500 leading-relaxed resize-none transition"
                  />

                  {section.coachTip && (
                    <div className="mt-2.5 flex items-start gap-2 text-[11px] text-violet-300/80 bg-violet-900/10 px-3 py-1.5 rounded-lg border border-violet-500/10">
                      <span className="font-semibold text-violet-400 uppercase tracking-wider text-[10px] shrink-0">
                        Coach Tip:
                      </span>
                      <span>{section.coachTip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
