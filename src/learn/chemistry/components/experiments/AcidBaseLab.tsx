import React, { useState } from 'react';
import { AcademicLevel } from '../../types/chemistry';
import { ChemistryEngines } from '../../engines/ChemistryEngines';
import { ParticleCanvas } from '../common/ParticleCanvas';
import { WhyButton } from '../common/WhyButton';
import { Droplets, Sparkles, Plus, Minus, RotateCcw, ShieldCheck } from 'lucide-react';

interface AcidBaseLabProps {
  academicLevel: AcademicLevel;
}

interface SolutionOption {
  id: string;
  name: string;
  formula: string;
  type: 'strong_acid' | 'weak_acid' | 'strong_base' | 'weak_base' | 'buffer';
  ka_kb?: number;
  pKa?: number;
  description: string;
}

const SOLUTIONS: SolutionOption[] = [
  { id: 'hcl', name: 'Hydrochloric Acid', formula: 'HCl', type: 'strong_acid', description: 'Strong monoprotic acid, 100% dissociated in aqueous solution.' },
  { id: 'ch3cooh', name: 'Acetic Acid (Vinegar)', formula: 'CH₃COOH', type: 'weak_acid', ka_kb: 1.8e-5, pKa: 4.76, description: 'Weak organic acid with dynamic dissociation equilibrium.' },
  { id: 'naoh', name: 'Sodium Hydroxide', formula: 'NaOH', type: 'strong_base', description: 'Strong alkaline base yielding stoichiometric OH⁻ ions.' },
  { id: 'nh3', name: 'Ammonia', formula: 'NH₃', type: 'weak_base', ka_kb: 1.8e-5, description: 'Weak base accepting protons from water to form NH₄⁺ and OH⁻.' },
  { id: 'acetate_buffer', name: 'Acetate Buffer System', formula: 'CH₃COOH / CH₃COONa', type: 'buffer', pKa: 4.76, description: 'Resists pH changes when small amounts of acid or base are introduced.' }
];

export const AcidBaseLab: React.FC<AcidBaseLabProps> = ({ academicLevel }) => {
  const [selectedSolution, setSelectedSolution] = useState<SolutionOption>(SOLUTIONS[0]);
  const [concentration, setConcentration] = useState<number>(0.1); // Molar
  const [bufferSaltConc, setBufferSaltConc] = useState<number>(0.1); // Molar for buffer
  const [addedAcidDrops, setAddedAcidDrops] = useState<number>(0);
  const [addedBaseDrops, setAddedBaseDrops] = useState<number>(0);

  // Compute pH
  let pH = 7.0;
  let percentDissociated = 100;
  let hConc = 1e-7;
  let ohConc = 1e-7;

  if (selectedSolution.type === 'strong_acid') {
    hConc = concentration;
    pH = ChemistryEngines.acidBase.pHFromH(hConc);
    ohConc = 1e-14 / hConc;
    percentDissociated = 100;
  } else if (selectedSolution.type === 'weak_acid') {
    const res = ChemistryEngines.acidBase.weakAcidPH(concentration, selectedSolution.ka_kb || 1.8e-5);
    pH = res.pH;
    hConc = res.hConc;
    ohConc = 1e-14 / hConc;
    percentDissociated = res.percentDissociated;
  } else if (selectedSolution.type === 'strong_base') {
    ohConc = concentration;
    const pOH = ChemistryEngines.acidBase.pHFromH(ohConc);
    pH = 14.0 - pOH;
    hConc = 1e-14 / ohConc;
    percentDissociated = 100;
  } else if (selectedSolution.type === 'weak_base') {
    const res = ChemistryEngines.acidBase.weakAcidPH(concentration, selectedSolution.ka_kb || 1.8e-5);
    const pOH = res.pH;
    pH = 14.0 - pOH;
    ohConc = res.hConc;
    hConc = 1e-14 / ohConc;
    percentDissociated = res.percentDissociated;
  } else if (selectedSolution.type === 'buffer') {
    // Henderson-Hasselbalch with stress additions
    const effAcid = concentration + addedAcidDrops * 0.005 - addedBaseDrops * 0.005;
    const effSalt = bufferSaltConc - addedAcidDrops * 0.005 + addedBaseDrops * 0.005;
    pH = ChemistryEngines.acidBase.bufferPH(selectedSolution.pKa || 4.76, Math.max(0.001, effSalt), Math.max(0.001, effAcid));
    hConc = Math.pow(10, -pH);
    ohConc = 1e-14 / hConc;
  }

  pH = Math.max(0, Math.min(14, pH));

  // Determine solution liquid color from pH scale
  const getPHColor = (val: number): string => {
    if (val < 3) return '#ef4444'; // Red strong acid
    if (val < 6) return '#f97316'; // Orange weak acid
    if (val <= 8) return '#10b981'; // Green neutral
    if (val < 11) return '#06b6d4'; // Cyan weak base
    return '#8b5cf6'; // Violet strong base
  };

  return (
    <div className="space-y-6" id="acid-base-lab">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Droplets className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Acid-Base Dynamics & pH Scale Simulator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyze strong/weak electrolytes, Ka equilibrium, auto-ionization of water, and buffer resistance.
          </p>
        </div>

        {/* Live pH Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3 shadow-inner">
            <div
              className="w-4 h-10 rounded-full shadow-md"
              style={{ backgroundColor: getPHColor(pH) }}
            />
            <div>
              <div className="text-[10px] text-slate-400 font-mono">Solution pH</div>
              <div className="text-2xl font-black font-mono" style={{ color: getPHColor(pH) }}>
                {pH.toFixed(2)}
              </div>
            </div>
          </div>

          <WhyButton
            experimentName="Acid-Base Dissociation"
            observation={`${selectedSolution.name} at ${concentration} M has pH = ${pH.toFixed(2)} ([H+] = ${hConc.toExponential(2)} M)`}
            stateContext={{ solution: selectedSolution.name, concentration, pH, percentDissociated, hConc, ohConc }}
          />
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Solution Selector & Concentration Slider (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Chemical Reagent
            </h3>

            {/* Solution Selector Buttons */}
            <div className="space-y-2">
              {SOLUTIONS.map((sol) => (
                <button
                  key={sol.id}
                  onClick={() => {
                    setSelectedSolution(sol);
                    setAddedAcidDrops(0);
                    setAddedBaseDrops(0);
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedSolution.id === sol.id
                      ? 'bg-cyan-950/40 border-cyan-500/80 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{sol.name}</span>
                    <span className="font-mono text-cyan-400 font-semibold">{sol.formula}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 capitalize">
                    {sol.type.replace('_', ' ')}
                  </div>
                </button>
              ))}
            </div>

            {/* Concentration Slider */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Initial Concentration (C):</span>
                <span className="font-mono font-bold text-cyan-400">{concentration.toFixed(3)} M</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="1.0"
                step="0.01"
                value={concentration}
                onChange={(e) => setConcentration(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
                id="slider-acid-conc"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.001 M (Dilute)</span>
                <span>0.1 M</span>
                <span>1.0 M (Concentrated)</span>
              </div>
            </div>

            {/* Buffer Stress Testing Controls (if buffer selected) */}
            {selectedSolution.type === 'buffer' && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Buffer Resilience Stress Test:
                </span>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setAddedAcidDrops((p) => p + 1)}
                    className="flex-1 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-800 text-xs font-medium"
                  >
                    + Add Strong Acid HCl
                  </button>
                  <button
                    onClick={() => setAddedBaseDrops((p) => p + 1)}
                    className="flex-1 py-1.5 rounded-lg bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-800 text-xs font-medium"
                  >
                    + Add Strong Base NaOH
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Visual Particle Solvation (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">Aqueous Ion Solvation Simulation</span>
            <span className="text-xs text-slate-400 font-mono">
              Dissociation: <strong className="text-cyan-400">{percentDissociated.toFixed(1)}%</strong>
            </span>
          </div>

          {/* Solvated Particles Canvas */}
          <ParticleCanvas
            particleCount={Math.floor(concentration * 40) + 15}
            particleType="ions"
            height={260}
          />

          {/* Mathematical Derivations */}
          <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Hydronium [H⁺]:</span>
              <strong className="text-red-400 font-mono">{hConc.toExponential(3)} M</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Hydroxide [OH⁻]:</span>
              <strong className="text-blue-400 font-mono">{ohConc.toExponential(3)} M</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ion Product (Kw):</span>
              <strong className="text-slate-300 font-mono">1.00 × 10⁻¹⁴</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Full pH Spectrum Bar (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Universal pH Scale
          </h3>

          {/* Vertical pH Scale Ruler */}
          <div className="relative flex-1 min-h-[300px] flex items-center justify-center my-2">
            <div className="w-6 h-full rounded-full bg-gradient-to-b from-red-600 via-yellow-400 via-green-500 via-cyan-400 to-purple-700 shadow-inner flex flex-col justify-between py-2 items-center" />

            {/* Current Indicator Marker */}
            <div
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 transition-all duration-300"
              style={{ top: `${(pH / 14) * 90}%` }}
            >
              <div className="w-14 h-6 rounded-lg bg-slate-950 border border-white text-white text-xs font-bold font-mono flex items-center justify-center shadow-lg">
                pH {pH.toFixed(1)}
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center mt-2">
            {pH < 7 ? 'Acidic Solution' : pH === 7 ? 'Neutral' : 'Alkaline / Basic Solution'}
          </div>
        </div>
      </div>
    </div>
  );
};
