/**
 * EVLab WaterFlow - Hydraulic Performance Dashboard
 * Summary KPIs, Health Indicators, and Distribution Metrics.
 */

import React, { useMemo } from 'react';
import { useWaterFlow } from '../../context/WaterFlowContext';
import { Junction, Pipe } from '../../types/waterflow';
import { X, BarChart3, Activity, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ResultsDashboardDialog: React.FC = () => {
  const { model, diagnostics, validationIssues, setActiveDialog } = useWaterFlow();

  const nodes = useMemo(() => {
    return model.nodes instanceof Map ? Array.from(model.nodes.values()) : Object.values(model.nodes);
  }, [model.nodes]);

  const links = useMemo(() => {
    return model.links instanceof Map ? Array.from(model.links.values()) : Object.values(model.links);
  }, [model.links]);

  const junctions = useMemo(() => nodes.filter(n => n.type === 'junction') as Junction[], [nodes]);
  const pipes = useMemo(() => links.filter(l => l.type === 'pipe') as Pipe[], [links]);

  const pressures = useMemo(() => junctions.map(j => j.pressure || 0), [junctions]);
  const velocities = useMemo(() => pipes.map(p => Math.abs(p.velocity || 0)), [pipes]);

  const minPress = pressures.length > 0 ? Math.min(...pressures) : 0;
  const maxPress = pressures.length > 0 ? Math.max(...pressures) : 0;
  const maxVel = velocities.length > 0 ? Math.max(...velocities) : 0;

  const errors = validationIssues.filter(i => i.severity === 'ERROR');
  const warnings = validationIssues.filter(i => i.severity === 'WARNING');

  const healthStatus = errors.length > 0 || minPress < 0 ? 'CRITICAL' : warnings.length > 0 || minPress < 100 || maxVel > 3.0 ? 'WARNING' : 'GOOD';

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-sm text-cyan-400 tracking-wider uppercase">Network Performance & Health Dashboard</h2>
          </div>
          <button onClick={() => setActiveDialog(null)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Health Status Banner */}
          <div className={`p-3 rounded border flex items-center justify-between font-bold text-sm ${
            healthStatus === 'GOOD'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : healthStatus === 'WARNING'
              ? 'bg-amber-950/60 border-amber-800 text-amber-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}>
            <div className="flex items-center gap-2">
              {healthStatus === 'GOOD' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <span>NETWORK HEALTH STATUS: {healthStatus}</span>
            </div>
            <span className="text-xs font-mono font-normal">
              {healthStatus === 'GOOD' ? 'All hydraulic parameters within acceptable standards.' : 'Review pressure or velocity warnings.'}
            </span>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Total Demand</span>
              <div className="font-mono text-cyan-300 text-lg font-bold">{diagnostics?.totalSystemDemand || 0} L/s</div>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Min Pressure</span>
              <div className={`font-mono text-lg font-bold ${minPress < 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                {minPress.toFixed(1)} kPa
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Max Pressure</span>
              <div className="font-mono text-blue-400 text-lg font-bold">{maxPress.toFixed(1)} kPa</div>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Max Velocity</span>
              <div className={`font-mono text-lg font-bold ${maxVel > 2.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {maxVel.toFixed(2)} m/s
              </div>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono space-y-2">
            <div className="font-bold text-cyan-400 uppercase text-[11px] border-b border-slate-800 pb-1">
              Hydraulic Diagnostic Metrics
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <div className="flex justify-between"><span className="text-slate-400">Total Network Junctions:</span><span>{junctions.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Total Network Pipes:</span><span>{pipes.length}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Total Friction Losses:</span><span>{diagnostics?.totalFrictionLosses || 0} m</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Booster Pump Power:</span><span>{diagnostics?.pumpEnergyKW || 0} kW</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
