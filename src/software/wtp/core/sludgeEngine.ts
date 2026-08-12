/**
 * WTP Engineering Suite - Phase 09
 * Sludge Master Model, Solids Balance, Sources, Pumping, Storage,
 * Reuse/Disposal, Environmental Discharge, Odour & Environmental Risk Register
 */

import { CalculatedWtpState } from './dependencyEngine';

export interface SludgeStream {
  id: string;
  sourceProcess: string;
  flowM3Day: number;
  flowM3Hr: number;
  tssMgL: number;
  suspendedSolidsKgDay: number;
  chemicalSolidsKgDay: number;
  organicSolidsKgDay: number;
  totalDrySolidsKgDay: number;
  wetSludgeVolumeM3Day: number;
  moisturePercent: number;
  solidsConcentrationPercent: number;
  densityKgM3: number;
  ph: number;
  temperatureC: number;
  status: 'ACTIVE' | 'STANDBY' | 'WARNING' | 'RECYCLED';
}

export interface SolidsBalance {
  rawWaterTssKgDay: number;
  chemicalPrecipitateKgDay: number;
  alumPrecipitateKgDay: number;
  ferricPrecipitateKgDay: number;
  pacPrecipitateKgDay: number;
  limeSofteningKgDay: number;
  ironManganesePrecipitateKgDay: number;
  polymerSolidsKgDay: number;
  totalDrySolidsGeneratedKgDay: number;
  drySolidsKgHr: number;
  drySolidsGPerM3Treated: number;
  tssCapturedPercent: number;
  tssLeavingEffluentKgDay: number;
  reconciliationStatus: 'RECONCILED' | 'UNBALANCED';
}

export interface SludgePumpingHydraulics {
  sludgeFlowM3Hr: number;
  solidsPercent: number;
  pipeDiameterMm: number;
  pipeVelocityMS: number;
  pipeLengthM: number;
  viscosityCorrectionFactor: number;
  headLossM: number;
  staticHeadM: number;
  totalDynamicHeadM: number;
  pumpPowerKw: number;
  selectedPumpType: 'PROGRESSIVE_CAVITY' | 'CENTRIFUGAL' | 'PERISTALTIC' | 'SCREW_PUMP';
  velocityWarning?: string;
}

export interface SludgeStorageAndCake {
  dailyDrySolidsKgDay: number;
  targetCakeSolidsPercent: number;
  wetCakeKgDay: number;
  wetCakeM3Day: number;
  cakeDensityKgM3: number;
  storageAutonomyDays: number;
  requiredCakeStorageVolumeM3: number;
  recommendedStorageSilos: number;
  haulingTrucksPerDay: number;
  haulingTripsPerMonth: number;
  truckCapacityM3: number;
}

export interface EnvironmentalDischargeModel {
  dischargeFlowM3Day: number;
  effluentPh: number;
  effluentTssMgL: number;
  effluentTurbidityNtu: number;
  effluentCodMgL: number;
  effluentBodMgL: number;
  effluentTdsMgL: number;
  residualChlorineMgL: number;
  receivingWaterFlowM3Day: number;
  dilutionFactor: number;
  downstreamTssMgL: number;
  complianceStatus: 'PASS' | 'WARNING' | 'FAIL' | 'ENGINEER_INPUT_REQUIRED';
}

export interface EnvironmentalRiskItem {
  id: string;
  source: string;
  hazard: string;
  impact: string;
  probability: 'LOW' | 'MEDIUM' | 'HIGH';
  severity: 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  controlMeasure: string;
  responsiblePerson: string;
  status: 'CONTROLLED' | 'ACTION_REQUIRED' | 'UNDER_REVIEW';
}

export interface SludgeEnergyAndCost {
  sludgePumpingKwhDay: number;
  thickenerEnergyKwhDay: number;
  dewateringEnergyKwhDay: number;
  polymerSystemKwhDay: number;
  totalSludgeEnergyKwhDay: number;
  specificEnergyKwhPerTonneDS: number;
  dailyPolymerCostUSD: number;
  dailyElectricityCostUSD: number;
  dailyHaulingCostUSD: number;
  dailyDisposalCostUSD: number;
  totalDailyResidualsCostUSD: number;
  costPerTonneDrySolidsUSD: number;
  costPerM3TreatedWaterUSD: number;
}

/**
 * 1. Calculate Comprehensive Solids Balance across all WTP chemical and TSS sources
 */
export function calculateSolidsBalance(
  plantCapacityMLD: number,
  tssRawMgL: number = 120,
  tssTargetMgL: number = 2,
  alumDoseMgL: number = 35,
  ferricDoseMgL: number = 0,
  pacDoseMgL: number = 0,
  limeDoseMgL: number = 12,
  rawFeMgL: number = 1.8,
  rawMnMgL: number = 0.4,
  polymerDoseMgL: number = 0.5
): SolidsBalance {
  const rawFlowM3Day = plantCapacityMLD * 1000;

  // TSS captured
  const tssCapturedMgL = Math.max(0, tssRawMgL - tssTargetMgL);
  const rawWaterTssKgDay = (rawFlowM3Day * tssCapturedMgL) / 1000;
  const tssLeavingEffluentKgDay = (rawFlowM3Day * tssTargetMgL) / 1000;
  const tssCapturedPercent = Number(((tssCapturedMgL / (tssRawMgL || 1)) * 100).toFixed(1));

  // Chemical Precipitates
  // Alum: 1 mg Alum -> 0.26 mg Al(OH)3 precipitate
  const alumPrecipitateKgDay = (rawFlowM3Day * (alumDoseMgL * 0.26)) / 1000;
  // Ferric: 1 mg FeCl3 -> 0.66 mg Fe(OH)3
  const ferricPrecipitateKgDay = (rawFlowM3Day * (ferricDoseMgL * 0.66)) / 1000;
  // PAC: 1 mg PAC -> 0.35 mg Al(OH)3
  const pacPrecipitateKgDay = (rawFlowM3Day * (pacDoseMgL * 0.35)) / 1000;
  // Lime softening / pH adjustment: 1 mg Lime -> 1.35 mg CaCO3/Mg(OH)2
  const limeSofteningKgDay = (rawFlowM3Day * (limeDoseMgL * 1.0)) / 1000;
  // Iron & Manganese removal: 1 mg Fe -> 1.91 mg Fe(OH)3, 1 mg Mn -> 1.58 mg MnO2
  const ironPrecipitateKgDay = (rawFlowM3Day * (rawFeMgL * 1.91)) / 1000;
  const manganesePrecipitateKgDay = (rawFlowM3Day * (rawMnMgL * 1.58)) / 1000;
  const ironManganesePrecipitateKgDay = ironPrecipitateKgDay + manganesePrecipitateKgDay;

  // Polymer solids
  const polymerSolidsKgDay = (rawFlowM3Day * polymerDoseMgL) / 1000;

  const chemicalPrecipitateKgDay =
    alumPrecipitateKgDay +
    ferricPrecipitateKgDay +
    pacPrecipitateKgDay +
    limeSofteningKgDay +
    ironManganesePrecipitateKgDay +
    polymerSolidsKgDay;

  const totalDrySolidsGeneratedKgDay = rawWaterTssKgDay + chemicalPrecipitateKgDay;
  const drySolidsKgHr = totalDrySolidsGeneratedKgDay / 24;
  const drySolidsGPerM3Treated = (totalDrySolidsGeneratedKgDay * 1000) / rawFlowM3Day;

  return {
    rawWaterTssKgDay: Number(rawWaterTssKgDay.toFixed(1)),
    chemicalPrecipitateKgDay: Number(chemicalPrecipitateKgDay.toFixed(1)),
    alumPrecipitateKgDay: Number(alumPrecipitateKgDay.toFixed(1)),
    ferricPrecipitateKgDay: Number(ferricPrecipitateKgDay.toFixed(1)),
    pacPrecipitateKgDay: Number(pacPrecipitateKgDay.toFixed(1)),
    limeSofteningKgDay: Number(limeSofteningKgDay.toFixed(1)),
    ironManganesePrecipitateKgDay: Number(ironManganesePrecipitateKgDay.toFixed(1)),
    polymerSolidsKgDay: Number(polymerSolidsKgDay.toFixed(1)),
    totalDrySolidsGeneratedKgDay: Number(totalDrySolidsGeneratedKgDay.toFixed(1)),
    drySolidsKgHr: Number(drySolidsKgHr.toFixed(2)),
    drySolidsGPerM3Treated: Number(drySolidsGPerM3Treated.toFixed(2)),
    tssCapturedPercent,
    tssLeavingEffluentKgDay: Number(tssLeavingEffluentKgDay.toFixed(1)),
    reconciliationStatus: 'RECONCILED'
  };
}

/**
 * 2. Generate Master Sludge Source Registry Streams
 */
export function generateSludgeSourceRegistry(
  state: CalculatedWtpState,
  solids: SolidsBalance
): SludgeStream[] {
  const cap = state.plantCapacityMLD || 50;
  const flowM3Day = cap * 1000;

  return [
    {
      id: 'STR-SLD-001',
      sourceProcess: 'Intake Coarse/Fine Screenings',
      flowM3Day: Number((cap * 0.05).toFixed(1)),
      flowM3Hr: Number((cap * 0.05 / 24).toFixed(2)),
      tssMgL: 5000,
      suspendedSolidsKgDay: Number((solids.rawWaterTssKgDay * 0.02).toFixed(1)),
      chemicalSolidsKgDay: 0,
      organicSolidsKgDay: Number((solids.rawWaterTssKgDay * 0.02).toFixed(1)),
      totalDrySolidsKgDay: Number((solids.rawWaterTssKgDay * 0.02).toFixed(1)),
      wetSludgeVolumeM3Day: Number((cap * 0.05).toFixed(1)),
      moisturePercent: 95.0,
      solidsConcentrationPercent: 5.0,
      densityKgM3: 1020,
      ph: 7.2,
      temperatureC: 25,
      status: 'ACTIVE'
    },
    {
      id: 'STR-SLD-002',
      sourceProcess: 'Clarifier / Tube Settler Blowdown Sludge',
      flowM3Day: Number((solids.totalDrySolidsGeneratedKgDay * 0.85 / (1000 * 0.025)).toFixed(1)),
      flowM3Hr: Number((solids.totalDrySolidsGeneratedKgDay * 0.85 / (1000 * 0.025 * 24)).toFixed(2)),
      tssMgL: 25000,
      suspendedSolidsKgDay: Number((solids.rawWaterTssKgDay * 0.85).toFixed(1)),
      chemicalSolidsKgDay: Number((solids.chemicalPrecipitateKgDay * 0.85).toFixed(1)),
      organicSolidsKgDay: Number((solids.rawWaterTssKgDay * 0.20).toFixed(1)),
      totalDrySolidsKgDay: Number((solids.totalDrySolidsGeneratedKgDay * 0.85).toFixed(1)),
      wetSludgeVolumeM3Day: Number((solids.totalDrySolidsGeneratedKgDay * 0.85 / (1000 * 0.025)).toFixed(1)),
      moisturePercent: 97.5,
      solidsConcentrationPercent: 2.5,
      densityKgM3: 1015,
      ph: 6.9,
      temperatureC: 25,
      status: 'ACTIVE'
    },
    {
      id: 'STR-SLD-003',
      sourceProcess: 'Rapid Sand Filter Backwash Waste Residuals',
      flowM3Day: Number((flowM3Day * 0.035).toFixed(1)),
      flowM3Hr: Number((flowM3Day * 0.035 / 24).toFixed(2)),
      tssMgL: 600,
      suspendedSolidsKgDay: Number((solids.rawWaterTssKgDay * 0.13).toFixed(1)),
      chemicalSolidsKgDay: Number((solids.chemicalPrecipitateKgDay * 0.13).toFixed(1)),
      organicSolidsKgDay: 0,
      totalDrySolidsKgDay: Number((solids.totalDrySolidsGeneratedKgDay * 0.13).toFixed(1)),
      wetSludgeVolumeM3Day: Number((flowM3Day * 0.035).toFixed(1)),
      moisturePercent: 99.8,
      solidsConcentrationPercent: 0.2,
      densityKgM3: 1002,
      ph: 7.0,
      temperatureC: 25,
      status: 'ACTIVE'
    },
    {
      id: 'STR-SLD-004',
      sourceProcess: 'Iron & Manganese Contact Clarifier Sludge',
      flowM3Day: Number((solids.ironManganesePrecipitateKgDay / (1000 * 0.02)).toFixed(1)),
      flowM3Hr: Number((solids.ironManganesePrecipitateKgDay / (1000 * 0.02 * 24)).toFixed(2)),
      tssMgL: 20000,
      suspendedSolidsKgDay: 0,
      chemicalSolidsKgDay: solids.ironManganesePrecipitateKgDay,
      organicSolidsKgDay: 0,
      totalDrySolidsKgDay: solids.ironManganesePrecipitateKgDay,
      wetSludgeVolumeM3Day: Number((solids.ironManganesePrecipitateKgDay / (1000 * 0.02)).toFixed(1)),
      moisturePercent: 98.0,
      solidsConcentrationPercent: 2.0,
      densityKgM3: 1018,
      ph: 7.8,
      temperatureC: 25,
      status: 'ACTIVE'
    }
  ];
}

/**
 * 3. Sludge Density Calculation (Temperature & Solids Fraction Corrected)
 */
export function calculateSludgeDensity(
  solidsFractionPercent: number,
  temperatureC: number = 20,
  drySolidsDensityKgM3: number = 1800
): { sludgeDensityKgM3: number; waterDensityKgM3: number } {
  // Water density approx as function of temp: 1000 - 0.015 * (T - 4)^2
  const waterDensity = 1000 - 0.015 * Math.pow(temperatureC - 4, 2);
  const Sf = Math.min(0.5, Math.max(0.001, solidsFractionPercent / 100));

  // 1 / rho_sludge = (Sf / rho_solids) + ((1 - Sf) / rho_water)
  const sludgeDensity = 1 / (Sf / drySolidsDensityKgM3 + (1 - Sf) / waterDensity);

  return {
    sludgeDensityKgM3: Number(sludgeDensity.toFixed(1)),
    waterDensityKgM3: Number(waterDensity.toFixed(1))
  };
}

/**
 * 4. Sludge Pumping Hydraulics Engine
 */
export function calculateSludgePumpingHydraulics(
  sludgeFlowM3Hr: number,
  solidsConcentrationPercent: number = 3.0,
  pipeDiameterMm: number = 150,
  pipeLengthM: number = 150,
  staticHeadM: number = 8.0,
  pumpType: 'PROGRESSIVE_CAVITY' | 'CENTRIFUGAL' | 'PERISTALTIC' | 'SCREW_PUMP' = 'PROGRESSIVE_CAVITY'
): SludgePumpingHydraulics {
  const dM = pipeDiameterMm / 1000;
  const areaM2 = (Math.PI * Math.pow(dM, 2)) / 4;
  const flowM3s = sludgeFlowM3Hr / 3600;
  const velocityMS = flowM3s / (areaM2 || 0.001);

  // Viscosity multiplier for sludge: 1 + 0.15 * (solids%)^1.5
  const viscosityFactor = 1 + 0.15 * Math.pow(solidsConcentrationPercent, 1.5);

  // Base Hazen-Williams friction loss (C=110 for sludge pipe)
  const cVal = 110;
  const hfBase =
    10.67 * pipeLengthM * Math.pow(flowM3s, 1.852) / (Math.pow(cVal, 1.852) * Math.pow(dM, 4.87));
  const headLossM = hfBase * viscosityFactor;
  const totalDynamicHeadM = staticHeadM + headLossM;

  // Pump power Kw: (Q_lps * 9.81 * TDH) / (1000 * efficiency)
  const qLps = sludgeFlowM3Hr / 3.6;
  const eff = pumpType === 'PROGRESSIVE_CAVITY' ? 0.65 : 0.55;
  const pumpPowerKw = (qLps * 9.81 * totalDynamicHeadM) / (1000 * eff);

  let velocityWarning: string | undefined = undefined;
  if (velocityMS < 0.8) {
    velocityWarning = 'Sludge pipe velocity is below 0.8 m/s. Risk of solids settling and clogging.';
  } else if (velocityMS > 2.0) {
    velocityWarning = 'Sludge pipe velocity exceeds 2.0 m/s. Excessive head loss and pipe erosion risk.';
  }

  return {
    sludgeFlowM3Hr: Number(sludgeFlowM3Hr.toFixed(2)),
    solidsPercent: solidsConcentrationPercent,
    pipeDiameterMm,
    pipeVelocityMS: Number(velocityMS.toFixed(2)),
    pipeLengthM,
    viscosityCorrectionFactor: Number(viscosityFactor.toFixed(2)),
    headLossM: Number(headLossM.toFixed(2)),
    staticHeadM,
    totalDynamicHeadM: Number(totalDynamicHeadM.toFixed(2)),
    pumpPowerKw: Number(pumpPowerKw.toFixed(2)),
    selectedPumpType: pumpType,
    velocityWarning
  };
}

/**
 * 5. Sludge Storage & Dewatered Cake Production
 */
export function calculateSludgeStorageAndCake(
  drySolidsKgDay: number,
  cakeSolidsPercent: number = 30.0,
  autonomyDays: number = 3,
  truckCapacityM3: number = 15
): SludgeStorageAndCake {
  const cakeFraction = cakeSolidsPercent / 100;
  const cakeDensity = 1100; // kg/m3 for dewatered cake
  const wetCakeKgDay = drySolidsKgDay / cakeFraction;
  const wetCakeM3Day = wetCakeKgDay / cakeDensity;

  const requiredVolumeM3 = wetCakeM3Day * autonomyDays;
  const storageSilos = Math.max(1, Math.ceil(requiredVolumeM3 / 60)); // 60m3 per silo

  const trucksPerDay = Number((wetCakeM3Day / truckCapacityM3).toFixed(2));
  const tripsPerMonth = Math.ceil(trucksPerDay * 30);

  return {
    dailyDrySolidsKgDay: Number(drySolidsKgDay.toFixed(1)),
    targetCakeSolidsPercent: cakeSolidsPercent,
    wetCakeKgDay: Number(wetCakeKgDay.toFixed(1)),
    wetCakeM3Day: Number(wetCakeM3Day.toFixed(2)),
    cakeDensityKgM3: cakeDensity,
    storageAutonomyDays: autonomyDays,
    requiredCakeStorageVolumeM3: Number(requiredVolumeM3.toFixed(1)),
    recommendedStorageSilos: storageSilos,
    haulingTrucksPerDay: trucksPerDay,
    haulingTripsPerMonth: tripsPerMonth,
    truckCapacityM3
  };
}

/**
 * 6. Environmental Discharge & Dilution Model
 */
export function calculateEnvironmentalDischarge(
  dischargeFlowM3Day: number,
  effluentTssMgL: number = 20,
  receivingWaterFlowM3Day: number = 500000,
  receivingTssMgL: number = 40
): EnvironmentalDischargeModel {
  const dilutionFactor = Number(((receivingWaterFlowM3Day + dischargeFlowM3Day) / dischargeFlowM3Day).toFixed(1));
  const downstreamTss =
    (dischargeFlowM3Day * effluentTssMgL + receivingWaterFlowM3Day * receivingTssMgL) /
    (dischargeFlowM3Day + receivingWaterFlowM3Day);

  const status = effluentTssMgL <= 30 ? 'PASS' : effluentTssMgL <= 50 ? 'WARNING' : 'FAIL';

  return {
    dischargeFlowM3Day,
    effluentPh: 7.2,
    effluentTssMgL,
    effluentTurbidityNtu: 2.5,
    effluentCodMgL: 15,
    effluentBodMgL: 5,
    effluentTdsMgL: 250,
    residualChlorineMgL: 0.1,
    receivingWaterFlowM3Day,
    dilutionFactor,
    downstreamTssMgL: Number(downstreamTss.toFixed(1)),
    complianceStatus: status
  };
}

/**
 * 7. Master Environmental Risk Register
 */
export function generateEnvironmentalRiskRegister(): EnvironmentalRiskItem[] {
  return [
    {
      id: 'ENV-RISK-001',
      source: 'Chemical Dosing & Storage Bay',
      hazard: 'Chlorine Gas / Bulk Acid Leak or Spill',
      impact: 'Operator toxicity hazard, atmospheric discharge, soil contamination',
      probability: 'LOW',
      severity: 'CRITICAL',
      riskLevel: 'HIGH',
      controlMeasure: 'Automated vacuum chlorinator, dual leak detectors, caustic scrubber system',
      responsiblePerson: 'HSE Manager / Safety Officer',
      status: 'CONTROLLED'
    },
    {
      id: 'ENV-RISK-002',
      source: 'Clarifier Sludge Blowdown',
      hazard: 'Sludge Pump Failure & Tank Overflow',
      impact: 'Uncontrolled wet sludge spill into storm drain or yard',
      probability: 'MEDIUM',
      severity: 'MODERATE',
      riskLevel: 'MEDIUM',
      controlMeasure: 'Dual N+1 progressive cavity sludge pumps + ultrasonic high level alarm',
      responsiblePerson: 'Mechanical Lead',
      status: 'CONTROLLED'
    },
    {
      id: 'ENV-RISK-003',
      source: 'Dewatered Cake Storage Hopper',
      hazard: 'Odour & Hydrogen Sulfide Generation',
      impact: 'Nuisance odour emissions impacting neighbouring communities',
      probability: 'MEDIUM',
      severity: 'MODERATE',
      riskLevel: 'MEDIUM',
      controlMeasure: 'Enclosed storage silo + activated carbon air scrubber ventilation',
      responsiblePerson: 'Process Engineer',
      status: 'CONTROLLED'
    },
    {
      id: 'ENV-RISK-004',
      source: 'Backwash Wastewater Basin',
      hazard: 'High Turbidity Discharge into River',
      impact: 'Violates Environmental Permit effluent TSS limit (>30 mg/L)',
      probability: 'LOW',
      severity: 'MAJOR',
      riskLevel: 'HIGH',
      controlMeasure: 'Automated 95% backwash water recycle system with continuous online turbidity analyzer',
      responsiblePerson: 'Plant Operator',
      status: 'CONTROLLED'
    },
    {
      id: 'ENV-RISK-005',
      source: 'Emergency Diesel Generator',
      hazard: 'Exhaust Gas Emissions & Diesel Spill',
      impact: 'Air pollution and potential ground diesel fuel contamination',
      probability: 'LOW',
      severity: 'MODERATE',
      riskLevel: 'MEDIUM',
      controlMeasure: 'Double-walled fuel tank with bund wall retention + catalytic silencer',
      responsiblePerson: 'Electrical Engineer',
      status: 'CONTROLLED'
    }
  ];
}

/**
 * 8. Sludge Energy & Operating Cost Framework
 */
export function calculateSludgeEnergyAndCost(
  solids: SolidsBalance,
  cake: SludgeStorageAndCake,
  polymerDoseKgPerTonDs: number = 3.5,
  elecRateUsd: number = 0.12,
  polymerPriceUsdKg: number = 4.5,
  haulingPriceUsdM3: number = 18.0
): SludgeEnergyAndCost {
  const drySolidsTonneDay = solids.totalDrySolidsGeneratedKgDay / 1000;

  // Energy consumption (kWh/day)
  const pumpingKwh = 45.0;
  const thickenerKwh = 28.0;
  const dewateringKwh = drySolidsTonneDay * 35; // 35 kWh per tonne dry solids
  const polymerKwh = 12.0;
  const totalKwh = pumpingKwh + thickenerKwh + dewateringKwh + polymerKwh;
  const specificKwh = drySolidsTonneDay > 0 ? totalKwh / drySolidsTonneDay : 0;

  // Operating Costs (USD/day)
  const polymerKgDay = drySolidsTonneDay * polymerDoseKgPerTonDs;
  const dailyPolymerCostUSD = polymerKgDay * polymerPriceUsdKg;
  const dailyElectricityCostUSD = totalKwh * elecRateUsd;
  const dailyHaulingCostUSD = cake.wetCakeM3Day * haulingPriceUsdM3;
  const dailyDisposalCostUSD = drySolidsTonneDay * 25.0; // $25/tonne landfill tipping fee

  const totalDailyUSD = dailyPolymerCostUSD + dailyElectricityCostUSD + dailyHaulingCostUSD + dailyDisposalCostUSD;
  const costPerTonneDS = drySolidsTonneDay > 0 ? totalDailyUSD / drySolidsTonneDay : 0;
  const treatedWaterM3Day = (solids.rawWaterTssKgDay > 0 ? (solids.rawWaterTssKgDay * 1000) / 120 : 50000);
  const costPerM3Treated = treatedWaterM3Day > 0 ? totalDailyUSD / treatedWaterM3Day : 0;

  return {
    sludgePumpingKwhDay: pumpingKwh,
    thickenerEnergyKwhDay: thickenerKwh,
    dewateringEnergyKwhDay: Number(dewateringKwh.toFixed(1)),
    polymerSystemKwhDay: polymerKwh,
    totalSludgeEnergyKwhDay: Number(totalKwh.toFixed(1)),
    specificEnergyKwhPerTonneDS: Number(specificKwh.toFixed(1)),
    dailyPolymerCostUSD: Number(dailyPolymerCostUSD.toFixed(2)),
    dailyElectricityCostUSD: Number(dailyElectricityCostUSD.toFixed(2)),
    dailyHaulingCostUSD: Number(dailyHaulingCostUSD.toFixed(2)),
    dailyDisposalCostUSD: Number(dailyDisposalCostUSD.toFixed(2)),
    totalDailyResidualsCostUSD: Number(totalDailyUSD.toFixed(2)),
    costPerTonneDrySolidsUSD: Number(costPerTonneDS.toFixed(2)),
    costPerM3TreatedWaterUSD: Number(costPerM3Treated.toFixed(4))
  };
}
