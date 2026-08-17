/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 05: Biological Treatment, Aeration, Biomass, Oxygen, Nutrient Removal & Process Selection
 * @license Apache-2.0
 */

import { StreamQualityNode } from './preliminaryPrimary';

// ============================================================================
// 1. BIOLOGICAL PROCESS FAMILIES & PROCESS TYPES
// ============================================================================

export type BiologicalProcessFamily =
  | 'ACTIVATED_SLUDGE'
  | 'ATTACHED_GROWTH'
  | 'BATCH_REACTOR'
  | 'ANAEROBIC'
  | 'HYBRID_BNR';

export type BiologicalProcessType =
  // Activated Sludge
  | 'CAS_PLUG_FLOW'
  | 'CAS_COMPLETE_MIX'
  | 'EXTENDED_AERATION'
  | 'OXIDATION_DITCH'
  // Attached Growth
  | 'MBBR'
  | 'IFAS'
  | 'TRICKLING_FILTER'
  | 'RBC'
  // Batch
  | 'SBR'
  // Anaerobic
  | 'UASB'
  | 'ANAEROBIC_CONTACT'
  // Hybrid BNR
  | 'MLE_BNR'
  | 'A2O_EBPR'
  | 'UCT_BNR'
  | 'STEP_FEED_BNR'
  | 'BARDENPHO_5STAGE';

export type BiologicalSelectionMode = 'ON' | 'OFF' | 'AUTO_SELECT';

export type BiologicalZoneType =
  | 'ANAEROBIC'
  | 'ANOXIC'
  | 'AEROBIC'
  | 'SELECTOR'
  | 'POLISHING'
  | 'BATCH'
  | 'ATTACHED_GROWTH'
  | 'CARROUSEL_CHANNEL';

// ============================================================================
// 2. KINETIC COEFFICIENTS & TEMPERATURE SENSITIVITY
// ============================================================================

export interface KineticParameters {
  heterotrophicYieldYh: number; // g VSS / g BOD5 (typical 0.45 - 0.65)
  heterotrophicDecayBh: number; // 1/day at 20°C (typical 0.05 - 0.08)
  heterotrophicTempTheta: number; // typical 1.04 - 1.07
  autotrophicYieldYa: number; // g VSS / g NH4-N oxidized (typical 0.12 - 0.18)
  autotrophicDecayBa: number; // 1/day at 20°C (typical 0.04 - 0.06)
  autotrophicTempTheta: number; // typical 1.08 - 1.10
  muMaxNitrifier20: number; // 1/day at 20°C (typical 0.45 - 0.90)
  halfSaturationKsBod: number; // mg/L BOD5 (typical 20 - 60)
  halfSaturationKnh4: number; // mg/L NH4-N (typical 0.5 - 1.5)
  halfSaturationKoDo: number; // mg/L DO (typical 0.4 - 1.0)
  nitrificationSafetyFactor: number; // typical 1.5 - 2.5
  denitrificationRateSpecific: number; // g NO3-N / (g VSS·day) at 20°C (typical 0.03 - 0.12)
  denitrificationTempTheta: number; // typical 1.07 - 1.09
}

// ============================================================================
// 3. SUSPENDED GROWTH & ACTIVATED SLUDGE CONFIGURATION
// ============================================================================

export interface ActivatedSludgeDesignConfig {
  id: string;
  name: string;
  processType: BiologicalProcessType;
  status: BiologicalSelectionMode;
  tankCount: number;
  dutyCount: number;
  standbyCount: number;
  tankLengthM: number;
  tankWidthM: number;
  liquidDepthM: number;
  sideWallFreeboardM: number;
  designMlssMgL: number; // 2500 - 4500 mg/L for CAS, 3500 - 6000 for Ext Aeration
  designMlvssRatio: number; // 0.75 - 0.82
  targetFmRatio: number; // kg BOD5 / kg MLVSS·day (0.2 - 0.4 CAS, 0.05 - 0.15 Ext Aer)
  designSrtDays: number; // days (5 - 15 CAS, 18 - 30 Ext Aeration / Nitrification)
  operatingDoMgL: number; // 1.5 - 2.5 mg/L
  anaerobicVolumeFraction: number; // 0.0 - 0.20
  anoxicVolumeFraction: number; // 0.0 - 0.35
  aerobicVolumeFraction: number; // 0.45 - 1.00
  rasRatioDesign: number; // 0.50 - 1.00 Q_in
  internalRecycleRatio: number; // 2.0 - 4.0 Q_in for MLE/A2O
}

export interface ActivatedSludgeHydraulicResult {
  totalReactorVolumeM3: number;
  volumePerTankM3: number;
  anaerobicVolumeM3: number;
  anoxicVolumeM3: number;
  aerobicVolumeM3: number;
  actualHrtHours: number;
  anaerobicHrtHours: number;
  anoxicHrtHours: number;
  aerobicHrtHours: number;
  actualFmRatio: number;
  biomassInventoryTotalKg: number;
  volatileBiomassInventoryKg: number;
  dailyWasDryMassKgDay: number;
  dailyWasVolumeM3Day: number;
  calculatedSrtDays: number;
  isFmAcceptable: boolean;
  isSrtAcceptableForNitrification: boolean;
  isHrtAcceptable: boolean;
  validationMessages: string[];
}

// ============================================================================
// 4. ATTACHED GROWTH (MBBR / IFAS / TRICKLING FILTER / RBC)
// ============================================================================

export type MbbrCarrierType = 'K1_CARRIER' | 'K3_CARRIER' | 'K5_CHIP' | 'SPONGE_MEDIA' | 'CUSTOM_MEDIA';

export interface MbbrDesignConfig {
  id: string;
  name: string;
  carrierType: MbbrCarrierType;
  specificSurfaceAreaM2M3: number; // 500 - 1200 m2/m3
  mediaFillFractionPct: number; // 40% - 65%
  carrierBulkDensityKgM3: number; // 140 - 160 kg/m3
  designSalrBodGPerM2D: number; // Surface Area Loading Rate 10 - 25 g BOD5/m2/d
  designSalrNh4GPerM2D: number; // 0.8 - 1.5 g NH4-N/m2/d
  tankCount: number;
  liquidDepthM: number;
  tankLengthM: number;
  tankWidthM: number;
  mediaRetentionScreenOpeningMm: number; // 3 - 5 mm wedge-wire sieves
}

export interface MbbrHydraulicResult {
  totalMediaVolumeM3: number;
  effectiveBiofilmSurfaceAreaM2: number;
  totalReactorVolumeM3: number;
  actualMediaFillPct: number;
  actualSalrBodGM2D: number;
  actualSalrNh4GM2D: number;
  volumetricBodLoadingKgM3D: number;
  actualHrtHours: number;
  mediaMassTonnes: number;
  sieveHeadlossM: number;
  isFillFractionOk: boolean;
  isSalrOk: boolean;
  validationMessages: string[];
}

export interface IfasDesignConfig {
  id: string;
  name: string;
  carrierType: MbbrCarrierType;
  specificSurfaceAreaM2M3: number;
  mediaFillFractionPct: number;
  suspendedMlssMgL: number; // 2000 - 3000 mg/L
  attachedBiomassDensityGM2: number; // 10 - 20 g TSS/m2
  tankCount: number;
  liquidDepthM: number;
  tankLengthM: number;
  tankWidthM: number;
  rasRatio: number;
}

export interface IfasHydraulicResult {
  totalReactorVolumeM3: number;
  suspendedBiomassKg: number;
  attachedBiomassKg: number;
  totalEquivalentBiomassKg: number;
  apparentMlssMgL: number;
  actualHrtHours: number;
  sludgeProductionKgDay: number;
  isHybridMassBalanced: boolean;
}

export interface TricklingFilterConfig {
  id: string;
  name: string;
  mediaType: 'ROCK' | 'PLASTIC_CROSS_FLOW' | 'PLASTIC_VERTICAL_FLOW';
  specificSurfaceAreaM2M3: number; // 50 m2/m3 (rock), 100 - 150 m2/m3 (plastic)
  filterBedDepthM: number; // 1.8 - 2.5 m (rock), 4.0 - 8.0 m (plastic)
  filterCount: number;
  recirculationRatio: number; // 0.5 - 2.5 Q_in
  designHydraulicLoadingM3M2D: number; // 10 - 30 m3/m2/d
  designOrganicLoadingKgBodM3D: number; // 0.4 - 1.2 kg BOD/m3/d
}

export interface TricklingFilterResult {
  totalFilterAreaM2: number;
  filterDiameterM: number;
  totalMediaVolumeM3: number;
  actualHydraulicLoadingM3M2D: number;
  actualOrganicLoadingKgM3D: number;
  nrcBODRemovalEfficiencyPct: number;
  effluentBOD5MgL: number;
  distributorArmSpeedRpm: number;
  underdrainHeadlossM: number;
}

export interface RbcDesignConfig {
  id: string;
  name: string;
  stagesCount: number; // 3 - 4 stages
  shaftCount: number;
  discDiameterM: number; // 3.0 - 3.7 m
  discAreaPerShaftM2: number; // 9,000 - 14,000 m2/shaft
  submergencePct: number; // 40%
  rotationalSpeedRpm: number; // 1.2 - 1.8 rpm
  driveMotorKwPerShaft: number; // 3.7 - 7.5 kW
}

export interface RbcHydraulicResult {
  totalDiscSurfaceAreaM2: number;
  organicLoadingRateGBodM2D: number;
  hydraulicLoadingRateM3M2D: number;
  firstStageBODLoadingGBodM2D: number;
  estimatedBODRemovalPct: number;
  effluentBOD5MgL: number;
  totalDrivePowerKw: number;
}

// ============================================================================
// 5. SEQUENCING BATCH REACTOR (SBR) CONFIGURATION
// ============================================================================

export interface SbrPhaseTimingsMin {
  fillMin: number; // 60 - 90 min
  reactAeratedMin: number; // 90 - 150 min
  reactAnoxicMin: number; // 30 - 60 min
  settleMin: number; // 45 - 60 min
  decantMin: number; // 30 - 45 min
  idleMin: number; // 15 - 30 min
}

export interface SbrDesignConfig {
  id: string;
  name: string;
  basinCount: number; // Minimum 2 for continuous inflow
  cyclesPerDayPerBasin: number; // 4 - 6 cycles/day
  phaseTimings: SbrPhaseTimingsMin;
  volumetricExchangeRatioPct: number; // 20% - 35%
  topWaterLevelTwlM: number;
  bottomWaterLevelBwlM: number;
  basinLengthM: number;
  basinWidthM: number;
  designMlssAtTwlMgL: number; // 3000 - 5000 mg/L
  decanterType: 'FLOATING_WEIR' | 'MECHANICAL_SCREW' | 'SIPHON';
  peakBufferingProvided: boolean;
}

export interface SbrHydraulicResult {
  totalCycleTimeHours: number;
  batchVolumePerCycleM3: number;
  totalBasinVolumeAtTwlM3: number;
  volumeAtBwlM3: number;
  decantDepthM: number;
  actualExchangeRatioPct: number;
  peakDecantFlowRateM3H: number;
  mlssAtBwlMgL: number;
  sludgeWastedPerCycleKg: number;
  isContinuousFeedBufferingOk: boolean;
  validationMessages: string[];
}

// ============================================================================
// 6. ANAEROBIC & UASB CONFIGURATION
// ============================================================================

export interface UasbDesignConfig {
  id: string;
  name: string;
  reactorCount: number;
  upflowVelocityMps: number; // 0.7 - 1.2 m/h at peak (0.0002 - 0.00035 m/s)
  liquidDepthM: number; // 4.5 - 6.0 m
  designOlhKgCodM3D: number; // 5 - 15 kg COD/m3/d
  sludgeBedConcentrationGPerL: number; // 50 - 100 g/L (5 - 10% TS)
  feedDistributionInletsCount: number;
  threePhaseSeparatorType: 'HOOD_DEFLECTOR' | 'MODULAR_PLATES';
}

export interface AnaerobicApplicabilityReport {
  isApplicable: 'SUITABLE' | 'POTENTIALLY_SUITABLE' | 'NOT_RECOMMENDED' | 'ENGINEER_REVIEW';
  reasons: string[];
  temperatureSuitability: string;
  organicLoadingSuitability: string;
  solidsSuitability: string;
  sulfateRatioSuitability: string;
  toxicityRisk: string;
  polishingRequirement: string;
}

export interface UasbHydraulicResult {
  totalReactorVolumeM3: number;
  reactorAreaM2: number;
  actualUpflowVelocityMpH: number;
  actualOlhKgCodM3D: number;
  hydraulicRetentionTimeHours: number;
  codRemovalEfficiencyPct: number;
  bodRemovalEfficiencyPct: number;
  dailyCodRemovedKgDay: number;
  biogasProductionNm3Day: number;
  methaneGasProductionNm3Day: number;
  equivalentEnergyOutputKwhDay: number;
  anaerobicSludgeYieldKgDay: number;
  applicability: AnaerobicApplicabilityReport;
}

// ============================================================================
// 7. AERATION SYSTEM & OXYGEN TRANSFER ENGINE
// ============================================================================

export type AerationDiffuserType =
  | 'FINE_BUBBLE_DISC'
  | 'FINE_BUBBLE_TUBE'
  | 'COARSE_BUBBLE'
  | 'SURFACE_MECHANICAL'
  | 'SUBMERGED_JET';

export interface AerationDesignConfig {
  id: string;
  name: string;
  diffuserType: AerationDiffuserType;
  alphaFactor: number; // 0.55 - 0.85 (wastewater to clean water O2 transfer ratio)
  betaFactor: number; // 0.95 - 0.98 (wastewater to clean water saturation ratio)
  diffuserFoulingFactorF: number; // 0.80 - 0.90
  diffuserSubmergenceM: number; // liquid depth - 0.3 m
  diffuserSpecificSotePerM: number; // 6.0% - 7.5% per meter depth for fine bubble
  blowerType: 'CENTRIFUGAL_TURBO' | 'ROTARY_LOBE_ROOTS' | 'SCREW_COMPRESSOR';
  dutyBlowerCount: number;
  standbyBlowerCount: number;
  blowerEfficiencyPct: number; // 70% - 85%
  motorEfficiencyPct: number; // 92% - 96%
  siteAtmosphericPressureKPa: number; // 101.3 kPa at sea level
  maxDesignAirTempCelsius: number; // 35°C - 45°C
  minDesignAirTempCelsius: number; // 5°C - 15°C
}

export interface OxygenDemandResult {
  carbonaceousOxygenKgO2Day: number;
  nitrificationOxygenKgO2Day: number;
  endogenousRespirationKgO2Day: number;
  denitrificationCreditKgO2Day: number;
  totalActualOxygenRequirementAotrKgO2Day: number;
  peakAotrKgO2Hour: number;
  avgAotrKgO2Hour: number;
  dissolvedOxygenSaturationCleanWaterMgL: number;
  dissolvedOxygenSaturationFieldMgL: number;
  standardOxygenTransferRateSotrKgO2Day: number;
  peakSotrKgO2Hour: number;
  effectiveSotePct: number;
  requiredAirflowNm3Hour: number;
  peakRequiredAirflowNm3Hour: number;
  requiredAirflowScfm: number;
  airFlowPerDiffuserNm3H: number;
  totalDiffusersRequired: number;
  blowerDischargePressureBarG: number;
  powerPerBlowerKw: number;
  totalOperatingBlowerPowerKw: number;
  dailyAerationEnergyKwhDay: number;
  specificAerationEnergyKwhPerKgBod: number;
  specificAerationEnergyKwhPerM3: number;
}

export interface AerationControlLoop {
  variable: string;
  setpoint: string;
  sensorTag: string;
  actuatorTag: string;
  mode: 'AUTO_PID' | 'MANUAL' | 'OFF';
  dependency: string;
}

// ============================================================================
// 8. NITROGEN & PHOSPHORUS REMOVAL FOUNDATION
// ============================================================================

export interface NitrogenRemovalConfig {
  configurationType:
    | 'NITRIFICATION_ONLY'
    | 'PRE_ANOXIC_MLE'
    | 'POST_ANOXIC'
    | 'A2O_EBPR'
    | 'UCT_BNR'
    | 'STEP_FEED_BNR'
    | 'BARDENPHO_5STAGE';
  targetEffluentNh4MgL: number; // e.g. 1.0 - 5.0 mg/L
  targetEffluentTnMgL: number; // e.g. 10.0 mg/L
  minimumWinterWastewaterTempCelsius: number; // 12°C - 18°C
  externalCarbonSource: 'NONE' | 'METHANOL' | 'ACETIC_ACID' | 'MICROC_COMMERCIAL' | 'RAW_SEWAGE_BYPASS';
  externalCarbonDosingAvailable: boolean;
}

export interface NitrogenRemovalResult {
  influentTknKgDay: number;
  unbiodegradableTknKgDay: number;
  nitrogenAssimilatedInBiomassKgDay: number;
  netNitrifiableNitrogenKgDay: number;
  nitrifiedNitrogenKgDay: number;
  nitrificationOxygenDemandKgDay: number;
  alkalinityConsumedKgCaco3Day: number;
  alkalinityConsumedMgL: number;
  nitrateFormedMgL: number;
  denitrificationCapacityKgNo3Day: number;
  denitrifiedNitrogenKgDay: number;
  alkalinityRecoveredKgCaco3Day: number;
  alkalinityRecoveredMgL: number;
  netAlkalinityResidualMgL: number;
  isAlkalinitySufficient: boolean;
  supplementalAlkalinityDosingKgDay: number; // as NaHCO3 or Lime if deficit
  requiredInternalRecycleRatio: number; // R_IR
  isInternalRecycleFeasible: boolean;
  biodegradableCodToTknRatio: number;
  isCarbonSufficientForDenitrification: boolean;
  supplementalCarbonDosingKgDay: number;
  predictedEffluentNh4MgL: number;
  predictedEffluentNo3MgL: number;
  predictedEffluentTnMgL: number;
  complianceTnStatus: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
}

export interface PhosphorusRemovalConfig {
  ebprEnabled: boolean;
  anaerobicContactFractionPct: number; // 10% - 15% of biological volume
  influentVfaMgL: number; // Volatile Fatty Acids
  chemicalPPrecipitationEnabled: boolean;
  chemicalCoagulant: 'ALUM' | 'FERRIC_CHLORIDE' | 'POLY_ALUMINUM_CHLORIDE' | 'LIME';
  targetEffluentTpMgL: number; // 0.5 - 2.0 mg/L
}

export interface PhosphorusRemovalResult {
  influentTpKgDay: number;
  phosphorusAssimilatedInBiomassKgDay: number; // 1.5 - 2.0% of non-EBPR biomass, 3.5 - 5.0% of EBPR biomass
  biologicalPAccumulationKgDay: number;
  biologicalPremovalEfficiencyPct: number;
  residualSolubleTpMgL: number;
  isEbprVfaSufficient: boolean;
  vfaToTpRatio: number;
  chemicalPrecipitationRequired: boolean;
  chemicalPToPrecipitateKgDay: number;
  molarMetalToPRatio: number; // 1.5 - 2.0 mol Metal / mol P
  dailyCoagulantSolutionKgDay: number;
  chemicalSludgeGeneratedKgDay: number;
  predictedEffluentTpMgL: number;
  complianceTpStatus: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
}

// ============================================================================
// 9. RECYCLE & WASTING (RAS / WAS / INTERNAL RECYCLE)
// ============================================================================

export interface ProcessRecycleStream {
  streamId: string;
  name: string;
  sourceUnit: string;
  destinationUnit: string;
  designFlowM3Day: number;
  designFlowLps: number;
  recycleRatioToQ: number;
  purpose: 'BIOMASS_RETURN' | 'NITRATE_RECYCLE' | 'PHOSPHORUS_RELEASE_ISOLATION' | 'SLUDGE_WASTING';
  tssConcentrationMgL: number;
  pumpAssetTag: string;
  pumpDutyCount: number;
  pumpStandbyCount: number;
  pumpPowerKw: number;
}

export interface BiologicalSludgeSummary {
  heterotrophicBiomassKgDay: number;
  autotrophicBiomassKgDay: number;
  cellDebrisKgDay: number;
  inertSuspendedSolidsKgDay: number;
  chemicalPrecipitateSludgeKgDay: number;
  totalBiologicalDrySolidsKgDay: number;
  primaryDrySolidsKgDay: number;
  combinedTotalDrySolidsKgDay: number;
  wasWasteFlowRateM3Day: number;
  wasTssConcentrationMgL: number; // 6000 - 10000 mg/L
  combinedWetSludgeVolumeM3Day: number;
}

// ============================================================================
// 10. MULTI-CRITERIA DECISION ANALYSIS (MCDA) FOR BIOLOGICAL ALTERNATIVES
// ============================================================================

export interface BiologicalAlternativeEvaluation {
  processType: BiologicalProcessType;
  title: string;
  family: BiologicalProcessFamily;
  totalReactorVolumeM3: number;
  footprintM2: number;
  capexUSD: number;
  isCapexEstimated: boolean;
  opexUSDPerYear: number;
  isOpexEstimated: boolean;
  energyIntensityKwhPerM3: number;
  totalPowerKw: number;
  sludgeYieldKgPerKgBod: number;
  operatorSkillRequired: 'UNSKILLED' | 'SEMI_SKILLED' | 'CERTIFIED' | 'ADVANCED_AUTOMATED';
  bodRemovalPct: number;
  codRemovalPct: number;
  tnRemovalPct: number;
  tpRemovalPct: number;
  shockResilience: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  coldTempSensitivity: 'LOW' | 'MODERATE' | 'HIGH';
  expansionFlexibility: 'LOW' | 'MEDIUM' | 'HIGH';
  dimensions: {
    dimensionKey: string;
    dimensionName: string;
    weight: number;
    score: number; // 0 - 100
    reasoning: string;
  }[];
  totalWeightedScore: number;
  rank: number;
  suitabilityStatus: 'RECOMMENDED' | 'ACCEPTABLE' | 'RESTRICTED' | 'NOT_SUITABLE';
  keyAdvantages: string[];
  keyLimitations: string[];
}

export interface BiologicalAlternativeReport {
  recommendedProcess: BiologicalProcessType;
  selectionRationale: string;
  criteriaWeights: Record<string, number>;
  alternatives: BiologicalAlternativeEvaluation[];
  sensitivityAnalysis: {
    scenarioName: string;
    description: string;
    winnerProcess: BiologicalProcessType;
    winnerScore: number;
  }[];
}

// ============================================================================
// 11. REDUNDANCY, N-1 FAILOVER & HYDRAULIC PROFILE
// ============================================================================

export interface BiologicalRedundancyCheck {
  subsystem: 'BIO_REACTOR_TRAINS' | 'AERATION_BLOWERS' | 'INTERNAL_RECYCLE_PUMPS' | 'RAS_PUMPS' | 'WAS_PUMPS';
  totalUnits: number;
  dutyUnits: number;
  standbyUnits: number;
  nMinusOneCapacityPct: number;
  hasAdequateRedundancy: boolean;
  riskSeverity: 'NONE' | 'MODERATE' | 'CRITICAL';
  contingencyPlan: string;
}

export interface BiologicalFailureScenario {
  failureScenarioId: string;
  scenarioName: string;
  triggerEvent: 'SINGLE_BLOWER_TRIP' | 'SINGLE_TRAIN_ISOLATION' | 'RECYCLE_PUMP_TRIP' | 'POWER_OUTAGE';
  remainingCapacityPct: number;
  biologicalEffluentRisk: string;
  operatorMitigationAction: string;
}

// ============================================================================
// 12. PHASE 05 COMPLETE SCENARIO SUBSTATE
// ============================================================================

export interface BiologicalTreatmentState {
  processType: BiologicalProcessType;
  status: BiologicalSelectionMode;
  designFlowM3Day: number;
  designFlowLps: number;
  hydraulicPeakFlowLps: number;
  kinetics: KineticParameters;
  activatedSludge: ActivatedSludgeDesignConfig;
  activatedSludgeHydraulics: ActivatedSludgeHydraulicResult;
  mbbrConfig: MbbrDesignConfig;
  mbbrHydraulics: MbbrHydraulicResult;
  ifasConfig: IfasDesignConfig;
  ifasHydraulics: IfasHydraulicResult;
  sbrConfig: SbrDesignConfig;
  sbrHydraulics: SbrHydraulicResult;
  tricklingFilterConfig: TricklingFilterConfig;
  tricklingFilterHydraulics: TricklingFilterResult;
  rbcConfig: RbcDesignConfig;
  rbcHydraulics: RbcHydraulicResult;
  uasbConfig: UasbDesignConfig;
  uasbHydraulics: UasbHydraulicResult;
  aerationConfig: AerationDesignConfig;
  oxygenDemand: OxygenDemandResult;
  aerationControls: AerationControlLoop[];
  nitrogenConfig: NitrogenRemovalConfig;
  nitrogenRemoval: NitrogenRemovalResult;
  phosphorusConfig: PhosphorusRemovalConfig;
  phosphorusRemoval: PhosphorusRemovalResult;
  recycleStreams: ProcessRecycleStream[];
  sludgeSummary: BiologicalSludgeSummary;
  alternativeReport: BiologicalAlternativeReport;
  redundancyChecks: BiologicalRedundancyCheck[];
  failureScenarios: BiologicalFailureScenario[];
  biologicalEffluent: StreamQualityNode;
  summary: {
    selectedTechnologyName: string;
    totalReactorVolumeM3: number;
    totalBiologicalFootprintM2: number;
    totalAerationPowerKw: number;
    totalBiomassDryKgDay: number;
    overallBodRemovalPct: number;
    overallCodRemovalPct: number;
    overallTnRemovalPct: number;
    overallTpRemovalPct: number;
    complianceSummary: string;
  };
}
