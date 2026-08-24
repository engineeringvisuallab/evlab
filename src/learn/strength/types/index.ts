export type UnitSystem = 'SI' | 'US';

export type LabMode = 'learn' | 'calculate' | 'simulate' | 'understand';

export type VisualMode = 
  | 'normal' 
  | 'stress' 
  | 'strain' 
  | 'deformation' 
  | 'force' 
  | 'section' 
  | 'diagram' 
  | 'data';

export type TopicId =
  | 'axial_stress'
  | 'axial_deformation'
  | 'hookes_law'
  | 'stress_strain_lab'
  | 'shear_stress'
  | 'torsion'
  | 'beam_bending'
  | 'flexural_stress'
  | 'beam_shear_stress'
  | 'beam_deflection'
  | 'neutral_axis'
  | 'principal_stress'
  | 'mohrs_circle'
  | 'columns_buckling'
  | 'combined_loading'
  | 'failure_safety'
  | 'what_if_lab'
  | 'comparison_lab'
  | 'educational_lab';

export interface TopicMeta {
  id: TopicId;
  title: string;
  category: 'Fundamentals' | 'Torsion & Shear' | 'Beams & Flexure' | 'Stress Transformation' | 'Stability & Failure' | 'Special Labs';
  subtitle: string;
  governingFormula: string;
  keyConcepts: string[];
  description: string;
  iconName: string;
}

export interface Material {
  id: string;
  name: string;
  category: 'Ferrous Metals' | 'Non-Ferrous Metals' | 'Polymers' | 'Timber' | 'Concrete / Ceramic' | 'Alloys' | 'Custom';
  density: number; // kg/m3
  E: number; // Young's Modulus in GPa
  G: number; // Shear Modulus in GPa
  nu: number; // Poisson's ratio
  yieldStrength: number; // MPa
  ultimateStrength: number; // MPa
  compressiveStrength?: number; // MPa
  shearStrength: number; // MPa
  thermalExpansion: number; // 1e-6 / K
  isDuctile: boolean;
  fractureStrain: number; // e.g. 0.25 (25%)
  color: string;
  source: string;
}

export type SectionType = 
  | 'rectangle' 
  | 'square' 
  | 'circle' 
  | 'hollow_circle' 
  | 'i_beam' 
  | 't_section' 
  | 'channel' 
  | 'box' 
  | 'triangle'
  | 'angle_l';

export interface SectionDimensions {
  width?: number; // mm
  height?: number; // mm
  diameter?: number; // mm
  innerDiameter?: number; // mm
  flangeWidth?: number; // mm
  flangeThickness?: number; // mm
  webThickness?: number; // mm
  thickness?: number; // mm
  base?: number; // mm
}

export interface SectionProperties {
  id?: string;
  type: SectionType;
  name: string;
  d?: number; // depth alias
  dimensions: SectionDimensions;
  area: number; // mm2
  centroidY: number; // mm from bottom
  Ix: number; // mm4 (Moment of Inertia x-axis)
  Iy: number; // mm4 (Moment of Inertia y-axis)
  J: number; // mm4 (Polar Moment of Inertia)
  Zx: number; // mm3 (Elastic Section Modulus x)
  Zy: number; // mm3 (Elastic Section Modulus y)
  rx: number; // mm (Radius of gyration x)
  ry: number; // mm (Radius of gyration y)
  Qmax: number; // mm3 (First moment of area at neutral axis)
  bAtNA: number; // mm (Width of section at neutral axis for shear stress)
}

export interface TopicTheory {
  concept: string;
  governingTheory: string;
  derivation: string;
  assumptions: string[];
  practicalApplications: string[];
  commonMistakes: string[];
}

export interface TopicData extends TopicMeta {
  standardRef: string;
  theory: TopicTheory;
}

export interface CalculationState {
  axialLoadKN: number;
  axialLengthM: number;
  axial: any;
  beamSpanLengthM: number;
  beamSupportType: 'simply_supported' | 'cantilever' | 'fixed_fixed';
  beamPointLoads: PointLoad[];
  beamUDL: number;
  beam: any;
  torsionTorqueKNm: number;
  torsionLengthM: number;
  torsion: any;
  mohrSigmaX: number;
  mohrSigmaY: number;
  mohrTauXY: number;
  mohrRotationDeg: number;
  mohr: any;
  columnLengthM: number;
  columnAxialLoadKN: number;
  columnEndCondition: ColumnEndCondition;
  buckling: any;
}

export type BeamSupportType = 'simply_supported' | 'cantilever' | 'fixed_fixed' | 'propped_cantilever' | 'overhanging';

export interface PointLoad {
  id: string;
  position: number; // m from left
  magnitude: number; // kN (positive = downwards)
}

export interface DistributedLoad {
  id: string;
  startPos: number; // m
  endPos: number; // m
  startMagnitude: number; // kN/m
  endMagnitude: number; // kN/m (same for UDL, different for UVL)
}

export interface AppliedMoment {
  id: string;
  position: number; // m
  magnitude: number; // kN*m (positive = clockwise)
}

export type ColumnEndCondition = 'pin_pin' | 'fixed_fixed' | 'fixed_free' | 'fixed_pin';

export interface CalculationTrace {
  calcId: string;
  topic: string;
  title: string;
  timestamp: string;
  inputs: {
    symbol: string;
    name: string;
    value: number | string;
    unit: string;
  }[];
  formulaName: string;
  formulaLatex: string;
  substitution: string;
  result: {
    symbol: string;
    value: number;
    formatted: string;
    unit: string;
  };
  assumptions: string[];
  materialUsed: string;
  engineeringInterpretation: string;
  warning?: string;
  reference: string;
}

export interface SavedExperiment {
  id: string;
  title: string;
  date: string;
  topicId: TopicId;
  material: Material;
  section: SectionProperties;
  inputs: Record<string, any>;
  results: Record<string, any>;
  notes: string;
  safetyFactor: number;
  failureStatus: 'safe' | 'warning' | 'yield' | 'failure';
}

export interface QuizQuestion {
  id: string;
  question: string;
  scenario?: string;
  givenData?: Record<string, string>;
  options: string[];
  correctIndex: number;
  explanation: string;
  formulaHint: string;
}
