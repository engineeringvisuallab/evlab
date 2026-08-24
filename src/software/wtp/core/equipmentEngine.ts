import { CalculatedWtpState } from './dependencyEngine';

export type EquipmentCategory = 
  | 'HYDRAULIC' 
  | 'MIXING' 
  | 'AERATION' 
  | 'CLARIFICATION' 
  | 'FILTRATION' 
  | 'CHEMICAL' 
  | 'SLUDGE' 
  | 'DISINFECTION' 
  | 'MISCELLANEOUS';

export interface MasterEquipmentItem {
  id: string;
  tag: string;
  name: string;
  category: EquipmentCategory;
  process: string;
  service: string;
  duty: number;
  standby: number;
  quantity: number;
  capacityPerUnit: number;
  unit: string;
  flowM3hr?: number;
  headM?: number;
  pressureBar?: number;
  powerKw: number;
  efficiencyPercent: number;
  speedRpm?: number;
  material: string;
  connectionSizeMm?: number;
  operatingRange?: string;
  designRange?: string;
  manufacturer: string;
  model: string;
  source: string;
  status: 'PASS' | 'WARNING' | 'FAIL' | 'MANUFACTURER_DATA_REQUIRED' | 'ENGINEER_INPUT_REQUIRED';
  
  // Electrical & Mechanical Datasheet Details
  motorKw?: number;
  motorVoltage?: string;
  motorPhase?: number;
  motorFrequencyHz?: number;
  motorStartingMethod?: 'DOL' | 'STAR_DELTA' | 'SOFT_STARTER' | 'VFD';
  controlType?: string;
  weightKg?: number;
  dimensionsMm?: string;
  interlocks?: string[];
  accessClearanceM?: number;
  maintenanceZoneM2?: number;
  procurementStatus?: 'DESIGN' | 'DATASHEET_PREPARED' | 'RFQ' | 'VENDOR_SELECTED' | 'APPROVED' | 'ORDERED' | 'DELIVERED' | 'INSTALLED' | 'COMMISSIONED';
  costEstimateUSD?: number;
}

export interface MotorSizingResult {
  hydraulicPowerKw: number;
  shaftPowerKw: number;
  calculatedMotorKw: number;
  standardRatedMotorKw: number;
  serviceFactor: number;
  recommendedStartingMethod: 'DOL' | 'STAR_DELTA' | 'SOFT_STARTER' | 'VFD';
  voltage: string;
  frequencyHz: number;
  estimatedFullLoadAmps: number;
}

export interface MixerSizingResult {
  tankVolumeM3: number;
  targetGValue: number;
  waterViscosityPaS: number;
  requiredShaftPowerKw: number;
  powerDensityWm3: number;
  recommendedMotorKw: number;
  impellerDiameterMm: number;
  impellerRpm: number;
}

export interface BlowerSizingResult {
  airflowM3hr: number;
  operatingPressureKpa: number;
  shaftPowerKw: number;
  motorPowerKw: number;
  diffuserCount?: number;
  airflowPerDiffuserM3hr?: number;
}

export interface N1FailureAnalysisResult {
  tag: string;
  equipmentName: string;
  installedQuantity: number;
  dutyQuantity: number;
  standbyQuantity: number;
  requiredCapacity: number;
  unitCapacity: number;
  remainingCapacityN1: number;
  capacityDeficit: number;
  capacityMarginPercent: number;
  n1Status: 'PASS' | 'WARNING' | 'FAIL';
  operationalImpactMessage: string;
}

export interface EnergySummaryResult {
  totalConnectedLoadKw: number;
  totalOperatingLoadKw: number;
  dailyEnergyKwh: number;
  annualEnergyKwh: number;
  specificEnergyKwhM3: number;
  categoryBreakdownKw: Record<EquipmentCategory, number>;
}

// Standard IEC motor kW ratings
const STANDARD_MOTOR_KW_RATINGS = [
  0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3.0, 4.0, 5.5, 7.5, 11, 15, 18.5, 22, 
  30, 37, 45, 55, 75, 90, 110, 132, 160, 200, 250, 315, 355, 400, 500, 630
];

/**
 * Motor Sizing Engine
 * Calculates shaft power, applies 1.15-1.25 service factor margin, and selects next standard IEC motor rating.
 */
export function calculateMotorSizing(
  hydraulicPowerKw: number,
  pumpOrFanEfficiencyPercent: number = 75,
  motorEfficiencyPercent: number = 92,
  serviceFactor: number = 1.15
): MotorSizingResult {
  const shaftPowerKw = hydraulicPowerKw / (pumpOrFanEfficiencyPercent / 100);
  const calculatedMotorKw = (shaftPowerKw * serviceFactor) / (motorEfficiencyPercent / 100);

  // Match standard rating
  let standardRatedMotorKw = STANDARD_MOTOR_KW_RATINGS[STANDARD_MOTOR_KW_RATINGS.length - 1];
  for (const stdKw of STANDARD_MOTOR_KW_RATINGS) {
    if (stdKw >= calculatedMotorKw) {
      standardRatedMotorKw = stdKw;
      break;
    }
  }

  // Recommended starting method
  let recommendedStartingMethod: 'DOL' | 'STAR_DELTA' | 'SOFT_STARTER' | 'VFD' = 'DOL';
  if (standardRatedMotorKw > 110) {
    recommendedStartingMethod = 'VFD';
  } else if (standardRatedMotorKw > 30) {
    recommendedStartingMethod = 'SOFT_STARTER';
  } else if (standardRatedMotorKw > 7.5) {
    recommendedStartingMethod = 'STAR_DELTA';
  }

  const voltage = standardRatedMotorKw >= 250 ? '3.3kV / 6.6kV 3-Phase' : '415V 3-Phase';
  const frequencyHz = 50;
  // Rule of thumb for 415V 3-phase: Full Load Amps ≈ 1.8 * kW
  const estimatedFullLoadAmps = standardRatedMotorKw >= 250 ? Number((standardRatedMotorKw * 0.22).toFixed(1)) : Number((standardRatedMotorKw * 1.8).toFixed(1));

  return {
    hydraulicPowerKw: Number(hydraulicPowerKw.toFixed(2)),
    shaftPowerKw: Number(shaftPowerKw.toFixed(2)),
    calculatedMotorKw: Number(calculatedMotorKw.toFixed(2)),
    standardRatedMotorKw,
    serviceFactor,
    recommendedStartingMethod,
    voltage,
    frequencyHz,
    estimatedFullLoadAmps
  };
}

/**
 * Mixer Engine
 * Calculates power requirement based on velocity gradient G (s⁻¹), volume V (m³), and viscosity μ.
 * P = G² * μ * V
 */
export function calculateMixerSizing(
  tankVolumeM3: number,
  targetGValue: number = 800,
  waterViscosityPaS: number = 0.001002 // 1.002 x 10^-3 Pa.s at 20°C
): MixerSizingResult {
  const requiredShaftPowerWatts = Math.pow(targetGValue, 2) * waterViscosityPaS * tankVolumeM3;
  const requiredShaftPowerKw = requiredShaftPowerWatts / 1000;
  const powerDensityWm3 = requiredShaftPowerWatts / tankVolumeM3;

  const motorSizing = calculateMotorSizing(requiredShaftPowerKw, 80, 90, 1.2);

  // Impeller sizing heuristic: D = (0.3 to 0.5) * Tank Width/Diameter
  const estimatedTankWidthM = Math.pow(tankVolumeM3, 1 / 3);
  const impellerDiameterMm = Math.round(estimatedTankWidthM * 0.4 * 1000);
  const impellerRpm = targetGValue > 500 ? 120 : 45;

  return {
    tankVolumeM3: Number(tankVolumeM3.toFixed(1)),
    targetGValue,
    waterViscosityPaS,
    requiredShaftPowerKw: Number(requiredShaftPowerKw.toFixed(2)),
    powerDensityWm3: Number(powerDensityWm3.toFixed(1)),
    recommendedMotorKw: motorSizing.standardRatedMotorKw,
    impellerDiameterMm,
    impellerRpm
  };
}

/**
 * Blower & Air Distribution Engine
 */
export function calculateBlowerSizing(
  airScourFlowM3hr: number,
  operatingPressureKpa: number = 45.0
): BlowerSizingResult {
  // Shaft Power = (Q * ΔP) / (3600 * η)
  const shaftPowerKw = (airScourFlowM3hr * operatingPressureKpa) / (3600 * 0.70);
  const motorSizing = calculateMotorSizing(shaftPowerKw, 75, 92, 1.15);

  const diffuserCount = Math.ceil(airScourFlowM3hr / 10); // 10 m³/hr per module
  const airflowPerDiffuserM3hr = Number((airScourFlowM3hr / diffuserCount).toFixed(1));

  return {
    airflowM3hr: Number(airScourFlowM3hr.toFixed(1)),
    operatingPressureKpa,
    shaftPowerKw: Number(shaftPowerKw.toFixed(2)),
    motorPowerKw: motorSizing.standardRatedMotorKw,
    diffuserCount,
    airflowPerDiffuserM3hr
  };
}

/**
 * Valve Diameter Sizing Engine
 */
export function calculateValveSizing(flowM3hr: number, maxVelocityMs: number = 2.0): { recommendedDnMm: number; calculatedVelocityMs: number } {
  const flowM3s = flowM3hr / 3600;
  const areaM2 = flowM3s / maxVelocityMs;
  const diameterM = Math.sqrt((4 * areaM2) / Math.PI);
  const calculatedDnMm = diameterM * 1000;

  // Standard DN sizes
  const standardDns = [50, 80, 100, 150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600];
  let recommendedDnMm = standardDns[standardDns.length - 1];
  for (const dn of standardDns) {
    if (dn >= calculatedDnMm) {
      recommendedDnMm = dn;
      break;
    }
  }

  const actualAreaM2 = Math.PI * Math.pow(recommendedDnMm / 1000, 2) / 4;
  const calculatedVelocityMs = Number((flowM3s / actualAreaM2).toFixed(2));

  return { recommendedDnMm, calculatedVelocityMs };
}

/**
 * Single Failure N-1 Analysis Engine
 */
export function calculateN1FailureAnalysis(item: MasterEquipmentItem): N1FailureAnalysisResult {
  const requiredCapacity = item.duty * item.capacityPerUnit;
  const remainingQuantityN1 = item.quantity - 1;
  const remainingCapacityN1 = remainingQuantityN1 * item.capacityPerUnit;
  const capacityDeficit = Math.max(0, requiredCapacity - remainingCapacityN1);
  const capacityMarginPercent = requiredCapacity > 0 ? Number(((remainingCapacityN1 / requiredCapacity) * 100).toFixed(1)) : 100;

  let n1Status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
  let operationalImpactMessage = 'N-1 Redundancy intact. Total design flow maintained during single unit outage.';

  if (capacityMarginPercent < 90) {
    n1Status = 'FAIL';
    operationalImpactMessage = `CRITICAL DEFICIT: Losing 1 unit reduces output to ${capacityMarginPercent}% of design capacity (${capacityDeficit.toFixed(1)} ${item.unit} shortfall). Additional standby unit required.`;
  } else if (capacityMarginPercent < 100) {
    n1Status = 'WARNING';
    operationalImpactMessage = `PARTIAL DEFICIT: Output reduced to ${capacityMarginPercent}% during single unit outage. Plant flow throttling required.`;
  }

  return {
    tag: item.tag,
    equipmentName: item.name,
    installedQuantity: item.quantity,
    dutyQuantity: item.duty,
    standbyQuantity: item.standby,
    requiredCapacity: Number(requiredCapacity.toFixed(1)),
    unitCapacity: Number(item.capacityPerUnit.toFixed(1)),
    remainingCapacityN1: Number(remainingCapacityN1.toFixed(1)),
    capacityDeficit: Number(capacityDeficit.toFixed(1)),
    capacityMarginPercent,
    n1Status,
    operationalImpactMessage
  };
}

/**
 * Energy Summary Engine
 */
export function calculateEnergySummary(schedule: MasterEquipmentItem[]): EnergySummaryResult {
  let totalConnectedLoadKw = 0;
  let totalOperatingLoadKw = 0;

  const categoryBreakdownKw: Record<EquipmentCategory, number> = {
    HYDRAULIC: 0,
    MIXING: 0,
    AERATION: 0,
    CLARIFICATION: 0,
    FILTRATION: 0,
    CHEMICAL: 0,
    SLUDGE: 0,
    DISINFECTION: 0,
    MISCELLANEOUS: 0
  };

  schedule.forEach(item => {
    const connectedKw = item.quantity * (item.motorKw || item.powerKw);
    const operatingKw = item.duty * (item.motorKw || item.powerKw);

    totalConnectedLoadKw += connectedKw;
    totalOperatingLoadKw += operatingKw;

    categoryBreakdownKw[item.category] += operatingKw;
  });

  const dailyEnergyKwh = totalOperatingLoadKw * 24;
  const annualEnergyKwh = dailyEnergyKwh * 365;

  // Assuming nominal 50 MLD or 50,000 m³/day
  const specificEnergyKwhM3 = Number((dailyEnergyKwh / 50000).toFixed(3));

  return {
    totalConnectedLoadKw: Number(totalConnectedLoadKw.toFixed(1)),
    totalOperatingLoadKw: Number(totalOperatingLoadKw.toFixed(1)),
    dailyEnergyKwh: Number(dailyEnergyKwh.toFixed(1)),
    annualEnergyKwh: Number(annualEnergyKwh.toFixed(1)),
    specificEnergyKwhM3,
    categoryBreakdownKw
  };
}

/**
 * Auto-Generates Full Master Equipment Register for WTP State
 */
export function generateMasterEquipmentRegister(
  state: CalculatedWtpState,
  customParams: Record<string, number> = {}
): MasterEquipmentItem[] {
  const flowM3hr = state.flowM3hr || 2083.3;
  const rawPumpHead = customParams['h_raw_pump'] || 28.5;
  const highLiftHead = customParams['h_hl_pump'] || 55.0;

  // Raw Water Pumps (3 Installed: 2 Duty + 1 Standby)
  const rawPumpUnitFlow = flowM3hr / 2;
  const rawPumpHydraulicKw = (rawPumpUnitFlow * rawPumpHead * 9.81) / 3600;
  const rawPumpMotor = calculateMotorSizing(rawPumpHydraulicKw, 78, 92, 1.15);

  // High Lift Pumps (4 Installed: 3 Duty + 1 Standby)
  const hlPumpUnitFlow = flowM3hr / 3;
  const hlPumpHydraulicKw = (hlPumpUnitFlow * highLiftHead * 9.81) / 3600;
  const hlPumpMotor = calculateMotorSizing(hlPumpHydraulicKw, 82, 94, 1.15);

  // Backwash Pumps (2 Installed: 1 Duty + 1 Standby)
  const bwFlow = state.backwashFlowM3hr || 1800;
  const bwHydraulicKw = (bwFlow * 14.0 * 9.81) / 3600;
  const bwMotor = calculateMotorSizing(bwHydraulicKw, 80, 92, 1.15);

  // Rapid Flash Mixer
  const rapidMixSizing = calculateMixerSizing((flowM3hr / 3600) * 45, 800);

  // Air Scour Blower
  const blowerSizing = calculateBlowerSizing(1850, 45.0);

  // Valve sizing for High Lift Main
  const hlValveSizing = calculateValveSizing(hlPumpUnitFlow, 2.0);

  const register: MasterEquipmentItem[] = [
    // 1. HYDRAULIC
    {
      id: 'EQP-HYD-001',
      tag: 'PMP-RAW-01A/B/C',
      name: 'Raw Water Vertical Turbine Intake Pumps',
      category: 'HYDRAULIC',
      process: 'Intake & Raw Water Pumping',
      service: 'Raw Water Lifting to Aerator/Rapid Mix',
      duty: 2,
      standby: 1,
      quantity: 3,
      capacityPerUnit: Number(rawPumpUnitFlow.toFixed(1)),
      unit: 'm³/hr',
      flowM3hr: Number(rawPumpUnitFlow.toFixed(1)),
      headM: rawPumpHead,
      powerKw: rawPumpMotor.calculatedMotorKw,
      motorKw: rawPumpMotor.standardRatedMotorKw,
      efficiencyPercent: 78,
      speedRpm: 1480,
      material: 'SS316 Impeller / Ductile Iron Casing',
      connectionSizeMm: 450,
      operatingRange: '800 - 1200 m³/hr @ 25 - 32m',
      designRange: '1041.7 m³/hr @ 28.5m',
      manufacturer: 'KSB / Sulzer',
      model: 'VTP-800/4',
      source: 'Hydraulic & Pump Calculation Engine',
      status: 'PASS',
      motorVoltage: rawPumpMotor.voltage,
      motorPhase: 3,
      motorFrequencyHz: 50,
      motorStartingMethod: rawPumpMotor.recommendedStartingMethod,
      controlType: 'Auto/Manual via SCADA / VFD',
      weightKg: 2450,
      dimensionsMm: '1200 x 1200 x 3800',
      interlocks: ['Suction Sump Low Level Trip', 'Discharge Valve Closed Interlock', 'Motor Overload Trip'],
      accessClearanceM: 1.8,
      maintenanceZoneM2: 12.0,
      procurementStatus: 'APPROVED',
      costEstimateUSD: 145000
    },
    {
      id: 'EQP-HYD-002',
      tag: 'PMP-HL-01A/B/C/D',
      name: 'High Lift Treated Water Horizontal Split-Case Pumps',
      category: 'HYDRAULIC',
      process: 'High Lift Pump House',
      service: 'Treated Water Transmission Main Supply',
      duty: 3,
      standby: 1,
      quantity: 4,
      capacityPerUnit: Number(hlPumpUnitFlow.toFixed(1)),
      unit: 'm³/hr',
      flowM3hr: Number(hlPumpUnitFlow.toFixed(1)),
      headM: highLiftHead,
      powerKw: hlPumpMotor.calculatedMotorKw,
      motorKw: hlPumpMotor.standardRatedMotorKw,
      efficiencyPercent: 82,
      speedRpm: 1480,
      material: 'Bronze Impeller / Cast Steel Casing',
      connectionSizeMm: hlValveSizing.recommendedDnMm,
      operatingRange: '600 - 800 m³/hr @ 50 - 62m',
      designRange: '694.4 m³/hr @ 55.0m',
      manufacturer: 'Flowserve / Grundfos',
      model: 'HSC-350',
      source: 'Pump Engine',
      status: 'PASS',
      motorVoltage: hlPumpMotor.voltage,
      motorPhase: 3,
      motorFrequencyHz: 50,
      motorStartingMethod: hlPumpMotor.recommendedStartingMethod,
      controlType: 'VFD Speed Modulation on Pressure Control',
      weightKg: 3800,
      dimensionsMm: '2200 x 1400 x 1600',
      interlocks: ['Clear Water Tank Low Level Trip', 'High Discharge Pressure Spike Trip'],
      accessClearanceM: 2.0,
      maintenanceZoneM2: 18.0,
      procurementStatus: 'APPROVED',
      costEstimateUSD: 210000
    },
    {
      id: 'EQP-HYD-003',
      tag: 'PMP-BW-01A/B',
      name: 'Filter Backwash Water Centrifugal Pumps',
      category: 'HYDRAULIC',
      process: 'Filter Backwash System',
      service: 'High Volume Filter Bed Backwash Flushing',
      duty: 1,
      standby: 1,
      quantity: 2,
      capacityPerUnit: bwFlow,
      unit: 'm³/hr',
      flowM3hr: bwFlow,
      headM: 14.0,
      powerKw: bwMotor.calculatedMotorKw,
      motorKw: bwMotor.standardRatedMotorKw,
      efficiencyPercent: 80,
      speedRpm: 1450,
      material: 'Ductile Iron Casing & Impeller',
      connectionSizeMm: 500,
      operatingRange: '1500 - 2100 m³/hr @ 12 - 16m',
      designRange: '1800 m³/hr @ 14m',
      manufacturer: 'Grundfos / KSB',
      model: 'NK 200-400',
      source: 'Hydraulic Engine',
      status: 'PASS',
      motorVoltage: bwMotor.voltage,
      motorPhase: 3,
      motorFrequencyHz: 50,
      motorStartingMethod: bwMotor.recommendedStartingMethod,
      controlType: 'SCADA Soft-Start Timer Sequence',
      weightKg: 1850,
      dimensionsMm: '1800 x 1100 x 1300',
      interlocks: ['Backwash Reservoir Low Level Trip', 'Filter Waste Drain Gate Closed Interlock'],
      accessClearanceM: 1.5,
      maintenanceZoneM2: 10.0,
      procurementStatus: 'APPROVED',
      costEstimateUSD: 85000
    },

    // 2. MIXING
    {
      id: 'EQP-MIX-001',
      tag: 'MX-RAP-01A/B',
      name: 'Rapid Flash Mixer Vertical Turbine Agitator',
      category: 'MIXING',
      process: 'Coagulation Rapid Mix',
      service: 'High Energy Coagulant Dispersion',
      duty: 1,
      standby: 1,
      quantity: 2,
      capacityPerUnit: flowM3hr,
      unit: 'm³/hr',
      flowM3hr: flowM3hr,
      powerKw: rapidMixSizing.requiredShaftPowerKw,
      motorKw: rapidMixSizing.recommendedMotorKw,
      efficiencyPercent: 85,
      speedRpm: rapidMixSizing.impellerRpm,
      material: 'SS316 Rubber Lined Impeller & Shaft',
      connectionSizeMm: 0,
      operatingRange: 'G = 600 - 1000 s⁻¹',
      designRange: `G = ${rapidMixSizing.targetGValue} s⁻¹`,
      manufacturer: 'LIGHTNIN / SPX Flow',
      model: 'Series 70-V',
      source: 'Process Design Engine',
      status: 'PASS',
      motorVoltage: '415V 3-Phase',
      motorPhase: 3,
      motorFrequencyHz: 50,
      motorStartingMethod: 'DOL',
      controlType: 'Auto/Manual SCADA Controlled',
      weightKg: 650,
      dimensionsMm: '800 x 800 x 2400',
      interlocks: ['No Flow Interlock', 'Coagulant Dosing Pump Running Interlock'],
      accessClearanceM: 1.5,
      maintenanceZoneM2: 6.0,
      procurementStatus: 'APPROVED',
      costEstimateUSD: 38000
    },
    {
      id: 'EQP-MIX-002',
      tag: 'MX-FLOC-01A/B/C',
      name: 'Three-Stage Vertical Turbine Flocculator Agitators',
      category: 'MIXING',
      process: 'Flocculation Basins',
      service: 'Tapered Energy Flocculation (G = 50 -> 30 -> 15 s⁻¹)',
      duty: 3,
      standby: 0,
      quantity: 3,
      capacityPerUnit: Number((flowM3hr / 3).toFixed(1)),
      unit: 'm³/hr',
      powerKw: 5.5,
      motorKw: 7.5,
      efficiencyPercent: 88,
      speedRpm: 25,
      material: 'SS316 Shaft & Axial Hydrofoil Impeller',
      manufacturer: 'Ekato / Philadelphia Mixing',
      model: 'FlocMix-300',
      source: 'Process Sizing Engine',
      status: 'PASS',
      motorVoltage: '415V 3-Phase',
      motorPhase: 3,
      motorFrequencyHz: 50,
      motorStartingMethod: 'VFD',
      controlType: 'VFD Tapered Speed Control',
      weightKg: 820,
      dimensionsMm: '1100 x 1100 x 3200',
      interlocks: ['Basin High Water Level Interlock'],
      accessClearanceM: 1.2,
      maintenanceZoneM2: 8.0,
      procurementStatus: 'APPROVED',
      costEstimateUSD: 62000
    },

    // 3. AERATION & BLOWERS
    {
      id: 'EQP-AER-001',
      tag: 'BLW-SCOUR-01A/B',
      name: 'Filter Air Scour Rotary Lobe Blowers',
      category: 'AERATION',
      process: 'Filter Backwash Air Scour',
      service: 'Media Air Scour Fluidization',
      duty: 1,
      standby: 1,
      quantity: 2,
      capacityPerUnit: blowerSizing.airflowM3hr,
      unit: 'm³/hr',
      pressureBar: blowerSizing.operatingPressureKpa / 100,
      powerKw: blowerSizing.shaftPowerKw,
      motorKw: blowerSizing.motorPowerKw,
      efficiencyPercent: 76,
      speedRpm: 1750,
      material: 'Ductile Iron Rotors / Cast Iron Casing',
      connectionSizeMm: 250,
      operatingRange: '1500 - 2200 m³/hr @ 40 - 55 kPa',
      designRange: '1850 m³/hr @ 45 kPa',
      manufacturer: 'Aerzen / Kaeser',
      model: 'Delta Blower G5',
      source: 'Blower Sizing Engine',
      status: 'PASS',
      motorVoltage: '415V 3-Phase',
      motorPhase: 3,
      motorFrequencyHz: 50,
      motorStartingMethod: 'STAR_DELTA',
      controlType: 'Acoustic Enclosure PLC Automated',
      weightKg: 1450,
      dimensionsMm: '1600 x 1200 x 1500',
      interlocks: ['High Discharge Temperature Trip', 'High Pressure Relief Interlock'],
      accessClearanceM: 1.5,
      maintenanceZoneM2: 9.0,
      procurementStatus: 'APPROVED',
      costEstimateUSD: 72000
    },

    // 4. CLARIFICATION
    {
      id: 'EQP-CLR-001',
      tag: 'SCR-SLD-01A/B',
      name: 'Clarifier Center-Driven Rotating Bridge Sludge Scraper',
      category: 'CLARIFICATION',
      process: 'Circular Clarifiers',
      service: 'Bottom Sludge Scraping to Hopper',
      duty: 2,
      standby: 0,
      quantity: 2,
      capacityPerUnit: Number((flowM3hr / 2).toFixed(1)),
      unit: 'm³/hr',
      powerKw: 2.2,
      motorKw: 3.0,
      efficiencyPercent: 85,
      speedRpm: 0.03,
      material: 'SS304 Structural Bridge / Neoprene Blades',
      manufacturer: 'Eimco Water Technologies',
      model: 'C30 Center Drive',
      source: 'Clarifier Sizing',
      status: 'PASS',
      motorVoltage: '415V 3-Phase',
      motorPhase: 3,
      motorFrequencyHz: 50,
      motorStartingMethod: 'DOL',
      controlType: 'Torque-Sensing Auto Reverse / Alarm',
      weightKg: 4200,
      dimensionsMm: '30m Diameter Structural Span',
      interlocks: ['High Drive Torque Alarm & Trip'],
      accessClearanceM: 1.5,
      maintenanceZoneM2: 25.0,
      procurementStatus: 'APPROVED',
      costEstimateUSD: 110000
    },

    // 5. FILTRATION & VALVES
    {
      id: 'EQP-FIL-001',
      tag: 'VLV-FILT-INLET-01..08',
      name: 'Rapid Gravity Filter Pneumatic Inlet Butterfly Valves',
      category: 'FILTRATION',
      process: 'Filter Building (8 Cells)',
      service: 'Settled Water Inlet Isolation',
      duty: 8,
      standby: 0,
      quantity: 8,
      capacityPerUnit: Number((flowM3hr / 8).toFixed(1)),
      unit: 'm³/hr',
      powerKw: 0.5,
      motorKw: 0.5,
      efficiencyPercent: 95,
      material: 'Ductile Iron Body / SS316 Disc / EPDM Seat',
      connectionSizeMm: 300,
      manufacturer: 'Bray / AVK',
      model: 'Series 31 Pneumatic',
      source: 'Valve Sizing Engine',
      status: 'PASS',
      controlType: 'Pneumatic Double Acting Actuator with Limit Switches',
      interlocks: ['Filter Backwash Mode Lockout'],
      accessClearanceM: 1.0,
      procurementStatus: 'APPROVED',
      costEstimateUSD: 32000
    },

    // 6. CHEMICAL DOSING
    {
      id: 'EQP-CHM-001',
      tag: 'PMP-ALUM-01A/B',
      name: 'Liquid Alum Diaphragm Dosing Pumps',
      category: 'CHEMICAL',
      process: 'Chemical Building',
      service: 'Coagulant Solution Metering to Rapid Mix',
      duty: 1,
      standby: 1,
      quantity: 2,
      capacityPerUnit: 250.0,
      unit: 'L/hr',
      flowM3hr: 0.25,
      pressureBar: 6.0,
      powerKw: 0.75,
      motorKw: 1.1,
      efficiencyPercent: 88,
      material: 'PVDF Pump Head / PTFE Diaphragm',
      connectionSizeMm: 25,
      operatingRange: '25 - 250 L/hr (10:1 Turndown)',
      designRange: '145 L/hr @ 3.5 bar',
      manufacturer: 'Milton Roy / ProMinent',
      model: 'mRoy Series A',
      source: 'Chemical Dosing Engine',
      status: 'PASS',
      motorVoltage: '415V 3-Phase',
      motorPhase: 3,
      motorFrequencyHz: 50,
      motorStartingMethod: 'VFD',
      controlType: '4-20mA Flow-Paced Speed Modulation',
      weightKg: 85,
      dimensionsMm: '450 x 300 x 500',
      interlocks: ['Chemical Day Tank Low-Low Level Trip', 'Dosing Line Pressure Relief Interlock'],
      accessClearanceM: 1.0,
      maintenanceZoneM2: 3.0,
      procurementStatus: 'APPROVED',
      costEstimateUSD: 18500
    },

    // 7. SLUDGE DEWATERING
    {
      id: 'EQP-SLD-001',
      tag: 'PRESS-SLD-01A/B',
      name: 'High Pressure Recessed Plate Filter Press',
      category: 'SLUDGE',
      process: 'Sludge Dewatering Building',
      service: 'Alum & Silt Sludge Dewatering to 30% DS Cake',
      duty: 1,
      standby: 1,
      quantity: 2,
      capacityPerUnit: 1200.0,
      unit: 'kg DS/hr',
      powerKw: 15.0,
      motorKw: 18.5,
      efficiencyPercent: 85,
      material: 'Polypropylene Plates / Heavy Duty Steel Frame',
      manufacturer: 'Andritz / Netzsch',
      model: 'Side-Bar 1200',
      source: 'Sludge Engine',
      status: 'PASS',
      motorVoltage: '415V 3-Phase',
      motorPhase: 3,
      motorFrequencyHz: 50,
      motorStartingMethod: 'STAR_DELTA',
      controlType: 'Fully Automated Hydraulic Closure & Plate Shifting',
      weightKg: 12500,
      dimensionsMm: '6500 x 2100 x 2400',
      interlocks: ['Hydraulic Pressure Failure Trip', 'Drip Tray Position Interlock'],
      accessClearanceM: 2.5,
      maintenanceZoneM2: 45.0,
      procurementStatus: 'APPROVED',
      costEstimateUSD: 240000
    },

    // 8. DISINFECTION
    {
      id: 'EQP-DIS-001',
      tag: 'CHL-GAS-01A/B',
      name: 'Vacuum Feed Gas Chlorination System',
      category: 'DISINFECTION',
      process: 'Chlorine Building',
      service: 'Pre & Post Disinfection Gas Metering',
      duty: 1,
      standby: 1,
      quantity: 2,
      capacityPerUnit: 25.0,
      unit: 'kg/hr',
      powerKw: 1.5,
      motorKw: 2.2,
      efficiencyPercent: 90,
      material: 'Hastelloy C / PVDF Ejectors',
      connectionSizeMm: 50,
      manufacturer: 'Capital Controls / De Nora',
      model: 'Series 200 Vacuum Regulator',
      source: 'Disinfection Engine',
      status: 'PASS',
      controlType: 'Auto Dual Valve Vacuum Switchover',
      interlocks: ['Gas Leak Detector Emergency Shutoff Valve', 'Scrubber Activation Interlock'],
      accessClearanceM: 1.5,
      maintenanceZoneM2: 12.0,
      procurementStatus: 'APPROVED',
      costEstimateUSD: 48000
    },

    // 9. MISCELLANEOUS
    {
      id: 'EQP-MSC-001',
      tag: 'CRN-EOT-01',
      name: 'High Lift Pump House Electric Overhead Traveling (EOT) Crane',
      category: 'MISCELLANEOUS',
      process: 'High Lift Pump House',
      service: 'Heavy Pump & Motor Maintenance Lifting',
      duty: 1,
      standby: 0,
      quantity: 1,
      capacityPerUnit: 10.0,
      unit: 'Tons',
      powerKw: 11.0,
      motorKw: 15.0,
      efficiencyPercent: 88,
      material: 'Structural Steel Girder / Wire Rope Hoist',
      manufacturer: 'Demag / Konecranes',
      model: 'CXT-10T',
      source: 'Lifting Engine',
      status: 'PASS',
      controlType: 'Pendant & Radio Remote Control',
      interlocks: ['Overhoist Limit Switch', 'Overload Limit Switch'],
      accessClearanceM: 3.0,
      procurementStatus: 'APPROVED',
      costEstimateUSD: 85000
    }
  ];

  return register;
}
