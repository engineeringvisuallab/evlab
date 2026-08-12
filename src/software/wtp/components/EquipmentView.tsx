import React, { useState, useMemo } from 'react';
import { 
  HardDrive, Zap, ShieldAlert, Cpu, Layers, Activity, Search, Filter, 
  CheckCircle, AlertTriangle, XCircle, Wrench, ChevronRight, FileText, 
  Sliders, Gauge, Play, BarChart3, Settings2, Info, RefreshCw
} from 'lucide-react';
import { CalculatedWtpState } from '../core/dependencyEngine';
import { 
  MasterEquipmentItem, EquipmentCategory, 
  generateMasterEquipmentRegister, calculateN1FailureAnalysis, 
  calculateEnergySummary, calculateMotorSizing, calculateValveSizing,
  N1FailureAnalysisResult, EnergySummaryResult
} from '../core/equipmentEngine';

interface EquipmentProps {
  state: CalculatedWtpState;
}

export const EquipmentView: React.FC<EquipmentProps> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'REGISTER' | 'N1_SIMULATOR' | 'MOTOR_POWER' | 'VALVES'>('REGISTER');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEquipmentForDatasheet, setSelectedEquipmentForDatasheet] = useState<MasterEquipmentItem | null>(null);

  // N-1 Simulator State
  const [simulatedTag, setSimulatedTag] = useState<string>('PMP-RAW-01A/B/C');

  // Custom Interactive Motor Sizing Parameters
  const [customHydraulicKw, setCustomHydraulicKw] = useState<number>(45.0);
  const [customPumpEfficiency, setCustomPumpEfficiency] = useState<number>(80);
  const [customServiceFactor, setCustomServiceFactor] = useState<number>(1.15);

  // Generate Equipment Schedule from Core Engine
  const equipmentSchedule = useMemo(() => {
    return generateMasterEquipmentRegister(state);
  }, [state]);

  // Filtered Equipment List
  const filteredSchedule = useMemo(() => {
    return equipmentSchedule.filter(item => {
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.process.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [equipmentSchedule, selectedCategory, searchQuery]);

  // Calculated Energy Summary
  const energySummary: EnergySummaryResult = useMemo(() => {
    return calculateEnergySummary(equipmentSchedule);
  }, [equipmentSchedule]);

  // N-1 Failure Result for Simulated Item
  const n1Result: N1FailureAnalysisResult | null = useMemo(() => {
    const item = equipmentSchedule.find(i => i.tag === simulatedTag) || equipmentSchedule[0];
    return item ? calculateN1FailureAnalysis(item) : null;
  }, [equipmentSchedule, simulatedTag]);

  // Motor Sizing Engine Calculation Result
  const motorCalcResult = useMemo(() => {
    return calculateMotorSizing(customHydraulicKw, customPumpEfficiency, 92, customServiceFactor);
  }, [customHydraulicKw, customPumpEfficiency, customServiceFactor]);

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-950/50">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                Mechanical, Equipment & M&E Engineering Engine
                <span className="px-2 py-0.5 rounded text-3xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  PHASE 06 COMPLETE
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Connected Master Equipment Schedule • N-1 Failure Simulator • Motor Sizing • Valve Register
              </p>
            </div>
          </div>
        </div>

        {/* Executive Summary Badges */}
        <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
          <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <span className="text-3xs text-slate-400 block uppercase">Total Equipment</span>
            <span className="text-sm font-bold text-cyan-400">{equipmentSchedule.length} Items</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <span className="text-3xs text-slate-400 block uppercase">Connected Power</span>
            <span className="text-sm font-bold text-amber-400">{energySummary.totalConnectedLoadKw} kW</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <span className="text-3xs text-slate-400 block uppercase">Operating Power</span>
            <span className="text-sm font-bold text-emerald-400">{energySummary.totalOperatingLoadKw} kW</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-center">
            <span className="text-3xs text-slate-400 block uppercase">Specific Energy</span>
            <span className="text-sm font-bold text-purple-400">{energySummary.specificEnergyKwhM3} kWh/m³</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('REGISTER')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition text-xs ${
            activeTab === 'REGISTER'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Master Equipment Register ({equipmentSchedule.length})
        </button>

        <button
          onClick={() => setActiveTab('N1_SIMULATOR')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition text-xs ${
            activeTab === 'N1_SIMULATOR'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-400" />
          N-1 Failure Simulator
        </button>

        <button
          onClick={() => setActiveTab('MOTOR_POWER')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition text-xs ${
            activeTab === 'MOTOR_POWER'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          Motor Sizing & Power Analysis
        </button>

        <button
          onClick={() => setActiveTab('VALVES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition text-xs ${
            activeTab === 'VALVES'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-blue-400" />
          Valves & Actuators Schedule
        </button>
      </div>

      {/* TAB 1: MASTER EQUIPMENT REGISTER */}
      {activeTab === 'REGISTER' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search Equipment Tag, Name, Process..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
              {(['ALL', 'HYDRAULIC', 'MIXING', 'AERATION', 'CLARIFICATION', 'FILTRATION', 'CHEMICAL', 'SLUDGE', 'DISINFECTION', 'MISCELLANEOUS'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-md text-3xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Master Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950 text-slate-400 uppercase text-3xs border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Tag</th>
                    <th className="p-3.5">Equipment Description</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Process Unit</th>
                    <th className="p-3.5 text-center">Duty / Stby</th>
                    <th className="p-3.5 text-right">Unit Capacity</th>
                    <th className="p-3.5 text-right">Head / Press</th>
                    <th className="p-3.5 text-right">Motor (kW)</th>
                    <th className="p-3.5">Material</th>
                    <th className="p-3.5">Mfr & Model</th>
                    <th className="p-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSchedule.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-cyan-300 flex items-center gap-2">
                        {item.tag}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-100">{item.name}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-3xs font-semibold bg-slate-950 text-slate-300 border border-slate-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{item.process}</td>
                      <td className="p-3.5 text-center font-bold text-slate-200">
                        {item.duty}D / {item.standby}S
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-400">
                        {item.capacityPerUnit} {item.unit}
                      </td>
                      <td className="p-3.5 text-right text-slate-300">
                        {item.headM ? `${item.headM} m` : item.pressureBar ? `${item.pressureBar} bar` : '-'}
                      </td>
                      <td className="p-3.5 text-right font-bold text-amber-400">
                        {item.motorKw || item.powerKw} kW
                      </td>
                      <td className="p-3.5 text-3xs text-slate-400 max-w-[140px] truncate">
                        {item.material}
                      </td>
                      <td className="p-3.5 text-3xs text-slate-300">
                        {item.manufacturer} ({item.model})
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => setSelectedEquipmentForDatasheet(item)}
                          className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-3xs font-bold transition flex items-center gap-1 mx-auto"
                        >
                          <FileText className="w-3 h-3" />
                          Datasheet
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

      {/* TAB 2: N-1 FAILURE SIMULATOR */}
      {activeTab === 'N1_SIMULATOR' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <ShieldAlert className="w-6 h-6 text-red-400" />
              <div>
                <h2 className="text-lg font-bold text-slate-100">Single Equipment Failure (N-1) Redundancy Simulator</h2>
                <p className="text-xs text-slate-400">
                  Simulate single equipment outage and analyze real-time plant flow loss, operational impact, and capacity deficit.
                </p>
              </div>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-3xs uppercase text-slate-400 mb-2">Select Equipment Tag to Simulate Failure</label>
                <select
                  value={simulatedTag}
                  onChange={(e) => setSimulatedTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
                >
                  {equipmentSchedule.map((item) => (
                    <option key={item.id} value={item.tag}>
                      {item.tag} — {item.name} ({item.duty}D/{item.standby}S)
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Status Card */}
              {n1Result && (
                <div className={`p-4 rounded-xl border ${
                  n1Result.n1Status === 'PASS' 
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                    : 'bg-red-950/20 border-red-500/30 text-red-300'
                } flex items-center justify-between`}>
                  <div>
                    <span className="text-3xs uppercase tracking-wider block font-bold">N-1 Redundancy Status</span>
                    <span className="text-xl font-extrabold flex items-center gap-2 mt-1">
                      {n1Result.n1Status === 'PASS' ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                          VERIFIED PASS ({n1Result.capacityMarginPercent}%)
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-red-400" />
                          CRITICAL DEFICIT ({n1Result.capacityMarginPercent}%)
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xs uppercase block opacity-80">Capacity Deficit</span>
                    <span className="text-lg font-bold">{n1Result.capacityDeficit} {equipmentSchedule.find(i => i.tag === simulatedTag)?.unit || 'm³/hr'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Detailed N-1 Breakdown Metrics */}
            {n1Result && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-3xs text-slate-400 uppercase block">Total Installed Units</span>
                  <span className="text-lg font-bold text-slate-100">{n1Result.installedQuantity} Units ({n1Result.dutyQuantity} Duty + {n1Result.standbyQuantity} Standby)</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-3xs text-slate-400 uppercase block">Required Flow Capacity</span>
                  <span className="text-lg font-bold text-amber-400">{n1Result.requiredCapacity}</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-3xs text-slate-400 uppercase block">Remaining Capacity (1 Outage)</span>
                  <span className="text-lg font-bold text-cyan-400">{n1Result.remainingCapacityN1}</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-3xs text-slate-400 uppercase block">Capacity Margin</span>
                  <span className={`text-lg font-bold ${n1Result.capacityMarginPercent >= 100 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {n1Result.capacityMarginPercent}%
                  </span>
                </div>
              </div>
            )}

            {/* Impact Analysis Note */}
            {n1Result && (
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase mb-1 flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  Engineering Failure Operational Impact Analysis
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {n1Result.operationalImpactMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MOTOR SIZING & POWER */}
      {activeTab === 'MOTOR_POWER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Interactive Motor Sizing Calculator */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <Zap className="w-6 h-6 text-amber-400" />
              <div>
                <h2 className="text-lg font-bold text-slate-100">IEC Electric Motor Sizing Engine</h2>
                <p className="text-xs text-slate-400">Calculates shaft power, applies thermal margin service factor, and matches standard IEC kW motor ratings.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-3xs text-slate-400 mb-1">
                  <span>Hydraulic Power Demand (kW)</span>
                  <span className="font-bold text-amber-400">{customHydraulicKw} kW</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={250}
                  step={1}
                  value={customHydraulicKw}
                  onChange={(e) => setCustomHydraulicKw(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-3xs text-slate-400 mb-1">
                  <span>Pump Mechanical Efficiency (%)</span>
                  <span className="font-bold text-emerald-400">{customPumpEfficiency}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={90}
                  step={1}
                  value={customPumpEfficiency}
                  onChange={(e) => setCustomPumpEfficiency(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-3xs text-slate-400 mb-1">
                  <span>Motor Service Factor (SF Margin)</span>
                  <span className="font-bold text-cyan-400">{customServiceFactor} ({((customServiceFactor - 1) * 100).toFixed(0)}% Margin)</span>
                </div>
                <input
                  type="range"
                  min={1.10}
                  max={1.30}
                  step={0.01}
                  value={customServiceFactor}
                  onChange={(e) => setCustomServiceFactor(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>

            {/* Calculated Results Box */}
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Calculated Shaft Power:</span>
                <span className="font-bold text-slate-200">{motorCalcResult.shaftPowerKw} kW</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Required Motor Rating (incl. SF):</span>
                <span className="font-bold text-amber-400">{motorCalcResult.calculatedMotorKw} kW</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400 font-bold">Standard IEC Rated Motor:</span>
                <span className="font-extrabold text-cyan-300 text-base">{motorCalcResult.standardRatedMotorKw} kW</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Recommended Starter Type:</span>
                <span className="px-2 py-0.5 rounded font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  {motorCalcResult.recommendedStartingMethod}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Estimated Full Load Amps (FLA):</span>
                <span className="font-bold text-emerald-400">{motorCalcResult.estimatedFullLoadAmps} A ({motorCalcResult.voltage})</span>
              </div>
            </div>
          </div>

          {/* Plant Connected Power Breakdown */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              <div>
                <h2 className="text-lg font-bold text-slate-100">Total Plant Electrical Power Breakdown</h2>
                <p className="text-xs text-slate-400">Category breakdown of operating electrical load across treatment stages.</p>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(energySummary.categoryBreakdownKw).map(([cat, kw]) => {
                const percent = energySummary.totalOperatingLoadKw > 0 ? Number(((kw / energySummary.totalOperatingLoadKw) * 100).toFixed(1)) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-3xs">
                      <span className="text-slate-300 font-bold">{cat}</span>
                      <span className="text-slate-400">{kw} kW ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VALVES SCHEDULE */}
      {activeTab === 'VALVES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Sliders className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold text-slate-100">Process Valves & Actuators Register</h2>
              <p className="text-xs text-slate-400">Sizing, calculated velocities, nominal diameters, and control actuation modes.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950 text-slate-400 uppercase text-3xs border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Tag ID</th>
                  <th className="p-3.5">Valve Service</th>
                  <th className="p-3.5">Process Stage</th>
                  <th className="p-3.5 text-center">Nominal Size</th>
                  <th className="p-3.5 text-right">Target Velocity</th>
                  <th className="p-3.5 text-right">Calc. Velocity</th>
                  <th className="p-3.5">Actuator Type</th>
                  <th className="p-3.5 text-center">Velocity Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {equipmentSchedule.filter(i => i.connectionSizeMm && i.connectionSizeMm > 0).map((item) => {
                  const valveSize = calculateValveSizing(item.flowM3hr || 500, 2.0);
                  const isVelocityOk = valveSize.calculatedVelocityMs <= 2.5;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-cyan-300">{item.tag}</td>
                      <td className="p-3.5 font-semibold text-slate-100">{item.service}</td>
                      <td className="p-3.5 text-slate-400">{item.process}</td>
                      <td className="p-3.5 text-center font-bold text-amber-400">DN {item.connectionSizeMm || valveSize.recommendedDnMm}</td>
                      <td className="p-3.5 text-right text-slate-400">2.0 m/s</td>
                      <td className="p-3.5 text-right font-bold text-cyan-400">{valveSize.calculatedVelocityMs} m/s</td>
                      <td className="p-3.5 text-3xs text-purple-300 font-bold">{item.controlType || 'Pneumatic Actuated'}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-3xs font-bold ${
                          isVelocityOk ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                        }`}>
                          {isVelocityOk ? 'PASS (<=2.5 m/s)' : 'HIGH VELOCITY'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DATASHEET MODAL */}
      {selectedEquipmentForDatasheet && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="text-3xs uppercase font-bold text-cyan-400 block">{selectedEquipmentForDatasheet.category} EQUIPMENT DATASHEET</span>
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                  {selectedEquipmentForDatasheet.tag} — {selectedEquipmentForDatasheet.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEquipmentForDatasheet(null)}
                className="p-1.5 bg-slate-800 text-slate-400 hover:text-slate-100 rounded-lg text-xs"
              >
                ✕
              </button>
            </div>

            {/* Datasheet Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-3xs text-slate-500 uppercase block">Process Duty</span>
                <span className="font-bold text-slate-200">{selectedEquipmentForDatasheet.duty} Duty / {selectedEquipmentForDatasheet.standby} Standby</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-3xs text-slate-500 uppercase block">Design Unit Capacity</span>
                <span className="font-bold text-emerald-400">{selectedEquipmentForDatasheet.capacityPerUnit} {selectedEquipmentForDatasheet.unit}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-3xs text-slate-500 uppercase block">Motor Rating</span>
                <span className="font-bold text-amber-400">{selectedEquipmentForDatasheet.motorKw || selectedEquipmentForDatasheet.powerKw} kW ({selectedEquipmentForDatasheet.motorVoltage || '415V 3-Phase'})</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-3xs text-slate-500 uppercase block">Starting Method</span>
                <span className="font-bold text-purple-300">{selectedEquipmentForDatasheet.motorStartingMethod || 'DOL'}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-3xs text-slate-500 uppercase block">Material Construction</span>
                <span className="font-bold text-slate-200">{selectedEquipmentForDatasheet.material}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-3xs text-slate-500 uppercase block">Manufacturer & Model</span>
                <span className="font-bold text-slate-200">{selectedEquipmentForDatasheet.manufacturer} ({selectedEquipmentForDatasheet.model})</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-3xs text-slate-500 uppercase block">Maintenance Clearance</span>
                <span className="font-bold text-cyan-300">{selectedEquipmentForDatasheet.accessClearanceM || 1.5} m</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-3xs text-slate-500 uppercase block">Procurement Status</span>
                <span className="font-bold text-emerald-300">{selectedEquipmentForDatasheet.procurementStatus || 'APPROVED'}</span>
              </div>
            </div>

            {/* Interlocks list */}
            {selectedEquipmentForDatasheet.interlocks && selectedEquipmentForDatasheet.interlocks.length > 0 && (
              <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                <span className="text-3xs text-slate-400 uppercase font-bold block">SCADA & Safety Control Interlocks</span>
                <ul className="space-y-1 list-disc list-inside text-3xs text-slate-300">
                  {selectedEquipmentForDatasheet.interlocks.map((interlock, idx) => (
                    <li key={idx}>{interlock}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEquipmentForDatasheet(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-xs"
              >
                Close Datasheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
