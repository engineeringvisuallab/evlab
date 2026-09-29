/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Engineering Calculation Inspector UI Panel
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectState, CalculationResult } from '../types/stp';
import { Calculator, CheckCircle2, AlertTriangle, FileText, Database, Layers } from 'lucide-react';

interface CalculationsInspectorPanelProps {
  project: ProjectState;
  selectedCalcId?: string;
}

export const CalculationsInspectorPanel: React.FC<CalculationsInspectorPanelProps> = ({
  project,
  selectedCalcId,
}) => {
  const calculations = Object.values(project.calculations) as CalculationResult[];
  const [activeId, setActiveId] = useState<string>(
    selectedCalcId || (calculations.length > 0 ? calculations[0].id : '')
  );

  const activeCalc = calculations.find((c) => c.id === activeId) || calculations[0];

  return (
    <div className="p-6 space-y-6 text-slate-200">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            <span>Engineering Calculation Inspector & Formula Traceability</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Transparent breakdown of inputs, step-by-step formulas, engineering standards, and downstream BOQ/BIM linkages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Calculation List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 text-xs font-bold text-slate-300 uppercase tracking-wider">
            Calculated Engineering Parameters ({calculations.length})
          </div>
          <div className="divide-y divide-slate-800/60 font-mono text-xs max-h-[600px] overflow-y-auto">
            {calculations.map((calc) => {
              const isSelected = activeCalc?.id === calc.id;
              return (
                <div
                  key={calc.id}
                  onClick={() => setActiveId(calc.id)}
                  className={`p-3 cursor-pointer transition ${
                    isSelected ? 'bg-cyan-950/70 border-l-4 border-cyan-400 text-cyan-200' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{calc.name}</span>
                    <span className="text-[10px] bg-slate-950 text-cyan-400 px-1.5 py-0.5 rounded border border-slate-800">
                      {calc.subsystem}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="font-mono text-emerald-400 font-bold">{calc.value.toLocaleString()} {calc.unit}</span>
                    <span className="text-slate-500">{calc.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Calculation Inspector Card */}
        <div className="lg:col-span-2">
          {activeCalc ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950 border border-cyan-800 px-2.5 py-1 rounded">
                    {activeCalc.id}
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-100 mt-2">{activeCalc.name}</h3>
                  <p className="text-xs text-slate-400">Subsystem: {activeCalc.subsystem}</p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {activeCalc.value.toLocaleString()} <span className="text-sm text-slate-400">{activeCalc.unit}</span>
                  </div>
                  <span className="inline-block mt-1 bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono">
                    STATUS: {activeCalc.reviewStatus}
                  </span>
                </div>
              </div>

              {/* Main Formula Display */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Governing Equation</span>
                <code className="text-base font-mono text-cyan-300 font-bold block">{activeCalc.formulaDisplay}</code>
                <span className="text-xs text-slate-500 block">Standard: {activeCalc.standardReference}</span>
              </div>

              {/* Step-by-Step Sub-calculations */}
              {activeCalc.subSteps.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Intermediate Execution Steps</span>
                  <div className="bg-slate-950 border border-slate-800/80 rounded-xl divide-y divide-slate-800/60 font-mono text-xs">
                    {activeCalc.subSteps.map((step, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-200 block">{step.stepName}</span>
                          <span className="text-slate-500 text-[11px]">{step.formula}</span>
                        </div>
                        <span className="font-bold text-cyan-400">{step.value} {step.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Parameter Mapping */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Input Variables</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  {Object.entries(activeCalc.inputParameters).map(([paramName, val]) => (
                    <div key={paramName} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                      <span className="text-slate-500 text-[10px] block">{paramName}</span>
                      <span className="font-bold text-slate-200">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Downstream Integrations & Citations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block font-sans font-semibold mb-1">Downstream Usage</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCalc.usedByModules.map((mod) => (
                      <span key={mod} className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[10px]">
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-sans font-semibold mb-1">Assumptions & Cautions</span>
                  <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                    {activeCalc.assumptions.join(' ') || 'Standard steady-state assumptions apply.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
              <Calculator className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p>Select a calculation from the left panel to inspect step-by-step intermediate math and formulas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
