/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 01 Core Data Models & Type Declarations
 * @license Apache-2.0
 */

// ============================================================================
// 1. ENUMS & CONSTANTS
// ============================================================================

export type SystemMode = 'ON' | 'OFF' | 'AUTO';

export type ValidationSeverity = 'PASS' | 'WARNING' | 'FAIL' | 'ENGINEER_REVIEW' | 'MISSING_INPUT';

export type ParameterCategory = 
  | 'DEMOGRAPHICS'
  | 'FLOW_HYDRAULICS'
  | 'INFLUENT_QUALITY'
  | 'SEWER_HYDRAULICS'
  | 'PRELIMINARY_TREATMENT'
  | 'PRIMARY_TREATMENT'
  | 'BIOLOGICAL_TREATMENT'
  | 'AERATION_SYSTEM'
  | 'SECONDARY_CLARIFIER'
  | 'TERTIARY_TREATMENT'
  | 'DISINFECTION'
  | 'SLUDGE_HANDLING'
  | 'BIOGAS_ENERGY'
  | 'CHEMICAL_SYSTEMS'
  | 'ELECTRICAL_POWER'
  | 'INSTRUMENTATION_SCADA'
  | 'CIVIL_STRUCTURAL'
  | 'BOQ_COSTING'
  | 'COMPLIANCE_ENVIRONMENT';

export type StreamType = 'LIQUID' | 'SLUDGE' | 'GAS' | 'CHEMICAL' | 'AIR';

export type AssetCategory = 
  | 'PUMP'
  | 'BLOWER'
  | 'SCREEN'
  | 'GRIT_CHAMBER'
  | 'CLARIFIER'
  | 'TANK_REACTOR'
  | 'MIXER'
  | 'VALVE'
  | 'PIPE'
  | 'INSTRUMENT'
  | 'MOTOR_DRIVE'
  | 'GENERATOR'
  | 'FILTER_MEDIA'
  | 'DISINFECTION_EQUIPMENT'
  | 'DIGESTER'
  | 'DEWATERING_EQUIPMENT'
  | 'BUILDING_STRUCTURE';

// ============================================================================
// 2. PROJECT IDENTITY & METADATA
// ============================================================================

export interface ProjectIdentity {
  id: string; // e.g., STP-PROJ-001
  name: string;
  client: string;
  consultant: string;
  contractor: string;
  location: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  crs: string; // Coordinate Reference System e.g. EPSG:4326
  description: string;
  revision: string;
  revisionDate: string;
  designer: string;
  reviewer: string;
  approver: string;
  projectStatus: 'CONCEPT' | 'FEED' | 'DETAILED_DESIGN' | 'TENDER' | 'AS_BUILT';
  designStage: 'PRELIMINARY' | 'INTERMEDIATE' | 'FINAL';
}

export interface SiteInformation {
  siteAreaM2: number;
  availableLandM2: number;
  groundElevationMasl: number; // meters above sea level
  terrainType: 'FLAT' | 'SLOPED' | 'ROLLING' | 'MOUNTAINOUS';
  groundwaterTableDepthM: number;
  floodLevel100YrMasl: number;
  climateZone: 'TROPICAL' | 'TEMPERATE' | 'ARID' | 'COLD';
  minTempCelsius: number;
  avgTempCelsius: number;
  maxTempCelsius: number;
}

export interface DesignObjectives {
  dischargeTarget: 'RIVER_SURFACE' | 'IRRIGATION' | 'INDUSTRIAL_REUSE' | 'GROUNDWATER_RECHARGE' | 'MUNICIPAL_NON_POTABLE';
  regulatoryStandard: 'WHO' | 'EPA' | 'EU' | 'CPHEEO' | 'BANGLADESH_ECR' | 'LOCAL_AUTHORITY';
  landPriority: 'CRITICAL_MINIMUM' | 'BALANCED' | 'EXPANSION_FLEXIBLE';
  energyPriority: 'NET_ZERO' | 'LOW_ENERGY' | 'BALANCED';
  capexPriority: 'LOW_INITIAL_COST' | 'BALANCED' | 'HIGH_RELIABILITY';
  opexPriority: 'LOW_O_AND_M' | 'BALANCED';
  robustnessPriority: 'HIGH_SHOCK_RESILIENCE' | 'STANDARD';
  operatorSkillLevel: 'UNSKILLED' | 'SEMI_SKILLED' | 'CERTIFIED' | 'ADVANCED_AUTOMATED';
}

// ============================================================================
// 3. DESIGN BASIS & INFLUENT QUALITY (PHASE 02 EXTENDED)
// ============================================================================

export type PopulationProjectionMethod = 
  | 'GEOMETRIC' 
  | 'ARITHMETIC' 
  | 'DECREASING_RATE' 
  | 'LOGISTIC' 
  | 'RATIO_TREND' 
  | 'CUSTOM_CENSUS';

export interface CensusDataPoint {
  year: number;
  population: number;
}

export interface PopulationMethodResult {
  method: PopulationProjectionMethod;
  methodName: string;
  immediatePop: number; // e.g. Year 0
  intermediatePop: number; // e.g. Year 10
  ultimatePop: number; // e.g. Year 30
  rSquared?: number;
  formula: string;
  rationale: string;
}

export type InfiltrationMethod = 'PIPE_LENGTH' | 'CATCHMENT_AREA' | 'PER_CAPITA' | 'FIXED';

export interface InfiltrationConfig {
  method: InfiltrationMethod;
  pipeLengthKm: number;
  rateLpsKm: number;
  catchmentAreaHa: number;
  rateLhaDay: number;
  perCapitaLpd: number;
  rainInflowPct: number;
  seasonalFactor: number; // 1.0 = Dry, >1.0 = Wet season
  designInfiltrationLps: number;
  designInflowLps: number;
}

export type PeakingMethod = 'HARMON' | 'BABBIT' | 'GIFFT' | 'FAIR_GEYSER' | 'ATV_GERMAN' | 'CUSTOM';

export type DiurnalProfileType = 'RESIDENTIAL' | 'COMMERCIAL' | 'MIXED_URBAN' | 'INDUSTRIAL_FLAT';

export interface DiurnalCurve {
  type: DiurnalProfileType;
  hourlyMultipliers: number[]; // 24 values for hours 0..23
  peakHour: number;
  minHour: number;
  maxMultiplier: number;
  minMultiplier: number;
}

export interface IndustrialProfile {
  id: string;
  name: string;
  industryCategory: 'TEXTILE' | 'FOOD_BEVERAGE' | 'PHARMACEUTICAL' | 'TANNERY' | 'ELECTROPLATING' | 'CHEMICAL' | 'PAPER' | 'GENERAL';
  flowM3d: number;
  bod5MgL: number;
  codMgL: number;
  tssMgL: number;
  tknMgL: number;
  tpMgL: number;
  isPretreated: boolean;
  peakFactor: number;
  heavyMetalsPresent: boolean;
  toxicityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface QualityRatios {
  bodToCod: number;
  codToTkn: number;
  bodToTp: number;
  vssToTss: number;
  alkToTkn: number;
  biodegradability: 'HIGHLY_BIODEGRADABLE' | 'MODERATE' | 'REFRACTORY_TOXIC';
  denitrificationFeasibility: 'EXCELLENT' | 'SUFFICIENT' | 'CARBON_DEFICIENT';
  ebprFeasibility: 'HIGH' | 'MODERATE' | 'LOW';
  alkalinityFeasibility: 'SUFFICIENT' | 'DEFICIENT_NEED_LIME';
}

export interface CODComponents {
  codTotal: number;
  codSoluble: number;
  codInert: number;
  codParticulate: number;
  codBiodegradable: number;
}

export interface SamplingConfidence {
  sampleCount: number;
  dataQualityFlag: 'MEASURED_HIGH_CONFIDENCE' | 'MEASURED_MODERATE' | 'MUNICIPAL_DEFAULT' | 'ESTIMATED';
  confidenceIntervalPct: number;
  lastUpdated: string;
}

export interface DesignStageFlows {
  stageName: 'IMMEDIATE' | 'INTERMEDIATE' | 'ULTIMATE';
  horizonYear: number;
  population: number;
  adwfM3d: number;
  pdwfM3d: number;
  awwfM3d: number;
  pwwfM3d: number;
  minFlowM3d: number;
  bodMassKgD: number;
  codMassKgD: number;
  tssMassKgD: number;
  tknMassKgD: number;
  tpMassKgD: number;
}

export interface DesignBasis {
  presentYear: number;
  presentPopulation: number;
  selectedPopMethod: PopulationProjectionMethod;
  censusHistory: CensusDataPoint[];
  growthRatePct: number;
  designHorizonYears: number; // Ultimate horizon e.g. 30
  intermediateHorizonYears: number; // Intermediate stage e.g. 10 or 15
  designPopulation: number; // Ultimate population
  intermediatePopulation: number;
  immediatePopulation: number;
  servedPopulationPct: number;
  sewerageCoveragePct: number;
  
  // Water demand & return
  perCapitaWaterDemandLpd: number; // Liters per capita per day
  domesticDemandM3d: number;
  commercialDemandM3d: number;
  institutionalDemandM3d: number;
  industrialDemandM3d: number;
  nrwPct: number; // Non-Revenue Water %
  sewerageReturnFactor: number; // Default 0.80 - 0.85
  domesticReturnFactor: number;
  commercialReturnFactor: number;
  industrialReturnFactor: number;
  
  // Infiltration & Inflow Engine
  infiltrationConfig: InfiltrationConfig;
  infiltrationAllowanceLpsKm: number; // legacy backward compatibility
  inflowAllowancePct: number; // legacy backward compatibility
  
  // Peaking Factor Engine
  peakingMethod: PeakingMethod;
  customPeakFactor?: number;
  seasonalPeakFactor: number;
  hourlyPeakFactor: number;
  
  // Diurnal profile selection
  diurnalProfileType: DiurnalProfileType;
  
  // Industrial profiles array
  industrialProfiles: IndustrialProfile[];
  
  // Computed Flow Results (populated by engine)
  adwfM3d: number; // Average Dry Weather Flow
  awwfM3d: number; // Average Wet Weather Flow
  pdwfM3d: number; // Peak Dry Weather Flow
  pwwfM3d: number; // Peak Wet Weather Flow
  minFlowM3d: number; // Minimum Flow
  peakFlowLps: number;
  
  // Stage Flow Summary
  stages: DesignStageFlows[];
}

export interface InfluentQualityParameter {
  min: number;
  avg: number;
  max: number;
  designValue: number;
  unit: string;
  isAssumed: boolean;
  source: string;
  measuredDate?: string;
}

export interface InfluentQuality {
  flowM3d: InfluentQualityParameter;
  bod5: InfluentQualityParameter; // mg/L
  cod: InfluentQualityParameter; // Total COD mg/L
  codSoluble: InfluentQualityParameter; // Soluble COD mg/L
  codInert: InfluentQualityParameter; // Inert COD mg/L
  toc: InfluentQualityParameter; // mg/L
  tss: InfluentQualityParameter; // mg/L
  vss: InfluentQualityParameter; // mg/L
  tds: InfluentQualityParameter; // mg/L
  tn: InfluentQualityParameter; // Total Nitrogen mg/L
  tkn: InfluentQualityParameter; // mg/L
  nh3n: InfluentQualityParameter; // Ammonia N mg/L
  no3n: InfluentQualityParameter; // Nitrate N mg/L
  orgN: InfluentQualityParameter; // Organic N mg/L
  tp: InfluentQualityParameter; // mg/L
  po4p: InfluentQualityParameter; // Ortho Phosphate mg/L
  alkalinity: InfluentQualityParameter; // mg/L as CaCO3
  ph: InfluentQualityParameter;
  temperature: InfluentQualityParameter; // °C (Min winter)
  tempMax: InfluentQualityParameter; // °C (Max summer)
  do: InfluentQualityParameter; // mg/L
  oilAndGrease: InfluentQualityParameter; // mg/L
  fecalColiform: InfluentQualityParameter; // MPN/100mL
  
  // Computed Characterization & Quality Metadata
  codFractions: CODComponents;
  ratios: QualityRatios;
  samplingConfidence: SamplingConfidence;
}

// ============================================================================
// 4. PARAMETER REGISTRY DATA MODEL
// ============================================================================

export interface ParameterDefinition {
  id: string; // e.g. STP.FLOW.ADF
  category: ParameterCategory;
  subcategory: string;
  name: string;
  symbol: string;
  unit: string;
  datatype: 'NUMBER' | 'STRING' | 'BOOLEAN' | 'ENUM';
  min?: number;
  max?: number;
  defaultValue: number | string | boolean;
  designValue: number | string | boolean;
  measuredValue?: number | string | boolean;
  source: string;
  standardReference: string;
  isRequired: boolean;
  isAssumed: boolean;
  validationRules: string[]; // Rule IDs
  dependencies: string[]; // Parameter IDs this relies on
  formulaDependencies: string[]; // Formulas using this
  reportSections: string[];
  boqDependencies: string[];
  bimProperties: string[];
  scadaTags: string[];
}

// ============================================================================
// 5. CALCULATION RESULT MODEL
// ============================================================================

export interface SubCalculation {
  stepName: string;
  formula: string;
  value: number;
  unit: string;
}

export interface CalculationResult {
  id: string; // e.g. CALC-HYD-001
  name: string;
  subsystem: string;
  value: number;
  unit: string;
  formulaDisplay: string;
  inputParameters: Record<string, number | string>;
  subSteps: SubCalculation[];
  dependencyIds: string[]; // Calculation IDs or Parameter IDs
  standardReference: string;
  assumptions: string[];
  warnings: string[];
  reviewStatus: 'VERIFIED' | 'ASSUMED' | 'ENGINEER_REVIEW_REQUIRED';
  usedByModules: ('BOQ' | 'REPORT' | 'BIM' | 'SCADA' | 'CAD' | 'HGL')[];
}

// ============================================================================
// 6. VALIDATION & ASSUMPTION MODELS
// ============================================================================

export interface ValidationRule {
  id: string; // e.g. VAL-HYD-001
  parameterId: string;
  ruleName: string;
  conditionDescription: string;
  severity: ValidationSeverity;
  checkFunction: (project: ProjectState) => {
    isPassed: boolean;
    actualValue: number | string;
    targetCondition: string;
    message: string;
    remedy: string;
  };
  reference: string;
  affectedSubsystem: string;
}

export interface ValidationResult {
  ruleId: string;
  parameterId: string;
  subsystem: string;
  severity: ValidationSeverity;
  actualValue: number | string;
  targetCondition: string;
  message: string;
  remedy: string;
  reference: string;
}

export interface EngineeringAssumption {
  id: string; // e.g. ASM-001
  parameterId: string;
  parameterName: string;
  assumedValue: number | string;
  unit: string;
  reason: string;
  source: string;
  dateAdded: string;
  designer: string;
  status: 'PENDING_LAB_VERIFICATION' | 'ACCEPTED' | 'REJECTED';
}

// ============================================================================
// 7. STREAM & ASSET MODELS
// ============================================================================

export interface StreamConstituents {
  bod5MgL: number;
  codMgL: number;
  tssMgL: number;
  vssMgL: number;
  tknMgL: number;
  nh3nMgL: number;
  tpMgL: number;
  doMgL: number;
}

export interface StreamModel {
  id: string; // e.g. STRM-INLET-01
  name: string;
  type: StreamType;
  sourceUnitId: string;
  destinationUnitId: string;
  flowM3d: number;
  flowLps: number;
  temperatureCelsius: number;
  pressureBar: number;
  headm: number;
  constituents: StreamConstituents;
  notes?: string;
}

export interface ProcessAsset {
  id: string; // e.g. EQ-PUMP-001
  tag: string; // e.g. P-101A
  category: AssetCategory;
  name: string;
  processUnitId: string;
  manufacturer?: string;
  modelNumber?: string;
  dutyCapacity: number;
  capacityUnit: string;
  dutyCount: number;
  standbyCount: number;
  powerRatingKw: number;
  operatingVoltageV: number;
  locationArea: string;
  upstreamAssetId?: string;
  downstreamAssetId?: string;
  bimGuid: string;
  boqItemRef: string;
  costEstimateUSD: number;
  scadaTagPrefix: string;
  maintenanceIntervalHours: number;
}

// ============================================================================
// 8. PROCESS TRAIN & PROCESS ALTERNATIVES
// ============================================================================

export interface ProcessUnitNode {
  id: string; // e.g. PU-BIO-01
  name: string;
  subsystem: string;
  technology: string;
  mode: SystemMode;
  inletStreamIds: string[];
  outletStreamIds: string[];
  recycleStreamIds: string[];
  wasteStreamIds: string[];
  assetIds: string[];
  volumeM3?: number;
  footprintM2?: number;
  powerConsumptionKw?: number;
}

export interface ProcessAlternative {
  id: string; // e.g. ALT-CAS, ALT-MBBR, ALT-SBR
  name: string;
  category: 'PRELIMINARY' | 'PRIMARY' | 'BIOLOGICAL' | 'TERTIARY' | 'SLUDGE' | 'DISINFECTION';
  applicableFlowMinM3d: number;
  applicableFlowMaxM3d: number;
  footprintRating: 1 | 2 | 3 | 4 | 5; // 1 = Minimal, 5 = Extensive
  capexRating: 1 | 2 | 3 | 4 | 5;     // 1 = Low, 5 = High
  opexRating: 1 | 2 | 3 | 4 | 5;     // 1 = Low, 5 = High
  energyIntensityKwhPerM3: number;
  sludgeProductionKgPerKgBod: number;
  operatorSkillRequired: 'UNSKILLED' | 'SEMI_SKILLED' | 'CERTIFIED' | 'ADVANCED_AUTOMATED';
  bnrCapability: 'NONE' | 'NITRIFICATION_ONLY' | 'FULL_N_REMOVAL' | 'FULL_N_P_REMOVAL';
  shockLoadResilience: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  incompatibleTechnologies: string[]; // List of alternative IDs
  advantages: string[];
  limitations: string[];
  recommendationScore?: number; // 0 - 100
  recommendationRationale?: string;
}

// ============================================================================
// 9. SCENARIOS & PROJECT STATE
// ============================================================================

export interface ScenarioState {
  id: string; // e.g. SCEN-A
  name: string;
  description: string;
  isBaseline: boolean;
  subsystemModes: Record<string, SystemMode>;
  subsystemOverrides: Record<string, string>; // Subsystem -> Selected Technology ID
  designBasis: DesignBasis;
  influentQuality: InfluentQuality;
  sewerNetwork?: import('./sewer').SewerNetworkState;
  preliminaryPrimary?: import('./preliminaryPrimary').PreliminaryPrimaryState;
  biological?: import('./biological').BiologicalTreatmentState;
  processNodes: ProcessUnitNode[];
  totalFootprintM2: number;
  totalCapexUSD: number;
  totalOpexUSDPerYear: number;
  netEnergyKw: number;
  complianceScorePct: number;
}

export interface ProjectState {
  identity: ProjectIdentity;
  siteInfo: SiteInformation;
  objectives: DesignObjectives;
  activeScenarioId: string;
  scenarios: Record<string, ScenarioState>;
  parameterRegistry: Record<string, ParameterDefinition>;
  assumptions: Record<string, EngineeringAssumption>;
  assets: Record<string, ProcessAsset>;
  streams: Record<string, StreamModel>;
  calculations: Record<string, CalculationResult>;
  validationResults: ValidationResult[];
}

// ============================================================================
// 10. PARAMETER AUDIT REPORT MODEL
// ============================================================================

export interface ParameterAuditReport {
  timestamp: string;
  totalParameters: number;
  usedParameters: number;
  unusedParameters: number;
  missingParameters: number;
  duplicateParameters: number;
  missingUnits: number;
  missingFormulas: number;
  missingReferences: number;
  orphanedParameters: string[];
  auditStatus: 'HEALTHY' | 'WARNINGS_FOUND' | 'CRITICAL_ERRORS';
  details: string[];
}
