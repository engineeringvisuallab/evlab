export type UnitSystem = 'SI' | 'Imperial';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';

export type MainCategory = 
  | 'Statics'
  | 'Dynamics'
  | 'Rigid Body Mechanics'
  | 'Engineering Systems'
  | 'Structural Mechanics';

export interface UnitDefinition {
  symbol: string;
  name: string;
  factorToSI: number;
  type: 'force' | 'length' | 'mass' | 'time' | 'angle' | 'velocity' | 'acceleration' | 'moment' | 'energy' | 'power';
}

export interface ParameterConfig {
  id: string;
  name: string;
  symbol: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  description: string;
  category?: string;
}

export interface Vector2D {
  id?: string;
  name?: string;
  magnitude: number;
  angleDeg: number; // In degrees, standard math convention (0 = +X, 90 = +Y)
  x?: number;
  y?: number;
  originX?: number;
  originY?: number;
  color?: string;
  isReaction?: boolean;
}

export interface CalculationStep {
  stepNumber: number;
  description: string;
  formula: string;
  substitution: string;
  result: string;
  unit: string;
  note?: string;
}

export interface ValidationFlag {
  type: 'valid' | 'warning' | 'error' | 'info';
  message: string;
  parameterId?: string;
  recommendation?: string;
}

export interface TopicDefinition {
  id: string;
  title: string;
  category: MainCategory;
  subcategory: string;
  badge?: string;
  iconName: string;
  summary: string;
  assumptions: string[];
  governingEquations: {
    name: string;
    latex: string;
    description: string;
    terms: { symbol: string; meaning: string; unit: string }[];
  }[];
  realWorldApplications: string[];
  limitations: string[];
  defaultParameters: Record<string, number>;
  parameterConfigs: ParameterConfig[];
  presets: {
    id: string;
    title: string;
    source: string; // e.g. "Hibbeler 14th Ed. Ex 3.2"
    description: string;
    parameters: Record<string, number>;
  }[];
}

export interface PhysicsState {
  time: number;
  isRunning: boolean;
  playbackSpeed: number;
  // Specific properties depending on topic
  data: Record<string, any>;
  calculatedValues: Record<string, { value: number; unit: string; label: string; formatted: string }>;
  steps: CalculationStep[];
  validations: ValidationFlag[];
  equilibriumStatus?: {
    isEquilibrium: boolean;
    sumFx: number;
    sumFy: number;
    sumMoment: number;
    explanation: string;
  };
}

export interface GraphDataPoint {
  x: number;
  y: number;
  label?: string;
  [key: string]: any;
}

export interface GraphSeries {
  id: string;
  name: string;
  color: string;
  unitY: string;
  data: GraphDataPoint[];
}

export interface SensorReading {
  id: string;
  type: 'force' | 'velocity' | 'acceleration' | 'moment' | 'deflection' | 'energy' | 'position';
  label: string;
  value: number;
  unit: string;
  x: number;
  y: number;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  parameters: Record<string, number>;
  calculatedValues: Record<string, number>;
  timestamp: number;
  summary?: string;
}

export interface LabReportData {
  title: string;
  topicId: string;
  topicTitle: string;
  studentName: string;
  date: string;
  objective: string;
  theory: string;
  assumptions: string[];
  parameters: Record<string, { label: string; value: number; unit: string }>;
  calculationResults: Record<string, { label: string; value: number; unit: string; formatted: string }>;
  steps: CalculationStep[];
  observations: string;
  conclusions: string;
  markdownContent?: string;
}
