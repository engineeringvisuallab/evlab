import React from 'react';
import { 
  LabMode, 
  TopicId, 
  UnitSystem, 
  VisualMode 
} from '../types';
import { 
  Activity, 
  BookOpen, 
  Calculator, 
  Cpu, 
  FileText, 
  HelpCircle, 
  Layers, 
  Maximize, 
  RotateCcw, 
  Sliders, 
  Sparkles, 
  Volume2, 
  VolumeX 
} from 'lucide-react';

interface HeaderProps {
  currentTopicId: TopicId;
  currentMode: LabMode;
  onModeChange: (mode: LabMode) => void;
  visualMode: VisualMode;
  onVisualModeChange: (mode: VisualMode) => void;
  unitSystem: UnitSystem;
  onUnitSystemToggle: () => void;
  deformationScale: number;
  onDeformationScaleChange: (scale: number) => void;
  onOpenWhatIf: () => void;
  onOpenComparison: () => void;
  onOpenGuidedLab: () => void;
  onOpenReport: () => void;
  onOpenAI: () => void;
  onResetExperiment: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTopicId,
  currentMode,
  onModeChange,
  visualMode,
  onVisualModeChange,
  unitSystem,
  onUnitSystemToggle,
  deformationScale,
  onDeformationScaleChange,
  onOpenWhatIf,
  onOpenComparison,
  onOpenGuidedLab,
  onOpenReport,
  onOpenAI,
  onResetExperiment,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white select-none sticky top-0 z-40">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-md shadow-cyan-900/30 border border-cyan-400/30">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-base text-slate-100 font-mono">
                EV<span className="text-cyan-400 font-sans font-extrabold">Lab</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-medium">
                Strength of Materials v2.4
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Virtual Engineering Laboratory • Interactive Mechanics
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center space-x-2">
          {/* Unit System Toggle */}
          <button
            onClick={onUnitSystemToggle}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition"
            title="Toggle SI / US Units"
          >
            <span className="text-slate-400">Units:</span>
            <span className="font-bold text-cyan-400">{unitSystem}</span>
          </button>

          {/* Quick Tool Actions */}
          <button
            onClick={onOpenWhatIf}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 border border-amber-800/40 text-xs font-medium transition shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">What If?</span>
          </button>

          <button
            onClick={onOpenComparison}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-purple-950/60 text-purple-300 hover:text-purple-200 border border-purple-800/40 text-xs font-medium transition shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compare</span>
          </button>

          <button
            onClick={onOpenGuidedLab}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-xs font-medium transition shadow-sm"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guided Lab</span>
          </button>

          <button
            onClick={onOpenReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Report</span>
          </button>

          <button
            onClick={onOpenAI}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-blue-900/40 transition border border-blue-400/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>AI Professor</span>
          </button>

          <button
            onClick={onResetExperiment}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
            title="Reset Experiment to Default State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Navigation & Visual Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-1.5 bg-slate-950 text-xs gap-2">
        {/* 4 Primary Modes */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onModeChange('learn')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition ${
              currentMode === 'learn'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. LEARN</span>
          </button>

          <button
            onClick={() => onModeChange('calculate')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition ${
              currentMode === 'calculate'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>2. CALCULATE</span>
          </button>

          <button
            onClick={() => onModeChange('simulate')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition ${
              currentMode === 'simulate'
                ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-300" />
            <span>3. SIMULATE</span>
          </button>

          <button
            onClick={() => onModeChange('understand')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md font-medium transition ${
              currentMode === 'understand'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>4. UNDERSTAND</span>
          </button>
        </div>

        {/* Visual Engine Controls (When in Simulation mode or overall) */}
        <div className="flex items-center space-x-3 text-slate-400">
          {/* Visual Modes */}
          <div className="flex items-center space-x-1 bg-slate-900/90 px-1.5 py-0.5 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mr-1">
              View:
            </span>
            {(['normal', 'stress', 'strain', 'deformation', 'force', 'section', 'diagram'] as VisualMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => onVisualModeChange(mode)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition ${
                  visualMode === mode
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Deformation Scale Amplifier */}
          <div className="flex items-center space-x-1 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mr-1">
              Def. Scale:
            </span>
            {[1, 10, 100, 1000].map(scale => (
              <button
                key={scale}
                onClick={() => onDeformationScaleChange(scale)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition ${
                  deformationScale === scale
                    ? 'bg-blue-900/80 text-blue-300 font-bold border border-blue-600/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {scale === 1 ? '1× (Real)' : `${scale}×`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
