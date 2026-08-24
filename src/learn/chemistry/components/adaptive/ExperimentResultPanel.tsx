import React, { useState } from 'react';
import { ExperimentResultBreakdown, AcademicLevel } from '../../types/chemistry';
import { getStandardTier } from '../../engines/AdaptiveLearningEngine';
import { Award, ChevronDown, ChevronUp, FileText, CheckCircle, HelpCircle, Globe, ShieldAlert } from 'lucide-react';

interface ExperimentResultPanelProps {
  breakdown: ExperimentResultBreakdown;
  academicLevel: AcademicLevel;
  className?: string;
}

export const ExperimentResultPanel: React.FC<ExperimentResultPanelProps> = ({
  breakdown,
  academicLevel,
  className = ''
}) => {
  const [showCalculationTrace, setShowCalculationTrace] = useState(false);
  const tier = getStandardTier(academicLevel);

  return (
    <div
      className={`bg-[#111A2E] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 ${className}`}
      id="experiment-result-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Scientific Result & Analytical Summary
            </h3>
            <p className="text-[11px] text-slate-400">
              Clear separation of input parameters, calculated values, observations, and real-world interpretations.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCalculationTrace(!showCalculationTrace)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-teal-400 border border-slate-700/80 transition-all font-mono"
        >
          <span>{showCalculationTrace ? 'Hide Trace' : 'How Was This Calculated?'}</span>
          {showCalculationTrace ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Grid: Inputs vs Calculated Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. INPUTS */}
        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            1. User Inputs & Initial Conditions:
          </div>
          <div className="space-y-1.5">
            {Object.entries(breakdown.inputs).map(([key, item]: [string, any]) => (
              <div key={key} className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{item.label}:</span>
                <span className="font-mono font-bold text-white">
                  {item.value} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. CALCULATED RESULTS */}
        <div className="p-3.5 rounded-xl bg-[#0F172A] border border-slate-800 space-y-2">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
            2. Engine Calculations:
          </div>
          <div className="space-y-1.5">
            {Object.entries(breakdown.calculatedValues).map(([key, item]: [string, any]) => (
              <div key={key} className="flex justify-between items-center text-xs">
                <span className="text-slate-400">{item.label}:</span>
                <span className="font-mono font-bold text-teal-300">
                  {item.value} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. OBSERVATION & 4. INTERPRETATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            3. Simulation Observation:
          </span>
          <p className="text-xs text-slate-200 leading-relaxed">{breakdown.observation}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            4. Scientific Interpretation:
          </span>
          <p className="text-xs text-slate-200 leading-relaxed">{breakdown.interpretation}</p>
        </div>
      </div>

      {/* 5. REAL-WORLD APPLICATION */}
      <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5">
        <Globe className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-emerald-400 uppercase tracking-wider font-mono text-[10px]">
            Real-World Industry & Application:
          </span>
          <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
            {breakdown.realWorldApplication}
          </p>
        </div>
      </div>

      {/* Transparent Calculation Trace Drawer */}
      {showCalculationTrace && (
        <div className="p-4 rounded-xl bg-[#0B1121] border border-teal-500/40 space-y-3 animate-fadeIn">
          <div className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Transparent Calculation Steps:
          </div>

          <div className="space-y-2 text-xs font-mono text-slate-300">
            {Object.entries(breakdown.calculatedValues).map(([key, item]: [string, any]) => (
              <div key={key} className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-teal-300 font-bold">{item.label}</div>
                {item.formulaUsed && (
                  <div className="text-slate-400 text-[11px]">Formula: {item.formulaUsed}</div>
                )}
                <div className="text-white font-bold text-sm">
                  = {item.value} {item.unit}
                </div>
              </div>
            ))}
          </div>

          {tier >= 4 && breakdown.assumptions.length > 0 && (
            <div className="text-xs text-slate-400 pt-2 border-t border-slate-800 space-y-1">
              <span className="font-bold text-slate-300 font-mono text-[10px] uppercase">
                Model Assumptions & Constraints:
              </span>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 text-slate-400">
                {breakdown.assumptions.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
