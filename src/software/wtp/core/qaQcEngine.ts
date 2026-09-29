import { CalculatedWtpState } from './dependencyEngine';

export interface ItpActivity {
  activityId: string;
  discipline: 'CIVIL' | 'MECHANICAL' | 'ELECTRICAL' | 'INSTRUMENTATION' | 'PIPING' | 'PAINTING' | 'COMMISSIONING';
  activityDescription: string;
  inspectionFrequency: string;
  acceptanceCriteria: string;
  governingStandard: string;
  holdPointType: 'HOLD' | 'WITNESS' | 'REVIEW' | 'SURVEILLANCE';
  responsibleParty: 'CONTRACTOR' | 'CONSULTANT' | 'CLIENT' | 'VENDOR';
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
}

export interface MaterialTestRecord {
  testId: string;
  materialName: string;
  sampleBatchNo: string;
  testStandard: string;
  resultValue: string;
  acceptanceCriteria: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  certificateRef: string;
  testDate: string;
}

export interface FatWorkflowItem {
  fatId: string;
  equipmentTag: string;
  equipmentDescription: string;
  vendorName: string;
  datasheetRef: string;
  shopDrawingRef: string;
  fatProcedureRef: string;
  fatStatus: 'PROCEDURE_SUBMITTED' | 'FAT_SCHEDULED' | 'FAT_PASSED_WITH_PUNCH' | 'FAT_APPROVED';
  punchCount: number;
  acceptanceDate: string;
}

export interface SatWorkflowItem {
  satId: string;
  equipmentTag: string;
  installationStatus: 'INSTALLED' | 'ALIGNED' | 'WIRED' | 'CALIBRATED';
  satFunctionTest: 'PASS' | 'FAIL' | 'PENDING';
  satPerformanceTest: 'PASS' | 'FAIL' | 'PENDING';
  acceptanceStatus: 'ACCEPTED' | 'REJECTED' | 'CONDITIONAL';
  acceptanceDate: string;
}

export interface PunchItem {
  punchId: string;
  location: string;
  description: string;
  discipline: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  responsibleParty: string;
  dueDate: string;
  status: 'OPEN' | 'CLOSED';
  closureEvidence: string;
}

export function generateMasterQaQcEngine(state: CalculatedWtpState) {
  const itpMatrix: ItpActivity[] = [
    {
      activityId: 'ITP-CIV-001',
      discipline: 'CIVIL',
      activityDescription: 'Water Retaining Structure Concrete Pour & Slump Test',
      inspectionFrequency: 'Every 50 m³ or per batch',
      acceptanceCriteria: 'Slump 100 ± 20 mm, 28-day Compressive Strength ≥ 35 MPa',
      governingStandard: 'BS EN 206 / ACI 318',
      holdPointType: 'HOLD',
      responsibleParty: 'CONSULTANT',
      status: 'APPROVED'
    },
    {
      activityId: 'ITP-CIV-002',
      discipline: 'CIVIL',
      activityDescription: 'Hydrostatic Water Tightness Testing of Clear Water Reservoir',
      inspectionFrequency: '100% of water-retaining compartments',
      acceptanceCriteria: 'Water level drop ≤ 12 mm per 24 hrs after 7-day soak',
      governingStandard: 'ACI 350.1 / BS 8007',
      holdPointType: 'HOLD',
      responsibleParty: 'CONSULTANT',
      status: 'APPROVED'
    },
    {
      activityId: 'ITP-PIP-001',
      discipline: 'PIPING',
      activityDescription: 'Raw Water Main Hydrostatic Pressure Testing',
      inspectionFrequency: 'Every 500 m pipe section',
      acceptanceCriteria: 'Test Pressure 1.5 x Design Pressure (12.0 bar) maintained for 2 hrs with zero pressure drop',
      governingStandard: 'AWWA C600 / BS EN 805',
      holdPointType: 'HOLD',
      responsibleParty: 'CONSULTANT',
      status: 'APPROVED'
    },
    {
      activityId: 'ITP-MEC-001',
      discipline: 'MECHANICAL',
      activityDescription: 'Intake Pump Factory Acceptance Test (FAT) & Vibration Check',
      inspectionFrequency: '100% of Duty Pumps',
      acceptanceCriteria: 'Vibration velocity ≤ 2.8 mm/s RMS (ISO 10816 Class 3)',
      governingStandard: 'HI 14.6 / ISO 9906 Grade 1B',
      holdPointType: 'HOLD',
      responsibleParty: 'CLIENT',
      status: 'APPROVED'
    },
    {
      activityId: 'ITP-ELE-001',
      discipline: 'ELECTRICAL',
      activityDescription: 'Substation Transformer Dielectric Oil & High Voltage Insulation Resistance Test',
      inspectionFrequency: '100% of Transformers',
      acceptanceCriteria: 'Dielectric breakdown voltage ≥ 60 kV, Insulation Resistance > 1000 MΩ',
      governingStandard: 'IEC 60076 / IEEE C57.12',
      holdPointType: 'HOLD',
      responsibleParty: 'CONSULTANT',
      status: 'APPROVED'
    },
    {
      activityId: 'ITP-INS-001',
      discipline: 'INSTRUMENTATION',
      activityDescription: 'Flow Transmitter 5-Point Loop Calibration Verification',
      inspectionFrequency: '100% of Process Instruments',
      acceptanceCriteria: 'Accuracy error ≤ ± 0.2% of span across 0%, 25%, 50%, 75%, 100% range',
      governingStandard: 'ISA-TR20.00.01 / BS 7882',
      holdPointType: 'WITNESS',
      responsibleParty: 'CONSULTANT',
      status: 'APPROVED'
    }
  ];

  const materialTests: MaterialTestRecord[] = [
    {
      testId: 'MAT-CON-001',
      materialName: 'C35/45 Watertight Structural Concrete',
      sampleBatchNo: 'BATCH-2026-0810',
      testStandard: 'ASTM C39 / BS EN 12390',
      resultValue: '42.5 MPa (28-day average)',
      acceptanceCriteria: '≥ 35.0 MPa',
      status: 'PASS',
      certificateRef: 'CERT-LAB-8842',
      testDate: '2026-08-01'
    },
    {
      testId: 'MAT-REB-001',
      materialName: 'High Yield Deformed Rebar Grade 500D',
      sampleBatchNo: 'STEEL-500D-4412',
      testStandard: 'BS 4449 / ASTM A615',
      resultValue: 'Yield 540 MPa, Ultimate Tensile 630 MPa',
      acceptanceCriteria: 'Yield ≥ 500 MPa',
      status: 'PASS',
      certificateRef: 'CERT-STEEL-9921',
      testDate: '2026-08-03'
    },
    {
      testId: 'MAT-PIP-001',
      materialName: 'Ductile Iron Pipe Class K9 DN1200',
      sampleBatchNo: 'DIP-K9-8812',
      testStandard: 'ISO 2531 / BS EN 545',
      resultValue: 'Tensile 450 MPa, Elongation 12%',
      acceptanceCriteria: 'Tensile ≥ 420 MPa, Elongation ≥ 10%',
      status: 'PASS',
      certificateRef: 'CERT-DIP-1029',
      testDate: '2026-08-05'
    }
  ];

  const fatItems: FatWorkflowItem[] = [
    {
      fatId: 'FAT-PUMP-001',
      equipmentTag: 'RWP-001',
      equipmentDescription: 'Raw Water Intake Vertical Turbine Pump 1200 m³/h',
      vendorName: 'Flowserve / Sulzer',
      datasheetRef: 'DS-MEC-PUMP-001',
      shopDrawingRef: 'DWG-SHOP-RWP-001',
      fatProcedureRef: 'PROC-FAT-PUMP-01',
      fatStatus: 'FAT_APPROVED',
      punchCount: 0,
      acceptanceDate: '2026-07-25'
    },
    {
      fatId: 'FAT-XFMR-001',
      equipmentTag: 'TR-001',
      equipmentDescription: '2500 kVA 11kV/0.415kV Substation Transformer',
      vendorName: 'ABB / Siemens',
      datasheetRef: 'DS-ELE-TR-001',
      shopDrawingRef: 'DWG-SHOP-TR-001',
      fatProcedureRef: 'PROC-FAT-XFMR-01',
      fatStatus: 'FAT_APPROVED',
      punchCount: 0,
      acceptanceDate: '2026-07-28'
    }
  ];

  const satItems: SatWorkflowItem[] = [
    {
      satId: 'SAT-PUMP-001',
      equipmentTag: 'RWP-001',
      installationStatus: 'CALIBRATED',
      satFunctionTest: 'PASS',
      satPerformanceTest: 'PASS',
      acceptanceStatus: 'ACCEPTED',
      acceptanceDate: '2026-08-10'
    }
  ];

  const punchList: PunchItem[] = [
    {
      punchId: 'PUNCH-001',
      location: 'Intake Pump House Basement',
      description: 'Minor paint scratch on suction pipe flange surface',
      discipline: 'PAINTING',
      severity: 'MINOR',
      responsibleParty: 'Mechanical Contractor',
      dueDate: '2026-08-20',
      status: 'OPEN',
      closureEvidence: 'Pending touch-up epoxy coating re-application.'
    }
  ];

  return {
    itpMatrix,
    materialTests,
    fatItems,
    satItems,
    punchList,
    totalItpCount: itpMatrix.length,
    approvedItpCount: itpMatrix.filter(i => i.status === 'APPROVED').length,
    qaQcStatus: 'APPROVED'
  };
}
