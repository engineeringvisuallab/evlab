/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Pumping Lift Station, Wet Well Sizing & Force Main Hydraulics Engine
 * @license Apache-2.0
 */

import { 
  PumpingStation, 
  PumpSpecification, 
  WetWellDesign, 
  ForceMainHydraulics, 
  PipeMaterial,
  FrictionFormula
} from '../types/sewer';

export class PumpingStationEngine {
  /**
   * Standard Hazen-Williams C-factors for pressure pipelines.
   */
  public static readonly HAZEN_WILLIAMS_C: Record<PipeMaterial, number> = {
    uPVC: 150,
    HDPE_PE100: 150,
    DUCTILE_IRON: 130,
    RCC_CLASS_NP3: 110,
    VITRIFIED_CLAY: 110,
    GRP: 150,
  };

  /**
   * Equivalent absolute roughness k_s (mm) for Darcy-Weisbach Colebrook-White.
   */
  public static readonly DARCY_ROUGHNESS_MM: Record<PipeMaterial, number> = {
    uPVC: 0.005,
    HDPE_PE100: 0.007,
    DUCTILE_IRON: 0.03,
    RCC_CLASS_NP3: 0.30,
    VITRIFIED_CLAY: 0.05,
    GRP: 0.01,
  };

  /**
   * Wet Well Active Volume Sizing using the Minimum Cycle Time Formula:
   * V_active = (Q_pump * T_min) / 4
   * where:
   * Q_pump = capacity of single duty pump (m3/s)
   * T_min = allowable minimum cycle time (seconds, typically 360-600s = 6-10 min)
   * Starts/hour = 3600 / T_min (e.g. 3600 / 360 = 10 starts/hr max)
   */
  public static sizeWetWell(
    pumpCapacityLps: number,
    minCycleTimeSec: number = 360,
    wellDiameterM: number = 2.5,
    inflowPeakLps: number = 50
  ): WetWellDesign {
    const Q_pump_m3s = pumpCapacityLps / 1000;
    const activeVolumeM3 = (Q_pump_m3s * minCycleTimeSec) / 4;
    const crossSectionAreaM2 = (Math.PI * Math.pow(wellDiameterM, 2)) / 4;
    const activeDepthM = crossSectionAreaM2 > 0 ? activeVolumeM3 / crossSectionAreaM2 : 1.0;

    // Floor and Level elevations (Normalized benchmark)
    const floorLevelMasl = 10.0;
    const deadVolumeM3 = crossSectionAreaM2 * 0.5; // 0.5m submergence below stop level
    const lowWaterLevelMasl = floorLevelMasl + 0.5;
    const highWaterLevelMasl = lowWaterLevelMasl + activeDepthM;
    const alarmWaterLevelMasl = highWaterLevelMasl + 0.5;

    // Emergency storage from HWL to overflow (e.g. 1.0m freeboard storage)
    const emergencyStorageM3 = crossSectionAreaM2 * 1.0;
    const peakInflowM3s = inflowPeakLps / 1000;
    const emergencyRetentionHours = peakInflowM3s > 0 ? (emergencyStorageM3 / (peakInflowM3s * 3600)) : 2.0;

    const startsPerHour = 3600 / minCycleTimeSec;
    const isCycleTimeAdequate = startsPerHour <= 12;

    return {
      stationType: 'SUBMERSIBLE',
      wellShape: 'CIRCULAR',
      diameterOrWidthM: wellDiameterM,
      crossSectionAreaM2,
      floorLevelMasl,
      lowWaterLevelMasl,
      highWaterLevelMasl,
      alarmWaterLevelMasl,
      activeVolumeM3,
      deadVolumeM3,
      emergencyStorageM3,
      emergencyRetentionHours,
      minCycleTimeSec,
      startsPerHour,
      isCycleTimeAdequate,
    };
  }

  /**
   * Calculates Force Main Hydraulics using Hazen-Williams or Darcy-Weisbach:
   * 
   * Hazen-Williams Formulation (SI Units):
   * h_f = 10.67 * L * (Q)^1.852 / (C^1.852 * D^4.87)
   * where Q in m3/s, L in m, D in m
   * 
   * Total Dynamic Head (TDH):
   * TDH = Static Lift (H_stat) + Friction Headloss (h_f) + Minor Headloss (h_m)
   * 
   * Power Calculation:
   * Hydraulic Power P_hyd = (rho * g * Q * TDH) / 1000  (kW)
   * Motor Electrical Power P_elec = P_hyd / (eta_pump * eta_motor) (kW)
   */
  public static calculateForceMainHydraulics(
    flowLps: number,
    internalDiameterMm: number,
    lengthM: number,
    staticLiftM: number,
    material: PipeMaterial,
    formula: FrictionFormula = 'HAZEN_WILLIAMS',
    minorLossK: number = 3.5, // Valves, bends, check-valve, exit
    pumpEffPct: number = 75,
    motorEffPct: number = 90
  ): ForceMainHydraulics {
    const Q_m3s = flowLps / 1000;
    const D_m = internalDiameterMm / 1000;
    const areaM2 = (Math.PI * Math.pow(D_m, 2)) / 4;
    const velocityMps = areaM2 > 0 ? Q_m3s / areaM2 : 0;

    let frictionHeadlossM = 0;
    let frictionFactor = 0;

    if (formula === 'HAZEN_WILLIAMS') {
      const C = this.HAZEN_WILLIAMS_C[material] || 140;
      frictionFactor = C;
      if (D_m > 0 && C > 0 && Q_m3s > 0) {
        frictionHeadlossM = 10.67 * lengthM * Math.pow(Q_m3s, 1.852) / (Math.pow(C, 1.852) * Math.pow(D_m, 4.87));
      }
    } else {
      // Darcy-Weisbach Colebrook-White Swamee-Jain explicit approximation:
      // f = 0.25 / [log10( (k_s / (3.7*D)) + (5.74 / Re^0.9) )]^2
      const nu = 1.004e-6; // Kinematic viscosity of water at 20°C (m2/s)
      const Re = (velocityMps * D_m) / nu;
      const ks_m = (this.DARCY_ROUGHNESS_MM[material] || 0.01) / 1000;

      if (Re < 2000) {
        frictionFactor = Re > 0 ? 64 / Re : 0.02;
      } else {
        frictionFactor = 0.25 / Math.pow(Math.log10((ks_m / (3.7 * D_m)) + (5.74 / Math.pow(Re, 0.9))), 2);
      }
      frictionHeadlossM = frictionFactor * (lengthM / D_m) * (Math.pow(velocityMps, 2) / (2 * 9.81));
    }

    const minorHeadlossM = minorLossK * (Math.pow(velocityMps, 2) / (2 * 9.81));
    const totalDynamicHeadM = Math.max(0, staticLiftM + frictionHeadlossM + minorHeadlossM);

    // Power calculations
    const rho = 1000; // kg/m3
    const g = 9.81;   // m/s2
    const hydraulicPowerKw = (rho * g * Q_m3s * totalDynamicHeadM) / 1000;
    const combinedEff = (pumpEffPct / 100) * (motorEffPct / 100);
    const electricalPowerKw = combinedEff > 0 ? hydraulicPowerKw / combinedEff : hydraulicPowerKw * 1.5;
    const dailyEnergyKwh = electricalPowerKw * 24;

    // Transient Surge Risk Indicator
    const isHighVelocity = velocityMps > 2.5;
    const isLongLine = lengthM > 500;
    const surgeAnalysisRequired = isHighVelocity || isLongLine || totalDynamicHeadM > 35;
    const surgeNotes = surgeAnalysisRequired
      ? `High surge vulnerability detected (L=${lengthM}m, V=${velocityMps.toFixed(2)}m/s). Air vessel or surge relief valve recommended.`
      : `Moderate surge potential. Standard non-slam check valve adequate.`;

    let status: 'OK' | 'LOW_VELOCITY' | 'HIGH_VELOCITY' | 'HIGH_HEAD' = 'OK';
    if (velocityMps < 0.8) status = 'LOW_VELOCITY';
    else if (velocityMps > 2.5) status = 'HIGH_VELOCITY';
    else if (totalDynamicHeadM > 60) status = 'HIGH_HEAD';

    return {
      id: 'FM-001',
      name: 'Primary Outfall Force Main',
      pumpingStationId: 'PS-001',
      dischargeNodeId: 'STP-INLET-01',
      material,
      internalDiameterMm,
      lengthM,
      designFlowLps: flowLps,
      velocityMps,
      frictionFormula: formula,
      frictionFactor,
      frictionHeadlossM,
      minorLossCoeffK: minorLossK,
      minorHeadlossM,
      staticLiftM,
      totalDynamicHeadM,
      hydraulicPowerKw,
      electricalPowerKw,
      dailyEnergyKwh,
      surgeAnalysisRequired,
      surgeNotes,
      status,
    };
  }

  /**
   * Complete Pumping Station Synthesis:
   * Assembles wet well, duty/standby pumps, and force main hydraulics into an interconnected station model.
   */
  public static configurePumpingStation(
    id: string,
    name: string,
    nodeId: string,
    peakInflowLps: number,
    averageInflowLps: number,
    staticLiftM: number,
    forceMainLengthM: number,
    forceMainDiameterMm: number = 250,
    forceMainMaterial: PipeMaterial = 'HDPE_PE100'
  ): PumpingStation {
    // 2 Duty + 1 Standby arrangement
    const dutyCount = 2;
    const standbyCount = 1;
    const capacityPerPumpLps = Math.ceil(peakInflowLps / dutyCount);

    const wetWell = this.sizeWetWell(capacityPerPumpLps, 360, 3.0, peakInflowLps);
    const forceMain = this.calculateForceMainHydraulics(
      peakInflowLps,
      forceMainDiameterMm,
      forceMainLengthM,
      staticLiftM,
      forceMainMaterial
    );

    const pumpEff = 75;
    const motorRatingKw = Math.ceil((forceMain.electricalPowerKw / dutyCount) * 1.2); // 20% safety margin on motor size

    const pumps: PumpSpecification = {
      id: `PUMP-SPEC-${id}`,
      pumpModel: 'Flygt / KSB Submersible Non-Clog Wastewater Pump',
      dutyCount,
      standbyCount,
      flowRateLps: capacityPerPumpLps,
      headM: forceMain.totalDynamicHeadM,
      efficiencyPct: pumpEff,
      motorRatingKw,
      operatingSpeedRpm: 1450,
      ratedVoltageV: 400,
      vfdEquipped: true,
      npshRequiredM: 3.2,
      npshAvailableM: 8.5,
    };

    const warnings: string[] = [];
    if (!wetWell.isCycleTimeAdequate) warnings.push('Wet well active volume is undersized for maximum allowable starts per hour.');
    if (forceMain.velocityMps < 0.8) warnings.push('Force main velocity is below self-cleansing threshold (0.8 m/s). Risk of solids deposition.');
    if (forceMain.velocityMps > 2.5) warnings.push('Force main velocity exceeds scouring threshold (2.5 m/s). High energy loss and surge risk.');

    return {
      id,
      name,
      nodeId,
      catchmentIds: ['CATCH-01'],
      inflowPeakLps: peakInflowLps,
      inflowAverageLps: averageInflowLps,
      inflowMinLps: averageInflowLps * 0.4,
      pumpDesignFlowLps: peakInflowLps,
      pumps,
      wetWell,
      forceMain,
      status: warnings.length > 0 ? 'WARNING' : 'OPERATIONAL',
      warnings,
    };
  }
}
