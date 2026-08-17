/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 04: Screening & Inlet Channel Hydraulics Engine
 * @license Apache-2.0
 */

import { ScreenDesignConfig, ScreenHydraulicResult } from '../types/preliminaryPrimary';

export class ScreeningEngine {
  /**
   * Solves screening hydraulics including approach velocity, through-bar velocity,
   * Kirschmer headloss, clogged headloss, water level drop, and screenings yield.
   *
   * @param config Screen configuration
   * @param flowLps Design peak flow rate in L/s
   * @param upstreamInvertMasl Upstream channel invert level in MASL
   */
  public static calculateScreenHydraulics(
    config: ScreenDesignConfig,
    flowLps: number,
    upstreamInvertMasl: number = 100.0
  ): ScreenHydraulicResult {
    const qM3s = Math.max(0.0001, flowLps / 1000);
    const flowM3d = qM3s * 86400;
    const g = 9.80665;

    // Number of active duty channels
    const activeChannels = Math.max(1, config.dutyCount);
    const qPerChannel = qM3s / activeChannels;

    const bM = config.barOpeningMm / 1000;
    const sM = config.barThicknessMm / 1000;
    const thetaRad = (config.screenAngleDeg * Math.PI) / 180;

    // Open area fraction: e = b / (b + s)
    const openAreaFraction = bM / (bM + sM);

    // Channel geometry
    const channelWidth = config.channelWidthM;
    const waterDepth = Math.max(0.1, config.upstreamWaterDepthM);
    const grossAreaM2 = channelWidth * waterDepth;

    // Approach velocity: v_a = Q / (W * d)
    const approachVelocityMps = qPerChannel / grossAreaM2;

    // Effective clean through-area perpendicular to screen
    const screenSubmergedLengthM = waterDepth / Math.sin(thetaRad);
    const totalSubmergedFaceAreaM2 = channelWidth * screenSubmergedLengthM;
    const cleanOpenAreaM2 = totalSubmergedFaceAreaM2 * openAreaFraction;
    const effectiveThroughAreaCleanM2 = grossAreaM2 * openAreaFraction;

    // Velocity through clean bars
    const velocityThroughBarsCleanMps = qPerChannel / Math.max(0.01, effectiveThroughAreaCleanM2);

    // Kirschmer Clean Headloss Formula:
    // h_L = beta * (s / b)^(4/3) * (v_a^2 / (2 * g)) * sin(theta)
    const beta = config.barShapeFactorBeta || 2.42;
    const shapeRatio = Math.pow(sM / bM, 4 / 3);
    const velHeadApproach = Math.pow(approachVelocityMps, 2) / (2 * g);
    const cleanHeadlossM = Math.max(0.005, beta * shapeRatio * velHeadApproach * Math.sin(thetaRad));

    // Normal & Clogged conditions (Orifice / Bernoulli form: h_L = (1 / 2g*Cd^2) * (v_t^2 - v_a^2))
    const cd = 0.60;
    const effectiveCloggedAreaM2 = effectiveThroughAreaCleanM2 * (1 - config.cloggedBlockageRatio);
    const velocityThroughBarsCloggedMps = qPerChannel / Math.max(0.005, effectiveCloggedAreaM2);
    
    const normalCloggedAreaM2 = effectiveThroughAreaCleanM2 * (1 - config.normalBlockageRatio);
    const velocityThroughBarsNormalMps = qPerChannel / Math.max(0.005, normalCloggedAreaM2);

    // Clogged Headloss calculation
    const normalHeadlossM = Math.max(
      cleanHeadlossM * 1.5,
      (1 / (2 * g * Math.pow(cd, 2))) * Math.max(0, Math.pow(velocityThroughBarsNormalMps, 2) - Math.pow(approachVelocityMps, 2)) + cleanHeadlossM
    );

    const cloggedHeadlossM = Math.max(
      cleanHeadlossM * 2.5,
      (1 / (2 * g * Math.pow(cd, 2))) * Math.max(0, Math.pow(velocityThroughBarsCloggedMps, 2) - Math.pow(approachVelocityMps, 2)) + cleanHeadlossM
    );

    // Upstream & Downstream Water Levels
    const upstreamHglMasl = upstreamInvertMasl + waterDepth;
    const downstreamHglMasl = upstreamHglMasl - normalHeadlossM;
    const waterLevelDifferenceM = normalHeadlossM;

    // Screenings Production
    // Volume: m3/day = (Q_m3d / 1000) * yield_L_per_1000m3 / 1000
    const screeningsVolumeM3Day = (flowM3d / 1000) * (config.screeningsYieldLPer1000M3 / 1000);
    const screeningsWetMassKgDay = screeningsVolumeM3Day * config.screeningsBulkDensityKgM3;
    const solidFraction = 1 - config.moistureContentPct / 100;
    const screeningsDryMassKgDay = screeningsWetMassKgDay * solidFraction;

    // Standard 3.0 m3 skip bin capacity check
    const skipCapacityM3 = 3.0;
    const skipStorageDays = Math.max(1, Math.round(skipCapacityM3 / Math.max(0.01, screeningsVolumeM3Day)));

    // Engineering Checks
    // Approach velocity: 0.40 - 0.90 m/s (ideal 0.60 m/s for self-cleansing without deposition)
    // Through-bar velocity: 0.60 - 1.20 m/s clean, <= 1.40 m/s clogged
    const isApproachVelocityOk = approachVelocityMps >= 0.35 && approachVelocityMps <= 1.0;
    const isThroughVelocityOk = velocityThroughBarsCleanMps <= 1.25 && velocityThroughBarsCloggedMps <= 1.50;
    const isHeadlossOk = cleanHeadlossM <= config.allowableCleanHeadlossM && cloggedHeadlossM <= config.allowableCloggedHeadlossM;

    const validationMessages: string[] = [];
    if (!isApproachVelocityOk) {
      if (approachVelocityMps < 0.35) {
        validationMessages.push(`Low approach velocity (${approachVelocityMps.toFixed(2)} m/s < 0.35 m/s): Risk of grit and solid deposition in inlet channel.`);
      } else {
        validationMessages.push(`High approach velocity (${approachVelocityMps.toFixed(2)} m/s > 1.0 m/s): May wash solids through screen.`);
      }
    }
    if (!isThroughVelocityOk) {
      validationMessages.push(`Excessive through-bar velocity (${velocityThroughBarsCloggedMps.toFixed(2)} m/s): Exceeds 1.40 m/s standard.`);
    }
    if (!isHeadlossOk) {
      validationMessages.push(`Headloss under design clogged condition (${cloggedHeadlossM.toFixed(3)} m) exceeds allowable (${config.allowableCloggedHeadlossM} m).`);
    }

    const status: 'OK' | 'WARNING' | 'FAIL' =
      validationMessages.length === 0 ? 'OK' : isHeadlossOk ? 'WARNING' : 'FAIL';

    return {
      grossAreaM2,
      openAreaFraction,
      effectiveThroughAreaCleanM2,
      effectiveThroughAreaCloggedM2: effectiveCloggedAreaM2,
      approachVelocityMps,
      velocityThroughBarsCleanMps,
      velocityThroughBarsCloggedMps,
      cleanHeadlossM,
      normalHeadlossM,
      cloggedHeadlossM,
      headlossFormula: 'h_L = beta * (s/b)^(4/3) * (v_a^2 / 2g) * sin(theta) [Kirschmer Equation]',
      upstreamHglMasl,
      downstreamHglMasl,
      waterLevelDifferenceM,
      screeningsWetMassKgDay,
      screeningsDryMassKgDay,
      screeningsVolumeM3Day,
      skipStorageDays,
      isApproachVelocityOk,
      isThroughVelocityOk,
      isHeadlossOk,
      status,
      validationMessages,
    };
  }

  /**
   * Creates default Coarse Bar Screen configuration.
   */
  public static createDefaultCoarseScreen(): ScreenDesignConfig {
    return {
      id: 'SCR-COARSE-01',
      name: 'Mechanical Coarse Bar Screen',
      screenType: 'MECHANICAL_BAR',
      status: 'ON',
      channelWidthM: 0.80,
      channelCount: 2,
      dutyCount: 1,
      standbyCount: 1,
      barOpeningMm: 20, // 20 mm coarse bar opening
      barThicknessMm: 10, // 10 mm stainless steel bars
      screenAngleDeg: 60, // 60 deg inclination
      barShape: 'RECTANGULAR',
      barShapeFactorBeta: 2.42,
      upstreamWaterDepthM: 0.60,
      cleanBlockageRatio: 0.00,
      normalBlockageRatio: 0.25,
      cloggedBlockageRatio: 0.50,
      screeningsYieldLPer1000M3: 20, // 20 L / 1000 m3
      screeningsBulkDensityKgM3: 850,
      moistureContentPct: 80,
      handlingMethod: 'SCREW_WASHER_COMPACTOR',
      allowableCleanHeadlossM: 0.15,
      allowableCloggedHeadlossM: 0.40,
      bypassAvailable: true,
      bypassNotes: 'Emergency manual bypass bar screen with 40mm opening for high-level overflow.',
    };
  }

  /**
   * Creates default Fine Step Screen configuration.
   */
  public static createDefaultFineScreen(): ScreenDesignConfig {
    return {
      id: 'SCR-FINE-01',
      name: 'Fine Step Screen',
      screenType: 'FINE_STEP',
      status: 'ON',
      channelWidthM: 0.80,
      channelCount: 2,
      dutyCount: 1,
      standbyCount: 1,
      barOpeningMm: 6, // 6 mm fine step opening
      barThicknessMm: 3,
      screenAngleDeg: 55,
      barShape: 'TEARDROP',
      barShapeFactorBeta: 0.76,
      upstreamWaterDepthM: 0.55,
      cleanBlockageRatio: 0.00,
      normalBlockageRatio: 0.25,
      cloggedBlockageRatio: 0.50,
      screeningsYieldLPer1000M3: 45, // 45 L / 1000 m3 for fine screening
      screeningsBulkDensityKgM3: 900,
      moistureContentPct: 82,
      handlingMethod: 'SCREW_WASHER_COMPACTOR',
      allowableCleanHeadlossM: 0.20,
      allowableCloggedHeadlossM: 0.50,
      bypassAvailable: true,
      bypassNotes: 'Fine screen bypass channel routed directly to grit chamber during maintenance.',
    };
  }
}
