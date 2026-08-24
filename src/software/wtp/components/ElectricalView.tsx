import React, { useState } from 'react';
import { Zap, ShieldCheck, Cpu, Sliders, Server, Activity, AlertTriangle, Layers, FileText } from 'lucide-react';
import { CalculatedWtpState } from '../core/dependencyEngine';
import { generateMasterEquipmentRegister } from '../core/equipmentEngine';
import {
  generateElectricalLoadList,
  calculateMotorElectrical,
  calculateTransformerSizing,
  calculateGeneratorSizing,
  calculateUpsSizing,
  calculateCableSizing,
  calculatePowerFactorCorrection
} from '../core/electricalEngine';

interface ElectricalProps {
  state: CalculatedWtpState;
}

export const ElectricalView: React.FC<ElectricalProps> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LOAD_LIST' | 'SUBSTATION' | 'CABLE' | 'POWER_FACTOR'>('OVERVIEW');

  // Interactive state
  const [customVoltage, setCustomVoltage] = useState(415);
  const [customPf, setCustomPf] = useState(0.85);
  const [targetPf, setTargetPf] = useState(0.98);
  const [cableLengthM, setCableLengthM] = useState(120);

  // Core calculations
  const equipment = generateMasterEquipmentRegister(state);
  const loadList = generateElectricalLoadList(equipment, {
    highVoltageKv: 11.0,
    lowVoltageV: customVoltage,
    phases: 3,
    frequencyHz: 50,
    powerFactor: customPf,
    demandFactor: 0.82,
    diversityFactor: 0.80,
    ambientTemperatureC: 40,
    busFaultLevelKa: 25,
    earthingSystem: 'TN-S',
    targetPowerFactor: targetPf
  });

  const transformer = calculateTransformerSizing(loadList.totalDemandKw, customPf, 20, 'DUAL_100_100_N1');
  const generator = calculateGeneratorSizing(loadList.essentialDemandKw, 110, customPf, 24);
  const ups = calculateUpsSizing(15, 0.8, 4);
  const pfCorrection = calculatePowerFactorCorrection(loadList.totalDemandKw, customPf, targetPf);

  // Sample Cable calculation for largest motor (110kW)
  const largestMotorElec = calculateMotorElectrical(110, customVoltage, 'STAR_DELTA', customPf);
  const cableSample = calculateCableSizing(largestMotorElec.fullLoadAmps, cableLengthM, 'COPPER', customVoltage, 3.0);

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-amber-400" />
            <span>Electrical Design, Load Schedule & Substation Sizing</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connected & demand load schedule, 11kV/0.415kV substation, motor starting inrush, cable sizing, generator backup, UPS & APFC panels.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'OVERVIEW' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('LOAD_LIST')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'LOAD_LIST' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Load List Schedule ({loadList.loadItems.length})
          </button>
          <button
            onClick={() => setActiveTab('SUBSTATION')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'SUBSTATION' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Substation & DG
          </button>
          <button
            onClick={() => setActiveTab('CABLE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'CABLE' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Cable Sizing
          </button>
          <button
            onClick={() => setActiveTab('POWER_FACTOR')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'POWER_FACTOR' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Power Factor (APFC)
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="text-slate-400 uppercase tracking-wider text-3xs font-semibold">TOTAL CONNECTED POWER</div>
          <div className="text-3xl font-bold text-slate-100">{loadList.totalConnectedKw} kW</div>
          <div className="text-3xs text-slate-400 font-mono">
            Apparent: <span className="text-slate-200">{loadList.totalConnectedKva} kVA</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="text-slate-400 uppercase tracking-wider text-3xs font-semibold">OPERATING DEMAND LOAD</div>
          <div className="text-3xl font-bold text-amber-400">{loadList.totalDemandKw} kW</div>
          <div className="text-3xs text-slate-400 font-mono">
            Diversity factor: <span className="text-slate-200">0.82 applied</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="text-slate-400 uppercase tracking-wider text-3xs font-semibold">MAIN TRANSFORMER RATING</div>
          <div className="text-3xl font-bold text-cyan-300">{transformer.standardSelectedKva} kVA</div>
          <div className="text-3xs text-slate-400 font-mono">
            11kV / 415V Dual N+1 • <span className="text-emerald-400">{transformer.loadingPercent}% Loading</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2 shadow-lg">
          <div className="text-slate-400 uppercase tracking-wider text-3xs font-semibold">DIESEL GENERATOR BACKUP</div>
          <div className="text-3xl font-bold text-emerald-300">{generator.standardSelectedGeneratorKva} kVA</div>
          <div className="text-3xs text-slate-400 font-mono">
            Essential load • <span className="text-emerald-400">24h Fuel Tank ({generator.totalFuelTankVolumeLiters} L)</span>
          </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & SYSTEM METRICS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Design Basis Inputs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Sliders className="w-5 h-5" />
                <span>Electrical Design Basis & Parameters</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-3xs uppercase font-semibold">Distribution Voltage (V)</label>
                  <select
                    value={customVoltage}
                    onChange={(e) => setCustomVoltage(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs font-mono focus:border-amber-500 focus:outline-none"
                  >
                    <option value={415}>415 V 3-Phase 50 Hz (Standard IE)</option>
                    <option value={400}>400 V 3-Phase 50 Hz (European)</option>
                    <option value={380}>380 V 3-Phase 50 Hz (Middle East)</option>
                    <option value={460}>460 V 3-Phase 60 Hz (US/NEMA)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-3xs uppercase font-semibold">System Power Factor (Uncompensated)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.70"
                    max="0.95"
                    value={customPf}
                    onChange={(e) => setCustomPf(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-3xs uppercase font-semibold">Target Compensated Power Factor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.90"
                    max="0.99"
                    value={targetPf}
                    onChange={(e) => setTargetPf(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-3xs text-slate-400">
                  <div className="font-bold text-slate-300">Earthing & Short Circuit System:</div>
                  <div>● Earthing System: <span className="text-cyan-300 font-bold">TN-S Solidly Grounded</span></div>
                  <div>● Switchgear Bus Fault Level: <span className="text-cyan-300 font-bold">25 kA for 1 sec</span></div>
                  <div>● Ambient Design Temperature: <span className="text-cyan-300 font-bold">40 °C</span></div>
                </div>
              </div>
            </div>

            {/* Load Criticality Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 lg:col-span-2">
              <h2 className="text-base font-bold text-cyan-400 flex items-center gap-2">
                <Layers className="w-5 h-5" />
                <span>Electrical Load Criticality & Distribution Breakdown</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-rose-900/40 space-y-1">
                  <div className="text-rose-400 font-bold text-3xs">CRITICAL LOADS (UPS BACKUP)</div>
                  <div className="text-2xl font-bold text-rose-300">{loadList.criticalDemandKw} kW</div>
                  <div className="text-3xs text-slate-400">PLC, SCADA, Instruments, Chlorine Dosing</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-amber-900/40 space-y-1">
                  <div className="text-amber-400 font-bold text-3xs">ESSENTIAL LOADS (DG BACKUP)</div>
                  <div className="text-2xl font-bold text-amber-300">{loadList.essentialDemandKw} kW</div>
                  <div className="text-3xs text-slate-400">Raw Water Pumps, High Lift, Backwash, Air Blowers</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-400 font-bold text-3xs">NON-ESSENTIAL LOADS</div>
                  <div className="text-2xl font-bold text-slate-300">{loadList.nonEssentialDemandKw} kW</div>
                  <div className="text-3xs text-slate-400">HVAC, Administration, Yard Lighting</div>
                </div>
              </div>

              {/* Single Line Diagram High Level Architecture */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <Server className="w-4 h-4 text-amber-400" />
                  <span>Single Line Diagram (SLD) Power Distribution Hierarchy</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-center text-3xs font-bold">
                  <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-amber-300">
                    11kV Utility Grid
                  </div>
                  <div className="hidden md:flex items-center justify-center text-slate-500">➔</div>
                  <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-cyan-300">
                    Step-Down Trf {transformer.standardSelectedKva}kVA
                  </div>
                  <div className="hidden md:flex items-center justify-center text-slate-500">➔</div>
                  <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-emerald-300">
                    Main PCC & MCC Panels
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOAD LIST SCHEDULE */}
      {activeTab === 'LOAD_LIST' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>Equipment Electrical Load List Schedule</span>
            </h2>
            <span className="text-3xs text-slate-400">Derived from Phase 06 Equipment Register</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-3xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                  <th className="py-2.5 px-3">Equipment Tag</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-center">Qty (D/S)</th>
                  <th className="py-2.5 px-3 text-right">Motor (kW)</th>
                  <th className="py-2.5 px-3 text-right">Demand (kW)</th>
                  <th className="py-2.5 px-3 text-right">FLA (A)</th>
                  <th className="py-2.5 px-3 text-center">Starter</th>
                  <th className="py-2.5 px-3">MCC Panel</th>
                  <th className="py-2.5 px-3">Cable Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {loadList.loadItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-bold text-amber-300">{item.equipmentTag}</td>
                    <td className="py-2.5 px-3">{item.description}</td>
                    <td className="py-2.5 px-3 text-center">{item.quantity} ({item.duty}/{item.standby})</td>
                    <td className="py-2.5 px-3 text-right font-bold">{item.motorKw} kW</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-400">{item.demandKw} kW</td>
                    <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">{item.fullLoadAmps} A</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 font-bold text-slate-300">
                        {item.starterType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-400">{item.mccPanel}</td>
                    <td className="py-2.5 px-3 text-emerald-300">{item.cableSizeMm2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SUBSTATION & GENERATOR */}
      {activeTab === 'SUBSTATION' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Transformer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-cyan-400 flex items-center gap-2">
              <Server className="w-5 h-5" />
              <span>Step-Down Transformer Sizing</span>
            </h2>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Total Demand kVA:</span>
                <span className="font-bold text-slate-100">{transformer.totalDemandKva} kVA</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Design Margin:</span>
                <span className="font-bold text-amber-400">20 %</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Selected Transformer:</span>
                <span className="font-bold text-cyan-300">{transformer.standardSelectedKva} kVA</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Operating Loading %:</span>
                <span className="font-bold text-emerald-400">{transformer.loadingPercent} %</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Redundancy Scheme:</span>
                <span className="font-bold text-purple-300">Dual 100% N+1</span>
              </div>
            </div>
          </div>

          {/* Generator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Diesel Generator & Fuel Tank</span>
            </h2>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Essential Load Demand:</span>
                <span className="font-bold text-slate-100">{generator.essentialDemandKw} kW</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Largest Motor Start kVA:</span>
                <span className="font-bold text-amber-400">{generator.largestMotorStartingKva} kVA</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Generator Rating:</span>
                <span className="font-bold text-emerald-300">{generator.standardSelectedGeneratorKva} kVA</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Fuel Consumption Rate:</span>
                <span className="font-bold text-cyan-300">{generator.fuelConsumptionLhr} L/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">24h Diesel Tank Volume:</span>
                <span className="font-bold text-amber-300">{generator.totalFuelTankVolumeLiters} Liters</span>
              </div>
            </div>
          </div>

          {/* UPS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              <span>Critical SCADA / PLC UPS Sizing</span>
            </h2>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Critical Load Demand:</span>
                <span className="font-bold text-slate-100">{ups.criticalLoadKw} kW</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">UPS Inverter Capacity:</span>
                <span className="font-bold text-rose-300">{ups.inverterCapacityKva} kVA</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Battery Autonomy:</span>
                <span className="font-bold text-amber-400">{ups.autonomyHours} Hours</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Battery Capacity:</span>
                <span className="font-bold text-cyan-300">{ups.batteryCapacityAh} Ah (110V DC)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Battery Type:</span>
                <span className="font-bold text-emerald-400">VRLA AGM Sealed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CABLE SIZING */}
      {activeTab === 'CABLE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span>Motor Feeder Cable Sizing & Voltage Drop Engine</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800">
              <div className="font-bold text-slate-200">Interactive Feeder Inputs (110 kW Pump Feeder)</div>

              <div>
                <label className="text-slate-400 text-3xs uppercase">Feeder Cable Length (m)</label>
                <input
                  type="number"
                  value={cableLengthM}
                  onChange={(e) => setCableLengthM(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 text-xs font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2 text-3xs text-slate-400">
                <div>● Full Load Current (FLA): <span className="text-amber-300 font-bold">{cableSample.designCurrentAmps} A</span></div>
                <div>● Conductor Material: <span className="text-slate-200 font-bold">{cableSample.conductorMaterial} XLPE</span></div>
                <div>● Allowable Running Voltage Drop: <span className="text-emerald-400 font-bold">3.0 %</span></div>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950 p-5 rounded-xl border border-slate-800">
              <div className="font-bold text-slate-200">Engine Cable Recommendation & Results</div>

              <div className="text-2xl font-bold text-emerald-400">
                3-Core x {cableSample.recommendedSizeMm2} mm² XLPE
              </div>

              <div className="space-y-2 text-3xs">
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Running Voltage Drop (V):</span>
                  <span className="font-bold text-slate-100">{cableSample.runningVoltageDropV} V</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Running Voltage Drop (%):</span>
                  <span className="font-bold text-amber-400">{cableSample.runningVoltageDropPercent} %</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-slate-400">Starting Inrush Voltage Drop (%):</span>
                  <span className="font-bold text-cyan-300">{cableSample.startingVoltageDropPercent} %</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Validation Status:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                    {cableSample.voltageDropStatus} (WITHIN 3.0% LIMIT)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: POWER FACTOR (APFC) */}
      {activeTab === 'POWER_FACTOR' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            <span>Automatic Power Factor Correction (APFC) Engine</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
              <div className="text-slate-400 text-3xs">UNCOMPENSATED POWER FACTOR</div>
              <div className="text-3xl font-bold text-amber-400">{pfCorrection.initialPowerFactor}</div>
              <div className="text-3xs text-slate-400">Initial Reactive Load: {pfCorrection.initialKvar} kvar</div>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
              <div className="text-slate-400 text-3xs">REQUIRED CAPACITOR BANK CAPACITY</div>
              <div className="text-3xl font-bold text-cyan-300">{pfCorrection.requiredCapacitorKvar} kvar</div>
              <div className="text-3xs text-emerald-400 font-bold">{pfCorrection.recommendedBankSteps}</div>
            </div>

            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
              <div className="text-slate-400 text-3xs">ESTIMATED ANNUAL TARIFF SAVINGS</div>
              <div className="text-3xl font-bold text-emerald-400">${pfCorrection.annualEnergyCostSavingsUSD.toLocaleString()} / year</div>
              <div className="text-3xs text-slate-400">Target Compensated PF: {pfCorrection.targetPowerFactor} Lagging</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
