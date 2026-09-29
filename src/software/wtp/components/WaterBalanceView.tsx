import React from 'react';
import { Scale, Droplets, Recycle, ArrowRight, ShieldCheck } from 'lucide-react';
import { CalculatedWtpState } from '../core/dependencyEngine';
import { propagateProcessStreams, DEFAULT_PROCESS_TRAIN } from '../core/processStreamEngine';

interface WaterBalanceProps {
  state: CalculatedWtpState;
}

export const WaterBalanceView: React.FC<WaterBalanceProps> = ({ state }) => {
  const rawIntakeFlow = state.plantCapacityMLD * 1.05; // 5% internal plant loss
  const backwashWaterM3d = state.backwashFlowM3hr * (15 / 60) * state.numberOfFilters;
  const sludgeWaterM3d = state.wetSludgeM3Day;
  const netTreatedWater = state.plantCapacityMLD;

  const streams = propagateProcessStreams(DEFAULT_PROCESS_TRAIN, state.plantCapacityMLD, {
    turbidityNTU: 120,
    tssMgL: 120,
    ironMgL: 2.5,
    manganeseMgL: 0.5,
    coliformCfu: 2400,
    ph: 7.2,
    alkalinityMgL: 85
  }, 25.0);

  const totalSolidsGeneratedKgDay = streams.reduce((acc, s) => acc + s.solidsGeneratedKgDay, 0);
  const recoveryPercent = (netTreatedWater / rawIntakeFlow) * 100;
  const processLossPercent = 100 - recoveryPercent;

  return (
    <div className="p-8 space-y-8 bg-slate-950 text-slate-100 min-h-screen font-mono text-xs">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2.5">
          <Scale className="w-6 h-6 text-cyan-400" />
          <span>Water & Mass Balance Engineering Engine</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Raw water intake allowance (105%), internal backwash recycle, clarifier sludge blowdown, chemical precipitate mass tracking, and net plant recovery.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="text-slate-400">Raw Water Intake Flow</div>
          <div className="text-2xl font-bold text-cyan-300">{rawIntakeFlow.toFixed(2)} MLD</div>
          <div className="text-3xs text-slate-500">Includes 5% plant internal losses</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="text-slate-400">Filter Backwash Water</div>
          <div className="text-2xl font-bold text-amber-400">{(backwashWaterM3d / 1000).toFixed(2)} MLD</div>
          <div className="text-3xs text-slate-500">Recycled to head of works</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="text-slate-400">Sludge Blowdown Loss</div>
          <div className="text-2xl font-bold text-rose-400">{(sludgeWaterM3d / 1000).toFixed(2)} MLD</div>
          <div className="text-3xs text-slate-500">Sent to sludge thickener</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <div className="text-slate-400">Net Product Water Output</div>
          <div className="text-2xl font-bold text-emerald-400">{netTreatedWater.toFixed(2)} MLD</div>
          <div className="text-3xs text-emerald-400 font-bold">Recovery: {recoveryPercent.toFixed(1)}% ({processLossPercent.toFixed(1)}% loss)</div>
        </div>
      </div>

      {/* Stream Mass & Water Balance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider border-b border-slate-800 pb-2">
          Process Stream Mass & Water Quality Propagation Matrix
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-3xs">
                <th className="py-2">Stream ID</th>
                <th className="py-2">Stream Name</th>
                <th className="py-2 text-right">Flow (MLD)</th>
                <th className="py-2 text-right">Flow (m³/hr)</th>
                <th className="py-2 text-right">Turbidity (NTU)</th>
                <th className="py-2 text-right">TSS (mg/L)</th>
                <th className="py-2 text-right">Iron (mg/L)</th>
                <th className="py-2 text-right">Alkalinity</th>
                <th className="py-2 text-right">Solids Gen (kg/d)</th>
              </tr>
            </thead>
            <tbody>
              {streams.map((st) => (
                <tr key={st.streamId} className="border-b border-slate-800/50 hover:bg-slate-950">
                  <td className="py-2.5 font-bold text-cyan-300">{st.streamId}</td>
                  <td className="py-2.5 text-slate-100 font-bold">{st.name}</td>
                  <td className="py-2.5 text-right font-bold text-slate-200">{st.flowMld}</td>
                  <td className="py-2.5 text-right text-cyan-300">{st.flowM3hr}</td>
                  <td className="py-2.5 text-right text-emerald-400 font-bold">{st.turbidityNTU}</td>
                  <td className="py-2.5 text-right text-slate-300">{st.tssMgL}</td>
                  <td className="py-2.5 text-right text-amber-300">{st.ironMgL}</td>
                  <td className="py-2.5 text-right text-slate-400">{st.alkalinityMgL} mg/L</td>
                  <td className="py-2.5 text-right font-bold text-rose-400">{st.solidsGeneratedKgDay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-slate-200">
          <span>Total Mass Solids Generated Across Train:</span>
          <span className="text-rose-400 font-bold text-sm">{totalSolidsGeneratedKgDay.toLocaleString()} kg dry solids/day</span>
        </div>
      </div>
    </div>
  );
};
