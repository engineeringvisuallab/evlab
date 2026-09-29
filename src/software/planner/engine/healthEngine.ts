import { Project, ProjectHealthMetrics } from '../types';
import { auditScheduleDCMA } from './dcmaEngine';
import { calculateEVM } from './evmEngine';
import { analyzeResourceWorkload } from './resourceEngine';

/**
 * Calculates quantitative project health score (0 - 100) and drivers
 */
export function calculateProjectHealth(project: Project): ProjectHealthMetrics {
  const evm = calculateEVM(project);
  const resourceWorkload = analyzeResourceWorkload(project);
  const dcma = auditScheduleDCMA(project);

  let score = 100;
  const drivers: string[] = [];

  // 1. SPI Penalties (30% weight)
  if (evm.spi < 0.85) {
    score -= 25;
    drivers.push(`Critical Schedule Slippage: SPI is ${evm.spi} (Target >= 0.95)`);
  } else if (evm.spi < 0.95) {
    score -= 10;
    drivers.push(`Moderate Schedule Delay: SPI is ${evm.spi}`);
  }

  // 2. CPI Penalties (25% weight)
  if (evm.cpi < 0.85) {
    score -= 20;
    drivers.push(`Significant Cost Overrun: CPI is ${evm.cpi} (Target >= 0.95)`);
  } else if (evm.cpi < 0.95) {
    score -= 10;
    drivers.push(`Slight Cost Overrun: CPI is ${evm.cpi}`);
  }

  // 3. Resource Overallocations (15% weight)
  const overallocatedCount = resourceWorkload.filter((r) => r.overallocatedDaysCount > 0).length;
  if (overallocatedCount > 0) {
    score -= Math.min(15, overallocatedCount * 5);
    drivers.push(`${overallocatedCount} key resource(s) overallocated`);
  }

  // 4. DCMA Schedule Integrity (15% weight)
  if (dcma.overallPassRate < 70) {
    score -= 15;
    drivers.push(`Poor Schedule Quality: DCMA Audit Score ${dcma.overallPassRate}%`);
  } else if (dcma.overallPassRate < 85) {
    score -= 8;
    drivers.push(`Sub-optimal Schedule Logic: DCMA Audit Score ${dcma.overallPassRate}%`);
  }

  // 5. Unmitigated High Risks (15% weight)
  const openHighRisks = (project.risks || []).filter(
    (r) => r.status === 'Open' && r.riskScore >= 12
  );
  if (openHighRisks.length > 0) {
    score -= Math.min(15, openHighRisks.length * 5);
    drivers.push(`${openHighRisks.length} unmitigated high risk(s) active`);
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let status: 'Green' | 'Amber' | 'Red' = 'Green';
  if (finalScore < 70) {
    status = 'Red';
  } else if (finalScore < 85) {
    status = 'Amber';
  }

  if (drivers.length === 0) {
    drivers.push('All schedule, cost, resource, and risk performance metrics are within green thresholds.');
  }

  return {
    healthScore: finalScore,
    status,
    scheduleVarianceDays: evm.sv < 0 ? Math.round(Math.abs(evm.sv) / 1000) : 0, // approximate day equivalency
    costVariancePct: evm.bac > 0 ? Math.round((evm.cv / evm.bac) * 100) : 0,
    criticalPathRiskPct: Math.round(((project.tasks.filter((t) => t.isCritical).length) / Math.max(1, project.tasks.length)) * 100),
    overallocatedResourceCount: overallocatedCount,
    openHighRisksCount: openHighRisks.length,
    drivers,
  };
}
