import React, { useState } from 'react';
import { FormulaDetail, AcademicLevel } from '../../types/chemistry';
import { getStandardTier } from '../../engines/AdaptiveLearningEngine';
import { Binary, ChevronDown, ChevronUp, Layers, HelpCircle, Sparkles } from 'lucide-react';

interface AdaptiveFormulaCardProps {
  formula: FormulaDetail;
  academicLevel: AcademicLevel;
  className?: string;
}

export const AdaptiveFormulaCard: React.FC<AdaptiveFormulaCardProps> = ({
  formula,
  academicLevel,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const tier = getStandardTier(academicLevel);

  return (
    <div
      className={`bg-[#111A2E] border border-slate-800 rounded-2xl p-4 shadow-md space-y-3 ${className}`}
      id={`formula-card-${formula.id}`}
    >
      {/* Header with Main Formula */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Binary className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              {formula.name}
            </div>
            <div className="text-base sm:text-lg font-mono font-bold text-teal-300">
              {formula.latex}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700/80 transition-all"
        >
          <span>{isExpanded ? 'Hide Details' : 'Expand Variables'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Simple Meaning */}
      <p className="text-xs text-slate-300 leading-relaxed bg-[#0F172A] p-2.5 rounded-xl border border-slate-800/80">
        <strong className="text-teal-400 font-semibold">Concept: </strong>
        {formula.simpleMeaning}
      </p>

      {/* Expandable Deeper Breakdown */}
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-slate-800 animate-fadeIn">
          {/* Variables Table */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Variables & Physical Roles:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {formula.variables.map((v) => (
                <div
                  key={v.symbol}
                  className="p-2.5 rounded-lg bg-[#0F172A] border border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-teal-400">{v.symbol} ({v.name})</span>
                    <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900">
                      [{v.unit}]
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-snug">
                    {tier <= 2 ? v.meaningSimple : v.meaningAdvanced}
                  </p>
                  <div className="text-[10px] text-slate-500 italic">
                    Simulation link: {v.physicalRole}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Physical Simulation Connection */}
          <div className="p-2.5 rounded-lg bg-teal-950/30 border border-teal-500/20 text-xs text-teal-200">
            <strong className="text-teal-400 font-semibold">Physical Simulation Link: </strong>
            {formula.physicalSimulationConnection}
          </div>

          {/* Advanced Mode: Derivation, Assumptions & Limitations */}
          {tier >= 4 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              {formula.derivationSummary && (
                <div className="text-xs text-slate-400">
                  <strong className="text-slate-300 font-semibold">Derivation Basis: </strong>
                  {formula.derivationSummary}
                </div>
              )}
              {formula.assumptions.length > 0 && (
                <div className="text-xs text-slate-400">
                  <strong className="text-slate-300 font-semibold">Assumptions: </strong>
                  {formula.assumptions.join(' • ')}
                </div>
              )}
              {formula.limitations.length > 0 && (
                <div className="text-xs text-rose-300/80">
                  <strong className="text-rose-400 font-semibold">Model Limitations: </strong>
                  {formula.limitations.join(' • ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
