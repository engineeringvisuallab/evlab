import React, { useState, useEffect } from 'react';
import { AcademicLevel } from '../../types/chemistry';
import { ChemistryEngines } from '../../engines/ChemistryEngines';
import { ParticleCanvas } from '../common/ParticleCanvas';
import { ChartPlotter, DataPoint } from '../common/ChartPlotter';
import { WhyButton } from '../common/WhyButton';
import { Wind, Flame, Snowflake, Plus, Minus, RotateCcw, Play, Pause, Gauge } from 'lucide-react';

interface GasLawLabProps {
  academicLevel: AcademicLevel;
}

export const GasLawLab: React.FC<GasLawLabProps> = ({ academicLevel }) => {
  // Gas variables
  const [temperatureK, setTemperatureK] = useState(300); // 300 K (~27°C)
  const [volumeL, setVolumeL] = useState(24.46); // L (standard molar volume ~24.46 L at 300K, 1 atm)
  const [molesN, setMolesN] = useState(1.0); // moles

  // State hold modes for specific gas laws
  const [lawMode, setLawMode] = useState<'ideal' | 'boyle' | 'charles' | 'gay_lussac'>('ideal');

  // Chart data
  const [pvData, setPvData] = useState<DataPoint[]>([]);

  // Calculate live Pressure using Ideal Gas Law P = nRT / V
  const currentPressureAtm = ChemistryEngines.gasLaws.calculatePressure(molesN, temperatureK, volumeL);
  const rmsSpeedMs = ChemistryEngines.gasLaws.calculateRmsVelocity(temperatureK, 0.028); // N2 gas (28 g/mol)

  // Update chart points
  useEffect(() => {
    // Generate isothermal or isobaric reference curve
    const points: DataPoint[] = [];
    if (lawMode === 'boyle' || lawMode === 'ideal') {
      // P vs V curve (Isotherm at current T)
      for (let v = 5; v <= 50; v += 2.5) {
        const p = ChemistryEngines.gasLaws.calculatePressure(molesN, temperatureK, v);
        points.push({
          x: v,
          y: Number(p.toFixed(2)),
          theoreticalY: Number(p.toFixed(2))
        });
      }
    } else {
      // P vs T curve (Isochore)
      for (let t = 100; t <= 600; t += 25) {
        const p = ChemistryEngines.gasLaws.calculatePressure(molesN, t, volumeL);
        points.push({
          x: t,
          y: Number(p.toFixed(2)),
          theoreticalY: Number(p.toFixed(2))
        });
      }
    }
    setPvData(points);
  }, [temperatureK, volumeL, molesN, lawMode]);

  // Adjust volume handler
  const handleVolumeChange = (newV: number) => {
    const clampedV = Math.max(5, Math.min(50, newV));
    setVolumeL(Number(clampedV.toFixed(2)));
    if (lawMode === 'charles') {
      // Hold Pressure constant -> T must adjust: T2 = T1 * (V2 / V1)
      const newT = ChemistryEngines.gasLaws.calculateTemperature(currentPressureAtm, clampedV, molesN);
      setTemperatureK(Math.max(50, Math.min(800, Number(newT.toFixed(0)))));
    }
  };

  // Adjust temperature handler
  const handleTempChange = (newT: number) => {
    const clampedT = Math.max(50, Math.min(800, newT));
    setTemperatureK(clampedT);
    if (lawMode === 'charles') {
      // Hold Pressure constant -> V adjusts
      const newV = ChemistryEngines.gasLaws.calculateVolume(molesN, clampedT, currentPressureAtm);
      setVolumeL(Math.max(5, Math.min(50, Number(newV.toFixed(2)))));
    }
  };

  return (
    <div className="space-y-6" id="gas-law-lab">
      {/* Top Controls Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Wind className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Gas Laws & Kinetic Molecular Simulator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Observe particle collisions, adjust thermodynamic parameters, and verify Boyle's, Charles's, and Ideal Gas laws ($PV = nRT$).
          </p>
        </div>

        {/* Law Presets */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 px-2">Hold Constant:</span>
          {[
            { id: 'ideal', label: 'All Variables Free' },
            { id: 'boyle', label: "Boyle's (Constant T)" },
            { id: 'charles', label: "Charles's (Constant P)" },
            { id: 'gay_lussac', label: "Gay-Lussac (Constant V)" }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setLawMode(mode.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                lawMode === mode.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Variable Sliders & Thermal Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-md">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Chamber Variables</span>
              <button
                onClick={() => {
                  setTemperatureK(300);
                  setVolumeL(24.46);
                  setMolesN(1.0);
                }}
                className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 normal-case"
              >
                <RotateCcw className="w-3 h-3" /> Reset STP
              </button>
            </h3>

            {/* Temperature Slider (K) */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" /> Temperature (T)
                </span>
                <span className="text-sm font-bold font-mono text-amber-400">
                  {temperatureK} K ({temperatureK - 273}°C)
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="10"
                value={temperatureK}
                onChange={(e) => handleTempChange(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
                id="slider-temp-k"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50 K (Cryogenic)</span>
                <span>300 K (Room)</span>
                <span>800 K (Combustion)</span>
              </div>
            </div>

            {/* Volume Slider (L) */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-cyan-400" /> Chamber Volume (V)
                </span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  {volumeL.toFixed(1)} L
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="0.5"
                value={volumeL}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
                id="slider-volume-l"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5.0 L (Compressed)</span>
                <span>25.0 L</span>
                <span>50.0 L (Expanded)</span>
              </div>
            </div>

            {/* Particle Quantity Slider (moles) */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Gas Quantity (n)</span>
                <span className="text-sm font-bold font-mono text-white">
                  {molesN.toFixed(2)} mol
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={molesN}
                onChange={(e) => setMolesN(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
                id="slider-moles-n"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0.2 mol</span>
                <span>1.0 mol</span>
                <span>3.0 mol</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">RMS Velocity (v_rms):</span>
              <strong className="text-cyan-300 font-mono">{rmsSpeedMs.toFixed(0)} m/s</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Total Gas Particles:</span>
              <strong className="text-white font-mono">{(molesN * 6.022e23).toExponential(2)}</strong>
            </div>
          </div>
        </div>

        {/* Center Column: Particle Kinetic Chamber (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <span>Chamber Pressure Gauge</span>
            </span>
            <span className="text-lg font-bold font-mono text-cyan-400">
              {currentPressureAtm.toFixed(2)} atm
            </span>
          </div>

          {/* Particle Simulation Canvas */}
          <ParticleCanvas
            particleCount={Math.floor(molesN * 35)}
            temperature={temperatureK}
            particleType="gas"
            height={260}
          />

          {/* Gas Law Formula Card */}
          <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Active Mathematical Relation:</span>
              <span className="font-mono text-cyan-400 font-bold text-sm">
                P · V = n · R · T
              </span>
            </div>
            <WhyButton
              experimentName="Ideal Gas Simulation"
              observation={`Gas state at P=${currentPressureAtm.toFixed(2)} atm, V=${volumeL} L, T=${temperatureK} K, n=${molesN} mol`}
              stateContext={{ temperatureK, volumeL, molesN, currentPressureAtm, rmsSpeedMs }}
            />
          </div>
        </div>

        {/* Right Column: Thermodynamic Graph (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md">
            <h3 className="text-xs font-bold text-white mb-2">
              {lawMode === 'gay_lussac' ? 'P-T Isochoric Curve' : 'P-V Isothermal Curve'}
            </h3>
            <ChartPlotter
              data={pvData}
              xLabel={lawMode === 'gay_lussac' ? 'Temperature' : 'Volume'}
              xUnit={lawMode === 'gay_lussac' ? 'K' : 'L'}
              yLabel="Pressure"
              yUnit="atm"
              height={230}
              color="#38bdf8"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
