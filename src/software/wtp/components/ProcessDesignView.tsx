import React, { useState } from 'react';
import { 
  GitFork, 
  Layers, 
  Beaker, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  Activity, 
  Sliders, 
  ShieldCheck, 
  FileText, 
  RefreshCw, 
  Copy, 
  Server, 
  AlertTriangle,
  Wind,
  Droplets,
  Box,
  Compass,
  RotateCcw,
  Sparkles,
  Download
} from 'lucide-react';
import { CalculatedWtpState } from '../core/dependencyEngine';
import { JarTestResult, RevisionRecord } from '../types/wtp';
import { 
  calculateIntakeDesign, 
  calculateScreenDesign, 
  calculateAerationDesign, 
  calculateRapidMixDesign, 
  calculateFlocculationDesign, 
  calculateSedimentationDesign, 
  calculateFiltrationDesign, 
  calculateDisinfectionDesign, 
  calculateCwrDesign,
  generateProcessEquipmentSchedule
} from '../core/processDesignEngine';
import { MASTER_MEDIA_REGISTRY } from '../core/mediaRegistry';
import { propagateProcessStreams, DEFAULT_PROCESS_TRAIN } from '../core/processStreamEngine';
import { ProcessTrainBuilder } from './ProcessTrainBuilder';

interface ProcessDesignProps {
  state: CalculatedWtpState;
  customParams?: Record<string, number>;
  onUpdateParam: (key: string, val: number) => void;
  onOpenFormulaInspector: (paramId: string) => void;
}

export const ProcessDesignView: React.FC<ProcessDesignProps> = ({
  state,
  customParams = {},
  onUpdateParam,
  onOpenFormulaInspector
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'builder'
    | 'intake'
    | 'aeration'
    | 'coagulation'
    | 'flocculation'
    | 'sedimentation'
    | 'filtration'
    | 'disinfection'
    | 'cwr'
    | 'hydraulic'
    | 'equipment'
    | 'alternatives'
    | 'revisions'
    | 'report'
  >('builder');

  // Jar Test State
  const jarResults: JarTestResult[] = [
    { doseMgL: 15, ph: 7.2, initialTurbidityNTU: 120, finalTurbidityNTU: 45, flocSettlingSpeedMmS: 0.8, flocSizeDescription: 'Tiny pin-floc', isOptimal: false },
    { doseMgL: 25, ph: 7.0, initialTurbidityNTU: 120, finalTurbidityNTU: 12, flocSettlingSpeedMmS: 1.6, flocSizeDescription: 'Medium floc', isOptimal: false },
    { doseMgL: 35, ph: 6.8, initialTurbidityNTU: 120, finalTurbidityNTU: 1.8, flocSettlingSpeedMmS: 2.8, flocSizeDescription: 'Heavy dense floc', isOptimal: true },
    { doseMgL: 50, ph: 6.4, initialTurbidityNTU: 120, finalTurbidityNTU: 6.5, flocSettlingSpeedMmS: 2.2, flocSizeDescription: 'Over-coagulated restabilized', isOptimal: false },
  ];

  // Revisions State
  const [revisions, setRevisions] = useState<RevisionRecord[]>([
    { revId: 'REV-00', date: '2026-08-01', author: 'Principal Process Engineer', description: 'Initial Baseline Design', changesCount: 12, status: 'Approved' },
    { revId: 'REV-01', date: '2026-08-05', author: 'Senior Hydraulics Engineer', description: 'Updated Filter Backwash & SOR', changesCount: 5, status: 'Approved' },
    { revId: 'REV-02', date: '2026-08-10', author: 'WTP Design Lead', description: 'Tube Settler & Ozone Option Added', changesCount: 8, status: 'Draft' }
  ]);

  const [newRevDesc, setNewRevDesc] = useState('');

  // Design Engine Calculations
  const intakeRes = calculateIntakeDesign(state.plantCapacityMLD, 'River', 32.0, 28.0, 22.0, customParams['v_app'] || 0.15);
  const screenRes = calculateScreenDesign(state.plantCapacityMLD, 'Fine', 'Mechanical', 10, 6, 75);
  const aeratorRes = calculateAerationDesign(state.plantCapacityMLD, 'Cascade', customParams['fe_raw'] || 2.5, 0.5);
  const rapidMixRes = calculateRapidMixDesign(state.plantCapacityMLD, customParams['t_rm'] || 45, customParams['g_rm'] || 800, customParams['alum_dose'] || 35);
  const flocRes = calculateFlocculationDesign(state.plantCapacityMLD, 'Mechanical', customParams['t_floc'] || 20, 50, 30, 15);
  const sedRes = calculateSedimentationDesign(state.plantCapacityMLD, 'Tube Settler', customParams['sor'] || 3.5, customParams['tss_raw'] || 120, customParams['alum_dose'] || 35);
  const filtRes = calculateFiltrationDesign(state.plantCapacityMLD, 'Dual Media', customParams['v_filt'] || 6.0, customParams['v_bw'] || 36.0);
  const disRes = calculateDisinfectionDesign(state.plantCapacityMLD, customParams['cl2_dose'] || 3.5, customParams['t_contact'] || 30, 0.7, 20, 7.2);
  const cwrRes = calculateCwrDesign(state.plantCapacityMLD, customParams['t_cwr'] || 8.0);

  const equipmentList = generateProcessEquipmentSchedule(state.plantCapacityMLD);

  // Propagated Process Streams
  const streams = propagateProcessStreams(DEFAULT_PROCESS_TRAIN, state.plantCapacityMLD, {
    turbidityNTU: 120,
    tssMgL: customParams['tss_raw'] || 120,
    ironMgL: customParams['fe_raw'] || 2.5,
    manganeseMgL: 0.5,
    coliformCfu: 2400,
    ph: 7.2,
    alkalinityMgL: 85
  }, 25.0);

  const handleAddRevision = () => {
    if (!newRevDesc.trim()) return;
    const newRev: RevisionRecord = {
      revId: `REV-0${revisions.length}`,
      date: new Date().toISOString().split('T')[0],
      author: 'Lead Process Engineer',
      description: newRevDesc,
      changesCount: 3,
      status: 'Draft'
    };
    setRevisions([newRev, ...revisions]);
    setNewRevDesc('');
  };

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <GitFork className="w-6 h-6 text-cyan-400" />
            <span>WTP Comprehensive Process Design Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connected engineering process design suite: Design Basis → Raw Water → Process Selection → Unit Sizing → Hydraulic Profile → Water/Mass Balance → Equipment Schedule.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('builder')}
            className="px-3.5 py-2 bg-cyan-950 text-cyan-300 border border-cyan-700/80 hover:bg-cyan-900 rounded-lg text-xs font-bold font-mono transition flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>Process Train Builder</span>
          </button>
          <button 
            onClick={() => setActiveTab('report')}
            className="px-3.5 py-2 bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 rounded-lg text-xs font-bold font-mono transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Design Report</span>
          </button>
        </div>
      </div>

      {/* Main Sub-process Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 font-mono text-xs overflow-x-auto pb-2">
        {[
          { id: 'builder', label: '0. Train Builder' },
          { id: 'intake', label: '1. Intake & Screens' },
          { id: 'aeration', label: '2. Aeration' },
          { id: 'coagulation', label: '3. Coagulation' },
          { id: 'flocculation', label: '4. Flocculation' },
          { id: 'sedimentation', label: '5. Tube Clarifier' },
          { id: 'filtration', label: '6. Filters & Media' },
          { id: 'disinfection', label: '7. Disinfection CT' },
          { id: 'cwr', label: '8. Reservoir (CWR)' },
          { id: 'hydraulic', label: '9. Hydraulic Profile' },
          { id: 'equipment', label: '10. Equipment' },
          { id: 'alternatives', label: '11. Alternatives' },
          { id: 'revisions', label: '12. Revisions' },
          { id: 'report', label: '13. Full Report' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition ${
              activeTab === tab.id 
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold shadow-inner' 
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 0: Process Train Builder */}
      {activeTab === 'builder' && (
        <ProcessTrainBuilder
          plantCapacityMLD={state.plantCapacityMLD}
          rawWaterQuality={{
            turbidityNTU: 120,
            tssMgL: customParams['tss_raw'] || 120,
            ironMgL: customParams['fe_raw'] || 2.5,
            manganeseMgL: 0.5,
            coliformCfu: 2400,
            ph: 7.2,
            alkalinityMgL: 85
          }}
          onSelectUnitToDesign={(u) => setActiveTab(u as any)}
        />
      )}

      {/* Tab 1: Intake & Screening */}
      {activeTab === 'intake' && (
        <div className="space-y-8 font-mono text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                  1.1 River Intake Structure Sizing
                </h2>
                <button 
                  onClick={() => onOpenFormulaInspector('INT-VEL-001')}
                  className="text-2xs text-cyan-400 hover:underline"
                >
                  Inspect Formula →
                </button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-500 block text-3xs">Target Approach Velocity</span>
                    <input
                      type="number"
                      step="0.01"
                      value={customParams['v_app'] || 0.15}
                      onChange={e => onUpdateParam('v_app', Number(e.target.value))}
                      className="bg-transparent text-emerald-400 font-bold text-sm w-full outline-none focus:border-b focus:border-emerald-500"
                    />
                    <span className="text-3xs text-slate-500 block mt-0.5">m/s (Max 0.20 m/s recommended)</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded border border-slate-800">
                    <span className="text-slate-500 block text-3xs">Total Required Opening Area</span>
                    <span className="text-cyan-300 font-bold text-sm">{intakeRes.totalOpeningAreaM2} m²</span>
                    <span className="text-3xs text-slate-500 block mt-0.5">For {intakeRes.designFlowM3hr} m³/hr flow</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Number of Intake Ports:</span>
                    <span className="text-slate-100 font-bold">{intakeRes.numOpenings} Ports</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Port Dimensions (W x H):</span>
                    <span className="text-slate-100 font-bold">{intakeRes.openingWidthM} m x {intakeRes.openingHeightM} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Intake Pipe Diameter & Velocity:</span>
                    <span className="text-amber-400 font-bold">DN{intakeRes.intakePipeDiameterMm} mm @ {intakeRes.intakePipeVelocityMs} m/s</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400">Min Submergence Below LWL (22.0m):</span>
                    <span className="text-emerald-400 font-bold">{intakeRes.minSubmergenceM} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Trash Rack Surface Area:</span>
                    <span className="text-cyan-300 font-bold">{intakeRes.trashRackAreaM2} m²</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                  <span className="text-slate-400">Validation Status:</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-3xs ${
                    intakeRes.status === 'PASS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {intakeRes.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                1.2 Mechanical Bar Screen Hydraulics
              </h2>
              <div className="space-y-3">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Screen Mechanism:</span>
                    <span className="text-slate-100 font-bold">{screenRes.mechanism} ({screenRes.screenType})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Screen Clear Spacing:</span>
                    <span className="text-slate-100 font-bold">{screenRes.clearSpacingMm} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Through-Screen Velocity:</span>
                    <span className="text-cyan-300 font-bold">{screenRes.throughScreenVelocityMs} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kirschmer Head Loss:</span>
                    <span className="text-rose-400 font-bold">{screenRes.kirschmerHeadLossM} m</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400">Channel Dimensions (W x D):</span>
                    <span className="text-slate-100 font-bold">{screenRes.screenChannelWidthM} m x {screenRes.screenChannelDepthM} m</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-3xs text-slate-400">
                  <div className="font-bold text-slate-200">Engineering Recommendation:</div>
                  <p>Fine screens precede the cascade aerator to capture leaves, plastic bags, and debris, preventing downstream pipe blockages and mechanical mixer fouling.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Aeration */}
      {activeTab === 'aeration' && (
        <div className="space-y-8 font-mono text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  <span>Cascade Aerator Engineering Sizing</span>
                </h2>
                <button onClick={() => onOpenFormulaInspector('AER-LOAD-001')} className="text-2xs text-cyan-400 hover:underline">
                  Inspect Formula →
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Design Flow Capacity:</span>
                    <span className="text-slate-100 font-bold">{aeratorRes.designFlowM3hr} m³/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cascade Drop Height:</span>
                    <span className="text-amber-400 font-bold">{aeratorRes.totalDropHeightM} m ({aeratorRes.numStepsOrTrays} Steps)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hydraulic Area Required:</span>
                    <span className="text-cyan-300 font-bold">{aeratorRes.totalAreaM2} m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hydraulic Loading Rate:</span>
                    <span className="text-emerald-400 font-bold">{aeratorRes.hydraulicLoadingM3M2Hr} m³/m²·hr</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400">Oxygen Transfer Rate:</span>
                    <span className="text-emerald-300 font-bold">{aeratorRes.oxygenTransferRateKgO2Hr} kg O₂/hr</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="text-slate-300 font-bold">Iron & Manganese Oxidation Objectives:</div>
                  <div className="text-3xs text-slate-400 space-y-1">
                    <div>• Raw Iron: {customParams['fe_raw'] || 2.5} mg/L Fe²⁺ → Oxidizes to Fe(OH)₃ insoluble precipitate (65% removal across cascade).</div>
                    <div>• Raw Manganese: 0.5 mg/L Mn²⁺ → Partially oxidizes to MnO₂.</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                Alternative Aeration Modes (Diffused / Tray)
              </h2>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Diffused Blower Air Flow:</span>
                  <span className="text-slate-100 font-bold">{aeratorRes.blowerAirFlowNm3Hr || 1200} Nm³/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Blower Motor Power:</span>
                  <span className="text-amber-400 font-bold">{aeratorRes.blowerPowerKw || 18.5} kW</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">Process Status:</span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold text-3xs">
                    {aeratorRes.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Coagulation & Jar Test */}
      {activeTab === 'coagulation' && (
        <div className="space-y-8 font-mono text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                  3.1 Rapid Mixing Chamber Sizing
                </h2>
                <button
                  onClick={() => onOpenFormulaInspector('COA-MIX-003')}
                  className="text-2xs text-cyan-400 hover:underline"
                >
                  Inspect Formula →
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 block mb-1">Mixing Residence Time (t_rm in seconds)</label>
                  <input
                    type="number"
                    value={customParams['t_rm'] || 45}
                    onChange={e => onUpdateParam('t_rm', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Velocity Gradient G (s⁻¹)</label>
                  <input
                    type="number"
                    value={customParams['g_rm'] || 800}
                    onChange={e => onUpdateParam('g_rm', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold"
                  />
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Calculated Chamber Volume:</span>
                    <span className="text-cyan-300 font-bold">{rapidMixRes.chamberVolumeM3} m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Impeller Shaft Power Required:</span>
                    <span className="text-amber-400 font-bold">{rapidMixRes.shaftPowerKw} kW</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400">Camp Mixing Index (G * t):</span>
                    <span className="text-emerald-400 font-bold">{rapidMixRes.campGT.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Alum Consumption:</span>
                    <span className="text-cyan-300 font-bold">{rapidMixRes.dailyAlumMassKgDay.toLocaleString()} kg/day</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Jar Test Module */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                <Beaker className="w-4 h-4 text-cyan-400" />
                <span>3.2 Laboratory Jar Test Optimization Module</span>
              </h2>

              <div className="space-y-3">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-3xs">
                      <th className="py-2">Alum Dose</th>
                      <th className="py-2">Final Turbidity</th>
                      <th className="py-2">Settling Speed</th>
                      <th className="py-2">Floc Description</th>
                      <th className="py-2">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jarResults.map((res, i) => (
                      <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-950">
                        <td className="py-2.5 font-bold text-slate-200">{res.doseMgL} mg/L</td>
                        <td className="py-2.5 text-emerald-400 font-bold">{res.finalTurbidityNTU} NTU</td>
                        <td className="py-2.5 text-slate-300">{res.flocSettlingSpeedMmS} mm/s</td>
                        <td className="py-2.5 text-slate-400">{res.flocSizeDescription}</td>
                        <td className="py-2.5">
                          {res.isOptimal ? (
                            <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">
                              OPTIMAL DOSE
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded text-3xs text-slate-400">
                  Note: Recommended optimal dose derived from jar testing is 35 mg/L Alum at pH 6.8. Requires continuous online turbidity verification.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Flocculation */}
      {activeTab === 'flocculation' && (
        <div className="space-y-8 font-mono text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                  4.1 3-Stage Mechanical Tapered Flocculator
                </h2>
                <button onClick={() => onOpenFormulaInspector('FLOC-VOL-001')} className="text-2xs text-cyan-400 hover:underline">
                  Inspect Formula →
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 block mb-1">Total Flocculation Detention Time (minutes)</label>
                  <input
                    type="number"
                    value={customParams['t_floc'] || 20}
                    onChange={e => onUpdateParam('t_floc', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold"
                  />
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stage 1 Velocity Gradient G1:</span>
                    <span className="text-cyan-300 font-bold">{flocRes.stage1G} s⁻¹ (High energy floc initiation)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stage 2 Velocity Gradient G2:</span>
                    <span className="text-amber-400 font-bold">{flocRes.stage2G} s⁻¹ (Medium growth stage)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stage 3 Velocity Gradient G3:</span>
                    <span className="text-emerald-400 font-bold">{flocRes.stage3G} s⁻¹ (Gentle floc aggregation)</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400">Total Flocculation Volume:</span>
                    <span className="text-slate-100 font-bold">{flocRes.totalVolumeM3} m³ ({flocRes.numBasins} Parallel Basins)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Camp Index Camp GT:</span>
                    <span className="text-cyan-300 font-bold">{flocRes.totalCampGT.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Motor Shaft Power:</span>
                    <span className="text-amber-400 font-bold">{flocRes.totalMotorPowerKw} kW</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                4.2 Mechanical Paddle Wheel Specification
              </h2>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Paddle Wheel Diameter:</span>
                  <span className="text-slate-100 font-bold">{flocRes.paddleDiameterM} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Paddle Blade Width:</span>
                  <span className="text-slate-100 font-bold">{flocRes.paddleWidthM} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stage 1 Variable Speed RPM:</span>
                  <span className="text-amber-300 font-bold">{flocRes.paddleRpmStage1} RPM</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">Floc Shear Protection Check:</span>
                  <span className="text-emerald-400 font-bold">Tip speed &lt; 0.8 m/s (Pass)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Sedimentation / Tube Settler */}
      {activeTab === 'sedimentation' && (
        <div className="space-y-8 font-mono text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                  5.1 High-Rate Tube Settler Clarifier
                </h2>
                <button onClick={() => onOpenFormulaInspector('SED-SOR-001')} className="text-2xs text-cyan-400 hover:underline">
                  Inspect Formula →
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 block mb-1">Surface Overflow Rate (SOR in m³/m²·hr)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customParams['sor'] || 3.5}
                    onChange={e => onUpdateParam('sor', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold"
                  />
                  <span className="text-3xs text-slate-500 block mt-1">Recommended: 3.0 - 4.5 m³/m²·hr for Tube Settlers</span>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Number of Units:</span>
                    <span className="text-slate-100 font-bold">{sedRes.numUnits} Units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plan Surface Area per Unit:</span>
                    <span className="text-cyan-300 font-bold">{sedRes.planAreaPerUnitM2} m² ({sedRes.lengthM}m L x {sedRes.widthM}m W)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Basin Side Water Depth:</span>
                    <span className="text-slate-100 font-bold">{sedRes.depthM} m</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400">Effluent Weir Length:</span>
                    <span className="text-amber-400 font-bold">{sedRes.weirLengthM} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Effluent Weir Loading Rate:</span>
                    <span className="text-emerald-400 font-bold">{sedRes.weirLoadingM3MHr} m³/m·hr</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400">Estimated Dry Sludge Generated:</span>
                    <span className="text-rose-400 font-bold">{sedRes.sludgeProductionKgDay.toLocaleString()} kg/day</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                5.2 Inclined Tube Settler Module Specifications
              </h2>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tube Module Length:</span>
                  <span className="text-slate-100 font-bold">{sedRes.tubeLengthM} m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tube Inclination Angle:</span>
                  <span className="text-slate-100 font-bold">{sedRes.tubeAngleDeg}° to Horizontal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Tube Modules Required:</span>
                  <span className="text-cyan-300 font-bold">{sedRes.numTubeModules} Modules</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">Clarification Status:</span>
                  <span className={`px-2 py-0.5 rounded font-bold text-3xs ${
                    sedRes.status === 'PASS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {sedRes.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Rapid Sand Filters & Media */}
      {activeTab === 'filtration' && (
        <div className="space-y-8 font-mono text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                  6.1 Filter Sizing & Backwash System
                </h2>
                <button onClick={() => onOpenFormulaInspector('FIL-RATE-001')} className="text-2xs text-cyan-400 hover:underline">
                  Inspect Formula →
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 block mb-1">Filtration Rate (v_filt in m³/m²·hr)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={customParams['v_filt'] || 6.0}
                    onChange={e => onUpdateParam('v_filt', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold"
                  />
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Filter Configuration:</span>
                    <span className="text-slate-100 font-bold">{filtRes.totalFilters} Beds ({filtRes.dutyFilters} Duty + {filtRes.standbyFilters} Standby)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Area per Filter Bed:</span>
                    <span className="text-cyan-300 font-bold">{filtRes.areaPerFilterM2} m² ({filtRes.filterLengthM}m x {filtRes.filterWidthM}m)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rose Clean Bed Head Loss:</span>
                    <span className="text-emerald-400 font-bold">{filtRes.cleanBedHeadLossM} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Terminal Head Loss Trigger:</span>
                    <span className="text-rose-400 font-bold">{filtRes.terminalHeadLossM} m</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400">Backwash Water Rate & Pump:</span>
                    <span className="text-amber-400 font-bold">{filtRes.backwashWaterRateM3M2Hr} m/hr ({filtRes.backwashPumpCapacityM3hr} m³/hr Pump)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Underdrain Nozzle Count:</span>
                    <span className="text-cyan-300 font-bold">{filtRes.underdrainNozzleCount} Nozzles/Bed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Registry Selection */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>6.2 Master Filter Media Layer Specs</span>
              </h2>

              <div className="space-y-3">
                {MASTER_MEDIA_REGISTRY.slice(0, 4).map(media => (
                  <div key={media.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                    <div className="flex justify-between font-bold text-slate-100">
                      <span>{media.name}</span>
                      <span className="text-amber-400">{media.recommendedMinDepthMm}-{media.recommendedMaxDepthMm} mm Depth</span>
                    </div>
                    <div className="flex justify-between text-3xs text-slate-400">
                      <span>Eff Size (d₁₀): {media.effectiveSizeMm}mm | UC: {media.uniformityCoefficientUC}</span>
                      <span>SG: {media.specificGravity} | Porosity: {media.porosityRatio}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-Time Filter Operational Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2">
              6.3 Filter Operational Status Tracker
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filtRes.operationalStates.map((st) => (
                <div key={st.filterId} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{st.filterId}</span>
                    <span className={`px-2 py-0.5 rounded text-3xs font-bold ${
                      st.status === 'RUNNING' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      st.status === 'BACKWASH' ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {st.status}
                    </span>
                  </div>
                  <div className="text-3xs text-slate-400 flex justify-between">
                    <span>Run Time: {st.runTimeHours}h</span>
                    <span className="text-amber-400 font-bold">HL: {st.currentHeadLossM} m</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Disinfection & CT */}
      {activeTab === 'disinfection' && (
        <div className="space-y-8 font-mono text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                  7.1 Chlorine Disinfection & CT Calculation
                </h2>
                <button onClick={() => onOpenFormulaInspector('DIS-CT-001')} className="text-2xs text-cyan-400 hover:underline">
                  Inspect Formula →
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 block mb-1">Applied Chlorine Dose (mg/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={customParams['cl2_dose'] || 3.5}
                    onChange={e => onUpdateParam('cl2_dose', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold"
                  />
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Residual Free Chlorine:</span>
                    <span className="text-emerald-400 font-bold">{disRes.residualFreeCl2MgL} mg/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contact Retention Time:</span>
                    <span className="text-slate-100 font-bold">{disRes.contactTimeMin} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Baffle Factor (T₁₀/T_avg):</span>
                    <span className="text-amber-400 font-bold">{disRes.baffleFactor} (Baffled Tank)</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400">Achieved CT Value:</span>
                    <span className="text-cyan-300 font-bold text-sm">{disRes.achievedCTMgMinL} mg·min/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Required EPA CT (4-Log Virus / 3-Log Giardia):</span>
                    <span className="text-emerald-400 font-bold">{disRes.requiredCTMgMinL} mg·min/L</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400">Daily Gas Chlorine Required:</span>
                    <span className="text-amber-400 font-bold">{disRes.dailyChlorineMassKgDay} kg/day</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                7.2 Serpentine Contact Tank Hydraulics
              </h2>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Path Configuration:</span>
                  <span className="text-slate-100 font-bold">4-Pass Serpentine Channels</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Short-circuiting Protection:</span>
                  <span className="text-emerald-400 font-bold">End-around Baffles Installed</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">Log Inactivation Compliance:</span>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold text-3xs">
                    4-LOG VIRUS / 3-LOG GIARDIA PASS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Reservoir (CWR) */}
      {activeTab === 'cwr' && (
        <div className="space-y-8 font-mono text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                Clear Water Reservoir (CWR) Capacity Sizing
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 block mb-1">Target Storage Duration (hours)</label>
                  <input
                    type="number"
                    value={customParams['t_cwr'] || 8.0}
                    onChange={e => onUpdateParam('t_cwr', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-bold"
                  />
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Required Storage Volume:</span>
                    <span className="text-cyan-300 font-bold">{cwrRes.requiredVolumeM3.toLocaleString()} m³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Compartments:</span>
                    <span className="text-slate-100 font-bold">{cwrRes.numCompartments} Independent Cells</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dimensions per Cell (L x W x D):</span>
                    <span className="text-slate-100 font-bold">{cwrRes.lengthM}m x {cwrRes.widthM}m x {cwrRes.usableDepthM}m</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400">Freeboard Allowance:</span>
                    <span className="text-amber-400 font-bold">{cwrRes.freeboardM} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Daily Turnover Rate:</span>
                    <span className="text-emerald-400 font-bold">{cwrRes.turnoverRatePerDay} Turnovers/Day</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                CWR Hydraulics & High Lift Connection
              </h2>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Inlet Pipe Diameter:</span>
                  <span className="text-slate-100 font-bold">DN900 mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Suction Well Invert Elevation:</span>
                  <span className="text-cyan-300 font-bold">+18.20 m RL</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400">High Lift Pump Station Duty:</span>
                  <span className="text-amber-400 font-bold">3 Duty + 1 Standby Pumps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Hydraulic Profile */}
      {activeTab === 'hydraulic' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Integrated Hydraulic Grade Line (HGL) Elevation Profile</span>
            </h2>
            <span className="text-2xs text-slate-400">Datum: +25.00 m RL Intake Surface</span>
          </div>

          <div className="space-y-3">
            {streams.map((strm, idx) => (
              <div key={strm.streamId} className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center font-bold text-3xs">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-100">{strm.name}</div>
                    <div className="text-3xs text-slate-400">Flow: {strm.flowM3hr} m³/hr ({strm.flowLs} L/s)</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-500 block text-3xs">Unit Headloss</span>
                    <span className="text-rose-400 font-bold">-{strm.headLossM} m</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-3xs">Water Surface Elevation</span>
                    <span className="text-emerald-300 font-bold">+{strm.hydraulicLevelM} m RL</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold text-3xs">
                    {strm.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 10: Equipment Schedule & Redundancy */}
      {activeTab === 'equipment' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 font-mono text-xs">
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Auto-Generated Equipment Schedule & N+1 Redundancy Matrix</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-3xs">
                  <th className="py-2">Tag</th>
                  <th className="py-2">Equipment Description</th>
                  <th className="py-2">Process Unit</th>
                  <th className="py-2">Duty/Standby</th>
                  <th className="py-2">Capacity</th>
                  <th className="py-2">Head/Pressure</th>
                  <th className="py-2">Power (kW)</th>
                  <th className="py-2">Material</th>
                </tr>
              </thead>
              <tbody>
                {equipmentList.map((eq) => (
                  <tr key={eq.id} className="border-b border-slate-800/50 hover:bg-slate-950">
                    <td className="py-2.5 font-bold text-cyan-300">{eq.tag}</td>
                    <td className="py-2.5 text-slate-100 font-bold">{eq.description}</td>
                    <td className="py-2.5 text-slate-400">{eq.processUnit}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-amber-300 font-bold">
                        {eq.duty} Duty + {eq.standby} Standby
                      </span>
                    </td>
                    <td className="py-2.5 text-emerald-400 font-bold">{eq.capacityPerUnit}</td>
                    <td className="py-2.5 text-slate-300">{eq.headOrPressure}</td>
                    <td className="py-2.5 text-amber-400 font-bold">{eq.powerKw} kW</td>
                    <td className="py-2.5 text-slate-400">{eq.material}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 11: Alternatives */}
      {activeTab === 'alternatives' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 font-mono text-xs">
          <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2">
            Process Design Trade-Off Matrix
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="font-bold text-amber-300 text-sm">Alternative A: Conventional Clarifier + Rapid Sand</div>
              <div className="space-y-1.5 text-slate-300 text-3xs">
                <div className="flex justify-between"><span>Footprint Area:</span><span className="text-slate-100 font-bold">4,800 m²</span></div>
                <div className="flex justify-between"><span>Capex Index:</span><span className="text-slate-100 font-bold">100% Baseline</span></div>
                <div className="flex justify-between"><span>Chemical Opex:</span><span className="text-slate-100 font-bold">Standard Alum</span></div>
                <div className="flex justify-between"><span>Operational Complexity:</span><span className="text-emerald-400 font-bold">Low</span></div>
              </div>
            </div>

            <div className="p-5 bg-slate-950 border border-cyan-800/80 rounded-xl space-y-3">
              <div className="font-bold text-cyan-300 text-sm">Alternative B: Tube Settler + Dual Media (Selected)</div>
              <div className="space-y-1.5 text-slate-300 text-3xs">
                <div className="flex justify-between"><span>Footprint Area:</span><span className="text-emerald-400 font-bold">2,100 m² (-56% compact)</span></div>
                <div className="flex justify-between"><span>Capex Index:</span><span className="text-slate-100 font-bold">92% (-8% savings)</span></div>
                <div className="flex justify-between"><span>Chemical Opex:</span><span className="text-slate-100 font-bold">Tapered G Optimization</span></div>
                <div className="flex justify-between"><span>Operational Complexity:</span><span className="text-cyan-400 font-bold">Moderate / High Rate</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 12: Revisions */}
      {activeTab === 'revisions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
              Engineering Revision Control & Snapshot Log
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New Revision Description..."
                value={newRevDesc}
                onChange={e => setNewRevDesc(e.target.value)}
                className="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded text-slate-100 text-2xs w-64"
              />
              <button
                onClick={handleAddRevision}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded text-2xs"
              >
                + Create Rev Snapshot
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {revisions.map(rev => (
              <div key={rev.revId} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-cyan-300">{rev.revId}</span>
                    <span className="text-slate-100 font-bold">{rev.description}</span>
                  </div>
                  <div className="text-3xs text-slate-400 mt-1">
                    Author: {rev.author} | Date: {rev.date} | Changes: {rev.changesCount}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded font-bold text-3xs ${
                  rev.status === 'Approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-300'
                }`}>
                  {rev.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 13: Full Process Design Report */}
      {activeTab === 'report' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6 font-mono text-xs text-slate-100">
          <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-cyan-300 uppercase">Process Design Basis & Comprehensive Engineering Report</h2>
              <div className="text-2xs text-slate-400">EVL WTP Engineering Suite | ISO 9001 / AWWA / CPHEEO Compliant Document</div>
            </div>
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Export Engineering Report</span>
            </button>
          </div>

          <div className="space-y-4 text-2xs leading-relaxed">
            <p><strong>1. Design Basis Summary:</strong> Target treatment capacity of {state.plantCapacityMLD} MLD nominal product output ({state.flowM3hr} m³/hr operating 24 hours/day).</p>
            <p><strong>2. Intake & Screening:</strong> River intake tower with approach velocity {intakeRes.approachVelocityMs} m/s and mechanical fine screens with Kirschmer headloss {screenRes.kirschmerHeadLossM} m.</p>
            <p><strong>3. Aeration:</strong> Cascade aerator drop height {aeratorRes.totalDropHeightM} m with oxygen transfer capacity of {aeratorRes.oxygenTransferRateKgO2Hr} kg O₂/hr.</p>
            <p><strong>4. Coagulation & Rapid Mix:</strong> Flash mixer volume {rapidMixRes.chamberVolumeM3} m³ with {rapidMixRes.shaftPowerKw} kW shaft power at G = {rapidMixRes.velocityGradientG} s⁻¹ and Camp Index GT = {rapidMixRes.campGT}.</p>
            <p><strong>5. Flocculation:</strong> 3-stage tapered mechanical flocculator with G values 50, 30, 15 s⁻¹ and total Camp GT = {flocRes.totalCampGT.toLocaleString()}.</p>
            <p><strong>6. Sedimentation:</strong> High-rate tube settler plan area {sedRes.planAreaPerUnitM2} m² per unit operating at Surface Overflow Rate (SOR) {sedRes.sorM3M2Hr} m³/m²·hr.</p>
            <p><strong>7. Filtration:</strong> Dual media rapid gravity filter with {filtRes.totalFilters} filter beds operating at {filtRes.filtrationRateM3M2Hr} m/hr filtration velocity and Rose clean bed head loss {filtRes.cleanBedHeadLossM} m.</p>
            <p><strong>8. Disinfection:</strong> Achieved chlorine CT of {disRes.achievedCTMgMinL} mg·min/L guaranteeing 4-Log Virus and 3-Log Giardia inactivation.</p>
            <p><strong>9. Clear Water Reservoir:</strong> {cwrRes.requiredVolumeM3.toLocaleString()} m³ usable capacity in 2 compartments providing {cwrRes.requiredStorageHours} hours emergency distribution buffer.</p>
            <p><strong>10. Equipment Schedule:</strong> Auto-generated schedule comprising {equipmentList.length} major mechanical and electrical units with N+1 redundancy compliance.</p>
          </div>
        </div>
      )}
    </div>
  );
};
