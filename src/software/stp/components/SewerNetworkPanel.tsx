/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 03: Sewerage Collection Network & Pumping Station Panel
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Network, 
  ArrowDownCircle, 
  Zap, 
  Activity, 
  GitCommit, 
  Waves, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Maximize2, 
  RefreshCw,
  Info,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { ProjectState } from '../types/stp';
import { SewerNetworkState, SewerPipe, SewerNode, PumpingStation, PipeMaterial } from '../types/sewer';
import { SewerNetworkEngine } from '../engine/sewerNetworkEngine';
import { GravityHydraulicsEngine } from '../engine/gravityHydraulicsEngine';
import { PumpingStationEngine } from '../engine/pumpingStationEngine';

interface SewerNetworkPanelProps {
  project: ProjectState;
  onUpdateProject: (updated: ProjectState) => void;
}

export const SewerNetworkPanel: React.FC<SewerNetworkPanelProps> = ({
  project,
  onUpdateProject,
}) => {
  const activeScenario = project.scenarios[project.activeScenarioId];
  const network: SewerNetworkState = activeScenario?.sewerNetwork || SewerNetworkEngine.createDefaultNetwork(activeScenario?.designBasis?.peakFlowLps || 175);

  const [activeSubTab, setActiveSubTab] = useState<'GRAVITY_SEWER' | 'PUMPING_STATION' | 'HGL_PROFILE' | 'CRITERIA'>('GRAVITY_SEWER');
  const [selectedPipeId, setSelectedPipeId] = useState<string>('PIPE-02');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('MH-02');
  const [selectedPsId, setSelectedPsId] = useState<string>('PS-01');

  // Helper to persist updated network
  const handleSaveNetwork = (updatedNetwork: SewerNetworkState) => {
    const recomputed = SewerNetworkEngine.recomputeNetworkHydraulics(updatedNetwork);
    const updatedScenarios = {
      ...project.scenarios,
      [project.activeScenarioId]: {
        ...activeScenario,
        sewerNetwork: recomputed,
      },
    };
    onUpdateProject({
      ...project,
      scenarios: updatedScenarios,
    });
  };

  const selectedPipe: SewerPipe | undefined = network.pipes[selectedPipeId] || Object.values(network.pipes)[0];
  const selectedNode: SewerNode | undefined = network.nodes[selectedNodeId] || Object.values(network.nodes)[0];
  const selectedPs: PumpingStation | undefined = network.pumpingStations[selectedPsId] || Object.values(network.pumpingStations)[0];
  const profile = network.longitudinalProfiles[network.selectedProfileId || 'PROF-MAIN-TRUNK'] || Object.values(network.longitudinalProfiles)[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner & Key Network Indicators */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-slate-900 border border-slate-800 rounded-xl p-5 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Network className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold text-slate-100">Sewerage Collection Network & Pumping Stations</h1>
            <span className="bg-cyan-950 text-cyan-400 border border-cyan-700/60 text-xs px-2.5 py-0.5 rounded-full font-mono">
              PHASE 03 ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Topological flow accumulation, Manning partial-depth sewer hydraulics, lift station cycling, and longitudinal HGL/EGL profiles.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSaveNetwork(SewerNetworkEngine.recomputeNetworkHydraulics(network))}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Re-solve Network</span>
          </button>
        </div>
      </div>

      {/* 2. Top-Level Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] text-slate-400">Total Network Pipes</div>
          <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">{network.networkSummary.totalPipesCount} Links</div>
          <div className="text-[10px] text-slate-500">{network.networkSummary.totalNetworkLengthKm.toFixed(2)} km Total Length</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] text-slate-400">Manholes & Nodes</div>
          <div className="text-lg font-bold text-slate-200 font-mono mt-0.5">{network.networkSummary.totalManholesCount} Units</div>
          <div className="text-[10px] text-slate-500">Max Depth: {network.networkSummary.maxDepthM.toFixed(1)} m</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] text-slate-400">Pumping Stations</div>
          <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">{network.networkSummary.totalPumpStationsCount} PS</div>
          <div className="text-[10px] text-slate-500">Lift: 16.0 m to STP Inlet</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] text-slate-400">Terminal Inflow Peak</div>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{network.networkSummary.totalGravityFlowLps.toFixed(1)} L/s</div>
          <div className="text-[10px] text-slate-500">{Math.round(network.networkSummary.totalGravityFlowLps * 86.4)} m³/day Peak</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] text-slate-400">Flow Velocity Range</div>
          <div className="text-lg font-bold text-slate-200 font-mono mt-0.5">
            {network.networkSummary.minVelocityMps.toFixed(2)} - {network.networkSummary.maxVelocityMps.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-400">Self-Cleansing (≥ 0.6 m/s)</div>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
          <div className="text-[11px] text-slate-400">Hydraulic Surcharge</div>
          <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{network.networkSummary.surchargedPipesCount} Surcharged</div>
          <div className="text-[10px] text-slate-500">100% Free-Surface Gravity</div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => setActiveSubTab('GRAVITY_SEWER')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeSubTab === 'GRAVITY_SEWER'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <TrendingDown className="w-4 h-4" />
          <span>Gravity Sewer Hydraulics</span>
        </button>
        <button
          onClick={() => setActiveSubTab('PUMPING_STATION')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeSubTab === 'PUMPING_STATION'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Pumping Station & Force Main</span>
        </button>
        <button
          onClick={() => setActiveSubTab('HGL_PROFILE')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeSubTab === 'HGL_PROFILE'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Waves className="w-4 h-4" />
          <span>Longitudinal HGL / EGL Profile</span>
        </button>
        <button
          onClick={() => setActiveSubTab('CRITERIA')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeSubTab === 'CRITERIA'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Design Criteria & Standards</span>
        </button>
      </div>

      {/* 4. TAB 1: GRAVITY SEWER HYDRAULICS */}
      {activeSubTab === 'GRAVITY_SEWER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Pipe Inventory & Sizing Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Gravity Sewer Pipes Inventory</h3>
                  <p className="text-xs text-slate-400">Click a pipe segment to inspect partial-flow hydraulics and diameter optimization.</p>
                </div>
                <span className="text-xs text-cyan-400 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  Manning Formula Q = (1/n) A R^(2/3) S^(1/2)
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                      <th className="p-3">Pipe ID</th>
                      <th className="p-3">From → To</th>
                      <th className="p-3">Material & DN</th>
                      <th className="p-3 text-right">Length</th>
                      <th className="p-3 text-right">Slope</th>
                      <th className="p-3 text-right">Q_des (L/s)</th>
                      <th className="p-3 text-right">y/D Ratio</th>
                      <th className="p-3 text-right">Velocity</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {Object.values(network.pipes).map((pipe) => {
                      const isSelected = pipe.id === selectedPipeId;
                      const hyd = pipe.hydraulics;
                      return (
                        <tr
                          key={pipe.id}
                          onClick={() => setSelectedPipeId(pipe.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-cyan-950/40 text-cyan-200' : 'hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="p-3 font-mono font-bold text-cyan-400">{pipe.id}</td>
                          <td className="p-3 text-slate-300 font-mono">{pipe.upstreamNodeId} → {pipe.downstreamNodeId}</td>
                          <td className="p-3">
                            <span className="font-semibold">{pipe.nominalDiameterMm} mm</span>
                            <span className="text-[10px] text-slate-400 block">{pipe.material}</span>
                          </td>
                          <td className="p-3 text-right font-mono">{pipe.lengthM} m</td>
                          <td className="p-3 text-right font-mono">{(pipe.slopePermille).toFixed(2)} ‰</td>
                          <td className="p-3 text-right font-mono font-semibold text-emerald-400">{pipe.designFlowLps.toFixed(1)}</td>
                          <td className="p-3 text-right font-mono">
                            <span className={`px-1.5 py-0.5 rounded font-semibold ${
                              hyd.depthRatio > 0.80 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {(hyd.depthRatio * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-semibold">
                            <span className={hyd.velocityMps < 0.6 ? 'text-rose-400' : 'text-emerald-400'}>
                              {hyd.velocityMps.toFixed(2)} m/s
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {hyd.status === 'OK' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Pass
                              </span>
                            )}
                            {hyd.status === 'UNDER_UTILIZED' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                Low Flow
                              </span>
                            )}
                            {hyd.status === 'SURCHARGED' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                Surcharged
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Sizing Optimization Tool */}
            {selectedPipe && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Commercial Diameter Optimization Matrix: {selectedPipe.id}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Slope = {selectedPipe.slopePermille.toFixed(2)} ‰</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {GravityHydraulicsEngine.selectOptimalDiameter(
                    selectedPipe.designFlowLps,
                    selectedPipe.slopeRatio,
                    selectedPipe.material,
                    network.criteria
                  ).alternatives.slice(0, 4).map((alt) => {
                    const isCurrent = alt.diameterMm === selectedPipe.nominalDiameterMm;
                    return (
                      <div
                        key={alt.diameterMm}
                        className={`p-3 rounded-lg border text-xs transition-all ${
                          isCurrent
                            ? 'bg-cyan-950/60 border-cyan-500 shadow-inner'
                            : alt.isAcceptable
                            ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-200">
                          <span>DN {alt.diameterMm} mm</span>
                          {alt.isAcceptable ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                        <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-400">
                          <div>Depth (d/D): <span className="text-slate-200">{(alt.depthRatio * 100).toFixed(0)}%</span></div>
                          <div>Velocity: <span className={alt.velocityMps >= 0.6 ? 'text-emerald-400' : 'text-rose-400'}>{alt.velocityMps.toFixed(2)} m/s</span></div>
                        </div>
                        {!isCurrent && (
                          <button
                            onClick={() => {
                              const updated = { ...network, pipes: { ...network.pipes } };
                              updated.pipes[selectedPipe.id] = {
                                ...selectedPipe,
                                nominalDiameterMm: alt.diameterMm,
                                innerDiameterM: alt.diameterMm / 1000,
                              };
                              handleSaveNetwork(updated);
                            }}
                            className="mt-3 w-full py-1 text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700"
                          >
                            Apply DN {alt.diameterMm}
                          </button>
                        )}
                        {isCurrent && (
                          <div className="mt-3 text-center text-[10px] font-bold text-cyan-400 py-1 bg-cyan-900/40 rounded">
                            Active Sizing
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Selected Pipe Hydraulic Inspector */}
          {selectedPipe && (
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">{selectedPipe.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedPipe.id} ({selectedPipe.material})</p>
                  </div>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-cyan-300 font-mono">
                    DN {selectedPipe.nominalDiameterMm} mm
                  </span>
                </div>

                {/* Hydraulic cross section visualizer */}
                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-full border-2 border-slate-700 bg-slate-900 overflow-hidden flex items-end justify-center shadow-inner">
                    {/* Water Level Fill */}
                    <div
                      className="w-full bg-cyan-500/40 border-t-2 border-cyan-400 transition-all duration-300 flex items-center justify-center"
                      style={{ height: `${Math.min(100, selectedPipe.hydraulics.depthRatio * 100)}%` }}
                    >
                      <span className="text-[10px] font-bold text-cyan-100 font-mono">
                        {(selectedPipe.hydraulics.depthRatio * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <div className="text-xs font-bold text-slate-200">
                      Water Depth: {(selectedPipe.hydraulics.depthM * 1000).toFixed(0)} mm / {selectedPipe.nominalDiameterMm} mm
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Flow Area: {selectedPipe.hydraulics.flowAreaM2.toFixed(3)} m² | Hydraulic Rad: {selectedPipe.hydraulics.hydraulicRadiusM.toFixed(3)} m
                    </div>
                  </div>
                </div>

                {/* Hydraulic Key Indicators */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Design Peak Flow</span>
                    <div className="text-sm font-bold font-mono text-emerald-400">{selectedPipe.designFlowLps.toFixed(1)} L/s</div>
                    <span className="text-[10px] text-slate-500">{selectedPipe.designFlowM3d} m³/day</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Full Capacity</span>
                    <div className="text-sm font-bold font-mono text-slate-200">{selectedPipe.hydraulics.capacityFullLps.toFixed(1)} L/s</div>
                    <span className="text-[10px] text-slate-500">Utilization: {(selectedPipe.hydraulics.capacityRatio * 100).toFixed(0)}%</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Flow Velocity</span>
                    <div className="text-sm font-bold font-mono text-cyan-300">{selectedPipe.hydraulics.velocityMps.toFixed(2)} m/s</div>
                    <span className="text-[10px] text-emerald-400">Self-cleansing ≥ 0.60</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[11px]">Flow Regime / Froude</span>
                    <div className="text-sm font-bold font-mono text-slate-200">Fr = {selectedPipe.hydraulics.froudeNumber.toFixed(2)}</div>
                    <span className="text-[10px] text-cyan-400">{selectedPipe.hydraulics.flowRegime}</span>
                  </div>
                </div>

                {/* Civil Excavation & Cover Checks */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                  <div className="font-semibold text-slate-300 flex items-center justify-between">
                    <span>Trench Cover Depth</span>
                    <span className="font-mono text-cyan-300">Avg {selectedPipe.avgCoverM.toFixed(2)} m</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Upstream Cover: {selectedPipe.upstreamCoverM.toFixed(2)} m</span>
                    <span>Downstream Cover: {selectedPipe.downstreamCoverM.toFixed(2)} m</span>
                  </div>
                  <div className="pt-1 flex items-center space-x-1.5 text-[11px]">
                    {selectedPipe.isCoverAdequate ? (
                      <span className="text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Meets minimum 1.0m traffic cover requirement.</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Shallow cover depth under traffic road.</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 2: PUMPING STATION & FORCE MAIN */}
      {activeSubTab === 'PUMPING_STATION' && selectedPs && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Wet Well Sizing & Cycle Time */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">{selectedPs.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">ID: {selectedPs.id} (Wet Well)</p>
                  </div>
                </div>
                <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono">
                  Duty + Standby
                </span>
              </div>

              {/* Wet Well Dimensions */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Wet Well Internal Diameter</span>
                  <span className="font-mono font-bold text-slate-200">{selectedPs.wetWell.diameterOrWidthM.toFixed(1)} meters</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Effective Active Volume</span>
                  <span className="font-mono font-bold text-cyan-300">{selectedPs.wetWell.activeVolumeM3.toFixed(2)} m³</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Emergency Retention Storage</span>
                  <span className="font-mono font-bold text-slate-200">{selectedPs.wetWell.emergencyStorageM3.toFixed(1)} m³ ({selectedPs.wetWell.emergencyRetentionHours.toFixed(1)} hrs)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Min Allowable Cycle Time</span>
                  <span className="font-mono font-bold text-slate-200">{selectedPs.wetWell.minCycleTimeSec} seconds (6.0 min)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Max Starts Per Hour</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedPs.wetWell.startsPerHour.toFixed(0)} starts/hr (≤ 12 safe)</span>
                </div>
              </div>

              {/* Water Levels Visualization */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Well Level Benchmarks (MASL)</div>
                <div className="flex justify-between text-rose-400">
                  <span>High Alarm Level:</span>
                  <span>+{selectedPs.wetWell.alarmWaterLevelMasl.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between text-cyan-400">
                  <span>High Water Level (Start):</span>
                  <span>+{selectedPs.wetWell.highWaterLevelMasl.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Low Water Level (Stop):</span>
                  <span>+{selectedPs.wetWell.lowWaterLevelMasl.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Wet Well Floor Invert:</span>
                  <span>+{selectedPs.wetWell.floorLevelMasl.toFixed(2)} m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Pumps Staging & Power */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Submersible Sewage Pumps</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedPs.pumps.pumpModel}</p>
                </div>
                <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                  {selectedPs.pumps.dutyCount} Duty + {selectedPs.pumps.standbyCount} Standby
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Flow Rate per Pump</span>
                  <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">{selectedPs.pumps.flowRateLps} L/s</div>
                  <span className="text-[10px] text-slate-500">{(selectedPs.pumps.flowRateLps * 3.6).toFixed(0)} m³/h</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Total Dynamic Head</span>
                  <div className="text-base font-bold font-mono text-amber-400 mt-0.5">{selectedPs.pumps.headM.toFixed(1)} m</div>
                  <span className="text-[10px] text-slate-500">TDH at Peak Q</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Motor Electrical Power</span>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">{selectedPs.pumps.motorRatingKw} kW</div>
                  <span className="text-[10px] text-slate-500">400V 3-Phase / 50Hz</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[11px]">Pump Efficiency</span>
                  <div className="text-base font-bold font-mono text-slate-200 mt-0.5">{selectedPs.pumps.efficiencyPct}%</div>
                  <span className="text-[10px] text-cyan-400">VFD Speed Control: Yes</span>
                </div>
              </div>

              {/* NPSH Cavitation Check */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-300">Cavitation Margin (NPSHa vs NPSHr)</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    NPSH Available: {selectedPs.pumps.npshAvailableM}m &gt; NPSH Required: {selectedPs.pumps.npshRequiredM}m
                  </div>
                </div>
                <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-1 rounded text-[10px] border border-emerald-800">
                  Safe Margin (+5.3m)
                </span>
              </div>
            </div>
          </div>

          {/* Right: Force Main Hydraulics & Surge Risk */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Force Main Discharge Line</h3>
                  <p className="text-xs text-slate-400 font-mono">Discharges to: {selectedPs.forceMain.dischargeNodeId}</p>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  {selectedPs.forceMain.material}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Force Main Internal Diameter</span>
                  <span className="font-mono font-bold text-slate-200">{selectedPs.forceMain.internalDiameterMm} mm</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Total Pipeline Length</span>
                  <span className="font-mono font-bold text-slate-200">{selectedPs.forceMain.lengthM} meters</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Discharge Flow Velocity</span>
                  <span className="font-mono font-bold text-cyan-300">{selectedPs.forceMain.velocityMps.toFixed(2)} m/s</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Static Lift Elevation</span>
                  <span className="font-mono font-bold text-slate-200">{selectedPs.forceMain.staticLiftM.toFixed(1)} meters</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Friction Headloss (Hazen-Williams)</span>
                  <span className="font-mono font-bold text-amber-400">{selectedPs.forceMain.frictionHeadlossM.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                  <span className="text-slate-400">Minor Losses (Valves & Fittings)</span>
                  <span className="font-mono font-bold text-slate-200">{selectedPs.forceMain.minorHeadlossM.toFixed(2)} m</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400 font-bold">Total Dynamic Head (TDH)</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{selectedPs.forceMain.totalDynamicHeadM.toFixed(2)} meters</span>
                </div>
              </div>

              {/* Transient Surge Protection Alert */}
              <div className="bg-amber-950/30 border border-amber-700/50 p-3 rounded-lg text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Transient Water Hammer & Surge Check</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {selectedPs.forceMain.surgeNotes}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 3: LONGITUDINAL HGL / EGL PROFILE */}
      {activeSubTab === 'HGL_PROFILE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-200">{profile.name}</h3>
              <p className="text-xs text-slate-400">Longitudinal Hydraulic Grade Line (HGL), Invert Elevations & Crown Gradient.</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-0.5 bg-amber-400 inline-block"></span>
                <span>Ground Level</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span>
                <span>HGL (Water)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-0.5 bg-emerald-400 inline-block"></span>
                <span>Pipe Invert</span>
              </span>
            </div>
          </div>

          {/* SVG Hydraulic Profile Chart */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto">
            <div className="min-w-[700px] h-64 relative flex flex-col justify-between">
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="50" y1="20" x2="750" y2="20" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="50" y1="60" x2="750" y2="60" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="50" y1="100" x2="750" y2="100" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="50" y1="140" x2="750" y2="140" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="50" y1="180" x2="750" y2="180" stroke="#334155" strokeWidth="1" />

                {/* Ground Line (Amber) */}
                <polyline
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  points="50,40 225,55 400,80 575,125 750,10"
                />

                {/* HGL Line (Cyan) */}
                <polyline
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  points="50,50 225,69 400,101 575,183 750,18"
                />

                {/* Invert Bed Line (Emerald) */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  points="50,52 225,73 400,106 575,190 750,25"
                />

                {/* Node Station Markers */}
                {profile.stations.map((st, idx) => {
                  const x = 50 + idx * 175;
                  return (
                    <g key={st.nodeId}>
                      <line x1={x} y1="10" x2={x} y2="185" stroke="#475569" strokeDasharray="2 2" strokeWidth="1" />
                      <circle cx={x} cy={st.hasPump ? 185 : 52 + idx * 25} r="4" fill={st.hasPump ? '#f59e0b' : '#06b6d4'} />
                      <text x={x} y="195" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                        {st.nodeId}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Profile Station Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold font-mono">
                  <th className="p-2.5">Station Node</th>
                  <th className="p-2.5 text-right">Chainage (m)</th>
                  <th className="p-2.5 text-right">Ground (MASL)</th>
                  <th className="p-2.5 text-right">Invert (MASL)</th>
                  <th className="p-2.5 text-right">Water Depth (m)</th>
                  <th className="p-2.5 text-right">HGL (MASL)</th>
                  <th className="p-2.5 text-right">EGL (MASL)</th>
                  <th className="p-2.5 text-right">Velocity (m/s)</th>
                  <th className="p-2.5 text-center">Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                {profile.stations.map((st) => (
                  <tr key={st.nodeId} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold text-cyan-400">{st.nodeId}</td>
                    <td className="p-2.5 text-right text-slate-400">{st.chainageM} m</td>
                    <td className="p-2.5 text-right text-amber-300">+{st.groundElevationMasl.toFixed(2)}</td>
                    <td className="p-2.5 text-right text-emerald-400">+{st.invertElevationMasl.toFixed(2)}</td>
                    <td className="p-2.5 text-right">{st.waterDepthM.toFixed(2)}</td>
                    <td className="p-2.5 text-right font-bold text-cyan-300">+{st.hglMasl.toFixed(2)}</td>
                    <td className="p-2.5 text-right text-slate-400">+{st.eglMasl.toFixed(2)}</td>
                    <td className="p-2.5 text-right">{st.velocityMps.toFixed(2)}</td>
                    <td className="p-2.5 text-center">
                      {st.hasPump ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Pumping Lift +16m
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Gravity Flow
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB 4: DESIGN CRITERIA & STANDARDS */}
      {activeSubTab === 'CRITERIA' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200">Sewerage Hydraulic Design Criteria & Standards</h3>
            <p className="text-xs text-slate-400">
              Configurable regulatory parameters governing gravity sewer velocities, manhole spacing, roughness coefficients, and depth limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-semibold">Self-Cleansing Velocity Limit</span>
              <div className="text-lg font-bold font-mono text-emerald-400">
                {network.criteria.minSelfCleansingVelocityMps} m/s
              </div>
              <p className="text-[11px] text-slate-500">
                Ensures solid grit, sands and organic particulates stay suspended without settling along pipe invert.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-semibold">Maximum Non-Scouring Velocity</span>
              <div className="text-lg font-bold font-mono text-cyan-300">
                {network.criteria.maxVelocityMps} m/s
              </div>
              <p className="text-[11px] text-slate-500">
                Prevents hydraulic erosion and abrasive scouring of sewer pipe wall and joints.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-semibold">Maximum Allowable Depth Ratio (d/D)</span>
              <div className="text-lg font-bold font-mono text-amber-400">
                {(network.criteria.maxDepthRatioD * 100).toFixed(0)}%
              </div>
              <p className="text-[11px] text-slate-500">
                Reserves 20% freeboard headspace for sewer ventilation and hydrogen sulfide gas evacuation.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-semibold">Minimum Public Sewer Diameter</span>
              <div className="text-lg font-bold font-mono text-slate-200">
                {network.criteria.minDiameterMm} mm
              </div>
              <p className="text-[11px] text-slate-500">
                Standard municipal minimum circular bore to prevent blockage from solid waste rags.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-semibold">Minimum Cover Depth Below Road</span>
              <div className="text-lg font-bold font-mono text-slate-200">
                {network.criteria.minCoverDepthM} meters
              </div>
              <p className="text-[11px] text-slate-500">
                Protects buried sewer crown from surface vehicular wheel loads and impact stresses.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
              <span className="text-slate-400 font-semibold">Design Standard Profile</span>
              <div className="text-lg font-bold font-mono text-cyan-400">
                {network.criteria.profileType}
              </div>
              <p className="text-[11px] text-slate-500">
                {network.criteria.profileName}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
