import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { sampleProject } from './data/sampleProject';
import { coachingEngine } from './services/coachingEngine';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import PitchBuilder from './components/PitchBuilder';
import IdeaImprover from './components/IdeaImprover';
import JudgePractice from './components/JudgePractice';
import SavedPitches from './components/SavedPitches';
import PitchGuide from './components/PitchGuide';

const STORAGE_KEY = 'pitchperfect-saved-pitches';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [project, setProject] = useState(sampleProject);
  const [generatedPitch, setGeneratedPitch] = useState(null);

  const [savedPitches, setSavedPitches] = useState([]);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [storageError, setStorageError] = useState(null);

  const [judgeQuestions, setJudgeQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState(null);
  const [judgeIndex, setJudgeIndex] = useState(0);
  const [judgeResult, setJudgeResult] = useState(null);

  // Track the last project key used to fetch questions to prevent duplicate/storm requests
  const loadedProjectKeyRef = useRef('');
  const lastSaveTimeRef = useRef(0);

  // Load saved pitches safely on mount before any write operations
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Keep only objects that have at least an id or title
          const valid = parsed.filter(
            (p) => p && typeof p === 'object' && (p.id || p.title)
          );
          setSavedPitches(valid);
        }
      }
    } catch (error) {
      console.error('Unable to load saved pitches from localStorage:', error);
      setStorageError('Failed to load existing saved pitches from browser storage.');
    } finally {
      setStorageLoaded(true);
    }
  }, []);

  // Persist changes only after the initial load is verified
  useEffect(() => {
    if (!storageLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPitches));
      setStorageError(null);
    } catch (error) {
      console.error('Unable to save pitches to localStorage:', error);
      setStorageError(
        'Browser storage quota exceeded. New pitches may not persist after refresh.'
      );
    }
  }, [savedPitches, storageLoaded]);

  // Project signature to detect meaningful project updates
  const projectSignature = useMemo(() => {
    return `${project.title || ''}|${project.problem || ''}|${project.technologies || ''}|${project.targetUsers || ''}`;
  }, [project.title, project.problem, project.technologies, project.targetUsers]);

  // Load judge questions specifically for the current project
  const loadQuestions = useCallback(
    async (force = false) => {
      if (!force && loadedProjectKeyRef.current === projectSignature && judgeQuestions.length > 0) {
        return;
      }

      setQuestionsLoading(true);
      setQuestionsError(null);
      setJudgeIndex(0);
      setJudgeResult(null);

      try {
        const questions = await coachingEngine.getInitialJudgeQuestions(project);
        const validList = Array.isArray(questions) ? questions : [];

        if (validList.length === 0) {
          throw new Error('No judge questions could be generated.');
        }

        setJudgeQuestions(validList);
        loadedProjectKeyRef.current = projectSignature;
      } catch (error) {
        console.error('Unable to load judge questions:', error);
        setQuestionsError(error.message || 'Failed to load judge questions.');
      } finally {
        setQuestionsLoading(false);
      }
    },
    [project, projectSignature, judgeQuestions.length]
  );

  // Automatically fetch questions when navigating to judge practice if not loaded
  useEffect(() => {
    if (currentView === 'judge') {
      if (loadedProjectKeyRef.current !== projectSignature || judgeQuestions.length === 0) {
        loadQuestions();
      }
    }
  }, [currentView, projectSignature, judgeQuestions.length, loadQuestions]);

  const currentQuestion = useMemo(
    () => judgeQuestions[judgeIndex] || null,
    [judgeIndex, judgeQuestions]
  );

  const handleNavigate = (view) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  const handleQuickBuild = () => {
    setProject({ ...sampleProject });
    setGeneratedPitch(null);
    setCurrentView('builder');
  };

  const handleGeneratePitch = async () => {
    try {
      const pitch = await coachingEngine.generatePitch(project);
      setGeneratedPitch(pitch);
      setCurrentView('builder');
      return pitch;
    } catch (error) {
      console.error('Unable to generate pitch:', error);
      throw error;
    }
  };

  const handleSavePitch = () => {
    if (!generatedPitch) return;

    // Prevent duplicate rapid clicks (< 1.5 seconds)
    const now = Date.now();
    if (now - lastSaveTimeRef.current < 1500) {
      return;
    }
    lastSaveTimeRef.current = now;

    const pitchTitle =
      project.title ||
      generatedPitch.metadata?.title ||
      'Untitled pitch';

    const stableId =
      generatedPitch.id ||
      `pitch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const saved = {
      ...generatedPitch,
      id: stableId,
      savedAt: new Date().toISOString(),
      title: pitchTitle,
      metadata: {
        title: project.title || '',
        problem: project.problem || '',
        targetUsers: project.targetUsers || '',
        hackathonTheme: project.hackathonTheme || '',
        technologies: project.technologies || '',
        ...(generatedPitch.metadata || {}),
      },
    };

    setSavedPitches((current) => {
      // Check if item with same ID exists; replace or prepend
      const existingIndex = current.findIndex((p) => p.id === stableId);
      if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = saved;
        return next;
      }
      return [saved, ...current];
    });

    setCurrentView('pitches');
  };

  const handleDeletePitch = (id) => {
    setSavedPitches((current) => current.filter((p) => p.id !== id));
  };

  const handleRestorePitch = (pitch) => {
    if (!pitch) return;
    setGeneratedPitch(pitch);
    // Restore exact saved project metadata without corrupting custom fields
    setProject({
      title: pitch.metadata?.title || pitch.title || '',
      problem: pitch.metadata?.problem || '',
      targetUsers: pitch.metadata?.targetUsers || '',
      hackathonTheme: pitch.metadata?.hackathonTheme || '',
      technologies: pitch.metadata?.technologies || '',
    });
    setCurrentView('builder');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'builder':
        return (
          <PitchBuilder
            project={project}
            setProject={setProject}
            sampleProject={sampleProject}
            generatedPitch={generatedPitch}
            setGeneratedPitch={setGeneratedPitch}
            onGeneratePitch={handleGeneratePitch}
            onSavePitch={handleSavePitch}
            onNavigate={handleNavigate}
            storageError={storageError}
          />
        );

      case 'improver':
        return (
          <IdeaImprover
            project={project}
            setProject={setProject}
            sampleProject={sampleProject}
            onNavigate={handleNavigate}
          />
        );

      case 'judge':
        return (
          <JudgePractice
            project={project}
            questions={judgeQuestions}
            currentQuestion={currentQuestion}
            questionIndex={judgeIndex}
            setQuestionIndex={setJudgeIndex}
            judgeResult={judgeResult}
            setJudgeResult={setJudgeResult}
            isLoading={questionsLoading}
            error={questionsError}
            onReloadQuestions={() => loadQuestions(true)}
          />
        );

      case 'pitches':
        return (
          <SavedPitches
            savedPitches={savedPitches}
            onRestore={handleRestorePitch}
            onDelete={handleDeletePitch}
            onNavigate={handleNavigate}
            storageError={storageError}
          />
        );

      case 'guide':
        return <PitchGuide />;

      case 'dashboard':
      default:
        return (
          <Dashboard
            onNavigate={handleNavigate}
            project={project}
            onSetProject={setProject}
            sampleProject={sampleProject}
            savedPitches={savedPitches}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100">
      <Sidebar
        currentView={currentView}
        setCurrentView={handleNavigate}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        pitchCount={savedPitches.length}
      />

      <div className="lg:pl-64">
        <Header
          onMenuClick={() => setIsSidebarOpen((open) => !open)}
          onQuickBuild={handleQuickBuild}
          currentView={currentView}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}