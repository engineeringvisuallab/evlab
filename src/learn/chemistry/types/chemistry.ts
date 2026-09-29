export type AcademicLevel =
  | 'Class 9-10'
  | 'HSC'
  | 'Diploma'
  | 'University'
  | 'Engineering'
  | 'Level 1 - Class 9-10'
  | 'Level 2 - HSC'
  | 'Level 3 - Diploma / College'
  | 'Level 4 - University'
  | 'Level 5 - Engineering'
  | 'Class 9-10 (Foundational)'
  | 'HSC / Senior Secondary'
  | 'College / AP Chemistry'
  | 'University (Advanced)';

export type LabViewMode = 'lab' | 'molecular' | 'math';
export type ExperimentExecutionMode = 'guided' | 'free' | 'challenge';
export type ExplanationDepth = 'simple' | 'standard' | 'advanced' | 'engineering';

export interface WhyExplanation {
  title: string;
  simple: string;
  standard: string;
  advanced: string;
  engineering?: string;
  macroscopic: string;
  molecular: string;
  mathematical: string;
  realWorld: string;
  relatedFormula?: string;
}

export interface WhatIfScenario {
  id: string;
  variableChanged: string;
  direction: 'increase' | 'decrease' | 'add_catalyst' | 'change_species';
  causalityChain: string[];
  scientificModel: string;
  mathematicalRelationship: string;
  graphConsequence: string;
  realWorldSignificance: string;
}

export interface FormulaVariable {
  symbol: string;
  name: string;
  unit: string;
  meaningSimple: string;
  meaningAdvanced: string;
  physicalRole: string;
}

export interface FormulaDetail {
  id: string;
  latex: string;
  name: string;
  simpleMeaning: string;
  variables: FormulaVariable[];
  units: string;
  derivationSummary?: string;
  assumptions: string[];
  limitations: string[];
  physicalSimulationConnection: string;
}

export interface ChallengeProblem {
  id: string;
  title: string;
  targetObjective: string;
  targetTolerance: number;
  initialParameters: Record<string, any>;
  hint: string;
  conceptTested: string;
  successMessage: string;
}

export interface ExperimentResultBreakdown {
  inputs: Record<string, { label: string; value: any; unit?: string }>;
  observation: string;
  molecularSummary: string;
  calculatedValues: Record<string, { label: string; value: any; unit?: string; formulaUsed?: string }>;
  interpretation: string;
  realWorldApplication: string;
  assumptions: string[];
  uncertaintyEstimate?: string;
}

export interface MistakeFeedback {
  whatHappened: string;
  expectedBehavior: string;
  whereMistakeOccurred: string;
  scientificReason: string;
  remedyAction: string;
}

export interface UserProgressProfile {
  completedTopics: string[];
  completedLabs: string[];
  challengesSolved: string[];
  totalTrialsLogged: number;
  accuracyScore: number;
  weakConcepts: string[];
  masteredConcepts: string[];
  lastActiveLevel: AcademicLevel;
}

export interface ElementData {
  number: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: 'alkali-metal' | 'alkaline-earth' | 'transition-metal' | 'post-transition' | 'metalloid' | 'nonmetal' | 'halogen' | 'noble-gas' | 'lanthanide' | 'actinide';
  group: number;
  period: number;
  block: 's' | 'p' | 'd' | 'f';
  electronConfiguration: string;
  electronsPerShell: number[];
  electronegativity: number | null; // Pauling scale
  atomicRadius: number | null; // pm
  ionizationEnergy: number | null; // kJ/mol (1st)
  electronAffinity: number | null; // kJ/mol
  meltingPoint: number | null; // K
  boilingPoint: number | null; // K
  density: number | null; // g/cm³
  oxidationStates: number[];
  discoveredBy: string;
  summary: string;
  uses: string[];
  colorHex?: string;
}

export interface MoleculeData {
  id: string;
  name: string;
  formula: string;
  iupacName: string;
  category: 'inorganic' | 'organic' | 'bio' | 'acid-base' | 'pollutant';
  molarMass: number;
  vseprGeometry: string;
  bondAngle: number;
  dipoleMoment: number; // Debye
  hybridization: string;
  atoms: Array<{
    id: string;
    element: string;
    x: number;
    y: number;
    z: number;
    charge?: number;
  }>;
  bonds: Array<{
    from: string;
    to: string;
    order: 1 | 2 | 3;
  }>;
  description: string;
  applications: string[];
}

export interface ReactionData {
  id: string;
  name: string;
  type: 'combination' | 'decomposition' | 'displacement' | 'double_displacement' | 'combustion' | 'redox' | 'acid_base' | 'precipitation' | 'organic';
  reactants: Array<{ formula: string; coefficient: number; state: 's' | 'l' | 'g' | 'aq'; name: string }>;
  products: Array<{ formula: string; coefficient: number; state: 's' | 'l' | 'g' | 'aq'; name: string }>;
  balancedEquation: string;
  deltaH?: number; // kJ/mol (negative = exothermic, positive = endothermic)
  deltaS?: number; // J/(mol*K)
  activationEnergy?: number; // kJ/mol
  equilibriumConstant?: number; // Kc at 298K
  visualObservations: {
    colorChange?: string;
    gasEvolved?: string;
    precipitate?: { formula: string; color: string };
    tempChange?: 'heats_up' | 'cools_down' | 'neutral';
  };
  molecularExplanation: string;
  realWorldApplications: string[];
}

export interface ExperimentTrial {
  id: string;
  experimentId: string;
  experimentName: string;
  timestamp: string;
  academicLevel: AcademicLevel;
  inputs: Record<string, any>;
  measurements: Record<string, any>;
  dataPoints: Array<{ x: number; y: number; label?: string }>;
  calculatedResults: Record<string, any>;
  notes?: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'glassware' | 'meter' | 'heating' | 'separation' | 'electrochemical' | 'safety';
  description: string;
  precision: string;
  safetyAdvice: string;
  svgIcon: string;
}

export interface LabSafetyInfo {
  chemicalName: string;
  ghsPictograms: ('flammable' | 'corrosive' | 'toxic' | 'health_hazard' | 'oxidizing' | 'environmental' | 'compressed_gas' | 'irritant')[];
  hazardStatements: string[];
  ppeRequired: string[];
  firstAid: string;
  disposalMethod: string;
}
