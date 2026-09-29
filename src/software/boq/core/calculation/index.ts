/**
 * EVLab BOQ - Standalone Calculation Engine
 * Pure modular calculation functions completely independent from UI components.
 */

import { BOQItem, RateAnalysis, RateResource, ProjectSettings, FormulaParam } from '../../types';

/**
 * Multiply Quantity * Rate cleanly
 */
export function calculateItemAmount(quantity: number, rate: number): number {
  if (isNaN(quantity) || isNaN(rate)) return 0;
  return Number((quantity * rate).toFixed(2));
}

/**
 * Rate Analysis Breakdown Calculator
 */
export interface RateAnalysisResult {
  materialCost: number;
  labourCost: number;
  equipmentCost: number;
  directCost: number;
  wastageCost: number;
  transportCost: number;
  overheadAmount: number;
  profitAmount: number;
  taxAmount: number;
  finalUnitRate: number;
}

export function calculateRateAnalysisBreakdown(
  resources: RateResource[],
  overheadPct: number = 10,
  profitPct: number = 10,
  taxPct: number = 5,
  transportCost: number = 0
): RateAnalysisResult {
  let materialCost = 0;
  let labourCost = 0;
  let equipmentCost = 0;
  let wastageCost = 0;

  for (const r of resources) {
    const rawCost = (r.quantity || 0) * (r.rate || 0);
    const wastage = rawCost * ((r.wastagePct || 0) / 100);
    const totalResourceCost = rawCost + wastage;

    if (r.category === 'Material') {
      materialCost += rawCost;
      wastageCost += wastage;
    } else if (r.category === 'Labour') {
      labourCost += totalResourceCost;
    } else if (r.category === 'Equipment') {
      equipmentCost += totalResourceCost;
    } else {
      materialCost += totalResourceCost;
    }
  }

  const directCost = materialCost + labourCost + equipmentCost + wastageCost + transportCost;

  const overheadAmount = directCost * (overheadPct / 100);
  const costWithOverhead = directCost + overheadAmount;

  const profitAmount = costWithOverhead * (profitPct / 100);
  const subtotalBeforeTax = costWithOverhead + profitAmount;

  const taxAmount = subtotalBeforeTax * (taxPct / 100);
  const finalUnitRate = Number((subtotalBeforeTax + taxAmount).toFixed(2));

  return {
    materialCost: Number(materialCost.toFixed(2)),
    labourCost: Number(labourCost.toFixed(2)),
    equipmentCost: Number(equipmentCost.toFixed(2)),
    directCost: Number(directCost.toFixed(2)),
    wastageCost: Number(wastageCost.toFixed(2)),
    transportCost: Number(transportCost.toFixed(2)),
    overheadAmount: Number(overheadAmount.toFixed(2)),
    profitAmount: Number(profitAmount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    finalUnitRate,
  };
}

/**
 * Formula Calculator for Quantity Takeoff
 */
export function evaluateFormula(formula: string, params: FormulaParam[]): number {
  if (!formula || formula.trim() === '') return 0;

  let expr = formula;
  for (const p of params) {
    if (!p.name) continue;
    // Replace param variable name with parameter value using regex
    const regex = new RegExp(`\\b${p.name}\\b`, 'g');
    expr = expr.replace(regex, (p.value ?? 0).toString());
  }

  try {
    // Sanitize formula to allow basic mathematical operators only
    const sanitized = expr.replace(/[^0-9.\-/*+()% ]/g, '');
    if (!sanitized.trim()) return 0;
    // Evaluate safely using Function constructor with strict scope
    const fn = new Function(`return (${sanitized});`);
    const result = fn();
    return isNaN(result) || !isFinite(result) ? 0 : Number(result.toFixed(4));
  } catch {
    return 0;
  }
}

/**
 * Overall Project Estimate Calculator
 */
export interface ProjectCostTotals {
  baseBoqTotal: number;
  materialTotal: number;
  labourTotal: number;
  equipmentTotal: number;
  overheadTotal: number;
  profitTotal: number;
  vatTaxTotal: number;
  contingencyTotal: number;
  grandEstimatedCost: number;
}

export function calculateProjectCostTotals(
  items: BOQItem[],
  settings: ProjectSettings
): ProjectCostTotals {
  let baseBoqTotal = 0;
  let materialTotal = 0;
  let labourTotal = 0;
  let equipmentTotal = 0;

  for (const item of items) {
    if (item.isHeader) continue;
    const itemAmount = item.amount || calculateItemAmount(item.quantity, item.rate);
    baseBoqTotal += itemAmount;

    materialTotal += (item.materialRate || 0) * (item.quantity || 0);
    labourTotal += (item.labourRate || 0) * (item.quantity || 0);
    equipmentTotal += (item.equipmentRate || 0) * (item.quantity || 0);
  }

  const overheadTotal = baseBoqTotal * ((settings.overheadPercentage || 0) / 100);
  const profitTotal = baseBoqTotal * ((settings.contractorProfitPercentage || 0) / 100);
  const subtotalWithOverhead = baseBoqTotal + overheadTotal + profitTotal;

  const contingencyTotal = subtotalWithOverhead * ((settings.contingencyPercentage || 0) / 100);
  const vatTaxTotal = (subtotalWithOverhead + contingencyTotal) * ((settings.vatTaxPercentage || 0) / 100);

  const grandEstimatedCost = Number((subtotalWithOverhead + contingencyTotal + vatTaxTotal).toFixed(2));

  return {
    baseBoqTotal: Number(baseBoqTotal.toFixed(2)),
    materialTotal: Number(materialTotal.toFixed(2)),
    labourTotal: Number(labourTotal.toFixed(2)),
    equipmentTotal: Number(equipmentTotal.toFixed(2)),
    overheadTotal: Number(overheadTotal.toFixed(2)),
    profitTotal: Number(profitTotal.toFixed(2)),
    vatTaxTotal: Number(vatTaxTotal.toFixed(2)),
    contingencyTotal: Number(contingencyTotal.toFixed(2)),
    grandEstimatedCost,
  };
}
