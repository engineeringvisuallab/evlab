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
    const bodToTkn = tkn > 0 ? Number((bod5 / tkn).toFixed(2)) : 5.0;
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
      bodToTkn,
      vssToTss,
      alkToTkn,
      biodegradability,
      denitrificationFeasibility,
      ebprFeasibility,
      alkalinityFeasibility,
    };
  }

  /**
   * Splits total COD into readily-biodegradable (rbCOD), slowly-biodegradable
   * (sbCOD), and inert (iCOD) fractions using standard municipal wastewater
   * proportions (20% / 60% / 20% of total COD), and reports the combined
   * biodegradable COD (bCOD = rbCOD + sbCOD). Falls back to a BOD5-derived
   * COD estimate (COD ≈ BOD5 × 1.8) when total COD is not yet available.
   */
  public static calculateCodFractionation(
    codTotal: number,
    bod5: number
  ): { rbCOD: number; sbCOD: number; iCOD: number; bCOD: number } {
    const total = codTotal > 0 ? codTotal : bod5 * 1.8;
    const rbCOD = Number((total * 0.2).toFixed(1));
    const sbCOD = Number((total * 0.6).toFixed(1));
    const iCOD = Number((total * 0.2).toFixed(1));
    const bCOD = Number((rbCOD + sbCOD).toFixed(1));

    return { rbCOD, sbCOD, iCOD, bCOD };
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
}
