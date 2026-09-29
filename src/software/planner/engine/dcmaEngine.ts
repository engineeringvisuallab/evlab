import { DCMAAuditCheck, Project, Task } from '../types';

/**
 * DCMA 14-Point Schedule Quality Audit Engine ("Schedule Doctor")
 */
export function auditScheduleDCMA(project: Project): {
  checks: DCMAAuditCheck[];
  overallPassRate: number;
  totalErrorsCount: number;
} {
  const leafTasks = project.tasks.filter((t) => !t.isSummary);
  const totalTasks = Math.max(1, leafTasks.length);

  const checks: DCMAAuditCheck[] = [];

  // Check 1: Missing Predecessors (Target: < 5%)
  const missingPreds = leafTasks.filter((t) => (!t.predecessors || t.predecessors.length === 0) && t.wbs !== '1');
  const pct1 = Math.round((missingPreds.length / totalTasks) * 100);
  checks.push({
    id: 'c1',
    code: 'DCMA-01',
    name: 'Missing Predecessors',
    targetPct: 5,
    actualPct: pct1,
    status: pct1 <= 5 ? 'PASS' : pct1 <= 15 ? 'WARN' : 'FAIL',
    failingTasks: missingPreds.map((t) => ({ id: t.id, wbs: t.wbs, name: t.name, reason: 'Task has no predecessor dependency' })),
    description: 'Tasks missing predecessors (excluding project root). Should be less than 5% of total tasks.',
  });

  // Check 2: Missing Successors (Target: < 5%)
  const missingSuccs = leafTasks.filter((t) => (!t.successors || t.successors.length === 0) && !t.isMilestone);
  const pct2 = Math.round((missingSuccs.length / totalTasks) * 100);
  checks.push({
    id: 'c2',
    code: 'DCMA-02',
    name: 'Missing Successors',
    targetPct: 5,
    actualPct: pct2,
    status: pct2 <= 5 ? 'PASS' : pct2 <= 15 ? 'WARN' : 'FAIL',
    failingTasks: missingSuccs.map((t) => ({ id: t.id, wbs: t.wbs, name: t.name, reason: 'Task has no successor dependency' })),
    description: 'Non-milestone tasks missing successors. Should be less than 5% of total tasks.',
  });

  // Check 3: Leads / Negative Lag (Target: 0%)
  const leadTasks = leafTasks.filter((t) => t.predecessors?.some((p) => p.lagDays < 0));
  const pct3 = Math.round((leadTasks.length / totalTasks) * 100);
  checks.push({
    id: 'c3',
    code: 'DCMA-03',
    name: 'Negative Lag (Leads)',
    targetPct: 0,
    actualPct: pct3,
    status: pct3 === 0 ? 'PASS' : 'FAIL',
    failingTasks: leadTasks.map((t) => ({ id: t.id, wbs: t.wbs, name: t.name, reason: 'Task uses negative lag (lead time)' })),
    description: 'Relationships using negative lag (leads). Leads distort critical path calculation and should be 0%.',
  });

  // Check 4: Positive Lags (Target: < 5%)
  const lagTasks = leafTasks.filter((t) => t.predecessors?.some((p) => p.lagDays > 0));
  const pct4 = Math.round((lagTasks.length / totalTasks) * 100);
  checks.push({
    id: 'c4',
    code: 'DCMA-04',
    name: 'Positive Lags',
    targetPct: 5,
    actualPct: pct4,
    status: pct4 <= 5 ? 'PASS' : 'WARN',
    failingTasks: lagTasks.map((t) => ({ id: t.id, wbs: t.wbs, name: t.name, reason: 'Task uses positive lag' })),
    description: 'Relationships using positive lag. Excessive lags hide true task relationships.',
  });

  // Check 5: Relationship Types (Target: > 90% FS)
  let totalRels = 0;
  let nonFsRels = 0;
  leafTasks.forEach((t) => {
    t.predecessors?.forEach((p) => {
      totalRels++;
      if (p.type !== 'FS') nonFsRels++;
    });
  });
  const pct5 = totalRels > 0 ? Math.round((nonFsRels / totalRels) * 100) : 0;
  checks.push({
    id: 'c5',
    code: 'DCMA-05',
    name: 'Non-FS Relationships',
    targetPct: 10,
    actualPct: pct5,
    status: pct5 <= 10 ? 'PASS' : 'WARN',
    failingTasks: leafTasks
      .filter((t) => t.predecessors?.some((p) => p.type !== 'FS'))
      .map((t) => ({ id: t.id, wbs: t.wbs, name: t.name, reason: 'Task uses non-Finish-to-Start relationship (SS/FF/SF)' })),
    description: 'Percentage of non-Finish-to-Start dependencies. Standard FS should represent 90%+ of relationships.',
  });

  // Check 6: Hard Constraints (Target: < 5%)
  const hardConstraints = leafTasks.filter((t) => t.constraintType === 'MSO' || t.constraintType === 'MFO');
  const pct6 = Math.round((hardConstraints.length / totalTasks) * 100);
  checks.push({
    id: 'c6',
    code: 'DCMA-06',
    name: 'Hard Constraints',
    targetPct: 5,
    actualPct: pct6,
    status: pct6 <= 5 ? 'PASS' : 'FAIL',
    failingTasks: hardConstraints.map((t) => ({ id: t.id, wbs: t.wbs, name: t.name, reason: `Task has hard constraint (${t.constraintType})` })),
    description: 'Must-Start-On / Must-Finish-On constraints override CPM network logic and should be avoided.',
  });

  // Check 7: High Float (> 44 working days, Target: < 5%)
  const highFloat = leafTasks.filter((t) => t.totalFloat > 44);
  const pct7 = Math.round((highFloat.length / totalTasks) * 100);
  checks.push({
    id: 'c7',
    code: 'DCMA-07',
    name: 'Excessive Float (>44 days)',
    targetPct: 5,
    actualPct: pct7,
    status: pct7 <= 5 ? 'PASS' : 'WARN',
    failingTasks: highFloat.map((t) => ({ id: t.id, wbs: t.wbs, name: t.name, reason: `Total float is ${t.totalFloat} days` })),
    description: 'Tasks with total float exceeding 2 working months (44 days), suggesting missing successor links.',
  });

  // Check 8: Negative Float (Target: 0%)
  const negFloat = leafTasks.filter((t) => t.totalFloat < 0);
  const pct8 = Math.round((negFloat.length / totalTasks) * 100);
  checks.push({
    id: 'c8',
    code: 'DCMA-08',
    name: 'Negative Float',
    targetPct: 0,
    actualPct: pct8,
    status: pct8 === 0 ? 'PASS' : 'FAIL',
    failingTasks: negFloat.map((t) => ({ id: t.id, wbs: t.wbs, name: t.name, reason: `Negative float of ${t.totalFloat} days` })),
    description: 'Tasks with negative total float. Indicates the schedule is behind required completion date.',
  });

  // Check 9: High Duration (> 44 working days, Target: < 5%)
  const highDur = leafTasks.filter((t) => t.duration > 44 && !t.isSummary);
  const pct9 = Math.round((highDur.length / totalTasks) * 100);
  checks.push({
    id: 'c9',
    code: 'DCMA-09',
    name: 'High Task Duration (>44 days)',
    targetPct: 5,
    actualPct: pct9,
    status: pct9 <= 5 ? 'PASS' : 'WARN',
    failingTasks: highDur.map((t) => ({ id: t.id, wbs: t.wbs, name: t.name, reason: `Duration is ${t.duration} working days` })),
    description: 'Detailed work tasks exceeding 2 months duration should be broken down into sub-tasks.',
  });

  // Check 10: Unassigned Resources (Target: < 10%)
  const unassigned = leafTasks.filter((t) => (!t.resourceIds || t.resourceIds.length === 0) && !t.isMilestone);
  const pct10 = Math.round((unassigned.length / totalTasks) * 100);
  checks.push({
    id: 'c10',
    code: 'DCMA-10',
    name: 'Unassigned Resources',
    targetPct: 10,
    actualPct: pct10,
    status: pct10 <= 10 ? 'PASS' : 'WARN',
    failingTasks: unassigned.map((t) => ({ id: t.id, wbs: t.wbs, name: t.name, reason: 'Task has no assigned resource' })),
    description: 'Work tasks missing resource assignments.',
  });

  // Overall pass rate calculation
  const passCount = checks.filter((c) => c.status === 'PASS').length;
  const overallPassRate = Math.round((passCount / checks.length) * 100);
  const totalErrorsCount = checks.reduce((sum, c) => sum + c.failingTasks.length, 0);

  return { checks, overallPassRate, totalErrorsCount };
}
