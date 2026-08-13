/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Design Basis & Wastewater Flow Hydraulics Panel
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectState, PopulationProjectionMethod, PeakingMethod, InfiltrationMethod } from '../types/stp';
import { CalculationEngine } from '../engine/calculations';
import { DesignBasisEngine } from '../engine/designBasisEngine';
import { PopulationEngine } from '../engine/populationEngine';
import { Users, Droplets, Calculator, CheckCircle2, TrendingUp, BarChart3, Building2, ShieldAlert } from 'lucide-react';

interface DesignBasisPanelProps {
  project: ProjectState;
  onUpdateProject: (updated: ProjectState) => void;
  onInspectCalculation: (calcId: string) => void;
}

export const DesignBasisPanel: React.FC<DesignBasisPanelProps> = ({
  project,
  onUpdateProject,
  onInspectCalculation,
}) => {
  const scenario = project.scenarios[project.activeScenarioId];
  const basis = scenario.designBasis;
  const [activeTab, setActiveTab] = useState<'DEMO' | 'HYD' | 'STAGES' | 'DIURNAL' | 'IND'>('DEMO');

  const handleUpdateBasis = (updater: (b: typeof basis) => void) => {
    const updated = JSON.parse(JSON.stringify(project)) as ProjectState;
    const currentScenario = updated.scenarios[updated.activeScenarioId];
    updater(currentScenario.designBasis);

    // Trigger calculation engine refresh
    updated.calculations = CalculationEngine.runAllCalculations(updated);
    onUpdateProject(updated);
  };

  const regressionStats = PopulationEngine.calculateCensusRegression(basis.censusHistory || [], 2026 + (basis.designHorizonYears || 30));
  const diurnalCurve = DesignBasisEngine.getDiurnalProfile(basis.diurnalProfileType || 'RESIDENTIAL');
  const diurnalPoints = diurnalCurve.hourlyMultipliers.map((multiplier, hour) => ({
    hour,
    multiplier,
    flowM3d: (basis.adwfM3d || 10000) * multiplier,
  }));

  return (
    <div className="p-6 space-y-6 text-slate-200">
      {/* Page Title & Standards Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Design Basis, Wastewater Flow & Hydraulic Generation Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Demographic projections, peaking factors, I/I infiltration sub-models, multi-horizon stage planning, and industrial discharge blending.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
          <span className="text-cyan-400 font-bold">Standards:</span>
          <span>CPHEEO Manual &bull; Metcalf & Eddy Ch. 3 &bull; WEF MOP 8</span>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-medium">
        <button
          onClick={() => setActiveTab('DEMO')}
          className={`pb-2.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'DEMO' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>1. Demographics & Population</span>
        </button>

        <button
          onClick={() => setActiveTab('HYD')}
          className={`pb-2.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'HYD' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>2. Flow Hydraulics & Peaking</span>
        </button>

        <button
          onClick={() => setActiveTab('STAGES')}
          className={`pb-2.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'STAGES' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>3. Multi-Horizon Stages</span>
        </button>

        <button
          onClick={() => setActiveTab('DIURNAL')}
          className={`pb-2.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'DIURNAL' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>4. Diurnal Flow Hydrograph</span>
        </button>

        <button
          onClick={() => setActiveTab('IND')}
          className={`pb-2.5 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'IND' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>5. Industrial Dischargers</span>
        </button>
      </div>

      {/* Tab 1: Demographics & Population Projection */}
      {activeTab === 'DEMO' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center justify-between">
                <span>Projection Model & Growth Inputs</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                  CPHEEO Section 2.3
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-medium mb-1">Projection Calculation Method</label>
                  <select
                    value={basis.selectedPopMethod || 'GEOMETRIC'}
                    onChange={(e) => handleUpdateBasis((b) => (b.selectedPopMethod = e.target.value as PopulationProjectionMethod))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="GEOMETRIC">Geometric Compound Increase (Standard Urban)</option>
                    <option value="ARITHMETIC">Arithmetic Uniform Rate (Established Cities)</option>
                    <option value="LOGISTIC">Logistic S-Curve Saturation (Land Constrained)</option>
                    <option value="CENSUS_OLS">Census Historical OLS Linear Regression</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Present Population (P_pres)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={basis.presentPopulation}
                      onChange={(e) => handleUpdateBasis((b) => (b.presentPopulation = parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-2.5 top-2.5 text-slate-500 font-mono text-[10px]">capita</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Annual Growth Rate (r)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={basis.growthRatePct}
                      onChange={(e) => handleUpdateBasis((b) => (b.growthRatePct = parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-2.5 top-2.5 text-slate-500 font-mono text-[10px]">% / yr</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Design Horizon (Ultimate)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={basis.designHorizonYears}
                      onChange={(e) => handleUpdateBasis((b) => (b.designHorizonYears = parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-2.5 top-2.5 text-slate-500 font-mono text-[10px]">years</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Intermediate Horizon (Phase 1)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={basis.intermediateHorizonYears || 15}
                      onChange={(e) => handleUpdateBasis((b) => (b.intermediateHorizonYears = parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-2.5 top-2.5 text-slate-500 font-mono text-[10px]">years</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Census Data Points Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center justify-between">
                <span>Historical Census Records for Regression</span>
                <button
                  onClick={() =>
                    handleUpdateBasis((b) => {
                      if (!b.censusHistory) b.censusHistory = [];
                      b.censusHistory.push({ year: 2036, population: 60000 });
                    })
                  }
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  + Add Census Record
                </button>
              </h3>

              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2">Census Year</th>
                      <th className="py-2">Recorded Population</th>
                      <th className="py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(basis.censusHistory || []).map((pt, idx) => (
                      <tr key={idx} className="border-b border-slate-800/60">
                        <td className="py-2">
                          <input
                            type="number"
                            value={pt.year}
                            onChange={(e) =>
                              handleUpdateBasis((b) => {
                                if (b.censusHistory && b.censusHistory[idx]) b.censusHistory[idx].year = parseInt(e.target.value) || 2026;
                              })
                            }
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 w-24 focus:outline-none"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            value={pt.population}
                            onChange={(e) =>
                              handleUpdateBasis((b) => {
                                if (b.censusHistory && b.censusHistory[idx]) b.censusHistory[idx].population = parseInt(e.target.value) || 0;
                              })
                            }
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100 w-32 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() =>
                              handleUpdateBasis((b) => {
                                if (b.censusHistory) b.censusHistory.splice(idx, 1);
                              })
                            }
                            className="text-rose-400 hover:text-rose-300 text-xs"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {basis.censusHistory && basis.censusHistory.length >= 2 && (
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs font-mono text-slate-300 space-y-1">
                  <div className="text-cyan-400 font-bold">OLS Regression Fitting Result:</div>
                  <div>Equation: Pop = {regressionStats.slope.toFixed(2)} * (Year) + {regressionStats.intercept.toFixed(0)}</div>
                  <div>Coefficient of Determination (R²): <span className="text-emerald-400 font-bold">{regressionStats.rSquared.toFixed(4)}</span></div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Computed Demographic Results
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Immediate Stage Population (Year 0)</span>
                    <span className="text-base font-bold text-slate-200">{basis.immediatePopulation || basis.presentPopulation} capita</span>
                  </div>
                  <Calculator className="w-4 h-4 text-cyan-400" />
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Intermediate Stage Population (Year 15)</span>
                    <span className="text-base font-bold text-amber-300">{(basis.intermediatePopulation || 72400).toLocaleString()} capita</span>
                  </div>
                  <Calculator className="w-4 h-4 text-amber-400" />
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ultimate Target Design Population (Year 30)</span>
                    <span className="text-lg font-bold text-emerald-400">{(basis.designPopulation || 104877).toLocaleString()} capita</span>
                  </div>
                  <Calculator className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Flow Hydraulics & Peaking Engine */}
      {activeTab === 'HYD' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                1. Water Demand & Sewerage Return Factors
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Per Capita Demand (q_cap)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={basis.perCapitaWaterDemandLpd}
                      onChange={(e) => handleUpdateBasis((b) => (b.perCapitaWaterDemandLpd = parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-2.5 top-2.5 text-slate-500 font-mono text-[10px]">LPD</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Domestic Return Factor (C_ret)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={basis.sewerageReturnFactor}
                      onChange={(e) => handleUpdateBasis((b) => (b.sewerageReturnFactor = parseFloat(e.target.value) || 0))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <span className="absolute right-2.5 top-2.5 text-slate-500 font-mono text-[10px]">ratio (80%)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Peaking Factor Formula</label>
                  <select
                    value={basis.peakingMethod || 'HARMON'}
                    onChange={(e) => handleUpdateBasis((b) => (b.peakingMethod = e.target.value as PeakingMethod))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="HARMON">Harmon Formula: PF = 1 + 14/(4+sqrt(P))</option>
                    <option value="BABBIT">Babbit Formula: PF = 5 / (P^0.2)</option>
                    <option value="GIFFT">Gifft Formula: PF = 5 / (P^0.167)</option>
                    <option value="FAIR_GEYER">Fair-Geyer Equation</option>
                    <option value="ATV_A138">German ATV-A 138 Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Infiltration Sub-Model Method</label>
                  <select
                    value={basis.infiltrationConfig?.method || 'PIPE_LENGTH'}
                    onChange={(e) =>
                      handleUpdateBasis((b) => {
                        if (!b.infiltrationConfig) b.infiltrationConfig = { method: 'PIPE_LENGTH', pipeLengthKm: 45, rateLpsKm: 0.3, catchmentAreaHa: 450, rateLhaDay: 2800, perCapitaLpd: 15, rainInflowPct: 20, seasonalFactor: 1.0, designInfiltrationLps: 15, designInflowLps: 25 };
                        b.infiltrationConfig.method = e.target.value as InfiltrationMethod;
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="PIPE_LENGTH">Sewer Network Length (L/s per km pipe)</option>
                    <option value="CATCHMENT_AREA">Drainage Catchment Area (m³/ha/day)</option>
                    <option value="PER_CAPITA">Per Capita Infiltration Allowance (LPD)</option>
                    <option value="FIXED">Fixed Engineering Flow Rate (L/s)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Computed Flow Matrix Results
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Average Dry Weather Flow (ADWF)</span>
                    <span className="text-lg font-bold text-cyan-300">{basis.adwfM3d.toLocaleString()} m³/day</span>
                  </div>
                  <Calculator className="w-4 h-4 text-cyan-400" />
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Peak Dry Weather Flow (PDWF)</span>
                    <span className="text-lg font-bold text-amber-300">{(basis.pdwfM3d || 28858).toLocaleString()} m³/day</span>
                  </div>
                  <Calculator className="w-4 h-4 text-amber-400" />
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Peak Wet Weather Hydraulic Design Flow (PWWF)</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {basis.pwwfM3d.toLocaleString()} m³/day ({basis.peakFlowLps} L/s)
                    </span>
                  </div>
                  <Calculator className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Multi-Horizon Stages */}
      {activeTab === 'STAGES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs font-mono">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Multi-Horizon Design Stages Breakdown (Immediate vs Intermediate vs Ultimate)
          </h3>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2">Stage Horizon</th>
                <th className="py-2">Year</th>
                <th className="py-2">Population</th>
                <th className="py-2">ADWF (m³/d)</th>
                <th className="py-2">PWWF (m³/d)</th>
                <th className="py-2">BOD5 Load (kg/d)</th>
                <th className="py-2">COD Load (kg/d)</th>
                <th className="py-2">TSS Load (kg/d)</th>
              </tr>
            </thead>
            <tbody>
              {(basis.stages || []).map((stage, idx) => (
                <tr key={idx} className="border-b border-slate-800/60">
                  <td className="py-2.5 font-bold text-cyan-400">{stage.stageName}</td>
                  <td className="py-2.5">{stage.horizonYear}</td>
                  <td className="py-2.5">{stage.population.toLocaleString()}</td>
                  <td className="py-2.5 text-cyan-300">{stage.adwfM3d.toLocaleString()}</td>
                  <td className="py-2.5 text-emerald-400 font-bold">{stage.pwwfM3d.toLocaleString()}</td>
                  <td className="py-2.5">{stage.bodMassKgD.toLocaleString()}</td>
                  <td className="py-2.5">{stage.codMassKgD.toLocaleString()}</td>
                  <td className="py-2.5">{stage.tssMassKgD.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Diurnal Hydrograph */}
      {activeTab === 'DIURNAL' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center justify-between">
            <span>24-Hour Diurnal Flow Hydrograph Simulation</span>
            <span className="text-xs text-slate-400 font-mono">Peak PF: {basis.hourlyPeakFactor}x</span>
          </h3>

          <div className="h-48 flex items-end space-x-1.5 pt-6 pb-2 border-b border-slate-800 overflow-x-auto">
            {diurnalPoints.map((pt, idx) => {
              const maxFlow = basis.adwfM3d * (basis.hourlyPeakFactor || 2.25);
              const heightPct = Math.min(100, Math.max(10, (pt.flowM3d / maxFlow) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative min-w-[20px]">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t transition-all ${
                      pt.multiplier > 1.8 ? 'bg-amber-500' : pt.multiplier < 0.5 ? 'bg-cyan-700' : 'bg-cyan-500'
                    }`}
                  />
                  <span className="text-[9px] text-slate-500 font-mono mt-1">{pt.hour}h</span>

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-950 border border-slate-700 text-slate-100 text-[10px] p-2 rounded shadow-lg font-mono z-10 whitespace-nowrap">
                    <div>Hour {pt.hour}:00</div>
                    <div>Flow: {pt.flowM3d.toLocaleString()} m³/d</div>
                    <div>Mult: {pt.multiplier.toFixed(2)}x</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Industrial Dischargers */}
      {activeTab === 'IND' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center justify-between">
            <span>Industrial Discharger Contribution Profiles</span>
            <button
              onClick={() =>
                handleUpdateBasis((b) => {
                  if (!b.industrialProfiles) b.industrialProfiles = [];
                  b.industrialProfiles.push({
                    id: `IND-0${b.industrialProfiles.length + 1}`,
                    name: 'New Industrial Discharger',
                    industryCategory: 'FOOD_BEVERAGE',
                    flowM3d: 250,
                    bod5MgL: 500,
                    codMgL: 1000,
                    tssMgL: 300,
                    tknMgL: 40,
                    tpMgL: 8,
                    isPretreated: true,
                    peakFactor: 1.5,
                    heavyMetalsPresent: false,
                    toxicityRisk: 'LOW',
                  });
                })
              }
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              + Add Industrial Discharger
            </button>
          </h3>

          <div className="overflow-x-auto font-mono">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2">Facility Name</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Flow (m³/d)</th>
                  <th className="py-2">BOD (mg/L)</th>
                  <th className="py-2">COD (mg/L)</th>
                  <th className="py-2">Pretreated</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {(basis.industrialProfiles || []).map((ind, idx) => (
                  <tr key={idx} className="border-b border-slate-800/60">
                    <td className="py-2 font-bold text-slate-100">{ind.name}</td>
                    <td className="py-2 text-cyan-400">{ind.industryCategory}</td>
                    <td className="py-2">{ind.flowM3d}</td>
                    <td className="py-2">{ind.bod5MgL}</td>
                    <td className="py-2">{ind.codMgL}</td>
                    <td className="py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${ind.isPretreated ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                        {ind.isPretreated ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() =>
                          handleUpdateBasis((b) => {
                            if (b.industrialProfiles) b.industrialProfiles.splice(idx, 1);
                          })
                        }
                        className="text-rose-400 hover:text-rose-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
