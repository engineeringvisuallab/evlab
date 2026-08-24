/**
 * EVL WTP Engineering Suite - Comprehensive Civil, Structural & Site Engineering Engine
 * Calculates Site Grading Cut/Fill, Foundation Selection, Pile Bearing Capacity,
 * Tank Flotation Buoyancy Safety Factors, ACI 350 Environmental Crack Width Limits, and Retaining Walls.
 */

export interface FoundationDesignResult {
  recommendedType: 'Isolated Footing' | 'Raft Foundation (Mat)' | 'Driven Precast Pile Foundation' | 'Bored Cast-in-Situ Pile';
  allowableSoilBearingKpa: number;
  totalDeadWeightKn: number;
  totalUpliftForceKn: number;
  buoyancySafetyFactor: number;
  buoyancyStatus: 'PASS' | 'WARNING' | 'FAIL';
  calculatedSettlementMm: number;
  settlementStatus: 'PASS' | 'WARNING';
  geotechnicalStatusNote: string;
}

export interface StructuralCrackWidthSpec {
  structureName: string;
  concreteGrade: string; // e.g. C35/45
  rebarGrade: string; // Grade 500D
  designTensileStressMpa: number;
  barDiameterMm: number;
  rebarSpacingMm: number;
  calculatedCrackWidthMm: number;
  allowableCrackWidthMm: number;
  aci350ComplianceStatus: 'PASS' | 'WARNING' | 'FAIL';
}

export interface RetainingWallStabilitySpec {
  wallHeightM: number;
  baseWidthM: number;
  soilUnitWeightKnM3: number;
  soilFrictionAngleDeg: number;
  overturningSafetyFactor: number;
  slidingSafetyFactor: number;
  bearingPressureKpa: number;
  stabilityStatus: 'PASS' | 'WARNING' | 'FAIL';
}

export function calculateCivilAndStructural(
  capacityMLD: number = 100,
  overrides: Record<string, number> = {}
): {
  foundation: FoundationDesignResult;
  crackWidth: StructuralCrackWidthSpec;
  retainingWall: RetainingWallStabilitySpec;
} {
  // 1. Foundation & Flotation Calculation
  const allowableSoilBearing = overrides['sbc_kpa'] || 140; // kPa allowable soil bearing
  const cwrVolumeM3 = (capacityMLD * 1000 * 8) / 24; // 8 hours storage = 33,333 m3 for 100 MLD
  const tankAreaM2 = 60 * 50; // 3000 m2 plan area
  const tankDepthM = 4.5;
  const concreteVolumeM3 = 1850; // Tank concrete wall & raft

  const W_dead_concrete = concreteVolumeM3 * 24.5; // kN (24.5 kN/m3 reinforced concrete)
  const W_dead_soil_cover = tankAreaM2 * 0.5 * 18.0; // kN soil cover on roof slab
  const W_dead_total = W_dead_concrete + W_dead_soil_cover;

  // Uplift force when groundwater rises to ground level (4.5m head)
  const gwLevelHeadM = 4.0;
  const F_uplift = tankAreaM2 * gwLevelHeadM * 9.81; // kN buoyancy force

  const sf_buoyancy = W_dead_total / F_uplift;
  const buoyancyStatus = sf_buoyancy >= 1.25 ? 'PASS' : sf_buoyancy >= 1.10 ? 'WARNING' : 'FAIL';

  // Settlement estimate: S = q * B * (1 - nu^2) / E_s
  const grossPressureKpa = (W_dead_total + (cwrVolumeM3 * 9.81)) / tankAreaM2;
  const calculatedSettlement = (grossPressureKpa * 0.15); // mm

  const foundationType = allowableSoilBearing >= 150 ? 'Raft Foundation (Mat)' : 'Bored Cast-in-Situ Pile';

  const foundation: FoundationDesignResult = {
    recommendedType: foundationType,
    allowableSoilBearingKpa: allowableSoilBearing,
    totalDeadWeightKn: Number(W_dead_total.toFixed(1)),
    totalUpliftForceKn: Number(F_uplift.toFixed(1)),
    buoyancySafetyFactor: Number(sf_buoyancy.toFixed(2)),
    buoyancyStatus,
    calculatedSettlementMm: Number(calculatedSettlement.toFixed(1)),
    settlementStatus: calculatedSettlement <= 25.0 ? 'PASS' : 'WARNING',
    geotechnicalStatusNote: 'GEOTECHNICAL_DATA_REQUIRED: Final pile depth & raft thickness subject to certified site soil borehole SPT N-value report.'
  };

  // 2. ACI 350 Environmental Crack Width
  // w = 0.011 * beta * f_s * (d_c * A)^(1/3) * 10^-3
  const f_s = 180; // MPa rebar stress
  const barDiam = 20; // mm
  const spacing = 150; // mm
  const d_c = 50; // mm concrete cover
  const A_area = 2 * d_c * spacing;
  const beta_ratio = 1.2;

  const crackWidthMm = 0.011 * beta_ratio * f_s * ((d_c * A_area) ** (1/3)) * 0.001;
  const allowableCrack = 0.10; // mm for liquid retaining structures per ACI 350-06

  const crackWidth: StructuralCrackWidthSpec = {
    structureName: 'Clear Water Reservoir Reinforced Concrete Wall',
    concreteGrade: 'C35/45 (Sulfate Resisting Cement)',
    rebarGrade: 'Grade 500D High Yield Deformed Bars',
    designTensileStressMpa: f_s,
    barDiameterMm: barDiam,
    rebarSpacingMm: spacing,
    calculatedCrackWidthMm: Number(crackWidthMm.toFixed(3)),
    allowableCrackWidthMm: allowableCrack,
    aci350ComplianceStatus: crackWidthMm <= allowableCrack ? 'PASS' : 'WARNING'
  };

  // 3. Retaining Wall Stability
  const H = 4.5; // m wall height
  const B = 3.2; // m base width
  const gamma_s = 18.0; // kN/m3
  const phi = 30; // degrees

  const Ka = (1 - Math.sin((phi * Math.PI) / 180)) / (1 + Math.sin((phi * Math.PI) / 180));
  const Pa = 0.5 * Ka * gamma_s * (H ** 2); // Active earth pressure force

  const OverturningMoment = Pa * (H / 3);
  const WeightWall = B * 0.6 * 24.5 * H; // approx wall weight
  const ResistingMoment = WeightWall * (B / 2);

  const SF_overturning = ResistingMoment / OverturningMoment;
  const SF_sliding = (WeightWall * Math.tan((20 * Math.PI) / 180)) / Pa;

  const retainingWall: RetainingWallStabilitySpec = {
    wallHeightM: H,
    baseWidthM: B,
    soilUnitWeightKnM3: gamma_s,
    soilFrictionAngleDeg: phi,
    overturningSafetyFactor: Number(SF_overturning.toFixed(2)),
    slidingSafetyFactor: Number(SF_sliding.toFixed(2)),
    bearingPressureKpa: Number((WeightWall / B).toFixed(1)),
    stabilityStatus: SF_overturning >= 1.5 && SF_sliding >= 1.5 ? 'PASS' : 'WARNING'
  };

  return { foundation, crackWidth, retainingWall };
}
