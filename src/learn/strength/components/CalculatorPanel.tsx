import React from 'react';
import { CalculationTrace, TopicId, UnitSystem } from '../types';
import { formatEngValue } from '../core/units';
import { 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  HelpCircle, 
  Sliders, 
  Bookmark, 
  Share2, 
  Download 
} from 'lucide-react';

interface CalculatorPanelProps {
  topicId: TopicId;
  traces: CalculationTrace[];
  unitSystem: UnitSystem;
  onOpenReport: () => void;
}

export const CalculatorPanel: React.FC<CalculatorPanelProps> = ({
  topicId,
  traces,
  unitSystem,
  onOpenReport,
}) => {
  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 overflow-y-auto p-4 space-y-4 select-none scrollbar-thin scrollbar-thumb-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-slate-100 font-mono">
              Engineering Calculation Trace
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-mono font-semibold">
              Traceable • {unitSystem} Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step numerical verification with formula substitutions and references
          </p>
        </div>

        <button
          onClick={onOpenReport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-medium transition shadow-sm"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Export Stamped Report</span>
        </button>
      </div>

      {/* Calculation Traces Stack */}
      <div className="space-y-4">
        {traces.map((trace, idx) => {
          const calcId = trace.calcId || (trace as any).calculationId || `CALC-${idx + 1}`;
          const formulaStr = trace.formulaLatex || (trace as any).formula || trace.formulaName || '';
          const resultDisplay = trace.result?.formatted || (trace.result ? `${formatEngValue(trace.result.value)} ${trace.result.unit}` : `${formatEngValue((trace as any).resultValue)} ${(trace as any).resultUnit || ''}`);
          const interpretation = trace.engineeringInterpretation || (trace as any).interpretation || '';
          const refSource = trace.reference || (trace as any).standardRef || 'Mechanics of Materials Code';
          const sfVal = (trace as any).safetyFactor;
          const isSafe = sfVal ? sfVal >= 1.5 : true;
          const hasFailure = sfVal ? sfVal < 1.0 : false;

          return (
            <div
              key={calcId}
              className="bg-slate-900/90 rounded-lg border border-slate-800 p-4 space-y-3 shadow-sm hover:border-slate-700 transition"
            >
              {/* Calculation Title & ID */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 font-bold">
                    {calcId}
                  </span>
                  <span className="font-semibold text-sm text-slate-100">
                    {trace.title}
                  </span>
                </div>

                {sfVal !== undefined && (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs text-slate-400 font-mono">SF:</span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        hasFailure
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : isSafe
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {typeof sfVal === 'number' ? sfVal.toFixed(2) : sfVal}
                    </span>
                  </div>
                )}
              </div>

              {/* Given Inputs Matrix */}
              {trace.inputs && trace.inputs.length > 0 && (
                <div className="bg-slate-950/60 p-2.5 rounded-md border border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-500 font-mono">
                    Inputs & Boundary Parameters:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1.5">
                    {trace.inputs.map((inp, i) => (
                      <div key={i} className="text-[11px] font-mono flex items-center justify-between bg-slate-900/80 px-2 py-1 rounded border border-slate-800/60">
                        <span className="text-slate-400 font-semibold">{inp.symbol}:</span>
                        <span className="text-slate-200">{typeof inp.value === 'number' ? formatEngValue(inp.value) : inp.value} <span className="text-slate-500">{inp.unit}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Governing LaTeX / Symbolic Formula */}
              <div className="bg-slate-950/80 p-3 rounded-md border border-slate-800 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>1. Governing Analytical Formula:</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Ref: {refSource}
                  </span>
                </div>
                <div className="font-mono text-cyan-300 text-sm font-bold tracking-wide">
                  {formulaStr}
                </div>
              </div>

              {/* Variable Substitution Step */}
              <div className="bg-slate-950/80 p-3 rounded-md border border-slate-800 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400">
                  2. Variable Substitution & Numerical Steps:
                </div>
                <div className="font-mono text-slate-300 text-xs break-all bg-slate-900/60 p-2 rounded border border-slate-800/80">
                  {trace.substitution}
                </div>
              </div>

              {/* Calculated Result Output */}
              <div className="flex items-center justify-between bg-gradient-to-r from-slate-950 to-blue-950/40 p-3 rounded-md border border-cyan-900/40">
                <div className="text-xs font-semibold text-slate-300">
                  3. Calculated Result:
                </div>
                <div className="text-right font-mono text-base font-extrabold text-cyan-300">
                  {resultDisplay}
                </div>
              </div>

              {/* Engineering Interpretation */}
              {interpretation && (
                <div className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded border border-slate-800/60 flex items-start space-x-2">
                  <div className="mt-0.5">
                    {hasFailure ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-200">
                      Engineering Interpretation:
                    </span>
                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      {interpretation}
                    </p>
                  </div>
                </div>
              )}

              {/* Assumptions & Limitations Checklist */}
              {trace.assumptions && trace.assumptions.length > 0 && (
                <div className="text-[11px] text-slate-400 pt-1">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Underlying Assumptions:
                  </span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-400 pl-1">
                    {trace.assumptions.map((assump, i) => (
                      <li key={i}>{assump}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
