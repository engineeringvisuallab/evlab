/**
 * EVLab Master Simulation Workspace Container
 * Unifies 2D/3D Physics Canvas, Controls Sidebar, Calculation Traces,
 * Real-time Moody/HGL/Pump Graphs, and Engineering Interpretation.
 */

import React, { useState, useMemo } from 'react';
import { LabTopicId, SimulationControls, FluidProperty, UnitSystem } from '../../types';
import { Canvas2DSimulator } from './Canvas2DSimulator';
import { ThreeDConduitSimulator } from './ThreeDConduitSimulator';
import { LabControlsSidebar } from '../panels/LabControlsSidebar';
import { CalculationTracePanel } from '../panels/CalculationTracePanel';
import { EngineeringInterpretationCard } from '../panels/EngineeringInterpretationCard';
import { MoodyDiagramChart } from '../charts/MoodyDiagramChart';
import { HglEglDiagramChart } from '../charts/HglEglDiagramChart';
import { PumpCurveDiagramChart } from '../charts/PumpCurveDiagramChart';
import { validateFluidMechanicsInputs } from '../../core/validationEngine';
import { solveHydraulics } from '../../core/hydraulicSolvers';
import {
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Sliders,
  Maximize2,
  Box,
  Eye,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

interface MasterSimulationWorkspaceProps {
  labId: LabTopicId;
  fluid: FluidProperty;
  unitSystem: UnitSystem;
}

export const MasterSimulationWorkspace: React.FC<MasterSimulationWorkspaceProps> = ({
  labId,
  fluid,
  unitSystem,
}) => {
  // Default parameters per lab
  const defaultParams = useMemo(() => {
    switch (labId) {
      case 'continuity':
        return { d1: 0.1, d2: 0.05, discharge_Lps: 12.0 };
      case 'bernoulli':
        return { z1: 8.0, z2: 3.0, p1_kPa: 180, Q_m3s: 0.035, d1: 0.15, d2: 0.1, headLoss_m: 1.8 };
      case 'reynolds':
        return { diameter: 0.025, velocity: 0.12 };
      case 'pipe-flow':
      case 'pipe-roughness':
      case 'minor-loss':
        return { diameter: 0.15, length: 300, roughness_mm: 0.045, flowRate_m3s: 0.045, fittingsK: 3.0, materialId: 'commercial_steel' };
      case 'venturi':
        return { d1: 0.2, d2: 0.1, p1_kPa: 220, p2_kPa: 175, Cd: 0.98 };
      case 'orifice':
        return { tankHead: 3.5, orificeDiameter: 0.05, Cd: 0.62, Cv: 0.97, Cc: 0.64 };
      case 'weir':
        return { type: 'rectangular', headOverCrest: 0.25, crestLength: 1.5, Cd: 0.62 };
      case 'open-channel':
      case 'froude':
        return { shape: 'rectangular', bottomWidth: 2.5, waterDepth: 1.1, bedSlope_S0: 0.0012, manning_n: 0.014 };
      case 'hydraulic-jump':
        return { upstreamDepth_y1: 0.4, upstreamVelocity_v1: 8.2, channelWidth_b: 5.0 };
      case 'pumps':
      case 'pump-curves':
        return { staticHead: 25.0, pumpShutoffHead_H0: 55.0, pumpMaxDischarge_Qmax: 0.12, pipeDiameter: 0.2, pipeLength: 500, pipeRoughness_mm: 0.045, fittingsKSum: 6.0 };
      default:
        return {};
    }
  }, [labId]);

  const [parameters, setParameters] = useState<Record<string, any>>(defaultParams);

  // Sync defaults when labId changes
  React.useEffect(() => {
    setParameters(defaultParams);
  }, [defaultParams]);

  // Simulation Viewport Controls
  const [controls, setControls] = useState<SimulationControls>({
    isPlaying: true,
    speed: 1.0,
    showGrid: true,
    showVectors: true,
    showStreamlines: true,
    showPressureColor: true,
    showHglEgl: true,
    showDimensions: true,
    particleDensity: 'medium',
    viewMode: '2D',
    cutaway3D: true,
    tracerMode: false,
  });

  const [bottomTab, setBottomTab] = useState<'graphs' | 'interpretation'>('graphs');

  const handleParameterChange = (key: string, val: any) => {
    setParameters((prev) => ({ ...prev, [key]: val }));
  };

  const handleResetParameters = () => {
    setParameters(defaultParams);
  };

  // Run analytical hydraulic solver
  const solverOutput = useMemo(() => {
    return solveHydraulics(labId, parameters, fluid);
  }, [labId, parameters, fluid]);

  const { results, traces } = solverOutput;

  // Run validation engine
  const validationIssues = useMemo(() => {
    return validateFluidMechanicsInputs({
      labId,
      diameter: parameters.diameter || parameters.d1 || parameters.pipeDiameter,
      velocity: results.velocity || results.v1 || results.vActual,
      pressure: parameters.p1_kPa ? parameters.p1_kPa * 1000 : undefined,
      Froude: results.Fr || results.Fr1,
      Reynolds: results.reynolds,
      fluid,
    });
  }, [labId, parameters, results, fluid]);

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Upper Main Split Grid: Left Controls (280px) - Center Canvas (Fluid) - Right Traces (340px) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-slate-800 overflow-hidden min-h-[460px]">
        {/* Left Column: Parameter Controls */}
        <div className="lg:col-span-3 h-full max-h-[560px] overflow-y-auto">
          <LabControlsSidebar
            labId={labId}
            parameters={parameters}
            onParameterChange={handleParameterChange}
            onResetParameters={handleResetParameters}
            fluid={fluid}
            unitSystem={unitSystem}
            validationIssues={validationIssues}
          />
        </div>

        {/* Center Column: Interactive Physics Canvas Viewport */}
        <div className="lg:col-span-6 relative flex flex-col bg-slate-950 border-r border-slate-800 min-h-[380px]">
          {/* Top Canvas HUD Toolbar */}
          <div className="absolute top-3 left-3 z-30 flex items-center space-x-1.5 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-750 text-xs shadow-lg">
            {/* Play/Pause */}
            <button
              onClick={() => setControls((c) => ({ ...c, isPlaying: !c.isPlaying }))}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                controls.isPlaying ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
              }`}
              title={controls.isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
            >
              {controls.isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Speed selection */}
            <select
              value={controls.speed}
              onChange={(e) => setControls((c) => ({ ...c, speed: parseFloat(e.target.value) }))}
              className="bg-slate-950 text-slate-300 border border-slate-750 rounded-lg px-2 py-0.5 text-xs font-mono"
            >
              <option value="0.25">0.25x</option>
              <option value="0.5">0.5x</option>
              <option value="1.0">1.0x</option>
              <option value="1.5">1.5x</option>
              <option value="2.5">2.5x</option>
            </select>

            <span className="text-slate-700">|</span>

            {/* 2D / 3D Mode Toggle */}
            <button
              onClick={() => setControls((c) => ({ ...c, viewMode: c.viewMode === '2D' ? '3D' : '2D' }))}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg font-mono text-xs transition-colors cursor-pointer ${
                controls.viewMode === '3D'
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <Box className="w-3 h-3" />
              <span>{controls.viewMode}</span>
            </button>

            {/* Streamlines Toggle */}
            <button
              onClick={() => setControls((c) => ({ ...c, showStreamlines: !c.showStreamlines }))}
              className={`px-2 py-0.5 rounded-lg text-xs transition-colors cursor-pointer ${
                controls.showStreamlines ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'text-slate-500'
              }`}
              title="Toggle Particle Streamlines"
            >
              Lines
            </button>

            {/* Vectors Toggle */}
            <button
              onClick={() => setControls((c) => ({ ...c, showVectors: !c.showVectors }))}
              className={`px-2 py-0.5 rounded-lg text-xs transition-colors cursor-pointer ${
                controls.showVectors ? 'bg-sky-950 text-sky-400 border border-sky-800' : 'text-slate-500'
              }`}
              title="Toggle Velocity Vectors"
            >
              Vectors
            </button>

            {/* HGL/EGL Toggle */}
            {labId === 'bernoulli' && (
              <button
                onClick={() => setControls((c) => ({ ...c, showHglEgl: !c.showHglEgl }))}
                className={`px-2 py-0.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  controls.showHglEgl ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'text-slate-500'
                }`}
              >
                HGL/EGL
              </button>
            )}
          </div>

          {/* Canvas Rendering Area */}
          <div className="flex-1 w-full h-full relative">
            {controls.viewMode === '2D' ? (
              <Canvas2DSimulator
                labId={labId}
                parameters={parameters}
                results={results}
                fluid={fluid}
                controls={controls}
              />
            ) : (
              <ThreeDConduitSimulator
                labId={labId}
                parameters={parameters}
                results={results}
                fluid={fluid}
                controls={controls}
              />
            )}
          </div>

          {/* Bottom Canvas Telemetry Strip */}
          <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400 overflow-x-auto">
            <div className="flex items-center space-x-4 min-w-max">
              <span>
                Status:{' '}
                <span className="text-emerald-400 font-semibold">{controls.isPlaying ? 'RUNNING' : 'PAUSED'}</span>
              </span>
              <span>
                Engine:{' '}
                <span className="text-sky-400">Analytical 1D Navier-Stokes / Energy</span>
              </span>
              <span>
                Fluid: <span className="text-slate-200">{fluid.name}</span>
              </span>
            </div>
            <div className="text-slate-500 text-[11px] min-w-max ml-4">
              Grid: {controls.showGrid ? 'ON' : 'OFF'} • Speed: {controls.speed}x
            </div>
          </div>
        </div>

        {/* Right Column: Step-by-Step Calculation Trace */}
        <div className="lg:col-span-3 h-full max-h-[560px] overflow-y-auto p-4 bg-slate-900/60">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Calculation Audit Trail</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">{traces.length} steps</span>
          </div>

          <CalculationTracePanel traces={traces} />
        </div>
      </div>

      {/* Lower Multi-Tab Panel: Dynamic Graphs vs Physics Interpretation */}
      <div className="p-4 md:p-6 bg-slate-950 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setBottomTab('graphs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                bottomTab === 'graphs'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Engineering Charts & Diagrams
            </button>
            <button
              onClick={() => setBottomTab('interpretation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                bottomTab === 'interpretation'
                  ? 'bg-sky-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Physical Takeaway & Engineering Consequence
            </button>
          </div>
        </div>

        {bottomTab === 'graphs' ? (
          <div className="w-full">
            {labId === 'pipe-flow' || labId === 'pipe-roughness' || labId === 'reynolds' ? (
              <MoodyDiagramChart
                currentRe={results.reynolds || 75000}
                currentRoughnessRatio={results.relativeRoughness || (parameters.roughness_mm || 0.045) / ((parameters.diameter || 0.15) * 1000)}
                currentFrictionFactor={results.frictionFactor || 0.022}
              />
            ) : labId === 'bernoulli' ? (
              <HglEglDiagramChart
                z1={parameters.z1 ?? 8}
                z2={parameters.z2 ?? 3}
                p1_gamma={results.p1_gamma || 18}
                p2_gamma={results.p2_gamma || 15}
                v1_2g={results.v1_2g || 0.6}
                v2_2g={results.v2_2g || 2.4}
                pipeLength={parameters.pipeLength || 100}
                headLoss={parameters.headLoss_m || 1.8}
              />
            ) : labId === 'pumps' || labId === 'pump-curves' ? (
              <PumpCurveDiagramChart
                shutoffHead_H0={parameters.pumpShutoffHead_H0 || 55.0}
                maxDischarge_Qmax={parameters.pumpMaxDischarge_Qmax || 0.12}
                staticHead={parameters.staticHead || 25.0}
                operatingQ_m3s={results.Q_op || 0.052}
                operatingH_m={results.H_op || 44.8}
                operatingEfficiency={results.efficiency || 0.82}
              />
            ) : (
              <EngineeringInterpretationCard
                labId={labId}
                parameters={parameters}
                results={results}
              />
            )}
          </div>
        ) : (
          <EngineeringInterpretationCard
            labId={labId}
            parameters={parameters}
            results={results}
          />
        )}
      </div>
    </div>
  );
};
