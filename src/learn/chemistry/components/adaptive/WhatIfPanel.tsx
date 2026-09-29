import React, { useState } from 'react';
import { WhatIfScenario } from '../../types/chemistry';
import { HelpCircle, ArrowRight, Sparkles, Activity, Layers } from 'lucide-react';

interface WhatIfPanelProps {
  scenarios: WhatIfScenario[];
  onApplyScenario?: (scenario: WhatIfScenario) => void;
  className?: string;
}

export const WhatIfPanel: React.FC<WhatIfPanelProps> = ({
  scenarios,
  onApplyScenario,
  className = ''
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    scenarios[0]?.id || ''
  );

  const currentScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  if (!scenarios || scenarios.length === 0) return null;

  return (
    <div
      className={`bg-[#111A2E] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 ${className}`}
      id="what-if-panel"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              "WHAT IF?" Dynamic Causality Chain
            </h3>
            <p className="text-[11px] text-slate-400">
              Select a variable change to observe the step-by-step physical and mathematical consequences.
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Selector Chips */}
      <div className="flex flex-wrap gap-2">
        {scenarios.map((sc) => (
          <button
            key={sc.id}
            onClick={() => setSelectedScenarioId(sc.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
              selectedScenarioId === sc.id
                ? 'bg-teal-600/20 border-teal-400 text-teal-300 shadow-sm'
                : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {sc.variableChanged}
          </button>
        ))}
      </div>

      {currentScenario && (
        <div className="space-y-4 pt-1">
          {/* Step-by-Step Causality Chain */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Chain of Physical Events:
            </div>
            <div className="space-y-1.5">
              {currentScenario.causalityChain.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-[#0F172A] border border-slate-800 text-xs text-slate-200"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-teal-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Model & Mathematical Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
                Governing Model:
              </span>
              <p className="text-xs text-slate-300 font-medium">{currentScenario.scientificModel}</p>
              <div className="font-mono text-[11px] text-teal-300 pt-1">
                {currentScenario.mathematicalRelationship}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                Graph Consequence:
              </span>
              <p className="text-xs text-slate-300">{currentScenario.graphConsequence}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
