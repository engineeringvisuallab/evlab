/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 04: Preliminary Treatment, Grit, FOG, Primary Treatment & Sludge Type Definitions
 * @license Apache-2.0
 */

// ============================================================================
// 1. SCREENING & INLET HYDRAULICS
// ============================================================================

export type ScreenType =
  | 'MANUAL_BAR'
  | 'MECHANICAL_BAR'
  | 'COARSE_BAR'
  | 'FINE_STEP'
  | 'PERFORATED_PLATE'
  | 'BAND_SCREEN'
  | 'DRUM_SCREEN'
  | 'CUSTOM';

export type ScreenBarShape = 'RECTANGULAR' | 'CIRCULAR' | 'TEARDROP' | 'TAPERED';

export type ScreeningsHandlingMethod =
  | 'MANUAL_RAKE'
  | 'BELT_CONVEYOR'
  | 'SCREW_WASHER_COMPACTOR'
  | 'DEWATERING_PRESS'
  | 'SKIP_BIN';

export interface ScreenDesignConfig {
  id: string;
  name: string;
  screenType: ScreenType;
  status: 'ON' | 'OFF' | 'AUTO_SELECT';
  channelWidthM: number;
  channelCount: number;
  dutyCount: number;
  standbyCount: number;
  barOpeningMm: number;
  barThicknessMm: number;
  screenAngleDeg: number;
  barShape: ScreenBarShape;
  barShapeFactorBeta: number; // e.g. 2.42 (rect), 1.79 (round), 0.76 (teardrop)
  upstreamWaterDepthM: number;
  cleanBlockageRatio: number; // 0.00
  normalBlockageRatio: number; // 0.25
  cloggedBlockageRatio: number; // 0.50
  screeningsYieldLPer1000M3: number; // 15 - 30 for coarse, 30 - 70 for fine
  screeningsBulkDensityKgM3: number; // 850 kg/m3
  moistureContentPct: number; // 80%
  handlingMethod: ScreeningsHandlingMethod;
  allowableCleanHeadlossM: number; // 0.15 m
  allowableCloggedHeadlossM: number; // 0.40 m
  bypassAvailable: boolean;
  bypassNotes?: string;
}

export interface ScreenHydraulicResult {
  grossAreaM2: number;
  openAreaFraction: number;
  effectiveThroughAreaCleanM2: number;
  effectiveThroughAreaCloggedM2: number;
  approachVelocityMps: number;
  velocityThroughBarsCleanMps: number;
  velocityThroughBarsCloggedMps: number;
  cleanHeadlossM: number;
  normalHeadlossM: number;
  cloggedHeadlossM: number;
  headlossFormula: string;
  upstreamHglMasl: number;
  downstreamHglMasl: number;
  waterLevelDifferenceM: number;
  screeningsWetMassKgDay: number;
  screeningsDryMassKgDay: number;
  screeningsVolumeM3Day: number;
  skipStorageDays: number;
  isApproachVelocityOk: boolean;
  isThroughVelocityOk: boolean;
  isHeadlossOk: boolean;
  status: 'OK' | 'WARNING' | 'FAIL';
  validationMessages: string[];
}

// ============================================================================
// 2. GRIT REMOVAL & PRODUCTION
// ============================================================================

export type GritChamberType = 'HORIZONTAL_FLOW' | 'AERATED_GRIT' | 'VORTEX_GRIT' | 'CUSTOM';

export interface HorizontalGritConfig {
  channelVelocityMps: number; // 0.30 m/s
  detentionTimeSec: number; // 45 - 60 s
  lengthM: number;
  widthM: number;
  liquidDepthM: number;
  gritStorageDepthM: number;
  surfaceLoadingRateM3M2D: number;
}

export interface AeratedGritConfig {
  detentionTimeMin: number; // 3.0 - 5.0 min at peak
  airSupplyM3MinPerM: number; // 0.2 - 0.5 m3/min/m
  airRatePerM3Wastewater: number; // 0.005 - 0.015 m3/m3
  tankLengthM: number;
  tankWidthM: number;
  liquidDepthM: number;
  diffuserSubmergenceM: number;
  estimatedBlowerPowerKw: number;
}

export interface VortexGritConfig {
  diameterM: number; // 1.8 - 4.5 m
  liquidDepthM: number;
  hydraulicLoadingM3M2H: number; // 40 - 60 m3/m2/h
  paddleDrivePowerKw: number;
  vendorModelName: string;
  requiresVendorReview: boolean;
}

export interface GritDesignConfig {
  id: string;
  name: string;
  chamberType: GritChamberType;
  status: 'ON' | 'OFF' | 'AUTO_SELECT';
  chamberCount: number;
  dutyCount: number;
  standbyCount: number;
  targetParticleSizeMm: number; // 0.20 mm
  particleSpecificGravity: number; // 2.65
  settlingVelocityMps: number; // 0.021 m/s (Metcalf & Eddy for 0.2mm)
  gritYieldLPer1000M3: number; // 15 - 45 L/1000 m3
  gritBulkDensityKgM3: number; // 1500 kg/m3
  gritMoisturePct: number; // 50%
  volatileOrganicPct: number; // 20%
  horizontal?: HorizontalGritConfig;
  aerated?: AeratedGritConfig;
  vortex?: VortexGritConfig;
}

export interface GritHydraulicResult {
  chamberVolumeM3: number;
  surfaceAreaM2: number;
  actualDetentionTimeSec: number;
  actualHorizontalVelocityMps: number;
  surfaceOverflowRateM3M2D: number;
  removalEfficiencyPct: number;
  airflowTotalNm3Hr: number;
  blowerPowerKw: number;
  headlossM: number;
  upstreamHglMasl: number;
  downstreamHglMasl: number;
  gritWetMassKgDay: number;
  gritDryMassKgDay: number;
  gritVolumeM3Day: number;
  storageSkipCapacityM3: number;
  storageDays: number;
  status: 'OK' | 'WARNING' | 'FAIL';
  validationMessages: string[];
}

// ============================================================================
// 3. FOG & GREASE MANAGEMENT
// ============================================================================

export type FogChamberType =
  | 'PASSIVE_GREASE_TRAP'
  | 'AERATED_GREASE_CHAMBER'
  | 'SKIMMING_BAFFLE'
  | 'DAF_SKIMMER'
  | 'MECHANICAL_SKIMMER';

export interface FogDesignConfig {
  id: string;
  name: string;
  fogType: FogChamberType;
  status: 'ON' | 'OFF' | 'AUTO_SELECT';
  influentFogConcentrationMgL: number;
  isMeasuredData: boolean; // Flagged as measured vs estimated
  targetRemovalPct: number; // 60 - 85%
  retentionTimeMin: number; // 3.0 - 5.0 min
  skimmerWidthM: number;
  skimmerLengthM: number;
}

export interface FogHydraulicResult {
  removedFogKgDay: number;
  remainingFogConcentrationMgL: number;
  scumVolumeM3Day: number;
  isEstimated: boolean;
  status: 'OK' | 'WARNING' | 'FAIL';
  validationMessages: string[];
}

// ============================================================================
// 4. PRIMARY TREATMENT ALTERNATIVES & SLUDGE ENGINE
// ============================================================================

export type PrimaryAlternativeType =
  | 'CONVENTIONAL_PRIMARY_SEDIMENTATION'
  | 'CIRCULAR_CLARIFIER'
  | 'RECTANGULAR_CLARIFIER'
  | 'TUBE_SETTLER'
  | 'LAMELLA_PLATE_CLARIFIER'
  | 'PRIMARY_DAF';

export interface CircularClarifierConfig {
  diameterM: number;
  sideWaterDepthM: number;
  centerWellDiameterM: number;
  bottomSlopeRatio: number; // 1:12 (0.0833)
  weirPlacement: 'PERIPHERAL' | 'DOUBLE_SIDED_INBOARD';
  weirType: '90_DEG_V_NOTCH' | 'RECTANGULAR_CREST';
}

export interface RectangularClarifierConfig {
  lengthM: number;
  widthM: number;
  sideWaterDepthM: number;
  lengthToWidthRatio: number; // 4.0 - 6.0
  flightScraperSpeedMMin: number; // 0.6 - 1.2 m/min
  crossCollectorDepthM: number;
}

export interface LamellaPlateConfig {
  plateAngleDeg: number; // 55 - 60 deg
  plateSpacingMm: number; // 50 mm
  plateLengthM: number; // 1.5 - 2.0 m
  projectedAreaMultiplier: number; // 5.0 - 8.0x
  geometricFootprintM2: number;
  effectiveSettlingAreaM2: number;
}

export interface TubeSettlerConfig {
  tubeModuleAngleDeg: number; // 60 deg
  tubeOpeningMm: number; // 50 mm
  moduleHeightM: number; // 0.5 - 1.0 m
  effectiveAreaMultiplier: number; // 4.0 - 6.0x
}

export interface PrimaryDafConfig {
  hydraulicLoadingM3M2H: number; // 5.0 - 15.0 m3/m2/h
  airToSolidsRatioKgAirPerKgSolids: number; // 0.015 - 0.030
  saturatorPressureKpa: number; // 400 - 600 kPa
  recycleRatioPct: number; // 15 - 30%
  retentionContactTimeMin: number; // 10 - 20 min
}

export interface PrimaryClarifierDesignConfig {
  id: string;
  name: string;
  alternativeType: PrimaryAlternativeType;
  status: 'ON' | 'OFF' | 'AUTO_SELECT';
  tankCount: number;
  dutyCount: number;
  standbyCount: number;
  designSorAverageM3M2D: number; // 25 - 35 m3/m2/d
  designSorPeakM3M2D: number; // 35 - 45 m3/m2/d
  maxWeirLoadingM3MD: number; // 125 - 250 m3/m/d
  minDetentionTimeHours: number; // 1.5 - 2.5 h
  expectedTssRemovalPct: number; // 55 - 65%
  expectedBodRemovalPct: number; // 30 - 35%
  expectedCodRemovalPct: number; // 30 - 35%
  expectedVssRemovalPct: number; // 55 - 65%
  sludgeConcentrationPct: number; // 3.0 - 5.0%
  sludgeSpecificGravity: number; // 1.025
  freeboardM: number; // 0.5 m
  circular?: CircularClarifierConfig;
  rectangular?: RectangularClarifierConfig;
  lamella?: LamellaPlateConfig;
  tube?: TubeSettlerConfig;
  daf?: PrimaryDafConfig;
}

export interface PrimaryClarifierHydraulicResult {
  surfaceAreaTotalM2: number;
  surfaceAreaPerTankM2: number;
  tankVolumeTotalM3: number;
  tankVolumePerTankM3: number;
  actualSorAverageM3M2D: number;
  actualSorPeakM3M2D: number;
  actualHrtAverageHours: number;
  actualHrtPeakHours: number;
  totalWeirLengthM: number;
  weirLoadingAverageM3MD: number;
  weirLoadingPeakM3MD: number;
  solidsLoadingRateKgM2D: number;
  weirDropM: number;
  headOverWeirM: number;
  totalHeadlossM: number;
  upstreamHglMasl: number;
  weirCrestElevationMasl: number;
  downstreamHglMasl: number;
  waterDepthM: number;
  freeboardProvidedM: number;
  isSorOk: boolean;
  isHrtOk: boolean;
  isWeirLoadingOk: boolean;
  isFreeboardOk: boolean;
  status: 'OK' | 'WARNING' | 'FAIL';
  validationMessages: string[];
}

export interface PrimarySludgeResult {
  influentTssKgDay: number;
  tssRemovedKgDay: number;
  primaryDrySolidsKgDay: number;
  primaryVolatileSolidsKgDay: number;
  primaryWetSludgeM3Day: number;
  sludgeMoisturePct: number;
  sludgePumpingRateM3Hr: number;
  sludgeWithdrawalCyclesPerDay: number;
  sludgeHopperVolumeM3: number;
  sludgeStorageHours: number;
  influentBodKgDay: number;
  bodRemovedKgDay: number;
  effluentBodKgDay: number;
  effluentBod5ConcentrationMgL: number;
  influentCodKgDay: number;
  codRemovedKgDay: number;
  effluentCodKgDay: number;
  effluentCodConcentrationMgL: number;
  effluentTssConcentrationMgL: number;
  status: 'OK' | 'WARNING' | 'FAIL';
}

// ============================================================================
// 5. MASS BALANCE MATRIX & WATER BALANCE
// ============================================================================

export interface StreamQualityNode {
  nodeId: string;
  nodeName: string;
  flowLps: number;
  flowM3d: number;
  bodMgL: number;
  bodKgDay: number;
  codMgL: number;
  codKgDay: number;
  tssMgL: number;
  tssKgDay: number;
  vssMgL: number;
  vssKgDay: number;
  tknMgL: number;
  tknKgDay: number;
  tnMgL: number;
  tnKgDay: number;
  tpMgL: number;
  tpKgDay: number;
  ogMgL: number;
  ogKgDay: number;
  notes?: string;
}

export interface MassBalanceStreamState {
  rawInfluent: StreamQualityNode;
  postCoarseScreen: StreamQualityNode;
  postFineScreen: StreamQualityNode;
  postGritRemoval: StreamQualityNode;
  postFogRemoval: StreamQualityNode;
  primaryEffluent: StreamQualityNode;
  primarySludgeWaste: StreamQualityNode;
  screeningsSolidWaste: {
    wetMassKgDay: number;
    dryMassKgDay: number;
    volumeM3Day: number;
  };
  gritSolidWaste: {
    wetMassKgDay: number;
    dryMassKgDay: number;
    volumeM3Day: number;
  };
  scumWaste: {
    volumeM3Day: number;
    massKgDay: number;
  };
  waterBalanceSummary: {
    inflowM3d: number;
    effluentM3d: number;
    sludgeLossM3d: number;
    screeningsGritLossM3d: number;
    scumLossM3d: number;
    closureErrorPct: number;
    isBalanced: boolean;
  };
}

// ============================================================================
// 6. PROCESS ALTERNATIVE COMPARISON & MULTI-CRITERIA SCORING (MCDA)
// ============================================================================

export interface AlternativeScoreDimension {
  dimensionKey: string;
  dimensionName: string;
  weight: number; // 0.0 - 1.0
  score: number; // 0 - 100
  reasoning: string;
}

export interface AlternativeComparisonItem {
  alternativeType: PrimaryAlternativeType;
  title: string;
  description: string;
  landRequiredM2: number;
  capexUSD: number;
  isCapexEstimated: boolean;
  opexUSDPerYear: number;
  isOpexEstimated: boolean;
  energyIntensityKwhPerM3: number;
  tssRemovalPct: number;
  bodRemovalPct: number;
  operatorComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  maintenanceRating: 'LOW' | 'MODERATE' | 'DEMANDING';
  shockResilience: 'LOW' | 'MEDIUM' | 'HIGH';
  expansionFlexibility: 'LOW' | 'MEDIUM' | 'HIGH';
  totalWeightedScore: number;
  dimensions: AlternativeScoreDimension[];
  constraintPass: boolean;
  constraintWarnings: string[];
  recommendationRank: number;
  suitabilityStatus: 'RECOMMENDED' | 'ACCEPTABLE' | 'RESTRICTED' | 'NOT_SUITABLE';
}

export interface AlternativeComparisonReport {
  recommendedAlternative: PrimaryAlternativeType;
  selectionRationale: string;
  criteriaWeights: Record<string, number>;
  weightDistribution: Record<string, number>;
  alternatives: AlternativeComparisonItem[];
  appliedConstraints: {
    maxAvailableLandM2: number;
    requiredTssRemovalPct: number;
    operatorSkillAllowed: string;
    maxCapexBudgetUSD?: number;
  };
}

// ============================================================================
// 7. PLANT HYDRAULIC PROFILE (HGL / EGL)
// ============================================================================

export interface PlantHglStation {
  stationId: string;
  unitName: string;
  chainageM: number;
  groundElevationMasl: number;
  invertElevationMasl: number;
  waterDepthM: number;
  waterLevelMasl: number;
  hglMasl: number;
  eglMasl: number;
  velocityMps: number;
  headlossThroughUnitM: number;
  freeboardM: number;
  freeboardRequiredM: number;
  isFreeboardAdequate: boolean;
  notes: string;
}

export interface PlantHglProfileState {
  profileId: string;
  profileName: string;
  totalHeadlossM: number;
  inletHglMasl: number;
  effluentHglMasl: number;
  stations: PlantHglStation[];
}

// ============================================================================
// 8. REDUNDANCY & OUT-OF-SERVICE FAILOVER SCENARIOS
// ============================================================================

export interface RedundancyCheckResult {
  unitType: 'SCREEN' | 'GRIT' | 'PRIMARY_CLARIFIER';
  totalUnits: number;
  dutyUnits: number;
  standbyUnits: number;
  nMinusOneCapacityLps: number;
  requiredPeakFlowLps: number;
  hasAdequateRedundancy: boolean;
  riskSeverity: 'NONE' | 'MODERATE' | 'CRITICAL';
  contingencyPlan: string;
}

export interface PreliminaryTrainSummary {
  redundancyCompliant: boolean;
  totalHydraulicHeadlossM: number;
  inletHglMasl: number;
  effluentHglMasl: number;
  totalWetSolidsGeneratedKgDay: number;
  totalDrySolidsGeneratedKgDay: number;
}

// ============================================================================
// 9. PHASE 04 COMPLETE SCENARIO SUBSTATE
// ============================================================================

export interface PreliminaryPrimaryState {
  coarseScreen: ScreenDesignConfig;
  fineScreen: ScreenDesignConfig;
  coarseScreenHydraulics: ScreenHydraulicResult;
  fineScreenHydraulics: ScreenHydraulicResult;

  gritChamber: GritDesignConfig;
  gritHydraulics: GritHydraulicResult;

  fogManagement: FogDesignConfig;
  fogHydraulics: FogHydraulicResult;

  primaryClarifier: PrimaryClarifierDesignConfig;
  primaryHydraulics: PrimaryClarifierHydraulicResult;
  primarySludge: PrimarySludgeResult;

  massBalance: MassBalanceStreamState;
  alternativeComparison: AlternativeComparisonReport;
  plantHglProfile: PlantHglProfileState;
  redundancyChecks: RedundancyCheckResult[];
  preliminaryTrainSummary: PreliminaryTrainSummary;
}
