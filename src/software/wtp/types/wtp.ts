/**
 * EVL WTP Engineering Suite - Core TypeScript Interfaces
 * Architecture strictly aligned with Master Engineering Specification
 */

export type UnitCategory = 
  | 'flow' | 'concentration' | 'dose' | 'length' | 'area' | 'volume' 
  | 'velocity' | 'head' | 'pressure' | 'power' | 'energy' | 'mass' 
  | 'density' | 'time' | 'temperature' | 'rate' | 'gradient' | 'currency';

export type ParameterType = 'input' | 'output' | 'derived';

export interface ParameterDefinition {
  id: string;
  name: string;
  symbol: string;
  category: string;
  subcategory: string;
  description: string;
  unit: string;
  type: ParameterType;
  formula?: string;
  formulaVariables?: string[];
  defaultValue: number | string;
  min?: number;
  max?: number;
  recommendedMin?: number;
  recommendedMax?: number;
  designCriteria?: string;
  standard?: string;
  standardClause?: string;
  source?: string;
  dependencies?: string[];
  calculationSequence?: number;
  validationRule?: string;
  warningRule?: string;
  errorRule?: string;
  required: boolean;
  applicableProcess?: string;
  applicablePlantType?: string;
  revision?: string;
  engineeringNotes?: string;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  client: string;
  consultant: string;
  contractor: string;
  location: string;
  country: string;
  coordinates: { lat: number; lng: number };
  baseYear: number;
  designYear: number;
  designPeriodYears: number;
  existingOrProposed: 'Proposed' | 'Expansion' | 'Existing Retrofit';
  plantCapacityMLD: number;
  designPopulation: number;
  designStandard: 'WHO' | 'Bangladesh ECR 2023' | 'US EPA' | 'EU Directive' | 'CPHEEO' | 'Custom';
  unitSystem: 'SI' | 'Imperial';
  currency: 'USD' | 'BDT' | 'EUR' | 'GBP' | 'INR';
  datum: string;
  groundLevelm: number;
  drawingScale: string;
  revision: string;
  preparedBy: string;
  checkedBy: string;
  approvedBy: string;
  date: string;
  notes: string;
}

export interface PopulationProjections {
  basePopulation: number;
  growthRatePercent: number;
  designYears: number;
  arithmetic: number;
  geometric: number;
  incremental: number;
  logistic: number;
  selectedPopulation: number;
}

export interface WaterDemandBreakdown {
  perCapitaLpcd: number;
  domesticLpcd: number;
  commercialLpcd: number;
  institutionalLpcd: number;
  industrialLpcd: number;
  publicLpcd: number;
  unaccountedForWaterPercent: number;
  fireDemandMethod: 'NBFU' | 'Kuichling' | 'Freeman' | 'Custom';
  fireDemandM3day: number;
  peakFactorDay: number;
  peakFactorHour: number;
  averageDemandMLD: number;
  maxDayDemandMLD: number;
  peakHourDemandM3hr: number;
  wtpDesignCapacityMLD: number;
}

export interface RawWaterQualityItem {
  id: string;
  name: string;
  symbol: string;
  category: 'Physical' | 'Chemical' | 'Metals' | 'Microbiology' | 'Organic / Special';
  unit: string;
  rawValue: number;
  whoTarget: number;
  bdTarget: number;
  epaTarget: number;
  euTarget: number;
  customTarget?: number;
  requiredRemovalPercent: number;
  achievedRemovalPercent: number;
  finalValue: number;
  complianceStatus: 'PASS' | 'WARNING' | 'FAIL';
  requiredProcesses: string[];
}

export interface JarTestResult {
  doseMgL: number;
  ph: number;
  initialTurbidityNTU: number;
  finalTurbidityNTU: number;
  flocSettlingSpeedMmS: number;
  flocSizeDescription: string;
  isOptimal: boolean;
}

export interface ProcessUnitConfig {
  unitId: string;
  name: string;
  type: string;
  enabled: boolean;
  sequence: number;
  numBasins: number;
  numDuty: number;
  numStandby: number;
  parameters: Record<string, number | string>;
}

export interface PipeHydraulicSpec {
  id: string;
  label: string;
  flowM3hr: number;
  diameterMm: number;
  lengthM: number;
  material: 'DI' | 'MS' | 'HDPE' | 'uPVC' | 'Concrete';
  roughnessC: number; // Hazen-Williams C
  absoluteRoughnessMm: number; // Darcy e
  minorLossCoeffK: number;
  velocityMs: number;
  reynoldsNumber: number;
  frictionFactorF: number;
  headLossM: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
}

export interface EquipmentItem {
  id: string;
  tag: string;
  description: string;
  processUnit: string;
  duty: number;
  standby: number;
  capacityPerUnit: string;
  headOrPressure: string;
  powerKw: number;
  efficiencyPercent: number;
  material: string;
  quantity: number;
  manufacturer?: string;
  model?: string;
  notes?: string;
}

export interface ElectricalLoadItem {
  id: string;
  equipmentTag: string;
  description: string;
  quantityDuty: number;
  quantityStandby: number;
  ratingKw: number;
  totalConnectedKw: number;
  demandFactor: number;
  operatingHoursPerDay: number;
  demandKw: number;
  voltageV: number;
  powerFactor: number;
  kva: number;
}

export interface InstrumentItem {
  id: string;
  tag: string;
  parameterMeasured: string;
  location: string;
  type: 'Flow' | 'Pressure' | 'Level' | 'pH' | 'Turbidity' | 'Chlorine' | 'Conductivity' | 'Temperature';
  range: string;
  accuracy: string;
  outputSignal: '4-20mA HART' | 'Modbus RTU' | 'Profibus' | 'Ethernet/IP';
  plcIoType: 'AI' | 'DI' | 'AO' | 'DO';
  interlockFunction: string;
  alarmSettingHigh: string;
  alarmSettingLow: string;
}

export interface ScadaControlLoop {
  id: string;
  loopName: string;
  controlledParameter: string;
  setpoint: number;
  currentValue: number;
  unit: string;
  controlType: 'Flow-Paced Dosing' | 'Feedback Control' | 'PID' | 'Duty/Standby Auto-Switch';
  actuatorTag: string;
  status: 'AUTO' | 'MANUAL' | 'ALARM';
}

export interface StructuralSupportItem {
  structureName: string;
  concreteVolumeM3: number;
  steelRequirementTons: number;
  deadLoadKnM2: number;
  liveLoadKnM2: number;
  waterPressureHeadM: number;
  buoyancySafetyFactor: number;
  soilBearingCapacityKpa: number;
  crackWidthLimitMm: number;
  flotationStatus: 'PASS' | 'WARNING' | 'FAIL';
}

export interface BoqItem {
  id: string;
  category: 'Civil' | 'Mechanical' | 'Electrical' | 'Instrumentation' | 'Chemical System';
  itemCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitRate: number;
  totalCost: number;
  remarks: string;
}

export interface BoqLineItem {
  id: string;
  category: string;
  itemCode: string;
  description: string;
  unit: string;
  quantity: number;
  unitRateUSD: number;
  totalPriceUSD: number;
}

export interface ValidationResult {
  id: string;
  category: string;
  parameterName: string;
  designValue: number | string;
  unit: string;
  criteriaRange: string;
  standardRef: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  message: string;
  correctiveAction?: string;
}

export interface StandardDefinition {
  id: string;
  standardName: string;
  organization: string;
  edition: string;
  year: number;
  category: string;
  parameter: string;
  limitValue: number | string;
  unit: string;
  clause: string;
  notes: string;
}

export interface RevisionRecord {
  revId: string;
  date: string;
  author: string;
  description: string;
  changesCount: number;
  status: 'Draft' | 'Approved' | 'Archived';
  projectDataSnapshotJson?: string;
}

export interface CompletenessAuditItem {
  id: string;
  category: string;
  item: string;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  whyRequired: string;
  proposedParameter: string;
  proposedCalculation: string;
  status: 'COMPLETE' | 'IN_PROGRESS' | 'PENDING';
}
