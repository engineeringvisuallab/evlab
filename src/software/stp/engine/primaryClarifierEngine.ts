/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 04: Primary Clarifier & Sedimentation Engine
 * @license Apache-2.0
 */

import {
  PrimaryClarifierDesignConfig,
  PrimaryClarifierHydraulicResult,
  PrimaryAlternativeType,
} from '../types/preliminaryPrimary';

export class PrimaryClarifierEngine {
  /**
   * Calculates comprehensive primary clarifier sizing, surface loading, HRT,
   * weir hydraulics, solids loading, and HGL elevations.
   *
   * @param config Clarifier configuration
   * @param flowAvgLps Average flow (ADWF/AWWF) in L/s
   * @param flowPeakLps Peak flow (PWWF) in L/s
   * @param influentTssMgL Influent TSS in mg/L
   * @param upstreamHglMasl Inflow HGL in MASL
   */
  public static calculateClarifierHydraulics(
    config: PrimaryClarifierDesignConfig,
    flowAvgLps: number,
    flowPeakLps: number,
    influentTssMgL: number = 300.0,
    upstreamHglMasl: number = 99.60
  ): PrimaryClarifierHydraulicResult {
    const qAvgM3d = Math.max(0.1, (flowAvgLps / 1000) * 86400);
    const qPeakM3d = Math.max(0.1, (flowPeakLps / 1000) * 86400);
    const qPeakM3s = flowPeakLps / 1000;

    const dutyTanks = Math.max(1, config.dutyCount);
    const totalTanks = Math.max(dutyTanks, config.tankCount);

    let surfaceAreaPerTankM2 = 0;
    let surfaceAreaTotalM2 = 0;
    let tankVolumePerTankM3 = 0;
    let tankVolumeTotalM3 = 0;
    let totalWeirLengthM = 0;
    let waterDepthM = 3.5;

    // Alternative specific geometry calculations
    if (config.alternativeType === 'CIRCULAR_CLARIFIER' || config.alternativeType === 'CONVENTIONAL_PRIMARY_SEDIMENTATION') {
      const circ = config.circular || {
        diameterM: 18.0,
        sideWaterDepthM: 3.5,
        centerWellDiameterM: 3.0,
        bottomSlopeRatio: 0.0833, // 1:12
        weirPlacement: 'PERIPHERAL',
        weirType: '90_DEG_V_NOTCH',
      };

      waterDepthM = circ.sideWaterDepthM;
      surfaceAreaPerTankM2 = (Math.PI * Math.pow(circ.diameterM, 2)) / 4;
      surfaceAreaTotalM2 = surfaceAreaPerTankM2 * dutyTanks;

      // Volume = Cylindrical + Conical hopper fraction
      const coneDepth = (circ.diameterM / 2) * circ.bottomSlopeRatio;
      const cylVol = surfaceAreaPerTankM2 * circ.sideWaterDepthM;
      const coneVol = (1 / 3) * surfaceAreaPerTankM2 * coneDepth;
      tankVolumePerTankM3 = cylVol + coneVol;
      tankVolumeTotalM3 = tankVolumePerTankM3 * dutyTanks;

      // Peripheral weir length: L = pi * (D - 0.6)
      const weirDiameter = Math.max(2.0, circ.diameterM - 0.6);
      totalWeirLengthM = Math.PI * weirDiameter * dutyTanks;
    } else if (config.alternativeType === 'RECTANGULAR_CLARIFIER') {
      const rect = config.rectangular || {
        lengthM: 30.0,
        widthM: 6.0,
        sideWaterDepthM: 3.5,
        lengthToWidthRatio: 5.0,
        flightScraperSpeedMMin: 0.9,
        crossCollectorDepthM: 1.2,
      };

      waterDepthM = rect.sideWaterDepthM;
      surfaceAreaPerTankM2 = rect.lengthM * rect.widthM;
      surfaceAreaTotalM2 = surfaceAreaPerTankM2 * dutyTanks;
      tankVolumePerTankM3 = surfaceAreaPerTankM2 * rect.sideWaterDepthM;
      tankVolumeTotalM3 = tankVolumePerTankM3 * dutyTanks;

      // End transverse weir trough: typically 2 to 3 times width using finger launders
      totalWeirLengthM = rect.widthM * 2.5 * dutyTanks;
    } else if (config.alternativeType === 'LAMELLA_PLATE_CLARIFIER') {
      const lam = config.lamella || {
        plateAngleDeg: 55,
        plateSpacingMm: 50,
        plateLengthM: 1.5,
        projectedAreaMultiplier: 6.5,
        geometricFootprintM2: 60,
        effectiveSettlingAreaM2: 390,
      };

      waterDepthM = 3.8;
      const baseFootprint = lam.geometricFootprintM2 || 60;
      surfaceAreaPerTankM2 = baseFootprint * lam.projectedAreaMultiplier;
      surfaceAreaTotalM2 = surfaceAreaPerTankM2 * dutyTanks;
      tankVolumePerTankM3 = baseFootprint * waterDepthM;
      tankVolumeTotalM3 = tankVolumePerTankM3 * dutyTanks;
      totalWeirLengthM = 15.0 * dutyTanks;
    } else if (config.alternativeType === 'TUBE_SETTLER') {
      const tube = config.tube || {
        tubeModuleAngleDeg: 60,
        tubeOpeningMm: 50,
        moduleHeightM: 0.8,
        effectiveAreaMultiplier: 5.0,
      };

      waterDepthM = 3.5;
      const baseArea = (qPeakM3d / config.designSorPeakM3M2D) / dutyTanks;
      surfaceAreaPerTankM2 = baseArea * tube.effectiveAreaMultiplier;
      surfaceAreaTotalM2 = surfaceAreaPerTankM2 * dutyTanks;
      tankVolumePerTankM3 = baseArea * waterDepthM;
      tankVolumeTotalM3 = tankVolumePerTankM3 * dutyTanks;
      totalWeirLengthM = 20.0 * dutyTanks;
    } else if (config.alternativeType === 'PRIMARY_DAF') {
      const daf = config.daf || {
        hydraulicLoadingM3M2H: 8.0,
        airToSolidsRatioKgAirPerKgSolids: 0.02,
        saturatorPressureKpa: 500,
        recycleRatioPct: 20,
        retentionContactTimeMin: 15,
      };

      waterDepthM = 2.5;
      const totalFlowWithRecycleM3h = (qPeakM3d / 24) * (1 + daf.recycleRatioPct / 100);
      surfaceAreaTotalM2 = totalFlowWithRecycleM3h / daf.hydraulicLoadingM3M2H;
      surfaceAreaPerTankM2 = surfaceAreaTotalM2 / dutyTanks;
      tankVolumeTotalM3 = surfaceAreaTotalM2 * waterDepthM;
      tankVolumePerTankM3 = tankVolumeTotalM3 / dutyTanks;
      totalWeirLengthM = 12.0 * dutyTanks;
    }

    // Hydraulic Sizing Metrics
    const actualSorAverageM3M2D = qAvgM3d / surfaceAreaTotalM2;
    const actualSorPeakM3M2D = qPeakM3d / surfaceAreaTotalM2;
    const actualHrtAverageHours = (tankVolumeTotalM3 / (qAvgM3d / 24));
    const actualHrtPeakHours = (tankVolumeTotalM3 / (qPeakM3d / 24));

    // Weir Hydraulics
    const weirLoadingAverageM3MD = qAvgM3d / Math.max(1, totalWeirLengthM);
    const weirLoadingPeakM3MD = qPeakM3d / Math.max(1, totalWeirLengthM);

    // V-notch weir head calculation: Q = 8/15 * Cd * sqrt(2g) * tan(theta/2) * h^(5/2) * n_notches
    // Standard 90-degree V-notch spaced at 300mm c/c
    const notchesPerMeter = 3.0;
    const totalNotches = Math.max(4, Math.round(totalWeirLengthM * notchesPerMeter));
    const cd = 0.59;
    const g = 9.80665;
    const vNotchCoeff = (8 / 15) * cd * Math.sqrt(2 * g) * Math.tan((90 * Math.PI) / 360) * totalNotches;
    const headOverWeirM = Math.max(0.02, Math.pow(qPeakM3s / Math.max(0.1, vNotchCoeff), 2 / 5));
    const weirDropM = 0.15 + headOverWeirM;

    // Solids Loading Rate: SLR = (Q_peak * TSS_in) / Surface Area [kg TSS / m2 / d]
    const influentTssKgD = (qPeakM3d * influentTssMgL) / 1000;
    const solidsLoadingRateKgM2D = influentTssKgD / surfaceAreaTotalM2;

    // HGL Elevations
    const weirCrestElevationMasl = upstreamHglMasl - headOverWeirM;
    const downstreamHglMasl = weirCrestElevationMasl - 0.20; // Launder drop
    const freeboardProvidedM = config.freeboardM || 0.50;

    // Verification Checks
    const isSorOk = actualSorPeakM3M2D <= config.designSorPeakM3M2D * 1.05;
    const isHrtOk = actualHrtPeakHours >= 1.5;
    const isWeirLoadingOk = weirLoadingPeakM3MD <= config.maxWeirLoadingM3MD;
    const isFreeboardOk = freeboardProvidedM >= 0.30;

    const validationMessages: string[] = [];
    if (!isSorOk) {
      validationMessages.push(`Peak Surface Overflow Rate (${actualSorPeakM3M2D.toFixed(1)} m3/m2/d) exceeds maximum design limit (${config.designSorPeakM3M2D} m3/m2/d).`);
    }
    if (!isHrtOk) {
      validationMessages.push(`Peak HRT (${actualHrtPeakHours.toFixed(2)} h) is below minimum 1.50 h requirement.`);
    }
    if (!isWeirLoadingOk) {
      validationMessages.push(`Peak weir overflow rate (${weirLoadingPeakM3MD.toFixed(1)} m3/m/d) exceeds allowable limit (${config.maxWeirLoadingM3MD} m3/m/d).`);
    }

    const status: 'OK' | 'WARNING' | 'FAIL' =
      validationMessages.length === 0 ? 'OK' : isSorOk ? 'WARNING' : 'FAIL';

    const totalHeadlossM = Math.max(0.15, upstreamHglMasl - downstreamHglMasl);

    return {
      surfaceAreaTotalM2,
      surfaceAreaPerTankM2,
      tankVolumeTotalM3,
      tankVolumePerTankM3,
      actualSorAverageM3M2D,
      actualSorPeakM3M2D,
      actualHrtAverageHours,
      actualHrtPeakHours,
      totalWeirLengthM,
      weirLoadingAverageM3MD,
      weirLoadingPeakM3MD,
      solidsLoadingRateKgM2D,
      weirDropM,
      headOverWeirM,
      totalHeadlossM,
      upstreamHglMasl,
      weirCrestElevationMasl,
      downstreamHglMasl,
      waterDepthM,
      freeboardProvidedM,
      isSorOk,
      isHrtOk,
      isWeirLoadingOk,
      isFreeboardOk,
      status,
      validationMessages,
    };
  }

  /**
   * Creates default Circular Primary Clarifier configuration.
   */
  public static createDefaultCircularClarifier(): PrimaryClarifierDesignConfig {
    return {
      id: 'PST-CIRC-01',
      name: 'Radial Flow Circular Primary Clarifier',
      alternativeType: 'CIRCULAR_CLARIFIER',
      status: 'ON',
      tankCount: 2,
      dutyCount: 2,
      standbyCount: 0,
      designSorAverageM3M2D: 30.0, // 30 m3/m2/d at ADWF
      designSorPeakM3M2D: 40.0, // 40 m3/m2/d at PWWF
      maxWeirLoadingM3MD: 180.0, // 180 m3/m/d
      minDetentionTimeHours: 2.0,
      expectedTssRemovalPct: 60.0,
      expectedBodRemovalPct: 35.0,
      expectedCodRemovalPct: 35.0,
      expectedVssRemovalPct: 60.0,
      sludgeConcentrationPct: 4.0, // 4% dry solids primary sludge
      sludgeSpecificGravity: 1.025,
      freeboardM: 0.50,
      circular: {
        diameterM: 18.0, // 18m diameter x 2 units = 508 m2 total area
        sideWaterDepthM: 3.5,
        centerWellDiameterM: 3.0,
        bottomSlopeRatio: 0.0833, // 1:12 slope
        weirPlacement: 'PERIPHERAL',
        weirType: '90_DEG_V_NOTCH',
      },
    };
  }

  /**
   * Creates default Lamella Plate Settler configuration.
   */
  public static createDefaultLamellaClarifier(): PrimaryClarifierDesignConfig {
    return {
      id: 'PST-LAM-01',
      name: 'High-Rate Lamella Inclined Plate Settler',
      alternativeType: 'LAMELLA_PLATE_CLARIFIER',
      status: 'AUTO_SELECT',
      tankCount: 2,
      dutyCount: 2,
      standbyCount: 0,
      designSorAverageM3M2D: 25.0,
      designSorPeakM3M2D: 35.0,
      maxWeirLoadingM3MD: 200.0,
      minDetentionTimeHours: 1.5,
      expectedTssRemovalPct: 65.0,
      expectedBodRemovalPct: 35.0,
      expectedCodRemovalPct: 35.0,
      expectedVssRemovalPct: 65.0,
      sludgeConcentrationPct: 4.5,
      sludgeSpecificGravity: 1.025,
      freeboardM: 0.50,
      lamella: {
        plateAngleDeg: 55,
        plateSpacingMm: 50,
        plateLengthM: 1.5,
        projectedAreaMultiplier: 6.5,
        geometricFootprintM2: 50,
        effectiveSettlingAreaM2: 325,
      },
    };
  }

  /**
   * Creates default Rectangular Primary Clarifier configuration.
   */
  public static createDefaultRectangularClarifier(): PrimaryClarifierDesignConfig {
    return {
      id: 'PST-RECT-01',
      name: 'Rectangular Chain-and-Flight Primary Clarifier',
      alternativeType: 'RECTANGULAR_CLARIFIER',
      status: 'ON',
      tankCount: 2,
      dutyCount: 2,
      standbyCount: 0,
      designSorAverageM3M2D: 30.0,
      designSorPeakM3M2D: 40.0,
      maxWeirLoadingM3MD: 180.0,
      minDetentionTimeHours: 2.0,
      expectedTssRemovalPct: 62.0,
      expectedBodRemovalPct: 35.0,
      expectedCodRemovalPct: 35.0,
      expectedVssRemovalPct: 62.0,
      sludgeConcentrationPct: 4.0,
      sludgeSpecificGravity: 1.025,
      freeboardM: 0.50,
      rectangular: {
        lengthM: 30.0,
        widthM: 6.0,
        sideWaterDepthM: 3.5,
        lengthToWidthRatio: 5.0,
        flightScraperSpeedMMin: 0.9,
        crossCollectorDepthM: 1.2,
      },
    };
  }
}
