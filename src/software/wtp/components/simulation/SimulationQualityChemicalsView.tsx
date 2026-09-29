import React, { useState } from 'react';
import { CentralSimulationState, ChemicalFeederState, WaterQualityProfile } from '../../core/simulationStateEngine';
import { Droplets, Flame, Sliders, CheckCircle2, AlertTriangle, ShieldCheck, Calculator, FlaskConical, Activity, ArrowRight } from 'lucide-react';

interface SimulationQualityChemicalsViewProps {
  qualityStages: CentralSimulationState['qualityStages'];
  chemicals: Record<string, ChemicalFeederState>;
  onUpdateChemical: (chemicalKey: string, updates: Partial<ChemicalFeederState>) => void;
  onOpenFormulaInspector: (paramId: string) => void;
}

export const SimulationQualityChemicalsView: React.FC<SimulationQualityChemicalsViewProps> = ({
  qualityStages,
  chemicals,
  onUpdateChemical,
  onOpenFormulaInspector
}) => {
  // Jar test simulator state
  const [jarAlumDose, setJarAlumDose] = useState<number>(28);
  const [jarTargetPh, setJarTargetPh] = useState<number>(6.8);
  const [jarPolymerDose, setJarPolymerDose] = useState<number>(0.25);

  // Predicted responses derived from jar test empirical kinetic model
  const predictedFlocSizeMm = Math.min(3.5, 0.5 + (jarAlumDose / 10) * 0.7 + (jarPolymerDose * 2.0));
  const predictedSettlingVelocityMh = Math.min(4.8, 0.8 + (jarAlumDose / 15) * 0.9 + (jarPolymerDose * 3.2));
  const predictedClarifiedTurbidity = Math.max(0.8, Number((120 / (1 + Math.pow(jarAlumDose / 18, 2.2))).toFixed(2)));
  const predictedSludgeDryKgM3 = (140 * 0.95 + jarAlumDose * 0.35) / 1000;

  const stageKeys: Array<{ key: keyof typeof qualityStages; label: string; unitDesc: string }> = [
    { key: 'raw', label: '1. Raw Water Intake', unitDesc: 'River intake well prior to aeration' },
    { key: 'afterAeration', label: '2. Post-Aeration', unitDesc: 'Cascade aerator outlet (CO2 stripped, Fe/Mn oxid)' },
    { key: 'afterCoagulation', label: '3. Post-Coagulation', unitDesc: 'Flash mixer discharge (Microflocs nucleating)' },
    { key: 'afterFlocculation', label: '4. Post-Flocculation', unitDesc: '3-stage baffle flocculator outlet (Macroflocs)' },
    { key: 'afterClarification', label: '5. Clarifier Effluent', unitDesc: 'Tube settler / Lamella launder discharge' },
    { key: 'afterFiltration', label: '6. Filtered Water', unitDesc: 'Dual media sand + anthracite effluent' },
    { key: 'afterDisinfection', label: '7. Post-Disinfection', unitDesc: 'Chlorine contact basin outlet (CT satisfied)' },
    { key: 'finalProductWater', label: '8. Final Product Water', unitDesc: 'Potable water delivered to CWR & distribution' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Water Quality Propagation Matrix Across Process Stages */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                8-Stage Water Quality Propagation & Treatment Kinetics
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live multi-parameter tracking from raw river intake through coagulation, settling, filtration, and chlorination.
            </p>
          </div>

          <button
            onClick={() => onOpenFormulaInspector('FORM-PROC-001')}
            className="px-3 py-1.5 bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-700/50 text-cyan-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>fx Coagulation & Removal Kinetics</span>
          </button>
        </div>

        {/* Quality Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/80">
                <th className="py-2.5 px-3 font-semibold">Treatment Stage</th>
                <th className="py-2.5 px-3 font-semibold font-mono text-cyan-400">Turbidity (NTU)</th>
                <th className="py-2.5 px-3 font-semibold font-mono">TSS (mg/L)</th>
                <th className="py-2.5 px-3 font-semibold font-mono">pH</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Alk (mg/L)</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Fe (mg/L)</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Mn (mg/L)</th>
                <th className="py-2.5 px-3 font-semibold font-mono">TOC (mg/L)</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Coliform (MPN)</th>
                <th className="py-2.5 px-3 font-semibold font-mono text-emerald-400">Free Cl₂ (mg/L)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {stageKeys.map(({ key, label }) => {
                const stage = qualityStages[key];
                return (
                  <tr key={key} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-200">
                      {label}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">
                      {stage.turbidityNTU.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{stage.tssMgL.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-amber-300">{stage.pH.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-300">{stage.alkalinityMgL.toFixed(0)}</td>
                    <td className="py-2.5 px-3 text-slate-300">{stage.ironMgL.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-300">{stage.manganeseMgL.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-300">{stage.tocMgL.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-rose-300 font-bold">{stage.fecalColiformMPN}</td>
                    <td className="py-2.5 px-3 text-emerald-300 font-bold">{stage.freeChlorineMgL.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Live Chemical Feeders & Jar Test Coagulation Response */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chemical Feeders Control */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <span>Active Chemical Dosing Systems & Feed Rates</span>
            </h4>
          </div>

          <div className="mt-4 space-y-4">
            {Object.entries(chemicals).map(([key, chemical]) => (
              <div key={key} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-200">{chemical.chemicalName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{chemical.formula}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-600 text-emerald-300 rounded text-[10px] font-bold">
                    {chemical.dosingPumpStatus}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono mb-2">
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-sans">Active Dose</span>
                    <span className="text-cyan-300 font-bold">{chemical.activeDoseMgL} mg/L</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-sans">Feed Rate</span>
                    <span className="text-amber-300 font-bold">{chemical.feedRateKgHr.toFixed(2)} kg/h</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-sans">Tank Level</span>
                    <span className="text-emerald-300 font-bold">{chemical.tankLevelPercent}%</span>
                  </div>
                </div>

                {/* Dose Adjustment Slider */}
                <div className="space-y-1 pt-1 border-t border-slate-800">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Adjust Chemical Dose (mg/L):</span>
                    <span className="font-bold text-cyan-300">{chemical.activeDoseMgL} mg/L</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="80"
                    step="0.5"
                    value={chemical.activeDoseMgL}
                    onChange={(e) => {
                      const dose = Number(e.target.value);
                      onUpdateChemical(key, {
                        activeDoseMgL: dose,
                        feedRateKgHr: (2083.33 * dose) / 1000,
                        manualOverride: true
                      });
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jar Test Empirical Response Model */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Jar Test & Coagulation Kinetic Response</span>
            </h4>
            <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
              Model-Based Prediction
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {/* Sliders */}
            <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Alum Coagulant Dose:</span>
                  <span className="font-mono text-cyan-300 font-bold">{jarAlumDose} mg/L</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={jarAlumDose}
                  onChange={(e) => setJarAlumDose(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Coagulation pH Target:</span>
                  <span className="font-mono text-amber-300 font-bold">{jarTargetPh}</span>
                </div>
                <input
                  type="range"
                  min="5.5"
                  max="8.5"
                  step="0.1"
                  value={jarTargetPh}
                  onChange={(e) => setJarTargetPh(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Polymer Aid Dose:</span>
                  <span className="font-mono text-emerald-300 font-bold">{jarPolymerDose} mg/L</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={jarPolymerDose}
                  onChange={(e) => setJarPolymerDose(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Kinetic Output Cards */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Predicted Macrofloc Size</span>
                <span className="text-base text-cyan-300 font-bold">{predictedFlocSizeMm.toFixed(2)} mm</span>
                <span className="text-[10px] text-slate-400 block mt-1">Optimal Range: 2.0 - 4.0 mm</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Floc Settling Velocity (vs)</span>
                <span className="text-base text-amber-300 font-bold">{predictedSettlingVelocityMh.toFixed(2)} m/h</span>
                <span className="text-[10px] text-slate-400 block mt-1">SOR Limit: 1.25 m/h</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Predicted Settled Turbidity</span>
                <span className="text-base text-emerald-300 font-bold">{predictedClarifiedTurbidity} NTU</span>
                <span className="text-[10px] text-emerald-400 block mt-1">Filter Ready (&lt; 5.0 NTU)</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">Dry Sludge Production</span>
                <span className="text-base text-purple-300 font-bold">{(predictedSludgeDryKgM3 * 1000).toFixed(1)} g/m³</span>
                <span className="text-[10px] text-slate-400 block mt-1">TSS + Al(OH)₃ mass</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
