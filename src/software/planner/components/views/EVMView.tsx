import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { calculateEVM } from '../../engine/evmEngine';
import { TrendingUp, DollarSign, Activity, AlertCircle, BarChart3, Clock, CheckCircle } from 'lucide-react';

export const EVMView: React.FC = () => {
  const { project } = useProject();
  const evm = calculateEVM(project);

  const curr = project.currency || '$';

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-y-auto p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Banner Header */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono text-xs font-bold">
              ANSI / EIA-748 COMPLIANT EVM
            </span>
            <span className="text-xs text-slate-400">Earned Value Management & Cost Control</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">Project Earned Value Analysis Center</h1>
          <p className="text-xs text-slate-400">Real-time performance index metrics, S-Curve forecasting & estimate at completion</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Cost Performance (CPI)</div>
            <div className={`text-lg font-bold font-mono ${evm.cpi >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {evm.cpi.toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-center">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Schedule Performance (SPI)</div>
            <div className={`text-lg font-bold font-mono ${evm.spi >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {evm.spi.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* BAC */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Budget At Completion (BAC)</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">
            {curr}{evm.bac.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total Baseline Budget</div>
        </div>

        {/* PV */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Planned Value (PV)</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {curr}{evm.pv.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">BCWS (Budgeted Cost of Work Scheduled)</div>
        </div>

        {/* EV */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Earned Value (EV)</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {curr}{evm.ev.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">BCWP (Budgeted Cost of Work Performed)</div>
        </div>

        {/* AC */}
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase">Actual Cost (AC)</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {curr}{evm.ac.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">ACWP (Actual Cost of Work Performed)</div>
        </div>
      </div>

      {/* S-Curve Graph & Forecast Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual S-Curve */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Earned Value S-Curve (Cumulative Performance)</span>
              </h3>
              <p className="text-xs text-slate-400">Tracking Planned Value vs Earned Value vs Actual Cost over time</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center space-x-1"><span className="w-3 h-3 bg-cyan-400 rounded-full"></span><span>PV</span></span>
              <span className="flex items-center space-x-1"><span className="w-3 h-3 bg-emerald-400 rounded-full"></span><span>EV</span></span>
              <span className="flex items-center space-x-1"><span className="w-3 h-3 bg-amber-400 rounded-full"></span><span>AC</span></span>
            </div>
          </div>

          {/* SVG S-Curve Chart */}
          <div className="h-64 w-full bg-slate-900 border border-slate-800/80 rounded-xl p-4 relative flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#1e293b" strokeDasharray="3,3" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#1e293b" strokeDasharray="3,3" />

              {/* PV Curve */}
              <path
                d="M 10 180 Q 250 150 490 20"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="3"
              />

              {/* EV Curve */}
              <path
                d="M 10 180 Q 200 160 380 70"
                fill="none"
                stroke="#34d399"
                strokeWidth="3"
              />

              {/* AC Curve */}
              <path
                d="M 10 180 Q 180 155 380 60"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="3"
                strokeDasharray="4,4"
              />
            </svg>
          </div>
        </div>

        {/* Forecasts Panel */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-slate-100 text-sm border-b border-slate-800 pb-3">
            EVM Forecasts & Variances
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400">Estimate At Completion (EAC)</span>
              <span className="font-bold text-slate-100">{curr}{evm.eac.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400">Estimate To Complete (ETC)</span>
              <span className="font-bold text-cyan-400">{curr}{evm.etc.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400">Variance At Completion (VAC)</span>
              <span className={`font-bold ${evm.vac >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {curr}{evm.vac.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400">Cost Variance (CV = EV - AC)</span>
              <span className={`font-bold ${evm.cv >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {curr}{evm.cv.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400">Schedule Variance (SV = EV - PV)</span>
              <span className={`font-bold ${evm.sv >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {curr}{evm.sv.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-900 rounded-xl">
              <span className="text-slate-400">To-Complete Index (TCPI)</span>
              <span className="font-bold text-purple-400">{evm.tcpi.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Level EVM Table Breakdown */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-slate-100 text-sm">Task-Level Earned Value Breakdown</h3>
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">WBS</th>
                <th className="p-3">Task Name</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Baseline Cost</th>
                <th className="p-3">Earned Value (EV)</th>
                <th className="p-3">Actual Cost (AC)</th>
                <th className="p-3">Cost Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {project.tasks.filter(t => !t.isSummary).map((t) => {
                const taskEv = (t.totalCost * (t.percentComplete || 0)) / 100;
                const taskAc = t.actualCost !== undefined && t.actualCost > 0 ? t.actualCost : taskEv;
                const taskCv = taskEv - taskAc;

                return (
                  <tr key={t.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-cyan-400">{t.wbs}</td>
                    <td className="p-3 text-slate-200 font-sans">{t.name}</td>
                    <td className="p-3 text-slate-300 font-bold">{t.percentComplete}%</td>
                    <td className="p-3 text-slate-300">{curr}{(t.baselineCost || t.totalCost).toLocaleString()}</td>
                    <td className="p-3 text-emerald-400 font-bold">{curr}{Math.round(taskEv).toLocaleString()}</td>
                    <td className="p-3 text-amber-400">{curr}{Math.round(taskAc).toLocaleString()}</td>
                    <td className={`p-3 font-bold ${taskCv >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {curr}{Math.round(taskCv).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
