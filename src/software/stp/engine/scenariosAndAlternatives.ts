/**
 * EVLab Sewerage & Wastewater Treatment Plant (STP) Engineering Platform
 * Multi-Scenario Engine & Process Alternative Architecture
 * @license Apache-2.0
 */

import { ScenarioState, ProcessAlternative, DesignBasis, InfluentQuality } from '../types/stp';
import { IDGenerator } from './idGenerator';
import { SewerNetworkEngine } from './sewerNetworkEngine';
import { PreliminaryPrimaryMasterEngine } from './preliminaryPrimaryMasterEngine';

export const PROCESS_ALTERNATIVE_CATALOG: Record<string, ProcessAlternative> = {
  // 1. Biological Alternatives
  'ALT-CAS': {
    id: 'ALT-CAS',
    name: 'Conventional Activated Sludge (CAS)',
    category: 'BIOLOGICAL',
    applicableFlowMinM3d: 2000,
    applicableFlowMaxM3d: 500000,
    footprintRating: 4, // High footprint
    capexRating: 3,     // Moderate CAPEX
    opexRating: 3,      // Moderate OPEX
    energyIntensityKwhPerM3: 0.45,
    sludgeProductionKgPerKgBod: 0.85,
    operatorSkillRequired: 'CERTIFIED',
    bnrCapability: 'FULL_N_REMOVAL',
    shockLoadResilience: 'MEDIUM',
    incompatibleTechnologies: ['ALT-MBR'],
    advantages: [
      'Well-established process with decades of operational history.',
      'Flexible oxygen transfer with fine bubble diffusers.',
      'Good nitrifying biological nutrient removal (MLE/A2O configuration).',
    ],
    limitations: [
      'Large land footprint requirement for secondary clarifiers.',
      'Susceptible to sludge bulking and SVI rising.',
    ],
  },

  'ALT-EA': {
    id: 'ALT-EA',
    name: 'Extended Aeration (EA)',
    category: 'BIOLOGICAL',
    applicableFlowMinM3d: 500,
    applicableFlowMaxM3d: 100000,
    footprintRating: 5, // Extensive footprint
    capexRating: 3,
    opexRating: 4,      // Higher energy due to long SRT
    energyIntensityKwhPerM3: 0.65,
    sludgeProductionKgPerKgBod: 0.55,
    operatorSkillRequired: 'SEMI_SKILLED',
    bnrCapability: 'FULL_N_REMOVAL',
    shockLoadResilience: 'VERY_HIGH',
    incompatibleTechnologies: [],
    advantages: [
      'Produces highly stabilized waste sludge (low volatile solids).',
      'Extremely resilient to hydraulic and organic shock loads.',
      'Simple operational controls without primary clarifiers.',
    ],
    limitations: [
      'High power consumption due to extended aeration time (SRT 20-30 days).',
      'Very large basin land footprint.',
    ],
  },

  'ALT-SBR': {
    id: 'ALT-SBR',
    name: 'Sequencing Batch Reactor (SBR)',
    category: 'BIOLOGICAL',
    applicableFlowMinM3d: 1000,
    applicableFlowMaxM3d: 200000,
    footprintRating: 2, // Low footprint (eliminates secondary clarifier)
    capexRating: 3,
    opexRating: 3,
    energyIntensityKwhPerM3: 0.50,
    sludgeProductionKgPerKgBod: 0.75,
    operatorSkillRequired: 'ADVANCED_AUTOMATED',
    bnrCapability: 'FULL_N_P_REMOVAL',
    shockLoadResilience: 'HIGH',
    incompatibleTechnologies: ['ALT-TRICKLING'],
    advantages: [
      'Compact footprint combining aeration and clarification in one basin.',
      'Excellent biological phosphorus and nitrogen removal in cycle phases.',
      'No Return Activated Sludge (RAS) pumping required.',
    ],
    limitations: [
      'Requires automated decanters and motorized valve PLC sequencing.',
      'Higher peak flow downstream equalization tank requirement.',
    ],
  },

  'ALT-MBBR': {
    id: 'ALT-MBBR',
    name: 'Moving Bed Biofilm Reactor (MBBR)',
    category: 'BIOLOGICAL',
    applicableFlowMinM3d: 500,
    applicableFlowMaxM3d: 300000,
    footprintRating: 1, // Minimal footprint
    capexRating: 4,     // High CAPEX due to carrier media
    opexRating: 3,
    energyIntensityKwhPerM3: 0.55,
    sludgeProductionKgPerKgBod: 0.60,
    operatorSkillRequired: 'CERTIFIED',
    bnrCapability: 'FULL_N_REMOVAL',
    shockLoadResilience: 'VERY_HIGH',
    incompatibleTechnologies: [],
    advantages: [
      'Extremely compact footprint (30-50% smaller than CAS).',
      'High biomass concentration attached to biofilm carriers (500-800 m2/m3).',
      'No sludge bulking or SVI washout risks.',
    ],
    limitations: [
      'Media retention sieves require routine inspection.',
      'Higher initial carrier media capital cost.',
    ],
  },

  'ALT-UASB': {
    id: 'ALT-UASB',
    name: 'Upflow Anaerobic Sludge Blanket (UASB)',
    category: 'BIOLOGICAL',
    applicableFlowMinM3d: 2000,
    applicableFlowMaxM3d: 200000,
    footprintRating: 2,
    capexRating: 2,     // Low CAPEX
    opexRating: 1,      // Very low OPEX (net energy producer)
    energyIntensityKwhPerM3: -0.15, // Produces energy via biogas
    sludgeProductionKgPerKgBod: 0.20,
    operatorSkillRequired: 'SEMI_SKILLED',
    bnrCapability: 'NONE',
    shockLoadResilience: 'MEDIUM',
    incompatibleTechnologies: [],
    advantages: [
      'Net energy positive due to methane biogas capture.',
      'Very low waste sludge generation (high anaerobic digestion).',
      'Ideal for tropical warm wastewater climates (> 20°C).',
    ],
    limitations: [
      'Requires aerobic post-treatment to achieve stringent discharge limits (BOD < 10 mg/L).',
      'Inefficient in cold climates (< 15°C).',
    ],
  },

  // 2. Clarification Alternatives
  'ALT-CLAR-CONV': {
    id: 'ALT-CLAR-CONV',
    name: 'Conventional Circular Gravity Clarifier',
    category: 'PRIMARY',
    applicableFlowMinM3d: 1000,
    applicableFlowMaxM3d: 500000,
    footprintRating: 4,
    capexRating: 3,
    opexRating: 2,
    energyIntensityKwhPerM3: 0.05,
    sludgeProductionKgPerKgBod: 0,
    operatorSkillRequired: 'UNSKILLED',
    bnrCapability: 'NONE',
    shockLoadResilience: 'MEDIUM',
    incompatibleTechnologies: [],
    advantages: [
      'Simple mechanical scraper bridge mechanism.',
      'High hydraulic buffer capacity.',
    ],
    limitations: ['Large land footprint.'],
  },

  'ALT-CLAR-LAMELLA': {
    id: 'ALT-CLAR-LAMELLA',
    name: 'Lamella Inclined Plate Settler',
    category: 'PRIMARY',
    applicableFlowMinM3d: 500,
    applicableFlowMaxM3d: 200000,
    footprintRating: 1, // 80% footprint reduction
    capexRating: 4,
    opexRating: 2,
    energyIntensityKwhPerM3: 0.06,
    sludgeProductionKgPerKgBod: 0,
    operatorSkillRequired: 'SEMI_SKILLED',
    bnrCapability: 'NONE',
    shockLoadResilience: 'HIGH',
    incompatibleTechnologies: [],
    advantages: [
      'Reduces clarifier footprint by up to 80% using 60° inclined plate packs.',
      'High surface loading rate (SOR 4-8 m/h).',
    ],
    limitations: ['Plate pack cleaning required to prevent algae growth or fouling.'],
  },
};

export class ScenarioEngine {
  /**
   * Factory to build a baseline default Scenario A.
   */
  public static createDefaultScenario(
    id: string,
    name: string,
    description: string,
    designBasis: DesignBasis,
    influentQuality: InfluentQuality
  ): ScenarioState {
    return {
      id,
      name,
      description,
      isBaseline: id === 'SCEN-A',
      subsystemModes: {
        PRELIMINARY: 'ON',
        PRIMARY: 'ON',
        BIOLOGICAL: 'ON',
        SECONDARY_CLARIFIER: 'ON',
        TERTIARY: 'AUTO',
        DISINFECTION: 'ON',
        SLUDGE: 'ON',
      },
      subsystemOverrides: {
        BIOLOGICAL: 'ALT-CAS',
        PRIMARY: 'ALT-CLAR-CONV',
      },
      designBasis,
      influentQuality,
      sewerNetwork: SewerNetworkEngine.createDefaultNetwork(designBasis.peakFlowLps || 175),
      preliminaryPrimary: undefined, // Populated during master project initialization / runAllCalculations
      processNodes: [],
      totalFootprintM2: 8500,
      totalCapexUSD: 14500000,
      totalOpexUSDPerYear: 620000,
      netEnergyKw: 285,
      complianceScorePct: 98.5,
    };
  }

  /**
   * Clones an existing scenario into a new independent scenario (e.g., Scenario B).
   */
  public static cloneScenario(sourceScenario: ScenarioState, newId: string, newName: string): ScenarioState {
    const cloned: ScenarioState = JSON.parse(JSON.stringify(sourceScenario));
    cloned.id = newId;
    cloned.name = newName;
    cloned.isBaseline = false;
    cloned.description = `Cloned scenario based on ${sourceScenario.name}`;
    return cloned;
  }
}
