import {
  ProjectCalendar,
  Resource,
  ResourceAssignment,
  Task,
  TaskDependency,
} from '../types';
import {
  addWorkingDays,
  DEFAULT_CALENDAR,
  formatDate,
  getNextWorkingDay,
  getWorkingDaysBetween,
} from './calendarUtils';
import { recalculateWBS } from './wbsEngine';

/**
 * Recalculates start date after subtracting working days (used in backward pass)
 */
function subtractWorkingDays(
  finishDateStr: string,
  days: number,
  calendar: ProjectCalendar
): string {
  if (days <= 0) return finishDateStr;
  let current = new Date(finishDateStr + 'T00:00:00');

  let remaining = days - 1;
  while (remaining > 0) {
    current.setDate(current.getDate() - 1);
    const dayOfWeek = current.getDay();
    const dateStr = formatDate(current);
    if (calendar.workingDays.includes(dayOfWeek) && !calendar.holidays.some((h) => h.date === dateStr)) {
      remaining--;
    }
  }

  return formatDate(current);
}

/**
 * Circular Dependency Detection using Depth-First Search (Tarjan / Cycle Detection)
 */
export function detectCircularDependencies(tasks: Task[]): {
  hasCycle: boolean;
  cyclePath?: string[];
} {
  const adjList = new Map<string, string[]>();
  const idToNameMap = new Map<string, string>();

  tasks.forEach((t) => {
    idToNameMap.set(t.id, t.name);
    adjList.set(
      t.id,
      (t.predecessors || []).map((p) => p.taskId)
    );
  });

  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recStack.add(nodeId);
    path.push(idToNameMap.get(nodeId) || nodeId);

    const neighbors = adjList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        path.push(idToNameMap.get(neighbor) || neighbor);
        return true;
      }
    }

    recStack.delete(nodeId);
    path.pop();
    return false;
  }

  for (const t of tasks) {
    if (!visited.has(t.id)) {
      if (dfs(t.id)) {
        return { hasCycle: true, cyclePath: path };
      }
    }
  }

  return { hasCycle: false };
}

/**
 * Calculates dependency start/finish date constraints
 */
function calculateDependencyConstraint(
  predTask: Task,
  dep: TaskDependency,
  calendar: ProjectCalendar
): string {
  const lag = dep.lagDays || 0;

  switch (dep.type) {
    case 'FS': { // Finish-to-Start: Task B starts after Task A finishes
      const nextDay = new Date(predTask.finishDate + 'T00:00:00');
      nextDay.setDate(nextDay.getDate() + 1);
      const validStart = getNextWorkingDay(formatDate(nextDay), calendar);
      return lag !== 0 ? addWorkingDays(validStart, lag, calendar) : validStart;
    }

    case 'SS': { // Start-to-Start: Task B starts when Task A starts (+ lag)
      return lag !== 0 ? addWorkingDays(predTask.startDate, lag, calendar) : predTask.startDate;
    }

    case 'FF': { // Finish-to-Finish: Task B finishes when Task A finishes (+ lag)
      const reqFinish = lag !== 0 ? addWorkingDays(predTask.finishDate, lag, calendar) : predTask.finishDate;
      // Start date required to meet this finish date
      return reqFinish;
    }

    case 'SF': { // Start-to-Finish
      const reqFinish = lag !== 0 ? addWorkingDays(predTask.startDate, lag, calendar) : predTask.startDate;
      return reqFinish;
    }

    default:
      return predTask.finishDate;
  }
}

/**
 * Complete Critical Path Method (CPM) Schedule Calculation Engine
 */
export function calculateSchedule(
  inputTasks: Task[],
  projectStartDate: string,
  calendar: ProjectCalendar = DEFAULT_CALENDAR,
  resources: Resource[] = [],
  assignments: ResourceAssignment[] = []
): {
  tasks: Task[];
  projectFinishDate: string;
  totalCost: number;
  overallPercentComplete: number;
  criticalTaskCount: number;
} {
  if (!inputTasks || inputTasks.length === 0) {
    return {
      tasks: [],
      projectFinishDate: projectStartDate,
      totalCost: 0,
      overallPercentComplete: 0,
      criticalTaskCount: 0,
    };
  }

  // 1. Recalculate WBS and ensure hierarchy is clean
  let tasks = recalculateWBS(inputTasks);

  // Map for fast lookups
  const taskMap = new Map<string, Task>();
  tasks.forEach((t) => taskMap.set(t.id, { ...t }));

  // Populate successors list for each task based on predecessors
  tasks.forEach((t) => {
    t.successors = [];
  });
  tasks.forEach((t) => {
    if (t.predecessors) {
      t.predecessors.forEach((dep) => {
        const pred = taskMap.get(dep.taskId);
        if (pred) {
          pred.successors.push({
            taskId: t.id,
            type: dep.type,
            lagDays: dep.lagDays,
          });
        }
      });
    }
  });

  // Calculate task costs based on assigned resources
  tasks.forEach((t) => {
    let resCost = 0;
    if (t.resourceIds && t.resourceIds.length > 0) {
      t.resourceIds.forEach((rId) => {
        const res = resources.find((r) => r.id === rId);
        if (res) {
          // Standard cost = rate * 8 hours/day * duration
          resCost += res.standardRate * 8 * Math.max(1, t.duration);
        }
      });
    }
    t.totalCost = (t.fixedCost || 0) + resCost;
  });

  // 2. Forward Pass: Early Start (ES) and Early Finish (EF)
  const validProjectStart = getNextWorkingDay(projectStartDate, calendar);

  // We loop to settle topological dependencies
  let maxPasses = tasks.length * 2;
  let pass = 0;
  let changed = true;

  while (changed && pass < maxPasses) {
    changed = false;
    pass++;

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      // If summary task, dates are derived from children
      if (task.isSummary) continue;

      let calculatedES = validProjectStart;

      // Check predecessors
      if (task.predecessors && task.predecessors.length > 0) {
        let maxPredDate = validProjectStart;
        task.predecessors.forEach((dep) => {
          const pred = taskMap.get(dep.taskId);
          if (pred && pred.finishDate) {
            const reqDate = calculateDependencyConstraint(pred, dep, calendar);
            if (reqDate > maxPredDate) {
              maxPredDate = reqDate;
            }
          }
        });
        calculatedES = maxPredDate;
      }

      // Check constraints
      if (task.constraintType === 'SNET' && task.constraintDate && task.constraintDate > calculatedES) {
        calculatedES = task.constraintDate;
      }

      const dur = task.isMilestone ? 0 : Math.max(1, task.duration);
      const calculatedEF = dur === 0 ? calculatedES : addWorkingDays(calculatedES, dur, calendar);

      if (task.startDate !== calculatedES || task.finishDate !== calculatedEF) {
        task.startDate = calculatedES;
        task.finishDate = calculatedEF;
        task.earlyStart = calculatedES;
        task.earlyFinish = calculatedEF;
        taskMap.set(task.id, task);
        changed = true;
      }
    }

    // Rollup summary tasks after each pass
    rollupSummaryTasks(tasks, calendar);
  }

  // Determine Project Calculated Finish Date
  let projectFinishDate = validProjectStart;
  tasks.forEach((t) => {
    if (t.finishDate > projectFinishDate) {
      projectFinishDate = t.finishDate;
    }
  });

  // 3. Backward Pass: Late Start (LS), Late Finish (LF), Total Float & Free Float
  tasks.forEach((t) => {
    t.lateFinish = projectFinishDate;
    t.lateStart = subtractWorkingDays(projectFinishDate, Math.max(1, t.duration), calendar);
  });

  // Process tasks in reverse topological order for backward pass
  for (let i = tasks.length - 1; i >= 0; i--) {
    const task = tasks[i];
    if (task.isSummary) continue;

    let minLateFinish = projectFinishDate;

    if (task.successors && task.successors.length > 0) {
      task.successors.forEach((succDep) => {
        const succ = taskMap.get(succDep.taskId);
        if (succ) {
          // Late Finish of predecessor <= Late Start of successor - lag
          const succLS = succ.lateStart || succ.startDate;
          const reqLF = subtractWorkingDays(succLS, 1, calendar);
          if (reqLF < minLateFinish) {
            minLateFinish = reqLF;
          }
        }
      });
      task.lateFinish = minLateFinish;
    } else {
      task.lateFinish = projectFinishDate;
    }

    const dur = task.isMilestone ? 0 : Math.max(1, task.duration);
    task.lateStart = dur === 0 ? task.lateFinish : subtractWorkingDays(task.lateFinish, dur, calendar);

    // Calculate Total Float (working days between ES and LS)
    const floatDays = getWorkingDaysBetween(task.earlyStart || task.startDate, task.lateStart, calendar) - 1;
    task.totalFloat = Math.max(0, floatDays);

    // Free float: min successor ES - EF
    let minSuccES = projectFinishDate;
    if (task.successors && task.successors.length > 0) {
      task.successors.forEach((sDep) => {
        const succ = taskMap.get(sDep.taskId);
        if (succ && succ.startDate < minSuccES) {
          minSuccES = succ.startDate;
        }
      });
      task.freeFloat = Math.max(0, getWorkingDaysBetween(task.finishDate, minSuccES, calendar) - 1);
    } else {
      task.freeFloat = task.totalFloat;
    }

    // Critical Path: Total Float <= 0
    task.isCritical = task.totalFloat <= 0;
  }

  // Re-rollup summary task critical states & costs
  let totalProjectCost = 0;
  let totalWeight = 0;
  let totalWeightedProgress = 0;
  let criticalCount = 0;

  tasks.forEach((t) => {
    if (!t.isSummary) {
      totalProjectCost += t.totalCost;
      const weight = Math.max(1, t.duration);
      totalWeight += weight;
      totalWeightedProgress += weight * (t.percentComplete || 0);
      if (t.isCritical) criticalCount++;
    }

    // Status auto-update
    if (t.percentComplete === 100) {
      t.status = 'Completed';
    } else if (t.percentComplete > 0) {
      t.status = 'In Progress';
    } else {
      const today = formatDate(new Date());
      if (t.startDate < today && t.percentComplete === 0) {
        t.status = 'Overdue';
      } else {
        t.status = 'Not Started';
      }
    }
  });

  const overallPercentComplete = totalWeight > 0 ? Math.round(totalWeightedProgress / totalWeight) : 0;

  return {
    tasks,
    projectFinishDate,
    totalCost: totalProjectCost,
    overallPercentComplete,
    criticalTaskCount: criticalCount,
  };
}

/**
 * Helper to roll up child dates, duration, completion %, and costs to summary tasks
 */
function rollupSummaryTasks(tasks: Task[], calendar: ProjectCalendar): void {
  for (let i = tasks.length - 1; i >= 0; i--) {
    const task = tasks[i];
    if (!task.isSummary) continue;

    // Find all direct/indirect children under this summary task
    const children: Task[] = [];
    for (let j = i + 1; j < tasks.length; j++) {
      if (tasks[j].level > task.level) {
        children.push(tasks[j]);
      } else {
        break; // Reached same or higher level task
      }
    }

    if (children.length > 0) {
      let minStart = children[0].startDate;
      let maxFinish = children[0].finishDate;
      let sumCost = 0;
      let sumWeight = 0;
      let sumWeightedProgress = 0;
      let hasCritical = false;

      children.forEach((c) => {
        if (!c.isSummary) {
          if (c.startDate < minStart) minStart = c.startDate;
          if (c.finishDate > maxFinish) maxFinish = c.finishDate;
          sumCost += c.totalCost || 0;

          const w = Math.max(1, c.duration);
          sumWeight += w;
          sumWeightedProgress += w * (c.percentComplete || 0);
          if (c.isCritical) hasCritical = true;
        }
      });

      task.startDate = minStart;
      task.finishDate = maxFinish;
      task.earlyStart = minStart;
      task.earlyFinish = maxFinish;
      task.duration = getWorkingDaysBetween(minStart, maxFinish, calendar);
      task.totalCost = sumCost;
      task.percentComplete = sumWeight > 0 ? Math.round(sumWeightedProgress / sumWeight) : 0;
      task.isCritical = hasCritical;
    }
  }
}
