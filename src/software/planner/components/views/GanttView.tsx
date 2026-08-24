import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Task } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Indent,
  Outdent,
  ArrowUp,
  ArrowDown,
  Activity,
  Layers,
  Calendar,
  Filter,
} from 'lucide-react';
import { addWorkingDays, formatDate, getWorkingDaysBetween, parseDate } from '../../engine/calendarUtils';

type ZoomLevel = 'day' | 'week' | 'month' | 'quarter' | 'year';

export const GanttView: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const {
    project,
    addTask,
    updateTask,
    deleteTask,
    indentTaskItem,
    outdentTaskItem,
    moveTaskItem,
    toggleTaskCollapse,
    selectedTaskId,
    setSelectedTaskId,
    setSelectedTaskIds,
    setEditingTaskId,
    setIsTaskModalOpen,
  } = useProject();

  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [showBaselines, setShowBaselines] = useState(true);

  // Left grid width resizable
  const [leftWidth, setLeftWidth] = useState(480);
  const isDraggingSplitter = useRef(false);

  // Synchronized scrolling
  const leftTableRef = useRef<HTMLDivElement>(null);
  const rightTimelineRef = useRef<HTMLDivElement>(null);

  const handleScrollLeft = () => {
    if (leftTableRef.current && rightTimelineRef.current) {
      rightTimelineRef.current.scrollTop = leftTableRef.current.scrollTop;
    }
  };

  const handleScrollRight = () => {
    if (leftTableRef.current && rightTimelineRef.current) {
      leftTableRef.current.scrollTop = rightTimelineRef.current.scrollTop;
    }
  };

  // Filter tasks
  const visibleTasks = useMemo(() => {
    let list = project.tasks;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.wbs.includes(q) ||
          t.status.toLowerCase().includes(q)
      );
    }
    if (showCriticalOnly) {
      list = list.filter((t) => t.isCritical);
    }
    return list;
  }, [project.tasks, searchQuery, showCriticalOnly]);

  // Timeline scale math
  const dayWidth = useMemo(() => {
    switch (zoomLevel) {
      case 'day':
        return 40;
      case 'week':
        return 20;
      case 'month':
        return 10;
      case 'quarter':
        return 4;
      case 'year':
        return 2;
    }
  }, [zoomLevel]);

  // Timeline startDate and totalDays range
  const { timelineStart, timelineEnd, totalDays } = useMemo(() => {
    if (!project.tasks || project.tasks.length === 0) {
      const start = parseDate(project.startDate || '2026-03-01');
      return {
        timelineStart: start,
        timelineEnd: new Date(start.getTime() + 90 * 86400000),
        totalDays: 90,
      };
    }

    let minT = new Date(project.startDate + 'T00:00:00').getTime();
    let maxT = minT;

    project.tasks.forEach((t) => {
      const s = new Date(t.startDate + 'T00:00:00').getTime();
      const f = new Date(t.finishDate + 'T00:00:00').getTime();
      if (!isNaN(s) && s < minT) minT = s;
      if (!isNaN(f) && f > maxT) maxT = f;
    });

    // Pad start by 7 days and end by 30 days
    const start = new Date(minT - 7 * 86400000);
    const end = new Date(maxT + 30 * 86400000);
    const days = Math.ceil((end.getTime() - start.getTime()) / 86400000);

    return { timelineStart: start, timelineEnd: end, totalDays: days };
  }, [project.tasks, project.startDate]);

  // Generate Date headers
  const datesHeader = useMemo(() => {
    const list: Array<{ dateStr: string; dayOfMonth: number; monthName: string; year: number; isWeekend: boolean }> = [];
    const curr = new Date(timelineStart);
    for (let i = 0; i < totalDays; i++) {
      const dStr = formatDate(curr);
      const dayOfWeek = curr.getDay();
      list.push({
        dateStr: dStr,
        dayOfMonth: curr.getDate(),
        monthName: curr.toLocaleString('default', { month: 'short' }),
        year: curr.getFullYear(),
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
      curr.setDate(curr.getDate() + 1);
    }
    return list;
  }, [timelineStart, totalDays]);

  // Helper to get pixel X position for a date string
  const getXForDate = (dateStr: string): number => {
    if (!dateStr) return 0;
    const d = new Date(dateStr + 'T00:00:00').getTime();
    const diffDays = (d - timelineStart.getTime()) / 86400000;
    return diffDays * dayWidth;
  };

  // Dragging task bars to move or resize
  const [dragState, setDragState] = useState<{
    taskId: string;
    mode: 'move' | 'resize';
    startX: number;
    initialStartStr: string;
    initialDuration: number;
  } | null>(null);

  const handleMouseDownBar = (
    e: React.MouseEvent,
    taskId: string,
    mode: 'move' | 'resize',
    initialStartStr: string,
    initialDuration: number
  ) => {
    e.stopPropagation();
    setDragState({
      taskId,
      mode,
      startX: e.clientX,
      initialStartStr,
      initialDuration,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState) return;

      const deltaX = e.clientX - dragState.startX;
      const deltaDays = Math.round(deltaX / dayWidth);

      if (deltaDays === 0) return;

      const task = project.tasks.find((t) => t.id === dragState.taskId);
      if (!task || task.isSummary) return;

      if (dragState.mode === 'move') {
        const cal = project.calendars[0];
        const newStart = addWorkingDays(dragState.initialStartStr, deltaDays, cal);
        const newFinish = addWorkingDays(newStart, task.duration, cal);
        updateTask(task.id, { startDate: newStart, finishDate: newFinish });
      } else if (dragState.mode === 'resize') {
        const newDur = Math.max(1, dragState.initialDuration + deltaDays);
        const cal = project.calendars[0];
        const newFinish = addWorkingDays(task.startDate, newDur, cal);
        updateTask(task.id, { duration: newDur, finishDate: newFinish });
      }
    };

    const handleMouseUp = () => {
      if (dragState) {
        setDragState(null);
      }
    };

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, dayWidth, project.tasks, updateTask]);

  // Handle Splitter drag
  const handleSplitterMouseDown = () => {
    isDraggingSplitter.current = true;
    document.body.style.userSelect = 'none';

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplitter.current) return;
      const newW = Math.max(300, Math.min(800, e.clientX - 220));
      setLeftWidth(newW);
    };

    const onMouseUp = () => {
      isDraggingSplitter.current = false;
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Build task map for fast dependency drawing
  const taskYMap = useMemo(() => {
    const map = new Map<string, { y: number; xStart: number; xFinish: number }>();
    visibleTasks.forEach((t, idx) => {
      const y = idx * 36 + 18; // row height 36px
      const xStart = getXForDate(t.startDate);
      const xFinish = getXForDate(t.finishDate) + (t.isMilestone ? 0 : dayWidth * Math.max(1, t.duration));
      map.set(t.id, { y, xStart, xFinish });
    });
    return map;
  }, [visibleTasks, dayWidth, timelineStart]);

  const todayX = getXForDate(formatDate(new Date()));

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Gantt View Ribbon Controls */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0 text-xs">
        {/* Left Toolbar Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => addTask()}
            className="flex items-center space-x-1 bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-2.5 py-1 rounded transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>

          <div className="h-4 w-px bg-slate-700/80 mx-1" />

          <button
            onClick={() => selectedTaskId && indentTaskItem(selectedTaskId)}
            disabled={!selectedTaskId}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            title="Indent Task (Right)"
          >
            <Indent className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectedTaskId && outdentTaskItem(selectedTaskId)}
            disabled={!selectedTaskId}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            title="Outdent Task (Left)"
          >
            <Outdent className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-700/80 mx-1" />

          <button
            onClick={() => selectedTaskId && moveTaskItem(selectedTaskId, 'up')}
            disabled={!selectedTaskId}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            title="Move Task Up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => selectedTaskId && moveTaskItem(selectedTaskId, 'down')}
            disabled={!selectedTaskId}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
            title="Move Task Down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-700/80 mx-1" />

          <button
            onClick={() => selectedTaskId && deleteTask(selectedTaskId)}
            disabled={!selectedTaskId}
            className="p-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 disabled:opacity-40 transition"
            title="Delete Selected Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Gantt Zoom & Filter Toggles */}
        <div className="flex items-center space-x-3">
          {/* Critical Path Toggle */}
          <button
            onClick={() => setShowCriticalOnly((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium border transition ${
              showCriticalOnly
                ? 'bg-rose-950/80 text-rose-300 border-rose-700/80 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-rose-400" />
            <span>Critical Path Only</span>
          </button>

          {/* Baseline Toggle */}
          <button
            onClick={() => setShowBaselines((prev) => !prev)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium border transition ${
              showBaselines
                ? 'bg-slate-800 text-cyan-400 border-slate-700'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Show Baselines</span>
          </button>

          <div className="h-4 w-px bg-slate-700/80 mx-1" />

          {/* Zoom Level Select */}
          <div className="flex items-center space-x-1 bg-slate-800 rounded p-0.5 border border-slate-700">
            <ZoomOut className="w-3.5 h-3.5 text-slate-400 ml-1" />
            {(['day', 'week', 'month', 'quarter', 'year'] as ZoomLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setZoomLevel(lvl)}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded capitalize transition ${
                  zoomLevel === lvl ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
            <ZoomIn className="w-3.5 h-3.5 text-slate-400 mr-1" />
          </div>
        </div>
      </div>

      {/* Main Gantt Splitter Container */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* LEFT PANEL: Task Table Grid */}
        <div
          style={{ width: `${leftWidth}px` }}
          className="flex flex-col border-r border-slate-800 bg-slate-900/90 shrink-0 select-none overflow-hidden"
        >
          {/* Table Header */}
          <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 px-2 font-mono">
            <div className="w-12 text-center">ID</div>
            <div className="w-16 text-center">WBS</div>
            <div className="flex-1 px-2">Task Name</div>
            <div className="w-16 text-center">Dur</div>
            <div className="w-20 text-center">Start</div>
            <div className="w-20 text-center">Finish</div>
            <div className="w-14 text-center">%</div>
          </div>

          {/* Table Rows */}
          <div
            ref={leftTableRef}
            onScroll={handleScrollLeft}
            className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-slate-800/60"
          >
            {visibleTasks.map((t, idx) => {
              const isSelected = selectedTaskId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTaskId(t.id);
                    setSelectedTaskIds([t.id]);
                  }}
                  onDoubleClick={() => {
                    setEditingTaskId(t.id);
                    setIsTaskModalOpen(true);
                  }}
                  className={`h-9 flex items-center text-xs font-mono transition cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/60 text-cyan-200 font-medium border-l-2 border-cyan-400'
                      : t.isCritical
                      ? 'bg-rose-950/10 text-slate-200 hover:bg-slate-800/80'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  {/* ID */}
                  <div className="w-12 text-center text-slate-500 text-[11px] font-mono">{idx + 1}</div>

                  {/* WBS */}
                  <div className="w-16 text-center text-slate-400 text-[11px] font-mono font-semibold">
                    {t.wbs}
                  </div>

                  {/* Name with Indentation Level & Expand Collapse */}
                  <div className="flex-1 flex items-center truncate px-1 pr-2">
                    <div style={{ width: `${t.level * 16}px` }} className="shrink-0" />
                    {t.isSummary ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskCollapse(t.id);
                        }}
                        className="p-0.5 text-slate-400 hover:text-slate-100 mr-1"
                      >
                        {t.isCollapsed ? (
                          <ChevronRight className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ) : (
                      <div className="w-4 h-4 mr-1 shrink-0 flex items-center justify-center">
                        {t.isMilestone ? (
                          <div className="w-2.5 h-2.5 bg-amber-400 rotate-45" />
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${t.isCritical ? 'bg-rose-500' : 'bg-cyan-500'}`} />
                        )}
                      </div>
                    )}
                    <span
                      className={`truncate ${
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

                  {/* Duration */}
                  <div className="w-16 text-center text-slate-400 text-[11px]">
                    {t.isMilestone ? '0d' : `${t.duration}d`}
                  </div>

                  {/* Start */}
                  <div className="w-20 text-center text-slate-400 text-[10px]">{t.startDate}</div>

                  {/* Finish */}
                  <div className="w-20 text-center text-slate-400 text-[10px]">{t.finishDate}</div>

                  {/* % Complete */}
                  <div className="w-14 text-center font-bold text-[11px] text-cyan-400">
                    {t.percentComplete}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SPLITTER DRAGGABLE HANDLE */}
        <div
          onMouseDown={handleSplitterMouseDown}
          className="w-1 bg-slate-800 hover:bg-cyan-500 cursor-col-resize z-20 transition shrink-0"
        />

        {/* RIGHT PANEL: Gantt Timeline */}
        <div
          ref={rightTimelineRef}
          onScroll={handleScrollRight}
          className="flex-1 bg-slate-950 overflow-auto relative"
        >
          <div style={{ width: `${totalDays * dayWidth}px`, minHeight: '100%' }} className="relative">
            {/* Timeline Headers */}
            <div className="h-12 bg-slate-900 border-b border-slate-800 sticky top-0 z-10 flex flex-col font-mono text-[10px] select-none">
              {/* Top Month Header */}
              <div className="h-6 border-b border-slate-800/80 flex items-center text-slate-400 font-bold px-2">
                {datesHeader.length > 0 && `${datesHeader[0].monthName} ${datesHeader[0].year}`}
              </div>

              {/* Bottom Days / Dates Grid */}
              <div className="h-6 flex items-center text-slate-400">
                {datesHeader.map((d, i) => (
                  <div
                    key={i}
                    style={{ width: `${dayWidth}px` }}
                    className={`h-full border-r border-slate-800/60 flex items-center justify-center font-mono ${
                      d.isWeekend ? 'bg-slate-900/80 text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {d.dayOfMonth}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Background Day Columns */}
            <div className="absolute top-12 bottom-0 left-0 right-0 flex pointer-events-none">
              {datesHeader.map((d, i) => (
                <div
                  key={i}
                  style={{ width: `${dayWidth}px` }}
                  className={`h-full border-r border-slate-900 ${
                    d.isWeekend ? 'bg-slate-900/30' : ''
                  }`}
                />
              ))}
            </div>

            {/* Today Line Marker */}
            {todayX > 0 && todayX < totalDays * dayWidth && (
              <div
                style={{ left: `${todayX}px` }}
                className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 z-10 pointer-events-none shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              >
                <div className="bg-emerald-500 text-slate-950 text-[9px] font-extrabold px-1 py-0.5 rounded-b -translate-x-1/2">
                  TODAY
                </div>
              </div>
            )}

            {/* Dependency SVG Connector Lines */}
            <svg className="absolute top-12 left-0 right-0 bottom-0 w-full h-full pointer-events-none z-10">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
                </marker>
                <marker
                  id="arrow-critical"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
                </marker>
              </defs>

              {visibleTasks.map((t) => {
                if (!t.predecessors || t.predecessors.length === 0) return null;

                const targetPos = taskYMap.get(t.id);
                if (!targetPos) return null;

                return t.predecessors.map((dep, depIdx) => {
                  const srcPos = taskYMap.get(dep.taskId);
                  if (!srcPos) return null;

                  const srcX = srcPos.xFinish;
                  const srcY = srcPos.y;
                  const tgtX = targetPos.xStart;
                  const tgtY = targetPos.y;

                  const isCriticalConn = t.isCritical;
                  const strokeColor = isCriticalConn ? '#f43f5e' : '#38bdf8';
                  const markerId = isCriticalConn ? 'url(#arrow-critical)' : 'url(#arrow)';

                  // Path logic: From right end of predecessor to left start of successor
                  const midX = srcX + Math.max(12, (tgtX - srcX) / 2);
                  const pathD = `M ${srcX} ${srcY} H ${midX} V ${tgtY} H ${tgtX}`;

                  return (
                    <path
                      key={`${t.id}-dep-${depIdx}`}
                      d={pathD}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isCriticalConn ? '2' : '1.5'}
                      strokeDasharray={dep.type !== 'FS' ? '3,3' : 'none'}
                      markerEnd={markerId}
                      opacity={0.85}
                    />
                  );
                });
              })}
            </svg>

            {/* Task Bars Overlay */}
            <div className="pt-12 relative z-0">
              {visibleTasks.map((t) => {
                const isSelected = selectedTaskId === t.id;
                const xStart = getXForDate(t.startDate);
                const dur = t.isMilestone ? 0 : Math.max(1, t.duration);
                const widthPx = dur * dayWidth;

                // Baseline coordinates
                const baseStart = t.baselineStart ? getXForDate(t.baselineStart) : null;
                const baseDur = t.baselineDuration ?? t.duration;
                const baseWidth = baseDur * dayWidth;

                return (
                  <div
                    key={t.id}
                    className={`h-9 flex items-center relative border-b border-slate-900 ${
                      isSelected ? 'bg-cyan-950/20' : ''
                    }`}
                  >
                    {/* Baseline Phantom Bar */}
                    {showBaselines && baseStart !== null && !t.isSummary && !t.isMilestone && (
                      <div
                        style={{ left: `${baseStart}px`, width: `${baseWidth}px` }}
                        className="absolute h-1.5 bottom-1 rounded bg-slate-700/80 border border-slate-600/80 z-0"
                        title={`Baseline: ${t.baselineStart} to ${t.baselineFinish}`}
                      />
                    )}

                    {/* Summary Task Bar */}
                    {t.isSummary ? (
                      <div
                        style={{ left: `${xStart}px`, width: `${Math.max(10, widthPx)}px` }}
                        className="h-4 bg-slate-800 border border-slate-600 rounded-sm relative z-10 flex items-center"
                      >
                        {/* Summary Progress Fill */}
                        <div
                          style={{ width: `${t.percentComplete}%` }}
                          className="h-full bg-slate-600 rounded-sm opacity-90"
                        />
                        {/* Bracket Ends */}
                        <div className="absolute -left-1 top-0 bottom-0 w-1.5 bg-slate-300 rounded-l" />
                        <div className="absolute -right-1 top-0 bottom-0 w-1.5 bg-slate-300 rounded-r" />
                        <span className="absolute left-2 text-[10px] font-bold text-slate-200 truncate">
                          {t.name} ({t.percentComplete}%)
                        </span>
                      </div>
                    ) : t.isMilestone ? (
                      /* Milestone Diamond Shape */
                      <div
                        style={{ left: `${xStart - 8}px` }}
                        className="absolute z-10 flex items-center space-x-2"
                      >
                        <div className="w-4 h-4 bg-amber-400 border border-amber-200 rotate-45 shadow-md" />
                        <span className="text-[10px] font-bold text-amber-300 whitespace-nowrap bg-slate-950/80 px-1 rounded">
                          {t.name}
                        </span>
                      </div>
                    ) : (
                      /* Standard Task Bar */
                      <div
                        style={{ left: `${xStart}px`, width: `${Math.max(16, widthPx)}px` }}
                        onMouseDown={(e) => handleMouseDownBar(e, t.id, 'move', t.startDate, t.duration)}
                        className={`h-5 rounded-md relative z-10 flex items-center cursor-grab active:cursor-grabbing border shadow-sm transition ${
                          t.isCritical
                            ? 'bg-rose-900/90 border-rose-500/80 hover:border-rose-400'
                            : 'bg-cyan-900/90 border-cyan-500/80 hover:border-cyan-400'
                        }`}
                      >
                        {/* Progress Bar Fill */}
                        <div
                          style={{ width: `${t.percentComplete}%` }}
                          className={`h-full rounded-l-md transition-all ${
                            t.isCritical ? 'bg-rose-500/90' : 'bg-cyan-500/90'
                          }`}
                        />

                        {/* Task Label */}
                        <span className="absolute left-2 text-[10px] font-semibold text-slate-100 truncate pointer-events-none drop-shadow">
                          {t.name}
                        </span>

                        {/* Right Handle for Duration Resizing */}
                        <div
                          onMouseDown={(e) => handleMouseDownBar(e, t.id, 'resize', t.startDate, t.duration)}
                          className="absolute right-0 top-0 bottom-0 w-2.5 bg-white/20 hover:bg-white/50 cursor-ew-resize rounded-r-md z-20"
                          title="Drag to resize duration"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
