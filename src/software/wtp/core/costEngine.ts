import { CalculatedWtpState } from './dependencyEngine';
import { BoqLineItem } from './boqEngine';
import { calculateWtpOpex } from './opexEngine';

export interface RateAnalysisDetail {
  boqItemId: string;
  materialComponentUSD: number;
  labourComponentUSD: number;
  equipmentComponentUSD: number;
  transportComponentUSD: number;
  materialWastagePercent: number;
  wastageCostUSD: number;
  basicRateUSD: number;
  overheadPercent: number;
  overheadUSD: number;
  profitPercent: number;
  profitUSD: number;
  taxPercent: number;
  taxUSD: number;
  finalUnitRateUSD: number;
  rateSource: 'USER_INPUT' | 'PROJECT_DATABASE' | 'IMPORTED_DB' | 'BENCHMARK';
}

export interface MaterialWastageConfig {
  reinforcementSteelPercent: number;
  cementPercent: number;
  concretePercent: number;
  pipesPercent: number;
  cablesPercent: number;
  tilesAndPaintPercent: number;
}

export interface ImportedRateItem {
  itemCode: string;
  description: string;
  unit: string;
  rate: number;
  currency: string;
  effectiveDate: string;
  source: string;
  region: string;
  vendor?: string;
  remarks?: string;
}

export interface WtpCapexSummary {
  civilCapexUSD: number;
  processMechanicalCapexUSD: number;
  pipingAndValvesCapexUSD: number;
  electricalCapexUSD: number;
  instrumentationCapexUSD: number;
  automationCapexUSD: number;
  sludgeAndEnvironmentalCapexUSD: number;
  siteDevelopmentAndRoadsCapexUSD: number;
  engineeringAndSupervisionCapexUSD: number;
  contingencyCapexUSD: number;
  totalCapexUSD: number;
  
  // Cost Metrics
  capexCostPerMldUSD: number;
  capexCostPerM3DayUSD: number;
}

export interface LifeCycleCostResult {
  analysisPeriodYears: number;
  discountRatePercent: number;
  inflationRatePercent: number;
  initialCapexUSD: number;
  annualOpexInitialUSD: number;
  presentValueOfOpexUSD: number;
  majorEquipmentReplacementIntervalYears: number;
  replacementCostUSDPerCycle: number;
  presentValueOfReplacementsUSD: number;
  totalLifeCycleCostUSD: number;
  lccCostPerM3TreatedUSD: number;
}

/**
 * EVL WTP Engineering Suite - Master Cost Engine
 * Handles Rate Analysis, Material Wastage, CAPEX Breakdown, LCC & Rate Import DB.
 */

export const DEFAULT_WASTAGE_CONFIG: MaterialWastageConfig = {
  reinforcementSteelPercent: 5.0,
  cementPercent: 3.0,
  concretePercent: 2.5,
  pipesPercent: 4.0,
  cablesPercent: 5.0,
  tilesAndPaintPercent: 6.0
};

/**
 * Conducts detailed 1st-principles rate analysis for a BOQ line item.
 */
export function calculateRateAnalysis(
  boqItem: BoqLineItem,
  customMarkup?: {
    overheadPct?: number;
    profitPct?: number;
    taxPct?: number;
    wastagePct?: number;
  }
): RateAnalysisDetail {
  const rate = boqItem.unitRateUSD;
  const wastagePct = customMarkup?.wastagePct ?? 3.5;
  const overheadPct = customMarkup?.overheadPct ?? 10.0;
  const profitPct = customMarkup?.profitPct ?? 10.0;
  const taxPct = customMarkup?.taxPct ?? 5.0;

  // Split base rate into components
  const matComp = Number((rate * 0.50).toFixed(2));
  const labComp = Number((rate * 0.25).toFixed(2));
  const eqpComp = Number((rate * 0.15).toFixed(2));
  const trpComp = Number((rate * 0.10).toFixed(2));

  const wastageCost = Number((matComp * (wastagePct / 100)).toFixed(2));
  const basicRate = Number((matComp + labComp + eqpComp + trpComp + wastageCost).toFixed(2));

  const overheadVal = Number((basicRate * (overheadPct / 100)).toFixed(2));
  const profitVal = Number((basicRate * (profitPct / 100)).toFixed(2));
  const taxVal = Number(((basicRate + overheadVal + profitVal) * (taxPct / 100)).toFixed(2));

  const finalRate = Number((basicRate + overheadVal + profitVal + taxVal).toFixed(2));

  return {
    boqItemId: boqItem.id,
    materialComponentUSD: matComp,
    labourComponentUSD: labComp,
    equipmentComponentUSD: eqpComp,
    transportComponentUSD: trpComp,
    materialWastagePercent: wastagePct,
    wastageCostUSD: wastageCost,
    basicRateUSD: basicRate,
    overheadPercent: overheadPct,
    overheadUSD: overheadVal,
    profitPercent: profitPct,
    profitUSD: profitVal,
    taxPercent: taxPct,
    taxUSD: taxVal,
    finalUnitRateUSD: finalRate,
    rateSource: boqItem.remarks.includes('USER') ? 'USER_INPUT' : 'BENCHMARK'
  };
}

/**
 * Computes complete CAPEX summary categorized by trade.
 */
export function calculateCapexSummary(boqItems: BoqLineItem[], plantCapacityMLD: number): WtpCapexSummary {
  let civil = 0;
  let mech = 0;
  let piping = 0;
  let elec = 0;
  let inst = 0;
  let auto = 0;
  let sludge = 0;
  let site = 0;

  boqItems.forEach(item => {
    switch (item.category) {
      case 'Civil':
      case 'Structural':
      case 'Architectural':
        if (item.description.toLowerCase().includes('site') || item.description.toLowerCase().includes('road')) {
          site += item.totalPriceUSD;
        } else {
          civil += item.totalPriceUSD;
        }
        break;
      case 'Mechanical':
      case 'Process':
        mech += item.totalPriceUSD;
        break;
      case 'Piping':
        piping += item.totalPriceUSD;
        break;
      case 'Electrical':
        elec += item.totalPriceUSD;
        break;
      case 'Instrumentation':
        inst += item.totalPriceUSD;
        break;
      case 'Automation':
        auto += item.totalPriceUSD;
        break;
      case 'Sludge':
      case 'Environmental':
        sludge += item.totalPriceUSD;
        break;
      default:
        civil += item.totalPriceUSD;
        break;
    }
  });

  const directCapex = civil + mech + piping + elec + inst + auto + sludge + site;
  const engineeringSupervision = Number((directCapex * 0.08).toFixed(2)); // 8% EPCM
  const contingency = Number((directCapex * 0.05).toFixed(2)); // 5% Contingency
  const totalCapex = Number((directCapex + engineeringSupervision + contingency).toFixed(2));

  const flowM3Day = plantCapacityMLD * 1000;

  return {
    civilCapexUSD: civil,
    processMechanicalCapexUSD: mech,
    pipingAndValvesCapexUSD: piping,
    electricalCapexUSD: elec,
    instrumentationCapexUSD: inst,
    automationCapexUSD: auto,
    sludgeAndEnvironmentalCapexUSD: sludge,
    siteDevelopmentAndRoadsCapexUSD: site,
    engineeringAndSupervisionCapexUSD: engineeringSupervision,
    contingencyCapexUSD: contingency,
    totalCapexUSD: totalCapex,
    capexCostPerMldUSD: Number((totalCapex / plantCapacityMLD).toFixed(2)),
    capexCostPerM3DayUSD: Number((totalCapex / flowM3Day).toFixed(2))
  };
}

/**
 * Calculates Life-Cycle Cost (LCC) using Present Value discount formulation over 20-30 year horizon.
 */
export function calculateLifeCycleCost(
  initialCapexUSD: number,
  annualOpexUSD: number,
  plantCapacityMLD: number,
  options?: {
    analysisPeriodYears?: number;
    discountRatePercent?: number;
    inflationRatePercent?: number;
    replacementIntervalYears?: number;
    replacementCostPercentOfCapex?: number;
  }
): LifeCycleCostResult {
  const period = options?.analysisPeriodYears ?? 25;
  const discountRate = (options?.discountRatePercent ?? 6.0) / 100;
  const inflation = (options?.inflationRatePercent ?? 2.5) / 100;
  const replInterval = options?.replacementIntervalYears ?? 10;
  const replCostPct = (options?.replacementCostPercentOfCapex ?? 15.0) / 100;

  const netDiscountRate = (1 + discountRate) / (1 + inflation) - 1;

  // Cumulative PV of OPEX
  let pvOpex = 0;
  for (let yr = 1; yr <= period; yr++) {
    pvOpex += annualOpexUSD / Math.pow(1 + netDiscountRate, yr);
  }

  // Major Equipment Replacement at interval
  const replacementCostUnit = initialCapexUSD * replCostPct;
  let pvReplacements = 0;
  for (let yr = replInterval; yr < period; yr += replInterval) {
    pvReplacements += replacementCostUnit / Math.pow(1 + netDiscountRate, yr);
  }

  const totalLcc = Number((initialCapexUSD + pvOpex + pvReplacements).toFixed(2));
  const totalWaterVolumeTreated30YearsM3 = plantCapacityMLD * 1000 * 365 * period;
  const lccCostPerM3 = Number((totalLcc / totalWaterVolumeTreated30YearsM3).toFixed(4));

  return {
    analysisPeriodYears: period,
    discountRatePercent: options?.discountRatePercent ?? 6.0,
    inflationRatePercent: options?.inflationRatePercent ?? 2.5,
    initialCapexUSD,
    annualOpexInitialUSD: annualOpexUSD,
    presentValueOfOpexUSD: Number(pvOpex.toFixed(2)),
    majorEquipmentReplacementIntervalYears: replInterval,
    replacementCostUSDPerCycle: Number(replacementCostUnit.toFixed(2)),
    presentValueOfReplacementsUSD: Number(pvReplacements.toFixed(2)),
    totalLifeCycleCostUSD: totalLcc,
    lccCostPerM3TreatedUSD: lccCostPerM3
  };
}

/**
 * Currency conversion tool (Rule 11)
 */
export function convertCurrency(
  amountUsd: number,
  targetCurrency: 'USD' | 'BDT' | 'EUR' | 'GBP',
  customExchangeRate?: number
): { currency: string; rate: number; convertedAmount: number } {
  const rates: Record<string, number> = {
    USD: 1.0,
    BDT: customExchangeRate || 118.0,
    EUR: customExchangeRate || 0.92,
    GBP: customExchangeRate || 0.78
  };

  const r = rates[targetCurrency] || 1.0;
  return {
    currency: targetCurrency,
    rate: r,
    convertedAmount: Number((amountUsd * r).toFixed(2))
  };
}
