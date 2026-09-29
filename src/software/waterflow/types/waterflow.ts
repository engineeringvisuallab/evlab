/**
 * EVLab WaterFlow - Core TypeScript Type Definitions
 * Professional Water Distribution Network Modeling & Engineering Platform
 */

export type ElementType = 'junction' | 'reservoir' | 'tank' | 'pipe' | 'pump' | 'valve' | 'annotation';

export type UnitSystem = 'SI' | 'US';

export type FlowUnit = 
  | 'LPS'  // Liters per second
  | 'LPM'  // Liters per minute
  | 'MLD'  // Million liters per day
  | 'CMS'  // Cubic meters per second
  | 'CMH'  // Cubic meters per hour
  | 'GPM'  // Gallons per minute
  | 'MGD'  // Million gallons per day
  | 'CFS'; // Cubic feet per second

export type HeadlossFormula = 'Hazen-Williams' | 'Darcy-Weisbach' | 'Chezy-Manning';

export type PipeMaterial = 'Ductile Iron' | 'Cast Iron' | 'PVC' | 'HDPE' | 'Steel' | 'Concrete' | 'Asbestos Cement' | 'Custom';

export type ValveType = 'PRV' | 'PSV' | 'FCV' | 'PBV' | 'TCV' | 'GPV'; // Pressure Reducing, Sustaining, Flow Control, etc.

export type PumpCurveType = 'POWER_LAW' | 'DESIGN_POINT' | 'MULTI_POINT';

export type LinkStatus = 'OPEN' | 'CLOSED' | 'CV'; // CV = Check Valve

export type ValveStatus = 'ACTIVE' | 'OPEN' | 'CLOSED';

export type ToolMode = 
  | 'select' 
  | 'pan' 
  | 'junction' 
  | 'reservoir' 
  | 'tank' 
  | 'pipe' 
  | 'pump' 
  | 'valve' 
  | 'cad_line'
  | 'cad_rect'
  | 'cad_circle'
  | 'cad_text'
  | 'measure'
  | 'profile_select';

export type ResultTheme = 
  | 'none'
  | 'pressure'
  | 'head'
  | 'demand'
  | 'elevation'
  | 'flow'
  | 'velocity'
  | 'headloss'
  | 'headloss_gradient'
  | 'roughness'
  | 'diameter';

// Base Network Node
export interface BaseNode {
  id: string;
  label: string;
  x: number; // canvas X or easting
  y: number; // canvas Y or northing
  elevation: number; // meters
  zone?: string;
  description?: string;
  notes?: string;
}

export interface Junction extends BaseNode {
  type: 'junction';
  baseDemand: number; // L/s in SI
  demandPatternId?: string;
  demandCategory?: string;
  // Calculated hydraulics
  actualDemand?: number; // L/s
  pressure?: number; // kPa or m H2O
  hydraulicGrade?: number; // meters
  totalHead?: number; // meters
}

export interface Reservoir extends BaseNode {
  type: 'reservoir';
  totalHead: number; // meters
  headPatternId?: string;
  hydraulicGrade?: number;
  pressure?: number;
  // Calculated
  netInflow?: number; // L/s
}

export interface Tank extends BaseNode {
  type: 'tank';
  minLevel: number; // m above elevation
  initLevel: number; // m above elevation
  maxLevel: number; // m above elevation
  diameter: number; // m
  totalHead?: number;
  minVolume?: number; // m3
  curveId?: string;
  // Calculated
  currentLevel?: number; // m
  currentVolume?: number; // m3
  pressure?: number; // kPa
  netInflow?: number; // L/s
  hydraulicGrade?: number; // m
}

export function getNodesList(nodes: Map<string, NetworkNode> | Record<string, NetworkNode>): NetworkNode[] {
  if (nodes instanceof Map) {
    return Array.from(nodes.values());
  }
  return Object.values(nodes || {});
}

export function getLinksList(links: Map<string, NetworkLink> | Record<string, NetworkLink>): NetworkLink[] {
  if (links instanceof Map) {
    return Array.from(links.values());
  }
  return Object.values(links || {});
}

export type NetworkNode = Junction | Reservoir | Tank;

// Base Network Link
export interface BaseLink {
  id: string;
  label: string;
  startNodeId: string;
  endNodeId: string;
  description?: string;
  notes?: string;
}

export interface Pipe extends BaseLink {
  type: 'pipe';
  length: number; // m
  diameter: number; // mm
  material: PipeMaterial;
  roughness: number; // C coefficient (e.g. 130) or roughness height e (mm)
  minorLoss: number; // K coefficient
  status: LinkStatus;
  // Calculated results
  flow?: number; // L/s (positive = start -> end, negative = end -> start)
  velocity?: number; // m/s
  headloss?: number; // m
  headlossGradient?: number; // m/km
  reynoldsNumber?: number;
  frictionFactor?: number;
}

export interface PumpCurvePoint {
  flow: number; // L/s
  head: number; // m
}

export interface Pump extends BaseLink {
  type: 'pump';
  curveType: PumpCurveType;
  designFlow: number; // L/s
  designHead: number; // m
  shutoffHead?: number; // m
  maxFlow?: number; // L/s
  curvePoints?: PumpCurvePoint[];
  speed: number; // percentage, e.g. 100%
  status: 'ON' | 'OFF';
  efficiency: number; // % e.g. 75%
  // Calculated results
  flow?: number; // L/s
  headGain?: number; // m
  powerConsumption?: number; // kW
}

export interface Valve extends BaseLink {
  type: 'valve';
  valveType: ValveType;
  setting: number; // pressure setting in kPa/m or flow setting in L/s
  status: ValveStatus;
  minorLoss: number;
  // Calculated results
  flow?: number; // L/s
  velocity?: number; // m/s
  headloss?: number; // m
}

export type NetworkLink = Pipe | Pump | Valve;

export type NetworkElement = NetworkNode | NetworkLink;

// CAD Annotation
export interface CADAnnotation {
  id: string;
  type: 'cad_line' | 'cad_rect' | 'cad_circle' | 'cad_text';
  layer: string;
  color: string;
  lineWidth: number;
  points: { x: number; y: number }[];
  text?: string;
  fontSize?: number;
}

// Demand Pattern (24 hours)
export interface DemandPattern {
  id: string;
  name: string;
  multipliers: number[]; // 24 hourly multipliers
}

// GIS & Background Layers
export interface GISLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  type: 'geojson' | 'raster' | 'osm';
  geoJsonData?: any;
  rasterUrl?: string;
  bounds?: [number, number, number, number]; // west, south, east, north
}

// Scenarios
export interface Scenario {
  id: string;
  name: string;
  description: string;
  parentScenarioId?: string;
  demandMultiplier: number;
  overrides: {
    nodeDemands?: Record<string, number>;
    nodeElevations?: Record<string, number>;
    pipeStatus?: Record<string, LinkStatus>;
    pipeRoughness?: Record<string, number>;
    pumpStatus?: Record<string, 'ON' | 'OFF'>;
    valveSetting?: Record<string, number>;
  };
}

// Network Model Container
export interface NetworkModel {
  id: string;
  title: string;
  client?: string;
  engineer?: string;
  projectNumber?: string;
  location?: string;
  nodes: Map<string, NetworkNode> | Record<string, NetworkNode>;
  links: Map<string, NetworkLink> | Record<string, NetworkLink>;
  patterns: DemandPattern[];
  cadAnnotations: CADAnnotation[];
  gisLayers: GISLayer[];
  scenarios: Scenario[];
  activeScenarioId: string;
}

// Simulation Settings
export interface SimulationSettings {
  unitSystem: UnitSystem;
  flowUnit: FlowUnit;
  headlossFormula: HeadlossFormula;
  specificGravity: number;
  kinematicViscosity: number; // cSt or m2/s
  maxIterations: number;
  accuracyTolerance: number; // e.g. 0.0001 m
  unbalanced: 'STOP' | 'CONTINUE' | 'CONTINUE_MAX';
  // EPS Settings
  isEPS: boolean;
  durationHours: number; // e.g. 24
  hydraulicStepMinutes: number; // e.g. 60
  patternStepMinutes: number; // e.g. 60
  startHour: number; // e.g. 0
}

// Simulation Diagnostic Output
export interface SimulationDiagnostics {
  converged: boolean;
  iterations: number;
  maxResidual: number;
  totalSystemDemand: number; // L/s
  totalSystemSupply: number; // L/s
  totalFrictionLosses: number; // m
  pumpEnergyKW: number;
  logMessages: { type: 'info' | 'warning' | 'error'; message: string; timestamp: string }[];
  timeStepResults?: Map<number, { nodes: Record<string, any>; links: Record<string, any> }>;
}

// Validation Message
export interface ValidationIssue {
  id: string;
  elementId?: string;
  elementType?: ElementType;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  category: 'Topology' | 'Hydraulics' | 'Data' | 'Settings';
  message: string;
  recommendation?: string;
}
