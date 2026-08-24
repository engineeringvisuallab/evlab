/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 04: Preliminary Treatment Panel (Screening, Grit Removal, FOG Management)
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectState } from '../types/stp';
import {
  ScreenDesignConfig,
  GritDesignConfig,
  FogDesignConfig,
} from '../types/preliminaryPrimary';
import { CalculationEngine } from '../engine/calculations';
import {
  CheckCircle2,
  AlertTriangle,
  Sliders,
} from 'lucide-react';

interface PreliminaryTreatmentPanelProps {
  project: ProjectState;
  onUpdateProject: (updated: ProjectState) => void;
}

export const PreliminaryTreatmentPanel: React.FC<PreliminaryTreatmentPanelProps> = ({
  project,
  onUpdateProject,
}) => {
  const scenario = project.scenarios[project.activeScenarioId];
  const prelim = scenario.preliminaryPrimary;

  const [subTab, setSubTab] = useState<'SCREENING' | 'GRIT' | 'FOG' | 'HYDRAULIC_HGL'>('SCREENING');

  if (!prelim) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Preliminary treatment state is initializing...</p>
      </div>
    );
  }

  const {
    coarseScreen,
    coarseScreenHydraulics,
    fineScreen,
    fineScreenHydraulics,
    gritChamber,
    gritHydraulics,
    fogManagement,
    fogHydraulics,
    plantHglProfile,
  } = prelim;

  // Handler for coarse screen updates
  const handleUpdateCoarseScreen = (updates: Partial<ScreenDesignConfig>) => {
    const updatedScreen: ScreenDesignConfig = { ...coarseScreen, ...updates };
    const updatedPrelim = { ...prelim, coarseScreen: updatedScreen };
    const updatedScenario = { ...scenario, preliminaryPrimary: updatedPrelim };
    const updatedProject = {
      ...project,
      scenarios: { ...project.scenarios, [scenario.id]: updatedScenario },
    };
    CalculationEngine.runAllCalculations(updatedProject);
    onUpdateProject({ ...updatedProject });
  };

  // Handler for grit chamber updates
  const handleUpdateGrit = (updates: Partial<GritDesignConfig>) => {
    const updatedGrit: GritDesignConfig = { ...gritChamber, ...updates };
    const updatedPrelim = { ...prelim, gritChamber: updatedGrit };
    const updatedScenario = { ...scenario, preliminaryPrimary: updatedPrelim };
    const updatedProject = {
      ...project,
      scenarios: { ...project.scenarios, [scenario.id]: updatedScenario },
    };
    CalculationEngine.runAllCalculations(updatedProject);
    onUpdateProject({ ...updatedProject });
  };

  // Handler for FOG updates
  const handleUpdateFog = (updates: Partial<FogDesignConfig>) => {
    const updatedFog: FogDesignConfig = { ...fogManagement, ...updates };
    const updatedPrelim = { ...prelim, fogManagement: updatedFog };
    const updatedScenario = { ...scenario, preliminaryPrimary: updatedPrelim };
    const updatedProject = {
      ...project,
      scenarios: { ...project.scenarios, [scenario.id]: updatedScenario },
    };
    CalculationEngine.runAllCalculations(updatedProject);
    onUpdateProject({ ...updatedProject });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Sub-Header & Subsystem Mode Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 text-xs font-mono font-semibold">
              PHASE 04 ENGINE
            </span>
            <h1 className="text-xl font-bold text-slate-100">Preliminary Treatment Operations</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mechanical Bar Screening, Aerated Grit Classifiers, and Surface FOG/Scum Management.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setSubTab('SCREENING')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              subTab === 'SCREENING'
                ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-700/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Bar Screens
          </button>
          <button
            onClick={() => setSubTab('GRIT')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              subTab === 'GRIT'
                ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-700/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Grit Removal
          </button>
          <button
            onClick={() => setSubTab('FOG')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              subTab === 'FOG'
                ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-700/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. FOG & Scum
          </button>
          <button
            onClick={() => setSubTab('HYDRAULIC_HGL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              subTab === 'HYDRAULIC_HGL'
                ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-700/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Preliminary HGL
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: SCREENING */}
      {subTab === 'SCREENING' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Coarse Bar Screen Configuration
              </h2>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Screen Type</label>
                  <select
                    value={coarseScreen.screenType}
                    onChange={(e) => handleUpdateCoarseScreen({ screenType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  >
                    <option value="MECHANICAL_BAR">Mechanical Bar Screen</option>
                    <option value="MANUAL_BAR">Manual Bar Screen</option>
                    <option value="DRUM_SCREEN">Rotary Drum Screen</option>
                    <option value="FINE_STEP">Fine Step Screen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Bar Shape</label>
                  <select
                    value={coarseScreen.barShape}
                    onChange={(e) => handleUpdateCoarseScreen({ barShape: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  >
                    <option value="RECTANGULAR">Sharp Rectangular (β=2.42)</option>
                    <option value="CIRCULAR">Circular Rods (β=1.79)</option>
                    <option value="TEARDROP">Streamlined Teardrop (β=0.76)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Clear Bar Opening (mm)</label>
                  <input
                    type="number"
                    min="3"
                    max="60"
                    step="1"
                    value={coarseScreen.barOpeningMm}
                    onChange={(e) => handleUpdateCoarseScreen({ barOpeningMm: parseFloat(e.target.value) || 20 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Typical coarse: 15-25 mm</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Bar Thickness (mm)</label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    step="0.5"
                    value={coarseScreen.barThicknessMm}
                    onChange={(e) => handleUpdateCoarseScreen({ barThicknessMm: parseFloat(e.target.value) || 10 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Structural width</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Rack Angle (° from horiz)</label>
                  <input
                    type="number"
                    min="30"
                    max="90"
                    step="5"
                    value={coarseScreen.screenAngleDeg}
                    onChange={(e) => handleUpdateCoarseScreen({ screenAngleDeg: parseFloat(e.target.value) || 75 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Mechanical: 70°-80°</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Channel Width (m)</label>
                  <input
                    type="number"
                    min="0.4"
                    max="4.0"
                    step="0.05"
                    value={coarseScreen.channelWidthM}
                    onChange={(e) => handleUpdateCoarseScreen({ channelWidthM: parseFloat(e.target.value) || 0.8 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Approach channel width</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Upstream Depth (m)</label>
                  <input
                    type="number"
                    min="0.2"
                    max="3.0"
                    step="0.05"
                    value={coarseScreen.upstreamWaterDepthM}
                    onChange={(e) => handleUpdateCoarseScreen({ upstreamWaterDepthM: parseFloat(e.target.value) || 0.6 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Submerged water depth</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Duty Channels</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={coarseScreen.dutyCount}
                    onChange={(e) => handleUpdateCoarseScreen({ dutyCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Parallel active channels</span>
                </div>
              </div>
            </div>

            {/* Screenings Yield Card */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Screenings Capture & Handling
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Daily Screenings Volume</span>
                  <span className="text-base font-bold text-cyan-300 font-mono">
                    {coarseScreenHydraulics.screeningsVolumeM3Day.toFixed(2)} m³/d
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    @ {coarseScreen.screeningsYieldLPer1000M3} L/10³ m³
                  </span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Handling Mechanism</span>
                  <span className="text-xs font-medium text-emerald-400">
                    {coarseScreen.handlingMethod}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Moisture ~ {coarseScreen.moistureContentPct}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Results & Hydraulic Physics Display (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] text-slate-400">Approach Velocity (v_a)</div>
                <div className={`text-xl font-bold font-mono mt-1 ${
                  coarseScreenHydraulics.approachVelocityMps < 0.35 || coarseScreenHydraulics.approachVelocityMps > 1.0
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}>
                  {coarseScreenHydraulics.approachVelocityMps.toFixed(2)} <span className="text-xs font-normal">m/s</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Target: 0.35 - 1.00 m/s</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] text-slate-400">Clean Kirschmer HL</div>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                  {(coarseScreenHydraulics.cleanHeadlossM * 1000).toFixed(1)} <span className="text-xs font-normal">mm</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">h_L = β·(s/b)^(4/3)·sinθ·Hv</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] text-slate-400">Clogged Headloss (50%)</div>
                <div className={`text-xl font-bold font-mono mt-1 ${
                  coarseScreenHydraulics.cloggedHeadlossM > 0.40 ? 'text-rose-400' : 'text-amber-300'
                }`}>
                  {(coarseScreenHydraulics.cloggedHeadlossM * 1000).toFixed(0)} <span className="text-xs font-normal">mm</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Max allowable: 400 mm</div>
              </div>
            </div>

            {/* Step-by-Step Calculation Breakdown Panel */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                <span>Kirschmer Formula Mathematical Trace</span>
                <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  Ref: Metcalf & Eddy Eq. 5-3
                </span>
              </h3>

              <div className="space-y-2 text-xs font-mono bg-slate-950 p-4 rounded-lg border border-slate-800/80 text-slate-300">
                <div className="text-cyan-400">h_L = β × (s / b)^(4/3) × (v_a² / 2g) × sin(θ)</div>
                <div className="border-t border-slate-800 pt-2 grid grid-cols-2 gap-2 text-[11px]">
                  <div>• Bar Ratio (s / b): <span className="text-slate-100">{coarseScreen.barThicknessMm} / {coarseScreen.barOpeningMm} = {(coarseScreen.barThicknessMm / coarseScreen.barOpeningMm).toFixed(3)}</span></div>
                  <div>• Open Area Fraction (e): <span className="text-slate-100">{(coarseScreenHydraulics.openAreaFraction * 100).toFixed(1)}%</span></div>
                  <div>• Clean Through-Bar Vel (v_t): <span className="text-slate-100">{coarseScreenHydraulics.velocityThroughBarsCleanMps.toFixed(2)} m/s</span></div>
                  <div>• 50% Clogged Vel (v_clogged): <span className="text-slate-100">{coarseScreenHydraulics.velocityThroughBarsCloggedMps.toFixed(2)} m/s</span></div>
                </div>
              </div>
            </div>

            {/* Validation & Design Rules */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Engineering Design Checks
              </h4>
              <div className="space-y-1.5">
                {coarseScreenHydraulics.validationMessages.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>All screening hydraulic criteria (Approach V, Through-Bar V, Clogged HL) strictly satisfied.</span>
                  </div>
                ) : (
                  coarseScreenHydraulics.validationMessages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-400">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{msg}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GRIT REMOVAL */}
      {subTab === 'GRIT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Grit Chamber Sizing Configuration
              </h2>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1">Chamber Technology</label>
                  <select
                    value={gritChamber.chamberType}
                    onChange={(e) => handleUpdateGrit({ chamberType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  >
                    <option value="AERATED_GRIT">Aerated Helical Grit Chamber</option>
                    <option value="HORIZONTAL_FLOW">Horizontal Velocity-Controlled Channel</option>
                    <option value="VORTEX_GRIT">Vortex Induced Induced Vortex Chamber</option>
                  </select>
                </div>

                {gritChamber.aerated && (
                  <>
                    <div>
                      <label className="block text-slate-400 mb-1">Tank Length (m)</label>
                      <input
                        type="number"
                        min="2"
                        max="30"
                        step="0.5"
                        value={gritChamber.aerated.tankLengthM}
                        onChange={(e) =>
                          handleUpdateGrit({
                            aerated: {
                              ...gritChamber.aerated!,
                              tankLengthM: parseFloat(e.target.value) || 8,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Tank Width (m)</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        step="0.2"
                        value={gritChamber.aerated.tankWidthM}
                        onChange={(e) =>
                          handleUpdateGrit({
                            aerated: {
                              ...gritChamber.aerated!,
                              tankWidthM: parseFloat(e.target.value) || 2.4,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Liquid Depth (m)</label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        step="0.2"
                        value={gritChamber.aerated.liquidDepthM}
                        onChange={(e) =>
                          handleUpdateGrit({
                            aerated: {
                              ...gritChamber.aerated!,
                              liquidDepthM: parseFloat(e.target.value) || 2.2,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Air Supply (m³/min·m)</label>
                      <input
                        type="number"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={gritChamber.aerated.airSupplyM3MinPerM}
                        onChange={(e) =>
                          handleUpdateGrit({
                            aerated: {
                              ...gritChamber.aerated!,
                              airSupplyM3MinPerM: parseFloat(e.target.value) || 0.3,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-slate-400 mb-1">Duty Units</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={gritChamber.dutyCount}
                    onChange={(e) => handleUpdateGrit({ dutyCount: parseInt(e.target.value) || 2 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Standby Units</label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    value={gritChamber.standbyCount}
                    onChange={(e) => handleUpdateGrit({ standbyCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Grit Capture Yield */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Grit Classifier Yield
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Daily Grit Mass</span>
                  <span className="text-base font-bold text-cyan-300 font-mono">
                    {gritHydraulics.gritWetMassKgDay.toFixed(1)} kg/d
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Vol: {gritHydraulics.gritVolumeM3Day.toFixed(2)} m³/day
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">0.20mm Removal</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {gritHydraulics.removalEfficiencyPct.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Stokes Sinking ~ 21 mm/s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Results & Calculations Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] text-slate-400">Peak Detention Time</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {(gritHydraulics.actualDetentionTimeSec / 60).toFixed(1)} <span className="text-xs font-normal">min</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  {gritChamber.chamberType === 'AERATED_GRIT' ? 'Min: 3.0 min' : 'Min: 45 sec'}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] text-slate-400">Blower Airflow</div>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                  {gritHydraulics.airflowTotalNm3Hr.toFixed(0)} <span className="text-xs font-normal">Nm³/h</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Helical roll v ≈ 0.3 m/s</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] text-slate-400">Total Headloss</div>
                <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                  {(gritHydraulics.headlossM * 1000).toFixed(0)} <span className="text-xs font-normal">mm</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Inlet + Baffle loss</div>
              </div>
            </div>

            {/* Validation messages */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Grit Chamber Performance Checks
              </h4>
              <div className="space-y-1.5">
                {gritHydraulics.validationMessages.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Grit chamber geometry meets all detention time and helical air velocity criteria.</span>
                  </div>
                ) : (
                  gritHydraulics.validationMessages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-400">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{msg}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: FOG & SCUM */}
      {subTab === 'FOG' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                FOG / Grease Management
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Skimming Mechanism</label>
                  <select
                    value={fogManagement.fogType}
                    onChange={(e) => handleUpdateFog({ fogType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  >
                    <option value="AERATED_GREASE_CHAMBER">Aerated Surface Grease Chamber</option>
                    <option value="MECHANICAL_SKIMMER">Mechanical Surface Skimmer</option>
                    <option value="SKIMMING_BAFFLE">Manual Slotted Pipe Baffle</option>
                    <option value="DAF_SKIMMER">Dissolved Air Flotation (DAF)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Target FOG Removal Efficiency (%)</label>
                  <input
                    type="number"
                    min="30"
                    max="95"
                    step="5"
                    value={fogManagement.targetRemovalPct}
                    onChange={(e) => handleUpdateFog({ targetRemovalPct: parseFloat(e.target.value) || 70 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Standard mechanical skimming: 60-80%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] text-slate-400">Daily FOG Skimmed</div>
                <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                  {fogHydraulics.removedFogKgDay.toFixed(1)} <span className="text-xs font-normal">kg/d</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Effluent: {fogHydraulics.remainingFogConcentrationMgL.toFixed(1)} mg/L
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] text-slate-400">Daily Scum Volume</div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {fogHydraulics.scumVolumeM3Day.toFixed(2)} <span className="text-xs font-normal">m³/d</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Wet floating layer</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] text-slate-400">Data Source Status</div>
                <div className="text-xs font-bold font-mono text-amber-300 mt-1">
                  {fogHydraulics.isEstimated ? 'Estimated Default' : 'Measured Sample'}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Engine Flag</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PRELIMINARY HGL */}
      {subTab === 'HYDRAULIC_HGL' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-2">
              Preliminary Treatment Hydraulic Grade Line (HGL) Profile
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Station-by-station water level drops across Screen inlet, Bar screen, Grit chamber, Parshall flume, and Junction channels.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Station ID</th>
                    <th className="p-2.5">Unit Process</th>
                    <th className="p-2.5">Invert Elevation (m)</th>
                    <th className="p-2.5">Water Level HGL (m)</th>
                    <th className="p-2.5">Headloss (mm)</th>
                    <th className="p-2.5">Freeboard (m)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {plantHglProfile.stations.slice(0, 5).map((st) => (
                    <tr key={st.stationId} className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-cyan-300">{st.stationId}</td>
                      <td className="p-2.5 text-slate-200">{st.unitName}</td>
                      <td className="p-2.5 font-mono">{st.invertElevationMasl.toFixed(3)}</td>
                      <td className="p-2.5 font-bold font-mono text-emerald-400">{st.waterLevelMasl.toFixed(3)}</td>
                      <td className="p-2.5 font-mono text-amber-300">{(st.headlossThroughUnitM * 1000).toFixed(0)}</td>
                      <td className="p-2.5 font-mono">{st.freeboardM.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
