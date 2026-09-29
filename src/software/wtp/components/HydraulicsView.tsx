import React, { useState } from 'react';
import { 
  Compass, Activity, ShieldAlert, Gauge, Zap, Sliders, Plus, Trash2, 
  Layers, FileText, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Download, RefreshCw 
} from 'lucide-react';
import { CalculatedWtpState } from '../core/dependencyEngine';
import { MASTER_PIPE_MATERIAL_REGISTRY, getPipeMaterialByCode } from '../core/pipeMaterialRegistry';
import { 
  generateWtpHydraulicProfile, HydraulicProfileNode, 
  calculateHazenWilliamsHeadLoss, calculateDarcyWeisbachHeadLoss, calculateSwameeJainFrictionFactor,
  calculateReynoldsNumber, calculateMinorHeadLoss, FITTINGS_K_REGISTRY, FittingItem,
  recommendPipeDiameters, PipeSizingOption
} from '../core/hydraulicEngine';
import { PumpSpec, solvePumpOperatingPoint, OperatingPointResult } from '../core/pumpEngine';
import { performJoukowskySurgeAnalysis, SurgeAnalysisResult } from '../core/surgeEngine';
import { runComprehensiveValidationMatrix } from '../core/validationEngine';

interface HydraulicsProps {
  state: CalculatedWtpState;
}

export const HydraulicsView: React.FC<HydraulicsProps> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'pipes' | 'fittings' | 'pumps' | 'surge' | 'validation'>('profile');

  // 1. Hydraulic Profile State
  const [datumElevationM, setDatumElevationM] = useState<number>(25.0);
  const [filterHeadLossM, setFilterHeadLossM] = useState<number>(1.8);
  const profileNodes: HydraulicProfileNode[] = generateWtpHydraulicProfile(
    state.plantCapacityMLD,
    datumElevationM,
    0.5, // intake
    0.25, // screen
    1.5, // aerator drop
    0.3, // rapid mix
    0.4, // flocculator
    0.6, // clarifier
    filterHeadLossM, // filter
    0.2, // disinfection
    0.1  // cwr
  );

  // 2. Pipe Sizing & Hydraulic State
  const [selectedMaterialCode, setSelectedMaterialCode] = useState<string>('DI');
  const [pipeDiameterMm, setPipeDiameterMm] = useState<number>(900);
  const [pipeLengthM, setPipeLengthM] = useState<number>(450);
  const selectedMaterial = getPipeMaterialByCode(selectedMaterialCode);

  const flowM3s = state.flowM3hr / 3600;
  const diaM = pipeDiameterMm / 1000;
  const pipeArea = (Math.PI * diaM * diaM) / 4;
  const currentVelocityMs = flowM3s / pipeArea;
  const reynoldsNo = calculateReynoldsNumber(currentVelocityMs, diaM, 20);
  const darcyF = calculateSwameeJainFrictionFactor(selectedMaterial.darcyRoughnessEpsilonMm, pipeDiameterMm, reynoldsNo);
  const hazenLossM = calculateHazenWilliamsHeadLoss(flowM3s, diaM, pipeLengthM, selectedMaterial.hazenWilliamsCDesign);
  const darcyLossM = calculateDarcyWeisbachHeadLoss(darcyF, pipeLengthM, diaM, currentVelocityMs);
  const sizingOptions: PipeSizingOption[] = recommendPipeDiameters(state.flowM3hr, selectedMaterialCode, pipeLengthM);

  // 3. Fittings State
  const [fittings, setFittings] = useState<FittingItem[]>([
    { id: '1', name: '90° Standard Elbow', type: 'Elbow 90°', quantity: 4, kFactorPerUnit: 0.75, standardRef: 'Crane TP 410' },
    { id: '2', name: 'Tee (Straight Line)', type: 'Tee Line', quantity: 2, kFactorPerUnit: 0.40, standardRef: 'Crane TP 410' },
    { id: '3', name: 'Gate Valve (Fully Open)', type: 'Gate Valve', quantity: 2, kFactorPerUnit: 0.15, standardRef: 'AWWA M11' },
    { id: '4', name: 'Check Valve (Swing)', type: 'Check Valve', quantity: 1, kFactorPerUnit: 2.00, standardRef: 'AWWA M11' }
  ]);

  const totalKSum = fittings.reduce((acc, f) => acc + (f.quantity * f.kFactorPerUnit), 0);
  const minorHeadLossM = calculateMinorHeadLoss(totalKSum, currentVelocityMs);

  const addFitting = (key: string) => {
    const item = FITTINGS_K_REGISTRY[key];
    if (!item) return;
    setFittings([...fittings, {
      id: Date.now().toString(),
      name: item.name,
      type: 'Elbow 90°',
      quantity: 1,
      kFactorPerUnit: item.defaultK,
      standardRef: item.ref
    }]);
  };

  const removeFitting = (id: string) => {
    setFittings(fittings.filter(f => f.id !== id));
  };

  // 4. Pump Engine State
  const [vfdSpeedRatio, setVfdSpeedRatio] = useState<number>(1.0); // 100%
  const [staticHeadM, setStaticHeadM] = useState<number>(28.0);
  const pumpSpec: PumpSpec = {
    id: 'PMP-HL-01',
    tag: 'PMP-HL-01A/B/C',
    name: 'High Lift Treated Water Distribution Pumps',
    processUnit: 'High Lift Distribution',
    type: 'Horizontal Split Case',
    numDuty: 2,
    numStandby: 1,
    flowPerPumpLs: (state.flowLs / 2),
    flowPerPumpM3hr: (state.flowM3hr / 2),
    ratedHeadM: 45.0,
    shutoffHeadM: 58.0,
    speedRpm: 1480,
    vfdSpeedRatio: vfdSpeedRatio,
    pumpEfficiencyPercent: 82.0,
    motorEfficiencyPercent: 94.5,
    npshRequiredM: 3.20,
    suctionStaticHeadM: 3.5, // 3.5m above pump centerline
    suctionLossesM: 0.45,
    waterTempC: 25.0,
    elevationAboveSeaLevelM: 100.0,
    isParallel: true
  };

  const pumpOpResult: OperatingPointResult = solvePumpOperatingPoint(pumpSpec, 0.000008, staticHeadM);

  // 5. Surge Analysis State
  const [closureTimeSec, setClosureTimeSec] = useState<number>(1.5);
  const [pipePnRatingBar, setPipePnRatingBar] = useState<number>(16);
  const surgeResult: SurgeAnalysisResult = performJoukowskySurgeAnalysis(
    pipeLengthM,
    pipeDiameterMm,
    10.0, // wall thickness
    selectedMaterialCode,
    currentVelocityMs,
    4.5, // operating pressure bar
    pipePnRatingBar,
    closureTimeSec
  );

  // 6. Validation Results
  const validationResults = runComprehensiveValidationMatrix(state, {
    pipe_velocity: currentVelocityMs,
    npsha: pumpOpResult.npshAvailableM,
    npshr: pumpSpec.npshRequiredM,
    peak_surge_bar: surgeResult.peakTotalPressureBar,
    pipe_pn_bar: pipePnRatingBar
  });

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-cyan-400" />
            <span>Process Hydraulics, Piping & Pumping Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connected HGL/EGL profile, Hazen-Williams & Darcy-Weisbach friction loss, minor loss K-matrix, pump system curves, VFD affinity laws, NPSH cavitation, and Joukowsky surge analysis.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-200 flex items-center gap-1.5 font-bold transition"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === 'profile'
              ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>HGL/EGL Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('pipes')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === 'pipes'
              ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Pipe Flow & Sizer</span>
        </button>

        <button
          onClick={() => setActiveTab('fittings')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === 'fittings'
              ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Fittings & Minor Loss</span>
        </button>

        <button
          onClick={() => setActiveTab('pumps')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === 'pumps'
              ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>Pump System Curves</span>
        </button>

        <button
          onClick={() => setActiveTab('surge')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === 'surge'
              ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Surge & Water Hammer</span>
        </button>

        <button
          onClick={() => setActiveTab('validation')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
            activeTab === 'validation'
              ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Validation Matrix</span>
        </button>
      </div>

      {/* TAB 1: PROCESS HYDRAULIC PROFILE */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-900 p-5 rounded-xl border border-slate-800">
            <div>
              <label className="text-slate-400 block mb-1">Datum Ground Elevation (m RL)</label>
              <input 
                type="number" 
                value={datumElevationM}
                onChange={e => setDatumElevationM(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Filter Terminal Head Loss (m)</label>
              <input 
                type="number" 
                step="0.1"
                value={filterHeadLossM}
                onChange={e => setFilterHeadLossM(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-amber-300 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Total Plant Hydraulic Drop (m)</label>
              <div className="text-xl font-bold text-emerald-400 pt-1">
                {profileNodes[profileNodes.length - 1]?.cumulativeHeadLossM} m
              </div>
            </div>
          </div>

          {/* Graphical Profile Visualization */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center justify-between">
              <span>Hydraulic Grade Line (HGL) & Energy Grade Line (EGL) Profile</span>
              <span className="text-xs text-slate-400">Total Length: 410m</span>
            </h2>

            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-4">
              <div className="relative h-56 w-full border-b border-l border-slate-700 flex items-end px-2 pt-4">
                {profileNodes.map((node, index) => {
                  const maxHgl = profileNodes[0].waterSurfaceElevationM + 2;
                  const minHgl = datumElevationM;
                  const hglHeight = ((node.waterSurfaceElevationM - minHgl) / (maxHgl - minHgl)) * 100;
                  const eglHeight = ((node.energyLineElevationM - minHgl) / (maxHgl - minHgl)) * 100;

                  return (
                    <div key={node.nodeId} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                      {/* EGL marker */}
                      <div 
                        className="absolute w-2 h-2 rounded-full bg-rose-400 z-20"
                        style={{ bottom: `${eglHeight}%` }}
                      />
                      {/* HGL bar */}
                      <div 
                        className="w-6 bg-cyan-500/40 border-t-2 border-cyan-400 rounded-t transition-all group-hover:bg-cyan-400/60"
                        style={{ height: `${hglHeight}%` }}
                      />
                      <div className="text-3xs text-slate-400 mt-2 truncate w-full text-center">{node.unitType}</div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-slate-100 border border-slate-700 p-2 rounded shadow-2xl z-30 text-3xs w-44">
                        <div className="font-bold text-cyan-300">{node.name}</div>
                        <div>HGL: <span className="text-emerald-300 font-bold">{node.waterSurfaceElevationM} m</span></div>
                        <div>EGL: <span className="text-rose-300 font-bold">{node.energyLineElevationM} m</span></div>
                        <div>Loss: <span className="text-amber-300 font-bold">{node.unitHeadLossM} m</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center gap-6 text-3xs pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-cyan-400 rounded-xs" />
                  <span>Water Surface Elevation (HGL)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-rose-400 rounded-full" />
                  <span>Energy Grade Line (EGL)</span>
                </div>
              </div>
            </div>

            {/* Profile Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-3xs">
                    <th className="py-2.5">Node ID</th>
                    <th className="py-2.5">Process Unit</th>
                    <th className="py-2.5 text-right">Chainage (m)</th>
                    <th className="py-2.5 text-right">HGL (m RL)</th>
                    <th className="py-2.5 text-right">EGL (m RL)</th>
                    <th className="py-2.5 text-right">Invert (m)</th>
                    <th className="py-2.5 text-right">Unit Loss (m)</th>
                    <th className="py-2.5 text-right">Cumulative Loss</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {profileNodes.map(node => (
                    <tr key={node.nodeId} className="hover:bg-slate-950">
                      <td className="py-2.5 font-bold text-cyan-300">{node.nodeId}</td>
                      <td className="py-2.5 text-slate-100 font-bold">{node.name}</td>
                      <td className="py-2.5 text-right text-slate-400">{node.chainageM}</td>
                      <td className="py-2.5 text-right text-emerald-400 font-bold">{node.waterSurfaceElevationM}</td>
                      <td className="py-2.5 text-right text-rose-400 font-bold">{node.energyLineElevationM}</td>
                      <td className="py-2.5 text-right text-slate-400">{node.pipeInvertElevationM}</td>
                      <td className="py-2.5 text-right text-amber-300 font-bold">{node.unitHeadLossM}</td>
                      <td className="py-2.5 text-right text-slate-200 font-bold">{node.cumulativeHeadLossM} m</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-3xs font-bold ${
                          node.status === 'OPTIMAL' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        }`}>
                          {node.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PIPE FLOW & AUTOMATIC SIZER */}
      {activeTab === 'pipes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 bg-slate-900 p-5 rounded-xl border border-slate-800">
            <div>
              <label className="text-slate-400 block mb-1">Pipe Material</label>
              <select 
                value={selectedMaterialCode}
                onChange={e => setSelectedMaterialCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              >
                {MASTER_PIPE_MATERIAL_REGISTRY.map(m => (
                  <option key={m.code} value={m.code}>{m.name} ({m.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Internal Diameter (mm)</label>
              <input 
                type="number" 
                value={pipeDiameterMm}
                onChange={e => setPipeDiameterMm(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-amber-300 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Pipe Length (m)</label>
              <input 
                type="number" 
                value={pipeLengthM}
                onChange={e => setPipeLengthM(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Flow Velocity (m/s)</label>
              <div className="text-xl font-bold text-emerald-400 pt-1">{currentVelocityMs.toFixed(2)} m/s</div>
            </div>
          </div>

          {/* Friction Loss Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-2">
              <div className="text-slate-400">Hazen-Williams Friction Loss</div>
              <div className="text-2xl font-bold text-cyan-300">{hazenLossM} m</div>
              <div className="text-3xs text-slate-500">C = {selectedMaterial.hazenWilliamsCDesign} | Loss Gradient: {((hazenLossM/pipeLengthM)*1000).toFixed(2)} m/km</div>
            </div>

            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-2">
              <div className="text-slate-400">Darcy-Weisbach Friction Loss</div>
              <div className="text-2xl font-bold text-emerald-300">{darcyLossM} m</div>
              <div className="text-3xs text-slate-500">f = {darcyF} | Re = {reynoldsNo.toLocaleString()} (Swamee-Jain)</div>
            </div>

            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-2">
              <div className="text-slate-400">Material Allowable Velocity</div>
              <div className="text-2xl font-bold text-amber-400">{selectedMaterial.recommendedMinVelocityMs} - {selectedMaterial.recommendedMaxVelocityMs} m/s</div>
              <div className="text-3xs text-slate-500">Elastic Modulus E: {selectedMaterial.elasticModulusGPa} GPa</div>
            </div>
          </div>

          {/* Automatic Pipe Sizing Recommendations */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
              Automatic Pipe Sizing Options Matrix (Flow: {state.flowM3hr} m³/hr)
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-3xs">
                    <th className="py-2">Nominal Diameter (mm)</th>
                    <th className="py-2 text-right">Velocity (m/s)</th>
                    <th className="py-2 text-right">Friction Gradient (m/km)</th>
                    <th className="py-2 text-right">Pressure Rating</th>
                    <th className="py-2">Engineering Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sizingOptions.map(opt => (
                    <tr key={opt.diameterMm} className={`hover:bg-slate-950 ${opt.diameterMm === pipeDiameterMm ? 'bg-cyan-950/40' : ''}`}>
                      <td className="py-2.5 font-bold text-cyan-300">DN {opt.diameterMm} mm</td>
                      <td className="py-2.5 text-right font-bold text-slate-200">{opt.velocityMs} m/s</td>
                      <td className="py-2.5 text-right text-amber-300">{opt.headLossMPerKm} m/km</td>
                      <td className="py-2.5 text-right text-slate-400">PN {opt.pressureRatingBar}</td>
                      <td className="py-2.5">
                        <button
                          onClick={() => setPipeDiameterMm(opt.diameterMm)}
                          className={`px-2.5 py-1 rounded text-3xs font-bold transition ${
                            opt.status === 'RECOMMENDED' 
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {opt.status} {opt.diameterMm === pipeDiameterMm && '✓ Active'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FITTINGS & MINOR LOSSES */}
      {activeTab === 'fittings' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                Pipeline Minor Loss & Fittings Resistance Matrix
              </h2>
              
              <div className="flex gap-2">
                <select 
                  onChange={e => addFitting(e.target.value)}
                  defaultValue=""
                  className="bg-slate-950 border border-slate-800 rounded px-3 py-1 text-slate-200 text-xs font-bold focus:outline-none focus:border-cyan-500"
                >
                  <option value="" disabled>+ Add Fitting / Valve...</option>
                  {Object.entries(FITTINGS_K_REGISTRY).map(([key, val]) => (
                    <option key={key} value={key}>{val.name} (K = {val.defaultK})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-3xs">
                    <th className="py-2">Fitting Name</th>
                    <th className="py-2 text-right">Quantity</th>
                    <th className="py-2 text-right">K Factor / Unit</th>
                    <th className="py-2 text-right">Total K</th>
                    <th className="py-2">Standard Ref</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {fittings.map(fit => (
                    <tr key={fit.id} className="hover:bg-slate-950">
                      <td className="py-2.5 font-bold text-slate-100">{fit.name}</td>
                      <td className="py-2.5 text-right font-bold text-cyan-300">
                        <input 
                          type="number"
                          min="1"
                          value={fit.quantity}
                          onChange={e => {
                            const val = Math.max(1, parseInt(e.target.value) || 1);
                            setFittings(fittings.map(f => f.id === fit.id ? { ...f, quantity: val } : f));
                          }}
                          className="w-16 bg-slate-950 border border-slate-800 rounded text-center py-0.5"
                        />
                      </td>
                      <td className="py-2.5 text-right text-amber-300 font-bold">{fit.kFactorPerUnit}</td>
                      <td className="py-2.5 text-right text-emerald-400 font-bold">{(fit.quantity * fit.kFactorPerUnit).toFixed(2)}</td>
                      <td className="py-2.5 text-slate-400 text-3xs">{fit.standardRef}</td>
                      <td className="py-2.5 text-right">
                        <button 
                          onClick={() => removeFitting(fit.id)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-slate-200">
              <div>
                <span>Cumulative Fitting Resistance K Sum: </span>
                <span className="font-bold text-cyan-300 text-sm">{totalKSum.toFixed(2)}</span>
              </div>
              <div>
                <span>Calculated Minor Head Loss (h_m): </span>
                <span className="font-bold text-rose-400 text-sm">{minorHeadLossM} m H₂O</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PUMP SYSTEM CURVE & VFD AFFINITY LAWS */}
      {activeTab === 'pumps' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-900 p-5 rounded-xl border border-slate-800">
            <div>
              <label className="text-slate-400 block mb-1">Static Lift Head (m)</label>
              <input 
                type="number" 
                value={staticHeadM}
                onChange={e => setStaticHeadM(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">VFD Speed Ratio ({Math.round(vfdSpeedRatio * 100)}%)</label>
              <input 
                type="range" 
                min="0.5"
                max="1.0"
                step="0.05"
                value={vfdSpeedRatio}
                onChange={e => setVfdSpeedRatio(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 mt-2"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Duty Pump Units</label>
              <div className="text-xl font-bold text-emerald-400 pt-1">
                2 Duty + 1 Standby (Parallel Flow)
              </div>
            </div>
          </div>

          {/* Operating Point KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
              <div className="text-slate-400">Operating Flow Rate</div>
              <div className="text-2xl font-bold text-cyan-300">{pumpOpResult.operatingFlowM3hr} m³/hr</div>
              <div className="text-3xs text-slate-500">{pumpOpResult.operatingFlowLs} L/s total</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
              <div className="text-slate-400">Operating Total Dynamic Head</div>
              <div className="text-2xl font-bold text-amber-400">{pumpOpResult.operatingHeadM} m</div>
              <div className="text-3xs text-slate-500">Static: {pumpOpResult.staticHeadM}m | Friction: {pumpOpResult.frictionHeadM}m</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
              <div className="text-slate-400">Total Motor Electrical Power</div>
              <div className="text-2xl font-bold text-rose-400">{pumpOpResult.motorPowerKw} kW</div>
              <div className="text-3xs text-slate-500">Daily: {pumpOpResult.dailyEnergyKwh} kWh/d</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
              <div className="text-slate-400">NPSH Safety Margin</div>
              <div className="text-2xl font-bold text-emerald-400">{pumpOpResult.npshMarginM} m</div>
              <div className="text-3xs text-emerald-400 font-bold">NPSHa: {pumpOpResult.npshAvailableM}m vs NPSHr: {pumpSpec.npshRequiredM}m ({pumpOpResult.cavitationStatus})</div>
            </div>
          </div>

          {/* Pump vs System Curve Plot */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex justify-between items-center">
              <span>Pump Performance Curve vs System Head Curve</span>
              <span className="text-xs text-emerald-400">Operating Point: {pumpOpResult.operatingFlowM3hr} m³/hr @ {pumpOpResult.operatingHeadM} m</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-3xs">
                    <th className="py-2">Flow Rate (m³/hr)</th>
                    <th className="py-2 text-right">System Head (m)</th>
                    <th className="py-2 text-right">Pump Head (m)</th>
                    <th className="py-2">Operating State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pumpOpResult.systemCurvePoints.map((pt, idx) => (
                    <tr key={idx} className="hover:bg-slate-950">
                      <td className="py-2 font-bold text-cyan-300">{pt.flowM3hr} m³/hr</td>
                      <td className="py-2 text-right text-amber-300 font-bold">{pt.systemHeadM} m</td>
                      <td className="py-2 text-right text-rose-400 font-bold">{pt.pumpHeadM} m</td>
                      <td className="py-2">
                        {Math.abs(pt.systemHeadM - pt.pumpHeadM) < 1.5 ? (
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded text-3xs font-bold">
                            ✓ INTERSECTION OPERATING POINT
                          </span>
                        ) : (
                          <span className="text-slate-500 text-3xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SURGE & WATER HAMMER ANALYSIS */}
      {activeTab === 'surge' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-900 p-5 rounded-xl border border-slate-800">
            <div>
              <label className="text-slate-400 block mb-1">Valve Closure / Pump Trip Time (s)</label>
              <input 
                type="number" 
                step="0.5"
                value={closureTimeSec}
                onChange={e => setClosureTimeSec(Math.max(0.1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Pipe Nominal Pressure Rating (PN bar)</label>
              <input 
                type="number" 
                value={pipePnRatingBar}
                onChange={e => setPipePnRatingBar(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-amber-300 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Wave Celerity (c)</label>
              <div className="text-xl font-bold text-emerald-400 pt-1">
                {surgeResult.waveCelerityMs} m/s ({selectedMaterialCode})
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
              <div className="text-slate-400">Critical Closure Time (Tc)</div>
              <div className="text-2xl font-bold text-cyan-300">{surgeResult.criticalClosureTimeSec} s</div>
              <div className="text-3xs text-slate-500">{surgeResult.isSuddenClosure ? '🔴 Sudden Closure (Full Joukowsky)' : '🟢 Gradual Closure'}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
              <div className="text-slate-400">Joukowsky Head Rise (ΔH)</div>
              <div className="text-2xl font-bold text-amber-400">{surgeResult.joukowskySurgeHeadM} m</div>
              <div className="text-3xs text-slate-500">{surgeResult.joukowskySurgePressureBar} bar surge rise</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
              <div className="text-slate-400">Peak Total Line Pressure</div>
              <div className="text-2xl font-bold text-rose-400">{surgeResult.peakTotalPressureBar} bar</div>
              <div className="text-3xs text-rose-400 font-bold">vs Pipe PN {surgeResult.pipePressureRatingBar} bar</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
              <div className="text-slate-400">Surge Compliance Status</div>
              <div className={`text-xl font-bold ${surgeResult.complianceStatus === 'PASS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {surgeResult.complianceStatus}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Engineering Surge Mitigation Strategy</span>
            </h2>
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200">
              {surgeResult.surgeProtectionRecommendation}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: VALIDATION MATRIX */}
      {activeTab === 'validation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2">
            Comprehensive Hydraulic & Pumping Compliance Matrix
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-3xs">
                  <th className="py-2">Category</th>
                  <th className="py-2">Parameter Name</th>
                  <th className="py-2 text-right">Design Value</th>
                  <th className="py-2">Criteria Standard</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Engineering Guidance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {validationResults.filter(r => r.category === 'Hydraulics' || r.category === 'Pumping' || r.category === 'Surge').map(res => (
                  <tr key={res.id} className="hover:bg-slate-950">
                    <td className="py-2.5 font-bold text-cyan-300">{res.category}</td>
                    <td className="py-2.5 text-slate-100 font-bold">{res.parameterName}</td>
                    <td className="py-2.5 text-right font-bold text-emerald-400">{res.designValue}</td>
                    <td className="py-2.5 text-slate-400 text-3xs">{res.standardRef}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-3xs font-bold ${
                        res.status === 'PASS' 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                          : res.status === 'WARNING'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-300 text-3xs">{res.message}</td>
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
