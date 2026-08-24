/**
 * EVLab Fluid Mechanics Virtual Lab - Global TypeScript Types
 */

export type UnitSystem = 'SI' | 'Metric' | 'US';

export interface FluidProperty {
  id: string;
  name: string;
  chemicalFormula?: string;
  temperature: number; // in Celsius
  density: number; // kg/m^3
  dynamicViscosity: number; // Pa.s or N.s/m^2
  kinematicViscosity: number; // m^2/s
  specificWeight: number; // N/m^3
  specificGravity: number; // dimensionless relative to water at 4°C (1000 kg/m^3)
  vaporPressure: number; // Pa abs
  bulkModulus: number; // Pa (or GPa)
  surfaceTension: number; // N/m
  isCustom?: boolean;
}

export interface PipeMaterial {
  id: string;
  name: string;
  roughness_mm: number; // absolute roughness in mm (epsilon)
  roughness_ft: number;
  category: 'plastic' | 'metal' | 'concrete' | 'commercial';
  description: string;
}

export interface PipeFitting {
  id: string;
  name: string;
  category: 'valve' | 'elbow' | 'tee' | 'entrance' | 'exit' | 'transition';
  K: number; // Minor loss coefficient K
  equivalentLengthRatio_Le_D?: number;
  description: string;
}

export interface CalculationTrace {
  id: string; // e.g. "FM-CON-001"
  name: string;
  formula: string;
  latex?: string;
  inputs: Record<string, { value: number; unit: string; symbol: string; label: string }>;
  substitution: string;
  result: { value: number; unit: string; symbol: string; label: string };
  assumptions: string[];
  applicableRange: string;
  warnings?: string[];
  reference: string;
}

export type LabTopicId =
  | 'continuity'
  | 'bernoulli'
  | 'reynolds'
  | 'pipe-flow'
  | 'pipe-roughness'
  | 'minor-loss'
  | 'venturi'
  | 'orifice'
  | 'weir'
  | 'open-channel'
  | 'froude'
  | 'hydraulic-jump'
  | 'pumps'
  | 'pump-curves'
  | 'pipe-network';

export type FlowRegime = 'laminar' | 'transitional' | 'turbulent';
export type OpenChannelRegime = 'subcritical' | 'critical' | 'supercritical';

export interface Particle2D {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  pathId?: number;
  offsetY?: number;
}

export interface StreamlinePoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pressure: number;
  hgl: number;
  egl: number;
}

export interface SimulationControls {
  isPlaying: boolean;
  speed: number; // 0.25 to 3.0x
  showVectors: boolean;
  showStreamlines: boolean;
  showPressureColor: boolean;
  showHglEgl: boolean;
  showGrid: boolean;
  showDimensions: boolean;
  particleDensity: 'low' | 'medium' | 'high';
  viewMode: '2D' | '3D';
  cutaway3D: boolean;
  tracerMode: boolean;
}

export interface PumpCurvePoint {
  Q: number; // m^3/s
  H: number; // m
  efficiency: number; // %
  power: number; // kW
}

export interface SavedExperiment {
  id: string;
  name: string;
  labId: LabTopicId;
  createdAt: string;
  updatedAt: string;
  fluid: FluidProperty;
  unitSystem: UnitSystem;
  parameters: Record<string, any>;
  notes?: string;
}

export interface EngineeringReport {
  projectName: string;
  author: string;
  date: string;
  labTitle: string;
  labId: LabTopicId;
  fluid: FluidProperty;
  unitSystem: UnitSystem;
  parameters: Record<string, any>;
  calculations: CalculationTrace[];
  summaryResults: Record<string, { value: number | string; unit: string; label: string }>;
  assumptions: string[];
  warnings: string[];
  physicalInterpretation: string;
  engineeringTakeaways: string[];
}
