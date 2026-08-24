import React from 'react';
import { BookOpen, CheckCircle2, ChevronRight, Hash, Layers } from 'lucide-react';
import { CalculationStep } from '../types/mechanics';

interface CalculationTracePanelProps {
  steps: CalculationStep[];
  isDark: boolean;
}

export const CalculationTracePanel: React.FC<CalculationTracePanelProps> = ({
  steps,
  isDark,
}) => {
  return (
    <div
      id="calculation-trace-panel"
      className={`h-full rounded-xl border p-4 flex flex-col space-y-4 overflow-y-auto ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Hash className="w-4 h-4 text-emerald-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Step-by-Step Mathematical Trace
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold">
          {steps.length} Steps
        </span>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {steps.map((step) => (
          <div
            key={step.stepNumber}
            id={`calc-step-${step.stepNumber}`}
            className={`p-3.5 rounded-lg border transition-all ${
              isDark
                ? 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Step Number & Description */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-mono font-black flex items-center justify-center shrink-0">
                {step.stepNumber}
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {step.description}
              </p>
            </div>

            {/* Formula LaTeX / Mathematical Expression */}
            <div
              className={`p-2.5 rounded font-mono text-xs my-1.5 border overflow-x-auto ${
                isDark
                  ? 'bg-slate-950/80 border-slate-800 text-blue-300'
                  : 'bg-white border-slate-200 text-blue-700'
              }`}
            >
              <span className="opacity-60 text-[10px] block uppercase tracking-wider mb-0.5">
                Governing Formula
              </span>
              <div className="font-semibold">{step.formula}</div>
            </div>

            {/* Substitution */}
            <div
              className={`p-2 rounded font-mono text-xs my-1.5 border ${
                isDark
                  ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                  : 'bg-slate-100/60 border-slate-200 text-slate-700'
              }`}
            >
              <span className="opacity-60 text-[10px] block uppercase tracking-wider mb-0.5">
                Numerical Substitution
              </span>
              <div>{step.substitution}</div>
            </div>

            {/* Result */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-[11px] font-medium text-slate-400">Evaluated Value:</span>
              <span className="font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                {step.result}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
