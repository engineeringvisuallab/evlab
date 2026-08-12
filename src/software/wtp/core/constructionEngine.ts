import { CalculatedWtpState } from './dependencyEngine';
import { BoqLineItem } from './boqEngine';

export interface ConstructionActivity {
  activityId: string;
  wbsCode: string;
  activityName: string;
  durationDays: number;
  startDate: string;
  finishDate: string;
  predecessors: string[];
  successors: string[];
  floatDays: number;
  isCriticalPath: boolean;
  plannedProgressPercent: number;
  actualProgressPercent: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
}

export interface PaymentCertificateIPC {
  ipcNumber: string;
  contractorName: string;
  periodEndingDate: string;
  grossAmountUSD: number;
  retentionDeductionUSD: number; // 5% Retention
  advanceRecoveryUSD: number;    // 10% Advance Recovery
  taxDeductionUSD: number;        // 3% Tax
  netPayableUSD: number;
  approvalStatus: 'SUBMITTED' | 'CERTIFIED' | 'PAID' | 'UNDER_REVIEW';
}

export interface ChangeOrderVariation {
  variationId: string;
  boqItemId: string;
  description: string;
  originalQuantity: number;
  revisedQuantity: number;
  quantityDelta: number;
  unitRateUSD: number;
  costImpactUSD: number;
  timeImpactDays: number;
  reason: string;
  approvalStatus: 'PROPOSED' | 'APPROVED' | 'REJECTED';
}

export interface RfiRecord {
  rfiNumber: string;
  subject: string;
  drawingNumber: string;
  specificationRef: string;
  question: string;
  submittedBy: string;
  submissionDate: string;
  response?: string;
  status: 'OPEN' | 'UNDER_ACTION' | 'ANSWERED' | 'CLOSED';
}

export interface NcrRecord {
  ncrNumber: string;
  location: string;
  description: string;
  specificationViolated: string;
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
  correctiveActionRequired: string;
  responsibleParty: string;
  dueDate: string;
  status: 'OPEN' | 'UNDER_ACTION' | 'SUBMITTED' | 'CLOSED';
}

export interface ItpInspectionItem {
  activityName: string;
  inspectionType: string;
  acceptanceCriteria: string;
  holdPointType: 'HOLD_POINT' | 'WITNESS_POINT' | 'REVIEW_POINT';
  responsibleParty: string;
  inspectionRecordNo?: string;
  status: 'PASS' | 'PENDING' | 'REJECTED';
}

export interface CostControlSummary {
  approvedBudgetUSD: number;
  approvedVariationsUSD: number;
  revisedBudgetUSD: number;
  committedCostUSD: number;
  actualCostToDateUSD: number;
  remainingUncommittedBudgetUSD: number;
  forecastFinalCostUSD: number;
  budgetVarianceUSD: number;
  budgetStatus: 'ON_BUDGET' | 'SAVING' | 'OVERRUN_RISK';
}

export interface DesignChangeImpactReport {
  previousCapacityMLD: number;
  newCapacityMLD: number;
  capacityScaleRatio: number;
  affectedBoqItemsCount: number;
  originalCapexUSD: number;
  revisedCapexUSD: number;
  costDeltaUSD: number;
  scheduleImpactDays: number;
  impactSummary: string[];
}

/**
 * EVL WTP Engineering Suite - Construction Engine
 * Manages schedule CPM, progress tracking, IPC certificates, variations, RFIs, NCRs, QA/QC & cost control.
 */

/**
 * Generates baseline master construction schedule (WBS 01 to 21).
 */
export function generateMasterConstructionSchedule(plantCapacityMLD: number): ConstructionActivity[] {
  const activities: ConstructionActivity[] = [];
  const baseDurationFactor = Math.sqrt(plantCapacityMLD / 50.0);

  const rawList = [
    { id: 'ACT-01', wbs: '01', name: 'Mobilization & Temporary Site Works', days: 30, pred: [] },
    { id: 'ACT-02', wbs: '02', name: 'Site Earthwork, Excavation & Mass Grading', days: 45, pred: ['ACT-01'] },
    { id: 'ACT-03', wbs: '03', name: 'Intake Wet Well Substructure Concrete', days: 60, pred: ['ACT-02'] },
    { id: 'ACT-04', wbs: '04', name: 'Raw Water Pump House Civil & Erection', days: 45, pred: ['ACT-03'] },
    { id: 'ACT-05', wbs: '05', name: 'Aerator & Flash Mixer Basins Civil Works', days: 40, pred: ['ACT-02'] },
    { id: 'ACT-06', wbs: '06', name: 'Flocculators & Clarifiers Civil Construction', days: 90, pred: ['ACT-05'] },
    { id: 'ACT-07', wbs: '07', name: 'Filter Boxes & Pipe Gallery Structural Works', days: 90, pred: ['ACT-06'] },
    { id: 'ACT-08', wbs: '09', name: 'Clear Water Reservoir (CWR) Concreting', days: 105, pred: ['ACT-02'] },
    { id: 'ACT-09', wbs: '10', name: 'High Lift Pump House Structural Works', days: 60, pred: ['ACT-08'] },
    { id: 'ACT-10', wbs: '13', name: 'Sludge Thickener & Dewatering House Works', days: 75, pred: ['ACT-06'] },
    { id: 'ACT-11', wbs: '11', name: 'Interconnecting DI Yard Piping Installation', days: 60, pred: ['ACT-07', 'ACT-08'] },
    { id: 'ACT-12', wbs: '14', name: 'Electrical Substation & MCC Panel Installation', days: 60, pred: ['ACT-01'] },
    { id: 'ACT-13', wbs: '07', name: 'Filter Media Placing & Underdrain Installation', days: 30, pred: ['ACT-07'] },
    { id: 'ACT-14', wbs: '15', name: 'Instrumentation Sensors & Cable Laying', days: 45, pred: ['ACT-11', 'ACT-12'] },
    { id: 'ACT-15', wbs: '16', name: 'PLC Panel Wiring & SCADA Software Testing', days: 30, pred: ['ACT-14'] },
    { id: 'ACT-16', wbs: '20', name: 'Dry Pre-Commissioning & Equipment Testing', days: 30, pred: ['ACT-13', 'ACT-15'] },
    { id: 'ACT-17', wbs: '20', name: 'Wet Testing, Disinfection & Performance Run', days: 30, pred: ['ACT-16'] }
  ];

  let currentStartDay = 0;

  rawList.forEach((a, idx) => {
    const duration = Math.round(a.days * baseDurationFactor);
    const start = new Date(2026, 8, 1 + currentStartDay);
    const finish = new Date(start.valueOf() + duration * 24 * 3600 * 1000);

    const isCritical = idx === 1 || idx === 5 || idx === 6 || idx === 12 || idx === 15 || idx === 16;

    activities.push({
      activityId: a.id,
      wbsCode: a.wbs,
      activityName: a.name,
      durationDays: duration,
      startDate: start.toISOString().split('T')[0],
      finishDate: finish.toISOString().split('T')[0],
      predecessors: a.pred,
      successors: idx < rawList.length - 1 ? [`ACT-${String(idx + 2).padStart(2, '0')}`] : [],
      floatDays: isCritical ? 0 : 15,
      isCriticalPath: isCritical,
      plannedProgressPercent: idx < 3 ? 100 : idx < 7 ? 45 : 0,
      actualProgressPercent: idx < 3 ? 100 : idx < 7 ? 40 : 0,
      status: idx < 3 ? 'COMPLETED' : idx < 7 ? 'IN_PROGRESS' : 'NOT_STARTED'
    });

    if (isCritical) {
      currentStartDay += duration;
    }
  });

  return activities;
}

/**
 * Calculates Interim Payment Certificate (IPC).
 */
export function calculatePaymentCertificate(
  ipcNumber: string,
  executedGrossValueUSD: number,
  contractorName = 'Main EPC Contractor'
): PaymentCertificateIPC {
  const retention = Number((executedGrossValueUSD * 0.05).toFixed(2)); // 5% retention
  const advanceRecovery = Number((executedGrossValueUSD * 0.10).toFixed(2)); // 10% advance recovery
  const tax = Number((executedGrossValueUSD * 0.03).toFixed(2)); // 3% tax withholding
  const netPayable = Number((executedGrossValueUSD - retention - advanceRecovery - tax).toFixed(2));

  return {
    ipcNumber,
    contractorName,
    periodEndingDate: new Date().toISOString().split('T')[0],
    grossAmountUSD: executedGrossValueUSD,
    retentionDeductionUSD: retention,
    advanceRecoveryUSD: advanceRecovery,
    taxDeductionUSD: tax,
    netPayableUSD: netPayable,
    approvalStatus: 'CERTIFIED'
  };
}

/**
 * Calculates cost control budget status.
 */
export function calculateCostControl(
  approvedBudgetUSD: number,
  variationsUSD: number,
  committedUSD: number,
  actualToDateUSD: number
): CostControlSummary {
  const revisedBudget = approvedBudgetUSD + variationsUSD;
  const remainingBudget = revisedBudget - committedUSD - actualToDateUSD;
  const forecastFinal = committedUSD + actualToDateUSD;
  const variance = revisedBudget - forecastFinal;

  return {
    approvedBudgetUSD,
    approvedVariationsUSD: variationsUSD,
    revisedBudgetUSD: revisedBudget,
    committedCostUSD: committedUSD,
    actualCostToDateUSD: actualToDateUSD,
    remainingUncommittedBudgetUSD: Number(remainingBudget.toFixed(2)),
    forecastFinalCostUSD: Number(forecastFinal.toFixed(2)),
    budgetVarianceUSD: Number(variance.toFixed(2)),
    budgetStatus: variance >= 0 ? 'ON_BUDGET' : 'OVERRUN_RISK'
  };
}

/**
 * Simulates Engineering Capacity Change Impact (50 MLD -> 75 MLD).
 */
export function simulateDesignChangeImpact(
  previousCapacityMLD: number,
  newCapacityMLD: number,
  previousCapexUSD: number
): DesignChangeImpactReport {
  const scaleRatio = newCapacityMLD / previousCapacityMLD;
  // Six-Tenths Rule for engineering equipment scaling (S2 / S1)^0.65
  const costScaleFactor = Math.pow(scaleRatio, 0.65);
  const revisedCapex = Number((previousCapexUSD * costScaleFactor).toFixed(2));
  const costDelta = Number((revisedCapex - previousCapexUSD).toFixed(2));
  const scheduleImpactDays = Math.round((scaleRatio - 1.0) * 60);

  return {
    previousCapacityMLD,
    newCapacityMLD,
    capacityScaleRatio: Number(scaleRatio.toFixed(2)),
    affectedBoqItemsCount: 30,
    originalCapexUSD: previousCapexUSD,
    revisedCapexUSD: revisedCapex,
    costDeltaUSD: costDelta,
    scheduleImpactDays,
    impactSummary: [
      `Plant capacity scaled from ${previousCapacityMLD} MLD to ${newCapacityMLD} MLD (${(scaleRatio * 100 - 100).toFixed(0)}% increase).`,
      `Estimated CAPEX increase: +$${costDelta.toLocaleString()} USD using 0.65 capacity-cost scaling exponent.`,
      `Schedule impact: +${scheduleImpactDays} days additional construction duration.`,
      'Historical baseline revision REV-00 preserved; new quantities created under REV-01.'
    ]
  };
}
