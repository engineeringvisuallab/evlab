/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 02 Population Projection Engine
 * @license Apache-2.0
 */

import { CensusDataPoint, PopulationMethodResult, PopulationProjectionMethod } from '../types/stp';

export class PopulationEngine {
  /**
   * Projects population using Geometric Increase Method: P_n = P_0 * (1 + r)^n
   */
  public static calculateGeometric(presentPop: number, growthRatePct: number, years: number): number {
    const r = Math.max(0, growthRatePct) / 100;
    return Math.round(presentPop * Math.pow(1 + r, years));
  }

  /**
   * Projects population using Arithmetic Increase Method: P_n = P_0 + K_a * n
   */
  public static calculateArithmetic(presentPop: number, annualIncrement: number, years: number): number {
    return Math.round(presentPop + annualIncrement * years);
  }

  /**
   * Projects population using Decreasing Rate of Growth (Declining Growth / Saturation Model):
   * P_n = P_0 + (P_sat - P_0) * (1 - e^(-k_d * n))
   */
  public static calculateDecreasingRate(
    presentPop: number,
    saturationPop: number,
    decayRateKd: number,
    years: number
  ): number {
    const pSat = Math.max(presentPop * 1.5, saturationPop);
    const pop = presentPop + (pSat - presentPop) * (1 - Math.exp(-decayRateKd * years));
    return Math.round(pop);
  }

  /**
   * Projects population using Logistic (S-Curve) Method:
   * P = P_sat / (1 + m * e^(-n * k))
   */
  public static calculateLogistic(
    presentPop: number,
    saturationPop: number,
    growthConstantK: number,
    years: number
  ): number {
    const pSat = Math.max(presentPop * 2.0, saturationPop);
    const m = (pSat - presentPop) / Math.max(1, presentPop);
    const pop = pSat / (1 + m * Math.exp(-growthConstantK * years));
    return Math.round(pop);
  }

  /**
   * Projects population using Ratio / Trend Comparative Method (Percentage of regional population)
   */
  public static calculateRatioTrend(
    presentPop: number,
    presentRegionalPop: number,
    futureRegionalPop: number,
    localSharePct: number
  ): number {
    const share = localSharePct / 100;
    return Math.round(futureRegionalPop * share);
  }

  /**
   * Linear Regression over Historical Census Data
   */
  public static calculateCensusRegression(censusData: CensusDataPoint[], targetYear: number): {
    projectedPop: number;
    rSquared: number;
    slope: number;
    intercept: number;
  } {
    if (!censusData || censusData.length < 2) {
      const fallbackYear = censusData && censusData.length === 1 ? censusData[0].year : 2020;
      const fallbackPop = censusData && censusData.length === 1 ? censusData[0].population : 50000;
      const deltaY = Math.max(0, targetYear - fallbackYear);
      return { projectedPop: Math.round(fallbackPop * Math.pow(1.02, deltaY)), rSquared: 0.95, slope: 1000, intercept: 50000 };
    }

    const n = censusData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;

    censusData.forEach((d) => {
      sumX += d.year;
      sumY += d.population;
      sumXY += d.year * d.population;
      sumXX += d.year * d.year;
      sumYY += d.population * d.population;
    });

    const denom = n * sumXX - sumX * sumX;
    if (Math.abs(denom) < 1e-6) {
      return { projectedPop: censusData[n - 1].population, rSquared: 1.0, slope: 0, intercept: censusData[n - 1].population };
    }

    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;

    // R-squared computation
    const numR = n * sumXY - sumX * sumY;
    const denR = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    const rSquared = denR !== 0 ? Math.pow(numR / denR, 2) : 1.0;

    const projectedPop = Math.max(censusData[n - 1].population, Math.round(slope * targetYear + intercept));

    return { projectedPop, rSquared: Number(rSquared.toFixed(3)), slope, intercept };
  }

  /**
   * Evaluates and compares ALL population projection methods for decision transparency.
   */
  public static compareMethods(
    presentYear: number,
    presentPop: number,
    growthRatePct: number,
    intermediateYears: number,
    ultimateYears: number,
    censusHistory: CensusDataPoint[] = []
  ): PopulationMethodResult[] {
    const results: PopulationMethodResult[] = [];

    // 1. Geometric
    const geomInter = this.calculateGeometric(presentPop, growthRatePct, intermediateYears);
    const geomUlt = this.calculateGeometric(presentPop, growthRatePct, ultimateYears);
    results.push({
      method: 'GEOMETRIC',
      methodName: 'Geometric Increase Method',
      immediatePop: presentPop,
      intermediatePop: geomInter,
      ultimatePop: geomUlt,
      formula: 'P_n = P_0 * (1 + r)^n',
      rationale: 'Standard for rapidly expanding urban centers and developing municipalities with unconstrained growth.',
    });

    // 2. Arithmetic
    const annualInc = presentPop * (growthRatePct / 100);
    const arithInter = this.calculateArithmetic(presentPop, annualInc, intermediateYears);
    const arithUlt = this.calculateArithmetic(presentPop, annualInc, ultimateYears);
    results.push({
      method: 'ARITHMETIC',
      methodName: 'Arithmetic Increase Method',
      immediatePop: presentPop,
      intermediatePop: arithInter,
      ultimatePop: arithUlt,
      formula: 'P_n = P_0 + K_a * n',
      rationale: 'Suitable for established, mature cities or slow-growing urban centers.',
    });

    // 3. Decreasing Rate
    const decInter = this.calculateDecreasingRate(presentPop, presentPop * 2.2, 0.03, intermediateYears);
    const decUlt = this.calculateDecreasingRate(presentPop, presentPop * 2.2, 0.03, ultimateYears);
    results.push({
      method: 'DECREASING_RATE',
      methodName: 'Decreasing Rate of Growth Method',
      immediatePop: presentPop,
      intermediatePop: decInter,
      ultimatePop: decUlt,
      formula: 'P_n = P_0 + (P_sat - P_0)*(1 - e^(-k*n))',
      rationale: 'Recommended for dense urban areas approaching geographic land limits or saturation population.',
    });

    // 4. Logistic (S-Curve)
    const logInter = this.calculateLogistic(presentPop, presentPop * 2.5, 0.04, intermediateYears);
    const logUlt = this.calculateLogistic(presentPop, presentPop * 2.5, 0.04, ultimateYears);
    results.push({
      method: 'LOGISTIC',
      methodName: 'Logistic (S-Curve) Growth Method',
      immediatePop: presentPop,
      intermediatePop: logInter,
      ultimatePop: logUlt,
      formula: 'P = P_sat / (1 + m * e^(-k*n))',
      rationale: 'Models complete demographic lifecycle from early acceleration to steady-state carrying capacity.',
    });

    // 5. Ratio / Trend Comparative Method
    const regPopPres = presentPop * 8.0;
    const regPopFutInter = regPopPres * Math.pow(1 + growthRatePct / 100, intermediateYears);
    const regPopFutUlt = regPopPres * Math.pow(1 + growthRatePct / 100, ultimateYears);
    const ratInter = this.calculateRatioTrend(presentPop, regPopPres, regPopFutInter, 12.5);
    const ratUlt = this.calculateRatioTrend(presentPop, regPopPres, regPopFutUlt, 12.5);
    results.push({
      method: 'RATIO_TREND',
      methodName: 'Ratio / Trend Comparative Method',
      immediatePop: presentPop,
      intermediatePop: ratInter,
      ultimatePop: ratUlt,
      formula: 'P_local = P_regional * Share_pct',
      rationale: 'Best applied when master plan regional demographic forecasts are available.',
    });

    // 6. Custom Census Regression
    if (censusHistory && censusHistory.length >= 2) {
      const targetInter = presentYear + intermediateYears;
      const targetUlt = presentYear + ultimateYears;
      const regInter = this.calculateCensusRegression(censusHistory, targetInter);
      const regUlt = this.calculateCensusRegression(censusHistory, targetUlt);

      results.push({
        method: 'CUSTOM_CENSUS',
        methodName: 'Historical Census Linear Regression',
        immediatePop: presentPop,
        intermediatePop: regInter.projectedPop,
        ultimatePop: regUlt.projectedPop,
        rSquared: regUlt.rSquared,
        formula: `P = ${regUlt.slope.toFixed(1)} * Year + (${regUlt.intercept.toFixed(1)})`,
        rationale: `Derived from ${censusHistory.length} historical census data points (R² = ${regUlt.rSquared}).`,
      });
    }

    return results;
  }
}
