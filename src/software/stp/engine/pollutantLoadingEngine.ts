/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 02 Pollutant Loading Engine & Industrial Mass Blending
 * @license Apache-2.0
 */

import { DesignBasis, DesignStageFlows, IndustrialProfile, InfluentQuality } from '../types/stp';
import { DesignBasisEngine } from './designBasisEngine';

export interface PollutantMassSummary {
  parameter: string;
  unit: string;
  concentrationMgL: number;
  adwfMassKgD: number;
  pwwfMassKgD: number;
  annualMassTonsYr: number;
  peakHourMassKgH: number;
}

export interface BlendedInfluentQuality {
  totalFlowM3d: number;
  bod5MgL: number;
  codMgL: number;
  tssMgL: number;
  tknMgL: number;
  tpMgL: number;
  domesticFlowPct: number;
  industrialFlowPct: number;
  industrialBodPct: number;
  industrialTssPct: number;
  industrialTknPct: number;
  toxicityRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  heavyMetalsPresent: boolean;
}

export class PollutantLoadingEngine {
  /**
   * Calculates Daily, Annual, and Peak Hour Mass Loading for a given flow and concentration.
   * Mass (kg/day) = Flow (m3/day) * Concentration (mg/L) / 1000
   */
  public static calculateMassLoad(
    parameter: string,
    concentrationMgL: number,
    adwfM3d: number,
    pwwfM3d: number,
    peakFactor: number = 2.25
  ): PollutantMassSummary {
    const adwfMassKgD = (adwfM3d * concentrationMgL) / 1000;
    const pwwfMassKgD = (pwwfM3d * concentrationMgL) / 1000;
    const annualMassTonsYr = (adwfMassKgD * 365) / 1000;
    const peakHourMassKgH = (adwfMassKgD * peakFactor) / 24;

    return {
      parameter,
      unit: 'kg/day',
      concentrationMgL,
      adwfMassKgD: Number(adwfMassKgD.toFixed(1)),
      pwwfMassKgD: Number(pwwfMassKgD.toFixed(1)),
      annualMassTonsYr: Number(annualMassTonsYr.toFixed(1)),
      peakHourMassKgH: Number(peakHourMassKgH.toFixed(2)),
    };
  }

  /**
   * Performs Mass Conservation Blending of Domestic Sanitary Wastewater and Industrial Discharges:
   * C_blended = sum(Q_i * C_i) / sum(Q_i)
   */
  public static blendIndustrialDischarges(
    sanitaryFlowM3d: number,
    domBod: number,
    domCod: number,
    domTss: number,
    domTkn: number,
    domTp: number,
    industrialProfiles: IndustrialProfile[] = []
  ): BlendedInfluentQuality {
    let totalIndFlow = 0;
    let indBodMass = 0;
    let indCodMass = 0;
    let indTssMass = 0;
    let indTknMass = 0;
    let indTpMass = 0;
    let heavyMetalsPresent = false;
    let highToxicityCount = 0;

    industrialProfiles.forEach((ind) => {
      totalIndFlow += ind.flowM3d;
      indBodMass += (ind.flowM3d * ind.bod5MgL) / 1000;
      indCodMass += (ind.flowM3d * ind.codMgL) / 1000;
      indTssMass += (ind.flowM3d * ind.tssMgL) / 1000;
      indTknMass += (ind.flowM3d * ind.tknMgL) / 1000;
      indTpMass += (ind.flowM3d * ind.tpMgL) / 1000;

      if (ind.heavyMetalsPresent) heavyMetalsPresent = true;
      if (ind.toxicityRisk === 'HIGH') highToxicityCount++;
    });

    const totalFlowM3d = sanitaryFlowM3d + totalIndFlow;
    if (totalFlowM3d <= 0) {
      return {
        totalFlowM3d: 0,
        bod5MgL: domBod,
        codMgL: domCod,
        tssMgL: domTss,
        tknMgL: domTkn,
        tpMgL: domTp,
        domesticFlowPct: 100,
        industrialFlowPct: 0,
        industrialBodPct: 0,
        industrialTssPct: 0,
        industrialTknPct: 0,
        toxicityRisk: 'LOW',
        heavyMetalsPresent: false,
      };
    }

    const domBodMass = (sanitaryFlowM3d * domBod) / 1000;
    const domCodMass = (sanitaryFlowM3d * domCod) / 1000;
    const domTssMass = (sanitaryFlowM3d * domTss) / 1000;
    const domTknMass = (sanitaryFlowM3d * domTkn) / 1000;
    const domTpMass = (sanitaryFlowM3d * domTp) / 1000;

    const totalBodMass = domBodMass + indBodMass;
    const totalCodMass = domCodMass + indCodMass;
    const totalTssMass = domTssMass + indTssMass;
    const totalTknMass = domTknMass + indTknMass;
    const totalTpMass = domTpMass + indTpMass;

    const blendedBod = (totalBodMass * 1000) / totalFlowM3d;
    const blendedCod = (totalCodMass * 1000) / totalFlowM3d;
    const blendedTss = (totalTssMass * 1000) / totalFlowM3d;
    const blendedTkn = (totalTknMass * 1000) / totalFlowM3d;
    const blendedTp = (totalTpMass * 1000) / totalFlowM3d;

    const industrialFlowPct = (totalIndFlow / totalFlowM3d) * 100;
    const industrialBodPct = totalBodMass > 0 ? (indBodMass / totalBodMass) * 100 : 0;
    const industrialTssPct = totalTssMass > 0 ? (indTssMass / totalTssMass) * 100 : 0;
    const industrialTknPct = totalTknMass > 0 ? (indTknMass / totalTknMass) * 100 : 0;

    let toxicityRisk: BlendedInfluentQuality['toxicityRisk'] = 'LOW';
    if (highToxicityCount > 0 || heavyMetalsPresent) {
      toxicityRisk = highToxicityCount > 1 ? 'HIGH' : 'MEDIUM';
    }

    return {
      totalFlowM3d: Math.round(totalFlowM3d),
      bod5MgL: Math.round(blendedBod),
      codMgL: Math.round(blendedCod),
      tssMgL: Math.round(blendedTss),
      tknMgL: Math.round(blendedTkn),
      tpMgL: Number(blendedTp.toFixed(1)),
      domesticFlowPct: Number((100 - industrialFlowPct).toFixed(1)),
      industrialFlowPct: Number(industrialFlowPct.toFixed(1)),
      industrialBodPct: Number(industrialBodPct.toFixed(1)),
      industrialTssPct: Number(industrialTssPct.toFixed(1)),
      industrialTknPct: Number(industrialTknPct.toFixed(1)),
      toxicityRisk,
      heavyMetalsPresent,
    };
  }

  /**
   * Generates Staged Mass Loading Schedule across Design Horizons (Immediate, Intermediate, Ultimate).
   */
  public static calculateStagedLoads(
    designBasis: DesignBasis,
    quality: InfluentQuality
  ): DesignStageFlows[] {
    const presentYear = designBasis.presentYear || new Date().getFullYear();

    const stages: { name: 'IMMEDIATE' | 'INTERMEDIATE' | 'ULTIMATE'; horizonYears: number; pop: number }[] = [
      { name: 'IMMEDIATE', horizonYears: 0, pop: designBasis.immediatePopulation || designBasis.presentPopulation },
      {
        name: 'INTERMEDIATE',
        horizonYears: designBasis.intermediateHorizonYears || 15,
        pop: designBasis.intermediatePopulation || Math.round((designBasis.presentPopulation + designBasis.designPopulation) / 2),
      },
      { name: 'ULTIMATE', horizonYears: designBasis.designHorizonYears || 30, pop: designBasis.designPopulation },
    ];

    return stages.map((s) => {
      const flows = DesignBasisEngine.calculateCompleteFlows(s.pop, designBasis);
      const bodConc = quality.bod5.designValue;
      const codConc = quality.cod.designValue;
      const tssConc = quality.tss.designValue;
      const tknConc = quality.tkn.designValue;
      const tpConc = quality.tp.designValue;

      const bodMassKgD = (flows.adwfM3d * bodConc) / 1000;
      const codMassKgD = (flows.adwfM3d * codConc) / 1000;
      const tssMassKgD = (flows.adwfM3d * tssConc) / 1000;
      const tknMassKgD = (flows.adwfM3d * tknConc) / 1000;
      const tpMassKgD = (flows.adwfM3d * tpConc) / 1000;

      return {
        stageName: s.name,
        horizonYear: presentYear + s.horizonYears,
        population: s.pop,
        adwfM3d: flows.adwfM3d,
        pdwfM3d: flows.pdwfM3d,
        awwfM3d: flows.awwfM3d,
        pwwfM3d: flows.pwwfM3d,
        minFlowM3d: flows.minFlowM3d,
        bodMassKgD: Math.round(bodMassKgD),
        codMassKgD: Math.round(codMassKgD),
        tssMassKgD: Math.round(tssMassKgD),
        tknMassKgD: Math.round(tknMassKgD),
        tpMassKgD: Number(tpMassKgD.toFixed(1)),
      };
    });
  }
}
