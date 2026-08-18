export type EducationalLevel = 
  | "School (Class 9-10 / SSC)"
  | "Higher Secondary (HSC / College)"
  | "Diploma / Polytechnic"
  | "University BSc"
  | "Advanced Engineering";

export type DepthLevelNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface DepthLevelInfo {
  level: DepthLevelNumber;
  name: string;
  badge: string;
  focus: string;
  description: string;
}

export const DEPTH_LEVELS: DepthLevelInfo[] = [
  { level: 1, name: "Level 1 — Visual Intuition", badge: "Intuitive", focus: "Look & Touch", description: "Pure physical and visual models without intimidating algebraic symbols." },
  { level: 2, name: "Level 2 — School Math (Class 9-10)", badge: "School", focus: "Basic Algebra & Graphs", description: "Foundational formulas, coordinates, proportions, and basic rates of change." },
  { level: 3, name: "Level 3 — HSC / College", badge: "HSC", focus: "Standard Rules & Proofs", description: "Formal rules, identities, tangents, Riemann integrals, and algebraic derivations." },
  { level: 4, name: "Level 4 — Diploma / Applied", badge: "Diploma", focus: "Practical Computation", description: "Units, circuits, mechanics, approximate calculations, and lab measurements." },
  { level: 5, name: "Level 5 — University BSc", badge: "BSc", focus: "Rigorous Analysis", description: "Epsilon-delta definitions, convergence criteria, vector spaces, and abstract theorems." },
  { level: 6, name: "Level 6 — Engineering Application", badge: "Engineering", focus: "EV & Real Systems", description: "Control systems, battery ODEs, electromagnetic vectors, signal processing, and numerical tolerance." },
  { level: 7, name: "Level 7 — Advanced Mathematics", badge: "Advanced", focus: "Tensors & Fields", description: "Differential forms, tensor fields, multi-dimensional manifolds, and stochastic calculus." }
];

export type TopicCategory =
  | "Number Systems & Arithmetic"
  | "Algebra & Equations"
  | "Geometry & Theorems"
  | "Trigonometry"
  | "Functions & Curves"
  | "Limits & Continuity"
  | "Differential Calculus"
  | "Integral Calculus"
  | "Motion & Kinematics"
  | "Differential Equations"
  | "Vectors & 3D Geometry"
  | "Linear Algebra & Matrices"
  | "Multivariable Calculus"
  | "Fourier & Signal Analysis"
  | "Probability & Experiments"
  | "Statistics & Data"
  | "Sequences & Series";

export type PerspectiveMode = "pure" | "applied" | "engineering";

export type LayerType = "LEARN" | "VISUALIZE" | "EXPERIMENT" | "CALCULATE" | "UNDERSTAND" | "APPLY" | "DISCOVER" | "DERIVE" | "COMPARE";

export interface VariableControl {
  id: string;
  name: string;
  symbol: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
  description: string;
}

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  variables: Record<string, number>;
  functionType?: string;
}

export interface PracticeChallenge {
  id: string;
  title: string;
  question: string;
  targetCondition: string;
  hint: string;
  initialVariables: Record<string, number>;
  validator: (vars: Record<string, number>) => boolean;
  successMessage: string;
}

export interface DiscoveryStage {
  step: number;
  instruction: string;
  promptQuestion: string;
  interactiveVariable: string;
  targetValue: number;
  revealFormulaPart: string;
  insight: string;
}

export interface DiscoveryExperiment {
  id: string;
  title: string;
  conceptName: string;
  starterQuestion: string;
  stages: DiscoveryStage[];
  finalFormula: string;
  finalDerivationSummary: string;
}

export interface FormulaDerivationStep {
  stepIndex: number;
  stepTitle: string;
  latex: string;
  geometricIntuition: string;
  diagramDescription?: string;
}

export interface FormulaDerivation {
  id: string;
  formulaTitle: string;
  finalLatex: string;
  summary: string;
  steps: FormulaDerivationStep[];
}

export interface BilingualNote {
  englishTerm: string;
  banglaTerm: string;
  banglaIntuition: string;
}

export interface TopicDefinition {
  id: string;
  title: string;
  category: TopicCategory;
  levelBadge: string;
  iconName: string;
  summary: string;
  bilingual?: BilingualNote;
  
  // Math Story Intro
  storyMode?: {
    hookQuestion: string;
    scenario: string;
    mathematicalBridge: string;
  };

  // 1. LEARN Layer
  learn?: {
    definition: string;
    intuition: string;
    keyFormulas: { label: string; formula: string; explanation: string }[];
    notationExplanation: string;
    assumptions: string[];
    levelSpecificNotes: Record<string, string>;
  };

  // 2. VISUALIZE & 3. EXPERIMENT Layer
  visualizationType: 
    | "algebra-balance"
    | "algebra-area-model"
    | "number-line"
    | "geometry-conic"
    | "geometry-proof"
    | "trig-unit-circle"
    | "function-explorer"
    | "limit-continuity"
    | "calculus-derivative"
    | "calculus-integral"
    | "motion-kinematics"
    | "differential-equations"
    | "vector-2d3d"
    | "matrix-transform"
    | "multivariable-3d"
    | "vector-field"
    | "fourier-synthesis"
    | "probability-stats"
    | "probability-experiment"
    | "statistics-data"
    | "sequences-series";
  
  defaultVariables: Record<string, number>;
  variableControls: VariableControl[];
  presets: PresetScenario[];

  // 4. CALCULATE Layer
  calculate: {
    symbolicSteps: { step: number; title: string; latex: string; explanation: string }[];
    exactResultFormula?: string;
  };

  // 5. UNDERSTAND Layer
  understand: {
    dynamicExplanationFn: (vars: Record<string, number>) => string;
    commonMistakes: { mistake: string; correction: string; why: string }[];
    whatIfScenarios: { action: string; result: string }[];
  };

  // 6. APPLY Layer
  apply: {
    domain: string;
    title: string;
    description: string;
    realWorldExample: string;
    engineeringFormula: string;
    diagramDescription?: string;
  }[];

  // Discovery Mode
  discovery?: DiscoveryExperiment;

  // Visual Proof / Derivation
  derivation?: FormulaDerivation;

  // Practice Challenges
  challenges: PracticeChallenge[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
}
