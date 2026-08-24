import React from 'react';
import { Calculator, ArrowRight, CheckCircle, Info, Sigma } from 'lucide-react';
import { EducationLevel, EquationDef, ParameterDef, CalculationItem } from '../../types/physics';
import { renderLatex, formatValue } from '../../utils/physicsMath';

interface LiveCalculationPanelProps {
  parameters: Record<string, number>;
  parameterDefs: ParameterDef[];
  equations: EquationDef[];
  educationLevel: EducationLevel;
  calculatedValues: Record<string, CalculationItem>;
}

export const LiveCalculationPanel: React.FC<LiveCalculationPanelProps> = ({
  parameters,
  parameterDefs,
  equations,
  educationLevel,
  calculatedValues,
}) => {
  return (
    <div
      id="live-calculation-panel"
      className="bg-[#080808] border border-white/10 rounded-xl p-4 shadow-xl flex flex-col h-full"
    >
      {/* Header - Elegant Dark */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Mathematical Derivation
            </h3>
            <p className="text-[10px] text-white/40 font-mono">
              Law → Equation → Variable Substitution → Solution
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-cyan-400 border border-white/10">
          Sync Live 60Hz
        </span>
      </div>

      {/* Active System Inputs Strip */}
      <div className="mb-3 bg-[#050505] p-2.5 rounded-lg border border-white/10">
        <div className="text-[9px] uppercase tracking-widest font-bold text-cyan-500 mb-1.5 flex items-center gap-1 font-mono">
          <Info className="w-3 h-3 text-cyan-500" /> Active System Inputs
        </div>
        <div className="flex flex-wrap gap-1.5">
          {parameterDefs.map((p) => {
            const val = parameters[p.id] ?? p.defaultValue;
            return (
              <div
                key={p.id}
                className="flex items-center gap-1 px-2 py-0.5 bg-[#0A0A0A] border border-white/10 rounded text-[11px]"
              >
                <span className="font-mono text-cyan-400 font-medium">{p.symbol || p.name}:</span>
                <span className="font-mono text-white font-bold">{formatValue(val, 2)}</span>
                <span className="text-[9px] text-white/40 font-mono">{p.unit}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calculated Mathematical Derivations Cards */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {Object.entries(calculatedValues).map(([key, rawCalc]) => {
          const calc = rawCalc as CalculationItem;
          return (
            <div
              key={key}
              className="bg-[#050505] border border-white/10 rounded-lg p-3.5 space-y-2 hover:border-white/20 transition-colors"
            >
              {/* Title & Result Badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded font-mono">
                  <span className="text-sm font-bold text-cyan-400">
                    {formatValue(calc.value, 3)}
                  </span>
                  <span className="text-[10px] text-white/40">{calc.unit}</span>
                </div>
              </div>

              {/* Step-by-step breakdown */}
              <div className="space-y-1.5 text-xs">
                {/* 1. Equation */}
                <div className="flex items-center gap-2 text-white/60">
                  <span className="text-[9px] font-mono uppercase bg-[#0A0A0A] border border-white/10 px-1.5 py-0.5 rounded text-white/40">
                    LAW
                  </span>
                  <div
                    className="font-mono text-cyan-400 text-[11px]"
                    dangerouslySetInnerHTML={{ __html: renderLatex(calc.formula) }}
                  />
                </div>

                {/* 2. Substitution */}
                <div className="flex items-center gap-2 text-white/60">
                  <span className="text-[9px] font-mono uppercase bg-[#0A0A0A] border border-white/10 px-1.5 py-0.5 rounded text-white/40">
                    SUB
                  </span>
                  <div
                    className="font-mono text-orange-400 text-[11px]"
                    dangerouslySetInnerHTML={{ __html: renderLatex(calc.substitution) }}
                  />
                </div>

                {/* 3. Physical Interpretation */}
                <div className="pt-2 mt-2 border-t border-white/5 flex items-start gap-1.5 text-[11px] text-white/70 leading-relaxed">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                  <span>{calc.interpretation}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
