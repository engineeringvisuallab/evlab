/**
 * EVL WTP Engineering Suite - Comprehensive Chemical, Water Quality & Advanced Treatment Engine
 * Coagulation, Jar Testing, Alkalinity, pH, Disinfection CT, Membrane RO, Chemical Storage & Equipment Generator.
 */

import { getChemicalByCode, ChemicalDefinition, MASTER_CHEMICAL_REGISTRY } from './chemicalRegistry';

// ============================================================================
// 1. COAGULANT DOSING & COMPARISON ENGINE
// ============================================================================

export interface ChemicalDoseResult {
  chemicalCode: string;
  chemicalName: string;
  activeDoseMgL: number;
  commercialDoseMgL: number;
  dailyConsumptionKgDay: number;
  hourlyConsumptionKgHr: number;
  solutionFlowLhr: number;
  alkalinityConsumedMgL: number;
  sludgeProducedKgDay: number;
  dailyCostUSD: number;
  costPerM3USD: number;
}

export function calculateChemicalDose(
  chemicalCode: string,
  activeDoseMgL: number,
  plantCapacityMLD: number,
  stockSolutionPercentOverride?: number
): ChemicalDoseResult {
  const chem = getChemicalByCode(chemicalCode);
  const flowM3day = plantCapacityMLD * 1000;
  
  // Active dose vs Commercial product dose calculation
  const commercialDoseMgL = activeDoseMgL / (chem.activeFraction * (chem.purityPercent / 100));
  
  // Daily and hourly consumption
  const dailyConsumptionKgDay = (commercialDoseMgL * flowM3day) / 1000;
  const hourlyConsumptionKgHr = dailyConsumptionKgDay / 24;
  
  // Solution pump flow in L/hr
  const stockConc = stockSolutionPercentOverride || chem.stockSolutionConcentrationPercent;
  const solutionDensityKgL = chem.densityKgL;
  const solutionFlowLhr = (hourlyConsumptionKgHr / (stockConc / 100)) / solutionDensityKgL;
  
  // Alkalinity consumption and Sludge Yield
  const alkalinityConsumedMgL = activeDoseMgL * chem.alkalinityConsumptionMgLPerMgDose;
  const sludgeProducedKgDay = dailyConsumptionKgDay * chem.sludgeYieldKgPerKgChemical;
  
  // Costs
  const dailyCostUSD = dailyConsumptionKgDay * chem.costPerKgUSD;
  const costPerM3USD = dailyCostUSD / flowM3day;

  return {
    chemicalCode: chem.code,
    chemicalName: chem.name,
    activeDoseMgL: Number(activeDoseMgL.toFixed(2)),
    commercialDoseMgL: Number(commercialDoseMgL.toFixed(2)),
    dailyConsumptionKgDay: Number(dailyConsumptionKgDay.toFixed(1)),
    hourlyConsumptionKgHr: Number(hourlyConsumptionKgHr.toFixed(2)),
    solutionFlowLhr: Number(solutionFlowLhr.toFixed(2)),
    alkalinityConsumedMgL: Number(alkalinityConsumedMgL.toFixed(2)),
    sludgeProducedKgDay: Number(sludgeProducedKgDay.toFixed(1)),
    dailyCostUSD: Number(dailyCostUSD.toFixed(2)),
    costPerM3USD: Number(costPerM3USD.toFixed(4))
  };
}

export interface CoagulantComparisonItem {
  chemicalCode: string;
  chemicalName: string;
  recommendedDoseMgL: number;
  commercialDoseMgL: number;
  alkalinityConsumedMgL: number;
  estimatedPhDrop: number;
  sludgeProducedKgDay: number;
  finalTurbidityNTU: number;
  residualMetalMgL: number;
  dailyCostUSD: number;
  costPerM3USD: number;
  engineeringRemarks: string;
}

export function compareCoagulants(plantCapacityMLD: number, rawTurbidityNTU: number, rawAlkalinityMgL: number): CoagulantComparisonItem[] {
  // 1. Alum
  const alumDose = Math.max(15, rawTurbidityNTU * 0.35 + 10);
  const alumCalc = calculateChemicalDose('ALUM', alumDose, plantCapacityMLD);
  const alumPhDrop = (alumCalc.alkalinityConsumedMgL / rawAlkalinityMgL) * 0.45;

  // 2. Ferric Chloride
  const ferricDose = Math.max(12, rawTurbidityNTU * 0.28 + 8);
  const ferricCalc = calculateChemicalDose('FERRIC_CL', ferricDose, plantCapacityMLD);
  const ferricPhDrop = (ferricCalc.alkalinityConsumedMgL / rawAlkalinityMgL) * 0.60;

  // 3. Polyaluminum Chloride (PAC)
  const pacDose = Math.max(10, rawTurbidityNTU * 0.20 + 5);
  const pacCalc = calculateChemicalDose('PAC', pacDose, plantCapacityMLD);
  const pacPhDrop = (pacCalc.alkalinityConsumedMgL / rawAlkalinityMgL) * 0.15;

  return [
    {
      chemicalCode: 'ALUM',
      chemicalName: 'Aluminum Sulfate (Alum)',
      recommendedDoseMgL: Number(alumDose.toFixed(1)),
      commercialDoseMgL: alumCalc.commercialDoseMgL,
      alkalinityConsumedMgL: alumCalc.alkalinityConsumedMgL,
      estimatedPhDrop: Number(alumPhDrop.toFixed(2)),
      sludgeProducedKgDay: alumCalc.sludgeProducedKgDay,
      finalTurbidityNTU: 0.8,
      residualMetalMgL: 0.12,
      dailyCostUSD: alumCalc.dailyCostUSD,
      costPerM3USD: alumCalc.costPerM3USD,
      engineeringRemarks: 'Standard conventional choice. Higher alkalinity consumption; monitor residual Al.'
    },
    {
      chemicalCode: 'FERRIC_CL',
      chemicalName: 'Ferric Chloride',
      recommendedDoseMgL: Number(ferricDose.toFixed(1)),
      commercialDoseMgL: ferricCalc.commercialDoseMgL,
      alkalinityConsumedMgL: ferricCalc.alkalinityConsumedMgL,
      estimatedPhDrop: Number(ferricPhDrop.toFixed(2)),
      sludgeProducedKgDay: ferricCalc.sludgeProducedKgDay,
      finalTurbidityNTU: 0.6,
      residualMetalMgL: 0.08,
      dailyCostUSD: ferricCalc.dailyCostUSD,
      costPerM3USD: ferricCalc.costPerM3USD,
      engineeringRemarks: 'Superior performance in cold/low pH water and organic/TOC removal. Heavier sludge.'
    },
    {
      chemicalCode: 'PAC',
      chemicalName: 'Polyaluminum Chloride (PAC)',
      recommendedDoseMgL: Number(pacDose.toFixed(1)),
      commercialDoseMgL: pacCalc.commercialDoseMgL,
      alkalinityConsumedMgL: pacCalc.alkalinityConsumedMgL,
      estimatedPhDrop: Number(pacPhDrop.toFixed(2)),
      sludgeProducedKgDay: pacCalc.sludgeProducedKgDay,
      finalTurbidityNTU: 0.5,
      residualMetalMgL: 0.05,
      dailyCostUSD: pacCalc.dailyCostUSD,
      costPerM3USD: pacCalc.costPerM3USD,
      engineeringRemarks: 'Pre-hydrolyzed coagulant. Low alkalinity consumption, lower sludge volume, faster settling.'
    }
  ];
}

// ============================================================================
// 2. JAR TEST ENGINE & OPTIMIZATION MATRIX
// ============================================================================

export interface JarTestPoint {
  jarNumber: number;
  chemicalDoseMgL: number;
  rapidMixRpm: number;
  flocculationRpm: number;
  settlingTimeMin: number;
  finalTurbidityNTU: number;
  finalColorTCU: number;
  finalPh: number;
  finalAlkalinityMgL: number;
  flocSizeRating: 'Pin Floc (0.2mm)' | 'Small (0.5mm)' | 'Medium (1.0mm)' | 'Large (2.0mm)' | 'Coarse Heavy (>3mm)';
  settlingVelocityMhr: number;
}

export interface JarTestOptimizationResult {
  testId: string;
  sampleDate: string;
  rawWaterTurbidityNTU: number;
  rawWaterPh: number;
  rawWaterAlkalinityMgL: number;
  testedChemical: string;
  points: JarTestPoint[];
  
  // Optimization Trade-offs
  minTurbidityOptimum: { doseMgL: number; turbidityNTU: number };
  minDoseOptimum: { doseMgL: number; turbidityNTU: number };
  costOptimum: { doseMgL: number; costPerM3USD: number };
  recommendedEngineeringDoseMgL: number;
  selectionRationale: string;
}

export function runJarTestSimulation(
  rawTurbidityNTU: number,
  rawPh: number,
  rawAlkalinityMgL: number,
  chemicalCode = 'ALUM'
): JarTestOptimizationResult {
  const baseDoses = [10, 15, 20, 25, 30, 35];
  const points: JarTestPoint[] = baseDoses.map((dose, idx) => {
    // Parabolic Jar Test Turbidity Curve
    const optDose = 22.5;
    const turbResponse = Math.max(0.4, 0.4 + 0.008 * Math.pow(dose - optDose, 2));
    const colorResponse = Math.max(2, 2 + 0.1 * Math.pow(dose - optDose, 2));
    const phDrop = dose * 0.025;
    const alkDrop = dose * 0.45;

    let flocSize: JarTestPoint['flocSizeRating'] = 'Small (0.5mm)';
    if (dose >= 20 && dose <= 25) flocSize = 'Coarse Heavy (>3mm)';
    else if (dose > 25) flocSize = 'Large (2.0mm)';

    return {
      jarNumber: idx + 1,
      chemicalDoseMgL: dose,
      rapidMixRpm: 120,
      flocculationRpm: 30,
      settlingTimeMin: 15,
      finalTurbidityNTU: Number(turbResponse.toFixed(2)),
      finalColorTCU: Number(colorResponse.toFixed(1)),
      finalPh: Number((rawPh - phDrop).toFixed(2)),
      finalAlkalinityMgL: Number((rawAlkalinityMgL - alkDrop).toFixed(1)),
      flocSizeRating: flocSize,
      settlingVelocityMhr: Number((1.2 + (dose > 20 ? 0.8 : 0.2)).toFixed(2))
    };
  });

  const minTurbPoint = [...points].sort((a, b) => a.finalTurbidityNTU - b.finalTurbidityNTU)[0];
  const minDosePoint = points.find(p => p.finalTurbidityNTU <= 1.0) || points[0];

  return {
    testId: `JAR-2026-EXP-${Math.floor(Math.random() * 8999 + 1000)}`,
    sampleDate: new Date().toISOString().split('T')[0],
    rawWaterTurbidityNTU: rawTurbidityNTU,
    rawWaterPh: rawPh,
    rawWaterAlkalinityMgL: rawAlkalinityMgL,
    testedChemical: chemicalCode,
    points,
    minTurbidityOptimum: { doseMgL: minTurbPoint.chemicalDoseMgL, turbidityNTU: minTurbPoint.finalTurbidityNTU },
    minDoseOptimum: { doseMgL: minDosePoint.chemicalDoseMgL, turbidityNTU: minDosePoint.finalTurbidityNTU },
    costOptimum: { doseMgL: 20, costPerM3USD: 0.0056 },
    recommendedEngineeringDoseMgL: 22.0,
    selectionRationale: 'Selected 22.0 mg/L as optimal balance between turbidity removal (<0.5 NTU), floc settling rate, and alkalinity preservation.'
  };
}

// ============================================================================
// 3. ALKALINITY & pH BALANCE ENGINE
// ============================================================================

export interface AlkalinityBalanceResult {
  rawAlkalinityMgL: number; // as CaCO3
  coagulantAlkalinityConsumptionMgL: number;
  alkalineChemicalAddedMgL: number;
  addedChemicalName: string;
  residualAlkalinityMgL: number;
  residualAlkalinityMeqL: number;
  isAlkalinitySufficient: boolean;
  requiredLimeDoseMgL: number;
  estimatedFinalPh: number;
  phCalculationMode: 'CALCULATED' | 'ENGINEER / LAB INPUT REQUIRED';
}

export function calculateAlkalinityAndPhBalance(
  rawAlkalinityMgL: number,
  rawPh: number,
  coagulantCode: string,
  coagulantDoseMgL: number,
  addedChemicalCode = 'LIME',
  addedChemicalDoseMgL = 0
): AlkalinityBalanceResult {
  const coagulant = getChemicalByCode(coagulantCode);
  const alkConsumption = coagulantDoseMgL * coagulant.alkalinityConsumptionMgLPerMgDose;

  let alkAddition = 0;
  let addedChemName = 'None';
  if (addedChemicalDoseMgL > 0) {
    const addedChem = getChemicalByCode(addedChemicalCode);
    addedChemName = addedChem.name;
    // Alkalinity addition factor
    alkAddition = addedChemicalDoseMgL * Math.abs(addedChem.alkalinityConsumptionMgLPerMgDose);
  }

  const residualAlk = rawAlkalinityMgL - alkConsumption + alkAddition;
  const isAlkalinitySufficient = residualAlk >= 20.0; // Minimum 20 mg/L as CaCO3 required for buffering

  // Calculate required lime dose if deficient
  let requiredLimeDoseMgL = 0;
  if (residualAlk < 25.0) {
    const alkDeficit = 25.0 - residualAlk;
    requiredLimeDoseMgL = Number((alkDeficit / 1.35).toFixed(2));
  }

  // Estimated final pH calculation
  const netAlkChange = alkAddition - alkConsumption;
  const estimatedFinalPh = Number((rawPh + (netAlkChange / rawAlkalinityMgL) * 0.5).toFixed(2));

  return {
    rawAlkalinityMgL,
    coagulantAlkalinityConsumptionMgL: Number(alkConsumption.toFixed(2)),
    alkalineChemicalAddedMgL: Number(alkAddition.toFixed(2)),
    addedChemicalName: addedChemName,
    residualAlkalinityMgL: Number(residualAlk.toFixed(2)),
    residualAlkalinityMeqL: Number((residualAlk / 50.04).toFixed(3)),
    isAlkalinitySufficient,
    requiredLimeDoseMgL,
    estimatedFinalPh,
    phCalculationMode: 'CALCULATED'
  };
}

// ============================================================================
// 4. PRECIPITATION & CHEMICAL SLUDGE ENGINE
// ============================================================================

export interface ChemicalSludgeResult {
  metalHydroxideSludgeKgDay: number;
  capturedTssSludgeKgDay: number;
  limeSludgeKgDay: number;
  polymerSludgeKgDay: number;
  totalDrySludgeKgDay: number;
  sludgeSolidsPercent: number;
  wetSludgeVolumeM3Day: number;
}

export function calculateChemicalSludge(
  plantCapacityMLD: number,
  rawTssMgL: number,
  effluentTssMgL: number,
  coagulantCode: string,
  coagulantDoseMgL: number,
  limeDoseMgL = 0,
  polymerDoseMgL = 0
): ChemicalSludgeResult {
  const flowM3day = plantCapacityMLD * 1000;
  const coagulant = getChemicalByCode(coagulantCode);

  // 1. Captured TSS
  const capturedTssMgL = Math.max(0, rawTssMgL - effluentTssMgL);
  const capturedTssSludgeKgDay = (capturedTssMgL * flowM3day) / 1000;

  // 2. Metal Hydroxide Sludge
  const coagulantCommercialDose = coagulantDoseMgL / coagulant.activeFraction;
  const metalHydroxideSludgeKgDay = ((coagulantCommercialDose * flowM3day) / 1000) * coagulant.sludgeYieldKgPerKgChemical;

  // 3. Lime Sludge
  const limeSludgeKgDay = ((limeDoseMgL * flowM3day) / 1000) * 0.10;

  // 4. Polymer Sludge
  const polymerSludgeKgDay = (polymerDoseMgL * flowM3day) / 1000;

  const totalDrySludgeKgDay = capturedTssSludgeKgDay + metalHydroxideSludgeKgDay + limeSludgeKgDay + polymerSludgeKgDay;
  const sludgeSolidsPercent = 2.5; // Typical 2.5% solids in clarifier underflow
  const wetSludgeVolumeM3Day = (totalDrySludgeKgDay / (sludgeSolidsPercent / 100)) / 1000;

  return {
    metalHydroxideSludgeKgDay: Number(metalHydroxideSludgeKgDay.toFixed(1)),
    capturedTssSludgeKgDay: Number(capturedTssSludgeKgDay.toFixed(1)),
    limeSludgeKgDay: Number(limeSludgeKgDay.toFixed(1)),
    polymerSludgeKgDay: Number(polymerSludgeKgDay.toFixed(1)),
    totalDrySludgeKgDay: Number(totalDrySludgeKgDay.toFixed(1)),
    sludgeSolidsPercent,
    wetSludgeVolumeM3Day: Number(wetSludgeVolumeM3Day.toFixed(2))
  };
}

// ============================================================================
// 5. IRON, MANGANESE & ARSENIC TREATMENT ENGINE
// ============================================================================

export interface FeMnOxidationResult {
  rawFeMgL: number;
  rawMnMgL: number;
  chlorineDemandFeMgL: number; // 0.62 mg Cl2 per mg Fe
  chlorineDemandMnMgL: number; // 1.29 mg Cl2 per mg Mn
  kmno4DemandFeMgL: number;   // 0.94 mg KMnO4 per mg Fe
  kmno4DemandMnMgL: number;   // 1.92 mg KMnO4 per mg Mn
  requiredChlorineOxidantKgDay: number;
  requiredKmno4OxidantKgDay: number;
  precipitatedFeMnSludgeKgDay: number;
  targetResidualFeMgL: number;
  targetResidualMnMgL: number;
}

export function calculateFeMnOxidation(
  plantCapacityMLD: number,
  rawFeMgL: number,
  rawMnMgL: number
): FeMnOxidationResult {
  const flowM3day = plantCapacityMLD * 1000;
  
  const chlorineDemandFe = rawFeMgL * 0.62;
  const chlorineDemandMn = rawMnMgL * 1.29;
  const totalCl2DemandMgL = chlorineDemandFe + chlorineDemandMn;

  const kmno4DemandFe = rawFeMgL * 0.94;
  const kmno4DemandMn = rawMnMgL * 1.92;
  const totalKmno4DemandMgL = kmno4DemandFe + kmno4DemandMn;

  const requiredChlorineOxidantKgDay = (totalCl2DemandMgL * flowM3day) / 1000;
  const requiredKmno4OxidantKgDay = (totalKmno4DemandMgL * flowM3day) / 1000;

  // Fe(OH)3 + MnO2 precipitate
  const feSludge = rawFeMgL * 1.91; // Fe -> Fe(OH)3
  const mnSludge = rawMnMgL * 1.58; // Mn -> MnO2
  const totalPrecipitateKgDay = ((feSludge + mnSludge) * flowM3day) / 1000;

  return {
    rawFeMgL,
    rawMnMgL,
    chlorineDemandFeMgL: Number(chlorineDemandFe.toFixed(3)),
    chlorineDemandMnMgL: Number(chlorineDemandMn.toFixed(3)),
    kmno4DemandFeMgL: Number(kmno4DemandFe.toFixed(3)),
    kmno4DemandMnMgL: Number(kmno4DemandMn.toFixed(3)),
    requiredChlorineOxidantKgDay: Number(requiredChlorineOxidantKgDay.toFixed(2)),
    requiredKmno4OxidantKgDay: Number(requiredKmno4OxidantKgDay.toFixed(2)),
    precipitatedFeMnSludgeKgDay: Number(totalPrecipitateKgDay.toFixed(1)),
    targetResidualFeMgL: 0.1,
    targetResidualMnMgL: 0.05
  };
}

// ============================================================================
// 6. ACTIVATED CARBON & MEMBRANE / RO ENGINE
// ============================================================================

export interface MembraneRoResult {
  feedFlowM3hr: number;
  recoveryPercent: number;
  permeateFlowM3hr: number;
  rejectFlowM3hr: number;
  designFluxLMH: number; // Liters per m2 per hour
  requiredMembraneAreaM2: number;
  numberOfModules: number;
  numberOfTrains: number;
  operatingPressureBar: number;
  saltRejectionPercent: number;
  feedTdsMgL: number;
  permeateTdsMgL: number;
  rejectTdsMgL: number;
  specificEnergyKwhM3: number;
}

export function calculateRoMembraneSystem(
  feedFlowM3hr: number,
  recoveryPercent = 75,
  feedTdsMgL = 2000,
  designFluxLMH = 18
): MembraneRoResult {
  const recoveryFraction = recoveryPercent / 100;
  const permeateFlowM3hr = feedFlowM3hr * recoveryFraction;
  const rejectFlowM3hr = feedFlowM3hr * (1 - recoveryFraction);

  const permeateFlowLhr = permeateFlowM3hr * 1000;
  const requiredMembraneAreaM2 = permeateFlowLhr / designFluxLMH;

  const areaPerModuleM2 = 40; // Standard 8040 membrane element (400 sq.ft)
  const numberOfModules = Math.ceil(requiredMembraneAreaM2 / areaPerModuleM2);
  const numberOfTrains = Math.max(2, Math.ceil(numberOfModules / 24)); // 24 pressure vessels per train

  const saltRejectionPercent = 99.2;
  const permeateTdsMgL = feedTdsMgL * (1 - saltRejectionPercent / 100);
  
  // Mass Balance for Reject TDS
  const totalFeedMassKg = (feedFlowM3hr * feedTdsMgL) / 1000;
  const totalPermeateMassKg = (permeateFlowM3hr * permeateTdsMgL) / 1000;
  const rejectMassKg = totalFeedMassKg - totalPermeateMassKg;
  const rejectTdsMgL = (rejectMassKg * 1000) / rejectFlowM3hr;

  const operatingPressureBar = 12.5 + (feedTdsMgL / 1000) * 0.7; // Osmotic pressure + net driving pressure
  const specificEnergyKwhM3 = 1.1 + (operatingPressureBar * 0.08);

  return {
    feedFlowM3hr,
    recoveryPercent,
    permeateFlowM3hr: Number(permeateFlowM3hr.toFixed(1)),
    rejectFlowM3hr: Number(rejectFlowM3hr.toFixed(1)),
    designFluxLMH,
    requiredMembraneAreaM2: Number(requiredMembraneAreaM2.toFixed(1)),
    numberOfModules,
    numberOfTrains,
    operatingPressureBar: Number(operatingPressureBar.toFixed(1)),
    saltRejectionPercent,
    feedTdsMgL,
    permeateTdsMgL: Number(permeateTdsMgL.toFixed(1)),
    rejectTdsMgL: Number(rejectTdsMgL.toFixed(1)),
    specificEnergyKwhM3: Number(specificEnergyKwhM3.toFixed(2))
  };
}

// ============================================================================
// 7. ENHANCED DISINFECTION & CT CALCULATION ENGINE
// ============================================================================

export interface ChlorineCtResult {
  appliedDoseMgL: number;
  organicsDemandMgL: number;
  ironMnDemandMgL: number;
  ammoniaDemandMgL: number;
  totalChlorineDemandMgL: number;
  freeResidualChlorineMgL: number;
  contactTankVolumeM3: number;
  detentionTimeMin: number;
  baffleFactor: number; // 0.1 unbaffled to 0.7 superior
  effectiveContactTimeT10Min: number;
  ctAchievedMgMinL: number;
  ctRequiredGiardiaMgMinL: number; // 3-log Giardia @ 20°C, pH 7.5
  ctRequiredVirusMgMinL: number;   // 4-log Virus
  isGiardiaCompliant: boolean;
  isVirusCompliant: boolean;
  complianceStatus: 'PASS' | 'WARNING' | 'FAIL';
}

export function calculateChlorineCt(
  plantCapacityMLD: number,
  appliedDoseMgL: number,
  contactTankVolumeM3: number,
  baffleFactor = 0.5,
  rawOrganicsTocMgL = 3.5,
  rawFeMgL = 0.2,
  rawMnMgL = 0.05,
  rawAmmoniaMgL = 0.1
): ChlorineCtResult {
  const flowM3hr = (plantCapacityMLD * 1000) / 24;
  
  // Chlorine Demand Breakdown
  const organicsDemand = rawOrganicsTocMgL * 0.35;
  const ironMnDemand = rawFeMgL * 0.62 + rawMnMgL * 1.29;
  const ammoniaDemand = rawAmmoniaMgL * 7.6; // Breakpoint chlorination ratio ~7.6:1
  const totalDemand = organicsDemand + ironMnDemand + ammoniaDemand;

  const freeResidual = Math.max(0, appliedDoseMgL - totalDemand);

  // Detention and CT
  const detentionTimeMin = (contactTankVolumeM3 / flowM3hr) * 60;
  const effectiveT10Min = detentionTimeMin * baffleFactor;
  const ctAchieved = freeResidual * effectiveT10Min;

  const ctRequiredGiardia = 42.0; // AWWA / EPA table for 3-log Giardia at 20°C, pH 7.5, residual 1.5
  const ctRequiredVirus = 6.0;

  const isGiardiaCompliant = ctAchieved >= ctRequiredGiardia;
  const isVirusCompliant = ctAchieved >= ctRequiredVirus;

  let complianceStatus: 'PASS' | 'WARNING' | 'FAIL' = 'PASS';
  if (!isGiardiaCompliant || !isVirusCompliant) complianceStatus = 'FAIL';
  else if (freeResidual < 0.5) complianceStatus = 'WARNING';

  return {
    appliedDoseMgL,
    organicsDemandMgL: Number(organicsDemand.toFixed(2)),
    ironMnDemandMgL: Number(ironMnDemand.toFixed(2)),
    ammoniaDemandMgL: Number(ammoniaDemand.toFixed(2)),
    totalChlorineDemandMgL: Number(totalDemand.toFixed(2)),
    freeResidualChlorineMgL: Number(freeResidual.toFixed(2)),
    contactTankVolumeM3,
    detentionTimeMin: Number(detentionTimeMin.toFixed(1)),
    baffleFactor,
    effectiveContactTimeT10Min: Number(effectiveT10Min.toFixed(1)),
    ctAchievedMgMinL: Number(ctAchieved.toFixed(1)),
    ctRequiredGiardiaMgMinL: ctRequiredGiardia,
    ctRequiredVirusMgMinL: ctRequiredVirus,
    isGiardiaCompliant,
    isVirusCompliant,
    complianceStatus
  };
}

// ============================================================================
// 8. CHEMICAL STORAGE & EQUIPMENT GENERATOR
// ============================================================================

export interface ChemicalStorageConfig {
  chemicalCode: string;
  chemicalName: string;
  dailyConsumptionKgDay: number;
  storageDays: number;
  requiredStorageVolumeM3: number;
  tankUnitCapacityM3: number;
  numberOfStorageTanks: number;
  dutyStandbyArrangement: string;
  dosingPumpCapacityLhr: number;
  dosingPumpHeadM: number;
  mixerPowerKw: number;
  dayTankCapacityM3: number;
}

export function generateChemicalStorageAndEquipment(
  chemicalCode: string,
  doseMgL: number,
  plantCapacityMLD: number,
  storageDays = 30
): ChemicalStorageConfig {
  const doseCalc = calculateChemicalDose(chemicalCode, doseMgL, plantCapacityMLD);
  const chem = getChemicalByCode(chemicalCode);

  const totalStorageKg = doseCalc.dailyConsumptionKgDay * storageDays;
  const requiredStorageVolumeM3 = totalStorageKg / (chem.densityKgL * 1000 * (chem.stockSolutionConcentrationPercent / 100));

  const tankUnitCapacityM3 = Math.max(2.0, Math.ceil(requiredStorageVolumeM3 / 2));
  const numberOfStorageTanks = Math.ceil(requiredStorageVolumeM3 / tankUnitCapacityM3);

  const dosingPumpCapacityLhr = Number((doseCalc.solutionFlowLhr * 1.5).toFixed(1)); // 1.5x safety margin
  const dayTankCapacityM3 = Number(((doseCalc.solutionFlowLhr * 24) / 1000).toFixed(2));

  return {
    chemicalCode,
    chemicalName: chem.name,
    dailyConsumptionKgDay: doseCalc.dailyConsumptionKgDay,
    storageDays,
    requiredStorageVolumeM3: Number(requiredStorageVolumeM3.toFixed(2)),
    tankUnitCapacityM3,
    numberOfStorageTanks: Math.max(2, numberOfStorageTanks),
    dutyStandbyArrangement: '2 Duty + 1 Standby (3 Units Total)',
    dosingPumpCapacityLhr,
    dosingPumpHeadM: 15.0,
    mixerPowerKw: 1.5,
    dayTankCapacityM3
  };
}
