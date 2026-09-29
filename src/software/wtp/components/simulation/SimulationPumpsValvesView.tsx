import React, { useState } from 'react';
import { PumpSimulationObject, ValveSimulationObject } from '../../core/simulationStateEngine';
import { Gauge, Zap, Power, AlertTriangle, CheckCircle2, Sliders, Play, RotateCcw, ShieldCheck, Activity, Layers } from 'lucide-react';

interface SimulationPumpsValvesViewProps {
  pumps: PumpSimulationObject[];
  valves: ValveSimulationObject[];
  onUpdatePump: (pumpId: string, updates: Partial<PumpSimulationObject>) => void;
  onUpdateValve: (valveId: string, updates: Partial<ValveSimulationObject>) => void;
  onOpenFormulaInspector: (paramId: string) => void;
}

export const SimulationPumpsValvesView: React.FC<SimulationPumpsValvesViewProps> = ({
  pumps,
  valves,
  onUpdatePump,
  onUpdateValve,
  onOpenFormulaInspector
}) => {
  const [selectedPumpId, setSelectedPumpId] = useState<string>(pumps[0]?.id || 'RAW_PUMP-01');
  const selectedPump = pumps.find(p => p.id === selectedPumpId) || pumps[0];

  return (
    <div className="space-y-6">
      {/* 1. Master Pump Dynamic Station */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Dynamic Pump Stations & Operating Point Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Affinity laws, speed control, dynamic Q-H system curve intersection, NPSH analysis, and redundancy management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenFormulaInspector('FORM-MECH-001')}
              className="px-3 py-1.5 bg-amber-900/40 hover:bg-amber-800/60 border border-amber-700/50 text-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>fx Pump Affinity & Power Formula</span>
            </button>
          </div>
        </div>

        {/* Pump List & Controls */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pump Cards */}
          <div className="lg:col-span-1 space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {pumps.map((pump) => {
              const isSelected = pump.id === selectedPumpId;
              const isRunning = pump.status === 'RUNNING';
              const isTripped = pump.status === 'TRIP' || pump.status === 'FAULT';

              return (
                <div
                  key={pump.id}
                  onClick={() => setSelectedPumpId(pump.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-400/80 shadow-md shadow-amber-950/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200">{pump.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isRunning
                          ? 'bg-emerald-950/90 border border-emerald-600 text-emerald-300'
                          : isTripped
                          ? 'bg-rose-950/90 border border-rose-600 text-rose-300 animate-pulse'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}
                    >
                      {pump.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono mb-3">
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">Flow (m³/h)</span>
                      <span className="text-cyan-300 font-bold">{pump.flowM3hr}</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">Head (m)</span>
                      <span className="text-amber-300 font-bold">{pump.headM}</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-sans">Power (kW)</span>
                      <span className="text-emerald-300 font-bold">{pump.powerKw}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdatePump(pump.id, {
                          status: isRunning ? 'STANDBY' : 'RUNNING',
                          flowM3hr: isRunning ? 0 : 520.8,
                          headM: isRunning ? 0 : 25.0,
                          powerKw: isRunning ? 0 : 43.5,
                          speedPercent: isRunning ? 0 : 100,
                          speedRpm: isRunning ? 0 : 1480
                        });
                      }}
                      className={`flex-1 py-1 text-[10px] font-bold rounded flex items-center justify-center gap-1 border transition ${
                        isRunning
                          ? 'bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border-rose-700/60'
                          : 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border-emerald-700/60'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{isRunning ? 'Stop Unit' : 'Start Pump'}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdatePump(pump.id, {
                          status: 'TRIP',
                          flowM3hr: 0,
                          headM: 0,
                          powerKw: 0,
                          speedPercent: 0,
                          speedRpm: 0
                        });
                      }}
                      className="px-2 py-1 text-[10px] bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 border border-slate-700 rounded transition font-bold"
                      title="Inject Electrical/Mechanical Trip"
                    >
                      Trip
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Selected Pump Telemetry & Pump Curve / System Curve Chart */}
          <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            {selectedPump && (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{selectedPump.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-normal">
                        Subsystem: {selectedPump.subsystem}
                      </span>
                    </h4>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Duty Config: <span className="text-amber-300 font-bold">{selectedPump.dutyType}</span>
                  </div>
                </div>

                {/* Speed Slider & Parameters */}
                <div className="my-4 p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>VFD Speed Controller (RPM / %):</span>
                      <span className="font-mono font-bold text-cyan-300">{selectedPump.speedPercent}% ({Math.round(1480 * (selectedPump.speedPercent / 100))} RPM)</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="110"
                      value={selectedPump.speedPercent}
                      disabled={selectedPump.status !== 'RUNNING'}
                      onChange={(e) => {
                        const pct = Number(e.target.value);
                        const ratio = pct / 100;
                        const baseFlow = 520.8;
                        const baseHead = 25.0;
                        const newFlow = baseFlow * ratio;
                        const newHead = baseHead * Math.pow(ratio, 2);
                        const newPower = 43.5 * Math.pow(ratio, 3);

                        onUpdatePump(selectedPump.id, {
                          speedPercent: pct,
                          speedRpm: Math.round(1480 * ratio),
                          flowM3hr: Number(newFlow.toFixed(1)),
                          headM: Number(newHead.toFixed(1)),
                          powerKw: Number(newPower.toFixed(1))
                        });
                      }}
                      className="w-full accent-cyan-400 cursor-pointer disabled:opacity-40"
                    />
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-slate-300">
                      <span className="text-slate-500 block text-[10px]">NPSH Available</span>
                      <span className="text-emerald-400 font-bold">{selectedPump.npshAvailableM} m</span>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-500 block text-[10px]">NPSH Required</span>
                      <span className="text-amber-400 font-bold">{selectedPump.npshRequiredM} m</span>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-slate-500 block text-[10px]">NPSH Margin</span>
                      <span className="text-emerald-300 font-bold">+{(selectedPump.npshAvailableM - selectedPump.npshRequiredM).toFixed(1)} m (PASS)</span>
                    </div>
                  </div>
                </div>

                {/* Graphical Pump Curve vs System Curve */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-3">
                    <span className="font-semibold text-white">Dynamic Q-H Pump & System Resistance Curves</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span> Pump Curve (Q-H)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span> System Curve</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Duty Point</span>
                    </div>
                  </div>

                  {/* SVG Chart Overlay */}
                  <div className="h-44 w-full relative">
                    <svg className="w-full h-full" viewBox="0 0 400 160">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="380" y2="20" stroke="#334155" strokeDasharray="3 3" />
                      <line x1="40" y1="70" x2="380" y2="70" stroke="#334155" strokeDasharray="3 3" />
                      <line x1="40" y1="120" x2="380" y2="120" stroke="#334155" strokeDasharray="3 3" />
                      <line x1="40" y1="140" x2="380" y2="140" stroke="#475569" />
                      <line x1="40" y1="10" x2="40" y2="140" stroke="#475569" />

                      {/* Labels */}
                      <text x="35" y="25" fill="#94a3b8" fontSize="9" textAnchor="end">35m</text>
                      <text x="35" y="75" fill="#94a3b8" fontSize="9" textAnchor="end">25m</text>
                      <text x="35" y="125" fill="#94a3b8" fontSize="9" textAnchor="end">10m</text>
                      <text x="40" y="152" fill="#94a3b8" fontSize="9">0</text>
                      <text x="210" y="152" fill="#94a3b8" fontSize="9">500 m³/h</text>
                      <text x="360" y="152" fill="#94a3b8" fontSize="9">750 m³/h</text>

                      {/* Pump Curve Path */}
                      <path
                        d="M 40,30 Q 210,70 380,135"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                      />

                      {/* System Curve Path */}
                      <path
                        d="M 40,115 Q 210,95 380,40"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                      />

                      {/* Operating Point Intersection */}
                      {selectedPump.status === 'RUNNING' && (
                        <g>
                          <circle cx="215" cy="72" r="5" fill="#10b981" stroke="#ecfdf5" strokeWidth="1.5" />
                          <line x1="215" y1="72" x2="215" y2="140" stroke="#10b981" strokeDasharray="2 2" />
                          <line x1="40" y1="72" x2="215" y2="72" stroke="#10b981" strokeDasharray="2 2" />
                          <text x="225" y="68" fill="#10b981" fontSize="10" fontWeight="bold">
                            Duty Point: {selectedPump.flowM3hr} m³/h @ {selectedPump.headM} m
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Plant Valve Network */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Interactive Plant Valve Network & Headloss Control
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live throttle control, Flow Coefficient (Cv), and hydraulic backpressure calculation across isolation and control valves.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {valves.map((valve) => (
            <div key={valve.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200">{valve.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  valve.state === 'OPEN' ? 'bg-emerald-950/80 border border-emerald-600 text-emerald-300' :
                  valve.state === 'PARTIALLY_OPEN' ? 'bg-amber-950/80 border border-amber-600 text-amber-300' :
                  'bg-rose-950/80 border border-rose-600 text-rose-300'
                }`}>
                  {valve.state} ({valve.openPercent}%)
                </span>
              </div>

              <div className="text-[11px] text-slate-400 mb-3 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="text-slate-200">{valve.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Flow Rate:</span>
                  <span className="text-cyan-300">{valve.flowM3hr.toFixed(1)} m³/h</span>
                </div>
                <div className="flex justify-between">
                  <span>Cv Flow Coeff:</span>
                  <span className="text-amber-300">{valve.actualCv.toFixed(0)} gpm/psi^0.5</span>
                </div>
                <div className="flex justify-between">
                  <span>Valve Headloss:</span>
                  <span className="text-rose-300">{valve.headLossM.toFixed(2)} m</span>
                </div>
              </div>

              {/* Throttle Slider */}
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Throttle Valve:</span>
                  <span className="font-bold text-cyan-300">{valve.openPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={valve.openPercent}
                  onChange={(e) => {
                    const open = Number(e.target.value);
                    const state = open === 100 ? 'OPEN' : open === 0 ? 'CLOSED' : 'PARTIALLY_OPEN';
                    const cv = (valve.cvMax * open) / 100;
                    const loss = open > 0 ? Number((0.85 * Math.pow(100 / Math.max(10, open), 1.5) * 0.05).toFixed(2)) : 5.0;

                    onUpdateValve(valve.id, {
                      openPercent: open,
                      state,
                      actualCv: cv,
                      headLossM: loss
                    });
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
