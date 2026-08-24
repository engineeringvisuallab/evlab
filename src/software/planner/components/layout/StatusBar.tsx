import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { Activity, Clock, DollarSign, CheckCircle, Keyboard } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { project } = useProject();

  const totalTasks = project.tasks.length;
  const criticalCount = project.tasks.filter((t) => t.isCritical && !t.isSummary).length;
  const totalCost = project.tasks.reduce((sum, t) => sum + (t.totalCost || 0), 0);

  // Calculate weighted progress %
  let totalWeight = 0;
  let totalWeightedProg = 0;
  project.tasks.forEach((t) => {
    if (!t.isSummary) {
      const w = Math.max(1, t.duration);
      totalWeight += w;
      totalWeightedProg += w * (t.percentComplete || 0);
    }
  });
  const overallProg = totalWeight > 0 ? Math.round(totalWeightedProg / totalWeight) : 0;

  return (
    <footer className="h-7 bg-slate-950 border-t border-slate-800 px-3 text-[11px] text-slate-400 flex items-center justify-between select-none shrink-0 font-mono">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>CPM Engine: Active</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div>
          Tasks: <span className="text-slate-200 font-semibold">{totalTasks}</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div>
          Critical:{' '}
          <span className={criticalCount > 0 ? 'text-rose-400 font-semibold' : 'text-slate-200'}>
            {criticalCount}
          </span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center space-x-1">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span>Overall Completion:</span>
          <span className="text-emerald-400 font-semibold">{overallProg}%</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <DollarSign className="w-3 h-3 text-amber-400" />
          <span>Budget:</span>
          <span className="text-amber-300 font-semibold">
            {project.currency}
            {totalCost.toLocaleString()}
          </span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Finish:</span>
          <span className="text-slate-200">{project.calculatedFinishDate}</span>
        </div>
        <div className="h-3 w-px bg-slate-800" />
        <div className="flex items-center space-x-1 text-slate-500">
          <Keyboard className="w-3 h-3" />
          <span>Ctrl+Z (Undo) | Ctrl+Y (Redo)</span>
        </div>
      </div>
    </footer>
  );
};
