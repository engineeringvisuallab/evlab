import React, { useState } from 'react';
import { ELEMENTS } from '../../data/elements';
import { AcademicLevel } from '../../types/chemistry';
import { Atom, Plus, Minus, RotateCcw, Info, Zap, Shield, Sparkles } from 'lucide-react';
import { WhyButton } from '../common/WhyButton';

interface AtomicStructureLabProps {
  academicLevel: AcademicLevel;
}

export const AtomicStructureLab: React.FC<AtomicStructureLabProps> = ({ academicLevel }) => {
  const [protons, setProtons] = useState(6); // Carbon default
  const [neutrons, setNeutrons] = useState(6);
  const [electrons, setElectrons] = useState(6);

  // Compute element details
  const atomicNumber = protons;
  const massNumber = protons + neutrons;
  const netCharge = protons - electrons;

  const currentElement = ELEMENTS.find((e) => e.number === atomicNumber) || {
    number: atomicNumber,
    symbol: atomicNumber > 0 ? `El-${atomicNumber}` : '?',
    name: atomicNumber > 0 ? `Element ${atomicNumber}` : 'Nullium',
    atomicMass: massNumber,
    category: 'nonmetal',
    summary: 'Custom nuclear configuration.',
    electronConfiguration: 'Calculated from subatomic count',
    uses: ['Nuclear physics research']
  };

  // Electron shell distribution (Bohr Model: 2, 8, 18, 32...)
  const getShellDistribution = (totalElectrons: number): number[] => {
    const capacities = [2, 8, 18, 32, 32, 18, 8];
    const shells: number[] = [];
    let remaining = totalElectrons;

    for (const cap of capacities) {
      if (remaining <= 0) break;
      const count = Math.min(remaining, cap);
      shells.push(count);
      remaining -= count;
    }
    return shells;
  };

  const shells = getShellDistribution(electrons);

  // Stability heuristic (Neutron to proton ratio N/Z)
  const isStable =
    atomicNumber === 1
      ? neutrons === 0 || neutrons === 1 || neutrons === 2
      : neutrons >= protons * 0.9 && neutrons <= protons * 1.5;

  const handlePreset = (p: number, n: number, e: number) => {
    setProtons(p);
    setNeutrons(n);
    setElectrons(e);
  };

  return (
    <div className="space-y-6" id="atomic-structure-lab">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Atom className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Atomic Structure & Isotope Simulator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manipulate protons, neutrons, and electrons to construct atoms, ions, and isotopes across Bohr quantum shells.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1">Presets:</span>
          {[
            { name: 'Hydrogen (¹H)', p: 1, n: 0, e: 1 },
            { name: 'Deuterium (²H)', p: 1, n: 1, e: 1 },
            { name: 'Carbon-12 (¹²C)', p: 6, n: 6, e: 6 },
            { name: 'Carbon-14 (¹⁴C)', p: 6, n: 8, e: 6 },
            { name: 'Sodium Ion (Na⁺)', p: 11, n: 12, e: 10 },
            { name: 'Chloride (Cl⁻)', p: 17, n: 18, e: 18 }
          ].map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePreset(preset.p, preset.n, preset.e)}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors font-mono"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Particle Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Subatomic Particle Controls Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-5">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span>Subatomic Particles</span>
              <button
                onClick={() => handlePreset(1, 0, 1)}
                className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 normal-case"
                title="Reset to Hydrogen"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </h3>

            {/* Protons Control (Red) */}
            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                  <span className="text-xs font-semibold text-red-300">Protons (p⁺)</span>
                </div>
                <span className="text-lg font-bold font-mono text-red-400">{protons}</span>
              </div>
              <p className="text-[11px] text-slate-400">Determines the chemical element identity (Z).</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setProtons(Math.max(1, protons - 1))}
                  className="flex-1 py-1 rounded-lg bg-red-900/40 hover:bg-red-800/60 text-red-200 border border-red-800 flex items-center justify-center font-bold"
                  id="btn-dec-protons"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setProtons(Math.min(20, protons + 1))}
                  className="flex-1 py-1 rounded-lg bg-red-900/40 hover:bg-red-800/60 text-red-200 border border-red-800 flex items-center justify-center font-bold"
                  id="btn-inc-protons"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Neutrons Control (Gray/White) */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400 shadow-sm" />
                  <span className="text-xs font-semibold text-slate-300">Neutrons (n⁰)</span>
                </div>
                <span className="text-lg font-bold font-mono text-slate-200">{neutrons}</span>
              </div>
              <p className="text-[11px] text-slate-400">Controls isotope mass & nuclear stability.</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setNeutrons(Math.max(0, neutrons - 1))}
                  className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center font-bold"
                  id="btn-dec-neutrons"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setNeutrons(Math.min(25, neutrons + 1))}
                  className="flex-1 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center font-bold"
                  id="btn-inc-neutrons"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Electrons Control (Blue) */}
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                  <span className="text-xs font-semibold text-blue-300">Electrons (e⁻)</span>
                </div>
                <span className="text-lg font-bold font-mono text-blue-400">{electrons}</span>
              </div>
              <p className="text-[11px] text-slate-400">Controls net ionic charge & valence reactivity.</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setElectrons(Math.max(0, electrons - 1))}
                  className="flex-1 py-1 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-800 flex items-center justify-center font-bold"
                  id="btn-dec-electrons"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setElectrons(Math.min(20, electrons + 1))}
                  className="flex-1 py-1 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 text-blue-200 border border-blue-800 flex items-center justify-center font-bold"
                  id="btn-inc-electrons"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Electronic Configuration Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
            <span className="text-slate-400 font-medium">Bohr Shell Capacity (2n²):</span>
            <div className="flex items-center gap-2">
              {['K (n=1)', 'L (n=2)', 'M (n=3)', 'N (n=4)'].map((shellName, idx) => (
                <div key={shellName} className="flex-1 p-2 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 font-mono">{shellName}</div>
                  <div className="text-sm font-bold text-cyan-400 font-mono">
                    {shells[idx] || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column: Visual Bohr Model Canvas (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center relative overflow-hidden min-h-[420px]">
          {/* Animated Bohr Orbitals (SVG) */}
          <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              {/* Electron Shell Orbit Circles */}
              {shells.map((count, shellIdx) => {
                const radius = 55 + shellIdx * 38;
                return (
                  <g key={`shell-${shellIdx}`}>
                    {/* Orbital Track */}
                    <circle
                      cx="200"
                      cy="200"
                      r={radius}
                      fill="none"
                      stroke="#334155"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />

                    {/* Shell Label */}
                    <text
                      x={200}
                      y={200 - radius + 10}
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {['K', 'L', 'M', 'N'][shellIdx]} ({count}e⁻)
                    </text>

                    {/* Orbiting Electrons */}
                    {Array.from({ length: count }).map((_, eIdx) => {
                      const angle = (eIdx / count) * (Math.PI * 2) + (shellIdx * 0.5);
                      const ex = 200 + Math.cos(angle) * radius;
                      const ey = 200 + Math.sin(angle) * radius;
                      return (
                        <g key={`e-${shellIdx}-${eIdx}`}>
                          <circle cx={ex} cy={ey} r="5" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1.5" />
                          <circle cx={ex} cy={ey} r="7" fill="none" stroke="#60a5fa" strokeOpacity="0.4" />
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* Central Nucleus */}
              <circle cx="200" cy="200" r="32" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
              <text x="200" y="196" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                {protons} p⁺
              </text>
              <text x="200" y="210" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                {neutrons} n⁰
              </text>
            </svg>
          </div>

          {/* Quick Real-time Observation Caption */}
          <div className="mt-2 text-center text-xs text-slate-300">
            {netCharge === 0 ? (
              <span className="text-emerald-400 font-semibold">Neutral Atom (Charge = 0)</span>
            ) : netCharge > 0 ? (
              <span className="text-amber-400 font-semibold">Positive Cation (+{netCharge}) — Lost {netCharge} electron(s)</span>
            ) : (
              <span className="text-cyan-400 font-semibold">Negative Anion ({netCharge}) — Gained {Math.abs(netCharge)} electron(s)</span>
            )}
          </div>
        </div>

        {/* Right Column: Physical & Mathematical Data (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Element Identity Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nuclide Symbol</span>
              <WhyButton
                experimentName="Atomic Structure"
                observation={`Constructed element ${currentElement.name} (Z=${atomicNumber}, A=${massNumber}, Charge=${netCharge})`}
                stateContext={{ protons, neutrons, electrons, isStable, netCharge }}
              />
            </div>

            {/* Isotope Notation Box */}
            <div className="flex items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-start gap-1 font-mono">
                <div className="text-right text-xs leading-none text-slate-400 pt-0.5">
                  <div>{massNumber}</div>
                  <div className="mt-1 text-slate-500">{atomicNumber}</div>
                </div>
                <div className="text-4xl font-extrabold text-cyan-400">{currentElement.symbol}</div>
                {netCharge !== 0 && (
                  <div className="text-sm font-bold text-amber-400 leading-none">
                    {netCharge > 0 ? `+${netCharge}` : `${netCharge}`}
                  </div>
                )}
              </div>
            </div>

            {/* Element Stats */}
            <div className="space-y-2 text-xs divide-y divide-slate-800">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Name:</span>
                <strong className="text-white">{currentElement.name}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Atomic Number (Z):</span>
                <strong className="text-cyan-400 font-mono">{atomicNumber}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Mass Number (A):</span>
                <strong className="text-white font-mono">{massNumber} u</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Net Charge:</span>
                <strong className={netCharge === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                  {netCharge > 0 ? `+${netCharge}` : netCharge}
                </strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Nuclear State:</span>
                <strong className={isStable ? 'text-emerald-400' : 'text-rose-400'}>
                  {isStable ? 'Stable Isotope' : 'Radioactive / Unstable'}
                </strong>
              </div>
            </div>

            {/* Uses snippet */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
              <strong className="text-slate-200 block mb-1">Key Real-World Application:</strong>
              {currentElement.uses?.[0] || 'Fundamental scientific research & chemistry synthesis.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
