import React, { useState } from 'react';
import { AcademicLevel } from '../../types/chemistry';
import { ChemistryEngines } from '../../engines/ChemistryEngines';
import { WhyButton } from '../common/WhyButton';
import { BatteryCharging, Zap, RotateCcw, Activity, ArrowRight } from 'lucide-react';

interface ElectrochemistryLabProps {
  academicLevel: AcademicLevel;
}

export const ElectrochemistryLab: React.FC<ElectrochemistryLabProps> = ({ academicLevel }) => {
  // Daniell Cell: Zn (s) + Cu2+ (aq) -> Zn2+ (aq) + Cu (s)
  const [znConc, setZnConc] = useState<number>(0.1); // M [Zn2+]
  const [cuConc, setCuConc] = useState<number>(1.0); // M [Cu2+]
  const [temperatureK, setTemperatureK] = useState<number>(298.15); // 25°C

  // Standard Potentials
  const E_std_cathode = 0.34; // Cu2+ / Cu
  const E_std_anode = -0.76; // Zn2+ / Zn
  const E_std_cell = E_std_cathode - E_std_anode; // +1.10 V
  const n_electrons = 2;

  // Reaction quotient Q = [Zn2+] / [Cu2+]
  const Q = znConc / cuConc;

  // Calculate live cell potential via Nernst Equation
  const cellEMF = ChemistryEngines.electrochemistry.calculateNernstPotential(
    E_std_cell,
    n_electrons,
    Q,
    temperatureK
  );

  const deltaG_kJ = ChemistryEngines.electrochemistry.calculateGibbsFreeEnergy(n_electrons, cellEMF);

  return (
    <div className="space-y-6" id="electrochemistry-lab">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <BatteryCharging className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Galvanic Cell & Nernst Equation Simulator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Observe spontaneous electron transfer in the Daniell Cell, salt bridge ion migration, and compute non-standard EMF via Nernst equation.
          </p>
        </div>

        {/* Digital Voltmeter */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-950 border border-cyan-900/60 flex items-center gap-3 shadow-inner">
            <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
            <div>
              <div className="text-[10px] text-slate-400 font-mono">Cell EMF (E_cell)</div>
              <div className="text-2xl font-black font-mono text-cyan-300">
                {cellEMF.toFixed(3)} V
              </div>
            </div>
          </div>
          <WhyButton
            experimentName="Galvanic Cell & EMF"
            observation={`Daniell Cell EMF = +${cellEMF.toFixed(3)} V at [Zn2+]=${znConc}M and [Cu2+]=${cuConc}M (ΔG° = ${deltaG_kJ.toFixed(1)} kJ/mol)`}
            stateContext={{ znConc, cuConc, E_std_cell, cellEMF, deltaG_kJ, Q }}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Half-Cell Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Half-Cell Electrolytes
            </h3>

            {/* Anode Zn2+ slider */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-bold text-amber-400">
                  Anode [Zn²⁺] (Oxidation):
                </span>
                <span className="font-mono font-bold text-white text-sm">{znConc.toFixed(3)} M</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="2.0"
                step="0.01"
                value={znConc}
                onChange={(e) => setZnConc(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400 font-mono">
                Zn (s) ⟶ Zn²⁺ (aq) + 2e⁻ (E° = -0.76 V)
              </div>
            </div>

            {/* Cathode Cu2+ slider */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-bold text-cyan-400">
                  Cathode [Cu²⁺] (Reduction):
                </span>
                <span className="font-mono font-bold text-white text-sm">{cuConc.toFixed(3)} M</span>
              </div>
              <input
                type="range"
                min="0.001"
                max="2.0"
                step="0.01"
                value={cuConc}
                onChange={(e) => setCuConc(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="text-[10px] text-slate-400 font-mono">
                Cu²⁺ (aq) + 2e⁻ ⟶ Cu (s) (E° = +0.34 V)
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setZnConc(1.0);
                setCuConc(1.0);
              }}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset to Standard State (1.0 M)
            </button>
          </div>
        </div>

        {/* Center Column: Animated Daniell Cell Apparatus (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col items-center justify-between min-h-[380px]">
          <div className="w-full text-xs font-bold text-white mb-2 flex items-center justify-between">
            <span>Galvanic Daniell Cell Apparatus</span>
            <span className="text-cyan-400 font-mono">Spontaneous Reaction (ΔG &lt; 0)</span>
          </div>

          {/* SVG Vector Electrochemical Apparatus */}
          <div className="relative w-full max-w-[360px] h-[260px]">
            <svg viewBox="0 0 360 260" className="w-full h-full">
              {/* External Wire & Voltmeter */}
              <path d="M 75 80 L 75 30 L 160 30" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
              <path d="M 200 30 L 285 30 L 285 80" fill="none" stroke="#94a3b8" strokeWidth="2.5" />

              {/* Voltmeter Meter Box */}
              <rect x="160" y="15" width="40" height="30" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="180" y="34" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {cellEMF.toFixed(2)}V
              </text>

              {/* Animated Electrons in Wire */}
              <circle cx="110" cy="30" r="3" fill="#facc15" className="animate-ping" />
              <circle cx="250" cy="30" r="3" fill="#facc15" className="animate-ping" />

              {/* Left Beaker (Anode - Zinc in ZnSO4) */}
              <rect x="40" y="80" width="80" height="120" rx="3" fill="rgba(245, 158, 11, 0.15)" stroke="#64748b" strokeWidth="1.5" />
              {/* Zinc Electrode Bar */}
              <rect x="68" y="55" width="16" height="110" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" rx="1" />
              <text x="76" y="180" fill="#f59e0b" fontSize="9" textAnchor="middle" fontWeight="bold">Zn Anode (-)</text>

              {/* Right Beaker (Cathode - Copper in CuSO4) */}
              <rect x="240" y="80" width="80" height="120" rx="3" fill="rgba(6, 182, 212, 0.25)" stroke="#64748b" strokeWidth="1.5" />
              {/* Copper Electrode Bar */}
              <rect x="272" y="55" width="16" height="110" fill="#b45309" stroke="#d97706" strokeWidth="1" rx="1" />
              <text x="280" y="180" fill="#38bdf8" fontSize="9" textAnchor="middle" fontWeight="bold">Cu Cathode (+)</text>

              {/* Inverted U-Tube Salt Bridge (KNO3) */}
              <path
                d="M 100 120 L 100 70 Q 100 60 110 60 L 250 60 Q 260 60 260 70 L 260 120"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <text x="180" y="76" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">
                Salt Bridge (KNO₃)
              </text>
            </svg>
          </div>

          <div className="w-full text-center text-xs text-slate-400 font-mono">
            Electron flow: <strong className="text-amber-400">Zn (Anode) ⟶ Cu (Cathode)</strong> through external wire.
          </div>
        </div>

        {/* Right Column: Nernst Equation & Thermodynamics (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3 text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider text-xs">
              Nernst Derivation
            </h3>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono space-y-1">
              <div className="text-slate-400">Nernst Equation (at 25°C):</div>
              <div className="text-cyan-300 font-bold">
                E = E° - (0.0592 / n) · log(Q)
              </div>
            </div>

            <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span>E°_cell (Standard):</span>
                <strong className="text-white">+1.100 V</strong>
              </div>
              <div className="flex justify-between">
                <span>Reaction Quotient (Q):</span>
                <strong className="text-cyan-400">{Q.toFixed(3)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Electrons transferred (n):</span>
                <strong className="text-white">2 e⁻</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span>Gibbs Free Energy (ΔG):</span>
                <strong className="text-emerald-400">{deltaG_kJ.toFixed(1)} kJ/mol</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
