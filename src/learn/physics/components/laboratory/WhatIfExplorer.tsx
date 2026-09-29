import React from 'react';
import { Compass, Sparkles, Sliders, ArrowRight } from 'lucide-react';
import { ExperimentMetadata } from '../../types/physics';

interface WhatIfExplorerProps {
  experiment: ExperimentMetadata;
  currentParams: Record<string, number>;
  onApplyParams: (params: Record<string, number>) => void;
}

export const WhatIfExplorer: React.FC<WhatIfExplorerProps> = ({
  experiment,
  currentParams,
  onApplyParams,
}) => {
  return (
    <div
      id="what-if-explorer"
      className="bg-[#080808] border border-white/10 rounded-xl p-4 shadow-xl flex flex-col h-full"
    >
      {/* Header - Elegant Dark */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              "What-If?" Physical Scenarios
            </h3>
            <p className="text-[10px] text-white/40 font-mono">
              Extreme physical boundary conditions & environments
            </p>
          </div>
        </div>
      </div>

      {/* Preset Scenarios List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        {experiment.presetScenarios?.map((scenario, index) => {
          return (
            <div
              key={index}
              className="bg-[#050505] border border-white/10 hover:border-white/20 rounded-lg p-3.5 transition-all cursor-pointer group"
              onClick={() => onApplyParams(scenario.params)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white group-hover:text-cyan-400 flex items-center gap-1.5 font-mono uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                  {scenario.name}
                </span>
                <span className="text-[9px] text-cyan-400 font-mono flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase">
                  Load <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <p className="text-xs text-white/60 mb-2.5 leading-relaxed">{scenario.description}</p>

              {/* Parameter badges */}
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(scenario.params).map(([k, v]) => (
                  <span
                    key={k}
                    className="text-[10px] font-mono bg-[#0A0A0A] border border-white/5 px-2 py-0.5 rounded text-white/70"
                  >
                    {k}: <strong className="text-cyan-400">{v}</strong>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
