import React, { useMemo, useState, useEffect } from 'react';
import { TOPICS } from './data/topics';
import { DifficultyLevel, TopicDefinition, ParameterConfig } from './types/mechanics';
import { solveTopicMechanics } from './solvers';
import { REAL_WORLD_SYSTEMS } from './data/realWorldSystems';

// Core Views
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { MechanicsWorkspace } from './components/MechanicsWorkspace';

// Interactive Modals
import { WhatIfModal } from './components/WhatIfModal';
import { FBDStudioModal } from './components/FBDStudioModal';
import { TextbookPresetsModal } from './components/TextbookPresetsModal';
import { LabReportModal } from './components/LabReportModal';
import { AITutorModal } from './components/AITutorModal';
import { GuidedExperimentModal } from './components/GuidedExperimentModal';
import { ExamModeModal } from './components/ExamModeModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ExplainWhyModal } from './components/ExplainWhyModal';

export default function MechanicsLab() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('evlab_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('evlab_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('evlab_theme', 'light');
    }
  }, [isDark]);

  // Primary View State ('home' or 'workspace')
  const [activeView, setActiveView] = useState<'home' | 'workspace'>('home');

  // Topic & Parameters State
  const [currentTopicId, setCurrentTopicId] = useState<string>('beams');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate');

  const currentTopic = useMemo<TopicDefinition>(() => {
    return TOPICS.find((t) => t.id === currentTopicId) || TOPICS[0];
  }, [currentTopicId]);

  // Initial parameters
  const initialParams = useMemo(() => {
    const p: Record<string, number> = {};
    currentTopic.parameterConfigs.forEach((cfg) => {
      p[cfg.id] = cfg.defaultValue;
    });
    return p;
  }, [currentTopic]);

  const [parameters, setParameters] = useState<Record<string, number>>(initialParams);

  // Update parameters when topic switches
  useEffect(() => {
    const p: Record<string, number> = {};
    currentTopic.parameterConfigs.forEach((cfg) => {
      p[cfg.id] = cfg.defaultValue;
    });
    setParameters(p);
  }, [currentTopicId]);

  // Modals state
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [isFBDStudioOpen, setIsFBDStudioOpen] = useState<boolean>(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isAITutorOpen, setIsAITutorOpen] = useState<boolean>(false);
  const [isExperimentOpen, setIsExperimentOpen] = useState<boolean>(false);
  const [activeExpId, setActiveExpId] = useState<string>('exp-force-acceleration');
  const [isExamOpen, setIsExamOpen] = useState<boolean>(false);
  const [activeExamId, setActiveExamId] = useState<string>('exam-01-beam-reaction');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isExplainWhyOpen, setIsExplainWhyOpen] = useState<boolean>(false);
  const [activeExplainParam, setActiveExplainParam] = useState<ParameterConfig | null>(null);

  // Solver execution
  const solverResult = useMemo(() => {
    return solveTopicMechanics(currentTopic.id, parameters);
  }, [currentTopic.id, parameters]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsWhatIfOpen(false);
        setIsFBDStudioOpen(false);
        setIsPresetsOpen(false);
        setIsReportOpen(false);
        setIsAITutorOpen(false);
        setIsExperimentOpen(false);
        setIsExamOpen(false);
        setIsShortcutsOpen(false);
        setIsExplainWhyOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update single parameter
  const handleUpdateParameter = (id: string, value: number) => {
    setParameters((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Reset parameters
  const handleResetParams = () => {
    const p: Record<string, number> = {};
    currentTopic.parameterConfigs.forEach((cfg) => {
      p[cfg.id] = cfg.defaultValue;
    });
    setParameters(p);
  };

  // Apply textbook preset or custom parameters
  const handleApplyPreset = (presetParams: Record<string, number>) => {
    setParameters((prev) => ({
      ...prev,
      ...presetParams,
    }));
  };

  // Launch Guided Experiment
  const handleOpenExperimentWithId = (expId: string) => {
    setActiveExpId(expId);
    setIsExperimentOpen(true);
  };

  const handleApplyExperimentParams = (topicId: string, expParams: Record<string, number>) => {
    setCurrentTopicId(topicId);
    setParameters((prev) => ({
      ...prev,
      ...expParams,
    }));
    setActiveView('workspace');
  };

  // Launch Exam Mode Challenge
  const handleOpenExamWithId = (examId: string) => {
    setActiveExamId(examId);
    setIsExamOpen(true);
  };

  // Launch Real-World System Case Study
  const handleOpenRealWorldSystem = (sysId: string) => {
    const sys = REAL_WORLD_SYSTEMS.find((s) => s.id === sysId);
    if (sys) {
      setCurrentTopicId(sys.topicId);
      setParameters(sys.defaultParams);
      setActiveView('workspace');
    }
  };

  const handleOpenExplainWhy = (param?: ParameterConfig) => {
    setActiveExplainParam(param || null);
    setIsExplainWhyOpen(true);
  };

  return (
    <div
      id="evlab-app-root"
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. Header Navigation */}
      <Navbar
        activeView={activeView}
        onNavigateView={setActiveView}
        currentTopic={currentTopic}
        onSelectTopic={setCurrentTopicId}
        allTopics={TOPICS}
        difficulty={difficulty}
        onChangeDifficulty={setDifficulty}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onOpenWhatIf={() => setIsWhatIfOpen(true)}
        onOpenFBDStudio={() => setIsFBDStudioOpen(true)}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenAITutor={() => setIsAITutorOpen(true)}
        onOpenExperiment={() => setIsExperimentOpen(true)}
        onOpenExam={() => setIsExamOpen(true)}
        onResetParams={handleResetParams}
      />

      {/* 2. Main View Switcher (Home Landing vs Mechanics CAD Workspace) */}
      {activeView === 'home' ? (
        <HomeScreen
          onSelectTopic={setCurrentTopicId}
          onOpenWorkspace={() => setActiveView('workspace')}
          onOpenExperiment={handleOpenExperimentWithId}
          onOpenExam={handleOpenExamWithId}
          onOpenPresets={() => setIsPresetsOpen(true)}
          onOpenRealWorld={handleOpenRealWorldSystem}
          allTopics={TOPICS}
          isDark={isDark}
        />
      ) : (
        <MechanicsWorkspace
          topic={currentTopic}
          onSelectTopic={setCurrentTopicId}
          allTopics={TOPICS}
          parameters={parameters}
          onUpdateParameter={handleUpdateParameter}
          onResetParams={handleResetParams}
          onBackToHome={() => setActiveView('home')}
          onOpenWhatIf={() => setIsWhatIfOpen(true)}
          onOpenFBDStudio={() => setIsFBDStudioOpen(true)}
          onOpenPresets={() => setIsPresetsOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
          onOpenAITutor={() => setIsAITutorOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenExplainWhy={handleOpenExplainWhy}
          isDark={isDark}
        />
      )}

      {/* 3. Interactive Modals */}
      <GuidedExperimentModal
        isOpen={isExperimentOpen}
        onClose={() => setIsExperimentOpen(false)}
        initialExpId={activeExpId}
        onApplyExperimentParams={handleApplyExperimentParams}
        isDark={isDark}
      />

      <ExamModeModal
        isOpen={isExamOpen}
        onClose={() => setIsExamOpen(false)}
        initialChallengeId={activeExamId}
        isDark={isDark}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        isDark={isDark}
      />

      <ExplainWhyModal
        isOpen={isExplainWhyOpen}
        onClose={() => setIsExplainWhyOpen(false)}
        topic={currentTopic}
        activeParam={activeExplainParam}
        skillLevel="Engineering"
        isDark={isDark}
      />

      <WhatIfModal
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        topic={currentTopic}
        baseParams={parameters}
        isDark={isDark}
      />

      <FBDStudioModal
        isOpen={isFBDStudioOpen}
        onClose={() => setIsFBDStudioOpen(false)}
        isDark={isDark}
      />

      <TextbookPresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        topic={currentTopic}
        onApplyPreset={handleApplyPreset}
        isDark={isDark}
      />

      <LabReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        topic={currentTopic}
        parameters={parameters}
        computedData={solverResult.computedData}
        steps={solverResult.steps}
        validations={solverResult.validations}
        interpretation={solverResult.interpretation}
        isDark={isDark}
      />

      <AITutorModal
        isOpen={isAITutorOpen}
        onClose={() => setIsAITutorOpen(false)}
        topic={currentTopic}
        parameters={parameters}
        computedData={solverResult.computedData}
        isDark={isDark}
      />
    </div>
  );
}
