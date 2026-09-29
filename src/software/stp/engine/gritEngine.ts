/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 04: Grit Removal & Production Engine
 * @license Apache-2.0
 */

import { GritDesignConfig, GritHydraulicResult } from '../types/preliminaryPrimary';

export class GritEngine {
  /**
   * Calculates comprehensive grit chamber hydraulics and grit production.
   *
   * @param config Grit chamber configuration
   * @param flowLps Design peak wastewater flow in L/s
   * @param upstreamHglMasl Inflow HGL in MASL
   */
  public static calculateGritHydraulics(
    config: GritDesignConfig,
    flowLps: number,
    upstreamHglMasl: number = 99.80
  ): GritHydraulicResult {
    const qM3s = Math.max(0.0001, flowLps / 1000);
    const flowM3d = qM3s * 86400;
    const dutyUnits = Math.max(1, config.dutyCount);
    const qPerUnitM3s = qM3s / dutyUnits;

    let chamberVolumeM3 = 0;
    let surfaceAreaM2 = 0;
    let actualDetentionTimeSec = 0;
    let actualHorizontalVelocityMps = 0;
    let surfaceOverflowRateM3M2D = 0;
    let removalEfficiencyPct = 95;
    let airflowTotalNm3Hr = 0;
    let blowerPowerKw = 0;
    let headlossM = 0.05;

    if (config.chamberType === 'HORIZONTAL_FLOW') {
      const hConfig = config.horizontal || {
        channelVelocityMps: 0.30,
        detentionTimeSec: 60,
        lengthM: 18.0,
        widthM: 1.2,
        liquidDepthM: 0.8,
        gritStorageDepthM: 0.25,
        surfaceLoadingRateM3M2D: 1200,
      };

      actualHorizontalVelocityMps = qPerUnitM3s / (hConfig.widthM * hConfig.liquidDepthM);
      actualDetentionTimeSec = hConfig.lengthM / Math.max(0.01, actualHorizontalVelocityMps);
      chamberVolumeM3 = hConfig.lengthM * hConfig.widthM * hConfig.liquidDepthM * dutyUnits;
      surfaceAreaM2 = hConfig.lengthM * hConfig.widthM * dutyUnits;
      surfaceOverflowRateM3M2D = flowM3d / surfaceAreaM2;
      headlossM = 0.05 + Math.pow(actualHorizontalVelocityMps, 2) / (2 * 9.80665);
      removalEfficiencyPct = 95.0; // Standard 0.20mm grit capture
    } else if (config.chamberType === 'AERATED_GRIT') {
      const aConfig = config.aerated || {
        detentionTimeMin: 3.5,
        airSupplyM3MinPerM: 0.35,
        airRatePerM3Wastewater: 0.010,
        tankLengthM: 12.0,
        tankWidthM: 2.5,
        liquidDepthM: 3.0,
        diffuserSubmergenceM: 2.5,
        estimatedBlowerPowerKw: 4.5,
      };

      const hrtSeconds = aConfig.detentionTimeMin * 60;
      chamberVolumeM3 = qM3s * hrtSeconds;
      const singleTankVol = chamberVolumeM3 / dutyUnits;
      const tankArea = aConfig.tankLengthM * aConfig.tankWidthM;
      surfaceAreaM2 = tankArea * dutyUnits;
      actualDetentionTimeSec = (chamberVolumeM3 / qM3s);
      actualHorizontalVelocityMps = qPerUnitM3s / (aConfig.tankWidthM * aConfig.liquidDepthM);
      surfaceOverflowRateM3M2D = flowM3d / surfaceAreaM2;

      // Air supply rate calculation (m3/min per meter length)
      const airM3Min = aConfig.airSupplyM3MinPerM * aConfig.tankLengthM * dutyUnits;
      airflowTotalNm3Hr = airM3Min * 60;

      // Blower Power: P (kW) = (Q_air [Nm3/min] * delta_P [kPa]) / (60 * efficiency)
      const deltaPkpa = 9.81 * aConfig.diffuserSubmergenceM + 5.0; // Water depth + pipe friction
      blowerPowerKw = Math.max(1.5, (airM3Min * deltaPkpa) / (60 * 0.65));
      headlossM = 0.10;
      removalEfficiencyPct = 96.5;
    } else if (config.chamberType === 'VORTEX_GRIT') {
      const vConfig = config.vortex || {
        diameterM: 3.0,
        liquidDepthM: 2.4,
        hydraulicLoadingM3M2H: 45.0,
        paddleDrivePowerKw: 1.5,
        vendorModelName: 'Pista / Hydrovex Equivalent',
        requiresVendorReview: true,
      };

      const singleArea = (Math.PI * Math.pow(vConfig.diameterM, 2)) / 4;
      surfaceAreaM2 = singleArea * dutyUnits;
      const singleVol = singleArea * vConfig.liquidDepthM;
      chamberVolumeM3 = singleVol * dutyUnits;
      actualDetentionTimeSec = chamberVolumeM3 / qM3s;
      actualHorizontalVelocityMps = 0.35; // Cross-scour controlled by rotating paddles
      surfaceOverflowRateM3M2D = flowM3d / surfaceAreaM2;
      blowerPowerKw = vConfig.paddleDrivePowerKw * dutyUnits;
      headlossM = 0.15; // Vortex chamber entry/exit loss
      removalEfficiencyPct = 95.0;
    }

    // Downstream HGL
    const downstreamHglMasl = upstreamHglMasl - headlossM;

    // Grit Production Rates
    // Typical municipal yield: 15 - 45 L of grit per 1,000 m3 of wastewater
    const gritVolumeM3Day = (flowM3d / 1000) * (config.gritYieldLPer1000M3 / 1000);
    const gritWetMassKgDay = gritVolumeM3Day * config.gritBulkDensityKgM3;
    const solidFraction = 1 - config.gritMoisturePct / 100;
    const gritDryMassKgDay = gritWetMassKgDay * solidFraction;

    // Storage Skip (2.0 m3 skip container)
    const skipCapacityM3 = 2.0;
    const storageDays = Math.max(1, Math.round(skipCapacityM3 / Math.max(0.005, gritVolumeM3Day)));

    // Validations
    const validationMessages: string[] = [];
    if (config.chamberType === 'HORIZONTAL_FLOW') {
      if (actualHorizontalVelocityMps < 0.25 || actualHorizontalVelocityMps > 0.40) {
        validationMessages.push(`Horizontal velocity (${actualHorizontalVelocityMps.toFixed(2)} m/s) is outside optimal 0.25-0.40 m/s range.`);
      }
      if (actualDetentionTimeSec < 45) {
        validationMessages.push(`Detention time (${actualDetentionTimeSec.toFixed(0)} s) is below recommended 45s minimum.`);
      }
    } else if (config.chamberType === 'AERATED_GRIT') {
      if (actualDetentionTimeSec < 180) {
        validationMessages.push(`Aerated grit HRT (${(actualDetentionTimeSec / 60).toFixed(1)} min) is below 3.0 min peak guideline.`);
      }
    }

    const status: 'OK' | 'WARNING' | 'FAIL' =
      validationMessages.length === 0 ? 'OK' : 'WARNING';

    return {
      chamberVolumeM3,
      surfaceAreaM2,
      actualDetentionTimeSec,
      actualHorizontalVelocityMps,
      surfaceOverflowRateM3M2D,
      removalEfficiencyPct,
      airflowTotalNm3Hr,
      blowerPowerKw,
      headlossM,
      upstreamHglMasl,
      downstreamHglMasl,
      gritWetMassKgDay,
      gritDryMassKgDay,
      gritVolumeM3Day,
      storageSkipCapacityM3: skipCapacityM3,
      storageDays,
      status,
      validationMessages,
    };
  }

  /**
   * Creates default Aerated Grit Chamber configuration.
   */
  public static createDefaultAeratedGrit(): GritDesignConfig {
    return {
      id: 'GRIT-AER-01',
      name: 'Aerated Grit Chamber',
      chamberType: 'AERATED_GRIT',
      status: 'ON',
      chamberCount: 2,
      dutyCount: 1,
      standbyCount: 1,
      targetParticleSizeMm: 0.20,
      particleSpecificGravity: 2.65,
      settlingVelocityMps: 0.021,
      gritYieldLPer1000M3: 30, // 30 L / 1000 m3
      gritBulkDensityKgM3: 1500,
      gritMoisturePct: 50,
      volatileOrganicPct: 20,
      aerated: {
        detentionTimeMin: 3.5,
        airSupplyM3MinPerM: 0.35,
        airRatePerM3Wastewater: 0.010,
        tankLengthM: 10.0,
        tankWidthM: 2.2,
        liquidDepthM: 2.8,
        diffuserSubmergenceM: 2.4,
        estimatedBlowerPowerKw: 3.7,
      },
    };
  }

  /**
   * Creates default Horizontal Flow Grit Chamber configuration.
   */
  public static createDefaultHorizontalGrit(): GritDesignConfig {
    return {
      id: 'GRIT-HOR-01',
      name: 'Horizontal-Flow Velocity Controlled Grit Channel',
      chamberType: 'HORIZONTAL_FLOW',
      status: 'AUTO_SELECT',
      chamberCount: 2,
      dutyCount: 1,
      standbyCount: 1,
      targetParticleSizeMm: 0.20,
      particleSpecificGravity: 2.65,
      settlingVelocityMps: 0.021,
      gritYieldLPer1000M3: 30,
      gritBulkDensityKgM3: 1500,
      gritMoisturePct: 50,
      volatileOrganicPct: 20,
      horizontal: {
        channelVelocityMps: 0.30,
        detentionTimeSec: 60,
        lengthM: 18.0,
        widthM: 1.2,
        liquidDepthM: 0.80,
        gritStorageDepthM: 0.25,
        surfaceLoadingRateM3M2D: 1200,
      },
    };
  }

  /**
   * Creates default Vortex Grit Chamber configuration.
   */
  public static createDefaultVortexGrit(): GritDesignConfig {
    return {
      id: 'GRIT-VOR-01',
      name: 'Vortex Mechanical Grit Chamber',
      chamberType: 'VORTEX_GRIT',
      status: 'AUTO_SELECT',
      chamberCount: 2,
      dutyCount: 1,
      standbyCount: 1,
      targetParticleSizeMm: 0.20,
      particleSpecificGravity: 2.65,
      settlingVelocityMps: 0.021,
      gritYieldLPer1000M3: 30,
      gritBulkDensityKgM3: 1500,
      gritMoisturePct: 50,
      volatileOrganicPct: 20,
      vortex: {
        diameterM: 3.2,
        liquidDepthM: 2.6,
        hydraulicLoadingM3M2H: 45.0,
        paddleDrivePowerKw: 1.5,
        vendorModelName: 'Vortex Grit Trap (Vendor Data Required)',
        requiresVendorReview: true,
      },
    };
  }
}
