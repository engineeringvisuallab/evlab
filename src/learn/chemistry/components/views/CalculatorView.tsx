import React, { useState } from 'react';
import { AcademicLevel } from '../../types/chemistry';
import { ChemistryEngines } from '../../engines/ChemistryEngines';
import { Calculator, Sparkles, Send, Bot, CheckCircle2, ArrowRight } from 'lucide-react';

interface CalculatorViewProps {
  academicLevel: AcademicLevel;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({ academicLevel }) => {
  const [activeTool, setActiveTool] = useState<'molarity' | 'gas_law' | 'ph' | 'nernst' | 'ai_solver'>('molarity');

  // Molarity & Dilution Tool State (C1 V1 = C2 V2)
  const [c1, setC1] = useState(1.0);
  const [v1, setV1] = useState(50.0);
  const [v2, setV2] = useState(250.0);
  const calculatedC2 = (c1 * v1) / (v2 || 1);

  // Gas Law Tool State (PV = nRT)
  const [gasP, setGasP] = useState(1.0);
  const [gasV, setGasV] = useState(22.414);
  const [gasT, setGasT] = useState(273.15);
  const calculatedMoles = (gasP * gasV) / (0.082057 * (gasT || 1));

  // pH Tool State
  const [inputH, setInputH] = useState(0.001);
  const calcPH = ChemistryEngines.acidBase.pHFromH(inputH);
  const calcPOH = 14.0 - calcPH;

  // AI Problem Solver State
  const [problemText, setProblemText] = useState('');
  const [aiSolution, setAiSolution] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSolveAIProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText.trim() || aiLoading) return;

    setAiLoading(true);
    setAiSolution(null);

    try {
      const res = await fetch('/api/gemini/problem-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: problemText.trim(),
          level: academicLevel
        })
      });
      const data = await res.json();
      setAiSolution(data.solution || 'No solution generated.');
    } catch (err) {
      setAiSolution('Unable to solve equation at this time. Please check your connection.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="calculator-view">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Calculator className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Scientific Chemistry Calculators & Solvers</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Perform precision stoichiometric, thermodynamic, electrochemical, and AI step-by-step derivations.
          </p>
        </div>

        {/* Tool Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {[
            { id: 'molarity', label: 'Dilution (C₁V₁ = C₂V₂)' },
            { id: 'gas_law', label: 'Gas Law (PV = nRT)' },
            { id: 'ph', label: 'pH / pOH / [H⁺]' },
            { id: 'ai_solver', label: 'AI Step-by-Step Solver' }
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTool === tool.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tool Body */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        {/* Tool 1: Dilution */}
        {activeTool === 'molarity' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-base font-bold text-white">Solution Dilution Calculator (C₁V₁ = C₂V₂)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Stock Concentration (C₁):</label>
                <input
                  type="number"
                  step="0.1"
                  value={c1}
                  onChange={(e) => setC1(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Stock Volume (V₁ in mL):</label>
                <input
                  type="number"
                  step="1"
                  value={v1}
                  onChange={(e) => setV1(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Final Volume (V₂ in mL):</label>
                <input
                  type="number"
                  step="1"
                  value={v2}
                  onChange={(e) => setV2(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Calculated Final Concentration (C₂):</span>
              <div className="text-2xl font-black font-mono text-cyan-400">
                {calculatedC2.toFixed(4)} M
              </div>
            </div>
          </div>
        )}

        {/* Tool 2: Gas Law */}
        {activeTool === 'gas_law' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-base font-bold text-white">Ideal Gas Solver (PV = nRT)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Pressure (P in atm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={gasP}
                  onChange={(e) => setGasP(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Volume (V in L):</label>
                <input
                  type="number"
                  step="0.5"
                  value={gasV}
                  onChange={(e) => setGasV(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Temperature (T in K):</label>
                <input
                  type="number"
                  step="1"
                  value={gasT}
                  onChange={(e) => setGasT(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400">Calculated Moles (n):</span>
              <div className="text-2xl font-black font-mono text-cyan-400">
                {calculatedMoles.toFixed(4)} mol
              </div>
            </div>
          </div>
        )}

        {/* Tool 3: pH / pOH */}
        {activeTool === 'ph' && (
          <div className="space-y-6 max-w-2xl">
            <h3 className="text-base font-bold text-white">pH & pOH Logarithmic Solver</h3>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Hydrogen Ion Concentration [H⁺] (M):</label>
              <input
                type="number"
                step="0.0001"
                value={inputH}
                onChange={(e) => setInputH(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">pH (-log[H⁺]):</span>
                <div className="text-2xl font-black font-mono text-cyan-400 mt-1">{calcPH.toFixed(3)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">pOH (14 - pH):</span>
                <div className="text-2xl font-black font-mono text-amber-400 mt-1">{calcPOH.toFixed(3)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tool 4: AI Step-by-Step Solver */}
        {activeTool === 'ai_solver' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Step-by-Step Chemistry Problem Solver</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter any textbook numerical or reaction problem for full transparent mathematical derivation.
              </p>
            </div>

            <form onSubmit={handleSolveAIProblem} className="space-y-3">
              <textarea
                rows={3}
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="Example: How many grams of Al2O3 are formed when 54.0 g of Al reacts with excess oxygen?"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all resize-none"
              />
              <button
                type="submit"
                disabled={!problemText.trim() || aiLoading}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                <span>{aiLoading ? 'Deriving Solution...' : 'Solve Problem Step-by-Step'}</span>
              </button>
            </form>

            {aiSolution && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step-by-Step Solution</h4>
                <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-mono">
                  {aiSolution}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
