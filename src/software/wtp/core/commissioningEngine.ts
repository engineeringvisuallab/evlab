import { CalculatedWtpState } from './dependencyEngine';

export interface PreCommissioningTask {
  taskId: string;
  discipline: 'CIVIL' | 'MECHANICAL' | 'ELECTRICAL' | 'INSTRUMENTATION' | 'PIPING';
  taskDescription: string;
  verificationMethod: string;
  status: 'COMPLETED' | 'PENDING' | 'IN_PROGRESS';
  signOffEngineer: string;
}

export interface DryCommissioningCheck {
  checkId: string;
  subsystem: string;
  testDescription: string;
  result: 'PASS' | 'FAIL' | 'PENDING';
  interlockVerified: boolean;
}

export interface WetCommissioningStage {
  stageId: string;
  unitName: string;
  waterFillingStatus: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  leakageObserved: boolean;
  dosingSystemVerified: boolean;
  backwashVerified: boolean;
  stageStatus: 'PASSED' | 'PENDING';
}

export interface PerformanceTestRecord {
  testId: string;
  parameterName: string;
  designTarget: string;
  actualMeasured: string;
  unit: string;
  testDurationHours: number;
  status: 'PASS' | 'FAIL';
}

export interface HandoverItem {
  itemId: string;
  documentType: 'AS_BUILT_DRAWING' | 'OM_MANUAL' | 'EQUIPMENT_DATASHEET' | 'TEST_CERTIFICATE' | 'TRAINING_RECORD' | 'SPARE_PARTS' | 'WARRANTY' | 'ASSET_REGISTER';
  description: string;
  status: 'DELIVERED_AND_APPROVED' | 'SUBMITTED' | 'PENDING';
  recipient: string;
}

export function generateCommissioningEngine(state: CalculatedWtpState) {
  const preCommissioning: PreCommissioningTask[] = [
    {
      taskId: 'PRE-CIV-001',
      discipline: 'CIVIL',
      taskDescription: 'Reservoir cleaning, flushing & disinfection certification',
      verificationMethod: 'Visual inspection & water swab test',
      status: 'COMPLETED',
      signOffEngineer: 'Lead Civil Engineer'
    },
    {
      taskId: 'PRE-PIP-001',
      discipline: 'PIPING',
      taskDescription: 'Process pipe network line flushing & hydrotest clearance',
      verificationMethod: 'Pressure chart recorder logs',
      status: 'COMPLETED',
      signOffEngineer: 'Piping QC Engineer'
    },
    {
      taskId: 'PRE-MEC-001',
      discipline: 'MECHANICAL',
      taskDescription: 'Pump motor uncoupled rotation check & alignment verification',
      verificationMethod: 'Dial indicator alignment check',
      status: 'COMPLETED',
      signOffEngineer: 'Mechanical Engineer'
    },
    {
      taskId: 'PRE-ELE-001',
      discipline: 'ELECTRICAL',
      taskDescription: 'Substation megger test, phase rotation & relay calibration',
      verificationMethod: 'Secondary injection test set log',
      status: 'COMPLETED',
      signOffEngineer: 'Electrical Engineer'
    },
    {
      taskId: 'PRE-INS-001',
      discipline: 'INSTRUMENTATION',
      taskDescription: 'Instrument cold loop check from field device to PLC I/O card',
      verificationMethod: 'Point-to-point wiring continuity test',
      status: 'COMPLETED',
      signOffEngineer: 'Instrumentation Engineer'
    }
  ];

  const dryCommissioning: DryCommissioningCheck[] = [
    {
      checkId: 'DRY-001',
      subsystem: 'Intake Pump House MCC',
      testDescription: 'Dry bump start of pumps & remote start/stop logic from SCADA',
      result: 'PASS',
      interlockVerified: true
    },
    {
      checkId: 'DRY-002',
      subsystem: 'Chemical Dosing Skids',
      testDescription: 'Variable speed drive (VSD) stroke calibration & signal 4-20mA response',
      result: 'PASS',
      interlockVerified: true
    },
    {
      checkId: 'DRY-003',
      subsystem: 'Filter Backwash Blowers',
      testDescription: 'Air scour valve actuation sequencing & motor current trip protection',
      result: 'PASS',
      interlockVerified: true
    }
  ];

  const wetCommissioning: WetCommissioningStage[] = [
    {
      stageId: 'WET-001',
      unitName: 'Aerator & Flash Mixer',
      waterFillingStatus: 'COMPLETED',
      leakageObserved: false,
      dosingSystemVerified: true,
      backwashVerified: false,
      stageStatus: 'PASSED'
    },
    {
      stageId: 'WET-002',
      unitName: 'Lamella Clarifier Units',
      waterFillingStatus: 'COMPLETED',
      leakageObserved: false,
      dosingSystemVerified: true,
      backwashVerified: false,
      stageStatus: 'PASSED'
    },
    {
      stageId: 'WET-003',
      unitName: 'Rapid Gravity Filters',
      waterFillingStatus: 'COMPLETED',
      leakageObserved: false,
      dosingSystemVerified: true,
      backwashVerified: true,
      stageStatus: 'PASSED'
    }
  ];

  const performanceTests: PerformanceTestRecord[] = [
    {
      testId: 'PERF-001',
      parameterName: 'Total Plant Water Production Capacity',
      designTarget: `${state.plantCapacityMLD || 100} MLD`,
      actualMeasured: `${(state.plantCapacityMLD || 100) * 1.02} MLD`,
      unit: 'MLD',
      testDurationHours: 72,
      status: 'PASS'
    },
    {
      testId: 'PERF-002',
      parameterName: 'Treated Water Turbidity',
      designTarget: '< 0.5 NTU',
      actualMeasured: '0.18 NTU',
      unit: 'NTU',
      testDurationHours: 72,
      status: 'PASS'
    },
    {
      testId: 'PERF-003',
      parameterName: 'Clear Water Residual Free Chlorine',
      designTarget: '1.2 - 1.8 mg/L',
      actualMeasured: '1.50 mg/L',
      unit: 'mg/L',
      testDurationHours: 72,
      status: 'PASS'
    },
    {
      testId: 'PERF-004',
      parameterName: 'Specific Electrical Energy Consumption',
      designTarget: '< 0.35 kWh/m³',
      actualMeasured: '0.29 kWh/m³',
      unit: 'kWh/m³',
      testDurationHours: 72,
      status: 'PASS'
    }
  ];

  const handoverItems: HandoverItem[] = [
    {
      itemId: 'HO-001',
      documentType: 'AS_BUILT_DRAWING',
      description: 'Master Multi-Discipline As-Built 2D CAD & BIM Model Package',
      status: 'DELIVERED_AND_APPROVED',
      recipient: 'Client Operations Division'
    },
    {
      itemId: 'HO-002',
      documentType: 'OM_MANUAL',
      description: 'Comprehensive Plant Operation & Maintenance Manuals (3 Volumes)',
      status: 'DELIVERED_AND_APPROVED',
      recipient: 'Plant Manager'
    },
    {
      itemId: 'HO-003',
      documentType: 'SPARE_PARTS',
      description: 'Mandatory 2-Year Capital & Commissioning Spare Parts Stock',
      status: 'DELIVERED_AND_APPROVED',
      recipient: 'Warehouse Supervisor'
    },
    {
      itemId: 'HO-004',
      documentType: 'TRAINING_RECORD',
      description: 'Operator & Maintenance Staff Certification Training Logs',
      status: 'DELIVERED_AND_APPROVED',
      recipient: 'HR & Operations Director'
    }
  ];

  return {
    preCommissioning,
    dryCommissioning,
    wetCommissioning,
    performanceTests,
    handoverItems,
    reliabilityRunDurationHours: 72,
    reliabilityRunStatus: 'PASSED_100_PERCENT_UPTIME',
    commissioningOverallStatus: 'COMMISSIONING_COMPLETE_PASSED'
  };
}
