export type EducationLevel = 'school' | 'college' | 'university' | 'advanced';

export type PhysicsDomain = 
  | 'mechanics'
  | 'gravitation'
  | 'fluids'
  | 'waves'
  | 'thermal'
  | 'electricity'
  | 'magnetism'
  | 'electromagnetism'
  | 'optics'
  | 'modern';

export interface ParameterDef {
  id: string;
  name: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  description: string;
  levelRequired?: EducationLevel;
  category?: string;
}

export interface CalculationItem {
  value: number;
  unit: string;
  formula: string;
  substitution: string;
  interpretation: string;
}


export interface EquationDef {
  name: string;
  formulaLatex: string;
  plainText: string;
  description: string;
  level: EducationLevel;
}

export interface MeasurementToolDef {
  id: 'stopwatch' | 'ruler' | 'protractor' | 'vernier' | 'voltmeter' | 'ammeter' | 'pressureGauge' | 'speedRadar';
  name: string;
  unit: string;
  icon: string;
  description: string;
}

export interface GraphChannel {
  id: string;
  name: string;
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
  xUnit: string;
  yUnit: string;
  color: string;
}

export interface PredictionQuiz {
  question: string;
  context: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  conditionToTest: Record<string, number>;
}

export interface ExperimentMetadata {
  id: string;
  title: string;
  subtitle: string;
  domain: PhysicsDomain;
  subCategory: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'University';
  educationLevels: EducationLevel[];
  concept: string;
  theory: {
    overview: string;
    physicalLaws: string[];
    governingEquations: EquationDef[];
    assumptions: string[];
    realWorldApplications: string[];
    derivationSummary?: string;
  };
  parameters: ParameterDef[];
  presetScenarios?: {
    name: string;
    description: string;
    params: Record<string, number>;
  }[];
  defaultTools: string[];
  graphChannels: GraphChannel[];
  predictionQuiz: PredictionQuiz;
  whyExplanation: {
    keyQuestion: string;
    schoolExplanation: string;
    collegeExplanation: string;
    universityExplanation: string;
    governingPrinciple: string;
  };
  prerequisites: string[];
  relatedTopics: { id: string; title: string; domain: PhysicsDomain }[];
}

export interface SimulationState {
  time: number;
  isRunning: boolean;
  isPaused: boolean;
  speed: number;
  showVectors: boolean;
  showGrid: boolean;
  showTrace: boolean;
  activeTools: string[];
  recordedData: Record<string, any>[];
  lapTimes: number[];
}

export interface NotebookEntry {
  id: string;
  experimentId: string;
  experimentTitle: string;
  timestamp: string;
  educationLevel: EducationLevel;
  parameters: Record<string, number>;
  observations: Record<string, number | string>;
  calculatedValues: Record<string, number | string>;
  studentNotes: string;
  conclusion: string;
  errorPercentage?: number;
}
