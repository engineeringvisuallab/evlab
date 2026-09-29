/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 03 Sewer Network, Lift Stations, Force Mains & HGL Data Types
 * @license Apache-2.0
 */

import { ValidationSeverity } from './stp';

// ============================================================================
// 1. SEWER NETWORK ENUMS & TYPES
// ============================================================================

export type SewerNodeType = 
  | 'MANHOLE' 
  | 'INSPECTION_CHAMBER' 
  | 'LIFT_STATION' 
  | 'OUTFALL' 
  | 'STP_INLET' 
  | 'JUNCTION' 
  | 'TERMINAL';

export type SewerLinkType = 
  | 'GRAVITY_SEWER' 
  | 'FORCE_MAIN' 
  | 'INTERCEPTOR' 
  | 'BRANCH_SEWER' 
  | 'TRUNK_SEWER';

export type PipeMaterial = 
  | 'uPVC' 
  | 'HDPE_PE100' 
  | 'RCC_CLASS_NP3' 
  | 'DUCTILE_IRON' 
  | 'VITRIFIED_CLAY' 
  | 'GRP';

export type FlowRegime = 'SUBCRITICAL' | 'CRITICAL' | 'SUPERCRITICAL';

export type PipeHydraulicStatus = 'OK' | 'UNDER_UTILIZED' | 'NEAR_CAPACITY' | 'OVER_CAPACITY' | 'SURCHARGED';

export type FrictionFormula = 'HAZEN_WILLIAMS' | 'DARCY_WEISBACH';

export type StandardProfileType = 'CPHEEO_INDIA' | 'BANGLADESH_ECR_DPHE' | 'US_EPA_WEF' | 'EN_752_EUROPE' | 'CUSTOM';

// ============================================================================
// 2. STANDARD ENGINEERING CRITERIA PROFILE
// ============================================================================

export interface SewerDesignCriteria {
  profileType: StandardProfileType;
  profileName: string;
  minSelfCleansingVelocityMps: number; // e.g. 0.6 m/s at peak flow, 0.45 m/s at min flow
  minInitialVelocityMps: number;       // e.g. 0.6 m/s
  maxVelocityMps: number;              // e.g. 3.0 m/s (scour protection)
  minDiameterMm: number;               // e.g. 200 mm for public gravity sewer
  minCoverDepthM: number;              // e.g. 1.0 m below road surface
  maxCoverDepthM: number;              // e.g. 6.0 m practical trench depth
  minSlopePermille: number;            // e.g. 1 / (d_mm) or 2.0 permille
  maxSlopePermille: number;            // e.g. 50 permille
  maxDepthRatioD: number;              // d/D ratio e.g. 0.75 or 0.80 at peak flow
  manningN: Record<PipeMaterial, number>;
  hazenWilliamsC: Record<PipeMaterial, number>;
  darcyRoughnessMm: Record<PipeMaterial, number>;
}

// ============================================================================
// 3. SEWER NETWORK NODES (MANHOLES, LIFT STATIONS, OUTFALLS)
// ============================================================================

export interface SewerNode {
  id: string; // e.g. MH-001, PS-001, INLET-001
  name: string;
  type: SewerNodeType;
  coordinates: {
    easting: number;
    northing: number;
  };
  groundLevelMasl: number;  // Ground / Road level (m)
  rimLevelMasl: number;     // Top of cover slab (m)
  invertLevelMasl: number;  // Lowest outgoing invert (m)
  depthM: number;           // Ground - Invert
  diameterMm: number;       // Manhole internal diameter e.g. 1000, 1200, 1500 mm
  catchmentId?: string;     // Contributing Phase 02 catchment ID
  localInflowLps: number;   // Directly connected dry/wet inflow
  isDropManhole: boolean;
  dropHeightM: number;
  junctionLossCoeff: number; // Minor loss k (e.g. 0.15 for straight, 0.4 for 90 deg)
  waterLevelHglMasl: number; // Calculated hydraulic grade line at node
  isSurcharged: boolean;
  overflowRisk: 'NONE' | 'POTENTIAL_SURCHARGE' | 'OVERFLOW_RISK';
  notes?: string;
}

// ============================================================================
// 4. SEWER NETWORK LINKS (GRAVITY PIPES & FORCE MAINS)
// ============================================================================

export interface PartialFlowHydraulics {
  depthM: number;            // Actual flow depth y (m)
  depthRatio: number;        // y / D
  flowAreaM2: number;        // Partial flow area A (m2)
  wettedPerimeterM: number;  // Partial wetted perimeter P (m)
  hydraulicRadiusM: number;  // R = A / P (m)
  velocityMps: number;       // Actual operating velocity (m/s)
  froudeNumber: number;      // Fr = V / sqrt(g * D_hydraulic)
  flowRegime: FlowRegime;
  capacityFullM3d: number;   // Full bore capacity Q_full (m3/d)
  capacityFullLps: number;   // Full bore capacity (L/s)
  capacityRatio: number;     // Q_design / Q_full
  isSelfCleansing: boolean;
  isScouring: boolean;
  headlossFrictionM: number;
  headlossMinorM: number;
  headlossTotalM: number;
  upstreamHglMasl: number;
  downstreamHglMasl: number;
  upstreamEglMasl: number;
  downstreamEglMasl: number;
  status: PipeHydraulicStatus;
}

export interface SewerPipe {
  id: string; // e.g. PIPE-001
  name: string;
  type: SewerLinkType;
  upstreamNodeId: string;
  downstreamNodeId: string;
  material: PipeMaterial;
  nominalDiameterMm: number;
  innerDiameterM: number;
  lengthM: number;
  upstreamInvertMasl: number;
  downstreamInvertMasl: number;
  slopePermille: number; // Slope in permille (m / 1000m) e.g. 3.5 permille = 0.0035 m/m
  slopeRatio: number;    // e.g. 0.0035 m/m
  roughnessManningN: number;
  
  // Accumulated flows from network upstream traversal
  localFlowLps: number;
  accumulatedFlowLps: number;
  designFlowLps: number;
  designFlowM3d: number;
  
  // Cover depth & excavation
  upstreamCoverM: number;
  downstreamCoverM: number;
  avgCoverM: number;
  isCoverAdequate: boolean;
  isExcessiveDepth: boolean;

  // Hydraulics (Calculated by Gravity Hydraulic Engine)
  hydraulics: PartialFlowHydraulics;
  
  status: PipeHydraulicStatus;
  warnings: string[];
}

// ============================================================================
// 5. PUMPING / LIFT STATION & FORCE MAIN MODELS
// ============================================================================

export interface PumpSpecification {
  id: string;
  pumpModel: string;
  dutyCount: number;      // e.g. 2 duty
  standbyCount: number;   // e.g. 1 standby
  flowRateLps: number;    // Capacity per pump (L/s)
  headM: number;          // Total Dynamic Head (m)
  efficiencyPct: number;  // Pump hydraulic efficiency e.g. 75%
  motorRatingKw: number;  // Installed motor power (kW)
  operatingSpeedRpm: number;
  ratedVoltageV: number;
  vfdEquipped: boolean;
  npshRequiredM: number;  // Vendor NPSHr
  npshAvailableM: number; // Calculated NPSHa
}

export interface WetWellDesign {
  stationType: 'SUBMERSIBLE' | 'DRY_WELL_CENTRIFUGAL' | 'SUCTION_LIFT';
  wellShape: 'CIRCULAR' | 'RECTANGULAR';
  diameterOrWidthM: number;
  lengthM?: number;
  crossSectionAreaM2: number;
  floorLevelMasl: number;
  lowWaterLevelMasl: number;   // Pump Stop Level (m)
  highWaterLevelMasl: number;  // Duty Pump Start Level (m)
  alarmWaterLevelMasl: number; // High-High Overflow Alarm (m)
  activeVolumeM3: number;      // Volume between Stop and Start
  deadVolumeM3: number;        // Volume below lowest stop level
  emergencyStorageM3: number;  // Storage between HWL and overflow rim
  emergencyRetentionHours: number; // Hours of storage at design peak inflow
  minCycleTimeSec: number;     // T_min = 4 * V / Q_pump (e.g. 360-600s)
  startsPerHour: number;       // Starts/hr = 3600 / T_min (should be <= 10-15)
  isCycleTimeAdequate: boolean;
}

export interface ForceMainHydraulics {
  id: string; // e.g. FM-001
  name: string;
  pumpingStationId: string;
  dischargeNodeId: string;
  material: PipeMaterial;
  internalDiameterMm: number;
  lengthM: number;
  designFlowLps: number;
  velocityMps: number;
  frictionFormula: FrictionFormula;
  frictionFactor: number;       // f for Darcy or C for Hazen-Williams
  frictionHeadlossM: number;
  minorLossCoeffK: number;      // Sum of valve, bend, check-valve losses
  minorHeadlossM: number;
  staticLiftM: number;          // Discharge Invert - Wet Well Low Level
  totalDynamicHeadM: number;    // TDH = Static + Friction + Minor
  hydraulicPowerKw: number;     // P_hyd = rho * g * Q * TDH / 1000
  electricalPowerKw: number;    // P_elec = P_hyd / (pump_eff * motor_eff)
  dailyEnergyKwh: number;
  surgeAnalysisRequired: boolean;
  surgeNotes: string;
  status: 'OK' | 'LOW_VELOCITY' | 'HIGH_VELOCITY' | 'HIGH_HEAD';
}

export interface PumpingStation {
  id: string; // e.g. PS-001
  name: string;
  nodeId: string; // Corresponds to SewerNode ID
  catchmentIds: string[];
  inflowPeakLps: number;
  inflowAverageLps: number;
  inflowMinLps: number;
  pumpDesignFlowLps: number;
  pumps: PumpSpecification;
  wetWell: WetWellDesign;
  forceMain: ForceMainHydraulics;
  status: 'OPERATIONAL' | 'WARNING' | 'CRITICAL';
  warnings: string[];
}

// ============================================================================
// 6. LONGITUDINAL PROFILE (HGL & EGL ALONG SEWER TRUNK)
// ============================================================================

export interface ProfileStationPoint {
  chainageM: number;
  nodeId: string;
  pipeId?: string;
  groundElevationMasl: number;
  rimElevationMasl: number;
  invertElevationMasl: number;
  crownElevationMasl: number;
  waterDepthM: number;
  hglMasl: number;
  eglMasl: number;
  velocityMps: number;
  isSurcharged: boolean;
  hasPump: boolean;
}

export interface LongitudinalProfile {
  profileId: string;
  name: string;
  pathNodeIds: string[];
  totalLengthM: number;
  stations: ProfileStationPoint[];
}

// ============================================================================
// 7. SEWER NETWORK STATE CONTAINER (PER SCENARIO)
// ============================================================================

export interface SewerNetworkState {
  criteria: SewerDesignCriteria;
  nodes: Record<string, SewerNode>;
  pipes: Record<string, SewerPipe>;
  pumpingStations: Record<string, PumpingStation>;
  longitudinalProfiles: Record<string, LongitudinalProfile>;
  selectedProfileId: string;
  networkSummary: {
    totalPipesCount: number;
    totalManholesCount: number;
    totalPumpStationsCount: number;
    totalNetworkLengthKm: number;
    totalGravityFlowLps: number;
    maxDepthM: number;
    minVelocityMps: number;
    maxVelocityMps: number;
    surchargedPipesCount: number;
    overflowRiskNodesCount: number;
  };
}
