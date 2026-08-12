/**
 * EVL WTP Engineering Suite - Water Quality Parameter Registry & Unit Converter
 * Master registry for physical, chemical, metals, microbiological, and disinfection water quality parameters.
 */

export type WqCategory = 'Physical' | 'Chemical' | 'Metals' | 'Microbiological' | 'Disinfection' | 'Organics';
export type WqUnit = 'mg/L' | 'µg/L' | 'NTU' | 'TCU' | 'Pt-Co' | 'pH' | 'CFU/100 mL' | 'MPN/100 mL' | '°C' | 'mS/cm' | 'µS/cm' | 'meq/L' | 'Bq/L';
export type ComplianceStatus = 'PASS' | 'WARNING' | 'FAIL' | 'NOT_CHECKED';
export type ConfidenceFlag = 'HIGH' | 'MEDIUM' | 'UNCERTAIN';

export interface WaterQualityParameter {
  id: string;
  name: string;
  symbol: string;
  category: WqCategory;
  unit: WqUnit;
  rawValue: number;
  targetValue: number;
  min: number;
  max: number;
  designValue: number;
  detectionLimit: number;
  source: string; // e.g. 'Lab Sample', 'CPHEEO', 'WHO', 'Client Standard'
  samplingDate: string;
  confidenceFlag: ConfidenceFlag;
  
  // Regulatory Standard Targets
  whoTarget: number;
  bdTarget: number; // Bangladesh Standard (ECR 2023 / BDS)
  epaTarget: number;
  euTarget: number;
  
  // Process tracking
  requiredRemovalPercent: number;
  achievedRemovalPercent: number;
  finalValue: number;
  complianceStatus: ComplianceStatus;
  requiredProcesses: string[];
  notes?: string;
}

export const MASTER_WATER_QUALITY_REGISTRY: WaterQualityParameter[] = [
  // 1. PHYSICAL
  {
    id: 'WQ-PHYS-001',
    name: 'Water Temperature',
    symbol: 'Temp',
    category: 'Physical',
    unit: '°C',
    rawValue: 25.0,
    targetValue: 25.0,
    min: 5.0,
    max: 40.0,
    designValue: 25.0,
    detectionLimit: 0.1,
    source: 'Raw River Intake Log',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 25.0,
    bdTarget: 25.0,
    epaTarget: 25.0,
    euTarget: 25.0,
    requiredRemovalPercent: 0,
    achievedRemovalPercent: 0,
    finalValue: 25.0,
    complianceStatus: 'PASS',
    requiredProcesses: ['None'],
    notes: 'Impacts viscosity, reaction kinetics, and gas solubility.'
  },
  {
    id: 'WQ-PHYS-002',
    name: 'Turbidity',
    symbol: 'NTU',
    category: 'Physical',
    unit: 'NTU',
    rawValue: 120.0,
    targetValue: 1.0,
    min: 0.01,
    max: 2000.0,
    designValue: 120.0,
    detectionLimit: 0.05,
    source: 'Composite Surface Water Sample',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 1.0,
    bdTarget: 10.0,
    epaTarget: 1.0,
    euTarget: 1.0,
    requiredRemovalPercent: 99.17,
    achievedRemovalPercent: 99.5,
    finalValue: 0.6,
    complianceStatus: 'PASS',
    requiredProcesses: ['Coagulation', 'Flocculation', 'Clarification', 'Filtration']
  },
  {
    id: 'WQ-PHYS-003',
    name: 'True Color',
    symbol: 'TCU',
    category: 'Physical',
    unit: 'TCU',
    rawValue: 45.0,
    targetValue: 15.0,
    min: 1.0,
    max: 500.0,
    designValue: 45.0,
    detectionLimit: 1.0,
    source: 'Lab Spectrophotometer',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 15.0,
    bdTarget: 15.0,
    epaTarget: 15.0,
    euTarget: 15.0,
    requiredRemovalPercent: 66.67,
    achievedRemovalPercent: 88.89,
    finalValue: 5.0,
    complianceStatus: 'PASS',
    requiredProcesses: ['Coagulation', 'Adsorption', 'Chlorination']
  },
  {
    id: 'WQ-PHYS-004',
    name: 'Total Dissolved Solids (TDS)',
    symbol: 'TDS',
    category: 'Physical',
    unit: 'mg/L',
    rawValue: 350.0,
    targetValue: 500.0,
    min: 10.0,
    max: 10000.0,
    designValue: 350.0,
    detectionLimit: 1.0,
    source: 'Gravimetric Method',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 500.0,
    bdTarget: 1000.0,
    epaTarget: 500.0,
    euTarget: 500.0,
    requiredRemovalPercent: 0,
    achievedRemovalPercent: 5.0,
    finalValue: 332.5,
    complianceStatus: 'PASS',
    requiredProcesses: ['Conventional / RO if high']
  },
  {
    id: 'WQ-PHYS-005',
    name: 'Electrical Conductivity (EC)',
    symbol: 'EC',
    category: 'Physical',
    unit: 'µS/cm',
    rawValue: 520.0,
    targetValue: 800.0,
    min: 10.0,
    max: 15000.0,
    designValue: 520.0,
    detectionLimit: 1.0,
    source: 'Conductivity Meter',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 800.0,
    bdTarget: 1000.0,
    epaTarget: 800.0,
    euTarget: 2500.0,
    requiredRemovalPercent: 0,
    achievedRemovalPercent: 4.0,
    finalValue: 499.2,
    complianceStatus: 'PASS',
    requiredProcesses: ['Conventional / Desalination']
  },
  {
    id: 'WQ-PHYS-006',
    name: 'Total Suspended Solids (TSS)',
    symbol: 'TSS',
    category: 'Physical',
    unit: 'mg/L',
    rawValue: 140.0,
    targetValue: 5.0,
    min: 1.0,
    max: 2000.0,
    designValue: 140.0,
    detectionLimit: 1.0,
    source: 'Gravimetric Filter Method',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 5.0,
    bdTarget: 10.0,
    epaTarget: 5.0,
    euTarget: 5.0,
    requiredRemovalPercent: 96.43,
    achievedRemovalPercent: 98.57,
    finalValue: 2.0,
    complianceStatus: 'PASS',
    requiredProcesses: ['Sedimentation', 'Filtration']
  },

  // 2. CHEMICAL & ALKALINITY
  {
    id: 'WQ-CHEM-001',
    name: 'pH Level',
    symbol: 'pH',
    category: 'Chemical',
    unit: 'pH',
    rawValue: 6.8,
    targetValue: 7.4,
    min: 4.0,
    max: 10.5,
    designValue: 6.8,
    detectionLimit: 0.01,
    source: 'pH Meter ISO 10523',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 7.5,
    bdTarget: 7.5,
    epaTarget: 7.5,
    euTarget: 7.5,
    requiredRemovalPercent: 0,
    achievedRemovalPercent: 100,
    finalValue: 7.4,
    complianceStatus: 'PASS',
    requiredProcesses: ['Lime / Soda Ash Addition']
  },
  {
    id: 'WQ-CHEM-002',
    name: 'Total Alkalinity (as CaCO3)',
    symbol: 'Alk',
    category: 'Chemical',
    unit: 'mg/L',
    rawValue: 85.0,
    targetValue: 100.0,
    min: 5.0,
    max: 500.0,
    designValue: 85.0,
    detectionLimit: 1.0,
    source: 'Acid Titration Method',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 200.0,
    bdTarget: 200.0,
    epaTarget: 200.0,
    euTarget: 200.0,
    requiredRemovalPercent: 0,
    achievedRemovalPercent: 0,
    finalValue: 78.5,
    complianceStatus: 'PASS',
    requiredProcesses: ['Alkalinity Adjustment']
  },
  {
    id: 'WQ-CHEM-003',
    name: 'Total Hardness (as CaCO3)',
    symbol: 'Hardness',
    category: 'Chemical',
    unit: 'mg/L',
    rawValue: 160.0,
    targetValue: 200.0,
    min: 10.0,
    max: 1000.0,
    designValue: 160.0,
    detectionLimit: 1.0,
    source: 'EDTA Titration',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 200.0,
    bdTarget: 200.0,
    epaTarget: 200.0,
    euTarget: 200.0,
    requiredRemovalPercent: 0,
    achievedRemovalPercent: 0,
    finalValue: 160.0,
    complianceStatus: 'PASS',
    requiredProcesses: ['Lime Softening / Ion Exchange']
  },
  {
    id: 'WQ-CHEM-004',
    name: 'Calcium (Ca2+)',
    symbol: 'Ca',
    category: 'Chemical',
    unit: 'mg/L',
    rawValue: 48.0,
    targetValue: 75.0,
    min: 1.0,
    max: 300.0,
    designValue: 48.0,
    detectionLimit: 0.5,
    source: 'ICP-OES',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 75.0,
    bdTarget: 75.0,
    epaTarget: 75.0,
    euTarget: 100.0,
    requiredRemovalPercent: 0,
    achievedRemovalPercent: 0,
    finalValue: 48.0,
    complianceStatus: 'PASS',
    requiredProcesses: ['Lime Addition']
  },
  {
    id: 'WQ-CHEM-005',
    name: 'Magnesium (Mg2+)',
    symbol: 'Mg',
    category: 'Chemical',
    unit: 'mg/L',
    rawValue: 12.0,
    targetValue: 30.0,
    min: 0.5,
    max: 150.0,
    designValue: 12.0,
    detectionLimit: 0.2,
    source: 'ICP-OES',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 30.0,
    bdTarget: 30.0,
    epaTarget: 30.0,
    euTarget: 50.0,
    requiredRemovalPercent: 0,
    achievedRemovalPercent: 0,
    finalValue: 12.0,
    complianceStatus: 'PASS',
    requiredProcesses: ['Softening']
  },
  {
    id: 'WQ-CHEM-006',
    name: 'Chloride (Cl-)',
    symbol: 'Cl',
    category: 'Chemical',
    unit: 'mg/L',
    rawValue: 42.0,
    targetValue: 250.0,
    min: 1.0,
    max: 2000.0,
    designValue: 42.0,
    detectionLimit: 1.0,
    source: 'Ion Chromatography',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 250.0,
    bdTarget: 250.0,
    epaTarget: 250.0,
    euTarget: 250.0,
    requiredRemovalPercent: 0,
    achievedRemovalPercent: 0,
    finalValue: 46.5,
    complianceStatus: 'PASS',
    requiredProcesses: ['RO / Desalination if > 250']
  },
  {
    id: 'WQ-CHEM-007',
    name: 'Sulfate (SO4 2-)',
    symbol: 'SO4',
    category: 'Chemical',
    unit: 'mg/L',
    rawValue: 35.0,
    targetValue: 250.0,
    min: 1.0,
    max: 1000.0,
    designValue: 35.0,
    detectionLimit: 1.0,
    source: 'Ion Chromatography',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 250.0,
    bdTarget: 400.0,
    epaTarget: 250.0,
    euTarget: 250.0,
    requiredRemovalPercent: 0,
    achievedRemovalPercent: 0,
    finalValue: 48.2,
    complianceStatus: 'PASS',
    requiredProcesses: ['Coagulation (Alum adds SO4)']
  },
  {
    id: 'WQ-CHEM-008',
    name: 'Nitrate (as NO3-)',
    symbol: 'NO3',
    category: 'Chemical',
    unit: 'mg/L',
    rawValue: 12.5,
    targetValue: 50.0,
    min: 0.1,
    max: 200.0,
    designValue: 12.5,
    detectionLimit: 0.1,
    source: 'Spectrophotometric UV',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 50.0,
    bdTarget: 50.0,
    epaTarget: 44.0,
    euTarget: 50.0,
    requiredRemovalPercent: 0,
    achievedRemovalPercent: 5.0,
    finalValue: 11.88,
    complianceStatus: 'PASS',
    requiredProcesses: ['Ion Exchange / RO if > 50']
  },
  {
    id: 'WQ-CHEM-009',
    name: 'Ammonia Nitrogen (NH3-N)',
    symbol: 'NH3',
    category: 'Chemical',
    unit: 'mg/L',
    rawValue: 1.2,
    targetValue: 0.5,
    min: 0.05,
    max: 20.0,
    designValue: 1.2,
    detectionLimit: 0.02,
    source: 'Nesslerization Method',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 1.5,
    bdTarget: 0.5,
    epaTarget: 0.5,
    euTarget: 0.5,
    requiredRemovalPercent: 58.33,
    achievedRemovalPercent: 91.67,
    finalValue: 0.10,
    complianceStatus: 'PASS',
    requiredProcesses: ['Breakpoint Chlorination', 'Biofiltration']
  },

  // 3. METALS
  {
    id: 'WQ-MET-001',
    name: 'Total Iron (Fe)',
    symbol: 'Fe',
    category: 'Metals',
    unit: 'mg/L',
    rawValue: 2.8,
    targetValue: 0.3,
    min: 0.01,
    max: 30.0,
    designValue: 2.8,
    detectionLimit: 0.01,
    source: 'AAS / ICP-OES',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 0.3,
    bdTarget: 0.3,
    epaTarget: 0.3,
    euTarget: 0.2,
    requiredRemovalPercent: 89.29,
    achievedRemovalPercent: 96.43,
    finalValue: 0.10,
    complianceStatus: 'PASS',
    requiredProcesses: ['Aeration', 'Oxidation', 'Clarification', 'Filtration']
  },
  {
    id: 'WQ-MET-002',
    name: 'Manganese (Mn)',
    symbol: 'Mn',
    category: 'Metals',
    unit: 'mg/L',
    rawValue: 0.45,
    targetValue: 0.1,
    min: 0.005,
    max: 5.0,
    designValue: 0.45,
    detectionLimit: 0.005,
    source: 'ICP-MS',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 0.1,
    bdTarget: 0.1,
    epaTarget: 0.05,
    euTarget: 0.05,
    requiredRemovalPercent: 77.78,
    achievedRemovalPercent: 88.89,
    finalValue: 0.05,
    complianceStatus: 'PASS',
    requiredProcesses: ['KMnO4 / Chlorine Oxidation', 'Filtration']
  },
  {
    id: 'WQ-MET-003',
    name: 'Total Arsenic (As)',
    symbol: 'As',
    category: 'Metals',
    unit: 'mg/L',
    rawValue: 0.035,
    targetValue: 0.010,
    min: 0.001,
    max: 1.0,
    designValue: 0.035,
    detectionLimit: 0.001,
    source: 'Hydride Generation AAS',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 0.010,
    bdTarget: 0.050,
    epaTarget: 0.010,
    euTarget: 0.010,
    requiredRemovalPercent: 71.43,
    achievedRemovalPercent: 85.71,
    finalValue: 0.005,
    complianceStatus: 'PASS',
    requiredProcesses: ['Oxidation', 'Ferric Coagulation', 'Adsorption Media']
  },
  {
    id: 'WQ-MET-004',
    name: 'Aluminum (Al)',
    symbol: 'Al',
    category: 'Metals',
    unit: 'mg/L',
    rawValue: 0.08,
    targetValue: 0.20,
    min: 0.01,
    max: 2.0,
    designValue: 0.08,
    detectionLimit: 0.01,
    source: 'ICP-OES',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 0.20,
    bdTarget: 0.20,
    epaTarget: 0.20,
    euTarget: 0.20,
    requiredRemovalPercent: 0,
    achievedRemovalPercent: 0,
    finalValue: 0.12,
    complianceStatus: 'PASS',
    requiredProcesses: ['Controlled Alum Coagulation & pH Control']
  },

  // 4. MICROBIOLOGICAL
  {
    id: 'WQ-MIC-001',
    name: 'E. Coli / Total Coliform',
    symbol: 'E. Coli',
    category: 'Microbiological',
    unit: 'MPN/100 mL',
    rawValue: 4500,
    targetValue: 0,
    min: 0,
    max: 100000,
    designValue: 4500,
    detectionLimit: 1,
    source: 'Membrane Filtration Method ISO 9308',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 0,
    bdTarget: 0,
    epaTarget: 0,
    euTarget: 0,
    requiredRemovalPercent: 100,
    achievedRemovalPercent: 100,
    finalValue: 0,
    complianceStatus: 'PASS',
    requiredProcesses: ['Disinfection (Gas Chlorine / UV)']
  },
  {
    id: 'WQ-MIC-002',
    name: 'Giardia Cysts',
    symbol: 'Giardia',
    category: 'Microbiological',
    unit: 'CFU/100 mL',
    rawValue: 120,
    targetValue: 0,
    min: 0,
    max: 5000,
    designValue: 120,
    detectionLimit: 1,
    source: 'Immunofluorescence Assay EPA 1623',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 0,
    bdTarget: 0,
    epaTarget: 0,
    euTarget: 0,
    requiredRemovalPercent: 100,
    achievedRemovalPercent: 100,
    finalValue: 0,
    complianceStatus: 'PASS',
    requiredProcesses: ['Filtration (2.5 log)', 'Chlorine CT (0.5 log)']
  },

  // 5. DISINFECTION & ORGANICS
  {
    id: 'WQ-DIS-001',
    name: 'Free Residual Chlorine',
    symbol: 'Free Cl2',
    category: 'Disinfection',
    unit: 'mg/L',
    rawValue: 0.0,
    targetValue: 1.5,
    min: 0.0,
    max: 5.0,
    designValue: 1.5,
    detectionLimit: 0.05,
    source: 'DPD Colorimetric Method',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 0.5,
    bdTarget: 0.2,
    epaTarget: 4.0,
    euTarget: 0.5,
    requiredRemovalPercent: 0,
    achievedRemovalPercent: 100,
    finalValue: 1.5,
    complianceStatus: 'PASS',
    requiredProcesses: ['Gas Chlorine Post-Disinfection']
  },
  {
    id: 'WQ-DIS-002',
    name: 'Total Organic Carbon (TOC)',
    symbol: 'TOC',
    category: 'Organics',
    unit: 'mg/L',
    rawValue: 6.5,
    targetValue: 2.0,
    min: 0.5,
    max: 30.0,
    designValue: 6.5,
    detectionLimit: 0.1,
    source: 'Combustion Catalytic Oxidation',
    samplingDate: '2026-08-01',
    confidenceFlag: 'HIGH',
    whoTarget: 2.0,
    bdTarget: 4.0,
    epaTarget: 2.0,
    euTarget: 2.0,
    requiredRemovalPercent: 69.23,
    achievedRemovalPercent: 65.0,
    finalValue: 2.28,
    complianceStatus: 'WARNING',
    requiredProcesses: ['Enhanced Coagulation', 'GAC / PAC Adsorption']
  }
];

// Unit Conversion Matrix Helper
export function convertWqUnit(value: number, fromUnit: WqUnit, toUnit: WqUnit): { value: number; isValid: boolean; message?: string } {
  if (fromUnit === toUnit) return { value, isValid: true };

  // mg/L <-> µg/L
  if (fromUnit === 'mg/L' && toUnit === 'µg/L') return { value: value * 1000, isValid: true };
  if (fromUnit === 'µg/L' && toUnit === 'mg/L') return { value: value / 1000, isValid: true };

  // mS/cm <-> µS/cm
  if (fromUnit === 'mS/cm' && toUnit === 'µS/cm') return { value: value * 1000, isValid: true };
  if (fromUnit === 'µS/cm' && toUnit === 'mS/cm') return { value: value / 1000, isValid: true };

  // Incompatible unit conversions protection
  return { 
    value, 
    isValid: false, 
    message: `Incompatible unit conversion requested from ${fromUnit} to ${toUnit}. Direct conversion prohibited.` 
  };
}

// Contaminant Mass Load Calculation
export interface MassLoadResult {
  parameterId: string;
  parameterName: string;
  concentrationMgL: number;
  flowM3day: number;
  massLoadKgDay: number;
  massLoadKgHr: number;
  massLoadGDay: number;
}

export function calculateContaminantMassLoad(concentrationMgL: number, flowM3day: number, parameterId = 'CUSTOM', parameterName = 'Contaminant'): MassLoadResult {
  const massLoadKgDay = (concentrationMgL * flowM3day) / 1000;
  return {
    parameterId,
    parameterName,
    concentrationMgL,
    flowM3day,
    massLoadKgDay: Number(massLoadKgDay.toFixed(3)),
    massLoadKgHr: Number((massLoadKgDay / 24).toFixed(3)),
    massLoadGDay: Number((massLoadKgDay * 1000).toFixed(1))
  };
}

// Removal % Engine
export function calculateRemovalPercent(rawValue: number, finalValue: number): number {
  if (rawValue <= 0) return 0;
  const removal = ((rawValue - finalValue) / rawValue) * 100;
  return Number(Math.max(0, Math.min(100, removal)).toFixed(2));
}
