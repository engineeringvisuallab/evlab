import React from 'react';
import { ExperimentExecutionMode } from '../../types/chemistry';
import { CheckCircle2, Circle, ListOrdered, Unlock, Trophy, ArrowRight, RotateCcw } from 'lucide-react';

interface GuidedLabSteppersProps {
  executionMode: ExperimentExecutionMode;
  onChangeExecutionMode: (mode: ExperimentExecutionMode) => void;
  currentStepIndex: number;
  steps: Array<{ title: string; desc: string; isCompleted: boolean }>;
  onSelectStep?: (idx: number) => void;
  onNextStep?: () => void;
  onResetGuide?: () => void;
  className?: string;
}

export const GuidedLabSteppers: React.FC<GuidedLabSteppersProps> = ({
  executionMode,
  onChangeExecutionMode,
  currentStepIndex,
  steps,
  onSelectStep,
  onNextStep,
  onResetGuide,
  className = ''
}) => {
  return (
    <div
      className={`bg-[#111A2E] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 ${className}`}
      id="guided-lab-steppers"
    >
      {/* Mode Switcher: Guided vs Free vs Challenge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B1121] border border-slate-800">
          <button
            onClick={() => onChangeExecutionMode('guided')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              executionMode === 'guided'
                ? 'bg-teal-600 text-slate-950 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Guided Lab</span>
          </button>

          <button
            onClick={() => onChangeExecutionMode('free')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              executionMode === 'free'
                ? 'bg-teal-600 text-slate-950 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Free Sandbox</span>
          </button>

          <button
            onClick={() => onChangeExecutionMode('challenge')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              executionMode === 'challenge'
                ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Challenge Mode</span>
          </button>
        </div>

        {executionMode === 'guided' && onResetGuide && (
          <button
            onClick={onResetGuide}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset Guided Stepper"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Guided Lab Steps List */}
      {executionMode === 'guided' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400 font-semibold uppercase tracking-wider">
              Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex]?.title}
            </span>
            <span className="text-[11px] font-mono text-teal-400">
              {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Complete
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-400 transition-all duration-300 rounded-full"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Step detail card */}
          <div className="p-3.5 rounded-xl bg-[#0F172A] border border-teal-500/30 space-y-2">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Current Objective:
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {steps[currentStepIndex]?.desc}
            </p>
          </div>

          {/* Step navigation actions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1.5 overflow-x-auto max-w-[70%]">
              {steps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectStep && onSelectStep(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all ${
                    idx === currentStepIndex
                      ? 'bg-teal-600 text-slate-950 shadow-md'
                      : step.isCompleted
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                  }`}
                  title={step.title}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {onNextStep && currentStepIndex < steps.length - 1 && (
              <button
                onClick={onNextStep}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Free Sandbox Info */}
      {executionMode === 'free' && (
        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="font-bold text-teal-400 uppercase tracking-wider">
            Unconstrained Sandbox Mode Active
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            All parameters, flow valves, chemical concentrations, and equipment meters are unlocked. Experiment freely and observe live curves.
          </p>
        </div>
      )}

      {/* Challenge Mode Notice */}
      {executionMode === 'challenge' && (
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1">
          <div className="font-bold text-amber-400 uppercase tracking-wider">
            Interactive Problem Solving Mission
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Use experimental manipulation to determine the hidden unknown values or achieve target parameters within tolerance.
          </p>
        </div>
      )}
    </div>
  );
};
