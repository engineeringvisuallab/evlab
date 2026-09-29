/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 04: Primary Treatment Panel (Sedimentation, Lamella, Sludge Balance, Alternative Scoring)
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectState } from '../types/stp';
import {
  PrimaryClarifierDesignConfig,
  PrimaryAlternativeType,
} from '../types/preliminaryPrimary';
import { CalculationEngine } from '../engine/calculations';
import { PrimaryClarifierEngine } from '../engine/primaryClarifierEngine';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Award,
} from 'lucide-react';

interface PrimaryTreatmentPanelProps {
  project: ProjectState;
  onUpdateProject: (updated: ProjectState) => void;
}

export const PrimaryTreatmentPanel: React.FC<PrimaryTreatmentPanelProps> = ({
  project,
  onUpdateProject,
}) => {
  const scenario = project.scenarios[project.activeScenarioId];
  const prelim = scenario.preliminaryPrimary;

  const [activeSubTab, setActiveSubTab] = useState<'CLARIFIER_DESIGN' | 'SLUDGE_MASS_BALANCE' | 'ALTERNATIVE_MCDA' | 'PLANT_HGL'>('CLARIFIER_DESIGN');

  if (!prelim) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Primary treatment state is initializing...</p>
      </div>
    );
  }

  const { primaryClarifier, primaryHydraulics, primarySludge, alternativeComparison, plantHglProfile } = prelim;

  // Update Clarifier Configuration
  const handleUpdateClarifier = (updates: Partial<PrimaryClarifierDesignConfig>) => {
    const updatedClarifier: PrimaryClarifierDesignConfig = { ...primaryClarifier, ...updates };
    const updatedPrelim = { ...prelim, primaryClarifier: updatedClarifier };
    const updatedScenario = { ...scenario, preliminaryPrimary: updatedPrelim };
    const updatedProject = {
      ...project,
      scenarios: { ...project.scenarios, [scenario.id]: updatedScenario },
    };
    CalculationEngine.runAllCalculations(updatedProject);
    onUpdateProject({ ...updatedProject });
  };

  // Switch clarifier technology type
  const handleSwitchType = (newType: PrimaryAlternativeType) => {
    let newConfig: PrimaryClarifierDesignConfig;
    if (newType === 'LAMELLA_PLATE_CLARIFIER') {
      newConfig = PrimaryClarifierEngine.createDefaultLamellaClarifier();
    } else if (newType === 'RECTANGULAR_CLARIFIER') {
      newConfig = PrimaryClarifierEngine.createDefaultRectangularClarifier();
    } else {
      newConfig = PrimaryClarifierEngine.createDefaultCircularClarifier();
      newConfig.alternativeType = newType;
    }
    handleUpdateClarifier(newConfig);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Sub-Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 text-xs font-mono font-semibold">
              PHASE 04 ENGINE
            </span>
            <h1 className="text-xl font-bold text-slate-100">Primary Clarification & Sedimentation</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gravity Clarifiers, Lamella Plate Settlers, Primary Sludge Mass Balance & Technology MCDA.
          </p>
        </div>

        {/* Sub-Navigation Buttons */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab('CLARIFIER_DESIGN')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeSubTab === 'CLARIFIER_DESIGN'
                ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-700/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Clarifier Sizing
          </button>
          <button
            onClick={() => setActiveSubTab('SLUDGE_MASS_BALANCE')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeSubTab === 'SLUDGE_MASS_BALANCE'
                ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-700/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Sludge Balance
          </button>
          <button
            onClick={() => setActiveSubTab('ALTERNATIVE_MCDA')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeSubTab === 'ALTERNATIVE_MCDA'
                ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-700/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Alternative MCDA
          </button>
          <button
            onClick={() => setActiveSubTab('PLANT_HGL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeSubTab === 'PLANT_HGL'
                ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-700/50 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Complete Plant HGL
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: CLARIFIER SIZING & HYDRAULICS */}
      {activeSubTab === 'CLARIFIER_DESIGN' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Primary Clarifier Geometry & Sizing
              </h2>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1">Technology Archetype</label>
                  <select
                    value={primaryClarifier.alternativeType}
                    onChange={(e) => handleSwitchType(e.target.value as PrimaryAlternativeType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  >
                    <option value="CIRCULAR_CLARIFIER">Circular Radial Flow (Center Feed)</option>
                    <option value="RECTANGULAR_CLARIFIER">Rectangular Counter-Current Basin</option>
                    <option value="LAMELLA_PLATE_CLARIFIER">Lamella Inclined Plate Settler (60°)</option>
                    <option value="TUBE_SETTLER">Tube Settler Clarifier Module</option>
                    <option value="PRIMARY_DAF">Dissolved Air Flotation (DAF)</option>
                  </select>
                </div>

                {primaryClarifier.circular && (
                  <>
                    <div>
                      <label className="block text-slate-400 mb-1">Diameter (m)</label>
                      <input
                        type="number"
                        min="6"
                        max="60"
                        step="0.5"
                        value={primaryClarifier.circular.diameterM}
                        onChange={(e) =>
                          handleUpdateClarifier({
                            circular: {
                              ...primaryClarifier.circular!,
                              diameterM: parseFloat(e.target.value) || 18.0,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Side Water Depth (m)</label>
                      <input
                        type="number"
                        min="2.0"
                        max="6.0"
                        step="0.1"
                        value={primaryClarifier.circular.sideWaterDepthM}
                        onChange={(e) =>
                          handleUpdateClarifier({
                            circular: {
                              ...primaryClarifier.circular!,
                              sideWaterDepthM: parseFloat(e.target.value) || 3.5,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                      />
                    </div>
                  </>
                )}

                {primaryClarifier.lamella && (
                  <>
                    <div>
                      <label className="block text-slate-400 mb-1">Plate Pack Length (m)</label>
                      <input
                        type="number"
                        min="1.0"
                        max="3.0"
                        step="0.1"
                        value={primaryClarifier.lamella.plateLengthM}
                        onChange={(e) =>
                          handleUpdateClarifier({
                            lamella: {
                              ...primaryClarifier.lamella!,
                              plateLengthM: parseFloat(e.target.value) || 2.0,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Plate Inclination (°)</label>
                      <input
                        type="number"
                        min="45"
                        max="70"
                        value={primaryClarifier.lamella.plateAngleDeg}
                        onChange={(e) =>
                          handleUpdateClarifier({
                            lamella: {
                              ...primaryClarifier.lamella!,
                              plateAngleDeg: parseFloat(e.target.value) || 60,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-slate-400 mb-1">Total Tanks</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={primaryClarifier.tankCount}
                    onChange={(e) => handleUpdateClarifier({ tankCount: parseInt(e.target.value) || 2 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Duty Tanks</label>
                  <input
                    type="number"
                    min="1"
                    max={primaryClarifier.tankCount}
                    value={primaryClarifier.dutyCount}
                    onChange={(e) => handleUpdateClarifier({ dutyCount: parseInt(e.target.value) || 2 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Max Design Peak SOR (m³/m²·d)</label>
                  <input
                    type="number"
                    min="20"
                    max="60"
                    value={primaryClarifier.designSorPeakM3M2D}
                    onChange={(e) => handleUpdateClarifier({ designSorPeakM3M2D: parseFloat(e.target.value) || 40 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Min Design HRT (h)</label>
                  <input
                    type="number"
                    min="1.0"
                    max="4.0"
                    step="0.2"
                    value={primaryClarifier.minDetentionTimeHours}
                    onChange={(e) => handleUpdateClarifier({ minDetentionTimeHours: parseFloat(e.target.value) || 1.5 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Removal Assumption Sliders */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Particulate Removal Model Assumptions
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Expected TSS Removal (%)</label>
                  <input
                    type="number"
                    min="40"
                    max="80"
                    value={primaryClarifier.expectedTssRemovalPct}
                    onChange={(e) => handleUpdateClarifier({ expectedTssRemovalPct: parseFloat(e.target.value) || 60 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Standard gravity: 55 - 65%</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Expected BOD₅ Removal (%)</label>
                  <input
                    type="number"
                    min="20"
                    max="50"
                    value={primaryClarifier.expectedBodRemovalPct}
                    onChange={(e) => handleUpdateClarifier({ expectedBodRemovalPct: parseFloat(e.target.value) || 35 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Particulate organic fraction: 30 - 40%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Display Column (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Key Hydraulic Metrics Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] text-slate-400">Peak SOR (Surface Loading)</div>
                <div className={`text-xl font-bold font-mono mt-1 ${
                  primaryHydraulics.actualSorPeakM3M2D > 45 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {primaryHydraulics.actualSorPeakM3M2D.toFixed(1)} <span className="text-xs font-normal">m³/m²·d</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Avg: {primaryHydraulics.actualSorAverageM3M2D.toFixed(1)} m³/m²·d
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] text-slate-400">Peak HRT (Detention)</div>
                <div className={`text-xl font-bold font-mono mt-1 ${
                  primaryHydraulics.actualHrtPeakHours < 1.5 ? 'text-amber-400' : 'text-cyan-400'
                }`}>
                  {primaryHydraulics.actualHrtPeakHours.toFixed(2)} <span className="text-xs font-normal">hours</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Avg HRT: {primaryHydraulics.actualHrtAverageHours.toFixed(2)} h (Min {primaryClarifier.minDetentionTimeHours}h)
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] text-slate-400">Peak Weir Loading Rate</div>
                <div className={`text-xl font-bold font-mono mt-1 ${
                  primaryHydraulics.weirLoadingPeakM3MD > 250 ? 'text-rose-400' : 'text-amber-300'
                }`}>
                  {primaryHydraulics.weirLoadingPeakM3MD.toFixed(1)} <span className="text-xs font-normal">m³/m·d</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Limit: ≤ 250 m³/m·d</div>
              </div>
            </div>

            {/* Sizing & Geometry Summary Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">
                Primary Clarification Physical Dimensions Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Total Surface Area</span>
                  <span className="text-cyan-300 font-bold text-sm">
                    {primaryHydraulics.surfaceAreaTotalM2.toFixed(1)} m²
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Total Volume</span>
                  <span className="text-cyan-300 font-bold text-sm">
                    {primaryHydraulics.tankVolumeTotalM3.toFixed(1)} m³
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Total Weir Length</span>
                  <span className="text-cyan-300 font-bold text-sm">
                    {primaryHydraulics.totalWeirLengthM.toFixed(1)} m
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Weir Head Drop</span>
                  <span className="text-amber-300 font-bold text-sm">
                    {(primaryHydraulics.weirDropM * 1000).toFixed(0)} mm
                  </span>
                </div>
              </div>
            </div>

            {/* Validation Messages */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Engineering Design Validation Checks
              </h4>
              <div className="space-y-1.5">
                {primaryHydraulics.validationMessages.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Primary clarifier complies with all peak SOR, minimum HRT, and weir loading criteria.</span>
                  </div>
                ) : (
                  primaryHydraulics.validationMessages.map((msg, i) => (
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

      {/* SUB-TAB 2: SLUDGE MASS BALANCE */}
      {activeSubTab === 'SLUDGE_MASS_BALANCE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400">Dry Solids Mass Production</div>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {primarySludge.primaryDrySolidsKgDay.toFixed(1)} <span className="text-xs font-normal">kg DS/d</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                TSS Removed: {primarySludge.tssRemovedKgDay.toFixed(1)} kg/d
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400">Wet Sludge Volume</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {primarySludge.primaryWetSludgeM3Day.toFixed(1)} <span className="text-xs font-normal">m³/day</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                @ {primaryClarifier.sludgeConcentrationPct}% Dry Solids Concentration
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400">Sludge Withdrawal Pumping</div>
              <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
                {primarySludge.sludgePumpingRateM3Hr.toFixed(1)} <span className="text-xs font-normal">m³/h</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {primarySludge.sludgeWithdrawalCyclesPerDay} cycles/day
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400">Hopper Retention Capacity</div>
              <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
                {primarySludge.sludgeStorageHours.toFixed(1)} <span className="text-xs font-normal">hours</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                Safe window before septicity (&lt; 6.0 h)
              </div>
            </div>
          </div>

          {/* Mass Balance Flow Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">
              Influent vs Effluent Pollutant Mass Balance (Primary Partitioning)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Constituent</th>
                    <th className="p-3">Raw Influent</th>
                    <th className="p-3">Primary Sludge Underflow</th>
                    <th className="p-3">Primary Settled Effluent</th>
                    <th className="p-3">Removal Fraction</th>
                    <th className="p-3">Fate / Downstream</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="p-3 font-semibold text-slate-200">Total Suspended Solids (TSS)</td>
                    <td className="p-3">{scenario.influentQuality.tss.designValue} mg/L</td>
                    <td className="p-3 text-cyan-300 font-bold">{(primaryClarifier.sludgeConcentrationPct * 10000).toLocaleString()} mg/L</td>
                    <td className="p-3 text-emerald-400 font-bold">{(scenario.influentQuality.tss.designValue * (1 - primaryClarifier.expectedTssRemovalPct / 100)).toFixed(1)} mg/L</td>
                    <td className="p-3 text-emerald-400 font-bold">{primaryClarifier.expectedTssRemovalPct}%</td>
                    <td className="p-3 text-slate-400">Sludge to Digester / Dewatering</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-200">Biochemical Oxygen Demand (BOD₅)</td>
                    <td className="p-3">{scenario.influentQuality.bod5.designValue} mg/L</td>
                    <td className="p-3 text-cyan-300 font-bold">Particulate Solids Layer</td>
                    <td className="p-3 text-emerald-400 font-bold">{(scenario.influentQuality.bod5.designValue * (1 - primaryClarifier.expectedBodRemovalPct / 100)).toFixed(1)} mg/L</td>
                    <td className="p-3 text-emerald-400 font-bold">{primaryClarifier.expectedBodRemovalPct}%</td>
                    <td className="p-3 text-slate-400">Soluble BOD to Biological Aeration</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-200">Chemical Oxygen Demand (COD)</td>
                    <td className="p-3">{scenario.influentQuality.cod.designValue} mg/L</td>
                    <td className="p-3 text-cyan-300 font-bold">Settled Particulate COD</td>
                    <td className="p-3 text-emerald-400 font-bold">{(scenario.influentQuality.cod.designValue * (1 - primaryClarifier.expectedCodRemovalPct / 100)).toFixed(1)} mg/L</td>
                    <td className="p-3 text-emerald-400 font-bold">{primaryClarifier.expectedCodRemovalPct}%</td>
                    <td className="p-3 text-slate-400">Forwarded to Aeration</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TECHNOLOGY ALTERNATIVE MCDA SCORING */}
      {activeSubTab === 'ALTERNATIVE_MCDA' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  Multi-Criteria Decision Analysis (MCDA) Scoring Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Engine-ranked primary treatment alternatives scored against site land constraints, CAPEX, OPEX, energy intensity, and operability.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded border border-emerald-800/40">
                Recommended: {alternativeComparison.recommendedAlternative}
              </span>
            </div>
          </div>

          {/* Scored Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alternativeComparison.alternatives.map((alt) => {
              const isWinner = alt.recommendationRank === 1;

              return (
                <div
                  key={alt.alternativeType}
                  className={`p-5 rounded-xl border transition-all ${
                    isWinner
                      ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      isWinner ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'bg-slate-800 text-slate-400'
                    }`}>
                      RANK #{alt.recommendationRank}
                    </span>
                    <span className="text-base font-bold font-mono text-cyan-300">
                      {alt.totalWeightedScore.toFixed(1)} / 100
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 mb-1">{alt.title}</h4>
                  <p className="text-xs text-slate-400 mb-4">{alt.description}</p>

                  <div className="space-y-1.5 text-xs font-mono border-t border-slate-800 pt-3 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Land Footprint:</span>
                      <span>{alt.landRequiredM2} m²</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CAPEX Index:</span>
                      <span>${(alt.capexUSD / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">OPEX/Year:</span>
                      <span>${(alt.opexUSDPerYear / 1000).toFixed(0)}k/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Energy Intensity:</span>
                      <span>{alt.energyIntensityKwhPerM3.toFixed(3)} kWh/m³</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">TSS Removal:</span>
                      <span className="text-emerald-400 font-bold">{alt.tssRemovalPct}%</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSwitchType(alt.alternativeType)}
                    className="w-full mt-4 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-cyan-900/60 hover:text-cyan-200 border border-slate-700 hover:border-cyan-700 transition-all text-slate-200"
                  >
                    Select This Technology
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: PLANT HGL LONGITUDINAL PROFILE */}
      {activeSubTab === 'PLANT_HGL' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">
                  Complete Preliminary & Primary Hydraulic Grade Line (HGL / EGL)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Inlet Water Level: <span className="font-mono text-cyan-300 font-bold">{plantHglProfile.inletHglMasl.toFixed(3)} m</span> → Primary Effluent: <span className="font-mono text-emerald-400 font-bold">{plantHglProfile.effluentHglMasl.toFixed(3)} m</span> (Total Drop: <span className="font-mono text-amber-300 font-bold">{(plantHglProfile.totalHeadlossM * 1000).toFixed(0)} mm</span>)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Station ID</th>
                    <th className="p-2.5">Unit Process Description</th>
                    <th className="p-2.5">Invert Elevation (m)</th>
                    <th className="p-2.5">Water Surface HGL (m)</th>
                    <th className="p-2.5">Energy Line EGL (m)</th>
                    <th className="p-2.5">Station Drop (mm)</th>
                    <th className="p-2.5">Freeboard (m)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {plantHglProfile.stations.map((st) => (
                    <tr key={st.stationId} className="hover:bg-slate-800/40">
                      <td className="p-2.5 text-cyan-300 font-bold">{st.stationId}</td>
                      <td className="p-2.5 text-slate-100">{st.unitName}</td>
                      <td className="p-2.5 font-mono">{st.invertElevationMasl.toFixed(3)}</td>
                      <td className="p-2.5 font-bold font-mono text-emerald-400">{st.waterLevelMasl.toFixed(3)}</td>
                      <td className="p-2.5 font-mono text-cyan-400">{st.eglMasl.toFixed(3)}</td>
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
