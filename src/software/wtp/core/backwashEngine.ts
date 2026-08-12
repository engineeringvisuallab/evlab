/**
 * WTP Engineering Suite - Phase 09
 * Backwash Water Engine, Water Recovery, Recycle Systems, Membrane Reject, CIP & Liquid Waste Balance
 */

import { CalculatedWtpState } from './dependencyEngine';

export interface BackwashWaterResult {
  numberOfFilters: number;
  filterAreaM2: number;
  backwashRateM3M2Hr: number;
  backwashDurationMin: number;
  backwashVolumePerFilterM3: number;
  backwashSequencesPerDay: number;
  totalDailyBackwashVolumeM3Day: number;
  airScourFlowM3M2Hr: number;
  airScourDurationMin: number;
  rinseVolumePerFilterM3: number;
  totalDailyRinseVolumeM3Day: number;
  totalDailyFilterWasteM3Day: number;
  filterWastePercentOfPlantFlow: number;
}

export interface BackwashRecoveryResult {
  totalDailyBackwashWasteM3Day: number;
  recoveryTargetPercent: number;
  recycledWaterFlowM3Day: number;
  recycledWaterFlowM3Hr: number;
  recycledTssKgDay: number;
  recycleSolidsImpactOnRawTssMgL: number;
  netDischargeToWasteM3Day: number;
  netPlantWaterRecoveryPercent: number;
}

export interface MembraneRejectResult {
  feedFlowM3Day: number;
  permeateFlowM3Day: number;
  recoveryPercent: number;
  rejectFlowM3Day: number;
  rejectFlowM3Hr: number;
  feedTdsMgL: number;
  rejectTdsMgL: number;
  dailySaltLoadKgDay: number;
  recommendedDisposalOption: string;
}

export interface CipAndChemicalWasteResult {
  cipFrequencyDays: number;
  cipBatchVolumeM3: number;
  dailyCipWasteM3Day: number;
  acidVolumeLitersPerCip: number;
  causticVolumeLitersPerCip: number;
  neutralizationAcidCausticDoseKg: number;
  neutralizedWastePh: number;
  neutralizationTankVolumeM3: number;
}

export interface LiquidWasteBalance {
  totalRawWaterInM3Day: number;
  productWaterM3Day: number;
  backwashWasteM3Day: number;
  clarifierSludgeWasteM3Day: number;
  membraneRejectM3Day: number;
  cipAndChemicalWasteM3Day: number;
  totalWastewaterGeneratedM3Day: number;
  recycledWaterM3Day: number;
  netDischargedWastewaterM3Day: number;
  netOverallPlantRecoveryPercent: number;
}

/**
 * 1. Calculate Rapid Gravity Filter Backwash Water & Air Scour Sizing
 */
export function calculateFilterBackwashWater(
  state: CalculatedWtpState,
  backwashRateM3M2Hr: number = 36.0,
  backwashDurationMin: number = 10,
  backwashesPerFilterPerDay: number = 1,
  airScourRateM3M2Hr: number = 55.0,
  airScourDurationMin: number = 4
): BackwashWaterResult {
  const numFilters = state.numberOfFilters || 6;
  const filterArea = state.areaPerFilterM2 || 40.0;
  const plantCapacityM3Day = (state.plantCapacityMLD || 50) * 1000;

  // Backwash water volume per filter run = Area * Rate * (Duration / 60)
  const bwVolPerFilter = filterArea * backwashRateM3M2Hr * (backwashDurationMin / 60);
  const totalBwVolDay = bwVolPerFilter * numFilters * backwashesPerFilterPerDay;

  // Rinse (filter-to-waste) volume: 5 mins at normal filtration rate (6 m3/m2-hr)
  const rinseRate = state.filtrationRateM3M2Hr || 6.0;
  const rinseVolPerFilter = filterArea * rinseRate * (5 / 60);
  const totalRinseVolDay = rinseVolPerFilter * numFilters * backwashesPerFilterPerDay;

  const totalFilterWasteDay = totalBwVolDay + totalRinseVolDay;
  const wastePercent = (totalFilterWasteDay / plantCapacityM3Day) * 100;

  return {
    numberOfFilters: numFilters,
    filterAreaM2: filterArea,
    backwashRateM3M2Hr,
    backwashDurationMin,
    backwashVolumePerFilterM3: Number(bwVolPerFilter.toFixed(1)),
    backwashSequencesPerDay: numFilters * backwashesPerFilterPerDay,
    totalDailyBackwashVolumeM3Day: Number(totalBwVolDay.toFixed(1)),
    airScourFlowM3M2Hr: airScourRateM3M2Hr,
    airScourDurationMin,
    rinseVolumePerFilterM3: Number(rinseVolPerFilter.toFixed(1)),
    totalDailyRinseVolumeM3Day: Number(totalRinseVolDay.toFixed(1)),
    totalDailyFilterWasteM3Day: Number(totalFilterWasteDay.toFixed(1)),
    filterWastePercentOfPlantFlow: Number(wastePercent.toFixed(2))
  };
}

/**
 * 2. Calculate Backwash Recovery & Controlled Recycle System
 */
export function calculateBackwashRecovery(
  totalFilterWasteM3Day: number,
  recoveryTargetPercent: number = 95.0,
  plantCapacityMLD: number = 50,
  tssInBackwashMgL: number = 600
): BackwashRecoveryResult {
  const plantFlowM3Day = plantCapacityMLD * 1000;
  const recycledFlowM3Day = totalFilterWasteM3Day * (recoveryTargetPercent / 100);
  const recycledFlowM3Hr = recycledFlowM3Day / 24;

  const recycledTssKgDay = (recycledFlowM3Day * (tssInBackwashMgL * 0.15)) / 1000; // 85% solids settled in recovery basin
  const tssImpactMgL = (recycledTssKgDay * 1000) / plantFlowM3Day;

  const netDischargeM3Day = totalFilterWasteM3Day - recycledFlowM3Day;
  const netPlantRecovery = ((plantFlowM3Day - netDischargeM3Day) / plantFlowM3Day) * 100;

  return {
    totalDailyBackwashWasteM3Day: totalFilterWasteM3Day,
    recoveryTargetPercent,
    recycledWaterFlowM3Day: Number(recycledFlowM3Day.toFixed(1)),
    recycledWaterFlowM3Hr: Number(recycledFlowM3Hr.toFixed(2)),
    recycledTssKgDay: Number(recycledTssKgDay.toFixed(1)),
    recycleSolidsImpactOnRawTssMgL: Number(tssImpactMgL.toFixed(2)),
    netDischargeToWasteM3Day: Number(netDischargeM3Day.toFixed(1)),
    netPlantWaterRecoveryPercent: Number(netPlantRecovery.toFixed(2))
  };
}

/**
 * 3. Calculate Membrane Reject / Brine Stream
 */
export function calculateMembraneReject(
  feedFlowM3Day: number,
  recoveryPercent: number = 85.0,
  feedTdsMgL: number = 350
): MembraneRejectResult {
  const permeateFlow = feedFlowM3Day * (recoveryPercent / 100);
  const rejectFlow = feedFlowM3Day - permeateFlow;
  const rejectTds = feedTdsMgL / (1 - recoveryPercent / 100);
  const dailySaltLoadKgDay = (rejectFlow * rejectTds) / 1000;

  return {
    feedFlowM3Day,
    permeateFlowM3Day: Number(permeateFlow.toFixed(1)),
    recoveryPercent,
    rejectFlowM3Day: Number(rejectFlow.toFixed(1)),
    rejectFlowM3Hr: Number((rejectFlow / 24).toFixed(2)),
    feedTdsMgL,
    rejectTdsMgL: Number(rejectTds.toFixed(1)),
    dailySaltLoadKgDay: Number(dailySaltLoadKgDay.toFixed(1)),
    recommendedDisposalOption: 'Evaporation Pond / Surface Water Discharge with Environmental Permit'
  };
}

/**
 * 4. Calculate CIP & Chemical Waste Neutralization
 */
export function calculateCipAndChemicalWaste(
  cipFrequencyDays: number = 30,
  cipBatchVolumeM3: number = 25.0
): CipAndChemicalWasteResult {
  const dailyCipWaste = cipBatchVolumeM3 / cipFrequencyDays;
  const acidLiters = 250; // 33% HCl
  const causticLiters = 280; // 30% NaOH

  return {
    cipFrequencyDays,
    cipBatchVolumeM3,
    dailyCipWasteM3Day: Number(dailyCipWaste.toFixed(2)),
    acidVolumeLitersPerCip: acidLiters,
    causticVolumeLitersPerCip: causticLiters,
    neutralizationAcidCausticDoseKg: 120,
    neutralizedWastePh: 7.0,
    neutralizationTankVolumeM3: cipBatchVolumeM3 * 1.25 // 25% freeboard
  };
}

/**
 * 5. Master Liquid Waste Balance Across Entire Plant
 */
export function calculateMasterLiquidWasteBalance(
  plantCapacityMLD: number,
  backwashWaste: BackwashWaterResult,
  recovery: BackwashRecoveryResult,
  wetSludgeM3Day: number
): LiquidWasteBalance {
  const rawWaterInM3Day = plantCapacityMLD * 1000;
  const membraneRejectM3Day = 0; // standard conventional WTP
  const cipWasteM3Day = 0.83;

  const totalWastewater = backwashWaste.totalDailyFilterWasteM3Day + wetSludgeM3Day + cipWasteM3Day;
  const netDischarged = totalWastewater - recovery.recycledWaterFlowM3Day;
  const productWater = rawWaterInM3Day - netDischarged;
  const netPlantRecovery = (productWater / rawWaterInM3Day) * 100;

  return {
    totalRawWaterInM3Day: rawWaterInM3Day,
    productWaterM3Day: Number(productWater.toFixed(1)),
    backwashWasteM3Day: backwashWaste.totalDailyFilterWasteM3Day,
    clarifierSludgeWasteM3Day: wetSludgeM3Day,
    membraneRejectM3Day,
    cipAndChemicalWasteM3Day: cipWasteM3Day,
    totalWastewaterGeneratedM3Day: Number(totalWastewater.toFixed(1)),
    recycledWaterM3Day: recovery.recycledWaterFlowM3Day,
    netDischargedWastewaterM3Day: Number(netDischarged.toFixed(1)),
    netOverallPlantRecoveryPercent: Number(netPlantRecovery.toFixed(2))
  };
}
