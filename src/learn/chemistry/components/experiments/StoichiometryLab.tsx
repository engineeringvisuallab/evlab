import React, { useState } from 'react';
import { AcademicLevel } from '../../types/chemistry';
import { ChemistryEngines } from '../../engines/ChemistryEngines';
import { WhyButton } from '../common/WhyButton';
import { Scale, Play, RotateCcw, AlertTriangle, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface StoichiometryLabProps {
  academicLevel: AcademicLevel;
}

interface StoichReaction {
  id: string;
  name: string;
  equation: string;
  reactants: Array<{ name: string; formula: string; coeff: number; molarMass: number; defaultGrams: number }>;
  products: Array<{ name: string; formula: string; coeff: number; molarMass: number }>;
}

const REACTIONS: StoichReaction[] = [
  {
    id: 'ammonia_synthesis',
    name: 'Haber-Bosch Ammonia Synthesis',
    equation: 'N₂ + 3 H₂ ⟶ 2 NH₃',
    reactants: [
      { name: 'Nitrogen gas', formula: 'N₂', coeff: 1, molarMass: 28.02, defaultGrams: 28.0 },
      { name: 'Hydrogen gas', formula: 'H₂', coeff: 3, molarMass: 2.02, defaultGrams: 8.0 }
    ],
    products: [{ name: 'Ammonia', formula: 'NH₃', coeff: 2, molarMass: 17.03 }]
  },
  {
    id: 'water_formation',
    name: 'Hydrogen Combustion (Water Formation)',
    equation: '2 H₂ + O₂ ⟶ 2 H₂O',
    reactants: [
      { name: 'Hydrogen gas', formula: 'H₂', coeff: 2, molarMass: 2.02, defaultGrams: 4.04 },
      { name: 'Oxygen gas', formula: 'O₂', coeff: 1, molarMass: 32.0, defaultGrams: 40.0 }
    ],
    products: [{ name: 'Water', formula: 'H₂O', coeff: 2, molarMass: 18.02 }]
  },
  {
    id: 'methane_combustion',
    name: 'Methane Complete Combustion',
    equation: 'CH₄ + 2 O₂ ⟶ CO₂ + 2 H₂O',
    reactants: [
      { name: 'Methane', formula: 'CH₄', coeff: 1, molarMass: 16.04, defaultGrams: 16.04 },
      { name: 'Oxygen', formula: 'O₂', coeff: 2, molarMass: 32.0, defaultGrams: 64.0 }
    ],
    products: [
      { name: 'Carbon Dioxide', formula: 'CO₂', coeff: 1, molarMass: 44.01 },
      { name: 'Water Vapor', formula: 'H₂O', coeff: 2, molarMass: 18.02 }
    ]
  }
];

export const StoichiometryLab: React.FC<StoichiometryLabProps> = ({ academicLevel }) => {
  const [selectedRxn, setSelectedRxn] = useState<StoichReaction>(REACTIONS[0]);
  const [masses, setMasses] = useState<number[]>([
    REACTIONS[0].reactants[0].defaultGrams,
    REACTIONS[0].reactants[1].defaultGrams
  ]);
  const [reactionProgress, setReactionProgress] = useState<number>(100); // % reacted (100 = completed)
  const [efficiencyPct, setEfficiencyPct] = useState<number>(92); // actual % yield

  // Calculate Moles of each reactant
  const moles = selectedRxn.reactants.map((r, i) => masses[i] / r.molarMass);

  // Determine limiting reagent
  const reactantData = selectedRxn.reactants.map((r, i) => ({
    name: r.name,
    moles: moles[i],
    coefficient: r.coeff,
    molarMass: r.molarMass
  }));

  const limitingInfo = ChemistryEngines.stoichiometry.findLimitingReagent(reactantData);
  const maxExtent = limitingInfo.minExtent; // moles of reaction that can occur

  // Theoretical yield of main product (g)
  const mainProduct = selectedRxn.products[0];
  const theoreticalProductMoles = maxExtent * mainProduct.coeff;
  const theoreticalProductGrams = theoreticalProductMoles * mainProduct.molarMass;
  const actualProductGrams = theoreticalProductGrams * (efficiencyPct / 100);

  // Handle mass change
  const handleMassChange = (index: number, newMass: number) => {
    const updated = [...masses];
    updated[index] = Math.max(0.1, newMass);
    setMasses(updated);
  };

  const handleSelectReaction = (rxn: StoichReaction) => {
    setSelectedRxn(rxn);
    setMasses(rxn.reactants.map((r) => r.defaultGrams));
  };

  return (
    <div className="space-y-6" id="stoichiometry-lab">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Scale className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Stoichiometry & Limiting Reagent Laboratory</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Calculate mole-to-mass conversions, identify limiting vs excess reagents, and quantify theoretical yields.
          </p>
        </div>

        {/* Reaction Selector */}
        <div className="flex items-center gap-2">
          {REACTIONS.map((rxn) => (
            <button
              key={rxn.id}
              onClick={() => handleSelectReaction(rxn)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedRxn.id === rxn.id
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {rxn.name}
            </button>
          ))}
        </div>
      </div>

      {/* Balanced Reaction Equation Banner */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between shadow-inner">
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Stoichiometric Equation</span>
          <div className="text-lg font-bold font-mono text-cyan-300 mt-0.5">{selectedRxn.equation}</div>
        </div>
        <WhyButton
          experimentName="Stoichiometry & Yield"
          observation={`Limiting reagent is ${limitingInfo.limitingName}. Theoretical yield = ${theoreticalProductGrams.toFixed(2)} g ${mainProduct.formula}`}
          stateContext={{ selectedRxn: selectedRxn.name, masses, moles, limitingInfo, theoreticalProductGrams }}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Reactants Input Stage (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reactant Masses & Moles
            </h3>

            {selectedRxn.reactants.map((reactant, idx) => {
              const isLimiting = limitingInfo.limitingIndex === idx;
              return (
                <div
                  key={reactant.formula}
                  className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                    isLimiting
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-sm text-white">{reactant.name}</span>
                      <span className="font-mono text-cyan-400 font-semibold ml-2">({reactant.formula})</span>
                    </div>
                    {isLimiting ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Limiting Reagent
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        In Excess
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Mass:</span>
                    <span className="font-mono font-bold text-white text-sm">{masses[idx].toFixed(1)} g</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="0.5"
                    value={masses[idx]}
                    onChange={(e) => handleMassChange(idx, Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
                    <span>Molar Mass: {reactant.molarMass} g/mol</span>
                    <span className="text-cyan-300 font-bold">Moles: {moles[idx].toFixed(3)} mol</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Reaction Analytics & Yield Engine (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Reaction Progress Visualizer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Reaction Extent & Mass Conversion</span>
            </h3>

            {/* Mass Flow Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400">Theoretical Yield ({mainProduct.formula}):</span>
                <div className="text-xl font-bold font-mono text-cyan-400">
                  {theoreticalProductGrams.toFixed(2)} g
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {theoreticalProductMoles.toFixed(3)} moles
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400">Actual Practical Yield ({efficiencyPct}%):</span>
                <div className="text-xl font-bold font-mono text-emerald-400">
                  {actualProductGrams.toFixed(2)} g
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Simulating standard lab losses
                </div>
              </div>
            </div>

            {/* Practical Yield Slider */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Set Laboratory % Yield:</span>
                <span className="font-mono font-bold text-white">{efficiencyPct}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={efficiencyPct}
                onChange={(e) => setEfficiencyPct(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Transparent Stoichiometric Steps Breakdown */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <strong className="text-slate-200 block text-xs">Mathematical Calculation Steps:</strong>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div>1. Moles = Mass / Molar Mass</div>
                <div>2. Mole Ratio ({selectedRxn.reactants[0].formula} : {selectedRxn.reactants[1].formula}) = {moles[0].toFixed(2)} : {moles[1].toFixed(2)}</div>
                <div>3. Max extent is constrained by <strong className="text-amber-400">{limitingInfo.limitingName}</strong> ({maxExtent.toFixed(3)} mol reactions).</div>
                <div>4. Yield = {maxExtent.toFixed(3)} mol × {mainProduct.coeff} × {mainProduct.molarMass} g/mol = <strong className="text-cyan-400">{theoreticalProductGrams.toFixed(2)} g</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
