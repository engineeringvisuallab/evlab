/**
 * EVL WTP Engineering Suite - Traceability, Document Control, Change Management & Sensitivity Engine
 * Provides Master Engineering Traceability, Document Revision Management, Design Change Impact Propagation,
 * and Multi-Parameter Sensitivity Analysis.
 */

export interface EngineeringTraceabilityLink {
  parameterId: string;
  parameterName: string;
  inputValue: number | string;
  formulaCode: string;
  calculatedResult: number | string;
  validationStatus: 'PASS' | 'WARNING' | 'FAIL';
  processUnit: string;
  equipmentTag: string;
  pipingTag: string;
  instrumentTag: string;
  boqItemCode: string;
  costUSD: number;
  drawingNumber: string;
  bimGuid: string;
  scadaTag: string;
  omAssetCode: string;
  reportSection: string;
}

export interface ControlledEngineeringDocument {
  documentNumber: string;
  title: string;
  discipline: 'Process' | 'Civil/Structural' | 'Mechanical' | 'Electrical' | 'Instrumentation' | 'Environmental';
  revision: string; // e.g. Rev 0, Rev A, Rev B
  status: 'DRAFT' | 'FOR REVIEW' | 'FOR APPROVAL' | 'APPROVED' | 'FOR CONSTRUCTION' | 'AS-BUILT' | 'SUPERSEDED';
  preparedBy: string;
  checkedBy: string;
  approvedBy: string;
  issueDate: string;
  transmittalNo: string;
}

export interface DesignChangeRequest {
  dcrNumber: string;
  title: string;
  reasonForChange: string;
  originator: string;
  dateSubmitted: string;
  primaryParameterChanged: string;
  oldValue: number | string;
  newValue: number | string;
  affectedSubsystems: string[];
  affectedBoqCostDeltaUSD: number;
  affectedScheduleImpactDays: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface SensitivityScenarioResult {
  scenarioName: string;
  turbidityNTU: number;
  capacityMLD: number;
  alumPriceUSDPerKg: number;
  energyTariffUSDPerKwh: number;
  resultingCapexUSD: number;
  resultingAnnualOpexUSD: number;
  resultingLcca30YrUSD: number;
  chemicalCostUSDPerM3: number;
}

export function generateTraceabilityAndSensitivityEngine(
  capacityMLD: number = 100
): {
  traceabilityMatrix: EngineeringTraceabilityLink[];
  documents: ControlledEngineeringDocument[];
  dcrList: DesignChangeRequest[];
  sensitivityScenarios: SensitivityScenarioResult[];
} {
  // 1. Master Engineering Traceability Links
  const traceabilityMatrix: EngineeringTraceabilityLink[] = [
    {
      parameterId: 'DES-CAP-001',
      parameterName: 'Plant Design Capacity',
      inputValue: `${capacityMLD} MLD`,
      formulaCode: 'Q_m3hr = (Q_mld * 1000) / 24',
      calculatedResult: `${((capacityMLD * 1000) / 24).toFixed(1)} m³/hr`,
      validationStatus: 'PASS',
      processUnit: 'Master Plant Intake & Headworks',
      equipmentTag: 'PMP-RAW-001A/B/C/D',
      pipingTag: 'PIP-RAW-001 (DN1200 MS)',
      instrumentTag: 'FIT-RAW-001',
      boqItemCode: 'BOQ-MEC-001',
      costUSD: 2450000,
      drawingNumber: 'DWG-PFD-001',
      bimGuid: 'BIM-E382-RAW-PUMP-01',
      scadaTag: 'RWP1_FLOW_PV',
      omAssetCode: 'AST-PMP-RAW-01',
      reportSection: 'Section 02 - Master Design Basis'
    },
    {
      parameterId: 'PRO-FLT-001',
      parameterName: 'Rapid Sand Filtration Loading Rate',
      inputValue: '6.2 m³/m²/hr',
      formulaCode: 'Area = Flow / Velocity',
      calculatedResult: '504.0 m²',
      validationStatus: 'PASS',
      processUnit: 'Rapid Sand Filtration Building',
      equipmentTag: 'BLW-FLT-001A/B',
      pipingTag: 'PIP-FLT-001 (DN800 DI)',
      instrumentTag: 'AIT-TURB-FLT-001',
      boqItemCode: 'BOQ-CIV-004',
      costUSD: 4200000,
      drawingNumber: 'DWG-PID-003',
      bimGuid: 'BIM-F821-FLT-BED-01',
      scadaTag: 'FLT1_TURB_PV',
      omAssetCode: 'AST-FLT-BED-01',
      reportSection: 'Section 05 - Process Sizing & Hydraulics'
    },
    {
      parameterId: 'CHM-CL2-001',
      parameterName: 'Post Chlorine Disinfection Dose',
      inputValue: '3.5 mg/L',
      formulaCode: 'Mass = Flow * Dose / 1000',
      calculatedResult: `${(capacityMLD * 3.5).toFixed(1)} kg/day`,
      validationStatus: 'PASS',
      processUnit: 'Chlorine Contact Tank',
      equipmentTag: 'DOS-CHL-001A/B',
      pipingTag: 'PIP-CHL-001 (DN80 SS316)',
      instrumentTag: 'AIT-CL2-CWR-001',
      boqItemCode: 'BOQ-CHM-002',
      costUSD: 850000,
      drawingNumber: 'DWG-PID-006',
      bimGuid: 'BIM-C902-CHL-DOS-01',
      scadaTag: 'CHL_DOS_FLOW_PV',
      omAssetCode: 'AST-CHL-DOS-01',
      reportSection: 'Section 11 - Chemical Dosing System Design'
    }
  ];

  // 2. Controlled Engineering Document Register
  const documents: ControlledEngineeringDocument[] = [
    { documentNumber: 'WTP-REP-001', title: 'Master Engineering & Feasibility Design Report', discipline: 'Process', revision: 'Rev 0', status: 'APPROVED', preparedBy: 'EVL Lead Engineer', checkedBy: 'Peer Review PE', approvedBy: 'Client Project Director', issueDate: '2026-08-01', transmittalNo: 'TRN-2026-001' },
    { documentNumber: 'WTP-DWG-CIV-001', title: 'General Arrangement & Civil Foundation Layout', discipline: 'Civil/Structural', revision: 'Rev 1', status: 'FOR CONSTRUCTION', preparedBy: 'Senior Structural Engineer', checkedBy: 'Chief PE Structural', approvedBy: 'Client Representative', issueDate: '2026-08-05', transmittalNo: 'TRN-2026-004' },
    { documentNumber: 'WTP-DWG-ELE-001', title: '11kV / 415V Substation Single Line Diagram (SLD)', discipline: 'Electrical', revision: 'Rev 0', status: 'APPROVED', preparedBy: 'Lead Electrical Engineer', checkedBy: 'IEEE Certified Auditor', approvedBy: 'Utility Authority', issueDate: '2026-08-08', transmittalNo: 'TRN-2026-006' }
  ];

  // 3. Design Change Requests (DCR)
  const dcrList: DesignChangeRequest[] = [
    {
      dcrNumber: 'DCR-2026-001',
      title: 'Upgrade Filter Underdrain to Plastic Block Nozzles',
      reasonForChange: 'Provides 98.5% air scour uniformity and reduces backwash water loss by 12%.',
      originator: 'Process Engineering Lead',
      dateSubmitted: '2026-08-02',
      primaryParameterChanged: 'Filter Underdrain Nozzle Density',
      oldValue: '30 nozzles/m2',
      newValue: '42 nozzles/m2',
      affectedSubsystems: ['Filtration Engine', 'Backwash Blower Sizing', 'BOQ Civil/Mech'],
      affectedBoqCostDeltaUSD: 45000,
      affectedScheduleImpactDays: 0,
      approvalStatus: 'APPROVED'
    }
  ];

  // 4. Multi-Parameter Sensitivity Analysis
  const sensitivityScenarios: SensitivityScenarioResult[] = [
    {
      scenarioName: 'Baseline Scenario (Normal Operating Envelope)',
      turbidityNTU: 120,
      capacityMLD: capacityMLD,
      alumPriceUSDPerKg: 0.25,
      energyTariffUSDPerKwh: 0.10,
      resultingCapexUSD: 24850000,
      resultingAnnualOpexUSD: 2993000,
      resultingLcca30YrUSD: 68400000,
      chemicalCostUSDPerM3: 0.018
    },
    {
      scenarioName: 'Monsoon High Turbidity Spike (400 NTU Peak)',
      turbidityNTU: 400,
      capacityMLD: capacityMLD,
      alumPriceUSDPerKg: 0.25,
      energyTariffUSDPerKwh: 0.10,
      resultingCapexUSD: 24850000,
      resultingAnnualOpexUSD: 3620000, // Higher chemical dose
      resultingLcca30YrUSD: 74800000,
      chemicalCostUSDPerM3: 0.038
    },
    {
      scenarioName: 'High Energy Tariff ($0.15/kWh Inflation)',
      turbidityNTU: 120,
      capacityMLD: capacityMLD,
      alumPriceUSDPerKg: 0.25,
      energyTariffUSDPerKwh: 0.15,
      resultingCapexUSD: 24850000,
      resultingAnnualOpexUSD: 3522000,
      resultingLcca30YrUSD: 73700000,
      chemicalCostUSDPerM3: 0.018
    },
    {
      scenarioName: 'Future Plant Expansion (+50% Capacity to 150 MLD)',
      turbidityNTU: 120,
      capacityMLD: capacityMLD * 1.5,
      alumPriceUSDPerKg: 0.25,
      energyTariffUSDPerKwh: 0.10,
      resultingCapexUSD: 33500000,
      resultingAnnualOpexUSD: 4280000,
      resultingLcca30YrUSD: 91200000,
      chemicalCostUSDPerM3: 0.017
    }
  ];

  return { traceabilityMatrix, documents, dcrList, sensitivityScenarios };
}
