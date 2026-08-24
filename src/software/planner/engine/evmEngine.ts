import { EVMMetrics, EVMPoint, Project } from '../types';
import { addWorkingDays, formatDate, getWorkingDaysBetween, parseDate } from './calendarUtils';

/**
 * Professional Earned Value Management (EVM) Calculation Engine
 */
export function calculateEVM(project: Project, asOfDateStr?: string): EVMMetrics {
  const cal = project.calendars?.[0];
  const today = asOfDateStr || formatDate(new Date());

  const tasks = project.tasks.filter((t) => !t.isSummary);
  const bac = tasks.reduce((sum, t) => sum + (t.baselineCost || t.totalCost || 0), 0);

  let pv = 0;
  let ev = 0;
  let ac = 0;

  tasks.forEach((task) => {
    const taskBac = task.baselineCost || task.totalCost || 0;
    const taskStart = task.baselineStart || task.startDate;
    const taskFinish = task.baselineFinish || task.finishDate;

    // 1. Earned Value (EV)
    let percent = task.percentComplete || 0;
    if (task.earnedValueMethod === 'PhysicalPercent' && task.physicalPercentComplete !== undefined) {
      percent = task.physicalPercentComplete;
    }
    ev += (taskBac * percent) / 100;

    // 2. Actual Cost (AC)
    if (task.actualCost !== undefined && task.actualCost > 0) {
      ac += task.actualCost;
    } else {
      // Estimate AC proportional to progress if actual cost not explicitly entered
      ac += (task.totalCost * percent) / 100;
    }

    // 3. Planned Value (PV) as of today
    if (today >= taskFinish) {
      pv += taskBac;
    } else if (today <= taskStart) {
      pv += 0;
    } else {
      // Linear planned progress
      const totalDays = getWorkingDaysBetween(taskStart, taskFinish, cal);
      const elapsedDays = getWorkingDaysBetween(taskStart, today, cal);
      const pctPlanned = totalDays > 0 ? Math.min(1, elapsedDays / totalDays) : 1;
      pv += taskBac * pctPlanned;
    }
  });

  // Variances
  const cv = ev - ac; // Cost Variance
  const sv = ev - pv; // Schedule Variance

  // Performance Indexes
  const cpi = ac > 0 ? Number((ev / ac).toFixed(2)) : 1.0;
  const spi = pv > 0 ? Number((ev / pv).toFixed(2)) : 1.0;

  // Forecasts
  const eac = cpi > 0 ? Number((bac / cpi).toFixed(0)) : bac; // Estimate At Completion
  const etc = Math.max(0, eac - ac); // Estimate To Complete
  const vac = bac - eac; // Variance At Completion

  // To-Complete Performance Index (TCPI)
  const remainingWork = bac - ev;
  const remainingBudget = bac - ac;
  const tcpi = remainingBudget > 0 ? Number((remainingWork / remainingBudget).toFixed(2)) : 1.0;

  // Generate S-Curve points monthly/weekly across project timeline
  const sCurvePoints = generateSCurvePoints(project);

  return {
    pv: Math.round(pv),
    ev: Math.round(ev),
    ac: Math.round(ac),
    bac: Math.round(bac),
    cv: Math.round(cv),
    sv: Math.round(sv),
    cpi,
    spi,
    eac: Math.round(eac),
    etc: Math.round(etc),
    vac: Math.round(vac),
    tcpi,
    sCurvePoints,
  };
}

function generateSCurvePoints(project: Project): EVMPoint[] {
  const points: EVMPoint[] = [];
  if (!project.tasks || project.tasks.length === 0) return points;

  const cal = project.calendars?.[0];
  const startDate = parseDate(project.startDate);
  const finishDate = parseDate(project.calculatedFinishDate || project.plannedCompletionDate || project.startDate);

  // Take up to 12 sample checkpoints across duration
  const totalDays = Math.max(1, Math.round((finishDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));
  const stepDays = Math.max(7, Math.floor(totalDays / 10));

  let current = new Date(startDate);
  const todayStr = formatDate(new Date());

  const leafTasks = project.tasks.filter((t) => !t.isSummary);
  const bac = leafTasks.reduce((sum, t) => sum + (t.baselineCost || t.totalCost || 0), 0);

  while (current <= finishDate || points.length < 2) {
    const dStr = formatDate(current);

    let cumulativePV = 0;
    let cumulativeEV = 0;
    let cumulativeAC = 0;

    leafTasks.forEach((t) => {
      const taskBac = t.baselineCost || t.totalCost || 0;
      const tStart = t.baselineStart || t.startDate;
      const tFinish = t.baselineFinish || t.finishDate;

      // Cumulative PV
      if (dStr >= tFinish) {
        cumulativePV += taskBac;
      } else if (dStr > tStart) {
        const dur = getWorkingDaysBetween(tStart, tFinish, cal);
        const elapsed = getWorkingDaysBetween(tStart, dStr, cal);
        cumulativePV += taskBac * (dur > 0 ? Math.min(1, elapsed / dur) : 1);
      }

      // Cumulative EV & AC only up to today
      if (dStr <= todayStr) {
        const pct = t.percentComplete || 0;
        cumulativeEV += (taskBac * pct) / 100;
        const actualCost = t.actualCost !== undefined && t.actualCost > 0 ? t.actualCost : (t.totalCost * pct) / 100;
        cumulativeAC += actualCost;
      }
    });

    points.push({
      date: dStr,
      pv: Math.round(cumulativePV),
      ev: dStr <= todayStr ? Math.round(cumulativeEV) : Math.round(leafTasks.reduce((s, t) => s + (t.baselineCost || t.totalCost || 0) * (t.percentComplete / 100), 0)),
      ac: dStr <= todayStr ? Math.round(cumulativeAC) : Math.round(leafTasks.reduce((s, t) => s + (t.totalCost * (t.percentComplete / 100)), 0)),
    });

    current.setDate(current.getDate() + stepDays);
    if (points.length >= 15) break;
  }

  return points;
}
