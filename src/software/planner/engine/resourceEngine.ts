import { Project, Resource, Task } from '../types';
import { getWorkingDaysBetween, isWorkingDay } from './calendarUtils';

export interface ResourceDailyWork {
  date: string;
  hoursAllocated: number;
  maxHours: number;
  isOverallocated: boolean;
  assignedTasks: { taskId: string; taskName: string; hours: number }[];
}

export interface ResourceWorkloadReport {
  resource: Resource;
  totalAllocatedHours: number;
  overallocatedDaysCount: number;
  dailyBreakdown: ResourceDailyWork[];
}

/**
 * Calculates daily workload per resource and highlights overallocations
 */
export function analyzeResourceWorkload(project: Project): ResourceWorkloadReport[] {
  const reports: ResourceWorkloadReport[] = [];
  const cal = project.calendars?.[0];
  const stdHours = project.defaultHoursPerDay || 8;

  project.resources.forEach((res) => {
    // Max available hours per day
    const maxUnitsRatio = res.maxUnits ? res.maxUnits / 100 : 1.0; // 100% = 1.0
    const maxDailyHours = stdHours * maxUnitsRatio;

    // Find all tasks assigned to this resource
    const assignedTasks = project.tasks.filter(
      (t) => !t.isSummary && t.resourceIds && t.resourceIds.includes(res.id)
    );

    const dailyMap = new Map<string, { hoursAllocated: number; assignedTasks: { taskId: string; taskName: string; hours: number }[] }>();

    assignedTasks.forEach((task) => {
      const taskDays = getWorkingDaysBetween(task.startDate, task.finishDate, cal);
      if (taskDays <= 0) return;

      const dailyTaskHours = stdHours; // Assume standard 8 hrs/day per task per resource

      let current = new Date(task.startDate + 'T00:00:00');
      const end = new Date(task.finishDate + 'T00:00:00');

      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        if (isWorkingDay(dateStr, cal)) {
          const entry = dailyMap.get(dateStr) || { hoursAllocated: 0, assignedTasks: [] };
          entry.hoursAllocated += dailyTaskHours;
          entry.assignedTasks.push({
            taskId: task.id,
            taskName: task.name,
            hours: dailyTaskHours,
          });
          dailyMap.set(dateStr, entry);
        }
        current.setDate(current.getDate() + 1);
      }
    });

    let totalAllocatedHours = 0;
    let overallocatedDaysCount = 0;
    const dailyBreakdown: ResourceDailyWork[] = [];

    dailyMap.forEach((val, dateStr) => {
      totalAllocatedHours += val.hoursAllocated;
      const isOver = val.hoursAllocated > maxDailyHours;
      if (isOver) overallocatedDaysCount++;

      dailyBreakdown.push({
        date: dateStr,
        hoursAllocated: val.hoursAllocated,
        maxHours: maxDailyHours,
        isOverallocated: isOver,
        assignedTasks: val.assignedTasks,
      });
    });

    dailyBreakdown.sort((a, b) => a.date.localeCompare(b.date));

    reports.push({
      resource: res,
      totalAllocatedHours,
      overallocatedDaysCount,
      dailyBreakdown,
    });
  });

  return reports;
}

/**
 * Automated Resource Leveling Engine
 * Resolves resource overallocation by delaying non-critical tasks within total float
 */
export function levelResources(project: Project): {
  updatedTasks: Task[];
  levelledTaskCount: number;
  resolvedOverallocationsCount: number;
} {
  let taskCopies = project.tasks.map((t) => ({ ...t }));
  let levelledTaskCount = 0;

  const workloadBefore = analyzeResourceWorkload(project);
  const totalOverbefore = workloadBefore.reduce((s, r) => s + r.overallocatedDaysCount, 0);

  // Identify overallocated resources
  const overallocatedResIds = workloadBefore
    .filter((r) => r.overallocatedDaysCount > 0)
    .map((r) => r.resource.id);

  if (overallocatedResIds.length === 0) {
    return { updatedTasks: project.tasks, levelledTaskCount: 0, resolvedOverallocationsCount: 0 };
  }

  // Iterate tasks sorted by Total Float (ascending - level non-critical tasks with high float first)
  const candidateTasks = taskCopies.filter(
    (t) => !t.isSummary && !t.isCritical && t.totalFloat > 0 && t.resourceIds && t.resourceIds.some((r) => overallocatedResIds.includes(r))
  );

  candidateTasks.sort((a, b) => b.totalFloat - a.totalFloat); // Highest float first

  candidateTasks.forEach((task) => {
    if (task.totalFloat > 1) {
      // Delay task start date by 1-2 working days to resolve overlap
      const cal = project.calendars?.[0];
      const newStart = new Date(task.startDate + 'T00:00:00');
      newStart.setDate(newStart.getDate() + 2); // Shift start
      task.startDate = newStart.toISOString().split('T')[0];
      levelledTaskCount++;
    }
  });

  const workloadAfter = analyzeResourceWorkload({ ...project, tasks: taskCopies });
  const totalOverAfter = workloadAfter.reduce((s, r) => s + r.overallocatedDaysCount, 0);

  return {
    updatedTasks: taskCopies,
    levelledTaskCount,
    resolvedOverallocationsCount: Math.max(0, totalOverbefore - totalOverAfter),
  };
}
