import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Activity, 
  Droplets, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Layers, 
  Wind, 
  Waves, 
  Flame, 
  Compass, 
  Gauge, 
  Cpu, 
  ArrowRight,
  Info,
  Maximize2,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Calculator
} from 'lucide-react';
import { ProjectMetadata } from '../types/wtp';
import { CalculatedWtpState } from '../core/dependencyEngine';
import {
  createInitialSimulationState,
  tickSimulationState,
  CentralSimulationState,
  PumpSimulationObject,
  ValveSimulationObject,
  ChemicalFeederState
} from '../core/simulationStateEngine';
import { SimulationFiltersView } from './simulation/SimulationFiltersView';
import { SimulationHglView } from './simulation/SimulationHglView';
import { SimulationPumpsValvesView } from './simulation/SimulationPumpsValvesView';
import { SimulationQualityChemicalsView } from './simulation/SimulationQualityChemicalsView';

type LiveSimSubTab = 'overview' | 'filters' | 'hgl' | 'pumpsValves' | 'qualityChemicals';

interface LiveProcessSimulationViewProps {
  project: ProjectMetadata;
  state: CalculatedWtpState;
  onOpenFormulaInspector: (paramId: string) => void;
}

type SimulationScenario = 'NORMAL' | 'TURBIDITY_SPIKE' | 'ALGAE_BLOOM' | 'FILTER_BACKWASH' | 'PEAK_DEMAND';

interface UnitProcessTelemetry {
  id: string;
  name: string;
  category: string;
  inflowM3hr: number;
  retentionTimeSec: number;
  gValue?: number;
  inflowTurbidityNTU: number;
  outflowTurbidityNTU: number;
  headLossM: number;
  powerKw: number;
  chemicalFeedKgHr: number;
  formulaId: string;
  status: 'OPTIMAL' | 'WARNING' | 'ALERT';
}

export const LiveProcessSimulationView: React.FC<LiveProcessSimulationViewProps> = ({
  project,
  state,
  onOpenFormulaInspector
}) => {
  // Simulation Engine State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [simTimeSec, setSimTimeSec] = useState<number>(0);
  const [simCapacityMLD, setSimCapacityMLD] = useState<number>(project.plantCapacityMLD || 50);
  const [activeScenario, setActiveScenario] = useState<SimulationScenario>('NORMAL');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('clarifier');
  const [isBackwashing, setIsBackwashing] = useState<boolean>(false);
  const [waterTreatedCumulativeM3, setWaterTreatedCumulativeM3] = useState<number>(14250);

  // Sub-tabbed breakdown of the live simulation (filters, HGL, pumps/valves, quality/chemicals)
  const [activeSubTab, setActiveSubTab] = useState<LiveSimSubTab>('overview');

  // Full engineering simulation engine state (drives the 4 detailed sub-views)
  const [simState, setSimState] = useState<CentralSimulationState>(() =>
    createInitialSimulationState(project, state)
  );

  // Scaled dynamic parameters based on capacity slider
  const capacityMultiplier = simCapacityMLD / (project.plantCapacityMLD || 50);
  const currentFlowM3hr = (state.flowM3hr || 2083.33) * capacityMultiplier;
  const currentFlowLs = (state.flowLs || 578.7) * capacityMultiplier;

  // Scenario specific modifiers
  const rawTurbidityBase = activeScenario === 'TURBIDITY_SPIKE' ? 480 : activeScenario === 'ALGAE_BLOOM' ? 210 : 95;
  const alumDoseMgL = activeScenario === 'TURBIDITY_SPIKE' ? 45 : activeScenario === 'ALGAE_BLOOM' ? 38 : (state.alumDoseMgL || 28);
  const filterHeadlossBase = activeScenario === 'FILTER_BACKWASH' || isBackwashing ? 0.3 : 1.45;

  // Simulation Clock Tick Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimTimeSec((prev) => prev + 1 * simSpeed);
        setWaterTreatedCumulativeM3((prev) => prev + (currentFlowM3hr / 3600) * simSpeed);
        setSimState((prev) => tickSimulationState({ ...prev, isPlaying: true, simSpeed: simSpeed as any }, 0.5, state));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed, currentFlowM3hr, state]);

  // Keep the effective plant capacity used by the detailed sub-views in sync with the capacity slider
  useEffect(() => {
    setSimState((prev) => ({
      ...prev,
      projectCapacityMLD: project.plantCapacityMLD || 50,
      effectiveCapacityMLD: simCapacityMLD
    }));
  }, [simCapacityMLD, project.plantCapacityMLD]);

  // --- Handlers for the detailed Filters / Pumps & Valves / Quality & Chemicals sub-views ---
  const handleTriggerFilterBackwash = (filterId: string) => {
    setSimState((prev) => ({
      ...prev,
      filters: prev.filters.map((f) =>
        f.id === filterId
          ? { ...f, status: 'BACKWASHING', backwashStep: 'ISOLATION', stepElapsedSec: 0 }
          : f
      )
    }));
  };

  const handleResetFilter = (filterId: string) => {
    setSimState((prev) => ({
      ...prev,
      filters: prev.filters.map((f) =>
        f.id === filterId
          ? {
              ...f,
              status: 'RUNNING',
              backwashStep: 'FILTER_IN_SERVICE',
              stepElapsedSec: 0,
              headLossM: 0.35,
              runTimeHours: 0,
              mediaCondition: 'CLEAN'
            }
          : f
      )
    }));
  };

  const handleUpdatePump = (pumpId: string, updates: Partial<PumpSimulationObject>) => {
    setSimState((prev) => ({
      ...prev,
      pumps: prev.pumps.map((p) => (p.id === pumpId ? { ...p, ...updates } : p))
    }));
  };

  const handleUpdateValve = (valveId: string, updates: Partial<ValveSimulationObject>) => {
    setSimState((prev) => ({
      ...prev,
      valves: prev.valves.map((v) => (v.id === valveId ? { ...v, ...updates } : v))
    }));
  };

  const handleUpdateChemical = (chemicalKey: string, updates: Partial<ChemicalFeederState>) => {
    setSimState((prev) => ({
      ...prev,
      chemicals: {
        ...prev.chemicals,
        [chemicalKey]: { ...prev.chemicals[chemicalKey], ...updates }
      }
    }));
  };

  // Unit Process Telemetry Dataset
  const unitTelemetryMap: Record<string, UnitProcessTelemetry> = {
    intake: {
      id: 'intake',
      name: 'River Water Intake & Raw Water Pumping',
      category: 'Intake Hydraulics',
      inflowM3hr: currentFlowM3hr,
      retentionTimeSec: 15,
      inflowTurbidityNTU: rawTurbidityBase,
      outflowTurbidityNTU: rawTurbidityBase,
      headLossM: 0.35,
      powerKw: (state.screenHeadLossM || 0.4) * 45 * capacityMultiplier,
      chemicalFeedKgHr: 0,
      formulaId: 'FORM-PUMP-001',
      status: 'OPTIMAL'
    },
    aerator: {
      id: 'aerator',
      name: 'Cascade Aerator with Oxygen Diffusion',
      category: 'Pre-Treatment Aeration',
      inflowM3hr: currentFlowM3hr,
      retentionTimeSec: 35,
      inflowTurbidityNTU: rawTurbidityBase,
      outflowTurbidityNTU: rawTurbidityBase * 0.98,
      headLossM: 2.4,
      powerKw: 0, // Gravity driven
      chemicalFeedKgHr: 0,
      formulaId: 'FORM-HYD-001',
      status: 'OPTIMAL'
    },
    flume: {
      id: 'flume',
      name: 'Parshall Flume & Coagulant Dosing',
      category: 'Flow Metering & Rapid Addition',
      inflowM3hr: currentFlowM3hr,
      retentionTimeSec: 10,
      inflowTurbidityNTU: rawTurbidityBase * 0.98,
      outflowTurbidityNTU: rawTurbidityBase * 0.98,
      headLossM: 0.28,
      powerKw: 1.5,
      chemicalFeedKgHr: (currentFlowM3hr * alumDoseMgL) / 1000,
      formulaId: 'FORM-CHEM-001',
      status: activeScenario === 'TURBIDITY_SPIKE' ? 'WARNING' : 'OPTIMAL'
    },
    flashMixer: {
      id: 'flashMixer',
      name: 'High-Shear Flash Mixer Chamber',
      category: 'Rapid Coagulation Dispersion',
      inflowM3hr: currentFlowM3hr,
      retentionTimeSec: (state.flashMixerDetentionSec || 45) / capacityMultiplier,
      gValue: state.flashMixerG || 750,
      inflowTurbidityNTU: rawTurbidityBase * 0.98,
      outflowTurbidityNTU: rawTurbidityBase * 0.95,
      headLossM: 0.4,
      powerKw: (state.flashMixerPowerKw || 18.5) * capacityMultiplier,
      chemicalFeedKgHr: (currentFlowM3hr * 12) / 1000, // Lime
      formulaId: 'FORM-PROC-001',
      status: 'OPTIMAL'
    },
    flocculator: {
      id: 'flocculator',
      name: '3-Stage Tapered Mechanical Flocculator',
      category: 'Floc Growth & Agglomeration',
      inflowM3hr: currentFlowM3hr,
      retentionTimeSec: (state.flocculatorDetentionMin || 25) * 60 / capacityMultiplier,
      gValue: 45,
      inflowTurbidityNTU: rawTurbidityBase * 0.95,
      outflowTurbidityNTU: rawTurbidityBase * 0.90, // with large flocs
      headLossM: 0.45,
      powerKw: (state.flocculatorPowerKw || 12.0) * capacityMultiplier,
      chemicalFeedKgHr: (currentFlowM3hr * 0.2) / 1000, // Polymer
      formulaId: 'FORM-PROC-001',
      status: 'OPTIMAL'
    },
    clarifier: {
      id: 'clarifier',
      name: 'Clari-Flocculator / High-Rate Lamella Clarifier',
      category: 'Gravity Sedimentation & Sludge Bleed',
      inflowM3hr: currentFlowM3hr,
      retentionTimeSec: 7200 / capacityMultiplier,
      inflowTurbidityNTU: rawTurbidityBase * 0.90,
      outflowTurbidityNTU: activeScenario === 'TURBIDITY_SPIKE' ? 6.2 : 3.8,
      headLossM: 0.65,
      powerKw: 5.5,
      chemicalFeedKgHr: 0,
      formulaId: 'FORM-SED-001',
      status: activeScenario === 'TURBIDITY_SPIKE' ? 'WARNING' : 'OPTIMAL'
    },
    filters: {
      id: 'filters',
      name: 'Rapid Gravity Sand & Anthracite Dual Media Filters',
      category: 'Deep Bed Granular Filtration',
      inflowM3hr: currentFlowM3hr,
      retentionTimeSec: 900 / capacityMultiplier,
      inflowTurbidityNTU: activeScenario === 'TURBIDITY_SPIKE' ? 6.2 : 3.8,
      outflowTurbidityNTU: isBackwashing ? 0.45 : 0.12,
      headLossM: filterHeadlossBase * (capacityMultiplier ** 1.5),
      powerKw: isBackwashing ? 75.0 : 4.5,
      chemicalFeedKgHr: 0,
      formulaId: 'FORM-FLTR-001',
      status: isBackwashing ? 'WARNING' : 'OPTIMAL'
    },
    disinfection: {
      id: 'disinfection',
      name: 'Chlorine Contact Tank (Baffled Serpentine)',
      category: 'Disinfection & Pathogen Inactivation',
      inflowM3hr: currentFlowM3hr,
      retentionTimeSec: 1800 / capacityMultiplier,
      inflowTurbidityNTU: 0.12,
      outflowTurbidityNTU: 0.08,
      headLossM: 0.3,
      powerKw: 2.2,
      chemicalFeedKgHr: (currentFlowM3hr * 2.5) / 1000, // Cl2
      formulaId: 'FORM-DIS-001',
      status: 'OPTIMAL'
    },
    cwr: {
      id: 'cwr',
      name: 'Clear Water Reservoir & High-Lift Pumping Station',
      category: 'Treated Water Storage & Transmission',
      inflowM3hr: currentFlowM3hr,
      retentionTimeSec: 14400 / capacityMultiplier,
      inflowTurbidityNTU: 0.08,
      outflowTurbidityNTU: 0.05,
      headLossM: 0.2,
      powerKw: (state.flowM3hr || 2083) * 0.18 * capacityMultiplier,
      chemicalFeedKgHr: 0,
      formulaId: 'FORM-PUMP-001',
      status: 'OPTIMAL'
    },
    sludgeThickener: {
      id: 'sludgeThickener',
      name: 'Gravity Sludge Thickener & Dewatering Unit',
      category: 'Sludge Concentration & Recovery',
      inflowM3hr: currentFlowM3hr * 0.035, // 3.5% reject/sludge stream
      retentionTimeSec: 21600,
      inflowTurbidityNTU: 1850,
      outflowTurbidityNTU: 15.0, // Supernatant recycle
      headLossM: 0.5,
      powerKw: 11.0 * capacityMultiplier,
      chemicalFeedKgHr: (currentFlowM3hr * 0.035 * 4.0) / 1000,
      formulaId: 'FORM-SLD-001',
      status: 'OPTIMAL'
    }
  };

  const selectedUnit = unitTelemetryMap[selectedUnitId] || unitTelemetryMap['clarifier'];

  // Calculate live water color based on stage
  const getWaterColor = (stage: string) => {
    switch (stage) {
      case 'raw': return 'rgba(180, 115, 60, 0.85)'; // Muddy Brown
      case 'aerated': return 'rgba(165, 130, 85, 0.80)'; // Aerated Tan
      case 'coagulated': return 'rgba(130, 150, 100, 0.75)'; // Flocculated Greenish
      case 'clarified': return 'rgba(70, 180, 200, 0.75)'; // Clear Light Cyan
      case 'filtered': return 'rgba(30, 210, 245, 0.85)'; // Sparkling Bright Cyan
      case 'treated': return 'rgba(10, 190, 255, 0.95)'; // Deep Pure Potable Blue
      case 'sludge': return 'rgba(100, 65, 30, 0.90)'; // Concentrated Sludge Dark Brown
      default: return 'rgba(56, 189, 248, 0.8)';
    }
  };

  // Trigger manual backwash sequence
  const handleToggleBackwash = () => {
    setIsBackwashing(true);
    setTimeout(() => {
      setIsBackwashing(false);
    }, 6000);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto text-slate-100 font-mono text-xs select-none">
      
      {/* Top Header & Simulation Controller Bar */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-br from-cyan-950 to-blue-950 border border-cyan-700/60 rounded-xl text-cyan-400 shadow-inner">
              <Activity className="w-6 h-6 animate-pulse text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-wide">
                  Live Animated Process Simulation & Hydraulic Flow Engine
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-3xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  REAL-TIME DYNAMICS ACTIVE
                </span>
              </div>
              <p className="text-2xs text-slate-400 mt-0.5">
                Dynamic hydrodynamic visualization with fluid particle tracing, turbidity reduction gradient, and live SCADA telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* Playback & Speed Controls */}
        <div className="flex items-center flex-wrap gap-2.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold transition text-xs shadow-md ${
              isPlaying 
                ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause Simulation' : 'Start Simulation'}</span>
          </button>

          <button
            onClick={() => {
              setSimTimeSec(0);
              setWaterTreatedCumulativeM3(0);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
            title="Reset Simulation Clock"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Multipliers */}
          <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800 text-3xs">
            <span className="text-slate-500 px-1.5 font-bold">Speed:</span>
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-2 py-1 rounded font-bold transition ${
                  simSpeed === spd 
                    ? 'bg-cyan-600 text-white shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Trigger Backwash Button */}
          <button
            onClick={handleToggleBackwash}
            disabled={isBackwashing}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-3xs transition border ${
              isBackwashing
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isBackwashing ? 'Backwashing Filter...' : 'Trigger Backwash'}</span>
          </button>
        </div>
      </div>

      {/* Live Simulation Sub-Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview & Flow Train', icon: Activity },
          { id: 'filters', label: 'Filters & Backwash', icon: Layers },
          { id: 'hgl', label: 'HGL / Hydraulics', icon: TrendingUp },
          { id: 'pumpsValves', label: 'Pumps & Valves', icon: Zap },
          { id: 'qualityChemicals', label: 'Water Quality & Chemicals', icon: Droplets }
        ].map((tab) => {
          const isSel = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as LiveSimSubTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-2xs whitespace-nowrap transition ${
                isSel
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-800'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeSubTab === 'filters' && (
        <SimulationFiltersView
          filters={simState.filters}
          onTriggerBackwash={handleTriggerFilterBackwash}
          onResetFilter={handleResetFilter}
          onOpenFormulaInspector={onOpenFormulaInspector}
        />
      )}

      {activeSubTab === 'hgl' && (
        <SimulationHglView
          nodes={simState.hydraulicNodes}
          overallHglLossM={simState.overallHglLossM}
          plantFlowM3hr={currentFlowM3hr}
          onOpenFormulaInspector={onOpenFormulaInspector}
        />
      )}

      {activeSubTab === 'pumpsValves' && (
        <SimulationPumpsValvesView
          pumps={simState.pumps}
          valves={simState.valves}
          onUpdatePump={handleUpdatePump}
          onUpdateValve={handleUpdateValve}
          onOpenFormulaInspector={onOpenFormulaInspector}
        />
      )}

      {activeSubTab === 'qualityChemicals' && (
        <SimulationQualityChemicalsView
          qualityStages={simState.qualityStages}
          chemicals={simState.chemicals}
          onUpdateChemical={handleUpdateChemical}
          onOpenFormulaInspector={onOpenFormulaInspector}
        />
      )}

      {activeSubTab === 'overview' && (
      <>
      {/* Top SCADA Live Telemetry Banner */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <div className="text-3xs text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>Plant Flow Rate</span>
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-300 font-mono">
            {simCapacityMLD.toFixed(1)} <span className="text-2xs text-slate-400">MLD</span>
          </div>
          <div className="text-3xs text-slate-500">{currentFlowM3hr.toFixed(1)} m³/hr ({currentFlowLs.toFixed(1)} L/s)</div>
        </div>

        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <div className="text-3xs text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>Raw Turbidity In</span>
            <Droplets className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-300 font-mono">
            {rawTurbidityBase.toFixed(1)} <span className="text-2xs text-slate-400">NTU</span>
          </div>
          <div className="text-3xs text-slate-500">River Intake Sample</div>
        </div>

        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <div className="text-3xs text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>Treated Water Out</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-300 font-mono">
            0.05 <span className="text-2xs text-slate-400">NTU</span>
          </div>
          <div className="text-3xs text-emerald-400 font-bold">99.96% Turbidity Removal</div>
        </div>

        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <div className="text-3xs text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>Coagulant Dosing</span>
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-blue-300 font-mono">
            {alumDoseMgL.toFixed(1)} <span className="text-2xs text-slate-400">mg/L Alum</span>
          </div>
          <div className="text-3xs text-slate-500">{((currentFlowM3hr * alumDoseMgL) / 1000).toFixed(1)} kg/hr active</div>
        </div>

        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <div className="text-3xs text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>Treated Cumulative</span>
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-300 font-mono">
            {waterTreatedCumulativeM3.toLocaleString('en-US', { maximumFractionDigits: 0 })} <span className="text-2xs text-slate-400">m³</span>
          </div>
          <div className="text-3xs text-slate-500">Live Metering Totalizer</div>
        </div>

        <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
          <div className="text-3xs text-slate-400 uppercase tracking-wider font-semibold flex items-center justify-between">
            <span>Water Quality Standard</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-emerald-300 font-mono">
            {project.designStandard || 'WHO / BDS'}
          </div>
          <div className="text-3xs text-emerald-400 font-bold">100% Compliant (Coliform 0)</div>
        </div>
      </div>

      {/* Dynamic Scenario Injector & Capacity Modulator */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Capacity Slider */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-2xs font-bold text-slate-300 whitespace-nowrap">Simulate Dynamic Capacity:</span>
          <input
            type="range"
            min={10}
            max={150}
            step={5}
            value={simCapacityMLD}
            onChange={(e) => setSimCapacityMLD(Number(e.target.value))}
            className="w-48 accent-cyan-500 cursor-pointer"
          />
          <span className="px-2 py-1 bg-slate-950 text-cyan-300 font-mono font-bold rounded border border-slate-800 text-xs">
            {simCapacityMLD} MLD
          </span>
        </div>

        {/* Disturbances & Event Scenarios */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-3xs font-bold">
          <span className="text-slate-400 uppercase mr-1">Event Injections:</span>
          {[
            { id: 'NORMAL', label: 'Normal Baseline', icon: CheckCircle2, color: 'emerald' },
            { id: 'TURBIDITY_SPIKE', label: 'Monsoon Flood (500 NTU)', icon: AlertTriangle, color: 'amber' },
            { id: 'ALGAE_BLOOM', label: 'Algae Bloom Event', icon: Droplets, color: 'emerald' },
            { id: 'FILTER_BACKWASH', label: 'Filter Backwash Sequence', icon: Waves, color: 'cyan' },
            { id: 'PEAK_DEMAND', label: 'Peak Hour Surge', icon: Flame, color: 'rose' }
          ].map((sc) => {
            const isSel = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setActiveScenario(sc.id as SimulationScenario);
                  if (sc.id === 'PEAK_DEMAND') setSimCapacityMLD(80);
                  if (sc.id === 'NORMAL') setSimCapacityMLD(project.plantCapacityMLD || 50);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition ${
                  isSel
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                <sc.icon className="w-3 h-3" />
                <span>{sc.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN ANIMATED SIMULATION CANVAS & FLOW VISUALIZER */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        
        {/* Animated Ambient Flow Grid Lines in Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Process Stages Schematic Title Bar */}
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-sm text-white uppercase tracking-wider">
              Hydraulic Treatment Train — Live Water Flow & Particle Tracking
            </span>
          </div>

          <div className="flex items-center gap-3 text-3xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getWaterColor('raw') }} />
              Raw Water (Turbid)
            </span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getWaterColor('clarified') }} />
              Clarified
            </span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getWaterColor('treated') }} />
              Treated Potable Water
            </span>
          </div>
        </div>

        {/* Interactive SVG Animation Circuit */}
        <div className="w-full overflow-x-auto pb-4 relative z-10">
          <div className="min-w-[1200px] h-[480px] bg-slate-900/90 rounded-2xl border border-slate-800 p-6 relative overflow-hidden">
            
            {/* SVG Connecting Flow Pipes with Animated Flow Dashes */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="flowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#b4733c" />
                  <stop offset="50%" stopColor="#829664" />
                  <stop offset="100%" stopColor="#46b4c8" />
                </linearGradient>
                <linearGradient id="flowGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#46b4c8" />
                  <stop offset="60%" stopColor="#1ed2f5" />
                  <stop offset="100%" stopColor="#0abeff" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Main Process Stream Flow Path (1 to 7) */}
              <path
                d="M 90 140 L 200 140 L 310 140 L 420 140 L 540 140 L 680 140 L 830 140 L 980 140 L 1110 140"
                fill="none"
                stroke="url(#flowGrad1)"
                strokeWidth="6"
                strokeDasharray={isPlaying ? "10 8" : "none"}
                strokeDashoffset={-simTimeSec * 14}
                strokeLinecap="round"
                className="transition-all"
              />

              {/* Sludge Return Pipe (Clarifier to Sludge Thickener) */}
              <path
                d="M 680 200 L 680 340 L 540 340"
                fill="none"
                stroke="#854d0e"
                strokeWidth="4"
                strokeDasharray={isPlaying ? "8 6" : "none"}
                strokeDashoffset={-simTimeSec * 8}
                strokeLinecap="round"
              />

              {/* Filter Backwash Washwater Line */}
              <path
                d="M 830 200 L 830 300 L 200 300 L 200 180"
                fill="none"
                stroke="#0284c7"
                strokeWidth={isBackwashing ? "5" : "2"}
                strokeDasharray={isBackwashing ? "6 6" : "none"}
                strokeDashoffset={-simTimeSec * 20}
                opacity={isBackwashing ? "0.9" : "0.2"}
              />
            </svg>

            {/* UNIT PROCESS NODES ALONG THE FLOW TRAIN */}
            <div className="grid grid-cols-8 gap-4 h-full items-start relative z-20">
              
              {/* NODE 1: INTAKE & SCREENS */}
              <div
                onClick={() => setSelectedUnitId('intake')}
                className={`cursor-pointer rounded-2xl p-3 border transition flex flex-col justify-between h-[230px] ${
                  selectedUnitId === 'intake'
                    ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-3xs">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">1. INTAKE</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <h4 className="font-bold text-2xs text-white">River Intake</h4>
                </div>

                {/* Animated Graphic Box */}
                <div className="h-24 bg-amber-950/40 rounded-xl border border-amber-800/50 p-2 relative overflow-hidden flex flex-col justify-end">
                  {/* Screen Bars */}
                  <div className="absolute inset-0 flex justify-around items-center opacity-40">
                    <div className="w-1 h-16 bg-amber-600" />
                    <div className="w-1 h-16 bg-amber-600" />
                    <div className="w-1 h-16 bg-amber-600" />
                  </div>
                  {/* Animated Water Surface */}
                  <div 
                    className="w-full rounded-b-lg transition-all duration-300"
                    style={{
                      height: '75%',
                      backgroundColor: getWaterColor('raw'),
                      opacity: 0.8
                    }}
                  />
                  <div className="text-3xs font-mono font-bold text-amber-200 text-center relative z-10">
                    {rawTurbidityBase} NTU
                  </div>
                </div>

                <div className="text-3xs text-slate-400 flex justify-between">
                  <span>Flow:</span>
                  <span className="text-cyan-300 font-bold">{currentFlowM3hr.toFixed(0)} m³/h</span>
                </div>
              </div>

              {/* NODE 2: CASCADE AERATOR */}
              <div
                onClick={() => setSelectedUnitId('aerator')}
                className={`cursor-pointer rounded-2xl p-3 border transition flex flex-col justify-between h-[230px] ${
                  selectedUnitId === 'aerator'
                    ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-3xs">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">2. AERATOR</span>
                    <Wind className="w-3 h-3 text-cyan-400 animate-spin" />
                  </div>
                  <h4 className="font-bold text-2xs text-white">Cascade Aerator</h4>
                </div>

                {/* Animated Steps Graphic */}
                <div className="h-24 bg-slate-950 rounded-xl border border-slate-800 p-2 relative flex flex-col justify-between overflow-hidden">
                  {/* Cascading tiers */}
                  <div className="space-y-1.5 z-10">
                    <div className="w-10 h-2 bg-slate-700 mx-auto rounded" />
                    <div className="w-16 h-2 bg-slate-700 mx-auto rounded" />
                    <div className="w-22 h-2 bg-slate-700 mx-auto rounded" />
                  </div>
                  {/* Water Drops */}
                  {isPlaying && (
                    <div className="absolute inset-0 flex justify-center items-center gap-1 opacity-70">
                      <div className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                  <div className="text-3xs font-mono text-cyan-300 text-center font-bold">
                    DO +{(state.oxygenTransferKgHr || 8.5).toFixed(1)} kg/h
                  </div>
                </div>

                <div className="text-3xs text-slate-400 flex justify-between">
                  <span>Head Drop:</span>
                  <span className="text-amber-300 font-bold">2.4 m</span>
                </div>
              </div>

              {/* NODE 3: PARSHALL FLUME & CHEMICAL DOSING */}
              <div
                onClick={() => setSelectedUnitId('flume')}
                className={`cursor-pointer rounded-2xl p-3 border transition flex flex-col justify-between h-[230px] ${
                  selectedUnitId === 'flume'
                    ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-3xs">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">3. FLUME</span>
                    <Droplets className="w-3 h-3 text-blue-400 animate-pulse" />
                  </div>
                  <h4 className="font-bold text-2xs text-white">Parshall Flume</h4>
                </div>

                {/* Animated Chemical Dosing Pulse */}
                <div className="h-24 bg-slate-950 rounded-xl border border-slate-800 p-2 relative overflow-hidden flex flex-col justify-between">
                  <div className="flex justify-center">
                    <div className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-bold text-3xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                      Alum + Lime
                    </div>
                  </div>
                  {/* Hydraulic Jump Effect */}
                  <div className="h-10 bg-gradient-to-r from-amber-700/60 to-emerald-700/60 rounded-lg flex items-center justify-center">
                    <span className="text-3xs text-white font-mono font-bold">Hydraulic Jump</span>
                  </div>
                  <div className="text-3xs font-mono text-blue-300 text-center font-bold">
                    Dose: {alumDoseMgL} mg/L
                  </div>
                </div>

                <div className="text-3xs text-slate-400 flex justify-between">
                  <span>Feed Rate:</span>
                  <span className="text-blue-300 font-bold">{((currentFlowM3hr * alumDoseMgL)/1000).toFixed(1)} kg/h</span>
                </div>
              </div>

              {/* NODE 4: FLASH MIXER */}
              <div
                onClick={() => setSelectedUnitId('flashMixer')}
                className={`cursor-pointer rounded-2xl p-3 border transition flex flex-col justify-between h-[230px] ${
                  selectedUnitId === 'flashMixer'
                    ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-3xs">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">4. MIXER</span>
                    <RotateCcw className="w-3 h-3 text-amber-400 animate-spin" />
                  </div>
                  <h4 className="font-bold text-2xs text-white">Flash Mixer</h4>
                </div>

                {/* Animated Impeller Vortex */}
                <div className="h-24 bg-slate-950 rounded-xl border border-slate-800 p-2 relative overflow-hidden flex flex-col justify-between items-center">
                  <div className={`w-10 h-10 rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`}>
                    <div className="w-2 h-2 bg-amber-400 rounded-full" />
                  </div>
                  <div className="text-3xs font-mono text-amber-300 text-center font-bold">
                    G = {state.flashMixerG || 750} s⁻¹
                  </div>
                  <div className="text-3xs text-slate-400">t = {(state.flashMixerDetentionSec || 45)}s</div>
                </div>

                <div className="text-3xs text-slate-400 flex justify-between">
                  <span>Power:</span>
                  <span className="text-amber-300 font-bold">{(state.flashMixerPowerKw || 18.5).toFixed(1)} kW</span>
                </div>
              </div>

              {/* NODE 5: MECHANICAL FLOCCULATOR */}
              <div
                onClick={() => setSelectedUnitId('flocculator')}
                className={`cursor-pointer rounded-2xl p-3 border transition flex flex-col justify-between h-[230px] ${
                  selectedUnitId === 'flocculator'
                    ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-3xs">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">5. FLOC</span>
                    <Waves className="w-3 h-3 text-emerald-400 animate-pulse" />
                  </div>
                  <h4 className="font-bold text-2xs text-white">Flocculator</h4>
                </div>

                {/* Animated 3-Stage Slow Paddles */}
                <div className="h-24 bg-slate-950 rounded-xl border border-slate-800 p-2 relative overflow-hidden flex justify-between items-center">
                  <div className="flex justify-around w-full">
                    <div className={`w-5 h-12 bg-emerald-900/60 border border-emerald-600 rounded flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                      <span className="text-3xs text-emerald-300">G₁</span>
                    </div>
                    <div className={`w-5 h-12 bg-emerald-900/40 border border-emerald-700 rounded flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                      <span className="text-3xs text-emerald-400">G₂</span>
                    </div>
                    <div className={`w-5 h-12 bg-emerald-900/20 border border-emerald-800 rounded flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                      <span className="text-3xs text-emerald-500">G₃</span>
                    </div>
                  </div>
                </div>

                <div className="text-3xs text-slate-400 flex justify-between">
                  <span>Retention:</span>
                  <span className="text-emerald-300 font-bold">{(state.flocculatorDetentionMin || 25)} min</span>
                </div>
              </div>

              {/* NODE 6: CLARIFIER / LAMELLA SETTLER */}
              <div
                onClick={() => setSelectedUnitId('clarifier')}
                className={`cursor-pointer rounded-2xl p-3 border transition flex flex-col justify-between h-[230px] ${
                  selectedUnitId === 'clarifier'
                    ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-3xs">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">6. CLARIFIER</span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  </div>
                  <h4 className="font-bold text-2xs text-white">Clarifier</h4>
                </div>

                {/* Animated Settling & Sludge Bed */}
                <div className="h-24 bg-slate-950 rounded-xl border border-slate-800 p-2 relative overflow-hidden flex flex-col justify-between">
                  {/* Clarified Water Top */}
                  <div className="h-10 bg-cyan-950/60 rounded-t border-b border-cyan-800/40 flex items-center justify-center">
                    <span className="text-3xs text-cyan-300 font-bold">Clarified: 3.8 NTU</span>
                  </div>
                  {/* Settling Sludge Blanket Bottom */}
                  <div className="h-8 bg-amber-950/80 rounded-b flex items-center justify-center border-t border-amber-800">
                    <span className="text-3xs text-amber-400 font-mono font-bold">Sludge Rake</span>
                  </div>
                </div>

                <div className="text-3xs text-slate-400 flex justify-between">
                  <span>Overflow:</span>
                  <span className="text-cyan-300 font-bold">{(state.clarifierSOR || 1.25).toFixed(2)} m/h</span>
                </div>
              </div>

              {/* NODE 7: RAPID SAND FILTERS */}
              <div
                onClick={() => setSelectedUnitId('filters')}
                className={`cursor-pointer rounded-2xl p-3 border transition flex flex-col justify-between h-[230px] ${
                  selectedUnitId === 'filters'
                    ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-3xs">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">7. FILTERS</span>
                    {isBackwashing ? (
                      <Waves className="w-3 h-3 text-rose-400 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    )}
                  </div>
                  <h4 className="font-bold text-2xs text-white">Dual Sand Filters</h4>
                </div>

                {/* Filter Media Layers Graphic */}
                <div className="h-24 bg-slate-950 rounded-xl border border-slate-800 p-1.5 relative overflow-hidden flex flex-col justify-between">
                  <div className="h-4 bg-slate-800 rounded text-3xs text-slate-300 text-center font-bold">Anthracite</div>
                  <div className="h-6 bg-amber-900/60 rounded text-3xs text-amber-200 text-center font-bold">Silica Sand</div>
                  <div className="h-4 bg-slate-900 rounded text-3xs text-slate-400 text-center">Gravel Bed</div>
                  {isBackwashing && (
                    <div className="absolute inset-0 bg-cyan-900/80 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-3xs text-white font-bold animate-pulse">AIR SCOUR / WASH</span>
                    </div>
                  )}
                </div>

                <div className="text-3xs text-slate-400 flex justify-between">
                  <span>Filtrate:</span>
                  <span className="text-emerald-300 font-bold">0.12 NTU</span>
                </div>
              </div>

              {/* NODE 8: CWR & TREATED WATER STORAGE */}
              <div
                onClick={() => setSelectedUnitId('cwr')}
                className={`cursor-pointer rounded-2xl p-3 border transition flex flex-col justify-between h-[230px] ${
                  selectedUnitId === 'cwr'
                    ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/40 shadow-lg'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-3xs">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">8. CWR</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-2xs text-white">Clear Reservoir</h4>
                </div>

                {/* Pure Sparkling Potable Water Graphic */}
                <div className="h-24 bg-slate-950 rounded-xl border border-slate-800 p-2 relative overflow-hidden flex flex-col justify-between">
                  <div 
                    className="w-full rounded-xl transition-all duration-500 h-full flex flex-col justify-end p-2"
                    style={{ backgroundColor: getWaterColor('treated') }}
                  >
                    <div className="text-3xs font-mono font-extrabold text-white text-center drop-shadow-md">
                      POTABLE WATER
                    </div>
                    <div className="text-3xs font-mono text-cyan-100 text-center">
                      0.05 NTU | Cl₂ 1.2 mg/L
                    </div>
                  </div>
                </div>

                <div className="text-3xs text-slate-400 flex justify-between">
                  <span>Storage:</span>
                  <span className="text-emerald-300 font-bold">{simCapacityMLD * 0.4 * 1000} m³</span>
                </div>
              </div>

            </div>

            {/* BOTTOM SLUDGE & BYPRODUCT PROCESSING TIER */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div 
                onClick={() => setSelectedUnitId('sludgeThickener')}
                className={`cursor-pointer flex items-center gap-4 p-3 rounded-xl border transition ${
                  selectedUnitId === 'sludgeThickener'
                    ? 'bg-slate-800 border-amber-500 ring-2 ring-amber-500/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="p-2 bg-amber-950 rounded-lg text-amber-400 border border-amber-800">
                  <RecycleIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white">Sludge Management Circuit</span>
                    <span className="text-3xs bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800">
                      Underflow 3.5%
                    </span>
                  </div>
                  <p className="text-3xs text-slate-400">
                    Clarifier blowdown → Gravity thickener → Filter press cake (30% dry solids) + Supernatant recycle.
                  </p>
                </div>
              </div>

              {/* Water Balance Summary */}
              <div className="flex items-center gap-6 text-2xs font-mono">
                <div>
                  <span className="text-slate-500">Plant Recovery:</span>{' '}
                  <strong className="text-emerald-300">96.5%</strong>
                </div>
                <div>
                  <span className="text-slate-500">Filter Wash Loss:</span>{' '}
                  <strong className="text-cyan-300">2.2%</strong>
                </div>
                <div>
                  <span className="text-slate-500">Sludge Bleed:</span>{' '}
                  <strong className="text-amber-300">1.3%</strong>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* DYNAMIC UNIT PROCESS TELEMETRY & FORMULA DRILL-DOWN PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono font-bold text-3xs uppercase">
                {selectedUnit.category}
              </span>
              <h3 className="font-bold text-base text-white">{selectedUnit.name}</h3>
            </div>
            <p className="text-2xs text-slate-400 mt-1">
              Live calculated hydraulic conditions, energy consumption, and verified engineering formula linkage.
            </p>
          </div>

          <button
            onClick={() => onOpenFormulaInspector(selectedUnit.formulaId)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg border border-amber-400/40 transition"
          >
            <Calculator className="w-4 h-4" />
            <span>[fx Show Engineering Calculation: {selectedUnit.formulaId}]</span>
          </button>
        </div>

        {/* Live Subsystem KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-3xs text-slate-500 uppercase font-semibold">Subsystem Inflow</span>
            <div className="text-base font-bold text-cyan-300 font-mono">{selectedUnit.inflowM3hr.toFixed(1)} m³/h</div>
            <div className="text-3xs text-slate-400">{(selectedUnit.inflowM3hr / 3.6).toFixed(1)} L/s</div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-3xs text-slate-500 uppercase font-semibold">Retention / Contact Time</span>
            <div className="text-base font-bold text-amber-300 font-mono">
              {selectedUnit.retentionTimeSec >= 60 
                ? `${(selectedUnit.retentionTimeSec / 60).toFixed(1)} min` 
                : `${selectedUnit.retentionTimeSec.toFixed(0)} sec`}
            </div>
            <div className="text-3xs text-slate-400">t = V / Q</div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-3xs text-slate-500 uppercase font-semibold">Turbidity Transition</span>
            <div className="text-base font-bold text-emerald-300 font-mono">
              {selectedUnit.inflowTurbidityNTU.toFixed(1)} → {selectedUnit.outflowTurbidityNTU.toFixed(2)} <span className="text-3xs">NTU</span>
            </div>
            <div className="text-3xs text-emerald-400 font-bold">
              {(((selectedUnit.inflowTurbidityNTU - selectedUnit.outflowTurbidityNTU) / selectedUnit.inflowTurbidityNTU) * 100).toFixed(1)}% Red.
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-3xs text-slate-500 uppercase font-semibold">Hydraulic Head Loss</span>
            <div className="text-base font-bold text-purple-300 font-mono">{selectedUnit.headLossM.toFixed(2)} m</div>
            <div className="text-3xs text-slate-400">ΔH Gravity Flow</div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-3xs text-slate-500 uppercase font-semibold">Active Power Draw</span>
            <div className="text-base font-bold text-rose-300 font-mono">{selectedUnit.powerKw.toFixed(1)} kW</div>
            <div className="text-3xs text-slate-400">P = Q·ρ·g·H / η</div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-3xs text-slate-500 uppercase font-semibold">Chemical Feed</span>
            <div className="text-base font-bold text-blue-300 font-mono">{selectedUnit.chemicalFeedKgHr.toFixed(2)} kg/h</div>
            <div className="text-3xs text-slate-400">Mass Rate</div>
          </div>
        </div>
      </div>
      </>
      )}

    </div>
  );
};

function RecycleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
      <path d="M11 19h8.2a1.8 1.8 0 0 0 1.57-2.664L18.15 12" />
      <path d="m13 14-3-5.5 3-5.5" />
      <path d="M19 12h-8.2a1.8 1.8 0 0 0-1.57 2.664L11.85 20" />
      <path d="M3 5h8.2a1.8 1.8 0 0 1 1.57 2.664L10.15 12" />
    </svg>
  );
}
