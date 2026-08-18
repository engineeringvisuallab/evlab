import React, { useState, useEffect } from 'react';
import { AcademicLevel } from '../../types/chemistry';
import { ChemistryEngines } from '../../engines/ChemistryEngines';
import { ChartPlotter, DataPoint } from '../common/ChartPlotter';
import { WhyButton } from '../common/WhyButton';
import { Flame, Snowflake, Play, RotateCcw, Thermometer, ShieldCheck } from 'lucide-react';

interface ThermochemistryLabProps {
  academicLevel: AcademicLevel;
}

interface SaltCalorimetry {
  id: string;
  name: string;
  formula: string;
  deltaH_kJ_mol: number; // Enthalpy of solution (+ endothermic, - exothermic)
  molarMass: number;
}

const SALTS: SaltCalorimetry[] = [
  { id: 'naoh', name: 'Sodium Hydroxide (Exothermic)', formula: 'NaOH', deltaH_kJ_mol: -44.5, molarMass: 40.0 },
  { id: 'nh4no3', name: 'Ammonium Nitrate (Cold Pack)', formula: 'NH₄NO₃', deltaH_kJ_mol: +25.7, molarMass: 80.04 },
  { id: 'cacl2', name: 'Calcium Chloride (Hot Pack)', formula: 'CaCl₂', deltaH_kJ_mol: -82.8, molarMass: 110.98 }
];

export const ThermochemistryLab: React.FC<ThermochemistryLabProps> = ({ academicLevel }) => {
  const [selectedSalt, setSelectedSalt] = useState<SaltCalorimetry>(SALTS[0]);
  const [waterMassGrams, setWaterMassGrams] = useState<number>(100); // 100 g water
  const [saltMassGrams, setSaltMassGrams] = useState<number>(5.0); // 5 g salt
  const [initialTempC, setInitialTempC] = useState<number>(25.0);
  const [isDissolving, setIsDissolving] = useState<boolean>(false);
  const [dissolved, setDissolved] = useState<boolean>(false);

  // Calculate heat exchange q = n * ΔH_sol
  const moles = saltMassGrams / selectedSalt.molarMass;
  const q_Joules = -(moles * selectedSalt.deltaH_kJ_mol * 1000); // Heat absorbed by water
  const totalMass = waterMassGrams + saltMassGrams;
  const deltaT = q_Joules / (totalMass * ChemistryEngines.thermochemistry.WATER_SPECIFIC_HEAT);
  const finalTempC = initialTempC + deltaT;

  const [tempTimeData, setTempTimeData] = useState<DataPoint[]>([
    { x: 0, y: initialTempC }
  ]);

  const handleStartDissolution = () => {
    setIsDissolving(true);
    setDissolved(true);

    const points: DataPoint[] = [];
    for (let t = 0; t <= 30; t += 2) {
      const progress = Math.min(1, t / 15);
      const currentT = initialTempC + deltaT * progress;
      points.push({
        x: t,
        y: Number(currentT.toFixed(2)),
        theoreticalY: Number((initialTempC + deltaT).toFixed(2))
      });
    }
    setTempTimeData(points);
    setIsDissolving(false);
  };

  const handleReset = () => {
    setDissolved(false);
    setTempTimeData([{ x: 0, y: initialTempC }]);
  };

  return (
    <div className="space-y-6" id="thermochemistry-lab">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Flame className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Thermochemistry & Solution Calorimetry</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Measure heat of solution, calculate temperature excursions (q = mcΔT), and determine molar enthalpy (ΔH_rxn).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono text-xs">
            <div className="text-[10px] text-slate-400">Enthalpy (ΔH)</div>
            <div className={`text-base font-bold ${selectedSalt.deltaH_kJ_mol < 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
              {selectedSalt.deltaH_kJ_mol > 0 ? `+${selectedSalt.deltaH_kJ_mol}` : selectedSalt.deltaH_kJ_mol} kJ/mol
            </div>
          </div>
          <WhyButton
            experimentName="Calorimetry & Heat"
            observation={`Dissolved ${saltMassGrams}g ${selectedSalt.name}: Temp shifted from ${initialTempC}°C to ${finalTempC.toFixed(1)}°C (ΔT = ${deltaT > 0 ? `+${deltaT.toFixed(1)}` : deltaT.toFixed(1)}°C)`}
            stateContext={{ selectedSalt: selectedSalt.name, saltMassGrams, waterMassGrams, initialTempC, finalTempC, deltaT, q_Joules }}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calorimeter Parameters (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Solute Selection
            </h3>

            <div className="space-y-2">
              {SALTS.map((salt) => (
                <button
                  key={salt.id}
                  onClick={() => {
                    setSelectedSalt(salt);
                    handleReset();
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedSalt.id === salt.id
                      ? 'bg-cyan-950/40 border-cyan-500/80 text-white shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{salt.name}</span>
                    <span className="font-mono text-cyan-400">{salt.formula}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    ΔH_sol = <strong className={salt.deltaH_kJ_mol < 0 ? 'text-amber-400' : 'text-cyan-300'}>{salt.deltaH_kJ_mol} kJ/mol</strong>
                  </div>
                </button>
              ))}
            </div>

            {/* Salt Mass Slider */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Solute Mass:</span>
                <span className="font-mono font-bold text-cyan-400">{saltMassGrams.toFixed(1)} g</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={saltMassGrams}
                onChange={(e) => {
                  setSaltMassGrams(Number(e.target.value));
                  handleReset();
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Trigger Dissolution */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleStartDissolution}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4" /> Dissolve in Calorimeter
              </button>
              <button
                onClick={handleReset}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Live Calorimeter Temperature Graph (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Calorimeter Temperature vs Time</span>
              <span className="text-xs text-cyan-400 font-mono">
                Final Temp: {dissolved ? `${finalTempC.toFixed(2)} °C` : `${initialTempC.toFixed(2)} °C`}
              </span>
            </h3>

            <ChartPlotter
              data={tempTimeData}
              xLabel="Time"
              xUnit="seconds"
              yLabel="Temperature"
              yUnit="°C"
              height={220}
              color={selectedSalt.deltaH_kJ_mol < 0 ? '#f59e0b' : '#06b6d4'}
            />

            {/* Heat Equation Summary */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Heat Absorbed / Released (q):</span>
                <span className="font-mono text-white font-bold">{q_Joules.toFixed(1)} J</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Temperature Delta (ΔT):</span>
                <span className="font-mono text-cyan-400 font-bold">
                  {deltaT > 0 ? `+${deltaT.toFixed(2)}` : deltaT.toFixed(2)} °C
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Reaction Nature:</span>
                <span className={`font-mono font-bold ${selectedSalt.deltaH_kJ_mol < 0 ? 'text-amber-400' : 'text-cyan-300'}`}>
                  {selectedSalt.deltaH_kJ_mol < 0 ? 'Exothermic (Heats up)' : 'Endothermic (Cools down)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
