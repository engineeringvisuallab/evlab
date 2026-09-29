import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { Activity, Clock, AlertTriangle, ChevronRight, CheckCircle2 } from 'lucide-react';

export const CriticalPathView: React.FC = () => {
  const { project } = useProject();

  const criticalTasks = project.tasks.filter((t) => t.isCritical && !t.isSummary);
  const nonCriticalTasks = project.tasks.filter((t) => !t.isCritical && !t.isSummary);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 select-none font-mono">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 font-sans">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                Critical Path Method (CPM) & Float Analysis
              </h1>
              <p className="text-xs text-slate-400">
                Detailed Early/Late dates, Total Float, Free Float, and critical activity driving path.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 px-3 py-1.5 rounded">
            {criticalTasks.length} Critical Activities Driving Project Finish ({project.calculatedFinishDate})
          </span>
        </div>

        {/* Critical Path Flow Network Diagram Visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 font-sans">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <span>Critical Activity Sequence Network</span>
          </h2>

          <div className="flex items-center space-x-2 overflow-x-auto py-3">
            {criticalTasks.map((task, idx) => (
              <React.Fragment key={task.id}>
                <div className="shrink-0 p-3 bg-rose-950/80 border border-rose-700/80 rounded-lg shadow-md max-w-[200px] text-xs font-mono">
                  <div className="font-bold text-cyan-300 mb-1">{task.wbs}</div>
                  <div className="font-semibold text-slate-100 truncate max-w-[180px]" title={task.name}>
                    {task.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {task.duration} days | {task.startDate}
                  </div>
                </div>
                {idx < criticalTasks.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-rose-500 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Full Float Analysis Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg text-xs">
          <div className="p-4 bg-slate-900 border-b border-slate-800 font-bold text-slate-200 font-sans">
            Full CPM Float Calculation Table
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 font-bold text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3 w-16 text-center">WBS</th>
                <th className="p-3">Task Name</th>
                <th className="p-3 text-center w-16">Dur</th>
                <th className="p-3 text-center w-24">ES</th>
                <th className="p-3 text-center w-24">EF</th>
                <th className="p-3 text-center w-24">LS</th>
                <th className="p-3 text-center w-24">LF</th>
                <th className="p-3 text-center w-24">Total Float</th>
                <th className="p-3 text-center w-24">Free Float</th>
                <th className="p-3 text-center w-24">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {project.tasks.map((t) => (
                <tr
                  key={t.id}
                  className={`hover:bg-slate-800/50 transition ${
                    t.isCritical ? 'bg-rose-950/20 text-slate-100 font-semibold' : 'text-slate-300'
                  }`}
                >
                  <td className="p-3 text-center font-bold text-cyan-400">{t.wbs}</td>
                  <td className="p-3">{t.name}</td>
                  <td className="p-3 text-center">{t.duration}d</td>
                  <td className="p-3 text-center text-slate-400 text-[11px]">{t.earlyStart}</td>
                  <td className="p-3 text-center text-slate-400 text-[11px]">{t.earlyFinish}</td>
                  <td className="p-3 text-center text-slate-400 text-[11px]">{t.lateStart}</td>
                  <td className="p-3 text-center text-slate-400 text-[11px]">{t.lateFinish}</td>
                  <td className="p-3 text-center font-bold">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        t.totalFloat <= 0
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t.totalFloat}d
                    </span>
                  </td>
                  <td className="p-3 text-center text-slate-400">{t.freeFloat}d</td>
                  <td className="p-3 text-center font-bold">
                    {t.isCritical ? (
                      <span className="text-rose-400">Critical</span>
                    ) : (
                      <span className="text-emerald-400">Non-Critical</span>
                    )}
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
