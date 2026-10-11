import React, { useState } from 'react';
import {
  MessageSquareText,
  Loader2,
  ArrowRight,
  CheckCircle2,
  BrainCircuit,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Check,
  Info,
} from 'lucide-react';
import { coachingEngine } from '../services/coachingEngine';

export default function JudgePractice({
  project,
  questions = [],
  currentQuestion,
  questionIndex,
  setQuestionIndex,
  judgeResult,
  setJudgeResult,
  isLoading = false,
  error = null,
  onReloadQuestions,
}) {
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState(null);

  const handleSubmit = async () => {
    if (!currentQuestion || !answer.trim() || evaluating) return;
    setEvaluating(true);
    setEvalError(null);
    try {
      const result = await coachingEngine.evaluateJudgeAnswer(
        currentQuestion.question,
        answer
      );
      setJudgeResult(result);
    } catch (err) {
      console.error('Answer evaluation failed:', err);
      setEvalError(err.message || 'Failed to evaluate answer.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    setAnswer('');
    setJudgeResult(null);
    setEvalError(null);
    if (questions && questions.length > 0) {
      setQuestionIndex((current) => (current + 1) % questions.length);
    }
  };

  const getQualityBadgeColor = (quality) => {
    switch (quality) {
      case 'Excellent':
        return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
      case 'Good':
        return 'text-teal-300 bg-teal-500/15 border-teal-500/30';
      case 'Partially Correct':
        return 'text-amber-300 bg-amber-500/15 border-amber-500/30';
      case 'Weak':
        return 'text-orange-300 bg-orange-500/15 border-orange-500/30';
      case 'Fundamentally Incorrect':
      default:
        return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/30 via-navy-900 to-navy-900 border border-emerald-500/20 p-6 sm:p-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 text-emerald-400 mb-2">
              <BrainCircuit className="w-5 h-5" />
              <span className="text-xs font-bold tracking-wider uppercase">
                Honest Judge Simulator
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Tough, evidence-based questioning before demo day.
            </h2>
            <p className="mt-2 text-slate-400 text-xs sm:text-sm max-w-2xl">
              Honest Judge Mode prioritizes technical correctness over arbitrary text length.
              Blatant false claims are penalized heavily; short, accurate answers score well.
            </p>
          </div>

          {onReloadQuestions && (
            <button
              onClick={onReloadQuestions}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-slate-200 text-xs font-medium transition disabled:opacity-60"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate Questions</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading State for Questions */}
      {isLoading && (
        <div className="rounded-2xl bg-navy-900 border border-navy-800 p-12 text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              Synthesizing Project-Specific Questions
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Analyzing &quot;{project?.title || 'your project'}&quot; architecture, failure
              modes, and technology trade-offs...
            </p>
          </div>
        </div>
      )}

      {/* Error State for Questions */}
      {!isLoading && error && (
        <div className="rounded-2xl bg-rose-950/20 border border-rose-500/30 p-6 flex flex-col items-center justify-center text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-400" />
          <h3 className="text-sm font-semibold text-white">Could not generate questions</h3>
          <p className="text-xs text-slate-300 max-w-md">{error}</p>
          {onReloadQuestions && (
            <button
              onClick={onReloadQuestions}
              className="mt-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition"
            >
              Retry Generation
            </button>
          )}
        </div>
      )}

      {/* Active Question Box */}
      {!isLoading && !error && currentQuestion && (
        <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <MessageSquareText className="w-4 h-4 text-emerald-400" />
              <span>
                Question {questionIndex + 1} of {questions.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentQuestion.isFallback ? (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  Local Heuristics
                </span>
              ) : (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini AI Question
                </span>
              )}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300">
                {currentQuestion.aspect || 'Technical Feasibility'}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-navy-850 border border-navy-700 p-4">
            <div className="text-sm md:text-base text-slate-200 leading-relaxed font-medium">
              {currentQuestion.question}
            </div>
            <div className="mt-3 text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Difficulty: {currentQuestion.difficulty || 'Hard'}
            </div>
          </div>

          <div className="mt-4">
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={7}
              placeholder="Write your answer as if you are speaking directly to hackathon judges. Be technically specific, cite mechanisms or trade-offs, and state real boundaries..."
              className="w-full rounded-xl bg-navy-850 border border-navy-700 px-4 py-3 text-slate-100 text-sm leading-relaxed focus:outline-none focus:border-emerald-500 resize-none transition"
            />
            <div className="mt-1 flex justify-between text-[11px] text-slate-500 px-1">
              <span>Short, accurate answers score well. Long fluff without substance is penalized.</span>
              <span>{answer.trim() ? answer.trim().split(/\s+/).length : 0} words</span>
            </div>
          </div>

          {evalError && (
            <div className="mt-3 p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{evalError}</span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleSubmit}
              disabled={evaluating || !answer.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20"
            >
              {evaluating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {evaluating ? 'Evaluating against rubric...' : 'Submit answer'}
            </button>

            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-700 text-slate-200 text-sm font-medium transition"
            >
              Skip to next question <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!currentQuestion || questions.length === 0) && (
        <div className="rounded-2xl bg-navy-900 border border-dashed border-navy-800 p-12 text-center text-slate-400 space-y-3">
          <p>No judge questions currently loaded for this project.</p>
          {onReloadQuestions && (
            <button
              onClick={onReloadQuestions}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition"
            >
              Generate Questions Now
            </button>
          )}
        </div>
      )}

      {/* Structured Rubric Evaluation Result */}
      {judgeResult && (
        <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5 sm:p-7 space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap border-b border-navy-800 pb-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400 flex items-center gap-2">
                <span>Honest Judge Assessment</span>
                {judgeResult.isFallback ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Client Fallback
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Live AI Verification
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span
                  className={`text-sm px-3 py-1 rounded-xl font-bold border ${getQualityBadgeColor(
                    judgeResult.quality
                  )}`}
                >
                  {judgeResult.quality}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Score</span>
              <div className="text-4xl font-black text-emerald-400 leading-none mt-0.5">
                {judgeResult.score}
                <span className="text-base text-slate-500 font-normal">/100</span>
              </div>
            </div>
          </div>

          {/* 5-Point Rubric Scorecard */}
          {judgeResult.rubricBreakdown && (
            <div className="rounded-xl bg-navy-850/60 border border-navy-750 p-4">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Evaluation Rubric Breakdown
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="rounded-lg bg-navy-900/80 p-2.5 border border-navy-700/60">
                  <div className="text-[10px] uppercase text-slate-400">Correctness (30%)</div>
                  <div className="text-base font-bold text-slate-100 mt-1">
                    {judgeResult.rubricBreakdown.technicalCorrectness ?? 'N/A'}/30
                  </div>
                </div>

                <div className="rounded-lg bg-navy-900/80 p-2.5 border border-navy-700/60">
                  <div className="text-[10px] uppercase text-slate-400">Relevance (25%)</div>
                  <div className="text-base font-bold text-slate-100 mt-1">
                    {judgeResult.rubricBreakdown.relevance ?? 'N/A'}/25
                  </div>
                </div>

                <div className="rounded-lg bg-navy-900/80 p-2.5 border border-navy-700/60">
                  <div className="text-[10px] uppercase text-slate-400">Evidence (20%)</div>
                  <div className="text-base font-bold text-slate-100 mt-1">
                    {judgeResult.rubricBreakdown.evidence ?? 'N/A'}/20
                  </div>
                </div>

                <div className="rounded-lg bg-navy-900/80 p-2.5 border border-navy-700/60">
                  <div className="text-[10px] uppercase text-slate-400">Completeness (15%)</div>
                  <div className="text-base font-bold text-slate-100 mt-1">
                    {judgeResult.rubricBreakdown.completeness ?? 'N/A'}/15
                  </div>
                </div>

                <div className="rounded-lg bg-navy-900/80 p-2.5 border border-navy-700/60">
                  <div className="text-[10px] uppercase text-slate-400">Clarity (10%)</div>
                  <div className="text-base font-bold text-slate-100 mt-1">
                    {judgeResult.rubricBreakdown.clarity ?? 'N/A'}/10
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Technical Misconception Warning (if present) */}
          {judgeResult.misconceptions &&
            judgeResult.misconceptions !== 'None detected.' &&
            judgeResult.misconceptions !== 'None detected; answer lacked substantive content.' &&
            judgeResult.misconceptions !== 'None provided.' && (
              <div className="rounded-xl bg-rose-950/30 border border-rose-500/40 p-4">
                <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs uppercase tracking-wider mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Identified Technical Misconception / False Claim
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {judgeResult.misconceptions}
                </p>
              </div>
            )}

          {/* Feedback Section */}
          <div className="rounded-xl bg-navy-850 border border-navy-700 p-4 space-y-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Judge Feedback
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{judgeResult.feedback}</p>
            </div>

            {judgeResult.missingInfo && (
              <div className="pt-2 border-t border-navy-750 text-xs text-amber-300/90 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300">Missing Information:</span>{' '}
                  <span className="text-slate-300">{judgeResult.missingInfo}</span>
                </div>
              </div>
            )}

            {judgeResult.proTip && (
              <div className="pt-2 border-t border-navy-750 text-xs text-violet-300 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-violet-400">Actionable Improvement:</span>{' '}
                  <span className="text-slate-200">{judgeResult.proTip}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
