import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  GraduationCap,
  Layers,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Wrench,
  Zap,
} from 'lucide-react';
import { CURRICULUM_LEVELS } from '../data/knowledgeGraph';
import { GUIDED_EXPERIMENTS } from '../data/guidedExperiments';
import { REAL_WORLD_SYSTEMS } from '../data/realWorldSystems';
import { EXAM_CHALLENGES } from '../data/examChallenges';
import { TopicDefinition } from '../types/mechanics';

interface HomeScreenProps {
  onSelectTopic: (topicId: string) => void;
  onOpenWorkspace: () => void;
  onOpenExperiment: (expId: string) => void;
  onOpenExam: (examId: string) => void;
  onOpenPresets: () => void;
  onOpenRealWorld: (systemId: string) => void;
  allTopics: TopicDefinition[];
  isDark: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectTopic,
  onOpenWorkspace,
  onOpenExperiment,
  onOpenExam,
  onOpenPresets,
  onOpenRealWorld,
  allTopics,
  isDark,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* 1. Header Hero Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border transition-all ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border-slate-800'
            : 'bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/40 border-slate-200 shadow-sm'
        }`}
      >
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>EVLab Engineering Mechanics Core &bull; Unified Workspace</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Understand, Solve & Simulate <span className="text-blue-500">Physical Systems</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            A single unified mechanics CAD and simulation workspace suitable for secondary students, engineering undergraduates, and professional civil/mechanical engineers. Build models, apply loads, solve deterministic statics & dynamics, and inspect exact step-by-step mathematical traces.
          </p>

          {/* Quick Action Button */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenWorkspace}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Open Mechanics Workspace</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={() => onOpenExperiment('exp-beam-flexure')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 text-emerald-500" />
              <span>Start Guided Experiment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. "WHAT DO YOU WANT TO DO?" Primary Navigation Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              What do you want to do?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose an engineering workflow or learning track
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Build a System */}
          <div
            onClick={() => {
              onSelectTopic('beams');
              onOpenWorkspace();
            }}
            className={`group p-5 rounded-2xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900/70 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60'
                : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-500 transition-colors">
              Build a Physical System
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Create beams, blocks, trusses, or mechanisms. Add loads, place supports, and visually assemble custom mechanics problems.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-blue-500">
              <span>Launch Builder</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Solve a Problem */}
          <div
            onClick={() => {
              onSelectTopic('equilibrium');
              onOpenWorkspace();
            }}
            className={`group p-5 rounded-2xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900/70 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60'
                : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-500 transition-colors">
              Solve a Mechanics Problem
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Enter known physical parameters and receive instant deterministic static reactions, shear/moment diagrams, or kinematic states.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-emerald-500">
              <span>Calculate Reactions</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Run an Experiment */}
          <div
            onClick={() => onOpenExperiment('exp-force-acceleration')}
            className={`group p-5 rounded-2xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900/70 border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/60'
                : 'bg-white border-slate-200 hover:border-purple-400 hover:shadow-md'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Play className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-500 transition-colors">
              Run Guided Experiments
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Step-by-step interactive laboratory experiments: test Newton\'s laws, midspan beam flexure, friction slip thresholds, and ballistic range.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-purple-500">
              <span>Explore 5 Labs</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Open Textbook Examples */}
          <div
            onClick={onOpenPresets}
            className={`group p-5 rounded-2xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900/70 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/60'
                : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors">
              Classical Textbook Problems
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Load canonical benchmark problems from Hibbeler, Meriam & Kraige, and Beer & Johnston with preconfigured geometry.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-amber-500">
              <span>View Textbook Library</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5: Real-World Civil & Mechanical Systems */}
          <div
            onClick={() => onOpenRealWorld('civil-bridge-girder')}
            className={`group p-5 rounded-2xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900/70 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60'
                : 'bg-white border-slate-200 hover:border-cyan-400 hover:shadow-md'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-cyan-500 transition-colors">
              Real-World Engineering Cases
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Bridge overpass girders, tower crane booms, engine pistons, industrial flywheels, and retaining wall soil sliding.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-cyan-500">
              <span>Inspect Case Studies</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6: Exam Mode Challenge */}
          <div
            onClick={() => onOpenExam('exam-01-beam-reaction')}
            className={`group p-5 rounded-2xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-900/70 border-slate-800 hover:border-rose-500/50 hover:bg-slate-800/60'
                : 'bg-white border-slate-200 hover:border-rose-400 hover:shadow-md'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-rose-500 transition-colors">
              Timed Exam Challenge
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Test your engineering problem-solving speed with hidden answers, timer controls, automatic scoring, and full derivations.
            </p>
            <div className="mt-3 flex items-center text-xs font-semibold text-rose-500">
              <span>Start Exam Mode</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. 4-Level Curriculum Roadmap */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              <span>Engineering Mechanics Curriculum Progression</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Structured from first-principles statics to advanced multi-body dynamics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CURRICULUM_LEVELS.map((lvl) => (
            <div
              key={lvl.levelNumber}
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  {lvl.badge}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {lvl.topics.length} Modules
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {lvl.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 leading-relaxed">
                {lvl.description}
              </p>

              {/* Topics chips */}
              <div className="flex flex-wrap gap-2">
                {lvl.topics.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTopic(t.id);
                      onOpenWorkspace();
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-medium flex items-center space-x-1.5 transition-all cursor-pointer ${
                      isDark
                        ? 'bg-slate-800/80 border-slate-700 hover:border-blue-500 hover:text-blue-400'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-500 hover:text-blue-600'
                    }`}
                  >
                    <span>{t.title}</span>
                    <ArrowRight className="w-3 h-3 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Real-World Engineering Showcase Carousel */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-cyan-500" />
              <span>Real-World Engineering Benchmarks</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Civil, structural, and mechanical industrial applications
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REAL_WORLD_SYSTEMS.slice(0, 3).map((sys) => (
            <div
              key={sys.id}
              onClick={() => onOpenRealWorld(sys.id)}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/50'
                  : 'bg-white border-slate-200 hover:border-cyan-400'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500">
                  {sys.domain}
                </span>
                <h3 className="text-sm font-bold mt-2 text-slate-900 dark:text-slate-100">
                  {sys.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {sys.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-slate-400">
                  Code: {sys.codeStandard.split('/')[0]}
                </span>
                <span className="font-semibold text-cyan-500 flex items-center">
                  Load Case <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
