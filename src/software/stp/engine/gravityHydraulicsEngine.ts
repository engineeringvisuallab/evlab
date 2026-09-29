/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Gravity Sewer Manning Partial-Flow Hydraulics Engine
 * @license Apache-2.0
 */

import { 
  PipeMaterial, 
  PartialFlowHydraulics, 
  PipeHydraulicStatus, 
  FlowRegime, 
  SewerDesignCriteria 
} from '../types/sewer';

export class GravityHydraulicsEngine {
  /**
   * Standard Manning's n roughness coefficients for sewer pipe materials.
   */
  public static readonly MANNING_N: Record<PipeMaterial, number> = {
    uPVC: 0.010,
    HDPE_PE100: 0.010,
    RCC_CLASS_NP3: 0.013,
    DUCTILE_IRON: 0.012,
    VITRIFIED_CLAY: 0.012,
    GRP: 0.010,
  };

  /**
   * Calculates full-bore pipe capacity and velocity using Manning's Equation:
   * Q_full = (1/n) * A_full * (R_full)^(2/3) * S^(1/2)
   * where:
   * A_full = pi * D^2 / 4
   * R_full = D / 4
   * S = slope ratio (m/m)
   */
  public static calculateFullFlowCapacity(
    diameterM: number,
    slopeRatio: number,
    manningN: number
  ): { capacityM3d: number; capacityLps: number; velocityMps: number; areaM2: number } {
    if (diameterM <= 0 || slopeRatio <= 0 || manningN <= 0) {
      return { capacityM3d: 0, capacityLps: 0, velocityMps: 0, areaM2: 0 };
    }

    const areaM2 = (Math.PI * Math.pow(diameterM, 2)) / 4;
    const hydraulicRadiusM = diameterM / 4;
    const velocityMps = (1 / manningN) * Math.pow(hydraulicRadiusM, 2 / 3) * Math.sqrt(slopeRatio);
    const flowM3s = areaM2 * velocityMps;
    const capacityM3d = flowM3s * 86400;
    const capacityLps = flowM3s * 1000;

    return {
      capacityM3d,
      capacityLps,
      velocityMps,
      areaM2,
    };
  }

  /**
   * Solves partial-depth circular pipe hydraulics using exact trigonometric equations:
   * Theta (angle subtended at center by free surface) in radians:
   * For depth y (0 < y <= D):
   * theta = 2 * acos(1 - 2*(y/D))
   * Area A = (D^2 / 8) * (theta - sin(theta))
   * Wetted Perimeter P = (D / 2) * theta
   * Hydraulic Radius R = A / P = (D / 4) * (1 - sin(theta) / theta)
   * Free surface width B = D * sin(theta / 2)
   * Hydraulic Depth D_h = A / B
   * Froude Number Fr = V / sqrt(g * D_h)
   */
  public static solvePartialFlow(
    designFlowLps: number,
    diameterM: number,
    slopeRatio: number,
    manningN: number,
    criteria?: SewerDesignCriteria
  ): PartialFlowHydraulics {
    const full = this.calculateFullFlowCapacity(diameterM, slopeRatio, manningN);
    const Q_target_m3s = Math.max(0, designFlowLps / 1000);

    if (Q_target_m3s === 0 || full.capacityLps === 0) {
      return {
        depthM: 0,
        depthRatio: 0,
        flowAreaM2: 0,
        wettedPerimeterM: 0,
        hydraulicRadiusM: 0,
        velocityMps: 0,
        froudeNumber: 0,
        flowRegime: 'SUBCRITICAL',
        capacityFullM3d: full.capacityM3d,
        capacityFullLps: full.capacityLps,
        capacityRatio: 0,
        isSelfCleansing: false,
        isScouring: false,
        headlossFrictionM: 0,
        headlossMinorM: 0,
        headlossTotalM: 0,
        upstreamHglMasl: 0,
        downstreamHglMasl: 0,
        upstreamEglMasl: 0,
        downstreamEglMasl: 0,
        status: 'UNDER_UTILIZED',
      };
    }

    // Iterative Bisection / Newton-Raphson to find depth ratio y/D (0 to 1.0)
    let y_low = 0.001 * diameterM;
    let y_high = diameterM;
    let depthM = y_low;
    let bestA = 0;
    let bestP = 0;
    let bestR = 0;
    let bestV = 0;

    for (let iter = 0; iter < 40; iter++) {
      const y_mid = (y_low + y_high) / 2;
      const depthRatio = Math.min(0.999, Math.max(0.001, y_mid / diameterM));
      const theta = 2 * Math.acos(1 - 2 * depthRatio);
      const A = (Math.pow(diameterM, 2) / 8) * (theta - Math.sin(theta));
      const P = (diameterM / 2) * theta;
      const R = P > 0 ? A / P : 0;
      const V = (1 / manningN) * Math.pow(R, 2 / 3) * Math.sqrt(slopeRatio);
      const Q_calc = A * V;

      if (Math.abs(Q_calc - Q_target_m3s) < 1e-6) {
        depthM = y_mid;
        bestA = A;
        bestP = P;
        bestR = R;
        bestV = V;
        break;
      }

      if (Q_calc < Q_target_m3s) {
        y_low = y_mid;
      } else {
        y_high = y_mid;
      }

      depthM = y_mid;
      bestA = A;
      bestP = P;
      bestR = R;
      bestV = V;
    }

    const depthRatio = depthM / diameterM;
    const capacityRatio = designFlowLps / full.capacityLps;

    // Froude Number Calculation
    const thetaFinal = 2 * Math.acos(1 - 2 * Math.min(0.999, Math.max(0.001, depthRatio)));
    const surfaceWidthB = diameterM * Math.sin(thetaFinal / 2);
    const hydraulicDepth = surfaceWidthB > 0 ? bestA / surfaceWidthB : depthM;
    const froudeNumber = hydraulicDepth > 0 ? bestV / Math.sqrt(9.81 * hydraulicDepth) : 0;

    let flowRegime: FlowRegime = 'SUBCRITICAL';
    if (froudeNumber > 1.05) flowRegime = 'SUPERCRITICAL';
    else if (froudeNumber >= 0.95 && froudeNumber <= 1.05) flowRegime = 'CRITICAL';

    const minVelocity = criteria ? criteria.minSelfCleansingVelocityMps : 0.6;
    const maxVelocity = criteria ? criteria.maxVelocityMps : 3.0;

    const isSelfCleansing = bestV >= minVelocity;
    const isScouring = bestV > maxVelocity;

    let status: PipeHydraulicStatus = 'OK';
    if (capacityRatio > 1.0 || depthRatio > 0.95) {
      status = 'SURCHARGED';
    } else if (capacityRatio > 0.80 || depthRatio > (criteria?.maxDepthRatioD || 0.80)) {
      status = 'NEAR_CAPACITY';
    } else if (capacityRatio < 0.15 || !isSelfCleansing) {
      status = 'UNDER_UTILIZED';
    }

    return {
      depthM,
      depthRatio,
      flowAreaM2: bestA,
      wettedPerimeterM: bestP,
      hydraulicRadiusM: bestR,
      velocityMps: bestV,
      froudeNumber,
      flowRegime,
      capacityFullM3d: full.capacityM3d,
      capacityFullLps: full.capacityLps,
      capacityRatio,
      isSelfCleansing,
      isScouring,
      headlossFrictionM: slopeRatio * 1.0, // Per meter or multiplied by length later
      headlossMinorM: 0,
      headlossTotalM: 0,
      upstreamHglMasl: 0,
      downstreamHglMasl: 0,
      upstreamEglMasl: 0,
      downstreamEglMasl: 0,
      status,
    };
  }

  /**
   * Automated Pipe Size Selector:
   * Evaluates standard commercially available diameters (e.g. 200, 250, 300, 375, 450, 500, 600, 750, 900, 1000, 1200 mm)
   * to recommend the optimal diameter satisfying self-cleansing velocity (>= 0.6 m/s) and depth ratio limit (<= 0.75-0.80).
   */
  public static selectOptimalDiameter(
    designFlowLps: number,
    slopeRatio: number,
    material: PipeMaterial,
    criteria?: SewerDesignCriteria
  ): { recommendedDiameterMm: number; alternatives: { diameterMm: number; depthRatio: number; velocityMps: number; isAcceptable: boolean }[] } {
    const standardSizesMm = [200, 250, 300, 375, 400, 450, 500, 600, 700, 800, 900, 1000, 1200, 1400, 1600];
    const manningN = this.MANNING_N[material] || 0.010;
    const maxDepthRatio = criteria?.maxDepthRatioD || 0.80;
    const minVel = criteria?.minSelfCleansingVelocityMps || 0.6;
    const maxVel = criteria?.maxVelocityMps || 3.0;

    const alternatives = standardSizesMm.map((dMm) => {
      const hyd = this.solvePartialFlow(designFlowLps, dMm / 1000, slopeRatio, manningN, criteria);
      const isAcceptable = hyd.depthRatio <= maxDepthRatio && hyd.velocityMps >= minVel && hyd.velocityMps <= maxVel && hyd.capacityRatio <= 1.0;
      return {
        diameterMm: dMm,
        depthRatio: hyd.depthRatio,
        velocityMps: hyd.velocityMps,
        isAcceptable,
      };
    });

    const recommended = alternatives.find((a) => a.isAcceptable) || alternatives[0];

    return {
      recommendedDiameterMm: recommended.diameterMm,
      alternatives,
    };
  }
}
