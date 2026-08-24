/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 02 Wastewater Quality & Characterization Engine
 * @license Apache-2.0
 */

import { CODComponents, InfluentQuality, QualityRatios } from '../types/stp';

export class WastewaterQualityEngine {
  /**
   * Computes COD Component Fractionation:
   * COD_tot = COD_sol + COD_part
   * COD_biodegradable = BOD5 * 1.5 (or COD_tot - COD_inert)
   */
  public static calculateCODFractions(bod5: number, codTotal: number, codSoluble?: number, codInert?: number): CODComponents {
    const total = Math.max(bod5 * 1.2, codTotal);
    const sol = codSoluble && codSoluble > 0 ? Math.min(total * 0.9, codSoluble) : Math.round(total * 0.45);
    const inert = codInert && codInert > 0 ? Math.min(total * 0.3, codInert) : Math.round(total * 0.12);
    const part = total - sol;
    const bio = Math.max(0, total - inert);

    return {
      codTotal: Math.round(total),
      codSoluble: Math.round(sol),
      codInert: Math.round(inert),
      codParticulate: Math.round(part),
      codBiodegradable: Math.round(bio),
    };
  }

  /**
   * Calculates key wastewater quality ratios and evaluates process feasibility.
   */
  public static calculateQualityRatios(
    bod5: number,
    cod: number,
    tss: number,
    vss: number,
    tkn: number,
    tp: number,
    alkalinity: number
  ): QualityRatios {
    const bodToCod = cod > 0 ? Number((bod5 / cod).toFixed(3)) : 0.5;
    const codToTkn = tkn > 0 ? Number((cod / tkn).toFixed(2)) : 10.0;
    const bodToTp = tp > 0 ? Number((bod5 / tp).toFixed(2)) : 30.0;
    const vssToTss = tss > 0 ? Number((vss / tss).toFixed(3)) : 0.8;
    const alkToTkn = tkn > 0 ? Number((alkalinity / tkn).toFixed(2)) : 5.0;

    // 1. Biodegradability Classification
    let biodegradability: QualityRatios['biodegradability'] = 'MODERATE';
    if (bodToCod >= 0.45) {
      biodegradability = 'HIGHLY_BIODEGRADABLE';
    } else if (bodToCod < 0.3) {
      biodegradability = 'REFRACTORY_TOXIC';
    }

    // 2. Denitrification Feasibility (Carbon Availability)
    // Stoichiometric requirement ~ 8.6 g COD / g TKN nitrified for complete denitrification
    let denitrificationFeasibility: QualityRatios['denitrificationFeasibility'] = 'SUFFICIENT';
    if (codToTkn >= 10.0) {
      denitrificationFeasibility = 'EXCELLENT';
    } else if (codToTkn < 7.0) {
      denitrificationFeasibility = 'CARBON_DEFICIENT';
    }

    // 3. Biological Phosphorus Removal (EBPR) Feasibility
    // Requires BOD5 / TP > 20 - 25 for bio-P without chemical dosing
    let ebprFeasibility: QualityRatios['ebprFeasibility'] = 'MODERATE';
    if (bodToTp >= 25.0) {
      ebprFeasibility = 'HIGH';
    } else if (bodToTp < 15.0) {
      ebprFeasibility = 'LOW';
    }

    // 4. Nitrification Alkalinity Feasibility
    // Nitrification consumes 7.14 g CaCO3 per g NH4-N nitrified. Residual alk > 80 mg/L required.
    // Required Alk = TKN * 7.14 + 80 mg/L
    const requiredAlk = tkn * 7.14 + 80;
    const alkalinityFeasibility: QualityRatios['alkalinityFeasibility'] =
      alkalinity >= requiredAlk ? 'SUFFICIENT' : 'DEFICIENT_NEED_LIME';

    return {
      bodToCod,
      codToTkn,
      bodToTp,
      vssToTss,
      alkToTkn,
      biodegradability,
      denitrificationFeasibility,
      ebprFeasibility,
      alkalinityFeasibility,
    };
  }

  /**
   * Evaluates overall C:N:P Stoichiometric Balance (Ideal BOD : N : P = 100 : 5 : 1)
   */
  public static evaluateCNPBalance(bod5: number, tkn: number, tp: number): {
    bodRatio: number;
    nRatio: number;
    pRatio: number;
    balanceSummary: string;
    isDeficient: boolean;
  } {
    const bodBase = Math.max(1, bod5);
    const nRatio = Number(((tkn / bodBase) * 100).toFixed(1));
    const pRatio = Number(((tp / bodBase) * 100).toFixed(1));

    let balanceSummary = 'Optimal carbon, nitrogen, and phosphorus balance for biological treatment.';
    let isDeficient = false;

    if (nRatio < 3.0) {
      balanceSummary = 'Nitrogen deficient (N < 3 per 100 BOD). May require urea or ammonium dosing.';
      isDeficient = true;
    } else if (pRatio < 0.5) {
      balanceSummary = 'Phosphorus deficient (P < 0.5 per 100 BOD). May require phosphoric acid dosing.';
      isDeficient = true;
    } else if (nRatio > 15.0) {
      balanceSummary = 'High nitrogen load relative to organic carbon. Biological denitrification required.';
    }

    return {
      bodRatio: 100,
      nRatio,
      pRatio,
      balanceSummary,
      isDeficient,
    };
  }

  /**
   * Performs complete influent quality characterization update on project state.
   */
  public static analyzeInfluentQuality(influent: InfluentQuality): {
    codFractions: CODComponents;
    ratios: QualityRatios;
    cnp: ReturnType<typeof WastewaterQualityEngine.evaluateCNPBalance>;
  } {
    const bod = influent.bod5.designValue;
    const cod = influent.cod.designValue;
    const codSol = influent.codSoluble?.designValue;
    const codInert = influent.codInert?.designValue;
    const tss = influent.tss.designValue;
    const vss = influent.vss.designValue;
    const tkn = influent.tkn.designValue;
    const tp = influent.tp.designValue;
    const alk = influent.alkalinity.designValue;

    const codFractions = this.calculateCODFractions(bod, cod, codSol, codInert);
    const ratios = this.calculateQualityRatios(bod, cod, tss, vss, tkn, tp, alk);
    const cnp = this.evaluateCNPBalance(bod, tkn, tp);

    // Sync computed results back into influent model
    influent.codFractions = codFractions;
    influent.ratios = ratios;

    return { codFractions, ratios, cnp };
  }

  /**
   * Factory providing standard default municipal raw influent quality.
   */
  public static createDefaultInfluentQuality(): InfluentQuality {
    return {
      flowM3d: { min: 4500, avg: 12826, max: 30154, designValue: 12826, unit: 'm3/day', isAssumed: false, source: 'Calculated ADWF' },
      bod5: { min: 180, avg: 250, max: 380, designValue: 250, unit: 'mg/L', isAssumed: true, source: 'Metcalf & Eddy Domestic Sewage' },
      cod: { min: 320, avg: 450, max: 700, designValue: 450, unit: 'mg/L', isAssumed: true, source: 'Metcalf & Eddy Domestic Sewage' },
      codSoluble: { min: 120, avg: 200, max: 310, designValue: 200, unit: 'mg/L', isAssumed: true, source: '0.45 x Total COD' },
      codInert: { min: 20, avg: 50, max: 90, designValue: 50, unit: 'mg/L', isAssumed: true, source: 'Respirometric Estimate' },
      toc: { min: 80, avg: 140, max: 220, designValue: 140, unit: 'mg/L', isAssumed: true, source: 'Assumed Ratio' },
      tss: { min: 180, avg: 280, max: 450, designValue: 280, unit: 'mg/L', isAssumed: true, source: 'Domestic Sewage Average' },
      vss: { min: 140, avg: 224, max: 360, designValue: 224, unit: 'mg/L', isAssumed: true, source: '0.8 x TSS' },
      tds: { min: 300, avg: 500, max: 800, designValue: 500, unit: 'mg/L', isAssumed: true, source: 'Municipal Supply TDS' },
      tn: { min: 25, avg: 48, max: 75, designValue: 48, unit: 'mg/L', isAssumed: true, source: 'TKN + NO3' },
      tkn: { min: 25, avg: 45, max: 70, designValue: 45, unit: 'mg/L', isAssumed: true, source: 'Domestic Sewage Average' },
      nh3n: { min: 15, avg: 30, max: 50, designValue: 30, unit: 'mg/L', isAssumed: true, source: 'Domestic Sewage Average' },
      no3n: { min: 0, avg: 1.0, max: 3.0, designValue: 1.0, unit: 'mg/L', isAssumed: true, source: 'Traces' },
      orgN: { min: 8, avg: 15, max: 25, designValue: 15, unit: 'mg/L', isAssumed: true, source: 'TKN - NH3' },
      tp: { min: 4.0, avg: 8.0, max: 14.0, designValue: 8.0, unit: 'mg/L', isAssumed: true, source: 'Detergent Contribution' },
      po4p: { min: 2.0, avg: 5.0, max: 9.0, designValue: 5.0, unit: 'mg/L', isAssumed: true, source: 'Orthophosphate Ratio' },
      alkalinity: { min: 150, avg: 250, max: 400, designValue: 250, unit: 'mg/L', isAssumed: true, source: 'Carbonate Hardness' },
      ph: { min: 6.8, avg: 7.4, max: 8.2, designValue: 7.4, unit: '-', isAssumed: false, source: 'Measured Field Probe' },
      temperature: { min: 12.0, avg: 24.0, max: 32.0, designValue: 18.0, unit: '°C', isAssumed: false, source: 'Winter Minimum Design' },
      tempMax: { min: 22.0, avg: 30.0, max: 38.0, designValue: 32.0, unit: '°C', isAssumed: false, source: 'Summer Maximum Design' },
      do: { min: 0.0, avg: 0.5, max: 2.0, designValue: 0.5, unit: 'mg/L', isAssumed: true, source: 'Septic Sewer Influent' },
      oilAndGrease: { min: 15, avg: 35, max: 80, designValue: 35, unit: 'mg/L', isAssumed: true, source: 'Kitchen Waste Contribution' },
      fecalColiform: { min: 1e5, avg: 1e7, max: 1e8, designValue: 1e7, unit: 'MPN/100mL', isAssumed: true, source: 'Domestic Sewage Standard' },
      codFractions: {
        codTotal: 450,
        codSoluble: 200,
        codInert: 50,
        codParticulate: 200,
        codBiodegradable: 400,
      },
      ratios: {
        bodToCod: 0.556,
        codToTkn: 10.0,
        bodToTp: 31.25,
        vssToTss: 0.8,
        alkToTkn: 5.56,
        biodegradability: 'HIGHLY_BIODEGRADABLE',
        denitrificationFeasibility: 'SUFFICIENT',
        ebprFeasibility: 'HIGH',
        alkalinityFeasibility: 'SUFFICIENT',
      },
      samplingConfidence: {
        sampleCount: 24,
        dataQualityFlag: 'MUNICIPAL_DEFAULT',
        confidenceIntervalPct: 90,
        lastUpdated: '2026-01-01',
      },
    };
  }
}
