/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 04: Primary Sludge Generation & Organic Mass Balance Engine
 * @license Apache-2.0
 */

import { PrimaryClarifierDesignConfig, PrimarySludgeResult } from '../types/preliminaryPrimary';

export class PrimarySludgeEngine {
  /**
   * Calculates deterministic primary sludge mass, wet volume, pumping frequency,
   * and organic (BOD/COD) mass reductions.
   *
   * @param config Primary clarifier design configuration
   * @param flowAvgLps Average wastewater inflow in L/s
   * @param influentTssMgL Influent TSS in mg/L
   * @param influentBodMgL Influent BOD in mg/L
   * @param influentCodMgL Influent COD in mg/L
   */
  public static calculatePrimarySludge(
    config: PrimaryClarifierDesignConfig,
    flowAvgLps: number,
    influentTssMgL: number = 300.0,
    influentBodMgL: number = 250.0,
    influentCodMgL: number = 500.0
  ): PrimarySludgeResult {
    const qAvgM3d = Math.max(0.1, (flowAvgLps / 1000) * 86400);

    // 1. TSS Mass Balance & Sludge Production
    const influentTssKgDay = (qAvgM3d * influentTssMgL) / 1000;
    const tssRemovalFraction = (config.expectedTssRemovalPct || 60.0) / 100;
    const tssRemovedKgDay = influentTssKgDay * tssRemovalFraction;

    const primaryDrySolidsKgDay = tssRemovedKgDay;

    // Sludge Volume calculation: V_sludge = Dry Solids / (Density * (Solids Conc / 100))
    // Primary sludge specific gravity is typically 1.025 to 1.03 (1025 kg/m3)
    const sludgeConcentrationFraction = (config.sludgeConcentrationPct || 4.0) / 100;
    const sludgeDensityKgM3 = (config.sludgeSpecificGravity || 1.025) * 1000;

    const primaryWetSludgeM3Day =
      primaryDrySolidsKgDay / (sludgeDensityKgM3 * sludgeConcentrationFraction);

    const sludgeMoisturePct = (1 - sludgeConcentrationFraction) * 100;

    // Pumping & Withdrawal Frequency
    // Typically withdrawn 4 to 6 times daily in automated cycles (e.g. 15-20 min per cycle)
    const sludgeWithdrawalCyclesPerDay = 4;
    const volumePerCycleM3 = primaryWetSludgeM3Day / sludgeWithdrawalCyclesPerDay;
    const pumpingDurationMin = 20; // 20 minutes pumping duration per cycle
    const sludgePumpingRateM3Hr = (volumePerCycleM3 / (pumpingDurationMin / 60));

    // Hopper sizing: Hopper should hold at least 6 hours of sludge accumulation
    const sludgeHopperVolumeM3 = (primaryWetSludgeM3Day / 24) * 6.0;
    const sludgeStorageHours = 6.0;

    // 2. BOD & COD Organic Mass Reductions
    const influentBodKgDay = (qAvgM3d * influentBodMgL) / 1000;
    const bodRemovalFraction = (config.expectedBodRemovalPct || 35.0) / 100;
    const bodRemovedKgDay = influentBodKgDay * bodRemovalFraction;
    const effluentBodKgDay = influentBodKgDay - bodRemovedKgDay;
    const effluentBod5ConcentrationMgL = influentBodMgL * (1 - bodRemovalFraction);

    const influentCodKgDay = (qAvgM3d * influentCodMgL) / 1000;
    const codRemovalFraction = (config.expectedCodRemovalPct || 35.0) / 100;
    const codRemovedKgDay = influentCodKgDay * codRemovalFraction;
    const effluentCodKgDay = influentCodKgDay - codRemovedKgDay;
    const effluentCodConcentrationMgL = influentCodMgL * (1 - codRemovalFraction);

    const effluentTssConcentrationMgL = influentTssMgL * (1 - tssRemovalFraction);
    const primaryVolatileSolidsKgDay = primaryDrySolidsKgDay * ((config.expectedVssRemovalPct || 65.0) / 100 * 1.1);

    return {
      influentTssKgDay,
      tssRemovedKgDay,
      primaryDrySolidsKgDay,
      primaryVolatileSolidsKgDay,
      primaryWetSludgeM3Day,
      sludgeMoisturePct,
      sludgePumpingRateM3Hr,
      sludgeWithdrawalCyclesPerDay,
      sludgeHopperVolumeM3,
      sludgeStorageHours,
      influentBodKgDay,
      bodRemovedKgDay,
      effluentBodKgDay,
      effluentBod5ConcentrationMgL,
      influentCodKgDay,
      codRemovedKgDay,
      effluentCodKgDay,
      effluentCodConcentrationMgL,
      effluentTssConcentrationMgL,
      status: 'OK',
    };
  }
}
