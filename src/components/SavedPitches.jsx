import React from 'react';
import { FolderGit2, ArrowUpRight, Clock3, Trash2, AlertTriangle, Cpu } from 'lucide-react';

export default function SavedPitches({
  savedPitches = [],
  onRestore,
  onDelete,
  onNavigate,
  storageError = null,
}) {
  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Recently saved';
      return d.toLocaleString();
    } catch {
      return 'Recently saved';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-950/30 via-navy-900 to-navy-900 border border-violet-500/20 p-6">
        <div className="flex items-center gap-3 text-violet-400 mb-2">
          <FolderGit2 className="w-5 h-5" />
          <span className="text-xs font-bold tracking-wider uppercase">Pitch Vault</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Your saved pitch drafts live here.
        </h2>
        <p className="mt-1 text-slate-400 text-xs sm:text-sm">
          Pitches are stored securely in browser persistence. Re-open any draft to edit or rehearse.
        </p>
      </div>

      {/* Storage Quota Error Warning */}
      {storageError && (
        <div className="rounded-xl bg-amber-950/30 border border-amber-500/40 p-4 text-xs text-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-300">Storage Notice:</span> {storageError}
          </div>
        </div>
      )}

      {!savedPitches.length ? (
        <div className="rounded-2xl bg-navy-900 border border-dashed border-navy-800 p-12 text-center text-slate-400">
          No pitches saved yet. Build your first draft in the Pitch Studio and keep it in the vault.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {savedPitches.map((pitch, index) => {
            const pitchId = pitch.id || `pitch-${index}`;
            const title = pitch.title || pitch.metadata?.title || 'Untitled Pitch';
            const tech = pitch.metadata?.technologies;
            const sections = pitch.sections && typeof pitch.sections === 'object' ? Object.values(pitch.sections) : [];

            return (
              <div
                key={pitchId}
                className="rounded-2xl bg-navy-900 border border-navy-800 hover:border-violet-500/40 p-5 flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-base font-bold text-white group-hover:text-violet-300 transition line-clamp-1">
                      {title}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onDelete && (
                        <button
                          onClick={() => onDelete(pitchId)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-navy-800 transition"
                          title="Delete draft"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onRestore(pitch)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600 border border-violet-500/30 hover:border-violet-500 text-violet-300 hover:text-white text-xs font-semibold transition"
                      >
                        <span>Open</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                    <Clock3 className="w-3 h-3 text-slate-500" />
                    <span>{formatDate(pitch.savedAt || pitch.createdAt)}</span>
                  </div>

                  {tech && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400 truncate">
                      <Cpu className="w-3 h-3 text-violet-400 shrink-0" />
                      <span className="truncate">{tech}</span>
                    </div>
                  )}

                  <div className="mt-4 space-y-2 text-sm text-slate-300">
                    {sections.slice(0, 3).map((section, sIdx) => (
                      <div
                        key={section.title || sIdx}
                        className="rounded-lg bg-navy-850 border border-navy-750 p-2.5"
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {section.title || `Section ${sIdx + 1}`}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-300 leading-relaxed">
                          {section.content || 'Draft content in progress.'}
                        </p>
                      </div>
                    ))}
                    {sections.length === 0 && (
                      <div className="p-3 text-xs text-slate-500 text-center">
                        Sections not available in draft.
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-navy-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{sections.length} pitch sections</span>
                  <span className="text-violet-400 font-medium">Ready for Judge Practice</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => onNavigate('builder')}
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition"
        >
          Back to Pitch Studio
        </button>
      </div>
    </div>
  );
}
