import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { formatDate, parseDate } from '../../engine/calendarUtils';
import { Calendar, Filter, CheckSquare, HardHat, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { EngineeringDiscipline } from '../../types';

export const LookAheadView: React.FC = () => {
  const { project, updateTask } = useProject();

  const [lookAheadDays, setLookAheadDays] = useState<7 | 14 | 30>(14);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');

  const todayStr = formatDate(new Date());
  const todayDate = parseDate(todayStr);

  const horizonDate = new Date(todayDate);
  horizonDate.setDate(horizonDate.getDate() + lookAheadDays);
  const horizonStr = formatDate(horizonDate);

  // Filter tasks in horizon
  const lookAheadTasks = project.tasks.filter((t) => {
    if (t.isSummary) return false;
    if (selectedDiscipline !== 'All' && t.discipline !== selectedDiscipline) return false;

    // Task starts or finishes within the look-ahead horizon, or is actively in progress
    const startsInWindow = t.startDate >= todayStr && t.startDate <= horizonStr;
    const finishesInWindow = t.finishDate >= todayStr && t.finishDate <= horizonStr;
    const inProgress = t.startDate <= todayStr && t.finishDate >= todayStr && t.percentComplete < 100;

    return startsInWindow || finishesInWindow || inProgress;
  });

  const disciplinesList: EngineeringDiscipline[] = [
    'Civil',
    'Structural',
    'Mechanical',
    'Electrical',
    'Piping',
    'I&C',
    'Architectural',
    'Commissioning',
  ];

  const handleUpdateProgress = (taskId: string, currentPct: number) => {
    const newPct = Math.min(100, currentPct + 25);
    updateTask(taskId, { percentComplete: newPct, status: newPct === 100 ? 'Completed' : 'In Progress' });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 overflow-y-auto p-6 space-y-6 text-slate-100 font-sans">
      {/* Header Controls */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono text-xs font-bold">
              SITE CONTROL ENGINE
            </span>
            <span className="text-xs text-slate-400">Construction & Field Look-Ahead Schedule</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 mt-1">Engineering Look-Ahead Planning</h1>
          <p className="text-xs text-slate-400">
            Active site activities from {todayStr} to {horizonStr} ({lookAheadDays}-Day Horizon)
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-3">
          {/* Horizon Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => setLookAheadDays(7)}
              className={`px-3 py-1.5 rounded-lg transition ${
                lookAheadDays === 7 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setLookAheadDays(14)}
              className={`px-3 py-1.5 rounded-lg transition ${
                lookAheadDays === 14 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setLookAheadDays(30)}
              className={`px-3 py-1.5 rounded-lg transition ${
                lookAheadDays === 30 ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Discipline Filter */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none"
            >
              <option value="All">All Disciplines</option>
              {disciplinesList.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-slate-200">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Look ahead Tasks Grid */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
            <HardHat className="w-4 h-4 text-cyan-400" />
            <span>Look-Ahead Action List ({lookAheadTasks.length} Work Items)</span>
          </h3>
          <span className="text-xs text-slate-400">Click progress button to log site completion</span>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">WBS</th>
                <th className="p-3">Task Name</th>
                <th className="p-3">Discipline</th>
                <th className="p-3">Start</th>
                <th className="p-3">Finish</th>
                <th className="p-3">Drawing Ref</th>
                <th className="p-3">Progress</th>
                <th className="p-3 text-right">Site Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {lookAheadTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                    No active tasks scheduled in the selected {lookAheadDays}-day horizon.
                  </td>
                </tr>
              ) : (
                lookAheadTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/50">
                    <td className="p-3 font-bold text-cyan-400">{t.wbs}</td>
                    <td className="p-3 text-slate-200 font-sans font-medium">{t.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-sans text-[11px]">
                        {t.discipline || 'General'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{t.startDate}</td>
                    <td className="p-3 text-slate-300">{t.finishDate}</td>
                    <td className="p-3 text-amber-400">{t.drawingRef || '—'}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full transition-all"
                            style={{ width: `${t.percentComplete}%` }}
                          />
                        </div>
                        <span className="text-slate-300 font-bold">{t.percentComplete}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-sans">
                      <button
                        onClick={() => handleUpdateProgress(t.id, t.percentComplete)}
                        className="bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 px-3 py-1 rounded-lg text-xs font-bold transition"
                      >
                        +25% Progress
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
