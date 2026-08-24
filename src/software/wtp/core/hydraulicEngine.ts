/**
 * EVL WTP Engineering Suite - Comprehensive Hydraulic Engine
 * Governs pipe flow, friction head loss, minor loss, open channels, weirs, orifices, pipe sizing, and HGL/EGL profile.
 */

import { PipeMaterialSpec, MASTER_PIPE_MATERIAL_REGISTRY, getPipeMaterialByCode } from './pipeMaterialRegistry';

// --------------------------------------------------------
// DATA MODELS
// --------------------------------------------------------
export interface FittingItem {
  id: string;
  name: string;
  type: 'Elbow 90°' | 'Elbow 45°' | 'Tee Line' | 'Tee Branch' | 'Reducer' | 'Expander' | 'Entrance' | 'Exit' | 'Gate Valve' | 'Butterfly Valve' | 'Check Valve' | 'Globe Valve' | 'Strainer' | 'Flow Meter';
  quantity: number;
  kFactorPerUnit: number;
  standardRef: string;
}

export interface PipeSegmentSpec {
  id: string;
  tag: string;
  description: string;
  fromNodeId: string;
  toNodeId: string;
  flowM3hr: number;
  flowLs: number;
  nominalDiameterMm: number;
  internalDiameterMm: number;
  lengthM: number;
  materialCode: string;
  hazenWilliamsC: number;
  darcyEpsilonMm: number;
  fittings: FittingItem[];
  
  // Calculated Hydraulic Results
  velocityMs: number;
  reynoldsNumber: number;
  frictionFactorF: number; // Darcy f
  frictionHeadLossM: number;
  totalKFactor: number;
  minorHeadLossM: number;
  totalHeadLossM: number;
  hydraulicGradientMPerKm: number;
  upstreamHGLM: number;
  downstreamHGLM: number;
  upstreamEGLM: number;
  downstreamEGLM: number;
  pressureBar: number;
  velocityHeadM: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
  validationMessage: string;
}

export interface HydraulicProfileNode {
  nodeId: string;
  name: string;
  unitType: string;
  chainageM: number;
  groundElevationM: number;
  pipeInvertElevationM: number;
  waterSurfaceElevationM: number; // HGL
  energyLineElevationM: number; // EGL
  unitHeadLossM: number;
  cumulativeHeadLossM: number;
  freeboardM: number;
  status: 'OPTIMAL' | 'BOTTLENECK' | 'OVERFLOW_RISK' | 'LOW_HEAD';
}

// --------------------------------------------------------
// MASTER FITTINGS K-FACTOR REGISTRY
// --------------------------------------------------------
export const FITTINGS_K_REGISTRY: Record<string, { name: string; defaultK: number; ref: string }> = {
  'ELB-90': { name: '90° Standard Elbow', defaultK: 0.75, ref: 'Crane TP 410' },
  'ELB-45': { name: '45° Standard Elbow', defaultK: 0.35, ref: 'Crane TP 410' },
  'TEE-LIN': { name: 'Tee (Straight Through Line)', defaultK: 0.40, ref: 'Crane TP 410' },
  'TEE-BRN': { name: 'Tee (90° Branch Flow)', defaultK: 1.50, ref: 'Crane TP 410' },
  'RED-CON': { name: 'Concentric Reducer (2:1)', defaultK: 0.25, ref: 'Crane TP 410' },
  'EXP-CON': { name: 'Concentric Expander (1:2)', defaultK: 0.50, ref: 'Crane TP 410' },
  'ENT-SHP': { name: 'Sharp Edged Inlet Entrance', defaultK: 0.50, ref: 'Hydraulic Institute' },
  'ENT-BEL': { name: 'Bellmouth Rounded Inlet Entrance', defaultK: 0.05, ref: 'Hydraulic Institute' },
  'EXT-PIP': { name: 'Pipe Submerged Discharge Exit', defaultK: 1.00, ref: 'Crane TP 410' },
  'VLV-GAT': { name: 'Gate Valve (Fully Open)', defaultK: 0.15, ref: 'AWWA M11' },
  'VLV-BFY': { name: 'Butterfly Valve (Fully Open)', defaultK: 0.35, ref: 'AWWA M11' },
  'VLV-CHK': { name: 'Non-Return Swing Check Valve', defaultK: 2.00, ref: 'AWWA M11' },
  'VLV-GLB': { name: 'Globe Valve (Fully Open)', defaultK: 10.00, ref: 'Crane TP 410' },
  'STR-BKT': { name: 'Basket / Y-Strainer', defaultK: 3.50, ref: 'Crane TP 410' },
  'MTR-MGM': { name: 'Electromagnetic Flow Meter', defaultK: 0.50, ref: 'Manufacturer Data' }
};

// --------------------------------------------------------
// CORE HYDRAULIC EQUATIONS
// --------------------------------------------------------

/**
 * Hazen-Williams Friction Head Loss: h_f = 10.67 * L * Q^1.852 / (C^1.852 * D^4.87)
 */
export function calculateHazenWilliamsHeadLoss(
  flowM3s: number,
  diameterM: number,
  lengthM: number,
  cValue: number
): number {
  if (flowM3s <= 0 || diameterM <= 0 || lengthM <= 0 || cValue <= 0) return 0;
  const hf = (10.67 * lengthM * Math.pow(flowM3s, 1.852)) / (Math.pow(cValue, 1.852) * Math.pow(diameterM, 4.87));
  return Number(hf.toFixed(3));
}

/**
 * Reynolds Number: Re = (V * D) / nu
 * Kinematic viscosity of water at 20°C = 1.002 x 10^-6 m²/s
 */
export function calculateReynoldsNumber(velocityMs: number, diameterM: number, waterTempC: number = 20): number {
  const kinematicViscosityM2s = (1.787 / (1 + 0.0337 * waterTempC + 0.000221 * waterTempC * waterTempC)) * 1e-6;
  const re = (velocityMs * diameterM) / kinematicViscosityM2s;
  return Math.round(re);
}

/**
 * Swamee-Jain Explicit Friction Factor f for Darcy-Weisbach Equation
 * 1 / sqrt(f) = -2 log10( (epsilon/D)/3.7 + 5.74 / Re^0.9 )
 */
export function calculateSwameeJainFrictionFactor(
  epsilonMm: number,
  diameterMm: number,
  reynoldsNumber: number
): number {
  if (reynoldsNumber < 2300) {
    // Laminar flow: f = 64 / Re
    return 64 / Math.max(1, reynoldsNumber);
  }
  const relRoughness = (epsilonMm / 1000) / (diameterMm / 1000);
  const term = (relRoughness / 3.7) + (5.74 / Math.pow(reynoldsNumber, 0.9));
  const f = 0.25 / Math.pow(Math.log10(term), 2);
  return Number(f.toFixed(4));
}

/**
 * Darcy-Weisbach Friction Head Loss: h_f = f * (L / D) * (V^2 / 2g)
 */
export function calculateDarcyWeisbachHeadLoss(
  frictionFactorF: number,
  lengthM: number,
  diameterM: number,
  velocityMs: number
): number {
  if (diameterM <= 0 || velocityMs <= 0) return 0;
  const hf = frictionFactorF * (lengthM / diameterM) * (Math.pow(velocityMs, 2) / (2 * 9.81));
  return Number(hf.toFixed(3));
}

/**
 * Minor Head Loss: h_m = K_total * (V^2 / 2g)
 */
export function calculateMinorHeadLoss(totalKFactor: number, velocityMs: number): number {
  const hm = totalKFactor * (Math.pow(velocityMs, 2) / (2 * 9.81));
  return Number(hm.toFixed(3));
}

/**
 * Manning Equation for Open Channels: Q = (1/n) * A * R_h^(2/3) * S^(1/2)
 */
export function calculateManningOpenChannel(
  widthM: number,
  waterDepthM: number,
  slopeMPerM: number,
  manningN: number = 0.013
): { flowM3s: number; flowM3hr: number; velocityMs: number; hydraulicRadiusM: number; capacityStatus: string } {
  const area = widthM * waterDepthM;
  const wettedPerimeter = widthM + 2 * waterDepthM;
  const rH = area / wettedPerimeter;
  const velocityMs = (1 / manningN) * Math.pow(rH, 2 / 3) * Math.pow(slopeMPerM, 0.5);
  const flowM3s = area * velocityMs;
  const flowM3hr = flowM3s * 3600;

  return {
    flowM3s: Number(flowM3s.toFixed(3)),
    flowM3hr: Number(flowM3hr.toFixed(1)),
    velocityMs: Number(velocityMs.toFixed(2)),
    hydraulicRadiusM: Number(rH.toFixed(3)),
    capacityStatus: velocityMs >= 0.6 && velocityMs <= 2.0 ? 'PASS' : 'WARNING'
  };
}

/**
 * Francis Rectangular Weir Flow Equation: Q = 1.84 * (L - 0.2*H) * H^1.5
 */
export function calculateRectangularWeirHead(flowM3s: number, weirLengthM: number): number {
  if (weirLengthM <= 0 || flowM3s <= 0) return 0;
  // H = (Q / (1.84 * L))^(2/3)
  const h = Math.pow(flowM3s / (1.84 * weirLengthM), 2 / 3);
  return Number(h.toFixed(3));
}

/**
 * Orifice Flow Equation: Q = C_d * A * sqrt(2gH)
 */
export function calculateOrificeFlow(headM: number, diameterMm: number, cd: number = 0.62): number {
  const area = (Math.PI * Math.pow(diameterMm / 1000, 2)) / 4;
  const qM3s = cd * area * Math.sqrt(2 * 9.81 * headM);
  return Number((qM3s * 3600).toFixed(2)); // m3/hr
}

// --------------------------------------------------------
// PIPE SIZING AUTOMATIC ENGINE
// --------------------------------------------------------
export interface PipeSizingOption {
  diameterMm: number;
  velocityMs: number;
  headLossMPerKm: number;
  pressureRatingBar: number;
  status: 'RECOMMENDED' | 'ACCEPTABLE' | 'TOO_SMALL_HIGH_VELOCITY' | 'TOO_LARGE_SLUGGISH';
}

export function recommendPipeDiameters(
  flowM3hr: number,
  materialCode: string = 'DI',
  pipeLengthM: number = 1000
): PipeSizingOption[] {
  const qM3s = flowM3hr / 3600;
  const material = getPipeMaterialByCode(materialCode);
  
  const standardDiametersMm = [150, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600];
  
  const options: PipeSizingOption[] = [];

  standardDiametersMm.forEach(diaMm => {
    const diaM = diaMm / 1000;
    const area = (Math.PI * diaM * diaM) / 4;
    const vel = qM3s / area;
    const hlM = calculateHazenWilliamsHeadLoss(qM3s, diaM, pipeLengthM, material.hazenWilliamsCDesign);
    const hlPerKm = Number(((hlM / pipeLengthM) * 1000).toFixed(2));

    let status: PipeSizingOption['status'] = 'ACCEPTABLE';
    if (vel > material.recommendedMaxVelocityMs) {
      status = 'TOO_SMALL_HIGH_VELOCITY';
    } else if (vel < material.recommendedMinVelocityMs) {
      status = 'TOO_LARGE_SLUGGISH';
    } else if (vel >= 0.9 && vel <= 1.5) {
      status = 'RECOMMENDED';
    }

    options.push({
      diameterMm: diaMm,
      velocityMs: Number(vel.toFixed(2)),
      headLossMPerKm: hlPerKm,
      pressureRatingBar: 16,
      status
    });
  });

  return options;
}

// --------------------------------------------------------
// PROCESS WTP HYDRAULIC PROFILE GENERATOR
// --------------------------------------------------------
export function generateWtpHydraulicProfile(
  capacityMld: number,
  datumGroundElevationM: number = 25.0,
  intakeLossM: number = 0.5,
  screenLossM: number = 0.25,
  aeratorDropM: number = 1.5,
  rapidMixLossM: number = 0.3,
  flocculatorLossM: number = 0.4,
  clarifierLossM: number = 0.6,
  filterLossM: number = 1.8,
  disinfectionLossM: number = 0.2,
  cwrLossM: number = 0.1
): HydraulicProfileNode[] {
  let cumulativeHl = 0;
  let currentHGL = datumGroundElevationM + 12.0; // Start at elevated intake level

  const nodes: { id: string; name: string; unit: string; chainage: number; unitHl: number; freeboard: number }[] = [
    { id: 'N-INT', name: 'Raw Water Intake Tower', unit: 'Intake', chainage: 0, unitHl: intakeLossM, freeboard: 1.0 },
    { id: 'N-SCR', name: 'Mechanical Fine Screen Channel', unit: 'Screening', chainage: 40, unitHl: screenLossM, freeboard: 0.5 },
    { id: 'N-AER', name: 'Cascade Aerator Platform', unit: 'Aeration', chainage: 85, unitHl: aeratorDropM, freeboard: 0.8 },
    { id: 'N-MIX', name: 'Flash Rapid Mixer Basin', unit: 'Coagulation', chainage: 120, unitHl: rapidMixLossM, freeboard: 0.6 },
    { id: 'N-FLO', name: 'Tapered Paddle Flocculator', unit: 'Flocculation', chainage: 165, unitHl: flocculatorLossM, freeboard: 0.5 },
    { id: 'N-SED', name: 'Tube Settler Clarifier Launder', unit: 'Sedimentation', chainage: 220, unitHl: clarifierLossM, freeboard: 0.6 },
    { id: 'N-FIL', name: 'Rapid Gravity Sand Filter Bed', unit: 'Filtration', chainage: 280, unitHl: filterLossM, freeboard: 1.2 },
    { id: 'N-DIS', name: 'Chlorine Contact Chamber', unit: 'Disinfection', chainage: 340, unitHl: disinfectionLossM, freeboard: 0.5 },
    { id: 'N-CWR', name: 'Clear Water Underground Reservoir', unit: 'CWR', chainage: 410, unitHl: cwrLossM, freeboard: 0.5 }
  ];

  const profile: HydraulicProfileNode[] = [];

  nodes.forEach(n => {
    currentHGL -= n.unitHl;
    cumulativeHl += n.unitHl;

    const velHead = 0.08; // nominal V^2 / 2g = (1.25^2)/(2*9.81) = 0.08m
    const egl = currentHGL + velHead;
    const invert = currentHGL - 3.5; // average tank depth 3.5m

    let status: HydraulicProfileNode['status'] = 'OPTIMAL';
    if (n.unitHl > 2.0) status = 'BOTTLENECK';
    if (currentHGL - datumGroundElevationM < 1.0) status = 'LOW_HEAD';

    profile.push({
      nodeId: n.id,
      name: n.name,
      unitType: n.unit,
      chainageM: n.chainage,
      groundElevationM: datumGroundElevationM,
      pipeInvertElevationM: Number(invert.toFixed(2)),
      waterSurfaceElevationM: Number(currentHGL.toFixed(2)),
      energyLineElevationM: Number(egl.toFixed(2)),
      unitHeadLossM: n.unitHl,
      cumulativeHeadLossM: Number(cumulativeHl.toFixed(2)),
      freeboardM: n.freeboard,
      status
    });
  });

  return profile;
}
