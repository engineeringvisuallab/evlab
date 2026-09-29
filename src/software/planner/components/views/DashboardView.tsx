import React from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  Activity,
  TrendingUp,
  Calendar,
  Users,
  ShieldAlert,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { project, setCurrentView } = useProject();

  const totalTasks = project.tasks.length;
  const criticalTasks = project.tasks.filter((t) => t.isCritical && !t.isSummary);
  const overdueTasks = project.tasks.filter((t) => t.status === 'Overdue');
  const completedTasks = project.tasks.filter((t) => t.status === 'Completed');
  const milestones = project.tasks.filter((t) => t.isMilestone);

  // Cost metrics
  const totalBudget = project.tasks.reduce((sum, t) => sum + (t.totalCost || 0), 0);
  const actualCost = project.tasks.reduce(
    (sum, t) => sum + ((t.totalCost || 0) * (t.percentComplete || 0)) / 100,
    0
  );
  const remainingCost = totalBudget - actualCost;

  // Weighted overall progress
  let totalWeight = 0;
  let weightedProgress = 0;
  project.tasks.forEach((t) => {
    if (!t.isSummary) {
      const w = Math.max(1, t.duration);
      totalWeight += w;
      weightedProgress += w * (t.percentComplete || 0);
    }
  });
  const overallCompletionPct = totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0;

  const openRisks = (project.risks || []).filter((r) => r.status === 'Open');
  const openIssues = (project.issues || []).filter((i) => i.status !== 'Resolved');

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-6 select-none font-sans">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Header Title Banner */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center space-x-2">
              <LayoutDashboard className="w-6 h-6 text-cyan-400" />
              <span>Project Executive Dashboard</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time project health, critical path status, budget variance, and milestone schedule controls.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Project Code:</span>
            <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-1 rounded">
              {project.code}
            </span>
          </div>
        </div>

        {/* Top 4 Key Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Overall Completion */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Project Completion
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="my-3 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-emerald-400 font-mono">
                {overallCompletionPct}%
              </span>
              <span className="text-xs text-slate-400">
                ({completedTasks.length}/{totalTasks} tasks)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                style={{ width: `${overallCompletionPct}%` }}
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Card 2: Critical Path */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Critical Path Tasks
              </span>
              <Activity className="w-5 h-5 text-rose-400" />
            </div>
            <div className="my-3 flex items-baseline space-x-2">
              <span className="text-3xl font-black text-rose-400 font-mono">
                {criticalTasks.length}
              </span>
              <span className="text-xs text-slate-400">tasks driving finish date</span>
            </div>
            <button
              onClick={() => setCurrentView('critical-path')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold text-left transition"
            >
              Analyze Critical Path →
            </button>
          </div>

          {/* Card 3: Budget & Costs */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Budget
              </span>
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div className="my-3 flex items-baseline space-x-1">
              <span className="text-2xl font-black text-amber-300 font-mono">
                {project.currency}
                {totalBudget.toLocaleString()}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between">
              <span>Earned Value: {project.currency}{Math.round(actualCost).toLocaleString()}</span>
              <span>Remaining: {project.currency}{Math.round(remainingCost).toLocaleString()}</span>
            </div>
          </div>

          {/* Card 4: Risks & Issues */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Risks & Issues
              </span>
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div className="my-3 flex items-baseline space-x-4">
              <div>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {openRisks.length}
                </span>
                <span className="text-[10px] text-slate-400 block">Open Risks</span>
              </div>
              <div>
                <span className="text-2xl font-black text-rose-400 font-mono">
                  {openIssues.length}
                </span>
                <span className="text-[10px] text-slate-400 block">Active Issues</span>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('risks')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold text-left transition"
            >
              Manage Risks & Issues →
            </button>
          </div>
        </div>

        {/* Second Row: Critical Tasks & Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical Path Activities Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-rose-400" />
                <span>Critical Path Activities (Zero Float)</span>
              </h2>
              <span className="text-xs bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded font-mono font-bold">
                {criticalTasks.length} Critical
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[300px] font-mono text-xs">
              {criticalTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-cyan-400 text-[11px]">{t.wbs}</span>
                      <span className="font-semibold text-slate-200">{t.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {t.startDate} → {t.finishDate} ({t.duration} days)
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 block">{t.percentComplete}%</span>
                    <span className="text-[10px] text-rose-400 font-bold uppercase">Float: 0d</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Key Milestones */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Project Key Milestones</span>
              </h2>
              <span className="text-xs text-slate-400">{milestones.length} Milestones</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[300px] text-xs">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3.5 h-3.5 bg-amber-400 rotate-45 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-200 block">{m.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{m.finishDate}</span>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        m.percentComplete === 100
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {m.percentComplete === 100 ? 'Achieved' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
