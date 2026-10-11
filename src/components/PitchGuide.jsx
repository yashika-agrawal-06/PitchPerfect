import React from 'react';
import { BookOpen, CheckCircle2, Rocket, MessageSquareText, Layers3 } from 'lucide-react';

const guideSections = [
  {
    title: 'Lead with a sharp problem',
    icon: Rocket,
    text: 'Judges usually decide within the first 20 seconds. State the pain, the affected user, and the measurable friction before discussing the solution.',
  },
  {
    title: 'Show a real moat',
    icon: Layers3,
    text: 'Your differentiator should not be a vague claim. Explain why existing tools fail, why your approach is faster, and why the solution is hard to copy.',
  },
  {
    title: 'Keep the demo credible',
    icon: CheckCircle2,
    text: 'Call out what works today versus what is still planned. Judges reward honesty and a realistic product roadmap over inflated promises.',
  },
  {
    title: 'Practice objections',
    icon: MessageSquareText,
    text: 'Prepare for questions around scalability, failure modes, user validation, and trust. Crisp, evidence-based answers outperform long storytelling.',
  },
];

export default function PitchGuide() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-violet-950/30 via-navy-900 to-navy-900 border border-violet-500/20 p-6 sm:p-8">
        <div className="flex items-center gap-3 text-violet-400 mb-2">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-bold tracking-wider uppercase">Hackathon Pitch Playbook</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">The pitch story judges remember.</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {guideSections.map(({ title, icon: Icon, text }) => (
          <div key={title} className="rounded-2xl bg-navy-900 border border-navy-800 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{text}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-navy-900 border border-navy-800 p-6">
        <h3 className="text-base font-bold text-white mb-4">Demo-day checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <ul className="space-y-2">
            <li>• State the user pain in one sentence.</li>
            <li>• Explain the specific workflow or decision your product improves.</li>
            <li>• Show a small but real proof-of-work rather than a static mockup.</li>
          </ul>
          <ul className="space-y-2">
            <li>• Prepare one backup story if the demo fails.</li>
            <li>• Rehearse a crisp 60-second pitch and a 2-minute expanded version.</li>
            <li>• End with a sentence that clarifies why you are building this now.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
