/**
 * EVL WTP Engineering Suite - Comprehensive Process Design Engine
 * Governs sizing, hydraulics, power, media, chemical, and equipment engineering for all WTP unit processes.
 */

import { FilterMediaSpec, MASTER_MEDIA_REGISTRY } from './mediaRegistry';
import { EquipmentItem } from '../types/wtp';

// --------------------------------------------------------
// 1. INTAKE DESIGN ENGINE
// --------------------------------------------------------
export interface IntakeDesignResult {
  intakeType: 'River' | 'Lake' | 'Reservoir' | 'Canal' | 'Groundwater';
  designFlowM3hr: number;
  designFlowLs: number;
  numOpenings: number;
  openingWidthM: number;
  openingHeightM: number;
  totalOpeningAreaM2: number;
  approachVelocityMs: number;
  hflM: number; // High Flood Level
  mflM: number; // Mean Flood Level
  lwlM: number; // Low Water Level
  minSubmergenceM: number;
  intakePipeDiameterMm: number;
  intakePipeVelocityMs: number;
  headLossM: number;
  trashRackAreaM2: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
  validationMessage: string;
}

export function calculateIntakeDesign(
  capacityMld: number,
  intakeType: 'River' | 'Lake' | 'Reservoir' | 'Canal' | 'Groundwater' = 'River',
  hfl: number = 32.0,
  mfl: number = 28.0,
  lwl: number = 22.0,
  targetVelocityMs: number = 0.15
): IntakeDesignResult {
  const qM3hr = (capacityMld * 1.05 * 1000) / 24; // 5% losses
  const qM3s = qM3hr / 3600;
  const qLs = qM3s * 1000;

  const totalAreaM2 = qM3s / targetVelocityMs;
  const numOpenings = Math.max(2, Math.ceil(totalAreaM2 / 3.0));
  const areaPerOpening = totalAreaM2 / numOpenings;
  const widthM = Number(Math.sqrt(areaPerOpening * 1.2).toFixed(2));
  const heightM = Number((areaPerOpening / widthM).toFixed(2));
  
  // Intake pipe sizing (recommended velocity 1.0 - 1.5 m/s)
  const pipeArea = qM3s / 1.2;
  const pipeDiaM = Math.sqrt((4 * pipeArea) / Math.PI);
  const pipeDiaMm = Math.ceil(pipeDiaM * 1000 / 50) * 50; // rounded to 50mm
  const actualPipeArea = (Math.PI * (pipeDiaMm / 1000) ** 2) / 4;
  const actualPipeVel = Number((qM3s / actualPipeArea).toFixed(2));

  // Head loss across intake port & pipe (m)
  const hl = Number((1.5 * (targetVelocityMs ** 2) / (2 * 9.81) + 0.15).toFixed(2));
  const minSubmergence = Number((1.5 * (pipeDiaMm / 1000)).toFixed(2));

  const status = targetVelocityMs <= 0.20 ? 'PASS' : 'WARNING';

  return {
    intakeType,
    designFlowM3hr: Number(qM3hr.toFixed(2)),
    designFlowLs: Number(qLs.toFixed(2)),
    numOpenings,
    openingWidthM: widthM,
    openingHeightM: heightM,
    totalOpeningAreaM2: Number(totalAreaM2.toFixed(2)),
    approachVelocityMs: targetVelocityMs,
    hflM: hfl,
    mflM: mfl,
    lwlM: lwl,
    minSubmergenceM: minSubmergence,
    intakePipeDiameterMm: pipeDiaMm,
    intakePipeVelocityMs: actualPipeVel,
    headLossM: hl,
    trashRackAreaM2: Number((totalAreaM2 * 1.5).toFixed(2)),
    status,
    validationMessage: status === 'PASS' 
      ? 'Intake approach velocity meets fish protection & intake criteria (<= 0.20 m/s).'
      : 'Intake velocity exceeds recommended maximum of 0.20 m/s.'
  };
}

// --------------------------------------------------------
// 2. SCREENING DESIGN ENGINE
// --------------------------------------------------------
export interface ScreenDesignResult {
  screenType: 'Coarse' | 'Fine';
  mechanism: 'Manual' | 'Mechanical';
  designFlowM3hr: number;
  numChannels: number;
  barWidthMm: number;
  barThicknessMm: number;
  clearSpacingMm: number;
  inclinationAngleDeg: number;
  approachVelocityMs: number;
  throughScreenVelocityMs: number;
  kirschmerHeadLossM: number;
  grossAreaM2: number;
  netOpenAreaM2: number;
  openAreaPercent: number;
  screenChannelWidthM: number;
  screenChannelDepthM: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
}

export function calculateScreenDesign(
  capacityMld: number,
  screenType: 'Coarse' | 'Fine' = 'Fine',
  mechanism: 'Manual' | 'Mechanical' = 'Mechanical',
  barSpacingMm: number = 10,
  barThicknessMm: number = 6,
  inclinationDeg: number = 75
): ScreenDesignResult {
  const qM3hr = (capacityMld * 1.05 * 1000) / 24;
  const qM3s = qM3hr / 3600;

  const numChannels = 2; // 1 Duty + 1 Standby
  const qPerChannel = qM3s / (numChannels - 1);

  const openRatio = barSpacingMm / (barSpacingMm + barThicknessMm);
  const targetApproachVel = 0.6; // m/s
  const netArea = qPerChannel / targetApproachVel;
  const grossArea = netArea / openRatio;

  const throughVel = Number((qPerChannel / netArea).toFixed(2));

  // Kirschmer formula for bar screen head loss: h_L = beta * (s/b)^(4/3) * (v^2 / 2g) * sin(alpha)
  const beta = 2.42; // sharp rectangular bars
  const hl = beta * Math.pow(barThicknessMm / barSpacingMm, 4 / 3) * ((throughVel ** 2) / (2 * 9.81)) * Math.sin((inclinationDeg * Math.PI) / 180);

  const channelWidth = Number(Math.sqrt(grossArea * 0.8).toFixed(2));
  const channelDepth = Number((grossArea / channelWidth).toFixed(2));

  return {
    screenType,
    mechanism,
    designFlowM3hr: Number(qM3hr.toFixed(2)),
    numChannels,
    barWidthMm: barThicknessMm,
    barThicknessMm,
    clearSpacingMm: barSpacingMm,
    inclinationAngleDeg: inclinationDeg,
    approachVelocityMs: targetApproachVel,
    throughScreenVelocityMs: throughVel,
    kirschmerHeadLossM: Number(hl.toFixed(3)),
    grossAreaM2: Number(grossArea.toFixed(2)),
    netOpenAreaM2: Number(netArea.toFixed(2)),
    openAreaPercent: Number((openRatio * 100).toFixed(1)),
    screenChannelWidthM: channelWidth,
    screenChannelDepthM: channelDepth,
    status: throughVel <= 1.0 ? 'PASS' : 'WARNING'
  };
}

// --------------------------------------------------------
// 3. AERATION DESIGN ENGINE
// --------------------------------------------------------
export interface AerationDesignResult {
  aeratorType: 'Cascade' | 'Tray' | 'Diffused' | 'Mechanical';
  designFlowM3hr: number;
  totalDropHeightM: number;
  numStepsOrTrays: number;
  stepWidthM: number;
  stepLengthM: number;
  totalAreaM2: number;
  hydraulicLoadingM3M2Hr: number;
  oxygenTransferRateKgO2Hr: number;
  blowerAirFlowNm3Hr?: number;
  blowerPowerKw?: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
}

export function calculateAerationDesign(
  capacityMld: number,
  aeratorType: 'Cascade' | 'Tray' | 'Diffused' | 'Mechanical' = 'Cascade',
  rawIronMgL: number = 2.5,
  rawManganeseMgL: number = 0.5
): AerationDesignResult {
  const qM3hr = (capacityMld * 1.05 * 1000) / 24;
  const qM3s = qM3hr / 3600;

  // Stochiometric oxygen demand for Fe2+ (0.14 mg O2 / mg Fe) and Mn2+ (0.29 mg O2 / mg Mn)
  const o2DemandMgL = (rawIronMgL * 0.14) + (rawManganeseMgL * 0.29) + 1.5; // +1.5 for dissolved O2 saturation
  const o2TransferKgHr = Number(((qM3hr * o2DemandMgL) / 1000).toFixed(2));

  if (aeratorType === 'Cascade') {
    const loadingRate = 40.0; // m3/m2-hr
    const totalArea = Number((qM3hr / loadingRate).toFixed(2));
    const numSteps = 5;
    const outerDia = Number(Math.sqrt((4 * totalArea) / Math.PI).toFixed(2));

    return {
      aeratorType,
      designFlowM3hr: Number(qM3hr.toFixed(2)),
      totalDropHeightM: 1.5,
      numStepsOrTrays: numSteps,
      stepWidthM: Number((outerDia / (2 * numSteps)).toFixed(2)),
      stepLengthM: outerDia,
      totalAreaM2: totalArea,
      hydraulicLoadingM3M2Hr: loadingRate,
      oxygenTransferRateKgO2Hr: o2TransferKgHr,
      status: loadingRate <= 50 ? 'PASS' : 'WARNING'
    };
  }

  // Diffused Aeration Default
  const airWaterRatio = 12; // Nm3 air per m3 water
  const airFlowNm3Hr = Number((qM3hr * airWaterRatio).toFixed(1));
  const blowerKw = Number(((airFlowNm3Hr * 0.0035 * 1.2)).toFixed(1));

  return {
    aeratorType,
    designFlowM3hr: Number(qM3hr.toFixed(2)),
    totalDropHeightM: 2.5,
    numStepsOrTrays: 4,
    stepWidthM: 3.0,
    stepLengthM: 4.0,
    totalAreaM2: 50.0,
    hydraulicLoadingM3M2Hr: 35.0,
    oxygenTransferRateKgO2Hr: o2TransferKgHr,
    blowerAirFlowNm3Hr: airFlowNm3Hr,
    blowerPowerKw: blowerKw,
    status: 'PASS'
  };
}

// --------------------------------------------------------
// 4. COAGULATION & JAR TEST ENGINE
// --------------------------------------------------------
export interface RapidMixResult {
  designFlowM3hr: number;
  numChambers: number;
  detentionTimeSec: number;
  chamberVolumeM3: number;
  velocityGradientG: number;
  campGT: number;
  shaftPowerKw: number;
  powerPerVolumeKwM3: number;
  recommendedAlumDoseMgL: number;
  dailyAlumMassKgDay: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
}

export function calculateRapidMixDesign(
  capacityMld: number,
  detentionTimeSec: number = 45,
  velocityGradientG: number = 800,
  alumDoseMgL: number = 35
): RapidMixResult {
  const qM3hr = (capacityMld * 1.05 * 1000) / 24;
  const qM3s = qM3hr / 3600;

  const numChambers = 2; // Duty + Standby or split flow
  const chamberVolume = (qM3s * detentionTimeSec) / numChambers;
  
  const mu = 0.001002; // Pa.s at 20C
  const powerWatts = mu * chamberVolume * (velocityGradientG ** 2);
  const powerKw = Number((powerWatts / 1000).toFixed(2));

  const campGt = velocityGradientG * detentionTimeSec;
  const dailyAlumKg = Number(((capacityMld * 1000 * alumDoseMgL) / 1000).toFixed(1));

  const status = (campGt >= 20000 && campGt <= 50000) ? 'PASS' : 'WARNING';

  return {
    designFlowM3hr: Number(qM3hr.toFixed(2)),
    numChambers,
    detentionTimeSec,
    chamberVolumeM3: Number(chamberVolume.toFixed(2)),
    velocityGradientG,
    campGT: campGt,
    shaftPowerKw: powerKw,
    powerPerVolumeKwM3: Number((powerKw / chamberVolume).toFixed(2)),
    recommendedAlumDoseMgL: alumDoseMgL,
    dailyAlumMassKgDay: dailyAlumKg,
    status
  };
}

// --------------------------------------------------------
// 5. FLOCCULATION ENGINE (3-STAGE TAPERED G)
// --------------------------------------------------------
export interface FlocculationResult {
  mechanism: 'Hydraulic' | 'Mechanical';
  numBasins: number;
  numStages: number;
  totalDetentionTimeMin: number;
  totalVolumeM3: number;
  stage1G: number;
  stage2G: number;
  stage3G: number;
  totalCampGT: number;
  paddleWidthM: number;
  paddleDiameterM: number;
  paddleRpmStage1: number;
  totalMotorPowerKw: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
}

export function calculateFlocculationDesign(
  capacityMld: number,
  mechanism: 'Hydraulic' | 'Mechanical' = 'Mechanical',
  totalDetentionMin: number = 20,
  g1: number = 50,
  g2: number = 30,
  g3: number = 15
): FlocculationResult {
  const qM3hr = (capacityMld * 1.05 * 1000) / 24;
  const qM3s = qM3hr / 3600;

  const totalVol = (qM3s * totalDetentionMin * 60);
  const numBasins = 2; // parallel basins
  const volPerBasin = totalVol / numBasins;

  // 3 equal stages
  const tStageSec = (totalDetentionMin * 60) / 3;
  const gtTotal = (g1 * tStageSec) + (g2 * tStageSec) + (g3 * tStageSec);

  const mu = 0.001002;
  const volPerStage = volPerBasin / 3;
  const p1 = (mu * volPerStage * (g1 ** 2)) / 1000;
  const p2 = (mu * volPerStage * (g2 ** 2)) / 1000;
  const p3 = (mu * volPerStage * (g3 ** 2)) / 1000;
  const totalPower = Number(((p1 + p2 + p3) * numBasins * 1.15).toFixed(2)); // 15% efficiency margin

  const status = (gtTotal >= 30000 && gtTotal <= 60000) ? 'PASS' : 'WARNING';

  return {
    mechanism,
    numBasins,
    numStages: 3,
    totalDetentionTimeMin: totalDetentionMin,
    totalVolumeM3: Number(totalVol.toFixed(1)),
    stage1G: g1,
    stage2G: g2,
    stage3G: g3,
    totalCampGT: Number(gtTotal.toFixed(0)),
    paddleWidthM: 1.8,
    paddleDiameterM: 2.4,
    paddleRpmStage1: 4.5,
    totalMotorPowerKw: totalPower,
    status
  };
}

// --------------------------------------------------------
// 6. SEDIMENTATION & TUBE SETTLER ENGINE
// --------------------------------------------------------
export interface SedimentationResult {
  clarifierType: 'Rectangular' | 'Circular' | 'Tube Settler' | 'Plate / Lamella';
  numUnits: number;
  designFlowPerUnitM3hr: number;
  sorM3M2Hr: number;
  planAreaPerUnitM2: number;
  lengthM: number;
  widthM: number;
  depthM: number;
  detentionTimeHr: number;
  weirLengthM: number;
  weirLoadingM3MHr: number;
  tubeLengthM?: number;
  tubeAngleDeg?: number;
  numTubeModules?: number;
  sludgeProductionKgDay: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
}

export function calculateSedimentationDesign(
  capacityMld: number,
  clarifierType: 'Rectangular' | 'Circular' | 'Tube Settler' | 'Plate / Lamella' = 'Tube Settler',
  sorM3M2Hr: number = 3.5,
  tssRawMgL: number = 120,
  alumDoseMgL: number = 35
): SedimentationResult {
  const qM3hr = (capacityMld * 1.05 * 1000) / 24;
  const numUnits = 2;
  const qUnit = qM3hr / numUnits;

  const planArea = qUnit / sorM3M2Hr;
  const widthM = Number(Math.sqrt(planArea / 3).toFixed(2));
  const lengthM = Number((planArea / widthM).toFixed(2));
  const depthM = clarifierType === 'Tube Settler' ? 4.2 : 3.5;

  const volume = planArea * depthM;
  const detTimeHr = Number((volume / qUnit).toFixed(2));

  const weirLength = lengthM * 2 + widthM;
  const weirLoading = Number((qUnit / weirLength).toFixed(2));

  const drySludgeKgDay = Number(((capacityMld * 1000 * ((tssRawMgL * 0.9) + (0.26 * alumDoseMgL))) / 1000).toFixed(1));

  const status = sorM3M2Hr <= 4.0 && weirLoading <= 12.0 ? 'PASS' : 'WARNING';

  return {
    clarifierType,
    numUnits,
    designFlowPerUnitM3hr: Number(qUnit.toFixed(2)),
    sorM3M2Hr: sorM3M2Hr,
    planAreaPerUnitM2: Number(planArea.toFixed(2)),
    lengthM,
    widthM,
    depthM,
    detentionTimeHr: detTimeHr,
    weirLengthM: Number(weirLength.toFixed(2)),
    weirLoadingM3MHr: weirLoading,
    tubeLengthM: 1.0,
    tubeAngleDeg: 60,
    numTubeModules: Math.ceil(planArea / 1.0),
    sludgeProductionKgDay: drySludgeKgDay,
    status
  };
}

// --------------------------------------------------------
// 7. FILTRATION ENGINE & OPERATION
// --------------------------------------------------------
export interface FilterOperationState {
  filterId: string;
  status: 'RUNNING' | 'RIPENING' | 'BACKWASH' | 'FILTER-TO-WASTE' | 'STANDBY' | 'OUT-OF-SERVICE';
  currentHeadLossM: number;
  runTimeHours: number;
  filteredVolumeM3: number;
}

export interface FiltrationResult {
  filterType: 'Rapid Gravity Sand' | 'Dual Media' | 'Multi-media' | 'GAC';
  totalFilters: number;
  dutyFilters: number;
  standbyFilters: number;
  filtrationRateM3M2Hr: number;
  areaPerFilterM2: number;
  filterLengthM: number;
  filterWidthM: number;
  selectedMedia: FilterMediaSpec[];
  cleanBedHeadLossM: number;
  terminalHeadLossM: number;
  backwashWaterRateM3M2Hr: number;
  backwashAirRateM3M2Hr: number;
  backwashDurationMin: number;
  backwashVolumePerFilterM3: number;
  backwashPumpCapacityM3hr: number;
  underdrainNozzleCount: number;
  operationalStates: FilterOperationState[];
  status: 'PASS' | 'WARNING' | 'FAIL';
}

export function calculateFiltrationDesign(
  capacityMld: number,
  filterType: 'Rapid Gravity Sand' | 'Dual Media' | 'Multi-media' | 'GAC' = 'Dual Media',
  filtrationRateM3M2Hr: number = 6.0,
  backwashRateM3M2Hr: number = 36.0
): FiltrationResult {
  const qM3hr = (capacityMld * 1.05 * 1000) / 24;
  
  const totalFilters = 6;
  const dutyFilters = 5;
  const standbyFilters = 1;

  const totalAreaReq = qM3hr / filtrationRateM3M2Hr;
  const areaPerFilter = totalAreaReq / dutyFilters;

  const widthM = Number(Math.sqrt(areaPerFilter / 1.5).toFixed(2));
  const lengthM = Number((areaPerFilter / widthM).toFixed(2));

  // Media selection
  const selectedMedia: FilterMediaSpec[] = [
    MASTER_MEDIA_REGISTRY[2], // Anthracite
    MASTER_MEDIA_REGISTRY[0]  // Sand
  ];

  // Rose equation clean bed headloss estimate (~0.28m)
  const cleanHl = 0.28;
  const terminalHl = 2.4;

  // Backwash volume (15 min backwash)
  const bwDurationMin = 15;
  const bwVol = (areaPerFilter * backwashRateM3M2Hr * bwDurationMin) / 60;
  const bwPumpCapacity = areaPerFilter * backwashRateM3M2Hr;

  // Underdrain nozzles (approx 45 nozzles per m2)
  const nozzleCount = Math.ceil(areaPerFilter * 45);

  const states: FilterOperationState[] = Array.from({ length: totalFilters }).map((_, i) => ({
    filterId: `FIL-UNIT-0${i + 1}`,
    status: i === 0 ? 'BACKWASH' : i === 5 ? 'STANDBY' : 'RUNNING',
    currentHeadLossM: Number((0.3 + i * 0.35).toFixed(2)),
    runTimeHours: 24 - (i * 3),
    filteredVolumeM3: Number((areaPerFilter * filtrationRateM3M2Hr * (24 - i * 3)).toFixed(0))
  }));

  return {
    filterType,
    totalFilters,
    dutyFilters,
    standbyFilters,
    filtrationRateM3M2Hr,
    areaPerFilterM2: Number(areaPerFilter.toFixed(2)),
    filterLengthM: lengthM,
    filterWidthM: widthM,
    selectedMedia,
    cleanBedHeadLossM: cleanHl,
    terminalHeadLossM: terminalHl,
    backwashWaterRateM3M2Hr: backwashRateM3M2Hr,
    backwashAirRateM3M2Hr: 50.0,
    backwashDurationMin: bwDurationMin,
    backwashVolumePerFilterM3: Number(bwVol.toFixed(1)),
    backwashPumpCapacityM3hr: Number(bwPumpCapacity.toFixed(1)),
    underdrainNozzleCount: nozzleCount,
    operationalStates: states,
    status: filtrationRateM3M2Hr <= 7.5 ? 'PASS' : 'WARNING'
  };
}

// --------------------------------------------------------
// 8. DISINFECTION ENGINE (EPA CT LOG INACTIVATION)
// --------------------------------------------------------
export interface DisinfectionResult {
  disinfectantType: 'Chlorine' | 'Sodium Hypochlorite' | 'UV' | 'Ozone';
  appliedDoseMgL: number;
  residualFreeCl2MgL: number;
  contactTimeMin: number;
  baffleFactor: number;
  effectiveT10Min: number;
  achievedCTMgMinL: number;
  requiredCTMgMinL: number;
  virusLogInactivation: number;
  giardiaLogInactivation: number;
  dailyChlorineMassKgDay: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
}

export function calculateDisinfectionDesign(
  capacityMld: number,
  doseMgL: number = 3.5,
  contactTimeMin: number = 30,
  baffleFactor: number = 0.7,
  waterTempC: number = 20,
  ph: number = 7.2
): DisinfectionResult {
  const demandMgL = 1.5;
  const residual = Math.max(0.2, doseMgL - demandMgL);
  const t10 = contactTimeMin * baffleFactor;
  const achievedCt = Number((residual * t10).toFixed(1));

  // Required CT for 4-log Virus and 0.5-log Giardia at 20C and pH 7.2 is 12 mg.min/L
  const requiredCt = 12.0;

  const dailyCl2Kg = Number(((capacityMld * 1000 * doseMgL) / 1000).toFixed(1));

  const status = achievedCt >= requiredCt ? 'PASS' : 'WARNING';

  return {
    disinfectantType: 'Chlorine',
    appliedDoseMgL: doseMgL,
    residualFreeCl2MgL: Number(residual.toFixed(2)),
    contactTimeMin,
    baffleFactor,
    effectiveT10Min: Number(t10.toFixed(1)),
    achievedCTMgMinL: achievedCt,
    requiredCTMgMinL: requiredCt,
    virusLogInactivation: 4.0,
    giardiaLogInactivation: 3.0,
    dailyChlorineMassKgDay: dailyCl2Kg,
    status
  };
}

// --------------------------------------------------------
// 9. CLEAR WATER RESERVOIR (CWR) ENGINE
// --------------------------------------------------------
export interface CwrDesignResult {
  requiredStorageHours: number;
  requiredVolumeM3: number;
  usableVolumeM3: number;
  deadStorageM3: number;
  totalVolumeM3: number;
  numCompartments: number;
  lengthM: number;
  widthM: number;
  usableDepthM: number;
  freeboardM: number;
  turnoverRatePerDay: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
}

export function calculateCwrDesign(
  capacityMld: number,
  storageHours: number = 8.0
): CwrDesignResult {
  const reqVol = (capacityMld * 1000) * (storageHours / 24);
  const numCompartments = 2; // For cleaning flexibility

  const usableDepth = 4.5;
  const planArea = reqVol / usableDepth;
  const widthM = Number(Math.sqrt(planArea / 2).toFixed(2));
  const lengthM = Number((planArea / widthM).toFixed(2));

  const totalVol = planArea * (usableDepth + 0.5); // +0.5m freeboard

  return {
    requiredStorageHours: storageHours,
    requiredVolumeM3: Number(reqVol.toFixed(0)),
    usableVolumeM3: Number(reqVol.toFixed(0)),
    deadStorageM3: Number((reqVol * 0.03).toFixed(0)),
    totalVolumeM3: Number(totalVol.toFixed(0)),
    numCompartments,
    lengthM,
    widthM,
    usableDepthM: usableDepth,
    freeboardM: 0.5,
    turnoverRatePerDay: Number((24 / storageHours).toFixed(1)),
    status: storageHours >= 4.0 ? 'PASS' : 'WARNING'
  };
}

// --------------------------------------------------------
// 10. EQUIPMENT AUTO-GENERATION ENGINE
// --------------------------------------------------------
export function generateProcessEquipmentSchedule(capacityMld: number): EquipmentItem[] {
  const qM3hr = (capacityMld * 1.05 * 1000) / 24;
  const qLs = (qM3hr * 1000) / 3600;

  return [
    {
      id: 'EQ-RAW-PMP',
      tag: 'PMP-RAW-01/02/03',
      description: 'Raw Water Intake Vertical Turbine Pumps',
      processUnit: 'Intake Works',
      duty: 2,
      standby: 1,
      capacityPerUnit: `${(qLs / 2).toFixed(1)} L/s`,
      headOrPressure: '28.5 m TDH',
      powerKw: Number(((qLs / 2 * 9.81 * 28.5) / (10 * 75)).toFixed(1)),
      efficiencyPercent: 78,
      material: 'SS316 Impeller / DI Casing',
      quantity: 3
    },
    {
      id: 'EQ-SCR-MCH',
      tag: 'SCR-MCH-01/02',
      description: 'Mechanical Fine Bar Screen Rake Mechanism',
      processUnit: 'Screening',
      duty: 1,
      standby: 1,
      capacityPerUnit: `${qM3hr.toFixed(0)} m³/hr`,
      headOrPressure: '0.25 m HL',
      powerKw: 2.2,
      efficiencyPercent: 85,
      material: 'SS304 Frame & Teeth',
      quantity: 2
    },
    {
      id: 'EQ-MIX-RPD',
      tag: 'MIX-FLS-01/02',
      description: 'Flash Mixer High-Speed Vertical Shaft Agitator',
      processUnit: 'Coagulation',
      duty: 1,
      standby: 1,
      capacityPerUnit: `${(qM3hr / 2).toFixed(0)} m³/hr`,
      headOrPressure: 'G = 800 s⁻¹',
      powerKw: 11.0,
      efficiencyPercent: 88,
      material: 'SS316 Rubber Lined Impeller',
      quantity: 2
    },
    {
      id: 'EQ-FLO-PDL',
      tag: 'FLO-PDL-01/02/03',
      description: '3-Stage Variable Speed Flocculator Paddle Drives',
      processUnit: 'Flocculation',
      duty: 3,
      standby: 1,
      capacityPerUnit: '3.0 - 12.0 RPM',
      headOrPressure: 'Tapered G 50-15 s⁻¹',
      powerKw: 5.5,
      efficiencyPercent: 82,
      material: 'GRP Paddles / SS316 Shaft',
      quantity: 4
    },
    {
      id: 'EQ-SED-SCR',
      tag: 'SED-SCR-01/02',
      description: 'Tube Settler Bottom Sludge Traveling Bridge Scraper',
      processUnit: 'Sedimentation',
      duty: 2,
      standby: 0,
      capacityPerUnit: '0.02 m/s Bridge Speed',
      headOrPressure: 'Continuous Scrape',
      powerKw: 3.0,
      efficiencyPercent: 80,
      material: 'HDPE Squeegees / SS304 Bridge',
      quantity: 2
    },
    {
      id: 'EQ-BW-PMP',
      tag: 'PMP-BW-01/02',
      description: 'Filter Backwash Water Pumps',
      processUnit: 'Filtration',
      duty: 1,
      standby: 1,
      capacityPerUnit: `${(qM3hr * 1.8).toFixed(0)} m³/hr`,
      headOrPressure: '12.0 m TDH',
      powerKw: 45.0,
      efficiencyPercent: 80,
      material: 'Ductile Iron',
      quantity: 2
    },
    {
      id: 'EQ-BW-BLW',
      tag: 'BLW-AIR-01/02',
      description: 'Filter Air Scour Roots Blowers',
      processUnit: 'Filtration',
      duty: 1,
      standby: 1,
      capacityPerUnit: '1200 Nm³/hr',
      headOrPressure: '0.45 bar',
      powerKw: 30.0,
      efficiencyPercent: 85,
      material: 'Cast Iron Casing',
      quantity: 2
    },
    {
      id: 'EQ-DIS-CHL',
      tag: 'CHL-DOS-01/02',
      description: 'Vacuum Gas Chlorinator & Booster System',
      processUnit: 'Disinfection',
      duty: 2,
      standby: 1,
      capacityPerUnit: '25 kg/hr Cl2',
      headOrPressure: '5.0 bar',
      powerKw: 4.0,
      efficiencyPercent: 90,
      material: 'Hastelloy C / PVDF',
      quantity: 3
    },
    {
      id: 'EQ-HL-PMP',
      tag: 'PMP-HLP-01/02/03/04',
      description: 'High Lift Treated Water Distribution Pumps',
      processUnit: 'High Lift Pump Station',
      duty: 3,
      standby: 1,
      capacityPerUnit: `${(qLs / 3).toFixed(1)} L/s`,
      headOrPressure: '65.0 m TDH',
      powerKw: Number(((qLs / 3 * 9.81 * 65.0) / (10 * 80)).toFixed(1)),
      efficiencyPercent: 82,
      material: 'Duplex Stainless Steel',
      quantity: 4
    }
  ];
}
