import React, { useState } from 'react';
import { AcademicLevel } from '../../types/chemistry';
import { WhyButton } from '../common/WhyButton';
import { Scale, CheckCircle2, AlertCircle, Sparkles, Plus, Minus, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EquationBalancerLabProps {
  academicLevel: AcademicLevel;
}

interface BalancingChallenge {
  id: string;
  name: string;
  reactants: Array<{ formula: string; atoms: Record<string, number> }>;
  products: Array<{ formula: string; atoms: Record<string, number> }>;
  correctCoeffs: { reactants: number[]; products: number[] };
}

const EQUATIONS: BalancingChallenge[] = [
  {
    id: 'combustion_propane',
    name: 'Combustion of Propane',
    reactants: [
      { formula: 'C₃H₈', atoms: { C: 3, H: 8 } },
      { formula: 'O₂', atoms: { O: 2 } }
    ],
    products: [
      { formula: 'CO₂', atoms: { C: 1, O: 2 } },
      { formula: 'H₂O', atoms: { H: 2, O: 1 } }
    ],
    correctCoeffs: { reactants: [1, 5], products: [3, 4] }
  },
  {
    id: 'haber_ammonia',
    name: 'Ammonia Synthesis',
    reactants: [
      { formula: 'N₂', atoms: { N: 2 } },
      { formula: 'H₂', atoms: { H: 2 } }
    ],
    products: [{ formula: 'NH₃', atoms: { N: 1, H: 3 } }],
    correctCoeffs: { reactants: [1, 3], products: [2] }
  },
  {
    id: 'photosynthesis',
    name: 'Photosynthesis Reaction',
    reactants: [
      { formula: 'CO₂', atoms: { C: 1, O: 2 } },
      { formula: 'H₂O', atoms: { H: 2, O: 1 } }
    ],
    products: [
      { formula: 'C₆H₁₂O₆', atoms: { C: 6, H: 12, O: 6 } },
      { formula: 'O₂', atoms: { O: 2 } }
    ],
    correctCoeffs: { reactants: [6, 6], products: [1, 6] }
  },
  {
    id: 'rusting_iron',
    name: 'Oxidation of Iron (Rusting)',
    reactants: [
      { formula: 'Fe', atoms: { Fe: 1 } },
      { formula: 'O₂', atoms: { O: 2 } }
    ],
    products: [{ formula: 'Fe₂O₃', atoms: { Fe: 2, O: 3 } }],
    correctCoeffs: { reactants: [4, 3], products: [2] }
  }
];

export const EquationBalancerLab: React.FC<EquationBalancerLabProps> = ({ academicLevel }) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const challenge = EQUATIONS[currentIdx];

  const [reactCoeffs, setReactCoeffs] = useState<number[]>(challenge.reactants.map(() => 1));
  const [prodCoeffs, setProdCoeffs] = useState<number[]>(challenge.products.map(() => 1));

  // Count atoms on reactant side and product side
  const allElements = Array.from(
    new Set([
      ...challenge.reactants.flatMap((r) => Object.keys(r.atoms)),
      ...challenge.products.flatMap((p) => Object.keys(p.atoms))
    ])
  );

  const reactantAtomCounts: Record<string, number> = {};
  const productAtomCounts: Record<string, number> = {};

  allElements.forEach((el) => {
    reactantAtomCounts[el] = challenge.reactants.reduce((sum, r, i) => sum + (r.atoms[el] || 0) * reactCoeffs[i], 0);
    productAtomCounts[el] = challenge.products.reduce((sum, p, i) => sum + (p.atoms[el] || 0) * prodCoeffs[i], 0);
  });

  const isBalanced = allElements.every((el) => reactantAtomCounts[el] === productAtomCounts[el]);

  const handleSelectChallenge = (idx: number) => {
    setCurrentIdx(idx);
    setReactCoeffs(EQUATIONS[idx].reactants.map(() => 1));
    setProdCoeffs(EQUATIONS[idx].products.map(() => 1));
  };

  const handleCheck = () => {
    if (isBalanced) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="space-y-6" id="equation-balancer-lab">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Scale className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Chemical Equation Balancer & Conservation Law</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Adjust stoichiometric coefficients and monitor element atom counters to satisfy the Law of Conservation of Mass.
          </p>
        </div>

        {/* Challenge Switcher */}
        <div className="flex flex-wrap items-center gap-1.5">
          {EQUATIONS.map((eq, i) => (
            <button
              key={eq.id}
              onClick={() => handleSelectChallenge(i)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                currentIdx === i
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {eq.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Equation Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Stoichiometric Equation Stepper
          </span>
          <div className="flex items-center gap-2">
            {isBalanced ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-700 flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-4 h-4" /> Balanced & Conserved!
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Unbalanced Reaction
              </span>
            )}
            <WhyButton
              experimentName="Equation Balancing"
              observation={`${challenge.name}: Reactant atoms [${Object.entries(reactantAtomCounts).map(([k, v]) => `${k}:${v}`).join(', ')}] vs Products [${Object.entries(productAtomCounts).map(([k, v]) => `${k}:${v}`).join(', ')}]`}
              stateContext={{ challenge: challenge.name, isBalanced, reactantAtomCounts, productAtomCounts }}
            />
          </div>
        </div>

        {/* Interactive Steppers Layout */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-4 text-center">
          {/* Reactants */}
          <div className="flex flex-wrap items-center gap-3">
            {challenge.reactants.map((r, i) => (
              <div key={`r-${i}`} className="flex items-center gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      const updated = [...reactCoeffs];
                      updated[i] = Math.min(12, updated[i] + 1);
                      setReactCoeffs(updated);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-cyan-400 text-base">{reactCoeffs[i]}</span>
                  <button
                    onClick={() => {
                      const updated = [...reactCoeffs];
                      updated[i] = Math.max(1, updated[i] - 1);
                      setReactCoeffs(updated);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="font-bold text-xl text-white font-mono">{r.formula}</span>
                {i < challenge.reactants.length - 1 && (
                  <span className="text-xl text-slate-500 font-bold ml-1">+</span>
                )}
              </div>
            ))}
          </div>

          {/* Reaction Arrow */}
          <div className="text-2xl text-cyan-400 font-bold px-2">⟶</div>

          {/* Products */}
          <div className="flex flex-wrap items-center gap-3">
            {challenge.products.map((p, i) => (
              <div key={`p-${i}`} className="flex items-center gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      const updated = [...prodCoeffs];
                      updated[i] = Math.min(12, updated[i] + 1);
                      setProdCoeffs(updated);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-emerald-400 text-base">{prodCoeffs[i]}</span>
                  <button
                    onClick={() => {
                      const updated = [...prodCoeffs];
                      updated[i] = Math.max(1, updated[i] - 1);
                      setProdCoeffs(updated);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="font-bold text-xl text-white font-mono">{p.formula}</span>
                {i < challenge.products.length - 1 && (
                  <span className="text-xl text-slate-500 font-bold ml-1">+</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Atom Conservation Grid */}
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Atomic Conservation Balance Sheet
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {allElements.map((el) => {
              const rCount = reactantAtomCounts[el];
              const pCount = productAtomCounts[el];
              const match = rCount === pCount;

              return (
                <div
                  key={el}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                    match
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <span className="font-bold text-sm text-white">{el}</span>
                  <div className="flex items-center gap-2 font-bold">
                    <span>{rCount}</span>
                    <span>{match ? '=' : '≠'}</span>
                    <span>{pCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
