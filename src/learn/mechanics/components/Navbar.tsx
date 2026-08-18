import React from 'react';
import {
  Activity,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  Compass,
  Cpu,
  FileText,
  FlaskConical,
  HelpCircle,
  Home,
  Keyboard,
  Layers,
  Maximize2,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  Trophy,
  Zap,
} from 'lucide-react';
import { DifficultyLevel, TopicDefinition } from '../types/mechanics';

interface NavbarProps {
  activeView: 'home' | 'workspace';
  onNavigateView: (view: 'home' | 'workspace') => void;
  currentTopic: TopicDefinition;
  onSelectTopic: (topicId: string) => void;
  allTopics: TopicDefinition[];
  difficulty: DifficultyLevel;
  onChangeDifficulty: (diff: DifficultyLevel) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenWhatIf: () => void;
  onOpenFBDStudio: () => void;
  onOpenPresets: () => void;
  onOpenReport: () => void;
  onOpenAITutor: () => void;
  onOpenExperiment: () => void;
  onOpenExam: () => void;
  onResetParams: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigateView,
  currentTopic,
  onSelectTopic,
  allTopics,
  difficulty,
  onChangeDifficulty,
  isDark,
  onToggleTheme,
  onOpenWhatIf,
  onOpenFBDStudio,
  onOpenPresets,
  onOpenReport,
  onOpenAITutor,
  onOpenExperiment,
  onOpenExam,
  onResetParams,
}) => {
  return (
    <header
      id="main-navbar"
      className={`h-16 border-b px-3 sm:px-6 flex items-center justify-between transition-colors z-30 sticky top-0 ${
        isDark ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur' : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur'
      }`}
    >
      {/* Brand & View Switcher */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div
          onClick={() => onNavigateView('home')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-black tracking-tighter text-base group-hover:scale-105 transition-transform">
            EV
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-sm sm:text-base">EVLab</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                Core
              </span>
            </div>
            <p className="text-[10px] hidden sm:block text-slate-400 font-mono tracking-tight">
              Engineering Mechanics
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-300 dark:bg-slate-800 hidden md:block" />

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => onNavigateView('home')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'home'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <button
            onClick={() => onNavigateView('workspace')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'workspace'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </button>
        </div>
      </div>

      {/* Center / Action Badges & Lab Tools */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Guided Experiments */}
        <button
          onClick={onOpenExperiment}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
            isDark
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
              : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
          }`}
          title="Open Guided Interactive Laboratory Experiments"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Guided Labs</span>
        </button>

        {/* Exam Mode */}
        <button
          onClick={onOpenExam}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
            isDark
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
              : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
          }`}
          title="Timed Exam Challenges with Automated Scoring"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Exam Mode</span>
        </button>

        {/* Textbook Presets */}
        <button
          onClick={onOpenPresets}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
          title="Open Classical Textbook Problems (Hibbeler, Meriam, Beer)"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          <span className="hidden xl:inline">Textbook Presets</span>
        </button>

        {/* AI Engineering Tutor */}
        <button
          onClick={onOpenAITutor}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          title="Ask Gemini Engineering Mechanics Tutor"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden sm:inline">AI Tutor</span>
        </button>

        {/* Lab Report Generator */}
        <button
          onClick={onOpenReport}
          className={`p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
          }`}
          title="Generate Formal Engineering Laboratory Report"
        >
          <FileText className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden xl:inline ml-1">Report</span>
        </button>

        <div className="h-5 w-px bg-slate-300 dark:bg-slate-800" />

        {/* Dark / Light Theme Toggle */}
        <button
          id="btn-theme-toggle"
          onClick={onToggleTheme}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
          }`}
          title="Toggle Light / Dark Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
