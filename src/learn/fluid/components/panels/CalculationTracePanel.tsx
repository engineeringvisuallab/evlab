/**
 * EVLab Step-by-Step Engineering Calculation Trace Panel
 * Displays complete mathematical audit trails, formula substitutions, assumptions, and validation.
 */

import React, { useState } from 'react';
import { CalculationTrace } from '../../types';
import { ChevronDown, ChevronUp, Copy, Check, Info, AlertTriangle } from 'lucide-react';

interface CalculationTracePanelProps {
  traces: CalculationTrace[];
}

export const CalculationTracePanel: React.FC<CalculationTracePanelProps> = ({ traces }) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    traces.forEach((t, i) => {
      init[t.id] = i === 0; // expand first trace by default
    });
    return init;
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getTraceTitle = (t: CalculationTrace) => t.name || (t as any).title || t.id;
  const getTraceResultVal = (t: CalculationTrace) => (t.result ? t.result.value : (t as any).resultValue ?? 0);
  const getTraceResultUnit = (t: CalculationTrace) => (t.result ? t.result.unit : (t as any).unit ?? '');
  const getTraceRef = (t: CalculationTrace) => t.reference || (t as any).referenceTopic || 'Fluid Mechanics';

  const handleCopy = (trace: CalculationTrace) => {
    const title = getTraceTitle(trace);
    const resultVal = getTraceResultVal(trace);
    const resultUnit = getTraceResultUnit(trace);
    const reference = getTraceRef(trace);

    const text = `Calculation: ${title} (${trace.id})
Formula: ${trace.formula}
Substitution: ${trace.substitution}
Result: ${resultVal} ${resultUnit}
Assumptions: ${trace.assumptions?.join('; ') || 'Standard assumptions'}
Reference: ${reference}`;

    navigator.clipboard.writeText(text);
    setCopiedId(trace.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!traces || traces.length === 0) {
    return (
      <div className="p-4 text-center text-slate-400 text-sm italic">
        No active calculation trace for this topic. Adjust parameters to compute.
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3">
      {traces.map((trace) => {
        const isExpanded = expandedIds[trace.id] ?? false;
        const isCopied = copiedId === trace.id;
        const title = getTraceTitle(trace);
        const resultVal = getTraceResultVal(trace);
        const resultUnit = getTraceResultUnit(trace);
        const reference = getTraceRef(trace);

        return (
          <div
            key={trace.id}
            className="border border-slate-800 bg-slate-900/90 rounded-xl overflow-hidden shadow-sm"
          >
            {/* Header / Summary Bar */}
            <div
              className="flex items-center justify-between p-3.5 bg-slate-850 cursor-pointer hover:bg-slate-800/80 transition-colors"
              onClick={() => toggleExpand(trace.id)}
            >
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 text-xs font-mono rounded bg-sky-950 text-sky-400 border border-sky-800">
                  {trace.id}
                </span>
                <span className="font-semibold text-sm text-slate-200">{title}</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-sky-400">
                    {typeof resultVal === 'number'
                      ? resultVal > 10000 || (resultVal < 0.001 && resultVal > 0)
                        ? resultVal.toExponential(3)
                        : resultVal.toFixed(4)
                      : String(resultVal)}
                  </span>
                  <span className="ml-1 text-xs text-slate-400 font-mono">{resultUnit}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(trace);
                  }}
                  className="p-1 text-slate-400 hover:text-sky-300 rounded cursor-pointer"
                  title="Copy calculation trace"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>

                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </div>

            {/* Expanded Detailed Audit Trail */}
            {isExpanded && (
              <div className="p-4 border-t border-slate-800/80 space-y-4 bg-slate-950/40 text-xs">
                {/* 1. General Formula */}
                <div>
                  <div className="text-slate-400 font-medium mb-1 flex items-center space-x-1.5">
                    <Info className="w-3.5 h-3.5 text-sky-400" />
                    <span>Theoretical Governing Equation</span>
                  </div>
                  <div className="font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-sky-300 text-sm">
                    {trace.formula}
                  </div>
                </div>

                {/* 2. Numerical Substitution */}
                <div>
                  <div className="text-slate-400 font-medium mb-1">Parameter Substitution & Units</div>
                  <div className="font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-emerald-400 break-all leading-relaxed">
                    {trace.substitution}
                  </div>
                </div>

                {/* 3. Input Dictionary Table */}
                {trace.inputs && Object.keys(trace.inputs).length > 0 && (
                  <div>
                    <div className="text-slate-400 font-medium mb-1">Evaluated Input Quantities</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(trace.inputs).map(([key, inputObj]) => {
                        const val = typeof inputObj === 'object' && inputObj !== null ? (inputObj as any).value : inputObj;
                        const unit = typeof inputObj === 'object' && inputObj !== null ? (inputObj as any).unit : '';
                        const label = typeof inputObj === 'object' && inputObj !== null ? (inputObj as any).label || key : key;
                        return (
                          <div
                            key={key}
                            className="bg-slate-900/80 p-2 rounded border border-slate-800 flex justify-between items-center"
                          >
                            <span className="text-slate-400 font-mono">{label}:</span>
                            <span className="text-slate-200 font-mono font-medium">
                              {typeof val === 'number' ? (val < 0.001 && val > 0 ? val.toExponential(3) : val.toFixed(4)) : String(val)}{' '}
                              {unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Assumptions & Validity Boundaries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="text-slate-300 font-medium mb-1 flex items-center space-x-1">
                      <span>Physical Assumptions</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                      {trace.assumptions?.map((assump, idx) => (
                        <li key={idx}>{assump}</li>
                      )) || <li>Standard ideal/steady flow</li>}
                    </ul>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    <div className="text-slate-300 font-medium mb-1">Reference & Context</div>
                    <p className="text-slate-400 leading-relaxed">{reference}</p>
                  </div>
                </div>

                {/* 5. Warnings if any */}
                {trace.warnings && trace.warnings.length > 0 && (
                  <div className="bg-amber-950/40 border border-amber-800/60 p-2.5 rounded-lg text-amber-300 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      {trace.warnings.map((w, i) => (
                        <div key={i}>{w}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
