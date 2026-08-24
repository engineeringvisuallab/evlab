import { CalculatedWtpState } from './dependencyEngine';
import { MasterEquipmentItem, generateMasterEquipmentRegister } from './equipmentEngine';

export interface ElectricalDesignBasis {
  highVoltageKv: number;          // e.g. 11.0 kV or 33.0 kV
  lowVoltageV: number;           // e.g. 415 V or 400 V
  phases: number;                // 3
  frequencyHz: number;          // 50 Hz or 60 Hz
  powerFactor: number;           // e.g. 0.85
  demandFactor: number;          // e.g. 0.82
  diversityFactor: number;       // e.g. 0.80
  ambientTemperatureC: number;  // 40°C
  busFaultLevelKa: number;       // 25 kA / 50 kA
  earthingSystem: 'TN-S' | 'TN-C-S' | 'TT' | 'IT';
  targetPowerFactor: number;     // 0.98
}

export interface ElectricalLoadItem {
  id: string;
  equipmentTag: string;
  description: string;
  processUnit: string;
  quantity: number;
  duty: number;
  standby: number;
  motorKw: number;
  connectedKw: number;
  demandKw: number;
  runningKva: number;
  voltageV: number;
  fullLoadAmps: number;
  startingCurrentAmps: number;
  starterType: 'DOL' | 'STAR_DELTA' | 'SOFT_STARTER' | 'VFD';
  category: 'CRITICAL' | 'ESSENTIAL' | 'NON_ESSENTIAL';
  mccPanel: string;
  cableTag: string;
  cableSizeMm2: string;
  runningVoltageDropPercent: number;
}

export interface ElectricalLoadListResult {
  loadItems: ElectricalLoadItem[];
  totalConnectedKw: number;
  totalDemandKw: number;
  totalConnectedKva: number;
  totalDemandKva: number;
  criticalDemandKw: number;
  essentialDemandKw: number;
  nonEssentialDemandKw: number;
  averagePowerFactor: number;
}

export interface MotorElectricalResult {
  ratedKw: number;
  horsepowerHp: number;
  voltageV: number;
  phase: number;
  frequencyHz: number;
  efficiencyPercent: number;
  powerFactor: number;
  fullLoadAmps: number;
  startingCurrentAmps: number;
  startingCurrentRatio: number;
  runningKva: number;
  startingKva: number;
  starterType: 'DOL' | 'STAR_DELTA' | 'SOFT_STARTER' | 'VFD';
}

export interface VfdAnalysisResult {
  equipmentTag: string;
  motorKw: number;
  vfdRatingKw: number;
  speedRangeRpm: [number, number];
  operatingFrequencyHz: number;
  speedRatioPercent: number;
  affinityFlowM3hr: number;
  affinityHeadM: number;
  affinityPowerKw: number;
  estimatedEnergySavingsPercent: number;
  thdCurrentPercent: number;
  harmonicFilterRecommended: boolean;
}

export interface TransformerSizingResult {
  totalDemandKva: number;
  designSpareMarginPercent: number;
  calculatedKva: number;
  standardSelectedKva: number;
  primaryVoltageKv: number;
  secondaryVoltageV: number;
  loadingPercent: number;
  redundancyScheme: 'SINGLE' | 'DUAL_50_50' | 'DUAL_100_100_N1';
  status: 'PASS' | 'WARNING' | 'FAIL';
  efficiencyPercent: number;
  fullLoadLossKw: number;
}

export interface GeneratorSizingResult {
  essentialDemandKw: number;
  essentialDemandKva: number;
  largestMotorStartingKva: number;
  calculatedGeneratorKva: number;
  standardSelectedGeneratorKva: number;
  fuelConsumptionLhr: number;
  autonomyHours: number;
  totalFuelTankVolumeLiters: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
}

export interface UpsSizingResult {
  criticalLoadKw: number;
  criticalLoadKva: number;
  inverterCapacityKva: number;
  autonomyHours: number;
  dcBusVoltageV: number;
  batteryCapacityAh: number;
  recommendedBatteryType: 'VRLA_AGM' | 'GEL' | 'LITHIUM_ION';
  status: 'PASS' | 'WARNING' | 'FAIL';
}

export interface CableSizingResult {
  cableTag: string;
  equipmentTag: string;
  designCurrentAmps: number;
  conductorMaterial: 'COPPER' | 'ALUMINIUM';
  insulationType: 'XLPE' | 'PVC';
  numberOfCores: number;
  recommendedSizeMm2: number;
  cableLengthM: number;
  runningVoltageDropV: number;
  runningVoltageDropPercent: number;
  startingVoltageDropPercent: number;
  voltageDropStatus: 'PASS' | 'WARNING' | 'FAIL';
  shortCircuitWithstandKa: number;
}

export interface MccPanelResult {
  panelTag: string;
  name: string;
  connectedKw: number;
  demandKw: number;
  busbarRatingAmps: number;
  incomingBreakerRatingAmps: number;
  feedersCount: number;
  spareFeedersCount: number;
  panelUtilizationPercent: number;
}

export interface PowerFactorCorrectionResult {
  operatingKw: number;
  initialPowerFactor: number;
  targetPowerFactor: number;
  initialKvar: number;
  targetKvar: number;
  requiredCapacitorKvar: number;
  recommendedBankSteps: string;
  annualEnergyCostSavingsUSD: number;
}

// Standard Transformer Ratings (kVA)
const STANDARD_TRANSFORMER_KVA = [100, 160, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000];

// Standard Generator Ratings (kVA)
const STANDARD_GENERATOR_KVA = [50, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1500, 2000, 2500];

// Cable Ampacity Lookup (Copper XLPE 3-Core in duct/ground at 40°C)
const COPPER_CABLE_AMPACITY: Record<number, number> = {
  2.5: 28,
  4: 37,
  6: 47,
  10: 65,
  16: 87,
  25: 114,
  35: 139,
  50: 167,
  70: 207,
  95: 251,
  120: 289,
  150: 328,
  185: 375,
  240: 441,
  300: 504
};

/**
 * Motor Electrical Calculation Engine
 */
export function calculateMotorElectrical(
  motorKw: number,
  voltageV: number = 415,
  starterType: 'DOL' | 'STAR_DELTA' | 'SOFT_STARTER' | 'VFD' = 'STAR_DELTA',
  pf: number = 0.85,
  efficiencyPercent: number = 92
): MotorElectricalResult {
  const horsepowerHp = Number((motorKw * 1.34102).toFixed(1));
  const efficiencyRatio = efficiencyPercent / 100;
  
  // FLA = (kW * 1000) / (√3 * V * PF * η)
  const fullLoadAmps = Number(((motorKw * 1000) / (Math.sqrt(3) * voltageV * pf * efficiencyRatio)).toFixed(1));
  
  // Starting Current Multiplier
  let startingMultiplier = 6.5;
  if (starterType === 'STAR_DELTA') startingMultiplier = 2.2;
  else if (starterType === 'SOFT_STARTER') startingMultiplier = 3.0;
  else if (starterType === 'VFD') startingMultiplier = 1.1;

  const startingCurrentAmps = Number((fullLoadAmps * startingMultiplier).toFixed(1));
  const runningKva = Number(((motorKw) / (pf * efficiencyRatio)).toFixed(1));
  const startingKva = Number(((startingCurrentAmps * Math.sqrt(3) * voltageV) / 1000).toFixed(1));

  return {
    ratedKw: motorKw,
    horsepowerHp,
    voltageV,
    phase: 3,
    frequencyHz: 50,
    efficiencyPercent,
    powerFactor: pf,
    fullLoadAmps,
    startingCurrentAmps,
    startingCurrentRatio: startingMultiplier,
    runningKva,
    startingKva,
    starterType
  };
}

/**
 * Electrical Load List Engine
 * Generates connected and demand load schedule from Phase 06 equipment register.
 */
export function generateElectricalLoadList(
  equipmentList: MasterEquipmentItem[],
  basis: ElectricalDesignBasis = {
    highVoltageKv: 11.0,
    lowVoltageV: 415,
    phases: 3,
    frequencyHz: 50,
    powerFactor: 0.85,
    demandFactor: 0.82,
    diversityFactor: 0.80,
    ambientTemperatureC: 40,
    busFaultLevelKa: 25,
    earthingSystem: 'TN-S',
    targetPowerFactor: 0.98
  }
): ElectricalLoadListResult {
  let totalConnectedKw = 0;
  let totalDemandKw = 0;
  let criticalDemandKw = 0;
  let essentialDemandKw = 0;
  let nonEssentialDemandKw = 0;

  const loadItems: ElectricalLoadItem[] = equipmentList.map((item, index) => {
    const motorKw = item.motorKw || item.powerKw || 5.5;
    const connectedKw = item.quantity * motorKw;
    const demandKw = item.duty * motorKw * basis.demandFactor;

    totalConnectedKw += connectedKw;
    totalDemandKw += demandKw;

    // Load Criticality Classification
    let category: 'CRITICAL' | 'ESSENTIAL' | 'NON_ESSENTIAL' = 'ESSENTIAL';
    if (item.category === 'DISINFECTION' || item.category === 'CHEMICAL' || item.category === 'MISCELLANEOUS') {
      category = 'CRITICAL';
      criticalDemandKw += demandKw;
    } else if (item.category === 'HYDRAULIC' || item.category === 'AERATION' || item.category === 'FILTRATION') {
      category = 'ESSENTIAL';
      essentialDemandKw += demandKw;
    } else {
      category = 'NON_ESSENTIAL';
      nonEssentialDemandKw += demandKw;
    }

    const motorElec = calculateMotorElectrical(motorKw, basis.lowVoltageV, item.motorStartingMethod || 'STAR_DELTA', basis.powerFactor);
    const cableTag = `CBL-${item.tag.split('/')[0]}`;
    
    // Cable sizing heuristic
    const recommendedSize = item.motorKw && item.motorKw > 110 ? '3C x 240 mm²' : item.motorKw && item.motorKw > 30 ? '3C x 95 mm²' : '3C x 16 mm²';

    return {
      id: `LOAD-${index + 1}`,
      equipmentTag: item.tag,
      description: item.name,
      processUnit: item.process,
      quantity: item.quantity,
      duty: item.duty,
      standby: item.standby,
      motorKw,
      connectedKw: Number(connectedKw.toFixed(1)),
      demandKw: Number(demandKw.toFixed(1)),
      runningKva: Number((demandKw / basis.powerFactor).toFixed(1)),
      voltageV: basis.lowVoltageV,
      fullLoadAmps: motorElec.fullLoadAmps,
      startingCurrentAmps: motorElec.startingCurrentAmps,
      starterType: item.motorStartingMethod || 'STAR_DELTA',
      category,
      mccPanel: `MCC-0${(index % 3) + 1}`,
      cableTag,
      cableSizeMm2: recommendedSize,
      runningVoltageDropPercent: 1.4
    };
  });

  const totalConnectedKva = Number((totalConnectedKw / basis.powerFactor).toFixed(1));
  const totalDemandKva = Number((totalDemandKw / basis.powerFactor).toFixed(1));

  return {
    loadItems,
    totalConnectedKw: Number(totalConnectedKw.toFixed(1)),
    totalDemandKw: Number(totalDemandKw.toFixed(1)),
    totalConnectedKva,
    totalDemandKva,
    criticalDemandKw: Number(criticalDemandKw.toFixed(1)),
    essentialDemandKw: Number(essentialDemandKw.toFixed(1)),
    nonEssentialDemandKw: Number(nonEssentialDemandKw.toFixed(1)),
    averagePowerFactor: basis.powerFactor
  };
}

/**
 * Transformer Sizing Engine
 */
export function calculateTransformerSizing(
  totalDemandKw: number,
  powerFactor: number = 0.85,
  spareMarginPercent: number = 20,
  redundancyScheme: 'SINGLE' | 'DUAL_50_50' | 'DUAL_100_100_N1' = 'DUAL_100_100_N1'
): TransformerSizingResult {
  const totalDemandKva = totalDemandKw / powerFactor;
  const calculatedKva = totalDemandKva * (1 + spareMarginPercent / 100);

  let standardSelectedKva = STANDARD_TRANSFORMER_KVA[STANDARD_TRANSFORMER_KVA.length - 1];
  for (const stdKva of STANDARD_TRANSFORMER_KVA) {
    if (stdKva >= calculatedKva) {
      standardSelectedKva = stdKva;
      break;
    }
  }

  const loadingPercent = Number(((totalDemandKva / standardSelectedKva) * 100).toFixed(1));
  let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
  if (loadingPercent > 90) status = 'FAIL';
  else if (loadingPercent > 80) status = 'WARNING';

  return {
    totalDemandKva: Number(totalDemandKva.toFixed(1)),
    designSpareMarginPercent: spareMarginPercent,
    calculatedKva: Number(calculatedKva.toFixed(1)),
    standardSelectedKva,
    primaryVoltageKv: 11.0,
    secondaryVoltageV: 415,
    loadingPercent,
    redundancyScheme,
    status,
    efficiencyPercent: 98.8,
    fullLoadLossKw: Number((standardSelectedKva * 0.012).toFixed(1))
  };
}

/**
 * Diesel Generator Sizing Engine
 */
export function calculateGeneratorSizing(
  essentialDemandKw: number,
  largestMotorKw: number = 132,
  powerFactor: number = 0.85,
  autonomyHours: number = 24
): GeneratorSizingResult {
  const essentialDemandKva = essentialDemandKw / powerFactor;
  const largestMotorElec = calculateMotorElectrical(largestMotorKw, 415, 'SOFT_STARTER', powerFactor);
  
  // Generator kVA = Essential Running kVA + 0.35 * Starting kVA of largest motor
  const calculatedGeneratorKva = essentialDemandKva + (largestMotorElec.startingKva * 0.25);

  let standardSelectedGeneratorKva = STANDARD_GENERATOR_KVA[STANDARD_GENERATOR_KVA.length - 1];
  for (const stdKva of STANDARD_GENERATOR_KVA) {
    if (stdKva >= calculatedGeneratorKva) {
      standardSelectedGeneratorKva = stdKva;
      break;
    }
  }

  // Fuel consumption ~ 0.22 L/kWh
  const fuelConsumptionLhr = Number((essentialDemandKw * 0.22).toFixed(1));
  const totalFuelTankVolumeLiters = Math.ceil(fuelConsumptionLhr * autonomyHours);

  return {
    essentialDemandKw: Number(essentialDemandKw.toFixed(1)),
    essentialDemandKva: Number(essentialDemandKva.toFixed(1)),
    largestMotorStartingKva: largestMotorElec.startingKva,
    calculatedGeneratorKva: Number(calculatedGeneratorKva.toFixed(1)),
    standardSelectedGeneratorKva,
    fuelConsumptionLhr,
    autonomyHours,
    totalFuelTankVolumeLiters,
    status: 'PASS'
  };
}

/**
 * UPS Engine
 */
export function calculateUpsSizing(
  criticalLoadKw: number,
  powerFactor: number = 0.8,
  autonomyHours: number = 4
): UpsSizingResult {
  const criticalLoadKva = criticalLoadKw / powerFactor;
  const inverterCapacityKva = Number((criticalLoadKva * 1.25).toFixed(1)); // 25% margin
  const dcBusVoltageV = 110;

  // Ah = (kW * 1000 * hours) / (DC_V * inverter_eff)
  const batteryCapacityAh = Math.ceil((criticalLoadKw * 1000 * autonomyHours) / (dcBusVoltageV * 0.90));

  return {
    criticalLoadKw: Number(criticalLoadKw.toFixed(1)),
    criticalLoadKva: Number(criticalLoadKva.toFixed(1)),
    inverterCapacityKva,
    autonomyHours,
    dcBusVoltageV,
    batteryCapacityAh,
    recommendedBatteryType: 'VRLA_AGM',
    status: 'PASS'
  };
}

/**
 * Cable Sizing Engine
 */
export function calculateCableSizing(
  designCurrentAmps: number,
  cableLengthM: number = 100,
  conductorMaterial: 'COPPER' | 'ALUMINIUM' = 'COPPER',
  voltageV: number = 415,
  allowableVoltageDropPercent: number = 3.0
): CableSizingResult {
  // Select cable size
  let recommendedSizeMm2 = 300;
  const sizes = Object.keys(COPPER_CABLE_AMPACITY).map(Number).sort((a, b) => a - b);
  for (const size of sizes) {
    if (COPPER_CABLE_AMPACITY[size] >= designCurrentAmps * 1.15) {
      recommendedSizeMm2 = size;
      break;
    }
  }

  // Voltage drop V = √3 * I * L * (R cos φ + X sin φ) / 1000
  // Approx mV/A/m value for copper XLPE
  const mvPerAmpMeter = (2.0 / recommendedSizeMm2) * 1.5;
  const runningVoltageDropV = (Math.sqrt(3) * designCurrentAmps * cableLengthM * mvPerAmpMeter) / 1000;
  const runningVoltageDropPercent = Number(((runningVoltageDropV / voltageV) * 100).toFixed(2));
  const startingVoltageDropPercent = Number((runningVoltageDropPercent * 2.5).toFixed(2));

  let voltageDropStatus: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
  if (runningVoltageDropPercent > allowableVoltageDropPercent) voltageDropStatus = 'FAIL';
  else if (runningVoltageDropPercent > allowableVoltageDropPercent * 0.8) voltageDropStatus = 'WARNING';

  return {
    cableTag: `CBL-${recommendedSizeMm2}MM2`,
    equipmentTag: 'EQP-PMP',
    designCurrentAmps: Number(designCurrentAmps.toFixed(1)),
    conductorMaterial,
    insulationType: 'XLPE',
    numberOfCores: 3,
    recommendedSizeMm2,
    cableLengthM,
    runningVoltageDropV: Number(runningVoltageDropV.toFixed(2)),
    runningVoltageDropPercent,
    startingVoltageDropPercent,
    voltageDropStatus,
    shortCircuitWithstandKa: Number((recommendedSizeMm2 * 0.143).toFixed(1))
  };
}

/**
 * Power Factor Correction Engine
 */
export function calculatePowerFactorCorrection(
  operatingKw: number,
  initialPowerFactor: number = 0.80,
  targetPowerFactor: number = 0.98
): PowerFactorCorrectionResult {
  const initialAngle = Math.acos(initialPowerFactor);
  const targetAngle = Math.acos(targetPowerFactor);

  const initialKvar = operatingKw * Math.tan(initialAngle);
  const targetKvar = operatingKw * Math.tan(targetAngle);
  const requiredCapacitorKvar = Number((initialKvar - targetKvar).toFixed(1));

  // Heuristic tariff savings ~$45 per kvar/year
  const annualEnergyCostSavingsUSD = Number((requiredCapacitorKvar * 45).toFixed(0));

  return {
    operatingKw: Number(operatingKw.toFixed(1)),
    initialPowerFactor,
    targetPowerFactor,
    initialKvar: Number(initialKvar.toFixed(1)),
    targetKvar: Number(targetKvar.toFixed(1)),
    requiredCapacitorKvar,
    recommendedBankSteps: `Automatic APFC Panel: ${Math.ceil(requiredCapacitorKvar / 50)} x 50 kvar Steps`,
    annualEnergyCostSavingsUSD
  };
}
