import { CalculatedWtpState } from './dependencyEngine';

export interface AssetRegisterItem {
  assetId: string;
  equipmentTag: string;
  description: string;
  category: 'MECHANICAL' | 'ELECTRICAL' | 'INSTRUMENTATION' | 'CIVIL' | 'PROCESS';
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  installationDate: string;
  warrantyPeriodMonths: number;
  criticality: 'HIGH' | 'MEDIUM' | 'LOW';
  boqRefCode: string;
  bimGuid: string;
}

export interface MaintenanceTask {
  taskId: string;
  assetId: string;
  equipmentTag: string;
  taskDescription: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL' | '500_RUNNING_HOURS';
  responsibleRole: 'MECHANICAL_FITTER' | 'ELECTRICIAN' | 'INSTRUMENT_TECH' | 'OPERATOR';
  requiredTools: string[];
  estimatedMinutes: number;
  safetyRequirement: string;
}

export interface SparePartItem {
  spareId: string;
  equipmentTag: string;
  partName: string;
  partNumber: string;
  minimumStockQty: number;
  currentStockQty: number;
  leadTimeWeeks: number;
  unitCostUSD: number;
  reorderStatus: 'STOCK_OK' | 'REORDER_REQUIRED';
}

export interface CalibrationItem {
  instrumentTag: string;
  parameterName: string;
  calibrationIntervalMonths: number;
  lastCalibrationDate: string;
  nextDueDate: string;
  calibrationStandard: string;
  status: 'VALID' | 'DUE_SOON' | 'OVERDUE';
}

export interface SopFrameworkItem {
  sopId: string;
  title: string;
  category: 'STARTUP' | 'NORMAL' | 'SHUTDOWN' | 'EMERGENCY' | 'BACKWASH' | 'CHEMICAL_HANDLING';
  procedureSteps: string[];
  safetyWarnings: string[];
}

export function generateOmEngine(state: CalculatedWtpState) {
  const assets: AssetRegisterItem[] = [
    {
      assetId: 'AST-PUMP-001',
      equipmentTag: 'RWP-001',
      description: 'Raw Water Intake Vertical Turbine Pump 1200 m³/h',
      category: 'MECHANICAL',
      manufacturer: 'Flowserve Corporation',
      modelNumber: 'VTSP-350-4',
      serialNumber: 'SN-2026-98101',
      installationDate: '2026-06-15',
      warrantyPeriodMonths: 24,
      criticality: 'HIGH',
      boqRefCode: 'BOQ-MEC-PUMP-01',
      bimGuid: 'BIM-ELEM-INT-001'
    },
    {
      assetId: 'AST-XFMR-001',
      equipmentTag: 'TR-001',
      description: '2500 kVA 11kV/0.415kV Oil Immersed Substation Transformer',
      category: 'ELECTRICAL',
      manufacturer: 'ABB Power Grids',
      modelNumber: 'RESIBLOC-2500',
      serialNumber: 'SN-ABB-44102',
      installationDate: '2026-06-20',
      warrantyPeriodMonths: 36,
      criticality: 'HIGH',
      boqRefCode: 'BOQ-ELE-TR-01',
      bimGuid: 'BIM-ELEM-SUB-001'
    },
    {
      assetId: 'AST-FT-001',
      equipmentTag: 'FT-101',
      description: 'Electromagnetic Flowmeter DN1200 Raw Water Main',
      category: 'INSTRUMENTATION',
      manufacturer: 'Endress+Hauser',
      modelNumber: 'Promag W 400',
      serialNumber: 'SN-EH-99212',
      installationDate: '2026-07-01',
      warrantyPeriodMonths: 24,
      criticality: 'HIGH',
      boqRefCode: 'BOQ-INS-FT-01',
      bimGuid: 'BIM-ELEM-INT-002'
    }
  ];

  const pmTasks: MaintenanceTask[] = [
    {
      taskId: 'PM-PUMP-001',
      assetId: 'AST-PUMP-001',
      equipmentTag: 'RWP-001',
      taskDescription: 'Inspect mechanical seal leakage, check bearing temperature & grease thrust bearings',
      frequency: 'WEEKLY',
      responsibleRole: 'MECHANICAL_FITTER',
      requiredTools: ['Grease gun NLGI 2', 'Infrared Thermometer', 'Vibration Meter'],
      estimatedMinutes: 45,
      safetyRequirement: 'LOTO (Lockout/Tagout) mandatory during greasing.'
    },
    {
      taskId: 'PM-XFMR-001',
      assetId: 'AST-XFMR-001',
      equipmentTag: 'TR-001',
      taskDescription: 'Check oil level, silica gel breather color & transformer winding temperature controller',
      frequency: 'MONTHLY',
      responsibleRole: 'ELECTRICIAN',
      requiredTools: ['Insulated Gloves Class 0', 'Multimeter'],
      estimatedMinutes: 30,
      safetyRequirement: 'Arc flash PPE required inside substation room.'
    },
    {
      taskId: 'PM-FT-001',
      assetId: 'AST-FT-001',
      equipmentTag: 'FT-101',
      taskDescription: 'Clean transmitter optical sensor, check grounding rings & zero point verification',
      frequency: 'QUARTERLY',
      responsibleRole: 'INSTRUMENT_TECH',
      requiredTools: ['Calibration Communicator', 'Multimeter'],
      estimatedMinutes: 60,
      safetyRequirement: 'Wear safety harness if working on elevated platform.'
    }
  ];

  const spareParts: SparePartItem[] = [
    {
      spareId: 'SPR-PUMP-001',
      equipmentTag: 'RWP-001',
      partName: 'Mechanical Seal Cartridge Assembly DN150',
      partNumber: 'FLS-MS-150-C',
      minimumStockQty: 2,
      currentStockQty: 3,
      leadTimeWeeks: 6,
      unitCostUSD: 1850,
      reorderStatus: 'STOCK_OK'
    },
    {
      spareId: 'SPR-DOS-001',
      equipmentTag: 'DP-001',
      partName: 'Diaphragm Repair Kit for Chlorine Dosing Pump',
      partNumber: 'LMI-DP-KIT-02',
      minimumStockQty: 4,
      currentStockQty: 5,
      leadTimeWeeks: 2,
      unitCostUSD: 320,
      reorderStatus: 'STOCK_OK'
    }
  ];

  const calibrations: CalibrationItem[] = [
    {
      instrumentTag: 'FT-101',
      parameterName: 'Raw Water Flow Rate',
      calibrationIntervalMonths: 12,
      lastCalibrationDate: '2026-07-01',
      nextDueDate: '2027-07-01',
      calibrationStandard: 'ISO 17025 Certified Flow Rig',
      status: 'VALID'
    },
    {
      instrumentTag: 'AIT-201',
      parameterName: 'Clarified Water Turbidity',
      calibrationIntervalMonths: 3,
      lastCalibrationDate: '2026-07-15',
      nextDueDate: '2026-10-15',
      calibrationStandard: 'Formazin Primary Standard 400 NTU',
      status: 'VALID'
    }
  ];

  const sops: SopFrameworkItem[] = [
    {
      sopId: 'SOP-001',
      title: 'Full Plant Cold Start-Up Procedure',
      category: 'STARTUP',
      procedureSteps: [
        '1. Verify raw water intake gates are open and electrical power is energized on 11kV MCC.',
        '2. Start primary raw water pump RWP-001 in remote SCADA mode.',
        '3. Confirm alum and polymer dosing pumps start automatically upon flow detection > 500 L/s.',
        '4. Monitor lamella clarifier hydraulic retention and initiate sludge scraper drive.',
        '5. Open rapid gravity filter inlet penstocks and engage continuous turbidity monitoring.'
      ],
      safetyWarnings: [
        'Ensure all chemical line valves are open before starting dosing pumps to prevent line overpressurization.',
        'Wear chemical safety goggles and apron near alum dosing tanks.'
      ]
    },
    {
      sopId: 'SOP-002',
      title: 'Automated Filter Air Scour & Water Backwash Procedure',
      category: 'BACKWASH',
      procedureSteps: [
        '1. Close filter inlet penstock and allow water level to drain to top of media bed.',
        '2. Close filter outlet valve and start air scour blower BLW-001 for 3 minutes.',
        '3. Start washwater pump BWP-001 for low-rate air/water rinse (5 mins), then high-rate water backwash (8 mins).',
        '4. Open washwater waste trough gate to send dirty washwater to washwater recovery tank.',
        '5. Re-open filter inlet and perform filter-to-waste for 5 minutes before returning to service.'
      ],
      safetyWarnings: [
        'Never start air scour blower if filter water level is > 0.3m above media to prevent media loss.'
      ]
    }
  ];

  return {
    assets,
    pmTasks,
    spareParts,
    calibrations,
    sops,
    kpis: {
      dailyFlowMLD: state.plantCapacityMLD || 100,
      treatedWaterTurbidityNTU: 0.18,
      residualChlorineMgL: 1.5,
      specificEnergyKwhM3: 0.29,
      chemicalCostUsdM3: 0.018,
      waterRecoveryPct: (state as any).waterBalance?.recoveryPct || 96.5,
      plantUptimePct: 99.8,
      dataTypeLabel: 'DESIGN / SIMULATION DATA'
    }
  };
}
