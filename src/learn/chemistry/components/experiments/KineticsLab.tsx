import React, { useState, useEffect } from 'react';
import { AcademicLevel } from '../../types/chemistry';
import { ChemistryEngines } from '../../engines/ChemistryEngines';
import { ParticleCanvas } from '../common/ParticleCanvas';
import { ChartPlotter, DataPoint } from '../common/ChartPlotter';
import { WhyButton } from '../common/WhyButton';
import { Zap, Flame, Sparkles, Activity, Play, RotateCcw, ShieldCheck } from 'lucide-react';

interface KineticsLabProps {
  academicLevel: AcademicLevel;
}

export const KineticsLab: React.FC<KineticsLabProps> = ({ academicLevel }) => {
  const [temperatureK, setTemperatureK] = useState<number>(320);
  const [concA, setConcA] = useState<number>(1.0); // M
  const [concB, setConcB] = useState<number>(1.0); // M
  const [hasCatalyst, setHasCatalyst] = useState<boolean>(false);
  const [successfulCollisions, setSuccessfulCollisions] = useState<number>(0);

  // Activation energy Ea: 75 kJ/mol uncatalyzed, 38 kJ/mol with catalyst
  const Ea_kJ = hasCatalyst ? 38.0 : 75.0;
  const preExpFactor_A = 1.0e11; // Arrhenius pre-exponential factor

  // Calculate rate constant k and rate
  const k = ChemistryEngines.kinetics.calculateRateConstant(preExpFactor_A, Ea_kJ, temperatureK);
  const reactionRate = ChemistryEngines.kinetics.calculateReactionRate(k, concA, concB, 1, 1);

  // Maxwell-Boltzmann distribution curve data
  const [mbData, setMbData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const points: DataPoint[] = [];
    for (let e = 0; e <= 120; e += 4) {
      const prob = ChemistryEngines.kinetics.maxwellBoltzmann(e, temperatureK);
      points.push({
        x: e,
        y: Number((prob * 100).toFixed(3)),
        theoreticalY: e >= Ea_kJ ? Number((prob * 100).toFixed(3)) : 0
      });
    }
    setMbData(points);
  }, [temperatureK, Ea_kJ]);

  const handleReactionEvent = () => {
    setSuccessfulCollisions((prev) => prev + 1);
  };

  return (
    <div className="space-y-6" id="kinetics-lab">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Zap className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Chemical Kinetics & Collision Theory</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Discover how temperature, activation energy ($E_a$), catalysts, and molecular orientation govern reaction velocity.
          </p>
        </div>

        {/* Status Metrics */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs">
            <div className="text-[10px] text-slate-400">Rate Constant (k)</div>
            <div className="text-base font-bold text-cyan-400">{k.toExponential(2)} s⁻¹</div>
          </div>
          <WhyButton
            experimentName="Reaction Kinetics"
            observation={`At T=${temperatureK}K with ${hasCatalyst ? 'Catalyst' : 'No Catalyst'}, Rate=${reactionRate.toExponential(2)} M/s`}
            stateContext={{ temperatureK, concA, concB, hasCatalyst, Ea_kJ, k, reactionRate }}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Experimental Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Reaction Variables
            </h3>

            {/* Temperature Slider */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" /> Temperature:
                </span>
                <span className="text-sm font-bold font-mono text-amber-400">{temperatureK} K</span>
              </div>
              <input
                type="range"
                min="270"
                max="600"
                step="10"
                value={temperatureK}
                onChange={(e) => setTemperatureK(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>270 K (Cold)</span>
                <span>400 K</span>
                <span>600 K (Hot)</span>
              </div>
            </div>

            {/* Reactant Concentrations */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">[Reactant A]:</span>
                  <span className="font-mono font-bold text-amber-400">{concA.toFixed(2)} M</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={concA}
                  onChange={(e) => setConcA(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">[Reactant B]:</span>
                  <span className="font-mono font-bold text-cyan-400">{concB.toFixed(2)} M</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={concB}
                  onChange={(e) => setConcB(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Catalyst Toggle Button */}
            <button
              onClick={() => setHasCatalyst(!hasCatalyst)}
              className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                hasCatalyst
                  ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Heterogeneous Catalyst</span>
              </div>
              <span>{hasCatalyst ? 'ACTIVATED (Ea = 38 kJ)' : 'OFF (Ea = 75 kJ)'}</span>
            </button>
          </div>
        </div>

        {/* Center Column: Particle Collision Chamber (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Microscopic Collision Stage</span>
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              Products Formed: {successfulCollisions}
            </span>
          </div>

          {/* Real-time Collision Canvas */}
          <ParticleCanvas
            particleCount={Math.floor((concA + concB) * 18)}
            temperature={temperatureK}
            particleType="kinetics"
            collisionThresholdEa={Ea_kJ}
            onReactionEvent={handleReactionEvent}
            height={260}
          />

          {/* Arrhenius Equation Display */}
          <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Arrhenius Relation:</span>
              <span className="font-mono text-cyan-400 font-bold text-xs">
                k = A · e^(-Ea / RT)
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Rate Law:</span>
              <span className="font-mono text-white font-bold text-xs">
                Rate = k [A] [B]
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Maxwell-Boltzmann Distribution (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
            <h3 className="text-xs font-bold text-white mb-2">
              Maxwell-Boltzmann Distribution
            </h3>
            <ChartPlotter
              data={mbData}
              xLabel="Kinetic Energy (E)"
              xUnit="kJ/mol"
              yLabel="Fraction of Molecules"
              height={230}
              color="#f59e0b"
            />
            <div className="text-[10px] text-slate-400 mt-2 font-mono">
              Threshold Ea = <strong className="text-cyan-400">{Ea_kJ} kJ/mol</strong>. Only collisions with E ≥ Ea lead to reaction.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
