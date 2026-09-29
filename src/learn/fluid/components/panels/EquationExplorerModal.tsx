/**
 * EVLab Equation Explorer & Theory Bank Modal
 */

import React, { useState, useMemo } from 'react';
import { EQUATION_REGISTRY, EquationDefinition } from '../../core/equationRegistry';
import { X, Search, BookOpen, Layers, CheckCircle2, ChevronRight } from 'lucide-react';

interface EquationExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEquation?: (eq: EquationDefinition) => void;
}

export const EquationExplorerModal: React.FC<EquationExplorerModalProps> = ({
  isOpen,
  onClose,
  onSelectEquation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeEqId, setActiveEqId] = useState<string>(EQUATION_REGISTRY[0]?.id || '');

  const categories = ['All', 'Kinematics', 'Energy', 'Pipe Flow', 'Open Channel', 'Flow Measurement', 'Turbomachinery', 'Dimensionless'];

  const filteredEquations = useMemo(() => {
    return EQUATION_REGISTRY.filter((eq) => {
      const matchCat = selectedCategory === 'All' || eq.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchQuery =
        eq.name.toLowerCase().includes(q) ||
        eq.formula.toLowerCase().includes(q) ||
        eq.description.toLowerCase().includes(q) ||
        eq.variables.some((v) => v.name.toLowerCase().includes(q) || v.symbol.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [searchQuery, selectedCategory]);

  const activeEquation = useMemo(() => {
    return EQUATION_REGISTRY.find((e) => e.id === activeEqId) || filteredEquations[0] || EQUATION_REGISTRY[0];
  }, [activeEqId, filteredEquations]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-sky-950 text-sky-400 border border-sky-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Fluid Mechanics Equation Explorer</h3>
              <p className="text-xs text-slate-400">Complete catalog of governing formulas, variables, SI/US units, and applicability boundaries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Search & Filters */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search equations, symbols (Q, hf, Re), keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-750 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-sky-500 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body: Left List, Right Detail */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Equation Cards List */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-4 space-y-2 bg-slate-950/30">
            {filteredEquations.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">No equations match your search query.</div>
            ) : (
              filteredEquations.map((eq) => {
                const isSelected = eq.id === activeEquation?.id;
                return (
                  <div
                    key={eq.id}
                    onClick={() => setActiveEqId(eq.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-sky-950/40 border-sky-500/80 shadow-md ring-1 ring-sky-500/20'
                        : 'bg-slate-900 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {eq.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{eq.id}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 mb-1">{eq.name}</div>
                    <div className="font-mono text-[11px] text-sky-400 bg-slate-950 px-2 py-1 rounded border border-slate-850 truncate">
                      {eq.formula}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Equation Detailed Breakdown */}
          {activeEquation ? (
            <div className="md:col-span-7 overflow-y-auto p-6 space-y-5 bg-slate-900">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 text-xs font-mono rounded bg-sky-950 text-sky-400 border border-sky-800">
                    {activeEquation.id} • {activeEquation.category}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-100 mt-2">{activeEquation.name}</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{activeEquation.description}</p>
              </div>

              {/* Formula Display Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 font-mono">Governing Formula</div>
                <div className="font-mono text-sm sm:text-base font-semibold text-sky-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 overflow-x-auto">
                  {activeEquation.latex}
                </div>
              </div>

              {/* Variables Dictionary Table */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Variables & Dimensional Units</h4>
                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                      <tr>
                        <th className="p-2">Symbol</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2">SI Unit</th>
                        <th className="p-2">US Customary</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {activeEquation.variables.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-850/50">
                          <td className="p-2 font-mono font-bold text-sky-400">{v.symbol}</td>
                          <td className="p-2 font-medium">{v.name}</td>
                          <td className="p-2 font-mono text-emerald-400">{v.siUnit}</td>
                          <td className="p-2 font-mono text-amber-400">{v.usUnit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Assumptions & Validity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="font-semibold text-slate-200 mb-1">Theoretical Assumptions</div>
                  <ul className="list-disc list-inside text-slate-400 space-y-1">
                    {activeEquation.assumptions.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="font-semibold text-slate-200 mb-1">Applicable Engineering Range</div>
                  <p className="text-slate-400 leading-relaxed">{activeEquation.applicableRange}</p>
                </div>
              </div>

              {/* Engineering Significance & Benchmark Problem */}
              <div className="bg-slate-950/80 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-sky-400">Engineering Significance: </span>
                  <span className="text-slate-300 leading-relaxed">{activeEquation.engineeringSignificance}</span>
                </div>
                <div className="pt-2 border-t border-slate-800/60">
                  <span className="font-semibold text-amber-400">Textbook Benchmark Example: </span>
                  <span className="text-slate-400 leading-relaxed">{activeEquation.exampleProblem}</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
