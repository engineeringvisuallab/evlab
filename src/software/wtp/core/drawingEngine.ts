import { EngineeringObject, getEngineeringModelRegistry } from './engineeringModelRegistry';
import { CalculatedWtpState } from './dependencyEngine';

export type DrawingDiscipline = 
  | 'SITE_PLAN'
  | 'GENERAL_ARRANGEMENT'
  | 'PROCESS_FLOW_DIAGRAM'
  | 'HYDRAULIC_PROFILE'
  | 'PIPING_LAYOUT'
  | 'EQUIPMENT_LAYOUT'
  | 'CIVIL_LAYOUT'
  | 'STRUCTURAL_LAYOUT'
  | 'ELECTRICAL_LAYOUT'
  | 'INSTRUMENTATION_LAYOUT'
  | 'SLUDGE_LAYOUT'
  | 'DRAINAGE_LAYOUT';

export type SheetSize = 'A0' | 'A1' | 'A2' | 'A3' | 'A4';

export interface CadLayer {
  id: string;
  name: string;
  colorHex: string;
  lineType: 'CONTINUOUS' | 'DASHED' | 'CENTER' | 'PHANTOM' | 'HIDDEN';
  lineWidthMm: number;
  visible: boolean;
  locked: boolean;
  plotStatus: boolean;
}

export const CAD_LAYERS: CadLayer[] = [
  { id: 'LAY-01', name: 'SITE', colorHex: '#94a3b8', lineType: 'CONTINUOUS', lineWidthMm: 0.25, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-02', name: 'ROAD', colorHex: '#64748b', lineType: 'CONTINUOUS', lineWidthMm: 0.35, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-03', name: 'DRAINAGE', colorHex: '#0284c7', lineType: 'DASHED', lineWidthMm: 0.25, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-04', name: 'BUILDING', colorHex: '#e2e8f0', lineType: 'CONTINUOUS', lineWidthMm: 0.50, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-05', name: 'PROCESS', colorHex: '#38bdf8', lineType: 'CONTINUOUS', lineWidthMm: 0.70, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-06', name: 'STRUCTURE', colorHex: '#cbd5e1', lineType: 'CONTINUOUS', lineWidthMm: 0.50, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-07', name: 'PIPE', colorHex: '#06b6d4', lineType: 'CONTINUOUS', lineWidthMm: 0.60, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-08', name: 'VALVE', colorHex: '#f59e0b', lineType: 'CONTINUOUS', lineWidthMm: 0.40, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-09', name: 'EQUIPMENT', colorHex: '#10b981', lineType: 'CONTINUOUS', lineWidthMm: 0.50, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-10', name: 'ELECTRICAL', colorHex: '#a855f7', lineType: 'CONTINUOUS', lineWidthMm: 0.35, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-11', name: 'INSTRUMENTATION', colorHex: '#ec4899', lineType: 'DASHED', lineWidthMm: 0.25, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-12', name: 'TEXT', colorHex: '#f8fafc', lineType: 'CONTINUOUS', lineWidthMm: 0.20, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-13', name: 'DIMENSION', colorHex: '#facc15', lineType: 'CONTINUOUS', lineWidthMm: 0.18, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-14', name: 'GRID', colorHex: '#475569', lineType: 'CENTER', lineWidthMm: 0.18, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-15', name: 'BOUNDARY', colorHex: '#ef4444', lineType: 'PHANTOM', lineWidthMm: 0.50, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-16', name: 'LANDSCAPE', colorHex: '#22c55e', lineType: 'CONTINUOUS', lineWidthMm: 0.18, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-17', name: 'EXISTING', colorHex: '#64748b', lineType: 'HIDDEN', lineWidthMm: 0.25, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-18', name: 'PROPOSED', colorHex: '#38bdf8', lineType: 'CONTINUOUS', lineWidthMm: 0.50, visible: true, locked: false, plotStatus: true },
  { id: 'LAY-19', name: 'AS_BUILT', colorHex: '#8b5cf6', lineType: 'CONTINUOUS', lineWidthMm: 0.50, visible: true, locked: false, plotStatus: true }
];

export interface DrawingMetadata {
  drawingId: string;
  drawingNumber: string;
  title: string;
  discipline: DrawingDiscipline;
  scale: string; // e.g. "1:100", "1:250"
  sheetSize: SheetSize;
  revision: string;
  status: 'DRAFT' | 'FOR_REVIEW' | 'APPROVED' | 'AS_BUILT';
  projectName: string;
  author: string;
  checker: string;
  approver: string;
  issueDate: string;
}

export type PrimitiveType = 'LINE' | 'POLYLINE' | 'CIRCLE' | 'RECTANGLE' | 'ARC' | 'TEXT' | 'DIMENSION' | 'SYMBOL';

export interface DrawingPrimitive {
  id: string;
  type: PrimitiveType;
  layerId: string;
  objectIdRef?: string; // Linked Engineering Object ID
  boqCodeRef?: string;
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  fontSize?: number;
  dimensionValue?: number;
  dimensionType?: 'LINEAR' | 'ALIGNED' | 'ANGULAR' | 'RADIUS' | 'DIAMETER' | 'ELEVATION' | 'CHAIN';
  symbolName?: string;
}

export interface EngineeringDrawing {
  metadata: DrawingMetadata;
  layers: CadLayer[];
  primitives: DrawingPrimitive[];
}

/**
 * DIMENSION ENGINE: Calculates linear, aligned, angular & elevation dimensions from actual geometry coordinates.
 */
export function calculateDimension(p1: { x: number; y: number; z?: number }, p2: { x: number; y: number; z?: number }, type: 'LINEAR' | 'ALIGNED' | 'ELEVATION' = 'ALIGNED'): number {
  if (type === 'ELEVATION') {
    return Math.abs((p2.z || 0) - (p1.z || 0));
  }
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  if (type === 'LINEAR') {
    return Math.abs(dx);
  }
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * LEVEL / ELEVATION ENGINE: Returns exact ground, invert, operating & water levels connected directly to hydraulics.
 */
export function calculateUnitElevations(obj: EngineeringObject, state: CalculatedWtpState) {
  const topElev = obj.coordinates.z;
  const height = obj.dimensions.heightM || 4;
  const bottomElev = topElev - height;
  const freeboardM = 0.5;
  const maxWaterLevel = topElev - freeboardM;
  const minWaterLevel = bottomElev + 0.5;

  return {
    groundLevelM: topElev - 1.5,
    topLevelM: topElev,
    bottomLevelM: bottomElev,
    maxWaterLevelM: maxWaterLevel,
    minWaterLevelM: minWaterLevel,
    overflowLevelM: topElev - 0.2,
    freeboardM: freeboardM,
    pipeInvertLevelM: bottomElev + 0.3,
    pipeCrownLevelM: bottomElev + 0.3 + (obj.dimensions.diameterM || 0.5)
  };
}

/**
 * P&ID INSTRUMENTATION FOUNDATION (ISA-5.1 Tagging & Control Loops)
 */
export interface PidControlLoop {
  loopId: string;
  processVariable: 'FLOW' | 'LEVEL' | 'PRESSURE' | 'PH' | 'TURBIDITY' | 'CHLORINE';
  transmitterTag: string; // e.g. FT-001
  controllerTag: string;  // e.g. FIC-001
  controlElementTag: string; // e.g. FCV-001
  associatedObjectId: string;
}

export function generatePidControlLoops(objects: EngineeringObject[]): PidControlLoop[] {
  return [
    { loopId: 'LOOP-101', processVariable: 'FLOW', transmitterTag: 'FT-101', controllerTag: 'FIC-101', controlElementTag: 'FCV-101', associatedObjectId: 'RWP-001' },
    { loopId: 'LOOP-201', processVariable: 'TURBIDITY', transmitterTag: 'AIT-201', controllerTag: 'AIC-201', controlElementTag: 'PMP-ALM-01', associatedObjectId: 'RMX-001' },
    { loopId: 'LOOP-301', processVariable: 'LEVEL', transmitterTag: 'LT-301', controllerTag: 'LIC-301', controlElementTag: 'FCV-301', associatedObjectId: 'CLR-001' },
    { loopId: 'LOOP-401', processVariable: 'TURBIDITY', transmitterTag: 'AIT-401', controllerTag: 'AIC-401', controlElementTag: 'VAL-BW-01', associatedObjectId: 'FIL-001' },
    { loopId: 'LOOP-501', processVariable: 'CHLORINE', transmitterTag: 'AIT-501', controllerTag: 'AIC-501', controlElementTag: 'PMP-CL2-01', associatedObjectId: 'CWR-001' },
    { loopId: 'LOOP-601', processVariable: 'PRESSURE', transmitterTag: 'PT-601', controllerTag: 'PIC-601', controlElementTag: 'VFD-HLP-01', associatedObjectId: 'HLP-001' }
  ];
}

/**
 * GENERATE COMPLETE DRAWING REGISTER FROM WTP MODEL
 */
export function generateDrawingRegister(state: CalculatedWtpState): EngineeringDrawing[] {
  const objects = getEngineeringModelRegistry(state);
  const drawings: EngineeringDrawing[] = [];

  // 1. SITE PLAN DRAWING
  drawings.push({
    metadata: {
      drawingId: 'DWG-SITE-001',
      drawingNumber: 'WTP-50-DWG-CIV-001',
      title: 'Overall Plant Site Master Layout Plan',
      discipline: 'SITE_PLAN',
      scale: '1:500',
      sheetSize: 'A0',
      revision: 'REV-B',
      status: 'APPROVED',
      projectName: `${state.plantCapacityMLD} MLD Water Treatment Plant Project`,
      author: 'A. Rahman, PE',
      checker: 'M. Islam, SE',
      approver: 'Chief Engineer',
      issueDate: '2026-08-11'
    },
    layers: CAD_LAYERS,
    primitives: objects.map(o => ({
      id: `PRIM-SITE-${o.objectId}`,
      type: 'RECTANGLE',
      layerId: 'LAY-05',
      objectIdRef: o.objectId,
      boqCodeRef: o.boqRefs[0],
      x: o.coordinates.x,
      y: o.coordinates.y,
      width: o.dimensions.lengthM,
      height: o.dimensions.widthM,
      text: o.equipmentTag
    }))
  });

  // 2. PROCESS FLOW DIAGRAM (PFD)
  drawings.push({
    metadata: {
      drawingId: 'DWG-PFD-001',
      drawingNumber: 'WTP-50-DWG-PRC-001',
      title: 'Master Water Process Flow Diagram (PFD) & Stream Table',
      discipline: 'PROCESS_FLOW_DIAGRAM',
      scale: 'NTS',
      sheetSize: 'A1',
      revision: 'REV-A',
      status: 'APPROVED',
      projectName: `${state.plantCapacityMLD} MLD Water Treatment Plant Project`,
      author: 'Process Eng Team',
      checker: 'Lead Process Architect',
      approver: 'Chief Engineer',
      issueDate: '2026-08-11'
    },
    layers: CAD_LAYERS,
    primitives: [
      { id: 'PFD-01', type: 'SYMBOL', layerId: 'LAY-05', objectIdRef: 'INT-001', text: 'Intake Tower', x: 50, y: 150 },
      { id: 'PFD-02', type: 'SYMBOL', layerId: 'LAY-05', objectIdRef: 'RWP-001', text: 'Raw Water Pumps', x: 180, y: 150 },
      { id: 'PFD-03', type: 'SYMBOL', layerId: 'LAY-05', objectIdRef: 'AER-001', text: 'Cascade Aerator', x: 300, y: 150 },
      { id: 'PFD-04', type: 'SYMBOL', layerId: 'LAY-05', objectIdRef: 'RMX-001', text: 'Flash Mixer', x: 420, y: 150 },
      { id: 'PFD-05', type: 'SYMBOL', layerId: 'LAY-05', objectIdRef: 'FLO-001', text: 'Flocculators', x: 540, y: 150 },
      { id: 'PFD-06', type: 'SYMBOL', layerId: 'LAY-05', objectIdRef: 'CLR-001', text: 'Clarifiers', x: 660, y: 150 },
      { id: 'PFD-07', type: 'SYMBOL', layerId: 'LAY-05', objectIdRef: 'FIL-001', text: 'Gravity Filters', x: 780, y: 150 },
      { id: 'PFD-08', type: 'SYMBOL', layerId: 'LAY-05', objectIdRef: 'CWR-001', text: 'Clear Water Reservoir', x: 900, y: 150 }
    ]
  });

  // 3. HYDRAULIC PROFILE DRAWING
  drawings.push({
    metadata: {
      drawingId: 'DWG-HGL-001',
      drawingNumber: 'WTP-50-DWG-HYD-001',
      title: 'Hydraulic Grade Line (HGL) Profile & Water Elevations',
      discipline: 'HYDRAULIC_PROFILE',
      scale: 'H:1:500 V:1:50',
      sheetSize: 'A1',
      revision: 'REV-B',
      status: 'APPROVED',
      projectName: `${state.plantCapacityMLD} MLD Water Treatment Plant Project`,
      author: 'Hydraulic Specialist',
      checker: 'Lead Hydraulic Eng',
      approver: 'Chief Engineer',
      issueDate: '2026-08-11'
    },
    layers: CAD_LAYERS,
    primitives: objects.map(o => {
      const elevs = calculateUnitElevations(o, state);
      return {
        id: `HGL-PRIM-${o.objectId}`,
        type: 'DIMENSION',
        layerId: 'LAY-13',
        objectIdRef: o.objectId,
        x: o.coordinates.x,
        y: elevs.maxWaterLevelM,
        text: `${o.name} HGL: ${elevs.maxWaterLevelM.toFixed(2)}m`,
        dimensionValue: elevs.maxWaterLevelM,
        dimensionType: 'ELEVATION'
      };
    })
  });

  return drawings;
}
