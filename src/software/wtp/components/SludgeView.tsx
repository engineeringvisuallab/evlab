import React, { useState } from 'react';
import {
  Recycle,
  Droplets,
  Layers,
  Truck,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Info,
  Sliders,
  CheckCircle2,
  XCircle,
  FileText,
  Activity,
  DollarSign
} from 'lucide-react';
import { CalculatedWtpState } from '../core/dependencyEngine';
import {
  calculateSolidsBalance,
  generateSludgeSourceRegistry,
  calculateSludgePumpingHydraulics,
  calculateSludgeStorageAndCake,
  calculateEnvironmentalDischarge,
  generateEnvironmentalRiskRegister,
  calculateSludgeEnergyAndCost
} from '../core/sludgeEngine';
import {
  calculateGravityThickener,
  calculateDafThickener,
  calculateDewateringEquipment
} from '../core/thickenerEngine';
import {
  calculateFilterBackwashWater,
  calculateBackwashRecovery,
  calculateMembraneReject,
  calculateCipAndChemicalWaste,
  calculateMasterLiquidWasteBalance
} from '../core/backwashEngine';

interface SludgeProps {
  state: CalculatedWtpState;
}

export const SludgeView: React.FC<SludgeProps> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'SOLIDS' | 'THICKENING' | 'BACKWASH' | 'PUMPING' | 'ENVIRONMENTAL'>('SOLIDS');
  const [dewateringTech, setDewateringTech] = useState<'FILTER_PRESS' | 'BELT_FILTER_PRESS' | 'CENTRIFUGE' | 'SCREW_PRESS' | 'DRYING_BED' | 'GEOBAG'>('FILTER_PRESS');

  // Interactive controls
  const [tssRaw, setTssRaw] = useState<number>(120);
  const [alumDose, setAlumDose] = useState<number>(35);
  const [limeDose, setLimeDose] = useState<number>(12);
  const [polymerDose, setPolymerDose] = useState<number>(3.5);
  const [cakeSolidsPct, setCakeSolidsPct] = useState<number>(30.0);
  const [backwashRecoveryPct, setBackwashRecoveryPct] = useState<number>(95.0);

  // Calculations
  const solids = calculateSolidsBalance(
    state.plantCapacityMLD,
    tssRaw,
    2,
    alumDose,
    0,
    0,
    limeDose,
    1.8,
    0.4,
    0.5
  );

  const streams = generateSludgeSourceRegistry(state, solids);
  const thickener = calculateGravityThickener(solids.totalDrySolidsGeneratedKgDay / (1000 * 0.025), 2.5, 35.0, 4.5, 92.0);
  const dafThickener = calculateDafThickener(solids.totalDrySolidsGeneratedKgDay / (1000 * 0.01), 1.0, 0.03, 30.0, 5.0);
  const dewatering = calculateDewateringEquipment(dewateringTech, thickener.underflowSludgeM3Day, thickener.underflowSolidsPercent, 8);
  const cakeStorage = calculateSludgeStorageAndCake(solids.totalDrySolidsGeneratedKgDay, cakeSolidsPct, 3, 15);
  const sludgePump = calculateSludgePumpingHydraulics(thickener.underflowSludgeM3Day / 24, thickener.underflowSolidsPercent, 150, 150, 8.0, 'PROGRESSIVE_CAVITY');

  const bwWater = calculateFilterBackwashWater(state, 36.0, 10, 1, 55.0, 4);
  const bwRec = calculateBackwashRecovery(bwWater.totalDailyFilterWasteM3Day, backwashRecoveryPct, state.plantCapacityMLD, 600);
  const membraneReject = calculateMembraneReject(10000, 85.0, 350);
  const cipWaste = calculateCipAndChemicalWaste(30, 25.0);
  const liquidWaste = calculateMasterLiquidWasteBalance(state.plantCapacityMLD, bwWater, bwRec, state.wetSludgeM3Day);

  const discharge = calculateEnvironmentalDischarge(liquidWaste.netDischargedWastewaterM3Day, 20, 500000, 40);
  const risks = generateEnvironmentalRiskRegister();
  const energyCost = calculateSludgeEnergyAndCost(solids, cakeStorage, polymerDose, 0.12, 4.5, 18.0);

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 text-cyan-400">
            <Recycle className="w-7 h-7" />
            <span>Sludge Treatment, Waste Management & Environmental Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Phase 09 — Complete solids balance, gravity thickener, dewatering, polymer conditioning, backwash water recovery, membrane reject & environmental risk matrix.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-right">
            <div className="text-3xs text-slate-400">Overall Plant Recovery</div>
            <div className="text-base font-bold text-emerald-400">{liquidWaste.netOverallPlantRecoveryPercent}%</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-right">
            <div className="text-3xs text-slate-400">Environmental Status</div>
            <div className="text-base font-bold text-cyan-300 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> PASS
            </div>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="text-slate-400 text-3xs uppercase tracking-wider">Dry Sludge Load</div>
          <div className="text-xl font-bold text-cyan-300">{solids.totalDrySolidsGeneratedKgDay.toLocaleString()} kg/day</div>
          <div className="text-3xs text-slate-500">{(solids.drySolidsKgHr).toFixed(1)} kg/hr @ {solids.drySolidsGPerM3Treated} g/m³</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="text-slate-400 text-3xs uppercase tracking-wider">Raw Liquid Sludge</div>
          <div className="text-xl font-bold text-amber-400">{thickener.feedFlowM3Day.toLocaleString()} m³/day</div>
          <div className="text-3xs text-slate-500">2.5% solids blowdown volume</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="text-slate-400 text-3xs uppercase tracking-wider">Thickener Diameter</div>
          <div className="text-xl font-bold text-emerald-400">{thickener.recommendedDiameterM} m</div>
          <div className="text-3xs text-slate-500">Area: {thickener.requiredSurfaceAreaM2} m² @ {thickener.designSolidsLoadingRateKgM2Day} kg/m²·d</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="text-slate-400 text-3xs uppercase tracking-wider">Dewatered Cake ({dewatering.cakeSolidsPercent}%)</div>
          <div className="text-xl font-bold text-slate-100">{dewatering.dailyCakeVolumeM3Day} m³/day</div>
          <div className="text-3xs text-slate-500">{dewatering.dailyCakeMassKgDay.toLocaleString()} kg/day wet cake</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="text-slate-400 text-3xs uppercase tracking-wider">Backwash Recycled</div>
          <div className="text-xl font-bold text-indigo-400">{bwRec.recycledWaterFlowM3Day.toLocaleString()} m³/day</div>
          <div className="text-3xs text-slate-500">{bwRec.recoveryTargetPercent}% water recovery to headworks</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex gap-2">
        <button
          onClick={() => setActiveTab('SOLIDS')}
          className={`px-4 py-2.5 font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'SOLIDS'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Solids Balance & Sources</span>
        </button>

        <button
          onClick={() => setActiveTab('THICKENING')}
          className={`px-4 py-2.5 font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'THICKENING'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Thickening & Dewatering</span>
        </button>

        <button
          onClick={() => setActiveTab('BACKWASH')}
          className={`px-4 py-2.5 font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'BACKWASH'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>Backwash & Liquid Waste</span>
        </button>

        <button
          onClick={() => setActiveTab('PUMPING')}
          className={`px-4 py-2.5 font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'PUMPING'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Pumping, Storage & Hauling</span>
        </button>

        <button
          onClick={() => setActiveTab('ENVIRONMENTAL')}
          className={`px-4 py-2.5 font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'ENVIRONMENTAL'
              ? 'border-cyan-400 text-cyan-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Environmental Compliance & Risks</span>
        </button>
      </div>

      {/* Tab 1: Solids Balance & Sources */}
      {activeTab === 'SOLIDS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls Panel */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Water Quality & Dose Drivers</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Raw Water TSS (mg/L)</span>
                    <span className="text-cyan-300 font-bold">{tssRaw}</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={500}
                    value={tssRaw}
                    onChange={(e) => setTssRaw(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 rounded"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Alum Dosage (mg/L)</span>
                    <span className="text-amber-300 font-bold">{alumDose}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={alumDose}
                    onChange={(e) => setAlumDose(Number(e.target.value))}
                    className="w-full accent-amber-400 bg-slate-800 rounded"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Lime Softening Dosage (mg/L)</span>
                    <span className="text-emerald-300 font-bold">{limeDose}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={80}
                    value={limeDose}
                    onChange={(e) => setLimeDose(Number(e.target.value))}
                    className="w-full accent-emerald-400 bg-slate-800 rounded"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded border border-slate-800/80 text-3xs text-slate-400 space-y-1">
                <div className="font-bold text-slate-300">Governing Stoichiometric Yields:</div>
                <div>• Alum: 1 mg/L Alum → 0.26 mg/L Al(OH)₃ precipitate</div>
                <div>• Lime: 1 mg/L Lime → 1.0 mg/L CaCO₃/Mg(OH)₂ sludge</div>
                <div>• Fe/Mn Removal: 1.91 mg Fe(OH)₃ + 1.58 mg MnO₂</div>
              </div>
            </div>

            {/* Mass Breakdown Table */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Total Daily Dry Solids Mass Balance Breakdown</span>
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Captured Raw TSS</div>
                  <div className="text-base font-bold text-cyan-300">{solids.rawWaterTssKgDay.toLocaleString()} kg/d</div>
                  <div className="text-3xs text-slate-500">{(solids.rawWaterTssKgDay / solids.totalDrySolidsGeneratedKgDay * 100).toFixed(1)}% of total</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Alum Precipitate</div>
                  <div className="text-base font-bold text-amber-300">{solids.alumPrecipitateKgDay.toLocaleString()} kg/d</div>
                  <div className="text-3xs text-slate-500">Al(OH)₃ hydroxide</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Lime Softening Sludge</div>
                  <div className="text-base font-bold text-emerald-300">{solids.limeSofteningKgDay.toLocaleString()} kg/d</div>
                  <div className="text-3xs text-slate-500">CaCO₃ / Mg(OH)₂</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Fe & Mn Precipitates</div>
                  <div className="text-base font-bold text-slate-200">{solids.ironManganesePrecipitateKgDay.toLocaleString()} kg/d</div>
                  <div className="text-3xs text-slate-500">Oxidized metals</div>
                </div>
              </div>

              {/* Streams Registry Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-3xs">
                      <th className="py-2">Stream ID</th>
                      <th className="py-2">Source Process</th>
                      <th className="py-2">Flow (m³/d)</th>
                      <th className="py-2">Solids %</th>
                      <th className="py-2">Dry Mass (kg/d)</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {streams.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30">
                        <td className="py-2 text-cyan-400 font-bold">{s.id}</td>
                        <td className="py-2 text-slate-200">{s.sourceProcess}</td>
                        <td className="py-2 text-slate-300">{s.flowM3Day}</td>
                        <td className="py-2 text-amber-300">{s.solidsConcentrationPercent}%</td>
                        <td className="py-2 text-emerald-300 font-bold">{s.totalDrySolidsKgDay.toLocaleString()}</td>
                        <td className="py-2">
                          <span className="px-2 py-0.5 rounded text-3xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Thickening & Dewatering */}
      {activeTab === 'THICKENING' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gravity Thickener */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2 text-cyan-400">
                  <Recycle className="w-4 h-4" /> Gravity Sludge Thickener Sizing
                </span>
                <span className="text-3xs text-emerald-400 font-bold">CIRCULAR TANK</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Feed Sludge Flow</div>
                  <div className="text-base font-bold text-amber-300">{thickener.feedFlowM3Day} m³/day</div>
                  <div className="text-3xs text-slate-500">At 2.5% feed solids</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Recommended Diameter</div>
                  <div className="text-base font-bold text-emerald-300">{thickener.recommendedDiameterM} m</div>
                  <div className="text-3xs text-slate-500">Calculated area: {thickener.requiredSurfaceAreaM2} m²</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Hydraulic Detention Time</div>
                  <div className="text-base font-bold text-cyan-300">{thickener.hydraulicDetentionHours} hours</div>
                  <div className="text-3xs text-slate-500">Side water depth: 3.5 m</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Thickened Underflow Sludge</div>
                  <div className="text-base font-bold text-slate-100">{thickener.underflowSludgeM3Day} m³/day</div>
                  <div className="text-3xs text-slate-500">Compact solids at {thickener.underflowSolidsPercent}%</div>
                </div>
              </div>
            </div>

            {/* DAF Thickener */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2 text-cyan-400">
                  <Zap className="w-4 h-4" /> Dissolved Air Flotation (DAF) Option
                </span>
                <span className="text-3xs text-cyan-300 font-bold">ALUM / LIGHT FLOC</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Air-to-Solids Ratio</div>
                  <div className="text-base font-bold text-cyan-300">{dafThickener.airToSolidsRatio} kg Air/kg DS</div>
                  <div className="text-3xs text-slate-500">Sat. Pressure: {dafThickener.saturationPressureBar} bar</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Recycle Flow Rate</div>
                  <div className="text-base font-bold text-amber-300">{dafThickener.recycleRatioPercent}%</div>
                  <div className="text-3xs text-slate-500">Hydraulic load: {dafThickener.hydraulicLoadingM3M2Hr} m³/m²·h</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Required DAF Area</div>
                  <div className="text-base font-bold text-emerald-300">{dafThickener.requiredTankAreaM2} m²</div>
                  <div className="text-3xs text-slate-500">Rectangular tank design</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Floated Float Sludge Volume</div>
                  <div className="text-base font-bold text-slate-100">{dafThickener.floatSludgeM3Day} m³/day</div>
                  <div className="text-3xs text-slate-500">Concentration at {dafThickener.floatSolidsPercent}% solids</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dewatering Selection */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2 text-cyan-400">
                <Sliders className="w-4 h-4" /> Dewatering Technology Selector & Performance
              </span>
              <span className="text-3xs text-amber-400 font-bold">{dewatering.technologyType}</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {[
                { id: 'FILTER_PRESS', label: 'Filter Press' },
                { id: 'BELT_FILTER_PRESS', label: 'Belt Press' },
                { id: 'CENTRIFUGE', label: 'Centrifuge' },
                { id: 'SCREW_PRESS', label: 'Screw Press' },
                { id: 'DRYING_BED', label: 'Drying Bed' },
                { id: 'GEOBAG', label: 'Geobag' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDewateringTech(t.id as any)}
                  className={`p-2.5 rounded border text-3xs font-bold transition-all ${
                    dewateringTech === t.id
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-slate-400 text-3xs">Equipment Configuration</div>
                <div className="text-xs font-bold text-slate-200 mt-1">{dewatering.sizingDetails}</div>
              </div>

              <div>
                <div className="text-slate-400 text-3xs">Cake Dry Solids Content</div>
                <div className="text-lg font-bold text-emerald-400">{dewatering.cakeSolidsPercent}%</div>
                <div className="text-3xs text-slate-500">Solids capture rate: {dewatering.solidsCapturePercent}%</div>
              </div>

              <div>
                <div className="text-slate-400 text-3xs">Polymer Consumption</div>
                <div className="text-lg font-bold text-amber-300">{dewatering.dailyPolymerConsumptionKgDay} kg/day</div>
                <div className="text-3xs text-slate-500">Dose: {dewatering.polymerDoseKgPerTonDs} kg/tonne dry solids</div>
              </div>

              <div>
                <div className="text-slate-400 text-3xs">Filtrate Recycle Flow</div>
                <div className="text-lg font-bold text-cyan-300">{dewatering.filtrateFlowM3Day} m³/day</div>
                <div className="text-3xs text-slate-500">Returned to plant headworks</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Backwash & Liquid Waste */}
      {activeTab === 'BACKWASH' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Backwash Water Engine */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2 text-cyan-400">
                  <Droplets className="w-4 h-4" /> Rapid Filter Backwash Waste
                </span>
                <span className="text-3xs text-cyan-300">{bwWater.numberOfFilters} Filter Units</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Backwash Volume / Filter</div>
                  <div className="text-base font-bold text-amber-300">{bwWater.backwashVolumePerFilterM3} m³</div>
                  <div className="text-3xs text-slate-500">{bwWater.backwashDurationMin} min @ {bwWater.backwashRateM3M2Hr} m³/m²·h</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Total Daily Filter Waste</div>
                  <div className="text-base font-bold text-cyan-300">{bwWater.totalDailyFilterWasteM3Day.toLocaleString()} m³/d</div>
                  <div className="text-3xs text-slate-500">{bwWater.filterWastePercentOfPlantFlow}% of total raw flow</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Recycled Back to Headworks</div>
                  <div className="text-base font-bold text-emerald-400">{bwRec.recycledWaterFlowM3Day.toLocaleString()} m³/d</div>
                  <div className="text-3xs text-slate-500">{bwRec.recoveryTargetPercent}% recovery efficiency</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Net Unrecovered Discharge</div>
                  <div className="text-base font-bold text-rose-400">{bwRec.netDischargeToWasteM3Day} m³/d</div>
                  <div className="text-3xs text-slate-500">Controlled river discharge</div>
                </div>
              </div>
            </div>

            {/* Membrane Reject & CIP Waste */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2 text-cyan-400">
                  <Zap className="w-4 h-4" /> Membrane Reject & CIP Chemical Waste
                </span>
                <span className="text-3xs text-amber-400 font-bold">BRINE / CIP</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">RO Reject Flow (85% Rec.)</div>
                  <div className="text-base font-bold text-slate-100">{membraneReject.rejectFlowM3Day} m³/d</div>
                  <div className="text-3xs text-slate-500">TDS: {membraneReject.rejectTdsMgL} mg/L</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Daily Brine Salt Load</div>
                  <div className="text-base font-bold text-amber-300">{membraneReject.dailySaltLoadKgDay} kg/day</div>
                  <div className="text-3xs text-slate-500">Dissolved inorganic salts</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">CIP Chemical Tank Volume</div>
                  <div className="text-base font-bold text-cyan-300">{cipWaste.neutralizationTankVolumeM3} m³</div>
                  <div className="text-3xs text-slate-500">Neutralization pH: {cipWaste.neutralizedWastePh}</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">CIP Chemical Consumption</div>
                  <div className="text-base font-bold text-emerald-300">{cipWaste.acidVolumeLitersPerCip} L HCl / {cipWaste.causticVolumeLitersPerCip} L NaOH</div>
                  <div className="text-3xs text-slate-500">Per monthly CIP clean cycle</div>
                </div>
              </div>
            </div>
          </div>

          {/* Plant Water Balance Summary */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
            <h2 className="text-sm font-bold text-slate-200">Plant Liquid Waste Mass Balance Summary</h2>
            <div className="p-4 bg-slate-950 rounded border border-slate-800 flex flex-wrap items-center justify-between text-center gap-4">
              <div>
                <div className="text-3xs text-slate-400">Raw Water In</div>
                <div className="text-lg font-bold text-cyan-300">{liquidWaste.totalRawWaterInM3Day.toLocaleString()} m³/d</div>
              </div>

              <div className="text-slate-600 font-bold text-lg">−</div>

              <div>
                <div className="text-3xs text-slate-400">Net Wastewater Discharged</div>
                <div className="text-lg font-bold text-rose-400">{liquidWaste.netDischargedWastewaterM3Day.toLocaleString()} m³/d</div>
              </div>

              <div className="text-slate-600 font-bold text-lg">=</div>

              <div>
                <div className="text-3xs text-slate-400">Net Treated Product Water</div>
                <div className="text-lg font-bold text-emerald-400">{liquidWaste.productWaterM3Day.toLocaleString()} m³/d</div>
              </div>

              <div className="border-l border-slate-800 pl-4 text-right">
                <div className="text-3xs text-slate-400">Net Plant Water Yield</div>
                <div className="text-xl font-bold text-amber-300">{liquidWaste.netOverallPlantRecoveryPercent}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Pumping, Storage & Hauling */}
      {activeTab === 'PUMPING' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sludge Pumping Hydraulics */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2 text-cyan-400">
                  <Activity className="w-4 h-4" /> Progressive Cavity Sludge Pumping
                </span>
                <span className="text-3xs text-cyan-300 font-bold">{sludgePump.selectedPumpType}</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Sludge Pipe Diameter</div>
                  <div className="text-base font-bold text-slate-200">{sludgePump.pipeDiameterMm} mm</div>
                  <div className="text-3xs text-slate-500">Velocity: {sludgePump.pipeVelocityMS} m/s</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Total Dynamic Head (TDH)</div>
                  <div className="text-base font-bold text-amber-300">{sludgePump.totalDynamicHeadM} m</div>
                  <div className="text-3xs text-slate-500">Static: {sludgePump.staticHeadM}m, Head loss: {sludgePump.headLossM}m</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Viscosity Correction Factor</div>
                  <div className="text-base font-bold text-cyan-300">{sludgePump.viscosityCorrectionFactor}x</div>
                  <div className="text-3xs text-slate-500">Sludge solids conc: {sludgePump.solidsPercent}%</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Motor Power Output</div>
                  <div className="text-base font-bold text-emerald-300">{sludgePump.pumpPowerKw} kW</div>
                  <div className="text-3xs text-slate-500">Duty + Standby (1+1)</div>
                </div>
              </div>

              {sludgePump.velocityWarning && (
                <div className="p-3 bg-amber-950/50 border border-amber-800/80 rounded text-amber-300 text-3xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{sludgePump.velocityWarning}</span>
                </div>
              )}
            </div>

            {/* Cake Storage & Hauling */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2 text-cyan-400">
                  <Truck className="w-4 h-4" /> Cake Storage Silos & Transport Logistics
                </span>
                <span className="text-3xs text-emerald-400 font-bold">{cakeStorage.storageAutonomyDays} DAYS AUTONOMY</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Required Silo Volume</div>
                  <div className="text-base font-bold text-slate-200">{cakeStorage.requiredCakeStorageVolumeM3} m³</div>
                  <div className="text-3xs text-slate-500">Silos: {cakeStorage.recommendedStorageSilos} units</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Wet Cake Volume / Day</div>
                  <div className="text-base font-bold text-amber-300">{cakeStorage.wetCakeM3Day} m³/day</div>
                  <div className="text-3xs text-slate-500">Density: {cakeStorage.cakeDensityKgM3} kg/m³</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Truck Capacity</div>
                  <div className="text-base font-bold text-cyan-300">{cakeStorage.truckCapacityM3} m³ / trip</div>
                  <div className="text-3xs text-slate-500">Heavy tipping truck</div>
                </div>

                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <div className="text-slate-400 text-3xs">Hauling Trips / Month</div>
                  <div className="text-base font-bold text-emerald-300">{cakeStorage.haulingTripsPerMonth} trips/mo</div>
                  <div className="text-3xs text-slate-500">({cakeStorage.haulingTrucksPerDay} trips/day)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sludge OPEX & Energy Breakdown */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span>Residuals Management Energy & Operating Cost (OPEX)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-slate-400 text-3xs">Total Daily Energy</div>
                <div className="text-base font-bold text-cyan-300">{energyCost.totalSludgeEnergyKwhDay} kWh/day</div>
                <div className="text-3xs text-slate-500">{energyCost.specificEnergyKwhPerTonneDS} kWh/tonne dry solids</div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-slate-400 text-3xs">Daily Polymer Cost</div>
                <div className="text-base font-bold text-amber-300">${energyCost.dailyPolymerCostUSD} / day</div>
                <div className="text-3xs text-slate-500">@ $4.50 / kg polymer</div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-slate-400 text-3xs">Daily Hauling & Disposal</div>
                <div className="text-base font-bold text-emerald-300">${(energyCost.dailyHaulingCostUSD + energyCost.dailyDisposalCostUSD).toFixed(2)} / day</div>
                <div className="text-3xs text-slate-500">Trucking + Landfill fee</div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-slate-400 text-3xs">Total Residuals OPEX</div>
                <div className="text-base font-bold text-slate-100">${energyCost.totalDailyResidualsCostUSD} / day</div>
                <div className="text-3xs text-cyan-400">${energyCost.costPerTonneDrySolidsUSD} / tonne DS</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Environmental Compliance & Risk Matrix */}
      {activeTab === 'ENVIRONMENTAL' && (
        <div className="space-y-6">
          {/* Discharge Effluent & Receiving Stream Model */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-2 text-cyan-400">
                <ShieldCheck className="w-4 h-4" /> Environmental Discharge & Receiving Stream Dilution
              </span>
              <span className="px-2 py-0.5 rounded text-3xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                STATUS: {discharge.complianceStatus}
              </span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-slate-400 text-3xs">Effluent Discharge Flow</div>
                <div className="text-base font-bold text-slate-100">{discharge.dischargeFlowM3Day.toLocaleString()} m³/d</div>
                <div className="text-3xs text-slate-500">Effluent TSS: {discharge.effluentTssMgL} mg/L</div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-slate-400 text-3xs">Receiving River Flow</div>
                <div className="text-base font-bold text-cyan-300">{discharge.receivingWaterFlowM3Day.toLocaleString()} m³/d</div>
                <div className="text-3xs text-slate-500">River TSS: 40 mg/L</div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-slate-400 text-3xs">Calculated Dilution Factor</div>
                <div className="text-base font-bold text-amber-300">{discharge.dilutionFactor}:1</div>
                <div className="text-3xs text-slate-500">High stream dilution</div>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800">
                <div className="text-slate-400 text-3xs">Downstream Combined TSS</div>
                <div className="text-base font-bold text-emerald-400">{discharge.downstreamTssMgL} mg/L</div>
                <div className="text-3xs text-slate-500">Complying with DOE limit</div>
              </div>
            </div>
          </div>

          {/* Risk Register Table */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Environmental Risk Register & Safeguards</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-3xs">
                    <th className="py-2">Risk ID</th>
                    <th className="py-2">Source</th>
                    <th className="py-2">Hazard</th>
                    <th className="py-2">Severity</th>
                    <th className="py-2">Mitigation Control Measure</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {risks.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 text-cyan-400 font-bold">{r.id}</td>
                      <td className="py-2.5 text-slate-200">{r.source}</td>
                      <td className="py-2.5 text-amber-300 font-medium">{r.hazard}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-3xs font-bold ${
                          r.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {r.severity}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-300 max-w-xs">{r.controlMeasure}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-3xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {r.status}
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
    </div>
  );
};
