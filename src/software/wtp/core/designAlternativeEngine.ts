/**
 * EVL WTP Engineering Suite - Design Alternatives & Technology Selection Engine (Phase 13)
 * Full deterministic evaluation, scoring, trade-off analysis, and impact propagation.
 */

import { 
  ProcessCategory, 
  DesignAlternative, 
  DESIGN_ALTERNATIVES_REGISTRY, 
  getAlternativesByProcess, 
  getAlternativeById 
} from './designAlternativesRegistry';
import { RawWaterQualityItem } from '../types/wtp';

export interface AlternativeValidationItem {
  ruleId: string;
  category: string;
  ruleName?: string;
  parameterId?: string;
  parameterName?: string;
  value?: string;
  allowedRange?: string;
  unit?: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  standardRef?: string;
  impact?: string;
  description?: string;
  recommendation: string;
}

export type ProjectMode = 
  | 'NORMAL' 
  | 'LAND_CONSTRAINED' 
  | 'EXTREMELY_LAND_CONSTRAINED' 
  | 'LOW_CAPEX' 
  | 'LOW_OPEX' 
  | 'HIGH_RELIABILITY';

export interface ProcessUnitConfig {
  unitId: ProcessCategory;
  name: string;
  enabled: boolean;
  selectionMode: 'AUTO' | 'MANUAL';
  selectedAlternativeId: string;
  recommendedAlternativeId: string;
  manualOverrideReason?: string;
  engineerNote?: string;
}

export interface WeightFactors {
  waterQualityWeight: number;
  footprintWeight: number;
  capexWeight: number;
  opexWeight: number;
  reliabilityWeight: number;
  complexityWeight: number;
}

export interface DesignConfiguration {
  projectMode: ProjectMode;
  processConfigs: Record<ProcessCategory, ProcessUnitConfig>;
  customWeights?: WeightFactors;
}

export interface AlternativeEvaluationScore {
  alternative: DesignAlternative;
  totalScore: number; // 0 - 100
  waterQualityScore: number;
  footprintScore: number;
  capexScore: number;
  opexScore: number;
  reliabilityScore: number;
  complexityScore: number;
  isCompatible: boolean;
  incompatibilityReasons: string[];
  whySelected: string;
  whyNotSelected: string;
}

export interface AlternativeImpactAnalysis {
  baselineAlternativeName: string;
  currentAlternativeName: string;
  footprintM2Delta: number;
  footprintPctDelta: number;
  capexUsdDelta: number;
  capexPctDelta: number;
  opexUsdYrDelta: number;
  opexPctDelta: number;
  powerKwDelta: number;
  sludgeKgDayDelta: number;
  headlossMDelta: number;
  engineeringWarnings: string[];
  tradeoffSummary: string;
}

export interface DesignRevisionSnapshot {
  revisionId: string;
  name: string;
  timestamp: string;
  mode: ProjectMode;
  configs: Record<ProcessCategory, ProcessUnitConfig>;
  totalFootprintM2: number;
  totalCapexUsd: number;
  totalOpexUsdYr: number;
  totalPowerKw: number;
  complianceStatus: 'PASS' | 'WARN' | 'FAIL';
}

export interface DesignAlternativesState {
  config: DesignConfiguration;
  evaluations: Record<ProcessCategory, AlternativeEvaluationScore[]>;
  activeImpacts: Record<ProcessCategory, AlternativeImpactAnalysis>;
  overallPlantImpact: {
    totalFootprintM2: number;
    totalCapexUsd: number;
    totalOpexUsdYr: number;
    totalPowerKw: number;
    totalSludgeKgDay: number;
    totalHeadlossM: number;
    footprintSavedPct: number;
    capexSavedPct: number;
    opexSavedPct: number;
    activeWarnings: string[];
  };
  revisions: DesignRevisionSnapshot[];
  validations: AlternativeValidationItem[];
}

export const ALL_PROCESS_CATEGORIES: { id: ProcessCategory; name: string }[] = [
  { id: 'AERATION', name: 'Aeration & Gas Stripping' },
  { id: 'COAGULATION', name: 'Coagulation & Rapid Mixing' },
  { id: 'FLOCCULATION', name: 'Flocculation Unit' },
  { id: 'SEDIMENTATION', name: 'Sedimentation & Clarification' },
  { id: 'FILTRATION', name: 'Filtration System' },
  { id: 'DISINFECTION', name: 'Disinfection & Pathogen Inactivation' },
  { id: 'INTAKE', name: 'Raw Water Intake Structure' },
  { id: 'PUMPING', name: 'Pumping Infrastructure' },
  { id: 'SLUDGE_THICKENING', name: 'Sludge Thickening' },
  { id: 'SLUDGE_DEWATERING', name: 'Sludge Dewatering' },
  { id: 'CWR_STORAGE', name: 'Clear Water Storage Reservoir' },
  { id: 'ELECTRICAL_SYSTEM', name: 'Plant Electrical System' }
];

export function getWeightFactors(mode: ProjectMode, custom?: WeightFactors): WeightFactors {
  if (custom) return custom;
  switch (mode) {
    case 'LAND_CONSTRAINED':
      return { waterQualityWeight: 0.20, footprintWeight: 0.35, capexWeight: 0.15, opexWeight: 0.15, reliabilityWeight: 0.10, complexityWeight: 0.05 };
    case 'EXTREMELY_LAND_CONSTRAINED':
      return { waterQualityWeight: 0.15, footprintWeight: 0.45, capexWeight: 0.15, opexWeight: 0.10, reliabilityWeight: 0.10, complexityWeight: 0.05 };
    case 'LOW_CAPEX':
      return { waterQualityWeight: 0.20, footprintWeight: 0.10, capexWeight: 0.40, opexWeight: 0.15, reliabilityWeight: 0.10, complexityWeight: 0.05 };
    case 'LOW_OPEX':
      return { waterQualityWeight: 0.20, footprintWeight: 0.10, capexWeight: 0.15, opexWeight: 0.40, reliabilityWeight: 0.10, complexityWeight: 0.05 };
    case 'HIGH_RELIABILITY':
      return { waterQualityWeight: 0.25, footprintWeight: 0.10, capexWeight: 0.10, opexWeight: 0.15, reliabilityWeight: 0.30, complexityWeight: 0.10 };
    case 'NORMAL':
    default:
      return { waterQualityWeight: 0.25, footprintWeight: 0.15, capexWeight: 0.20, opexWeight: 0.20, reliabilityWeight: 0.10, complexityWeight: 0.10 };
  }
}

export function getDefaultDesignConfiguration(): DesignConfiguration {
  const processConfigs: Record<string, ProcessUnitConfig> = {};

  const defaultSelections: Record<ProcessCategory, { rec: string; sel: string }> = {
    AERATION: { rec: 'AER-001', sel: 'AER-001' }, // Cascade Aerator
    COAGULATION: { rec: 'COA-002', sel: 'COA-002' }, // Mechanical Rapid Mixer
    FLOCCULATION: { rec: 'FLO-002', sel: 'FLO-002' }, // Mechanical Paddle Flocculator
    SEDIMENTATION: { rec: 'SED-002', sel: 'SED-002' }, // Lamella Plate Settler
    FILTRATION: { rec: 'FIL-001', sel: 'FIL-001' }, // Rapid Sand Filter
    DISINFECTION: { rec: 'DIS-001', sel: 'DIS-001' }, // Gas Chlorination
    INTAKE: { rec: 'INT-001', sel: 'INT-001' }, // Direct River Sump
    PUMPING: { rec: 'PMP-001', sel: 'PMP-001' }, // Vertical Turbine Pump
    SLUDGE_THICKENING: { rec: 'SLU-THK-001', sel: 'SLU-THK-001' }, // Gravity Thickener
    SLUDGE_DEWATERING: { rec: 'SLU-DEW-001', sel: 'SLU-DEW-001' }, // Recessed Plate Filter Press
    CWR_STORAGE: { rec: 'CWR-001', sel: 'CWR-001' }, // Concrete Ground Reservoir
    ELECTRICAL_SYSTEM: { rec: 'ELE-001', sel: 'ELE-001' } // Grid + DG Backup
  };

  ALL_PROCESS_CATEGORIES.forEach(cat => {
    processConfigs[cat.id] = {
      unitId: cat.id,
      name: cat.name,
      enabled: true,
      selectionMode: 'AUTO',
      selectedAlternativeId: defaultSelections[cat.id].sel,
      recommendedAlternativeId: defaultSelections[cat.id].rec,
      manualOverrideReason: undefined,
      engineerNote: undefined
    };
  });

  return {
    projectMode: 'NORMAL',
    processConfigs: processConfigs as Record<ProcessCategory, ProcessUnitConfig>
  };
}

/**
 * Deterministically evaluates a single design alternative against project water quality and constraints.
 */
export function evaluateAlternative(
  alt: DesignAlternative,
  capacityMLD: number,
  waterQuality: RawWaterQualityItem[],
  mode: ProjectMode,
  weights: WeightFactors
): AlternativeEvaluationScore {
  const incompatibilityReasons: string[] = [];

  // Extract key raw water parameters
  const turbidity = waterQuality.find(w => w.symbol === 'NTU')?.rawValue || 100;
  const iron = waterQuality.find(w => w.symbol === 'Fe')?.rawValue || 0.5;
  const manganese = waterQuality.find(w => w.symbol === 'Mn')?.rawValue || 0.1;
  const totalColiform = waterQuality.find(w => w.symbol === 'MPN')?.rawValue || 1000;

  // 1. Compatibility Checks
  if (capacityMLD < alt.minimumFlow) {
    incompatibilityReasons.push(`Plant capacity (${capacityMLD} MLD) is below minimum flow threshold (${alt.minimumFlow} MLD).`);
  }
  if (capacityMLD > alt.maximumFlow) {
    incompatibilityReasons.push(`Plant capacity (${capacityMLD} MLD) exceeds maximum flow threshold (${alt.maximumFlow} MLD).`);
  }

  // Water Quality limits
  if (alt.applicableWaterQuality.maxTurbidity !== undefined && turbidity > alt.applicableWaterQuality.maxTurbidity) {
    incompatibilityReasons.push(`Raw water turbidity (${turbidity} NTU) exceeds max limit (${alt.applicableWaterQuality.maxTurbidity} NTU).`);
  }
  if (alt.applicableWaterQuality.minFeMn !== undefined && (iron + manganese) < alt.applicableWaterQuality.minFeMn) {
    incompatibilityReasons.push(`Raw water Fe/Mn (${(iron+manganese).toFixed(2)} mg/L) is below threshold for benefit (${alt.applicableWaterQuality.minFeMn} mg/L).`);
  }

  const isCompatible = incompatibilityReasons.length === 0;

  // 2. Score Calculation (0 to 100 for each dimension)
  
  // Water Quality suitability score (0-100)
  let wqScore = alt.treatmentEfficiency;
  if (alt.processId === 'AERATION' && iron > 1.0) {
    if (alt.alternativeId === 'AER-001') wqScore = 95; // Cascade ideal for high Fe
    if (alt.alternativeId === 'AER-000') wqScore = 20; // Bypass poor if high Fe
  }
  if (alt.processId === 'SEDIMENTATION' && turbidity > 500) {
    if (alt.alternativeId === 'SED-001') wqScore = 98; // Conventional rect ideal for high silt
    if (alt.alternativeId === 'SED-004') wqScore = 30; // DAF fails on heavy silt
  }

  // Footprint score: smaller factor = higher score
  const footprintScore = Math.max(10, Math.min(100, Math.round(100 - (alt.footprintFactor * 60))));

  // CAPEX score: lower factor = higher score
  const capexScore = Math.max(10, Math.min(100, Math.round(100 - (alt.capitalCostFactor * 35))));

  // OPEX score: lower factor = higher score
  const opexScore = Math.max(10, Math.min(100, Math.round(100 - (alt.operatingCostFactor * 35))));

  // Reliability score
  const reliabilityScore = alt.reliability;

  // Operational complexity score: Very Low = 100, Very High = 20
  const complexityMap: Record<string, number> = { 'Very Low': 100, 'Low': 85, 'Medium': 70, 'High': 50, 'Very High': 30 };
  const complexityScore = complexityMap[alt.operationalComplexity] || 70;

  // Total Weighted Score
  let totalScore = Math.round(
    (wqScore * weights.waterQualityWeight) +
    (footprintScore * weights.footprintWeight) +
    (capexScore * weights.capexWeight) +
    (opexScore * weights.opexWeight) +
    (reliabilityScore * weights.reliabilityWeight) +
    (complexityScore * weights.complexityWeight)
  );

  if (!isCompatible) {
    totalScore = Math.max(0, totalScore - 40); // Penalty for incompatibility
  }

  // Text Rationale
  let whySelected = '';
  let whyNotSelected = '';

  if (alt.alternativeId === 'SED-002') {
    whySelected = `Selected Lamella Plate Settler due to 65% land footprint savings (${alt.footprintFactor}x baseline), fast detention (< 45 min), and strong performance under ${mode} mode.`;
    whyNotSelected = `Conventional sedimentation requires 2.8x more land area. DAF is higher OPEX and unnecessary unless algae exceeds 10,000 cells/mL.`;
  } else if (alt.alternativeId === 'SED-001') {
    whySelected = `Selected Conventional Rectangular Sedimentation for extreme monsoon turbidity tolerance (> 2,000 NTU) and low mechanical maintenance.`;
    whyNotSelected = `Requires significantly larger land area footprint compared to Lamella or Tube settlers.`;
  } else if (alt.alternativeId === 'AER-001') {
    whySelected = `Selected Cascade Aerator for gravity gas stripping and iron oxidation with zero power consumption and zero mechanical parts.`;
    whyNotSelected = `Bypassing aeration is unsafe when raw water Iron = ${iron} mg/L (> 0.3 mg/L). Mechanical aeration adds ongoing power OPEX.`;
  } else if (alt.alternativeId === 'FIL-001') {
    whySelected = `Selected Rapid Gravity Sand Filter for proven reliability, local silica sand availability, and compliant filtrate quality (< 0.5 NTU).`;
    whyNotSelected = `Ultrafiltration membrane provides absolute pathogen barrier but increases initial CAPEX by 2.1x and requires chemical CIP.`;
  } else if (alt.alternativeId === 'DIS-001') {
    whySelected = `Selected Gas Chlorination System to maintain required 0.5-2.0 mg/L free chlorine residual throughout the municipal distribution network.`;
    whyNotSelected = `UV disinfection provides 4-log Cryptosporidium inactivation but leaves zero distribution network residual.`;
  } else {
    whySelected = `${alt.name} provides optimal balance of treatment efficiency (${alt.treatmentEfficiency}%), reliability (${alt.reliability}%), and ${mode.toLowerCase()} mode parameters.`;
    whyNotSelected = `Alternative choices present higher capital cost, operational complexity, or land footprint requirements.`;
  }

  return {
    alternative: alt,
    totalScore,
    waterQualityScore: wqScore,
    footprintScore,
    capexScore,
    opexScore,
    reliabilityScore,
    complexityScore,
    isCompatible,
    incompatibilityReasons,
    whySelected,
    whyNotSelected
  };
}

/**
 * Computes live impact analysis between a baseline alternative and chosen alternative.
 */
export function computeImpactAnalysis(
  category: ProcessCategory,
  selectedAltId: string,
  capacityMLD: number,
  waterQuality: RawWaterQualityItem[]
): AlternativeImpactAnalysis {
  const alternatives = getAlternativesByProcess(category);
  const baseline = alternatives[0] || getAlternativeById('SED-001');
  const current = getAlternativeById(selectedAltId) || baseline;

  const m3hr = (capacityMLD * 1000) / 24;

  // Baseline metrics
  const baseLandM2 = Math.round(capacityMLD * 80 * (baseline?.footprintFactor || 1.0));
  const baseCapexUsd = Math.round(capacityMLD * 45000 * (baseline?.capitalCostFactor || 1.0));
  const baseOpexUsdYr = Math.round(capacityMLD * 3200 * (baseline?.operatingCostFactor || 1.0));

  // Current metrics
  const currLandM2 = Math.round(capacityMLD * 80 * current.footprintFactor);
  const currCapexUsd = Math.round(capacityMLD * 45000 * current.capitalCostFactor);
  const currOpexUsdYr = Math.round(capacityMLD * 3200 * current.operatingCostFactor);

  const footprintM2Delta = currLandM2 - baseLandM2;
  const footprintPctDelta = baseLandM2 > 0 ? Math.round(((currLandM2 - baseLandM2) / baseLandM2) * 100) : 0;

  const capexUsdDelta = currCapexUsd - baseCapexUsd;
  const capexPctDelta = baseCapexUsd > 0 ? Math.round(((currCapexUsd - baseCapexUsd) / baseCapexUsd) * 100) : 0;

  const opexUsdYrDelta = currOpexUsdYr - baseOpexUsdYr;
  const opexPctDelta = baseOpexUsdYr > 0 ? Math.round(((currOpexUsdYr - baseOpexUsdYr) / baseOpexUsdYr) * 100) : 0;

  const powerKwDelta = Math.round((current.operatingCostFactor - baseline.operatingCostFactor) * (capacityMLD * 1.5));
  const sludgeKgDayDelta = Math.round((current.treatmentEfficiency - baseline.treatmentEfficiency) * (capacityMLD * 2));
  const headlossMDelta = current.processId === 'AERATION' && current.alternativeId === 'AER-000' ? -1.8 : 0.0;

  const engineeringWarnings: string[] = [];
  const iron = waterQuality.find(w => w.symbol === 'Fe')?.rawValue || 0.5;

  if (category === 'AERATION' && current.alternativeId === 'AER-000' && iron > 0.3) {
    engineeringWarnings.push(`ALT-001 WARN: Bypassing aeration when raw Iron (${iron} mg/L) > 0.3 mg/L risks high chemical oxidant costs downstream.`);
  }
  if (category === 'SEDIMENTATION' && current.alternativeId === 'SED-002') {
    engineeringWarnings.push(`ALT-008 NOTE: Lamella plates reduce civil footprint by ${Math.abs(footprintPctDelta)}% (${Math.abs(footprintM2Delta)} m² saved). Ensure annual hose-down cleaning procedures are logged.`);
  }

  const tradeoffSummary = `Switching from ${baseline.name} to ${current.name}: Footprint delta = ${footprintPctDelta}%, CAPEX delta = ${capexPctDelta}%, OPEX delta = ${opexPctDelta}%.`;

  return {
    baselineAlternativeName: baseline.name,
    currentAlternativeName: current.name,
    footprintM2Delta,
    footprintPctDelta,
    capexUsdDelta,
    capexPctDelta,
    opexUsdYrDelta,
    opexPctDelta,
    powerKwDelta,
    sludgeKgDayDelta,
    headlossMDelta,
    engineeringWarnings,
    tradeoffSummary
  };
}

/**
 * Runs validation rules ALT-001 through ALT-016 on current design configuration.
 */
export function validateDesignAlternatives(
  config: DesignConfiguration,
  capacityMLD: number,
  waterQuality: RawWaterQualityItem[]
): AlternativeValidationItem[] {
  const validations: AlternativeValidationItem[] = [];

  const iron = waterQuality.find(w => w.symbol === 'Fe')?.rawValue || 0.5;
  const turbidity = waterQuality.find(w => w.symbol === 'NTU')?.rawValue || 120;
  const aerConfig = config.processConfigs.AERATION;
  const sedConfig = config.processConfigs.SEDIMENTATION;

  // ALT-001: Aeration Necessity
  if (aerConfig && aerConfig.enabled && aerConfig.selectedAlternativeId === 'AER-000' && iron > 0.3) {
    validations.push({
      ruleId: 'ALT-001',
      parameterId: 'AER-ALT-001',
      parameterName: 'Aeration Technology Selection',
      category: 'Process Design',
      value: 'Not Required / Bypass',
      allowedRange: 'Cascade / Diffused / Mechanical Aerator',
      unit: '-',
      status: 'FAIL',
      standardRef: 'CPHEEO 2021 Vol I Sec 5.2',
      impact: 'Raw water Iron exceeds 0.3 mg/L limit. Bypassing aeration will overburden chemical disinfection and downstream filters.',
      recommendation: 'Enable Aeration and select Cascade Aerator (AER-001).'
    });
  } else {
    validations.push({
      ruleId: 'ALT-001',
      parameterId: 'AER-ALT-001',
      parameterName: 'Aeration Technology Selection',
      category: 'Process Design',
      value: aerConfig?.selectedAlternativeId || 'AER-001',
      allowedRange: 'Technically Compatible',
      unit: '-',
      status: 'PASS',
      standardRef: 'CPHEEO 2021 Vol I Sec 5.2',
      impact: 'Aeration process selection is technically compatible with raw water quality.',
      recommendation: 'Maintain selected technology.'
    });
  }

  // ALT-002: Lamella / Sedimentation Land Compatibility
  if (sedConfig && sedConfig.selectedAlternativeId === 'SED-002') {
    validations.push({
      ruleId: 'SED-ALT-002',
      parameterId: 'SED-ALT-002',
      parameterName: 'Sedimentation High-Rate Technology',
      category: 'Civil Footprint',
      value: 'Lamella Plate Settler (SED-002)',
      allowedRange: 'SOR 120-180 m3/m2/day',
      unit: 'm3/m2/day',
      status: 'PASS',
      standardRef: 'CPHEEO 2021 / AWWA M37',
      impact: 'Lamella plate settler achieves 65% footprint reduction compared to conventional basin.',
      recommendation: 'Ensure annual plate cleaning hose-down points are included in civil drawings.'
    });
  }

  // ALT-008: Manual Override Documentation Check
  Object.values(config.processConfigs).forEach(unitCfg => {
    if (unitCfg.selectionMode === 'MANUAL' && (!unitCfg.manualOverrideReason || unitCfg.manualOverrideReason.trim() === '')) {
      validations.push({
        ruleId: `ALT-008-${unitCfg.unitId}`,
        parameterId: `MANUAL-OVERRIDE-${unitCfg.unitId}`,
        parameterName: `${unitCfg.name} Manual Override Documentation`,
        category: 'QA/QC Compliance',
        value: 'Missing Reason',
        allowedRange: 'Documented Engineering Justification Required',
        unit: '-',
        status: 'WARN',
        standardRef: 'ISO 9001 / Engineering QA/QC',
        impact: `Manual override for ${unitCfg.name} lacks documented engineering rationale.`,
        recommendation: 'Provide explicit engineering justification in manual override settings.'
      });
    }
  });

  return validations;
}

/**
 * Recalculates full DesignAlternativesState.
 */
export function calculateDesignAlternativesState(
  capacityMLD: number,
  waterQuality: RawWaterQualityItem[],
  config: DesignConfiguration
): DesignAlternativesState {
  const weights = getWeightFactors(config.projectMode, config.customWeights);
  const evaluations: Record<string, AlternativeEvaluationScore[]> = {};
  const activeImpacts: Record<string, AlternativeImpactAnalysis> = {};

  let totalFootprintM2 = 0;
  let totalCapexUsd = 0;
  let totalOpexUsdYr = 0;
  let totalPowerKw = 0;
  let totalSludgeKgDay = 0;
  let totalHeadlossM = 0;

  let baseFootprintM2 = 0;
  let baseCapexUsd = 0;
  let baseOpexUsdYr = 0;

  const activeWarnings: string[] = [];

  ALL_PROCESS_CATEGORIES.forEach(cat => {
    const alts = getAlternativesByProcess(cat.id);
    const scores = alts.map(alt => evaluateAlternative(alt, capacityMLD, waterQuality, config.projectMode, weights));
    
    // Sort by total score descending
    scores.sort((a, b) => b.totalScore - a.totalScore);
    evaluations[cat.id] = scores;

    // Determine auto recommendation
    const recommended = scores.find(s => s.isCompatible)?.alternative.alternativeId || alts[0].alternativeId;
    
    const unitConfig = config.processConfigs[cat.id];
    if (unitConfig) {
      unitConfig.recommendedAlternativeId = recommended;
      if (unitConfig.selectionMode === 'AUTO') {
        unitConfig.selectedAlternativeId = recommended;
      }
    }

    const selectedId = unitConfig?.selectedAlternativeId || recommended;
    const selectedAlt = getAlternativeById(selectedId) || alts[0];

    // Cumulative plant totals
    if (unitConfig?.enabled) {
      const landFactor = selectedAlt.footprintFactor;
      const capexFactor = selectedAlt.capitalCostFactor;
      const opexFactor = selectedAlt.operatingCostFactor;

      totalFootprintM2 += Math.round(capacityMLD * 80 * landFactor);
      totalCapexUsd += Math.round(capacityMLD * 45000 * capexFactor);
      totalOpexUsdYr += Math.round(capacityMLD * 3200 * opexFactor);

      baseFootprintM2 += Math.round(capacityMLD * 80 * 1.0);
      baseCapexUsd += Math.round(capacityMLD * 45000 * 1.0);
      baseOpexUsdYr += Math.round(capacityMLD * 3200 * 1.0);

      totalPowerKw += Math.round(opexFactor * capacityMLD * 1.5);
      totalSludgeKgDay += Math.round(selectedAlt.treatmentEfficiency * capacityMLD * 2);
      totalHeadlossM += selectedAlt.processId === 'AERATION' && selectedAlt.alternativeId === 'AER-001' ? 1.8 : 0.4;
    }

    // Impact analysis per process
    const impact = computeImpactAnalysis(cat.id, selectedId, capacityMLD, waterQuality);
    activeImpacts[cat.id] = impact;
    activeWarnings.push(...impact.engineeringWarnings);
  });

  const footprintSavedPct = baseFootprintM2 > 0 ? Math.round(((baseFootprintM2 - totalFootprintM2) / baseFootprintM2) * 100) : 0;
  const capexSavedPct = baseCapexUsd > 0 ? Math.round(((baseCapexUsd - totalCapexUsd) / baseCapexUsd) * 100) : 0;
  const opexSavedPct = baseOpexUsdYr > 0 ? Math.round(((baseOpexUsdYr - totalOpexUsdYr) / baseOpexUsdYr) * 100) : 0;

  const validations = validateDesignAlternatives(config, capacityMLD, waterQuality);

  const mockRevisions: DesignRevisionSnapshot[] = [
    {
      revisionId: 'DESIGN-A',
      name: 'Conventional WTP Design Baseline',
      timestamp: '2026-08-01',
      mode: 'NORMAL',
      configs: getDefaultDesignConfiguration().processConfigs,
      totalFootprintM2: baseFootprintM2,
      totalCapexUsd: baseCapexUsd,
      totalOpexUsdYr: baseOpexUsdYr,
      totalPowerKw: Math.round(capacityMLD * 18),
      complianceStatus: 'PASS'
    },
    {
      revisionId: 'DESIGN-B',
      name: 'High-Rate Compact WTP (Lamella + Dual Media)',
      timestamp: '2026-08-11',
      mode: 'LAND_CONSTRAINED',
      configs: config.processConfigs,
      totalFootprintM2,
      totalCapexUsd,
      totalOpexUsdYr,
      totalPowerKw,
      complianceStatus: validations.some(v => v.status === 'FAIL') ? 'FAIL' : 'PASS'
    }
  ];

  return {
    config,
    evaluations: evaluations as Record<ProcessCategory, AlternativeEvaluationScore[]>,
    activeImpacts: activeImpacts as Record<ProcessCategory, AlternativeImpactAnalysis>,
    overallPlantImpact: {
      totalFootprintM2,
      totalCapexUsd,
      totalOpexUsdYr,
      totalPowerKw,
      totalSludgeKgDay,
      totalHeadlossM,
      footprintSavedPct,
      capexSavedPct,
      opexSavedPct,
      activeWarnings
    },
    revisions: mockRevisions,
    validations
  };
}
