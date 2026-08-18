import {
  AcademicLevel,
  ExplanationDepth,
  WhyExplanation,
  WhatIfScenario,
  FormulaDetail,
  MistakeFeedback,
  UserProgressProfile
} from '../types/chemistry';

/**
 * Normalizes any string representation of AcademicLevel into standard 5 tiers:
 * 1: Class 9-10
 * 2: HSC
 * 3: Diploma
 * 4: University
 * 5: Engineering
 */
export function getStandardTier(level: AcademicLevel): 1 | 2 | 3 | 4 | 5 {
  const str = String(level).toLowerCase();
  if (str.includes('9') || str.includes('10') || str.includes('foundational') || str.includes('level 1')) {
    return 1;
  }
  if (str.includes('hsc') || str.includes('senior') || str.includes('level 2')) {
    return 2;
  }
  if (str.includes('diploma') || str.includes('level 3')) {
    return 3;
  }
  if (str.includes('engineering') || str.includes('technical') || str.includes('level 5')) {
    return 5;
  }
  if (str.includes('university') || str.includes('advanced') || str.includes('level 4')) {
    return 4;
  }
  return 2; // Default to HSC
}

export function getTierLabel(tier: 1 | 2 | 3 | 4 | 5): string {
  switch (tier) {
    case 1:
      return 'CLASS 9–10';
    case 2:
      return 'HSC';
    case 3:
      return 'DIPLOMA';
    case 4:
      return 'UNIVERSITY';
    case 5:
      return 'ENGINEERING';
  }
}

export function getTierDescription(tier: 1 | 2 | 3 | 4 | 5): string {
  switch (tier) {
    case 1:
      return 'Intuitive particle concepts, color transitions, everyday analogies, minimal formulas.';
    case 2:
      return 'Stoichiometry, mole concept, Ka/Kb equilibrium, balanced equations, standard titration.';
    case 3:
      return 'Practical lab techniques, instrumental precision, error tolerances, chemical safety.';
    case 4:
      return 'Rigorous thermodynamics, kinetics derivations, Nernst potentials, quantum shells.';
    case 5:
      return 'Industrial process parameters, activity coefficients, non-ideal corrections, sensor tolerances.';
  }
}

// 1. Learning Level Engine
export const LearningLevelEngine = {
  getTier: getStandardTier,
  getLabel: getTierLabel,
  getDescription: getTierDescription,

  shouldShowAdvancedDerivations(level: AcademicLevel): boolean {
    const tier = getStandardTier(level);
    return tier >= 4;
  },

  shouldShowUncertaintyAndErrors(level: AcademicLevel): boolean {
    const tier = getStandardTier(level);
    return tier >= 3;
  },

  shouldShowIndustrialEngineering(level: AcademicLevel): boolean {
    const tier = getStandardTier(level);
    return tier === 5;
  },

  getVocabulary(term: string, level: AcademicLevel): string {
    const tier = getStandardTier(level);
    const vocabMap: Record<string, { 1: string; 2: string; 3: string; 4: string; 5: string }> = {
      pH: {
        1: 'Acid / Base meter reading',
        2: 'Hydrogen ion concentration measure',
        3: 'Potentiometric acidity index',
        4: 'Negative decimal logarithm of hydrogen ion activity: -log₁₀(a_H⁺)',
        5: 'Electrochemical potential activity quotient with glass electrode temperature compensation'
      },
      titration: {
        1: 'Adding drops until color changes to find acid strength',
        2: 'Quantitative volumetric neutralization to find unknown concentration',
        3: 'Volumetric standard analysis using calibrated burettes and indicators',
        4: 'Equivalence determination via potentiometric inflection d(pH)/dV and ICE equilibria',
        5: 'Automated potentiometric endpoint detection for industrial process quality control'
      },
      equilibrium: {
        1: 'Balanced state where forward and backward changes happen at the same speed',
        2: 'Dynamic state where rate of forward reaction equals rate of reverse reaction',
        3: 'Reversible process state governed by reaction quotient Q and equilibrium constant Kc',
        4: 'Thermodynamic state where Gibbs free energy ΔG = 0 and ΔG° = -RT ln(K)',
        5: 'Multi-phase chemical equilibrium with fugacity and non-ideal activity coefficients'
      },
      catalyst: {
        1: 'A helper substance that speeds up a reaction without being used up',
        2: 'A substance that increases reaction rate by providing an alternative pathway with lower activation energy (Ea)',
        3: 'A kinetic promoter that accelerates equilibrium attainment without shifting equilibrium position',
        4: 'A species that alters the transition state free energy ΔG‡ through adsorption or orbital interaction',
        5: 'Heterogeneous / homogeneous catalytic material optimized for turn-over frequency (TOF) and selectivity'
      }
    };

    const entry = vocabMap[term];
    if (!entry) return term;
    return entry[tier];
  }
};

// 2. Adaptive Explanation Engine
export const ExplanationEngine = {
  getAdaptiveExplanation(
    level: AcademicLevel,
    explanations: {
      simple: string;
      standard: string;
      advanced: string;
      engineering?: string;
    }
  ): string {
    const tier = getStandardTier(level);
    if (tier === 1) return explanations.simple;
    if (tier === 2 || tier === 3) return explanations.standard;
    if (tier === 5 && explanations.engineering) return explanations.engineering;
    return explanations.advanced;
  }
};

// 3. Why Engine (Contextual causality and reasoning)
export const WhyEngine = {
  generateWhyExplanation(
    experimentId: string,
    eventDescription: string,
    level: AcademicLevel
  ): WhyExplanation {
    const tier = getStandardTier(level);

    if (experimentId === 'titration') {
      return {
        title: 'Why does the indicator color change rapidly near equivalence?',
        simple:
          'Because near the balance point, even a single drop of base removes the last traces of acid, causing a huge jump in pH that triggers the dye.',
        standard:
          'Near equivalence, the unreacted [H⁺] is extremely small (around 10⁻⁷ M). Adding a fraction of a drop of 0.1 M NaOH supplies vastly more OH⁻ ions than remaining H⁺ ions, causing pH to surge by 4–6 units across a tiny volume.',
        advanced:
          'On a logarithmic scale, pH = -log₁₀[H⁺]. When [H⁺] drops from 10⁻⁴ to 10⁻¹⁰ M, the mathematical derivative d(pH)/dV approaches an asymptote at the equivalence point where stoichiometric moles n(acid) = n(base).',
        engineering:
          'The steep sigmoidal inflection requires high-speed feedback control in automated industrial neutralization tanks to prevent severe overshooting beyond environmental discharge pH limits (6.5–8.5).',
        macroscopic: 'The flask solution turns from crystal clear to distinct pale pink (phenolphthalein).',
        molecular:
          'Hydroxide ions (OH⁻) from the burette bind free hydronium ions (H₃O⁺) to form neutral water molecules (H₂O). Once all H₃O⁺ are neutralized, excess OH⁻ deprotonates the indicator molecule (HIn → In⁻), shifting its conjugated π-electron system to absorb green light and reflect pink.',
        mathematical: 'C₁V₁ = C₂V₂ (Stoichiometric point); pH = 7.00 for strong acid + strong base at 25°C.',
        realWorld:
          'Used daily in pharmaceutical purity testing, food acidity measurement (vinegar & citrus), and wastewater treatment neutralization.'
      };
    }

    if (experimentId === 'gas_law') {
      return {
        title: 'Why does gas pressure increase when volume decreases at constant temperature?',
        simple:
          'When you squeeze the container, the gas particles are packed closer together, so they hit the walls much more often.',
        standard:
          "According to Boyle's Law (P ∝ 1/V), decreasing volume halves the surface area available to the same number of gas particles. Collision frequency with the chamber walls doubles, doubling measured pressure.",
        advanced:
          'From Kinetic Molecular Theory, P = (1/3)·(N·m·v_rms²)/V. Because temperature is constant, mean kinetic energy and root-mean-square speed (v_rms) are constant. Reducing V increases the number density (N/V), directly scaling wall momentum transfer per second.',
        engineering:
          'Critical for reciprocating compressors, gas turbine stages, and pneumatic hydraulic actuators where adiabatic heat generation (PV^γ = const) must be managed.',
        macroscopic: 'The pressure gauge needle climbs proportionally as the piston is pressed downward.',
        molecular:
          'Gas particles travel in straight lines until colliding elastically with container walls. Higher spatial density means more collision events per square centimeter per second.',
        mathematical: 'P₁V₁ = P₂V₂ (Boyle\'s Law, T = const).',
        realWorld: 'Piston engines, scuba diving tanks, bicycle pumps, and natural gas pipeline transport.'
      };
    }

    if (experimentId === 'kinetics') {
      return {
        title: 'Why does increasing temperature dramatically speed up a chemical reaction?',
        simple:
          'Molecules move faster and collide with much more energy. More collisions have enough punch to react.',
        standard:
          'Raising temperature shifts the Maxwell-Boltzmann kinetic energy distribution to the right. A significantly higher fraction of molecules possess kinetic energy equal to or greater than the Activation Energy (E ≥ Ea).',
        advanced:
          'The Arrhenius equation k = A·e^(-Ea/RT) exhibits exponential dependence on temperature. For reactions with typical Ea ~ 50 kJ/mol, a 10 K rise roughly doubles the rate constant k.',
        engineering:
          'Used to optimize reactor residence time and prevent thermal runaway in exothermic chemical synthesis (e.g., Haber-Bosch ammonia, polymerization).',
        macroscopic: 'Bubbles form faster, color changes rapidly, and product concentration rises quickly.',
        molecular:
          'Reactant particles must collide with sufficient kinetic energy and correct geometric orientation to overcome the transition state barrier.',
        mathematical: 'ln(k₂/k₁) = (Ea / R) · (1/T₁ - 1/T₂)',
        realWorld: 'Food refrigeration (slowing spoilage), industrial chemical reactors, catalytic converters.'
      };
    }

    // Default Fallback
    return {
      title: `Why did this happen in ${experimentId}?`,
      simple: `The change occurred because particles reacted according to basic physical and chemical laws.`,
      standard: `The system adjusted its microscopic particle interactions and concentrations in response to the changed variable: ${eventDescription}.`,
      advanced: `The driving force is governed by thermodynamic stability (minimizing Gibbs free energy ΔG) and kinetic reaction rates.`,
      macroscopic: `Observable changes in meter readings, color, or reaction speed.`,
      molecular: `Particles collide, transfer electrons, or shift ionic equilibrium positions.`,
      mathematical: `Governed by fundamental physical chemistry laws.`,
      realWorld: `Applied widely across industrial synthesis and laboratory analytics.`
    };
  }
};

// 4. What-If Engine (Universal causality simulator)
export const WhatIfEngine = {
  getScenariosForLab(labId: string): WhatIfScenario[] {
    switch (labId) {
      case 'titration':
        return [
          {
            id: 'increase_titrant_conc',
            variableChanged: 'Titrant Concentration (NaOH) ↑',
            direction: 'increase',
            causalityChain: [
              'NaOH concentration increases (e.g. 0.1 M → 0.2 M)',
              'Each drop contains 2× more hydroxide ions (OH⁻)',
              'Fewer total drops needed to neutralize the same acid moles',
              'Equivalence volume (V_equiv) shifts left to a smaller volume',
              'Titration curve becomes even steeper at inflection point'
            ],
            scientificModel: 'Volumetric Stoichiometry: n(base) = C_base · V_base',
            mathematicalRelationship: 'V_equiv = (C_acid · V_acid) / C_base  (Inverse proportionality)',
            graphConsequence: 'Inflection point moves from 25.0 mL to 12.5 mL',
            realWorldSignificance: 'Using concentrated titrants saves time but reduces measurement precision.'
          },
          {
            id: 'use_weak_acid',
            variableChanged: 'Switch Strong Acid (HCl) to Weak Acid (CH₃COOH)',
            direction: 'change_species',
            causalityChain: [
              'Acetic acid only partially ionizes in water (Ka = 1.8 × 10⁻⁵)',
              'Initial pH starts higher (~2.88 instead of 1.00)',
              'Buffer region forms as acetate (CH₃COO⁻) builds up',
              'Equivalence point pH shifts to basic (pH ~8.72 instead of 7.00)',
              'Methyl orange indicator will fail; phenolphthalein must be used'
            ],
            scientificModel: 'Weak Acid Ionization & Henderson-Hasselbalch Buffer Equilibrium',
            mathematicalRelationship: 'pH = pKa + log([A⁻]/[HA])',
            graphConsequence: 'Produces a buffer plateau between pH 4 and 5; shorter vertical jump at equivalence.',
            realWorldSignificance: 'Essential for analyzing organic acids in food, blood plasma buffers, and wine brewing.'
          }
        ];

      case 'gas_law':
        return [
          {
            id: 'increase_temp',
            variableChanged: 'Temperature (T) ↑',
            direction: 'increase',
            causalityChain: [
              'Thermal energy transferred to gas particles',
              'Root-mean-square molecular velocity increases (v_rms ∝ √T)',
              'Particles hit piston walls with greater momentum and frequency',
              'Internal pressure increases if volume is fixed (Gay-Lussac\'s Law)',
              'Piston expands outward if pressure is held constant (Charles\'s Law)'
            ],
            scientificModel: 'Kinetic Molecular Theory of Gases',
            mathematicalRelationship: 'PV = nRT  =>  P ∝ T (V=const) or V ∝ T (P=const)',
            graphConsequence: 'Linear upward slope on V vs T plot; isothermal curve shifts outward on P-V plot.',
            realWorldSignificance: 'Explains tire pressure increases on hot highway drives and hot air balloon buoyancy.'
          },
          {
            id: 'decrease_vol',
            variableChanged: 'Piston Volume (V) ↓',
            direction: 'decrease',
            causalityChain: [
              'Available volume inside chamber shrinks',
              'Particle number density (n/V) increases',
              'Collisions per unit wall area per second rise in direct proportion',
              'Measured pressure (P) doubles when volume is halved'
            ],
            scientificModel: 'Boyle\'s Law (Isothermal Compression)',
            mathematicalRelationship: 'P₁V₁ = P₂V₂ = constant',
            graphConsequence: 'Hyperbolic curve on P vs V plot; linear slope on P vs 1/V plot.',
            realWorldSignificance: 'Basis of diesel engine fuel-air ignition through rapid compression heating.'
          }
        ];

      case 'kinetics':
        return [
          {
            id: 'add_catalyst',
            variableChanged: 'Add Catalyst',
            direction: 'add_catalyst',
            causalityChain: [
              'Catalyst provides an alternate reaction mechanism',
              'Activation energy barrier decreases (Ea drops from 75 to 40 kJ/mol)',
              'Exponential term e^(-Ea/RT) in Arrhenius equation increases by orders of magnitude',
              'A vastly higher fraction of molecular collisions become effective',
              'Reaction rate surges without altering ΔH or equilibrium position'
            ],
            scientificModel: 'Catalytic Activation Barrier Reduction & Arrhenius Equation',
            mathematicalRelationship: 'k = A · e^(-Ea / RT)',
            graphConsequence: 'Energy profile peak is lowered; concentration vs time curve flattens in a fraction of the time.',
            realWorldSignificance: 'Enzyme biological functions and industrial catalysts (Haber-Bosch Fe, contact process V₂O₅).'
          },
          {
            id: 'double_concentration',
            variableChanged: 'Reactant Concentration [A] ↑',
            direction: 'increase',
            causalityChain: [
              'More reactant particles crowded in same solution volume',
              'Collision frequency between reactant molecules increases',
              'For a 1st order reaction, rate doubles; for 2nd order, rate quadruples',
              'Initial rate slope steepens dramatically'
            ],
            scientificModel: 'Collision Theory & Differential Rate Law',
            mathematicalRelationship: 'Rate = k [A]^m [B]^n',
            graphConsequence: 'Steeper initial tangent slope on [Product] vs time curve.',
            realWorldSignificance: 'Controls reaction pace in battery discharge and chemical syntheses.'
          }
        ];

      default:
        return [];
    }
  }
};

// 5. Formula Explanation Engine (Interactive multi-layer decomposition)
export const FormulaExplanationEngine = {
  getFormulaDetails(formulaId: string): FormulaDetail | null {
    const formulas: Record<string, FormulaDetail> = {
      molarity: {
        id: 'molarity',
        latex: 'M = n / V',
        name: 'Molarity (Molar Concentration)',
        simpleMeaning: 'Molarity tells us how much solute is dissolved in a given volume of solution.',
        variables: [
          {
            symbol: 'M',
            name: 'Molarity',
            unit: 'mol/L or M',
            meaningSimple: 'Concentration of the solution',
            meaningAdvanced: 'Amount of solute substance per unit volume of total solution',
            physicalRole: 'Determines the density of dissolved solute particles.'
          },
          {
            symbol: 'n',
            name: 'Amount of Solute',
            unit: 'moles (mol)',
            meaningSimple: 'Number of chemical particles / moles',
            meaningAdvanced: 'Substance quantity where 1 mol = 6.022 × 10²³ chemical units',
            physicalRole: 'Count of active molecules/ions in the container.'
          },
          {
            symbol: 'V',
            name: 'Volume of Solution',
            unit: 'Liters (L)',
            meaningSimple: 'Total liquid space',
            meaningAdvanced: 'Total volume occupied by the solution at measurement temperature',
            physicalRole: 'Space across which the particles are dispersed.'
          }
        ],
        units: 'mol · L⁻¹',
        derivationSummary: 'Directly derived from the definition of concentration as intensive quantity.',
        assumptions: ['Uniform dissolution (homogeneous solution)', 'Volume additivity is approximately valid'],
        limitations: ['Temperature dependent due to thermal expansion of solvent volume (use molality for high-precision thermodynamics)'],
        physicalSimulationConnection: 'Increasing n increases particle density visibly. Increasing V dilutes particle spacing.'
      },

      ph_definition: {
        id: 'ph_definition',
        latex: 'pH = -log₁₀[H⁺]',
        name: 'pH Definition (Acidity Index)',
        simpleMeaning: 'A 0 to 14 scale showing if something is acidic (<7), neutral (7), or basic (>7).',
        variables: [
          {
            symbol: 'pH',
            name: 'Potential of Hydrogen',
            unit: 'dimensionless',
            meaningSimple: 'Acidity index',
            meaningAdvanced: 'Negative common logarithm of hydronium ion molar concentration/activity',
            physicalRole: 'Directly dictates indicator color and chemical reactivity.'
          },
          {
            symbol: '[H⁺]',
            name: 'Hydronium Ion Concentration',
            unit: 'mol/L (M)',
            meaningSimple: 'Amount of acid ions in the water',
            meaningAdvanced: 'Molar concentration of free solvated H₃O⁺ ions in aqueous equilibrium',
            physicalRole: 'Active corrosive/acidic particle count.'
          }
        ],
        units: 'dimensionless (logarithmic scale)',
        derivationSummary: 'Sørensen (1909) introduced pH to avoid cumbersome exponents like 1.0 × 10⁻⁷ M.',
        assumptions: ['Dilute aqueous solution where activity coefficient γ_H⁺ ≈ 1.0'],
        limitations: ['In concentrated acids (> 1 M), ionic strength requires activity treatment: pH = -log₁₀(a_H⁺) where a = γ · C'],
        physicalSimulationConnection: 'Every 1-unit decrease in pH represents a 10× increase in red H⁺ particles in the molecular viewport.'
      },

      ideal_gas_law: {
        id: 'ideal_gas_law',
        latex: 'P · V = n · R · T',
        name: 'Ideal Gas Equation of State',
        simpleMeaning: 'Connects pressure, volume, amount, and temperature of a gas in one universal equation.',
        variables: [
          {
            symbol: 'P',
            name: 'Pressure',
            unit: 'atm or Pa',
            meaningSimple: 'How hard particles push on the walls',
            meaningAdvanced: 'Force exerted by particle collisions per unit surface area',
            physicalRole: 'Piston force indicator.'
          },
          {
            symbol: 'V',
            name: 'Volume',
            unit: 'Liters (L) or m³',
            meaningSimple: 'Size of the container',
            meaningAdvanced: '3D spatial volume available for particle translation',
            physicalRole: 'Chamber boundary.'
          },
          {
            symbol: 'n',
            name: 'Moles of Gas',
            unit: 'mol',
            meaningSimple: 'Quantity of gas particles',
            meaningAdvanced: 'Number of gas molecules divided by Avogadro\'s number',
            physicalRole: 'Count of bouncing gas spheres.'
          },
          {
            symbol: 'R',
            name: 'Universal Gas Constant',
            unit: '0.082057 L·atm/(mol·K) or 8.314 J/(mol·K)',
            meaningSimple: 'Nature\'s constant link',
            meaningAdvanced: 'Fundamental thermodynamic scaling constant (k_B · N_A)',
            physicalRole: 'Fixed proportionality constant.'
          },
          {
            symbol: 'T',
            name: 'Absolute Temperature',
            unit: 'Kelvin (K)',
            meaningSimple: 'How hot the gas is',
            meaningAdvanced: 'Direct measure of average translational kinetic energy (E_k = 3/2 k_B T)',
            physicalRole: 'Speed controller of particle animations.'
          }
        ],
        units: 'L·atm or Joules',
        derivationSummary: 'Synthesized from Boyle\'s, Charles\'s, Gay-Lussac\'s, and Avogadro\'s empirical laws.',
        assumptions: ['Gas particles have zero volume (point masses)', 'Zero intermolecular attractions/repulsions', 'All collisions are 100% elastic'],
        limitations: ['Deviates at high pressures and low temperatures where van der Waals corrections [P + a(n/V)²](V - nb) = nRT are required'],
        physicalSimulationConnection: 'Raising T speeds up particle motion vectors; dragging piston alters chamber V.'
      },

      arrhenius_equation: {
        id: 'arrhenius_equation',
        latex: 'k = A · e^(-Ea / (R · T))',
        name: 'Arrhenius Kinetics Equation',
        simpleMeaning: 'Explains why reactions speed up exponentially when temperature goes up.',
        variables: [
          {
            symbol: 'k',
            name: 'Rate Constant',
            unit: 's⁻¹ or L/(mol·s)',
            meaningSimple: 'Reaction speed factor',
            meaningAdvanced: 'Specific rate constant relating reactant concentration to reaction velocity',
            physicalRole: 'Speed constant.'
          },
          {
            symbol: 'A',
            name: 'Pre-exponential Factor',
            unit: 'same as k',
            meaningSimple: 'Collision frequency factor',
            meaningAdvanced: 'Frequency of collisions with proper steric molecular orientation',
            physicalRole: 'Total collision attempt frequency.'
          },
          {
            symbol: 'Ea',
            name: 'Activation Energy',
            unit: 'J/mol or kJ/mol',
            meaningSimple: 'Energy hurdle to start reacting',
            meaningAdvanced: 'Minimum kinetic threshold required to reach transition state',
            physicalRole: 'Height of the potential energy hill.'
          },
          {
            symbol: 'T',
            name: 'Temperature',
            unit: 'Kelvin (K)',
            meaningSimple: 'Thermal energy level',
            meaningAdvanced: 'Average kinetic energy of colliding species',
            physicalRole: 'Kinetic energy distribution driver.'
          }
        ],
        units: 'Reaction order dependent',
        derivationSummary: 'Proposed by Svante Arrhenius in 1889 based on van \'t Hoff thermodynamic equilibrium temperature relations.',
        assumptions: ['Activation energy Ea is constant over the analyzed temperature window', 'Transition state theory holds'],
        limitations: ['Non-Arrhenius behavior occurs in enzyme catalysis, tunneling reactions, or complex multi-step radical chain pathways'],
        physicalSimulationConnection: 'Particles that collide with energy > Ea trigger visual flash and product formation.'
      }
    };

    return formulas[formulaId] || null;
  }
};

// 6. Mistake Feedback Engine (Pedagogical Error Analysis)
export const MistakeFeedbackEngine = {
  analyzeTitrationMistake(
    titrantAdded: number,
    vEquiv: number,
    indicator: string,
    currentPH: number
  ): MistakeFeedback | null {
    const diff = titrantAdded - vEquiv;

    if (diff > 2.0) {
      return {
        whatHappened: `You added ${titrantAdded.toFixed(2)} mL of NaOH, significantly overshooting the equivalence volume of ${vEquiv.toFixed(2)} mL.`,
        expectedBehavior: `Stop the burette stopcock precisely at the first persistent faint color change (pH ~7.0–8.5 for strong acid titration), which occurs at exactly ${vEquiv.toFixed(2)} mL.`,
        whereMistakeOccurred: 'Burette valve was kept open at high flow rate near the steep inflection region.',
        scientificReason:
          'Because the titration curve is nearly vertical at equivalence, adding 1–2 mL of excess base floods the solution with unreacted OH⁻ ions, pushing pH to > 11 and ruining volumetric accuracy.',
        remedyAction:
          'Reset the burette or switch to "+1 Drop (0.05 mL)" mode when approaching within 2 mL of the expected titre.'
      };
    }

    if (titrantAdded > 0 && titrantAdded < vEquiv - 3.0 && currentPH < 4.0) {
      return {
        whatHappened: `You stopped titration at ${titrantAdded.toFixed(2)} mL, well before the neutralization point.`,
        expectedBehavior: `Continue adding titrant until the indicator shifts color permanently.`,
        whereMistakeOccurred: 'Prematurely logged trial before reaching endpoint.',
        scientificReason: 'Unreacted acid remains in high excess in the flask.',
        remedyAction: 'Re-open the burette valve to continue titrating towards equivalence.'
      };
    }

    return null;
  }
};

// 7. Progress & Recommendation Engine (LocalStorage backed)
const PROGRESS_STORAGE_KEY = 'evlab_chemistry_user_progress';

export const ProgressEngine = {
  getProfile(): UserProgressProfile {
    try {
      const stored = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read progress from localStorage');
    }

    return {
      completedTopics: [],
      completedLabs: [],
      challengesSolved: [],
      totalTrialsLogged: 0,
      accuracyScore: 100,
      weakConcepts: [],
      masteredConcepts: [],
      lastActiveLevel: 'Class 9-10'
    };
  },

  saveProfile(profile: UserProgressProfile): void {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Could not save progress to localStorage');
    }
  },

  markTopicCompleted(topicId: string): void {
    const profile = this.getProfile();
    if (!profile.completedTopics.includes(topicId)) {
      profile.completedTopics.push(topicId);
      this.saveProfile(profile);
    }
  },

  markLabCompleted(labId: string): void {
    const profile = this.getProfile();
    if (!profile.completedLabs.includes(labId)) {
      profile.completedLabs.push(labId);
      this.saveProfile(profile);
    }
  },

  markChallengeSolved(challengeId: string): void {
    const profile = this.getProfile();
    if (!profile.challengesSolved.includes(challengeId)) {
      profile.challengesSolved.push(challengeId);
      this.saveProfile(profile);
    }
  },

  logTrial(): void {
    const profile = this.getProfile();
    profile.totalTrialsLogged += 1;
    this.saveProfile(profile);
  },

  getSmartRecommendation(): {
    title: string;
    description: string;
    actionLabId: string;
    actionLabel: string;
  } {
    const profile = this.getProfile();

    if (!profile.completedLabs.includes('titration')) {
      return {
        title: 'Master Volumetric Precision',
        description: 'Explore the complete acid-base neutralization cycle with live pH curves and indicator transitions.',
        actionLabId: 'titration',
        actionLabel: 'Launch Titration Lab'
      };
    }

    if (!profile.completedLabs.includes('gas_law')) {
      return {
        title: 'Connect Particles to Pressure & Temperature',
        description: 'Simulate kinetic molecular collisions in a piston chamber under Boyle and Charles laws.',
        actionLabId: 'gas_law',
        actionLabel: 'Launch Gas Laws Lab'
      };
    }

    if (!profile.completedLabs.includes('kinetics')) {
      return {
        title: 'Explore Collision Theory & Catalysts',
        description: 'Discover how temperature, activation energy, and catalysts control reaction speeds.',
        actionLabId: 'kinetics',
        actionLabel: 'Launch Kinetics Lab'
      };
    }

    return {
      title: 'Advance to Electrochemistry',
      description: 'Build a Daniell galvanic cell, measure non-standard EMF with Nernst equation, and track ion flow.',
      actionLabId: 'electrochemistry',
      actionLabel: 'Launch Electrochemistry Lab'
    };
  }
};
