import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { DollarSign, TrendingUp, PieChart, BarChart2, CheckCircle2 } from 'lucide-react';

export const CostView: React.FC = () => {
  const { project } = useProject();

  const totalCost = project.tasks.reduce((sum, t) => sum + (t.totalCost || 0), 0);
  const earnedValue = project.tasks.reduce(
    (sum, t) => sum + ((t.totalCost || 0) * (t.percentComplete || 0)) / 100,
    0
  );
  const remainingCost = totalCost - earnedValue;

  // WBS Cost Summary
  const topWBS = project.tasks.filter((t) => t.level === 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 select-none">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Project Cost & Earned Value Control
              </h1>
              <p className="text-xs text-slate-400">
                Cost breakdown by WBS, labor vs material expense, and budget variance analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Planned Total Budget
            </span>
            <span className="text-2xl font-black text-amber-300 font-mono">
              {project.currency}
              {totalCost.toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Earned Value (Progress Cost)
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {project.currency}
              {Math.round(earnedValue).toLocaleString()}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Remaining Unearned Budget
            </span>
            <span className="text-2xl font-black text-cyan-400 font-mono">
              {project.currency}
              {Math.round(remainingCost).toLocaleString()}
            </span>
          </div>
        </div>

        {/* WBS Cost Breakdown Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg font-mono text-xs">
          <div className="p-4 bg-slate-900 border-b border-slate-800 font-bold text-slate-200">
            WBS Major Work Package Cost Summary
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">WBS</th>
                <th className="p-3">Work Package Name</th>
                <th className="p-3 text-center">Progress %</th>
                <th className="p-3 text-right">Planned Cost</th>
                <th className="p-3 text-right">Earned Value</th>
                <th className="p-3 text-right">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topWBS.map((w) => {
                const earned = ((w.totalCost || 0) * (w.percentComplete || 0)) / 100;
                const rem = (w.totalCost || 0) - earned;
                return (
                  <tr key={w.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-cyan-400">{w.wbs}</td>
                    <td className="p-3 font-semibold text-slate-200">{w.name}</td>
                    <td className="p-3 text-center font-bold text-emerald-400">
                      {w.percentComplete}%
                    </td>
                    <td className="p-3 text-right font-bold text-slate-100">
                      {project.currency}
                      {(w.totalCost || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-emerald-400">
                      {project.currency}
                      {Math.round(earned).toLocaleString()}
                    </td>
                    <td className="p-3 text-right text-slate-400">
                      {project.currency}
                      {Math.round(rem).toLocaleString()}
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
