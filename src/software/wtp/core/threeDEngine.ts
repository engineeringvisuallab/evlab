import { EngineeringObject, getEngineeringModelRegistry } from './engineeringModelRegistry';
import { CalculatedWtpState } from './dependencyEngine';

export type VisualizationMode = 
  | 'ENGINEERING'
  | 'PROCESS'
  | 'HYDRAULIC'
  | 'EQUIPMENT'
  | 'CONSTRUCTION'
  | 'PROCUREMENT'
  | 'QAQC'
  | 'AS_BUILT';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox3D {
  min: Vector3D;
  max: Vector3D;
  center: Vector3D;
  size: Vector3D;
}

export interface Mesh3D {
  meshId: string;
  associatedObjectId: string;
  geometryType: 'BOX' | 'CYLINDER' | 'SPHERE' | 'PIPE' | 'BUILDING' | 'CUSTOM';
  position: Vector3D;
  rotation: Vector3D;
  scale: Vector3D;
  dimensions: {
    lengthM: number;
    widthM: number;
    heightM: number;
    radiusM?: number;
    wallThicknessM?: number;
  };
  materialColorHex: string;
  opacity: number;
  wireframe: boolean;
  boundingBox: BoundingBox3D;
  label: string;
}

export interface ThreeDScene {
  capacityMLD: number;
  meshes: Mesh3D[];
  activeVisualizationMode: VisualizationMode;
  clippingPlanes: {
    xClipEnabled: boolean;
    xClipVal: number;
    yClipEnabled: boolean;
    yClipVal: number;
    zClipEnabled: boolean;
    zClipVal: number;
  };
}

/**
 * 3D MEASUREMENT ENGINE: Calculates exact 3D spatial distances, areas, and volumes between model nodes.
 */
export function calculate3DDistance(p1: Vector3D, p2: Vector3D) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = p2.z - p1.z;
  const direct3DDistanceM = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const horizontalDistanceM = Math.sqrt(dx * dx + dy * dy);
  const verticalDistanceM = Math.abs(dz);

  return {
    direct3DDistanceM,
    horizontalDistanceM,
    verticalDistanceM,
    elevationDifferenceM: dz
  };
}

/**
 * COLOR MATRIX GENERATOR FOR 3D VISUALIZATION MODES
 */
export function getObjectColorForMode(obj: EngineeringObject, mode: VisualizationMode): string {
  switch (mode) {
    case 'PROCESS':
      if (obj.processRelationship.processStage.includes('INTAKE') || obj.processRelationship.processStage.includes('PUMPING')) return '#38bdf8'; // Cyan
      if (obj.processRelationship.processStage.includes('AERATION') || obj.processRelationship.processStage.includes('COAGULATION')) return '#a855f7'; // Purple
      if (obj.processRelationship.processStage.includes('FLOCCULATION') || obj.processRelationship.processStage.includes('CLARIFICATION')) return '#f59e0b'; // Amber
      if (obj.processRelationship.processStage.includes('FILTRATION')) return '#06b6d4'; // Light cyan
      if (obj.processRelationship.processStage.includes('DISINFECTION') || obj.processRelationship.processStage.includes('STORAGE')) return '#10b981'; // Green
      return '#94a3b8';

    case 'HYDRAULIC':
      const z = obj.coordinates.z;
      if (z > 15) return '#ef4444'; // High elevation / Red
      if (z > 12) return '#f59e0b'; // Mid elevation / Amber
      return '#3b82f6'; // Low elevation / Blue

    case 'EQUIPMENT':
      if (obj.type.includes('PUMP')) return '#10b981'; // Green pumps
      if (obj.type === 'PIPE' || obj.type === 'VALVE') return '#06b6d4';
      if (obj.type === 'CHEMICAL_BLDG' || obj.type === 'ELECTRICAL_BLDG') return '#a855f7';
      return '#64748b';

    case 'CONSTRUCTION':
      if (obj.objectId === 'INT-001' || obj.objectId === 'RWP-001') return '#22c55e'; // Completed
      if (obj.objectId === 'AER-001' || obj.objectId === 'RMX-001') return '#f59e0b'; // In Progress
      return '#ef4444'; // Planned / Not started

    case 'PROCUREMENT':
      if (obj.procurementRefs.length > 0) return '#06b6d4'; // Ordered / Delivered
      return '#f97316'; // Pending

    case 'QAQC':
      if (obj.qaqcRefs.length > 0) return '#10b981'; // Approved ITP
      return '#eab308'; // Inspection Pending

    case 'AS_BUILT':
      if (obj.asBuiltData && obj.asBuiltData.length > 0) return '#8b5cf6'; // Verified As-Built
      return '#64748b'; // As Designed

    case 'ENGINEERING':
    default:
      if (obj.type === 'PIPE') return '#06b6d4';
      if (obj.type.includes('PUMP')) return '#10b981';
      if (obj.type === 'CLARIFIER' || obj.type === 'FILTER') return '#0284c7';
      if (obj.type === 'CWR') return '#0f172a';
      return '#64748b';
  }
}

/**
 * GENERATE 3D DIGITAL TWIN SCENE FROM ENGINEERING MODEL REGISTRY
 */
export function generate3DDigitalTwinScene(state: CalculatedWtpState, mode: VisualizationMode = 'ENGINEERING'): ThreeDScene {
  const objects = getEngineeringModelRegistry(state);
  const meshes: Mesh3D[] = objects.map(o => {
    const isCylinder = o.dimensions.diameterM !== undefined;
    const geometryType = isCylinder ? 'CYLINDER' : o.type === 'PIPE' ? 'PIPE' : o.type.includes('BLDG') ? 'BUILDING' : 'BOX';
    const color = getObjectColorForMode(o, mode);

    const length = o.dimensions.lengthM || 10;
    const width = o.dimensions.widthM || 10;
    const height = o.dimensions.heightM || 5;

    const minPos: Vector3D = { x: o.coordinates.x - length / 2, y: o.coordinates.y - width / 2, z: o.coordinates.z - height / 2 };
    const maxPos: Vector3D = { x: o.coordinates.x + length / 2, y: o.coordinates.y + width / 2, z: o.coordinates.z + height / 2 };

    return {
      meshId: `MESH-3D-${o.objectId}`,
      associatedObjectId: o.objectId,
      geometryType,
      position: { x: o.coordinates.x, y: o.coordinates.y, z: o.coordinates.z },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      dimensions: {
        lengthM: length,
        widthM: width,
        heightM: height,
        radiusM: o.dimensions.diameterM ? o.dimensions.diameterM / 2 : undefined,
        wallThicknessM: o.dimensions.wallThicknessM
      },
      materialColorHex: color,
      opacity: o.type === 'CWR' ? 0.85 : 1.0,
      wireframe: false,
      boundingBox: {
        min: minPos,
        max: maxPos,
        center: { x: o.coordinates.x, y: o.coordinates.y, z: o.coordinates.z },
        size: { x: length, y: width, z: height }
      },
      label: `[ENGINEERING REPRESENTATION] ${o.equipmentTag} - ${o.name}`
    };
  });

  return {
    capacityMLD: state.plantCapacityMLD || 50,
    meshes,
    activeVisualizationMode: mode,
    clippingPlanes: {
      xClipEnabled: false,
      xClipVal: 500,
      yClipEnabled: false,
      yClipVal: 500,
      zClipEnabled: false,
      zClipVal: 100
    }
  };
}
