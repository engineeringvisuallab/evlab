import React, { useState, useMemo } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import {
  Plus,
  Trash2,
  Copy,
  Indent,
  Outdent,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Edit2,
  CheckSquare,
  Square,
  Activity,
  Layers,
} from 'lucide-react';

export const TaskSheetView: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const {
    project,
    addTask,
    updateTask,
    deleteTask,
    deleteMultipleTasks,
    duplicateTask,
    indentTaskItem,
    outdentTaskItem,
    moveTaskItem,
    selectedTaskId,
    setSelectedTaskId,
    selectedTaskIds,
    setSelectedTaskIds,
    setEditingTaskId,
    setIsTaskModalOpen,
  } = useProject();

  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const activeSearch = searchQuery || localSearch;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return project.tasks.filter((t) => {
      const matchesSearch =
        !activeSearch.trim() ||
        t.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        t.wbs.includes(activeSearch) ||
        t.status.toLowerCase().includes(activeSearch.toLowerCase());

      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [project.tasks, activeSearch, statusFilter, priorityFilter]);

  // Checkbox select all
  const isAllSelected =
    filteredTasks.length > 0 && filteredTasks.every((t) => selectedTaskIds.includes(t.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedTaskIds([]);
      setSelectedTaskId(null);
    } else {
      const allIds = filteredTasks.map((t) => t.id);
      setSelectedTaskIds(allIds);
      if (allIds.length > 0) setSelectedTaskId(allIds[0]);
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedTaskIds.includes(id)) {
      const updated = selectedTaskIds.filter((item) => item !== id);
      setSelectedTaskIds(updated);
      if (selectedTaskId === id) setSelectedTaskId(updated[0] || null);
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
      setSelectedTaskId(id);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Top Action Toolbar */}
      <div className="h-11 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => addTask()}
            className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-2.5 py-1.5 rounded transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>

          <button
            onClick={() => selectedTaskId && duplicateTask(selectedTaskId)}
            disabled={!selectedTaskId}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded border border-slate-700/80 disabled:opacity-40 transition"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={() => selectedTaskId && indentTaskItem(selectedTaskId)}
            disabled={!selectedTaskId}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            title="Indent Task"
          >
            <Indent className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectedTaskId && outdentTaskItem(selectedTaskId)}
            disabled={!selectedTaskId}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            title="Outdent Task"
          >
            <Outdent className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => selectedTaskId && moveTaskItem(selectedTaskId, 'up')}
            disabled={!selectedTaskId}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            title="Move Task Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectedTaskId && moveTaskItem(selectedTaskId, 'down')}
            disabled={!selectedTaskId}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            title="Move Task Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            onClick={() => {
              if (selectedTaskIds.length > 0) {
                deleteMultipleTasks(selectedTaskIds);
              }
            }}
            disabled={selectedTaskIds.length === 0}
            className="flex items-center space-x-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 px-2.5 py-1.5 rounded disabled:opacity-40 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete ({selectedTaskIds.length})</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Spreadsheet Grid Table */}
      <div className="flex-1 overflow-auto bg-slate-950 font-mono text-xs">
        <table className="w-full text-left border-collapse min-w-[1400px]">
          <thead className="sticky top-0 bg-slate-900 text-slate-400 font-bold uppercase text-[10px] tracking-wider z-10 border-b border-slate-800">
            <tr>
              <th className="p-2.5 w-10 text-center">
                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-200">
                  {isAllSelected ? <CheckSquare className="w-4 h-4 text-cyan-400" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
              <th className="p-2.5 w-12 text-center">ID</th>
              <th className="p-2.5 w-16 text-center">WBS</th>
              <th className="p-2.5 min-w-[280px]">Task Name</th>
              <th className="p-2.5 w-20 text-center">Duration</th>
              <th className="p-2.5 w-24 text-center">Start</th>
              <th className="p-2.5 w-24 text-center">Finish</th>
              <th className="p-2.5 w-28 text-center">Predecessors</th>
              <th className="p-2.5 w-20 text-center">% Done</th>
              <th className="p-2.5 w-28">Status</th>
              <th className="p-2.5 w-24">Priority</th>
              <th className="p-2.5 w-36">Resources</th>
              <th className="p-2.5 w-28 text-right">Cost ({project.currency})</th>
              <th className="p-2.5 w-24 text-center">Base Start</th>
              <th className="p-2.5 w-24 text-center">Base Finish</th>
              <th className="p-2.5 w-16 text-center">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTasks.map((t, idx) => {
              const isSelected = selectedTaskIds.includes(t.id);
              const predStr = t.predecessors?.map((p) => `${p.taskId.replace('t-', '')}${p.type}`).join(', ') || '-';
              const assignedRes = project.resources
                .filter((r) => t.resourceIds?.includes(r.id))
                .map((r) => r.name)
                .join(', ') || '-';

              return (
                <tr
                  key={t.id}
                  onClick={() => {
                    setSelectedTaskId(t.id);
                    if (!selectedTaskIds.includes(t.id)) {
                      setSelectedTaskIds([t.id]);
                    }
                  }}
                  onDoubleClick={() => {
                    setEditingTaskId(t.id);
                    setIsTaskModalOpen(true);
                  }}
                  className={`transition hover:bg-slate-800/50 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/50 text-cyan-200'
                      : t.isCritical
                      ? 'bg-rose-950/10 text-slate-200'
                      : 'text-slate-300'
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="p-2 text-center" onClick={(e) => toggleSelectRow(t.id, e)}>
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400 mx-auto" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>

                  {/* ID */}
                  <td className="p-2 text-center text-slate-500">{idx + 1}</td>

                  {/* WBS */}
                  <td className="p-2 text-center font-bold text-slate-400">{t.wbs}</td>

                  {/* Task Name with Indent */}
                  <td className="p-2">
                    <div className="flex items-center">
                      <div style={{ width: `${t.level * 16}px` }} className="shrink-0" />
                      <span
                        className={`${
                          t.isSummary
                            ? 'font-bold text-slate-100 text-xs'
                            : t.isMilestone
                            ? 'font-semibold text-amber-300'
                            : ''
                        }`}
                      >
                        {t.name}
                      </span>
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      min="0"
                      value={t.duration}
                      disabled={t.isSummary}
                      onChange={(e) => updateTask(t.id, { duration: parseInt(e.target.value) || 0 })}
                      className="w-12 bg-slate-900 border border-slate-700/80 rounded px-1 text-center focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                    />
                  </td>

                  {/* Start Date */}
                  <td className="p-2 text-center text-[11px] font-mono">{t.startDate}</td>

                  {/* Finish Date */}
                  <td className="p-2 text-center text-[11px] font-mono">{t.finishDate}</td>

                  {/* Predecessors */}
                  <td className="p-2 text-center text-slate-400 text-[11px] truncate">{predStr}</td>

                  {/* % Complete */}
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={t.percentComplete}
                      disabled={t.isSummary}
                      onChange={(e) =>
                        updateTask(t.id, {
                          percentComplete: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)),
                        })
                      }
                      className="w-12 bg-slate-900 border border-slate-700/80 rounded px-1 text-center font-bold text-cyan-400 focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                    />
                  </td>

                  {/* Status */}
                  <td className="p-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'Completed'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
                          : t.status === 'In Progress'
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                          : t.status === 'Overdue'
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="p-2">
                    <span
                      className={`text-[10px] font-bold ${
                        t.priority === 'Critical'
                          ? 'text-rose-400'
                          : t.priority === 'High'
                          ? 'text-amber-400'
                          : t.priority === 'Medium'
                          ? 'text-cyan-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>

                  {/* Assigned Resources */}
                  <td className="p-2 text-slate-400 text-[11px] truncate max-w-[140px]" title={assignedRes}>
                    {assignedRes}
                  </td>

                  {/* Cost */}
                  <td className="p-2 text-right font-bold text-slate-200">
                    {(t.totalCost || 0).toLocaleString()}
                  </td>

                  {/* Baseline Start */}
                  <td className="p-2 text-center text-slate-500 text-[11px]">{t.baselineStart || '-'}</td>

                  {/* Baseline Finish */}
                  <td className="p-2 text-center text-slate-500 text-[11px]">{t.baselineFinish || '-'}</td>

                  {/* Action Edit */}
                  <td className="p-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTaskId(t.id);
                        setIsTaskModalOpen(true);
                      }}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
