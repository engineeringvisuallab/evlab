import React, { useState } from 'react';
import { Columns, Play, RotateCcw, ArrowRight, Check } from 'lucide-react';
import { ExperimentMetadata } from '../../types/physics';
import { formatValue } from '../../utils/physicsMath';

interface ComparisonModeProps {
  experiment: ExperimentMetadata;
  currentParams: Record<string, number>;
  onApplyCaseParams: (caseName: 'A' | 'B', params: Record<string, number>) => void;
}

export const ComparisonMode: React.FC<ComparisonModeProps> = ({
  experiment,
  currentParams,
  onApplyCaseParams,
}) => {
  const [caseAParams, setCaseAParams] = useState<Record<string, number>>({ ...currentParams });
  const [caseBParams, setCaseBParams] = useState<Record<string, number>>(() => {
    // Default Case B has doubled primary parameter (e.g., mass, force, velocity, etc.)
    const copy = { ...currentParams };
    const firstParam = experiment.parameters[0];
    if (firstParam) {
      copy[firstParam.id] = Math.min(firstParam.max, firstParam.defaultValue * 2);
    }
    return copy;
  });

  const handleParamChange = (caseId: 'A' | 'B', paramId: string, value: number) => {
    if (caseId === 'A') {
      setCaseAParams((prev) => ({ ...prev, [paramId]: value }));
    } else {
      setCaseBParams((prev) => ({ ...prev, [paramId]: value }));
    }
  };

  return (
    <div
      id="comparison-mode"
      className="bg-[#080808] border border-white/10 rounded-xl p-4 shadow-xl flex flex-col h-full"
    >
      {/* Header - Elegant Dark */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
            <Columns className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Case A vs Case B Comparison
            </h3>
            <p className="text-[10px] text-white/40 font-mono">
              Dual trial parameter comparison & scaling laws
            </p>
          </div>
        </div>
      </div>

      {/* Side-by-Side Dual Configuration Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-y-auto mb-3">
        {/* Case A */}
        <div className="bg-[#050505] border border-cyan-500/40 rounded-lg p-3.5 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 font-mono uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Case A (Baseline)
            </span>
            <button
              onClick={() => onApplyCaseParams('A', caseAParams)}
              className="text-[9px] uppercase font-bold px-2 py-0.5 bg-cyan-600 text-black rounded hover:bg-cyan-500 transition-colors font-mono"
            >
              Load A
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {experiment.parameters.slice(0, 4).map((param) => (
              <div key={param.id} className="space-y-1">
                <div className="flex justify-between text-[11px] text-white/70 font-mono">
                  <span>{param.name}:</span>
                  <span className="font-bold text-cyan-400">
                    {formatValue(caseAParams[param.id] ?? param.defaultValue, 2)} {param.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={caseAParams[param.id] ?? param.defaultValue}
                  onChange={(e) => handleParamChange('A', param.id, Number(e.target.value))}
                  className="w-full h-1.5 accent-cyan-500 bg-white/10 rounded-full cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Case B */}
        <div className="bg-[#050505] border border-orange-500/40 rounded-lg p-3.5 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/10">
            <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5 font-mono uppercase">
              <span className="w-2 h-2 rounded-full bg-orange-500" /> Case B (Modified)
            </span>
            <button
              onClick={() => onApplyCaseParams('B', caseBParams)}
              className="text-[9px] uppercase font-bold px-2 py-0.5 bg-orange-500 text-black rounded hover:bg-orange-400 transition-colors font-mono"
            >
              Load B
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {experiment.parameters.slice(0, 4).map((param) => (
              <div key={param.id} className="space-y-1">
                <div className="flex justify-between text-[11px] text-white/70 font-mono">
                  <span>{param.name}:</span>
                  <span className="font-bold text-orange-400">
                    {formatValue(caseBParams[param.id] ?? param.defaultValue, 2)} {param.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={caseBParams[param.id] ?? param.defaultValue}
                  onChange={(e) => handleParamChange('B', param.id, Number(e.target.value))}
                  className="w-full h-1.5 accent-orange-500 bg-white/10 rounded-full cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
