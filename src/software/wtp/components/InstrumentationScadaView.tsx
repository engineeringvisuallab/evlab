import React, { useState, useEffect } from 'react';
import { Radio, Play, Pause, RotateCcw, Activity, ShieldCheck, Cpu, Sliders, AlertTriangle, Layers, Zap, Server } from 'lucide-react';
import { CalculatedWtpState } from '../core/dependencyEngine';
import { generateMasterEquipmentRegister } from '../core/equipmentEngine';
import { generateMasterInstrumentIndex, calculateControlValveSizing, calculateInstrumentAirRequirement } from '../core/instrumentationEngine';
import { calculatePlcIoCounts, generatePlcIoList, generateDefaultInterlocks, getFilterBackwashSequence } from '../core/plcEngine';
import { buildScadaTagDatabase, generateActiveAlarms, calculateEnergyMonitoring, getIndustrialNetworkArchitecture } from '../core/scadaEngine';

interface ScadaProps {
  state: CalculatedWtpState;
}

export const InstrumentationScadaView: React.FC<ScadaProps> = ({ state }) => {
  const [activeTab, setActiveTab] = useState<'SCADA_ROOM' | 'INSTRUMENTS' | 'PLC_IO' | 'BACKWASH_SEQ' | 'ENERGY'>('SCADA_ROOM');

  // Live simulation state
  const [isRunning, setIsRunning] = useState(true);
  const [turbidityIn, setTurbidityIn] = useState(124.5);
  const [turbidityOut, setTurbidityOut] = useState(0.18);
  const [phVal, setPhVal] = useState(7.12);
  const [activePump, setActivePump] = useState<'A' | 'B'>('A');

  // Backwash Sequence player state
  const [currentBwStepIndex, setCurrentBwStepIndex] = useState(0);
  const [bwProgress, setBwProgress] = useState(0);

  const equipment = generateMasterEquipmentRegister(state);
  const instruments = generateMasterInstrumentIndex(state);
  const plcIoCounts = calculatePlcIoCounts(equipment, instruments, 20);
  const plcIoSchedule = generatePlcIoList(equipment, instruments);
  const interlocks = generateDefaultInterlocks();
  const bwSteps = getFilterBackwashSequence();
  const activeAlarms = generateActiveAlarms();
  const energyMetrics = calculateEnergyMonitoring(state);
  const networkTopology = getIndustrialNetworkArchitecture();
  const controlValve = calculateControlValveSizing(state.flowM3hr || 2083.3);

  // Live telemetry oscillation effect
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTurbidityIn(prev => +(prev + (Math.random() * 2 - 1)).toFixed(2));
      setTurbidityOut(prev => +(0.15 + Math.random() * 0.08).toFixed(2));
      setPhVal(prev => +(7.10 + Math.random() * 0.05).toFixed(2));
    }, 2000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Backwash sequence auto-timer
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setBwProgress(prev => {
        if (prev >= 100) {
          setCurrentBwStepIndex(stepIdx => (stepIdx + 1) % bwSteps.length);
          return 0;
        }
        return prev + 10;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, bwSteps.length]);

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-cyan-400" />
            <span>Instrumentation, Control, PLC & SCADA Engine</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time SCADA telemetry, instrument index, PLC I/O mapping, automated filter backwash state machine & energy dashboard.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('SCADA_ROOM')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'SCADA_ROOM' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Live Control Room
          </button>
          <button
            onClick={() => setActiveTab('INSTRUMENTS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'INSTRUMENTS' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Instrument Index ({instruments.length})
          </button>
          <button
            onClick={() => setActiveTab('PLC_IO')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'PLC_IO' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            PLC I/O & Interlocks
          </button>
          <button
            onClick={() => setActiveTab('BACKWASH_SEQ')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'BACKWASH_SEQ' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Filter Backwash Sequence
          </button>
          <button
            onClick={() => setActiveTab('ENERGY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeTab === 'ENERGY' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            Energy & Networks
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE SCADA CONTROL ROOM */}
      {activeTab === 'SCADA_ROOM' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-bold text-slate-100 uppercase tracking-wider">LIVE SCADA CONTROL ROOM • MAIN PLANT OVERVIEW</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 text-3xs transition ${
                    isRunning ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isRunning ? 'Pause Telemetry' : 'Resume Telemetry'}</span>
                </button>
                <span className="text-3xs text-slate-400 font-mono">PLC-01 CONTROLLER • ONLINE</span>
              </div>
            </div>

            {/* Telemetry Display Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 text-3xs">RAW INLET TURBIDITY (AIT-TURB-101)</div>
                <div className="text-2xl font-bold text-cyan-300">{turbidityIn} NTU</div>
                <div className="text-3xs text-emerald-400 font-bold">● OPERATING NORMAL</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 text-3xs">TREATED WATER TURBIDITY (AIT-TURB-401)</div>
                <div className="text-2xl font-bold text-emerald-400">{turbidityOut} NTU</div>
                <div className="text-3xs text-emerald-400 font-bold">● COMPLIES WHO &lt; 0.5 NTU</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 text-3xs">TREATED WATER pH (AIT-PH-102)</div>
                <div className="text-2xl font-bold text-amber-300">{phVal}</div>
                <div className="text-3xs text-emerald-400 font-bold">● OPTIMAL TARGET pH</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 text-3xs">HIGH LIFT DUTY PUMP ROTATION</div>
                <div className="text-lg font-bold text-slate-100">PUMP {activePump} DUTY</div>
                <button
                  onClick={() => setActivePump(activePump === 'A' ? 'B' : 'A')}
                  className="mt-1 text-3xs bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-1 rounded hover:bg-cyan-900"
                >
                  Rotate Duty Pump →
                </button>
              </div>
            </div>
          </div>

          {/* Active Alarm Ticker */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Active SCADA Alarms & Event Historian</span>
            </h2>

            <div className="space-y-3">
              {activeAlarms.map((alm) => (
                <div key={alm.id} className="p-4 bg-slate-950 border border-rose-900/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold text-3xs">
                        {alm.priority} ALARM
                      </span>
                      <span className="font-bold text-amber-300 text-xs">{alm.tag}</span>
                      <span className="text-slate-400 text-3xs">{alm.timestamp}</span>
                    </div>
                    <div className="text-slate-200 font-semibold">{alm.description}</div>
                    <div className="text-3xs text-slate-400">
                      Cause: <span className="text-slate-300">{alm.cause}</span> | Action: <span className="text-cyan-300 font-bold">{alm.recommendedAction}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-rose-400">{alm.currentValue}</div>
                    <div className="text-3xs text-slate-500">Limit: {alm.limitValue}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INSTRUMENT INDEX */}
      {activeTab === 'INSTRUMENTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-cyan-400 flex items-center gap-2">
              <Radio className="w-5 h-5" />
              <span>Master Instrument Index & Datasheets</span>
            </h2>
            <span className="text-3xs text-slate-400">ISA 5.1 Standard Tagging</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-3xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                  <th className="py-2.5 px-3">Tag</th>
                  <th className="py-2.5 px-3">Service & Description</th>
                  <th className="py-2.5 px-3">Measurement Type</th>
                  <th className="py-2.5 px-3 text-right">Normal Range</th>
                  <th className="py-2.5 px-3 text-center">Output Signal</th>
                  <th className="py-2.5 px-3 text-center">IP Rating</th>
                  <th className="py-2.5 px-3">Manufacturer & Model</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {instruments.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-bold text-cyan-300">{inst.tag}</td>
                    <td className="py-2.5 px-3 font-semibold">{inst.service}</td>
                    <td className="py-2.5 px-3 text-slate-400">{inst.measurementType}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-300">
                      {inst.rangeNormal} {inst.unit}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 font-bold text-slate-300">
                        {inst.outputSignal}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-400">{inst.ipRating}</td>
                    <td className="py-2.5 px-3 text-slate-400">{inst.manufacturer} {inst.model}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PLC I/O & INTERLOCKS */}
      {activeTab === 'PLC_IO' && (
        <div className="space-y-6">
          {/* I/O Channel Counts */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <div className="text-slate-400 uppercase text-3xs font-semibold">DIGITAL INPUTS (DI)</div>
              <div className="text-3xl font-bold text-cyan-300">{plcIoCounts.digitalInputsDI} Channels</div>
              <div className="text-3xs text-slate-500">{plcIoCounts.recommendedDiModules} x 32-Ch Modules</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <div className="text-slate-400 uppercase text-3xs font-semibold">DIGITAL OUTPUTS (DO)</div>
              <div className="text-3xl font-bold text-amber-400">{plcIoCounts.digitalOutputsDO} Channels</div>
              <div className="text-3xs text-slate-500">{plcIoCounts.recommendedDoModules} x 16-Ch Modules</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <div className="text-slate-400 uppercase text-3xs font-semibold">ANALOG INPUTS (AI)</div>
              <div className="text-3xl font-bold text-emerald-400">{plcIoCounts.analogInputsAI} Channels</div>
              <div className="text-3xs text-slate-500">{plcIoCounts.recommendedAiModules} x 8-Ch Modules</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
              <div className="text-slate-400 uppercase text-3xs font-semibold">RESERVED SPARE MARGIN</div>
              <div className="text-3xl font-bold text-purple-300">{plcIoCounts.spareMarginPercent} %</div>
              <div className="text-3xs text-emerald-400 font-bold">ISA-88 Compliant</div>
            </div>
          </div>

          {/* Interlocks */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              <span>Plant Interlock Logic & Permissive Matrix</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interlocks.map((rule) => (
                <div key={rule.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 text-xs">{rule.id}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold text-3xs">
                      {rule.action}
                    </span>
                  </div>
                  <div className="text-slate-200 font-semibold">{rule.description}</div>
                  <div className="text-3xs text-slate-400">
                    Condition Signal: <span className="text-cyan-300 font-bold">{rule.conditionSignalTag}</span> ({rule.conditionType} {rule.thresholdValue})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FILTER BACKWASH SEQUENCE */}
      {activeTab === 'BACKWASH_SEQ' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-cyan-400 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <span>Rapid Gravity Filter Automated Backwash Sequence State Machine</span>
            </h2>
            <span className="text-3xs text-slate-400 font-bold">ACTIVE STEP {currentBwStepIndex + 1} OF {bwSteps.length}</span>
          </div>

          {/* Sequence Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-3xs font-bold text-slate-300">
              <span>{bwSteps[currentBwStepIndex].stepName}</span>
              <span>Step Progress: {bwProgress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-cyan-500 h-full transition-all duration-300"
                style={{ width: `${bwProgress}%` }}
              />
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {bwSteps.map((step, idx) => {
              const isActive = idx === currentBwStepIndex;
              return (
                <div
                  key={step.stepNumber}
                  className={`p-3.5 rounded-xl border space-y-2 transition ${
                    isActive
                      ? 'bg-cyan-950/80 border-cyan-500 shadow-lg scale-105'
                      : 'bg-slate-950 border-slate-800 opacity-70'
                  }`}
                >
                  <div className="text-3xs font-bold text-amber-400">STEP 0{step.stepNumber}</div>
                  <div className="font-bold text-slate-100 text-xs">{step.stepName}</div>
                  <div className="text-3xs text-cyan-300 font-bold">{step.durationSeconds} Seconds</div>
                  <div className="text-3xs text-slate-400 line-clamp-3">{step.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: ENERGY & NETWORKS */}
      {activeTab === 'ENERGY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Energy Metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Plant Electrical Energy & Performance Dashboard</span>
            </h2>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Instantaneous Power Demand:</span>
                <span className="font-bold text-slate-100">{energyMetrics.instantaneousPowerKw} kW</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Daily Electricity Consumption:</span>
                <span className="font-bold text-amber-400">{energyMetrics.dailyEnergyKwh.toLocaleString()} kWh/day</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Specific Power Consumption:</span>
                <span className="font-bold text-emerald-300">{energyMetrics.specificEnergyKwhM3} kWh/m³</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Daily Power Bill Cost:</span>
                <span className="font-bold text-cyan-300">${energyMetrics.energyCostTodayUSD.toLocaleString()} / day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Overall Plant Efficiency:</span>
                <span className="font-bold text-purple-300">{energyMetrics.plantEfficiencyPercent} %</span>
              </div>
            </div>
          </div>

          {/* Industrial Network Architecture */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-cyan-400 flex items-center gap-2">
              <Server className="w-5 h-5" />
              <span>Industrial Ethernet Network Topology</span>
            </h2>

            <div className="space-y-3">
              {networkTopology.map((dev) => (
                <div key={dev.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-3xs">
                  <div>
                    <div className="font-bold text-slate-100">{dev.deviceName}</div>
                    <div className="text-slate-400 font-mono">IP: {dev.ipAddress} • Protocol: {dev.protocol}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                    {dev.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
