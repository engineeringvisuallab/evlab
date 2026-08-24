import React, { useState } from 'react';
import { AcademicLevel } from '../../types/chemistry';
import { ChemistryEngines } from '../../engines/ChemistryEngines';
import { WhyButton } from '../common/WhyButton';
import { Repeat, Flame, Snowflake, ArrowRight, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';

interface EquilibriumLabProps {
  academicLevel: AcademicLevel;
}

export const EquilibriumLab: React.FC<EquilibriumLabProps> = ({ academicLevel }) => {
  // Reaction: N2 + 3 H2 <=> 2 NH3  (ΔH = -92.2 kJ/mol, Exothermic)
  const [concN2, setConcN2] = useState<number>(1.0);
  const [concH2, setConcH2] = useState<number>(3.0);
  const [concNH3, setConcNH3] = useState<number>(2.0);
  const [tempK, setTempK] = useState<number>(450); // 450 K
  const [volumeL, setVolumeL] = useState<number>(1.0);

  // Equilibrium constant Kc at 450 K ~ 0.5
  const baseKc = 0.5;
  // van 't Hoff temperature dependence: Exothermic reaction -> higher T shifts left (Kc decreases)
  const deltaH_kJ = -92.2;
  const currentKc = ChemistryEngines.equilibrium.calculateKAtTemperature(baseKc, 450, tempK, deltaH_kJ);

  // Calculate Reaction Quotient Q = [NH3]^2 / ([N2] * [H2]^3)
  const effN2 = concN2 / volumeL;
  const effH2 = concH2 / volumeL;
  const effNH3 = concNH3 / volumeL;

  const currentQ = Math.pow(effNH3, 2) / (effN2 * Math.pow(effH2, 3));

  // Equilibrium shift direction
  let shiftDirection: 'forward' | 'reverse' | 'equilibrium' = 'equilibrium';
  if (currentQ < currentKc * 0.9) shiftDirection = 'forward';
  else if (currentQ > currentKc * 1.1) shiftDirection = 'reverse';

  // Apply Stress Handlers
  const handleAddN2 = () => setConcN2((p) => p + 1.0);
  const handleAddH2 = () => setConcH2((p) => p + 2.0);
  const handleAddNH3 = () => setConcNH3((p) => p + 2.0);
  const handleRemoveNH3 = () => setConcNH3((p) => Math.max(0.1, p - 1.0));

  const handleCompress = () => setVolumeL((p) => Math.max(0.5, p * 0.7));
  const handleExpand = () => setVolumeL((p) => Math.min(2.5, p * 1.3));

  const handleHeat = () => setTempK((p) => Math.min(700, p + 50));
  const handleCool = () => setTempK((p) => Math.max(300, p - 50));

  const handleReset = () => {
    setConcN2(1.0);
    setConcH2(3.0);
    setConcNH3(2.0);
    setTempK(450);
    setVolumeL(1.0);
  };

  return (
    <div className="space-y-6" id="equilibrium-lab">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Repeat className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Dynamic Equilibrium & Le Chatelier Simulator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Apply external stresses (concentration spikes, temperature, pressure changes) and observe spontaneous equilibrium shifts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs">
            <div className="text-[10px] text-slate-400">Equilibrium Constant (Kc)</div>
            <div className="text-base font-bold text-cyan-400">{currentKc.toFixed(3)}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs">
            <div className="text-[10px] text-slate-400">Reaction Quotient (Qc)</div>
            <div className="text-base font-bold text-white">{currentQ.toFixed(3)}</div>
          </div>
          <WhyButton
            experimentName="Chemical Equilibrium"
            observation={`At T=${tempK}K, V=${volumeL.toFixed(1)}L: Qc=${currentQ.toFixed(3)} vs Kc=${currentKc.toFixed(3)} -> Shift ${shiftDirection.toUpperCase()}`}
            stateContext={{ concN2, concH2, concNH3, tempK, volumeL, currentQ, currentKc, shiftDirection }}
          />
        </div>
      </div>

      {/* Balanced Reaction Equation with Le Chatelier Shift Indicator */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-inner">
        <div>
          <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Haber Equilibrium System (ΔH° = -92.2 kJ/mol)</span>
          <div className="text-xl font-extrabold font-mono text-white mt-0.5">
            N₂ (g) + 3 H₂ (g) ⇌ 2 NH₃ (g) + <span className="text-amber-400">Heat</span>
          </div>
        </div>

        {/* Le Chatelier Shift Badge */}
        <div className="flex items-center gap-2">
          {shiftDirection === 'forward' && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-pulse">
              <span>Shift RIGHT (Forward →)</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
          {shiftDirection === 'reverse' && (
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/60 text-amber-300 text-xs font-bold flex items-center gap-2 animate-pulse">
              <ArrowLeft className="w-4 h-4" />
              <span>Shift LEFT (Reverse ←)</span>
            </div>
          )}
          {shiftDirection === 'equilibrium' && (
            <div className="px-3.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/60 text-cyan-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dynamic Equilibrium Maintained (Q = K)</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Le Chatelier Perturbation Actuators (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Le Chatelier Perturbation Stresses
              </h3>
              <button onClick={handleReset} className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Concentration Stresses */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-medium">1. Chemical Species Injection / Removal:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleAddN2}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-left"
                >
                  <div className="text-slate-300 font-bold">+ Inject N₂ gas</div>
                  <div className="text-[10px] text-emerald-400">Forces forward shift</div>
                </button>
                <button
                  onClick={handleAddH2}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-left"
                >
                  <div className="text-slate-300 font-bold">+ Inject H₂ gas</div>
                  <div className="text-[10px] text-emerald-400">Forces forward shift</div>
                </button>
                <button
                  onClick={handleAddNH3}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-left"
                >
                  <div className="text-slate-300 font-bold">+ Inject NH₃ product</div>
                  <div className="text-[10px] text-amber-400">Forces reverse shift</div>
                </button>
                <button
                  onClick={handleRemoveNH3}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-left"
                >
                  <div className="text-slate-300 font-bold">- Condense / Remove NH₃</div>
                  <div className="text-[10px] text-emerald-400">Industrial yield booster</div>
                </button>
              </div>
            </div>

            {/* Thermal Stresses */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">2. Thermal Energy ({tempK} K):</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleHeat}
                  className="p-2.5 rounded-xl bg-amber-950/30 hover:bg-amber-950/50 border border-amber-800/60 text-xs text-left flex items-center justify-between"
                >
                  <div>
                    <div className="text-amber-300 font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> Heat Chamber (+50K)
                    </div>
                    <div className="text-[10px] text-slate-400">Shifts toward reactants</div>
                  </div>
                </button>
                <button
                  onClick={handleCool}
                  className="p-2.5 rounded-xl bg-cyan-950/30 hover:bg-cyan-950/50 border border-cyan-800/60 text-xs text-left flex items-center justify-between"
                >
                  <div>
                    <div className="text-cyan-300 font-bold flex items-center gap-1">
                      <Snowflake className="w-3.5 h-3.5" /> Cool Chamber (-50K)
                    </div>
                    <div className="text-[10px] text-slate-400">Shifts toward products</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Pressure / Volume Stresses */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">3. Volume & Pressure ({volumeL.toFixed(2)} L):</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCompress}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-left"
                >
                  <div className="text-slate-300 font-bold">Compress (P ↑, V ↓)</div>
                  <div className="text-[10px] text-emerald-400">Favors fewer gas moles (NH₃)</div>
                </button>
                <button
                  onClick={handleExpand}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-left"
                >
                  <div className="text-slate-300 font-bold">Expand (P ↓, V ↑)</div>
                  <div className="text-[10px] text-amber-400">Favors more gas moles (N₂+H₂)</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Species Quantities & ICE Table Analytics (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Equilibrium Species Distribution</span>
              <span className="text-xs text-slate-400 font-mono">Total Volume: {volumeL.toFixed(1)} L</span>
            </h3>

            {/* Species Concentration Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-mono">[N₂] Nitrogen:</span>
                  <span className="font-mono text-cyan-400 font-bold">{effN2.toFixed(3)} M</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${Math.min(100, effN2 * 25)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-mono">[H₂] Hydrogen:</span>
                  <span className="font-mono text-blue-400 font-bold">{effH2.toFixed(3)} M</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.min(100, effH2 * 20)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-mono">[NH₃] Ammonia:</span>
                  <span className="font-mono text-emerald-400 font-bold">{effNH3.toFixed(3)} M</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(100, effNH3 * 20)}%` }} />
                </div>
              </div>
            </div>

            {/* Mathematical Derivation Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <strong className="text-white block">Equilibrium Quotient Formula:</strong>
              <div className="font-mono text-cyan-300 text-xs">
                Qc = [NH₃]² / ([N₂] · [H₂]³) = ({effNH3.toFixed(2)})² / ({effN2.toFixed(2)} × {effH2.toFixed(2)}³) = {currentQ.toFixed(3)}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                {currentQ < currentKc
                  ? 'Since Qc < Kc, the forward reaction must proceed to convert reactants into products until Qc equals Kc.'
                  : currentQ > currentKc
                  ? 'Since Qc > Kc, the reverse reaction dominates to consume excess products until equilibrium is re-established.'
                  : 'System is at thermodynamic equilibrium.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
