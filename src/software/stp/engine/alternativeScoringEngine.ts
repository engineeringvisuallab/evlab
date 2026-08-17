/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Phase 04: Process Alternative Comparison & Multi-Criteria Decision Analysis (MCDA) Engine
 * @license Apache-2.0
 */

import {
  PrimaryAlternativeType,
  AlternativeComparisonItem,
  AlternativeComparisonReport,
  AlternativeScoreDimension,
} from '../types/preliminaryPrimary';
import { SiteInformation, DesignObjectives } from '../types/stp';

export class AlternativeScoringEngine {
  /**
   * Evaluates and ranks all primary treatment alternatives against site constraints,
   * project objectives, land availability, and operator skill level.
   */
  public static evaluatePrimaryAlternatives(
    peakFlowLps: number,
    siteInfo: SiteInformation,
    objectives: DesignObjectives,
    influentTssMgL: number = 300.0,
    influentFogMgL: number = 40.0
  ): AlternativeComparisonReport {
    const qPeakM3d = Math.max(0.1, (peakFlowLps / 1000) * 86400);
    const availableLandM2 = siteInfo.availableLandM2 || 5000;

    // Standard weights based on design objectives
    const weights: Record<string, number> = {
      land: objectives.landPriority === 'CRITICAL_MINIMUM' ? 0.25 : 0.10,
      capex: objectives.capexPriority === 'LOW_INITIAL_COST' ? 0.20 : 0.10,
      opex: objectives.opexPriority === 'LOW_O_AND_M' ? 0.15 : 0.10,
      energy: objectives.energyPriority === 'NET_ZERO' ? 0.15 : 0.10,
      simplicity: objectives.operatorSkillLevel === 'UNSKILLED' ? 0.20 : 0.10,
      performance: 0.20,
      reliability: 0.10,
    };

    // Normalize weights to sum to 1.0
    const sumW = Object.values(weights).reduce((a, b) => a + b, 0);
    for (const k in weights) {
      weights[k] = weights[k] / sumW;
    }

    const alternativesData: {
      type: PrimaryAlternativeType;
      title: string;
      description: string;
      landM2: number;
      capexUSD: number;
      opexUSDPerYear: number;
      energyIntensityKwhPerM3: number;
      tssRemovalPct: number;
      bodRemovalPct: number;
      operatorComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
      maintenanceRating: 'LOW' | 'MODERATE' | 'DEMANDING';
      shockResilience: 'LOW' | 'MEDIUM' | 'HIGH';
      expansionFlexibility: 'LOW' | 'MEDIUM' | 'HIGH';
    }[] = [
      {
        type: 'CIRCULAR_CLARIFIER',
        title: 'Radial Flow Circular Clarifier',
        description: 'Standard municipal center-feed radial clarifier with rotating bridge scraper and peripheral V-notch weirs.',
        landM2: Math.round((qPeakM3d / 40.0) * 1.5), // ~550 m2 for 15,000 m3/d
        capexUSD: 650000,
        opexUSDPerYear: 32000,
        energyIntensityKwhPerM3: 0.008,
        tssRemovalPct: 60.0,
        bodRemovalPct: 35.0,
        operatorComplexity: 'LOW',
        maintenanceRating: 'LOW',
        shockResilience: 'HIGH',
        expansionFlexibility: 'MEDIUM',
      },
      {
        type: 'RECTANGULAR_CLARIFIER',
        title: 'Rectangular Chain-and-Flight Clarifier',
        description: 'Multi-bay longitudinal rectangular settling tanks with non-metallic chain-and-flight sludge collectors.',
        landM2: Math.round((qPeakM3d / 40.0) * 1.2), // ~450 m2
        capexUSD: 720000,
        opexUSDPerYear: 45000,
        energyIntensityKwhPerM3: 0.012,
        tssRemovalPct: 62.0,
        bodRemovalPct: 35.0,
        operatorComplexity: 'MEDIUM',
        maintenanceRating: 'MODERATE',
        shockResilience: 'HIGH',
        expansionFlexibility: 'HIGH',
      },
      {
        type: 'LAMELLA_PLATE_CLARIFIER',
        title: 'High-Rate Lamella Inclined Plate Settler',
        description: 'Inclined stainless steel/FRP lamella plate packs (55-60 deg) providing 6.5x projected settling area in a compact footprint.',
        landM2: Math.round((qPeakM3d / 40.0) * 0.25), // ~100 m2 (75% footprint savings)
        capexUSD: 850000,
        opexUSDPerYear: 52000,
        energyIntensityKwhPerM3: 0.015,
        tssRemovalPct: 65.0,
        bodRemovalPct: 35.0,
        operatorComplexity: 'MEDIUM',
        maintenanceRating: 'MODERATE',
        shockResilience: 'MEDIUM',
        expansionFlexibility: 'HIGH',
      },
      {
        type: 'TUBE_SETTLER',
        title: 'Modular Tube Settler Clarifier',
        description: 'Hexagonal tube settler modules installed in gravity basins to improve settling velocity and reduce tank volume.',
        landM2: Math.round((qPeakM3d / 40.0) * 0.40), // ~160 m2
        capexUSD: 780000,
        opexUSDPerYear: 48000,
        energyIntensityKwhPerM3: 0.012,
        tssRemovalPct: 62.0,
        bodRemovalPct: 35.0,
        operatorComplexity: 'MEDIUM',
        maintenanceRating: 'MODERATE',
        shockResilience: 'MEDIUM',
        expansionFlexibility: 'MEDIUM',
      },
      {
        type: 'PRIMARY_DAF',
        title: 'Dissolved Air Flotation (DAF) Clarifier',
        description: 'High-rate micro-bubble flotation tank with recycle pressurization, ideal for light solids, grease, and extreme land constraints.',
        landM2: Math.round((qPeakM3d / 40.0) * 0.18), // ~75 m2
        capexUSD: 1100000,
        opexUSDPerYear: 95000,
        energyIntensityKwhPerM3: 0.065,
        tssRemovalPct: 70.0,
        bodRemovalPct: 40.0,
        operatorComplexity: 'HIGH',
        maintenanceRating: 'DEMANDING',
        shockResilience: 'HIGH',
        expansionFlexibility: 'HIGH',
      },
      {
        type: 'CONVENTIONAL_PRIMARY_SEDIMENTATION',
        title: 'Conventional Gravity Settling Tank',
        description: 'Deep unmechanized or simple scraper hopper sedimentation basin for robust low-tech operations.',
        landM2: Math.round((qPeakM3d / 30.0) * 1.6), // ~700 m2
        capexUSD: 580000,
        opexUSDPerYear: 28000,
        energyIntensityKwhPerM3: 0.005,
        tssRemovalPct: 55.0,
        bodRemovalPct: 30.0,
        operatorComplexity: 'LOW',
        maintenanceRating: 'LOW',
        shockResilience: 'HIGH',
        expansionFlexibility: 'LOW',
      },
    ];

    const processedAlternatives: AlternativeComparisonItem[] = alternativesData.map((alt) => {
      const dimensions: AlternativeScoreDimension[] = [];
      const constraintWarnings: string[] = [];
      let constraintPass = true;

      // 1. Land constraint check
      if (alt.landM2 > availableLandM2) {
        constraintPass = false;
        constraintWarnings.push(`Required footprint (${alt.landM2} m2) exceeds available site land (${availableLandM2} m2).`);
      }

      // 2. Operator skill check
      if (objectives.operatorSkillLevel === 'UNSKILLED' && (alt.operatorComplexity === 'HIGH' || alt.operatorComplexity === 'VERY_HIGH')) {
        constraintWarnings.push('High operational complexity requires certified operators not currently available.');
      }

      // Scoring: Land (100 = smallest footprint, 0 = largest)
      const landScore = Math.max(10, Math.min(100, 100 - (alt.landM2 / 800) * 80));
      dimensions.push({
        dimensionKey: 'land',
        dimensionName: 'Land Footprint',
        weight: weights.land,
        score: landScore,
        reasoning: `Requires ${alt.landM2} m2 (${alt.landM2 <= availableLandM2 ? 'Within site limits' : 'EXCEEDS available area'}).`,
      });

      // Scoring: CAPEX (100 = cheapest)
      const capexScore = Math.max(10, Math.min(100, 100 - ((alt.capexUSD - 500000) / 700000) * 80));
      dimensions.push({
        dimensionKey: 'capex',
        dimensionName: 'Initial Capital Cost',
        weight: weights.capex,
        score: capexScore,
        reasoning: `Estimated CAPEX $${(alt.capexUSD / 1000).toFixed(0)}k based on equipment and concrete civil works.`,
      });

      // Scoring: OPEX & Maintenance
      const opexScore = Math.max(10, Math.min(100, 100 - ((alt.opexUSDPerYear - 25000) / 80000) * 80));
      dimensions.push({
        dimensionKey: 'opex',
        dimensionName: 'Operational & Maintenance Cost',
        weight: weights.opex,
        score: opexScore,
        reasoning: `Annual O&M: $${(alt.opexUSDPerYear / 1000).toFixed(0)}k/yr with ${alt.maintenanceRating.toLowerCase()} maintenance intensity.`,
      });

      // Scoring: Energy Intensity
      const energyScore = Math.max(10, Math.min(100, 100 - (alt.energyIntensityKwhPerM3 / 0.07) * 80));
      dimensions.push({
        dimensionKey: 'energy',
        dimensionName: 'Energy Efficiency',
        weight: weights.energy,
        score: energyScore,
        reasoning: `Specific power: ${alt.energyIntensityKwhPerM3.toFixed(3)} kWh/m3.`,
      });

      // Scoring: Simplicity & Operability
      const simplicityScore =
        alt.operatorComplexity === 'LOW' ? 95 : alt.operatorComplexity === 'MEDIUM' ? 75 : 40;
      dimensions.push({
        dimensionKey: 'simplicity',
        dimensionName: 'Operability & Operator Skill',
        weight: weights.simplicity,
        score: simplicityScore,
        reasoning: `${alt.operatorComplexity} operational complexity for municipal operators.`,
      });

      // Scoring: Process Performance (TSS & BOD Removal)
      const perfScore = (alt.tssRemovalPct / 70) * 60 + (alt.bodRemovalPct / 40) * 40;
      dimensions.push({
        dimensionKey: 'performance',
        dimensionName: 'Solids & Organic Removal Performance',
        weight: weights.performance,
        score: Math.min(100, perfScore),
        reasoning: `${alt.tssRemovalPct}% TSS removal and ${alt.bodRemovalPct}% BOD reduction.`,
      });

      // Total Weighted Score
      const totalWeightedScore = Math.round(
        dimensions.reduce((acc, dim) => acc + dim.score * dim.weight, 0)
      );

      return {
        alternativeType: alt.type,
        title: alt.title,
        description: alt.description,
        landRequiredM2: alt.landM2,
        capexUSD: alt.capexUSD,
        isCapexEstimated: true,
        opexUSDPerYear: alt.opexUSDPerYear,
        isOpexEstimated: true,
        energyIntensityKwhPerM3: alt.energyIntensityKwhPerM3,
        tssRemovalPct: alt.tssRemovalPct,
        bodRemovalPct: alt.bodRemovalPct,
        operatorComplexity: alt.operatorComplexity,
        maintenanceRating: alt.maintenanceRating,
        shockResilience: alt.shockResilience,
        expansionFlexibility: alt.expansionFlexibility,
        totalWeightedScore,
        dimensions,
        constraintPass,
        constraintWarnings,
        recommendationRank: 0,
        suitabilityStatus: constraintPass
          ? totalWeightedScore >= 75
            ? 'RECOMMENDED'
            : 'ACCEPTABLE'
          : 'NOT_SUITABLE',
      };
    });

    // Rank alternatives
    processedAlternatives.sort((a, b) => {
      if (a.constraintPass && !b.constraintPass) return -1;
      if (!a.constraintPass && b.constraintPass) return 1;
      return b.totalWeightedScore - a.totalWeightedScore;
    });

    processedAlternatives.forEach((alt, idx) => {
      alt.recommendationRank = idx + 1;
    });

    const bestOption = processedAlternatives[0];
    let selectionRationale = '';
    if (objectives.landPriority === 'CRITICAL_MINIMUM' && bestOption.alternativeType === 'LAMELLA_PLATE_CLARIFIER') {
      selectionRationale =
        'Lamella Inclined Plate Settler ranked #1 due to critical land limitation priority, achieving 75% footprint savings with 65% TSS removal.';
    } else if (bestOption.alternativeType === 'CIRCULAR_CLARIFIER') {
      selectionRationale =
        'Radial Flow Circular Clarifier ranked #1 for optimal balance of high reliability, low operator complexity, robust hydraulic shock handling, and proven municipal lifecycle economy.';
    } else {
      selectionRationale = `${bestOption.title} achieved highest weighted multi-criteria score (${bestOption.totalWeightedScore}/100) aligned with project objectives.`;
    }

    return {
      recommendedAlternative: bestOption.alternativeType,
      selectionRationale,
      criteriaWeights: weights,
      weightDistribution: weights,
      alternatives: processedAlternatives,
      appliedConstraints: {
        maxAvailableLandM2: availableLandM2,
        requiredTssRemovalPct: 50.0,
        operatorSkillAllowed: objectives.operatorSkillLevel,
        maxCapexBudgetUSD: undefined,
      },
    };
  }
}
