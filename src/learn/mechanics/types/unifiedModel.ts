import { CalculationStep, ValidationFlag } from './mechanics';

export type UserSkillLevel = 'Basic' | 'Engineering' | 'Advanced' | 'Professional';

export type WorkspaceActiveTab = 'build' | 'solve' | 'experiment' | 'learn' | 'exam' | 'realworld';

export type PhysicalObjectType =
  | 'beam'
  | 'block'
  | 'particle'
  | 'incline'
  | 'rigid_body'
  | 'node'
  | 'truss_member'
  | 'wheel'
  | 'slider_crank'
  | 'projectile';

export type LoadType =
  | 'point_force'
  | 'distributed_load'
  | 'moment'
  | 'torque'
  | 'weight'
  | 'friction'
  | 'reaction_force'
  | 'tension';

export type SupportType =
  | 'pin'
  | 'roller'
  | 'fixed'
  | 'hinge'
  | 'cable'
  | 'slider'
  | 'free';

export interface SignConvention {
  posDirectionX: 'right' | 'left';
  posDirectionY: 'up' | 'down';
  posMoment: 'counterclockwise' | 'clockwise';
}

export interface UniversalPhysicalObject {
  id: string;
  name: string;
  type: PhysicalObjectType;
  posX: number;
  posY: number;
  length?: number;
  width?: number;
  height?: number;
  angleDeg?: number;
  mass?: number;
  material?: string;
  eGpa?: number;
  iCm4?: number;
  muS?: number;
  muK?: number;
  selected?: boolean;
}

export interface UniversalLoad {
  id: string;
  name: string;
  type: LoadType;
  magnitude: number;
  unit: string;
  angleDeg: number;
  posX: number;
  posY: number;
  spanEndPos?: number; // for UDL
  referenceObjectId?: string;
  isReaction?: boolean;
}

export interface UniversalSupport {
  id: string;
  name: string;
  type: SupportType;
  posX: number;
  posY: number;
  referenceObjectId?: string;
  resistsFx: boolean;
  resistsFy: boolean;
  resistsMoment: boolean;
}

export interface UniversalModel {
  id: string;
  title: string;
  topicId: string;
  objects: UniversalPhysicalObject[];
  loads: UniversalLoad[];
  supports: UniversalSupport[];
  parameters: Record<string, number>;
  signConvention: SignConvention;
}

export interface EngineeringState {
  model: UniversalModel;
  solvedTopicId: string;
  computedData: Record<string, any>;
  steps: CalculationStep[];
  validations: ValidationFlag[];
  interpretation: string;
  isEquilibrium: boolean;
  isSolved: boolean;
  timestamp: number;
}

export interface DependencyNode {
  id: string;
  label: string;
  category: 'input' | 'intermediate' | 'output';
  value: string;
  unit: string;
  dependsOn: string[];
  equation?: string;
  description: string;
}

export interface GuidedExperimentStep {
  stepNumber: number;
  instruction: string;
  targetParameter: string;
  suggestedValue: number;
  observationPrompt: string;
  expectedOutcome: string;
}

export interface GuidedExperiment {
  id: string;
  title: string;
  topicId: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  question: string;
  overview: string;
  initialParams: Record<string, number>;
  steps: GuidedExperimentStep[];
  conceptTakeaway: string;
  realWorldContext: string;
}

export interface RealWorldSystem {
  id: string;
  title: string;
  domain: 'Civil / Structural' | 'Mechanical / Automotive' | 'Aerospace & Industrial';
  imageTag: string;
  description: string;
  topicId: string;
  defaultParams: Record<string, number>;
  keyEngineeringMetric: string;
  typicalFailureMode: string;
  codeStandard: string;
}

export interface ExamChallenge {
  id: string;
  title: string;
  topicId: string;
  difficulty: 'Fundamentals' | 'Diploma / GATE' | 'FE / PE Professional';
  timeLimitSec: number;
  problemStatement: string;
  givenParameters: Record<string, number>;
  questionPrompt: string;
  targetVariableKey: string;
  correctAnswer: number;
  tolerancePercent: number;
  unit: string;
  hint: string;
  stepByStepSolution: string[];
}
