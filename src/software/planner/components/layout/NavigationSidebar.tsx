import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { AppView } from '../../types';
import {
  LayoutDashboard,
  GanttChart,
  ListTodo,
  GitFork,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  History,
  Activity,
  AlertTriangle,
  FileSpreadsheet,
  Sliders,
} from 'lucide-react';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const NavigationSidebar: React.FC = () => {
  const { currentView, setCurrentView, project } = useProject();

  const criticalTasksCount = project.tasks.filter((t) => t.isCritical && !t.isSummary).length;
  const openRisksCount = (project.risks || []).filter((r) => r.status === 'Open').length;

  const navItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gantt', label: 'Gantt Chart', icon: GanttChart },
    { id: 'tasks', label: 'Task Sheet', icon: ListTodo },
    { id: 'wbs', label: 'WBS Engine', icon: GitFork },
    { id: 'resources', label: 'Resources & Usage', icon: Users },
    { id: 'calendar', label: 'Working Calendar', icon: Calendar },
    { id: 'costs', label: 'Cost Management', icon: DollarSign },
    { id: 'evm', label: 'EVM Control Center', icon: TrendingUp },
    { id: 'lookahead', label: 'Look-Ahead Schedule', icon: Clock },
    { id: 'baseline', label: 'Baselines & Variance', icon: History },
    {
      id: 'critical-path',
      label: 'Critical Path',
      icon: Activity,
      badge: criticalTasksCount > 0 ? `${criticalTasksCount}` : undefined,
    },
    {
      id: 'risks',
      label: 'Risks & Issues',
      icon: AlertTriangle,
      badge: openRisksCount > 0 ? `${openRisksCount}` : undefined,
    },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'settings', label: 'Project Settings', icon: Sliders },
  ];

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none shrink-0">
      <div className="py-2">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Views & Modules
        </div>
        <nav className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition ${
                  isActive
                    ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      item.id === 'critical-path'
                        ? 'bg-rose-900/80 text-rose-300 border border-rose-700/60'
                        : 'bg-amber-900/80 text-amber-300 border border-amber-700/60'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Project Quick Meta Box */}
      <div className="p-3 m-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Project Control
        </div>
        <div className="space-y-1 text-slate-300 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400">Total Tasks:</span>
            <span className="font-semibold">{project.tasks.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Critical Tasks:</span>
            <span className="font-semibold text-rose-400">{criticalTasksCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Start Date:</span>
            <span className="font-mono text-slate-200">{project.startDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Finish Date:</span>
            <span className="font-mono text-emerald-400 font-semibold">{project.calculatedFinishDate}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
