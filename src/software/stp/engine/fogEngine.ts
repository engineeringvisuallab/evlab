/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 04: Grease & FOG Management Foundation Engine
 * @license Apache-2.0
 */

import { FogDesignConfig, FogHydraulicResult } from '../types/preliminaryPrimary';

export class FogEngine {
  /**
   * Calculates FOG and grease removal, separating measured vs estimated metrics.
   *
   * @param config FOG chamber configuration
   * @param flowLps Design peak flow in L/s
   */
  public static calculateFogRemoval(
    config: FogDesignConfig,
    flowLps: number
  ): FogHydraulicResult {
    const qM3s = Math.max(0.0001, flowLps / 1000);
    const flowM3d = qM3s * 86400;

    const influentFogMgL = config.influentFogConcentrationMgL || 45.0; // Typical 30 - 60 mg/L municipal
    const removalFraction = (config.targetRemovalPct || 70.0) / 100;

    // Influent FOG mass: kg/day = (Q [m3/d] * C [mg/L]) / 1000
    const influentFogKgDay = (flowM3d * influentFogMgL) / 1000;
    const removedFogKgDay = influentFogKgDay * removalFraction;
    const remainingFogConcentrationMgL = influentFogMgL * (1 - removalFraction);

    // Scum Volume: Assuming 10% dry solids in grease scum layer (density ~ 920 kg/m3)
    const scumDensityKgM3 = 920;
    const scumDryFraction = 0.10;
    const scumVolumeM3Day = removedFogKgDay / (scumDensityKgM3 * scumDryFraction);

    const validationMessages: string[] = [];
    if (!config.isMeasuredData) {
      validationMessages.push('FOG influent concentration is based on municipal estimate; field characterization recommended.');
    }
    if (config.targetRemovalPct > 85 && config.fogType === 'PASSIVE_GREASE_TRAP') {
      validationMessages.push('Passive gravity grease trap typically cannot exceed 80% removal efficiency without dissolved air or chemical aid.');
    }

    return {
      removedFogKgDay,
      remainingFogConcentrationMgL,
      scumVolumeM3Day,
      isEstimated: !config.isMeasuredData,
      status: validationMessages.length > 0 ? 'WARNING' : 'OK',
      validationMessages,
    };
  }

  /**
   * Creates default FOG Management configuration.
   */
  public static createDefaultFogConfig(): FogDesignConfig {
    return {
      id: 'FOG-01',
      name: 'Aerated Grease & Scum Skimming Channel',
      fogType: 'SKIMMING_BAFFLE',
      status: 'ON',
      influentFogConcentrationMgL: 40.0,
      isMeasuredData: false, // Explicitly flagged as estimated
      targetRemovalPct: 70.0,
      retentionTimeMin: 4.0,
      skimmerWidthM: 2.0,
      skimmerLengthM: 6.0,
    };
  }
}
