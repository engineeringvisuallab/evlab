import React from 'react';
import { HydraulicNodeState } from '../../core/simulationStateEngine';
import { Activity, ArrowDown, Gauge, Layers, ShieldCheck, AlertCircle, Info, Calculator } from 'lucide-react';

interface SimulationHglViewProps {
  nodes: HydraulicNodeState[];
  overallHglLossM: number;
  plantFlowM3hr: number;
  onOpenFormulaInspector: (paramId: string) => void;
}

export const SimulationHglView: React.FC<SimulationHglViewProps> = ({
  nodes,
  overallHglLossM,
  plantFlowM3hr,
  onOpenFormulaInspector
}) => {
  const maxHgl = Math.max(...nodes.map(n => n.waterSurfaceElevationM));
  const minHgl = Math.min(...nodes.map(n => n.waterSurfaceElevationM));
  const elevationRange = Math.max(8, maxHgl - minHgl + 4);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Dynamic Hydraulic Grade Line (HGL) & EGL Profile
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live hydraulic energy dissipation, friction headlosses, and gravity flow transitions across all 9 plant units.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700">
              <span className="text-slate-400">Total Static Headloss:</span>{' '}
              <span className="font-bold text-cyan-300 font-mono">{(nodes[0].waterSurfaceElevationM - nodes[nodes.length - 1].waterSurfaceElevationM).toFixed(2)} m</span>
            </div>
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700">
              <span className="text-slate-400">Gravity Driving Head:</span>{' '}
              <span className="font-bold text-emerald-400 font-mono">AVAILABLE (No Surcharging)</span>
            </div>
            <button
              onClick={() => onOpenFormulaInspector('FORM-HYD-001')}
              className="px-3 py-1.5 bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-700/50 text-cyan-300 rounded-lg flex items-center gap-1.5 font-semibold transition"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>fx Hydraulic Grade Formula</span>
            </button>
          </div>
        </div>

        {/* Live Profile Visual Chart */}
        <div className="mt-6 bg-slate-950/80 border border-slate-800/90 rounded-xl p-5 relative overflow-x-auto">
          <div className="min-w-[780px]">
            <div className="flex items-center justify-between mb-2 text-[11px] text-slate-400 font-mono">
              <span>Datum Elevation: 100.00 m MSL</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-cyan-400 rounded-full inline-block"></span> Water Surface (HGL)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 border-t border-dashed border-amber-400 inline-block"></span> Energy Line (EGL)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-slate-600 rounded-sm inline-block"></span> Ground Level</span>
              </div>
            </div>

            {/* Profile Canvas / Bar representation */}
            <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 relative border-b border-slate-700">
              {/* Background Reference Grids */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-slate-600 w-full"></div>
                <div className="border-b border-slate-600 w-full"></div>
                <div className="border-b border-slate-600 w-full"></div>
                <div className="border-b border-slate-600 w-full"></div>
              </div>

              {nodes.map((node, idx) => {
                const hglHeight = ((node.waterSurfaceElevationM - 100) / 12) * 100;
                const gndHeight = ((node.groundElevationM - 100) / 12) * 100;
                const eglDiff = (node.energyGradeElevationM - node.waterSurfaceElevationM) * 15;

                return (
                  <div key={node.nodeId} className="flex-1 flex flex-col items-center relative group">
                    {/* EGL Marker */}
                    <div 
                      className="absolute w-full flex items-center justify-center pointer-events-none"
                      style={{ bottom: `${Math.min(95, hglHeight + eglDiff)}%` }}
                    >
                      <div className="w-3 h-3 rounded-full bg-amber-400/90 border border-amber-200 shadow-md"></div>
                    </div>

                    {/* HGL Water Column */}
                    <div 
                      className="w-full max-w-[56px] rounded-t-lg bg-gradient-to-t from-cyan-600/70 via-cyan-500/80 to-cyan-400 relative border-t-2 border-cyan-200 shadow-lg shadow-cyan-950/50 flex flex-col justify-between p-1.5 transition-all duration-300 group-hover:brightness-125 cursor-pointer"
                      style={{ height: `${Math.max(15, Math.min(92, hglHeight))}%` }}
                      onClick={() => onOpenFormulaInspector('FORM-HYD-001')}
                    >
                      <div className="text-[10px] font-bold text-white font-mono text-center">
                        {node.waterSurfaceElevationM.toFixed(2)}m
                      </div>
                      <div className="text-[9px] text-cyan-100/80 text-center font-mono">
                        v={node.velocityMs}m/s
                      </div>
                    </div>

                    {/* Ground Base */}
                    <div 
                      className="w-full max-w-[56px] bg-slate-800 border-t border-slate-700 text-center py-1"
                      style={{ height: `${Math.max(8, gndHeight * 0.4)}%` }}
                    >
                    </div>

                    {/* Node Tag */}
                    <div className="mt-3 text-center">
                      <div className="text-[11px] font-bold text-slate-200 truncate max-w-[85px]" title={node.name}>
                        {node.name.split(' ')[0]}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        Δh={node.headLossM.toFixed(2)}m
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hydraulic Nodes Detailed Telemetry Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Hydraulic State Matrix by Process Unit</h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">Flow: {plantFlowM3hr.toFixed(1)} m³/hr</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="py-2.5 px-3 font-semibold">Node / Unit Name</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Ground (m)</th>
                <th className="py-2.5 px-3 font-semibold font-mono text-cyan-400">HGL (m MSL)</th>
                <th className="py-2.5 px-3 font-semibold font-mono text-amber-400">EGL (m MSL)</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Headloss Δh</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Velocity (m/s)</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Water Depth (m)</th>
                <th className="py-2.5 px-3 font-semibold font-mono">Freeboard (m)</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {nodes.map((node) => (
                <tr key={node.nodeId} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
                    <span>{node.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{node.groundElevationM.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-cyan-300 font-bold">{node.waterSurfaceElevationM.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-amber-300 font-bold">{node.energyGradeElevationM.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-rose-300">{node.headLossM.toFixed(2)} m</td>
                  <td className="py-2.5 px-3 text-slate-300">{node.velocityMs.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-slate-300">{node.waterDepthM.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-emerald-300">{node.freeboardM.toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 rounded text-[10px] font-semibold">
                      NORMAL
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
