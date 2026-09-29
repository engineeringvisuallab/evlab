import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  Lightbulb,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  X,
} from 'lucide-react';
import { GUIDED_EXPERIMENTS } from '../data/guidedExperiments';
import { GuidedExperiment } from '../types/unifiedModel';

interface GuidedExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExpId?: string;
  onApplyExperimentParams: (topicId: string, params: Record<string, number>) => void;
  isDark: boolean;
}

export const GuidedExperimentModal: React.FC<GuidedExperimentModalProps> = ({
  isOpen,
  onClose,
  initialExpId = 'exp-force-acceleration',
  onApplyExperimentParams,
  isDark,
}) => {
  const [selectedExpId, setSelectedExpId] = useState<string>(initialExpId);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentExp = GUIDED_EXPERIMENTS.find((e) => e.id === selectedExpId) || GUIDED_EXPERIMENTS[0];
  const currentStep = currentExp.steps[activeStepIndex] || currentExp.steps[0];

  const handleLaunchExperiment = () => {
    onApplyExperimentParams(currentExp.topicId, currentExp.initialParams);
    onClose();
  };

  const handleApplyStep = (suggestedValue: number, paramKey: string) => {
    onApplyExperimentParams(currentExp.topicId, {
      ...currentExp.initialParams,
      [paramKey]: suggestedValue,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className={`w-full max-w-4xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Guided Laboratory Experiments</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Structured interactive experiments connecting variable changes to physical principles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Experiment Selection List (4 cols) */}
          <div className="md:col-span-4 space-y-2 border-r border-slate-200 dark:border-slate-800 pr-0 md:pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
              Available Labs ({GUIDED_EXPERIMENTS.length})
            </span>
            <div className="space-y-1.5">
              {GUIDED_EXPERIMENTS.map((exp) => {
                const isSelected = exp.id === currentExp.id;
                return (
                  <div
                    key={exp.id}
                    onClick={() => {
                      setSelectedExpId(exp.id);
                      setActiveStepIndex(0);
                    }}
                    className={`p-3 rounded-2xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-500/15 border-purple-500 text-purple-400 font-bold shadow-xs'
                        : isDark
                        ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500">
                        {exp.difficulty}
                      </span>
                    </div>
                    <p className="leading-snug">{exp.title}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Experiment Workflow (8 cols) */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-purple-500 uppercase">
                Active Experiment
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {currentExp.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {currentExp.overview}
              </p>
            </div>

            {/* Core Question Callout */}
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start space-x-2">
              <Lightbulb className="w-4 h-4 shrink-0 text-purple-400 mt-0.5" />
              <div>
                <span className="font-bold text-purple-400">Guiding Question: </span>
                <span className="text-slate-700 dark:text-purple-200">{currentExp.question}</span>
              </div>
            </div>

            {/* Step-by-Step Interactive Progression */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step {activeStepIndex + 1} of {currentExp.steps.length}
                </span>
                <div className="flex items-center space-x-1">
                  {currentExp.steps.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveStepIndex(idx)}
                      className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                        activeStepIndex === idx
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step Details Card */}
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Instruction:
                  </h4>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                    {currentStep.instruction}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 text-slate-300 text-xs font-mono space-y-1">
                  <div className="text-slate-400">Physical Observation:</div>
                  <div className="text-emerald-400 font-semibold">{currentStep.observationPrompt}</div>
                  <div className="text-slate-400 pt-1">Expected Outcome:</div>
                  <div className="text-blue-400 font-semibold">{currentStep.expectedOutcome}</div>
                </div>

                <button
                  onClick={() => handleApplyStep(currentStep.suggestedValue, currentStep.targetParameter)}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Set Parameter ({currentStep.targetParameter} = {currentStep.suggestedValue})</span>
                </button>
              </div>
            </div>

            {/* Concept Takeaway */}
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center space-x-1.5 text-emerald-500 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Core Concept Takeaway</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentExp.conceptTakeaway}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Launch Button */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            Topic: {currentExp.topicId.toUpperCase()}
          </span>
          <button
            onClick={handleLaunchExperiment}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Load Experiment into Workspace</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
