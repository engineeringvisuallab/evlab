/**
 * EVL WTP Engineering Suite - Comprehensive Intake & Screening Engine
 * Calculates River Hydrology, Screening Headloss (Kirschmer Formula), Intake Wet Well Geometry,
 * Vortex Prevention Submergence, and Pump NPSHa / Cavitation Margins.
 */

export interface RiverHydrologySpec {
  highWaterLevelMSL: number; // HFL
  lowWaterLevelMSL: number; // LWL
  normalWaterLevelMSL: number;
  designWaterLevelMSL: number;
  riverBankElevationMSL: number;
  riverBedLevelMSL: number;
  maxScourDepthM: number;
  riverApproachVelocityMs: number;
}

export interface ScreeningDesignSpec {
  coarseScreenBarSpacingMm: number;
  coarseScreenBarThicknessMm: number;
  coarseScreenAngleDeg: number;
  coarseScreenApproachVelocityMs: number;
  coarseScreenHeadlossM: number;
  
  fineScreenApertureMm: number;
  fineScreenAngleDeg: number;
  fineScreenApproachVelocityMs: number;
  fineScreenHeadlossM: number;
  
  totalScreenHeadlossM: number;
  debrisAccumulationFactor: number;
  fishProtectionMeshMm: number;
}

export interface IntakeWetWellSpec {
  numPumpsDuty: number;
  numPumpsStandby: number;
  flowPerPumpM3hr: number;
  flowPerPumpM3s: number;
  wetWellWidthM: number;
  wetWellLengthM: number;
  wetWellDepthM: number;
  wetWellVolumeM3: number;
  detentionTimeMinutes: number;
  
  pumpBellmouthDiameterMm: number;
  minimumSubmergenceM: number;
  vortexPreventionDistanceM: number;
  clearenceFromFloorM: number;
  
  npshAvailableM: number;
  npshRequiredM: number;
  cavitationMarginM: number;
  cavitationStatus: 'PASS' | 'WARNING' | 'FAIL';
}

/**
 * Calculates complete intake screening, wet well geometry, and pump NPSHa
 */
export function calculateIntakeSystem(
  capacityMLD: number = 100,
  overrides: Record<string, number> = {}
): {
  hydrology: RiverHydrologySpec;
  screening: ScreeningDesignSpec;
  wetWell: IntakeWetWellSpec;
} {
  const peakFlowFactor = 1.25; // 125 MLD peak
  const flowM3hr = (capacityMLD * 1000 * peakFlowFactor) / 24;
  const flowM3s = flowM3hr / 3600;

  // 1. River Hydrology
  const hydrology: RiverHydrologySpec = {
    highWaterLevelMSL: 15.20,
    lowWaterLevelMSL: 9.80,
    normalWaterLevelMSL: 12.50,
    designWaterLevelMSL: 9.80, // Worst case low water level for intake design
    riverBankElevationMSL: 18.50,
    riverBedLevelMSL: 5.50,
    maxScourDepthM: 3.20,
    riverApproachVelocityMs: 0.85
  };

  // 2. Screening Calculations
  // Coarse Screen Kirschmer Headloss: h_L = beta * (s/b)^(4/3) * (v^2 / 2g) * sin(alpha)
  const b_coarse = overrides['b_coarse'] || 12; // bar thickness mm
  const s_coarse = overrides['s_coarse'] || 50; // clear spacing mm
  const v_coarse = 0.65; // m/s approach velocity
  const beta_rect = 2.42; // rectangular bar factor
  const angle_deg = 75;
  const g = 9.81;

  const hL_coarse = beta_rect * ((b_coarse / s_coarse) ** (4/3)) * ((v_coarse ** 2) / (2 * g)) * Math.sin((angle_deg * Math.PI) / 180);

  // Fine Screen
  const b_fine = 6;
  const s_fine = 10;
  const v_fine = 0.80;
  const hL_fine = beta_rect * ((b_fine / s_fine) ** (4/3)) * ((v_fine ** 2) / (2 * g)) * Math.sin((angle_deg * Math.PI) / 180);

  // Debris accumulation multiplier = 1.5x
  const totalScreenLoss = (hL_coarse + hL_fine) * 1.5;

  const screening: ScreeningDesignSpec = {
    coarseScreenBarSpacingMm: s_coarse,
    coarseScreenBarThicknessMm: b_coarse,
    coarseScreenAngleDeg: angle_deg,
    coarseScreenApproachVelocityMs: v_coarse,
    coarseScreenHeadlossM: Number(hL_coarse.toFixed(4)),
    fineScreenApertureMm: s_fine,
    fineScreenAngleDeg: angle_deg,
    fineScreenApproachVelocityMs: v_fine,
    fineScreenHeadlossM: Number(hL_fine.toFixed(4)),
    totalScreenHeadlossM: Number(totalScreenLoss.toFixed(4)),
    debrisAccumulationFactor: 1.5,
    fishProtectionMeshMm: 10.0
  };

  // 3. Intake Wet Well Sizing
  const numDuty = 4;
  const numStandby = 1;
  const flowPerPumpM3hr = flowM3hr / numDuty;
  const flowPerPumpM3s = flowPerPumpM3hr / 3600;

  // Bellmouth diameter D_b = 1.5 * suction pipe diameter
  // Pipe diameter for 1.8 m/s velocity -> D = sqrt(4 * Q / (pi * v))
  const d_suction_m = Math.sqrt((4 * flowPerPumpM3s) / (Math.PI * 1.8));
  const d_bellmouth_m = d_suction_m * 1.5;
  const d_bellmouth_mm = Math.round(d_bellmouth_m * 1000);

  // Hydraulic Institute (HI 9.8) minimum submergence: S = D_b + 1.5 * v_b^2 / (2g)
  const v_bellmouth = flowPerPumpM3s / ((Math.PI / 4) * (d_bellmouth_m ** 2));
  const minSubmergence = d_bellmouth_m + (1.5 * (v_bellmouth ** 2)) / (2 * g);

  // Wet Well Dimensions
  const bayWidthPerPump = d_bellmouth_m * 2.5;
  const wetWellWidth = bayWidthPerPump * (numDuty + numStandby);
  const wetWellLength = d_bellmouth_m * 5.0;
  const wetWellDepth = (hydrology.riverBankElevationMSL - hydrology.riverBedLevelMSL);
  const wetWellVolume = wetWellWidth * wetWellLength * (hydrology.designWaterLevelMSL - hydrology.riverBedLevelMSL);
  const detentionMin = (wetWellVolume / flowM3s) / 60;

  // NPSH Available Calculation
  // NPSHa = H_atm + H_z - H_f - H_vp
  const h_atm = 10.33; // m at sea level
  const h_z = hydrology.designWaterLevelMSL - (hydrology.riverBedLevelMSL + 1.5); // Static head above pump impeller center
  const h_f = 0.45; // Suction friction & minor loss
  const h_vp = 0.32; // Vapor pressure head at 25°C

  const npsha = h_atm + h_z - h_f - h_vp;
  const npshr = 4.20; // Typical NPSHr for vertical turbine pump
  const margin = npsha - npshr;

  const wetWell: IntakeWetWellSpec = {
    numPumpsDuty: numDuty,
    numPumpsStandby: numStandby,
    flowPerPumpM3hr: Number(flowPerPumpM3hr.toFixed(2)),
    flowPerPumpM3s: Number(flowPerPumpM3s.toFixed(3)),
    wetWellWidthM: Number(wetWellWidth.toFixed(2)),
    wetWellLengthM: Number(wetWellLength.toFixed(2)),
    wetWellDepthM: Number(wetWellDepth.toFixed(2)),
    wetWellVolumeM3: Number(wetWellVolume.toFixed(2)),
    detentionTimeMinutes: Number(detentionMin.toFixed(2)),
    pumpBellmouthDiameterMm: d_bellmouth_mm,
    minimumSubmergenceM: Number(minSubmergence.toFixed(2)),
    vortexPreventionDistanceM: Number((d_bellmouth_m * 0.75).toFixed(2)),
    clearenceFromFloorM: Number((d_bellmouth_m * 0.50).toFixed(2)),
    npshAvailableM: Number(npsha.toFixed(2)),
    npshRequiredM: npshr,
    cavitationMarginM: Number(margin.toFixed(2)),
    cavitationStatus: margin >= 1.0 ? 'PASS' : margin >= 0.5 ? 'WARNING' : 'FAIL'
  };

  return { hydrology, screening, wetWell };
}
