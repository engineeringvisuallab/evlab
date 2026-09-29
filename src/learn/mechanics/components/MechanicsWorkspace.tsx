import React, { useState } from 'react';
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  HelpCircle,
  Keyboard,
  Layers,
  Lightbulb,
  Maximize2,
  Play,
  Redo2,
  RotateCcw,
  Sliders,
  Sparkles,
  SquareCode,
  Undo2,
  Wrench,
  Zap,
} from 'lucide-react';
import { TopicDefinition, ParameterConfig } from '../types/mechanics';
import { UserSkillLevel } from '../types/unifiedModel';
import { solveTopicMechanics } from '../solvers';

// Core Subcomponents
import { Toolbox, ActiveTool } from './Toolbox';
import { ModelTree } from './ModelTree';
import { ProgressivePropertiesPanel } from './ProgressivePropertiesPanel';
import { SimulationCanvas } from './SimulationCanvas';
import { SmartResultsDock } from './SmartResultsDock';

interface MechanicsWorkspaceProps {
  topic: TopicDefinition;
  onSelectTopic: (topicId: string) => void;
  allTopics: TopicDefinition[];
  parameters: Record<string, number>;
  onUpdateParameter: (id: string, value: number) => void;
  onResetParams: () => void;
  onBackToHome: () => void;
  onOpenWhatIf: () => void;
  onOpenFBDStudio: () => void;
  onOpenPresets: () => void;
  onOpenReport: () => void;
  onOpenAITutor: () => void;
  onOpenShortcuts: () => void;
  onOpenExplainWhy: (param?: ParameterConfig) => void;
  isDark: boolean;
}

export const MechanicsWorkspace: React.FC<MechanicsWorkspaceProps> = ({
  topic,
  onSelectTopic,
  allTopics,
  parameters,
  onUpdateParameter,
  onResetParams,
  onBackToHome,
  onOpenWhatIf,
  onOpenFBDStudio,
  onOpenPresets,
  onOpenReport,
  onOpenAITutor,
  onOpenShortcuts,
  onOpenExplainWhy,
  isDark,
}) => {
  // Active tool in CAD toolbox
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [isSnapEnabled, setIsSnapEnabled] = useState<boolean>(true);
  const [skillLevel, setSkillLevel] = useState<UserSkillLevel>('Engineering');

  // Solver Execution
  const solverResult = React.useMemo(() => {
    return solveTopicMechanics(topic.id, parameters);
  }, [topic.id, parameters]);

  // Undo / Redo history stack
  const [history, setHistory] = useState<Record<string, number>[]>([parameters]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);

  const handleUpdateParameterWithHistory = (id: string, value: number) => {
    onUpdateParameter(id, value);
    const nextParams = { ...parameters, [id]: value };
    const nextHist = history.slice(0, historyIdx + 1);
    nextHist.push(nextParams);
    if (nextHist.length > 20) nextHist.shift();
    setHistory(nextHist);
    setHistoryIdx(nextHist.length - 1);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prevParams = history[historyIdx - 1];
      Object.entries(prevParams).forEach(([k, v]) => onUpdateParameter(k, v));
      setHistoryIdx((idx) => idx - 1);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const nextParams = history[historyIdx + 1];
      Object.entries(nextParams).forEach(([k, v]) => onUpdateParameter(k, v));
      setHistoryIdx((idx) => idx + 1);
    }
  };

  return (
    <div
      id="mechanics-workspace-root"
      className="flex-1 flex flex-col overflow-hidden bg-slate-100/60 dark:bg-slate-950"
    >
      {/* 1. CAD Master Toolbar */}
      <div
        className={`px-3 sm:px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 z-10 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        {/* Left: Home Navigation & Topic Quick Switcher */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onBackToHome}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Return to EVLab Home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

          {/* Topic Dropdown */}
          <select
            value={topic.id}
            onChange={(e) => onSelectTopic(e.target.value)}
            className="text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none cursor-pointer max-w-[200px] sm:max-w-[260px] truncate"
          >
            {allTopics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.category}: {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Universal Primary Actions (ONE SOLVE & SIMULATE BUTTON) */}
        <div className="flex items-center space-x-1.5">
          {/* Undo / Redo */}
          <div className="flex items-center space-x-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handleUndo}
              disabled={historyIdx <= 0}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 cursor-pointer"
              title="Undo (Ctrl + Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIdx >= history.length - 1}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-30 cursor-pointer"
              title="Redo (Ctrl + Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Primary SOLVE Action */}
          <button
            onClick={() => {
              // Trigger solver refresh
            }}
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            title="Solve Static & Dynamic Equilibrium"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>SOLVE</span>
          </button>

          {/* FBD Studio */}
          <button
            onClick={onOpenFBDStudio}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Open Free Body Diagram Studio"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline">FBD Studio</span>
          </button>
        </div>

        {/* Right: Auxiliary Engineering Tools & Help */}
        <div className="flex items-center space-x-1.5">
          {/* Sign Convention Indicator */}
          <div
            className="hidden lg:flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-mono bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
            title="Sign Convention: +X Right, +Y Up, +M Counterclockwise"
          >
            <span>+X&rarr; | +Y&uarr; | +M&#8634;</span>
          </div>

          {/* "I'm Confused" Explain Helper */}
          <button
            onClick={() => onOpenExplainWhy()}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
            title="I'm Confused? Explain the underlying physics"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Explain This</span>
          </button>

          {/* Keyboard Shortcuts */}
          <button
            onClick={onOpenShortcuts}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Main 3-Column CAD Layout */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 min-h-[460px] xl:min-h-[500px]">
          {/* Left Column: Toolbox + Model Tree (3 cols) */}
          <div className="lg:col-span-3 flex flex-col space-y-3">
            <Toolbox
              activeTool={activeTool}
              onChangeTool={setActiveTool}
              isSnapEnabled={isSnapEnabled}
              onToggleSnap={() => setIsSnapEnabled((prev) => !prev)}
              topicId={topic.id}
              isDark={isDark}
            />
            <ModelTree topic={topic} parameters={parameters} isDark={isDark} />
          </div>

          {/* Center Column: 2D Interactive Physics Simulation Canvas (6 cols) */}
          <div className="lg:col-span-6 h-[460px] xl:h-[500px]">
            <SimulationCanvas
              topic={topic}
              parameters={parameters}
              onUpdateParameter={handleUpdateParameterWithHistory}
              computedData={solverResult.computedData}
              isDark={isDark}
            />
          </div>

          {/* Right Column: Progressive Disclosure Properties Panel (3 cols) */}
          <div className="lg:col-span-3 h-[460px] xl:h-[500px]">
            <ProgressivePropertiesPanel
              topic={topic}
              parameters={parameters}
              onUpdateParameter={handleUpdateParameterWithHistory}
              validations={solverResult.validations}
              skillLevel={skillLevel}
              onChangeSkillLevel={setSkillLevel}
              onExplainParameter={(cfg) => onOpenExplainWhy(cfg)}
              onResetParams={onResetParams}
              isDark={isDark}
            />
          </div>
        </div>

        {/* 3. Bottom Smart Results Dock */}
        <SmartResultsDock
          topic={topic}
          parameters={parameters}
          computedData={solverResult.computedData}
          steps={solverResult.steps}
          validations={solverResult.validations}
          interpretation={solverResult.interpretation}
          isDark={isDark}
          onOpenAITutor={onOpenAITutor}
        />
      </div>
    </div>
  );
};
