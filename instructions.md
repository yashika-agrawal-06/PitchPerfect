tchPerfect: Hackathon Pitch-Coaching Platform

PitchPerfect is a hackathon-focused coaching platform built with React 18 and Vite. It provides automated pitch structuring, idea refinement and gap analysis, and an interactive judge Q&A simulator.

1. Project Directory Structure

pitchperfect/
â”œâ”€â”€ index.html
â”œâ”€â”€ package.json
â”œâ”€â”€ vite.config.js
â”œâ”€â”€ tailwind.config.js
â”œâ”€â”€ postcss.config.js
â”œâ”€â”€ README.md
â””â”€â”€ src/
    â”œâ”€â”€ main.jsx
    â”œâ”€â”€ App.jsx
    â”œâ”€â”€ index.css
    â”œâ”€â”€ data/
    â”‚   â””â”€â”€ sampleProject.js
    â”œâ”€â”€ services/
    â”‚   â””â”€â”€ coachingEngine.js
    â””â”€â”€ components/
        â”œâ”€â”€ Sidebar.jsx
        â”œâ”€â”€ Header.jsx
        â”œâ”€â”€ Dashboard.jsx
        â”œâ”€â”€ PitchBuilder.jsx
        â”œâ”€â”€ IdeaImprover.jsx
        â”œâ”€â”€ JudgePractice.jsx
        â”œâ”€â”€ SavedPitches.jsx
        â””â”€â”€ PitchGuide.jsx


2. Configuration & Build Files

package.json

{
  "name": "pitchperfect",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.6"
  }
}


vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
});


tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060913',
          900: '#0B0F19',
          850: '#101626',
          800: '#161F36',
          700: '#1E2B4C',
          600: '#2A3C66',
        },
        violet: {
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};


postcss.config.js

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};


index.html

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238B5CF6'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PitchPerfect â€” Hackathon Pitch Coach</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body class="bg-navy-950 text-slate-100 font-sans antialiased selection:bg-violet-600 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>


src/index.css

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: #060913;
    color: #e2e8f0;
  }
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0b0f19;
}

::-webkit-scrollbar-thumb {
  background: #1e2b4c;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #2a3c66;
}


3. Data & Local Coaching Service

src/data/sampleProject.js

export const sampleProject = {
  title: "PulseGuard: Smart Campus Triage & SOS",
  problem: "During medical or safety incidents on university campuses, emergency response times average 14 minutes due to inaccurate indoor location reporting and manual dispatcher routing.",
  targetUsers: "Campus security teams, on-site student paramedics, and 25,000+ enrolled students navigating large multi-building campuses.",
  hackathonTheme: "AI for Social Good & Smart Campus Infrastructure",
  technologies: "React, Web Bluetooth API, FastAPI, PostGIS geospatial indexing, and WebSockets for low-latency dispatching.",
};


src/services/coachingEngine.js

/**
 * PitchPerfect Local Coaching Engine (Demo Implementation)
 *
 * Note: This module implements deterministic heuristic analysis for local, zero-credential
 * client-side operation. To connect a live AI backend, update `API_CONFIG` and swap the
 * mock generator calls with standard fetch requests.
 */

const API_CONFIG = {
  useLiveBackend: false,
  endpointUrl: "https://api.yourdomain.com/v1/pitch-coach", // Target for AWS Lambda/API Gateway
};

// Simulate asynchronous processing time for UX realism
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const coachingEngine = {
  isDemoEngine: true,

  /**
   * Generates a 5-part hackathon pitch deck structure
   */
  async generatePitch(project) {
    await delay(1200);

    const { title, problem, targetUsers, hackathonTheme, technologies } = project;

    const formattedProblem = problem.trim().endsWith('.') ? problem.trim() : `${problem.trim()}.`;
    const formattedUsers = targetUsers.toLowerCase().includes('user') ? targetUsers : `${targetUsers} facing this bottleneck daily`;

    return {
      id: `pitch_${Date.now()}`,
      createdAt: new Date().toISOString(),
      metadata: { ...project },
      sections: {
        problem: {
          title: "1. The Pain Point & Market Friction",
          content: `${formattedProblem} This disproportionately affects ${formattedUsers}, leading to wasted time, operational risks, and measurable inefficiency during critical moments.`,
          coachTip: "Judges judge problem clarity within 15 seconds. Keep quantitative impact front and center.",
        },
        solution: {
          title: "2. The Proposed Innovation",
          content: `${title || "Our product"} provides an automated, end-to-end workflow designed specifically for ${hackathonTheme || "this challenge"}. Instead of manual overhead, it offers instant triage and context-aware resolution.`,
          coachTip: "Show why your approach is 10x faster or cheaper, not merely 10% incremental.",
        },
        differentiator: {
          title: "3. Competitive Moat & Unfair Advantage",
          content: `While existing alternatives rely on static dashboards or manual dispatch, our solution uses intelligent real-time routing tailored to ${targetUsers}. We turn complex telemetry into one-click actionable interventions with zero setup friction.`,
          coachTip: "Hackathons are won on differentiation: explicitly state what incumbents fail to do.",
        },
        technicalApproach: {
          title: "4. Architecture & Technical Viability",
          content: `Built on a lightweight, modular foundation using ${technologies || "modern web standards"}. The architecture isolates real-time data flows from persistence layers to ensure high availability, sub-second latency, and horizontal scalability during peak loads.`,
          coachTip: "Highlight hackathon constraints: mention what is working right now in the demo vs roadmap.",
        },
        sixtySecondPitch: {
          title: "5. The 60-Second Verbal Script",
          content: `"Judges, ${problem.slice(0, 110)}... That is why we built ${title || "our system"}. By leveraging ${technologies.split(',')[0] || "modern cloud tech"}, we give ${targetUsers} the ability to cut response latency and resolve incidents in real time. We built a fully working prototype during this hackathon, and here is how it works live today."`,
          coachTip: "Pacing is everything. Rehearse this in 45-50 seconds so you have 10 seconds of cushion for judge reactions.",
        },
      },
    };
  },

  /**
   * Analyzes project inputs for completeness and hackathon viability
   */
  async improveIdea(project) {
    await delay(900);

    const critiques = [];
    const strengths = [];
    let score = 70;

    // Validation checks
    if (!project.problem || project.problem.length < 40) {
      critiques.push({
        category: "Problem Definition",
        severity: "high",
        message: "Your problem statement lacks concrete metrics or clear cost of inaction. Add numbers or frequency (e.g., 'costs 4 hours/week' or 'causes 14-min delays').",
      });
      score -= 15;
    } else {
      strengths.push("Problem clearly states friction and impacted population.");
      score += 8;
    }

    if (!project.targetUsers || project.targetUsers.length < 15) {
      critiques.push({
        category: "Audience Specificity",
        severity: "medium",
        message: "Target users seem overly broad. Narrow down your beachhead persona (e.g., instead of 'students', specify 'first-year commuter students').",
      });
      score -= 10;
    } else {
      strengths.push("Good initial user segmentation defined.");
      score += 7;
    }

    if (!project.technologies || project.technologies.split(',').length < 2) {
      critiques.push({
        category: "Tech Stack Detail",
        severity: "medium",
        message: "List at least two concrete frameworks or APIs so judges can evaluate architectural feasibility.",
      });
      score -= 10;
    } else {
      strengths.push("Solid technology selection with clear engineering focus.");
      score += 10;
    }

    // Suggestions for hackathon judges
    const suggestions = [
      "Prepare a 10-second failure contingency: What happens if your main API limits out during live demo?",
      "Add a 'Why Now?' hook: Why was this solution unfeasible 2 years ago (e.g., recent API releases, models, or sensor hardware)?",
      "Draft a 1-year viability slide: Judges want to know if you will continue building post-hackathon.",
    ];

    return {
      score: Math.min(Math.max(score, 35), 98),
      strengths,
      critiques,
      suggestions,
    };
  },

  /**
   * Generates dynamic judge questions based on tech and domain
   */
  getInitialJudgeQuestions(project) {
    const tech = project.technologies || "your stack";
    return [
      {
        id: "q1",
        question: `How does your solution handle scalability or network failure when relying on ${tech.split(',')[0] || "external APIs"}?`,
        aspect: "Technical Feasibility",
        difficulty: "Hard",
      },
      {
        id: "q2",
        question: `Why couldn't a well-funded incumbent solve this tomorrow with a simple feature update? What is your defensive moat?`,
        aspect: "Business Viability & Moat",
        difficulty: "Challenging",
      },
      {
        id: "q3",
        question: `What was the single hardest engineering roadblock your team overcame during the last 24 hours of building this?`,
        aspect: "Hackathon Execution",
        difficulty: "Medium",
      },
      {
        id: "q4",
        question: `How did you validate that ${project.targetUsers || "your users"} genuinely care about this solution over their current workaround?`,
        aspect: "User Validation",
        difficulty: "Hard",
      },
    ];
  },

  /**
   * Evaluates the user's verbal/written answer to a judge question
   */
  async evaluateJudgeAnswer(question, answer) {
    await delay(1100);

    const length = answer.trim().split(/\s+/).length;
    let quality = "Average";
    let score = 65;
    let feedback = "";
    let proTip = "";

    if (length < 15) {
      quality = "Too Brief";
      score = 45;
      feedback = "Your answer is too short. Judges may assume you have not built that portion or haven't thought through edge cases.";
      proTip = "Use the STAR framework (Situation, Task, Action, Result) to add depth without rambling.";
    } else if (length >= 15 && length < 50) {
      quality = "Good & Direct";
      score = 80;
      feedback = "Solid, concise response that directly targets the question without unnecessary fluff.";
      proTip = "Ground it even further by citing an exact metric, library, or edge test you ran during the hackathon.";
    } else {
      quality = "Comprehensive";
      score = 92;
      feedback = "Extremely thorough explanation covering trade-offs, architecture decisions, and realistic outcomes.";
      proTip = "Watch your delivery time in live judging: ensure you leave time for judge follow-ups.";
    }

    return {
      quality,
      score,
      feedback,
      proTip,
    };
  },
};


4. Components

src/components/Sidebar.jsx

import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  HelpCircle,
  BookOpen,
  Layers,
  FolderGit2,
  X
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
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-navy-900 border-r border-navy-800 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">Pitch<span className="text-violet-400">Perfect</span></span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">Hackathon Coach</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
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
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150
                  ${isActive
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-navy-850'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-navy-800 text-violet-300 border border-violet-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Local Engine Notice */}
        <div className="p-4 border-t border-navy-800">
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-700/60 text-xs">
            <div className="flex items-center gap-2 text-violet-400 font-semibold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Local Demo Engine
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Running client-side heuristics. Ready for AWS Lambda / FastAPI integration.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}


src/components/Header.jsx

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
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-850"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-white tracking-tight">
            {titles[currentView] || 'PitchPerfect'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onQuickBuild}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-medium transition shadow-sm shadow-violet-600/30"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">New Pitch</span>
        </button>
      </div>
    </header>
  );
}


src/components/Dashboard.jsx

import React from 'react';
import {
  Sparkles,
  Lightbulb,
  ShieldCheck,
  ArrowRight,
  Clock,
  FileText,
  Target,
  Zap,
  ExternalLink
} from 'lucide-react';

export default function Dashboard({ onNavigate, project, onSetProject, sampleProject, savedPitches }) {
  const handleLoadSample = () => {
    onSetProject(sampleProject);
    onNavigate('builder');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
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
            <button
              onClick={() => onNavigate('builder')}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm transition shadow-lg shadow-violet-600/30 flex items-center gap-2"
            >
              <span>Build My Pitch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleLoadSample}
              className="px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 font-medium text-sm transition flex items-center gap-2"
            >
              <span>Load Sample Project</span>
              <Sparkles className="w-4 h-4 text-violet-400" />
            </button>
          </div>
        </div>

        {/* Background decorative glow */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 3 Main Action Cards */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Core Coaching Workflows</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Action 1 */}
          <div
            onClick={() => onNavigate('builder')}
            className="group cursor-pointer rounded-2xl bg-navy-900 border border-navy-800 hover:border-violet-500/50 p-6 transition-all duration-200 hover:shadow-xl hover:shadow-violet-600/10 flex flex-col justify-between"
          >
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

          {/* Action 2 */}
          <div
            onClick={() => onNavigate('improver')}
            className="group cursor-pointer rounded-2xl bg-navy-900 border border-navy-800 hover:border-violet-500/50 p-6 transition-all duration-200 hover:shadow-xl hover:shadow-violet-600/10 flex flex-col justify-between"
          >
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

          {/* Action 3 */}
          <div
            onClick={() => onNavigate('judge')}
            className="group cursor-pointer rounded-2xl bg-navy-900 border border-navy-800 hover:border-violet-500/50 p-6 transition-all duration-200 hover:shadow-xl hover:shadow-violet-600/10 flex flex-col justify-between"
          >
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

      {/* Snapshot / Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Current Project Card */}
        <div className="lg:col-span-2 rounded-2xl bg-navy-900 border border-navy-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-400" />
              Active Project Scope
            </h3>
            {project.title && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-violet-600/20 text-violet-300 border border-violet-500/30">
                In Memory
              </span>
            )}
          </div>

          {project.title ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-navy-850 border border-navy-800">
                <h4 className="font-semibold text-slate-100 text-base">{project.title}</h4>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 line-clamp-2">{project.problem}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                <span className="px-3 py-1 rounded-md bg-navy-850 border border-navy-800">Theme: {project.hackathonTheme || 'General'}</span>
                <span className="px-3 py-1 rounded-md bg-navy-850 border border-navy-800">Stack: {project.technologies || 'None listed'}</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-navy-800 rounded-xl">
              <p className="text-sm text-slate-400 mb-3">No active project entered yet.</p>
              <button
                onClick={handleLoadSample}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4"
              >
                Load PulseGuard Sample Project
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="rounded-2xl bg-navy-900 border border-navy-800 p-6 flex flex-col justify-between">
          <h3 className="text-base font-bold text-white mb-4">Pitch Vault Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-850 border border-navy-800">
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400" />
                Saved Pitches
              </span>
              <span className="text-base font-bold text-white">{savedPitches.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-navy-850 border border-navy-800">
              <span className="text-xs text-slate-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Coaching Engine
              </span>
              <span className="text-xs font-semibold text-emerald-400">Local Ready</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('guide')}
            className="mt-6 w-full py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-xs font-semibold text-slate-300 transition flex items-center justify-center gap-2"
          >
            Read Pitching Handbook <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}


src/components/PitchBuilder.jsx

import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Save,
  AlertCircle,
  RotateCcw,
  Loader2,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { coachingEngine } from '../services/coachingEngine';

export default function PitchBuilder({ project, setProject, sampleProject, onSavePitch, onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [generatedPitch, setGeneratedPitch] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleInputChange = (field, value) => {
    setProject((prev) => ({ ...prev, [field]: value }));
    if (validationError) setValidationError('');
  };

  const handleUseSample = () => {
    setProject(sampleProject);
    setValidationError('');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!project.title?.trim() || !project.problem?.trim()) {
      setValidationError('Please provide at least a Project Title and Problem Statement.');
      return;
    }

    setLoading(true);
    setValidationError('');
    try {
      const pitch = await coachingEngine.generatePitch(project);
      setGeneratedPitch(pitch);
      setSavedSuccess(false);
    } catch (err) {
      setValidationError('Error generating pitch: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdateSection = (sectionKey, newContent) => {
    if (!generatedPitch) return;
    setGeneratedPitch({
      ...generatedPitch,
      sections: {
        ...generatedPitch.sections,
        [sectionKey]: {
          ...generatedPitch.sections[sectionKey],
          content: newContent,
        },
      },
    });
  };

  const handleSaveToVault = () => {
    if (!generatedPitch) return;
    onSavePitch(generatedPitch);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Engine Status Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs">
        <div className="flex items-center gap-2 text-violet-300">
          <Info className="w-4 h-4 text-violet-400 shrink-0" />
          <span>
            <strong>Local Demo Coaching Engine:</strong> Formats structured pitches without requiring third-party credentials.
          </span>
        </div>
        <button
          onClick={handleUseSample}
          className="text-xs px-2.5 py-1 bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-400/30 rounded-lg transition"
        >
          Auto-fill Sample
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Project Idea Input Form */}
        <div className="lg:col-span-5 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Project Blueprint
            </h2>
            <button
              type="button"
              onClick={() => setProject({ title: '', problem: '', targetUsers: '', hackathonTheme: '', technologies: '' })}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>

          {validationError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Project Name / Working Title *
              </label>
              <input
                type="text"
                placeholder="e.g., PulseGuard"
                value={project.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Core Problem Statement *
              </label>
              <textarea
                rows={3}
                placeholder="What critical friction or delay occurs right now? Include quantifiable impact if possible."
                value={project.problem || ''}
                onChange={(e) => handleInputChange('problem', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Users & Stakeholders
              </label>
              <input
                type="text"
                placeholder="e.g., Campus emergency responders, 25k students"
                value={project.targetUsers || ''}
                onChange={(e) => handleInputChange('targetUsers', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hackathon Track / Theme
              </label>
              <input
                type="text"
                placeholder="e.g., AI for Social Good, Smart Campus"
                value={project.hackathonTheme || ''}
                onChange={(e) => handleInputChange('hackathonTheme', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Technologies & APIs Used
              </label>
              <input
                type="text"
                placeholder="e.g., React, Web Bluetooth, FastAPI, PostGIS"
                value={project.technologies || ''}
                onChange={(e) => handleInputChange('technologies', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition"
              />
            </div>

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

        {/* Right Column: Pitch Workspace */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              Pitch Workspace
            </h2>

            {generatedPitch && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToVault}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 text-xs font-medium transition"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-slate-400" />
                      <span>Save to Vault</span>
                    </>
                  )}
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
                Fill out the project blueprint on the left or load the pre-configured sample to generate your structured pitch.
              </p>
              <button
                onClick={handleUseSample}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-violet-300 border border-violet-500/20 text-xs font-medium transition"
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
                <p className="text-xs text-slate-400">Structuring problem clarity, technical moat, and 60-second delivery script...</p>
              </div>
            </div>
          )}

          {generatedPitch && !loading && (
            <div className="space-y-4">
              {Object.entries(generatedPitch.sections).map(([key, section]) => (
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
                      {key === 'sixtySecondPitch' && <Sparkles className="w-3.5 h-3.5 text-violet-400" />}
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
                    value={section.content}
                    onChange={(e) => handleUpdateSection(key, e.target.value)}
                    className="w-full bg-navy-850/60 rounded-xl p-3 text-slate-200 text-xs sm:text-sm border border-navy-750 focus:outline-none focus:border-violet-500 leading-relaxed resize-none transition"
                  />

                  {section.coachTip && (
                    <div className="mt-2.5 flex items-start gap-2 text-[11px] text-violet-300/80 bg-violet-900/10 px-3 py-1.5 rounded-lg border border-violet-500/10">
                      <span className="font-semibold text-violet-400 uppercase tracking-wider text-[10px] shrink-0">Coach Tip:</span>
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


src/components/IdeaImprover.jsx

import React, { useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  ShieldAlert,
  Award,
  Sparkles
} from 'lucide-react';
import { coachingEngine } from '../services/coachingEngine';

export default function IdeaImprover({ project, setProject, sampleProject, onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await coachingEngine.improveIdea(project);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Overview Header */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/30 via-navy-900 to-navy-900 border border-amber-500/20 p-6 sm:p-8">
        <div className="flex items-center gap-3 text-amber-400 mb-2">
          <Lightbulb className="w-5 h-5" />
          <span className="text-xs font-bold tracking-wider uppercase">Hackathon Viability Audit</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Detect Blindspots Before the Judges Do.
        </h2>
        <p className="mt-2 text-slate-300 text-sm max-w-2xl leading-relaxed">
          Most hackathon ideas fail not from weak code, but from unclear user personas, lack of competitive moats, or vague impact metrics.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-sm transition shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-navy-950" />
                <span>Auditing Idea Architecture...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-navy-950" />
                <span>Run Gap Analysis</span>
              </>
            )}
          </button>
          {!project.title && (
            <button
              onClick={() => setProject(sampleProject)}
              className="px-4 py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 border border-navy-700 text-xs font-medium transition"
            >
              Fill Sample Project
            </button>
          )}
        </div>
      </div>

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-6">
          {/* Score Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-navy-900 border border-navy-800 p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">Pitch Readiness Score</span>
                <div className="text-3xl font-extrabold text-white mt-1">{analysis.score}<span className="text-sm text-slate-500">/100</span></div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                analysis.score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text
